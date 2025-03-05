'use client';

// Import our existing MarkAttendanceClient and re-export with a new name
import MarkAttendanceClient from '@/components/dashboard/MarkAttendanceClient';

// Export as a named export to avoid import confusion
export function AttendanceClient() {
  return <MarkAttendanceClient />;
}
