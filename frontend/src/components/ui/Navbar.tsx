'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const navLinks = [
        { href: '/products', label: 'Products' },
        { href: '/locations', label: 'Locations' },
        { href: '/inventory', label: 'Inventory' },
    ];

    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo / Brand */}
                    <div className="flex items-center gap-8">
                        <span className="text-lg font-bold text-gray-900">📦 Inventory</span>
                        <nav className="flex gap-1">
                            {navLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        pathname === link.href
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* User info + logout */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            {user.firstName} {user.lastName}
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {user.role}
                            </span>
                        </span>
                        <button
                            onClick={logout}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}