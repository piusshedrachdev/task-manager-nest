import jwt from 'jsonwebtoken';
import { UserIdentityDto } from '../users/dto/users.dto.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'jfdafiudkjfid0ai8hf89ekaafoi';

export function createJWT(user:UserIdentityDto){
    const token = jwt.sign(
        user,
        JWT_SECRET,
        {
            expiresIn : "1h"
        }
    )

    return token
}