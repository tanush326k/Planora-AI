'use client';

import React, { useState } from 'react';
import { EventType } from '@/types/event';
import { GeneratedEventPlan } from '@/types/genai';

interface PlannerFormProps {
  initialType?: EventType;
  onPlanGenerated: (plan: GeneratedEventPlan) => void;
}

export function PlannerForm({ initialType = 'wedding', onPlanGenerated }: PlannerFormProps) {
  const [eventType, setEventType] = useState<EventType>(initialType);
  const [title, setTitle] = useState(() => {
    if (initialType === 'wedding') return 'Golden Sunset Wedding & Reception';
    if (initialType === 'birthday') return 'Milestone 40th Birthday Jubilee';
    return 'Neighborhood Cultural Arts Festival';
  });
  const [date, setDate] = useState(() => {
    const future = new Date();
    future.setMonth(future.getMonth() + 6);
    return future.toISOString().split('T')[0];
  });
  const [guestCount, setGuestCount] = useState<number | ''>(100);
  const [totalBudget, setTotalBudget] = useState<number | ''>(15000);
  const [currency, setCurrency] = useState('USD');
  const [location, setLocation] = useState('');
  const [themeOrStyle, setThemeOrStyle] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [vibeKeywords, setVibeKeywords] = useState<string[]>([]);
  const [customVibe, setCustomVibe] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Loading animation simulation steps
  const loadingSteps = [
    'Consulting domain blueprints & constraints...',
    'Calculating deterministic budget allocations & contingency buffer...',
    'Synthesizing personalized creative themes & vendor recommendations...',
    'Structuring date-aware milestone timeline...',
  ];

  // Set default sample title when event type switches if user hasn't typed a custom one
  const handleTypeChange = (newType: EventType) => {
    setEventType(newType);
    if (!title || title.includes('Celebration') || title.includes('Wedding') || title.includes('Festival')) {
      if (newType === 'wedding') setTitle('Golden Sunset Wedding & Reception');
      if (newType === 'birthday') setTitle('Milestone 40th Birthday Jubilee');
      if (newType === 'community') setTitle('Neighborhood Cultural Arts Festival');
    }
    if (newType === 'wedding' && (totalBudget === 5000 || totalBudget === '')) setTotalBudget(25000);
    if (newType === 'birthday' && (totalBudget === 25000 || totalBudget === '')) setTotalBudget(3500);
    if (newType === 'community' && (totalBudget === 3500 || totalBudget === '')) setTotalBudget(10000);
  };

  const CURATED_VIBES: Record<EventType, string[]> = {
    wedding: ['Romantic', 'Classic Elegance', 'Rustic Chic', 'Modern Minimalist', 'Boho Garden', 'Intimate', 'Luxe Black-Tie'],
    birthday: ['High-Energy', 'Festive & Fun', 'Retro 80s/90s', 'Cozy Gathering', 'Vibrant Fiesta', 'Cocktail Lounge', 'Playful & Colorful'],
    community: ['Family-Friendly', 'Eco-Friendly', 'Cultural Celebration', 'Inclusive & Accessible', 'Charity Gala', 'Block Party Spirit'],
  };

  const toggleVibe = (vibe: string) => {
    setVibeKeywords((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : prev.length < 10 ? [...prev, vibe] : prev
    );
  };

  const removeVibe = (vibe: string) => {
    setVibeKeywords((prev) => prev.filter((v) => v !== vibe));
  };

  const handleAddCustomVibe = () => {
    const trimmed = customVibe.trim();
    if (trimmed && !vibeKeywords.includes(trimmed) && vibeKeywords.length < 10) {
      setVibeKeywords((prev) => [...prev, trimmed.slice(0, 30)]);
      setCustomVibe('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setValidationErrors({});

    // Client-side quick validation
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Please enter an event title';
    if (!date) {
      errors.date = 'Please pick an event date';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [y, m, d] = date.split('-').map(Number);
      const chosen = new Date(y, m - 1, d);
      if (chosen < today) {
        errors.date = 'Event date must be today or in the future';
      }
    }
    if (!guestCount || Number(guestCount) < 1) errors.guestCount = 'Guest count must be at least 1';
    if (!totalBudget || Number(totalBudget) < 50) errors.totalBudget = 'Total budget must be at least $50';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const response = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          type: eventType,
          date,
          guestCount: Number(guestCount),
          totalBudget: Number(totalBudget),
          currency,
          location: location.trim(),
          themeOrStyle: themeOrStyle.trim(),
          specialRequests: specialRequests.trim(),
          vibeKeywords,
          allowFallback: true, // Guarantees reliable response even if API key is not configured locally
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'success') {
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          const fieldErrors: Record<string, string> = {};
          data.errors.forEach((err: { field: string; message: string }) => {
            if (err.field) fieldErrors[err.field] = err.message;
          });
          setValidationErrors(fieldErrors);
          throw new Error(data.errors.map((e: { message: string }) => e.message).join('. '));
        }
        throw new Error(data.message || 'Failed to generate event plan');
      }

      onPlanGenerated(data.plan);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm p-6 sm:p-10 transition-all">
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* Step 1: Event Category Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500 mb-3">
            Step 1 · Select Celebration Blueprint
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Event Type">
            {(
              [
                { id: 'wedding', label: 'Wedding & Reception', icon: '💍', desc: 'Receptions, ceremonies & dinners' },
                { id: 'birthday', label: 'Milestone Birthday', icon: '🎂', desc: 'Parties, jubilees & gatherings' },
                { id: 'community', label: 'Community Event', icon: '🤝', desc: 'Fundraisers, fairs & block parties' },
              ] as const
            ).map((cat) => {
              const isSelected = eventType === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleTypeChange(cat.id)}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 dark:border-amber-500 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 dark:border-stone-800 dark:hover:border-stone-700 bg-stone-50/40 dark:bg-stone-900/40'
                  }`}
                >
                  <span className="text-2xl mb-2" aria-hidden="true">
                    {cat.icon}
                  </span>
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{cat.label}</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 mt-1">{cat.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Essential Event Details */}
        <div className="space-y-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500">
            Step 2 · Core Parameters & Hard Limits
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="event-title" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Event Title *
              </label>
              <input
                id="event-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Golden Sunset Wedding"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition ${
                  validationErrors.title ? 'border-red-500' : 'border-stone-300 dark:border-stone-700'
                }`}
              />
              {validationErrors.title && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="event-date" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Target Event Date *
              </label>
              <input
                id="event-date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition ${
                  validationErrors.date ? 'border-red-500' : 'border-stone-300 dark:border-stone-700'
                }`}
              />
              {validationErrors.date && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.date}</p>
              )}
            </div>

            <div>
              <label htmlFor="guest-count" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Expected Guests *
              </label>
              <input
                id="guest-count"
                type="number"
                min={1}
                max={50000}
                required
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value === '' ? '' : Number(e.target.value))}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition ${
                  validationErrors.guestCount ? 'border-red-500' : 'border-stone-300 dark:border-stone-700'
                }`}
              />
              {validationErrors.guestCount && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.guestCount}</p>
              )}
            </div>

            <div>
              <label htmlFor="total-budget" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Total Budget Ceiling *
              </label>
              <div className="flex gap-2">
                <input
                  id="total-budget"
                  type="number"
                  min={50}
                  required
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`flex-1 rounded-xl border px-3.5 py-2.5 text-sm bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition ${
                    validationErrors.totalBudget ? 'border-red-500' : 'border-stone-300 dark:border-stone-700'
                  }`}
                />
                <select
                  aria-label="Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-xl border border-stone-300 dark:border-stone-700 px-3 py-2.5 text-sm bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 font-mono"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              {validationErrors.totalBudget && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.totalBudget}</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Creative & Personalization Preferences */}
        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500">
            Step 3 · Creative & Location Preferences (Optional)
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="event-location" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                City / Venue Location
              </label>
              <input
                id="event-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Austin, TX or Hilltop Botanical Gardens"
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 px-3.5 py-2.5 text-sm bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition"
              />
            </div>

            <div>
              <label htmlFor="theme-style" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Aesthetic or Theme
              </label>
              <input
                id="theme-style"
                type="text"
                value={themeOrStyle}
                onChange={(e) => setThemeOrStyle(e.target.value)}
                placeholder="e.g. Modern Rustic, 80s Disco, Garden Gala"
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 px-3.5 py-2.5 text-sm bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition"
              />
            </div>
          </div>

          {/* Vibe Tags Chip Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Atmosphere & Vibe Tags (Optional)
              </label>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {vibeKeywords.length}/10 selected
              </span>
            </div>

            {/* Curated Vibe Chips */}
            <div className="flex flex-wrap gap-2 mb-2.5">
              {CURATED_VIBES[eventType].map((vibe) => {
                const isSelected = vibeKeywords.includes(vibe);
                return (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => toggleVibe(vibe)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span>{vibe}</span>
                    {isSelected && <span aria-hidden="true" className="text-[10px]">✕</span>}
                  </button>
                );
              })}
            </div>

            {/* Custom Vibe Input & Active Custom Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {vibeKeywords
                .filter((v) => !CURATED_VIBES[eventType].includes(v))
                .map((customTag) => (
                  <span
                    key={customTag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800"
                  >
                    <span>{customTag}</span>
                    <button
                      type="button"
                      onClick={() => removeVibe(customTag)}
                      className="hover:text-amber-700 dark:hover:text-amber-100 focus:outline-none"
                      aria-label={`Remove ${customTag}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}

              {vibeKeywords.length < 10 && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customVibe}
                    onChange={(e) => setCustomVibe(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomVibe();
                      }
                    }}
                    placeholder="+ Add custom vibe..."
                    maxLength={30}
                    className="rounded-full border border-stone-300 dark:border-stone-700 px-3 py-1 text-xs bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  />
                  {customVibe.trim() && (
                    <button
                      type="button"
                      onClick={handleAddCustomVibe}
                      className="text-xs px-2.5 py-1 rounded-full bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold"
                    >
                      Add
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="special-requests" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Special Requests, Dietary Constraints, or Must-Haves
            </label>
            <textarea
              id="special-requests"
              rows={3}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Need gluten-free and vegan catering, live acoustic ceremony music, dog-friendly outdoor space, strict 10 PM sound ordinance."
              className="w-full rounded-xl border border-stone-300 dark:border-stone-700 px-3.5 py-2.5 text-sm bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition"
            />
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div role="alert" className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-sm flex items-start gap-3">
            <span className="text-red-600 font-bold" aria-hidden="true">✕</span>
            <div>
              <strong className="font-semibold">Planning Error: </strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Submit Button & Progress Indicator */}
        <div className="pt-2">
          {isLoading ? (
            <div className="space-y-3 p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm font-semibold text-amber-900 dark:text-amber-200 animate-pulse">
                  {loadingSteps[loadingStep]}
                </span>
              </div>
              <div className="w-full bg-amber-200/60 dark:bg-amber-900/40 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full transition-all duration-700 ease-out"
                  style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-amber-600 px-8 py-4 text-base font-semibold text-white shadow-md shadow-amber-600/20 transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <span>Generate Complete Event Plan</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

