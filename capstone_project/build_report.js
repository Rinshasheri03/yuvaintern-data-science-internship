const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun,
  AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, PageBreak, TableOfContents,
} = require("docx");

const NAVY = "1F3864";
const ACCENT = "E8743B";
const GREY = "595959";
const GOOD = "3CB4A4";

function img(path, widthPx, ratio = 0.72) {
  const data = fs.readFileSync(path);
  return new ImageRun({ type: "png", data, transformation: { width: widthPx, height: Math.round(widthPx * ratio) } });
}
function h1(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }); }
function h2(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } }); }
function body(text) {
  return new Paragraph({ children: [new TextRun({ text })], spacing: { after: 200, line: 300 }, alignment: AlignmentType.JUSTIFIED });
}
function figureHeading(num, text) {
  return new Paragraph({
    children: [new TextRun({ text: `Figure ${num}. ${text}`, bold: true, color: NAVY, size: 22 })],
    spacing: { before: 200, after: 100 },
  });
}
function bullet(text, level = 0) { return new Paragraph({ text, bullet: { level }, spacing: { after: 100 } }); }
function codeBlock(lines) {
  return new Paragraph({
    children: lines.map((l, i) => new TextRun({ text: l, font: "Consolas", size: 18, break: i === 0 ? 0 : 1 })),
    shading: { type: ShadingType.CLEAR, fill: "F5F5F5" },
    border: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" }, right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
    },
    spacing: { before: 150, after: 250 },
  });
}
function cell(text, opts = {}) {
  return new TableCell({
    width: { size: opts.width || 2000, type: WidthType.DXA },
    shading: opts.header ? { type: ShadingType.CLEAR, fill: NAVY } : (opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined),
    children: [new Paragraph({
      alignment: opts.center === false ? AlignmentType.LEFT : AlignmentType.CENTER,
      children: [new TextRun({ text, bold: !!opts.header || !!opts.bold, color: opts.header ? "FFFFFF" : "000000", size: 20 })],
    })],
  });
}
function table(headers, rows, widths) {
  return new Table({
    width: { size: 9000, type: WidthType.DXA }, columnWidths: widths,
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
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", run: { color: NAVY, size: 32, bold: true }, paragraph: { spacing: { before: 400, after: 200 } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", run: { color: ACCENT, size: 26, bold: true }, paragraph: { spacing: { before: 300, after: 150 } } },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 } } },
    children: [
      // ---------------- TITLE PAGE ----------------
      new Paragraph({ spacing: { before: 1800 }, children: [] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "From Data to Decisions", bold: true, size: 52, color: NAVY })] }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 150, after: 600 },
        children: [new TextRun({ text: "A Comprehensive Data Science Project: Visualization, Statistical Validation, Predictive Modeling, and Strategic Recommendations for Global Retail Profitability", size: 27, color: ACCENT, bold: true })],
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1400 }, children: [new TextRun({ text: "Comprehensive Data Science Project Reporting and Strategic Recommendations", size: 22, color: GREY })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100 }, children: [new TextRun({ text: "Week 5 (Final) Task Submission — Yuva Intern / NSDC", size: 22, color: GREY })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100 }, children: [new TextRun({ text: "Tools used: Python, Pandas, NumPy, SciPy, Scikit-learn, Matplotlib, Seaborn", size: 22, color: GREY })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: "Synthesizes Weeks 2\u20134: Data Visualization \u00b7 Hypothesis Testing \u00b7 Machine Learning", size: 20, color: GREY, italics: true })] }),
      new Paragraph({ children: [new PageBreak()] }),

      // ---------------- EXECUTIVE SUMMARY ----------------
      h1("Executive Summary"),
      body("Over four weeks, this project examined a global retail operation's transaction data (2021\u20132024, n = 9,800 orders) through three progressively rigorous lenses: exploratory visualization, formal statistical hypothesis testing, and predictive machine learning. Each phase built directly on the last, and all three converge on the same central finding: discount-driven margin erosion, concentrated in the Furniture category, is the single largest controllable threat to profitability in this business."),
      body("Visual analysis (Week 2) first revealed that while overall sales are growing at a healthy underlying rate, Furniture generates substantial revenue but almost no profit. Statistical testing (Week 3) confirmed this was not visual noise: category explains a statistically significant, large share of margin variance (ANOVA, p < .001, \u03b7\u00b2 = 0.187), and discount rate alone explains 69.5% of all variance in profit margin (r = -0.834, p < .001), with a sharp loss-rate inflection at the 30% discount threshold (\u03c7\u00b2, p < .001, Cramer's V = 0.652). Machine learning (Week 4) operationalized this insight into a deployable Logistic Regression classifier that predicts loss-making transactions at order time with 91.7% accuracy and 0.970 ROC-AUC, confirming discount rate as the dominant predictive feature."),
      body("The strategic recommendation that follows directly from all three phases is to implement a hard discount ceiling on thin-margin product lines, paired with the order-time risk classifier as an automated approval gate. Modeled against the historical data, this single intervention would have prevented the large majority of the $819,805 in gross profit that heavy discounting eroded over the analysis period, while regional and seasonal findings offer secondary levers for growth. Full methodology, results, and code are documented in the sections that follow."),

      // ---------------- 1. INTRODUCTION ----------------
      h1("1. Introduction"),
      body("This report is the capstone deliverable of a five-week data science internship. Each preceding week built one layer of a single, connected analytical pipeline on a consistent dataset \u2014 a simulated global retail transactions log spanning three product categories (Technology, Furniture, Office Supplies), five regions, and three customer segments:"),
      bullet("Week 2 \u2014 Advanced Data Visualization and Storytelling: exploratory analysis and narrative-driven charts to surface patterns worth investigating."),
      bullet("Week 3 \u2014 Statistical Analysis and Hypothesis Testing: formal significance testing (ANOVA, chi-square, regression) to confirm which visual patterns were statistically real."),
      bullet("Week 4 \u2014 Machine Learning Model Development: a predictive classifier operationalizing the confirmed statistical drivers into an order-time risk score."),
      body("This report's purpose is to synthesize those three phases into a single coherent narrative for a business stakeholder audience, and to translate the combined technical findings into specific, prioritized strategic recommendations \u2014 the natural final step of any applied data science project, where analysis is only valuable once it changes a decision."),

      // ---------------- 2. METHODOLOGY ----------------
      h1("2. Methodology Recap"),
      h2("2.1 Data"),
      body("A single dataset (9,800 transactions, 2021\u20132024) was used across all three phases, ensuring every finding in this report is directly comparable and mutually reinforcing rather than drawn from disconnected analyses. Each transaction records order date, region, category, sub-category, customer segment, quantity, discount rate, sales value, and resulting profit."),
      h2("2.2 Analytical Pipeline"),
      table(
        ["Phase", "Method", "Key Tools"],
        [
          ["Week 2: Visualization", "Time-series, categorical, and relational charting", "Matplotlib, Seaborn"],
          ["Week 3: Hypothesis Testing", "One-way ANOVA, Welch's t-tests, chi-square, linear regression", "SciPy"],
          ["Week 4: Machine Learning", "Binary classification (Logistic Regression, Decision Trees)", "Scikit-learn"],
        ],
        [2800, 4200, 2600]
      ),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      codeBlock([
        "# Representative snippet from each phase of the pipeline",
        "",
        "# Week 3 — statistical validation of a Week 2 visual pattern",
        "f_stat, p_value = stats.f_oneway(tech_margin, furniture_margin, office_margin)",
        "slope, intercept, r, p_value, se = stats.linregress(df.Discount, df.Margin)",
        "",
        "# Week 4 — operationalizing the validated driver into a live prediction",
        "pipeline = Pipeline([('preprocess', preprocessor),",
        "                      ('model', LogisticRegression(max_iter=1000))])",
        "pipeline.fit(X_train, y_train)  # test ROC-AUC = 0.970",
      ]),

      // ---------------- 3. RESULTS: INTEGRATED FINDINGS ----------------
      h1("3. Integrated Results Across All Three Phases"),

      h2("3.1 Growth Is Real, but Uneven (Week 2 \u2192 Week 3)"),
      new Paragraph({ children: [img("outputs/figures/w2_monthly_trend.png", 460, 0.62)], alignment: AlignmentType.CENTER }),
      figureHeading(1, "Monthly sales with fitted growth trend (Week 2 visualization)."),
      body("The visualization phase established that monthly sales grew from roughly $145K to over $300K at peak, but that this growth is dominated by holiday seasonality rather than a smooth trend \u2014 a pattern later useful for capacity planning rather than profitability strategy."),
      new Paragraph({ children: [img("outputs/figures/w2_category_sales_profit.png", 420, 0.63)], alignment: AlignmentType.CENTER }),
      figureHeading(2, "Sales and profit by category (Week 2), showing Furniture's disconnect between revenue and profit."),
      body("This chart first flagged the central problem of the entire project: Furniture generates meaningful revenue but converts almost none of it into profit, unlike Technology and Office Supplies."),

      h2("3.2 The Cause, Statistically Confirmed (Week 3)"),
      new Paragraph({ children: [img("outputs/figures/w3_meanmargin_ci.png", 420, 0.72)], alignment: AlignmentType.CENTER }),
      figureHeading(3, "Mean profit margin by category with 95% confidence intervals (Week 3)."),
      body("A one-way ANOVA confirmed category differences in margin are statistically significant and large (F = 1127.32, p < .001, \u03b7\u00b2 = 0.187); Bonferroni-corrected pairwise t-tests confirmed all three categories differ significantly from one another, not just in aggregate."),
      new Paragraph({ children: [img("outputs/figures/w3_loss_rate_discount.png", 420, 0.72)], alignment: AlignmentType.CENTER }),
      figureHeading(4, "Loss rate by discount tier (Week 3), showing the 30% discount inflection point."),
      body("The chi-square test quantified exactly how discounting drives the category effect: loss rate jumps from 14.08% of transactions at discounts under 30%, to 88.02% at discounts of 30% or more (\u03c7\u00b2 = 4171.05, p < .001, Cramer's V = 0.652). A linear regression further showed discount rate alone explains 69.5% of all variance in profit margin (r = -0.834), giving the business a precise, quantified relationship rather than a directional hunch."),

      h2("3.3 From Explanation to Prediction (Week 4)"),
      new Paragraph({ children: [img("outputs/figures/w4_roc_curve.png", 420, 0.68)], alignment: AlignmentType.CENTER }),
      figureHeading(5, "ROC curve comparison across three candidate models (Week 4)."),
      body("A Logistic Regression classifier, trained on order-time features only, predicts whether a transaction will be loss-making with 91.7% test accuracy and 0.970 ROC-AUC (5-fold CV AUC = 0.969 \u00b1 0.003) \u2014 performant enough to serve as a real-time approval gate rather than only a retrospective report."),
      new Paragraph({ children: [img("outputs/figures/w4_feature_importance.png", 420, 0.78)], alignment: AlignmentType.CENTER }),
      figureHeading(6, "Logistic Regression coefficients (Week 4), confirming discount as the dominant driver."),
      body("Critically, the model's learned coefficients (Figure 6) independently confirm the Week 3 statistical findings without being told about them in advance: discount rate carries by far the largest coefficient, and Furniture-related categories push toward higher loss probability \u2014 three separate analytical methods, across three weeks, converging on the same answer."),

      // ---------------- 4. STRATEGIC RECOMMENDATIONS ----------------
      h1("4. Strategic Recommendations"),
      body("The following recommendations are ordered by priority, each traceable to specific evidence developed across the three analytical phases rather than to any single chart in isolation."),
      h2("4.1 Implement a Hard Discount Ceiling on Thin-Margin Categories"),
      body("Cap discounts on Furniture sub-categories (Furnishings, Bookcases, Tables, Chairs) at 25\u201330%, the empirically confirmed threshold (Section 3.2) beyond which the large majority of transactions become unprofitable. This is the single highest-impact recommendation in this report: it is supported independently by the Week 2 category chart, the Week 3 chi-square and regression tests, and the Week 4 model's own learned coefficients."),
      h2("4.2 Deploy the Loss-Prediction Model as a Live Approval Gate"),
      body("Integrate the Week 4 Logistic Regression model into the order or quoting system so that any transaction the model flags as high-risk (default threshold, tunable toward higher recall if false negatives are judged more costly than manual review time) requires manager approval before the discount is finalized, rather than only appearing in a loss report after the fact."),
      h2("4.3 Prioritize Asia Pacific for Regional Growth Investment"),
      body("Regional analysis in Week 2 showed Asia Pacific sits between the mature North America/Europe markets and the under-penetrated Middle East & Africa and Latin America regions, suggesting the best near-term return on incremental marketing or logistics investment."),
      h2("4.4 Plan Capacity Around Confirmed Seasonality, Not Peak Demand"),
      body("Since Figure 1 shows November\u2013December demand spikes 40\u201390% above surrounding months on top of a real but modest underlying growth trend, staffing and inventory targets should be set from the fitted trend line, not from the most recent holiday peak, to avoid over-provisioning for eleven months to serve one."),
      h2("4.5 Investigate Furniture's Structural Cost Base"),
      body("Because Furniture's margin remains thinner than other categories even before heavy discounting (Section 3.2), a sourcing or pricing review independent of the discounting policy is warranted \u2014 the discount cap addresses the acute symptom, but the category's baseline profitability should also be examined."),

      // ---------------- 5. BUSINESS IMPACT ----------------
      h1("5. Business and Analytical Impact"),
      h2("5.1 Business Impact"),
      body("Applied retrospectively, a 30% discount cap would have reclassified the majority of the 1,726 historically loss-making, high-discount transactions as either not-discounted-that-deeply or not-sold-at-that-price \u2014 directly protecting a meaningful share of the $819,805 in total gross profit generated over the analysis period from being eroded by excessive discounting. Beyond the immediate margin protection, an automated risk gate (Recommendation 4.2) shifts the business from monthly retrospective loss discovery to real-time prevention, which compounds in value the longer it operates."),
      h2("5.2 Analytical / Methodological Impact"),
      body("Beyond the specific business findings, this project demonstrates a reusable analytical pattern: visualization to generate hypotheses, statistics to confirm which are real and quantify them precisely, and machine learning to operationalize the confirmed drivers into a live decision-support tool. This progression \u2014 rather than any single technique in isolation \u2014 is the core transferable skill demonstrated across the internship, and the same three-phase pipeline could be pointed at other business questions (e.g., customer churn, inventory stockouts) using the same dataset infrastructure."),

      // ---------------- 6. LIMITATIONS ----------------
      h1("6. Limitations and Future Improvement Areas"),
      bullet("Synthetic data: the dataset was self-generated to have realistic structure (seasonality, category margin differences, discount effects), rather than sourced from a live business system. Real transactional data would likely contain more noise, unmeasured confounders (competitor pricing, supplier cost shifts), and messier relationships than the clean effects found here."),
      bullet("Correlational evidence: none of the statistical or machine learning results in this project establish causation. It remains possible that deep discounts are applied selectively to already-underperforming inventory rather than causing the loss outright; a controlled discount experiment (A/B testing discount caps in a live environment) would be the appropriate next step to confirm causality before enforcing a hard policy."),
      bullet("Model recall ceiling: the Week 4 classifier catches 76.2% of true loss-making transactions at its default threshold, meaning roughly 1 in 4 currently slip through undetected; threshold tuning, additional features (order timing, customer history), or ensemble methods (Random Forest, Gradient Boosting) are concrete next steps to close this gap, as detailed in the Week 4 report."),
      bullet("Static analysis window: all findings are based on a fixed 2021\u20132024 window. A production deployment should include periodic model retraining and drift monitoring, since discount and margin relationships in a real business could shift with cost inputs or competitive pressure over time."),
      bullet("Single-business simulation: findings reflect one simulated retail operation and should not be assumed to generalize to other retailers or verticals without re-running the same three-phase pipeline on that business's own data."),

      // ---------------- 7. CONCLUSION ----------------
      h1("7. Conclusion"),
      body("This capstone report closes a five-week arc that began with a simple visual observation \u2014 Furniture looked less profitable than other categories \u2014 and ended with a statistically validated, machine-learning-operationalized, and strategically actionable finding: discount rate, not category identity itself, is the primary controllable driver of profit erosion in this business, with a precise, evidence-backed threshold at 30%. The consistency of this result across three independent methodologies (visualization, statistical testing, and predictive modeling) is what gives the strategic recommendations in Section 4 their weight: they are not based on a single chart or a single model, but on convergent evidence built deliberately across an entire analytical pipeline. The complete codebase, data, visualizations, and prior weekly reports supporting every claim in this document are included in the accompanying GitHub repository."),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("outputs/Week5_Comprehensive_Project_Report_Strategic_Recommendations.docx", buf);
  console.log("written");
});
