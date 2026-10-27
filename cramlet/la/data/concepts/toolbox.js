(function () {
"use strict";
const { M, V, set } = LA;

registerConcept({
  id: "toolbox",
  oneLiner:
    "The Test 1 skills every Test 2 problem runs on: <b>row reducing to rref</b>, reading off <b>rank</b> and the number of solutions, <b>inverses</b>, and the <b>matrix of a linear transformation</b>.",

  related: ["kernel-image", "basis-dimension", "b-matrix"],

  summary: {
    keyPoints: [
      { lec: [1], html: "<b>Row operations:</b> multiply a row by a nonzero number, add a multiple of one row to another, swap two rows. They don’t change the solutions of a system." },
      { lec: [1], html: "<b>rref:</b> every pivot is 1, each pivot is the only nonzero entry in its column, pivots move right as you go down, zero rows at the bottom." },
      { lec: [2], kind: "key", html: "<b>rank(A)</b> = number of pivots in rref(A). Always rank ≤ number of rows and ≤ number of columns." },
      { lec: [2], html: "Ax = b is <b>inconsistent</b> ⇔ rref[A | b] has a row (0 … 0 | nonzero). If consistent: <b>unique</b> solution when rank = number of variables, otherwise <b>infinitely many</b>." },
      { lec: [4, 5], kind: "key", html: "<b>Inverse:</b> row reduce [A | I]. If you reach [I | B], then A<sup>−1</sup> = B; otherwise A isn’t invertible. 2×2: [[a, b], [c, d]]<sup>−1</sup> = 1/(ad − bc) [[d, −b], [−c, a]]." },
      { lec: [3], html: "<b>Matrix of T:</b> A = [T(e<sub>1</sub>) … T(e<sub>n</sub>)]. T is linear ⇔ T(v + w) = T(v) + T(w) and T(kv) = kT(v)." },
      { lec: [4], html: "(AB)<sup>−1</sup> = B<sup>−1</sup>A<sup>−1</sup>. Matrix multiplication isn’t commutative: AB ≠ BA in general. If AB = I for square A, B, then BA = I too." },
    ],
  },

  details: [
    {
      id: "rref",
      title: "Gauss–Jordan elimination, step by step",
      lec: [1, 2],
      html: `
        <ol>
          <li>Find the leftmost column that isn’t all zeros. Swap a nonzero entry to the top if needed.</li>
          <li>Scale that row so the pivot is 1.</li>
          <li>Clear <b>every other entry</b> in that column (above and below) by adding multiples of the pivot row.</li>
          <li>Cover that row and repeat on the rows below.</li>
        </ol>
        <p class="callout tip">On the test, write each operation next to the row (R<sub>2</sub> − 2R<sub>1</sub>), like your teacher does. It makes mistakes easy to find and earns partial credit.</p>
        <p class="callout warn">Avoid fractions as long as you can: clear entries with whole-number multiples first, and divide to make the pivot 1 at the end.</p>`,
    },
    {
      id: "rank-solutions",
      title: "Rank and the number of solutions",
      lec: [2],
      html: `
        <p>Your teacher’s list (Lecture 2, properties A–G) for an m×n system Ax = b (m equations, n variables):</p>
        <ul>
          <li>rank(A) ≤ m and rank(A) ≤ n.</li>
          <li>Inconsistent ⇒ rank(A) &lt; m. (So rank = m ⇒ always consistent.)</li>
          <li>Exactly one solution ⇒ rank(A) = n. (rank &lt; n ⇒ none or infinitely many.)</li>
          <li>Fewer equations than unknowns (m &lt; n) ⇒ no solutions or infinitely many.</li>
          <li>n×n system: unique solution ⇔ rank(A) = n.</li>
        </ul>
        <p class="callout warn">Your teacher noted the book uses m and n the other way around on pp. 26–27. Don’t memorize letters: “rank = number of <b>columns</b>” means no free variables, and “rank = number of <b>rows</b>” means no zero rows.</p>`,
    },
    {
      id: "inverse",
      title: "Finding an inverse",
      lec: [4, 5],
      html: `
        <p><b>Teacher’s example:</b> A = ${M([[1, 1, 1], [2, 3, 2], [3, 8, 2]])}. Row reduce [A | I<sub>3</sub>]:</p>
        <div class="mrow">${M([[1, 1, 1, 1, 0, 0], [2, 3, 2, 0, 1, 0], [3, 8, 2, 0, 0, 1]], { aug: 3 })} → … → ${M([[1, 0, 0, 10, -6, 1], [0, 1, 0, -2, 1, 0], [0, 0, 1, -7, 5, -1]], { aug: 3 })}</div>
        <p>So A<sup>−1</sup> = ${M([[10, -6, 1], [-2, 1, 0], [-7, 5, -1]])}. Check: AA<sup>−1</sup> = I.</p>
        <p><b>2×2 shortcut:</b> ${M([[3, 5], [1, 2]])}<sup>−1</sup> = 1/(6 − 5) ${M([[2, -5], [-1, 3]])} = ${M([[2, -5], [-1, 3]])}. If ad − bc = 0, there’s no inverse.</p>
        <p class="callout key">You’ll need inverses on Test 2 for S<sup>−1</sup> in [x]<sub>B</sub> = S<sup>−1</sup>x and B = S<sup>−1</sup>AS. Most test problems use 2×2 S, so the shortcut is worth knowing cold.</p>`,
    },
    {
      id: "transformations",
      title: "Matrices of linear transformations",
      lec: [3],
      html: `
        <p>The columns of the standard matrix are the images of the standard vectors: A = [T(e<sub>1</sub>) T(e<sub>2</sub>) … T(e<sub>n</sub>)].</p>
        <ul>
          <li><b>Rotation</b> by θ (counterclockwise): ${M([["cos θ", "−sin θ"], ["sin θ", "cos θ"]])}</li>
          <li><b>Projection</b> onto the line spanned by unit u = (u<sub>1</sub>, u<sub>2</sub>): ${M([["u₁²", "u₁u₂"], ["u₁u₂", "u₂²"]])}</li>
          <li><b>Reflection</b> about that line: 2P − I, of the form ${M([["a", "b"], ["b", "−a"]])} with a² + b² = 1.</li>
          <li><b>Scaling</b> by k: kI. <b>Shears:</b> ${M([[1, "k"], [0, 1]])} and ${M([[1, 0], ["k", 1]])}.</li>
        </ul>
        <p>A map with a constant term, like T(x<sub>1</sub>, x<sub>2</sub>) = (x<sub>1</sub> + 1, x<sub>2</sub>), is <b>not</b> linear: T(0) ≠ 0.</p>`,
    },
  ],

  flashcards: [
    { front: "rank(A)", back: "Number of pivots (leading 1s) in rref(A)." },
    { front: "When is Ax = b inconsistent?", back: "When rref[A | b] has a row 0 … 0 | k with k ≠ 0." },
    { front: "Unique solution ⇔ (for a consistent system)", back: "rank(A) = number of variables (no free variables)." },
    { front: "Inverse of [[a, b], [c, d]]", back: "1/(ad − bc) · [[d, −b], [−c, a]], when ad − bc ≠ 0." },
    { front: "How to find A⁻¹ in general", back: "Row reduce [A | I]. If you get [I | B], A⁻¹ = B." },
    { front: "(AB)⁻¹", back: "B⁻¹A⁻¹ (reverse order)." },
    { front: "Columns of the standard matrix of T", back: "T(e₁), T(e₂), …, T(eₙ)." },
  ],

  quiz: [
    {
      type: "mc", lec: [2],
      q: "A 3×5 system Ax = b is consistent and rank(A) = 3. How many solutions?",
      options: ["Exactly one", "Infinitely many", "None", "Exactly two"],
      answer: 1,
      explain: "5 variables, 3 pivots: 2 free variables, so infinitely many.",
    },
    {
      type: "mc", lec: [5],
      q: `What is ${M([[4, 3], [1, 1]])}<sup>−1</sup>?`,
      options: [M([[1, -3], [-1, 4]]), M([[1, 3], [1, 4]]), M([[4, -3], [-1, 1]]), M([[-1, 3], [1, -4]])],
      answer: 0,
      explain: "ad − bc = 4 − 3 = 1, so the inverse is [[d, −b], [−c, a]] = [[1, −3], [−1, 4]].",
    },
    {
      type: "tf", lec: [2],
      q: "True or false: a system with fewer equations than unknowns can have exactly one solution.",
      answer: false,
      explain: "rank ≤ number of equations < number of unknowns, so there’s a free variable: none or infinitely many.",
    },
    {
      type: "tf", lec: [4],
      q: "True or false: for n×n matrices, (AB)⁻¹ = A⁻¹B⁻¹.",
      answer: false,
      explain: "(AB)⁻¹ = B⁻¹A⁻¹. Check: (AB)(B⁻¹A⁻¹) = A(BB⁻¹)A⁻¹ = I.",
    },
    {
      type: "mc", lec: [3],
      q: "T(e₁) = (2, 0, 1) and T(e₂) = (−1, 3, 4). What is T(3, 2)?",
      options: ["(4, 6, 11)", "(6, 0, 3)", "(5, 6, 7)", "(1, 3, 5)"],
      answer: 0,
      explain: "T(3e₁ + 2e₂) = 3(2, 0, 1) + 2(−1, 3, 4) = (6 − 2, 0 + 6, 3 + 8) = (4, 6, 11).",
    },
  ],
});
})();
