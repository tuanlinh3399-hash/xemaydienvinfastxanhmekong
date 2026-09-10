import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/app/actions/settings';
import { createClient } from '@/lib/supabase-server';
import { verifyToken } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_session')?.value;
        const valid = await verifyToken(token);

        if (!user && !valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const branch = searchParams.get('branch') || 'hung-phu';

        const data = await getSettings(branch);
        return NextResponse.json({ data });
    } catch (error) {
        console.error('Unexpected error in GET /api/admin/settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const body = await request.json();
        const branch = body.branch || searchParams.get('branch') || 'hung-phu';

        const result = await updateSettings(branch, {
            phone: body.phone,
            email: body.email,
            address: body.address,
            google_maps_link: body.google_maps_link
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error, needMigration: result.needMigration },
                { status: 400 }
            );
        }

        return NextResponse.json({ data: result.data, success: true });
    } catch (error: any) {
        console.error('Unexpected error in PATCH /api/admin/settings:', error);
        return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
    }
}
