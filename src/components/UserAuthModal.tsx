import React, { useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { X, Sparkles, Cloud, Lock, Mail, User as UserIcon, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'zh' | 'en';
  onLoginSuccess?: (user: User) => void;
}

export default function UserAuthModal({
  isOpen,
  onClose,
  language = 'zh',
  onLoginSuccess,
}: UserAuthModalProps) {
  const isEn = language === 'en';
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const saveUserProfile = async (user: User, customName?: string) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          id: user.uid,
          email: user.email || '',
          displayName: customName || user.displayName || user.email?.split('@')[0] || 'Princess User',
          photoURL: user.photoURL || '',
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Failed to save user profile to firestore:', e);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserProfile(result.user);
      setSuccessMsg(isEn ? 'Signed in successfully with Google!' : 'Google 账号登录成功！');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(result.user);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg(isEn ? 'Sign in popup was closed.' : '登录弹窗已关闭');
      } else {
        setErrorMsg(err.message || (isEn ? 'Google sign in failed.' : 'Google 登录失败，请重试'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || (mode !== 'reset' && !password.trim())) {
      setErrorMsg(isEn ? 'Please fill in all required fields.' : '请填写完整的信息');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName.trim()) {
          await updateProfile(result.user, { displayName: displayName.trim() });
        }
        await saveUserProfile(result.user, displayName.trim());
        setSuccessMsg(isEn ? 'Account created and synced successfully!' : '账号注册成功，已开启云端多端同步！');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(result.user);
          onClose();
        }, 800);
      } else if (mode === 'signin') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await saveUserProfile(result.user);
        setSuccessMsg(isEn ? 'Welcome back! Synced successfully.' : '欢迎回来！已同步您的云端心愿清单');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(result.user);
          onClose();
        }, 800);
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg(isEn ? 'Password reset email sent. Please check your inbox.' : '重置密码链接已发送至您的邮箱，请查收');
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      let message = err.message;
      if (err.code === 'auth/invalid-email') {
        message = isEn ? 'Invalid email format.' : '邮箱格式不正确';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = isEn ? 'Incorrect email or password.' : '邮箱或密码不匹配，请检查后再试';
      } else if (err.code === 'auth/email-already-in-use') {
        message = isEn ? 'This email is already registered. Please sign in.' : '该邮箱已注册，请直接登录';
      } else if (err.code === 'auth/weak-password') {
        message = isEn ? 'Password must be at least 6 characters.' : '密码强度较低，请输入至少6位字符';
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn" id="auth-modal-overlay">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[32px] p-7 md:p-8 shadow-2xl border border-white/80 overflow-hidden text-[#4a3a3a]">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-pink-200/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-100/60 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#8e6d72]/70 hover:text-[#8e6d72] hover:bg-[#8e6d72]/10 rounded-full transition-colors"
          title={isEn ? 'Close' : '关闭'}
          id="close-auth-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#fcf0e2] to-[#ffe4e9] border border-[#8e6d72]/20 mb-3 shadow-inner">
            <Cloud className="w-6 h-6 text-[#8e6d72]" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#8e6d72] tracking-wide">
            {mode === 'signup' 
              ? (isEn ? 'Join the Manifestation Realm' : '开启云端心愿同步') 
              : mode === 'reset'
              ? (isEn ? 'Reset Password' : '找回账户密码')
              : (isEn ? 'Welcome to Manifestation Palace' : '登录心愿殿堂 • 云端多端同步')}
          </h3>
          <p className="text-xs text-[#b49196] mt-1.5 font-sans leading-relaxed">
            {isEn 
              ? 'Synchronize your manifestation desires across all your devices securely with Cloud Firestore.' 
              : '登录后自动将您的愿望清单与显化场景安全同步至云端，换设备或清理缓存不丢失。'}
          </p>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google 1-Click Login */}
        {mode !== 'reset' && (
          <div className="space-y-3 mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-gray-50 border border-[#8e6d72]/20 text-[#4a3a3a] text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              id="google-signin-btn"
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
              <span>{isEn ? 'Continue with Google (1-Click Sync)' : '使用 Google 账号一键快捷登录'}</span>
            </button>

            <div className="flex items-center gap-3 my-3">
              <div className="h-px flex-1 bg-[#8e6d72]/15" />
              <span className="text-[10px] text-[#b49196] font-medium uppercase tracking-wider">
                {isEn ? 'Or with email' : '或使用邮箱密码'}
              </span>
              <div className="h-px flex-1 bg-[#8e6d72]/15" />
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#8e6d72] block">
                {isEn ? 'Princess / User Nickname' : '称谓 / 用户昵称'}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-[#b49196]" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={isEn ? 'e.g. Princess Seraphina' : '例如：静谧优雅公主'}
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-[#8e6d72]/20 bg-white/70 focus:ring-2 focus:ring-[#8e6d72]/30 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#8e6d72] block">
              {isEn ? 'Email Address' : '邮箱地址'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#b49196]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isEn ? 'yourname@example.com' : '请输入您的常用邮箱'}
                className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-[#8e6d72]/20 bg-white/70 focus:ring-2 focus:ring-[#8e6d72]/30 focus:outline-none"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#8e6d72] block">
                  {isEn ? 'Password' : '登录密码'}
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[10px] text-[#8e6d72] hover:underline"
                  >
                    {isEn ? 'Forgot password?' : '忘记密码？'}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#b49196]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEn ? '••••••••' : '请输入至少 6 位密码'}
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-[#8e6d72]/20 bg-white/70 focus:ring-2 focus:ring-[#8e6d72]/30 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#8e6d72] hover:bg-[#8e6d72]/90 text-white font-sans text-xs font-bold shadow-lg shadow-pink-950/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            id="auth-submit-btn"
          >
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {mode === 'signup'
                ? (isEn ? 'Create Account & Sync Wishes' : '注册并同步心愿')
                : mode === 'reset'
                ? (isEn ? 'Send Reset Link' : '发送重置密码邮件')
                : (isEn ? 'Sign In & Sync' : '立即登录并同步')}
            </span>
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-5 text-center text-xs text-[#6d5b5e]">
          {mode === 'signin' ? (
            <p>
              {isEn ? "Don't have an account yet? " : "还没有同步账号？ "}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-[#8e6d72] hover:underline cursor-pointer"
              >
                {isEn ? 'Create Free Account' : '免费注册'}
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p>
              {isEn ? 'Already have an account? ' : '已有账号？ '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-[#8e6d72] hover:underline cursor-pointer"
              >
                {isEn ? 'Sign In' : '直接登录'}
              </button>
            </p>
          ) : (
            <p>
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-[#8e6d72] hover:underline cursor-pointer"
              >
                {isEn ? 'Back to Sign In' : '返回登录'}
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
