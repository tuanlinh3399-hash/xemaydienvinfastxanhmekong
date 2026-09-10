import { NextResponse } from 'next/server';
import { getSettings } from '@/app/actions/settings';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const branch = searchParams.get('branch') || 'hung-phu';

        const data = await getSettings(branch);
        return NextResponse.json({ data: data || {} });
    } catch (error) {
        console.error('Error fetching public settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
