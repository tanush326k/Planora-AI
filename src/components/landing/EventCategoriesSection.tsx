'use client';

import { useState } from 'react';
import { EVENT_CATEGORIES } from '@/lib/planning/eventCategories';
import { EventType } from '@/types/event';

export function EventCategoriesSection() {
  const [selectedType, setSelectedType] = useState<EventType>('wedding');
  const currentCategory = EVENT_CATEGORIES[selectedType];

  return (
    <section id="categories" className="py-16 sm:py-20 bg-stone-100/60 dark:bg-stone-900/40 border-y border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500">
            Tailored Domain Blueprints
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-4xl">
            Choose Your Celebration Type
          </p>
          <p className="mt-3 text-base text-stone-600 dark:text-stone-300">
            Every event has a unique rhythm. Planora AI applies specialized planning logic, booking windows, and budget breakdowns tailored to your specific occasion.
          </p>
        </div>

        {/* Category Tabs */}
        <div 
          role="tablist" 
          aria-label="Event Categories"
          className="flex justify-center gap-2 sm:gap-4 p-1.5 bg-stone-200/70 dark:bg-stone-800/60 rounded-2xl max-w-xl mx-auto mb-10"
        >
          {(['wedding', 'birthday', 'community'] as EventType[]).map((type) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                role="tab"
                aria-selected={isSelected}
                aria-controls={`panel-${type}`}
                id={`tab-${type}`}
                onClick={() => setSelectedType(type)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isSelected
                    ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-950 dark:text-amber-400'
                    : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                {type === 'wedding' && '💍 Weddings'}
                {type === 'birthday' && '🎂 Birthdays'}
                {type === 'community' && '🤝 Community'}
              </button>
            );
          })}
        </div>

        {/* Selected Category Blueprint Showcase */}
        <div
          id={`panel-${selectedType}`}
          role="tabpanel"
          aria-labelledby={`tab-${selectedType}`}
          className="bg-white dark:bg-stone-950 rounded-2xl p-6 sm:p-10 shadow-sm border border-stone-200/80 dark:border-stone-800/80 transition-all"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 mb-2">
                  Typical Lead Time: {currentCategory.typicalLeadTimeMonths} Months
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {currentCategory.title}
                </h3>
                <p className="mt-2 text-stone-600 dark:text-stone-300 text-base leading-relaxed">
                  {currentCategory.description}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-3">
                  Key Planning Priorities:
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentCategory.keyPriorities.map((priority, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      <span>{priority}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={`/plan?type=${selectedType}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition"
                >
                  Plan my {currentCategory.title.split(' ')[0]}
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 bg-stone-50 dark:bg-stone-900/60 p-6 rounded-xl border border-stone-200/60 dark:border-stone-800/60">
              <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-1">
                Baseline Budget Distribution
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                Deterministic allocation benchmarks to avoid overspending:
              </p>

              <div className="space-y-3">
                {currentCategory.suggestedBudgetCategories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-1.5 border-b border-stone-200/60 dark:border-stone-800/60 last:border-0">
                    <span className="text-stone-800 dark:text-stone-200 font-medium">
                      {cat.split('(')[0].trim()}
                    </span>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {cat.match(/\((.*?)\)/)?.[1] || ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
