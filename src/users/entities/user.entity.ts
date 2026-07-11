import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { Issue } from '../../issues/entities/issue.entity';
import { Asset } from '../../assets/entities/asset.entity';
import { MaintenanceRecord } from '../../maintenance/entities/maintenance.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.TECHNICIAN,
  })
  role: Role;

  @Column({ nullable: true })
  specialty: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Issue, (issue) => issue.assignedTechnician)
  assignedIssues: Issue[];

  @OneToMany(() => Asset, (asset) => asset.assignedTechnician)
  assignedAssets: Asset[];

  @OneToMany(() => MaintenanceRecord, (record) => record.technician)
  maintenanceRecords: MaintenanceRecord[];
}
