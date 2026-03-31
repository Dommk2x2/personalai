
import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import { useProfilePicture } from '../hooks/useProfilePicture';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY, LOCAL_STORAGE_LOCK_SCREEN_PICTURE_KEY } from '../constants';
import { UserCircleIcon, ArrowUpTrayIcon, TrashIcon, XCircleIcon, CheckCircleIcon, FaceSmileIcon, TypeIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const TARGET_IMAGE_DIMENSION = 256; // Target dimension for resizing (e.g., 256x256)

const EMOJIS = ['😊', '😎', '🔥', '🚀', '💎', '🌈', '🍕', '🎉', '💡', '🌟', '🍀', '🐱', '🐶', '🦄', '🍎', '⚽', '🎮', '🎸', '🏠', '✈️', '❤️', '✨', '🌍', '🍔', '🍦'];
const INITIAL_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4'];

interface ProfilePictureProps {
  username: string;
  size?: string;
  className?: string;
  type?: 'general' | 'lockscreen';
}

type TabType = 'upload' | 'emoji' | 'initials';

const ProfilePicture: React.FC<ProfilePictureProps> = ({ username, size = 'w-12 h-12', className = '', type = 'general' as 'general' | 'lockscreen' }) => {
  const [profilePicture, setProfilePicture] = useProfilePicture(username, type);

  // Sync to legacy key for other components
  React.useEffect(() => {
    if (type === 'general') {
      if (profilePicture) {
        window.localStorage.setItem(LOCAL_STORAGE_PROFILE_PICTURE_KEY, profilePicture);
      } else {
        window.localStorage.removeItem(LOCAL_STORAGE_PROFILE_PICTURE_KEY);
      }
    }
  }, [profilePicture, type]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [initialsText, setInitialsText] = useState(username.substring(0, 2).toUpperCase());
  const [initialsColor, setInitialsColor] = useState(INITIAL_COLORS[0]);
  const [manualEmoji, setManualEmoji] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { currentThemeColors } = useTheme();

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      alert(`File is too large. Max size is ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (file.type === 'image/gif') {
        // For GIFs, we offer to save directly to preserve animation
        if (window.confirm('This is a GIF. Save directly to preserve animation? (Adjusting will make it a static image)')) {
          setProfilePicture(result);
          setIsModalOpen(false);
          return;
        }
      }
      setTempImage(result);
      setPosition({ x: 0, y: 0 });
      setScale(1);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEmoji = (emoji: string) => {
    setProfilePicture(`emoji:${emoji}`);
    setIsModalOpen(false);
  };

  const handleSaveInitials = () => {
    if (!initialsText.trim()) return;
    setProfilePicture(`initials:${initialsText.trim().substring(0, 2).toUpperCase()}:${initialsColor}`);
    setIsModalOpen(false);
  };

  const renderProfileContent = (data: string | null, isPreview = false) => {
    if (!data) {
      return <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full" />;
    }

    if (data.startsWith('emoji:')) {
      const emoji = data.split(':')[1];
      return (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800" style={{ fontSize: isPreview ? '5rem' : '1.5rem' }}>
          {emoji}
        </div>
      );
    }

    if (data.startsWith('initials:')) {
      const parts = data.split(':');
      const text = parts[1];
      const color = parts[2] || '#3b82f6';
      return (
        <div 
          className="w-full h-full flex items-center justify-center font-black text-white" 
          style={{ 
            backgroundColor: color,
            fontSize: isPreview ? '3rem' : '0.875rem'
          }}
        >
          {text}
        </div>
      );
    }

    return <img src={data} alt="Profile" className="w-full h-full object-cover" />;
  };

  const handleSaveAdjustedImage = () => {
    if (!tempImage) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = TARGET_IMAGE_DIMENSION;
      canvas.height = TARGET_IMAGE_DIMENSION;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate dimensions to cover the square canvas
        let drawWidth, drawHeight;
        const aspectRatio = img.width / img.height;
        
        if (aspectRatio > 1) {
          drawHeight = TARGET_IMAGE_DIMENSION;
          drawWidth = TARGET_IMAGE_DIMENSION * aspectRatio;
        } else {
          drawWidth = TARGET_IMAGE_DIMENSION;
          drawHeight = TARGET_IMAGE_DIMENSION / aspectRatio;
        }

        // Apply scale and position
        // The position is relative to the preview container (usually 128px or 112px)
        // We need to normalize it to the TARGET_IMAGE_DIMENSION (256px)
        const previewSize = previewRef.current?.offsetWidth || 128;
        const ratio = TARGET_IMAGE_DIMENSION / previewSize;
        
        const scaledWidth = drawWidth * scale;
        const scaledHeight = drawHeight * scale;
        
        const centerX = TARGET_IMAGE_DIMENSION / 2;
        const centerY = TARGET_IMAGE_DIMENSION / 2;
        
        const x = centerX - (scaledWidth / 2) + (position.x * ratio);
        const y = centerY - (scaledHeight / 2) + (position.y * ratio);

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setProfilePicture(dataUrl);
        setTempImage(null);
        setIsModalOpen(false);
      }
    };
    img.src = tempImage;
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!tempImage) return;
    setIsPanning(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPanStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPanning || !tempImage) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - panStart.x,
      y: clientY - panStart.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setTempImage(null);
    setIsModalOpen(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const openModal = () => {
    setIsModalOpen(true);
    setTempImage(null);
  };
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTempImage(null);
  }, []);

  return (
    <>
      <button
        onClick={openModal}
        className={`rounded-full ${size} flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-bg-primary transition-all duration-150 border border-brand-primary/20 p-0.5 ${className}`}
        aria-label="Open profile picture settings"
      >
        <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {renderProfileContent(profilePicture)}
        </div>
      </button>

      {isModalOpen && createPortal(
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] transition-opacity duration-300"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-picture-modal-title"
        >
            <div 
              className={`relative bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modalEnter border-2 ${isDragging ? 'border-brand-primary border-dashed bg-brand-primary/5' : 'border-slate-200 dark:border-slate-800'}`}
              onClick={(e) => e.stopPropagation()} 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isDragging && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-brand-primary/10 rounded-2xl backdrop-blur-[2px] pointer-events-none">
                  <div className="bg-brand-primary text-white p-3 rounded-full shadow-lg mb-2">
                    <ArrowUpTrayIcon className="w-6 h-6 animate-bounce" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-brand-primary">Drop to Upload</p>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <h2 id="profile-picture-modal-title" className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                  {tempImage ? 'Adjust Position' : (type === 'lockscreen' ? 'Lock Screen Picture' : 'Profile Picture')}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label="Close profile picture settings"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>

              {!tempImage && (
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
                  {(['upload', 'emoji', 'initials'] as TabType[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 flex items-center justify-center py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === tab 
                          ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {tab === 'upload' && <ArrowUpTrayIcon className="w-3.5 h-3.5 mr-1.5" />}
                      {tab === 'emoji' && <FaceSmileIcon className="w-3.5 h-3.5 mr-1.5" />}
                      {tab === 'initials' && <TypeIcon className="w-3.5 h-3.5 mr-1.5" />}
                      {tab}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex flex-col items-center mb-6">
                <div 
                  ref={previewRef}
                  className="relative rounded-full w-32 h-32 sm:w-40 sm:h-40 shadow-xl border-4 border-white dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-move touch-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleMouseDown}
                  onTouchMove={handleMouseMove}
                  onTouchEnd={handleMouseUp}
                >
                  {tempImage ? (
                    <img 
                      src={tempImage} 
                      alt="Adjusting" 
                      className="absolute max-w-none pointer-events-none select-none"
                      style={{
                        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
                        top: '50%',
                        left: '50%',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : activeTab === 'emoji' ? (
                    <div className="w-full h-full flex items-center justify-center text-6xl bg-slate-100 dark:bg-slate-800">
                      {profilePicture?.startsWith('emoji:') ? profilePicture.split(':')[1] : '😊'}
                    </div>
                  ) : activeTab === 'initials' ? (
                    <div 
                      className="w-full h-full flex items-center justify-center font-black text-white text-4xl"
                      style={{ backgroundColor: initialsColor }}
                    >
                      {initialsText}
                    </div>
                  ) : (
                    renderProfileContent(profilePicture, true)
                  )}
                  
                  {tempImage && (
                    <div className="absolute inset-0 border-2 border-brand-primary/30 rounded-full pointer-events-none"></div>
                  )}
                </div>
                
                {tempImage && (
                  <div className="w-full mt-6 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Zoom</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary">{Math.round(scale * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="3" 
                      step="0.01" 
                      value={scale} 
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                    <p className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-tighter mt-1">Drag image to reposition</p>
                  </div>
                )}
              </div>

              {activeTab === 'emoji' && !tempImage && (
                <div className="space-y-4 mb-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Manual Emoji</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Paste emoji here..."
                        value={manualEmoji}
                        onChange={(e) => setManualEmoji(e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={() => manualEmoji && handleSaveEmoji(manualEmoji)}
                        disabled={!manualEmoji}
                        className={`px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 ${!manualEmoji ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white dark:bg-slate-900 px-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">or pick from list</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 scrollbar-hide">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleSaveEmoji(emoji)}
                        className="text-2xl p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'initials' && !tempImage && (
                <div className="space-y-4 mb-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Initials</label>
                    <input 
                      type="text"
                      maxLength={2}
                      value={initialsText}
                      onChange={(e) => setInitialsText(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-black focus:ring-2 focus:ring-brand-primary text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Background Color</label>
                    <div className="flex flex-wrap gap-2">
                      {INITIAL_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setInitialsColor(color)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${initialsColor === color ? 'border-brand-primary scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleSaveInitials}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Apply Initials
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
                aria-labelledby="upload-button-label"
              />
              
              <div className="space-y-3">
                  {tempImage ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setTempImage(null)}
                        className="flex items-center justify-center px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveAdjustedImage}
                        className="flex items-center justify-center px-4 py-2.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Save
                      </button>
                    </div>
                  ) : activeTab === 'upload' && (
                    <>
                      <button
                      id="upload-button-label"
                      onClick={triggerFileInput}
                      className="w-full flex items-center justify-center px-4 py-2.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95"
                      >
                      <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                      Upload New Picture
                      </button>

                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white dark:bg-slate-900 px-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">or drag & drop</span>
                        </div>
                      </div>

                      {profilePicture && !profilePicture.startsWith('emoji:') && !profilePicture.startsWith('initials:') && (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => { setTempImage(profilePicture); setPosition({ x: 0, y: 0 }); setScale(1); }}
                            className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                          >
                            Edit
                          </button>
                          <button
                              onClick={removeProfilePicture}
                              className="w-full flex items-center justify-center px-4 py-2.5 border border-rose-500/20 bg-rose-500/5 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500/10 transition-all active:scale-95"
                          >
                              <TrashIcon className="w-4 h-4 mr-2" />
                              Remove
                          </button>
                        </div>
                      )}
                      {profilePicture && (profilePicture.startsWith('emoji:') || profilePicture.startsWith('initials:')) && (
                        <button
                            onClick={removeProfilePicture}
                            className="w-full flex items-center justify-center px-4 py-2.5 border border-rose-500/20 bg-rose-500/5 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500/10 transition-all active:scale-95"
                        >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Remove Current
                        </button>
                      )}
                    </>
                  )}
              </div>
               {activeTab === 'upload' && !tempImage && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-5 text-center">Max 5MB. JPG, PNG, GIF accepted.</p>}
            </div>
        </div>,
        document.body
      )}
       <style>{`
        @keyframes modalEnter {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modalEnter {
          animation: modalEnter 0.3s forwards;
        }
      `}</style>
    </>
  );
};

export default ProfilePicture;
