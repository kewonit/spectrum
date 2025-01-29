"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import Image from "next/image";

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

interface RegisterComponentProps {
  eventDetails: EventDetails;
}

export function RegisterComponent({ eventDetails }: RegisterComponentProps) {
  const [isSolo, setIsSolo] = useState(true);

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

            <div className="flex flex-col md:flex-row h-auto md:h-[400px]">
              <div className="md:w-[45%] relative h-[150px] sm:h-[200px] md:h-full bg-[#EBE9E0]">
                <Image 
                  className="object-contain object-center w-full h-full p-2 sm:p-4"
                  src="https://i.imgur.com/FVfeMNp_d.webp?maxwidth=760&fidelity=grand" 
                  alt={eventDetails.name}
                  width={1200} 
                  height={1000} 
                  loading="lazy"
                  draggable="false"
                />
              </div>

              <div className="md:w-[55%] p-4 sm:p-6 lg:p-8 flex flex-col justify-between bg-gradient-to-br from-white to-gray-50">
                <div className="space-y-4 sm:space-y-8">
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

                  {/* ...existing event details grid... */}
                </div>

                <div className="mt-4 md:mt-0">
                  <div className="border-t-2 border-dashed border-gray-300 my-3 sm:my-6 -mx-3 sm:-mx-8"></div>
                  <Button className="w-full py-2.5 sm:py-4 text-xs sm:text-base font-medium bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-300 rounded-lg flex items-center justify-between px-3 sm:px-6 group">
                    <span>Register Now</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="my-4 flex gap-4">
          <Button variant={isSolo ? "default" : "outline"} onClick={() => setIsSolo(true)}>
            Solo
          </Button>
          <Button variant={!isSolo ? "default" : "outline"} onClick={() => setIsSolo(false)}>
            Team
          </Button>
        </div>

        {isSolo ? (
          <Button onClick={() => {/* ...submit solo registration... */}}>Submit Solo</Button>
        ) : (
          <Button onClick={() => {/* ...submit team registration... */}}>Submit Team</Button>
        )}
      </div>
    </main>
  );
}
