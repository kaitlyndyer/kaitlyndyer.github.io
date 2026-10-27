(function () {
"use strict";
const { M, V, set } = LA;

registerConcept({
  id: "basis-dimension",
  oneLiner:
    "A <b>basis</b> of V is a list that <b>spans V</b> and is <b>independent</b>. Every basis of V has the same number of vectors, the <b>dimension</b>. For any n×m matrix, <b>rank + nullity = m</b>.",

  related: ["independence", "kernel-image", "orth-complement"],

  summary: {
    keyPoints: [
      { lec: [6], kind: "key", html: "<b>Basis of V</b> = vectors in V that <b>span V</b> and are <b>linearly independent</b>. Every vector of V is then a combination of them in <b>exactly one way</b>." },
      { lec: [7], html: "<b>dim(V)</b> = the number of vectors in any basis of V. dim ℝ<sup>n</sup> = n (standard basis e<sub>1</sub>, …, e<sub>n</sub>). dim{0} = 0." },
      { lec: [7], html: "If dim V = m: at most m vectors in V can be independent; at least m are needed to span V; <b>m independent vectors in V automatically span it</b>, and <b>m spanning vectors are automatically independent</b>." },
      { lec: [8], kind: "key", html: "<b>Rank–nullity:</b> for an n×m matrix A, <b>dim ker(A) + dim im(A) = m</b> (the number of <b>columns</b>)." },
      { lec: [8], html: "n vectors in ℝ<sup>n</sup> form a basis ⇔ the n×n matrix with them as columns is <b>invertible</b> ⇔ its rref is I<sub>n</sub>." },
      { lec: [8], html: "<b>Extending to a basis of ℝ<sup>n</sup>:</b> list your independent vectors first, then e<sub>1</sub>, …, e<sub>n</sub>. Row reduce and keep the pivot columns." },
      { lec: [8], html: "If V ⊆ W then dim V ≤ dim W, with equality only if V = W. And dim(V + W) = dim V + dim W − dim(V ∩ W)." },
    ],
    compare: {
      head: ["A is n×m with rank r", "Value"],
      rows: [
        ["dim im(A)", "r"],
        ["dim ker(A) (nullity)", "m − r"],
        ["r is at most", "min(n, m)"],
        ["Columns independent ⇔", "r = m"],
        ["Columns span ℝⁿ (im(A) = ℝⁿ) ⇔", "r = n"],
        ["Columns form a basis of ℝⁿ ⇔", "r = n = m (A invertible)"],
      ],
    },
  },

  details: [
    {
      id: "basis",
      title: "What a basis is (and isn’t)",
      lec: [6, 7],
      html: `
        <p>Vectors v<sub>1</sub>, …, v<sub>m</sub> in V form a <b>basis of V</b> if</p>
        <ol><li>they <b>span V</b> (every vector in V is a combination of them), and</li><li>they’re <b>linearly independent</b> (no redundant vector).</li></ol>
        <p>So a basis is a spanning list with nothing wasted. Your notes put it as a recipe: <b>(1) find a spanning list, (2) throw out the redundant vectors.</b> That’s exactly how the image basis works: start with all the columns and drop the non-pivot ones.</p>
        <p class="callout key"><b>Basis ⇔ unique representation</b> (Theorem 3.2.10): v<sub>1</sub>, …, v<sub>m</sub> is a basis of V exactly when every v in V can be written as c<sub>1</sub>v<sub>1</sub> + … + c<sub>m</sub>v<sub>m</sub> in <b>one and only one</b> way. Those c’s are the coordinates of v (see Coordinates).</p>
        <p>Bases aren’t unique. Any two nonparallel vectors in a plane form a basis of that plane, so a 2-dimensional subspace has infinitely many bases. But they all have the same size.</p>`,
    },
    {
      id: "dimension",
      title: "Dimension and the “right number” shortcut",
      lec: [7],
      html: `
        <p>Theorem 3.3.4. If dim(V) = m:</p>
        <ul>
          <li>(a) You can find <b>at most m</b> independent vectors in V.</li>
          <li>(b) You need <b>at least m</b> vectors to span V.</li>
          <li>(c) <b>m independent vectors</b> in V form a basis (they span for free).</li>
          <li>(d) <b>m vectors that span V</b> form a basis (independence comes for free).</li>
        </ul>
        <p class="callout tip">Part (c) is a huge time saver. To show 4 vectors form a basis of ℝ<sup>4</sup>, it’s enough to show they’re independent (4 pivots). To show 2 vectors form a basis of a 2-dimensional plane V, check they’re in V and not parallel.</p>
        <p><b>From CP11:</b> if a subspace V ⊆ ℝ<sup>3</sup> contains e<sub>1</sub>, e<sub>2</sub>, e<sub>3</sub>, then V = ℝ<sup>3</sup>. V contains every combination of them, which is everything.</p>`,
    },
    {
      id: "rank-nullity",
      title: "Rank–nullity: the dimension count",
      lec: [8],
      html: `
        <p>For an n×m matrix A (T: ℝ<sup>m</sup> → ℝ<sup>n</sup>):</p>
        <p class="callout key"><b>dim ker(A) + dim im(A) = m</b> &nbsp;&nbsp; (free variables + pivot variables = all variables)</p>
        <p>Geometric meaning: of the m input dimensions, nullity(A) of them “collapse” to 0 and rank(A) of them “survive” in the output. For the projection onto a plane in ℝ<sup>3</sup>: the kernel is the perpendicular line (1 dimension collapses) and the image is the plane (2 survive): 1 + 2 = 3.</p>
        <p><b>Using it without any numbers:</b></p>
        <ul>
          <li>T: ℝ<sup>5</sup> → ℝ<sup>3</sup>: rank ≤ 3, so nullity = 5 − rank ≥ 2. The kernel is <b>never</b> just {0}.</li>
          <li>T: ℝ<sup>4</sup> → ℝ<sup>7</sup>: rank ≤ 4, so the image is at most 4-dimensional. It can <b>never</b> be all of ℝ<sup>7</sup>.</li>
          <li>Is there a 2×5 matrix with dim ker = 2? Nullity = 5 − rank ≥ 3 since rank ≤ 2. <b>No.</b></li>
          <li>Is there a 4×2 matrix with dim ker = 2? Yes: the zero matrix (rank 0, nullity 2).</li>
        </ul>`,
    },
    {
      id: "not-invertible",
      title: "Proof pattern: why a product can’t be invertible",
      lec: [8],
      html: `
        <p><b>Claim:</b> if A = BC where B is 5×4 and C is 4×5, then the 5×5 matrix A is not invertible.</p>
        <p><b>Proof (from the notes).</b> C is 4×5, so rank(C) ≤ 4, so dim ker(C) = 5 − rank(C) ≥ 1. Pick v ≠ 0 with Cv = 0. Then Av = B(Cv) = B0 = 0. So v is a nonzero vector in ker(A), so ker(A) ≠ {0}, so A is not invertible. ∎</p>
        <p class="callout tip">The pattern: find a nonzero kernel vector of the <b>right-hand</b> factor using rank–nullity, then push it through the product. The same idea shows rank(BC) ≤ rank(C) and rank(BC) ≤ rank(B).</p>`,
    },
    {
      id: "bases-of-rn",
      title: "When do n vectors form a basis of ℝⁿ?",
      lec: [8],
      html: `
        <p>Exactly when the n×n matrix S = [v<sub>1</sub> … v<sub>n</sub>] is invertible. The big list of equivalent statements (Summary 3.3.10) for an n×n matrix A:</p>
        <p class="callout key">A invertible ⇔ Ax = b has a unique solution for every b ⇔ rref(A) = I<sub>n</sub> ⇔ rank(A) = n ⇔ im(A) = ℝ<sup>n</sup> ⇔ ker(A) = {0} ⇔ columns form a basis of ℝ<sup>n</sup> ⇔ columns span ℝ<sup>n</sup> ⇔ columns are independent.</p>
        <p><b>Example with a parameter.</b> For which k is ${set(V(1, 0, "k"), V("k", 1, 0), V(0, "k", 1))} a basis of ℝ<sup>3</sup>?</p>
        <div class="mrow">${M([[1, "k", 0], [0, 1, "k"], ["k", 0, 1]])} → (R<sub>3</sub> − kR<sub>1</sub>) ${M([[1, "k", 0], [0, 1, "k"], [0, "−k²", 1]])} → (R<sub>3</sub> + k²R<sub>2</sub>) ${M([[1, "k", 0], [0, 1, "k"], [0, 0, "1 + k³"]])}</div>
        <p>A pivot in column 3 needs 1 + k<sup>3</sup> ≠ 0, i.e. <b>k ≠ −1</b>. So it’s a basis for every k except −1.</p>`,
    },
    {
      id: "extend",
      title: "Extending an independent list to a basis of ℝⁿ",
      lec: [8],
      html: `
        <p>Theorem (Exercise 3.3.67): you can always add vectors to an independent list to get a basis. The standard way:</p>
        <ol>
          <li>Make the matrix [v<sub>1</sub> … v<sub>p</sub> | e<sub>1</sub> … e<sub>n</sub>] with your vectors <b>first</b>.</li>
          <li>Row reduce. Your v’s will all be pivot columns (they’re independent and come first).</li>
          <li>Keep the pivot columns: your v’s plus the e’s that got pivots.</li>
        </ol>
        <p><b>Example.</b> Extend v<sub>1</sub> = (1, 1, 0, 0), v<sub>2</sub> = (0, 1, 1, 0) to a basis of ℝ<sup>4</sup>:</p>
        <div class="mrow">rref ${M([[1, 0, 1, 0, 0, 0], [1, 1, 0, 1, 0, 0], [0, 1, 0, 0, 1, 0], [0, 0, 0, 0, 0, 1]])} = ${M([[1, 0, 0, 1, -1, 0], [0, 1, 0, 0, 1, 0], [0, 0, 1, -1, 1, 0], [0, 0, 0, 0, 0, 1]])}</div>
        <p>Pivots in columns 1, 2, 3, 6 → basis <b>v<sub>1</sub>, v<sub>2</sub>, e<sub>1</sub>, e<sub>4</sub></b>.</p>
        <p class="callout tip">Shortcut for ℝ<sup>n</sup>: <b>a basis of V together with a basis of V<sup>⊥</sup> is always a basis of ℝ<sup>n</sup></b> (see Orthogonal Complements). That’s often the slickest way to extend.</p>
        <p class="callout warn">Explain <b>why</b> it’s a basis: “4 vectors in ℝ<sup>4</sup>, and the matrix they form has rank 4, so they’re independent, so they form a basis (Theorem 3.3.4c).” Just listing four vectors usually loses points.</p>`,
    },
    {
      id: "sums",
      title: "Dimensions of sums and intersections",
      lec: [8],
      html: `
        <p>For subspaces V and W of ℝ<sup>n</sup> (Exercise 3.3.69):</p>
        <p class="callout key">dim(V + W) = dim V + dim W − dim(V ∩ W)</p>
        <ul>
          <li>Two different lines through 0 in ℝ<sup>3</sup>: they meet only at 0, so dim(V + W) = 1 + 1 − 0 = 2 (a plane).</li>
          <li>Two different planes through 0 in ℝ<sup>4</sup>: V ∩ W could be a line (then V + W is 3-dimensional) or just {0} (then V + W = ℝ<sup>4</sup>). So “dim(V + W) = 4” isn’t guaranteed.</li>
          <li>V, W in ℝ<sup>10</sup> with dims 6 and 7: dim(V + W) ≤ 10, so dim(V ∩ W) ≥ 6 + 7 − 10 = 3.</li>
        </ul>`,
    },
  ],

  flashcards: [
    { front: "Basis of V", back: "A list of vectors in V that spans V and is linearly independent." },
    { front: "dim(V)", back: "The number of vectors in any basis of V (they all have the same size)." },
    { front: "Rank–nullity theorem", back: "For n×m A: dim ker(A) + dim im(A) = m (number of columns)." },
    { front: "dim V = m, and you have m independent vectors in V. Are they a basis?", back: "Yes, automatically (Theorem 3.3.4c). No need to check spanning." },
    { front: "When do v₁, …, vₙ form a basis of ℝⁿ?", back: "When [v₁ … vₙ] is invertible (rref = Iₙ, rank n)." },
    { front: "How do you extend an independent list to a basis of ℝⁿ?", back: "Row reduce [v₁ … v_p | e₁ … eₙ] and keep the pivot columns." },
    { front: "T: ℝ⁶ → ℝ⁴. Smallest possible dim ker(T)?", back: "2: rank ≤ 4, so nullity = 6 − rank ≥ 2." },
    { front: "dim(V + W)", back: "dim V + dim W − dim(V ∩ W)." },
    { front: "Why is A = BC (B 5×4, C 4×5) not invertible?", back: "ker(C) ≠ {0} by rank–nullity; a nonzero v with Cv = 0 has Av = 0." },
  ],

  quiz: [
    {
      type: "mc", lec: [8],
      q: "A is 5×8 and dim ker(A) = 4. What is dim im(A)?",
      options: ["1", "4", "3", "Can’t tell"],
      answer: 1,
      explain: "dim im = 8 − 4 = 4 (columns minus nullity).",
    },
    {
      type: "mc", lec: [8],
      q: "T: ℝ⁴ → ℝ⁶ is linear. Which value is possible for dim im(T)?",
      options: ["5", "6", "3", "7"],
      answer: 2,
      explain: "dim im(T) = rank ≤ min(6, 4) = 4. Only 3 is possible among these (any of 0 through 4 is).",
    },
    {
      type: "tf", lec: [8],
      q: "True or false: there is a 3×5 matrix A with dim ker(A) = 1.",
      answer: false,
      explain: "rank ≤ 3, so nullity = 5 − rank ≥ 2.",
    },
    {
      type: "tf", lec: [8],
      q: "True or false: if v₁, v₂, v₃ are independent vectors in ℝ³, they form a basis of ℝ³.",
      answer: true,
      explain: "3 independent vectors in a 3-dimensional space automatically span it (Theorem 3.3.4c).",
    },
    {
      type: "tf", lec: [7],
      q: "True or false: four vectors that span ℝ⁴ must be linearly independent.",
      answer: true,
      explain: "4 spanning vectors in a 4-dimensional space form a basis (Theorem 3.3.4d), so they’re independent.",
    },
    {
      type: "mc", lec: [8],
      q: "V and W are subspaces of ℝ⁷ with dim V = 4 and dim W = 5. What’s the smallest dim(V ∩ W) can be?",
      options: ["0", "1", "2", "4"],
      answer: 2,
      explain: "dim(V ∩ W) = 4 + 5 − dim(V + W) ≥ 9 − 7 = 2.",
    },
    {
      type: "tf", lec: [8],
      q: "True or false: if A is 12×12 and A² = 0, then rank(A) ≤ 6.",
      answer: true,
      explain: "A² = 0 means im(A) ⊆ ker(A), so rank ≤ nullity. With rank + nullity = 12, rank ≤ 6.",
    },
    {
      type: "mc", lec: [7],
      q: "Which list is a basis of the plane x − y + 2z = 0?",
      options: [set(V(1, 1, 0), V(-2, 0, 1)), set(V(1, -1, 2)), set(V(1, 1, 0), V(2, 2, 0)), set(V(1, 1, 0), V(0, 2, 1), V(-2, 0, 1))],
      answer: 0,
      explain: "Both satisfy the equation (1 − 1 + 0 = 0, −2 − 0 + 2 = 0) and they aren’t parallel, so they’re 2 independent vectors in a 2-dimensional plane. (1, −1, 2) is the normal, not in the plane; the third list is parallel; the fourth has 3 vectors in a 2-dim space.",
    },
  ],
});
})();
