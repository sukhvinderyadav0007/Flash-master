# 🎓 FlashMaster - Advanced Flashcard Application

A **production-level, fully-featured flashcard application** with an elegant UI, comprehensive feature set, and optional backend API. Built with modern web technologies for an exceptional learning experience.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-14%2B-brightgreen.svg)

---

## 🌟 Key Features

### 📚 Core Features
- ✅ **Add/Edit/Delete Flashcards** - Full CRUD operations for card management
- ✅ **3D Flip Animation** - Smooth, immersive card flip effect
- ✅ **Next/Previous Navigation** - Browse through cards with ease
- ✅ **Category System** - Organize cards by topics
- ✅ **Difficulty Levels** - Easy, Medium, Hard classification

### 🎨 UI/UX Features
- ✅ **Glassmorphism Design** - Modern, premium aesthetic
- ✅ **Dark Mode Toggle** - Eye-friendly dark theme
- ✅ **Fully Responsive** - Desktop, tablet, and mobile support
- ✅ **Smooth Animations** - Professional transitions and effects
- ✅ **Gradient Backgrounds** - Visually appealing color schemes

### 🎯 Study Modes
- ✅ **Normal Mode** - Sequential card study
- ✅ **Shuffle Mode** - Randomized card order
- ✅ **Auto-Play Mode** - Automatic card progression with adjustable speed
- ✅ **Quiz Mode** - Multiple choice testing with scoring
- ✅ **Timer System** - Per-question time limits

### 📊 Advanced Features
- ✅ **Score Tracking** - Track quiz performance and accuracy
- ✅ **Progress Bar** - Visual representation of progress
- ✅ **Search & Filter** - Find cards by category or search term
- ✅ **Import/Export** - Backup and restore card data as JSON
- ✅ **Sound Effects** - Audio feedback on card flip
- ✅ **Like System** - Mark favorite cards
- ✅ **Statistics Dashboard** - Cards by category and difficulty

### 💾 Storage Options
- ✅ **LocalStorage** - Frontend-only data persistence
- ✅ **Express Backend API** - Backend data management (optional)

---

## 📋 Project Structure

```
flashcard-app/
├── frontend/
│   ├── index.html        # Main HTML with all sections
│   ├── style.css         # Advanced CSS with dark mode
│   ├── script.js         # Complete application logic (1000+ lines)
│   └── assets/           # Images, icons (if added)
│
├── backend/
│   ├── server.js         # Express server configuration
│   ├── package.json      # Backend dependencies
│   ├── .env              # Environment variables
│   └── routes/
│       └── cards.js      # Advanced API endpoints & validation
│
├── .env                  # Configuration
├── README.md             # This file
└── .gitignore            # Git ignore rules
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14.0 or higher)
- npm (v6.0 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

#### Option 1: Frontend Only (No Backend)

1. **Clone/Download the project**
```bash
cd flashcard-app
```

2. **Open in browser**
```bash
# Simply open frontend/index.html in your browser
# Or use a local server:
cd frontend
python -m http.server 8000
# Then visit http://localhost:8000
```

#### Option 2: Full Stack (Frontend + Backend)

1. **Install backend dependencies**
```bash
cd backend
npm install
```

2. **Start the backend server**
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

3. **Access the application**
```
Open http://localhost:3000 in your browser
```

---

## 💻 Usage Guide

### Quick Start

1. **Home Page**
   - View statistics: Total cards, Categories, Accuracy
   - Quick access to Study or Add Cards

2. **Add Cards**
   - Click "Add New Card" button
   - Fill in Question and Answer
   - Optionally add Category and Difficulty
   - Click "Save Card"

3. **Study Mode**
   - Click through cards with Previous/Next
   - Click card to flip and reveal answer
   - Select study mode: Normal, Shuffle, or Auto-Play
   - Adjust auto-play speed with slider

4. **Quiz Mode**
   - Select multiple choice from options
   - View real-time score
   - See final results with accuracy

5. **Manage Cards**
   - View all cards in grid layout
   - Search cards by question or answer
   - Filter by category
   - Edit or delete cards
   - Import/Export data

### Keyboard Shortcuts
- `D` - Toggle Dark Mode (coming soon)
- `S` - Toggle Sound (coming soon)
- `Right Arrow` - Next Card (coming soon)
- `Left Arrow` - Previous Card (coming soon)

---

## 🔧 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Get All Cards
```
GET /cards
Query Parameters:
  - category (optional): Filter by category
  - difficulty (optional): Filter by difficulty (Easy/Medium/Hard)
  - search (optional): Search in question/answer

