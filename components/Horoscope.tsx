
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useTheme } from '../contexts/ThemeContext';
import { SparklesIcon, ChevronDownIcon } from './Icons';
import { ZODIAC_SIGNS, ZodiacSign, getZodiacIcon } from './Icons';

const Horoscope: React.FC = () => {
    const { currentThemeColors, theme } = useTheme();
    const [selectedSign, setSelectedSign] = useState<ZodiacSign>('Leo');
    const [horoscope, setHoroscope] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const ZodiacIcon = getZodiacIcon(selectedSign);

    const fetchHoroscope = async () => {
        setIsLoading(true);
        setError('');
        setHoroscope('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Provide a short, optimistic financial horoscope for a ${selectedSign} for today. Focus on topics like potential opportunities, wise spending, and career growth. Keep it under 100 words and present it as a single paragraph.`;
            
            const response = await ai.models.generateContent({
                // FIX: Updated model name to 'gemini-3-flash-preview' for a basic text task per guidelines.
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setHoroscope(response.text);
        } catch (err) {
            console.error("Error fetching horoscope:", err);
            setError("Sorry, couldn't fetch the stars' wisdom right now. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const selectClasses = "w-full sm:w-auto mt-1 block pl-3 pr-10 py-2 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed appearance-none";
    const buttonClasses = "w-full sm:w-auto flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-md text-text-inverted bg-brand-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary dark:focus:ring-offset-bg-secondary-themed transition-all duration-200 ease-in-out disabled:opacity-50";

    return (
        <div className="p-4 sm:p-6 rounded-xl shadow-lg" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
            <h2 className="text-xl sm:text-2xl font-semibold text-text-base-themed mb-4 text-center flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-brand-primary" />
                Daily Financial Horoscope
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <div className="relative">
                    <label htmlFor="zodiac-select" className="sr-only">Select your Zodiac sign</label>
                    <select
                        id="zodiac-select"
                        value={selectedSign}
                        onChange={(e) => setSelectedSign(e.target.value as ZodiacSign)}
                        className={selectClasses}
                    >
                        {ZODIAC_SIGNS.map(sign => <option key={sign} value={sign}>{sign}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted-themed">
                        <ChevronDownIcon className="w-5 h-5" />
                    </div>
                </div>
                <button onClick={fetchHoroscope} disabled={isLoading} className={buttonClasses}>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Get Today's Forecast
                </button>
            </div>
            
            <div className="flex flex-col items-center gap-4">
                <div 
                    className="w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out" 
                    style={{ 
                        background: theme.mode === 'dark' 
                            ? 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 70%)' 
                            : 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 80%)',
                        border: `1px solid ${currentThemeColors.borderPrimary}`
                    }}
                >
                    <ZodiacIcon className="w-24 h-24" />
                </div>

                <div className="w-full max-w-lg min-h-[150px] p-4 rounded-lg text-center flex items-center justify-center" style={{backgroundColor: currentThemeColors.bgPrimary}}>
                    {isLoading && (
                        <div className="flex flex-col items-center">
                            <div className="spinner-horoscope"></div>
                            <p className="text-text-muted-themed mt-2 text-sm">Consulting the cosmos...</p>
                        </div>
                    )}
                    {error && <p className="text-expense text-sm">{error}</p>}
                    {horoscope && !isLoading && (
                        <p className="text-text-base-themed text-sm sm:text-base leading-relaxed animate-fade-in">{horoscope}</p>
                    )}
                    {!isLoading && !error && !horoscope && (
                        <p className="text-text-muted-themed text-sm">Select your sign and get your financial forecast.</p>
                    )}
                </div>
            </div>
            <style>{`
                .spinner-horoscope {
                    width: 40px;
                    height: 40px;
                    border: 4px solid ${currentThemeColors.bgAccent};
                    border-top: 4px solid ${currentThemeColors.brandSecondary};
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Horoscope;
