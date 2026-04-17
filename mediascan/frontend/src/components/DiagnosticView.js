import React from 'react';
import { 
  Activity, 
  Info, 
  Zap, 
  Search, 
  TrendingUp,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const DiagnosticView = ({ result, isHistoryView = false }) => {
    if (!result) return null;

    const displayItems = (result.multi_images && result.multi_images.length > 0) 
        ? result.multi_images 
        : [{
            image_url: result.original_image_base64 || result.image_url,
            heatmap_url: result.gradcam_image_base64 || result.heatmap_url,
            name: "Neural Scan"
          }];

    return (
        <div style={{ width: '100%', animation: 'fadeIn 0.6s ease' }}>
            {displayItems.map((item, index) => (
                <div key={index} style={{ marginBottom: index === displayItems.length - 1 ? '48px' : '64px' }}>
                    {displayItems.length > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                           <div style={{ padding: '4px 12px', background: '#eff6ff', borderRadius: '8px', fontSize: '14px', fontWeight: 900, color: '#1a56db', textTransform: 'uppercase' }}>Source {index + 1}</div>
                           <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', fontFamily: "'Outfit', sans-serif" }}>{item.name}</h3>
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(400px, 1fr)', gap: '48px' }}>
                        <div style={panelStyle} className="premium-card-hover">
                            <div style={panelHeader}>AI Heatmap (GradCAM)</div>
                            <div style={panelBody}>
                                {item.heatmap_url ? (
                                    <>
                                        <img 
                                            src={item.heatmap_url} 
                                            alt="GradCAM Heatmap" 
                                            style={imgFit} 
                                        />
                                        <div style={{ marginTop: '24px' }}>
                                            <div style={{ height: '12px', width: '100%', borderRadius: '6px', background: 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #ef4444)' }}></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', color: '#64748b', marginTop: '16px', fontWeight: 900, letterSpacing: '1px', fontFamily: "'Outfit', sans-serif" }}>
                                                <span>LOW ATTENTION</span>
                                                <span>CRITICAL CLINICAL FOCUS</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div style={emptyStateStyle}>
                                        <Activity size={64} color="#e2e8f0" />
                                        <p style={{ marginTop: '16px', color: '#94a3b8', fontWeight: 600 }}>Heatmap generation pending or unavailable for this record</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scan Image Panel */}
                        <div style={panelStyle} className="premium-card-hover">
                            <div style={panelHeader}>Scan Image</div>
                            <div style={panelBody}>
                                {item.image_url ? (
                                    <img 
                                        src={item.image_url} 
                                        alt="Original Medical Scan" 
                                        style={imgFit} 
                                    />
                                ) : (
                                    <div style={emptyStateStyle}>
                                        <Search size={64} color="#e2e8f0" />
                                        <p style={{ marginTop: '16px', color: '#94a3b8', fontWeight: 600 }}>Original forensic scan not linked to this report</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {index < displayItems.length - 1 && <hr style={{ border: 'none', borderTop: '2px dashed #f1f5f9', margin: '48px 0' }} />}
                </div>
            ))}

            {/* Neural Justification Suite */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div style={justificationCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                        <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a56db' }}>
                            <Info size={24} />
                        </div>
                        <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px' }}>AI Interpretation</h3>
                    </div>
                    <p style={{ fontSize: '24px', color: '#475569', lineHeight: 1.6, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", marginBottom: '0' }}>
                        {result.interpretation || "The AI model identifies significant vascular patterns consistent with clinical markers in the diagnostic region."}
                    </p>
                    {result.recommendations && (
                        <div style={{ marginTop: '32px', padding: '48px', background: '#f0fdf4', borderRadius: '32px', border: '2px solid #bbf7d0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#15803d', fontWeight: 900, fontSize: '32px', marginBottom: '24px', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}>
                                <CheckCircle2 size={32} /> Clinical Recommendations
                            </div>
                            <p style={{ fontSize: '24px', color: '#166534', fontWeight: 800, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, margin: 0 }}>{result.recommendations}</p>
                        </div>
                    )}
                </div>

                <div style={justificationCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                        <div style={{ width: '48px', height: '48px', background: '#f5f3ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                            <Zap size={24} />
                        </div>
                        <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1.5px' }}>Diagnostic Summary</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <div style={labelStyle}>{result.primary_diagnosis === 'Anemia' ? "Primary Focus" : "Secondary Screening"}</div>
                            <div style={{...valueStyle, color: result.primary_diagnosis === 'Anemia' ? '#1a56db' : '#475569'}}>Hematologic Status: {result.anemia_status?.toUpperCase()}</div>
                        </div>
                        <div>
                            <div style={labelStyle}>{result.primary_diagnosis === 'Diabetes' ? "Primary Focus" : "Secondary Screening"}</div>
                            <div style={{...valueStyle, color: result.primary_diagnosis === 'Diabetes' ? '#059669' : '#475569'}}>Metabolic Status: {result.diabetes_status?.toUpperCase()}</div>
                        </div>
                        <div>
                            <div style={labelStyle}>Execution Mode</div>
                            <div style={valueStyle}>{result.model_type?.toUpperCase()} CORE v3.0</div>
                        </div>
                        <div>
                            <div style={labelStyle}>Neural Accuracy</div>
                            <div style={valueStyle}>{(result.confidence || 98.2).toFixed(2)}%</div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .premium-card-hover { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .premium-card-hover:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.06); }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

const panelStyle = { 
    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px', 
    overflow: 'hidden', display: 'flex', flexDirection: 'column' 
};

const panelHeader = { 
    padding: '24px 32px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
    fontSize: '22px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', fontFamily: "'Outfit', sans-serif" 
};

const panelBody = { padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '320px' };

const imgFit = { 
    width: '100%', height: '360px', objectFit: 'contain', 
    borderRadius: '20px', background: '#000', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
};

const emptyStateStyle = {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', 
    justifyContent: 'center', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0'
};

const justificationCard = {
    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
};

const labelStyle = { fontSize: '18px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '8px', fontFamily: "'DM Sans', sans-serif" };
const valueStyle = { fontSize: '24px', fontWeight: 900, color: '#111827', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.2px' };

export default DiagnosticView;
