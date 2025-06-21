'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, Heart, Play, Users } from 'lucide-react';

const examples = [
  {
    title: 'Sarah\'s 90th Birthday Celebration',
    description: 'A beautiful collection of photos and videos from a milestone birthday party, shared with family across the globe.',
    image: 'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'Birthday',
    mediaCount: 47,
    comments: 23,
    code: 'DEMO01',
  },
  {
    title: 'The Johnson Family Reunion',
    description: 'Three generations coming together for an unforgettable weekend filled with laughter, stories, and precious moments.',
    image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'Family Reunion',
    mediaCount: 89,
    comments: 41,
    code: 'DEMO02',
  },
  {
    title: 'Emma & Michael\'s Wedding Day',
    description: 'A romantic wedding celebration captured in stunning detail, from the ceremony to the reception dance floor.',
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'Wedding',
    mediaCount: 156,
    comments: 67,
    code: 'DEMO03',
  },
  {
    title: 'Grandpa\'s Military Service Memorial',
    description: 'Honoring a veteran\'s service with photos, documents, and stories shared by family and fellow servicemen.',
    image: 'https://images.pexels.com/photos/6192/hands-people-woman-working.jpg?auto=compress&cs=tinysrgb&w=800',
    type: 'Memorial',
    mediaCount: 34,
    comments: 18,
    code: 'DEMO04',
  },
];

export function ExamplesSection() {
  return (
    <section id="examples" className="py-24 bg-gradient-to-br from-gray-50 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            See Memories Bed in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how families around the world are using Memories Bed to preserve 
            and share their most treasured moments.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {examples.map((example, index) => (
            <motion.div
              key={example.code}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm group">
                <div className="relative overflow-hidden">
                  <img
                    src={example.image}
                    alt={example.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {example.type}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-serif font-bold text-white mb-2">
                      {example.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-white/90 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{example.mediaCount} files</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{example.comments} comments</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {example.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                      {example.code}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      View Example
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-purple-100">
            <Heart className="w-12 h-12 text-purple-600 mx-auto mb-6" />
            <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Create Your Own Memory Collection
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Join thousands of families who have already preserved over 1 million precious memories 
              with Memories Bed. Your story deserves to be remembered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Start Creating Today
              </Button>
              <Button 
                variant="outline"
                className="px-8 py-4 text-purple-600 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 font-semibold rounded-full transition-all duration-300"
              >
                Try Demo Code
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}