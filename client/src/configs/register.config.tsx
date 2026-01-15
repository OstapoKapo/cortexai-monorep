import { FormField } from "@/components/custom/CustomForm.component";
import { Mail, Lock, User } from "lucide-react";

export type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const registerFields: FormField<RegisterFormData>[] = [
  {
    id: "name",
    label: "Ім'я",
    type: "text",
    placeholder: "Ваше ім'я",
    icon: User,
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "name@example.com",
    icon: Mail,
    autoComplete: "email",
  },
  {
    id: "password",
    label: "Пароль",
    type: "password",
    placeholder: "••••••••",
    icon: Lock,
    autoComplete: "new-password",
  },
  {
    id: "confirmPassword",
    label: "Підтвердіть пароль",
    type: "password",
    placeholder: "••••••••",
    icon: Lock,
    autoComplete: "new-password",
  },
];

export default registerFields;