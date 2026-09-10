'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Info, Globe, MapPin, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FALLBACK_EMAIL } from '@/lib/constants';
import { BRANCH_LIST, DEFAULT_BRANCH_ID } from '@/lib/branches';
import { getSettings, updateSettings } from '@/app/actions/settings';

interface BranchOption {
    id: string;
    name: string;
    shortName: string;
    isDefault?: boolean;
}

const BRANCH_OPTIONS: BranchOption[] = [
    { id: 'hung-phu', name: 'Hưng Phú (Mặc định)', shortName: 'Hưng Phú', isDefault: true },
    { id: 'binh-thuy', name: 'Bình Thủy', shortName: 'Bình Thủy' }
];

export default function SiteSettings() {
    const router = useRouter();
    const [selectedBranch, setSelectedBranch] = useState<string>(DEFAULT_BRANCH_ID);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string; needMigration?: boolean }>({ type: '', text: '' });

    const [formData, setFormData] = useState({
        phone: '',
        email: '',
        address: '',
        google_maps_link: '',
        map_url: '',
        fanpage_url: ''
    });

    useEffect(() => {
        loadBranchSettings(selectedBranch);
    }, [selectedBranch]);

    const loadBranchSettings = async (branchSlug: string) => {
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Sử dụng Server Action getSettings để lấy dữ liệu đồng bộ
            const data = await getSettings(branchSlug);
            setFormData({
                phone: data.phone || '',
                email: data.email || '',
                address: data.address || '',
                google_maps_link: data.google_maps_link || '',
                map_url: data.map_url || '',
                fanpage_url: data.fanpage_url || ''
            });
        } catch (error) {
            console.error(`Lỗi tải dữ liệu cho chi nhánh ${branchSlug}:`, error);
            setMessage({ type: 'error', text: 'Không thể tải cấu hình của chi nhánh này.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Trích xuất URL sạch nếu người dùng dán cả mã <iframe> từ Google Maps
            let cleanMapUrl = formData.google_maps_link?.trim();
            if (cleanMapUrl && cleanMapUrl.includes('<iframe')) {
                const srcMatch = cleanMapUrl.match(/src="([^"]+)"/i);
                if (srcMatch && srcMatch[1]) {
                    cleanMapUrl = srcMatch[1];
                }
            }

            setFormData(prev => ({ ...prev, google_maps_link: cleanMapUrl }));

            // Gọi Server Action updateSettings theo selectedBranch
            const result = await updateSettings(selectedBranch, {
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                google_maps_link: cleanMapUrl,
                map_url: formData.map_url,
                fanpage_url: formData.fanpage_url
            });

            if (result.success) {
                const branchName = BRANCH_OPTIONS.find(b => b.id === selectedBranch)?.name || selectedBranch;
                setMessage({
                    type: 'success',
                    text: `Đã cập nhật thành công cấu hình cho ${branchName}!`
                });
                router.refresh();
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'Cập nhật thất bại.',
                    needMigration: result.needMigration
                });
            }
        } catch (error: any) {
            console.error('Lỗi khi lưu settings:', error);
            setMessage({ type: 'error', text: error?.message || 'Đã xảy ra lỗi khi lưu cấu hình.' });
        } finally {
            setIsSaving(false);
        }
    };

    const currentBranchInfo = BRANCH_OPTIONS.find(b => b.id === selectedBranch);

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-xl border border-gray-100">
            {/* Header Card */}
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg leading-6 font-bold text-gray-900 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-vinfast-blue" />
                            Thông Tin Website & Đa Chi Nhánh
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Quản lý thông số hiển thị (Hotline, Email, Địa chỉ, Google Maps) riêng biệt cho từng cơ sở.
                        </p>
                    </div>

                    {/* Tag trạng thái chi nhánh đang chọn */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-vinfast-blue border border-blue-200 text-xs font-semibold w-max">
                        <Building2 size={15} />
                        <span>Đang sửa: {currentBranchInfo?.name}</span>
                    </div>
                </div>
            </div>

            {/* TAB CHỌN CHI NHÁNH */}
            <div className="px-6 pt-5 pb-2 bg-gray-50/70 border-b border-gray-200">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5">
                    Chọn cơ sở cần cấu hình:
                </label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    {BRANCH_OPTIONS.map((branch) => {
                        const isSelected = branch.id === selectedBranch;
                        return (
                            <button
                                key={branch.id}
                                type="button"
                                onClick={() => {
                                    if (selectedBranch !== branch.id) {
                                        setSelectedBranch(branch.id);
                                    }
                                }}
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm
                                    ${isSelected
                                        ? 'bg-vinfast-blue text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-600 ring-offset-1'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                                    }
                                `}
                            >
                                <MapPin size={16} className={isSelected ? 'text-white' : 'text-vinfast-blue'} />
                                <span>{branch.name}</span>
                                {branch.isDefault && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-extrabold ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
                                        Mặc định
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Thông báo Alert */}
            {message.text && (
                <div className={`m-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            {message.type === 'success' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                        </div>
                        <div className="flex-1 text-sm">
                            <p className="font-semibold">{message.text}</p>
                            {message.needMigration && (
                                <div className="mt-2 text-xs bg-white/80 p-3 rounded-lg border border-red-200 text-gray-700 space-y-1">
                                    <p className="font-bold text-red-700">Hướng dẫn kích hoạt lưu đa chi nhánh trên Supabase:</p>
                                    <p>1. Mở Supabase Dashboard ➔ Chọn Project ➔ Vào mục <strong>SQL Editor</strong>.</p>
                                    <p>2. Mở file <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-red-600">supabase_migration_multi_branch_settings.sql</code> trong thư mục dự án.</p>
                                    <p>3. Dán đoạn mã SQL vào và bấm <strong>Run</strong> để hoàn tất.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Form nội dung */}
            {isLoading ? (
                <div className="flex flex-col justify-center items-center h-64 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-vinfast-blue" />
                    <p className="text-sm text-gray-500 font-medium">Đang tải thông tin chi nhánh {currentBranchInfo?.shortName}...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">
                                Số Điện Thoại Hotline / Zalo ({currentBranchInfo?.shortName}) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="phone"
                                id="phone"
                                required
                                placeholder="VD: 0899 00 11 77"
                                value={formData.phone}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-2 focus:ring-vinfast-blue focus:border-vinfast-blue block w-full sm:text-sm border-gray-300 rounded-xl py-2.5 px-3.5 border outline-none transition-all"
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                                Email Tiếp Nhận ({currentBranchInfo?.shortName})
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder={`VD: ${FALLBACK_EMAIL}`}
                                value={formData.email}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-2 focus:ring-vinfast-blue focus:border-vinfast-blue block w-full sm:text-sm border-gray-300 rounded-xl py-2.5 px-3.5 border outline-none transition-all"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-1">
                                Địa Chỉ Showroom ({currentBranchInfo?.shortName}) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="address"
                                id="address"
                                required
                                placeholder="VD: Đường Cách Mạng Tháng 8, P. Bùi Hữu Nghĩa..."
                                value={formData.address}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-2 focus:ring-vinfast-blue focus:border-vinfast-blue block w-full sm:text-sm border-gray-300 rounded-xl py-2.5 px-3.5 border outline-none transition-all"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="map_url" className="block text-sm font-semibold text-gray-700 mb-1">
                                Link chỉ đường (Header) ({currentBranchInfo?.shortName})
                            </label>
                            <input
                                type="url"
                                name="map_url"
                                id="map_url"
                                placeholder="VD: https://maps.app.goo.gl/..."
                                value={formData.map_url}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-2 focus:ring-vinfast-blue focus:border-vinfast-blue block w-full sm:text-sm border-gray-300 rounded-xl py-2.5 px-3.5 border outline-none transition-all"
                            />
                            <p className="mt-1.5 text-xs text-gray-500">
                                Đường liên kết Google Maps rút gọn (ví dụ: <code className="bg-gray-100 px-1 py-0.5 rounded font-bold">https://maps.app.goo.gl/...</code>) dùng cho nút &quot;Vị trí Showroom&quot; trên Header để người dùng mở ứng dụng bản đồ chỉ đường.
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="fanpage_url" className="block text-sm font-semibold text-gray-700 mb-1">
                                Link Facebook Fanpage ({currentBranchInfo?.shortName})
                            </label>
                            <input
                                type="url"
                                name="fanpage_url"
                                id="fanpage_url"
                                placeholder="VD: https://www.facebook.com/vinfastxanhmekong/..."
                                value={formData.fanpage_url}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-2 focus:ring-vinfast-blue focus:border-vinfast-blue block w-full sm:text-sm border-gray-300 rounded-xl py-2.5 px-3.5 border outline-none transition-all"
                            />
                            <p className="mt-1.5 text-xs text-gray-500">
                                Đường link Facebook Fanpage riêng biệt cho từng cơ sở (nếu để trống, hệ thống sẽ sử dụng Fanpage mặc định của hệ thống).
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="google_maps_link" className="block text-sm font-semibold text-gray-700 mb-1">
                                Mã Nhúng / Link Google Maps Iframe ({currentBranchInfo?.shortName})
                            </label>
                            <textarea
                                name="google_maps_link"
                                id="google_maps_link"
                                rows={3}
                                placeholder="Dán link src hoặc toàn bộ thẻ <iframe src='https://www.google.com/maps/embed?...' />"
                                value={formData.google_maps_link}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-2 focus:ring-vinfast-blue focus:border-vinfast-blue block w-full sm:text-sm border-gray-300 rounded-xl py-2.5 px-3.5 border outline-none font-mono text-xs transition-all"
                            />
                            <p className="mt-1.5 text-xs text-gray-500">
                                Hệ thống sẽ tự động lọc lấy link <code className="bg-gray-100 px-1 py-0.5 rounded font-bold">src="..."</code> nếu bạn dán toàn bộ đoạn mã Iframe từ Google Maps.
                            </p>
                        </div>

                        {/* Live Preview Iframe */}
                        {formData.google_maps_link && (
                            <div className="sm:col-span-2 border border-gray-200 rounded-xl overflow-hidden p-3 bg-gray-50">
                                <span className="block text-xs font-bold text-gray-600 mb-2">Xem trước bản đồ nhúng:</span>
                                <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-300 bg-white">
                                    <iframe
                                        src={formData.google_maps_link.includes('<iframe') ? (formData.google_maps_link.match(/src="([^"]+)"/i)?.[1] || '') : formData.google_maps_link}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen={false}
                                        loading="lazy"
                                        title="Bản đồ xem trước"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Info size={14} className="text-vinfast-blue shrink-0" />
                            <span>Thay đổi sẽ được cập nhật ngay lập tức lên Header, Footer và Form tương ứng với <strong>{currentBranchInfo?.name}</strong>.</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl shadow-md text-white bg-vinfast-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vinfast-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Đang Lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="-ml-1 mr-2 h-4 w-4" />
                                    Lưu Thay Đổi ({currentBranchInfo?.shortName})
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
