import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, CheckCircle, XCircle, Clock, Save, RefreshCw } from 'lucide-react';

const AttendanceManager = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(null);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/payroll-api/payroll/daily-attendance?date=${date}`);
            setAttendanceList(res.data);
        } catch (err) {
            console.error("Error fetching attendance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [date]);

    const handleStatusChange = (empId, newStatus) => {
        setAttendanceList(prev => prev.map(item => 
            item.employeeId === empId ? { ...item, status: newStatus } : item
        ));
    };

    const saveManual = async (record) => {
        setSaving(record.employeeId);
        try {
            await axios.post('/payroll-api/payroll/manual-attendance', {
                employeeId: record.employeeId,
                date: date,
                status: record.status,
                checkIn: record.checkIn,
                checkOut: record.checkOut
            });
            alert(`Updated for ${record.name}`);
        } catch (err) {
            alert("Failed to save");
        } finally {
            setSaving(null);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.headerCard}>
                <div>
                    <h4 style={styles.title}>Daily Attendance</h4>
                    <p style={styles.subtitle}>Manage biometric & manual logs</p>
                </div>
                <div style={styles.datePickerWrapper}>
                    <Calendar size={18} style={styles.dateIcon} />
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        style={styles.dateInput} 
                    />
                </div>
            </div>

            <div style={styles.tableCard}>
                {loading ? (
                    <div style={styles.emptyMsg}><RefreshCw className="spin" /> Loading data...</div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Employee</th>
                                <th style={styles.th}>Machine Logs</th>
                                <th style={styles.th}>Manual Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceList.map((emp) => (
                                <tr key={emp.employeeId} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={styles.nameText}>{emp.name}</div>
                                        <small style={{color: '#A3AED0'}}>ID: {emp.employeeId}</small>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.logInfo}>
                                            <Clock size={12} /> {emp.checkIn} - {emp.checkOut}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <select 
                                            value={emp.status} 
                                            onChange={(e) => handleStatusChange(emp.employeeId, e.target.value)}
                                            style={{
                                                ...styles.select,
                                                color: emp.status === 'Present' ? '#10b981' : emp.status === 'Absent' ? '#ef4444' : '#f59e0b'
                                            }}
                                        >
                                            <option value="Present">Present</option>
                                            <option value="Absent">Absent</option>
                                            <option value="Half-Day">Half-Day</option>
                                            <option value="Leave">Leave</option>
                                        </select>
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            onClick={() => saveManual(emp)}
                                            style={styles.saveBtn}
                                            disabled={saving === emp.employeeId}
                                        >
                                            {saving === emp.employeeId ? '...' : <Save size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            <style>{`
                .spin { animation: rotate 1s linear infinite; }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const styles = {
    container: { padding: '24px', backgroundColor: '#fcfcfd', minHeight: '100vh' },
    headerCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '20px', fontWeight: '800', margin: 0, color: '#1B2559' },
    subtitle: { fontSize: '13px', color: '#A3AED0', margin: '4px 0 0 0' },
    datePickerWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    dateIcon: { position: 'absolute', left: '12px', color: '#4318FF' },
    dateInput: { padding: '10px 12px 10px 40px', borderRadius: '12px', border: '1px solid #E0E5F2', outline: 'none', fontWeight: '600', color: '#1B2559' },
    tableCard: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '15px 20px', backgroundColor: '#F4F7FE', color: '#8F9BBA', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' },
    td: { padding: '15px 20px', borderBottom: '1px solid #F1F5F9' },
    nameText: { fontWeight: '700', color: '#1B2559' },
    logInfo: { fontSize: '12px', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '5px' },
    select: { padding: '8px', borderRadius: '8px', border: '1px solid #E0E5F2', fontWeight: '700', outline: 'none', cursor: 'pointer' },
    saveBtn: { background: '#4318FF', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s' },
    emptyMsg: { padding: '40px', textAlign: 'center', color: '#A3AED0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }
};

export default AttendanceManager;