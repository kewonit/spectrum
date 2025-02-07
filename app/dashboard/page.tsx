'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import { toast } from "sonner";
import { Loader2, Pencil, X } from "lucide-react";
import { ProfileForm } from "./components/profile-form";
import { ProfileView } from "./components/profile-view";
import { CompleteProfilePopup } from '@/components/CompleteProfilePopup'; // new import

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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

  if (loading) {
    return (
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
    );
  }

  if (error || !userData) {
    return (
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
    <main className="min-h-screen bg-[#EBE9E0] overflow-auto">
      <div className="w-full max-w-screen-xl mx-auto p-4 sm:px-6 lg:p-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dashboard' },
          ]}
          className="mb-6"
        />
        
        {/* Quick Action Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4 sm:mb-6 px-4 sm:px-0">
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

        {/* Payment Card - Full Width */}
        <div className="mb-4 sm:mb-6 px-4 sm:px-0">
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

        <div className="p-4 sm:p-4 border-4 border-dashed border-gray-300 rounded-3xl">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden relative">
            {/* Dots for ticket effect */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full"></div>

            <div className="px-6 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10">
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Welcome back, {profile?.full_name || 'User'}!
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base mt-2">
                    Manage your profile and check your event registrations
                  </p>
                </div>
                {isEditing ? (
                  <>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="icon"
                      className="sm:hidden h-10 w-10 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50/50"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="lg"
                      className="hidden sm:inline-flex shrink-0 px-6 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50/50"
                    >
                      <X className="h-5 w-5 mr-2" />
                      <span className="font-medium">Close Editor</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="icon"
                      className="sm:hidden h-10 w-10 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 hover:bg-green-50/50"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="lg"
                      className="hidden sm:inline-flex shrink-0 px-6 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 hover:bg-green-50/50"
                    >
                      <Pencil className="h-5 w-5 mr-2" />
                      <span className="font-medium">Edit Profile</span>
                    </Button>
                  </>
                )}
              </div>

              <div className="space-y-6 p-2 sm:p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                {isEditing ? (
                  <ProfileForm 
                    profile={userData.profile} 
                    onUpdate={() => {
                      refreshUserData();
                      setIsEditing(false);
                    }} 
                  />
                ) : (
                  <ProfileView 
                    profile={userData.profile} 
                    onEditClick={() => setIsEditing(true)}
                  />
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <form onSubmit={handleSignOut}>
                  <Button 
                    type="submit" 
                    variant="destructive"
                    className="w-full sm:w-auto"
                  >
                    Sign out
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-4 md:p-5 mt-4 sm:mt-6 mx-4 sm:mx-0">
          <div className="space-y-2 sm:space-y-3">
            <p className="text-xs sm:text-sm text-yellow-800 leading-relaxed">
              We&apos;re constantly improving our platform. 
              <span className="hidden sm:inline">&nbsp;</span>
              <span className="block sm:inline mt-1 sm:mt-0">If you encounter any issues:</span>
            </p>
            <div className="space-y-3 sm:space-y-2 mt-2">
              <div className="text-xs sm:text-sm text-yellow-800">
                <p className="font-medium mb-1">• For API endpoints, backend, or data-related bugs:</p>
                <a href="mailto:kartik.kulloli23@pccoepune.org" 
                   className="block pl-3 font-medium text-yellow-700 hover:text-yellow-900 break-all">
                  kartik.kulloli23@pccoepune.org
                </a>
              </div>
              <div className="text-xs sm:text-sm text-yellow-800">
                <p className="font-medium mb-1">• For UI/UX issues, visual glitches, or frontend concerns:</p>
                <a href="mailto:mayank.kadam23@pccoepune.org" 
                   className="block pl-3 font-medium text-yellow-700 hover:text-yellow-900 break-all">
                  mayank.kadam23@pccoepune.org
                </a>
              </div>
              <div className="text-xs sm:text-sm text-yellow-800">
                <p className="font-medium mb-1">• For other concerns:</p>
                <a href="mailto:ved.jadhav24@pccoepune.org" 
                   className="block pl-3 font-medium text-yellow-700 hover:text-yellow-900 break-all">
                  ved.jadhav24@pccoepune.org
                </a>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-yellow-800 italic mt-3 sm:mt-2">
              For critical bugs or security vulnerabilities, please report them immediately with [COOKED] in the title.
            </p>
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
      </div>
    </main>
  );
}