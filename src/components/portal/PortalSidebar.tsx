'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/portal', label: 'Dashboard' },
  { href: '/portal/admin', label: 'Admin' },
  { href: '/portal/admin/employees', label: 'Employees' },
  { href: '/portal/admin/clients', label: 'Clients' },
  { href: '/portal/admin/work', label: 'Work Logs' },
];

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className='w-64 bg-gray-800 text-white p-4'>
      <nav>
        <ul>
          {navLinks.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block p-2 rounded ${pathname === link.href ? 'bg-gray-700' : ''
                  }`}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
