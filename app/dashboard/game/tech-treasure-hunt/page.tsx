import React from 'react';
import { Metadata } from 'next';
import { TechTreasureHuntGame } from './components/tech-treasure-hunt-game';
import LeaderboardContainer from './components/leaderboard-container';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Tech Treasure Hunt | Spectrum',
  description: 'Play the Tech Treasure Hunt challenge and test your technical skills through multiple rounds of puzzles and problems.',
};

export default function TechTreasureHuntPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 pb-6 sm:pb-8">
      {/* Header Image */}
      <div className="relative w-full h-[100px] xs:h-[120px] sm:h-[140px] md:h-[160px] 
        overflow-hidden transition-all duration-300 mb-4">
        <Image 
          src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1740922990/Spectrum/dywRpss_-_Imgur_uxvnrc.webp"
          alt="Tech Treasure Hunt Header" 
          fill
          priority
          draggable={false}
          className="object-contain object-center w-full h-full drop-shadow-xl"
          sizes="(max-width: 480px) 95vw, (max-width: 640px) 90vw, (max-width: 1024px) 85vw, 1000px"
        />
      </div>
      
      {/* Info box */}
      <div className="mb-3">
        <div className="bg-amber-50/90 backdrop-blur-md border-l-4 border-amber-400 p-3 sm:p-4 rounded-md shadow-md">
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
      
      {/* Responsive grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Game area - takes full width on mobile, 8/12 on desktop */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          <TechTreasureHuntGame />
        </div>
        
        {/* Leaderboard - takes full width on mobile, 4/12 on desktop */}
        <div className="lg:col-span-4 order-1 lg:order-2 mb-3 lg:mb-0">
          <div className="sticky top-4">
            <LeaderboardContainer />
          </div>
        </div>
      </div>
      
      {/* Footer info */}
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-xs sm:text-sm text-white drop-shadow-sm bg-black/30 inline-block px-3 py-1 rounded-full">
          Need help? Contact the event organizers at <a href="mailto:pccoe.spectrum.25@gmail.com" className="text-amber-300 hover:text-amber-200 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 rounded-sm">pccoe.spectrum.25@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
