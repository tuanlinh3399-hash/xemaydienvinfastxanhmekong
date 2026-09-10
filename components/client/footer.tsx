'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Facebook } from 'lucide-react';
import { useSiteSettings } from '@/components/client/SiteSettingsProvider';
import { useBranch } from '@/components/client/BranchProvider';
import { FALLBACK_EMAIL } from '@/lib/constants';
import { BRANCHES, DEFAULT_BRANCH_ID } from '@/lib/branches';

export default function Footer() {
    const { currentBranch, branchList, switchBranch, isMounted } = useBranch();
    const { settings } = useSiteSettings();

    // Giá trị tĩnh chuẩn mực khớp 100% với Server khi chưa mount
    const defaultBranch = BRANCHES[DEFAULT_BRANCH_ID];
    const activeBranch = isMounted ? currentBranch : defaultBranch;

    // Dữ liệu ưu tiên từ Database (SiteSettings), sau đó đến cấu hình chi nhánh
    const displayAddress = (isMounted && settings?.address) ? settings.address : activeBranch.address;
    const displayPhone = (isMounted && (settings?.hotline || settings?.phone))
        ? (settings.hotline || settings.phone!)
        : activeBranch.hotline;
    const cleanPhone = displayPhone.replace(/\s+/g, '');
    const displayEmail = (isMounted && settings?.email)
        ? settings.email
        : (activeBranch.email || FALLBACK_EMAIL);
    const displayOpeningHours = activeBranch.openingHours || '08:00 - 20:00 (Thứ 2 - Chủ Nhật)';
    const displayMapEmbed = (isMounted && settings?.google_maps_link)
        ? settings.google_maps_link
        : activeBranch.mapEmbedUrl;
    const displayZaloUrl = (isMounted && settings?.zalo_link)
        ? settings.zalo_link
        : `https://zalo.me/${cleanPhone}`;
    const DEFAULT_FACEBOOK_URL = 'https://www.facebook.com/vinfastxanhmekong/';
    const displayFacebookUrl = (isMounted && (settings?.fanpage_url || settings?.facebook_link))
        ? (settings?.fanpage_url || settings?.facebook_link!)
        : DEFAULT_FACEBOOK_URL;

    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8 border-t-4 border-vinfast-blue">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Column 1: About & Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative w-14 h-14 shrink-0">
                                <Image
                                    src="/logo-vinfast.svg"
                                    alt="VinFast Logo"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="font-black text-white text-2xl tracking-wider leading-none">VINFAST</span>
                                <div className="flex items-center mt-1">
                                    <span className="font-normal text-white text-sm tracking-widest leading-none">XANH MEKONG</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Đại lý xe máy điện VinFast chính hãng tại Cần Thơ. Chúng tôi cam kết mang đến những phương tiện di chuyển xanh, thông minh và thân thiện với môi trường, hướng tới một tương lai bền vững.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold mb-6">Liên Kết Nhanh</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link href="/products" className="hover:text-vinfast-blue transition-colors">Tất cả xe máy điện</Link></li>
                            <li><Link href="/promotions" className="hover:text-vinfast-blue transition-colors">Chương trình khuyến mãi</Link></li>
                            <li><Link href="/about" className="hover:text-vinfast-blue transition-colors">Về chúng tôi</Link></li>
                            <li><Link href="/blog" className="hover:text-vinfast-blue transition-colors">Tin tức & Sự kiện</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div className="space-y-4 lg:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <h4 className="text-lg font-bold text-white">Hệ Thống Showroom VinFast Xanh Mekong</h4>
                            {/* Branch Switcher Tabs */}
                            <div className="flex items-center gap-1.5 bg-gray-800 p-1 rounded-lg border border-gray-700">
                                {branchList.map((b) => {
                                    const isActive = isMounted ? b.id === currentBranch.id : b.id === DEFAULT_BRANCH_ID;
                                    return (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => switchBranch(b.id)}
                                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                                isActive
                                                    ? 'bg-vinfast-blue text-white shadow-sm'
                                                    : 'text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {b.shortName}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <ul className="space-y-4 text-sm text-gray-200">
                            <li className="flex items-start gap-4">
                                <MapPin className="text-vinfast-blue shrink-0 mt-0.5" size={20} />
                                <div>
                                    <span className="font-semibold text-white block mb-0.5">{activeBranch.name}:</span>
                                    <span className="leading-relaxed text-gray-300">{displayAddress}</span>
                                </div>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone className="text-vinfast-blue shrink-0" size={20} />
                                <span>
                                    Hotline:{' '}
                                    <a
                                        href={`tel:${cleanPhone}`}
                                        className="font-bold text-white hover:text-vinfast-blue transition-colors"
                                    >
                                        {displayPhone}
                                    </a>
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail className="text-vinfast-blue shrink-0" size={20} />
                                <span>
                                    Email:{' '}
                                    <a
                                        href={`mailto:${displayEmail}`}
                                        className="font-medium text-white hover:text-vinfast-blue transition-colors"
                                    >
                                        {displayEmail}
                                    </a>
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Clock className="text-vinfast-blue shrink-0" size={20} />
                                <span>Giờ mở cửa: {displayOpeningHours}</span>
                            </li>
                        </ul>
                        <div className="pt-4 flex items-center gap-4">
                            <a
                                href={displayFacebookUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition"
                                aria-label="Facebook Fanpage"
                            >
                                <Facebook size={20} fill="white" />
                            </a>
                            <a
                                href={displayZaloUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="h-10 px-4 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm hover:bg-blue-600 transition"
                            >
                                Zalo Chat ({activeBranch.shortName})
                            </a>
                        </div>
                    </div>
                </div>

                {/* Google Maps Embed theo chi nhánh (không dùng key động để tránh crash parentNode) */}
                <div className="w-full h-[250px] md:h-[350px] bg-gray-800 rounded-xl overflow-hidden mb-12 border border-gray-700">
                    <iframe
                        src={displayMapEmbed}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Bản đồ ${activeBranch.name}`}
                    ></iframe>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
                    <p>&copy; 2026 VinFast Xanh Mekong. Tất cả quyền được bảo lưu.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-white transition">Chính sách bảo mật</Link>
                        <Link href="/terms" className="hover:text-white transition">Điều khoản sử dụng</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
