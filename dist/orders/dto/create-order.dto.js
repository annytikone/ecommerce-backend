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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderDto = exports.OrderItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class OrderItemDto {
    sku;
    name;
    quantity;
    unitPrice;
}
exports.OrderItemDto = OrderItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SKU-101', description: 'Unique item SKU' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OrderItemDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mechanical Keyboard', description: 'Product name' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OrderItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Quantity ordered (must be > 0)' }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], OrderItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3499.99, description: 'Unit price (max 2 decimals)' }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    __metadata("design:type", Number)
], OrderItemDto.prototype, "unitPrice", void 0);
let CreateOrderDto = class CreateOrderDto {
    items;
    status;
};
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [OrderItemDto],
        description: 'Line items in the order',
        example: [
            { sku: 'SKU-101', name: 'Mechanical Keyboard', quantity: 1, unitPrice: 3499.99 },
            { sku: 'SKU-202', name: 'Gaming Mouse', quantity: 2, unitPrice: 1299.50 }
        ],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OrderItemDto),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['pending', 'paid', 'shipped', 'cancelled'],
        example: 'pending',
        description: 'Order status (defaults to "pending")',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['pending', 'paid', 'shipped', 'cancelled']),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "status", void 0);
exports.CreateOrderDto = CreateOrderDto = __decorate([
    (0, swagger_1.ApiExtraModels)(OrderItemDto)
], CreateOrderDto);
//# sourceMappingURL=create-order.dto.js.map