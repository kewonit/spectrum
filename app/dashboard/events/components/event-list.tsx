'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarIcon, Clock, Users, ChevronRight, Tag, Filter } from 'lucide-react';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { slugify } from '@/app/utils/slugify';
import { ConfirmedStamp } from './confirmed-stamp';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from '@/app/libs/utils';

// Utility function to calculate remaining days
function getRemainingDays(endDate: string) {
  const end = new Date(endDate);
  const now = new Date();
  const diffDays = differenceInDays(end, now);
  return diffDays >= 0 ? diffDays : 0;
}

// Utility function to format registration status
function getRegistrationStatus(startDate: string, endDate: string) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) {
    const daysUntilStart = differenceInDays(start, now);
    return {
      text: `Starting in ${daysUntilStart} ${daysUntilStart === 1 ? 'day' : 'days'}`,
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
    return imageUrl.toString();
  } catch {
    return url;
  }
}

interface Event {
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

interface Registration {
  id: string;
  event: {
    id: string;
    name: string;
  };
}

// FilterOption component matching original aesthetic
function FilterOption({ label, count, isActive, onClick }: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all rounded-lg",
        isActive 
          ? "bg-[#EBE9E0] text-gray-800 font-medium" 
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      )}
    >
      <span>{label}</span>
      <Badge variant="outline" className={cn(
        "text-xs px-1.5 py-0 border",
        isActive ? "bg-white/70 text-gray-700" : "bg-white/80 text-gray-600 border-gray-200"
      )}>
        {count}
      </Badge>
    </button>
  );
}

export const EventList: React.FC<{ events: Event[] }> = ({ events }) => {
  const [userRegistrations, setUserRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'registered' | 'solo' | 'team'>('all');
  const [displayEvents, setDisplayEvents] = useState<Event[]>(events);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await fetch('/api/registrations/active');
        if (response.ok) {
          const data = await response.json();
          setUserRegistrations(data.registrations || []);
        }
      } catch (error) {
        console.error('Failed to fetch registrations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  // Apply filters whenever filter or data changes
  useEffect(() => {
    let filteredEvents = [...events];
    
    if (filter === 'registered') {
      filteredEvents = events.filter(event => 
        userRegistrations.some(reg => reg.event.id === event.id)
      );
    } else if (filter === 'solo') {
      filteredEvents = events.filter(event => 
        event.min_team_size === 1 && event.max_team_size === 1
      );
    } else if (filter === 'team') {
      filteredEvents = events.filter(event => 
        event.min_team_size > 1 || event.max_team_size > 1
      );
    }
    
    // Updated event organization to sort by team size
    const organizedEvents = filteredEvents.reduce((acc: { solo: Event[], team: Event[] }, event) => {
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

    // Combine the sorted arrays
    setDisplayEvents([...organizedEvents.solo, ...organizedEvents.team]);
  }, [filter, events, userRegistrations]);

  const isUserRegistered = (eventId: string) => {
    return userRegistrations.some(reg => reg.event.id === eventId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  // Count for filters
  const registeredCount = events.filter(event => userRegistrations.some(reg => reg.event.id === event.id)).length;
  const soloCount = events.filter(event => event.min_team_size === 1 && event.max_team_size === 1).length;
  const teamCount = events.filter(event => event.min_team_size > 1 || event.max_team_size > 1).length;

  return (
    <div className="p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden relative">
        {/* Dots for ticket effect */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full"></div>

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

          {/* Filter controls matching original design */}
          <div className="flex flex-wrap gap-2 items-center mb-8 pb-4 border-b border-gray-100">
            <div className="flex items-center mr-2">
              <Filter className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600 font-medium">Filter:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <FilterOption 
                label="All Events" 
                count={events.length} 
                isActive={filter === 'all'}
                onClick={() => setFilter('all')}
              />
              
              <FilterOption 
                label="Registered" 
                count={registeredCount}
                isActive={filter === 'registered'}
                onClick={() => setFilter('registered')}
              />
              
              <FilterOption 
                label="Individual" 
                count={soloCount}
                isActive={filter === 'solo'}
                onClick={() => setFilter('solo')}
              />
              
              <FilterOption 
                label="Team" 
                count={teamCount}
                isActive={filter === 'team'}
                onClick={() => setFilter('team')}
              />
            </div>
          </div>

          {/* Events grid */}
          {displayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-[#EBE9E0]/60 rounded-full p-4 mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events match your filter</h3>
              <p className="text-gray-500 max-w-md">
                Try changing your filter selection or check back later for more events.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setFilter('all')}
              >
                Show all events
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isRegistered={isUserRegistered(event.id)} 
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventCard({ 
  event, 
  isRegistered, 
  isLoading
}: { 
  event: Event, 
  isRegistered: boolean, 
  isLoading: boolean 
}) {
  const registrationStatus = getRegistrationStatus(event.registration_start, event.registration_end);
  const eventName = event.name || "Untitled Event";
  const eventDescription = event.description || "No description available";
  const isTeamEvent = event.min_team_size > 1 || event.max_team_size > 1;
  
  return (
    <Link href={`/dashboard/events/${slugify(event.name)}`} className="group block">
      <div className="bg-[#EBE9E0]/40 backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 relative flex flex-col h-auto sm:h-[240px]">
        {isRegistered && !isLoading && <ConfirmedStamp />}
        
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

        {/* Button Section at bottom */}
        <div className="mt-auto border-t border-gray-200 h-11">
          <Button
            variant="outline"
            className="w-full rounded-none h-11 bg-[#EBE9E0]/50 hover:bg-[#EBE9E0] border-0 text-gray-700 hover:text-gray-900"
          >
            <span>View Details</span>
            <ChevronRight className="ml-1 w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </Link>
  );
}