-- Memories Bed Database Setup
-- Run these commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create memory_folders table
CREATE TABLE IF NOT EXISTS memory_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  allow_comments BOOLEAN DEFAULT true,
  allow_downloads BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0
);

-- Create folder_media table
CREATE TABLE IF NOT EXISTS folder_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id UUID REFERENCES memory_folders(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type VARCHAR(10) CHECK (media_type IN ('image', 'video')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  order_index INTEGER DEFAULT 0,
  file_name TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  is_thumbnail BOOLEAN DEFAULT false
);

-- Create folder_comments table
CREATE TABLE IF NOT EXISTS folder_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id UUID REFERENCES memory_folders(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true,
  ip_address INET
);

-- Create legacy memories table (for backward compatibility)
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  allow_comments BOOLEAN DEFAULT true,
  allow_downloads BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0
);

-- Create legacy memory_media table
CREATE TABLE IF NOT EXISTS memory_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type VARCHAR(10) CHECK (media_type IN ('image', 'video')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  order_index INTEGER DEFAULT 0
);

-- Create legacy comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true,
  ip_address INET
);

-- Create analytics table for tracking
CREATE TABLE IF NOT EXISTS folder_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id UUID REFERENCES memory_folders(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'view', 'download', 'comment', 'share'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE memory_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for memory_folders
CREATE POLICY "Users can view their own folders" ON memory_folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders" ON memory_folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" ON memory_folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" ON memory_folders
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for folder_media
CREATE POLICY "Users can view media for their folders" ON folder_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memory_folders 
      WHERE memory_folders.id = folder_media.folder_id 
      AND memory_folders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert media for their folders" ON folder_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memory_folders 
      WHERE memory_folders.id = folder_media.folder_id 
      AND memory_folders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update media for their folders" ON folder_media
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memory_folders 
      WHERE memory_folders.id = folder_media.folder_id 
      AND memory_folders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete media for their folders" ON folder_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memory_folders 
      WHERE memory_folders.id = folder_media.folder_id 
      AND memory_folders.user_id = auth.uid()
    )
  );

-- RLS Policies for folder_comments (public can read/insert, owners can delete)
CREATE POLICY "Anyone can view approved comments" ON folder_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can insert comments" ON folder_comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Folder owners can manage comments" ON folder_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memory_folders 
      WHERE memory_folders.id = folder_comments.folder_id 
      AND memory_folders.user_id = auth.uid()
    )
  );

-- Similar policies for legacy tables
CREATE POLICY "Users can view their own memories" ON memories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories" ON memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories" ON memories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories" ON memories
  FOR DELETE USING (auth.uid() = user_id);

-- Legacy memory_media policies
CREATE POLICY "Users can view media for their memories" ON memory_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = memory_media.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert media for their memories" ON memory_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = memory_media.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update media for their memories" ON memory_media
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = memory_media.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete media for their memories" ON memory_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = memory_media.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

-- Legacy comments policies
CREATE POLICY "Anyone can view approved legacy comments" ON comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can insert legacy comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Memory owners can manage legacy comments" ON comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = comments.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

-- Analytics policies
CREATE POLICY "Folder owners can view analytics" ON folder_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memory_folders 
      WHERE memory_folders.id = folder_analytics.folder_id 
      AND memory_folders.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert analytics" ON folder_analytics
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memory_folders_code ON memory_folders(code);
CREATE INDEX IF NOT EXISTS idx_memory_folders_user_id ON memory_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_folders_created_at ON memory_folders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_folder_media_folder_id ON folder_media(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_media_order ON folder_media(folder_id, order_index);
CREATE INDEX IF NOT EXISTS idx_folder_comments_folder_id ON folder_comments(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_comments_created_at ON folder_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_code ON memories(code);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_media_memory_id ON memory_media(memory_id);
CREATE INDEX IF NOT EXISTS idx_comments_memory_id ON comments(memory_id);
CREATE INDEX IF NOT EXISTS idx_folder_analytics_folder_id ON folder_analytics(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_analytics_created_at ON folder_analytics(created_at DESC);

-- Create functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_memory_folders_updated_at 
  BEFORE UPDATE ON memory_folders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at 
  BEFORE UPDATE ON memories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_folder_views(folder_code VARCHAR(6))
RETURNS VOID AS $$
BEGIN
  UPDATE memory_folders 
  SET view_count = view_count + 1 
  WHERE code = folder_code;
  
  -- Also insert analytics record
  INSERT INTO folder_analytics (folder_id, event_type)
  SELECT id, 'view' 
  FROM memory_folders 
  WHERE code = folder_code;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment legacy memory views
CREATE OR REPLACE FUNCTION increment_memory_views(memory_code VARCHAR(6))
RETURNS VOID AS $$
BEGIN
  UPDATE memories 
  SET view_count = view_count + 1 
  WHERE code = memory_code;
END;
$$ LANGUAGE plpgsql;

-- Create storage buckets (run these in Supabase Storage section)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('memory-images', 'memory-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('memory-videos', 'memory-videos', true);

-- Storage policies (run these in Supabase Storage section)
-- CREATE POLICY "Public can view images" ON storage.objects FOR SELECT USING (bucket_id = 'memory-images');
-- CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'memory-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Users can update their own images" ON storage.objects FOR UPDATE USING (bucket_id = 'memory-images' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their own images" ON storage.objects FOR DELETE USING (bucket_id = 'memory-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Public can view videos" ON storage.objects FOR SELECT USING (bucket_id = 'memory-videos');
-- CREATE POLICY "Authenticated users can upload videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'memory-videos' AND auth.role() = 'authenticated');
-- CREATE POLICY "Users can update their own videos" ON storage.objects FOR UPDATE USING (bucket_id = 'memory-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their own videos" ON storage.objects FOR DELETE USING (bucket_id = 'memory-videos' AND auth.uid()::text = (storage.foldername(name))[1]);