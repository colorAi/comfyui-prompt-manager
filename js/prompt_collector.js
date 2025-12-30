import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

// Global Styles
const STYLES = `
#prompt-manager-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #e0e0e0;
}
#prompt-manager-overlay {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
}
#prompt-manager-window {
    width: 1100px;
    height: 800px;
    background: #1e1e1e;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    display: flex;
    overflow: hidden;
    border: 1px solid #333;
}
#pm-sidebar {
    width: 220px;
    background: #181818;
    border-right: 1px solid #333;
    padding: 20px;
    display: flex;
    flex-direction: column;
}
.pm-logo {
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    gap: 10px;
}
.pm-category-list {
    flex: 1;
    overflow-y: auto;
}
.pm-category-item {
    padding: 10px 12px;
    margin-bottom: 4px;
    cursor: pointer;
    border-radius: 6px;
    color: #aaa;
    transition: all 0.2s;
    font-size: 14px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.pm-category-item:hover {
    background: #2a2a2a;
    color: #fff;
}
.pm-category-item.active {
    background: #333;
    color: #4caf50;
    font-weight: 500;
}
.pm-cat-delete {
    opacity: 0;
    color: #888;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    transition: all 0.2s;
    margin-left: auto;
}
.pm-category-item:hover .pm-cat-delete {
    opacity: 1;
}
.pm-cat-delete:hover {
    background: rgba(255, 68, 68, 0.2);
    color: #ff4444;
}

.pm-add-category {
    margin-top: 10px;
    padding: 10px;
    border: 1px dashed #444;
    text-align: center;
    color: #666;
    cursor: pointer;
    border-radius: 6px;
    font-size: 13px;
}

.pm-add-category:hover {
    border-color: #666;
    color: #888;
}

.pm-watermark {
    margin-top: 10px;
    font-size: 11px;
    color: #888;
    text-align: center;
    padding-top: 10px;
    border-top: 1px solid #333;
    font-weight: 500;
}

.pm-category-count {
    font-size: 11px;
    color: #fff;
    background: #2a2a2a;
    padding: 2px 6px;
    border-radius: 10px;
    margin-right: 8px;
    min-width: 20px;
    text-align: center;
}

#pm-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #1e1e1e;
}
#pm-topbar {
    height: 60px;
    border-bottom: 1px solid #333;
    display: flex;
    align-items: center;
    padding: 0 20px;
    justify-content: space-between;
}
.pm-search-box {
    position: relative;
    width: 300px;
}
.pm-search-input {
    width: 100%;
    background: #252525;
    border: 1px solid #333;
    padding: 8px 12px;
    border-radius: 6px;
    color: #fff;
    outline: none;
    font-size: 14px;
}
.pm-search-input:focus {
    border-color: #555;
}
.pm-top-actions {
    display: flex;
    gap: 10px;
}
.pm-btn {
    background: #444;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    font-size: 14px;
    transition: background 0.2s;
}
.pm-btn:hover { background: #555; }
.pm-btn-primary {
    background: #4caf50;
}
.pm-btn-primary:hover {
    background: #43a047;
}

#pm-content-area {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 15px;
    align-content: start;
}

.pm-card {
    background: #252525;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
    height: fit-content;
}
.pm-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    border-color: #444;
}
.pm-card-title {
    font-weight: bold;
    color: #fff;
    font-size: 15px;
    word-break: break-all;
}
.pm-card-content {
    font-size: 13px;
    color: #aaa;
    line-height: 1.4;
    max-height: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    white-space: pre-wrap; 
}
.pm-card-actions {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.pm-action-btn-group {
    display: flex;
    gap: 8px;
}
.pm-card-tag {
    font-size: 11px;
    color: #888;
    background: #333;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #444;
}

.pm-icon-btn {
    background: transparent;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 14px;
    padding: 4px;
}
.pm-icon-btn:hover {
    color: #fff;
}
.pm-copy-btn:hover { color: #4caf50; }
.pm-delete-btn:hover { color: #f44336; }

/* Modal & Dialogs */
.pm-modal, .pm-dialog {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 20px;
    z-index: 10001;
    box-shadow: 0 10px 40px rgba(0,0,0,0.8);
}
.pm-dialog-overlay {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 20000;
    display: flex;
    justify-content: center;
    align-items: center;
}
.pm-form-group {
    margin-bottom: 15px;
}
.pm-label {
    display: block;
    margin-bottom: 5px;
    font-size: 13px;
    color: #aaa;
}
.pm-input, .pm-textarea, .pm-select {
    width: 100%;
    background: #1e1e1e;
    border: 1px solid #333;
    padding: 8px;
    border-radius: 4px;
    color: #fff;
    box-sizing: border-box;
    font-family: inherit;
}
.pm-textarea {
    height: 120px;
    resize: vertical;
}
.pm-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}
.pm-btn-secondary {
    background: #444;
    color: #fff;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
}
.pm-btn-danger {
    background: #d32f2f;
    color: #fff;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
}
.pm-btn-danger:hover { background: #b71c1c; }

/* Toast */
.pm-toast {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: #333;
    color: #fff;
    padding: 10px 20px;
    border-radius: 30px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    z-index: 20000;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    font-size: 14px;
    border: 1px solid #444;
}
.pm-toast.show { opacity: 1; }

/* Floating Toggle */
#prompt-collector-toggle {
    position: fixed;
    bottom: 60px; left: 60px;
    width: 50px; height: 50px;
    background: #222;
    border: 2px solid #555;
    border-radius: 50%;
    color: #fff;
    font-size: 24px;
    cursor: grab;
    z-index: 9999;
    display: flex; justify-content: center; align-items: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    transition: transform 0.2s, box-shadow 0.2s;
    user-select: none;
}
#prompt-collector-toggle:hover {
    transform: scale(1.1);
    background: #333;
    box-shadow: 0 6px 16px rgba(0,0,0,0.6);
}
`;

