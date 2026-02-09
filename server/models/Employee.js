const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    employeeId: { type: String, unique: true, required: true },
    baseSalary: { type: Number, required: true },
    shiftStart: { type: String, default: "09:00" },
    shiftEnd: { type: String, default: "18:00" },
    
    mobileNo: { type: String, required: true },
    panNo: { type: String, required: true, uppercase: true },
    aadharNo: { type: String, required: true, minlength: 12, maxlength: 12 },
    post: { type: String, required: true }, 
    advanceBalance: { type: Number, default: 0 }, 
    
    profilePhoto: { type: String },
    aadharFront: { type: String },
    aadharBack: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);