import { LucideIcon } from "lucide-react";
import React from "react";

export interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: LucideIcon;
    error?: string;
    labelExtra?: React.ReactNode;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(({className, type, label, icon: Icon, error, labelExtra, ...props}, ref) => {
  return (
    <div className="space-y-2 w-full">
        {(label || labelExtra) && (
          <div className="flex items-center justify-between">
            {label && (
              <label className="text-sm font-medium text-foreground">
                {label}
              </label>
            )}
            {labelExtra}
          </div>
        )}

        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-3.5 text-muted-foreground pointer-events-none">
              <Icon className="h-5 w-5" />
            </div>
          )}

          <input
            type={type}
            className={`
              flex h-12 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background 
              file:border-0 file:bg-transparent file:text-sm file:font-medium 
              placeholder:text-muted-foreground 
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-50
              transition-all duration-200
              ${Icon ? "pl-10" : ""} 
              ${error 
                ? "border-red-500 focus-visible:ring-red-500/20" 
                : "border-input focus-visible:border-primary focus-visible:ring-ring/20"}
              ${className || ""}
            `}
            ref={ref} 
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-500 animate-in slide-in-from-top-1 fade-in-0">
            {error}
          </p>
        )}
      </div>
  );
}
)

CustomInput.displayName = "CustomInput";

export {CustomInput};