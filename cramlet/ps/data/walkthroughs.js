// Interactive worked examples ("stepper" widget, course/stepper.js), one per concept, in each concept's Playground tab.
// Each one builds the full written answer a strict grader wants, one line at a time: define the variable, name the
// distribution, plug in, write the calculator function, box the answer. Decimal answers accept small rounding (tol).
// Every number here was checked by computer.
(function () {
"use strict";
const { calc, blank: b } = PS;
const add = (id, p) => { const c = window.STUDY.content[id]; (c.playground = c.playground || []).push({ id: "walkthrough", widget: "stepper", ...p }); };
const intro = "<p>Grab paper (or Notability) and write each line yourself <b>before</b> you type, the way you would on the quiz. Type your answer in the dashed boxes and press <b>Check</b> (or Enter). Stuck? <b>Hint</b>, then <b>Show me</b>. Round decimals to 4 places. Finish, then <b>Start over</b> and redo the steps you missed.</p>";

// ---------------------------------------------------------------- Normal & CLT
add("normal-clt", {
  title: "Walk through it: one value, an average, and how many", lec: [13], intro,
  config: {
    problem: "Commute times are Normal(34, 6²) minutes. You record 9 independent commutes. (a) P(the average of the 9 is more than 36 min). (b) P(one commute is more than 36 min). (c) P(exactly 2 of the 9 are more than 36 min). (d) The time that only the slowest 10% of commutes exceed.",
    steps: [
      { title: "Step 1: which distribution for (a)?", ask: "Part (a) is about the average X̄ of 9 commutes. What is its distribution?",
        choices: ["X̄ ~ Normal(34, 6²/9)", "X̄ ~ Normal(34, 6²)", "X̄ ~ Binomial(9, 34)", "X̄ ~ Normal(34·9, 9·6²)"], answer: 0,
        whys: [null, "That’s one commute. An average of 9 is less spread out.", "Binomial counts successes; here we average times.", "That’s the total of the 9 commutes, not their average."],
        hint: "An average keeps the mean but divides the variance by n.",
        why: "By the CLT (here exact, since each commute is normal), X̄ ~ Normal(μ, σ²/n) = Normal(34, 36/9). Write this line on the quiz: naming the distribution earns points." },
      { title: "Step 2: the SD of X̄", ask: "σ<sub>X̄</sub> = σ/√n = ?", show: `σ<sub>X̄</sub> = 6/√9 = ${b(0)}`, answers: [2],
        hint: "√9 = 3.",
        why: "σ/√n = 6/3 = 2 minutes. This is the number that goes in normalcdf for an average." },
      { title: "Step 3: answer (a)", ask: "P(X̄ > 36) = ?", show: `P(X̄ &gt; 36) = ${calc("normalcdf(36, E99, 34, 2)")} = ${b(0)}`, answers: [0.1587], tol: 0.002,
        hint: "36 is exactly one SD (of X̄) above 34. About 16% of a normal curve is more than 1 SD above the mean.",
        why: "z = (36 − 34)/2 = 1, and P(Z > 1) ≈ 0.1587. Box it. On paper write the whole function: normalcdf(36, E99, 34, 2)." },
      { title: "Step 4: answer (b)", ask: "Now one commute: P(X > 36) = ?", show: `P(X &gt; 36) = ${calc("normalcdf(36, E99, 34, 6)")} = ${b(0)}`, answers: [0.3694], tol: 0.002,
        hint: "One commute uses σ = 6, not 2.",
        why: "z = (36 − 34)/6 ≈ 0.333, so P ≈ 0.3694. One value is much more likely than the average to be above 36, because single values spread out more." },
      { title: "Step 5: set up (c)", ask: "Y = the number of the 9 commutes over 36 min. What is Y’s distribution?",
        choices: ["Y ~ Binomial(9, 0.3694)", "Y ~ Binomial(9, 0.1587)", "Y ~ Normal(34, 4)", "Y ~ Binomial(36, 0.3694)"], answer: 0,
        whys: [null, "0.1587 is for the average. Each single commute is over 36 with probability 0.3694.", "Y counts commutes; it’s a whole number, not a time.", "There are 9 trials, one per commute."],
        hint: "Each commute is a trial: “over 36” is a success with the probability from part (b).",
        why: "9 independent trials, each a success with p = P(one commute > 36) = 0.3694. So Y ~ Binomial(9, 0.3694)." },
      { title: "Step 6: answer (c)", ask: "P(Y = 2) = ?", show: `P(Y = 2) = (9 choose 2)(0.3694)²(0.6306)⁷ = ${calc("binompdf(9, 0.3694, 2)")} = ${b(0)}`, answers: [0.1947], tol: 0.002,
        hint: "“Exactly” → binompdf. 9 choose 2 = 36.",
        why: "36 · 0.3694² · 0.6306⁷ ≈ 0.1947. Write the formula with numbers and the calculator function, then box it." },
      { title: "Step 7: answer (d)", ask: "The slowest 10% are above which time?", show: `${calc("invNorm(0.90, 34, 6)")} = ${b(0)} min`, answers: [41.69], tol: 0.02,
        hint: "invNorm takes the area to the LEFT. The top 10% has 90% of the area below it.",
        why: "invNorm(0.90, 34, 6) ≈ 41.69 minutes. (z ≈ 1.2816, and 34 + 1.2816·6 ≈ 41.69.) It’s about one commute, so σ = 6." },
      { title: "The write-up", why: "On the quiz each part gets: (1) “Let X = …”, (2) the distribution, (3) the probability statement, (4) the calculator function with all arguments, (5) a boxed answer. Here: (a) 0.1587, (b) 0.3694, (c) 0.1947, (d) 41.69 min." },
    ],
  },
});

// ---------------------------------------------------------------- Normal approximation
add("normal-approx", {
  title: "Walk through it: normal approximation with continuity correction", lec: [13], intro,
  config: {
    problem: "30% of a city’s residents bike to work. In a random sample of 600 residents, use the normal approximation with continuity correction to estimate P(between 170 and 190 bike, inclusive).",
    steps: [
      { title: "Step 1: name it", ask: "Let X = the number of the 600 who bike. Exactly, X ~ ?",
        choices: ["Binomial(600, 0.3)", "Normal(600, 0.3)", "Hypergeometric", "Poisson(0.3)"], answer: 0,
        whys: [null, "That’s not how a normal is parameterized, and X is a count of successes.", "Sampling from a whole city is effectively with replacement.", "Poisson is for counts over time or space with a rate."],
        hint: "Fixed number of independent trials, same success probability each time.",
        why: "600 independent residents, each bikes with p = 0.3: X ~ Binomial(600, 0.3). Write it, then say you’ll approximate it with a normal." },
      { title: "Step 2: the mean", ask: "μ = np = ?", show: `μ = 600 · 0.3 = ${b(0)}`, answers: [180],
        hint: "Multiply.", why: "np = 180. Also n(1 − p) = 420. Both ≥ 5, so the approximation is OK. Say so in one line." },
      { title: "Step 3: the SD", ask: "σ = √(np(1 − p)) = ?", show: `σ = √(600 · 0.3 · 0.7) = √126 = ${b(0)}`, answers: [11.2250], tol: 0.01,
        hint: "600 · 0.3 · 0.7 = 126.",
        why: "√126 ≈ 11.225. So X ≈ Normal(180, 126). The calculator wants σ = 11.225 (or type √(126) directly)." },
      { title: "Step 4: correct the ends", ask: "Inclusive 170 ≤ X ≤ 190 becomes which interval?", show: `from ${b(0)} to ${b(1)}`, answers: [169.5, 190.5],
        hint: "Keep the whole bars for 170 and for 190. Each bar sticks out 0.5 on each side.",
        why: "Inclusive on both ends widens the interval: 169.5 to 190.5. (Strict 170 < X < 190 would narrow it to 170.5 to 189.5.)" },
      { title: "Step 5: the answer", ask: "P(170 ≤ X ≤ 190) ≈ ?", show: `${calc("normalcdf(169.5, 190.5, 180, √(126))")} = ${b(0)}`, answers: [0.6504], tol: 0.002,
        hint: "Put the corrected bounds straight into normalcdf with μ = 180 and σ = √126.",
        why: "≈ 0.6504 (the exact binomial is 0.6504 too: the approximation is excellent here). Box it." },
      { title: "Step 6: a different wording", ask: "What if it said “more than 190 bike”?",
        choices: ["normalcdf(190.5, E99, 180, √(126))", "normalcdf(189.5, E99, 180, √(126))", "normalcdf(190, E99, 180, √(126))", "1 − normalcdf(190.5, E99, 180, √(126))"], answer: 0,
        whys: [null, "189.5 would include 190, but “more than 190” starts at 191.", "Without the correction you skip the half bar.", "That’s the probability of 190 or fewer."],
        hint: "More than 190 means 191 or more. Where does the bar for 191 start?",
        why: "X > 190 ⇔ X ≥ 191, whose bar starts at 190.5: normalcdf(190.5, E99, 180, √126)." },
    ],
  },
});

// ---------------------------------------------------------------- MLE
add("mle", {
  title: "Walk through it: the five MLE steps", lec: [14], intro,
  config: {
    problem: "A sample {2.1, 0.7, 1.6, 3.6} comes from f<sub>Y</sub>(y; λ) = λe<sup>−λy</sup>, y > 0. Find the maximum likelihood estimate of λ.",
    steps: [
      { title: "Step 1: the likelihood", ask: "L(λ) = ∏ λe<sup>−λy<sub>i</sub></sup> simplifies to…",
        choices: ["λⁿ e^(−λΣyᵢ)", "nλ e^(−λΣyᵢ)", "λ e^(−λnΣyᵢ)", "Σ λe^(−λyᵢ)"], answer: 0,
        whys: [null, "Multiplying n copies of λ gives λⁿ, not nλ.", "The exponents add to −λΣyᵢ; there’s no extra n.", "Likelihood is a product, not a sum."],
        hint: "Multiply n copies. The λ’s multiply into a power; the exponentials’ exponents add.",
        why: "L(λ) = λ·λ⋯λ · e<sup>−λy₁</sup>⋯e<sup>−λyₙ</sup> = λ<sup>n</sup> e<sup>−λΣyᵢ</sup>. Write “L(λ) = ∏ f(yᵢ; λ)” first, then this." },
      { title: "Step 2: take ln", ask: "ln L(λ) = ?",
        choices: ["n ln λ − λΣyᵢ", "ln λ − λΣyᵢ", "n ln λ · (−λΣyᵢ)", "λⁿ − λΣyᵢ"], answer: 0,
        whys: [null, "ln(λⁿ) = n ln λ: the power comes down.", "ln of a product is a sum, not a product.", "You still need the ln of λⁿ."],
        hint: "ln(ab) = ln a + ln b, ln(λⁿ) = n ln λ, ln(eˣ) = x.",
        why: "ln(λⁿ) + ln(e<sup>−λΣy</sup>) = n ln λ − λΣyᵢ." },
      { title: "Step 3: differentiate", ask: "d/dλ ln L(λ) = ?",
        choices: ["n/λ − Σyᵢ", "n/λ + Σyᵢ", "n ln λ − Σyᵢ", "−n/λ² − Σyᵢ"], answer: 0,
        whys: [null, "The derivative of −λΣyᵢ is −Σyᵢ.", "Differentiate ln λ too: it becomes 1/λ.", "That’s a second derivative of the first term."],
        hint: "d/dλ (n ln λ) = n/λ. Σyᵢ is just a number.",
        why: "n/λ − Σyᵢ." },
      { title: "Step 4: solve", ask: "Set n/λ − Σyᵢ = 0. The estimator is…",
        choices: ["λ̂ = n/ΣYᵢ = 1/Ȳ", "λ̂ = Ȳ", "λ̂ = ΣYᵢ/n²", "λ̂ = n·ΣYᵢ"], answer: 0,
        whys: [null, "Flip it: n/λ = Σy gives λ = n/Σy.", "Check the algebra: n/λ = Σy.", "Multiply both sides by λ, then divide by Σy."],
        hint: "n/λ = Σyᵢ. Multiply both sides by λ and divide by Σyᵢ.",
        why: "λ̂ = n/ΣYᵢ = 1/Ȳ. With capital Y it’s the estimator (a formula); with the data it becomes the estimate." },
      { title: "Step 5: plug in", ask: "Σyᵢ = ? and λ<sub>e</sub> = ?", show: `Σyᵢ = ${b(0)} &nbsp; λ<sub>e</sub> = 4/Σyᵢ = ${b(1)}`, answers: [8, 0.5], tol: 0.001,
        hint: "2.1 + 0.7 + 1.6 + 3.6.",
        why: "Σyᵢ = 8.0, n = 4, λ<sub>e</sub> = 4/8 = 0.5. Box λ<sub>e</sub> = 0.5." },
    ],
  },
});

// ---------------------------------------------------------------- Confidence intervals
add("confidence-intervals", {
  title: "Walk through it: a proportion interval and a sample size", lec: [15], intro,
  config: {
    problem: "In a poll, 312 of 600 voters support a ballot measure. (a) Find a 95% confidence interval for the true proportion p. (b) How many voters are needed for a margin of error of 0.02 at 95% confidence (worst case)?",
    steps: [
      { title: "Step 1: the estimate", ask: "p̂ = k/n = ?", show: `p̂ = 312/600 = ${b(0)}`, answers: [0.52], tol: 0.0005,
        hint: "Divide.", why: "p̂ = 0.52." },
      { title: "Step 2: the z", ask: "Which z for 95%?", choices: ["1.96", "1.645", "2.576", "0.95"], answer: 0, keepOrder: true,
        whys: [null, "That’s 90%.", "That’s 99%.", "0.95 is the confidence level, not the z-value."],
        hint: "95% leaves 2.5% in each tail: invNorm(0.975).",
        why: "z = invNorm(0.975) ≈ 1.96." },
      { title: "Step 3: the margin", ask: "Margin = 1.96·√(p̂(1 − p̂)/n) = ?", show: `1.96·√(0.52·0.48/600) = ${b(0)}`, answers: [0.0400], tol: 0.0006,
        hint: "0.52·0.48 = 0.2496; divide by 600; take the square root; multiply by 1.96.",
        why: "√(0.2496/600) ≈ 0.02040, times 1.96 ≈ 0.0400." },
      { title: "Step 4: the interval", ask: "The 95% CI is…", show: `(${b(0)}, ${b(1)})`, answers: [0.480, 0.560], tol: 0.002,
        hint: "0.52 ± 0.04.",
        why: "(0.480, 0.560). Calculator check: 1-PropZInt(x = 312, n = 600, C-Level = 0.95). Since 0.5 is inside, the poll can’t say a majority supports it." },
      { title: "Step 5: what it means", ask: "Which sentence is right?",
        choices: ["95% of intervals built this way contain the true p.", "There’s a 95% chance p is between 0.480 and 0.560.", "95% of voters are between 0.480 and 0.560.", "p̂ is within 0.04 of p with certainty."], answer: 0,
        whys: [null, "p is fixed; after you compute the interval, it either contains p or not.", "The interval is about a proportion, not individual voters.", "Nothing is certain; 95% is the method’s success rate."],
        hint: "What is random here: p, or the interval?",
        why: "The confidence level describes the method: about 95% of samples give an interval that covers p." },
      { title: "Step 6: sample size", ask: "n = z²/(4d²) with d = 0.02. Round up.", show: `n = 1.96²/(4·0.02²) = ${b(0)}`, answers: [2401],
        hint: "1.96² = 3.8416 and 4·0.02² = 0.0016.",
        why: "3.8416/0.0016 = 2401 exactly. If it had come out 2400.3, you’d still round up to 2401." },
    ],
  },
});
})();
