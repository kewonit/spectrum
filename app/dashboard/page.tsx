'use client';

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import { toast } from "sonner";
import { Pencil, Mail, Phone, GraduationCap, LogOut, ChevronRight, QrCode, Download, Calendar, Clock, CheckCircle, XCircle, MapPin } from "lucide-react";
import { CompleteProfilePopup } from '@/components/CompleteProfilePopup';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { Card } from "@/components/ui/card";
import { AttendanceCardDialog } from '@/components/AttendanceCardDialog';
import { format } from 'date-fns';

// Add COLLEGE_OPTIONS constant
const COLLEGE_OPTIONS = {
  pccoe: "Pimpri Chinchwad College of Engineering, Pune",
  pccoer: "Pimpri Chinchwad College of Engineering & Research, Ravet",
  pcu: "Pimpri Chinchwad University",
  nutan: "Nutan Maharashtra Institute of Engineering & Technology, Pune",
  nmit: "Nutan College of Engineering & Research (NCER)",
  ait: "Army Institute of Technology",
  aissms: "All India Shri Shivaji Memorial Society's College of Engineering",
  bvp: "Bharati Vidyapeeth College of Engineering",
  coep: "College of Engineering Pune",
  cummins: "Cummins College of Engineering",
  dyp: "Dr. D.Y. Patil Institute of Technology, Akurdi",
  iiit: "Indian Institute of Information Technology, Pune",
  jspm: "JSPM's Rajarshi Shahu College of Engineering",
  mit: "MIT World Peace University (MIT-WPU)",
  mit_adt: "MIT Art, Design and Technology University",
  pict: "SCTR'S Pune Institute of Computer Technology",
  pvg: "PVG's College of Engineering and Technology",
  scoe: "Sinhgad College of Engineering",
  sit_lavle: "Symbiosis Institute of Technology, Lavle",
  viit: "BRACT's, Vishwakarma Institute of Information Technology",
  vit: "Vishwakarma Institute of Technology",
} as const;

