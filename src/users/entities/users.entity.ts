import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany
} from 'typeorm';

import {Projects} from '../../projects/entity/project.entity.js'

@Entity()
@Index('UQ_users_email', ['email'], { unique: true })
export class Users{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({type:'text'})
    name:string;

    @Column({type:'text'})
    email:string;

    //@Column({type:'text', default:'user', enum:['user', 'admin']})
    @Column({type:'text', default:'user'})
    role:string;

    @OneToMany(() => Projects, (project) => project.user)
    projects: Projects[];

    @Column({type:'text'})
    password:string;

}