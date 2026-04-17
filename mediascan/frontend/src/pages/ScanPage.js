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
  AlertCircle,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { mlAPI, predictionsAPI } from '../utils/api';

const ScanPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    // Single Scan State
    const [selectedFile, setSelectedFile] = useState(null);
    const [modelType, setModelType] = useState('auto');
    
    // Multi Scan State
    const [specializedFiles, setSpecializedFiles] = useState({
        eye: null, palm: null, retina: null, skin: null
    });

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            toast.success("Medical scan linked successfully");
        }
    };

    const handleSpecializedSelect = (domain, file) => {
        if (file) {
            setSpecializedFiles(prev => ({ ...prev, [domain]: file }));
            toast.success(`${domain.toUpperCase()} scan linked`);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setSpecializedFiles({ eye: null, palm: null, retina: null, skin: null });
        setModelType('auto');
    };

    const handleStartAnalysis = async (mode) => {
        const isMulti = mode === 'multi';
        const activeSpecialized = Object.entries(specializedFiles).filter(([_, f]) => f !== null);

        if (!isMulti && !selectedFile) {
            toast.error("Please provide a medical scan.");
            return;
        }
        if (isMulti && activeSpecialized.length === 0) {
            toast.error("Please provide at least one source scan.");
            return;
        }
        
        setIsAnalyzing(true);
        const formData = new FormData();
        
        if (!isMulti) {
            formData.append('image', selectedFile);
            formData.append('model_type', modelType);
        } else {
            activeSpecialized.forEach(([domain, file]) => {
                formData.append(`${domain}_image`, file);
            });
            formData.append('model_type', 'multi');
        }

        try {
            const res = await predictionsAPI.analyze(formData);
            toast.success(t('scan.analysis_complete'));
            navigate(`/results/${res.data.prediction_id}`);
        } catch (err) {
            console.error("Diagnostic failure", err);
            toast.error("Neural analysis pipeline failure. Ensure models are online.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const modelOptions = [
        { id: 'auto', name: 'Auto-Detect', icon: <Zap />, desc: 'AI automatically identifies domain' },
        { id: 'eye', name: 'Eye Anemia', icon: <Eye />, desc: 'Detect conjunctiva clinical signs' },
        { id: 'palm', name: 'Palm Anemia', icon: <TrendingUp />, desc: 'Analyze palmar creases' },
        { id: 'retina', name: 'Retina Diabetes', icon: <Microscope />, desc: 'Detect diabetic retinopathy' },
        { id: 'skin', name: 'DFU Skin', icon: <Footprints />, desc: 'Analyze foot ulcer risk' }
    ];

    return (
        <div style={{ 
            width: '100%', margin: '0 auto', padding: '40px 5vw',
            animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '60px'
        }}>
            {/* Page Header */}
            <div>
                <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: '8px', letterSpacing: '-2px' }}>
                    Diagnostic Command Center
                </h1>
                <p style={{ fontSize: '20px', color: '#6b7280', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                    Upload medical imaging for single-source analysis or multi-model fusion.
                </p>
            </div>

            {/* SECTION 1: SINGLE SCAN FLOW */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '40px', padding: '48px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #1a56db, #2563eb)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <Zap size={28} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>Single Image Scan</h2>
                        <p style={{ fontSize: '18px', color: '#64748b', fontWeight: 600 }}>Standard analysis for quick results</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '40px' }}>
                    {/* Upload Card */}
                    <div 
                        onClick={() => !selectedFile && document.getElementById('single-upload').click()}
                        style={{
                            minHeight: '420px', border: '3px dashed #cbd5e1', background: '#f8fafc',
                            borderRadius: '32px', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', cursor: selectedFile ? 'default' : 'pointer',
                            transition: '0.3s', position: 'relative', overflow: 'hidden'
                        }}
                    >
                        <input id="single-upload" type="file" hidden onChange={handleFileSelect} accept="image/*" />
                        {selectedFile ? (
                            <>
                                <img src={URL.createObjectURL(selectedFile)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.9)', border: 'none', padding: 10, borderRadius: 12, color: '#ef4444' }}><X size={22}/></button>
                            </>
                        ) : (
                            <>
                                <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                                    <Upload size={40} color="#1a56db" />
                                </div>
                                <div style={{ marginTop: 24, fontSize: '24px', fontWeight: 800, color: '#111827' }}>Click to link single diagnostic scan</div>
                            </>
                        )}
                    </div>

                    {/* Options Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {modelOptions.map((opt) => (
                                <div 
                                    key={opt.id}
                                    onClick={() => setModelType(opt.id)}
                                    style={{
                                        padding: '16px 20px', borderRadius: '18px', cursor: 'pointer',
                                        border: '2px solid', 
                                        borderColor: modelType === opt.id ? '#1a56db' : '#f1f5f9',
                                        background: modelType === opt.id ? '#eff6ff' : '#fff',
                                        display: 'flex', alignItems: 'center', gap: '16px',
                                        transition: '0.2s'
                                    }}
                                >
                                    <div style={{ color: modelType === opt.id ? '#1a56db' : '#94a3b8' }}>
                                        {React.cloneElement(opt.icon, { size: 22 })}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 900, fontSize: '22px', color: modelType === opt.id ? '#1a56db' : '#111827' }}>{opt.name}</div>
                                        <div style={{ fontSize: '16px', color: '#64748b', fontWeight: 600 }}>{opt.desc}</div>
                                    </div>
                                    {modelType === opt.id && <CheckCircle2 size={18} color="#1a56db" />}
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => handleStartAnalysis('single')}
                            disabled={!selectedFile || isAnalyzing}
                            style={{
                                width: '100%', height: '76px', marginTop: '12px', border: 'none',
                                borderRadius: '20px', background: selectedFile ? 'linear-gradient(135deg, #1a56db, #2563eb)' : '#f1f5f9',
                                color: selectedFile ? '#fff' : '#94a3b8', fontSize: '28px', fontWeight: 900,
                                cursor: selectedFile ? 'pointer' : 'not-allowed', boxShadow: selectedFile ? '0 10px 24px rgba(26,86,219,0.25)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: '0.3s'
                            }}
                        >
                            {isAnalyzing ? <Activity className="animate-spin" size={24} /> : <Zap size={22} fill="currentColor" />}
                            {isAnalyzing ? "Processing..." : "Analyze Single Scan"}
                        </button>
                    </div>
                </div>
                
                <div style={{ marginTop: '24px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '16px', padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <AlertCircle color="#d97706" size={24} />
                    <span style={{ fontSize: '18px', color: '#9a3412', fontWeight: 800 }}>Trained Neural Networks (TNN) prioritized — Indicative Results Only.</span>
                </div>
            </div>

            {/* SECTION 2: MULTI-SOURCE CLINICAL FUSION */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '40px', padding: '48px', boxShadow: '0 20px 50px rgba(0,0,0,0.03)' }}>
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '52px', height: '52px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a56db' }}>
                            <Layers size={28} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>Clinical Panel (4-Image Fusion)</h2>
                            <p style={{ fontSize: '18px', color: '#64748b', fontWeight: 600 }}>Advanced cross-verification for complex cases</p>
                        </div>
                    </div>
                    {Object.values(specializedFiles).filter(f => f).length > 1 && (
                        <div style={{ background: 'linear-gradient(135deg, #1a56db, #7c3aed)', color: '#fff', fontSize: '14px', fontWeight: 900, padding: '8px 18px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>NEURAL FUSION ACTIVE</div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    {[
                        { id: 'eye', name: 'Ocular', icon: <Eye />, desc: 'Anemia' },
                        { id: 'palm', name: 'Dermal', icon: <TrendingUp />, desc: 'Anemia' },
                        { id: 'retina', name: 'Retinal', icon: <Microscope />, desc: 'Diabetes' },
                        { id: 'skin', name: 'Pathology', icon: <Footprints />, desc: 'Ulcer/Diabetes' }
                    ].map((slot) => (
                        <div 
                            key={slot.id}
                            onClick={() => document.getElementById(`multi-upload-${slot.id}`).click()}
                            style={{
                                height: '220px', borderRadius: '28px', border: '2px solid',
                                borderColor: specializedFiles[slot.id] ? '#1a56db' : '#f1f5f9',
                                background: specializedFiles[slot.id] ? '#eff6ff' : '#fff',
                                padding: '24px', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                transition: '0.3s', position: 'relative', overflow: 'hidden'
                            }}
                        >
                            <input id={`multi-upload-${slot.id}`} type="file" hidden onChange={(e) => handleSpecializedSelect(slot.id, e.target.files[0])} accept="image/*" />
                            {specializedFiles[slot.id] ? (
                                <>
                                    <img src={URL.createObjectURL(specializedFiles[slot.id])} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSpecializedFiles(p => ({...p, [slot.id]: null})); }} 
                                        style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', border: 'none', padding: 8, borderRadius: 10, color: '#ef4444' }}
                                    >
                                        <X size={18}/>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{ color: '#cbd5e1', marginBottom: 12 }}>{React.cloneElement(slot.icon, { size: 44 })}</div>
                                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#111827' }}>{slot.name}</div>
                                    <div style={{ fontSize: '15px', color: '#94a3b8', fontWeight: 800 }}>{slot.desc} Focus</div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                        onClick={() => handleStartAnalysis('multi')}
                        disabled={Object.values(specializedFiles).filter(f => f).length === 0 || isAnalyzing}
                        style={{
                            flex: 1, height: '76px', border: 'none', borderRadius: '24px',
                            background: Object.values(specializedFiles).filter(f => f).length > 0 ? 'linear-gradient(135deg, #1a56db, #2563eb)' : '#f1f5f9',
                            color: '#fff', fontSize: '28px', fontWeight: 900, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
                            boxShadow: '0 12px 32px rgba(26,86,219,0.2)', transition: '0.3s'
                        }}
                    >
                        {isAnalyzing ? <Activity className="animate-spin" size={32} /> : <Layers size={24} />}
                        {isAnalyzing ? "Processing Fusion..." : "Launch Multi-Source Diagnostic Fusion"}
                    </button>
                    <button 
                        onClick={() => setSpecializedFiles({ eye: null, palm: null, retina: null, skin: null })}
                        style={{ padding: '0 32px', borderRadius: '24px', border: '2px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 800, fontSize: '18px', cursor: 'pointer' }}
                    >
                        Reset Fusion
                    </button>
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
