import { MessageSquare } from 'lucide-react';

export function EmptyFeedbackState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gradient-to-b from-[#F0F7FF]/30 to-[#F9F5FF]/30 rounded-xl border border-dashed border-lavender-200">
      <div className="bg-[#E6F7FF]/70 rounded-full p-5 mb-4 shadow-sm">
        <MessageSquare className="h-8 w-8 text-blue-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
      <p className="text-gray-600 max-w-md text-sm sm:text-base">
        Be the first to share your thoughts about your experience with the Spectrum website and platform. 
        Your feedback helps us improve our digital services.
      </p>
      <p className="text-xs text-purple-600 mt-4 px-4 py-2 bg-purple-50 rounded-full inline-block">
        Note: This is for website feedback only. For event-specific feedback, please contact the event organizers directly.
      </p>
    </div>
  );
}
