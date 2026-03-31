import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ frontContent, backContent, className = '' }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className={`w-[337.5px] h-[212.5px] [perspective:1000px] ${className}`}>
      <motion.div
        className="w-full h-full relative [transform-style:preserve-3d] cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <div className="absolute w-full h-full [backface-visibility:hidden] rounded-2xl p-6 shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 text-white">
          {frontContent}
        </div>
        {/* Back */}
        <div className="absolute w-full h-full [backface-visibility:hidden] rounded-2xl p-6 shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 text-white [transform:rotateY(180deg)]">
          {backContent}
        </div>
      </motion.div>
    </div>
  );
};
