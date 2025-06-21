'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore, useFolderStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { generateMemoryCode, generatePublicUrl } from '@/lib/utils/generate-code';
import { downloadQRCode, generateQRCode } from '@/lib/utils/qr-generator';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Copy, Download, Image, QrCode, Upload, Video } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

export default function CreateFolder() {
  const { user } = useAuthStore();
  const {
    title,
    description,
    allowComments,
    allowDownloads,
    images,
    videos,
    isCreating,
    isUploading,
    generatedCode,
    qrCodeUrl,
    setTitle,
    setDescription,
    setAllowComments,
    setAllowDownloads,
    addImages,
    addVideos,
    removeImage,
    removeVideo,
    setIsCreating,
    setIsUploading,
    setGeneratedCode,
    setQrCodeUrl,
    reset,
  } = useFolderStore();

  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const imageDropzone = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    onDrop: (acceptedFiles) => {
      addImages(acceptedFiles);
    },
    multiple: true,
  });

  const videoDropzone = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
    },
    onDrop: (acceptedFiles) => {
      addVideos(acceptedFiles);
    },
    multiple: true,
  });

  const uploadFile = async (file: File, bucket: string, folderCode: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folderCode}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleCreateFolder = async () => {
    if (!title.trim()) {
      toast.error('Please provide a folder title.');
      return;
    }

    setIsCreating(true);
    const code = generateMemoryCode();

    try {
      // Create folder record
      const { data: folder, error: folderError } = await supabase
        .from('memory_folders')
        .insert([
          {
            code,
            title: title.trim(),
            description: description.trim() || null,
            user_id: user!.id,
            allow_comments: allowComments,
            allow_downloads: allowDownloads,
          },
        ])
        .select()
        .single();

      if (folderError) throw folderError;

      // Generate QR code
      const url = generatePublicUrl(code);
      const qrDataUrl = await generateQRCode(url);

      // Update folder with QR code URL (optional - you might want to store this)
      await supabase
        .from('memory_folders')
        .update({ qr_code_url: qrDataUrl })
        .eq('id', folder.id);

      setGeneratedCode(code);
      setQrCodeUrl(qrDataUrl);
      setPublicUrl(url);
      setShowSuccessDialog(true);

      toast.success('Memory folder created successfully!');
    } catch (error) {
      console.error('Create folder error:', error);
      toast.error('Failed to create memory folder. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUploadMedia = async () => {
    if (!generatedCode || (images.length === 0 && videos.length === 0)) {
      toast.error('Please add at least one image or video.');
      return;
    }

    setIsUploading(true);

    try {
      // Get folder ID
      const { data: folder } = await supabase
        .from('memory_folders')
        .select('id')
        .eq('code', generatedCode)
        .single();

      if (!folder) throw new Error('Folder not found');

      // Upload all files
      const imageUrls = await Promise.all(
        images.map((file) => uploadFile(file, 'memory-images', generatedCode))
      );
      const videoUrls = await Promise.all(
        videos.map((file) => uploadFile(file, 'memory-videos', generatedCode))
      );

      // Create media records
      const mediaRecords = [
        ...imageUrls.map((url, index) => ({
          folder_id: folder.id,
          media_url: url,
          media_type: 'image' as const,
          order_index: index,
          file_name: images[index].name,
          file_size: images[index].size,
        })),
        ...videoUrls.map((url, index) => ({
          folder_id: folder.id,
          media_url: url,
          media_type: 'video' as const,
          order_index: images.length + index,
          file_name: videos[index].name,
          file_size: videos[index].size,
        })),
      ];

      const { error: mediaError } = await supabase
        .from('folder_media')
        .insert(mediaRecords);

      if (mediaError) throw mediaError;

      // Update folder thumbnail
      if (imageUrls.length > 0) {
        await supabase
          .from('memory_folders')
          .update({ thumbnail_url: imageUrls[0] })
          .eq('id', folder.id);
      }

      toast.success('Media uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload media. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = async () => {
    if (publicUrl) {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedUrl(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const downloadQR = () => {
    if (qrCodeUrl && generatedCode) {
      downloadQRCode(qrCodeUrl, `${title}-QR.png`);
      toast.success('QR code downloaded!');
    }
  };

  const handleReset = () => {
    reset();
    setPublicUrl(null);
    setCopiedUrl(false);
    setShowSuccessDialog(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center space-x-4">
        <Link href="/admin/folders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Folders
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Memory Folder</h1>
          <p className="text-gray-600">Create a new memory collection with photos and videos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Folder Details */}
        <Card>
          <CardHeader>
            <CardTitle>Folder Details</CardTitle>
            <CardDescription>Provide information about this memory collection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder Title *
              </label>
              <Input
                type="text"
                placeholder="e.g., Mom's 70th Birthday Celebration"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                placeholder="Add a description for this memory collection..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Allow Comments</p>
                  <p className="text-sm text-gray-500">Let people leave messages and memories</p>
                </div>
                <Switch
                  checked={allowComments}
                  onCheckedChange={setAllowComments}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Allow Downloads</p>
                  <p className="text-sm text-gray-500">Let people download photos and videos</p>
                </div>
                <Switch
                  checked={allowDownloads}
                  onCheckedChange={setAllowDownloads}
                />
              </div>
            </div>

            {!generatedCode && (
              <Button
                onClick={handleCreateFolder}
                disabled={isCreating || !title.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isCreating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Folder...</span>
                  </div>
                ) : (
                  'Create Folder'
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Upload Media */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Media</CardTitle>
            <CardDescription>
              {generatedCode ? 'Add photos and videos to your folder' : 'Create folder first to upload media'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {generatedCode && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">Folder Created!</p>
                    <p className="text-sm text-green-600">Code: {generatedCode}</p>
                  </div>
                  <Button
                    onClick={() => setShowSuccessDialog(true)}
                    variant="outline"
                    size="sm"
                    className="text-green-700 border-green-300"
                  >
                    <QrCode className="w-4 h-4 mr-1" />
                    View QR
                  </Button>
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos ({images.length})
              </label>
              <div
                {...imageDropzone.getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  !generatedCode
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : imageDropzone.isDragActive
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <input {...imageDropzone.getInputProps()} disabled={!generatedCode} />
                <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {generatedCode ? 'Drop images here or click to browse' : 'Create folder first'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF, WebP up to 10MB each
                </p>
              </div>
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {images.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <Button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Videos ({videos.length})
              </label>
              <div
                {...videoDropzone.getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  !generatedCode
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : videoDropzone.isDragActive
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <input {...videoDropzone.getInputProps()} disabled={!generatedCode} />
                <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {generatedCode ? 'Drop videos here or click to browse' : 'Create folder first'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  MP4, MOV, AVI, WebM up to 100MB each
                </p>
              </div>
              
              {videos.length > 0 && (
                <div className="space-y-2 mt-4">
                  {videos.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <Button
                        onClick={() => removeVideo(index)}
                        className="w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {generatedCode && (images.length > 0 || videos.length > 0) && (
              <Button
                onClick={handleUploadMedia}
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading Media...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Media</span>
                  </div>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Folder Created Successfully!</span>
            </DialogTitle>
            <DialogDescription>
              Your memory folder is ready to share. Use the QR code or public link below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {qrCodeUrl && (
              <div className="text-center">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="mx-auto w-48 h-48 border rounded-lg"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Memory Code</label>
              <div className="font-mono text-xl text-center bg-gray-100 rounded-lg py-2">
                {generatedCode}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Public Link</label>
              <div className="flex space-x-2">
                <Input
                  value={publicUrl || ''}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                >
                  {copiedUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={downloadQR} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
              <Button
                onClick={() => window.open(publicUrl || '', '_blank')}
                variant="outline"
                className="flex-1"
              >
                View Folder
              </Button>
            </div>

            <Button
              onClick={handleReset}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Create Another Folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}