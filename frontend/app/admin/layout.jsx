'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Users, 
  BookOpen, 
  Tags, 
  BarChart3, 
  Settings,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to load
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-black flex items-center justify-center">
        <Card className="bg-black/40 border-red-900/30 backdrop-blur-sm p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-black flex items-center justify-center">
        <Card className="bg-black/40 border-red-900/30 backdrop-blur-sm p-8">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-red-100 mb-2 font-creepster">Access Denied</h2>
            <p className="text-gray-400">You need admin privileges to access this area.</p>
          </div>
        </Card>
      </div>
    );
  }

  const adminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/stories', label: 'Stories', icon: BookOpen },
    { href: '/admin/categories', label: 'Categories', icon: Tags },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-black">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-red-300 hover:text-red-100">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Site
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6 bg-red-900/30" />
              <div>
                <h1 className="text-3xl font-bold text-red-100 font-creepster">
                  Admin Panel
                </h1>
                <p className="text-gray-400">Manage your dark realm</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-gray-300">Admin: {user?.name}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-3">
            <Card className="bg-black/40 border-red-900/30 backdrop-blur-sm">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-red-100 mb-4">Navigation</h3>
                <nav className="space-y-2">
                  {adminNavItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-300 hover:text-red-100 hover:bg-red-900/20"
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </nav>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
