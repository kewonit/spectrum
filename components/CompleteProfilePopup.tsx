import React, { useEffect } from 'react'
import { ProfileForm } from '@/app/dashboard/components/profile-form'

interface CompleteProfilePopupProps {
  profile: any;
  onProfileUpdate: () => void;
}

export function CompleteProfilePopup({ profile, onProfileUpdate }: CompleteProfilePopupProps) {
  useEffect(() => {
    // Lock background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-8 sm:py-12">
      {/* Added max-height and overflow-y-auto for scrollability */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Complete Your Profile</h2>
          <p className="mb-4 text-sm text-gray-700">
            Please fill in all required details to continue.
          </p>
          {/* Responsive container for profile form */}
          <div className="space-y-4">
            <ProfileForm 
              profile={profile}
              onUpdate={onProfileUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
