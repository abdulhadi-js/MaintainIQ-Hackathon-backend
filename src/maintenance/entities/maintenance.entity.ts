import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Asset, AssetCondition } from '../../assets/entities/asset.entity';
import { Issue } from '../../issues/entities/issue.entity';
import { User } from '../../users/entities/user.entity';

@Entity('maintenance_records')
export class MaintenanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Asset, (asset) => asset.maintenanceRecords)
  asset: Asset;

  @ManyToOne(() => Issue, (issue) => issue.maintenanceRecords, {
    nullable: true,
  })
  issue: Issue;

  @ManyToOne(() => User, (user) => user.maintenanceRecords)
  technician: User;

  @Column({ type: 'text' })
  workPerformed: string;

  @Column({ type: 'jsonb', nullable: true })
  partsUsed: { name: string; quantity: number; cost: number }[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCost: number;

  @Column({ type: 'int', nullable: true })
  timeSpentMinutes: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  finalCondition: AssetCondition;

  @Column({ type: 'jsonb', nullable: true })
  evidenceUrls: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
