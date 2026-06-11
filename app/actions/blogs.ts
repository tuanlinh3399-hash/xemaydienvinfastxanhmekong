'use server';

import { createClient } from '@/lib/supabase-server';
import { BlogFormData } from '@/components/admin/BlogForm';
import { revalidatePath } from 'next/cache';

// Helper để khởi tạo Supabase Server Client (sử dụng cookies)
async function getSupabase() {
    return await createClient();
}

/**
 * Lưu bài viết (Tạo mới hoặc Cập nhật)
 * @param formData Dữ liệu bài viết từ form
 * @param id ID của bài viết (nếu cập nhật)
 */
export async function saveBlog(formData: BlogFormData, id?: string) {
    try {
        const supabase = await getSupabase();
        
        // Destructure để loại bỏ thuộc tính id (nếu có lẫn vào formData từ client)
        const { id: rawId, ...cleanData } = formData as any;

        if (id && id.trim() !== '') {
            // Trường hợp CẬP NHẬT (UPDATE)
            const payload = {
                title: cleanData.title,
                slug: cleanData.slug,
                category: cleanData.category,
                excerpt: cleanData.excerpt,
                content: cleanData.content,
                thumbnail_url: cleanData.thumbnail_url,
                meta_title: cleanData.meta_title,
                meta_description: cleanData.meta_description,
                meta_keywords: cleanData.meta_keywords,
                is_published: cleanData.is_published,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('blogs')
                .update(payload)
                .eq('id', id)
                .select();
                
            if (error) {
                console.error('Lỗi khi cập nhật blog:', error);
                return { success: false, code: error.code, error: error.message };
            }
            
            // Revalidate cache cho cả trang client chi tiết, trang danh sách và trang quản lý
            revalidatePath(`/blog/${cleanData.slug}`);
            revalidatePath('/blog');
            revalidatePath('/admin/blogs');
            return { success: true, data };
        } else {
            // Trường hợp TẠO MỚI (CREATE)
            const payload = {
                title: cleanData.title,
                slug: cleanData.slug,
                category: cleanData.category,
                excerpt: cleanData.excerpt,
                content: cleanData.content,
                thumbnail_url: cleanData.thumbnail_url,
                meta_title: cleanData.meta_title,
                meta_description: cleanData.meta_description,
                meta_keywords: cleanData.meta_keywords,
                is_published: cleanData.is_published,
            };

            // Đảm bảo không có bất kỳ thuộc tính id nào trong payload gửi lên Supabase
            if ('id' in payload) {
                delete (payload as any).id;
            }

            const { data, error } = await supabase
                .from('blogs')
                .insert(payload)
                .select();
                
            if (error) {
                console.error('Lỗi khi thêm mới blog:', error);
                return { success: false, code: error.code, error: error.message };
            }
            
            revalidatePath('/blog');
            revalidatePath('/admin/blogs');
            return { success: true, data };
        }
    } catch (err: any) {
        console.error('Lỗi hệ thống action saveBlog:', err);
        return { success: false, error: err.message || 'Lỗi hệ thống khi lưu bài viết' };
    }
}

/**
 * Thay đổi trạng thái hiển thị của bài viết (Xuất bản / Tạm ẩn)
 * @param id ID bài viết
 * @param is_published Trạng thái hiển thị mới
 */
export async function toggleBlogPublishStatus(id: string, is_published: boolean) {
    try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
            .from('blogs')
            .update({ 
                is_published, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', id)
            .select('slug')
            .single();
            
        if (error) {
            console.error('Lỗi togglePublishStatus:', error);
            return { success: false, error: error.message };
        }

        // Revalidate cache
        if (data?.slug) {
            revalidatePath(`/blog/${data.slug}`);
        }
        revalidatePath('/blog');
        revalidatePath('/admin/blogs');
        return { success: true, data };
    } catch (err: any) {
        console.error('Lỗi hệ thống action toggleBlogPublishStatus:', err);
        return { success: false, error: err.message || 'Lỗi hệ thống khi cập nhật trạng thái hiển thị' };
    }
}

/**
 * Xóa bài viết vĩnh viễn khỏi Database
 * @param id ID bài viết
 */
export async function deleteBlog(id: string) {
    try {
        const supabase = await getSupabase();
        
        // Lấy slug trước để clear cache
        const { data: blogData } = await supabase
            .from('blogs')
            .select('slug')
            .eq('id', id)
            .single();

        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', id);
            
        if (error) {
            console.error('Lỗi khi xóa blog:', error);
            return { success: false, error: error.message };
        }

        // Revalidate cache
        if (blogData?.slug) {
            revalidatePath(`/blog/${blogData.slug}`);
        }
        revalidatePath('/blog');
        revalidatePath('/admin/blogs');
        return { success: true };
    } catch (err: any) {
        console.error('Lỗi hệ thống action deleteBlog:', err);
        return { success: false, error: err.message || 'Lỗi hệ thống khi xóa bài viết' };
    }
}
