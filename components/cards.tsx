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
      href: "/e-paradox",
      image: "https://i.postimg.cc/8ztgND1h/solid-color-image.png",
      alt: "image",
      title: "E-Paradox '25",
      description: "A fun activity-based game of cracking codes.",
      borderColor: "border-red-700",
      buttonBgColor: "bg-red-500",
      buttonHoverBgColor: "hover:bg-red-600",
      width: 350,
      height: 300,
    },
    {
      href: "/blindcoding",
      image: "https://i.postimg.cc/rFsSQNDM/solid-color-image-1.png",
      alt: "image",
      title: "Blind Coding '25",
      description: "A fun event which tests your knowledge on basic electronics.",
      borderColor: "border-orange-700",
      buttonBgColor: "bg-orange-500",
      buttonHoverBgColor: "hover:bg-orange-600",
      width: 350,
      height: 300,
    },
    {
      href: "/brain-dasher",
      image: "https://i.postimg.cc/k4wby292/solid-color-image-2.png",
      alt: "image",
      title: "Brain Dasher '25",
      description: "A fun event to put your brain to the test!",
      borderColor: "border-yellow-700",
      buttonBgColor: "bg-yellow-500",
      buttonHoverBgColor: "hover:bg-yellow-600",
      width: 350,
      height: 300,
    },
    {
      href: "/treasure-hunt",
      image: "https://i.postimg.cc/rF7tgX6N/solid-color-image-3.png",
      alt: "image",
      title: "Treasure Hunt '25",
      description: "A fun event of Treasure Hunt!",
      borderColor: "border-green-700",
      buttonBgColor: "bg-green-500",
      buttonHoverBgColor: "hover:bg-green-600",
      width: 350,
      height: 300,
    },
    // {
    //   image: "https://res.cloudinary.com/dfyrk32ua/image/upload/v1705913782/Spectrum/Homepage/HKZuMdo_w2bis3.png",
    //   alt: "logo",
    //   borderColor: "border-orange-700",
    //   width: 400,
    //   height: 200,
    // },
    {
      href: "/chem-prastuti",
      image: "https://i.postimg.cc/rsKKCgQH/solid-color-image-4.png",
      alt: "image",
      title: "Chem Prastuti '25",
      description: "A Chemistry presentation event!",
      borderColor: "border-blue-700",
      buttonBgColor: "bg-blue-500",
      buttonHoverBgColor: "hover:bg-blue-600",
      width: 350,
      height: 300,
    },
    {
      href: "/bottle-rocket",
      image: "https://i.postimg.cc/rs0wtspX/solid-color-image-5.png",
      alt: "image",
      title: "Water Rocket '25",
      description: "A rocket propelled by water and air pressure!",
      borderColor: "border-purple-700",
      buttonBgColor: "bg-purple-500",
      buttonHoverBgColor: "hover:bg-purple-600",
      width: 350,
      height: 300,
    },
    {
      href: "/debate",
      image: "https://i.postimg.cc/15Fzm8TD/solid-color-image-6.png",
      alt: "image",
      title: "War of Words '25",
      description: "War of Words - Debate Competition 2025!",
      borderColor: "border-pink-700",
      buttonBgColor: "bg-pink-500",
      buttonHoverBgColor: "hover:bg-pink-600",
      width: 350,
      height: 300,
    },
    {
      href: "/video-games",
      image: "https://i.postimg.cc/SRMmxPZm/solid-color-image-7.png",
      alt: "image",
      title: "High Ping '25",
      description: "High Ping PCCOE E-Sports Event 2025!",
      borderColor: "border-blue-700",
      buttonBgColor: "bg-[#92c5fc]",
      buttonHoverBgColor: "hover:bg-blue-400",
      width: 350,
      height: 300,
    },
    {
      href: "/sharktank",
      image: "https://i.postimg.cc/9QJ0SvKk/solid-color-image-8.png",
      alt: "image",
      title: "Shark Tank '25",
      description: "Pitch your businesses - PCCOE E-Sports Event 2025!",
      borderColor: "border-blue-700",
      buttonBgColor: "bg-[#11b9a8]",
      buttonHoverBgColor: "hover:bg-blue-400",
      width: 350,
      height: 300,
    },
    {
      href: "/3d-modelling",
      image: "https://i.postimg.cc/PfYxhL0Y/solid-color-image-9.png",
      alt: "image",
      title: "Model Making '25",
      description: "Build cutting edge 3D Models - PCCOE E-Sports Event 2025!",
      borderColor: "border-blue-700",
      buttonBgColor: "bg-[#f4a141]",
      buttonHoverBgColor: "hover:bg-blue-400",
      width: 350,
      height: 300,
    },
    {
      href: "/video-games",
      image: "https://res.cloudinary.com/dfyrk32ua/image/upload/v1705913637/Spectrum/Homepage/videogames_rs9ubb.jpg",
      alt: "image",
      title: "High Ping '24",
      description: "High Ping PCCOE E-Sports Event 2024!",
      borderColor: "border-blue-700",
      buttonBgColor: "bg-blue-300",
      buttonHoverBgColor: "hover:bg-blue-400",
      width: 350,
      height: 300,
    },
    {
      href: "/video-games",
      image: "https://res.cloudinary.com/dfyrk32ua/image/upload/v1705913637/Spectrum/Homepage/videogames_rs9ubb.jpg",
      alt: "image",
      title: "High Ping '24",
      description: "High Ping PCCOE E-Sports Event 2024!",
      borderColor: "border-blue-700",
      buttonBgColor: "bg-blue-300",
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
                <div className={`${!card.title ? 'w-full' : 'w-1/4'}`}>
                  {card.href ? (
                    <Link href={card.href}>
                      <img
                        className="w-full h-[140px] object-cover rounded-l-lg"
                        alt={card.alt}
                        src={card.image}
                      />
                    </Link>
                  ) : (
                    <img
                      className="w-full h-[180px] object-contain px-4"
                      alt={card.alt}
                      src={card.image}
                    />
                  )}
                </div>

                {/* Content section */}
                {card.title && (
                  <>
                    <div className="w-3/5 relative">
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