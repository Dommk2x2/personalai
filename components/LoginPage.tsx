import React, { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LockClosedIcon, UserIcon, KeyIcon, EyeIcon, EyeSlashIcon, ArrowUpTrayIcon, TrashIcon as RemoveIcon } from './Icons';
import { hexToRgba } from '../utils/colorUtils';
import useLocalStorage from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_LOGIN_BACKGROUND_KEY } from '../constants';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface LoginPageProps {
  onLoginAttempt: (username: string, password:string) => boolean;
  appTitle: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginAttempt, appTitle }) => {
  const { currentThemeColors } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // State for custom background image
  const [customBg, setCustomBg] = useLocalStorage<string | null>(LOCAL_STORAGE_LOGIN_BACKGROUND_KEY, null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("Image size should not exceed 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomBg(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove the custom background?")) {
      setCustomBg(null);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const success = onLoginAttempt(username, password);
      if (!success) {
        setError('Invalid username or password.');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener in App.tsx or useFirebaseSync will handle the rest
      // For now, we just need to satisfy the onLoginAttempt if needed, 
      // but usually Firebase Auth is enough to unlock the app if we modify App.tsx
      onLoginAttempt('google_user', 'google_auth'); 
    } catch (err: any) {
      console.error("Google login failed:", err);
      setError(err.message || "Google login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClasses = "block w-full pl-10 pr-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed";

  const galleryImages = [
    { src: 'https://picsum.photos/seed/finance/800/600', animationClass: 'animate-kenburns-1' },
    { src: 'https://picsum.photos/seed/success/800/600', animationClass: 'animate-kenburns-2' },
    { src: 'https://picsum.photos/seed/office/800/600', animationClass: 'animate-kenburns-3' },
    { src: 'https://picsum.photos/seed/growth/800/600', animationClass: 'animate-kenburns-4' },
    { src: 'https://picsum.photos/seed/journey/800/600', animationClass: 'animate-kenburns-2' },
    { src: 'https://picsum.photos/seed/future/800/600', animationClass: 'animate-kenburns-1' },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: currentThemeColors.bgPrimary }}>
      {/* Left Branding Panel */}
      <div
        className="hidden md:flex md:w-1/2 lg:w-2/5 flex-col items-center justify-center p-8 text-white relative overflow-hidden group"
      >
        {customBg ? (
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${customBg})` }}
            ></div>
        ) : (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 opacity-30">
                {galleryImages.map((img, index) => (
                    <div
                        key={index}
                        className={`bg-cover bg-center ${img.animationClass}`}
                        style={{ backgroundImage: `url(${img.src})` }}
                    ></div>
                ))}
            </div>
        )}
        
        {/* Gradient and Color Overlay */}
        <div className="absolute inset-0" style={{
            backgroundColor: customBg ? hexToRgba(currentThemeColors.bgPrimary, 0.5) : currentThemeColors.brandPrimary,
            backgroundImage: `
                radial-gradient(circle at 10% 20%, ${hexToRgba(currentThemeColors.brandSecondary, 0.3)} 0%, transparent 40%),
                radial-gradient(circle at 80% 90%, ${hexToRgba(currentThemeColors.bgAccent, 0.2)} 0%, transparent 50%)
            `,
            opacity: customBg ? 0.9 : 0.85
        }}></div>

        {/* Text Content */}
        <div className="relative z-10 text-center animate-fade-in">
          <h1 className="text-4xl lg:text-5xl font-bold">{appTitle}</h1>
          <p className="mt-4 text-lg" style={{ color: hexToRgba(currentThemeColors.textInverted, 0.8) }}>Your finances, simplified and secured.</p>
        </div>
        
        {/* Upload/Remove Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            <button
                onClick={handleTriggerUpload}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                title="Upload custom background"
                aria-label="Upload custom background"
            >
                <ArrowUpTrayIcon className="w-5 h-5" />
            </button>
            {customBg && (
                <button
                    onClick={handleRemoveImage}
                    className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    title="Remove custom background"
                    aria-label="Remove custom background"
                >
                    <RemoveIcon className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full md:w-1/2 lg:w-3/5 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center md:hidden mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold" style={{ color: currentThemeColors.brandPrimary }}>{appTitle}</h1>
          </div>
          <div 
            className="relative overflow-hidden p-6 sm:p-8 rounded-xl shadow-2xl animate-modal-enter w-full"
            style={{ backgroundColor: currentThemeColors.bgSecondary }}
          >
            <div className="text-center mb-6">
                <h2 id="login-title" className="text-2xl font-bold" style={{ color: currentThemeColors.textBase }}>
                    Welcome Back
                </h2>
                <p className="text-sm text-text-muted-themed mt-1">Please sign in to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" aria-labelledby="login-title">
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="w-5 h-5 text-text-muted-themed" />
                    </div>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={handleInputChange(setUsername)}
                        className={inputBaseClasses}
                        placeholder="Username"
                        required
                        aria-required="true"
                        autoComplete="username"
                    />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <KeyIcon className="w-5 h-5 text-text-muted-themed" />
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={handleInputChange(setPassword)}
                        className={`${inputBaseClasses} pr-10`}
                        placeholder="Password"
                        required
                        aria-required="true"
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        style={{ color: currentThemeColors.textMuted }}
                    >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
              </div>

              {error && (
                <p 
                    className="text-xs text-center p-2.5 rounded-md" 
                    style={{ color: currentThemeColors.expense, backgroundColor: `${currentThemeColors.expense}2A` }}
                    role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm sm:text-base font-medium rounded-lg shadow-md text-text-inverted focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-bg-secondary-themed transition-all duration-200 ease-in-out disabled:opacity-70"
                style={{ backgroundColor: currentThemeColors.brandPrimary }}
                onMouseOver={(e) => e.currentTarget.style.opacity = isLoading ? '0.7' : '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = isLoading ? '0.7' : '1'}
                aria-live="polite"
                aria-busy={isLoading}
              >
                {isLoading ? <div className="spinner"></div> : "Sign In"}
              </button>
            </form>

            <div className="mt-4">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border-primary"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-bg-secondary-themed px-2 text-text-muted-themed">Or continue with</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-border-primary rounded-lg shadow-sm bg-bg-primary-themed text-text-base-themed hover:bg-bg-accent-themed transition-all duration-200 disabled:opacity-70"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                    Sign in with Google
                </button>
            </div>
            <p className="text-xs text-text-muted-themed mt-6 text-center">
                Hint: `admin/admin123` or create users in User Management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;