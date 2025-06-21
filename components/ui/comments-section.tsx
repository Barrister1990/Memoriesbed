'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Heart, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Comment {
  id: string;
  name: string;
  comment: string;
  created_at: string;
}

interface CommentsSectionProps {
  memoryId: string;
  allowComments: boolean;
  isFolder?: boolean;
}

export function CommentsSection({ memoryId, allowComments, isFolder = false }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const tableName = isFolder ? 'folder_comments' : 'comments';
  const foreignKey = isFolder ? 'folder_id' : 'memory_id';

  useEffect(() => {
    fetchComments();
  }, [memoryId, isFolder]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(foreignKey, memoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commenterName.trim() || !newComment.trim()) {
      toast.error('Please provide both your name and a comment.');
      return;
    }

    setIsSubmitting(true);

    try {
      const commentData = {
        [foreignKey]: memoryId,
        name: commenterName.trim(),
        comment: newComment.trim(),
      };

      const { data, error } = await supabase
        .from(tableName)
        .insert([commentData])
        .select()
        .single();

      if (error) throw error;

      setComments((prev) => [data, ...prev]);
      setNewComment('');
      setCommenterName('');
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <span>Comments & Messages</span>
            <span className="text-sm font-normal text-gray-500">({comments.length})</span>
          </CardTitle>
          <CardDescription>
            {allowComments
              ? 'Share your memories and thoughts about this special moment.'
              : 'Comments are disabled for this memory.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Comment Form */}
          {allowComments && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmitComment}
              className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={commenterName}
                    onChange={(e) => setCommenterName(e.target.value)}
                    className="bg-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Message
                </label>
                <Textarea
                  placeholder="Share your thoughts, memories, or a special message..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-white resize-none"
                  rows={3}
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting || !commenterName.trim() || !newComment.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Posting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Post Comment</span>
                  </div>
                )}
              </Button>
            </motion.form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            <AnimatePresence>
              {comments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-gray-500"
                >
                  <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No comments yet. Be the first to share a memory!</p>
                </motion.div>
              ) : (
                comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{comment.name}</h4>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(comment.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}