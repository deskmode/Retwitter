import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useTheme } from '../context/ThemeContext';
import { UserProfile } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const { resolvedDark } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const user = storageService.loginWithEmail(email, password);
      if (isSignUp && username.trim()) {
        storageService.updateProfile({ username: username.trim(), displayName: username.trim() });
      }
      setIsLoading(false);
      onSuccess(user);
      onClose();
    }, 400);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError('');
    // Emulates Google Sign-In with Supabase Auth OAuth provider
    setTimeout(() => {
      const googleUser = storageService.loginWithEmail('google_dev@gmail.com');
      storageService.updateProfile({
        displayName: 'Google Dev',
        username: 'google_user',
        profilePhoto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
        bio: 'Signed in via Google OAuth + Supabase Auth provider.'
      });
      setIsLoading(false);
      onSuccess(googleUser);
      onClose();
    }, 600);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const guest = storageService.loginWithGuest();
      setIsLoading(false);
      onSuccess(guest);
      onClose();
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-3xl shadow-2xl p-6 border transition-all ${
          resolvedDark ? 'bg-[#111418] border-slate-800 text-[#E2E2E6]' : 'bg-[#FDFBFF] border-[#E0E2EC] text-[#1A1C1E]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0061A4] flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
            <h3 className="font-bold text-lg text-[#1A1C1E] dark:text-[#E2E2E6]">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#74777F] hover:text-[#1A1C1E] dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[#535F70] dark:text-slate-400 mt-1 mb-4">
          Supabase Auth with PostgreSQL Row-Level Security
        </p>

        {error && (
          <div className="p-2.5 mb-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
            {error}
          </div>
        )}

        {/* Google One-Click Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl border border-[#74777F]/40 hover:bg-[#F0F2F5] dark:hover:bg-slate-800 text-[#1A1C1E] dark:text-[#E2E2E6] text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 mb-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#E0E2EC] dark:border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[11px] text-[#74777F] dark:text-slate-500 uppercase">or with email</span>
          <div className="flex-grow border-t border-[#E0E2EC] dark:border-slate-800"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3 mt-1">
          {isSignUp && (
            <div>
              <label className="text-[11px] font-medium text-[#74777F] dark:text-slate-400 block mb-1">Username</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-3 text-[#74777F]" />
                <input
                  type="text"
                  placeholder="tech_dev"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl outline-none border transition-colors ${
                    resolvedDark
                      ? 'bg-[#18202D] border-slate-700 text-slate-100 focus:border-[#9ECAFF]'
                      : 'bg-[#F0F2F5] border-[#E0E2EC] text-[#1A1C1E] placeholder-[#74777F] focus:border-[#0061A4]'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-medium text-[#74777F] dark:text-slate-400 block mb-1">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-[#74777F]" />
              <input
                type="email"
                required
                placeholder="dev@retwitter.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl outline-none border transition-colors ${
                  resolvedDark
                    ? 'bg-[#18202D] border-slate-700 text-slate-100 focus:border-[#9ECAFF]'
                    : 'bg-[#F0F2F5] border-[#E0E2EC] text-[#1A1C1E] placeholder-[#74777F] focus:border-[#0061A4]'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#74777F] dark:text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-[#74777F]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl outline-none border transition-colors ${
                  resolvedDark
                    ? 'bg-[#18202D] border-slate-700 text-slate-100 focus:border-[#9ECAFF]'
                    : 'bg-[#F0F2F5] border-[#E0E2EC] text-[#1A1C1E] placeholder-[#74777F] focus:border-[#0061A4]'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-[#0061A4] hover:bg-[#00518A] text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 mt-2"
          >
            <LogIn size={14} />
            <span>{isSignUp ? 'Sign Up' : 'Log In'}</span>
          </button>
        </form>

        {/* Guest Login Option */}
        <div className="pt-3 border-t border-[#E0E2EC] dark:border-slate-800 mt-4 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="text-[#535F70] dark:text-slate-400 hover:text-[#0061A4] dark:hover:text-[#9ECAFF] font-medium flex items-center gap-1"
          >
            <span>Continue as Guest</span>
            <ArrowRight size={12} />
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#0061A4] dark:text-[#9ECAFF] hover:underline font-semibold"
          >
            {isSignUp ? 'Already registered? Log in' : 'New here? Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
};
