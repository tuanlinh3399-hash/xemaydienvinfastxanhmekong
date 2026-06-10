import { supabase } from "@/lib/supabase";
import ProductFilterGrid from "@/components/client/product-filter-grid";
import { ProductDisplay } from "@/components/client/product-card";
import ProductSection from "@/components/client/product-section";
import Image from "next/image";

// Khắc phục Cache cho Next.js 14 server components
export const revalidate = 60;

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Resolve search params
    const resolvedSearchParams = await searchParams;
    const searchQuery = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : '';

    // Fetch top Bestseller Products (Server-side)
    const productSelectQuery = `
        id, name, slug, price_from, specs, battery_type, category,
        media!thumbnail_id(url)
    `;

    // Fetch bestsellers
    const { data: bestsellerProducts } = await supabase
        .from("products")
        .select(productSelectQuery)
        .eq("is_bestseller", true)
        .limit(10);

    // Fetch initial searched products based on URL
    let initialProductsQuery = supabase
        .from('products')
        .select(productSelectQuery)
        .order('price_from', { ascending: true });

    if (searchQuery) {
        initialProductsQuery = initialProductsQuery.ilike('name', `%${searchQuery}%`);
    }

    const { data: initialProductsData } = await initialProductsQuery;
    const initialProducts = (initialProductsData as unknown as ProductDisplay[]) || [];

    return (
        <div className="bg-vinfast-gray min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative h-[400px] md:h-[500px] w-full mb-12 flex items-center justify-center">
                {/* Background Image Options: /images/hero-bg.jpg or a placeholder if needed. */}
                <Image
                    src="/images/slides/slide-banner-1.webp" // Using an existing attractive slide image from previous work usually works best.
                    alt="VinFast Electric Bikes Hero"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/50"></div> {/* Dark overlay for text readability */}

                <div className="relative z-10 container mx-auto px-4 md:px-8 text-center md:text-left pt-16">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-md max-w-4xl">
                        Khám Phá Dòng Xe Máy Điện VinFast Thế Hệ Mới
                    </h1>
                    <p className="text-gray-200 text-lg md:text-xl max-w-2xl leading-relaxed drop-shadow-sm">
                        Đa dạng phân khúc từ thanh lịch, nhỏ gọn đến thể thao, tốc độ. Sẵn sàng cùng bạn chinh phục mọi cung đường Tây Đô.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8">
                {/* Bestseller Section (4 items) */}
                {bestsellerProducts && bestsellerProducts.length > 0 && (
                    <div className="mb-16">
                        <ProductSection
                            title="Dòng Xe Bán Chạy"
                            description="Những mẫu xe được khách hàng Cần Thơ yêu thích và lựa chọn nhiều nhất."
                            products={bestsellerProducts as unknown as ProductDisplay[]}
                            viewAllLink="#all-products"
                        />
                    </div>
                )}

                {/* Main Filter Grid Section (Client-side fetches everything else with Skeleton) */}
                <div id="all-products" className="pt-4 scroll-mt-24">
                    <ProductFilterGrid initialProducts={initialProducts} />
                </div>
            </div>
        </div>
    );
}
