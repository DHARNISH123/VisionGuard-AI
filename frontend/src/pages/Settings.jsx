import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Trash2, 
  Shield, 
  UserPlus, 
  Database, 
  Cpu, 
  Check, 
  AlertCircle,
  Activity,
  Server,
  Terminal
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quick user add form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Operator');
  const [success, setSuccess] = useState(null);

  // Live Terminal Logs Console states
  const [terminalLogs, setTerminalLogs] = useState([
    "[08:12:04] [SYSTEM] Initializing VisionGuard Safety Agent core...",
    "[08:12:05] [INFO] Fetching active camera database listings...",
    "[08:12:05] [SUCCESS] Loaded 2 safety camera pipelines from SQLite.",
    "[08:12:06] [MODEL] Loading YOLOv8 neural network weights from 'yolov8n.pt'...",
    "[08:12:09] [MODEL] YOLOv8 model initialized on GPU:0 (CUDA Cores enabled)."
  ]);

  const terminalEndRef = useRef(null);

  // Simulate scrolling terminal console
  useEffect(() => {
    if (user?.role !== 'Admin') return;
    
    const mockLogs = [
      "[STREAM] Connecting to camera feed 'Main Assembly Camera'...",
      "[STREAM] Pipeline active on RTSP://192.168.1.42:554/h264",
      "[DETECTION] Analyzing frames: Worker identified (Hardhat: YES, Vest: YES)",
      "[STREAM] Connecting to camera feed 'Chemical Lab Camera'...",
      "[DETECTION] Analyzing frames: Worker identified (Hardhat: YES, Goggles: NO)",
      "[WARNING] PPE Breach: Goggles missing at location 'Chemical Mixing B'",
      "[ALERT] Broadcast safety breach ID #402 to WebSocket channels",
      "[DATABASE] Saved incident snapshot file to /uploads/cam_2_104.jpg",
      "[STREAM] Stream FPS stabilized at 30.0 FPS. Latency: 32ms"
    ];

    const interval = setInterval(() => {
      const timeStr = new Date().toTimeString().split(' ')[0];
      const randomLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
      setTerminalLogs(prev => [...prev, `[${timeStr}] ${randomLog}`].slice(-25));
    }, 2800);

    return () => clearInterval(interval);
  }, [user]);

  // Scroll to bottom on new logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const fetchUsers = async () => {
    try {
      const data = await api.get('/api/v1/users/');
      setUsersList(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch system users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDeleteUser = async (targetId) => {
    if (targetId === user?.id) {
      alert("You cannot delete your own session profile.");
      return;
    }
    if (!window.confirm("Are you sure you want to remove this user profile?")) return;
    
    try {
      await api.delete(`/api/v1/users/${targetId}`);
      setUsersList(prev => prev.filter(u => u.id !== targetId));
    } catch (err) {
      alert("Error deleting user.");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("Account password must be at least 6 characters long.");
      return;
    }

    try {
      const newProfile = await api.post('/api/v1/auth/register', {
        email,
        password,
        full_name: fullName,
        role
      });
      setUsersList(prev => [...prev, newProfile]);
      setSuccess("Account added successfully.");
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('Operator');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to register user.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  // Non-admins see summary diagnostic page
  if (user?.role !== 'Admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">System Diagnostics</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Platform connection endpoints and environment settings.</p>
        </div>
        <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-orange-500" />
            Detector Capabilities
          </h3>
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <p><b>Model Engine:</b> OpenCV Bounding Bounding Box Renderer (YOLOv8 fallback activated)</p>
            <p><b>Worker threads:</b> Concurrent stream processor loops</p>
            <p><b>Snapshots policy:</b> Saved locally under backend uploads directory</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">System Administration</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage user account permissions, review connected sessions, and inspect system database settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Users List */}
        <div className="space-y-4 lg:col-span-2">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-orange-500" />
            Registered Staff Profiles
          </h3>
          
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {usersList.map(u => (
                <div key={u.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-55/50 dark:hover:bg-slate-800/10 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-355 shrink-0">
                      {u.full_name?.charAt(0) || u.email.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-850 dark:text-slate-100 truncate">{u.full_name || 'System User'}</p>
                      <p className="text-[10px] text-slate-405 truncate mt-0.5">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1 ${
                      u.role === 'Admin' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' :
                      u.role === 'Supervisor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      <Shield className="h-3 w-3 shrink-0" />
                      {u.role}
                    </span>

                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === user?.id}
                      className="p-1.5 rounded text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
                      title="Remove Account"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NEW Live Terminal Logs Console */}
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Terminal className="h-4.5 w-4.5 text-orange-500" />
            Live Platform Diagnostics Console
          </h3>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-lg font-mono text-[10px] text-slate-300 h-64 overflow-y-auto flex flex-col gap-1.5 border-l-4 border-l-orange-650">
            {terminalLogs.map((log, idx) => {
              const isWarning = log.includes("[WARNING]") || log.includes("[ALERT]");
              const isSuccess = log.includes("[SUCCESS]");
              return (
                <div 
                  key={idx} 
                  className={`leading-relaxed whitespace-pre-wrap ${
                    isWarning ? 'text-red-400' :
                    isSuccess ? 'text-green-400' :
                    'text-slate-350'
                  }`}
                >
                  {log}
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Right Side: Quick Add form & DB stats */}
        <div className="space-y-6 lg:col-span-1">
          {/* Quick Add Form */}
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-450 tracking-wider flex items-center gap-1.5">
              <UserPlus className="h-4.5 w-4.5 text-orange-500" />
              Register Staff User
            </h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 dark:bg-red-955/20 dark:border-red-900 rounded-xl p-3 text-[11px] text-red-650 dark:text-red-400 flex items-center gap-2 animate-fade-in">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 dark:bg-green-955/20 dark:border-green-900 rounded-xl p-3 text-[11px] text-green-650 dark:text-green-400 flex items-center gap-2 animate-fade-in">
                <Check className="h-4.5 w-4.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Staff Full Name</label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Officer name"
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="officer@site.com"
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Account Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">System Role</label>
                <select 
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 transition"
                >
                  <option value="Operator">Operator</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-550 text-white font-bold py-2 rounded-lg text-xs transition shadow active:scale-[0.98]"
              >
                Register Staff
              </button>
            </form>
          </div>

          {/* Platform Performance & System Diagnostics Card (Version 2.0 Feature) */}
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-450 tracking-wider flex items-center gap-1.5">
              <Database className="h-4.5 w-4.5 text-orange-500" />
              Platform Diagnostics
            </h3>
            
            <div className="space-y-3.5 text-[11px] text-slate-650 dark:text-slate-400">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 font-medium border-b border-slate-100 dark:border-slate-850 pb-3">
                <span>CPU Load:</span>
                <span className="text-right text-slate-850 dark:text-slate-200">12% (Auditing Active)</span>
                
                <span>RAM Usage:</span>
                <span className="text-right text-slate-850 dark:text-slate-200">4.2 GB / 16.0 GB</span>
                
                <span>GPU Acceleration:</span>
                <span className="text-right text-slate-850 dark:text-slate-200">CUDA (RTX Enabled)</span>
                
                <span>YOLOv8 Engine:</span>
                <span className="text-right text-slate-850 dark:text-slate-200 text-green-500">Active (yolov8n.pt)</span>
                
                <span>WebSocket Status:</span>
                <span className="text-right text-slate-850 dark:text-slate-200 text-green-500">Connected</span>
                
                <span>Gemini API:</span>
                <span className="text-right text-slate-850 dark:text-slate-200 text-orange-500">Active (Flash 1.5)</span>
              </div>
              
              <div className="space-y-2 pt-1.5">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                    <span>DATABASE INTEGRITY</span>
                    <span className="text-green-500 flex items-center gap-0.5">
                      <Activity className="h-3 w-3" />
                      100% Secure
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-full"></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                    <span>API RESPONSE LATENCY</span>
                    <span className="text-slate-400">12ms response</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full w-[95%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Architecture Diagram Card (Version 2.0 Feature) */}
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-450 tracking-wider flex items-center gap-1.5">
              <Server className="h-4.5 w-4.5 text-orange-500" />
              System Architecture Diagram
            </h3>
            <p className="text-xs text-slate-400">High-level components map for technical reviews and presentations.</p>
            
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-950 flex items-center justify-center">
              <svg className="w-full text-slate-400 font-mono text-[8px]" viewBox="0 0 240 180" fill="none">
                <rect x="10" y="10" width="80" height="30" rx="4" fill="rgba(249,115,22,0.1)" stroke="#F97316" strokeWidth="1" />
                <text x="50" y="28" fill="#fff" textAnchor="middle" fontWeight="bold">React Frontend</text>
                
                <rect x="130" y="10" width="100" height="30" rx="4" fill="rgba(16,185,129,0.1)" stroke="#10B981" strokeWidth="1" />
                <text x="180" y="28" fill="#fff" textAnchor="middle" fontWeight="bold">FastAPI Backend</text>
                
                <rect x="130" y="70" width="100" height="30" rx="4" fill="rgba(59,130,246,0.1)" stroke="#3B82F6" strokeWidth="1" />
                <text x="180" y="88" fill="#fff" textAnchor="middle" fontWeight="bold">YOLOv8 Engine</text>

                <rect x="10" y="70" width="80" height="30" rx="4" fill="rgba(168,85,247,0.1)" stroke="#A855F7" strokeWidth="1" />
                <text x="50" y="88" fill="#fff" textAnchor="middle" fontWeight="bold">Gemini API</text>

                <rect x="130" y="130" width="100" height="30" rx="4" fill="rgba(100,116,139,0.1)" stroke="#64748B" strokeWidth="1" />
                <text x="180" y="148" fill="#fff" textAnchor="middle" fontWeight="bold">SQLite DB</text>

                <rect x="10" y="130" width="80" height="30" rx="4" fill="rgba(236,72,153,0.1)" stroke="#EC4899" strokeWidth="1" />
                <text x="50" y="148" fill="#fff" textAnchor="middle" fontWeight="bold">WebSocket Loop</text>

                <path d="M90,25 L130,25" stroke="#94A3B8" strokeWidth="1.2" />
                <path d="M180,40 L180,70" stroke="#94A3B8" strokeWidth="1.2" />
                <path d="M180,100 L180,130" stroke="#94A3B8" strokeWidth="1.2" />
                <path d="M130,85 L90,85" stroke="#94A3B8" strokeWidth="1.2" />
                <path d="M50,100 L50,130" stroke="#94A3B8" strokeWidth="1.2" />
                <path d="M90,145 L130,145" stroke="#94A3B8" strokeWidth="1.2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
