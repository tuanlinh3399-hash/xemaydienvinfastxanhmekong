'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight, Tag } from 'lucide-react';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    category: string;
    created_at: string;
    media: { url: string } | null;
}

interface BlogFilterGridProps {
    initialPosts: BlogPost[];
}

const CATEGORIES = ['Tất cả', 'Tin tức VinFast', 'Sự kiện Showroom', 'Hướng dẫn sử dụng xe'];

export default function BlogFilterGrid({ initialPosts }: BlogFilterGridProps) {
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    // Filter Logic
    const filteredPosts = initialPosts.filter(post => {
        if (activeCategory === 'Tất cả') return true;
        return post.category === activeCategory;
    });

    const hasFeatured = filteredPosts.length > 0 && activeCategory === 'Tất cả';
    const featuredPost = hasFeatured ? filteredPosts[0] : null;
    const gridPosts = hasFeatured ? filteredPosts.slice(1) : filteredPosts;

    return (
        <div className="space-y-12">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-3">
                {CATEGORIES.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-sm border ${activeCategory === category
                            ? 'bg-vinfast-blue text-white border-vinfast-blue scale-105'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-vinfast-blue hover:text-vinfast-blue hover:shadow-md'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Tag size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có bài viết nào</h3>
                    <p className="text-gray-500">Nội dung cho chuyên mục này đang được cập nhật.</p>
                </div>
            ) : (
                <>
                    {/* Featured Hero Post */}
                    {featuredPost && (
                        <div className="flex flex-col lg:flex-row bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 max-w-7xl m-auto group animate-fade-in relative z-10 mb-12">
                            {/* Cột trái: Hình ảnh */}
                            <div className="relative w-full lg:w-[55%] aspect-[1200/630] shrink-0 bg-gray-100 overflow-hidden">
                                <Image
                                    src={featuredPost.media?.url || '/images/placeholder.webp'}
                                    alt={featuredPost.title}
                                    fill
                                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 55vw"
                                    unoptimized={!featuredPost.media?.url?.includes('unsplash')}
                                    priority
                                />
                                <div className="absolute top-4 left-4 bg-vinfast-blue text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md uppercase tracking-wider">
                                    Bài Viết Mới Nhất
                                </div>
                            </div>

                            {/* Cột phải: Nội dung */}
                            <div className="relative w-full lg:w-[45%]">
                                <div className="flex flex-col justify-between p-5 lg:absolute lg:inset-0 lg:p-6 lg:overflow-hidden h-full">
                                    <div>
                                        <div className="flex items-center gap-4 text-vinfast-blue font-semibold text-xs lg:text-sm mb-2 lg:mb-3">
                                            <span className="bg-blue-50 px-3 py-1 rounded-md">{featuredPost.category}</span>
                                            <span className="flex items-center gap-1 text-gray-500">
                                                <Calendar size={14} className="mb-0.5" /> {new Date(featuredPost.created_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 group-hover:text-vinfast-blue transition-colors leading-tight lg:leading-snug line-clamp-2">
                                            <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                                        </h2>
                                        <p className="line-clamp-3 xl:line-clamp-4 text-sm lg:text-base xl:text-lg leading-snug text-gray-600 mt-2 lg:mt-3" title={featuredPost.excerpt}>
                                            {featuredPost.excerpt}
                                        </p>
                                    </div>
                                    <div className="mt-4 lg:mt-0">
                                        <Link
                                            href={`/blog/${featuredPost.slug}`}
                                            className="inline-flex items-center gap-2 bg-vinfast-blue text-white rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg hover:shadow-xl text-xs lg:text-sm px-4 py-2 lg:px-6 lg:py-3"
                                        >
                                            Đọc Tiếp <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Standard Grid Layout */}
                    {gridPosts.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl m-auto">
                            {gridPosts.map((post) => (
                                <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col border border-gray-100">
                                    <div className="relative w-full aspect-[1200/630] overflow-hidden rounded-t-2xl">
                                        <Image
                                            src={post.media?.url || '/images/placeholder.webp'}
                                            alt={post.title}
                                            fill
                                            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            unoptimized={!post.media?.url?.includes('unsplash')}
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-vinfast-blue border border-blue-100 px-3 py-1 rounded-md text-xs font-bold shadow-sm">
                                            {post.category}
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                            <Calendar size={14} className="shrink-0" />
                                            {new Date(post.created_at).toLocaleDateString('vi-VN')}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-vinfast-blue transition-colors line-clamp-2 leading-tight">
                                            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                        </h3>
                                        <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed flex-grow">
                                            {post.excerpt}
                                        </p>
                                        <div className="pt-4 border-t border-gray-100 mt-auto">
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="inline-flex items-center gap-2 text-vinfast-blue font-bold hover:text-blue-800 transition-colors"
                                            >
                                                Đọc Tiếp <ArrowRight size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
