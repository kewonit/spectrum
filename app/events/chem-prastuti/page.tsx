import { Rules } from "@/app/events/chem-prastuti/components/accordian"
import { Chem_prastuti_registarion } from "@/app/events/chem-prastuti/components/registration";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Spectrum x Chem Prastuti',
  description: "Tech event for first year students",  
  openGraph: {
    title: 'Spectrum x Chem Prastuti',
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

const teamFormationRules = [
  "Team can have maximum of 2 participants from FY. B.Tech."
];

const presentationRules = [
  "The paper submitted will have to be presented during the event.",
  "Hard as well as soft copies of the paper are to be submitted well in advance to the coordinators before presentation on mail id: engg.chem2010@gmail.com",
  "The Teams will get 8 minutes to present their paper. And 2 minutes will be for questioning by judges.",
  "The participants will have to present their papers in MS-Power Point (ppt) format only.",
  "Violation of any rule can result in rejection of paper.",
  "Spot Entries will not accept.",
  "Directly copying from the Internet is strongly discouraged and will not be entertained. (Plagiarism up to 20% will be accepted).",
  "Decision of the judges and the event heads shall be treated as final and binding on all and cannot be contested.",
  "The organizers reserve the right to change/update the rules of the contest at any point of time and will do their best to inform to participants of the same. However, it is ultimately the responsibility of the teams to keep themselves updated"
];

const formatRules = [
  "Font style for text: Times New Roman.",
  "Font size for text: 18 points.",
  "Font size for headings: 22 points bold.",
  "Font size for sub-headings: 20 points.",
  "Margin of 1 inches from all sides."
];

export default function Home() {
  return (
    <main className="overflow-hidden max-w-7xl mx-auto px-6 bg-[#EBE9E0]">
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 md:gap-8 py-6 md:py-12 px-4 md:px-8">
        <div className="w-full md:w-1/3 flex justify-center md:justify-start">
          <Image  
            width="400" 
            height="360" 
            alt="Chem Prastuti Event Image" 
            src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931668/Spectrum/shapes/HDSxk4q-min_q2zc7k.png" 
            loading="lazy" 
            draggable="false"
            className="w-[280px] sm:w-[320px] md:w-[400px] h-auto object-contain"
          />
        </div>
        
        <div className={`${korna.className} w-full md:w-2/3 text-left`}>
          <div className="space-y-2 md:space-y-4">
            <h1 className="font-jacques_francois_shadow scroll-m-20 text-3xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-black tracking-tight">
              Chem Prastuti &apos;25
            </h1>
            <h2 className="font-jacques_francois_shadow scroll-m-20 text-md sm:text-3xl md:text-3xl lg:text-4xl font-extrabold text-black tracking-tight">
              brought to you by AS&H, PCCOE
            </h2>
          </div>
        </div>
      </div>

      <div 
        className="relative my-12 aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9] w-full"
        style={{
          backgroundImage: "url('https://res.cloudinary.com/dfyrk32ua/image/upload/v1737645289/Spectrum/side-images/download_i1d7aq.webp')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundColor: '#EBE9E0',
          opacity: 0.9,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <h3 className={`${korna.className} scroll-m-20 text-xl md:text-2xl lg:text-3xl font-extrabold text-black tracking-tight text-center max-w-4xl`}>
            A Chemistry presentation event!
          </h3>
        </div>
      </div>

      <picture> 
        <img className="mx-auto my-4 sm:my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" draggable="false" />
      </picture> 
      <Chem_prastuti_registarion />
      <picture> 
        <img className="mx-auto my-4 sm:my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" draggable="false" />
      </picture> 
      <Rules /> 
      <hr/>
      <picture> 
        <img className="mx-auto my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" draggable="false" />
      </picture> 
      <div className="text-gray-700 leading-7 mb-4 p-2 sm:p-4 md:p-6 lg:p-8">
        <h1 className="text-xl font-semibold mb-4">Team Formation :</h1>
        <ul className="space-y-1 mb-8">
          {teamFormationRules.map((rule, idx) => (
            <li key={idx}>{idx + 1}. {rule}</li>
          ))}
        </ul>

        <h1 className="text-xl font-semibold mb-4">Presentation Rules :</h1>
        <ul className="space-y-1 mb-8">
          {presentationRules.map((rule, idx) => (
            <li key={idx}>{idx + 1}. {rule}</li>
          ))}
        </ul>

        <h1 className="text-xl font-semibold mb-4">Paper/Presentation Format Rules :</h1>
        <p className="mb-2">The presentation (PPT) should be in proper format.</p>
        <ul className="space-y-1">
          {formatRules.map((rule, idx) => (
            <li key={idx}>{idx + 1}. {rule}</li>
          ))}
        </ul>
      </div>
      <picture> 
        <img className="mx-auto my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1737645290/Spectrum/side-images/f_htarul.webp" draggable="false" />
      </picture> 
    </main>
  );
}