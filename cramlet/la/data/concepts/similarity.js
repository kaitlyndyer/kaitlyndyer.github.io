(function () {
"use strict";
const { M, V, set } = LA;

registerConcept({
  id: "similarity",
  oneLiner:
    "A and B are <b>similar</b> (A ∼ B) if <b>AS = SB</b> for some <b>invertible</b> S, i.e. B = S<sup>−1</sup>AS. Similar matrices are the <b>same transformation in different bases</b>, so they share rank, nullity, and invertibility.",

  related: ["b-matrix", "coordinates", "basis-dimension"],

  summary: {
    keyPoints: [
      { lec: [10], kind: "key", html: "<b>A ∼ B ⇔ there’s an invertible S with AS = SB</b> (⇔ B = S<sup>−1</sup>AS). The standard matrix of T and any B-matrix of T are similar." },
      { lec: [10], html: "Similarity is an <b>equivalence relation</b>: A ∼ A; A ∼ B ⇒ B ∼ A; A ∼ B and B ∼ C ⇒ A ∼ C." },
      { lec: [10], kind: "key", html: "<b>To show A ∼ B:</b> let S = [[x, y], [z, t]], expand AS = SB, solve the linear equations, and pick values that make S <b>invertible</b> (check det ≠ 0)." },
      { lec: [10], kind: "key", html: "<b>To show A ≁ B:</b> find something similar matrices must share that differs: <b>rank</b>, <b>nullity</b>, invertibility. (Or show every solution S of AS = SB is non-invertible.)" },
      { lec: [10], html: "If A ∼ B then A<sup>t</sup> ∼ B<sup>t</sup> (same S), A + kI ∼ B + kI, and A invertible ⇔ B invertible." },
      { lec: [10], kind: "warn", html: "<b>kI is only similar to itself:</b> S<sup>−1</sup>(kI)S = kI. So I<sub>n</sub> isn’t similar to any other matrix, and [[2, 1], [0, 2]] is not similar to 2I." },
      { lec: [10], html: "Same rank does <b>not</b> mean similar: [[0, 1], [0, 0]] and [[1, 0], [0, 0]] both have rank 1, but the first squares to 0 and the second doesn’t." },
    ],
  },

  details: [
    {
      id: "definition",
      title: "Definition and meaning",
      lec: [10],
      html: `
        <p>Two n×n matrices are <b>similar</b> if AS = SB (equivalently B = S<sup>−1</sup>AS) for some invertible n×n S.</p>
        <p>Meaning: B is the B-matrix of the transformation x ↦ Ax with respect to the basis made of the columns of S. Similar matrices describe <b>the same transformation in different coordinates</b>. As the Lesson 12 notes put it: “∼ is as important as =.”</p>`,
    },
    {
      id: "show-similar",
      title: "Proving two matrices are similar (brute force)",
      lec: [10],
      html: `
        <p><b>Teacher’s example:</b> is ${M([[1, 0], [0, -1]])} similar to ${M([[0, 1], [1, 0]])}?</p>
        <p>Let S = ${M([["a", "b"], ["c", "d"]])}. Then</p>
        <div class="mrow">${M([[1, 0], [0, -1]])}${M([["a", "b"], ["c", "d"]])} = ${M([["a", "b"], ["−c", "−d"]])} &nbsp; and &nbsp; ${M([["a", "b"], ["c", "d"]])}${M([[0, 1], [1, 0]])} = ${M([["b", "a"], ["d", "c"]])}</div>
        <p>So a = b and c = −d. Choose a = b = 1, c = 1, d = −1: S = ${M([[1, 1], [1, -1]])}, with det = −2 ≠ 0. Invertible, so <b>yes, they’re similar</b>.</p>
        <p class="callout warn">Finding <i>some</i> S with AS = SB isn’t enough: S = 0 always works! You must show your S is <b>invertible</b>.</p>
        <p><b>Another:</b> A = ${M([[0, 1], [-2, 3]])} ∼ ${M([[1, 0], [0, 2]])}? AS = S·diag(1, 2) means A(first column of S) = 1·(first column) and A(second column) = 2·(second column). Solving gives first column (a, a), second column (b, 2b). With a = b = 1: S = ${M([[1, 1], [1, 2]])}, det = 1. Similar.</p>`,
    },
    {
      id: "not-similar",
      title: "Proving two matrices are NOT similar",
      lec: [10],
      html: `
        <p>Similar matrices share (Exercises 3.4.71–72):</p>
        <ul>
          <li><b>rank</b> and <b>nullity</b> (if B = S<sup>−1</sup>AS, then x ∈ ker B ⇔ Sx ∈ ker A, and S is invertible, so the kernels have the same dimension);</li>
          <li><b>invertibility</b>;</li>
          <li>being zero, being the identity, being kI;</li>
          <li>A<sup>2</sup> = 0 (if A<sup>2</sup> = 0 then B<sup>2</sup> = S<sup>−1</sup>A<sup>2</sup>S = 0), A<sup>2</sup> = A, and so on.</li>
        </ul>
        <p><b>Examples.</b></p>
        <ul>
          <li>${M([[1, 1], [0, 0]])} ≁ ${M([[1, 0], [0, -1]])}: ranks 1 and 2.</li>
          <li>${M([[2, 1], [0, 2]])} ≁ ${M([[2, 0], [0, 2]])} = 2I: anything similar to 2I equals S<sup>−1</sup>(2I)S = 2I.</li>
          <li>${M([[0, 1], [0, 0]])} ≁ ${M([[1, 0], [0, 0]])}: same rank, but the first squares to 0 and the second doesn’t.</li>
        </ul>
        <p class="callout tip">The brute-force method also proves non-similarity: if every S solving AS = SB has det = 0, they aren’t similar. For A = [[2, 1], [0, 2]] and B = 2I: AS = 2S forces the second row of S to be 0.</p>`,
    },
    {
      id: "same-shape",
      title: "Sneaky similar pairs",
      lec: [10],
      html: `
        <ul>
          <li>${M([[3, 0], [0, 1]])} ∼ ${M([[1, 0], [0, 3]])}: swap the basis order, S = ${M([[0, 1], [1, 0]])}.</li>
          <li>${M([[1, 1], [0, 0]])} ∼ ${M([[0, 0], [1, 1]])}: both are projections (A<sup>2</sup> = A) of rank 1, so both are similar to diag(1, 0). Transitivity does the rest.</li>
          <li>AB ∼ BA when A is invertible: A<sup>−1</sup>(AB)A = BA.</li>
        </ul>`,
    },
  ],

  flashcards: [
    { front: "A is similar to B", back: "There’s an invertible S with AS = SB (B = S⁻¹AS)." },
    { front: "Why are the standard matrix and the B-matrix of T similar?", back: "B = S⁻¹AS with S = [v₁ … vₙ], which is invertible." },
    { front: "Three properties of ∼", back: "Reflexive, symmetric, transitive (an equivalence relation)." },
    { front: "What do similar matrices share?", back: "Rank, nullity, invertibility (and A² = 0, A² = A, etc.)." },
    { front: "Which matrices are similar to kI?", back: "Only kI itself." },
    { front: "How do you show A ∼ B by hand (2×2)?", back: "Solve AS = SB for S = [[a, b], [c, d]], then choose values with det S ≠ 0." },
    { front: "If A ∼ B, is A³ ∼ B³?", back: "Yes: S⁻¹A³S = (S⁻¹AS)³ = B³." },
  ],

  quiz: [
    {
      type: "tf", lec: [10],
      q: "True or false: two n×n matrices with the same rank are similar.",
      answer: false,
      explain: "[[0, 1], [0, 0]] and [[1, 0], [0, 0]] both have rank 1, but the first squares to 0 and the second doesn’t, so they can’t be similar.",
    },
    {
      type: "tf", lec: [10],
      q: "True or false: I₃ is similar to every invertible 3×3 matrix.",
      answer: false,
      explain: "S⁻¹I₃S = I₃ for every S, so I₃ is only similar to itself.",
    },
    {
      type: "mc", lec: [10],
      q: `Why is ${M([[1, 2], [2, 4]])} not similar to ${M([[1, 0], [0, 2]])}?`,
      options: ["Different ranks (1 vs 2)", "They aren’t both diagonal", "Different first entries", "They are similar"],
      answer: 0,
      explain: "Similar matrices have the same rank. The first has rank 1 (row 2 = 2·row 1); the second has rank 2.",
    },
    {
      type: "tf", lec: [10],
      q: "True or false: if A ∼ B and A is invertible, then B is invertible.",
      answer: true,
      explain: "B = S⁻¹AS is a product of invertible matrices. (Or: same rank n.)",
    },
    {
      type: "tf", lec: [10],
      q: "True or false: if A ∼ B, then A + 5I ∼ B + 5I.",
      answer: true,
      explain: "S⁻¹(A + 5I)S = S⁻¹AS + 5S⁻¹S = B + 5I.",
    },
    {
      type: "mc", lec: [10],
      q: "You solved AS = SB and found every solution has the form S = [[a, 0], [c, 0]]. What can you conclude?",
      options: ["A and B are not similar", "A and B are similar with S = [[1, 0], [0, 0]]", "A = B", "Nothing yet"],
      answer: 0,
      explain: "Every such S has a zero column, so det S = 0. No invertible S works, so A ≁ B.",
    },
  ],
});
})();
