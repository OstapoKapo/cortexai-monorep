import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authService } from "./auth.services";
import { LoginDtoType, RegisterDtoType, ILoginResponse, IRegisterResponse, ILogoutResponse } from "@cortex/shared";
import { set } from "zod";


export const useLoginMutation = () => {
    const router = useRouter();

    return useMutation<ILoginResponse, unknown, LoginDtoType>({
        mutationFn: (data) => authService.login(data),
        onSuccess: async () => {
            toast.success("Login successful!");
            router.refresh();
            router.replace("/");
        },
    });
}

export const useLogoutMutation = () => {
    const router = useRouter();

    return useMutation<ILogoutResponse, unknown, void>({
        mutationFn: () => authService.logout(),
        onSuccess: async () => {
            toast.success("Logout successful!");
            router.refresh();
            router.replace("/login");
        },
    });
}

export const useRegisterMutation = () => {
    const router = useRouter();

    return useMutation<IRegisterResponse, unknown, RegisterDtoType>({
        mutationFn: (data) => authService.register(data),
        onSuccess: async () => {
            toast.success("Registration successful!");
            router.refresh();
            router.replace("/");
        },
    });
}