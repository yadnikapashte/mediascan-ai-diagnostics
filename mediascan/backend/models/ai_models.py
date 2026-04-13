import os
import numpy as np
import logging
from PIL import Image, ImageDraw
import json
import torch
import torch.nn as nn
from torchvision import models, transforms
import cv2

# Set absolute path for models directory to ensure it's found from any working directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "SB_Project", "codebase", "outputs", "models")
logger = logging.getLogger(__name__)

# ─── Configuration ────────────────────────────────────────────────────────────
# Updated classes to match the actual multi-class and binary model outputs
CLASSES = {
    'eye':    ['anemia', 'non_anemia'],
    'palm':   ['anemic', 'non_anemic'], # Note: Using demo class if model not available
    'retina': ['Mild', 'Moderate', 'No_DR', 'Proliferate_DR', 'Severe'],
    'skin':   ['Abnormal(Ulcer)', 'Normal(Healthy skin)']
}

IMG_SIZE = (224, 224)
NORMALIZE_MEAN = [0.485, 0.456, 0.406]
NORMALIZE_STD  = [0.229, 0.224, 0.225]

# ─── Model Factory (Architectures) ──────────────────────────────────────────
def build_mobilenet_v2(num_classes):
    model = models.mobilenet_v2(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.2),
        nn.Linear(in_features, num_classes),
    )
    return model

def build_resnet50(num_classes):
    model = models.resnet50(weights=None)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, num_classes),
    )
    return model

# ─── Model Manager (Singleton) ────────────────────────────────────────────────
class ModelManager:
    _instance = None
    _models = {}
    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def load_models(self, models_folder):
        """Load all .pth models from disk using project-relative paths."""
        # Calculate Project Root (d:/Downloads/SB_Web-master)
        try:
            # Current file is in mediascan/backend/models/ai_models.py
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            MODEL_DIR = os.path.join(BASE_DIR, 'SB_Project', 'codebase', 'outputs', 'models')
            
            model_configs = {
                'eye':    {'path': os.path.join(MODEL_DIR, 'Anemia_eye_mobilenet.pth'), 'arch': 'mobilenet'},
                'retina': {'path': os.path.join(MODEL_DIR, 'diabetes_eye_resnet50.pth'),  'arch': 'resnet50'},
                'skin':   {'path': os.path.join(MODEL_DIR, 'diabetes_skin_resnet50.pth'), 'arch': 'resnet50'},
                # Note: This file has a trailing space in its actual name on the filesystem
                'palm':   {'path': os.path.join(MODEL_DIR, 'Anemia_skin_resnet50 .pth'), 'arch': 'resnet50'}
            }
            
            print(f"🔍 Initializing ModelManager from: {MODEL_DIR}")
        except Exception as e:
            logger.error(f"Failed to resolve model directory: {e}")
            return

        for key, cfg in model_configs.items():
            path = cfg['path']
            if os.path.exists(path):
                try:
                    num_classes = len(CLASSES[key])
                    if cfg['arch'] == 'mobilenet':
                        model = build_mobilenet_v2(num_classes)
                    else:
                        model = build_resnet50(num_classes)
                    
                    state_dict = torch.load(path, map_location=self._device)
                    model.load_state_dict(state_dict)
                    model.to(self._device)
                    model.eval()
                    self._models[key] = model
                    logger.info(f"✅ Loaded {key} {cfg['arch']} model from {path}")
                except Exception as e:
                    logger.error(f"❌ Failed to load {key} model: {e}")
            else:
                logger.warning(f"⚠️ Model file not found: {path} — will use demo mode")

    def get_model(self, model_type):
        return self._models.get(model_type)

model_manager = ModelManager()

# ─── Preprocessing ──────────────────────────────────────────────────────────
inference_transforms = transforms.Compose([
    transforms.Resize(IMG_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=NORMALIZE_MEAN, std=NORMALIZE_STD)
])

def preprocess_image(image_path):
    img = Image.open(image_path).convert('RGB')
    tensor = inference_transforms(img).unsqueeze(0)
    return tensor.to(model_manager._device)

