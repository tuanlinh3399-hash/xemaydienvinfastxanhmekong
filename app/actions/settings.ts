'use server';

import { createClient } from '@/lib/supabase-server';
import { verifyToken } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { BRANCHES, DEFAULT_BRANCH_ID, getBranch, BranchInfo } from '@/lib/branches';

export interface SiteSettingsData {
    id?: number;
    branch_slug?: string;
    phone: string;
    email: string;
    address: string;
    google_maps_link: string;
    map_url?: string;
    fanpage_url?: string;
    updated_at?: string;
}

/**
 * Trích xuất URL sạch từ chuỗi nhúng iframe của Google Maps (nếu người dùng dán cả thẻ <iframe>)
 */
function cleanMapUrl(rawUrl?: string): string {
    if (!rawUrl) return '';
    const trimmed = rawUrl.trim();
    if (trimmed.includes('<iframe')) {
        const match = trimmed.match(/src="([^"]+)"/i);
        if (match && match[1]) {
            return match[1];
        }
    }
    return trimmed;
}

/**
 * Lấy cấu hình website theo chi nhánh từ Supabase Database.
 * Nếu chưa chạy migration hoặc chưa có dữ liệu, tự động fallback về cấu hình mặc định trong lib/branches.ts.
 */
export async function getSettings(branchSlug: string = DEFAULT_BRANCH_ID): Promise<SiteSettingsData> {
    const slug = branchSlug.trim().toLowerCase() || DEFAULT_BRANCH_ID;
    const branchDefault = getBranch(slug);

    try {
        const supabase = await createClient();

        // 1. Thử truy vấn theo branch_slug
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('branch_slug', slug)
            .maybeSingle();

        if (!error && data) {
            return {
                id: data.id,
                branch_slug: data.branch_slug || slug,
                phone: data.phone || branchDefault.hotline,
                email: data.email || branchDefault.email || 'cskh@vinfastxanhmekong.vn',
                address: data.address || branchDefault.address,
                google_maps_link: data.google_maps_link || branchDefault.mapEmbedUrl,
                map_url: data.map_url || branchDefault.mapShareUrl,
                fanpage_url: data.fanpage_url || '',
                updated_at: data.updated_at
            };
        }

        // 2. Nếu cột branch_slug chưa tồn tại (error 42703) hoặc chưa có record:
        // Với Hưng Phú (mặc định), lấy record id = 1
        if (slug === DEFAULT_BRANCH_ID || slug === 'hung-phu') {
            const { data: legacyData } = await supabase
                .from('site_settings')
                .select('*')
                .eq('id', 1)
                .maybeSingle();

            if (legacyData) {
                return {
                    id: legacyData.id,
                    branch_slug: 'hung-phu',
                    phone: legacyData.phone || branchDefault.hotline,
                    email: legacyData.email || 'cskh@vinfastxanhmekong.vn',
                    address: legacyData.address || branchDefault.address,
                    google_maps_link: legacyData.google_maps_link || branchDefault.mapEmbedUrl,
                    map_url: legacyData.map_url || branchDefault.mapShareUrl,
                    fanpage_url: legacyData.fanpage_url || '',
                    updated_at: legacyData.updated_at
                };
            }
        }

        // 3. Fallback về cấu hình định sẵn nếu bảng trống hoặc cho chi nhánh mới
        return {
            branch_slug: slug,
            phone: branchDefault.hotline,
            email: branchDefault.email || 'cskh@vinfastxanhmekong.vn',
            address: branchDefault.address,
            google_maps_link: branchDefault.mapEmbedUrl,
            map_url: branchDefault.mapShareUrl,
            fanpage_url: ''
        };
    } catch (err) {
        console.error(`[getSettings] Lỗi khi lấy settings cho chi nhánh ${slug}:`, err);
        return {
            branch_slug: slug,
            phone: branchDefault.hotline,
            email: branchDefault.email || 'cskh@vinfastxanhmekong.vn',
            address: branchDefault.address,
            google_maps_link: branchDefault.mapEmbedUrl,
            map_url: branchDefault.mapShareUrl,
            fanpage_url: ''
        };
    }
}

/**
 * Cập nhật cấu hình website cho chi nhánh chỉ định.
 */
export async function updateSettings(
    branchSlug: string,
    payload: {
        phone?: string;
        email?: string;
        address?: string;
        google_maps_link?: string;
        map_url?: string;
        fanpage_url?: string;
    }
) {
    const slug = branchSlug.trim().toLowerCase() || DEFAULT_BRANCH_ID;

    try {
        const supabase = await createClient();

        // Kiểm tra quyền Admin (qua Supabase Auth hoặc admin_session cookie)
        const { data: { user } } = await supabase.auth.getUser();
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_session')?.value;
        const isValidCustomToken = await verifyToken(token);

        if (!user && !isValidCustomToken) {
            return { success: false, error: 'Bạn không có quyền thực hiện hành động này.' };
        }

        const cleanedMap = cleanMapUrl(payload.google_maps_link);
        const updateData: Record<string, any> = {
            phone: payload.phone?.trim() || '',
            email: payload.email?.trim() || '',
            address: payload.address?.trim() || '',
            google_maps_link: cleanedMap,
            map_url: payload.map_url?.trim() || '',
            fanpage_url: payload.fanpage_url?.trim() || '',
            updated_at: new Date().toISOString()
        };

        // 1. Thử cập nhật theo branch_slug (hỗ trợ sau khi chạy migration)
        const { data: upsertData, error: upsertError } = await supabase
            .from('site_settings')
            .upsert({
                branch_slug: slug,
                ...updateData
            }, {
                onConflict: 'branch_slug'
            })
            .select()
            .maybeSingle();

        if (!upsertError && upsertData) {
            revalidatePath('/');
            revalidatePath('/admin/settings');
            return { success: true, data: upsertData };
        }

        // 2. Nếu lỗi cột branch_slug chưa tồn tại (error 42703) hoặc lỗi ràng buộc id check (23514):
        if (upsertError) {
            // Nếu lưu cho Hưng Phú, lưu vào id = 1
            if (slug === DEFAULT_BRANCH_ID || slug === 'hung-phu') {
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('site_settings')
                    .upsert({
                        id: 1,
                        ...updateData
                    })
                    .select()
                    .single();

                if (!fallbackError) {
                    revalidatePath('/');
                    revalidatePath('/admin/settings');
                    return { success: true, data: fallbackData };
                }
                return { success: false, error: fallbackError.message };
            } else {
                // Đối với Bình Thủy khi chưa chạy migration
                return {
                    success: false,
                    needMigration: true,
                    error: 'Bảng site_settings chưa có cột branch_slug để lưu chi nhánh mới. Vui lòng mở Supabase SQL Editor và chạy file supabase_migration_multi_branch_settings.sql.'
                };
            }
        }

        revalidatePath('/');
        revalidatePath('/admin/settings');
        return { success: true, data: upsertData };
    } catch (err: any) {
        console.error(`[updateSettings] Lỗi khi cập nhật settings cho ${slug}:`, err);
        return { success: false, error: err?.message || 'Có lỗi bất ngờ xảy ra.' };
    }
}
