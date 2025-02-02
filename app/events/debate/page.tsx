import { Rules } from "@/app/events/debate/components/accordian"
import { Debate_registarion } from "@/app/events/debate/components/registration";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Spectrum x War of Words',
  description: "Tech event for first year students",  
  openGraph: {
    title: 'Spectrum x War of Words',
    description: "Tech event for first year students",  
    url: "https://pccoespectrum.tech",
    siteName: "pccoespectrum.tech",
    images: [
      {
        url: "https://i.imgur.com/rmVmQ7C.png",
        width: 548,
        height: 253,
        alt: 'Image',
      },
    ],
  }, 
}

const korna = Krona_One({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: '400', 
});

export default function Home() {
  return (
    <main className="overflow-hidden max-w-7xl mx-auto px-8 bg-[#EBE9E0]">
      <div className={korna.className}>
        <h1 className="font-jacques_francois_shadow scroll-m-20 pt-8 text-4xl md:text-7xl font-extrabold text-gray-800 tracking-tight lg:text-9xl">
          War of Words
        </h1>
        <br/>
        <h2 className="font-jacques_francois_shadow scroll-m-20 pl-2 text-2xl font-extrabold text-gray-800 tracking-tight lg:text-5xl">
          brought to you by AS&H, PCCOE
        </h2>
      </div>
      <Image className="mx-auto mt-4" width="500" height="450" alt="image" src="https://i.imgur.com/Z4jurYP.png" />
      <div>
      <h3 className="font-jacques_francois_shadow text-center scroll-m-20 my-4 pl-2 text-xl font-extrabold text-gray-800 tracking-tight md:text-3xl lg:text-5xl">
        War of Words - Debate Competition 2024
      </h3>
      </div>
      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture> 
      <Debate_registarion />
      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture> 
      <div className="text-gray-700 leading-7 mb-4 p-4 lg:p-8">
        <Rules />
        {/* <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">Rules :</h1>
          <p className="leading-7 pt-4">
          Elimination Round: <br/>
          1. The debate will be held in English/Hindi/Marathi.<br/>
          2. Participants should be from 1st year only.<br/>
          3. Topics of the elimination round will be given on the spot.<br/>
          </p>
          <hr/>
          <p className="leading-7 pt-6">
          Final Round: <br/>
          1. Final Topic for formal debate will be shared on the WhatsApp group.<br/>
          2. Students should come prepared with both &quot;for&quot; and &quot;against&quot; the topic.<br/>
          3. There will be a rebuttal round. Each participant is allowed to ask only 1 question. Participants will be marked on the question and the answer.<br/>
          4. The time duration will be 3+1 minutes.<br/>
          5. Participants will be marked on content, presentation, counter arguments and questions, overall impact and clarity of thoughts.<br/>
          </p> */}
        </div>
    <hr/>
    <picture> 
      <img className="mx-auto my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
    </picture> 
    </main>
  );

}