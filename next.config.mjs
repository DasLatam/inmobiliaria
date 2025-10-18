// next.config.mjs (Versión para build estándar en Vercel)
/** @type {import('next').NextConfig} */

const nextConfig = {
  // output: 'export', // Comentado o eliminado
  images: {
    loader: 'default', 
    remotePatterns: [
      { protocol: 'https', hostname: 'mcvpropiedades.com.ar' },
      { protocol: 'https', hostname: 'via.placeholder.com' }
    ],
  },
  trailingSlash: false, 
};

export default nextConfig;