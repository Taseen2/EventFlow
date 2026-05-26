# Design Spec - Task 4: Once Listener & Delegation Demo

## Purpose
Introduce event listener options (specifically `{ once: true }`) and the Event Delegation pattern to the EventFlow interactive playground.

## Architecture
- **HTML**: Add a new demo section below the main playground/console layout.
- **CSS**: Add styles for the new components (`neon-btn`, `item`, etc.) to match the existing dark/neon theme.
- **JavaScript**: Implement the "once" listener and a delegated click listener on a parent container to handle events from dynamically added children.

## Components
1. **Once Button**: A button that can only be clicked once. After clicking, it disables itself and updates its text.
2. **Delegation Area**: A container for "items" that uses event delegation.
3. **Add Item Button**: A button to dynamically add new items to the delegation container.

## Data Flow
- **Once Button Click**:
  - Triggers a log entry with the phase "ONCE".
  - Disables the button.
  - Changes button text to "Clicked!".
- **Item Click (Delegated)**:
  - Parent container (`#delegation-area`) catches the click event.
  - Checks if the target is an `.item`.
  - Triggers a log entry with the phase "DELEGATION".
- **Add Item Click**:
  - Creates a new `.item` element.
  - Assigns a unique name via `data-name`.
  - Appends it to the `.items-container`.

## Testing Strategy
- **Manual Verification**: Click the "Once" button, verify it only works once. Add items and click them, verify logs appear correctly.
- **Automated Tests**: Run `task4.test.js` using Vitest to ensure all requirements are met.

## Implementation Details
- HTML will be inserted before the closing `</div>` of `.app-container`.
- JavaScript will be appended to the end of `app.js`.
- CSS will be appended to the end of `style.css` to provide basic styling for the new elements.
