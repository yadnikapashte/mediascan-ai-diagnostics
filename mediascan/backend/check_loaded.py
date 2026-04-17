import sys
import os

# Add the current directory to path
sys.path.append(os.getcwd())

from models.ai_models import model_manager

model_manager.load_models()

for key in ['eye', 'palm', 'retina', 'skin']:
    model = model_manager.get_model(key)
    if model:
        print(f"Model {key} is LOADED")
    else:
        print(f"Model {key} is NOT loaded")
