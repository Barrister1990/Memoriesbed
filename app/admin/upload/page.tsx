'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, Video, Copy, CheckCircle, Shuffle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUploadStore, useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { generateMemoryCode, generatePublicUrl } from '@/lib/utils/generate-code';
import { toast } from 'sonner';

export default function UploadMemory() {
  const { user } = useAuthStore();
  const {
    title,
    allowComments,
    allowDownloads,
    images,
    videos,
    isUploading,
    setTitle,
    setAllowComments,
    setAllowDownloads,
    addImages,
    addVideos,
    removeImage,
    removeVideo,
    setIsUploading,
    reset,
  } = useUploadStore();

  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

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

  const uploadFile = async (file: File, bucket: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleUpload = async () => {
    if (!title.trim() || (images.length === 0 && videos.length === 0)) {
      toast.error('Please provide a title and at least one image or video.');
      return;
    }

    setIsUploading(true);
    const code = generateMemoryCode();

    try {
      // Upload all files
      const imageUrls = await Promise.all(
        images.map((file) => uploadFile(file, 'memory-images'))
      );
      const videoUrls = await Promise.all(
        videos.map((file) => uploadFile(file, 'memory-videos'))
      );

      // Create memory record
      const { data: memory, error: memoryError } = await supabase
        .from('memories')
        .insert([
          {
            code,
            title: title.trim(),
            user_id: user!.id,
            allow_comments: allowComments,
            allow_downloads: allowDownloads,
            thumbnail_url: imageUrls[0] || null,
          },
        ])
        .select()
        .single();

      if (memoryError) throw memoryError;

      // Create media records
      const mediaRecords = [
        ...imageUrls.map((url, index) => ({
          memory_id: memory.id,
          media_url: url,
          media_type: 'image' as const,
          order_index: index,
        })),
        ...videoUrls.map((url, index) => ({
          memory_id: memory.id,
          media_url: url,
          media_type: 'video' as const,
          order_index: images.length + index,
        })),
      ];

      const { error: mediaError } = await supabase
        .from('memory_media')
        .insert(mediaRecords);

      if (mediaError) throw mediaError;

      // Generate public URL
      const url = generatePublicUrl(code);
      setGeneratedCode(code);
      setPublicUrl(url);

      toast.success('Memory uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload memory. Please try again.');
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

  const handleReset = () => {
    reset();
    setGeneratedCode(null);
    setPublicUrl(null);
    setCopiedUrl(false);
  };

  if (generatedCode && publicUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Memory Created Successfully!</CardTitle>
            <CardDescription className="text-green-700">
              Your memory has been uploaded and is ready to share.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">Memory Code</h3>
              <p className="font-mono text-2xl text-center bg-gray-100 rounded-lg py-3 text-gray-800">
                {generatedCode}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">Public Link</h3>
              <div className="flex space-x-2">
                <Input
                  value={publicUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  {copiedUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleReset}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Upload Another Memory
              </Button>
              <Button
                onClick={() => window.open(publicUrl, '_blank')}
                variant="outline"
                className="flex-1"
              >
                View Memory
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload New Memory</h1>
        <p className="text-gray-600">Create a beautiful memorial page with photos and videos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Memory Details */}
        <Card>
          <CardHeader>
            <CardTitle>Memory Details</CardTitle>
            <CardDescription>Provide information about this memory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Memory Title
              </label>
              <Input
                type="text"
                placeholder="e.g., Mom's 70th Birthday Celebration"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
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
          </CardContent>
        </Card>

        {/* Upload Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Media</CardTitle>
            <CardDescription>Add photos and videos to your memory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos ({images.length})
              </label>
              <div
                {...imageDropzone.getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  imageDropzone.isDragActive
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <input {...imageDropzone.getInputProps()} />
                <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Drop images here or click to browse
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
                  videoDropzone.isDragActive
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <input {...videoDropzone.getInputProps()} />
                <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Drop videos here or click to browse
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
          </CardContent>
        </Card>
      </div>

      {/* Upload Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={isUploading || !title.trim() || (images.length === 0 && videos.length === 0)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold"
        >
          {isUploading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Create Memory</span>
            </div>
          )}
        </Button>
      </div>
    </motion.div>
  );
}