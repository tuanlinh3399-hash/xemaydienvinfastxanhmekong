'use client';

import React, { createContext, useContext } from 'react';
import useSWR from 'swr';
import { useBranch } from '@/components/client/BranchProvider';
import { DEFAULT_BRANCH_ID } from '@/lib/branches';

export interface SiteSettings {
    id?: number;
    phone?: string;
    hotline?: string;
    email?: string;
    address?: string;
    google_maps_link?: string;
    map_url?: string;
    fanpage_url?: string;
    branch_slug?: string;
    link_xe_may_dien?: string;
    link_share_vi_tri?: string;
    facebook_link?: string;
    tiktok_link?: string;
    zalo_link?: string;
}

interface SiteSettingsContextType {
    settings: SiteSettings | null;
    isLoading: boolean;
    error: any;
    branch: string;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
    settings: null,
    isLoading: true,
    error: null,
    branch: DEFAULT_BRANCH_ID,
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
    const { branchId, isMounted } = useBranch();
    const branchKey = isMounted ? branchId : DEFAULT_BRANCH_ID;

    const { data, error, isLoading } = useSWR(`/api/settings?branch=${branchKey}`, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 30000,
    });

    const settings = data?.data || null;

    return (
        <SiteSettingsContext.Provider value={{ settings, isLoading, error, branch: branchKey }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}

export function useSiteSettings() {
    return useContext(SiteSettingsContext);
}
