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
import { Image as ImageIcon } from "lucide-react"; // Add this import
import ProfilePopupWrapper from '@/app/dashboard/events/components/ProfilePopupWrapper';

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
      <main className="min-h-screen bg-[#EBE9E0] p-4 sm:p-6 lg:p-8">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Event Title and Image (1/3 width) */}
            <div className="lg:col-span-1 bg-[#EBE9E0] rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {/* Event Title Section */}
              <div className="p-6 bg-white border-b border-gray-100">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {eventDetails.name}
                </h1>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {eventDetails.description}
                </p>
              </div>

              {/* Image Section with consistent background */}
              <div className="relative w-full h-[500px] bg-[#EBE9E0]">
                {eventDetails.img_url ? (
                  <div className="absolute inset-0 bg-[#EBE9E0]">
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
                  <div className="absolute inset-0 bg-[#EBE9E0] flex items-center justify-center">
                    <ImageIcon className="w-20 h-20 text-gray-400" strokeWidth={1} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Registration Component (2/3 width) */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6">
              <div className="space-y-4">
                <div>
                  <span className="inline-block px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium tracking-wide uppercase mb-3">
                    {eventDetails.max_registrations ? `${eventDetails.max_registrations} Spots Available` : 'Open Registration'}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">
                    {eventDetails.name}
                  </h1>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {eventDetails.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Team Size</p>
                      <p className="text-xs text-gray-500">
                        {eventDetails.max_team_size === 1 
                          ? "Individual Event"
                          : `${eventDetails.min_team_size} - ${eventDetails.max_team_size} members`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Registration Period</p>
                      <p className="text-xs text-gray-500">
                        {new Date(eventDetails.registration_start).toLocaleDateString()} - {new Date(eventDetails.registration_end).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-300 my-6"></div>
                
                <Suspense fallback={<Button disabled className="w-full">Loading...</Button>}>
                  <RegisterComponent eventDetails={eventDetails} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
        <ProfilePopupWrapper />
      </main>
    </Suspense>
  );
}
