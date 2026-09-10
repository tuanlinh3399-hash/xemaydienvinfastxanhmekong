'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { submitLead } from '@/app/actions/lead';
import { useSiteSettings } from '@/components/client/SiteSettingsProvider';
import { useBranch } from '@/components/client/BranchProvider';
import { FALLBACK_EMAIL } from '@/lib/constants';
import { BRANCHES, BRANCH_LIST, DEFAULT_BRANCH_ID } from '@/lib/branches';

export default function ContactClient() {
    const { settings } = useSiteSettings();
    const { currentBranch, branchList, switchBranch, isMounted } = useBranch();

    const defaultBranch = BRANCHES[DEFAULT_BRANCH_ID];
    const activeBranch = isMounted ? currentBranch : defaultBranch;

    const displayAddress = (isMounted && settings?.address) ? settings.address : activeBranch.address;
    const displayPhone = (isMounted && (settings?.hotline || settings?.phone))
        ? (settings.hotline || settings.phone!)
        : activeBranch.hotline;
    const cleanPhone = displayPhone.replace(/\s+/g, '');
    const displayEmail = (isMounted && settings?.email)
        ? settings.email
        : (activeBranch.email || FALLBACK_EMAIL);
    const displayMapEmbed = (isMounted && settings?.google_maps_link)
        ? settings.google_maps_link
        : activeBranch.mapEmbedUrl;
    const displayZaloUrl = (isMounted && settings?.zalo_link)
        ? settings.zalo_link
        : `https://zalo.me/${cleanPhone}`;
    const displayOpeningHours = activeBranch.openingHours || '08:00 - 20:00 (Thứ 2 - Chủ Nhật)';
    const DEFAULT_FACEBOOK_URL = 'https://www.facebook.com/vinfastxanhmekong/';
    const displayFacebookUrl = (isMounted && (settings?.fanpage_url || settings?.facebook_link))
        ? (settings?.fanpage_url || settings?.facebook_link!)
        : DEFAULT_FACEBOOK_URL;

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        branch: activeBranch.name,
        car_model: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setFormData(prev => ({ ...prev, branch: activeBranch.name }));
    }, [activeBranch.name]);

    const handleBranchSelect = (branchId: string) => {
        switchBranch(branchId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        // Validation
        if (!formData.full_name.trim() || !formData.phone.trim()) {
            setStatus('error');
            setErrorMessage('Vui lòng nhập đầy đủ Họ tên và Số điện thoại.');
            setLoading(false);
            return;
        }

        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
        if (!phoneRegex.test(formData.phone)) {
            setStatus('error');
            setErrorMessage('Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.');
            setLoading(false);
            return;
        }

        try {
            const result = await submitLead({
                full_name: formData.full_name,
                phone: formData.phone,
                branch: formData.branch,
                car_model: formData.car_model,
                notes: formData.notes
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            setStatus('success');
            setFormData({ full_name: '', phone: '', branch: currentBranch.name, car_model: '', notes: '' });
        } catch (error: any) {
            console.error('Submit error:', error);
            setStatus('error');
            setErrorMessage(error?.message || 'Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-vinfast-gray min-h-screen pb-20">
            {/* Page Header */}
            <div className="bg-vinfast-blue text-white py-16 md:py-24 mb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=2000')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
                <div className="container relative z-10 mx-auto px-4 md:px-8 text-center max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-md">
                        Liên Hệ VinFast Xanh Mekong
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 leading-relaxed font-light">
                        Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn về các dòng xe máy điện VinFast.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 -mt-10 relative z-20">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-2">

                        {/* LEFT COLUMN: Contact Info & Map */}
                        <div className="p-8 md:p-12 bg-gray-50 flex flex-col h-full border-b lg:border-b-0 lg:border-r border-gray-200">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                                <h2 className="text-3xl font-bold text-gray-900">Thông Tin Liên Hệ</h2>
                                {/* Branch Selector */}
                                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                                    {branchList.map((b) => {
                                        const isActive = isMounted ? b.id === currentBranch.id : b.id === DEFAULT_BRANCH_ID;
                                        return (
                                            <button
                                                key={b.id}
                                                type="button"
                                                onClick={() => handleBranchSelect(b.id)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                    isActive
                                                        ? 'bg-vinfast-blue text-white shadow-sm'
                                                        : 'text-gray-600 hover:text-vinfast-blue'
                                                }`}
                                            >
                                                {b.shortName}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <ul className="space-y-6 text-lg text-gray-700 mb-10">
                                <li className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm text-vinfast-blue shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="font-bold text-gray-900 mb-1">Địa chỉ Showroom ({activeBranch.shortName})</h4>
                                        <p className="leading-relaxed text-gray-600">{displayAddress}</p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm text-vinfast-blue shrink-0">
                                        <Phone size={24} />
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="font-bold text-gray-900 mb-1">Hotline Tư Vấn</h4>
                                        <a href={`tel:${cleanPhone}`} className="text-vinfast-blue font-bold hover:underline">{displayPhone}</a>
                                    </div>
                                </li>

                                <li className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm text-vinfast-blue shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="font-bold text-gray-900 mb-1">Email Tiếp Nhận</h4>
                                        <a href={`mailto:${displayEmail}`} className="text-vinfast-blue hover:underline">{displayEmail}</a>
                                    </div>
                                </li>

                                <li className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm text-vinfast-blue shrink-0">
                                        <Clock size={24} />
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="font-bold text-gray-900 mb-1">Giờ Mở Cửa</h4>
                                        <p className="text-gray-600">{displayOpeningHours}</p>
                                    </div>
                                </li>
                            </ul>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <a
                                    href={displayFacebookUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md text-center"
                                >
                                    Fanpage Facebook
                                </a>
                                <a
                                    href={displayZaloUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md text-center"
                                >
                                    <MessageSquare size={20} /> Chat Zalo ({activeBranch.shortName})
                                </a>
                            </div>

                            {/* Google Maps Embed theo chi nhánh (không dùng key động) */}
                            <div className="mt-auto h-64 w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 shrink-0">
                                <iframe
                                    src={displayMapEmbed}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen={true}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="border-0"
                                    title={`Bản đồ ${activeBranch.name}`}
                                ></iframe>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Lead Form */}
                        <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
                            {status === 'success' ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 animate-fade-in">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm border border-green-200">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900">Đăng ký thành công!</h3>
                                    <p className="text-gray-600 text-lg leading-relaxed max-w-md">
                                        Cảm ơn bạn! Chuyên viên tư vấn của {formData.branch || 'VinFast Xanh Mekong'} sẽ liên hệ lại trong ít phút để hỗ trợ bạn.
                                    </p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="mt-8 px-8 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full font-bold transition-colors"
                                    >
                                        Gửi thêm yêu cầu khác
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-3xl font-bold text-vinfast-blue mb-2">Đăng Ký Tư Vấn & Lái Thử</h2>
                                    <p className="text-gray-500 mb-8">Vui lòng điền thông tin bên dưới, chúng tôi sẽ hỗ trợ bạn nhanh nhất.</p>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {status === 'error' && (
                                            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3 text-sm animate-fade-in shadow-sm">
                                                <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-500" />
                                                <span className="font-medium">{errorMessage}</span>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.full_name}
                                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vinfast-blue focus:border-vinfast-blue transition-all outline-none text-gray-800"
                                                placeholder="VD: Nguyễn Văn A"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vinfast-blue focus:border-vinfast-blue transition-all outline-none text-gray-800"
                                                placeholder="VD: 0912345678"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Cơ sở tư vấn <span className="text-red-500">*</span></label>
                                            <select
                                                value={formData.branch}
                                                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vinfast-blue focus:border-vinfast-blue transition-all outline-none text-gray-800 cursor-pointer font-medium"
                                                required
                                            >
                                                {BRANCH_LIST.map((b) => (
                                                    <option key={b.id} value={b.name}>
                                                        {b.fullName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Dòng xe quan tâm <span className="text-gray-400 font-normal ml-1">(Tùy chọn)</span></label>
                                            <select
                                                value={formData.car_model}
                                                onChange={e => setFormData({ ...formData, car_model: e.target.value })}
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vinfast-blue focus:border-vinfast-blue transition-all outline-none text-gray-800 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_1rem_center] bg-no-repeat pr-10"
                                            >
                                                <option value="">-- Chọn dòng xe muốn lái thử --</option>
                                                <option value="Evo200 / Evo200 Lite">Evo200 / Evo200 Lite</option>
                                                <option value="Feliz S">Feliz S</option>
                                                <option value="Klara S (2022)">Klara S (2022)</option>
                                                <option value="Vento S">Vento S</option>
                                                <option value="Theon S">Theon S</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Lời nhắn bổ sung <span className="text-gray-400 font-normal ml-1">(Tùy chọn)</span></label>
                                            <textarea
                                                rows={3}
                                                value={formData.notes}
                                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vinfast-blue focus:border-vinfast-blue transition-all outline-none text-gray-800 resize-none"
                                                placeholder="Ví dụ: Tôi muốn tư vấn trả góp, tôi muốn lái thử vào thứ 7..."
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-vinfast-blue text-white py-4 px-6 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg hover:shadow-xl disabled:bg-blue-300 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    Gửi Yêu Cầu <Send size={20} className="ml-1" />
                                                </>
                                            )}
                                        </button>
                                        <p className="text-center text-xs text-gray-500 mt-4">
                                            Thông tin của bạn sẽ được bảo mật tuyệt đối theo chính sách của chúng tôi.
                                        </p>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
