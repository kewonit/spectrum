'use client';

import { useEffect, useState } from 'react';
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from 'next/link';
import { EventDetails, RegistrationStatus, TeamMember } from '@/app/types/events';
import { Badge } from '@/components/ui/badge';
import { Loader2, Loader2Icon } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface Registration {
  id: string;
  event: EventDetails;
  type: 'solo' | 'team';
  status: RegistrationStatus;
  team?: {
    id: string;
    name: string;
    members: TeamMember[];
    isLeader: boolean;
  };
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/registrations/active');
      if (!response.ok) throw new Error('Failed to fetch registrations');
      const data = await response.json();
      setRegistrations(data.registrations);
    } catch (error: any) {
      toast.error("Failed to load registrations", {
        description: error.message || "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  const activeRegistrationsCount = registrations.length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EBE9E0] p-2 sm:p-4 lg:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-3 sm:mb-4 -mx-1 sm:mx-0">
            <div className="bg-white/50 backdrop-blur-sm px-2 py-1.5 rounded-lg inline-block animate-pulse">
              <div className="h-5 w-48 bg-gray-200 rounded" />
            </div>
          </div>

          <div className="p-2 sm:p-4 border-2 sm:border-4 border-dashed border-gray-300 rounded-2xl sm:rounded-[2rem]">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                  <div className="text-sm text-gray-500">Loading your registrations...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EBE9E0] p-2 sm:p-4 lg:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-3 sm:mb-4 -mx-1 sm:mx-0">
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Events', href: '/dashboard/events' },
              { label: 'Registrations' },
            ]}
          />
        </div>

        <div className="p-2 sm:p-4 border-2 sm:border-4 border-dashed border-gray-300 rounded-2xl sm:rounded-[2rem]">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">
                    Your Registrations
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Manage and view your event registrations
                  </p>
                </div>
                <div className="bg-blue-50 px-3 py-1.5 rounded-lg text-sm">
                  <p className="text-blue-800 font-medium">
                    Active: {activeRegistrationsCount}
                  </p>
                </div>
              </div>

              {activeRegistrationsCount > 0 && (
                <div className="mb-4 bg-yellow-50/80 border border-yellow-200 rounded-lg p-3 text-xs sm:text-sm">
                  <p className="text-yellow-800 flex items-center gap-2.5">
                    <span className="text-base">⚠️</span>
                    <span>Please note: You can register for up to 2 events only. This helps prevent timing conflicts and ensures you can participate fully.</span>
                  </p>
                </div>
              )}

              {registrations.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Active Registrations
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You haven&apos;t registered for any events yet.
                  </p>
                  <Link href="/dashboard/events">
                    <Button>
                      Browse Events
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {registrations.map((reg) => (
                    <Card 
                      key={reg.id} 
                      className="border hover:border-primary/40 transition-all duration-300 hover:shadow-sm"
                    >
                      <CardHeader className="p-3 sm:p-4 lg:p-6 pb-0">
                        <div className="flex flex-col gap-1.5 sm:gap-2">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-base sm:text-lg lg:text-xl">
                                {reg.event.name}
                              </CardTitle>
                              {reg.team?.isLeader && (
                                <Badge className="bg-blue-50 text-blue-700 text-xs select-none">
                                  Team Leader
                                </Badge>
                              )}
                            </div>
                            {reg.status && (
                              <Badge
                                className={`
                                  whitespace-nowrap shrink-0 text-xs select-none
                                  ${reg.status === 'confirmed' 
                                    ? 'bg-green-50 text-green-700' : 
                                    reg.status === 'pending' 
                                    ? 'bg-yellow-50 text-yellow-700' : 
                                    'bg-red-50 text-red-700'}
                                `}
                              >
                                {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-sm line-clamp-2">
                            {reg.event.description}
                          </CardDescription>
                        </div> 
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4 lg:p-6 pt-3">
                        <Separator className="my-1.5" />
                        <div className="space-y-2 sm:space-y-3 mt-1.5">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-sm font-semibold mb-1">
                              Registration Type
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {reg.type === 'solo' ? 'Individual Event' : 'Team Event'}
                            </p>
                          </div>

                          {reg.team && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <h4 className="text-sm font-semibold mb-2">Team Details</h4>
                              
                              <div className="mb-4">
                                <p className="font-medium text-primary/90 text-sm">
                                  {reg.team.name}
                                </p>
                              </div>

                              <div className="space-y-2">
                                {reg.team.members
                                  .filter(member => member.status === 'accepted')
                                  .map((member, idx) => (
                                  <div
                                    key={member.id || idx}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-lg p-3 transition-colors hover:bg-gray-50"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-green-600 flex-shrink-0">●</span>
                                      <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium truncate">
                                            {member.name}
                                          </span>
                                          {member.isLeader && (
                                            <Badge className="bg-blue-50 text-blue-700 text-xs select-none">
                                              Team Leader
                                            </Badge>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500 truncate">
                                          {member.email}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-6 sm:ml-0">
                                      {member.isRegistered && (
                                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md whitespace-nowrap">
                                          Registered
                                        </span>
                                      )}
                                      <Badge className="bg-green-50 text-green-700 whitespace-nowrap text-xs select-none">
                                        Accepted
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {reg.status === 'confirmed' && (
                            <div className="flex justify-end pt-2">
                              <Link href={`/dashboard/certificates/${reg.id}`}>
                                <Button className="w-full sm:w-auto">
                                  View Certificate
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
