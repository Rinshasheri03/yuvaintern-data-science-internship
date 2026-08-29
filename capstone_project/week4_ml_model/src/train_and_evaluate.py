"""
Week 4 — Machine Learning Model Development and Evaluation
Business question: Can we predict, at the time of order, whether a
transaction will end up loss-making (Profit < 0) using only information
known before profit is realized (category, region, segment, quantity,
discount, sales)?

This is a binary classification problem. Two models are trained and
compared: Logistic Regression (interpretable baseline) and a Decision
Tree (to check for non-linear gains and illustrate overfitting).
"""
import json
import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_curve, roc_auc_score, precision_recall_curve,
    classification_report,
)

sns.set_theme(style="whitegrid", font_scale=1.05)
PALETTE = ["#2E5EAA", "#E8743B", "#3CB4A4", "#8E6C88", "#C0504D"]
plt.rcParams["figure.dpi"] = 150
plt.rcParams["axes.titleweight"] = "bold"
plt.rcParams["axes.titlesize"] = 14

os.makedirs("../outputs/figures", exist_ok=True)

# ---------------------------------------------------------------
# 1. DATA PREPARATION
# ---------------------------------------------------------------
df = pd.read_csv("../data/retail_data.csv", parse_dates=["OrderDate"])

# Guard against any missing values (none expected in synthetic data,
# but this mirrors real-world preprocessing practice)
assert df.isnull().sum().sum() == 0, "Unexpected missing values in dataset"

FEATURES_NUM = ["Quantity", "Discount", "Sales"]
FEATURES_CAT = ["Category", "Region", "Segment"]
TARGET = "IsLoss"

X = df[FEATURES_NUM + FEATURES_CAT]
y = df[TARGET]

# Stratified split preserves the ~29%/71% class balance in both sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)
print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
print(f"Train class balance: {y_train.mean():.3f}, Test class balance: {y_test.mean():.3f}")

preprocessor = ColumnTransformer(transformers=[
    ("num", StandardScaler(), FEATURES_NUM),
    ("cat", OneHotEncoder(drop="first", handle_unknown="ignore"), FEATURES_CAT),
])

# ---------------------------------------------------------------
# 2. MODEL SELECTION AND TRAINING
# ---------------------------------------------------------------
log_reg = Pipeline([
    ("preprocess", preprocessor),
    ("model", LogisticRegression(max_iter=1000, random_state=42)),
])
log_reg.fit(X_train, y_train)

# Shallow decision tree included as a comparison / overfitting illustration
tree_shallow = Pipeline([
    ("preprocess", preprocessor),
    ("model", DecisionTreeClassifier(max_depth=4, random_state=42)),
])
tree_shallow.fit(X_train, y_train)

# Deep, unconstrained tree deliberately included to *demonstrate* overfitting
tree_deep = Pipeline([
    ("preprocess", preprocessor),
    ("model", DecisionTreeClassifier(random_state=42)),  # no max_depth
])
tree_deep.fit(X_train, y_train)

models = {
    "Logistic Regression": log_reg,
    "Decision Tree (depth=4)": tree_shallow,
    "Decision Tree (unconstrained)": tree_deep,
}

# 5-fold cross-validation on the training set for a more robust estimate
cv_results = {}
for name, model in models.items():
    scores = cross_val_score(model, X_train, y_train, cv=5, scoring="roc_auc")
    cv_results[name] = (scores.mean(), scores.std())
    print(f"{name}: 5-fold CV ROC-AUC = {scores.mean():.4f} (+/- {scores.std():.4f})")

# ---------------------------------------------------------------
# 3. EVALUATION
# ---------------------------------------------------------------
results = {}
for name, model in models.items():
    train_pred = model.predict(X_train)
    test_pred = model.predict(X_test)
    test_proba = model.predict_proba(X_test)[:, 1]

    results[name] = {
        "train_accuracy": accuracy_score(y_train, train_pred),
        "test_accuracy": accuracy_score(y_test, test_pred),
        "precision": precision_score(y_test, test_pred),
        "recall": recall_score(y_test, test_pred),
        "f1": f1_score(y_test, test_pred),
        "roc_auc": roc_auc_score(y_test, test_proba),
        "cv_auc_mean": cv_results[name][0],
        "cv_auc_std": cv_results[name][1],
    }
    print(f"\n--- {name} ---")
    print(classification_report(y_test, test_pred, target_names=["Profitable", "Loss"]))

with open("../outputs/metrics.json", "w") as f:
    json.dump(results, f, indent=2)
print("\nSaved ../outputs/metrics.json")

