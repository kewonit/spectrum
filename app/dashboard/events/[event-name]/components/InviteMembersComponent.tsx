"use client";
import { useState, useCallback, useMemo, useEffect } from "react"; // Update import
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from 'next/link';
import { toast } from "sonner";
import { Loader2, X, Search, UserPlus, XCircleIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamMember } from "@/app/types/events";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserDetailsForm } from "@/app/components/UserDetailsForm";
import { debounce } from "@/app/utils/debounce";

// Add new schema for non-registered users
const nonRegisteredUserSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  full_name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  phone: z.string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .min(1, "Phone number is required"),
  college_name: z.string()
    .min(2, "College name must be at least 2 characters")
    .max(100, "College name must not exceed 100 characters"),
  prn: z.string()
    .min(2, "PRN must be at least 2 characters")
    .max(20, "PRN must not exceed 20 characters"),
  branch: z.string()
    .min(2, "Branch must be at least 2 characters")
    .max(50, "Branch must not exceed 50 characters"),
  class: z.string()
    .min(1, "Class/Division is required")
    .max(20, "Class/Division must not exceed 20 characters"),
  gender: z.string()
    .min(1, "Gender is required")
    .refine(val => ['male', 'female', 'other'].includes(val), "Invalid gender selection"),
});

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address")
});

interface InviteMembersComponentProps {
  currentTeamId: string | null;  // Change this line to allow null
  canInvite: boolean;
  maxAllowed: number;
  totalMembers: number;
  pendingMembers: TeamMember[];
  onInviteSuccess: () => Promise<void>;
}

