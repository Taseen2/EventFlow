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

