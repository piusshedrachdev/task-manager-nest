import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { Projects } from '../../projects/entity/project.entity.js';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 'todo' })
  status: string;

  @Column({default: () => 'CURRENT_TIMESTAMP'})
  created_at: Date;

  @ManyToOne(() => Projects, (project) => project.tasks, {
    nullable:false
  })
  @JoinColumn({ name: 'project_id' })
  project: Projects;

}
