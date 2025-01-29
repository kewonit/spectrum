'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast.error("Failed to load event details", {
      description: error.message || "Please try refreshing the page",
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-[#EBE9E0] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4">Something went wrong!</h2>
        <Button
          onClick={() => reset()}
          variant="default"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
