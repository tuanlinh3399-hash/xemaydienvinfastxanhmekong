-- ==============================================================================
-- MIGRATION: CẤU HÌNH ĐA CHI NHÁNH CHO SITE_SETTINGS (HƯNG PHÚ & BÌNH THỦY)
-- Hướng dẫn: Mở Supabase Dashboard -> Chọn Project -> SQL Editor -> Dán đoạn mã này và bấm "Run".
-- ==============================================================================

-- 1. Xóa ràng buộc ép id = 1 (nếu có) để cho phép lưu nhiều dòng chi nhánh
ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_id_check;

-- 2. Thêm cột branch_slug để định danh từng chi nhánh
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS branch_slug VARCHAR(50) DEFAULT 'hung-phu';

-- 3. Tạo ràng buộc UNIQUE cho branch_slug để hỗ trợ upsert theo định danh chi nhánh
ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_branch_slug_key;
ALTER TABLE site_settings ADD CONSTRAINT site_settings_branch_slug_key UNIQUE (branch_slug);

-- 4. Gán record hiện tại (id = 1) thành chi nhánh Hưng Phú
UPDATE site_settings 
SET branch_slug = 'hung-phu' 
WHERE id = 1 OR branch_slug IS NULL;

-- 5. Khởi tạo dữ liệu mặc định cho chi nhánh Bình Thủy nếu chưa tồn tại
INSERT INTO site_settings (branch_slug, phone, email, address, google_maps_link, updated_at)
VALUES (
    'binh-thuy',
    '0899 00 11 77',
    'cskh@vinfastxanhmekong.vn',
    'Đường Cách Mạng Tháng 8, P. Bùi Hữu Nghĩa, Q. Bình Thủy, TP. Cần Thơ',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.5283437149023!2d105.74834887588383!3d10.055743972076043!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0880327f30089%3A0x6a1a1c97a9fdfc43!2zQsOsbmggVGjhu6d5LCBD4bqnbiBUaMahLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
    NOW()
)
ON CONFLICT (branch_slug) DO NOTHING;