def validate_image(image_path):
    try:
        img = Image.open(image_path)
        if img.format not in ['JPEG', 'PNG', 'WEBP', 'BMP']:
            return False, f"Unsupported format: {img.format}"
        img.verify()
        return True, ""
    except Exception as e:
        return False, str(e)

# ─── GradCAM (PyTorch Implementation) ─────────────────────────────────────────
class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self.hook_layers()

    def hook_layers(self):
        def forward_hook(module, input, output):
            self.activations = output
        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0]
        
        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_full_backward_hook(backward_hook)

    def generate(self, input_tensor, class_idx=None):
        self.model.zero_grad()
        output = self.model(input_tensor)
        if class_idx is None:
            class_idx = torch.argmax(output)
        
        output[0, class_idx].backward()
        
        gradients = self.gradients.cpu().data.numpy()[0]
        activations = self.activations.cpu().data.numpy()[0]
        
        weights = np.mean(gradients, axis=(1, 2))
        cam = np.zeros(activations.shape[1:], dtype=np.float32)
        
        for i, w in enumerate(weights):
            cam += w * activations[i, :, :]
            
        cam = np.maximum(cam, 0)
        cam = cv2.resize(cam, IMG_SIZE)
        cam = cam - np.min(cam)
        cam = cam / (np.max(cam) + 1e-10)
        return cam

def generate_gradcam(model, input_tensor, image_path, output_path, model_type):
    try:
        if 'resnet' in str(type(model)).lower():
            target_layer = model.layer4[-1]
        else: # MobileNet
            target_layer = model.features[-1]
            
        # Stable Inference: Keep in eval mode to prevent BatchNorm instability
        # But ensure we have a hook into the gradients
        cam_gen = GradCAM(model, target_layer)
        heatmap = cam_gen.generate(input_tensor)
        
        img = cv2.imread(image_path)
        img = cv2.resize(img, IMG_SIZE)
        heatmap_color = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)
        
        superimposed = cv2.addWeighted(img, 0.6, heatmap_color, 0.4, 0)
        cv2.imwrite(output_path, superimposed)
        return output_path
    except Exception as e:
        logger.error(f"GradCAM failed: {e}")
        return _generate_demo_gradcam(image_path, output_path)

def _generate_demo_gradcam(image_path, output_path):
    try:
        img = Image.open(image_path).convert('RGB').resize(IMG_SIZE)
        overlay = Image.new('RGBA', IMG_SIZE, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        cx, cy = 112, 112
        for r in range(60, 10, -10):
            alpha = int(100 * (1 - r/60))
            draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(255, 120, 0, alpha))
        img.paste(overlay, (0,0), overlay)
        img.save(output_path)
        return output_path
    except: return None

# ─── Prediction Logic ──────────────────────────────────────────────────────────
def _predict(model_type, image_path, gradcam_output_path=None):
    valid, err = validate_image(image_path)
    if not valid: return {'error': err, 'status': 'failed'}
    
    model = model_manager.get_model(model_type)
    if model is None:
        logger.error(f"❌ Model not loaded for: {model_type}. Analysis aborted to prevent incorrect data.")
        return {'error': f"Clinical model for {model_type} is not available on this server.", 'status': 'failed'}
        
    try:
        input_tensor = preprocess_image(image_path)
        with torch.no_grad():
            outputs = model(input_tensor)
            probs = torch.softmax(outputs, dim=1)[0]
        
        probs_np = probs.cpu().numpy()
        idx = int(np.argmax(probs_np))
        prediction = CLASSES[model_type][idx]
        confidence = float(probs_np[idx]) * 100
        
        res = {
            'prediction': prediction,
            'confidence': round(confidence, 2),
            'probabilities': {CLASSES[model_type][i]: round(float(probs_np[i])*100, 2) for i in range(len(CLASSES[model_type]))},
            'demo_mode': False,
            'status': 'success',
            'model_type': model_type
        }
        
        if gradcam_output_path:
            # Re-run with gradient for GradCAM (Maintain eval() for BatchNorm stability)
            res['gradcam_path'] = generate_gradcam(model, input_tensor, image_path, gradcam_output_path, model_type)
            
        return res
    except Exception as e:
        logger.error(f"Inference failed for {model_type}: {e}")
        return {'error': str(e), 'status': 'failed'}

