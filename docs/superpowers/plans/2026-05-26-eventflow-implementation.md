# EventFlow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vanilla JS interactive playground for event propagation with a futuristic dark UI.

**Architecture:** State-driven architecture using a central `state` object. UI updates are handled by a `render()` or `updateUI()` function that reacts to state changes.

**Tech Stack:** HTML5, CSS3 (Custom Properties), Vanilla JavaScript.

---

### Task 1: Scaffolding & Theme Base

**Files:**
- Create: `index.html`
- Create: `style.css`

- [ ] **Step 1: Create HTML structure**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EventFlow | Interactive Event Playground</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-main">
    <div class="app-container">
        <header>
            <h1>EventFlow</h1>
            <p>Interactive Event Propagation Visualizer</p>
        </header>
        <main class="split-layout">
            <section id="playground" class="glass-card">
                <!-- Playground Content -->
            </section>
            <section id="console" class="glass-card">
                <div class="console-header">
                    <h2>Live Event Console</h2>
                    <div class="console-controls">
                        <button id="clear-logs">Clear</button>
                    </div>
                </div>
                <div id="log-history" class="log-container"></div>
            </section>
        </main>
    </div>
    <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Initialize CSS Variables & Base Styles**
```css
:root {
    --bg-color: #0a0a0c;
    --card-bg: rgba(20, 20, 25, 0.7);
    --neon-blue: #00d2ff;
    --neon-purple: #9d50bb;
    --neon-pink: #ff007c;
    --text-main: #e0e0e0;
    --glass-border: rgba(255, 255, 255, 0.1);
}

body {
    background-color: var(--bg-color);
    color: var(--text-main);
    font-family: 'Inter', system-ui, sans-serif;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.app-container {
    width: 90vw;
    height: 85vh;
    display: flex;
    flex-direction: column;
}

.split-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    flex-grow: 1;
}

.glass-card {
    background: var(--card-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
}
```

- [ ] **Step 3: Commit**
```bash
git add index.html style.css
git commit -m "chore: initial project scaffolding and theme base"
```

---

### Task 2: Nested Boxes & State Initialization

**Files:**
- Modify: `index.html`
- Create: `app.js`
- Modify: `style.css`

- [ ] **Step 1: Add Nested Boxes to HTML**
Add inside `#playground`:
```html
<div class="box grandparent" data-name="Grandparent">
    <div class="box parent" data-name="Parent">
        <div class="box child" data-name="Child"></div>
    </div>
</div>
```

- [ ] **Step 2: Add Box Styling**
```css
.box {
    padding: 40px;
    border: 2px solid;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.grandparent { border-color: var(--neon-purple); box-shadow: 0 0 10px var(--neon-purple); }
.parent { border-color: var(--neon-blue); box-shadow: 0 0 10px var(--neon-blue); }
.child { border-color: var(--neon-pink); box-shadow: 0 0 10px var(--neon-pink); }
```

- [ ] **Step 3: Initialize State in app.js**
```javascript
const state = {
    isCapturing: false,
    stopProp: false,
    logs: []
};

const boxes = document.querySelectorAll('.box');
const logContainer = document.getElementById('log-history');

function addLog(e, phase) {
    const log = {
        target: e.target.dataset.name || e.target.className,
        currentTarget: e.currentTarget.dataset.name,
        phase: phase,
        time: new Date().toLocaleTimeString()
    };
    state.logs.push(log);
    renderLogs();
}

function renderLogs() {
    logContainer.innerHTML = state.logs.map(log => `
        <div class="log-entry">
            <span class="log-time">${log.time}</span>
            <span class="log-phase">${log.phase}</span>
            <span class="log-target">${log.currentTarget}</span> caught event from <span class="log-target">${log.target}</span>
        </div>
    `).join('');
    logContainer.scrollTop = logContainer.scrollHeight;
}
```

- [ ] **Step 4: Commit**
```bash
git add index.html style.css app.js
git commit -m "feat: add nested boxes and basic logging state"
```

---

### Task 3: Propagation Controls

**Files:**
- Modify: `index.html`
- Modify: `app.js`

- [ ] **Step 1: Add Controls to HTML**
```html
<div class="controls glass-card">
    <label>
        <input type="checkbox" id="capture-toggle"> Capturing Mode
    </label>
    <label>
        <input type="checkbox" id="stop-prop-toggle"> stopPropagation()
    </label>
</div>
```

- [ ] **Step 2: Implement Event Listeners with Re-attachment**
```javascript
function attachListeners() {
    boxes.forEach(box => {
        // Remove old listeners to avoid duplicates
        box.removeEventListener('click', logEvent, true);
        box.removeEventListener('click', logEvent, false);

        // Add new listener based on state
        box.addEventListener('click', logEvent, { capture: state.isCapturing });
    });
}

function logEvent(e) {
    if (state.stopProp) e.stopPropagation();
    const phase = e.eventPhase === 1 ? 'CAPTURING' : 'BUBBLING';
    addLog(e, phase);
    
    // Visual feedback
    this.classList.add('active');
    setTimeout(() => this.classList.remove('active'), 500);
}

document.getElementById('capture-toggle').addEventListener('change', (e) => {
    state.isCapturing = e.target.checked;
    attachListeners();
});

document.getElementById('stop-prop-toggle').addEventListener('change', (e) => {
    state.stopProp = e.target.checked;
});

attachListeners();
```

- [ ] **Step 3: Commit**
```bash
git add index.html app.js
git commit -m "feat: implement capturing and stopPropagation controls"
```

---

### Task 4: Once Listener & Delegation Demo

**Files:**
- Modify: `index.html`
- Modify: `app.js`

- [ ] **Step 1: Add "Once" Button & Delegation Area**
```html
<div class="demo-section">
    <button id="once-btn">Click Me Once</button>
    <div id="delegation-area" class="delegation-parent">
        <h3>Event Delegation (Click items)</h3>
        <div class="item" data-name="Item 1">Item 1</div>
        <div class="item" data-name="Item 2">Item 2</div>
        <button id="add-item">Add Item</button>
    </div>
</div>
```

- [ ] **Step 2: Implement Logic**
```javascript
// Once listener
const onceBtn = document.getElementById('once-btn');
onceBtn.addEventListener('click', () => {
    addLog({ target: { dataset: { name: 'Once Button' } }, currentTarget: { dataset: { name: 'Once Button' } } }, 'ONCE');
    onceBtn.disabled = true;
    onceBtn.textContent = "Clicked!";
}, { once: true });

// Delegation
const delParent = document.getElementById('delegation-area');
delParent.addEventListener('click', (e) => {
    if (e.target.classList.contains('item')) {
        addLog(e, 'DELEGATION');
    }
});
```

- [ ] **Step 3: Commit**
```bash
git add index.html app.js
git commit -m "feat: add once listener and event delegation demo"
```

---

### Task 5: Final Polish & Animations

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Add active glow animations**
```css
.box.active {
    filter: brightness(1.5);
    box-shadow: 0 0 30px var(--neon-blue); /* dynamic in JS? or just static for now */
    transform: scale(1.02);
}

.log-entry {
    padding: 8px;
    border-bottom: 1px solid var(--glass-border);
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
}
```

- [ ] **Step 2: Commit**
```bash
git add style.css
git commit -m "style: add animations and final visual polish"
```
