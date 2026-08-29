"""
Generates the synthetic global retail transactions dataset used throughout
this internship (Weeks 2-4), so the ML model in Week 4 is trained on the
same data that was explored (Week 2) and statistically tested (Week 3).
"""
import numpy as np
import pandas as pd
import os

np.random.seed(42)

n = 9800
regions = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East & Africa"]
region_weights = [0.32, 0.27, 0.24, 0.11, 0.06]
categories = {
    "Technology": ["Phones", "Laptops", "Accessories", "Copiers"],
    "Furniture": ["Chairs", "Tables", "Bookcases", "Furnishings"],
    "Office Supplies": ["Binders", "Paper", "Storage", "Art"],
}
segments = ["Consumer", "Corporate", "Home Office"]

dates = pd.date_range("2021-01-01", "2024-12-31", freq="D")

rows = []
for i in range(n):
    order_date = pd.Timestamp(np.random.choice(dates))
    month = order_date.month
    year = order_date.year
    region = np.random.choice(regions, p=region_weights)
    category = np.random.choice(list(categories.keys()), p=[0.32, 0.21, 0.47])
    sub_category = np.random.choice(categories[category])
    segment = np.random.choice(segments, p=[0.51, 0.31, 0.18])

    seasonal_factor = 1.0
    if month in (11, 12):
        seasonal_factor = 1.55
    elif month == 2:
        seasonal_factor = 0.78
    elif month in (6, 7):
        seasonal_factor = 1.12

    yoy_factor = 1 + (year - 2021) * 0.09

    base_price = {"Technology": 420, "Furniture": 260, "Office Supplies": 55}[category]
    quantity = max(1, int(np.random.poisson(3)))
    unit_price = base_price * np.random.lognormal(mean=0, sigma=0.35)
    discount = np.random.choice([0, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5],
                                 p=[0.28, 0.2, 0.18, 0.14, 0.1, 0.06, 0.04])

    sales = round(unit_price * quantity * seasonal_factor * yoy_factor, 2)

    base_margin = {"Technology": 0.28, "Furniture": 0.11, "Office Supplies": 0.19}[category]
    margin = base_margin - (discount * 0.9) + np.random.normal(0, 0.05)
    profit = round(sales * margin, 2)

    rows.append([order_date, year, month, region, category, sub_category,
                 segment, quantity, discount, sales, profit])

df = pd.DataFrame(rows, columns=["OrderDate", "Year", "Month", "Region", "Category",
                                  "SubCategory", "Segment", "Quantity", "Discount",
                                  "Sales", "Profit"])
df["Margin"] = df["Profit"] / df["Sales"]
df["IsLoss"] = (df["Profit"] < 0).astype(int)

os.makedirs("data", exist_ok=True)
df.to_csv("../data/retail_data.csv", index=False)
print(f"Saved ../data/retail_data.csv with shape {df.shape}")
print(f"Class balance -> Loss: {df['IsLoss'].mean():.2%}, Profitable: {1 - df['IsLoss'].mean():.2%}")
