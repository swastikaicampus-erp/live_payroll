import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, IndianRupee, Clock, Hash, User, Loader2, Briefcase, ArrowLeft, Phone, CreditCard, Image as ImageIcon, X } from 'lucide-react';

const AddEmployee = ({ onEmployeeAdded, onBack, initialData }) => {
  const [formData, setFormData] = useState({
    name: '', employeeId: '', baseSalary: '', shiftStart: '09:00', shiftEnd: '18:00',
    mobileNo: '', panNo: '', aadharNo: '', post: '',
  });

  const [files, setFiles] = useState({ profilePhoto: null, aadharFront: null, aadharBack: null });
  const [previews, setPreviews] = useState({ profilePhoto: null, aadharFront: null, aadharBack: null });
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isMobile = windowWidth <= 768;

  // FIXED: Yeh sirf ek baar run hoga jab component mount hoga ya initialData ka ID badlega
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        employeeId: initialData.employeeId || '',
        baseSalary: initialData.baseSalary || '',
        shiftStart: initialData.shiftStart || '09:00',
        shiftEnd: initialData.shiftEnd || '18:00',
        mobileNo: initialData.mobileNo || '',
        panNo: initialData.panNo || '',
        aadharNo: initialData.aadharNo || '',
        post: initialData.post || '',
      });
    }
  }, [initialData?._id]); // Only run if ID changes

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    if (file) {
      setFiles(prev => ({ ...prev, [name]: file }));
      setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

// handleSubmit function ko isse replace karein
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Basic validation before sending
  if (formData.aadharNo.length !== 12) {
    alert("❌ Aadhaar Number must be exactly 12 digits");
    return;
  }

  setLoading(true);
  const data = new FormData();

  // 1. Text Data append karein
  Object.keys(formData).forEach(key => {
    data.append(key, formData[key]);
  });

  // 2. Files append karein (Spelling should match Multer field names)
  if (files.profilePhoto) data.append('profilePhoto', files.profilePhoto);
  if (files.aadharFront) data.append('aadharFront', files.aadharFront);
  if (files.aadharBack) data.append('aadharBack', files.aadharBack);

  try {
    const isEdit = !!initialData?._id;
    const url = isEdit 
      ? `http://76.13.192.122:5001/api/payroll/employee/${initialData._id}`
      : 'http://76.13.192.122:5001/api/payroll/employee';
    
    const method = isEdit ? 'put' : 'post';

    // FormData ke liye hamesha headers specify karna behtar hota hai
    await axios({
      method: method,
      url: url,
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    alert(`✅ Employee ${isEdit ? 'Updated' : 'Registered'} Successfully`);
    if (onEmployeeAdded) onEmployeeAdded();
    if (onBack) onBack(); // Form close karne ke liye
  } catch (err) {
    console.error("Full Error:", err.response?.data);
    const errorMsg = err.response?.data?.error || err.message;
    alert('❌ Failed: ' + errorMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ ...styles.container, padding: isMobile ? '10px' : '25px' }}>
      <div style={styles.headerCard}>
        <button onClick={onBack} style={styles.btnBack}><ArrowLeft size={18} /></button>
        <div style={{ flex: 1 }}>
          <h4 style={styles.title}>{initialData ? 'Edit Employee' : 'New Registration'}</h4>
          <p style={styles.subtitle}>Complete personal and biometric info</p>
        </div>
      </div>

      <div style={styles.formCard}>
        <form onSubmit={handleSubmit} style={styles.formBody}>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}><Briefcase size={18} color="#4f46e5" /> Professional Details</h2>
            <div style={{ ...styles.responsiveGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <div style={styles.inputWrapper}>
                  <User size={18} style={styles.inputIcon} />
                  <input style={styles.input} value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Designation</label>
                <div style={styles.inputWrapper}>
                  <Briefcase size={18} style={styles.inputIcon} />
                  <input style={styles.input} value={formData.post} onChange={(e) => handleInputChange('post', e.target.value)} required />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Machine ID</label>
                <div style={styles.inputWrapper}>
                  <Hash size={18} style={styles.inputIcon} />
                  <input type="number" style={styles.input} value={formData.employeeId} onChange={(e) => handleInputChange('employeeId', e.target.value)} required />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Base Salary</label>
                <div style={styles.inputWrapper}>
                 <IndianRupee size={18} style={styles.inputIcon} />
                  <input type="number" style={styles.input} value={formData.baseSalary} onChange={(e) => handleInputChange('baseSalary', e.target.value)} required />
                </div>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}><CreditCard size={18} color="#4f46e5" /> Identity & Contact</h2>
            <div style={{ ...styles.responsiveGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr' }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Mobile Number</label>
                <div style={styles.inputWrapper}>
                  <Phone size={18} style={styles.inputIcon} />
                  <input type="tel" style={styles.input} value={formData.mobileNo} onChange={(e) => handleInputChange('mobileNo', e.target.value)} required />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>PAN Number</label>
                <div style={styles.inputWrapper}>
                  <CreditCard size={18} style={styles.inputIcon} />
                  <input style={styles.input} value={formData.panNo} onChange={(e) => handleInputChange('panNo', e.target.value.toUpperCase())} required />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Aadhaar Number</label>
                <div style={styles.inputWrapper}>
                  <Hash size={18} style={styles.inputIcon} />
                  <input type="number" style={styles.input} value={formData.aadharNo} onChange={(e) => handleInputChange('aadharNo', e.target.value)} required />
                </div>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}><ImageIcon size={18} color="#4f46e5" /> Documents</h2>
            <div style={{ ...styles.responsiveGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr' }}>
              {['profilePhoto', 'aadharFront', 'aadharBack'].map((doc) => (
                <div key={doc}>
                  <label style={styles.label}>{doc.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
                  {previews[doc] ? (
                    <div style={styles.previewContainer}>
                       <img src={previews[doc]} alt="preview" style={styles.previewImg} />
                       <button type="button" onClick={() => setPreviews({...previews, [doc]: null})} style={styles.removeImg}><X size={12}/></button>
                    </div>
                  ) : (
                    <input type="file" name={doc} onChange={handleFileChange} style={styles.fileInput} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}><Clock size={18} color="#4f46e5" /> Shift Timing</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={styles.label}>Start</label>
                <input type="time" style={styles.inputSimple} value={formData.shiftStart} onChange={(e) => handleInputChange('shiftStart', e.target.value)} />
              </div>
              <div>
                <label style={styles.label}>End</label>
                <input type="time" style={styles.inputSimple} value={formData.shiftEnd} onChange={(e) => handleInputChange('shiftEnd', e.target.value)} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.btnSubmit}>
            {loading ? <Loader2 size={20} className="spin" /> : <Save size={20} />}
            {loading ? 'Processing...' : initialData ? 'Update Profile' : 'Register Employee'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%', boxSizing: 'border-box' },
  headerCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', border: '1px solid #e2e8f0' },
  btnBack: { padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: '#fff' },
  title: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' },
  subtitle: { margin: 0, fontSize: '13px', color: '#64748b' },
  formCard: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' },
  formBody: { padding: '20px' },
  section: { marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' },
  sectionTitle: { fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#1e293b' },
  responsiveGrid: { display: 'grid', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '2px' },
  inputWrapper: { position: 'relative', width: '100%' },
  inputIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' },
  input: { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', boxSizing: 'border-box', fontSize: '14px', outline: 'none' },
  inputSimple: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', boxSizing: 'border-box', fontSize: '14px' },
  fileInput: { fontSize: '11px', width: '100%', marginTop: '5px' },
  previewContainer: { position: 'relative', width: '60px', height: '60px', marginTop: '10px' },
  previewImg: { width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' },
  removeImg: { position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  btnSubmit: { width: '100%', padding: '16px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '15px', marginTop: '10px' }
};

export default AddEmployee;