// image-loader.js
'use client'

const repo = 'inmobiliaria'
const basePath = process.env.NODE_ENV === 'production' ? `/${repo}` : ''

export default function customImageLoader({ src, width, quality }) {
  // Corrige URLs relativas de /public
  if (src.startsWith('/')) {
     // Asegura que no haya doble barra al inicio si basePath está vacío
     const finalPath = basePath ? `${basePath}${src}` : src;
     return `${finalPath}?w=${width}&q=${quality || 75}`
  }
  // Mantiene URLs absolutas (WordPress, placeholders)
  return `${src}?w=${width}&q=${quality || 75}`
}