'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderPlus, 
  Upload, 
  Eye, 
  MessageSquare, 
  Download, 
  TrendingUp,
  Calendar,
  Users,
  Heart,
  BarChart3,
  Activity,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

interface DashboardStats {
  totalFolders: number;
  totalViews: number;
  totalComments: number;
  totalMedia: number;
  recentFolders: Array<{
    id: string;
    title: string;
    code: string;
    created_at: string;
    view_count: number;
  }>;
  topFolders: Array<{
    id: string;
    title: string;
    code: string;
    view_count: number;
  }>;
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalFolders: 0,
    totalViews: 0,
    totalComments: 0,
    totalMedia: 0,
    recentFolders: [],
    topFolders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      // Fetch folder stats
      const { data: folders, error: foldersError } = await supabase
        .from('memory_folders')
        .select('id, title, code, created_at, view_count')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (foldersError) throw foldersError;

      // Fetch media count
      const { count: mediaCount, error: mediaError } = await supabase
        .from('folder_media')
        .select('*', { count: 'exact', head: true })
        .in('folder_id', folders?.map(f => f.id) || []);

      if (mediaError) throw mediaError;

      // Fetch comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from('folder_comments')
        .select('*', { count: 'exact', head: true })
        .in('folder_id', folders?.map(f => f.id) || []);

      if (commentsError) throw commentsError;

      // Calculate total views
      const totalViews = folders?.reduce((sum, folder) => sum + (folder.view_count || 0), 0) || 0;

      // Get recent folders (last 5)
      const recentFolders = folders
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5) || [];

      // Get top folders by views (top 5)
      const topFolders = folders
        ?.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 5) || [];

      setStats({
        totalFolders: folders?.length || 0,
        totalViews,
        totalComments: commentsCount || 0,
        totalMedia: mediaCount || 0,
        recentFolders,
        topFolders,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Folders',
      value: stats.totalFolders,
      icon: FolderPlus,
      color: 'from-purple-500 to-indigo-600',
      description: 'Memory collections created',
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'from-blue-500 to-cyan-600',
      description: 'Times memories were viewed',
    },
    {
      title: 'Comments',
      value: stats.totalComments,
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-600',
      description: 'Messages from visitors',
    },
    {
      title: 'Media Files',
      value: stats.totalMedia,
      icon: Upload,
      color: 'from-orange-500 to-red-600',
      description: 'Photos and videos uploaded',
    },
  ];

  const quickActions = [
    {
      title: 'Create New Folder',
      description: 'Start a new memory collection',
      href: '/admin/folders/create',
      icon: FolderPlus,
      color: 'from-purple-600 to-indigo-600',
    },
    {
      title: 'Manage Folders',
      description: 'View and edit existing folders',
      href: '/admin/folders',
      icon: Eye,
      color: 'from-blue-600 to-cyan-600',
    },
    {
      title: 'Upload Memory (Legacy)',
      description: 'Use the legacy upload system',
      href: '/admin/upload',
      icon: Upload,
      color: 'from-green-600 to-emerald-600',
    },
    {
      title: 'Manage Uploads (Legacy)',
      description: 'View legacy memory uploads',
      href: '/admin/manage',
      icon: BarChart3,
      color: 'from-orange-600 to-red-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your memories today.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Common tasks to manage your memories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={action.href}>
                  <Card className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group">
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${action.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Folders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Recent Folders</span>
            </CardTitle>
            <CardDescription>
              Your latest memory collections
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentFolders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No folders created yet</p>
                <Link href="/admin/folders/create">
                  <Button className="mt-2" size="sm">
                    Create Your First Folder
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {folder.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="font-mono">{folder.code}</span>
                        <span>•</span>
                        <span>
                          {new Date(folder.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>{folder.view_count || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Folders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Top Performing</span>
            </CardTitle>
            <CardDescription>
              Most viewed memory collections
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topFolders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No view data yet</p>
                <p className="text-sm">Share your folders to see analytics</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topFolders.map((folder, index) => (
                  <div
                    key={folder.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {folder.title}
                        </h4>
                        <span className="text-sm text-gray-500 font-mono">
                          {folder.code}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Eye className="w-4 h-4" />
                      <span>{folder.view_count || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-purple-900">
                  Keep Creating Beautiful Memories
                </h3>
                <p className="text-purple-700 text-sm">
                  Every memory you preserve helps keep precious moments alive forever.
                </p>
              </div>
            </div>
            <Link href="/admin/folders/create">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <FolderPlus className="w-4 h-4 mr-2" />
                Create New Folder
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}