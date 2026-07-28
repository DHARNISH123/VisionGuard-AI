import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  ShieldAlert, 
  CheckCircle, 
  AlertOctagon, 
  RefreshCw, 
  MapPin, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users,
  Activity,
  User,
  ShieldCheck,
  Compass,
  Cpu,
  Search,
  Eye,
  Sliders,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  BrainCircuit,
  Award
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('operations'); // operations | factory | workers
  const [stats, setStats] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workerSearch, setWorkerSearch] = useState('');
  
  // Selected worker state (Version 2.0 Feature)
  const [selectedWorkerId, setSelectedWorkerId] = useState("VG-WRK-005");

  // Worker Database state
  const [workersList, setWorkersList] = useState([
    { 
      id: "VG-WRK-001", 
      name: "David Miller", 
      dept: "Chemical Processing", 
      score: 98, 
      lastSeen: "08:12 AM", 
      violations: 0, 
      ppe: "Helmet, Vest, Goggles, Gloves, Boots, Respirator", 
      photo: "DM",
      explanation: "Maintained a near-perfect compliance score. No warnings registered.",
      trend: "Excellent (0 violations this shift)",
      training: "No training needed",
      risk: "Low",
      suggestions: "Continue standard weekly checks."
    },
    { 
      id: "VG-WRK-002", 
      name: "John Chen", 
      dept: "Assembly Line A", 
      score: 95, 
      lastSeen: "08:10 AM", 
      violations: 1, 
      ppe: "Helmet, Vest, Gloves", 
      photo: "JC",
      explanation: "A single gloves omission warning last Thursday.",
      trend: "Stable",
      training: "Refresher safety briefing",
      risk: "Low",
      suggestions: "Conduct random supervisor check."
    },
    { 
      id: "VG-WRK-003", 
      name: "Robert Taylor", 
      dept: "Assembly Line A", 
      score: 91, 
      lastSeen: "08:05 AM", 
      violations: 2, 
      ppe: "Helmet, Vest", 
      photo: "RT",
      explanation: "Frequent helmet omissions during hot weather shifts.",
      trend: "Needs Attention",
      training: "Conduct helmet awareness session",
      risk: "Medium",
      suggestions: "Increase supervisor patrol check."
    },
    { 
      id: "VG-WRK-004", 
      name: "Sarah Jenkins", 
      dept: "Logistics Dock C", 
      score: 84, 
      lastSeen: "07:58 AM", 
      violations: 3, 
      ppe: "Helmet, Vest, Boots", 
      photo: "SJ",
      explanation: "Boots compliance violations logged in loading dock area.",
      trend: "Warning",
      training: "Conduct safety boots training",
      risk: "Medium",
      suggestions: "Enforce safety boots checks."
    },
    { 
      id: "VG-WRK-005", 
      name: "Marcus Thorne", 
      dept: "Chemical Processing", 
      score: 72, 
      lastSeen: "08:09 AM", 
      violations: 5, 
      ppe: "Helmet, Goggles", 
      photo: "MT",
      explanation: "Safety probation. Recurring respirator and goggles violations in chemical zone.",
      trend: "Critical (5 violations)",
      training: "Mandatory respirator retraining",
      risk: "High",
      suggestions: "Enforce strict patrol patrollings."
    }
  ]);

  const [selectedMapCam, setSelectedMapCam] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const statsData = await api.get('/api/v1/incidents/stats');
      const incidentsData = await api.get('/api/v1/incidents?limit=8');
      setStats(statsData);
      setRecentIncidents(incidentsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleCopilotWorkerSelect = () => {
      const wrkId = localStorage.getItem('copilotWorkerSelect');
      if (wrkId) {
        setActiveTab('workers');
        setSelectedWorkerId(wrkId);
        localStorage.removeItem('copilotWorkerSelect');
      }
      const workerTab = localStorage.getItem('copilotWorkerTab');
      if (workerTab) {
        setActiveTab('workers');
        localStorage.removeItem('copilotWorkerTab');
      }
    };
    window.addEventListener('copilot-worker-select', handleCopilotWorkerSelect);
    setTimeout(handleCopilotWorkerSelect, 150);

    return () => window.removeEventListener('copilot-worker-select', handleCopilotWorkerSelect);
  }, []);

  useEffect(() => {
    wsService.connect((message) => {
      if (message.type === 'NEW_ALERT') {
        setRecentIncidents(prev => [message.data, ...prev].slice(0, 8));
        setStats(prev => {
          if (!prev) return null;
          return {
            ...prev,
            total_incidents: prev.total_incidents + 1,
            pending_incidents: prev.pending_incidents + 1,
            compliance_rate: Math.max(0, prev.compliance_rate - 2)
          };
        });
      }
    });

    return () => wsService.disconnect();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-full skeleton rounded-lg"></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 skeleton"></div>
          ))}
        </div>
        <div className="h-96 skeleton rounded-xl"></div>
      </div>
    );
  }

  const trendData = stats?.weekly_trend || [];
  const gearDistributionData = Object.entries(stats?.gear_distribution || {}).map(([key, value]) => ({
    name: key.toUpperCase(),
    violations: value
  })).sort((a, b) => b.violations - a.violations);

  const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#3B82F6', '#10B981', '#6366F1'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-lg shadow-xl text-slate-200 backdrop-blur-md">
          <p className="text-[10px] font-bold text-slate-500 uppercase">{label}</p>
          <p className="text-xs font-bold mt-1 text-white">
            Breaches: <span className="text-orange-500 font-sans">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderSparkline = (data, strokeColor = "#F97316") => {
    if (!data || data.length < 2) return null;
    const maxVal = Math.max(...data.map(d => d.count), 1);
    const width = 120;
    const height = 30;
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d.count / maxVal) * height + 2;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible opacity-80 mt-2">
        <polyline fill="none" stroke={strokeColor} strokeWidth="1.5" points={points} />
      </svg>
    );
  };

  const filteredWorkers = workersList.filter(w => 
    w.name.toLowerCase().includes(workerSearch.toLowerCase()) || 
    w.id.toLowerCase().includes(workerSearch.toLowerCase()) || 
    w.dept.toLowerCase().includes(workerSearch.toLowerCase())
  );

  const selectedWorker = workersList.find(w => w.id === selectedWorkerId);

  const overallCompliance = stats?.compliance_rate || 96;
  const todayCompliance = Math.max(90, Math.min(99, overallCompliance - 1));
  const yesterdayCompliance = Math.max(90, Math.min(99, overallCompliance - 2));
  const weeklyCompliance = Math.max(90, Math.min(99, overallCompliance));
  const monthlyCompliance = Math.max(90, Math.min(99, overallCompliance + 1));
  const complianceDiff = (todayCompliance - yesterdayCompliance).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Tab Switcher Toolbar */}
      <div className="flex justify-between items-center border-b border-slate-250/60 dark:border-slate-850 pb-1">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('operations')}
            className={`pb-2.5 text-xs font-extrabold tracking-wide uppercase transition relative ${
              activeTab === 'operations' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Operations Control Room
          </button>
          <button 
            onClick={() => setActiveTab('factory')}
            className={`pb-2.5 text-xs font-extrabold tracking-wide uppercase transition relative ${
              activeTab === 'factory' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Factory Map Layout
          </button>
          <button 
            onClick={() => setActiveTab('workers')}
            className={`pb-2.5 text-xs font-extrabold tracking-wide uppercase transition relative ${
              activeTab === 'workers' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Staff Safety Profiles
          </button>
        </div>
        
        <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
          Console V2.0.0 • Sync Interval: Live WS
        </div>
      </div>

      {/* OPERATIONS TAB */}
      {activeTab === 'operations' && (
        <div className="space-y-6 animate-fade-in">
          {/* Grid: 4 Metric Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                       {/* Compliance Rating Card (Version 2.0 Dynamic Values) */}
            <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Compliance</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{overallCompliance}%</h3>
                </div>
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="18" stroke="#F1F5F9" strokeWidth="3" className="dark:stroke-slate-800" fill="transparent" />
                  <circle cx="24" cy="24" r="18" stroke="#10B981" strokeWidth="3" fill="transparent"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - overallCompliance / 100)}
                  />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-450 border-t border-slate-100 dark:border-slate-850 pt-2.5">
                <div>Today's: <span className="font-bold text-slate-800 dark:text-slate-200">{todayCompliance}%</span></div>
                <div>Yesterday's: <span className="font-bold text-slate-800 dark:text-slate-200">{yesterdayCompliance}%</span></div>
                <div>Weekly Avg: <span className="font-bold text-slate-800 dark:text-slate-200">{weeklyCompliance}%</span></div>
                <div>Monthly Avg: <span className="font-bold text-slate-800 dark:text-slate-200">{monthlyCompliance}%</span></div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400 font-semibold">Target Level: &gt;95%</span>
                <span className={`font-bold flex items-center gap-0.5 ${complianceDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {complianceDiff >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {complianceDiff >= 0 ? '+' : ''}{complianceDiff}%
                </span>
              </div>
            </div>

            {/* Active Cameras Card */}
            <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Feeds</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">
                    {stats?.active_cameras || 3} <span className="text-xs text-slate-400 font-normal">/ {stats?.total_cameras || 3}</span>
                  </h3>
                </div>
                <div className="p-2 bg-brand-500/10 text-brand-500 rounded-lg">
                  <Camera className="h-5 w-5" />
                </div>
              </div>
              <div className="flex justify-between items-end mt-2">
                {renderSparkline(trendData, "#10B981")}
                <span className="text-[9px] text-slate-450 font-semibold mb-1">100% online</span>
              </div>
            </div>

            {/* Pending Audits Card (Version 2.0 Alert Breakdown) */}
            <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition border-l-4 border-l-red-500 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Alerts</p>
                  <h3 className="text-2xl font-extrabold text-red-500 mt-1">{stats?.pending_incidents || 0}</h3>
                </div>
                <div className="p-2 bg-red-500/10 text-red-500 rounded-lg animate-pulse">
                  <ShieldAlert className="h-5 w-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-850 text-[10px] font-medium text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>Crit: <b className="text-slate-850 dark:text-slate-200">12</b></span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                  <span>Med: <b className="text-slate-850 dark:text-slate-200">31</b></span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 shrink-0" />
                  <span>Low: <b className="text-slate-850 dark:text-slate-200">518</b></span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                  <span>Res: <b className="text-slate-850 dark:text-slate-200">145</b></span>
                </div>
              </div>
            </div>

            {/* Active Workers Card */}
            <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Workers</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">18</h3>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-350 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">Uptime: 100% active</span>
                <span className="text-green-500 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +2 staff
                </span>
              </div>
            </div>
          </div>

          {/* AI Safety Recommendations Card */}
          <div className="bg-gradient-to-r from-orange-600/10 via-orange-600/[0.03] to-transparent border border-orange-500/25 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs uppercase font-extrabold text-orange-500 tracking-wider flex items-center gap-2 mb-3">
              <Lightbulb className="h-4.5 w-4.5 animate-bounce" />
              AI Recommendations & Safety Suggestions
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"></span>
                <span>⚠️ **Respirator Compliance:** Increase respirator mask compliance in <b>Chemical Lab Area</b>. Camera #2 reports recurring violations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"></span>
                <span>📈 **Assembly Improvement:** Safety ratings at <b>Assembly Line A</b> improved by 12% following compliance policy updates.</span>
              </li>
            </ul>
          </div>

          {/* Grid: Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm lg:col-span-2">
              <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-6">Weekly PPE Incidents Trend</h3>
              <div className="h-64">
                {trendData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">No trend data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F97316" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" className="dark:stroke-slate-800/60" />
                      <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="count" name="Violations" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#colorIncidents)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-6">Violations by Equipment Category</h3>
              <div className="h-64">
                {gearDistributionData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">All equipment compliant</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gearDistributionData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" className="dark:stroke-slate-800/60" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={8} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="violations" name="Breaches" radius={[4, 4, 0, 0]}>
                        {gearDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Grid: Safety Feed vs Today's AI Insights (V2.0 Requirement) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Real-time safety feed */}
            <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm lg:col-span-2">
              <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-4">Real-Time Safety Feed</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentIncidents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">Zero active incidents logged.</div>
                ) : (
                  recentIncidents.map(inc => (
                    <div key={inc.id} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-3 rounded-xl">
                      <div className="flex gap-3.5 items-start">
                        <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                          inc.severity === 'High' ? 'bg-red-500/10 text-red-500' :
                          inc.severity === 'Medium' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          <ShieldAlert className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            Missing PPE: {(inc.ppe_violation_types || "").split(',').join(', ').toUpperCase()}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin className="h-3.5 w-3.5 text-slate-500" />
                              {inc.camera?.name || 'Camera'} ({inc.camera?.location})
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-slate-500" />
                              {new Date(inc.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 text-[9px]">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          inc.severity === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
                          inc.severity === 'Medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400'
                        }`}>
                          {inc.severity}
                        </span>
                        
                        <span className={`px-2 py-0.5 rounded font-extrabold uppercase ${
                          inc.status === 'Pending' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
                          'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                        }`}>
                          {inc.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Today's AI Insights Widget (V2.0 Requirement) */}
            <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm lg:col-span-1 space-y-4">
              <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1.5">
                <BrainCircuit className="h-4.5 w-4.5 text-orange-500 animate-pulse" />
                Today's AI Insights
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex gap-2.5 items-start bg-orange-500/[0.02] border border-orange-500/10 p-3 rounded-xl">
                  <TrendingUp className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">Average Compliance</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Currently **96%** (<span className="text-green-500 font-bold font-sans">↑ +2.3%</span> compared to yesterday).</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-850 pt-3 text-[10px]">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Peak Breach Hour</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">11 AM - 12 PM</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Safest Sector</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Warehouse Area</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Highest Risk Area</p>
                    <p className="font-bold text-red-500 mt-0.5">Chemical Lab B</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Common Omission</p>
                    <p className="font-bold text-orange-500 mt-0.5">Hand Gloves</p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start bg-blue-500/[0.02] border border-blue-500/10 p-3 rounded-xl">
                  <Lightbulb className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">Today's Action Plan</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Increase respirator patrols in Chemical Mixing Room during shift handovers.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FACTORY MAP TAB */}
      {activeTab === 'factory' && (
        <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Factory Floor Area Overview</h3>
            <p className="text-xs text-slate-400 mt-1">Interactive safe perimeter and camera monitoring map layout.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-850 p-4 aspect-[4/3] flex items-center justify-center relative overflow-hidden">
              <svg className="w-full h-full text-slate-800" viewBox="0 0 600 450" fill="none">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                <rect x="20" y="20" width="560" height="410" rx="10" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />

                <rect x="40" y="40" width="180" height="150" rx="8" fill="rgba(16, 185, 129, 0.04)" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1.5" />
                <text x="50" y="60" fill="rgba(16, 185, 129, 0.7)" fontSize="10" fontWeight="bold" fontFamily="monospace">STAFF_BREAKROOM (SAFE)</text>

                <rect x="260" y="40" width="300" height="180" rx="8" fill="rgba(245, 158, 11, 0.04)" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1.5" />
                <text x="270" y="60" fill="rgba(245, 158, 11, 0.7)" fontSize="10" fontWeight="bold" fontFamily="monospace">ASSEMBLY_FLOOR_A</text>
                <line x1="280" y1="120" x2="540" y2="120" stroke="rgba(245,158,11,0.3)" strokeWidth="8" strokeDasharray="15,10" />

                <rect x="40" y="230" width="220" height="180" rx="8" fill="rgba(239, 68, 68, 0.05)" stroke="rgba(239, 68, 68, 0.35)" strokeWidth="1.5" />
                <text x="50" y="250" fill="rgba(239, 68, 68, 0.8)" fontSize="10" fontWeight="bold" fontFamily="monospace">CHEMICAL_MIXING_B (HAZARD)</text>
                <circle cx="150" cy="320" r="25" fill="none" stroke="rgba(239, 68, 68, 0.15)" strokeWidth="3" />

                <rect x="290" y="260" width="270" height="150" rx="8" fill="rgba(59, 130, 246, 0.04)" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1.5" />
                <text x="300" y="280" fill="rgba(59, 130, 246, 0.7)" fontSize="10" fontWeight="bold" fontFamily="monospace">LOGISTICS_DOCK_C</text>

                {/* Camera #1 Pin */}
                <g 
                  className="cursor-pointer group" 
                  onClick={() => setSelectedMapCam({ id: 1, name: "Main Assembly Camera", loc: "Assembly Line A", fps: 30, status: "Online" })}
                >
                  <circle cx="380" cy="110" r="10" fill="rgba(249, 115, 22, 0.2)" />
                  <circle cx="380" cy="110" r="5" fill="#F97316" className="animate-pulse" />
                  <path d="M375,100 L395,110 L375,120 Z" fill="none" stroke="#F97316" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                  <text x="380" y="95" fill="#fff" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">CAM_01</text>
                </g>

                {/* Camera #2 Pin */}
                <g 
                  className="cursor-pointer group" 
                  onClick={() => setSelectedMapCam({ id: 2, name: "Chemical Lab Camera", loc: "Chemical Mixing B", fps: 29.8, status: "Alerting" })}
                >
                  <circle cx="130" cy="300" r="10" fill="rgba(239, 68, 68, 0.2)" />
                  <circle cx="130" cy="300" r="5" fill="#EF4444" className="animate-pulse" />
                  <path d="M125,290 L145,300 L125,310 Z" fill="none" stroke="#EF4444" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                  <text x="130" y="285" fill="#fff" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">CAM_02</text>
                </g>

                {/* Camera #3 Pin */}
                <g 
                  className="cursor-pointer group" 
                  onClick={() => setSelectedMapCam({ id: 3, name: "Logistics Gate Camera", loc: "Loading Dock C", fps: 30, status: "Online" })}
                >
                  <circle cx="440" cy="320" r="10" fill="rgba(59, 130, 246, 0.2)" />
                  <circle cx="440" cy="320" r="5" fill="#3B82F6" className="animate-pulse" />
                  <text x="440" y="305" fill="#fff" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">CAM_03</text>
                </g>

              </svg>
            </div>

            <div className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col justify-between">
              {selectedMapCam ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-900">
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider font-mono">Camera telemetry</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold ${
                      selectedMapCam.status === "Alerting" ? "bg-red-500/10 text-red-500 animate-pulse" : "bg-green-500/10 text-green-500"
                    }`}>
                      {selectedMapCam.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-450">NAME</p>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{selectedMapCam.name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-455">SECTOR</p>
                      <p className="font-semibold text-slate-650 dark:text-slate-350">{selectedMapCam.loc}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-455">FPS / SPEED</p>
                      <p className="font-semibold text-slate-650 dark:text-slate-350">{selectedMapCam.fps} FPS</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-455">LENS COVERAGE</p>
                      <p className="font-semibold text-slate-650 dark:text-slate-350">120 degree wide angle</p>
                    </div>
                  </div>

                    <button 
                      onClick={() => {
                        localStorage.setItem('copilotSelectCameraId', selectedMapCam.id.toString());
                        window.dispatchEvent(new Event('copilot-select-camera'));
                        navigate('/cameras');
                      }}
                      className="w-full bg-orange-600 hover:bg-orange-550 text-white font-bold py-2 rounded-lg text-xs mt-4 transition active:scale-95 text-center flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-4 w-4" />
                      Open Live Feed
                    </button>
                  </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-450 p-6">
                  <Compass className="h-10 w-10 text-slate-500 mb-3" />
                  <p className="text-xs font-bold">Inspect Camera coverage</p>
                  <p className="text-[10px] text-slate-505 mt-1">Click on any camera pin (e.g. CAM_01, CAM_02) on the plant layout map to inspect live coverage telemetry.</p>
                </div>
              )}
              
              <div className="border-t border-slate-200 dark:border-slate-850 pt-4 mt-6">
                <div className="flex gap-2 items-center text-[10px] text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span>CAM_02 is reporting safety breaches.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STAFF SAFETY PROFILES TAB */}
      {activeTab === 'workers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Left Side: Workers List Table */}
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5 lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Worksite Staff Safety Profiles</h3>
                <p className="text-xs text-slate-400 mt-1">Select a safety profile row to inspect detailed AI Safety Ratings.</p>
              </div>
              
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search staff ID, name..."
                  value={workerSearch}
                  onChange={e => setWorkerSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-950 dark:border-slate-850 text-slate-550 font-bold uppercase tracking-wider text-[10px] select-none">
                    <th className="p-3">Staff ID</th>
                    <th className="p-3">Worker Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Safety Score</th>
                    <th className="p-3 text-right font-sans">Violations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                  {filteredWorkers.map(w => (
                    <tr 
                      key={w.id} 
                      onClick={() => setSelectedWorkerId(w.id)}
                      className={`cursor-pointer transition ${
                        selectedWorkerId === w.id 
                          ? 'bg-orange-500/[0.03] border-l-4 border-l-orange-500' 
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-850/10'
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-slate-500">{w.id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-orange-600/10 text-orange-500 font-bold flex items-center justify-center text-[10px] border border-orange-500/20">
                            {w.photo}
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-100">{w.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-400">{w.dept}</td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                          w.score >= 95 ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' :
                          w.score >= 85 ? 'bg-blue-100 text-blue-750 dark:bg-blue-950/40 dark:text-blue-400' :
                          w.score >= 70 ? 'bg-yellow-100 text-yellow-750 dark:bg-yellow-950/40 dark:text-yellow-400' :
                          'bg-red-100 text-red-750 dark:bg-red-950/40 dark:text-red-400'
                        }`}>
                          {w.score} / 100
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-500">{w.violations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Side: Worker AI Insights Panel (Version 2.0 Feature) */}
          <div className="lg:col-span-1 space-y-4">
            {selectedWorker ? (
              <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5 animate-fade-in">
                
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-900">
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider font-mono">Safety Copilot Diagnostics</span>
                  <span className={`text-[9px] px-2.5 py-0.5 rounded font-black ${
                    selectedWorker.risk === "High" ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-450" :
                    selectedWorker.risk === "Medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-450" :
                    "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-450"
                  }`}>
                    Risk: {selectedWorker.risk}
                  </span>
                </div>

                <div className="text-center py-3">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl font-bold text-orange-500 mx-auto mb-3">
                    {selectedWorker.photo}
                  </div>
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100">{selectedWorker.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{selectedWorker.id} • {selectedWorker.dept}</p>
                </div>

                {/* Score Circular ring stats */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-3.5 text-xs leading-relaxed">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-450 flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-orange-500" />
                      Safety Score Explanation
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 mt-1">{selectedWorker.explanation}</p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-455">Violation Trend</p>
                    <p className="font-semibold text-slate-650 dark:text-slate-250 mt-1">{selectedWorker.trend}</p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-455">Safety Training Recommendation</p>
                    <p className="font-bold text-orange-500 mt-1">{selectedWorker.training}</p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-455">Compliance Patrol Suggestion</p>
                    <p className="text-slate-400 mt-1">{selectedWorker.suggestions}</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-16 text-center text-slate-500">
                No safety profile loaded.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
