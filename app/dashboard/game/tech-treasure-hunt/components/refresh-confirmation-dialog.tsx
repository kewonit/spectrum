import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Play } from 'lucide-react';

interface RefreshConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRetry?: boolean;
  roundId?: string; // Optional round ID to store in session
  nextRoundId?: string; // Optional next round ID to store in session
  onContinueWithoutRefresh?: () => void; // New prop to continue without refresh
}

export function RefreshConfirmationDialog({
  open,
  onOpenChange,
  isRetry = false,
  roundId,
  nextRoundId,
  onContinueWithoutRefresh
}: RefreshConfirmationDialogProps) {
  const handleRefresh = () => {
    if (roundId) {
      sessionStorage.setItem('startRoundId', roundId);
    }
    
    if (nextRoundId) {
      sessionStorage.setItem('nextRoundId', nextRoundId);
    }
    
    sessionStorage.setItem('actionAfterRefresh', nextRoundId ? 'nextRound' : (isRetry ? 'retryRound' : 'startRound'));
    
    // Now perform the page refresh
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-4">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            {isRetry ? 'Retry Round' : nextRoundId ? 'Start Next Round' : 'Start Round'}
          </DialogTitle>
          <DialogDescription className="text-center px-4 pt-2">
            To ensure the best experience, we recommend refreshing the page before 
            {nextRoundId ? ' starting the next' : isRetry ? ' retrying this' : ' starting this'} round.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md my-2">
          <p className="text-sm text-amber-800">
            Refreshing helps prevent technical issues and ensures all components load properly.
          </p>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2 mt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRefresh}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh & {isRetry ? 'Retry' : nextRoundId ? 'Start Next Round' : 'Start Round'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
