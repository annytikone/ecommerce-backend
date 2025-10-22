import { Order } from './order.entity';
export declare class OrderItem {
    id: string;
    order: Order;
    sku: string;
    name: string;
    quantity: number;
    unit_price: string;
}
