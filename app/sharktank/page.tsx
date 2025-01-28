import { Rules } from "@/app/sharktank/components/accordian"
import { Sharktank_registarion } from "@/app/sharktank/components/registration";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Spectrum x Shark Tank',
  description: "Business pitch competition for innovative minds",  
  openGraph: {
    title: 'Spectrum x Shark Tank',
    description: "Business pitch competition for innovative minds",  
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

const ruleList = [
  "1. The event is open to all students of PCCOE and other institutions.",
  "2. Teams can have a maximum of 3 members.",
  "3. Registration is mandatory through the official event portal.",
  "4. Only top 25 business ideas will be shortlisted for the final round.",
  "5. Teams must submit a 300-word business idea description during registration.",
  "6. Pitch presentations should be 5-7 minutes long.",
  "7. PowerPoint or similar visual presentations are required.",
  "8. Presentations must cover business concept, target audience, problem statement, solution, and market analysis.",
  "9. Teams will be judged on innovation, feasibility, presentation skills, business model, and social impact.",
  "10. Q&A round performance will contribute to final scoring.",
  "11. Industry experts and faculty members will form the judging panel.",
  "12. Top 3 teams will receive prizes and recognition.",
  "13. Plagiarism or fraudulent activities will result in immediate disqualification.",
  "14. All presentations must be original work.",
  "15. Registration and participation are free of cost.",
  "16. Winners will receive cash prizes and certificates.",
];

export default function Home() {
  return (
    <main className="overflow-hidden max-w-7xl mx-auto px-8 bg-[#EBE9E0]">
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 md:gap-8 py-6 md:py-12 px-4 md:px-8">
        <div className="w-full md:w-1/3 flex justify-center md:justify-start">
          <Image  
            width="400" 
            height="360" 
            alt="Shark Tank Event Image" 
            src="https://i.imgur.com/GPIvn8s.png" 
            loading="lazy" 
            draggable="false"
            className="w-[280px] sm:w-[320px] md:w-[400px] h-auto object-contain"
          />
        </div>
        
        <div className={`${korna.className} w-full md:w-2/3 text-left`}>
          <div className="space-y-2 md:space-y-4">
            <h1 className="font-jacques_francois_shadow scroll-m-20 text-3xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-gray-800 tracking-tight">
              Shark Tank &apos;25
            </h1>
            <h2 className="font-jacques_francois_shadow scroll-m-20 text-md sm:text-3xl md:text-3xl lg:text-4xl font-extrabold text-gray-700 tracking-tight">
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
            Present your innovative business ideas to our panel of expert judges and win exciting prizes while gaining valuable feedback and exposure
          </h3>
        </div>
      </div>

      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" draggable="false" />
      </picture> 
      <Sharktank_registarion />
      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" draggable="false" />
      </picture> 
        <Rules /> 
    <hr/>
    <picture> 
      <img className="mx-auto my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" draggable="false" />
    </picture> 
    <div className="text-gray-700 leading-7 mb-4 p-2 sm:p-4 md:p-6 lg:p-8">
        <h1>Rule Book :</h1>
        <ul className="space-y-1 mt-4">
            {ruleList.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
        </ul>
    </div>
    <picture> 
      <img className="mx-auto my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1737645290/Spectrum/side-images/f_htarul.webp" draggable="false" />
    </picture> 
    </main>
  );
}