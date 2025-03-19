"use client";

import { useState, useEffect, ReactNode, MouseEvent } from "react";
import { FileText, Share2, Award, Info, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Import minimal CertificateList component
// Fix the path to point to the correct location
const CertificateList = dynamic(() => import("@/app/components/SimpleCertificateList").then(mod => mod.SimpleCertificateList), {
  ssr: false,
  loading: () => <SimpleLoadingSkeleton />
});

interface SimpleButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: "default" | "outline" | "destructive";
  size?: "default" | "sm" | "lg";
  className?: string;
  href?: string;
  [key: string]: any; // For other props
}

// Simple button component without cn() dependency
function SimpleButton({ 
  children, 
  onClick, 
  variant = "default", 
  size = "default", 
  className = "", 
  href,
  ...props 
}: SimpleButtonProps) {
  const baseClass = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  let variantClass = "";
  if (variant === "default") variantClass = "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600";
  else if (variant === "outline") variantClass = "border border-gray-200 bg-transparent hover:bg-gray-100 text-gray-900";
  else if (variant === "destructive") variantClass = "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600";
  
  let sizeClass = "";
  if (size === "default") sizeClass = "h-10 py-2 px-4 text-sm";
  else if (size === "sm") sizeClass = "h-9 px-3 text-sm";
  else if (size === "lg") sizeClass = "h-11 px-8 text-base";
  
  const classes = `${baseClass} ${variantClass} ${sizeClass} ${className}`;
  
  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  
  return (
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

// Simple loading skeleton
function SimpleLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
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

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface SimpleBreadcrumbsProps {
  items: BreadcrumbItem[];
}

// Simple breadcrumb component
function SimpleBreadcrumbs({ items }: SimpleBreadcrumbsProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 mb-6">
        {items.map((item, index: number) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400">/</span>
              )}
              
              {isLast ? (
                <span className="text-gray-600">{item.label}</span>
              ) : (
                <a href={item.href} className="text-blue-600 hover:text-blue-700">
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user');
        setUserLoggedIn(response.ok);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUserLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EBE9E0]">
        <div className="w-full max-w-screen-xl mx-auto p-4 sm:px-6 lg:p-8">
          {/* Breadcrumb skeleton */}
          <div className="flex gap-2 mb-6">
            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* More loading skeletons */}
          <SimpleLoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EBE9E0]">
      <div className="w-full max-w-screen-xl mx-auto p-4 sm:px-6 lg:p-8">
        <SimpleBreadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Certificates' },
          ]}
        />

        {/* Header */}
        <div className="relative mb-8 sm:mb-10 mt-6 sm:mt-8">
          <div className="absolute inset-0 -m-2 sm:-m-4">
            <div className="w-full h-full border-4 border-dashed border-gray-300/70 rounded-3xl"></div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full"></div>
              
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
                      <SimpleButton href="/dashboard/events" variant="outline" className="text-sm">
                        <Award className="mr-1.5 h-4 w-4" />
                        More Events
                      </SimpleButton>
                    ) : (
                      <SimpleButton href="/login" className="text-sm">
                        <LogIn className="mr-1.5 h-4 w-4" />
                        Sign In
                      </SimpleButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="mb-6 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg p-4 flex">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-blue-700">
            {userLoggedIn 
              ? "Certificates are automatically issued after successfully attending eligible events. You can download and share these certificates as proof of your participation or achievement."
              : "Verify certificates using the verification link or the button below. Sign in to access your own certificates."}
          </p>
        </div>

        {/* Main content */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm p-6">
          {userLoggedIn ? (
            <div>
              <div className="mb-6 border-b">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "all" 
                        ? "border-b-2 border-blue-600 text-blue-600" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    All Certificates
                  </button>
                  <button
                    onClick={() => setActiveTab("recent")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "recent" 
                        ? "border-b-2 border-blue-600 text-blue-600" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Recent
                  </button>
                </div>
              </div>
              
              <CertificateList />
            </div>
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
                <SimpleButton onClick={() => router.push('/login')}>
                  Sign In
                </SimpleButton>
                <SimpleButton variant="outline" onClick={() => router.push('/verify-certificate')}>
                  Verify a Certificate
                </SimpleButton>
              </div>
            </div>
          )}
        </div>
        
        {/* Verification Section */}
        <div className="mt-10">
          <div className="relative">
            <div className="absolute inset-0 -m-2 sm:-m-4">
              <div className="w-full h-full border-4 border-dashed border-gray-300/70 rounded-3xl"></div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full"></div>
                
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
                      <SimpleButton
                        onClick={() => router.push('/verify-certificate')}
                        className="px-5 h-11 whitespace-nowrap"
                      >
                        Verify Certificate
                      </SimpleButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
