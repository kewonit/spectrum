'use client';

import { Badge } from "@/components/ui/badge";
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
  // Organize events by team type
  const organizedEvents = events.reduce((acc: { solo: EventDetails[], team: EventDetails[] }, event) => {
    if (event.min_team_size === 1 && event.max_team_size === 1) {
      acc.solo.push(event);
    } else {
      acc.team.push(event);
    }
    return acc;
  }, { solo: [], team: [] });

  return (
    <div className="p-2 sm:p-4 border-2 sm:border-4 border-dashed border-gray-300 rounded-xl sm:rounded-2xl lg:rounded-[2rem]">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Active Events</h1>
            <Badge variant="outline" className="px-3 py-1">
              {events.length} Events
            </Badge>
          </div>

          {/* Solo Events */}
          {organizedEvents.solo.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Individual Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {organizedEvents.solo.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Team Events */}
          {organizedEvents.team.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {organizedEvents.team.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: EventDetails }) {
  const registrationStatus = getRegistrationStatus(event.registration_start, event.registration_end);
  
  return (
    <Link 
      href={`/dashboard/events/${slugify(event.name)}`}
      className="group block"
    >
      <div className="bg-white border-2 rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300">
        {/* Event Image */}
        <div className="relative h-48 bg-blue-200">
          {event.img_url ? (
            <picture>
              <source
                srcSet={getOptimizedImageUrl(event.img_url)}
                type="image/webp"
              />
              <img
                src={event.img_url}
                alt={event.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </picture>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-yellow-100 to-yellow-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Event Title */}
          <div className="absolute bottom-0 p-4">
            <h3 className="text-lg font-bold text-white mb-2">{event.name}</h3>
            <Badge className={registrationStatus.color}>
              {registrationStatus.text}
            </Badge>
          </div>
        </div>

        {/* Event Details */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4" />
            <span>{format(new Date(event.event_start), 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              {format(new Date(event.event_start), 'h:mm a')} - 
              {format(new Date(event.event_end), 'h:mm a')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>
              {event.min_team_size === 1 && event.max_team_size === 1
                ? 'Individual Event'
                : `Team: ${event.min_team_size}-${event.max_team_size} members`}
            </span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
