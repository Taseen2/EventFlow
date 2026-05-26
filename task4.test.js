import { expect, test, describe, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

describe('Task 4: Once Listener & Delegation Demo', () => {
    let dom;
    let document;
    let window;

    beforeEach(() => {
        dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
        window = dom.window;
        document = window.document;

        // Mock scrollTo
        window.Element.prototype.scrollTo = () => {};

        // Load app.js logic
        const scriptContent = fs.readFileSync(path.resolve(__dirname, './app.js'), 'utf8');
        const scriptElement = document.createElement('script');
        scriptElement.textContent = scriptContent;
        document.body.appendChild(scriptElement);
    });

    test('Once button only fires once', () => {
        const onceBtn = document.getElementById('once-btn');
        expect(onceBtn).not.toBeNull();

        onceBtn.click();
        expect(onceBtn.disabled).toBe(true);
        expect(onceBtn.textContent).toBe("Clicked!");

        // Check logs (simulated addLog)
        const logs = document.querySelectorAll('.log-entry');
        expect(logs.length).toBe(1);
        expect(logs[0].textContent).toContain('ONCE');

        // Second click should not trigger log again
        onceBtn.click();
        const logsAfter = document.querySelectorAll('.log-entry');
        expect(logsAfter.length).toBe(1);
    });

    test('Event delegation works for static and dynamic items', () => {
        const delArea = document.getElementById('delegation-area');
        const addItemBtn = document.getElementById('add-item');
        expect(delArea).not.toBeNull();
        expect(addItemBtn).not.toBeNull();

        // Click static item
        const item1 = document.querySelector('.item[data-name="Item 1"]');
        item1.click();
        let logs = document.querySelectorAll('.log-entry');
        expect(logs.length).toBe(1);
        expect(logs[0].textContent).toContain('DELEGATION');
        expect(logs[0].textContent).toContain('Item 1');

        // Add dynamic item
        addItemBtn.click();
        const item3 = document.querySelector('.item[data-name="Item 3"]');
        expect(item3).not.toBeNull();

        // Click dynamic item
        item3.click();
        logs = document.querySelectorAll('.log-entry');
        expect(logs.length).toBe(2);
        expect(logs[1].textContent).toContain('DELEGATION');
        expect(logs[1].textContent).toContain('Item 3');
    });
});
