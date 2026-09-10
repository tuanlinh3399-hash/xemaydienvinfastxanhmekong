import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700', '900'],
  subsets: ["vietnamese", "latin"],
  variable: "--font-be-vietnam",
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://vinfastxanhmekong.vn'),
  title: "VinFast Xanh Mekong",
  description: "Đại lý xe máy điện VinFast chính hãng hàng đầu tại khu vực.",
  icons: {
    icon: "/logo-vinfast.svg",
    shortcut: "/logo-vinfast.svg",
    apple: "/logo-vinfast.svg",
  },
  openGraph: {
    title: "VinFast Xanh Mekong",
    description: "Đại lý xe máy điện VinFast chính hãng hàng đầu tại khu vực.",
    url: '/',
    siteName: 'VinFast Xanh Mekong',
    images: [
      {
        url: '/logo-vinfast.jpg', // Path will be resolved against metadataBase
        width: 1200,
        height: 630,
        alt: 'VinFast Xanh Mekong Thumbnail',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  verification: {
    google: 'xq7mFYLB5sbbVJ0mP-CHMatuBLyg5gtPN...',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('GA4 Loaded');
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VinFast Xanh Mekong",
    "url": "https://vinfastxanhmekong.vn",
    "logo": "https://vinfastxanhmekong.vn/logo-vinfast.svg",
    "description": "Đại lý phân phối xe máy điện VinFast chính hãng hàng đầu tại Cần Thơ và Đồng bằng Sông Cửu Long.",
    "department": [
      {
        "@type": "AutoDealer",
        "name": "VinFast Xanh Mekong - Chi nhánh Hưng Phú",
        "telephone": "0899001177",
        "url": "https://vinfastxanhmekong.vn/?branch=hung-phu",
        "image": "https://vinfastxanhmekong.vn/logo-vinfast.jpg",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Số 10362, đường Võ Nguyên Giáp, P. Hưng Phú, Q. Cái Răng",
          "addressLocality": "Cần Thơ",
          "addressRegion": "Cần Thơ",
          "postalCode": "900000",
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
      },
      {
        "@type": "AutoDealer",
        "name": "VinFast Xanh Mekong - Chi nhánh Bình Thủy",
        "telephone": "0899001177",
        "url": "https://vinfastxanhmekong.vn/?branch=binh-thuy",
        "image": "https://vinfastxanhmekong.vn/logo-vinfast.jpg",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Đường Cách Mạng Tháng 8, P. Bùi Hữu Nghĩa, Q. Bình Thủy",
          "addressLocality": "Cần Thơ",
          "addressRegion": "Cần Thơ",
          "postalCode": "900000",
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
      }
    ]
  };

  return (
    <html lang="vi">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body
        className={`${beVietnamPro.variable} font-sans antialiased bg-vinfast-gray text-gray-900`}
      >
        {children}
      </body>
      <GoogleAnalytics gaId="G-GDR0TD5D1X" />
    </html>
  );
}
