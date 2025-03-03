import { createClient } from "@/app/utils/supabase/server";
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import { LoadingState } from "./components/loading-state";
import { EmptyState } from "./components/empty-state";
import { EventList } from "./components/event-list";

export const revalidate = 60;

export default async function EventsPage() {
  const supabase = await createClient();
  
  try {
    // First, fetch active events (for backward compatibility)
    const { data: activeEvents, error: activeError } = await supabase
      .from("events")
      .select(`
        id,
        name,
        description,
        event_type,
        min_team_size,
        max_team_size,
        registration_start,
        registration_end,
        event_start,
        event_end,
        max_registrations,
        is_active,
        img_url,
        whatsapp_url,
        created_at,
        updated_at
      `)
      .eq('is_active', true)
      .gte('registration_end', new Date().toISOString())
      .order('event_start', { ascending: true });
    
    if (activeError) throw activeError;

    // Now, fetch closed/inactive events
    const { data: closedEvents, error: closedError } = await supabase
      .from("events")
      .select(`
        id,
        name,
        description,
        event_type,
        min_team_size,
        max_team_size,
        registration_start,
        registration_end,
        event_start,
        event_end,
        max_registrations,
        is_active,
        img_url,
        whatsapp_url,
        created_at,
        updated_at
      `)
      .or(`is_active.eq.false,event_end.lt.${new Date().toISOString()}`);
    
    if (closedError) throw closedError;

    // Combine both queries
    const allEvents = [...(activeEvents || []), ...(closedEvents || [])];
    
    // Deduplicate events in case there's any overlap
    const uniqueEvents = Array.from(
      new Map(allEvents.map(event => [event.id, event])).values()
    );

    if (!uniqueEvents.length) {
      return <EmptyState />;
    }

    return (
      <main className="min-h-screen bg-[#EBE9E0] overflow-auto">
        <div className="w-full max-w-screen-xl mx-auto p-4 sm:px-6 lg:p-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Events' },
            ]}
            className="mb-6"
          />
          <EventList events={uniqueEvents} />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    return <LoadingState />;
  }
}
