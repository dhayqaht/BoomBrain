// “Each part of the script is focused: login, menu control, game logic, input feedback, timers,
// and win/loss conditions — all handled cleanly with separate functions.”




//  Stores game states, timers, and values 
let numberGameActive = false;
let letterGameActive = false;
let numberGameTimer;
let letterGameTimer;
let secretCode = [];
let currentGuess = [];

//Gets the player’s name, shows the game menu, and sends the name to a PHP session.
function submitName() {//User Login & Session
    
    const username = document.getElementById('username').value;
    if (username.trim() !== '') {
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('game-menu').style.display = 'block';
        document.getElementById('player-name').textContent = username;
        
        // Send username to PHP session
        fetch('php.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=setUsername&username=' + encodeURIComponent(username)
        });
    }
}
  //Switches between the game menu and selected game. Resets state when returning to the menu.
function showGame(gameId) {    
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById(gameId).style.display = 'block';
}

function returnToMenu() {
    document.querySelectorAll('.game-container').forEach(container => {
        container.style.display = 'none';
    });
    document.getElementById('game-menu').style.display = 'block';
    resetGames();
}

function resetGames() {
    clearInterval(numberGameTimer);
    clearInterval(letterGameTimer);
    numberGameActive = false;
    letterGameActive = false;
    document.getElementById('win-popup').style.display = 'none';
}

// Number Game Functions
document.getElementById('start-number-game').addEventListener('click', startNumberGame);


//Starts the number game and randomly generates a 4-digit secret code.
function startNumberGame() {
    numberGameActive = true;
    secretCode = Array.from({length: 4}, () => Math.floor(Math.random() * 10).toString());
    document.getElementById('start-number-game').style.display = 'none';
    document.getElementById('reset-number-game').style.display = 'inline';
    startNumberTimer();
    setupNumberInputs();
}
//Prepares the input boxes, Listens for input and stores guesses, and Automatically checks guess when 4 digits are entered.
function setupNumberInputs() {
    const inputs = document.querySelectorAll('.digit');
    inputs.forEach((input, index) => {
        input.value = '';
        input.classList.remove('correct', 'partial');
        input.addEventListener('input', (e) => handleNumberInput(e, index));
    });
}

function handleNumberInput(e, index) {
    if (!numberGameActive) return;
    
    const input = e.target;
    const value = input.value;
    
    if (value && /^\d$/.test(value)) {
        currentGuess[index] = value;
        if (index < 3) {
            document.querySelectorAll('.digit')[index + 1].focus();
        }
        if (currentGuess.length === 4) {
            checkNumberGuess();
        }
    }
}

//Compares the user’s guess to the secret code, shows color feedback, and checks for a win.
function checkNumberGuess() {
    let correct = 0;
    let partial = 0;
    const inputs = document.querySelectorAll('.digit');
    
    currentGuess.forEach((num, i) => {
        if (num === secretCode[i]) {
            correct++;
            inputs[i].classList.add('correct');
        } else if (secretCode.includes(num)) {
            partial++;
            inputs[i].classList.add('partial');
        }
    });
    
    if (correct === 4) {
        numberGameWin();
    } else {
        setTimeout(() => {
            inputs.forEach(input => {
                input.value = '';
                input.classList.remove('correct', 'partial');
            });
            currentGuess = [];
            inputs[0].focus();
        }, 500);
    }
}

//40-second timer with shrinking bar.
function startNumberTimer() {
    let timeLeft = 40;
    const timerBar = document.getElementById('number-timer-bar');
    timerBar.style.width = '100%';
    
    numberGameTimer = setInterval(() => {
        timeLeft--;
        timerBar.style.width = `${(timeLeft / 40) * 100}%`;
        
        if (timeLeft <= 0) {
            clearInterval(numberGameTimer);
            numberGameActive = false;
            alert('Time\'s up! Game Over');
            resetNumberGame();
        }
    }, 1000);
}
//Resets game if time is up or on user request.
function resetNumberGame() {
    clearInterval(numberGameTimer);
    numberGameActive = true;
    secretCode = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10).toString());
    setupNumberInputs();
    document.getElementById('start-number-game').style.display = 'none';
    document.getElementById('reset-number-game').style.display = 'inline';
    startNumberTimer();
   
}
//Shows win popup on success.
function numberGameWin() {
    clearInterval(numberGameTimer);
    numberGameActive = false;
    document.getElementById('win-popup').style.display = 'block';
}

