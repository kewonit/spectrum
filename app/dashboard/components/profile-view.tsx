import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

// Add the same constants from profile-form for consistency
const BRANCH_OPTIONS = {
  cs: "Computer Science",
  cs_aiml: "CS (AI & ML)",
  cs_regional: "CS (Regional)",
  it: "Information Technology",
  entc: "Electronics & Telecomm.",
  mech: "Mechanical",
  civil: "Civil"
} as const;

const COLLEGE_OPTIONS = {
  pccoe: "Pimpri Chinchwad College of Engineering, Pune",
  pccoer: "Pimpri Chinchwad College of Engineering & Research, Ravet",
  // ...existing college options...
} as const;

interface ProfileViewProps {
  profile: {
    full_name?: string;
    email?: string;
    phone?: string;
    college_name?: string;
    prn?: string;
    branch?: string;
    class?: string;
    gender?: string;
    bio?: string;
  };
  onEditClick: () => void;
}

export function ProfileView({ profile, onEditClick }: ProfileViewProps) {
  // Add null check for profile
  if (!profile) {
    return (
      <div className="text-center py-6 px-4 sm:px-6 md:px-8">
        <h3 className="text-xl font-medium text-gray-900">Profile Not Found</h3>
        <p className="mt-2 text-gray-600">Unable to load profile information.</p>
        <Button onClick={onEditClick} className="mt-4">
          Create Profile
        </Button>
      </div>
    );
  }

  // Helper function to get full college name
  const getFullCollegeName = (collegeName: string) => {
    // Check if it's a key in COLLEGE_OPTIONS
    const collegeEntry = Object.entries(COLLEGE_OPTIONS).find(([key]) => key === collegeName);
    return collegeEntry ? collegeEntry[1] : collegeName;
  };

  // Helper function to get full branch name
  const getFullBranchName = (branchKey: string) => {
    return BRANCH_OPTIONS[branchKey as keyof typeof BRANCH_OPTIONS] || branchKey;
  };

  const ProfileItem = ({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) => {
    if (!value) return null;
    return (
      <div className={`space-y-0.5 sm:space-y-1 p-2 sm:p-4 rounded-xl ${highlight ? 'bg-blue-50 border-2 border-blue-100' : 'bg-gray-50'}`}>
        <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide ${highlight ? 'text-blue-600' : 'text-gray-500'}`}>
          {label}
        </p>
        <p className={`text-sm sm:text-lg ${highlight ? 'text-blue-700 font-semibold' : 'text-gray-700 font-medium'} truncate`}>
          {value}
        </p>
      </div>
    );
  };

  // Update the empty profile check
  if (!Object.values(profile).filter(Boolean).length) {
    return (
      <div className="text-center py-6 px-4 sm:px-6 md:px-8">
        <h3 className="text-xl font-medium text-gray-900">No Profile Details</h3>
        <p className="mt-2 text-gray-600">Please add your profile information to complete your profile.</p>
        <Button onClick={onEditClick} className="mt-4">
          Add Profile Details
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-1 sm:px-6 md:px-8">
      {/* Personal Information Section */}
      <section className="space-y-3">
        <div className="flex items-center mb-3">
          <span className="inline-block px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] sm:text-xs font-medium tracking-wide uppercase">
            Personal Details
          </span>
        </div>
        <div className="grid gap-2.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileItem label="Full Name" value={profile?.full_name} />
          <ProfileItem label="Email Address" value={profile?.email} highlight />
          <ProfileItem label="Phone Number" value={profile?.phone} />
          <ProfileItem 
            label="Gender" 
            value={profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : undefined} 
          />
        </div>
      </section>

      <div className="border-t border-dashed border-gray-200 -mx-4 sm:-mx-6 md:-mx-8"></div>

      {/* Academic Information Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] sm:text-xs font-medium tracking-wide uppercase">
            Academic Details
          </span>
        </div>
        <div className="grid gap-2.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileItem 
            label="Institution" 
            value={profile?.college_name ? getFullCollegeName(profile.college_name) : undefined} 
          />
          <ProfileItem label="PRN Number" value={profile?.prn} highlight />
          <ProfileItem 
            label="Academic Branch" 
            value={profile?.branch ? getFullBranchName(profile.branch) : undefined} 
          />
          <ProfileItem 
            label="Class/Division" 
            value={profile?.class ? (profile.class.match(/^[A-Z]$/) ? `Division ${profile.class}` : profile.class) : undefined} 
          />
        </div>
      </section>
    </div>
  );
}