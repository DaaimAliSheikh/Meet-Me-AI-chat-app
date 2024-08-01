import { z } from "zod";

const LoginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address format" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(32, { message: "Password must be at most 32 characters long" }),
});
type LoginFormType = z.infer<typeof LoginFormSchema>;

export { LoginFormSchema, type LoginFormType };
