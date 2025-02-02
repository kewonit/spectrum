"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, X, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EventDetails, RegistrationStatusResponse, TeamMember } from "@/app/types/events";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';
import PaymentButton from "@/app/components/PaymentButton";

const createTeamSchema = z.object({
  teamName: z.string()
    .min(3, "Team name must be at least 3 characters")
    .max(50, "Team name must not exceed 50 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Team name can only contain letters, numbers, spaces, hyphens, and underscores"),
});

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address")
});

interface TeamData {
  members: TeamMember[];
  pendingCount: number;
  maxTeamSize: number;
}

export default function RegisterComponent({ eventDetails }: { eventDetails: EventDetails }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatusResponse | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [isTeamStatusLoading, setIsTeamStatusLoading] = useState(true);
  const [removingInvite, setRemovingInvite] = useState<string | null>(null);
  const [isRemovingInvite, setIsRemovingInvite] = useState(false);
  
  const createTeamForm = useForm<z.infer<typeof createTeamSchema>>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { teamName: "" }
  });

  const inviteMemberForm = useForm<z.infer<typeof inviteMemberSchema>>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "" }
  });

  const fetchTeamMembers = useCallback(async () => {
    if (!currentTeamId) return;
    try {
      const response = await fetch(`/api/teams/${currentTeamId}/members`);
      const data = await response.json();
      setTeamData(data);
      setTeamMembers(data.members);
    } catch (error) {
      toast.error("Failed to fetch team members");
    }
  }, [currentTeamId]);

  const checkRegistrationStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/registrations/status?eventId=${eventDetails.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch registration status");
      }
      const data = await response.json();
      setRegistrationStatus(data);
    } catch (error: any) {
      toast.error("Failed to check registration status", {
        description: error.message || "Please try refreshing the page",
      });
    }
  }, [eventDetails.id]);

  const fetchTeamStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/teams/status?eventId=${eventDetails.id}`);
      if (!res.ok) throw new Error("Failed to fetch team status");
      const data = await res.json();
      if (data.hasTeam) {
        setCurrentTeamId(data.teamId);
      }
    } catch (error) {
      console.error("Team status error:", error);
    } finally {
      setIsTeamStatusLoading(false);
    }
  }, [eventDetails.id]);

  useEffect(() => {
    const loadData = async () => {
      await checkRegistrationStatus();
      await fetchTeamStatus();
    };
    loadData();
  }, [checkRegistrationStatus, fetchTeamStatus]);

  useEffect(() => {
    // Set currentTeamId if user is already part of a team
    if (registrationStatus?.type === 'team' && registrationStatus.teamId) {
      setCurrentTeamId(registrationStatus.teamId);
    }
  }, [registrationStatus]);

  useEffect(() => {
    if (currentTeamId) {
      fetchTeamMembers();
    }
  }, [currentTeamId, fetchTeamMembers]);

  const onCreateTeam = async (data: z.infer<typeof createTeamSchema>) => {
    setIsLoading(true);
    try {
      toast.loading("Creating team...");
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventDetails.id,
          teamName: data.teamName,
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create team");
      
      setCurrentTeamId(result.teamId);
      toast.success("Team created successfully!", {
        description: `Team "${data.teamName}" has been created`,
      });
    } catch (error: any) {
      toast.error("Failed to create team", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onInviteMember = async (data: z.infer<typeof inviteMemberSchema>) => {
    if (!currentTeamId) {
      toast.error("No team selected");
      return;
    }
    setIsLoading(true);
    try {
      toast.loading(`Inviting ${data.email}...`);
      const response = await fetch(`/api/teams/${currentTeamId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to invite member");
      }
      
      inviteMemberForm.reset();
      await fetchTeamMembers();
      toast.success("Invitation sent!", {
        description: `An invitation has been sent to ${data.email}`,
      });
    } catch (error: any) {
      toast.error("Failed to invite member", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSoloSubmit = async () => {
    setIsLoading(true);
    try {
      toast.loading("Processing registration...");
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventDetails.id,
          type: "solo"
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }
      
      setShowConfirm(false);
      await checkRegistrationStatus();
      toast.success("Successfully registered!", {
        description: `You're now registered for ${eventDetails.name}`,
      });
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onTeamSubmit = async () => {
    setIsLoading(true);
    try {
      toast.loading("Completing team registration...");
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventDetails.id,
          type: "team",
          teamId: currentTeamId
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Registration failed");

      toast.success("Team registration successful!", {
        description: `Team is now registered for ${eventDetails.name}`
      });
      await checkRegistrationStatus();
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error.message || "Please try again later"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveInvite = async (memberId: string) => {
    setIsRemovingInvite(true);
    try {
      toast.loading("Removing invitation...");
      const response = await fetch(`/api/teams/${currentTeamId}/invite/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove invitation");
      }

      await fetchTeamMembers();
      toast.success("Invitation removed successfully");
    } catch (error: any) {
      toast.error("Failed to remove invitation", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsRemovingInvite(false);
      setRemovingInvite(null);
    }
  };

  const handlePayment = async () => {
    // This will be implemented later
    toast.info("Payment functionality will be implemented soon");
  };

  // If registration status is null or team status is still loading, show loading
  if (registrationStatus === null || isTeamStatusLoading) {
    return <Button disabled className="w-full">Loading...</Button>;
  }

  if (registrationStatus.isRegistered) {
    return (
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-green-800 font-medium">
            {registrationStatus.type === 'solo' 
              ? "You're registered as an individual participant!" 
              : "You're registered as part of a team!"}
          </h3>
          <p className="text-green-600 text-sm mt-1">
            Registration successful. Good luck!
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <p className="text-yellow-800 text-sm flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View your registrations at{' '}
            <Link 
              href="/dashboard/events/registrations" 
              className="font-medium text-yellow-900 hover:text-yellow-700 underline decoration-dashed underline-offset-4"
            >
              /dashboard/events/registrations
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Return early for individual events
  if (eventDetails.max_team_size === 1) {
    if (!registrationStatus?.profile?.is_pccoe_student) {
      return (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              Non-PCCOE students need to complete payment before registration.
            </p>
            <p className="text-yellow-700 font-medium mt-2">
              Registration Fee: ₹100.00
            </p>
          </div>
          
          <PaymentButton
            eventId={eventDetails.id}
            type="solo"
            amount={100}
            onSuccess={checkRegistrationStatus}
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {registrationStatus?.profile?.is_pccoe_student && (
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              As a PCCOE student, you can register directly for this event.
            </p>
          </div>
        )}
        
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent className="sm:max-w-md w-[95%] rounded-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 text-left">
            <DialogHeader className="space-y-3 pb-2 text-left">
              <DialogTitle className="text-xl font-semibold">
                Confirm Registration
              </DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    You&apos;re about to register for{" "}
                    <span className="font-medium text-foreground">
                      {eventDetails.name}
                    </span>{" "}
                    as an individual participant.
                  </div>
                  <div className="bg-green-50/50 border border-green-100 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 text-sm sm:text-base flex items-center gap-2 text-green-800">
                      <svg 
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                      </svg>
                      Important Information
                    </h4>
                    <ul className="list-none text-xs sm:text-sm space-y-2.5 text-green-800">
                      <li className="flex items-start gap-2">
                        <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>By registering, you agree to follow all event guidelines</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Make sure you can attend on the specified dates</span>
                      </li>
                      <li className="flex items-start gap-2 text-red-700">
                        <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>This action cannot be undone or withdrawn</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="w-full sm:w-auto bg-red-50/50 hover:bg-red-100/50 text-red-700 hover:text-red-800 border-red-200/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={onSoloSubmit}
                disabled={isLoading}
                className="w-full sm:w-auto gap-2 bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Registration"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          onClick={() => setShowConfirm(true)} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            "Register Now"
          )}
        </Button>
      </div>
    );
  }

  // Show team management if user has a team
  if (currentTeamId || (registrationStatus.type === 'team' && registrationStatus.teamId)) {
    const acceptedMembers = teamMembers?.filter(m => m.status === 'accepted') || [];
    const pendingMembers = teamMembers?.filter(m => m.status === 'pending') || [];
    const totalRequired = eventDetails.min_team_size;
    const maxAllowed = eventDetails.max_team_size;
    const canRegister = acceptedMembers.length >= totalRequired;
    const totalMembers = acceptedMembers.length + pendingMembers.length;
    const canInvite = totalMembers < maxAllowed;

    // Show payment button for non-PCCOE team leader
    if (registrationStatus?.isLeader && !registrationStatus?.profile?.is_pccoe_student) {
      const nonPccoeCount = teamMembers.filter(m => !m.profile?.is_pccoe_student).length;
      const totalAmount = nonPccoeCount * 100;

      return (
        <div className="space-y-4">
          <Tabs defaultValue="members">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">
                Team Members
                {pendingMembers.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                    {pendingMembers.length} pending
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="invite">
                Invite Members
                {pendingMembers.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                    {totalMembers}/{maxAllowed}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    {acceptedMembers.length} of {totalRequired}-{maxAllowed} team members
                    {acceptedMembers.length < totalRequired && 
                      ` (need ${totalRequired - acceptedMembers.length} more)`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Accepted Members Section */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Current Team Members</h4>
                    <div className="space-y-2">
                      {acceptedMembers.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 border rounded bg-green-50">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">●</span>
                            <div className="flex flex-col">
                              <span className="font-medium">{member.email}</span>
                              {member.name && (
                                <span className="text-sm text-gray-600">
                                  {member.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.isLeader && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Team Leader
                              </span>
                            )}
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Accepted
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Invitations Section */}
                  {pendingMembers.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Pending Invitations</h4>
                      <div className="space-y-2">
                        {pendingMembers.map((member, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 border rounded bg-yellow-50">
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-600">●</span>
                              <div className="flex flex-col">
                                <span className="font-medium">{member.email}</span>
                                {member.name && (
                                  <span className="text-sm text-gray-600">
                                    {member.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                Awaiting Response
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-red-500"
                                onClick={() => setRemovingInvite(member.id)}
                                disabled={isRemovingInvite}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <AlertDialog open={!!removingInvite} onOpenChange={() => setRemovingInvite(null)}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Invitation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this invitation? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex justify-end gap-4 mt-4">
                            <AlertDialogCancel 
                              disabled={isRemovingInvite}
                              onClick={() => setRemovingInvite(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              disabled={isRemovingInvite}
                              onClick={() => {
                                if (removingInvite) {
                                  handleRemoveInvite(removingInvite);
                                }
                              }}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              {isRemovingInvite ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Remove"
                              )}
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invite">
              <Card>
                <CardHeader>
                  <CardTitle>Invite Members</CardTitle>
                  <CardDescription className="space-y-1">
                    {!canInvite ? (
                      <p className="text-yellow-600">Maximum team size reached ({maxAllowed} members)</p>
                    ) : (
                      <>
                        <p>You can add up to {maxAllowed - totalMembers} more members</p>
                        {pendingMembers.length > 0 && (
                          <p className="text-yellow-600 text-xs">
                            {pendingMembers.length} invitation{pendingMembers.length !== 1 ? 's' : ''} have been sent out and are pending.
                          </p>
                        )}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...inviteMemberForm}>
                    <form onSubmit={inviteMemberForm.handleSubmit(onInviteMember)} className="space-y-4">
                      <FormField
                        control={inviteMemberForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input 
                                  placeholder="member@email.com" 
                                  {...field} 
                                  disabled={!canInvite || isLoading}
                                />
                                <Button 
                                  type="submit" 
                                  disabled={!canInvite || isLoading}
                                >
                                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
                                </Button>
                              </div>
                            </FormControl>
                            {!canInvite && (
                              <p className="text-xs text-red-500 mt-1">
                                Cannot send more invites: maximum team size would be exceeded
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              As team leader, you need to complete payment before finalizing registration.
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-yellow-700 font-medium">
                Payment Details:
              </p>
              <ul className="text-sm text-yellow-800">
                <li>• {nonPccoeCount} non-PCCOE members × ₹100 = ₹{totalAmount}</li>
              </ul>
            </div>
          </div>

          <PaymentButton
            eventId={eventDetails.id}
            teamId={currentTeamId || undefined}
            type="team"
            amount={totalAmount}
            disabled={!canRegister}
            onSuccess={checkRegistrationStatus}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Tabs defaultValue="members">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members">
              Team Members
              {pendingMembers.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                  {pendingMembers.length} pending
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="invite">
              Invite Members
              {pendingMembers.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                  {totalMembers}/{maxAllowed}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  {acceptedMembers.length} of {totalRequired}-{maxAllowed} team members
                  {acceptedMembers.length < totalRequired && 
                    ` (need ${totalRequired - acceptedMembers.length} more)`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Accepted Members Section */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Current Team Members</h4>
                  <div className="space-y-2">
                    {acceptedMembers.map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border rounded bg-green-50">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">●</span>
                          <div className="flex flex-col">
                            <span className="font-medium">{member.email}</span>
                            {member.name && (
                              <span className="text-sm text-gray-600">
                                {member.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.isLeader && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              Team Leader
                            </span>
                          )}
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Accepted
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Invitations Section */}
                {pendingMembers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Pending Invitations</h4>
                    <div className="space-y-2">
                      {pendingMembers.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 border rounded bg-yellow-50">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-600">●</span>
                            <div className="flex flex-col">
                              <span className="font-medium">{member.email}</span>
                              {member.name && (
                                <span className="text-sm text-gray-600">
                                  {member.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                              Awaiting Response
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-500"
                              onClick={() => setRemovingInvite(member.id)}
                              disabled={isRemovingInvite}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <AlertDialog open={!!removingInvite} onOpenChange={() => setRemovingInvite(null)}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Invitation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this invitation? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex justify-end gap-4 mt-4">
                          <AlertDialogCancel 
                            disabled={isRemovingInvite}
                            onClick={() => setRemovingInvite(null)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            disabled={isRemovingInvite}
                            onClick={() => {
                              if (removingInvite) {
                                handleRemoveInvite(removingInvite);
                              }
                            }}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {isRemovingInvite ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Remove"
                            )}
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invite">
            <Card>
              <CardHeader>
                <CardTitle>Invite Members</CardTitle>
                <CardDescription className="space-y-1">
                  {!canInvite ? (
                    <p className="text-yellow-600">Maximum team size reached ({maxAllowed} members)</p>
                  ) : (
                    <>
                      <p>You can add up to {maxAllowed - totalMembers} more members</p>
                      {pendingMembers.length > 0 && (
                        <p className="text-yellow-600 text-xs">
                          {pendingMembers.length} invitation{pendingMembers.length !== 1 ? 's' : ''} have been sent out and are pending.
                        </p>
                      )}
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...inviteMemberForm}>
                  <form onSubmit={inviteMemberForm.handleSubmit(onInviteMember)} className="space-y-4">
                    <FormField
                      control={inviteMemberForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="member@email.com" 
                                {...field} 
                                disabled={!canInvite || isLoading}
                              />
                              <Button 
                                type="submit" 
                                disabled={!canInvite || isLoading}
                              >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
                              </Button>
                            </div>
                          </FormControl>
                          {!canInvite && (
                            <p className="text-xs text-red-500 mt-1">
                              Cannot send more invites: maximum team size would be exceeded
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button 
          className="w-full" 
          disabled={!canRegister || isLoading}
          onClick={onTeamSubmit}
        >
          {isLoading
            ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            )
            : (canRegister ? "Complete Registration" : `Need ${totalRequired - acceptedMembers.length} more members to register`)
          }
        </Button>
      </div>
    );
  }

  // Only show team creation form if user isn't part of any team
  if (!currentTeamId && !registrationStatus.teamId) {
    return (
      <>
        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-red-700 text-sm font-medium mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Important Notice
          </p>
          <p className="text-red-600 text-sm">
            Creating a team is a permanent decision. Once created, you won&apos;t be able to join any other teams for this event.
            Please make sure you want to proceed before creating a team.
          </p>
        </div>
        <Form {...createTeamForm}>
          <form onSubmit={createTeamForm.handleSubmit(onCreateTeam)} className="space-y-4">
            <FormField
              control={createTeamForm.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter team name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Team...
                </>
              ) : (
                "Create Team"
              )}
            </Button>
          </form>
        </Form>
      </>
    );
  }

  return null; // Fallback return
}