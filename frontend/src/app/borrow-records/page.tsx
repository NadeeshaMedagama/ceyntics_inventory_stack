"use client";

import SidebarLayout from "@/components/layout/SidebarLayout";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { History, Search, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import IssueBorrowModal from "@/components/modals/IssueBorrowModal";

export default function BorrowRecordsPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showIssueModal, setShowIssueModal] = useState(false);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/borrow-records");
            setRecords(data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarLayout>
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            Borrowing System
                        </h1>
                        <p className="text-slate-400 mt-1">Track items lent to third parties.</p>
                    </div>
                    <button onClick={() => setShowIssueModal(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                        <ArrowUpRight className="w-5 h-5" />
                        Issue Item
                    </button>
                </div>

                <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Borrower</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Item</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Dates</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 animate-pulse">Loading records...</td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No borrow records found.</td>
                                    </tr>
                                ) : (
                                    records.map((record) => (
                                        <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-white tracking-tight">{record.borrower_name}</p>
                                                <p className="text-xs text-slate-500">{record.contact}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-200">{record.item_name}</p>
                                                <p className="text-xs text-brand-400 font-mono mt-0.5">{record.item_code} <span className="text-slate-500">x{record.qty_borrowed}</span></p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs space-y-1">
                                                    <p className="text-slate-400"><span className="text-slate-500 w-12 inline-block">Out:</span> {record.borrow_date}</p>
                                                    <p className={cn("font-medium", new Date(record.expected_return_date) < new Date() && record.status === 'active' ? 'text-red-400' : 'text-slate-300')}>
                                                        <span className="text-slate-500 w-12 inline-block">Due:</span> {record.expected_return_date}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {record.status === 'returned' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded border border-emerald-500/20">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Returned
                                                    </span>
                                                ) : new Date(record.expected_return_date) < new Date() ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider rounded border border-red-500/20">
                                                        <AlertCircle className="w-3.5 h-3.5" /> Overdue
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider rounded border border-amber-500/20">
                                                        <History className="w-3.5 h-3.5" /> Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {record.status !== 'returned' && (
                                                    <button className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg border border-emerald-500/20 transition-all flex items-center justify-center gap-2 ml-auto">
                                                        <ArrowDownRight className="w-4 h-4" /> Return Item
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <IssueBorrowModal
                isOpen={showIssueModal}
                onClose={() => setShowIssueModal(false)}
                onSuccess={fetchRecords}
            />
        </SidebarLayout>
    );
}
