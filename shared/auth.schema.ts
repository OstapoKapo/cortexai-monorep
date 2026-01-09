import { z } from "zod";

export const loginSchema = z.object({
  email: z
        .string({required_error: "Email is required"})
        .trim()
        .toLowerCase()
        .email({message: "Invalid email address"})
        .min(5, {message: "Email must be at least 5 characters long"}),
  password: z
        .string({required_error: "Password is required"})
        .trim()
        .min(6, {message: "Password must be at least 6 characters long"}),
});

export const registerSchema = z.object({
  name: z
        .string({required_error: "Name is required"})
        .trim()
        .min(2, {message: "Name must be at least 2 characters long"}),
  email: z
        .string({required_error: "Email is required"})
        .trim()
        .toLowerCase()
        .email({message: "Invalid email address"})
        .min(5, {message: "Email must be at least 5 characters long"}),
  password: z
        .string({required_error: "Password is required"})
        .trim()
        .min(6, {message: "Password must be at least 6 characters long"}),
  confirmPassword: z
        .string({required_error: "Confirm Password is required"})
        .trim()
        .min(6, {message: "Confirm Password must be at least 6 characters long"}),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginDtoType = z.infer<typeof loginSchema>;
export type RegisterDtoType = z.infer<typeof registerSchema>;