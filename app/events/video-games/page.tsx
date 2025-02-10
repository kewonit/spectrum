"use client"

import { Electrica_registarion } from "./components/registration";
import { Electrica_registarion2 } from "./components/registrationbg";
import { Electrica_registarion3 } from "./components/registrationff";
import { RulesBGMI } from "./components/bgmi";
import { RulesValo } from "./components/valorant";
import RulesFreefire from "./components/freefire";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

const krona = Krona_One({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: '400',
});

export default function Home() {
  return (
    <main className="min-h-screen" style={{
      background: "radial-gradient(at left top, rgb(91, 192, 222), rgb(51, 142, 218))",
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="relative rounded-2xl bg-white/10 backdrop-blur-lg p-8 mb-12">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
            <div className="w-full md:w-1/2">
              <div className={`${krona.className} space-y-4`}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl leading-[4rem] font-bold text-[#ece9e0]">
                  High Ping &apos;25
                </h1>
                <h2 className="text-xl md:text-2xl text-white/90">
                  brought to you by AS&H, PCCOE
                </h2>
                <p className="text-lg text-white/80 font-light max-w-xl mt-6">
                  PCCOE E-Sports Event featuring Valorant, BGMI, and Free Fire tournaments
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <Image 
                src="https://i.postimg.cc/ZqzpwfJ1/7.png" 
                alt="Event Image" 
                width={400} 
                height={400} 
                className="rounded-lg" 
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Registration Sections */}
        <div className="space-y-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <h3 className={`${krona.className} text-2xl text-white mb-6`}>Valorant Registration</h3>
            <Electrica_registarion />
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <h3 className={`${krona.className} text-2xl text-white mb-6`}>BGMI Registration</h3>
            <Electrica_registarion2 />
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <h3 className={`${krona.className} text-2xl text-white mb-6`}>Free Fire Registration</h3>
            <Electrica_registarion3 />
          </div>
        </div>

        {/* Rules Sections */}
        <div className="space-y-12 mt-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <h3 className={`${krona.className} text-2xl text-white mb-6`}>Valorant Tournament Rules</h3>
            <RulesValo />
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <h3 className={`${krona.className} text-2xl text-white mb-6`}>BGMI Tournament Rules</h3>
            <RulesBGMI />
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <h3 className={`${krona.className} text-2xl text-white mb-6`}>Free Fire Tournament Rules</h3>
            <RulesFreefire />
          </div>
        </div>
      </div>
    </main>
  );
}