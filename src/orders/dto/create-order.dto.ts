import { ApiExtraModels, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ example: 'SKU-101', description: 'Unique item SKU' })
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'Mechanical Keyboard', description: 'Product name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, description: 'Quantity ordered (must be > 0)' })
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 3499.99, description: 'Unit price (max 2 decimals)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  unitPrice: number;
}

@ApiExtraModels(OrderItemDto)
export class CreateOrderDto {
  @ApiProperty({
    type: [OrderItemDto],
    description: 'Line items in the order',
    example: [
      { sku: 'SKU-101', name: 'Mechanical Keyboard', quantity: 1, unitPrice: 3499.99 },
      { sku: 'SKU-202', name: 'Gaming Mouse',       quantity: 2, unitPrice: 1299.50 }
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({
    enum: ['pending', 'paid', 'shipped', 'cancelled'],
    example: 'pending',
    description: 'Order status (defaults to "pending")',
  })
  @IsOptional()
  @IsEnum(['pending', 'paid', 'shipped', 'cancelled'])
  status?: 'pending' | 'paid' | 'shipped' | 'cancelled';
}
