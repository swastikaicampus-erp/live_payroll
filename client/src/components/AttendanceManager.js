import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Save, RefreshCw } from 'lucide-react';

const getToday = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

const AttendanceManager = () => {
    const [date, setDate] = useState(getToday());
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(null);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/payroll-api/payroll/daily-attendance?date=${date}`);
            setAttendanceList(res.data || []);
        } catch (err) {
            console.error("❌ Error fetching attendance:", err);
            alert("Failed to load attendance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [date]);

    const handleStatusChange = (empId, newStatus) => {
        setAttendanceList(prev =>
            prev.map(item =>
                item.employeeId === empId
                    ? { ...item, status: newStatus }
                    : item
            )
        );
    };

    const saveManual = async (record) => {
        if (!record.status) {
            alert("Select status first");
            return;
        }

        setSaving(record.employeeId);

        try {
            await axios.post('/payroll-api/payroll/manual-attendance', {
                employeeId: String(record.employeeId),
                date,
                status: record.status,
                checkIn: record.checkIn,
                checkOut: record.checkOut
            });

            alert(`✅ Updated for ${record.name}`);

            // 🔥 IMPORTANT: refresh data
            await fetchAttendance();

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to save");
        } finally {
            setSaving(null);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.headerCard}>
                <div>
                    <h4 style={styles.title}>Daily Attendance</h4>
                    <p style={styles.subtitle}>Biometric + Manual Override</p>
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
                    <div style={styles.emptyMsg}>
                        <RefreshCw className="spin" /> Loading...
                    </div>
                ) : attendanceList.length === 0 ? (
                    <div style={styles.emptyMsg}>
                        No attendance data found
                    </div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Employee</th>
                                <th style={styles.th}>Logs</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {attendanceList.map((emp) => (
                                <tr
                                    key={emp.employeeId}
                                    style={{
                                        ...styles.tr,
                                        backgroundColor: emp.isManual ? '#fef3c7' : 'transparent'
                                    }}
                                >
                                    <td style={styles.td}>
                                        <div style={styles.nameText}>{emp.name}</div>
                                        <small style={{ color: '#A3AED0' }}>
                                            ID: {emp.employeeId}
                                        </small>
                                    </td>

                                    <td style={styles.td}>
                                        <div style={styles.logInfo}>
                                            <Clock size={12} />
                                            {emp.checkIn || '--:--'} - {emp.checkOut || '--:--'}
                                        </div>
                                    </td>

                                    <td style={styles.td}>
                                        <select
                                            value={emp.status || 'Absent'}
                                            onChange={(e) =>
                                                handleStatusChange(emp.employeeId, e.target.value)
                                            }
                                            style={{
                                                ...styles.select,
                                                color:
                                                    emp.status === 'Present'
                                                        ? '#10b981'
                                                        : emp.status === 'Absent'
                                                        ? '#ef4444'
                                                        : '#f59e0b'
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
    headerCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: { fontSize: '20px', fontWeight: '800', margin: 0 },
    subtitle: { fontSize: '13px', color: '#A3AED0' },
    datePickerWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    dateIcon: { position: 'absolute', left: '12px', color: '#4318FF' },
    dateInput: {
        padding: '10px 12px 10px 40px',
        borderRadius: '12px',
        border: '1px solid #E0E5F2'
    },
    tableCard: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0'
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
        padding: '15px',
        backgroundColor: '#F4F7FE',
        fontSize: '12px'
    },
    td: { padding: '15px', borderBottom: '1px solid #F1F5F9' },
    nameText: { fontWeight: '700' },
    logInfo: { display: 'flex', gap: '5px', alignItems: 'center' },
    select: { padding: '8px', borderRadius: '8px' },
    saveBtn: {
        background: '#4318FF',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '10px',
        cursor: 'pointer'
    },
    emptyMsg: {
        padding: '40px',
        textAlign: 'center',
        color: '#A3AED0'
    }
};

export default AttendanceManager;