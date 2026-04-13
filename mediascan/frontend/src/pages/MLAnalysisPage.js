import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  Target, 
  Search, 
  Activity as ActivityIcon, 
  FileCheck, 
  Info, 
  ChevronRight, 
  Eye, 
  Hand, 
  Microscope, 
  Footprints,
  Download,
  Upload,
  X,
  Zap,
  CheckCircle2,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { mlAPI } from '../utils/api';

const METRICS_DATA = {
  eye: {
    name: 'Eye Anemia Model', dataset: 'Conjunctiva Dataset',
    architecture: 'MobileNetV2', inputSize: '224×224',
    trainSamples: 3200, valSamples: 800, epochsTrained: 28,
    accuracy: 91.25, precision: 90.43, recall: 92.11, f1: 91.26, auc: 96.34,
    loss: 0.2134, valLoss: 0.2891,
    trainingHistory: {
      accuracy:    [{epoch: 1, val: 61, vval: 58}, {epoch: 2, val: 72, vval: 69}, {epoch: 3, val: 79, vval: 76}, {epoch: 4, val: 83, vval: 80}, {epoch: 5, val: 86, vval: 83}, {epoch: 6, val: 88, vval: 86}, {epoch: 7, val: 89, vval: 87.5}, {epoch: 8, val: 90, vval: 88.8}, {epoch: 9, val: 90.6, vval: 89.9}, {epoch: 10, val: 91.1, vval: 90.8}, {epoch: 11, val: 91.25, vval: 91.2}],
      loss:    [{epoch: 1, val: 1.12, vval: 1.21}, {epoch: 2, val: 0.89, vval: 0.95}, {epoch: 3, val: 0.72, vval: 0.78}, {epoch: 4, val: 0.58, vval: 0.63}, {epoch: 5, val: 0.47, vval: 0.52}, {epoch: 6, val: 0.38, vval: 0.43}, {epoch: 7, val: 0.32, vval: 0.37}, {epoch: 8, val: 0.27, vval: 0.32}, {epoch: 9, val: 0.24, vval: 0.30}, {epoch: 10, val: 0.22, vval: 0.29}, {epoch: 11, val: 0.213, vval: 0.289}]
    },
    confusionMatrix: { tp: 768, tn: 712, fp: 68, fn: 52 },
    rocPoints: [{fpr: 0, tpr: 0}, {fpr: 0.05, tpr: 0.45}, {fpr: 0.10, tpr: 0.72}, {fpr: 0.15, tpr: 0.82}, {fpr: 0.20, tpr: 0.88}, {fpr: 0.30, tpr: 0.92}, {fpr: 0.50, tpr: 0.96}, {fpr: 0.80, tpr: 0.98}, {fpr: 1, tpr: 1}]
  },
  palm: {
    name: 'Palm Anemia Model', dataset: 'Palmar Dataset',
    architecture: 'MobileNetV2', inputSize: '224×224',
    trainSamples: 2900, valSamples: 725, epochsTrained: 25,
    accuracy: 88.60, precision: 87.92, recall: 89.34, f1: 88.62, auc: 94.81,
    loss: 0.2467, valLoss: 0.3102,
    trainingHistory: {
      accuracy:    [{epoch: 1, val: 58, vval: 55}, {epoch: 2, val: 69, vval: 66}, {epoch: 3, val: 76, vval: 73}, {epoch: 4, val: 80, vval: 77}, {epoch: 5, val: 83, vval: 80}, {epoch: 6, val: 85, vval: 83}, {epoch: 7, val: 86.5, vval: 84.5}, {epoch: 8, val: 87.2, vval: 85.8}, {epoch: 9, val: 87.9, vval: 86.7}, {epoch: 10, val: 88.3, vval: 87.8}, {epoch: 11, val: 88.6, vval: 88.6}],
      loss:    [{epoch: 1, val: 1.18, vval: 1.27}, {epoch: 2, val: 0.94, vval: 1.01}, {epoch: 3, val: 0.77, vval: 0.83}, {epoch: 4, val: 0.63, vval: 0.68}, {epoch: 5, val: 0.52, vval: 0.57}, {epoch: 6, val: 0.43, vval: 0.48}, {epoch: 7, val: 0.37, vval: 0.41}, {epoch: 8, val: 0.32, vval: 0.36}, {epoch: 9, val: 0.28, vval: 0.33}, {epoch: 10, val: 0.25, vval: 0.31}, {epoch: 11, val: 0.246, vval: 0.310}]
    },
    confusionMatrix: { tp: 693, tn: 634, fp: 81, fn: 67 },
    rocPoints: [{fpr: 0, tpr: 0}, {fpr: 0.06, tpr: 0.42}, {fpr: 0.11, tpr: 0.68}, {fpr: 0.17, tpr: 0.79}, {fpr: 0.23, tpr: 0.85}, {fpr: 0.33, tpr: 0.90}, {fpr: 0.52, tpr: 0.94}, {fpr: 0.78, tpr: 0.97}, {fpr: 1, tpr: 1}]
  },
  retina: {
    name: 'Retina Diabetes Model', dataset: 'APTOS 2019',
    architecture: 'MobileNetV2', inputSize: '224×224',
    trainSamples: 3600, valSamples: 900, epochsTrained: 30,
    accuracy: 93.10, precision: 92.67, recall: 93.58, f1: 93.12, auc: 97.43,
    loss: 0.1923, valLoss: 0.2614,
    trainingHistory: {
      accuracy:    [{epoch: 1, val: 63, vval: 60}, {epoch: 2, val: 74, vval: 71}, {epoch: 3, val: 81, vval: 78}, {epoch: 4, val: 85, vval: 82}, {epoch: 5, val: 88, vval: 85}, {epoch: 6, val: 90, vval: 88}, {epoch: 7, val: 91, vval: 89.5}, {epoch: 8, val: 91.8, vval: 90.4}, {epoch: 9, val: 92.3, vval: 91.2}, {epoch: 10, val: 92.8, vval: 92.1}, {epoch: 11, val: 93.1, vval: 93.1}],
      loss:    [{epoch: 1, val: 1.09, vval: 1.18}, {epoch: 2, val: 0.86, vval: 0.92}, {epoch: 3, val: 0.69, vval: 0.75}, {epoch: 4, val: 0.55, vval: 0.60}, {epoch: 5, val: 0.44, vval: 0.49}, {epoch: 6, val: 0.35, vval: 0.40}, {epoch: 7, val: 0.29, vval: 0.34}, {epoch: 8, val: 0.25, vval: 0.29}, {epoch: 9, val: 0.22, vval: 0.27}, {epoch: 10, val: 0.20, vval: 0.26}, {epoch: 11, val: 0.192, vval: 0.261}]
    },
    confusionMatrix: { tp: 879, tn: 821, fp: 59, fn: 41 },
    rocPoints: [{fpr: 0, tpr: 0}, {fpr: 0.04, tpr: 0.48}, {fpr: 0.08, tpr: 0.74}, {fpr: 0.13, tpr: 0.85}, {fpr: 0.18, tpr: 0.91}, {fpr: 0.28, tpr: 0.95}, {fpr: 0.45, tpr: 0.97}, {fpr: 0.75, tpr: 0.99}, {fpr: 1, tpr: 1}]
  },
  skin: {
    name: 'DFU Skin Model', dataset: 'KIN Dataset',
    architecture: 'MobileNetV2', inputSize: '224×224',
    trainSamples: 2800, valSamples: 700, epochsTrained: 32,
    accuracy: 92.87, precision: 93.41, recall: 91.98, f1: 92.69, auc: 97.12,
    loss: 0.1876, valLoss: 0.2341,
    trainingHistory: {
      accuracy:    [{epoch: 1, val: 58, vval: 55}, {epoch: 2, val: 68, vval: 65}, {epoch: 3, val: 76, vval: 73}, {epoch: 4, val: 82, vval: 79}, {epoch: 5, val: 86, vval: 83}, {epoch: 6, val: 88, vval: 86}, {epoch: 7, val: 90, vval: 88}, {epoch: 8, val: 91.4, vval: 90.0}, {epoch: 9, val: 92.0, vval: 91.2}, {epoch: 10, val: 92.5, vval: 92.0}, {epoch: 11, val: 92.7, vval: 92.6}, {epoch: 12, val: 92.87, vval: 92.87}],
      loss:    [{epoch: 1, val: 1.18, vval: 1.26}, {epoch: 2, val: 0.94, vval: 0.99}, {epoch: 3, val: 0.76, vval: 0.81}, {epoch: 4, val: 0.61, vval: 0.66}, {epoch: 5, val: 0.50, vval: 0.55}, {epoch: 6, val: 0.41, vval: 0.46}, {epoch: 7, val: 0.34, vval: 0.39}, {epoch: 8, val: 0.29, vval: 0.33}, {epoch: 9, val: 0.25, vval: 0.30}, {epoch: 10, val: 0.22, vval: 0.27}, {epoch: 11, val: 0.20, vval: 0.24}, {epoch: 12, val: 0.187, vval: 0.234}]
    },
    confusionMatrix: { tp: 663, tn: 638, fp: 47, fn: 52 },
    rocPoints: [{fpr: 0, tpr: 0}, {fpr: 0.04, tpr: 0.48}, {fpr: 0.08, tpr: 0.74}, {fpr: 0.13, tpr: 0.84}, {fpr: 0.18, tpr: 0.90}, {fpr: 0.28, tpr: 0.94}, {fpr: 0.45, tpr: 0.97}, {fpr: 0.75, tpr: 0.99}, {fpr: 1, tpr: 1}]
  }
};

const MLAnalysisPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('eye');
  const [metrics, setMetrics] = useState(null);
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [chartMode, setChartMode] = useState('accuracy'); // 'accuracy' or 'loss'
  const [isGradCamExpanded, setIsGradCamExpanded] = useState(false);
  
  // GradCAM Visualizer States
  const [selectedFile, setSelectedFile] = useState(null);
  const [visualizerModel, setVisualizerModel] = useState('eye');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gradCamResult, setGradCamResult] = useState(null);

  // Fetch metrics from backend
  useEffect(() => {
    const fetchMetrics = async () => {
        try {
            const res = await mlAPI.getMetrics();
            setMetrics(res.data);
            setCurrentMetrics(res.data.eye);
        } catch (err) {
            console.error("Failed to fetch ML metrics:", err);
            toast.error("Failed to load clinical performance data.");
        }
    };
    fetchMetrics();
  }, []);

  // Transformation Helpers
  const formatHistoryData = (history, mode) => {
    if (!history || !history[mode]) return [];
    return history[mode].map((val, index) => ({
        epoch: index + 1,
        val: val,
        vval: history[mode === 'accuracy' ? 'valAccuracy' : 'valLoss'][index]
    }));
  };

  const renderConfusionMatrix = (matrix, classes) => {
    if (!matrix || !classes) return null;
    
    // For Binary Models (2x2)
    if (classes.length === 2) {
        const tn = matrix[1][1];
        const fp = matrix[1][0];
        const fn = matrix[0][1];
        const tp = matrix[0][0];
        
        return (
            <div style={{ gridColumn: '2', gridRow: '2', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '20px' }}>
                <div style={matrixBoxStyle('#ecfdf5', '#065f46')}>
                    <span style={matrixNumberStyle}>{tn}</span>
                    <span style={matrixLabelStyle}>{t('ml.true_negative')} ({classes[1]})</span>
                </div>
                <div style={matrixBoxStyle('#fef2f2', '#991b1b')}>
                    <span style={matrixNumberStyle}>{fp}</span>
                    <span style={matrixLabelStyle}>{t('ml.false_positive')}</span>
                </div>
                <div style={matrixBoxStyle('#fff7ed', '#92400e')}>
                    <span style={matrixNumberStyle}>{fn}</span>
                    <span style={matrixLabelStyle}>{t('ml.false_negative')}</span>
                </div>
                <div style={matrixBoxStyle('#ecfdf5', '#065f46')}>
                    <span style={matrixNumberStyle}>{tp}</span>
                    <span style={matrixLabelStyle}>{t('ml.true_positive')} ({classes[0]})</span>
                </div>
            </div>
        );
    }

    // For Multi-class (e.g. 5x5 for Retina)
    return (
        <div style={{ 
            gridColumn: '2', gridRow: '2', 
            display: 'grid', 
            gridTemplateColumns: `repeat(${classes.length}, 1fr)`, 
            gap: '8px',
            background: '#f8fafc',
            padding: '12px',
            borderRadius: '16px'
        }}>
            {matrix.map((row, i) => row.map((cell, j) => (
                <div key={`${i}-${j}`} style={{
                    background: i === j ? '#ecfdf5' : '#fff',
                    color: i === j ? '#065f46' : '#64748b',
                    padding: '10px 4px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e2e8f0',
                    minWidth: '0',
                    opacity: cell === 0 ? 0.3 : 1
                }}>
                    <span style={{ fontSize: '18px', fontWeight: 900 }}>{cell}</span>
                    {i === j && <span style={{ fontSize: '10px', fontWeight: 700 }}>{classes[i]}</span>}
                </div>
            )))}
        </div>
    );
  };
  
  // Tab Switch logic
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (metrics && metrics[tabId]) {
        setCurrentMetrics(metrics[tabId]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleGenerateGradCam = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setGradCamResult(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('model_type', visualizerModel);

    try {
        const res = await mlAPI.generateGradcam(formData);
        setGradCamResult(res.data);
    } catch (err) {
        toast.error(t('ml.analysis_failed'));
    } finally {
        setIsAnalyzing(false);
    }
  };

  const MetricCard = ({ icon: Icon, label, value, tooltip }) => {
    const [displayVal, setDisplayVal] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1200;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuad = 1 - (1 - progress) * (1 - progress);
            setDisplayVal((start + (value - start) * easeOutQuad).toFixed(2));

            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [value]);

    return (
        <div style={{
            background: '#ffffff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '24px',
            padding: '40px 32px', 
            textAlign: 'center', 
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
        }} className="premium-metric-card">
            <div style={{ marginBottom: '24px', color: '#1a56db' }}><Icon size={40} strokeWidth={1.5} /></div>
            <div style={{ 
                fontSize: '72px', 
                fontWeight: 900, 
                lineHeight: 0.9,
                background: value >= 90 ? 'linear-gradient(135deg, #059669, #10b981)' : (value >= 80 ? 'linear-gradient(135deg, #1a56db, #3b82f6)' : 'linear-gradient(135deg, #d97706, #f59e0b)'),
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-3px',
                fontFamily: "'Outfit', sans-serif"
            }}>
                {displayVal}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'DM Sans', sans-serif" }}>{t(`ml.${label.toLowerCase().replace('-', '')}`)}</span>
                <div className="tooltip-container" style={{ position: 'relative' }}>
                    <Info size={18} color="#94a3b8" style={{ cursor: 'help' }} />
                    <span className="tooltip-text">{t(`ml.${label.toLowerCase().replace('-', '')}_desc`)}</span>
                </div>
            </div>
        </div>
    );
  };

    if (!metrics || !currentMetrics) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center' }}>
                    <ActivityIcon className="animate-spin" size={64} color="#1a56db" style={{ marginBottom: '24px' }} />
                    <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b', fontFamily: "'Outfit', sans-serif" }}>Synchronizing Clinical Models...</h2>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', margin: '0 auto', padding: '48px 5vw' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '52px', borderBottom: '1px solid #e2e8f0', paddingBottom: '40px' }}>
                <h1 style={{ 
                    fontSize: '48px', fontWeight: 900, color: '#111827', 
                    fontFamily: "'Outfit', sans-serif", marginBottom: '12px',
                    letterSpacing: '-2px'
                }}>
                    {t('ml.heading')}
                </h1>
                <p style={{ fontSize: '24px', color: '#64748b', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                    {t('ml.subtitle')}
                </p>
            </div>

      {/* SECTION A: Model Performance */}
      <section style={{ marginBottom: '48px' }}>
          {/* Tabs */}
          <div style={{ 
            background: '#f1f5f9', borderRadius: '16px', padding: '6px', 
            display: 'inline-flex', gap: '6px', marginBottom: '40px' 
          }}>
              {Object.keys(metrics).map(key => (
                    <button
                        key={key}
                        onClick={() => handleTabChange(key)}
                        style={{
                            padding: '18px 36px', fontSize: '22px', cursor: 'pointer',
                            border: 'none', borderRadius: '12px',
                            background: activeTab === key ? '#ffffff' : 'transparent',
                            color: activeTab === key ? '#1a56db' : '#64748b',
                            fontWeight: activeTab === key ? 900 : 700,
                            boxShadow: activeTab === key ? '0 8px 16px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s',
                            fontFamily: "'DM Sans', sans-serif"
                        }}
                    >
                      {key === 'eye' && t('ml.eye_model')}
                      {key === 'palm' && t('ml.palm_model')}
                      {key === 'retina' && t('ml.retina_model')}
                      {key === 'skin' && t('ml.skin_model')}
                  </button>
              ))}
          </div>

          {/* Metric Cards Grid */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '24px', marginBottom: '40px' 
          }}>
              <MetricCard icon={Target} label="Accuracy" value={currentMetrics.accuracy} tooltip="% of total predictions that were correct" />
              <MetricCard icon={Search} label="Precision" value={currentMetrics.precision} tooltip="% of positive predictions that were actually positive" />
              <MetricCard icon={ActivityIcon} label="Recall" value={currentMetrics.recall} tooltip="% of actual positives correctly identified" />
              <MetricCard icon={FileCheck} label="F1-Score" value={currentMetrics.f1} tooltip="Harmonic mean of Precision and Recall" />
              <MetricCard icon={BarChart3} label="AUC" value={currentMetrics.auc} tooltip="Area Under the ROC Curve — model's ability to distinguish classes" />
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', marginBottom: '40px' }}>
              {/* Training History Chart */}
              <div style={{ 
                  background: '#ffffff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '32px', 
                  padding: '40px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
              }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                      <h3 style={{ fontSize: '34px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1.5px' }}>{t('ml.training_history')}</h3>
                      <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '6px', borderRadius: '14px' }}>
                          <button 
                            onClick={() => setChartMode('accuracy')}
                            style={{ 
                                padding: '12px 28px', fontSize: '18px', fontWeight: 900, border: 'none', borderRadius: '10px', cursor: 'pointer',
                                background: chartMode === 'accuracy' ? '#1a56db' : 'transparent', 
                                color: chartMode === 'accuracy' ? '#fff' : '#64748b',
                                transition: '0.2s'
                            }}
                          > {t('ml.accuracy')} </button>
                          <button 
                            onClick={() => setChartMode('loss')}
                            style={{ 
                                padding: '12px 28px', fontSize: '18px', fontWeight: 900, border: 'none', borderRadius: '10px', cursor: 'pointer',
                                background: chartMode === 'loss' ? '#1a56db' : 'transparent', 
                                color: chartMode === 'loss' ? '#fff' : '#64748b',
                                transition: '0.2s'
                            }}
                          > {t('ml.loss')} </button>
                      </div>
                  </div>
                  <ResponsiveContainer width="100%" height={360}>
                      <LineChart data={formatHistoryData(currentMetrics.trainingHistory, chartMode)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="epoch" tick={{fontSize: 18, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fontSize: 18, fill: '#94a3b8'}} axisLine={false} tickLine={false} domain={chartMode === 'accuracy' ? [0, 100] : [0, 1.5]} />
                          <RechartsTooltip contentStyle={{background: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', padding: '20px'}} />
                          <Legend wrapperStyle={{ fontSize: '18px', paddingTop: '36px' }} iconType="circle" />
                          <Line type="monotone" dataKey="val" name={t('ml.clinical_training')} stroke="#1a56db" strokeWidth={5} dot={{r: 6, fill: '#1a56db', strokeWidth: 3, stroke: '#fff'}} activeDot={{ r: 10, strokeWidth: 0 }} />
                          <Line type="monotone" dataKey="vval" name={t('ml.model_validation')} stroke="#0ea5e9" strokeWidth={5} strokeDasharray="10 10" dot={{r: 6, fill: '#0ea5e9', strokeWidth: 3, stroke: '#fff'}} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>

              {/* Confusion Matrix */}
              <div style={{ 
                  background: '#ffffff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '32px', 
                  padding: '40px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
              }}>
                  <h3 style={{ fontSize: '34px', fontWeight: 900, color: '#111827', marginBottom: '48px', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1.5px' }}>{t('ml.prediction_matrix')}</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr', gridTemplateRows: '30px 1fr', gap: '12px' }}>
                   <div style={{ gridColumn: '2', textAlign: 'center', fontSize: '16px', fontWeight: 900, color: '#94a3b8', letterSpacing: '1.5px', fontFamily: "'DM Sans', sans-serif" }}>{t('ml.predicted_model')}</div>
                   <div style={{ gridRow: '2', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center', fontSize: '16px', fontWeight: 900, color: '#94a3b8', letterSpacing: '1.5px', fontFamily: "'DM Sans', sans-serif" }}>{t('ml.actual_labels')}</div>
                   
                   {renderConfusionMatrix(currentMetrics.confusionMatrix, currentMetrics.classNames)}
                  </div>
              </div>
          </div>

          {/* ROC Curve Area */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px', padding: '40px', marginBottom: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div>
                     <h3 style={{ fontSize: '34px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1.5px' }}>{t('ml.roc_analysis')}</h3>
                     <p style={{ fontSize: '22px', color: '#64748b', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{t('ml.roc_subtitle')}</p>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: '18px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 900 }}>{t('ml.performance_index')}</div>
                       <div style={{ 
                           fontSize: '64px', fontWeight: 900, 
                           background: 'linear-gradient(135deg, #1a56db, #3b82f6)',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           fontFamily: "'Outfit', sans-serif",
                           letterSpacing: '-3px'
                       }}>{currentMetrics.auc / 100}</div>
                   </div>
                </div>
               <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={currentMetrics.rocPoints}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="fpr" tick={{fontSize: 14, fill: '#94a3b8'}} type="number" domain={[0, 1]} />
                    <YAxis dataKey="tpr" tick={{fontSize: 14, fill: '#94a3b8'}} type="number" domain={[0, 1]} />
                    <ReferenceLine x={0} stroke="#cbd5e1" />
                    <Line type="monotone" dataKey="tpr" stroke="#1a56db" strokeWidth={4} dot={false} />
                    <Area type="monotone" dataKey="tpr" stroke="none" fill="#1a56db" fillOpacity={0.08} />
                    <Line data={[{fpr: 0, tpr: 0}, {fpr: 1, tpr: 1}]} dataKey="tpr" stroke="#94a3b8" strokeDasharray="8 8" dot={false} />
                    <RechartsTooltip />
                  </AreaChart>
               </ResponsiveContainer>
               
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '40px' }}>
                  <div style={pillStyle}>🏗 {currentMetrics.architecture}</div>
                  <div style={pillStyle}>📐 {currentMetrics.inputSize}</div>
                  <div style={pillStyle}>🗂 {currentMetrics.trainSamples} {t('ml.train_images')}</div>
                  <div style={pillStyle}>✅ {currentMetrics.valSamples} {t('ml.val_images')}</div>
                  <div style={pillStyle}>🔁 {currentMetrics.epochsTrained} {t('ml.epochs')}</div>
                  <div style={pillStyle}>📊 {currentMetrics.dataset}</div>
               </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px', padding: '40px', overflowX: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '34px', fontWeight: 900, color: '#111827', marginBottom: '32px', letterSpacing: '-1px' }}>{t('ml.comparison_matrix')}</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', color: '#94a3b8', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 1000 }}>
                            <th style={{ padding: '32px 40px', textAlign: 'left', borderRadius: '20px 0 0 20px' }}>{t('ml.diag_intel')}</th>
                            <th style={{ padding: '32px 40px' }}>{t('ml.accuracy')}</th>
                            <th style={{ padding: '32px 40px' }}>{t('ml.precision')}</th>
                            <th style={{ padding: '32px 40px' }}>{t('ml.recall')}</th>
                            <th style={{ padding: '32px 40px' }}>{t('ml.f1')}</th>
                            <th style={{ padding: '32px 40px', borderRadius: '0 20px 20px 0' }}>{t('ml.auc')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(metrics).map(([key, model]) => (
                            <tr key={key} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="table-row-hover">
                                <td style={{ padding: '40px', textAlign: 'left', fontWeight: 900, color: '#1e293b', fontSize: '26px', fontFamily: "'Outfit', sans-serif" }}>
                                    {key === 'eye' ? '👁' : (key === 'palm' ? '🖐' : (key === 'retina' ? '🔬' : '🦶'))} {model.name}
                                </td>
                                <td style={{ padding: '40px', fontWeight: 800, fontSize: '26px', color: '#334155' }}>{model.accuracy}%</td>
                                <td style={{ padding: '40px', fontWeight: 800, fontSize: '26px', color: '#334155' }}>{model.precision}%</td>
                                <td style={{ padding: '40px', fontWeight: 800, fontSize: '26px', color: '#334155' }}>{model.recall}%</td>
                                <td style={{ padding: '40px', fontWeight: 800, fontSize: '26px', color: '#334155' }}>{model.f1}%</td>
                                <td style={{ padding: '40px', fontWeight: 900, color: '#1a56db', fontSize: '28px', fontFamily: "'Outfit', sans-serif" }}>{model.auc}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
          </div>
      </section>
 
      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '60px 0' }} />
 
      {/* SECTION B: Live GradCAM Visualizer */}
      <section style={{ marginBottom: '60px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: '16px', letterSpacing: '-1.5px' }}>
                {t('ml.heatmap_title')}
            </h2>
            <p style={{ fontSize: '24px', color: '#64748b', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                {t('ml.heatmap_subtitle')}
            </p>
          </div>
 
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', marginBottom: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
             <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setIsGradCamExpanded(!isGradCamExpanded)}
             >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontWeight: 900, fontSize: '34px', color: '#1e293b', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px' }}>
                    <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={36} color="#1a56db" />
                    </div>
                    {t('ml.gradcam_overview')}
                </div>
                <ChevronRight size={40} color="#94a3b8" style={{ transform: isGradCamExpanded ? 'rotate(90deg)' : 'none', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
             </div>
             {isGradCamExpanded && (
                 <div style={{ marginTop: '32px', padding: '32px', background: '#f8fafc', borderRadius: '24px', fontSize: '24px', color: '#475569', lineHeight: 1.8, border: '1px solid #e2e8f0' }}>
                     {t('ml.gradcam_desc')}
                     <ul style={{ margin: '24px 0', paddingLeft: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                         <li style={{ listStyleType: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
                             <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ef4444' }}></div>
                             <span><span style={{color: '#dc2626', fontWeight: 900}}>{t('ml.red_clusters')}</span> {t('ml.red_desc')}</span>
                         </li>
                         <li style={{ listStyleType: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
                             <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#3b82f6' }}></div>
                             <span><span style={{color: '#1d4ed8', fontWeight: 900}}>{t('ml.blue_regions')}</span> {t('ml.blue_desc')}</span>
                         </li>
                     </ul>
                 </div>
             )}
          </div>
 
          <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: '32px' }}>
              <div style={{ 
                  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px', 
                  padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', alignSelf: 'start'
              }}>
                  <div 
                    onClick={() => document.getElementById('gradcam-input').click()}
                    style={{
                        border: '3px dashed #cbd5e1', background: '#f8fafc', borderRadius: '24px',
                        padding: '60px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#1a56db'; e.currentTarget.style.background = '#eff6ff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                  >
                        <input id="gradcam-input" type="file" hidden onChange={handleFileSelect} accept="image/*" />
                        {selectedFile ? (
                            <div style={{ animation: 'fadeIn 0.4s ease' }}>
                                <img src={URL.createObjectURL(selectedFile)} style={{ height: '180px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }} />
                                <div style={{ fontSize: '20px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>{selectedFile.name}</div>
                                <div style={{ fontSize: '18px', color: '#94a3b8', marginTop: '6px', fontWeight: 500 }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB Image File</div>
                            </div>
                        ) : (
                            <div style={{ animation: 'fadeIn 0.4s ease' }}>
                                <div style={{ width: '96px', height: '96px', background: '#fff', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 16px rgba(0,0,0,0.06)' }}>
                                    <Upload size={48} color="#1a56db" />
                                </div>
                                <div style={{ fontWeight: 900, color: '#111827', fontSize: '24px', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}>{t('ml.forensic_upload')}</div>
                                <div style={{ fontSize: '18px', color: '#94a3b8', marginTop: '12px', fontWeight: 500 }}>{t('ml.drop_medical')}</div>
                            </div>
                        )}
                  </div>
 
                  <div style={{ marginTop: '32px' }}>
                        <label style={{ fontSize: '24px', fontWeight: 900, color: '#334155', display: 'block', marginBottom: '16px', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px' }}>{t('ml.model_select')}</label>
                        <select 
                            value={visualizerModel}
                            onChange={(e) => setVisualizerModel(e.target.value)}
                            style={{ 
                                width: '100%', height: '72px', padding: '0 20px', borderRadius: '16px', 
                                border: '1px solid #e2e8f0', background: '#fff', fontSize: '22px', fontWeight: 800, color: '#1e293b',
                                outline: 'none', cursor: 'pointer', appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")',
                                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 20px center', backgroundSize: '18px'
                            }}
                        >
                            <option value="eye">👁 Eye Model — Anemia Selection</option>
                            <option value="palm">🖐 Palm Model — Anemia Selection</option>
                            <option value="retina">🔬 Retina Model — Diabetes Detection</option>
                            <option value="skin">🦶 Skin Model — Foot Ulcer Diagnostics</option>
                        </select>
                  </div>
 
                  <button
                    onClick={handleGenerateGradCam}
                    disabled={!selectedFile || isAnalyzing}
                    style={{
                        width: '100%', height: '64px', marginTop: '32px', border: 'none', borderRadius: '16px', 
                        background: selectedFile ? 'linear-gradient(135deg, #1a56db, #2563eb)' : '#f1f5f9',
                        color: selectedFile ? '#fff' : '#94a3b8', fontWeight: 900, fontSize: '22px',
                        cursor: selectedFile ? 'pointer' : 'not-allowed', 
                        boxShadow: selectedFile ? '0 12px 30px rgba(26,86,219,0.3)' : 'none',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px',
                        fontFamily: "'Outfit', sans-serif", letterSpacing: '0.5px'
                    }}
                  >
                      {isAnalyzing ? (
                        <>
                            <ActivityIcon className="animate-spin" size={24} /> {t('ml.generating_heatmap')}
                        </>
                      ) : (
                          <><Zap size={24} fill="currentColor" /> {t('ml.generate_heatmap')}</>
                      )}
                  </button>
              </div>
 
              {/* Visualization Panels */}
              <div style={{ minHeight: '500px' }}>
                  {!gradCamResult && !isAnalyzing ? (
                      <div style={{ height: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                          <BarChart3 size={80} color="#e2e8f0" />
                          <p style={{ marginTop: '24px', color: '#94a3b8', fontWeight: 900, fontSize: '24px', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}>{t('ml.awaiting_diag')}</p>
                          <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '360px', textAlign: 'center', marginTop: '12px', fontWeight: 500 }}>{t('ml.awaiting_desc')}</p>
                      </div>
                  ) : gradCamResult ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                          <div style={panelStyle} className="premium-card-hover">
                                <div style={panelHeader}>{t('ml.raw_forensics')}</div>
                                <div style={panelBody}>
                                    <img src={gradCamResult.original_image_base64} alt="original" style={imgFit} />
                                </div>
                          </div>
                          <div style={panelStyle} className="premium-card-hover">
                                <div style={panelHeader}>{t('ml.activation_heatmap')}</div>
                                <div style={panelBody}>
                                    <img src={gradCamResult.gradcam_image_base64} alt="heatmap" style={imgFit} />
                                    <div style={{ marginTop: '20px' }}>
                                        <div style={{ height: '12px', width: '100%', borderRadius: '6px', background: 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #ef4444)' }}></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginTop: '8px', fontWeight: 800, letterSpacing: '0.5px' }}>
                                            <span>{t('ml.low_attention')}</span>
                                            <span>{t('ml.critical_focus')}</span>
                                        </div>
                                    </div>
                                </div>
                          </div>
                          <div style={panelStyle} className="premium-card-hover">
                                <div style={panelHeader}>{t('ml.diag_inference')}</div>
                                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                                    <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                                        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                                            <circle cx="50" cy="50" r="44" fill="none" stroke="#1a56db" strokeWidth="10" 
                                                strokeDasharray="276" strokeDashoffset={276 * (1 - gradCamResult.confidence/100)} 
                                                strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }} 
                                            />
                                        </svg>
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ fontWeight: 900, fontSize: '52px', color: '#1e293b', fontFamily: "'Outfit', sans-serif", letterSpacing: '-2px' }}>{gradCamResult.confidence}%</div>
                                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('ml.certainty')}</div>
                                        </div>
                                    </div>
 
                                    <div style={{ 
                                        padding: '14px 32px', borderRadius: '16px', fontSize: '20px', fontWeight: 900,
                                        background: gradCamResult.prediction === 'positive' ? '#fef2f2' : '#f0fdf4',
                                        color: gradCamResult.prediction === 'positive' ? '#dc2626' : '#059669',
                                        border: gradCamResult.prediction === 'positive' ? '2px solid rgba(220,38,38,0.2)' : '2px solid rgba(5,150,105,0.2)',
                                        letterSpacing: '1px', boxShadow: '0 8px 16px rgba(0,0,0,0.06)', fontFamily: "'Outfit', sans-serif"
                                    }}>
                                        {gradCamResult.prediction.toUpperCase()} {t('ml.identified')}
                                    </div>
 
                                    <p style={{ fontSize: '16px', color: '#475569', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.6, fontWeight: 500 }}>
                                        "{gradCamResult.interpretation}"
                                    </p>
 
                                        <button 
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = gradCamResult.gradcam_image_base64;
                                            link.download = `MediScan_Heatmap_Forensics.jpg`;
                                            link.click();
                                        }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 28px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '17px', fontWeight: 800, cursor: 'pointer', color: '#1a56db', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <Download size={20} /> {t('ml.export_analysis')}
                                    </button>
                                </div>
                          </div>
                      </div>
                  ) : null}
              </div>
          </div>
      </section>
 
      <style>{`
        .premium-metric-card:hover { 
            box-shadow: 0 25px 50px -12px rgba(17,24,39,0.08); 
            transform: translateY(-8px); 
            border-color: #bfdbfe;
        }
        .premium-card-hover:hover {
            box-shadow: 0 20px 40px rgba(0,0,0,0.06);
            transform: translateY(-4px);
        }
        .table-row-hover:hover {
            background: #f8fafc;
        }
        .tooltip-text {
            visibility: hidden; width: 220px; background-color: #1e293b; color: #fff; text-align: center;
            border-radius: 12px; padding: 12px; position: absolute; z-index: 10; bottom: 125%; left: 50%;
            margin-left: -110px; opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); font-size: 14px; line-height: 1.5; pointer-events: none;
            box-shadow: 0 10px 15px rgba(0,0,0,0.1);
            transform: translateY(10px);
        }
        .tooltip-container:hover .tooltip-text { visibility: visible; opacity: 1; transform: translateY(0); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
 
const matrixBoxStyle = (bg, color) => ({ 
    background: bg, color: color, minHeight: '160px', borderRadius: '24px', 
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
    border: `1px solid ${color}20` 
});
const matrixNumberStyle = { fontSize: '56px', fontWeight: 900, fontFamily: "'Outfit', sans-serif" };
const matrixLabelStyle = { fontSize: '16px', fontWeight: 900, opacity: 0.7, fontFamily: "'DM Sans', sans-serif" };

const badgeStyle = {
    padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '11px', color: '#64748b', fontWeight: 800, letterSpacing: '0.5px'
};
badgeStyle.span = { color: '#1a56db' };
 
const pillStyle = {
    padding: '12px 24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '20px', color: '#334155', whiteSpace: 'nowrap', fontWeight: 800, boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};
 
const panelStyle = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' };
const panelHeader = { padding: '18px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '16px', fontWeight: 800, color: '#1e293b', background: '#f8fafc', textTransform: 'uppercase', letterSpacing: '1px' };
const panelBody = { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' };
const imgFit = { width: '100%', height: '220px', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
 
export default MLAnalysisPage;
