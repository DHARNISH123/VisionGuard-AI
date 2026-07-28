import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Video, Bell, FileText, CheckCircle, ShieldAlert, Cpu, ChevronDown, ChevronUp, Calculator, DollarSign, Clock, ShieldCheck as SafetyIcon } from 'lucide-react';

export default function Landing() {
  const [activeFaq, setActiveFaq] = useState(null);
  
  // ROI Calculator states
  const [workerCount, setWorkerCount] = useState(50);
  const [cameraCount, setCameraCount] = useState(8);

  // Dynamic ROI computations
  const estimatedFineSavings = Math.round(workerCount * 480 + cameraCount * 1250);
  const weeklyHoursSaved = Math.round((cameraCount * 1.8) + (workerCount * 0.15));
  const incidentMitigationPercent = Math.min(99, Math.round(85 + (cameraCount * 0.8)));

  const features = [
    {
      title: "Real-Time AI Detection",
      desc: "Our YOLOv8 computer vision model analyzes live RTSP camera frames instantly on site Edge devices or AWS servers.",
      icon: Cpu
    },
    {
      title: "Complete PPE Compliance",
      desc: "Enforce helmets, high-visibility safety vests, gloves, boots, respirator masks, and protective goggles.",
      icon: ShieldCheck
    },
    {
      title: "WebSocket Alerts",
      desc: "Zero delay notifications. Safety teams receive instant desktop alarms and visual highlights on violations.",
      icon: Bell
    },
    {
      title: "Audit-Ready Exporter",
      desc: "Compile safety reports in PDF and CSV tables to present to regulatory boards or corporate governance teams.",
      icon: FileText
    }
  ];

  const pricing = [
    {
      name: "Starter Site",
      price: "$199",
      period: "per month",
      desc: "Perfect for single manufacturing floors or small logistics depots.",
      features: [
        "Up to 3 Camera Feeds",
        "Standard YOLOv8 PPE Check",
        "Live Dashboard & Alerts",
        "7 Days Incident Log Storage",
        "Email Notifications"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Enterprise Safety",
      price: "$599",
      period: "per month",
      desc: "For multi-worksite factories and heavy construction zones.",
      features: [
        "Unlimited Camera Feeds",
        "Custom Trained Model Fine-Tuning",
        "Dedicated Supervisor Console",
        "90 Days Snapshot S3 Archive",
        "PDF/CSV Compliance Audits",
        "SLA & Active AWS Deployments"
      ],
      cta: "Contact Enterprise",
      popular: true
    }
  ];

  const faqs = [
    {
      q: "How does VisionGuard AI connect to our cameras?",
      a: "VisionGuard AI connects directly to any network-attached camera that supports the RTSP (Real-Time Streaming Protocol) standard. Simply input the stream address in the Camera management panel, and the pipeline will automatically bind."
    },
    {
      q: "Can the detection system run locally without cloud uploads?",
      a: "Yes. VisionGuard AI supports edge deployments. The processing engine runs local camera streaming analyses on your hardware and stores snapshots on-premise, allowing it to function completely behind private enterprise firewalls."
    },
    {
      q: "How are false alarms minimized?",
      a: "Our YOLOv8 compliance models verify human body structures and safety clothing shapes concurrently. Toggling worksite-specific policies (like disabling respirator requirements on loading docks) ensures safety officers are alerted only to critical breaches."
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* Background Grids & Ambient Lights */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))] pointer-events-none z-0"></div>
      <div className="absolute top-[800px] left-1/4 h-[400px] w-[400px] rounded-full bg-orange-600/5 blur-[120px] pointer-events-none"></div>

      {/* Header Navigation */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center font-black text-xl text-white glow-orange">V</div>
          <span className="font-extrabold text-lg tracking-wide text-white">VisionGuard AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-bold text-slate-300 hover:text-white transition">Sign In</Link>
          <Link to="/register" className="bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-650/10 transition active:scale-95">
            Free Trial
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center md:py-28">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 text-[10px] text-orange-400 font-bold mb-6 border border-slate-700/80 uppercase tracking-wider">
          <ShieldAlert className="h-4 w-4 text-orange-500" />
          Production-Ready Industrial AI Safety Platform
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight max-w-4xl mx-auto tracking-tight">
          Automate Site Safety & PPE Compliance with <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">YOLOv8 Computer Vision</span>
        </h1>
        
        <p className="mt-6 text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          VisionGuard AI integrates with existing RTSP safety cameras to perform real-time helmet, vest, and protective gear inspection. Mitigate risks and avoid regulatory fines.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/register" className="bg-orange-600 text-white text-xs font-bold px-8 py-4 rounded-xl hover:bg-orange-550 hover:shadow-xl hover:shadow-orange-600/10 transition active:scale-95 glow-orange">
            Deploy Free Trial
          </Link>
          <a href="#features" className="bg-slate-800/80 text-white border border-slate-700/80 text-xs font-bold px-8 py-4 rounded-xl hover:bg-slate-700/80 transition">
            Explore Features
          </a>
        </div>

        {/* Dashboard Mockup Showcase */}
        <div className="mt-20 relative rounded-2xl border border-slate-850 bg-slate-950/70 p-4 shadow-2xl overflow-hidden max-w-5xl mx-auto backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
          {/* Header Mockup */}
          <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
            </div>
            <div className="bg-slate-900/80 text-[10px] text-slate-500 px-8 py-1 rounded-md border border-slate-855">
              visionguard.app/console/dashboard
            </div>
            <div className="w-6"></div>
          </div>
          {/* Dashboard Canvas mockup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left relative z-20">
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-850">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Compliance Rate</span>
              <h3 className="text-2xl font-extrabold text-green-500 mt-1">98.4% Secure</h3>
              <p className="text-[11px] text-slate-400 mt-1">Target threshold: 95%</p>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-850">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Camera Nodes</span>
              <h3 className="text-2xl font-extrabold text-white mt-1">12 Streams</h3>
              <p className="text-[11px] text-slate-400 mt-1">All systems online</p>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-850">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Unresolved Incidents</span>
              <h3 className="text-2xl font-extrabold text-red-500 mt-1 font-sans">2 Pending</h3>
              <p className="text-[11px] text-slate-400 mt-1">1 Chemical site, 1 Loader</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-slate-950/60 backdrop-blur-md py-24 border-y border-slate-850 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Full-Suite SaaS Industrial Safety Solution</h2>
            <p className="text-xs text-slate-400 mt-3 max-w-lg mx-auto">VisionGuard AI matches enterprise demands, running containerized setups or remote cloud streams efficiently.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="bg-slate-900/80 border border-slate-850 p-6 rounded-xl hover:border-orange-500/50 hover:shadow-xl transition-all duration-300 group">
                  <div className="h-11 w-11 bg-orange-600/10 text-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition">
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">{feat.title}</h3>
                  <p className="text-slate-400 text-xs mt-2.5 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced ROI Calculator Section - NEW Premium SaaS Widget */}
      <section className="py-24 bg-slate-900/50 relative z-10 border-b border-slate-850">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 text-[9px] text-orange-500 font-bold mb-4 uppercase tracking-wider">
              <Calculator className="h-3.5 w-3.5" />
              SaaS Value Calculator
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Calculate Your Safety ROI</h2>
            <p className="text-xs text-slate-400 mt-2">Estimate compliance fine reductions and auditing hours saved instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-950/60 border border-slate-850 rounded-2xl p-8 backdrop-blur-md">
            
            {/* Sliders Input */}
            <div className="space-y-6 flex flex-col justify-center">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-350">
                  <span>ACTIVE SITE WORKERS</span>
                  <span className="text-orange-500 font-mono text-sm">{workerCount} staff</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="250" 
                  value={workerCount} 
                  onChange={e => setWorkerCount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-semibold">
                  <span>10 Workers</span>
                  <span>250 Max</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-350">
                  <span>DEPLOYED CAMERA FEEDS</span>
                  <span className="text-orange-500 font-mono text-sm">{cameraCount} nodes</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="48" 
                  value={cameraCount} 
                  onChange={e => setCameraCount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-semibold">
                  <span>2 Feeds</span>
                  <span>48 Max</span>
                </div>
              </div>
            </div>

            {/* Computed Outputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-4">
              <div className="bg-slate-900/50 p-4 border border-slate-850/80 rounded-xl flex items-center gap-4">
                <div className="p-2 bg-green-500/10 text-green-500 rounded-lg shrink-0">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Estimated Penalty Savings</p>
                  <h4 className="text-lg font-extrabold text-white font-mono mt-0.5">${estimatedFineSavings.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/ year</span></h4>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 border border-slate-850/80 rounded-xl flex items-center gap-4">
                <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Auditing Hours Recovered</p>
                  <h4 className="text-lg font-extrabold text-white font-mono mt-0.5">{weeklyHoursSaved} hrs <span className="text-[10px] text-slate-400 font-normal">/ week</span></h4>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 border border-slate-850/80 rounded-xl flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
                  <SafetyIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Breach Mitigation Rate</p>
                  <h4 className="text-lg font-extrabold text-white font-mono mt-0.5">{incidentMitigationPercent}% reduction</h4>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Flexible Plans for Worksites of Any Scale</h2>
          <p className="text-xs text-slate-400 mt-3">Start small to audit single hazard rooms, or scale to full factory chains.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricing.map((plan, idx) => (
            <div 
              key={idx} 
              className={`bg-slate-900/80 border rounded-2xl p-8 flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 ${
                plan.popular ? 'border-orange-500 shadow-xl shadow-orange-950/5 relative' : 'border-slate-850'
              }`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-8 -translate-y-1/2 bg-orange-600 text-white text-[9px] uppercase font-extrabold px-3 py-1 rounded-full tracking-wider">
                  Recommended
                </span>
              )}
              <div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-slate-400 text-xs mt-2">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-slate-400 text-xs">{plan.period}</span>
                </div>
                <hr className="border-slate-850 my-6" />
                <ul className="space-y-3">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3 text-xs text-slate-300">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <button className={`mt-8 w-full py-3 rounded-xl font-bold text-xs transition active:scale-[0.98] ${
                plan.popular 
                  ? 'bg-orange-600 text-white hover:bg-orange-500' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive FAQ Accordion Section */}
      <section className="py-20 bg-slate-950/40 border-t border-slate-855 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400 mt-2">Clear answers to help you deploy VisionGuard AI securely.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-slate-900/60 border border-slate-850 rounded-xl overflow-hidden transition"
                >
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center p-5 text-left text-xs font-bold text-white hover:bg-slate-800/30 transition focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-orange-500" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>
                  <div 
                    className={`transition-all duration-350 ease-in-out ${
                      isOpen ? 'max-h-40 border-t border-slate-855' : 'max-h-0'
                    } overflow-hidden`}
                  >
                    <p className="p-5 text-xs text-slate-400 leading-relaxed bg-slate-900/30">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950 border-t border-slate-850 py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white text-base">V</div>
            <span className="font-extrabold text-white">VisionGuard AI</span>
          </div>
          <p>© 2026 VisionGuard AI Safety Monitor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
