import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from 'typeorm';

import {Projects} from '../../projects/entity/project.entity.js'

@Entity()
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