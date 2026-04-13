import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Clock,
  FileText,
  Activity,
  History as HistoryIcon,
  Eye,
  Footprints,
  Droplet,
  Microscope,
  ArrowUpRight
} from 'lucide-react';
import { predictionsAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';

const HistoryPage = () => {
    const { t } = useTranslation();
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await predictionsAPI.getHistory();
                setScans(res.data.predictions || []);
            } catch (err) {
                console.error("Clinical history retrieval failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredHistory = scans.filter(item => {
        const itemIdStr = String(item.id);
        const matchesSearch = itemIdStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.overall_risk?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || item.model_type === filter;
        return matchesSearch && matchesFilter;
    });

    const getModelIcon = (type) => {
        switch(type) {
            case 'eye': return <Eye size={18} />;
            case 'palm': return <Droplet size={18} />;
            case 'retina': return <Microscope size={18} />;
            case 'skin': return <Footprints size={18} />;
            default: return <Activity size={18} />;
        }
    };

    if (loading) return (
        <div style={{ padding: '80px', textAlign: 'center' }}>
            <Activity className="animate-spin" size={60} color="#1a56db" />
            <p style={{ marginTop: '24px', color: '#64748b', fontSize: '20px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Synchronizing clinical archives...</p>
        </div>
    );

    return (
        <div style={{ 
            width: '100%', margin: '0 auto', padding: '48px 5vw',
            animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}>
            {/* Header Area */}
            <div style={{ marginBottom: '52px', borderBottom: '1px solid #e2e8f0', paddingBottom: '40px' }}>
                <h1 style={{ 
                    fontSize: '56px', fontWeight: 900, color: '#111827', 
                    fontFamily: "'Outfit', sans-serif", marginBottom: '12px',
                    letterSpacing: '-2px'
                }}>
                    {t('history.heading')}
                </h1>
                <p style={{ fontSize: '24px', color: '#64748b', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                    {t('history.subtitle')}
                </p>
            </div>

            {/* Expansive Search & Filter Toolbar */}
            <div style={{ 
                display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap',
                background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '24px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
                <div style={{ flex: 2, minWidth: '400px', position: 'relative', display: 'flex', alignItems: 'center', padding: '0 24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <Search color="#94a3b8" size={28} />
                    <input 
                        type="text" 
                        placeholder={t('history.search_placeholder')}
                        style={{
                            width: '100%', height: '72px', padding: '0 24px', border: 'none', background: 'transparent',
                            fontSize: '22px', fontWeight: 700, outline: 'none', color: '#111827', fontFamily: "'DM Sans', sans-serif"
                        }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <Filter color="#94a3b8" size={28} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
                    <select 
                        style={{
                            height: '72px', padding: '0 56px 0 64px', borderRadius: '20px', border: '1px solid #e2e8f0',
                            background: '#f8fafc', fontSize: '22px', fontWeight: 900, color: '#1e293b',
                            cursor: 'pointer', appearance: 'none', fontFamily: "'DM Sans', sans-serif"
                        }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">{t('history.filter_all')}</option>
                        <option value="eye">Eye Anemia</option>
                        <option value="palm">Palm Anemia</option>
                        <option value="retina">Retina Diabetes</option>
                        <option value="skin">DFU Skin</option>
                    </select>
                </div>
            </div>

            {/* Fluid Data Grid */}
            <div style={{ 
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px',
                overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ textAlign: 'left', padding: '24px 32px', color: '#64748b', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'DM Sans', sans-serif" }}>{t('history.table.patient_id')}</th>
                            <th style={{ textAlign: 'left', padding: '24px 32px', color: '#64748b', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'DM Sans', sans-serif" }}>{t('history.table.type')}</th>
                            <th style={{ textAlign: 'left', padding: '24px 32px', color: '#64748b', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'DM Sans', sans-serif" }}>{t('history.table.result')}</th>
                            <th style={{ textAlign: 'left', padding: '24px 32px', color: '#64748b', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'DM Sans', sans-serif" }}>{t('history.table.risk')}</th>
                            <th style={{ textAlign: 'left', padding: '24px 32px', color: '#64748b', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'DM Sans', sans-serif" }}>{t('history.table.date')}</th>
                            <th style={{ textAlign: 'right', padding: '24px 32px', color: '#64748b', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'DM Sans', sans-serif" }}>{t('history.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHistory.length > 0 ? (
                            filteredHistory.map((item, idx) => (
                                <tr key={item.id} style={{ 
                                    borderBottom: idx < filteredHistory.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    transition: 'all 0.2s'
                                }} className="table-row">
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 900, color: '#111827', fontSize: '21px', fontFamily: "'DM Sans', sans-serif" }}>SCAN-{String(item.id).slice(0, 8).toUpperCase()}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '10px 24px', background: '#f8fafc', borderRadius: '14px', fontWeight: 900, fontSize: '20px', color: '#475569', border: '1px solid #e2e8f0' }}>
                                            {getModelIcon(item.model_type)}
                                            {item.model_type?.toUpperCase()}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>{item.result || 'N/A'}</td>
                                    <td style={tdStyle}>
                                        <div style={{
                                            display: 'inline-flex', padding: '14px 28px', borderRadius: '16px', fontSize: '22px', fontWeight: 1000,
                                            background: item.overall_risk === 'high' ? '#fee2e2' : (item.overall_risk === 'medium' ? '#ffedd5' : '#dcfce7'),
                                            color: item.overall_risk === 'high' ? '#dc2626' : (item.overall_risk === 'medium' ? '#d97706' : '#059669'),
                                            fontFamily: "'DM Sans', sans-serif"
                                        }}>
                                            {item.overall_risk}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                        <Link 
                                            to={`/results/${item.id}`}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '14px 28px',
                                                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
                                                color: '#1a56db', fontWeight: 900, textDecoration: 'none',
                                                fontSize: '20px', fontFamily: "'Outfit', sans-serif"
                                            }}
                                            className="action-btn"
                                        >
                                            {t('history.view_results')} <ArrowUpRight size={22} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '100px 80px', textAlign: 'center' }}>
                                    <div style={{ width: '100px', height: '100px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                                        <TrendingUp size={52} color="#cbd5e1" />
                                    </div>
                                    <h4 style={{ fontSize: '26px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>Archives Initialized</h4>
                                    <p style={{ color: '#64748b', fontSize: '20px', marginTop: '12px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>No results match your current diagnostic filters.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .table-row:hover { background: #f8fafc; }
                .action-btn:hover { border-color: #1a56db; background: #eff6ff; transform: translateY(-2px); }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

const tdStyle = {
    padding: '40px', fontSize: '21px', fontFamily: "'DM Sans', sans-serif"
};

export default HistoryPage;
