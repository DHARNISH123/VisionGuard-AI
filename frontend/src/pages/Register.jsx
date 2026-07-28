import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, KeyRound, Shield, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Operator');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(email, password, fullName, role);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 selection:bg-orange-500 selection:text-white bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-orange-600/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-950/80 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden animate-scale-in">
        
        <div className="text-center mb-8">
          <div className="h-11 w-11 rounded-xl bg-orange-600 flex items-center justify-center font-black text-xl text-white mx-auto mb-4 glow-orange select-none">
            V
          </div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Create VisionGuard Account</h2>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">Register a safety operator profile to begin auditing.</p>
        </div>

        {error && (
          <div className="mb-5 bg-red-950/20 border border-red-900/50 rounded-xl p-3.5 text-xs text-red-400 flex items-start gap-2.5">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 bg-green-950/20 border border-green-900/50 rounded-xl p-3.5 text-xs text-green-400 flex items-center gap-2.5">
            <CheckCircle className="h-4.5 w-4.5 shrink-0 text-green-500" />
            <span>Profile registered! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="E.g., Officer John"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="officer@worksite.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 rounded transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned Role</label>
            <div className="relative">
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <select 
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition appearance-none"
              >
                <option value="Operator">Safety Operator (Read only)</option>
                <option value="Supervisor">Safety Supervisor (Edit configs)</option>
                <option value="Admin">System Administrator (Full access)</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                ▼
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || success}
            className="w-full bg-orange-600 hover:bg-orange-550 text-white font-bold py-2.5 rounded-xl transition active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mt-6 text-xs shadow-lg shadow-orange-950/20"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-900 pt-6 text-center text-xs text-slate-500">
          Already have an account? <Link to="/login" className="text-orange-500 hover:text-orange-400 hover:underline transition">Log in</Link>
        </div>
      </div>
    </div>
  );
}
