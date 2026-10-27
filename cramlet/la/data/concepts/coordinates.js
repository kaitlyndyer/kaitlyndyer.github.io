(function () {
"use strict";
const { M, V, set } = LA;

registerConcept({
  id: "coordinates",
  oneLiner:
    "If B = (v<sub>1</sub>, …, v<sub>m</sub>) is a basis of V, every x in V is <b>x = c<sub>1</sub>v<sub>1</sub> + … + c<sub>m</sub>v<sub>m</sub></b> in exactly one way. The coefficients form <b>[x]<sub>B</sub></b>, and <b>x = S[x]<sub>B</sub></b>, where S = [v<sub>1</sub> … v<sub>m</sub>].",

  related: ["b-matrix", "basis-dimension", "independence"],

  summary: {
    keyPoints: [
      { lec: [8], kind: "key", html: "<b>[x]<sub>B</sub> = (c<sub>1</sub>, …, c<sub>m</sub>)</b> means <b>x = c<sub>1</sub>v<sub>1</sub> + … + c<sub>m</sub>v<sub>m</sub></b>. It’s x’s “address” in the B grid." },
      { lec: [8], kind: "key", html: "<b>x = S[x]<sub>B</sub></b>, with S = [v<sub>1</sub> … v<sub>m</sub>] (basis vectors as columns)." },
      { lec: [9], html: "To <b>find</b> [x]<sub>B</sub>: solve S c = x (row reduce [S | x]). If B is a basis of all of ℝ<sup>n</sup>, S is invertible and <b>[x]<sub>B</sub> = S<sup>−1</sup>x</b>." },
      { lec: [9], html: "To go <b>back</b> from [x]<sub>B</sub> to x: just multiply, x = S[x]<sub>B</sub>. No solving needed." },
      { lec: [9], kind: "warn", html: "If B is a basis of a <b>subspace</b> V (like a plane in ℝ<sup>3</sup>), S isn’t square and has no inverse: row reduce [S | x]. If the system is inconsistent, <b>x ∉ V</b> and [x]<sub>B</sub> doesn’t exist." },
      { lec: [9], html: "[x]<sub>B</sub> has <b>m</b> entries (m = dim V), even if x has n entries. A vector on a plane in ℝ<sup>3</sup> has 2 coordinates." },
      { lec: [8], html: "Coordinates are linear: [x + y]<sub>B</sub> = [x]<sub>B</sub> + [y]<sub>B</sub> and [kx]<sub>B</sub> = k[x]<sub>B</sub>. For the standard basis E, [x]<sub>E</sub> = x." },
    ],
  },

  details: [
    {
      id: "idea",
      title: "The idea: a new grid",
      lec: [8],
      html: `
        <p>The usual coordinates of x = (5, 3) say “5 steps along e<sub>1</sub>, 3 steps along e<sub>2</sub>.” With a different basis, the grid lines run along the new basis vectors, and the same point gets a different address.</p>
        <p>Basis B = (v<sub>1</sub>, v<sub>2</sub>) = (${V(2, 1)}, ${V(1, 1)}). Since 2v<sub>1</sub> + 1v<sub>2</sub> = (4 + 1, 2 + 1) = (5, 3),</p>
        <div class="mrow">[x]<sub>B</sub> = ${V(2, 1)} &nbsp; for x = ${V(5, 3)}.</div>
        <p>The axes don’t have to be perpendicular. Oblique grids work just as well.</p>`,
    },
    {
      id: "find-rn",
      title: "Finding [x]_B when B is a basis of ℝⁿ",
      lec: [9],
      html: `
        <p>Since x = S[x]<sub>B</sub> and S is invertible, <b>[x]<sub>B</sub> = S<sup>−1</sup>x</b>.</p>
        <div class="mrow">S = ${M([[2, 1], [1, 1]])}, &nbsp; S<sup>−1</sup> = 1/(2·1 − 1·1) ${M([[1, -1], [-1, 2]])} = ${M([[1, -1], [-1, 2]])}, &nbsp; S<sup>−1</sup>${V(5, 3)} = ${V(2, 1)} ✓</div>
        <p>Or skip the inverse and row reduce [S | x]. For a one-off vector that’s usually less work. Both ways appear in the notes (Lesson 12, Example 1).</p>
        <p class="callout tip">First, explain <b>why B is a basis</b> (tests often ask): “S is 2×2 with det(S) = 1 ≠ 0 (or rref(S) = I<sub>2</sub>), so S is invertible, so its columns form a basis of ℝ<sup>2</sup>.”</p>`,
    },
    {
      id: "find-subspace",
      title: "Coordinates on a plane (B a basis of a subspace)",
      lec: [9],
      html: `
        <p>V = span(v<sub>1</sub>, v<sub>2</sub>) with v<sub>1</sub> = ${V(1, 0, 1)}, v<sub>2</sub> = ${V(0, 1, 2)}, a plane in ℝ<sup>3</sup>. Is x = ${V(3, -1, 1)} in V, and if so what is [x]<sub>B</sub>?</p>
        <div class="mrow">${M([[1, 0, 3], [0, 1, -1], [1, 2, 1]], { aug: 2 })} → (R<sub>3</sub> − R<sub>1</sub> − 2R<sub>2</sub>) ${M([[1, 0, 3], [0, 1, -1], [0, 0, 0]], { aug: 2 })}</div>
        <p>Consistent, so x ∈ V, with c<sub>1</sub> = 3, c<sub>2</sub> = −1: <b>[x]<sub>B</sub> = (3, −1)</b>, two entries. Check: 3(1, 0, 1) − (0, 1, 2) = (3, −1, 1) ✓.</p>
        <p>Now y = (1, 1, 1): the first two entries force c<sub>1</sub> = 1, c<sub>2</sub> = 1, but then the third entry is 1 + 2 = 3 ≠ 1. The system is inconsistent, so <b>y ∉ V</b> and [y]<sub>B</sub> does not exist.</p>
        <p class="callout warn">Don’t answer “[y]<sub>B</sub> = (1, 1).” That vector is 1v<sub>1</sub> + 1v<sub>2</sub> = (1, 1, 3), not y. Always check the last equation.</p>`,
    },
    {
      id: "reverse",
      title: "Going backward: from [x]_B to x",
      lec: [9],
      html: `
        <p>This direction is just multiplication. For the plane basis above, if [x]<sub>B</sub> = (2, −3), then</p>
        <div class="mrow">x = 2${V(1, 0, 1)} − 3${V(0, 1, 2)} = ${V(2, -3, -4)}.</div>
        <p class="callout tip">A harder version: “find a basis B with [x]<sub>B</sub> = (…) for a given x.” Write x = S[x]<sub>B</sub> with S’s columns unknown, and choose them to make it work. (There’s a problem like this in the practice exam bank.)</p>`,
    },
    {
      id: "standard-matrix",
      title: "Where coordinates are heading",
      lec: [9, 10],
      html: `
        <p>Your teacher’s Lecture 3 already had a special case: the <b>standard matrix</b> of T is A = [T(e<sub>1</sub>) … T(e<sub>n</sub>)], because [x]<sub>E</sub> = x for the standard basis E.</p>
        <p>The B-matrix asks the same question in the new grid: if I know x’s B-address, what is T(x)’s B-address? That’s the next concept.</p>`,
    },
  ],

  flashcards: [
    { front: "[x]_B = (c₁, …, c_m) means…", back: "x = c₁v₁ + … + c_m v_m." },
    { front: "x in terms of [x]_B", back: "x = S[x]_B, where S = [v₁ … v_m] (basis vectors as columns)." },
    { front: "[x]_B when B is a basis of ℝⁿ", back: "S⁻¹x (or row reduce [S | x])." },
    { front: "How many entries does [x]_B have if B is a basis of a plane in ℝ³?", back: "2, one per basis vector." },
    { front: "[S | x] is inconsistent. What does that tell you?", back: "x is not in V = span(B), so [x]_B doesn’t exist." },
    { front: "[x]_E for the standard basis E", back: "x itself." },
    { front: "Linearity of coordinates", back: "[x + y]_B = [x]_B + [y]_B and [kx]_B = k[x]_B." },
  ],

  quiz: [
    {
      type: "mc", lec: [9],
      q: `B = (${V(1, 1)}, ${V(1, -1)}). What is [x]<sub>B</sub> for x = ${V(4, 2)}?`,
      options: [V(3, 1), V(1, 3), V(4, 2), V(6, 2)],
      answer: 0,
      explain: "3(1, 1) + 1(1, −1) = (4, 2) ✓.",
    },
    {
      type: "mc", lec: [9],
      q: `B = (${V(1, 2, 0)}, ${V(0, 1, 1)}) is a basis of a plane V. If [x]<sub>B</sub> = ${V(3, -2)}, what is x?`,
      options: [V(3, 4, -2), V(3, -2, 0), V(3, 8, 2), V(1, 0, -2)],
      answer: 0,
      explain: "x = 3(1, 2, 0) − 2(0, 1, 1) = (3, 6 − 2, −2) = (3, 4, −2).",
    },
    {
      type: "tf", lec: [9],
      q: "True or false: if B is a basis of a 2-dimensional subspace V of ℝ⁴, then [x]_B has 4 entries.",
      answer: false,
      explain: "[x]_B has one entry per basis vector: 2 entries.",
    },
    {
      type: "mc", lec: [9],
      q: `B = (${V(1, 0, 1)}, ${V(0, 1, 1)}), V = span(B). Which vector is <b>not</b> in V?`,
      options: [V(1, 1, 2), V(2, -1, 1), V(1, 1, 1), V(0, 0, 0)],
      answer: 2,
      explain: "Any vector in V is (a, b, a + b). (1, 1, 1) would need third entry 1 + 1 = 2.",
    },
    {
      type: "tf", lec: [8],
      q: "True or false: if B is a basis of V, every x in V has exactly one coordinate vector [x]_B.",
      answer: true,
      explain: "That’s Theorem 3.2.10: a basis gives a unique representation.",
    },
    {
      type: "mc", lec: [9],
      q: "S = [v₁ v₂ v₃] is invertible. Which formula gives [x]_B?",
      options: ["Sx", "S⁻¹x", "xS", "Sᵀx"],
      answer: 1,
      explain: "x = S[x]_B, so [x]_B = S⁻¹x.",
    },
  ],
});
})();
