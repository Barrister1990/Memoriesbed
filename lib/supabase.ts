import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      memory_folders: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
          allow_comments: boolean;
          allow_downloads: boolean;
          thumbnail_url: string | null;
          qr_code_url: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          allow_comments?: boolean;
          allow_downloads?: boolean;
          thumbnail_url?: string | null;
          qr_code_url?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          title?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          allow_comments?: boolean;
          allow_downloads?: boolean;
          thumbnail_url?: string | null;
          qr_code_url?: string | null;
        };
      };
      folder_media: {
        Row: {
          id: string;
          folder_id: string;
          media_url: string;
          media_type: 'image' | 'video';
          created_at: string;
          order_index: number;
          file_name: string;
          file_size: number;
        };
        Insert: {
          id?: string;
          folder_id: string;
          media_url: string;
          media_type: 'image' | 'video';
          created_at?: string;
          order_index: number;
          file_name: string;
          file_size: number;
        };
        Update: {
          id?: string;
          folder_id?: string;
          media_url?: string;
          media_type?: 'image' | 'video';
          created_at?: string;
          order_index?: number;
          file_name?: string;
          file_size?: number;
        };
      };
      folder_comments: {
        Row: {
          id: string;
          folder_id: string;
          name: string;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          folder_id: string;
          name: string;
          comment: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          folder_id?: string;
          name?: string;
          comment?: string;
          created_at?: string;
        };
      };
      // Legacy tables for backward compatibility
      memories: {
        Row: {
          id: string;
          code: string;
          title: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          allow_comments: boolean;
          allow_downloads: boolean;
          thumbnail_url: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          allow_comments?: boolean;
          allow_downloads?: boolean;
          thumbnail_url?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          allow_comments?: boolean;
          allow_downloads?: boolean;
          thumbnail_url?: string | null;
        };
      };
      memory_media: {
        Row: {
          id: string;
          memory_id: string;
          media_url: string;
          media_type: 'image' | 'video';
          created_at: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          memory_id: string;
          media_url: string;
          media_type: 'image' | 'video';
          created_at?: string;
          order_index: number;
        };
        Update: {
          id?: string;
          memory_id?: string;
          media_url?: string;
          media_type?: 'image' | 'video';
          created_at?: string;
          order_index?: number;
        };
      };
      comments: {
        Row: {
          id: string;
          memory_id: string;
          name: string;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          memory_id: string;
          name: string;
          comment: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          memory_id?: string;
          name?: string;
          comment?: string;
          created_at?: string;
        };
      };
    };
  };
};