'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, Trash2, Copy, Eye, MessageSquare, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { generatePublicUrl } from '@/lib/utils/generate-code';
import { toast } from 'sonner';

interface Memory {
  id: string;
  code: string;
  title: string;
  created_at: string;
  allow_comments: boolean;
  allow_downloads: boolean;
  thumbnail_url: string | null;
}

export default function ManageMemories() {
  const { user } = useAuthStore();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, [user]);

  useEffect(() => {
    const filtered = memories.filter(
      (memory) =>
        memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMemories(filtered);
  }, [memories, searchTerm]);

  const fetchMemories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast.error('Failed to fetch memories');
    } finally {
      setLoading(false);
    }
  };

  const copyPublicUrl = async (code: string) => {
    const url = generatePublicUrl(code);
    await navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const toggleComments = async (memoryId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('memories')
        .update({ allow_comments: !currentValue })
        .eq('id', memoryId);

      if (error) throw error;

      setMemories((prev) =>
        prev.map((memory) =>
          memory.id === memoryId
            ? { ...memory, allow_comments: !currentValue }
            : memory
        )
      );

      toast.success(`Comments ${!currentValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating comments setting:', error);
      toast.error('Failed to update comments setting');
    }
  };

  const toggleDownloads = async (memoryId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('memories')
        .update({ allow_downloads: !currentValue })
        .eq('id', memoryId);

      if (error) throw error;

      setMemories((prev) =>
        prev.map((memory) =>
          memory.id === memoryId
            ? { ...memory, allow_downloads: !currentValue }
            : memory
        )
      );

      toast.success(`Downloads ${!currentValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating downloads setting:', error);
      toast.error('Failed to update downloads setting');
    }
  };

  const deleteMemory = async (memoryId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete associated comments
      await supabase.from('comments').delete().eq('memory_id', memoryId);
      
      // Delete associated media
      await supabase.from('memory_media').delete().eq('memory_id', memoryId);
      
      // Delete the memory
      const { error } = await supabase.from('memories').delete().eq('id', memoryId);

      if (error) throw error;

      setMemories((prev) => prev.filter((memory) => memory.id !== memoryId));
      toast.success('Memory deleted successfully');
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast.error('Failed to delete memory');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Memories</h1>
        <p className="text-gray-600">View, edit, and manage your uploaded memories.</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Memories Grid */}
      {filteredMemories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Eye className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No matching memories found' : 'No memories uploaded yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? 'Try adjusting your search terms.'
                : 'Upload your first memory to get started.'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => window.location.href = '/admin/upload'}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Upload Memory
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMemories.map((memory) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                        {memory.title}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(memory.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    <span className="font-mono text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {memory.code}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Thumbnail */}
                  {memory.thumbnail_url && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={memory.thumbnail_url}
                        alt={memory.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Comments</span>
                      </div>
                      <Switch
                        checked={memory.allow_comments}
                        onCheckedChange={() => toggleComments(memory.id, memory.allow_comments)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Download className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Downloads</span>
                      </div>
                      <Switch
                        checked={memory.allow_downloads}
                        onCheckedChange={() => toggleDownloads(memory.id, memory.allow_downloads)}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      onClick={() => window.open(generatePublicUrl(memory.code), '_blank')}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      onClick={() => copyPublicUrl(memory.code)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    
                    <Button
                      onClick={() => deleteMemory(memory.id, memory.title)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}