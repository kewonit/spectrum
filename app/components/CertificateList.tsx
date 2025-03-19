"use client";

import { useEffect, useState } from "react";
import { CertificateCard } from "@/components/CertificateCard";
import { toast } from "sonner";
import { FileX, Search, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Event } from "@/app/types/database"; // Import the common Event type

// Updated Certificate interface to match CertificateCard's expectations
interface Certificate {
  id: number;
  certificate_url: string;
  certificate_uuid: string | null;
  created_at: string;
  event: Event | null;
  recipient_name?: string; // Add recipient name field
}

export function CertificateList() {
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
        if (!isUnauthorized) {
          toast.error("Failed to load certificates", {
            description: err.message || "Please try again later",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificates();
  }, [isUnauthorized]);
  
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
          <div key={i} className="border rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
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
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
          <Link href="/verify-certificate">
            <Button variant="outline">Verify a Certificate</Button>
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
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
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
        <Input
          placeholder="Search certificates by event name..."
          className="pl-9 bg-white"
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
          <Button variant="link" onClick={() => setSearchQuery("")}>
            Clear search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate, index) => (
            <CertificateCard 
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
