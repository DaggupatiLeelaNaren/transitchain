
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Navigation,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await authService.forgotPassword({ email });

      if (res.data.data.debugOtp) {
        setOtp(res.data.data.debugOtp);
      }

      setSuccess('Reset code sent to your email.');
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to request reset code.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.resetPassword({
        email,
        otp,
        newPassword
      });

      setSuccess('Password updated successfully! Redirecting to login...');

      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Password reset failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-11 pr-4 py-3.5 bg-white/70 border border-purple-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-purple-400 focus:ring-4 focus:ring-purple-100';

  return (
    <div className="tc-page min-h-screen relative flex items-center justify-center px-4 py-10 overflow-hidden">

      <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-purple-300/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-violet-300/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">

        {/* Information panel */}
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
            ACCOUNT SECURITY
          </span>

          <h1 className="text-5xl font-extrabold leading-tight text-slate-900">
            A fresh start.
            <br />
            <span className="tc-gradient-text">A secure account.</span>
          </h1>

          <p className="mt-6 text-base leading-7 text-slate-500 max-w-md">
            Forgot your password? No worries. Verify your email address
            using the reset code and create a new password.
          </p>

          <div className="mt-10 space-y-5">
            {[
              'Request a password reset code',
              'Verify your email using OTP',
              'Set a new account password'
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                  {index + 1}
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Reset form */}
        <div className="tc-glass-strong w-full max-w-md mx-auto rounded-3xl p-7 sm:p-9 shadow-2xl shadow-purple-900/10 border border-white/80">

          <div className="text-center mb-7">
            <div className="lg:hidden w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <KeyRound size={25} />
            </div>

            <span className="tc-section-label">
              PASSWORD RECOVERY
            </span>

            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              {step === 1 ? 'Forgot Password?' : 'Set New Password'}
            </h2>

            <p className="text-sm text-slate-500 mt-2 leading-6">
              {step === 1
                ? 'Enter your registered email address to receive a reset OTP.'
                : 'Enter the OTP sent to your email and choose a new password.'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-7">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-purple-600' : 'bg-purple-100'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-purple-600' : 'bg-purple-100'}`} />
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-sm">
              <AlertCircle size={17} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-700 text-sm">
              <CheckCircle2 size={17} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-5">

              <div>
                <label className="tc-label block mb-2">
                  Email Address
                </label>

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

              <button
                type="submit"
                disabled={loading}
                className="tc-button-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Reset Code...' : 'Send Reset Code'}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">

              <div>
                <label className="tc-label block mb-2">
                  Reset Code (OTP)
                </label>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3.5 bg-white/70 border border-purple-100 rounded-xl text-center text-lg font-bold tracking-[0.4em] text-slate-800 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </div>

              <div>
                <label className="tc-label block mb-2">
                  New Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              <button
                type="submit"
                disabled={loading}
                className="tc-button-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating Password...' : 'Update Password'}
                {!loading && <ArrowRight size={17} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError(null);
                  setSuccess(null);
                }}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-purple-600 hover:text-purple-800"
              >
                <ArrowLeft size={14} />
                Change email address
              </button>
            </form>
          )}

          <div className="mt-7 pt-5 border-t border-purple-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-800"
            >
              <ArrowLeft size={15} />
              Back to Sign In
            </Link>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={15} className="text-purple-500" />
            Secure password recovery
          </div>
        </div>
      </div>
    </div>
  );
}
