import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' }) 
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total_amount: string;

  @Column({ type: 'enum', enum: ['pending', 'paid', 'shipped', 'cancelled'], default: 'pending' })
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';

  @CreateDateColumn()
  created_at: Date;
}
