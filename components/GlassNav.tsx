'use client';

import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
];

export default function GlassNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full px-8 py-3 flex items-center gap-8 transition-all duration-500 ${
        scrolled
          ? 'glass-nav shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <a href="#" className="font-bold text-slate-800 text-lg tracking-tight hover:opacity-70 transition-opacity">
        M.
      </a>

      <div className="hidden sm:flex items-center gap-6">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-slate-600 hover:text-slate-900 font-medium text-sm tracking-wide transition-colors duration-300"
          >
            {link.label}
          </a>
        ))}
      </div>

      <a
        href="#contact"
        className="ml-2 px-5 py-2 bg-slate-800 text-white rounded-full text-sm font-medium hover:bg-slate-700 transition-colors duration-300 shadow-sm"
      >
        Say Hello
      </a>
    </nav>
  );
}
