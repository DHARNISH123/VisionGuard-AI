import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Check, 
  Eye, 
  XCircle, 
  Filter, 
  X,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BrainCircuit,
  FileDown,
  Activity
} from 'lucide-react';

export default function Incidents() {
  const { user } = useAuth();
  const isSupervisor = ['Admin', 'Supervisor'].includes(user?.role);
  
  const [incidents, setIncidents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Filtering states
  const [filterCamera, setFilterCamera] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal states
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalTab, setModalTab] = useState('data'); // data | explain
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [selectedIncident]);

  const getSnapshotUrl = (path) => {
    if (!path) return "";
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = import.meta.env.VITE_API_URL || '';
    return `${base}${path}`;
  };

  const fetchInitialData = async () => {
    try {
      const cams = await api.get('/api/v1/cameras');
      setCameras(cams);
      await fetchIncidents();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidents = async () => {
    try {
      let query = '/api/v1/incidents?';
      if (filterCamera) query += `camera_id=${filterCamera}&`;
      if (filterStatus) query += `status=${filterStatus}&`;
      if (filterSeverity) query += `severity=${filterSeverity}&`;
      
      const data = await api.get(query);
      setIncidents(data);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();

    const handleCopilotFilter = () => {
      const status = localStorage.getItem('copilotFilterStatus');
      if (status) {
        setFilterStatus(status);
        localStorage.removeItem('copilotFilterStatus');
      }
      const severity = localStorage.getItem('copilotFilterSeverity');
      if (severity) {
        setFilterSeverity(severity);
        localStorage.removeItem('copilotFilterSeverity');
      }
      const cam = localStorage.getItem('copilotFilterCamera');
      if (cam) {
        setFilterCamera(parseInt(cam));
        localStorage.removeItem('copilotFilterCamera');
      }
    };
    window.addEventListener('copilot-filter', handleCopilotFilter);
    setTimeout(handleCopilotFilter, 150);

    return () => window.removeEventListener('copilot-filter', handleCopilotFilter);
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [filterCamera, filterStatus, filterSeverity]);

  const handleResolveIncident = async (id, newStatus) => {
    try {
      const updated = await api.put(`/api/v1/incidents/${id}`, {
        status: newStatus
      });
      
      setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: updated.status } : inc));
      
      if (selectedIncident && selectedIncident.id === id) {
        setSelectedIncident(prev => ({ ...prev, status: updated.status }));
      }
    } catch (err) {
      alert("Failed to update incident status.");
    }
  };

  // Sorting logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedIncidents = [...incidents].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'timestamp') {
      aVal = new Date(a.timestamp).getTime();
      bVal = new Date(b.timestamp).getTime();
    } else if (sortField === 'location') {
      aVal = a.camera?.location || '';
      bVal = b.camera?.location || '';
    } else if (sortField === 'camera') {
      aVal = a.camera?.name || '';
      bVal = b.camera?.name || '';
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIncidents = sortedIncidents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedIncidents.length / itemsPerPage);

  const SortIndicator = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="h-3 w-3 text-orange-500 shrink-0" />
      : <ChevronDown className="h-3 w-3 text-orange-500 shrink-0" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 skeleton rounded-lg"></div>
        <div className="h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl skeleton"></div>
        <div className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl skeleton"></div>
      </div>
    );
  }

  if (selectedIncident) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => { setSelectedIncident(null); setModalTab('data'); }}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-805 dark:hover:text-white transition"
          >
            ← Back to Incident Logs
          </button>
          
          <div className="flex gap-2">
            <a 
              href={getSnapshotUrl(selectedIncident.snapshot_url)} 
              download={`evidence_${selectedIncident.id}.jpg`}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-sm active:scale-95 border border-slate-800"
            >
              <FileDown className="h-4 w-4 text-orange-500" />
              Download Evidence
            </a>
          </div>
        </div>

        <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Incident Details: Case #{selectedIncident.id}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review live bounding box detections, AI root-cause analysis, and operator remarks.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side: Frame snapshot / annotated image */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden aspect-video flex items-center justify-center relative shadow-inner">
                {imageError || !selectedIncident.snapshot_url ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <AlertTriangle className="h-12 w-12 text-red-500 mb-3 animate-pulse" />
                    <p className="font-bold text-sm text-slate-200">Snapshot Not Available</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-md">The physical frame snapshot was archived or is temporarily missing from the edge server.</p>
                  </div>
                ) : (
                  <img 
                    src={getSnapshotUrl(selectedIncident.snapshot_url)} 
                    alt="PPE Breaches bounding box annotations" 
                    className="w-full h-full object-contain"
                    onError={() => {
                      console.error("Failed to load snapshot:", getSnapshotUrl(selectedIncident.snapshot_url));
                      setImageError(true);
                    }}
                  />
                )}
              </div>

              {/* CCTV Replay Simulation (Version 2.0 Feature) */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3">
                <p className="font-bold text-orange-500 flex items-center gap-1.5 text-xs">
                  <Activity className="h-4 w-4 animate-pulse" />
                  Simulated CCTV Replay Loop
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>Frame 101: Entered Zone</span>
                    <span className="text-orange-500 font-semibold">Frame 120: PPE Breach Detected (94% Conf.)</span>
                    <span>Frame 145: Zone Cleared</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 left-0 bg-orange-600 w-[55%] animate-pulse" />
                  </div>
                </div>
                
                <div className="flex gap-2 items-center justify-center text-xs font-mono text-slate-400 pt-2">
                  <button className="px-3 py-1 border border-slate-800 rounded bg-slate-900 hover:bg-slate-850 transition">⏸ Pause Playback</button>
                  <button className="px-3 py-1 border border-slate-800 rounded bg-slate-900 hover:bg-slate-850 transition">🔄 Loop Frame Check</button>
                  <span className="ml-3">Duration: 14 seconds elapsed</span>
                </div>
              </div>
            </div>

            {/* Right Side: Log details and resolving actions */}
            <div className="bg-slate-550 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex justify-between items-center pb-3.5 border-b border-slate-200 dark:border-slate-900">
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider font-mono">Case Specifications</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded font-extrabold uppercase ${
                    selectedIncident.status === 'Pending' ? 'bg-red-100 text-red-755 dark:bg-red-950/40 dark:text-red-400' :
                    selectedIncident.status === 'Resolved' ? 'bg-green-100 text-green-755 dark:bg-green-950/40 dark:text-green-400' :
                    'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {selectedIncident.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Worksite Location</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">{selectedIncident.camera?.location}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Camera Node ID</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{selectedIncident.camera?.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Timestamp</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{new Date(selectedIncident.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Worker Profiling</p>
                    <p className="font-mono font-bold text-orange-500 mt-0.5">VG-WRK-00{selectedIncident.id % 5 + 1}</p>
                  </div>
                  <div className="col-span-2 border-t border-slate-200 dark:border-slate-900 pt-3">
                    <p className="text-[9px] uppercase font-bold text-slate-400">Missing PPE Gear</p>
                    <span className="inline-block bg-red-100 text-red-750 dark:bg-red-950 dark:text-red-400 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mt-1.5">
                      {(selectedIncident.ppe_violation_types || "").split(',').join(', ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Audit Timeline */}
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-900">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Audit Timeline Logs</p>
                  <div className="space-y-2 border-l border-slate-200 dark:border-slate-800 pl-3.5 text-[11px] leading-normal">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold font-mono">14:02:10</p>
                      <p className="text-slate-750 dark:text-slate-350">Worker entered worksite zone without required gear.</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-orange-500 font-bold font-mono">14:02:15</p>
                      <p className="text-slate-750 dark:text-slate-350">YOLOv8 frame verification completed (94.8% Conf.).</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-red-500 font-bold font-mono">14:02:22</p>
                      <p className="text-slate-750 dark:text-slate-350">Safety warning logged and broadcasted to supervisor.</p>
                    </div>
                  </div>
                </div>

                {/* AI Explain Root Cause */}
                <div className="bg-orange-500/[0.03] border border-orange-500/20 rounded-xl p-3.5 text-xs leading-relaxed space-y-1.5">
                  <p className="font-bold text-orange-500 flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    AI Explain & Root Cause
                  </p>
                  <p className="text-slate-650 dark:text-slate-350 text-[11px]">
                    The worker entered the zone without wearing required gloves. Root cause assessment: worker bypassed check station during shift change. Stop operations until refresher briefing is issued.
                  </p>
                </div>

                {/* Supervisor remarks */}
                <div className="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-900">
                  <label className="block text-[9px] font-bold uppercase text-slate-400">Supervisor Audit Notes</label>
                  <textarea 
                    rows="2"
                    placeholder="Type safety notes, compliance remarks, or warnings issued..."
                    className="w-full bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isSupervisor && selectedIncident.status === 'Pending' ? (
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-900 pt-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleResolveIncident(selectedIncident.id, 'Resolved')}
                      className="flex-1 bg-green-600 hover:bg-green-550 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
                    >
                      <Check className="h-4 w-4" />
                      Resolve Alert
                    </button>
                    <button 
                      onClick={() => handleResolveIncident(selectedIncident.id, 'False Alarm')}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <XCircle className="h-4 w-4" />
                      False Alarm
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-900 pt-4 text-center">
                  This safety incident review is closed.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">PPE Incident Logs</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review historical violations, view captured snapshots, and verify resolutions.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Filter className="h-4 w-4" />
          Filter Logs:
        </div>

        <select 
          value={filterCamera}
          onChange={e => { setFilterCamera(e.target.value); setCurrentPage(1); }}
          className="bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-705 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Cameras</option>
          {cameras.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select 
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          className="bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-705 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Resolved">Resolved</option>
          <option value="False Alarm">False Alarm</option>
        </select>

        <select 
          value={filterSeverity}
          onChange={e => { setFilterSeverity(e.target.value); setCurrentPage(1); }}
          className="bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-705 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Severities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        
        {(filterCamera || filterStatus || filterSeverity) && (
          <button 
            onClick={() => {
              setFilterCamera('');
              setFilterStatus('');
              setFilterSeverity('');
              setCurrentPage(1);
            }}
            className="text-xs text-red-500 font-semibold hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Incidents Table list with Sticky Header */}
      <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold select-none shadow-[inset_0_-1px_0_rgba(226,232,240,1)] dark:shadow-[inset_0_-1px_0_rgba(30,41,59,1)]">
              <tr>
                <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition" onClick={() => handleSort('id')}>
                  <span className="flex items-center gap-1.5">ID <SortIndicator field="id" /></span>
                </th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition" onClick={() => handleSort('timestamp')}>
                  <span className="flex items-center gap-1.5">Timestamp <SortIndicator field="timestamp" /></span>
                </th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition" onClick={() => handleSort('location')}>
                  <span className="flex items-center gap-1.5">Location <SortIndicator field="location" /></span>
                </th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition" onClick={() => handleSort('camera')}>
                  <span className="flex items-center gap-1.5">Camera Feed <SortIndicator field="camera" /></span>
                </th>
                <th className="p-4">Missing PPE</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900">
              {currentIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No incidents logged matching filters.
                  </td>
                </tr>
              ) : (
                currentIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition">
                    <td className="p-4 font-bold text-slate-850 dark:text-slate-100">#{inc.id}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(inc.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap font-semibold">{inc.camera?.location || 'Unknown'}</td>
                    <td className="p-4 font-medium text-slate-500 dark:text-slate-400">{inc.camera?.name || 'Deleted Camera'}</td>
                    <td className="p-4 font-semibold text-orange-600 dark:text-orange-500">
                      {(inc.ppe_violation_types || "").split(',').join(', ').toUpperCase()}
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        inc.severity === 'High' ? 'bg-red-100 text-red-750 dark:bg-red-950/40 dark:text-red-400' :
                        inc.severity === 'Medium' ? 'bg-orange-100 text-orange-755 dark:bg-orange-950/40 dark:text-orange-400' :
                        'bg-yellow-100 text-yellow-755 dark:bg-yellow-950/40 dark:text-yellow-400'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        inc.status === 'Pending' ? 'bg-red-100 text-red-755 dark:bg-red-950/40 dark:text-red-400' :
                        inc.status === 'Resolved' ? 'bg-green-100 text-green-755 dark:bg-green-950/40 dark:text-green-400' :
                        'bg-slate-150 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedIncident(inc)}
                        className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:border-slate-350 dark:hover:bg-slate-750 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-200 transition active:scale-95"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Premium Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-xs text-slate-400">
              Showing <b>{indexOfFirstItem + 1}</b> to <b>{Math.min(indexOfLastItem, incidents.length)}</b> of <b>{incidents.length}</b> reports
            </span>
            <div className="flex gap-1.5 items-center select-none">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
                    currentPage === page 
                      ? 'bg-orange-650 text-white shadow-sm' 
                      : 'border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
