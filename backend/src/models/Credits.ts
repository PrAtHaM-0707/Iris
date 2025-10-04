import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Credits {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  balance: number;

  @Column()
  plan: 'free' | 'basic' | 'premium';

  @Column({ nullable: true })
  lastReset?: Date; // Track last daily reset

  @Column({ nullable: true })
  expirationDate?: Date; // Track plan expiration

  @ManyToOne(() => User, (user) => user.credits, { onDelete: 'CASCADE' })
  user: User;
}