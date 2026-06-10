# Xây Dựng Lại Luồng Quản Lý & Hiển Thị Khuyến Mãi (Hero Banner)

Làm lại toàn bộ luồng tính năng Promotions: Admin CRUD với 2 ảnh Desktop/Mobile, và Hero Banner responsive trên trang chủ.

## Proposed Changes

### Component 1: Upload API Enhancement

#### [MODIFY] [route.ts](file:///d:/dev/VF%20Xanh%20Mekong/VF_v1.3/app/api/upload/route.ts)

Hiện tại API upload hardcode folder `products/`. Cần sửa để nhận param `folder` từ FormData, mặc định vẫn là `products` nếu không truyền.

```diff
- const filePath = `products/${finalFileName}`;
+ const folder = (formData.get('folder') as string) || 'products';
+ const filePath = `${folder}/${finalFileName}`;
```

---

### Component 2: Admin Promotions Page (MỚI)

#### [NEW] [page.tsx](file:///d:/dev/VF%20Xanh%20Mekong/VF_v1.3/app/(admin)/admin/promotions/page.tsx)

Trang quản lý CRUD khuyến mãi hoàn chỉnh, theo đúng cấu trúc đã có ở `admin/products/page.tsx`.

**Kiến trúc:**
- `'use client'` component
- State management: danh sách promotions, pagination, modal form, notification
- Fetch dùng Supabase join alias: `.select('*, desktop_image:media!banner_media_id(*), mobile_image:media!mobile_media_id(*)')`

**Form Thêm/Sửa bao gồm:**
| Field | Type | Bắt buộc |
|---|---|---|
| Tiêu đề (title) | text input | ✅ |
| Slug | text input (auto-gen từ title) | ✅ |
| Mô tả (description) | RichTextEditor | ❌ |
| Ảnh Desktop (banner_media_id) | file upload + preview | ✅ |
| Ảnh Mobile (mobile_media_id) | file upload + preview | ❌ |
| Ngày bắt đầu (start_date) | date input | ✅ |
| Ngày kết thúc (end_date) | date input | ✅ |
| Đang hoạt động (is_active) | toggle switch | ✅ |

**Logic Upload & Lưu:**
1. Upload ảnh Desktop lên Storage (`promotions/`) → Insert bảng `media` → Lấy `id` → Gán vào `banner_media_id`
2. Upload ảnh Mobile lên Storage (`promotions/`) (nếu có) → Insert bảng `media` → Lấy `id` → Gán vào `mobile_media_id`
3. Upsert dữ liệu text + 2 media ID vào bảng `promotions`

**Danh sách hiển thị:**
- Bảng có cột: Thumbnail (ảnh desktop), Tiêu đề, Trạng thái (Active/Inactive), Thời gian, Thao tác (Sửa/Xóa)
- Pagination giống products (8 items/page)
- Bulk actions: xóa nhiều, bật/tắt active

---

### Component 3: Admin Sidebar Navigation

#### [MODIFY] [layout.tsx](file:///d:/dev/VF%20Xanh%20Mekong/VF_v1.3/app/(admin)/layout.tsx)

Thêm link "Khuyến mãi" vào sidebar admin, đặt sau "Sản phẩm":

```diff
  <Link href="/admin/products" className="block px-4 py-2 hover:bg-blue-800 rounded">
      Sản phẩm
  </Link>
+ <Link href="/admin/promotions" className="block px-4 py-2 hover:bg-blue-800 rounded">
+     Khuyến mãi
+ </Link>
```

---

### Component 4: Hero Banner Component (MỚI)

#### [NEW] [hero-banner.tsx](file:///d:/dev/VF%20Xanh%20Mekong/VF_v1.3/components/client/hero-banner.tsx)

Component Client riêng biệt hiển thị Hero Banner carousel responsive.

**Data Flow:**
- Nhận props `promotions` đã được fetch từ server component (trang chủ)
- Mỗi promotion có `desktop_image` và `mobile_image` (từ join alias)

**Render Logic mỗi slide:**
```tsx
{/* Ảnh Desktop - ẩn trên mobile */}
<Image src={promo.desktop_image?.url} className="hidden md:block w-full h-auto object-cover" />

{/* Ảnh Mobile - ẩn trên desktop, fallback sang desktop_image nếu không có */}
<Image src={promo.mobile_image?.url || promo.desktop_image?.url} className="block md:hidden w-full h-auto object-cover" />
```

**CTA Buttons positioning:**
- **Desktop (md+):** `absolute` overlay, góc dưới bên phải ảnh
- **Mobile (<md):** `relative`, `flex justify-center`, nằm ngay dưới ảnh dọc, không đè lên hình

**Carousel features:**
- Auto-play (5s interval)
- Dot indicators
- Swipe support (CSS/JS)
- Smooth fade/slide transition

---

### Component 5: Home Page Integration

#### [MODIFY] [page.tsx](file:///d:/dev/VF%20Xanh%20Mekong/VF_v1.3/app/(client)/(home)/page.tsx)

**Fetch Data cập nhật:**
```diff
- .select(`id, title, slug, description, media!banner_media_id(url)`)
+ .select('*, desktop_image:media!banner_media_id(*), mobile_image:media!mobile_media_id(*)')
```

**Thay thế Hero Banner section hiện tại** (lines 83-117) bằng component `<HeroBanner>`:
```tsx
import HeroBanner from '@/components/client/hero-banner';

// Trong render:
<HeroBanner promotions={activePromotions} />
```

Giữ nguyên phần Promotions cards section phía dưới (lines 196-250), chỉ cập nhật query alias cho phần đó.

---

## Verification Plan

### Automated Tests
- Build project (`npm run build`) để kiểm tra TypeScript errors
- Dev server (`npm run dev`) để kiểm tra runtime

### Manual Verification (Browser)
1. **Admin Promotions CRUD:**
   - Truy cập `/admin/promotions` → Thấy danh sách trống/có data
   - Nhấn "Thêm mới" → Form hiện với 2 input upload ảnh
   - Upload Desktop + Mobile image → Submit → Verify data trong bảng
   - Edit một promotion → Thay đổi ảnh → Save → Verify cập nhật
   - Xóa promotion → Confirm → Verify removed

2. **Hero Banner Client:**
   - Truy cập trang chủ `/` → Verify banner hiển thị đúng ảnh desktop
   - Resize browser < 768px → Verify ảnh đổi sang mobile version
   - CTA buttons đúng vị trí: absolute trên desktop, dưới ảnh trên mobile
   - Carousel auto-play và dot navigation hoạt động
