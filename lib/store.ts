import { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

interface FolderState {
  title: string;
  description: string;
  allowComments: boolean;
  allowDownloads: boolean;
  images: File[];
  videos: File[];
  isCreating: boolean;
  isUploading: boolean;
  generatedCode: string | null;
  qrCodeUrl: string | null;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setAllowComments: (allow: boolean) => void;
  setAllowDownloads: (allow: boolean) => void;
  addImages: (images: File[]) => void;
  addVideos: (videos: File[]) => void;
  removeImage: (index: number) => void;
  removeVideo: (index: number) => void;
  setIsCreating: (creating: boolean) => void;
  setIsUploading: (uploading: boolean) => void;
  setGeneratedCode: (code: string | null) => void;
  setQrCodeUrl: (url: string | null) => void;
  reset: () => void;
}

interface QRScannerState {
  isOpen: boolean;
  isScanning: boolean;
  scannedCode: string | null;
  setIsOpen: (open: boolean) => void;
  setIsScanning: (scanning: boolean) => void;
  setScannedCode: (code: string | null) => void;
  reset: () => void;
}

// Legacy upload store for backward compatibility
interface UploadState {
  title: string;
  allowComments: boolean;
  allowDownloads: boolean;
  images: File[];
  videos: File[];
  isUploading: boolean;
  setTitle: (title: string) => void;
  setAllowComments: (allow: boolean) => void;
  setAllowDownloads: (allow: boolean) => void;
  addImages: (images: File[]) => void;
  addVideos: (videos: File[]) => void;
  removeImage: (index: number) => void;
  removeVideo: (index: number) => void;
  setIsUploading: (uploading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useFolderStore = create<FolderState>((set) => ({
  title: '',
  description: '',
  allowComments: true,
  allowDownloads: true,
  images: [],
  videos: [],
  isCreating: false,
  isUploading: false,
  generatedCode: null,
  qrCodeUrl: null,
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setAllowComments: (allowComments) => set({ allowComments }),
  setAllowDownloads: (allowDownloads) => set({ allowDownloads }),
  addImages: (newImages) => set((state) => ({ images: [...state.images, ...newImages] })),
  addVideos: (newVideos) => set((state) => ({ videos: [...state.videos, ...newVideos] })),
  removeImage: (index) => set((state) => ({ images: state.images.filter((_, i) => i !== index) })),
  removeVideo: (index) => set((state) => ({ videos: state.videos.filter((_, i) => i !== index) })),
  setIsCreating: (isCreating) => set({ isCreating }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setGeneratedCode: (generatedCode) => set({ generatedCode }),
  setQrCodeUrl: (qrCodeUrl) => set({ qrCodeUrl }),
  reset: () => set({
    title: '',
    description: '',
    allowComments: true,
    allowDownloads: true,
    images: [],
    videos: [],
    isCreating: false,
    isUploading: false,
    generatedCode: null,
    qrCodeUrl: null,
  }),
}));

export const useQRScannerStore = create<QRScannerState>((set) => ({
  isOpen: false,
  isScanning: false,
  scannedCode: null,
  setIsOpen: (isOpen) => set({ isOpen }),
  setIsScanning: (isScanning) => set({ isScanning }),
  setScannedCode: (scannedCode) => set({ scannedCode }),
  reset: () => set({
    isOpen: false,
    isScanning: false,
    scannedCode: null,
  }),
}));

// Legacy store for backward compatibility
export const useUploadStore = create<UploadState>((set) => ({
  title: '',
  allowComments: true,
  allowDownloads: true,
  images: [],
  videos: [],
  isUploading: false,
  setTitle: (title) => set({ title }),
  setAllowComments: (allowComments) => set({ allowComments }),
  setAllowDownloads: (allowDownloads) => set({ allowDownloads }),
  addImages: (newImages) => set((state) => ({ images: [...state.images, ...newImages] })),
  addVideos: (newVideos) => set((state) => ({ videos: [...state.videos, ...newVideos] })),
  removeImage: (index) => set((state) => ({ images: state.images.filter((_, i) => i !== index) })),
  removeVideo: (index) => set((state) => ({ videos: state.videos.filter((_, i) => i !== index) })),
  setIsUploading: (isUploading) => set({ isUploading }),
  reset: () => set({
    title: '',
    allowComments: true,
    allowDownloads: true,
    images: [],
    videos: [],
    isUploading: false,
  }),
}));