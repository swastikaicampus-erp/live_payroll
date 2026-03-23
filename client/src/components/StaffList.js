import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Trash2, Edit, Search, RefreshCw, UserPlus,
    ExternalLink, Wallet
} from 'lucide-react';
import AddEmployee from './AddEmployee';
import EmployeeDashboard from './EmployeeDashboard';

const StaffList = () => {
    const [staff, setStaff] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
    const [payrollDetails, setPayrollDetails] = useState(null);

    const API_BASE = '/payroll-api/payroll';
    // ✅ NEW
    const IMAGE_BASE = '/uploads';

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        fetchStaff();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/employees`);
            setStaff(res.data);
        } catch (err) {
            console.error("Error fetching staff:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGiveAdvance = async (empId) => {
        const amount = window.prompt("Enter Advance Amount to Give (₹):");
        if (!amount || isNaN(amount) || Number(amount) <= 0) return;
        try {
            await axios.put(`${API_BASE}/employee/advance/${empId}`, {
                amount: -Math.abs(Number(amount))
            });
            alert(`₹${amount} Advance added successfully!`);
            fetchStaff();
        } catch (err) {
            alert("Error updating advance!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("⚠️ Are you sure?")) {
            try {
                await axios.delete(`${API_BASE}/employee/${id}`);
                fetchStaff();
            } catch (err) {
                alert("❌ Error deleting!");
            }
        }
    };

    const handleEditClick = (employee) => {
        setEditingEmployee(employee);
        setIsEditModalOpen(true);
    };

    const handleViewDashboard = (emp) => {
        setPayrollDetails(emp);
        setIsSalaryModalOpen(true);
    };

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.employeeId.toString().includes(searchTerm) ||
        (s.post && s.post.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isEditModalOpen) {
        return (
            <AddEmployee
                initialData={editingEmployee}
                onBack={() => setIsEditModalOpen(false)}
                onEmployeeAdded={() => {
                    setIsEditModalOpen(false);
                    fetchStaff();
                }}
            />
        );
    }

    return (
        <div style={{ ...styles.container, padding: isMobile ? '12px' : '24px' }}>
            {/* Header */}
            <div style={styles.headerCard}>
                <div style={{ ...styles.headerFlex, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center' }}>
                    <div style={{ marginBottom: isMobile ? '10px' : '0' }}>
                        <h4 style={styles.title}>Staff Management</h4>
                        <p style={styles.subtitle}>{staff.length} Employees Registered</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                        <button onClick={fetchStaff} style={{ ...styles.btnSync, flex: isMobile ? 1 : 'unset' }}>
                            <RefreshCw size={16} className={loading ? 'spin' : ''} /> {isMobile ? 'Sync' : ''}
                        </button>
                        <button onClick={() => setIsEditModalOpen(true)} style={{ ...styles.btnAdd, flex: isMobile ? 2 : 'unset' }}>
                            <UserPlus size={16} /> Add Staff
                        </button>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div style={styles.searchBarContainer}>
                <div style={styles.searchWrapper}>
                    <Search size={18} style={styles.searchIcon} />
                    <input
                        type="text"
                        style={styles.searchInput}
                        placeholder="Search name, ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div style={isMobile ? styles.mobileContainer : styles.tableCard}>
                {loading ? (
                    <div style={styles.emptyMsg}>Loading...</div>
                ) : (
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ ...styles.table, minWidth: isMobile ? '600px' : '100%' }}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Employee</th>
                                    <th style={styles.th}>Post</th>
                                    <th style={styles.th}>Documents</th>
                                    <th style={styles.th}>Advance</th>
                                    <th style={styles.th}>Salary</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.map(emp => (
                                    <tr key={emp._id} className="staff-row">
                                        <td style={styles.td}>
                                            <div style={styles.nameContainer}>
                                                <div style={styles.avatar}>
                                                    {emp.profilePhoto ? <img src={`/${emp.profilePhoto}`} style={styles.avatarImg} alt="" /> : emp.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={styles.nameText}>{emp.name}</div>
                                                    <small style={{ color: '#8f9bba' }}>#{emp.employeeId}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}><span style={styles.postBadge}>{emp.post}</span></td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <a href={`${IMAGE_BASE}/${emp.aadharFront}`} target="_blank" rel="noreferrer" style={styles.docBtn}>F</a>
                                                <a href={`${IMAGE_BASE}/${emp.aadharBack}`} target="_blank" rel="noreferrer" style={styles.docBtn}>B</a>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ color: '#e67e22', fontWeight: '700' }}>₹{emp.advanceBalance || 0}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.salaryValue}>₹{emp.baseSalary}</div>
                                        </td>
                                        <td style={{ ...styles.td, textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                                <button title="Advance" style={{ ...styles.iconBtn, color: '#f59e0b' }} onClick={() => handleGiveAdvance(emp._id)}><Wallet size={16} /></button>
                                                <button title="View" style={{ ...styles.iconBtn, color: '#10b981' }} onClick={() => handleViewDashboard(emp)}><ExternalLink size={16} /></button>
                                                <button style={{ ...styles.iconBtn, color: '#6366f1' }} onClick={() => handleEditClick(emp)}><Edit size={16} /></button>
                                                <button style={{ ...styles.iconBtn, color: '#ef4444' }} onClick={() => handleDelete(emp._id)}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isSalaryModalOpen && (
                <EmployeeDashboard data={payrollDetails} onClose={() => setIsSalaryModalOpen(false)} />
            )}

            <style>{`
                .spin { animation: rotate 1s linear infinite; }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .staff-row:hover { background-color: #f8fafc; }
                ::-webkit-scrollbar { height: 4px; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; borderRadius: 10px; }
            `}</style>
        </div>
    );
};

const styles = {
    container: { backgroundColor: '#fcfcfd', minHeight: '100vh', boxSizing: 'border-box' },
    headerCard: { backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '15px' },
    headerFlex: { display: 'flex', justifyContent: 'space-between' },
    title: { fontSize: '18px', fontWeight: '800', margin: 0, color: '#1B2559' },
    subtitle: { fontSize: '12px', color: '#707EAE', margin: '2px 0 0 0' },
    btnSync: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer' },
    btnAdd: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#4318FF', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
    tableCard: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' },
    mobileContainer: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' },
    searchBarContainer: { marginBottom: '15px' },
    searchWrapper: { position: 'relative' },
    searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A3AED0' },
    searchInput: { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #E0E5F2', outline: 'none', boxSizing: 'border-box' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 15px', backgroundColor: '#F4F7FE', fontSize: '11px', textTransform: 'uppercase', color: '#8F9BBA', fontWeight: '700' },
    td: { padding: '12px 15px', fontSize: '13px', color: '#1B2559', borderBottom: '1px solid #f1f5f9' },
    nameContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
    avatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F4F7FE', color: '#4318FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden', flexShrink: 0 },
    avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    nameText: { fontWeight: '700', lineHeight: '1.2' },
    postBadge: { backgroundColor: '#EEF2FF', color: '#4318FF', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', whiteSpace: 'nowrap' },
    salaryValue: { fontWeight: '700' },
    docBtn: { textDecoration: 'none', backgroundColor: '#f8fafc', color: '#4318FF', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '10px' },
    iconBtn: { border: 'none', background: 'none', cursor: 'pointer', padding: '4px' },
    emptyMsg: { textAlign: 'center', padding: '20px', color: '#A3AED0' }
};

export default StaffList;