// Course structure: lectures, concept groups, and the concepts in each group.
// Concept content lives in data/concepts/<id>.js and registers itself with registerConcept().
// Concepts listed here without a content file show as "coming soon".
// Every problem in this course is original (none copied from homework or old exams), and every number was checked by computer.

window.STUDY = {
  course: {
    id: "ps",
    storeKey: "cramlet.ps.v1",
    title: "Probability & Statistics",
    tagline: "The normal curve, the CLT, maximum likelihood, and confidence intervals, written out the way a strict grader wants: define X, name the distribution, plug in, write the calculator function, box the answer.",
  },

  lectures: {
    1: "Sample Spaces (§2.2)",
    2: "The Probability Function (§2.3)",
    3: "Conditional Probability (§2.4)",
    4: "Independence (§2.5)",
    5: "Binomial & Hypergeometric (§3.2)",
    6: "Discrete Random Variables (§3.3)",
    7: "Continuous Random Variables (§3.4)",
    8: "Expected Values (§3.5)",
    9: "Variance (§3.6)",
    10: "Joint Densities (§3.7)",
    11: "Combining Random Variables (§3.9)",
    12: "The Poisson Distribution (§4.2)",
    13: "The Normal Distribution & the CLT (§4.3)",
    14: "Maximum Likelihood (§5.2)",
    15: "Confidence Intervals (§5.3)",
    16: "Unbiasedness (§5.4)",
  },

  groups: [
    {
      id: "normal-estimation",
      title: "Normal & Estimation",
      icon: "target",
      concepts: [
        { id: "normal-clt", title: "The Normal Curve & the CLT", icon: "target", color: "#e0567c", lectures: [13] },
        { id: "normal-approx", title: "Normal Approximation & Continuity Correction", icon: "stack", color: "#ff7a59", lectures: [13] },
        { id: "mle", title: "Maximum Likelihood (MLE)", icon: "magnifying-glass", color: "#7c5cff", lectures: [14] },
        { id: "confidence-intervals", title: "Confidence Intervals", icon: "compass", color: "#11a8a0", lectures: [15] },
      ],
    },
    {
      id: "probability",
      title: "Probability Basics",
      icon: "tree-structure",
      concepts: [
        { id: "counting", title: "Counting & Sample Spaces", icon: "list-checks", color: "#3f8cff", lectures: [1, 2] },
        { id: "trees-bayes", title: "Trees, Total Probability & Bayes", icon: "tree-structure", color: "#2fae6b", lectures: [3] },
        { id: "independence", title: "Independence & Circuits", icon: "arrows-split", color: "#c2569b", lectures: [4] },
      ],
    },
    {
      id: "random-variables",
      title: "Random Variables",
      icon: "stack",
      concepts: [
        { id: "binomial-hyper", title: "Binomial & Hypergeometric", icon: "cards", color: "#e08a00", lectures: [5] },
        { id: "discrete-rv", title: "Discrete pdfs & cdfs", icon: "stack", color: "#8a6cf0", lectures: [6] },
        { id: "continuous-rv", title: "Continuous pdfs & cdfs", icon: "infinity", color: "#d9534f", lectures: [7] },
        { id: "expected-variance", title: "Expected Value & Variance", icon: "target", color: "#11a8a0", lectures: [8, 9] },
        { id: "transformations", title: "Transformations (cdf method)", icon: "shuffle", color: "#ff7a59", lectures: [9] },
        { id: "joint", title: "Joint pdfs, Regions & Marginals", icon: "venn", color: "#3f8cff", lectures: [10, 11] },
        { id: "poisson", title: "The Poisson Distribution", icon: "hourglass-medium", color: "#2fae6b", lectures: [12] },
      ],
    },
  ],

  settings: {
    exam: {
      lengths: {
        quiz: { name: "Quiz (real format)", minutes: 30, mix: { work: 5 }, note: "5 show-your-work problems in 30 minutes, like the real quizzes." },
        drill: { name: "Quick drill", minutes: 15, mix: { work: 2 } },
        check: { name: "Concept check", minutes: 0, mix: { choice: 10 } },
      },
      sections: { choice: "Concept checks" },
      intro: "A closed-book practice quiz drawn from {course}’s question bank: show-your-work problems you solve on paper with a calculator, then grade against a model solution and a checklist, the way a strict grader would.",
    },
    myths: {
      line: "Rapid-fire true/false statements built from the traps that cost points, like “a single Xᵢ uses σ/√n” or “a 95% interval has a 95% chance of containing μ.” Decide fast, and every answer comes with the reason.",
    },
    pep: {
      tips: [
        "Write the calculator function every time, with every argument: normalcdf(−E99, 125, 120, 15/√9).",
        "Before any formula, write one line: “Let X = …” and “X ~ …”. Naming the distribution earns points.",
        "One Xᵢ uses σ. An average X̄ uses σ/√n. Read the question twice for which one it asks.",
        "MLE: L(θ) = product, take ln, take d/dθ, set = 0, solve. Then plug in the data for the estimate.",
        "Box every final answer. Round to the decimals the question asks for.",
        "Breathe out slowly before you start. Long exhales settle the jitters.",
      ],
    },
  },

  content: {},
};

window.registerConcept = function (concept) {
  window.STUDY.content[concept.id] = concept;
};
