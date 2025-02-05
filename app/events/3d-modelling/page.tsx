import { Rules } from "@/app/events/3d-modelling/components/accordian"
import { ThreeModelling } from "@/app/events/3d-modelling/components/registration";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Spectrum x Model Making',
  description: "Tower building competition for engineering students",  
  openGraph: {
    title: 'Spectrum x Model Making',
    description: "Tower building competition for engineering students",  
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
        Build a Tower&apos;25
        </h1>
        <br/>
        <h2 className="font-jacques_francois_shadow scroll-m-20 pl-2 text-2xl font-extrabold text-gray-800 tracking-tight lg:text-5xl">
          brought to you by Civil Department, PCCOE
        </h2>
      </div>
      <picture> 
        <img className="mx-auto mt-4" width="600" height="450" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931688/Spectrum/shapes/MJ4C1aA-min_z9q3gr.png" />
      </picture> 
      <div>
      <h3 className="font-jacques_francois_shadow text-center scroll-m-20 my-6 pl-2 text-xl font-extrabold text-gray-800 tracking-tight md:text-3xl lg:text-5xl">
        Test your engineering skills in real!
      </h3>
      </div>
      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture> 
      <ThreeModelling />
      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture> 
      <Rules /> 
    <hr/>
      <picture> 
        <img className="mx-auto my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture> 
    {/* <div className="text-gray-700 leading-7 mb-4 p-2 lg:p-8"> */}
        {/* <h1>Rules and Regulations:</h1> */}
          {/* <p className="leading-7">
          1. Teams must consist of exactly 3 members<br/>
          2. Only provided materials (popsicle sticks and adhesive fevicol) can be used<br/>
          3. Cutters and clips are allowed for construction<br/>
          4. Tower must be exactly 30cm in height<br/>
          5. Cross-section must remain consistent throughout<br/>
          6. Base must be flat and stable<br/>
          7. Top must be flat to support load placement<br/>
          8. Use of unauthorized materials will result in disqualification<br/>
          9. Judges&apos; decisions are final and binding
          </p>
          <h1 className="pt-8">Judging Criteria:</h1>
          <p className="leading-7">
          1. Load carrying capacity to self-weight ratio<br/>
          2. Structural stability<br/>
          3. Adherence to specifications<br/>
          4. Quality of construction
          </p> */}
        {/* </div> */}
    </main>
  );
}