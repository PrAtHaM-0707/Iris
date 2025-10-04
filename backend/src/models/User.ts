import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChatHistory } from './ChatHistory';
import { Credits } from './Credits';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({ nullable: true }) // Password is nullable for OAuth users
  password?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  company?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true }) // New field for OAuth provider
  provider?: string;

  @Column({ nullable: true }) // New field for Google's user ID
  providerId?: string;

  @OneToMany(() => ChatHistory, (chat) => chat.user)
  chats!: ChatHistory[];

  @OneToMany(() => Credits, (credits) => credits.user)
  credits!: Credits[];
}