import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Asset } from '../../assets/entities/asset.entity';
import { User } from '../../users/entities/user.entity';
import { HistoryRecord } from '../../history/entities/history.entity';
import { MaintenanceRecord } from '../../maintenance/entities/maintenance.entity';

export enum IssuePriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export enum IssueStatus {
  REPORTED = 'Reported',
  ASSIGNED = 'Assigned',
  INSPECTION_STARTED = 'Inspection Started',
  MAINTENANCE_IN_PROGRESS = 'Maintenance In Progress',
  WAITING_FOR_PARTS = 'Waiting for Parts',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
  REOPENED = 'Reopened',
}

@Entity('issues')
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  issueNumber: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: IssuePriority,
    default: IssuePriority.MEDIUM,
  })
  priority: IssuePriority;

  @Column()
  category: string;

  @Column({
    type: 'enum',
    enum: IssueStatus,
    default: IssueStatus.REPORTED,
  })
  status: IssueStatus;

  // AI Triage fields
  @Column({ type: 'jsonb', nullable: true })
  aiSuggestedDetails: {
    title?: string;
    category?: string;
    priority?: string;
    possibleCauses?: string[];
    initialChecks?: string[];
    isEdited?: boolean;
  };

  @ManyToOne(() => Asset, (asset) => asset.issues)
  asset: Asset;

  @ManyToOne(() => User, (user) => user.assignedIssues, { nullable: true })
  assignedTechnician: User;

  // Reporter info (public users)
  @Column({ nullable: true })
  reporterName: string;

  @Column({ nullable: true })
  reporterContact: string;

  @Column({ type: 'jsonb', nullable: true })
  evidenceUrls: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => HistoryRecord, (history) => history.issue)
  history: HistoryRecord[];

  @OneToMany(() => MaintenanceRecord, (record) => record.issue)
  maintenanceRecords: MaintenanceRecord[];
}
