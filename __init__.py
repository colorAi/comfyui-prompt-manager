import os
import json
import re
from aiohttp import web
from server import PromptServer

# Constants
EXT_PATH = os.path.dirname(os.path.realpath(__file__))
STORAGE_PATH = os.path.join(EXT_PATH, "storage")
LEGACY_DATA_PATH = os.path.join(EXT_PATH, "prompts.json")

# Ensure storage directory exists
if not os.path.exists(STORAGE_PATH):
    os.makedirs(STORAGE_PATH)

def sanitize_filename(name):
    """Sanitize category name to be safe for filenames."""
    # Replace invalid chars with underscore and strip
    # Also handle the specific case of "未分类" mapping or keeping as is.
    return re.sub(r'[<>:"/\\|?*]', '_', name).strip()

def get_category_path(category_name):
    filename = sanitize_filename(category_name) + ".json"
    return os.path.join(STORAGE_PATH, filename)

def load_category_file(category_name):
    path = get_category_path(category_name)
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[PromptCollector] Error loading category {category_name}: {e}")
        return []

def save_category_file(category_name, prompts):
    path = get_category_path(category_name)
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(prompts, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"[PromptCollector] Error saving category {category_name}: {e}")
        return False

# --- Initialization & Migration ---
def perform_initialization():
    # 1. Ensure Uncategorized exists
    uncategorized_path = get_category_path("未分类")
    if not os.path.exists(uncategorized_path):
        save_category_file("未分类", [])

    # 2. Migration
    if os.path.exists(LEGACY_DATA_PATH):
        print("[PromptCollector] Migrating legacy prompts.json to storage/...")
        try:
            with open(LEGACY_DATA_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            prompts = data.get("prompts", [])
            categories = data.get("categories", ["通用"])
            
            # Ensure all categories in legacy have files
            for cat in categories:
                path = get_category_path(cat)
                if not os.path.exists(path):
                    save_category_file(cat, [])
            
            # Distribute prompts
            cat_map = {cat: [] for cat in categories}
            # Special bucket for implicit
            cat_map["未分类"] = [] 
            
            for p in prompts:
                cat = p.get("category", "未分类")
                if cat not in cat_map:
                    # New category discovered in prompts
                    cat_map[cat] = []
                    if not os.path.exists(get_category_path(cat)):
                         # implicitly create new category file
                         pass 
                cat_map[cat].append(p)
            
            for cat, plist in cat_map.items():
                # Merge with existing if any? No, one-time migration.
                save_category_file(cat, plist)
            
            os.rename(LEGACY_DATA_PATH, LEGACY_DATA_PATH + ".bak")
            print("[PromptCollector] Migration complete.")
        except Exception as e:
            print(f"[PromptCollector] Migration failed: {e}")

perform_initialization()

# --- API Helpers ---

def get_all_data():
    """Aggregates data from all files for the frontend."""
    files = [f for f in os.listdir(STORAGE_PATH) if f.endswith(".json")]
    categories = []
    all_prompts = []
    
    # Process "未分类" first to ensure it's in the list
    if "未分类.json" in files:
        files.remove("未分类.json")
        files.insert(0, "未分类.json")
    else:
        # Create it if missing?
        save_category_file("未分类", [])
        files.insert(0, "未分类.json")

    for filename in files:
        cat_name = os.path.splitext(filename)[0]
        prompts = load_category_file(cat_name)
        categories.append(cat_name)
        all_prompts.extend(prompts)
        
    return {"categories": categories, "prompts": all_prompts}

def find_prompt_in_storage(prompt_id):
    files = [f for f in os.listdir(STORAGE_PATH) if f.endswith(".json")]
    for filename in files:
        cat_name = os.path.splitext(filename)[0]
        prompts = load_category_file(cat_name)
        for i, p in enumerate(prompts):
            if p.get("id") == prompt_id:
                return cat_name, i, prompts
    return None, -1, None

# --- Routes ---

@PromptServer.instance.routes.get("/prompt_collector/data")
async def get_data(request):
    data = get_all_data()
    return web.json_response(data)

@PromptServer.instance.routes.post("/prompt_collector/category/add")
async def add_category(request):
    try:
        req = await request.json()
        name = req.get("name")
        if not name: return web.json_response({"status": "error", "message": "No name"}, status=400)
        
        path = get_category_path(name)
        if os.path.exists(path):
             return web.json_response({"status": "error", "message": "Category exists"}, status=400)
        
        if save_category_file(name, []):
            return web.json_response({"status": "success"})
        else:
            return web.json_response({"status": "error", "message": "Write failed"}, status=500)
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)

