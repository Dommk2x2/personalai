import React from 'react';
import type { IconProps } from '../types';
import { ExpenseCategory, IncomeCategory } from '../types';

export const LayoutIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 7.125c0-.621.504-1.125 1.125-1.125h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM2.25 17.625c0-.621.504-1.125 1.125-1.125h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 17.625c0-.621.504-1.125 1.125-1.125h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75Z" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.502 0A48.097 48.097 0 0 1 9.25 5.397M4.772 5.79L4.772 5.79m0-3.21a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H5.522a.75.75 0 0 1-.75-.75Z" />
  </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
  </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
  </svg>
);

export const ArrowPathIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export const IncomeIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-3.75-3.75M12 19.5l3.75-3.75" /> {/* Arrow pointing down for income */}
  </svg>
);

export const ExpenseIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5V4.5m0 0l-3.75 3.75M12 4.5l3.75 3.75" /> {/* Arrow pointing up for expense */}
  </svg>
);

export const FormIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 5.25 6h.008a2.25 2.25 0 0 1 2.242 2.135l.002.004a2.25 2.25 0 0 0 .1.664M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const ChartIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1.293-1.293a1.125 1.125 0 0 1 0-1.591l2.874-2.875L11.25 3.51m0 12.99H6.75a2.25 2.25 0 0 1-2.25-2.25V3m14.25 0v11.25a2.25 2.25 0 0 1-2.25-2.25h-2.25" />
  </svg>
);

export const HistoryIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const PassbookIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export const EyeSlashIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.574M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21 3 3" />
  </svg>
);

export const FaceSmileIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M12 12a2.25 2.25 0 0 0-2.25 2.25c0 1.31.376 2.528 1.007 3.497M12 12a2.25 2.25 0 0 1 2.25 2.25c0 1.31-.376 2.528-1.007 3.497M12 12a2.25 2.25 0 0 0 2.25-2.25c0-1.31.376 2.528 1.007-3.497M12 12a2.25 2.25 0 0 1-2.25-2.25c0-1.31.376 2.528-1.007-3.497M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

export const RefreshCwIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export const ClipboardListIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const SaveIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const FolderOpenIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0A2.25 2.25 0 0 1 6 7.5h12a2.25 2.25 0 0 1 2.25 2.25m-16.5 0V21A2.25 2.25 0 0 0 6 23.25h12A2.25 2.25 0 0 0 20.25 21V9.75m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h12A2.25 2.25 0 0 1 20.25 6v3.75m-16.5 0h16.5" />
  </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

export const CogIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774a1.125 1.125 0 0 1 .12 1.45l-.527.737c-.25.35-.272.806-.108 1.204.165.399.505.71.93.78l.895.149c.542.09.94.56.94 1.11v1.093c0 .55-.398 1.02-.94 1.11l-.895.149c-.425.07-.765.383-.93.78-.165.398-.143.854.108 1.204l.527.738c.34.477.284 1.005-.12 1.45l-.773.774a1.125 1.125 0 0 1-1.45.12l-.737-.527c-.35-.25-.806-.272-1.205-.108-.399.165-.71.505-.78.93l.149.895c-.09.542-.56.94-1.11-.94h-1.093c-.55 0-1.02-.398-1.11-.94l-.149-.895c-.07-.425-.383-.765-.78-.93-.398-.165-.854-.143-1.204.108l-.738.527c-.477.34-1.005.284-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272.806.108-1.204-.165-.399-.505-.71-.93-.78l-.895-.149c-.542-.09-.94-.56-.94-1.11v-1.093c0 .55.398-1.02.94-1.11l.895-.149c.425-.07.765-.383.93-.78.165-.398.143.854-.108-1.204l-.527-.738c-.34-.477-.284-1.005.12-1.45l.773-.774a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.806.272 1.205.108.399-.165.71-.505.78-.93l.149-.895Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-3.75h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V18Z" />
  </svg>
);

export const CalculatorIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const BookOpenIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

export const TargetIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.82m5.84-2.56a17.96 17.96 0 0 0-5.84-2.56m0 0A17.96 17.96 0 0 1 9.75 2.25M12 12.75a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 0v2.25m0-2.25H9.75M12 12.75H14.25M12 12.75a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm0 0V6.75m0 6V15m0 0v2.25m0 0V19.5m0 0h2.25M12 15H9.75M12 15a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0 0v4.875c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125V15m-4.5 0v3.75m0-3.75a3.75 3.75 0 0 0-3.75-3.75H6.75a3.75 3.75 0 0 0-3.75 3.75v3.75c0 .621.504 1.125 1.125 1.125h2.25" />
  </svg>
);

