'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from 'lucide-react';

// Inline utility to avoid external dependencies
const combineClasses = (...classes: string[]): string => {
  return classes.filter(Boolean).join(' ');
};

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class FeedbackErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('FeedbackErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <Card className="overflow-hidden bg-[#EBE9E0]/40 backdrop-blur border-2 border-gray-300 rounded-2xl shadow-sm max-w-[1400px] mx-auto">
          <div className="p-4 sm:p-5 lg:p-6 border-b-2 border-gray-300 flex items-center gap-2.5 bg-[#EBE9E0]/30">
            <div className="bg-[#EBE9E0]/80 p-1.5 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg lg:text-xl">Website Feedback</h3>
          </div>
          <div className="p-4 sm:p-6 lg:p-8 bg-white/20">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="bg-red-50 rounded-full p-4 mb-3">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Feedback section unavailable</h3>
              <p className="text-sm text-gray-600 mb-4 max-w-md">
                We encountered an error while loading the feedback section. Please try again or check back later.
              </p>
              <Button 
                onClick={this.handleRetry} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
