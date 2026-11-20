(function () {
"use strict";
const { frac, calc, box } = PS;

registerConcept({
  id: "normal-clt",
  oneLiner:
    "A normal variable is a bell curve set by its mean μ and standard deviation σ. The <b>Central Limit Theorem</b> says an <b>average</b> of n draws is (about) normal with the same mean but a <b>smaller spread, σ/√n</b>. The skill on quizzes: decide whether the question is about <b>one value</b>, <b>an average</b>, a <b>total</b>, or <b>how many of them</b> pass a cutoff.",

  related: ["normal-approx", "confidence-intervals"],

  summary: {
    keyPoints: [
      { lec: [13], kind: "key", html: "<b>Z-score:</b> Z = (X − μ)/σ turns any normal X into the standard normal Z ~ Normal(0, 1). On the calculator you can skip Z and use " + calc("normalcdf(lower, upper, μ, σ)") + "." },
      { lec: [13], kind: "key", html: "<b>One value vs an average.</b> One X<sub>i</sub> ~ Normal(μ, σ²) uses <b>σ</b>. The average X̄ of n values ~ Normal(μ, σ²/n) uses <b>σ/√n</b>." },
      { lec: [13], html: "<b>CLT:</b> for large n (rule of thumb n ≥ 30) X̄ is approximately normal <b>even if the X<sub>i</sub> aren’t</b>. If the X<sub>i</sub> are already normal, X̄ is exactly normal for any n." },
      { lec: [13], html: "<b>A total</b> S = X<sub>1</sub> + … + X<sub>n</sub> ≈ Normal(nμ, nσ²): mean nμ, standard deviation <b>σ√n</b>." },
      { lec: [13], kind: "key", html: "<b>“Exactly k of the n values exceed c”</b> is a two-step problem: first p = P(one X<sub>i</sub> > c) from the normal, then Y ~ Binomial(n, p) and " + calc("binompdf(n, p, k)") + "." },
      { lec: [13], html: "<b>Cutoffs</b> (top 10%, bottom 5%) go the other way: " + calc("invNorm(area to the LEFT, μ, σ)") + ". “Top 10%” means area to the left 0.90." },
      { lec: [13], kind: "warn", html: "Write the calculator function with every argument, and use −E99 or E99 for an open end. A bare number earns nothing." },
    ],
  },

  details: [
    {
      id: "normal-curve",
      title: "The normal curve and z-scores",
      lec: [13],
      html: `
        <p>X ~ Normal(μ, σ²) has the bell-shaped pdf f(x) = ${frac("1", "σ√(2π)")} e<sup>−(x−μ)²/(2σ²)</sup>. You never integrate it by hand. Probabilities come from the calculator or a Z-table.</p>
        <p><b>Standardize:</b> Z = ${frac("X − μ", "σ")} ~ Normal(0, 1). A z-score counts how many standard deviations X is from its mean.</p>
        <table class="ps-table"><tr><th>Within</th><th>Probability</th></tr><tr><td>μ ± 1σ</td><td>≈ 0.68</td></tr><tr><td>μ ± 2σ</td><td>≈ 0.95</td></tr><tr><td>μ ± 3σ</td><td>≈ 0.997</td></tr></table>
        <p><b>Calculator:</b> ${calc("normalcdf(lower, upper, μ, σ)")} gives an area; ${calc("invNorm(area to the left, μ, σ)")} gives a cutoff.</p>
        <p class="callout warn">Your calculator wants <b>σ</b>, the standard deviation, not the variance σ². “Normal(120, 15²)” means σ = 15.</p>`,
    },
    {
      id: "one-vs-average",
      title: "One value vs an average (the CLT)",
      lec: [13],
      html: `
        <p>Take n independent values X<sub>1</sub>, …, X<sub>n</sub> from a population with mean μ and standard deviation σ. Their average X̄ has</p>
        <p style="text-align:center">E(X̄) = μ &nbsp; and &nbsp; SD(X̄) = σ<sub>X̄</sub> = ${frac("σ", "√n")}.</p>
        <p>Averages are less spread out than single values, because highs and lows cancel. The CLT adds that X̄ is approximately <b>normal</b> for large n, whatever the shape of the population.</p>
        <p><b>Worked example.</b> Cups from a coffee machine hold X ~ Normal(12.2, 0.4²) ounces.</p>
        <ul class="writeup">
          <li><span><b>One cup under 12 oz.</b> Let X = the amount in one cup, X ~ Normal(12.2, 0.4²).<br>P(X &lt; 12) = ${calc("normalcdf(-E99, 12, 12.2, 0.4)")} ≈ ${box("0.3085")}</span></li>
          <li><span><b>The average of 16 cups under 12 oz.</b> By the CLT, X̄ ~ Normal(12.2, 0.4²/16), so σ<sub>X̄</sub> = 0.4/√16 = 0.1.<br>P(X̄ &lt; 12) = ${calc("normalcdf(-E99, 12, 12.2, 0.4/√16)")} ≈ ${box("0.0228")}</span></li>
          <li><span><b>Exactly 3 of the 16 cups under 12 oz.</b> Let Y = the number of the 16 cups under 12 oz. Each cup is under with p = 0.3085 (part 1), independently, so Y ~ Binomial(16, 0.3085).<br>P(Y = 3) = ${frac("16!", "3!·13!")}(0.3085)<sup>3</sup>(0.6915)<sup>13</sup> = ${calc("binompdf(16, 0.3085, 3)")} ≈ ${box("0.1359")}</span></li>
          <li><span><b>The amount only 5% of cups fall below.</b> Area to the left 0.05: ${calc("invNorm(0.05, 12.2, 0.4)")} ≈ ${box("11.54 oz")}</span></li>
        </ul>
        <p class="callout tip">Same cutoff, three different questions: one cup (σ), the average (σ/√n), how many cups (binomial with p from the normal). Underline which one the question asks before you start.</p>`,
    },
    {
      id: "totals",
      title: "Totals (sums) of n values",
      lec: [13],
      html: `
        <p>For S = X<sub>1</sub> + … + X<sub>n</sub>: E(S) = nμ and Var(S) = nσ², so SD(S) = σ√n. By the CLT, S ≈ Normal(nμ, nσ²) for large n.</p>
        <p><b>Example.</b> Each customer at a bakery buys a number of muffins with mean 1.8 and standard deviation 0.9 (not normal). For 100 customers, S ≈ Normal(180, 100·0.9²), so SD(S) = 0.9·10 = 9.</p>
        <p>P(S &gt; 195) = ${calc("normalcdf(195, E99, 180, 9)")} ≈ 0.0478.</p>
        <p class="callout warn">The spread of a total <b>grows</b> (σ√n); the spread of an average <b>shrinks</b> (σ/√n). Mixing them up is the classic mistake.</p>`,
    },
    {
      id: "cutoffs",
      title: "Cutoffs with invNorm",
      lec: [13],
      html: `
        <p>invNorm answers “which value has this much area to its left?”</p>
        <table class="ps-table"><tr><th>The question says</th><th>Area to the left</th><th>Calculator</th></tr>
          <tr><td>bottom 5%</td><td>0.05</td><td>${calc("invNorm(0.05, μ, σ)")}</td></tr>
          <tr><td>top 10%</td><td>0.90</td><td>${calc("invNorm(0.90, μ, σ)")}</td></tr>
          <tr><td>middle 50% (from Q1 to Q3)</td><td>0.25 and 0.75</td><td>two invNorms</td></tr></table>
        <p>For the cutoff of an <b>average</b>, use σ/√n in invNorm, just like in normalcdf.</p>`,
    },
  ],

  flashcards: [
    { front: "Z-score", back: "Z = (X − μ)/σ, the number of SDs from the mean. Z ~ Normal(0, 1)." },
    { front: "Mean and SD of X̄", back: "E(X̄) = μ, SD(X̄) = σ/√n." },
    { front: "Mean and SD of a total S of n values", back: "E(S) = nμ, SD(S) = σ√n." },
    { front: "What does the CLT say?", back: "For large n, X̄ (and the sum) is approximately normal, whatever the population’s shape." },
    { front: "“Exactly 3 of the 9 exceed 125”", back: "p = P(one Xᵢ > 125) from the normal, then binompdf(9, p, 3)." },
    { front: "Cutoff for the top 15%", back: "invNorm(0.85, μ, σ): invNorm always takes the area to the LEFT." },
    { front: "normalcdf arguments", back: "normalcdf(lower, upper, μ, σ), with −E99 / E99 for an open end. σ, not σ²." },
  ],

  quiz: [
    { type: "mc", lec: [13], q: "Heights are Normal(165, 8²) cm. For the average of 16 people, which SD goes in normalcdf?",
      options: ["2", "8", "0.5", "128"], answer: 0,
      explain: "σ/√n = 8/√16 = 2. Use 8 only for a single person." },
    { type: "tf", lec: [13], q: "True or false: if the population is skewed, X̄ is still approximately normal when n = 50.",
      answer: true, explain: "That’s the CLT: for large n the average is approximately normal whatever the population looks like." },
    { type: "mc", lec: [13], q: "X ~ Normal(40, 5²). Which command gives the value with 20% of the area ABOVE it?",
      options: ["invNorm(0.80, 40, 5)", "invNorm(0.20, 40, 5)", "normalcdf(0.20, E99, 40, 5)", "invNorm(0.80, 40, 25)"], answer: 0,
      explain: "invNorm takes the area to the left: 20% above means 80% below." },
    { type: "mc", lec: [13], q: "Each of 9 independent values is Normal(50, 6²). What is the distribution of their total?",
      options: ["Normal(450, 324), SD 18", "Normal(50, 4), SD 2", "Normal(450, 36), SD 6", "Binomial(9, 50)"], answer: 0,
      explain: "Mean nμ = 450, variance nσ² = 9·36 = 324, so SD = 6·√9 = 18." },
    { type: "tf", lec: [13], q: "True or false: P(X̄ > 105) is larger than P(X₁ > 105) when μ = 100.",
      answer: false, explain: "X̄ has a smaller spread, so it’s less likely to land far above the mean. P(X̄ > 105) is the smaller one." },
    { type: "mc", lec: [13], q: "P(one value > 30) = 0.2. Ten values are drawn independently. P(exactly 3 exceed 30) is…",
      options: ["binompdf(10, 0.2, 3)", "normalcdf(30, E99, μ, σ/√10)", "0.2³", "binomcdf(10, 0.2, 3)"], answer: 0,
      explain: "Counting how many of the 10 pass is binomial with p = 0.2; “exactly” means pdf." },
  ],
});
})();
