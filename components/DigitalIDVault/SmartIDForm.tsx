import React, { useState } from 'react';
import { SmartIDInput } from './SmartIDInput';

export const SmartIDForm = () => {
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    amount: '',
    type: 'Aadhar',
    category: '',
    idNumber: ''
  });
  const [isIdValid, setIsIdValid] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl space-y-4">
      <h2 className="text-2xl font-bold text-white mb-4">Add Identity Card</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <input type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} className="p-3 bg-white/10 rounded-xl text-white" />
        <input type="text" placeholder="Category" value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} className="p-3 bg-white/10 rounded-xl text-white" />
      </div>

      <select value={formData.type} onChange={(e) => handleInputChange('type', e.target.value)} className="w-full p-3 bg-white/10 rounded-xl text-white">
        <option value="Aadhar">Aadhar</option>
        <option value="PAN Card">PAN Card</option>
      </select>

      <SmartIDInput 
        cardType={formData.type as 'Aadhar' | 'PAN Card'} 
        value={formData.idNumber} 
        onChange={(val) => handleInputChange('idNumber', val)}
        onValidationChange={setIsIdValid}
      />

      <input type="text" placeholder="Description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} className="w-full p-3 bg-white/10 rounded-xl text-white" />
      <input type="number" placeholder="Amount" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} className="w-full p-3 bg-white/10 rounded-xl text-white" />

      <button 
        disabled={!isIdValid}
        className={`w-full p-4 rounded-xl font-bold ${isIdValid ? 'bg-white text-black' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
      >
        Save Card
      </button>
    </div>
  );
};