// New Attendance interface
interface AttendanceRecord {
  id: string;
  is_present: boolean;
  marked_at: string;
  verification_method: string | null;
  events: {
    id: string;
    name: string;
    description: string | null;
    event_type: 'solo' | 'fixed_team' | 'variable_team';
    event_start: string | null;
    event_end: string | null;
    img_url: string | null;
    whatsapp_url: string | null;
  };
  registrations: {
    id: string;
    event_id: string;
    registration_status: string;
  };
  staff: {
    id: string;
    full_name: string;
  } | null;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAttendanceCard, setShowAttendanceCard] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch user data');
        }
        
        setUserData(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.message);
        toast.error("Failed to load user data", {
          description: err.message || "Please try again later",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setAttendanceLoading(true);
        const response = await fetch('/api/user/attendance');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch attendance data');
        }
        
        setAttendanceData(data.attendance || []);
      } catch (err: any) {
        console.error('Error fetching attendance data:', err);
        // We don't set error state or show toast here to avoid disrupting the main UI
      } finally {
        setAttendanceLoading(false);
      }
    };

    if (userData?.profile?.id) {
      fetchAttendanceData();
    }
  }, [userData?.profile?.id]);

  const refreshUserData = async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user data');
      }
      
      setUserData(data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to refresh user data:', error);
      toast.error("Failed to refresh data", {
        description: "Your changes may not be reflected. Please refresh the page.",
      });
    }
  };

  // Helper to check required profile details
  const isProfileComplete = (profile: any) => {
    return profile && profile.full_name && profile.email && profile.phone &&
      profile.college_name && profile.prn && profile.branch &&
      profile.class && profile.gender;
  };

  // Enhanced formatDate function with optional compact parameter
  const formatDate = (dateString: string | null, compact = false) => {
    if (!dateString) return 'N/A';
    try {
      return format(
        new Date(dateString), 
        compact ? 'dd MMM, h:mm a' : 'dd MMM yyyy, h:mm a'
      );
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <>
      <div className="min-h-screen bg-[#EBE9E0] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb skeleton */}
          <div className="h-6 w-32 bg-gray-200 rounded mb-6 animate-pulse" />
          
          {/* Quick Action Cards skeleton */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-sm">
                <div className="h-6 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded mb-4 animate-pulse" />
                <div className="h-9 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Main card skeleton */}
          <div className="p-2 sm:p-4 border-4 border-dashed border-gray-300 rounded-3xl">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden relative p-4 sm:p-6 lg:p-8">
              <div className="mb-6">
                <div className="h-8 w-64 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
              </div>
              
              {/* Tabs skeleton */}
              <div className="border-b mb-4">
                <div className="flex gap-4 mb-[-2px]">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </div>
              
              {/* Content skeleton */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 w-full bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (error || !userData) {
    return (
      <>
      <div className="min-h-screen bg-[#EBE9E0] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Dashboard</h1>
          <p className="mb-6 text-gray-600">Please log in to access your dashboard</p>
          <Link href="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Log in
            </Button>
          </Link>
        </div>
      </div>
      </>
    );
  }

  const { profile } = userData;

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.loading("Signing out...");
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });
      if (response.ok) {
        toast.success("Successfully signed out");
        router.push('/');
      } else {
        throw new Error('Failed to sign out');
      }
    } catch (error) {
      toast.error("Failed to sign out", {
        description: "Please try again",
      });
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
    <main className="min-h-screen bg-[#EBE9E0]">
      <TooltipProvider>
        <div className="w-full max-w-screen-xl mx-auto p-4 sm:px-6 lg:p-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard' },
            ]}
            className="mb-6"
          />

          {/* Enhanced User Profile Header with improved styling */}
          <div className="relative mb-8 sm:mb-10 mt-2">
            {/* Background pattern */}
            <div className="absolute inset-0 -m-2 sm:-m-4">
              <div className="w-full h-full border-4 border-dashed border-gray-300/70 rounded-3xl" />
            </div>

            {/* Card container with improved shadow */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full" />
                
                <div className="p-5 sm:p-7">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Profile Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                          {profile?.full_name || 'Anonymous User'}
                        </h1>
                        {!profile?.full_name && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="h-5 w-5 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Please complete your profile</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                          <Tooltip>
                            <TooltipTrigger className="max-w-[300px] truncate text-left">
                              <span className="text-sm sm:text-base text-gray-600">
                                {profile?.email || 'Email not provided'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{profile?.email || 'Email not provided'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                          {profile?.phone ? (
                            <span className="text-sm sm:text-base text-gray-600">
                              {profile.phone}
                            </span>
                          ) : (
                            <span className="text-sm sm:text-base text-gray-400 italic">
                              Phone number not added
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="pt-1 flex items-center gap-2 w-full pr-4">
                        <GraduationCap className="h-4 w-4 text-blue-500 shrink-0" />
                        {profile?.college_name ? (
                          <Tooltip>
                            <TooltipTrigger className="w-full truncate text-left">
                              <p className="text-sm sm:text-base font-medium text-blue-600">
                                {Object.values(COLLEGE_OPTIONS).includes(profile.college_name)
                                  ? profile.college_name
                                  : `${profile.college_name} (Other)`}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{profile.college_name}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-sm sm:text-base text-gray-400 italic">
                            College not specified
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push('/dashboard/profile/edit')}
                          className={`h-9 transition-colors duration-200 group w-full sm:w-auto
                            ${!isProfileComplete(profile) 
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300'
                            }`}
                        >
                          <Pencil className="h-4 w-4 mr-2 shrink-0" />
                          <span>{!isProfileComplete(profile) ? 'Complete Profile' : 'Edit Profile'}</span>
                          <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                        </Button>

                        {/* Add Download Attendance Card button when profile is complete */}
                        {isProfileComplete(profile) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAttendanceCard(true)}
                            className="h-9 transition-colors duration-200 group w-full sm:w-auto bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700 border-purple-200 hover:border-purple-300"
                          >
                            <Download className="h-4 w-4 mr-2 shrink-0" />
                            <span>Attendance Card</span>
                          </Button>
                        )}
                        
                        <form onSubmit={handleSignOut} className="flex-1 sm:flex-initial">
                          <Button 
                            type="submit" 
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 transition-colors duration-200 w-full sm:w-auto"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>Sign out</span>
                          </Button>
                        </form>
                      </div>
                    </div>

                    {/* QR Code - Hidden on mobile, visible on desktop */}
                    <div className="hidden lg:flex flex-col items-center justify-center border-l border-gray-200 pl-6 min-w-[180px]">
                      {profile?.id ? (
                        <>
                          <div className="bg-white p-2 rounded-lg shadow-sm mb-2">
                            <QRCodeSVG
                              value={profile.id}
                              size={140}
                              level="H"
                              bgColor="#ffffff"
                              fgColor="#000000"
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-700">Attendance QR</p>
                            <p className="text-xs text-gray-500 mt-1">Scan for event check-in</p>
                          </div>
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => setShowAttendanceCard(true)}
                            className="text-blue-600 mt-1 h-auto p-1"
                          >
                            Download Card
                          </Button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[140px]">
                          <QrCode className="h-10 w-10 text-gray-300 mb-2" />
                          <p className="text-xs text-gray-400 text-center">
                            Complete profile to<br />generate attendance QR
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile QR Code Card - Shown on mobile, hidden on desktop */}
          <div className="lg:hidden mb-6">
            <Card className="overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium text-blue-700">Attendance QR Code</h3>
              </div>
              
              <div className="p-5 flex flex-col items-center">
                {profile?.id ? (
                  <>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-3">
                      <QRCodeSVG
                        value={profile.id}
                        size={160}
                        level="H"
                        bgColor="#ffffff"
                        fgColor="#000000"
                      />
                    </div>
                    <p className="text-sm text-gray-700 text-center mt-1">
                      Present this QR code for event check-in
                    </p>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      Keep this code private and only share at official event check-ins
                    </p>
                    
                    {/* Add download button for mobile */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAttendanceCard(true)}
                      className="mt-4 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Attendance Card
                    </Button>
                  </>
                ) : (
                  <div className="py-8 flex flex-col items-center">
                    <div className="bg-gray-50 p-6 rounded-full mb-4">
                      <QrCode className="h-12 w-12 text-gray-300" />
                    </div>
                    <p className="text-gray-600 text-center">
                      Complete your profile to generate your attendance QR code
                    </p>
                    <Button
                      variant="outline" 
                      size="sm"
                      className="mt-4 bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 border-amber-200"
                      onClick={() => router.push('/dashboard/profile/edit')}
                    >
                      Complete Profile
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Rest of the content */}
          <div className="space-y-6">
            {/* Quick Actions Grid - adjusted spacing */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white/80 backdrop-blur p-6 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h2 className="font-semibold text-lg mb-2">Events</h2>
                <p className="text-sm text-gray-600 mb-4">View and manage available events.</p>
                <Button
                  variant="outline"
                  className="w-full bg-purple-50 hover:bg-purple-100 border-purple-200"
                  onClick={() => router.push('/dashboard/events')}
                >
                  View Events
                </Button>
              </div>
              <div className="bg-white/80 backdrop-blur p-6 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h2 className="font-semibold text-lg mb-2">Check Registration</h2>
                <p className="text-sm text-gray-600 mb-4">View or verify active registrations.</p>
                <Button
                  variant="outline"
                  className="w-full bg-blue-50 hover:bg-blue-100 border-blue-200"
                  onClick={() => router.push('/dashboard/events/registrations')}
                >
                  View Registrations
                </Button>
              </div>
              <div className="bg-white/80 backdrop-blur p-6 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h2 className="font-semibold text-lg mb-2">Accept Invites</h2>
                <p className="text-sm text-gray-600 mb-4">Review and accept pending invitations.</p>
                <Button
                  variant="outline"
                  className="w-full bg-green-50 hover:bg-green-100 border-green-200"
                  onClick={() => router.push('/dashboard/events/accept')}
                >
                  Manage Invites
                </Button>
              </div>
            </div>

            {/* Payment Card - adjusted spacing */}
            <div className="my-6">
              <div className="bg-white/80 backdrop-blur p-6 sm:p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-lg">Payments</h2>
                    <p className="text-sm text-gray-600">View and manage your payments</p>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-orange-50 hover:bg-orange-100 border-orange-200"
                    onClick={() => router.push('/dashboard/events/payment')}
                  >
                    Manage Payments
                  </Button>
                </div>
              </div>
            </div>

            {/* Info Box - Updated message */}
            <div className="mt-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-4 md:p-5 mt-4 sm:mt-6 mx-4 sm:mx-0">
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm text-yellow-800 leading-relaxed">
                    Thank you for using our platform. To ensure the best possible experience:
                  </p>
                  <div className="space-y-3 sm:space-y-2 mt-2">
                    <div className="text-xs sm:text-sm text-yellow-800">
                      <p className="font-medium mb-1">• For Queries, payment issues, or other concerns:</p>
                      <a href="mailto:pccoe.spectrum.25@gmail.com" 
                        className="block pl-3 font-medium text-yellow-700 hover:text-yellow-900 break-all">
                        pccoe.spectrum.25@gmail.com
                      </a>
                    </div>
                    <div className="text-xs sm:text-sm text-yellow-800">
                      <p className="font-medium mb-1">• For Website, or data-related bugs:</p>
                      <a href="mailto:kartik.kulloli23@pccoepune.org" 
                        className="block pl-3 font-medium text-yellow-700 hover:text-yellow-900 break-all">
                        kartik.kulloli23@pccoepune.org
                      </a>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-yellow-800 italic mt-3 sm:mt-2">
                    For critical bugs or security vulnerabilities, please report them immediately with [COOKED] in the title.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Render global popup if profile is incomplete */}
          {!isProfileComplete(profile) && (
            <CompleteProfilePopup 
              profile={profile} 
              onProfileUpdate={() => {
                refreshUserData();
              }} 
            />
          )}

          {/* Render attendance card dialog */}
          <AttendanceCardDialog
            profile={profile}
            isOpen={showAttendanceCard}
            onClose={() => setShowAttendanceCard(false)}
          />
        </div>
      </TooltipProvider>
    </main>
    </>
  );
}