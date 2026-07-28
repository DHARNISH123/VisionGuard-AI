import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, 
  Plus, 
  MapPin, 
  Trash2, 
  X, 
  Tv,
  PowerOff,
  AlertCircle,
  Cpu,
  Gauge,
  Activity,
  CheckCircle2,
  Users,
  EyeOff,
  ShieldAlert,
  Sliders,
  BrainCircuit
} from 'lucide-react';

export default function Cameras() {
  const { user } = useAuth();
  const isWritable = ['Admin', 'Supervisor'].includes(user?.role);
  
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFeedId, setActiveFeedId] = useState(null);
  
  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);

  // Overlay HUD states
  const [privacyMask, setPrivacyMask] = useState(false);
  const [safetyFence, setSafetyFence] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);

  // Simulated live HUD values that fluctuate realistically
  const [fps, setFps] = useState(30);
  const [latency, setLatency] = useState(35);
  const [inference, setInference] = useState(14);
  const [workers, setWorkers] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setFps(Math.round(29.8 + Math.random() * 0.4));
      setLatency(Math.round(32 + Math.random() * 6));
      setInference(Math.round(12 + Math.random() * 4));
      setWorkers(Math.random() > 0.85 ? Math.round(1 + Math.random() * 2) : workers);
    }, 1500);
    return () => clearInterval(timer);
  }, [workers]);

  const fetchCameras = async () => {
    try {
      const data = await api.get('/api/v1/cameras');
      setCameras(data);
      if (data.length > 0 && !activeFeedId) {
        setActiveFeedId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();

    const handleCopilotSelectCamera = () => {
      const camId = localStorage.getItem('copilotSelectCameraId');
      if (camId) {
        setActiveFeedId(parseInt(camId));
        localStorage.removeItem('copilotSelectCameraId');
      }
    };
    window.addEventListener('copilot-select-camera', handleCopilotSelectCamera);
    setTimeout(handleCopilotSelectCamera, 150);

    return () => window.removeEventListener('copilot-select-camera', handleCopilotSelectCamera);
  }, []);

  const handleAddCamera = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const newCam = await api.post('/api/v1/cameras', {
        name,
        rtsp_url: rtspUrl || null,
        location
      });
      setCameras(prev => [...prev, newCam]);
      setShowAddModal(false);
      setName('');
      setRtspUrl('');
      setLocation('');
      if (!activeFeedId) {
        setActiveFeedId(newCam.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to add camera feed.');
    }
  };

  const handleDeleteCamera = async (id) => {
    if (!window.confirm("Are you sure you want to remove this camera?")) return;
    try {
      await api.delete(`/api/v1/cameras/${id}`);
      setCameras(prev => prev.filter(c => c.id !== id));
      if (activeFeedId === id) {
        setActiveFeedId(null);
      }
    } catch (err) {
      alert("Error deleting camera.");
    }
  };

  const toggleCameraActiveState = async (camera) => {
    try {
      const updated = await api.put(`/api/v1/cameras/${camera.id}`, {
        is_active: !camera.is_active
      });
      setCameras(prev => prev.map(c => c.id === camera.id ? updated : c));
    } catch (err) {
      alert("Error modifying camera power state.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  const selectedCam = cameras.find(c => c.id === activeFeedId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Live Camera Nodes</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deploy, configure, and inspect individual worksite streams.</p>
        </div>
        {isWritable && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-555 text-white rounded-lg px-4 py-2 text-xs font-semibold shadow transition active:scale-95 glow-orange"
          >
            <Plus className="h-4 w-4" />
            Add Camera
          </button>
        )}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Streams list */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Feed Listings</h3>
          <div className="space-y-3">
            {cameras.length === 0 ? (
              <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
                No cameras registered yet.
              </div>
            ) : (
              cameras.map(cam => (
                <div 
                  key={cam.id}
                  onClick={() => {
                    if (cam.is_active) setActiveFeedId(cam.id);
                  }}
                  className={`bg-white border p-4 rounded-xl shadow-sm transition flex flex-col gap-3.5 cursor-pointer ${
                    !cam.is_active ? 'opacity-70 bg-slate-50/50 dark:bg-slate-900/30' :
                    activeFeedId === cam.id ? 'border-orange-500 dark:bg-slate-900/90' :
                    'border-slate-200 dark:bg-slate-900 hover:border-slate-355 dark:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        !cam.is_active ? 'bg-slate-200 text-slate-400 dark:bg-slate-850' :
                        cam.status === 'Alerting' ? 'bg-red-500/10 text-red-500 animate-pulse' :
                        'bg-green-500/10 text-green-500'
                      }`}>
                        <Camera className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{cam.name}</p>
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400 mt-0.5 font-semibold">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-500" />
                          {cam.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold flex items-center gap-1 ${
                        !cam.is_active ? 'bg-slate-100 text-slate-450 dark:bg-slate-800' :
                        cam.status === 'Alerting' ? 'bg-red-100 text-red-600 dark:bg-red-955 dark:text-red-400' :
                        'bg-green-100 text-green-600 dark:bg-green-955 dark:text-green-400'
                      }`}>
                        {cam.is_active ? (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            LIVE
                          </>
                        ) : 'OFFLINE'}
                      </span>
                      
                      {isWritable && (
                        <button 
                          onClick={() => handleDeleteCamera(cam.id)}
                          className="p-1 rounded text-red-500 hover:bg-slate-150 dark:hover:bg-slate-800 transition"
                          title="Delete Feed"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {cam.is_active ? (
                    <div className="grid grid-cols-3 gap-y-2 gap-x-1.5 text-[10px] font-semibold text-slate-505 border-t border-slate-100 dark:border-slate-850 pt-2.5">
                      <div>Workers: <b className="text-slate-850 dark:text-slate-200">2</b></div>
                      <div>Violations: <b className="text-red-500">1</b></div>
                      <div>FPS: <b className="text-slate-850 dark:text-slate-200">30</b></div>
                      <div>Latency: <b className="text-slate-850 dark:text-slate-200">35ms</b></div>
                      <div>Confidence: <b className="text-slate-850 dark:text-slate-100">95%</b></div>
                      <div>Status: <span className="text-green-500 font-bold uppercase text-[8px]">Recording</span></div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-850 pt-2.5 text-[10px] text-slate-450" onClick={e => e.stopPropagation()}>
                      <span className="font-mono">No Stream Connection</span>
                      <button 
                        onClick={() => toggleCameraActiveState(cam)}
                        className="bg-orange-600 hover:bg-orange-550 text-white font-bold px-2.5 py-1 rounded text-[9px] transition active:scale-95 shadow-sm"
                      >
                        Reconnect Node
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Live Stream Viewer with HUD & Sidebar Toggles */}
        <div className="space-y-4 lg:col-span-2 animate-fade-in">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Live Video Stream</h3>
          
          {selectedCam && selectedCam.is_active ? (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden shadow-lg p-3 relative">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center border border-slate-900">
                  <img 
                    src={`/api/v1/cameras/${selectedCam.id}/stream`} 
                    alt="Live Camera Feed"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480' fill='%231F2937'%3E%3Crect width='100%25' height='100%25'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%239CA3AF' text-anchor='middle'%3EConnecting to stream...%3C/text%3E%3C/svg%3E";
                    }}
                  />

                  {/* HTML5 / SVG Overlay Layer for Safety Fence & Privacy Masks */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none select-none z-10" viewBox="0 0 640 360" preserveAspectRatio="none">
                    {/* Region of Interest Fencing */}
                    {safetyFence && (
                      <>
                        {/* Semi-transparent green bounding polygon safety zone */}
                        <polygon 
                          points="60,200 180,90 420,90 580,200 480,320 120,320" 
                          fill="rgba(16, 185, 129, 0.08)" 
                          stroke="rgba(16, 185, 129, 0.75)" 
                          strokeWidth="2.5"
                          strokeDasharray="5, 5"
                        />
                        {/* Label */}
                        <text x="75" y="190" fill="#10B981" fontSize="9" fontWeight="bold" fontFamily="monospace">ROI_SAFE_ZONE_A</text>
                      </>
                    )}

                    {/* Privacy blur overlays (simulating blurred faces of workers) */}
                    {privacyMask && (
                      <>
                        <g opacity="0.85">
                          {/* Face Blur Spot 1 */}
                          <circle cx="280" cy="140" r="14" fill="#64748B" />
                          <circle cx="280" cy="140" r="10" fill="#475569" stroke="#E2E8F0" strokeWidth="1" />
                          
                          {/* Face Blur Spot 2 */}
                          <circle cx="390" cy="155" r="14" fill="#64748B" />
                          <circle cx="390" cy="155" r="10" fill="#475569" stroke="#E2E8F0" strokeWidth="1" />
                        </g>
                        <text x="250" y="115" fill="#E2E8F0" fontSize="8" fontWeight="bold" fontFamily="monospace">PRIVACY_MASK_ACTIVE</text>
                      </>
                    )}
                  </svg>
                  
                  {/* HUD Overlay Panel - Enterprise SaaS look */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-4 flex flex-wrap items-center justify-between gap-4 select-none pointer-events-none text-white font-mono text-[10px] z-20">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-orange-500" />
                        YOLOv8: <b className="text-slate-100">{inference}ms</b>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Gauge className="h-3.5 w-3.5 text-blue-500" />
                        FPS: <b className="text-slate-100">{fps}</b>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-green-500 animate-pulse" />
                        Latency: <b className="text-slate-100">{latency}ms</b>
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-orange-500" />
                        Workers: <b className="text-slate-100">{workers}</b>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        Confidence: <b className="text-slate-100">{confidenceThreshold}%</b>
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs font-bold flex items-center gap-2 z-20">
                    <span className="h-2 w-2 rounded-full bg-red-650 animate-pulse"></span>
                    LIVE STREAM
                  </div>
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{selectedCam.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-orange-500" />
                      Worksite location: <b>{selectedCam.location}</b>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">RTSP pipeline address:</span>
                    <code className="text-[10px] text-orange-500 bg-slate-900 border border-slate-850 rounded px-2 py-0.5 mt-1 inline-block">
                      {selectedCam.rtsp_url || 'simulated_pipeline'}
                    </code>
                  </div>
                </div>
              </div>

              {/* Camera Health & Network Status Panel (Version 2.0 Feature) */}
              <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4.5 w-4.5 text-orange-500" />
                  Camera Health & Network Status
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">STREAM STATE</p>
                    <p className="font-bold text-green-500 mt-0.5">Online</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">FPS / LATENCY</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{fps} FPS / {latency}ms</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">RECORDING STATUS</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">Archiving (S3)</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">AI MODEL (YOLO)</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">YOLOv8n (Loaded)</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">GPU / CPU LOAD</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">14% / 8%</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">TEMPERATURE</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">58°C (Normal)</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">BANDWIDTH</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">4.2 Mbps</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">DOCKER STATUS</p>
                    <p className="font-semibold text-green-500 mt-0.5">Active (Container)</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">PACKET LOSS</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">0.0%</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">RESOLUTION</p>
                    <p className="font-mono text-slate-700 dark:text-slate-200 mt-0.5">1280 x 720</p>
                  </div>
                </div>
              </div>

              {/* Camera AI Insights (Version 2.0 Feature) */}
              <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <BrainCircuit className="h-4.5 w-4.5 text-orange-500 animate-pulse" />
                  Camera AI Insights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-3 rounded-lg space-y-2">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-450">Average Compliance</p>
                      <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                        {selectedCam.id === 2 ? "74%" : "96%"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-450">Violation Frequency</p>
                      <p className="font-semibold text-slate-750 dark:text-slate-250 mt-0.5">
                        {selectedCam.id === 2 ? "1.8 breaches / hr" : "0.1 breaches / hr"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-450">Peak Violation Time</p>
                      <p className="font-semibold text-slate-750 dark:text-slate-250 mt-0.5">
                        {selectedCam.id === 2 ? "14:00 - 15:30 (Shift change)" : "11:00 - 12:00"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 p-3 rounded-lg space-y-2">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-455">Most Missing PPE</p>
                      <p className="font-bold text-orange-500 mt-0.5">
                        {selectedCam.id === 2 ? "Respirators, Goggles" : "Gloves"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-455">Suggested Improvements</p>
                      <p className="text-slate-650 dark:text-slate-350 mt-0.5">
                        {selectedCam.id === 2 
                          ? "Conduct respirator awareness briefings immediately." 
                          : "Establish safety gate checks."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Video Controller Panel - NEW premium widget */}
              <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-4.5 w-4.5 text-orange-500" />
                  Analytics HUD Controls
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Privacy Blur Toggle */}
                  <div 
                    onClick={() => setPrivacyMask(!privacyMask)}
                    className={`border p-3.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer select-none transition-all ${
                      privacyMask ? 'border-orange-500/30 bg-orange-500/[0.01]' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <EyeOff className={`h-4.5 w-4.5 ${privacyMask ? 'text-orange-500' : 'text-slate-450'}`} />
                      <div>
                        <p className="text-[11px] font-bold text-slate-750 dark:text-slate-200">Privacy Masking</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Blur faces in frame</p>
                      </div>
                    </div>
                    <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${privacyMask ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                      <div className={`bg-white h-3.5 w-3.5 rounded-full shadow-md transform transition-transform ${privacyMask ? 'translate-x-3.5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Safe Zone Toggle */}
                  <div 
                    onClick={() => setSafetyFence(!safetyFence)}
                    className={`border p-3.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer select-none transition-all ${
                      safetyFence ? 'border-orange-500/30 bg-orange-500/[0.01]' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className={`h-4.5 w-4.5 ${safetyFence ? 'text-orange-500' : 'text-slate-455'}`} />
                      <div>
                        <p className="text-[11px] font-bold text-slate-750 dark:text-slate-200">ROI Safety Fence</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Define perimeter polygons</p>
                      </div>
                    </div>
                    <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${safetyFence ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                      <div className={`bg-white h-3.5 w-3.5 rounded-full shadow-md transform transition-transform ${safetyFence ? 'translate-x-3.5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Confidence Slider */}
                  <div className="border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl flex flex-col justify-center">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1.5">
                      <span>CONFIDENCE LEVEL</span>
                      <span className="text-orange-500 font-mono">{confidenceThreshold}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      value={confidenceThreshold} 
                      onChange={e => setConfidenceThreshold(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-855 rounded-xl p-16 text-center shadow flex flex-col items-center justify-center text-slate-500">
              <Tv className="h-12 w-12 text-slate-700 mb-4" />
              <p className="text-xs">No live feed selected, or target camera is currently Powered Off.</p>
              <p className="text-[11px] text-slate-650 mt-1">Select an active camera feed from the listings on the left.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-scale-in">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">Register Camera Feed</h3>
            <p className="text-xs text-slate-400 mb-5">Set up safety feeds by entering network streaming credentials.</p>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 dark:bg-red-955/20 dark:border-red-900 rounded-xl p-3.5 text-xs text-red-650 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddCamera} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500">Camera Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Chemical Mixing Room"
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-805 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500">RTSP Stream URL (Optional)</label>
                <input 
                  type="text" 
                  value={rtspUrl}
                  onChange={e => setRtspUrl(e.target.value)}
                  placeholder="e.g. rtsp://admin:123@192.168.1.100:554/h264"
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-805 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                />
                <span className="text-[10px] text-slate-500 block">Leave empty to run in simulated OpenCV feed mode.</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500">Worksite Location</label>
                <input 
                  type="text" 
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Chemical Mixing B"
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-805 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                />
                <span className="text-[10px] text-slate-500 block">Matches safety policies configured under the Policies tab.</span>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-550 text-white rounded-lg px-4 py-2 text-xs font-semibold shadow transition active:scale-95"
                >
                  Register Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
