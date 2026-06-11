'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, MapPin, Map, ChevronDown, Facebook } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProductDisplay } from './product-card';

const CATEGORIES = [
    { id: 'dong_co_dien', label: 'XE ĐỘNG CƠ ĐIỆN' },
    { id: 'dich_vu', label: 'XE DỊCH VỤ' }
];

export default function Header({ products = [] }: { products?: ProductDisplay[] }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
    const [settings, setSettings] = useState<any>(null);
    const [serviceSettings, setServiceSettings] = useState({ booking: true, care: true, gifts: true });
    const [activeTab, setActiveTab] = useState('dong_co_dien');
    const pathname = usePathname();

    const isBlogActive = pathname.startsWith('/tin-tuc') || pathname.startsWith('/khuyen-mai') || pathname.startsWith('/blog');
    const blogLinkClass = `font-bold hover:text-blue-600 uppercase text-sm transition-colors ${isBlogActive ? 'text-blue-600' : 'text-gray-800'}`;

    const hasActiveServices = serviceSettings.booking || serviceSettings.care || serviceSettings.gifts;

    const toggleSubmenu = (menu: string) => {
        setMobileExpanded(mobileExpanded === menu ? null : menu);
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await supabase.from('site_settings').select('*').single();
                if (data) {
                    setSettings(data);
                }
            } catch (error) {
                console.error("Failed to fetch settings for header:", error);
            }

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
        fetchSettings();
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
                            <div className="flex items-center gap-6 border-b border-gray-300 pb-2 w-max ml-auto">


                                <a href={settings?.link_xe_may_dien || 'https://vinfastmekong.vn'} target='_blank' rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
                                    <Map size={16} />
                                    <span>Ôtô VinFast</span>
                                </a>

                                <a href={settings?.link_share_vi_tri || 'https://maps.app.goo.gl/f85DwodnfvtBk1YFA'} target='_blank' rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
                                    <MapPin size={16} />
                                    <span>Vị trí Showroom</span>
                                </a>

                                <div className="flex items-center gap-2">
                                    <a href={settings?.facebook_link || 'https://www.facebook.com/vinfastxanhmekong/'} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" title="Theo dõi Fanpage Vinfast Xanh Mekong" aria-label="Facebook Fanpage VinFast Xanh Mekong">
                                        <Facebook size={14} className="text-[#1877F2]" />
                                    </a>
                                    <a href={settings?.tiktok_link || 'https://www.tiktok.com/@vinfastxanhmekong'} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" title="Theo dõi TikTok Vinfast Xanh Mekong" aria-label="TikTok VinFast Xanh Mekong">
                                        <svg fill="currentColor" viewBox="0 0 448 512" width="14" height="14" className="text-black">
                                            <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25v178.72A162.55 162.55 0 1 1 185 188.31v89.89a74.62 74.62 0 1 0 52.23 71.18V0h88a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z" />
                                        </svg>
                                    </a>
                                    <a href={settings?.zalo_link || 'https://zalo.me/0899001177'} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" title="Liên hệ Zalo Vinfast Xanh Mekong" aria-label="Zalo VinFast Xanh Mekong">
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
                            <Link href="/o-to-dien" onClick={() => setIsMenuOpen(false)} className={`${getLinkClass('/o-to-dien')} flex-1 py-4 text-left`}>SẢN PHẨM</Link>
                            <button onClick={() => toggleSubmenu('products')} className="p-4 text-gray-600 focus:outline-none" aria-label="Mở rộng danh mục sản phẩm">
                                <ChevronDown size={18} className={`transform transition-transform ${mobileExpanded === 'products' ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${mobileExpanded === 'products' ? 'max-h-[1000px] pb-4' : 'max-h-0'}`}>
                            <div className="pl-4 flex flex-col gap-4">
                                {CATEGORIES.map(cat => (
                                    <div key={cat.id}>
                                        <div className="text-xs font-bold text-gray-500 mb-2 uppercase">{cat.label}</div>
                                        <div className="flex flex-col gap-3 pl-2">
                                            {products.filter(c => c.category === cat.id).map(car => (
                                                <Link key={car.id} href={`/o-to-dien/${car.slug}`} onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-gray-700 hover:text-[#1464F4]">
                                                    {car.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {hasActiveServices ? (
                        <div className="border-b border-gray-100">
                            <div className="flex items-center justify-between w-full">
                                <Link href="/dich-vu" onClick={() => setIsMenuOpen(false)} className={`${getLinkClass('/dich-vu')} flex-1 py-4 text-left`}>DỊCH VỤ</Link>
                                <button onClick={() => toggleSubmenu('services')} className="p-4 text-gray-600 focus:outline-none" aria-label="Mở rộng danh mục dịch vụ">
                                    <ChevronDown size={18} className={`transform transition-transform ${mobileExpanded === 'services' ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                            <div className={`overflow-hidden transition-all duration-300 ${mobileExpanded === 'services' ? 'max-h-64 pb-4' : 'max-h-0'}`}>
                                <div className="pl-4 flex flex-col gap-4">
                                    {serviceSettings.booking && (
                                        <Link href="/dat-lich-dich-vu" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-gray-700 hover:text-[#1464F4]">Đặt hẹn</Link>
                                    )}
                                    {serviceSettings.care && (
                                        <Link href="/cham-soc-khach-hang" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-gray-700 hover:text-[#1464F4]">Chăm sóc khách hàng</Link>
                                    )}
                                    {serviceSettings.gifts && (
                                        <Link href="/qua-tang-dich-vu" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-gray-700 hover:text-[#1464F4]">Quà tặng VinFast</Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="border-b border-gray-100">
                            <Link href="/dich-vu" onClick={() => setIsMenuOpen(false)} className={`block py-4 ${getLinkClass('/dich-vu')}`}>DỊCH VỤ</Link>
                        </div>
                    )}

                    <div className="border-b border-gray-100">
                        <div className="flex items-center justify-between w-full">
                            <button
                                onClick={() => toggleSubmenu('blog')}
                                className={`${blogLinkClass} flex-1 py-4 text-left focus:outline-none`}
                            >
                                TIN TỨC & KHUYẾN MÃI
                            </button>
                            <button onClick={() => toggleSubmenu('blog')} className="p-4 text-gray-600 focus:outline-none" aria-label="Mở rộng tin tức và khuyến mãi">
                                <ChevronDown size={18} className={`transform transition-transform ${mobileExpanded === 'blog' ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${mobileExpanded === 'blog' ? 'max-h-64 pb-4' : 'max-h-0'}`}>
                            <div className="pl-4 flex flex-col gap-4">
                                <Link href="/tin-tuc" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-gray-700 hover:text-[#1464F4]">Tin tức</Link>
                                <Link href="/khuyen-mai" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-gray-700 hover:text-[#1464F4]">Khuyến mãi</Link>
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-100">
                        <Link href="/tuyen-dung" onClick={() => setIsMenuOpen(false)} className={`block py-4 ${getLinkClass('/tuyen-dung')}`}>TUYỂN DỤNG</Link>
                    </div>

                    <div className="border-b border-gray-100">
                        <Link href="/contact" onClick={() => setIsMenuOpen(false)} className={`block py-4 ${getLinkClass('/contact')}`}>LIÊN HỆ</Link>
                    </div>

                    {/* Mobile Utilities */}
                    <div className="pt-6 pb-8 flex flex-col gap-4 text-sm text-gray-600">
                        <a href={settings?.link_gf_xanh_mekong || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-600">
                            <img src="/logo_gf.webp" alt="GF Logo" className="h-4 w-auto object-contain" />
                            <span className="text-sm text-gray-600 transition-colors">Xanh Mekong</span>
                        </a>
                        <a href={settings?.link_xe_may_dien || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600">
                            <MapPin size={16} /> Ôtô điện Vinfast
                        </a>
                        <a href={settings?.link_share_vi_tri || settings?.google_maps_link || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600">
                            <Map size={16} /> Vị trí
                        </a>
                        <div className="flex items-center gap-4 pt-2">
                            <a href={settings?.facebook_link || '#'} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full" title="Theo dõi Fanpage Vinfast Xanh Mekong" aria-label="Facebook Fanpage VinFast Xanh Mekong"><Facebook size={16} className="text-[#1877F2]" /></a>
                            <a href={settings?.tiktok_link || '#'} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full" title="Theo dõi TikTok Vinfast Xanh Mekong" aria-label="TikTok VinFast Xanh Mekong">
                                <svg fill="currentColor" viewBox="0 0 448 512" width="16" height="16" className="text-black">
                                    <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25v178.72A162.55 162.55 0 1 1 185 188.31v89.89a74.62 74.62 0 1 0 52.23 71.18V0h88a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z" />
                                </svg>
                            </a>
                            <a href={settings?.zalo_link || '#'} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full" title="Liên hệ Zalo Vinfast Xanh Mekong" aria-label="Zalo VinFast Xanh Mekong">
                                <img src="/zalo-icon.png" alt="Zalo" className="w-5 h-5 object-contain" />
                            </a>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
}
