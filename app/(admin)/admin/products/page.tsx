'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Pencil, Trash2, X, Plus, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, CheckSquare, Square, Star, StarOff, Search, Copy } from 'lucide-react';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

const ITEMS_PER_PAGE = 8;

type ProductSpecs = {
    range?: string;
    speed?: string;
    battery?: string;
};

type Product = {
    id: string;
    name: string;
    slug: string;
    price_from: number;
    sale_price?: number | null;
    excerpt?: string;
    description?: string;
    is_featured: boolean;
    thumbnail_id?: string;
    specs?: ProductSpecs;
    policies?: string[];
    battery_type?: string;
    category?: string;
    media?: {
        url: string;
    };
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    // Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Search State
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        price_from: 0,
        sale_price: '' as number | string,
        excerpt: '',
        description: '',
        is_featured: false,
        thumbnail_id: '',
        range: '',
        speed: '',
        battery: '',
        battery_type: '',
        category: '',
        policies: [] as string[]
    });
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    // Notification state
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchInput);
            setCurrentPage(1); // Reset to page 1 on search
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchProducts();
        // Reset selection when changing pages, refetching, or searching
        setSelectedIds([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, debouncedSearchTerm]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const start = (currentPage - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE - 1;

            let query = supabase
                .from('products')
                .select('*, media:thumbnail_id(url)', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(start, end);

            if (debouncedSearchTerm) {
                query = query.or(`name.ilike.%${debouncedSearchTerm}%,slug.ilike.%${debouncedSearchTerm}%`);
            }

            const { data, count, error } = await query;

            if (error) throw error;
            setProducts(data || []);
            setTotalProducts(count || 0);
        } catch (error) {
            console.error('Error fetching products:', error);
            showNotification('error', 'Lỗi khi tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD') // Thay đổi các kí tự tiếng Việt có dấu
            .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
            .replace(/\s+/g, '-') // Đổi khoảng trắng thành gạch ngang
            .replace(/[^\w-]+/g, '') // Format lại các ký tự không phải alphanum
            .replace(/--+/g, '-') // Xóa nhiều - liên tiếp
            .replace(/^-+/, '') // Trim - ở đầu
            .replace(/-+$/, ''); // Trim - ở cuối
    };

    const resolveImageUrl = (input: string) => {
        if (!input) return '';
        if (input.startsWith('http')) return input; // Đã là URL đầy đủ thì trả về luôn

        // Nếu là path đơn thuần, chuẩn hoá để lấy URL qua Supabase
        let cleanPath = input.startsWith('/') ? input.substring(1) : input;
        if (cleanPath.startsWith('images/')) {
            cleanPath = cleanPath.substring(7);
        }

        const { data } = supabase.storage.from('images').getPublicUrl(cleanPath);
        return data.publicUrl;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            // Create a local blob URL for temporary preview 
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleOpenModal = (product?: Product) => {
        setImageFile(null);
        setImagePreviewUrl(null);
        if (product) {
            setEditingProduct(product);

            // Xử lý biến đổi UUID/Path tĩnh thành Public URL để hiển thị
            const initialThumb = product.media?.url || product.thumbnail_id || '';
            const resolvedUrl = initialThumb ? resolveImageUrl(initialThumb) : '';

            setFormData({
                name: product.name || '',
                slug: product.slug || '',
                price_from: product.price_from || 0,
                sale_price: product.sale_price ?? '',
                excerpt: product.excerpt || '',
                description: product.description || '',
                is_featured: product.is_featured || false,
                thumbnail_id: resolvedUrl, // Lưu trực tiếp Public URL vào state
                range: product.specs?.range || '',
                speed: product.specs?.speed || '',
                battery: product.specs?.battery || '',
                battery_type: product.battery_type || '',
                category: product.category || '',
                policies: Array.isArray(product.policies) ? product.policies : []
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                slug: '',
                price_from: 0,
                sale_price: '',
                excerpt: '',
                description: '',
                is_featured: false,
                thumbnail_id: '',
                range: '',
                speed: '',
                battery: '',
                battery_type: '',
                category: '',
                policies: []
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setImageFile(null);
        setImagePreviewUrl(null);
        if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl); // memory cleanup
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Giữ lại UUID hiện tại của bản ghi thay vì formData (vì formData giờ đang chứa URL)
            let newThumbnailId = editingProduct?.thumbnail_id || null;

            // Xử lý upload ảnh mới
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);
                // Sử dụng slug hiện tại hoặc được tự động sinh làm tên gốc cho file
                const baseSlug = formData.slug || generateSlug(formData.name);
                uploadFormData.append('slug', baseSlug);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData
                });

                if (!uploadRes.ok) {
                    const errData = await uploadRes.json();
                    throw new Error(errData.error || 'Lỗi hệ thống khi upload ảnh.');
                }
                const { url, filename } = await uploadRes.json();

                // Lưu dữ liệu meta vào bảng media và lấy ID mới
                const { data: mediaData, error: mediaError } = await supabase
                    .from('media')
                    .insert([{
                        url: url,
                        filename: filename,
                        folder: 'products'
                    }])
                    .select('id')
                    .single();

                if (mediaError) throw mediaError;
                newThumbnailId = mediaData.id;
            } else if (formData.thumbnail_id && formData.thumbnail_id !== resolveImageUrl(editingProduct?.media?.url || editingProduct?.thumbnail_id || '')) {
                // Người dùng nhập URL mới trực tiếp vào ô input -> Insert vào bảng media
                const finalUrl = resolveImageUrl(formData.thumbnail_id);

                const { data: mediaData, error: mediaError } = await supabase
                    .from('media')
                    .insert([{
                        url: finalUrl,
                        filename: finalUrl.split('/').pop() || 'external-image',
                        folder: 'external'
                    }])
                    .select('id')
                    .single();

                if (mediaError) throw mediaError;
                newThumbnailId = mediaData.id;
            }

            const parsedPrice = Number(formData.price_from);
            const parsedSalePrice = formData.sale_price === '' ? null : Number(formData.sale_price);

            if (parsedSalePrice !== null && parsedSalePrice >= parsedPrice) {
                showNotification('error', 'Giá khuyến mãi phải nhỏ hơn giá gốc');
                setSaving(false);
                return;
            }

            const payload = {
                ...(editingProduct?.id ? { id: editingProduct.id } : {}),
                name: formData.name,
                slug: formData.slug,
                price_from: parsedPrice,
                sale_price: parsedSalePrice,
                excerpt: formData.excerpt,
                description: formData.description,
                is_featured: formData.is_featured,
                thumbnail_id: newThumbnailId || null,
                battery_type: formData.battery_type || null,
                category: formData.category || null,
                policies: formData.policies.filter(p => p.trim() !== ''),
                specs: {
                    range: formData.range,
                    speed: formData.speed,
                    battery: formData.battery
                }
            };

            const { error } = await supabase
                .from('products')
                .upsert(payload, { onConflict: 'id' });

            if (error) throw error;

            fetchProducts();
            handleCloseModal();
            showNotification('success', 'Sản phẩm đã được lưu thành công');
        } catch (error) {
            const e = error as Error & { details?: string };
            console.error('Lỗi chi tiết:', e.message, e.details);
            showNotification('error', `Lỗi khi lưu sản phẩm: ${e.message || 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDuplicate = async (product: Product) => {
        if (!window.confirm(`Bạn có chắc chắn muốn sao chép sản phẩm "${product.name}"?`)) return;

        setLoading(true);
        try {
            const { data: fullProduct, error: fetchError } = await supabase
                .from('products')
                .select('*')
                .eq('id', product.id)
                .single();

            if (fetchError) throw fetchError;

            // Loại bỏ id và created_at
            const { id, created_at, ...productData } = fullProduct;

            const payload = {
                ...productData,
                name: `${productData.name} (Bản sao)`,
                slug: `${productData.slug}-copy-${Date.now()}`
            };

            const { error: insertError } = await supabase
                .from('products')
                .insert([payload]);

            if (insertError) throw insertError;

            showNotification('success', 'Sao chép sản phẩm thành công');
            fetchProducts();
        } catch (error) {
            console.error('Error duplicating product:', error);
            const e = error as Error;
            showNotification('error', `Lỗi khi sao chép: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            showNotification('success', 'Đã xóa sản phẩm');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            const e = error as Error;
            showNotification('error', `Lỗi khi xóa: ${e.message}`);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn? Hành động này không thể hoàn tác.`)) return;

        try {
            setLoading(true);
            const { error } = await supabase.from('products').delete().in('id', selectedIds);
            if (error) throw error;
            showNotification('success', `Đã xóa ${selectedIds.length} sản phẩm`);
            setSelectedIds([]);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting products:', error);
            const e = error as Error;
            showNotification('error', `Lỗi khi xóa: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkSetFeatured = async (isFeatured: boolean) => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('products')
                .update({ is_featured: isFeatured })
                .in('id', selectedIds);

            if (error) throw error;
            showNotification('success', `Đã cập nhật trạng thái nổi bật cho ${selectedIds.length} sản phẩm`);
            fetchProducts();
        } catch (error) {
            console.error('Error updating products:', error);
            const e = error as Error;
            showNotification('error', `Lỗi khi cập nhật trạng thái: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.map(p => p.id));
        }
    };

    const toggleSelectProduct = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const getImageUrl = (product: Product) => {
        let url = product.media?.url;
        if (url) {
            // Strict normalization: ensure /images/products/ prefix if it's a relative path lacking it
            if (url.startsWith('/') && !url.startsWith('/images/products/')) {
                url = `/images/products/${url.split('/').pop()}`;
            }
            return url;
        }
        return '/images/placeholder.webp';
    };

    return (
        <div className="space-y-6 relative">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg flex items-center gap-2 text-white animate-fade-in-down ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý Sản Phẩm</h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm tên xe, slug..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-vinfast-blue/50 focus:border-vinfast-blue transition-all text-sm"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-vinfast-blue text-white rounded hover:bg-blue-800 transition-colors text-sm font-medium shadow-sm shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Thêm Xe Mới</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                {loading ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-4 border-vinfast-blue border-t-transparent rounded-full animate-spin"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold border-b w-10 text-center">
                                        <button onClick={toggleSelectAll} className="flex items-center justify-center w-full focus:outline-none">
                                            {products.length > 0 && selectedIds.length === products.length ? (
                                                <CheckSquare className="w-5 h-5 text-vinfast-blue" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 font-semibold border-b w-24">Hình ảnh</th>
                                    <th className="px-6 py-4 font-semibold border-b">Tên Xe & Tình Trạng</th>
                                    <th className="px-6 py-4 font-semibold border-b">Giá Từ (VNĐ)</th>
                                    <th className="px-6 py-4 font-semibold border-b">Thông số kỹ thuật</th>
                                    <th className="px-6 py-4 font-semibold border-b text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Search className="w-12 h-12 text-gray-300 mb-4" />
                                                <p className="text-lg font-medium text-gray-700 mb-1">
                                                    {debouncedSearchTerm ? 'Không tìm thấy kết quả' : 'Chưa có sản phẩm nào'}
                                                </p>
                                                <p className="text-sm">
                                                    {debouncedSearchTerm
                                                        ? `Không có xe nào phù hợp với từ khóa "${debouncedSearchTerm}"`
                                                        : 'Hãy thêm sản phẩm đầu tiên của bạn vào hệ thống.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {
                                        const isSelected = selectedIds.includes(product.id);
                                        return (
                                            <tr key={product.id} className={`hover:bg-gray-50 transition-colors group ${isSelected ? 'bg-blue-50/50' : ''}`}>
                                                <td className="px-6 py-3 text-center">
                                                    <button onClick={() => toggleSelectProduct(product.id)} className="flex items-center justify-center w-full focus:outline-none">
                                                        {isSelected ? (
                                                            <CheckSquare className="w-5 h-5 text-vinfast-blue" />
                                                        ) : (
                                                            <Square className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="relative h-14 w-20 bg-gray-100 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                                                        <Image
                                                            src={getImageUrl(product)}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = '/images/placeholder.webp';
                                                                target.srcset = '';
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 text-base">{product.name}</div>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span className="text-gray-500 text-xs">/{product.slug}</span>
                                                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wide rounded-full ${product.is_featured ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                            }`}>
                                                            {product.is_featured ? 'Nổi bật' : 'Thường'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-vinfast-blue text-base">
                                                    {new Intl.NumberFormat('vi-VN').format(product.price_from || 0)} ₫
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <div><span className="text-gray-500">Pin:</span> <span className="font-medium">{product.specs?.battery || 'N/A'}</span></div>
                                                        <div><span className="text-gray-500">Quãng đường:</span> <span className="font-medium">{product.specs?.range || 'N/A'}</span></div>
                                                        <div><span className="text-gray-500">Vận tốc:</span> <span className="font-medium">{product.specs?.speed || 'N/A'}</span></div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={() => handleDuplicate(product)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors tooltip"
                                                            title="Sao chép"
                                                        >
                                                            <Copy className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenModal(product)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors tooltip"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Pencil className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalProducts > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="text-sm text-gray-600">
                            Hiển thị <span className="font-semibold text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> đến <span className="font-semibold text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)}</span> trong số <span className="font-semibold text-gray-900">{totalProducts}</span> sản phẩm
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium text-gray-700 px-2">
                                Trang {currentPage} / {Math.ceil(totalProducts / ITEMS_PER_PAGE)}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalProducts / ITEMS_PER_PAGE), p + 1))}
                                disabled={currentPage === Math.ceil(totalProducts / ITEMS_PER_PAGE)}
                                className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:ml-32 z-40 bg-white border border-gray-200 shadow-2xl rounded-lg px-6 py-4 flex items-center gap-6 animate-fade-in-up">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded w-8 h-8 flex items-center justify-center">
                            {selectedIds.length}
                        </div>
                        <span className="text-gray-600 font-medium">sản phẩm được chọn</span>
                    </div>

                    <div className="h-8 w-px bg-gray-200"></div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors text-sm font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            Xóa đã chọn
                        </button>

                        <div className="h-6 w-px bg-gray-200"></div>

                        <button
                            onClick={() => handleBulkSetFeatured(true)}
                            className="flex items-center gap-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded transition-colors text-sm font-medium"
                        >
                            <Star className="w-4 h-4" />
                            Đặt Nổi bật
                        </button>

                        <button
                            onClick={() => handleBulkSetFeatured(false)}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors text-sm font-medium"
                        >
                            <StarOff className="w-4 h-4" />
                            Bỏ Nổi bật
                        </button>

                        {selectedIds.length === 1 && (
                            <>
                                <div className="h-6 w-px bg-gray-200"></div>
                                <button
                                    onClick={() => {
                                        const productToEdit = products.find(p => p.id === selectedIds[0]);
                                        if (productToEdit) handleOpenModal(productToEdit);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm font-medium"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Sửa
                                </button>
                            </>
                        )}

                        <div className="h-6 w-px bg-gray-200"></div>

                        <button
                            onClick={() => setSelectedIds([])}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Bỏ chọn"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity"
                    style={{ fontFamily: 'var(--font-be-vietnam-pro, "Be Vietnam Pro", sans-serif)' }}
                >
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingProduct ? 'Chỉnh sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="product-form" onSubmit={handleSave} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Tên xe <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={e => {
                                                const newName = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    name: newName,
                                                    // Auto-generate slug cho Thêm mới hoặc nếu đang nhập tên
                                                    slug: !editingProduct || formData.slug === generateSlug(formData.name) ? generateSlug(newName) : formData.slug
                                                });
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vinfast-blue/50 focus:border-vinfast-blue transition-all"
                                            placeholder="VD: VinFast Evo200"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Slug (Đường dẫn) <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.slug}
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vinfast-blue/50 focus:border-vinfast-blue transition-all"
                                            placeholder="VD: evo200"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Giá từ (VNĐ) <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.price_from}
                                            onChange={e => setFormData({ ...formData, price_from: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vinfast-blue/50 focus:border-vinfast-blue transition-all"
                                            placeholder="VD: 18000000"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Phiên bản Pin</label>
                                        <select
                                            value={formData.battery_type}
                                            onChange={e => setFormData({ ...formData, battery_type: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vinfast-blue/50 focus:border-vinfast-blue transition-all bg-white"
                                        >
                                            <option value="">-- Không xác định --</option>
                                            <option value="Thuê pin">Thuê pin</option>
                                            <option value="Mua kèm pin">Mua kèm pin</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 md:col-span-1">
                                        <label className="text-sm font-medium text-gray-700">Phân khúc xe (Category)</label>
                                        <input
                                            type="text"
                                            list="category-options"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vinfast-blue/50 focus:border-vinfast-blue transition-all"
                                            placeholder="VD: Phổ thông, Trung cấp, Cao cấp..."
                                        />
                                        <datalist id="category-options">
                                            <option value="Phổ thông" />
                                            <option value="Trung cấp" />
                                            <option value="Cao cấp" />
                                        </datalist>
                                    </div>
                                    <div className="space-y-1.5 md:col-span-1">
                                        <label className="text-sm font-medium text-gray-700">Giá khuyến mãi (VNĐ)</label>
                                        <input
                                            type="number"
                                            value={formData.sale_price}
                                            onChange={e => setFormData({ ...formData, sale_price: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vinfast-blue/50 focus:border-vinfast-blue transition-all"
                                            placeholder="Bỏ trống nếu không giảm giá"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col justify-center pt-6 md:col-span-2">
                                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={formData.is_featured}
                                                    onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                                />
                                                <div className={`block w-11 h-6 rounded-full transition-colors ${formData.is_featured ? 'bg-vinfast-blue' : 'bg-gray-300'}`}></div>
                                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_featured ? 'translate-x-5' : ''}`}></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Sản phẩm nổi bật</span>
                                        </label>
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">Mô tả ngắn (Excerpt)</label>
                                        <textarea
                                            value={formData.excerpt}
                                            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vinfast-blue/50 focus:border-vinfast-blue transition-all"
                                            placeholder="VD: Nhập một câu ngắn gọn, thu hút để giới thiệu tổng quan về dòng xe này."
                                            rows={2}
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">Mô tả sản phẩm</label>
                                        <RichTextEditor
                                            value={formData.description}
                                            onChange={val => setFormData({ ...formData, description: val })}
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2 flex gap-6 items-start bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-gray-800 block">Tải ảnh sản phẩm lên</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="block w-full text-sm text-gray-500
                                                        file:mr-4 file:py-2.5 file:px-4
                                                        file:rounded-md file:border-0
                                                        file:text-sm file:font-bold
                                                        file:bg-vinfast-blue file:text-white
                                                        hover:file:bg-blue-800 transition-colors cursor-pointer outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <div className="h-px bg-gray-300 flex-1"></div>
                                                <span className="px-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">hoặc nhập id / url có sẵn</span>
                                                <div className="h-px bg-gray-300 flex-1"></div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <input
                                                    type="text"
                                                    value={formData.thumbnail_id}
                                                    onChange={e => setFormData({ ...formData, thumbnail_id: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vinfast-blue/50 focus:border-vinfast-blue transition-all text-sm disabled:opacity-50 disabled:bg-gray-100"
                                                    placeholder="VD: https://xxxx.supabase.co/storage/v1/object/public/images/..."
                                                    disabled={!!imageFile}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm group">
                                            <Image
                                                src={
                                                    imagePreviewUrl
                                                        ? imagePreviewUrl
                                                        : formData.thumbnail_id
                                                            ? resolveImageUrl(formData.thumbnail_id)
                                                            : `/images/products/${formData.slug || 'placeholder'}.webp`
                                                }
                                                alt="Preview"
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                                unoptimized
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/images/placeholder.webp';
                                                    target.srcset = '';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Thông số kỹ thuật</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-600">Loại pin / Tùy chọn</label>
                                            <select
                                                value={formData.battery}
                                                onChange={e => setFormData({ ...formData, battery: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vinfast-blue/50 focus:border-vinfast-blue transition-all text-sm bg-white"
                                            >
                                                <option value="">-- Chọn loại pin --</option>
                                                <option value="Ắc quy chì">Ắc quy chì</option>
                                                <option value="1.02 kWh LFP">1.02 kWh LFP</option>
                                                <option value="1.2 kWh LFP">1.2 kWh LFP</option>
                                                <option value="1.5 kWh LFP">1.5 kWh LFP</option>
                                                <option value="2.0 kWh LFP">2.0 kWh LFP</option>
                                                <option value="2.4 kWh LFP">2.4 kWh LFP</option>
                                                <option value="3.5 kWh LFP">3.5 kWh LFP</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-600">Quãng đường tối đa</label>
                                            <input
                                                type="text"
                                                list="range-options"
                                                value={formData.range}
                                                onChange={e => setFormData({ ...formData, range: e.target.value })}
                                                onBlur={(e) => {
                                                    const val = e.target.value.trim();
                                                    if (val && !isNaN(Number(val))) {
                                                        setFormData({ ...formData, range: `${val} km/lần sạc` });
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vinfast-blue/50 focus:border-vinfast-blue transition-all text-sm"
                                                placeholder="VD: 205 (tự động thêm đơn vị)"
                                            />
                                            <datalist id="range-options">
                                                <option value="60km/lần sạc" />
                                                <option value="80km/lần sạc" />
                                                <option value="100km/lần sạc" />
                                                <option value="120km/lần sạc" />
                                                <option value="150km/lần sạc" />
                                                <option value="203km/lần sạc" />
                                                <option value="205km/lần sạc" />
                                            </datalist>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-600">Vận tốc tối đa</label>
                                            <input
                                                type="text"
                                                list="speed-options"
                                                value={formData.speed}
                                                onChange={e => setFormData({ ...formData, speed: e.target.value })}
                                                onBlur={(e) => {
                                                    const val = e.target.value.trim();
                                                    if (val && !isNaN(Number(val))) {
                                                        setFormData({ ...formData, speed: `${val} km/h` });
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vinfast-blue/50 focus:border-vinfast-blue transition-all text-sm"
                                                placeholder="VD: 70 (tự động thêm đơn vị)"
                                            />
                                            <datalist id="speed-options">
                                                <option value="45km/h" />
                                                <option value="49km/h" />
                                                <option value="50km/h" />
                                                <option value="60km/h" />
                                                <option value="70km/h" />
                                                <option value="78km/h" />
                                                <option value="89km/h" />
                                                <option value="99km/h" />
                                            </datalist>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Chính sách ưu đãi</h4>
                                    <div className="space-y-3">
                                        {formData.policies.map((policy, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={policy}
                                                    onChange={(e) => {
                                                        const newPolicies = [...formData.policies];
                                                        newPolicies[index] = e.target.value;
                                                        setFormData({ ...formData, policies: newPolicies });
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vinfast-blue/50 focus:border-vinfast-blue transition-all text-sm"
                                                    placeholder="VD: Bảo hành chính hãng 5 năm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newPolicies = formData.policies.filter((_, i) => i !== index);
                                                        setFormData({ ...formData, policies: newPolicies });
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors shrink-0"
                                                    title="Xóa chính sách này"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, policies: [...formData.policies, ''] })}
                                            className="flex items-center gap-2 px-3 py-2 text-vinfast-blue hover:bg-blue-50 border border-vinfast-blue rounded-md transition-colors text-sm font-medium w-fit"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Thêm chính sách
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={saving}
                                className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors disabled:opacity-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                form="product-form"
                                disabled={saving}
                                className="px-5 py-2 text-sm font-medium text-white bg-vinfast-blue rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-vinfast-blue/50 transition-colors disabled:opacity-70 flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Đang lưu...
                                    </>
                                ) : 'Lưu sản phẩm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
