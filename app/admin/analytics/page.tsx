'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Download, 
  Calendar,
  Users,
  Globe,
  Clock,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

interface AnalyticsData {
  totalViews: number;
  totalComments: number;
  totalDownloads: number;
  viewsThisWeek: number;
  viewsLastWeek: number;
  topFolders: Array<{
    id: string;
    title: string;
    code: string;
    view_count: number;
    comment_count: number;
  }>;
  recentActivity: Array<{
    id: string;
    event_type: string;
    created_at: string;
    folder_title: string;
    folder_code: string;
  }>;
  viewsByDay: Array<{
    date: string;
    views: number;
  }>;
}

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalComments: 0,
    totalDownloads: 0,
    viewsThisWeek: 0,
    viewsLastWeek: 0,
    topFolders: [],
    recentActivity: [],
    viewsByDay: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      // Get user's folders
      const { data: folders, error: foldersError } = await supabase
        .from('memory_folders')
        .select('id, title, code, view_count')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (foldersError) throw foldersError;

      const folderIds = folders?.map(f => f.id) || [];

      // Get analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('folder_analytics')
        .select('*')
        .in('folder_id', folderIds)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (analyticsError) throw analyticsError;

      // Get comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from('folder_comments')
        .select('*', { count: 'exact', head: true })
        .in('folder_id', folderIds);

      if (commentsError) throw commentsError;

      // Process analytics data
      const totalViews = folders?.reduce((sum, folder) => sum + (folder.view_count || 0), 0) || 0;
      const totalDownloads = analyticsData?.filter(a => a.event_type === 'download').length || 0;
      
      // Calculate views this week vs last week
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      
      const viewsThisWeek = analyticsData?.filter(a => 
        a.event_type === 'view' && new Date(a.created_at) >= oneWeekAgo
      ).length || 0;
      
      const viewsLastWeek = analyticsData?.filter(a => 
        a.event_type === 'view' && 
        new Date(a.created_at) >= twoWeeksAgo && 
        new Date(a.created_at) < oneWeekAgo
      ).length || 0;

      // Get top folders with comment counts
      const topFolders = await Promise.all(
        (folders || [])
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 5)
          .map(async (folder) => {
            const { count: commentCount } = await supabase
              .from('folder_comments')
              .select('*', { count: 'exact', head: true })
              .eq('folder_id', folder.id);
            
            return {
              ...folder,
              comment_count: commentCount || 0,
            };
          })
      );

      // Get recent activity
      const { data: recentActivity } = await supabase
        .from('folder_analytics')
        .select(`
          *,
          memory_folders!inner(title, code)
        `)
        .in('folder_id', folderIds)
        .order('created_at', { ascending: false })
        .limit(10);

      // Generate views by day for the last 7 days
      const viewsByDay = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const views = analyticsData?.filter(a => 
          a.event_type === 'view' &&
          new Date(a.created_at) >= dayStart &&
          new Date(a.created_at) <= dayEnd
        ).length || 0;

        viewsByDay.push({
          date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          views,
        });
      }

      setAnalytics({
        totalViews,
        totalComments: commentsCount || 0,
        totalDownloads,
        viewsThisWeek,
        viewsLastWeek,
        topFolders,
        recentActivity: recentActivity?.map(a => ({
          id: a.id,
          event_type: a.event_type,
          created_at: a.created_at,
          folder_title: a.memory_folders.title,
          folder_code: a.memory_folders.code,
        })) || [],
        viewsByDay,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthPercentage = () => {
    if (analytics.viewsLastWeek === 0) return analytics.viewsThisWeek > 0 ? 100 : 0;
    return Math.round(((analytics.viewsThisWeek - analytics.viewsLastWeek) / analytics.viewsLastWeek) * 100);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'view': return Eye;
      case 'comment': return MessageSquare;
      case 'download': return Download;
      default: return Globe;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'view': return 'text-blue-600';
      case 'comment': return 'text-green-600';
      case 'download': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const growthPercentage = getGrowthPercentage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your memory collections' performance and engagement.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {analytics.totalViews.toLocaleString()}
            </div>
            <div className="flex items-center text-sm">
              <TrendingUp className={`w-3 h-3 mr-1 ${growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
              </span>
              <span className="text-gray-500 ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Comments</CardTitle>
              <MessageSquare className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {analytics.totalComments.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Messages from visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Downloads</CardTitle>
              <Download className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {analytics.totalDownloads.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Media files downloaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {analytics.viewsThisWeek.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Views in last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Views by Day</span>
            </CardTitle>
            <CardDescription>Daily view counts for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.viewsByDay.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day.date}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.max((day.views / Math.max(...analytics.viewsByDay.map(d => d.views))) * 100, 5)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {day.views}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Folders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Top Performing Folders</span>
            </CardTitle>
            <CardDescription>Most viewed memory collections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topFolders.map((folder, index) => (
                <div key={folder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{folder.title}</h4>
                      <p className="text-sm text-gray-500 font-mono">{folder.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm font-semibold text-gray-700">
                      <Eye className="w-3 h-3" />
                      <span>{folder.view_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <MessageSquare className="w-3 h-3" />
                      <span>{folder.comment_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>Latest interactions with your memory collections</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity</p>
              <p className="text-sm">Activity will appear here as people interact with your memories</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.recentActivity.map((activity) => {
                const EventIcon = getEventIcon(activity.event_type);
                return (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <EventIcon className={`w-4 h-4 ${getEventColor(activity.event_type)}`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        Someone {activity.event_type === 'view' ? 'viewed' : activity.event_type === 'comment' ? 'commented on' : 'downloaded from'}{' '}
                        <span className="font-medium">{activity.folder_title}</span>
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="font-mono">{activity.folder_code}</span>
                        <span>•</span>
                        <span>{new Date(activity.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}