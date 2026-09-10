'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, MapPin, Map, Phone, Facebook } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProductDisplay } from './product-card';
import { useBranch } from '@/components/client/BranchProvider';
import { useSiteSettings } from '@/components/client/SiteSettingsProvider';
import { BRANCHES, DEFAULT_BRANCH_ID } from '@/lib/branches';

const DEFAULT_OTO_URL = 'https://vinfastmekong.vn';
const DEFAULT_FACEBOOK_URL = 'https://www.facebook.com/vinfastxanhmekong/';
const DEFAULT_TIKTOK_URL = 'https://www.tiktok.com/@vinfastxanhmekong';

export default function Header({ products = [] }: { products?: ProductDisplay[] }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [serviceSettings, setServiceSettings] = useState({ booking: true, care: true, gifts: true });
    const pathname = usePathname();

    const { currentBranch, branchId, branchList, switchBranch, isMounted } = useBranch();
    const { settings } = useSiteSettings();

    // Giá trị tĩnh chuẩn mực khớp 100% với Server khi chưa mount
    const defaultBranch = BRANCHES[DEFAULT_BRANCH_ID];
    const activeBranch = isMounted ? currentBranch : defaultBranch;
    const activeBranchId = isMounted ? branchId : DEFAULT_BRANCH_ID;

    // Dữ liệu ưu tiên từ Database (SiteSettings), fallback về chi nhánh tĩnh
    const displayPhone = (isMounted && (settings?.hotline || settings?.phone))
        ? (settings.hotline || settings.phone!)
        : activeBranch.hotline;
    const cleanPhone = displayPhone.replace(/\s+/g, '');
    const displayMapUrl = (isMounted && (settings?.map_url || activeBranch.mapShareUrl))
        ? (settings?.map_url || activeBranch.mapShareUrl)
        : defaultBranch.mapShareUrl;
    const displayZaloUrl = (isMounted && settings?.zalo_link)
        ? settings.zalo_link
        : `https://zalo.me/${cleanPhone}`;
    const displayOtoUrl = settings?.link_xe_may_dien || DEFAULT_OTO_URL;
    const displayFbUrl = (isMounted && (settings?.fanpage_url || settings?.facebook_link))
        ? (settings?.fanpage_url || settings?.facebook_link!)
        : DEFAULT_FACEBOOK_URL;
    const displayTiktokUrl = settings?.tiktok_link || DEFAULT_TIKTOK_URL;

    useEffect(() => {
        const fetchServiceSettings = async () => {
            try {
                const { data: servicesData } = await supabase
                    .from('service_settings')
                    .select('service_type, is_active');
                if (servicesData) {
                    const settingsMap = { booking: true, care: true, gifts: true };
                    servicesData.forEach((item: any) => {
                        if (item.service_type === 'booking') settingsMap.booking = item.is_active !== false;
                        if (item.service_type === 'care') settingsMap.care = item.is_active !== false;
                        if (item.service_type === 'gifts') settingsMap.gifts = item.is_active !== false;
                    });
                    setServiceSettings(settingsMap);
                }
            } catch (error) {
                console.error("Failed to fetch service settings for header:", error);
            }
        };

        fetchServiceSettings();
    }, []);

    const isActive = (path: string) => {
        if (path === '/o-to-dien') {
            return pathname.startsWith('/o-to-dien');
        }
        return pathname === path;
    };

    const getLinkClass = (path: string, baseClass: string = '') => {
        const activeClass = 'text-blue-600';
        const inactiveClass = 'text-gray-800';
        return `${baseClass} font-bold hover:text-blue-600 uppercase text-sm transition-colors ${isActive(path) ? activeClass : inactiveClass}`;
    };

    return (
        <header className="sticky top-0 z-50 w-full">
            <div className="relative z-20 w-full bg-white border-b border-gray-300 shadow-sm">
                <div className="flex justify-between items-center px-4 py-3 lg:px-8 lg:py-2 max-w-7xl mx-auto h-full">
                    {/* Left Section (Logo) */}
                    <Link href="/" className="flex items-center gap-3 shrink-0 h-full py-2">
                        <div className="relative h-10 w-10 md:h-12 md:w-12 shrink-0">
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

                    {/* Right Section (Wrapper) */}
                    <div className="hidden lg:flex flex-col flex-grow justify-center pl-8">
                        {/* Top Row (Utilities) */}
                        <div className="w-full">
                            <div className="flex items-center gap-5 border-b border-gray-300 pb-2 w-max ml-auto">
                                {/* Branch Selector */}
                                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs text-vinfast-blue">
                                    <MapPin size={13} className="text-vinfast-blue shrink-0" />
                                    <span className="text-gray-500 font-normal">Chi nhánh:</span>
                                    <select
                                        value={activeBranchId}
                                        onChange={(e) => switchBranch(e.target.value)}
                                        className="bg-transparent font-bold text-vinfast-blue cursor-pointer outline-none border-none py-0"
                                        aria-label="Chọn chi nhánh VinFast Xanh Mekong"
                                    >
                                        {branchList.map((b) => (
                                            <option key={b.id} value={b.id} className="text-gray-800">
                                                {b.shortName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Hotline theo chi nhánh */}
                                <a
                                    href={`tel:${cleanPhone}`}
                                    className="flex items-center gap-1.5 text-sm font-bold text-vinfast-blue hover:text-blue-800 transition-colors"
                                    title={`Gọi Hotline ${activeBranch.name}: ${displayPhone}`}
                                >
                                    <Phone size={15} />
                                    <span>Hotline: {displayPhone}</span>
                                </a>

                                <a href={displayOtoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
                                    <Map size={16} />
                                    <span>Ôtô VinFast</span>
                                </a>

                                <a
                                    href={displayMapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600"
                                    title={`Bản đồ ${activeBranch.name}: ${activeBranch.address}`}
                                >
                                    <MapPin size={16} />
                                    <span>Vị trí Showroom</span>
                                </a>

                                <div className="flex items-center gap-2">
                                    <a href={displayFbUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" title="Theo dõi Fanpage Vinfast Xanh Mekong" aria-label="Facebook Fanpage VinFast Xanh Mekong">
                                        <Facebook size={14} className="text-[#1877F2]" />
                                    </a>
                                    <a href={displayTiktokUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" title="Theo dõi TikTok Vinfast Xanh Mekong" aria-label="TikTok VinFast Xanh Mekong">
                                        <svg fill="currentColor" viewBox="0 0 448 512" width="14" height="14" className="text-black">
                                            <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25v178.72A162.55 162.55 0 1 1 185 188.31v89.89a74.62 74.62 0 1 0 52.23 71.18V0h88a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z" />
                                        </svg>
                                    </a>
                                    <a href={displayZaloUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" title="Liên hệ Zalo Vinfast Xanh Mekong" aria-label="Zalo VinFast Xanh Mekong">
                                        <img src="/zalo-icon.png" alt="Zalo" className="w-5 h-5 object-contain" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row (Main Navigation) */}
                        <nav className="flex justify-end items-center gap-8 pt-3">
                            <Link href="/" className={`${getLinkClass('/')} pb-3`}>TRANG CHỦ</Link>
                            <Link href="/products" className={`${getLinkClass('/products')} pb-3`}>Sản Phẩm</Link>
                            <Link href="/about" className={`${getLinkClass('/about')} pb-3`}>Giới Thiệu</Link>
                            <Link href="/blog" className={`${getLinkClass('/blog')} pb-3`}>Tin Tức</Link>
                            <Link href="/contact" className={`${getLinkClass('/contact')} pb-3`}>Liên Hệ</Link>
                        </nav>
                    </div>

                    {/* Mobile Hamburger Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-black"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? "Đóng menu navigation" : "Mở menu navigation"}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`lg:hidden absolute top-full left-0 w-full bg-white border-b-4 border-[#1464F4] shadow-xl transform transition-transform duration-300 ease-in-out z-10 max-h-[calc(100vh-60px)] overflow-y-auto ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                <nav className="flex flex-col py-2 px-6">
                    <div className="border-b border-gray-100">
                        <Link href="/" onClick={() => setIsMenuOpen(false)} className={`block py-4 ${getLinkClass('/')}`}>TRANG CHỦ</Link>
                    </div>

                    <div className="border-b border-gray-100">
                        <div className="flex items-center justify-between w-full">
                            <Link href="/products" onClick={() => setIsMenuOpen(false)} className={`${getLinkClass('/products')} flex-1 py-4 text-left`}>SẢN PHẨM</Link>
                        </div>
                    </div>
                    <div className="border-b border-gray-100">
                        <div className="flex items-center justify-between w-full">
                            <Link href="/about" onClick={() => setIsMenuOpen(false)} className={`${getLinkClass('/about')} flex-1 py-4 text-left`}>GIỚI THIỆU</Link>
                        </div>
                    </div>
                    <div className="border-b border-gray-100">
                        <div className="flex items-center justify-between w-full">
                            <Link href="/blog" onClick={() => setIsMenuOpen(false)} className={`${getLinkClass('/blog')} flex-1 py-4 text-left`}>TIN TỨC</Link>
                        </div>
                    </div>
                    <div className="border-b border-gray-100">
                        <Link href="/contact" onClick={() => setIsMenuOpen(false)} className={`block py-4 ${getLinkClass('/contact')}`}>LIÊN HỆ</Link>
                    </div>

                    {/* Mobile Utilities */}
                    <div className="pt-4 pb-8 flex flex-col gap-3.5 text-sm text-gray-600">
                        {/* Mobile Branch Selector */}
                        <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200 p-2.5 rounded-xl">
                            <div className="flex items-center gap-2 text-vinfast-blue font-semibold text-xs">
                                <MapPin size={15} />
                                <span>Chi nhánh:</span>
                            </div>
                            <select
                                value={activeBranchId}
                                onChange={(e) => {
                                    switchBranch(e.target.value);
                                    setIsMenuOpen(false);
                                }}
                                className="bg-white border border-blue-200 font-bold text-vinfast-blue text-xs rounded-lg px-2.5 py-1 cursor-pointer outline-none"
                            >
                                {branchList.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.shortName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <a href={`tel:${cleanPhone}`} className="flex items-center gap-2 font-bold text-vinfast-blue hover:text-blue-800">
                            <Phone size={16} /> Hotline: {displayPhone}
                        </a>
                        <a href={displayMapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600">
                            <MapPin size={16} /> Vị trí: {activeBranch.name}
                        </a>
                        <a href={displayOtoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600">
                            <Map size={16} /> Ôtô điện Vinfast
                        </a>
                        <div className="flex items-center gap-4 pt-2">
                            <a href={displayFbUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full" title="Theo dõi Fanpage Vinfast Xanh Mekong" aria-label="Facebook Fanpage VinFast Xanh Mekong"><Facebook size={16} className="text-[#1877F2]" /></a>
                            <a href={displayTiktokUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full" title="Theo dõi TikTok Vinfast Xanh Mekong" aria-label="TikTok VinFast Xanh Mekong">
                                <svg fill="currentColor" viewBox="0 0 448 512" width="16" height="16" className="text-black">
                                    <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25v178.72A162.55 162.55 0 1 1 185 188.31v89.89a74.62 74.62 0 1 0 52.23 71.18V0h88a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z" />
                                </svg>
                            </a>
                            <a href={displayZaloUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full" title="Liên hệ Zalo Vinfast Xanh Mekong" aria-label="Zalo VinFast Xanh Mekong">
                                <img src="/zalo-icon.png" alt="Zalo" className="w-5 h-5 object-contain" />
                            </a>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
}