export const BellIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);

export const DatabaseIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
  </svg>
);

export const CalendarDaysIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

export const UserGroupIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.242 2.72V18s0-1.5-1.5-1.5-1.5 1.5-1.5 1.5v.72m0 0a9.094 9.094 0 0 0 3.741.479m-3.741-.479a9.094 9.094 0 0 1-3.741.479m0 0A9.095 9.095 0 0 1 3 18.72m0-3.36A9.095 9.095 0 0 1 6.259 9.75m11.482 0A9.095 9.095 0 0 0 12 9.75M12 9.75c-1.065 0-2.065.275-2.95.75m2.95-.75c-1.065 0-2.065.275-2.95.75m0 0A9.094 9.094 0 0 0 6.259 15.36M12 4.5c-1.065 0-2.065.275-2.95.75M12 4.5c1.065 0 2.065.275 2.95.75" />
  </svg>
);

export const ArrowDownTrayIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

// Generic Users Icon for groups or user management sections
export const UsersIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A1.875 1.875 0 0 1 17.624 22.5H6.375A1.875 1.875 0 0 1 4.5 20.118ZM21.75 6.75v1.5a3 3 0 0 1-3 3h-3.75a3 3 0 0 1-3-3v-1.5M19.5 11.25v.75c0 .621-.504 1.125-1.125 1.125h-1.5c-.621 0-1.125-.504-1.125-1.125v-.75m-.375-3.75h.008v.008h-.008v-.008Z" />
    </svg>
);


export const ListBulletIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const DocumentChartBarIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
  </svg>
);

export const DocumentIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12 3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625a1.875 1.875 0 00-1.875 1.875v17.25a1.875 1.875 0 001.875 1.875h12.75a1.875 1.875 0 001.875-1.875V11.25a1.875 1.875 0 00-1.875-1.875h-3.75a1.875 1.875 0 01-1.875-1.875V5.25z" />
  </svg>
);

export const DocumentArrowUpIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-12H5.625a1.875 1.875 0 0 0-1.875 1.875v17.25a1.875 1.875 0 0 0 1.875 1.875h12.75a1.875 1.875 0 0 0 1.875-1.875V11.25a1.875 1.875 0 0 0-1.875-1.875h-3.75a1.875 1.875 0 0 1-1.875-1.875V5.25Z" />
  </svg>
);

export const BanknotesIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18v-.008Zm-12 0h.008v.008H6v-.008Z" />
  </svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.602-3.751A11.959 11.959 0 0 1 12 2.714Z" />
  </svg>
);

export const SlidersHorizontalIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a2.25 2.25 0 1 1-4.5 0 .75.75 0 0 0 4.5 0ZM10.5 12h9.75M10.5 12a2.25 2.25 0 1 0-4.5 0 .75.75 0 0 0 4.5 0ZM10.5 18h9.75M10.5 18a2.25 2.25 0 1 0-4.5 0 .75.75 0 0 0 4.5 0Z" />
  </svg>
);

export const TypeIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
  </svg>
);

export const UserPlusIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

export const AlertTriangleIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);

export const ArrowUturnLeftIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
  </svg>
);

export const LockClosedIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const ArrowUpTrayIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const CircleIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const XCircleIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const XIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => ( // Typically used for "Close"
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export const CreditCardIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z" />
  </svg>
);

export const UserCircleIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A1.875 1.875 0 0 1 17.624 22.5H6.375A1.875 1.875 0 0 1 4.5 20.118Z" />
  </svg>
);

export const KeyIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
  </svg>
);

// RecycleBinIcon can be a specific icon or reuse TrashIcon
export const RecycleBinIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.502 0A48.097 48.097 0 0 1 9.25 5.397M4.772 5.79 4.772 5.79m0-3.21a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H5.522a.75.75 0 0 1-.75-.75Z" />
  </svg>
);

export const RestoreIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export const EllipsisVerticalIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const MagnifyingGlassIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

export const Squares2X2Icon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 8.25 20.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
  </svg>
);

