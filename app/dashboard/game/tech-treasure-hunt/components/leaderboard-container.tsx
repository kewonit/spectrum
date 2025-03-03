'use client';

import { Suspense, lazy } from 'react';
import dynamic from 'next/dynamic';
import { LoadingState } from './game-states';

// Use dynamic import in the client component
const ClientLeaderboard = dynamic(
  () => import('./client-leaderboard').then(mod => mod.ClientLeaderboard),
  {
    loading: () => <LoadingState message="Loading leaderboard..." />,
    ssr: false
  }
);

export default function LeaderboardContainer({ className }: { className?: string }) {
  return (
    <Suspense fallback={<LoadingState message="Loading leaderboard..." />}>
      <ClientLeaderboard className={className} />
    </Suspense>
  );
}
