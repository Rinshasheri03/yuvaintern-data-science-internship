const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun,
  AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, PageBreak,
} = require("docx");

const NAVY = "1F3864";
const ACCENT = "E8743B";
const GREY = "595959";

function img(path, widthPx, ratio = 0.75) {
  const data = fs.readFileSync(path);
  return new ImageRun({ type: "png", data, transformation: { width: widthPx, height: Math.round(widthPx * ratio) } });
}
function h1(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }); }
function h2(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } }); }
function body(text) {
  return new Paragraph({
    children: [new TextRun({ text })],
    spacing: { after: 200, line: 300 },
    alignment: AlignmentType.JUSTIFIED,
  });
}
function figureHeading(num, text) {
  return new Paragraph({
    children: [new TextRun({ text: `Figure ${num}. ${text}`, bold: true, color: NAVY, size: 22 })],
    spacing: { before: 200, after: 100 },
  });
}
function bullet(text) { return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 100 } }); }

function codeBlock(lines) {
  return new Paragraph({
    children: lines.map((l, i) => new TextRun({ text: l, font: "Consolas", size: 18, break: i === 0 ? 0 : 1 })),
    shading: { type: ShadingType.CLEAR, fill: "F5F5F5" },
    border: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
    },
    spacing: { before: 150, after: 250 },
  });
}

