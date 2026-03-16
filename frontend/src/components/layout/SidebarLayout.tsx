"use client";

import { useAuthStore } from "@/store/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Package, History, LogOut, Loader2, ChevronRight, Menu } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, initialize, user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isInitializing, setIsInitializing] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        initialize();
        setIsInitializing(false);
    }, [initialize]);

    useEffect(() => {
        if (!isInitializing && !isAuthenticated) {
            router.push("/login");
        }
    }, [isInitializing, isAuthenticated, router]);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (e) {
            console.error(e);
        } finally {
            logout();
            toast("Logged out successfully");
            router.push("/login");
        }
    };

    if (isInitializing || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
        );
    }

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Inventory", href: "/items", icon: Package },
        { label: "Borrow Records", href: "/borrow-records", icon: History },
        ...(user?.role === "admin"
            ? [{ label: "User Management", href: "/users", icon: Users }]
            : []),
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden relative">

            {/* Background Decorative Blur */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 blur-[150px] mix-blend-screen pointer-events-none rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-500/10 blur-[150px] mix-blend-screen pointer-events-none rounded-full" />

            {/* Mobile Top Bar */}
            <div className="md:hidden glass-panel border-x-0 border-t-0 border-b border-white/5 p-4 flex justify-between items-center z-40 sticky top-0">
                <div className="flex flex-col">
                    <span className="font-bold text-lg leading-tight text-white tracking-tight">Ceyntics</span>
                    <span className="text-[10px] text-brand-300 uppercase tracking-widest font-semibold">Inventory System</span>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 glass-panel rounded-lg hover:bg-white/5 active:scale-95 transition-all">
                    <Menu className="w-5 h-5 text-slate-300" />
                </button>
            </div>

            {/* Sidebar Navigation */}
            <aside className={cn(
                "fixed md:relative md:flex flex-col w-64 glass-panel border-r border-y-0 border-l-0 border-white/5 h-full z-40 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[4px_0_24px_rgba(0,0,0,0.2)] md:shadow-none",
                sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="p-6 hidden md:block">
                    <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 shadow-lg flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">Ceyntics</h1>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-brand-400/80 ml-[44px]">Inventory System</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 md:py-2 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium relative overflow-hidden",
                                    isActive
                                        ? "text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-brand-500/20 before:to-transparent before:border-l-2 before:border-brand-500"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5 active:scale-[0.98]"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive ? "text-brand-400" : "group-hover:text-slate-300", isActive && "scale-110")} />
                                <span className="relative z-10">{item.label}</span>
                                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <div className="glass-panel rounded-2xl p-4 mb-2 border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-brand-500/10 group-hover:bg-brand-500/20 transition-colors" />
                                <span className="font-bold text-brand-300 group-hover:scale-110 transition-transform">{user?.name?.charAt(0)}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={cn(
                                        "w-1.5 h-1.5 rounded-full animate-pulse",
                                        user?.role === 'admin' ? "bg-amber-400" : "bg-emerald-400"
                                    )} />
                                    <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider font-semibold">
                                        {user?.role} Access
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 active:scale-[0.98]"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto relative z-30 flex flex-col pt-16 md:pt-0">
                <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-forwards relative z-10">
                    {children}
                </div>

                {/* Footer */}
                <footer className="w-full text-center py-4 border-t border-white/5 glass-panel mt-auto rounded-none border-x-0 border-b-0 backdrop-blur-md relative z-20">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} Ceyntics Systems
                    </p>
                </footer>
            </main>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300"
                />
            )}
        </div>
    );
}
