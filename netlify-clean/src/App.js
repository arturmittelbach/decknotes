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
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverCard, setDragOverCard] = useState(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
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
    // Don't open modal if currently dragging
    if (draggedCard) return;
    
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
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Handle clicking outside modals to close them
  const handleModalBackdropClick = (e, modalType) => {
    if (e.target === e.currentTarget) {
      switch (modalType) {
        case 'create':
          setShowCreateModal(false);
          resetForm();
          setEditingCard(null);
          break;
        case 'card':
          setShowCardModal(false);
          setDeleteConfirmId(null);
          break;
        case 'about':
          setShowAboutModal(false);
          break;
        default:
          break;
      }
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.dataTransfer.setDragImage(e.target, 0, 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, card) => {
    e.preventDefault();
    setDragOverCard(card);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverCard(null);
  };

  const handleDrop = (e, targetCard) => {
    e.preventDefault();
    
    if (!draggedCard || draggedCard.id === targetCard.id) {
      setDraggedCard(null);
      setDragOverCard(null);
      return;
    }

    const currentCards = [...cards];
    const draggedIndex = currentCards.findIndex(card => card.id === draggedCard.id);
    const targetIndex = currentCards.findIndex(card => card.id === targetCard.id);

    // Remove dragged card from its current position
    const [removed] = currentCards.splice(draggedIndex, 1);
    
    // Insert dragged card at target position
    currentCards.splice(targetIndex, 0, removed);

    setCards(currentCards);
    setDraggedCard(null);
    setDragOverCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverCard(null);
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

  const generateSampleCards = () => {
    const sampleCards = [
      {
        id: Date.now() + 1,
        title: "Fireball",
        summary: "8d6 fire damage, 20ft radius",
        description: "A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.",
        color: "red",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 2,
        title: "Great Weapon Master",
        summary: "-5 attack, +10 damage",
        description: "Before you make a melee attack with a heavy weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attack's damage.",
        color: "purple",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 3,
        title: "Poisoned",
        summary: "Disadvantage on attacks and ability checks",
        description: "A poisoned creature has disadvantage on attack rolls and ability checks.",
        color: "green",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 4,
        title: "Healing Potion",
        summary: "Regain 2d4+2 hit points",
        description: "You regain 2d4 + 2 hit points when you drink this potion. The potion's red liquid glimmers when agitated.",
        color: "red",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 5,
        title: "Shield Spell",
        summary: "+5 AC until start of next turn",
        description: "An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.",
        color: "blue",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 6,
        title: "Sneak Attack",
        summary: "Extra damage with advantage",
        description: "Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll. The attack must use a finesse or a ranged weapon.",
        color: "gray",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 7,
        title: "Stunned",
        summary: "Incapacitated, can't move, auto-fail Str/Dex saves",
        description: "A stunned creature is incapacitated, can't move, and can speak only falteringly. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage.",
        color: "yellow",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 8,
        title: "Hempen Rope",
        summary: "50 feet, 2 hit points",
        description: "Rope, whether made of hemp or silk, has 2 hit points and can be burst with a DC 17 Strength check. This rope is 50 feet long.",
        color: "gray",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 9,
        title: "Action Surge",
        summary: "Take one additional action",
        description: "On your turn, you can take one additional action. Once you use this feature, you must finish a short or long rest before you can use it again.",
        color: "blue",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 10,
        title: "Charmed",
        summary: "Can't attack charmer, advantage on social checks",
        description: "A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects. The charmer has advantage on any ability check to interact socially with the creature.",
        color: "pink",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 11,
        title: "Counterspell",
        summary: "Stop a spell being cast",
        description: "You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, its spell fails and has no effect. If it is casting a spell of 4th level or higher, make an ability check using your spellcasting ability.",
        color: "purple",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 12,
        title: "Sharpshooter",
        summary: "Ignore cover, -5 attack +10 damage",
        description: "You can use a bonus action to mark a target. Attacking at long range doesn't impose disadvantage. Your ranged weapon attacks ignore half and three-quarters cover. Before you make an attack with a ranged weapon, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attack's damage.",
        color: "green",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 13,
        title: "Exhaustion",
        summary: "6 levels of increasing penalties",
        description: "Some special abilities and environmental hazards, such as starvation and the long-term effects of freezing or scorching temperatures, can lead to a special condition called exhaustion. Level 1: Disadvantage on ability checks. Level 6: Death.",
        color: "red",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 14,
        title: "Thieves' Tools",
        summary: "Pick locks, disarm traps",
        description: "This set of tools includes a small file, a set of lock picks, a small mirror mounted on a metal handle, a set of narrow-bladed scissors, and a pair of pliers. Proficiency with these tools lets you add your proficiency bonus to any ability checks you make to disarm traps or open locks.",
        color: "gray",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 15,
        title: "Inspiration",
        summary: "Reroll one d20",
        description: "If you have inspiration, you can expend it when you make an attack roll, saving throw, or ability check. Spending your inspiration gives you advantage on that roll.",
        color: "yellow",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 16,
        title: "Invisible",
        summary: "Can't be seen, advantage on attacks",
        description: "An invisible creature is impossible to see without the aid of magic or a special sense. For the purpose of hiding, the creature is heavily obscured. The creature's location can be detected by any noise it makes or any tracks it leaves. Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage.",
        color: "indigo",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 17,
        title: "Healing Word",
        summary: "Bonus action ranged heal",
        description: "A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs.",
        color: "pink",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 18,
        title: "Immovable Rod",
        summary: "Becomes fixed in place",
        description: "This flat iron rod has a button on one end. You can use an action to press the button, which causes the rod to become magically fixed in place. Until you or another creature uses an action to push the button again, the rod doesn't move, even if it is defying gravity.",
        color: "blue",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 19,
        title: "Opportunity Attack",
        summary: "Attack when enemy leaves reach",
        description: "You can make an opportunity attack when a hostile creature that you can see moves out of your reach. To make the opportunity attack, you use your reaction to make one melee attack against the provoking creature.",
        color: "red",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 20,
        title: "Bardic Inspiration",
        summary: "Give ally extra d6 to roll",
        description: "You can inspire others through stirring words or music. To do so, you use a bonus action on your turn to choose one creature other than yourself within 60 feet of you who can hear you. That creature gains one Bardic Inspiration die, a d6.",
        color: "purple",
        createdAt: new Date().toISOString()
      }
    ];

    // Remove any existing cards with same IDs and add new sample cards
    const existingIds = new Set(cards.map(card => card.id));
    const newCards = sampleCards.filter(card => !existingIds.has(card.id));
    setCards([...cards, ...newCards]);
    setShowAboutModal(false);
    alert(`Added ${newCards.length} sample D&D cards to test the app!`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-1 px-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">DeckNotes</h1>
            <p className="text-xs text-gray-400">Get your game on deck!</p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowAboutModal(true)}
              className="bg-gray-700 hover:bg-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
              title="About & Feedback"
            >
              i
            </button>
            <button
              onClick={handleCreateCard}
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-sm font-medium transition-colors"
            >
              +Card
            </button>
            <button
              onClick={exportCards}
              className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-sm font-medium transition-colors"
              title="Export cards"
            >
              ⬆
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-sm font-medium transition-colors"
              title="Import cards"
            >
              ⬇
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
            <div className="grid gap-2" style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              maxWidth: '100%'
            }}>
              {cards.map((card) => (
                <div
                  key={card.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, card)}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, card)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, card)}
                  onDragEnd={handleDragEnd}
                  className={`${getColorClass(card.color)} rounded-lg p-3 cursor-pointer hover:opacity-90 transition-all h-28 flex flex-col min-w-[180px]
                    ${draggedCard?.id === card.id ? 'opacity-50 transform rotate-3' : ''}
                    ${dragOverCard?.id === card.id ? 'ring-2 ring-white ring-opacity-50 transform scale-105' : ''}
                    ${draggedCard ? 'cursor-grabbing' : 'cursor-grab'}
                  `}
                  onClick={(e) => handleCardClick(card, e)}
                >
                  <h3 className="font-bold text-xl mb-1 text-white truncate">{card.title}</h3>
                  <p className="text-base text-gray-100 flex-1 overflow-hidden leading-tight">{card.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Card Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => handleModalBackdropClick(e, 'create')}
        >
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => handleModalBackdropClick(e, 'card')}
        >
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

      {/* About Modal */}
      {showAboutModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => handleModalBackdropClick(e, 'about')}
        >
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">About DeckNotes</h2>
              <button
                onClick={() => setShowAboutModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  DeckNotes is a simple tool to help RPG players remember abilities, conditions, feats, special effects during play. Think of it as a digital post-it wall for your character — visual, organized, and always within reach.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  It's perfect for side monitors, online games, or quick referencing at the table.
                  Built as a passion project, its goal is to make play smoother by cutting down on forgotten details and rulebook dives.
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-blue-400">Try it out!</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Want to see DeckNotes in action? Generate 20 sample D&D cards including popular spells, feats, conditions, and items to test all the features.
                </p>
                <button
                  onClick={generateSampleCards}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  🎲 Generate 20 D&D Sample Cards
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-blue-400">Custom Cards</h4>
                    <p className="text-gray-300 text-sm">Add a title, short summary, full description, and color tag to each card.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-400">Quick Add & Edit</h4>
                    <p className="text-gray-300 text-sm">Create or update cards easily using a clean popup form.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-400">Expand & Copy</h4>
                    <p className="text-gray-300 text-sm">Click any card to view full details and copy the text with one tap.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-400">Responsive Grid + Drag & Organize</h4>
                    <p className="text-gray-300 text-sm">Cards auto-adjust to screen size and can be rearranged via drag-and-drop.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-400">Import / Export</h4>
                    <p className="text-gray-300 text-sm">Save your deck as a .json file and reload it anytime.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-lg font-semibold mb-3">Feedback</h3>
                <p className="text-gray-300 mb-4">
                  If you've got feedback or ideas, we'd love to hear from you.
                </p>
                <a
                  href="https://forms.gle/2pn6kgTh4FDHhpwQ9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Send Feedback
                </a>
              </div>

              <div className="text-center text-gray-400 text-sm">
                Thanks for using DeckNotes<br />
                — Artur —
              </div>
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