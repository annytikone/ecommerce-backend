import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrdersService {
    private orders;
    private items;
    constructor(orders: Repository<Order>, items: Repository<OrderItem>);
    create(user_id: string, dto: CreateOrderDto): Promise<Order>;
    findAllForUser(requester: {
        id: string;
        role: string;
    }): Promise<Order[]>;
    findOne(id: string, requester: {
        id: string;
        role: string;
    }): Promise<Order>;
    update(id: string, requester: {
        id: string;
        role: string;
    }, dto: UpdateOrderDto): Promise<Order>;
    remove(id: string, requester: {
        id: string;
        role: string;
    }): Promise<{
        deleted: boolean;
    }>;
}
