(function () {
"use strict";
const { M, V, set } = LA;

registerConcept({
  id: "independence",
  oneLiner:
    "Vectors are <b>linearly independent</b> when none of them is <b>redundant</b> (a combination of the others). Equivalently: the only way to combine them into <b>0</b> is with all coefficients 0, so the matrix with them as columns has kernel {0}.",

  related: ["kernel-image", "basis-dimension", "subspaces"],

  summary: {
    keyPoints: [
      { lec: [6], html: "<b>Span</b>(v<sub>1</sub>, …, v<sub>m</sub>) = all linear combinations c<sub>1</sub>v<sub>1</sub> + … + c<sub>m</sub>v<sub>m</sub>. It’s always a subspace." },
      { lec: [6], html: "v<sub>i</sub> is <b>redundant</b> if it’s a combination of the vectors before it. The list is <b>independent</b> if no vector is redundant." },
      { lec: [7], html: "A <b>linear relation</b> is c<sub>1</sub>v<sub>1</sub> + … + c<sub>m</sub>v<sub>m</sub> = 0. The trivial one (all c<sub>i</sub> = 0) always exists. <b>Dependent ⇔ there’s a nontrivial relation.</b>" },
      { lec: [7], kind: "key", html: "<b>Test:</b> put the vectors in the columns of A. Independent ⇔ <b>ker(A) = {0}</b> ⇔ <b>rank(A) = m</b> (a pivot in every column). Any kernel vector of A is a relation." },
      { lec: [7], kind: "warn", html: "More than n vectors in ℝ<sup>n</sup> are always dependent (at most n pivots). So any 4 vectors in ℝ<sup>3</sup>, or the columns of any 3×6 matrix, are dependent." },
      { lec: [7], html: "Shortcuts: a list containing <b>0</b> is dependent. Two vectors are dependent ⇔ one is a multiple of the other. Nonzero <b>orthogonal</b> vectors are independent." },
      { lec: [7], html: "<b>Zero-components trick:</b> if each vector has a nonzero entry where all the earlier ones have 0, they’re independent (no row reducing needed)." },
    ],
  },

  details: [
    {
      id: "span",
      title: "Span",
      lec: [5, 6],
      html: `
        <p>The <b>span</b> of v<sub>1</sub>, …, v<sub>m</sub> is the set of all their linear combinations. Asking “is b in span(v<sub>1</sub>, …, v<sub>m</sub>)?” is the same as asking “does [v<sub>1</sub> … v<sub>m</sub>] x = b have a solution?”</p>
        <p><b>Teacher’s example (Lecture 2):</b> is ${V(1, 1, 1)} a combination of ${V(1, 2, 3)} and ${V(4, 5, 6)}? Row reduce the augmented matrix:</p>
        <div class="mrow">${M([[1, 4, 1], [2, 5, 1], [3, 6, 1]], { aug: 2 })} → ${M([[1, 0, "−1/3"], [0, 1, "1/3"], [0, 0, 0]], { aug: 2 })}</div>
        <p>Consistent, so yes: b = −⅓v<sub>1</sub> + ⅓v<sub>2</sub>.</p>`,
    },
    {
      id: "redundant",
      title: "Redundant vectors and independence",
      lec: [6, 7],
      html: `
        <p>Go through the list left to right. A vector is <b>redundant</b> if it’s already in the span of the ones before it. Throwing it out doesn’t change the span.</p>
        <div class="mrow">v<sub>1</sub> = ${V(1, 2, 0, 1)}, v<sub>2</sub> = ${V(0, 1, 1, 1)}, v<sub>3</sub> = ${V(2, 5, 1, 3)}</div>
        <p>v<sub>3</sub> = 2v<sub>1</sub> + v<sub>2</sub>, so v<sub>3</sub> is redundant and the list is <b>dependent</b>. The relation is 2v<sub>1</sub> + v<sub>2</sub> − v<sub>3</sub> = 0, so ${V(2, 1, -1)} is in the kernel of [v<sub>1</sub> v<sub>2</sub> v<sub>3</sub>].</p>
        <p class="callout key">Three ways to say the same thing (Summary 3.2.9):<br>
        independent ⇔ no vector is redundant ⇔ <b>only the trivial relation</b> ⇔ <b>ker[v<sub>1</sub> … v<sub>m</sub>] = {0}</b> ⇔ <b>rank = m</b>.</p>`,
    },
    {
      id: "test",
      title: "How to test independence (and write it up)",
      lec: [7],
      html: `
        <ol>
          <li>Make the matrix A = [v<sub>1</sub> v<sub>2</sub> … v<sub>m</sub>] with the vectors as columns.</li>
          <li>Row reduce.</li>
          <li><b>Pivot in every column</b> ⇒ rank(A) = m ⇒ ker(A) = {0} ⇒ independent.</li>
          <li>A free variable ⇒ a nonzero kernel vector ⇒ a nontrivial relation ⇒ dependent. The non-pivot columns are the redundant vectors.</li>
        </ol>
        <p class="callout tip">On a “prove they’re independent” question, write the conclusion as a sentence: “rref(A) has a pivot in each of its 3 columns, so rank(A) = 3 = number of vectors, so ker(A) = {0}, so the only relation is the trivial one. Hence v<sub>1</sub>, v<sub>2</sub>, v<sub>3</sub> are linearly independent.”</p>
        <p class="callout warn">Use the vectors as <b>columns</b>. If you put them in rows, the rank tells you the same yes/no, but you can’t read off the relation or which vectors are redundant.</p>`,
    },
    {
      id: "parameters",
      title: "Independence with a parameter",
      lec: [7],
      html: `
        <p>When a vector has an unknown like k in it, row reduce anyway, keeping k as a letter. The answer depends on whether some expression in k is zero.</p>
        <div class="mrow">For which k are ${V(1, 1, 0)}, ${V(2, 3, 1)}, ${V(0, 1, "k")} independent?</div>
        <div class="mrow">${M([[1, 2, 0], [1, 3, 1], [0, 1, "k"]])} → (R<sub>2</sub> − R<sub>1</sub>) ${M([[1, 2, 0], [0, 1, 1], [0, 1, "k"]])} → (R<sub>3</sub> − R<sub>2</sub>) ${M([[1, 2, 0], [0, 1, 1], [0, 0, "k − 1"]])}</div>
        <p>If k − 1 ≠ 0, the third column has a pivot: <b>independent for every k ≠ 1</b>. If k = 1, column 3 is free, so they’re dependent. Here v<sub>3</sub> = −2v<sub>1</sub> + v<sub>2</sub> (check: (−2 + 2, −2 + 3, 0 + 1) = (0, 1, 1) ✓).</p>
        <p class="callout warn">Don’t divide a row by an expression like k − 1 without saying “assuming k ≠ 1.” That’s exactly the case you need to look at separately.</p>`,
    },
    {
      id: "zero-components",
      title: "The zero-components shortcut",
      lec: [7],
      html: `
        <p>Theorem 3.2.5: if v<sub>1</sub> ≠ 0, and each later vector has a nonzero entry in a spot where all the earlier vectors have 0, the vectors are independent.</p>
        <div class="mrow">${V(1, 0, 0, 5)}, ${V(3, 2, 0, 0)}, ${V(7, 1, 4, 0)}: the 2nd has a nonzero 2nd entry (1st has 0 there); the 3rd has a nonzero 3rd entry (both earlier ones have 0). Independent.</div>
        <p>This is exactly why kernel basis vectors from free variables are always independent: each has a 1 in its own free-variable slot.</p>`,
    },
    {
      id: "orthogonal",
      title: "Orthogonal vectors are independent",
      lec: [11],
      html: `
        <p>If v<sub>1</sub>, …, v<sub>m</sub> are <b>nonzero</b> and v<sub>i</sub> · v<sub>j</sub> = 0 for i ≠ j, they’re independent. Proof: dot both sides of c<sub>1</sub>v<sub>1</sub> + … + c<sub>m</sub>v<sub>m</sub> = 0 with v<sub>i</sub>. Every term dies except c<sub>i</sub>(v<sub>i</sub> · v<sub>i</sub>) = c<sub>i</sub>‖v<sub>i</sub>‖<sup>2</sup> = 0, and ‖v<sub>i</sub>‖ ≠ 0, so c<sub>i</sub> = 0.</p>
        <p class="callout warn">“Nonzero” matters. If v · w = 0, {v, w} could still be dependent, because w = 0 has w · v = 0 for every v. That’s a classic true/false trap.</p>`,
    },
    {
      id: "new-from-old",
      title: "Building new independent lists from old ones",
      lec: [7],
      html: `
        <p>Suppose v<sub>1</sub>, v<sub>2</sub>, v<sub>3</sub> are independent. Are v<sub>1</sub>, v<sub>1</sub> + v<sub>2</sub>, v<sub>1</sub> + v<sub>2</sub> + v<sub>3</sub>? Write a relation and expand:</p>
        <p>a v<sub>1</sub> + b(v<sub>1</sub> + v<sub>2</sub>) + c(v<sub>1</sub> + v<sub>2</sub> + v<sub>3</sub>) = (a + b + c)v<sub>1</sub> + (b + c)v<sub>2</sub> + c v<sub>3</sub> = 0.</p>
        <p>Independence of the v’s forces a + b + c = 0, b + c = 0, c = 0, so c = b = a = 0. <b>Yes, independent.</b></p>
        <p>The same move settles “if {v<sub>1</sub>, v<sub>2</sub>} is a basis of ℝ<sup>2</sup>, is {2v<sub>1</sub> + v<sub>2</sub>, v<sub>2</sub>}?” style questions: expand, collect, and use the independence you already have.</p>
        <p class="callout tip">Also handy: span(v<sub>1</sub> + v<sub>2</sub>, v<sub>2</sub>) = span(v<sub>1</sub>, v<sub>2</sub>), since each list is made of combinations of the other.</p>`,
    },
  ],

  flashcards: [
    { front: "Linearly independent (definition)", back: "No vector in the list is a combination of the earlier ones (none is redundant)." },
    { front: "Linear relation", back: "An equation c₁v₁ + … + c_m v_m = 0. Nontrivial if some cᵢ ≠ 0." },
    { front: "Dependent ⇔ …", back: "There is a nontrivial relation among the vectors." },
    { front: "Matrix test for independence", back: "A = [v₁ … v_m]. Independent ⇔ ker(A) = {0} ⇔ rank(A) = m." },
    { front: "Can 5 vectors in ℝ⁴ be independent?", back: "No. At most 4 pivots, so a free variable must exist." },
    { front: "A kernel vector (2, 1, −1) of [v₁ v₂ v₃] means…", back: "2v₁ + v₂ − v₃ = 0, i.e. v₃ = 2v₁ + v₂ is redundant." },
    { front: "Are nonzero orthogonal vectors independent?", back: "Yes: dot a relation with vᵢ to get cᵢ‖vᵢ‖² = 0, so cᵢ = 0." },
    { front: "Any list containing 0 is…", back: "Dependent: 1·0 = 0 is a nontrivial relation." },
  ],

  quiz: [
    {
      type: "mc", lec: [7],
      q: `rref[v<sub>1</sub> v<sub>2</sub> v<sub>3</sub> v<sub>4</sub>] = ${M([[1, 0, 2, 0], [0, 1, -1, 0], [0, 0, 0, 1]])}. Which is true?`,
      options: ["The vectors are independent", "v₃ = 2v₁ − v₂", "v₄ is redundant", "v₃ = 2v₁ + v₂"],
      answer: 1,
      explain: "Column 3 has no pivot, so v₃ is redundant, and its rref column (2, −1, 0) gives v₃ = 2v₁ − v₂.",
    },
    {
      type: "tf", lec: [7],
      q: "True or false: the columns of any 4×6 matrix are linearly dependent.",
      answer: true,
      explain: "6 vectors in ℝ⁴: at most 4 pivots, so at least 2 free variables, so there’s a nonzero kernel vector.",
    },
    {
      type: "tf", lec: [7],
      q: "True or false: the columns of a 6×4 matrix must be linearly independent.",
      answer: false,
      explain: "Tall matrices <i>can</i> have independent columns, but don’t have to: the zero 6×4 matrix is a counterexample.",
    },
    {
      type: "mc", lec: [7],
      q: `For which k are ${V(1, 2)} and ${V(3, "k")} linearly dependent?`,
      options: ["k = 6", "k = 3", "k = 0", "No value of k"],
      answer: 0,
      explain: "Two vectors are dependent exactly when one is a multiple of the other: (3, k) = 3(1, 2) needs k = 6.",
    },
    {
      type: "tf", lec: [11],
      q: "True or false: if v · w = 0 for vectors v, w in ℝ³, then {v, w} is linearly independent.",
      answer: false,
      explain: "w = 0 is orthogonal to everything, and any list containing 0 is dependent. You need both vectors nonzero.",
    },
    {
      type: "mc", lec: [7],
      q: "v₁, v₂, v₃ are independent. Which list is dependent?",
      options: ["v₁, v₁ + v₂, v₁ + v₂ + v₃", "v₁ − v₂, v₂ − v₃, v₃ − v₁", "2v₁, 3v₂, 4v₃", "v₁ + v₂, v₂, v₃"],
      answer: 1,
      explain: "(v₁ − v₂) + (v₂ − v₃) + (v₃ − v₁) = 0 is a nontrivial relation. The others only have the trivial relation (expand and use independence).",
    },
    {
      type: "tf", lec: [7],
      q: "True or false: if v₁, v₂, v₃, v₄ are independent, then v₁, v₂, v₃ are independent.",
      answer: true,
      explain: "A relation among v₁, v₂, v₃ would also be a relation among all four (with 0 on v₄). Sublists of independent lists are independent.",
    },
  ],
});
})();
