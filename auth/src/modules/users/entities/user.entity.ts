import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('users')
@Unique(['email'])
@Unique(['googleId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar')
  email!: string;

  @Column('varchar')
  name!: string;

  @Column('varchar', { nullable: true })
  password?: string | null;

  @Column('varchar', { nullable: true })
  googleId?: string | null;

  @Column('varchar', { nullable: true })
  ip?: string | null;

  @Column('text', { nullable: true })
  userAgent?: string | null;

  @Column('varchar', { nullable: true })
  googleAvatar?: string | null;

  @Column('varchar', { nullable: true })
  refreshToken?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
