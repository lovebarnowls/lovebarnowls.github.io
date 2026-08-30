// Each gameN.html defines a small inline `window.GAME_CONFIG = { gameId, workerUrl }`
// before loading this file. All logic here is generic and shared across the six pages.

(function () {
    const { gameId, workerUrl } = window.GAME_CONFIG;

    const state = {
        messages: [],
        attemptCount: 0,
        failedGuesses: 0,
        solved: false
    };

    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const guessInput = document.getElementById('guessInput');
    const guessStatus = document.getElementById('guessStatus');
    const guessBtn = document.getElementById('guessBtn');
    const statStatus = document.getElementById('statStatus');
    const studentNameInput = document.getElementById('studentName');

    // Remember the student's name across visits (shared across all six games).
    const savedName = localStorage.getItem('ictclub_studentName');
    if (savedName) studentNameInput.value = savedName;
    studentNameInput.addEventListener('change', () => {
        localStorage.setItem('ictclub_studentName', studentNameInput.value.trim());
    });

    function updateStats() {
        document.getElementById('statAttempts').textContent = state.attemptCount;
        document.getElementById('statFailed').textContent = state.failedGuesses;
        if (state.solved) {
            statStatus.textContent = 'CRACKED';
            statStatus.style.color = 'var(--success)';
        } else {
            statStatus.textContent = 'ACTIVE';
            statStatus.style.color = 'var(--primary)';
        }
    }

    function appendMessageToDOM(text, sender) {
        const div = document.createElement('div');
        div.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
        div.textContent = text;
        chatContainer.appendChild(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function addMessage(text, sender) {
        state.messages.push({ text, sender });
        appendMessageToDOM(text, sender);
    }

    window.handleKeyPress = function (event) {
        if (event.key === 'Enter') sendMessage();
    };

    window.sendMessage = async function () {
        const message = userInput.value.trim();
        if (!message || state.solved) return;

        addMessage(message, 'user');
        userInput.value = '';
        sendBtn.disabled = true;
        sendBtn.innerText = '...';

        state.attemptCount++;
        updateStats();

        const thinking = document.createElement('div');
        thinking.classList.add('thinking');
        thinking.id = 'thinking';
        thinking.textContent = '> Waiting for a reply...';
        chatContainer.appendChild(thinking);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        try {
            const response = await fetch(`${workerUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId,
                    history: state.messages.slice(0, -1), // everything before this turn
                    userInput: message
                })
            });

            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            const data = await response.json();

            document.getElementById('thinking')?.remove();
            addMessage(data.response, 'ai');
        } catch (error) {
            document.getElementById('thinking')?.remove();
            addMessage(`Connection error: ${error.message}`, 'ai');
        } finally {
            sendBtn.disabled = state.solved;
            sendBtn.innerText = 'Send';
        }
    };

    window.checkGuess = async function () {
        const guess = guessInput.value.trim();
        if (!guess) return;

        const name = studentNameInput.value.trim();
        if (!name) {
            guessStatus.className = 'status show incorrect';
            guessStatus.textContent = 'Enter your first name above before submitting a guess.';
            return;
        }
        localStorage.setItem('ictclub_studentName', name);

        guessBtn.disabled = true;
        guessBtn.innerText = '...';
        guessStatus.className = 'status';
        guessStatus.textContent = '';

        try {
            const response = await fetch(`${workerUrl}/guess`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId,
                    guess,
                    studentName: name,
                    attemptCount: state.attemptCount
                })
            });

            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            const data = await response.json();

            guessStatus.classList.add('show');

            if (data.correct) {
                guessStatus.classList.add('correct');
                guessStatus.textContent = `🎉 Correct! You got it in ${state.attemptCount} attempt${state.attemptCount !== 1 ? 's' : ''}.`;
                state.solved = true;
                sendBtn.disabled = true;
                updateStats();
            } else {
                guessStatus.classList.add('incorrect');
                guessStatus.textContent = '❌ Not quite — try again!';
                state.failedGuesses++;
                updateStats();
            }
        } catch (error) {
            guessStatus.classList.add('show', 'incorrect');
            guessStatus.textContent = 'Verification error — check connection.';
        } finally {
            guessBtn.disabled = false;
            guessBtn.innerText = 'Submit';
        }
    };

    // Initial AI greeting, shown locally (does not count as an attempt).
    addMessage(window.GAME_CONFIG.greeting || 'Well now, what can I do for you?', 'ai');
    updateStats();
})();
