'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    // Helper kiểm tra active
    const isActive = (path: string) => {
        if (path === '/products') {
            // Đối với SẢN PHẨM: active nếu ở chính nó hoặc các trang chi tiết /products/...
            return pathname.startsWith('/products');
        }
        return pathname === path;
    };

    // Class helper
    const getLinkClass = (path: string, baseClass: string = '') => {
        const activeClass = 'text-[#00338D] font-bold underline underline-offset-4';
        const inactiveClass = 'text-black font-semibold hover:text-[#00338D]';
        return `${baseClass} transition-all duration-300 whitespace-nowrap ${isActive(path) ? activeClass : inactiveClass}`;
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-vinfast-gray bg-vinfast-white">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-3 shrink-0">
                    <div className="relative h-4 w-10 md:h-12 md:w-12 shrink-0">
                        <Image
                            src="/logo-vinfast.svg"
                            alt="VinFast Logo"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="font-black text-black text-xl md:text-2xl tracking-wider leading-none">VINFAST</span>
                        <span className="font-normal text-black text-[10px] md:text-sm tracking-widest leading-none mt-1">XANH MEKONG</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex lg:gap-4 xl:gap-8 text-[15px] uppercase">
                    <Link href="/products" className={getLinkClass('/products')}>Sản Phẩm</Link>

                    <Link href="/about" className={getLinkClass('/about')}>Giới Thiệu</Link>
                    <Link href="/blog" className={getLinkClass('/blog')}>Tin Tức</Link>
                    <Link href="/contact" className={getLinkClass('/contact')}>Liên Hệ</Link>
                </nav>

                {/* Mobile Hamburger Menu Toggle */}
                <button
                    className="lg:hidden p-2 text-black"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-20 left-0 w-full bg-vinfast-white border-b border-vinfast-gray shadow-lg">
                    <nav className="flex flex-col py-6 px-8 space-y-6 text-lg uppercase">
                        <Link href="/products" onClick={() => setIsMenuOpen(false)} className={`${getLinkClass('/products')} border-b border-gray-100 pb-2`}>Sản Phẩm</Link>

                        <Link href="/about" onClick={() => setIsMenuOpen(false)} className={`${getLinkClass('/about')} border-b border-gray-100 pb-2`}>Giới Thiệu</Link>
                        <Link href="/blog" onClick={() => setIsMenuOpen(false)} className={`${getLinkClass('/blog')} border-b border-gray-100 pb-2`}>Tin Tức</Link>
                        <Link href="/contact" onClick={() => setIsMenuOpen(false)} className={`${getLinkClass('/contact')} border-b border-gray-100 pb-2`}>Liên Hệ</Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
