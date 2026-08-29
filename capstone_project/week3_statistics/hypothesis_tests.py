import pandas as pd
import numpy as np
from scipy import stats

df = pd.read_csv("../data/retail_data.csv", parse_dates=["OrderDate"])

print("="*70)
print("PRIMARY HYPOTHESIS: Mean profit margin differs across categories")
print("="*70)
groups = {cat: g["Margin"].values for cat, g in df.groupby("Category")}
for cat, vals in groups.items():
    print(f"{cat:18s} n={len(vals):5d}  mean={vals.mean():.4f}  sd={vals.std(ddof=1):.4f}")

# Levene's test for homogeneity of variance (ANOVA assumption check)
levene_stat, levene_p = stats.levene(*groups.values())
print(f"\nLevene's test for equal variances: stat={levene_stat:.4f}, p={levene_p:.6f}")

f_stat, anova_p = stats.f_oneway(*groups.values())
print(f"One-way ANOVA: F={f_stat:.4f}, p={anova_p:.6e}")

# Effect size: eta-squared
all_vals = np.concatenate(list(groups.values()))
grand_mean = all_vals.mean()
ss_between = sum(len(v) * (v.mean() - grand_mean)**2 for v in groups.values())
ss_total = sum((all_vals - grand_mean)**2)
eta_sq = ss_between / ss_total
print(f"Effect size (eta-squared): {eta_sq:.4f}")

# Pairwise t-tests with Bonferroni correction (manual Tukey-style follow-up)
print("\nPairwise independent-samples t-tests (Bonferroni-corrected alpha=0.0167 for 3 comparisons):")
pairs = [("Technology", "Furniture"), ("Technology", "Office Supplies"), ("Furniture", "Office Supplies")]
alpha_corrected = 0.05 / len(pairs)
pairwise_results = []
for a, b in pairs:
    t_stat, p_val = stats.ttest_ind(groups[a], groups[b], equal_var=False)  # Welch's t-test
    diff = groups[a].mean() - groups[b].mean()
    # 95% CI for the difference (Welch)
    n1, n2 = len(groups[a]), len(groups[b])
    v1, v2 = groups[a].var(ddof=1), groups[b].var(ddof=1)
    se = np.sqrt(v1/n1 + v2/n2)
    dof = (v1/n1 + v2/n2)**2 / ((v1/n1)**2/(n1-1) + (v2/n2)**2/(n2-1))
    tcrit = stats.t.ppf(0.975, dof)
    ci = (diff - tcrit*se, diff + tcrit*se)
    sig = "SIGNIFICANT" if p_val < alpha_corrected else "not significant"
    print(f"{a} vs {b}: t={t_stat:.3f}, p={p_val:.3e}, mean diff={diff:.4f}, "
          f"95% CI=({ci[0]:.4f}, {ci[1]:.4f}) -> {sig}")
    pairwise_results.append((a, b, t_stat, p_val, diff, ci, sig))

print("\n" + "="*70)
print("SECONDARY HYPOTHESIS: High discounts (>=30%) are associated with")
print("a transaction resulting in a net loss")
print("="*70)
df["HighDiscount"] = df["Discount"] >= 0.30
df["IsLoss"] = df["Profit"] < 0
contingency = pd.crosstab(df["HighDiscount"], df["IsLoss"])
print(contingency)
chi2, chi_p, dof_chi, expected = stats.chi2_contingency(contingency)
print(f"\nChi-square test: chi2={chi2:.4f}, dof={dof_chi}, p={chi_p:.3e}")
# Cramer's V effect size
n_total = contingency.values.sum()
cramers_v = np.sqrt(chi2 / (n_total * (min(contingency.shape) - 1)))
print(f"Cramer's V (effect size): {cramers_v:.4f}")
loss_rate_low = df[~df["HighDiscount"]]["IsLoss"].mean()
loss_rate_high = df[df["HighDiscount"]]["IsLoss"].mean()
print(f"Loss rate at discount <30%: {loss_rate_low:.2%}")
print(f"Loss rate at discount >=30%: {loss_rate_high:.2%}")

print("\n" + "="*70)
print("TERTIARY HYPOTHESIS: Discount rate is negatively correlated with")
print("profit margin (linear relationship)")
print("="*70)
slope, intercept, r_value, reg_p, std_err = stats.linregress(df["Discount"], df["Margin"])
print(f"Pearson r = {r_value:.4f}, R-squared = {r_value**2:.4f}")
print(f"Regression: Margin = {intercept:.4f} + ({slope:.4f}) * Discount")
print(f"Slope p-value = {reg_p:.3e}, Standard error = {std_err:.5f}")

# Save summary stats for report tables
summary_rows = []
for cat, vals in groups.items():
    ci_low, ci_high = stats.t.interval(0.95, len(vals)-1, loc=vals.mean(), scale=stats.sem(vals))
    summary_rows.append([cat, len(vals), vals.mean(), vals.std(ddof=1), ci_low, ci_high])
summary_df = pd.DataFrame(summary_rows, columns=["Category", "n", "MeanMargin", "SD", "CI_low", "CI_high"])
summary_df.to_csv("category_summary.csv", index=False)
print("\nSaved category_summary.csv")
