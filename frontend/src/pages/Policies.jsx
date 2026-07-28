import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Save, 
  Check, 
  Shield, 
  Eye, 
  Compass, 
  HelpCircle,
  FileCheck,
  UserCheck
} from 'lucide-react';

export default function Policies() {
  const { user } = useAuth();
  const isWritable = ['Admin', 'Supervisor'].includes(user?.role);
  
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected policy state for editing
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  
  // Rule states
  const [helmet, setHelmet] = useState(true);
  const [vest, setVest] = useState(true);
  const [gloves, setGloves] = useState(false);
  const [boots, setBoots] = useState(false);
  const [goggles, setGoggles] = useState(false);
  const [respirator, setRespirator] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchPolicies = async () => {
    try {
      const data = await api.get('/api/v1/policies');
      setPolicies(data);
      if (data.length > 0) {
        selectPolicy(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const selectPolicy = (p) => {
    setSelectedPolicyId(p.id);
    setHelmet(p.require_helmet);
    setVest(p.require_vest);
    setGloves(p.require_gloves);
    setBoots(p.require_boots);
    setGoggles(p.require_goggles);
    setRespirator(p.require_respirator);
    setSuccessMsg(null);
  };

  const handleSavePolicy = async () => {
    setSaving(true);
    setSuccessMsg(null);
    try {
      const updated = await api.put(`/api/v1/policies/${selectedPolicyId}`, {
        require_helmet: helmet,
        require_vest: vest,
        require_gloves: gloves,
        require_boots: boots,
        require_goggles: goggles,
        require_respirator: respirator
      });
      
      setPolicies(prev => prev.map(p => p.id === selectedPolicyId ? updated : p));
      setSuccessMsg("Safety policy successfully updated. Bounding box rules updated.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert("Error saving safety policy: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  const activePolicy = policies.find(p => p.id === selectedPolicyId);

  // Modern Toggle Switch Component
  const ToggleSwitch = ({ active, onChange, label, desc, icon: Icon }) => (
    <div 
      onClick={() => isWritable && onChange(!active)}
      className={`border p-4 rounded-xl flex items-center justify-between gap-4 select-none transition-all ${
        isWritable ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700' : 'cursor-not-allowed opacity-75'
      } ${active ? 'border-orange-500/30 bg-orange-500/[0.02] dark:bg-orange-500/[0.01]' : 'border-slate-200 dark:border-slate-800'}`}
    >
      <div className="flex gap-3 items-start min-w-0">
        <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${active ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-250 truncate">{label}</h5>
          <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
        </div>
      </div>
      
      {/* Sliding Switch Toggle representation */}
      <div 
        className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
          active ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'
        }`}
      >
        <div 
          className={`bg-white h-4 w-4 rounded-full shadow-md transform transition-transform ${
            active ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">PPE Safety Policies</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure required safety gear parameters per worksite or manufacturing division.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Worksites list */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Worksite Sectors</h3>
          <div className="space-y-3">
            {policies.length === 0 ? (
              <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
                No active worksites registered. Add a camera first.
              </div>
            ) : (
              policies.map(p => (
                <div 
                  key={p.id}
                  onClick={() => selectPolicy(p)}
                  className={`bg-white border p-4 rounded-xl shadow-sm transition flex items-center justify-between gap-3 cursor-pointer ${
                    selectedPolicyId === p.id 
                      ? 'border-orange-500 dark:bg-slate-900/90' 
                      : 'border-slate-200 dark:bg-slate-900 hover:border-slate-350 dark:border-slate-800'
                  }`}
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 shrink-0">
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-850 dark:text-slate-100 truncate">{p.worksite_name}</p>
                      <span className="text-[9px] text-slate-400 block mt-0.5 font-semibold">
                        Gear enforced: {[
                          p.require_helmet && "Helmet",
                          p.require_vest && "Vest",
                          p.require_gloves && "Gloves",
                          p.require_boots && "Boots",
                          p.require_goggles && "Goggles",
                          p.require_respirator && "Respirator"
                        ].filter(Boolean).join(", ") || "None"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Rule Configurator Card */}
        <div className="space-y-4 lg:col-span-2 animate-fade-in">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Policy Inspector</h3>
          
          {activePolicy ? (
            <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
              
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">{activePolicy.worksite_name} Ruleset</h4>
                  <p className="text-xs text-slate-500 mt-1">Configure what safety gear YOLOv8 is required to detect on workers here.</p>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
              </div>

              {successMsg && (
                <div className="bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900 rounded-xl p-3.5 text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                  <Check className="h-4.5 w-4.5 shrink-0 text-green-500" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Toggles Grid with Switch components */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <ToggleSwitch 
                  active={helmet} 
                  onChange={setHelmet} 
                  label="Hardhat / Helmet" 
                  desc="Verify safety hardhat compliance." 
                  icon={Shield} 
                />

                <ToggleSwitch 
                  active={vest} 
                  onChange={setVest} 
                  label="High-Visibility Vest" 
                  desc="Enforce yellow/orange reflective vests." 
                  icon={Compass} 
                />

                <ToggleSwitch 
                  active={gloves} 
                  onChange={setGloves} 
                  label="Safety Gloves" 
                  desc="Verify safety gloves compliance." 
                  icon={FileCheck} 
                />

                <ToggleSwitch 
                  active={boots} 
                  onChange={setBoots} 
                  label="Safety Boots" 
                  desc="Verify steel-toed boot compliance." 
                  icon={HelpCircle} 
                />

                <ToggleSwitch 
                  active={goggles} 
                  onChange={setGoggles} 
                  label="Protective Goggles" 
                  desc="Enforce industrial eye goggles." 
                  icon={Eye} 
                />

                <ToggleSwitch 
                  active={respirator} 
                  onChange={setRespirator} 
                  label="Respirator / Mask" 
                  desc="Verify respirator or face mask presence." 
                  icon={UserCheck} 
                />

              </div>

              {/* Save Panel */}
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                <span className="text-[11px] text-slate-400 font-medium">
                  {isWritable 
                    ? "Updating immediately changes bounding box checks on live camera streams."
                    : "Operator accounts are restricted from modifying safety policies."
                  }
                </span>
                
                {isWritable && (
                  <button 
                    onClick={handleSavePolicy}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-550 text-white rounded-lg px-5 py-2 text-xs font-bold shadow transition active:scale-95 disabled:opacity-50 disabled:scale-100 glow-orange"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-850 rounded-xl p-16 text-center text-slate-505">
              No worksite profile loaded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
