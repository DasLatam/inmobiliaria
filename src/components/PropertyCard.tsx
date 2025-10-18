// src/components/PropertyCard.tsx
import Image from 'next/image';
import Link from 'next/link';

// Definimos qué datos espera la tarjeta
export interface PropertyData {
  id: number; title: string; slug: string; featuredImage?: string;
  price?: number; rentalPrice?: number; address?: string;
  bedrooms?: number; bathrooms?: number; area?: number;
  customFields?: { [key: string]: any }; 
  locations?: string[];
}

const formatPrice = (num: number) => {
  if (!num || num === 0) return null;
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);
};

export default function PropertyCard({ property }: { property: PropertyData }) {
  const displayAddress = property.locations?.join(', ') || property.address || property.title;
  const salePriceFormatted = formatPrice(property.price || 0);
  const rentalPriceFormatted = formatPrice(property.rentalPrice || 0);

  return (
    <Link href={`/propiedades/${property.slug}`} className="block shadow rounded-lg transform transition duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md bg-white group border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="relative w-full h-48">
        <Image
          src={property.featuredImage || 'https://via.placeholder.com/400x300.png?text=Sin+Imagen'}
          alt={`Foto de ${property.title}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex-grow">
            {salePriceFormatted ? (
              <p className="text-lg font-bold text-brand-blue mb-0.5">
                {salePriceFormatted} <span className="text-xs font-normal text-gray-500">en Venta</span>
              </p>
            ) : (
              <p className="text-md font-semibold text-brand-blue mb-0.5 h-[28px] flex items-center">Consultar Venta</p>
            )}

            {rentalPriceFormatted ? (
              <p className="text-xs font-semibold text-brand-green h-[18px]">
                Desde {rentalPriceFormatted} <span className="font-normal text-gray-500">/ temp.</span>
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic h-[18px]">Alquiler no disp.</p> 
            )}

            <p className="text-brand-gray text-xs mt-2 font-medium truncate h-4" title={displayAddress}>{displayAddress}</p>
            <p className="text-gray-800 text-sm mt-1 font-semibold truncate h-5" title={property.title}>{property.title}</p>
        </div>

        <div className="flex justify-between items-center text-xs text-brand-gray border-t border-gray-100 pt-2 mt-auto">
          <div className="flex items-center gap-1" title={`${property.bedrooms || '-'} habs.`}>
            <span className="text-sm">🛏️</span> <span>{property.bedrooms || '-'}</span>
          </div>
          <div className="flex items-center gap-1" title={`${property.bathrooms || '-'} baños`}>
             <span className="text-sm">🛁</span> <span>{property.bathrooms || '-'}</span>
          </div>
          <div className="flex items-center gap-1" title={`${property.area || '-'} m²`}>
            <span className="text-sm">🏠</span> <span>{property.area ? `${property.area} m²` : '-'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}