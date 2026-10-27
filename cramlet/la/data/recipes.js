// Recipe Box for Linear Algebra (course/recipes.js): how to think through each kind of Test 2 problem.
// Worked examples use their own numbers, different from the exam bank, so a walkthrough never gives away a
// practice problem. Every number here was checked with a computer algebra system.
(function () {
    "use strict";
    const { M, V, set } = LA;

    registerRecipes([
        // ======================================================================
        {
            id: "kernel-image", c: "kernel-image", title: "Bases of the kernel and image", icon: "venn",
            when: "“Find a basis of ker(A) and im(A), and their dimensions.”",
            for: { concepts: ["kernel-image"] },
            card: {
                steps: [
                    "Row reduce A to rref(A). Write each row operation down.",
                    "Circle the pivots. Non-pivot columns ↔ <b>free variables</b>.",
                    "<b>Kernel:</b> solve for the pivot variables in terms of the free ones; split x into (free variable) × (vector). Those vectors are the basis.",
                    "<b>Image:</b> the pivot columns <b>of A</b> (the original!).",
                    "dim im = number of pivots = rank. dim ker = number of free variables.",
                ],
                check: ["Multiply A by each kernel vector: you must get 0.", "dim ker + dim im = number of columns.", "Kernel vectors have as many entries as A has columns; image vectors as many as A has rows."],
            },
            full: {
                intro: "This is the problem most likely to open the test, and it’s all mechanics. The points get lost in arithmetic and in using the wrong matrix for the image, so build the checks into your routine.",
                steps: [
                    { t: "Row reduce carefully", html: "<p>Go column by column. Clear below <b>and above</b> each pivot (rref, not just echelon form). Write R<sub>2</sub> − 2R<sub>1</sub> next to each step so you can retrace a mistake and earn partial credit.</p>" },
                    { t: "Kernel from the free variables", html: "<p>Each non-pivot column is a free variable: call them s, t, r. Read each nonzero row of rref(A) as an equation and solve for its pivot variable. Then write x as s(…) + t(…) + r(…). The vectors in parentheses form the basis. They’re automatically independent: each has a 1 in its own free slot where the others have 0.</p>" },
                    { t: "Image from the pivot columns of A", html: "<p>The pivot columns of A are the non-redundant columns. rref(A) only tells you <i>which</i> columns; the vectors themselves come from A, because row operations change the column space.</p>" },
                    { t: "Bonus parts they like to add", html: "<p><b>Write the redundant columns as combinations:</b> read the non-pivot column of rref(A); its entries are the coefficients on the pivot columns. <b>Is b in the image?</b> Row reduce [A | b] and look for a row 0 … 0 | nonzero.</p>" },
                ],
                example: {
                    title: "A 3×4 example",
                    html: `<div class="mrow">A = ${M([[1, 3, 1, 2], [2, 6, 3, 7], [1, 3, 0, -1]])} → rref(A) = ${M([[1, 3, 0, -1], [0, 0, 1, 3], [0, 0, 0, 0]])}</div>
                        <p>(R<sub>2</sub> − 2R<sub>1</sub> = (0, 0, 1, 3); R<sub>3</sub> − R<sub>1</sub> = (0, 0, −1, −3), then R<sub>3</sub> + R<sub>2</sub> = 0 and R<sub>1</sub> − R<sub>2</sub>.)</p>
                        <p>Free: x<sub>2</sub> = s, x<sub>4</sub> = t. x<sub>1</sub> = −3s + t, x<sub>3</sub> = −3t.</p>
                        <div class="mrow">ker(A): ${set(V(-3, 1, 0, 0), V(1, 0, -3, 1))}, dim 2. &nbsp; im(A): ${set(V(1, 2, 1), V(1, 3, 0))}, dim 2. &nbsp; 2 + 2 = 4 ✓</div>
                        <p>Redundant columns: a<sub>2</sub> = 3a<sub>1</sub>, and a<sub>4</sub> = −a<sub>1</sub> + 3a<sub>3</sub> = (−1 + 3, −2 + 9, −1 + 0) = (2, 7, −1) ✓.</p>`,
                },
                traps: ["Using columns of rref(A) for the image.", "Forgetting a free variable that only appears in one row (or a column of all zeros).", "Sign errors when moving terms across: x₁ + 3x₂ − x₄ = 0 means x₁ = −3x₂ + x₄."],
                practice: [{ label: "Image & Kernel notes", href: "#/c/kernel-image/details" }],
            },
        },
        // ======================================================================
        {
            id: "subspace-test", c: "subspaces", title: "Is it a subspace?", icon: "stack",
            when: "“Is W a subspace? If so, write it as a kernel or an image.”",
            for: { concepts: ["subspaces"] },
            card: {
                steps: [
                    "Scan for red flags: a nonzero constant, x², xy, |x|, ≥ or ≤, restricted parameters (a ≥ 0).",
                    "<b>Equations, all = 0?</b> Subspace: W = ker(A), rows = coefficients.",
                    "<b>Parameters (a, b free)?</b> Subspace: W = im(A), columns = the vectors multiplying each parameter.",
                    "Red flag? Find a <b>specific</b> counterexample: 0 ∉ W, or u, v ∈ W with u + v ∉ W, or v ∈ W with kv ∉ W.",
                ],
                check: ["Your matrix has the right size (kernel: one column per variable; image: one row per entry).", "Plug a vector you know is in W into your description."],
            },
            full: {
                intro: "Each part is usually worth 2–3 points, and the grader wants either the exact matrix or a concrete counterexample. A vague “it’s not closed” gets nothing.",
                steps: [
                    { t: "Try 0 first", html: "<p>If 0 isn’t in W, you’re done: not a subspace. That catches every “= 1”, “+ d”, and shifted line or plane. (A line through two points is a subspace only if it passes through the origin.)</p>" },
                    { t: "Linear and homogeneous → match it to a matrix", html: "<p>Equations like x<sub>1</sub> − 3x<sub>3</sub> = 0 become rows of A (with 0 for missing variables). Parametric forms like (a − b, 2b, a) = a(1, 0, 1) + b(−1, 2, 0) become columns. Kernels and images are always subspaces, so naming the matrix is the whole proof.</p>" },
                    { t: "Nonlinear → break closure", html: "<p>For x ≤ y, xy ≥ 0, z = x², or a ≥ 0: pick one vector in W and show −1 times it (or 2 times it) leaves W, or pick two vectors in W whose sum leaves W. Use small numbers like 0, 1, −1.</p>" },
                ],
                example: {
                    title: "Three quick ones",
                    html: `<p>W<sub>1</sub> = { x ∈ ℝ<sup>3</sup> : 3x<sub>1</sub> = x<sub>3</sub>, x<sub>2</sub> = 0 } = ker${M([[3, 0, -1], [0, 1, 0]])}: subspace.</p>
                        <p>W<sub>2</sub> = { (a, a + b, 2b) : a, b ∈ ℝ } = im${M([[1, 0], [1, 1], [0, 2]])}: subspace.</p>
                        <p>W<sub>3</sub> = { (x, y) : y ≥ −x }: (1, 0) ∈ W<sub>3</sub> but (−1)(1, 0) = (−1, 0) has 0 ≥ 1 false. Not a subspace.</p>`,
                },
                traps: ["Writing the equations’ coefficients as columns instead of rows.", "Calling a set a subspace just because 0 is in it (check closure too).", "Counterexamples with letters instead of numbers."],
                practice: [{ label: "Subspaces notes", href: "#/c/subspaces/details" }],
            },
        },
        // ======================================================================
        {
            id: "independence", c: "independence", title: "Independent? Basis?", icon: "arrows-split",
            when: "“Are these vectors linearly independent? Do they form a basis? For which k?”",
            for: { concepts: ["independence", "basis-dimension"] },
            card: {
                steps: [
                    "Count first: more than n vectors in ℝⁿ → dependent. Fewer than n → can’t span ℝⁿ.",
                    "Put the vectors in the <b>columns</b> of A and row reduce.",
                    "Pivot in every column ⇔ independent. A free column = a redundant vector; its rref column gives the relation.",
                    "n vectors in ℝⁿ: independent ⇔ basis ⇔ A invertible.",
                    "With a parameter k: keep k as a letter, find the entries that decide the pivots, and split into cases.",
                ],
                check: ["Say the conclusion in words: “rank = 3 = number of vectors, so ker = {0}, so independent.”", "For a relation you found, plug the vectors in and see 0."],
            },
            full: {
                intro: "Independence, spanning, and basis questions all come down to counting pivots in the matrix whose columns are your vectors.",
                steps: [
                    { t: "Count before you compute", html: "<p>m vectors in ℝ<sup>n</sup>: if m &gt; n they’re dependent, done. If m &lt; n they can’t span ℝ<sup>n</sup>. If m = n, independent ⇔ spanning ⇔ basis.</p>" },
                    { t: "Row reduce the column matrix", html: "<p>Pivots in all m columns ⇔ rank m ⇔ ker = {0} ⇔ only the trivial relation ⇔ independent.</p>" },
                    { t: "Dependent? Name the relation", html: "<p>A free column j means v<sub>j</sub> is redundant. Column j of rref gives its coefficients on the pivot vectors, which is the relation the question usually asks for.</p>" },
                    { t: "Parameters", html: "<p>Never divide by an expression with k in it without saying it’s nonzero. The values that make it zero are exactly the special cases.</p>" },
                ],
                example: {
                    title: "Three vectors in ℝ³",
                    html: `<div class="mrow">v<sub>1</sub> = ${V(1, 2, 1)}, v<sub>2</sub> = ${V(2, 1, -1)}, v<sub>3</sub> = ${V(1, 0, -1)}: &nbsp; rref[v<sub>1</sub> v<sub>2</sub> v<sub>3</sub>] = ${M([[1, 0, "−1/3"], [0, 1, "2/3"], [0, 0, 0]])}</div>
                        <p>Column 3 has no pivot, so they’re <b>dependent</b> (not a basis of ℝ<sup>3</sup>): v<sub>3</sub> = −⅓v<sub>1</sub> + ⅔v<sub>2</sub>, or v<sub>1</sub> − 2v<sub>2</sub> + 3v<sub>3</sub> = 0. Check: (1 − 4 + 3, 2 − 2 + 0, 1 + 2 − 3) = 0 ✓.</p>`,
                },
                traps: ["Putting vectors in rows and then trying to read the relation off.", "Forgetting that two vectors are dependent exactly when they’re parallel (no row reducing needed).", "Concluding “basis” from independence alone when there are fewer than n vectors."],
                practice: [{ label: "Independence notes", href: "#/c/independence/details" }],
            },
        },
        // ======================================================================
        {
            id: "perp", c: "orth-complement", title: "V⊥ and extending to a basis of ℝⁿ", icon: "target",
            when: "“Find a basis of V⊥. Find a basis of ℝⁿ containing a basis of V (or of V⊥).”",
            for: { concepts: ["orth-complement"] },
            card: {
                steps: [
                    "Put a spanning set (or basis) of V in the <b>rows</b> of A.",
                    "V⊥ = ker(A): row reduce and find the kernel basis.",
                    "Check: dim V + dim V⊥ = n, and every V⊥ vector dots to 0 with every V vector.",
                    "Basis of ℝⁿ: basis of V + basis of V⊥. Say why: n vectors, independent because V ∩ V⊥ = {0}.",
                    "(V⊥)⊥ = V: no computing.",
                ],
                check: ["Dot products all 0.", "Count: dim V + dim V⊥ = n."],
            },
            full: {
                intro: "Orthogonal complements turn into a kernel problem with one change: the vectors go in the rows.",
                steps: [
                    { t: "Rows, not columns", html: "<p>Ax computes the dot product of each row with x. So Ax = 0 says x is perpendicular to every row, which is exactly “x ∈ V<sup>⊥</sup>” when the rows span V.</p>" },
                    { t: "Kernel basis as usual", html: "<p>Free variables, one vector each. You should get n − dim V of them.</p>" },
                    { t: "Extending", html: "<p>A basis of V and a basis of V<sup>⊥</sup> together are n vectors. They’re independent: if (part in V) + (part in V<sup>⊥</sup>) = 0, then the V part equals −(the V<sup>⊥</sup> part), so it’s in V ∩ V<sup>⊥</sup> = {0}. n independent vectors in ℝ<sup>n</sup> form a basis.</p><p>Without ⊥: row reduce [v<sub>1</sub> … v<sub>p</sub> | e<sub>1</sub> … e<sub>n</sub>] and keep the pivot columns.</p>" },
                ],
                example: {
                    title: "A line in ℝ⁴",
                    html: `<p>V = span(1, 0, 1, 1). V<sup>⊥</sup> = ker${M([[1, 0, 1, 1]])}: x<sub>1</sub> = −x<sub>3</sub> − x<sub>4</sub>, x<sub>2</sub>, x<sub>3</sub>, x<sub>4</sub> free.</p>
                        <div class="mrow">V<sup>⊥</sup> = span${set(V(0, 1, 0, 0), V(-1, 0, 1, 0), V(-1, 0, 0, 1))}, dim 3 = 4 − 1 ✓</div>
                        <p>Basis of ℝ<sup>4</sup> containing a basis of V: (1, 0, 1, 1) together with these three.</p>`,
                },
                traps: ["Putting V’s vectors in the columns (that computes something else).", "Saying V ∩ W = {0} means W = V⊥.", "Listing 4 vectors without explaining why they form a basis."],
                practice: [{ label: "Orthogonal complements notes", href: "#/c/orth-complement/details" }],
            },
        },
        // ======================================================================
        {
            id: "projection", c: "projections", title: "Orthogonal projection onto V", icon: "tray-arrow-down",
            when: "“Find proj_V x, x⊥, and the matrix of the projection.”",
            for: { concepts: ["projections"] },
            card: {
                steps: [
                    "Check the basis of V is <b>orthogonal</b> (dot products 0).",
                    "Normalize: uᵢ = vᵢ / ‖vᵢ‖ (or use (vᵢ·x)/(vᵢ·vᵢ) and skip square roots).",
                    "x∥ = (u₁·x)u₁ + … + (u_m·x)u_m.",
                    "x⊥ = x − x∥.",
                    "Matrix: P = u₁u₁ᵀ + … + u_m u_mᵀ.",
                ],
                check: ["x⊥ · vᵢ = 0 for every basis vector of V.", "x∥ + x⊥ = x.", "P·x = x∥."],
            },
            full: {
                intro: "The projection formula is a sum of one-dimensional projections, and it only works because the basis vectors are perpendicular.",
                steps: [
                    { t: "Orthogonal basis check", html: "<p>Compute v<sub>i</sub> · v<sub>j</sub> for each pair. If a test says “explain why {½v<sub>1</sub>, ½v<sub>2</sub>} is orthonormal,” show the dot product is 0 and each length is 1 (‖v<sub>i</sub>‖ = 2).</p>" },
                    { t: "Coefficients", html: "<p>c<sub>i</sub> = (v<sub>i</sub> · x)/(v<sub>i</sub> · v<sub>i</sub>). Then x<sup>∥</sup> = Σ c<sub>i</sub>v<sub>i</sub>. Same as (u<sub>i</sub>·x)u<sub>i</sub>, with fewer fractions.</p>" },
                    { t: "The perpendicular part", html: "<p>x<sup>⊥</sup> = x − x<sup>∥</sup> is in V<sup>⊥</sup>. Show it by dotting with each v<sub>i</sub>.</p>" },
                    { t: "The matrix", html: "<p>u u<sup>T</sup> is the n×n matrix with entries u<sub>i</sub>u<sub>j</sub>. Add one for each basis vector. Factor out the common fraction (like ⅑) to keep it clean.</p>" },
                ],
                example: {
                    title: "Projecting onto a plane in ℝ³",
                    html: `<p>V = span(v<sub>1</sub>, v<sub>2</sub>), v<sub>1</sub> = (1, 1, 0), v<sub>2</sub> = (0, 0, 1) (v<sub>1</sub> · v<sub>2</sub> = 0). x = (3, 1, 2).</p>
                        <p>c<sub>1</sub> = (3 + 1)/2 = 2, c<sub>2</sub> = 2/1 = 2. x<sup>∥</sup> = 2(1, 1, 0) + 2(0, 0, 1) = <b>(2, 2, 2)</b>. x<sup>⊥</sup> = <b>(1, −1, 0)</b>: dot with v<sub>1</sub>: 1 − 1 = 0 ✓, with v<sub>2</sub>: 0 ✓.</p>
                        <div class="mrow">P = ½${M([[1, 1, 0], [1, 1, 0], [0, 0, 0]])} + ${M([[0, 0, 0], [0, 0, 0], [0, 0, 1]])} = ${M([["½", "½", 0], ["½", "½", 0], [0, 0, 1]])}</div>`,
                },
                traps: ["Using the formula with a non-orthogonal basis.", "Forgetting to divide by ‖vᵢ‖² (or using ‖vᵢ‖ instead of ‖vᵢ‖²).", "Mixing up x∥ and x⊥ in the final answer."],
                practice: [{ label: "Projections notes", href: "#/c/projections/details" }],
            },
        },
        // ======================================================================
        {
            id: "coordinates", c: "coordinates", title: "Coordinates [x]_B", icon: "compass",
            when: "“Explain why B is a basis. Find [x]_B. Given [x]_B, find x.”",
            for: { concepts: ["coordinates"] },
            card: {
                steps: [
                    "S = [v₁ … v_m] (basis vectors as columns).",
                    "Basis of ℝⁿ? Show S is invertible (det ≠ 0 for 2×2, or rref = I).",
                    "[x]_B: solve S c = x. For square S, c = S⁻¹x.",
                    "Basis of a subspace? Row reduce [S | x]. Inconsistent → x ∉ V.",
                    "Backward: x = S[x]_B, just multiply.",
                ],
                check: ["c₁v₁ + c₂v₂ + … really equals x.", "[x]_B has as many entries as B has vectors."],
            },
            full: {
                intro: "Every coordinates problem is the equation x = S[x]_B read in one direction or the other.",
                steps: [
                    { t: "Why is it a basis?", html: "<p>n vectors in ℝ<sup>n</sup>: show S is invertible. For 2×2, det = ad − bc ≠ 0 is the quickest. Then cite: “S invertible ⇒ columns form a basis of ℝ<sup>n</sup>.”</p>" },
                    { t: "Forward: x → [x]_B", html: "<p>Solve S c = x by row reducing [S | x], or use S<sup>−1</sup>x for a 2×2 with the shortcut inverse.</p>" },
                    { t: "Backward: [x]_B → x", html: "<p>x = c<sub>1</sub>v<sub>1</sub> + … + c<sub>m</sub>v<sub>m</sub>. No inverse needed.</p>" },
                ],
                example: {
                    title: "A basis of ℝ²",
                    html: `<p>B = (${V(1, 2)}, ${V(3, 5)}), x = ${V(4, 7)}. det S = 5 − 6 = −1 ≠ 0, so B is a basis.</p>
                        <div class="mrow">S<sup>−1</sup> = −1·${M([[5, -3], [-2, 1]])} = ${M([[-5, 3], [2, -1]])}, &nbsp; [x]<sub>B</sub> = S<sup>−1</sup>x = ${V(1, 1)}</div>
                        <p>Check: (1, 2) + (3, 5) = (4, 7) ✓.</p>`,
                },
                traps: ["Using S instead of S⁻¹ (or vice versa).", "Ignoring the last equation on a subspace and inventing coordinates for a vector that isn’t in V."],
                practice: [{ label: "Coordinates notes", href: "#/c/coordinates/details" }],
            },
        },
        // ======================================================================
        {
            id: "b-matrix", c: "b-matrix", title: "The B-matrix of T", icon: "gear-six",
            when: "“Find [T]_B, the B-matrix of T.”",
            for: { concepts: ["b-matrix"] },
            card: {
                steps: [
                    "Compute T(vⱼ) = Avⱼ for each basis vector.",
                    "Write each T(vⱼ) in B-coordinates: T(vⱼ) = c₁v₁ + … + cₙvₙ.",
                    "Those coordinates are <b>column j</b> of B.",
                    "Or: B = S⁻¹AS (compute AS first, then S⁻¹(AS)).",
                    "Geometric T (projection/reflection)? Pick vectors on and perpendicular to the line/plane: B is diagonal with 1, 0, −1.",
                ],
                check: ["AS = SB.", "If T(vⱼ) is a multiple of vⱼ, column j has a single nonzero entry on the diagonal."],
            },
            full: {
                intro: "The B-matrix is T rewritten in the B grid. The column-by-column method is usually fastest by hand, and AS = SB is the check.",
                steps: [
                    { t: "Apply T to the basis", html: "<p>Multiply A by each v<sub>j</sub>. Often you’ll spot T(v<sub>j</sub>) = (number)·v<sub>j</sub> right away.</p>" },
                    { t: "Convert to B-coordinates", html: "<p>Solve T(v<sub>j</sub>) = c<sub>1</sub>v<sub>1</sub> + … + c<sub>n</sub>v<sub>n</sub>. The c’s go down column j. Don’t put T(v<sub>j</sub>) itself in the matrix.</p>" },
                    { t: "Check with AS = SB", html: "<p>Both sides are quick 2×2 products. If they match, you’re right.</p>" },
                ],
                example: {
                    title: "An upper-triangular A",
                    html: `<p>A = ${M([[3, 1], [0, 2]])}, B = (${V(1, 0)}, ${V(1, -1)}).</p>
                        <p>Av<sub>1</sub> = (3, 0) = 3v<sub>1</sub> → column (3, 0). Av<sub>2</sub> = (3 − 1, −2) = (2, −2) = 2v<sub>2</sub> → column (0, 2).</p>
                        <div class="mrow">[T]<sub>B</sub> = ${M([[3, 0], [0, 2]])}</div>`,
                },
                traps: ["Writing T(vⱼ) instead of [T(vⱼ)]_B in column j.", "Computing SAS⁻¹ instead of S⁻¹AS."],
                practice: [{ label: "B-matrix notes", href: "#/c/b-matrix/details" }],
            },
        },
        // ======================================================================
        {
            id: "similar", c: "similarity", title: "Similar or not?", icon: "shuffle",
            when: "“Is A similar to B? Find S, or explain why not.”",
            for: { concepts: ["similarity"] },
            card: {
                table: { head: ["Quick test", "If different →"], rows: [["rank", "not similar"], ["invertible?", "not similar"], ["one is kI", "similar only if equal"]] },
                steps: [
                    "Run the quick tests in the table first.",
                    "Otherwise let S = [[a, b], [c, d]] and expand AS = SB.",
                    "Solve the 4 linear equations.",
                    "Pick values with det S ≠ 0. If every solution has det 0, they’re not similar.",
                ],
                check: ["Multiply out AS and SB with your S: they match.", "det S ≠ 0."],
            },
            full: {
                intro: "Two ways to win: find an invertible S, or find a property similar matrices must share that these don’t.",
                steps: [
                    { t: "Invariants first", html: "<p>Similar matrices have the same rank and nullity, and one is invertible exactly when the other is. kI is similar only to itself. If any of these differ, you’re done.</p>" },
                    { t: "Brute force", html: "<p>AS = SB is linear in a, b, c, d. Expand both sides, match entries, and solve. Then choose numbers that keep det S ≠ 0.</p>" },
                    { t: "Shortcut when B is diagonal", html: "<p>AS = S·diag(λ<sub>1</sub>, λ<sub>2</sub>) says A(col 1 of S) = λ<sub>1</sub>(col 1) and A(col 2) = λ<sub>2</sub>(col 2). So look for vectors that A just scales.</p>" },
                ],
                example: {
                    title: "A ∼ diagonal",
                    html: `<p>A = ${M([[2, 1], [0, 5]])}, B = ${M([[2, 0], [0, 5]])}. AS = ${M([["2a + c", "2b + d"], ["5c", "5d"]])}, SB = ${M([["2a", "5b"], ["2c", "5d"]])}.</p>
                        <p>5c = 2c ⇒ c = 0; 2b + d = 5b ⇒ d = 3b. S = ${M([[1, 1], [0, 3]])}, det 3 ≠ 0. <b>Similar.</b> (Check: A(1, 3) = (5, 15) = 5(1, 3) ✓.)</p>`,
                },
                traps: ["Stopping after finding S = 0 or another non-invertible S.", "Saying “same rank ⇒ similar.”"],
                practice: [{ label: "Similarity notes", href: "#/c/similarity/details" }],
            },
        },
    ]);
})();
