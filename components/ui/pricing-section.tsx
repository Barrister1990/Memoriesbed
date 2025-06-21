'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Check, Star, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Personal',
    price: 'Free',
    period: 'Forever',
    description: 'Perfect for individuals and small families',
    features: [
      'Up to 5 memory folders',
      '1GB storage space',
      'Basic QR code generation',
      'Standard photo quality',
      'Email support',
    ],
    popular: false,
    cta: 'Get Started Free',
  },
  {
    name: 'Family',
    price: '$9.99',
    period: 'per month',
    description: 'Ideal for growing families and extended relatives',
    features: [
      'Unlimited memory folders',
      '50GB storage space',
      'HD video support',
      'Custom QR codes',
      'Priority support',
      'Comment moderation',
      'Download analytics',
    ],
    popular: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Legacy',
    price: '$24.99',
    period: 'per month',
    description: 'For large families and memory preservation enthusiasts',
    features: [
      'Everything in Family',
      '500GB storage space',
      '4K video support',
      'Custom branding',
      'Advanced analytics',
      'Bulk upload tools',
      'Dedicated support',
      'API access',
    ],
    popular: false,
    cta: 'Contact Sales',
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan for your family's memory preservation needs. 
            All plans include our core features with no hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}
              
              <Card className={`h-full ${
                plan.popular 
                  ? 'border-2 border-purple-200 shadow-xl bg-gradient-to-br from-white to-purple-50/30' 
                  : 'border border-gray-200 shadow-lg bg-white'
              } transition-all duration-300 hover:shadow-xl`}>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period !== 'Forever' && (
                      <span className="text-gray-600 ml-2">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full py-3 font-semibold rounded-full transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-white text-purple-600 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    {plan.cta}
                  </Button>
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
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-white">
            <Zap className="w-12 h-12 mx-auto mb-6 text-yellow-300" />
            <h3 className="text-3xl font-serif font-bold mb-4">
              30-Day Money-Back Guarantee
            </h3>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
              Try Memories Bed risk-free. If you're not completely satisfied within 30 days, 
              we'll refund your money, no questions asked.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}