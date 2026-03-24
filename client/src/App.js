import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Components
import Login from './components/Login';
import AddEmployee from './components/AddEmployee';
import SalaryReport from './components/SalaryReport';
import BulkUpload from './components/BulkUpload';
import StaffList from './components/StaffList';
import SettingsPanel from './components/SettingsPanel';
import AttendanceLogs from './components/AttendanceLogs'; 

// Icons
import { 
  Users, FileSpreadsheet, LayoutDashboard, Settings, 
  UserCircle, Bell, Clock, ShieldCheck, LogOut, Loader2
} from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('report');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      alert("Logout failed!");
    }
  };

  const colors = {
    primary: '#4318FF',
    textMain: '#1B2559',
    textSecondary: '#A3AED0',
    bgLight: '#F4F7FE',
    white: '#FFFFFF',
    border: '#E0E5F2',
    danger: '#EE5D50'
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgLight }}>
        <Loader2 className="spin" size={40} color={colors.primary} />
        <style>{`.spin { animation: rotate 1s linear infinite; } @keyframes rotate { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Login />;

  const styles = {
    container: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh', backgroundColor: colors.bgLight, fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: 'hidden' },
    sidebar: { width: '280px', backgroundColor: colors.white, borderRight: `1px solid ${colors.border}`, display: isMobile ? 'none' : 'flex', flexDirection: 'column', padding: '30px 20px', boxSizing: 'border-box' },
    bottomNav: { display: isMobile ? 'flex' : 'none', position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, height: '70px', justifyContent: 'space-around', alignItems: 'center', borderTop: `1px solid ${colors.border}`, boxShadow: '0px -10px 30px rgba(0,0,0,0.03)', zIndex: 1000, paddingBottom: 'env(safe-area-inset-bottom)' },
    main: { flex: 1, overflowY: 'auto', padding: isMobile ? '15px' : '30px', paddingBottom: isMobile ? '100px' : '30px', boxSizing: 'border-box', scrollBehavior: 'smooth', backgroundColor: '#fff' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    headerActions: { display: 'flex', gap: '12px', alignItems: 'center' },
    iconBtn: { padding: '10px', backgroundColor: colors.white, borderRadius: '12px', color: colors.textSecondary, border: `1px solid ${colors.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center' },
    logoutBtn: { padding: '10px 15px', backgroundColor: '#FFF5F5', borderRadius: '12px', color: colors.danger, border: '1px solid #FFE0E0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '14px' }
  };

  return (
    <div style={styles.container}>
      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <aside style={styles.sidebar}>
          <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
}}>
    <img 
        src="/payroll/goldberry_tech.png" 
        alt="Goldberry Tech Full Logo" 
        style={{ 
            height: '80px', // Height thodi badha di hai taaki image clear dikhe
            width: 'auto',   // Aspect ratio maintain rahega
            maxWidth: '100%', 
            objectFit: 'contain',
            display: 'block'
        }}
    />
</div>
          <nav style={{ flex: 1 }}>
            <SidebarBtn active={view === 'report'} onClick={() => setView('report')} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            
            {/* CORRECTED: Fixed icon and view name */}
            <SidebarBtn active={view === 'attendance'} onClick={() => setView('attendance')} icon={<Clock size={20}/>} label="Attendance Logs" />
            
            <SidebarBtn active={view === 'staff'} onClick={() => setView('staff')} icon={<Users size={20}/>} label="Staff Directory" />
            <SidebarBtn active={view === 'add'} onClick={() => setView('add')} icon={<UserCircle size={20}/>} label="Add Employee" />
            <SidebarBtn active={view === 'settings'} onClick={() => setView('settings')} icon={<Settings size={20}/>} label="Payroll Rules" />
          </nav>
        </aside>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav style={styles.bottomNav}>
        <MobileNavItem active={view === 'report'} onClick={() => setView('report')} icon={<LayoutDashboard size={22} />} label="Home" />
        <MobileNavItem active={view === 'attendance'} onClick={() => setView('attendance')} icon={<Clock size={22} />} label="Logs" />
        <MobileNavItem active={view === 'staff'} onClick={() => setView('staff')} icon={<Users size={22} />} label="Staff" />
        <MobileNavItem active={view === 'add'} onClick={() => setView('add')} icon={<UserCircle size={22} />} label="Add" />
        <MobileNavItem active={view === 'settings'} onClick={() => setView('settings')} icon={<Settings size={22} />} label="Rules" />
      </nav>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <p style={{ color: colors.textSecondary, fontSize: '13px', margin: 0, fontWeight: '600', letterSpacing: '0.5px' }}>
              PAGES / {view.toUpperCase()}
            </p>
            <h1 style={{ fontSize: isMobile ? '22px' : '30px', fontWeight: '800', color: colors.textMain, margin: '2px 0 0 0' }}>
              {view === 'report' ? 'Overview' : view.replace('-', ' ').charAt(0).toUpperCase() + view.slice(1)}
            </h1>
          </div>
          
          <div style={styles.headerActions}>
             <div style={styles.iconBtn}><Bell size={20}/></div>
             <button onClick={handleLogout} style={styles.logoutBtn} className="header-logout">
                <LogOut size={18} />
                {!isMobile && "Logout"}
             </button>
             <div style={{ width: '45px', height: '45px', backgroundColor: colors.primary, borderRadius: '14px', color: colors.white, display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '16px', boxShadow: '0px 10px 20px rgba(67, 24, 255, 0.2)' }}>
               {user.email?.charAt(0).toUpperCase()}
             </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="content-fade" style={{ backgroundColor: colors.white, borderRadius: '24px', padding: isMobile ? '18px' : '30px', border: `1px solid ${colors.border}`, minHeight: '65vh' }}>
          {view === 'report' && <SalaryReport />}
          {view === 'staff' && <StaffList onEditClick={() => setView('add')} />}
          {view === 'add' && <AddEmployee onEmployeeAdded={() => setView('staff')} onBack={() => setView('staff')} />}
          {view === 'bulk' && <BulkUpload />}
          {view === 'settings' && <SettingsPanel onBack={() => setView('report')} />}
          
          {/* CORRECTED: Added AttendanceLogs to the conditional rendering */}
          {view === 'attendance' && <AttendanceLogs />}
        </div>
      </main>
      
      <style>{`
        .content-fade { animation: fadeIn 0.4s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .header-logout:hover { background-color: #fee2e2 !important; transform: translateY(-1px); }
      `}</style>
    </div>
  );
}

// Helper Components (Styles remain same)
const sidebarBtnStyle = (active) => ({
  display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer', width: '100%', marginBottom: '10px', transition: 'all 0.2s ease',
  backgroundColor: active ? '#4318FF' : 'transparent',
  color: active ? '#ffffff' : '#A3AED0',
  fontWeight: active ? '700' : '600',
  boxShadow: active ? '0px 12px 24px rgba(67, 24, 255, 0.25)' : 'none',
  textAlign: 'left'
});

const SidebarBtn = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={sidebarBtnStyle(active)}>{icon} {label}</button>
);

const MobileNavItem = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: active ? '#4318FF' : '#A3AED0', transition: '0.2s' }}>
    <div>{icon}</div>
    <span style={{ fontSize: '10px', fontWeight: active ? '700' : '500' }}>{label}</span>
  </button>
);

export default App;