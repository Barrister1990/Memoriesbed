# Memories Bed

> A beautiful, secure digital memorial service that preserves and shares life's most precious memories through QR codes and digital frames.

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Overview

Memories Bed is a comprehensive digital memorial platform that allows clients to securely store, access, and share their most precious memories. Through QR codes and digital frames, families can remotely access dedicated memory collections, creating a lasting digital legacy.

## ✨ Features

### Core Features
- 🔐 **Secure Memory Storage** - Enterprise-grade security for precious memories
- 📱 **QR Code Access** - Instant access to memory collections via QR codes
- 🖼️ **Digital Frame Integration** - Display memories through connected digital frames
- 👥 **Family Sharing** - Controlled sharing with family members and loved ones
- 🎨 **Beautiful UI** - Elegant, responsive design built with modern web technologies
- 🔍 **Smart Search** - Advanced search and filtering of memories
- 📅 **Timeline View** - Chronological organization of memories
- 🏷️ **Memory Tags** - Categorize and organize memories with custom tags

### Technical Features
- ⚡ **Fast Performance** - Built with Next.js 14+ and optimized for speed
- 📱 **Mobile Responsive** - Seamless experience across all devices
- 🎯 **SEO Optimized** - Comprehensive SEO and social sharing setup
- 🔄 **Real-time Updates** - Live updates across all connected devices
- 🌐 **PWA Ready** - Progressive Web App capabilities
- 📊 **Analytics Ready** - Built-in analytics integration

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or later
- npm, yarn, or pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/barrister1990/Memoriesbed.git
   cd Memoriesbed
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   
   # Authentication and database
   NEXT_PUBLIC_SUPABASE_URL="your-nextauth-secret"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="http://localhost:3000"
   
   # Storage
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-cloudinary-preset"

    # qr code base url
    NEXT_PUBLIC_BASE_URL= https://your-domain.com
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)



## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Fonts**: Inter (sans-serif) + Playfair Display (serif)
- **Icons**: Lucide React
- **State Management**: Zustand/React Context

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: Cloudinary
- **Email**: Nodemailer

### Deployment & DevOps
- **Hosting**: Vercel (recommended)
- **Database**: Supabase
- **CDN**: Cloudinary
- **Analytics**: Vercel Analytics


## 📖 Usage

### For Clients

1. **Digital Frame Setup**: Connect digital frames to display rotating memories
2. **Family Sharing**: Invite family members to view and contribute memories
3. **Timeline View**: Browse memories chronologically
4. **Search & Filter**: Find specific memories using smart search

### For Administrators

1. **Admin**: Add, edit, and manage client accounts
2. **Memory Moderation**: Review and approve uploaded content
3. **QR Code Management**: Generate and track QR code usage
4. **Analytics Dashboard**: View usage statistics and engagement metrics


## 🎨 Customization

### Theming

The app uses CSS variables for theming. Modify `app/globals.css`:

```css
:root {
  --primary: 220 14% 6%;
  --primary-foreground: 220 13% 91%;
  /* Add more custom colors */
}
```

### Fonts

Update fonts in `app/layout.tsx`:

```typescript
const customFont = YourFont({
  subsets: ['latin'],
  variable: '--font-custom',
  display: 'swap',
});
```

## 📱 Mobile & PWA

The app is fully responsive and includes PWA capabilities:

- **Offline Support**: Service worker for offline functionality
- **App-like Experience**: Add to home screen on mobile devices
- **Touch Gestures**: Swipe navigation for memories

## 🔒 Security

- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Authentication**: Secure authentication with Supabase
- **Access Control**: Role-based access control for memories
- **File Validation**: Comprehensive file type and size validation
- **Rate Limiting**: API rate limiting to prevent abuse

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Automatic deployments on push to main branch

### Docker

```bash
# Build the image
docker build -t Memoriesbed .

# Run the container
docker run -p 3000:3000 --env-file .env.local Memoriesbed
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 📊 Analytics & Monitoring

- **Performance**: Core Web Vitals monitoring
- **User Analytics**: Privacy-focused analytics
- **Error Tracking**: Comprehensive error monitoring
- **Uptime Monitoring**: 99.9% uptime SLA

## 🤝 Contributing


1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Vercel** for the excellent hosting platform
- **Cloudinary** for reliable image storage and processing
- **Our beta testers** for valuable feedback and support




---

Made with ❤️ by the Charles Awuku team