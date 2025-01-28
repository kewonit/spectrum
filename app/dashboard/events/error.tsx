'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast.error("Failed to load events", {
      description: error.message || "Please try refreshing the page",
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-[#EBE9E0] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4">Something went wrong!</h2>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
