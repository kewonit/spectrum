import { Bottle_rocket_registarion } from "@/app/events/bottle-rocket/components/registration";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Spectrum x Water Rocket',
  description: "Tech event for first year students",  
  openGraph: {
    title: 'Spectrum x Water Rocket',
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
    <main className="overflow-hidden max-w-7xl mx-auto px-6 bg-[#EBE9E0]">
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 md:gap-8 py-6 md:py-12 px-4 md:px-8">
        <div className="w-full md:w-1/3 flex justify-center md:justify-start">
          <Image  
            width="400" 
            height="360" 
            alt="Water Rocket Event Image" 
            src="https://i.imgur.com/QMQf6Xn.png"
            loading="lazy" 
            draggable="false"
            className="w-[280px] sm:w-[320px] md:w-[400px] h-auto object-contain"
          />
        </div>
        
        <div className={`${korna.className} w-full md:w-2/3 text-left`}>
          <div className="space-y-2 md:space-y-4">
            <h1 className="font-jacques_francois_shadow scroll-m-20 text-3xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-black tracking-tight">
              Water Rocket &apos;25
            </h1>
            <h2 className="font-jacques_francois_shadow scroll-m-20 text-md sm:text-3xl md:text-3xl lg:text-4xl font-extrabold text-black tracking-tight">
              brought to you by AS&amp;H, PCCOE
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
            A rocket propelled by water and air pressure!
          </h3>
        </div>
      </div>

      <picture> 
        <img className="mx-auto my-4 sm:my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" draggable="false" />
      </picture> 
      <Bottle_rocket_registarion />
      <picture> 
        <img className="mx-auto my-4 sm:my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" draggable="false" />
      </picture> 

      <div className="text-gray-700 leading-7 mb-4 p-4 md:p-6 lg:p-8">
        <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">Rules :</h1>
        <p className="leading-7">
          1. Group size - minimum 1 and maximum 4. <br/>
          2. One group - One Rocket <br/>
          3. Maximum Attempts Allowed - Three (3) <br/>
          4. Competitors bring their own rockets, launchers and team. <br/>
          5. No limit for Bottle Size. <br/>
          6. Bottle Material - Plastic <br/>
          7. Landing point - First point of impact on ground <br/>
          8. Rocket should land within the designated landing <br/>
          9. All energy given to the rocket must only come from the water and air pressure combination. No other source of energy is allowed. You can only compress air manually, with a foot or bicycle pump. <br/>
          10. No external metal parts are allowed on the rocket, but are allowed on the launch mechanism. <br/>
          11. You are only allowed to use plastic bottles specifically designed for holding pressure, or that have been pressure tested (for example carbonated drink bottles). <br/>
          12. Your launch apparatus must be secure and must be able to robustly control the rocket&apos;s flight direction. <br/>
          13. No glass or sharp objects to be used in/on the rocket. <br/>
          14. **Do not use glass bottles or plastic bottles designed for still water. <br/>
          15. For safety&apos;s sake any fast falling rockets must land in the landing zone or you will get no points for that round. If soft-landing rockets (e.g. rockets with parachutes) land outside the landing zone their time will be counted for the longest time in the air award. <br/>
          16. The competitor who achieves the highest Total score out of 100, will be declared the winner of the Launch Competition. <br/>
        </p>
      </div>

      <div className="text-gray-700 leading-7 my-4 p-4 lg:p-8">
        <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">Field :</h1>
        <p className="leading-7">
          <picture>
            <img className="px-8 p-8 rounded-t-lg mx-auto" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705991583/Spectrum/global/AF35KS7-min_qn2qrn.png" alt="product image" width={400} height={100} />
          </picture>
        </p>
        <div className="text-gray-700 leading-7 my-4">
          <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">Total Score Calculation :</h1>
        </div>
        <div className="max-w-5xl mx-auto">
          <picture>
            <img className="px-8 p-8 rounded-t-lg mx-auto" src="https://i.postimg.cc/BZH91k89/formulae.png" alt="product image" width={400} height={100} />
          </picture>
        </div>
      </div>

      <hr/>
      <picture> 
        <img className="mx-auto my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" draggable="false" />
      </picture> 
    </main>
  );
}