// src/components/SearchForm.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PropertyData } from './PropertyCard';

type OperationType = 'comprar' | 'alquilar';

interface SearchFilters {
  operation?: OperationType;
  location?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  pets?: boolean;
  pool?: boolean;
}

interface SearchFormProps {
  properties: PropertyData[];
  onFilterChange: (filteredProperties: PropertyData[]) => void;
  allLocations: string[];
}

export default function SearchForm({ properties, onFilterChange, allLocations }: SearchFormProps) {
  const [operation, setOperation] = useState<OperationType>('comprar');
  const [location, setLocation] = useState('');
  const [keyword, setKeyword] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  // Estados que faltaban declarados
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState(false);
  const [pool, setPool] = useState(false);

  useEffect(() => {
    const applyFilters = () => {
      const guests = (adults || 0) + (children || 0);
      const filters: SearchFilters = {
        operation,
        location: location || undefined,
        keyword: keyword.toLowerCase() || undefined,
        minPrice: parseInt(minPrice) || undefined,
        maxPrice: parseInt(maxPrice) || undefined,
        guests: operation === 'alquilar' && guests > 0 ? guests : undefined,
        pets: operation === 'alquilar' ? pets || undefined : undefined,
        pool: operation === 'alquilar' ? pool || undefined : undefined,
      };

      const filtered = properties.filter(prop => {
        const propCustomFields = prop.customFields || {};

        if (filters.operation === 'comprar' && (!prop.price || prop.price === 0)) return false;
        if (filters.operation === 'alquilar' && (!prop.rentalPrice || prop.rentalPrice === 0)) return false;
        
        if (filters.location && !prop.locations?.includes(filters.location)) return false;

        if (filters.keyword && !(prop.title.toLowerCase().includes(filters.keyword) || (prop.address && prop.address.toLowerCase().includes(filters.keyword)) )) return false;

        const priceToCheck = filters.operation === 'comprar' ? prop.price : prop.rentalPrice;
        if (filters.minPrice && priceToCheck && priceToCheck < filters.minPrice) return false;
        if (filters.maxPrice && priceToCheck && priceToCheck > filters.maxPrice) return false;

        if (filters.operation === 'alquilar') {
          const pax = parseInt(propCustomFields['pax'] || '0');
          if (filters.guests && pax > 0 && pax < filters.guests) return false;
          if (filters.pets && propCustomFields['acepta-mascota']?.toUpperCase() !== 'SI') return false;
          const piscina = propCustomFields['piscina'] || '';
          if (filters.pool && !piscina.toLowerCase().includes('piscina')) return false;
          // Lógica de fechas (simplificada por ahora, se puede mejorar)
          // if (filters.startDate && ...) return false;
          // if (filters.endDate && ...) return false;
        }

        return true;
      });
      onFilterChange(filtered);
    };

    const handler = setTimeout(applyFilters, 300);
    return () => clearTimeout(handler);

  }, [properties, operation, location, keyword, minPrice, maxPrice, adults, children, pets, pool, startDate, endDate, onFilterChange]);


  return (
     <div className="bg-white p-4 rounded-lg shadow-sm w-full border border-gray-200">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
        {/* Fila 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Operación</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setOperation('comprar')} className={`px-3 py-1 text-xs font-bold rounded-full transition ${operation === 'comprar' ? 'bg-brand-blue text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>Comprar</button>
              <button type="button" onClick={() => setOperation('alquilar')} className={`px-3 py-1 text-xs font-bold rounded-full transition ${operation === 'alquilar' ? 'bg-brand-blue text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>Alquilar</button>
            </div>
          </div>
          <div>
            <label htmlFor="location" className="block text-xs font-medium text-gray-500 mb-1">Ubicación</label>
            <select id="location" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-brand-blue focus:border-brand-blue">
              <option value="">Todas</option>
              {allLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
        </div>
        
        {/* Fila 2 */}
        {operation === 'comprar' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
              <div className="md:col-span-2"><label htmlFor="keyword-c" className="block text-xs font-medium text-gray-500 mb-1">Palabra Clave</label><input type="text" id="keyword-c" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Ej: Pileta, vista al mar..." className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"/></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label htmlFor="minPrice-c" className="block text-xs font-medium text-gray-500 mb-1">Precio Mín.</label><input type="number" id="minPrice-c" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="100000" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"/></div>
                <div><label htmlFor="maxPrice-c" className="block text-xs font-medium text-gray-500 mb-1">Precio Máx.</label><input type="number" id="maxPrice-c" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="500000" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"/></div>
              </div>
            </div>
        )}
        
        {operation === 'alquilar' && (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2">
                    <div><label htmlFor="adults" className="block text-xs font-medium text-gray-500 mb-1">Adultos</label><input type="number" id="adults" min="1" value={adults} onChange={e => setAdults(parseInt(e.target.value))} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"/></div>
                    <div><label htmlFor="children" className="block text-xs font-medium text-gray-500 mb-1">Niños</label><input type="number" id="children" min="0" value={children} onChange={e => setChildren(parseInt(e.target.value))} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"/></div>
                </div>
                 <div className="flex items-center space-x-4 pt-4">
                    <label className="flex items-center space-x-1 cursor-pointer text-xs"><input type="checkbox" checked={pets} onChange={e => setPets(e.target.checked)} className="h-4 w-4 rounded text-brand-blue focus:ring-brand-blue"/><span>Mascotas</span></label>
                    <label className="flex items-center space-x-1 cursor-pointer text-xs"><input type="checkbox" checked={pool} onChange={e => setPool(e.target.checked)} className="h-4 w-4 rounded text-brand-blue focus:ring-brand-blue"/><span>Pileta</span></label>
                </div>
                 <div className="md:col-span-2 grid grid-cols-2 gap-2">
                    <div><label htmlFor="start-date" className="block text-xs font-medium text-gray-500 mb-1">Desde</label><input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"/></div>
                    <div><label htmlFor="end-date" className="block text-xs font-medium text-gray-500 mb-1">Hasta</label><input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"/></div>
                </div>
            </div>
        )}
      </form>
    </div>
  );
}