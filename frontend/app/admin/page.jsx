'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  Tags, 
  Eye,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  // Mock data - replace with real API calls
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-blue-400'
    },
    {
      title: 'Total Stories',
      value: '567',
      change: '+8%',
      icon: BookOpen,
      color: 'text-green-400'
    },
    {
      title: 'Categories',
      value: '23',
      change: '+2',
      icon: Tags,
      color: 'text-purple-400'
    },
    {
      title: 'Total Views',
      value: '45.2K',
      change: '+15%',
      icon: Eye,
      color: 'text-red-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-black/40 border-red-900/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Activity className="h-8 w-8 text-red-400" />
            <div>
              <h2 className="text-2xl font-bold text-red-100">Welcome to Admin Dashboard</h2>
              <p className="text-gray-400">Monitor and manage your dark stories platform</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-black/40 border-red-900/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-red-100">{stat.value}</p>
                  <p className="text-sm text-green-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-red-900/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-red-100">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New user registered', user: 'DarkReader123', time: '2 minutes ago' },
                { action: 'Story published', user: 'ShadowWriter', time: '15 minutes ago' },
                { action: 'Category created', user: 'Admin', time: '1 hour ago' },
                { action: 'User reported content', user: 'NightWatcher', time: '2 hours ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/30">
                  <div>
                    <p className="text-sm text-red-100">{activity.action}</p>
                    <p className="text-xs text-gray-400">by {activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-red-900/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-red-100">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { service: 'Database', status: 'Operational', color: 'text-green-400' },
                { service: 'File Storage', status: 'Operational', color: 'text-green-400' },
                { service: 'Email Service', status: 'Operational', color: 'text-green-400' },
                { service: 'Chat System', status: 'Operational', color: 'text-green-400' }
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/30">
                  <span className="text-sm text-red-100">{service.service}</span>
                  <span className={`text-xs font-medium ${service.color}`}>
                    ● {service.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