// Starts the letter game and creates a random sequence of 18 letters.
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let letterSequence = [];
let currentLetterIndex = 0;

document.getElementById('start-letter-game').addEventListener('click', startLetterGame);

function startLetterGame() {
    letterGameActive = true;
    letterSequence = [];
    currentLetterIndex = 0;
    
    // Generate 18 random letters
    for (let i = 0; i < 18; i++) {
        letterSequence.push(letters[Math.floor(Math.random() * letters.length)]);
    }
    
    createLetterGrid();
    document.getElementById('start-letter-game').style.display = 'none';
    startLetterTimer();
}
//Shows the letters.(letterGrid), Highlights the next target letter(updateActiveLetterHighlight(),
//Listens for key presses — correct = progress, wrong = fail().handleLetterKeypress(e)
function createLetterGrid() {
    const grid = document.getElementById('letter-grid');
    grid.innerHTML = '';
    
    letterSequence.forEach((letter, index) => {
        const letterDiv = document.createElement('div');
        letterDiv.classList.add('letter');
        letterDiv.textContent = letter;
        letterDiv.dataset.index = index;
        grid.appendChild(letterDiv);
    });
    
    updateActiveLetterHighlight();
}

function updateActiveLetterHighlight() {
    document.querySelectorAll('.letter').forEach((div, index) => {
        div.classList.remove('letter-active');
        if (index === currentLetterIndex) {
            div.classList.add('letter-active');
        }
    });
}

document.addEventListener('keypress', handleLetterKeypress);

function handleLetterKeypress(e) {
    if (!letterGameActive) return;
    
    const pressedKey = e.key.toUpperCase();
    const currentLetter = letterSequence[currentLetterIndex];
    const letterDiv = document.querySelectorAll('.letter')[currentLetterIndex];
    
    if (pressedKey === currentLetter) {
        letterDiv.classList.add('done');
        currentLetterIndex++;
        
        if (currentLetterIndex >= letterSequence.length) {
            letterGameWin();
        } else {
            updateActiveLetterHighlight();
        }
    } else {
        letterDiv.classList.add('fail');
        setTimeout(() => {
            letterGameActive = false;
            alert('Wrong letter! Game Over');
            resetLetterGame();
        }, 500);
    }
}
//Starts 30-second timer, resets game if time is up or player fails, shows popup if they win.
function startLetterTimer() {
    let timeLeft = 30;
    const timerBar = document.getElementById('letter-timer-bar');
    timerBar.style.width = '100%';
    
    letterGameTimer = setInterval(() => {
        timeLeft--;
        timerBar.style.width = `${(timeLeft / 30) * 100}%`;
        
        if (timeLeft <= 0) {
            clearInterval(letterGameTimer);
            letterGameActive = false;
            alert('Time\'s up! Game Over');
            resetLetterGame();
        }
    }, 1000);
}

function resetLetterGame() {
    clearInterval(letterGameTimer);
    letterGameActive = false;
    currentLetterIndex = 0;
    document.getElementById('start-letter-game').style.display = 'inline';
    createLetterGrid();
}

function letterGameWin() {
    clearInterval(letterGameTimer);
    letterGameActive = false;
    document.getElementById('win-popup').style.display = 'block';
}
//and Restart current game after win.
function restartGame() {
    document.getElementById('win-popup').style.display = 'none';
    if (document.getElementById('number-game').style.display !== 'none') {
        startNumberGame();
    } else if (document.getElementById('letter-game').style.display !== 'none') {
        startLetterGame();
    }
}

// Check session on page load
window.addEventListener('load', () => {
    fetch('php.php?action=checkSession')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                document.getElementById('welcome-screen').style.display = 'none';
                document.getElementById('game-menu').style.display = 'block';
                document.getElementById('player-name').textContent = data.username;
            }
        });
});