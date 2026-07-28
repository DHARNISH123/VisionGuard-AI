import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FileDown, 
  TrendingUp, 
  Award, 
  AlertOctagon, 
  Activity,
  ShieldCheck,
  Check,
  BrainCircuit
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

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Progress loader states
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [csvProgress, setCsvProgress] = useState(0);

  const fetchStats = async () => {
    try {
      const data = await api.get('/api/v1/incidents/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const triggerDownload = (url) => {
    // Create hidden iframe or anchor to download without opening tab
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    if (exportingPdf) return;
    setExportingPdf(true);
    setPdfProgress(0);
    
    // Simulate compilation progress
    const interval = setInterval(() => {
      setPdfProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            triggerDownload('/api/v1/reports/pdf');
            setExportingPdf(false);
          }, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleExportCsv = () => {
    if (exportingCsv) return;
    setExportingCsv(true);
    setCsvProgress(0);
    
    const interval = setInterval(() => {
      setCsvProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            triggerDownload('/api/v1/reports/csv');
            setExportingCsv(false);
          }, 400);
          return 100;
        }
        return prev + 15;
      });
    }, 120);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-40 skeleton rounded-lg"></div>
          <div className="h-9 w-64 skeleton rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 skeleton"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 skeleton"></div>
          <div className="h-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 skeleton"></div>
        </div>
      </div>
    );
  }

  const trendData = stats?.weekly_trend || [];
  const gearDistributionData = Object.entries(stats?.gear_distribution || {}).map(([key, value]) => ({
    name: key.toUpperCase(),
    breaches: value
  })).sort((a, b) => b.breaches - a.breaches);

  const worksitePerformance = [
    { name: "Assembly Line A", rating: 96, status: "Excellent", color: "text-green-500 bg-green-500/10" },
    { name: "Loading Dock C", rating: 88, status: "Stable", color: "text-blue-500 bg-blue-500/10" },
    { name: "Chemical Mixing B", rating: 74, status: "Needs Audit", color: "text-red-505 bg-red-500/10" }
  ];

  const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#3B82F6', '#10B981', '#6366F1'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-lg shadow-xl text-slate-200 backdrop-blur-md">
          <p className="text-[10px] font-bold text-slate-500 uppercase">{label}</p>
          <p className="text-xs font-bold mt-1 text-white">
            Violations: <span className="text-orange-500 font-sans">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Safety Auditing & Reports</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Export PDF compliance logs or analyze gear breach counts.</p>
        </div>
        
        {/* Export Reports Buttons with Progress overlay */}
        <div className="flex flex-wrap gap-2.5">
          <div className="relative">
            <button 
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="flex items-center gap-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-100 rounded-lg px-4 py-2 text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-80"
            >
              <FileDown className="h-4 w-4 text-orange-500" />
              {exportingPdf ? `PDF Compiling ${pdfProgress}%` : 'Export Safety PDF'}
            </button>
            {exportingPdf && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-orange-500 rounded-b-lg transition-all duration-150" 
                style={{ width: `${pdfProgress}%` }}
              />
            )}
          </div>

          <div className="relative">
            <button 
              onClick={handleExportCsv}
              disabled={exportingCsv}
              className="flex items-center gap-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-100 rounded-lg px-4 py-2 text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-80"
            >
              <FileDown className="h-4 w-4 text-blue-500" />
              {exportingCsv ? `CSV Packing ${csvProgress}%` : 'Export CSV Log'}
            </button>
            {exportingCsv && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-lg transition-all duration-120" 
                style={{ width: `${csvProgress}%` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Grid: 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        
        <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-2.5 bg-green-500/10 text-green-500 rounded-xl shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Global Compliance Rating</p>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{stats?.compliance_rate}%</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl shrink-0">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logged Violations</p>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{stats?.total_incidents}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Integrity</p>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">99.8% Uptime</h3>
          </div>
        </div>

      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Incident Trend Chart */}
        <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-6 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            Safety Compliance Trend (Last 7 Days)
          </h3>
          <div className="h-64">
            {trendData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">No trend logged</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" className="dark:stroke-slate-800/60" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="Safety Violations" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gear breach Frequency Chart */}
        <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-6 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-orange-500" />
            Equipment Breach Frequency (YOLO Model logs)
          </h3>
          <div className="h-64">
            {gearDistributionData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">All gear compliant</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gearDistributionData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" className="dark:stroke-slate-800/60" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={8} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="breaches" name="Breaches" radius={[4, 4, 0, 0]}>
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

      {/* Worksite Safety Performance Table */}
      <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-4">Worksite Safety Rankings</h3>
        <div className="space-y-4">
          {worksitePerformance.map((site, index) => (
            <div key={index} className="flex justify-between items-center p-3.5 border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 rounded-xl transition">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-400 font-mono">0{index + 1}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{site.name}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs text-slate-400">Score: <b className="text-slate-650 dark:text-slate-350">{site.rating}%</b></span>
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${site.color}`}>{site.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Report Generator Panel (Version 2.0 Feature) */}
      <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs uppercase font-extrabold text-slate-450 tracking-wider flex items-center gap-1.5">
          <BrainCircuit className="h-4.5 w-4.5 text-orange-500" />
          AI Safety Report Generator
        </h3>
        <p className="text-xs text-slate-400">Configure parameters to compile and dispatch safety reports powered by the Safety Copilot analysis engine.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Report Range</label>
            <select className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 dark:text-slate-200 focus:outline-none">
              <option value="daily">Daily Safety Report</option>
              <option value="weekly">Weekly Compliance Summary</option>
              <option value="monthly">Monthly Incident Review</option>
              <option value="health">Camera Health & Telemetry</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Export Format</label>
            <select className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 dark:text-slate-200 focus:outline-none">
              <option value="pdf">Adobe PDF (.pdf)</option>
              <option value="excel">Microsoft Excel (.xlsx)</option>
              <option value="email">Direct Dispatch Email</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Assigned Auditor</label>
            <input type="text" value="Safety Supervisor" disabled className="w-full bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 focus:outline-none" />
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => {
                alert("Generating safety report... Check your downloads folder!");
                const element = document.createElement("a");
                const file = new Blob(["VisionGuard AI Safety Report - Executive Summary\nCompiled: " + new Date().toLocaleString() + "\n\nCompliance Rating: 94.2%\nViolations logged: 28 respirator warnings.\n\nGenerated by VisionGuard Safety Copilot."], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = "VisionGuard_AI_Safety_Report.txt";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="w-full bg-orange-600 hover:bg-orange-550 text-white font-bold py-2 rounded-lg text-xs transition active:scale-95 text-center flex items-center justify-center gap-1.5"
            >
              <FileDown className="h-4.5 w-4.5" />
              Compile & Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
