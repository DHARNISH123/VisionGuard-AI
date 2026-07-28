import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { wsService } from '../services/websocket';
import { api } from '../services/api';
import { 
  LayoutDashboard, 
  Camera, 
  ShieldAlert, 
  ShieldCheck, 
  FileBarChart, 
  Settings, 
  LogOut, 
  HelpCircle,
  Sun, 
  Moon, 
  Menu, 
  X, 
  Bell,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Activity,
  ChevronDown,
  MessageSquare,
  Send,
  Sparkles,
  RefreshCw,
  Terminal
} from 'lucide-react';

export const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [globalSearchVal, setGlobalSearchVal] = useState("");
  
  // AI Assistant Drawer states
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'assistant', text: "Hello! I am your **VisionGuard Safety Assistant**.\n\nI can query safety analytics, cameras, and compliance records in real time. How can I help you today?" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const chatEndRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to WebSocket alerts
  useEffect(() => {
    wsService.connect((message) => {
      if (message.type === 'NEW_ALERT') {
        setLiveAlerts(prev => [message.data, ...prev].slice(0, 8));
        
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.12);
        } catch (e) {
          // AudioContext blocked
        }
      }
    });

    return () => wsService.disconnect();
  }, []);

  // Listen to Ctrl+K hotkey for search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const navGroups = [
    {
      title: 'Safety Operations',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Admin', 'Supervisor', 'Operator'] },
        { name: 'Live Cameras', path: '/cameras', icon: Camera, roles: ['Admin', 'Supervisor', 'Operator'] },
        { name: 'Incident Logs', path: '/incidents', icon: ShieldAlert, roles: ['Admin', 'Supervisor', 'Operator'] },
      ]
    },
    {
      title: 'Management',
      items: [
        { name: 'PPE Policies', path: '/policies', icon: ShieldCheck, roles: ['Admin', 'Supervisor'] },
        { name: 'Safety Analytics', path: '/analytics', icon: FileBarChart, roles: ['Admin', 'Supervisor'] },
        { name: 'System Settings', path: '/settings', icon: Settings, roles: ['Admin'] },
      ]
    },
    {
      title: 'Resources',
      items: [
        { name: 'About System', path: '/about', icon: HelpCircle, roles: ['Admin', 'Supervisor', 'Operator'] }
      ]
    }
  ];

  const dismissAlert = (alertId) => {
    setLiveAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const handleSendChat = async (messageText) => {
    const query = messageText || chatQuery;
    if (!query.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    if (!messageText) setChatQuery('');
    setChatLoading(true);

    try {
      const data = await api.post('/api/v1/ai/chat', { message: query });
      setChatMessages(prev => [...prev, { sender: 'assistant', text: data.response }]);

      // Safety Copilot interactive action handlers (Version 2.0 feature)
      const qLower = query.toLowerCase();
      
      if (qLower.includes("open dashboard")) {
        setTimeout(() => navigate('/'), 1200);
      } else if (qLower.includes("open analytics")) {
        setTimeout(() => navigate('/analytics'), 1200);
      } else if (qLower.includes("show worker safety scores") || qLower.includes("worker safety scores")) {
        setTimeout(() => {
          localStorage.setItem('copilotWorkerTab', 'true');
          window.dispatchEvent(new Event('copilot-worker-select'));
          navigate('/');
        }, 1500);
      } else if (qLower.includes("show critical alerts")) {
        setTimeout(() => {
          localStorage.setItem('copilotFilterSeverity', 'High');
          window.dispatchEvent(new Event('copilot-filter'));
          navigate('/incidents');
        }, 1500);
      } else if (qLower.includes("filter helmet violations")) {
        setTimeout(() => {
          localStorage.setItem('copilotFilterPPE', 'helmet');
          window.dispatchEvent(new Event('copilot-filter'));
          navigate('/incidents');
        }, 1500);
      } else if (qLower.includes("filter chemical lab")) {
        setTimeout(() => {
          localStorage.setItem('copilotFilterCamera', '2');
          window.dispatchEvent(new Event('copilot-filter'));
          navigate('/incidents');
        }, 1500);
      } else if (qLower.includes("show pending incidents") || qLower.includes("pending incidents")) {
        setTimeout(() => {
          localStorage.setItem('copilotFilterStatus', 'Pending');
          window.dispatchEvent(new Event('copilot-filter'));
          navigate('/incidents');
        }, 1500);
      } else if (qLower.includes("camera 2") || qLower.includes("cam 2") || qLower.includes("open camera 2")) {
        setTimeout(() => {
          localStorage.setItem('copilotSelectCameraId', '2');
          window.dispatchEvent(new Event('copilot-select-camera'));
          navigate('/cameras');
        }, 1500);
      } else if (qLower.includes("report") || qLower.includes("pdf") || qLower.includes("csv") || qLower.includes("generate")) {
        setTimeout(() => {
          const element = document.createElement("a");
          const file = new Blob([
            "VisionGuard AI Safety Suite - Executive Daily Compliance Report\n" +
            "Date: " + new Date().toLocaleDateString() + "\n\n" +
            "Statistics:\n" +
            "- Overall Compliance Rate: 96.2%\n" +
            "- Deployed Nodes: 3 online\n" +
            "- High Severity Breaches: 0 active\n" +
            "- Recommendations: Conduct weekly respirator briefings in Chemical mixing zone.\n\n" +
            "Approved by: Safety Copilot Engine v2.0"
          ], {type: 'text/plain'});
          element.href = URL.createObjectURL(file);
          element.download = "VisionGuard_Daily_Safety_Report.txt";
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }, 2000);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'assistant', text: "⚠️ **System Connection Failure:** Unable to connect to safety assistant processor." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const quickQueries = [
    "Helmet violations today?",
    "Show pending incidents",
    "Department compliance rating"
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 flex">
      
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col bg-slate-900 text-slate-100 border-r border-slate-880 shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80 h-16">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-extrabold text-lg shrink-0 glow-orange">
              V
            </div>
            {!sidebarCollapsed && (
              <div className="transition-opacity duration-300">
                <h1 className="font-bold text-sm tracking-wide text-white leading-none">VisionGuard AI</h1>
                <span className="text-[9px] text-orange-505 font-semibold uppercase tracking-wider">Industrial Suite</span>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button 
              onClick={() => setSidebarCollapsed(true)} 
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              title="Collapse Menu"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
          {navGroups.map((group, gIdx) => {
            const filteredItems = group.items.filter(item => item.roles.includes(user?.role));
            if (filteredItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1.5">
                {!sidebarCollapsed && (
                  <h3 className="px-4 text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-0.5">
                  {filteredItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        title={sidebarCollapsed ? item.name : undefined}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all relative ${
                          isActive 
                            ? 'bg-orange-600/10 text-orange-500 border-l-4 border-orange-600 pl-3' 
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5 shrink-0" />
                        {!sidebarCollapsed && <span>{item.name}</span>}
                        {sidebarCollapsed && isActive && (
                          <span className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600 rounded-r"></span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 h-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-sm font-bold text-orange-500 shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate text-white leading-tight">{user?.fullName}</p>
                <p className="text-[10px] text-slate-505 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          {sidebarCollapsed ? (
            <button 
              onClick={() => setSidebarCollapsed(false)} 
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition mx-auto"
              title="Expand Menu"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button 
              onClick={logout} 
              title="Log Out"
              className="text-slate-400 hover:text-red-400 p-1.5 rounded hover:bg-slate-800 transition shrink-0"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Navigation overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-100 transition-transform duration-350 transform md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-5 flex items-center justify-between border-b border-slate-800 h-16">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-orange-600 flex items-center justify-center text-white font-extrabold text-lg glow-orange">V</div>
            <h1 className="font-bold text-sm text-white">VisionGuard</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {navGroups.map((group, gIdx) => {
            const filteredItems = group.items.filter(item => item.roles.includes(user?.role));
            if (filteredItems.length === 0) return null;
            return (
              <div key={gIdx} className="space-y-2">
                <h3 className="px-4 text-[9px] uppercase font-bold text-slate-500 tracking-wider">{group.title}</h3>
                <div className="space-y-0.5">
                  {filteredItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                          isActive 
                            ? 'bg-orange-600/10 text-orange-500 border-l-4 border-orange-600 pl-3' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 h-20">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-sm font-bold text-orange-500">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">{user?.fullName}</p>
              <p className="text-[10px] text-slate-505 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-red-400 p-1 rounded">
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 bg-white/95 border-b border-slate-200/80 shadow-sm backdrop-blur-md dark:bg-slate-900/90 dark:border-slate-800/80 transition-colors">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Premium Search Bar with Hotkey */}
          <div className="hidden sm:flex items-center relative w-72" ref={searchRef}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              id="global-search"
              type="text" 
              placeholder="Search workers, cameras, logs..." 
              value={globalSearchVal}
              onChange={e => setGlobalSearchVal(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-10 pr-12 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white dark:bg-slate-950 dark:border-slate-850 dark:text-slate-200 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded border dark:border-slate-700/80 pointer-events-none">
              Ctrl+K
            </kbd>

            {/* Smart Search Results Card (Version 2.0 Feature) */}
            {searchFocused && globalSearchVal.trim() !== "" && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50 max-h-80 overflow-y-auto animate-scale-in">
                <div className="px-3.5 py-1 border-b border-slate-100 dark:border-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Matches Found
                </div>
                {(() => {
                  const items = [
                    { name: "Marcus Thorne (ID: VG-WRK-005)", category: "Worker", path: "/", action: () => { localStorage.setItem('copilotWorkerSelect', 'VG-WRK-005'); window.dispatchEvent(new Event('copilot-worker-select')); } },
                    { name: "Sarah Jenkins (ID: VG-WRK-004)", category: "Worker", path: "/", action: () => { localStorage.setItem('copilotWorkerSelect', 'VG-WRK-004'); window.dispatchEvent(new Event('copilot-worker-select')); } },
                    { name: "Chemical Lab Camera (CAM_02)", category: "Camera", path: "/cameras", action: () => { localStorage.setItem('copilotSelectCameraId', '2'); window.dispatchEvent(new Event('copilot-select-camera')); } },
                    { name: "Alert #841 (High Severity respirator breach)", category: "Incident", path: "/incidents", action: () => { localStorage.setItem('copilotFilterStatus', 'Pending'); window.dispatchEvent(new Event('copilot-filter')); } },
                    { name: "Safety Policies Management", category: "Setting", path: "/policies" },
                    { name: "Database Health & API Keys Settings", category: "Setting", path: "/settings" }
                  ].filter(x => x.name.toLowerCase().includes(globalSearchVal.toLowerCase()) || x.category.toLowerCase().includes(globalSearchVal.toLowerCase()));

                  if (items.length === 0) {
                    return <p className="p-4 text-center text-slate-400 text-[10px]">No search matches found.</p>;
                  }

                  return items.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        if (item.action) item.action();
                        navigate(item.path);
                        setGlobalSearchVal("");
                        setSearchFocused(false);
                      }}
                      className="px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition flex justify-between items-center text-[11px]"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">{item.name}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400 shrink-0 font-mono">{item.category}</span>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-850 transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className={`p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-850 transition relative ${
                  liveAlerts.length > 0 ? 'text-red-500 dark:text-red-400' : ''
                }`}
              >
                <Bell className="h-4.5 w-4.5" />
                {liveAlerts.length > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 glow-red animate-ping"></span>
                )}
              </button>
              
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 max-h-96 overflow-y-auto animate-scale-in">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Safety Event Center</span>
                    <button 
                      onClick={() => setLiveAlerts([])}
                      className="text-[10px] text-slate-450 hover:text-red-550 font-semibold"
                    >
                      Clear All
                    </button>
                  </div>
                  {/* Critical warnings section */}
                  <div className="px-4 py-1.5 bg-red-500/5 text-red-500 font-bold text-[9px] uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span>Critical Alerts ({liveAlerts.length})</span>
                    <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-ping" />
                  </div>
                  {liveAlerts.length === 0 ? (
                    <div className="p-4 text-center text-[10px] text-slate-450 italic">
                      No active breaches. Plant is secure.
                    </div>
                  ) : (
                    liveAlerts.map(alert => (
                      <div key={alert.id} className="p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <div className="flex gap-2 items-start">
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Missing PPE: {alert.ppe_violation_types.join(', ')}</p>
                            <p className="text-[10px] text-slate-450 mt-0.5">Camera: {alert.camera_name}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[9px] text-slate-400">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                              <button 
                                onClick={() => {
                                  dismissAlert(alert.id);
                                  navigate('/incidents');
                                }}
                                className="text-[9px] font-semibold text-orange-500 hover:underline"
                              >
                                Review
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Warning Logs Section */}
                  <div className="px-4 py-1.5 bg-yellow-500/5 text-yellow-600 font-bold text-[9px] uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    Warning Updates
                  </div>
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Safety Probation Alert</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Worker Marcus Thorne rating dropped below 75% in Chemical Zone.</p>
                  </div>

                  {/* Resolved Updates Section */}
                  <div className="px-4 py-1.5 bg-green-500/5 text-green-600 font-bold text-[9px] uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    Resolved Updates
                  </div>
                  <div className="p-3 text-[11px] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Compliance Restored</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Alert #835 at Assembly Line A marked Resolved by system.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-850"></div>

            {/* Profile Menu Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-855 transition"
              >
                <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-xs font-bold text-orange-500">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-scale-in">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user?.fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      to="/settings" 
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      Account Settings
                    </Link>
                    <button 
                      onClick={() => {
                        setShowProfileDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Live notification bar */}
        {liveAlerts.length > 0 && (
          <div className="bg-red-650 text-white px-6 py-2.5 flex items-center justify-between gap-4 font-semibold text-xs alert-pulse-border border-b glow-red animate-fade-in relative z-20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 animate-pulse" />
              <span>
                CRITICAL WARNING: PPE Violation detected at <b>{liveAlerts[0].location}</b>. 
                Missing: {liveAlerts[0].ppe_violation_types.join(', ').toUpperCase()} on <b>{liveAlerts[0].camera_name}</b>.
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/incidents')}
                className="bg-white text-red-600 px-3 py-1 rounded-md text-[10px] font-bold hover:bg-slate-100 active:scale-95 transition"
              >
                Investigate
              </button>
              <button 
                onClick={() => dismissAlert(liveAlerts[0].id)}
                className="text-white hover:text-slate-200 p-0.5 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <main className="flex-1 p-6 overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* Floating AI Chat Bubble - NEW Flagship Feature (V2.0 Requirement) */}
      <button 
        onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-orange-600 text-white shadow-xl flex items-center justify-center transition hover:scale-105 active:scale-95 glow-orange z-50"
        title="VisionGuard AI Assistant"
      >
        {aiDrawerOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>

      {/* AI Assistant Right-Side sliding Drawer */}
      <div 
        className={`fixed right-0 top-16 bottom-0 z-40 bg-white border-l border-slate-200 shadow-2xl dark:bg-slate-900 dark:border-slate-800 w-96 transform transition-transform duration-300 flex flex-col justify-between ${
          aiDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-orange-500/10 text-orange-500">
              <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">VisionGuard Safety Assistant</h4>
              <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Gemini Cognition</p>
            </div>
          </div>
          <button 
            onClick={() => setAiDrawerOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Chat logs list */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs scrollbar">
          {chatMessages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <span className="text-[9px] text-slate-400 uppercase font-mono font-bold mb-1">
                {msg.sender === 'user' ? 'Safety Officer' : 'Safety AI'}
              </span>
              <div 
                className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user' 
                    ? 'bg-orange-655 text-white rounded-tr-none shadow-sm shadow-orange-950/10' 
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-300 rounded-tl-none border border-slate-200/80 dark:border-slate-850'
                }`}
              >
                {/* Parse basic markdown highlights */}
                {msg.text.split('\n').map((line, lIdx) => {
                  let parsedLine = line;
                  // Handle Bold markdown highlights
                  const boldRegex = /\*\*(.*?)\*\*/g;
                  let match;
                  const parts = [];
                  let lastIndex = 0;
                  
                  while ((match = boldRegex.exec(line)) !== null) {
                    parts.push(line.substring(lastIndex, match.index));
                    parts.push(<b key={match.index} className="font-bold text-orange-505 dark:text-orange-500">{match[1]}</b>);
                    lastIndex = boldRegex.lastIndex;
                  }
                  parts.push(line.substring(lastIndex));
                  
                  return (
                    <p key={lIdx} className={line.trim() === '' ? 'h-2' : 'mb-1'}>
                      {parts.length > 0 ? parts : parsedLine}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium font-mono animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin text-orange-500" />
              Gemini processing database audit...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Drawer Input & Quick chips */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/10 shrink-0">
          
          {/* Quick chip queries */}
          <div className="flex flex-wrap gap-1.5">
            {quickQueries.map((q, idx) => (
              <button 
                key={idx}
                onClick={() => handleSendChat(q)}
                disabled={chatLoading}
                className="bg-white border border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-350 hover:border-slate-350 dark:hover:border-slate-750 px-2 py-1 rounded-lg text-[9px] font-semibold transition active:scale-95 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} 
            className="flex gap-2 relative items-center"
          >
            <input 
              type="text" 
              placeholder="Ask safety records questions..."
              value={chatQuery}
              onChange={e => setChatQuery(e.target.value)}
              disabled={chatLoading}
              className="w-full bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 transition"
            />
            <button 
              type="submit"
              disabled={chatLoading || !chatQuery.trim()}
              className="absolute right-2 text-slate-450 hover:text-orange-500 p-1.5 rounded transition disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
