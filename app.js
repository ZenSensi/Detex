import { config } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = config.firebaseConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// We no longer need DOMContentLoaded because type="module" scripts run after the document is parsed
// API Configuration
const OPENROUTER_API_KEY = config.OPENROUTER_API_KEY;
const MODEL_NAME = 'openai/gpt-oss-120b:free';

// DOM Elements
const views = {
    'dashboard-view': document.getElementById('dashboard-view'),
    'history-view': document.getElementById('history-view'),
    'settings-view': document.getElementById('settings-view'),
    'results-view': document.getElementById('results-view')
};

const navItems = document.querySelectorAll('.nav-item');
const messageInput = document.getElementById('message-input');
const analyzeBtn = document.getElementById('analyze-btn');
const checkAnotherBtn = document.getElementById('check-another-btn');
const reportBtn = document.getElementById('report-btn');
const loginBtn = document.getElementById('login-trigger-btn');
const loginText = document.getElementById('login-text');
const loginIcon = document.getElementById('login-icon');

// Login Modal Elements
const loginModal = document.getElementById('login-modal');
const closeLoginBtn = document.querySelector('.close-modal');
const googleLoginBtn = document.getElementById('google-login-btn');
const emailLoginForm = document.getElementById('email-login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const submitAuthBtn = document.getElementById('submit-auth-btn');
const toggleAuthMode = document.getElementById('toggle-auth-mode');

// User Profile Elements
const userInfo = document.getElementById('user-info');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');

// Results DOM Elements
const resultCard = document.getElementById('result-card');
const statusIcon = document.getElementById('status-icon');
const statusTitle = document.getElementById('status-title');
const confidenceScore = document.getElementById('confidence-score');
const gaugeFill = document.getElementById('gauge-fill');
const statusReasoning = document.getElementById('status-reasoning');
const analyzedMessage = document.getElementById('analyzed-message');

// History DOM Elements
const historyList = document.getElementById('history-list');
const emptyHistory = document.getElementById('empty-history');

// State
let scans = JSON.parse(localStorage.getItem('detexScans')) || [];
let currentUser = null;

// Icons
const icons = {
    safe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon icon-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>',
    fraud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon icon-shield-alert"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
    suspicious: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon icon-shield-warn"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
    login: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
};

// Auth Logic
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        // User is signed in
        loginText.textContent = 'Logout';
        loginIcon.innerHTML = icons.logout;

        // Update user info section
        userInfo.classList.add('active');
        userAvatar.src = user.photoURL || 'https://via.placeholder.com/32';
        userName.textContent = user.displayName || 'User';
        userEmail.textContent = user.email;

        // Load history from Firestore
        loadHistoryFromFirestore();
    } else {
        // User is signed out
        loginText.textContent = 'Login';
        loginIcon.innerHTML = icons.login;
        userInfo.classList.remove('active');

        // Guests don't have history
        scans = [];
        renderHistory();
    }
});

async function handleAuth() {
    if (currentUser) {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    } else {
        loginModal.classList.add('active');
    }
}

loginBtn.addEventListener('click', handleAuth);

// Theme Selection Logic
const themeDarkBtn = document.getElementById('theme-dark-btn');
const themeLightBtn = document.getElementById('theme-light-btn');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('detexTheme', theme);

    if (theme === 'dark') {
        themeDarkBtn?.classList.add('active');
        themeLightBtn?.classList.remove('active');
    } else {
        themeLightBtn?.classList.add('active');
        themeDarkBtn?.classList.remove('active');
    }
}

// Sidebar Panel Elements
const mainPanel = document.getElementById('main-panel');
const settingsPanel = document.getElementById('settings-panel');

// Navigation and Sidebar Panel logic
document.addEventListener('click', (e) => {
    const settingsTrigger = e.target.closest('#settings-trigger-btn');
    if (settingsTrigger) {
        mainPanel?.classList.remove('active');
        settingsPanel?.classList.add('active');
        switchView('settings-view');
        return;
    }

    const backBtn = e.target.closest('#back-to-main');
    if (backBtn) {
        settingsPanel?.classList.remove('active');
        mainPanel?.classList.add('active');
        switchView('dashboard-view');
        return;
    }

    const navItem = e.target.closest('.nav-item');
    if (navItem && navItem.dataset.target) {
        const target = navItem.dataset.target;
        if (target === 'dashboard-view') {
            messageInput.value = '';
        }
        switchView(target);
    }
});

