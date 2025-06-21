'use client';

import { motion } from 'framer-motion';
import { Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center text-white max-w-md"
      >
        <div className="mb-8">
          <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
          <h1 className="text-6xl font-bold mb-2">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Memory Not Found</h2>
          <p className="text-purple-200 leading-relaxed">
            The memory you're looking for doesn't exist or may have been removed.
            Please check the memory code and try again.
          </p>
        </div>
        
        <Link href="/">
          <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-3 rounded-full backdrop-blur-sm transition-all duration-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}