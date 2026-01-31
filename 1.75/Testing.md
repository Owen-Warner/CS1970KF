# Test Design Document for Tetris Game

This document contains structured test scenarios for `tetris-game.js` designed for implementation with Jest. All tests follow the Given/When/Then format.

---

## Table of Contents
1. [Piece Movement Tests](#1-piece-movement-tests)
2. [Rotation Tests](#2-rotation-tests)
3. [Line Clearing Tests](#3-line-clearing-tests)
4. [Gravity System Tests](#4-gravity-system-tests)
5. [Collision Detection Tests](#5-collision-detection-tests)
6. [Scoring & Progression Tests](#6-scoring--progression-tests)
7. [Game State Tests](#7-game-state-tests)
8. [Additional Edge Case Tests](#8-additional-edge-case-tests)
9. [Key Input & Integration Tests](#9-key-input--integration-tests)
10. [Constants & Configuration Tests](#10-constants--configuration-tests)
11. [Boundary & Edge Condition Tests](#11-boundary--edge-condition-tests)

---

## 1. Piece Movement Tests

### 1.1 Move Left - Valid Move
**Given** a piece is in the middle of the board (x = 5)
**When** `movePiece(-1, 0)` is called
**Then** the piece's x position should decrease by 1 (x = 4)
**And** the function should return `true`

### 1.2 Move Right - Valid Move
**Given** a piece is in the middle of the board (x = 4)
**When** `movePiece(1, 0)` is called
**Then** the piece's x position should increase by 1 (x = 5)
**And** the function should return `true`

### 1.3 Move Left - Blocked by Left Wall
**Given** a piece is at the left edge (x = 0)
**When** `movePiece(-1, 0)` is called
**Then** the piece's x position should remain 0
**And** the function should return `false`

### 1.4 Move Right - Blocked by Right Wall
**Given** an I-piece is positioned so its rightmost block is at column 9 (COLS - 1)
**When** `movePiece(1, 0)` is called
**Then** the piece's position should not change
**And** the function should return `false`

### 1.5 Soft Drop - Normal Gravity
**Given** a piece is at y = 5 with `antiGravity` set to `false`
**When** `movePiece(0, 1)` is called
**Then** the piece's y position should increase by 1 (y = 6)
**And** the function should return `true`

### 1.6 Soft Drop - Anti-Gravity
**Given** a piece is at y = 15 with `antiGravity` set to `true`
**When** `movePiece(0, -1)` is called
**Then** the piece's y position should decrease by 1 (y = 14)
**And** the function should return `true`

### 1.7 Hard Drop - Normal Gravity
**Given** a piece is at y = 5 with an empty board and `antiGravity` set to `false`
**When** `hardDrop()` is called
**Then** the piece should move to the bottom of the board
**And** `lockPiece()` should be called
**And** score should increase by 2 points per cell dropped

### 1.8 Hard Drop - Anti-Gravity
**Given** a piece is at y = 15 with an empty board and `antiGravity` set to `true`
**When** `hardDrop()` is called
**Then** the piece should move to the top of the board (y = 0)
**And** `lockPiece()` should be called
**And** score should increase by 2 points per cell risen

### 1.9 Move Blocked by Existing Piece
**Given** a piece is at position (4, 10)
**And** there is a locked block at position (3, 10)
**When** `movePiece(-1, 0)` is called
**Then** the piece should not move
**And** the function should return `false`

---

## 2. Rotation Tests

### 2.1 Basic Rotation - T-Piece
**Given** a T-piece with shape `[[0, 6, 0], [6, 6, 6]]`
**When** `rotatePiece()` is called
**Then** the shape should become `[[6, 0], [6, 6], [6, 0]]`

### 2.2 Basic Rotation - I-Piece
**Given** an I-piece with shape `[[1, 1, 1, 1]]` (horizontal)
**When** `rotatePiece()` is called
**Then** the shape should become `[[1], [1], [1], [1]]` (vertical)

### 2.3 Basic Rotation - J-Piece
**Given** a J-piece with shape `[[2, 0, 0], [2, 2, 2]]`
**When** `rotatePiece()` is called
**Then** the shape should rotate 90 degrees clockwise

### 2.4 Basic Rotation - L-Piece
**Given** an L-piece with shape `[[0, 0, 3], [3, 3, 3]]`
**When** `rotatePiece()` is called
**Then** the shape should rotate 90 degrees clockwise

### 2.5 Basic Rotation - S-Piece
**Given** an S-piece with shape `[[0, 5, 5], [5, 5, 0]]`
**When** `rotatePiece()` is called
**Then** the shape should rotate 90 degrees clockwise

### 2.6 Basic Rotation - Z-Piece
**Given** a Z-piece with shape `[[7, 7, 0], [0, 7, 7]]`
**When** `rotatePiece()` is called
**Then** the shape should rotate 90 degrees clockwise

### 2.7 O-Piece - No Rotation Change
**Given** an O-piece with shape `[[4, 4], [4, 4]]`
**When** `rotatePiece()` is called
**Then** the shape should remain `[[4, 4], [4, 4]]` (visually identical)

### 2.8 Wall Kick - Near Left Wall
**Given** a T-piece at x = 0
**And** rotation would place part of the piece at x = -1
**When** `rotatePiece()` is called
**Then** the piece should rotate
**And** x position should be adjusted by wall kick (+1)

### 2.9 Wall Kick - Near Right Wall
**Given** a vertical I-piece at x = 8 (near right edge)
**And** rotation to horizontal would extend beyond column 9
**And** wall kick offset of -2 would place piece at valid x = 6
**When** `rotatePiece()` is called
**Then** the piece should rotate to horizontal `[[1, 1, 1, 1]]`
**And** x position should be adjusted to 6 by wall kick (-2)

> **Note:** Original test used x=9, but horizontal I-piece (4 wide) cannot fit even with maximum kick of -2. Updated to x=8 where kick of -2 results in valid position x=6.

### 2.10 Rotation Blocked by Existing Pieces
**Given** a horizontal I-piece at x = 4, y = 4
**And** existing blocks fill columns 2-6 for rows 5-8, blocking all wall kick positions
**When** `rotatePiece()` is called
**Then** the piece shape should remain `[[1, 1, 1, 1]]` (horizontal)
**And** the piece position should remain x = 4

> **Note:** Original test only blocked columns 3 and 5, leaving column 4 clear for rotation. Updated to block all columns (2-6) where the vertical I-piece could land with any wall kick offset `[0, -1, 1, -2, 2]`.

### 2.11 Wall Kick Tries Multiple Offsets
**Given** a piece near a wall
**And** kick offset 0 is invalid, kick offset -1 is invalid, but kick offset 1 is valid
**When** `rotatePiece()` is called
**Then** the piece should rotate with x offset of +1

---

## 3. Line Clearing Tests

### 3.1 Single Line Clear - Normal Gravity
**Given** `antiGravity` is `false`
**And** row 19 (bottom) is completely filled
**And** all other rows have some empty cells
**When** `clearLines()` is called
**Then** row 19 should be removed
**And** a new empty row should be added at row 0 (top)
**And** `lines` should increase by 1
**And** score should increase by 100 * level

### 3.2 Double Line Clear
**Given** rows 18 and 19 are completely filled
**When** `clearLines()` is called
**Then** both rows should be removed
**And** `lines` should increase by 2
**And** score should increase by 300 * level

### 3.3 Triple Line Clear
**Given** rows 17, 18, and 19 are completely filled
**When** `clearLines()` is called
**Then** all three rows should be removed
**And** `lines` should increase by 3
**And** score should increase by 500 * level

### 3.4 Tetris (4 Lines Clear)
**Given** rows 16, 17, 18, and 19 are completely filled
**When** `clearLines()` is called
**Then** all four rows should be removed
**And** `lines` should increase by 4
**And** score should increase by 800 * level

### 3.5 Anti-Gravity Line Clear - From Top
**Given** `antiGravity` is `true`
**And** row 0 (top) is completely filled
**When** `clearLines()` is called
**Then** row 0 should be removed
**And** a new empty row should be added at the bottom (row 19)

### 3.6 Line Clear Scoring at Higher Levels
**Given** level is 5
**And** a single line is cleared
**When** `clearLines()` is called
**Then** score should increase by 100 * 5 = 500 points

### 3.7 No Lines to Clear
**Given** no rows are completely filled
**When** `clearLines()` is called
**Then** the board should remain unchanged
**And** score should remain unchanged
**And** lines count should remain unchanged

---

## 4. Gravity System Tests

### 4.1 Normal Gravity - Piece Falls Down
**Given** `antiGravity` is `false`
**And** a piece is at y = 5
**When** the game loop calls `movePiece(0, 1)`
**Then** the piece should move to y = 6

### 4.2 Anti-Gravity - Piece Rises Up
**Given** `antiGravity` is `true`
**And** a piece is at y = 15
**When** the game loop calls `movePiece(0, -1)`
**Then** the piece should move to y = 14

### 4.3 Toggle Gravity - Board Flips
**Given** an initial board state with pieces at the bottom (rows 15-19)
**When** `toggleGravity()` is called
**Then** `antiGravity` should become `true`
**And** the board should be vertically flipped (pieces now at rows 0-4)

### 4.4 Toggle Gravity - J Piece Swaps to L
**Given** the board contains J-pieces (type 2)
**When** `toggleGravity()` is called
**Then** all J-pieces on the board should become L-pieces (type 3)

### 4.5 Toggle Gravity - L Piece Swaps to J
**Given** the board contains L-pieces (type 3)
**When** `toggleGravity()` is called
**Then** all L-pieces on the board should become J-pieces (type 2)

### 4.6 Toggle Gravity - S Piece Swaps to Z
**Given** the board contains S-pieces (type 5)
**When** `toggleGravity()` is called
**Then** all S-pieces on the board should become Z-pieces (type 7)

### 4.7 Toggle Gravity - Z Piece Swaps to S
**Given** the board contains Z-pieces (type 7)
**When** `toggleGravity()` is called
**Then** all Z-pieces on the board should become S-pieces (type 5)

### 4.8 Non-Swappable Pieces - I Piece
**Given** `getSwappedType()` is called with type 1 (I-piece)
**When** the function executes
**Then** it should return 1 (unchanged)

### 4.9 Non-Swappable Pieces - O Piece
**Given** `getSwappedType()` is called with type 4 (O-piece)
**When** the function executes
**Then** it should return 4 (unchanged)

### 4.10 Non-Swappable Pieces - T Piece
**Given** `getSwappedType()` is called with type 6 (T-piece)
**When** the function executes
**Then** it should return 6 (unchanged)

### 4.11 Current Piece Swaps on Toggle
**Given** the current falling piece is a J-piece (type 2)
**When** `toggleGravity()` is called
**Then** the current piece should become an L-piece (type 3)

### 4.12 Spawn Position - Normal Gravity
**Given** `antiGravity` is `false`
**When** `createPiece(type)` is called
**Then** the piece's y position should be 0 (top of board)

### 4.13 Spawn Position - Anti-Gravity
**Given** `antiGravity` is `true`
**When** `createPiece(type)` is called
**Then** the piece's y position should be `ROWS - shape.length` (bottom of board)

---

## 5. Collision Detection Tests

### 5.1 Valid Move - Empty Space
**Given** an empty board
**And** a piece shape at position (4, 5)
**When** `isValidMove(shape, 4, 5)` is called
**Then** it should return `true`

### 5.2 Invalid Move - Left Wall Boundary
**Given** a piece shape that would extend to x = -1
**When** `isValidMove(shape, -1, 5)` is called
**Then** it should return `false`

### 5.3 Invalid Move - Right Wall Boundary
**Given** a piece shape that would extend beyond x = 9 (COLS - 1)
**When** `isValidMove(shape, 9, 5)` is called for a piece wider than 1 column
**Then** it should return `false`

### 5.4 Invalid Move - Floor Boundary
**Given** a piece shape that would extend to y = 20 (ROWS)
**When** `isValidMove(shape, 4, 19)` is called for a piece taller than 1 row
**Then** it should return `false`

### 5.5 Invalid Move - Ceiling Boundary
**Given** a piece shape that would extend to y = -1
**When** `isValidMove(shape, 4, -1)` is called
**Then** it should return `false`

### 5.6 Invalid Move - Collision with Existing Piece
**Given** a board with a block at position (5, 10)
**And** a piece that would occupy (5, 10)
**When** `isValidMove(shape, x, y)` is called
**Then** it should return `false`

### 5.7 Valid Move - Adjacent to Existing Piece
**Given** a board with a block at position (5, 10)
**And** a piece that would occupy (4, 10) but not (5, 10)
**When** `isValidMove(shape, x, y)` is called
**Then** it should return `true`

### 5.8 Spawn Position Validation - Game Over
**Given** blocks exist at the spawn position
**When** `spawnPiece()` is called
**Then** `gameOver` should be set to `true`

### 5.9 Ghost Position - Normal Gravity
**Given** a piece at y = 5 with `antiGravity` false
**And** the board is empty below the piece until row 19
**When** `getGhostPosition()` is called
**Then** it should return the y position where the piece would land (bottom)

### 5.10 Ghost Position - Anti-Gravity
**Given** a piece at y = 15 with `antiGravity` true
**And** the board is empty above the piece until row 0
**When** `getGhostPosition()` is called
**Then** it should return 0 (top of board)

---

## 6. Scoring & Progression Tests

### 6.1 Soft Drop Points
**Given** a piece at y = 5
**When** `movePiece(0, 1)` is called successfully (soft drop)
**And** score is incremented by 1
**Then** score should increase by 1 point per cell

### 6.2 Hard Drop Points
**Given** a piece at y = 5 with empty board below
**And** the piece will drop 13 cells to reach the bottom
**When** `hardDrop()` is called
**Then** score should increase by 26 points (2 * 13)

### 6.3 Single Line Clear Points
**Given** level is 1
**When** 1 line is cleared
**Then** score should increase by 100 points

### 6.4 Double Line Clear Points
**Given** level is 1
**When** 2 lines are cleared
**Then** score should increase by 300 points

### 6.5 Triple Line Clear Points
**Given** level is 1
**When** 3 lines are cleared
**Then** score should increase by 500 points

### 6.6 Tetris Points
**Given** level is 1
**When** 4 lines are cleared
**Then** score should increase by 800 points

### 6.7 Level Multiplier on Scoring
**Given** level is 3
**When** 1 line is cleared
**Then** score should increase by 300 points (100 * 3)

### 6.8 Level Progression - Every 10 Lines
**Given** lines cleared is 9
**And** level is 1
**When** 1 more line is cleared (total = 10)
**Then** level should become 2

### 6.9 Level Progression - Multiple Levels
**Given** lines cleared is 25
**When** level is calculated
**Then** level should be 3 (floor(25/10) + 1)

### 6.10 Drop Speed Decrease Per Level
**Given** level is 1
**And** `dropInterval` is 1000ms
**When** level increases to 2
**Then** `dropInterval` should become 900ms (1000 - 100)

### 6.11 Drop Speed Minimum Cap
**Given** level is 10 or higher
**When** `dropInterval` is calculated
**Then** it should not go below 100ms

### 6.12 Initial Score
**Given** a new game is started
**When** `resetGame()` is called
**Then** score should be 0

### 6.13 Initial Level
**Given** a new game is started
**When** `resetGame()` is called
**Then** level should be 1

---

## 7. Game State Tests

### 7.1 Pause Game
**Given** game is running (`paused` is `false`)
**When** `togglePause()` is called
**Then** `paused` should be `true`

### 7.2 Unpause Game
**Given** game is paused (`paused` is `true`)
**When** `togglePause()` is called
**Then** `paused` should be `false`

### 7.3 Game Over Detection - Normal Gravity
**Given** `antiGravity` is `false`
**And** blocks are stacked to the top row
**When** a new piece spawns
**And** `isValidMove()` returns `false` for spawn position
**Then** `gameOver` should be set to `true`

### 7.4 Game Over Detection - Anti-Gravity
**Given** `antiGravity` is `true`
**And** blocks are stacked to the bottom row
**When** a new piece spawns at the bottom
**And** `isValidMove()` returns `false` for spawn position
**Then** `gameOver` should be set to `true`

### 7.5 Reset Game - Board Cleared
**Given** a game in progress with pieces on the board
**When** `resetGame()` is called
**Then** the board should be empty (all cells = 0)

### 7.6 Reset Game - Score Reset
**Given** score is 5000
**When** `resetGame()` is called
**Then** score should be 0

### 7.7 Reset Game - Level Reset
**Given** level is 5
**When** `resetGame()` is called
**Then** level should be 1

### 7.8 Reset Game - Lines Reset
**Given** lines is 45
**When** `resetGame()` is called
**Then** lines should be 0

### 7.9 Reset Game - Gravity Mode Reset
**Given** `antiGravity` is `true`
**When** `resetGame()` is called
**Then** `antiGravity` should be `false`

### 7.10 Reset Game - Game Over Flag Reset
**Given** `gameOver` is `true`
**When** `resetGame()` is called
**Then** `gameOver` should be `false`

### 7.11 Reset Game - Pause Flag Reset
**Given** `paused` is `true`
**When** `resetGame()` is called
**Then** `paused` should be `false`

### 7.12 Reset Game - Drop Interval Reset
**Given** `dropInterval` is 500
**When** `resetGame()` is called
**Then** `dropInterval` should be 1000

### 7.13 Create Board Dimensions
**Given** `createBoard()` is called
**When** the board is created
**Then** it should have 20 rows (ROWS)
**And** each row should have 10 columns (COLS)
**And** all cells should be initialized to 0

### 7.14 Lock Piece - Places on Board
**Given** a piece at position (4, 18)
**When** `lockPiece()` is called
**Then** the piece's blocks should be added to the board at the correct positions

### 7.15 New Piece Spawns After Lock
**Given** `nextPiece` is set
**When** `lockPiece()` is called
**Then** `currentPiece` should be set to the previous `nextPiece`
**And** a new `nextPiece` should be generated

---

## 8. Additional Edge Case Tests

### 8.1 Full Rotation Cycle - T-Piece
**Given** a T-piece at position (4, 5)
**When** `rotatePiece()` is called 4 times
**Then** the piece should return to its original shape

### 8.1b Full Rotation Cycle - I-Piece
**Given** an I-piece at position (3, 5)
**When** `rotatePiece()` is called 2 times
**Then** the piece should return to its original shape (I-piece has 2-fold symmetry)

### 8.2 Non-consecutive Line Clears
**Given** rows 17 and 19 are completely filled
**And** row 18 has only one block at column 5
**When** `clearLines()` is called
**Then** rows 17 and 19 should be cleared (2 lines)
**And** score should increase by 300 * level (double line clear)
**And** the partial row should shift down to row 19

### 8.3 Ghost Position with Obstacles - Normal Gravity
**Given** `antiGravity` is `false`
**And** an O-piece at position (4, 5)
**And** existing blocks at row 15, columns 4-5
**When** `getGhostPosition()` is called
**Then** it should return 13 (piece stops above obstacle, not at floor)

### 8.3b Ghost Position with Obstacles - Anti-Gravity
**Given** `antiGravity` is `true`
**And** an O-piece at position (4, 15)
**And** existing blocks at row 5, columns 4-5
**When** `getGhostPosition()` is called
**Then** it should return 6 (piece stops below obstacle, not at ceiling)

### 8.4 getRandomPiece Validity
**Given** `getRandomPiece()` is called multiple times
**When** each piece is generated
**Then** piece type should be between 1 and 7 (inclusive)
**And** piece should have valid shape, x, and y properties

### 8.5 Multiple Anti-gravity Line Clears
**Given** `antiGravity` is `true`
**And** rows 0, 1, and 2 are completely filled
**And** row 3 has a marker block at column 5
**When** `clearLines()` is called
**Then** 3 lines should be cleared
**And** score should increase by 500 * level (triple)
**And** the marker should shift to row 0

### 8.6 Piece Centering - I-Piece
**Given** `createPiece(1)` is called for I-piece (4 blocks wide)
**When** the piece is created
**Then** x position should be 3 (centered: floor(10/2) - floor(4/2))

### 8.6b Piece Centering - O-Piece
**Given** `createPiece(4)` is called for O-piece (2 blocks wide)
**When** the piece is created
**Then** x position should be 4 (centered: floor(10/2) - floor(2/2))

### 8.6c Piece Centering - T-Piece
**Given** `createPiece(6)` is called for T-piece (3 blocks wide)
**When** the piece is created
**Then** x position should be 4 (centered: floor(10/2) - floor(3/2))

### 8.7 resetCurrentPiece - Normal Gravity
**Given** `antiGravity` is `false`
**And** current piece is at position (2, 10)
**When** `resetCurrentPiece()` is called
**Then** piece y position should be 0 (top)
**And** piece x position should be centered (4 for T-piece)

### 8.7b resetCurrentPiece - Anti-Gravity
**Given** `antiGravity` is `true`
**And** current piece is a T-piece at position (2, 5)
**When** `resetCurrentPiece()` is called
**Then** piece y position should be 18 (ROWS - piece height)
**And** piece x position should be centered

### 8.8 Score Accumulation
**Given** a vertical I-piece at position (9, 10)
**And** bottom row is almost complete (columns 0-8 filled)
**When** piece is soft-dropped 5 cells
**Then** score should increase by 5 (1 point per soft drop cell)

### 8.9 handleKeyDown - ArrowLeft
**Given** a piece at position (5, 5)
**And** game is not paused or over
**When** ArrowLeft key event is triggered
**Then** piece x position should decrease to 4

### 8.9b handleKeyDown - ArrowRight
**Given** a piece at position (5, 5)
**And** game is not paused or over
**When** ArrowRight key event is triggered
**Then** piece x position should increase to 6

### 8.9c handleKeyDown - ArrowUp
**Given** a T-piece at position (4, 5)
**And** game is not paused or over
**When** ArrowUp key event is triggered
**Then** piece shape should be rotated

### 8.9d handleKeyDown - Game Over State
**Given** a piece at position (5, 5)
**And** `gameOver` is `true`
**When** ArrowLeft key event is triggered
**Then** piece position should remain unchanged (no response to input)

### 8.9e handleKeyDown - Pause Toggle
**Given** game is running (`paused` is `false`)
**And** game is not over
**When** 'P' key event is triggered
**Then** `paused` should become `true`

### 8.9f handleKeyDown - Paused State
**Given** a piece at position (5, 5)
**And** `paused` is `true`
**When** ArrowLeft key event is triggered
**Then** piece position should remain unchanged (movement blocked while paused)

### 8.10 Spawn with null nextPiece
**Given** `nextPiece` is `null`
**And** `currentPiece` is `null`
**When** `spawnPiece()` is called
**Then** `currentPiece` should be generated (not null)
**And** `nextPiece` should be generated (not null)

---

## 9. Key Input & Integration Tests

### 9.1 ArrowDown Soft Drop with Scoring - Normal Gravity
**Given** `antiGravity` is `false`
**And** score is 0
**And** a piece at position (4, 5)
**When** ArrowDown key event is triggered via `handleKeyDown`
**Then** piece y position should increase to 6
**And** score should increase to 1

### 9.1b ArrowDown Soft Drop with Scoring - Anti-Gravity
**Given** `antiGravity` is `true`
**And** score is 0
**And** a piece at position (4, 15)
**When** ArrowDown key event is triggered via `handleKeyDown`
**Then** piece y position should decrease to 14
**And** score should increase to 1

### 9.2 Space Bar Hard Drop
**Given** an O-piece at position (4, 10)
**And** score is 0
**When** Space bar key event is triggered via `handleKeyDown`
**Then** piece should drop to bottom (y=18)
**And** score should increase by 16 points (8 cells × 2)
**And** `event.preventDefault()` should be called

### 9.3 G Key Gravity Toggle
**Given** `antiGravity` is `false`
**When** 'g' key event is triggered via `handleKeyDown`
**Then** `antiGravity` should become `true`

### 9.3b G Key Gravity Toggle - Uppercase
**Given** `antiGravity` is `false`
**When** 'G' key event is triggered via `handleKeyDown`
**Then** `antiGravity` should become `true`

### 9.4 toggleGravity Full Integration
**Given** a board with J-piece block at position (5, 19)
**And** current piece is an S-piece
**And** `antiGravity` is `false`
**When** 'g' key is pressed
**Then** `antiGravity` should become `true`
**And** board should be flipped (J-piece now at row 0)
**And** J-piece should become L-piece (type 2 → 3)
**And** current S-piece should become Z-piece (type 5 → 7)

### 9.5 Double Gravity Toggle
**Given** a board with J-piece at (5, 19) and S-piece at (3, 18)
**And** `antiGravity` is `false`
**When** gravity is toggled twice via 'g' key
**Then** `antiGravity` should be `false`
**And** board should return to original state
**And** pieces should return to original types and positions

### 9.6 S-Piece Rotation Symmetry
**Given** an S-piece at position (4, 5)
**When** `rotatePiece()` is called twice
**Then** shape should return to original (S-piece has 2-fold symmetry)

### 9.6b Z-Piece Rotation Symmetry
**Given** a Z-piece at position (4, 5)
**When** `rotatePiece()` is called twice
**Then** shape should return to original (Z-piece has 2-fold symmetry)

---

## 10. Constants & Configuration Tests

### 10.1 SHAPES Array Validation
**Given** the `SHAPES` constant array
**When** its structure is examined
**Then** it should have 8 entries (placeholder + 7 pieces)
**And** index 0 should be an empty array
**And** index 1 should be I-piece `[[1, 1, 1, 1]]`
**And** index 4 should be O-piece `[[4, 4], [4, 4]]`

### 10.2 COLORS Array Validation
**Given** the `COLORS` constant array
**When** its structure is examined
**Then** it should have 8 entries (null + 7 colors)
**And** index 0 should be `null`
**And** indices 1-7 should be valid hex color strings (`#RRGGBB`)

### 10.3 SWAP_MAP Completeness
**Given** the `SWAP_MAP` constant object
**When** its mappings are examined
**Then** J (2) should map to L (3)
**And** L (3) should map to J (2)
**And** S (5) should map to Z (7)
**And** Z (7) should map to S (5)
**And** I (1), O (4), T (6) should have no mappings (undefined)

### 10.4 Board Dimensions
**Given** the board dimension constants
**When** their values are examined
**Then** `COLS` should be 10
**And** `ROWS` should be 20
**And** `BLOCK_SIZE` should be 30

---

## 11. Boundary & Edge Condition Tests

### 11.1 Piece Locking at Top Row
**Given** an I-piece at position (3, 0) (top row)
**When** `lockPiece()` is called
**Then** no error should be thrown
**And** I-piece blocks should be placed at row 0, columns 3-6

### 11.2 Piece Locking at Bottom Row
**Given** an I-piece at position (3, 19) (bottom row)
**When** `lockPiece()` is called
**Then** no error should be thrown
**And** I-piece blocks should be placed at row 19, columns 3-6

### 11.3 Level and Drop Interval at Level 10
**Given** lines cleared is 89 and level is 9
**When** one more line is cleared (total = 90)
**Then** level should become 10
**And** `dropInterval` should be 100ms (minimum cap)

### 11.3b Level and Drop Interval Above Level 10
**Given** lines cleared is 109 and level is 11
**When** one more line is cleared (total = 110)
**Then** level should become 12
**And** `dropInterval` should remain at 100ms (capped)

### 11.4 Clear Lines on Empty Board
**Given** an empty board (all cells = 0)
**When** `clearLines()` is called
**Then** board should remain empty
**And** score should remain 0
**And** lines count should remain 0

### 11.5 Ghost Position on Empty Board - Normal Gravity
**Given** an empty board with `antiGravity` false
**And** an O-piece at position (4, 0)
**When** `getGhostPosition()` is called
**Then** it should return 18 (floor position for 2-tall piece)

### 11.5b Ghost Position on Empty Board - Anti-Gravity
**Given** an empty board with `antiGravity` true
**And** an O-piece at position (4, 18)
**When** `getGhostPosition()` is called
**Then** it should return 0 (ceiling position)

### 11.6 Soft Drop at Floor Boundary
**Given** `antiGravity` is `false`
**And** an O-piece at position (4, 18) (at floor)
**When** ArrowDown key event is triggered
**Then** piece position should remain at y=18
**And** score should remain 0 (no points for failed move)

### 11.6b Soft Drop at Ceiling Boundary
**Given** `antiGravity` is `true`
**And** an O-piece at position (4, 0) (at ceiling)
**When** ArrowDown key event is triggered
**Then** piece position should remain at y=0
**And** score should remain 0 (no points for failed move)

---

## Exported Functions Coverage

The following functions from `tetris-game.js` are covered by these tests:

| Function | Test Category |
|----------|---------------|
| `createBoard` | Game State (7.13), Boundary (11.4) |
| `createPiece` | Gravity System (4.12, 4.13), Edge Cases (8.6) |
| `getRandomPiece` | Game State (7.15), Edge Cases (8.4) |
| `resetCurrentPiece` | Gravity System, Edge Cases (8.7) |
| `getSwappedType` | Gravity System (4.8, 4.9, 4.10), Constants (10.3) |
| `swapCurrentPiece` | Gravity System (4.11), Key Input (9.4) |
| `swapBoardPieces` | Gravity System (4.4-4.7), Key Input (9.4, 9.5) |
| `isValidMove` | Collision Detection (5.1-5.8) |
| `rotatePiece` | Rotation (2.1-2.11), Edge Cases (8.1), Key Input (9.6) |
| `movePiece` | Piece Movement (1.1-1.9), Edge Cases (8.8), Boundary (11.6) |
| `hardDrop` | Piece Movement (1.7, 1.8), Scoring (6.2), Key Input (9.2) |
| `lockPiece` | Game State (7.14, 7.15), Boundary (11.1, 11.2) |
| `clearLines` | Line Clearing (3.1-3.7), Edge Cases (8.2, 8.5), Boundary (11.3, 11.4) |
| `spawnPiece` | Collision Detection (5.8), Game State (7.15), Edge Cases (8.10) |
| `flipBoard` | Gravity System (4.3), Key Input (9.4, 9.5) |
| `getGhostPosition` | Collision Detection (5.9, 5.10), Edge Cases (8.3), Boundary (11.5) |
| `resetGame` | Game State (7.5-7.12) |
| `togglePause` | Game State (7.1, 7.2), Edge Cases (8.9e) |
| `toggleGravity` | Key Input (9.3, 9.4, 9.5) |
| `handleKeyDown` | Edge Cases (8.9), Key Input (9.1-9.5), Boundary (11.6) |

### Constants (tested in Section 10)
| Constant | Test |
|----------|------|
| `SHAPES` | 10.1 |
| `COLORS` | 10.2 |
| `SWAP_MAP` | 10.3 |
| `COLS`, `ROWS`, `BLOCK_SIZE` | 10.4 |

### State Getters/Setters (for test setup)
- `getBoard` / `setBoard`
- `getCurrentPiece` / `setCurrentPiece`
- `getNextPiece` / `setNextPiece`
- `getScore` / `setScore`
- `getLevel` / `setLevel`
- `getLines` / `setLines`
- `isGameOver` / `setGameOver`
- `isPaused` / `setPaused`
- `isAntiGravity` / `setAntiGravity`
- `getDropInterval` / `setDropInterval`

### Canvas Setters (for test mocking)
- `setCanvas` - Set main game canvas element
- `setNextCanvas` - Set next piece preview canvas element
- `setCanvasContext` - Set main canvas 2D context
- `setNextCanvasContext` - Set next piece canvas 2D context

---

## Notes for Jest Implementation

1. **Mock DOM elements**: The game relies on DOM for UI updates. Use Jest mocks or JSDOM for `document.getElementById`.

2. **Isolate state**: Use `beforeEach` to reset game state between tests using the exported setters.

3. **Test anti-gravity separately**: Many functions behave differently based on `antiGravity` state.

4. **Wall kick testing**: Create specific board configurations to test all 5 kick offsets: `[0, -1, 1, -2, 2]`.

5. **Line scoring array**: Points array is `[0, 100, 300, 500, 800]` for 0-4 lines respectively.

---

## Bugs Found During Test Implementation

The following issues were discovered and fixed during Jest test implementation:

### Bug 1: Missing `togglePause` Export
**Issue:** The `togglePause` function was not exported from `tetris-game.js`, causing tests 7.1 and 7.2 to fail with "game.togglePause is not a function".

**Fix:** Added `togglePause` to the module exports in `tetris-game.js`.

### Bug 2: Missing Canvas Context Setters
**Issue:** Tests calling `spawnPiece()`, `lockPiece()`, or `hardDrop()` failed with "Cannot set properties of null (setting 'fillStyle')" because these functions call `drawNextPiece()` which requires canvas contexts.

**Fix:** Added canvas context setters to exports:
- `setCanvasContext`
- `setNextCanvasContext`
- `setCanvas`
- `setNextCanvas`

Tests now initialize mock canvas contexts in `beforeEach`:
```javascript
game.setCanvas(createMockCanvas(300, 600));
game.setNextCanvas(createMockCanvas(120, 120));
game.setCanvasContext(createMockContext());
game.setNextCanvasContext(createMockContext());
```

### Bug 3: Test 2.9 - Invalid Wall Kick Scenario
**Issue:** Original test placed vertical I-piece at x=9. When rotated to horizontal (4 blocks wide), even with maximum wall kick of -2, the piece would be at x=7, extending to column 10 (out of bounds). The rotation was correctly blocked, but test expected success.

**Fix:** Changed test to use x=8, where wall kick of -2 places horizontal I-piece at x=6 (valid position, extends to column 9).

### Bug 4: Test 2.10 - Incomplete Rotation Blocking
**Issue:** Original test only blocked columns 3 and 5 for rows 5-7. The horizontal I-piece at x=4 could still rotate to vertical at column 4 (which was unblocked).

**Fix:** Updated test to block columns 2-6 for rows 5-8, covering all possible wall kick landing positions `[0, -1, 1, -2, 2]` from x=4.
