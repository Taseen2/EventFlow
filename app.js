/**
 * ============================================================
 * EVENTFLOW LOGIC (Senior-Level Refactor)
 * ============================================================
 * This script manages the interaction, state, and visualization
 * of JavaScript Event Propagation (Capturing and Bubbling).
 */

// 1. STATE MANAGEMENT
// --------------------
// Tracks the current configuration and animation status of the app.
const state = {
    isCapturing: false,  // If true, logs Capturing phase; if false, logs Bubbling phase.
    stopProp: false,     // If true, event.stopPropagation() is called.
    logs: [],            // Stores history of events to display in the console.
    isAnimating: false   // Prevents overlapping animation sequences.
};

// 2. DOM ELEMENT SELECTORS
// -------------------------
const boxes = document.querySelectorAll('.box');
const logContainer = document.getElementById('log-history');
const pathOverlay = document.getElementById('path-overlay');
const timelineNodes = document.querySelectorAll('.timeline-node');

// 3. QUEUE SYSTEM
// ----------------
// Because event propagation is instant in JS, we record all steps 
// into this queue first, then "play them back" with a delay so 
// the user can actually see the movement.
let flowQueue = [];

/**
 * INITIALIZATION
 * Attaches the core listeners to all boxes and the window.
 */
function attachListeners() {
    boxes.forEach(box => {
        // We listen to BOTH phases so we can record the full journey.
        box.addEventListener('click', recordEvent, { capture: true });
        box.addEventListener('click', recordEvent, { capture: false });
        
        // ACCESSIBILITY: Allow keyboard users to "click" via Enter or Space.
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                box.click();
            }
        });
    });

    // We also track the window to show where the event starts and ends.
    window.addEventListener('click', recordWindowEvent, { capture: true });
    window.addEventListener('click', recordWindowEvent, { capture: false });
}

/**
 * WINDOW EVENT RECORDER
 * Catches the very beginning and very end of the propagation cycle.
 */
function recordWindowEvent(e) {
    // We only care about clicks that happen inside our playground boxes.
    if (!e.target.closest('.box')) return;
    
    // If this is the start (Capture phase at Window) and we aren't already animating...
    if (e.eventPhase === 1 && !state.isAnimating) {
        startNewFlow();
    }
    
    // Add the window step to our playback queue.
    flowQueue.push({
        type: 'window',
        phase: e.eventPhase,
        nodeId: e.eventPhase === 1 ? 'window-cap' : 'window-bub'
    });
}

/**
 * BOX EVENT RECORDER
 * Records every time an event "hits" a box during its journey.
 */
function recordEvent(e) {
    // PREVENT DOUBLE-TARGET: In standard propagation, the "Target" phase 
    // triggers both capture and bubble listeners. We deduplicate this 
    // so the box only pulses once when it is the direct target.
    const isDoubleTarget = e.eventPhase === 2 && flowQueue.some(s => s.element === this && s.phase === 2);
    if (isDoubleTarget) return;

    // Record the technical details of this step.
    flowQueue.push({
        type: 'box',
        element: this,
        target: e.target,
        phase: e.eventPhase,
        name: this.dataset.name,
        color: getComputedStyle(this).borderColor
    });

    // STOP PROPAGATION LOGIC:
    // If the user enabled this, we kill the event journey here.
    if (state.stopProp) {
        e.stopPropagation();
        flowQueue.push({ type: 'terminated', element: this });
    }
}

/**
 * START NEW FLOW
 * Resets visuals and prepares the playback system.
 */
function startNewFlow() {
    state.isAnimating = true;
    flowQueue = [];
    pathOverlay.innerHTML = '';
    resetPhaseBadges();
    
    // We use a tiny timeout to ensure all browser events are recorded 
    // into the queue before we start the playback loop.
    setTimeout(playBackFlow, 50);
}

/**
 * PLAYBACK SYSTEM (The "Engine")
 * This function iterates through our recorded queue and triggers 
 * the visual animations one by one with a delay.
 */