// App State
const state = {
    isOpen: false,
    prompts: [],
    categories: [],
    activeCategory: "All",
    searchQuery: "",
};

// --- DATA ACCESS ---

async function fetchData() {
    try {
        const res = await api.fetchApi("/prompt_collector/data");
        const data = await res.json();
        state.prompts = data.prompts || [];
        state.categories = data.categories || ["未分类"];
        render();
    } catch (e) {
        console.error("Failed to fetch prompts:", e);
    }
}

async function apiAddCategory(name) {
    try {
        const res = await api.fetchApi("/prompt_collector/category/add", {
            method: "POST",
            body: JSON.stringify({ name })
        });
        if (res.status !== 200) throw new Error("API Error");
        return true;
    } catch (e) {
        console.error(e);
        showToast("❌ 创建分类失败");
        return false;
    }
}

async function apiDeleteCategory(name) {
    try {
        const res = await api.fetchApi("/prompt_collector/category/delete", {
            method: "POST",
            body: JSON.stringify({ name })
        });
        if (res.status !== 200) {
            const err = await res.json();
            throw new Error(err.message || "API Error");
        }
        return true;
    } catch (e) {
        console.error(e);
        showToast("❌ 删除分类失败: " + e.message);
        return false;
    }
}

async function apiSavePrompt(prompt) {
    try {
        const res = await api.fetchApi("/prompt_collector/prompt/save", {
            method: "POST",
            body: JSON.stringify({ prompt })
        });
        if (res.status !== 200) throw new Error("API Error");
        return true;
    } catch (e) {
        console.error(e);
        showToast("❌ 保存失败");
        return false;
    }
}

async function apiDeletePrompt(id) {
    try {
        const res = await api.fetchApi("/prompt_collector/prompt/delete", {
            method: "POST",
            body: JSON.stringify({ id })
        });
        if (res.status !== 200) throw new Error("API Error");
        return true;
    } catch (e) {
        console.error(e);
        showToast("❌ 删除失败");
        return false;
    }
}

