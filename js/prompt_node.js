import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

app.registerExtension({
    name: "comfyui.prompt_manager.node",
    async nodeCreated(node, app) {
        if (node.comfyClass !== "PromptManagerNode") return;

        const categoryWidget = node.widgets.find(w => w.name === "category");
        const promptWidget = node.widgets.find(w => w.name === "prompt");
        const contentWidget = node.widgets.find(w => w.name === "content");

        if (!categoryWidget || !promptWidget || !contentWidget) return;

        let allData = { categories: [], prompts: [] };

        // Helper: Fetch Data
        const fetchData = async () => {
            try {
                const res = await api.fetchApi("/prompt_collector/data");
                allData = await res.json();
                updateCategoryWidget();
            } catch (e) {
                console.error("Prompt Manager Node: Failed to fetch data", e);
            }
        };

        // Helper: Update Category Widget
        const updateCategoryWidget = () => {
            // categories is string array
            const cats = ["All", ...allData.categories];
            categoryWidget.options.values = cats;

            // Allow generic "All" as default if empty
            if (!categoryWidget.value || !cats.includes(categoryWidget.value)) {
                categoryWidget.value = "All";
            }
            updatePromptWidget(categoryWidget.value);
        };

        // Helper: Update Prompt Widget based on category
        const updatePromptWidget = (category) => {
            let filtered = allData.prompts;
            if (category && category !== "All") {
                filtered = filtered.filter(p => p.category === category);
            }
            // Format for widget: "Title (ID)" or just Title if unique? 
            // Let's use internal object mapping if possible, or just names.
            // Widget expect list of strings.
            // We'll store mapping in a temporary way or just lookup by title?
            // Title might duplicate. Let's use "[ID] Title".

            const options = filtered.map(p => `[${p.id.slice(-4)}] ${p.title}`);
            options.unshift("--- Select ---");
            promptWidget.options.values = options;
            promptWidget.value = "--- Select ---";
        };

        // Helper: Find prompt object from string value
        const getPromptFromValue = (val) => {
            if (!val || val === "--- Select ---") return null;
            // val format: "[1234] Title"
            // We really should use ID lookup.
            // Let's try to match ID match.
            const match = val.match(/^\[([a-zA-Z0-9]+)\]/);
            if (match) {
                const shortId = match[1];
                return allData.prompts.find(p => p.id.endsWith(shortId));
            }
            return null;
        }

        // Event: Category Changed
        categoryWidget.callback = (val) => {
            updatePromptWidget(val);
        };

        // Event: Prompt Changed
        promptWidget.callback = (val) => {
            const p = getPromptFromValue(val);
            if (p) {
                contentWidget.value = p.content;
            } else {
                // verify if it is not just typing?
                // if user manually changes combo, we might clear content?
                // No, let user keep content.
            }
        };

        // Add "Update" Button
        node.addWidget("button", "Update / Save", null, () => {
            const pVal = promptWidget.value;
            const currentPrompt = getPromptFromValue(pVal);

            const newContent = contentWidget.value;
            if (!newContent) {
                alert("Content is empty!");
                return;
            }

            if (currentPrompt) {
                // Update existing
                const updated = { ...currentPrompt, content: newContent, timestamp: Date.now() };
                api.fetchApi("/prompt_collector/prompt/save", {
                    method: "POST",
                    body: JSON.stringify({ prompt: updated })
                }).then(res => {
                    if (res.status === 200) {
                        alert("Saved!");
                        // Refresh data
                        fetchData();
                    } else {
                        alert("Error saving.");
                    }
                });
            } else {
                // Save as new?
                // For now, only update existing is requested "update saved template".
                // But user might want to save new.
                // Let's ask user name if new? Or just Alert "Select a prompt to update".
                if (confirm("No existing prompt selected. Create new?")) {
                    const name = prompt("Enter title for new prompt:", "New Prompt");
                    if (name) {
                        const cat = categoryWidget.value === "All" || categoryWidget.value === "Loading..." ? "未分类" : categoryWidget.value;
                        const newP = {
                            id: Date.now().toString(),
                            title: name,
                            category: cat,
                            content: newContent,
                            timestamp: Date.now()
                        };
                        api.fetchApi("/prompt_collector/prompt/save", {
                            method: "POST",
                            body: JSON.stringify({ prompt: newP })
                        }).then(res => {
                            if (res.status === 200) {
                                alert("Created!");
                                fetchData();
                            } else {
                                alert("Error creating.");
                            }
                        });
                    }
                }
            }
        });

        // Initial Fetch
        fetchData();
    }
});
