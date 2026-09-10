export interface BranchInfo {
    id: 'hung-phu' | 'binh-thuy' | string;
    name: string;
    shortName: string;
    fullName: string;
    address: string;
    phone: string;
    hotline: string;
    mapEmbedUrl: string;
    mapShareUrl: string;
    openingHours?: string;
    email?: string;
}

export const DEFAULT_BRANCH_ID = 'hung-phu';

export const BRANCHES: Record<string, BranchInfo> = {
    'hung-phu': {
        id: 'hung-phu',
        name: 'Chi nhánh Hưng Phú',
        shortName: 'Hưng Phú',
        fullName: 'VinFast Xanh Mekong - Chi nhánh Hưng Phú',
        address: 'Số 10362, đường Võ Nguyên Giáp, Phường Hưng Phú, TP. Cần Thơ',
        phone: '0899 00 11 77',
        hotline: '0899 00 11 77',
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.1191878093964!2d105.79278257569754!3d10.007012672912643!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1s0x31a063e0a0034f3b%3A0x3a65a68acbce94!2zWGUgbcOheSDEkWnhu4duIFZpbkZhc3QgWGFuaCBNZWtvbmc!5e0!3m2!1sen!2s!4v1777724148831!5m2!1sen!2s',
        mapShareUrl: 'https://maps.app.goo.gl/f85DwodnfvtBk1YFA',
        openingHours: '08:00 - 20:00 (Thứ 2 - Chủ Nhật)',
        email: 'vinfastxanhmekong@gmail.com'
    },
    'binh-thuy': {
        id: 'binh-thuy',
        name: 'Chi nhánh Bình Thủy',
        shortName: 'Bình Thủy',
        fullName: 'VinFast Xanh Mekong - Chi nhánh Bình Thủy',
        address: 'Số 09, đường CMT8, P. Bình Thủy, TP. Cần Thơ',
        phone: '0899 00 11 77',
        hotline: '0899 00 11 77',
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.5432989793344!2d105.76722897569779!3d10.05449347209332!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1s0x31a089b70120e7c3%3A0xcfd5fdf86f31fe6d!2zWMaw4bufbmcgROG7i2NoIFbhu6UgWGFuaCBTTSBYYW5oIE1la29uZw!5e0!3m2!1svi!2s!4v1789008490938!5m2!1svi!2s',
        mapShareUrl: 'https://maps.app.goo.gl/hGz7u6Z2rGv5oPcw5',
        openingHours: '08:00 - 20:00 (Thứ 2 - Chủ Nhật)',
        email: 'cskh@vinfastxanhmekong.vn'
    }
};

export const BRANCH_LIST: BranchInfo[] = Object.values(BRANCHES);

/**
 * Lấy thông tin chi nhánh dựa vào branch param từ URL/State.
 * Nếu không có tham số hoặc không khớp, mặc định là Hưng Phú.
 */
export function getBranch(branchParam?: string | null): BranchInfo {
    if (!branchParam) {
        return BRANCHES[DEFAULT_BRANCH_ID];
    }
    const cleanParam = branchParam.trim().toLowerCase();
    if (BRANCHES[cleanParam]) {
        return BRANCHES[cleanParam];
    }
    // Hỗ trợ tìm kiếm theo tên không dấu hoặc một phần
    if (cleanParam.includes('binh-thuy') || cleanParam.includes('binh thuy')) {
        return BRANCHES['binh-thuy'];
    }
    return BRANCHES[DEFAULT_BRANCH_ID];
}
