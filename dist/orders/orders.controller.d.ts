import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrdersController {
    private readonly svc;
    constructor(svc: OrdersService);
    create(user: any, dto: CreateOrderDto): Promise<import("./entities/order.entity").Order>;
    findMineOrAll(user: any): Promise<import("./entities/order.entity").Order[]>;
    findOne(id: string, user: any): Promise<import("./entities/order.entity").Order>;
    update(id: string, user: any, dto: UpdateOrderDto): Promise<import("./entities/order.entity").Order>;
    remove(id: string, user: any): Promise<{
        deleted: boolean;
    }>;
}
