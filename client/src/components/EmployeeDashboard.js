import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    X, Phone, Clock, MapPin, Hash, Calendar as CalendarIcon,
    Printer, Wallet, ArrowDownCircle, AlertCircle
} from 'lucide-react';
import Print from './Print';

const EmployeeDashboard = ({ data, onClose }) => {
    const [advanceToDeduct, setAdvanceToDeduct] = useState(0);
    const [config, setConfig] = useState(null);
    const [loadingSettings, setLoadingSettings] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/payroll-api/payroll/settings');
                const settings = Array.isArray(res.data) ? res.data[0] : res.data;
                if (settings) setConfig(settings);
            } catch (err) {
                console.error("Error fetching payroll settings:", err);
            } finally {
                setLoadingSettings(false);
            }
        };
        fetchSettings();
    }, []);

    if (!data) return null;

    // --- Calculation Logic ---
    const baseSalary = Number(data.baseSalary) || 0;
    const attendanceCut = Number(data.totalAttendanceCut) || 0;
    const totalLateMinutes = Number(data.totalLateMinutes) || 0;
    const lateFineRate = config ? Number(config.lateFinePerMinute) : 0;
    const lateFineAmount = totalLateMinutes * lateFineRate;
    const totalOTHours = Number(data.totalOTHours) || 0;
    const otRate = config ? Number(config.overtimePayPerHour) : 0;
    const overtimeAmount = totalOTHours * otRate;
    const halfDayCount = Number(data.halfDayCount) || 0;
    const halfDayFactor = config ? Number(config.halfDayPayFactor) : 0.5;
    const perDaySalary = baseSalary / (data.daysInMonth || 30);
    const halfDayDeduction = halfDayCount * (perDaySalary * (1 - halfDayFactor));

    const totalEarnings = baseSalary + overtimeAmount;
    const totalDeductions = attendanceCut + lateFineAmount + halfDayDeduction + advanceToDeduct;
    const finalNetPay = Math.max(0, totalEarnings - totalDeductions);
    const handlePrint = () => {
        window.print();
    };


    const renderCalendar = () => {
        const days = [];
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const totalDays = data.daysInMonth || 30;
        const presentDates = data.presentDates || [];
        const year = data.year || 2026;
        const monthIndex = new Date().getMonth();

        const headers = weekDays.map(d => (
            <div key={d} style={{ ...styles.calDay, color: '#A3AED0', fontSize: '10px', border: 'none', background: 'transparent' }}>
                {d.charAt(0)}
            </div>
        ));

        for (let i = 1; i <= totalDays; i++) {
            const dateObj = new Date(year, monthIndex, i);
            const isTuesday = dateObj.getDay() === 2;
            const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isPresent = presentDates.includes(dateStr);

            let dayStyle = { ...styles.calDay };
            if (isTuesday) {
                dayStyle = { ...dayStyle, backgroundColor: 'red', color: '#fff', border: '1px solid red' };
            } else if (isPresent) {
                dayStyle = { ...dayStyle, backgroundColor: '#def7ec', color: '#03543f', border: '1px solid #31c48d' };
            } else {
                dayStyle = { ...dayStyle, backgroundColor: '#fde8e8', color: '#9b1c1c', border: '1px solid #f98080' };
            }

            days.push(
                <div key={i} style={dayStyle} title={isTuesday ? "Weekly Off" : ""}>
                    <span style={{ fontSize: '11px' }}>{i}</span>
                    {isTuesday && <span style={{ fontSize: '7px', position: 'absolute', bottom: '2px', fontWeight: '900' }}>OFF</span>}
                </div>
            );
        }

        return (
            <div style={{ marginTop: '15px' }}>
                <div style={styles.calendarGrid}>{headers}</div>
                <div style={{ ...styles.calendarGrid, marginTop: '5px' }}>{days}</div>
            </div>
        );
    };

    return (
        <div style={styles.modalOverlay} className="no-print">
            {/* Added className for responsive targeting */}
            <div style={styles.dashboardCard} className="dashboard-card">
                <div style={styles.dashHeader}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={styles.largeAvatar}>{data.name ? data.name.charAt(0) : 'E'}</div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{data.name || 'Employee'}</h2>
                            <span style={styles.postBadge}>{data.post || 'Staff'}</span>
                        </div>
                    </div>
                    <X size={28} onClick={onClose} style={{ cursor: 'pointer', color: '#666' }} />
                </div>

                <div style={styles.dashContent} className="dash-main-content">
                    {/* Left Column */}
                    <div style={styles.leftCol} className="dash-column">
                        <section style={styles.section}>
                            <h4 style={styles.sectionTitle}><Hash size={16} /> Employee Details</h4>
                            <div style={styles.detailsGrid}>
                                <p><Phone size={14} /> {data.mobileNo || 'N/A'}</p>
                                <p><Clock size={14} /> {data.shiftStart || '09:00'} - {data.shiftEnd || '18:00'}</p>
                                <p><MapPin size={14} /> Office</p>
                                <p><Hash size={14} /> ID: {data.employeeId}</p>
                            </div>
                        </section>

                        <section style={{ ...styles.section, backgroundColor: '#fff9f2', border: '1px solid #ffe8cc' }}>
                            <h4 style={{ ...styles.sectionTitle, color: '#e67e22' }}><Wallet size={16} /> Advance Management</h4>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={styles.label}>History</label>
                                    <input type="text" readOnly style={styles.input} value={`₹${data.advanceBalance || 0}`} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={styles.label}>Deduct</label>
                                    <input type="number" style={{ ...styles.input, borderColor: '#e67e22' }} value={advanceToDeduct} onChange={(e) => setAdvanceToDeduct(Number(e.target.value))} />
                                </div>
                            </div>
                        </section>

                        <section style={styles.section}>
                            <h4 style={styles.sectionTitle}><ArrowDownCircle size={16} /> Salary Breakdown</h4>
                            <div style={styles.breakdownRow}><span>Base Salary</span> <span>₹{baseSalary.toLocaleString()}</span></div>
                            {overtimeAmount > 0 && <div style={styles.breakdownRow}><span>Overtime</span> <span style={{ color: '#10b981' }}>+ ₹{overtimeAmount.toLocaleString()}</span></div>}
                            <div style={styles.breakdownRow}><span>Attendance Cut</span> <span style={{ color: 'red' }}>- ₹{attendanceCut.toLocaleString()}</span></div>
                            <div style={styles.totalNetRow}>
                                <span>NET PAY</span>
                                <span>₹{Math.round(finalNetPay).toLocaleString()}</span>
                            </div>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div style={styles.rightCol} className="dash-column right-border-fix">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={styles.sectionTitle}><CalendarIcon size={16} /> Attendance</h4>
                        </div>
                        <div style={styles.summaryMini}>
                            <span>P: {data.presentDays || 0}</span> | <span>A: {data.absentDays || 0}</span>
                        </div>
                        {renderCalendar()}

                        <button onClick={handlePrint} style={styles.dashPrintBtn}>
                            <Printer size={20} /> Print Salary Slip
                        </button>

                    </div>
                </div>
            </div>

            <style>{`
                /* Desktop and Tablets */
                @media screen and (max-width: 768px) {
                    .dashboard-card {
                        width: 95% !important;
                        height: 90vh !important;
                        overflow-y: auto !important;
                    }
                    .dash-main-content {
                        flex-direction: column !important;
                        padding: 15px !important;
                        gap: 20px !important;
                    }
                    .right-border-fix {
                        border-left: none !important;
                        padding-left: 0 !important;
                        border-top: 1px solid #eee !important;
                        padding-top: 20px !important;
                    }
                    .dash-column {
                        flex: none !important;
                        width: 100% !important;
                    }
                }

              @media print {
    body * { visibility: hidden; }
    .print-area, .print-area * { visibility: visible; }
}

                }
            `}</style>
            {/* ===== PRINT COMPONENT ===== */}
            <Print
                data={{
                    ...data,
                    finalSalary: Math.round(finalNetPay),
                    advanceDeduction: advanceToDeduct,
                    overtime: overtimeAmount,
                    lateFine: lateFineAmount,
                    halfDayCut: halfDayDeduction,
                    totalCut: attendanceCut
                }}
            />

        </div>
    );
};

