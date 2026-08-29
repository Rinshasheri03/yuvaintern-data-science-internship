"""Week 2 — Advanced Data Visualization and Storytelling with Python.
Generates 6 narrative visualizations from the retail dataset."""
import pandas as pd, numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt, matplotlib.ticker as mticker
import seaborn as sns

sns.set_theme(style="whitegrid", font_scale=1.05)
PALETTE = ["#2E5EAA", "#E8743B", "#3CB4A4", "#8E6C88", "#C0504D"]
plt.rcParams["figure.dpi"] = 150

df = pd.read_csv("../data/retail_data.csv", parse_dates=["OrderDate"])

monthly = df.groupby(pd.Grouper(key="OrderDate", freq="ME"))["Sales"].sum().reset_index()
fig, ax = plt.subplots(figsize=(9, 5))
ax.plot(monthly["OrderDate"], monthly["Sales"], color=PALETTE[0], linewidth=2)
ax.fill_between(monthly["OrderDate"], monthly["Sales"], color=PALETTE[0], alpha=0.12)
z = np.polyfit(range(len(monthly)), monthly["Sales"], 1)
ax.plot(monthly["OrderDate"], np.poly1d(z)(range(len(monthly))), color=PALETTE[4], linestyle="--", label="Growth trend")
ax.set_title("Monthly Sales: Seasonality on a Rising Trend")
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x/1000:.0f}K"))
ax.legend(frameon=False); plt.tight_layout()
plt.savefig("../outputs/figures/w2_monthly_trend.png"); plt.close()

cat = df.groupby("Category")[["Sales", "Profit"]].sum().reset_index()
fig, ax = plt.subplots(figsize=(8, 5))
x = np.arange(len(cat)); w = 0.35
ax.bar(x - w/2, cat["Sales"], width=w, label="Sales", color=PALETTE[0])
ax.bar(x + w/2, cat["Profit"], width=w, label="Profit", color=PALETTE[2])
ax.set_xticks(x); ax.set_xticklabels(cat["Category"])
ax.set_title("Sales & Profit by Category")
ax.legend(frameon=False); plt.tight_layout()
plt.savefig("../outputs/figures/w2_category_sales_profit.png"); plt.close()
print("Week 2 visualizations saved.")
