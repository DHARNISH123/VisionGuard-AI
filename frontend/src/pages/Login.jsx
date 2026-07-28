import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, KeyRound, Mail, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 selection:bg-orange-500 selection:text-white bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      
      {/* Visual background ambient blur glow */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-orange-600/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-950/80 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden animate-scale-in">
        
        <div className="text-center mb-8">
          <div className="h-11 w-11 rounded-xl bg-orange-600 flex items-center justify-center font-black text-xl text-white mx-auto mb-4 glow-orange select-none">
            V
          </div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Sign in to VisionGuard AI</h2>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">Enter your credentials to access the safety console.</p>
        </div>

        {error && (
          <div className="mb-5 bg-red-950/20 border border-red-900/50 rounded-xl p-3.5 text-xs text-red-400 flex items-start gap-2.5">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4.5">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="supervisor@visionguard.com"
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
                placeholder="••••••••"
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

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-550 text-white font-bold py-2.5 rounded-xl transition active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mt-6 text-xs shadow-lg shadow-orange-950/20"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              "Sign In to Console"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-900 pt-6 text-center text-xs text-slate-500">
          Need an account? <Link to="/register" className="text-orange-500 hover:text-orange-400 hover:underline transition">Register site profile</Link>
        </div>

        {/* Demo Credentials Alert Note */}
        <div className="mt-6 bg-slate-900/30 border border-slate-800/60 rounded-xl p-4 text-[11px] text-slate-400">
          <p className="font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <ShieldAlert className="h-4 w-4 text-orange-500" />
            Project Demo Login:
          </p>
          <ul className="space-y-1 list-disc list-inside text-slate-400">
            <li><b>Admin:</b> admin@visionguard.com / Admin@123</li>
            <li><b>Supervisor:</b> supervisor@visionguard.com / Supervisor@123</li>
            <li><b>Operator:</b> operator@visionguard.com / Operator@123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