# ---------------------------------------------------------------
# 4. VISUALIZATIONS
# ---------------------------------------------------------------
primary_model = log_reg  # the chosen production model (see report for justification)
primary_name = "Logistic Regression"

# --- Confusion matrix ---
cm = confusion_matrix(y_test, primary_model.predict(X_test))
fig, ax = plt.subplots(figsize=(6.5, 5.5))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False,
            xticklabels=["Profitable", "Loss"], yticklabels=["Profitable", "Loss"], ax=ax,
            annot_kws={"size": 16})
ax.set_xlabel("Predicted Label")
ax.set_ylabel("True Label")
ax.set_title(f"Confusion Matrix — {primary_name} (Test Set)")
plt.tight_layout()
plt.savefig("../outputs/figures/m1_confusion_matrix.png")
plt.close()

# --- ROC curves, all models overlaid ---
fig, ax = plt.subplots(figsize=(7.5, 6))
for (name, model), color in zip(models.items(), PALETTE):
    proba = model.predict_proba(X_test)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, proba)
    auc = roc_auc_score(y_test, proba)
    ax.plot(fpr, tpr, label=f"{name} (AUC = {auc:.3f})", color=color, linewidth=2)
ax.plot([0, 1], [0, 1], linestyle="--", color="grey", label="Random guess (AUC = 0.5)")
ax.set_xlabel("False Positive Rate")
ax.set_ylabel("True Positive Rate")
ax.set_title("ROC Curve Comparison Across Models")
ax.legend(frameon=False, loc="lower right", fontsize=10)
plt.tight_layout()
plt.savefig("../outputs/figures/m2_roc_curve.png")
plt.close()

# --- Precision-Recall curve (useful given moderate class imbalance) ---
fig, ax = plt.subplots(figsize=(7.5, 6))
for (name, model), color in zip(models.items(), PALETTE):
    proba = model.predict_proba(X_test)[:, 1]
    prec, rec, _ = precision_recall_curve(y_test, proba)
    ax.plot(rec, prec, label=name, color=color, linewidth=2)
baseline = y_test.mean()
ax.axhline(baseline, linestyle="--", color="grey", label=f"No-skill baseline ({baseline:.2f})")
ax.set_xlabel("Recall")
ax.set_ylabel("Precision")
ax.set_title("Precision-Recall Curve Comparison")
ax.legend(frameon=False, loc="lower left", fontsize=10)
plt.tight_layout()
plt.savefig("../outputs/figures/m3_precision_recall.png")
plt.close()

# --- Feature importance / coefficients (Logistic Regression) ---
ohe_cols = list(preprocessor.named_transformers_["cat"].get_feature_names_out(FEATURES_CAT))
all_cols = FEATURES_NUM + ohe_cols
coefs = primary_model.named_steps["model"].coef_[0]
coef_df = pd.DataFrame({"feature": all_cols, "coefficient": coefs}).sort_values("coefficient")
fig, ax = plt.subplots(figsize=(8, 7))
colors = [PALETTE[4] if c > 0 else PALETTE[2] for c in coef_df["coefficient"]]
ax.barh(coef_df["feature"], coef_df["coefficient"], color=colors)
ax.axvline(0, color="black", linewidth=1)
ax.set_title("Logistic Regression Coefficients\n(Positive = Increases Loss Probability)")
ax.set_xlabel("Standardized Coefficient")
plt.tight_layout()
plt.savefig("../outputs/figures/m4_feature_importance.png")
plt.close()

# --- Train vs test accuracy across models (overfitting illustration) ---
fig, ax = plt.subplots(figsize=(8, 5.5))
names = list(results.keys())
train_acc = [results[n]["train_accuracy"] for n in names]
test_acc = [results[n]["test_accuracy"] for n in names]
x = np.arange(len(names))
w = 0.35
ax.bar(x - w/2, train_acc, width=w, label="Train Accuracy", color=PALETTE[0])
ax.bar(x + w/2, test_acc, width=w, label="Test Accuracy", color=PALETTE[1])
ax.set_xticks(x)
ax.set_xticklabels(names, rotation=12, ha="right")
ax.set_ylabel("Accuracy")
ax.set_ylim(0.5, 1.05)
ax.set_title("Train vs. Test Accuracy: the Unconstrained Tree Overfits")
ax.legend(frameon=False)
plt.tight_layout()
plt.savefig("../outputs/figures/m5_train_test_accuracy.png")
plt.close()

print("\nAll figures saved to ../outputs/figures/")
print(json.dumps(results, indent=2))
