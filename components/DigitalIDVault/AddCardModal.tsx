import React, { useState } from 'react';
import { IDCard } from '../../src/types/idVault';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (card: IDCard) => void;
  editCard?: IDCard | null;
}

const CARD_CONFIGS = {
  'Aadhar': { regex: /^\d{4} \d{4} \d{4}$/, maxLength: 14, placeholder: '1234 5678 9012' },
  'PAN Card': { regex: /^[A-Z]{5}\d{4}[A-Z]{1}$/, maxLength: 10, placeholder: 'ABCDE1234F' },
  'Driving License': { regex: /^[A-Z]{2}-\d{2}-[A-Z0-9]{4}-\d{7}$/, maxLength: 15, placeholder: 'TN-60-XXXX-XXXXXXX' },
  'Other': { regex: /.*/, maxLength: 50, placeholder: 'ID Number' },
};

export const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onAdd, editCard }) => {
  const [cardType, setCardType] = useState<IDCard['cardType']>(editCard?.cardType || 'Aadhar');
  const [holderName, setHolderName] = useState(editCard?.holderName || 'MK Dom');
  const [idNumber, setIdNumber] = useState(editCard?.idNumber || '');
  const [expiryDate, setExpiryDate] = useState(editCard?.expiryDate || '');
  const [themeColor, setThemeColor] = useState(editCard?.themeColor || 'from-blue-500 to-cyan-500');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  React.useEffect(() => {
    if (editCard) {
      setCardType(editCard.cardType);
      setHolderName(editCard.holderName);
      setIdNumber(editCard.idNumber);
      setExpiryDate(editCard.expiryDate);
      setThemeColor(editCard.themeColor);
    } else {
      setCardType('Aadhar');
      setHolderName('MK Dom');
      setIdNumber('');
      setExpiryDate('');
      setThemeColor('from-blue-500 to-cyan-500');
    }
  }, [editCard, isOpen]);

  if (!isOpen) return null;

  const validateIdNumber = (type: IDCard['cardType'], val: string) => {
    const config = CARD_CONFIGS[type];
    if (type === 'Other') return '';
    if (!config.regex.test(val)) return `Invalid ${type} format.`;
    return '';
  };

  const handleIdNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    const config = CARD_CONFIGS[cardType];

    if (cardType === 'Aadhar') {
      val = val.replace(/\D/g, '');
      if (val.length > 12) val = val.slice(0, 12);
      val = val.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3').trim();
    } else {
      if (val.length > config.maxLength) val = val.slice(0, config.maxLength);
    }

    setIdNumber(val);
    setError(validateIdNumber(cardType, val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateIdNumber(cardType, idNumber);
    if (validationError) {
      setError(validationError);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
      return;
    }
    onAdd({
      id: editCard?.id || Date.now().toString(),
      cardType,
      holderName,
      idNumber,
      expiryDate,
      themeColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-96">
        <h2 className="text-xl font-bold mb-4">{editCard ? 'Edit Card' : 'Add New Card'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select value={cardType} onChange={(e) => { setCardType(e.target.value as IDCard['cardType']); setIdNumber(''); setError(''); }} className="w-full p-2 border rounded">
            <option value="Aadhar">Aadhar</option>
            <option value="Driving License">Driving License</option>
            <option value="PAN Card">PAN Card</option>
            <option value="Other">Other</option>
          </select>
          <input type="text" value={holderName} onChange={(e) => setHolderName(e.target.value)} className="w-full p-2 border rounded" placeholder="Holder Name" />
          <input 
            type="text" 
            value={idNumber} 
            onChange={handleIdNumberChange} 
            className={`w-full p-2 border rounded ${error ? 'border-red-500' : ''} ${isShaking ? 'animate-shake' : ''}`} 
            placeholder={CARD_CONFIGS[cardType].placeholder} 
            required 
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full p-2 border rounded" required />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};
