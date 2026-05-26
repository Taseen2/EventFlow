# Task 4: Once Listener & Delegation Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a "Once" button and an Event Delegation demo to showcase advanced event handling patterns.

**Architecture:** Add new UI components to `index.html`, style them in `style.css`, and implement the event handling logic in `app.js`.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript.

---

### Task 1: UI Implementation (HTML & CSS)

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] **Step 1: Add HTML for Once Button & Delegation Area**
Add inside the `.app-container`, after the `<main>` element.

```html
<div class="demo-section glass-card">
    <button id="once-btn" class="neon-btn">Click Me Once</button>
    <div id="delegation-area" class="delegation-parent">
        <h3>Event Delegation (Click items)</h3>
        <div class="items-container">
            <div class="item" data-name="Item 1">Item 1</div>
            <div class="item" data-name="Item 2">Item 2</div>
        </div>
        <button id="add-item" class="neon-btn">Add Item</button>
    </div>
</div>
```

- [ ] **Step 2: Add styles for new components**
Append to `style.css`.

```css
.demo-section {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.neon-btn {
    background: transparent;
    border: 2px solid var(--neon-blue);
    color: var(--neon-blue);
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    text-transform: uppercase;
    transition: all 0.3s ease;
    box-shadow: 0 0 5px var(--neon-blue);
}

.neon-btn:hover:not(:disabled) {
    background: var(--neon-blue);
    color: var(--bg-color);
    box-shadow: 0 0 20px var(--neon-blue);
}

.neon-btn:disabled {
    border-color: #444;
    color: #444;
    box-shadow: none;
    cursor: not-allowed;
}

.delegation-parent {
    border: 1px solid var(--glass-border);
    padding: 15px;
    border-radius: 8px;
}

.items-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 15px 0;
}

.item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--neon-purple);
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.item:hover {
    background: rgba(157, 80, 187, 0.2);
    box-shadow: 0 0 10px var(--neon-purple);
}
```

- [ ] **Step 3: Commit UI changes**
```bash
git add index.html style.css
git commit -m "style: add UI components for Task 4"
```

---

### Task 2: Logic Implementation (JavaScript)

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Implement "Once" Listener**
Append to `app.js`.

```javascript
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
```

- [ ] **Step 2: Implement Event Delegation & Add Item Logic**
Append to `app.js`.

```javascript
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
```

- [ ] **Step 3: Commit logic changes**
```bash
git add app.js
git commit -m "feat: add logic for once listener and event delegation"
```

---

### Task 3: Verification

- [ ] **Step 1: Run automated tests**
Run: `npm test task4.test.js` (or `npx vitest run task4.test.js`)
Expected: All tests in `task4.test.js` PASS.

- [ ] **Step 2: Final Review**
Verify that the implementation matches the requirements and follows the project's coding style.
