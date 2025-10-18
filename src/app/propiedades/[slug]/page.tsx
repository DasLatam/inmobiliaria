// src/app/propiedades/[slug]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
// Asegúrate que la ruta al JSON sea correcta
import propertiesData from '@/data/properties.json'; 
import { PropertyData } from '@/components/PropertyCard';

interface PropertyDetailsData extends PropertyData {
    content?: string;
    gallery?: string[];
    customFieldsData?: { [key: string]: any };
}

function getPropertyBySlug(slug: string): PropertyDetailsData | null {
    const property = (propertiesData as any[]).find((prop: any) => prop.slug === slug);
    if (!property) return null;

    let customFields = {};
    try {
        if (typeof property.customFields === 'string') {
            customFields = JSON.parse(property.customFields || '{}');
        } else if (typeof property.customFields === 'object' && property.customFields !== null) {
            customFields = property.customFields;
        }
    } catch (e) { console.error(`Error parsing customFields for prop ID ${property.id}:`, e); }

    const rentalPriceKeys = ['diciembre-2da-quincena', 'navidad', 'ano-nuevo', 'enero-1ra-quincena', 'enero-2da-quincena', 'febrero-1ra-quincena', 'febrero-2da-quincena'];
    const rentalPrices: number[] = rentalPriceKeys
        .map(key => parseInt(((customFields[key] || '') as string).replace(/[^0-9]/g, '')))
        .filter(price => !isNaN(price) && price > 0);
    const minRentalPrice = rentalPrices.length > 0 ? Math.min(...rentalPrices) : undefined;
    
    const cleanLocations = Array.isArray(property.locations) ? 
         property.locations.filter((loc: string) => loc && !loc.startsWith('X5') && !loc.startsWith('X6') && loc !== 'Argentina' && !loc.includes('Provincia de')) 
         : [];

    return {
        id: property.id,
        title: property.title,
        slug: property.slug,
        featuredImage: property.featuredImage || undefined,
        price: parseInt(property.price || '0') || undefined,
        rentalPrice: minRentalPrice,
        address: property.address || customFields?.['address'] || property.title,
        bedrooms: parseInt(property.bedrooms || customFields?.['bedrooms'] || '0') || undefined,
        bathrooms: parseInt(property.bathrooms || customFields?.['bathrooms'] || '0') || undefined,
        area: parseInt(property.area || customFields?.['area'] || '0') || undefined,
        content: property.content,
        gallery: property.gallery || [],
        customFieldsData: customFields,
        locations: cleanLocations,
    };
}

export async function generateStaticParams() {
  return (propertiesData as any[]).filter(prop => prop.slug).map((prop: any) => ({
    slug: prop.slug,
  }));
}

export default function PropertyPage({ params }: { params: { slug: string } }) {
  const property = getPropertyBySlug(params.slug);

  if (!property) {
    return (
        <div className="container mx-auto px-4 text-center py-20">
            <p className="text-xl text-red-600 mb-4">Propiedad no encontrada.</p>
            <Link href="/" className="text-brand-blue hover:underline">← Volver al listado</Link>
        </div>
    );
  }

  const customFields = property.customFieldsData || {};
  const area = property.area;
  const pax = customFields['pax'] || null;
  const priceFormatted = property.price ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(property.price) : null;

  return (
    <main className="bg-gray-50 pt-8 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
         <div className="mb-6 text-sm">
            <Link href="/" className="text-brand-blue hover:underline">Inicio</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-500">{property.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda (Imagen + Detalles) */}
            <div className="lg:col-span-2 space-y-8">
                {/* Encabezado */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{property.title}</h1>
                    {priceFormatted ? (
                        <p className="text-xl font-semibold text-brand-blue">{priceFormatted}</p>
                    ) : (
                        <p className="text-lg font-semibold text-brand-blue">Consultar Precio de Venta</p>
                    )}
                    {property.address && <p className="text-sm text-gray-500 mt-1">{property.address}</p>}
                </div>

                {/* Galería Principal */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow bg-gray-200">
                   {property.featuredImage ? (
                     <Image
                        src={property.featuredImage}
                        alt={property.title}
                        fill
                        className="object-cover"
                        priority
                     />
                   ) : <div className="flex items-center justify-center h-full text-gray-400">Sin Imagen</div>}
                </div>
                 {/* Aquí iría el carrusel de galería si property.gallery tiene imágenes */}

                {/* Descripción */}
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-100 pb-2">Descripción</h2>
                    {property.content ? (
                        <div
                            className="prose prose-sm max-w-none text-brand-gray"
                            dangerouslySetInnerHTML={{ __html: property.content }}
                        />
                    ) : <p className="text-gray-500 italic text-sm">No hay descripción disponible.</p>}
                </div>
            </div>

            {/* Columna Derecha (Características) */}
            <div className="lg:sticky lg:top-28"> {/* Hace que esta columna sea sticky */}
                 <div className="bg-white p-6 rounded-lg shadow-sm h-fit border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-100 pb-2">Características</h2>
                    <ul className="space-y-2 text-sm text-brand-gray">
                      <li className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="text-md">🛏️</span> Dormitorios:</span> <span className="font-medium">{property.bedrooms || '-'}</span></li>
                      <li className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="text-md">🛁</span> Baños:</span> <span className="font-medium">{property.bathrooms || '-'}</span></li>
                      <li className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="text-md">🏠</span> Superficie:</span> <span className="font-medium">{area ? `${area} m²` : '-'}</span></li>
                      {pax && <li className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="text-md">👥</span> Capacidad:</span> <span className="font-medium">{pax}</span></li>}
                       {customFields['acepta-mascota'] && <li className="flex justify-between items-center"><span className="flex items-center gap-2">🐾</span> Mascotas:</span> <span className="font-medium">{customFields['acepta-mascota']}</span></li>}
                       {customFields['piscina'] && <li className="flex justify-between items-center"><span className="flex items-center gap-2">🏊</span> Pileta:</span> <span className="font-medium">{customFields['piscina']}</span></li>}
                       {/* Añadir más campos relevantes */}
                       {Object.entries(customFields).map(([key, value]) => {
                           // Evita mostrar campos ya listados o internos
                           if (['price', 'bedrooms', 'bathrooms', 'area', 'address', 'pax', 'acepta-mascota', 'piscina', 'gallery', '_thumbnail_id'].includes(key) || !value) return null;
                           // Formatea la clave para mostrarla (ej: 'ano-nuevo' -> 'Año Nuevo')
                           const label = key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                           return (
                               <li key={key} className="flex justify-between items-center capitalize">
                                   <span className="flex items-center gap-2">{label}:</span> 
                                   <span className="font-medium text-right">{String(value)}</span>
                               </li>
                           );
                       })}
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}