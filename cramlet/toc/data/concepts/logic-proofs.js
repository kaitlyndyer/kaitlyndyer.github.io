(function () {
"use strict";

registerConcept({
  id: "logic-proofs",
  oneLiner:
    "The math toolkit for this course: <b>logic</b> (∧, ∨, ¬, →, quantifiers) to state things precisely, and <b>proofs</b> (construction, contradiction, induction) to show they’re true.",

  related: ["languages", "pumping", "nfa-to-dfa"],

  summary: {
    keyPoints: [
      { lec: [0], html: "Proofs are written <b>by humans, for humans</b>: full English sentences, clear, precise, and concise, not a list of formal symbols." },
      { lec: [0], html: "Three common kinds: <b>by construction</b> (build the thing), <b>by contradiction</b> (assume it’s false and reach something impossible), and <b>by induction</b> (prove P(1), then P(i) ⇒ P(i + 1))." },
      { lec: [0], html: "<b>P → Q</b> (“if P then Q”) is false only when P is true and Q is false. It’s the same as <b>¬P ∨ Q</b>." },
      { lec: [0], kind: "warn", html: "If P is false, P → Q is <b>true</b> no matter what Q is. So F → P is always true." },
      { lec: [0], kind: "key", html: "<b>Contrapositive:</b> P → Q is equivalent to ¬Q → ¬P. The <b>converse</b> Q → P is <b>not</b> equivalent." },
      { lec: [0], html: "<b>De Morgan’s laws:</b> ¬(P ∧ Q) ≡ ¬P ∨ ¬Q and ¬(P ∨ Q) ≡ ¬P ∧ ¬Q." },
      { lec: [0], html: "<b>Quantifiers:</b> ∀x P(x) is a “big AND” over all x; ∃x P(x) is a “big OR.” Negating flips them: ¬∀x P(x) ≡ ∃x ¬P(x), and ¬∃x P(x) ≡ ∀x ¬P(x)." },
      { lec: [0, 4], html: "Flipping quantifiers is exactly how the pumping lemma turns into a way to prove languages are <b>not</b> regular." },
    ],
    compare: {
      head: ["Statement", "Equivalent to", "Name"],
      rows: [
        ["P → Q", "¬P ∨ Q", "Implication as “or”"],
        ["P → Q", "¬Q → ¬P", "Contrapositive"],
        ["¬(P ∧ Q)", "¬P ∨ ¬Q", "De Morgan"],
        ["¬(P ∨ Q)", "¬P ∧ ¬Q", "De Morgan"],
        ["R ∨ (P ∧ Q)", "(R ∨ P) ∧ (R ∨ Q)", "Distributive law"],
        ["¬∀x P(x)", "∃x ¬P(x)", "Negating ∀"],
      ],
    },
  },

  details: [
    {
      id: "proofs",
      title: "What a proof looks like",
      lec: [0],
      html: `
        <p>A fully formal proof would list axioms and apply fixed rules of logical inference, one step at a time. That’s <b>not</b> how proofs are written in practice. Proofs are by humans, for humans: use full English sentences, and be clear, precise, and concise. Writing good proofs takes practice.</p>
        <ul>
          <li><b>By construction:</b> show something exists by building it. Example: “there is a program that adds two integers”; just write it. Most closure proofs in this course are constructions.</li>
          <li><b>By contradiction:</b> assume the statement is false, then derive something false. The pumping lemma proofs work this way.</li>
          <li><b>By induction:</b> to show P(n) for all natural numbers n, show P(1), then show that P(i) implies P(i + 1). The NFA → DFA and Regex → NFA proofs use induction.</li>
        </ul>`,
    },
    {
      id: "sqrt2",
      title: "Example: √2 is irrational (proof by contradiction)",
      lec: [0],
      html: `
        <p><b>Definition:</b> a number is rational if it can be written as p/q with p, q integers and q ≠ 0.</p>
        <p><b>Theorem:</b> √2 is not rational.</p>
        <p><b>Proof.</b> Suppose, for contradiction, that √2 = p/q for integers p, q. We can assume p and q are not both even; otherwise divide both by 2 until one is odd.</p>
        <p>Squaring gives 2 = p²/q², so p² = 2q². That makes p² even, so p is even (an odd number squared is odd). Write p = 2k. Then 4k² = 2q², so q² = 2k², which makes q² even and so q even.</p>
        <p>Now p and q are both even, which contradicts our assumption. So √2 is irrational. ∎</p>`,
    },
    {
      id: "logic",
      title: "Boolean logic and implication",
      lec: [0],
      html: `
        <ul>
          <li><b>P ∨ Q</b> (or): at least one of P, Q is true.</li>
          <li><b>P ∧ Q</b> (and): both are true.</li>
          <li><b>¬P</b> (not): P is false. Also written P̅.</li>
          <li><b>P → Q</b> (if P then Q): same as ¬P ∨ Q. False only when P is true and Q is false.</li>
          <li><b>P ↔ Q</b> (if and only if): same as (P → Q) ∧ (Q → P).</li>
        </ul>
        <p class="callout warn">Is “F → P” true? <b>Yes, always.</b> An implication with a false “if” part can’t be broken, because it promises nothing. (In the Playground, F → P is true in every row.)</p>`,
    },
    {
      id: "laws",
      title: "Useful equivalences",
      lec: [0],
      html: `
        <ul>
          <li><b>Distributive laws:</b> R ∨ (P ∧ Q) ≡ (R ∨ P) ∧ (R ∨ Q), and R ∧ (P ∨ Q) ≡ (R ∧ P) ∨ (R ∧ Q).</li>
          <li><b>De Morgan’s laws:</b> ¬(P ∧ Q) ≡ ¬P ∨ ¬Q, and ¬(P ∨ Q) ≡ ¬P ∧ ¬Q.</li>
          <li><b>Contrapositive:</b> P → Q ≡ ¬Q → ¬P.</li>
        </ul>
        <p class="callout tip">Two formulas are equivalent when they have the same truth value in <b>every</b> row of the truth table. The Playground checks this for you.</p>`,
    },
    {
      id: "cards",
      title: "The card puzzle",
      lec: [0],
      html: `
        <p>Each card has a number on one side and a color on the other. Someone claims: <i>“If a card has an even number on one side, then its other side is red.”</i> Which cards must you turn over to test it?</p>
        <p>Most people pick the even card and the red card. But the red card can’t break the rule: the claim never says red cards must be even (that would be the <b>converse</b>). The card you must check is the <b>non-red</b> one. By the <b>contrapositive</b>, “not red → not even,” if its back is even, the claim is false.</p>
        <p class="callout try">Try it in the Playground before reading the answer too closely.</p>`,
    },
    {
      id: "quantifiers",
      title: "Quantifiers",
      lec: [0],
      html: `
        <ul>
          <li><b>∀x P(x)</b>: “for all x, P(x) holds.” Example: for all integers p, q with q ≠ 0, p/q is rational.</li>
          <li><b>∃x P(x)</b>: “there exists an x such that P(x) holds.” Example: there exists an integer x &gt; 500.</li>
          <li>Think of ∀x as a big <b>AND</b> over every x, and ∃x as a big <b>OR</b>.</li>
        </ul>
        <p><b>De Morgan’s laws for quantifiers:</b> ¬(∃x P(x)) ≡ ∀x ¬P(x), and ¬(∀x P(x)) ≡ ∃x ¬P(x). Negating a statement with several quantifiers flips <b>every</b> one of them and negates the inside. You’ll use this to turn the pumping lemma around.</p>`,
    },
  ],

  playground: [
    {
      id: "truth",
      title: "Truth tables",
      lec: [0],
      intro: `<p>Type a formula φ using P, Q, R, … (or pick an example) to see its truth table, with a column for every part of it. Add a second formula ψ to check whether they’re <b>equivalent</b>: rows where they disagree are highlighted. You can also type ~ for ¬, &amp; for ∧, | for ∨, -&gt; for →, and &lt;-&gt; for ↔.</p>`,
      widget: "truth-table",
      config: {
        examples: [
          ["P → Q", "¬Q → ¬P"], ["P → Q", "Q → P"], ["¬(P ∧ Q)", "¬P ∨ ¬Q"], ["¬(P ∨ Q)", "¬P ∧ ¬Q"],
          ["R ∨ (P ∧ Q)", "(R ∨ P) ∧ (R ∨ Q)"], ["P → Q", "¬P ∨ Q"], ["P ↔ Q", "(P → Q) ∧ (Q → P)"], ["F → P", ""],
        ],
      },
    },
    {
      id: "cards",
      title: "The card puzzle",
      lec: [0],
      intro: `<p>The puzzle from the intro lecture. Pick exactly the cards you need to flip, then check. Solving it earns crumbs.</p>`,
      widget: "card-puzzle",
      config: {
        cards: [{ face: "8", kind: "even" }, { face: "3", kind: "odd" }, { face: "red", kind: "red" }, { face: "brown", kind: "other" }],
      },
    },
  ],

  flashcards: [
    { front: "Proof by construction", back: "Show something exists by building it." },
    { front: "Proof by contradiction", back: "Assume the statement is false, then derive something false." },
    { front: "Proof by induction", back: "To show P(n) for all n: prove P(1), then prove P(i) ⇒ P(i + 1)." },
    { front: "When is P → Q false?", back: "Only when P is true and Q is false. P → Q ≡ ¬P ∨ Q." },
    { front: "Is F → P true?", back: "Yes, always: an implication with a false premise can’t be broken." },
    { front: "Contrapositive of P → Q", back: "¬Q → ¬P. It’s equivalent to P → Q." },
    { front: "Converse of P → Q", back: "Q → P. It is <b>not</b> equivalent to P → Q." },
    { front: "De Morgan’s laws", back: "¬(P ∧ Q) ≡ ¬P ∨ ¬Q, and ¬(P ∨ Q) ≡ ¬P ∧ ¬Q." },
    { front: "Negating quantifiers", back: "¬∀x P(x) ≡ ∃x ¬P(x), and ¬∃x P(x) ≡ ∀x ¬P(x)." },
    { front: "∀ and ∃ as AND and OR", back: "∀x P(x) is a big AND over all x; ∃x P(x) is a big OR." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [0],
      q: "Is “F → P” true? (F means false.)",
      options: ["Yes, always", "No, never", "It depends on P"],
      answer: 0,
      explain: "An implication is false only when the “if” part is true and the “then” part is false. Here the “if” part is false, so it’s true no matter what P is.",
    },
    {
      type: "mc",
      lec: [0],
      q: "Which statement is equivalent to P → Q?",
      options: ["Q → P", "¬P → ¬Q", "¬Q → ¬P", "P ∧ Q"],
      answer: 2,
      explain: "The contrapositive ¬Q → ¬P is equivalent. Q → P (the converse) and ¬P → ¬Q (the inverse) are not.",
    },
    {
      type: "mc",
      lec: [0],
      q: "What is ¬(P ∨ Q) equivalent to?",
      options: ["¬P ∨ ¬Q", "¬P ∧ ¬Q", "P ∧ Q", "¬P ∨ Q"],
      answer: 1,
      explain: "De Morgan: “not (P or Q)” means neither is true: ¬P ∧ ¬Q.",
    },
    {
      type: "mc",
      lec: [0],
      q: "What is the negation of ∀x ∃y P(x, y)?",
      options: ["∀x ∃y ¬P(x, y)", "∃x ∀y ¬P(x, y)", "∃x ∃y ¬P(x, y)", "¬∀x ¬∃y P(x, y)"],
      answer: 1,
      explain: "Flip every quantifier and negate the inside: ¬∀x ∃y P ≡ ∃x ¬∃y P ≡ ∃x ∀y ¬P.",
    },
    {
      type: "mc",
      lec: [0],
      q: "Cards show <b>8</b>, <b>3</b>, <b>red</b>, and <b>brown</b>. To test “if a card is even, its other side is red,” which must you flip?",
      options: ["8 and red", "8 and brown", "8 only", "All four"],
      answer: 1,
      explain: "8 is even, so its back must be red. Brown is not red, so by the contrapositive its back must not be even. The 3 and the red card can’t break the rule.",
    },
    {
      type: "mc",
      lec: [0],
      q: "In the proof that √2 is irrational, what is the contradiction?",
      options: ["p/q is negative", "p and q both turn out to be even, but we assumed they weren’t", "q = 0", "p² is odd"],
      answer: 1,
      explain: "We assumed p/q was in lowest terms (not both even), then showed p is even and q is even. That’s the contradiction.",
    },
    {
      type: "tf",
      lec: [0],
      q: "True or false: R ∨ (P ∧ Q) is equivalent to (R ∨ P) ∧ (R ∨ Q).",
      answer: true,
      explain: "That’s the distributive law: ∨ distributes over ∧ (and ∧ over ∨).",
    },
    {
      type: "mc",
      lec: [0],
      q: "To prove P(n) for all natural numbers n by induction, what do you show?",
      options: ["P(1) and P(n) for some large n", "P(1), and that P(i) implies P(i + 1)", "That ¬P(n) leads to a contradiction", "P(i + 1) implies P(i)"],
      answer: 1,
      explain: "The base case P(1), plus the inductive step P(i) ⇒ P(i + 1), covers every n.",
    },
  ],
});
})();
