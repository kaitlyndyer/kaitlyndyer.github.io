(function () {
"use strict";
const { M, V, set } = LA;

registerConcept({
  id: "b-matrix",
  oneLiner:
    "The <b>B-matrix</b> of T is the matrix that does T in B-coordinates: <b>[T(x)]<sub>B</sub> = B[x]<sub>B</sub></b>. Compute it as <b>B = S<sup>−1</sup>AS</b>, or column by column: <b>column j = [T(v<sub>j</sub>)]<sub>B</sub></b>.",

  related: ["coordinates", "similarity", "projections"],

  summary: {
    keyPoints: [
      { lec: [10], kind: "key", html: "<b>B = S<sup>−1</sup>AS</b>, equivalently <b>AS = SB</b> and <b>A = SBS<sup>−1</sup></b>. A is the standard matrix of T, S = [v<sub>1</sub> … v<sub>n</sub>]." },
      { lec: [10], kind: "key", html: "<b>Column by column:</b> B = [ [T(v<sub>1</sub>)]<sub>B</sub> … [T(v<sub>n</sub>)]<sub>B</sub> ]. Compute T(v<sub>j</sub>) = Av<sub>j</sub>, then write it in B-coordinates." },
      { lec: [10], html: "Read the diagram: x ⟶(A)⟶ T(x) on top, [x]<sub>B</sub> ⟶(B)⟶ [T(x)]<sub>B</sub> on the bottom, S going up both sides. Going around either way gives the same result: AS = SB." },
      { lec: [10], kind: "key", html: "<b>B is diagonal ⇔ T(v<sub>j</sub>) = c<sub>j</sub>v<sub>j</sub></b> for every basis vector: each v<sub>j</sub> gets sent to a multiple of itself. The c<sub>j</sub> are the diagonal entries." },
      { lec: [10], html: "Geometric maps: pick basis vectors that T just stretches. Projection onto a line L: (on L, ⊥ L) gives diag(1, 0). Reflection about L: diag(1, −1). In ℝ<sup>3</sup>, projection onto a plane: diag(1, 1, 0)." },
      { lec: [10], kind: "warn", html: "Order matters: <b>S<sup>−1</sup>AS</b>, not SAS<sup>−1</sup>. Memory hook: S takes B-coordinates to standard ones, so apply S first (rightmost), then A, then S<sup>−1</sup> to come back." },
    ],
  },

  details: [
    {
      id: "diagram",
      title: "The diagram (where B = S⁻¹AS comes from)",
      lec: [10],
      html: `
        <p>Start with a B-address c = [x]<sub>B</sub>. To apply T:</p>
        <ol>
          <li>Convert to standard coordinates: x = Sc.</li>
          <li>Apply T: T(x) = ASc.</li>
          <li>Convert the answer back to B-coordinates: [T(x)]<sub>B</sub> = S<sup>−1</sup>ASc.</li>
        </ol>
        <p>So the matrix that takes [x]<sub>B</sub> to [T(x)]<sub>B</sub> is <b>B = S<sup>−1</sup>AS</b>. Multiply on the left by S to get the version with no inverse: <b>SB = AS</b>.</p>
        <p class="callout tip">AS = SB is often the easiest to <b>check</b>. Multiply both sides out; if they match, your B is right.</p>`,
    },
    {
      id: "column",
      title: "Column by column (usually fastest by hand)",
      lec: [10],
      html: `
        <p>Theorem 3.4.3: column j of B is [T(v<sub>j</sub>)]<sub>B</sub>. Write each T(v<sub>j</sub>) as a combination of the v’s; the coefficients go down column j.</p>
        <p><b>Example.</b> A = ${M([[2, 1], [1, 2]])}, B = (v<sub>1</sub>, v<sub>2</sub>) = (${V(1, 0)}, ${V(1, 1)}).</p>
        <ul>
          <li>T(v<sub>1</sub>) = Av<sub>1</sub> = (2, 1) = <b>1</b>·v<sub>1</sub> + <b>1</b>·v<sub>2</sub> &nbsp;(check: (1, 0) + (1, 1) = (2, 1) ✓)</li>
          <li>T(v<sub>2</sub>) = Av<sub>2</sub> = (3, 3) = <b>0</b>·v<sub>1</sub> + <b>3</b>·v<sub>2</sub></li>
        </ul>
        <div class="mrow">B = ${M([[1, 0], [1, 3]])}</div>
        <p class="callout try">Check with AS = SB: AS = ${M([[2, 1], [1, 2]])}${M([[1, 1], [0, 1]])} = ${M([[2, 3], [1, 3]])} and SB = ${M([[1, 1], [0, 1]])}${M([[1, 0], [1, 3]])} = ${M([[2, 3], [1, 3]])} ✓</p>`,
    },
    {
      id: "formula",
      title: "With the formula B = S⁻¹AS",
      lec: [10],
      html: `
        <p>A = ${M([[1, 1], [-2, 4]])}, B = (${V(1, 1)}, ${V(1, 2)}). S = ${M([[1, 1], [1, 2]])}, det S = 1, S<sup>−1</sup> = ${M([[2, -1], [-1, 1]])}.</p>
        <div class="mrow">AS = ${M([[2, 3], [2, 6]])}, &nbsp; S<sup>−1</sup>(AS) = ${M([[2, -1], [-1, 1]])}${M([[2, 3], [2, 6]])} = ${M([[2, 0], [0, 3]])}</div>
        <p>Diagonal! Look at AS: its columns are Av<sub>1</sub> = (2, 2) = 2v<sub>1</sub> and Av<sub>2</sub> = (3, 6) = 3v<sub>2</sub>. Each basis vector just gets stretched, so T looks like “stretch by 2 along v<sub>1</sub>, by 3 along v<sub>2</sub>.”</p>
        <p>In the other teacher’s Lesson 12, Example 2, the same formula on a 3×3 gives B = [[4, 5, 3], [1, 1, 2], [−4, −8, −5]]. Its first column (4, 1, −4) is [T(v<sub>1</sub>)]<sub>B</sub>, which is how the proposition B = [ [T(v<sub>1</sub>)]<sub>B</sub> … ] gets proved.</p>`,
    },
    {
      id: "geometric",
      title: "Geometric transformations: choose a smart basis",
      lec: [10],
      html: `
        <p>For projections and reflections you don’t need A at all to get a simple B. Pick basis vectors that T leaves alone or kills or flips.</p>
        <p><b>Reflection about the line y = 2x in ℝ<sup>2</sup>.</b> v<sub>1</sub> = (1, 2) is on the line: T(v<sub>1</sub>) = v<sub>1</sub>. v<sub>2</sub> = (−2, 1) is perpendicular: T(v<sub>2</sub>) = −v<sub>2</sub>. So</p>
        <div class="mrow">B = ${M([[1, 0], [0, -1]])}, &nbsp; and then A = SBS<sup>−1</sup> = ${M([[1, -2], [2, 1]])}${M([[1, 0], [0, -1]])} · ⅕${M([[1, 2], [-2, 1]])} = ⅕${M([[-3, 4], [4, 3]])}</div>
        <p>That’s a slick way to find the standard matrix of a reflection: easy B first, then A = SBS<sup>−1</sup>.</p>
        <p><b>Orthogonal projection onto the line spanned by (1, −1, 2) in ℝ<sup>3</sup></b> (the notes’ Lesson 12, Example 3): v<sub>1</sub> = (1, −1, 2) with T(v<sub>1</sub>) = v<sub>1</sub>, and two vectors perpendicular to it, like (1, 1, 0) and (0, 2, 1), with T = 0 on them. B = diag(1, 0, 0).</p>
        <p class="callout warn">Then check that your three vectors really are a basis (S invertible). Two perpendicular vectors must also not be parallel to each other.</p>`,
    },
    {
      id: "no-diagonal",
      title: "When no basis makes B diagonal",
      lec: [10],
      html: `
        <p>A rotation by 90° in ℝ<sup>2</sup> sends every nonzero x to a vector perpendicular to x, never to a multiple of x. So no basis makes its B-matrix diagonal (Example 3.4.10).</p>`,
    },
  ],

  flashcards: [
    { front: "B-matrix formula", back: "B = S⁻¹AS, where S = [v₁ … vₙ] and A is the standard matrix." },
    { front: "Version of B = S⁻¹AS without inverses", back: "AS = SB." },
    { front: "Standard matrix from the B-matrix", back: "A = SBS⁻¹." },
    { front: "Column j of the B-matrix", back: "[T(vⱼ)]_B: the coordinates of T(vⱼ) in the basis B." },
    { front: "When is the B-matrix diagonal?", back: "When T(vⱼ) = cⱼvⱼ for every basis vector (each is just stretched)." },
    { front: "B-matrix of reflection about a line L in ℝ², with v₁ on L and v₂ ⊥ L", back: "diag(1, −1)." },
    { front: "B-matrix of projection onto a plane V in ℝ³, with v₁, v₂ in V and v₃ ⊥ V", back: "diag(1, 1, 0)." },
    { front: "What does [T(x)]_B = B[x]_B say?", back: "B does to B-coordinates what T does to vectors." },
  ],

  quiz: [
    {
      type: "mc", lec: [10],
      q: "T(v₁) = 3v₁ and T(v₂) = v₁ − v₂. What is the B-matrix for B = (v₁, v₂)?",
      options: [M([[3, 1], [0, -1]]), M([[3, 0], [1, -1]]), M([[3, 0], [0, -1]]), M([[1, 3], [-1, 0]])],
      answer: 0,
      explain: "Column 1 = [T(v₁)]_B = (3, 0). Column 2 = [T(v₂)]_B = (1, −1).",
    },
    {
      type: "mc", lec: [10],
      q: "Which equation is equivalent to B = S⁻¹AS?",
      options: ["SA = BS", "AS = SB", "A = S⁻¹BS", "B = SAS⁻¹"],
      answer: 1,
      explain: "Multiply B = S⁻¹AS on the left by S: SB = AS.",
    },
    {
      type: "mc", lec: [10],
      q: "T is the orthogonal projection onto the plane x + y + z = 0 in ℝ³. Which basis makes its B-matrix diag(1, 1, 0)?",
      options: ["(1, −1, 0), (0, 1, −1), (1, 1, 1)", "(1, 1, 1), (1, −1, 0), (0, 1, −1)", "e₁, e₂, e₃", "(1, −1, 0), (1, 1, 1), (0, 1, −1)"],
      answer: 0,
      explain: "The first two lie in the plane (T fixes them: 1, 1 on the diagonal); (1, 1, 1) is the normal (T kills it: 0). The order of the basis decides the order of the diagonal.",
    },
    {
      type: "tf", lec: [10],
      q: "True or false: column j of the B-matrix is T(vⱼ).",
      answer: false,
      explain: "It’s [T(vⱼ)]_B, the B-coordinates of T(vⱼ). Writing T(vⱼ) itself (in standard coordinates) gives AS, not B.",
    },
    {
      type: "mc", lec: [10],
      q: `A = ${M([[3, 0], [0, 5]])} and B = (e₂, e₁). What is the B-matrix?`,
      options: [M([[5, 0], [0, 3]]), M([[3, 0], [0, 5]]), M([[0, 5], [3, 0]]), M([[0, 3], [5, 0]])],
      answer: 0,
      explain: "T(e₂) = 5e₂ = 5·(first basis vector); T(e₁) = 3e₁ = 3·(second). So B = diag(5, 3). Reordering the basis reorders the diagonal.",
    },
  ],
});
})();
