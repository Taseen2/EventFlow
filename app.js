/**
 * EventFlow Logic (Senior-Level Refactor)
 * 
 * CORE FIXES:
 * 1. Async Visualization Queue: Slows down propagation so the eye can follow the "signal".
 * 2. Geometry Correction: Draws paths between box boundaries to fix the 0px centering bug.
 * 3. Log Limiting: Prevents DOM pollution by capping history at 50 entries.
 * 4. StopProp Intelligence: Logs explicit termination when propagation is halted.
 * 5. Phase-Specific Colors: Distinguishes Capture (Cyan) from Bubble (Purple).
 */

const state = {
    isCapturing: false,
    stopProp: false,
    logs: [],
    isAnimating: false
};

const boxes = document.querySelectorAll('.box');
const logContainer = document.getElementById('log-history');
const pathOverlay = document.getElementById('path-overlay');
const timelineNodes = document.querySelectorAll('.timeline-node');

let flowQueue = [];
let playbackTimer = null;

/**
 * Initialization
 */
function attachListeners() {
    boxes.forEach(box => {
        box.addEventListener('click', recordEvent, { capture: true });
        box.addEventListener('click', recordEvent, { capture: false });
        
        // Accessibility: Keyboard support
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                box.click();
            }
        });
    });

    window.addEventListener('click', recordWindowEvent, { capture: true });
    window.addEventListener('click', recordWindowEvent, { capture: false });
}

/**
 * Recording System
 * Captures all events in a single tick, then plays them back slowly.
 */
function recordWindowEvent(e) {
    if (!e.target.closest('.box')) return;
    
    if (e.eventPhase === 1 && !state.isAnimating) {
        startNewFlow();
    }
    
    flowQueue.push({
        type: 'window',
        phase: e.eventPhase,
        nodeId: e.eventPhase === 1 ? 'window-cap' : 'window-bub'
    });
}

function recordEvent(e) {
    // Prevent double-recording at Target phase (Capture listener + Bubble listener)
    const isDoubleTarget = e.eventPhase === 2 && flowQueue.some(s => s.element === this && s.phase === 2);
    if (isDoubleTarget) return;

    flowQueue.push({
        type: 'box',
        element: this,
        target: e.target,
        phase: e.eventPhase,
        name: this.dataset.name,
        color: getComputedStyle(this).borderColor
    });

    // Handle stopPropagation
    if (state.stopProp) {
        e.stopPropagation();
        flowQueue.push({ type: 'terminated', element: this });
    }
}

function startNewFlow() {
    state.isAnimating = true;
    flowQueue = [];
    pathOverlay.innerHTML = '';
    resetPhaseBadges();
    
    // Brief delay to allow all listeners to record
    setTimeout(playBackFlow, 50);
}

/**
 * Playback System
 */
async function playBackFlow() {
    let lastElement = null;

    for (const step of flowQueue) {
        await new Promise(r => setTimeout(r, 180)); // Educational delay

        if (step.type === 'window') {
            animateTimelineNode(step.nodeId, 'white');
            updatePhaseBadges(step.phase);
        } 
        else if (step.type === 'box') {
            visualizeBoxStep(step, lastElement);
            lastElement = step.element;
            
            // Conditional Logging
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
        else if (step.type === 'terminated') {
            addLog({
                target: 'SYSTEM',
                currentTarget: 'HALTED',
                phase: 'STOP_PROPAGATION',
                special: true
            });
            break; // Stop playback
        }
    }
    
    state.isAnimating = false;
}

function visualizeBoxStep(step, fromElement) {
    const el = step.element;
    
    // Pulse
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 500);

    // Timeline
    updatePhaseBadges(step.phase);
    let nodeId = step.phase === 3 ? `${step.name.toLowerCase()}-bub` : step.name.toLowerCase();
    animateTimelineNode(nodeId, step.color);

    // Path Line with directional signal
    if (fromElement && fromElement !== el) {
        drawPathLine(fromElement, el, step.phase === 1 ? 'var(--neon-blue)' : 'var(--neon-purple)');
    }
}