const styles = {
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '10px', backdropFilter: 'blur(5px)' },
    dashboardCard: { background: '#fff', width: '100%', maxWidth: '950px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxHeight: '95vh' },
    dashHeader: { padding: '20px 25px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfcfc' },
    largeAvatar: { width: '60px', height: '60px', background: '#4318FF', color: '#fff', borderRadius: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', fontWeight: 'bold', flexShrink: 0 },
    postBadge: { background: '#eef2ff', color: '#4318FF', padding: '2px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
    dashContent: { display: 'flex', padding: '25px', gap: '30px' },
    leftCol: { flex: 1.2, display: 'flex', flexDirection: 'column', gap: '20px' },
    rightCol: { flex: 1, borderLeft: '1px solid #eee', paddingLeft: '30px' },
    section: { background: '#f8fafc', padding: '15px', borderRadius: '12px' },
    sectionTitle: { margin: '0 0 12px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#2d3748' },
    detailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: '#4a5568' },
    label: { fontSize: '11px', color: '#718096', display: 'block', marginBottom: '2px' },
    input: { width: '80%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px', fontSize: '14px', fontWeight: 'bold' },
    breakdownRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#4a5568' },
    totalNetRow: { display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #cbd5e0', paddingTop: '10px', fontWeight: '800', fontSize: '20px', color: '#10b981' },
    calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' },
    calDay: { height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', position: 'relative' },
    summaryMini: { fontSize: '12px', color: '#718096', marginBottom: '10px' },
    dashPrintBtn: { width: '100%', marginTop: '20px', padding: '15px', background: '#111827', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px', fontWeight: 'bold' }
};

export default EmployeeDashboard;