# Marble Maze Game

A mobile-friendly 2D web game where you tilt your device to guide a marble through a procedurally generated maze.

![Marble Maze Game](https://img.shields.io/badge/status-playable-brightgreen) ![Platform](https://img.shields.io/badge/platform-mobile-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Play Now

Visit the live game: [Play Marble Maze](https://froggered.github.io/marble-run/)

## How to Play

1. **Open the game** on your mobile device (phone or tablet)
2. **Click "Enable Motion Controls"** when prompted
3. **Grant permission** for device orientation access
4. **Tilt your device** to roll the marble through the maze
5. **Reach the goal** (the pulsing orange/red circle) to win
6. **See "GG"** displayed on screen when you complete the maze
7. **New maze generates** automatically - keep playing!

## Features

- **Procedural Maze Generation** - Each maze is unique, generated using recursive backtracking algorithm
- **Tilt Controls** - Uses device orientation sensors for intuitive gameplay
- **Physics Simulation** - Realistic marble movement with gravity, friction, and collision
- **Responsive Design** - Adapts to any screen size
- **Smooth Animations** - Pulsing goal indicator and polished visuals
- **Auto-Regeneration** - New maze appears after each victory

## Technical Details

### Technologies Used
- HTML5 Canvas for rendering
- JavaScript (Vanilla) for game logic
- DeviceOrientation API for tilt controls
- CSS3 for styling and animations

### Game Mechanics
- **Maze Size**: 12x12 grid
- **Generation Algorithm**: Recursive backtracking (DFS-based)
- **Physics**: Velocity-based movement with friction damping
- **Collision Detection**: Wall-based boundary checking
- **Win Condition**: Proximity detection to goal position

## Browser Compatibility

Works best on:
- iOS Safari (iPhone/iPad)
- Android Chrome
- Android Firefox

Requires device orientation sensor support.

## Local Development

To run locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/froggered/marble-run.git
   cd marble-run
   ```

2. Serve the files with any web server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js
   npx serve
   ```

3. Open on your mobile device (must be HTTPS for sensor access):
   - Use ngrok or similar for HTTPS tunnel
   - Or deploy to GitHub Pages

## File Structure

```
marble-run/
├── index.html      # Game HTML structure and styles
├── game.js         # Game logic and physics
└── README.md       # This file
```

## Credits

Created as a fun mobile web game experiment.

## License

MIT License - feel free to use and modify!
