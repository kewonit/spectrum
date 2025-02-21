'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { slugify } from "@/app/utils/slugify";
import { CalendarIcon, Clock, Users } from "lucide-react";
import { format } from 'date-fns';
import { EventDetails } from "@/app/types/events";

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

function getOptimizedImageUrl(url: string) {
  try {
    const imageUrl = new URL(url);
    imageUrl.searchParams.set('w', '400');
    imageUrl.searchParams.set('q', '60');
    imageUrl.searchParams.set('blur', '1');
    return imageUrl.toString();
  } catch {
    return url;
  }
}

interface EventListProps {
  events: EventDetails[];
}

export function EventList({ events }: EventListProps) {
  // Updated event organization to sort by team size
  const organizedEvents = events.reduce((acc: { solo: EventDetails[], team: EventDetails[] }, event) => {
    if (event.min_team_size === 1 && event.max_team_size === 1) {
      acc.solo.push(event);
    } else {
      acc.team.push(event);
    }
    return acc;
  }, { solo: [], team: [] });

  // Sort team events by team size
  organizedEvents.team.sort((a, b) => {
    // First compare by min_team_size
    if (a.min_team_size !== b.min_team_size) {
      return a.min_team_size - b.min_team_size;
    }
    // If min_team_size is same, compare by max_team_size
    return a.max_team_size - b.max_team_size;
  });

  // Sort solo events by date (as they all have same team size)
  organizedEvents.solo.sort((a, b) => 
    new Date(a.event_start).getTime() - new Date(b.event_start).getTime()
  );

  return (
    // Updated outer container container styling
    <div className="p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden relative">
        {/* Dots for ticket effect */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full"></div>

        <div className="px-4 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10">
          {/* Updated header section with better mobile styling */}
          <div className="flex flex-col sm:flex-row items-stretch justify-between mb-8 pb-6 gap-3 sm:gap-4">
            <div className="bg-[#EBE9E0]/40 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 flex items-center gap-4 flex-1">
              <div className="p-2.5 sm:p-3 bg-white/60 rounded-xl shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary/70" />
              </div>
              <div className="min-w-0"> {/* Added to prevent text overflow */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  Active Events
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base line-clamp-2 sm:line-clamp-1">
                  Register for upcoming events and competitions
                </p>
              </div>
            </div>
            <div className="bg-[#EBE9E0]/40 backdrop-blur-sm border border-gray-200 rounded-2xl flex items-center justify-center p-4 sm:px-6 h-[64px] sm:h-auto">
              <Badge 
                variant="outline" 
                className="text-sm sm:text-base border-0 bg-transparent whitespace-nowrap"
              >
                {events.length} Events
              </Badge>
            </div>
          </div>

          {/* Updated Category sections */}
          <div className="space-y-12">
            {organizedEvents.solo.length > 0 && (
              <section>
                <div className="mb-8">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#EBE9E0]/50 rounded-lg">
                        <Users className="w-5 h-5 text-primary/70" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Individual Events</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Events for individual participants</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-[#EBE9E0]/30">
                      {organizedEvents.solo.length} Events
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {organizedEvents.solo.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {organizedEvents.team.length > 0 && (
              <section>
                <div className="mb-8">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#EBE9E0]/50 rounded-lg">
                        <Users className="w-5 h-5 text-primary/70" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Team Events</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Events requiring team participation</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-[#EBE9E0]/30">
                      {organizedEvents.team.length} Events
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {organizedEvents.team.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: EventDetails }) {
  const registrationStatus = getRegistrationStatus(event.registration_start, event.registration_end);
  const eventName = event.name || "Untitled Event";
  
  return (
    <Link href={`/dashboard/events/${slugify(event.name)}`} className="group block">
      {/* Use auto height on mobile; fixed height on larger screens */}
      <div className="bg-[#EBE9E0]/40 backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 relative flex flex-col h-auto sm:h-[240px]">
        {/* Responsive flex: mobile uses flex-col-reverse so that image is on top */}
        <div className="flex-1 flex flex-col-reverse sm:flex-row min-h-0">
          {/* Content Section: Order 2 on mobile, order 1 on sm */}
          <div className="order-2 sm:order-1 flex-1 p-4 flex flex-col overflow-hidden">
            <div className="space-y-2 mb-3">
              <Badge variant="secondary" className="bg-[#EBE9E0]/50 inline-flex">
                {event.min_team_size === 1 && event.max_team_size === 1 ? 'Individual' : 'Team'}
              </Badge>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight line-clamp-1">
                {eventName}
              </h3>
            </div>
            <div className="space-y-1.5 min-h-0 overflow-hidden">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CalendarIcon className="w-4 h-4 text-primary/70 shrink-0" />
                <span className="truncate">{format(new Date(event.event_start), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="w-4 h-4 text-primary/70 shrink-0" />
                <span className="truncate">{format(new Date(event.event_start), 'h:mm a')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Users className="w-4 h-4 text-primary/70 shrink-0" />
                <span className="truncate">
                  {event.min_team_size === 1 && event.max_team_size === 1
                    ? 'Individual Participation'
                    : `Team: ${event.min_team_size}-${event.max_team_size} members`}
                </span>
              </div>
            </div>
          </div>
          
          {/* Image Section: Order 1 on mobile, order 2 on sm */}
          <div className="order-1 sm:order-2 relative w-full sm:w-1/3 h-48 sm:h-auto">
            {event.img_url ? (
              <picture>
                <source srcSet={getOptimizedImageUrl(event.img_url)} type="image/webp" />
                <img
                  src={event.img_url}
                  alt={eventName}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </picture>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent" />
            <div className="absolute bottom-4 right-4">
              <Badge className={`${registrationStatus.color} px-2.5 py-1 font-medium`}>
                {registrationStatus.text}
              </Badge>
            </div>
          </div>
        </div>

        {/* Button Section remains at bottom */}
        <div className="mt-auto border-t border-gray-200 h-11">
          <Button
            variant="outline"
            className="w-full rounded-none h-11 bg-[#EBE9E0]/50 hover:bg-[#EBE9E0] border-0 text-gray-700 hover:text-gray-900"
          >
            View Details
          </Button>
        </div>
      </div>
    </Link>
  );
}