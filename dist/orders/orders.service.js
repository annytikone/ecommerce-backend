"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
let OrdersService = class OrdersService {
    orders;
    items;
    constructor(orders, items) {
        this.orders = orders;
        this.items = items;
    }
    async create(user_id, dto) {
        const total = dto.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
        const order = this.orders.create({
            user: { id: user_id },
            items: dto.items.map((i) => this.items.create({
                sku: i.sku,
                name: i.name,
                quantity: i.quantity,
                unit_price: i.unitPrice.toFixed(2),
            })),
            total_amount: total.toFixed(2),
            status: dto.status ?? 'pending',
        });
        return this.orders.save(order);
    }
    async findAllForUser(requester) {
        if (requester.role === 'admin')
            return this.orders.find();
        return this.orders.find({ where: { user: { id: requester.id } } });
    }
    async findOne(id, requester) {
        const order = await this.orders.findOne({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (requester.role !== 'admin' && order.user.id !== requester.id) {
            throw new common_1.ForbiddenException();
        }
        return order;
    }
    async update(id, requester, dto) {
        const order = await this.findOne(id, requester);
        if (dto.items) {
            await this.items
                .createQueryBuilder()
                .delete()
                .where('order_id = :id', { id: order.id })
                .execute();
            order.items = dto.items.map((i) => this.items.create({
                sku: i.sku,
                name: i.name,
                quantity: i.quantity,
                unit_price: i.unitPrice.toFixed(2),
            }));
            const total = order.items.reduce((s, i) => s + i.quantity * Number(i.unit_price), 0);
            order.total_amount = total.toFixed(2);
        }
        if (dto.status)
            order.status = dto.status;
        return this.orders.save(order);
    }
    async remove(id, requester) {
        const order = await this.findOne(id, requester);
        await this.orders.remove(order);
        return { deleted: true };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map