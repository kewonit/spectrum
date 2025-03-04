'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CalendarDays } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import domtoimage from 'dom-to-image';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { toast } from "sonner";
import { generateSimpleQRCard } from '@/lib/attendanceCardGenerator';

type RegistrationData = {
  id: string;
  event: {
    id: string;
    name: string;
    event_type: 'solo' | 'fixed_team' | 'variable_team';
  };
  type: 'solo' | 'team';
  status: string;
  team?: {
    name: string;
  };
};

type AttendanceCardProps = {
  profile: any;
  className?: string;
  onClose?: () => void;
};

export function AttendanceCard({ profile, className, onClose }: AttendanceCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadVersion, setShowDownloadVersion] = useState(false);
  const [generationAttempts, setGenerationAttempts] = useState(0);
  
  // Two refs - one for display, one for download
  const cardRef = useRef<HTMLDivElement>(null);
  const downloadCardRef = useRef<HTMLDivElement>(null);

  // Fetch user's registrations
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!profile?.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/registrations/active');
        if (!response.ok) {
          throw new Error('Failed to fetch registrations');
        }
        
        const data = await response.json();
        setRegistrations(data.registrations || []);
      } catch (error) {
        console.error('Error fetching registrations:', error);
        setError('Failed to load event registrations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrations();
  }, [profile?.id]);

  // Reset generation attempts when component unmounts
  useEffect(() => {
    return () => {
      setGenerationAttempts(0);
    };
  }, []);

  if (!profile?.id) {
    return (
      <div className={cn("p-6 text-center rounded-lg bg-gray-50", className)}>
        <p className="text-gray-500">Complete your profile to generate an attendance card</p>
      </div>
    );
  }

  // Helper function to prepare the card for generation
  const prepareDownloadCard = () => {
    setShowDownloadVersion(true);
    
    return new Promise<HTMLElement>((resolve, reject) => {
      // Wait for the card to be rendered in the DOM
      setTimeout(() => {
        if (!downloadCardRef.current) {
          reject(new Error('Download card element not found'));
          return;
        }

        // Clone the node to avoid modifying the original
        const clonedNode = downloadCardRef.current.cloneNode(true) as HTMLElement;
        
        // Make sure we see all content
        clonedNode.style.height = 'auto';
        clonedNode.style.width = 'auto';
        clonedNode.style.overflow = 'visible';
        clonedNode.style.padding = '20px';
        
        // Ensure background color is preserved
        clonedNode.style.backgroundColor = '#f8fafc';
        
        // Fix text styling
        const textElements = clonedNode.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span');
        textElements.forEach(el => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.margin = '0';
          htmlEl.style.padding = '0';
          htmlEl.style.lineHeight = '1.5';
        });
        
        resolve(clonedNode);
      }, 300);
    });
  };

  // Primary function to generate image blob using dom-to-image with higher resolution
  const generateCardImage = async (): Promise<Blob> => {
    if (!downloadCardRef.current) {
      console.error("Download card element not found in generateCardImage");
      throw new Error('Download card element not found');
    }
    
    try {
      // Higher scale factor for better resolution
      const scale = 3; // Increase from default to get higher resolution
      const node = downloadCardRef.current;
      
      // Get dimensions
      const width = node.offsetWidth;
      const height = node.scrollHeight;
      
      // Configure dom-to-image options with high resolution settings
      const options = {
        quality: 1.0, // Maximum quality
        bgcolor: '#f8fafc',
        height: height * scale,
        width: width * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${width}px`,
          height: `${height}px`
        },
        cacheBust: true,
        // Increase internal resolution
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      };
      
      console.log("Generating high-resolution image");
      const blob = await domtoimage.toBlob(node, options);
      console.log("High-res image generated successfully");
      return blob;
    } catch (error) {
      console.error('Error in high-res image generation:', error);
      throw error;
    }
  };

  // Fallback method with improved resolution
  const generateCardImageFallback = async (): Promise<string> => {
    if (!downloadCardRef.current) {
      throw new Error('Download card element not found');
    }
    
    try {
      // Try JPEG with increased scale for higher resolution
      const scale = 2.5;
      const node = downloadCardRef.current;
      const width = node.offsetWidth;
      const height = node.scrollHeight;
      
      const dataUrl = await domtoimage.toJpeg(node, {
        quality: 0.95, // Higher quality
        bgcolor: '#f8fafc',
        height: height * scale,
        width: width * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${width}px`,
          height: `${height}px`
        },
        cacheBust: true
      });
      
      return dataUrl;
    } catch (error) {
      console.error('Fallback image generation failed:', error);
      throw error;
    }
  };

  // Handle download with improved preparation
  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      // Try the simple QR card first - most reliable method
      try {
        const result = await generateSimpleQRCard(profile);
        
        if (result.success && result.imageUrl) {
          // Create download link
          const link = document.createElement('a');
          link.href = result.imageUrl;
          link.download = result.fileName || `${profile.full_name || 'Attendee'}-QR-Card.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up
          if (result.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(result.imageUrl);
          }
          
          toast.success('QR card downloaded successfully');
          setIsGenerating(false);
          return;
        }
      } catch (simpleError) {
        console.error('Simple QR card generation failed:', simpleError);
        // Continue to try other methods
      }
      
      // Only run the more complex code if the simple method failed
      setShowDownloadVersion(true);
      setGenerationAttempts(prev => prev + 1);
      
      // Wait longer for high-res rendering
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!downloadCardRef.current) {
        console.error("Download card ref is still null after waiting");
        toast.error("Failed to generate card", { 
          description: "The card element couldn't be found" 
        });
        return;
      }
      
      // Ensure the card is properly sized before generation
      const node = downloadCardRef.current;
      node.style.width = '340px';
      node.style.minHeight = '700px';
      
      let imageBlob: Blob | null = null;
      let imageUrl: string | null = null;
      
      if (!downloadCardRef.current) {
        console.error("Download card ref is still null after waiting");
        toast.error("Failed to generate card", { 
          description: "The card element couldn't be found" 
        });
        return;
      }
      
      try {
        // Try the primary method first
        imageBlob = await generateCardImage();
      } catch (error) {
        console.warn('Primary image generation failed, trying fallback:', error);
        
        try {
          // If primary method fails, try fallback
          imageUrl = await generateCardImageFallback();
        } catch (fallbackError) {
          throw new Error('Both image generation methods failed');
        }
      }
      
      // Create download link
      const link = document.createElement('a');
      
      if (imageBlob) {
        link.href = URL.createObjectURL(imageBlob);
      } else if (imageUrl) {
        link.href = imageUrl;
      } else {
        throw new Error('Failed to generate image');
      }
      
      // Use a better file name with date
      const date = new Date().toLocaleDateString().replace(/\//g, '-');
      const fileName = `${profile.full_name || 'Attendee'}-Spectrum-Card-${date}.png`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (imageBlob) {
        URL.revokeObjectURL(link.href); // Clean up
      }
      
      toast.success('High-quality card downloaded successfully');
    } catch (error) {
      console.error('Error in download process:', error);
      toast.error('Failed to download card', { 
        description: 'Please try again or use a different browser' 
      });
      
      // Retry up to 2 times with different methods if failed
      if (generationAttempts < 2) {
        toast.info('Retrying with alternative method...');
        setTimeout(() => handleDownload(), 500);
        return;
      }
    } finally {
      setShowDownloadVersion(false);
      setIsGenerating(false);
    }
  };

  // Content for the card - reused in both display and download versions
  const CardContent = ({ isForDownload = false }) => (
    <div className="relative z-10 flex flex-col h-full">
      {/* Logo section - unchanged */}
      <div className="bg-black p-4 pt-5 border-b border-gray-800 flex justify-center">
        <img 
          src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705914025/Spectrum/Homepage/logo_qb4lcm.png"
          alt="Spectrum Logo" 
          width={180}
          height={48}
          className={cn(
            "w-auto object-contain",
            isForDownload ? "h-16" : "h-12"
          )}
        />
      </div>
      
      {/* Card header - make slightly more compact on mobile */}
      <div className="p-3 sm:p-5 pb-3 flex items-center justify-between">
        <h3 className="font-bold text-blue-900 tracking-tight text-sm sm:text-base">Attendance Card</h3>
        <div className="bg-blue-600/10 text-blue-600 px-2 py-0.5 text-xs font-medium rounded-full">
          SPECTRUM 2025
        </div>
      </div>
      
      {/* QR Code section - slightly more compact for mobile */}
      <div className="px-5 pb-3 flex flex-col items-center">
        <div className="bg-white rounded-lg p-2.5 shadow-sm mb-2 border border-gray-100">
          <QRCodeSVG
            value={profile.id}
            size={isForDownload ? 140 : 130}
            level="H"
            bgColor="#ffffff"
            fgColor="#000000"
            includeMargin={true}
          />
        </div>
        <p className="text-xs text-center text-gray-500 mb-0">Scan for event check-in</p>
      </div>
      
      {/* Profile info section - slightly more compact */}
      <div className="px-5 py-2 sm:py-3 border-t border-b border-blue-100/50 bg-white/60">
        <h2 className="font-bold text-base sm:text-lg text-gray-800 leading-tight mb-1.5">
          {profile.full_name}
        </h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:gap-y-2 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Email</p>
            <p className="font-medium text-gray-700 text-xs sm:text-sm truncate mb-0">{profile.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Phone</p>
            <p className="font-medium text-gray-700 text-xs sm:text-sm mb-0">{profile.phone || 'N/A'}</p>
          </div>
          <div className="col-span-2 mt-0.5">
            <p className="text-xs text-gray-500 mb-0.5">College</p>
            <p className="font-medium text-blue-600 text-xs sm:text-sm truncate mb-0">{profile.college_name || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      {/* Registered events section - SIGNIFICANTLY INCREASED SCROLL AREA */}
      <div className={cn(
        "px-4 sm:px-5 py-2 sm:py-3", 
        !isForDownload && "flex-1 flex flex-col",  // Use flex to allow child to expand
        isForDownload && "min-h-[100px]"
      )}>
        <div className="flex items-center gap-1.5 mb-2">
          <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
          <p className="text-sm font-medium text-blue-700 mb-0">Registered Events</p>
        </div>
        
        {/* This div will now take all available space */}
        <div className={cn(
          "overflow-y-auto pr-1 flex-1",  // Use flex-1 to expand
          !isForDownload && "min-h-[140px] sm:min-h-[180px]"  // Ensure minimum height
        )}>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-11/12" />
              <Skeleton className="h-6 w-10/12" />
            </div>
          ) : error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : registrations.length === 0 ? (
            <p className="text-xs text-gray-500 italic mb-0">No registered events</p>
          ) : (
            <div className="space-y-2 pb-2">
              {/* Always show all events, not just first 5 */}
              {registrations.map((reg, index) => (
                <div 
                  key={reg.id}
                  className="text-xs bg-white/80 p-2.5 rounded-md border border-blue-50 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium truncate">{reg.event.name}</span>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0 h-4",
                        reg.type === 'solo' 
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    >
                      {reg.type === 'solo' ? 'Solo' : 'Team'}
                    </Badge>
                  </div>
                  
                  {reg.type === 'team' && reg.team && (
                    <p className="text-[10px] text-gray-500 truncate mb-0">
                      Team: {reg.team.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer - fixed structure */}
      <div className="p-3 sm:p-4 flex justify-between items-center bg-white/40 text-xs text-gray-500 border-t border-blue-100/50 relative z-10">
        <div>ID: {profile.id.substring(0, 8)}...</div>
        <div className="font-medium text-blue-600">PCCOE Spectrum</div>
      </div>
    </div>
  );

  // Update the return section with improved card container
  return (
    <div className={cn("space-y-3 sm:space-y-4", className)}>
      {/* Regular Card with 9:16 aspect ratio - for display - made responsive AND SCROLLABLE */}
      <div className="mx-auto" style={{ maxWidth: '320px', maxHeight: 'calc(100vh - 280px)' }}> {/* Height constraint added */}
        <div 
          ref={cardRef}
          className="relative overflow-hidden bg-[#EBE9E0]/40 backdrop-blur-sm border border-gray-200 rounded-xl sm:rounded-2xl shadow-lg"
          style={{ aspectRatio: '9/16', maxHeight: '100%' }}
        >
          <div className="absolute inset-0 overflow-y-auto"> {/* Make entire card scrollable */}
            {/* Ticket-like decorative elements - adjusted for size */}
            <div className="sticky right-0 top-1/2 -translate-y-1/2 w-2 sm:w-3 h-5 sm:h-6 bg-white rounded-l-full z-20"></div>
            <div className="sticky left-0 top-1/2 -translate-y-1/2 w-2 sm:w-3 h-5 sm:h-6 bg-white rounded-r-full z-20"></div>
            
            {/* Decorative gradients */}
            <div className="absolute top-0 right-0 h-24 sm:h-32 w-24 sm:w-32 -mt-12 sm:-mt-16 -mr-12 sm:-mr-16 bg-blue-200/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 h-20 sm:h-24 w-20 sm:w-24 -mb-10 sm:-mb-12 -ml-10 sm:-ml-12 bg-purple-200/30 rounded-full blur-2xl" />
            
            <CardContent />
          </div>
        </div>
      </div>
      
      {/* Always render the download card but keep it hidden when not needed */}
      <div 
        className="fixed left-[-9999px] top-[-9999px]" 
        style={{ 
          width: '340px', 
          zIndex: -100, 
          visibility: showDownloadVersion ? 'visible' : 'hidden',
          opacity: 0,
          position: 'absolute'
        }}
      >
        <div 
          ref={downloadCardRef}
          className="bg-[#EBE9E0]/40 border border-gray-200 shadow-sm rounded-xl overflow-hidden"
          style={{ 
            width: '340px', 
            minHeight: '700px',
            maxWidth: '340px',
            paddingBottom: '16px'
          }}
        >
          {/* Ticket-like decorative elements for download version */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white rounded-l-full"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white rounded-r-full"></div>
          
          {/* More pronounced decorative elements for download */}
          <div className="absolute top-0 right-0 h-32 w-32 -mt-16 -mr-16 bg-blue-200/30 rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 -mb-16 -ml-16 bg-purple-200/40 rounded-full blur-xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 -mb-12 -mr-12 bg-indigo-100/30 rounded-full blur-lg" />
          <div className="absolute top-1/3 left-0 h-12 w-12 -ml-6 bg-blue-100/20 rounded-full blur-md" />
          
          <CardContent isForDownload={true} />
          
          {/* Extra space to prevent text cutoff in download */}
          <div className="h-5"></div>
        </div>
      </div>
      
      {/* SMALLER Download button with text adjustment */}
      <Button
        variant="outline"
        size="sm" // Changed from "lg" to "sm"
        className="w-full transition-colors duration-200 group bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700 border-purple-200 hover:border-purple-300 h-10"
        onClick={handleDownload}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-1.5 shrink-0" />
        )}
        <span className="text-sm">{isGenerating ? 'Generating...' : 'Download Card'}</span>
      </Button>
      
      {/* Debug element - keep for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="hidden">
          Download card ref status: {downloadCardRef.current ? 'Available' : 'Not available'}
        </div>
      )}
    </div>
  );
}
