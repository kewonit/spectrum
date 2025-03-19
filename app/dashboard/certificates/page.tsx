"use client";

import { Breadcrumbs } from "@/app/components/breadcrumbs";
import { CertificateList } from "@/app/components/CertificateList";
import { FileText, Share2, Award, Info, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/user');
        setUserLoggedIn(response.ok);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUserLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  // If we don't know the auth status yet, show nothing to prevent flashing
  if (userLoggedIn === null) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#EBE9E0]">
      <TooltipProvider>
        <div className="w-full max-w-screen-xl mx-auto p-4 sm:px-6 lg:p-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Certificates' },
            ]}
            className="mb-6"
          />

          {/* Header - Added more top margin (mt-6) and styling to match verification section */}
          <div className="relative mb-8 sm:mb-10 mt-6 sm:mt-8">
            <div className="absolute inset-0 -m-2 sm:-m-4">
              <div className="w-full h-full border-4 border-dashed border-gray-300/70 rounded-3xl" />
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full" />
                
                <div className="p-5 sm:p-7 py-7 sm:py-9">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                        <FileText className="mr-3 h-7 w-7 text-blue-600" />
                        {userLoggedIn ? "Your Certificates" : "Certificates"}
                      </h1>
                      <p className="mt-2 text-gray-500">
                        {userLoggedIn 
                          ? "View and download certificates from events you've attended" 
                          : "Sign in to view and download your certificates"}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {userLoggedIn ? (
                        <Link
                          href="/dashboard/events"
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          <Award className="mr-1.5 h-4 w-4" />
                          More Events
                        </Link>
                      ) : (
                        <Link
                          href="/login"
                          className={buttonVariants({ size: "sm" })}
                        >
                          <LogIn className="mr-1.5 h-4 w-4" />
                          Sign In
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Alert - Visible to all */}
          <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              {userLoggedIn 
                ? "Certificates are automatically issued after successfully attendance in eligible events. You can download and share these certificates as proof of your participation or achievement."
                : "Verify certificates using the verification link or the button below. Sign in to access your own certificates."}
            </AlertDescription>
          </Alert>

          {/* Main content - Shows certificates for logged in users, sign in prompt for guests */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm p-6">
            {userLoggedIn ? (
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-6">
                  <TabsList className="bg-gray-100/80">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white">
                      All Certificates
                    </TabsTrigger>
                    <TabsTrigger value="recent" className="data-[state=active]:bg-white">
                      Recent
                    </TabsTrigger>
                    </TabsList>
                </div>
                
                <TabsContent value="all" className="mt-0">
                  <CertificateList />
                </TabsContent>
                
                <TabsContent value="recent" className="mt-0">
                  <CertificateList />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center py-12">
                <div className="p-4 bg-blue-50 rounded-full mb-4">
                  <LogIn className="h-10 w-10 text-blue-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sign In to View Certificates</h2>
                <p className="text-gray-600 mb-6 text-center max-w-md">
                  You need to sign in to view and download your certificates.
                  Certificates are awarded for event participation and achievements.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => router.push('/login')}>
                    Sign In
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/verify-certificate')}>
                    Verify a Certificate
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Verification Section - Updated to match the header style */}
          <div className="mt-10">
            <div className="relative">
              {/* Background pattern with dashed border */}
              <div className="absolute inset-0 -m-2 sm:-m-4">
                <div className="w-full h-full border-4 border-dashed border-gray-300/70 rounded-3xl" />
              </div>

              {/* Card container */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full" />
                  
                  <div className="p-5 sm:p-7">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Share2 className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Certificate Verification</h3>
                        <p className="text-gray-600">
                          Verify the authenticity of any certificate by using our certificate verification tool.
                        </p>
                      </div>
                      
                      <div className="mt-4 sm:mt-0">
                        <Button
                          onClick={() => router.push('/verify-certificate')}
                          className="whitespace-nowrap px-5"
                          size="lg"
                        >
                          Verify Certificate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
