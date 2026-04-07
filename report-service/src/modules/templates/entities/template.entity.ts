import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('templates')
@Unique(['storageKey'])
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  storageKey!: string;

  @Column()
  originalFileName!: string;

  @Column({ nullable: true, default: null, type: 'text' })
  mimeType!: string | null;

  @Column({ type: 'int' })
  size!: number;

  @Column()
  fileUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  userId!: string;
}
