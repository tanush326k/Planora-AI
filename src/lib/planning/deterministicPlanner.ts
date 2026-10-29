import { EventDetails } from '@/types/event';
import { GeneratedEventPlan, PersonalizedIdea, ThemeConcept } from '@/types/genai';
import { calculateBaselineBudget } from './budgetCalculator';
import { calculateDaysRemaining, computeMilestoneTargetDate } from './dateUtils';
import { EventTimelinePhase, TimelineMilestone } from '@/types/timeline';
import { VendorChecklistItem } from '@/types/vendor';

/**
 * Builds a deterministic, high-quality event plan.
 * Used when Gemini is not configured, or as a reference baseline for structured merging.
 */
export function generateDeterministicPlan(
  details: EventDetails,
  options?: {
    specialRequests?: string;
    vibeKeywords?: string[];
    reason?: string;
  }
): GeneratedEventPlan {
  const daysRemaining = calculateDaysRemaining(details.date);
  const budgetPlan = calculateBaselineBudget(details.totalBudget, details.type, details.currency);
  const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // 1. Theme and concept
  const themeConcept: ThemeConcept = getDeterministicThemeConcept(details);

  // 2. Date-aware timeline phases
  const timelinePhases = generatePhasedMilestones(details, daysRemaining);

  // 3. Vendor checklist
  const vendorItems = generateVendorChecklist(details);

  // 4. Personalized ideas
  const personalizedIdeas = generatePersonalizedIdeas(details);

  // 5. Executive summary
  const formattedBudget = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: details.currency,
    maximumFractionDigits: 0,
  }).format(details.totalBudget);

  const executiveSummary = `A curated, structured blueprint for "${details.title}" with an expected attendance of ${details.guestCount} guests and a total budget of ${formattedBudget}. This plan prioritizes seamless guest flow, proactive vendor booking timelines, and a dedicated contingency reserve.`;

  // 6. Practical assumptions
  const assumptionsAndRecommendations = [
    `Budget totals reflect a hard limit of ${formattedBudget} with a built-in ${new Intl.NumberFormat('en-US', { style: 'currency', currency: details.currency, maximumFractionDigits: 0 }).format(budgetPlan.contingencyReserve)} contingency buffer.`,
    details.location
      ? `Venue and logistics tailored for ${details.location}. Check municipal noise/parking guidelines.`
      : 'No venue location specified yet. Securing a primary venue is the critical path milestone.',
    daysRemaining < 30
      ? 'Alert: Event date is under 30 days away. Focus on securing essential vendors and finalizing RSVP headcounts immediately.'
      : `Planning window is ${daysRemaining} days away. Follow the phased milestone sequence to avoid last-minute stress.`,
    'Vendor cost ranges are planning estimates and should be confirmed with formal proposals.',
  ];

  return {
    id: planId,
    createdAt: new Date().toISOString(),
    eventDetails: details,
    executiveSummary,
    themeConcept,
    budgetPlan,
    timelinePlan: {
      eventDate: details.date,
      daysRemaining,
      phases: timelinePhases,
    },
    vendorPlan: {
      totalVendors: vendorItems.length,
      bookedCount: 0,
      items: vendorItems,
    },
    personalizedIdeas,
    assumptionsAndRecommendations,
    source: 'deterministic_fallback',
    isFallback: true,
    generationNotes: options?.reason || 'Generated using deterministic baseline planning engine.',
  };
}

function getDeterministicThemeConcept(details: EventDetails): ThemeConcept {
  switch (details.type) {
    case 'wedding':
      return {
        name: details.themeOrStyle || 'Timeless Botanical Romance',
        description: 'A celebration emphasizing understated elegance with organic florals, ambient warm lighting, and personalized sentimental touches throughout.',
        colorPalette: ['#FAF6F0', '#D4AF37', '#4A5D4E', '#2C3E50'],
      };
    case 'birthday':
      return {
        name: details.themeOrStyle || 'Celebration Jubilee & Glow',
        description: 'An energetic, joyful party atmosphere centered around the guest of honor, lively music, signature mocktails/cocktails, and immersive photo spaces.',
        colorPalette: ['#FF6B6B', '#FFD93D', '#4D96FF', '#6BCB77'],
      };
    case 'community':
      return {
        name: details.themeOrStyle || 'Community Unity & Heritage Festival',
        description: 'An inclusive, vibrant community gathering featuring interactive craft booths, local food partners, acoustic stage programming, and neighborhood storytelling.',
        colorPalette: ['#2A9D8F', '#E76F51', '#F4A261', '#264653'],
      };
  }
}

