import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  role: string | null;

  @Column({ type: 'varchar', nullable: true })
  roleLabel: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatar: string | null;

  @Column({ type: 'varchar', nullable: true })
  department: string | null;

  @Column({ type: 'varchar', nullable: true })
  tenantId: string | null;

  @Column({ type: 'varchar', nullable: true })
  clientCompany: string | null;

  @Column({ type: 'varchar', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'varchar', nullable: true })
  mfaSecret: string | null;
}
