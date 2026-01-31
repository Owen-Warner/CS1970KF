// Tetris Swap 2 - Game Logic
// This module contains all game logic separated from the UI for testing purposes

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const COLORS = [
    null,
    '#00f0f0', // I - Cyan
    '#0000f0', // J - Blue
    '#f0a000', // L - Orange
    '#f0f000', // O - Yellow
    '#00f000', // S - Green
    '#a000f0', // T - Purple
    '#f00000'  // Z - Red
];

const SHAPES = [
    [], // Empty placeholder
    [[1, 1, 1, 1]],           // I
    [[2, 0, 0], [2, 2, 2]],   // J
    [[0, 0, 3], [3, 3, 3]],   // L
    [[4, 4], [4, 4]],         // O
    [[0, 5, 5], [5, 5, 0]],   // S
    [[0, 6, 0], [6, 6, 6]],   // T
    [[7, 7, 0], [0, 7, 7]]    // Z
];

// Piece type swap mapping: J(2) <-> L(3), S(5) <-> Z(7)
const SWAP_MAP = {
    2: 3,  // J -> L
    3: 2,  // L -> J
    5: 7,  // S -> Z
    7: 5   // Z -> S
};

// Game state
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let paused = false;
let antiGravity = false;
let dropInterval = 1000;
let lastDrop = 0;

// Canvas references (set by initGame)
let canvas = null;
let ctx = null;
let nextCanvas = null;
let nextCtx = null;

function createBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
        board.push(new Array(COLS).fill(0));
    }
}

function createPiece(type) {
    const shape = SHAPES[type].map(row => [...row]);
    return {
        type: type,
        shape: shape,
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: antiGravity ? ROWS - shape.length : 0
    };
}

function getRandomPiece() {
    const type = Math.floor(Math.random() * 7) + 1;
    return createPiece(type);
}

function resetCurrentPiece() {
    if (currentPiece) {
        currentPiece.x = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
        currentPiece.y = antiGravity ? ROWS - currentPiece.shape.length : 0;
    }
}

// Swap piece type if it's J, L, S, or Z
function getSwappedType(type) {
    return SWAP_MAP[type] || type;
}

// Swap the current piece to its counterpart
function swapCurrentPiece() {
    if (currentPiece) {
        const newType = getSwappedType(currentPiece.type);
        if (newType !== currentPiece.type) {
            currentPiece = createPiece(newType);
        }
    }
}

// Swap all placed pieces on the board
function swapBoardPieces() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
                board[r][c] = getSwappedType(board[r][c]);
            }
        }
    }
}

function drawBlock(context, x, y, color, size = BLOCK_SIZE) {
    context.fillStyle = color;
    context.fillRect(x * size, y * size, size, size);

    // Highlight
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(x * size, y * size, size, size / 6);
    context.fillRect(x * size, y * size, size / 6, size);

    // Shadow
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(x * size, y * size + size - size / 6, size, size / 6);
    context.fillRect(x * size + size - size / 6, y * size, size / 6, size);

    // Border
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    context.strokeRect(x * size, y * size, size, size);
}

function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw kill zone line
    ctx.strokeStyle = '#f44';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#f44';
    ctx.shadowBlur = 10;
    if (antiGravity) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 1.5);
        ctx.lineTo(canvas.width, canvas.height - 1.5);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(0, 1.5);
        ctx.lineTo(canvas.width, 1.5);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    // Draw placed blocks
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
                drawBlock(ctx, c, r, COLORS[board[r][c]]);
            }
        }
    }
}

function drawPiece() {
    if (!currentPiece) return;

    // Draw ghost piece
    const ghostY = getGhostPosition();
    ctx.globalAlpha = 0.3;
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c]) {
                drawBlock(ctx, currentPiece.x + c, ghostY + r, COLORS[currentPiece.shape[r][c]]);
            }
        }
    }
    ctx.globalAlpha = 1;

    // Draw actual piece
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c]) {
                drawBlock(ctx, currentPiece.x + c, currentPiece.y + r, COLORS[currentPiece.shape[r][c]]);
            }
        }
    }
}

