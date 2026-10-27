(function () {
"use strict";
const { M, V, set } = LA;

registerConcept({
  id: "projections",
  oneLiner:
    "Any x splits uniquely as <b>x = x<sup>∥</sup> + x<sup>⊥</sup></b>, with x<sup>∥</sup> in V and x<sup>⊥</sup> perpendicular to V. With an <b>orthonormal basis</b> u<sub>1</sub>, …, u<sub>m</sub> of V, <b>proj<sub>V</sub>x = (u<sub>1</sub>·x)u<sub>1</sub> + … + (u<sub>m</sub>·x)u<sub>m</sub></b>.",

  related: ["orth-complement", "b-matrix", "independence"],

  summary: {
    keyPoints: [
      { lec: [11], html: "<b>Orthonormal</b> vectors: each has length 1 and each pair is perpendicular (u<sub>i</sub> · u<sub>j</sub> = 0 for i ≠ j, u<sub>i</sub> · u<sub>i</sub> = 1). They’re automatically independent." },
      { lec: [11], html: "To turn an <b>orthogonal</b> basis into an <b>orthonormal</b> one, divide each vector by its length." },
      { lec: [11], kind: "key", html: "<b>proj<sub>V</sub>x = x<sup>∥</sup> = (u<sub>1</sub>·x)u<sub>1</sub> + … + (u<sub>m</sub>·x)u<sub>m</sub></b> (orthonormal u’s). Then <b>x<sup>⊥</sup> = x − x<sup>∥</sup></b>, which is in V<sup>⊥</sup>." },
      { lec: [11], html: "With an <b>orthogonal</b> (not unit) basis v<sub>i</sub>: proj<sub>V</sub>x = Σ (v<sub>i</sub>·x)/(v<sub>i</sub>·v<sub>i</sub>) v<sub>i</sub>. Same thing, no square roots." },
      { lec: [11], kind: "key", html: "<b>Matrix of the projection:</b> P = u<sub>1</sub>u<sub>1</sub><sup>T</sup> + … + u<sub>m</sub>u<sub>m</sub><sup>T</sup> = QQ<sup>T</sup>, where Q = [u<sub>1</sub> … u<sub>m</sub>]. Its image is V and its kernel is V<sup>⊥</sup>." },
      { lec: [3], html: "Onto a line spanned by w: proj(x) = (x·w)/(w·w) w. In ℝ<sup>2</sup> with w = (w<sub>1</sub>, w<sub>2</sub>): P = 1/(w<sub>1</sub>² + w<sub>2</sub>²) [[w<sub>1</sub>², w<sub>1</sub>w<sub>2</sub>], [w<sub>1</sub>w<sub>2</sub>, w<sub>2</sub>²]]." },
      { lec: [11], kind: "warn", html: "The formula needs an <b>orthogonal</b> basis. If the basis vectors of V aren’t perpendicular, you can’t just add up the projections onto each one." },
    ],
  },

  details: [
    {
      id: "orthonormal",
      title: "Orthonormal vectors",
      lec: [11],
      html: `
        <p>u<sub>1</sub>, …, u<sub>m</sub> are <b>orthonormal</b> if u<sub>i</sub> · u<sub>j</sub> = 0 when i ≠ j and u<sub>i</sub> · u<sub>i</sub> = 1.</p>
        <p><b>Example.</b> v<sub>1</sub> = (1, 2, 2) and v<sub>2</sub> = (2, 1, −2) are orthogonal (2 + 2 − 4 = 0) and each has length √(1 + 4 + 4) = 3. So u<sub>1</sub> = ⅓(1, 2, 2), u<sub>2</sub> = ⅓(2, 1, −2) are orthonormal: an orthonormal basis of the plane V = span(v<sub>1</sub>, v<sub>2</sub>).</p>
        <p class="callout tip">To <b>explain</b> why a list is orthonormal on a test: compute every pairwise dot product (0) and every length (1). For “½v<sub>1</sub>, ½v<sub>2</sub>” type questions, ‖v<sub>i</sub>‖ = 2 is what makes the ½ work.</p>
        <p>Theorem 5.1.3: orthonormal vectors are independent, so n orthonormal vectors in ℝ<sup>n</sup> are a basis.</p>`,
    },
    {
      id: "projection",
      title: "Projecting onto a subspace",
      lec: [11],
      html: `
        <p>For V = span(v<sub>1</sub>, v<sub>2</sub>) above and x = (0, 0, 9):</p>
        <ul>
          <li>u<sub>1</sub> · x = ⅓(0 + 0 + 18) = 6 &nbsp;→ 6u<sub>1</sub> = 2(1, 2, 2) = (2, 4, 4)</li>
          <li>u<sub>2</sub> · x = ⅓(0 + 0 − 18) = −6 &nbsp;→ −6u<sub>2</sub> = −2(2, 1, −2) = (−4, −2, 4)</li>
        </ul>
        <div class="mrow">x<sup>∥</sup> = proj<sub>V</sub>x = ${V(-2, 2, 8)}, &nbsp; x<sup>⊥</sup> = x − x<sup>∥</sup> = ${V(2, -2, 1)}</div>
        <p class="callout try"><b>Always check:</b> x<sup>⊥</sup> must be perpendicular to every basis vector of V. (2, −2, 1) · (1, 2, 2) = 2 − 4 + 2 = 0 ✓ and (2, −2, 1) · (2, 1, −2) = 4 − 2 − 2 = 0 ✓.</p>
        <p class="callout tip">Fewer fractions: use the orthogonal v’s directly. (v<sub>1</sub>·x)/(v<sub>1</sub>·v<sub>1</sub>) = 18/9 = 2 and (v<sub>2</sub>·x)/(v<sub>2</sub>·v<sub>2</sub>) = −18/9 = −2, so x<sup>∥</sup> = 2v<sub>1</sub> − 2v<sub>2</sub>. Same answer.</p>
        <p><b>Why x<sup>⊥</sup> ∈ V<sup>⊥</sup>:</b> by construction, u<sub>i</sub> · x<sup>⊥</sup> = u<sub>i</sub> · x − (u<sub>i</sub> · x)(u<sub>i</sub> · u<sub>i</sub>) = 0 for each i, so x<sup>⊥</sup> is perpendicular to a basis of V, hence to all of V.</p>`,
    },
    {
      id: "matrix",
      title: "The matrix of a projection",
      lec: [11],
      html: `
        <p>proj<sub>V</sub>x = u<sub>1</sub>(u<sub>1</sub><sup>T</sup>x) + u<sub>2</sub>(u<sub>2</sub><sup>T</sup>x) = (u<sub>1</sub>u<sub>1</sub><sup>T</sup> + u<sub>2</sub>u<sub>2</sub><sup>T</sup>)x, so</p>
        <div class="mrow">P = u<sub>1</sub>u<sub>1</sub><sup>T</sup> + u<sub>2</sub>u<sub>2</sub><sup>T</sup> = ⅑ ( ${M([[1, 2, 2], [2, 4, 4], [2, 4, 4]])} + ${M([[4, 2, -4], [2, 1, -2], [-4, -2, 4]])} ) = ⅑ ${M([[5, 4, -2], [4, 5, 2], [-2, 2, 8]])}</div>
        <p>(u u<sup>T</sup> is a column times a row: entry (i, j) is u<sub>i</sub>u<sub>j</sub>.) Check: P(0, 0, 9) = (−2, 2, 8) ✓, the third column times 9.</p>
        <p class="callout key">Facts about the projection P onto V: im(P) = V, ker(P) = V<sup>⊥</sup>, P² = P (projecting twice = projecting once), Px = x for x in V, and rank(P) = dim V.</p>`,
    },
    {
      id: "line-2d",
      title: "Review: projecting onto a line (Lecture 3)",
      lec: [3],
      html: `
        <p>For a line L spanned by w (any nonzero vector): proj<sub>L</sub>(x) = ((x · w)/(w · w)) w. Reflection about L: ref<sub>L</sub>(x) = 2 proj<sub>L</sub>(x) − x.</p>
        <p>Your teacher derived it by writing x<sup>∥</sup> = kw and requiring (x − kw) · w = 0, which gives k = (x · w)/(w · w).</p>
        <p class="callout tip">These two maps are the classic examples for the B-matrix: in a basis of (a vector on L, a vector perpendicular to L), projection has B = diag(1, 0) and reflection has B = diag(1, −1).</p>`,
    },
  ],

  flashcards: [
    { front: "Orthonormal", back: "Unit length and pairwise perpendicular: uᵢ · uⱼ = 0 (i ≠ j), uᵢ · uᵢ = 1." },
    { front: "proj_V x with orthonormal basis u₁, …, u_m", back: "(u₁·x)u₁ + … + (u_m·x)u_m." },
    { front: "proj_V x with orthogonal (not unit) basis v₁, …, v_m", back: "Σ (vᵢ·x)/(vᵢ·vᵢ) vᵢ." },
    { front: "x⊥", back: "x − proj_V x. It lies in V⊥." },
    { front: "Matrix of the projection onto V", back: "P = u₁u₁ᵀ + … + u_m u_mᵀ (orthonormal u’s)." },
    { front: "im and ker of the projection onto V", back: "im = V, ker = V⊥." },
    { front: "Projection onto line spanned by w", back: "((x·w)/(w·w)) w." },
    { front: "How do you check a projection answer?", back: "x − proj_V x must dot to 0 with every basis vector of V." },
  ],

  quiz: [
    {
      type: "mc", lec: [11],
      q: "u₁ = ½(1, 1, 1, 1) and u₂ = ½(1, −1, 1, −1) are orthonormal. What is proj_V x for x = (2, 0, 0, 0), V = span(u₁, u₂)?",
      options: ["(1, 0, 1, 0)", "(2, 0, 0, 0)", "(1, 1, 1, 1)", "(½, 0, ½, 0)"],
      answer: 0,
      explain: "u₁·x = 1 and u₂·x = 1, so proj = u₁ + u₂ = ½(2, 0, 2, 0) = (1, 0, 1, 0). Check: x − proj = (1, 0, −1, 0), which dots to 0 with both.",
    },
    {
      type: "tf", lec: [11],
      q: "True or false: if v₁ and v₂ are any basis of V (not necessarily orthogonal), then proj_V x = proj onto v₁ + proj onto v₂.",
      answer: false,
      explain: "That only works for an orthogonal basis. For v₁ = (1, 0), v₂ = (1, 1) and V = ℝ², proj_V x should be x, but the sum of the two line projections of x = (1, 0) is (1, 0) + (½, ½) ≠ x.",
    },
    {
      type: "mc", lec: [11],
      q: "P is the matrix of the projection onto a 2-dimensional subspace V of ℝ⁵. What is rank(P)?",
      options: ["5", "3", "2", "0"],
      answer: 2,
      explain: "im(P) = V, which is 2-dimensional. (Its kernel V⊥ is 3-dimensional, and 2 + 3 = 5.)",
    },
    {
      type: "tf", lec: [11],
      q: "True or false: for a projection matrix P, P² = P.",
      answer: true,
      explain: "Px is already in V, and projecting a vector of V does nothing.",
    },
    {
      type: "mc", lec: [11],
      q: "Which list is orthonormal?",
      options: [set(V("1/√2", "1/√2"), V("1/√2", "−1/√2")), set(V(1, 1), V(1, -1)), set(V(1, 0), V(1, 1)), set(V("1/2", "1/2"), V("1/2", "−1/2"))],
      answer: 0,
      explain: "Perpendicular (½ − ½ = 0) and each has length √(½ + ½) = 1. (1, 1), (1, −1) are orthogonal but have length √2. ½(1, 1) has length √2/2 ≠ 1.",
    },
  ],
});
})();
