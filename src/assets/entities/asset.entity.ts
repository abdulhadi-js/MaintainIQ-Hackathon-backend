import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Issue } from '../../issues/entities/issue.entity';
import { HistoryRecord } from '../../history/entities/history.entity';
import { MaintenanceRecord } from '../../maintenance/entities/maintenance.entity';

export enum AssetStatus {
  OPERATIONAL = 'Operational',
  ISSUE_REPORTED = 'Issue Reported',
  UNDER_INSPECTION = 'Under Inspection',
  UNDER_MAINTENANCE = 'Under Maintenance',
  OUT_OF_SERVICE = 'Out of Service',
  RETIRED = 'Retired',
}

export enum AssetCondition {
  NEW = 'New',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  category: string;

  @Column()
  location: string;

  @Column({
    type: 'enum',
    enum: AssetCondition,
    default: AssetCondition.GOOD,
  })
  condition: AssetCondition;

  @Column({
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.OPERATIONAL,
  })
  status: AssetStatus;

  @ManyToOne(() => User, (user) => user.assignedAssets, { nullable: true })
  assignedTechnician: User;

  @Column({ type: 'date', nullable: true })
  lastServiceDate: Date;

  @Column({ type: 'date', nullable: true })
  nextServiceDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  qrCodeUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Issue, (issue) => issue.asset)
  issues: Issue[];

  @OneToMany(() => HistoryRecord, (history) => history.asset)
  history: HistoryRecord[];

  @OneToMany(() => MaintenanceRecord, (maintenance) => maintenance.asset)
  maintenanceRecords: MaintenanceRecord[];
}
