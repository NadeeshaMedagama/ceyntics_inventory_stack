"use client";

import SidebarLayout from "@/components/layout/SidebarLayout";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { ShieldCheck, UserPlus, Server, Activity, ShieldAlert } from "lucide-react";
import CreateUserModal from "@/components/modals/CreateUserModal";

interface UserRecord {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function UsersPage() {
    const { user } = useAuthStore();
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/users");
            setUsers(data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'admin') {
        return (
            <SidebarLayout>
                <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                        <ShieldAlert className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-slate-400 max-w-sm">You need Administrator privileges to view user management and audit logs.</p>
                </div>
            </SidebarLayout>
        );
    }

    return (
        <SidebarLayout>
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            Organization Access
                        </h1>
                        <p className="text-slate-400 mt-1">Manage staff accounts and monitor system actions.</p>
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)]">
                        <UserPlus className="w-5 h-5" />
                        Provision Account
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* User List */}
                    <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            <h2 className="font-bold text-white uppercase tracking-wider text-sm">Active Personnel</h2>
                        </div>
                        <div className="p-4 flex-1">
                            {loading ? (
                                <p className="text-center text-slate-500 py-8 animate-pulse">Loading directory...</p>
                            ) : (
                                <div className="space-y-3">
                                    {users.map((u) => (
                                        <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                                    <span className="font-bold text-indigo-400">{u.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{u.name}</p>
                                                    <p className="text-xs text-slate-500">{u.email}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-brand-500/10 text-brand-400 border-brand-500/20'}`}>
                                                {u.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Audit Log Overview Panel */}
                    <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-indigo-600/5 pointer-events-none" />
                        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-brand-400" />
                                <h2 className="font-bold text-white uppercase tracking-wider text-sm">Action Pipeline</h2>
                            </div>
                            <button disabled className="text-xs text-brand-400 font-medium hover:text-brand-300">View All Logs &rarr;</button>
                        </div>

                        <div className="p-8 flex-1 flex flex-col items-center justify-center text-center relative z-10">
                            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                                <Server className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Audit Microservice Active</h3>
                            <p className="text-sm text-slate-400 max-w-[280px]">All CRUD operations, inventory modifications, and user transactions are being logged sequentially via event hooks.</p>

                            <div className="mt-8 flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Listening on Port 8005</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <CreateUserModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchUsers}
            />
        </SidebarLayout>
    );
}
