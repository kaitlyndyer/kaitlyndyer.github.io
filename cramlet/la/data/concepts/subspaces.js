(function () {
"use strict";
const { M, V, set } = LA;

registerConcept({
  id: "subspaces",
  oneLiner:
    "A <b>subspace</b> is a set of vectors that contains <b>0</b> and is <b>closed under addition and scalar multiplication</b>. Lines and planes through the origin, kernels, images, and spans are all subspaces.",

  related: ["kernel-image", "independence", "basis-dimension"],

  summary: {
    keyPoints: [
      { lec: [6], kind: "key", html: "W ⊆ ℝ<sup>n</sup> is a subspace if (a) <b>0 ∈ W</b>, (b) <b>u, v ∈ W ⇒ u + v ∈ W</b>, and (c) <b>v ∈ W, k ∈ ℝ ⇒ kv ∈ W</b>." },
      { lec: [6], html: "Every kernel and every image is a subspace. So is every span. So the fastest proof that W is a subspace is to <b>write it as ker(A) or im(A)</b>." },
      { lec: [6], html: "<b>Given by equations</b> (all = 0) → it’s a <b>kernel</b>: the coefficients of the equations are the rows of A. <b>Given by parameters</b> (a, b, … free) → it’s an <b>image</b>: the vectors multiplying the parameters are the columns of A." },
      { lec: [6], kind: "warn", html: "To show W is <b>not</b> a subspace, give one <b>specific counterexample</b>: 0 ∉ W, or two vectors in W whose sum isn’t, or a vector whose multiple isn’t." },
      { lec: [6], html: "Red flags: a nonzero constant (“= 1”, “+ d”), squares or products of variables (x², xy), inequalities (≥, ≤), absolute values." },
      { lec: [6], html: "The subspaces of ℝ<sup>2</sup>: {0}, lines through 0, ℝ<sup>2</sup>. Of ℝ<sup>3</sup>: {0}, lines through 0, planes through 0, ℝ<sup>3</sup>." },
    ],
    compare: {
      head: ["The set", "Subspace?", "Why"],
      rows: [
        ["{ x : x₁ + 2x₂ − x₃ = 0 }", "Yes", "= ker [1 2 −1]"],
        ["{ (a + b, 2a, −b) : a, b ∈ ℝ }", "Yes", "= im of the 3×2 matrix with columns (1, 2, 0), (1, 0, −1)"],
        ["{ x : x₁ + x₂ = 1 }", "No", "0 isn’t in it"],
        ["{ (x, y) : xy ≥ 0 }", "No", "(1, 0) + (0, −1) = (1, −1) has xy < 0"],
        ["{ (x, y) : x ≥ 0 }", "No", "(1, 0) is in it, (−1)(1, 0) isn’t"],
        ["{ (x, y) : x² + y² = 0 }", "Yes", "it’s just {0}"],
      ],
    },
  },

  details: [
    {
      id: "definition",
      title: "The three conditions",
      lec: [6],
      html: `
        <p>A subset W of ℝ<sup>n</sup> is a (linear) <b>subspace</b> if:</p>
        <ol>
          <li><b>W contains the zero vector.</b></li>
          <li><b>W is closed under addition:</b> if u and v are in W, so is u + v.</li>
          <li><b>W is closed under scalar multiplication:</b> if v is in W and k is any real number, kv is in W.</li>
        </ol>
        <p>Together, (2) and (3) mean W is closed under <b>linear combinations</b>: any c<sub>1</sub>w<sub>1</sub> + … + c<sub>p</sub>w<sub>p</sub> with w<sub>i</sub> in W stays in W.</p>
        <p class="callout tip">Check condition 1 first: it’s the fastest way to rule a set out. Any set defined by an equation with a nonzero constant (x + y + z = 1, or a plane ax + by + cz + d = 0 with d ≠ 0) fails right away.</p>`,
    },
    {
      id: "first-quadrant",
      title: "Example: the first quadrant isn’t a subspace",
      lec: [6],
      html: `
        <p>W = { (x, y) : x ≥ 0 and y ≥ 0 }. It contains 0 and it’s closed under addition (adding nonnegative numbers stays nonnegative). But it fails scalar multiplication:</p>
        <div class="mrow">${V(1, 1)} ∈ W, but (−1)${V(1, 1)} = ${V(-1, -1)} ∉ W.</div>
        <p>Your notes worked exactly this example in Lecture 6: “pick some vector in the area and multiply by a negative: does it stay? No.”</p>
        <p>Compare W = { (x, y) : xy ≥ 0 } (first and third quadrants). Now scalar multiplication works (k²xy ≥ 0), but <b>addition</b> fails: (1, 0) and (0, −1) are both in W, but their sum (1, −1) has xy = −1 &lt; 0.</p>
        <p class="callout warn">A counterexample must use <b>specific numbers</b>. “It might not be closed” earns nothing. “(1, 0) and (0, −1) are in W but (1, −1) isn’t” is a full answer.</p>`,
    },
    {
      id: "as-kernel",
      title: "Writing a subspace as a kernel",
      lec: [6],
      html: `
        <p>If W is cut out by <b>homogeneous</b> equations (every equation is “… = 0”), stack the coefficients as rows:</p>
        <div class="mrow">W = { x ∈ ℝ<sup>3</sup> : 2x<sub>1</sub> − x<sub>3</sub> = 0, x<sub>1</sub> + 4x<sub>2</sub> = 0 } = ker ${M([[2, 0, -1], [1, 4, 0]])}</div>
        <p>Watch the zeros: x<sub>2</sub> doesn’t appear in the first equation, so its coefficient is 0. Then W is a kernel, so it’s a subspace. Done.</p>`,
    },
    {
      id: "as-image",
      title: "Writing a subspace as an image",
      lec: [6],
      html: `
        <p>If W is described with <b>parameters</b>, pull the parameters out as coefficients:</p>
        <div class="mrow">W = { ${V("a − 2b", "3a", "b", "a + b")} : a, b ∈ ℝ } = { a${V(1, 3, 0, 1)} + b${V(-2, 0, 1, 1)} } = im ${M([[1, -2], [3, 0], [0, 1], [1, 1]])}</div>
        <p>The vectors multiplying the parameters become the columns. Then W is an image (a span), so it’s a subspace.</p>
        <p class="callout warn">A constant term breaks this. { (a, a + 1) : a ∈ ℝ } is a line that misses the origin (a = 0 gives (0, 1); no choice of a gives (0, 0)), so it’s not a subspace.</p>`,
    },
    {
      id: "both-ways",
      title: "Same subspace, both ways",
      lec: [6],
      html: `
        <p>The plane V: x<sub>1</sub> + 2x<sub>2</sub> + 3x<sub>3</sub> = 0 in ℝ<sup>3</sup> (the textbook’s Example 3.2.3):</p>
        <ul>
          <li>As a kernel: V = ker${M([[1, 2, 3]])}.</li>
          <li>As an image: solve for x<sub>1</sub> = −2x<sub>2</sub> − 3x<sub>3</sub>. The kernel basis is ${V(-2, 1, 0)}, ${V(-3, 0, 1)}, so V = im${M([[-2, -3], [1, 0], [0, 1]])}.</li>
        </ul>
        <p>Going from kernel to image = finding a kernel basis. Going from image to kernel = finding the equations the outputs satisfy (see Image &amp; Kernel → “Is a vector b in the image?”).</p>
        <p class="callout key">Every subspace V of ℝ<sup>n</sup> is the image of some matrix (put a basis in the columns), and the kernel of some matrix (put a basis of V<sup>⊥</sup> in the rows).</p>`,
    },
    {
      id: "union-intersection",
      title: "Intersections, unions, and sums",
      lec: [6],
      html: `
        <ul>
          <li><b>V ∩ W</b> is always a subspace (if u, v are in both, so is u + v).</li>
          <li><b>V ∪ W</b> usually isn’t. The x-axis ∪ the y-axis contains (1, 0) and (0, 1) but not (1, 1).</li>
          <li><b>V + W</b> = { v + w : v ∈ V, w ∈ W } is always a subspace: the smallest one containing both.</li>
          <li>The set of solutions of Ax = b with <b>b ≠ 0</b> is never a subspace: 0 isn’t a solution.</li>
        </ul>`,
    },
  ],

  flashcards: [
    { front: "Three conditions for a subspace", back: "Contains 0; closed under addition; closed under scalar multiplication." },
    { front: "Fastest way to prove W is a subspace", back: "Write it as ker(A) (equations = 0) or im(A) (parameters), or as a span." },
    { front: "W is given by equations = 0. Which matrix?", back: "W = ker(A), where row i of A holds the coefficients of equation i." },
    { front: "W = { a·u + b·v : a, b ∈ ℝ }. Which matrix?", back: "W = im[u v], with u and v as the columns." },
    { front: "How do you show W is NOT a subspace?", back: "A specific counterexample: 0 ∉ W, or u, v ∈ W with u + v ∉ W, or v ∈ W with kv ∉ W." },
    { front: "Is { x : x₁ + x₂ + x₃ = 1 } a subspace?", back: "No: 0 + 0 + 0 ≠ 1, so 0 isn’t in it." },
    { front: "Is the union of two subspaces a subspace?", back: "Not in general: x-axis ∪ y-axis contains (1, 0) and (0, 1) but not their sum." },
    { front: "Subspaces of ℝ³", back: "{0}, lines through 0, planes through 0, and ℝ³ itself." },
  ],

  quiz: [
    {
      type: "mc", lec: [6],
      q: "Which set is a subspace of ℝ³?",
      options: ["{ x : x₁ = 2x₂ and x₃ = 0 }", "{ x : x₁ = x₂ + 1 }", "{ x : x₁x₂ = 0 }", "{ x : x₃ ≥ 0 }"],
      answer: 0,
      explain: "It’s ker of [[1, −2, 0], [0, 0, 1]]. The others fail: no 0 (second), not closed under addition ((1,0,0)+(0,1,0) for the third), not closed under negatives (fourth).",
    },
    {
      type: "mc", lec: [6],
      q: `W = { ${V("2a", "a − b", "3b")} : a, b ∈ ℝ }. W = im(A) for which A?`,
      options: [M([[2, 0], [1, -1], [0, 3]]), M([[2, 1, 0], [0, -1, 3]]), M([[2, 0], [1, 1], [0, 3]]), M([[2, -1, 3]])],
      answer: 0,
      explain: "a(2, 1, 0) + b(0, −1, 3). The vectors multiplying a and b are the columns.",
    },
    {
      type: "tf", lec: [6],
      q: "True or false: the plane 3x − y + 2z = 5 is a subspace of ℝ³.",
      answer: false,
      explain: "3·0 − 0 + 2·0 = 0 ≠ 5, so the origin isn’t on the plane.",
    },
    {
      type: "tf", lec: [6],
      q: "True or false: { (x, y, z) : x² + y² + z² = 0 } is a subspace of ℝ³.",
      answer: true,
      explain: "A sum of squares is 0 only when each is 0, so the set is just {0}, which is a subspace (the smallest one).",
    },
    {
      type: "mc", lec: [6],
      q: "W = { (x, y) : y = |x| }. Which condition fails?",
      options: ["0 ∈ W", "Closed under addition only", "Closed under scalar multiplication (and addition)", "None: it’s a subspace"],
      answer: 2,
      explain: "0 is in W. But (1, 1) ∈ W and (−1)(1, 1) = (−1, −1) isn’t (|−1| = 1 ≠ −1). Addition fails too: (1, 1) + (−1, 1) = (0, 2), and |0| ≠ 2.",
    },
    {
      type: "tf", lec: [6],
      q: "True or false: if V and W are subspaces of ℝⁿ, then V ∩ W is a subspace too.",
      answer: true,
      explain: "0 is in both. If u, v are in both, u + v and ku are in V (it’s a subspace) and in W (same), so in V ∩ W.",
    },
    {
      type: "tf", lec: [6],
      q: "True or false: the solutions of Ax = b form a subspace, for any b.",
      answer: false,
      explain: "Only when b = 0. If b ≠ 0, then A0 = 0 ≠ b, so 0 isn’t a solution.",
    },
  ],
});
})();
