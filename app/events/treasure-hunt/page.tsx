"use client"

import { Rules } from "@/app/events/treasure-hunt/components/accordian";
import { Treasurehunt_registarion } from "@/app/events/treasure-hunt/components/registration";
import { Krona_One } from 'next/font/google';
import Image from "next/image";

const krona = Krona_One({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: '400',
});

const ruleList = [
  "Maximum Participants: Team Size: 4 members per team",
  "Participants must be registered attendees of the Spectrum 2025 Event.",
  "Use of personal gadgets is strictly prohibited unless specified during a round.",
  "Teams must solve clues and challenges in sequence to progress.",
  "Misconduct or breach of rules may lead to immediate disqualification.",
  "Use of electronic device and printed material is not allowed.",
  "Examiner decision will be final.",
  "Teams participating in the competition must not collaborate, share information, or exchange clues with other teams. Any team found leaking or receiving clues from another team will face immediate disqualification.",
  "Teams will be evaluated based on Speed: The team that completes the treasure hunt first wins.",
  "Teams will be evaluated based on Accuracy: Points will be awarded for solving clues correctly.",
  "Teams will be evaluated based on Bonus Challenges: Additional points may be awarded for completing optional tasks."
];


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
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#ece9e0]">
                  Treasure Hunt &apos;25
                </h1>
                <h2 className="text-xl md:text-2xl text-white/90">
                  brought to you by AS&H, PCCOE
                </h2>
                <p className="text-lg text-white/80 font-light max-w-xl mt-6">
                The path is hidden, the clues are set-only the sharpest minds will find the treasure yet!
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <div className="absolute inset-0 bg-white/20 rounded-lg transform rotate-45"></div>
                <div className="absolute inset-2 bg-white/30 rounded-lg transform rotate-12"></div>
                <div className="absolute inset-4 bg-white/40 rounded-lg transform -rotate-6"></div>
              </div>
            </div>
          </div>
        </div>

        <Treasurehunt_registarion />

        {/* Rules Section with Accordion */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-12">
          <div className="text-white mb-8">
            <h2 className={`${krona.className} text-3xl mb-4`}>Competition Format</h2>
            <p className="text-white/80">Get ready to test your teamwork, problem-solving, and strategic thinking skills!</p>
          </div>
          <div className="rules-wrapper">
            <Rules />
          </div>
        </div>

        {/* Rules Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-12">
          <h3 className={`${krona.className} text-2xl text-white mb-6`}>Event Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ruleList.map((rule, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <span className="text-white/90 font-bold">{idx + 1}.</span>
                <p className="text-white/80">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}