async function playBackFlow() {
    let lastElement = null;

    for (const step of flowQueue) {
        // Wait 180ms between steps so the user can follow the signal.
        await new Promise(r => setTimeout(r, 180));

        // Step 1: Update the Window Nodes on the timeline
        if (step.type === 'window') {
            animateTimelineNode(step.nodeId, 'white');
            updatePhaseBadges(step.phase);
        } 
        // Step 2: Animate a Box step
        else if (step.type === 'box') {
            visualizeBoxStep(step, lastElement);
            lastElement = step.element;
            
            // LOGGING LOGIC:
            // We only add to the console if the step matches the user's toggle (Capture/Bubble).
            const shouldLog = (state.isCapturing && step.phase === 1) || 
                              (!state.isCapturing && step.phase === 3) ||
                              step.phase === 2;

            if (shouldLog) {
                const phaseName = step.phase === 1 ? 'CAPTURING' : (step.phase === 3 ? 'BUBBLING' : 'TARGET');
                addLog({
                    target: step.target.dataset.name || 'Element',
                    currentTarget: step.name,
                    phase: phaseName
                });
            }
        }
        // Step 3: Handle a stopped event
        else if (step.type === 'terminated') {
            addLog({
                target: 'SYSTEM',
                currentTarget: 'HALTED',
                phase: 'STOP_PROPAGATION',
                special: true // Triggers the red-themed log
            });
            break; // Stop processing the rest of the queue
        }
    }
    
    state.isAnimating = false; // System ready for next click
}

/**
 * VISUALIZE BOX STEP
 * Triggers the box pulse, updates the timeline, and draws the path signal.
 */
function visualizeBoxStep(step, fromElement) {
    const el = step.element;
    
    // Trigger the CSS pulse animation
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 500);

    // Update the Phase Badges (Capture -> Target -> Bubble)
    updatePhaseBadges(step.phase);
    
    // Highlight the corresponding node on the timeline track
    let nodeId = step.phase === 3 ? `${step.name.toLowerCase()}-bub` : step.name.toLowerCase();
    animateTimelineNode(nodeId, step.color);

    // Draw the neon path and traveling signal
    if (fromElement && fromElement !== el) {
        // Capture signals are Cyan, Bubble signals are Purple.
        const color = step.phase === 1 ? 'var(--neon-blue)' : 'var(--neon-purple)';
        drawPathLine(fromElement, el, color);
    }
}

/**
 * GEOMETRY: DRAW PATH LINE
 * Calculates the distance between two elements and creates an animated 
 * connecting line with a traveling dot.
 */
function drawPathLine(from, to, color) {
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const overlayRect = pathOverlay.getBoundingClientRect();
    
    // Calculate coordinates relative to the overlay container.
    // We draw from the top-center of each box to avoid the 0px centering issue.
    const x1 = fromRect.left + fromRect.width / 2 - overlayRect.left;
    const y1 = fromRect.top - overlayRect.top + 5; 
    const x2 = toRect.left + toRect.width / 2 - overlayRect.left;
    const y2 = toRect.top - overlayRect.top + 5;
    
    // Standard geometry to find length and rotation angle
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    // Create the line element
    const line = document.createElement('div');
    line.className = 'path-line';
    line.style.width = `${length}px`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = '0 50%';
    line.style.opacity = '1';
    line.style.backgroundColor = color;
    line.style.color = color; // For the arrowhead border
    
    // Create the traveling "signal" dot
    const signal = document.createElement('div');
    signal.className = 'path-signal';
    signal.style.setProperty('--travel-dist', `${length}px`);
    line.appendChild(signal);
    
    // Inject and then cleanup after animation
    pathOverlay.appendChild(line);
    setTimeout(() => {
        line.style.opacity = '0';
        setTimeout(() => line.remove(), 300);
    }, 600);
}

/**
 * UI: UPDATE PHASE BADGES
 * Highlights the current phase (Capture, Target, or Bubble) at the top of the playground.
 */
function updatePhaseBadges(phase) {
    resetPhaseBadges();
    if (phase === 1) document.getElementById('badge-capture').classList.add('active');
    else if (phase === 2) document.getElementById('badge-target').classList.add('active');
    else if (phase === 3) document.getElementById('badge-bubble').classList.add('active');
}

function resetPhaseBadges() {
    document.querySelectorAll('.phase-badge').forEach(b => b.classList.remove('active'));
}