function generatePhasedMilestones(details: EventDetails, daysRemaining: number): EventTimelinePhase[] {
  // Backwards calculation from eventDate
  const totalDays = Math.max(daysRemaining, 14);

  const phaseDefinitions = [
    {
      name: 'Phase 1: Foundation & Securing Key Elements',
      fraction: 0.75, // e.g. 75% of remaining days out
      tasks: [
        {
          title: 'Establish Event Committee / Core Organizers',
          desc: 'Designate responsibilities for budget, hospitality, and logistics.',
          prio: 'critical' as const,
          cat: 'Management',
        },
        {
          title: 'Lock Venue & Date Contract',
          desc: 'Confirm availability, deposit payment, and venue capacity parameters.',
          prio: 'critical' as const,
          cat: 'Venue',
        },
        {
          title: 'Draft Guest List & Save-the-Dates',
          desc: `Send preliminary notifications for ${details.guestCount} projected guests.`,
          prio: 'high' as const,
          cat: 'Guest Relations',
        },
      ],
    },
    {
      name: 'Phase 2: Vendor Selection & Programming',
      fraction: 0.45,
      tasks: [
        {
          title: 'Contract Catering & Beverage Service',
          desc: 'Schedule tastings, finalize menu choices, and account for dietary restrictions.',
          prio: 'high' as const,
          cat: 'Catering',
        },
        {
          title: 'Book Photographer & AV/Music Lead',
          desc: 'Review portfolios, sign service agreements, and outline key shot lists.',
          prio: 'high' as const,
          cat: 'Entertainment',
        },
        {
          title: 'Finalize Theme Decor & Supply Orders',
          desc: 'Secure tables, chairs, lighting, centerpieces, and signage rentals.',
          prio: 'medium' as const,
          cat: 'Decor',
        },
      ],
    },
    {
      name: 'Phase 3: Details, Coordination & RSVPs',
      fraction: 0.15,
      tasks: [
        {
          title: 'Close RSVP Window & Confirm Headcount',
          desc: 'Provide final numbers to catering and calculate table seating/capacity allocations.',
          prio: 'critical' as const,
          cat: 'Logistics',
        },
        {
          title: 'Publish Master Day-of Run Sheet',
          desc: 'Distribute minute-by-minute itinerary to all speakers, coordinators, and vendors.',
          prio: 'high' as const,
          cat: 'Operations',
        },
        {
          title: 'Conduct Site Walkthrough',
          desc: 'Check power outlets, AV equipment, emergency exits, and vendor loading zones.',
          prio: 'medium' as const,
          cat: 'Venue',
        },
      ],
    },
    {
      name: 'Phase 4: Final Week Execution & Celebration',
      fraction: 0.03,
      tasks: [
        {
          title: 'Prepare Final Vendor Payments & Tips',
          desc: 'Envelope gratuities and verify remaining contract balances.',
          prio: 'high' as const,
          cat: 'Finance',
        },
        {
          title: 'Pack Day-of Emergency Kit',
          desc: 'Include tape, scissors, first aid, device chargers, and printouts of contacts.',
          prio: 'medium' as const,
          cat: 'Operations',
        },
        {
          title: 'Celebrate and Enjoy the Event!',
          desc: 'Trust your preparation, welcome guests, and create lasting memories.',
          prio: 'critical' as const,
          cat: 'Milestone',
        },
      ],
    },
  ];

  return phaseDefinitions.map((phase) => {
    const daysBefore = Math.max(1, Math.round(totalDays * phase.fraction));
    const targetDate = computeMilestoneTargetDate(details.date, daysBefore);

    const milestones: TimelineMilestone[] = phase.tasks.map((t, idx) => ({
      id: `ms-${phase.name.substring(0, 7)}-${idx + 1}`,
      title: t.title,
      description: t.desc,
      daysBeforeEvent: daysBefore,
      targetDate,
      completed: false,
      priority: t.prio,
      category: t.cat,
    }));

    return {
      phaseName: phase.name,
      timeframeDescription: `${daysBefore} days before event (target: ${targetDate})`,
      milestones,
    };
  });
}

function generateVendorChecklist(details: EventDetails): VendorChecklistItem[] {
  const budget = details.totalBudget;

  const baseItems: Array<{
    category: string;
    title: string;
    window: string;
    percentMin: number;
    percentMax: number;
    questions: string[];
  }> = [
    {
      category: 'Venue & Facilities',
      title: 'Primary Event Venue / Hall',
      window: '6–9 months before',
      percentMin: 0.25,
      percentMax: 0.38,
      questions: [
        'What are the load-in and teardown hour windows?',
        'Are outside catering and alcohol licensed or in-house only?',
        'What is the contingency plan for inclement weather?',
      ],
    },
    {
      category: 'Food & Beverage',
      title: 'Caterer / Food Service Provider',
      window: '4–6 months before',
      percentMin: 0.2,
      percentMax: 0.3,
      questions: [
        'How do you handle severe allergies and dietary accommodations?',
        'Does the quote include service staff, linens, and dinnerware?',
        'What is your cancellation and headcount adjustment policy?',
      ],
    },
    {
      category: 'Media & Memories',
      title: 'Photographer / Videographer',
      window: '3–6 months before',
      percentMin: 0.08,
      percentMax: 0.14,
      questions: [
        'How many hours of coverage are included on the day?',
        'What is the turnaround time for the digital photo gallery?',
        'Do you provide raw footage or edited highlight reels?',
      ],
    },
    {
      category: 'Entertainment',
      title: 'DJ / Sound Engineer / Live Performer',
      window: '2–4 months before',
      percentMin: 0.05,
      percentMax: 0.1,
      questions: [
        'Do you bring all microphones, speakers, and cables?',
        'Can we provide a custom "must play" and "do not play" list?',
        'Do you also act as the master of ceremonies (MC)?',
      ],
    },
    {
      category: 'Decor & Floral',
      title: 'Floral & Thematic Decor Stylist',
      window: '2–3 months before',
      percentMin: 0.05,
      percentMax: 0.09,
      questions: [
        'Do you deliver, arrange, and dismantle the installations?',
        'Can arrangements be repurposed between ceremony and reception?',
        'What sustainable or seasonal floral alternatives do you offer?',
      ],
    },
  ];

  return baseItems.map((item, idx) => ({
    id: `vendor-${idx + 1}`,
    category: item.category,
    title: item.title,
    bookingWindow: item.window,
    estimatedCostRange: {
      min: Math.round(budget * item.percentMin),
      max: Math.round(budget * item.percentMax),
    },
    keyQuestionsToAsk: item.questions,
    status: 'not_started',
    notes: 'Estimated planning bracket. Request itemized written proposals.',
  }));
}