// Initialize Theme
const savedTheme = localStorage.getItem('detexTheme') || 'dark';
setTheme(savedTheme);

themeDarkBtn?.addEventListener('click', () => setTheme('dark'));
themeLightBtn?.addEventListener('click', () => setTheme('light'));

// Modal Event Listeners
closeLoginBtn.addEventListener('click', () => {
    loginModal.classList.remove('active');
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.remove('active');
    }
});

const loginError = document.getElementById('login-error');

function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
}

let isSignUpMode = false;
if (toggleAuthMode) {
    toggleAuthMode.addEventListener('click', (e) => {
        // Only handle if it's not a direct link to another page
        if (toggleAuthMode.getAttribute('href') === '#' || !toggleAuthMode.getAttribute('href')) {
            e.preventDefault();
            isSignUpMode = !isSignUpMode;
            submitAuthBtn.textContent = isSignUpMode ? 'Sign Up' : 'Login';
            toggleAuthMode.innerHTML = isSignUpMode ?
                'Already have an account? <a href="#">Login</a>' :
                'Don\'t have an account? <a href="#">Sign Up</a>';
        }
    });
}

emailLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    loginError.style.display = 'none';

    submitAuthBtn.disabled = true;
    const originalText = submitAuthBtn.textContent;
    submitAuthBtn.innerHTML = '<span class="spinner"></span> Processing...';

    try {
        if (isSignUpMode) {
            await createUserWithEmailAndPassword(auth, email, password);
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
        loginModal.classList.remove('active');
        emailLoginForm.reset();
    } catch (error) {
        console.error('Auth error:', error);
        let userMessage = 'Authentication failed. Please check your credentials.';
        if (error.code === 'auth/invalid-credential') userMessage = 'Invalid email or password.';
        if (error.code === 'auth/user-not-found') userMessage = 'No account found with this email.';
        if (error.code === 'auth/wrong-password') userMessage = 'Incorrect password.';
        if (error.code === 'auth/email-already-in-use') userMessage = 'This email is already registered.';

        showLoginError(userMessage);
    } finally {
        submitAuthBtn.disabled = false;
        submitAuthBtn.textContent = originalText;
    }
});

googleLoginBtn.addEventListener('click', async () => {
    loginError.style.display = 'none';
    try {
        await signInWithPopup(auth, googleProvider);
        loginModal.classList.remove('active');
    } catch (error) {
        console.error('Google sign in error:', error);
        if (error.code === 'auth/unauthorized-domain') {
            showLoginError('This domain is not authorized. Please add 127.0.0.1 to your Firebase Authorized Domains.');
        } else if (error.code !== 'auth/popup-closed-by-user') {
            showLoginError('Google Sign-In failed: ' + error.message);
        }
    }
});

