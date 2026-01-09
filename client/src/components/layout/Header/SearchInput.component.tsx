"use client";

import { Search } from "lucide-react";
import { CustomInput } from "@/components/custom/СustomInput.component";

interface SearchInputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function SearchInput({
  placeholder = "Пошук...",
  onChange,
}: SearchInputProps) {
  return (
    <CustomInput
      type="text"
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      icon={Search}
      className="w-64"
    />
  );
}
