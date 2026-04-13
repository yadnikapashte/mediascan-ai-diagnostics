import os
import sys
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'mediascan', 'backend'))

from app import create_app
from database import db, Prediction

app = create_app()
with app.app_context():
    preds = Prediction.query.order_by(Prediction.id.desc()).limit(2).all()
    for p in preds:
        print(f"ID: {p.id}, Domain: {p.model_type}, Result: {p.anemia_result}, Confidence: {p.anemia_confidence}")
        print(f"Recommendations: {p.recommendations[:100]}...")
        print("-" * 20)
