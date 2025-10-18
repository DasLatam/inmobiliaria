// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

const repoName = 'inmobiliaria'; 
const basePath = process.env.NODE_ENV === 'production' ? `/${repoName}` : '';

export const metadata: Metadata = {
  title: "MCV Vidal Propiedades",
  description: "Inmobiliaria en Zona Sur y Costa Esmeralda",
  icons: {
    icon: `${basePath}/favico_blanco.png`,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 flex flex-col min-h-screen`}>
        <header className="container mx-auto px-4 py-4 sticky top-0 bg-white z-20 shadow-sm border-b border-gray-100">
           <div className="flex items-center justify-between">
                <Link href="/" aria-label="Página de inicio">
                    <Image src={`${basePath}/Logo_MCV.png`} alt="Logo MCV Vidal Propiedades" width={160} height={70} priority />
                </Link>
                {/* Espacio para futuro menú o botones */}
                <div></div> 
           </div>
        </header>
        
        <div className="flex-grow">
            {children}
        </div>

         <footer className="bg-gray-800 text-gray-300 text-center py-4 mt-12 text-xs">
            © {new Date().getFullYear()} MCV Vidal Propiedades. Todos los derechos reservados.
        </footer>
      </body>
    </html>
  );
}