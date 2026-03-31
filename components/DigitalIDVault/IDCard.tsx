import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { IDCard as IDCardType } from '../../src/types/idVault';
import { EditIcon, TrashIcon } from '../Icons';

interface IDCardProps {
  card: IDCardType;
  onEdit: (card: IDCardType) => void;
  onDelete: (id: string) => void;
}

export const IDCard: React.FC<IDCardProps> = ({ card, onEdit, onDelete }) => {
  const [showId, setShowId] = useState(false);

  const front = (
    <div className={`h-full flex flex-col justify-between bg-gradient-to-br ${card.themeColor} bg-opacity-20`}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold">{card.cardType}</h3>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(card); }}
            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
            className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors text-red-200"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm opacity-80">{card.holderName}</p>
      <div className="flex justify-between items-end">
        <p className="text-xl font-mono tracking-widest">
          {showId ? card.idNumber : '**** **** ****'}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); setShowId(!showId); }}
          className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/30 transition-colors"
        >
          {showId ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );

  const back = (
    <div className="h-full flex flex-col justify-center">
      <p className="text-sm opacity-80">Expiry Date</p>
      <p className="text-lg font-bold">{card.expiryDate}</p>
    </div>
  );

  return <GlassCard frontContent={front} backContent={back} className={card.themeColor} />;
};
