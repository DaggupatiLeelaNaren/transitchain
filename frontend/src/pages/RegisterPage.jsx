
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import {
  Navigation,
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept terms of service to proceed');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        name,
        email,
        password,
        confirmPassword,
        termsAccepted
      });

      navigate(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-11 pr-4 py-3.5 bg-white/70 border border-purple-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-purple-400 focus:ring-4 focus:ring-purple-100';

  return (
    <div className="tc-page min-h-screen relative flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="tc-orb absolute -top-24 -left-20 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="tc-orb absolute -bottom-28 -right-20 w-96 h-96 bg-violet-300/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">

        {/* Brand section */}
        <div className="hidden lg:flex flex-col justify-center px-8">
          <Link to="/" className="flex items-center gap-3 mb-12 w-fit">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Navigation size={25} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              Transit<span className="text-purple-600">Chain</span>
            </span>
          </Link>

          <span className="tc-section-label mb-4">
            YOUR JOURNEY STARTS HERE
          </span>

          <h1 className="text-5xl font-extrabold leading-tight text-slate-900">
            Move smarter.
            <br />
            Travel <span className="tc-gradient-text">better.</span>
          </h1>

          <p className="mt-6 text-base leading-7 text-slate-500 max-w-md">
            Create your account and discover smarter multimodal journeys.
            Connect buses, metros and walking routes in one seamless travel
            experience.
          </p>

          <div className="mt-10 space-y-5">
            {[
              'Plan complete door-to-door journeys',
              'Compare routes, fares and travel times',
              'Keep your bookings and trips organized'
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

        {/* Registration form */}
        <div className="tc-glass-strong w-full max-w-md mx-auto rounded-3xl p-7 sm:p-9 shadow-2xl shadow-purple-900/10 border border-white/80">

          <div className="text-center mb-7">
            <div className="lg:hidden w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Navigation size={26} />
            </div>

            <span className="tc-section-label">GET STARTED</span>

            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              Create an Account
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Sign up for smarter multimodal transit.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-sm">
              <AlertCircle size={17} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="tc-label block mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={inputClass}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

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
              <label className="tc-label block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={`${inputClass} pr-12`}
                  autoComplete="new-password"
                  minLength={6}
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

            <div>
              <label className="tc-label block mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className={`${inputClass} pr-12`}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-purple-600"
              />
              <span className="text-xs text-slate-500 leading-5">
                I agree to the Terms of Service and Privacy Policy.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="tc-button-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account & Sending OTP...' : 'Send Verification OTP'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-purple-100 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-purple-600 hover:text-purple-800">
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-5 flex justify-center items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={15} className="text-purple-500" />
            Your account information is protected.
          </div>
        </div>
      </div>
    </div>
  );
}
