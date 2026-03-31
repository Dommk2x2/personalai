import React, { useState, useEffect } from 'react';

const CARD_CONFIGS = {
  Aadhar: { regex: /^\d{4} \d{4} \d{4}$/, maxLength: 14, placeholder: '1234 5678 9012' },
  PAN: { regex: /^[A-Z]{5}\d{4}[A-Z]{1}$/, maxLength: 10, placeholder: 'ABCDE1234F' },
  'Driving License': { regex: /^[A-Z]{2}-\d{2}-[A-Z0-9]{4}-\d{7}$/, maxLength: 15, placeholder: 'TN-60-XXXX-XXXXXXX' },
  'Voter ID': { regex: /^[A-Z]{3}\d{7}$/, maxLength: 10, placeholder: 'ABC1234567' },
};

export const IdentityCardForm = () => {
  const [cardType, setCardType] = useState<keyof typeof CARD_CONFIGS>('Aadhar');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const validateCard = (type: keyof typeof CARD_CONFIGS, val: string) => {
    const config = CARD_CONFIGS[type];
    if (!config.regex.test(val)) return `Invalid ${type} format.`;
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    const config = CARD_CONFIGS[cardType];

    if (cardType === 'Aadhar') {
      val = val.replace(/\D/g, '');
      if (val.length > 12) val = val.slice(0, 12);
      val = val.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3').trim();
    } else {
      if (val.length > config.maxLength) val = val.slice(0, config.maxLength);
    }

    setValue(val);
    const validationError = validateCard(cardType, val);
    setError(validationError);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    } else {
      alert('Form Submitted Successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <select value={cardType} onChange={(e) => { setCardType(e.target.value as any); setValue(''); setError(''); }} className="w-full p-2 border rounded">
        {Object.keys(CARD_CONFIGS).map(type => <option key={type} value={type}>{type}</option>)}
      </select>
      
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={CARD_CONFIGS[cardType].placeholder}
        className={`w-full p-2 border rounded ${error ? 'border-red-500 animate-shake' : ''}`}
      />
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Submit</button>
    </form>
  );
};
