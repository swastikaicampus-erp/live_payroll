import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, Clock, Search, Smartphone } from 'lucide-react';

const AttendanceLogs = () => {
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const empRes = await axios.get('http://76.13.192.122/api/payroll/employees').catch(() => ({ data: [] }));
      const empMap = {};
      empRes.data.forEach(emp => { 
        empMap[String(emp.employeeId).trim()] = emp.name; 
      });
      setEmployees(empMap);
      
      const targetUrl = `http://3.111.38.27/bio.php?APIKey=050914052413&FromDate=${fromDate}&ToDate=${toDate}&SerialNumber=C2636C37D7282535`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&t=${Date.now()}`;
      
      const response = await axios.get(proxyUrl);
      const resText = response.data.contents;

      if (resText) {
        const parsed = JSON.parse(resText);
        if (Array.isArray(parsed)) {
          const enriched = parsed.map(log => ({
            name: empMap[String(log.EmployeeCode).trim()] || `Unknown (ID: ${log.EmployeeCode})`,
            id: log.EmployeeCode,
            time: log.LogDate 
          }));
          setLogs(enriched);
        } else {
          setLogs([]);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div style={{...styles.container, padding: isMobile ? '12px' : '24px'}}>
      
      {/* Header Section */}
      <div style={styles.header}>
        <h2 style={styles.title}>Live Attendance Logs</h2>
        <p style={styles.subtitle}>Real-time biometric punch records</p>
      </div>

      {/* --- Responsive Filter UI --- */}
      <div style={{...styles.filterCard, flexDirection: isMobile ? 'column' : 'row'}}>
        <div style={{...styles.inputGroup, width: isMobile ? '100%' : 'auto'}}>
          <label style={styles.label}><Calendar size={14} /> From Date</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={styles.input} />
        </div>
        
        <div style={{...styles.inputGroup, width: isMobile ? '100%' : 'auto'}}>
          <label style={styles.label}><Calendar size={14} /> To Date</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={styles.input} />
        </div>

        <button onClick={fetchLogs} style={{...styles.btn, width: isMobile ? '100%' : 'auto'}} disabled={loading}>
          {loading ? "Fetching..." : <><Search size={18} /> Get Records</>}
        </button>
      </div>

      {/* --- Responsive Content --- */}
      {loading ? (
        <div style={styles.loader}>⌛ Loading biometric records...</div>
      ) : logs.length > 0 ? (
        isMobile ? (
          /* Mobile Card View */
          <div style={styles.mobileGrid}>
            {logs.map((log, i) => (
              <div key={i} style={styles.mobileCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.avatar}>{log.name.charAt(0)}</div>
                  <div>
                    <div style={styles.empName}>{log.name}</div>
                    <div style={styles.empIdText}>Machine ID: {log.id}</div>
                  </div>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.timeInfo}>
                    <Clock size={14} color="#707EAE" />
                    <span>Punch Time: <strong>{log.time}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table View */
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>EMPLOYEE NAME</th>
                  <th style={styles.th}>MACHINE ID</th>
                  <th style={styles.th}>PUNCH TIME</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} className="row-hover">
                    <td style={{ ...styles.td, color: '#4318FF', fontWeight: '700' }}>{log.name}</td>
                    <td style={styles.td}>{log.id}</td>
                    <td style={styles.td}>{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div style={styles.emptyState}>No logs found for the selected range.</div>
      )}

      <style>{`
        .row-hover { transition: 0.2s; border-bottom: 1px solid #F4F7FE; }
        .row-hover:hover { background-color: #F9FAFB; }
      `}</style>
    </div>
  );
};

// --- Modern Responsive Styles ---
const styles = {
  container: { backgroundColor: '#F4F7FE', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  header: { marginBottom: '20px' },
  title: { fontSize: '22px', fontWeight: '800', color: '#1B2559', margin: 0 },
  subtitle: { fontSize: '13px', color: '#707EAE', marginTop: '4px' },
  
  filterCard: { 
    display: 'flex', gap: '15px', alignItems: 'flex-end', padding: '20px', 
    backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
    marginBottom: '20px' 
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#707EAE', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #E0E5F2', fontSize: '14px', color: '#1B2559', outline: 'none' },
  btn: { 
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '12px 25px', backgroundColor: '#4318FF', color: '#fff', border: 'none', 
    borderRadius: '12px', fontWeight: '700', cursor: 'pointer', transition: '0.3s' 
  },

  tableWrapper: { overflowX: 'auto', borderRadius: '16px', border: '1px solid #E0E5F2', background: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '16px', textAlign: 'left', backgroundColor: '#F8FAFC', color: '#A3AED0', fontSize: '12px', fontWeight: '800' },
  td: { padding: '16px', color: '#1B2559', fontSize: '14px' },

  mobileGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  mobileCard: { backgroundColor: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #E0E5F2' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  avatar: { width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F4F7FE', color: '#4318FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  empName: { fontSize: '15px', fontWeight: '700', color: '#1B2559' },
  empIdText: { fontSize: '12px', color: '#707EAE' },
  cardBody: { borderTop: '1px solid #F4F7FE', paddingTop: '10px' },
  timeInfo: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#1B2559' },
  
  loader: { textAlign: 'center', padding: '50px', color: '#4318FF', fontWeight: '600' },
  emptyState: { textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '16px', color: '#A3AED0' }
};

export default AttendanceLogs;