@PromptServer.instance.routes.post("/prompt_collector/category/delete")
async def delete_category(request):
    try:
        req = await request.json()
        name = req.get("name")
        if name == "未分类":
             return web.json_response({"status": "error", "message": "Cannot delete default category"}, status=400)

        path = get_category_path(name)
        if os.path.exists(path):
            os.remove(path)
            return web.json_response({"status": "success"})
        return web.json_response({"status": "error", "message": "Not found"}, status=404)
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)

@PromptServer.instance.routes.post("/prompt_collector/prompt/save")
async def save_prompt(request):
    try:
        req = await request.json()
        prompt = req.get("prompt")
        if not prompt or "id" not in prompt:
             return web.json_response({"status": "error", "message": "Invalid data"}, status=400)
        
        target_cat = prompt.get("category", "未分类")
        pid = prompt["id"]
        
        # Move Logic check
        old_cat, old_idx, old_list = find_prompt_in_storage(pid)
        if old_cat and old_cat != target_cat:
            del old_list[old_idx]
            save_category_file(old_cat, old_list)
        
        # Save to target
        target_list = load_category_file(target_cat)
        found = False
        for i, p in enumerate(target_list):
            if p.get("id") == pid:
                target_list[i] = prompt
                found = True
                break
        if not found:
            target_list.insert(0, prompt)
            
        if save_category_file(target_cat, target_list):
            return web.json_response({"status": "success"})
        else:
             return web.json_response({"status": "error", "message": "Save failed"}, status=500)
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)

@PromptServer.instance.routes.post("/prompt_collector/prompt/delete")
async def delete_prompt(request):
    try:
        req = await request.json()
        pid = req.get("id")
        found_cat, found_idx, found_list = find_prompt_in_storage(pid)
        if found_cat:
            del found_list[found_idx]
            save_category_file(found_cat, found_list)
            return web.json_response({"status": "success"})
        return web.json_response({"status": "error", "message": "Not found"}, status=404)
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)

@PromptServer.instance.routes.post("/prompt_collector/batch_save")
async def batch_save(request):
    try:
        req = await request.json()
        category = req.get("category", "未分类")
        new_prompts = req.get("prompts", [])
        
        if not new_prompts:
             return web.json_response({"status": "success", "message": "Nothing to save"})

        current_list = load_category_file(category)
        # Prepend new prompts
        # Assuming new_prompts are already formatted objects
        # We should check ID uniqueness if possible, but for batch import usually just add
        
        # Merge: Add new ones to the top
        current_list = new_prompts + current_list
        
        if save_category_file(category, current_list):
             return web.json_response({"status": "success"})
        else:
             return web.json_response({"status": "error", "message": "Write failed"}, status=500)
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)


# --- Nodes ---

class PromptManagerNode:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        # Load data dynamically for validation
        data = get_all_data()
        
        categories = data.get("categories", ["未分类"])
        # Ensure "All" is option if handled by frontend, though backend storage keys are what matters
        # Frontend adds "All". Backend files don't satisfy "All". 
        # But for validation, if frontend sends "All", we might need it.
        # Actually frontend sends stored category name usually? 
        # JS: updateCategoryWidget sets value to "All" or specific.
        # If user selects "All", "All" is sent.
        if "All" not in categories:
            categories.insert(0, "All")
            
        prompts_data = data.get("prompts", [])
        # Format must match JS: `[${p.id.slice(-4)}] ${p.title}`
        prompts = []
        for p in prompts_data:
            pid = p.get("id", "")
            title = p.get("title", "Untitled")
            short_id = pid[-4:] if len(pid) >= 4 else pid
            prompts.append(f"[{short_id}] {title}")
            
        if not prompts:
            prompts = ["No prompts found"]

        return {
            "required": {
                "category": (categories,),
                "prompt": (prompts,),
                "content": ("STRING", {"multiline": True, "dynamicPrompts": True}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "get_content"
    CATEGORY = "utils"

    # Bypass strict validation because the lists are dynamic on the frontend
    @classmethod
    def VALIDATE_INPUTS(cls, **kwargs):
        return True

    def get_content(self, category, prompt, content):
        return (content,)

NODE_CLASS_MAPPINGS = {
    "PromptManagerNode": PromptManagerNode
}
NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptManagerNode": "Prompt Manager Node"
}
WEB_DIRECTORY = "./js"

print("\033[34m[PromptCollector] \033[0mBackend (Import/Export Ready) loaded.")
