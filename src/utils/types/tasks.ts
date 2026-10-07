import z from "zod"

export const TaskSchema = z.object({
    id: z.string(),
    title: z.string().min(5),
    description: z.string().min(5),
    comment: z.string().optional(),
    status: z.string().optional()
}).strict()

export const TaskListSchema = z.array(TaskSchema)

export const TaskCreateSchema = z.array(TaskSchema.omit({
    id:true
}))


export type Task = z.infer<typeof TaskSchema>