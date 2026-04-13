"""
MobileNetV2 Training Script for MediScan AI
Trains three models:
  1. eye_anemia_model.h5    — Conjunctiva image → Anemia detection
  2. palm_anemia_model.h5   — Palm image → Anemia detection
  3. retina_diabetes_model.h5 — Fundus image → Diabetes/Retinopathy detection

Usage:
  python train_models.py --model eye --data_dir ./datasets/eye
  python train_models.py --model palm --data_dir ./datasets/palm
  python train_models.py --model retina --data_dir ./datasets/retina

Dataset folder structure:
  datasets/
  ├── eye/
  │   ├── train/
  │   │   ├── anemic/
  │   │   └── non_anemic/
  │   └── val/
  │       ├── anemic/
  │       └── non_anemic/
  ├── palm/  (same structure)
  └── retina/
      ├── train/
      │   ├── diabetic/
      │   └── non_diabetic/
      └── val/
          ├── diabetic/
          └── non_diabetic/
"""

import os
import argparse
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import (
    ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
)
from datetime import datetime

# ─── Configuration ─────────────────────────────────────────────────────────
IMG_SIZE     = (224, 224)
BATCH_SIZE   = 32
EPOCHS       = 30
LEARNING_RATE = 1e-4

MODEL_CONFIGS = {
    'eye':    {'classes': ['anemic', 'non_anemic'],    'output_file': 'eye_anemia_model.h5'},
    'palm':   {'classes': ['anemic', 'non_anemic'],    'output_file': 'palm_anemia_model.h5'},
    'retina': {'classes': ['diabetic', 'non_diabetic'],'output_file': 'retina_diabetes_model.h5'},
}


def build_model(num_classes: int = 2, fine_tune_from: int = 100) -> Model:
    """
    Build MobileNetV2 transfer learning model.
    
    Architecture:
    - MobileNetV2 base (pretrained ImageNet)
    - GlobalAveragePooling2D
    - Dense(256, relu) + BatchNorm + Dropout(0.4)
    - Dense(128, relu) + Dropout(0.3)
    - Dense(num_classes, softmax)
    """
    base = MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze all layers initially
    base.trainable = False
    
    # Fine-tune last N layers
    for layer in base.layers[fine_tune_from:]:
        layer.trainable = True
    
    # Build classification head
    x = base.output
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(256, activation='relu', name='dense_256')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(128, activation='relu', name='dense_128')(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation='softmax', name='output')(x)
    
    model = Model(inputs=base.input, outputs=outputs)
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC(name='auc')]
    )
    
    print(f"\n✅ Model built: {model.count_params():,} parameters")
    print(f"   Trainable:     {sum(tf.size(w).numpy() for w in model.trainable_weights):,}")
    return model


def create_data_generators(data_dir: str):
    """
    Create ImageDataGenerator with augmentation for training,
    and a simple normalization generator for validation.
    """
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=20,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.1,
        zoom_range=0.15,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest'
    )
    
    val_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input
    )
    
    train_dir = os.path.join(data_dir, 'train')
    val_dir   = os.path.join(data_dir, 'val')
    
    if not os.path.exists(train_dir):
        raise FileNotFoundError(f"Training directory not found: {train_dir}")
    if not os.path.exists(val_dir):
        raise FileNotFoundError(f"Validation directory not found: {val_dir}")
    
    train_gen = train_datagen.flow_from_directory(
        train_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True
    )
    
    val_gen = val_datagen.flow_from_directory(
        val_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    print(f"\n📂 Dataset: {train_gen.samples} train, {val_gen.samples} val samples")
    print(f"   Classes: {train_gen.class_indices}")
    
    return train_gen, val_gen


def train_model(model_type: str, data_dir: str, output_dir: str = './'):
    """Full training pipeline for a single model."""
    
    config = MODEL_CONFIGS[model_type]
    print(f"\n{'='*60}")
    print(f"  Training: {model_type.upper()} model")
    print(f"  Output:   {config['output_file']}")
    print(f"{'='*60}")
    
    # Build model
    model = build_model(num_classes=len(config['classes']))
    
    # Create data generators
    train_gen, val_gen = create_data_generators(data_dir)
    
    # Callbacks
    log_dir = f"./logs/{model_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    callbacks = [
        ModelCheckpoint(
            filepath=os.path.join(output_dir, config['output_file']),
            monitor='val_auc',
            mode='max',
            save_best_only=True,
            verbose=1
        ),
        EarlyStopping(
            monitor='val_loss',
            patience=7,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.3,
            patience=3,
            min_lr=1e-7,
            verbose=1
        ),
        TensorBoard(log_dir=log_dir, histogram_freq=1)
    ]
    
    # Compute class weights to handle imbalanced datasets
    total = train_gen.samples
    class_counts = {}
    for label_idx in train_gen.classes:
        class_counts[label_idx] = class_counts.get(label_idx, 0) + 1
    
    class_weights = {
        idx: total / (len(class_counts) * count)
        for idx, count in class_counts.items()
    }
    print(f"\n⚖️  Class weights: {class_weights}")
    
    # Phase 1: Train classification head only
    print("\n📌 Phase 1: Training classification head...")
    history_phase1 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=10,
        callbacks=callbacks,
        class_weight=class_weights
    )
    
    # Phase 2: Fine-tune entire model with lower LR
    print("\n📌 Phase 2: Fine-tuning entire model...")
    for layer in model.layers:
        layer.trainable = True
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE / 10),
        loss='categorical_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC(name='auc')]
    )
    
    history_phase2 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS,
        callbacks=callbacks,
        class_weight=class_weights,
        initial_epoch=len(history_phase1.history['loss'])
    )
    
    # Evaluate final model
    print("\n📊 Final Evaluation:")
    results = model.evaluate(val_gen, verbose=1)
    print(f"   Loss: {results[0]:.4f}")
    print(f"   Accuracy: {results[1]*100:.2f}%")
    print(f"   AUC: {results[2]:.4f}")
    
    output_path = os.path.join(output_dir, config['output_file'])
    print(f"\n✅ Model saved: {output_path}")
    return model


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train MediScan AI Models')
    parser.add_argument('--model', choices=['eye', 'palm', 'retina', 'all'], required=True)
    parser.add_argument('--data_dir', type=str, required=True, help='Path to dataset directory')
    parser.add_argument('--output_dir', type=str, default='./backend/models/', help='Where to save .h5 models')
    args = parser.parse_args()
    
    os.makedirs(args.output_dir, exist_ok=True)
    
    if args.model == 'all':
        for m in ['eye', 'palm', 'retina']:
            train_model(m, os.path.join(args.data_dir, m), args.output_dir)
    else:
        train_model(args.model, args.data_dir, args.output_dir)
