import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  ShieldAlert, 
  Activity, 
  Download, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  BarChart3,
  TrendingUp,
  UserCheck,
  UserMinus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import toast from 'react-hot-toast';
import { adminAPI } from '../utils/api';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalScans: 0,
        activeModels: 4,
        avgResponseTime: '1.2s'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const res = await adminAPI.getUsers();
                setUsers(res.data.users || []);
                setStats({
                  totalUsers: res.data.users.length,
                  totalScans: res.data.users.reduce((acc, u) => acc + (u.scan_count || 0), 0),
                  activeModels: 4,
                  avgResponseTime: '1.18s'
                });
            } catch (err) {
                console.error("Admin telemetry failure", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    const userActivityData = [
      { name: 'Mon', scans: 42, growth: 2.1 },
      { name: 'Tue', scans: 38, growth: 1.8 },
      { name: 'Wed', scans: 56, growth: 4.2 },
      { name: 'Thu', scans: 45, growth: 3.1 },
      { name: 'Fri', scans: 61, growth: 5.4 },
      { name: 'Sat', scans: 22, growth: -1.2 },
      { name: 'Sun', scans: 18, growth: -2.5 },
    ];

    const adminCards = [
      { label: 'System Users', value: stats.totalUsers, icon: <Users />, color: '#1a56db', bg: '#eff6ff' },
      { label: 'Forensic Cycles', value: stats.totalScans, icon: <Activity />, color: '#7c3aed', bg: '#f5f3ff' },
      { label: 'Neural Accuracy', value: '91.2%', icon: <TrendingUp />, color: '#059669', bg: '#f0fdf4' },
      { label: 'System Latency', value: stats.avgResponseTime, icon: <Activity />, color: '#d97706', bg: '#fff7ed' },
    ];

    if (loading) return (
        <div style={{ padding: '80px', textAlign: 'center' }}>
            <Activity className="animate-spin" size={60} color="#1a56db" />
            <p style={{ marginTop: '24px', color: '#64748b', fontSize: '20px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Synchronizing administrative telemetry...</p>
        </div>
    );

    return (
        <div style={{ 
            width: '100%', margin: '0 auto', padding: '48px 5vw',
            animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ 
                        fontSize: '48px', fontWeight: 900, color: '#111827', 
                        fontFamily: "'Outfit', sans-serif", marginBottom: '12px',
                        letterSpacing: '-2px'
                    }}>
                        System Administration
                    </h1>
                    <p style={{ fontSize: '20px', color: '#64748b', fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
                        Monitor system-wide clinical diagnostics and neural performance.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={actionBtnStyle}><Download size={18} /> Export Telemetry</button>
                    <button style={actionBtnStyle}><Settings size={18} /> System Settings</button>
                </div>
            </div>

            {/* Admin Metrics Grid */}
            <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '24px', marginBottom: '40px' 
            }}>
                {adminCards.map((card, idx) => (
                    <div key={idx} style={cardStyle} className="hover-lift">
                        <div style={{ 
                            width: '60px', height: '60px', borderRadius: '16px', background: card.bg,
                            color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '32px', boxShadow: `0 8px 16px ${card.bg}`
                        }}>
                            {React.cloneElement(card.icon, { size: 30, strokeWidth: 2.5 })}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '12px', fontFamily: "'DM Sans', sans-serif" }}>{card.label}</div>
                        <div style={{ fontSize: '48px', fontWeight: 900, color: '#111827', letterSpacing: '-2px', fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>{card.value}</div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', marginBottom: '40px' }}>
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', marginBottom: '40px', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px' }}>System Activity Forecast</h3>
                    <ResponsiveContainer width="100%" height={360}>
                        <AreaChart data={userActivityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="scans" stroke="#1a56db" strokeWidth={4} fill="url(#colorScans)" />
                            <defs>
                              <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1a56db" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#1a56db" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div style={cardStyle}>
                    <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', marginBottom: '40px', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px' }}>Neural Calibrations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                          { name: 'Eye Anemia Base', status: 'Stable', health: 91 },
                          { name: 'Palm Crease Engine', status: 'Re-calibrating', health: 88.6 },
                          { name: 'Retinal DiabeteCore', status: 'Optimal', health: 93.1 },
                          { name: 'Dermal DFU Pulse', status: 'Stable', health: 92.8 }
                        ].map((model, i) => (
                           <div key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                                 <div style={{ fontWeight: 800, fontSize: '17px', color: '#1e293b', fontFamily: "'DM Sans', sans-serif" }}>{model.name}</div>
                                 <div style={{ fontSize: '12px', fontWeight: 900, color: model.status === 'Optimal' ? '#059669' : (model.status === 'Stable' ? '#1a56db' : '#d97706'), textTransform: 'uppercase', letterSpacing: '0.5px' }}>{model.status}</div>
                              </div>
                              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                 <div style={{ width: `${model.health}%`, height: '100%', background: 'linear-gradient(to right, #1a56db, #3b82f6)', borderRadius: '4px' }}></div>
                              </div>
                           </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scaled User Table */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                   <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1.5px' }}>Clinical Practitioner Registry</h3>
                   <div style={{ position: 'relative' }}>
                      <Search size={22} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="text" placeholder="Filter practitioners..." style={{ height: '60px', padding: '10px 16px 10px 48px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '16px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }} />
                   </div>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={thStyle}>Identity</th>
                        <th style={thStyle}>Role Hierarchy</th>
                        <th style={thStyle}>Registration</th>
                        <th style={thStyle}>Usage Tier</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Forensic Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #f1f5f9' : 'none' }} className="table-row">
                          <td style={tdStyle}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px' }}>{u.name[0].toUpperCase()}</div>
                                <div>
                                   <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '18px' }}>{u.name}</div>
                                   <div style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>{u.email}</div>
                                </div>
                             </div>
                          </td>
                          <td style={tdStyle}>
                             <div style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 900, background: u.role === 'admin' ? '#f5f3ff' : '#eff6ff', color: u.role === 'admin' ? '#7c3aed' : '#1a56db', textTransform: 'uppercase', letterSpacing: '0.8px', border: '1px solid rgba(26,86,219,0.1)' }}>{u.role}</div>
                          </td>
                          <td style={tdStyle}>
                             <div style={{ fontSize: '17px', fontWeight: 600, color: '#64748b' }}>{new Date(u.created_at).toLocaleDateString()}</div>
                          </td>
                          <td style={tdStyle}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontWeight: 800, fontSize: '18px' }}>{u.scan_count || 0}</div>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.5px' }}>CYCLES</div>
                             </div>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right' }}>
                             {u.role !== 'admin' ? (
                                <button style={{ padding: '10px 20px', borderRadius: '12px', background: '#fef2f2', border: '1px solid rgba(220,38,38,0.1)', color: '#dc2626', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: '0.2s' }}><UserMinus size={16} style={{ marginRight: '8px' }} /> Revoke Access</button>
                             ) : (
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Protected Core</span>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .hover-lift:hover { transform: translateY(-8px); border-color: #bfdbfe !important; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
                .table-row:hover { background: #f8fafc; }
            `}</style>
        </div>
    );
};

const cardStyle = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px', padding: '48px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' };
const actionBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '16px', fontWeight: 800, color: '#1e293b', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" };
const thStyle = { padding: '24px 32px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', fontFamily: "'DM Sans', sans-serif" };
const tdStyle = { padding: '32px', fontSize: '18px', fontFamily: "'DM Sans', sans-serif" };

export default AdminPage;
