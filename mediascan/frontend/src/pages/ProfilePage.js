import React from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  CheckCircle2, 
  Database, 
  Cpu, 
  Lock, 
  Bell, 
  Camera, 
  Zap, 
  Clock, 
  TrendingUp 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    return (
        <div style={{ 
            width: '100%', margin: '0 auto', padding: '48px 5vw',
            animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}>
            {/* Header Area */}
            <div style={{ marginBottom: '52px', borderBottom: '1px solid #e2e8f0', paddingBottom: '32px' }}>
                <h1 style={{ 
                    fontSize: '56px', fontWeight: 900, color: '#111827', 
                    fontFamily: "'Outfit', sans-serif", marginBottom: '12px',
                    letterSpacing: '-2px'
                }}>
                    {t('profile.heading')}
                </h1>
                <p style={{ fontSize: '24px', color: '#64748b', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                    {t('profile.subtitle')}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '48px' }}>
                
                {/* Profile Identity Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ 
                        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px',
                        padding: '48px 40px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 28px' }}>
                            <div style={{
                                width: '160px', height: '160px', borderRadius: '56px',
                                background: 'linear-gradient(135deg, #1a56db, #2563eb)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: '64px', fontWeight: 900,
                                boxShadow: '0 20px 40px rgba(26,86,219,0.25)'
                            }}>
                                {user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
                            </div>
                            <button style={{
                                position: 'absolute', bottom: '0', right: '0',
                                width: '48px', height: '48px', borderRadius: '16px',
                                background: '#1e293b', border: '4px solid #fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', cursor: 'pointer', transition: 'all 0.2s'
                            }} className="camera-btn">
                                <Camera size={20} />
                            </button>
                        </div>

                        <h2 style={{ fontSize: '52px', fontWeight: 900, color: '#111827', letterSpacing: '-2px', fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>{user?.name}</h2>
                        <div style={{ 
                            display: 'inline-flex', padding: '12px 24px', background: '#eff6ff', 
                            color: '#1a56db', borderRadius: '16px', fontSize: '20px', 
                            fontWeight: 900, marginTop: '16px', textTransform: 'uppercase', letterSpacing: '1.5px',
                            fontFamily: "'DM Sans', sans-serif", border: '1px solid rgba(26,86,219,0.1)'
                        }}>
                            {user?.role === 'admin' ? t('profile.role_admin') : t('profile.role_practitioner')}
                        </div>

                        <div style={{ marginTop: '48px', paddingTop: '40px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-around' }}>
                            <div>
                                <div style={{ fontSize: '48px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>24</div>
                                <div style={{ fontSize: '16px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('profile.stats_scans')}</div>
                            </div>
                            <div style={{ width: '1px', background: '#f1f5f9' }}></div>
                            <div>
                                <div style={{ fontSize: '48px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>98%</div>
                                <div style={{ fontSize: '16px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('profile.stats_accuracy')}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        background: '#1e293b', borderRadius: '32px', padding: '32px',
                        color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <Shield size={28} color="#38bdf8" />
                            <span style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'DM Sans', sans-serif" }}>{t('profile.security_metrics')}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{t('profile.2fa_status')}</span>
                                <span style={{ fontSize: '15px', background: '#059669', padding: '8px 16px', borderRadius: '10px', fontWeight: 1000 }}>{t('profile.active')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{t('profile.credentials_reset')}</span>
                                <span style={{ fontSize: '15px', color: '#cbd5e1', fontWeight: 1000 }}>{t('profile.days_ago')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Details & Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ 
                        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px',
                        padding: '48px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                    }}>
                        <h2 style={{ fontSize: '34px', fontWeight: 900, color: '#111827', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px', letterSpacing: '-1px' }}>
                            <Shield color="#1a56db" size={36} /> {t('profile.personal_info')}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <div style={inputContainer}>
                                <label style={labelStyle}>{t('profile.full_name')}</label>
                                <div style={valueStyle}>{user?.name}</div>
                            </div>
                            <div style={inputContainer}>
                                <label style={labelStyle}>{t('profile.email')}</label>
                                <div style={valueStyle}>{user?.email}</div>
                            </div>
                            <div style={inputContainer}>
                                <label style={labelStyle}>{t('profile.role')}</label>
                                <div style={valueStyle}>{user?.role?.toUpperCase()} {t('profile.access')}</div>
                            </div>
                            <div style={inputContainer}>
                                <label style={labelStyle}>{t('profile.uuid')}</label>
                                <div style={{ ...valueStyle, fontSize: '16px', fontFamily: 'monospace', fontWeight: 600 }}>{user?.id || 'AUTH_PROV_0821'}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px',
                        padding: '48px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                    }}>
                        <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', marginBottom: '32px', fontFamily: "'Outfit', sans-serif" }}>{t('profile.capabilities')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { title: t('profile.cap_diagnostic'), desc: t('profile.cap_diagnostic_desc'), icon: <Zap size={20} color="#1a56db" /> },
                                { title: t('profile.cap_archival'), desc: t('profile.cap_archival_desc'), icon: <Clock size={20} color="#1a56db" /> },
                                { title: t('profile.cap_analytics'), desc: t('profile.cap_analytics_desc'), icon: <TrendingUp size={20} color="#1a56db" /> }
                            ].map((item, idx) => (
                                <div key={idx} style={{ 
                                    padding: '24px', borderRadius: '20px', background: '#f8fafc', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ width: '64px', height: '64px', background: '#fff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
                                            {React.cloneElement(item.icon, { size: 32 })}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 900, fontSize: '22px', color: '#111827', fontFamily: "'Outfit', sans-serif" }}>{item.title}</div>
                                            <div style={{ fontSize: '20px', color: '#64748b', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>{item.desc}</div>
                                        </div>
                                    </div>
                                    <CheckCircle2 color="#059669" size={32} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .camera-btn:hover { background: #334155 !important; transform: scale(1.1); }
            `}</style>
        </div>
    );
};

const inputContainer = {
    display: 'flex', flexDirection: 'column', gap: '8px'
};

const labelStyle = {
    fontSize: '18px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontFamily: "'DM Sans', sans-serif"
};

const valueStyle = {
    padding: '24px 32px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '20px',
    fontSize: '22px', fontWeight: 800, color: '#1e293b', fontFamily: "'DM Sans', sans-serif"
};

export default ProfilePage;
