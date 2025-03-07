'use client';

import { Suspense } from 'react';
import { AttendanceSection } from './AttendanceSection';
import { MapPin } from 'lucide-react';

interface EventAttendanceWrapperProps {
  profileId: string | undefined;
  userName: string | undefined;
  userPhone: string | undefined;
  onShowQr: () => void;
}

export function EventAttendanceWrapper(props: EventAttendanceWrapperProps) {
  return (
    <Suspense fallback={<AttendanceSkeleton />}>
      <AttendanceSection {...props} />
    </Suspense>
  );
}

function AttendanceSkeleton() {
  return (
    <div className="overflow-hidden bg-[#EBE9E0]/40 backdrop-blur border-2 border-gray-300 rounded-2xl shadow-sm max-w-[1400px] mx-auto">
      <div className="p-4 sm:p-5 lg:p-6 border-b-2 border-gray-300 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-full" />
          <div className="h-10 w-16 bg-gray-200 animate-pulse rounded-md" />
        </div>
      </div>
      
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 bg-gray-200 animate-pulse rounded-full" />
          <div className="h-5 w-48 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-64 bg-gray-200 animate-pulse rounded" />
          <div className="mt-4 h-10 w-44 bg-gray-200 animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}
