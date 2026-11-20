(function () {
"use strict";
const { frac, calc, box } = PS;

registerConcept({
  id: "confidence-intervals",
  oneLiner:
    "A <b>confidence interval</b> is an estimate ± a <b>margin of error</b>. For a mean: <b>ȳ ± z·σ/√n</b>. For a proportion: <b>k/n ± z·√(p̂(1 − p̂)/n)</b>. The z comes from the confidence level (1.645, 1.96, 2.576), and “95% confident” describes the <b>method</b>, not this one interval.",

  related: ["normal-clt", "mle"],

  summary: {
    keyPoints: [
      { lec: [15], kind: "key", html: "<b>Mean, σ known:</b> ȳ ± z<sub>α/2</sub> · σ/√n. Calculator: " + calc("ZInterval") + " (Stats mode: σ, x̄, n, C-Level)." },
      { lec: [15], kind: "key", html: "<b>Proportion:</b> p̂ ± z<sub>α/2</sub> · √(p̂(1 − p̂)/n), with p̂ = k/n. Calculator: " + calc("1-PropZInt") + " (x = k, n, C-Level)." },
      { lec: [15], html: "<b>z-values:</b> 90% → 1.645, 95% → 1.96, 99% → 2.576. (They’re invNorm(0.95), invNorm(0.975), invNorm(0.995).)" },
      { lec: [15], html: "<b>Margin of error</b> = the ± part. The interval’s <b>width</b> is twice the margin. Higher confidence → wider. Bigger n → narrower (by √n)." },
      { lec: [15], kind: "key", html: "<b>Sample size.</b> Mean: n = (zσ/E)². Proportion, worst case p = ½: n = z²/(4d²). <b>Always round up.</b>" },
      { lec: [15], kind: "warn", html: "<b>Meaning:</b> if you repeated the sampling many times, about 95% of the intervals built this way would contain the true μ. It’s not “a 95% chance μ is in this interval”: μ is fixed, the interval is what varies." },
    ],
  },

  details: [
    {
      id: "mean",
      title: "Interval for a mean (σ known)",
      lec: [15],
      html: `
        <p>By the CLT, ȳ is about Normal(μ, σ²/n). So ȳ lands within z·σ/√n of μ with probability 0.95 when z = 1.96. Turn that around: μ is within z·σ/√n of ȳ.</p>
        <p style="text-align:center">( ȳ − z<sub>α/2</sub>·${frac("σ", "√n")} , &nbsp; ȳ + z<sub>α/2</sub>·${frac("σ", "√n")} )</p>
        <p><b>Worked example.</b> A machine fills bags with σ = 12 g. A sample of 36 bags averages 497 g. Find a 95% confidence interval for μ.</p>
        <ul class="writeup">
          <li><span>n = 36, ȳ = 497, σ = 12, 95% → z = 1.96.</span></li>
          <li><span>Margin: 1.96 · 12/√36 = 1.96 · 2 = 3.92.</span></li>
          <li><span>497 ± 3.92 = ${box("(493.08, 500.92)")} grams. Calculator: ${calc("ZInterval(σ=12, x̄=497, n=36, C-Level=0.95)")}.</span></li>
        </ul>
        <p class="callout tip">If the claim was “the bags average 500 g,” 500 is inside the interval, so this sample doesn’t contradict it.</p>`,
    },
    {
      id: "proportion",
      title: "Interval for a proportion",
      lec: [15],
      html: `
        <p>With k successes in n trials, p̂ = k/n and</p>
        <p style="text-align:center">p̂ ± z<sub>α/2</sub>·√${frac("p̂(1 − p̂)", "n")}</p>
        <p>Example: 230 of 400 surveyed students prefer online homework. 90% CI: p̂ = 0.575, margin = 1.645·√(0.575·0.425/400) ≈ 0.0407, interval ≈ (0.534, 0.616). ${calc("1-PropZInt(x=230, n=400, C-Level=0.90)")}</p>
        <p>The whole interval is above 0.5, so the data support “a majority prefer it” at 90% confidence.</p>`,
    },
    {
      id: "sample-size",
      title: "How big a sample do you need?",
      lec: [15],
      html: `
        <p><b>Mean:</b> solve z·σ/√n = E for n: n = (zσ/E)². <b>Proportion:</b> p̂(1 − p̂) is largest at ½, so the worst-case margin is z/(2√n) and n = z²/(4d²).</p>
        <p>Example: margin 0.02 at 95% → n = 1.96²/(4·0.02²) = 3.8416/0.0016 = 2401.</p>
        <p class="callout warn">Always round <b>up</b>: n = 325.1 means 326. Rounding down gives a margin a bit too big.</p>`,
    },
    {
      id: "meaning",
      title: "What “95% confident” means",
      lec: [15],
      html: `
        <p>μ is a fixed number; the interval is random (it depends on the sample). Before sampling, the procedure has a 95% chance of producing an interval that covers μ. After you compute one interval, it either contains μ or it doesn’t.</p>
        <p>A good sentence for the quiz: “We are 95% confident that μ is between 493.08 and 500.92 g: 95% of intervals built this way contain the true mean.”</p>`,
    },
  ],

  flashcards: [
    { front: "CI for μ (σ known)", back: "ȳ ± z·σ/√n. Calculator: ZInterval." },
    { front: "CI for a proportion", back: "p̂ ± z·√(p̂(1 − p̂)/n). Calculator: 1-PropZInt." },
    { front: "z for 90%, 95%, 99%", back: "1.645, 1.96, 2.576" },
    { front: "Sample size for a mean", back: "n = (zσ/E)², rounded up." },
    { front: "Sample size for a proportion (worst case)", back: "n = z²/(4d²), rounded up." },
    { front: "Width vs margin of error", back: "Width = 2 × margin." },
    { front: "Effect of 4× the sample size", back: "The margin is cut in half (it shrinks like 1/√n)." },
  ],

  quiz: [
    { type: "tf", lec: [15], q: "True or false: a 95% CI of (12.1, 14.3) means there’s a 95% probability that μ is between 12.1 and 14.3.",
      answer: false, explain: "μ is fixed. The 95% describes the method: 95% of intervals built this way contain μ." },
    { type: "mc", lec: [15], q: "Which change makes a confidence interval narrower?",
      options: ["A larger sample size", "A higher confidence level", "A larger σ", "Rounding z up"], answer: 0,
      explain: "The margin z·σ/√n shrinks as n grows. Higher confidence and larger σ both widen it." },
    { type: "mc", lec: [15], q: "n = 64, ȳ = 50, σ = 8. The 95% margin of error is…",
      options: ["1.96", "3.92", "15.68", "0.245"], answer: 0,
      explain: "1.96 · 8/√64 = 1.96 · 1 = 1.96." },
    { type: "mc", lec: [15], q: "What z goes with a 99% confidence interval?",
      options: ["2.576", "1.96", "2.33", "1.645"], answer: 0,
      explain: "99% leaves 0.5% in each tail: invNorm(0.995) ≈ 2.576. (2.33 is invNorm(0.99), a one-tail cutoff.)" },
    { type: "tf", lec: [15], q: "True or false: to cut the margin of error in half, double the sample size.",
      answer: false, explain: "The margin shrinks like 1/√n, so you need 4 times the sample size." },
    { type: "mc", lec: [15], q: "You need a poll margin of 0.03 at 95% (worst case). n = 1.96²/(4·0.03²) = 1067.1. Report…",
      options: ["1068", "1067", "1067.1", "1000"], answer: 0,
      explain: "Always round sample sizes up, or the margin ends up slightly larger than 0.03." },
  ],
});
})();
