import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { MemoryView } from './memory-view';

interface MemoryPageProps {
  params: Promise<{
    code: string;
  }>;
}

async function getMemoryFolder(code: string) {
  console.log('🔍 getMemoryFolder called with code:', code);
  
  // First try to get from new folder system
  console.log('📁 Attempting to fetch from memory_folders table...');
  const { data: folder, error: folderError } = await supabase
    .from('memory_folders')
    .select('*')
    .eq('code', code)
    .single();

  console.log('📁 Folder query result:', { folder, folderError });

  if (!folderError && folder) {
    console.log('✅ Found folder:', folder.id, 'with code:', folder.code);
    console.log('📷 Fetching folder media...');
    
    const { data: media, error: mediaError } = await supabase
      .from('folder_media')
      .select('*')
      .eq('folder_id', folder.id)
      .order('order_index');

    console.log('📷 Media query result:', { 
      mediaCount: media?.length || 0, 
      mediaError,
      media: media?.map(m => ({ id: m.id, type: m.type, order_index: m.order_index }))
    });

    if (mediaError) {
      console.error('❌ Error fetching folder media:', mediaError);
      return { ...folder, media: [], type: 'folder' };
    }

    const folderResult = {
      ...folder,
      media: media || [],
      type: 'folder',
      // Map folder fields to memory fields for compatibility
      allow_comments: folder.allow_comments,
      allow_downloads: folder.allow_downloads,
    };
    
    console.log('✅ Returning folder result:', {
      id: folderResult.id,
      code: folderResult.code,
      type: folderResult.type,
      mediaCount: folderResult.media.length,
      allow_comments: folderResult.allow_comments,
      allow_downloads: folderResult.allow_downloads
    });
    
    return folderResult;
  }

  // Fallback to legacy memory system
  console.log('🔄 No folder found, falling back to legacy memory system...');
  const { data: memory, error: memoryError } = await supabase
    .from('memories')
    .select('*')
    .eq('code', code)
    .single();

  console.log('💭 Memory query result:', { memory, memoryError });

  if (memoryError || !memory) {
    console.log('❌ No memory found either. Returning null.');
    console.log('Memory error details:', memoryError);
    return null;
  }

  console.log('✅ Found legacy memory:', memory.id, 'with code:', memory.code);
  console.log('📷 Fetching memory media...');

  const { data: media, error: mediaError } = await supabase
    .from('memory_media')
    .select('*')
    .eq('memory_id', memory.id)
    .order('order_index');

  console.log('📷 Legacy media query result:', { 
    mediaCount: media?.length || 0, 
    mediaError,
    media: media?.map(m => ({ id: m.id, type: m.type, order_index: m.order_index }))
  });

  if (mediaError) {
    console.error('❌ Error fetching memory media:', mediaError);
    return { ...memory, media: [], type: 'memory' };
  }

  const memoryResult = { ...memory, media: media || [], type: 'memory' };
  
  console.log('✅ Returning legacy memory result:', {
    id: memoryResult.id,
    code: memoryResult.code,
    type: memoryResult.type,
    mediaCount: memoryResult.media.length
  });

  return memoryResult;
}

export default async function MemoryPage({ params }: MemoryPageProps) {
  console.log('🚀 MemoryPage component started');
  
  // Await the params object before accessing its properties
  console.log('⏳ Awaiting params...');
  const { code } = await params;
  console.log('📝 Received code from params:', code);
  console.log('📝 Code type:', typeof code, 'Length:', code?.length);
  
  console.log('🔍 Calling getMemoryFolder...');
  const memoryData = await getMemoryFolder(code);
  console.log('📦 getMemoryFolder returned:', memoryData ? 'Data found' : 'No data');
  
  if (memoryData) {
    console.log('📊 Memory data summary:', {
      id: memoryData.id,
      code: memoryData.code,
      type: memoryData.type,
      title: memoryData.title || memoryData.name,
      mediaCount: memoryData.media?.length || 0
    });
  }

  if (!memoryData) {
    console.log('❌ No memory data found, calling notFound()');
    notFound();
  }

  console.log('✅ Rendering MemoryView component');
  return <MemoryView memory={memoryData} />;
}