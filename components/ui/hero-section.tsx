'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQRScannerStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Heart, Search, Shield, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Particle {
  id: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
}

export function HeroSection() {
  const [memoryCode, setMemoryCode] = useState('');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { setIsOpen } = useQRScannerStore();
  const router = useRouter();

  // Generate particles only on client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const generatedParticles: Particle[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(generatedParticles);
  }, []);

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (memoryCode.trim().length === 6) {
      router.push(`/view/${memoryCode.trim().toUpperCase()}`);
    } else {
      toast.error('Please enter a valid 6-character memory code');
    }
  };

  return (
    <>
      <div className="relative min-h-screen overflow-hidden pt-12 sm:pt-8 pb-3">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://nwxypbgsjdgplrvqkhqo.supabase.co/storage/v1/object/public/uploads//hero-background2.MP4" type="video/mp4" />
            <source src="/videos/hero-background.webm" type="video/webm" />
            {/* Fallback gradient background if video fails to load */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800" />
          </video>
          
          {/* Video Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-indigo-900/30 to-purple-800/30" />
        </div>

        {/* Floating Particles (only render on client) */}
        {isClient && (
          <div className="absolute inset-0 z-5">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 bg-white/5 rounded-full"
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  delay: particle.delay,
                }}
              />
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Logo and Brand */}
              <div className="flex items-center justify-center space-x-3 mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <Heart className="h-12 w-12 text-pink-300 drop-shadow-lg" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0"
                  >
                    <Sparkles className="h-12 w-12 text-yellow-300 opacity-60 drop-shadow-lg" />
                  </motion.div>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-4xl md:text-5xl font-serif font-bold text-white drop-shadow-lg"
                >
                  Memories Bed
                </motion.h1>
              </div>

              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-4"
              >
                <h2 className="text-3xl md:text-6xl font-serif font-bold text-white leading-tight drop-shadow-lg">
                  Make Your Memories
                  <span className="block bg-gradient-to-r from-pink-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg">
                    Last Forever
                  </span>
                </h2>
                <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                  We preserve your precious photos and videos online, creating a beautiful digital gallery that will never fade, break, or get lost.
                </p>
              </motion.div>

              {/* Action Cards */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="justify-center max-w-2xl mx-auto sm:px-12"
              >
                {/* Memory Code Card */}
                <Card className="bg-white/15 backdrop-blur-md border-white/30 hover:bg-white/20 transition-all duration-300 shadow-2xl">
                  <CardContent className="p-6">
                    <form onSubmit={handleCodeSubmit} className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Enter 6-character code"
                          value={memoryCode}
                          onChange={(e) => setMemoryCode(e.target.value.toUpperCase())}
                          maxLength={6}
                          className="pl-10 h-12 bg-white/95 border-white/30 text-gray-900 placeholder-gray-500 rounded-xl font-mono text-center text-lg tracking-wider shadow-lg"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={memoryCode.length !== 6}
                        className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center space-x-2">
                          <span>View Your Gallery</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </Button>
                    </form>
                    <p className="text-white text-sm mt-3 text-center drop-shadow-sm">
                      Access your preserved memory collection
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Features Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16"
              >
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Shield className="w-6 h-6 text-green-300 drop-shadow-sm" />
                  </div>
                  <h3 className="text-lg font-semibold text-white drop-shadow-sm">Safe & Secure</h3>
                  <p className="text-white/90 text-sm drop-shadow-sm">
                    Your photos and videos are securely stored online, protected from damage and loss
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Clock className="w-6 h-6 text-blue-300 drop-shadow-sm" />
                  </div>
                  <h3 className="text-lg font-semibold text-white drop-shadow-sm">Timeless Preservation</h3>
                  <p className="text-white/90 text-sm drop-shadow-sm">
                    Unlike physical photos that fade, your digital memories stay vibrant forever
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Heart className="w-6 h-6 text-pink-300 drop-shadow-sm" />
                  </div>
                  <h3 className="text-lg font-semibold text-white drop-shadow-sm">Easy Sharing</h3>
                  <p className="text-white/90 text-sm drop-shadow-sm">
                    Share your preserved memories with family and friends through beautiful galleries
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

    </>
  );
}