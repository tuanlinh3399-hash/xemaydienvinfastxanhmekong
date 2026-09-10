'use server';

import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { FALLBACK_EMAIL } from '@/lib/constants';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitLead(formData: {
    full_name: string;
    phone: string;
    email?: string;
    car_model?: string;
    notes?: string;
    branch?: string;
}) {
    try {
        const branchName = formData.branch?.trim() || 'Hưng Phú (Mặc định)';

        // 1. Insert into Supabase
        // Ghi chú chi nhánh vào trường notes để lưu trữ an toàn trong schema hiện tại
        const notesParts = [
            `[Cơ sở tư vấn: ${branchName}]`,
            formData.car_model ? `Quan tâm: ${formData.car_model}` : '',
            formData.notes ? `Lời nhắn: ${formData.notes}` : ''
        ].filter(Boolean);
        const combinedNotes = notesParts.join(' - ');

        const { error: dbError } = await supabase
            .from('leads')
            .insert([{
                full_name: formData.full_name,
                phone: formData.phone,
                email: formData.email || null,
                car_model: formData.car_model || null,
                notes: combinedNotes,
                status: 'Mới'
            }]);

        if (dbError) {
            console.error('Lỗi khi lưu lead vào Supabase:', dbError);
            return { success: false, error: 'Database error' };
        }

        // 2. Try to send email with Resend
        try {
            console.log("Đang bắt đầu gửi email...");
            const adminEmails = process.env.ADMIN_EMAIL
                ? process.env.ADMIN_EMAIL.split(',').map(email => email.trim()).filter(Boolean)
                : [FALLBACK_EMAIL];

            // Send Email
            const data = await resend.emails.send({
                from: 'no-reply@vinfastxanhmekong.vn',
                to: adminEmails,
                subject: `[Mới] Khách hàng quan tâm xe tại ${branchName}`,
                html: `
                    <h2>Thông báo khách hàng mới</h2>
                    <div style="margin: 16px 0; padding: 14px 16px; background-color: #eff6ff; border-left: 5px solid #1464F4; border-radius: 4px;">
                        <p style="margin: 0; font-size: 16px; color: #1e3a8a;">
                            <strong>Khách hàng muốn tư vấn tại chi nhánh: ${branchName}</strong>
                        </p>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 16px;">
                        <tbody>
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 10px; background-color: #f8fafc; width: 180px;">Cơ sở tư vấn</th>
                                <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold; color: #1464F4;">${branchName}</td>
                            </tr>
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 10px; background-color: #f8fafc;">Họ tên</th>
                                <td style="border: 1px solid #ddd; padding: 10px;">${formData.full_name}</td>
                            </tr>
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 10px; background-color: #f8fafc;">Số điện thoại</th>
                                <td style="border: 1px solid #ddd; padding: 10px;">
                                    <a href="tel:${formData.phone}" style="color: #1464F4; font-weight: bold;">${formData.phone}</a>
                                </td>
                            </tr>
                            ${formData.email ? `
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 10px; background-color: #f8fafc;">Email</th>
                                <td style="border: 1px solid #ddd; padding: 10px;">${formData.email}</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 10px; background-color: #f8fafc;">Dòng xe quan tâm</th>
                                <td style="border: 1px solid #ddd; padding: 10px;">${formData.car_model || 'Chưa chọn'}</td>
                            </tr>
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 10px; background-color: #f8fafc;">Lời nhắn</th>
                                <td style="border: 1px solid #ddd; padding: 10px;">${formData.notes || 'Trống'}</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    <p style="color: #64748b; font-size: 13px;">Vui lòng đăng nhập hệ thống quản trị để xử lý và phân luồng telesale.</p>
                `
            });
            console.log("Email đã gửi thành công:", data);
        } catch (emailError) {
            // Bắt lỗi gui email để không ảnh hưởng luồng chính
            console.error("Lỗi gửi mail:", emailError);
        }

        console.log('--- KẾT THÚC SERVER ACTION ---');
        return { success: true };

    } catch (error) {
        console.error('Unexpected error in submitLead:', error);
        console.log('--- KẾT THÚC SERVER ACTION ---');
        return { success: false, error: 'Unexpected error' };
    }
}
