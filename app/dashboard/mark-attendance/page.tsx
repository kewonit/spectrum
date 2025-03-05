import MarkAttendanceClient from '@/components/dashboard/MarkAttendanceClient';
import { Suspense } from 'react';
import { Breadcrumbs } from "@/app/components/breadcrumbs";
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
      
      <Suspense fallback={<div>Loading...</div>}>
        <MarkAttendanceClient />
      </Suspense>
    </div>
  );
}