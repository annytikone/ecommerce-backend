import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ['admin', 'customer'], default: 'customer' })
  role: 'admin' | 'customer';

  @CreateDateColumn()
  created_at: Date;

  @BeforeInsert()
  async hashPassword() {
    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
    this.password = await bcrypt.hash(this.password, rounds);
  }
}
