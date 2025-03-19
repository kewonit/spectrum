"use client";

import { useEffect, useState, MouseEvent, useRef } from "react";
import { FileX, Search, LogIn, Download, Calendar, Award, Check, Copy, User, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import confetti from 'canvas-confetti';

// Event type for TypeScript
interface Event {
  id: string;
  name: string;
  // ... other event properties
}

// Certificate interface
interface Certificate {
  id: number;
  certificate_url: string;
  certificate_uuid: string | null;
  created_at: string;
  event: Event | null;
  recipient_name?: string;
}

// Props for the CertificateCard component
interface SimpleCertificateCardProps {
  certificate: Certificate;
  index: number;
}

// Simple CertificateCard component that doesn't use shadcn/ui
function SimpleCertificateCard({ certificate, index = 0 }: SimpleCertificateCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  // Add a ref to the download button
  const downloadButtonRef = useRef<HTMLButtonElement>(null);
  
  // Certificate title
  const certificateTitle = `Certificate #${index + 1}`;
  
  const formattedDate = certificate.created_at ? 
    format(new Date(certificate.created_at), "dd MMM yyyy") : 
    "Date not available";

  const previewImageUrl = "https://res.cloudinary.com/dfyrk32ua/image/upload/v1742325157/Spectrum/preview-certificate.webp";

  // Update triggerConfetti to use the ref instead of the event
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
  
  const handleDownload = async (e: MouseEvent<HTMLButtonElement>) => {
    try {
      setDownloadProgress(0);
      setIsDownloading(true);
      
      const pngUrl = certificate.certificate_url.replace(/\.pdf$/, '.png');
      
      let fileName = '';
      if (certificate.recipient_name) {
        const safeName = certificate.recipient_name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
        fileName = `Certificate_${safeName}_${certificate.id}.png`;
      } else {
        fileName = `Certificate_${certificate.id}.png`;
      }
      
      const downloadUrl = `/api/download?url=${encodeURIComponent(pngUrl)}&filename=${encodeURIComponent(fileName)}`;
      
      // Simulate progress
      const progressUpdates = [10, 25, 40, 60, 75, 90];
      let currentUpdateIndex = 0;
      
      const progressInterval = setInterval(() => {
        if (currentUpdateIndex < progressUpdates.length) {
          setDownloadProgress(progressUpdates[currentUpdateIndex]);
          currentUpdateIndex++;
        }
      }, 300);
      
      try {
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
          throw new Error(`Download failed: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setDownloadProgress(100);
        // Call triggerConfetti without passing the event
        triggerConfetti();
      } catch (error) {
        console.error(error);
      } finally {
        clearInterval(progressInterval);
      }
      
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
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
    
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
      <div className="relative aspect-[16/9] w-full bg-gray-100">
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse"></div>
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
          <span className="inline-flex items-center rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-gray-800">
            #{index + 1}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h3 className="font-medium text-sm truncate">{certificateTitle}</h3>
          <div className="flex items-center mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            <span className="text-xs opacity-90">{formattedDate}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200">
            <Award className="h-3 w-3 mr-1" />
            Certificate
          </span>
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 border border-gray-200">
            <FileText className="h-3 w-3 mr-1" />
            ID: {certificate.id}
          </span>
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
      </div>
      
      <div className="px-4 pt-0 pb-4 flex gap-2">
        <div className="relative w-full max-w-[160px]">
          <button 
            ref={downloadButtonRef} // Add the ref here
            onClick={handleDownload} 
            disabled={isDownloading}
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none px-3 py-2 h-9 w-full
              bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700
              ${isDownloading ? 'cursor-not-allowed' : ''}`}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? `${Math.round(downloadProgress)}%` : 'Download'}
          </button>
          
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
          <button 
            onClick={handleCopyVerificationLink} 
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none px-3 py-2 h-9
              bg-transparent hover:bg-gray-100 text-gray-700
              ${isCopied ? "text-green-600" : ""}`}
          >
            {isCopied ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {isCopied ? 'Copied' : 'Verify'}
          </button>
        )}
      </div>
    </div>
  );
}

// Main component
export function SimpleCertificateList() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/certificates');
        
        if (response.status === 401) {
          setIsUnauthorized(true);
          setError("Please login to view your certificates");
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch certificates');
        }
        
        const data = await response.json();
        setCertificates(data.certificates || []);
      } catch (err: any) {
        console.error('Error fetching certificates:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificates();
  }, []);
  
  const filteredCertificates = certificates.filter(cert => {
    if (!searchQuery) return true;
    
    // Safely check if event exists and has a name before filtering
    const eventName = cert.event?.name;
    if (!eventName) return false;
    
    return eventName.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg overflow-hidden bg-white/60">
            <div className="h-48 w-full bg-gray-200 animate-pulse"></div>
            <div className="p-4 space-y-3">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="flex gap-2 pt-2">
                <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (isUnauthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-blue-50 p-3 rounded-full mb-4">
          <LogIn className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in to view your certificates</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          Sign in to your account to view, download, or verify your certificates.
        </p>
        <div className="flex gap-3">
          <Link href="/login" className="inline-flex items-center justify-center rounded-md font-medium px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
            Sign In
          </Link>
          <Link href="/verify-certificate" className="inline-flex items-center justify-center rounded-md font-medium px-4 py-2 bg-transparent border border-gray-200 text-gray-900 hover:bg-gray-100">
            Verify a Certificate
          </Link>
        </div>
      </div>
    );
  }
  
  if (error && !isUnauthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-red-50 p-3 rounded-full mb-4">
          <FileX className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load certificates</h3>
        <p className="text-gray-500 mb-4 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-md font-medium px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-blue-50 p-3 rounded-full mb-4">
          <FileX className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
        <p className="text-gray-500 mb-4 max-w-md">
          You don&apos;t have any certificates yet. Certificates are awarded after attending events or completing specific achievements.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          placeholder="Search certificates by event name..."
          className="w-full pl-9 py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {filteredCertificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <Search className="h-8 w-8 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-700">No matching certificates</h3>
          <p className="text-gray-500 mt-1">
            Try adjusting your search term
          </p>
          <button 
            onClick={() => setSearchQuery("")}
            className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate, index) => (
            <SimpleCertificateCard 
              key={certificate.id} 
              certificate={certificate}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