function drawNextPiece() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (!nextPiece) return;

    const blockSize = 25;
    const offsetX = (nextCanvas.width - nextPiece.shape[0].length * blockSize) / 2;
    const offsetY = (nextCanvas.height - nextPiece.shape.length * blockSize) / 2;

    for (let r = 0; r < nextPiece.shape.length; r++) {
        for (let c = 0; c < nextPiece.shape[r].length; c++) {
            if (nextPiece.shape[r][c]) {
                const x = offsetX / blockSize + c;
                const y = offsetY / blockSize + r;
                nextCtx.fillStyle = COLORS[nextPiece.shape[r][c]];
                nextCtx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                nextCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                nextCtx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
        }
    }
}

function getGhostPosition() {
    let ghostY = currentPiece.y;
    if (antiGravity) {
        while (isValidMove(currentPiece.shape, currentPiece.x, ghostY - 1)) {
            ghostY--;
        }
    } else {
        while (isValidMove(currentPiece.shape, currentPiece.x, ghostY + 1)) {
            ghostY++;
        }
    }
    return ghostY;
}

function isValidMove(shape, x, y) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const newX = x + c;
                const newY = y + r;

                if (newX < 0 || newX >= COLS || newY < 0 || newY >= ROWS) {
                    return false;
                }

                if (board[newY][newX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function rotatePiece() {
    const rotated = [];
    const rows = currentPiece.shape.length;
    const cols = currentPiece.shape[0].length;

    for (let c = 0; c < cols; c++) {
        rotated.push([]);
        for (let r = rows - 1; r >= 0; r--) {
            rotated[c].push(currentPiece.shape[r][c]);
        }
    }

    // Wall kick
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
        if (isValidMove(rotated, currentPiece.x + kick, currentPiece.y)) {
            currentPiece.shape = rotated;
            currentPiece.x += kick;
            return;
        }
    }
}

function movePiece(dx, dy) {
    if (isValidMove(currentPiece.shape, currentPiece.x + dx, currentPiece.y + dy)) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        return true;
    }
    return false;
}

function hardDrop() {
    if (antiGravity) {
        while (movePiece(0, -1)) {
            score += 2;
        }
    } else {
        while (movePiece(0, 1)) {
            score += 2;
        }
    }
    lockPiece();
}

function lockPiece() {
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c]) {
                const boardY = currentPiece.y + r;
                const boardX = currentPiece.x + c;

                if (boardY >= 0 && boardY < ROWS) {
                    board[boardY][boardX] = currentPiece.shape[r][c];
                }
            }
        }
    }

    clearLines();
    spawnPiece();
}

function clearLines() {
    let linesCleared = 0;

    if (antiGravity) {
        // In anti-gravity, clear lines from top and shift down
        for (let r = 0; r < ROWS; r++) {
            if (board[r].every(cell => cell !== 0)) {
                board.splice(r, 1);
                board.push(new Array(COLS).fill(0));
                linesCleared++;
                r--; // Check same row again
            }
        }
    } else {
        // Normal gravity, clear lines from bottom and shift down
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r].every(cell => cell !== 0)) {
                board.splice(r, 1);
                board.unshift(new Array(COLS).fill(0));
                linesCleared++;
                r++; // Check same row again
            }
        }
    }

    if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800];
        score += points[linesCleared] * level;
        lines += linesCleared;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        updateUI();
    }
}

function spawnPiece() {
    currentPiece = nextPiece || getRandomPiece();
    nextPiece = getRandomPiece();

    // Reset position based on current gravity mode
    currentPiece.x = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPiece.y = antiGravity ? ROWS - currentPiece.shape.length : 0;

    if (!isValidMove(currentPiece.shape, currentPiece.x, currentPiece.y)) {
        gameOver = true;
        showGameOver();
    }

    drawNextPiece();
}

function flipBoard() {
    // Flip the board vertically
    board.reverse();
}

