(function () {
"use strict";
const { frac, calc, box } = PS;

registerConcept({
  id: "mle",
  oneLiner:
    "The <b>maximum likelihood estimate</b> is the value of the unknown parameter θ that makes the data you actually saw <b>most likely</b>. Every problem is the same five steps: <b>L(θ) = product</b>, take <b>ln</b>, take <b>d/dθ</b>, set it <b>= 0</b>, <b>solve</b>, then plug in the data.",

  related: ["confidence-intervals"],

  summary: {
    keyPoints: [
      { lec: [14], kind: "key", html: "<b>Likelihood:</b> L(θ) = f(y<sub>1</sub>; θ) · f(y<sub>2</sub>; θ) ⋯ f(y<sub>n</sub>; θ) = ∏ f(y<sub>i</sub>; θ). For discrete data use p(k; θ) instead of f." },
      { lec: [14], kind: "key", html: "<b>The 5 steps:</b> (1) write L(θ) and simplify the product; (2) ln L(θ); (3) d/dθ ln L(θ); (4) set it = 0 and solve for θ; (5) plug in the data." },
      { lec: [14], html: "Products become sums under ln: ln(∏ a<sub>i</sub>) = Σ ln a<sub>i</sub>, ln(θ<sup>n</sup>) = n ln θ, ln(e<sup>x</sup>) = x." },
      { lec: [14], html: "<b>Estimator vs estimate:</b> θ̂ is the formula (it has Y<sub>i</sub>’s or ȳ in it). θ<sub>e</sub> is the number you get from this data." },
      { lec: [14], html: "<b>Counts data</b> (“the value 0 was seen 54 times…”): each value contributes its probability raised to its count: L = p(0)<sup>54</sup> · p(1)<sup>37</sup> ⋯" },
      { lec: [14], kind: "warn", html: "<b>Uniform exception:</b> if the range of y depends on θ (like 0 ≤ y ≤ θ), don’t differentiate. L(θ) is largest at the smallest allowed θ: θ<sub>e</sub> = max y<sub>i</sub>." },
    ],
  },

  details: [
    {
      id: "recipe",
      title: "The five-step recipe",
      lec: [14],
      html: `
        <ul class="writeup">
          <li><span><b>Likelihood.</b> L(θ) = ∏<sub>i=1</sub><sup>n</sup> f(y<sub>i</sub>; θ). Pull every constant and every θ-power out of the product.</span></li>
          <li><span><b>Log.</b> ln L(θ). Products turn into sums, powers come down in front.</span></li>
          <li><span><b>Differentiate.</b> ${frac("d", "dθ")} ln L(θ). Terms with no θ in them vanish.</span></li>
          <li><span><b>Solve.</b> Set the derivative = 0 and solve for θ. That’s the estimator θ̂ (in terms of the y<sub>i</sub>).</span></li>
          <li><span><b>Estimate.</b> Plug in the sample. Box θ<sub>e</sub> = (number).</span></li>
        </ul>
        <p class="callout tip">Write the sentence “L(θ) = ∏ f(y<sub>i</sub>; θ)” before anything else. It shows the grader you know where the method comes from.</p>`,
    },
    {
      id: "continuous",
      title: "Worked example: a continuous pdf",
      lec: [14],
      html: `
        <p>A sample {0.6, 0.8, 0.5, 0.9} comes from f<sub>Y</sub>(y; θ) = θ y<sup>θ−1</sup>, 0 &lt; y &lt; 1. Find the MLE of θ.</p>
        <ul class="writeup">
          <li><span>L(θ) = ∏ θ y<sub>i</sub><sup>θ−1</sup> = θ<sup>n</sup> (∏ y<sub>i</sub>)<sup>θ−1</sup></span></li>
          <li><span>ln L(θ) = n ln θ + (θ − 1) Σ ln y<sub>i</sub></span></li>
          <li><span>${frac("d", "dθ")} ln L(θ) = ${frac("n", "θ")} + Σ ln y<sub>i</sub></span></li>
          <li><span>${frac("n", "θ")} + Σ ln y<sub>i</sub> = 0 ⇒ θ̂ = − ${frac("n", "Σ ln Y<sub>i</sub>")}</span></li>
          <li><span>Σ ln y<sub>i</sub> = ln 0.6 + ln 0.8 + ln 0.5 + ln 0.9 ≈ −1.5325, so θ<sub>e</sub> = −4/(−1.5325) ≈ ${box("2.610")}</span></li>
        </ul>
        <p class="callout warn">The minus sign is right: ln of a number between 0 and 1 is negative, so θ<sub>e</sub> comes out positive.</p>`,
    },
    {
      id: "counts",
      title: "Worked example: discrete data given as counts",
      lec: [14],
      html: `
        <p>X takes the values 1, 2, 3 with probabilities θ, 2θ, 1 − 3θ. In 200 trials, 1 came up 30 times, 2 came up 45 times, and 3 came up 125 times. Find the MLE of θ.</p>
        <ul class="writeup">
          <li><span>L(θ) = θ<sup>30</sup> (2θ)<sup>45</sup> (1 − 3θ)<sup>125</sup> = 2<sup>45</sup> θ<sup>75</sup> (1 − 3θ)<sup>125</sup></span></li>
          <li><span>ln L(θ) = 45 ln 2 + 75 ln θ + 125 ln(1 − 3θ)</span></li>
          <li><span>${frac("d", "dθ")} ln L(θ) = ${frac("75", "θ")} − ${frac("375", "1 − 3θ")} (chain rule: the derivative of ln(1 − 3θ) is −3/(1 − 3θ))</span></li>
          <li><span>75(1 − 3θ) = 375θ ⇒ 75 = 600θ</span></li>
          <li><span>θ<sub>e</sub> = 75/600 = ${box("0.125")}</span></li>
        </ul>
        <p class="callout warn">The chain rule on ln(1 − 3θ) is where most sign errors happen. The inside’s derivative is −3.</p>`,
    },
    {
      id: "results",
      title: "Results worth recognizing",
      lec: [14],
      html: `
        <table class="ps-table">
          <tr><th>Model</th><th>MLE</th></tr>
          <tr><td>Bernoulli / binomial, k successes in n</td><td>p̂ = k/n</td></tr>
          <tr><td>Poisson(λ)</td><td>λ̂ = x̄</td></tr>
          <tr><td>Exponential f(y) = λe<sup>−λy</sup></td><td>λ̂ = 1/ȳ</td></tr>
          <tr><td>Geometric p(k) = (1 − p)<sup>k−1</sup>p</td><td>p̂ = 1/x̄</td></tr>
          <tr><td>Normal, μ unknown</td><td>μ̂ = x̄</td></tr>
          <tr><td>Uniform on [0, θ]</td><td>θ̂ = max Y<sub>i</sub> (no derivative)</td></tr>
        </table>
        <p>Use these to check your answer, but still show the five steps: the quiz grades the derivation.</p>`,
    },
  ],

  flashcards: [
    { front: "Likelihood function", back: "L(θ) = ∏ f(yᵢ; θ): the joint pdf of the sample, viewed as a function of θ." },
    { front: "The 5 MLE steps", back: "L(θ) → ln L → d/dθ → set = 0, solve → plug in the data." },
    { front: "ln(θⁿ · e^(−Σy/θ))", back: "n ln θ − (Σy)/θ" },
    { front: "d/dθ of −(Σy)/θ", back: "+(Σy)/θ²" },
    { front: "d/dθ of ln(1 − 3θ)", back: "−3/(1 − 3θ)" },
    { front: "θ̂ vs θₑ", back: "θ̂ is the estimator (a formula in the Yᵢ). θₑ is the estimate (a number from this sample)." },
    { front: "MLE for Uniform[0, θ]", back: "θₑ = the largest observation (L decreases in θ, so take the smallest allowed θ)." },
  ],

  quiz: [
    { type: "mc", lec: [14], q: "For f(y; λ) = λe^(−λy), the likelihood of a sample of n values is…",
      options: ["λⁿ e^(−λΣyᵢ)", "nλ e^(−λΣyᵢ)", "λ e^(−λ ȳ)", "Σ λe^(−λyᵢ)"], answer: 0,
      explain: "Multiply n copies: each brings a λ and an e^(−λyᵢ); the exponents add up to −λΣyᵢ." },
    { type: "mc", lec: [14], q: "ln L(θ) = 3n ln(1/θ) − (Σyᵢ)/θ + C. What is d/dθ ln L(θ)?",
      options: ["−3n/θ + Σyᵢ/θ²", "3n/θ − Σyᵢ/θ²", "−3n/θ − Σyᵢ/θ²", "−3n ln θ + Σyᵢ"], answer: 0,
      explain: "3n ln(1/θ) = −3n ln θ, whose derivative is −3n/θ. The derivative of −Σyᵢ·θ⁻¹ is +Σyᵢ·θ⁻²." },
    { type: "tf", lec: [14], q: "True or false: you should set L(θ) itself equal to 0 and solve.",
      answer: false, explain: "You set the derivative of ln L(θ) equal to 0. L(θ) itself is a product of probabilities, positive wherever the data are possible." },
    { type: "tf", lec: [14], q: "True or false: for a sample from Uniform[0, θ], the MLE comes from setting d/dθ ln L = 0.",
      answer: false, explain: "L(θ) = 1/θⁿ for θ ≥ max yᵢ is decreasing, so its derivative is never 0. The MLE is θₑ = max yᵢ." },
    { type: "mc", lec: [14], q: "Values 0 and 1 appear with probabilities θ and 1 − θ; you saw 0 twelve times and 1 eight times. L(θ) = ?",
      options: ["θ¹² (1 − θ)⁸", "12θ + 8(1 − θ)", "θ⁸ (1 − θ)¹²", "(θ(1 − θ))²⁰"], answer: 0,
      explain: "Each observed 0 contributes a factor θ, each 1 a factor (1 − θ)." },
    { type: "tf", lec: [14], q: "True or false: ln(∏ yᵢ³) = 3 Σ ln yᵢ.",
      answer: true, explain: "The log of a product is the sum of the logs, and ln(yᵢ³) = 3 ln yᵢ." },
  ],
});
})();
