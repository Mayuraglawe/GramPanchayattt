/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Track Status', href: '/track-status' },
    { name: 'Grievances', href: '/complaints' },
    { name: 'Certificates', href: '/certificates' },
    { name: 'Asset Booking', href: '/assets' },
    { name: 'Govt Schemes', href: '/schemes' },
    { name: 'Feedback', href: '/feedback' },
    { name: 'Quick Pay', href: '/payments' },
    { name: 'Village Map', href: '/village-map' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-md sticky top-0 z-[100] transition-all w-full">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Left: Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group text-left">
            <img
              alt="Gram Panchayat Emblem"
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain transition-transform group-hover:scale-105"
              src="/emblem.png"
            />
            <div className="flex flex-col text-left leading-tight">
              <span className="text-base sm:text-lg font-black text-[#004d1a] tracking-tight">ग्रामपंचायत</span>
              <span className="text-base sm:text-lg font-black text-[#004d1a] tracking-tight">डिजिटल पोर्टल</span>
            </div>
          </Link>

          {/* Desktop Navigation Links - Shifted Leftwards */}
          <nav className="hidden lg:flex items-center flex-1 justify-start ml-3 xl:ml-6 gap-1 lg:gap-1.5 xl:gap-3 text-xs xl:text-sm font-bold whitespace-nowrap py-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-1 px-1.5 xl:px-2.5 rounded-md ${
                    active
                      ? 'text-[#004d1a] font-bold underline underline-offset-4 decoration-2 decoration-[#004d1a] bg-green-50/70'
                      : 'text-gray-700 hover:text-[#004d1a] hover:bg-gray-100/70'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Search / Track Status Button + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            <Link
              href="/track-status"
              className="bg-[#004d1a] hover:bg-[#003813] text-white font-bold text-xs sm:text-sm xl:text-base py-2 px-3.5 sm:px-5 rounded-md transition-colors shadow-sm flex items-center gap-1.5 sm:gap-2"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">search</span>
              <span className="inline">Search</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-[#004d1a] hover:bg-gray-100 transition-colors focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-3 space-y-1 bg-white">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-md font-bold text-sm sm:text-base transition-colors ${
                    active
                      ? 'bg-[#004d1a]/10 text-[#004d1a]'
                      : 'text-gray-800 hover:bg-gray-50 hover:text-[#004d1a]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
