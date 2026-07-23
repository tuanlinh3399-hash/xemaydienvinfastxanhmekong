import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Battery } from "lucide-react";
import LeadForm from "@/components/client/lead-form";
import { supabase } from "@/lib/supabase";
import ProductSection from "@/components/client/product-section";
import { ProductDisplay } from "@/components/client/product-card";
import HeroBanner, { type PromotionSlide } from "@/components/client/hero-banner";

// Khắc phục Cache cho Next.js 14 server components nếu cần
export const revalidate = 60;

export default async function Home() {
  // Common select query for products
  const productSelectQuery = `
      id, name, slug, price_from, sale_price, specs, battery_type, category,
      media!thumbnail_id(url)
  `;

  // Fetch categorized products concurrently with Promise.all
  const [
    { data: featuredProductsData },
    { data: bestsellerProductsData },
    { data: newProductsData },
  ] = await Promise.all([
    supabase
      .from("products")
      .select(productSelectQuery)
      .eq("is_featured", true)
      .limit(10),
    supabase
      .from("products")
      .select(productSelectQuery)
      .eq("is_bestseller", true)
      .limit(10),
    supabase
      .from("products")
      .select(productSelectQuery)
      .eq("is_new", true)
      .limit(10),
  ]);

  const featuredProducts =
    (featuredProductsData as unknown as ProductDisplay[]) || [];
  const bestsellerProducts =
    (bestsellerProductsData as unknown as ProductDisplay[]) || [];
  let discoverProducts = (newProductsData as unknown as ProductDisplay[]) || [];

  // Fallback map cho "Khám phá" nếu không có xe "is_new"
  if (discoverProducts.length === 0) {
    const { data: fallbackProducts } = await supabase
      .from("products")
      .select(productSelectQuery)
      .order("created_at", { ascending: false })
      .limit(10);
    discoverProducts = (fallbackProducts as unknown as ProductDisplay[]) || [];
  }

  // Fetch Promotions with Desktop & Mobile images (join alias)
  const { data: promotions } = await supabase
    .from("promotions")
    .select(
      "*, desktop_image:media!banner_media_id(*), mobile_image:media!mobile_media_id(*)",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(5);

  const activePromotions = (promotions as unknown as PromotionSlide[]) || [];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Banner Carousel */}
      <HeroBanner promotions={activePromotions} />

      {/* Product Sections */}
      <div className="bg-vinfast-gray pt-10 pb-10">
        <ProductSection
          title="Sản Phẩm Nổi Bật"
          description="Những mẫu xe điện đột phá, dẫn đầu xu hướng công nghệ."
          products={featuredProducts}
          viewAllLink="/products"
        />

        <ProductSection
          title="Xe Bán Chạy"
          description="Các dòng xe được khách hàng Cần Thơ tin dùng nhất."
          products={bestsellerProducts}
          viewAllLink="/products"
        />

        <ProductSection
          title="Khám Phá Mẫu Xe Mới"
          description="Trải nghiệm thế hệ xe máy điện thông minh mới nhất."
          products={discoverProducts}
          viewAllLink="/products"
        />
      </div>

      {/* Highlights / Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Công Nghệ Đột Phá
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Hệ sinh thái toàn diện mang lại trải nghiệm tiện nghi và an toàn
              tuyệt đối trên mọi hành trình.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="block bg-vinfast-gray rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-vinfast-blue/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Battery className="text-vinfast-blue" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Pin LFP Vượt Trội
              </h3>
              <p className="text-gray-600">
                Quãng đường di chuyển ấn tượng lên đến 200km sau một lần sạc
                đầy, công nghệ pin an toàn.
              </p>
            </div>
            <div className="block bg-vinfast-gray rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-vinfast-blue/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Shield className="text-vinfast-blue" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                An Toàn Chuẩn Âu
              </h3>
              <p className="text-gray-600">
                Hệ thống phanh ABS cùng khung gầm chịu lực tiêu chuẩn châu Âu
                bảo vệ bạn an toàn trong mọi tình huống.
              </p>
            </div>
            <div className="block bg-vinfast-gray rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-vinfast-blue/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Zap className="text-vinfast-blue" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Động Cơ Mạnh Mẽ
              </h3>
              <p className="text-gray-600">
                Khả năng bứt tốc vượt trội nhờ khối động cơ công suất lớn, vận
                hành êm ái, thách thức địa hình.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Lead Form Subsystem Registration */}
      <LeadForm />
    </div>
  );
}
