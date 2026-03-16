"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import api from "@/lib/api";

const schema = z.object({
    item_id: z.number().int().min(1, "Please select an item"),
    borrower_name: z.string().min(1, "Borrower name is required").max(255),
    contact: z.string().min(1, "Contact is required").max(255),
    borrow_date: z.string().min(1, "Borrow date is required"),
    expected_return_date: z.string().min(1, "Return date is required"),
    qty_borrowed: z.number().int().min(1, "Quantity must be at least 1"),
    notes: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface Item {
    id: number;
    name: string;
    code: string;
    quantity: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function IssueBorrowModal({ isOpen, onClose, onSuccess }: Props) {
    const [items, setItems] = useState<Item[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            qty_borrowed: 1,
            borrow_date: new Date().toISOString().split("T")[0],
        },
    });

    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        const loadItems = async () => {
            try {
                const { data } = await api.get("/items?status=in-store");
                if (!cancelled) setItems(data.data || []);
            } catch {
                if (!cancelled) toast.error("Failed to load items");
            } finally {
                if (!cancelled) setLoadingItems(false);
            }
        };
        setLoadingItems(true);
        loadItems();
        return () => { cancelled = true; };
    }, [isOpen]);

    const onSubmit = async (data: FormData) => {
        const selectedItem = items.find((i) => i.id === data.item_id);
        try {
            await api.post("/borrow-records", {
                ...data,
                item_name: selectedItem?.name || "",
                item_code: selectedItem?.code || "",
                notes: data.notes || null,
            });
            toast.success("Item issued successfully!");
            reset();
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
            const msg =
                error.response?.data?.message ||
                (error.response?.data?.errors
                    ? Object.values(error.response.data.errors).flat().join(", ")
                    : "Failed to issue item.");
            toast.error(msg);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Issue Item to Borrower">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Item <span className="text-red-400">*</span></label>
                    <select {...register("item_id", { valueAsNumber: true })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm appearance-none" disabled={loadingItems}>
                        <option value="">{loadingItems ? "Loading items..." : "Select an item"}</option>
                        {items.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name} ({item.code}) — {item.quantity} available
                            </option>
                        ))}
                    </select>
                    {errors.item_id && <p className="text-xs text-red-400 mt-1">{errors.item_id.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Borrower Name <span className="text-red-400">*</span></label>
                        <input {...register("borrower_name")} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" placeholder="e.g. Jane Doe" />
                        {errors.borrower_name && <p className="text-xs text-red-400 mt-1">{errors.borrower_name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Contact <span className="text-red-400">*</span></label>
                        <input {...register("contact")} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" placeholder="Phone or email" />
                        {errors.contact && <p className="text-xs text-red-400 mt-1">{errors.contact.message}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Borrow Date <span className="text-red-400">*</span></label>
                        <input type="date" {...register("borrow_date")} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                        {errors.borrow_date && <p className="text-xs text-red-400 mt-1">{errors.borrow_date.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Return Date <span className="text-red-400">*</span></label>
                        <input type="date" {...register("expected_return_date")} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
                        {errors.expected_return_date && <p className="text-xs text-red-400 mt-1">{errors.expected_return_date.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Qty <span className="text-red-400">*</span></label>
                        <input type="number" {...register("qty_borrowed", { valueAsNumber: true })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" min={1} />
                        {errors.qty_borrowed && <p className="text-xs text-red-400 mt-1">{errors.qty_borrowed.message}</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes</label>
                    <textarea {...register("notes")} rows={2} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none" placeholder="Optional notes..." />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={handleClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 border border-white/10 transition-colors">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? "Issuing..." : "Issue Item"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}