function cell(text, opts = {}) {
  return new TableCell({
    width: { size: opts.width || 2000, type: WidthType.DXA },
    shading: opts.header ? { type: ShadingType.CLEAR, fill: NAVY } : undefined,
    children: [new Paragraph({
      alignment: opts.center === false ? AlignmentType.LEFT : AlignmentType.CENTER,
      children: [new TextRun({ text, bold: !!opts.header, color: opts.header ? "FFFFFF" : "000000", size: 20 })],
    })],
  });
}
function table(headers, rows, widths) {
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ children: headers.map((h, i) => cell(h, { header: true, width: widths[i] })) }),
      ...rows.map(r => new TableRow({ children: r.map((c, i) => cell(c, { width: widths[i], center: i !== 0 })) })),
    ],
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal",
        run: { color: NAVY, size: 32, bold: true }, paragraph: { spacing: { before: 400, after: 200 } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal",
        run: { color: ACCENT, size: 26, bold: true }, paragraph: { spacing: { before: 300, after: 150 } } },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 } } },
    children: [
      // ---------------- TITLE PAGE ----------------
      new Paragraph({ spacing: { before: 2200 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Predicting Loss-Making Transactions", bold: true, size: 50, color: NAVY })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 150, after: 600 },
        children: [new TextRun({ text: "A Binary Classification Model for Retail Order Risk, Built and Evaluated in Scikit-learn", size: 28, color: ACCENT, bold: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 1600 },
        children: [new TextRun({ text: "Machine Learning Model Development and Evaluation", size: 22, color: GREY })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 100 },
        children: [new TextRun({ text: "Week 4 Task Submission — Yuva Intern / NSDC", size: 22, color: GREY })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 100 },
        children: [new TextRun({ text: "Tools used: Python, Pandas, NumPy, Scikit-learn, Matplotlib, Seaborn", size: 22, color: GREY })],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ---------------- 1. INTRODUCTION ----------------
      h1("1. Introduction and Problem Framing"),
      body("Weeks 2 and 3 of this internship established, first visually and then statistically, that a meaningful share of retail transactions in this dataset are loss-making, and that discount rate and product category are strong drivers of that outcome. Week 4 turns that finding into a predictive tool: a binary classification model that estimates, at the moment an order is placed, the probability that the transaction will end up unprofitable."),
      body("This has direct business value. If a sales or pricing system can flag high-risk orders in real time \u2014 before the discount is finalized \u2014 it can prompt a manager approval step or a discount cap, rather than discovering the loss after the fact in a monthly profit report. The task is therefore framed as: predict IsLoss (1 = loss-making, 0 = profitable) using only information available at order time \u2014 Category, Region, Segment, Quantity, Discount, and Sales \u2014 explicitly excluding Profit and Margin, which are only known after the fact and would leak the answer into the model."),

      // ---------------- 2. DATA PREPARATION ----------------
      h1("2. Data Preparation"),
      body("The dataset is the same 9,800-row global retail transactions dataset used in Weeks 2\u20133 (2021\u20132024), with a binary target IsLoss derived from Profit < 0. The dataset was checked for missing values (none found) and the target's class balance was confirmed: 28.9% of transactions are loss-making versus 71.1% profitable \u2014 a moderate imbalance that is not severe enough to require resampling techniques (such as SMOTE), but does mean accuracy alone is a misleading metric, so precision, recall, F1, and ROC-AUC are all reported rather than relying on accuracy in isolation."),
      h2("2.1 Feature Set"),
      table(
        ["Feature", "Type", "Preprocessing"],
        [
          ["Quantity", "Numeric", "Standardized (zero mean, unit variance)"],
          ["Discount", "Numeric", "Standardized"],
          ["Sales", "Numeric", "Standardized"],
          ["Category", "Categorical (3 levels)", "One-hot encoded, first level dropped"],
          ["Region", "Categorical (5 levels)", "One-hot encoded, first level dropped"],
          ["Segment", "Categorical (3 levels)", "One-hot encoded, first level dropped"],
        ],
        [2500, 3000, 3500]
      ),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      body("Numeric features were standardized because Logistic Regression's coefficients and regularization are scale-sensitive; categorical features were one-hot encoded with the first category dropped in each group to avoid multicollinearity (the \u201cdummy variable trap\u201d). All preprocessing was wrapped in a Scikit-learn ColumnTransformer inside a Pipeline, so the exact same transformation learned on the training set is applied to the test set with no risk of data leakage."),
      h2("2.2 Train/Test Split"),
      body("Data was split 75%/25% into training (n = 7,350) and test (n = 2,450) sets using stratified sampling on the target, so both sets preserve the same 28.9% loss rate. Stratification matters here specifically because of the class imbalance \u2014 a random (non-stratified) split risks producing a test set with a meaningfully different class balance purely by chance, which would distort every evaluation metric that follows."),
      codeBlock([
        "from sklearn.model_selection import train_test_split",
        "from sklearn.compose import ColumnTransformer",
        "from sklearn.preprocessing import StandardScaler, OneHotEncoder",
        "",
        "X_train, X_test, y_train, y_test = train_test_split(",
        "    X, y, test_size=0.25, random_state=42, stratify=y",
        ")",
        "",
        "preprocessor = ColumnTransformer([",
        "    ('num', StandardScaler(), ['Quantity', 'Discount', 'Sales']),",
        "    ('cat', OneHotEncoder(drop='first'), ['Category', 'Region', 'Segment']),",
        "])",
      ]),

      // ---------------- 3. MODEL SELECTION ----------------
      h1("3. Model Selection and Training"),
      body("Three models were trained and compared, all wrapped in the same preprocessing pipeline to ensure a fair comparison:"),
      bullet("Logistic Regression \u2014 chosen as the primary model. It is the natural baseline for binary classification: it is interpretable (coefficients show each feature's direction and strength of effect on loss probability, directly extending the Week 3 regression findings), computationally cheap, and resistant to overfitting on a dataset of this size."),
      bullet("Decision Tree (max_depth = 4) \u2014 a shallow, regularized tree included to check whether a non-linear model captures meaningfully more signal than a linear one."),
      bullet("Decision Tree (unconstrained) \u2014 a deliberately unregularized tree, included specifically to illustrate overfitting for the evaluation discussion in Section 4, not as a candidate for production use."),
      body("Logistic Regression was selected as the final recommended model (see Section 5 justification). All three models were validated with 5-fold cross-validation on the training set alone, before any test-set evaluation, to get a more robust performance estimate than a single train/test split would provide."),
      codeBlock([
        "from sklearn.linear_model import LogisticRegression",
        "from sklearn.tree import DecisionTreeClassifier",
        "from sklearn.pipeline import Pipeline",
        "from sklearn.model_selection import cross_val_score",
        "",
        "log_reg = Pipeline([('preprocess', preprocessor),",
        "                     ('model', LogisticRegression(max_iter=1000, random_state=42))])",
        "log_reg.fit(X_train, y_train)",
        "",
        "cv_scores = cross_val_score(log_reg, X_train, y_train, cv=5, scoring='roc_auc')",
        "# 5-fold CV ROC-AUC = 0.969 (+/- 0.003)",
      ]),

      // ---------------- 4. EVALUATION ----------------
      h1("4. Evaluation"),
      h2("4.1 Metric Comparison"),
      table(
        ["Model", "Train Acc.", "Test Acc.", "Precision", "Recall", "F1", "Test ROC-AUC", "5-fold CV AUC"],
        [
          ["Logistic Regression", "91.5%", "91.7%", "0.939", "0.762", "0.842", "0.970", "0.969 \u00b1 0.003"],
          ["Decision Tree (d=4)", "91.5%", "91.6%", "0.933", "0.762", "0.839", "0.958", "0.957 \u00b1 0.004"],
          ["Decision Tree (unconstr.)", "100.0%", "88.2%", "0.796", "0.793", "0.795", "0.855", "0.848 \u00b1 0.007"],
        ],
        [2600, 1300, 1300, 1300, 1000, 900, 1400, 1600]
      ),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      body("(\u201cLoss\u201d is treated as the positive class throughout, since correctly catching loss-making orders is the business objective; precision/recall/F1 are reported for that class.)"),
      new Paragraph({ children: [img("outputs/figures/m1_confusion_matrix.png", 380, 0.83)], alignment: AlignmentType.CENTER }),
      figureHeading(1, "Confusion matrix for Logistic Regression on the held-out test set (n = 2,450)."),
      body("Of 707 genuinely loss-making test transactions, the model correctly flags 539 (76.2% recall) while missing 168. Of the 574 transactions it flags as high-risk, 539 are true losses (93.9% precision) \u2014 so when the model raises a flag, it is right the large majority of the time, though it does miss roughly one in four true losses. Only 35 profitable transactions are incorrectly flagged, out of 1,743 (98% specificity)."),
      new Paragraph({ children: [img("outputs/figures/m2_roc_curve.png", 460, 0.75)], alignment: AlignmentType.CENTER }),
      figureHeading(2, "ROC curves for all three models on the test set."),
      body("Logistic Regression achieves the highest test ROC-AUC (0.970), narrowly ahead of the shallow tree (0.958) and clearly ahead of the unconstrained tree (0.855). Because the shallow tree does not meaningfully outperform the linear model, this is evidence that the loss/profit boundary in this feature space is close to linear \u2014 consistent with the strong linear relationship (r = -0.834) already found between discount and margin in the Week 3 regression analysis."),
      new Paragraph({ children: [img("outputs/figures/m3_precision_recall.png", 460, 0.75)], alignment: AlignmentType.CENTER }),
      figureHeading(3, "Precision-recall curves, more informative than ROC under class imbalance."),
      body("Because the positive class (Loss) is a minority (28.9%), the precision-recall curve is shown alongside ROC, since PR curves are more sensitive to performance on the minority class. Logistic Regression maintains high precision across most of the recall range, only degrading sharply as recall approaches 1.0 \u2014 meaning the model would need to accept many false alarms to catch every single loss-making order."),
      new Paragraph({ children: [img("outputs/figures/m4_feature_importance.png", 460, 0.875)], alignment: AlignmentType.CENTER }),
      figureHeading(4, "Standardized Logistic Regression coefficients."),
      body("Discount is by far the strongest predictor of loss probability, consistent with Week 3's finding that discount rate alone explains ~70% of margin variance. Category effects are also visible and directionally consistent with Weeks 2\u20133: Furniture-related categories push toward higher loss probability relative to the baseline (Technology), while Region and Segment contribute comparatively little \u2014 reinforcing that discounting and category, not geography or customer type, are the operational levers that matter."),
      new Paragraph({ children: [img("outputs/figures/m5_train_test_accuracy.png", 460, 0.75)], alignment: AlignmentType.CENTER }),
      figureHeading(5, "Train vs. test accuracy across the three models."),
      body("This chart is the clearest illustration of overfitting in the study. The unconstrained decision tree reaches 100% training accuracy \u2014 it has effectively memorized the training set, including its noise \u2014 but this does not transfer: test accuracy drops to 88.2% and test ROC-AUC drops to 0.855, both well below the shallow tree and Logistic Regression. Logistic Regression and the depth-4 tree, in contrast, show train and test accuracy within 0.2 percentage points of each other, indicating neither is overfitting."),

      // ---------------- 5. CRITICAL DISCUSSION ----------------
      h1("5. Critical Discussion: Errors, Limitations, and Improvements"),
      h2("5.1 Model Choice Justification"),
      body("Logistic Regression is recommended as the production model. It matches the best-performing tree on every metric while being simpler, faster to retrain, fully interpretable (Figure 4 can be shown directly to a pricing team), and inherently resistant to the overfitting demonstrated in Figure 5. The depth-4 tree is a reasonable secondary candidate if a rule-based, non-black-box explanation is preferred by stakeholders, but it offers no accuracy advantage here to justify its added complexity."),
      h2("5.2 Sources of Error"),
      bullet("False negatives (168 of 707 true losses missed) are the more business-costly error type, since a missed high-risk order proceeds without any intervention. The model's recall of 76.2% means roughly 1 in 4 loss-making orders currently slip through undetected."),
      bullet("The 30% recall/precision trade-off is tunable: the default 0.5 probability threshold can be lowered to increase recall (catch more true losses) at the cost of more false alarms flagged for manual review \u2014 an appropriate choice depends on how costly a manual review is versus an undetected loss."),
      bullet("The moderate class imbalance (28.9% positive) was handled via stratified splitting and by reporting precision/recall/F1/AUC rather than accuracy alone, but was not addressed with resampling (e.g., SMOTE) or class-weighting, which could be tested as a next step to see if recall improves without a large precision penalty."),
      bullet("This is an observational, self-generated dataset rather than real transactional data, so the strong linear discount \u2192 loss relationship it contains may be cleaner than a real business would exhibit; on real data, additional noise and unmeasured confounders (e.g., supplier cost changes, competitor pricing) would likely lower the ceiling on achievable AUC."),
      h2("5.3 Suggestions for Improvement"),
      bullet("Threshold tuning: select the probability cutoff that optimizes business cost (cost of a missed loss vs. cost of an unnecessary manual review) rather than defaulting to 0.5."),
      bullet("Additional features: order timing (day of week, proximity to holiday season, per Week 2's seasonality finding), customer order history, and supplier cost data would likely add predictive signal beyond what is available in this dataset."),
      bullet("Regularization sweep: an L1/L2 regularization strength search (GridSearchCV) on Logistic Regression, and pruning parameters (max_depth, min_samples_leaf) on the tree, to formally optimize rather than use default/single-value settings."),
      bullet("Ensemble methods: a Random Forest or Gradient Boosting model would likely close some of the recall gap without the overfitting risk shown by the single unconstrained tree, at some cost to interpretability."),

      // ---------------- 6. CONCLUSION ----------------
      h1("6. Conclusion"),
      body("This report developed and evaluated a binary classifier that predicts, using only order-time information, whether a retail transaction will be loss-making. Logistic Regression was selected as the final model, achieving 91.7% test accuracy, 0.970 ROC-AUC, and a stable 5-fold cross-validated AUC of 0.969 \u00b1 0.003, while remaining fully interpretable. Its coefficients directly corroborate the Week 3 statistical findings \u2014 discount rate is the dominant driver of loss probability \u2014 closing the loop between exploratory visualization (Week 2), formal hypothesis testing (Week 3), and a deployable predictive model (Week 4). The comparison against an unconstrained decision tree provided a clear, quantified illustration of overfitting, and the discussion of recall trade-offs and suggested improvements outlines a concrete path from this baseline model toward a production-ready risk-flagging tool."),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("outputs/Week4_ML_Model_Development_Evaluation_Report.docx", buf);
  console.log("written");
});