// Navigation Logic
function switchView(viewId) {
    // Hide all views
    Object.values(views).forEach(view => view.classList.remove('active'));
    // Show target view
    if (views[viewId]) {
        views[viewId].classList.add('active');
    }

    // Update nav items
    navItems.forEach(item => {
        if (item.dataset.target === viewId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    if (viewId === 'history-view') {
        renderHistory();
    }
}

// Real AI Analysis Engine using OpenRouter
async function analyzeText(text) {
    const systemPrompt = `You are an AI Fraud Detection expert. Analyze the given message and determine if it is "safe", "suspicious", or "fraud".
Suspect messages that:
1. Request urgent action or use demanding words related to banking/financial work.
2. Contain any suspicious or unexpected links.
3. Attempt to create high pressure or fear to get the user to act.

Return ONLY a JSON object in this exact format:
{
    "status": "safe" | "suspicious" | "fraud",
    "title": "Short Descriptive Title",
    "confidence": 0-100,
    "reasoning": "A concise explanation of why this was flagged"
}`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": MODEL_NAME,
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": text }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Extract JSON from response (handling potential markdown formatting)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid AI response format');
        }

        const result = JSON.parse(jsonMatch[0]);
        return {
            ...result,
            text,
            date: new Date().toISOString()
        };
    } catch (error) {
        console.error('Analysis error:', error);
        throw error;
    }
}

// Analyze Action
analyzeBtn.addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (!text) {
        alert('Please paste a message to analyze.');
        return;
    }

    // Guest Limit Check
    if (!currentUser) {
        let guestCount = parseInt(localStorage.getItem('detexGuestCount')) || 0;
        if (guestCount >= 5) {
            alert('You have reached the limit of 5 free analyzes. Please login or register to continue.');
            loginModal.classList.add('active');
            return;
        }
    }

    // Change button state to loading
    const originalBtnHTML = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = '<span class="spinner"></span> Analyzing...';
    analyzeBtn.disabled = true;

    try {
        const result = await analyzeText(text);

        // Save to Firestore and Local Cache ONLY if logged in
        if (currentUser) {
            await addDoc(collection(db, "users", currentUser.uid, "scans"), {
                ...result,
                timestamp: serverTimestamp()
            });

            // Save to local history for quick access
            scans.unshift(result);
            if (scans.length > 50) scans.pop();
            localStorage.setItem('detexScans', JSON.stringify(scans));
        } else {
            // Increment guest count but don't save the scan data
            let guestCount = parseInt(localStorage.getItem('detexGuestCount')) || 0;
            localStorage.setItem('detexGuestCount', guestCount + 1);
        }

        // Render result
        renderResult(result);

        // Navigate to results
        switchView('results-view');
        // Unset active state from bottom nav since we are in a sub-view
        navItems.forEach(item => {
            if (item.id !== 'login-trigger-btn') item.classList.remove('active');
        });

    } catch (error) {
        alert('Analysis failed. Please check your connection or try again later.');
    } finally {
        // Reset button
        analyzeBtn.innerHTML = originalBtnHTML;
        analyzeBtn.disabled = false;
    }
});

function renderResult(result) {
    // Reset classes
    resultCard.className = `status-card ${result.status}`;

    statusIcon.innerHTML = icons[result.status];
    statusTitle.textContent = result.title;
    confidenceScore.textContent = `${result.confidence}%`;
    statusReasoning.textContent = result.reasoning;
    analyzedMessage.textContent = result.text;

    // Reset gauge for animation
    gaugeFill.style.width = '0%';
    setTimeout(() => {
        gaugeFill.style.width = `${result.confidence}%`;
    }, 100);

    if (result.status === 'fraud' || result.status === 'suspicious') {
        reportBtn.style.display = 'block';
    } else {
        reportBtn.style.display = 'none';
    }
}

// History Logic
function renderHistory() {
    historyList.innerHTML = '';

    if (scans.length === 0) {
        emptyHistory.style.display = 'block';
        historyList.style.display = 'none';
        return;
    }

    emptyHistory.style.display = 'none';
    historyList.style.display = 'flex';

    scans.forEach((scan, index) => {
        const item = document.createElement('div');
        item.className = `history-item ${scan.status}`;

        const dateStr = new Date(scan.date).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        item.innerHTML = `
                <div class="history-item-header">
                    <span class="badge">${scan.title}</span>
                    <span class="history-date">${dateStr}</span>
                </div>
                <div class="history-snippet">${scan.text}</div>
            `;

        item.addEventListener('click', () => {
            renderResult(scan);
            switchView('results-view');
            navItems.forEach(nav => nav.classList.remove('active'));
        });

        historyList.appendChild(item);
    });
}

// Firestore History Loading
async function loadHistoryFromFirestore() {
    if (!currentUser) return;

    try {
        const scansRef = collection(db, "users", currentUser.uid, "scans");
        const q = query(scansRef, orderBy("timestamp", "desc"), limit(50));
        const querySnapshot = await getDocs(q);

        const cloudScans = [];
        querySnapshot.forEach((doc) => {
            cloudScans.push(doc.data());
        });

        if (cloudScans.length > 0) {
            scans = cloudScans;
            renderHistory();
        }
    } catch (error) {
        console.error("Error loading history:", error);
    }
}

// Initial render
renderHistory();