/**
 * Geometry Correction
 * Draws from Top-Center to Top-Center to avoid 0px length bug in nested elements.
 */
function drawPathLine(from, to, color) {
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const overlayRect = pathOverlay.getBoundingClientRect();
    
    // Calculate offsets to draw between top boundaries
    const x1 = fromRect.left + fromRect.width / 2 - overlayRect.left;
    const y1 = fromRect.top - overlayRect.top + 5; // Slight inset
    const x2 = toRect.left + toRect.width / 2 - overlayRect.left;
    const y2 = toRect.top - overlayRect.top + 5;
    
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    const line = document.createElement('div');
    line.className = 'path-line';
    line.style.width = `${length}px`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = '0 50%';
    line.style.opacity = '1';
    line.style.backgroundColor = color;
    line.style.color = color;
    
    const signal = document.createElement('div');
    signal.className = 'path-signal';
    signal.style.setProperty('--travel-dist', `${length}px`);
    line.appendChild(signal);
    
    pathOverlay.appendChild(line);
    setTimeout(() => {
        line.style.opacity = '0';
        setTimeout(() => line.remove(), 300);
    }, 600);
}

/**
 * UI Support Functions
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

function animateTimelineNode(nodeId, color) {
    const node = document.querySelector(`[data-node="${nodeId}"]`);
    if (node) {
        node.classList.add('active');
        node.style.color = color;
        setTimeout(() => node.classList.remove('active'), 600);
    }
}

function addLog({ target, currentTarget, phase, special = false }) {
    const log = {
        target,
        currentTarget,
        phase,
        special,
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    
    state.logs.push(log);
    
    // Limit log size to 50 entries
    if (state.logs.length > 50) state.logs.shift();
    
    renderLogs();
}

function renderLogs() {
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

    logContainer.innerHTML = state.logs.map(log => `
        <div class="log-entry ${log.special ? 'log-terminated' : ''}">
            <span class="log-time">${log.time}</span>
            <span class="log-phase">${log.phase}</span>
            <span class="log-target">${log.currentTarget}</span> 
            ${log.special ? '!! PROPAGATION HALTED' : `caught event from <span class="log-target">${log.target}</span>`}
        </div>
    `).join('');
    
    logContainer.scrollTop = logContainer.scrollHeight;
}

/**
 * Event Listeners
 */
document.getElementById('capture-toggle').addEventListener('change', (e) => state.isCapturing = e.target.checked);
document.getElementById('stop-prop-toggle').addEventListener('change', (e) => state.stopProp = e.target.checked);
document.getElementById('clear-logs').addEventListener('click', () => {
    state.logs = [];
    renderLogs();
});

// One-time interaction
const onceBtn = document.getElementById('once-btn');
onceBtn.addEventListener('click', (e) => {
    createParticleBurst(onceBtn);
    addLog({ target: 'Once Button', currentTarget: 'Self', phase: 'ONCE' });
    onceBtn.disabled = true;
    onceBtn.textContent = "Used";
    onceBtn.classList.add('success-glow');
}, { once: true });

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

// Delegation
document.getElementById('delegation-area').addEventListener('click', (e) => {
    if (e.target.classList.contains('item')) {
        addLog({ target: e.target.dataset.name, currentTarget: 'Delegation Area', phase: 'DELEGATED' });
    }
});

// Dynamic items
document.getElementById('add-item').addEventListener('click', () => {
    const container = document.querySelector('.items-container');
    const id = container.children.length + 1;
    const item = document.createElement('div');
    item.className = 'item';
    item.dataset.name = `Item ${id}`;
    item.textContent = `Item ${id}`;
    container.appendChild(item);
});

// Boot
attachListeners();
renderLogs();
