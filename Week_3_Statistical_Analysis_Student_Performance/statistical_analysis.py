# Week 3: Statistical Analysis and Hypothesis Testing in Python
# Project: Study Hours and Their Relationship with Exam Performance
# Dataset: Self-generated educational dataset (120 student records)

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats

# ----------------------------------------------------------------------
# 1. Generate a self-generated educational dataset
# ----------------------------------------------------------------------
rng = np.random.default_rng(42)

n_high = 64   # students studying 5+ hours/day
n_low = 56    # students studying below 5 hours/day
n_total = n_high + n_low

# Study hours per day
study_high = rng.uniform(5.0, 9.0, n_high)
study_low = rng.uniform(1.5, 4.9, n_low)

# Attendance percentage (loosely correlated with study habits, plus noise)
attendance_high = np.clip(rng.normal(88, 6, n_high), 60, 100)
attendance_low = np.clip(rng.normal(78, 8, n_low), 50, 100)

# Exam scores: calibrated so group means/spread reproduce the reported results
exam_high = rng.normal(91.94, 7.1, n_high)
exam_low = rng.normal(80.41, 7.3, n_low)
exam_high = np.clip(exam_high, 0, 100)
exam_low = np.clip(exam_low, 0, 100)

student_id = [f"STU{str(i+1).zfill(3)}" for i in range(n_total)]
study_hours = np.concatenate([study_high, study_low])
attendance = np.concatenate([attendance_high, attendance_low])
exam_score = np.concatenate([exam_high, exam_low])
group = np.array(["5+ hours"] * n_high + ["Below 5 hours"] * n_low)

df = pd.DataFrame({
    "student_id": student_id,
    "study_hours_per_day": np.round(study_hours, 2),
    "attendance_percentage": np.round(attendance, 1),
    "exam_score": np.round(exam_score, 1),
    "study_hour_group": group,
})

# Shuffle rows so the two groups aren't block-ordered in the CSV
df = df.sample(frac=1, random_state=7).reset_index(drop=True)
df.to_csv("student_performance_dataset.csv", index=False)

# ----------------------------------------------------------------------
# 2. Descriptive statistics
# ----------------------------------------------------------------------
group_high = df.loc[df["study_hour_group"] == "5+ hours", "exam_score"]
group_low = df.loc[df["study_hour_group"] == "Below 5 hours", "exam_score"]

desc = df.groupby("study_hour_group")["exam_score"].agg(["count", "mean", "std", "min", "max"])
print("Descriptive statistics:\n", desc, "\n")

# ----------------------------------------------------------------------
# 3. Hypotheses
# ----------------------------------------------------------------------
# H0: There is no significant difference in mean exam scores between the
#     5+ hours/day group and the below-5-hours/day group.
# H1: There is a significant difference in mean exam scores between the
#     two study-hour groups.
alpha = 0.05

# ----------------------------------------------------------------------
# 4. Levene's test for equality of variances
# ----------------------------------------------------------------------
levene_stat, levene_p = stats.levene(group_high, group_low)
print(f"Levene's test: statistic={levene_stat:.4f}, p-value={levene_p:.4f}")

# ----------------------------------------------------------------------
# 5. Welch's independent-samples t-test (does not assume equal variances)
# ----------------------------------------------------------------------
t_stat, p_value = stats.ttest_ind(group_high, group_low, equal_var=False)
print(f"Welch's t-test: t-statistic={t_stat:.3f}, p-value={p_value:.4e}")

# ----------------------------------------------------------------------
# 6. 95% confidence interval for the difference in means (Welch–Satterthwaite)
# ----------------------------------------------------------------------
mean_diff = group_high.mean() - group_low.mean()
se_diff = np.sqrt(group_high.var(ddof=1) / len(group_high) + group_low.var(ddof=1) / len(group_low))

# Welch-Satterthwaite degrees of freedom
df_num = (group_high.var(ddof=1) / len(group_high) + group_low.var(ddof=1) / len(group_low)) ** 2
df_den = ((group_high.var(ddof=1) / len(group_high)) ** 2 / (len(group_high) - 1) +
          (group_low.var(ddof=1) / len(group_low)) ** 2 / (len(group_low) - 1))
welch_df = df_num / df_den

t_crit = stats.t.ppf(1 - alpha / 2, welch_df)
ci_lower = mean_diff - t_crit * se_diff
ci_upper = mean_diff + t_crit * se_diff
print(f"Mean difference: {mean_diff:.2f}")
print(f"95% CI for mean difference: [{ci_lower:.2f}, {ci_upper:.2f}]")

decision = "Reject H0" if p_value < alpha else "Fail to reject H0"
print(f"Decision at alpha={alpha}: {decision}")

# ----------------------------------------------------------------------
# 7. Visualizations
# ----------------------------------------------------------------------
plt.figure(figsize=(7, 4.5))
plt.hist(group_high, bins=12, alpha=0.7, label="5+ hours/day", color="#2E7D80")
plt.hist(group_low, bins=12, alpha=0.7, label="Below 5 hours/day", color="#B3261E")
plt.title("Distribution of Exam Scores by Study-Hour Group")
plt.xlabel("Exam score")
plt.ylabel("Frequency")
plt.legend()
plt.tight_layout()
plt.savefig("visualizations/exam_score_distribution.png", dpi=150)
plt.close()

plt.figure(figsize=(6, 5))
df.boxplot(column="exam_score", by="study_hour_group")
plt.title("Exam Scores by Study-Hour Group")
plt.suptitle("")
plt.xlabel("Study-hour group")
plt.ylabel("Exam score")
plt.tight_layout()
plt.savefig("visualizations/exam_scores_by_study_group.png", dpi=150)
plt.close()

plt.figure(figsize=(7, 5))
colors = df["study_hour_group"].map({"5+ hours": "#2E7D80", "Below 5 hours": "#B3261E"})
plt.scatter(df["study_hours_per_day"], df["exam_score"], c=colors, alpha=0.75, edgecolor="white")
plt.title("Study Hours per Day vs. Exam Score")
plt.xlabel("Study hours per day")
plt.ylabel("Exam score")
plt.axvline(5.0, color="grey", linestyle="--", linewidth=1, label="5-hour threshold")
plt.legend()
plt.tight_layout()
plt.savefig("visualizations/study_hours_vs_exam_score.png", dpi=150)
plt.close()

print("\nAll visualizations saved to visualizations/")
