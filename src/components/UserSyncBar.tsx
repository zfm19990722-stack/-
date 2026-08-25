import { useState } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { SyncState } from '../services/wishSyncService';
import { Cloud, Check, RefreshCw, LogIn, LogOut, User as UserIcon, ShieldCheck, Sparkles } from 'lucide-react';

interface UserSyncBarProps {
  user: User | null;
  syncState: SyncState;
  onOpenAuthModal: () => void;
  onManualSync?: () => void;
  language?: 'zh' | 'en';
  wishCount: number;
}

export default function UserSyncBar({
  user,
  syncState,
  onOpenAuthModal,
  onManualSync,
  language = 'zh',
  wishCount,
}: UserSyncBarProps) {
  const isEn = language === 'en';
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowDropdown(false);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-2" id="user-sync-bar">
      {user ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 hover:bg-white border border-[#8e6d72]/20 shadow-xs hover:shadow transition-all text-xs text-[#4a3a3a] cursor-pointer"
            id="user-profile-menu-btn"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-5 h-5 rounded-full object-cover border border-[#8e6d72]/30"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#8e6d72]/15 text-[#8e6d72] flex items-center justify-center text-[10px] font-bold">
                {(user.displayName || user.email || 'P')[0].toUpperCase()}
              </div>
            )}
            
            <span className="font-semibold max-w-[100px] truncate text-[#4a3a3a]">
              {user.displayName || user.email?.split('@')[0] || 'Princess'}
            </span>

            {/* Cloud Sync Status Indicator */}
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              {syncState === 'syncing' ? (
                <>
                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-emerald-600" />
                  <span className="hidden sm:inline">{isEn ? 'Syncing...' : '同步中'}</span>
                </>
              ) : (
                <>
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                  <span className="hidden sm:inline">{isEn ? 'Cloud Synced' : '云端已同步'}</span>
                </>
              )}
            </span>
          </button>

          {/* Profile Dropdown */}
          {showDropdown && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl p-4 shadow-xl border border-white/80 z-50 text-[#4a3a3a] space-y-3 animate-fadeIn"
              id="user-profile-dropdown"
            >
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#8e6d72]/10">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full object-cover border border-[#8e6d72]/30"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#8e6d72]/20 text-[#8e6d72] flex items-center justify-center font-bold text-sm">
                    {(user.displayName || user.email || 'P')[0].toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-[#4a3a3a] truncate">
                    {user.displayName || 'Manifestation Princess'}
                  </p>
                  <p className="text-[10px] text-[#b49196] truncate">{user.email}</p>
                </div>
              </div>

              <div className="text-[11px] text-[#6d5b5e] space-y-1.5 bg-[#8e6d72]/5 p-2.5 rounded-xl border border-[#8e6d72]/10">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[#8e6d72] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isEn ? 'Storage' : '存储状态'}</span>
                  </span>
                  <span className="text-emerald-700 font-bold">{isEn ? 'Cloud Firestore' : '云端安全存储'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">{isEn ? 'Active Wishes' : '已同步心愿数'}</span>
                  <span className="font-bold text-[#8e6d72]">{wishCount} 个</span>
                </div>
              </div>

              {onManualSync && (
                <button
                  type="button"
                  onClick={() => {
                    onManualSync();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-medium text-[#4a3a3a] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-[#8e6d72]" />
                  <span>{isEn ? 'Sync Wishes Now' : '立刻手动同步心愿'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                id="logout-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isEn ? 'Sign Out' : '退出登录'}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenAuthModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/60 hover:bg-white border border-[#8e6d72]/20 shadow-xs hover:shadow transition-all text-xs font-semibold text-[#8e6d72] cursor-pointer hover:scale-105"
          id="open-auth-modal-btn"
          title={isEn ? 'Log in to sync wishes across devices' : '登录后多端同步愿望清单'}
        >
          <Cloud className="w-3.5 h-3.5 text-pink-500" />
          <span>{isEn ? 'Cloud Sync Login' : '云端同步登录'}</span>
        </button>
      )}
    </div>
  );
}
