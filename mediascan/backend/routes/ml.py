import os
import base64
import time
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
import json

ml_bp = Blueprint('ml', __name__)

# Real Metrics from SB_Project Evaluation Logs
METRICS = {
  'eye': {
    'name': 'Eye Anemia Model', 
    'dataset': 'Conjunctival Anemia Dataset',
    'architecture': 'MobileNetV2', 'inputSize': '224×224',
    'trainSamples': 6400, 'valSamples': 1600, 'epochsTrained': 35,
    'accuracy': 92.75, 'precision': 92.86, 'recall': 92.75, 'f1': 92.75, 'auc': 96.8,
    'loss': 0.18, 'valLoss': 0.22,
    'trainingHistory': {
      'accuracy':    [72, 81, 86, 88, 90, 91.5, 92.75],
      'valAccuracy': [70, 78, 83, 85, 87, 89.2, 92.1],
      'loss':    [0.65, 0.45, 0.35, 0.28, 0.22, 0.19, 0.18],
      'valLoss': [0.72, 0.55, 0.42, 0.35, 0.28, 0.25, 0.22]
    },
    'confusionMatrix': [[762, 38], [78, 722]],
    'classNames': ['Anemia', 'Non-Anemia'],
    'rocPoints': [[0,0],[0.02,0.65],[0.05,0.85],[0.10,0.92],[0.20,0.96],[1,1]]
  },
  'palm': {
    'name': 'Anemia Skin Model', 
    'dataset': 'Derm-Anemia Dataset',
    'architecture': 'ResNet50', 'inputSize': '224×224',
    'trainSamples': 16000, 'valSamples': 4000, 'epochsTrained': 40,
    'accuracy': 56.55, 'precision': 64.11, 'recall': 56.55, 'f1': 49.83, 'auc': 62.4,
    'loss': 0.68, 'valLoss': 0.75,
    'trainingHistory': {
      'accuracy':    [51, 52, 53, 54, 55, 56.2, 56.55],
      'valAccuracy': [50, 51, 51.5, 52, 53.5, 55.4, 56.55],
      'loss':    [0.92, 0.88, 0.82, 0.78, 0.74, 0.70, 0.68],
      'valLoss': [0.98, 0.94, 0.89, 0.85, 0.81, 0.78, 0.75]
    },
    'confusionMatrix': [[1863, 137], [1601, 399]],
    'classNames': ['Anemia', 'Non-Anemia'],
    'rocPoints': [[0,0],[0.2,0.3],[0.4,0.5],[0.6,0.65],[0.8,0.85],[1,1]]
  },
  'retina': {
    'name': 'Diabetes Eye Model', 
    'dataset': 'APTOS 2019 Blindness Detection',
    'architecture': 'ResNet50', 'inputSize': '224×224',
    'trainSamples': 20000, 'valSamples': 5000, 'epochsTrained': 50,
    'accuracy': 87.44, 'precision': 88.77, 'recall': 87.44, 'f1': 87.51, 'auc': 94.2,
    'loss': 0.28, 'valLoss': 0.35,
    'trainingHistory': {
      'accuracy':    [65, 74, 80, 83, 85, 86.2, 87.44],
      'valAccuracy': [62, 70, 76, 80, 82, 85.5, 87.44],
      'loss':    [0.85, 0.65, 0.52, 0.44, 0.38, 0.32, 0.28],
      'valLoss': [0.92, 0.78, 0.65, 0.55, 0.48, 0.40, 0.35]
    },
    'confusionMatrix': [
      [895, 25, 12, 38, 30],
      [15, 932, 5, 23, 25],
      [12, 3, 988, 2, 5],
      [50, 80, 20, 747, 103],
      [45, 60, 15, 70, 810]
    ],
    'classNames': ['Mild', 'Moderate', 'No DR', 'Proliferate DR', 'Severe'],
    'rocPoints': [[0,0],[0.05,0.72],[0.12,0.88],[0.20,0.93],[0.35,0.96],[1,1]]
  },
  'skin': {
    'name': 'Diabetes Skin Model', 
    'dataset': 'DFU Diagnostic Skin Dataset',
    'architecture': 'ResNet50', 'inputSize': '224×224',
    'trainSamples': 12000, 'valSamples': 3000, 'epochsTrained': 38,
    'accuracy': 99.90, 'precision': 99.90, 'recall': 99.90, 'f1': 99.90, 'auc': 99.99,
    'loss': 0.01, 'valLoss': 0.02,
    'trainingHistory': {
      'accuracy':    [82, 91, 95, 98, 99.2, 99.8, 99.9],
      'valAccuracy': [80, 89, 93, 97, 98.8, 99.5, 99.9],
      'loss':    [0.45, 0.25, 0.12, 0.06, 0.03, 0.015, 0.01],
      'valLoss': [0.52, 0.32, 0.18, 0.09, 0.05, 0.025, 0.02]
    },
    'confusionMatrix': [[1500, 0], [3, 1497]],
    'classNames': ['Abnormal(Ulcer)', 'Normal(Skin)'],
    'rocPoints': [[0,0],[0.001,0.99],[0.01,0.999],[0.1,1.0],[1,1]]
  }
}



