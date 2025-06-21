'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { generatePublicUrl } from '@/lib/utils/generate-code';
import { downloadQRCode, generateQRCode } from '@/lib/utils/qr-generator';
import { motion } from 'framer-motion';
import { Calendar, Copy, Download, Eye, Image, MessageSquare, Plus, QrCode, Search, Trash2, Video } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface MemoryFolder {
  id: string;
  code: string;
  title: string;
  description: string | null;
  created_at: string;
  allow_comments: boolean;
  allow_downloads: boolean;
  thumbnail_url: string | null;
  qr_code_url: string | null;
  media_count?: number;
  comment_count?: number;
}

export default function ManageFolders() {
  const { user } = useAuthStore();
  const [folders, setFolders] = useState<MemoryFolder[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<MemoryFolder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<MemoryFolder | null>(null);

  useEffect(() => {
    fetchFolders();
  }, [user]);

  useEffect(() => {
    const filtered = folders.filter(
      (folder) =>
        folder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        folder.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (folder.description && folder.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredFolders(filtered);
  }, [folders, searchTerm]);

  const fetchFolders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('memory_folders')
        .select(`
          *,
          folder_media(count),
          folder_comments(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const foldersWithCounts = data?.map(folder => ({
        ...folder,
        media_count: folder.folder_media?.[0]?.count || 0,
        comment_count: folder.folder_comments?.[0]?.count || 0,
      })) || [];

      setFolders(foldersWithCounts);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to fetch memory folders');
    } finally {
      setLoading(false);
    }
  };

  const copyPublicUrl = async (code: string) => {
    const url = generatePublicUrl(code);
    await navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const generateAndShowQR = async (folder: MemoryFolder) => {
    try {
      const url = generatePublicUrl(folder.code);
      const qrDataUrl = await generateQRCode(url);
      setQrCodeUrl(qrDataUrl);
      setSelectedFolder(folder);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQR = () => {
    if (qrCodeUrl && selectedFolder) {
      downloadQRCode(qrCodeUrl, `${selectedFolder.title}-QR.png`);
      toast.success('QR code downloaded!');
    }
  };

  const toggleComments = async (folderId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('memory_folders')
        .update({ allow_comments: !currentValue })
        .eq('id', folderId);

      if (error) throw error;

      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? { ...folder, allow_comments: !currentValue }
            : folder
        )
      );

      toast.success(`Comments ${!currentValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating comments setting:', error);
      toast.error('Failed to update comments setting');
    }
  };

  const toggleDownloads = async (folderId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('memory_folders')
        .update({ allow_downloads: !currentValue })
        .eq('id', folderId);

      if (error) throw error;

      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? { ...folder, allow_downloads: !currentValue }
            : folder
        )
      );

      toast.success(`Downloads ${!currentValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating downloads setting:', error);
      toast.error('Failed to update downloads setting');
    }
  };

  const deleteFolder = async (folderId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete associated comments
      await supabase.from('folder_comments').delete().eq('folder_id', folderId);
      
      // Delete associated media
      await supabase.from('folder_media').delete().eq('folder_id', folderId);
      
      // Delete the folder
      const { error } = await supabase.from('memory_folders').delete().eq('id', folderId);

      if (error) throw error;

      setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
      toast.success('Memory folder deleted successfully');
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete memory folder');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Memory Folders</h1>
          <p className="text-gray-600">Create and manage your memory collections.</p>
        </div>
        <Link href="/admin/folders/create">
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Folder
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Folders Grid */}
      {filteredFolders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Eye className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No matching folders found' : 'No memory folders created yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? 'Try adjusting your search terms.'
                : 'Create your first memory folder to get started.'}
            </p>
            {!searchTerm && (
              <Link href="/admin/folders/create">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  Create Memory Folder
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFolders.map((folder) => (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                        {folder.title}
                      </CardTitle>
                      {folder.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {folder.description}
                        </p>
                      )}
                      <CardDescription className="flex items-center space-x-2 mt-2">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(folder.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    <span className="font-mono text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {folder.code}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Thumbnail */}
                  {folder.thumbnail_url && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={folder.thumbnail_url}
                        alt={folder.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Image className="w-4 h-4" />
                      <Video className="w-4 h-4" />
                      <span>{folder.media_count || 0} files</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{folder.comment_count || 0} comments</span>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Comments</span>
                      </div>
                      <Switch
                        checked={folder.allow_comments}
                        onCheckedChange={() => toggleComments(folder.id, folder.allow_comments)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Download className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Downloads</span>
                      </div>
                      <Switch
                        checked={folder.allow_downloads}
                        onCheckedChange={() => toggleDownloads(folder.id, folder.allow_downloads)}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link href={`/admin/folders/${folder.code}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </Link>
                    
                    <Button
                      onClick={() => copyPublicUrl(folder.code)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => generateAndShowQR(folder)}
                          variant="outline"
                          size="sm"
                        >
                          <QrCode className="w-3 h-3 mr-1" />
                          QR Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>QR Code for {selectedFolder?.title}</DialogTitle>
                          <DialogDescription>
                            Share this QR code to give others instant access to this memory folder.
                          </DialogDescription>
                        </DialogHeader>
                        {qrCodeUrl && (
                          <div className="text-center space-y-4">
                            <img
                              src={qrCodeUrl}
                              alt="QR Code"
                              className="mx-auto w-64 h-64 border rounded-lg"
                            />
                            <Button onClick={downloadQR} className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              Download QR Code
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      onClick={() => deleteFolder(folder.id, folder.title)}
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