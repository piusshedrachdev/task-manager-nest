export interface Return<DR>{
    success:boolean,
    error?:unknown,
    data?:DR,
}

export enum TaskStatus{
    TODO = "TODO",
    DOING = "DOING",
    DONE = "DONE"
}