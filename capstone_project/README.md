# From Data to Decisions — Retail Profitability Capstone

**Final (Week 5) Task — Comprehensive Data Science Project Reporting and
Strategic Recommendations** (Yuva Intern / NSDC internship program)

This repository contains the complete, four-phase data science pipeline
built over the course of the internship: exploratory visualization,
statistical hypothesis testing, machine learning, and a final synthesized
strategic report — all built on one consistent global retail transactions
dataset (2021–2024, n = 9,800).

## Headline Finding

Discount rate is the dominant, statistically confirmed, and
model-validated driver of profit loss in this business. Transactions
discounted **≥30%** have an **88% loss rate**, versus **14%** below that
threshold (χ² = 4171.1, p < .001). A Logistic Regression classifier
trained on order-time features predicts loss-making transactions with
**91.7% accuracy** and **0.970 ROC-AUC**, independently confirming
discount rate as the top predictive feature.

**→ Full narrative, all visualizations, and strategic recommendations:**
[`outputs/Week5_Comprehensive_Project_Report_Strategic_Recommendations.docx`](outputs/Week5_Comprehensive_Project_Report_Strategic_Recommendations.docx)

## Repository Structure

```
capstone_project/
├── data/
│   └── retail_data.csv                    # shared dataset, all 3 phases
├── week2_visualization/
│   ├── 01_generate_dataset.py
│   └── 02_visualizations.py               # 6 narrative charts
├── week3_statistics/
│   ├── hypothesis_tests.py                # ANOVA, chi-square, regression
│   └── visualizations.py                  # 5 statistical charts
├── week4_ml_model/
│   ├── src/
│   │   ├── generate_dataset.py
│   │   ├── train_and_evaluate.py          # Logistic Regression + trees
│   │   └── build_report.js
│   └── outputs/
│       ├── figures/                       # confusion matrix, ROC, etc.
│       └── metrics.json
├── outputs/
│   ├── figures/                           # curated cross-phase figures
│   └── Week5_Comprehensive_Project_Report_Strategic_Recommendations.docx
├── build_report.js                        # generates the Week 5 report
├── requirements.txt
└── README.md
```

## Project Phases

| Week | Focus | Key Output |
|---|---|---|
| 2 | Data Visualization & Storytelling | 6 narrative charts revealing Furniture's profit gap |
| 3 | Statistical Hypothesis Testing | ANOVA (η² = 0.187), chi-square (Cramer's V = 0.652), regression (r = -0.834) — all p < .001 |
| 4 | Machine Learning | Logistic Regression classifier, 0.970 test ROC-AUC |
| 5 | **This repo's report** | Synthesis + 5 prioritized strategic recommendations |

## How to Run (VS Code)

1. Open this folder in VS Code.
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate     # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Regenerate the shared dataset:
   ```bash
   python week2_visualization/01_generate_dataset.py
   ```
4. Run each phase (from its own folder, since scripts use relative paths):
   ```bash
   cd week2_visualization && python 02_visualizations.py && cd ..
   cd week3_statistics && python hypothesis_tests.py && python visualizations.py && cd ..
   cd week4_ml_model && python src/generate_dataset.py && python src/train_and_evaluate.py && cd ..
   ```
5. (Optional) Regenerate the Week 5 Word report:
   ```bash
   npm install docx
   node build_report.js
   ```

## Strategic Recommendations (Summary)

1. **Cap discounts at 25–30%** on thin-margin Furniture sub-categories.
2. **Deploy the Week 4 model as a live order-approval gate.**
3. **Prioritize Asia Pacific** for regional growth investment.
4. **Plan capacity from the fitted trend line**, not holiday peaks.
5. **Review Furniture's structural cost base** independently of discounting.

Full justification for each recommendation, with supporting evidence
from all three analytical phases, is in the Week 5 report.

## Tools

Python · Pandas · NumPy · SciPy · Scikit-learn · Matplotlib · Seaborn ·
Node.js (`docx` package for report generation)
