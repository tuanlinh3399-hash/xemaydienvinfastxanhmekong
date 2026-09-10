'use client';

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { BranchInfo, BRANCHES, BRANCH_LIST, DEFAULT_BRANCH_ID, getBranch } from '@/lib/branches';

interface BranchContextType {
    currentBranch: BranchInfo;
    branchId: string;
    branchList: BranchInfo[];
    switchBranch: (branchId: string) => void;
    isMounted: boolean;
}

const defaultBranch = BRANCHES[DEFAULT_BRANCH_ID];

const BranchContext = createContext<BranchContextType>({
    currentBranch: defaultBranch,
    branchId: DEFAULT_BRANCH_ID,
    branchList: BRANCH_LIST,
    switchBranch: () => {},
    isMounted: false,
});

function BranchProviderInternal({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // SSR & Hydration safe: Khi !isMounted, luôn giữ đồng nhất giá trị mặc định Hưng Phú
    const branchParam = isMounted ? searchParams.get('branch') : null;
    const currentBranch = isMounted ? getBranch(branchParam) : defaultBranch;
    const branchId = currentBranch.id;

    const switchBranch = (newBranchId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('branch', newBranchId);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <BranchContext.Provider value={{ currentBranch, branchId, branchList: BRANCH_LIST, switchBranch, isMounted }}>
            {children}
        </BranchContext.Provider>
    );
}

export function BranchProvider({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={
            <BranchContext.Provider value={{
                currentBranch: defaultBranch,
                branchId: DEFAULT_BRANCH_ID,
                branchList: BRANCH_LIST,
                switchBranch: () => {},
                isMounted: false,
            }}>
                {children}
            </BranchContext.Provider>
        }>
            <BranchProviderInternal>
                {children}
            </BranchProviderInternal>
        </Suspense>
    );
}

export function useBranch() {
    return useContext(BranchContext);
}
