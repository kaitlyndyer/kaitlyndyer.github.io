// Show-your-work problems for the practice tests ("work" type, la/questions.js). Each one is solved on paper,
// then checked against a model solution and a checklist (1 point per item).
// These are new problems in the style of Test 2. None is copied from the practice tests or homework, and many
// twist the usual format (rebuild A from its rref, design a matrix, parameters, image as a kernel, …).
// Every number here was checked with a computer algebra system.
(function () {
"use strict";
const { M, V, set } = LA;
const w = (concept, list) => registerExam(concept, list.map(q => ({ type: "work", ...q })));

// ============================================================================ Image & kernel
w("kernel-image", [
  {
    id: "ki-full", lec: [8], sec: "kernel-basis",
    q: `<p>Let A = ${M([[1, 2, -1, 0, 3], [2, 4, -1, 1, 7], [-1, -2, 2, 1, -1], [3, 6, -2, 1, 10]])}.</p>
        <p>(a) Find rref(A). (b) Find a basis of ker(A). (c) Find a basis of im(A). (d) Give dim ker(A) and dim im(A), and check them with rank–nullity. (e) Is b = (2, 1, 5, 4) in im(A)? Justify.</p>`,
    model: `<p>(a) R<sub>2</sub> − 2R<sub>1</sub>, R<sub>3</sub> + R<sub>1</sub>, R<sub>4</sub> − 3R<sub>1</sub> give rows (0, 0, 1, 1, 1), (0, 0, 1, 1, 2), (0, 0, 1, 1, 1). Then R<sub>3</sub> − R<sub>2</sub> = (0, 0, 0, 0, 1), R<sub>4</sub> − R<sub>2</sub> = 0, R<sub>1</sub> + R<sub>2</sub>, and clear column 5:</p>
        <div class="mrow">rref(A) = ${M([[1, 2, 0, 1, 0], [0, 0, 1, 1, 0], [0, 0, 0, 0, 1], [0, 0, 0, 0, 0]])}</div>
        <p>(b) Free: x<sub>2</sub> = s, x<sub>4</sub> = t. x<sub>1</sub> = −2s − t, x<sub>3</sub> = −t, x<sub>5</sub> = 0. Basis ${set(V(-2, 1, 0, 0, 0), V(-1, 0, -1, 1, 0))}.</p>
        <p>(c) Pivot columns 1, 3, 5 of A: ${set(V(1, 2, -1, 3), V(-1, -1, 2, -2), V(3, 7, -1, 10))}.</p>
        <p>(d) dim ker = 2, dim im = 3, and 2 + 3 = 5 = number of columns ✓.</p>
        <p>(e) Row reduce [A | b]: the zero row of rref(A) becomes (0 0 0 0 0 | b<sub>4</sub> − b<sub>1</sub> − b<sub>2</sub>) = (… | 4 − 2 − 1) = (… | 1) ≠ 0. Inconsistent, so <b>b ∉ im(A)</b>. (In fact im(A) is the hyperplane y<sub>4</sub> = y<sub>1</sub> + y<sub>2</sub>.)</p>`,
    checklist: [
      "Correct rref (pivots in columns 1, 3, 5).",
      "Kernel basis: two vectors equivalent to (−2, 1, 0, 0, 0) and (−1, 0, −1, 1, 0).",
      "Image basis uses columns 1, 3, 5 of <b>A</b> (not of rref).",
      "dim ker = 2 and dim im = 3, with the rank–nullity check.",
      "Correctly decided b ∉ im(A) with a reason (inconsistent system).",
    ],
    explain: "Kernel from the free variables, image from the pivot columns of A, and membership in the image is a consistency question.",
  },
  {
    id: "ki-rebuild", lec: [8], sec: "redundant",
    q: `<p>A is a 3×5 matrix with columns a<sub>1</sub>, …, a<sub>5</sub>. You know</p>
        <div class="mrow">rref(A) = ${M([[1, 3, 0, -2, 0], [0, 0, 1, 4, 0], [0, 0, 0, 0, 1]])}, &nbsp; a<sub>1</sub> = ${V(1, 2, -1)}, a<sub>3</sub> = ${V(0, 1, 3)}, a<sub>5</sub> = ${V(2, 0, 1)}.</div>
        <p>(a) Find a<sub>2</sub> and a<sub>4</sub>. (b) Find a basis of ker(A). (c) Find a basis of im(A). Is im(A) = ℝ<sup>3</sup>? (d) Find dim ker(A) and dim im(A).</p>`,
    model: `<p>(a) The non-pivot columns of rref(A) give the coefficients on the pivot columns (a<sub>1</sub>, a<sub>3</sub>, a<sub>5</sub>):</p>
        <p>a<sub>2</sub> = 3a<sub>1</sub> = (3, 6, −3). &nbsp; a<sub>4</sub> = −2a<sub>1</sub> + 4a<sub>3</sub> = (−2, −4, 2) + (0, 4, 12) = <b>(−2, 0, 14)</b>.</p>
        <p>(b) x<sub>2</sub> = s, x<sub>4</sub> = t free; x<sub>1</sub> = −3s + 2t, x<sub>3</sub> = −4t, x<sub>5</sub> = 0: ${set(V(-3, 1, 0, 0, 0), V(2, 0, -4, 1, 0))}.</p>
        <p>(c) ${set(V(1, 2, -1), V(0, 1, 3), V(2, 0, 1))} (pivot columns of A). Rank 3 = 3 rows, so <b>im(A) = ℝ<sup>3</sup></b> (3 independent vectors in ℝ<sup>3</sup>).</p>
        <p>(d) dim ker = 2, dim im = 3 (2 + 3 = 5 ✓).</p>`,
    checklist: [
      "a₂ = (3, 6, −3).",
      "a₄ = (−2, 0, 14), using the coefficients −2 and 4 on a₁ and a₃.",
      "Kernel basis equivalent to (−3, 1, 0, 0, 0), (2, 0, −4, 1, 0).",
      "Image basis a₁, a₃, a₅ and the conclusion im(A) = ℝ³ with a reason.",
      "dim ker = 2, dim im = 3.",
    ],
    explain: "The k-th entry of a non-pivot column of rref(A) is the coefficient on the k-th pivot column of A.",
  },
  {
    id: "ki-design", lec: [5, 8], sec: "definitions",
    q: `<p>Find a 3×3 matrix A such that ker(A) is the line spanned by ${V(1, 2, -1)} and im(A) is the plane x + y + z = 0. Explain why your A works: show that its kernel is <b>exactly</b> that line and its image is <b>exactly</b> that plane.</p>`,
    model: `<p>Columns must lie in the plane and satisfy a<sub>1</sub> + 2a<sub>2</sub> − a<sub>3</sub> = 0 (that’s A(1, 2, −1) = 0). Pick two independent vectors in the plane, a<sub>1</sub> = (1, −1, 0), a<sub>2</sub> = (0, 1, −1), and set a<sub>3</sub> = a<sub>1</sub> + 2a<sub>2</sub> = (1, 1, −2).</p>
        <div class="mrow">A = ${M([[1, 0, 1], [-1, 1, 1], [0, -1, -2]])}</div>
        <p><b>Why it works.</b> Each column satisfies x + y + z = 0, so im(A) ⊆ plane. a<sub>1</sub>, a<sub>2</sub> aren’t parallel, so rank(A) ≥ 2; a<sub>3</sub> is redundant, so rank(A) = 2 = dim(plane), so im(A) = the plane. A(1, 2, −1) = a<sub>1</sub> + 2a<sub>2</sub> − a<sub>3</sub> = 0, so the line ⊆ ker(A), and dim ker(A) = 3 − 2 = 1, so ker(A) is exactly the line.</p>
        <p>(Many other answers work.)</p>`,
    checklist: [
      "Every column of A satisfies x + y + z = 0.",
      "A(1, 2, −1) = 0 (checked by multiplying).",
      "Argued rank(A) = 2, so im(A) is the whole plane (not just inside it).",
      "Used rank–nullity: dim ker = 3 − 2 = 1, so the kernel is exactly the line.",
    ],
    explain: "Design problems are rank–nullity in reverse: dim ker + dim im must equal the number of columns (1 + 2 = 3 here), and the relation in the kernel tells you how the columns combine.",
  },
  {
    id: "ki-inspect", lec: [7], sec: "inspection",
    q: `<p>Without row reducing, find bases of ker(A) and im(A), where</p>
        <div class="mrow">A = ${M([[1, 0, 2, 1, 3], [2, 1, 5, 0, 4], [1, 1, 3, -1, 1], [0, 1, 1, -2, -2]])}.</div>
        <p>Hint: compare each column with the first two. Write each redundant column as a combination of earlier ones.</p>`,
    model: `<p>Columns 1 and 2 aren’t parallel. Then</p>
        <ul><li>a<sub>3</sub> = 2a<sub>1</sub> + a<sub>2</sub> &nbsp;(2(1, 2, 1, 0) + (0, 1, 1, 1) = (2, 5, 3, 1) ✓)</li>
        <li>a<sub>4</sub> = a<sub>1</sub> − 2a<sub>2</sub> &nbsp;((1, 2, 1, 0) − (0, 2, 2, 2) = (1, 0, −1, −2) ✓)</li>
        <li>a<sub>5</sub> = 3a<sub>1</sub> − 2a<sub>2</sub> &nbsp;((3, 6, 3, 0) − (0, 2, 2, 2) = (3, 4, 1, −2) ✓)</li></ul>
        <p><b>im(A)</b>: basis ${set(V(1, 2, 1, 0), V(0, 1, 1, 1))}, dim 2.</p>
        <p><b>ker(A)</b>: one vector per relation, ${set(V(-2, -1, 1, 0, 0), V(-1, 2, 0, 1, 0), V(-3, 2, 0, 0, 1))}, dim 3 = 5 − 2 ✓. Independent by the zero-components pattern (each has a 1 in its own slot 3, 4, 5).</p>`,
    checklist: [
      "Found a₃ = 2a₁ + a₂.",
      "Found a₄ = a₁ − 2a₂ and a₅ = 3a₁ − 2a₂.",
      "Image basis {a₁, a₂}.",
      "Kernel basis: the three relation vectors (signs right!).",
      "Explained why the kernel vectors form a basis (independent + dim 3 by rank–nullity).",
    ],
    explain: "Each relation a_i = Σ c_j a_j becomes a kernel vector with −c_j in the earlier slots and 1 in slot i.",
  },
  {
    id: "ki-im-as-ker", lec: [5, 11], sec: "is-b-in-image",
    q: `<p>Let A = ${M([[1, 2, 0], [2, 5, 1], [1, 3, 1], [3, 7, 1]])}.</p>
        <p>(a) Find a basis of im(A). (b) Find a matrix B with im(A) = ker(B). (c) Is ${V(2, 3, 1, 5)} in im(A)? Is ${V(1, 1, 1, 1)}? (d) Find a basis of im(A)<sup>⊥</sup>.</p>`,
    model: `<p>Row reduce [A | y]: R<sub>2</sub> − 2R<sub>1</sub>, R<sub>3</sub> − R<sub>1</sub>, R<sub>4</sub> − 3R<sub>1</sub> make rows 2–4 all (0, 1, 1 | …). Subtracting row 2 from rows 3 and 4:</p>
        <div class="mrow">${M([[1, 2, 0, "y₁"], [0, 1, 1, "y₂ − 2y₁"], [0, 0, 0, "y₁ − y₂ + y₃"], [0, 0, 0, "−y₁ − y₂ + y₄"]], { aug: 3 })}</div>
        <p>(a) Pivots in columns 1, 2: basis ${set(V(1, 2, 1, 3), V(2, 5, 3, 7))} (dim 2).</p>
        <p>(b) Consistent ⇔ y<sub>1</sub> − y<sub>2</sub> + y<sub>3</sub> = 0 and y<sub>1</sub> + y<sub>2</sub> − y<sub>4</sub> = 0, so B = ${M([[1, -1, 1, 0], [1, 1, 0, -1]])}.</p>
        <p>(c) (2, 3, 1, 5): 2 − 3 + 1 = 0 and 2 + 3 − 5 = 0, so <b>yes</b>. (1, 1, 1, 1): 1 − 1 + 1 = 1 ≠ 0, so <b>no</b>.</p>
        <p>(d) The rows of B: ${set(V(1, -1, 1, 0), V(1, 1, 0, -1))}. They’re perpendicular to both columns, and 2 + 2 = 4 ✓.</p>`,
    checklist: [
      "Image basis: columns 1 and 2 of A.",
      "Row reduced [A | y] correctly to get the two conditions.",
      "B with rows (1, −1, 1, 0) and (1, 1, 0, −1) (or equivalent).",
      "Both membership questions right, with the check shown.",
      "Basis of im(A)⊥ (the rows of B, or equivalent), dims adding to 4.",
    ],
    explain: "The conditions for Ax = y to be consistent are linear equations in y, so they describe im(A) as a kernel. Their coefficient vectors are perpendicular to the image.",
  },
]);

// ============================================================================ Subspaces
w("subspaces", [
  {
    id: "sub-four-a", lec: [6], sec: "as-kernel",
    q: `<p>For each set, decide whether it’s a subspace. If it is, write it as the kernel or image of a specific matrix. If not, give a specific counterexample.</p>
        <p>(a) W = { x ∈ ℝ<sup>3</sup> : x<sub>1</sub> = 2x<sub>2</sub> and x<sub>2</sub> + x<sub>3</sub> = 0 }<br>
        (b) W = { ${V("a − b", "2b", "a + 3b", 0)} : a, b ∈ ℝ }<br>
        (c) W = { (x, y) ∈ ℝ<sup>2</sup> : x ≤ y }<br>
        (d) W = { (x, y, z) ∈ ℝ<sup>3</sup> : z = x<sup>2</sup> }</p>`,
    model: `<p>(a) <b>Subspace.</b> x<sub>1</sub> − 2x<sub>2</sub> = 0 and x<sub>2</sub> + x<sub>3</sub> = 0, so W = ker${M([[1, -2, 0], [0, 1, 1]])}.</p>
        <p>(b) <b>Subspace.</b> a(1, 0, 1, 0) + b(−1, 2, 3, 0), so W = im${M([[1, -1], [0, 2], [1, 3], [0, 0]])}.</p>
        <p>(c) <b>Not a subspace.</b> (0, 1) ∈ W (0 ≤ 1), but (−1)(0, 1) = (0, −1) ∉ W (0 ≤ −1 is false).</p>
        <p>(d) <b>Not a subspace.</b> (1, 0, 1) ∈ W, but 2(1, 0, 1) = (2, 0, 2) ∉ W since 2 ≠ 2<sup>2</sup>.</p>`,
    checklist: [
      "(a) Subspace, with the correct 2×3 kernel matrix (including the 0 entries).",
      "(b) Subspace, with the correct 4×2 image matrix.",
      "(c) Not a subspace, with specific vectors and scalar.",
      "(d) Not a subspace, with a specific counterexample.",
    ],
    explain: "Equations equal to 0 → kernel. Free parameters → image. Inequalities and squares → look for a counterexample.",
  },
  {
    id: "sub-four-b", lec: [6], sec: "as-image",
    q: `<p>Same instructions: subspace (as a specific kernel or image) or not (specific counterexample)?</p>
        <p>(a) The line in ℝ<sup>3</sup> through the points (1, 2, 3) and (2, 4, 6).<br>
        (b) The set of vectors in ℝ<sup>3</sup> perpendicular to both (1, 1, 0) and (0, 1, 1).<br>
        (c) W = { x ∈ ℝ<sup>4</sup> : x<sub>1</sub> + x<sub>2</sub> = 1 }<br>
        (d) W = { ${V("2a + b", "a", "b")} : a ≥ 0, b ≥ 0 }</p>`,
    model: `<p>(a) <b>Subspace.</b> (2, 4, 6) = 2(1, 2, 3), so the line passes through 0: it’s span(1, 2, 3) = im${M([[1], [2], [3]])}. (A line through two points is only a subspace if it hits the origin; this one does.)</p>
        <p>(b) <b>Subspace.</b> x · (1, 1, 0) = 0 and x · (0, 1, 1) = 0, so W = ker${M([[1, 1, 0], [0, 1, 1]])}.</p>
        <p>(c) <b>Not a subspace.</b> 0 + 0 ≠ 1, so 0 ∉ W.</p>
        <p>(d) <b>Not a subspace.</b> a = 1, b = 0 gives (2, 1, 0) ∈ W, but (−1)(2, 1, 0) = (−2, −1, 0) would need a = −1 &lt; 0. Not in W.</p>`,
    checklist: [
      "(a) Noticed the line goes through 0, and wrote it as an image (or kernel).",
      "(b) Kernel of the matrix with rows (1, 1, 0) and (0, 1, 1).",
      "(c) Not a subspace: 0 ∉ W.",
      "(d) Not a subspace, with a specific negative multiple.",
    ],
    explain: "A restriction on the parameters (a ≥ 0) breaks closure under negative scalars, even though the formula looks like an image.",
  },
]);

// ============================================================================ Independence
w("independence", [
  {
    id: "ind-param", lec: [7], sec: "parameters",
    q: `<p>Let v<sub>1</sub> = ${V(1, 0, 1, 2)}, v<sub>2</sub> = ${V(0, 1, 1, -1)}, v<sub>3</sub> = ${V(1, 1, "k", 1)}, v<sub>4</sub> = ${V(2, 1, 3, "k")}.</p>
        <p>(a) For which k are v<sub>1</sub>, v<sub>2</sub>, v<sub>3</sub> linearly independent? (b) For the bad value(s), write v<sub>3</sub> as a combination of v<sub>1</sub> and v<sub>2</sub>. (c) For which k do v<sub>1</sub>, …, v<sub>4</sub> form a basis of ℝ<sup>4</sup>? (d) When k = 3, what is dim span(v<sub>1</sub>, …, v<sub>4</sub>)?</p>`,
    model: `<p>Row reduce [v<sub>1</sub> v<sub>2</sub> v<sub>3</sub> v<sub>4</sub>]: R<sub>3</sub> − R<sub>1</sub> − R<sub>2</sub> and R<sub>4</sub> − 2R<sub>1</sub> + R<sub>2</sub> give</p>
        <div class="mrow">${M([[1, 0, 1, 2], [0, 1, 1, 1], [0, 0, "k − 2", 0], [0, 0, 0, "k − 3"]])}</div>
        <p>(a) Column 3 has a pivot ⇔ k ≠ 2. <b>Independent ⇔ k ≠ 2.</b></p>
        <p>(b) k = 2: v<sub>3</sub> = v<sub>1</sub> + v<sub>2</sub> (check: (1, 1, 2, 1) ✓).</p>
        <p>(c) Need 4 pivots: k − 2 ≠ 0 and k − 3 ≠ 0. <b>Basis ⇔ k ≠ 2 and k ≠ 3.</b></p>
        <p>(d) k = 3: pivots in columns 1, 2, 3 only, so dim = 3.</p>`,
    checklist: [
      "Row reduced with k kept as a letter (no dividing by k − 2 without a case split).",
      "(a) k ≠ 2.",
      "(b) v₃ = v₁ + v₂ when k = 2.",
      "(c) k ≠ 2 and k ≠ 3, with the reason (4 pivots).",
      "(d) dim = 3.",
    ],
    explain: "Independence = a pivot in every column. With a parameter, the pivots that depend on k are where the answer changes.",
  },
  {
    id: "ind-proofs", lec: [7, 8], sec: "new-from-old",
    q: `<p>Prove each statement.</p>
        <p>(a) If v<sub>1</sub>, v<sub>2</sub>, v<sub>3</sub> are linearly independent, so are v<sub>1</sub> + v<sub>2</sub>, v<sub>2</sub> + v<sub>3</sub>, v<sub>1</sub> + v<sub>3</sub>.<br>
        (b) If A is n×p and B is p×m, then im(AB) ⊆ im(A).<br>
        (c) If A is 6×6 and A<sup>2</sup> = 0, then rank(A) ≤ 3.</p>`,
    model: `<p>(a) Suppose a(v<sub>1</sub> + v<sub>2</sub>) + b(v<sub>2</sub> + v<sub>3</sub>) + c(v<sub>1</sub> + v<sub>3</sub>) = 0. Collect: (a + c)v<sub>1</sub> + (a + b)v<sub>2</sub> + (b + c)v<sub>3</sub> = 0. The v’s are independent, so a + c = 0, a + b = 0, b + c = 0. Then a = −c and b = −a = c, so b + c = 2c = 0: c = 0, then a = b = 0. Only the trivial relation, so they’re independent. ∎</p>
        <p>(b) Let y ∈ im(AB). Then y = ABx for some x. Write y = A(Bx): it’s A times the vector Bx, so y ∈ im(A). ∎</p>
        <p>(c) A<sup>2</sup> = 0 means A(Ax) = 0 for all x, so every Ax is in ker(A): im(A) ⊆ ker(A). So rank(A) = dim im(A) ≤ dim ker(A). Rank–nullity: rank(A) + dim ker(A) = 6, so 2·rank(A) ≤ 6, rank(A) ≤ 3. ∎</p>`,
    checklist: [
      "(a) Started from a general relation and collected coefficients of v₁, v₂, v₃.",
      "(a) Solved the system to get a = b = c = 0 and concluded.",
      "(b) Wrote y = ABx = A(Bx) and concluded y ∈ im(A).",
      "(c) Showed im(A) ⊆ ker(A) from A² = 0.",
      "(c) Used rank–nullity to finish (2·rank ≤ 6).",
    ],
    explain: "Independence proofs: start with a relation, use what you know to force every coefficient to 0. Subset proofs: take an element of the left side and show it fits the right side’s definition.",
  },
]);

// ============================================================================ Basis & dimension
w("basis-dimension", [
  {
    id: "bd-param", lec: [8], sec: "bases-of-rn",
    q: `<p>Let v<sub>1</sub> = ${V(1, 1, "k")}, v<sub>2</sub> = ${V(1, "k", 1)}, v<sub>3</sub> = ${V("k", 1, 1)}.</p>
        <p>(a) For which k do v<sub>1</sub>, v<sub>2</sub>, v<sub>3</sub> form a basis of ℝ<sup>3</sup>? (b) When k = 1, find dim span(v<sub>1</sub>, v<sub>2</sub>, v<sub>3</sub>) and a basis of the span. (c) When k = −2, find a nontrivial relation among v<sub>1</sub>, v<sub>2</sub>, v<sub>3</sub>.</p>`,
    model: `<p>(a) S = [v<sub>1</sub> v<sub>2</sub> v<sub>3</sub>] = ${M([[1, 1, "k"], [1, "k", 1], ["k", 1, 1]])}. R<sub>2</sub> − R<sub>1</sub> = (0, k − 1, 1 − k); R<sub>3</sub> − kR<sub>1</sub> = (0, 1 − k, 1 − k²); then R<sub>3</sub> + R<sub>2</sub>:</p>
        <div class="mrow">${M([[1, 1, "k"], [0, "k − 1", "1 − k"], [0, 0, "2 − k − k²"]])}, &nbsp; 2 − k − k² = −(k − 1)(k + 2)</div>
        <p>3 pivots ⇔ k − 1 ≠ 0 and (k − 1)(k + 2) ≠ 0. <b>Basis ⇔ k ≠ 1 and k ≠ −2.</b></p>
        <p>(b) k = 1: all three vectors are (1, 1, 1). dim = 1, basis {(1, 1, 1)}.</p>
        <p>(c) k = −2: v<sub>1</sub> + v<sub>2</sub> + v<sub>3</sub> = (1 + 1 − 2, 1 − 2 + 1, −2 + 1 + 1) = 0. Relation: v<sub>1</sub> + v<sub>2</sub> + v<sub>3</sub> = 0.</p>`,
    checklist: [
      "Row reduced with k as a letter and found the condition (k − 1)(k + 2) ≠ 0 (or equivalent).",
      "(a) k ≠ 1, −2.",
      "(b) dim 1 with basis {(1, 1, 1)}.",
      "(c) A correct nontrivial relation, checked.",
    ],
    explain: "n vectors in ℝⁿ form a basis exactly when the matrix they make is invertible (n pivots).",
  },
  {
    id: "bd-reasoning", lec: [8], sec: "rank-nullity",
    q: `<p>Answer with a short reason each.</p>
        <p>(a) A is 5×7 with dim ker(A) = 3. Find rank(A) and dim im(A). Is im(A) = ℝ<sup>5</sup>?<br>
        (b) T: ℝ<sup>6</sup> → ℝ<sup>4</sup> is linear. List every possible value of dim ker(T).<br>
        (c) V and W are subspaces of ℝ<sup>6</sup> with dim V = dim W = 4. What’s the smallest possible dim(V ∩ W)?<br>
        (d) Is there a 3×3 matrix with im(A) = ker(A)? A 4×4 one? Give an example or a reason.</p>`,
    model: `<p>(a) rank = dim im = 7 − 3 = <b>4</b>. im(A) is a 4-dimensional subspace of ℝ<sup>5</sup>, so <b>not</b> all of ℝ<sup>5</sup>.</p>
        <p>(b) rank(T) ≤ 4, so dim ker = 6 − rank ∈ <b>{2, 3, 4, 5, 6}</b>.</p>
        <p>(c) dim(V ∩ W) = 4 + 4 − dim(V + W) ≥ 8 − 6 = <b>2</b>.</p>
        <p>(d) If im(A) = ker(A), their dims are equal and add to n. For n = 3 that would make each 1.5: <b>impossible</b>. For n = 4 it works with dims 2 and 2: A = ${M([[0, 0, 1, 0], [0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 0]])} has im = ker = span(e<sub>1</sub>, e<sub>2</sub>).</p>`,
    checklist: [
      "(a) rank 4, dim im 4, and im(A) ≠ ℝ⁵.",
      "(b) {2, 3, 4, 5, 6} with the rank ≤ 4 reason.",
      "(c) 2, using dim(V + W) ≤ 6.",
      "(d) No for 3×3 (odd n) with the rank–nullity reason.",
      "(d) A valid 4×4 example (checked im = ker).",
    ],
    explain: "Almost every dimension question is rank–nullity plus “a subspace of ℝⁿ has dimension at most n.”",
  },
]);

// ============================================================================ Orthogonal complements
w("orth-complement", [
  {
    id: "oc-span", lec: [11], sec: "find-perp",
    q: `<p>Let V = span(v<sub>1</sub>, v<sub>2</sub>) in ℝ<sup>4</sup>, with v<sub>1</sub> = ${V(1, 0, 2, -1)}, v<sub>2</sub> = ${V(0, 1, -1, 3)}.</p>
        <p>(a) Find a basis of V<sup>⊥</sup> and dim V<sup>⊥</sup>. (b) Find a basis of ℝ<sup>4</sup> that contains a basis of V, and explain why it’s a basis. (c) Write V as the kernel of a matrix. (d) Find a basis of (V<sup>⊥</sup>)<sup>⊥</sup>.</p>`,
    model: `<p>(a) V<sup>⊥</sup> = ker${M([[1, 0, 2, -1], [0, 1, -1, 3]])} (already rref). x<sub>3</sub> = s, x<sub>4</sub> = t; x<sub>1</sub> = −2s + t, x<sub>2</sub> = s − 3t:</p>
        <div class="mrow">V<sup>⊥</sup> = span${set(V(-2, 1, 1, 0), V(1, -3, 0, 1))}, &nbsp; dim 2.</div>
        <p>Check: (−2, 1, 1, 0)·v<sub>1</sub> = −2 + 2 = 0, ·v<sub>2</sub> = 1 − 1 = 0; (1, −3, 0, 1)·v<sub>1</sub> = 1 − 1 = 0, ·v<sub>2</sub> = −3 + 3 = 0 ✓.</p>
        <p>(b) {v<sub>1</sub>, v<sub>2</sub>, (−2, 1, 1, 0), (1, −3, 0, 1)}. 4 vectors in ℝ<sup>4</sup>; they’re independent because V ∩ V<sup>⊥</sup> = {0} (a relation splits into a V part equal to minus a V<sup>⊥</sup> part, so both are 0, and each pair is independent). So they form a basis.</p>
        <p>(c) V = (V<sup>⊥</sup>)<sup>⊥</sup> = ker${M([[-2, 1, 1, 0], [1, -3, 0, 1]])}.</p>
        <p>(d) (V<sup>⊥</sup>)<sup>⊥</sup> = V, so {v<sub>1</sub>, v<sub>2</sub>}.</p>`,
    checklist: [
      "(a) Set up V⊥ as the kernel of the matrix with rows v₁, v₂.",
      "(a) Correct basis (or equivalent) and dim 2.",
      "(b) Combined bases of V and V⊥ into 4 vectors.",
      "(b) Explained why they form a basis (independence + 4 vectors in ℝ⁴).",
      "(c) V = ker of the matrix with rows = basis of V⊥.",
      "(d) (V⊥)⊥ = V, basis {v₁, v₂}.",
    ],
    explain: "V⊥ = kernel of the matrix whose rows span V; (V⊥)⊥ = V; and bases of V and V⊥ together make a basis of ℝⁿ.",
  },
  {
    id: "oc-equation", lec: [7, 11], sec: "properties",
    q: `<p>V = { x ∈ ℝ<sup>4</sup> : x<sub>1</sub> + 2x<sub>2</sub> − x<sub>3</sub> + x<sub>4</sub> = 0 }.</p>
        <p>(a) What is dim V? (b) Find a basis of V<sup>⊥</sup>. (c) Find a basis of V. (d) Show that the vectors from (b) and (c) together form a basis of ℝ<sup>4</sup>.</p>`,
    model: `<p>(a) V = ker${M([[1, 2, -1, 1]])}, rank 1, so dim V = 4 − 1 = <b>3</b>.</p>
        <p>(b) x ∈ V ⇔ x · (1, 2, −1, 1) = 0, so V = span(1, 2, −1, 1)<sup>⊥</sup> and V<sup>⊥</sup> = span${set(V(1, 2, -1, 1))}, dim 1 = 4 − 3 ✓.</p>
        <p>(c) x<sub>1</sub> = −2x<sub>2</sub> + x<sub>3</sub> − x<sub>4</sub>: ${set(V(-2, 1, 0, 0), V(1, 0, 1, 0), V(-1, 0, 0, 1))}.</p>
        <p>(d) 1 + 3 = 4 vectors in ℝ<sup>4</sup>. The three V-vectors are independent (free-variable slots). The normal n = (1, 2, −1, 1) isn’t in V (n · n = 7 ≠ 0), so it isn’t a combination of them; adding a vector outside the span keeps the list independent. 4 independent vectors in ℝ<sup>4</sup> form a basis. (Or: the 4×4 matrix has rref I<sub>4</sub>.)</p>`,
    checklist: [
      "(a) dim V = 3 via rank–nullity.",
      "(b) V⊥ spanned by the normal (1, 2, −1, 1).",
      "(c) A correct basis of V (3 vectors, each checked in the equation).",
      "(d) A real argument that the 4 vectors are independent.",
    ],
    explain: "For a hyperplane a · x = 0, V⊥ is the line through the normal a.",
  },
]);

// ============================================================================ Projections
w("projections", [
  {
    id: "pr-full", lec: [11], sec: "projection",
    q: `<p>Let V = span(v<sub>1</sub>, v<sub>2</sub>) in ℝ<sup>4</sup>, with v<sub>1</sub> = ${V(1, 2, 2, 0)} and v<sub>2</sub> = ${V(2, -1, 0, 2)}.</p>
        <p>(a) Explain why {⅓v<sub>1</sub>, ⅓v<sub>2</sub>} is an orthonormal basis of V. (b) For x = ${V(1, 3, 1, 5)}, find x<sup>∥</sup> = proj<sub>V</sub>x. (c) Find x<sup>⊥</sup> and show it’s in V<sup>⊥</sup>. (d) Find the matrix P of the projection onto V.</p>`,
    model: `<p>(a) v<sub>1</sub> · v<sub>2</sub> = 2 − 2 + 0 + 0 = 0, and ‖v<sub>1</sub>‖ = √9 = 3 = ‖v<sub>2</sub>‖. So u<sub>i</sub> = ⅓v<sub>i</sub> are perpendicular unit vectors (orthonormal, hence independent) that span V: an orthonormal basis.</p>
        <p>(b) u<sub>1</sub> · x = ⅓(1 + 6 + 2 + 0) = 3, u<sub>2</sub> · x = ⅓(2 − 3 + 0 + 10) = 3. x<sup>∥</sup> = 3u<sub>1</sub> + 3u<sub>2</sub> = v<sub>1</sub> + v<sub>2</sub> = <b>(3, 1, 2, 2)</b>.</p>
        <p>(c) x<sup>⊥</sup> = x − x<sup>∥</sup> = <b>(−2, 2, −1, 3)</b>. x<sup>⊥</sup> · v<sub>1</sub> = −2 + 4 − 2 + 0 = 0 and x<sup>⊥</sup> · v<sub>2</sub> = −4 − 2 + 0 + 6 = 0, so it’s perpendicular to a basis of V, hence in V<sup>⊥</sup>.</p>
        <p>(d) P = u<sub>1</sub>u<sub>1</sub><sup>T</sup> + u<sub>2</sub>u<sub>2</sub><sup>T</sup> = ⅑(v<sub>1</sub>v<sub>1</sub><sup>T</sup> + v<sub>2</sub>v<sub>2</sub><sup>T</sup>) = ⅑${M([[5, 0, 2, 4], [0, 5, 4, -2], [2, 4, 4, 0], [4, -2, 0, 4]])}. (Check: Px = (3, 1, 2, 2).)</p>`,
    checklist: [
      "(a) Showed v₁ · v₂ = 0 and both lengths are 3.",
      "(b) Correct coefficients and x∥ = (3, 1, 2, 2).",
      "(c) x⊥ = (−2, 2, −1, 3).",
      "(c) Checked x⊥ · v₁ = x⊥ · v₂ = 0 and concluded x⊥ ∈ V⊥.",
      "(d) Correct projection matrix.",
    ],
    explain: "proj_V x = Σ (uᵢ·x)uᵢ needs an orthonormal (or orthogonal) basis; x⊥ = x − x∥ must be perpendicular to V.",
  },
]);

// ============================================================================ Coordinates
w("coordinates", [
  {
    id: "co-plane", lec: [9], sec: "find-subspace",
    q: `<p>Let B = (v<sub>1</sub>, v<sub>2</sub>) with v<sub>1</sub> = ${V(1, 0, 2)}, v<sub>2</sub> = ${V(1, 1, -1)}, and V = span(B).</p>
        <p>(a) Show x = ${V(4, -1, 11)} is in V and find [x]<sub>B</sub>. (b) Is y = ${V(1, 2, 0)} in V? (c) If [z]<sub>B</sub> = ${V(-2, 3)}, find z. (d) Write V as the kernel of a 1×3 matrix.</p>`,
    model: `<p>(a) Solve c<sub>1</sub>v<sub>1</sub> + c<sub>2</sub>v<sub>2</sub> = x: c<sub>1</sub> + c<sub>2</sub> = 4, c<sub>2</sub> = −1, 2c<sub>1</sub> − c<sub>2</sub> = 11. So c<sub>2</sub> = −1, c<sub>1</sub> = 5, and 2(5) − (−1) = 11 ✓. Consistent: x ∈ V, <b>[x]<sub>B</sub> = (5, −1)</b>.</p>
        <p>(b) c<sub>2</sub> = 2, c<sub>1</sub> = −1, but then 2c<sub>1</sub> − c<sub>2</sub> = −4 ≠ 0. Inconsistent: <b>y ∉ V</b> ([y]<sub>B</sub> doesn’t exist).</p>
        <p>(c) z = −2v<sub>1</sub> + 3v<sub>2</sub> = (−2, 0, −4) + (3, 3, −3) = <b>(1, 3, −7)</b>.</p>
        <p>(d) A normal to V: n = (−2, 3, 1) (n · v<sub>1</sub> = −2 + 2 = 0, n · v<sub>2</sub> = −2 + 3 − 1 = 0). V = ker${M([[-2, 3, 1]])}. (Check: z gives −2 + 9 − 7 = 0 ✓.)</p>`,
    checklist: [
      "(a) Set up the system and found [x]_B = (5, −1), including checking the third equation.",
      "(b) Concluded y ∉ V because the system is inconsistent.",
      "(c) z = (1, 3, −7).",
      "(d) A correct 1×3 matrix (any nonzero multiple of (−2, 3, 1)).",
    ],
    explain: "On a subspace, S isn’t square: always solve S c = x and check every equation.",
  },
  {
    id: "co-design", lec: [9], sec: "reverse",
    q: `<p>Find a basis B = (v<sub>1</sub>, v<sub>2</sub>) of ℝ<sup>2</sup> such that</p>
        <div class="mrow">[${V(1, 2)}]<sub>B</sub> = ${V(3, 5)} &nbsp; and &nbsp; [${V(3, 4)}]<sub>B</sub> = ${V(2, 3)}.</div>
        <p>Then check your answer.</p>`,
    model: `<p>x = S[x]<sub>B</sub> for both vectors at once: S${M([[3, 2], [5, 3]])} = ${M([[1, 3], [2, 4]])}.</p>
        <p>${M([[3, 2], [5, 3]])}<sup>−1</sup> = 1/(9 − 10)${M([[3, -2], [-5, 3]])} = ${M([[-3, 2], [5, -3]])}, so</p>
        <div class="mrow">S = ${M([[1, 3], [2, 4]])}${M([[-3, 2], [5, -3]])} = ${M([[12, -7], [14, -8]])}: &nbsp; v<sub>1</sub> = (12, 14), v<sub>2</sub> = (−7, −8).</div>
        <p>Check: 3v<sub>1</sub> + 5v<sub>2</sub> = (36 − 35, 42 − 40) = (1, 2) ✓, and 2v<sub>1</sub> + 3v<sub>2</sub> = (24 − 21, 28 − 24) = (3, 4) ✓. det S = −96 + 98 = 2 ≠ 0, so it’s a basis.</p>`,
    checklist: [
      "Wrote the condition as S·C = X (or two vector equations) correctly.",
      "Correct inverse of [[3, 2], [5, 3]] (or solved the systems correctly).",
      "v₁ = (12, 14), v₂ = (−7, −8).",
      "Checked both coordinate conditions and that B is a basis.",
    ],
    explain: "x = S[x]_B works for several x at once: put them side by side as matrix columns.",
  },
]);

// ============================================================================ B-matrix
w("b-matrix", [
  {
    id: "bm-diag", lec: [10], sec: "formula",
    q: `<p>T(x) = Ax with A = ${M([[4, -2], [1, 1]])}, and B = (${V(1, 1)}, ${V(2, 1)}).</p>
        <p>(a) Explain why B is a basis of ℝ<sup>2</sup>. (b) Find [x]<sub>B</sub> for x = ${V(3, 1)}. (c) Find the B-matrix [T]<sub>B</sub>. (d) Use (b) and (c) to find T(x), and check it against Ax.</p>`,
    model: `<p>(a) S = ${M([[1, 2], [1, 1]])}, det S = 1 − 2 = −1 ≠ 0, so S is invertible and its columns form a basis.</p>
        <p>(b) S<sup>−1</sup> = −1·${M([[1, -2], [-1, 1]])} = ${M([[-1, 2], [1, -1]])}; [x]<sub>B</sub> = S<sup>−1</sup>(3, 1) = <b>(−1, 2)</b>. Check: −(1, 1) + 2(2, 1) = (3, 1) ✓.</p>
        <p>(c) Av<sub>1</sub> = (2, 2) = 2v<sub>1</sub>, Av<sub>2</sub> = (6, 3) = 3v<sub>2</sub>, so <b>[T]<sub>B</sub> = ${M([[2, 0], [0, 3]])}</b>. (Same from S<sup>−1</sup>AS.)</p>
        <p>(d) [T(x)]<sub>B</sub> = B[x]<sub>B</sub> = (−2, 6), so T(x) = −2(1, 1) + 6(2, 1) = (10, 4). Ax = (12 − 2, 3 + 1) = (10, 4) ✓.</p>`,
    checklist: [
      "(a) Showed S is invertible (det or rref).",
      "(b) [x]_B = (−1, 2).",
      "(c) [T]_B = diag(2, 3), by columns or by S⁻¹AS.",
      "(d) Used [T(x)]_B = B[x]_B, converted back, and matched Ax = (10, 4).",
    ],
    explain: "B-matrix columns are the B-coordinates of T(v₁), T(v₂). Here each vᵢ is just stretched, so B is diagonal.",
  },
  {
    id: "bm-columns", lec: [10], sec: "column",
    q: `<p>T(x) = Ax with A = ${M([[1, 2], [3, 0]])}, and B = (${V(1, 1)}, ${V(1, -1)}). Find [T]<sub>B</sub> two ways: column by column, and with B = S<sup>−1</sup>AS. Then verify AS = SB.</p>`,
    model: `<p><b>Columns.</b> T(v<sub>1</sub>) = (3, 3) = 3v<sub>1</sub> + 0v<sub>2</sub> → column (3, 0). T(v<sub>2</sub>) = (−1, 3) = a(1, 1) + b(1, −1): a + b = −1, a − b = 3, so a = 1, b = −2 → column (1, −2).</p>
        <div class="mrow">[T]<sub>B</sub> = ${M([[3, 1], [0, -2]])}</div>
        <p><b>Formula.</b> S = ${M([[1, 1], [1, -1]])}, S<sup>−1</sup> = −½${M([[-1, -1], [-1, 1]])} = ½${M([[1, 1], [1, -1]])}. AS = ${M([[3, -1], [3, 3]])}; S<sup>−1</sup>AS = ½${M([[6, 2], [0, -4]])} = ${M([[3, 1], [0, -2]])} ✓.</p>
        <p><b>Check.</b> SB = ${M([[1, 1], [1, -1]])}${M([[3, 1], [0, -2]])} = ${M([[3, -1], [3, 3]])} = AS ✓.</p>`,
    checklist: [
      "Column 1: [T(v₁)]_B = (3, 0).",
      "Column 2: [T(v₂)]_B = (1, −2), solving for the coefficients.",
      "Correct S⁻¹ and product S⁻¹AS.",
      "Verified AS = SB.",
    ],
    explain: "Writing T(v₂) itself, (−1, 3), into the matrix is the classic mistake: the column must be its B-coordinates.",
  },
  {
    id: "bm-reflect", lec: [10], sec: "geometric",
    q: `<p>T is the reflection about the line L spanned by ${V(1, 3)} in ℝ<sup>2</sup>.</p>
        <p>(a) Find a basis B of ℝ<sup>2</sup> such that [T]<sub>B</sub> is diagonal, and give [T]<sub>B</sub>. Explain geometrically. (b) Use (a) to find the standard matrix A of T. (c) Describe ker(T) and im(T).</p>`,
    model: `<p>(a) v<sub>1</sub> = (1, 3) on L: T(v<sub>1</sub>) = v<sub>1</sub>. v<sub>2</sub> = (−3, 1) ⊥ L: T(v<sub>2</sub>) = −v<sub>2</sub>. So with B = (v<sub>1</sub>, v<sub>2</sub>), <b>[T]<sub>B</sub> = ${M([[1, 0], [0, -1]])}</b>.</p>
        <p>(b) S = ${M([[1, -3], [3, 1]])}, det 10, S<sup>−1</sup> = <sup>1</sup>⁄<sub>10</sub>${M([[1, 3], [-3, 1]])}.</p>
        <div class="mrow">A = SBS<sup>−1</sup> = ${M([[1, 3], [3, -1]])} · <sup>1</sup>⁄<sub>10</sub>${M([[1, 3], [-3, 1]])} = <sup>1</sup>⁄<sub>10</sub>${M([[-8, 6], [6, 8]])} = ${M([["−0.8", "0.6"], ["0.6", "0.8"]])}</div>
        <p>Check: A(1, 3) = (−0.8 + 1.8, 0.6 + 2.4) = (1, 3) ✓, and it has the reflection form [[a, b], [b, −a]] with a² + b² = 1.</p>
        <p>(c) A reflection is invertible (reflect twice to undo it): ker(T) = {0}, im(T) = ℝ<sup>2</sup>.</p>`,
    checklist: [
      "(a) Basis with one vector on L and one perpendicular to L.",
      "(a) [T]_B = diag(1, −1) with the geometric reason.",
      "(b) Correct S⁻¹ and A = SBS⁻¹ = [[−0.8, 0.6], [0.6, 0.8]].",
      "(c) ker = {0}, im = ℝ² with a reason.",
    ],
    explain: "For reflections and projections, choose basis vectors on the line/plane and perpendicular to it; T just multiplies them by 1, −1, or 0.",
  },
]);

// ============================================================================ Similarity
w("similarity", [
  {
    id: "si-four", lec: [10], sec: "show-similar",
    q: `<p>Decide whether each pair is similar. If yes, give an invertible S with AS = SB. If no, explain why.</p>
        <p>(a) A = ${M([[1, 2], [0, 3]])}, B = ${M([[1, 0], [0, 3]])}<br>
        (b) A = ${M([[3, 1], [0, 3]])}, B = ${M([[3, 0], [0, 3]])}<br>
        (c) A = ${M([[1, 1], [1, 1]])}, B = ${M([[2, 0], [0, 0]])}<br>
        (d) A = ${M([[1, 2], [2, 4]])}, B = ${M([[5, 0], [0, 1]])}</p>`,
    model: `<p>(a) <b>Yes.</b> S = ${M([["a", "b"], ["c", "d"]])}: AS = ${M([["a + 2c", "b + 2d"], ["3c", "3d"]])}, SB = ${M([["a", "3b"], ["c", "3d"]])}. So c = 0 and b = d. S = ${M([[1, 1], [0, 1]])} (det 1). Check: A(1, 0) = (1, 0), A(1, 1) = (3, 3) = 3(1, 1) ✓.</p>
        <p>(b) <b>No.</b> B = 3I, and S<sup>−1</sup>(3I)S = 3I for every S, so only 3I is similar to 3I. A ≠ 3I.</p>
        <p>(c) <b>Yes.</b> A(1, 1) = (2, 2) = 2(1, 1) and A(1, −1) = (0, 0). So S = ${M([[1, 1], [1, -1]])} (det −2) gives AS = ${M([[2, 0], [2, 0]])} = SB ✓.</p>
        <p>(d) <b>No.</b> rank(A) = 1 (row 2 = 2·row 1) but rank(B) = 2. Similar matrices have the same rank.</p>`,
    checklist: [
      "(a) Solved AS = SB and gave an invertible S.",
      "(b) No, with the “only kI is similar to kI” reason (or AS = SB forces det S = 0).",
      "(c) Yes, with an invertible S that checks.",
      "(d) No, with the rank reason.",
      "Every “yes” answer checks that S is invertible.",
    ],
    explain: "To prove similar: find an invertible S. To prove not similar: find an invariant (rank, nullity, being kI) that differs.",
  },
]);
})();
