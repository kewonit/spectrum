'use client'; // Add this directive to make this a Client Component

import { Suspense } from 'react';
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";

// Dynamic import is allowed in Client Components with ssr: false
const AttendanceClient = dynamic(
  () => import('@/components/dashboard/attendance/client').then(mod => ({ default: mod.AttendanceClient })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="h-8 w-8 text-gray-400 animate-spin mb-4" />
        <p className="text-gray-500">Loading attendance system...</p>
      </div>
    )
  }
);

export default function MarkAttendancePage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Mark Attendance' },
        ]}
        className="mb-6"
      />
      
      {/* Client component with dynamic loading */}
      <AttendanceClient />
    </div>
  );
}