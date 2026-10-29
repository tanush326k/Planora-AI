'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { EventType } from '@/types/event';
import { GeneratedEventPlan } from '@/types/genai';
import { PlannerForm } from '@/components/planner/PlannerForm';
import { PlanView } from '@/components/planner/PlanView';
import Link from 'next/link';

function PlannerContent() {
  const searchParams = useSearchParams();
  const rawType = searchParams.get('type');
  const initialType: EventType =
    rawType === 'wedding' || rawType === 'birthday' || rawType === 'community'
      ? rawType
      : 'wedding';

  const [activePlan, setActivePlan] = useState<GeneratedEventPlan | null>(null);

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md p-1"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>

          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            GatherWise AI Planner
          </span>
        </div>

        {/* View Switcher: Form or Plan Output */}
        {!activePlan ? (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                Create Your Event Plan
              </h1>
              <p className="mt-2 text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
                Provide your core event details below. GatherWise AI will model your budget ceiling, backwards-calculate your milestone timeline, and generate tailored vendor checklists and creative sparks.
              </p>
            </div>

            <PlannerForm
              initialType={initialType}
              onPlanGenerated={(plan) => setActivePlan(plan)}
            />
          </div>
        ) : (
          <PlanView
            plan={activePlan}
            onReset={() => setActivePlan(null)}
            onPlanUpdated={(newPlan) => setActivePlan(newPlan)}
          />
        )}
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="inline-block animate-spin h-6 w-6 border-2 border-amber-600 border-t-transparent rounded-full" />
          <p className="mt-3 text-xs text-stone-500">Loading GatherWise Planner...</p>
        </div>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}

