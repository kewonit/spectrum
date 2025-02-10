import { Rules } from "@/app/events/blindcoding/components/accordian"
import { BlindCoding_registarion } from "@/app/events/blindcoding/components/registration";
import { Metadata } from "next";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

export const metadata: Metadata = {
  title: 'Spectrum x Blind Coding',
  description: "Tech event for first year students",  
  openGraph: {
    title: 'Spectrum x Blind Coding',
    description: "Tech event for first year students",  
    url: "https://spectrumpccoe25.tech",
    siteName: "spectrumpccoe25.tech",
    images: [
      {
        url: "https://i.postimg.cc/XYC9cM6f/5.png",
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
  "Event will be solo.",
  "Event will be divided into 2 rounds.",
  "Scientific Calculators are allowed for the first round of the event.",
  "Participants will have to carry their own stationary (Calculators, pens, etc).",
  "Personal computers, electronic/Blind Coding components are not allowed for use during the event.",
  "The use of A.I. chatbots like ChatGPT is strictly prohibited.",
  "Participants are not allowed to use mobile phones, smartwatches, or any other electronic devices.",
  "Participants will be strictly monitored, and volunteers will be available to provide assistance if necessary.",
  "Each round will have a specified time limit that participants must adhere to.",
  "The final decision will be based on computerized results and made by the event coordinators.",
  "The decision of the event coordinators is final and binding, not subject to contestation.",
  "The organizers reserve the right to change or update the contest rules, and participants are responsible for staying informed.",
  "Violation of any rule may result in immediate disqualification.",
  "All the participants must return the electronic components provided to them after the event",
  "The team would be held responsible for any damage caused to Blind Coding components due to mishandling or carelessness, and would be required to pay a fine.",
  "Spot entries will be accepted until the team registration limit is reached."
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
                  Blind Coding &apos;25
                </h1>
                <h2 className="text-xl md:text-2xl text-white/90">
                  brought to you by AS&H, PCCOE
                </h2>
                <p className="text-lg text-white/80 font-light max-w-xl mt-6">
                Join us for an exciting technical event featuring challenging rounds of coding, problem-solving, and innovative thinking.
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <Image 
                src="https://i.postimg.cc/XYC9cM6f/5.png" 
                alt="Event Image" 
                width={400} 
                height={400} 
                className="rounded-lg" 
                draggable={false}
              />
            </div>
          </div>
        </div>

        <div className="mb-12">
          <BlindCoding_registarion />
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-12">
          <div className="text-white mb-8">
            <h2 className={`${krona.className} text-3xl mb-4`}>Competition Format</h2>
            <p className="text-white/80">Challenge yourself through multiple stages of technical excellence</p>
          </div>
          
          <div className="rules-wrapper">
            <Rules />
          </div>
        </div>

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