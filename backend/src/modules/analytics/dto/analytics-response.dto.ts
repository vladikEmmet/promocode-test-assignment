export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UserAnalyticsRow {
    id: string;
    email: string;
    name: string;
    phone: string;
    is_active: string;
    created_at: string;
    total_orders: string;
    total_amount: string;
    total_discount: string;
    promo_usages: string;
}

export interface PromocodeAnalyticsRow {
    id: string;
    code: string;
    discount: string;
    usage_limit: string;
    per_user_limit: string;
    date_from: string;
    date_to: string;
    is_active: string;
    created_at: string;
    total_usages: string;
    total_revenue: string;
    total_discount_given: string;
    unique_users: string;
}

export interface PromoUsageRow {
    id: string;
    promocode_code: string;
    user_email: string;
    user_name: string;
    order_id: string;
    order_amount: string;
    discount_amount: string;
    used_at: string;
}