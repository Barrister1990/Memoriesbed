'use client';

import { Button } from '@/components/ui/button';
import { CommentsSection } from '@/components/ui/comments-section';
import { MemoryGallery } from '@/components/ui/memory-gallery';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Download, Eye, Heart, MessageCircle } from 'lucide-react';
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        
        {/* Animated orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Spotlight effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Glass Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/10 border-b border-white/20 sticky top-0 z-40"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-white/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Gallery</span>
                </Button>
              </Link>
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-white text-lg tracking-wide">Memories Bed</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            {/* Hero Section */}
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight mb-6">
                  {memory.title}
                </h1>
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl -z-10 opacity-50"></div>
              </motion.div>
              
              {memory.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light"
                >
                  {memory.description}
                </motion.p>
              )}
              
              {/* Meta Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-6 text-white/70"
              >
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">
                    {new Date(memory.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30">
                  <span className="font-mono text-sm font-semibold text-purple-200">
                    #{memory.code}
                  </span>
                </div>
                
                {isFolder && (
                  <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-400/30">
                    <span className="text-sm font-semibold text-blue-200">
                      Memory Folder
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  {memory.allow_downloads && (
                    <div className="flex items-center space-x-1 text-green-300">
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Downloads</span>
                    </div>
                  )}
                  {memory.allow_comments && (
                    <div className="flex items-center space-x-1 text-blue-300">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Comments</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 text-purple-300">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{formattedMedia.length} {formattedMedia.length === 1 ? 'Item' : 'Items'}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Gallery Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"></div>
              <div className="relative p-8 md:p-12">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Gallery</h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                </div>
                <MemoryGallery
                  media={formattedMedia}
                  allowDownloads={memory.allow_downloads}
                  title={memory.title}
                />
              </div>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"></div>
              <div className="relative p-4 md:p-4">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {memory.allow_comments ? 'Comments & Reactions' : 'Memory Details'}
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                </div>
                <CommentsSection
                  memoryId={memory.id}
                  allowComments={memory.allow_comments}
                  isFolder={isFolder}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-1/2 left-4 transform -translate-y-1/2 z-20 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          className="space-y-4"
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white/30 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
            />
          ))}
        </motion.div>
      </div>

      <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-20 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4 }}
          className="space-y-4"
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white/30 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}