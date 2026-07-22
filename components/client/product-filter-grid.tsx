'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductCard, { ProductDisplay } from './product-card';
import ProductSkeleton from './product-skeleton';
import { Filter, X, Search, Loader2 } from 'lucide-react';

export default function ProductFilterGrid({ initialProducts }: { initialProducts: ProductDisplay[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Use initialProducts from Server for faster first load
    const [products, setProducts] = useState<ProductDisplay[]>(initialProducts || []);
    const [loading, setLoading] = useState(false);

    // Lấy Filter States từ URL Params (nếu có), hoặc set mặc định
    const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
    const [isSearching, setIsSearching] = useState(false);

    const [segmentFilter, setSegmentFilter] = useState<string>(searchParams.get('category') || 'all');
    const [priceFilter, setPriceFilter] = useState<string>(searchParams.get('price') || 'all');
    const [batteryTypeFilter, setBatteryTypeFilter] = useState<string>(searchParams.get('battery_type') || 'all');
    const [batteryFilter, setBatteryFilter] = useState<string>(searchParams.get('battery') || 'all');

    // Cập nhật URL Params mỗi khi state thay đổi
    const createQueryString = useCallback((name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(name, value);
        } else {
            params.delete(name);
        }
        return params.toString();
    }, [searchParams]);

    useEffect(() => {
        const querySegment = searchParams.get('category') || 'all';
        const queryPrice = searchParams.get('price') || 'all';
        const queryBatteryType = searchParams.get('battery_type') || 'all';
        const queryBattery = searchParams.get('battery') || 'all';

        if (segmentFilter !== querySegment) setSegmentFilter(querySegment);
        if (priceFilter !== queryPrice) setPriceFilter(queryPrice);
        if (batteryTypeFilter !== queryBatteryType) setBatteryTypeFilter(queryBatteryType);
        if (batteryFilter !== queryBattery) setBatteryFilter(queryBattery);
    }, [searchParams]);

    // Sync input from URL (for back/forward buttons)
    useEffect(() => {
        const urlSearch = searchParams.get('search') || '';
        setSearchTerm(urlSearch);
    }, [searchParams]);

    // Handle typing and debouncing to update URL
    useEffect(() => {
        const urlSearch = searchParams.get('search') || '';
        if (searchTerm !== urlSearch) {
            setIsSearching(true);
            const handler = setTimeout(() => {
                const qs = createQueryString('search', searchTerm);
                router.push(pathname + (qs ? `?${qs}` : ''), { scroll: false });
                setIsSearching(false);
            }, 500);
            return () => clearTimeout(handler);
        } else {
            setIsSearching(false);
        }
    }, [searchTerm, searchParams, createQueryString, pathname, router]);

    // Fetch Products via Supabase whenever URL Search Param changes
    useEffect(() => {
        const fetchProductsBySearch = async () => {
            setLoading(true);
            const querySearch = searchParams.get('search') || '';

            let query = supabase
                .from('products')
                .select(`
                    id, name, slug, price_from, sale_price, specs, battery_type, category,
                    media!thumbnail_id(url)
                `)
                .order('price_from', { ascending: true });

            if (querySearch) {
                query = query.ilike('name', `%${querySearch}%`);
            }

            const { data } = await query;
            if (data) {
                setProducts(data as unknown as ProductDisplay[]);
            }
            setLoading(false);
        };

        // Only fetch if it's a client update (we already have initialProducts from server)
        // A naive check: we can just fetch on every search param update to ensure sync
        fetchProductsBySearch();
    }, [searchParams]);

    // Handle filter changes and push to router
    const handleFilterChange = (key: string, value: string) => {
        const qs = createQueryString(key, value);
        router.push(pathname + (qs ? `?${qs}` : ''), { scroll: false });
    };

    // Mobile Modal State
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Note: The main array `products` is already filtered by `searchQuery` via Supabase `.ilike`
            // So we DO NOT need to filter `searchMatch` locally anymore.

            // Dynamic Category Filter
            let segmentMatch = true;
            if (segmentFilter !== 'all') {
                segmentMatch = product.category === segmentFilter;
            }

            // Price Filter (< 20M, 20M - 40M, > 40M)
            let priceMatch = true;
            if (priceFilter !== 'all') {
                const price = product.price_from || 0;
                if (priceFilter === 'under-20') priceMatch = price < 20000000;
                else if (priceFilter === '20-40') priceMatch = price >= 20000000 && price <= 40000000;
                else if (priceFilter === 'over-40') priceMatch = price > 40000000;
            }

            // Battery Version Filter
            let batteryTypeMatch = true;
            if (batteryTypeFilter !== 'all') {
                batteryTypeMatch = product.battery_type === batteryTypeFilter;
            }

            // Battery Type (LFP/Acid) Filter
            let batteryMatch = true;
            if (batteryFilter !== 'all') {
                const specBat = product.specs?.battery?.toLowerCase() || '';
                if (batteryFilter === 'lfp') batteryMatch = specBat.includes('lfp');
                else if (batteryFilter === 'lead-acid') batteryMatch = specBat.includes('chì') || specBat.includes('khô');
            }

            return segmentMatch && priceMatch && batteryTypeMatch && batteryMatch;
        });
    }, [products, segmentFilter, priceFilter, batteryTypeFilter, batteryFilter]);

    const FilterContent = () => (
        <div className="space-y-8">
            {/* Segment */}
            <div>
                <h3 className="font-bold text-gray-900 mb-4 text-lg border-b pb-2">Phân Khúc Xe</h3>
                <div className="space-y-3">
                    {[
                        { id: 'all', label: 'Tất cả phân khúc' },
                        { id: 'Phổ thông', label: 'Phổ thông' },
                        { id: 'Trung cấp', label: 'Trung cấp' },
                        { id: 'Cao cấp', label: 'Cao cấp' }
                    ].map(opt => (
                        <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="radio"
                                name="category"
                                value={opt.id}
                                checked={segmentFilter === opt.id}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-4 h-4 text-vinfast-blue focus:ring-vinfast-blue cursor-pointer"
                            />
                            <span className={`text-sm group-hover:text-vinfast-blue transition-colors ${segmentFilter === opt.id ? 'font-semibold text-vinfast-blue' : 'text-gray-600'}`}>
                                {opt.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Battery Version */}
            <div>
                <h3 className="font-bold text-gray-900 mb-4 text-lg border-b pb-2">Phiên bản Pin</h3>
                <div className="space-y-3">
                    {[
                        { id: 'all', label: 'Tất cả phiên bản' },
                        { id: 'Thuê pin', label: 'Thuê pin' },
                        { id: 'Mua kèm pin', label: 'Mua kèm pin' },
                    ].map(opt => (
                        <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="radio"
                                name="battery_type"
                                value={opt.id}
                                checked={batteryTypeFilter === opt.id}
                                onChange={(e) => handleFilterChange('battery_type', e.target.value)}
                                className="w-4 h-4 text-vinfast-blue focus:ring-vinfast-blue cursor-pointer"
                            />
                            <span className={`text-sm group-hover:text-vinfast-blue transition-colors ${batteryTypeFilter === opt.id ? 'font-semibold text-vinfast-blue' : 'text-gray-600'}`}>
                                {opt.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div>
                <h3 className="font-bold text-gray-900 mb-4 text-lg border-b pb-2">Mức Giá</h3>
                <div className="space-y-3">
                    {[
                        { id: 'all', label: 'Tất cả mức giá' },
                        { id: 'under-20', label: 'Dưới 20 triệu VNĐ' },
                        { id: '20-40', label: '20 - 40 triệu VNĐ' },
                        { id: 'over-40', label: 'Trên 40 triệu VNĐ' },
                    ].map(opt => (
                        <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="radio"
                                name="price"
                                value={opt.id}
                                checked={priceFilter === opt.id}
                                onChange={(e) => handleFilterChange('price', e.target.value)}
                                className="w-4 h-4 text-vinfast-blue focus:ring-vinfast-blue cursor-pointer"
                            />
                            <span className={`text-sm group-hover:text-vinfast-blue transition-colors ${priceFilter === opt.id ? 'font-semibold text-vinfast-blue' : 'text-gray-600'}`}>
                                {opt.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Battery */}
            <div>
                <h3 className="font-bold text-gray-900 mb-4 text-lg border-b pb-2">Loại Pin</h3>
                <div className="space-y-3">
                    {[
                        { id: 'all', label: 'Tất cả loại pin' },
                        { id: 'lfp', label: 'Pin LFP thế hệ mới' },
                        { id: 'lead-acid', label: 'Ắc quy chì' },
                    ].map(opt => (
                        <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="radio"
                                name="battery"
                                value={opt.id}
                                checked={batteryFilter === opt.id}
                                onChange={(e) => handleFilterChange('battery', e.target.value)}
                                className="w-4 h-4 text-vinfast-blue focus:ring-vinfast-blue cursor-pointer"
                            />
                            <span className={`text-sm group-hover:text-vinfast-blue transition-colors ${batteryFilter === opt.id ? 'font-semibold text-vinfast-blue' : 'text-gray-600'}`}>
                                {opt.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar Filter */}
            <aside className="hidden lg:block w-1/4 shrink-0">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                    <div className="flex items-center gap-2 text-vinfast-blue font-bold text-xl mb-6">
                        <Filter size={24} />
                        <span>Bộ Lọc Sản Phẩm</span>
                    </div>
                    <FilterContent />
                </div>
            </aside>

            {/* Mobile Filter Button and Context Info */}
            <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-2">
                <span className="font-medium text-gray-700">
                    <span className="font-bold text-vinfast-blue">{filteredProducts.length}</span> sản phẩm
                </span>
                <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="flex items-center gap-2 bg-vinfast-blue text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-sm"
                >
                    <Filter size={18} /> Lọc Sản Phẩm
                </button>
            </div>

            {/* Mobile Filter Modal */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/50 lg:hidden">
                    <div className="w-4/5 max-w-sm bg-white h-full flex flex-col shadow-2xl animate-fade-in">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Bộ Lọc</h2>
                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="p-2 text-gray-500 hover:text-gray-800 bg-gray-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-grow">
                            <FilterContent />
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex gap-4">
                            <button
                                onClick={() => {
                                    router.push(pathname, { scroll: false });
                                }}
                                className="flex-1 py-3 text-gray-600 bg-white border border-gray-300 rounded-xl font-bold"
                            >
                                Xóa tất cả lọc
                            </button>
                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="flex-1 py-3 bg-vinfast-blue text-white rounded-xl font-bold shadow-md"
                            >
                                Xem kết quả
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Product Grid */}
            <div className="flex-1">

                {/* Search Bar - Phía trên lưới sản phẩm */}
                <div className="mb-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm mẫu xe VinFast bạn yêu thích..."
                        className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-vinfast-blue/30 focus:border-vinfast-blue transition-all text-gray-800 text-lg placeholder:text-gray-400"
                    />
                    {isSearching && (
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <Loader2 className="w-5 h-5 text-vinfast-blue animate-spin" />
                        </div>
                    )}
                </div>

                <div className="hidden lg:block mb-6 text-gray-600">
                    Tìm thấy <span className="font-bold text-vinfast-blue text-lg">{filteredProducts.length}</span> sản phẩm phù hợp
                </div>

                {loading ? (
                    // Skeleton Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[430px]">
                                <ProductSkeleton />
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    // Actual Products
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 animate-fade-in">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="h-full">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-in px-4">
                        <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">Không tìm thấy mẫu xe phù hợp. Bạn có muốn xem các dòng xe máy điện VinFast bán chạy nhất không?</p>
                        <button
                            onClick={() => {
                                router.push(pathname, { scroll: false });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-vinfast-blue text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-blue-800 transition-colors"
                        >
                            Xóa bộ lọc & Xem xe bán chạy
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
