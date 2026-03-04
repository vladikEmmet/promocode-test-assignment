export interface Order {
    _id: string;
    userId: string;
    amount: number;
    promocodeId: string | null;
    promocodeCode: string | null;
    discountAmount: number | null;
    createdAt: string;
}