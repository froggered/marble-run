// Game configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const messageEl = document.getElementById('message');
const startButton = document.getElementById('startButton');

// Set canvas size to fit mobile screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game constants
const MAZE_SIZE = 12; // 12x12 maze
const MARBLE_RADIUS = 12;
const FRICTION = 0.95;
const GRAVITY_MULTIPLIER = 0.5;

// Game state
let maze = [];
let cellSize = 0;
let marble = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: MARBLE_RADIUS
};
let goal = { x: 0, y: 0 };
let gamma = 0; // Device tilt left/right
let beta = 0;  // Device tilt forward/backward
let permissionGranted = false;

// Maze generation using recursive backtracking
class MazeGenerator {
    constructor(size) {
        this.size = size;
        this.cells = [];
        this.generate();
    }

    generate() {
        // Initialize grid
        for (let y = 0; y < this.size; y++) {
            this.cells[y] = [];
            for (let x = 0; x < this.size; x++) {
                this.cells[y][x] = {
                    visited: false,
                    walls: { top: true, right: true, bottom: true, left: true }
                };
            }
        }

        // Recursive backtracking
        this.carvePassages(0, 0);
    }

    carvePassages(x, y) {
        this.cells[y][x].visited = true;

        // Get neighbors in random order
        const directions = [
            { dx: 0, dy: -1, wall: 'top', opposite: 'bottom' },   // Up
            { dx: 1, dy: 0, wall: 'right', opposite: 'left' },    // Right
            { dx: 0, dy: 1, wall: 'bottom', opposite: 'top' },    // Down
            { dx: -1, dy: 0, wall: 'left', opposite: 'right' }    // Left
        ];

        this.shuffle(directions);

        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;

            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && !this.cells[ny][nx].visited) {
                // Remove walls between current cell and neighbor
                this.cells[y][x].walls[dir.wall] = false;
                this.cells[ny][nx].walls[dir.opposite] = false;
                this.carvePassages(nx, ny);
            }
        }
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// Initialize game
function initGame() {
    // Generate maze
    const mazeGen = new MazeGenerator(MAZE_SIZE);
    maze = mazeGen.cells;

    // Calculate cell size based on canvas dimensions
    const maxSize = Math.min(canvas.width, canvas.height) * 0.9;
    cellSize = maxSize / MAZE_SIZE;

    // Position marble at start (top-left)
    marble.x = cellSize * 0.5;
    marble.y = cellSize * 0.5;
    marble.vx = 0;
    marble.vy = 0;

    // Position goal at end (bottom-right)
    goal.x = (MAZE_SIZE - 0.5) * cellSize;
    goal.y = (MAZE_SIZE - 0.5) * cellSize;
}

// Handle device orientation
function handleOrientation(event) {
    if (!permissionGranted) return;

    beta = event.beta;   // -180 to 180 (forward/backward tilt)
    gamma = event.gamma; // -90 to 90 (left/right tilt)

    // Clamp values
    beta = Math.max(-45, Math.min(45, beta));
    gamma = Math.max(-45, Math.min(45, gamma));
}

// Request permission for iOS 13+
async function requestPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
                permissionGranted = true;
                window.addEventListener('deviceorientation', handleOrientation);
                startButton.style.display = 'none';
                initGame();
                gameLoop();
            }
        } catch (error) {
            console.error('Permission denied:', error);
            alert('Motion permission denied. Please enable it in settings.');
        }
    } else {
        // Non-iOS or older iOS
        permissionGranted = true;
        window.addEventListener('deviceorientation', handleOrientation);
        startButton.style.display = 'none';
        initGame();
        gameLoop();
    }
}

startButton.addEventListener('click', requestPermission);

// Update marble physics
function updateMarble() {
    if (!permissionGranted) return;

    // Apply gravity based on device tilt
    const gravityX = (gamma / 45) * GRAVITY_MULTIPLIER;
    const gravityY = (beta / 45) * GRAVITY_MULTIPLIER;

    marble.vx += gravityX;
    marble.vy += gravityY;

    // Apply friction
    marble.vx *= FRICTION;
    marble.vy *= FRICTION;

    // Try to move marble
    const newX = marble.x + marble.vx;
    const newY = marble.y + marble.vy;

    // Check collision and update position
    const collision = checkCollision(newX, newY);

    if (!collision.x) {
        marble.x = newX;
    } else {
        marble.vx = -marble.vx * 0.5; // Bounce with damping
    }

    if (!collision.y) {
        marble.y = newY;
    } else {
        marble.vy = -marble.vy * 0.5; // Bounce with damping
    }

    // Keep marble in bounds
    marble.x = Math.max(marble.radius, Math.min(MAZE_SIZE * cellSize - marble.radius, marble.x));
    marble.y = Math.max(marble.radius, Math.min(MAZE_SIZE * cellSize - marble.radius, marble.y));
}

