export declare class OrderItemDto {
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreateOrderDto {
    items: OrderItemDto[];
    status?: 'pending' | 'paid' | 'shipped' | 'cancelled';
}
