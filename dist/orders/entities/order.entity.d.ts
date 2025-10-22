import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
export declare class Order {
    id: string;
    user: User;
    items: OrderItem[];
    total_amount: string;
    status: 'pending' | 'paid' | 'shipped' | 'cancelled';
    created_at: Date;
}
