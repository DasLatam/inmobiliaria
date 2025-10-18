// src/app/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropertyCard, { PropertyData } from '@/components/PropertyCard';
import SearchForm from '@/components/SearchForm';
// Asegúrate que la ruta al JSON sea correcta
import propertiesData from '@/data/properties.json'; 

export default function HomePage() {
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);
  const [displayCount, setDisplayCount] = useState(12);
  const loaderRef = useRef(null);
  const hasMoreRef = useRef(true);

  // Procesa los datos crudos del JSON una sola vez
  const allProperties = useMemo(() => {
    return (propertiesData as any[]).map((prop): PropertyData => {
       let customFields: { [key: string]: any } = {}; // Definir tipo explícito aquí
       try {
           if (typeof prop.customFields === 'string') {
               customFields = JSON.parse(prop.customFields || '{}');
           } else if (typeof prop.customFields === 'object' && prop.customFields !== null) {
               customFields = prop.customFields;
           }
       } catch (e) { console.error(`Error parsing customFields for prop ID ${prop.id}:`, e); }

      const rentalPriceKeys = ['diciembre-2da-quincena', 'navidad', 'ano-nuevo', 'enero-1ra-quincena', 'enero-2da-quincena', 'febrero-1ra-quincena', 'febrero-2da-quincena'];
      const rentalPrices: number[] = rentalPriceKeys
        .map(key => parseInt(((customFields[key] || '') as string).replace(/[^0-9]/g, '')))
        .filter(price => !isNaN(price) && price > 0);
      const minRentalPrice = rentalPrices.length > 0 ? Math.min(...rentalPrices) : undefined;
      
      const cleanLocations = Array.isArray(prop.locations) ? 
          prop.locations.filter((loc: string) => loc && !loc.startsWith('X5') && !loc.startsWith('X6') && loc !== 'Argentina' && !loc.includes('Provincia de')) 
          : [];

      return {
        id: prop.id,
        title: prop.title,
        slug: prop.slug,
        featuredImage: prop.featuredImage || undefined,
        price: parseInt(prop.price || '0') || undefined,
        rentalPrice: minRentalPrice,
        // Usar la clave correcta para acceder a customFields
        address: prop.address || customFields['address'] || prop.title,
        bedrooms: parseInt(prop.bedrooms || customFields['bedrooms'] || '0') || undefined,
        bathrooms: parseInt(prop.bathrooms || customFields['bathrooms'] || '0') || undefined,
        area: parseInt(prop.area || customFields['area'] || '0') || undefined,
        customFields: customFields, 
        locations: cleanLocations, 
      };
    });
  }, []);

  const allLocations = useMemo(() => {
     const locationsSet = new Set<string>();
     allProperties.forEach(prop => {
         prop.locations?.forEach(loc => locationsSet.add(loc));
     });
     return Array.from(locationsSet).sort();
  }, [allProperties]);

  useEffect(() => {
    setFilteredProperties(allProperties);
  }, [allProperties]);

  // Maneja el scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current) {
          setDisplayCount(prev => prev + 12);
        }
      },
      { rootMargin: "400px" } 
    );
    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => { if (currentLoader) observer.unobserve(currentLoader); };
  }, []); 
  
   useEffect(() => {
     hasMoreRef.current = displayCount < filteredProperties.length;
   }, [displayCount, filteredProperties.length]);

  useEffect(() => {
    setDisplayCount(12); 
  }, [filteredProperties]);

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="mb-8 sticky top-[88px] z-10 bg-gray-50 py-4">
          <SearchForm 
              properties={allProperties} 
              onFilterChange={setFilteredProperties} 
              allLocations={allLocations} 
          />
      </div>

      <h2 className="text-xl font-semibold mb-6 text-brand-gray">
        {filteredProperties.length} {filteredProperties.length === 1 ? 'Propiedad encontrada' : 'Propiedades encontradas'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-16">
        {filteredProperties.slice(0, displayCount).map((prop) => (
          <PropertyCard key={prop.id} property={prop} />
        ))}
      </div>

      <div ref={loaderRef} className="h-10"></div>

      {displayCount >= filteredProperties.length && filteredProperties.length > 0 && (
         <p className="text-center text-gray-500 text-sm pb-16">Has llegado al final de la lista.</p>
      )}

      {filteredProperties.length === 0 && (
        <p className="text-center text-gray-500 py-16">No se encontraron propiedades que coincidan con tu búsqueda.</p>
      )}
    </div>
  );
}