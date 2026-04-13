"""
Reports Routes for MediScan AI
Handles PDF report generation for diagnostic results.
"""

from flask import Blueprint, send_file, jsonify, get_template_attribute
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import io
import json
from datetime import datetime

from database import Prediction, User

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/download/<int:pred_id>', methods=['GET'])
@jwt_required()
def download_report(pred_id):
    user_id = int(get_jwt_identity())
    pred = Prediction.query.get_or_404(pred_id)
    user = User.query.get(user_id)
    
    if pred.user_id != user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
        from reportlab.lib.units import inch

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        styles = getSampleStyleSheet()
        
        # Custom Styles
        title_style = ParagraphStyle(
            'TitleStyle', parent=styles['Heading1'],
            fontSize=26, textColor=colors.HexColor("#0891b2"),
            alignment=1, spaceAfter=12
        )
        
        section_style = ParagraphStyle(
            'SectionStyle', parent=styles['Heading2'],
            fontSize=16, textColor=colors.black,
            spaceBefore=14, spaceAfter=8,
            borderPadding=4, borderStyle='solid', borderColor=colors.lightgrey
        )

        elements = []

        # Header
        elements.append(Paragraph("MediScan AI Diagnostic Report", title_style))
        elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %H:%M')}", styles['Normal']))
        elements.append(Spacer(1, 0.2*inch))
        
        # Patient Info Table
        patient_data = [
            ['Patient Name:', user.name, 'Report ID:', f"MS-{pred.session_id[:8].upper()}"],
            ['Patient Email:', user.email, 'Scan Date:', pred.created_at.strftime('%Y-%m-%d')],
            ['Age / Gender:', f"{user.age or 'N/A'} / {user.gender or 'N/A'}", 'Overall Risk:', pred.overall_risk.upper()]
        ]
        
        t = Table(patient_data, colWidths=[1.2*inch, 2*inch, 1.2*inch, 1.8*inch])
        t.setStyle(TableStyle([
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold', 0, 0),
            ('FONTNAME', (1,0), (1,-1), 'Helvetica', 0, 0),
            ('FONTNAME', (3,0), (3,-1), 'Helvetica', 0, 0),
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('TEXTCOLOR', (3,2), (3,2), colors.red if pred.overall_risk == 'High' else colors.green),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 0.3*inch))

        # ─── Anemia Section ───
        elements.append(Paragraph("I. Anemia Screening Results", section_style))
        anemia_data = [
            ['Component', 'Visual Prediction', 'Confidence', 'Status'],
            ['Eye Conjunctiva', pred.eye_prediction or 'Not Scanned', f"{pred.eye_confidence or 0.0}%", 'CHECK'],
            ['Palm Skin', pred.palm_prediction or 'Not Scanned', f"{pred.palm_confidence or 0.0}%", 'CHECK'],
            ['FUSED DIAGNOSIS', pred.anemia_result.upper(), f"{pred.anemia_confidence}%", pred.anemia_risk.upper()]
        ]
        
        at = Table(anemia_data, colWidths=[1.8*inch, 1.8*inch, 1.2*inch, 1.2*inch])
        at.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('TEXTCOLOR', (1,3), (1,3), colors.red if pred.anemia_result == 'Anemic' else colors.green),
            ('FONTNAME', (0,3), (-1,3), 'Helvetica-Bold'),
        ]))
        elements.append(at)

        # ─── Diabetes Section ───
        elements.append(Paragraph("II. Diabetes Screening Results", section_style))
        diabetes_data = [
            ['Component', 'Visual Prediction', 'Confidence', 'Status'],
            ['Retinal Fundus', pred.retina_prediction or 'Not Scanned', f"{pred.retina_confidence or 0.0}%", 'CHECK'],
            ['Skin/DFU Check', pred.skin_prediction or 'Not Scanned', f"{pred.skin_confidence or 0.0}%", 'CHECK'],
            ['FUSED DIAGNOSIS', pred.diabetes_result.upper(), f"{pred.diabetes_confidence}%", pred.diabetes_risk.upper()]
        ]
        
        dt = Table(diabetes_data, colWidths=[1.8*inch, 1.8*inch, 1.2*inch, 1.2*inch])
        dt.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('TEXTCOLOR', (1,3), (1,3), colors.red if pred.diabetes_result == 'Diabetic' else colors.green),
            ('FONTNAME', (0,3), (-1,3), 'Helvetica-Bold'),
        ]))
        elements.append(dt)

        # Recommendations
        elements.append(Paragraph("III. Personalized Recommendations", section_style))
        recs = json.loads(pred.recommendations) if pred.recommendations else []
        for r in recs:
            elements.append(Paragraph(f"• {r}", styles['Normal']))
            elements.append(Spacer(1, 0.05*inch))

        # Footer
        elements.append(Spacer(1, 0.5*inch))
        footer_text = "<b>Disclaimer:</b> This AI-generated report is for screening purposes only and does NOT constitute a medical diagnosis. Please consult a qualified healthcare professional for formal testing and treatment."
        elements.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=1)))

        doc.build(elements)
        buffer.seek(0)
        
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"MediScan_Report_{pred_id}.pdf",
            mimetype='application/pdf'
        )

    except Exception as e:
        return jsonify({
            'error': f'PDF Generation failed: {str(e)}',
            'plain_text_report': pred.to_dict()
        }), 500
