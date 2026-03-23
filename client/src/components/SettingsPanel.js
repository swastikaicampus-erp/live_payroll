import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Settings, ArrowLeft, Loader2, Edit, Trash2, Info, Clock, Percent } from 'lucide-react';

const SettingsPanel = ({ onBack }) => {
    const [config, setConfig] = useState({ 
        lateFinePerMinute: '', 
        overtimePayPerHour: '',
        halfDayThresholdHours: '', 
        halfDayPayFactor: ''       
    });
    const [settingsList, setSettingsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [editId, setEditId] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        fetchSettings();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/payroll-api/payroll/settings');
            const data = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
            setSettingsList(data);
            if (data.length > 0) {
                setConfig({
                    lateFinePerMinute: data[0].lateFinePerMinute || '',
                    overtimePayPerHour: data[0].overtimePayPerHour || '',
                    halfDayThresholdHours: data[0].halfDayThresholdHours || '',
                    halfDayPayFactor: data[0].halfDayPayFactor || ''
                });
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        const { lateFinePerMinute, overtimePayPerHour, halfDayThresholdHours, halfDayPayFactor } = config;
        if (lateFinePerMinute === '' || overtimePayPerHour === '' || halfDayThresholdHours === '' || halfDayPayFactor === '') {
            return alert("All fields are required!");
        }
        
        setLoading(true);
        try {
            await axios.post('/payroll-api/payroll/settings', config);
            alert("✅ Settings Updated Successfully!");
            setEditId(null);
            fetchSettings();
        } catch (err) {
            alert("❌ Save failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will reset payroll rules.")) return;
        try {
            await axios.delete(`/payroll-api/payroll/settings/${id}`);
            alert("✅ Deleted!");
            fetchSettings();
            setConfig({ lateFinePerMinute: '', overtimePayPerHour: '', halfDayThresholdHours: '', halfDayPayFactor: '' });
            setEditId(null);
        } catch (err) {
            alert("❌ Delete failed");
        }
    };

    const handleEdit = (item) => {
        setConfig({ 
            lateFinePerMinute: item.lateFinePerMinute, 
            overtimePayPerHour: item.overtimePayPerHour,
            halfDayThresholdHours: item.halfDayThresholdHours || '',
            halfDayPayFactor: item.halfDayPayFactor || ''
        });
        setEditId(item._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (fetching) return <div style={styles.loader}><Loader2 className="animate-spin" size={30} /> <span>Loading Settings...</span></div>;

    return (
        <div style={{ ...styles.container, padding: isMobile ? '12px' : '25px' }}>
            {/* Header */}
            <div style={styles.headerArea}>
                <button onClick={onBack} style={styles.btnBack}><ArrowLeft size={20} /></button>
                <div>
                    <h2 style={styles.mainTitle}>Payroll Rules</h2>
                    <p style={styles.subtitle}>Manage late fines, OT, and Half-Day rules</p>
                </div>
            </div>

            {/* Form Card */}
            <div style={styles.formCard}>
                <div style={styles.cardHeader}>
                    <Settings size={20} color="#4318FF" />
                    <span style={{ fontWeight: '800', color: '#1B2559' }}>{editId ? "Update Calculation Rules" : "Set New Rules"}</span>
                </div>
                <div style={styles.cardBody}>
                    <div style={{ ...styles.grid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                        {/* Late Fine */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Late Fine (Per Minute)</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>₹</span>
                                <input
                                    type="number"
                                    style={styles.input}
                                    placeholder="e.g. 5"
                                    value={config.lateFinePerMinute}
                                    onChange={(e) => setConfig({ ...config, lateFinePerMinute: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* OT Pay */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>OT Pay (Per Hour)</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>₹</span>
                                <input
                                    type="number"
                                    style={styles.input}
                                    placeholder="e.g. 150"
                                    value={config.overtimePayPerHour}
                                    onChange={(e) => setConfig({ ...config, overtimePayPerHour: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Half Day Threshold */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Half Day Limit (Min Hours)</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}><Clock size={16} color="#4318FF"/></span>
                                <input
                                    type="number"
                                    style={styles.input}
                                    placeholder="e.g. 4"
                                    value={config.halfDayThresholdHours}
                                    onChange={(e) => setConfig({ ...config, halfDayThresholdHours: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Half Day Pay Factor */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Half Day Pay (0.5 = 50%)</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}><Percent size={16} color="#4318FF"/></span>
                                <input
                                    type="number"
                                    step="0.1"
                                    style={styles.input}
                                    placeholder="e.g. 0.5"
                                    value={config.halfDayPayFactor}
                                    onChange={(e) => setConfig({ ...config, halfDayPayFactor: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <button disabled={loading} onClick={handleSave} style={{ ...styles.btnPrimary, width: isMobile ? '100%' : 'max-content' }}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {editId ? "Update Changes" : "Save Configuration"}
                    </button>
                </div>
            </div>

            {/* History Section */}
            <div style={styles.tableCard}>
                <div style={styles.tableHeader}>
                    <Info size={18} color="#707EAE" />
                    <span>Active Configurations</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Late Fine</th>
                                <th style={styles.th}>OT Rate</th>
                                <th style={styles.th}>Half-Day (Hrs/Rate)</th>
                                <th style={styles.th}>Status</th>
                                <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {settingsList.map((item, index) => (
                                <tr key={index} style={styles.row}>
                                    <td style={styles.td}>₹{item.lateFinePerMinute}<small>/min</small></td>
                                    <td style={styles.td}>₹{item.overtimePayPerHour}<small>/hr</small></td>
                                    <td style={styles.td}>{item.halfDayThresholdHours}h / {item.halfDayPayFactor * 100}%</td>
                                    <td style={styles.td}>
                                        <span style={styles.activeBadge}>Active</span>
                                    </td>
                                    <td style={{ ...styles.td, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleEdit(item)} style={styles.btnEdit}><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(item._id)} style={styles.btnDelete}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {settingsList.length === 0 && (
                    <div style={styles.noData}>No settings configured yet.</div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { backgroundColor: '#F4F7FE', minHeight: '100vh' },
    headerArea: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' },
    btnBack: { border: 'none', background: '#fff', padding: '10px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    mainTitle: { margin: 0, fontSize: '22px', color: '#1B2559', fontWeight: '800' },
    subtitle: { margin: 0, fontSize: '13px', color: '#707EAE' },

    formCard: { backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', overflow: 'hidden', marginBottom: '25px' },
    cardHeader: { padding: '15px 20px', borderBottom: '1px solid #F4F7FE', display: 'flex', alignItems: 'center', gap: '10px' },
    cardBody: { padding: '20px' },
    grid: { display: 'grid', gap: '20px', marginBottom: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '12px', fontWeight: '700', color: '#707EAE', textTransform: 'uppercase' },
    inputWrapper: { display: 'flex', alignItems: 'center', background: '#F4F7FE', borderRadius: '12px', padding: '2px 12px', border: '1px solid #E0E5F2' },
    inputIcon: { fontWeight: 'bold', color: '#4318FF', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' },
    input: { background: 'none', border: 'none', padding: '12px', width: '100%', outline: 'none', fontSize: '15px', fontWeight: '600', color: '#1B2559' },
    
    btnPrimary: { 
        backgroundColor: '#4318FF', color: '#fff', border: 'none', padding: '14px 28px', 
        borderRadius: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.3s' 
    },

    tableCard: { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #E0E5F2', overflow: 'hidden' },
    tableHeader: { padding: '15px 20px', borderBottom: '1px solid #F4F7FE', fontSize: '14px', fontWeight: '700', color: '#1B2559', display: 'flex', alignItems: 'center', gap: '8px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '15px 20px', backgroundColor: '#F8FAFC', color: '#A3AED0', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' },
    td: { padding: '15px 20px', borderBottom: '1px solid #F4F7FE', fontSize: '14px', fontWeight: '600', color: '#1B2559' },
    activeBadge: { backgroundColor: '#E2FBEA', color: '#05CD99', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' },
    btnEdit: { color: '#4318FF', background: '#F4F7FE', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' },
    btnDelete: { color: '#EE5D50', background: '#FFF5F5', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' },
    
    loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '10px', color: '#4318FF' },
    noData: { padding: '30px', textAlign: 'center', color: '#A3AED0', fontSize: '14px' }
};

export default SettingsPanel;