import { Rules } from "@/app/events/treasure-hunt/components/accordian";
import { Treasurehunt_registarion } from "@/app/events/treasure-hunt/components/registration";
import { ResultsTable } from "@/app/events/treasure-hunt/components/results-table";
import { Krona_One } from 'next/font/google';
import Image from "next/image";

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Spectrum x Tech Treasure Hunt',
  description: "Tech event for first year students",  
  openGraph: {
    title: 'Spectrum x Tech Treasure Hunt',
    description: "Tech event for first year students",  
    url: "https://spectrumpccoe25.tech",
    siteName: "spectrumpccoe25.tech",
    images: [
      {
        url: "https://i.postimg.cc/9MJ9FCyh/9.png",
        width: 548,
        height: 253,
        alt: 'Image',
      },
    ],
  }, 
}

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

// CSV data URL from Cloudinary
const csvDataUrl = "https://res.cloudinary.com/dfyrk32ua/raw/upload/v1741337278/gdgc/Round_2_teams_Qualified_csv_kq7url.csv";

export default function Home() {
  return (
    <main className="min-h-screen" style={{
      background: "radial-gradient(at left top, rgb(91, 192, 222), rgb(51, 142, 218))",
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
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

        <div className="mb-12">
          <ResultsTable 
            csvUrl={csvDataUrl} 
            title="Round 2 Qualified Teams" 
          />
        </div>


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