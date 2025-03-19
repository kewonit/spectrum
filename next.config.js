/** @type {import('next').NextConfig} */

const nextConfig = {
    output: "standalone",
    images: {
      domains: ['i.imgur.com','placehold.co', 'imgur.com', 'edbn-images.fra1.cdn.digitaloceanspaces.com', 
      'edbn-images.fra1.digitaloceanspaces.com', 'i.pinimg.com','avatars.githubusercontent.com',
      'media.licdn.com','i.postimg.cc','res.cloudinary.com','images.unsplash.com','leerob.io', 
      'fe.pccoepune.com', 'drsandeeppatil.weebly.com', 
      'horizon-tailwind-react-git-tailwind-components-horizon-ui.vercel.app', 
      'instagram.fpnq7-2.fna.fbcdn.net', 'spectrumpccoe.github.io', 'lh3.googleusercontent.com'],
    },
    // Exclude the problematic page from static generation
    experimental: {
      // This forces the page to be server-rendered instead of statically generated
      ppv: true, // Partial Prerendering
    },
    // Set runtime configuration to force server-side rendering for the verify-certificate page
    serverRuntimeConfig: {
      // runtime config
    },
    // Add the problematic page to excludedRoutes (if your Next.js version supports it)
    excludedRoutes: ['/verify-certificate'],
}

module.exports = nextConfig
