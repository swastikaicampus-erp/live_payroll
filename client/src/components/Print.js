import React from 'react';

const Print = ({ data }) => {
    if (!data) return null;

    const baseSalary = Number(data.baseSalary) || 0;
    const totalCut = Number(data.totalCut) || 0;
    const advanceDeduction = Number(data.advanceDeduction) || 0;
    const lateFine = Number(data.lateFine) || 0;
    const overtime = Number(data.overtime) || 0;
    const halfDayCut = Number(data.halfDayCut) || 0;
    const finalSalary = Number(data.finalSalary) || 0;

    return (
        <div className="print-area">
            <div style={styles.receiptContainer}>
                {/* --- Watermark --- */}
                <div style={styles.watermark}></div>

                {/* --- Header Section --- */}
                <div style={styles.header}>
                    <div style={styles.companyInfo}>
                        <h1 style={styles.companyName}>GOLD BERRY TECHNOLOGIES</h1>
                        <p style={styles.companySub}>123 Business Hub, Sector 62, New Delhi, India</p>
                        <p style={styles.companySub}>CIN: U74140DL2026PTC123456 | GSTIN: 07AAAAA0000A1Z5</p>
                        <p style={styles.companySub}>Email: hr@goldberry.com | Contact: +91 98765 43210</p>
                    </div>
                    <div style={styles.receiptTitleBox}>
                        <div style={styles.badge}>Official Document</div>
                        <h2 style={styles.receiptTitle}>PAYSLIP</h2>
                        <p style={styles.monthYear}>{data.monthName || 'Month'} {data.year || '2026'}</p>
                    </div>
                </div>

                <div style={styles.primaryDivider}></div>

                {/* --- Employee Profile Grid --- */}
                <div style={styles.infoGrid}>
                    <div style={styles.infoBox}>
                        <div style={styles.infoRow}><span style={styles.label}>Employee Name:</span> <span style={styles.value}>{data.name || 'N/A'}</span></div>
                        <div style={styles.infoRow}><span style={styles.label}>Employee ID:</span> <span style={styles.value}>{data.employeeId || 'N/A'}</span></div>
                        <div style={styles.infoRow}><span style={styles.label}>Designation:</span> <span style={styles.value}>{data.post || 'Staff'}</span></div>
                    </div>
                    <div style={{ ...styles.infoBox, borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                        <div style={styles.infoRow}><span style={styles.label}>Date of Issue:</span> <span style={styles.value}>{new Date().toLocaleDateString('en-IN')}</span></div>
                        <div style={styles.infoRow}><span style={styles.label}>Shift Timing:</span> <span style={styles.value}>{data.shiftStart} - {data.shiftEnd}</span></div>
                        <div style={styles.infoRow}><span style={styles.label}>Contact No:</span> <span style={styles.value}>{data.mobileNo || 'N/A'}</span></div>
                    </div>
                </div>

                {/* --- Attendance Stats --- */}
                <div style={styles.attendanceStrip}>
                    <div style={styles.statBox}><span style={styles.statLabel}>Working Days</span><br/><span style={styles.statValue}>{data.daysInMonth || 30}</span></div>
                    <div style={styles.statBox}><span style={styles.statLabel}>Present</span><br/><span style={{...styles.statValue, color: '#2ecc71'}}>{data.presentDays || 0}</span></div>
                    <div style={styles.statBox}><span style={styles.statLabel}>Absent</span><br/><span style={{...styles.statValue, color: '#e74c3c'}}>{data.absentDays || 0}</span></div>
                    <div style={styles.statBox}><span style={styles.statLabel}>Late Min</span><br/><span style={styles.statValue}>{data.totalLateMinutes || 0}</span></div>
                </div>

                {/* --- Earnings & Deductions Table --- */}
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>DESCRIPTION</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>EARNINGS (₹)</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>DEDUCTIONS (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={styles.td}>Basic Monthly Salary</td>
                            <td style={styles.tdAmount}>{baseSalary.toLocaleString()}</td>
                            <td style={styles.tdAmount}>-</td>
                        </tr>
                        {overtime > 0 && (
                            <tr>
                                <td style={styles.td}>Overtime Allowance</td>
                                <td style={{...styles.tdAmount, color: '#27ae60'}}>+ {overtime.toLocaleString()}</td>
                                <td style={styles.tdAmount}>-</td>
                            </tr>
                        )}
                        <tr>
                            <td style={styles.td}>Attendance Loss (Absents)</td>
                            <td style={styles.tdAmount}>-</td>
                            <td style={{...styles.tdAmount, color: '#c0392b'}}>{totalCut.toLocaleString()}</td>
                        </tr>
                        {lateFine > 0 && (
                            <tr>
                                <td style={styles.td}>Late Arrival Fine</td>
                                <td style={styles.tdAmount}>-</td>
                                <td style={{...styles.tdAmount, color: '#c0392b'}}>{lateFine.toLocaleString()}</td>
                            </tr>
                        )}
                        {halfDayCut > 0 && (
                            <tr>
                                <td style={styles.td}>Half Day Adjustments</td>
                                <td style={styles.tdAmount}>-</td>
                                <td style={{...styles.tdAmount, color: '#c0392b'}}>{Math.round(halfDayCut).toLocaleString()}</td>
                            </tr>
                        )}
                        {advanceDeduction > 0 && (
                            <tr>
                                <td style={styles.td}>Advance Salary Deduction</td>
                                <td style={styles.tdAmount}>-</td>
                                <td style={{...styles.tdAmount, color: '#c0392b'}}>{advanceDeduction.toLocaleString()}</td>
                            </tr>
                        )}
                        <tr style={styles.totalRow}>
                            <td style={styles.totalLabel}>NET PAYABLE AMOUNT</td>
                            <td colSpan="2" style={styles.totalAmount}>
                                ₹ {finalSalary.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div style={styles.noteSection}>
                    <p style={styles.amountWords}><strong>Amount in Words:</strong> Indian Rupees {finalSalary.toLocaleString()} Only</p>
                    <p style={styles.disclaimer}>Note: This is a system-generated document and does not require a physical signature.</p>
                </div>

                {/* --- Footer Signature --- */}
                <div style={styles.signatureSection}>
                    <div style={styles.sigBox}>
                        <div style={styles.sigLine}></div>
                        <p style={styles.sigText}>Employee Signature</p>
                    </div>
                    <div style={styles.sigBox}>
                        <div style={{...styles.sigLine, borderColor: '#1a365d'}}></div>
                        <p style={{...styles.sigText, fontWeight: 'bold', color: '#1a365d'}}>HR & Admin Manager</p>
                    </div>
                </div>
            </div>

            <style>{`
                @media screen { .print-area { display: none !important; } }
                @media print {
                    @page { size: A4; margin: 20mm; }
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
                }
            `}</style>
        </div>
    );
};

const styles = {
    receiptContainer: { 
        padding: '30px', 
        maxWidth: '850px', 
        margin: 'auto', 
        backgroundColor: '#fff', 
        color: '#333', 
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        position: 'relative',
        border: '1px solid #ddd'
    },
    watermark: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: '80px',
        color: 'rgba(0,0,0,0.03)',
        fontWeight: 'bold',
        zIndex: 0,
        pointerEvents: 'none'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', position: 'relative', zIndex: 1 },
    companyName: { margin: 0, fontSize: '24px', color: '#1a365d', fontWeight: '800', letterSpacing: '1px' },
    companySub: { margin: '2px 0', fontSize: '10px', color: '#718096', fontWeight: '500' },
    badge: { background: '#edf2f7', color: '#4a5568', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', display: 'inline-block', marginBottom: '5px', textTransform: 'uppercase', fontWeight: 'bold' },
    receiptTitleBox: { textAlign: 'right' },
    receiptTitle: { margin: 0, fontSize: '26px', letterSpacing: '3px', color: '#2d3748', fontWeight: '300' },
    monthYear: { margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#1a365d' },
    primaryDivider: { height: '3px', background: '#1a365d', marginBottom: '20px' },
    infoGrid: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', backgroundColor: '#fdfdfd', padding: '15px', borderRadius: '8px', border: '1px solid #f0f0f0' },
    infoBox: { flex: 1 },
    infoRow: { marginBottom: '8px', display: 'flex', fontSize: '12px' },
    label: { width: '120px', color: '#718096', fontWeight: '500' },
    value: { color: '#2d3748', fontWeight: 'bold' },
    attendanceStrip: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', gap: '15px' },
    statBox: { flex: 1, textAlign: 'center', padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' },
    statLabel: { fontSize: '10px', textTransform: 'uppercase', color: '#718096', fontWeight: 'bold' },
    statValue: { fontSize: '16px', fontWeight: '800', color: '#2d3748' },
    table: { width: '100%', borderCollapse: 'collapse', marginBottom: '20px', position: 'relative', zIndex: 1 },
    tableHeader: { backgroundColor: '#1a365d' },
    th: { color: '#fff', padding: '12px 15px', textAlign: 'left', fontSize: '11px', letterSpacing: '1px' },
    td: { padding: '12px 15px', borderBottom: '1px solid #edf2f7', fontSize: '12px', color: '#2d3748', fontWeight: '500' },
    tdAmount: { padding: '12px 15px', borderBottom: '1px solid #edf2f7', fontSize: '12px', textAlign: 'right', fontWeight: 'bold' },
    totalRow: { backgroundColor: '#f8fafc' },
    totalLabel: { padding: '15px', fontWeight: '800', fontSize: '13px', color: '#1a365d' },
    totalAmount: { padding: '15px', textAlign: 'right', fontWeight: '900', fontSize: '18px', color: '#1a365d' },
    noteSection: { marginTop: '10px' },
    amountWords: { fontSize: '11px', color: '#4a5568', marginBottom: '5px' },
    disclaimer: { fontSize: '9px', color: '#a0aec0', fontStyle: 'italic' },
    signatureSection: { display: 'flex', justifyContent: 'space-between', marginTop: '60px' },
    sigBox: { textAlign: 'center', width: '200px' },
    sigLine: { borderTop: '1.5px solid #2d3748', marginBottom: '8px' },
    sigText: { fontSize: '11px', color: '#4a5568', margin: 0 }
};

export default Print;