function toggleGravity() {
    antiGravity = !antiGravity;
    flipBoard();
    swapBoardPieces();
    swapCurrentPiece();

    const indicator = document.getElementById('mode-indicator');
    if (antiGravity) {
        indicator.textContent = 'ANTI-GRAVITY MODE';
        indicator.className = 'mode-indicator anti-gravity';
    } else {
        indicator.textContent = 'GRAVITY MODE';
        indicator.className = 'mode-indicator gravity';
    }
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

function showGameOver() {
    document.getElementById('final-score').textContent = `Score: ${score}`;
    document.getElementById('game-over-overlay').classList.add('active');
}

function togglePause() {
    paused = !paused;
    document.getElementById('pause-overlay').classList.toggle('active', paused);
}

function resetGame() {
    createBoard();
    score = 0;
    level = 1;
    lines = 0;
    gameOver = false;
    paused = false;
    antiGravity = false;
    dropInterval = 1000;
    lastDrop = 0;

    document.getElementById('mode-indicator').textContent = 'GRAVITY MODE';
    document.getElementById('mode-indicator').className = 'mode-indicator gravity';
    document.getElementById('game-over-overlay').classList.remove('active');
    document.getElementById('pause-overlay').classList.remove('active');

    currentPiece = null;
    nextPiece = null;
    spawnPiece();
    updateUI();
}

function gameLoop(timestamp) {
    if (!gameOver && !paused) {
        if (timestamp - lastDrop > dropInterval) {
            const dy = antiGravity ? -1 : 1;
            if (!movePiece(0, dy)) {
                lockPiece();
            }
            lastDrop = timestamp;
        }

        drawBoard();
        drawPiece();
        updateUI();
    }

    requestAnimationFrame(gameLoop);
}

function handleKeyDown(e) {
    if (gameOver) return;

    if (e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
    }

    if (paused) return;

    switch (e.key) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            if (antiGravity) {
                if (movePiece(0, -1)) score += 1;
            } else {
                if (movePiece(0, 1)) score += 1;
            }
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ':
            e.preventDefault();
            hardDrop();
            break;
        case 'g':
        case 'G':
            toggleGravity();
            break;
    }

    drawBoard();
    drawPiece();
    updateUI();
}

function initGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('next-canvas');
    nextCtx = nextCanvas.getContext('2d');

    document.addEventListener('keydown', handleKeyDown);
    document.getElementById('restart-btn').addEventListener('click', resetGame);

    resetGame();
    requestAnimationFrame(gameLoop);
}

// Export for testing (works in both browser and Node.js/test environments)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Constants
        COLS,
        ROWS,
        BLOCK_SIZE,
        COLORS,
        SHAPES,
        SWAP_MAP,

        // State getters/setters for testing
        getBoard: () => board,
        setBoard: (b) => { board = b; },
        getCurrentPiece: () => currentPiece,
        setCurrentPiece: (p) => { currentPiece = p; },
        getNextPiece: () => nextPiece,
        setNextPiece: (p) => { nextPiece = p; },
        getScore: () => score,
        setScore: (s) => { score = s; },
        getLevel: () => level,
        setLevel: (l) => { level = l; },
        getLines: () => lines,
        setLines: (l) => { lines = l; },
        isGameOver: () => gameOver,
        setGameOver: (g) => { gameOver = g; },
        isPaused: () => paused,
        setPaused: (p) => { paused = p; },
        isAntiGravity: () => antiGravity,
        setAntiGravity: (a) => { antiGravity = a; },
        getDropInterval: () => dropInterval,
        setDropInterval: (d) => { dropInterval = d; },

        // Core game functions
        createBoard,
        createPiece,
        getRandomPiece,
        resetCurrentPiece,
        getSwappedType,
        swapCurrentPiece,
        swapBoardPieces,
        isValidMove,
        rotatePiece,
        movePiece,
        hardDrop,
        lockPiece,
        clearLines,
        spawnPiece,
        flipBoard,
        getGhostPosition,

        // For integration testing
        initGame,
        resetGame,
        handleKeyDown,
        togglePause,

        // Canvas setters for testing
        setCanvasContext: (c) => { ctx = c; },
        setNextCanvasContext: (c) => { nextCtx = c; },
        setCanvas: (c) => { canvas = c; },
        setNextCanvas: (c) => { nextCanvas = c; }
    };
}
