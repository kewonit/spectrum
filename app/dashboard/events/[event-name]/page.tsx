import { createClient } from "@/app/utils/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import RegisterComponent from "./RegisterComponent";
import { Suspense } from "react";
import { slugify } from "@/app/utils/slugify";

interface EventDetails {
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
    <main className="min-h-screen bg-[#EBE9E0] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Events', href: '/dashboard/events' },
            { label: eventDetails.name },
          ]}
          className="mb-4"
        />

        <div className="p-2 sm:p-4 border-4 border-dashed border-gray-300 rounded-[2rem]">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full"></div>

            <div className="flex flex-col md:flex-row h-auto">
              <div className="md:w-[45%] relative h-[200px] md:h-full bg-[#EBE9E0]">
                <div className="relative w-full h-full">
                  <Image 
                    className="object-contain object-center p-2 sm:p-4"
                    src="https://i.imgur.com/FVfeMNp_d.webp?maxwidth=760&fidelity=grand" 
                    alt={eventDetails.name}
                    width={800}
                    height={600}
                    priority
                    draggable="false"
                  />
                </div>
              </div>

              <div className="md:w-[55%] p-4 sm:p-6 lg:p-8 flex flex-col bg-gradient-to-br from-white to-gray-50">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <span className="inline-block px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-medium tracking-wide uppercase mb-1.5 sm:mb-3">
                      {eventDetails.max_registrations ? `${eventDetails.max_registrations} Spots Available` : 'Open Registration'}
                    </span>
                    <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-black mb-1.5 sm:mb-2">
                      {eventDetails.name}
                    </h1>
                    <p className="text-[11px] sm:text-sm text-gray-600 leading-relaxed">
                      {eventDetails.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-6">
                    <div className="space-y-2 sm:space-y-4">
                      <div className="flex items-center gap-1.5 sm:gap-3">
                        <svg className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <div>
                          <p className="text-[11px] sm:text-sm font-semibold text-gray-900">Participants</p>
                          <p className="text-[9px] sm:text-xs text-gray-500">
                            {eventDetails.max_team_size === 1 
                              ? "Individual Event"
                              : `${eventDetails.min_team_size} - ${eventDetails.max_team_size} members per team`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-3">
                        <svg className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-[11px] sm:text-sm font-semibold text-gray-900">Registration Period</p>
                          <p className="text-[9px] sm:text-xs text-gray-500">
                            {new Date(eventDetails.registration_start).toLocaleDateString()} - {new Date(eventDetails.registration_end).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="border-t-2 border-dashed border-gray-300 my-3 sm:my-4 -mx-3 sm:-mx-8"></div>
                  <Suspense fallback={<Button disabled className="w-full">Loading...</Button>}>
                    <RegisterComponent eventDetails={eventDetails} />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
