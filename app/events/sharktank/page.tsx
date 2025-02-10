import { Rules } from "@/app/events/sharktank/components/accordian"
import { Sharktank_registarion } from "@/app/events/sharktank/components/registration";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Spectrum x Shark Tank',
  description: "Business pitch competition for innovative minds",  
  openGraph: {
    title: 'Spectrum x Shark Tank',
    description: "Business pitch competition for innovative minds",  
    url: "https://spectrumpccoe25.tech",
    siteName: "spectrumpccoe25.tech",
    images: [
      {
        url: "https://i.postimg.cc/gk5vZzQc/4.png",
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
  "The event is open to all first-year students of PCCOE and other institutions.",
  "Each team can have a maximum of 3 members.",
  "Registration is mandatory through the official event portal.",
  "The competition will have two rounds.",
  "Round 1 requires a 300-word description in PDF and a 2-minute video of the business idea.",
  "Top business ideas will be shortlisted for the final round based on submissions.",
  "Pitch presentations must be 5 to 7 minutes long.",
  "Use PowerPoint or similar visual aids for the presentation.",
  "The presentation should include the business concept, target audience, problem, solution, and market analysis.",
  "Judging will be based on innovation, feasibility, profitability, presentation, business model, and social impact.",
  "Industry experts will form the judging panel.",
  "The top 3 teams will receive prizes and recognition.",
  "Plagiarism or fraud will result in immediate disqualification.",
  "All presentations must be original work.",
  "Winners will receive cash prizes and certificates."
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
                  Shark Tank &apos;25
                </h1>
                <h2 className="text-xl md:text-2xl text-white/90">
                  brought to you by AS&H, PCCOE
                </h2>
                <p className="text-lg text-white/80 font-light max-w-xl mt-6">
                Present your innovative business ideas to our panel of expert judges and win exciting prizes while gaining valuable feedback and exposure.
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <Image 
                src="https://i.postimg.cc/gk5vZzQc/4.png" 
                alt="Event Image" 
                width={400} 
                height={400} 
                className="rounded-lg" 
                draggable={false}
              />
            </div>
          </div>
        </div>

        <div className="mb-20">
          <Sharktank_registarion />
        </div>

        {/* Rules Section with Accordion */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-12">
          <div className="text-white mb-8">
            <h2 className={`${krona.className} text-3xl mb-4`}>Competition Format</h2>
            <p className="text-white/80">Showcase your entrepreneurial spirit through multiple stages of business excellence</p>
          </div>
          
          <Rules />
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