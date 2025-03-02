'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Medal, 
  Clock, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Trophy,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Leader {
  user_id: string;
  display_name: string;
  total_points: number;
  fastest_time: number;
  rounds_completed: number;
  highest_round: number;
  is_team: boolean;
  team_name: string;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Trophy className="h-12 w-12 text-gray-300 mb-3" />
      <p className="text-gray-500">No leaderboard data available yet.</p>
      <p className="text-sm text-gray-400 mt-1">Complete rounds to appear here!</p>
    </div>
  );
}

function LeaderItem({ leader, rank }: { leader: Leader; rank: number }) {
  // Define medal colors and styles
  const medalColors = {
    1: "text-yellow-500",
    2: "text-gray-400",
    3: "text-amber-700"
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={cn(
        "flex items-center p-3 border-b last:border-0",
        rank <= 3 ? "bg-gradient-to-r from-blue-50/50 to-transparent" : "",
      )}
    >
      <div className="w-8 flex justify-center">
        {rank <= 3 ? (
          <Medal className={cn("h-5 w-5", medalColors[rank as keyof typeof medalColors] || "text-gray-400")} />
        ) : (
          <span className="text-gray-500 font-medium">{rank}</span>
        )}
      </div>
      
      <div className="flex-1 ml-2">
        <div className="flex items-center">
          <span className="font-medium text-gray-900 truncate max-w-[150px]">
            {leader.display_name || "Anonymous"}
          </span>
          {leader.is_team && (
            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">Team</span>
          )}
        </div>
        
        {leader.is_team && leader.team_name && (
          <span className="text-xs text-gray-500 flex items-center">
            <Users className="h-3 w-3 mr-1 inline" />
            {leader.team_name}
          </span>
        )}
      </div>
      
      <div className="text-right">
        <div className="font-semibold text-indigo-600">{leader.total_points} pts</div>
        <div className="flex items-center text-xs text-gray-500 justify-end">
          <Clock className="h-3 w-3 mr-1" />
          {formatTime(leader.fastest_time)}
        </div>
      </div>
    </motion.div>
  );
}

export function Leaderboard({ className }: { className?: string }) {
  const [selectedTab, setSelectedTab] = useState('all');
  
  // Fetch leaderboard data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leaderboard', selectedTab],
    queryFn: async () => {
      const roundParam = selectedTab !== 'all' ? `?round=${selectedTab}` : '';
      const response = await fetch(`/api/techtreasurehunt/leaderboard${roundParam}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
  
  const leaders = data?.leaders || [];
  
  return (
    <div className={cn("bg-white rounded-2xl shadow-md overflow-hidden", className)}>
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Trophy className="h-5 w-5 mr-2" />
          <h3 className="font-bold text-lg">Leaderboard</h3>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => refetch()}
          className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
        <div className="px-4 pt-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Rounds</TabsTrigger>
            <TabsTrigger value="1">Round 1</TabsTrigger>
            <TabsTrigger value="2">Round 2</TabsTrigger>
          </TabsList>
        </div>
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center p-8"
            >
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 text-center text-red-600"
            >
              <AlertCircle className="h-6 w-6 mx-auto mb-2" />
              <p>Failed to load leaderboard</p>
            </motion.div>
          ) : leaders.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-h-[400px] overflow-auto styled-scrollbar"
            >
              <TabsContent value={selectedTab} className="mt-0">
                <div className="divide-y">
                  {leaders.map((leader: Leader, index: number) => (
                    <LeaderItem 
                      key={leader.user_id} 
                      leader={leader} 
                      rank={index + 1} 
                    />
                  ))}
                </div>
              </TabsContent>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="p-3 bg-gray-50 text-center text-xs text-gray-500">
          Updated every minute
        </div>
      </Tabs>
      
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
