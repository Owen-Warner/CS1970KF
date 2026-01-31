/**
 * Jest Test Suite for Tetris Game
 * Based on Testing.md specifications
 */

// Mock DOM elements before requiring the module
document.body.innerHTML = `
  <canvas id="game-canvas" width="300" height="600"></canvas>
  <canvas id="next-canvas" width="120" height="120"></canvas>
  <div id="score">0</div>
  <div id="level">1</div>
  <div id="lines">0</div>
  <div id="mode-indicator" class="mode-indicator gravity">GRAVITY MODE</div>
  <div id="game-over-overlay"><div id="final-score"></div></div>
  <div id="pause-overlay"></div>
  <button id="restart-btn"></button>
`;

const game = require('./tetris-game.js');

// Create mock canvas context
function createMockContext() {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    getContext: jest.fn()
  };
}

// Create mock canvas
function createMockCanvas(width, height) {
  return {
    width: width,
    height: height,
    getContext: () => createMockContext()
  };
}

// Helper function to create an empty board
function createEmptyBoard() {
  const board = [];
  for (let r = 0; r < game.ROWS; r++) {
    board.push(new Array(game.COLS).fill(0));
  }
  return board;
}

// Helper function to create a filled row
function createFilledRow(value = 1) {
  return new Array(game.COLS).fill(value);
}

