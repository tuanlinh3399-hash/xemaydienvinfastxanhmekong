import Header from '@/components/client/header';
import Footer from '@/components/client/footer';
import ChatWidget from '@/components/ChatWidget';
import StickyContact from '@/components/client/sticky-cta';
import { SiteSettingsProvider } from '@/components/client/SiteSettingsProvider';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SiteSettingsProvider>
            {/* LocalBusiness Schema for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "LocalBusiness",
                        "name": "VinFast Xanh Mekong",
                        "description": "Đại lý xe máy điện VinFast chính hãng tại Cần Thơ. Chuyên cung cấp các dòng xe điện Evo 200, Feliz S, Klara S, Vento S, Theon S.",
                        "url": "https://vinfastxanhmekong.com",
                        "telephone": "0899001177",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Số 10362, đường Võ Nguyên Giáp, P.Hưng Phú",
                            "addressLocality": "Cần Thơ",
                            "addressCountry": "VN"
                        },
                        "openingHoursSpecification": {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": [
                                "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
                            ],
                            "opens": "08:00",
                            "closes": "20:00"
                        }
                    })
                }}
            />
            <div className="flex min-h-screen flex-col bg-vinfast-white">
                <Header />
                {/* 
            Main content wrapper with pb-16 to ensure bottom content 
            isn't hidden by the sticky CTA on mobile devices.
          */}
                <main className="flex-1 pb-16 md:pb-0">
                    {children}
                </main>
                <Footer />
                <StickyContact />
                <ChatWidget />
            </div>
        </SiteSettingsProvider>
    );
}
