"use client";

import { Suspense, lazy } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

// Import the components dynamically to avoid SSR issues
const VerificationForm = dynamic(
  () => import('@/app/components/VerificationForm').then(mod => mod.VerificationForm),
  { 
    ssr: false,
    loading: () => <SimpleSkeleton />
  }
);

// Create a simple skeleton that doesn't rely on cn function
function SimpleSkeleton() {
  return (
    <Card className="mb-8">
      <div className="p-4">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-10 flex-1 bg-gray-200 rounded"></div>
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
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

        {/* Use dynamic imports with client-side only rendering */}
        <VerificationForm />
        
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
