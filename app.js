/**
 * EventFlow Logic
 * 
 * This application demonstrates the core concepts of JavaScript Event Propagation.
 * 
 * 1. CAPTURING: The event starts from the Window and moves down to the target element.
 * 2. BUBBLING: The event "bubbles up" from the target element back to the Window.
 * 3. STOP PROPAGATION: Prevents the event from continuing its journey (either up or down).
 * 4. DELEGATION: Using a single listener on a parent to handle events for multiple children.
 * 5. ONCE: A listener that automatically removes itself after one execution.
 */

const state = {
    isCapturing: false,
    stopProp: false,
    logs: []
};

const boxes = document.querySelectorAll('.box');
const logContainer = document.getElementById('log-history');

/**
 * Re-attaches listeners to the boxes.
 * We use the 'capture' option to switch between Capturing and Bubbling phases.
 */
function attachListeners() {
    boxes.forEach(box => {
        // We remove both phases to ensure a clean slate
        box.removeEventListener('click', logEvent, true);
        box.removeEventListener('click', logEvent, false);

        // Add listener based on current state (Capturing vs Bubbling)
        box.addEventListener('click', logEvent, { capture: state.isCapturing });
    });
}

function logEvent(e) {
    /**
     * stopPropagation() stops the event from moving further in the DOM tree.
     * If enabled, the parent (in bubbling) or child (in capturing) won't see this event.
     */
    if (state.stopProp) e.stopPropagation();

    // eventPhase: 1 = Capturing, 2 = At Target, 3 = Bubbling
    const phase = e.eventPhase === 1 ? 'CAPTURING' : 'BUBBLING';
    addLog(e, phase);
    
    // Visual feedback trigger
    this.classList.add('active');
    setTimeout(() => this.classList.remove('active'), 500);
}

// Control Listeners
document.getElementById('capture-toggle').addEventListener('change', (e) => {
    state.isCapturing = e.target.checked;
    attachListeners();
});

document.getElementById('stop-prop-toggle').addEventListener('change', (e) => {
    state.stopProp = e.target.checked;
});

document.getElementById('clear-logs').addEventListener('click', () => {
    state.logs = [];
    renderLogs();
});

/**
 * Logs the event details to our internal state and triggers UI update.
 */
function addLog(e, phase) {
    const log = {
        target: e.target.dataset.name || e.target.className,
        currentTarget: e.currentTarget.dataset.name || e.currentTarget.id,
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
    // Auto-scroll to the latest log
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Initial setup
attachListeners();

// --- Additional Concepts ---

/**
 * ONCE Listener:
 * The { once: true } option ensures this function runs exactly once.
 * After clicking, the browser automatically removes the listener.
 */
const onceBtn = document.getElementById('once-btn');
onceBtn.addEventListener('click', () => {
    addLog({ 
        target: { dataset: { name: 'Once Button' }, className: 'neon-btn' }, 
        currentTarget: { id: 'Once Button' } 
    }, 'ONCE');
    onceBtn.disabled = true;
    onceBtn.textContent = "Clicked!";
}, { once: true });

/**
 * EVENT DELEGATION:
 * Instead of adding listeners to every '.item', we add ONE listener to '#delegation-area'.
 * We then check e.target to see which specific item was clicked.
 * This works perfectly even for items added later (dynamic elements).
 */
const delParent = document.getElementById('delegation-area');
delParent.addEventListener('click', (e) => {
    // Only log if we clicked an actual item
    if (e.target.classList.contains('item')) {
        addLog(e, 'DELEGATED');
    }
});

/**
 * Dynamic Item Creation:
 * Demonstrates that delegation still works for brand new elements.
 */
const addItemBtn = document.getElementById('add-item');
const itemsContainer = document.querySelector('.items-container');
addItemBtn.addEventListener('click', () => {
    const newItem = document.createElement('div');
    const itemCount = itemsContainer.querySelectorAll('.item').length + 1;
    newItem.className = 'item';
    newItem.dataset.name = `Item ${itemCount}`;
    newItem.textContent = `Item ${itemCount}`;
    itemsContainer.appendChild(newItem);
});

