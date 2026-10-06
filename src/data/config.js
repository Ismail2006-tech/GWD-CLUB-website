/**
 * GWD SITE MASTER CONFIGURATION
 * 
 * Central switchboard for content visibility, feature flags,
 * tweakable animation speeds, and backend integration endpoints.
 */

// Phase 1.1: Control visibility of unverified / placeholder sections on public site.
// Set to true when real founding story and unverified archives are provided.
export const SHOW_PLACEHOLDER_SECTIONS = false;

// Phase 4: Join the Club submission endpoint
// Replace this with your Google Sheets Apps Script Web App URL or Formspree endpoint
export const JOIN_CLUB_FORM_ENDPOINT = "https://formspree.io/f/placeholder_gwd_join";

// Phase 4: Live verified counters (based strictly on verified data in project)
export const VERIFIED_COUNTERS = [
  { id: 'members', label: 'ACTIVE MEMBERS', value: 45, suffix: '+' },
  { id: 'leads', label: 'CORE LEADERS', value: 9, suffix: '' },
  { id: 'domains', label: 'CORE DOMAINS', value: 5, suffix: '' },
  { id: 'events', label: 'EVENTS ARCHIVED', value: 2, suffix: '' },
];
