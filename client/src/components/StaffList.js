import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Edit, Search, RefreshCw, UserPlus, Phone, CreditCard, Briefcase, Hash, Clock, Image as ImageIcon, ExternalLink } from 'lucide-react';
import AddEmployee from './AddEmployee';

const StaffList = () => {
    const [staff, setStaff] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const API_BASE = 'http://76.13.192.122:5001/api/payroll';
    const IMAGE_BASE = 'http://76.13.192.122:5001';

    useEffect(() => {
        fetchStaff();
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
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

    const handleDelete = async (id) => {
        if (window.confirm("⚠️ Are you sure? This will permanently delete the employee.")) {
            try {
                await axios.delete(`${API_BASE}/employee/${id}`);
                alert("✅ Employee deleted successfully");
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

    const handleAddClick = () => {
        setEditingEmployee(null);
        setIsEditModalOpen(true);
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
                onBack={() => {
                    setIsEditModalOpen(false);
                    setEditingEmployee(null);
                }} 
                onEmployeeAdded={() => {
                    setIsEditModalOpen(false);
                    setEditingEmployee(null);
                    fetchStaff();
                }}
            />
        );
    }

    return (
        <div style={{...styles.container, padding: isMobile ? '10px' : '24px'}}>
            <div style={styles.headerCard}>
                <div style={{...styles.headerFlex, flexDirection: isMobile ? 'column' : 'row', gap: '15px'}}>
                    <div>
                        <h4 style={styles.title}>Staff Management</h4>
                        <p style={styles.subtitle}>{staff.length} Total Employees Registered</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
                        <button onClick={fetchStaff} style={{...styles.btnSync, flex: 1}}>
                            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Sync
                        </button>
                        <button onClick={handleAddClick} style={{...styles.btnAdd, flex: 1}}>
                            <UserPlus size={16} /> Add New
                        </button>
                    </div>
                </div>
            </div>

            <div style={styles.searchBarContainer}>
                <div style={styles.searchWrapper}>
                    <Search size={18} style={styles.searchIcon} />
                    <input
                        type="text"
                        style={styles.searchInput}
                        placeholder="Search by name, ID or post..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={isMobile ? {} : styles.tableCard}>
                {loading ? (
                    <div style={styles.emptyMsg}>Loading records...</div>
                ) : filteredStaff.length > 0 ? (
                    isMobile ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredStaff.map(emp => (
                                <div key={emp._id} style={styles.mobileCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={styles.nameContainer}>
                                            <div style={styles.avatar}>
                                                {emp.profilePhoto ? <img src={`${IMAGE_BASE}/${emp.profilePhoto}`} style={styles.avatarImg} alt="" /> : emp.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={styles.nameText}>{emp.name}</div>
                                                <div style={styles.postText}>{emp.post}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button style={{ ...styles.iconBtn, color: '#6366f1' }} onClick={() => handleEditClick(emp)}><Edit size={18} /></button>
                                            <button style={{ ...styles.iconBtn, color: '#ef4444' }} onClick={() => handleDelete(emp._id)}><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                    
                                    <div style={styles.infoGridMobile}>
                                        <div style={styles.infoItem}><Hash size={12}/> ID: {emp.employeeId}</div>
                                        <div style={styles.infoItem}><Phone size={12}/> {emp.mobileNo}</div>
                                        <div style={styles.infoItem}>
                                            <ImageIcon size={12}/> <a href={`${IMAGE_BASE}/${emp.aadharFront}`} target="_blank" rel="noreferrer" style={styles.mobileLink}>Aadhaar Front</a>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <ImageIcon size={12}/> <a href={`${IMAGE_BASE}/${emp.aadharBack}`} target="_blank" rel="noreferrer" style={styles.mobileLink}>Aadhaar Back</a>
                                        </div>
                                    </div>

                                    <div style={styles.cardFooter}>
                                        <div style={styles.salaryValue}>₹{emp.baseSalary?.toLocaleString()}</div>
                                        <div style={styles.shiftBadge}>{emp.shiftStart} - {emp.shiftEnd}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Employee</th>
                                        <th style={styles.th}>Designation</th>
                                        <th style={styles.th}>Identity Docs</th>
                                        <th style={styles.th}>Salary & Shift</th>
                                        <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.map(emp => (
                                        <tr key={emp._id} className="staff-row">
                                            <td style={styles.td}>
                                                <div style={styles.nameContainer}>
                                                    <div style={styles.avatar}>
                                                        {emp.profilePhoto ? <img src={`${IMAGE_BASE}/${emp.profilePhoto}`} style={styles.avatarImg} alt="" /> : emp.name?.charAt(0)}
                                                    </div>
                                                    <div style={styles.nameText}>{emp.name} <br/> <small style={{color: '#8f9bba'}}>ID: {emp.employeeId}</small></div>
                                                </div>
                                            </td>
                                            <td style={styles.td}><span style={styles.postBadge}>{emp.post}</span></td>
                                            <td style={styles.td}>
                                                <div style={{display: 'flex', gap: '5px', marginBottom: '5px'}}>
                                                    <a href={`${IMAGE_BASE}/${emp.aadharFront}`} target="_blank" rel="noreferrer" style={styles.docBtn}>Front <ExternalLink size={10}/></a>
                                                    <a href={`${IMAGE_BASE}/${emp.aadharBack}`} target="_blank" rel="noreferrer" style={styles.docBtn}>Back <ExternalLink size={10}/></a>
                                                </div>
                                                <div style={{fontSize: '11px', color: '#64748b'}}><CreditCard size={10}/> PAN: {emp.panNo}</div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.salaryValue}>₹{emp.baseSalary?.toLocaleString()}</div>
                                                <div style={{fontSize: '12px', color: '#64748b'}}><Clock size={12}/> {emp.shiftStart}-{emp.shiftEnd}</div>
                                            </td>
                                            <td style={{ ...styles.td, textAlign: 'right' }}>
                                                <button style={{ ...styles.iconBtn, color: '#6366f1' }} onClick={() => handleEditClick(emp)}><Edit size={16} /></button>
                                                <button style={{ ...styles.iconBtn, color: '#ef4444' }} onClick={() => handleDelete(emp._id)}><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    <div style={styles.emptyMsg}>No employees found.</div>
                )}
            </div>

            <style>{`
                .spin { animation: rotate 1s linear infinite; }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .staff-row:hover { background-color: #f8fafc; }
            `}</style>
        </div>
    );
};

const styles = {
    container: { backgroundColor: '#fcfcfd', minHeight: '100vh' },
    headerCard: { backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '15px' },
    headerFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '18px', fontWeight: '800', margin: 0, color: '#1B2559' },
    subtitle: { fontSize: '12px', color: '#707EAE', margin: '2px 0 0 0' },
    btnSync: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' },
    btnAdd: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#4318FF', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' },
    tableCard: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' },
    searchBarContainer: { marginBottom: '15px' },
    searchWrapper: { position: 'relative' },
    searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A3AED0' },
    searchInput: { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #E0E5F2', outline: 'none', fontSize: '14px', boxSizing: 'border-box' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '14px 20px', backgroundColor: '#F4F7FE', fontSize: '12px', textTransform: 'uppercase', color: '#8F9BBA', fontWeight: '700' },
    td: { padding: '16px 20px', fontSize: '14px', color: '#1B2559', borderBottom: '1px solid #f1f5f9' },
    nameContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
    avatar: { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#F4F7FE', color: '#4318FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' },
    avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    nameText: { fontWeight: '700', color: '#1B2559' },
    postBadge: { backgroundColor: '#EEF2FF', color: '#4318FF', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
    salaryValue: { fontWeight: '800', color: '#1B2559' },
    shiftBadge: { backgroundColor: '#F4F7FE', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: '#4318FF' },
    docBtn: { fontSize: '10px', textDecoration: 'none', backgroundColor: '#f8fafc', color: '#4318FF', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '3px' },
    iconBtn: { border: 'none', background: 'none', cursor: 'pointer', padding: '8px' },
    emptyMsg: { textAlign: 'center', padding: '40px', color: '#A3AED0' },
    mobileCard: { backgroundColor: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '10px' },
    infoGridMobile: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '12px 0', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px' },
    infoItem: { fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' },
    mobileLink: { color: '#4318FF', textDecoration: 'none', fontWeight: '600' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }
};

export default StaffList;