import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Spectrum 2024 | Team Members',
  description: 'Meet the amazing team behind Spectrum 2024, the technical fest of First Year Engineering at PCCOE.',
  openGraph: {
    title: 'Spectrum 2024 | Team Members',
    description: 'Meet the amazing team behind Spectrum 2024, the technical fest of First Year Engineering at PCCOE.',
    type: 'website',
    url: 'https://spectrumpccoe25.tech/2024',
    siteName: 'Spectrum 2024',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spectrum 2024 | Team Members',
    description: 'Meet the amazing team behind Spectrum 2024, the technical fest of First Year Engineering at PCCOE.',
  }
}

import localFont from 'next/font/local'
import { Inter } from 'next/font/google'

const augillion = localFont({
  src: './components/Augillion.otf',
  variable: '--font-augillion'
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const teamMembers = [
  {
    name: "Atharva Desai",
    image: "https://i.imgur.com/lWbZmMV.jpg",
    instagram: "https://www.instagram.com/atharvez",
    linkedin: "https://www.linkedin.com/in/atharvaez"
  },
  {
    name: "Shreeyash Patil",
    image: "https://i.imgur.com/NxtQVkB.jpg",
    instagram: "https://www.instagram.com/shreeyash_2708",
    linkedin: "https://www.linkedin.com/in/shreeyash-patil-57a71a242"
  },
  {
    name: "Kunal Shitole",
    image: "https://i.imgur.com/yh3D8HR.jpg",
    instagram: "https://www.instagram.com/kreampoof",
    linkedin: "https://www.linkedin.com/in/kunal-shitole-3a3778322"
  }
];

const webDevTeam = [
  {
    name: "Kartik Kulloli",
    image: "https://res.cloudinary.com/dfyrk32ua/image/upload/v1738266414/Spectrum/2024/kartik_xa7yaf.webp",
    role: "Team Lead",
    instagram: "https://www.instagram.com/kewonit/",
    github: "https://github.com/kewonit"
  },
  {
    name: "Mayank Kadam",
    image: "https://i.imgur.com/XRxfY31.jpg",
    role: "Frontend Dev",
    instagram: "https://www.instagram.com/mayank_kadam1039/",
    github: "https://github.com/msk1039"
  }
];

const dfqTeam = [
  {
    name: "Diya Kote",
    image: "https://i.imgur.com/Rr5cJ5h.png",
    role: "Design",
    linkedin: "https://in.linkedin.com/in/diya-kote-412331289",
    instagram: "https://www.instagram.com/_.diya_14/"
  },
  {
    name: "Varda Gachake",
    image: "https://i.imgur.com/oMRjzHa.png",
    role: "Finance",
    linkedin: "https://www.linkedin.com/in/varda-gachake-42041528a",
    instagram: "https://www.instagram.com/_varda.__/"
  },
  {
    name: "Abhiraj Hiwale",
    image: "https://i.imgur.com/o8DbrEA.jpg",
    role: "Registration",
    linkedin: "https://www.linkedin.com/in/abhiraj-hiwale-587676276",
    instagram: "https://www.instagram.com/__abhiraj.sh/"
  }
];

const psmTeam = [
  {
    name: "Ananya Rajankar",
    image: "https://i.imgur.com/ESFYOof.jpg",
    role: "Publicity",
    linkedin: "https://www.linkedin.com/in/ananya-rajankar-10a938264",
    instagram: "https://www.instagram.com/an.anya_rajankar"
  },
  {
    name: "Parth Patil",
    image: "https://i.imgur.com/1rQHUeO_d.webp",
    role: "Sponsorship",
    instagram: "https://www.instagram.com/x.____parth.____x"
  },
  {
    name: "Preksha Gangwal",
    image: "https://i.imgur.com/GLBMW7l.jpg",
    role: "E-media",
    instagram: "https://www.instagram.com/gangwal_preksha007"
  }
];

const supportTeam = [
  {
    name: "Atharva Junghare",
    image: "https://i.imgur.com/8JrFF3o.png",
    role: "Photography and Videography Lead",
    instagram: "https://www.instagram.com/atharva_junghare07"
  },
  {
    name: "Ram Gokhale",
    image: "https://i.imgur.com/ApRORwZ.png",
    role: "Printing",
    instagram: "https://www.instagram.com/ram_gokhale_/"
  },
  {
    name: "Shravani Pajgade",
    image: "https://i.imgur.com/ctLYqIZ.png",
    role: "Inauguration",
    instagram: "https://www.instagram.com/shravanipajgade"
  },
  {
    name: "Rugved Zambare",
    image: "https://res.cloudinary.com/dfyrk32ua/image/upload/v1727687619/Spectrum/5381dd94-d0ec-4899-98af-9741d9870035.png",
    role: "Commencement",
    instagram: "https://www.instagram.com/spinythyme/"
  },
  {
    name: "Advi Deshpande",
    image: "https://i.imgur.com/b5oXUuw.png",
    role: "Decoration",
    instagram: "https://www.instagram.com/a.k.a_adu"
  },
  {
    name: "Rushikesh Patil",
    image: "https://i.imgur.com/ZQRnw8F.png",
    role: "Support System",
    linkedin: "https://www.linkedin.com/in/rushikesh1503",
    instagram: "https://www.instagram.com/patil_rushikesh_"
  }
];

const eventCoordinators = [
  {
    name: "Aadi Kanchankar",
    image: "https://i.imgur.com/ox1TXGU.png",
    role: "Tech Treasure Hunt Co-ordinator",
    linkedin: "https://www.linkedin.com/in/aadi-kanchankar-b30069229"
  },
  {
    name: "Saloni Khandelwal",
    image: "https://i.imgur.com/mjCqvUW.png",
    role: "Brain Dasher Co-ordinator",
    linkedin: "https://www.linkedin.com/in/saloni-khandelwal-a582a22a6/",
    instagram: "https://www.instagram.com/_salonikhandelwal_03"
  },
  {
    name: "Mihik Shah",
    image: "https://i.imgur.com/kSUyEuY.png",
    role: "E-paradox Co-Ordinator",
    github: "https://github.com/Mihik30",
    instagram: "https://www.instagram.com/_mihikk"
  },
  {
    name: "Adway Aghor",
    image: "https://i.imgur.com/XimvEvc.png",
    role: "Chem-Prastuti Co-Ordinator",
    instagram: "https://www.instagram.com/iamnotadway"
  },
  {
    name: "Ketki Gaikwad",
    image: "https://i.imgur.com/MR2HprL.png",
    role: "Electrica Co-ordinator",
    linkedin: "https://www.linkedin.com/in/ketki-gaikwad-8a421827b",
    instagram: "https://www.instagram.com/ketki.0965"
  },
  {
    name: "Jui Harisangam",
    image: "https://i.imgur.com/70QmA24.png",
    role: "Water Rocket Co-ordinator",
    linkedin: "https://www.linkedin.com/",
    instagram: "https://www.instagram.com/jazzuiiii"
  },
  {
    name: "Aditi Jahagirdar",
    image: "https://i.imgur.com/oNmepZZ.png",
    role: "War of Words Co-Ordinator",
    linkedin: "https://www.linkedin.com/in/aditi-jahagirdar-273649284",
    instagram: "https://www.instagram.com/aditijahagirdar_"
  },
  {
    name: "Neelay Shah",
    image: "https://i.imgur.com/PsIXZv4.png",
    role: "High Ping Co-Ordinator",
    linkedin: "https://in.linkedin.com/in/neelay-shah-a05779284",
    instagram: "https://www.instagram.com/neelays3003"
  }
];

const facultyTeam = [
  {
    name: "Dr. Sanjivani Sonar",
    image: "https://fe.pccoepune.com/People/images/faculty/hod.jpg",
    role: "HOD"
  },
  {
    name: "Dr. Leena Sharma",
    image: "https://fe.pccoepune.com/People/images/faculty/sharma.png",
    role: "Faculty Mentor"
  },
  {
    name: "Dr. Shaziya Shaikh",
    image: "https://fe.pccoepune.com/People/images/faculty/shajiya.png",
    role: "Faculty Coordinator"
  },
  {
    name: "Dr. Sandeep Patil",
    image: "https://drsandeeppatil.weebly.com/uploads/3/1/2/9/31290621/published/untitled.jpg?1704449115",
    role: "Faculty Coordinator"
  },
  {
    name: "Dr. Amol kharche",
    image: "https://fe.pccoepune.com/People/images/faculty/Kharche.jpg",
    role: "Faculty Coordinator"
  }
];

export default function BlogPage() {
  return (
    <main className={`flex-1 py-32 bg-[#FFF4E0] ${augillion.variable} ${inter.variable}`}>
      <article className="prose prose-img:mx-auto prose-img:my-auto prose-headings:font-semibold prose-headings:text-black">
        <div className="animate">
          {/* Header section */}
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="font-augillion text-orange-400 text-7xl" style={{ fontFamily: 'var(--font-augillion)' }}>
              Spectrum &apos;24
            </h1>
            <p className="text-stone-600">Feb 17, 2024</p>
            <p className="text-stone-400">Here is glimpse of last year&apos;s spectrum, and the team members!</p>
          </div>

        
          <div className="max-w-3xl mx-auto p-4 pt-6">
            <picture>
              <img 
                src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1738015683/Spectrum/2024/20240215171644_IMG_2363-min_syuprm.webp"
                alt="Spectrum 2024"
                loading="lazy"
                className="w-full h-full object-cover rounded-2xl shadow-lg"
              />
            </picture>
          </div>
          
          <div className="max-w-3xl mx-auto p-4 pt-12">
            <h1 className="font-augillion text-yellow-400 text-5xl" style={{ fontFamily: 'var(--font-augillion)' }}>
              The Core
            </h1>
          </div>

          {/* Team Members Section */}
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex justify-center gap-8 flex-wrap">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex flex-col items-center">
                  <picture>
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      className="w-48 h-48 rounded-2xl object-cover mb-4 shadow-lg"
                    />
                  </picture>
                  <h3 className="text-xl font-medium text-stone-800 mb-2">{member.name}</h3>
                  <div className="flex gap-4 text-sm">
                    <a 
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-600 hover:text-stone-900 underline"
                    >
                      LinkedIn
                    </a>
                    <a 
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-600 hover:text-stone-900 underline"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Web Dev Team Section */}
          <div className="max-w-3xl mx-auto p-4 pt-12">
            <h1 className="font-augillion text-yellow-400 text-5xl" style={{ fontFamily: 'var(--font-augillion)' }}>
              Web Dev Team
            </h1>
          </div>

          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex justify-center gap-8 flex-wrap">
              {webDevTeam.map((member, index) => (
                <div key={index} className="flex flex-col items-center">
                  <picture>
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      className="w-48 h-48 rounded-2xl object-cover mb-4 shadow-lg"
                    />
                  </picture>
                  <h3 className="text-xl font-medium text-stone-800 mb-2">{member.name}</h3>
                  <p className="text-stone-600 mb-3">{member.role}</p>
                  <div className="flex gap-4 text-sm">
                    <a 
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-600 hover:text-stone-900 underline"
                    >
                      GitHub
                    </a>
                    <a 
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-600 hover:text-stone-900 underline"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Design, Finance & Registration Team Section */}
          <div className="max-w-3xl mx-auto p-4 pt-12">
            <h1 className="font-augillion text-yellow-400 text-5xl" style={{ fontFamily: 'var(--font-augillion)' }}>
              Design, Finance & Registration Team
            </h1>
          </div>

          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex justify-center gap-8 flex-wrap">
              {dfqTeam.map((member, index) => (
                <div key={index} className="flex flex-col items-center">
                  <picture>
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      className="w-48 h-48 rounded-2xl object-cover mb-4 shadow-lg"
                    />
                  </picture>
                  <h3 className="text-xl font-medium text-stone-800 mb-2">{member.name}</h3>
                  <p className="text-stone-600 mb-3">{member.role}</p>
                  <div className="flex gap-4 text-sm">
                    <a 
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-600 hover:text-stone-900 underline"
                    >
                      LinkedIn
                    </a>
                    <a 
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-600 hover:text-stone-900 underline"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="max-w-3xl mx-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="col-span-2 md:col-span-2 row-span-2">
                <picture>
                  <img 
                    src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1727706309/Spectrum/irl-banners/IMG_20240202_172220_nv8xdl_hsel8i.webp"
                    alt="Large image"
                    loading="lazy"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </picture>
              </div>
              <div>
                <picture>
                  <img 
                    src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1727706305/Spectrum/irl-banners/662d00a2-5afc-440b-ac56-fbd68efba7f5_k8pqwf.webp"
                    alt="Image 2"
                    loading="lazy"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </picture>
              </div>
              <div>
                <picture>
                  <img 
                    src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1727706306/Spectrum/irl-banners/IMG-20240218-WA0194_tfrg7v_maur3u.webp"
                    alt="Image 3"
                    loading="lazy"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </picture>
              </div>
              <div className="col-span-2 md:col-span-1">
                <picture>
                  <img 
                    src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1727706308/Spectrum/irl-banners/IMG-20240218-WA0206_dio8mf_cqsyre.webp"
                    alt="Image 4"
                    loading="lazy"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </picture>
              </div>
              <div>
                <picture>
                  <img 
                    src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1727706307/Spectrum/irl-banners/IMG-20240218-WA0207_gazuaa.webp"
                    alt="Image 5"
                    loading="lazy"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </picture>
              </div>
              <div>
                <picture>
                  <img 
                    src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1727706305/Spectrum/irl-banners/Screenshot_2024-09-30_195048_qnycwt.webp"
                    alt="Image 6"
                    loading="lazy"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </picture>
              </div>
            </div>
          </div>
          {/* Publicity, Sponsorship & E-media Team Section */}
          <div className="max-w-3xl mx-auto p-4 pt-12">
            <h1 className="font-augillion text-yellow-400 text-5xl" style={{ fontFamily: 'var(--font-augillion)' }}>
              Publicity, Sponsorship & E-media Team
            </h1>
          </div>

          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex justify-center gap-8 flex-wrap">
              {psmTeam.map((member, index) => (
                <div key={index} className="flex flex-col items-center">
                  <picture>
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      className="w-48 h-48 rounded-2xl object-cover mb-4 shadow-lg"
                    />
                  </picture>
                  <h3 className="text-xl font-medium text-stone-800 mb-2">{member.name}</h3>
                  <p className="text-stone-600 mb-3">{member.role}</p>
                  <div className="flex gap-4 text-sm">
                    {member.linkedin && (
                      <a 
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-600 hover:text-stone-900 underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    <a 
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-600 hover:text-stone-900 underline"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Team Section */}
          <div className="max-w-3xl mx-auto p-4 pt-12">
            <h1 className="font-augillion text-yellow-400 text-5xl" style={{ fontFamily: 'var(--font-augillion)' }}>
              Photography, Videography & Support System
            </h1>
          </div>

          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex justify-center gap-8 flex-wrap">
              {supportTeam.map((member, index) => (
                <div key={index} className="flex flex-col items-center">
                  <picture>
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      className="w-48 h-48 rounded-2xl object-cover mb-4 shadow-lg"
                    />
                  </picture>
                  <h3 className="text-xl font-medium text-stone-800 mb-2">{member.name}</h3>
                  <p className="text-stone-600 mb-3">{member.role}</p>
                  <div className="flex gap-4 text-sm">
                    {member.linkedin && (
                      <a 
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-600 hover:text-stone-900 underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    <a 
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-600 hover:text-stone-900 underline"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Coordinators Section */}
          <div className="max-w-3xl mx-auto p-4 pt-12">
            <h1 className="font-augillion text-yellow-400 text-5xl" style={{ fontFamily: 'var(--font-augillion)' }}>
              Event Co-ordinators
            </h1>
          </div>

          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex justify-center gap-8 flex-wrap">
              {eventCoordinators.map((member, index) => (
                <div key={index} className="flex flex-col items-center">
                  <picture>
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      className="w-48 h-48 rounded-2xl object-cover mb-4 shadow-lg"
                    />
                  </picture>
                  <h3 className="text-xl font-medium text-stone-800 mb-2">{member.name}</h3>
                  <p className="text-stone-600 mb-3">{member.role}</p>
                  <div className="flex gap-4 text-sm">
                    {member.linkedin && (
                      <a 
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-600 hover:text-stone-900 underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    {member.github && (
                      <a 
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-600 hover:text-stone-900 underline"
                      >
                        GitHub
                      </a>
                    )}
                    {member.instagram && (
                      <a 
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-600 hover:text-stone-900 underline"
                      >
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Faculty Team Section */}
          <div className="max-w-3xl mx-auto p-4 pt-12">
            <h1 className="font-augillion text-yellow-400 text-5xl" style={{ fontFamily: 'var(--font-augillion)' }}>
              Faculty Team
            </h1>
          </div>

          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex justify-center gap-8 flex-wrap">
              {facultyTeam.map((member, index) => (
                <div key={index} className="flex flex-col items-center">
                  <picture>
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      className="w-48 h-48 rounded-2xl object-cover mb-4 shadow-lg"
                    />
                  </picture>
                  <h3 className="text-xl font-medium text-stone-800 mb-2">{member.name}</h3>
                  <p className="text-stone-600 mb-3">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content section */}
          <div className="max-w-3xl mx-auto p-4">
            <div className="space-y-6 text-stone-700/90 leading-relaxed font-normal text-center">
              <p>Thanks to everyone, who has contributed to this event.</p>
            </div>
          </div>


        </div>
      </article>
    </main>
  )
}
