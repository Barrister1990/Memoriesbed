'use client';

import { Button } from '@/components/ui/button';
import { CommentsSection } from '@/components/ui/comments-section';
import { MemoryGallery } from '@/components/ui/memory-gallery';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Heart } from 'lucide-react';
import Link from 'next/link';

interface Memory {
  id: string;
  title: string;
  code: string;
  created_at: string;
  allow_comments: boolean;
  allow_downloads: boolean;
  thumbnail_url: string | null;
  description?: string | null;
  type?: 'folder' | 'memory';
  media: Array<{
    id: string;
    media_url: string;
    media_type: 'image' | 'video';
    order_index: number;
  }>;
}

interface MemoryViewProps {
  memory: Memory;
}

export function MemoryView({ memory }: MemoryViewProps) {
  const formattedMedia = memory.media.map((item) => ({
    id: item.id,
    url: item.media_url,
    type: item.media_type,
  }));

  const isFolder = memory.type === 'folder';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2 text-purple-600 hover:text-purple-700">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-purple-600" />
              <span className="font-bold text-purple-600">Memories Bed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Memory Header */}
          <div className="text-center space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-serif font-bold text-gray-900 leading-tight"
            >
              {memory.title}
            </motion.h1>
            
            {memory.description && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
              >
                {memory.description}
              </motion.p>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center space-x-4 text-gray-600"
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(memory.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <span>•</span>
              <span className="font-mono text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {memory.code}
              </span>
              {isFolder && (
                <>
                  <span>•</span>
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Memory Folder
                  </span>
                </>
              )}
            </motion.div>
          </div>

          {/* Media Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <MemoryGallery
              media={formattedMedia}
              allowDownloads={memory.allow_downloads}
              title={memory.title}
            />
          </motion.div>

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <CommentsSection
              memoryId={memory.id}
              allowComments={memory.allow_comments}
              isFolder={isFolder}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}