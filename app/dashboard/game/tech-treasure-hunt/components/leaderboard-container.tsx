'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { LoadingState } from './game-states';
import dynamic from 'next/dynamic';

// Import the leaderboard component with explicit path
const ClientLeaderboard = dynamic(() => import('./client-leaderboard').then(mod => mod.ClientLeaderboard), {
  loading: () => <LoadingState message="Loading leaderboard..." />,
  ssr: false
});

export default function LeaderboardContainer({ className }: { className?: string }) {
  const [isClientReady, setIsClientReady] = useState(false);
  const isMounted = useRef(false);
  
  // Only mount the leaderboard component once and ensure it doesn't get remounted
  useEffect(() => {
    // Prevent double-mounting in development due to strict mode
    if (isMounted.current) return;
    
    // Small delay to ensure the component is fully hydrated
    const timer = setTimeout(() => {
      setIsClientReady(true);
      isMounted.current = true;
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Suspense fallback={<LoadingState message="Loading leaderboard..." />}>
      {isClientReady ? 
        <ClientLeaderboard className={className} /> : 
        <LoadingState message="Initializing leaderboard..." />
      }
    </Suspense>
  );
}
