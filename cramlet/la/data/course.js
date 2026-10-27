// Course structure: lectures, concept groups, and the concepts in each group.
// Concept content lives in data/concepts/<id>.js and registers itself with registerConcept().
// Matrices and vectors in the content are drawn with LA.M and LA.V (la.js).

window.STUDY = {
  course: {
    id: "la",
    storeKey: "cramlet.la.v1",
    title: "Linear Algebra",
    tagline: "Kernels, images, subspaces, bases, and coordinates: the ideas behind Ax = b, with worked examples and practice tests in the real Test 2 format.",
  },

  lectures: {
    1: "Linear Systems & Gauss–Jordan (§1.1–1.2)",
    2: "Solutions of Linear Systems (§1.3)",
    3: "Linear Transformations & Geometry (§2.1–2.2)",
    4: "Matrix Products & Inverses (§2.3–2.4)",
    5: "Inverses, Image & Kernel (§2.4, §3.1)",
    6: "Subspaces, Bases & Independence (§3.2)",
    7: "Linear Relations & Dimension (§3.2–3.3)",
    8: "Rank–Nullity & Coordinates (§3.3–3.4)",
    9: "Coordinates (§3.4)",
    10: "The B-Matrix & Similarity (§3.4)",
    11: "Orthonormal Bases & Projections (§5.1)",
  },

  groups: [
    {
      id: "warmup",
      title: "Test 1 Toolbox",
      icon: "wrench",
      concepts: [
        { id: "toolbox", title: "Row Reduction, Rank & Inverses", icon: "wrench", color: "#8a6cf0", lectures: [1, 2, 4, 5] },
      ],
    },
    {
      id: "spaces",
      title: "Subspaces",
      icon: "stack",
      concepts: [
        { id: "kernel-image", title: "Image & Kernel", icon: "venn", color: "#ff7a59", lectures: [5, 7, 8] },
        { id: "subspaces", title: "Subspaces of ℝⁿ", icon: "stack", color: "#e0567c", lectures: [6] },
        { id: "independence", title: "Linear Independence & Span", icon: "arrows-split", color: "#c2569b", lectures: [6, 7] },
        { id: "basis-dimension", title: "Basis, Dimension & Rank–Nullity", icon: "puzzle-piece", color: "#7c5cff", lectures: [7, 8] },
      ],
    },
    {
      id: "orthogonality",
      title: "Orthogonality",
      icon: "target",
      concepts: [
        { id: "orth-complement", title: "Orthogonal Complements", icon: "target", color: "#3f8cff", lectures: [7, 11] },
        { id: "projections", title: "Orthonormal Bases & Projections", icon: "tray-arrow-down", color: "#11a8a0", lectures: [11] },
      ],
    },
    {
      id: "coords",
      title: "Coordinates",
      icon: "compass",
      concepts: [
        { id: "coordinates", title: "Coordinates in a Basis", icon: "compass", color: "#2fae6b", lectures: [8, 9] },
        { id: "b-matrix", title: "The B-Matrix of T", icon: "gear-six", color: "#e08a00", lectures: [9, 10] },
        { id: "similarity", title: "Similar Matrices", icon: "shuffle", color: "#d9534f", lectures: [10] },
      ],
    },
  ],

  settings: {
    exam: {
      lengths: {
        test2: { name: "Test 2 (real format)", minutes: 65, mix: { choice: 8, work: 5 }, types: { choice: ["tf"] }, weight: { choice: 2 } },
        long: { name: "Long practice", minutes: 90, mix: { choice: 12, work: 7 } },
        quick: { name: "Quick check", minutes: 0, mix: { choice: 10 } },
      },
      sections: { choice: "True/false & concept checks" },
      intro: "A closed-book practice test drawn fresh from {course}’s question bank, in the real Test 2 format: true/false worth 2 points each, then multi-part problems you work out on paper (no calculator). Afterward, you check your work against model solutions.",
    },
    myths: {
      line: "Rapid-fire true/false statements built from the traps behind wrong answers, like “the image of a 3×5 matrix lives in ℝ⁵” or “orthogonal vectors are always independent.” Decide fast, and every answer comes with the reason.",
    },
    pep: {
      tips: [
        "Start with the problem you’re surest of. Easy points first calms the nerves.",
        "Image basis: take columns of <b>A</b>, not of rref(A). Kernel basis: one vector per free variable.",
        "Before you answer a true/false, try a tiny example: a 2×2 matrix, a zero vector, or a line in ℝ².",
        "Check every kernel vector by multiplying: A x should be 0. It takes ten seconds and catches sign mistakes.",
        "Write the formula from your sheet first (B = S⁻¹AS, x = S[x]_B), then plug in.",
        "Breathe out slowly before you start. Long exhales settle the jitters.",
      ],
    },
  },

  content: {},
};

window.registerConcept = function (concept) {
  window.STUDY.content[concept.id] = concept;
};
