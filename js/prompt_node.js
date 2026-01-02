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

            const options = filtered.map(p => `[${p.id.slice(-4)}] ${p.title}`);
            options.unshift("🎲 随机 (Random)");
            promptWidget.options.values = options;

            // Smart Default: Keep existing if valid, else Random
            const currentVal = promptWidget.value;
            const isValid = currentVal && options.includes(currentVal) && currentVal !== "🎲 随机 (Random)" && currentVal !== "--- Select ---";

            if (isValid) {
                promptWidget.value = currentVal;
            } else {
                promptWidget.value = "🎲 随机 (Random)";
                // Auto-pick random
                if (filtered.length > 0) {
                    const randomP = filtered[Math.floor(Math.random() * filtered.length)];
                    contentWidget.value = randomP.content;
                } else {
                    contentWidget.value = "";
                }
            }
        };

        // Helper: Find prompt object from string value
        const getPromptFromValue = (val) => {
            if (!val || val === "--- Select ---" || val === "🎲 随机 (Random)") return null;
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
            if (val === "🎲 随机 (Random)") {
                const category = categoryWidget.value;
                let filtered = allData.prompts;
                if (category && category !== "All") {
                    filtered = filtered.filter(p => p.category === category);
                }
                if (filtered.length > 0) {
                    const randomP = filtered[Math.floor(Math.random() * filtered.length)];
                    contentWidget.value = randomP.content;
                }
                return;
            }

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
                if (window.pmShowToast) window.pmShowToast("⚠️ 内容不能为空");
                else alert("Content is empty!");
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
                        if (window.pmShowToast) window.pmShowToast("✅ 保存成功");
                        else alert("Saved!");
                        // Refresh data
                        fetchData();
                    } else {
                        if (window.pmShowToast) window.pmShowToast("❌ 保存失败");
                        else alert("Error saving.");
                    }
                });
            } else {
                if (window.pmShowToast) window.pmShowToast("⚠️ 请先选择一个提示词，或使用新建按钮");
                else alert("Please select a prompt to update, or use the '+' button to create a new one.");
            }
        });

        // Add "+" Button for New Prompt
        node.addWidget("button", "+ New Prompt", null, () => {
            const newContent = contentWidget.value;
            if (!newContent) {
                if (window.pmShowToast) window.pmShowToast("⚠️ 内容不能为空");
                else alert("Content is empty! Please enter some prompt text first.");
                return;
            }

            const saveLogic = (name) => {
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
                        if (window.pmShowToast) window.pmShowToast("✅ 创建成功");
                        else alert("Created!");
                        fetchData();
                    } else {
                        if (window.pmShowToast) window.pmShowToast("❌ 创建失败");
                        else alert("Error creating.");
                    }
                });
            };

            if (window.pmShowInput) {
                window.pmShowInput("新建提示词", "请输入标题", saveLogic);
            } else {
                const name = prompt("Enter title for new prompt:", "New Prompt");
                if (name) saveLogic(name);
            }
        });

        // Helper: Pick random prompt and update content
        const pickRandomPrompt = () => {
            const category = categoryWidget.value;
            let filtered = allData.prompts;
            if (category && category !== "All") {
                filtered = filtered.filter(p => p.category === category);
            }
            if (filtered.length > 0) {
                const randomP = filtered[Math.floor(Math.random() * filtered.length)];
                contentWidget.value = randomP.content;
            }
        };

        // Add method to node for external triggering (used by queuePrompt hook)
        node.triggerRandomIfNeeded = function () {
            if (promptWidget.value === "🎲 随机 (Random)") {
                pickRandomPrompt();
            }
        };

        // Initial Fetch
        fetchData();
    },

    // Hook into app.queuePrompt to trigger random ONLY when workflow is run
    setup() {
        const origQueuePrompt = app.queuePrompt;
        app.queuePrompt = async function (...args) {
            // Find all PromptManagerNodes and trigger random
            for (const node of app.graph._nodes) {
                if (node.comfyClass === "PromptManagerNode" && node.triggerRandomIfNeeded) {
                    node.triggerRandomIfNeeded();
                }
            }
            return origQueuePrompt.apply(this, args);
        };
    }
});
