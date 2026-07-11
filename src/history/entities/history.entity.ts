import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Asset } from '../../assets/entities/asset.entity';
import { Issue } from '../../issues/entities/issue.entity';

@Entity('history_records')
export class HistoryRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Asset, (asset) => asset.history)
  asset: Asset;

  @ManyToOne(() => Issue, (issue) => issue.history, { nullable: true })
  issue: Issue;

  @Column()
  actor: string; // User name or 'System' or 'Reporter'

  @Column()
  action: string; // Description of the action (e.g., 'Status changed to Under Maintenance', 'Issue reported')

  @CreateDateColumn()
  createdAt: Date;
}
