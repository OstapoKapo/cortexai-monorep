import { FormField } from "@/components/custom/СustomForm.component";
import { Mail, Lock } from "lucide-react";

export type LoginFormData = {
	email: string;
	password: string;
};

const loginFields: FormField<LoginFormData>[] = [
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
		label: "Password",
		type: "password",
		placeholder: "••••••••",
		icon: Lock,
		hasForgotPassword: true,
		autoComplete: "current-password",
	},
];

export default loginFields;