const Employee = require('../models/Employee');
const Settings = require('../models/Settings');
const Attendance = require('../models/Attendance');
const axios = require('axios');
// Zaroori: Multer ko yahan require karna hoga agar niche storage use kar rahe ho
const multer = require('multer');


exports.getDailyAttendance = async (req, res) => {
    try {
        const { date } = req.query; // e.g., 2026-03-24
        const employees = await Employee.find();
        
        // 1. Machine API se data fetch karein
        const machineUrl = `http://3.111.38.27/bio.php?APIKey=050914052413&FromDate=${date}&ToDate=${date}&SerialNumber=C2636C37D7282535`;
        const machineRes = await axios.get(machineUrl);
        const machineLogs = machineRes.data;

        // 2. Database se manual entries fetch karein
        const manualLogs = await Attendance.find({ date });

        // 3. Sabko merge karein
        const report = employees.map(emp => {
            // Check if manual entry exists
            const manual = manualLogs.find(m => m.employeeId == emp.employeeId);
            // Check if machine entry exists
            const machine = machineLogs.find(l => String(l.EmployeeCode).trim() == String(emp.employeeId).trim());

            return {
                employeeId: emp.employeeId,
                name: emp.name,
                // Priority: Manual Entry > Machine Entry > Empty
                checkIn: manual?.checkIn || (machine ? machine.LogDate.split(' ')[1] : "--:--"),
                checkOut: manual?.checkOut || (machine ? machine.LogDate.split(' ')[1] : "--:--"),
                status: manual?.status || (machine ? "Present" : "Absent"),
                isManual: !!manual
            };
        });

        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Manual Attendance Save karne ke liye
exports.saveManualAttendance = async (req, res) => {
    try {
        const { employeeId, date, checkIn, checkOut, status } = req.body;
        
        const attendance = await Attendance.findOneAndUpdate(
            { employeeId, date },
            { checkIn, checkOut, status, isManual: true },
            { upsert: true, new: true }
        );

        res.json({ message: "Attendance saved manually", attendance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// 1. Register Employee
exports.registerEmployee = async (req, res) => {
    try {
        const employeeData = { ...req.body };

        // Types fix karein (String to Number)
        // Types fix karein
        if (employeeData.baseSalary) employeeData.baseSalary = Number(employeeData.baseSalary);
        if (employeeData.employeeId) employeeData.employeeId = Number(employeeData.employeeId);
        // Add this line
        if (employeeData.advanceBalance) employeeData.advanceBalance = Number(employeeData.advanceBalance);

        // Files paths save karein
        if (req.files) {
            if (req.files.profilePhoto) employeeData.profilePhoto = req.files.profilePhoto[0].path;
            if (req.files.aadharFront) employeeData.aadharFront = req.files.aadharFront[0].path;
            if (req.files.aadharBack) employeeData.aadharBack = req.files.aadharBack[0].path;
        }

        const newEmp = new Employee(employeeData);
        await newEmp.save();
        res.status(201).json(newEmp);
    } catch (err) {
        console.error("❌ Register Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// 2. Update Employee
exports.updateEmployee = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.baseSalary) updateData.baseSalary = Number(updateData.baseSalary);
        // Add this line
        if (updateData.advanceBalance) updateData.advanceBalance = Number(updateData.advanceBalance);
        if (req.files) {
            if (req.files.profilePhoto) updateData.profilePhoto = req.files.profilePhoto[0].path;
            if (req.files.aadharFront) updateData.aadharFront = req.files.aadharFront[0].path;
            if (req.files.aadharBack) updateData.aadharBack = req.files.aadharBack[0].path;
        }

        const updatedEmp = await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ message: "Updated successfully", updatedEmp });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Get All Employees
exports.getAllEmployees = async (req, res) => {
    try {
        const emps = await Employee.find();
        res.json(emps);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. Delete Employee
exports.deleteEmployee = async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted Successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.calculateSalary = async (req, res) => {
    try {
        const { empId, month, year } = req.query;
        const employee = await Employee.findOne({ employeeId: empId });
        if (!employee) return res.status(404).json({ message: "Staff not found" });

        const config = await Settings.findOne() || { halfDayThresholdHours: 4, halfDayPayFactor: 0.5 };

        // 1. Machine API data fetch karein
        const firstDay = `${year}-${month}-01`;
        const lastDayCount = new Date(year, month, 0).getDate();
        const endDate = `${year}-${month}-${lastDayCount}`;
        const machineUrl = `http://3.111.38.27/bio.php?APIKey=050914052413&FromDate=${firstDay}&ToDate=${endDate}&SerialNumber=C2636C37D7282535`;
        
        const machineRes = await axios.get(machineUrl);
        const machineLogs = machineRes.data.filter(l => String(l.EmployeeCode).trim() === String(empId).trim());

        // 2. Database se Manual Attendance fetch karein (Is month ki)
        const manualAttendance = await Attendance.find({
            employeeId: empId,
            date: { $gte: firstDay, $lte: endDate }
        });

        let totalAdjustedDays = 0;
        let presentDates = [];

        // 3. Loop through every day of the month
        for (let d = 1; d <= lastDayCount; d++) {
            const currentDate = `${year}-${month}-${String(d).padStart(2, '0')}`;
            
            // Check priority 1: Manual Record
            const manualRecord = manualAttendance.find(m => m.date === currentDate);
            
            if (manualRecord) {
                if (manualRecord.status === 'Present') totalAdjustedDays += 1;
                else if (manualRecord.status === 'Half-Day') totalAdjustedDays += config.halfDayPayFactor;
                if (manualRecord.status !== 'Absent') presentDates.push(currentDate);
            } 
            else {
                // Check priority 2: Machine Logs
                const dayLogs = machineLogs.filter(l => l.LogDate.startsWith(currentDate))
                                          .sort((a, b) => new Date(a.LogDate) - new Date(b.LogDate));
                
                if (dayLogs.length >= 2) {
                    const hours = (new Date(dayLogs[dayLogs.length-1].LogDate) - new Date(dayLogs[0].LogDate)) / (1000*60*60);
                    if (hours >= 8) totalAdjustedDays += 1;
                    else if (hours >= config.halfDayThresholdHours) totalAdjustedDays += config.halfDayPayFactor;
                    presentDates.push(currentDate);
                }
            }
        }

        const perDaySalary = employee.baseSalary / 30;
        let grossSalary = (perDaySalary * totalAdjustedDays);
        const advanceDeducted = employee.advanceBalance || 0;

        res.json({
            name: employee.name,
            employeeId: employee.employeeId,
            baseSalary: employee.baseSalary,
            calculatedDays: totalAdjustedDays,
            grossSalary: grossSalary.toFixed(2),
            advanceDeducted: advanceDeducted,
            finalSalary: (grossSalary - advanceDeducted).toFixed(2),
            presentDates,
            daysInMonth: lastDayCount
        });

    } catch (err) {
        res.status(500).json({ error: "Salary calculation failed" });
    }
};

exports.updateAdvance = async (req, res) => {
    try {
        const { amount } = req.body;
        const { id } = req.params;

        // 1. Pehle employee ko dhoondein
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // 2. Naya balance calculate karein
        const currentBalance = Number(employee.advanceBalance || 0);
        const adjustment = Number(amount || 0);
        const newBalance = currentBalance - adjustment;

        // 3. Validation bypass karne ke liye findByIdAndUpdate use karein
        // Isse baaki required fields (aadhar, post etc.) ki error nahi aayegi
        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            { $set: { advanceBalance: newBalance } },
            { new: true, runValidators: false } // runValidators: false sabse zaruri hai
        );

        console.log(`✅ Advance Updated: ₹${newBalance}`);
        res.json({ 
            message: "Advance updated successfully", 
            newBalance: updatedEmployee.advanceBalance 
        });

    } catch (err) {
        console.error("❌ Advance Update Error:", err);
        res.status(500).json({ error: "Server Error: " + err.message });
    }
};

// 6. Settings Functions
exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne() || { lateFinePerMinute: 2, overtimePayPerHour: 150 };
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate({}, req.body, { upsert: true, new: true });
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteSettings = async (req, res) => {
    try {
        await Settings.findByIdAndDelete(req.params.id);
        res.json({ message: "Settings deleted successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- Multer Storage (Backup for Route Middleware) ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});