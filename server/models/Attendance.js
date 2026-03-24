const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    checkIn: String,
    checkOut: String,
    status: { type: String, enum: ['Present', 'Absent', 'Half-Day', 'Leave'], default: 'Present' },
    isManual: { type: Boolean, default: false }
});

// Ek employee ki ek din ki ek hi entry ho sakti hai
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);