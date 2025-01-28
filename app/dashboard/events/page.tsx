import { createClient } from "@/app/utils/supabase/server";
import Link from "next/link";
import { slugify } from "@/app/utils/slugify";
import { Breadcrumbs } from "@/app/components/breadcrumbs";

export default async function EventsPage() {
  const supabase = await createClient();
  
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order('created_at', { ascending: false });

  if (!events) {
    return <div className="text-center p-8">No events found</div>;
  }

  return (
    <main className="min-h-screen bg-[#EBE9E0] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="p-2 sm:p-4 border-4 border-dashed border-gray-300 rounded-3xl">
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden relative">
            {/* Dots for ticket effect */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#EBE9E0] rounded-r-full"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#EBE9E0] rounded-l-full"></div>

            <div className="p-6 sm:p-8">
              <Breadcrumbs
                items={[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Events' },
                ]}
              />
              
              <h1 className="text-3xl font-bold mb-8">All Events</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Link 
                    key={event.id} 
                    href={`/dashboard/events/${slugify(event.name)}`}
                    className="block"
                  >
                    <div className="bg-[#EBE9E0] rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                      <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
              
                      <div className="text-sm text-gray-600 space-y-2">
                        <p className="capitalize">Type: {event.event_type.replace('_', ' ')}</p>
                        
                        <p>Team Size: {
                          event.min_team_size === event.max_team_size
                            ? event.min_team_size
                            : `${event.min_team_size} - ${event.max_team_size}`
                        } members</p>
                        
                        <p>Registration: {new Date(event.registration_start).toLocaleDateString()} - {new Date(event.registration_end).toLocaleDateString()}</p>
                        
                        {event.description && (
                          <p className="line-clamp-2">{event.description}</p>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          event.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {event.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
