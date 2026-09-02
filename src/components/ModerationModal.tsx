import React, { useState } from 'react';
import { X, ShieldAlert, UserX, CheckCircle } from 'lucide-react';
import { Post } from '../types';
import { storageService } from '../services/storageService';
import { useTheme } from '../context/ThemeContext';

interface ModerationModalProps {
  type: 'report' | 'block';
  post?: Post | null;
  targetUserId?: string;
  targetUsername?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const REPORT_REASONS = [
  'Spam or malicious links',
  'Harassment or hate speech',
  'Misinformation or harmful content',
  'Copyright infringement',
  'Other violation',
];

export const ModerationModal: React.FC<ModerationModalProps> = ({
  type,
  post,
  targetUserId,
  targetUsername,
  onClose,
  onSuccess,
}) => {
  const { resolvedDark } = useTheme();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleBlockConfirm = () => {
    const idToBlock = targetUserId || post?.userId;
    if (idToBlock) {
      storageService.blockUser(idToBlock);
      onSuccess(`@${targetUsername || post?.user?.username || 'User'} has been blocked and removed from your feed.`);
      onClose();
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.reportContent({
      reportedUserId: targetUserId || post?.userId,
      reportedPostId: post?.id,
      reason: `${selectedReason}: ${additionalDetails}`.trim(),
    });
    setSubmitted(true);
    setTimeout(() => {
      onSuccess('Thank you. Your report has been submitted to the moderation queue.');
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl p-5 border transition-all ${
          resolvedDark ? 'bg-[#111418] border-slate-800 text-[#E2E2E6]' : 'bg-[#FDFBFF] border-[#E0E2EC] text-[#1A1C1E]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          resolvedDark ? 'border-slate-800' : 'border-[#F0F2F5]'
        }`}>
          <div className="flex items-center gap-2">
            {type === 'block' ? (
              <UserX className="text-rose-500" size={20} />
            ) : (
              <ShieldAlert className="text-amber-500" size={20} />
            )}
            <h3 className="font-bold text-base text-[#1A1C1E] dark:text-[#E2E2E6]">
              {type === 'block'
                ? `Block @${targetUsername || post?.user?.username || 'user'}?`
                : 'Report Content'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#74777F] hover:text-[#1A1C1E] dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle size={44} className="text-emerald-500 mx-auto" />
            <p className="font-bold text-sm text-[#1A1C1E] dark:text-[#E2E2E6]">Report Received</p>
            <p className="text-xs text-[#535F70] dark:text-slate-400">Our automated moderation checks and PostgreSQL RLS have flagged this item.</p>
          </div>
        ) : type === 'block' ? (
          <div className="py-4 space-y-4">
            <p className="text-sm text-[#535F70] dark:text-slate-300">
              They will not be able to view your profile or see your posts in their feed. You won't see posts or notifications from @{targetUsername || post?.user?.username}.
            </p>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-300">
              This triggers PostgreSQL Row Level Security (RLS) exclusion on all queries automatically.
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#74777F] hover:text-[#1A1C1E] dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:scale-95 transition-all"
              >
                Confirm Block
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="py-4 space-y-3.5">
            <p className="text-xs text-[#535F70] dark:text-slate-400">
              Help us understand what's wrong with this post or profile:
            </p>
            <div className="space-y-1.5">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedReason === r
                      ? resolvedDark
                        ? 'border-[#9ECAFF] bg-[#00497D]/30 text-[#D1E4FF] font-medium'
                        : 'border-[#0061A4] bg-[#D1E4FF]/40 text-[#001D36] font-medium'
                      : 'border-[#E0E2EC] dark:border-slate-700/50 hover:bg-[#F0F2F5] dark:hover:bg-slate-800/40 text-[#1A1C1E] dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="accent-[#0061A4]"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <textarea
              placeholder="Additional comments (optional)..."
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              rows={2}
              className={`w-full p-2.5 rounded-xl text-xs outline-none border transition-colors ${
                resolvedDark
                  ? 'bg-[#18202D] border-slate-700 text-slate-200 placeholder-slate-500 focus:border-[#9ECAFF]'
                  : 'bg-[#F0F2F5] border-[#E0E2EC] text-[#1A1C1E] placeholder-[#74777F] focus:border-[#0061A4]'
              }`}
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#74777F] hover:text-[#1A1C1E] dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0061A4] hover:bg-[#00518A] text-white shadow-xs active:scale-95 transition-all"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
