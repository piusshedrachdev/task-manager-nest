import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';


export interface Return<DR>{
    success:boolean,
    error?:unknown,
    data?:DR,
}

export enum TaskStatus{
    TODO = "todo",
    DOING = "in_progress",
    DONE = "completed"
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}