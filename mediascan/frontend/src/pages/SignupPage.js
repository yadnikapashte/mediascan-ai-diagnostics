import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Lock, Phone, 
  ChevronRight, Calendar, UserCircle,
  ShieldCheck, ArrowRight, CheckCircle2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'Prefer not to say',
    phone: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { label: '', color: '#ddd' };
    if (p.length < 6) return { label: t('auth.weak'), color: '#ef4444' };
    if (p.length < 10) return { label: t('auth.fair'), color: '#f59e0b' };
    return { label: t('auth.strong'), color: '#10b981' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert(t('auth.passwords_mismatch'));
      return;
    }
    
    setIsSubmitting(true);
    const success = await signup(formData);
    if (success) {
      toast.success(t('auth.signup_success'));
      navigate('/login');
    }
    setIsSubmitting(false);
  };

  const strength = getPasswordStrength();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Left Panel */}
      <div style={{ 
        flex: '1', 
        background: 'linear-gradient(160deg, #1e3a5f 0%, #1a56db 60%, #2563eb 100%)',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '12px', 
            background: 'rgba(255,255,255,0.2)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <div style={{ fontSize: '34px', fontWeight: 900, fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px', lineHeight: 1 }}>MediScan AI</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'DM Sans', sans-serif", marginTop: '2px' }}>HEALTH INTELLIGENCE PLATFORM</div>
          </div>
        </div>

        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '72px', fontWeight: 900, lineHeight: 0.95, marginBottom: '32px', letterSpacing: '-3px' }}>
            {t('auth.signup_hero_title_1')}<br />{t('auth.signup_hero_title_2')}
          </h1>
          <p style={{ fontSize: '24px', opacity: 0.9, maxWidth: '640px', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
            {t('auth.signup_hero_subtitle')}
          </p>
          <div style={{ marginTop: '64px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[t('auth.feat_anemia'), t('auth.feat_retinopathy'), t('auth.feat_ulcer')].map(txt => (
              <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <CheckCircle2 size={30} style={{ color: '#60a5fa' }} />
                <span style={{ fontSize: '22px', fontWeight: 600, opacity: 0.95 }}>{txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ opacity: 0.7, fontSize: '16px', fontWeight: 500 }}>
          {t('auth.terms_agreement')}
        </div>
      </div>

      {/* Right Panel - Scrollable Form */}
      <div style={{ 
        flex: '1.4', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        padding: '72px 48px',
        overflowY: 'auto',
        maxHeight: '100vh',
        background: '#ffffff'
      }}>
        <div style={{ maxWidth: '720px', width: '100%' }}>
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '56px', fontWeight: 900, color: '#111827', marginBottom: '16px', fontFamily: "'Outfit', sans-serif", letterSpacing: '-2px' }}>{t('auth.signup_title')}</h2>
            <p style={{ color: '#64748b', fontSize: '22px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{t('auth.signup_subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Full Name */}
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '21px', fontWeight: 800, color: '#111827', fontFamily: "'DM Sans', sans-serif" }}>{t('auth.name')}</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '20px', top: '22px', color: '#94a3b8' }}><User size={24} /></div>
                <input 
                  name="name" type="text" value={formData.name} onChange={handleChange} required
                  placeholder="e.g. Rahul Sharma"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '21px', fontWeight: 800, color: '#111827', fontFamily: "'DM Sans', sans-serif" }}>{t('auth.email_address')}</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '20px', top: '22px', color: '#94a3b8' }}><Mail size={24} /></div>
                <input 
                  name="email" type="email" value={formData.email} onChange={handleChange} required
                  placeholder="you@example.com"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Age */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <label style={{ fontSize: '21px', fontWeight: 800, color: '#111827', fontFamily: "'DM Sans', sans-serif" }}>{t('auth.age')}</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '20px', top: '22px', color: '#94a3b8' }}><Calendar size={24} /></div>
                <input 
                  name="age" type="number" value={formData.age} onChange={handleChange}
                  placeholder="24"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Gender */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <label style={{ fontSize: '21px', fontWeight: 800, color: '#111827', fontFamily: "'DM Sans', sans-serif" }}>{t('auth.gender')}</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '20px', top: '22px', color: '#94a3b8' }}><UserCircle size={24} /></div>
                <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                  <option value="Male">{t('auth.gender_male')}</option>
                  <option value="Female">{t('auth.gender_female')}</option>
                  <option value="Prefer not to say">{t('auth.gender_other')}</option>
                </select>
              </div>
            </div>

            {/* Phone */}
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <label style={{ fontSize: '21px', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'DM Sans', sans-serif" }}>
                {t('auth.phone_number')} <span style={{ fontSize: '12px', color: '#94a3b8', padding: '4px 10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 700 }}>{t('auth.optional')}</span>
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '20px', top: '22px', color: '#94a3b8' }}><Phone size={24} /></div>
                <input 
                  name="phone" type="tel" value={formData.phone} onChange={handleChange}
                  placeholder="+91 98765 43210"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '21px', fontWeight: 800, color: '#111827', fontFamily: "'DM Sans', sans-serif" }}>{t('auth.password')}</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '20px', top: '22px', color: '#94a3b8' }}><Lock size={24} /></div>
                <input 
                  name="password" type="password" value={formData.password} onChange={handleChange} required
                  placeholder={t('auth.password_min')}
                  style={inputStyle}
                />
              </div>
              {formData.password && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <div style={{ height: '4px', flex: 1, background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.label === 'Weak' ? '33%' : (strength.label === 'Fair' ? '66%' : '100%'), background: strength.color }}></div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '21px', fontWeight: 800, color: '#111827', fontFamily: "'DM Sans', sans-serif" }}>{t('auth.confirm_password')}</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '20px', top: '22px', color: '#94a3b8' }}><Lock size={24} /></div>
                <input 
                  name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required
                  placeholder={t('auth.password_repeat')}
                  style={inputStyle}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{
                gridColumn: 'span 2',
                height: '76px',
                background: isSubmitting ? '#9ca3af' : 'linear-gradient(to right, #1a56db, #2563eb)',
                color: '#fff', border: 'none', borderRadius: '20px',
                fontSize: '24px', fontWeight: 900, cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px',
                boxShadow: '0 8px 16px rgba(26,86,219,0.3)'
              }}
            >
              {isSubmitting ? t('auth.creating_account') : t('auth.create_account_btn')}
              {!isSubmitting && <ArrowRight size={26} />}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '40px', color: '#64748b', fontSize: '20px', fontWeight: 500 }}>
            {t('auth.have_account')} <Link to="/login" style={{ color: '#1a56db', fontWeight: 800, textDecoration: 'none' }}>{t('auth.register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%', height: '68px', padding: '0 20px 0 60px', borderRadius: '16px', border: '1px solid #dde3f4',
  background: '#f8fafc', fontSize: '21px', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif"
};

export default SignupPage;
