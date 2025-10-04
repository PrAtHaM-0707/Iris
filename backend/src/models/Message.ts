import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ChatHistory } from './ChatHistory';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  role: 'user' | 'assistant';

  @Column('timestamp with time zone')
  timestamp: Date;

  @Column('simple-array', { nullable: true })
  images: string[]; // Base64 or URLs

  @ManyToOne(() => ChatHistory, (chat) => chat.messages, { onDelete: 'CASCADE' })
  chat: ChatHistory;
}