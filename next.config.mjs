// next.config.mjs
/** @type {import('next').NextConfig} */

// Eliminamos basePath y assetPrefix específicos de GitHub Pages
// Vercel maneja esto automáticamente.

const nextConfig = {
  output: 'export', // Mantenemos la exportación estática
  // La configuración de images sigue igual
  images: {
    loader: 'custom',
    loaderFile: './image-loader.js', 
    remotePatterns: [
      { protocol: 'https', hostname: 'mcvpropiedades.com.ar' },
      { protocol: 'https', hostname: 'via.placeholder.com' }
    ],
    unoptimized: true 
  },
  trailingSlash: false, // Mantenemos esto por consistencia
};

export default nextConfig;