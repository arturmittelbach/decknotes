import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const DeckNotes = () => {
  const [cards, setCards] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [cardModalPosition, setCardModalPosition] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    color: 'blue'
  });

  const colorOptions = [
    { value: 'red', class: 'bg-red-600', label: 'Red' },
    { value: 'blue', class: 'bg-blue-600', label: 'Blue' },
    { value: 'green', class: 'bg-green-600', label: 'Green' },
    { value: 'yellow', class: 'bg-yellow-600', label: 'Yellow' },
    { value: 'purple', class: 'bg-purple-600', label: 'Purple' },
    { value: 'pink', class: 'bg-pink-600', label: 'Pink' },
    { value: 'indigo', class: 'bg-indigo-600', label: 'Indigo' },
    { value: 'gray', class: 'bg-gray-600', label: 'Gray' }
  ];

  // Default example cards for better UX
  const getDefaultCards = () => [
    {
      id: 1,
      title: "Rage",
      summary: "Advantage on Str checks, +2 damage",
      description: "You have advantage on Strength checks and Strength saving throws. When you make a melee weapon attack using Strength, you gain a +2 bonus to the damage roll. You have resistance to bludgeoning, piercing, and slashing damage.",
      color: "red",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "Flurry of Blows",
      summary: "2 unarmed strikes as bonus action",
      description: "Immediately after you take the Attack action on your turn, you can spend 1 ki point to make two unarmed strikes as a bonus action.",
      color: "purple",
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      title: "Lucky",
      summary: "Reroll dice 3 times per day",
      description: "You have 3 luck points. Whenever you make an attack roll, an ability check, or a saving throw, you can spend one luck point to roll an additional d20. You can choose to spend one of your luck points after you roll the die, but before the outcome is determined.",
      color: "green",
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      title: "Grappled",
      summary: "Speed = 0, cannot move",
      description: "A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed. The condition ends if the grappler is incapacitated or if an effect removes the grappled creature from the reach of the grappler or grappling effect.",
      color: "yellow",
      createdAt: new Date().toISOString()
    }
  ];

  // Load cards from localStorage on component mount
  useEffect(() => {
    const savedCards = localStorage.getItem('deckNotes_cards');
    if (savedCards) {
      try {
        const parsedCards = JSON.parse(savedCards);
        if (parsedCards.length > 0) {
          setCards(parsedCards);
        } else {
          // If localStorage exists but is empty, load default cards
          setCards(getDefaultCards());
        }
      } catch (error) {
        console.error('Error loading cards from localStorage:', error);
        setCards(getDefaultCards());
      }
    } else {
      // First time users get default cards
      setCards(getDefaultCards());
    }
  }, []);

  // Save cards to localStorage whenever cards change
  useEffect(() => {
    localStorage.setItem('deckNotes_cards', JSON.stringify(cards));
  }, [cards]);

  const getColorClass = (color) => {
    const colorMap = {
      red: 'bg-red-600',
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      yellow: 'bg-yellow-600',
      purple: 'bg-purple-600',
      pink: 'bg-pink-600',
      indigo: 'bg-indigo-600',
      gray: 'bg-gray-600'
    };
    return colorMap[color] || 'bg-blue-600';
  };

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      description: '',
      color: 'blue'
    });
  };

  const handleCreateCard = () => {
    setEditingCard(null);
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      summary: card.summary,
      description: card.description,
      color: card.color
    });
    // Close the detail modal when opening edit modal
    setShowCardModal(false);
    setDeleteConfirmId(null);
    setShowCreateModal(true);
  };

  const handleSubmitCard = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.summary.trim() || !formData.description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const cardData = {
      id: editingCard ? editingCard.id : Date.now(),
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      description: formData.description.trim(),
      color: formData.color,
      createdAt: editingCard ? editingCard.createdAt : new Date().toISOString()
    };

    if (editingCard) {
      setCards(cards.map(card => card.id === editingCard.id ? cardData : card));
    } else {
      setCards([...cards, cardData]);
    }

    setShowCreateModal(false);
    resetForm();
    setEditingCard(null);
  };

  const handleCardClick = (card, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCardModalPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    setSelectedCard(card);
    setShowCardModal(true);
  };

  const handleDeleteCard = (cardId) => {
    if (deleteConfirmId === cardId) {
      setCards(cards.filter(card => card.id !== cardId));
      setDeleteConfirmId(null);
      setShowCardModal(false);
    } else {
      setDeleteConfirmId(cardId);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const exportCards = () => {
    const dataStr = JSON.stringify(cards, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deck-notes.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importCards = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedCards = JSON.parse(e.target.result);
        if (Array.isArray(importedCards)) {
          // Merge with existing cards, avoiding duplicates by id
          const existingIds = new Set(cards.map(card => card.id));
          const newCards = importedCards.filter(card => !existingIds.has(card.id));
          setCards([...cards, ...newCards]);
          alert(`Imported ${newCards.length} new cards`);
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        console.error('Error importing cards:', error);
        alert('Error importing cards');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">DeckNotes</h1>
          <div className="flex gap-3">
            <button
              onClick={handleCreateCard}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Card
            </button>
            <button
              onClick={exportCards}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.txt"
              onChange={importCards}
              className="hidden"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {cards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No cards yet. Create your first card to get started!</p>
              <button
                onClick={handleCreateCard}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create First Card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`${getColorClass(card.color)} rounded-lg p-4 cursor-pointer hover:opacity-90 transition-opacity h-32 flex flex-col`}
                  onClick={(e) => handleCardClick(card, e)}
                >
                  <h3 className="font-bold text-lg mb-2 text-white truncate">{card.title}</h3>
                  <p className="text-sm text-gray-100 flex-1 overflow-hidden">{card.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Card Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCard ? 'Edit Card' : 'Create New Card'}
            </h2>
            <form onSubmit={handleSubmitCard}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Grappled"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Short Summary *</label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Speed = 0"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Full Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 h-24 resize-none"
                  placeholder="Detailed rule text..."
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Color Tag</label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({...formData, color: color.value})}
                      className={`${color.class} p-2 rounded text-white text-xs font-medium ${
                        formData.color === color.value ? 'ring-2 ring-white' : ''
                      }`}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded font-medium transition-colors"
                >
                  {editingCard ? 'Update Card' : 'Create Card'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                    setEditingCard(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card Detail Modal */}
      {showCardModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <div className={`${getColorClass(selectedCard.color)} rounded-lg p-4 mb-4`}>
              <h2 className="text-xl font-bold text-white">{selectedCard.title}</h2>
              <p className="text-gray-100 mt-1">{selectedCard.summary}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Description:</h3>
              <p className="text-gray-300 leading-relaxed">{selectedCard.description}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => copyToClipboard(selectedCard.description)}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium transition-colors"
              >
                Copy Text
              </button>
              <button
                onClick={() => handleEditCard(selectedCard)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteCard(selectedCard.id)}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  deleteConfirmId === selectedCard.id
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {deleteConfirmId === selectedCard.id ? 'Confirm Delete' : 'Delete'}
              </button>
              <button
                onClick={() => {
                  setShowCardModal(false);
                  setDeleteConfirmId(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return <DeckNotes />;
}

export default App;