'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/llm/course10/dashboard', label: 'Dashboard' },
  { href: '/llm/course10/kalender', label: 'Kalender' },
  { href: '/llm/course10/bryllupper', label: 'Bryllupper' },
];

export default function Sidebar({ admin = false }: { admin?: boolean }) {
  const pathname = usePathname();
  const adminActive =
    pathname === '/llm/course10/admin' ||
    pathname?.startsWith('/llm/course10/admin/') === true;
  return (
    <aside className="md:w-60 md:shrink-0 border-b md:border-b-0 md:border-r border-[#dad3c4] bg-[#efe8d8]/40 md:bg-[#efe8d8]/30">
      <div className="md:sticky md:top-0 md:h-screen flex md:flex-col">
        <div className="hidden md:block px-6 py-6 border-b border-[#dad3c4]/70">
          <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#75695b]">
            Koordinator
          </p>
          <p className="display text-lg text-[#2a2723] mt-1">Lise Egeskov</p>
          <p className="text-xs text-[#75695b] mt-0.5">og Johan Jensen</p>
        </div>
        <nav className="flex-1 px-3 md:px-4 py-3 md:py-6">
          <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname?.startsWith(item.href + '/') ?? false);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-2 rounded-md text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[#3d4a3a] text-[#f7f3ec] font-medium'
                        : 'text-[#2a2723] hover:bg-[#dad3c4]/40'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="hidden md:block px-4 py-3 border-t border-[#dad3c4]/70">
          <Link
            href="/llm/course10/admin"
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
              adminActive
                ? 'bg-[#3d4a3a] text-[#f7f3ec] font-medium'
                : 'text-[#2a2723] hover:bg-[#dad3c4]/40'
            }`}
          >
            {admin ? (
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#3d4a3a]"
                aria-hidden
                style={{ backgroundColor: adminActive ? '#f7f3ec' : '#3d4a3a' }}
              />
            ) : null}
            Admin
            {admin ? null : (
              <span className="ml-auto text-[10px] text-[#a89b87]">
                ikke logget ind
              </span>
            )}
          </Link>
        </div>
        <div className="hidden md:block px-6 py-5 border-t border-[#dad3c4]/70">
          <Link
            href="/llm"
            className="text-xs text-[#75695b] hover:text-[#2a2723] transition-colors"
          >
            ← Tilbage til marcuspff.com
          </Link>
        </div>
      </div>
    </aside>
  );
}
