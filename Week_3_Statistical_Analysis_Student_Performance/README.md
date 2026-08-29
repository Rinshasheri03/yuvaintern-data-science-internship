<div align="center">

# 📊 Study Hours & Exam Performance
### Statistical Analysis & Hypothesis Testing in Python — Week 3

**Virtual Data Science with Python Apprenticeship**

*Prepared by Rinsha Sherin*

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![SciPy](https://img.shields.io/badge/SciPy-Welch's_t--test-8CAAE6?logo=scipy&logoColor=white)](https://scipy.org/)
[![Pandas](https://img.shields.io/badge/Pandas-Data_Analysis-150458?logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![License](https://img.shields.io/badge/License-Educational-lightgrey)]()

</div>

---

## ✨ Overview

> **Does studying 5+ hours a day actually pay off in exam scores — or is it just anecdotal?**

This project tests that question statistically. Using a self-generated dataset of 120 student records, it compares the average exam performance of students who study **5 or more hours per day** against those who study **less than 5 hours per day**, using a full hypothesis-testing workflow in Python.

---

## 🎯 Objective

Determine, using statistical hypothesis testing, whether students who study **5+ hours per day** have significantly different average exam scores from students who study **below 5 hours per day**.

---

## 🔬 The Hypotheses

| | Statement |
|---|---|
| **H₀ (Null)** | There is **no significant difference** in mean exam scores between the two study-hour groups |
| **H₁ (Alternative)** | There **is a significant difference** in mean exam scores between the two study-hour groups |
| **Significance level** | α = 0.05 |

---

## 🗂️ Dataset

A **self-generated educational dataset** of 120 student records, created for demonstration purposes.

| Field | Description |
|:--|:--|
| Student ID | Unique identifier per student |
| Study hours per day | Average daily study time |
| Attendance percentage | Class attendance rate |
| Exam score | Final exam result |
| Study-hour group | 5+ hours vs. below 5 hours |

> ⚠️ This dataset is simulated, not collected from real students — treat findings as a methodology demonstration, not a real-world claim.

---

## ⚙️ Statistical Methods

```
Descriptive stats  →  Levene's test  →  Welch's t-test  →  95% CI  →  Visualize
```

1. **Descriptive statistics** for each group
2. **Levene's test** for equality of variances
3. **Welch's independent-samples t-test** (robust to unequal variances)
4. **95% confidence interval** for the difference in means (Welch–Satterthwaite)
5. **Visualizations** — histogram, box plot, and scatter plot

---

## 📈 Results

<div align="center">

| Group | n | Mean Exam Score | Std. Dev. |
|:--|:--:|:--:|:--:|
| 5+ hours/day | 64 | **90.95** | 6.27 |
| Below 5 hours/day | 56 | **81.68** | 7.19 |

| Metric | Value |
|:--|:--:|
| **Levene's test p-value** | 0.338 (variances not significantly different) |
| **Welch t-statistic** | 7.476 |
| **p-value** | 1.965 × 10⁻¹¹ |
| **Mean difference** | 9.27 points |
| **95% CI (mean difference)** | [6.81, 11.73] |
| **Decision** | ❌ Reject H₀ |

</div>

🟢 **The result is highly significant.** Students studying 5+ hours per day scored, on average, **~9.3 points higher**, and the effect is extremely unlikely to be due to chance.

---

## 🖼️ Visualizations

| Chart | What it shows |
|:--|:--|
| `exam_score_distribution.png` | Overlaid histograms of exam scores for both groups |
| `exam_scores_by_study_group.png` | Box plot comparing score spread and medians |
| `study_hours_vs_exam_score.png` | Scatter plot of study hours vs. exam score, with the 5-hour threshold marked |

---

## ✅ Conclusion

The null hypothesis is **rejected**. There is a statistically significant difference in average exam scores between the two study-hour groups in this dataset. Because the data are simulated, the result should be treated as an **educational demonstration of statistical methodology**, not evidence about real students.

---

## ⚠️ Limitations

- The dataset is self-generated, not collected from a real student population.
- Only exam score and study hours were analyzed; other factors (sleep, prior grades, subject difficulty) are not modeled.
- Statistical significance does not imply causation — the design does not control for confounding variables.
- Findings should not be generalized beyond this demonstration dataset.

---

## 🛠️ Technologies Used

`Python` · `Pandas` · `NumPy` · `SciPy` · `Matplotlib` · `Microsoft Word`

## 📁 Repository Structure

```
Week_3_Statistical_Analysis_Student_Performance/
├── README.md
├── statistical_analysis.py
├── student_performance_dataset.csv
├── Week_3_Statistical_Analysis_Report.docx
├── submission_description.txt
└── visualizations/
    ├── exam_score_distribution.png
    ├── exam_scores_by_study_group.png
    └── study_hours_vs_exam_score.png
```

## ▶️ How to Run

```bash
pip install pandas numpy scipy matplotlib
python statistical_analysis.py
```

---

<div align="center">

**Author:** Rinsha Sherin
*Internship Task — Week 3, Virtual Data Science with Python Apprenticeship*

</div>
