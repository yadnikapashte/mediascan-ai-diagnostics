"""
Chatbot Routes for MediScan AI
Rule-based health assistant for diagnostic interpretation.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

chatbot_bp = Blueprint('chatbot', __name__)

RESPONSES = {
    'anemia': "<b>Anemia</b> is a condition where you lack enough healthy red blood cells to carry adequate oxygen to your tissues. Common symptoms include fatigue, pale skin, and dizziness. Our AI analyzes the conjunctiva (eye) and palm color to detect these signs.",
    'diabetes': "<b>Diabetes</b> is a chronic disease that occurs when the pancreas doesn't produce enough insulin or when the body cannot effectively use the insulin it produces. High blood sugar can lead to serious damage, especially to the eyes (retinopathy) and feet.",
    'retina': "<b>Diabetic Retinopathy</b> is a diabetes complication that affects eyes. It's caused by damage to the blood vessels of the light-sensitive tissue at the back of the eye (retina). MediScan AI uses fundus images to screen for early microvascular changes.",
    'dfu': "<b>Diabetic Foot Ulcer (DFU)</b> is a common and severe complication of diabetes. It involves skin breakdown on the foot, often due to neuropathy and poor circulation. Early detection is critical to prevent infections and amputations. If our AI detects a high risk, please see a <b>podiatrist</b> immediately.",
    'upload': "For best results, ensure your photos are well-lit and in focus. <b>Eye:</b> Pull down your lower eyelid. <b>Palm:</b> Keep hand flat under natural light. <b>Retina:</b> Use a fundus camera adapter if available.",
    'gradcam': "<b>GradCAM</b> (Gradient-weighted Class Activation Mapping) is our AI's 'Attention Map'. The warm areas (red/yellow) indicate where the neural network looked most intensely to make its decision.",
    'greeting': "Hello! I am your <b>MediScan Health Assistant</b>. I can help interpret your results or explain how our AI screening works. What would you like to know?",
    'result': "If your report shows a <b>High Risk</b>, it is highly recommended to seek professional medical advice. Our tool is for screening and early detection, but a clinical blood test is necessary for confirmation.",
    'default': "I'm sorry, I'm still learning. Could you rephrase your question or ask about <b>Anemia</b>, <b>Diabetes</b>, <b>Retina scans</b>, or <b>DFU</b>?"
}

KEYWORDS = {
    'anemic': 'anemia', 'pale': 'anemia', 'blood': 'anemia', 'haemoglobin': 'anemia',
    'sugar': 'diabetes', 'glucose': 'diabetes', 'insulin': 'diabetes',
    'eye': 'retina', 'fundus': 'retina', 'vision': 'retina',
    'foot': 'dfu', 'ulcer': 'dfu', 'wound': 'dfu', 'sore': 'dfu', 'leg': 'dfu',
    'photo': 'upload', 'camera': 'upload', 'image': 'upload', 'click': 'upload',
    'map': 'gradcam', 'heatmap': 'gradcam', 'attention': 'gradcam',
    'hi': 'greeting', 'hello': 'greeting', 'hey': 'greeting', 'who': 'greeting',
    'report': 'result', 'interpreted': 'result', 'understand': 'result', 'risk': 'result'
}

@chatbot_bp.route('/message', methods=['POST'])
@jwt_required()
def send_message():
    data = request.get_json()
    message = data.get('message', '').lower()
    
    response_key = 'default'
    
    # Simple keyword matching
    for kw, section in KEYWORDS.items():
        if kw in message:
            response_key = section
            break
            
    return jsonify({
        'reply': RESPONSES[response_key]
    }), 200

@chatbot_bp.route('/suggestions', methods=['GET'])
@jwt_required()
def get_suggestions():
    return jsonify({
        'suggestions': [
            "What is a Diabetic Foot Ulcer (DFU)?",
            "How do I take a good eye photo?",
            "What does a 'High Risk' result mean?",
            "How does the AI analyze my retina?",
            "Can you explain the GradCAM heatmap?",
            "What are common symptoms of Anemia?",
            "How can I improve my metabolic health?"
        ]
    }), 200