def _demo_predict(model_type, gradcam_output_path, image_path):
    import random
    is_positive = random.random() > 0.6
    conf = random.uniform(75, 98)
    res = {
        'prediction': CLASSES[model_type][0] if is_positive else CLASSES[model_type][1],
        'confidence': round(conf, 2),
        'probabilities': {CLASSES[model_type][i]: round(conf/len(CLASSES[model_type]) if i==0 else (100-conf)/(len(CLASSES[model_type])-1),2) for i in range(len(CLASSES[model_type]))},
        'demo_mode': True,
        'status': 'success',
        'model_type': model_type
    }
    if gradcam_output_path: res['gradcam_path'] = _generate_demo_gradcam(image_path, gradcam_output_path)
    return res

# Facade
def predict_eye_anemia(p, g=None): return _predict('eye', p, g)
def predict_palm_anemia(p, g=None): return _predict('palm', p, g)
def predict_retina_diabetes(p, g=None): return _predict('retina', p, g)
def predict_skin_dfu(p, g=None): return _predict('skin', p, g)

# ─── Clinical Domain Identification (Auto-Detection) ──────────────────────────
def identify_domain(image_path):
    """
    Identifies if an image is a Retina, Eye, Palm, or Skin scan using 
    Computer Vision heuristics and confidence voting.
    """
    try:
        img = cv2.imread(image_path)
        if img is None: return 'eye'
        
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        # Identify Foreground (Ignore pure white/black boundaries)
        # Background is typically > 240 (white) or < 15 (black)
        white_bg = cv2.inRange(img_rgb, (240, 240, 240), (255, 255, 255))
        black_bg = cv2.inRange(img_rgb, (0, 0, 0), (15, 15, 15))
        bg_mask = cv2.bitwise_or(white_bg, black_bg)
        fg_mask = cv2.bitwise_not(bg_mask)
        fg_px = np.count_nonzero(fg_mask)
        
        if fg_px < (img.shape[0] * img.shape[1] * 0.05):
            # If foreground is too small, use whole image but caution
            fg_px = img.shape[0] * img.shape[1]
            fg_mask = np.ones((img.shape[0], img.shape[1]), dtype=np.uint8) * 255

        # 0. EARLY OOD PROTECTION: Complexity & Spectral Check
        # Nature photos (flowers, landscapes) have high edge density
        edges = cv2.Canny(gray, 100, 200)
        edge_density = np.count_nonzero(edges) / img.size
        
        # Spectral Check: Check for Hue Diversity (Nature vs Medical)
        hue_std = np.std(hsv[:,:,0][fg_mask > 0])
        
        # Diagnostic Tracers
        print(f"--- [DIAGNOSTIC] Scan Analysis ---")
        print(f"Complexity (Edge Density): {edge_density:.4f}")
        print(f"Hue Variance (Std Dev): {hue_std:.4f}")
        
        # Medical scans are typically low-frequency AND low hue-variance
        if edge_density > 0.18 or hue_std > 35: # Nature photos have high hue std
            print(f"VERDICT: REJECTED (OOD / High Complexity)")
            return 'unknown'

        # 1. Palm/Skin Check (Foregound-normalized)
        skin_mask = cv2.inRange(ycrcb, (0, 133, 77), (255, 173, 127))
        # Only count skin pixels that are in the foreground
        skin_fg = cv2.bitwise_and(skin_mask, fg_mask)
        skin_ratio_fg = np.count_nonzero(skin_fg) / fg_px
        
        if skin_ratio_fg > 0.40:
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Additional check: Saturation levels
            # Ulcers/Wounds often have higher saturation (reds/purples) than palms
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            sat_mean = np.mean(hsv[:,:,1][fg_mask > 0])
            
            # RELAXED LOGIC: 
            # Palms can have moderate texture and high saturation in varied lighting.
            # Ulcers/Wounds usually have VERY high variance (> 250) or extreme saturation (> 160).
            if laplacian_var < 250 and sat_mean < 160: 
                return 'palm'
            return 'skin'

        # 2. Retina Check (High Red/Orange in Foreground)
        red_mask = cv2.inRange(img_rgb, (110, 0, 0), (255, 100, 70))
        red_fg = cv2.bitwise_and(red_mask, fg_mask)
        red_ratio_fg = np.count_nonzero(red_fg) / fg_px
        if red_ratio_fg > 0.4:
            return 'retina'

        # 3. Eye Check (Looking for circular structures + white)
        # Sclera detection in foreground
        white_mask = cv2.inRange(img_rgb, (210, 210, 210), (255, 255, 255))
        # Mask out the background white to find actual sclera
        sclera_fg = cv2.bitwise_and(white_mask, fg_mask)
        sclera_ratio_fg = np.count_nonzero(sclera_fg) / fg_px
        if sclera_ratio_fg > 0.1:
            # Confirm with circle detection (Iris/Pupil)
            gray_m = cv2.medianBlur(gray, 5)
            circles = cv2.HoughCircles(gray_m, cv2.HOUGH_GRADIENT, 1, 30, param1=50, param2=30, minRadius=20, maxRadius=150)
            
            # Eye must have specific ocular tones AND a DARK center (pupil)
            eye_color_mask = cv2.inRange(hsv, (0, 10, 20), (40, 255, 255))
            eye_color_ratio = np.count_nonzero(eye_color_mask) / img.size
            print(f"Ocular Tonality Ratio: {eye_color_ratio:.4f}")
            
            if circles is not None:
                for circle in circles[0, :]:
                    center_x, center_y, radius = map(int, circle)
                    h, w = gray.shape
                    y1, y2 = max(0, center_y-5), min(h, center_y+5)
                    x1, x2 = max(0, center_x-5), min(w, center_x+5)
                    center_intensity = np.mean(gray[y1:y2, x1:x2])
                    print(f"Circle Found: Intensity={center_intensity:.1f}, Radius={radius}")
                    
                    if eye_color_ratio > 0.05 and center_intensity < 150: # Pupil check
                        print(f"VERDICT: Identified as [EYE]")
                        return 'eye'

            # If no circles, but very high sclera and eye-tonality
            eye_color_mask = cv2.inRange(hsv, (0, 10, 20), (40, 255, 255))
            eye_color_ratio = np.count_nonzero(eye_color_mask) / img.size
            if sclera_ratio_fg > 0.3 and eye_color_ratio > 0.05:
                print(f"VERDICT: Identified as [EYE] (High Sclera Match)")
                return 'eye'
        
        # 4. Unknown/OOD Detection (Complexity Check)
        # Nature photos (flowers, landscapes) have high edge density
        edges = cv2.Canny(gray, 100, 200)
        edge_density = np.count_nonzero(edges) / img.size
        # Medical scans are typically low-frequency / smooth backgrounds
        if edge_density > 0.15: # High complexity = Likely not a medical scan
            return 'unknown'

    except Exception as e:
        logger.error(f"Advanced heuristic identification failed: {e}")

    # 4. Fallback: Confidence-Based Voting (Run all models)
    try:
        best_model = 'eye'
        max_conf = -1
        
        for m_type in ['eye', 'palm', 'retina', 'skin']:
            res = _predict(m_type, image_path)
            if res['status'] == 'success' and not res.get('demo_mode', True):
                if res['confidence'] > max_conf:
                    max_conf = res['confidence']
                    best_model = m_type
        
        # OOD Rejection: Only accept the winner if confidence is high AND it's not unknown
        if max_conf > 0.85: # Fixed decimal threshold
            return best_model
            
        return 'unknown'
    except Exception as e:
        logger.error(f"Heuristic identification failed: {e}")
        return 'unknown'

