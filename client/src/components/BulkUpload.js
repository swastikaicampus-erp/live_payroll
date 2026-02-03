import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, CheckCircle, AlertCircle, ArrowLeft, Info } from 'lucide-react';

const BulkUpload = ({ onBack }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleUpload = async () => {
    if (!file) {
      setStatus({ type: 'error', msg: 'Please select a CSV file first.' });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://76.13.192.122:5001/api/payroll/api/payroll/bulk-upload', formData);
      setStatus({ type: 'success', msg: '✅ USB Data Synced Successfully!' });
      setFile(null);
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ Upload Failed. Please check the file format.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section - Uniform with other pages */}
      <div style={styles.headerCard}>
        <div style={styles.headerFlex}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {onBack && (
              <button onClick={onBack} style={styles.btnSync}>
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h4 style={styles.title}>USB Bulk Import</h4>
              <p style={styles.subtitle}>Sync attendance data from your biometric device.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Card */}
      <div style={styles.tableCard}>
        <div style={styles.contentBody}>
          <div style={styles.infoBox}>
            <Info size={18} color="#4f46e5" />
            <span style={{ fontSize: '13px', color: '#4338ca' }}>
              Ensure your CSV file contains <strong>Employee ID</strong> and <strong>Timestamps</strong>.
            </span>
          </div>

          <div 
            style={{
              ...styles.uploadArea,
              borderColor: file ? '#4f46e5' : '#e2e8f0',
              backgroundColor: file ? '#f5f7ff' : '#f8fafc'
            }}
          >
            <input 
              type="file" 
              onChange={(e) => {
                setFile(e.target.files[0]);
                setStatus({ type: '', msg: '' });
              }} 
              accept=".csv" 
              style={styles.hiddenInput}
              id="csv-upload"
            />
            <label htmlFor="csv-upload" style={styles.uploadLabel}>
              <div style={styles.iconCircle}>
                <UploadCloud size={32} color={file ? '#4f46e5' : '#94a3b8'} />
              </div>
              <span style={styles.uploadTitle}>
                {file ? file.name : 'Click to upload or drag and drop'}
              </span>
              <span style={styles.uploadSubtitle}>CSV files only (Max. 5MB)</span>
            </label>
          </div>

          {status.msg && (
            <div style={{
              ...styles.statusBanner,
              backgroundColor: status.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: status.type === 'success' ? '#166534' : '#991b1b',
              border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecaca'}`
            }}>
              {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {status.msg}
            </div>
          )}

          <div style={styles.footer}>
            <button 
              onClick={handleUpload} 
              disabled={loading || !file}
              style={{
                ...styles.btnPrimary,
                opacity: (loading || !file) ? 0.6 : 1,
                cursor: (loading || !file) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing...' : 'Start Syncing Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusing the same Style Object for Global Consistency
const styles = {
  container: { padding: '24px', backgroundColor: '#fcfcfd', minHeight: '80vh' },
  headerCard: {
    backgroundColor: '#fff', padding: '20px', borderRadius: '12px',
    border: '1px solid #e2e8f0', marginBottom: '20px'
  },
  headerFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '20px', fontWeight: '700', margin: 0, color: '#1e293b' },
  subtitle: { fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' },
  btnSync: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
    backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer'
  },
  tableCard: {
    backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', maxWidth: '600px', margin: '0 auto'
  },
  contentBody: { padding: '32px' },
  infoBox: {
    display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#eef2ff', 
    padding: '12px', borderRadius: '8px', marginBottom: '24px'
  },
  uploadArea: {
    border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '40px 20px',
    textAlign: 'center', transition: 'all 0.2s ease', position: 'relative'
  },
  hiddenInput: { position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', top: 0, left: 0 },
  uploadLabel: { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  iconCircle: {
    width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  },
  uploadTitle: { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' },
  uploadSubtitle: { fontSize: '13px', color: '#94a3b8' },
  statusBanner: {
    marginTop: '20px', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
  },
  footer: { marginTop: '32px', display: 'flex', justifyContent: 'center' },
  btnPrimary: {
    backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '12px 40px',
    borderRadius: '8px', fontWeight: '600', fontSize: '14px', transition: 'background 0.2s'
  }
};

export default BulkUpload;