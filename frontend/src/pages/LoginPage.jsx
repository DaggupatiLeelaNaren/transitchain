
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import {
  Navigation,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.login({ email, password });
      const { token, user } = res.data.data;

      login(token, user);

      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const errData = err.response?.data;

      if (errData?.errors?.needsVerification) {
        navigate(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        setError(
          errData?.message || 'Login failed. Please check your credentials.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-11 pr-4 py-3.5 bg-white/70 border border-purple-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-purple-400 focus:ring-4 focus:ring-purple-100';

  return (
    <div className="tc-page min-h-screen relative flex items-center justify-center px-4 py-10 overflow-hidden">

      <div className="absolute -top-24 -right-20 w-96 h-96 rounded-full bg-purple-300/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 w-96 h-96 rounded-full bg-violet-300/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">

        {/* Left information panel */}
        <div className="hidden lg:flex flex-col justify-center px-8">

          <Link to="/" className="flex items-center gap-3 mb-14 w-fit">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Navigation size={25} />
            </div>

            <span className="text-2xl font-extrabold text-slate-900">
              Transit<span className="text-purple-600">Chain</span>
            </span>
          </Link>

          <span className="tc-section-label mb-4">
            WELCOME TO TRANSITCHAIN
          </span>

          <h1 className="text-5xl font-extrabold leading-tight text-slate-900">
            Your journey.
            <br />
            Your way.
            <br />
            <span className="tc-gradient-text">One platform.</span>
          </h1>

          <p className="mt-6 text-base leading-7 text-slate-500 max-w-md">
            Sign in to plan your next journey, manage bookings and explore
            connected transportation options.
          </p>

          <div className="mt-10 space-y-5">
            {[
              'Smart multimodal journey planning',
              'Manage your travel bookings',
              'Track your active journeys'
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <CheckCircle2 size={16} />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Login form */}
        <div className="tc-glass-strong w-full max-w-md mx-auto rounded-3xl p-7 sm:p-9 shadow-2xl shadow-purple-900/10 border border-white/80">

          <div className="text-center mb-8">
            <div className="lg:hidden w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Navigation size={26} />
            </div>

            <span className="tc-section-label">YOUR ACCOUNT</span>

            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              Welcome Back
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Sign in to continue your journey.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-sm">
              <AlertCircle size={17} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="tc-label block mb-2">Email Address</label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className={inputClass}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="tc-label">Password</label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`${inputClass} pr-12`}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="tc-button-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="mt-7 pt-5 border-t border-purple-100 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-purple-600 hover:text-purple-800"
              >
                Create account
              </Link>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={15} className="text-purple-500" />
            Secure authentication
          </div>
        </div>
      </div>
    </div>
  );
}
