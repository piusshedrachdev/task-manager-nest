import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity.js';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginDto, UserIdentityDto } from './dto/users.dto.js';
import { createJWT } from '../utils/auth.js';

import {hash, compare} from 'bcrypt';


@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>
    ){}


    async registerUser(createUserDto:CreateUserDto){
        const _user = await hash(createUserDto.password, 10)
        const user = this.usersRepository.create({...createUserDto, password: _user})
        await this.usersRepository.save(user)

        return {message: "Account Created Successfully."}
    }


   async loginUser(loginCred: LoginDto) {

        // Find user by email
        const user = await this.usersRepository.findOne({
            where: { email: loginCred.email }
        });

        if (!user) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Compare password with stored hash
        const isPasswordValid = await compare(
            loginCred.password,
            user.password
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid email or password");
        }

        const userIdentity: UserIdentityDto = {
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email
        };

        // Generate JWT
        const jwt = createJWT(userIdentity);

        return jwt;
    }


    // protected route for only admins
    async changeUserRole(targetUserId:number){
        await this.usersRepository.update(targetUserId, {role:'admin'})
    }

    async getProfile(uid:number){
        const user = await this.usersRepository.findOneBy({id:uid}) ?? {}

        return Object.fromEntries(Object.entries(user).filter(([key]) => key !== 'password'));


    }

}