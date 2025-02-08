"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CompleteProfilePopup } from '@/components/CompleteProfilePopup';

const isProfileComplete = (profile: any) => {
  return profile && profile.full_name && profile.email && profile.phone &&
         profile.college_name && profile.prn && profile.branch &&
         profile.class && profile.gender;
};

export default function ProfilePopupWrapper() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      setUserData(data);
    } catch (error: any) {
      toast.error("Failed to refresh data", { description: error.message });
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
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading || !userData) return null;
  const { profile } = userData;
  if (isProfileComplete(profile)) return null;

  return (
    <CompleteProfilePopup 
      profile={profile} 
      onProfileUpdate={refreshUserData}
    />
  );
}
