"""
Train churn model and save artifacts.

Usage (from coglearning/):
    python manage.py train_churn_model

Artifacts:
    ml_engine/artifacts/churn_model.joblib
    ml_engine/artifacts/feature_names.json
"""

import json

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from ml_engine.features import FEATURE_NAMES, extract_user_features, synthetic_churn_label
from ml_engine.services import ARTIFACTS_DIR, MODEL_PATH, FEATURE_NAMES_PATH, reset_model_cache


class Command(BaseCommand):
    help = 'Train churn RandomForest (or LogisticRegression) and save joblib artifact'

    def handle(self, *args, **options):
        User = get_user_model()
        students = User.objects.filter(role='student')

        X = []
        y = []
        for user in students.iterator():
            features, vector = extract_user_features(user)
            X.append(vector)
            y.append(synthetic_churn_label(features))

        n_real = len(X)
        self.stdout.write(f'Real student samples: {n_real}')

        if n_real < 20:
            X, y = self._augment_synthetic(X, y, target=max(40, 20))
            self.stdout.write(f'Augmented to {len(X)} samples for bootstrap training')

        if len(set(y)) < 2:
            # تضمین هر دو کلاس برای آموزش
            X, y = self._force_both_classes(X, y)
            self.stdout.write('Forced both churn classes into training set')

        model, model_name = self._train_model(X, y)
        metrics = self._evaluate(model, X, y)

        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        try:
            import joblib
        except ImportError:
            from sklearn.externals import joblib  # pragma: no cover

        joblib.dump(model, MODEL_PATH)
        FEATURE_NAMES_PATH.write_text(
            json.dumps(FEATURE_NAMES, indent=2, ensure_ascii=False),
            encoding='utf-8',
        )
        reset_model_cache()

        self.stdout.write(self.style.SUCCESS(
            f'Trained {model_name}. accuracy={metrics.get("accuracy", "n/a"):.4f}'
            if isinstance(metrics.get('accuracy'), float)
            else f'Trained {model_name}. metrics={metrics}'
        ))
        self.stdout.write(f'Model saved to: {MODEL_PATH}')
        self.stdout.write(f'Feature names saved to: {FEATURE_NAMES_PATH}')

    def _augment_synthetic(self, X, y, target=40):
        import random
        rng = random.Random(42)
        while len(X) < target:
            if X:
                base = list(X[rng.randrange(len(X))])
            else:
                base = [0.0] * len(FEATURE_NAMES)
            # نویز کوچک حول فضای ویژگی
            row = []
            for i, name in enumerate(FEATURE_NAMES):
                val = base[i] if i < len(base) else 0.0
                noise = rng.uniform(-0.15, 0.15) * (abs(val) + 1.0)
                new_val = max(0.0, val + noise)
                if name in (
                    'has_taken_placement_test',
                ):
                    new_val = 1.0 if new_val >= 0.5 else 0.0
                if name in (
                    'test_session_count',
                    'completed_session_count',
                    'content_progress_count',
                    'completed_content_count',
                    'recommendation_count',
                    'level_change_count',
                    'cognitive_level',
                ):
                    new_val = float(int(round(new_val)))
                row.append(float(new_val))
            features = {name: row[i] for i, name in enumerate(FEATURE_NAMES)}
            X.append(row)
            y.append(synthetic_churn_label(features))
        return X, y

    def _force_both_classes(self, X, y):
        # یک نمونه churn واضح و یک نمونه سالم
        churn_row = [0.0] * len(FEATURE_NAMES)
        idx = {n: i for i, n in enumerate(FEATURE_NAMES)}
        churn_row[idx['days_since_last_login']] = 30.0
        churn_row[idx['login_inactivity']] = 30.0
        churn_row[idx['days_since_registration']] = 40.0
        churn_row[idx['test_session_count']] = 0.0

        safe_row = [0.0] * len(FEATURE_NAMES)
        safe_row[idx['days_since_last_login']] = 1.0
        safe_row[idx['login_inactivity']] = 1.0
        safe_row[idx['days_since_registration']] = 30.0
        safe_row[idx['test_session_count']] = 5.0
        safe_row[idx['completed_session_count']] = 4.0
        safe_row[idx['avg_test_score']] = 80.0
        safe_row[idx['days_since_last_session']] = 1.0
        safe_row[idx['has_taken_placement_test']] = 1.0
        safe_row[idx['cognitive_level']] = 50.0

        X = list(X) + [churn_row, safe_row]
        y = list(y) + [1, 0]
        return X, y

    def _train_model(self, X, y):
        try:
            from sklearn.ensemble import RandomForestClassifier
            model = RandomForestClassifier(
                n_estimators=100,
                max_depth=8,
                random_state=42,
                class_weight='balanced',
            )
            model.fit(X, y)
            return model, 'RandomForestClassifier'
        except Exception as exc:
            self.stdout.write(self.style.WARNING(
                f'RandomForest unavailable ({exc}); falling back to LogisticRegression'
            ))
            from sklearn.linear_model import LogisticRegression
            model = LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42)
            model.fit(X, y)
            return model, 'LogisticRegression'

    def _evaluate(self, model, X, y):
        try:
            from sklearn.metrics import accuracy_score
            preds = model.predict(X)
            return {'accuracy': float(accuracy_score(y, preds))}
        except Exception as exc:
            return {'error': str(exc)}
