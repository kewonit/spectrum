/** @type {import('next').NextConfig} */

const nextConfig = {
    output: "standalone",
    images: {
      domains: ['i.imgur.com', 'imgur.com', 'edbn-images.fra1.cdn.digitaloceanspaces.com', '*.digitaloceanspaces.com', 'i.pinimg.com','avatars.githubusercontent.com','media.licdn.com','i.postimg.cc','res.cloudinary.com','images.unsplash.com','leerob.io', 'fe.pccoepune.com', 'drsandeeppatil.weebly.com', 'horizon-tailwind-react-git-tailwind-components-horizon-ui.vercel.app', 'instagram.fpnq7-2.fna.fbcdn.net', 'spectrumpccoe.github.io', 'lh3.googleusercontent.com'],
    },
  }

module.exports = nextConfig