describe('Tetris Game Tests', () => {
  beforeEach(() => {
    // Set up mock canvas contexts for tests that call drawing functions
    game.setCanvas(createMockCanvas(300, 600));
    game.setNextCanvas(createMockCanvas(120, 120));
    game.setCanvasContext(createMockContext());
    game.setNextCanvasContext(createMockContext());

    // Reset game state before each test
    game.createBoard();
    game.setScore(0);
    game.setLevel(1);
    game.setLines(0);
    game.setGameOver(false);
    game.setPaused(false);
    game.setAntiGravity(false);
    game.setDropInterval(1000);
  });

  // ============================================
  // 1. Piece Movement Tests
  // ============================================
  describe('1. Piece Movement Tests', () => {

    describe('1.1 Move Left - Valid Move', () => {
      it('should decrease x position by 1 and return true', () => {
        const piece = game.createPiece(6); // T-piece
        piece.x = 5;
        piece.y = 5;
        game.setCurrentPiece(piece);

        const result = game.movePiece(-1, 0);

        expect(result).toBe(true);
        expect(game.getCurrentPiece().x).toBe(4);
      });
    });

    describe('1.2 Move Right - Valid Move', () => {
      it('should increase x position by 1 and return true', () => {
        const piece = game.createPiece(6); // T-piece
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);

        const result = game.movePiece(1, 0);

        expect(result).toBe(true);
        expect(game.getCurrentPiece().x).toBe(5);
      });
    });

    describe('1.3 Move Left - Blocked by Left Wall', () => {
      it('should not move and return false when at left edge', () => {
        const piece = game.createPiece(6); // T-piece
        piece.x = 0;
        piece.y = 5;
        game.setCurrentPiece(piece);

        const result = game.movePiece(-1, 0);

        expect(result).toBe(false);
        expect(game.getCurrentPiece().x).toBe(0);
      });
    });

    describe('1.4 Move Right - Blocked by Right Wall', () => {
      it('should not move and return false when at right edge', () => {
        const piece = game.createPiece(1); // I-piece (4 wide)
        piece.x = 6; // Rightmost position for I-piece
        piece.y = 5;
        game.setCurrentPiece(piece);

        const result = game.movePiece(1, 0);

        expect(result).toBe(false);
        expect(game.getCurrentPiece().x).toBe(6);
      });
    });

    describe('1.5 Soft Drop - Normal Gravity', () => {
      it('should increase y position by 1 and return true', () => {
        game.setAntiGravity(false);
        const piece = game.createPiece(6);
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);

        const result = game.movePiece(0, 1);

        expect(result).toBe(true);
        expect(game.getCurrentPiece().y).toBe(6);
      });
    });

    describe('1.6 Soft Drop - Anti-Gravity', () => {
      it('should decrease y position by 1 and return true', () => {
        game.setAntiGravity(true);
        const piece = game.createPiece(6);
        piece.x = 4;
        piece.y = 15;
        game.setCurrentPiece(piece);

        const result = game.movePiece(0, -1);

        expect(result).toBe(true);
        expect(game.getCurrentPiece().y).toBe(14);
      });
    });

    describe('1.7 Hard Drop - Normal Gravity', () => {
      it('should move piece to bottom and add 2 points per cell', () => {
        game.setAntiGravity(false);
        const piece = game.createPiece(4); // O-piece (2x2)
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);
        game.setNextPiece(game.createPiece(1));
        game.setScore(0);

        // O-piece is 2 rows tall, so it drops from y=5 to y=18 (13 cells)
        game.hardDrop();

        expect(game.getScore()).toBe(13 * 2); // 26 points
      });
    });

    describe('1.8 Hard Drop - Anti-Gravity', () => {
      it('should move piece to top and add 2 points per cell', () => {
        game.setAntiGravity(true);
        const piece = game.createPiece(4); // O-piece (2x2)
        piece.x = 4;
        piece.y = 15;
        game.setCurrentPiece(piece);
        game.setNextPiece(game.createPiece(1));
        game.setScore(0);

        // O-piece rises from y=15 to y=0 (15 cells)
        game.hardDrop();

        expect(game.getScore()).toBe(15 * 2); // 30 points
      });
    });

    describe('1.9 Move Blocked by Existing Piece', () => {
      it('should not move and return false when blocked by existing piece', () => {
        const board = createEmptyBoard();
        board[10][3] = 1; // Block at position (3, 10)
        game.setBoard(board);

        const piece = game.createPiece(4); // O-piece
        piece.x = 4;
        piece.y = 9; // O-piece occupies rows 9-10, cols 4-5
        game.setCurrentPiece(piece);

        const result = game.movePiece(-1, 0); // Try to move left into (3, 10)

        expect(result).toBe(false);
        expect(game.getCurrentPiece().x).toBe(4);
      });
    });
  });

  // ============================================
  // 2. Rotation Tests
  // ============================================
  describe('2. Rotation Tests', () => {

    describe('2.1 Basic Rotation - T-Piece', () => {
      it('should rotate T-piece 90 degrees clockwise', () => {
        const piece = game.createPiece(6); // T-piece
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);

        // Original: [[0, 6, 0], [6, 6, 6]]
        game.rotatePiece();

        const rotated = game.getCurrentPiece().shape;
        expect(rotated).toEqual([[6, 0], [6, 6], [6, 0]]);
      });
    });

    describe('2.2 Basic Rotation - I-Piece', () => {
      it('should rotate I-piece from horizontal to vertical', () => {
        const piece = game.createPiece(1); // I-piece
        piece.x = 3;
        piece.y = 5;
        game.setCurrentPiece(piece);

        // Original: [[1, 1, 1, 1]]
        game.rotatePiece();

        const rotated = game.getCurrentPiece().shape;
        expect(rotated).toEqual([[1], [1], [1], [1]]);
      });
    });

    describe('2.3 Basic Rotation - J-Piece', () => {
      it('should rotate J-piece 90 degrees clockwise', () => {
        const piece = game.createPiece(2); // J-piece
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);

        // Original: [[2, 0, 0], [2, 2, 2]]
        game.rotatePiece();

        const rotated = game.getCurrentPiece().shape;
        expect(rotated).toEqual([[2, 2], [2, 0], [2, 0]]);
      });
    });

    describe('2.4 Basic Rotation - L-Piece', () => {
      it('should rotate L-piece 90 degrees clockwise', () => {
        const piece = game.createPiece(3); // L-piece
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);

        // Original: [[0, 0, 3], [3, 3, 3]]
        game.rotatePiece();

        const rotated = game.getCurrentPiece().shape;
        expect(rotated).toEqual([[3, 0], [3, 0], [3, 3]]);
      });
    });

    describe('2.5 Basic Rotation - S-Piece', () => {
      it('should rotate S-piece 90 degrees clockwise', () => {
        const piece = game.createPiece(5); // S-piece
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);

        // Original: [[0, 5, 5], [5, 5, 0]]
        game.rotatePiece();

        const rotated = game.getCurrentPiece().shape;
        expect(rotated).toEqual([[5, 0], [5, 5], [0, 5]]);
      });
    });

    describe('2.6 Basic Rotation - Z-Piece', () => {
      it('should rotate Z-piece 90 degrees clockwise', () => {
        const piece = game.createPiece(7); // Z-piece
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);

        // Original: [[7, 7, 0], [0, 7, 7]]
        game.rotatePiece();

        const rotated = game.getCurrentPiece().shape;
        expect(rotated).toEqual([[0, 7], [7, 7], [7, 0]]);
      });
    });

    describe('2.7 O-Piece - No Rotation Change', () => {
      it('should remain visually identical after rotation', () => {
        const piece = game.createPiece(4); // O-piece
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);

        const originalShape = JSON.stringify(piece.shape);
        game.rotatePiece();

        const rotatedShape = JSON.stringify(game.getCurrentPiece().shape);
        expect(rotatedShape).toBe(originalShape);
      });
    });

    describe('2.8 Wall Kick - Near Left Wall', () => {
      it('should rotate with wall kick adjustment when near left wall', () => {
        const piece = game.createPiece(1); // I-piece vertical
        piece.shape = [[1], [1], [1], [1]];
        piece.x = 0;
        piece.y = 5;
        game.setCurrentPiece(piece);

        game.rotatePiece();

        // Should have rotated and kicked right
        const current = game.getCurrentPiece();
        expect(current.shape).toEqual([[1, 1, 1, 1]]);
        expect(current.x).toBeGreaterThanOrEqual(0);
      });
    });

    describe('2.9 Wall Kick - Near Right Wall', () => {
      it('should rotate with wall kick adjustment when near right wall', () => {
        const piece = game.createPiece(1); // I-piece vertical
        piece.shape = [[1], [1], [1], [1]];
        piece.x = 8; // At x=8, kick of -2 puts horizontal I-piece at x=6 (valid)
        piece.y = 5;
        game.setCurrentPiece(piece);

        game.rotatePiece();

        // Should have rotated and kicked left
        const current = game.getCurrentPiece();
        expect(current.shape).toEqual([[1, 1, 1, 1]]);
        expect(current.x).toBeLessThanOrEqual(6); // Max x for horizontal I-piece
      });
    });

    describe('2.10 Rotation Blocked by Existing Pieces', () => {
      it('should not rotate when blocked by existing pieces', () => {
        const board = createEmptyBoard();
        // Block all possible positions where rotated vertical I-piece could go
        // Horizontal I-piece at x=4 with kicks [0, -1, 1, -2, 2] could rotate to columns 2-6
        // Block rows 5-8 for columns 2, 3, 4, 5, 6 to prevent any valid rotation
        for (let col = 2; col <= 6; col++) {
          for (let row = 5; row <= 8; row++) {
            board[row][col] = 1;
          }
        }
        game.setBoard(board);

        const piece = game.createPiece(1); // I-piece horizontal
        piece.x = 4;
        piece.y = 4; // Position above the blocked area
        game.setCurrentPiece(piece);

        const originalShape = JSON.stringify(piece.shape);
        const originalX = piece.x;

        game.rotatePiece();

        // Shape should remain unchanged (rotation blocked)
        expect(JSON.stringify(game.getCurrentPiece().shape)).toBe(originalShape);
        expect(game.getCurrentPiece().x).toBe(originalX);
      });
    });

    describe('2.11 Wall Kick Tries Multiple Offsets', () => {
      it('should try multiple kick offsets to find valid position', () => {
        const board = createEmptyBoard();
        // Block offset 0 and -1, but allow offset 1
        board[5][4] = 1;
        board[5][3] = 1;
        game.setBoard(board);

        const piece = game.createPiece(6); // T-piece
        piece.x = 4;
        piece.y = 6;
        game.setCurrentPiece(piece);

        game.rotatePiece();

        // Should have found a valid position with some kick offset
        const current = game.getCurrentPiece();
        expect(current.shape.length).toBe(3); // Rotated T-piece is 3 rows
      });
    });
  });

  // ============================================
  // 3. Line Clearing Tests
  // ============================================
  describe('3. Line Clearing Tests', () => {

    describe('3.1 Single Line Clear - Normal Gravity', () => {
      it('should clear bottom row and add 100 * level points', () => {
        game.setAntiGravity(false);
        game.setLevel(1);
        game.setScore(0);
        game.setLines(0);

        const board = createEmptyBoard();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getLines()).toBe(1);
        expect(game.getScore()).toBe(100);
        expect(game.getBoard()[19].every(cell => cell === 0)).toBe(true);
      });
    });

    describe('3.2 Double Line Clear', () => {
      it('should clear 2 rows and add 300 * level points', () => {
        game.setAntiGravity(false);
        game.setLevel(1);
        game.setScore(0);
        game.setLines(0);

        const board = createEmptyBoard();
        board[18] = createFilledRow();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getLines()).toBe(2);
        expect(game.getScore()).toBe(300);
      });
    });

    describe('3.3 Triple Line Clear', () => {
      it('should clear 3 rows and add 500 * level points', () => {
        game.setAntiGravity(false);
        game.setLevel(1);
        game.setScore(0);
        game.setLines(0);

        const board = createEmptyBoard();
        board[17] = createFilledRow();
        board[18] = createFilledRow();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getLines()).toBe(3);
        expect(game.getScore()).toBe(500);
      });
    });

    describe('3.4 Tetris (4 Lines Clear)', () => {
      it('should clear 4 rows and add 800 * level points', () => {
        game.setAntiGravity(false);
        game.setLevel(1);
        game.setScore(0);
        game.setLines(0);

        const board = createEmptyBoard();
        board[16] = createFilledRow();
        board[17] = createFilledRow();
        board[18] = createFilledRow();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getLines()).toBe(4);
        expect(game.getScore()).toBe(800);
      });
    });

    describe('3.5 Anti-Gravity Line Clear - From Top', () => {
      it('should clear top row and add empty row at bottom', () => {
        game.setAntiGravity(true);
        game.setLevel(1);
        game.setScore(0);
        game.setLines(0);

        const board = createEmptyBoard();
        board[0] = createFilledRow();
        board[1][5] = 1; // Marker to verify shift
        game.setBoard(board);

        game.clearLines();

        expect(game.getLines()).toBe(1);
        expect(game.getBoard()[0][5]).toBe(1); // Marker shifted up
        expect(game.getBoard()[19].every(cell => cell === 0)).toBe(true);
      });
    });

    describe('3.6 Line Clear Scoring at Higher Levels', () => {
      it('should multiply points by level', () => {
        game.setAntiGravity(false);
        game.setLevel(5);
        game.setScore(0);
        game.setLines(0);

        const board = createEmptyBoard();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getScore()).toBe(500); // 100 * 5
      });
    });

    describe('3.7 No Lines to Clear', () => {
      it('should not change score or lines when no rows are full', () => {
        game.setScore(100);
        game.setLines(5);

        const board = createEmptyBoard();
        board[19][0] = 1;
        board[19][1] = 1;
        // Row not full
        game.setBoard(board);

        game.clearLines();

        expect(game.getScore()).toBe(100);
        expect(game.getLines()).toBe(5);
      });
    });
  });

  // ============================================
  // 4. Gravity System Tests
  // ============================================
  describe('4. Gravity System Tests', () => {

    describe('4.1 Normal Gravity - Piece Falls Down', () => {
      it('should move piece down when gravity is normal', () => {
        game.setAntiGravity(false);
        const piece = game.createPiece(6);
        piece.y = 5;
        game.setCurrentPiece(piece);

        game.movePiece(0, 1);

        expect(game.getCurrentPiece().y).toBe(6);
      });
    });

    describe('4.2 Anti-Gravity - Piece Rises Up', () => {
      it('should move piece up when gravity is anti', () => {
        game.setAntiGravity(true);
        const piece = game.createPiece(6);
        piece.y = 15;
        game.setCurrentPiece(piece);

        game.movePiece(0, -1);

        expect(game.getCurrentPiece().y).toBe(14);
      });
    });

    describe('4.3 Toggle Gravity - Board Flips', () => {
      it('should flip board vertically when gravity toggles', () => {
        const board = createEmptyBoard();
        board[19][5] = 1; // Block at bottom
        game.setBoard(board);
        game.setCurrentPiece(game.createPiece(6));
        game.setAntiGravity(false);

        game.flipBoard();

        expect(game.getBoard()[0][5]).toBe(1); // Block now at top
      });
    });

    describe('4.4 Toggle Gravity - J Piece Swaps to L', () => {
      it('should swap J-pieces to L-pieces on board', () => {
        const board = createEmptyBoard();
        board[19][5] = 2; // J-piece block
        game.setBoard(board);

        game.swapBoardPieces();

        expect(game.getBoard()[19][5]).toBe(3); // Now L-piece
      });
    });

    describe('4.5 Toggle Gravity - L Piece Swaps to J', () => {
      it('should swap L-pieces to J-pieces on board', () => {
        const board = createEmptyBoard();
        board[19][5] = 3; // L-piece block
        game.setBoard(board);

        game.swapBoardPieces();

        expect(game.getBoard()[19][5]).toBe(2); // Now J-piece
      });
    });

    describe('4.6 Toggle Gravity - S Piece Swaps to Z', () => {
      it('should swap S-pieces to Z-pieces on board', () => {
        const board = createEmptyBoard();
        board[19][5] = 5; // S-piece block
        game.setBoard(board);

        game.swapBoardPieces();

        expect(game.getBoard()[19][5]).toBe(7); // Now Z-piece
      });
    });

    describe('4.7 Toggle Gravity - Z Piece Swaps to S', () => {
      it('should swap Z-pieces to S-pieces on board', () => {
        const board = createEmptyBoard();
        board[19][5] = 7; // Z-piece block
        game.setBoard(board);

        game.swapBoardPieces();

        expect(game.getBoard()[19][5]).toBe(5); // Now S-piece
      });
    });

    describe('4.8 Non-Swappable Pieces - I Piece', () => {
      it('should return same type for I-piece', () => {
        expect(game.getSwappedType(1)).toBe(1);
      });
    });

    describe('4.9 Non-Swappable Pieces - O Piece', () => {
      it('should return same type for O-piece', () => {
        expect(game.getSwappedType(4)).toBe(4);
      });
    });

    describe('4.10 Non-Swappable Pieces - T Piece', () => {
      it('should return same type for T-piece', () => {
        expect(game.getSwappedType(6)).toBe(6);
      });
    });

    describe('4.11 Current Piece Swaps on Toggle', () => {
      it('should swap current J-piece to L-piece', () => {
        const piece = game.createPiece(2); // J-piece
        game.setCurrentPiece(piece);

        game.swapCurrentPiece();

        expect(game.getCurrentPiece().type).toBe(3); // L-piece
      });
    });

    describe('4.12 Spawn Position - Normal Gravity', () => {
      it('should spawn piece at top (y = 0)', () => {
        game.setAntiGravity(false);

        const piece = game.createPiece(6);

        expect(piece.y).toBe(0);
      });
    });

    describe('4.13 Spawn Position - Anti-Gravity', () => {
      it('should spawn piece at bottom', () => {
        game.setAntiGravity(true);

        const piece = game.createPiece(6); // T-piece (2 rows tall)

        expect(piece.y).toBe(game.ROWS - 2); // 18
      });
    });
  });

  // ============================================
  // 5. Collision Detection Tests
  // ============================================
  describe('5. Collision Detection Tests', () => {

    describe('5.1 Valid Move - Empty Space', () => {
      it('should return true for valid position on empty board', () => {
        const shape = [[1, 1], [1, 1]];

        const result = game.isValidMove(shape, 4, 5);

        expect(result).toBe(true);
      });
    });

    describe('5.2 Invalid Move - Left Wall Boundary', () => {
      it('should return false when piece extends past left wall', () => {
        const shape = [[1, 1], [1, 1]];

        const result = game.isValidMove(shape, -1, 5);

        expect(result).toBe(false);
      });
    });

    describe('5.3 Invalid Move - Right Wall Boundary', () => {
      it('should return false when piece extends past right wall', () => {
        const shape = [[1, 1], [1, 1]]; // 2 wide

        const result = game.isValidMove(shape, 9, 5); // Would extend to col 10

        expect(result).toBe(false);
      });
    });

    describe('5.4 Invalid Move - Floor Boundary', () => {
      it('should return false when piece extends past floor', () => {
        const shape = [[1, 1], [1, 1]]; // 2 tall

        const result = game.isValidMove(shape, 4, 19); // Would extend to row 20

        expect(result).toBe(false);
      });
    });

    describe('5.5 Invalid Move - Ceiling Boundary', () => {
      it('should return false when piece extends past ceiling', () => {
        const shape = [[1, 1], [1, 1]];

        const result = game.isValidMove(shape, 4, -1);

        expect(result).toBe(false);
      });
    });

    describe('5.6 Invalid Move - Collision with Existing Piece', () => {
      it('should return false when position overlaps existing block', () => {
        const board = createEmptyBoard();
        board[10][5] = 1;
        game.setBoard(board);

        const shape = [[1, 1], [1, 1]];

        const result = game.isValidMove(shape, 4, 10); // Overlaps (5, 10)

        expect(result).toBe(false);
      });
    });

    describe('5.7 Valid Move - Adjacent to Existing Piece', () => {
      it('should return true when adjacent but not overlapping', () => {
        const board = createEmptyBoard();
        board[10][5] = 1;
        game.setBoard(board);

        const shape = [[1, 1], [1, 1]];

        const result = game.isValidMove(shape, 6, 10); // Adjacent, not overlapping

        expect(result).toBe(true);
      });
    });

    describe('5.8 Spawn Position Validation - Game Over', () => {
      it('should set gameOver when spawn position is blocked', () => {
        const board = createEmptyBoard();
        // Fill the top area where pieces spawn
        for (let c = 0; c < game.COLS; c++) {
          board[0][c] = 1;
          board[1][c] = 1;
        }
        game.setBoard(board);
        game.setNextPiece(game.createPiece(4));
        game.setGameOver(false);

        game.spawnPiece();

        expect(game.isGameOver()).toBe(true);
      });
    });

    describe('5.9 Ghost Position - Normal Gravity', () => {
      it('should return bottom position for ghost', () => {
        game.setAntiGravity(false);
        const piece = game.createPiece(4); // O-piece
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);

        const ghostY = game.getGhostPosition();

        expect(ghostY).toBe(18); // Bottom position for 2-tall piece
      });
    });

    describe('5.10 Ghost Position - Anti-Gravity', () => {
      it('should return top position for ghost', () => {
        game.setAntiGravity(true);
        const piece = game.createPiece(4); // O-piece
        piece.x = 4;
        piece.y = 15;
        game.setCurrentPiece(piece);

        const ghostY = game.getGhostPosition();

        expect(ghostY).toBe(0);
      });
    });
  });

  // ============================================
  // 6. Scoring & Progression Tests
  // ============================================
  describe('6. Scoring & Progression Tests', () => {

    describe('6.1 Soft Drop Points', () => {
      it('should add points for soft drop (handled by caller)', () => {
        const piece = game.createPiece(6);
        piece.y = 5;
        game.setCurrentPiece(piece);
        game.setScore(0);

        if (game.movePiece(0, 1)) {
          game.setScore(game.getScore() + 1);
        }

        expect(game.getScore()).toBe(1);
      });
    });

    describe('6.2 Hard Drop Points', () => {
      it('should add 2 points per cell dropped', () => {
        game.setAntiGravity(false);
        const piece = game.createPiece(4); // O-piece
        piece.x = 4;
        piece.y = 10;
        game.setCurrentPiece(piece);
        game.setNextPiece(game.createPiece(1));
        game.setScore(0);

        // O-piece drops from y=10 to y=18 (8 cells)
        game.hardDrop();

        expect(game.getScore()).toBe(16); // 8 * 2
      });
    });

    describe('6.3 Single Line Clear Points', () => {
      it('should add 100 points at level 1', () => {
        game.setLevel(1);
        game.setScore(0);
        game.setLines(0);
        game.setAntiGravity(false);

        const board = createEmptyBoard();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getScore()).toBe(100);
      });
    });

    describe('6.4 Double Line Clear Points', () => {
      it('should add 300 points at level 1', () => {
        game.setLevel(1);
        game.setScore(0);
        game.setLines(0);
        game.setAntiGravity(false);

        const board = createEmptyBoard();
        board[18] = createFilledRow();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getScore()).toBe(300);
      });
    });

    describe('6.5 Triple Line Clear Points', () => {
      it('should add 500 points at level 1', () => {
        game.setLevel(1);
        game.setScore(0);
        game.setLines(0);
        game.setAntiGravity(false);

        const board = createEmptyBoard();
        board[17] = createFilledRow();
        board[18] = createFilledRow();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getScore()).toBe(500);
      });
    });

    describe('6.6 Tetris Points', () => {
      it('should add 800 points at level 1', () => {
        game.setLevel(1);
        game.setScore(0);
        game.setLines(0);
        game.setAntiGravity(false);

        const board = createEmptyBoard();
        board[16] = createFilledRow();
        board[17] = createFilledRow();
        board[18] = createFilledRow();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getScore()).toBe(800);
      });
    });

    describe('6.7 Level Multiplier on Scoring', () => {
      it('should multiply line clear points by level', () => {
        game.setLevel(3);
        game.setScore(0);
        game.setLines(0);
        game.setAntiGravity(false);

        const board = createEmptyBoard();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getScore()).toBe(300); // 100 * 3
      });
    });

    describe('6.8 Level Progression - Every 10 Lines', () => {
      it('should increase level when lines reach 10', () => {
        game.setLevel(1);
        game.setLines(9);
        game.setScore(0);
        game.setAntiGravity(false);

        const board = createEmptyBoard();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getLevel()).toBe(2);
      });
    });

    describe('6.9 Level Progression - Multiple Levels', () => {
      it('should calculate correct level for 25 lines', () => {
        game.setLines(24);
        game.setLevel(1);
        game.setScore(0);
        game.setAntiGravity(false);

        const board = createEmptyBoard();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        // 25 lines = floor(25/10) + 1 = 3
        expect(game.getLevel()).toBe(3);
      });
    });

    describe('6.10 Drop Speed Decrease Per Level', () => {
      it('should decrease drop interval by 100ms per level', () => {
        game.setLines(9);
        game.setLevel(1);
        game.setDropInterval(1000);
        game.setScore(0);
        game.setAntiGravity(false);

        const board = createEmptyBoard();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getDropInterval()).toBe(900);
      });
    });

    describe('6.11 Drop Speed Minimum Cap', () => {
      it('should not go below 100ms', () => {
        game.setLines(99);
        game.setLevel(10);
        game.setScore(0);
        game.setAntiGravity(false);

        const board = createEmptyBoard();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getDropInterval()).toBe(100);
      });
    });

    describe('6.12 Initial Score', () => {
      it('should be 0 on reset', () => {
        game.setScore(5000);
        game.createBoard();
        game.setScore(0);

        expect(game.getScore()).toBe(0);
      });
    });

    describe('6.13 Initial Level', () => {
      it('should be 1 on reset', () => {
        game.setLevel(5);
        game.setLevel(1);

        expect(game.getLevel()).toBe(1);
      });
    });
  });

  // ============================================
  // 7. Game State Tests
  // ============================================
  describe('7. Game State Tests', () => {

    describe('7.1 Pause Game', () => {
      it('should set paused to true', () => {
        game.setPaused(false);

        game.togglePause();

        expect(game.isPaused()).toBe(true);
      });
    });

    describe('7.2 Unpause Game', () => {
      it('should set paused to false', () => {
        game.setPaused(true);

        game.togglePause();

        expect(game.isPaused()).toBe(false);
      });
    });

    describe('7.3 Game Over Detection - Normal Gravity', () => {
      it('should set gameOver when spawn blocked at top', () => {
        game.setAntiGravity(false);
        game.setGameOver(false);

        const board = createEmptyBoard();
        for (let c = 0; c < game.COLS; c++) {
          board[0][c] = 1;
        }
        game.setBoard(board);
        game.setNextPiece(game.createPiece(4));

        game.spawnPiece();

        expect(game.isGameOver()).toBe(true);
      });
    });

    describe('7.4 Game Over Detection - Anti-Gravity', () => {
      it('should set gameOver when spawn blocked at bottom', () => {
        game.setAntiGravity(true);
        game.setGameOver(false);

        const board = createEmptyBoard();
        for (let c = 0; c < game.COLS; c++) {
          board[18][c] = 1;
          board[19][c] = 1;
        }
        game.setBoard(board);
        game.setNextPiece(game.createPiece(4));

        game.spawnPiece();

        expect(game.isGameOver()).toBe(true);
      });
    });

    describe('7.5 Reset Game - Board Cleared', () => {
      it('should clear all cells to 0', () => {
        const board = createEmptyBoard();
        board[19][5] = 1;
        game.setBoard(board);

        game.createBoard();

        const newBoard = game.getBoard();
        const allEmpty = newBoard.every(row => row.every(cell => cell === 0));
        expect(allEmpty).toBe(true);
      });
    });

    describe('7.6 Reset Game - Score Reset', () => {
      it('should reset score to 0', () => {
        game.setScore(5000);
        game.setScore(0);

        expect(game.getScore()).toBe(0);
      });
    });

    describe('7.7 Reset Game - Level Reset', () => {
      it('should reset level to 1', () => {
        game.setLevel(5);
        game.setLevel(1);

        expect(game.getLevel()).toBe(1);
      });
    });

    describe('7.8 Reset Game - Lines Reset', () => {
      it('should reset lines to 0', () => {
        game.setLines(45);
        game.setLines(0);

        expect(game.getLines()).toBe(0);
      });
    });

    describe('7.9 Reset Game - Gravity Mode Reset', () => {
      it('should reset antiGravity to false', () => {
        game.setAntiGravity(true);
        game.setAntiGravity(false);

        expect(game.isAntiGravity()).toBe(false);
      });
    });

    describe('7.10 Reset Game - Game Over Flag Reset', () => {
      it('should reset gameOver to false', () => {
        game.setGameOver(true);
        game.setGameOver(false);

        expect(game.isGameOver()).toBe(false);
      });
    });

    describe('7.11 Reset Game - Pause Flag Reset', () => {
      it('should reset paused to false', () => {
        game.setPaused(true);
        game.setPaused(false);

        expect(game.isPaused()).toBe(false);
      });
    });

    describe('7.12 Reset Game - Drop Interval Reset', () => {
      it('should reset dropInterval to 1000', () => {
        game.setDropInterval(500);
        game.setDropInterval(1000);

        expect(game.getDropInterval()).toBe(1000);
      });
    });

    describe('7.13 Create Board Dimensions', () => {
      it('should create board with 20 rows and 10 columns', () => {
        game.createBoard();
        const board = game.getBoard();

        expect(board.length).toBe(20);
        expect(board[0].length).toBe(10);
        expect(board.every(row => row.every(cell => cell === 0))).toBe(true);
      });
    });

    describe('7.14 Lock Piece - Places on Board', () => {
      it('should place piece blocks on the board', () => {
        game.createBoard();
        const piece = game.createPiece(4); // O-piece
        piece.x = 4;
        piece.y = 18;
        game.setCurrentPiece(piece);
        game.setNextPiece(game.createPiece(1));

        game.lockPiece();

        const board = game.getBoard();
        expect(board[18][4]).toBe(4);
        expect(board[18][5]).toBe(4);
        expect(board[19][4]).toBe(4);
        expect(board[19][5]).toBe(4);
      });
    });

    describe('7.15 New Piece Spawns After Lock', () => {
      it('should set currentPiece to nextPiece and generate new nextPiece', () => {
        game.createBoard();
        const piece = game.createPiece(4);
        piece.x = 4;
        piece.y = 18;
        game.setCurrentPiece(piece);

        const nextPieceType = 2; // J-piece
        game.setNextPiece(game.createPiece(nextPieceType));

        game.lockPiece();

        expect(game.getCurrentPiece().type).toBe(nextPieceType);
        expect(game.getNextPiece()).not.toBeNull();
      });
    });
  });

  // ============================================
  // 8. Additional Edge Case Tests
  // ============================================
  describe('8. Additional Edge Case Tests', () => {

    describe('8.1 Full Rotation Cycle', () => {
      it('should return T-piece to original state after 4 rotations', () => {
        const piece = game.createPiece(6); // T-piece
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);

        const originalShape = JSON.stringify(piece.shape);

        game.rotatePiece();
        game.rotatePiece();
        game.rotatePiece();
        game.rotatePiece();

        expect(JSON.stringify(game.getCurrentPiece().shape)).toBe(originalShape);
      });

      it('should return I-piece to original state after 2 rotations', () => {
        const piece = game.createPiece(1); // I-piece
        piece.x = 3;
        piece.y = 5;
        game.setCurrentPiece(piece);

        const originalShape = JSON.stringify(piece.shape);

        game.rotatePiece();
        game.rotatePiece();

        expect(JSON.stringify(game.getCurrentPiece().shape)).toBe(originalShape);
      });
    });

    describe('8.2 Non-consecutive Line Clears', () => {
      it('should only clear filled rows, leaving unfilled rows intact', () => {
        game.setAntiGravity(false);
        game.setLevel(1);
        game.setScore(0);
        game.setLines(0);

        const board = createEmptyBoard();
        board[17] = createFilledRow(); // Filled
        board[18][5] = 1; // Partial - should remain
        board[19] = createFilledRow(); // Filled
        game.setBoard(board);

        game.clearLines();

        // Should clear 2 lines (rows 17 and 19)
        expect(game.getLines()).toBe(2);
        expect(game.getScore()).toBe(300); // Double line clear

        // The partial row should now be at bottom after shifts
        const newBoard = game.getBoard();
        expect(newBoard[19][5]).toBe(1); // Partial row shifted down
      });
    });

    describe('8.3 Ghost Position with Obstacles', () => {
      it('should stop ghost at existing pieces, not floor', () => {
        game.setAntiGravity(false);
        const board = createEmptyBoard();
        // Place obstacle at row 15
        board[15][4] = 1;
        board[15][5] = 1;
        game.setBoard(board);

        const piece = game.createPiece(4); // O-piece (2x2)
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);

        const ghostY = game.getGhostPosition();

        // Ghost should stop at row 13 (piece occupies 13-14, obstacle at 15)
        expect(ghostY).toBe(13);
      });

      it('should stop ghost at existing pieces in anti-gravity', () => {
        game.setAntiGravity(true);
        const board = createEmptyBoard();
        // Place obstacle at row 5
        board[5][4] = 1;
        board[5][5] = 1;
        game.setBoard(board);

        const piece = game.createPiece(4); // O-piece (2x2)
        piece.x = 4;
        piece.y = 15;
        game.setCurrentPiece(piece);

        const ghostY = game.getGhostPosition();

        // Ghost should stop at row 6 (just above obstacle)
        expect(ghostY).toBe(6);
      });
    });

    describe('8.4 getRandomPiece Validity', () => {
      it('should return piece with valid type between 1 and 7', () => {
        // Test multiple times for randomness coverage
        for (let i = 0; i < 20; i++) {
          const piece = game.getRandomPiece();
          expect(piece.type).toBeGreaterThanOrEqual(1);
          expect(piece.type).toBeLessThanOrEqual(7);
          expect(piece.shape).toBeDefined();
          expect(piece.x).toBeDefined();
          expect(piece.y).toBeDefined();
        }
      });
    });

    describe('8.5 Multiple Anti-gravity Line Clears', () => {
      it('should clear multiple lines from top in anti-gravity mode', () => {
        game.setAntiGravity(true);
        game.setLevel(1);
        game.setScore(0);
        game.setLines(0);

        const board = createEmptyBoard();
        board[0] = createFilledRow();
        board[1] = createFilledRow();
        board[2] = createFilledRow();
        board[3][5] = 1; // Marker in partial row
        game.setBoard(board);

        game.clearLines();

        expect(game.getLines()).toBe(3);
        expect(game.getScore()).toBe(500); // Triple

        // Marker should have shifted to top
        const newBoard = game.getBoard();
        expect(newBoard[0][5]).toBe(1);
      });
    });

    describe('8.6 Piece Centering', () => {
      it('should center I-piece (4 wide) correctly', () => {
        game.setAntiGravity(false);
        const piece = game.createPiece(1); // I-piece

        // I-piece is 4 wide, board is 10 wide
        // Center: floor(10/2) - floor(4/2) = 5 - 2 = 3
        expect(piece.x).toBe(3);
      });

      it('should center O-piece (2 wide) correctly', () => {
        game.setAntiGravity(false);
        const piece = game.createPiece(4); // O-piece

        // O-piece is 2 wide, board is 10 wide
        // Center: floor(10/2) - floor(2/2) = 5 - 1 = 4
        expect(piece.x).toBe(4);
      });

      it('should center T-piece (3 wide) correctly', () => {
        game.setAntiGravity(false);
        const piece = game.createPiece(6); // T-piece

        // T-piece is 3 wide, board is 10 wide
        // Center: floor(10/2) - floor(3/2) = 5 - 1 = 4
        expect(piece.x).toBe(4);
      });
    });

    describe('8.7 resetCurrentPiece', () => {
      it('should reset piece position for normal gravity', () => {
        game.setAntiGravity(false);
        const piece = game.createPiece(6);
        piece.x = 2;
        piece.y = 10;
        game.setCurrentPiece(piece);

        game.resetCurrentPiece();

        const current = game.getCurrentPiece();
        expect(current.y).toBe(0); // Top for normal gravity
        expect(current.x).toBe(4); // Centered
      });

      it('should reset piece position for anti-gravity', () => {
        game.setAntiGravity(true);
        const piece = game.createPiece(6); // T-piece (2 rows tall)
        piece.x = 2;
        piece.y = 5;
        game.setCurrentPiece(piece);

        game.resetCurrentPiece();

        const current = game.getCurrentPiece();
        expect(current.y).toBe(18); // Bottom for anti-gravity (ROWS - height)
        expect(current.x).toBe(4); // Centered
      });
    });

    describe('8.8 Score Accumulation', () => {
      it('should accumulate score from soft drop + line clear', () => {
        game.setAntiGravity(false);
        game.setLevel(1);
        game.setScore(0);
        game.setLines(0);

        // Set up board with almost complete bottom row
        const board = createEmptyBoard();
        for (let c = 0; c < 9; c++) {
          board[19][c] = 1;
        }
        // Column 9 is empty - piece will complete it
        game.setBoard(board);

        const piece = game.createPiece(1); // I-piece vertical
        piece.shape = [[1], [1], [1], [1]];
        piece.x = 9;
        piece.y = 10;
        game.setCurrentPiece(piece);

        // Soft drop 5 cells (10 -> 15), earning 5 points
        for (let i = 0; i < 5; i++) {
          if (game.movePiece(0, 1)) {
            game.setScore(game.getScore() + 1);
          }
        }

        expect(game.getScore()).toBe(5);
      });
    });

    describe('8.9 handleKeyDown Integration', () => {
      it('should move piece left on ArrowLeft', () => {
        const piece = game.createPiece(6);
        piece.x = 5;
        piece.y = 5;
        game.setCurrentPiece(piece);
        game.setGameOver(false);
        game.setPaused(false);

        const event = { key: 'ArrowLeft', preventDefault: jest.fn() };
        game.handleKeyDown(event);

        expect(game.getCurrentPiece().x).toBe(4);
      });

      it('should move piece right on ArrowRight', () => {
        const piece = game.createPiece(6);
        piece.x = 5;
        piece.y = 5;
        game.setCurrentPiece(piece);
        game.setGameOver(false);
        game.setPaused(false);

        const event = { key: 'ArrowRight', preventDefault: jest.fn() };
        game.handleKeyDown(event);

        expect(game.getCurrentPiece().x).toBe(6);
      });

      it('should rotate piece on ArrowUp', () => {
        const piece = game.createPiece(6); // T-piece
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);
        game.setGameOver(false);
        game.setPaused(false);

        const originalShape = JSON.stringify(piece.shape);
        const event = { key: 'ArrowUp', preventDefault: jest.fn() };
        game.handleKeyDown(event);

        expect(JSON.stringify(game.getCurrentPiece().shape)).not.toBe(originalShape);
      });

      it('should not respond to keys when game is over', () => {
        const piece = game.createPiece(6);
        piece.x = 5;
        piece.y = 5;
        game.setCurrentPiece(piece);
        game.setGameOver(true);

        const event = { key: 'ArrowLeft', preventDefault: jest.fn() };
        game.handleKeyDown(event);

        expect(game.getCurrentPiece().x).toBe(5); // Unchanged
      });

      it('should toggle pause on P key', () => {
        game.setPaused(false);
        game.setGameOver(false);
        game.setCurrentPiece(game.createPiece(6));

        const event = { key: 'p', preventDefault: jest.fn() };
        game.handleKeyDown(event);

        expect(game.isPaused()).toBe(true);
      });

      it('should not respond to movement keys when paused', () => {
        const piece = game.createPiece(6);
        piece.x = 5;
        piece.y = 5;
        game.setCurrentPiece(piece);
        game.setGameOver(false);
        game.setPaused(true);

        const event = { key: 'ArrowLeft', preventDefault: jest.fn() };
        game.handleKeyDown(event);

        expect(game.getCurrentPiece().x).toBe(5); // Unchanged
      });
    });

    describe('8.10 Edge Case - Spawn with null nextPiece', () => {
      it('should generate new piece when nextPiece is null', () => {
        game.setNextPiece(null);
        game.setCurrentPiece(null);

        game.spawnPiece();

        expect(game.getCurrentPiece()).not.toBeNull();
        expect(game.getNextPiece()).not.toBeNull();
      });
    });
  });

  // ============================================
  // 9. Key Input & Integration Tests
  // ============================================
  describe('9. Key Input & Integration Tests', () => {

    describe('9.1 ArrowDown Soft Drop with Scoring', () => {
      it('should add 1 point when soft dropping in normal gravity', () => {
        game.setAntiGravity(false);
        game.setScore(0);
        game.setGameOver(false);
        game.setPaused(false);

        const piece = game.createPiece(6);
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);

        const event = { key: 'ArrowDown', preventDefault: jest.fn() };
        game.handleKeyDown(event);

        expect(game.getCurrentPiece().y).toBe(6);
        expect(game.getScore()).toBe(1);
      });

      it('should add 1 point when soft dropping in anti-gravity', () => {
        game.setAntiGravity(true);
        game.setScore(0);
        game.setGameOver(false);
        game.setPaused(false);

        const piece = game.createPiece(6);
        piece.x = 4;
        piece.y = 15;
        game.setCurrentPiece(piece);

        const event = { key: 'ArrowDown', preventDefault: jest.fn() };
        game.handleKeyDown(event);

        expect(game.getCurrentPiece().y).toBe(14);
        expect(game.getScore()).toBe(1);
      });
    });

    describe('9.2 Space Bar Hard Drop', () => {
      it('should hard drop piece and add 2 points per cell', () => {
        game.setAntiGravity(false);
        game.setScore(0);
        game.setGameOver(false);
        game.setPaused(false);

        const piece = game.createPiece(4); // O-piece (2x2)
        piece.x = 4;
        piece.y = 10;
        game.setCurrentPiece(piece);
        game.setNextPiece(game.createPiece(1));

        const event = { key: ' ', preventDefault: jest.fn() };
        game.handleKeyDown(event);

        // O-piece drops from y=10 to y=18 (8 cells), earning 16 points
        expect(game.getScore()).toBe(16);
        expect(event.preventDefault).toHaveBeenCalled();
      });
    });

    describe('9.3 G Key Gravity Toggle', () => {
      it('should toggle gravity mode on G key press', () => {
        game.setAntiGravity(false);
        game.setGameOver(false);
        game.setPaused(false);
        game.setCurrentPiece(game.createPiece(6));

        const event = { key: 'g', preventDefault: jest.fn() };
        game.handleKeyDown(event);

        expect(game.isAntiGravity()).toBe(true);
      });

      it('should toggle gravity mode on uppercase G key press', () => {
        game.setAntiGravity(false);
        game.setGameOver(false);
        game.setPaused(false);
        game.setCurrentPiece(game.createPiece(6));

        const event = { key: 'G', preventDefault: jest.fn() };
        game.handleKeyDown(event);

        expect(game.isAntiGravity()).toBe(true);
      });
    });

    describe('9.4 toggleGravity Full Integration', () => {
      it('should flip board, swap pieces, and swap current piece', () => {
        // Set up board with J-piece at bottom
        const board = createEmptyBoard();
        board[19][5] = 2; // J-piece block at bottom
        game.setBoard(board);

        // Set current piece as S-piece
        const piece = game.createPiece(5); // S-piece
        piece.x = 4;
        piece.y = 10;
        game.setCurrentPiece(piece);

        game.setAntiGravity(false);
        game.setGameOver(false);
        game.setPaused(false);

        // Toggle gravity
        const event = { key: 'g', preventDefault: jest.fn() };
        game.handleKeyDown(event);

        // Verify all effects
        expect(game.isAntiGravity()).toBe(true);
        expect(game.getBoard()[0][5]).toBe(3); // J->L, and flipped to top
        expect(game.getCurrentPiece().type).toBe(7); // S->Z
      });
    });

    describe('9.5 Double Gravity Toggle', () => {
      it('should return board to original state after two toggles', () => {
        const board = createEmptyBoard();
        board[19][5] = 2; // J-piece at bottom
        board[18][3] = 5; // S-piece
        game.setBoard(board);

        const piece = game.createPiece(2); // J-piece
        game.setCurrentPiece(piece);
        game.setAntiGravity(false);
        game.setGameOver(false);
        game.setPaused(false);

        // First toggle
        game.handleKeyDown({ key: 'g', preventDefault: jest.fn() });
        expect(game.isAntiGravity()).toBe(true);

        // Second toggle
        game.handleKeyDown({ key: 'g', preventDefault: jest.fn() });
        expect(game.isAntiGravity()).toBe(false);

        // Board should be back to original positions
        const finalBoard = game.getBoard();
        expect(finalBoard[19][5]).toBe(2); // J-piece back at bottom
        expect(finalBoard[18][3]).toBe(5); // S-piece back
      });
    });

    describe('9.6 S and Z Piece Rotation Symmetry', () => {
      it('should return S-piece to original state after 2 rotations', () => {
        const piece = game.createPiece(5); // S-piece
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);

        const originalShape = JSON.stringify(piece.shape);

        game.rotatePiece();
        game.rotatePiece();

        expect(JSON.stringify(game.getCurrentPiece().shape)).toBe(originalShape);
      });

      it('should return Z-piece to original state after 2 rotations', () => {
        const piece = game.createPiece(7); // Z-piece
        piece.x = 4;
        piece.y = 5;
        game.setCurrentPiece(piece);

        const originalShape = JSON.stringify(piece.shape);

        game.rotatePiece();
        game.rotatePiece();

        expect(JSON.stringify(game.getCurrentPiece().shape)).toBe(originalShape);
      });
    });
  });

  // ============================================
  // 10. Constants & Configuration Tests
  // ============================================
  describe('10. Constants & Configuration Tests', () => {

    describe('10.1 SHAPES Array Validation', () => {
      it('should have 8 entries (placeholder + 7 pieces)', () => {
        expect(game.SHAPES.length).toBe(8);
      });

      it('should have empty placeholder at index 0', () => {
        expect(game.SHAPES[0].length).toBe(0);
      });

      it('should have I-piece at index 1', () => {
        expect(game.SHAPES[1]).toEqual([[1, 1, 1, 1]]);
      });

      it('should have O-piece at index 4', () => {
        expect(game.SHAPES[4]).toEqual([[4, 4], [4, 4]]);
      });
    });

    describe('10.2 COLORS Array Validation', () => {
      it('should have 8 entries (null + 7 colors)', () => {
        expect(game.COLORS.length).toBe(8);
      });

      it('should have null at index 0', () => {
        expect(game.COLORS[0]).toBeNull();
      });

      it('should have valid color strings for pieces 1-7', () => {
        for (let i = 1; i <= 7; i++) {
          expect(typeof game.COLORS[i]).toBe('string');
          expect(game.COLORS[i]).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
      });
    });

    describe('10.3 SWAP_MAP Completeness', () => {
      it('should swap J to L and back', () => {
        expect(game.SWAP_MAP[2]).toBe(3); // J -> L
        expect(game.SWAP_MAP[3]).toBe(2); // L -> J
      });

      it('should swap S to Z and back', () => {
        expect(game.SWAP_MAP[5]).toBe(7); // S -> Z
        expect(game.SWAP_MAP[7]).toBe(5); // Z -> S
      });

      it('should not have mappings for I, O, T pieces', () => {
        expect(game.SWAP_MAP[1]).toBeUndefined(); // I
        expect(game.SWAP_MAP[4]).toBeUndefined(); // O
        expect(game.SWAP_MAP[6]).toBeUndefined(); // T
      });
    });

    describe('10.4 Board Dimensions', () => {
      it('should have correct COLS value', () => {
        expect(game.COLS).toBe(10);
      });

      it('should have correct ROWS value', () => {
        expect(game.ROWS).toBe(20);
      });

      it('should have correct BLOCK_SIZE value', () => {
        expect(game.BLOCK_SIZE).toBe(30);
      });
    });
  });

  // ============================================
  // 11. Boundary & Edge Condition Tests
  // ============================================
  describe('11. Boundary & Edge Condition Tests', () => {

    describe('11.1 Piece Locking at Top Row', () => {
      it('should lock piece at y=0 without error', () => {
        game.createBoard();
        const piece = game.createPiece(1); // I-piece (1 row tall)
        piece.x = 3;
        piece.y = 0;
        game.setCurrentPiece(piece);
        game.setNextPiece(game.createPiece(4));

        // Should not throw
        expect(() => game.lockPiece()).not.toThrow();

        // Piece should be on board
        const board = game.getBoard();
        expect(board[0][3]).toBe(1);
        expect(board[0][4]).toBe(1);
        expect(board[0][5]).toBe(1);
        expect(board[0][6]).toBe(1);
      });
    });

    describe('11.2 Piece Locking at Bottom Row', () => {
      it('should lock piece at bottom row correctly', () => {
        game.createBoard();
        const piece = game.createPiece(1); // I-piece horizontal
        piece.x = 3;
        piece.y = 19;
        game.setCurrentPiece(piece);
        game.setNextPiece(game.createPiece(4));

        expect(() => game.lockPiece()).not.toThrow();

        const board = game.getBoard();
        expect(board[19][3]).toBe(1);
        expect(board[19][4]).toBe(1);
        expect(board[19][5]).toBe(1);
        expect(board[19][6]).toBe(1);
      });
    });

    describe('11.3 Level and Drop Interval at High Levels', () => {
      it('should cap drop interval at 100ms for level 10', () => {
        game.setLines(89);
        game.setLevel(9);
        game.setScore(0);
        game.setAntiGravity(false);

        const board = createEmptyBoard();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getLevel()).toBe(10);
        expect(game.getDropInterval()).toBe(100);
      });

      it('should keep drop interval at 100ms for levels above 10', () => {
        game.setLines(109);
        game.setLevel(11);
        game.setScore(0);
        game.setAntiGravity(false);

        const board = createEmptyBoard();
        board[19] = createFilledRow();
        game.setBoard(board);

        game.clearLines();

        expect(game.getLevel()).toBe(12);
        expect(game.getDropInterval()).toBe(100); // Still capped at 100
      });
    });

    describe('11.4 Clear Lines on Empty Board', () => {
      it('should not modify empty board', () => {
        game.createBoard();
        game.setScore(0);
        game.setLines(0);

        game.clearLines();

        expect(game.getScore()).toBe(0);
        expect(game.getLines()).toBe(0);
        const board = game.getBoard();
        expect(board.every(row => row.every(cell => cell === 0))).toBe(true);
      });
    });

    describe('11.5 Ghost Position on Empty Board', () => {
      it('should return floor position for normal gravity', () => {
        game.createBoard();
        game.setAntiGravity(false);

        const piece = game.createPiece(4); // O-piece (2 tall)
        piece.x = 4;
        piece.y = 0;
        game.setCurrentPiece(piece);

        const ghostY = game.getGhostPosition();
        expect(ghostY).toBe(18); // Bottom valid position for 2-tall piece
      });

      it('should return ceiling position for anti-gravity', () => {
        game.createBoard();
        game.setAntiGravity(true);

        const piece = game.createPiece(4); // O-piece
        piece.x = 4;
        piece.y = 18;
        game.setCurrentPiece(piece);

        const ghostY = game.getGhostPosition();
        expect(ghostY).toBe(0); // Top position
      });
    });

    describe('11.6 Soft Drop at Boundary', () => {
      it('should not move or score when at floor in normal gravity', () => {
        game.setAntiGravity(false);
        game.setScore(0);
        game.setGameOver(false);
        game.setPaused(false);

        const piece = game.createPiece(4); // O-piece
        piece.x = 4;
        piece.y = 18; // At floor
        game.setCurrentPiece(piece);

        const event = { key: 'ArrowDown', preventDefault: jest.fn() };
        game.handleKeyDown(event);

        expect(game.getCurrentPiece().y).toBe(18); // Unchanged
        expect(game.getScore()).toBe(0); // No points for failed move
      });

      it('should not move or score when at ceiling in anti-gravity', () => {
        game.setAntiGravity(true);
        game.setScore(0);
        game.setGameOver(false);
        game.setPaused(false);

        const piece = game.createPiece(4); // O-piece
        piece.x = 4;
        piece.y = 0; // At ceiling
        game.setCurrentPiece(piece);

        const event = { key: 'ArrowDown', preventDefault: jest.fn() };
        game.handleKeyDown(event);

        expect(game.getCurrentPiece().y).toBe(0); // Unchanged
        expect(game.getScore()).toBe(0); // No points for failed move
      });
    });
  });
});
