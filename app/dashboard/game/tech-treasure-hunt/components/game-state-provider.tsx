'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export enum GameState {
  LOADING = 'LOADING',
  START = 'START',
  PLAYING = 'PLAYING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

interface GameStateContextType {
  state: GameState;
  setState: (state: GameState) => void;
  progressId: string | null;
  setProgressId: (id: string | null) => void;
  roundData: any;
  setRoundData: (data: any) => void;
  results: any;
  setResults: (results: any) => void;
  error: string | null;
  setError: (error: string | null) => void;
  refreshTrigger: () => void;
}

const GameStateContext = createContext<GameStateContextType | null>(null);

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(GameState.LOADING);
  const [progressId, setProgressId] = useState<string | null>(null);
  const [roundData, setRoundData] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Log state changes for debugging
  useEffect(() => {
    console.log(`GameState changed: ${state}`, {
      progressId,
      roundType: roundData?.round_type,
      hasResults: !!results,
      error
    });
  }, [state, progressId, roundData, results, error]);

  const refreshTrigger = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <GameStateContext.Provider value={{
      state,
      setState,
      progressId,
      setProgressId,
      roundData,
      setRoundData,
      results,
      setResults,
      error,
      setError,
      refreshTrigger
    }}>
      {/* Use key to force complete re-render on refresh */}
      <div key={refreshKey}>
        {children}
      </div>
    </GameStateContext.Provider>
  );
}
