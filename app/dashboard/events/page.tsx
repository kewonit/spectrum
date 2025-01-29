import { createClient } from "@/app/utils/supabase/server";
import Link from "next/link";
import { slugify } from "@/app/utils/slugify";
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import { Loader2 } from "lucide-react";

// Utility function to calculate remaining days
function getRemainingDays(endDate: string) {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Utility function to format registration status
function getRegistrationStatus(startDate: string, endDate: string) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) {
    return {
      text: `Starting in ${getRemainingDays(startDate)} days`,
      color: 'bg-yellow-100 text-yellow-800'
    };
  } else if (now > end) {
    return {
      text: 'Registration Closed',
      color: 'bg-red-100 text-red-800'
    };
  } else {
    const daysLeft = getRemainingDays(endDate);
    return {
      text: `${daysLeft} days left`,
      color: 'bg-green-100 text-green-800'
    };
  }
}

export default async function EventsPage() {
  const supabase = await createClient();
  
  let events;
  try {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order('created_at', { ascending: false });
    events = data;
  } catch (error) {
    return (
      <main className="min-h-screen bg-[#EBE9E0] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </main>
    );
  }

  if (!events) {
    return (
      <main className="min-h-screen bg-[#EBE9E0] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Events' },
            ]}
            className="mb-6"
          />
          <div className="text-center p-8 bg-white rounded-2xl shadow">No events found</div>
        </div>
      </main>
    );
  }

  // Organize events by team type
  const organizedEvents = events?.reduce((acc: any, event) => {
    if (event.min_team_size === 1 && event.max_team_size === 1) {
      acc.solo.push(event);
    } else {
      acc.team.push(event);
    }
    return acc;
  }, { solo: [], team: [] });

  return (
    <main className="min-h-screen bg-[#EBE9E0] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Events' },
          ]}
          className="mb-6"
        />

        <div className="p-2 sm:p-4 border-4 border-dashed border-[#C8C4B4] rounded-3xl">
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden relative">
            {/* Dots for ticket effect */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full"></div>

            <div className="p-4 sm:p-6 lg:p-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-[#2C2C2C]">All Events</h1>
              
              {/* Solo Events */}
              {organizedEvents.solo.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-[#2C2C2C]">Individual Events</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {organizedEvents.solo.map((event: any) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}

              {/* Team Events */}
              {organizedEvents.team.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-[#2C2C2C]">Team Events</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {organizedEvents.team.map((event: any) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Event Card Component
function EventCard({ event }: { event: any }) {
  const registrationStatus = getRegistrationStatus(event.registration_start, event.registration_end);
  
  return (
    <Link 
      href={`/dashboard/events/${slugify(event.name)}`}
      className="block group"
    >
      <div className="bg-[#F5F3E8] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-6 border border-[#E5E2D6]">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-[#826F66] transition-colors text-[#2C2C2C]">
          {event.name}
        </h2>
        
        <div className="text-sm text-gray-600 space-y-2">
          {event.min_team_size > 1 && (
            <p className="inline-flex items-center bg-white/80 px-2 py-1 rounded-md border border-[#E5E2D6]">
              <span className="font-medium mr-1">Team Size:</span>
              {event.min_team_size === event.max_team_size 
                ? `${event.min_team_size} members`
                : `${event.min_team_size} - ${event.max_team_size} members`
              }
            </p>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <span className={`px-3 py-1 rounded-full text-sm ${registrationStatus.color}`}>
              {registrationStatus.text}
            </span>
            
            <span className={`px-3 py-1 rounded-full text-sm ${
              event.is_active 
                ? 'bg-[#E5E2D6] text-[#2C2C2C]' 
                : 'bg-red-100 text-red-800'
            }`}>
              {event.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          {event.description && (
            <p className="line-clamp-2 mt-2 text-gray-600">{event.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
