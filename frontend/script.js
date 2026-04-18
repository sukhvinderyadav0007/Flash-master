// ============================================
// GLOBAL STATE MANAGEMENT
// ============================================

let appState = {
    allCards: [],
    filteredCards: [],
    currentCardIndex: 0,
    isFlipped: false,
    currentMode: 'normal',
    autoPlayInterval: null,
    autoPlaySpeed: 5000,
    soundEnabled: true,
    darkMode: false,
    quizMode: false,
    quizCards: [],
    quizIndex: 0,
    quizScore: 0,
    quizAnswers: [],
    quizStartTime: null,
    editingCardId: null,
};

const API_BASE = 'http://localhost:3000/api';
const USE_BACKEND = true; // Set to false for frontend-only mode

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadDarkModePreference();
});

async function initializeApp() {
    try {
        await loadCards();
        loadCategoriesFromCards();
        populateManagementCategories();
        updateStats();
        showSection('home');
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Error initializing app', 'error');
    }
}

// ============================================
// CARD MANAGEMENT
// ============================================

async function loadCards() {
    try {
        if (USE_BACKEND) {
            const response = await fetch(`${API_BASE}/cards`);
            if (!response.ok) throw new Error('Failed to fetch cards');
            appState.allCards = await response.json();
        } else {
            // Load from localStorage
            const stored = localStorage.getItem('flashcards');
            appState.allCards = stored ? JSON.parse(stored) : getDefaultCards();
        }
        appState.filteredCards = [...appState.allCards];
        appState.currentCardIndex = 0;
        displayStudyCard();
        renderManagementCards();
    } catch (error) {
        console.error('Error loading cards:', error);
        appState.allCards = getDefaultCards();
        appState.filteredCards = [...appState.allCards];
    }
}

function getDefaultCards() {
    return [
        { id: 1, question: 'What is the capital of France?', answer: 'Paris', category: 'Geography', difficulty: 'Easy' },
        { id: 2, question: 'What is 2 + 2?', answer: '4', category: 'Math', difficulty: 'Easy' },
        { id: 3, question: 'What is the largest planet?', answer: 'Jupiter', category: 'Science', difficulty: 'Medium' },
        { id: 4, question: 'Who wrote Romeo and Juliet?', answer: 'William Shakespeare', category: 'Literature', difficulty: 'Medium' },
        { id: 5, question: 'What is the chemical symbol for Gold?', answer: 'Au', category: 'Chemistry', difficulty: 'Hard' },
        { id: 6, question: 'What is the speed of light?', answer: '299,792,458 m/s', category: 'Physics', difficulty: 'Hard' },
        { id: 7, question: 'Who painted the Mona Lisa?', answer: 'Leonardo da Vinci', category: 'Art', difficulty: 'Easy' },
        { id: 8, question: 'What year did World War II end?', answer: '1945', category: 'History', difficulty: 'Medium' },
    ];
}

