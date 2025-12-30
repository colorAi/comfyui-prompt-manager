I will implement the "Drag and Drop to Create Node" feature as requested.

**Implementation Plan:**

1.  **Make Cards Draggable**:
    *   Modify `js/prompt_collector.js` to add `draggable="true"` to the prompt cards.
    *   Add a `dragstart` event handler to attach the Prompt ID to the drag data.

2.  **Handle Drop on Canvas**:
    *   Add a `drop` event listener to the ComfyUI Canvas (`app.canvas.canvas`).
    *   When a card is dropped:
        1.  Get the drop coordinates.
        2.  Create a new `PromptManagerNode`.
        3.  Automatically fill in the **Category**, **Prompt Title**, and **Content** based on the dropped card.
        4.  Add the node to the workflow.

This will allow you to drag a card from the floating window directly onto the workspace to create a ready-to-use node.