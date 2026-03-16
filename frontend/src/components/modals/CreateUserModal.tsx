"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import api from "@/lib/api";

const schema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    email: z.email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[a-z]/, "Must contain a lowercase letter")
        .regex(/[A-Z]/, "Must contain an uppercase letter")
        .regex(/[0-9]/, "Must contain a number")
        .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
    role: z.enum(["admin", "staff"]),
});

type FormData = z.infer<typeof schema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateUserModal({ isOpen, onClose, onSuccess }: Props) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { role: "staff" },
    });

    const onSubmit = async (data: FormData) => {
        try {
            await api.post("/users", data);
            toast.success("User account created successfully!");
            reset();
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
            const msg =
                error.response?.data?.message ||
                (error.response?.data?.errors
                    ? Object.values(error.response.data.errors).flat().join(", ")
                    : "Failed to create user.");
            toast.error(msg);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Provision New Account">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                    <input {...register("name")} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" placeholder="e.g. John Silva" />
                    {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                    <input type="email" {...register("email")} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" placeholder="e.g. john@ceyntics.com" />
                    {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Password <span className="text-red-400">*</span></label>
                    <input type="password" {...register("password")} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" placeholder="Min 8 chars, mixed case, number, symbol" />
                    {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Role <span className="text-red-400">*</span></label>
                    <select {...register("role")} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm appearance-none">
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={handleClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 border border-white/10 transition-colors">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? "Creating..." : "Create Account"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}


