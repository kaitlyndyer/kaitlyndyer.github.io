// Show-your-work problems for the practice quizzes ("work" type, ps/questions.js). Each is solved on paper with a
// calculator, then checked against a model solution and a checklist written the way a strict grader awards points:
// define the variable, name the distribution, the formula with numbers, the calculator function, the boxed answer.
// All problems are original (none copied from homework or old exams). Every number was checked by computer.
// printable: practice.html prints these as paper quizzes, by id.
(function () {
"use strict";
const { frac, calc, box } = PS;
const w = (concept, list) => registerExam(concept, list.map(q => ({ type: "work", ...q })));

// ============================================================================ Normal & CLT
w("normal-clt", [
  {
    id: "clt-battery", lec: [13], sec: "one-vs-average", pts: 8,
    q: `<p>Battery lifetimes are normally distributed with mean 500 hours and standard deviation 40 hours. A sample of 25 batteries is tested.</p>
        <p>(a) What is the probability that the sample mean lifetime exceeds 510 hours?<br>(b) What is the probability that one randomly chosen battery lasts more than 510 hours?<br>(c) What is the probability that exactly 5 of the 25 batteries last more than 510 hours?</p>`,
    model: `<p>(a) Let X̄ = the mean lifetime of the 25. X̄ ~ Normal(500, 40²/25), σ<sub>X̄</sub> = 40/√25 = 8.<br>
        P(X̄ &gt; 510) = 1 − P(X̄ ≤ 510) = ${calc("normalcdf(510, E99, 500, 8)")} ≈ ${box("0.1056")}</p>
        <p>(b) Let X = the lifetime of one battery, X ~ Normal(500, 40²).<br>P(X &gt; 510) = ${calc("normalcdf(510, E99, 500, 40)")} ≈ ${box("0.4013")}</p>
        <p>(c) Let Y = the number of the 25 lasting more than 510 h. Y ~ Binomial(25, 0.4013).<br>
        P(Y = 5) = (25 choose 5)(0.4013)<sup>5</sup>(0.5987)<sup>20</sup> = ${calc("binompdf(25, 0.4013, 5)")} ≈ ${box("0.0194")}</p>`,
    checklist: [
      "(a) Stated X̄ ~ Normal(500, 40²/25) with σ/√n = 8.",
      "(a) normalcdf(510, E99, 500, 8) written, answer ≈ 0.1056.",
      "(b) Used σ = 40 (not 8) for one battery.",
      "(b) Answer ≈ 0.4013 with the calculator function.",
      "(c) Defined Y and named Binomial(25, p) with p from (b).",
      "(c) Formula with numbers or binompdf(25, 0.4013, 5).",
      "(c) Answer ≈ 0.0194.",
      "Every answer boxed.",
    ],
    explain: "The three classic questions: an average (σ/√n), one value (σ), and how many values (binomial with p from the normal).",
  },
  {
    id: "clt-tacos", lec: [13], sec: "totals", pts: 6,
    q: `<p>The number of tacos a customer orders at a food truck has mean 2.4 and standard deviation 1.1 (the distribution is not normal). On one evening 64 customers order independently.</p>
        <p>(a) Find the approximate distribution of the total number of tacos ordered, and justify it.<br>(b) Approximate the probability that more than 160 tacos are ordered.</p>`,
    model: `<p>(a) Let S = X<sub>1</sub> + … + X<sub>64</sub>. E(S) = 64(2.4) = 153.6, Var(S) = 64(1.1)² = 77.44, SD(S) = 1.1√64 = 8.8. By the CLT (n = 64 is large), ${box("S ≈ Normal(153.6, 8.8²)")}.</p>
        <p>(b) P(S &gt; 160) ≈ ${calc("normalcdf(160, E99, 153.6, 8.8)")} ≈ ${box("0.2335")}</p>`,
    checklist: [
      "Mean of the total: nμ = 153.6.",
      "SD of the total: σ√n = 8.8 (not 1.1/8).",
      "Cited the CLT as the reason the total is approximately normal.",
      "(b) normalcdf(160, E99, 153.6, 8.8) written.",
      "(b) Answer ≈ 0.2335, boxed.",
      "Defined S in words.",
    ],
    explain: "A total spreads out like σ√n; an average shrinks like σ/√n.",
  },
  {
    id: "clt-cutoff", lec: [13], sec: "cutoffs", pts: 6,
    q: `<p>Scores on a placement exam are normally distributed with mean 72 and standard deviation 9.</p>
        <p>(a) What score do you need to be in the top 15%?<br>(b) Between which two scores do the middle 50% of students fall?<br>(c) For a class of 36 students, what class average would be in the top 15% of class averages?</p>`,
    model: `<p>(a) Area to the left 0.85: ${calc("invNorm(0.85, 72, 9)")} ≈ ${box("81.33")}</p>
        <p>(b) ${calc("invNorm(0.25, 72, 9)")} ≈ 65.93 and ${calc("invNorm(0.75, 72, 9)")} ≈ 78.07: ${box("between 65.93 and 78.07")}</p>
        <p>(c) X̄ ~ Normal(72, 9²/36), σ<sub>X̄</sub> = 1.5. ${calc("invNorm(0.85, 72, 1.5)")} ≈ ${box("73.55")}</p>`,
    checklist: [
      "(a) invNorm with area 0.85 (the left area), answer ≈ 81.33.",
      "(b) Two invNorms at 0.25 and 0.75.",
      "(b) 65.93 and 78.07.",
      "(c) Used σ/√n = 1.5 for an average.",
      "(c) Answer ≈ 73.55.",
      "Every answer boxed.",
    ],
    explain: "invNorm takes the area to the LEFT, and an average still uses σ/√n inside invNorm.",
  },
]);

// ============================================================================ Normal approximation
w("normal-approx", [
  {
    id: "na-dice", lec: [13], sec: "correction", pts: 6,
    q: `<p>A fair die is rolled 1200 times. Use the normal approximation with continuity correction to estimate the probability that the number of sixes is strictly between 190 and 215, i.e. P(190 &lt; X &lt; 215).</p>`,
    model: `<p>Let X = the number of sixes. X ~ Binomial(1200, 1/6). np = 200 and n(1 − p) = 1000, both ≥ 5, so X ≈ Normal(200, 1200·(1/6)·(5/6)) = Normal(200, 166.67), σ = √166.67 ≈ 12.91.</p>
        <p>Strict on both ends: 190 &lt; X &lt; 215 means 191 ≤ X ≤ 214 → (190.5, 214.5).</p>
        <p>P(190 &lt; X &lt; 215) ≈ ${calc("normalcdf(190.5, 214.5, 200, 12.91)")} ≈ ${box("0.6384")}</p>`,
    checklist: [
      "Defined X and named Binomial(1200, 1/6).",
      "μ = 200 and σ = √(np(1 − p)) ≈ 12.91.",
      "Checked np ≥ 5 and n(1 − p) ≥ 5 (or similar).",
      "Corrected bounds 190.5 and 214.5 (strict inequality).",
      "normalcdf(190.5, 214.5, 200, 12.91) written.",
      "Answer ≈ 0.638, boxed.",
    ],
    explain: "Strict inequalities shrink the interval by 0.5 at each end.",
  },
  {
    id: "na-clicks", lec: [13], sec: "correction", pts: 6,
    q: `<p>8% of a website’s visitors click on an ad. Out of 900 visitors, use the normal approximation with continuity correction to estimate</p>
        <p>(a) P(at most 80 visitors click). &nbsp; (b) P(exactly 72 visitors click).</p>`,
    model: `<p>Let X = the number of the 900 who click. X ~ Binomial(900, 0.08) ≈ Normal(72, 900·0.08·0.92) = Normal(72, 66.24), σ ≈ 8.139.</p>
        <p>(a) X ≤ 80 → up to 80.5: ${calc("normalcdf(-E99, 80.5, 72, 8.139)")} ≈ ${box("0.8518")}</p>
        <p>(b) X = 72 → 71.5 to 72.5: ${calc("normalcdf(71.5, 72.5, 72, 8.139)")} ≈ ${box("0.0490")}</p>`,
    checklist: [
      "Defined X, named Binomial(900, 0.08).",
      "μ = 72, σ ≈ 8.139.",
      "(a) Upper bound 80.5.",
      "(a) Answer ≈ 0.852 with normalcdf written.",
      "(b) Bounds 71.5 and 72.5.",
      "(b) Answer ≈ 0.049, boxed.",
    ],
    explain: "“Exactly” becomes a 1-wide interval around the number; without the correction you’d get 0.",
  },
]);

// ============================================================================ MLE
w("mle", [
  {
    id: "mle-gamma", lec: [14], sec: "recipe", pts: 6,
    q: `<p>A random sample {4.2, 2.7, 6.0, 3.1, 5.0} is taken from the distribution</p>
        <p style="text-align:center">f<sub>Y</sub>(y; θ) = ${frac("y² e<sup>−y/θ</sup>", "2θ³")}, &nbsp; y &gt; 0.</p>
        <p>Find the maximum likelihood estimate for θ.</p>`,
    model: `<p>L(θ) = ∏ ${frac("y<sub>i</sub>² e<sup>−y<sub>i</sub>/θ</sup>", "2θ³")} = ${frac("(∏ y<sub>i</sub>²) e<sup>−Σy<sub>i</sub>/θ</sup>", "2<sup>n</sup> θ<sup>3n</sup>")}</p>
        <p>ln L(θ) = 2Σ ln y<sub>i</sub> − ${frac("1", "θ")}Σy<sub>i</sub> − n ln 2 − 3n ln θ</p>
        <p>${frac("d", "dθ")} ln L(θ) = ${frac("Σy<sub>i</sub>", "θ²")} − ${frac("3n", "θ")} = 0 ⇒ Σy<sub>i</sub> = 3nθ ⇒ θ̂ = ${frac("ΣY<sub>i</sub>", "3n")} = ${frac("Ȳ", "3")}</p>
        <p>Σy<sub>i</sub> = 21.0, n = 5, so θ<sub>e</sub> = 21/15 = ${box("1.4")}</p>`,
    checklist: [
      "Wrote L(θ) as the product and simplified it.",
      "Correct ln L(θ) (the −3n ln θ and −Σy/θ terms).",
      "Correct derivative: Σy/θ² − 3n/θ.",
      "Set it = 0 and solved: θ̂ = ΣYᵢ/(3n) = Ȳ/3.",
      "Plugged in: θₑ = 21/15 = 1.4, boxed.",
      "Distinguished the estimator θ̂ from the estimate θₑ.",
    ],
    explain: "Same five steps every time; the only thinking is the algebra of ln and the derivative of −Σy/θ.",
  },
  {
    id: "mle-gamma2", lec: [14], sec: "recipe", pts: 6,
    q: `<p>A random sample {1.5, 0.5, 2.0, 1.0} is taken from f<sub>Y</sub>(y; θ) = θ² y e<sup>−θy</sup>, y &gt; 0. Find the maximum likelihood estimate for θ.</p>`,
    model: `<p>L(θ) = ∏ θ² y<sub>i</sub> e<sup>−θy<sub>i</sub></sup> = θ<sup>2n</sup> (∏ y<sub>i</sub>) e<sup>−θΣy<sub>i</sub></sup></p>
        <p>ln L(θ) = 2n ln θ + Σ ln y<sub>i</sub> − θΣy<sub>i</sub></p>
        <p>${frac("d", "dθ")} ln L(θ) = ${frac("2n", "θ")} − Σy<sub>i</sub> = 0 ⇒ θ̂ = ${frac("2n", "ΣY<sub>i</sub>")} = ${frac("2", "Ȳ")}</p>
        <p>Σy<sub>i</sub> = 5, n = 4: θ<sub>e</sub> = 8/5 = ${box("1.6")}</p>`,
    checklist: [
      "L(θ) = θ²ⁿ (∏ yᵢ) e^(−θΣyᵢ).",
      "ln L(θ) = 2n ln θ + Σ ln yᵢ − θΣyᵢ.",
      "Derivative 2n/θ − Σyᵢ.",
      "θ̂ = 2n/ΣYᵢ.",
      "θₑ = 1.6, boxed.",
      "Showed the data sum Σyᵢ = 5.",
    ],
    explain: "θ appears as θ²ⁿ and in the exponent; ln separates them.",
  },
  {
    id: "mle-geometric", lec: [14], sec: "counts", pts: 6,
    q: `<p>A student keeps rolling a die until a six appears, and records the number of rolls K. Model: p<sub>K</sub>(k; p) = (1 − p)<sup>k−1</sup> p, k = 1, 2, 3, … Over 50 repetitions she needed 1 roll 22 times, 2 rolls 13 times, 3 rolls 9 times, and 4 rolls 6 times. Find the maximum likelihood estimate of p.</p>`,
    model: `<p>L(p) = ∏ (1 − p)<sup>k<sub>i</sub>−1</sup> p = p<sup>n</sup>(1 − p)<sup>Σk<sub>i</sub> − n</sup></p>
        <p>ln L(p) = n ln p + (Σk<sub>i</sub> − n) ln(1 − p)</p>
        <p>${frac("d", "dp")} ln L(p) = ${frac("n", "p")} − ${frac("Σk<sub>i</sub> − n", "1 − p")} = 0 ⇒ n(1 − p) = p(Σk<sub>i</sub> − n) ⇒ p̂ = ${frac("n", "ΣK<sub>i</sub>")}</p>
        <p>n = 50, Σk<sub>i</sub> = 22(1) + 13(2) + 9(3) + 6(4) = 99. p<sub>e</sub> = 50/99 ≈ ${box("0.5051")}</p>`,
    checklist: [
      "Wrote L(p) as a product and simplified to pⁿ(1 − p)^(Σk − n).",
      "Correct ln L(p).",
      "Correct derivative, including the minus sign from ln(1 − p).",
      "Solved p̂ = n/ΣKᵢ.",
      "Computed Σkᵢ = 99 from the counts.",
      "pₑ ≈ 0.505, boxed.",
    ],
    explain: "With counts, each value’s probability is raised to the number of times it appeared. Here that gives Σkᵢ = 99.",
  },
  {
    id: "mle-counts", lec: [14], sec: "counts", pts: 6,
    q: `<p>A discrete random variable takes the values {0, 1, 2} with probabilities θ/3, 2θ/3, and 1 − θ. In 200 independent observations, the values 0, 1, 2 were seen 24, 51, and 125 times. Find the maximum likelihood estimate of θ.</p>`,
    model: `<p>L(θ) = (θ/3)<sup>24</sup>(2θ/3)<sup>51</sup>(1 − θ)<sup>125</sup> = ${frac("2<sup>51</sup>", "3<sup>75</sup>")} θ<sup>75</sup>(1 − θ)<sup>125</sup></p>
        <p>ln L(θ) = C + 75 ln θ + 125 ln(1 − θ), where C = 51 ln 2 − 75 ln 3</p>
        <p>${frac("d", "dθ")} ln L(θ) = ${frac("75", "θ")} − ${frac("125", "1 − θ")} = 0 ⇒ 75(1 − θ) = 125θ ⇒ 75 = 200θ</p>
        <p>θ<sub>e</sub> = 75/200 = ${box("0.375")}</p>`,
    checklist: [
      "L(θ) with each probability raised to its count.",
      "Collected the θ powers: θ⁷⁵(1 − θ)¹²⁵.",
      "Correct ln L(θ) (constants may be lumped).",
      "Derivative 75/θ − 125/(1 − θ).",
      "Solved 75 = 200θ.",
      "θₑ = 0.375, boxed.",
    ],
    explain: "Constants like (1/3)²⁴ disappear when you differentiate; only the θ parts matter.",
  },
]);

// ============================================================================ Confidence intervals
w("confidence-intervals", [
  {
    id: "ci-mean", lec: [15], sec: "mean", pts: 6,
    q: `<p>The amount of caffeine in a brand of energy drink has standard deviation σ = 3.5 mg. A random sample of 50 cans averages 18.4 mg.</p>
        <p>(a) Construct a 99% confidence interval for the true mean μ.<br>(b) What is the width of the interval?<br>(c) How many cans would be needed for a margin of error of 0.5 mg at 99% confidence?</p>`,
    model: `<p>(a) 99% → z = 2.576. Margin = 2.576 · 3.5/√50 ≈ 1.275. 18.4 ± 1.275 = ${box("(17.125, 19.675)")} mg. ${calc("ZInterval(σ=3.5, x̄=18.4, n=50, C-Level=0.99)")}</p>
        <p>(b) Width = 2 × 1.275 ≈ ${box("2.55 mg")}</p>
        <p>(c) n = (zσ/E)² = (2.576 · 3.5/0.5)² ≈ 325.1 → ${box("326 cans")} (round up)</p>`,
    checklist: [
      "z = 2.576 for 99%.",
      "Margin z·σ/√n ≈ 1.275.",
      "Interval ≈ (17.13, 19.67), boxed.",
      "Width = 2 × margin ≈ 2.55.",
      "n = (zσ/E)² ≈ 325.1.",
      "Rounded UP to 326.",
    ],
    explain: "Width is twice the margin, and sample sizes always round up.",
  },
  {
    id: "ci-prop", lec: [15], sec: "proportion", pts: 6,
    q: `<p>In a survey of 400 students, 230 said they prefer online homework.</p>
        <p>(a) Find a 90% confidence interval for the proportion p of all students who prefer online homework.<br>(b) Does the interval support the claim that a majority prefer it? Explain.<br>(c) What sample size guarantees a margin of error of at most 0.03 at 90% confidence?</p>`,
    model: `<p>(a) p̂ = 230/400 = 0.575, z = 1.645. Margin = 1.645·√(0.575·0.425/400) ≈ 0.0407. ${box("(0.534, 0.616)")}. ${calc("1-PropZInt(x=230, n=400, C-Level=0.90)")}</p>
        <p>(b) ${box("Yes")}: the whole interval is above 0.5.</p>
        <p>(c) n = z²/(4d²) = 1.645²/(4·0.03²) ≈ 751.5 → ${box("752")}</p>`,
    checklist: [
      "p̂ = 0.575 and z = 1.645.",
      "Margin ≈ 0.0407 with the formula written.",
      "Interval ≈ (0.534, 0.616), boxed.",
      "(b) Yes, because the entire interval is above 0.5.",
      "(c) n = z²/(4d²) ≈ 751.5.",
      "(c) Rounded up to 752.",
    ],
    explain: "A claim is supported when the whole interval sits on one side of the claimed value.",
  },
]);
})();
