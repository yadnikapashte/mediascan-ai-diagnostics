import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  X, 
  Activity, 
  Zap, 
  Eye, 
  Footprints, 
  Info,
  TrendingUp,
  Microscope,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { mlAPI, predictionsAPI } from '../utils/api';

const ScanPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState(null);
    const [modelType, setModelType] = useState('auto');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [detectedType, setDetectedType] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            toast.success("Medical image linked successfully");
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
    };

    const handleStartAnalysis = async () => {
        if (!selectedFile) return;
        
        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('model_type', modelType);

        try {
            const res = await predictionsAPI.analyze(formData);
            if (res.data.detected_domain && modelType === 'auto') {
                setDetectedType(res.data.detected_domain);
                toast.success(`${t('scan.ai_detected')}: ${res.data.detected_domain.toUpperCase()}`);
                // Short delay to show detection result
                setTimeout(() => {
                    navigate(`/results/${res.data.prediction_id}`);
                }, 1500);
            } else {
                toast.success(t('scan.analysis_complete'));
                navigate(`/results/${res.data.prediction_id}`);
            }
        } catch (err) {
            console.error("Diagnostic failure", err);
            toast.error("Neural analysis pipeline failure. Please retry.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const modelOptions = [
        { id: 'auto', name: t('scan.models.auto'), icon: <Zap />, desc: t('scan.models.auto_desc'), premium: true },
        { id: 'eye', name: t('scan.models.eye'), icon: <Eye />, desc: t('scan.models.eye_desc') },
        { id: 'palm', name: t('scan.models.palm'), icon: <TrendingUp />, desc: t('scan.models.palm_desc') },
        { id: 'retina', name: t('scan.models.retina'), icon: <Microscope />, desc: t('scan.models.retina_desc') },
        { id: 'skin', name: t('scan.models.skin'), icon: <Footprints />, desc: t('scan.models.skin_desc') }
    ];

    return (
        <div style={{ 
            width: '100%', margin: '0 auto', padding: '48px 5vw',
            animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}>
            {/* Header */}
            <div style={{ marginBottom: '52px', borderBottom: '1px solid #e2e8f0', paddingBottom: '40px' }}>
                <h1 style={{ 
                    fontSize: '56px', fontWeight: 900, color: '#111827', 
                    fontFamily: "'Outfit', sans-serif", marginBottom: '12px',
                    letterSpacing: '-2px'
                }}>
                    {t('scan.heading')}
                </h1>
                <p style={{ fontSize: '24px', color: '#64748b', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                    {t('scan.subtitle')}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px' }}>
                {/* Upload Zone */}
                <div>
                    <div style={{ 
                        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px',
                        padding: '48px', minHeight: '520px', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Upload size={32} color="#1a56db" />
                            </div>
                            <h3 style={{ fontSize: '34px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1.5px' }}>{t('scan.upload_title')}</h3>
                        </div>

                        {!selectedFile ? (
                            <div 
                                onClick={() => document.getElementById('scan-upload').click()}
                                style={{
                                    flex: 1, border: '3px dashed #cbd5e1', background: '#f8fafc',
                                    borderRadius: '24px', display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#1a56db'; e.currentTarget.style.background = '#eff6ff'; }}
                                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                            >
                                <input id="scan-upload" type="file" hidden onChange={handleFileSelect} accept="image/*" />
                                <div style={{ 
                                    width: '120px', height: '120px', background: '#fff', borderRadius: '36px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 12px 32px rgba(0,0,0,0.08)', marginBottom: '40px'
                                }}>
                                    <Activity size={64} color="#1a56db" />
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px' }}>{t('scan.source_upload')}</div>
                                <div style={{ fontSize: '24px', color: '#64748b', marginTop: '16px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{t('scan.drop_desc')}</div>
                            </div>
                        ) : (
                            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '24px' }}>
                                <img src={URL.createObjectURL(selectedFile)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button 
                                    onClick={handleReset}
                                    style={{
                                        position: 'absolute', top: '20px', right: '20px',
                                        width: '44px', height: '44px', borderRadius: '12px',
                                        background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)',
                                        border: 'none', cursor: 'pointer', display: 'flex', 
                                        alignItems: 'center', justifyContent: 'center', color: '#ef4444',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <X size={24} />
                                </button>
                                <div style={{
                                    position: 'absolute', bottom: '24px', left: '24px', right: '24px',
                                    padding: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.95)',
                                    backdropFilter: 'blur(12px)', boxShadow: '0 12px 24px rgba(0,0,0,0.12)'
                                }}>
                                    <div style={{ fontWeight: 900, fontSize: '22px', color: '#111827', fontFamily: "'DM Sans', sans-serif" }}>{selectedFile.name}</div>
                                    <div style={{ fontSize: '18px', color: '#64748b', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: '6px' }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB Medical Scan</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Configuration Zone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ 
                        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px',
                        padding: '48px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                    }}>
                        <h3 style={{ fontSize: '34px', fontWeight: 900, color: '#111827', marginBottom: '32px', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1.5px' }}>{t('scan.intelligence_selection')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {modelOptions.map((opt) => (
                                <div 
                                    key={opt.id}
                                    onClick={() => setModelType(opt.id)}
                                    style={{
                                        padding: '22px 28px', borderRadius: '20px', cursor: 'pointer',
                                        border: '2px solid', 
                                        borderColor: modelType === opt.id ? '#1a56db' : '#f1f5f9',
                                        background: modelType === opt.id ? '#eff6ff' : '#fff',
                                        display: 'flex', alignItems: 'center', gap: '20px',
                                        transition: '0.2s',
                                        position: 'relative',
                                        boxShadow: modelType === opt.id ? (opt.premium ? '0 15px 30px rgba(124, 58, 237, 0.15)' : '0 10px 15px rgba(26,86,219,0.05)') : 'none',
                                        transform: modelType === opt.id ? 'scale(1.02)' : 'none'
                                    }}
                                >
                                    <div style={{ 
                                        color: modelType === opt.id ? '#1a56db' : '#94a3b8',
                                        transition: '0.2s'
                                    }}>
                                        {React.cloneElement(opt.icon, { size: 32, strokeWidth: modelType === opt.id ? 2.5 : 2 })}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 900, fontSize: '28px', color: modelType === opt.id ? '#1a56db' : '#111827', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.8px' }}>{opt.name}</div>
                                        <div style={{ fontSize: '21px', color: '#64748b', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>{opt.desc}</div>
                                    </div>
                                    {modelType === opt.id && <CheckCircle2 size={32} color="#1a56db" />}
                                    {opt.premium && (
                                        <div style={{
                                            position: 'absolute', top: '-12px', right: '20px',
                                            background: 'linear-gradient(135deg, #1a56db, #7c3aed)',
                                            color: '#fff', fontSize: '14px', fontWeight: 900,
                                            padding: '4px 12px', borderRadius: '10px',
                                            letterSpacing: '1px', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                                            fontFamily: "'Outfit', sans-serif"
                                        }}>AI POWERED</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleStartAnalysis}
                            disabled={!selectedFile || isAnalyzing}
                            style={{
                                width: '100%', height: '84px', marginTop: '32px', border: 'none',
                                borderRadius: '24px', background: selectedFile ? 'linear-gradient(135deg, #1a56db, #2563eb)' : '#f1f5f9',
                                color: selectedFile ? '#fff' : '#94a3b8', fontWeight: 900,
                                fontSize: '26px', cursor: selectedFile ? 'pointer' : 'not-allowed',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                boxShadow: selectedFile ? '0 12px 32px rgba(26,86,219,0.3)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
                                fontFamily: "'Outfit', sans-serif", letterSpacing: '0.8px'
                            }}
                        >
                            {isAnalyzing ? (
                                <><Activity className="animate-spin" size={34} /> {t('scan.analyzing')}</>
                            ) : (
                                <><Zap size={32} fill="currentColor" /> {t('scan.initialize_scan')}</>
                            )}
                        </button>
                    </div>

                    {/* Disclaimer */}
                    <div style={{ 
                        background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '28px',
                        padding: '32px', display: 'flex', gap: '20px'
                    }}>
                        <AlertCircle color="#d97706" size={40} style={{ flexShrink: 0 }} />
                        <div style={{ fontSize: '21px', color: '#9a3412', fontWeight: 600, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                            <div style={{ fontWeight: 900, fontSize: '24px', marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>{t('scan.disclaimer_title')}</div>
                            {t('scan.disclaimer_text')}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ScanPage;
