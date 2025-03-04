'use client';

import { useState, useEffect, useCallback } from "react";
import { QrScanner } from "@/components/QrScanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  RefreshCw, 
  Loader, 
  SearchIcon, 
  QrCode, 
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Custom badge variant
const CustomBadge = ({
  variant,
  children,
  className,
  ...props
}: {
  variant?: "outline" | "default" | "secondary" | "destructive" | "success";
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  const baseClassName = variant === "success" ? 
    "bg-green-100 text-green-800 hover:bg-green-200 border border-green-200" : 
    undefined;

  return (
    <Badge 
      variant={variant === "success" ? "default" : variant} 
      className={cn(baseClassName, className)} 
      {...props}
    >
      {children}
    </Badge>
  );
};

// At the top of the file, update the global interface declaration
declare global {
  interface Window {
    playSuccess?: () => void; // Mark as optional with ?
  }
}

export default function MarkAttendancePage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(true);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [userAccessError, setUserAccessError] = useState<string | null>(null);
  const [recentlyScanned, setRecentlyScanned] = useState<string[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<{
    today: number;
    total: number;
  }>({ today: 0, total: 0 });

  // Updated sound effect function with proper cleanup
  useEffect(() => {
    // Create sound effect functions
    window.playSuccess = () => {
      try {
        const audio = new Audio('/sounds/success.mp3');
        audio.volume = 0.7;
        audio.play().catch(e => console.log('Audio play prevented by browser', e));
      } catch (e) {
        console.log('Audio not supported', e);
      }
    };
    
    // Fix: proper cleanup without using delete operator
    return () => {
      window.playSuccess = undefined; // Set to undefined instead of using delete
    };
  }, []);

  // Fetch attendance history on component mount and page change
  useEffect(() => {
    fetchAttendanceHistory();
    fetchAttendanceStats();
  }, [currentPage]);

  const fetchAttendanceStats = async () => {
    try {
      const response = await fetch('/api/attendance/stats');
      
      // Still process the response even if it's not OK
      const data = await response.json();
      
      // Use the data if we got it, otherwise initialize with zeros
      setAttendanceStats({
        today: data?.today || 0,
        total: data?.total || 0
      });
    } catch (err) {
      console.error('Error fetching attendance stats:', err);
      // Set default stats on error
      setAttendanceStats({
        today: 0,
        total: 0
      });
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await fetch(`/api/attendance/history?page=${currentPage}&limit=10`);
      
      // Continue even if response isn't OK
      const data = await response.json();
      
      // Check for specific error status that should prevent operation
      if (response.status === 403) {
        setUserAccessError(data.error || "You don't have permission to mark attendance");
        setHistoryLoading(false);
        return;
      }
      
      // Use any data we got, or empty array if none
      setAttendanceHistory(data.data || []);
      setHasMoreHistory(data.hasMore || false);
      
      // Clear any previous errors
      setError(null);
    } catch (err: any) {
      console.error('Error fetching attendance history:', err);
      setAttendanceHistory([]);
      setHasMoreHistory(false);
      setError(err.message || "Failed to load attendance history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleScan = useCallback(async (scanData: string) => {
    if (!scanData) return;
    
    // Prevent multiple scans of the same QR code within a short period
    if (recentlyScanned.includes(scanData)) {
      return;
    }
    
    try {
      // Add to recently scanned to prevent duplicates
      setRecentlyScanned(prev => [...prev, scanData]);
      setTimeout(() => {
        setRecentlyScanned(prev => prev.filter(id => id !== scanData));
      }, 5000);
      
      // Show loading toast with ID to dismiss it later
      const loadingToastId = toast.loading("Processing attendance...", {
        description: "Scanning QR code and marking attendance",
        duration: 10000 // Longer timeout just in case
      });
      
      // Trim any whitespace from the QR data
      const cleanedData = scanData.trim();
      
      console.log('Scanning QR code data:', cleanedData);
      
      // Use URLSearchParams for more reliable data transmission
      const params = new URLSearchParams();
      params.append('userId', cleanedData);
      
      const response = await fetch('/api/attendance/mark?' + params.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: cleanedData,
          verificationMethod: 'qr_code',
          notes: 'Marked via QR scan'
        }),
      });
      
      // Always dismiss loading toast regardless of success/failure
      toast.dismiss(loadingToastId);
      
      const data = await response.json();
      
      // Check response status
      if (!response.ok) {
        console.error('Error marking attendance:', data);
        throw new Error(data.error || 'Failed to mark attendance');
      }
      
      // Play success sound - use global function to avoid browser autoplay restrictions
      if (window.playSuccess) {
        window.playSuccess();
      }
      
      // Create specific success toast based on data
      const attendeeName = data.attendee?.full_name || 'Unknown';
      
      // Force rendering a new toast with the Sonner library
      setTimeout(() => {
        if (data.isDefaultAttendance) {
          toast.success(`Attendance marked for ${attendeeName}`, {
            description: `Marked present for ${data.eventNames[0]} (not registered)`,
            id: `success-${Date.now()}`, // Force unique ID
            duration: 5000,
          });
        } else if (data.eventCount > 1) {
          toast.success(`Attendance marked for ${attendeeName}`, {
            description: `Successfully checked in to ${data.eventCount} events`,
            id: `success-${Date.now()}`,
            duration: 5000,
          });
        } else if (data.eventCount === 1) {
          toast.success(`Attendance marked for ${attendeeName}`, {
            description: `Successfully checked in to ${data.eventNames[0]}`,
            id: `success-${Date.now()}`,
            duration: 5000,
          });
        } else {
          toast.success(`Attendance marked for ${attendeeName}`, {
            id: `success-${Date.now()}`,
            duration: 5000,
          });
        }
      }, 100);
      
      // Refresh attendance history and stats with small delay to allow the database to update
      setTimeout(() => {
        fetchAttendanceHistory();
        fetchAttendanceStats();
      }, 500);
      
    } catch (err: any) {
      console.error('Error marking attendance:', err);
      
      // Force a new error toast to render
      setTimeout(() => {
        toast.error("Failed to mark attendance", {
          description: err.message || "Please try again",
          id: `error-${Date.now()}`,
          duration: 5000,
        });
      }, 100);
    }
  }, [recentlyScanned]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAttendanceHistory();
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMoreHistory) {
      setCurrentPage(currentPage + 1);
    }
  };

  const filteredHistory = searchQuery
    ? attendanceHistory.filter(record =>
        record.attendee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.attendee_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.event_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : attendanceHistory;

  // If the user doesn't have access, display an error message
  if (userAccessError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Mark Attendance' },
          ]}
          className="mb-6"
        />
        
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-4">{userAccessError}</p>
          <Button 
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="bg-white"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

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
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left side - QR Scanner and Stats */}
        <div className="lg:col-span-5">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <QrCode className="h-5 w-5 mr-2 text-blue-500" />
                Mark Attendance
              </CardTitle>
              <CardDescription>
                Scan attendee QR codes to mark attendance for all registered events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Stats Section */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
                  <p className="text-sm text-blue-700 font-medium">Today</p>
                  <p className="text-2xl font-bold text-blue-800">{attendanceStats.today}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
                  <p className="text-sm text-purple-700 font-medium">Total</p>
                  <p className="text-2xl font-bold text-purple-800">{attendanceStats.total}</p>
                </div>
              </div>
              
              <QrScanner
                onScan={handleScan}
                onError={(errorMessage) => {
                  console.error('QR Scanner error:', errorMessage);
                  // Only show errors that are not normal "QR code not found" messages
                  if (!errorMessage.includes('QR code not found') && 
                      !errorMessage.includes('No QR code found')) {
                    toast.error("Scanner error", {
                      description: errorMessage,
                    });
                  }
                }}
                autoStart={true}
                className="max-w-full"
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Right side - Attendance History */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-green-500" />
                  Recent Attendance
                </div>
                <Button
                  onClick={fetchAttendanceHistory}
                  variant="ghost"
                  size="sm"
                  disabled={historyLoading}
                  className="h-8 w-8 p-0"
                >
                  {historyLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
              <CardDescription>
                Recent attendance records across all events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and filter bar */}
              <div className="flex items-center mb-4 gap-2">
                <form onSubmit={handleSearch} className="relative flex-1">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email or event..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </form>
              </div>
              
              {/* Attendance history table */}
              {historyLoading ? (
                <div className="space-y-2 py-1">
                  {Array.from({length: 5}).map((_, idx) => (
                    <Skeleton key={idx} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No attendance records found</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Scan QR codes to mark attendance
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[30%]">Attendee</TableHead>
                              <TableHead className="w-[30%]">Event</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredHistory.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{record.attendee_name}</p>
                                    <p className="text-xs text-gray-500">{record.attendee_email}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-sm font-medium">{record.event_name}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <CustomBadge variant={record.is_present ? "success" : "outline"}>
                                    {record.is_present ? "Present" : "Absent"}
                                  </CustomBadge>
                                </TableCell>
                                <TableCell>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger className="cursor-default">
                                        <time dateTime={record.marked_at} className="text-sm">
                                          {format(new Date(record.marked_at), 'h:mm a')}
                                        </time>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          {format(new Date(record.marked_at), 'MMMM d, yyyy h:mm:ss a')}
                                        </p>
                                        {record.marked_by_name && (
                                          <p className="text-xs">By: {record.marked_by_name}</p>
                                        )}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                
                      {/* Pagination controls */}
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-gray-500">
                          Showing page {currentPage + 1}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 0}
                            variant="outline"
                            size="sm"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <Button
                            onClick={handleNextPage}
                            disabled={!hasMoreHistory}
                            variant="outline"
                            size="sm"
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}