'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import Image from 'next/image';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image 
            src="/logo.svg" 
            alt="CETify Logo" 
            width={130} 
            height={36} 
            className="object-contain max-h-[36px]"
            priority 
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'text-[#4338ca] border-b-2 border-[#4338ca] pb-0.5'
                  : 'text-gray-600 hover:text-[#4338ca]'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Upload CTA */}
        <Link
          href="/"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-[#4338ca] text-white text-sm font-semibold rounded-lg hover:bg-[#3730a3] transition-colors"
        >
          Upload Sheet
        </Link>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-600"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-3 text-sm font-medium border-b border-gray-50 ${
                pathname === l.href ? 'text-[#4338ca]' : 'text-gray-600'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block mt-3 text-center px-5 py-2.5 bg-[#4338ca] text-white text-sm font-semibold rounded-lg"
          >
            Upload Sheet
          </Link>
        </div>
      )}
    </header>
  );
}
