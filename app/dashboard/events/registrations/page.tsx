'use client';

import { useEffect, useState } from 'react';
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from 'next/link';
import { EventDetails, RegistrationStatus, TeamMember } from '@/app/types/events';
import { Badge } from '@/components/ui/badge';
import { Loader2Icon, CalendarIcon, Clock, MapPin, Users, UserCircle2, School, Phone, QrCode } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { formatDistance, format } from 'date-fns';

// Add custom CSS type for webkit properties
declare module 'react' {
  interface CSSProperties {
    WebkitTouchCallout?: 'none' | 'default';
  }
}

const BRANCH_OPTIONS = {
  cs: "Computer Science",
  cs_aiml: "CS (AI & ML)",
  cs_regional: "CS (Regional)",
  it: "Information Technology",
  entc: "Electronics & Telecomm.",
  mech: "Mechanical",
  civil: "Civil"
} as const;

type BranchKey = keyof typeof BRANCH_OPTIONS;

interface Registration {
  payment_status?: 'pending' | 'success' | 'failed';
  id: string;
  event: EventDetails & {
    img_url: string | null;
  };
  type: 'solo' | 'team';
  status: RegistrationStatus;
  team?: {
    id: string;
    name: string;
    members: TeamMember[];
    isLeader: boolean;
  };
  created_at?: string;
  profile?: {
    phone: string | null;
    college_name: string | null;
    prn: string | null;
    branch: string | null;
    class: string | null;
  };
}

function getOptimizedImageUrl(url: string) {
  try {
    const imageUrl = new URL(url);
    // Drastically reduce width to 200px
    imageUrl.searchParams.set('w', '200');
    // Reduce quality to 30%
    imageUrl.searchParams.set('q', '30');
    // Add blur effect to help with pixelation
    imageUrl.searchParams.set('blur', '2');
    return imageUrl.toString();
  } catch {
    return url;
  }
}