Response:
[
  {
    "id": 1,
    "question": "What is the capital of France?",
    "answer": "Paris",
    "category": "Geography",
    "difficulty": "Easy",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

#### Get Single Card
```
GET /cards/:id

Response:
{
  "id": 1,
  "question": "What is the capital of France?",
  "answer": "Paris",
  "category": "Geography",
  "difficulty": "Easy",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Create New Card
```
POST /cards
Content-Type: application/json

Request Body:
{
  "question": "What is 2 + 2?",
  "answer": "4",
  "category": "Math",
  "difficulty": "Easy"
}

Response: 201 Created
{
  "id": 6,
  "question": "What is 2 + 2?",
  "answer": "4",
  "category": "Math",
  "difficulty": "Easy",
  "createdAt": "2024-01-15T10:35:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

#### Update Card
```
PUT /cards/:id
Content-Type: application/json

Request Body:
{
  "question": "Updated question?",
  "answer": "Updated answer",
  "category": "NewCategory",
  "difficulty": "Hard"
}

Response: 200 OK
{
  "id": 1,
  "question": "Updated question?",
  "answer": "Updated answer",
  "category": "NewCategory",
  "difficulty": "Hard",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:40:00Z"
}
```

#### Delete Card
```
DELETE /cards/:id

Response: 200 OK
{
  "id": 1,
  "question": "What is the capital of France?",
  "answer": "Paris",
  "category": "Geography",
  "difficulty": "Easy",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Get Statistics
```
GET /cards/stats/overview

Response:
{
  "totalCards": 8,
  "categories": ["Geography", "Math", "Science"],
  "difficulties": ["Easy", "Medium", "Hard"],
  "byCategory": {
    "Geography": 2,
    "Math": 1,
    "Science": 3
  },
  "byDifficulty": {
    "Easy": 2,
    "Medium": 3,
    "Hard": 2
  }
}
```

---

## 🔌 Configuration

### Environment Variables (.env)
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Settings
CORS_ORIGIN=http://localhost:3000

# API Base URL (Frontend)
VITE_API_BASE=http://localhost:3000/api
```

### Switching Between Frontend-Only and Backend Mode

**In `script.js` (frontend):**
```javascript
const USE_BACKEND = true;  // Set to false for frontend-only mode
```

---

## 📱 Responsive Design

The application is fully responsive across all device sizes:

| Device | Screen Size | Support |
|--------|------------|---------|
| Mobile | < 480px | ✅ Full Support |
| Tablet | 480px - 768px | ✅ Full Support |
| Desktop | > 768px | ✅ Full Support |
| Large Desktop | > 1200px | ✅ Full Support |

---

## 🎨 Customization

### Change Color Scheme
Edit CSS variables in `style.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #48bb78;
    --danger-color: #f56565;
    /* ... more variables */
}
```

### Modify Default Cards
Edit `getDefaultCards()` function in `script.js`:
```javascript
function getDefaultCards() {
    return [
        // Add/modify cards here
        { id: 1, question: '...', answer: '...', ... }
    ];
}
```

### Adjust Dark Mode Colors
Update the `dark-mode` CSS variables:
```css
body.dark-mode {
    --bg-primary: #1a202c;
    --bg-secondary: #2d3748;
    --text-primary: #f7fafc;
    /* ... more variables */
}
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create a new card
- [ ] Edit an existing card
- [ ] Delete a card
- [ ] Flip card in study mode
- [ ] Navigate between cards
- [ ] Test shuffle mode
- [ ] Test auto-play mode
- [ ] Complete a quiz
- [ ] Filter by category
- [ ] Search for specific cards
- [ ] Toggle dark mode
- [ ] Toggle sound
- [ ] Export cards as JSON
- [ ] Import cards from JSON
- [ ] Check responsive design

---

## 🐛 Known Issues & Troubleshooting

### Issue: Backend not connecting
**Solution:** 
- Ensure backend is running on port 3000
- Check CORS settings in `server.js`
- Set `USE_BACKEND = false` in script.js to use frontend-only mode

### Issue: LocalStorage not working
**Solution:**
- Check browser privacy settings
- Clear browser cache
- Try in incognito/private mode

### Issue: Sound not playing
**Solution:**
- Check browser audio permissions
- Ensure sound is enabled in the app
- Test volume settings

---

## 📦 Dependencies

### Frontend
- **FontAwesome 6.4.0** - Icons (via CDN)
- **Vanilla JavaScript ES6+** - No framework dependencies

### Backend
- **Express.js** - Web framework
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🚀 Future Enhancements

- [ ] User authentication system
- [ ] Cloud database integration (MongoDB/Firebase)
- [ ] Mobile app (React Native)
- [ ] Spaced repetition algorithm
- [ ] Leaderboard system
- [ ] Collaborative learning features
- [ ] Advanced statistics dashboard
- [ ] Keyboard shortcuts
- [ ] Offline mode
- [ ] Multi-language support
- [ ] Deck sharing functionality
- [ ] Quiz scheduling

---

## 📞 Support

For issues, questions, or suggestions, please:
- Open an issue on GitHub
- Contact: support@flashmaster.app
- Visit: https://flashmaster.app

---

## 🎓 Educational Resources

Learn more about flashcard learning:
- [Spaced Repetition](https://en.wikipedia.org/wiki/Spaced_repetition)
- [Active Recall](https://en.wikipedia.org/wiki/Active_recall)
- [Interleaving](https://en.wikipedia.org/wiki/Interleaving)

---

## 📊 Statistics

- **Total Code Lines**: 1000+
- **CSS Rules**: 500+
- **API Endpoints**: 8
- **Study Modes**: 3
- **Supported Languages**: JavaScript, HTML5, CSS3
- **Browser Support**: All modern browsers

---

## ⭐ Show Your Support

If you find this project helpful, please consider:
- Starring this repository ⭐
- Sharing with friends
- Contributing improvements
- Giving feedback

---

**Created with ❤️ for learners everywhere**

*Last Updated: January 2024*
*Version: 1.0.0 (Production Ready)*
#   F l a s h - m a s t e r  
 