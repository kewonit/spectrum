import { Loader2Icon } from "lucide-react";

export function LoadingState() {
  return (
    <main className="min-h-screen bg-[#EBE9E0] p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    </main>
  );
}
