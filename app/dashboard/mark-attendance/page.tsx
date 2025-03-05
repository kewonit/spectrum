"use client";

import { Suspense } from 'react';
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import MarkAttendanceClient from '@/components/dashboard/MarkAttendanceClient';

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