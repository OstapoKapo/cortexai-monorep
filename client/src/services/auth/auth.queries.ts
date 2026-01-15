import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService, IAuthResponse, ILogoutResponse } from "./auth.services";
import toast from "react-hot-toast";
import { LoginDtoType, RegisterDtoType } from "@cortex/shared";


export const useLoginMutation = () => {
    const router = useRouter();

    return useMutation<IAuthResponse, unknown, LoginDtoType>({
        mutationFn: (data) => authService.login(data),
        onSuccess: async () => {
            toast.success("Login successful!");
            router.push("/");
        },
    });
}

export const useLogoutMutation = () => {
    const router = useRouter();

    return useMutation<ILogoutResponse, unknown, void>({
        mutationFn: () => authService.logout(),
        onSuccess: async () => {
            toast.success("Logout successful!");
            router.push("/login");
        },
    });
}

export const useRegisterMutation = () => {
    const router = useRouter();

    return useMutation<IAuthResponse, unknown, RegisterDtoType>({
        mutationFn: (data) => authService.register(data),
        onSuccess: async () => {
            toast.success("Registration successful!");
            router.push("/");
        },
    });
}