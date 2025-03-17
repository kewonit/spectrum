'use client';

import { Breadcrumbs } from "@/app/components/breadcrumbs";
import { FeedbackSection } from '@/app/components/FeedbackSection';
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-[#EBE9E0]">
      <div className="w-full max-w-screen-xl mx-auto p-4 sm:px-6 lg:p-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Feedback' },
          ]}
          className="mb-8"
        />
        
        {/* Move all content inside max-width container to ensure consistent widths */}
        <div className="max-w-screen-lg mx-auto">
          {/* Simplified Header Section - Updated for width consistency */}
          <div className="relative mb-10 mt-6">
            <div className="absolute inset-0 -m-2 sm:-m-4">
              <div className="w-full h-full border-4 border-dashed border-gray-300/50 rounded-3xl" />
            </div>

            <div className="relative bg-white rounded-2xl shadow-sm p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-full border border-blue-100">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Website Feedback
                  </h1>
                </div>
                <Link href="/dashboard">
                  <Button 
                    variant="outline" 
                    className="h-9 gap-1.5 bg-white hover:bg-gray-50 border-gray-200 w-full sm:w-auto min-w-[160px] justify-center"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Dashboard</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Info Box - Already has correct width */}
          <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Help Us Improve</h2>
            <p className="text-gray-600 mb-4">
              Your feedback is valuable to us! Share your thoughts about the Spectrum website and platform 
              to help us enhance your experience.
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Note:</span> This feedback section is specifically for the website. 
                For event-specific questions or issues, please contact the event organizers directly.
              </p>
            </div>
          </div>

          {/* Feedback Section Container */}
          <div className="rounded-2xl overflow-hidden">
            <FeedbackSection />
          </div>
        </div>
      </div>
    </main>
  );
}
