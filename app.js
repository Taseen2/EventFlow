const state = {
    isCapturing: false,
    stopProp: false,
    logs: []
};

const boxes = document.querySelectorAll('.box');
const logContainer = document.getElementById('log-history');

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

document.getElementById('clear-logs').addEventListener('click', () => {
    state.logs = [];
    renderLogs();
});

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

attachListeners();

// --- Task 4 Logic ---

// Once listener
const onceBtn = document.getElementById('once-btn');
onceBtn.addEventListener('click', () => {
    addLog({ 
        target: { dataset: { name: 'Once Button' }, className: 'neon-btn' }, 
        currentTarget: { dataset: { name: 'Once Button' } } 
    }, 'ONCE');
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

// Add Item Logic
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