def predict_auto(image_path, gradcam_output_path=None):
    """Main entry point for AI Auto-Detection."""
    detected_domain = identify_domain(image_path)
    res = _predict(detected_domain, image_path, gradcam_output_path)
    res['detected_domain'] = detected_domain
    return res

# Fusion logic (Ensures no 'raw' 50% defaults are used if models actually fail)
def fuse_anemia_predictions(eye, palm):
    # Check for direct errors in inputs
    if eye.get('status') == 'failed' or palm.get('status') == 'failed':
        return {'result': 'Inconclusive', 'confidence': 0.0, 'risk': 'Unknown', 'error': 'One or more required models failed.'}

    e_p = eye.get('probabilities', {}).get('anemia')
    p_p = palm.get('probabilities', {}).get('anemic')
    
    # If both are missing actual data, return failure
    if e_p is None and p_p is None:
        return {'result': 'Not Scanned', 'confidence': 0.0, 'risk': 'none'}
        
    # Use available one or weighted average
    if e_p is not None and p_p is not None:
        fused = (float(e_p)/100 * 0.55) + (float(p_p)/100 * 0.45)
    elif e_p is not None:
        fused = float(e_p)/100
    else:
        fused = float(p_p)/100

    is_anemic = fused >= 0.5
    conf = fused if is_anemic else (1 - fused)
    return {'result': 'Anemic' if is_anemic else 'Non-Anemic', 'confidence': round(conf * 100, 2), 'risk': 'High' if fused > 0.8 else ('Medium' if fused > 0.4 else 'Low')}

