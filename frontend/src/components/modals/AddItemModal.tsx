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
    code: z.string().min(1, "Code is required").max(100),
    quantity: z.number().int().min(0, "Quantity must be 0 or more"),
    serial_number: z.string().max(255).optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    status: z.enum(["in-store", "borrowed", "damaged", "missing"]),
});

type FormData = z.infer<typeof schema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddItemModal({ isOpen, onClose, onSuccess }: Props) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { status: "in-store", quantity: 0 },
    });

    const onSubmit = async (data: FormData) => {
        try {
            await api.post("/items", {
                ...data,
                serial_number: data.serial_number || null,
                description: data.description || null,
            });
            toast.success("Item created successfully!");
            reset();
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
            const msg =
                error.response?.data?.message ||
                (error.response?.data?.errors
                    ? Object.values(error.response.data.errors).flat().join(", ")
                    : "Failed to create item.");
            toast.error(msg);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Item">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Name <span className="text-red-400">*</span>
                    </label>
                    <input
                        {...register("name")}
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                        placeholder="e.g. MacBook Pro 14"
                    />
                    {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                </div>

                {/* Code + Quantity row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Code <span className="text-red-400">*</span>
                        </label>
                        <input
                            {...register("code")}
                            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                            placeholder="e.g. MBP-001"
                        />
                        {errors.code && <p className="text-xs text-red-400 mt-1">{errors.code.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Quantity <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            {...register("quantity", { valueAsNumber: true })}
                            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                            placeholder="0"
                        />
                        {errors.quantity && <p className="text-xs text-red-400 mt-1">{errors.quantity.message}</p>}
                    </div>
                </div>

                {/* Serial Number */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Serial Number</label>
                    <input
                        {...register("serial_number")}
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                        placeholder="Optional"
                    />
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                    <select
                        {...register("status")}
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-sm appearance-none"
                    >
                        <option value="in-store">In Store</option>
                        <option value="borrowed">Borrowed</option>
                        <option value="damaged">Damaged</option>
                        <option value="missing">Missing</option>
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                    <textarea
                        {...register("description")}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
                        placeholder="Optional description..."
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? "Creating..." : "Create Item"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}