export const PinIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
        <path fillRule="evenodd" d="M16.5 3.75a.75.75 0 01.75.75v11.19l3.47 3.47a.75.75 0 01-1.06 1.06l-3.47-3.47H8.28l-3.47 3.47a.75.75 0 01-1.06-1.06l3.47-3.47V4.5a.75.75 0 01.75-.75h9zM15 5.25H9v10.5H5.25a.75.75 0 01-.75-.75V8.06l2.22 2.22a.75.75 0 11-1.06-1.06L3.44 6.94A2.25 2.25 0 015.25 4.5H9V5.25z" clipRule="evenodd" />
    </svg>
);

export const PinSlashIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
        <path fillRule="evenodd" d="M6.337 2.807a.75.75 0 01.268.443V11.25H15V5.25l-2.22 2.22a.75.75 0 00-1.06-1.06L14.03 3.94A2.25 2.25 0 0012.22 3H8.25a.75.75 0 00-.75.75v11.19l3.47 3.47a.75.75 0 001.06 1.06l-3.47-3.47H17.28l3.47 3.47a.75.75 0 001.06-1.06l-3.47-3.47V4.5a.75.75 0 00-.75-.75h-9a.75.75 0 00-.542.221L4.72 5.03l-2.5-2.5a.75.75 0 00-1.06 1.06l20.25 20.25a.75.75 0 001.06-1.06L6.337 2.807z" clipRule="evenodd" />
    </svg>
);

export const ArrowsPointingOutIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9M20.25 20.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
);

export const ArrowsPointingInIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
    </svg>
);


export const SparklesIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

export const ViewColumnsIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125a1.125 1.125 0 0 0-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
);

// ListChecksIcon for To-do
export const ListChecksIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125v-9.75c0-.621-.504-1.125-1.125-1.125h-7.5c-.621 0-1.125.504-1.125 1.125v9.75c0 .621.504 1.125 1.125 1.125zm17.25 0a1.125 1.125 0 00-1.125-1.125m1.125 1.125v-1.5c0-.621-.504-1.125-1.125-1.125H13.5m8.125-3.75V6.375c0-.621-.504-1.125-1.125-1.125H13.5m8.125 8.25c0 .621-.504 1.125-1.125 1.125H13.5m0-12.75h7.5c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504-1.125-1.125-1.125h-7.5c-.621 0-1.125-.504-1.125-1.125V6.375c0-.621.504-1.125 1.125 1.125z" />
  </svg>
);

export const ClipboardDocumentCheckIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-1.125 0-2.25.9-2.25 2.25v15c0 1.35.9 2.25 2.25 2.25h10.5c1.35 0 2.25-.9 2.25-2.25v-15c0-1.35-.9-2.25-2.25-2.25h-4.5m-3.375 4.5c.398-1.365 1.6-2.25 3-2.25s2.602.885 3 2.25m-3 3.75v.75m3-.75v.75m-3.375 4.5h3.375m-3.375 3.375h3.375m-3.375 3.375h3.375" />
    </svg>
);

export const DevicePhoneMobileIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
);
export const MobileIcon: React.FC<IconProps> = DevicePhoneMobileIcon;

export const UpiIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.375c0-1.556 1.35-2.813 3-2.813.988 0 1.864.504 2.413 1.25M8.25 7.5h7.5m-7.5 0-.175.438c-.146.362-.293.723-.454 1.082a5.25 5.25 0 00-1.28 4.144c.233 1.523.99 2.871 2.016 3.918.44.47 1.013.856 1.63 1.137a5.25 5.25 0 005.152 0c.617-.28 1.19-.667 1.63-1.137 1.026-1.047 1.783-2.395 2.016-3.918a5.25 5.25 0 00-1.28-4.144c-.16-.36-.308-.72-.454-1.082L15.75 7.5m-7.5 0h7.5" />
    </svg>
);

export const FolderPlusIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
);

export const PhotoIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);

export const SwitchHorizontalIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h18m-7.5-14L21 7.5m0 0L16.5 12M21 7.5H3" />
  </svg>
);


