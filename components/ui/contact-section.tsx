'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Globe, Heart, Mail, MessageCircle, Phone, Send, Sparkles } from 'lucide-react';

const contactMethods = [
  {
    icon: MessageCircle,
    title: 'WhatsApp Chat',
    details: 'Quick & Easy Support',
    description: 'Get instant help via WhatsApp',
    action: () => window.open('https://wa.me/1234567890?text=Hello! I need help with Memories Bed', '_blank'),
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-50',
    buttonText: 'Chat Now',
    available: '24/7 Available',
  },
  {
    icon: Phone,
    title: 'Call Us Direct',
    details: '1-800-MEMORIES',
    description: 'Speak with our support team',
    action: () => window.open('tel:+18006366645', '_self'),
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
    buttonText: 'Call Now',
    available: 'Mon-Fri, 9AM-6PM EST',
  },
  {
    icon: Mail,
    title: 'Email Support',
    details: 'owner.memoriesbed@gmail.com',
    description: 'Send us detailed questions',
    action: () => window.open('mailto:owner.memoriesbed@gmail.com?subject=Memories Bed Support&body=Hello, I need help with...', '_self'),
    gradient: 'from-purple-500 to-indigo-500',
    bgGradient: 'from-purple-50 to-indigo-50',
    buttonText: 'Send Email',
    available: 'Response within 24hrs',
  },
];

const socialLinks = [
  { name: 'Facebook', href: '#facebook' },
  { name: 'Twitter', href: '#twitter' },
  { name: 'Instagram', href: '#instagram' },
  { name: 'LinkedIn', href: '#linkedin' },
];

export function ContactSection() {
  return (
    <>
      {/* Contact Section */}
      <section id="contact" className="relative py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/50 overflow-hidden">
        {/* Background Animation Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-purple-200/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 6 + 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-6">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 bg-clip-text text-transparent"
              >
                Get in Touch
              </motion.h2>
            </div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl lg:max-w-4xl mx-auto leading-relaxed px-2"
            >
              Need help preserving your precious memories? Our friendly support team is ready to assist you.
              <span className="block mt-2 font-medium text-purple-700">
                Choose your preferred way to connect with us.
              </span>
            </motion.p>
          </motion.div>

          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-20">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group"
              >
                <Card className="h-full shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm border border-white/50 group-hover:scale-105">
                  <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r ${method.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg`}
                    >
                      <method.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9 text-white" />
                    </motion.div>
                    
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                      {method.title}
                    </h3>
                    
                    <p className="text-sm sm:text-base font-semibold text-purple-600 mb-2">
                      {method.details}
                    </p>
                    
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                      {method.description}
                    </p>

                    <div className="space-y-3 sm:space-y-4">
                      <Button
                        onClick={method.action}
                        className={`w-full bg-gradient-to-r ${method.gradient} hover:opacity-90 text-white font-semibold py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
                      >
                        <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        {method.buttonText}
                      </Button>
                      
                      <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-500">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{method.available}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative"
                >
                  <Heart className="h-8 w-8 text-pink-300" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <Sparkles className="h-8 w-8 text-yellow-300 opacity-60" />
                  </motion.div>
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold">
                  Memories Bed
                </h3>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Preserving your precious moments for generations to come. 
                Safe, secure, and always accessible.
              </p>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <ul className="space-y-2">
                {socialLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-purple-300" />
                  <span className="text-gray-300 text-sm sm:text-base">
                    owner.memoriesbed@gmail.com
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-purple-300" />
                  <span className="text-gray-300 text-sm sm:text-base">
                    1-800-MEMORIES
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-4 h-4 text-purple-300" />
                  <span className="text-gray-300 text-sm sm:text-base">
                    WhatsApp Support
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="border-t border-gray-700 mt-8 sm:mt-12 pt-6 sm:pt-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
                © 2025 Memories Bed. All rights reserved.
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2 text-xs sm:text-sm"
              >
                <span className="text-gray-400">Developed by</span>
                <a
                  href="https://charlessawuku.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-purple-200 font-medium flex items-center space-x-1 transition-colors duration-200"
                >
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Charles Awuku</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </footer>
    </>
  );
}