/**
 * Planora AI — Vendor Checklist & Booking Priority Types
 */

export type VendorStatus = 'not_started' | 'researching' | 'contacted' | 'booked' | 'rejected';

export interface VendorChecklistItem {
  id: string;
  category: string;
  title: string;
  bookingWindow: string; // e.g. "9-12 months before"
  estimatedCostRange: {
    min: number;
    max: number;
  };
  keyQuestionsToAsk: string[];
  status: VendorStatus;
  selectedVendorName?: string;
  notes?: string;
}

export interface VendorChecklistPlan {
  totalVendors: number;
  bookedCount: number;
  items: VendorChecklistItem[];
}

