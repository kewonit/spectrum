import React from 'react';
import { Metadata } from 'next';
import { TechTreasureHuntGame } from './components/tech-treasure-hunt-game';
import LeaderboardContainer from './components/leaderboard-container';
import Image from 'next/image';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const metadata: Metadata = {
  title: 'Tech Treasure Hunt | Spectrum',
  description: 'Play the Tech Treasure Hunt challenge and test your technical skills through multiple rounds of puzzles and problems.',
};

export default function TechTreasureHuntPage() {
  return (
    <div className="min-h-screen bg-[#EBE9E0]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 md:pt-8 pb-8 sm:pb-12">
        {/* Header Image - responsive height with better mobile view */}
        <div className="relative w-full h-[140px] xs:h-[180px] sm:h-[200px] md:h-[220px] lg:h-[250px] 
          overflow-hidden rounded-lg shadow-md mb-4 sm:mb-6 transition-all duration-300">
          <Image 
            src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1740917339/Tech-Treasure-Hunt_afycc3.webp"
            alt="Tech Treasure Hunt Header" 
            fill
            priority
            draggable={false}
            className="object-contain object-center w-full h-full"
            sizes="(max-width: 480px) 95vw, (max-width: 640px) 90vw, (max-width: 1024px) 85vw, 1000px"
          />
          
        </div>
        
        {/* Info box - improved for small screens */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 sm:p-4 rounded-md shadow-sm">
            <div className="flex items-start sm:items-center">
              <div className="flex-shrink-0 mt-1 sm:mt-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm md:text-base text-amber-800 leading-relaxed">
                  Complete each round of the Tech Treasure Hunt to unlock the next challenge. Each round tests different skills and has a time limit.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Responsive grid layout with improved gap handling */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Game area - takes full width on mobile, 8/12 on desktop */}
          {/* Removed the parent card wrapper to let the game component breathe */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            <TechTreasureHuntGame />
          </div>
          
          {/* Leaderboard - takes full width on mobile, 4/12 on desktop */}
          {/* On mobile, show leaderboard first for better engagement */}
          <div className="lg:col-span-4 order-1 lg:order-2 mb-4 lg:mb-0">
            <div className="sticky top-4">
              <LeaderboardContainer />
            </div>
          </div>
        </div>
        
        {/* Footer area with better spacing */}
        <div className="mt-6 sm:mt-8 mb-4 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Need help? Contact the event organizers at <a href="mailto:pccoe.spectrum.25@gmail.com" className="text-amber-700 hover:text-amber-800 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 rounded-sm">pccoe.spectrum.25@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