async function apiBatchSave(category, prompts) {
    try {
        const res = await api.fetchApi("/prompt_collector/batch_save", {
            method: "POST",
            body: JSON.stringify({ category, prompts })
        });
        if (res.status !== 200) throw new Error("API Error");
        return true;
    } catch (e) {
        console.error(e);
        showToast("❌ 批量保存失败");
        return false;
    }
}


// --- IMPORT / EXPORT LOGIC ---

function handleImportClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) parseAndImportFile(file);
    };
    input.click();
}

function parseAndImportFile(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        let newPrompts = [];

        // Determine Target Category
        // If All -> Uncategorized, else Active Category
        const targetCategory = state.activeCategory === 'All' ? '未分类' : state.activeCategory;

        try {
            if (file.name.endsWith('.json')) {
                const json = JSON.parse(text);
                // Check format: Array of objects or just Array of strings?
                // Or standard format { prompts: [], categories: [] }
                let items = [];
                if (Array.isArray(json)) items = json;
                else if (json.prompts) items = json.prompts;

                newPrompts = items.map(p => {
                    const content = typeof p === 'string' ? p : (p.content || "");
                    const title = typeof p === 'string' ? (p.substring(0, 20) + "...") : (p.title || "导入的提示词");
                    return {
                        id: Date.now().toString() + Math.random().toString().slice(2, 5),
                        title: title,
                        category: targetCategory,
                        content: content,
                        timestamp: Date.now()
                    };
                }).filter(p => p.content);

            } else {
                // TXT Parsing: Split by double newline for paragraphs, or single line?
                // User said "One per line or empty line separator".
                // Let's split by double newline first. If only 1 chunk, try single newline.
                let chunks = text.split(/\r?\n\s*\r?\n/);
                if (chunks.length < 2) {
                    chunks = text.split(/\r?\n/);
                }

                newPrompts = chunks.map(chunk => {
                    const content = chunk.trim();
                    if (!content) return null;
                    return {
                        id: Date.now().toString() + Math.random().toString().slice(2, 5),
                        title: content.substring(0, 20).replace(/\n/g, " ") + "...",
                        category: targetCategory,
                        content: content,
                        timestamp: Date.now()
                    };
                }).filter(p => p);
            }

            if (newPrompts.length > 0) {
                showToast("⏳ 正在导入 " + newPrompts.length + " 条提示词...");
                await apiBatchSave(targetCategory, newPrompts);

                // Refresh local state roughly
                state.prompts = [...newPrompts, ...state.prompts];
                // Force full fetch to be safe
                await fetchData();

                showToast("✅ 成功导入 " + newPrompts.length + " 条提示词");
            } else {
                showToast("⚠️ 文件中未找到有效内容");
            }

        } catch (err) {
            console.error(err);
            showToast("❌ 解析文件失败");
        }
    };
    reader.readAsText(file);
}

