import { 
  Medal, 
  Clock,
  Users,
  Trophy
} from 'lucide-react';
import cn from 'classnames';
import Image from 'next/image';
import { LeaderboardTabs } from './leaderboard-tabs';

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

// Helper function to format time
function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
}

// EmptyState component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Trophy className="h-12 w-12 text-gray-300 mb-3" />
      <p className="text-gray-500">No leaderboard data available yet.</p>
      <p className="text-sm text-gray-400 mt-1">Complete rounds to appear here!</p>
    </div>
  );
}

// LeaderItem component
function LeaderItem({ leader, rank }: { leader: Leader; rank: number }) {
  // Define medal colors and styles
  const medalColors = {
    1: "text-amber-500",
    2: "text-gray-400",
    3: "text-amber-700"
  };
  
  return (
    <div className={cn(
      "flex items-center p-3 border-b last:border-0",
      rank <= 3 ? "bg-gradient-to-r from-amber-50/50 to-transparent" : "",
    )}>
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
            <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">Team</span>
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
        <div className="font-semibold text-amber-700">{leader.total_points} pts</div>
        <div className="flex items-center text-xs text-gray-500 justify-end">
          <Clock className="h-3 w-3 mr-1" />
          {formatTime(leader.fastest_time)}
        </div>
      </div>
    </div>
  );
}

// Server component to fetch leaderboard data
async function getLeaderboard(round?: string) {
  try {
    // For server components, we need to use the full URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const roundParam = round && round !== 'all' ? `?round=${round}` : '';
    const url = `${baseUrl}/api/techtreasurehunt/leaderboard${roundParam}`;
    
    const response = await fetch(url, {
      cache: 'no-store', // Don't cache the response
      next: { tags: ['leaderboard'] } // Use Next.js cache tags
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard data');
    }
    
    const data = await response.json();
    return data.leaders || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

// Leaderboard component
export async function Leaderboard({ round = 'all', className }: { round?: string; className?: string }) {
  const leaders = await getLeaderboard(round);
  
  return (
    <div className={cn("bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden", className)}>
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1 flex justify-center relative">
            <Image
              width={240}
              height={80}
              src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1741027209/Spectrum/leaderboard_1_gsmnp7.webp"
              alt="Leaderboard"
              className="w-auto object-contain"
              draggable="false"
              style={{ userSelect: 'none' }}
              priority
            />
          </div>
        </div>
      </div>
      
      <LeaderboardTabs initialTab={round}>
        {leaders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-h-[400px] overflow-auto styled-scrollbar">
            <div className="divide-y">
              {leaders.map((leader: Leader, index: number) => (
                <LeaderItem 
                  key={`${leader.user_id}-${index}`} 
                  leader={leader} 
                  rank={index + 1} 
                />
              ))}
            </div>
          </div>
        )}
      </LeaderboardTabs>
      
      <div className="p-3 bg-amber-50 text-center text-xs text-amber-800">
        Updated every minute
      </div>
      
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: #f5f5f4;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: #d6d3d1;
          border-radius: 3px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a29e;
        }
      `}</style>
    </div>
  );
}
