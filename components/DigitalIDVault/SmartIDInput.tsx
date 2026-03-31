import React, { useState, useEffect } from 'react';

interface SmartIDInputProps {
  cardType: 'Aadhar' | 'PAN Card';
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const SmartIDInput: React.FC<SmartIDInputProps> = ({ cardType, value, onChange, onValidationChange }) => {
  const [inputMode, setInputMode] = useState<'text' | 'numeric'>('text');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    let valid = false;
    if (cardType === 'Aadhar') {
      setInputMode('numeric');
      valid = /^\d{4} \d{4} \d{4}$/.test(value);
    } else if (cardType === 'PAN Card') {
      // Dynamic keyboard switching logic
      const len = value.length;
      if (len < 5 || len === 9) {
        setInputMode('text');
      } else {
        setInputMode('numeric');
      }
      valid = /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(value);
    }
    setIsValid(valid);
    onValidationChange(valid);
  }, [cardType, value, onValidationChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    
    if (cardType === 'Aadhar') {
      val = val.replace(/\D/g, '');
      if (val.length > 12) val = val.slice(0, 12);
      // Format: XXXX XXXX XXXX
      val = val.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3').trim();
    } else if (cardType === 'PAN Card') {
      if (val.length > 10) val = val.slice(0, 10);
    }
    
    onChange(val);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={handleInputChange}
        className="w-full p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
        placeholder={cardType === 'Aadhar' ? '1234 5678 9012' : 'ABCDE1234F'}
        pattern={cardType === 'Aadhar' ? "\\d{4} \\d{4} \\d{4}" : "[A-Z]{5}\\d{4}[A-Z]{1}"}
      />
      <div className="absolute right-3 top-3.5">
        {value.length > 0 && (
          isValid ? (
            <span className="text-green-400 font-bold">✓</span>
          ) : (
            <span className="text-red-400 font-bold">!</span>
          )
        )}
      </div>
    </div>
  );
};
