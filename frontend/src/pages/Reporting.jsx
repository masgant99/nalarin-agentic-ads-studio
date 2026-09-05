import React from 'react';
import { ArrowUpRight, ArrowDownRight, MousePointer, Eye, BarChart2, BarChart, Download } from 'lucide-react';

const StatCard = ({ title, value, change, trend, icon: Icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                <Icon size={20} />
            </div>
            <span className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}
                {trend === 'up' ? <ArrowUpRight size={16} className="ml-1" /> : <ArrowDownRight size={16} className="ml-1" />}
            </span>
        </div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
);

const Reporting = () => {
    const stats = [
        { label: "Total Impressions", value: "124.5K", change: "+12.3%", trend: "up", icon: Eye, color: "text-amber-600" },
        { label: "Total Clicks", value: "3,842", change: "+5.4%", trend: "up", icon: MousePointer, color: "text-green-600" },
        { label: "Avg. CTR", value: "3.1%", change: "-0.2%", trend: "down", icon: BarChart2, color: "text-red-600" },
        { label: "Conversion Rate", value: "1.8%", change: "+0.1%", trend: "up", icon: BarChart, color: "text-purple-600" },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <BarChart size={32} className="text-amber-600" />
                        Campaign Reporting
                    </h1>
                    <p className="text-gray-600">Track performance across all your campaigns</p>
                </div>
                <div className="flex gap-2">
                    <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Month</option>
                        <option>Last Month</option>
                    </select>
                    <button className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${stat.color.replace('text-', 'bg-').replace('600', '50')}`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                            <span className={`flex items-center text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Over Time</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-full bg-amber-100 rounded-t-sm relative group">
                                <div
                                    className="absolute bottom-0 left-0 w-full bg-amber-500 rounded-t-sm transition-all duration-500 group-hover:bg-amber-600"
                                    style={{ height: `${Math.random() * 100}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Platform Distribution</h3>
                    <div className="flex items-center justify-center h-64">
                        <div className="relative w-48 h-48">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                <path
                                    className="text-gray-100"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3.8"
                                />
                                <path
                                    className="text-amber-500"
                                    strokeDasharray="75, 100"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3.8"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-3xl font-bold text-gray-900">75%</span>
                                <span className="text-xs text-gray-500 uppercase font-medium">Facebook</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reporting;
