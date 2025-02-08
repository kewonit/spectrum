"use client"

import React from 'react';
import Image from "next/image";
import { Krona_One } from 'next/font/google';

const krona = Krona_One({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: '400',
});

interface TeamMember {
    name: string;
    role: string;
    image: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
}

export default function TeamBehindSpectrum() {
    const teamSections = [
    {
        title: "Spectrum Core Team [Students]",
        description: "The driving force behind Spectrum, leading the way with passion and dedication.",
        members: [
            {
                name: "Harshil Biyani",
                role: "Convener",
                image: "https://i.postimg.cc/yd3cXnvX/fedda0ac-dd2c-45ce-862f-edfc4a7a09bc.jpg",
                linkedin:
                    "https://www.linkedin.com/in/harshil-biyani-243a0932a/",
                instagram: "https://www.instagram.com/harshilbiyani/",
            },
            {
                name: "Aditya Rajput",
                role: "Organizing Secretary",
                image: "https://i.postimg.cc/SKJMkDFF/02ec7733-0de8-4b19-9460-d3b5e324ec88.jpg",
                linkedin:
                    "https://www.linkedin.com/in/aditya-rajput-b197b9290/",
                instagram: "https://www.instagram.com/aditya_.r08/",
            },
            {
                name: "Eshal Sayed",
                role: "Organizing Secretary",
                image: "https://i.postimg.cc/SK3zsCkX/3a7077e1-1232-4bd2-9d4e-8a1ea17523ea.jpg",
                linkedin: "https://www.linkedin.com/in/eshal-sayed-84521932b/",
            },
            {
                name: "Aarya More",
                role: "Treasurer",
                image: "https://i.postimg.cc/B6697728/02a86daa-519f-4944-ae43-856bb6d3900e.jpg",
                instagram: "https://www.instagram.com/aaryamore018/",
            },
        ],
    },
    {
        title: "Technical & Design Team",
        description: "The creative minds blending tech and design to bring Spectrum to life.",
        members: [
            {
                name: "Ved Jadhav",
                role: "Technical Secretary (Design Head)",
                image: "https://media.licdn.com/dms/image/v2/D4E03AQFVhdEg63jOIA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1727884523460?e=1743638400&v=beta&t=JwogcYeAlaPf8bcvEsMaGllw7----NTaDkrG645SJ0E",
                linkedin: "https://www.linkedin.com/in/vedjadhav/",
                instagram: "https://www.instagram.com/vedjadhav_10/",
            },
            {
                name: "Aadithyan Nair",
                role: "Web Dev Head",
                image: "https://i.pinimg.com/736x/68/9f/84/689f849844442d01fdc40eee7d1c5033.jpg",
                linkedin: "https://www.linkedin.com/in/aadithyanrajesh/",
                instagram: "https://www.instagram.com/aadi.a10/",
                github: "https://github.com/aadithyanr",
            },
            // Add more members as needed
        ],
    },
    {
        title: "First Year Student Association",
        description: "The fresh energy shaping Spectrum with new ideas and enthusiasm.",
        members: [
            {
                name: "Kshitij Jadhav",
                role: "General Secretary (Registration Head)",
                image: "https://i.postimg.cc/LsSmDVyf/502d507c-f3ba-4a19-a2e3-a9ca2d422f2d.jpg",
                linkedin:
                    "https://www.linkedin.com/in/kshitij-jadhav-7b434b338/",
                github: "https://github.com/Loop24Infility",
            },
            {
                name: "Yogya Suryawanshi",
                role: "Co-General Secretary (Photo & Video Head)",
                image: "https://i.postimg.cc/nr2mVzCS/83d4c2c3-1097-4012-9f03-e860f8467e0a.jpg",
                linkedin:
                    "https://www.linkedin.com/in/yogya-suryawanshi-712ba1333/",
                instagram: "https://www.instagram.com/yogyaa.27/",
            },
            {
                name: "Sanskruti Soitkar",
                role: "Cultural Secretary (Decoration Head)",
                image: "https://i.postimg.cc/rwkpZcsK/32c95b36-a71c-47d9-94a7-746deebfffe4.jpg",
                linkedin:
                    "https://www.linkedin.com/in/sanskruti-soitkar-bb140934a/",
                instagram: "https://www.instagram.com/sanskrutiii._s/",
            },
            {
                name: "Omkar Pachore",
                role: "ISR Cell Representative (Support Head)",
                image: "https://i.postimg.cc/xTsmWXrc/396a1ee3-2020-4b37-9166-25cb74ee4509.jpg",

                instagram: "https://www.instagram.com/omkar.pachore/",
            },
            {
                name: "Chinmayi Pethkar",
                role: "Ladies Representative (Decoration Head)",
                image: "https://i.postimg.cc/KYTgkQ1M/7f0c4edc-f2b7-483e-b2f6-8d82324791b5.jpg",
                linkedin:
                    "https://www.linkedin.com/in/chinmayi-pethkar-97221732b/",
                instagram: "https://www.instagram.com/chinmayi_080/",
            },
            // Add more members as needed
        ],
    },

    {
        title: "Social media & Sponsorship Team",
        description: "Building connections and making Spectrum go viral!",
        members: [
            {
                name: "Soham Zagare",
                role: "E-Media Head",
                image: "https://i.postimg.cc/T1T6q2C6/459412594-1011542340751115-7153984875844102525-n.jpg",
                linkedin: "https://www.linkedin.com/in/soham-zagare-76474922b/",
                instagram: "https://www.instagram.com/zagare_19/",
            },
            {
                name: "Tanvi Jadhav",
                role: "Sponsorship Team",
                image: "https://i.postimg.cc/Bv14JVXd/4bac7c10-78a7-4d2f-b788-671733b655fa.jpg",
                linkedin: "https://www.linkedin.com/in/tanvi-jadhav/",
            },
            {
                name: "Tejal Jadhav",
                role: "Sponsorship Team",
                image: "https://i.postimg.cc/QdTvPgP3/cc3b2a30-ffab-40b5-b762-2144539f61e3.jpg",
                linkedin: "https://www.linkedin.com/in/tejal-j/",
            },
            // Add more members as needed
        ],
    },

    {
        title: "Event Co-Ordinators",
        description: "The masterminds behind every thrilling Spectrum event.",
        members: [
            {
                name: "Khushie Mohod",
                role: "Brain Dasher",
                image: "https://i.postimg.cc/Wp8S1bLP/3956d5a0-2a04-4372-a9f4-1790f60142e0.jpg",
                linkedin:
                    "https://www.linkedin.com/in/khushie-mohod-94453531a/",
                instagram: "https://www.instagram.com/khushiemohod/",
            },
            {
                name: "Prachi Pawar",
                role: "E-Paradox",
                image: "https://i.postimg.cc/CLwHyyz6/078518c9-5c63-4b43-a7e4-5c48d4d7919c.jpg",
                instagram: "https://www.instagram.com/prachipawar_____/",
            },
            {
                name: "Ananya Komarwar",
                role: "Chem-Prastuti",
                image: "https://i.postimg.cc/KvcqP3rz/86e464a3-f32e-44ac-927e-c4c630939aef.jpg",
                instagram: "https://www.instagram.com/ananyak_1903/",
            },
            {
                name: "Yash Sonalekar",
                role: "Blind Coding",
                image: "https://i.postimg.cc/CL63d4TY/yash.jpg",
                linkedin:
                    "https://www.linkedin.com/in/yash-sonalekar-3727722a0/",
                instagram: "https://www.instagram.com/yash.hyprin/",
            },
            {
                name: "Shivtej Waghmode",
                role: "Water Rocket",
                image: "https://i.postimg.cc/mr86W95p/IMG-9273.jpg",
                linkedin:
                    "https://www.linkedin.com/in/shivtej-bharat-waghmode-0b7531324/",
                instagram: "https://www.instagram.com/iam_sw7",
            },
            {
                name: "Muskan Thakur",
                role: "War of Words",
                image: "https://i.postimg.cc/MKx7KVD5/New-Project-4.png",
                linkedin:
                    "https://www.linkedin.com/in/muskan-thakur-6a552a328/",
                instagram: "https://www.instagram.com/muskan._.itis/",
            },
            {
                name: "Vivaan Sangpal",
                role: "Model Making",
                image: "https://i.postimg.cc/7YcVwwGy/475607a6-279a-47d8-80d7-a0be25e45fe9.jpg",
                linkedin:
                    "https://www.linkedin.com/in/vivaan-sangpal-7b121032b/",
                instagram: "https://www.instagram.com/tf__vee/",
            },
            {
                name: "Atharv Huilgol",
                role: "Shark Tank",
                image: "https://i.postimg.cc/XvB9K4zX/fddc2e8c-6c31-4a05-aeef-8b6060f0fbfe.jpg",
                linkedin:
                    "https://www.linkedin.com/in/atharv-huilgol-289271319/",
                instagram: "https://www.instagram.com/officially_atharv?",
            },
            {
                name: "Saish Walavalkar",
                role: "High Ping",
                image: "https://i.postimg.cc/CxGmvNSV/05168ba9-5fb5-4b11-a15d-f6782b1a82e0.jpg",
                linkedin:
                    "https://www.linkedin.com/in/saish-walavalkar-3ab869336/",
                instagram: "https://www.instagram.com/saish_walavalkar/",
            },
            {
                name: "Asmi Palekar",
                role: "Treasure Hunt",
                image: "https://i.postimg.cc/j2t8kLpM/63763386-35f4-4140-a262-4f84df76fa0d.jpg",
                linkedin: "https://www.linkedin.com/in/asmi-palekar-1a931230a/",
                instagram: "https://www.instagram.com/asmi_palekar/",
            },
            {
                name: "Debottam Debnath",
                role: "Treasure Hunt",
                image: "https://i.postimg.cc/mrd2rHwH/b679415d-4ac1-4705-9f19-1c91466dd825.jpg",
                linkedin:
                    "https://www.linkedin.com/in/debottam-debnath-1b747b32b/",
            },
            {
                name: "Aarti Chopade",
                role: "Fun Activities",
                image: "https://i.postimg.cc/N0QbZHj2/Whats-App-Image-2025-02-02-at-12-52-15-PM.jpg",
                linkedin:
                    "https://www.linkedin.com/in/aarti-chopade-984a0732a/",
                instagram: "https://www.instagram.com/aarti_chopade27/",
            },
            // Add more members as needed
        ],
    },
    {
        title: "Spectrum Core Team [Teachers]",
        description: "Guiding Spectrum with wisdom, knowledge, and leadership.",
        members: [
            {
                name: "Dr. Leena Sharma",
                role: "HOD",
                image: "https://fe.pccoepune.com/People/images/faculty/sharma.png",
            },
            {
                name: "Dr. Neha Sharma",
                role: "Faculty Co-Ordinator",
                image: "https://fe.pccoepune.com/images/faculty/neha-sharma.JPG",
            },
            {
                name: "Dr. Mohit Prasad",
                role: "Faculty Co-Ordinator",
                image: "https://fe.pccoepune.com/images/faculty/prasad.webp",
            },
            {
                name: "Mrs. Geetanjali Zambare",
                role: "Faculty Co-Ordinator",
                image: "https://fe.pccoepune.com/images/faculty/gz.webp",
            },

            // Add more members as needed
        ],
    },
    // Add more sections as needed
];

const TeamMemberCard = ({ member }: { member: TeamMember }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-[3/4] overflow-hidden">
            <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover object-center"
            />
        </div>
        
        <div className="p-6 bg-white">
            <h3 className={`${krona.className} text-xl text-gray-900 font-semibold mb-1`}>
                {member.name}
            </h3>
            <p className="text-gradient text-sm font-medium mb-4">
                {member.role}
            </p>
            
            <div className="flex space-x-3">
                {member.linkedin && (
                    <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19,3H5C3.895,3,3,3.895,3,5v14c0,1.105,0.895,2,2,2h14c1.105,0,2-0.895,2-2V5C21,3.895,20.105,3,19,3z M9,17H6.477v-7H9 V17z M7.694,8.717c-0.771,0-1.286-0.514-1.286-1.2s0.514-1.2,1.371-1.2c0.771,0,1.286,0.514,1.286,1.2S8.551,8.717,7.694,8.717z M18,17h-2.442v-3.826c0-1.058-0.651-1.302-0.895-1.302s-1.058,0.163-1.058,1.302c0,0.163,0,3.826,0,3.826h-2.523v-7h2.523v0.977 C13.93,10.407,14.581,10,15.802,10C17.023,10,18,10.977,18,13.174V17z" />
                        </svg>
                    </a>
                )}
                {member.instagram && (
                    <a
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-pink-600 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 3C5.239 3 3 5.239 3 8L3 16C3 18.761 5.239 21 8 21L16 21C18.761 21 21 18.761 21 16L21 8C21 5.239 18.761 3 16 3L8 3zM18 5C18.552 5 19 5.448 19 6C19 6.552 18.552 7 18 7C17.448 7 17 6.552 17 6C17 5.448 17.448 5 18 5zM12 7C14.761 7 17 9.239 17 12C17 14.761 14.761 17 12 17C9.239 17 7 14.761 7 12C7 9.239 9.239 7 12 7zM12 9A3 3 0 0 0 9 12A3 3 0 0 0 12 15A3 3 0 0 0 15 12A3 3 0 0 0 12 9z" />
                        </svg>
                    </a>
                )}
            </div>
        </div>
    </div>
);

return (
    <main className="min-h-screen bg-gray-50">
        {/* Header Decoration */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Page Header */}
            <div className="text-center mb-16">
                <h1 className={`${krona.className} text-4xl md:text-5xl text-gray-900 mb-4`}>
                    Meet Our Team
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    The passionate individuals behind Spectrum 2024, working together to create an unforgettable experience.
                </p>
            </div>

            {teamSections.map((section, sectionIndex) => (
                <section key={sectionIndex} className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className={`${krona.className} text-3xl text-gray-900 mb-3`}>
                            <span className="text-gradient">{section.title}</span>
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            {section.description}
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-6xl">
                            {section.members.map((member, memberIndex) => (
                                <TeamMemberCard 
                                    key={memberIndex} 
                                    member={member} 
                                />
                            ))}
                        </div>
                    </div>
                </section>
            ))}
        </div>
    </main>
);
}


