import { MessageSquare } from 'lucide-react';

export function EmptyFeedbackState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="bg-[#EBE9E0]/60 rounded-full p-5 mb-4">
        <MessageSquare className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
      <p className="text-gray-500 max-w-md">
        Be the first to share your thoughts about your experience with Spectrum. Your feedback helps us improve.
      </p>
    </div>
  );
}
