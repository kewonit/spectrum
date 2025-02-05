import { createClient } from "@/app/utils/supabase/server";
import { SupabaseClient } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  college_name: string | null;
  prn: string | null;
  branch: string | null;
  class: string | null;
  gender: string | null;
  is_pccoe_student: boolean | null;
}

interface DatabaseProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  college_name: string | null;
  prn: string | null;
  branch: string | null;
  class: string | null;
  gender: string | null;
  is_pccoe_student: boolean | null;
}

interface DatabaseResponse {
  id: string;
  profiles: DatabaseProfile;
}

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<{ is_pccoe_student: boolean }> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('is_pccoe_student')
      .eq('id', userId)
      .single();

    if (!data || data.is_pccoe_student === null) {
      return { is_pccoe_student: false };
    }

    return {
      is_pccoe_student: data.is_pccoe_student
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { is_pccoe_student: false };
  }
}

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        college_name,
        prn,
        branch,
        class,
        gender,
        is_pccoe_student
      `)
      .eq('id', userId)
      .single();

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function calculatePaymentAmount(
  eventId: string,
  teamId?: string
): Promise<number> {
  const supabase = await createClient();
  
  if (teamId) {
    // For team events, count non-PCCOE members
    const { data: members } = await supabase
      .from('team_members')
      .select(`
        profiles!inner(
          is_pccoe_student
        )
      `)
      .eq('team_id', teamId)
      .eq('invitation_status', 'accepted');

    if (!members) return 0;
    
    // Explicitly type the profile data
    const nonPccoeCount = members.filter(member => {
      const profile = (member as unknown as DatabaseResponse).profiles as DatabaseProfile;
      return !profile.is_pccoe_student;
    }).length;
    
    return nonPccoeCount * 5; // ₹100 per non-PCCOE student
  }
  
  // For solo events, return ₹100 if non-PCCOE
  return 5;
}

export async function generateOrderId(): Promise<string> {
  return `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}
