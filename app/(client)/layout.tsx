import Header from '@/components/client/header';
import Footer from '@/components/client/footer';
import ChatWidget from '@/components/ChatWidget';
import StickyContact from '@/components/client/sticky-cta';
import { SiteSettingsProvider } from '@/components/client/SiteSettingsProvider';
import { BranchProvider } from '@/components/client/BranchProvider';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <BranchProvider>
            <SiteSettingsProvider>
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
        </BranchProvider>
    );
}
