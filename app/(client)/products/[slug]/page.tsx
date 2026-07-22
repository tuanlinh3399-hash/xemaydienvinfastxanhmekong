import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Battery, Zap, Timer, Check, ArrowDown, Phone } from 'lucide-react';
import ProductLeadForm from '@/components/client/product-lead-form';
import ProductSection from '@/components/client/product-section';
import { ProductDisplay } from '@/components/client/product-card';
import StickyActionBar from '@/components/client/sticky-action-bar';
import ScrollButton from '@/components/client/scroll-button';

export const revalidate = 60; // Cache 60s

interface ProductDetailPageProps {
    params: Promise<{
        slug: string;
    }>
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
    const { slug } = await params;
    const { data: product } = await supabase
        .from('products')
        .select(`
            *,
            media:thumbnail_id(url)
        `)
        .eq('slug', slug)
        .single();

    if (!product) return { title: 'Sản phẩm không tồn tại' };

    let imageUrl = product.media?.url || `https://vinfastxanhmekong.com/images/products/${product.slug}.webp`;
    if (imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
        imageUrl = `https://vinfastxanhmekong.com${imageUrl}`;
    }

    return {
        title: `${product.name} | VinFast Xanh Mekong`,
        description: product.excerpt || `Trải nghiệm tương lai di chuyển thông minh cùng VinFast ${product.name}.`,
        openGraph: {
            title: `${product.name} | VinFast Xanh Mekong`,
            description: product.excerpt || `Khám phá xe máy điện VinFast ${product.name} tại Cần Thơ.`,
            url: `https://vinfastxanhmekong.com/products/${product.slug}`,
            siteName: 'VinFast Xanh Mekong',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                },
            ],
            locale: 'vi_VN',
            type: 'website',
        },
    };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const { slug } = await params;

    // Fetch Product with Media
    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            policies,
            battery_type,
            media:thumbnail_id(url)
        `)
        .eq('slug', slug)
        .single();

    if (error || !product) {
        notFound();
    }

    // Process Product Data
    let imageUrl = product.media?.url || `/images/products/${product.slug}.webp`;
    if (imageUrl.startsWith('/') && !imageUrl.startsWith('/images/products/')) {
        imageUrl = `/images/products/${imageUrl.split('/').pop()}`;
    }

    const priceFormatted = product.price_from
        ? new Intl.NumberFormat('vi-VN').format(product.price_from) + ' VNĐ'
        : 'Liên hệ';

    const specs = product.specs || {};
    const range = specs.range || "Đang cập nhật";
    const speed = specs.speed || "Đang cập nhật";
    const batteryInfo = specs.battery || "Đang cập nhật";

    // --- LOGIC: FETCH SẢN PHẨM TƯƠNG TỰ ---
    // Vì DB không có cột category rõ rệt, ta dùng chung cờ `is_bestseller` hoặc `is_new` để tìm xe cùng phân khúc, 
    // hoặc đơn giản lấy 4 xe ngẫu nhiên khác id hiện tại nếu không khớp cờ nào.
    let similarQuery = supabase
        .from('products')
        .select(`
            id, name, slug, price_from, sale_price, specs, battery_type,
            media!thumbnail_id(url)
        `)
        .neq('id', product.id)
        .limit(4);

    // Ưu tiên cùng nhóm xe bán chạy hoặc xe mới
    if (product.is_bestseller) {
        similarQuery = similarQuery.eq('is_bestseller', true);
    } else if (product.is_new) {
        similarQuery = similarQuery.eq('is_new', true);
    }

    let { data: similarProductsData } = await similarQuery;

    // Fallback: Nếu không đủ 4 xe, lấy bù thêm xe khác vào
    if (!similarProductsData || similarProductsData.length < 4) {
        const { data: moreProducts } = await supabase
            .from('products')
            .select(`
                id, name, slug, price_from, sale_price, specs, battery_type,
                media!thumbnail_id(url)
            `)
            .neq('id', product.id)
            // Loại trừ những thằng đã lấy được ở trên
            .not('id', 'in', `(${similarProductsData?.map(p => p.id).join(',') || '00000000-0000-0000-0000-000000000000'})`)
            .limit(4 - (similarProductsData?.length || 0));

        if (moreProducts) {
            similarProductsData = [...(similarProductsData || []), ...moreProducts];
        }
    }

    const similarProducts = (similarProductsData as unknown as ProductDisplay[]) || [];

    return (
        <div className="bg-vinfast-gray min-h-screen pb-20">
            {/* 1. Hero Content & Basic Info */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 md:px-8 py-12 lg:py-20 lg:pt-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* LEFT: Product Image Highlight */}
                        <div className="relative bg-gray-50 rounded-3xl p-8 md:p-12 aspect-[4/3] flex items-center justify-center border border-gray-100 shadow-sm animate-fade-in group">
                            <div className="absolute top-6 left-6 z-10 bg-vinfast-blue text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md uppercase tracking-wide">
                                Chính Hãng
                            </div>
                            {product.battery_type && (
                                <div className="absolute top-6 right-6 z-10 bg-green-100 text-green-800 text-sm font-bold px-4 py-1.5 rounded-full shadow-sm uppercase tracking-wide border border-green-200">
                                    {product.battery_type}
                                </div>
                            )}
                            <div className="relative w-full h-full">
                                <Image
                                    src={imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 ease-out"
                                    unoptimized
                                    priority
                                />
                            </div>
                        </div>

                        {/* RIGHT: High-level Info & Call to Actions */}
                        <div className="flex flex-col animate-fade-in-up">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 tracking-tight">
                                {product.name}
                                {product.battery_type && <span className="text-xl md:text-2xl lg:text-3xl font-normal text-gray-500 ml-3 whitespace-nowrap">({product.battery_type})</span>}
                            </h1>
                            <div className="mb-6">
                                <div className="text-3xl lg:text-4xl font-extrabold text-vinfast-blue">
                                    {priceFormatted} <span className="text-lg lg:text-xl text-gray-500 font-medium line-through ml-2"></span>
                                </div>
                                {product.battery_type && (
                                    <div className="text-sm text-gray-500 mt-2 font-medium">
                                        (Giá áp dụng cho phiên bản {product.battery_type})
                                    </div>
                                )}
                            </div>

                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                {product.excerpt || `Trải nghiệm tương lai di chuyển thông minh cùng VinFast ${product.name}. Thiết kế đột phá, động cơ mạnh mẽ và công nghệ pin tiên tiến nhất.`}
                            </p>

                            <ul className="space-y-3 mb-8">
                                {(product.policies && Array.isArray(product.policies) && product.policies.length > 0
                                    ? product.policies
                                    : [
                                        'Bảo hành chính hãng 5 năm',
                                        'Miễn phí cứu hộ 24/7'
                                    ]
                                ).map((policy: string, index: number) => (
                                    <li key={index} className="flex items-center gap-3 text-gray-700">
                                        <div className="bg-green-100 text-green-600 rounded-full p-1"><Check size={16} strokeWidth={3} /></div>
                                        {policy}
                                    </li>
                                ))}
                            </ul>

                            {/* Core Highlight Specs Grid */}
                            <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-100 py-6">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-vinfast-blue mb-3">
                                        <Timer size={24} />
                                    </div>
                                    <span className="text-sm text-gray-500 mb-1">Quãng đường</span>
                                    <span className="font-bold text-gray-900 text-sm md:text-base">{range}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center border-l lg:border-r border-gray-100 px-2 lg:px-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-vinfast-blue mb-3">
                                        <Zap size={24} />
                                    </div>
                                    <span className="text-sm text-gray-500 mb-1">Tốc độ tối đa</span>
                                    <span className="font-bold text-gray-900 text-sm md:text-base">{speed}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center border-l lg:border-none border-gray-100">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-vinfast-blue mb-3">
                                        <Battery size={24} />
                                    </div>
                                    <span className="text-sm text-gray-500 mb-1">Công nghệ Pin</span>
                                    <span className="font-bold text-gray-900 text-sm md:text-base">{batteryInfo}</span>
                                </div>
                            </div>

                            {/* Nút Action Cao Cấp Mới */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-8 items-stretch sm:items-center">
                                {/* Nút Nhận tư vấn */}
                                <ScrollButton targetId="lead-form-section" className="flex-1 sm:flex-none justify-between items-center px-6 py-4 bg-[#00338D] text-white rounded-full font-bold text-base hover:bg-blue-800 transition-all flex group">
                                    <span className="uppercase tracking-tight">Nhận tư vấn & báo giá</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </ScrollButton>

                                {/* Nút Hotline */}
                                <a href="tel:0899001177" className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-4 border-2 border-[#00338D] text-[#00338D] rounded-full font-bold text-base hover:bg-blue-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    0899 00 11 77
                                </a>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Detailed Description & Lead Form Block */}
            <div className="container mx-auto px-4 md:px-8 mt-12 lg:mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Description */}
                    <div className="lg:col-span-2 space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-3xl font-bold text-gray-900 border-b border-gray-200 pb-4">Đánh Giá Chi Tiết {product.name}</h2>

                        {product.description ? (
                            <>
                                <div
                                    className="prose prose-blue lg:prose-xl max-w-none font-be-vietnam-pro text-gray-700 
                                            prose-p:text-justify prose-p:mb-6 prose-p:whitespace-pre-line
                                            prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-4 prose-headings:text-left
                                            prose-ul:list-outside prose-ul:list-disc prose-ul:pl-5 
                                            prose-ol:list-outside prose-ol:list-decimal prose-ol:pl-5
                                            prose-li:list-item prose-li:my-2
                                            prose-a:text-vinfast-blue 
                                            prose-img:rounded-2xl prose-img:shadow-md prose-img:my-10"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            </>
                        ) : (
                            <div className="prose prose-lg max-w-none text-gray-700">
                                <p>Đang cập nhật nội dung chi tiết cho dòng sản phẩm chuyên dụng này của VinFast. Vui lòng quay lại sau, hoặc để lại thông tin để nhận báo giá chi tiết qua điện thoại / email.</p>
                            </div>
                        )}

                    </div>

                    {/* Integrated Form Column */}
                    <div className="lg:col-span-1" id="lead-form-section">
                        <div className="sticky top-24">
                            <ProductLeadForm productName={product.name} />
                        </div>
                    </div>

                </div>
            </div>

            {/* 3. Sản Phẩm Tương Tự */}
            {similarProducts.length > 0 && (
                <div className="mt-16 md:mt-24 border-t border-gray-200 bg-white pt-12">
                    <ProductSection
                        title="Sản Phẩm Tương Tự"
                        description="Khám phá thêm các dòng xe điện khác cùng phân khúc."
                        products={similarProducts}
                        viewAllLink="/products"
                    />
                </div>
            )}

        </div>
    );
}
