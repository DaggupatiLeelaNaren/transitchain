
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { placeService } from '../services/api';

import {
  Utensils,
  Coffee,
  Hotel,
  Star,
  MapPin,
  ArrowLeft,
  Navigation,
  Loader2,
  Search,
  RefreshCw,
  AlertCircle,
  Sparkles,
  MapPinned,
  Compass,
  LocateFixed
} from 'lucide-react';

const categories = [
  { value: 'all', label: 'All Places', icon: Compass },
  { value: 'food', label: 'Food', icon: Utensils },
  { value: 'cafe', label: 'Cafes', icon: Coffee },
  { value: 'hotel', label: 'Hotels', icon: Hotel }
];

const categoryStyles = {
  food: {
    icon: Utensils,
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    border: 'border-orange-200'
  },
  cafe: {
    icon: Coffee,
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    border: 'border-amber-200'
  },
  hotel: {
    icon: Hotel,
    color: 'text-indigo-700',
    bg: 'bg-indigo-100',
    border: 'border-indigo-200'
  }
};

export default function NearbyPlacesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const lat = searchParams.get('lat') || '17.4975';
  const lon = searchParams.get('lon') || '78.4014';

  const [category, setCategory] = useState('all');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await placeService.getNearby(lat, lon, category);
      setPlaces(res.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load nearby places. Please try again.'
      );
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [lat, lon, category]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const filteredPlaces = places.filter(place => {
    const query = searchText.trim().toLowerCase();

    if (!query) return true;

    return [
      place.name,
      place.category,
      place.cuisine,
      place.address
    ]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(query));
  });

  const getCategoryStyle = (value) => {
    return categoryStyles[String(value || '').toLowerCase()] || {
      icon: MapPin,
      color: 'text-violet-700',
      bg: 'bg-violet-100',
      border: 'border-violet-200'
    };
  };

  return (
    <div className="tc-page min-h-screen py-7 sm:py-10 px-4 sm:px-6">
      <div className="tc-container max-w-6xl mx-auto space-y-7">

        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-violet-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Journey
        </button>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#21143C] via-[#4C1D95] to-[#6D28D9] p-6 sm:p-9 text-white shadow-2xl shadow-violet-950/15">
          <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-violet-300/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] uppercase tracking-widest font-bold text-violet-100">
              <Sparkles className="w-3.5 h-3.5" />
              Explore Around You
            </div>

            <div className="mt-5 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Discover Nearby Places
                </h1>

                <p className="text-sm text-violet-200 mt-3 max-w-xl leading-relaxed">
                  Find food, cafés and hotels close to your transit destination.
                  Explore convenient stops along your journey.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-4 min-w-[190px]">
                <div className="flex items-center gap-2 text-violet-200 text-xs font-semibold">
                  <LocateFixed className="w-4 h-4" />
                  Search Coordinates
                </div>
                <p className="text-sm font-bold mt-2">
                  {Number(lat).toFixed(4)}, {Number(lon).toFixed(4)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-8">
              {[
                { label: 'Food Spots', icon: Utensils },
                { label: 'Coffee Stops', icon: Coffee },
                { label: 'Hotels', icon: Hotel }
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className="rounded-2xl bg-white/10 border border-white/10 p-3 sm:p-4"
                  >
                    <Icon className="w-5 h-5 text-violet-200 mb-2" />
                    <p className="text-[10px] sm:text-xs font-bold text-white">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="tc-glass rounded-3xl border border-white/70 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-violet-600">
                Explore Categories
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                What are you looking for?
              </h2>
            </div>

            <span className="text-xs font-bold text-slate-500 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
              {filteredPlaces.length} places found
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(item => {
              const Icon = item.icon;
              const active = category === item.value;

              return (
                <button
                  key={item.value}
                  onClick={() => setCategory(item.value)}
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-violet-700 to-purple-600 text-white shadow-lg shadow-violet-200'
                      : 'bg-white border border-violet-100 text-slate-600 hover:border-violet-300 hover:text-violet-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="relative mt-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />

            <input
              type="search"
              value={searchText}
              onChange={event => setSearchText(event.target.value)}
              placeholder="Search by place name, cuisine or address..."
              className="tc-input w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
            />
          </div>
        </section>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>

            <button
              onClick={fetchPlaces}
              className="inline-flex items-center justify-center gap-2 text-xs font-bold text-red-700 border border-red-200 rounded-xl px-4 py-2 hover:bg-red-100"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="tc-glass rounded-3xl border border-white/70 p-14 text-center">
            <Loader2 className="w-9 h-9 text-violet-600 animate-spin mx-auto" />
            <h3 className="text-base font-extrabold text-slate-800 mt-5">
              Finding nearby places
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Discovering places around your selected location...
            </p>
          </div>
        ) : !error && filteredPlaces.length === 0 ? (
          /* Empty State */
          <div className="tc-glass rounded-3xl border border-white/70 p-10 sm:p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto">
              <MapPinned className="w-8 h-8 text-violet-600" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mt-5">
              No places found
            </h3>

            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              {searchText
                ? 'Try another search term or clear your search.'
                : 'There are no places available for this category at the selected location.'}
            </p>

            <button
              onClick={() => {
                setSearchText('');
                setCategory('all');
              }}
              className="tc-button-primary inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl text-xs font-bold"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        ) : (
          /* Places Grid */
          <section>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-violet-600">
                  Nearby Recommendations
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  Places to Explore
                </h2>
              </div>

              <button
                onClick={fetchPlaces}
                disabled={loading}
                title="Refresh places"
                className="w-10 h-10 rounded-xl border border-violet-100 bg-white/80 flex items-center justify-center text-violet-700 hover:bg-violet-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaces.map((place, index) => {
                const style = getCategoryStyle(place.category);
                const Icon = style.icon;

                return (
                  <article
                    key={place.id || index}
                    className="tc-glass rounded-3xl border border-white/70 p-5 shadow-sm hover:shadow-xl hover:shadow-violet-950/5 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${style.bg} border ${style.border} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${style.color}`} />
                      </div>

                      {place.rating != null && (
                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-100 px-2.5 py-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span className="text-xs font-extrabold text-amber-700">
                            {place.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex-1">
                      <span className={`inline-block text-[10px] uppercase tracking-wider font-extrabold ${style.color} ${style.bg} rounded-lg px-2.5 py-1`}>
                        {place.category || 'Nearby Place'}
                      </span>

                      <h3 className="text-lg font-extrabold text-slate-900 mt-3 leading-snug">
                        {place.name}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        {[place.cuisine, place.price]
                          .filter(Boolean)
                          .join(' · ') || 'Local place'}
                      </p>

                      <div className="flex items-start gap-2 mt-4">
                        <MapPin className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {place.address || 'Address unavailable'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-4 mt-5 border-t border-violet-100">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                          Distance
                        </p>
                        <p className="text-sm font-extrabold text-slate-800 mt-1">
                          {place.distanceMeters != null
                            ? `~${place.distanceMeters} m`
                            : 'Nearby'}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-2 rounded-xl">
                        <Navigation className="w-3.5 h-3.5" />
                        Walk reachable
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Footer Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pb-3">
          <MapPin className="w-4 h-4 text-violet-500" />
          Exploring facilities around your selected journey location
        </div>
      </div>
    </div>
  );
}
