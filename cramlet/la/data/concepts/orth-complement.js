(function () {
"use strict";
const { M, V, set } = LA;

registerConcept({
  id: "orth-complement",
  oneLiner:
    "V<sup>⊥</sup> (“V perp”) is every vector <b>perpendicular to all of V</b>. To find it, put a spanning set of V in the <b>rows</b> of a matrix and take the <b>kernel</b>. Then dim V + dim V<sup>⊥</sup> = n.",

  related: ["projections", "basis-dimension", "kernel-image"],

  summary: {
    keyPoints: [
      { lec: [11], html: "v and w are <b>orthogonal</b> (perpendicular) if <b>v · w = 0</b>. Length: ‖v‖ = √(v · v)." },
      { lec: [7, 11], html: "<b>V<sup>⊥</sup> = { x ∈ ℝ<sup>n</sup> : x · v = 0 for every v in V }.</b> It’s always a subspace." },
      { lec: [11], kind: "key", html: "x is perpendicular to all of V ⇔ x is perpendicular to each vector in a <b>spanning set</b> (or basis) of V. So if V = span(v<sub>1</sub>, …, v<sub>k</sub>), then <b>V<sup>⊥</sup> = ker(A)</b>, where A has rows v<sub>1</sub>, …, v<sub>k</sub>." },
      { lec: [11], kind: "key", html: "<b>dim V + dim V<sup>⊥</sup> = n</b>, &nbsp; <b>V ∩ V<sup>⊥</sup> = {0}</b>, &nbsp; <b>(V<sup>⊥</sup>)<sup>⊥</sup> = V</b>." },
      { lec: [11], html: "A basis of V plus a basis of V<sup>⊥</sup> is a <b>basis of ℝ<sup>n</sup></b>. That’s the fastest way to extend either one to a basis of ℝ<sup>n</sup>." },
      { lec: [7], html: "Plane ax + by + cz = 0 in ℝ<sup>3</sup>: its ⊥ is the line spanned by the normal (a, b, c). A line in ℝ<sup>3</sup>: its ⊥ is a plane." },
      { lec: [11], kind: "warn", html: "V ∩ W = {0} does <b>not</b> mean W = V<sup>⊥</sup>. Two different lines in ℝ<sup>3</sup> meet only at 0, and neither is the other’s ⊥ (that would be a plane)." },
    ],
  },

  details: [
    {
      id: "dot",
      title: "Dot products, length, and orthogonality",
      lec: [2, 11],
      html: `
        <p>v · w = v<sub>1</sub>w<sub>1</sub> + v<sub>2</sub>w<sub>2</sub> + … + v<sub>n</sub>w<sub>n</sub>. Two vectors are <b>orthogonal</b> if v · w = 0. The <b>length</b> is ‖v‖ = √(v · v), and a <b>unit vector</b> has length 1. To make one, divide by the length: u = v / ‖v‖.</p>
        <p>Example: (1, 2, 2) · (2, 1, −2) = 2 + 2 − 4 = 0, so they’re orthogonal. ‖(1, 2, 2)‖ = √9 = 3.</p>
        <p class="callout tip">0 is orthogonal to every vector, including itself. It’s the only vector orthogonal to itself (v · v = ‖v‖² = 0 forces v = 0).</p>`,
    },
    {
      id: "find-perp",
      title: "Finding a basis of V⊥",
      lec: [7, 11],
      html: `
        <ol>
          <li>Write V as a span: V = span(v<sub>1</sub>, …, v<sub>k</sub>).</li>
          <li>Make the matrix A with v<sub>1</sub>, …, v<sub>k</sub> as its <b>rows</b>. Then Ax = (v<sub>1</sub> · x, …, v<sub>k</sub> · x).</li>
          <li>V<sup>⊥</sup> = ker(A). Find a kernel basis the usual way.</li>
        </ol>
        <p><b>Example.</b> V = span${set(V(1, 1, 1, 0), V(0, 1, 2, 1))} in ℝ<sup>4</sup>.</p>
        <div class="mrow">${M([[1, 1, 1, 0], [0, 1, 2, 1]])} → (R<sub>1</sub> − R<sub>2</sub>) ${M([[1, 0, -1, -1], [0, 1, 2, 1]])}</div>
        <p>x<sub>3</sub> = s, x<sub>4</sub> = t free; x<sub>1</sub> = s + t, x<sub>2</sub> = −2s − t.</p>
        <div class="mrow">V<sup>⊥</sup> = span${set(V(1, -2, 1, 0), V(1, -1, 0, 1))}, &nbsp; dim V<sup>⊥</sup> = 2 = 4 − 2 ✓</div>
        <p class="callout try"><b>Check by dotting:</b> (1, −2, 1, 0) · (1, 1, 1, 0) = 1 − 2 + 1 = 0 and (1, −2, 1, 0) · (0, 1, 2, 1) = −2 + 2 = 0. ✓ Do the same for the other vector. Four dot products, thirty seconds, and you know the answer is right.</p>`,
    },
    {
      id: "properties",
      title: "The four properties (Theorem 5.1.8)",
      lec: [11],
      html: `
        <p>For any subspace V of ℝ<sup>n</sup>:</p>
        <ol type="a">
          <li><b>V<sup>⊥</sup> is a subspace</b> (it’s a kernel).</li>
          <li><b>V ∩ V<sup>⊥</sup> = {0}</b>: a vector in both is perpendicular to itself, so it’s 0.</li>
          <li><b>dim V + dim V<sup>⊥</sup> = n</b> (rank–nullity for the matrix whose rows are a basis of V).</li>
          <li><b>(V<sup>⊥</sup>)<sup>⊥</sup> = V</b>. So a basis of (V<sup>⊥</sup>)<sup>⊥</sup> is just a basis of V. No computing needed.</li>
        </ol>
        <p class="callout tip">Use (c) as a check: in the example, dim V = 2 and you should get exactly 4 − 2 = 2 vectors for V<sup>⊥</sup>.</p>`,
    },
    {
      id: "extend",
      title: "A basis of ℝⁿ from V and V⊥ (and why it works)",
      lec: [11],
      html: `
        <p>Put a basis of V and a basis of V<sup>⊥</sup> together. In the example, that’s</p>
        <div class="mrow">${set(V(1, 1, 1, 0), V(0, 1, 2, 1), V(1, -2, 1, 0), V(1, -1, 0, 1))}</div>
        <p><b>Why it’s a basis of ℝ<sup>4</sup> (write this on the test):</b> there are 2 + 2 = 4 = n vectors, so it’s enough to show they’re independent. Suppose a relation (part from V) + (part from V<sup>⊥</sup>) = 0. Then v = −w is in both V and V<sup>⊥</sup>, so it’s 0. Each part is 0, and each basis is independent, so all coefficients are 0. Four independent vectors in ℝ<sup>4</sup> form a basis.</p>
        <p>(Or: put them in a 4×4 matrix and show rref = I<sub>4</sub>.)</p>`,
    },
    {
      id: "as-kernel",
      title: "Using V⊥ to write V as a kernel",
      lec: [11],
      html: `
        <p>Since V = (V<sup>⊥</sup>)<sup>⊥</sup>, a vector x is in V exactly when it’s perpendicular to every basis vector of V<sup>⊥</sup>. So <b>V = ker(B)</b>, where B has a basis of V<sup>⊥</sup> as its rows.</p>
        <div class="mrow">In the example: V = ker${M([[1, -2, 1, 0], [1, -1, 0, 1]])}.</div>
        <p>This is how you show “for every matrix A there’s a B with im(A) = ker(B)”: take the rows of B to be a basis of im(A)<sup>⊥</sup>.</p>`,
    },
  ],

  flashcards: [
    { front: "V⊥", back: "All x in ℝⁿ with x · v = 0 for every v in V." },
    { front: "How do you compute V⊥ for V = span(v₁, …, v_k)?", back: "V⊥ = ker(A), where the rows of A are v₁, …, v_k." },
    { front: "dim V + dim V⊥ = ?", back: "n (V is a subspace of ℝⁿ)." },
    { front: "V ∩ V⊥ = ?", back: "{0}: a vector in both is orthogonal to itself." },
    { front: "(V⊥)⊥ = ?", back: "V." },
    { front: "The ⊥ of the plane 2x − y + 3z = 0", back: "The line spanned by the normal vector (2, −1, 3)." },
    { front: "Fast basis of ℝⁿ containing a basis of V", back: "Basis of V together with a basis of V⊥." },
    { front: "If V ∩ W = {0}, is W = V⊥?", back: "Not necessarily. Two lines in ℝ³ meet only at 0, but V⊥ of a line is a plane." },
  ],

  quiz: [
    {
      type: "mc", lec: [11],
      q: "L is a line through 0 in ℝ⁵. What is dim L⊥?",
      options: ["1", "4", "5", "0"],
      answer: 1,
      explain: "dim L + dim L⊥ = 5, and dim L = 1.",
    },
    {
      type: "mc", lec: [11],
      q: `V = span${set(V(1, 0, 2), V(0, 1, -1))}. Which vector spans V<sup>⊥</sup>?`,
      options: [V(-2, 1, 1), V(1, 1, 1), V(2, 1, -1), V(1, 0, 2)],
      answer: 0,
      explain: "(−2, 1, 1) · (1, 0, 2) = −2 + 2 = 0 and (−2, 1, 1) · (0, 1, −1) = 1 − 1 = 0. dim V⊥ = 3 − 2 = 1, so one vector spans it.",
    },
    {
      type: "tf", lec: [11],
      q: "True or false: if V is a line and W is a plane through 0 in ℝ³ with V ∩ W = {0}, then W = V⊥.",
      answer: false,
      explain: "W only has to avoid V, not be perpendicular to it. V = the x-axis and W = the plane x = z meet only at 0, but V⊥ is the plane x = 0.",
    },
    {
      type: "tf", lec: [11],
      q: "True or false: for every subspace V of ℝⁿ, V⊥ is a subspace.",
      answer: true,
      explain: "V⊥ is the kernel of the matrix whose rows span V (and 0 is in it, sums and multiples of perpendicular vectors stay perpendicular).",
    },
    {
      type: "mc", lec: [11],
      q: "V is a 3-dimensional subspace of ℝ⁵. A basis of (V⊥)⊥ has how many vectors?",
      options: ["2", "3", "5", "0"],
      answer: 1,
      explain: "(V⊥)⊥ = V, so it’s 3-dimensional.",
    },
    {
      type: "tf", lec: [11],
      q: "True or false: if x is perpendicular to v₁ and v₂, then x is perpendicular to every vector in span(v₁, v₂).",
      answer: true,
      explain: "x · (av₁ + bv₂) = a(x · v₁) + b(x · v₂) = 0. That’s why you only need to check a spanning set.",
    },
  ],
});
})();
