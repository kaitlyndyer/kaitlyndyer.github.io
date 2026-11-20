// Recipe Box for Probability & Statistics (course/recipes.js): how to think through each kind of quiz problem.
// Worked examples use their own numbers, different from the exam bank. Every number was checked by computer.
(function () {
    "use strict";
    const { calc } = PS;

    registerRecipes([
        {
            id: "clt-which", c: "normal-clt", title: "One value, an average, a total, or how many?", icon: "target",
            when: "“A sample of n … find P(X̄ > c)”, “P(one Xᵢ > c)”, “P(exactly k of them exceed c)”.",
            for: { concepts: ["normal-clt"] },
            card: {
                steps: [
                    "Underline what the question is about: <b>one value</b>, the <b>average</b>, the <b>total</b>, or <b>how many</b> pass a cutoff.",
                    "One value: Normal(μ, σ²) → σ in normalcdf.",
                    "Average: X̄ ~ Normal(μ, σ²/n) → <b>σ/√n</b>.",
                    "Total: Normal(nμ, nσ²) → <b>σ√n</b>.",
                    "How many: p = P(one > c) from the normal, then Binomial(n, p) → binompdf / binomcdf.",
                ],
                check: ["Did you write the distribution line before the number?", "Is σ, σ/√n or σ√n in normalcdf the right one?", "Calculator function written with all 4 arguments, answer boxed."],
            },
            full: {
                intro: "These problems come in a chain: (a) the average, (b) one value, (c) how many. The math is quick; the points are in choosing the right spread and writing it out.",
                steps: [
                    { t: "Name the random variable", html: "<p>Start every part with “Let X̄ = the average of the n …” or “Let Y = the number of … that exceed c”. It forces you to decide which question you’re answering.</p>" },
                    { t: "Pick the spread", html: "<p>σ for one value, σ/√n for an average, σ√n for a total. Write the distribution: X̄ ~ Normal(120, 15²/9).</p>" },
                    { t: "Write the calculator function", html: `<p>${calc("normalcdf(lower, upper, μ, σ)")} with −E99 or E99 for an open end, or ${calc("binompdf(n, p, k)")} for “exactly k”.</p>` },
                ],
                example: { title: "Quick example", html: `<p>Weights are Normal(70, 10²) kg; 4 people step into an elevator. P(their average exceeds 75) = ${calc("normalcdf(75, E99, 70, 10/√4)")} ≈ 0.1587. P(one person exceeds 75) = ${calc("normalcdf(75, E99, 70, 10)")} ≈ 0.3085. P(exactly 1 of the 4 exceeds 75) = ${calc("binompdf(4, 0.3085, 1)")} ≈ 0.4080.</p>` },
                traps: ["Using σ/√n for a single value.", "Using σ/√n for a total (it’s σ√n).", "Typing the variance into normalcdf."],
            },
        },
        {
            id: "continuity", c: "normal-approx", title: "Normal approximation with continuity correction", icon: "stack",
            when: "“Use the normal approximation (with continuity correction) to estimate P(…)” for a binomial count.",
            for: { concepts: ["normal-approx"] },
            card: {
                steps: [
                    "Let X = the count. X ~ Binomial(n, p).",
                    "μ = np, σ = √(np(1 − p)). Check np ≥ 5 and n(1 − p) ≥ 5.",
                    "Translate the words to ≤, <, ≥, >, =.",
                    "Widen to keep a bar (±0.5), narrow to drop one.",
                    "normalcdf(corrected lower, corrected upper, μ, σ). Box it.",
                ],
                check: ["≥ k → k − 0.5; > k → k + 0.5; ≤ k → k + 0.5; < k → k − 0.5.", "= k → k − 0.5 to k + 0.5."],
            },
            full: {
                intro: "Every point here is in the ± 0.5. Draw the bars if you’re unsure: each whole number k owns the interval from k − 0.5 to k + 0.5.",
                steps: [
                    { t: "Set up the normal", html: "<p>Write X ~ Binomial(n, p) ≈ Normal(np, np(1 − p)), with the numbers.</p>" },
                    { t: "Correct the bounds", html: "<p>Inclusive ends widen the interval; strict ends narrow it. Write the corrected event, e.g. P(169.5 &lt; Y &lt; 190.5).</p>" },
                    { t: "Calculate", html: `<p>${calc("normalcdf(169.5, 190.5, 180, √(126))")}. Box the answer.</p>` },
                ],
                example: { title: "Quick example", html: `<p>n = 500, p = 0.4, P(at most 190): μ = 200, σ = √120 ≈ 10.954. X ≤ 190 → ${calc("normalcdf(-E99, 190.5, 200, √(120))")} ≈ 0.1929.</p>` },
                traps: ["Correcting in the wrong direction for > vs ≥.", "Using σ² = np(1 − p) as σ.", "Forgetting the correction entirely on an “exactly” question (you’d get 0)."],
            },
        },
        {
            id: "mle-steps", c: "mle", title: "Maximum likelihood in five steps", icon: "magnifying-glass",
            when: "“Find the maximum likelihood estimate (MLE) for θ” from a pdf and a sample, or from counts.",
            for: { concepts: ["mle"] },
            card: {
                steps: [
                    "L(θ) = ∏ f(yᵢ; θ). Pull out constants, collect θ powers, add exponents.",
                    "ln L(θ): products → sums, powers come down.",
                    "d/dθ ln L(θ). Terms without θ vanish.",
                    "Set = 0, solve: θ̂ (with Yᵢ’s or Ȳ).",
                    "Plug in the data: θₑ = number. Box it.",
                ],
                check: ["Counts data: each probability raised to its count.", "Chain rule on ln(1 − cθ) gives −c/(1 − cθ).", "Does θₑ make sense (positive, a probability between 0 and 1, …)?"],
            },
            full: {
                intro: "Two MLE problems per quiz is common: one continuous pdf with a sample, one discrete variable with counts. Both are the same five steps.",
                steps: [
                    { t: "Build L(θ)", html: "<p>Write the product, then simplify: ∏ θ = θⁿ, ∏ e<sup>−yᵢ/θ</sup> = e<sup>−Σyᵢ/θ</sup>. For counts: p(value)<sup>count</sup> for each value.</p>" },
                    { t: "Log and differentiate", html: "<p>ln L(θ) turns everything into a sum. Differentiate term by term; anything without θ is a constant and disappears.</p>" },
                    { t: "Solve and evaluate", html: "<p>Set the derivative to 0, solve for θ, and write θ̂ = (formula). Then compute θₑ from the data.</p>" },
                ],
                example: { title: "Quick example", html: "<p>f(y; θ) = (1/θ)e<sup>−y/θ</sup>, data {3, 5, 4}: L = θ<sup>−3</sup>e<sup>−12/θ</sup>, ln L = −3 ln θ − 12/θ, derivative −3/θ + 12/θ² = 0 ⇒ θₑ = 12/3 = 4.</p>" },
                traps: ["Setting L(θ) = 0.", "Losing the minus sign from ln(1 − θ).", "Differentiating the uniform case instead of taking the max."],
            },
        },
        {
            id: "ci-build", c: "confidence-intervals", title: "Confidence intervals and sample size", icon: "compass",
            when: "“Construct a 95% confidence interval for μ (or p)”, “How large a sample is needed for a margin of …”.",
            for: { concepts: ["confidence-intervals"] },
            card: {
                steps: [
                    "Mean or proportion? Write ȳ, σ, n or k, n.",
                    "z from the level: 90% 1.645, 95% 1.96, 99% 2.576.",
                    "Margin: z·σ/√n or z·√(p̂(1 − p̂)/n).",
                    "Interval: estimate ± margin. Box it, with units.",
                    "Sample size: (zσ/E)² or z²/(4d²), always round up.",
                ],
                check: ["Calculator check: ZInterval or 1-PropZInt.", "Interpretation sentence about the method, not “95% chance”."],
            },
            full: {
                intro: "Intervals are formula problems, so the points come from showing the formula with numbers, the z-value, and a correct interpretation.",
                steps: [
                    { t: "Identify the type", html: "<p>A sample mean with known σ → z-interval for μ. A count out of n → interval for p.</p>" },
                    { t: "Compute the margin", html: "<p>Write it with numbers, e.g. 1.96 · 12/√36 = 3.92, before adding and subtracting.</p>" },
                    { t: "Answer the question", html: "<p>If it asks whether a claim is supported, compare the claimed value to the interval.</p>" },
                ],
                example: { title: "Quick example", html: "<p>n = 100, ȳ = 82, σ = 15, 90%: margin = 1.645·15/10 ≈ 2.47, interval ≈ (79.53, 84.47).</p>" },
                traps: ["Using 2.33 for 99% (that’s a one-tail cutoff).", "Rounding a sample size down.", "Saying “95% probability μ is in this interval”."],
            },
        },
    ]);
})();
