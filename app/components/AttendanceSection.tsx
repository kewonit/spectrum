'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, XCircle, MapPin, QrCode, Download, Archive, User, Phone, ChevronDown } from "lucide-react";
import { toPng } from 'html-to-image';

interface AttendanceRecord {
  id: string;
  is_present: boolean;
  marked_at: string;
  verification_method: string | null;
  events: {
    id: string;
    name: string;
    description: string | null;
    event_type: 'solo' | 'fixed_team' | 'variable_team';
    event_start: string | null;
    event_end: string | null;
    img_url: string | null;
    whatsapp_url: string | null;
  };
  registrations: {
    id: string;
    event_id: string;
    registration_status: string;
  };
  staff: {
    id: string;
    full_name: string;
  } | null;
}

interface AttendanceSectionProps {
  profileId: string | undefined;
  userName: string | undefined;
  userPhone: string | undefined;
  onShowQr: () => void;
}

// Helper function to format date
const formatDate = (dateString: string | null, compact = false) => {
  if (!dateString) return 'N/A';
  try {
    return format(
      new Date(dateString), 
      compact ? 'dd MMM, h:mm a' : 'dd MMM yyyy, h:mm a'
    );
  } catch (e) {
    return dateString;
  }
};

// Format event type
const formatEventType = (type: string) => {
  if (type === 'variable_team') return 'Team';
  if (type === 'fixed_team') return 'Team';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export function AttendanceSection({ profileId, userName, userPhone, onShowQr }: AttendanceSectionProps) {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Add state to track expanded/collapsed
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const allCardsContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/attendance');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch attendance data');
        }
        
        setAttendanceData(data.attendance || []);
      } catch (err: any) {
        console.error('Error fetching attendance data:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch data on mount if profileId is available, regardless of expansion state
    if (profileId) {
      fetchAttendanceData();
    }
  }, [profileId]); // Removed isExpanded dependency

  // Enhanced function to download visually appealing attendance records image
  const downloadAllCardsAsPng = async () => {
    if (attendanceData.length === 0) {
      console.error('No attendance data available');
      return;
    }
    
    setDownloading(true);
    try {
      // Create a new container that will be visible during capture
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '800px'; // Fixed width for better quality
      container.style.padding = '0'; // Remove padding
      container.style.backgroundColor = '#ffffff';
      container.style.zIndex = '9999'; 
      container.style.visibility = 'hidden';
      container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      
      document.body.appendChild(container);
      
      // Count present events
      const presentCount = attendanceData.filter(record => record.is_present).length;
      const totalCount = attendanceData.length;
      
      // Create an enhanced HTML template for the attendance records with improved theme matching
      let html = `
        <div style="background-color: #ffffff; overflow: hidden; position: relative;">
          <!-- Header with EBE9E0 theme background -->
          <div style="background: #EBE9E0; padding: 30px; position: relative; overflow: hidden; border-bottom: 2px solid #e5e7eb;">
            <!-- Decorative elements matching the card design -->
            <div style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 12px; height: 24px; background: white; border-radius: 0 12px 12px 0;"></div>
            <div style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 12px; height: 24px; background: white; border-radius: 12px 0 0 12px;"></div>
            
            <div style="display: flex; flex-direction: column; position: relative; z-index: 2;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
                <div style="display: flex; align-items: center;">
                  <div style="background-color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); border: 2px solid #d1d5db;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h1 style="font-size: 26px; font-weight: 700; color: #111827; margin: 0;">Event Attendance Records</h1>
                    <p style="font-size: 14px; color: #4b5563; margin: 4px 0 0 0;">Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <!-- Logo added here -->
                <div style="height: 70px; width: 140px; display: flex; justify-content: flex-end;">
                  <img 
                    src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1741381764/Spectrum/logo_black.webp"
                    alt="Spectrum Logo"
                    style="height: 100%; max-width: 100%; object-fit: contain;"
                    crossorigin="anonymous"
                  />
                </div>
              </div>
              
              <div style="display: flex; align-items: stretch; justify-content: space-between; gap: 16px; margin-top: 16px;">
                <!-- User info box with matching styles from cards -->
                <div style="background-color: white; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 2px solid #d1d5db; flex-grow: 1;">
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span style="font-size: 16px; font-weight: 600; color: #111827;">${userName || 'Participant'}</span>
                  </div>
                  ${userPhone ? `
                    <div style="display: flex; align-items: center; margin-top: 8px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <span style="font-size: 15px; color: #4b5563;">${userPhone}</span>
                    </div>
                  ` : ''}
                </div>
                
                <!-- Status counter with matching theme -->
                <div style="background-color: white; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 2px solid #d1d5db; display: flex; align-items: center; gap: 12px;">
                  <div style="background-color: ${presentCount > 0 ? '#dcfce7' : '#f3f4f6'}; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid ${presentCount > 0 ? '#bbf7d0' : '#e5e7eb'};">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${presentCount > 0 ? '#16a34a' : '#9ca3af'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div>
                    <div style="font-weight: 600; color: #111827; font-size: 18px;">${presentCount}/${totalCount}</div>
                    <div style="font-size: 13px; color: #6b7280;">Events Attended</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Content area -->
          <div style="padding: 24px 30px 30px;">
            <h2 style="font-size: 20px; font-weight: 600; color: #374151; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #EBE9E0;">
              Event Attendance Details
            </h2>
            
            <div style="display: flex; flex-direction: column; gap: 24px;">
      `;
      
      // Create HTML for each attendance record with enhanced styling to match app theme
      for (const record of attendanceData) {
        html += `
          <div style="border-radius: 12px; overflow: hidden; border: 2px solid #d1d5db; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <!-- Card top section with image background similar to the app UI -->
            <div style="position: relative; height: 120px; background-color: #f9fafb; overflow: hidden;">
              ${record.events.img_url ? `
                <div style="position: absolute; inset: 0; overflow: hidden;">
                  <img 
                    src="${record.events.img_url}" 
                    alt="${record.events.name}" 
                    style="width: 100%; height: 100%; object-fit: cover; opacity: 0.6;"
                    crossorigin="anonymous"
                  />
                  <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.8) 70%, white);"></div>
                </div>
              ` : `
                <div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(235,233,224,0.6), rgba(235,233,224,0.2));"></div>
              `}
              
              <!-- Logo overlaid on background -->
              <div style="position: absolute; top: 50%; left: 24px; transform: translateY(-50%); z-index: 2;">
                <div style="width: 80px; height: 80px; background-color: white; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 2px solid #e5e7eb; display: flex; align-items: center; justify-content: center; padding: 10px;">
                  ${record.events.img_url ? `
                    <img 
                      src="${record.events.img_url}" 
                      alt="${record.events.name}" 
                      style="max-width: 100%; max-height: 100%; object-fit: contain;" 
                      crossorigin="anonymous"
                    />
                  ` : `
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  `}
                </div>
              </div>
              
              <!-- Status badges -->
              <div style="position: absolute; top: 16px; right: 16px; display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
                <!-- Event type badge -->
                <div style="background-color: rgba(255,255,255,0.8); font-size: 12px; padding: 3px 10px; border-radius: 4px; color: #4b5563; border: 2px solid #d1d5db; font-weight: 500; text-transform: capitalize;">
                  ${formatEventType(record.events.event_type)}
                </div>
                
                <!-- Attendance status badge -->
                <div style="display: flex; align-items: center; gap: 5px; font-size: 12px; padding: 4px 12px; border-radius: 9999px; background-color: ${record.is_present ? '#dcfce7' : '#f3f4f6'}; color: ${record.is_present ? '#16a34a' : '#6b7280'}; border: 2px solid ${record.is_present ? '#bbf7d0' : '#e5e7eb'}; font-weight: 500;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    ${record.is_present ? 
                      `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>` : 
                      `<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>`
                    }
                  </svg>
                  <span>${record.is_present ? 'Present' : 'Not Marked'}</span>
                </div>
              </div>
            </div>
            
            <!-- Card content - SIMPLIFIED: Removed date/time info -->
            <div style="padding: 16px 20px; background-color: #ffffff; border-top: 2px solid #e5e7eb;">
              <!-- Event name -->
              <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">
                ${record.events.name}
              </h3>
              
              <!-- Attendance info box with EBE9E0 theme color (simplified version) -->
              ${record.is_present ? `
                <div style="background-color: #EBE9E0; border-radius: 8px; padding: 14px; border: 2px solid #d1d5db;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: ${record.staff ? '8px' : '0'};">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span style="font-size: 16px; color: #111827; font-weight: 500;">
                      Marked present on ${formatDate(record.marked_at, true)}
                    </span>
                  </div>
                  ${record.staff ? `
                    <div style="margin-top: 8px; margin-left: 26px; font-size: 15px; color: #4b5563; display: flex; align-items: center; gap: 6px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Verified by: ${record.staff.full_name || 'Event Staff'}</span>
                    </div>
                  ` : ''}
                </div>
              ` : `
                <div style="background-color: #EBE9E0; border-radius: 8px; padding: 14px; border: 2px solid #d1d5db;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span style="font-size: 16px; color: #4b5563;">
                      Attendance not yet marked
                    </span>
                  </div>
                </div>
              `}
            </div>
          </div>
        `;
      }
      
      // Add a nice footer with theme matching and updated year to '25
      html += `
            </div>
          </div>
          
          <!-- Footer with theme color -->
          <div style="padding: 20px 30px; background-color: #EBE9E0; border-top: 2px solid #d1d5db; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: #4b5563;">
              Generated on ${new Date().toLocaleString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              })}
            </div>
            <div style="font-size: 15px; font-weight: 600; color: #111827;">
              SPECTRUM '25
            </div>
          </div>
        </div>
      `;
      
      // Set HTML content
      container.innerHTML = html;
      
      // Function to check if all images are loaded
      const areAllImagesLoaded = () => {
        const images = container.querySelectorAll('img');
        return Array.from(images).every(img => img.complete);
      };
      
      // Wait for all images to load
      if (!areAllImagesLoaded()) {
        await new Promise<void>(resolve => {
          const checkImages = () => {
            if (areAllImagesLoaded()) {
              resolve();
            } else {
              setTimeout(checkImages, 100);
            }
          };
          setTimeout(checkImages, 100);
        });
      }
      
      // Additional waiting time for rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // Make sure the element is properly sized
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        
        // Make it visible for capture
        container.style.visibility = 'visible';
        
        // Capture the container as PNG
        const dataUrl = await toPng(container, {
          quality: 1,
          pixelRatio: 2,
          width,
          height,
          backgroundColor: '#ffffff'
        });
        
        // Create download link with phone number in filename
        const link = document.createElement('a');
        const phoneForFilename = userPhone ? userPhone.replace(/[\s+]/g, '') : 'unknown';
        link.download = `${phoneForFilename}-all-event.png`;
        link.href = dataUrl;
        link.click();
      } finally {
        // Hide it again
        container.style.visibility = 'hidden';
      }
      
      // Clean up
      document.body.removeChild(container);
    } catch (error) {
      console.error('Error generating image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate attendance image: ${errorMessage}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden bg-[#EBE9E0]/40 backdrop-blur border-2 border-gray-300 rounded-2xl shadow-sm max-w-[1400px] mx-auto">
      <div 
        className="p-4 sm:p-5 lg:p-6 border-b-2 border-gray-300 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-[#EBE9E0]/80 p-1.5 rounded-full">
            <CheckCircle className="h-5 w-5 text-primary/80" />
          </div>
          <h3 className="font-semibold text-gray-800 text-lg lg:text-xl">Event Attendance</h3>
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
          {!loading && attendanceData.length > 0 && isExpanded && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent div's onClick
                downloadAllCardsAsPng();
              }}
              disabled={downloading}
              className="h-10 lg:h-11 text-base lg:text-lg px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border-2 border-blue-200 font-medium flex-1 sm:flex-auto"
            >
              {downloading ? (
                <>
                  <div className="h-5 w-5 lg:h-5 lg:w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Archive className="h-5 w-5 lg:h-5 lg:w-5 mr-2" />
                  <span className="whitespace-nowrap">Download ALL</span>
                </>
              )}
            </Button>
          )}
          {!loading && attendanceData.length > 0 && isExpanded && (
            <Badge variant="outline" className="bg-[#EBE9E0]/70 text-gray-700 hover:bg-[#EBE9E0] px-3 py-1.5 text-sm sm:text-base font-medium h-10 flex items-center justify-center border-2 border-gray-300">
              <span className="whitespace-nowrap">{attendanceData.filter(a => a.is_present).length} Event{attendanceData.filter(a => a.is_present).length !== 1 ? 's' : ''}</span>
            </Badge>
          )}
          <div className="flex items-center justify-center h-10 w-10">
            <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="h-7 w-40 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ) : attendanceData.length > 0 ? (
            <>
              {/* Visible grid of cards */}
              <div className={`grid grid-cols-1 ${attendanceData.length > 1 ? 'xl:grid-cols-2' : ''} gap-5 xl:gap-6`}>
                {attendanceData.slice(0, 3).map((record, index) => (
                  <div 
                    key={record.id} 
                    className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-gray-300 overflow-hidden shadow-sm hover:shadow-md transition-all"
                    ref={(el) => { cardRefs.current[index] = el; }}
                  >
                    {/* Event image background - larger, with overflow */}
                    <div className="h-32 sm:h-40 lg:h-44 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[#EBE9E0]/40 z-10" />
                      {record.events.img_url ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={record.events.img_url}
                            alt={record.events.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover object-center opacity-60"
                            priority={true}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-[#EBE9E0]/60 to-[#EBE9E0]/20" />
                      )}
                      
                      {/* Logo overlaid on background */}
                      <div className="absolute top-1/2 left-6 transform -translate-y-1/2 z-20">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-xl shadow-md border-2 border-gray-200 p-2 sm:p-3">
                          {record.events.img_url ? (
                            <Image
                              src={record.events.img_url}
                              alt={`${record.events.name} logo`}
                              fill
                              sizes="(max-width: 640px) 5rem, 6rem"
                              className="object-contain p-1"
                              priority={true}
                            />
                          ) : (
                            <div className="w-full h-full rounded-lg bg-[#EBE9E0] flex items-center justify-center">
                              <CheckCircle className="h-10 w-10 text-primary/60" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Event type and status on the right */}
                      <div className="absolute top-0 right-0 p-3 flex flex-col items-end gap-2 z-20">
                        <Badge 
                          variant="outline" 
                          className="text-xs lg:text-sm capitalize px-2.5 py-0.5 bg-white/80 text-gray-700 border-2 border-gray-300"
                        >
                          {formatEventType(record.events.event_type)}
                        </Badge>
                        
                        {record.is_present ? (
                          <div className="flex items-center gap-1.5 text-xs lg:text-sm text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full border-2 border-green-200">
                            <CheckCircle className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                            <span>Present</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs lg:text-sm text-gray-500 font-medium bg-gray-50 px-2.5 py-1 rounded-full border-2 border-gray-300">
                            <XCircle className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                            <span>Not marked</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Event information section with user info */}
                    <div className="p-4 sm:p-5 lg:p-6 pt-3 lg:pt-4 border-t-2 border-gray-300">
                      {/* Added user info section */}
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="text-sm font-medium text-gray-600">{userName || 'User'}</span>
                        </div>
                        {userPhone && (
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-600">{userPhone}</span>
                          </div>
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 text-lg lg:text-xl leading-tight mb-3">{record.events.name}</h4>
                      
                      {/* Attendance information */}
                      {record.is_present && (
                        <div className="bg-[#EBE9E0]/70 rounded-md px-4 py-3 mb-4 border-2 border-gray-300">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 lg:h-5 lg:w-5 shrink-0 text-primary/70" />
                              <span className="text-sm lg:text-base font-medium text-gray-700">
                                Marked: {formatDate(record.marked_at, true)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2.5 mt-3 lg:mt-4">
                        {record.events.whatsapp_url && (
                          <div className="flex flex-col">
                            <a 
                              href={record.events.whatsapp_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/15 transition-colors border-2 border-[#25D366]/30 text-sm lg:text-base font-medium"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 448 512"
                                className="h-4 w-4 lg:h-5 lg:w-5 fill-[#25D366]"
                              >
                                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                              </svg>
                              <span>WhatsApp Group</span>
                            </a>
                            
                            {/* Marked by information */}
                            {record.is_present && record.staff && (
                              <div className="mt-1.5 px-2 text-xs lg:text-sm text-gray-500 flex items-center">
                                <span className="opacity-60">Attendance verified by: </span>
                                <span className="ml-1 font-medium text-gray-600">{record.staff.full_name}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Individual download button removed */}
                        
                        {!record.is_present && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onShowQr}
                            className="h-9 lg:h-10 text-sm lg:text-base px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600 border-2 border-amber-200 font-medium"
                          >
                            <QrCode className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                            <span>Show QR</span>
                          </Button>
                        )}
                      </div>
                      
                      {/* Display marked by information when there's no WhatsApp link */}
                      {record.is_present && record.staff && !record.events.whatsapp_url && (
                        <div className="mt-3 text-xs lg:text-sm text-gray-500">
                          <span className="opacity-60">Verified by: </span>
                          <span className="font-medium text-gray-600">{record.staff.full_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {attendanceData.length > 3 && (
                  <Button 
                    variant="link" 
                    className="text-gray-600 hover:text-gray-800 p-0 h-auto flex items-center font-medium col-span-1 xl:col-span-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent closing the expanded section
                      router.push('/dashboard/attendance');
                    }}
                  >
                    <span>View all {attendanceData.length} attendance records</span>
                    <div className="ml-1 w-4 h-4 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </Button>
                )}

                {!attendanceData.some(record => record.is_present) && (
                  <div className="mt-3 bg-[#EBE9E0]/60 border-2 border-gray-300 rounded-lg p-4 text-sm lg:text-base text-gray-700 col-span-1 xl:col-span-2">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary/70 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">No attendance marked yet</p>
                        <p className="text-sm mt-1">
                          Please visit the registration desk on the ground to mark your attendance. You&apos;ll need to show your Attendance QR code.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-6 px-1 space-y-4 max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="bg-[#EBE9E0] p-2.5 rounded-full">
                  <MapPin className="h-6 w-6 text-primary/70" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">No attendance records found</p>
                  <p className="text-sm text-gray-500 mt-1.5">
                    Visit the registration desk on the ground to mark your attendance with your Attendance QR code
                  </p>
                </div>
              </div>

              <Button
                variant="outline" 
                size="sm"
                className="mt-2 bg-[#EBE9E0]/70 hover:bg-[#EBE9E0] border-2 border-gray-300 text-gray-700 h-10 px-4"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent collapsing the section
                  onShowQr();
                }}
              >
                <QrCode className="h-4 w-4 mr-2" /> 
                View Attendance QR
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
