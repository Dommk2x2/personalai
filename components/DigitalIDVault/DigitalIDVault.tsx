import React, { useState } from 'react';
import { IDCard as IDCardType } from '../../src/types/idVault';
import { IDCard } from './IDCard';
import { TransactionCard } from './TransactionCard';
import { AddCardModal } from './AddCardModal';
import ConfirmationModal from '../ConfirmationModal';
import { PlusIcon } from '../Icons';

export const DigitalIDVault: React.FC = () => {
  const [cards, setCards] = useState<IDCardType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<IDCardType | null>(null);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  const handleAddOrUpdateCard = (card: IDCardType) => {
    if (cardToEdit) {
      setCards(cards.map(c => c.id === card.id ? card : c));
    } else {
      setCards([...cards, card]);
    }
    setCardToEdit(null);
  };

  const handleDeleteCard = () => {
    if (cardToDelete) {
      setCards(cards.filter(c => c.id !== cardToDelete));
      setCardToDelete(null);
    }
  };

  const openEditModal = (card: IDCardType) => {
    setCardToEdit(card);
    setIsModalOpen(true);
  };

  const sampleTransaction = {
    description: "Food Rice and Chicken",
    amount: 130,
    date: "04/11/2025",
    type: 'Expense' as const,
    category: "Dinner",
    maskedCardNumber: "**** 1234"
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Digital ID Vault</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Securely manage your identity documents</p>
        </div>
        <button 
          onClick={() => { setCardToEdit(null); setIsModalOpen(true); }} 
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
        >
          <PlusIcon className="w-4 h-4" />
          Add ID Card
        </button>
      </div>
      
      <section>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Recent Transaction</h2>
        <div className="flex justify-center sm:justify-start">
          <TransactionCard transaction={sampleTransaction} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Identity Cards</h2>
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No cards added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map(card => (
              <IDCard 
                key={card.id} 
                card={card} 
                onEdit={openEditModal}
                onDelete={(id) => setCardToDelete(id)}
              />
            ))}
          </div>
        )}
      </section>

      <AddCardModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setCardToEdit(null); }} 
        onAdd={handleAddOrUpdateCard} 
        editCard={cardToEdit}
      />

      <ConfirmationModal
        isOpen={!!cardToDelete}
        onClose={() => setCardToDelete(null)}
        onConfirm={handleDeleteCard}
        title="Delete ID Card"
        message="Are you sure you want to delete this ID card? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