/**
 * UI: ANIMATE TIMELINE NODE
 * Glows a specific dot on the horizontal console timeline.
 */
function animateTimelineNode(nodeId, color) {
    const node = document.querySelector(`[data-node="${nodeId}"]`);
    if (node) {
        node.classList.add('active');
        node.style.color = color;
        setTimeout(() => node.classList.remove('active'), 600);
    }
}

/**
 * CONSOLE: ADD LOG
 * Creates a new log object, handles capping, and triggers the UI render.
 */
function addLog({ target, currentTarget, phase, special = false }) {
    const log = {
        target,
        currentTarget,
        phase,
        special,
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    
    state.logs.push(log);
    
    // PERFORMANCE: Limit history to 50 logs so the browser doesn't slow down.
    if (state.logs.length > 50) state.logs.shift();
    
    renderLogs();
}

/**
 * CONSOLE: RENDER LOGS
 * Transforms the log data into HTML elements.
 */
function renderLogs() {
    // EMPTY STATE: Show terminal initialization if no logs exist.
    if (state.logs.length === 0) {
        logContainer.innerHTML = `
            <div class="empty-log-state">
                <div class="placeholder-line">> System initialized...</div>
                <div class="placeholder-line">> Listening for DOM events...</div>
                <div class="placeholder-line">> Waiting for interaction...<span class="terminal-cursor"></span></div>
            </div>
        `;
        return;
    }

    // MAP logs to HTML strings
    logContainer.innerHTML = state.logs.map(log => `
        <div class="log-entry ${log.special ? 'log-terminated' : ''}">
            <span class="log-time">${log.time}</span>
            <span class="log-phase">${log.phase}</span>
            <span class="log-target">${log.currentTarget}</span> 
            ${log.special ? '!! PROPAGATION HALTED' : `caught event from <span class="log-target">${log.target}</span>`}
        </div>
    `).join('');
    
    // Auto-scroll to bottom
    logContainer.scrollTop = logContainer.scrollHeight;
}

// 4. CONTROL LISTENERS
// --------------------
document.getElementById('capture-toggle').addEventListener('change', (e) => state.isCapturing = e.target.checked);
document.getElementById('stop-prop-toggle').addEventListener('change', (e) => state.stopProp = e.target.checked);
document.getElementById('clear-logs').addEventListener('click', () => {
    state.logs = [];
    renderLogs();
});

/**
 * BONUS: ONCE LISTENER
 * Demonstates the { once: true } option.
 */
const onceBtn = document.getElementById('once-btn');
onceBtn.addEventListener('click', (e) => {
    createParticleBurst(onceBtn);
    addLog({ target: 'Once Button', currentTarget: 'Self', phase: 'ONCE' });
    onceBtn.disabled = true;
    onceBtn.textContent = "Used";
    onceBtn.classList.add('success-glow');
}, { once: true });

// Visual effect for the Once button
function createParticleBurst(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.background = ['#00d2ff', '#9d50bb', '#00ff88'][Math.floor(Math.random() * 3)];
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 100 + 50;
        p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
        p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
        p.style.left = `${rect.left + rect.width/2}px`;
        p.style.top = `${rect.top + rect.height/2}px`;
        p.style.position = 'fixed';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
}

/**
 * BONUS: EVENT DELEGATION
 * Demonstrates how one parent listener can handle many dynamically added children.
 */
document.getElementById('delegation-area').addEventListener('click', (e) => {
    // We check if the click target is an ".item"
    if (e.target.classList.contains('item')) {
        addLog({ target: e.target.dataset.name, currentTarget: 'Delegation Area', phase: 'DELEGATED' });
    }
});

// Logic to add new items to the delegation area
document.getElementById('add-item').addEventListener('click', () => {
    const container = document.querySelector('.items-container');
    const id = container.children.length + 1;
    const item = document.createElement('div');
    item.className = 'item';
    item.dataset.name = `Item ${id}`;
    item.textContent = `Item ${id}`;
    container.appendChild(item);
});

// 5. BOOTSTRAP
// -------------
attachListeners();
renderLogs(); // Show initial terminal state
