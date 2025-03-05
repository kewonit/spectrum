import { createClient } from "@/app/utils/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import RegisterComponent from "./components/RegisterComponent";
import { Suspense } from "react";
import { slugify } from "@/app/utils/slugify";
import EventLoading from "./loading";
import { AlertCircle, CalendarIcon, Image as ImageIcon, Users } from "lucide-react"; // Add AlertCircle
import ProfilePopupWrapper from '@/app/dashboard/events/components/ProfilePopupWrapper';
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow, isPast, isFuture, isValid } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Add Alert components

interface EventDetails {
  id: string;
  name: string;
  description: string | null;
  img_url: string | null;
  event_type: string;
  min_team_size: number;
  max_team_size: number;
  registration_start: string;
  registration_end: string;
  event_start: string;
  event_end: string;
  max_registrations: number | null;
  is_active: boolean;
}

async function getEventDetails(eventName: string) {
  const supabase = await createClient();
  
  const { data: events, error } = await supabase
    .from("events")
    .select("*");

  if (error) {
    console.error("Error fetching events:", error);
    throw new Error("Failed to fetch event details");
  }

  const event = events.find(e => slugify(e.name) === eventName);
  return event || null;
}

// Add this utility function before the component
function getFormattedDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Handle invalid dates
  if (!isValid(start) || !isValid(end)) {
    return {
      dateRange: 'Dates to be announced',
      status: '(TBA)'
    };
  }

  const now = new Date();

  // Determine status
  let status = '';
  if (isPast(end)) {
    status = '(Closed)';
  } else if (isFuture(start)) {
    const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    status = daysUntilStart <= 7 ? '(Starting Soon)' : '(Upcoming)';
  } else {
    const daysUntilEnd = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    status = daysUntilEnd <= 2 ? '(Ending Soon)' : '(Active)';
  }

  // Format dates
  const formatDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  // Special case: Same day event
  if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
    return {
      dateRange: formatDate(start),
      status
    };
  }

  return {
    dateRange: `${formatDate(start)} to ${formatDate(end)}`,
    status
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ "event-name": string }>;
}) {

  const resolvedParams = await params;
  const eventName = resolvedParams["event-name"];
  
  const eventDetails = await getEventDetails(eventName);

  if (!eventDetails) {
    notFound();
  }

  return (
    <Suspense fallback={<EventLoading />}>
      <main className="min-h-screen bg-[#EBE9E0] p-3 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Events', href: '/dashboard/events' },
              { label: eventDetails.name },
            ]}
            className="mb-4"
          />

          <div className="p-2 sm:p-4 border-4 border-dashed border-gray-300/50 rounded-3xl">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden relative">
              {/* Dots for ticket effect */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full"></div>

              <div className="px-3 sm:px-8 lg:px-10 py-4 sm:py-8 lg:py-10">
                {!eventDetails.is_active ? (
                  <div className="p-3 sm:p-6">
                    {/* Enhanced Event Closed Notification */}
                    <div className="relative overflow-hidden mb-8">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <pattern id="event-closed-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M-3,3 l6,-6 M0,10 l10,-10 M7,13 l6,-6" stroke="currentColor" strokeWidth="1" />
                          </pattern>
                          <rect x="0" y="0" width="100%" height="100%" fill="url(#event-closed-pattern)" />
                        </svg>
                      </div>
                      
                      {/* Notification Card */}
                      <div className="relative bg-gradient-to-r from-rose-50 via-orange-50 to-rose-50 rounded-xl sm:rounded-2xl shadow-md overflow-hidden border border-red-200/70">
                        {/* Color Bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-orange-300 to-red-400"></div>
                        
                        <div className="p-4 sm:p-6 md:p-8">
                          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
                            <div className="flex-shrink-0 bg-rose-100/70 text-red-500 p-3 rounded-full">
                              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={1.5} />
                            </div>
                            
                            <div className="flex-grow text-center md:text-left">
                              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Registration Closed</h2>
                              <p className="text-base text-gray-600 mb-4">
                                {eventDetails.name} is no longer accepting new registrations. Please check out other exciting events.
                              </p>
                              
                              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <Button
                                  asChild
                                  variant="outline" 
                                  className="border-red-200 hover:border-red-300 hover:bg-rose-50 gap-2"
                                >
                                  <Link href="/dashboard/events">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>Browse Events</span>
                                  </Link>
                                </Button>
                                
                                <Button
                                  asChild
                                  variant="ghost" 
                                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100/50"
                                >
                                  <Link href="/dashboard">
                                    Back to Dashboard
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 opacity-75">
                      {/* Event Image */}
                      <div className="lg:col-span-1">
                        <div className="bg-[#EBE9E0]/40 backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden">
                          <div className="p-6 bg-white/60 border-b border-gray-100">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                              {eventDetails.name}
                            </h1>
                            <Badge variant="outline" className="bg-gray-100/50">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                                Registrations Closed
                              </span>
                            </Badge>
                          </div>
                          <div className="relative w-full h-[300px] sm:h-[400px]">
                            {eventDetails.img_url ? (
                              <div className="absolute inset-0">
                                <picture>
                                  <img 
                                    className="object-contain w-full h-full filter grayscale"
                                    src={eventDetails.img_url} 
                                    alt={eventDetails.name}
                                    width={800}
                                    height={600}
                                    draggable="false"
                                  />
                                </picture>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100/30 backdrop-blur-[1px]"></div>
                              </div>
                            ) : (
                              <div className="absolute inset-0 bg-[#EBE9E0]/40 backdrop-blur-sm flex items-center justify-center">
                                <ImageIcon className="w-20 h-20 text-gray-400" strokeWidth={1} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Event Details */}
                      <div className="lg:col-span-2">
                        <div className="bg-[#EBE9E0]/40 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
                          <h2 className="text-xl font-semibold mb-4">Event Information</h2>
                          <p className="text-sm text-gray-600 mb-6">{eventDetails.description}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
                              <Users className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-semibold text-gray-700">Team Size</p>
                                <p className="text-xs text-gray-500">
                                  {eventDetails.max_team_size === 1 
                                    ? "Individual Event"
                                    : `${eventDetails.min_team_size} - ${eventDetails.max_team_size} members`}
                                </p>
                              </div>
                            </div>

                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
                              <CalendarIcon className="w-5 h-5 text-gray-400" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-gray-700">
                                    Registration Period
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500 block">
                                  {getFormattedDateRange(eventDetails.registration_start, eventDetails.registration_end).dateRange}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-1">
                      <div className="bg-[#EBE9E0]/40 backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden">
                        {/* Event Title Section */}
                        <div className="p-6 bg-white/60 border-b border-gray-100">
                          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            {eventDetails.name}
                          </h1>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {eventDetails.description}
                          </p>
                        </div>

                        {/* Image Section */}
                        <div className="relative w-full h-[300px] sm:h-[500px]">
                          {eventDetails.img_url ? (
                            <div className="absolute inset-0">
                              <picture>
                                <img 
                                  className="object-contain w-full h-full"
                                  src={eventDetails.img_url} 
                                  alt={eventDetails.name}
                                  width={800}
                                  height={600}
                                  draggable="false"
                                />
                              </picture>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-[#EBE9E0]/40 backdrop-blur-sm flex items-center justify-center">
                              <ImageIcon className="w-20 h-20 text-gray-400" strokeWidth={1} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2">
                      <div className="bg-[#EBE9E0]/40 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
                        <div className="space-y-6">
                          <div>
                            <Badge 
                              variant="secondary" 
                              className="bg-[#EBE9E0]/50 mb-3"
                            >
                              {eventDetails.max_registrations ? `${eventDetails.max_registrations} Spots Available` : 'Open Registration'}
                            </Badge>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                              {eventDetails.name}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                              {eventDetails.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
                              <Users className="w-5 h-5 text-primary/70" />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Team Size</p>
                                <p className="text-xs text-gray-500">
                                  {eventDetails.max_team_size === 1 
                                    ? "Individual Event"
                                    : `${eventDetails.min_team_size} - ${eventDetails.max_team_size} members`}
                                </p>
                              </div>
                            </div>

                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
                              <CalendarIcon className="w-5 h-5 text-primary/70" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-gray-900">
                                    Registration Period
                                  </span>
                                  <Badge variant="outline" className="font-normal">
                                    {getFormattedDateRange(eventDetails.registration_start, eventDetails.registration_end).status}
                                  </Badge>
                                </div>
                                <span className="text-xs text-gray-500 block">
                                  {getFormattedDateRange(eventDetails.registration_start, eventDetails.registration_end).dateRange}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="border-t-2 border-dashed border-gray-300/50 my-6"></div>
                          
                          <Suspense fallback={<Button disabled className="w-full">Loading...</Button>}>
                            <RegisterComponent eventDetails={eventDetails} />
                          </Suspense>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <ProfilePopupWrapper />
      </main>
    </Suspense>
  );
}
