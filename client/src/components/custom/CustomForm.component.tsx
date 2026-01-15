"use client";
"use no memo"

import Link from "next/link";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { SubmitHandler, FieldValues, Path, UseFormReturn } from "react-hook-form";
import { CustomInput } from "./CustomInput.component";
import { CustomButton } from "./CustomButton.component";

export interface FormField<T extends FieldValues> {
  id: Path<T>;
  label: string;
  type: string;
  placeholder: string;
  icon: LucideIcon;
  labelExtra?: ReactNode;
  hasForgotPassword?: boolean;
  autoComplete?: string;
}

interface CustomFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  fields: FormField<T>[];
  submitText: string;
  submitIcon?: ReactNode;
  onSubmit: SubmitHandler<T>;
  className?: string;
  buttonClassName?: string;
}

const CustomForm = <T extends FieldValues>({
  form,
  fields,
  submitText,
  submitIcon,
  onSubmit,
  className = "",
  buttonClassName = "",
}: CustomFormProps<T>) => {
  
  const { handleSubmit, register, formState: { errors, isSubmitting, isValid } } = form;

  return (
    <form className={className} onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field) => {
        const errorMessage = errors[field.id]?.message as string | undefined;

       
        const dynamicLabelExtra = field.hasForgotPassword ? (
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password?
          </Link>
        ) : field.labelExtra;

        return (
          <CustomInput
            key={field.id}
            id={field.id}
            type={field.type}
            label={field.label}
            placeholder={field.placeholder}
            icon={field.icon}
            error={errorMessage}     
            labelExtra={dynamicLabelExtra} 
            autoComplete={field.autoComplete}            
            {...register(field.id)} 
          />
        );
      })}

      <CustomButton type="submit" isLoading={isSubmitting} disabled={!isValid} className={buttonClassName} variant="primary">
        {submitText}
        {!isSubmitting && submitIcon}
      </CustomButton>
    </form>
  );
};

export {CustomForm};