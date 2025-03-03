import { isPast } from 'date-fns';

export interface Event {
  id: string;
  name: string;
  description: string | null;
  event_type: string;
  min_team_size: number;
  max_team_size: number;
  registration_start: string;
  registration_end: string;
  event_start: string;
  event_end: string;
  max_registrations: number | null;
  is_active: boolean;
  img_url: string | null;
}

/**
 * Check if an event is closed (either past end date or marked as inactive)
 */
export function isEventClosed(event: Event): boolean {
  // An event is closed if either:
  // 1. The event end date has passed
  // 2. The event is explicitly marked as inactive
  return isPast(new Date(event.event_end)) || event.is_active === false;
}

/**
 * Deduplicate an array of events by ID
 */
export function deduplicateEvents(events: Event[]): Event[] {
  return Array.from(new Map(events.map(event => [event.id, event])).values());
}
