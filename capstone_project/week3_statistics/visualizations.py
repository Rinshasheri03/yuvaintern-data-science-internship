import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
from scipy import stats

sns.set_theme(style="whitegrid", font_scale=1.05)
PALETTE = ["#2E5EAA", "#E8743B", "#3CB4A4", "#8E6C88", "#C0504D"]
plt.rcParams["figure.dpi"] = 150
plt.rcParams["axes.titleweight"] = "bold"
plt.rcParams["axes.titlesize"] = 14

df = pd.read_csv("../data/retail_data.csv", parse_dates=["OrderDate"])
df["IsLoss"] = df["Profit"] < 0
df["HighDiscount"] = df["Discount"] >= 0.30

cat_order = ["Furniture", "Office Supplies", "Technology"]

# ---------- 1. Boxplot of margin by category (ANOVA visual) ----------
fig, ax = plt.subplots(figsize=(8, 5.5))
sns.boxplot(data=df, x="Category", y="Margin", order=cat_order,
            palette=PALETTE[:3], showmeans=True,
            meanprops={"marker": "D", "markerfacecolor": "white", "markeredgecolor": "black", "markersize": 7}, ax=ax)
ax.axhline(0, color="black", linewidth=1, linestyle=":")
ax.set_title("Profit Margin Distribution Differs Sharply by Category\n(One-Way ANOVA: p < .001)")
ax.set_ylabel("Profit Margin")
ax.set_xlabel("")
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f"{v:.0%}"))
plt.tight_layout()
plt.savefig("s1_boxplot_margin_category.png")
plt.close()

# ---------- 2. Mean margin with 95% CI error bars (pairwise t-test visual) ----------
summary = pd.read_csv("category_summary.csv").set_index("Category").loc[cat_order]
fig, ax = plt.subplots(figsize=(8, 5.5))
means = summary["MeanMargin"].values
err_low = means - summary["CI_low"].values
err_high = summary["CI_high"].values - means
ax.bar(cat_order, means, yerr=[err_low, err_high], capsize=8, color=PALETTE[:3], alpha=0.85)
ax.axhline(0, color="black", linewidth=1, linestyle=":")
ax.set_title("Mean Profit Margin by Category with 95% Confidence Intervals")
ax.set_ylabel("Mean Profit Margin")
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f"{v:.0%}"))
# significance annotations
def sig_bar(x1, x2, y, text):
    ax.plot([x1, x1, x2, x2], [y, y+0.008, y+0.008, y], color="black", linewidth=1)
    ax.text((x1+x2)/2, y+0.01, text, ha="center", fontsize=11)
sig_bar(0, 2, 0.19, "***")
sig_bar(0, 1, 0.12, "***")
sig_bar(1, 2, 0.16, "***")
plt.tight_layout()
plt.savefig("s2_meanmargin_ci_category.png")
plt.close()

# ---------- 3. Stacked bar: loss rate by discount tier (chi-square visual) ----------
loss_rate = df.groupby("HighDiscount")["IsLoss"].value_counts(normalize=True).unstack() * 100
labels = ["Discount < 30%", "Discount \u2265 30%"]
profitable = loss_rate[False].values
lossmaking = loss_rate[True].values
fig, ax = plt.subplots(figsize=(7.5, 5.5))
x = np.arange(2)
ax.bar(x, profitable, width=0.55, color=PALETTE[2], label="Profitable")
ax.bar(x, lossmaking, width=0.55, bottom=profitable, color=PALETTE[4], label="Loss-making")
ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.set_title("Loss Rate Jumps From 14% to 88% at the 30% Discount Threshold\n(chi\u00b2 = 4171.1, p < .001)")
ax.set_ylabel("% of Transactions")
ax.legend(frameon=False, loc="center left", bbox_to_anchor=(1.0, 0.5))
plt.tight_layout()
plt.savefig("s3_loss_rate_discount_tier.png")
plt.close()

# ---------- 4. Regression scatter: discount vs margin ----------
sample = df.sample(1500, random_state=1)
slope, intercept, r_value, p_val, std_err = stats.linregress(df["Discount"], df["Margin"])
fig, ax = plt.subplots(figsize=(8, 5.5))
ax.scatter(sample["Discount"], sample["Margin"], alpha=0.35, s=22, color=PALETTE[0], edgecolor="none")
x_line = np.linspace(0, 0.5, 100)
y_line = intercept + slope * x_line
ax.plot(x_line, y_line, color=PALETTE[4], linewidth=2.5,
        label=f"Fitted line: Margin = {intercept:.3f} \u2212 {abs(slope):.3f}\u00d7Discount")
ax.axhline(0, color="black", linewidth=1, linestyle=":")
ax.set_title(f"Discount Explains 70% of the Variation in Profit Margin\n(r = {r_value:.2f}, p < .001)")
ax.set_xlabel("Discount Rate")
ax.set_ylabel("Profit Margin")
ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f"{v:.0%}"))
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f"{v:.0%}"))
ax.legend(frameon=False, loc="upper right")
plt.tight_layout()
plt.savefig("s4_regression_discount_margin.png")
plt.close()

# ---------- 5. Distribution overlay (density) of margin by category ----------
fig, ax = plt.subplots(figsize=(8, 5.5))
for cat, color in zip(cat_order, PALETTE[:3]):
    sns.kdeplot(df[df["Category"] == cat]["Margin"], ax=ax, fill=True, alpha=0.25,
                color=color, label=cat, linewidth=2)
ax.axvline(0, color="black", linewidth=1, linestyle=":")
ax.set_title("Category Margin Distributions Are Distinct, Not Just Different Means")
ax.set_xlabel("Profit Margin")
ax.set_ylabel("Density")
ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f"{v:.0%}"))
ax.legend(frameon=False)
plt.tight_layout()
plt.savefig("s5_kde_margin_category.png")
plt.close()

print("done")
