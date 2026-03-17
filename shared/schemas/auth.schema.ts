import { z } from "zod";

export const loginSchema = z.object({
  email: z
        .string({message: "Email is required"})
        .trim()
        .toLowerCase()
        .email({message: "Invalid email address"})
        .min(5, {message: "Email must be at least 5 characters long"}),
  password: z
        .string({message: "Password is required"})
        .trim()
        .min(6, {message: "Password must be at least 6 characters long"}),
});

export const registerSchema = z.object({
  name: z
        .string({message: "Name is required"})
        .trim()
        .min(2, {message: "Name must be at least 2 characters long"}),
  email: z
        .string({message: "Email is required"})
        .trim()
        .toLowerCase()
        .email({message: "Invalid email address"})
        .min(5, {message: "Email must be at least 5 characters long"}),
  password: z
        .string({message: "Password is required"})
        .trim()
        .min(6, {message: "Password must be at least 6 characters long"}),
});

export type LoginDtoType = z.infer<typeof loginSchema>;
export type RegisterDtoType = z.infer<typeof registerSchema>;