// === NEW CATEGORY ICONS ===
export const FoodIcon: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);
export const TransportationIcon: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 0 1 3.375-3.375h9.75a3.375 3.375 0 0 1 3.375 3.375v1.875m-17.25 4.5L5.625 9m12.75 0L18.375 18.75m0 0H5.625m12.75 0h.008v.008h-.008v-.008Z" />
    </svg>
);
export const UtilitiesIcon: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
);
export const EntertainmentIcon: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3m-3 0h.008v.008H7.5V16.5Zm.008-.75H7.5v.008h.008V15.75Zm-3 0h.008v.008H4.5V15.75Zm0 0h.008v.008H4.5V15.75Zm0 0h.008v.008H4.5V15.75Zm0 0h.008v.008H4.5V15.75Zm3 .75h.008v.008H7.5V16.5Zm3 0h.008v.008h-.008V16.5Zm0 0h.008v.008h-.008V16.5Zm-3 0h.008v.008H7.5V16.5Zm3 0h.008v.008h-.008V16.5Zm9-3.75h.008v.008h-.008V12.75Zm-3 0h.008v.008h-.008V12.75Zm0 0h.008v.008h-.008V12.75Zm-3 0h.008v.008h-.008V12.75Zm3 0h.008v.008h-.008V12.75Zm-6 0h.008v.008H7.5V12.75Zm3 0h.008v.008h-.008V12.75Zm-6 0h.008v.008H4.5V12.75Zm3 0h.008v.008h-.008V12.75Z" />
    </svg>
);
export const HealthcareIcon: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
);
export const HousingIcon: React.FC<IconProps> = HomeIcon; // Reuse
export const EducationIcon: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12v7a2 2 0 002 2h18a2 2 0 002-2v-7" />
    </svg>
);
export const SavingsIcon: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
    </svg>
);
export const PersonalCareIcon: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.82m5.84-2.56a17.96 17.96 0 0 0-5.84-2.56m0 0A17.96 17.96 0 0 1 9.75 2.25M12 12.75a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
    </svg>
);
export const GiftsIcon: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l-1.625-1.625a2.25 2.25 0 0 0-3.182 0l-1.625 1.625a2.25 2.25 0 0 0 0 3.182l1.625 1.625a2.25 2.25 0 0 0 3.182 0l1.625-1.625a2.25 2.25 0 0 0 0-3.182Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75h6m-3-3v3m-6.75 3H3.75a2.25 2.25 0 0 0-2.25 2.25v6a2.25 2.25 0 0 0 2.25 2.25h16.5a2.25 2.25 0 0 0 2.25-2.25v-6a2.25 2.25 0 0 0-2.25-2.25H16.5" />
    </svg>
);
export const TagIcon: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
);
export const FreelanceIcon: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.098a2.25 2.25 0 0 1-2.25 2.25h-13.5a2.25 2.25 0 0 1-2.25-2.25V14.15M16.5 6.75h-9v4.5h9v-4.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h9v4.5h-9v-4.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75L9 3.75l3 3L15 3.75l2.25 3" />
    </svg>
);
export const BonusIcon: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
);

export const ShareIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
  </svg>
);

export type ZodiacSign = 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';
export const ZODIAC_SIGNS: ZodiacSign[] = ['Aquarius', 'Aries', 'Cancer', 'Capricorn', 'Gemini', 'Leo', 'Libra', 'Pisces', 'Sagittarius', 'Scorpio', 'Taurus', 'Virgo'];

