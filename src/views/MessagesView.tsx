import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MessageSquare, CheckCheck, Sparkles } from 'lucide-react';
import { DirectMessage, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { formatTimeAgo } from '../utils/themeTokens';
import { useTheme } from '../context/ThemeContext';

interface MessagesViewProps {
  currentUser: UserProfile;
  initialChatUserId?: string;
  onBackToHome: () => void;
  onOpenProfile: (userId: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  initialChatUserId,
  onBackToHome,
  onOpenProfile,
}) => {
  const { resolvedDark } = useTheme();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(() => {
    if (initialChatUserId) {
      return storageService.getAllUsers().find(u => u.id === initialChatUserId) || null;
    }
    return null;
  });

  const [conversations, setConversations] = useState<Array<{ user: UserProfile; lastMsg: DirectMessage }>>([]);
  const [activeMessages, setActiveMessages] = useState<DirectMessage[]>([]);
  const [inputContent, setInputContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = () => {
    const allMsgs = storageService.getAllMessages();
    const otherUsers = storageService.getAllUsers().filter(u => u.id !== currentUser.id);

    const convList: Array<{ user: UserProfile; lastMsg: DirectMessage }> = [];
    otherUsers.forEach(u => {
      const userMsgs = allMsgs.filter(
        m => (m.senderId === currentUser.id && m.receiverId === u.id) ||
             (m.senderId === u.id && m.receiverId === currentUser.id)
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (userMsgs.length > 0) {
        convList.push({ user: u, lastMsg: userMsgs[0] });
      }
    });

    convList.sort((a, b) => new Date(b.lastMsg.createdAt).getTime() - new Date(a.lastMsg.createdAt).getTime());
    setConversations(convList);

    if (selectedUser) {
      setActiveMessages(storageService.getMessagesWithUser(selectedUser.id));
    }
  };

  useEffect(() => {
    loadConversations();
    const unsub = storageService.subscribe('messages', loadConversations);
    return () => unsub();
  }, [selectedUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !selectedUser) return;

    storageService.sendMessage(selectedUser.id, inputContent);
    setInputContent('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      {selectedUser ? (
        /* --- Active Chat Detail View --- */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Header */}
          <header className={`px-4 py-3 border-b flex items-center justify-between shrink-0 transition-colors ${
            resolvedDark ? 'bg-[#111418] border-slate-800 text-[#E2E2E6]' : 'bg-[#FDFBFF] border-[#F0F2F5] text-[#1A1C1E]'
          }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-full text-[#74777F] dark:text-slate-400 hover:text-[#1A1C1E] dark:hover:text-slate-200"
              >
                <ArrowLeft size={19} />
              </button>
              <div
                onClick={() => onOpenProfile(selectedUser.id)}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <img
                  src={selectedUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={selectedUser.username}
                  className="w-8 h-8 rounded-full object-cover border border-[#E0E2EC] dark:border-slate-700/50"
                />
                <div>
                  <h3 className="font-bold text-xs leading-tight text-[#1A1C1E] dark:text-[#E2E2E6]">
                    {selectedUser.displayName}
                  </h3>
                  <span className="text-[11px] text-[#535F70] dark:text-slate-400">@{selectedUser.username}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Supabase Realtime</span>
            </div>
          </header>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeMessages.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Send a message to start direct chat with @{selectedUser.username}
              </div>
            ) : (
              activeMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? resolvedDark
                            ? 'bg-[#00497D] text-[#D1E4FF] rounded-br-xs shadow-xs'
                            : 'bg-[#0061A4] text-white rounded-br-xs shadow-xs'
                          : resolvedDark
                          ? 'bg-[#18202D] text-[#E2E2E6] rounded-bl-xs border border-slate-700/60'
                          : 'bg-[#F0F2F5] text-[#1A1C1E] rounded-bl-xs border border-[#E0E2EC]'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-[#74777F] dark:text-slate-500 mt-1 px-1">
                      {formatTimeAgo(msg.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            className={`p-3 border-t flex items-center gap-2 ${
              resolvedDark ? 'bg-[#111418] border-slate-800' : 'bg-[#FDFBFF] border-[#F0F2F5]'
            }`}
          >
            <input
              type="text"
              placeholder={`Message @${selectedUser.username}...`}
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              className={`flex-1 px-4 py-2 rounded-full text-xs outline-none border transition-colors ${
                resolvedDark
                  ? 'bg-[#18202D] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#9ECAFF]'
                  : 'bg-[#F0F2F5] border-[#E0E2EC] text-[#1A1C1E] placeholder-[#74777F] focus:border-[#0061A4]'
              }`}
            />
            <button
              type="submit"
              disabled={!inputContent.trim()}
              className="p-2.5 rounded-full bg-[#0061A4] hover:bg-[#00518A] disabled:opacity-40 text-white transition-transform active:scale-95 shadow-xs shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      ) : (
        /* --- Conversations List View --- */
        <div className="flex-1 flex flex-col min-h-0">
          <header className={`px-4 py-3 border-b flex items-center justify-between shrink-0 transition-colors ${
            resolvedDark ? 'bg-[#111418] border-slate-800 text-[#E2E2E6]' : 'bg-[#FDFBFF] border-[#F0F2F5] text-[#1A1C1E]'
          }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToHome}
                className="p-1 rounded-full text-[#74777F] dark:text-slate-400 hover:text-[#1A1C1E] dark:hover:text-slate-200"
              >
                <ArrowLeft size={19} />
              </button>
              <h2 className="font-bold text-base flex items-center gap-2">
                <MessageSquare size={18} className="text-[#0061A4] dark:text-[#9ECAFF]" />
                <span>Direct Messages</span>
              </h2>
            </div>

            <span className="text-xs text-[#74777F] dark:text-slate-400">
              {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
            </span>
          </header>

          <div className="flex-1 overflow-y-auto divide-y divide-[#F0F2F5] dark:divide-slate-800/40">
            {conversations.length === 0 ? (
              <div className="py-16 text-center text-[#74777F] dark:text-slate-400 text-xs px-6">
                <Sparkles size={32} className="mx-auto mb-2 text-[#0061A4] dark:text-[#9ECAFF]" />
                <p className="font-bold text-sm text-[#1A1C1E] dark:text-slate-200">No active conversations</p>
                <p className="text-[#74777F] dark:text-slate-400 mt-1">
                  Visit any profile to send a message via Supabase Realtime streams!
                </p>
              </div>
            ) : (
              conversations.map(({ user, lastMsg }) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                    resolvedDark ? 'hover:bg-slate-800/30' : 'hover:bg-[#F0F2F5]'
                  }`}
                >
                  <img
                    src={user.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={user.username}
                    className="w-11 h-11 rounded-full object-cover shrink-0 border border-[#E0E2EC] dark:border-slate-700/40"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-[#1A1C1E] dark:text-[#E2E2E6] truncate">{user.displayName}</p>
                      <span className="text-[10px] text-[#74777F] dark:text-slate-500 shrink-0">
                        {formatTimeAgo(lastMsg.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[#535F70] dark:text-slate-400 truncate mt-0.5">
                      {lastMsg.senderId === currentUser.id ? 'You: ' : ''}{lastMsg.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
