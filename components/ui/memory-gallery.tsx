import { ChevronLeft, ChevronRight, Download, Play, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
}

interface MemoryGalleryProps {
  media: Media[];
  allowDownloads: boolean;
  title: string;
}

export function MemoryGallery({ media, allowDownloads, title }: MemoryGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<{[key: string]: boolean}>({});
  const videoRefs = useRef<{[key: string]: HTMLVideoElement | null}>({});
  
  // Touch/swipe state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance to trigger navigation
  const minSwipeDistance = 50;

  const handleKeyPress = (e: KeyboardEvent) => {
    if (selectedIndex === null) return;
    
    if (e.key === 'Escape') {
      setSelectedIndex(null);
    } else if (e.key === 'ArrowLeft') {
      navigateGallery('prev');
    } else if (e.key === 'ArrowRight') {
      navigateGallery('next');
    }
  };

  useEffect(() => {
    if (selectedIndex !== null) {
      document.addEventListener('keydown', handleKeyPress);
    }
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedIndex]);

  const navigateGallery = (direction: 'prev' | 'next') => {
    if (selectedIndex === null) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = selectedIndex === 0 ? media.length - 1 : selectedIndex - 1;
    } else {
      newIndex = selectedIndex === media.length - 1 ? 0 : selectedIndex + 1;
    }
    setSelectedIndex(newIndex);
    setSwipeOffset(0); // Reset swipe offset when navigating
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const currentTouch = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    
    const deltaX = currentTouch.x - touchStart.x;
    const deltaY = Math.abs(currentTouch.y - touchStart.y);
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      setIsDragging(true);
      setSwipeOffset(deltaX);
      // Prevent default to stop page scrolling
      e.preventDefault();
    }
    
    setTouchEnd(currentTouch);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = Math.abs(touchStart.y - touchEnd.y);
    
    // Only trigger navigation if it's primarily a horizontal swipe
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swiped left - go to next
        navigateGallery('next');
      } else {
        // Swiped right - go to previous
        navigateGallery('prev');
      }
    } else {
      // Reset offset if swipe wasn't strong enough
      setSwipeOffset(0);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
    setTimeout(() => setSwipeOffset(0), 300); // Reset with animation
  };

  return (
    <div className="min-h-screen text-black">
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-gray-400 text-sm sm:text-base">
          {media.length} items
        </p>
      </div>

      {/* Gallery Grid - Mobile First Approach */}
      <div className="px-2 sm:px-4 lg:px-8 pb-8">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 sm:gap-2 lg:gap-3">
          {media.map((item, index) => (
            <div
              key={item.id}
              className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg sm:rounded-xl bg-gray-900 transform transition-all duration-300 hover:scale-105 hover:z-10 active:scale-95"
              onClick={() => setSelectedIndex(index)}
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`
              }}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={`Gallery item ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <video
                  ref={(el) => (videoRefs.current[item.id] = el)}
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  loop
                />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Video Play Icon */}
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-1" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div 
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors duration-200"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Navigation Buttons - Hidden on small screens, shown on hover for larger screens */}
          <button
            onClick={() => navigateGallery('prev')}
            className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14 bg-black/50 backdrop-blur-sm rounded-full items-center justify-center text-white hover:bg-black/70 transition-all duration-200 opacity-0 hover:opacity-100"
            style={{ animation: 'fadeIn 0.3s ease-out 0.5s both' }}
          >
            <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7" />
          </button>
          
          <button
            onClick={() => navigateGallery('next')}
            className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14 bg-black/50 backdrop-blur-sm rounded-full items-center justify-center text-white hover:bg-black/70 transition-all duration-200 opacity-0 hover:opacity-100"
            style={{ animation: 'fadeIn 0.3s ease-out 0.5s both' }}
          >
            <ChevronRight className="w-6 h-6 lg:w-7 lg:h-7" />
          </button>

          {/* Media Container with Swipe Transform */}
          <div 
            className="flex items-center justify-center h-full p-4 sm:p-6 lg:p-8"
            onClick={(e) => {
              // Only close if not dragging and clicked on background
              if (!isDragging && e.target === e.currentTarget) {
                setSelectedIndex(null);
              }
            }}
          >
            <div 
              className="relative max-w-full max-h-full transition-transform duration-300 ease-out"
              onClick={(e) => e.stopPropagation()}
              style={{
                animation: swipeOffset === 0 ? 'scaleIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both' : 'none',
                transform: `translateX(${swipeOffset * 0.3}px) scale(${1 - Math.abs(swipeOffset) * 0.0005})`,
                opacity: 1 - Math.abs(swipeOffset) * 0.001
              }}
            >
              {media[selectedIndex].type === 'image' ? (
                <img
                  src={media[selectedIndex].url}
                  alt={`${title} - Image ${selectedIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg sm:rounded-xl shadow-2xl"
                  draggable={false}
                />
              ) : (
                <video
                  src={media[selectedIndex].url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-lg sm:rounded-xl shadow-2xl"
                />
              )}
            </div>
          </div>

          {/* Mobile Navigation Dots */}
          <div className="sm:hidden absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === selectedIndex ? 'bg-white scale-125' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Swipe Indicator */}
          {isDragging && Math.abs(swipeOffset) > 20 && (
            <div className="sm:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                {swipeOffset > 0 ? (
                  <ChevronLeft className="w-6 h-6 text-white" />
                ) : (
                  <ChevronRight className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
          )}

          {/* Counter and Download */}
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-20">
            <div className="text-white/80 text-sm sm:text-base">
              {selectedIndex + 1} of {media.length}
            </div>
            
            {allowDownloads && (
              <button
                onClick={() => handleDownload(
                  media[selectedIndex].url,
                  `${title}-${selectedIndex + 1}.${media[selectedIndex].type === 'image' ? 'jpg' : 'mp4'}`
                )}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}