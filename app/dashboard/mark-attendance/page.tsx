"use client";

import { Suspense } from 'react';
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import dynamic from 'next/dynamic';

// Import the component dynamically with SSR disabled
const MarkAttendanceClient = dynamic(
  () => import('@/components/dashboard/MarkAttendanceClient'),
  { ssr: false } // This prevents the component from being rendered during server-side rendering
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
      
      <Suspense fallback={<div className="py-12 text-center">Loading attendance system...</div>}>
        <MarkAttendanceClient />
      </Suspense>
    </div>
  );
}