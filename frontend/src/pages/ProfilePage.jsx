
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserRound,
  Save,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  Globe,
  BriefcaseBusiness,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  name: '',
  phone: '',
  bio: '',
  city: '',
  state: '',
  country: '',
  dateOfBirth: '',
  gender: ''
};

export default function ProfilePage() {
  const { updateUser } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    userService.getProfile()
      .then(({ data }) => {
        const user = data.data.user;

        if (!active) return;

        setEmail(user.email || '');
        setRole(user.role || 'passenger');
        setCreatedAt(user.createdAt || '');

        setForm({
          name: user.name || '',
          phone: user.phone || '',
          bio: user.bio || '',
          city: user.city || '',
          state: user.state || '',
          country: user.country || '',
          dateOfBirth: user.dateOfBirth
            ? new Date(user.dateOfBirth).toISOString().slice(0, 10)
            : '',
          gender: user.gender || ''
        });
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message ||
            'Could not load your profile.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const change = (event) => {
    const { name, value } = event.target;

    setForm(current => ({
      ...current,
      [name]: value
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        ...form,
        dateOfBirth: form.dateOfBirth || null
      };

      const { data } = await userService.updateProfile(payload);
      const updated = data.data.user;

      setForm(current => ({
        ...current,
        name: updated.name || current.name,
        phone: updated.phone || '',
        bio: updated.bio || '',
        city: updated.city || '',
        state: updated.state || '',
        country: updated.country || '',
        dateOfBirth: updated.dateOfBirth
          ? new Date(updated.dateOfBirth).toISOString().slice(0, 10)
          : '',
        gender: updated.gender || ''
      }));

      updateUser({
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        isVerified: updated.isVerified
      });

      setSuccess('Your profile has been updated.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Profile update failed.'
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-violet-100 bg-white/80 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100';

  const labelClass =
    'mb-2 block text-xs font-bold text-slate-700';

  const iconClass =
    'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 pointer-events-none';

  if (loading) {
    return (
      <div className="tc-page min-h-screen flex items-center justify-center px-4">
        <div className="tc-glass rounded-3xl p-10 text-center border border-white/70">
          <Loader2 className="w-9 h-9 text-violet-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700 mt-4">
            Loading your profile...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Retrieving your account information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tc-page min-h-screen py-8 sm:py-10 px-4 sm:px-6">
      <div className="tc-container max-w-5xl mx-auto space-y-7">

        {/* Navigation */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-violet-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Profile Header */}
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#241342] via-[#4C1D95] to-[#6D28D9] p-6 sm:p-9 text-white shadow-2xl shadow-violet-950/15">
          <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-violet-300/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 shrink-0 rounded-3xl bg-white/15 border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-xl">
              <UserRound className="w-10 h-10 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-violet-200">
                  Account Settings
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-400/15 border border-emerald-300/25 text-emerald-200 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  Protected Account
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                My Profile
              </h1>

              <p className="text-sm text-violet-200 mt-2">
                Manage your personal information and account details.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-7 pt-5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-violet-200">
              <Mail className="w-4 h-4" />
              {email || 'Email unavailable'}
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-bold text-white bg-white/10 border border-white/15 px-3 py-2 rounded-xl">
              <BriefcaseBusiness className="w-4 h-4" />
              {role || 'Passenger'}
            </div>
          </div>
        </section>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">

          {/* Personal Information */}
          <section className="tc-glass rounded-3xl border border-white/70 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-7 border-b border-violet-100/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <UserRound className="w-5 h-5 text-violet-700" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900">
                    Personal Information
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Update your basic account details.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Full Name */}
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full Name *
                </label>
                <div className="relative">
                  <UserRound className={iconClass} />
                  <input
                    id="name"
                    className={`${inputClass} pl-11`}
                    name="name"
                    value={form.name}
                    onChange={change}
                    required
                    maxLength={100}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={iconClass} />
                  <input
                    id="email"
                    className={`${inputClass} pl-11 bg-slate-100/80 text-slate-500 cursor-not-allowed`}
                    type="email"
                    value={email}
                    readOnly
                    disabled
                  />
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Primary account ID — cannot be changed.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className={iconClass} />
                  <input
                    id="phone"
                    className={`${inputClass} pl-11`}
                    name="phone"
                    value={form.phone}
                    onChange={change}
                    maxLength={25}
                    placeholder="+91 ..."
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className={labelClass}>
                  Date of Birth
                </label>
                <div className="relative">
                  <CalendarDays className={iconClass} />
                  <input
                    id="dateOfBirth"
                    className={`${inputClass} pl-11`}
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={change}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className={labelClass}>
                  Gender
                </label>
                <select
                  id="gender"
                  className={inputClass}
                  name="gender"
                  value={form.gender}
                  onChange={change}
                >
                  <option value="">Prefer not to specify</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="tc-glass rounded-3xl border border-white/70 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-7 border-b border-violet-100/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900">
                    Location Details
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Add your location information.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="city" className={labelClass}>
                  City
                </label>
                <div className="relative">
                  <MapPin className={iconClass} />
                  <input
                    id="city"
                    className={`${inputClass} pl-11`}
                    name="city"
                    value={form.city}
                    onChange={change}
                    maxLength={100}
                    placeholder="Your city"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="state" className={labelClass}>
                  State
                </label>
                <input
                  id="state"
                  className={inputClass}
                  name="state"
                  value={form.state}
                  onChange={change}
                  maxLength={100}
                  placeholder="Your state"
                />
              </div>

              <div>
                <label htmlFor="country" className={labelClass}>
                  Country
                </label>
                <div className="relative">
                  <Globe className={iconClass} />
                  <input
                    id="country"
                    className={`${inputClass} pl-11`}
                    name="country"
                    value={form.country}
                    onChange={change}
                    maxLength={100}
                    placeholder="Your country"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* About Me */}
          <section className="tc-glass rounded-3xl border border-white/70 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-7 border-b border-violet-100/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-fuchsia-700" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900">
                    About Me
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Write a short introduction about yourself.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <label htmlFor="bio" className={labelClass}>
                Personal Introduction
              </label>

              <textarea
                id="bio"
                className={`${inputClass} resize-y`}
                rows={5}
                name="bio"
                value={form.bio}
                onChange={change}
                maxLength={500}
                placeholder="Tell us a little about yourself..."
              />

              <p className="mt-2 text-right text-xs text-slate-400">
                {form.bio.length}/500 characters
              </p>
            </div>
          </section>

          {/* Account Information */}
          <section className="tc-glass rounded-3xl border border-white/70 shadow-sm p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900">
                  Account Information
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Your account details and membership information.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-violet-50/70 border border-violet-100 p-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Account Role
                </p>
                <p className="text-sm font-extrabold uppercase text-violet-800 mt-2">
                  {role || 'Passenger'}
                </p>
              </div>

              <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Member Since
                </p>
                <p className="text-sm font-extrabold text-indigo-800 mt-2">
                  {createdAt
                    ? new Date(createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'Not available'}
                </p>
              </div>
            </div>
          </section>

          {/* Save Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-violet-100 bg-white/75 backdrop-blur-xl p-5 sm:p-6 shadow-sm">
            <div>
              <p className="text-sm font-bold text-slate-800">
                Keep your profile up to date
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Your changes will be saved to your TransitChain account.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="tc-button-primary inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pb-3">
          <ShieldCheck className="w-4 h-4 text-violet-500" />
          Your account information is managed securely by TransitChain.
        </div>
      </div>
    </div>
  );
}
