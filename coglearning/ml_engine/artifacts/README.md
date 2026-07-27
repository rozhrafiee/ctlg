# Model artifacts directory
#
# Expected files after training:
#   churn_model.joblib      — sklearn RandomForestClassifier (or LogisticRegression)
#   feature_names.json      — ordered feature names matching the model input vector
#
# Train with (from coglearning/):
#   python manage.py train_churn_model
