
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import {
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '';

  const [username, domain] = email.split('@');

  if (username.length <= 2) {
    return `${username[0] || '*'}***@${domain}`;
  }

  return `${username.slice(0, 2)}${'*'.repeat(
    Math.min(username.length - 2, 6)
  )}@${domain}`;
};

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let timer;

    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(c => c - 1), 1000);
    }

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.verifyEmail({ email, otp });

      setSuccess('Email verified successfully! Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Verification failed. Please check the OTP.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    setResending(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.resendOtp({ email });

      setSuccess('A new verification OTP has been generated!');
      setResendCooldown(45);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to resend code.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Verify Your Email
          </h2>

          <p className="text-xs text-slate-500">
            Enter the 6-digit OTP code sent to
          </p>

          <p className="font-semibold text-sky-600">
            {maskEmail(email)}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start space-x-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 text-xs text-center font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">

          {!emailParam && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">
              6-Digit Verification Code
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full py-3 text-center tracking-[0.5em] text-2xl font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-600/20 flex items-center justify-center space-x-1.5 transition-all"
          >
            <span>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </span>

            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Didn't receive the email?{' '}

          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending}
            className="text-sky-600 font-bold hover:underline disabled:opacity-50 inline-flex items-center space-x-1"
          >
            <RefreshCw
              className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`}
            />

            <span>
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend OTP'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
