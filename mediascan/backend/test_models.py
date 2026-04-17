import sys
import os

# Add the current directory to path
sys.path.append(os.getcwd())

try:
    from models.ai_models import model_manager
    print("Attempting to load models...")
    model_manager.load_models()
    
    loaded = []
    for key in ['eye', 'palm', 'retina', 'skin']:
        if model_manager.get_model(key):
            loaded.append(key)
    
    print(f"Loaded models: {loaded}")
    if not loaded:
        print("ERROR: No models loaded!")
    elif len(loaded) < 4:
        print(f"WARNING: Only {len(loaded)}/4 models loaded.")
    else:
        print("SUCCESS: All models loaded correctly.")

except Exception as e:
    print(f"CRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
