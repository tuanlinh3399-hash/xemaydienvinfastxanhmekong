import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface ProductDisplay {
    id: string;
    name: string;
    slug: string;
    price_from: number | null;
    sale_price: number | null;
    battery_type?: string;
    category?: string;
    specs: {
        range?: string;
        speed?: string;
        battery?: string;
    } | null;
    media: { url: string } | null;
}

interface ProductCardProps {
    product: ProductDisplay;
}

export default function ProductCard({ product }: ProductCardProps) {
    let imageUrl = product.media?.url || `/images/products/${product.slug}.webp`;
    if (imageUrl.startsWith('/') && !imageUrl.startsWith('/images/products/')) {
        imageUrl = `/images/products/${imageUrl.split('/').pop()}`;
    }

    const priceFormatted = product.price_from
        ? new Intl.NumberFormat('vi-VN').format(product.price_from) + ' VNĐ'
        : 'Liên hệ';

    const range = product.specs?.range || "Đang cập nhật";
    const speed = product.specs?.speed || "Đang cập nhật";
    const battery = product.specs?.battery || "";

    return (
        <Link href={`/products/${product.slug}`} className="block h-full cursor-pointer group">
            <div className="bg-white h-full rounded-2xl overflow-hidden shadow-md group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300 flex flex-col border border-gray-100">
                <div className="relative h-56 md:h-64 w-full bg-vinfast-gray flex items-center justify-center p-6">
                    {product.battery_type && (
                        <span className="absolute top-4 right-4 z-10 bg-green-100 text-green-800 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm bg-opacity-90 border border-green-200 uppercase tracking-wider">
                            {product.battery_type}
                        </span>
                    )}
                    <div className="relative w-full h-full">
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                        />
                    </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <div
                        className="text-xs md:text-sm text-vinfast-blue font-semibold mb-2 uppercase tracking-wide"
                        style={{ fontFamily: 'var(--font-be-vietnam)' }}
                    >
                        Quãng đường: {range}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 group-hover:text-vinfast-blue transition-colors">
                        {product.name}
                        {product.battery_type && <span className="text-sm md:text-base font-normal text-gray-500 ml-1.5 whitespace-nowrap">({product.battery_type})</span>}
                    </h3>
                    <p
                        className="text-sm md:text-base text-gray-500 mb-6 flex-grow line-clamp-2"
                        style={{ fontFamily: 'var(--font-be-vietnam)' }}
                    >
                        Tốc độ tối đa {speed}, {battery}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <div className="flex flex-col justify-center">
                            {product.sale_price && product.sale_price > 0 && product.price_from && product.sale_price < product.price_from ? (
                                <>
                                    <span className="text-xs md:text-sm text-gray-400 line-through mb-0.5">
                                        {new Intl.NumberFormat('vi-VN').format(product.price_from)} ₫
                                    </span>
                                    <span className="text-base md:text-lg font-bold text-vinfast-blue">
                                        {new Intl.NumberFormat('vi-VN').format(product.sale_price)} ₫
                                    </span>
                                </>
                            ) : (
                                <span className="text-base md:text-lg font-bold text-vinfast-blue">
                                    {product.price_from ? new Intl.NumberFormat('vi-VN').format(product.price_from) + ' ₫' : 'Liên hệ'}
                                </span>
                            )}
                        </div>
                        <div className="text-white bg-vinfast-blue px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl flex items-center gap-2 font-bold group-hover:bg-blue-800 transition-colors text-xs md:text-sm shadow-md group-hover:shadow-lg whitespace-nowrap">
                            Chi tiết <ArrowRight size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
