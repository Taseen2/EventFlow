# EventFlow Design Specification

## Overview
"EventFlow" is an interactive educational playground for visualising JavaScript event propagation. It uses a modern, futuristic dark theme with neon accents and glassmorphism to provide a high-quality developer-tool aesthetic.

## Tech Stack
- HTML5
- CSS3 (Vanilla, Custom Properties)
- JavaScript (Vanilla, ES6+)

## Core Architecture (State-Driven)
The application will maintain a central `state` object to control behavior:
```javascript
const state = {
  isCapturing: false,
  isStopPropagationEnabled: false,
  isPaused: false,
  onceClicked: false,
  logs: []
};
```

## Features

### 1. Interactive Playground
- **Nested Boxes:** Grandparent (Purple), Parent (Blue), Child (Pink).
- **Propagation Visualization:** Elements glow in sequence based on the phase (Capturing/Bubbling).
- **Control Panel:**
  - Toggle: Capturing Mode.
  - Checkbox: `stopPropagation()`.
  - Button: "Click Me Once" (uses `{ once: true }`).

### 2. Event Delegation Demo
- A container that handles clicks for dynamically added items.
- Visual feedback showing the "Parent" catching the "Child's" event.

### 3. Hybrid Live Console
- **Active Trace:** Displays the current event's path (e.g., Child -> Parent -> Grandparent) with phase indicators.
- **History Log:** A persistent, auto-scrolling list of all historical events.
- **Meta-data:** Displays `event.target`, `event.currentTarget`, `eventPhase`, and a timestamp.

## Visual Design
- **Theme:** Dark background (`#0a0a0c`), glassmorphism cards.
- **Neon Glows:** Using `box-shadow` and `filter: drop-shadow()`.
- **Animations:** 
  - CSS Keyframes for pulsing glows.
  - JavaScript-driven ripple effects on click.
  - Smooth sliding entry for console logs.

## File Structure
- `index.html`: Main layout and UI structure.
- `style.css`: All styling, neon effects, and animations.
- `app.js`: State management, event listeners, and UI updates.

## Educational Comments
The code will include detailed comments explaining:
- **Capturing:** The event descends from the window to the target.
- **Bubbling:** The event ascends from the target back to the window.
- **Delegation:** Using one parent listener to manage many children.
- **stopPropagation:** Halting the flow of the event.
- **once:** Ensuring a listener only fires a single time.
