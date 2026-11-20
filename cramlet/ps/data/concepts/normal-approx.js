(function () {
"use strict";
const { frac, calc, box } = PS;

registerConcept({
  id: "normal-approx",
  oneLiner:
    "When X ~ Binomial(n, p) with n large, X is approximately <b>Normal(np, np(1 − p))</b>. Because X only takes whole numbers, you widen or narrow each end by <b>0.5</b> first: the <b>continuity correction</b>. The whole skill is getting that ± 0.5 in the right direction.",

  related: ["normal-clt", "binomial-hyper"],

  summary: {
    keyPoints: [
      { lec: [13], kind: "key", html: "X ~ Binomial(n, p) ≈ Normal(μ = np, σ² = np(1 − p)). Use σ = <b>√(np(1 − p))</b> in normalcdf." },
      { lec: [13], html: "It works well when np ≥ 5 and n(1 − p) ≥ 5 (some books say 10). Say so in one line on the quiz." },
      { lec: [13], kind: "key", html: "<b>Continuity correction:</b> the bar for the whole number k covers k − 0.5 to k + 0.5. Keep the bars you want, drop the ones you don’t." },
      { lec: [13], html: "<b>Inclusive</b> 350 ≤ X ≤ 380 → (349.5, 380.5). <b>Strict</b> 350 &lt; X &lt; 380 → (350.5, 379.5)." },
      { lec: [13], html: "P(X ≥ k) → from k − 0.5 up. P(X &gt; k) → from k + 0.5 up. P(X ≤ k) → up to k + 0.5. P(X &lt; k) → up to k − 0.5. P(X = k) → k − 0.5 to k + 0.5." },
      { lec: [13], kind: "warn", html: "Write the corrected bounds in the calculator function itself: " + calc("normalcdf(349.5, 380.5, 370, √(1000·0.37·0.63))") + ". That’s where the points are." },
    ],
  },

  details: [
    {
      id: "why",
      title: "Why and when it works",
      lec: [13],
      html: `
        <p>A binomial X is a sum of n independent 0/1 trials, so by the CLT it’s approximately normal for large n, with mean np and variance np(1 − p).</p>
        <p>Before using it, check np ≥ 5 and n(1 − p) ≥ 5. With n = 225, p = 0.2: np = 45 and n(1 − p) = 180, so it’s fine.</p>
        <p class="callout tip">On a calculator you could get the exact binomial answer with binomcdf. Quizzes ask for the normal approximation anyway, to test the continuity correction. Use the method the question names.</p>`,
    },
    {
      id: "correction",
      title: "The continuity correction table",
      lec: [13],
      html: `
        <p>Picture each whole number k as a bar from k − 0.5 to k + 0.5. Decide which bars the event includes, then take the outer edges.</p>
        <table class="ps-table">
          <tr><th>Words</th><th>Event</th><th>Normal area</th></tr>
          <tr><td>exactly 72</td><td>X = 72</td><td>71.5 to 72.5</td></tr>
          <tr><td>at most 80</td><td>X ≤ 80</td><td>−∞ to 80.5</td></tr>
          <tr><td>fewer than 80</td><td>X &lt; 80 (so ≤ 79)</td><td>−∞ to 79.5</td></tr>
          <tr><td>at least 50</td><td>X ≥ 50</td><td>49.5 to ∞</td></tr>
          <tr><td>more than 50</td><td>X &gt; 50 (so ≥ 51)</td><td>50.5 to ∞</td></tr>
          <tr><td>between 170 and 190, inclusive</td><td>170 ≤ X ≤ 190</td><td>169.5 to 190.5</td></tr>
          <tr><td>strictly between 190 and 215</td><td>190 &lt; X &lt; 215</td><td>190.5 to 214.5</td></tr>
        </table>
        <p class="callout warn">“Between” with no word about endpoints: read it as written in the problem’s math (≤ or &lt;). If the problem writes P(350 &lt; number &lt; 380), it’s strict.</p>`,
    },
    {
      id: "worked",
      title: "Worked example, written up for full credit",
      lec: [13],
      html: `
        <p>About 20% of students at a school use the library on a given day. In a random sample of 225 students, estimate the probability that <b>at least 50</b> use it today.</p>
        <ul class="writeup">
          <li><span>Let X = the number of the 225 students who use the library. X ~ Binomial(225, 0.2).</span></li>
          <li><span>np = 45 and n(1 − p) = 180 are both ≥ 5, so X ≈ Normal(np, np(1 − p)) = Normal(45, 36), σ = √36 = 6.</span></li>
          <li><span>At least 50 → X ≥ 50 → continuity correction: start at 49.5.</span></li>
          <li><span>P(X ≥ 50) ≈ ${calc("normalcdf(49.5, E99, 45, 6)")} ≈ ${box("0.2266")}</span></li>
        </ul>
        <p>(The exact binomial answer is 0.2244, so the approximation is close.)</p>`,
    },
  ],

  flashcards: [
    { front: "Normal approximation to Binomial(n, p)", back: "Normal(np, np(1 − p)); σ = √(np(1 − p))." },
    { front: "When is it OK to use?", back: "np ≥ 5 and n(1 − p) ≥ 5." },
    { front: "P(X ≥ 50) with continuity correction", back: "normalcdf(49.5, E99, μ, σ)" },
    { front: "P(X > 50) with continuity correction", back: "normalcdf(50.5, E99, μ, σ)" },
    { front: "P(X = 72) with continuity correction", back: "normalcdf(71.5, 72.5, μ, σ)" },
    { front: "P(170 ≤ X ≤ 190)", back: "normalcdf(169.5, 190.5, μ, σ)" },
    { front: "P(190 < X < 215)", back: "normalcdf(190.5, 214.5, μ, σ)" },
  ],

  quiz: [
    { type: "mc", lec: [13], q: "X ~ Binomial(400, 0.25). Which normal does it approximate?",
      options: ["Normal(100, 75), σ ≈ 8.66", "Normal(100, 100), σ = 10", "Normal(0.25, 75)", "Normal(100, 8.66), σ = 8.66²"], answer: 0,
      explain: "np = 100 and np(1 − p) = 400·0.25·0.75 = 75, so σ = √75 ≈ 8.66." },
    { type: "mc", lec: [13], q: "With continuity correction, P(X < 30) becomes…",
      options: ["P(Y < 29.5)", "P(Y < 30.5)", "P(Y < 30)", "P(Y > 29.5)"], answer: 0,
      explain: "X < 30 means X ≤ 29, whose bar ends at 29.5." },
    { type: "mc", lec: [13], q: "With continuity correction, P(25 ≤ X ≤ 35) becomes…",
      options: ["normalcdf(24.5, 35.5, μ, σ)", "normalcdf(25.5, 34.5, μ, σ)", "normalcdf(25, 35, μ, σ)", "normalcdf(24.5, 34.5, μ, σ)"], answer: 0,
      explain: "Inclusive on both ends: keep the bars for 25 and 35, so widen to 24.5 and 35.5." },
    { type: "tf", lec: [13], q: "True or false: X ~ Binomial(30, 0.05) is a good candidate for the normal approximation.",
      answer: false, explain: "np = 1.5 < 5. The distribution is too lopsided for a bell curve." },
    { type: "mc", lec: [13], q: "With continuity correction, P(X = 40) becomes…",
      options: ["normalcdf(39.5, 40.5, μ, σ)", "0, because a continuous variable can’t equal 40", "normalcdf(40, 41, μ, σ)", "normalpdf(40, μ, σ)"], answer: 0,
      explain: "The bar for 40 runs from 39.5 to 40.5. Without the correction you’d get 0, which is why the correction exists." },
    { type: "tf", lec: [13], q: "True or false: “more than 50” and “at least 50” use the same corrected bound.",
      answer: false, explain: "More than 50 starts at 51, so 50.5. At least 50 includes 50, so 49.5." },
  ],
});
})();
