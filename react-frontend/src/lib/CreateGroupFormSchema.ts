import { z } from "zod";

export const CreateGroupFormSchema = z.object({
  name: z.string().min(1, {
    message: "Group name is required",
  }),
  description: z.string().optional(),
  participants: z.array(z.string()),
  admins: z.array(z.string()),
  image: z.any().optional(),
});

export type CreateGroupFormSchemaType = z.infer<typeof CreateGroupFormSchema>;
