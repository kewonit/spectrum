import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Checks if a user has permission to access attendance features
 * @param supabase - Supabase client
 * @param userEmail - User's email to check against allowed list
 * @returns Object containing isAllowed flag and optional error message
 */
export async function checkAttendancePermission(
  supabase: SupabaseClient,
  userEmail: string | undefined
): Promise<{ isAllowed: boolean; error?: string }> {
  if (!userEmail) {
    return {
      isAllowed: false,
      error: "Unable to verify user email."
    };
  }
  
  // Check if the email exists in the allowed_emails_attendance table
  const { data, error } = await supabase
    .from('allowed_emails_attendance')
    .select('id')
    .eq('email', userEmail.toLowerCase())
    .maybeSingle();
  
  if (error) {
    console.error('Error checking attendance permission:', error);
    return {
      isAllowed: false,
      error: "Error checking permissions. Please try again later."
    };
  }
  
  if (!data) {
    return {
      isAllowed: false,
      error: "You don't have permission to use the attendance system. Please contact an administrator."
    };
  }
  
  return { isAllowed: true };
}
