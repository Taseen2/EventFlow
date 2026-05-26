# EventFlow 🌌

**EventFlow** is a premium, interactive educational playground designed to visualize the intricate mechanics of JavaScript event propagation. Set in a futuristic cyberpunk environment, it provides a high-fidelity window into how events travel through the DOM.

![EventFlow Preview](https://via.placeholder.com/1200x600/0a0a0c/00d2ff?text=EventFlow+Visualization+Interface)

## ✨ Features

- **Real-Time Propagation Visualization:** Watch events journey through the DOM with traveling neon signals and directional arrows.
- **Phase Indicators:** Dedicated badges for **CAPTURE**, **TARGET**, and **BUBBLE** phases that light up in real-time.
- **Interactive Terminal Console:** A DevTools-inspired log system with:
    - Typewriter system initialization.
    - Explicit feedback for `stopPropagation()`.
    - Automated log capping to maintain performance.
    - "Wipe Logs" technical control.
- **Educational Concepts:**
    - **Capturing & Bubbling:** Toggle between modes to see how events behave.
    - **stopPropagation():** Visualize exactly where an event is "killed".
    - **Event Delegation:** High-performance event handling demonstration.
    - **Once Listener:** Satisfying one-time interaction with neon particle bursts.
- **Premium Aesthetics:**
    - Cinematic background with floating neon orbs and depth lighting.
    - Glassmorphism interface with high-contrast neon accents.
    - Responsive layout that adapts from mobile stacks to wide command centers.
- **Accessibility First:** Full keyboard support (`Tab`, `Enter`, `Space`) and ARIA-compliant structure.

## 🚀 Getting Started

### Prerequisites

No complex setup is required. You just need a modern web browser.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/eventflow.git
   ```
2. Open `index.html` in your browser.

## 🛠️ Built With

- **HTML5:** Semantic structure and ARIA integration.
- **CSS3:** Advanced animations, custom properties, and glassmorphism.
- **JavaScript (Vanilla):** High-performance event logic and async visualization playback.

## 📖 How It Works

1. **Interact:** Click any of the nested boxes (Grandparent, Parent, Child).
2. **Observe:** Watch the neon signal travel. Descending signals are **Cyan** (Capturing), and ascending signals are **Purple** (Bubbling).
3. **Analyze:** Read the Live Event Console to see the technical metadata of each caught event.
4. **Experiment:** Toggle `stopPropagation()` to see how it halts the flow, or use the "Once" button to trigger a unique system event.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Designed with 💙 for the developer community.*
