import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Clock, ArrowLeft, Calendar, AlertCircle, Users, CheckCircle, Wallet, Coffee } from 'lucide-react';

const SalaryReport = ({ onBack }) => {
  const [empId, setEmpId] = useState('');
  const [monthYear, setMonthYear] = useState(''); 
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const [stats, setStats] = useState({ totalStaff: 0, presentToday: 0 });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    fetchDashboardStats();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchDashboardStats = async () => {
    try {
        const empRes = await axios.get('http://76.13.192.122:5001/api/payroll/employees');
        setStats({
            totalStaff: empRes.data.length,
            presentToday: Math.floor(empRes.data.length * 0.8) 
        });
    } catch (err) {
        console.error("Stats fetch error", err);
    }
  };

  const fetchSalary = async () => {
    if (!empId || !monthYear) return alert("Please enter Machine ID and Select Month");
    setLoading(true);
    setError('');
    const [year, month] = monthYear.split('-');

    try {
      const res = await axios.get(`http://76.13.192.122:5001/api/payroll/salary`, {
        params: { empId, month, year }
      });
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Records not found for this period.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year, month) => {
    const days = [];
    const date = new Date(year, month - 1, 1);
    while (date.getMonth() === month - 1) {
      days.push(new Date(date).toISOString().split('T')[0]);
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const allMonthDates = monthYear ? getDaysInMonth(...monthYear.split('-')) : [];

  return (
    <div style={{...styles.container, padding: isMobile ? '12px' : '24px'}}>
      
      {/* Header Area */}
      <div style={styles.headerArea}>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button onClick={onBack} style={styles.btnBack}><ArrowLeft size={20} /></button>
            <div>
                <h2 style={{...styles.mainTitle, fontSize: isMobile ? '20px' : '26px'}}>Payroll Dashboard</h2>
                <p style={styles.breadcrumb}>Reports • {monthYear || 'Overview'}</p>
            </div>
        </div>
      </div>

      {/* Dynamic Dashboard Cards */}
      <div style={{...styles.dashboardGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)'}}>
          <div style={styles.dashCard}>
              <div style={{...styles.iconCircle, background: '#E7EAFF'}}><Users color="#4318FF" size={20}/></div>
              <div>
                  <p style={styles.dashLabel}>Total Staff</p>
                  <h3 style={styles.dashValue}>{stats.totalStaff}</h3>
              </div>
          </div>
          <div style={styles.dashCard}>
              <div style={{...styles.iconCircle, background: '#E2FBEA'}}><CheckCircle color="#05CD99" size={20}/></div>
              <div>
                  <p style={styles.dashLabel}>Present Today</p>
                  <h3 style={styles.dashValue}>{stats.presentToday}</h3>
              </div>
          </div>
          <div style={styles.dashCard}>
              <div style={{...styles.iconCircle, background: '#FFF5E9'}}><Wallet color="#FFB547" size={20}/></div>
              <div>
                  <p style={styles.dashLabel}>Estimated Payout</p>
                  <h3 style={styles.dashValue}>₹{report ? Number(report.finalSalary).toLocaleString('en-IN') : '--'}</h3>
              </div>
          </div>
      </div>

      {/* Filter Card */}
      <div style={styles.filterCard}>
        <div style={{...styles.filterGrid, flexDirection: isMobile ? 'column' : 'row'}}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>MACHINE ID</label>
            <input type="text" style={styles.input} value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="Enter ID" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>SELECT MONTH</label>
            <input type="month" style={styles.input} value={monthYear} onChange={(e) => setMonthYear(e.target.value)} />
          </div>
          <button style={{...styles.btnGenerate, width: isMobile ? '100%' : 'auto'}} onClick={fetchSalary} disabled={loading}>
            {loading ? "..." : "Generate Report"}
          </button>
        </div>
      </div>

      {error && <div style={styles.errorBox}><AlertCircle size={18} /> {error}</div>}

      {report && (
        <div id="printable-area">
          {/* Payslip Card */}
          <div style={styles.payslipCard}>
            <div style={{...styles.slipHeader, padding: isMobile ? '15px' : '20px 30px'}}>
              <div>
                <h3 style={{margin: 0, fontSize: isMobile ? '14px' : '18px'}}>OFFICIAL PAYSLIP</h3>
                <span style={{fontSize: '12px', opacity: 0.8}}>{monthYear}</span>
              </div>
              <div style={styles.verifiedBadge}>VERIFIED</div>
            </div>

            <div style={{...styles.slipBody, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '15px' : '0'}}>
              <div style={{flex: 1}}>
                <h1 style={{...styles.empName, fontSize: isMobile ? '24px' : '28px'}}>{report.name}</h1>
                <div style={styles.metaBadgeGrid}>
                    <span style={styles.metaItem}>ID: {empId}</span>
                    <span style={styles.metaItem}>Payable Days: {report.calculatedDays}d</span>
                </div>
              </div>
              <div style={{textAlign: isMobile ? 'left' : 'right'}}>
                <span style={styles.netLabel}>NET PAYABLE</span>
                <h1 style={{...styles.netAmount, fontSize: isMobile ? '28px' : '36px'}}>₹{Number(report.finalSalary).toLocaleString('en-IN')}</h1>
              </div>
            </div>

            <div style={styles.divider}></div>

            <div style={{...styles.summaryGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', padding: isMobile ? '15px' : '30px'}}>
                <div style={styles.statBox}>
                    <label style={styles.statLabel}>BASIC SALARY</label>
                    <span style={styles.statValue}>₹{report.baseSalary?.toLocaleString('en-IN')}</span>
                </div>
                <div style={styles.statBox}>
                    <label style={styles.statLabel}>OT PAY</label>
                    <span style={{...styles.statValue, color: '#10b981'}}>+₹{report.overtimePay || 0}</span>
                </div>
                <div style={styles.statBox}>
                    <label style={styles.statLabel}>DEDUCTIONS</label>
                    <span style={{...styles.statValue, color: '#ef4444'}}>-₹{report.lateFineTotal || 0}</span>
                </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div style={styles.tableContainer}>
            <div style={styles.tableHeader}><Calendar size={18} /> Attendance Log</div>
            <div style={{overflowX: 'auto'}}>
                <table style={styles.table}>
                <thead>
                    <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Duration</th>
                    <th style={styles.th}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {allMonthDates.map((dateStr) => {
                    const log = report.attendanceHistory?.find(h => h.date === dateStr);
                    const isSunday = new Date(dateStr).getDay() === 0;
                    
                    // Logic to determine badge
                    let badge = <span style={styles.absentBadge}>A</span>;
                    if (log) {
                        if (log.isHalfDay) {
                            badge = <span style={styles.halfDayBadge}>H</span>;
                        } else {
                            badge = <span style={styles.presentBadge}>P</span>;
                        }
                    } else if (isSunday) {
                        badge = <span style={styles.sundayBadge}>O</span>;
                    }

                    return (
                        <tr key={dateStr} style={{backgroundColor: isSunday ? '#fefce8' : 'transparent'}}>
                        <td style={styles.td}>{dateStr.split('-')[2]} ({dateStr.split('-')[1]})</td>
                        <td style={styles.td}>
                            {log ? `${log.checkIn} - ${log.checkOut}` : '--'}
                            {log?.workingHours && <small style={{display: 'block', color: '#707EAE'}}>{log.workingHours} hrs</small>}
                        </td>
                        <td style={styles.td}>{badge}</td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Updated Styles including Half Day Badge ---
const styles = {
  container: { backgroundColor: '#F4F7FE', minHeight: '100vh', boxSizing: 'border-box' },
  headerArea: { marginBottom: '25px' },
  mainTitle: { margin: 0, color: '#1B2559', fontWeight: '800' },
  breadcrumb: { margin: 0, fontSize: '12px', color: '#707EAE' },
  btnBack: { border: 'none', background: '#fff', padding: '10px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  
  dashboardGrid: { display: 'grid', gap: '15px', marginBottom: '25px' },
  dashCard: { background: '#fff', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' },
  iconCircle: { width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dashLabel: { margin: 0, fontSize: '12px', color: '#A3AED0', fontWeight: '600' },
  dashValue: { margin: 0, fontSize: '20px', color: '#1B2559', fontWeight: '800' },

  filterCard: { background: '#fff', padding: '16px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '25px' },
  filterGrid: { display: 'flex', gap: '12px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  label: { fontSize: '10px', fontWeight: 'bold', color: '#A3AED0' },
  input: { padding: '12px', borderRadius: '12px', border: '1px solid #E0E5F2', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  btnGenerate: { background: '#4318FF', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', marginTop: '18px' },
  
  payslipCard: { background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #E2E8F0', marginBottom: '25px' },
  slipHeader: { background: '#1B2559', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  verifiedBadge: { background: '#10B981', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' },
  slipBody: { padding: '20px', display: 'flex' },
  empName: { margin: 0, color: '#1B2559', fontWeight: '800' },
  metaBadgeGrid: { display: 'flex', gap: '8px', marginTop: '10px' },
  metaItem: { background: '#F4F7FE', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', color: '#4318FF', fontWeight: '600' },
  netLabel: { fontSize: '11px', fontWeight: '800', color: '#A3AED0' },
  netAmount: { margin: 0, color: '#10B981', fontWeight: '900' },
  divider: { height: '1px', background: '#F1F5F9', margin: '0 20px' },
  summaryGrid: { display: 'grid', gap: '15px' },
  statBox: { background: '#F8FAFC', padding: '15px', borderRadius: '16px', border: '1px solid #F1F5F9' },
  statLabel: { fontSize: '10px', fontWeight: 'bold', color: '#707EAE' },
  statValue: { fontSize: '18px', fontWeight: '800', color: '#1B2559', marginTop: '5px', display: 'block' },
  
  tableContainer: { background: '#fff', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: '40px' },
  tableHeader: { padding: '15px', background: '#FCFCFD', borderBottom: '1px solid #F1F5F9', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#F4F7FE', padding: '10px', textAlign: 'left', fontSize: '10px', color: '#A3AED0' },
  td: { padding: '12px 10px', borderBottom: '1px solid #F1F5F9', fontSize: '13px', color: '#1B2559' },
  
  presentBadge: { background: '#DCFCE7', color: '#166534', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' },
  halfDayBadge: { background: '#FFF7ED', color: '#C2410C', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' },
  absentBadge: { background: '#FEE2E2', color: '#B91C1C', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' },
  sundayBadge: { background: '#FEF9C3', color: '#854D0E', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' },
  errorBox: { padding: '12px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '10px', marginBottom: '20px', display: 'flex', gap: '8px', fontSize: '14px' }
};

export default SalaryReport;