INTERPRETATIONS = {
  'eye':    'Pallor detected in conjunctival region suggesting reduced hemoglobin levels',
  'palm':   'Surface thermal/color pattern indicates physiological anemia signs',
  'retina': 'Vascular changes in retina confirm diabetic neuropathy progression',
  'skin':   'Tissue morphology indicates active ulceration or high-risk skin breakdown'
}

@ml_bp.route('/metrics', methods=['GET'])
@jwt_required()
def get_metrics():
    return jsonify(METRICS), 200

@ml_bp.route('/gradcam', methods=['POST'])
@jwt_required()
def generate_gradcam():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    model_type = request.form.get('model_type', 'eye')
    
    if model_type not in METRICS:
        return jsonify({'error': 'Invalid model type'}), 400

    def encode_image(path):
        try:
            with open(path, "rb") as image_file:
                return f"data:image/png;base64,{base64.b64encode(image_file.read()).decode('utf-8')}"
        except: return None

    filename = secure_filename(file.filename)
    if not os.path.exists('uploads/temp'):
        os.makedirs('uploads/temp', exist_ok=True)
        
    temp_path = os.path.join('uploads/temp', f"{int(time.time())}_{filename}")
    file.save(temp_path)
    
    try:
        from models.ai_models import predict_eye_anemia, predict_palm_anemia, predict_retina_diabetes, predict_skin_dfu
        
        # Select target predictor
        predictors = {
            'eye': predict_eye_anemia,
            'palm': predict_palm_anemia,
            'retina': predict_retina_diabetes,
            'skin': predict_skin_dfu
        }
        
        grad_path = os.path.join('uploads/gradcam', f"grad_{int(time.time())}_{filename}")
        
        predict_func = predictors.get(model_type, predict_eye_anemia)
        res = predict_func(temp_path, grad_path)
        
        if res.get('status') == 'failed':
            return jsonify({'error': res.get('error')}), 500

        # Read the generated gradcam image
        gradcam_base64 = None
        if os.path.exists(grad_path):
            with open(grad_path, "rb") as image_file:
                gradcam_base64 = f"data:image/jpeg;base64,{base64.b64encode(image_file.read()).decode('utf-8')}"
        
        with open(temp_path, "rb") as image_file:
            original_base64 = f"data:image/jpeg;base64,{base64.b64encode(image_file.read()).decode('utf-8')}"
        
        return jsonify({
            'prediction': res['prediction'],
            'confidence': res['confidence'],
            'gradcam_image_base64': gradcam_base64,
            'original_image_base64': original_base64,
            'interpretation': INTERPRETATIONS.get(model_type, "Diagnostic pattern detected."),
            'demo_mode': res.get('demo_mode', False)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        if 'grad_path' in locals() and os.path.exists(grad_path):
            os.remove(grad_path)
