"""
Predictions Routes for MediScan AI
Handles image uploads, AI analysis, and results history.
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import uuid
import json
import shutil
from datetime import datetime
from werkzeug.utils import secure_filename

from database import db, Prediction, User
import traceback
from models.ai_models import (
    predict_eye_anemia, predict_palm_anemia, 
    predict_retina_diabetes, predict_skin_dfu,
    predict_auto, # Added for auto-detection support
    fuse_anemia_predictions, fuse_diabetes_predictions,
    compute_overall_risk, generate_recommendations
)

predictions_bp = Blueprint('predictions', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'bmp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@predictions_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    if not current_user:
        return jsonify({'error': 'User session invalid'}), 401

    try:
        model_type = request.form.get('model_type', 'auto')
        session_id = str(uuid.uuid4())[:8]
        files = request.files
        
        current_app.logger.info(f"--- START ANALYSIS [Session: {session_id}, Model: {model_type}] ---")
        
        if not files:
            return jsonify({'error': 'No images uploaded'}), 400
            
        upload_results = {}
        eye_res = palm_res = retina_res = skin_res = None
        
        # Paths for saving
        paths = {
            'eye': None, 'palm': None, 'retina': None, 'skin': None,
            'eye_gradcam': None, 'palm_gradcam': None, 'retina_gradcam': None, 'skin_gradcam': None
        }
        
        # Check for general single image (ScanPage flow)
        is_single_image = 'image' in files
        
        if is_single_image:
            f = files['image']
            if not allowed_file(f.filename):
                return jsonify({'error': 'Unsupported file format'}), 400
                
            temp_filename = secure_filename(f"{session_id}_temp_{f.filename}")
            temp_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'temp', temp_filename)
            f.save(temp_path)
            
            try:
                from models.ai_models import identify_domain
                import shutil
                
                if model_type == 'auto':
                    detected_domain = identify_domain(temp_path)
                    current_app.logger.info(f"AI Auto-Detection for {session_id}: Identified as [{detected_domain.upper()}]")
                    if detected_domain == 'unknown':
                        if os.path.exists(temp_path): os.remove(temp_path)
                        return jsonify({'error': "Unrecognized image domain. Please ensure you are uploading a clear scan of an eye, palm, retina, or skin area."}), 400
                    model_type = detected_domain
                else:
                    current_app.logger.info(f"Manual Model Override for {session_id}: Forcing [{model_type.upper()}]")
                    # Mandatory OOD check even for manual override
                    detected_domain = identify_domain(temp_path)
                    if detected_domain == 'unknown':
                        if os.path.exists(temp_path): os.remove(temp_path)
                        return jsonify({'error': "Unrecognized image domain. Even in manual mode, you must upload a valid medical scan."}), 400
                
                # Move file to authoritative domain folder
                if model_type == 'eye':
                    paths['eye'] = f"eye/{session_id}_eye.png"
                    paths['eye_gradcam'] = f"gradcam/gradcam_{session_id}_eye.png"
                    abs_dest = os.path.join(current_app.config['UPLOAD_FOLDER'], paths['eye'])
                    shutil.copy(temp_path, abs_dest)
                    eye_res = predict_eye_anemia(abs_dest, os.path.join(current_app.config['UPLOAD_FOLDER'], paths['eye_gradcam']))
                    upload_results['eye'] = eye_res
                    
                elif model_type == 'palm':
                    paths['palm'] = f"palm/{session_id}_palm.png"
                    paths['palm_gradcam'] = f"gradcam/gradcam_{session_id}_palm.png"
                    abs_dest = os.path.join(current_app.config['UPLOAD_FOLDER'], paths['palm'])
                    shutil.copy(temp_path, abs_dest)
                    palm_res = predict_palm_anemia(abs_dest, os.path.join(current_app.config['UPLOAD_FOLDER'], paths['palm_gradcam']))
                    upload_results['palm'] = palm_res

                elif model_type == 'retina':
                    paths['retina'] = f"retina/{session_id}_retina.png"
                    paths['retina_gradcam'] = f"gradcam/gradcam_{session_id}_retina.png"
                    abs_dest = os.path.join(current_app.config['UPLOAD_FOLDER'], paths['retina'])
                    shutil.copy(temp_path, abs_dest)
                    retina_res = predict_retina_diabetes(abs_dest, os.path.join(current_app.config['UPLOAD_FOLDER'], paths['retina_gradcam']))
                    upload_results['retina'] = retina_res

                elif model_type == 'skin':
                    paths['skin'] = f"skin/{session_id}_skin.png"
                    paths['skin_gradcam'] = f"gradcam/gradcam_{session_id}_skin.png"
                    abs_dest = os.path.join(current_app.config['UPLOAD_FOLDER'], paths['skin'])
                    shutil.copy(temp_path, abs_dest)
                    skin_res = predict_skin_dfu(abs_dest, os.path.join(current_app.config['UPLOAD_FOLDER'], paths['skin_gradcam']))
                    upload_results['skin'] = skin_res
                
                if os.path.exists(temp_path): os.remove(temp_path)
                
            except Exception as e:
                if os.path.exists(temp_path): os.remove(temp_path)
                raise e

        else:
            # ORIGINAL MULTI-IMAGE FLOW (Left intact for backward compatibility)
            if 'eye_image' in files and allowed_file(files['eye_image'].filename):
                f = files['eye_image']
                filename = secure_filename(f"{session_id}_eye_{f.filename}")
                path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'eye', filename)
                f.save(path)
                paths['eye'] = path
                grad_filename = f"gradcam_{filename}"
                grad_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'gradcam', grad_filename)
                eye_res = predict_eye_anemia(path, grad_path)
                paths['eye_gradcam'] = grad_path
                upload_results['eye'] = eye_res

            if 'palm_image' in files and allowed_file(files['palm_image'].filename):
                f = files['palm_image']
                filename = secure_filename(f"{session_id}_palm_{f.filename}")
                path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'palm', filename)
                f.save(path)
                paths['palm'] = path
                grad_filename = f"gradcam_{filename}"
                grad_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'gradcam', grad_filename)
                palm_res = predict_palm_anemia(path, grad_path)
                paths['palm_gradcam'] = grad_path
                upload_results['palm'] = palm_res

            if 'retina_image' in files and allowed_file(files['retina_image'].filename):
                f = files['retina_image']
                filename = secure_filename(f"{session_id}_retina_{f.filename}")
                path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'retina', filename)
                f.save(path)
                paths['retina'] = path
                grad_filename = f"gradcam_{filename}"
                grad_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'gradcam', grad_filename)
                retina_res = predict_retina_diabetes(path, grad_path)
                paths['retina_gradcam'] = grad_path
                upload_results['retina'] = retina_res

            if 'skin_image' in files and allowed_file(files['skin_image'].filename):
                f = files['skin_image']
                filename = secure_filename(f"{session_id}_skin_{f.filename}")
                path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'skin', filename)
                f.save(path)
                paths['skin'] = path
                grad_filename = f"gradcam_{filename}"
                grad_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'gradcam', grad_filename)
                skin_res = predict_skin_dfu(path, grad_path)
                paths['skin_gradcam'] = grad_path
                upload_results['skin'] = skin_res

        if not upload_results:
            return jsonify({'error': 'No valid images processed'}), 400

        # Fusion and Final Results (Stays the same)
        anemia_fused = fuse_anemia_predictions(
            eye_res if eye_res else {'probabilities': {}}, 
            palm_res if palm_res else {'probabilities': {}}
        )
        diabetes_fused = fuse_diabetes_predictions(
            retina_res if retina_res else {'probabilities': {}}, 
            skin_res if skin_res else {'probabilities': {}}
        )
        
        overall_risk = compute_overall_risk(anemia_fused['risk'], diabetes_fused['risk'])
        recommendations = generate_recommendations(anemia_fused, diabetes_fused)

        # Save to Database
        prediction = Prediction(
            user_id=current_user.id,
            session_id=session_id,
            eye_image_path=paths['eye'],
            palm_image_path=paths['palm'],
            retina_image_path=paths['retina'],
            skin_image_path=paths['skin'],
            eye_gradcam_path=paths['eye_gradcam'],
            palm_gradcam_path=paths['palm_gradcam'],
            retina_gradcam_path=paths['retina_gradcam'],
            skin_gradcam_path=paths['skin_gradcam'],
            eye_prediction=eye_res.get('prediction') if eye_res else None,
            eye_confidence=eye_res.get('confidence') if eye_res else None,
            palm_prediction=palm_res.get('prediction') if palm_res else None,
            palm_confidence=palm_res.get('confidence') if palm_res else None,
            retina_prediction=retina_res.get('prediction') if retina_res else None,
            retina_confidence=retina_res.get('confidence') if retina_res else None,
            skin_prediction=skin_res.get('prediction') if skin_res else None,
            skin_confidence=skin_res.get('confidence') if skin_res else None,
            anemia_result=anemia_fused.get('result'),
            anemia_confidence=anemia_fused.get('confidence'),
            anemia_risk=anemia_fused.get('risk'),
            diabetes_result=diabetes_fused.get('result'),
            diabetes_confidence=diabetes_fused.get('confidence'),
            diabetes_risk=diabetes_fused.get('risk'),
            dfu_result=skin_res.get('prediction') if skin_res else 'Not Scanned',
            dfu_confidence=skin_res.get('confidence') if skin_res else 0.0,
            dfu_risk='High' if (skin_res and skin_res.get('prediction') == 'Abnormal(Ulcer)') else 'Low',
            overall_risk=overall_risk,
            model_type=model_type, # Track which model was used for single scans
            recommendations=json.dumps(recommendations)
        )
        
        db.session.add(prediction)
        db.session.commit()
        if prediction:
            res_dict = prediction.to_dict()
            current_app.logger.info(f"--- ANALYSIS COMPLETE [ID: {prediction.id}] ---")
            return jsonify({
                'message': 'Analysis complete',
                'prediction_id': prediction.id,
                'detected_domain': model_type,
                'results': res_dict
            }), 200
        
        return jsonify({'error': 'Prediction failed to save'}), 500

    except Exception as e:
        error_details = traceback.format_exc()
        current_app.logger.error(f"FATAL PIPELINE ERROR: {error_details}")
        
        log_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'pipeline_crash.log')
        with open(log_path, "a") as f:
            f.write(f"\n--- FATAL ERROR AT {datetime.now()} ---\n{error_details}\n")
            
        return jsonify({'error': f"Neural pipeline failure: {str(e)}"}), 500

@predictions_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    
    pagination = Prediction.query.filter_by(user_id=user_id)\
        .order_by(Prediction.created_at.desc())\
        .paginate(page=page, per_page=limit, error_out=False)
        
    return jsonify({
        'predictions': [p.to_dict() for p in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@predictions_bp.route('/<int:pred_id>', methods=['GET'])
@jwt_required()
def get_prediction(pred_id):
    user_id = int(get_jwt_identity())
    pred = Prediction.query.get_or_404(pred_id)
    
    user = User.query.get(user_id)
    if pred.user_id != user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    return jsonify(pred.to_dict()), 200

@predictions_bp.route('/compare/<int:pred_id>', methods=['GET'])
@jwt_required()
def get_previous_prediction(pred_id):
    user_id = int(get_jwt_identity())
    current_pred = Prediction.query.get_or_404(pred_id)
    
    # Auth check
    user = User.query.get(user_id)
    if current_pred.user_id != user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    # Find the scan for this user that was created just before the current one
    previous_pred = Prediction.query.filter(
        Prediction.user_id == current_pred.user_id,
        Prediction.id < pred_id
    ).order_by(Prediction.id.desc()).first()
    
    if not previous_pred:
        return jsonify({'message': 'No previous scan recorded for this patient'}), 404
        
    return jsonify(previous_pred.to_dict()), 200

@predictions_bp.route('/<int:pred_id>', methods=['DELETE'])
@jwt_required()
def delete_prediction(pred_id):
    user_id = int(get_jwt_identity())
    pred = Prediction.query.get_or_404(pred_id)
    
    if pred.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    db.session.delete(pred)
    db.session.commit()
    return jsonify({'message': 'Scan deleted successfully'}), 200

@predictions_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    user_id = get_jwt_identity()
    scans = Prediction.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'total_scans': len(scans),
        'anemia_detected': len([s for s in scans if s.model_type in ['eye', 'palm'] and s.anemia_result == 'Anemic']),
        'diabetes_detected': len([s for s in scans if s.model_type == 'retina' and s.diabetes_result == 'Diabetic']),
        'dfu_detected': len([s for s in scans if s.model_type == 'skin' and s.dfu_result == 'Abnormal(Ulcer)']),
        'high_risk_cases': len([s for s in scans if s.overall_risk == 'High']),
        'healthy_cases': len([s for s in scans if s.overall_risk == 'Low'])
    }), 200
