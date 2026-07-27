"""سرویس استنتاج churn و اعلان‌های نگه‌داشت."""

import json
import random
from pathlib import Path

from django.utils import timezone
from datetime import timedelta

from .features import (
    FEATURE_NAMES,
    extract_user_features,
    heuristic_churn_probability,
)
from .models import ChurnPrediction, RetentionNotification

# آستانه ریسک قابل پیکربندی
CHURN_RISK_THRESHOLD = 0.5

# مسیر آرتیفکت مدل
ARTIFACTS_DIR = Path(__file__).resolve().parent / 'artifacts'
MODEL_PATH = ARTIFACTS_DIR / 'churn_model.joblib'
FEATURE_NAMES_PATH = ARTIFACTS_DIR / 'feature_names.json'

RETENTION_MESSAGES = [
    "Don't give up! Every learning step improves your skills.",
    "You're closer than you think — come back and continue your journey!",
    "هر قدم یادگیری مهارت‌های شما را قوی‌تر می‌کند. تسلیم نشوید!",
    "بازگشت شما مهم است؛ همین امروز یک جلسه کوتاه تمرین کنید.",
    "Consistency beats intensity. A small session today keeps progress alive.",
]

_model_cache = None
_model_load_attempted = False


def get_model():
    """بارگذاری تنبل مدل از artifacts؛ در صورت نبود None."""
    global _model_cache, _model_load_attempted
    if _model_load_attempted:
        return _model_cache
    _model_load_attempted = True
    if not MODEL_PATH.exists():
        _model_cache = None
        return None
    try:
        import joblib
        _model_cache = joblib.load(MODEL_PATH)
    except Exception:
        _model_cache = None
    return _model_cache


def reset_model_cache():
    """برای تست‌ها و پس از آموزش مجدد."""
    global _model_cache, _model_load_attempted
    _model_cache = None
    _model_load_attempted = False


def _confidence_from_probability(probability, proba_pair=None):
    """confidence = |p-0.5|*2 یا بیشینه predict_proba."""
    if proba_pair is not None and len(proba_pair) >= 2:
        return float(max(proba_pair))
    return abs(float(probability) - 0.5) * 2.0


def predict_churn(user, persist=True, create_notification=True):
    """
    پیش‌بینی ریزش برای کاربر.
    اگر مدل موجود نباشد از heuristic همان قوانین برچسب مصنوعی استفاده می‌شود.
    """
    features, vector = extract_user_features(user)
    model = get_model()

    proba_pair = None
    if model is not None:
        try:
            import numpy as np
            X = np.array([vector], dtype=float)
            if hasattr(model, 'predict_proba'):
                proba_pair = model.predict_proba(X)[0]
                # کلاس ۱ = churn
                classes = list(getattr(model, 'classes_', [0, 1]))
                if 1 in classes:
                    probability = float(proba_pair[classes.index(1)])
                else:
                    probability = float(proba_pair[-1])
            else:
                pred = int(model.predict(X)[0])
                probability = 0.75 if pred == 1 else 0.25
        except Exception:
            probability = heuristic_churn_probability(features)
    else:
        probability = heuristic_churn_probability(features)

    confidence = _confidence_from_probability(probability, proba_pair)
    is_at_risk = probability >= CHURN_RISK_THRESHOLD

    prediction = None
    if persist:
        prediction = ChurnPrediction.objects.create(
            user=user,
            probability=round(probability, 6),
            confidence=round(confidence, 6),
            is_at_risk=is_at_risk,
            features_snapshot=features,
        )

    notification = None
    if create_notification and is_at_risk and prediction is not None:
        notification = get_or_create_retention_notification(user, prediction)

    result = {
        'is_at_risk': is_at_risk,
        'probability': round(float(probability), 6),
        'confidence': round(float(confidence), 6),
        'prediction_id': prediction.id if prediction else None,
        'features': features,
    }
    if notification is not None:
        result['notification'] = {
            'id': notification.id,
            'message': notification.message,
            'created_at': notification.created_at.isoformat(),
        }
    return result


def get_or_create_retention_notification(user, prediction):
    """
    اگر کاربر در ریسک باشد و در ۷ روز گذشته اعلان ردنشده نداشته باشد، یکی بساز.
    """
    if not prediction.is_at_risk:
        return None

    cutoff = timezone.now() - timedelta(days=7)
    recent = RetentionNotification.objects.filter(
        user=user,
        is_dismissed=False,
        created_at__gte=cutoff,
    ).first()
    if recent is not None:
        return recent

    message = random.choice(RETENTION_MESSAGES)
    return RetentionNotification.objects.create(
        user=user,
        message=message,
        prediction=prediction,
    )


def dismiss_notification(user, notification_id):
    """رد کردن اعلان متعلق به کاربر."""
    try:
        notif = RetentionNotification.objects.get(id=notification_id, user=user)
    except RetentionNotification.DoesNotExist:
        return None
    if not notif.is_dismissed:
        notif.is_dismissed = True
        notif.dismissed_at = timezone.now()
        notif.save(update_fields=['is_dismissed', 'dismissed_at'])
    return notif


def ensure_feature_names_artifact():
    """ذخیره لیست نام ویژگی‌ها کنار مدل."""
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    FEATURE_NAMES_PATH.write_text(
        json.dumps(FEATURE_NAMES, indent=2, ensure_ascii=False),
        encoding='utf-8',
    )
