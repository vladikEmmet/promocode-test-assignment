export interface Promocode {
    _id: string;
    code: string;
    discount: number;
    usageLimit: number | null;
    perUserLimit: number | null;
    dateFrom: string | null;
    dateTo: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface CreatePromocodeDto {
    code: string;
    discount: number;
    usageLimit?: number;
    perUserLimit?: number;
    dateFrom?: string;
    dateTo?: string;
}