"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function AcceptPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [rejectInvite, setRejectInvite] = useState<Invite | null>(null);
  const [errorAlert, setErrorAlert] = useState<{ title: string; message: string } | null>(null);

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

  const handleInviteAction = async (invite: Invite, action: 'accept' | 'reject') => {
    setProcessing(invite.team_id);
    
    try {
      const res = await fetch(`/api/teams/${invite.team_id}/members`, {
        method: "PATCH",
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error === 'existing_team') {
          setErrorAlert({
            title: "Team Membership Conflict",
            message: data.message || "You are already part of a team for this event"
          });
        } else {
          setErrorAlert({
            title: `Failed to ${action} invitation`,
            message: data.message || "Please try again later"
          });
        }
        setSelectedInvite(null);
        setRejectInvite(null);
        return;
      }
      
      toast.success(`Successfully ${action}ed the invitation!`, {
        description: action === 'accept' 
          ? `You've joined ${invite.teams.team_name}`
          : `You've rejected the invitation to ${invite.teams.team_name}`,
      });
      setInvites((prev) => prev.filter((inv) => inv.team_id !== invite.team_id));
      setSelectedInvite(null);
      setRejectInvite(null);
    } catch (err: any) {
      setErrorAlert({
        title: `Error ${action}ing invitation`,
        message: err.message || "An unexpected error occurred. Please try again."
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">{errorAlert?.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {errorAlert?.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => setErrorAlert(null)}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Ok, got it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
