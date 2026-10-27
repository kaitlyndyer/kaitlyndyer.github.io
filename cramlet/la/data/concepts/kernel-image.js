(function () {
"use strict";
const { M, V, set } = LA;

registerConcept({
  id: "kernel-image",
  oneLiner:
    "The <b>kernel</b> of A is everything A sends to <b>0</b> (it lives in the <b>input</b> space). The <b>image</b> of A is everything A can output, the <b>span of its columns</b> (it lives in the <b>output</b> space).",

  related: ["subspaces", "basis-dimension", "independence"],

  summary: {
    keyPoints: [
      { lec: [5], html: "For T(x) = Ax with A an <b>n×m</b> matrix (so T goes from ℝ<sup>m</sup> to ℝ<sup>n</sup>): <b>ker(A) = { x in ℝ<sup>m</sup> : Ax = 0 }</b> and <b>im(A) = { Ax : x in ℝ<sup>m</sup> } = span(columns of A)</b>." },
      { lec: [5], kind: "warn", html: "Where they live: <b>ker(A) ⊆ ℝ<sup>m</sup></b> (one entry per <b>column</b>), <b>im(A) ⊆ ℝ<sup>n</sup></b> (one entry per <b>row</b>). A 3×5 matrix has its kernel in ℝ<sup>5</sup> and its image in ℝ<sup>3</sup>." },
      { lec: [7, 8], kind: "key", html: "<b>Kernel basis:</b> solve rref(A)x = 0, write x in terms of the free variables, and split it up: one vector per free variable." },
      { lec: [8], kind: "key", html: "<b>Image basis:</b> find the pivot columns of rref(A), then take <b>those columns of A</b> (the original matrix, not rref)." },
      { lec: [8], html: "<b>dim im(A) = rank(A)</b> = number of pivots. <b>dim ker(A) = m − rank(A)</b> = number of free variables. Together: dim ker + dim im = m (number of columns)." },
      { lec: [5], html: "ker(A) = {0} exactly when rank(A) = m (no free variables). For a square matrix, that means A is invertible." },
      { lec: [8], html: "Every non-pivot (redundant) column of A is a combination of the pivot columns <b>to its left</b>. rref tells you the coefficients: read them off that column of rref(A)." },
    ],
    compare: {
      head: ["", "Kernel ker(A)", "Image im(A)"],
      rows: [
        ["Means", "inputs x with Ax = 0", "all outputs Ax"],
        ["Lives in (A is n×m)", "ℝ<sup>m</sup> (domain)", "ℝ<sup>n</sup> (target)"],
        ["Basis from", "free variables of rref(A)x = 0", "pivot columns of <b>A</b>"],
        ["Dimension", "m − rank(A) (nullity)", "rank(A)"],
        ["Trivial when", "rank(A) = m", "A = 0"],
      ],
    },
  },

  details: [
    {
      id: "definitions",
      title: "What the image and kernel are",
      lec: [5],
      html: `
        <p>Think of A as a machine T(x) = Ax that eats vectors in ℝ<sup>m</sup> and spits out vectors in ℝ<sup>n</sup>.</p>
        <ul>
          <li>The <b>image</b> im(A) is the set of everything that can come out. Since Ax = x<sub>1</sub>v<sub>1</sub> + … + x<sub>m</sub>v<sub>m</sub> (the columns weighted by the entries of x), the image is exactly the <b>span of the columns</b>. It is also called the <b>column space</b>.</li>
          <li>The <b>kernel</b> ker(A) is the set of inputs that get crushed to zero: the solutions of Ax = 0. It is also called the <b>null space</b>.</li>
        </ul>
        <p>Your teacher’s picture: two blobs, ℝ<sup>m</sup> on the left with ker(T) inside it, ℝ<sup>n</sup> on the right with im(T) inside it, and every vector of the kernel mapped to the single point 0.</p>
        <p class="callout warn">The most common true/false trap: “the image of a 3×5 matrix is a subspace of ℝ<sup>5</sup>.” <b>False.</b> Each column has 3 entries, so the image is in ℝ<sup>3</sup>. The <b>kernel</b> is in ℝ<sup>5</sup>, because x needs 5 entries to multiply a 3×5 matrix.</p>`,
    },
    {
      id: "kernel-basis",
      title: "Finding a basis of the kernel",
      lec: [7, 8],
      html: `
        <ol>
          <li>Row reduce A to rref(A). (The kernel doesn’t change: row operations don’t change the solutions of Ax = 0.)</li>
          <li>Mark the pivot columns. The other variables are <b>free</b>.</li>
          <li>Solve each pivot variable in terms of the free ones.</li>
          <li>Write x as a sum: (free variable) × (vector), one term per free variable. Those vectors are your basis.</li>
        </ol>
        <p><b>Example.</b> Let A = ${M([[1, -1, 2, 0, 3], [2, -2, 5, 1, 4], [0, 0, 1, 1, -2]])}.</p>
        <p>R<sub>2</sub> − 2R<sub>1</sub> gives (0, 0, 1, 1, −2), the same as R<sub>3</sub>, so R<sub>3</sub> − R<sub>2</sub> = 0. Then R<sub>1</sub> − 2R<sub>2</sub>:</p>
        <div class="mrow">rref(A) = ${M([[1, -1, 0, -2, 7], [0, 0, 1, 1, -2], [0, 0, 0, 0, 0]])}</div>
        <p>Pivots in columns 1 and 3, so x<sub>2</sub> = s, x<sub>4</sub> = t, x<sub>5</sub> = r are free:</p>
        <p>x<sub>1</sub> = s + 2t − 7r, &nbsp; x<sub>3</sub> = −t + 2r.</p>
        <div class="mrow">x = s ${V(1, 1, 0, 0, 0)} + t ${V(2, 0, -1, 1, 0)} + r ${V(-7, 0, 2, 0, 1)}</div>
        <p>So ker(A) has basis ${set(V(1, 1, 0, 0, 0), V(2, 0, -1, 1, 0), V(-7, 0, 2, 0, 1))} and dim ker(A) = 3.</p>
        <p class="callout tip"><b>Why they’re independent, for free:</b> each vector has a 1 in its own free-variable slot (x<sub>2</sub>, x<sub>4</sub>, x<sub>5</sub>) where the others have 0. If a test asks you to <i>justify</i> the basis, say exactly that: they span the kernel (every solution is a combination of them) and they’re independent (look at the free-variable entries).</p>
        <p class="callout try"><b>Check:</b> multiply A by each vector. You should get 0. For the first one: column 1 + column 2 = (1, 2, 0) + (−1, −2, 0) = 0. ✓</p>`,
    },
    {
      id: "image-basis",
      title: "Finding a basis of the image",
      lec: [8],
      html: `
        <ol>
          <li>Row reduce to find which columns have pivots.</li>
          <li>Take <b>those columns of the original A</b>. They form a basis of im(A).</li>
        </ol>
        <p>In the example above, the pivots are in columns 1 and 3, so</p>
        <div class="mrow">im(A) has basis ${set(V(1, 2, 0), V(2, 5, 1))}, &nbsp; dim im(A) = 2.</div>
        <p class="callout warn">Use columns of <b>A</b>, not of rref(A). Row operations change the image. Here rref(A)’s columns all end in 0, but column 3 of A ends in 1, so the two images are different planes.</p>
        <p><b>Why it works:</b> row operations don’t change which columns are combinations of earlier ones. In rref(A), the non-pivot columns are obviously combinations of the pivot columns. So the same is true in A, and the pivot columns of A are the non-redundant ones.</p>`,
    },
    {
      id: "redundant",
      title: "Reading off the redundant columns",
      lec: [7, 8],
      html: `
        <p>Each non-pivot column of rref(A) tells you how the matching column of A is built from the pivot columns. In the example, column 5 of rref(A) is (7, −2, 0): <b>7 × (pivot column 1) − 2 × (pivot column 2)</b>.</p>
        <div class="mrow">So a<sub>5</sub> = 7a<sub>1</sub> − 2a<sub>3</sub>: &nbsp; 7${V(1, 2, 0)} − 2${V(2, 5, 1)} = ${V(3, 4, -2)} ✓</div>
        <p>Likewise column 2 of rref is (−1, 0, 0), so a<sub>2</sub> = −a<sub>1</sub>, and column 4 is (−2, 1, 0), so a<sub>4</sub> = −2a<sub>1</sub> + a<sub>3</sub>.</p>
        <p class="callout key">The k-th entry in a non-pivot column of rref(A) is the coefficient on the <b>k-th pivot column</b> (not the k-th column).</p>
        <p>This also runs backward. If you know rref(A) and the pivot columns of A, you can rebuild every other column of A. That’s a favorite way to make a “find the basis” problem harder.</p>`,
    },
    {
      id: "inspection",
      title: "Shortcut: spotting redundant columns by inspection",
      lec: [7],
      html: `
        <p>Sometimes you can see the relations without row reducing. In ${M([[1, 2, 1, 0], [2, 4, 3, 1], [3, 6, 4, 1]])}, column 2 = 2 × column 1, and column 4 = column 3 − column 1.</p>
        <ul>
          <li>Non-redundant columns 1 and 3 → basis of the image.</li>
          <li>Each relation gives a kernel vector: a<sub>2</sub> = 2a<sub>1</sub> means −2a<sub>1</sub> + a<sub>2</sub> = 0, so ${V(-2, 1, 0, 0)} is in the kernel. a<sub>4</sub> = a<sub>3</sub> − a<sub>1</sub> gives ${V(1, 0, -1, 1)}.</li>
        </ul>
        <p>The book writes the coefficients above the columns (“Kyle numbers”) to keep track. One relation per redundant column, and together they form a basis of the kernel.</p>`,
    },
    {
      id: "is-b-in-image",
      title: "Is a vector b in the image?",
      lec: [5],
      html: `
        <p>b is in im(A) exactly when <b>Ax = b has a solution</b>. Row reduce the augmented matrix [A | b]. If you get a row (0 0 … 0 | nonzero), b is <b>not</b> in the image.</p>
        <p>Turning that around gives the image as a <b>kernel</b>. Row reduce [A | y] with y = (y<sub>1</sub>, …, y<sub>n</sub>) left as letters. Each zero row of A on the left gives a condition like y<sub>1</sub> − y<sub>2</sub> + y<sub>3</sub> = 0 that y must satisfy. Those conditions are the equations of im(A), so im(A) = ker(B), where the rows of B hold the coefficients.</p>
        <p><b>Quick example:</b> the image of ${M([[1, 1], [1, 2], [1, 3]])} is the plane spanned by ${V(1, 1, 1)} and ${V(1, 2, 3)}. A normal vector is (1, −2, 1) (check: it’s perpendicular to both columns), so im(A) = ker${M([[1, -2, 1]])}.</p>`,
    },
    {
      id: "products",
      title: "Kernels and images of products",
      lec: [5, 8],
      html: `
        <ul>
          <li><b>ker(B) ⊆ ker(AB)</b>: if Bx = 0, then ABx = A0 = 0.</li>
          <li><b>im(AB) ⊆ im(A)</b>: ABx = A(Bx) is an output of A.</li>
          <li>In particular, im(A<sup>2</sup>) ⊆ im(A) and ker(A) ⊆ ker(A<sup>2</sup>).</li>
          <li><b>A<sup>2</sup> = 0 ⇔ im(A) ⊆ ker(A).</b> (Everything A outputs, A sends to 0.) Then rank(A) ≤ nullity(A), and rank–nullity gives rank(A) ≤ n/2.</li>
        </ul>
        <p class="callout try">This is the reasoning behind “If A is 10×10 with A<sup>2</sup> = 0, then rank(A) ≤ 5.” rank ≤ nullity and rank + nullity = 10, so 2·rank ≤ 10.</p>`,
    },
  ],

  flashcards: [
    { front: "ker(A)", back: "All x with Ax = 0. For an n×m matrix it’s a subspace of ℝ<sup>m</sup> (the domain)." },
    { front: "im(A)", back: "All outputs Ax = the span of the columns of A. For an n×m matrix it’s a subspace of ℝ<sup>n</sup> (the target)." },
    { front: "Basis of the kernel", back: "Solve rref(A)x = 0. Write x in terms of the free variables; the vector multiplying each free variable goes in the basis." },
    { front: "Basis of the image", back: "The columns of <b>A</b> (not rref) that sit in pivot positions of rref(A)." },
    { front: "dim im(A)", back: "rank(A), the number of pivots." },
    { front: "dim ker(A) (nullity)", back: "m − rank(A), the number of free variables (m = number of columns)." },
    { front: "When is ker(A) = {0}?", back: "When rank(A) = m (a pivot in every column). For square A: exactly when A is invertible." },
    { front: "How do you test if b ∈ im(A)?", back: "Row reduce [A | b]. b is in the image ⇔ the system is consistent (no row 0 … 0 | nonzero)." },
    { front: "A non-pivot column of rref(A) reads (3, −1, 0). What does it say about A?", back: "That column of A = 3 × (first pivot column of A) − 1 × (second pivot column of A)." },
    { front: "A² = 0 means…", back: "im(A) ⊆ ker(A), so rank(A) ≤ nullity(A), so rank(A) ≤ n/2." },
  ],

  quiz: [
    {
      type: "mc", lec: [5],
      q: "A is a 4×7 matrix. Where do ker(A) and im(A) live?",
      options: ["ker(A) ⊆ ℝ⁴, im(A) ⊆ ℝ⁷", "ker(A) ⊆ ℝ⁷, im(A) ⊆ ℝ⁴", "Both in ℝ⁷", "Both in ℝ⁴"],
      answer: 1,
      explain: "x must have 7 entries to multiply a 4×7 matrix, so the kernel is in ℝ⁷. Each output (and each column) has 4 entries, so the image is in ℝ⁴.",
    },
    {
      type: "mc", lec: [8],
      q: `rref(A) = ${M([[1, 0, 3, 0], [0, 1, -2, 0], [0, 0, 0, 1]])}. Which columns of A form a basis of im(A)?`,
      options: ["Columns 1, 2, 3 of A", "Columns 1, 2, 4 of A", "Columns 1, 2, 4 of rref(A)", "Column 3 of A"],
      answer: 1,
      explain: "Pivots are in columns 1, 2, 4. Take those columns of the <b>original</b> A; columns of rref(A) span a different space in general.",
    },
    {
      type: "mc", lec: [8],
      q: `With rref(A) = ${M([[1, 0, 3, 0], [0, 1, -2, 0], [0, 0, 0, 1]])}, which vector is a basis of ker(A)?`,
      options: [V(3, -2, 1, 0), V(-3, 2, 1, 0), V(-3, 2, 0, 1), V(1, 1, 0, 0)],
      answer: 1,
      explain: "x<sub>3</sub> = t is free. x<sub>1</sub> = −3t, x<sub>2</sub> = 2t, x<sub>4</sub> = 0. So x = t(−3, 2, 1, 0). Check: −3·col1 + 2·col2 + col3 of rref is (−3+3, 2−2, 0) = 0 ✓.",
    },
    {
      type: "mc", lec: [8],
      q: `rref(A) has third column (4, −1, 0) and pivots in columns 1 and 2. If a<sub>1</sub> = ${V(1, 0, 2)} and a<sub>2</sub> = ${V(0, 1, 1)}, what is a<sub>3</sub>?`,
      options: [V(4, -1, 0), V(4, -1, 7), V(4, 1, 9), V(-4, 1, -7)],
      answer: 1,
      explain: "a<sub>3</sub> = 4a<sub>1</sub> − 1a<sub>2</sub> = (4, 0, 8) − (0, 1, 1) = (4, −1, 7). The rref column gives the <b>coefficients</b>, not the column itself.",
    },
    {
      type: "tf", lec: [5],
      q: "True or false: the kernel of a 3×5 matrix is a subspace of ℝ³.",
      answer: false,
      explain: "The kernel is a set of <b>inputs</b>, and inputs to a 3×5 matrix have 5 entries. It’s a subspace of ℝ⁵.",
    },
    {
      type: "tf", lec: [8],
      q: "True or false: im(A) = im(rref(A)) for every matrix A.",
      answer: false,
      explain: "Row operations change the column space. E.g. A = [1; 1] (one column) has image the line through (1, 1); rref(A) = [1; 0] has image the x-axis. (The kernel is unchanged, though.)",
    },
    {
      type: "mc", lec: [8],
      q: "A 6×9 matrix has rank 4. What is dim ker(A)?",
      options: ["2", "4", "5", "3"],
      answer: 2,
      explain: "dim ker = (number of columns) − rank = 9 − 4 = 5.",
    },
    {
      type: "tf", lec: [5],
      q: "True or false: if A and B are n×n, then ker(B) ⊆ ker(AB).",
      answer: true,
      explain: "If Bx = 0, then (AB)x = A(Bx) = A0 = 0.",
    },
  ],
});
})();
