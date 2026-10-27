// Interactive worked examples ("stepper" widget, la/stepper.js), one per concept, shown in each concept's Playground tab.
// Each replays the worked example from that concept's Details, but makes you predict every step first.
// Every question step has a hint (a nudge) and a why (all the arithmetic, plus what the result means).
// Four of them (image & kernel, projections, coordinates, B-matrix) draw a picture (la/figures.js) that fills in as
// you answer: step.fig = { ask, add, caption }.
// All numbers were checked with a computer algebra system.
(function () {
"use strict";
const { M, V, set, blank: b } = LA;
const add = (id, p) => { const c = window.STUDY.content[id]; (c.playground = c.playground || []).push({ id: "walkthrough", widget: "stepper", ...p }); };
const intro = "<p>Grab paper (or Notability) and work each step yourself <b>before</b> you type. Type your answer in the dashed boxes and press <b>Check</b> (or Enter). Stuck? <b>Hint</b>, then <b>Show me</b>. Every step ends with a <b>Why</b> that shows all the working. Finish, then <b>Start over</b> and redo the steps you missed.</p>";
const introPic = intro.replace("</p>", " The <b>picture</b> fills in each time you answer, so you can see what you just found and where it lives.</p>");

// ---------------------------------------------------------------- Toolbox
add("toolbox", {
  title: "Walk through it: an inverse by row reduction", lec: [4, 5], intro,
  config: {
    problem: `Find A<sup>−1</sup> for A = ${M([[1, 2], [3, 7]])} by row reducing [A | I], then use it to solve Ax = ${V(1, 4)}.`,
    steps: [
      { title: "Step 1: set up [A | I]", show: M([[1, 2, 1, 0], [3, 7, 0, 1]], { aug: 2 }),
        why: "We want the matrix X with AX = I. Writing I next to A and row reducing solves all of those equations at once: every row operation that turns the left half into I also acts on the right half, and the right half ends up as A<sup>−1</sup>. If the left half can’t become I (you get a zero row), A has no inverse." },
      { title: "Step 2: clear below the first pivot", ask: "Do R₂ − 3R₁. What is the new row 2?",
        show: M([[1, 2, 1, 0], [b(0), b(1), b(2), b(3)]], { aug: 2 }), answers: [0, 1, -3, 1],
        hint: "First write 3 × row 1 (all four entries, including the right half). Then subtract it from row 2 one entry at a time.",
        why: "3 × row 1 = (3, 6 | 3, 0). Row 2 minus that: (3 − 3, 7 − 6 | 0 − 3, 1 − 0) = (0, 1 | −3, 1). Why 3? It’s the number that makes the entry under the pivot 0 (3 − 3·1 = 0). The new pivot in row 2 is already 1, so there’s nothing to scale." },
      { title: "Step 3: clear above the second pivot", ask: "Do R₁ − 2R₂. What is the new row 1?",
        show: M([[b(0), b(1), b(2), b(3)], [0, 1, -3, 1]], { aug: 2 }), answers: [1, 0, 7, -2],
        hint: "Row 1 has a 2 above the pivot of row 2. Write 2 × row 2, then subtract it from row 1. Careful with minus a negative.",
        why: "2 × row 2 = (0, 2 | −6, 2). Row 1 minus that: (1 − 0, 2 − 2 | 1 − (−6), 0 − 2) = (1, 0 | 7, −2). The trap is 1 − (−6): it’s 7, not −5. The left half is I now, so we’re done reducing." },
      { title: "Step 4: read off the inverse", ask: "So A⁻¹ = ?", show: `A<sup>−1</sup> = ${M([[b(0), b(1)], [b(2), b(3)]])}`, answers: [7, -2, -3, 1],
        hint: "Once the left half is I, the right half is A⁻¹.",
        why: "A<sup>−1</sup> = [[7, −2], [−3, 1]]. Check it with the 2×2 formula: det A = 1·7 − 2·3 = 1, and A<sup>−1</sup> = (1/det) × (swap the diagonal, negate the other two) = [[7, −2], [−3, 1]] ✓. Or multiply: row 1 of A times column 1 of A<sup>−1</sup> is 1·7 + 2·(−3) = 1, and row 1 times column 2 is 1·(−2) + 2·1 = 0, which is the start of I ✓." },
      { title: "Step 5: use it", ask: "Solve Ax = (1, 4) with x = A⁻¹b.", show: `x = ${M([[7, -2], [-3, 1]])}${V(1, 4)} = ${V(b(0), b(1))}`, answers: [-1, 1],
        hint: "Each entry of x is a row of A⁻¹ times (1, 4): multiply matching entries and add.",
        why: "Row 1: 7·1 + (−2)·4 = 7 − 8 = −1. Row 2: (−3)·1 + 1·4 = −3 + 4 = 1. So x = (−1, 1). Why this works: multiply both sides of Ax = b on the left by A<sup>−1</sup>, and A<sup>−1</sup>A = I leaves x = A<sup>−1</sup>b. Check in the original: A(−1, 1) = (1·(−1) + 2·1, 3·(−1) + 7·1) = (1, 4) ✓." },
    ],
  },
});

// ---------------------------------------------------------------- Image & kernel
add("kernel-image", {
  title: "Walk through it: bases of the kernel and image", lec: [7, 8], intro: introPic,
  config: {
    problem: `Find a basis of ker(A) and of im(A), and their dimensions, for A = ${M([[1, -1, 2, 0, 3], [2, -2, 5, 1, 4], [0, 0, 1, 1, -2]])}.`,
    figure: {
      type: "map", view: { name: "A", inDim: 5, outDim: 3 },
      start: { add: [], caption: "A is 3×5. It takes <b>inputs</b> with 5 entries (they live in ℝ⁵) to <b>outputs</b> with 3 entries (ℝ³). ker A is a set of inputs; im A is a set of outputs. Watch both fill in." },
    },
    steps: [
      { title: "Step 1: clear below the first pivot", ask: "Do R₂ − 2R₁. What is the new row 2?",
        show: M([[1, -1, 2, 0, 3], [b(0), b(1), b(2), b(3), b(4)], [0, 0, 1, 1, -2]]), answers: [0, 0, 1, 1, -2],
        hint: "Write 2 × row 1 = (2, −2, 4, 0, 6) first. Then subtract it from row 2, one entry at a time.",
        why: "(2 − 2, −2 − (−2), 5 − 4, 1 − 0, 4 − 6) = (0, 0, 1, 1, −2). Notice that column 2 now has 0 below row 1, and its row-1 entry isn’t a pivot (column 1 already has the pivot in row 1). So column 2 will never get a pivot." },
      { title: "Step 2: row 3", ask: "Row 3 now equals row 2. What is R₃ − R₂?",
        show: M([[1, -1, 2, 0, 3], [0, 0, 1, 1, -2], [b(0), b(1), b(2), b(3), b(4)]]), answers: [0, 0, 0, 0, 0],
        hint: "Subtract matching entries. Two identical rows cancel completely.",
        why: "(0 − 0, 0 − 0, 1 − 1, 1 − 1, −2 − (−2)) = (0, 0, 0, 0, 0). A zero row means the third equation was a combination of the other two (row 3 of A = row 2 − 2·row 1). At most one pivot per nonzero row, so rank(A) ≤ 2.",
        fig: { add: [{ t: "note", side: "out", html: "rref has a zero row ⇒ rank ≤ 2, so im A can’t be all of ℝ³." }],
          caption: "Only 2 nonzero rows left, so at most 2 pivots. The image is at most a plane inside ℝ³: some outputs can never be reached." } },
      { title: "Step 3: clear above the pivot in column 3", ask: "Do R₁ − 2R₂. What is the new row 1?",
        show: M([[b(0), b(1), b(2), b(3), b(4)], [0, 0, 1, 1, -2], [0, 0, 0, 0, 0]]), answers: [1, -1, 0, -2, 7],
        hint: "Row 1 has a 2 above the pivot in column 3. Write 2 × row 2 = (0, 0, 2, 2, −4), then subtract.",
        why: `(1 − 0, −1 − 0, 2 − 2, 0 − 2, 3 − (−4)) = (1, −1, 0, −2, 7). So rref(A) = ${M([[1, -1, 0, -2, 7], [0, 0, 1, 1, -2], [0, 0, 0, 0, 0]])}. It’s “reduced” because each pivot is a 1 and is the only nonzero entry in its column.` },
      { title: "Step 4: pivots and free variables", ask: "Which columns have pivots?",
        choices: ["Columns 1 and 3", "Columns 1 and 2", "Columns 1, 3, and 5", "Columns 3 and 4"], answer: 0,
        hint: "A pivot is the first nonzero entry (a 1) in each nonzero row. Look along row 1, then row 2.",
        why: "Row 1 starts in column 1 and row 2 starts in column 3, so the pivots are in columns 1 and 3: rank 2. The other columns (2, 4, 5) are <b>free</b>: x₂, x₄, x₅ can be anything. Call them x₂ = s, x₄ = t, x₅ = r.",
        fig: { add: [{ t: "strip", kinds: ["pivot", "free", "pivot", "free", "free"] }],
          caption: "Every column is one or the other. 2 pivot columns become 2 dimensions of <b>output</b> (im A). 3 free columns become 3 free variables, which are 3 directions of <b>input</b> that get sent to 0 (ker A)." } },
      { title: "Step 5: solve for the pivot variables", ask: "Read each row as an equation and solve for x₁ and x₃.",
        show: `x<sub>1</sub> = s + ${b(0)} t + ${b(1)} r &nbsp;&nbsp;&nbsp; x<sub>3</sub> = ${b(2)} t + ${b(3)} r`, answers: [2, -7, -1, 2],
        hint: "Row 1 says x₁ − x₂ − 2x₄ + 7x₅ = 0. Move everything except x₁ to the right side (signs flip). Row 2 says x₃ + x₄ − 2x₅ = 0.",
        why: "Row 1: x₁ − s − 2t + 7r = 0, so x₁ = s + 2t − 7r. Row 2: x₃ + t − 2r = 0, so x₃ = −t + 2r. Moving a term across the = sign flips its sign: that’s where the 2 and −7 come from." },
      { title: "Step 6: split into vectors", ask: "Fill in the vector that multiplies t.",
        show: `x = s${V(1, 1, 0, 0, 0)} + t${V(b(0), b(1), b(2), b(3), b(4))} + r${V(-7, 0, 2, 0, 1)}`, answers: [2, 0, -1, 1, 0],
        hint: "Write x = (x₁, x₂, x₃, x₄, x₅) = (s + 2t − 7r, s, −t + 2r, t, r). Now keep only the t-parts of each entry.",
        why: "The t-parts of (s + 2t − 7r, s, −t + 2r, t, r) are (2, 0, −1, 1, 0). Kernel basis: (1, 1, 0, 0, 0), (2, 0, −1, 1, 0), (−7, 0, 2, 0, 1). They’re independent because each has a 1 in its own free slot (2nd, 4th, 5th) where the others have 0. Check one: A(2, 0, −1, 1, 0) = (2 − 2, 4 − 5 + 1, −1 + 1) = (0, 0, 0) ✓.",
        fig: { add: [{ t: "ker", v: [1, 1, 0, 0, 0], label: "from s" }, { t: "ker", v: [2, 0, -1, 1, 0], label: "from t" }, { t: "ker", v: [-7, 0, 2, 0, 1], label: "from r" }],
          caption: "One kernel vector per free variable. They have <b>5</b> entries because they are inputs: A sends each of them (and every combination of them) to 0." } },
      { title: "Step 7: the image", ask: "Which vectors form a basis of im(A)?",
        choices: [`Columns 1 and 3 of A: ${V(1, 2, 0)}, ${V(2, 5, 1)}`, `Columns 1 and 3 of rref(A): ${V(1, 0, 0)}, ${V(0, 1, 0)}`, "All five columns of A", "The three kernel vectors"], answer: 0,
        hint: "rref tells you <i>which</i> columns to take. The vectors themselves come from the original matrix.",
        why: "im A is spanned by the columns of A, and the pivot columns are the independent ones (the others are combinations of them, e.g. column 2 = −column 1). Take them from A, not from rref: row operations change the columns. Every column of rref ends in 0, but column 3 of A, (2, 5, 1), doesn’t, so rref’s columns span a different plane. The kernel vectors have 5 entries, so they can’t even be outputs.",
        fig: { add: [{ t: "im", v: [1, 2, 0], label: "col 1 of A" }, { t: "im", v: [2, 5, 1], label: "col 3 of A" }],
          caption: "im A is spanned by A’s pivot columns. They have <b>3</b> entries because they are outputs: every Ax is a combination of them." } },
      { title: "Step 8: dimensions", ask: "Fill in the dimensions.", show: `dim ker(A) = ${b(0)} &nbsp;&nbsp; dim im(A) = ${b(1)}`, answers: [3, 2],
        hint: "dim ker = number of free variables (= kernel basis vectors). dim im = number of pivots.",
        why: "3 free variables, so 3 kernel basis vectors: dim ker A = 3. 2 pivots: dim im A = rank = 2. Rank–nullity: 3 + 2 = 5 = the number of columns ✓. And remember where they live: ker A ⊆ ℝ⁵ (inputs), im A ⊆ ℝ³ (outputs).",
        fig: { add: [{ t: "dim", side: "ker", n: 3 }, { t: "dim", side: "im", n: 2 }],
          caption: "dim ker A + dim im A = 3 + 2 = 5: every one of the 5 input directions either gets crushed to 0 (kernel) or shows up in the output (image)." } },
    ],
  },
});

// ---------------------------------------------------------------- Subspaces
add("subspaces", {
  title: "Walk through it: subspace or not?", lec: [6], intro,
  config: {
    problem: "Decide whether each set is a subspace. If it is, write it as a kernel or image. If not, give a counterexample.",
    steps: [
      { title: "Set 1: W = { x ∈ ℝ³ : x₁ − x₃ = 0 and x₂ = 2x₁ }", ask: "What kind of set is this?",
        choices: ["A subspace: it’s the kernel of a matrix", "A subspace: it’s an image", "Not a subspace: 0 isn’t in it", "Not a subspace: not closed under scaling"], answer: 0,
        hint: "Is it described by equations or by parameters? Are the equations “= 0” after you move everything to the left?",
        why: "W is cut out by equations. Move everything left: x₁ − x₃ = 0 and x₂ − 2x₁ = 0. Both are linear with no constant term (homogeneous), so W is the solution set of Ax = 0: a kernel. Every kernel is a subspace (it contains 0, and sums and multiples of solutions are still solutions). It would be an image if it were written with parameters, like {(a, 2a, a)}." },
      { title: "Set 1, continued: the matrix", ask: "Rewrite the equations as x₁ − x₃ = 0 and −2x₁ + x₂ = 0. Fill in A so W = ker(A).",
        show: `W = ker ${M([[b(0), b(1), b(2)], [b(3), b(4), b(5)]])}`, answers: [1, 0, -1, -2, 1, 0],
        hint: "One row per equation, one column per variable in the order x₁, x₂, x₃. A missing variable gets 0.",
        why: "Row 1: x₁ − x₃ = 1·x₁ + 0·x₂ + (−1)·x₃, so (1, 0, −1). Row 2: −2x₁ + x₂ = (−2)·x₁ + 1·x₂ + 0·x₃, so (−2, 1, 0). Check with a vector in W: (1, 2, 1) satisfies both equations, and A(1, 2, 1) = (1 − 1, −2 + 2) = (0, 0) ✓." },
      { title: "Set 2: W = { (a + 2b, b, −a) : a, b ∈ ℝ }", ask: "Pull out the parameters: (a + 2b, b, −a) = a·(?) + b·(?). Fill in A so W = im(A).",
        show: `W = im ${M([[b(0), b(1)], [b(2), b(3)], [b(4), b(5)]])}`, answers: [1, 2, 0, 1, -1, 0],
        hint: "Column 1 holds the coefficient of a in each entry; column 2 the coefficient of b. An entry without a gets a 0 in column 1.",
        why: "(a + 2b, b, −a) = (a, 0, −a) + (2b, b, 0) = a(1, 0, −1) + b(2, 1, 0). So W is every combination of (1, 0, −1) and (2, 1, 0): the span of the columns of A, which is im A. An image is always a subspace." },
      { title: "Set 3: W = { (x, y) : y = x + 1 }", ask: "Subspace?",
        choices: ["Yes, it’s a line, so it’s a kernel", "No: 0 isn’t in W", "No: it’s closed under scaling but not addition", "Yes, it’s an image"], answer: 1,
        hint: "The fastest test: is (0, 0) in W? Plug it in.",
        why: "Plug in (0, 0): is 0 = 0 + 1? No. So 0 ∉ W, and every subspace must contain 0. The “+ 1” is the giveaway: the equation isn’t homogeneous, so it’s a line shifted up by 1 that misses the origin. (It isn’t closed under scaling either: (0, 1) ∈ W but 2(0, 1) = (0, 2) isn’t.)" },
      { title: "Set 4: W = { (x, y) : xy ≥ 0 }", ask: "Which is a valid counterexample?",
        choices: ["(1, 1) and (2, 2) are in W, and so is their sum", "(1, 0) and (0, −1) are in W, but their sum (1, −1) isn’t", "(0, 0) is in W", "(−1, −1) is in W and so is 2(−1, −1)"], answer: 1,
        hint: "Scaling keeps xy ≥ 0 (since (kx)(ky) = k²xy ≥ 0), so the rule that breaks must be addition. Try points from different quadrants.",
        why: "(1, 0): 1·0 = 0 ≥ 0 ✓. (0, −1): 0·(−1) = 0 ✓. Their sum (1, −1): 1·(−1) = −1 < 0 ✗. So W isn’t closed under addition and isn’t a subspace. The other choices are examples where things work, and a counterexample has to show a rule <b>failing</b>." },
    ],
  },
});

// ---------------------------------------------------------------- Independence
add("independence", {
  title: "Walk through it: independence with a parameter", lec: [7], intro,
  config: {
    problem: `For which k are ${V(1, 1, 0)}, ${V(2, 3, 1)}, ${V(0, 1, "k")} linearly independent?`,
    steps: [
      { title: "Step 1: set up", show: M([[1, 2, 0], [1, 3, 1], [0, 1, "k"]]),
        why: "Put the vectors in the <b>columns</b> of A. They’re independent exactly when Ax = 0 has only x = 0, which means no free variables, which means a pivot in every column. So row reduce and watch column 3." },
      { title: "Step 2: R₂ − R₁", ask: "What is the new row 2?", show: M([[1, 2, 0], [b(0), b(1), b(2)], [0, 1, "k"]]), answers: [0, 1, 1],
        hint: "Subtract row 1 = (1, 2, 0) from row 2 = (1, 3, 1), entry by entry.",
        why: "(1 − 1, 3 − 2, 1 − 0) = (0, 1, 1). Column 1 now has its pivot with zeros below it." },
      { title: "Step 3: R₃ − R₂", ask: "What is the new row 3? (Type k − 1 as k-1.)", show: M([[1, 2, 0], [0, 1, 1], [b(0), b(1), `<input class="blank wide" data-b="2" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Answer box 3">`]]),
        answers: [0, 0, ["k-1", "-1+k"]],
        hint: "(0, 1, k) − (0, 1, 1). The last entry stays in terms of k.",
        why: "(0 − 0, 1 − 1, k − 1) = (0, 0, k − 1). Don’t divide row 3 by k − 1 to make a 1: if k = 1 that’s dividing by 0, and the special case would vanish from your work." },
      { title: "Step 4: the condition", ask: "When is there a pivot in column 3?",
        choices: ["When k ≠ 1", "When k ≠ 0", "Only when k = 1", "For every k"], answer: 0,
        hint: "A pivot needs a nonzero entry. When is k − 1 not zero?",
        why: "If k ≠ 1, then k − 1 ≠ 0, so column 3 has a pivot: 3 pivots for 3 columns, independent. If k = 1, row 3 is all zeros, column 3 has no pivot, x₃ is free, and Ax = 0 has nonzero solutions: dependent. Answer: independent exactly when k ≠ 1." },
      { title: "Step 5: the bad case", ask: "When k = 1, write v₃ as a combination of v₁ and v₂.", show: `v<sub>3</sub> = ${b(0)} v<sub>1</sub> + ${b(1)} v<sub>2</sub>`, answers: [-2, 1],
        hint: "When k = 1, rref(A) = [[1, 0, −2], [0, 1, 1], [0, 0, 0]]. A non-pivot column of rref lists the coefficients that build it from the pivot columns.",
        why: "Column 3 of rref is (−2, 1, 0), so v₃ = −2v₁ + 1v₂. Check: −2(1, 1, 0) + (2, 3, 1) = (−2 + 2, −2 + 3, 0 + 1) = (0, 1, 1) = v₃ ✓. The same fact as a kernel vector: −2v₁ + v₂ − v₃ = 0." },
      { title: "Step 6: dimension", ask: "When k = 1, what is dim span(v₁, v₂, v₃)?", choices: ["1", "2", "3", "0"], answer: 1,
        hint: "dim span = number of pivots = rank.",
        why: "With k = 1 there are 2 pivots, so the span has dimension 2: all three vectors lie in one plane through 0 in ℝ³. v₁ and v₂ alone already span it, and v₃ adds nothing new." },
    ],
  },
});

// ---------------------------------------------------------------- Basis & dimension
add("basis-dimension", {
  title: "Walk through it: extend to a basis, and count dimensions", lec: [8], intro,
  config: {
    problem: `Extend v<sub>1</sub> = ${V(1, 1, 0, 0)}, v<sub>2</sub> = ${V(0, 1, 1, 0)} to a basis of ℝ<sup>4</sup>. Then two quick rank–nullity questions.`,
    steps: [
      { title: "Step 1: how many?", ask: "How many vectors does a basis of ℝ⁴ have?", show: `${b(0)} vectors`, answers: [4],
        hint: "Every basis of ℝⁿ has exactly n vectors.",
        why: "dim ℝ⁴ = 4, so every basis has 4 vectors. You have 2, so you need 2 more, and they have to keep the list independent." },
      { title: "Step 2: the matrix", show: `[v<sub>1</sub> v<sub>2</sub> | e<sub>1</sub> e<sub>2</sub> e<sub>3</sub> e<sub>4</sub>] = ${M([[1, 0, 1, 0, 0, 0], [1, 1, 0, 1, 0, 0], [0, 1, 0, 0, 1, 0], [0, 0, 0, 0, 0, 1]], { aug: 2 })} &nbsp;→ rref ${M([[1, 0, 0, 1, -1, 0], [0, 1, 0, 0, 1, 0], [0, 0, 1, -1, 1, 0], [0, 0, 0, 0, 0, 1]], { aug: 2 })}`,
        why: "Your vectors go first, so row reduction keeps them (they’re independent, so both get pivots). Then e₁, …, e₄: together they span ℝ⁴, so there will be 4 pivots in total. The pivot columns are the vectors to keep; a column without a pivot is a combination of the columns before it." },
      { title: "Step 3: pivots", ask: "Which columns of the rref have pivots?", choices: ["1, 2, 3, 6", "1, 2, 3, 4", "1, 2, 5, 6", "3, 4, 5, 6"], answer: 0,
        hint: "In each row of the rref, find the first nonzero entry.",
        why: "Row 1 starts in column 1, row 2 in column 2, row 3 in column 3, row 4 in column 6. Columns 4 and 5 have no pivot: e₂ and e₃ are combinations of earlier columns. For example, column 4 of the rref is (1, 0, −1, 0), meaning e₂ = v₁ − e₁. Check: (1, 1, 0, 0) − (1, 0, 0, 0) = (0, 1, 0, 0) ✓." },
      { title: "Step 4: the basis", ask: "So which list is a basis of ℝ⁴?", choices: ["v₁, v₂, e₁, e₄", "v₁, v₂, e₂, e₃", "e₁, e₂, e₃, e₄ (drop the v’s)", "v₁, v₂, e₁, e₂, e₄"], answer: 0,
        hint: "Take the original vectors from the pivot columns: columns 1, 2, 3, 6 of [v₁ v₂ | e₁ e₂ e₃ e₄].",
        why: "Columns 1, 2, 3, 6 are v₁, v₂, e₁, e₄. They have 4 pivots, so they’re independent, and 4 independent vectors in ℝ⁴ form a basis. On a test, write that sentence: “4 linearly independent vectors in ℝ⁴, so they form a basis.” Five vectors can never be a basis of ℝ⁴." },
      { title: "Step 5: rank–nullity", ask: "A is 5×8 with rank 3.", show: `dim im(A) = ${b(0)} &nbsp;&nbsp; dim ker(A) = ${b(1)}`, answers: [3, 5],
        hint: "dim im = rank. dim ker + dim im = number of <b>columns</b>.",
        why: "dim im A = rank = 3. A is 5×8: 8 columns, so inputs x are in ℝ⁸, and dim ker A = 8 − 3 = 5. ker A lives in ℝ⁸ (inputs) and im A in ℝ⁵ (outputs). The usual mistake is using the 5 rows instead of the 8 columns." },
      { title: "Step 6: without numbers", ask: "T: ℝ⁶ → ℝ⁴ is linear. What is the smallest dim ker(T) can be?", show: `${b(0)}`, answers: [2],
        hint: "The matrix of T is 4×6 (outputs × inputs). Each row holds at most one pivot, so rank ≤ 4.",
        why: "The matrix has 6 columns and 4 rows, so rank ≤ 4. Rank–nullity: dim ker = 6 − rank ≥ 6 − 4 = 2. It equals 2 when rank = 4 (when T is onto). A map from a bigger space to a smaller one always sends something nonzero to 0." },
    ],
  },
});

// ---------------------------------------------------------------- Orthogonal complements
add("orth-complement", {
  title: "Walk through it: a basis of V⊥", lec: [11], intro,
  config: {
    problem: `V = span${set(V(1, 1, 1, 0), V(0, 1, 2, 1))} in ℝ<sup>4</sup>. Find a basis of V<sup>⊥</sup>.`,
    steps: [
      { title: "Step 1: the setup", ask: "How do you turn V⊥ into a kernel?",
        choices: ["Put v₁, v₂ in the rows of A; V⊥ = ker(A)", "Put v₁, v₂ in the columns of A; V⊥ = ker(A)", "Put v₁, v₂ in the columns; V⊥ = im(A)", "Row reduce [v₁ v₂ | x]"], answer: 0,
        hint: "x ⊥ v means v·x = 0. Each entry of Ax is a row of A dotted with x.",
        why: `Each entry of Ax is (row of A)·x. With v₁ and v₂ as the rows, Ax = (v₁·x, v₂·x), so Ax = 0 says exactly x ⊥ v₁ and x ⊥ v₂, which means x is perpendicular to everything in V. So V⊥ = ker A with A = ${M([[1, 1, 1, 0], [0, 1, 2, 1]])}. With the vectors as columns, im A would be V itself, not V⊥.` },
      { title: "Step 2: rref", ask: "Do R₁ − R₂. What is the new row 1?", show: M([[b(0), b(1), b(2), b(3)], [0, 1, 2, 1]]), answers: [1, 0, -1, -1],
        hint: "Column 2 has a 1 in both rows. Subtract row 2 from row 1 to clear the one in row 1.",
        why: "(1 − 0, 1 − 1, 1 − 2, 0 − 1) = (1, 0, −1, −1). So rref A = [[1, 0, −1, −1], [0, 1, 2, 1]], with pivots in columns 1 and 2. Then x₃ = s and x₄ = t are free." },
      { title: "Step 3: solve", ask: "Solve for x₁ and x₂.", show: `x<sub>1</sub> = ${b(0)} s + ${b(1)} t &nbsp;&nbsp;&nbsp; x<sub>2</sub> = ${b(2)} s + ${b(3)} t`, answers: [1, 1, -2, -1],
        hint: "Row 1: x₁ − x₃ − x₄ = 0. Row 2: x₂ + 2x₃ + x₄ = 0. Put x₃ = s, x₄ = t and move them to the right side.",
        why: "Row 1: x₁ − s − t = 0, so x₁ = s + t. Row 2: x₂ + 2s + t = 0, so x₂ = −2s − t." },
      { title: "Step 4: the vector for s", ask: "Fill in the vector multiplying s.", show: `x = s${V(b(0), b(1), b(2), b(3))} + t${V(1, -1, 0, 1)}`, answers: [1, -2, 1, 0],
        hint: "x = (s + t, −2s − t, s, t). Keep only the s-parts of each entry.",
        why: "The s-parts of (s + t, −2s − t, s, t) are (1, −2, 1, 0), and the t-parts are (1, −1, 0, 1). So V⊥ = span{(1, −2, 1, 0), (1, −1, 0, 1)}." },
      { title: "Step 5: check", ask: "Dot the first answer with v₂ = (0, 1, 2, 1).", show: `(1, −2, 1, 0) · (0, 1, 2, 1) = ${b(0)}`, answers: [0],
        hint: "Multiply matching entries and add the four products.",
        why: "1·0 + (−2)·1 + 1·2 + 0·1 = 0 − 2 + 2 + 0 = 0 ✓. The other three checks: (1, −2, 1, 0)·(1, 1, 1, 0) = 1 − 2 + 1 = 0, (1, −1, 0, 1)·(1, 1, 1, 0) = 1 − 1 = 0, (1, −1, 0, 1)·(0, 1, 2, 1) = −1 + 1 = 0 ✓. On a test, do all four: it takes thirty seconds and catches sign slips." },
      { title: "Step 6: dimension", ask: "dim V⊥ = ?", show: `${b(0)}`, answers: [2],
        hint: "dim V + dim V⊥ = n, where V sits inside ℝⁿ.",
        why: "dim V = 2 (v₁, v₂ are independent) and n = 4, so dim V⊥ = 4 − 2 = 2. It’s rank–nullity for A again: 4 columns − rank 2 = 2. Together, v₁, v₂ and the two V⊥ vectors form a basis of ℝ⁴." },
    ],
  },
});

// ---------------------------------------------------------------- Projections
const pv1 = [1, 2, 2], pv2 = [2, 1, -2];
add("projections", {
  title: "Walk through it: projecting onto a plane", lec: [11], intro: introPic,
  config: {
    problem: `V = span(v<sub>1</sub>, v<sub>2</sub>) with v<sub>1</sub> = ${V(1, 2, 2)}, v<sub>2</sub> = ${V(2, 1, -2)}. Find proj<sub>V</sub>x and x<sup>⊥</sup> for x = ${V(0, 0, 9)}.`,
    figure: {
      type: "3d",
      view: { R: 11, axes: 11.5, tick: 3, d: [0.92, 0.36, 0.17],
        views: [{ label: "Start view", d: [0.92, 0.36, 0.17] }, { label: "Look along V (edge-on)", d: [-2, -2, 0.02] }, { label: "Look straight at V", d: [2, -2, 1] }] },
      start: {
        add: [{ t: "plane", v1: pv1, v2: pv2, span: [[-1, 3], [-3, 1.5]], label: "V", grid: false },
          { t: "vec", to: pv1, c: "v1", label: "v₁", anchor: "start", lp: [0, 16] }, { t: "vec", to: pv2, c: "v2", label: "v₂" },
          { t: "vec", to: [0, 0, 9], c: "x", label: "x = (0, 0, 9)", anchor: "end", lp: [-10, 34] }],
        caption: "V is the green plane through v₁ (red) and v₂ (blue). x (purple) points straight up the x₃-axis and sticks out of V. The goal: split x into a piece lying <b>in</b> V plus a piece <b>perpendicular</b> to V.",
      },
    },
    steps: [
      { title: "Step 1: is the basis orthogonal?", ask: "v₁ · v₂ = ?", show: `${b(0)}`, answers: [0],
        hint: "Multiply matching entries of (1, 2, 2) and (2, 1, −2), then add.",
        why: "1·2 + 2·1 + 2·(−2) = 2 + 2 − 4 = 0, so v₁ ⊥ v₂. That matters: the projection formula (adding up the projections onto each basis vector) only works for an <b>orthogonal</b> basis. With a slanted basis you’d have to make it orthogonal first.",
        fig: { ask: "Are v₁ and v₂ at a right angle?", add: [{ t: "right", at: [0, 0, 0], u: pv1, v: pv2, size: 0.9 }],
          caption: "v₁ · v₂ = 0: the square corner. An orthogonal basis lets you project onto each direction separately and add." } },
      { title: "Step 2: lengths squared", ask: "Compute the dot products.", show: `v<sub>1</sub>·v<sub>1</sub> = ${b(0)} &nbsp;&nbsp; v<sub>2</sub>·v<sub>2</sub> = ${b(1)}`, answers: [9, 9],
        hint: "v·v is the sum of the squares of the entries.",
        why: "v₁·v₁ = 1² + 2² + 2² = 1 + 4 + 4 = 9 and v₂·v₂ = 2² + 1² + (−2)² = 4 + 1 + 4 = 9. Each has length √9 = 3, not 1, so the basis is orthogonal but <b>not</b> orthonormal. That’s why the formula divides by vᵢ·vᵢ (or you could use uᵢ = vᵢ/3).",
        fig: { caption: "Both arrows have length 3, so each coefficient gets divided by 3² = 9." } },
      { title: "Step 3: coefficients", ask: "Find each coefficient (vᵢ·x)/(vᵢ·vᵢ).", show: `c<sub>1</sub> = ${b(0)} &nbsp;&nbsp; c<sub>2</sub> = ${b(1)}`, answers: [2, -2],
        hint: "v₁·x = 1·0 + 2·0 + 2·9. v₂·x = 2·0 + 1·0 + (−2)·9. Divide each by 9.",
        why: "v₁·x = 0 + 0 + 18 = 18, so c₁ = 18/9 = 2. v₂·x = 0 + 0 − 18 = −18, so c₂ = −18/9 = −2. Each cᵢ says how far x’s shadow reaches along vᵢ: 2 steps along v₁, and 2 steps <b>backwards</b> along v₂.",
        fig: { ask: "How far along v₁ and v₂ does x’s shadow reach?",
          add: [{ t: "vec", to: [2, 4, 4], c: "v1", dash: true, label: "2v₁" }, { t: "vec", to: [-4, -2, 4], c: "v2", dash: true, label: "−2v₂", anchor: "end", lp: [-6, 12] }],
          caption: "The shadow of x on v₁’s line is 2v₁. On v₂’s line it’s −2v₂, pointing backwards." } },
      { title: "Step 4: x∥", ask: "x∥ = 2v₁ − 2v₂ = ?", show: `x<sup>∥</sup> = ${V(b(0), b(1), b(2))}`, answers: [-2, 2, 8],
        hint: "2v₁ = (2, 4, 4) and −2v₂ = (−4, −2, 4). Add them entry by entry.",
        why: "(2, 4, 4) + (−4, −2, 4) = (2 − 4, 4 − 2, 4 + 4) = (−2, 2, 8). This is proj<sub>V</sub>x: the point of V closest to x.",
        fig: { ask: "Add the two shadows.",
          add: [{ t: "seg", a: [2, 4, 4], b: [-2, 2, 8], c: "muted", dash: true }, { t: "seg", a: [-4, -2, 4], b: [-2, 2, 8], c: "muted", dash: true },
            { t: "vec", to: [-2, 2, 8], c: "par", label: "x∥ = (−2, 2, 8)", anchor: "start", lp: [0, 16] }],
          caption: "Adding the two shadows (the dashed parallelogram) gives x∥ in green. It lies in V, right “under” x." } },
      { title: "Step 5: x⊥", ask: "x⊥ = x − x∥ = ?", show: `x<sup>⊥</sup> = ${V(b(0), b(1), b(2))}`, answers: [2, -2, 1],
        hint: "Subtract entry by entry: (0, 0, 9) − (−2, 2, 8).",
        why: "(0 − (−2), 0 − 2, 9 − 8) = (2, −2, 1). So x = x∥ + x⊥: (−2, 2, 8) + (2, −2, 1) = (0, 0, 9) ✓. x∥ is the part of x inside V, and x⊥ is the part sticking straight out of V.",
        fig: { ask: "What’s left over when you remove x∥ from x?",
          add: [{ t: "vec", from: [-2, 2, 8], to: [0, 0, 9], c: "perp", label: "x⊥ = (2, −2, 1)", mid: true, lp: [6, -14] }],
          caption: "x⊥ (orange) runs from the tip of x∥ to the tip of x. x = x∥ + x⊥." } },
      { title: "Step 6: check", ask: "x⊥ · v₁ = ?", show: `${b(0)}`, answers: [0],
        hint: "Dot (2, −2, 1) with (1, 2, 2).",
        why: "2·1 + (−2)·2 + 1·2 = 2 − 4 + 2 = 0 ✓, and with v₂: 2·2 + (−2)·1 + 1·(−2) = 4 − 2 − 2 = 0 ✓. So x⊥ is perpendicular to both basis vectors, which puts it in V⊥, as it must be. If either dot product weren’t 0, there’d be an arithmetic slip somewhere. Bonus: its length √(4 + 4 + 1) = 3 is the distance from x to V.",
        fig: { add: [{ t: "right", at: [-2, 2, 8], u: [2, -2, 1], v: [-1, -2, -2], size: 0.9 }],
          caption: "x⊥ meets V at a right angle, and its length, 3, is the distance from x to the plane. Press <b>Look along V</b>: the plane becomes a line and x⊥ stands straight up from it." } },
    ],
  },
});

// ---------------------------------------------------------------- Coordinates
const cv1 = [1, 0, 1], cv2 = [0, 1, 2];
add("coordinates", {
  title: "Walk through it: coordinates on a plane", lec: [9], intro: introPic,
  config: {
    problem: `B = (v<sub>1</sub>, v<sub>2</sub>) with v<sub>1</sub> = ${V(1, 0, 1)}, v<sub>2</sub> = ${V(0, 1, 2)}. Find [x]<sub>B</sub> for x = ${V(3, -1, 1)}, and decide whether y = ${V(1, 1, 1)} is in V = span(B).`,
    figure: {
      type: "3d",
      view: { R: 5.2, tick: 1, d: [0.94, 0.32, 0.2],
        views: [{ label: "Start view", d: [0.94, 0.32, 0.2] }, { label: "Look along V (edge-on)", d: [-2, 1, 0.02] }, { label: "Look straight at V", d: [-1, -2, 1] }] },
      start: {
        add: [{ t: "plane", v1: cv1, v2: cv2, span: [[-0.5, 3.5], [-1.5, 1.5]], label: "V" },
          { t: "vec", to: cv1, c: "v1", label: "v₁" }, { t: "vec", to: cv2, c: "v2", label: "v₂" },
          { t: "vec", to: [3, -1, 1], c: "x", label: "x = (3, −1, 1)" }],
        caption: "V = span(v₁, v₂) is a plane through 0 inside ℝ³ (green). The purple lines on it are the <b>B-grid</b>: steps along v₁ and v₂. [x]<sub>B</sub> asks how many v₁-steps and v₂-steps reach x. Drag the picture to turn it.",
      },
    },
    steps: [
      { title: "Step 1: the setup", ask: "How do you find [x]_B here?",
        choices: ["Row reduce [v₁ v₂ | x]", "Compute S⁻¹x", "Row reduce [x | v₁ v₂]", "Dot x with v₁ and v₂"], answer: 0,
        hint: "[x]_B = (c₁, c₂) means c₁v₁ + c₂v₂ = x. S = [v₁ v₂] is 3×2. Can a 3×2 matrix have an inverse?",
        why: `[x]<sub>B</sub> = (c₁, c₂) means c₁v₁ + c₂v₂ = x, which is the system S c = x with S = [v₁ v₂]. S is 3×2 (not square), so S<sup>−1</sup> doesn’t exist: row reduce ${M([[1, 0, 3], [0, 1, -1], [1, 2, 1]], { aug: 2 })} instead. Dotting x with each vᵢ only works for an orthonormal basis, and here v₁·v₂ = 0 + 0 + 2 = 2 ≠ 0.` },
      { title: "Step 2: R₃ − R₁", ask: "What is the new row 3?", show: M([[1, 0, 3], [0, 1, -1], [b(0), b(1), b(2)]], { aug: 2 }), answers: [0, 2, -2],
        hint: "Row 3 is (1, 2 | 1) and row 1 is (1, 0 | 3). Subtract entry by entry, right side included.",
        why: "(1 − 1, 2 − 0 | 1 − 3) = (0, 2 | −2). Column 1 is clear below its pivot." },
      { title: "Step 3: R₃ − 2R₂", ask: "What is row 3 now?", show: M([[1, 0, 3], [0, 1, -1], [b(0), b(1), b(2)]], { aug: 2 }), answers: [0, 0, 0],
        hint: "2 × row 2 = (0, 2 | −2). Subtract it from (0, 2 | −2).",
        why: "(0 − 0, 2 − 2 | −2 − (−2)) = (0, 0 | 0). A zero row with 0 on the right side says 0 = 0: the system is consistent, so a solution exists and x is in V. If the right side had been nonzero (0 = 5, say), x would <b>not</b> be in V.",
        fig: { caption: "Row 3 became 0 = 0, so the system can be solved: x lies <b>in</b> the plane V. Press <b>Look along V</b>: the plane turns into a line and x lies flat along it." } },
      { title: "Step 4: the coordinates", ask: "[x]_B = ?", show: `[x]<sub>B</sub> = ${V(b(0), b(1))}`, answers: [3, -1],
        hint: "Row 1 of the reduced matrix says c₁ = ?, and row 2 says c₂ = ?",
        why: "Row 1 reads c₁ = 3 and row 2 reads c₂ = −1, so [x]<sub>B</sub> = (3, −1). It has two entries, one per basis vector, so it lives in ℝ², even though x lives in ℝ³. Check: 3v₁ − v₂ = (3, 0, 3) − (0, 1, 2) = (3, −1, 1) = x ✓.",
        fig: { ask: "How many v₁-steps and v₂-steps reach x?",
          add: [{ t: "vec", to: [3, 0, 3], c: "v1", dash: true, label: "3·v₁" }, { t: "vec", from: [3, 0, 3], to: [3, -1, 1], c: "v2", dash: true, label: "−1·v₂", mid: true, anchor: "end", lp: [-8, 0] }],
          caption: "3 steps along v₁ (dashed red), then 1 step <b>backwards</b> along v₂ (dashed blue), lands exactly on x. That recipe, (3, −1), is [x]<sub>B</sub>: two numbers, because the plane is 2-dimensional." } },
      { title: "Step 5: now y = (1, 1, 1)", ask: "The first two entries force c₁ and c₂. Then what would the third entry of c₁v₁ + c₂v₂ be?",
        show: `c<sub>1</sub> = ${b(0)}, &nbsp; c<sub>2</sub> = ${b(1)}, &nbsp; third entry = ${b(2)}`, answers: [1, 1, 3],
        hint: "Only v₁ = (1, 0, 1) has a first entry, and only v₂ = (0, 1, 2) has a second entry. Match those to y’s first two entries.",
        why: "First entries: c₁·1 + c₂·0 = 1, so c₁ = 1. Second entries: c₁·0 + c₂·1 = 1, so c₂ = 1. Then the third entry of 1v₁ + 1v₂ is 1·1 + 1·2 = 3. The only point of V that starts (1, 1, …) is (1, 1, 3).",
        fig: { ask: "Where on V would y have to be?",
          add: [{ t: "vec", to: [1, 1, 1], c: "perp", label: "y = (1, 1, 1)", lp: [6, 6] }, { t: "dot", at: [1, 1, 3], c: "par", label: "(1, 1, 3) is in V", lp: [8, -8] },
            { t: "seg", a: [1, 1, 1], b: [1, 1, 3], c: "perp", dash: true }],
          caption: "Matching y’s first two entries forces the green dot, (1, 1, 3). That’s the only spot on V that could have been y, and y = (1, 1, 1) sits 2 below it (dashed)." } },
      { title: "Step 6: conclusion", ask: "So:", choices: ["y ∉ V, and [y]_B doesn’t exist", "[y]_B = (1, 1)", "[y]_B = (1, 1, 3)", "y ∈ V because it has 3 entries"], answer: 0,
        hint: "Is (1, 1, 3) the same vector as y = (1, 1, 1)?",
        why: "The only combination that matches the first two entries gives (1, 1, 3), and 3 ≠ 1, so no combination of v₁ and v₂ equals y: y ∉ V and [y]<sub>B</sub> doesn’t exist. In row reduction this shows up as the row (0 0 | −2), which says 0 = −2. Never skip the last equation: (1, 1) “works” for two of the three entries.",
        fig: { caption: "y is off the plane, so no amount of v₁-steps and v₂-steps reaches it: [y]<sub>B</sub> doesn’t exist. Press <b>Look along V</b> to see y stick out of the plane while x lies in it." } },
    ],
  },
});

// ---------------------------------------------------------------- B-matrix
add("b-matrix", {
  title: "Walk through it: the B-matrix, column by column", lec: [10], intro: introPic,
  config: {
    problem: `T(x) = Ax with A = ${M([[2, 1], [1, 2]])}. Find the B-matrix for B = (v<sub>1</sub>, v<sub>2</sub>), v<sub>1</sub> = ${V(1, 0)}, v<sub>2</sub> = ${V(1, 1)}.`,
    figure: {
      type: "2d", view: { x: [-1.5, 4.5], y: [-1.5, 4.5] },
      start: {
        add: [{ t: "bgrid", v1: [1, 0], v2: [1, 1] },
          { t: "vec", to: [1, 0], c: "v1", label: "v₁", lp: [-34, 18] }, { t: "vec", to: [1, 1], c: "v2", label: "v₂", anchor: "end", lp: [-20, 4] }],
        caption: "The basis: v₁ = (1, 0) in red, v₂ = (1, 1) in blue. The faint purple lines are the <b>B-grid</b>: moving along them means taking steps along v₁ and v₂, the way the gray grid means steps along e₁ and e₂. The B-matrix describes T in this grid.",
      },
    },
    steps: [
      { title: "Step 1: T(v₁)", ask: "Compute Av₁.", show: `Av<sub>1</sub> = ${V(b(0), b(1))}`, answers: [2, 1],
        hint: "Each entry is a row of A times v₁ = (1, 0): multiply matching entries and add. (A times e₁ is just column 1 of A.)",
        why: "Row 1: 2·1 + 1·0 = 2. Row 2: 1·1 + 2·0 = 1. So T(v₁) = (2, 1). This is in ordinary coordinates (steps along e₁ and e₂), so it is <b>not</b> column 1 of B yet: B wants the answer in steps along v₁ and v₂.",
        fig: { ask: "Where does T send v₁?", add: [{ id: "tv1", t: "vec", to: [2, 1], c: "v1", dash: true, label: "T(v₁) = (2, 1)", anchor: "middle", lp: [6, -10] }],
          caption: "T sends v₁ to the dashed red arrow, (2, 1): 2 right and 1 up on the gray grid." } },
      { title: "Step 2: B-coordinates of T(v₁)", ask: "Write (2, 1) as a combination of v₁ = (1, 0) and v₂ = (1, 1).", show: `${V(2, 1)} = ${b(0)} v<sub>1</sub> + ${b(1)} v<sub>2</sub>`, answers: [1, 1],
        hint: "The second entry only comes from v₂, so c₂ = 1. Then fix the first entry.",
        why: "c₁(1, 0) + c₂(1, 1) = (c₁ + c₂, c₂). Matching (2, 1): c₂ = 1, then c₁ + 1 = 2 so c₁ = 1. Check: (1, 0) + (1, 1) = (2, 1) ✓. So [T(v₁)]<sub>B</sub> = (1, 1), and that’s column 1 of B, <b>not</b> (2, 1).",
        fig: { ask: "How many v₁-steps and v₂-steps reach the dashed red tip?",
          add: [{ t: "vec", from: [0, 0], to: [1, 0], c: "x" }, { t: "vec", from: [1, 0], to: [2, 1], c: "x" },
            { id: "tv1", t: "vec", to: [2, 1], c: "v1", dash: true, label: "T(v₁) = 1·v₁ + 1·v₂", anchor: "middle", lp: [6, -10] }],
          caption: "On the B-grid: 1 step along v₁, then 1 step along v₂ (the purple path), lands exactly on T(v₁). So [T(v₁)]<sub>B</sub> = (1, 1). That’s column 1 of B." } },
      { title: "Step 3: T(v₂)", ask: "Compute Av₂.", show: `Av<sub>2</sub> = ${V(b(0), b(1))}`, answers: [3, 3],
        hint: "v₂ = (1, 1), so each entry is a row of A added up.",
        why: "Row 1: 2·1 + 1·1 = 3. Row 2: 1·1 + 2·1 = 3. So T(v₂) = (3, 3), again in ordinary coordinates.",
        fig: { ask: "Where does T send v₂?", add: [{ id: "tv2", t: "vec", to: [3, 3], c: "v2", dash: true, label: "T(v₂) = (3, 3)", anchor: "end", lp: [-30, -2] }],
          caption: "T sends v₂ to the dashed blue arrow, (3, 3)." } },
      { title: "Step 4: B-coordinates of T(v₂)", ask: "(3, 3) = ? v₁ + ? v₂", show: `${V(3, 3)} = ${b(0)} v<sub>1</sub> + ${b(1)} v<sub>2</sub>`, answers: [0, 3],
        hint: "Is (3, 3) a multiple of v₂ = (1, 1)?",
        why: "c₁(1, 0) + c₂(1, 1) = (c₁ + c₂, c₂) = (3, 3) gives c₂ = 3 and c₁ = 0. So (3, 3) = 0·v₁ + 3·v₂, and [T(v₂)]<sub>B</sub> = (0, 3) is column 2 of B. T doesn’t turn v₂ at all: it just stretches it by 3.",
        fig: { ask: "How many v₁-steps and v₂-steps reach (3, 3)?",
          add: [{ t: "dot", at: [1, 1], c: "x" }, { t: "dot", at: [2, 2], c: "x" }, { t: "dot", at: [3, 3], c: "x" },
            { id: "tv2", t: "vec", to: [3, 3], c: "v2", dash: true, label: "T(v₂) = 0·v₁ + 3·v₂", anchor: "end", lp: [-30, -2] }],
          caption: "T(v₂) lies on v₂’s own line, 3 times as long (the purple dots mark each step): 0 steps along v₁ and 3 along v₂. So [T(v₂)]<sub>B</sub> = (0, 3), column 2 of B." } },
      { title: "Step 5: assemble", ask: "B = ?", show: `B = ${M([[b(0), b(1)], [b(2), b(3)]])}`, answers: [1, 0, 1, 3],
        hint: "Column 1 = [T(v₁)]_B from step 2. Column 2 = [T(v₂)]_B from step 4.",
        why: "B = [[1, 0], [1, 3]]. Column j of B is [T(vⱼ)]<sub>B</sub>, the B-coordinates of T(vⱼ). Read it as directions: column 1 says “T(v₁) is 1 step along v₁ plus 1 along v₂”, column 2 says “T(v₂) is 3 steps along v₂”.",
        fig: { caption: "B = [[1, 0], [1, 3]]. Each column is a set of directions on the B-grid: column 1 is how to reach T(v₁), column 2 is how to reach T(v₂)." } },
      { title: "Step 6: check AS = SB", ask: "Compute SB with S = [[1, 1], [0, 1]].", show: `SB = ${M([[1, 1], [0, 1]])}${M([[1, 0], [1, 3]])} = ${M([[b(0), b(1)], [b(2), b(3)]])}`, answers: [2, 3, 1, 3],
        hint: "S = [v₁ v₂]. Entry (i, j) of SB is row i of S times column j of B.",
        why: "Row 1 of S is (1, 1): (1, 1)·(1, 1) = 2 and (1, 1)·(0, 3) = 3. Row 2 is (0, 1): (0, 1)·(1, 1) = 1 and (0, 1)·(0, 3) = 3. So SB = [[2, 3], [1, 3]]. And AS = [Av₁ Av₂] = [[2, 3], [1, 3]] from steps 1 and 3. They match, so B = S<sup>−1</sup>AS ✓. Checking AS = SB saves you from computing S<sup>−1</sup>.",
        fig: { caption: "AS = SB describes the same two arrows twice. AS finds T(v₁) and T(v₂) in ordinary coordinates; SB rebuilds them from their B-grid directions. Same arrows, so the answer checks out." } },
    ],
  },
});

// ---------------------------------------------------------------- Similarity
add("similarity", {
  title: "Walk through it: proving two matrices are similar", lec: [10], intro,
  config: {
    problem: `Is A = ${M([[0, 1], [-2, 3]])} similar to D = ${M([[1, 0], [0, 2]])}? If so, find S.`,
    steps: [
      { title: "Step 1: quick test", ask: "Compute det A. (Nonzero means rank 2, same as D.)", show: `det A = ${b(0)}`, answers: [2],
        hint: "det [[a, b], [c, d]] = ad − bc.",
        why: "0·3 − 1·(−2) = 0 + 2 = 2 ≠ 0, and det D = 1·2 = 2 too. Also tr A = 0 + 3 = 3 = tr D. Similar matrices must share rank, det and trace, so nothing rules it out. But matching them doesn’t <b>prove</b> similarity: you need an actual invertible S with AS = SD." },
      { title: "Step 2: what AS = SD means", ask: "AS = SD with D diagonal says A sends column 1 of S to 1 × itself. For column 1 = (a, c): A(a, c) = (c, −2a + 3c). Setting that equal to (a, c) gives c = ? · a",
        show: `c = ${b(0)} · a`, answers: [1],
        hint: "Compare the first entries of (c, −2a + 3c) and (a, c).",
        why: "First entries: c = a. Second entries: −2a + 3c = c, and with c = a that’s −2a + 3a = a ✓, so it’s consistent. Column 1 can be any multiple of (1, 1). Check: A(1, 1) = (0 + 1, −2 + 3) = (1, 1), so A doesn’t move (1, 1) at all." },
      { title: "Step 3: second column", ask: "A sends column 2 = (b, d) to 2 × itself: (d, −2b + 3d) = (2b, 2d). So d = ? · b",
        show: `d = ${b(0)} · b`, answers: [2],
        hint: "Compare the first entries again: d against 2b.",
        why: "First entries: d = 2b. Second entries: −2b + 3d = 2d, and with d = 2b that’s −2b + 6b = 4b = 2·(2b) ✓. Column 2 can be any multiple of (1, 2). Check: A(1, 2) = (0 + 2, −2 + 6) = (2, 4) = 2·(1, 2), so A doubles (1, 2)." },
      { title: "Step 4: pick values", ask: "With a = 1 and b = 1, S = ?", show: `S = ${M([[b(0), b(1)], [b(2), b(3)]])}`, answers: [1, 1, 1, 2],
        hint: "Column 1 is (a, c) = (a, a). Column 2 is (b, d) = (b, 2b).",
        why: "a = 1 gives column 1 = (1, 1), and b = 1 gives column 2 = (1, 2), so S = [[1, 1], [1, 2]]. In words, the columns of S are the directions A only stretches: (1, 1) by 1 and (1, 2) by 2. In the basis of S’s columns, A looks like D." },
      { title: "Step 5: invertible?", ask: "det S = ?", show: `${b(0)}`, answers: [1],
        hint: "det = 1·2 − 1·1.",
        why: "1·2 − 1·1 = 1 ≠ 0, so S is invertible, AS = SD gives D = S<sup>−1</sup>AS, and A ∼ D. Never skip this step: S = 0 also solves AS = SD, but it isn’t invertible and proves nothing." },
    ],
  },
});
})();
