import React from 'react';
import { FestiveDate } from '../types';

// Diwali dates (Month is 0-indexed)
// This simple check works for the next few years without needing a complex library.
const diwaliDates: { month: number, day: number }[] = [
    { month: 10, day: 12 }, // Nov 12, 2023
    { month: 10, day: 1 },  // Nov 1, 2024
    { month: 9, day: 21 },  // Oct 21, 2025
    { month: 10, day: 8 },  // Nov 8, 2026
];

const isDiwaliToday = (): boolean => {
    const today = new Date();
    // For testing, you can uncomment the line below to always show the animation:
    // return true; 
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    // This check is year-agnostic for simplicity, relying on the hardcoded dates above.
    return diwaliDates.some(diwali => 
        diwali.month === currentMonth &&
        diwali.day === currentDay
    );
};

interface FestiveHeaderAnimationProps {
    festiveDates: FestiveDate[];
}

const FestiveHeaderAnimation: React.FC<FestiveHeaderAnimationProps> = ({ festiveDates }) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let celebrationName: string | null = null;
    
    // Check user-defined dates first, so they take priority
    const userCelebration = (festiveDates || []).find(d => d.date === todayStr);

    if (userCelebration) {
        celebrationName = userCelebration.name;
    } else if (isDiwaliToday()) {
        celebrationName = "Happy Diwali!";
    }

    if (!celebrationName) {
        return null;
    }
    
    // Create multiple firework elements for a better effect
    const fireworks = Array.from({ length: 15 }).map((_, i) => {
        const style = {
            top: `${Math.random() * 90 + 5}%`,
            left: `${Math.random() * 90 + 5}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random()}s` // Vary the speed of the explosion
        };
        return <div key={i} className="firework" style={style} />;
    });

    return (
        <div className="festive-overlay" aria-hidden="true">
            {fireworks}
            <h1 className="festive-message">{celebrationName}</h1>
        </div>
    );
};

export default FestiveHeaderAnimation;