function handleExportClick() {
    // Export what?
    // If All -> Export All. If Category -> Export Category.
    let dataToExport = state.prompts;
    if (state.activeCategory !== 'All') {
        dataToExport = dataToExport.filter(p => p.category === state.activeCategory);
    }

    // Clean data for export (remove internal IDs?) -> Maybe keep them for re-import dedupe? 
    // Let's keep it simple.

    const exportObj = {
        category: state.activeCategory,
        prompts: dataToExport
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompts_${state.activeCategory}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("✅ 导出成功");
}


// --- UI HELPERS ---

function showToast(msg) {
    let toast = document.getElementById("pm-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "pm-toast";
        toast.className = "pm-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

function showConfirm(title, msg, onConfirm) {
    const dialogHtml = `
        <div class="pm-dialog-overlay" id="pm-confirm-overlay">
            <div class="pm-dialog">
                <h3 style="margin-top:0; color:#fff;">${title}</h3>
                <p style="color:#ccc; font-size:14px; margin-bottom:20px;">${msg}</p>
                <div class="pm-modal-actions">
                    <button class="pm-btn-secondary" id="pm-confirm-cancel">取消</button>
                    <button class="pm-btn-danger" id="pm-confirm-ok">确定</button>
                </div>
            </div>
        </div>
    `;

    const old = document.getElementById("pm-confirm-overlay");
    if (old) old.remove();

    const container = document.createElement("div");
    container.innerHTML = dialogHtml;
    document.body.appendChild(container.firstElementChild);

    const overlay = document.getElementById("pm-confirm-overlay");

    document.getElementById("pm-confirm-cancel").onclick = () => overlay.remove();
    document.getElementById("pm-confirm-ok").onclick = () => {
        onConfirm();
        overlay.remove();
    };
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    }
}

function showInput(title, placeholder, onConfirm) {
    const dialogHtml = `
        <div class="pm-dialog-overlay" id="pm-input-overlay">
            <div class="pm-dialog">
                <h3 style="margin-top:0; color:#fff;">${title}</h3>
                <input type="text" id="pm-dialog-input" class="pm-input" placeholder="${placeholder}" autocomplete="off">
                <div class="pm-modal-actions">
                    <button class="pm-btn-secondary" id="pm-input-cancel">取消</button>
                    <button class="pm-btn-primary" id="pm-input-ok">确定</button>
                </div>
            </div>
        </div>
    `;

    const old = document.getElementById("pm-input-overlay");
    if (old) old.remove();

    const container = document.createElement("div");
    container.innerHTML = dialogHtml;
    document.body.appendChild(container.firstElementChild);

    const overlay = document.getElementById("pm-input-overlay");
    const input = document.getElementById("pm-dialog-input");

    input.focus();
    input.onkeydown = (e) => {
        if (e.key === "Enter") document.getElementById("pm-input-ok").click();
    };

    document.getElementById("pm-input-cancel").onclick = () => overlay.remove();
    document.getElementById("pm-input-ok").onclick = () => {
        const val = input.value.trim();
        if (val) onConfirm(val);
        overlay.remove();
    };
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    }
}


function createStyles() {
    const styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
}

function createToggle() {
    const btn = document.createElement("div");
    btn.id = "prompt-collector-toggle";
    btn.textContent = "📝";
    btn.title = "Prompt Manager";

    // Drag Logic
    let isDragging = false;
    btn.onmousedown = (e) => {
        if (e.button !== 0) return;
        isDragging = false;
        const startX = e.clientX;
        const startY = e.clientY;
        const rect = btn.getBoundingClientRect();

        btn.style.bottom = "auto";
        btn.style.right = "auto";
        btn.style.left = rect.left + "px";
        btn.style.top = rect.top + "px";
        btn.style.cursor = "grabbing";

        const offsetX = startX - rect.left;
        const offsetY = startY - rect.top;

        const onMove = (tm) => {
            if (Math.abs(tm.clientX - startX) > 3 || Math.abs(tm.clientY - startY) > 3) isDragging = true;
            if (isDragging) {
                btn.style.left = (tm.clientX - offsetX) + "px";
                btn.style.top = (tm.clientY - offsetY) + "px";
            }
        };
        const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            btn.style.cursor = "grab";
            if (!isDragging) toggleWindow();
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    };

    document.body.appendChild(btn);
}

function toggleWindow() {
    state.isOpen = !state.isOpen;
    if (state.isOpen) fetchData(); // Refresh on open
    render();
}

function render() {
    let root = document.getElementById("prompt-manager-root");
    if (!root) {
        root = document.createElement("div");
        root.id = "prompt-manager-root";
        document.body.appendChild(root);
    }

    if (!state.isOpen) {
        root.innerHTML = "";
        return;
    }

    // Main Overlay
    root.innerHTML = `
        <div id="prompt-manager-overlay">
            <div id="prompt-manager-window">
                <!-- Sidebar -->
                <div id="pm-sidebar">
                    <div class="pm-logo">📝 Prompt Manager</div>
                    <div class="pm-add-category" onclick="window.pmAddCategory()">+ 新建分类</div>
                    <div class="pm-category-list">
                        <div class="pm-category-item ${state.activeCategory === 'All' ? 'active' : ''}" onclick="window.pmSelectCategory('All')">
                            <span class="pm-category-count">${state.prompts.length}</span>
                            <span>📂 全部 (All)</span>
                        </div>
                        
                        <!-- Uncategorized always visible if exists, or auto-added -->
                        ${state.categories.filter(c => c === '未分类').map(cat => {
        const count = state.prompts.filter(p => p.category === cat).length;
        return `
                            <div class="pm-category-item ${state.activeCategory === cat ? 'active' : ''}" onclick="window.pmSelectCategory('${cat}')">
                                <span class="pm-category-count">${count}</span>
                                <span>📁 ${cat}</span>
                            </div>
                        `}).join('')}

                        <!-- Other categories -->
                        ${state.categories.filter(c => c !== '未分类').map(cat => {
            const count = state.prompts.filter(p => p.category === cat).length;
            return `
                            <div class="pm-category-item ${state.activeCategory === cat ? 'active' : ''}" onclick="window.pmSelectCategory('${cat}')">
                                <span class="pm-category-count">${count}</span>
                                <span>${cat}</span>
                                <div class="pm-cat-delete" title="删除分类" onclick="event.stopPropagation(); window.pmDeleteCategory('${cat}')">✕</div>
                            </div>
                        `}).join('')}
                    </div>
                    <div class="pm-watermark">哔站 HooToo QQ交流群 543917943</div>
                </div>
                
                <!-- Main -->
                <div id="pm-main">
                    <div id="pm-topbar">
                        <div class="pm-search-box">
                            <input type="text" class="pm-search-input" placeholder="搜索提示词..." value="${state.searchQuery}" oninput="window.pmSearch(this.value)">
                        </div>
                        <div class="pm-top-actions">
                            <button class="pm-btn" title="导出当前分类" onclick="window.handleExportClick()">📤 导出</button>
                            <button class="pm-btn" title="导入 JSON/TXT" onclick="window.handleImportClick()">📥 导入</button>
                            <button class="pm-btn" title="添加节点到工作流" onclick="window.pmCreateNode()">➕ 节点</button>
                            <button class="pm-btn pm-btn-primary" onclick="window.pmOpenEditModal()">+ 新建</button>
                        </div>
                    </div>
                    
                    <div id="pm-content-area">
                        ${renderCards()}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Close on overlay click
    const overlay = document.getElementById("prompt-manager-overlay");
    overlay.onclick = (e) => {
        if (e.target.id === "prompt-manager-overlay") toggleWindow();
    };
}

function renderCards() {
    let filtered = state.prompts;

    // Filter by Category
    if (state.activeCategory !== 'All') {
        filtered = filtered.filter(p => p.category === state.activeCategory);
    }

    // Filter by Search
    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q)
        );
    }

    if (filtered.length === 0) {
        return `<div style="color:#666; text-align:center; width:100%; padding-top:50px;">没有找到提示词</div>`;
    }

    return filtered.map(p => `
        <div class="pm-card" draggable="true" ondragstart="window.pmCardDragStart(event, '${p.id}')" ondragend="window.pmCardDragEnd(event)">
            <div class="pm-card-title">${p.title}</div>
            <div class="pm-card-content">${p.content}</div>
            <div class="pm-card-actions">
                ${state.activeCategory === 'All' ? `<span class="pm-card-tag">${p.category}</span>` : '<span></span>'}
                <div class="pm-action-btn-group">
                    <button class="pm-icon-btn pm-copy-btn" title="复制" onclick="window.pmCopy('${p.id}')">📋</button>
                    <button class="pm-icon-btn" title="编辑" onclick="window.pmEdit('${p.id}')">✏️</button>
                    <button class="pm-icon-btn pm-delete-btn" title="删除" onclick="window.pmDelete('${p.id}')">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}

// --- ACTIONS ---

// Close Modal Helper
window.pmCloseModal = () => render();

window.pmSelectCategory = (cat) => {
    state.activeCategory = cat;
    render();
};

window.pmSearch = (val) => {
    state.searchQuery = val;
    render();
};

window.pmAddCategory = () => {
    showInput("新建分类", "请输入分类名称", async (name) => {
        if (state.categories.includes(name)) {
            showToast("⚠️ 分类已存在");
            return;
        }

        if (await apiAddCategory(name)) {
            state.categories.push(name);
            render();
            showToast("✅ 分类已创建");
        }
    });
};

window.pmDeleteCategory = (cat) => {
    if (cat === "未分类") {
        showToast("⚠️ 默认分类不可删除");
        return;
    }
    showConfirm("删除分类", `确定要删除分类 "${cat}" 吗？<br>注意：该操作会删除分类文件！`, async () => {
        if (await apiDeleteCategory(cat)) {
            state.categories = state.categories.filter(c => c !== cat);
            if (state.activeCategory === cat) state.activeCategory = "All";
            state.prompts = state.prompts.filter(p => p.category !== cat);
            render();
            showToast("🗑️ 分类已删除");
        }
    });
};

window.pmOpenEditModal = (id = null) => {
    const isEdit = !!id;
    let data = { title: "", category: state.activeCategory === 'All' ? "未分类" : state.activeCategory, content: "" };

    if (isEdit) {
        data = state.prompts.find(p => p.id === id);
    }

    // Sort categories to put Uncategorized first
    let sortedCats = [...state.categories];
    // Simple sort not really needed if render logic handles it, but for select dropdown:
    if (sortedCats.includes("未分类")) {
        sortedCats = sortedCats.filter(c => c !== "未分类");
        sortedCats.unshift("未分类");
    }

    const modalHtml = `
        <div class="pm-modal">
            <h3 style="margin-top:0; color:#fff;">${isEdit ? '编辑提示词' : '新建提示词'}</h3>
            
            <div class="pm-form-group">
                <label class="pm-label">标题</label>
                <input type="text" id="pm-input-title" class="pm-input" value="${data.title}">
            </div>
            
            <div class="pm-form-group">
                <label class="pm-label">分类</label>
                <select id="pm-input-cat" class="pm-select">
                    ${sortedCats.map(c => `<option value="${c}" ${c === data.category ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
            </div>
            
            <div class="pm-form-group">
                <label class="pm-label">内容</label>
                <textarea id="pm-input-content" class="pm-textarea">${data.content}</textarea>
            </div>
            
            <div class="pm-modal-actions">
                <button class="pm-btn-secondary" onclick="window.pmCloseModal()">取消</button>
                <button class="pm-btn-primary" onclick="window.pmSavePrompt('${id || ''}')">保存</button>
            </div>
        </div>
    `;

    const root = document.getElementById("prompt-manager-root");
    if (!root) return;
    const overlay = root.querySelector("#prompt-manager-overlay");
    const existingModal = root.querySelector(".pm-modal");
    if (existingModal) existingModal.remove();

    const container = document.createElement("div");
    container.innerHTML = modalHtml;
    if (overlay) overlay.appendChild(container.firstElementChild);
};

window.pmSavePrompt = async (id) => {
    const title = document.getElementById("pm-input-title").value;
    const category = document.getElementById("pm-input-cat").value;
    const content = document.getElementById("pm-input-content").value;

    if (!title || !content) {
        showToast("⚠️ 标题和内容不能为空");
        return;
    }

    let newItem = {
        id: id || Date.now().toString(),
        title,
        category,
        content,
        timestamp: Date.now()
    };

    if (await apiSavePrompt(newItem)) {
        if (id) {
            const idx = state.prompts.findIndex(p => p.id === id);
            if (idx !== -1) {
                state.prompts[idx] = newItem;
            }
        } else {
            state.prompts.unshift(newItem);
        }
        render();
        showToast("✅ 保存成功");
    }
};

window.pmDelete = (id) => {
    showConfirm("删除提示词", "确定要删除这条提示词吗？此操作无法撤销。", async () => {
        if (await apiDeletePrompt(id)) {
            state.prompts = state.prompts.filter(p => p.id !== id);
            render();
            showToast("🗑️ 删除成功");
        }
    });
};

window.pmCopy = (id) => {
    const p = state.prompts.find(item => item.id === id);
    if (p) {
        navigator.clipboard.writeText(p.content).then(() => {
            showToast("📋 已复制到剪贴板");
        });
    }
};

window.pmEdit = (id) => {
    window.pmOpenEditModal(id);
};

window.pmCardDragStart = (e, id) => {
    e.dataTransfer.setData("comfy-prompt-id", id);
    e.dataTransfer.effectAllowed = "copy";
    
    // Hide overlay shortly after drag starts to allow ghost image creation
    // and to let the underlying canvas receive dragover events
    setTimeout(() => {
        const overlay = document.getElementById("prompt-manager-overlay");
        if (overlay) {
            overlay.style.opacity = "0";
            overlay.style.pointerEvents = "none";
        }
    }, 50);
};

window.pmCardDragEnd = (e) => {
    const overlay = document.getElementById("prompt-manager-overlay");
    if (overlay) {
        overlay.style.opacity = "1";
        overlay.style.pointerEvents = "auto";
    }
};

function setupCanvasDropListener() {
    const canvasEl = app.canvas.canvas;
    if (!canvasEl) return;

    canvasEl.addEventListener("dragover", (e) => {
        if (e.dataTransfer.types.includes("comfy-prompt-id")) {
            e.preventDefault(); // Allow drop
        }
    });

    canvasEl.addEventListener("drop", (e) => {
        const id = e.dataTransfer.getData("comfy-prompt-id");
        if (!id) return;

        e.preventDefault();
        e.stopPropagation();

        const prompt = state.prompts.find(p => p.id === id);
        if (!prompt) return;

        // Create Node
        const node = LiteGraph.createNode("PromptManagerNode");
        if (!node) {
            showToast("⚠️ 未找到节点类型: PromptManagerNode");
            return;
        }

        node.pos = app.canvas.convertEventToCanvasOffset(e);
        app.graph.add(node);

        // Set Widgets
        // Format: [abcd] Title
        const shortId = prompt.id.length >= 4 ? prompt.id.slice(-4) : prompt.id;
        const promptLabel = `[${shortId}] ${prompt.title}`;

        // We try to set values. Note: The node's internal logic (prompt_node.js) 
        // might overwrite this when it fetches data, but usually setting value works.
        
        // 1. Category
        const catWidget = node.widgets.find(w => w.name === "category");
        if (catWidget) {
            catWidget.value = prompt.category;
        }

        // 2. Prompt Selector
        const promptWidget = node.widgets.find(w => w.name === "prompt");
        if (promptWidget) {
            promptWidget.value = promptLabel;
        }

        // 3. Content
        const contentWidget = node.widgets.find(w => w.name === "content");
        if (contentWidget) {
            contentWidget.value = prompt.content;
        }
        
        showToast("✅ 已创建节点");
        
        // Close the window after successful drop
        if (state.isOpen) {
            toggleWindow();
        }
    });
}

// --- INITIALIZATION ---

app.registerExtension({
    name: "PromptCollector",
    async setup() {
        console.log("Prompt Manager V3 Loaded");
        createStyles();
        createToggle();
        setupCanvasDropListener();

        // Expose helpers globally
        window.handleImportClick = handleImportClick;
        window.handleExportClick = handleExportClick;
        window.pmShowInput = showInput;
        window.pmShowConfirm = showConfirm;
        window.pmShowToast = showToast;
        window.pmCreateNode = function () {
            if (!app.graph) {
                showToast("⚠️ 工作流未初始化");
                return;
            }
            const node = LiteGraph.createNode("PromptManagerNode");
            if (!node) {
                showToast("⚠️ 未找到节点类型: PromptManagerNode");
                return;
            }
            node.pos = [window.scrollX + 200, window.scrollY + 200];
            app.graph.add(node);
            showToast("✅ 已添加节点");
        };
    }
});
