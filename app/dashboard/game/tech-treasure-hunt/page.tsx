import React from 'react';
import { Metadata } from 'next';
import { TechTreasureHuntGame } from './components/tech-treasure-hunt-game';
import LeaderboardContainer from './components/leaderboard-container';

export const metadata: Metadata = {
  title: 'Tech Treasure Hunt | Spectrum',
  description: 'Play the Tech Treasure Hunt challenge and test your technical skills through multiple rounds of puzzles and problems.',
};

export default function TechTreasureHuntPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Tech Treasure Hunt</h1>
      
      <div className="mb-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Complete each round of the Tech Treasure Hunt to unlock the next challenge. Each round tests different skills and has a time limit.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Responsive grid layout for game and leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <TechTreasureHuntGame />
        </div>
        
        {/* Client-side leaderboard - on the side for large screens, below for small screens */}
        <div className="lg:col-span-4">
          <LeaderboardContainer />
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Need help? Contact the event organizers at <a href="mailto:support@spectrum.com" className="text-indigo-600 hover:underline">support@spectrum.com</a></p>
      </div>
    </div>
  );
}
