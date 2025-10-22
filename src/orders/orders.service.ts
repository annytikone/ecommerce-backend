import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orders: Repository<Order>,
    @InjectRepository(OrderItem) private items: Repository<OrderItem>,
  ) {}

  async create(user_id: string, dto: CreateOrderDto) {
    const total = dto.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const order = this.orders.create({
      user: { id: user_id } as any,
      items: dto.items.map((i) =>
        this.items.create({
          sku: i.sku,
          name: i.name,
          quantity: i.quantity,
          unit_price: i.unitPrice.toFixed(2),
        }),
      ),
      total_amount: total.toFixed(2),
      status: dto.status ?? 'pending',
    });
    return this.orders.save(order);
  }

  async findAllForUser(requester: { id: string; role: string }) {
    if (requester.role === 'admin') return this.orders.find();
    return this.orders.find({ where: { user: { id: requester.id } } });
  }

  async findOne(id: string, requester: { id: string; role: string }) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (requester.role !== 'admin' && order.user.id !== requester.id) {
      throw new ForbiddenException();
    }
    return order;
  }

  async update(id: string, requester: { id: string; role: string }, dto: UpdateOrderDto) {
    const order = await this.findOne(id, requester);

    if (dto.items) {
      await this.items
        .createQueryBuilder()
        .delete()
        .where('order_id = :id', { id: order.id })
        .execute();

      order.items = dto.items.map((i) =>
        this.items.create({
          sku: i.sku,
          name: i.name,
          quantity: i.quantity,
          unit_price: i.unitPrice.toFixed(2),
        }),
      );

      const total = order.items.reduce((s, i) => s + i.quantity * Number(i.unit_price), 0);
      order.total_amount = total.toFixed(2);
    }

    if (dto.status) order.status = dto.status;

    return this.orders.save(order);
  }

  async remove(id: string, requester: { id: string; role: string }) {
    const order = await this.findOne(id, requester);
    await this.orders.remove(order);
    return { deleted: true };
  }
}