export const AriesIcon: React.FC<IconProps> = ({ className = "w-10 h-10", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}><path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 016-6v12m6-6a6 6 0 00-6-6" /></svg>
);
export const TaurusIcon: React.FC<IconProps> = ({ className = "w-10 h-10", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15a6 6 0 100-12 6 6 0 000 12zm0-12V3m-4.243 4.243L6 6m8.486 1.243L18 6" /></svg>
);
export const GeminiIcon: React.FC<IconProps> = ({ className = "w-10 h-10", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}><path strokeLinecap="round" strokeLinejoin="round" d="M6 3v18m12-18v18M6 7.5h12M6 16.5h12" /></svg>
);
export const CancerIcon: React.FC<IconProps> = ({ className = "w-10 h-10", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}><path strokeLinecap="round" strokeLinejoin="round" d="M6.343 6.343a8 8 0 0111.314 0m-11.314 11.314a8 8 0 010-11.314m0 11.314L3 21m3.343-3.343a8 8 0 0011.314 0m0-11.314L21 3" /></svg>
);
export const LeoIcon: React.FC<IconProps> = ({ className = "w-10 h-10", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}><path strokeLinecap="round" strokeLinejoin="round" d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 0v9m-4.5-4.5h9" /></svg>
);
export const VirgoIcon: React.FC<IconProps> = ({ className = "w-10 h-10", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}><path strokeLinecap="round" strokeLinejoin="round" d="M4 3v18m4-18v18m4-18v18m4-12l-4 4-4-4" /></svg>
);
export const LibraIcon: React.FC<IconProps> = ({ className = "w-10 h-10", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}><path strokeLinecap="round" strokeLinejoin="round" d="M6 9h12M6 15h12M9 3l-3 6h12l-3-6" /></svg>
);
export const ScorpioIcon: React.FC<IconProps> = ({ className = "w-10 h-10", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}><path strokeLinecap="round" strokeLinejoin="round" d="M4 3v18m4-18v18m8-13.5l-4 4-4-4m8 9l-4 4-4-4" /></svg>
);
export const SagittariusIcon: React.FC<IconProps> = ({ className = "w-10 h-10", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H9m10.5 0V15" /></svg>
);
export const CapricornIcon: React.FC<IconProps> = ({ className = "w-10 h-10", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}><path strokeLinecap="round" strokeLinejoin="round" d="M6 3v12l6 6 6-6V3m-8.25 4.5h-3.75" /></svg>
);
export const AquariusIcon: React.FC<IconProps> = ({ className = "w-10 h-10", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8l4-4 4 4m-8 6l4-4 4 4M12 8l4-4 4 4m-8 6l4-4 4 4" /></svg>
);
export const PiscesIcon: React.FC<IconProps> = ({ className = "w-10 h-10", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}><path strokeLinecap="round" strokeLinejoin="round" d="M7 6c-3 3-3 9 0 12m10-12c3 3 3 9 0 12M7 12h10" /></svg>
);

export const getZodiacIcon = (sign: ZodiacSign): React.FC<IconProps> => {
    switch(sign) {
        case 'Aries': return AriesIcon;
        case 'Taurus': return TaurusIcon;
        case 'Gemini': return GeminiIcon;
        case 'Cancer': return CancerIcon;
        case 'Leo': return LeoIcon;
        case 'Virgo': return VirgoIcon;
        case 'Libra': return LibraIcon;
        case 'Scorpio': return ScorpioIcon;
        case 'Sagittarius': return SagittariusIcon;
        case 'Capricorn': return CapricornIcon;
        case 'Aquarius': return AquariusIcon;
        case 'Pisces': return PiscesIcon;
        default: return SparklesIcon;
    }
};

export const getCategoryIcon = (categoryName?: string): React.FC<IconProps> => {
  if (!categoryName) return TagIcon;

  switch (categoryName) {
    // Expense Categories
    case ExpenseCategory.FOOD: return FoodIcon;
    case ExpenseCategory.TRANSPORT: return TransportationIcon;
    case ExpenseCategory.UTILITIES: return UtilitiesIcon;
    case ExpenseCategory.ENTERTAINMENT: return EntertainmentIcon;
    case ExpenseCategory.HEALTHCARE: return HealthcareIcon;
    case ExpenseCategory.HOUSING: return HousingIcon;
    case ExpenseCategory.EDUCATION: return EducationIcon;
    case ExpenseCategory.SAVINGS: return SavingsIcon;
    case ExpenseCategory.PERSONAL_CARE: return PersonalCareIcon;
    case ExpenseCategory.GIFTS_DONATIONS: return GiftsIcon;
    case ExpenseCategory.MOBILE: return MobileIcon;
    case ExpenseCategory.ACCOUNT_TRANSFER: return SwitchHorizontalIcon;
    case ExpenseCategory.EMI: return CalculatorIcon;
    
    // Income Categories
    case IncomeCategory.SALARY: return BanknotesIcon;
    case IncomeCategory.BONUS: return BonusIcon;
    case IncomeCategory.FREELANCE: return FreelanceIcon;
    case IncomeCategory.INVESTMENTS: return ChartIcon;
    case IncomeCategory.GIFTS_RECEIVED: return GiftsIcon;
    
    // Default/Other
    case ExpenseCategory.OTHER:
    case IncomeCategory.OTHER:
    default:
      return TagIcon;
  }
};

export const TrendingUpIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28L18.75 3.75M2.25 18h19.5" />
  </svg>
);

export const PieChartIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 3.276A8.992 8.992 0 003.276 10.5H10.5V3.276z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9c0-4.97 4.03-9 9-9s9 4.03 9 9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
  </svg>
);

export const HandThumbUpIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
  </svg>
);

export const TrophyIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

export const ShoppingBagIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
