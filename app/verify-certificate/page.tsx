"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircleIcon, Calendar, Award, User, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface VerificationResult {
  verified: boolean;
  certificate?: {
    id: number;
    event_name: string;
    event_id?: string;
    event_description?: string | null;
    created_at: string;
    recipient: string;
    email?: string;
  };
  error?: string;
}

// Create a separate component for the verification form to use Suspense
function VerificationForm() {
  const searchParams = useSearchParams();
  const [certificateUuid, setCertificateUuid] = useState<string>(
    searchParams?.get("uuid") || ""
  );
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [initialVerificationDone, setInitialVerificationDone] = useState<boolean>(false);

  // Run verification if UUID is provided in URL
  useEffect(() => {
    const uuid = searchParams?.get("uuid");
    if (uuid && !initialVerificationDone) {
      setCertificateUuid(uuid);
      verifyCertificate(uuid);
      setInitialVerificationDone(true);
    }
  }, [searchParams, initialVerificationDone]);

  const verifyCertificate = async (uuid: string) => {
    if (!uuid.trim()) {
      setVerificationResult({
        verified: false,
        error: "Please enter a certificate verification code"
      });
      return;
    }

    try {
      setIsVerifying(true);
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ certificateUuid: uuid }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setVerificationResult({
          verified: false,
          error: data.error || "Certificate verification failed"
        });
        return;
      }

      setVerificationResult({
        verified: true,
        certificate: data.certificate
      });
    } catch (error) {
      console.error("Certificate verification error:", error);
      setVerificationResult({
        verified: false,
        error: "An error occurred during verification. Please try again."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCertificate(certificateUuid);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            Verify Certificate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter certificate verification code"
              value={certificateUuid}
              onChange={(e) => setCertificateUuid(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isVerifying || !certificateUuid.trim()}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying
                </>
              ) : "Verify"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <div className="space-y-6">
          {verificationResult.verified ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-green-50 p-4 border-b border-green-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-green-800">Certificate Verified</h2>
                      <p className="text-sm text-green-700">
                        This certificate has been verified as authentic
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <Image 
                      src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1742325667/Spectrum/aaxf61v0t_1_ilpblu.webp"
                      alt="Verified Badge"
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="sm:hidden flex justify-center mb-4">
                  <Image 
                    src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1742325667/Spectrum/aaxf61v0t_1_ilpblu.webp"
                    alt="Verified Badge"
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                </div>
                <div className="space-y-4">
                  {/* Remove event details section */}
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h4 className="flex items-center font-medium text-gray-700 mb-3">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      Certificate Recipient
                    </h4>
                    <dl className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:gap-2">
                        <dt className="text-sm font-medium text-gray-500">Name:</dt>
                        <dd className="text-sm text-gray-900">{verificationResult.certificate?.recipient || "Not available"}</dd>
                      </div>
                      {/* Remove email display */}
                      <div className="flex flex-col sm:flex-row sm:gap-2">
                        <dt className="text-sm font-medium text-gray-500">Issued:</dt>
                        <dd className="text-sm text-gray-900">{formatDate(verificationResult.certificate?.created_at || "")}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div className="flex items-center justify-center mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setVerificationResult(null)}
                      className="mr-2"
                    >
                      Verify Another
                    </Button>
                    <Link href="/">
                      <Button variant="secondary" size="sm">
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Verification Failed</AlertTitle>
              <AlertDescription className="text-red-700">
                {verificationResult.error || "Could not verify the certificate. Please check the code and try again."}
              </AlertDescription>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setVerificationResult(null)}
                  className="bg-white"
                >
                  Try Again
                </Button>
              </div>
            </Alert>
          )}
        </div>
      )}
    </>
  );
}

// Fallback component while loading
function VerificationFormSkeleton() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyCertificatePage() {
  return (
    <div className="min-h-screen bg-[#EBE9E0] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Stylized header to match certificate page */}
        <div className="relative mb-8 sm:mb-10">
          <div className="absolute inset-0 -m-2 sm:-m-4">
            <div className="w-full h-full border-4 border-dashed border-gray-300/70 rounded-3xl" />
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full" />
              
              <div className="p-5 sm:p-7 py-7 sm:py-8 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Certificate Verification</h1>
                <p className="mt-2 text-gray-500">
                  Verify the authenticity of certificates issued by Spectrum
                </p>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<VerificationFormSkeleton />}>
          <VerificationForm />
        </Suspense>
        
        {/* Styled footer to match certificate page style */}
        <div className="relative mt-10">
          <div className="absolute inset-0 -m-2 sm:-m-4">
            <div className="w-full h-full border-4 border-dashed border-gray-300/70 rounded-3xl" />
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full" />
              
              <div className="p-5 sm:p-6 text-center">
                <p className="text-gray-600 mb-2">
                  Looking for your own certificates?
                </p>
                <Link 
                  href="/dashboard/certificates" 
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                >
                  Go to your certificate dashboard
                  <svg 
                    className="ml-1 h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 7l5 5m0 0l-5 5m5-5H6" 
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