const STAMP_IMAGE_URL = "https://res.cloudinary.com/dfyrk32ua/image/upload/v1738243649/Spectrum/main-icons-2025/confirmed_bomsfc.webp";

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
      
      // Filter out cancelled and failed registrations
      const activeRegistrations = data.registrations.filter((reg: Registration) => 
        reg.status !== 'cancelled' && 
        reg.payment_status !== 'failed'
      );
      
      // Sort remaining registrations by created_at in descending order
      const sortedRegistrations = activeRegistrations.sort((a: Registration, b: Registration) => {
        return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime();
      });
      
      setRegistrations(sortedRegistrations);
    } catch (error: any) {
      toast.error("Failed to load registrations", {
        description: error.message || "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  const activeRegistrationsCount = registrations.length;

  const getBranchName = (branchKey: string | null) => {
    if (!branchKey) return '';
    return BRANCH_OPTIONS[branchKey as BranchKey] || branchKey;
  };

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
    <main className="min-h-screen bg-[#EBE9E0] px-2 py-3 sm:p-4 lg:p-6 xl:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 sm:mb-6">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Events', href: '/dashboard/events' },
              { label: 'Registrations' },
            ]}
            className="text-sm sm:text-base"
          />
        </div>

        <div className="max-w-4xl mx-auto">
          {activeRegistrationsCount > 0 && (
            <div className="space-y-4 mb-6">
              <div className="bg-yellow-50/60 border border-yellow-100 rounded-lg p-3 sm:p-4">
                <p className="text-yellow-700 text-[13px] sm:text-sm flex items-start sm:items-center gap-2.5 sm:gap-3">
                  <svg 
                    className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <span className="leading-tight sm:leading-normal">
                    Registrations are processed instantly. Few registrations may take up to 15 minutes to show up. Refresh to see updates.
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="p-2 sm:p-4 border-2 sm:border-4 border-dashed border-gray-300 rounded-xl sm:rounded-2xl lg:rounded-[2rem]">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
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
                  <div className="space-y-4">
                    <div className="mb-4 bg-yellow-50/80 border border-yellow-200 rounded-lg p-2.5 sm:p-3">
                      <p className="text-yellow-800 flex items-center gap-2.5">
                        <span className="text-base">⚠️</span>
                        <span>Please note: You can register for up to 2 events only. This helps prevent timing conflicts and ensures you can participate fully.</span>
                      </p>
                    </div>
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
                      <div 
                        key={reg.id}
                        className="bg-white border-2 rounded-lg sm:rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300"
                      >
                        {/* Event Header */}
                        <div className="relative">
                          {reg.event.img_url ? (
                            <div className="h-32 sm:h-40 md:h-48 w-full relative">
                              <picture>
                                <source
                                  srcSet={getOptimizedImageUrl(reg.event.img_url)}
                                  type="image/webp"
                                />
                                <source
                                  srcSet={reg.event.img_url}
                                  type="image/jpeg"
                                />
                                <img
                                  src={reg.event.img_url}
                                  alt={reg.event.name}
                                  loading="lazy"
                                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 transform scale-[1.02]"
                                  style={{
                                    imageRendering: 'pixelated',
                                    filter: 'brightness(0.95)',
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNDAwIDIwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=';
                                  }}
                                  decoding="async"
                                  fetchPriority="low"
                                />
                              </picture>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                          ) : (
                            <div className="h-20 sm:h-24 bg-gradient-to-r from-primary/20 to-primary/10" />
                          )}
                          
                          <div className="absolute bottom-0 p-3 sm:p-4">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 text-white">{reg.event.name}</h2>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {format(new Date(reg.event.event_start!), 'MMM d, yyyy')}
                              </span>
                              <Badge className={`text-white
                                ${reg.status === 'confirmed' ? 'bg-green-500' : 
                                  reg.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}
                              >
                                {(reg.status || 'pending').toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-3 sm:space-y-4">
                            {reg.event.whatsapp_url && (
                              <a 
                                href={reg.event.whatsapp_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                              >
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                Join WhatsApp Group
                              </a>
                            )}
                            <div className="flex items-start gap-3">
                              <Clock className="w-5 h-5 text-gray-500 mt-1" />
                              <div>
                                <h3 className="font-medium text-sm text-gray-600">Event Time</h3>
                                <p className="text-sm">
                                  {format(new Date(reg.event.event_start!), 'h:mm a')} - 
                                  {format(new Date(reg.event.event_end!), 'h:mm a')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <Users className="w-5 h-5 text-gray-500 mt-1" />
                              <div>
                                <h3 className="font-medium text-sm text-gray-600">Registration Type</h3>
                                <p className="text-sm">
                                  {reg.type === 'solo' ? 'Individual Event' : 'Team Event'}
                                  {reg.event.max_team_size > 1 && 
                                    ` (${reg.event.min_team_size}-${reg.event.max_team_size} members)`
                                  }
                                </p>
                              </div>
                            </div>

                            {reg.profile && (
                              <>
                                <div className="flex items-start gap-3">
                                  <School className="w-5 h-5 text-gray-500 mt-1" />
                                  <div>
                                    <h3 className="font-medium text-sm text-gray-600">College Details</h3>
                                    <p className="text-sm">{reg.profile.college_name}</p>
                                    <p className="text-xs text-gray-500">
                                      {getBranchName(reg.profile.branch as string)} • {reg.profile.class}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <UserCircle2 className="w-5 h-5 text-gray-500 mt-1" />
                                  <div>
                                    <h3 className="font-medium text-sm text-gray-600">PRN</h3>
                                    <p className="text-sm">{reg.profile.prn}</p>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Team Details Section */}
                          {reg.team && (
                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                              <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                                <Users className="w-4 h-4" />
                                Team: {reg.team.name}
                              </h3>
                              
                              <div className="space-y-2">
                                {reg.team.members.map((member) => (
                                  <div
                                    key={member.id}
                                    className="bg-white rounded-lg p-2.5 sm:p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                  >
                                    <div className="min-w-0">
                                      <p className="font-medium text-sm sm:text-base truncate">{member.name}</p>
                                      <div className="space-y-0.5">
                                        <p className="text-[11px] sm:text-xs text-gray-500 truncate">{member.email}</p>
                                        {member.profile?.prn && (
                                          <p className="text-[11px] sm:text-xs text-gray-600 font-mono">
                                            PRN: {member.profile.prn}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                      {member.isLeader && (
                                        <Badge className="bg-blue-100 text-blue-700">Leader</Badge>
                                      )}
                                      <Badge className={
                                        member.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                        member.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                      }>
                                        {member.status}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="border-t p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50 relative">
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <QrCode className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm text-gray-600">Registration ID</p>
                              <p className="font-mono text-xs sm:text-sm font-medium truncate">{reg.id}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                Registered {formatDistance(new Date(reg.created_at!), new Date(), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          
                          {reg.status === 'confirmed' && (
                            <div 
                              className="absolute right-4 top-1/2 -translate-y-1/2 transform rotate-[-15deg] pointer-events-none"
                              aria-label="Registration Confirmed"
                              role="img"
                            >
                              <picture>
                                <source
                                  srcSet={STAMP_IMAGE_URL}
                                  type="image/webp"
                                />
                                <img
                                  src={STAMP_IMAGE_URL}
                                  alt="Confirmed Registration Stamp"
                                  loading="lazy"
                                  decoding="async"
                                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain opacity-90 select-none"
                                  style={{
                                    touchAction: 'none',
                                    WebkitTouchCallout: 'none',
                                    userSelect: 'none',
                                  }}
                                  onContextMenu={(e) => e.preventDefault()}
                                  onDragStart={(e) => e.preventDefault()}
                                />
                              </picture>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
