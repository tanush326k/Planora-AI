import { EventCategoryInfo, EventType } from '@/types/event';

export const EVENT_CATEGORIES: Record<EventType, EventCategoryInfo> = {
  wedding: {
    id: 'wedding',
    title: 'Weddings & Receptions',
    tagline: 'Elegant, memorable celebrations with precision timing and budget control',
    description: 'From ceremony coordination and venue selection to catering, photography, and decor — plan your dream day without the stress.',
    typicalLeadTimeMonths: 9,
    keyPriorities: [
      'Venue & date reservation',
      'Catering & beverage packages',
      'Photography & videography',
      'Attire, decor & floral styling',
      'Invitations & guest RSVP tracking'
    ],
    suggestedBudgetCategories: [
      'Venue & Rentals (40%)',
      'Catering & Bar (25%)',
      'Photo & Video (12%)',
      'Attire & Beauty (8%)',
      'Music & Entertainment (7%)',
      'Contingency Buffer (8%)'
    ]
  },
  birthday: {
    id: 'birthday',
    title: 'Milestone Birthdays',
    tagline: 'Joyful gatherings customized for the guest of honor',
    description: 'Whether it is a child’s themed party, a sweet sixteen, or a milestone 30th/50th/70th jubilee, tailor the theme, cake, music, and activities with ease.',
    typicalLeadTimeMonths: 2,
    keyPriorities: [
      'Theme & guest list definition',
      'Venue or home layout prep',
      'Cake & specialty catering',
      'Music, games & entertainment',
      'Party favors & personalized touches'
    ],
    suggestedBudgetCategories: [
      'Food & Beverages (45%)',
      'Venue / Space Prep (20%)',
      'Cake & Desserts (10%)',
      'Entertainment & Music (12%)',
      'Decorations & Favors (8%)',
      'Contingency Buffer (5%)'
    ]
  },
  community: {
    id: 'community',
    title: 'Community & Charity Events',
    tagline: 'Impactful fundraisers, block parties, cultural fests, and local gatherings',
    description: 'Designed for volunteer committees and organizers needing strict budget accountability, vendor safety compliance, and clear logistical timelines.',
    typicalLeadTimeMonths: 4,
    keyPriorities: [
      'Permits, city approvals & insurance',
      'Sponsorship & donation tracking',
      'Sound/stage equipment & volunteer shifts',
      'Crowd hospitality & food trucks',
      'Marketing & community outreach'
    ],
    suggestedBudgetCategories: [
      'Permits, Safety & Facilities (25%)',
      'Staging, AV & Technical (25%)',
      'Refreshments & Hospitality (20%)',
      'Marketing & Signage (15%)',
      'Volunteer Operations & Supplies (5%)',
      'Contingency Buffer (10%)'
    ]
  }
};
