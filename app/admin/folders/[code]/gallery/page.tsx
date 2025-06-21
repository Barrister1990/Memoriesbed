'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Download,
    Eye,
    Grid3X3,
    Heart,
    Maximize,
    Pause,
    Play,
    RotateCw,
    Share2,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    X,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useRef, useState } from 'react';
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

interface ViewGalleryPageProps {
  params: Promise<{
    code: string;
  }>;
}

// Custom Video Player Component
const VideoPlayer = ({ src, poster, onClose }: { src: string; poster: string; onClose: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    video.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    video.currentTime = newTime;
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black group flex items-center justify-center"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="max-w-full max-h-full object-contain cursor-pointer"
        onClick={togglePlay}
      />

      {/* Play/Pause Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-black/50 rounded-full p-4 backdrop-blur-sm"
            >
              {isPlaying ? (
                <Pause className="w-12 h-12 text-white" />
              ) : (
                <Play className="w-12 h-12 text-white ml-1" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close button for non-fullscreen */}
      {!isFullscreen && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            size="sm"
            variant="ghost"
            className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6"
          >
            {/* Progress Bar */}
            <div
              ref={progressRef}
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-4 relative overflow-hidden"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              <div
                className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all"
                style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-8px' }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 p-2"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 p-2"
                  onClick={() => skipTime(-10)}
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 p-2"
                  onClick={() => skipTime(10)}
                >
                  <SkipForward className="w-5 h-5" />
                </Button>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 p-2"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 accent-purple-500"
                  />
                </div>

                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 p-2"
                  onClick={toggleFullscreen}
                >
                  <Maximize className="w-5 h-5" />
                </Button>

                {isFullscreen && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 p-2"
                    onClick={onClose}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Custom Image Viewer Component
const ImageViewer = ({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="max-w-none max-h-none object-contain cursor-grab active:cursor-grabbing transition-transform"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
          cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        draggable={false}
      />

      {/* Image Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-black/50 border-white/30 text-white hover:bg-black/70"
          onClick={handleZoomIn}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-black/50 border-white/30 text-white hover:bg-black/70"
          onClick={handleZoomOut}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-black/50 border-white/30 text-white hover:bg-black/70"
          onClick={handleRotate}
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-black/50 border-white/30 text-white hover:bg-black/70"
          onClick={handleReset}
        >
          Reset
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-black/50 border-white/30 text-white hover:bg-black/70"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Zoom indicator */}
      {zoom !== 1 && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {Math.round(zoom * 100)}%
        </div>
      )}
    </div>
  );
};

export default function ViewGalleryPage({ params }: ViewGalleryPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [folder, setFolder] = useState<MemoryFolder | null>(null);
  const [media, setMedia] = useState<FolderMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');
  const [filter, setFilter] = useState<'all' | 'images' | 'videos'>('all');
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchGalleryData();
  }, [resolvedParams.code]);

  useEffect(() => {
    // Increment view count
    if (folder) {
      incrementViewCount();
    }
  }, [folder]);

  const fetchGalleryData = async () => {
    try {
      // Fetch folder details
      const { data: folderData, error: folderError } = await supabase
        .from('memory_folders')
        .select('*')
        .eq('code', resolvedParams.code.toUpperCase())
        .single();

      if (folderError) {
        if (folderError.code === 'PGRST116') {
          toast.error('Gallery not found');
          router.push('/');
          return;
        }
        throw folderError;
      }

      setFolder(folderData);

      // Fetch media
      const { data: mediaData, error: mediaError } = await supabase
        .from('folder_media')
        .select('*')
        .eq('folder_id', folderData.id)
        .order('order_index');

      if (mediaError) throw mediaError;

      setMedia(mediaData || []);
    } catch (error) {
      console.error('Error fetching gallery data:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    if (!folder) return;
    
    try {
      await supabase
        .from('memory_folders')
        .update({ view_count: folder.view_count + 1 })
        .eq('id', folder.id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const getOptimizedImageUrl = (url: string, width = 800, height = 600) => {
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto:best,f_auto/`);
    }
    return url;
  };

  const getThumbnailUrl = (url: string) => {
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto:best,f_auto/');
    }
    return url;
  };

  const getVideoThumbnail = (videoUrl: string) => {
    if (videoUrl.includes('cloudinary.com')) {
      // Extract video format and replace with jpg thumbnail
      const thumbnailUrl = videoUrl
        .replace('/video/upload/', '/video/upload/so_0/')
        .replace(/\.(mp4|mov|avi|mkv|webm)$/i, '.jpg');
      return thumbnailUrl;
    }
    return videoUrl; // Fallback to original URL if not Cloudinary
  };

  const filteredMedia = media.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'images') return item.media_type === 'image';
    if (filter === 'videos') return item.media_type === 'video';
    return true;
  });

  const handleMediaClick = (index: number) => {
    setSelectedMediaIndex(index);
  };

  const handleNextMedia = () => {
    if (selectedMediaIndex !== null) {
      const nextIndex = (selectedMediaIndex + 1) % filteredMedia.length;
      setSelectedMediaIndex(nextIndex);
    }
  };

  const handlePrevMedia = () => {
    if (selectedMediaIndex !== null) {
      const prevIndex = selectedMediaIndex === 0 ? filteredMedia.length - 1 : selectedMediaIndex - 1;
      setSelectedMediaIndex(prevIndex);
    }
  };

  const handleLike = (mediaId: string) => {
    setLiked(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(mediaId)) {
        newLiked.delete(mediaId);
      } else {
        newLiked.add(mediaId);
      }
      return newLiked;
    });
  };

  const handleDownload = async (mediaUrl: string, fileName: string) => {
    if (!folder?.allow_downloads) {
      toast.error('Downloads are not allowed for this gallery');
      return;
    }

    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: folder?.title,
          text: folder?.description || 'Check out this memory gallery!',
          url: url,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Gallery link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Gallery not found</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const selectedMedia = selectedMediaIndex !== null ? filteredMedia[selectedMediaIndex] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-white/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {folder.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(folder.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{folder.view_count} views</span>
                  </div>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                    {media.length} items
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="hover:bg-white/50"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Description */}
      {folder.description && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <p className="text-gray-700 text-center">{folder.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex bg-white/60 backdrop-blur-sm rounded-lg p-1">
              {['all', 'images', 'videos'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    filter === filterType
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'masonry' : 'grid')}
              className="bg-white/60 backdrop-blur-sm hover:bg-white/80"
            >
              <Grid3X3 className="w-4 h-4 mr-1" />
              {viewMode === 'grid' ? 'Masonry' : 'Grid'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredMedia.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-500">No media found</p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
                : 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'
            }`}
          >
            <AnimatePresence>
              {filteredMedia.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`${viewMode === 'masonry' ? 'break-inside-avoid mb-4' : ''} group cursor-pointer`}
                  onClick={() => handleMediaClick(index)}
                >
                  <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="relative">
                      {item.media_type === 'image' ? (
                        <img
                          src={getThumbnailUrl(item.media_url)}
                          alt={item.file_name}
                          className="w-full h-auto object-cover"
                          loading="lazy"/>
                      ) : (
                        <div className="relative">
                          <img
                            src={getVideoThumbnail(item.media_url)}
                            alt={item.file_name}
                            className="w-full h-auto object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="bg-white/90 rounded-full p-3">
                              <Play className="w-6 h-6 text-gray-800" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white hover:bg-white/20 p-1 h-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLike(item.id);
                                }}
                              >
                                <Heart 
                                  className={`w-4 h-4 ${
                                    liked.has(item.id) ? 'fill-red-500 text-red-500' : ''
                                  }`} 
                                />
                              </Button>
                              {folder.allow_downloads && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-white hover:bg-white/20 p-1 h-auto"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(item.media_url, item.file_name);
                                  }}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                              {item.media_type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Media Viewer Dialog */}
      <Dialog open={selectedMediaIndex !== null} onOpenChange={() => setSelectedMediaIndex(null)}>
        <DialogContent className="max-w-7xl w-full max-h-[95vh] h-full p-0 bg-black border-none">
          {selectedMedia && (
            <div className="relative w-full h-full">
              {/* Navigation */}
              <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                    onClick={handlePrevMedia}
                    disabled={filteredMedia.length <= 1}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                    onClick={handleNextMedia}
                    disabled={filteredMedia.length <= 1}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    {(selectedMediaIndex || 0) + 1} of {filteredMedia.length}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(selectedMedia.id);
                    }}
                  >
                    <Heart 
                      className={`w-5 h-5 ${
                        liked.has(selectedMedia.id) ? 'fill-red-500 text-red-500' : ''
                      }`} 
                    />
                  </Button>
                  {folder.allow_downloads && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(selectedMedia.media_url, selectedMedia.file_name);
                      }}
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Media Content */}
              <div className="w-full h-full">
                {selectedMedia.media_type === 'image' ? (
                  <ImageViewer
                    src={getOptimizedImageUrl(selectedMedia.media_url)}
                    alt={selectedMedia.file_name}
                    onClose={() => setSelectedMediaIndex(null)}
                  />
                ) : (
                  <VideoPlayer
                    src={selectedMedia.media_url}
                    poster={getVideoThumbnail(selectedMedia.media_url)}
                    onClose={() => setSelectedMediaIndex(null)}
                  />
                )}
              </div>

              {/* Media Info */}
              <div className="absolute bottom-4 left-4 right-4 z-50">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
                  <h3 className="font-medium text-lg mb-1">{selectedMedia.file_name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span>{selectedMedia.media_type.toUpperCase()}</span>
                    <span>{(selectedMedia.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    <span>{new Date(selectedMedia.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Keyboard Navigation */}
      <div className="sr-only">
        <button
          onClick={handlePrevMedia}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') handlePrevMedia();
            if (e.key === 'ArrowRight') handleNextMedia();
            if (e.key === 'Escape') setSelectedMediaIndex(null);
          }}
        />
      </div>
    </div>
  );
}