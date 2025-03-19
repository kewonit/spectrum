"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Award, Check, Copy, User, FileText } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Event } from "@/app/types/database";
import confetti from 'canvas-confetti';
import { Progress } from "@/components/ui/progress"; // Add Progress import

interface CertificateCardProps {
  certificate: {
    id: number;
    certificate_url: string;
    certificate_uuid?: string | null;
    created_at: string;
    event: Event | null;
    recipient_name?: string;
  };
  index?: number; // Add index prop for certificate numbering
}

export function CertificateCard({ certificate, index = 0 }: CertificateCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const downloadButtonRef = useRef<HTMLButtonElement>(null);
  
  // Use a generic certificate title instead of event name
  const certificateTitle = `Certificate #${index + 1}`;
  
  const triggerConfetti = () => {
    if (downloadButtonRef.current) {
      const rect = downloadButtonRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#4285F4', '#0F9D58', '#F4B400', '#DB4437'],
        disableForReducedMotion: true
      });
    }
  };
  
  const handleDownload = async () => {
    try {
      // Reset progress and set downloading state
      setDownloadProgress(0);
      setIsDownloading(true);
      
      // Get the PNG version of the certificate URL
      const pngUrl = certificate.certificate_url.replace(/\.pdf$/, '.png');
      
      // Create a safe filename for the download that includes the recipient name
      let fileName = '';
      if (certificate.recipient_name) {
        // Replace spaces with underscores and remove special characters for a safe filename
        const safeName = certificate.recipient_name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
        fileName = `Certificate_${safeName}_${certificate.id}.png`;
      } else {
        fileName = `Certificate_${certificate.id}.png`;
      }
      
      // Create the download URL with our server-side proxy
      const downloadUrl = `/api/download?url=${encodeURIComponent(pngUrl)}&filename=${encodeURIComponent(fileName)}`;
      
      // Don't show toast, only track progress in UI
      
      // Simulate progress updates (since fetch doesn't provide progress events easily)
      const progressUpdates = [10, 25, 40, 60, 75, 90];
      let currentUpdateIndex = 0;
      
      const progressInterval = setInterval(() => {
        if (currentUpdateIndex < progressUpdates.length) {
          setDownloadProgress(progressUpdates[currentUpdateIndex]);
          currentUpdateIndex++;
        }
      }, 300); // Update every 300ms for a smoother experience
      
      try {
        // Use fetch to get the file
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
          throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }
        
        // Get the blob
        const blob = await response.blob();
        
        // Create a download link and trigger it
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Set progress to 100% when complete
        setDownloadProgress(100);
        
        // Trigger confetti (but no toast)
        triggerConfetti();
      } catch (error) {
        throw error;
      } finally {
        // Always clear the interval
        clearInterval(progressInterval);
      }
      
      // Reset download state after a short delay
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
      
      // Don't show error toast, just log to console
    }
  };
  
  const handleCopyVerificationLink = () => {
    if (!certificate.certificate_uuid) {
      console.error("Verification link not available for this certificate");
      return;
    }
    
    const verificationUrl = `${window.location.origin}/verify-certificate?uuid=${certificate.certificate_uuid}`;
    navigator.clipboard.writeText(verificationUrl);
    setIsCopied(true);
    
    // No toast notification, just visual feedback via state change
    
    // Reset the copy button after 3 seconds
    setTimeout(() => setIsCopied(false), 3000);
  };
  
  const formattedDate = certificate.created_at ? 
    format(new Date(certificate.created_at), "dd MMM yyyy") : 
    "Date not available";

  // Use a general certificate preview image instead of individual ones
  const previewImageUrl = "https://res.cloudinary.com/dfyrk32ua/image/upload/v1742325157/Spectrum/preview-certificate.webp";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-[16/9] w-full bg-gray-100">
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        )}
        <Image
          src={previewImageUrl}
          alt="Certificate"
          fill
          className="object-cover"
          onLoad={() => setIsImageLoading(false)}
          onError={() => setIsImageLoading(false)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-800 font-medium">
            #{index + 1}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h3 className="font-medium text-sm truncate">{certificateTitle}</h3>
          <div className="flex items-center mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            <span className="text-xs opacity-90">{formattedDate}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
            <Award className="h-3 w-3 mr-1" />
            Certificate
          </Badge>
          <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200">
            <FileText className="h-3 w-3 mr-1" />
            ID: {certificate.id}
          </Badge>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-1">Certificate of Achievement</h3>
        
        {certificate.recipient_name && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <User className="h-3.5 w-3.5 mr-1 text-gray-500" />
            <span className="font-medium">{certificate.recipient_name}</span>
          </div>
        )}
        
        <p className="text-sm text-gray-500 line-clamp-2">
          Awarded for participation or achievement in an event.
        </p>
      </CardContent>
      
      <CardFooter className="px-4 pt-0 pb-4 gap-2">
        <div className="relative w-full max-w-[160px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                ref={downloadButtonRef}
                size="sm" 
                variant="outline" 
                onClick={handleDownload} 
                disabled={isDownloading}
                className={`bg-blue-50 hover:bg-blue-100 border-blue-200 w-full ${isDownloading ? 'cursor-not-allowed' : ''}`}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? `${Math.round(downloadProgress)}%` : 'Download'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download certificate image</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Progress bar below the button - only visible during download */}
          {isDownloading && (
            <div className="w-full mt-1 rounded-full h-1 bg-gray-200 overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                style={{ width: `${downloadProgress}%` }} 
              />
            </div>
          )}
        </div>
        
        {certificate.certificate_uuid && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleCopyVerificationLink} 
                className={isCopied ? "text-green-600" : ""}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 mr-1" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                {isCopied ? 'Copied' : 'Verify'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy verification link</p>
            </TooltipContent>
          </Tooltip>
        )}
      </CardFooter>
    </Card>
  );
}
