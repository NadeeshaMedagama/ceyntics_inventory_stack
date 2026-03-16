"use client";

import SidebarLayout from "@/components/layout/SidebarLayout";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Copy, Plus, Search, Filter, HardDrive, Cpu, AlertCircle, PenLine, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import AddItemModal from "@/components/modals/AddItemModal";

export default function ItemsPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/items");
            setItems(data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        'in-store': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'borrowed': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        'damaged': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'missing': 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <SidebarLayout>
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            Inventory Log
                        </h1>
                        <p className="text-slate-400 mt-1">Manage all organization tools and devices.</p>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]">
                        <Plus className="w-5 h-5" />
                        Add New Item
                    </button>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by name, code, or serial..."
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-all font-medium whitespace-nowrap">
                        <Filter className="w-5 h-5" />
                        Filter Status
                    </button>
                </div>

                {/* Table View */}
                <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Item</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Code/Serial</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Stock</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Location</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 animate-pulse">
                                            Loading inventory data...
                                        </td>
                                    </tr>
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            No items found in inventory.
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                        {item.image_url ? (
                                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                                                        ) : (
                                                            <HardDrive className="w-5 h-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white tracking-tight">{item.name}</p>
                                                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{item.description || 'No description'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">{item.code}</span>
                                                    <button className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all">
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                {item.serial_number && <p className="text-xs text-slate-500 mt-1 font-mono">{item.serial_number}</p>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("font-semibold text-lg", item.quantity === 0 ? "text-red-400" : "text-white")}>
                                                        {item.quantity}
                                                    </span>
                                                    <span className="text-xs text-slate-500">units</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border", statusColors[item.status as keyof typeof statusColors])}>
                                                    {item.status.replace('-', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.place ? (
                                                    <div>
                                                        <p className="text-sm text-slate-300 font-medium">{item.place.name}</p>
                                                        <p className="text-xs text-slate-500">{item.place.cupboard.name}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-500 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 text-slate-300 transition-colors">
                                                        <PenLine className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 rounded-lg border border-white/5 text-red-400 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center text-sm text-slate-400">
                        <span>Showing {items.length} items</span>
                        <div className="flex gap-2">
                            <button disabled className="px-3 py-1 bg-white/5 disabled:opacity-50 rounded-md">Previous</button>
                            <button disabled className="px-3 py-1 bg-white/5 disabled:opacity-50 rounded-md">Next</button>
                        </div>
                    </div>
                </div>

            </div>

            <AddItemModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchItems}
            />
        </SidebarLayout>
    );
}
