'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Download, MessageSquare, QrCode, Share2, Shield, Upload } from 'lucide-react';

const services = [
  {
    icon: Upload,
    title: 'Memory Upload',
    description: 'Upload high-resolution photos and HD videos to create beautiful memory collections.',
    features: ['Unlimited storage', 'HD video support', 'Batch upload', 'Auto-organization'],
  },
  {
    icon: QrCode,
    title: 'QR Code Sharing',
    description: 'Generate unique QR codes for instant access to your memory collections.',
    features: ['Instant generation', 'Print-ready quality', 'Mobile optimized', 'Secure access'],
  },
  {
    icon: Share2,
    title: 'Easy Sharing',
    description: 'Share memories with family and friends through secure, private links.',
    features: ['Private sharing', 'Access control', 'Link management', 'View analytics'],
  },
  {
    icon: Download,
    title: 'Download Options',
    description: 'Allow loved ones to download and keep copies of shared memories.',
    features: ['Original quality', 'Bulk download', 'Format options', 'Admin control'],
  },
  {
    icon: MessageSquare,
    title: 'Memory Comments',
    description: 'Let family members leave heartfelt messages and share their own memories.',
    features: ['Real-time comments', 'Moderation tools', 'Memory sharing', 'Notification system'],
  },
  {
    icon: Shield,
    title: 'Secure Storage',
    description: 'Enterprise-grade security ensures your precious memories are always protected.',
    features: ['End-to-end encryption', 'Secure backups', 'Privacy controls', '99.9% uptime'],
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-gradient-to-br from-gray-50 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            What We Do
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive memory preservation services designed to keep your most precious 
            moments safe, organized, and easily shareable with those who matter most.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-purple-100">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              Ready to Preserve Your Memories?
            </h3>
            <p className="text-gray-600 mb-8 max-Memories Bed w-2xl mx-auto">
              Join thousands of families who trust  to keep their most precious moments safe and accessible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Today
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-full border-2 border-purple-200 hover:border-purple-300 transition-all duration-300"
              >
                Learn More
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}