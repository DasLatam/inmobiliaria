// next.config.mjs
/** @type {import('next').NextConfig} */

const repo = 'inmobiliaria'
const assetPrefix = process.env.NODE_ENV === 'production' ? `/${repo}/` : ''
const basePath = process.env.NODE_ENV === 'production' ? `/${repo}` : ''

const nextConfig = {
  output: 'export', 
  assetPrefix: assetPrefix, 
  basePath: basePath, 
  images: {
    loader: 'custom',
    loaderFile: './image-loader.js', 
    remotePatterns: [
      { protocol: 'https', hostname: 'mcvpropiedades.com.ar' },
      { protocol: 'https', hostname: 'via.placeholder.com' }
    ],
    unoptimized: true 
  },
  // Evita el trailing slash para compatibilidad con GitHub Pages
  trailingSlash: false,
};

export default nextConfig;