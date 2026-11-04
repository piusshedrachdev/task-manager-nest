import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { Task } from '../../tasks/entities/task.entity.js';
import { Users } from '../../users/entities/users.entity.js';

@Entity('projects')
export class Projects {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  @ManyToOne(() => Users, (user) => user.projects, {
    nullable:false
  })
  @JoinColumn({ name: 'uid' })
  user: Users;
}
