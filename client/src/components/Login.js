import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Loader2, ArrowRight, Mail, Lock } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const isMobile = windowWidth <= 768;

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                console.log("Logged in!");
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                alert("✅ Account created successfully!");
            }
        } catch (error) {
            let msg = "An error occurred";
            if (error.code === 'auth/email-already-in-use') msg = "Email already registered.";
            if (error.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
            if (error.code === 'auth/invalid-credential') msg = "Invalid Email or Password.";
            alert("❌ " + msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.pageWrapper}>
            {/* Background Blobs */}
            <div style={styles.blob1}></div>
            <div style={styles.blob2}></div>

            <div className="auth-card" style={{ 
                ...styles.card, 
                padding: isMobile ? '30px 20px' : '48px',
                maxWidth: isMobile ? '80%' : '440px'
            }}>
                {/* Branding Section */}
                <div style={styles.brandSection}>
                    <div style={styles.logoContainer}>
                        <img 
                            src="/goldberry_tech.png" 
                            alt="Goldberry Tech Logo" 
                            style={{ 
                                height: isMobile ? '80px' : '70px',
                                width: 'auto',
                                objectFit: 'contain'
                            }} 
                        />
                    </div>
                    <h1 style={{ ...styles.mainTitle, fontSize: isMobile ? '24px' : '30px' }}>
                        {isLogin ? 'Welcome Back' : 'Get Started'}
                    </h1>
                    <p style={styles.subTitle}>
                        {isLogin ? 'Sign in to manage your organization' : 'Create an admin account to begin'}
                    </p>
                </div>

                {/* Tab System */}
                <div style={styles.tabTrack}>
                    <div 
                        className="tab-indicator" 
                        style={{ 
                            ...styles.tabIndicator, 
                            left: isLogin ? '4px' : 'calc(50% + 2px)' 
                        }} 
                    />
                    <button 
                        type="button"
                        onClick={() => setIsLogin(true)} 
                        style={{ ...styles.tabBtn, color: isLogin ? '#1B2559' : '#A3AED0' }}
                    >
                        Login
                    </button>
                    <button 
                        type="button"
                        onClick={() => setIsLogin(false)} 
                        style={{ ...styles.tabBtn, color: !isLogin ? '#1B2559' : '#A3AED0' }}
                    >
                        Register
                    </button>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputField}>
                        <label style={styles.label}>Email Address</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={18} style={styles.inputIcon} />
                            <input 
                                type="email" 
                                placeholder="name@company.com" 
                                style={styles.input}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <div style={styles.inputField}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label style={styles.label}>Password</label>
                            {isLogin && <span style={styles.forgotText}>Forgot?</span>}
                        </div>
                        <div style={styles.inputWrapper}>
                            <Lock size={18} style={styles.inputIcon} />
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                style={styles.input}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="main-submit-btn" 
                        style={styles.submitBtn}
                    >
                        {loading ? (
                            <Loader2 size={20} className="spin" />
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                            </span>
                        )}
                    </button>
                </form>

                <p style={styles.footerText}>
                    By continuing, you agree to our <b>Terms of Service</b>
                </p>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .auth-card { animation: cardEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes cardEntrance {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .main-submit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px rgba(67, 24, 255, 0.3);
                    background-color: #3311DB !important;
                }
                input:focus {
                    border-color: #4318FF !important;
                    background: #fff !important;
                    box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.08);
                }
                .tab-indicator { transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
                .spin { animation: rotate 1s linear infinite; }
                @keyframes rotate { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const styles = {
    pageWrapper: {
        height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#F4F7FE', position: 'relative', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif"
    },
    blob1: { position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'linear-gradient(135deg, #4318FF 0%, #BCCEF8 100%)', top: '-150px', left: '-100px', opacity: 0.15, filter: 'blur(80px)' },
    blob2: { position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: '#4318FF', bottom: '-100px', right: '-50px', opacity: 0.1, filter: 'blur(80px)' },
    card: {
        width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)',
        borderRadius: '40px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 40px 100px rgba(112, 144, 176, 0.12)', zIndex: 10
    },
    brandSection: { textAlign: 'left', marginBottom: '32px' },
    logoContainer: { marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    mainTitle: { fontWeight: '800', color: '#1B2559', margin: '0 0 8px 0', letterSpacing: '-1px' },
    subTitle: { fontSize: '15px', color: '#A3AED0', margin: 0, fontWeight: '500' },
    tabTrack: { display: 'flex', backgroundColor: '#F4F7FE', padding: '4px', borderRadius: '18px', position: 'relative', marginBottom: '32px' },
    tabIndicator: { position: 'absolute', height: 'calc(100% - 8px)', width: 'calc(50% - 6px)', backgroundColor: '#fff', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', zIndex: 1 },
    tabBtn: { flex: 1, padding: '12px', border: 'none', backgroundColor: 'transparent', fontSize: '15px', fontWeight: '700', cursor: 'pointer', zIndex: 2, transition: '0.3s' },
    form: { display: 'flex', flexDirection: 'column', gap: '24px' },
    inputField: { display: 'flex', flexDirection: 'column', gap: '10px' },
    label: { fontSize: '14px', fontWeight: '700', color: '#1B2559', marginLeft: '4px' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: '18px', color: '#A3AED0' },
    input: { width: '100%', padding: '16px 16px 16px 52px', borderRadius: '18px', border: '2px solid #E0E5F2', outline: 'none', backgroundColor: '#F9FAFB', fontSize: '15px', fontWeight: '500', boxSizing: 'border-box' },
    forgotText: { fontSize: '13px', color: '#4318FF', fontWeight: '700', cursor: 'pointer' },
    submitBtn: { padding: '18px', borderRadius: '20px', border: 'none', backgroundColor: '#4318FF', color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: '0.3s' },
    footerText: { textAlign: 'center', marginTop: '32px', fontSize: '13px', color: '#A3AED0', fontWeight: '500' }
};

export default Auth;