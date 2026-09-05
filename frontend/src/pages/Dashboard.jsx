import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Image, Video, Star, TrendingUp, Zap, Wand2, Package, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function Dashboard() {
    const { authFetch } = useAuth();
    const [statsData, setStatsData] = useState({
        brands_count: 0,
        products_count: 0,
        generated_ads_count: 0,
        templates_count: 0,
        campaigns_count: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await authFetch(`${API_URL}/dashboard/stats`);
                if (response.ok) {
                    const data = await response.json();
                    setStatsData(data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            }
        };

        fetchStats();
    }, [authFetch]);

    const stats = [
        { label: 'Total Campaigns', value: statsData.campaigns_count, icon: TrendingUp, color: 'bg-amber-500' },
        { label: 'Generated Ads', value: statsData.generated_ads_count, icon: Image, color: 'bg-orange-500' },
        { label: 'Active Brands', value: statsData.brands_count, icon: ShoppingBag, color: 'bg-amber-600' },
        { label: 'Templates', value: statsData.templates_count, icon: Star, color: 'bg-yellow-500' },
    ];

    const quickActions = [
        { label: 'Build Creatives', description: 'Create new image or video ads', icon: Wand2, path: '/build-creatives', color: 'from-amber-500 to-orange-500' },
        { label: 'Manage Brands', description: 'Update brand assets and profiles', icon: ShoppingBag, path: '/brands', color: 'from-orange-500 to-red-500' },
        { label: 'Browse Templates', description: 'Explore winning ad templates', icon: Star, path: '/winning-ads', color: 'from-amber-600 to-yellow-600' },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <LayoutDashboard size={32} className="text-amber-600" />
                    Dashboard
                </h1>
                <p className="text-gray-600 mt-2">Welcome to your Ad Builder workspace</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                                    <Icon className="text-white" size={24} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={index}
                                to={action.path}
                                className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all"
                            >
                                <div className={`bg-gradient-to-r ${action.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className="text-white" size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{action.label}</h3>
                                <p className="text-sm text-gray-600">{action.description}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="text-center py-12 text-gray-500">
                    <Zap size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>No recent activity yet</p>
                    <p className="text-sm mt-2">Start creating ads to see your activity here</p>
                </div>
            </div>
        </div>
    );
}