function generatePersonalizedIdeas(details: EventDetails): PersonalizedIdea[] {
  const isWedding = details.type === 'wedding';
  const isBirthday = details.type === 'birthday';

  if (isWedding) {
    return [
      {
        title: 'Audio Guestbook Phone Station',
        category: 'activity',
        description: 'Set up a vintage rotary telephone where guests pick up the receiver to record heartfelt audio voice notes and blessings throughout the reception.',
        estimatedCostImpact: 'low',
        diyFriendly: true,
      },
      {
        title: 'Signature "His & Hers" Cocktail Lounge',
        category: 'food_beverage',
        description: 'Feature two curated signature drinks that represent memorable moments in the couple’s journey, displayed on custom calligraphy menu boards.',
        estimatedCostImpact: 'medium',
        diyFriendly: true,
      },
      {
        title: 'Illuminated Candlelit Canopy Dancefloor',
        category: 'decor',
        description: 'Suspended Edison bulbs or fairy light canopies paired with pillar candles in hurricane vases creating an intimate, magical evening ambiance.',
        estimatedCostImpact: 'medium',
        diyFriendly: false,
      },
      {
        title: 'Late-Night Gourmet Snack Bar',
        category: 'food_beverage',
        description: 'Surprise guests with warm mini sliders, pretzel bites, or churros brought out 90 minutes before the reception concludes.',
        estimatedCostImpact: 'low',
        diyFriendly: true,
      },
    ];
  }

  if (isBirthday) {
    return [
      {
        title: 'Nostalgia Memory Walkway & Timeline Wall',
        category: 'decor',
        description: 'A curated gallery wall spanning key milestone years of the birthday honoree, featuring framed childhood photos and memories from friends.',
        estimatedCostImpact: 'low',
        diyFriendly: true,
      },
      {
        title: 'Interactive Guest Trivia Game',
        category: 'activity',
        description: 'A custom multi-round digital or printed trivia game with humorous questions about the honoree’s favorite hobbies, quotes, and funny stories.',
        estimatedCostImpact: 'low',
        diyFriendly: true,
      },
      {
        title: 'Signature Themed Dessert & Pastry Bar',
        category: 'food_beverage',
        description: 'In addition to the main birthday cake, offer miniature cupcakes, macarons, and personalized sugar cookies labeled with festive celebration tags.',
        estimatedCostImpact: 'medium',
        diyFriendly: true,
      },
      {
        title: 'Customized Favor Care Bags',
        category: 'favor',
        description: 'Chic tote bags or boxes packed with artisanal treats, mini celebratory drink bottles, and a heartfelt thank-you card from the host.',
        estimatedCostImpact: 'low',
        diyFriendly: true,
      },
    ];
  }

  // Community
  return [
    {
      title: 'Interactive Community Mural Canvas',
      category: 'activity',
      description: 'A large collaborative canvas or wooden board where attendees and children add handprints or written wishes celebrating neighborhood togetherness.',
      estimatedCostImpact: 'low',
      diyFriendly: true,
    },
    {
      title: 'Local Artisan & Food Truck Showcase',
      category: 'food_beverage',
      description: 'Partner with local neighborhood small businesses and food vendors, allowing attendees to sample regional treats with low organizer overhead.',
      estimatedCostImpact: 'low',
      diyFriendly: false,
    },
    {
      title: 'Acoustic Open Mic & Cultural Storytelling Stage',
      category: 'entertainment',
      description: 'A shaded gazebo or small sound stage featuring local student musicians, folk dancers, and community elder storytellers.',
      estimatedCostImpact: 'medium',
      diyFriendly: true,
    },
    {
      title: 'Eco-Friendly Seed Packet Favors',
      category: 'favor',
      description: 'Packets of local wildflower or pollinator seeds stamped with the event motto: "Growing our Community Together".',
      estimatedCostImpact: 'low',
      diyFriendly: true,
    },
  ];
}

