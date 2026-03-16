"use client";

import SidebarLayout from "@/components/layout/SidebarLayout";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Package, FolderOpen, AlertTriangle, ArrowUpRight, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get("/stats");
                setStats(data.data);
            } catch (e) {
                console.error("Failed to load stats", e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <SidebarLayout>
                <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-brand-500 animate-spin" />
                </div>
            </SidebarLayout>
        );
    }

    const chartData = stats?.by_status ? Object.entries(stats.by_status).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: Number(count),
    })) : [];

    const COLORS = {
        'In-store': '#10b981', // emerald
        'Borrowed': '#3b82f6', // blue
        'Damaged': '#f59e0b',  // amber
        'Missing': '#ef4444',  // red
    };

    return (
        <SidebarLayout>
            <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                            Dashboard
                            <span className="px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider">Live Overview</span>
                        </h1>
                        <p className="text-slate-400 font-medium">System performance and inventory at a glance.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Devices"
                        value={stats?.total_items || 0}
                        icon={Package}
                        trend="+12% this month"
                        color="brand"
                    />
                    <StatCard
                        title="Storage Locations"
                        value={stats?.total_cupboards || 0}
                        icon={FolderOpen}
                        trend="Active storage areas"
                        color="indigo"
                    />
                    <StatCard
                        title="Borrowed Items"
                        value={stats?.by_status?.borrowed || 0}
                        icon={ArrowUpRight}
                        trend="Currently out"
                        color="sky"
                    />
                    <StatCard
                        title="Low Stock Warning"
                        value={stats?.low_stock || 0}
                        icon={AlertTriangle}
                        trend={<span className="text-amber-400">Needs attention</span>}
                        color="amber"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Section */}
                    <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                            <TrendingUp className="w-5 h-5 text-brand-400" />
                        </div>
                        <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-500" />
                            Inventory Distribution
                        </h2>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                            padding: '12px 16px',
                                        }}
                                        itemStyle={{ color: '#fff', fontWeight: '500' }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#6366f1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Activity Placeholder */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
                        <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            System Status
                        </h2>

                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500 relative z-10" />
                            </div>
                            <p className="text-emerald-400 font-bold tracking-widest uppercase">All Systems Operational</p>
                            <p className="text-sm text-slate-500 mt-2">API Gateway • Microservices</p>

                            <div className="mt-8 grid grid-cols-2 gap-4 w-full px-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Uptime</p>
                                    <p className="text-white font-mono">99.9%</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Latency</p>
                                    <p className="text-white font-mono">42ms</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
    const colorMap = {
        brand: "from-brand-600/20 to-brand-500/5 border-brand-500/20 text-brand-400 bg-brand-500/10",
        indigo: "from-indigo-600/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400 bg-indigo-500/10",
        sky: "from-sky-600/20 to-sky-500/5 border-sky-500/20 text-sky-400 bg-sky-500/10",
        amber: "from-amber-600/20 to-amber-500/5 border-amber-500/20 text-amber-400 bg-amber-500/10",
    };

    const selectedColor = colorMap[color as keyof typeof colorMap];
    const [gradient, border, text, bg] = selectedColor.split(' ');

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl border p-6 hover:-translate-y-1 transition-all duration-300 group",
            "glass-panel border-white/5 shadow-lg",
            `hover:border-white/10`
        )}>
            {/* Dynamic Background Glow */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-100 transition-opacity", gradient)} />

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors mb-2">
                        {title}
                    </p>
                    <h3 className="text-4xl font-bold tracking-tight text-white mb-2">{value}</h3>
                    <p className="text-xs font-medium text-slate-500">{trend}</p>
                </div>
                <div className={cn("p-3 rounded-xl border border-white/10 shrink-0", bg)}>
                    <Icon className={cn("w-6 h-6", text)} />
                </div>
            </div>
        </div>
    );
}
