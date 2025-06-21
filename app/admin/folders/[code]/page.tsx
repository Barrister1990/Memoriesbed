'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { generatePublicUrl } from '@/lib/utils/generate-code';
import { downloadQRCode, generateQRCode } from '@/lib/utils/qr-generator';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Copy,
    Download,
    Eye,
    GalleryHorizontal,
    Image,
    MessageSquare,
    Plus,
    QrCode,
    Settings,
    Trash2,
    Video
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface FolderMedia {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  file_name: string;
  file_size: number;
  order_index: number;
  created_at: string;
  cloudinary_public_id?: string;
}

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
  view_count: number;
}

interface FolderDetailPageProps {
  params: Promise<{
    code: string;
  }>;
}

// Cloudinary configuration - replace with your values
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset';


// Upload to Cloudinary with high quality settings (unsigned upload compatible)
const uploadToCloudinary = async (file: File, mediaType: 'image' | 'video', folderCode: string): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', `memory-folders/${folderCode}`);
  
  // Add tags for better organization
  formData.append('tags', `${mediaType},${folderCode},memory-folder`);
  
  // Add context for metadata
  formData.append('context', `folder_code=${folderCode}|media_type=${mediaType}`);
  
  // For videos, specify resource type
  if (mediaType === 'video') {
    formData.append('resource_type', 'video');
  }
  
  const resourceType = mediaType === 'video' ? 'video' : 'image';
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Cloudinary upload failed: ${error.error?.message || 'Unknown error'}`);
  }

  const result = await response.json();
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId: string, mediaType: 'image' | 'video'): Promise<void> => {
  const resourceType = mediaType === 'video' ? 'video' : 'image';
  
  // Note: This requires server-side implementation for security
  // You'll need to create an API endpoint that handles Cloudinary deletions
  const response = await fetch('/api/cloudinary/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publicId,
      resourceType,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete from Cloudinary');
  }
};

export default function FolderDetailPage({ params }: FolderDetailPageProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const resolvedParams = use(params);
  const [folder, setFolder] = useState<MemoryFolder | null>(null);
  const [media, setMedia] = useState<FolderMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const imageDropzone = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.tiff', '.bmp'],
    },
    onDrop: handleImageUpload,
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB for high-res images
  });

  const videoDropzone = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv'],
    },
    onDrop: handleVideoUpload,
    multiple: true,
    maxSize: 500 * 1024 * 1024, // 500MB for high-quality videos
  });

  useEffect(() => {
    fetchFolderData();
  }, [resolvedParams.code, user]);

  const fetchFolderData = async () => {
    if (!user) return;

    try {
      // Fetch folder details
      const { data: folderData, error: folderError } = await supabase
        .from('memory_folders')
        .select('*')
        .eq('code', resolvedParams.code.toUpperCase())
        .eq('user_id', user.id)
        .single();

      if (folderError) {
        if (folderError.code === 'PGRST116') {
          toast.error('Folder not found or access denied');
          router.push('/admin/folders');
          return;
        }
        throw folderError;
      }

      setFolder(folderData);
      setEditTitle(folderData.title);
      setEditDescription(folderData.description || '');

      // Fetch media
      const { data: mediaData, error: mediaError } = await supabase
        .from('folder_media')
        .select('*')
        .eq('folder_id', folderData.id)
        .order('order_index');

      if (mediaError) throw mediaError;

      setMedia(mediaData || []);
    } catch (error) {
      console.error('Error fetching folder data:', error);
      toast.error('Failed to load folder data');
    } finally {
      setLoading(false);
    }
  };

  async function handleImageUpload(acceptedFiles: File[]) {
    if (!folder) return;
    await uploadFiles(acceptedFiles, 'image');
  }

  async function handleVideoUpload(acceptedFiles: File[]) {
    if (!folder) return;
    await uploadFiles(acceptedFiles, 'video');
  }

  const uploadFiles = async (files: File[], mediaType: 'image' | 'video') => {
    if (!folder) return;

    setUploading(true);
    setUploadProgress({});

    try {
      const uploadPromises = files.map(async (file, index) => {
        const progressKey = `${file.name}-${index}`;
        
        try {
          setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));
          
          // Upload to Cloudinary with high quality
          const { url, publicId } = await uploadToCloudinary(file, mediaType, folder.code);
          
          setUploadProgress(prev => ({ ...prev, [progressKey]: 100 }));

          return {
            folder_id: folder.id,
            media_url: url,
            media_type: mediaType,
            order_index: media.length + index,
            file_name: file.name,
            file_size: file.size,
            cloudinary_public_id: publicId,
          };
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setUploadProgress(prev => ({ ...prev, [progressKey]: -1 })); // -1 indicates error
          throw error;
        }
      });

      toast.info(`Uploading ${files.length} ${mediaType}(s) to Cloudinary...`);
      
      const mediaRecords = await Promise.all(uploadPromises);

      // Save to database
      const { error: insertError } = await supabase
        .from('folder_media')
        .insert(mediaRecords);

      if (insertError) throw insertError;

      // Update thumbnail if this is the first image
      if (mediaType === 'image' && media.length === 0) {
        // Generate optimized thumbnail URL from Cloudinary
        const thumbnailUrl = mediaRecords[0].media_url.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto:best/');
        
        await supabase
          .from('memory_folders')
          .update({ thumbnail_url: thumbnailUrl })
          .eq('id', folder.id);
      }

      await fetchFolderData();
      toast.success(`${files.length} high-quality ${mediaType}(s) uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${mediaType}s: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const deleteMedia = async (mediaId: string, mediaUrl: string, cloudinaryPublicId?: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      // Delete from database first
      const { error: deleteError } = await supabase
        .from('folder_media')
        .delete()
        .eq('id', mediaId);

      if (deleteError) throw deleteError;

      // Delete from Cloudinary if we have the public ID
      if (cloudinaryPublicId) {
        const mediaType = mediaUrl.includes('/video/') ? 'video' : 'image';
        try {
          await deleteFromCloudinary(cloudinaryPublicId, mediaType);
        } catch (cloudinaryError) {
          console.warn('Failed to delete from Cloudinary:', cloudinaryError);
          // Continue anyway since we've already deleted from database
        }
      }

      await fetchFolderData();
      toast.success('Media deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete media');
    }
  };

  const updateFolderSettings = async (field: string, value: boolean) => {
    if (!folder) return;

    try {
      const { error } = await supabase
        .from('memory_folders')
        .update({ [field]: value })
        .eq('id', folder.id);

      if (error) throw error;

      setFolder({ ...folder, [field]: value });
      toast.success(`${field === 'allow_comments' ? 'Comments' : 'Downloads'} ${value ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update setting');
    }
  };

  const saveEditedFolder = async () => {
    if (!folder) return;

    try {
      const { error } = await supabase
        .from('memory_folders')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
        })
        .eq('id', folder.id);

      if (error) throw error;

      setFolder({
        ...folder,
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      });
      setEditMode(false);
      toast.success('Folder updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update folder');
    }
  };

  const deleteFolder = async () => {
    if (!folder) return;
    
    const confirmText = `DELETE ${folder.title}`;
    const userInput = prompt(
      `This will permanently delete the folder "${folder.title}" and all its media.\n\nType "${confirmText}" to confirm:`
    );

    if (userInput !== confirmText) {
      toast.error('Deletion cancelled - text did not match');
      return;
    }

    try {
      // Delete all media from Cloudinary
      for (const mediaItem of media) {
        if (mediaItem.cloudinary_public_id) {
          const mediaType = mediaItem.media_url.includes('/video/') ? 'video' : 'image';
          try {
            await deleteFromCloudinary(mediaItem.cloudinary_public_id, mediaType);
          } catch (error) {
            console.warn(`Failed to delete ${mediaItem.file_name} from Cloudinary:`, error);
          }
        }
      }

      // Delete folder and all related data (cascade will handle media and comments)
      const { error } = await supabase
        .from('memory_folders')
        .delete()
        .eq('id', folder.id);

      if (error) throw error;

      toast.success('Folder deleted successfully');
      router.push('/admin/folders');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete folder');
    }
  };

  const generateAndShowQR = async () => {
    if (!folder) return;

    try {
      const url = generatePublicUrl(folder.code);
      const qrDataUrl = await generateQRCode(url);
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQR = () => {
    if (qrCodeUrl && folder) {
      downloadQRCode(qrCodeUrl, `${folder.title}-QR.png`);
      toast.success('QR code downloaded!');
    }
  };

  const copyPublicUrl = async () => {
    if (!folder) return;
    const url = generatePublicUrl(folder.code);
    await navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const getOptimizedImageUrl = (url: string, width = 400, height = 300) => {
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto:best,f_auto/`);
    }
    return url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Folder not found</p>
        <Link href="/admin/folders">
          <Button className="mt-4">Back to Folders</Button>
        </Link>
      </div>
    );
  }

  const images = media.filter(m => m.media_type === 'image');
  const videos = media.filter(m => m.media_type === 'video');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
{/* Mobile-First Header with Desktop-Optimized Layout */}
<div className="space-y-4 lg:space-y-6">
  {/* Mobile-only Back Button */}
  <div className="lg:hidden">
    <Link href="/admin/folders">
      <Button variant="ghost" size="sm" className="w-full justify-start">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Folders
      </Button>
    </Link>
  </div>

  {/* Desktop: Horizontal layout with back button, title, and primary actions */}
  <div className="hidden lg:flex lg:items-start lg:justify-between lg:gap-8">
    {/* Left side: Back button + Title section */}
    <div className="flex-1 min-w-0">
      <div className="space-y-3">
        {/* Desktop Back Button */}
        <Link href="/admin/folders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Folders
          </Button>
        </Link>

        {/* Title */}
        <div>
          <h1 className="text-3xl xl:text-4xl font-bold text-gray-900 leading-tight">
            {editMode ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-3xl xl:text-4xl font-bold border-none p-0 h-auto w-full max-w-2xl"
                placeholder="Folder title..."
              />
            ) : (
              folder.title
            )}
          </h1>
          
          {/* Metadata - Horizontal layout on desktop */}
          <div className="flex items-center space-x-6 text-sm text-gray-600 mt-3">
            <span className="font-mono bg-purple-100 text-purple-700 px-3 py-1.5 rounded-md">
              {folder.code}
            </span>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(folder.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{folder.view_count} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Right side: Action buttons in compact layout */}
    <div className="flex-shrink-0">
      {editMode ? (
        <div className="flex space-x-3">
          <Button onClick={saveEditedFolder} size="sm" className="px-6">
            Save Changes
          </Button>
          <Button 
            onClick={() => setEditMode(false)} 
            variant="outline" 
            size="sm"
            className="px-6"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Primary Actions - Horizontal on desktop */}
          <div className="flex space-x-3">
            <Button
              onClick={() => router.push(`/admin/folders/${resolvedParams.code}/gallery`)}
              variant="outline"
              size="sm"
              className="px-4"
            >
              <GalleryHorizontal className="w-4 h-4 mr-2" />
              Gallery
            </Button>
            <Button 
              onClick={() => window.open(generatePublicUrl(folder.code), '_blank')}
              size="sm"
              className="px-4"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Public
            </Button>
          </div>

          {/* Secondary Actions - More compact on desktop */}
          <div className="flex space-x-2">
            <Button 
              onClick={() => setEditMode(true)} 
              variant="outline" 
              size="sm"
              className="px-3"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button 
              onClick={copyPublicUrl} 
              variant="outline" 
              size="sm"
              className="px-3"
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  onClick={generateAndShowQR} 
                  variant="outline" 
                  size="sm"
                  className="px-3"
                >
                  <QrCode className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">
                    QR Code for {folder.title}
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Share this QR code to give others instant access to this memory folder.
                  </DialogDescription>
                </DialogHeader>
                {qrCodeUrl && (
                  <div className="text-center space-y-4 py-2">
                    <div className="flex justify-center">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-40 h-40 sm:w-48 sm:h-48 border rounded-lg"
                      />
                    </div>
                    <Button onClick={downloadQR} className="w-full" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download QR Code
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  </div>

  {/* Mobile & Tablet Layout (existing mobile-first design) */}
  <div className="lg:hidden space-y-4">
    {/* Title Section */}
    <div className="space-y-3">
      {/* Desktop Back Button - Hidden on mobile, shown on tablet */}
      <div className="hidden sm:block">
        <Link href="/admin/folders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Folders
          </Button>
        </Link>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {editMode ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-2xl sm:text-3xl font-bold border-none p-0 h-auto w-full"
              placeholder="Folder title..."
            />
          ) : (
            folder.title
          )}
        </h1>
        
        {/* Metadata - Stack vertically on mobile */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 text-sm text-gray-600 mt-2">
          <span className="font-mono bg-purple-100 text-purple-700 px-2 py-1 rounded self-start">
            {folder.code}
          </span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(folder.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{folder.view_count} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="w-full">
      {editMode ? (
        /* Edit Mode - Mobile first button layout */
        <div className="space-y-2 sm:space-y-0 sm:flex sm:space-x-3">
          <Button onClick={saveEditedFolder} size="sm" className="w-full sm:w-auto">
            Save Changes
          </Button>
          <Button 
            onClick={() => setEditMode(false)} 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      ) : (
        /* View Mode - Progressive enhancement from mobile */
        <div className="space-y-3">
          {/* Primary Actions - Single column on mobile, two columns on tablet */}
          <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
            <Button
              onClick={() => router.push(`/admin/folders/${resolvedParams.code}/gallery`)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <GalleryHorizontal className="w-4 h-4 mr-2" />
              View Gallery
            </Button>
            <Button 
              onClick={() => window.open(generatePublicUrl(folder.code), '_blank')}
              size="sm"
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Public
            </Button>
          </div>

          {/* Secondary Actions - Mobile first approach */}
          <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-2">
            <Button 
              onClick={() => setEditMode(true)} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Folder
            </Button>
            
            <Button 
              onClick={copyPublicUrl} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  onClick={generateAndShowQR} 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">
                    QR Code for {folder.title}
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Share this QR code to give others instant access to this memory folder.
                  </DialogDescription>
                </DialogHeader>
                {qrCodeUrl && (
                  <div className="text-center space-y-4 py-2">
                    <div className="flex justify-center">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-40 h-40 sm:w-48 sm:h-48 border rounded-lg"
                      />
                    </div>
                    <Button onClick={downloadQR} className="w-full" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download QR Code
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

      {/* Description */}
      {(folder.description || editMode) && (
        <Card>
          <CardContent className="p-6">
            {editMode ? (
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add a description for this memory collection..."
                rows={3}
              />
            ) : (
              <p className="text-gray-700">{folder.description}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Folder Settings</CardTitle>
          <CardDescription>Control how visitors can interact with this folder</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Allow Comments</p>
                <p className="text-sm text-gray-500">Let people leave messages and memories</p>
              </div>
            </div>
            <Switch
              checked={folder.allow_comments}
              onCheckedChange={(value) => updateFolderSettings('allow_comments', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Allow Downloads</p>
                <p className="text-sm text-gray-500">Let people download photos and videos</p>
              </div>
            </div>
            <Switch
              checked={folder.allow_downloads}
              onCheckedChange={(value) => updateFolderSettings('allow_downloads', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High-Quality Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image className="w-5 h-5" />
              <span>High-Quality Photos ({images.length})</span>
            </CardTitle>
            <CardDescription>Upload high-resolution photos with optimal quality preservation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...imageDropzone.getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                imageDropzone.isDragActive
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400'
              }`}
            >
              <input {...imageDropzone.getInputProps()} />
              <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Drop high-resolution images here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, GIF, WebP, TIFF up to 50MB each
              </p>
              <p className="text-xs text-purple-600 mt-1 font-medium">
                ✨ Cloudinary powered - Best quality preservation
              </p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={getOptimizedImageUrl(image.media_url, 200, 150)}
                      alt={image.file_name}
                      className="w-full h-24 object-cover rounded transition-transform hover:scale-105"
                      loading="lazy"
                    />
                    <Button
                      onClick={() => deleteMedia(image.id, image.media_url, image.cloudinary_public_id)}
                      className="absolute top-1 right-1 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* High-Quality Video Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Video className="w-5 h-5" />
              <span>High-Quality Videos ({videos.length})</span>
            </CardTitle>
            <CardDescription>Upload high-definition videos with streaming optimization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...videoDropzone.getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                videoDropzone.isDragActive
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400'
              }`}
            >
              <input {...videoDropzone.getInputProps()} />
              <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Drop HD videos here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                MP4, MOV, AVI, WebM, MKV up to 500MB each
              </p>
              <p className="text-xs text-purple-600 mt-1 font-medium">
                ✨ Optimized for streaming with best quality
              </p>
            </div>

            {videos.length > 0 && (
              <div className="space-y-2">
                {videos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {video.file_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(video.file_size / 1024 / 1024).toFixed(1)} MB • High Quality
                      </p>
                    </div>
                    <Button
                      onClick={() => deleteMedia(video.id, video.media_url, video.cloudinary_public_id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Upload Status */}
      {uploading && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-800 font-medium">Uploading to Cloudinary with best quality...</span>
              </div>
              
              {Object.entries(uploadProgress).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(uploadProgress).map(([fileName, progress]) => (
                    <div key={fileName} className="flex items-center space-x-3">
                      <span className="text-sm text-blue-700 flex-1 truncate">{fileName.split('-')[0]}</span>
                      <div className="w-20 bg-blue-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            progress === -1 ? 'bg-red-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.max(0, progress)}%` }}
                        />
                      </div>
                      <span className="text-xs text-blue-600 w-12 text-right">
                        {progress === -1 ? 'Error' : `${progress}%`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for this folder</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={deleteFolder}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Folder Permanently
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}