'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Maria Rodriguez',
    role: 'Mother of 3',
    location: 'Austin, TX',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    text: 'Memories Bed helped us preserve my mother\'s 85th birthday celebration. The QR codes made it so easy for all our relatives to access and share their own photos. It\'s like having a digital family album that everyone can contribute to.',
  },
  {
    name: 'David Chen',
    role: 'Wedding Photographer',
    location: 'San Francisco, CA',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    text: 'I recommend Memories Bed to all my clients. The platform makes it incredibly easy to share wedding photos and videos with families. The comment feature allows guests to share their own memories from the special day.',
  },
  {
    name: 'Sarah Thompson',
    role: 'Grandmother',
    location: 'Nashville, TN',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    text: 'As someone who isn\'t very tech-savvy, I was amazed at how simple Memories Bed is to use. I can now easily share photos of my grandchildren with family members across the country. The QR codes are genius!',
  },
  {
    name: 'Michael Johnson',
    role: 'Event Coordinator',
    location: 'Chicago, IL',
    image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    text: 'Memories Bed has revolutionized how we handle event photography. Instead of dealing with USB drives or email attachments, we simply create a memory folder and share the QR code. Guests love being able to download photos instantly.',
  },
  {
    name: 'Jennifer Williams',
    role: 'Family Historian',
    location: 'Denver, CO',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    text: 'I\'ve been working on our family history for years, and Memories Bed is the perfect platform to organize and share our heritage. The ability to add descriptions and allow family members to comment has brought our history to life.',
  },
  {
    name: 'Robert Davis',
    role: 'Retired Teacher',
    location: 'Portland, OR',
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    text: 'After my wife passed away, Memories Bed became a beautiful way to honor her memory. I created a collection of our 50 years together, and it\'s brought comfort to our entire family. The platform handles everything with such care and dignity.',
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            What Families Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of satisfied families who trust Memories Bed to preserve 
            their most precious moments and bring their loved ones closer together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/20">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-xs text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <div className="relative">
                    <Quote className="w-8 h-8 text-purple-200 absolute -top-2 -left-2" />
                    <p className="text-gray-700 leading-relaxed pl-6">
                      {testimonial.text}
                    </p>
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
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-white">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-yellow-300 fill-current mx-1" />
              ))}
            </div>
            <h3 className="text-3xl font-serif font-bold mb-4">
              4.9/5 Stars from Over 10,000 Families
            </h3>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed mb-8">
              Join the thousands of families who have already discovered the joy of preserving 
              and sharing their memories with Memories Bed.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Your Free Trial
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}