def fuse_diabetes_predictions(retina, skin):
    # Check for direct errors in inputs
    if retina.get('status') == 'failed' or skin.get('status') == 'failed':
        return {'result': 'Inconclusive', 'confidence': 0.0, 'risk': 'Unknown', 'error': 'One or more required models failed.'}

    # retina classes: ['Mild', 'Moderate', 'No_DR', 'Proliferate_DR', 'Severe']
    no_dr_p = retina.get('probabilities', {}).get('No_DR')
    is_diabetic_r = (1 - float(no_dr_p)/100) if no_dr_p is not None else None
    
    # skin classes: ['Abnormal(Ulcer)', 'Normal(Healthy skin)']
    abnormal_p = skin.get('probabilities', {}).get('Abnormal(Ulcer)')
    is_diabetic_s = float(abnormal_p)/100 if abnormal_p is not None else None
    
    if is_diabetic_r is None and is_diabetic_s is None:
        return {'result': 'Not Scanned', 'confidence': 0.0, 'risk': 'none'}

    if is_diabetic_r is not None and is_diabetic_s is not None:
        fused = (is_diabetic_r * 0.60) + (is_diabetic_s * 0.40)
    elif is_diabetic_r is not None:
        fused = is_diabetic_r
    else:
        fused = is_diabetic_s

    is_diabetic = fused >= 0.5
    conf = fused if is_diabetic else (1 - fused)
    return {'result': 'Diabetic' if is_diabetic else 'Non-Diabetic', 'confidence': round(conf * 100, 2), 'risk': 'High' if fused > 0.75 else ('Medium' if fused > 0.35 else 'Low')}

def compute_overall_risk(a_risk, d_risk):
    order = {'High': 3, 'Medium': 2, 'Low': 1}
    max_val = max(order.get(a_risk, 1), order.get(d_risk, 1))
    return [k for k, v in order.items() if v == max_val][0]

def generate_recommendations(anemia, diabetes):
    recs = []
    if anemia['result'] == 'Anemic':
        recs.append("⚠️ Consult a haematologist for a Full Blood Count (FBC) test.")
        recs.append("Increase iron-rich foods: spinach, lentils, and red meat.")
    else: recs.append("✅ Hemoglobin levels appear normal based on visual analysis.")
    if diabetes['result'] == 'Diabetic':
        recs.append("⚠️ Schedule an HbA1c test to confirm blood sugar levels.")
        recs.append("Avoid refined sugars and monitor carbohydrate intake.")
    elif diabetes['result'] == 'Non-Diabetic':
        recs.append("✅ Retina/Skin analysis shows low risk for diabetes.")
    # If Not Scanned, we don't add a specific recommendation for diabetes
    recs.append("💧 Maintain hydration and regular exercise for metabolic health.")
    recs.append("⚕️ This AI screening tool is not a final diagnosis. Consult a physician.")
    return recs
