import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Sparkles, Hash, AlertCircle } from 'lucide-react';
import { Post, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { useTheme } from '../context/ThemeContext';

interface CreatePostModalProps {
  currentUser: UserProfile;
  editingPost?: Post | null;
  onClose: () => void;
  onPostCreated: () => void;
}

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
];

const SUGGESTED_TAGS = ['#Flutter', '#Supabase', '#MaterialDesign3', '#Android15', '#OpenSource'];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  editingPost,
  onClose,
  onPostCreated,
}) => {
  const { resolvedDark } = useTheme();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);

  useEffect(() => {
    if (editingPost) {
      setContent(editingPost.content || '');
      setImageUrl(editingPost.imageUrl || '');
    }
  }, [editingPost]);

  const maxChars = 280;
  const charsRemaining = maxChars - content.length;

  const handleInsertTag = (tag: string) => {
    if (content.includes(tag)) return;
    setContent(prev => (prev ? `${prev} ${tag}` : tag));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to Data URL
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !imageUrl) || charsRemaining < 0 || isSubmitting) return;

    setIsSubmitting(true);
    if (editingPost) {
      storageService.editPost(editingPost.id, content.trim());
    } else {
      storageService.createPost(content, imageUrl);
    }
    setIsSubmitting(false);
    onPostCreated();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex flex-col items-center justify-end sm:justify-center p-0 sm:p-4 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all ${
          resolvedDark ? 'bg-[#111418] text-[#E2E2E6] border border-slate-800' : 'bg-[#FDFBFF] text-[#1A1C1E] border border-[#E0E2EC]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-3.5 border-b ${
          resolvedDark ? 'border-slate-800' : 'border-[#F0F2F5]'
        }`}>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#74777F] hover:text-[#1A1C1E] dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
          <span className="font-bold text-sm text-[#1A1C1E] dark:text-[#E2E2E6]">
            {editingPost ? 'Edit Post' : 'Compose Post'}
          </span>
          <button
            onClick={handleSubmit}
            disabled={(!content.trim() && !imageUrl) || charsRemaining < 0 || isSubmitting}
            className="px-4 py-1.5 rounded-full bg-[#0061A4] hover:bg-[#00518A] disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            {editingPost ? 'Save' : 'Post'}
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex gap-3">
            <img
              src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser.username}
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#E0E2EC] dark:border-slate-700/50"
            />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-xs text-[#535F70] dark:text-slate-400">
                Posting as @{currentUser.username}
              </span>
              <textarea
                autoFocus
                placeholder="What's happening in tech? Share with #Flutter, #Supabase..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full mt-1.5 bg-transparent resize-none outline-none text-[15px] placeholder-[#74777F] dark:placeholder-slate-500 leading-relaxed text-[#1A1C1E] dark:text-[#E2E2E6]"
              />
            </div>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="relative mt-3 rounded-2xl overflow-hidden border border-[#E0E2EC] dark:border-slate-700/40 max-h-56 bg-black">
              <img
                src={imageUrl}
                alt="Selected attachment"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white"
                title="Remove photo"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Quick Tag Recommendations */}
          <div className={`mt-4 pt-3 border-t ${resolvedDark ? 'border-slate-800' : 'border-[#F0F2F5]'}`}>
            <div className="flex items-center gap-1 text-xs text-[#74777F] dark:text-slate-400 mb-2">
              <Sparkles size={12} className="text-[#0061A4] dark:text-[#9ECAFF]" />
              <span>Suggested topics:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                    content.includes(tag)
                      ? resolvedDark
                        ? 'bg-[#00497D] border-[#00497D] text-[#D1E4FF] font-semibold'
                        : 'bg-[#D1E4FF] border-[#D1E4FF] text-[#001D36] font-semibold'
                      : 'border-[#74777F]/40 hover:border-[#0061A4] text-[#535F70] dark:text-slate-400 hover:text-[#0061A4] dark:hover:text-[#9ECAFF]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Photo Picker Drawer */}
          {showPhotoPicker && (
            <div className={`mt-3 p-3 rounded-2xl border ${
              resolvedDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-[#F0F2F5] border-[#E0E2EC]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#1A1C1E] dark:text-slate-300">Choose a sample:</span>
                <button
                  onClick={() => setShowPhotoPicker(false)}
                  className="text-xs text-[#74777F] hover:text-[#1A1C1E] dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_PHOTOS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Sample ${i}`}
                    onClick={() => {
                      setImageUrl(src);
                      setShowPhotoPicker(false);
                    }}
                    className="h-16 w-full object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform border border-[#E0E2EC] dark:border-slate-700/50"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className={`px-4 py-3 border-t flex items-center justify-between ${
          resolvedDark ? 'border-slate-800 bg-[#111418]' : 'border-[#F0F2F5] bg-[#FDFBFF]'
        }`}>
          <div className="flex items-center gap-2">
            {/* File upload */}
            <label className="p-2 rounded-full text-[#0061A4] dark:text-[#9ECAFF] hover:bg-[#D1E4FF]/40 cursor-pointer transition-colors" title="Add picture">
              <ImageIcon size={19} />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Sample photo shortcut */}
            <button
              type="button"
              onClick={() => setShowPhotoPicker(!showPhotoPicker)}
              className="p-2 rounded-full text-[#0061A4] dark:text-[#9ECAFF] hover:bg-[#D1E4FF]/40 transition-colors"
              title="Pick sample image"
            >
              <Sparkles size={19} />
            </button>
          </div>

          {/* Character counter */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium ${
                charsRemaining < 0
                  ? 'text-rose-500 font-bold'
                  : charsRemaining < 20
                  ? 'text-amber-500'
                  : 'text-[#74777F] dark:text-slate-400'
              }`}
            >
              {charsRemaining}
            </span>
            <div className="w-5 h-5 rounded-full border-2 border-[#E0E2EC] dark:border-slate-700 flex items-center justify-center">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  charsRemaining < 0 ? 'bg-rose-500' : 'bg-[#0061A4] dark:bg-[#9ECAFF]'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
