"use client";
"use no memo"
import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import {CustomForm} from "@/components/custom/CustomForm.component";
import registerFields, { RegisterFormData } from "@/configs/register.config";
import { useForm } from "react-hook-form";
import { registerSchema } from "@cortex/shared";
import { zodResolver } from "@hookform/resolvers/zod";

export default function RegisterPage() {

  const form = useForm<RegisterFormData>({
    mode: "onChange",
    resolver: zodResolver(registerSchema),
});

  const handleRegister = (data: RegisterFormData): void => {
    console.log("Register submitted", data);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
      
      {/* Decorative glow effect */}
      <div className="absolute -z-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px] opacity-50 pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-2xl sm:p-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details to register for CortexAI
          </p>
        </div>

        {/* Form */}
        <CustomForm
          form={form}
          fields={registerFields}
          submitText="Sign up"
          submitIcon={<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
          onSubmit={handleRegister}
          className="space-y-6"
        />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
            <Github className="h-4 w-4" />
            <span className="text-sm font-medium">GitHub</span>
          </button>
          <button className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-medium">Google</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}