async function saveCard(event) {
    event.preventDefault();

    const question = document.getElementById('question').value.trim();
    const answer = document.getElementById('answer').value.trim();
    const category = document.getElementById('category').value.trim() || 'General';
    const difficulty = document.getElementById('difficulty').value;

    if (!question || !answer) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    try {
        if (appState.editingCardId) {
            // Update existing card
            const cardToUpdate = appState.allCards.find(c => c.id === appState.editingCardId);
            if (cardToUpdate) {
                cardToUpdate.question = question;
                cardToUpdate.answer = answer;
                cardToUpdate.category = category;
                cardToUpdate.difficulty = difficulty;

                if (USE_BACKEND) {
                    await fetch(`${API_BASE}/cards/${appState.editingCardId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(cardToUpdate),
                    });
                }
                showNotification('Card updated successfully', 'success');
            }
        } else {
            // Create new card
            const newCard = {
                id: appState.allCards.length > 0 ? Math.max(...appState.allCards.map(c => c.id)) + 1 : 1,
                question,
                answer,
                category,
                difficulty,
            };

            if (USE_BACKEND) {
                const response = await fetch(`${API_BASE}/cards`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newCard),
                });
                if (!response.ok) throw new Error('Failed to create card');
                appState.allCards.push(newCard);
            } else {
                appState.allCards.push(newCard);
            }

            showNotification('Card added successfully', 'success');
        }

        // Save to localStorage
        localStorage.setItem('flashcards', JSON.stringify(appState.allCards));
        appState.filteredCards = [...appState.allCards];
        closeCardModal();
        renderManagementCards();
        loadCategoriesFromCards();
        populateManagementCategories();
        updateStats();
    } catch (error) {
        console.error('Error saving card:', error);
        showNotification('Error saving card', 'error');
    }
}

async function deleteCard(cardId) {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
        if (USE_BACKEND) {
            const response = await fetch(`${API_BASE}/cards/${cardId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete card');
        }

        appState.allCards = appState.allCards.filter(c => c.id !== cardId);
        localStorage.setItem('flashcards', JSON.stringify(appState.allCards));
        appState.filteredCards = appState.filteredCards.filter(c => c.id !== cardId);
        renderManagementCards();
        loadCategoriesFromCards();
        populateManagementCategories();
        updateStats();
        showNotification('Card deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting card:', error);
        showNotification('Error deleting card', 'error');
    }
}

function editCard(cardId) {
    const card = appState.allCards.find(c => c.id === cardId);
    if (!card) return;

    appState.editingCardId = cardId;
    document.getElementById('modalTitle').textContent = 'Edit Card';
    document.getElementById('question').value = card.question;
    document.getElementById('answer').value = card.answer;
    document.getElementById('category').value = card.category;
    document.getElementById('difficulty').value = card.difficulty;

    document.getElementById('cardModal').classList.remove('hidden');
}

// ============================================
// STUDY MODE
// ============================================

function displayStudyCard() {
    if (appState.filteredCards.length === 0) {
        document.getElementById('questionText').textContent = 'No cards available';
        document.getElementById('answerText').textContent = 'Add some cards or adjust your filters';
        return;
    }

    const card = appState.filteredCards[appState.currentCardIndex];
    document.getElementById('questionText').textContent = card.question;
    document.getElementById('answerText').textContent = card.answer;
    document.getElementById('currentCard').textContent = appState.currentCardIndex + 1;
    document.getElementById('totalCards').textContent = appState.filteredCards.length;
    document.getElementById('categoryTag').textContent = card.category || 'General';
    document.getElementById('categoryTag').className = 'category-tag';

    const difficultyBadge = document.getElementById('difficultyBadge');
    difficultyBadge.textContent = card.difficulty || 'Medium';
    difficultyBadge.className = `difficulty-badge ${(card.difficulty || 'Medium').toLowerCase()}`;

    appState.isFlipped = false;
    document.getElementById('flashcard').classList.remove('flipped');
    updateStudyButtonStates();
    updateProgressBar();
}

function flipCard() {
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.toggle('flipped');
    appState.isFlipped = !appState.isFlipped;

    if (appState.soundEnabled) {
        playSound();
    }
}

function nextStudyCard() {
    if (appState.currentCardIndex < appState.filteredCards.length - 1) {
        appState.currentCardIndex++;
        displayStudyCard();
    }
}

function previousStudyCard() {
    if (appState.currentCardIndex > 0) {
        appState.currentCardIndex--;
        displayStudyCard();
    }
}

function updateStudyButtonStates() {
    const section = document.getElementById('study-section');
    if (!section) return;
    const prevBtn = section.querySelector('.btn-prev');
    const nextBtn = section.querySelector('.btn-next');
    if (prevBtn) prevBtn.disabled = appState.currentCardIndex === 0;
    if (nextBtn) nextBtn.disabled = appState.currentCardIndex === appState.filteredCards.length - 1;
}

function filterStudyCards() {
    const searchTerm = document.getElementById('searchCards').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;

    appState.filteredCards = appState.allCards.filter(card => {
        const matchesSearch = card.question.toLowerCase().includes(searchTerm) ||
                            card.answer.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || card.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    appState.currentCardIndex = 0;
    displayStudyCard();
}

function setStudyMode(mode) {
    appState.currentMode = mode;

    // Update button states
    document.querySelectorAll('.btn-mode').forEach(btn => btn.classList.remove('active'));
    const modeButton = document.getElementById(`mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
    if (modeButton) modeButton.classList.add('active');

    if (mode === 'shuffle') {
        appState.filteredCards = [...appState.filteredCards].sort(() => Math.random() - 0.5);
        appState.currentCardIndex = 0;
        displayStudyCard();
    } else if (mode === 'auto') {
        startAutoPlay();
    } else {
        stopAutoPlay();
        appState.filteredCards = [...appState.allCards];
        appState.currentCardIndex = 0;
        displayStudyCard();
    }
}

function startAutoPlay() {
    stopAutoPlay();
    appState.autoPlayInterval = setInterval(() => {
        if (appState.currentCardIndex < appState.filteredCards.length - 1) {
            nextStudyCard();
        } else {
            stopAutoPlay();
        }
    }, appState.autoPlaySpeed);
}

function stopAutoPlay() {
    if (appState.autoPlayInterval) {
        clearInterval(appState.autoPlayInterval);
        appState.autoPlayInterval = null;
    }
}

function updateAutoSpeed(value) {
    appState.autoPlaySpeed = value * 1000;
    document.getElementById('speedDisplay').textContent = value + 's';
    if (appState.currentMode === 'auto') {
        startAutoPlay();
    }
}

function updateProgressBar() {
    const progress = ((appState.currentCardIndex + 1) / appState.filteredCards.length) * 100;
    document.getElementById('studyProgress').style.width = progress + '%';
    document.getElementById('progressPercent').textContent = Math.round(progress) + '%';
}

// ============================================
// QUIZ MODE
// ============================================

function initQuiz() {
    // Prepare quiz
    appState.quizCards = [...appState.filteredCards].sort(() => Math.random() - 0.5).slice(0, 10);
    appState.quizIndex = 0;
    appState.quizScore = 0;
    appState.quizAnswers = [];
    appState.quizStartTime = Date.now();

    showSection('quiz');
    displayQuizQuestion();
}

function displayQuizQuestion() {
    if (appState.quizIndex >= appState.quizCards.length) {
        endQuiz();
        return;
    }

    const currentQuestion = appState.quizCards[appState.quizIndex];
    const otherCards = appState.quizCards.filter((_, i) => i !== appState.quizIndex);
    const options = [
        currentQuestion.answer,
        ...otherCards.slice(0, 3).map(c => c.answer)
    ].sort(() => Math.random() - 0.5);

    document.getElementById('quizQuestion').textContent = currentQuestion.question;
    document.getElementById('quizCurrent').textContent = appState.quizIndex + 1;
    document.getElementById('quizTotal').textContent = appState.quizCards.length;
    document.getElementById('quizScore').textContent = `Score: ${appState.quizScore}`;

    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = options.map((option, index) => `
        <label class="quiz-option">
            <input type="radio" name="answer" value="${option}" data-index="${index}">
            <span>${option}</span>
        </label>
    `).join('');

    updateQuizProgress();
    startQuizTimer();
}

function submitAnswer() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (!selectedAnswer) {
        showNotification('Please select an answer', 'warning');
        return;
    }

    const currentQuestion = appState.quizCards[appState.quizIndex];
    const isCorrect = selectedAnswer.value === currentQuestion.answer;

    appState.quizAnswers.push({
        question: currentQuestion.question,
        correct: currentQuestion.answer,
        selected: selectedAnswer.value,
        isCorrect,
    });

    if (isCorrect) {
        appState.quizScore++;
    }

    appState.quizIndex++;
    displayQuizQuestion();
}

function skipQuestion() {
    const currentQuestion = appState.quizCards[appState.quizIndex];
    appState.quizAnswers.push({
        question: currentQuestion.question,
        correct: currentQuestion.answer,
        selected: null,
        isCorrect: false,
    });

    appState.quizIndex++;
    displayQuizQuestion();
}

function startQuizTimer() {
    // Implement timer logic if needed
    const timerElement = document.getElementById('timerDisplay');
    let timeLeft = 30;

    const timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            skipQuestion();
        }
    }, 1000);
}

function updateQuizProgress() {
    const progress = ((appState.quizIndex) / appState.quizCards.length) * 100;
    document.getElementById('quizProgress').style.width = progress + '%';
}

function endQuiz() {
    const accuracy = (appState.quizScore / appState.quizCards.length) * 100;
    const timeTaken = Math.floor((Date.now() - appState.quizStartTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    document.getElementById('finalScore').textContent = appState.quizScore;
    document.getElementById('quizTotalQuestions').textContent = appState.quizCards.length;
    document.getElementById('finalAccuracy').textContent = Math.round(accuracy) + '%';
    document.getElementById('totalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    let message = '';
    if (accuracy === 100) {
        message = '🎉 Perfect Score! Outstanding!';
    } else if (accuracy >= 80) {
        message = '🌟 Excellent! Keep it up!';
    } else if (accuracy >= 60) {
        message = '👍 Good Job! Practice more.';
    } else {
        message = '📚 Keep studying!';
    }

    document.getElementById('resultMessage').textContent = message;
    document.getElementById('quizCompleteModal').classList.remove('hidden');
}

function restartQuiz() {
    document.getElementById('quizCompleteModal').classList.add('hidden');
    initQuiz();
}

// ============================================
// MANAGEMENT SECTION
// ============================================

function renderManagementCards() {
    const container = document.getElementById('cardsGrid');
    const emptyState = document.getElementById('emptyState');

    if (appState.filteredCards.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    container.innerHTML = appState.filteredCards.map(card => `
        <div class="card-item">
            <h3>${escapeHtml(card.question)}</h3>
            <p>${escapeHtml(card.answer)}</p>
            <div class="card-item-meta">
                <span class="card-meta-tag">${card.category || 'General'}</span>
                <span class="card-meta-tag">${card.difficulty || 'Medium'}</span>
            </div>
            <div class="card-item-actions">
                <button onclick="editCard(${card.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete" onclick="deleteCard(${card.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function filterManagementCards() {
    const searchTerm = document.getElementById('managementSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('managementCategoryFilter').value;

    appState.filteredCards = appState.allCards.filter(card => {
        const matchesSearch = card.question.toLowerCase().includes(searchTerm) ||
                            card.answer.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || card.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    renderManagementCards();
}

function loadCategoriesFromCards() {
    const categories = [...new Set(appState.allCards.map(c => c.category).filter(Boolean))];
    return categories;
}

function populateManagementCategories() {
    const categories = loadCategoriesFromCards();
    const selects = [
        document.getElementById('categoryFilter'),
        document.getElementById('managementCategoryFilter'),
    ];

    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
        select.value = currentValue;
    });
}

function openAddCardModal() {
    appState.editingCardId = null;
    document.getElementById('modalTitle').textContent = 'Add New Card';
    document.getElementById('cardForm').reset();
    document.getElementById('cardModal').classList.remove('hidden');
}

function closeCardModal() {
    document.getElementById('cardModal').classList.add('hidden');
    document.getElementById('cardForm').reset();
    appState.editingCardId = null;
}

// ============================================
// DATA IMPORT/EXPORT
// ============================================

function exportData() {
    const data = JSON.stringify(appState.allCards, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flashcards-' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
    showNotification('Cards exported successfully', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) throw new Error('Invalid format');

            appState.allCards.push(...imported);
            localStorage.setItem('flashcards', JSON.stringify(appState.allCards));
            appState.filteredCards = [...appState.allCards];
            renderManagementCards();
            loadCategoriesFromCards();
            populateManagementCategories();
            updateStats();
            showNotification(`Imported ${imported.length} cards`, 'success');
        } catch (error) {
            showNotification('Error importing cards', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ============================================
// UI INTERACTIONS
// ============================================

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const sectionId = sectionName + '-section';
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');

        if (sectionName === 'study') {
            loadCategoriesFromCards();
            filterStudyCards();
        } else if (sectionName === 'management') {
            filterManagementCards();
        } else if (sectionName === 'quiz') {
            initQuiz();
        }
    }

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.closest('.nav-btn')?.classList.add('active');
    }
}

function toggleDarkMode() {
    appState.darkMode = !appState.darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', appState.darkMode);
    document.querySelector('.theme-toggle').innerHTML = appState.darkMode ? 
        '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function loadDarkModePreference() {
    const saved = localStorage.getItem('darkMode');
    if (saved) {
        appState.darkMode = JSON.parse(saved);
        if (appState.darkMode) {
            document.body.classList.add('dark-mode');
            document.querySelector('.theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
}

function toggleSound() {
    appState.soundEnabled = !appState.soundEnabled;
    const icon = appState.soundEnabled ? 'fa-volume-up' : 'fa-volume-mute';
    document.querySelector('.sound-toggle').innerHTML = `<i class="fas ${icon}"></i>`;
    localStorage.setItem('soundEnabled', appState.soundEnabled);
}

function playSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const envelope = audioContext.createGain();

        oscillator.connect(envelope);
        envelope.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        envelope.gain.setValueAtTime(0.3, audioContext.currentTime);
        envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Fallback if audio context is not available
    }
}

function markLiked() {
    const btn = document.querySelector('.card-actions .icon-btn:first-child');
    btn.classList.toggle('liked');
    btn.innerHTML = btn.classList.contains('liked') ? 
        '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
}

function reportCard() {
    showNotification('Card reported. Thank you for the feedback!', 'success');
}

function updateStats() {
    const totalCards = appState.allCards.length;
    const categories = [...new Set(appState.allCards.map(c => c.category).filter(Boolean))];
    const accuracy = calculateAccuracy();

    document.getElementById('totalCardsHome').textContent = totalCards;
    document.getElementById('totalCategoriesHome').textContent = categories.length;
    document.getElementById('accuracyHome').textContent = accuracy + '%';
}

function calculateAccuracy() {
    if (appState.quizAnswers.length === 0) return 0;
    const correct = appState.quizAnswers.filter(a => a.isCorrect).length;
    return Math.round((correct / appState.quizAnswers.length) * 100);
}

function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // You can enhance this with a toast notification library like toastr
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Load sound preference
window.addEventListener('DOMContentLoaded', () => {
    const savedSound = localStorage.getItem('soundEnabled');
    if (savedSound !== null) {
        appState.soundEnabled = JSON.parse(savedSound);
        if (!appState.soundEnabled) {
            document.querySelector('.sound-toggle').innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    }
});
