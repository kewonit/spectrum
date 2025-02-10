import "../components/pag.css"
import Link from 'next/link'
import { Krona_One } from 'next/font/google'

const korna = Krona_One({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: '400', 
});

export default function Cards() {
  const cardsData = [
    {
      href: "/events/e-paradox",
      image: "https://i.postimg.cc/yYWmxgfr/2.png",
      alt: "image",
      title: "E-Paradox '25",
      description: "A code-breaking challenge that tests logic and problem-solving skills.",
      borderColor: "border-red-700",
      buttonBgColor: "bg-red-500",
      buttonHoverBgColor: "hover:bg-red-600",
      width: 350,
      height: 300,
    },
    {
      href: "/events/blindcoding",
      image: "https://i.postimg.cc/XYC9cM6f/5.png",
      alt: "image",
      title: "Blind Coding '25",
      description: "A programming contest where coding is done without real-time visibility.",
      borderColor: "border-orange-700",
      buttonBgColor: "bg-orange-500",
      buttonHoverBgColor: "hover:bg-orange-600",
      width: 350,
      height: 300,
    },
    {
      href: "/events/brain-dasher",
      image: "https://i.postimg.cc/wxw59ckm/1.png",
      alt: "image",
      title: "Brain Dasher '25",
      description: "A logic and reasoning event that challenges critical thinking skills.",
      borderColor: "border-yellow-700",
      buttonBgColor: "bg-yellow-500",
      buttonHoverBgColor: "hover:bg-yellow-600",
      width: 350,
      height: 300,
    },
    {
      href: "/events/treasure-hunt",
      image: "https://i.postimg.cc/9MJ9FCyh/9.png",
      alt: "image",
      title: "Tech Treasure Hunt '25",
      description: "An adventurous quest to solve clues and uncover hidden treasures.",
      borderColor: "border-green-700",
      buttonBgColor: "bg-green-500",
      buttonHoverBgColor: "hover:bg-green-600",
      width: 350,
      height: 300,
    },
    {
      href: "/events/chem-prastuti",
      image: "https://i.postimg.cc/QCdppHjC/10.png",
      alt: "image",
      title: "Chem Prastuti '25",
      description: "A chemistry-based presentation event to showcase scientific ideas.",
      borderColor: "border-blue-700",
      buttonBgColor: "bg-blue-500",
      buttonHoverBgColor: "hover:bg-blue-600",
      width: 350,
      height: 300,
    },
    {
      image: "https://res.cloudinary.com/dfyrk32ua/image/upload/v1738266205/Spectrum/main-icons-2025/invitation_2_7_a9ga7q.webp",
      alt: "Spectrum Logo",
      borderColor: "border-white",
      width: 350,
      height: 300,
    },
    {
      href: "/events/bottle-rocket",
      image: "https://i.postimg.cc/Wzs7zpZf/s.webp",
      alt: "image",
      title: "Water Rocket '25",
      description: "A physics-driven contest to design and launch water-propelled rockets.",
      borderColor: "border-purple-700",
      buttonBgColor: "bg-purple-500",
      buttonHoverBgColor: "hover:bg-purple-600",
      width: 350,
      height: 300,
    },
    {
      href: "/events/debate",
      image: "https://i.postimg.cc/qqD2Q47L/3.png",
      alt: "image",
      title: "War of Words '25",
      description: "A competitive debate event that tests persuasion and argumentation skills.",
      borderColor: "border-pink-700",
      buttonBgColor: "bg-pink-500",
      buttonHoverBgColor: "hover:bg-pink-600",
      width: 350,
      height: 300,
    },
    {
      href: "/events/video-games",
      image: "https://i.postimg.cc/ZqzpwfJ1/7.png",
      alt: "image",
      title: "High Ping '25",
      description: "A thrilling e-sports tournament showcasing gaming skills and strategy.",
      borderColor: "border-blue-700",
      buttonBgColor: "bg-[#92c5fc]",
      buttonHoverBgColor: "hover:bg-blue-400",
      width: 350,
      height: 300,
    },
    {
      href: "/events/sharktank",
      image: "https://i.postimg.cc/gk5vZzQc/4.png",
      alt: "image",
      title: "Shark Tank '25",
      description: "A business pitch competition to present innovative startup ideas.",
      borderColor: "border-blue-700",
      buttonBgColor: "bg-[#11b9a8]",
      buttonHoverBgColor: "hover:bg-blue-400",
      width: 350,
      height: 300,
    },
    {
      href: "/events/3d-modelling",
      image: "https://i.postimg.cc/PxtZjPpy/8.png",
      alt: "image",
      title: "Model Making '25",
      description: "A design competition to create cutting-edge 3D architectural models.",
      borderColor: "border-blue-700",
      buttonBgColor: "bg-[#f4a141]",
      buttonHoverBgColor: "hover:bg-blue-400",
      width: 350,
      height: 300,
    },
];


  return (
    <div className="relative min-h-screen bg-black">
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(#EBE9E0 1px, transparent 1px), linear-gradient(90deg, #EBE9E0 1px, transparent 1px)`,
        backgroundSize: '35px 35px',
        opacity: 0.2  
      }}></div>

      <div className="container mx-auto px-6 sm:px-8 py-8 sm:py-12 max-w-2xl relative">
        {cardsData.map((card, idx) => (
          <div key={idx} className="mb-6 sm:mb-8 w-full relative">
            <div className={`rounded-lg shadow-lg ${card.borderColor} relative`} style={{ backgroundColor: '#EBE9E0' }}>
              {/* Ticket dots */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-black rounded-r-full"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-black rounded-l-full"></div>

              <div className="flex">
                {/* Image section */}
                <div className={`${!card.title ? 'w-full' : 'w-1/3'} flex items-center justify-center`}>
                  {card.href ? (
                    <Link href={card.href} className="flex items-center justify-center w-full">
                      <img
                        className="w-full h-[140px] object-contain p-2 rounded-l-lg"
                        alt={card.alt}
                        src={card.image}
                        draggable="false"
                      />
                    </Link>
                  ) : (
                    <img
                      className="w-full h-[140px] object-contain px-4 -mt-2"
                      alt={card.alt}
                      src={card.image}
                      draggable="false"
                    />
                  )}
                </div>

                {/* Content section */}
                {card.title && (
                  <>
                    <div className="w-1/2 relative">
                      <div className={`absolute inset-0 opacity-10 ${card.buttonBgColor}`}></div>
                      <div className="relative p-4">
                        <Link href={card.href}>
                          <h1 className={`${korna.className} mb-2 text-xl font-bold tracking-tight text-gray-900 hover:opacity-80 transition-opacity`}>
                            {card.title}
                          </h1>
                        </Link>
                        <p className="text-sm text-gray-700">{card.description}</p>
                      </div>
                    </div>
                    
                    {/* Full-height button section */}
                    <Link
                      href={card.href}
                      className={`w-1/6 flex items-center justify-center ${card.buttonBgColor} ${card.buttonHoverBgColor} transition-colors duration-200 rounded-r-lg p-2 sm:p-4`}
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                      </svg>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}