export default function InviteMembersComponent({
  currentTeamId,
  canInvite,
  maxAllowed,
  totalMembers,
  pendingMembers,
  onInviteSuccess
}: InviteMembersComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [removingInvite, setRemovingInvite] = useState<string | null>(null);
  const [isRemovingInvite, setIsRemovingInvite] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [activeTab, setActiveTab] = useState("invite");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);
  const [confirmInvite, setConfirmInvite] = useState<{ id: string; email: string } | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showAlreadyTeamPopup, setShowAlreadyTeamPopup] = useState(false);

  const inviteMemberForm = useForm<z.infer<typeof inviteMemberSchema>>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "" }
  });

  const nonRegisteredForm = useForm<z.infer<typeof nonRegisteredUserSchema>>({
    resolver: zodResolver(nonRegisteredUserSchema),
  });


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

      await onInviteSuccess();
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

  // Move the search function outside of debounce for better dependency handling
  const searchUsers = useCallback(async (searchEmail: string) => {
    if (!searchEmail) {
      setSearchResults([]);
      setShowNewUserForm(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?email=${encodeURIComponent(searchEmail)}`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data);
        // Properly validate email before setting form visibility
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchEmail);
        setShowNewUserForm(data.length === 0 && isValidEmail);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);  // Empty dependency array since setSearchResults and setIsSearching are stable

  // Create debounced version of the search function
  const debouncedSearch = useMemo(
    () => debounce(searchUsers, 300),
    [searchUsers] // Only recreate debounced function if searchUsers changes
  );

  // Clean up the debounced function on component unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.(); // Cancel any pending debounced calls
    };
  }, [debouncedSearch]);

  const handleInviteExisting = async (userId: string, email: string) => {
    if (!currentTeamId) return;
    
    const toastId = toast.loading("Sending invitation...");
    setInvitingUserId(userId);
    try {
      const response = await fetch(`/api/teams/${currentTeamId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId })
      });
      const data = await response.json();
      toast.dismiss(toastId);
      if (!response.ok) {
        if (data.error && data.error.includes("Member is already part of a team")) {
          // Trigger popup with updated message
          setShowAlreadyTeamPopup(true);
        } else {
          toast.error(data.message || "Invitation failed");
        }
      } else {
        toast.success("Invitation sent successfully");
        // Reset UI state on success
        resetForms();
        setConfirmInvite(null);
        setInvitingUserId(null);
        await onInviteSuccess();
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error("Failed to send invitation");
      setInvitingUserId(null);
    }
  };

  // Extract watched email to avoid complex expression in dependency array
  const watchedEmail = inviteMemberForm.watch('email');

  // Update effect with proper dependencies
  useEffect(() => {
    if (watchedEmail) {
      nonRegisteredForm.setValue('email', watchedEmail, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [watchedEmail, nonRegisteredForm]);

  // Add email validation before showing new user form
  const isValidEmail = useMemo(() => {
    return watchedEmail && watchedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }, [watchedEmail]);

  // Add form reset handlers
  const resetForms = useCallback(() => {
    inviteMemberForm.reset();
    nonRegisteredForm.reset();
    setSearchResults([]);
    setIsSearching(false);
    setShowNewUserForm(false);
  }, [inviteMemberForm, nonRegisteredForm]);

  // Modify handleInviteNew to include better validation
  const handleInviteNew = async (data: z.infer<typeof nonRegisteredUserSchema>) => {
    if (!currentTeamId) {
      toast.error("No team selected");
      return;
    }

    // Verify email matches
    if (data.email !== inviteMemberForm.watch('email')) {
      toast.error("Email mismatch", {
        description: "Please ensure the email addresses match"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/${currentTeamId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...data,
          isExisting: false
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      await onInviteSuccess();
      // Show success popup
      setShowSuccessPopup(true);
      toast.success("Invitation sent!", {
        description: `An invitation has been sent to ${data.email}`,
      });
      
      // Switch to members tab after successful invitation
      setActiveTab("members");
      
      setShowNewUserDialog(false);
      nonRegisteredForm.reset();
      inviteMemberForm.reset();
      // Reset UI for new user invite
      resetForms();
      setShowNewUserDialog(false);
      setConfirmInvite(null);
    } catch (error: any) {
      toast.error("Failed to invite member", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add debounced email validation
  const debouncedSetShowForm = useMemo(
    () => debounce((email: string) => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setShowNewUserForm(isValid && searchResults.length === 0);
    }, 500),
    [searchResults.length]
  );

  // Update the email validation effect
  useEffect(() => {
    if (!isSearching && watchedEmail) {
      debouncedSetShowForm(watchedEmail);
    }
    return () => {
      debouncedSetShowForm.cancel?.();
    };
  }, [watchedEmail, isSearching, debouncedSetShowForm]);

  return (
    <>
      {/* Alert UI for "Member is already part of a team" error */}
      {alertMessage && (
        <div className="flex items-center p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          <XCircleIcon className="w-5 h-5 mr-2" />
          <span>{alertMessage}</span>
          <button
            onClick={() => setAlertMessage(null)}
            className="ml-auto text-red-700 font-bold"
          >
            X
          </button>
        </div>
      )}
      <div className="space-y-4">
        <div className="mb-4 p-3 sm:p-4 bg-red-50/50 border border-red-100 rounded-md">
          <p className="text-red-700 text-xs sm:text-sm">
            <strong>Important:</strong>
          </p>
          <ul className="mt-1 text-[11px] sm:text-sm text-red-600 space-y-1">
            <li>• PCCOE students can only team up with other PCCOE students</li>
            <li>• Non-PCCOE students can only team up with other non-PCCOE students</li>
          </ul>
        </div>

        <div className="mb-4 p-3 sm:p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="shrink-0">
              <svg 
                className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div>
              <p className="text-blue-800 font-medium text-sm sm:text-base mb-1">
                Team Invitation Instructions
              </p>
              <p className="text-blue-600 text-xs sm:text-sm">
                Share this link with your team members:
                <Link 
                  href="/dashboard/events/accept" 
                  className="ml-1.5 font-medium underline decoration-dashed underline-offset-4 hover:text-blue-700"
                >
                  /dashboard/events/accept
                </Link>
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Invite Members</CardTitle>
            <CardDescription className="space-y-1 text-xs sm:text-sm">
              {!canInvite ? (
                <p className="text-yellow-600">Maximum team size reached ({maxAllowed} members)</p>
              ) : (
                <>
                  <p>You can add up to {maxAllowed - totalMembers} more members</p>
                  {pendingMembers.length > 0 && (
                    <p className="text-yellow-600 text-[11px] sm:text-xs">
                      {pendingMembers.length} invitation{pendingMembers.length !== 1 ? 's' : ''} have been sent out and are pending.
                    </p>
                  )}
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-6">
              {canInvite ? (
                <>
                  <Form {...inviteMemberForm}>
                    <form className="space-y-4">
                      <FormField
                        control={inviteMemberForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Search User & Create Account for Friends!</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  {...field}
                                  placeholder="Search by email..."
                                  onChange={(e) => {
                                    field.onChange(e);
                                    debouncedSearch(e.target.value);
                                  }}
                                  className="pr-8"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                  {isSearching ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                  ) : (
                                    <Search className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="border rounded-lg divide-y">
                      {searchResults.map((user) => (
                        <div 
                          key={user.id}
                          className="p-3 hover:bg-gray-50 flex items-center justify-between transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{user.full_name}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            {user.college_name && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {user.college_name}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setConfirmInvite({ id: user.id, email: user.email })}
                            disabled={invitingUserId === user.id}
                            className="ml-3 shrink-0"
                          >
                            {invitingUserId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Invite"
                            )}
                          </Button> 
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Results - Show New User Form */}
                  {showNewUserForm && !isSearching && (
                    <div className="border rounded-lg">
                      <div className="p-4 bg-gray-50 border-b">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <UserPlus className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-900 font-medium">
                              New User Details
                            </p>
                            <p className="text-sm text-gray-500">
                              Fill in the details to invite {inviteMemberForm.watch('email')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <Form {...nonRegisteredForm}>
                          <form onSubmit={nonRegisteredForm.handleSubmit(handleInviteNew)} className="space-y-6">
                            <FormField
                              control={nonRegisteredForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      value={inviteMemberForm.watch('email')} 
                                      readOnly 
                                      className="bg-gray-50" 
                                    />
                                  </FormControl>
                                  <p className="text-xs text-gray-500">
                                    This email will be used to send the invitation
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <UserDetailsForm form={nonRegisteredForm} />

                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={resetForms}
                                disabled={isLoading}
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-4 w-4" />
                                    Send Invitation
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    You have reached the maximum number of team members allowed. Remove existing invites to add new members.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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

      {/* Render success popup */}
      <AlertDialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              Invitation sent successfully!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessPopup(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invitation Confirmation Modal */}
      <AlertDialog open={!!confirmInvite} onOpenChange={() => setConfirmInvite(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to send an invitation to ${confirmInvite?.email}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmInvite && handleInviteExisting(confirmInvite.id, confirmInvite.email)}
              disabled={invitingUserId === confirmInvite?.id}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {invitingUserId === confirmInvite?.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New popup for already in team error */}
      <AlertDialog open={showAlreadyTeamPopup} onOpenChange={setShowAlreadyTeamPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              The member is already part of a team for this event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlreadyTeamPopup(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
