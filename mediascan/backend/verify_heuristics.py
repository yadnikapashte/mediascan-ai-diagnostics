import cv2
import numpy as np
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'mediascan', 'backend'))
from models.ai_models import identify_domain

def create_mock_image(texture_type='smooth', saturation='low'):
    # Create 224x224 image
    img = np.zeros((224, 224, 3), dtype=np.uint8)
    
    if texture_type == 'smooth':
        # Smooth skin color (Palm-like)
        img[:, :] = [100, 150, 200] # BGR
    else:
        # High texture (Ulcer-like)
        img = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        
    if saturation == 'high':
        # Highly saturated red (Wound-like)
        img[50:150, 50:150] = [0, 0, 255] # Pure Red
        
    path = f'test_{texture_type}_{saturation}.png'
    cv2.imwrite(path, img)
    return path

# Test 1: Smooth, Low Saturation (Valid Palm)
p1 = create_mock_image('smooth', 'low')
d1 = identify_domain(p1)
print(f"Test 1 (Palm Mock): Detected as {d1}")

# Test 2: Textured, High Saturation (Valid Ulcer)
p2 = create_mock_image('textured', 'high')
d2 = identify_domain(p2)
print(f"Test 2 (Ulcer Mock): Detected as {d2}")

# Cleanup
os.remove(p1)
os.remove(p2)
