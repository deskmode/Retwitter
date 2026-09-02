import React, { useState } from 'react';
import { X, Camera, User, FileText, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { useTheme } from '../context/ThemeContext';

interface EditProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onSaved: (updated: UserProfile) => void;
}

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSaved }) => {
  const { resolvedDark } = useTheme();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');
  const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto || SAMPLE_AVATARS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = storageService.updateProfile({
      displayName: displayName.trim() || user.username,
      username: username.trim().toLowerCase() || user.username,
      bio: bio.trim(),
      profilePhoto: profilePhoto,
    });
    onSaved(updated);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-3xl shadow-2xl p-6 border transition-all ${
          resolvedDark ? 'bg-[#111418] border-slate-800 text-[#E2E2E6]' : 'bg-[#FDFBFF] border-[#E0E2EC] text-[#1A1C1E]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between pb-3 border-b ${
          resolvedDark ? 'border-slate-800' : 'border-[#F0F2F5]'
        }`}>
          <div className="flex items-center gap-2">
            <User size={18} className="text-[#0061A4] dark:text-[#9ECAFF]" />
            <h3 className="font-bold text-base text-[#1A1C1E] dark:text-[#E2E2E6]">Edit Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#74777F] hover:text-[#1A1C1E] dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Avatar selector */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative group">
              <img
                src={profilePhoto}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#0061A4] shadow-md"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} />
              </div>
            </div>
            <span className="text-[11px] text-[#74777F] dark:text-slate-400">Choose from avatars:</span>
            <div className="flex items-center gap-2">
              {SAMPLE_AVATARS.map((av, idx) => (
                <img
                  key={idx}
                  src={av}
                  alt={`choice-${idx}`}
                  onClick={() => setProfilePhoto(av)}
                  className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-110 ${
                    profilePhoto === av ? 'border-[#0061A4] scale-105' : 'border-transparent opacity-70'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#74777F] dark:text-slate-400 block mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-xl outline-none border transition-colors ${
                resolvedDark
                  ? 'bg-[#18202D] border-slate-700 text-slate-100 focus:border-[#9ECAFF]'
                  : 'bg-[#F0F2F5] border-[#E0E2EC] text-[#1A1C1E] focus:border-[#0061A4]'
              }`}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#74777F] dark:text-slate-400 block mb-1">Handle (@username)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-xl outline-none border transition-colors ${
                resolvedDark
                  ? 'bg-[#18202D] border-slate-700 text-slate-100 focus:border-[#9ECAFF]'
                  : 'bg-[#F0F2F5] border-[#E0E2EC] text-[#1A1C1E] focus:border-[#0061A4]'
              }`}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#74777F] dark:text-slate-400 block mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others what you are building with Flutter..."
              className={`w-full px-3 py-2 text-xs rounded-xl outline-none border resize-none transition-colors ${
                resolvedDark
                  ? 'bg-[#18202E] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#9ECAFF]'
                  : 'bg-[#F0F2F5] border-[#E0E2EC] text-[#1A1C1E] placeholder-[#74777F] focus:border-[#0061A4]'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#74777F] hover:text-[#1A1C1E] dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0061A4] hover:bg-[#00518A] text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