// Check collision with maze walls
function checkCollision(x, y) {
    const collision = { x: false, y: false };

    // Determine which cell the marble is in
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);

    if (cellX < 0 || cellX >= MAZE_SIZE || cellY < 0 || cellY >= MAZE_SIZE) {
        return { x: true, y: true };
    }

    const cell = maze[cellY][cellX];
    const r = marble.radius;

    // Check walls of current cell
    const cellLeft = cellX * cellSize;
    const cellRight = (cellX + 1) * cellSize;
    const cellTop = cellY * cellSize;
    const cellBottom = (cellY + 1) * cellSize;

    // Left wall
    if (cell.walls.left && x - r < cellLeft) {
        collision.x = true;
    }
    // Right wall
    if (cell.walls.right && x + r > cellRight) {
        collision.x = true;
    }
    // Top wall
    if (cell.walls.top && y - r < cellTop) {
        collision.y = true;
    }
    // Bottom wall
    if (cell.walls.bottom && y + r > cellBottom) {
        collision.y = true;
    }

    return collision;
}

// Check if marble reached goal
function checkWin() {
    const dist = Math.sqrt((marble.x - goal.x) ** 2 + (marble.y - goal.y) ** 2);
    return dist < cellSize * 0.4;
}

// Show win message and regenerate maze
function handleWin() {
    messageEl.classList.add('show');

    setTimeout(() => {
        messageEl.classList.remove('show');
        initGame();
    }, 1500);
}

// Draw maze
function drawMaze() {
    const offsetX = (canvas.width - MAZE_SIZE * cellSize) / 2;
    const offsetY = (canvas.height - MAZE_SIZE * cellSize) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 3;

    for (let y = 0; y < MAZE_SIZE; y++) {
        for (let x = 0; x < MAZE_SIZE; x++) {
            const cell = maze[y][x];
            const cx = x * cellSize;
            const cy = y * cellSize;

            ctx.beginPath();

            if (cell.walls.top) {
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + cellSize, cy);
            }
            if (cell.walls.right) {
                ctx.moveTo(cx + cellSize, cy);
                ctx.lineTo(cx + cellSize, cy + cellSize);
            }
            if (cell.walls.bottom) {
                ctx.moveTo(cx, cy + cellSize);
                ctx.lineTo(cx + cellSize, cy + cellSize);
            }
            if (cell.walls.left) {
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx, cy + cellSize);
            }

            ctx.stroke();
        }
    }

    ctx.restore();
}

// Draw goal
function drawGoal() {
    const offsetX = (canvas.width - MAZE_SIZE * cellSize) / 2;
    const offsetY = (canvas.height - MAZE_SIZE * cellSize) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Animated goal with pulsing effect
    const pulseSize = Math.sin(Date.now() / 300) * 3 + cellSize * 0.3;

    const gradient = ctx.createRadialGradient(goal.x, goal.y, 0, goal.x, goal.y, pulseSize);
    gradient.addColorStop(0, '#f39c12');
    gradient.addColorStop(0.5, '#e74c3c');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(goal.x, goal.y, pulseSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Draw marble
function drawMarble() {
    const offsetX = (canvas.width - MAZE_SIZE * cellSize) / 2;
    const offsetY = (canvas.height - MAZE_SIZE * cellSize) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Marble with gradient for 3D effect
    const gradient = ctx.createRadialGradient(
        marble.x - marble.radius * 0.3,
        marble.y - marble.radius * 0.3,
        marble.radius * 0.1,
        marble.x,
        marble.y,
        marble.radius
    );
    gradient.addColorStop(0, '#ecf0f1');
    gradient.addColorStop(0.4, '#3498db');
    gradient.addColorStop(1, '#2c3e50');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(marble.x, marble.y, marble.radius, 0, Math.PI * 2);
    ctx.fill();

    // Marble shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(
        marble.x - marble.radius * 0.3,
        marble.y - marble.radius * 0.3,
        marble.radius * 0.4,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
}

// Main game loop
let lastWin = 0;
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw
    updateMarble();
    drawMaze();
    drawGoal();
    drawMarble();

    // Check win condition
    if (checkWin() && Date.now() - lastWin > 2000) {
        lastWin = Date.now();
        handleWin();
    }

    requestAnimationFrame(gameLoop);
}

// Initialize on load (but don't start until permission granted)
initGame();
