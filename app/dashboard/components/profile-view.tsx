import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
}

export function ProfileView({ profile }: ProfileViewProps) {
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
      <div className={`space-y-1 p-4 rounded-xl ${highlight ? 'bg-blue-50 border-2 border-blue-100' : 'bg-gray-50'}`}>
        <p className={`text-xs font-semibold uppercase tracking-wide ${highlight ? 'text-blue-600' : 'text-gray-500'}`}>
          {label}
        </p>
        <p className={`text-lg ${highlight ? 'text-blue-700 font-semibold' : 'text-gray-700 font-medium'} truncate`}>
          {value}
        </p>
      </div>
    );
  };

  // Check if profile has any data
  const hasProfileData = Object.values(profile).some(value => value);

  if (!hasProfileData) {
    return (
      <div className="p-2 sm:p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900">No Profile Details</h3>
          <p className="mt-2 text-gray-600">Please add your profile information to complete your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-200 relative">
        {/* Dots for ticket effect */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 sm:w-3 h-6 bg-[#EBE9E0] rounded-r-full"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 sm:w-3 h-6 bg-[#EBE9E0] rounded-l-full"></div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-white to-gray-50">
          {/* Personal Information Section */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 mb-3">
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

          <div className="border-t border-dashed border-gray-200 my-4 sm:my-6"></div>

          {/* Academic Information Section */}
          <section className="space-y-3 sm:space-y-4">
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
      </div>
    </div>
  );
}