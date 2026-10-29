'use client';

import React, { useState } from 'react';
import { GeneratedEventPlan } from '@/types/genai';
import { formatFriendlyDate } from '@/lib/planning/dateUtils';

interface PlanViewProps {
  plan: GeneratedEventPlan;
  onReset: () => void;
  onPlanUpdated?: (newPlan: GeneratedEventPlan) => void;
}

export function PlanView({ plan, onReset, onPlanUpdated }: PlanViewProps) {
  const [activeTab, setActiveTab] = useState<'concept' | 'budget' | 'timeline' | 'vendors' | 'ideas'>('concept');
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});

  // Quick refinement state
  const [refinementText, setRefinementText] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  const toggleMilestone = (id: string) => {
    setCompletedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementText.trim()) return;

    setIsRefining(true);
    setRefineError(null);

    try {
      // Re-invoke generate with modified parameters or appended special requests
      const response = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: plan.eventDetails.title,
          type: plan.eventDetails.type,
          date: plan.eventDetails.date,
          guestCount: plan.eventDetails.guestCount,
          totalBudget: plan.eventDetails.totalBudget,
          currency: plan.eventDetails.currency,
          location: plan.eventDetails.location,
          themeOrStyle: plan.eventDetails.themeOrStyle,
          specialRequests: `${plan.eventDetails.notes ? plan.eventDetails.notes + '\n\n' : ''}Refinement: ${refinementText.trim()}`,
          allowFallback: true,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to refine plan');
      }

      setRefinementText('');
      if (onPlanUpdated) {
        onPlanUpdated(data.plan);
      }
    } catch (err: unknown) {
      setRefineError(err instanceof Error ? err.message : 'Error applying refinement');
    } finally {
      setIsRefining(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: plan.eventDetails.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const completedCount = Object.values(completedMilestones).filter(Boolean).length;
  const totalMilestones = plan.timelinePlan.phases.reduce((acc, p) => acc + p.milestones.length, 0);

  return (
    <div className="space-y-8">
      {/* Top Controls & Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
            {plan.eventDetails.type.toUpperCase()}
          </span>

          {plan.isFallback ? (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
              title={plan.generationNotes}
            >
              <span className="h-2 w-2 rounded-full bg-stone-500" />
              Engine: Deterministic Baseline
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
              title={plan.generationNotes}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Engine: Google GenAI ({plan.modelUsed || 'Gemini'})
            </span>
          )}

          <span className="text-xs text-stone-500 dark:text-stone-400">
            Plan ID: <code className="font-mono text-[11px]">{plan.id}</code>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <span>Print / Save PDF</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* Main Event Header Card */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 sm:p-10 rounded-3xl shadow-sm border border-stone-800">
        <div className="max-w-4xl space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{plan.eventDetails.title}</h1>
          <p className="text-stone-300 text-base leading-relaxed">{plan.executiveSummary}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-stone-700/80">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Target Date</span>
              <p className="text-base font-bold text-white mt-0.5">{formatFriendlyDate(plan.eventDetails.date)}</p>
              <p className="text-xs text-amber-400 font-medium">
                {plan.timelinePlan.daysRemaining > 0 ? `${plan.timelinePlan.daysRemaining} days away` : 'Date has arrived'}
              </p>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Guest Count</span>
              <p className="text-base font-bold text-white mt-0.5">{plan.eventDetails.guestCount} Attendees</p>
              <p className="text-xs text-stone-400">
                {formatCurrency(Math.round(plan.eventDetails.totalBudget / plan.eventDetails.guestCount))}/guest
              </p>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Hard Budget Limit</span>
              <p className="text-base font-bold text-white mt-0.5">{formatCurrency(plan.eventDetails.totalBudget)}</p>
              <p className="text-xs text-emerald-400 font-medium">
                Reserve: {formatCurrency(plan.budgetPlan.contingencyReserve)}
              </p>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Checklist Progress</span>
              <p className="text-base font-bold text-white mt-0.5">
                {completedCount} of {totalMilestones} Tasks
              </p>
              <div className="w-full bg-stone-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${totalMilestones > 0 ? (completedCount / totalMilestones) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 overflow-x-auto no-scrollbar gap-2 sm:gap-6" role="tablist">
        {[
          { id: 'concept', label: 'Concept & Theme', icon: '🎨' },
          { id: 'budget', label: 'Budget Allocation', icon: '💰' },
          { id: 'timeline', label: 'Milestone Timeline', icon: '📅' },
          { id: 'vendors', label: 'Vendor Checklist', icon: '📋' },
          { id: 'ideas', label: 'Creative Spark Ideas', icon: '💡' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isActive
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400 dark:border-amber-400'
                  : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}

      {/* 1. CONCEPT & THEME */}
      {activeTab === 'concept' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              Theme Concept: {plan.themeConcept.name}
            </h2>
            <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed mb-6">
              {plan.themeConcept.description}
            </p>

            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3">
              Curated Color Palette
            </h3>
            <div className="flex flex-wrap gap-4 items-center mb-8">
              {plan.themeConcept.colorPalette.map((color, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
                  <div
                    className="h-8 w-8 rounded-lg shadow-inner border border-black/10"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-xs font-semibold text-stone-800 dark:text-stone-200">{color}</span>
                </div>
              ))}
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3">
              Assumptions & Key Recommendations
            </h3>
            <ul className="space-y-2.5">
              {plan.assumptionsAndRecommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 2. BUDGET ALLOCATION */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Deterministic Budget Distribution
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Reconciles 100% to your total budget ceiling of {formatCurrency(plan.budgetPlan.totalBudget)} with verified math.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/50 text-right">
                <span className="text-[11px] font-semibold uppercase text-amber-800 dark:text-amber-300 block">Contingency Buffer</span>
                <span className="font-mono text-base font-bold text-amber-900 dark:text-amber-200">
                  {formatCurrency(plan.budgetPlan.contingencyReserve)}
                </span>
              </div>
            </div>

            {/* Visual allocation bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-stone-200 dark:bg-stone-800 mb-6">
              {plan.budgetPlan.categories.map((cat, idx) => {
                const colors = ['bg-amber-600', 'bg-amber-500', 'bg-amber-700', 'bg-stone-700', 'bg-stone-500', 'bg-emerald-600'];
                return (
                  <div
                    key={cat.id}
                    title={`${cat.name}: ${cat.recommendedPercentage}%`}
                    className={`${colors[idx % colors.length]} h-full transition-all`}
                    style={{ width: `${cat.recommendedPercentage}%` }}
                  />
                );
              })}
            </div>

            {/* Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Allocation</th>
                    <th className="py-3 px-2">Share</th>
                    <th className="py-3 px-2 hidden sm:table-cell">Scope & Guidance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
                  {plan.budgetPlan.categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-950/50 transition-colors">
                      <td className="py-3 px-2 font-bold text-stone-900 dark:text-stone-100">{cat.name}</td>
                      <td className="py-3 px-2 font-mono font-semibold text-stone-800 dark:text-stone-200">
                        {formatCurrency(cat.allocatedAmount)}
                      </td>
                      <td className="py-3 px-2 font-mono text-xs text-stone-500">{cat.recommendedPercentage}%</td>
                      <td className="py-3 px-2 text-xs text-stone-600 dark:text-stone-400 hidden sm:table-cell">
                        {cat.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. MILESTONE TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
              Date-Aware Milestone Timeline
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              Deadlines calculated backwards from {formatFriendlyDate(plan.eventDetails.date)} ({plan.timelinePlan.daysRemaining} days remaining). Check off tasks as you finish them.
            </p>

            <div className="space-y-8">
              {plan.timelinePlan.phases.map((phase, pIdx) => (
                <div key={pIdx} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                      {phase.phaseName}
                    </h3>
                    <span className="text-xs text-stone-500 dark:text-stone-400">{phase.timeframeDescription}</span>
                  </div>

                  <div className="space-y-2.5">
                    {phase.milestones.map((m) => {
                      const isDone = Boolean(completedMilestones[m.id]);
                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleMilestone(m.id)}
                          className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isDone
                              ? 'bg-stone-50/80 dark:bg-stone-950/60 border-stone-200 dark:border-stone-800 opacity-60'
                              : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 hover:border-amber-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => toggleMilestone(m.id)}
                            className="mt-1 h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-sm font-semibold ${isDone ? 'line-through text-stone-400' : 'text-stone-900 dark:text-stone-100'}`}>
                                {m.title}
                              </span>
                              {m.priority === 'critical' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                  Critical
                                </span>
                              )}
                              {m.priority === 'high' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  High
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">{m.description}</p>
                            <span className="text-[11px] font-mono text-stone-400 mt-1 inline-block">
                              Target Date: {formatFriendlyDate(m.targetDate || '')} ({m.daysBeforeEvent}d before)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. VENDOR CHECKLIST */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
              Prioritized Vendor & Partner Checklist
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              Vetting windows, realistic cost estimates, and must-ask questions before signing contracts.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.vendorPlan.items.map((v) => (
                <div key={v.id} className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        {v.category}
                      </span>
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">{v.title}</h3>
                    </div>
                    <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {v.bookingWindow}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-stone-700 dark:text-stone-300">
                    <span className="font-semibold text-stone-500">Estimated Range:</span>
                    <span>{formatCurrency(v.estimatedCostRange.min)} – {formatCurrency(v.estimatedCostRange.max)}</span>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                      Must-Ask Questions:
                    </h4>
                    <ul className="space-y-1">
                      {v.keyQuestionsToAsk.map((q, idx) => (
                        <li key={idx} className="text-xs text-stone-600 dark:text-stone-400 flex items-start gap-1.5">
                          <span className="text-amber-500" aria-hidden="true">?</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. PERSONALIZED IDEAS */}
      {activeTab === 'ideas' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
              Personalized Creative Concepts
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              Customized experiential, decor, and hospitality touches tailored to your guests and aesthetic.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.personalizedIdeas.map((idea, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      {idea.category.replace('_', ' & ')}
                    </span>
                    <div className="flex gap-1.5">
                      {idea.diyFriendly && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          DIY Friendly
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 uppercase">
                        {idea.estimatedCostImpact} Cost
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">{idea.title}</h3>
                  <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">{idea.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conversational Plan Refinement Bar */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Refine Your Plan</h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Want to modify the theme, budget, dietary requirements, or specific activities? Describe your adjustments and we will regenerate the plan while preserving your core parameters.
        </p>

        <form onSubmit={handleRefine} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={refinementText}
            onChange={(e) => setRefinementText(e.target.value)}
            disabled={isRefining}
            placeholder="e.g. 'Emphasize kid-friendly activities and adjust food budget for a taco bar'"
            className="flex-1 rounded-xl border border-stone-300 dark:border-stone-700 px-4 py-2.5 text-sm bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          />
          <button
            type="submit"
            disabled={isRefining || !refinementText.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {isRefining ? 'Regenerating...' : 'Update Plan'}
          </button>
        </form>

        {refineError && <p className="text-xs text-red-600 dark:text-red-400">{refineError}</p>}
      </div>
    </div>
  );
}

