# 🎲 DeckNotes - Deploy Instructions

## 📁 What's included

This package contains all the files needed to deploy **DeckNotes** to Netlify:

```
├── src/
│   ├── App.js          # Main application component
│   ├── index.js        # React entry point
│   ├── App.css         # Custom styles
│   └── index.css       # Tailwind CSS imports
├── public/
│   └── index.html      # HTML template
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind configuration
├── postcss.config.js   # PostCSS configuration
├── netlify.toml        # Netlify build settings
├── .gitignore          # Git ignore file
└── yarn.lock           # Dependency lock file
```

## 🚀 Deploy to Netlify

### Method 1: Manual Upload (Quick)

1. **Extract this folder**
2. **Install dependencies:**
   ```bash
   yarn install
   ```
3. **Build the project:**
   ```bash
   yarn build
   ```
4. **Upload to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag the `build` folder to the deploy area

### Method 2: Git Deploy (Recommended)

1. **Extract and push to GitHub:**
   ```bash
   # Create a new repository on GitHub first
   git init
   git add .
   git commit -m "Initial commit - DeckNotes"
   git remote add origin https://github.com/YOUR_USERNAME/decknotes.git
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - "New site from Git" → Connect GitHub
   - Select your repository
   - **Build settings:**
     - Build command: `yarn build`
     - Publish directory: `build`
   - Deploy!

## ✨ Features

- **🎯 D&D Card Management** - Organize spells, feats, abilities, items
- **🎨 Color Coding** - 8 color categories for easy organization
- **📱 Responsive Design** - Works on all screen sizes
- **🔄 Drag & Drop** - Reorder cards by dragging
- **💾 Local Storage** - Cards persist between sessions
- **📥📤 Import/Export** - Backup and restore your decks
- **🎲 Sample Cards** - 20 D&D cards included for testing
- **📋 Copy to Clipboard** - One-click copy of card descriptions
- **🌙 Dark Theme** - Easy on the eyes for long gaming sessions

## 🎮 Usage

1. **Create Cards**: Click "+Card" to add new abilities, spells, etc.
2. **Organize**: Drag cards to reorder, use colors to categorize
3. **Quick Reference**: Click any card to see full details
4. **Share Decks**: Export/import JSON files to share with friends
5. **Try Sample**: Click "i" → Generate 20 D&D cards to test

## 🛠️ Tech Stack

- **React 19** - Modern React with hooks
- **TailwindCSS** - Utility-first CSS framework
- **HTML5 Drag & Drop API** - Native drag functionality
- **LocalStorage** - Client-side persistence
- **Responsive Design** - Mobile-first approach

## 🎯 Perfect for

- **D&D Players** - Quick reference during gameplay
- **DMs** - Organize monster abilities and effects
- **Online Games** - Second monitor reference tool
- **Table Games** - Phone/tablet quick lookup

---

**Built with ❤️ for the D&D community**

Get your game on deck! 🎲