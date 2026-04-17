import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { 
  Download, 
  Trash2, 
  ArrowLeft, 
  Activity, 
  ShieldAlert, 
  CheckCircle2,
  Zap,
  Microscope,
  Info,
  Search,
  ChevronRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  Clock,
  ExternalLink,
  ClipboardList,
  Eye, 
  Hand, 
  Footprints,
  ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { predictionsAPI } from '../utils/api';
import DiagnosticView from '../components/DiagnosticView';

// AI_EXPLANATIONS have been moved to translation files for full localization.


const calculateHealthScore = (result) => {
  if (!result) return 100;
  let score = 100;

  // Anemia Penalties
  if (result.anemia_status === 'Anemic') {
    const risk = String(result.anemia_risk || 'low').toLowerCase();
    if (risk === 'high') score -= 30;
    else if (risk === 'medium') score -= 20;
    else score -= 10;
  }

  // Diabetes Penalties (Triggered by Diabetic status)
  if (result.diabetes_status === 'Diabetic') {
    const risk = String(result.diabetes_risk || 'low').toLowerCase();
    if (risk === 'high') score -= 30;
    else if (risk === 'medium') score -= 20;
    else score -= 10;
  }

  // DFU Penalties
  if (result.dfu_status === 'Abnormal(Ulcer)') {
    const risk = String(result.dfu_risk || 'low').toLowerCase();
    if (risk === 'high') score -= 30;
    else if (risk === 'medium') score -= 20;
    else score -= 10;
  }

  return Math.max(10, score);
};

const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [previousResult, setPreviousResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRemedyTab, setActiveRemedyTab] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {

      try {
        const [res, prev] = await Promise.all([
          predictionsAPI.getById(id),
          predictionsAPI.getPrevious(id).catch(() => ({ data: null }))
        ]);
        
        setResult(res.data);
        if (prev && prev.data) {
          setPreviousResult(prev.data);
        }

        // Set default remedy tab
        if (res.data.anemia_status === 'Anemic') setActiveRemedyTab('anemia');
        else if (res.data.diabetes_status === 'Diabetic') setActiveRemedyTab('diabetes');
        else if (res.data.dfu_result === 'Abnormal(Ulcer)') setActiveRemedyTab('dfu');
        else setActiveRemedyTab('anemia'); // Default fallback

      } catch (err) {
        console.error("Result retrieval failed", err);
        toast.error("Failed to load health analysis report");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this health record?")) return;
    try {
      await predictionsAPI.delete(id);
      toast.success("Health record deleted");
      navigate('/history');
    } catch (err) {
      toast.error("Delete operation failed");
    }
  };

  if (loading) return (
    <div style={{ padding: '80px', textAlign: 'center' }}>
      <Activity className="animate-spin" size={60} color="#1a56db" />
      <p style={{ marginTop: '24px', color: '#64748b', fontSize: '20px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
        {t('dashboard.awaiting_diag')}
      </p>
    </div>
  );

  if (!result) return (
    <div style={{ padding: '60px', textAlign: 'center' }}>
      <ShieldAlert size={64} color="#ef4444" />
      <h2 style={{ marginTop: '24px', fontWeight: 800 }}>Report Not Found</h2>
      <Link to="/history" style={{ color: '#1a56db' }}>{t('results.back_to_history')}</Link>
    </div>
  );


  const currentScore = calculateHealthScore(result);
  const prevScore = previousResult ? calculateHealthScore(previousResult) : null;
  const scoreDiff = prevScore !== null ? currentScore - prevScore : 0;

  return (
    <div style={{ 
      width: '100%', margin: '0 auto', padding: '48px 5vw',
      animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
    }}>
      {/* Header / Actions Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <button 
            onClick={() => navigate('/history')}
            style={{ 
              background: 'transparent', border: 'none', color: '#64748b', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
              fontSize: '20px', fontWeight: 800, fontFamily: "'DM Sans', sans-serif"
            }}
          >

            <ChevronLeft size={24} /> {t('results.back_to_history')}
          </button>
          <h1 style={{ 
            fontSize: '52px', fontWeight: 900, color: '#111827', 
            fontFamily: "'Outfit', sans-serif", letterSpacing: '-2px',
            marginBottom: '8px'
          }}>
            {t('results.scan_report')}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#94a3b8', fontFamily: "'DM Sans', sans-serif" }}>
              Scan #{result.id} · {result.model_type.charAt(0).toUpperCase() + result.model_type.slice(1)} Image Analysis
            </span>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></div>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#94a3b8', fontFamily: "'DM Sans', sans-serif" }}>
              {new Date(result.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : (i18n.language === 'hi' ? 'hi-IN' : (i18n.language === 'mr' ? 'mr-IN' : 'gu-IN')), { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1a56db', background: '#eff6ff', padding: '4px 12px', borderRadius: '10px' }}>
               Trained Neural Networks (TNN) prioritized. Results are indicative.
            </span>

            {user && (
              <>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></div>
                <span style={{ 
                  background: '#f1f5f9', padding: '4px 12px', borderRadius: '99px',
                  fontSize: '14px', fontWeight: 800, color: '#475569', textTransform: 'uppercase'
                }}>
                  {user.role === 'admin' ? 'Admin' : 'Member'}
                </span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => window.print()}
            style={{ ...actionBtnStyle, background: '#1a56db', color: '#fff', fontSize: '20px', padding: '14px 28px' }}
          >
            <Download size={22} /> {t('results.download_report')}
          </button>
          <button 
            onClick={handleDelete}
            style={{ ...actionBtnStyle, background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '20px', padding: '14px 28px' }}
          >
            <Trash2 size={22} /> {t('results.delete_record')}
          </button>

        </div>
      </div>

      {/* LOW CONFIDENCE WARNING BANNER */}
      {result.confidence !== undefined && result.confidence < 70 && (
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          border: '2px solid #f59e0b',
          borderRadius: '20px',
          padding: '20px 32px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
        }}>
          <span style={{ fontSize: '36px' }}>⚠️</span>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#92400e', fontFamily: "'Outfit', sans-serif", marginBottom: '6px' }}>
              Low Model Confidence — {result.confidence.toFixed(1)}%
            </div>
            <div style={{ fontSize: '17px', color: '#78350f', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
              The AI model is uncertain about this result. This does <strong>not</strong> mean you are healthy — it means the image quality or pattern 
              was ambiguous for the {result.model_type} scan. Please upload a clearer image or consult a doctor for a blood test to confirm.
            </div>
          </div>
        </div>
      )}

      {/* HEALTH SCORE CARD [NEW] */}
      <div style={{ 
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '24px', 
        padding: '32px 40px', marginBottom: '24px', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>

        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '12px', fontFamily: "'DM Sans', sans-serif" }}>
            {t('results.overall_health_score')}
          </div>
          <div style={{ 
            fontSize: '96px', fontWeight: 900, 
            color: currentScore >= 80 ? '#059669' : (currentScore >= 60 ? '#d97706' : '#dc2626'),
            fontFamily: "'Outfit', sans-serif", lineHeight: 1
          }}>
            {currentScore}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#9ca3af', marginTop: '8px', fontFamily: "'DM Sans', sans-serif" }}>
            {t('results.out_of_100')}
          </div>
        </div>


        <div>
          <Gauge score={currentScore} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '240px' }}>
          <MetricRow label={t('results.anemia_result')} risk={result.anemia_risk} detected={result.anemia_status === 'Anemic'} />
          <MetricRow label={t('results.diabetes_result')} risk={result.diabetes_risk} detected={result.diabetes_status === 'Diabetic' || result.diabetes_status === 'Abnormal(Ulcer)'} />
          <MetricRow label={t('results.status.abnormal_ulcer')} risk={result.dfu_risk} detected={result.dfu_status === 'Abnormal(Ulcer)'} />
        </div>

      </div>

      {/* Comparison Banner [NEW] */}
      {previousResult && (
        <div style={{ 
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', 
          padding: '16px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px',
          animation: 'slideDown 0.5s ease-out'
        }}>
          <div style={{ color: scoreDiff > 0 ? '#059669' : (scoreDiff < 0 ? '#d97706' : '#1a56db') }}>
            <TrendingUp size={24} />
          </div>
          <div style={{ 
            fontSize: '24px', fontWeight: 800, fontFamily: "'DM Sans', sans-serif",
            color: scoreDiff > 0 ? '#059669' : (scoreDiff < 0 ? '#d97706' : '#1a56db')
          }}>

            {scoreDiff > 0 && `✅ ${t('results.health_improved', { points: scoreDiff, date: new Date(previousResult.created_at).toLocaleDateString() })}`}
            {scoreDiff < 0 && `⚠️ ${t('results.health_declined', { points: Math.abs(scoreDiff), date: new Date(previousResult.created_at).toLocaleDateString() })}`}
            {scoreDiff === 0 && t('results.health_improved', { points: 0, date: new Date(previousResult.created_at).toLocaleDateString() })}
          </div>

          </div>
      )}

      {/* Main Grid: Analysis & Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px', marginBottom: '40px' }}>
        {/* Diagnostic View (Heatmaps/Originals) */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a56db' }}>
              <Microscope size={28} />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>
              {t('results.diagnostic_archives')}
            </h2>
          </div>

          <DiagnosticView result={result} isHistoryView={true} />
        </div>

        {/* Results Summary Card [REFACTORED] */}
        <div style={{...cardStyle, alignSelf: 'start'}}>
           <div style={{ fontSize: '32px', fontWeight: 900, color: '#111827', marginBottom: '32px', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px' }}>
              {t('results.results_summary')}
           </div>

           {/* Anemia Result — shown for eye/palm scans or fusion */}
           {(result.model_type === 'eye' || result.model_type === 'palm' || !['retina','skin'].includes(result.model_type)) && (
             <SummaryRow
               label={t('results.anemia_result')}
               value={
                 result.anemia_status === 'Anemic' ? t('results.status.anemic') :
                 result.anemia_status === 'Non-Anemic' ? t('results.status.non_anemic') :
                 result.anemia_status || t('results.status.not_scanned')
               }
               isPositive={result.anemia_status === 'Anemic'}
             />
           )}

           {/* Diabetes Result — shown for retina/skin scans or fusion */}
           {(result.model_type === 'retina' || result.model_type === 'skin' || !['eye','palm'].includes(result.model_type)) && (
             <SummaryRow
               label={t('results.diabetes_result')}
               value={
                 result.diabetes_status === 'Diabetic' ? t('results.status.diabetic') :
                 result.diabetes_status === 'Non-Diabetic' ? t('results.status.non_diabetic') :
                 result.dfu_status === 'Abnormal(Ulcer)' ? t('results.status.abnormal_ulcer') :
                 result.diabetes_status || t('results.status.not_scanned')
               }
               isPositive={result.diabetes_status === 'Diabetic' || result.dfu_status === 'Abnormal(Ulcer)'}
             />
           )}

           {result.skin_image_path && (
             <SummaryRow label={t('results.status.abnormal_ulcer')} value={result.dfu_result === 'Abnormal(Ulcer)' ? t('results.status.abnormal_ulcer') : t('results.status.normal')} isPositive={result.dfu_result === 'Abnormal(Ulcer)'} />
           )}
           <SummaryRow label={t('results.confidence')} value={`${(result.confidence || 0).toFixed(1)}%`} />
           <SummaryRow label={t('results.scan_date')} value={new Date(result.created_at).toLocaleDateString()} />
           <SummaryRow label={t('results.images_analyzed')} value={result.model_type} />
        </div>

      </div>

      {/* AI Interpretation Section [REFACTORED] */}
      <div style={{ ...cardStyle, background: '#f8fafc', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
             <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a56db', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <Zap size={24} />
             </div>
             <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>
                {t('results.how_ai_decided')}
             </h3>
          </div>

          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Dynamic AI Explanations */}
            {result.eye_image_path && (
               <ExplanationRow icon={Eye} title={t('results.eye_analysis')} text={t('results.analysis_explanations.eye_anemia')} />
            )}
            {result.palm_image_path && (
               <ExplanationRow icon={Hand} title={t('results.palm_analysis')} text={t('results.analysis_explanations.palm_anemia')} />
            )}
            {result.retina_image_path && (
               <ExplanationRow icon={Microscope} title={t('results.retina_analysis')} text={t('results.analysis_explanations.retina_diabetes')} />
            )}
            {result.skin_image_path && (
               <ExplanationRow icon={Footprints} title={t('results.foot_analysis')} text={t('results.analysis_explanations.skin_dfu')} />
            )}

            <div style={{ padding: '36px', background: '#eff6ff', borderRadius: '24px', marginTop: '24px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#1e40af', fontWeight: 1000, fontSize: '24px', marginBottom: '16px', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}>
                  <Info size={28} /> {t('results.ai_interpretation')}
               </div>

               {/* Show actual palm/eye model verdict clearly */}
               {(result.model_type === 'palm' || result.model_type === 'eye') && (
                 <div style={{
                   background: result.anemia_status === 'Anemic' ? '#fef2f2' : '#f0fdf4',
                   border: `2px solid ${result.anemia_status === 'Anemic' ? '#fca5a5' : '#86efac'}`,
                   borderRadius: '16px', padding: '20px 28px', marginBottom: '20px',
                   display: 'flex', alignItems: 'center', gap: '16px'
                 }}>
                   <span style={{ fontSize: '36px' }}>{result.anemia_status === 'Anemic' ? '⚠️' : '✅'}</span>
                   <div>
                     <div style={{ fontSize: '28px', fontWeight: 900, color: result.anemia_status === 'Anemic' ? '#dc2626' : '#059669', fontFamily: "'Outfit', sans-serif" }}>
                       Model Verdict: {result.anemia_status === 'Anemic' ? 'ANEMIC' : result.anemia_status === 'Non-Anemic' ? 'NON-ANEMIC' : result.anemia_status || 'Inconclusive'}
                     </div>
                     <div style={{ fontSize: '18px', color: '#6b7280', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>
                       Confidence: {result.confidence ? `${result.confidence.toFixed(1)}%` : 'N/A'} · Risk: {(result.anemia_risk || 'none').toUpperCase()}
                     </div>
                   </div>
                 </div>
               )}

               {(result.model_type === 'retina' || result.model_type === 'skin') && (
                 <div style={{
                   background: (result.diabetes_status === 'Diabetic' || result.dfu_status === 'Abnormal(Ulcer)') ? '#fef2f2' : '#f0fdf4',
                   border: `2px solid ${(result.diabetes_status === 'Diabetic' || result.dfu_status === 'Abnormal(Ulcer)') ? '#fca5a5' : '#86efac'}`,
                   borderRadius: '16px', padding: '20px 28px', marginBottom: '20px',
                   display: 'flex', alignItems: 'center', gap: '16px'
                 }}>
                   <span style={{ fontSize: '36px' }}>{(result.diabetes_status === 'Diabetic' || result.dfu_status === 'Abnormal(Ulcer)') ? '⚠️' : '✅'}</span>
                   <div>
                     <div style={{ fontSize: '28px', fontWeight: 900, color: (result.diabetes_status === 'Diabetic' || result.dfu_status === 'Abnormal(Ulcer)') ? '#dc2626' : '#059669', fontFamily: "'Outfit', sans-serif" }}>
                       Model Verdict: {result.model_type === 'retina' ? (result.diabetes_status || 'Inconclusive') : (result.dfu_status || 'Inconclusive')}
                     </div>
                     <div style={{ fontSize: '18px', color: '#6b7280', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>
                       Confidence: {result.confidence ? `${result.confidence.toFixed(1)}%` : 'N/A'} · Risk: {(result.diabetes_risk || result.dfu_risk || 'none').toUpperCase()}
                     </div>
                   </div>
                 </div>
               )}

               <p style={{ fontSize: '22px', color: '#1e40af', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, margin: 0 }}>
                  {t('results.analysis_explanations.summary_desc', { 
                    diagnosis: result.primary_diagnosis, 
                    type: result.model_type,
                    risk: t(`results.risk_levels.${(result.primary_risk_level || 'none').toLowerCase()}`)
                  })}
               </p>

            </div>
          </div>
      </div>

      {/* REMEDIES & PRECAUTIONS SECTION [NEW] */}
      <div id="remedies-section" style={{ 
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '24px', 
        padding: '48px', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '32px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px' }}>

            💊 {t('results.remedies_header')}
          </div>
          <div style={{ 
            background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', 
            fontSize: '18px', fontWeight: 800, padding: '8px 24px', borderRadius: '99px',
            fontFamily: "'DM Sans', sans-serif"
          }}>
            {t('results.consult_doctor_warning')}
          </div>
        </div>


        {/* Remedy Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
          {result.anemia_status === 'Anemic' && (
            <TabButton active={activeRemedyTab === 'anemia'} onClick={() => setActiveRemedyTab('anemia')}>
              {t('results.anemia_result')}
            </TabButton>
          )}
          {result.diabetes_status === 'Diabetic' && (
            <TabButton active={activeRemedyTab === 'diabetes'} onClick={() => setActiveRemedyTab('diabetes')}>
              {t('results.diabetes_result')}
            </TabButton>
          )}
          {result.dfu_result === 'Abnormal(Ulcer)' && (
            <TabButton active={activeRemedyTab === 'dfu'} onClick={() => setActiveRemedyTab('dfu')}>
              {t('results.status.abnormal_ulcer')}
            </TabButton>
          )}
          {/* Always show at least one if none detected */}
          {result.anemia_status !== 'Anemic' && result.diabetes_status !== 'Diabetic' && result.dfu_result !== 'Abnormal(Ulcer)' && (
            <TabButton active={true} disabled>{t('results.no_risks_detected')}</TabButton>
          )}

        </div>

        {/* Dynamic Remedy Content Grid */}
        {activeRemedyTab && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <RemedyColumn 
                title={t('results.diet')} 
                emoji="🥗"
                bg="#f0fdf4"
                items={t(`results.remedies.${activeRemedyTab}.${(result[`${activeRemedyTab}_risk`] || 'low').toLowerCase()}.diet`, { returnObjects: true })}
              />
              <RemedyColumn 
                title={t('results.supplements')} 
                emoji="💊"
                bg="#eff6ff"
                items={t(`results.remedies.${activeRemedyTab}.${(result[`${activeRemedyTab}_risk`] || 'low').toLowerCase()}.supplements`, { returnObjects: true })}
              />
              <RemedyColumn 
                title={t('results.lifestyle')} 
                emoji="🏃"
                bg="#fdf4ff"
                items={t(`results.remedies.${activeRemedyTab}.${(result[`${activeRemedyTab}_risk`] || 'low').toLowerCase()}.lifestyle`, { returnObjects: true })}
              />
              <RemedyColumn 
                title={t('results.precautions')} 
                emoji="⚠️"
                bg="#fff7ed"
                items={t(`results.remedies.${activeRemedyTab}.${(result[`${activeRemedyTab}_risk`] || 'low').toLowerCase()}.precautions`, { returnObjects: true })}
              />
          </div>
        )}

      </div>

      {/* ACTION PLAN TIMELINE [NEW] */}
      <div style={cardStyle}>
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '32px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px' }}>

              📋 {t('results.action_plan.title')}
            </div>
            <p style={{ marginTop: '8px', fontSize: '20px', color: '#6b7280', fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
              {t('results.action_plan.subtitle')}
            </p>
          </div>


          <div style={{ position: 'relative', paddingLeft: '20px' }}>
             <div style={{ position: 'absolute', left: '35px', top: '40px', bottom: '40px', width: '2px', background: '#e5e7eb' }}></div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <TimelineItem 
                  step="1"
                  title={t('results.action_plan.steps.save_report.title')}
                  desc={t('results.action_plan.steps.save_report.desc')}
                  time={t('results.action_plan.times.today')}
                />

                {result.primary_risk_level === 'high' && (
                  <TimelineItem 
                    step="2"
                    title={t('results.action_plan.steps.see_doctor.title')}
                    desc={t('results.action_plan.steps.see_doctor.desc')}
                    time={t('results.action_plan.times.today')}
                    urgent
                  />
                )}

                {result.anemia_status === 'Anemic' && (
                   <TimelineItem 
                      step={result.primary_risk_level === 'high' ? "3" : "2"}
                      title={t('results.action_plan.steps.cbc_test.title')}
                      desc={t('results.action_plan.steps.cbc_test.desc')}
                      time={result.anemia_risk === 'high' ? t('results.action_plan.times.this_week') : (result.anemia_risk === 'medium' ? t('results.action_plan.times.within_2_weeks') : t('results.action_plan.times.this_month'))}
                   />
                )}

                {result.diabetes_status === 'Diabetic' && (
                   <TimelineItem 
                      step={result.anemia_status === 'Anemic' ? "4" : "2"}
                      title={t('results.action_plan.steps.hba1c_test.title')}
                      desc={t('results.action_plan.steps.hba1c_test.desc')}
                      time={result.diabetes_risk === 'high' ? t('results.action_plan.times.this_week') : (result.diabetes_risk === 'medium' ? t('results.action_plan.times.within_2_weeks') : t('results.action_plan.times.this_month'))}
                   />
                )}

                {result.dfu_result === 'Abnormal(Ulcer)' && (
                   <TimelineItem 
                      step="3"
                      title={t('results.action_plan.steps.visit_podiatrist.title')}
                      desc={t('results.action_plan.steps.visit_podiatrist.desc')}
                      time={result.dfu_risk === 'high' ? t('results.action_plan.times.today') : (result.dfu_risk === 'medium' ? t('results.action_plan.times.within_3_days') : t('results.action_plan.times.this_week'))}
                      urgent={result.dfu_risk === 'high'}
                   />
                )}

                <TimelineItem 
                   step={result.primary_risk_level === 'high' ? "5" : "3"}
                   title={t('results.action_plan.steps.follow_up.title')}
                   desc={t('results.action_plan.steps.follow_up.desc')}
                   time={t('results.action_plan.times.in_4_6_weeks')}
                />
             </div>

          </div>
      </div>

      <style>{`
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .tab-pill { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .tab-pill:hover { background: #f1f5f9; }
        @media print {
            .action-bar, button, footer { display: none !important; }
            body { padding: 0 !important; }
            #remedies-section { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

// HELPER COMPONENTS

const SummaryRow = ({ label, value, isPositive }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #f3f4f6' }}>
    <span style={{ fontSize: '18px', color: '#6b7280', fontWeight: 800, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</span>
    <span style={{ 
      fontSize: '24px', fontWeight: 900, 
      color: isPositive ? '#dc2626' : (value === 'Not Scanned' ? '#94a3b8' : '#111827'),
      fontFamily: "'DM Sans', sans-serif"
    }}>{value}</span>
  </div>
);

const MetricRow = ({ label, risk, detected }) => {
  const getColors = () => {
    if (!detected) return { bg: '#f3f4f6', text: '#9ca3af', border: 'transparent' };
    const r = String(risk || 'low').toLowerCase();
    if (r === 'high') return { bg: '#fef2f2', text: '#dc2626', border: 'rgba(220,38,38,0.2)' };
    if (r === 'medium') return { bg: '#fffbeb', text: '#d97706', border: 'rgba(217,119,6,0.2)' };
    return { bg: '#f0fdf4', text: '#059669', border: 'rgba(5,150,105,0.2)' };
  };
  const colors = getColors();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: '22px', fontWeight: 900, color: '#4b5563', fontFamily: "'Outfit', sans-serif" }}>{label}</span>
      <span style={{ 
        fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px',
        background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
        padding: '8px 20px', borderRadius: '12px', minWidth: '120px', textAlign: 'center'
      }}>
        {detected ? `${risk} Risk` : 'N/A'}
      </span>
    </div>
  );
};

const Gauge = ({ score }) => {
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#059669' : (score >= 60 ? '#d97706' : '#dc2626');

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle 
          cx={size/2} cy={size/2} r={radius} fill="none" 
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" 
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '28px', fontWeight: 1000, color: color, fontFamily: "'Outfit', sans-serif" }}>{score}</span>
      </div>
    </div>
  );
};

const TabButton = ({ active, children, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className="tab-pill"
    style={{
      padding: '16px 40px', border: 'none', borderRadius: '14px', cursor: disabled ? 'default' : 'pointer',
      background: active ? '#1a56db' : 'transparent',
      color: active ? '#fff' : '#6b7280',
      fontWeight: 900, fontSize: '20px', fontFamily: "'DM Sans', sans-serif",
      boxShadow: active ? '0 12px 24px rgba(26,86,219,0.2)' : 'none'
    }}
  >
    {children}
  </button>
);

const RemedyColumn = ({ title, emoji, items, bg }) => (
  <div style={{ background: bg, borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div style={{ fontSize: '20px', fontWeight: 900, color: '#374151', textTransform: 'uppercase', letterSpacing: '1.2px', fontFamily: "'DM Sans', sans-serif" }}>
      {emoji} {title}
    </div>
    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {Array.isArray(items) && items.map((item, i) => (
        <li key={i} style={{ 
          fontSize: '24px', color: '#374151', lineHeight: 1.6, marginBottom: '20px', 
          display: 'flex', gap: '14px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif" 
        }}>
          <span style={{ color: '#1a56db', fontSize: '30px' }}>•</span> {item}
        </li>
      ))}
    </ul>
  </div>
);

const TimelineItem = ({ step, title, desc, time, urgent }) => {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
       <div style={{ 
         minWidth: '48px', height: '48px', borderRadius: '50%', 
         background: 'linear-gradient(135deg, #1a56db, #2563eb)',
         display: 'flex', alignItems: 'center', justifyContent: 'center',
         color: '#fff', fontSize: '20px', fontWeight: 900, fontFamily: "'Outfit', sans-serif",
         boxShadow: '0 8px 16px rgba(26,86,219,0.3)'
       }}>
         {step}
       </div>
       <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '28px', flex: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
             <h4 style={{ fontSize: '24px', fontWeight: 1000, color: '#111827', margin: 0, fontFamily: "'Outfit', sans-serif" }}>{title}</h4>
             <div style={{ display: 'flex', gap: '12px' }}>
               {urgent && <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '14px', fontWeight: 1000, padding: '4px 14px', borderRadius: '99px', letterSpacing: '0.5px' }}>{t('results.action_plan.urgent')}</span>}
               <span style={{ background: '#f1f5f9', color: '#6b7280', fontSize: '14px', fontWeight: 900, padding: '4px 14px', borderRadius: '99px' }}>{time}</span>
             </div>
          </div>
          <p style={{ fontSize: '24px', color: '#374151', lineHeight: 1.5, margin: 0, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{desc}</p>
       </div>
    </div>
  );
};

const ExplanationRow = ({ icon: Icon, title, text }) => (
  <div style={{ display: 'flex', gap: '24px', background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
     <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#f8fafc', color: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={28} />
     </div>
     <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '22px', fontWeight: 900, color: '#1e293b', marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>{title}</h4>
        <p style={{ fontSize: '24px', color: '#64748b', lineHeight: 1.5, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{text}</p>
     </div>
  </div>
);

const actionBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 24px',
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px',
  fontSize: '16px', fontWeight: 800, color: '#334155', cursor: 'pointer',
  transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
  fontFamily: "'DM Sans', sans-serif"
};

const cardStyle = {
  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px',
  padding: '36px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
};

export default ResultsPage;
