"use client";
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompleteProfilePopup } from '@/components/CompleteProfilePopup'; // new import

interface Invite {
  id: string;
  team_id: string;
  invitation_status: string;
  created_at: string;
  teams: {
    team_name: string;
    events: {
      id: string;
      name: string;
      event_type: string;
      min_team_size: number;
      max_team_size: number;
    };
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

// Add helper and state for user profile
const isProfileComplete = (profile: any) => {
  return profile && profile.full_name && profile.email && profile.phone &&
         profile.college_name && profile.prn && profile.branch &&
         profile.class && profile.gender;
};

export default function AcceptPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [rejectInvite, setRejectInvite] = useState<Invite | null>(null);
  const [errorAlert, setErrorAlert] = useState<{ title: string; message: string } | null>(null);

  // New state to fetch user data for profile completeness check
  const [userData, setUserData] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);

  const pendingInvites = invites.filter(invite => invite.invitation_status === 'pending');
  const historyInvites = invites.filter(invite => invite.invitation_status !== 'pending');

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const res = await fetch("/api/teams/invites");
      if (!res.ok) {
        throw new Error("Failed to fetch invites");
      }
      const data = await res.json();
      setInvites(data.invites);
    } catch (err: any) {
      toast.error("Failed to load invites", {
        description: err.message || "Please try refreshing the page",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user');
        const data = await res.json();
        setUserData(data);
      } catch (error: any) {
        toast.error("Failed to load user profile", { description: error.message });
      } finally {
        setUserLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleInviteAction = async (invite: Invite, action: 'accept' | 'reject') => {
    setProcessing(invite.team_id);
    
    try {
      const res = await fetch(`/api/teams/${invite.team_id}/members`, {
        method: "PATCH",
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error === 'server_error') {
          // Show toast for immediate feedback
          toast.error("Server Error", {
            description: "An unexpected error occurred",
            action: {
              label: "Retry",
              onClick: () => handleInviteAction(invite, action)
            }
          });

          // Show detailed error dialog
          setErrorAlert({
            title: "Server Error",
            message: "Something went wrong! This could be because:\n\n" +
              "• You're trying to accept an invite you previously rejected\n" +
              "• Our server is having issues (just like us)\n" +
              "• Something unexpected happened (probably your fault)\n\n" +
              "Please try again or contact support if the issue persists."
          });
          
          setSelectedInvite(null);
          setRejectInvite(null);
          return;
        }

        // Handle other error cases...
        switch (data.error) {
          case 'category_mismatch':
            // First show the error toast
            toast.error("Team Categories", {
              description: data.message,
              duration: 5000,
              action: {
                label: "Learn More",
                onClick: () => {
                  toast.info("About Team Categories", {
                    description: "To ensure fair competition, PCCOE students can only join PCCOE teams and non-PCCOE participants can only join non-PCCOE teams.",
                    duration: 8000,
                  });
                }
              }
            });
            
            // Show error dialog using the backend message
            setErrorAlert({
              title: "Important Team Rule",
              message: data.message,
            });
            break;

          case 'team_not_found':
            toast.error("Team Not Found", {
              description: "This team no longer exists or was deleted",
              action: {
                label: "View Events",
                onClick: () => window.location.href = '/dashboard/events'
              }
            });
            break;

          case 'existing_team':
            // First show the error toast
            toast.error("Already in a team", {
              description: data.message,
              action: {
                label: "View Events",
                onClick: () => window.location.href = '/dashboard/events'
              }
            });
            
            // Show in the error dialog with clearer explanation
            setErrorAlert({
              title: "Cannot Join Multiple Teams",
              message: "You are already a member of a team for this event. To maintain fair competition, participants can only be part of one team per event."
            });
            break;
          
          case 'team_full':
            // First show the error toast
            toast.error("Team is Full", {
              description: data.message,
              action: {
                label: "Find Teams",
                onClick: () => window.location.href = '/dashboard/events'
              }
            });
            
            // Show in the error dialog with clearer explanation
            setErrorAlert({
              title: "Team Registration Complete",
              message: "This team has already reached its maximum capacity and is no longer accepting new members.\n\nYou can:\n\n• Create your own team\n• Join another team that's still accepting members"
            });
            break;
          
          case 'registration_closed':
            toast.error("Registration Closed", {
              description: data.message,
              action: {
                label: "View Event",
                onClick: () => window.location.href = `/events/${invite.teams.events.id}`
              }
            });
            break;

          case 'team_registered':
            // First show the error toast
            toast.error("Team Already Registered", {
              description: data.message,
              duration: 5000
            });
            
            // Show in the error dialog with clearer explanation
            setErrorAlert({
              title: "Registration Already Complete",
              message: "This team has already completed their registration process and cannot accept new members.\n\nYou can:\n\n• Create your own team\n• Join another team that hasn't registered yet"
            });
            break;
          
          default:
            toast.error("Failed to process invitation", {
              description: data.message || "Please try again later"
            });
        }
        
        setSelectedInvite(null);
        setRejectInvite(null);
        return;
      }
      
      if (action === 'accept') {
        toast.success("Successfully joined team!", {
          description: `You are now a member of ${invite.teams.team_name}`,
          action: {
            label: "View Team",
            onClick: () => window.location.href = `/dashboard/events/teams/${invite.team_id}`
          }
        });
      } else {
        toast.success("Invitation rejected", {
          description: `You've declined to join ${invite.teams.team_name}`
        });
      }

      setInvites((prev) => prev.filter((inv) => inv.team_id !== invite.team_id));
      setSelectedInvite(null);
      setRejectInvite(null);
    } catch (err: any) {
      toast.error("Error processing invitation", {
        description: "An unexpected error occurred. Please try again.",
        action: {
          label: "Retry",
          onClick: () => handleInviteAction(invite, action)
        }
      });
    } finally {
      setProcessing(null);
    }
  };

  // Update status badge colors and text
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Awaiting Response';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EBE9E0] p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Events', href: '/dashboard/events' },
              { label: 'Invitations' },
            ]}
            className="mb-4"
          />
          <div className="flex items-center justify-center h-[60vh]">
            <div className="flex items-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <p className="text-gray-500">Loading invites...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!invites.length) {
    return (
      <main className="min-h-screen bg-[#EBE9E0] p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Events', href: '/dashboard/events' },
              { label: 'Invitations' },
            ]}
            className="mb-4"
          />
          <div className="p-2 sm:p-4 border-4 border-dashed border-gray-300 rounded-[2rem]">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-center">No Pending Invites</CardTitle>
                <CardDescription className="text-center">
                  You don&apos;t have any team invitations at the moment
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EBE9E0] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Events', href: '/dashboard/events' },
            { label: 'Invitations' },
          ]}
          className="mb-6"
        />
        
        <div className="p-2 sm:p-4 border-4 border-dashed border-gray-300 rounded-[2rem]">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-4 sm:p-6">
            <h1 className="text-2xl font-bold mb-6">Team Invitations</h1>
            
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="pending">
                  Pending Invites
                  {pendingInvites.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                      {pendingInvites.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history">
                  History
                  {historyInvites.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {historyInvites.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-0">
                {pendingInvites.length > 0 ? (
                  <div className="grid gap-4">
                    {pendingInvites.map((invite) => (
                      <Card 
                        key={invite.team_id} 
                        className="overflow-hidden transition-all hover:shadow-lg relative"
                      >
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-6 bg-[#EBE9E0] rounded-r-full"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-6 bg-[#EBE9E0] rounded-l-full"></div>
                        
                        <CardHeader className="border-b bg-gray-50/80">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{invite.teams.events.name}</CardTitle>
                            <span className={`text-xs ${getStatusBadgeClass(invite.invitation_status)} px-2 py-1 rounded`}>
                              {getStatusText(invite.invitation_status)}
                            </span>
                          </div>
                          <CardDescription className="font-medium">
                            Invited to join {invite.teams.team_name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                          <div className="grid gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <UserPlus className="h-4 w-4 text-blue-600" />
                              <span>Invited by {invite.profiles.full_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="h-4 w-4 text-blue-600" />
                              <span>Team size: {invite.teams.events.min_team_size}-{invite.teams.events.max_team_size} members</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span>Invited {format(new Date(invite.created_at), 'PPP')}</span>
                            </div>
                          </div>
                          <div className="border-t border-dashed border-gray-200 my-4 -mx-6"></div>
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600"
                              onClick={() => setSelectedInvite(invite)}
                              disabled={!!processing}
                            >
                              {processing === invite.team_id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                'Accept'
                              )}
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1 hover:bg-red-50 hover:text-red-600"
                              onClick={() => setRejectInvite(invite)}
                              disabled={!!processing}
                            >
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">No Pending Invites</CardTitle>
                      <CardDescription className="text-center">
                        You don&apos;t have any pending team invitations
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {historyInvites.length > 0 ? (
                  <div className="grid gap-4">
                    {historyInvites.map((invite) => (
                      <Card 
                        key={invite.team_id} 
                        className="overflow-hidden transition-all relative opacity-75 hover:opacity-100"
                      >
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-6 bg-[#EBE9E0] rounded-r-full"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-6 bg-[#EBE9E0] rounded-l-full"></div>
                        
                        <CardHeader className="border-b bg-gray-50/80">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{invite.teams.events.name}</CardTitle>
                            <span className={`text-xs ${getStatusBadgeClass(invite.invitation_status)} px-2 py-1 rounded`}>
                              {getStatusText(invite.invitation_status)}
                            </span>
                          </div>
                          <CardDescription className="font-medium">
                            {invite.teams.team_name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <UserPlus className="h-4 w-4 text-blue-600" />
                              <span>From {invite.profiles.full_name}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">No Invitation History</CardTitle>
                      <CardDescription className="text-center">
                        Your past invitations will appear here
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <AlertDialog open={!!selectedInvite} onOpenChange={() => setSelectedInvite(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Accept Team Invitation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to join &quot;{selectedInvite?.teams.team_name}&quot; for {selectedInvite?.teams.events.name}?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedInvite && handleInviteAction(selectedInvite, 'accept')}
                disabled={!!processing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {processing ? 'Processing...' : 'Accept Invite'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!rejectInvite} onOpenChange={() => setRejectInvite(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">Reject Team Invitation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject the invitation to join &quot;{rejectInvite?.teams.team_name}&quot;?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => rejectInvite && handleInviteAction(rejectInvite, 'reject')}
                disabled={!!processing}
                className="bg-red-600 hover:bg-red-700"
              >
                {processing ? 'Processing...' : 'Reject Invite'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!errorAlert} onOpenChange={() => setErrorAlert(null)}>
          <AlertDialogContent className="max-w-md mx-auto">
            <AlertDialogHeader className="space-y-3">
              <AlertDialogTitle className="text-xl font-semibold text-red-600">
                {errorAlert?.title}
              </AlertDialogTitle>
              
              <AlertDialogDescription asChild>
                {errorAlert?.title === "Important Team Rule" ? (
                  <div>
                    {errorAlert.message}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-base text-gray-600 space-y-4">
                      <p>Something went wrong! This could be because:</p>
                      <ul className="list-disc pl-4 space-y-2">
                        <li>You&apos;re trying to accept an invite you previously rejected</li>
                        <li>Our server is having issues (just like us)</li>
                        <li>Something unexpected happened (probably your fault)</li>
                      </ul>
                      <p>Please try again or contact support if the issue persists.</p>
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogAction
                onClick={() => setErrorAlert(null)}
                className="bg-red-600 hover:bg-red-700 text-white px-8"
              >
                Got it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {/* Render global popup if profile is incomplete */}
      { !userLoading && userData && !isProfileComplete(userData.profile) && (
          <CompleteProfilePopup 
            profile={userData.profile} 
            onProfileUpdate={async () => {
              // Re-fetch user data to update profile after update
              const res = await fetch('/api/user');
              const data = await res.json();
              setUserData(data);
            }} 
          />
      )}
    </main>
  );
}
