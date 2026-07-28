import React from 'react';
import { 
  Server, 
  Cpu, 
  Database, 
  HelpCircle, 
  Activity, 
  ShieldCheck, 
  Network,
  GitBranch,
  Layers,
  Workflow
} from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">About System Architecture</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Technical specifications, hardware block pipelines, and interview reference blueprints.</p>
      </div>

      {/* Main Grid: Overview & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Product Overview & Features */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-orange-555 tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4.5 w-4.5" />
              Product Overview
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-350">
              <b>VisionGuard AI</b> is an enterprise-grade industrial PPE monitoring platform that utilizes automated computer vision to check compliance flags and protect employees in high-risk zones.
            </p>
            
            <div className="border-t border-slate-100 dark:border-slate-850 pt-3.5 space-y-2">
              <h4 className="text-[10px] uppercase font-bold text-slate-400">Core Features</h4>
              <div className="grid grid-cols-1 gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-350">
                {[
                  "Real-Time PPE Detection",
                  "AI Safety Copilot (YOLOv8, Gemini)",
                  "Incident Lifecycle Management",
                  "Factory Map Sector Audits",
                  "Live Stream Telemetry Matrix",
                  "Automated PDF/CSV Exports",
                  "Worker Compliance Profiling",
                  "Role-Based Security Gates"
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-orange-500 rounded-full shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technology Stack Details */}
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-450 tracking-wider flex items-center gap-1.5">
              <Layers className="h-4.5 w-4.5 text-orange-500" />
              Technology Stack
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-2">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Frontend</p>
                  <p className="text-[10px] text-slate-400">React, Vite, Vanilla CSS</p>
                </div>
                <span className="text-[9px] uppercase font-bold bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded">UI Layer</span>
              </div>

              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-2">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Backend</p>
                  <p className="text-[10px] text-slate-400">FastAPI, Python, Uvicorn</p>
                </div>
                <span className="text-[9px] uppercase font-bold bg-green-500/10 text-green-600 px-2 py-0.5 rounded">API Layer</span>
              </div>

              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-2">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">AI Engine</p>
                  <p className="text-[10px] text-slate-400">YOLOv8, Google Gemini API, OpenCV</p>
                </div>
                <span className="text-[9px] uppercase font-bold bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">Model Core</span>
              </div>

              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-2">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Database</p>
                  <p className="text-[10px] text-slate-400">SQLite (PostgreSQL Ready)</p>
                </div>
                <span className="text-[9px] uppercase font-bold bg-slate-500/10 text-slate-600 px-2 py-0.5 rounded">Persistence</span>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Deployment</p>
                  <p className="text-[10px] text-slate-400">Docker, AWS S3 Assets</p>
                </div>
                <span className="text-[9px] uppercase font-bold bg-pink-500/10 text-pink-600 px-2 py-0.5 rounded">Infra</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagrams Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Architecture Diagram */}
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-450 tracking-wider flex items-center gap-1.5">
              <Network className="h-4.5 w-4.5 text-orange-500" />
              Platform Data Flow Diagram
            </h3>
            <p className="text-xs text-slate-400">Step-by-step trace showing real-time telemetry pipeline from camera capture to UI alerts.</p>
            
            <div className="border border-slate-100 dark:border-slate-850 rounded-xl p-4 bg-slate-950 flex items-center justify-center">
              <svg className="w-full text-slate-400 font-mono text-[9px]" viewBox="0 0 420 180" fill="none">
                {/* Nodes */}
                <rect x="10" y="70" width="70" height="35" rx="5" fill="rgba(249,115,22,0.06)" stroke="#F97316" strokeWidth="1" />
                <text x="45" y="88" fill="#fff" textAnchor="middle" fontWeight="bold">Camera Feed</text>
                <text x="45" y="99" fill="#94A3B8" textAnchor="middle" fontSize="7">RTSP Stream</text>

                <rect x="110" y="70" width="70" height="35" rx="5" fill="rgba(59,130,246,0.06)" stroke="#3B82F6" strokeWidth="1" />
                <text x="145" y="88" fill="#fff" textAnchor="middle" fontWeight="bold">YOLOv8</text>
                <text x="145" y="99" fill="#94A3B8" textAnchor="middle" fontSize="7">Bounding Box</text>

                <rect x="210" y="70" width="80" height="35" rx="5" fill="rgba(16,185,129,0.06)" stroke="#10B981" strokeWidth="1" />
                <text x="250" y="88" fill="#fff" textAnchor="middle" fontWeight="bold">FastAPI Core</text>
                <text x="250" y="99" fill="#94A3B8" textAnchor="middle" fontSize="7">Uvicorn Engine</text>

                <rect x="320" y="20" width="80" height="35" rx="5" fill="rgba(168,85,247,0.06)" stroke="#A855F7" strokeWidth="1" />
                <text x="360" y="38" fill="#fff" textAnchor="middle" fontWeight="bold">Gemini AI</text>
                <text x="360" y="49" fill="#94A3B8" textAnchor="middle" fontSize="7">Root Cause</text>

                <rect x="320" y="120" width="80" height="35" rx="5" fill="rgba(236,72,153,0.06)" stroke="#EC4899" strokeWidth="1" />
                <text x="360" y="138" fill="#fff" textAnchor="middle" fontWeight="bold">React UI</text>
                <text x="360" y="149" fill="#94A3B8" textAnchor="middle" fontSize="7">Dashboard</text>

                {/* Arrows */}
                <path d="M80,87.5 L110,87.5" stroke="#475569" strokeWidth="1.5" />
                <path d="M180,87.5 L210,87.5" stroke="#475569" strokeWidth="1.5" />
                <path d="M290,80 L320,37.5" stroke="#475569" strokeWidth="1.5" />
                <path d="M290,95 L320,137.5" stroke="#475569" strokeWidth="1.5" />
                <path d="M360,55 L360,120" stroke="#475569" strokeWidth="1.5" strokeDasharray="3,3" />
              </svg>
            </div>
          </div>

          {/* Detection Pipeline details */}
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-455 tracking-wider flex items-center gap-1.5">
              <Workflow className="h-4.5 w-4.5 text-orange-500" />
              PPE Detection Loop
            </h3>
            <p className="text-xs text-slate-400 font-medium">Platform processing steps mapped from frame extraction to supervisor alert dispatch.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <span className="h-5 w-5 bg-orange-600/10 text-orange-500 font-bold font-mono rounded flex items-center justify-center text-[10px]">01</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">Frame Capture Pipeline</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-7">
                  Extraction loop processes live frames from RTSP camera streams every 3 seconds to manage network overhead.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <span className="h-5 w-5 bg-orange-600/10 text-orange-500 font-bold font-mono rounded flex items-center justify-center text-[10px]">02</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">YOLO Model Detection</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-7">
                  Object detection categorizes worker PPE gear configurations (e.g. Helmet, Gloves, Vest) against targeted policies.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <span className="h-5 w-5 bg-orange-600/10 text-orange-500 font-bold font-mono rounded flex items-center justify-center text-[10px]">03</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">Hysteresis Evaluation</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-7">
                  Compliance filters compare active violation logs to prevent duplicate database entries on consecutive frames.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <span className="h-5 w-5 bg-orange-600/10 text-orange-500 font-bold font-mono rounded flex items-center justify-center text-[10px]">04</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">Gemini Root-Cause Summary</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-7">
                  Copilot analysis reads database specs to yield recommendations, supervisor summaries, and resolved checklists.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
