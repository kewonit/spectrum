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
    // Exclude verify-certificate page from static site generation to avoid the build error
    excludeDefaultMomentLocales: true,
    experimental: {
      // Avoid prerendering the problematic page
      excludeStaticPages: ['/verify-certificate']
    }
}

module.exports = nextConfig
