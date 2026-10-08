(function () {
"use strict";

// The NFA the construction builds for a ∪ b (drawn for the quiz).
const NFA_A_OR_B = {
  states: { q4: [0, 110], q0: [120, 50], q1: [240, 50], q2: [120, 170], q3: [240, 170] },
  start: "q4", accept: ["q1", "q3"], alphabet: ["a", "b"],
  delta: { q4: { "ε": ["q0", "q2"] }, q0: { a: ["q1"] }, q2: { b: ["q3"] } },
};

registerConcept({
  id: "regex-to-nfa",
  oneLiner:
    "Every regular expression can be turned into an NFA: build tiny NFAs for the symbols, then glue them together with the <b>union, concatenation, and star</b> constructions, following the regex’s structure.",

  related: ["regex", "closure", "nfa"],

  summary: {
    keyPoints: [
      { lec: [3], kind: "key", html: "<b>Theorem (one direction):</b> if R is a regular expression, then L(R) is regular. The proof is a recipe for building an NFA for R." },
      { lec: [3], html: "The proof is by <b>induction on the complexity</b> of R: build NFAs for the smallest pieces first, then combine them." },
      { lec: [3], html: "<b>Base cases</b> (complexity 0): ∅ is one non-accepting state, ε is one accepting start state, and a symbol a is two states joined by an a-arrow." },
      { lec: [3], html: "<b>Inductive step:</b> R is R<sub>1</sub> ∪ R<sub>2</sub>, R<sub>1</sub>R<sub>2</sub>, or R<sub>1</sub>*. By the inductive hypothesis R<sub>1</sub> and R<sub>2</sub> have NFAs, and the closure constructions combine them." },
      { lec: [3], html: "In practice, work on the <b>syntax tree</b> from the leaves up: one small NFA per leaf, then one construction per operation." },
      { lec: [3], kind: "warn", html: "Follow the precedence when you read the regex: in (ab ∪ a)*, the star is applied last, to the whole union." },
      { lec: [3], html: "Together with subset construction, this gives regex → NFA → DFA. That’s how regex engines work, and the other direction (DFA → regex) uses GNFAs." },
    ],
    compare: {
      head: ["Piece of R", "Its NFA"],
      rows: [
        ["a (a symbol)", "Start state → a-arrow → accept state"],
        ["ε", "One state that is the start and accepts"],
        ["∅", "One state that doesn’t accept"],
        ["R<sub>1</sub> ∪ R<sub>2</sub>", "New start, ε-arrows into both NFAs"],
        ["R<sub>1</sub>R<sub>2</sub>", "ε-arrows from R<sub>1</sub>’s accept states to R<sub>2</sub>’s start"],
        ["R<sub>1</sub>*", "New accepting start, ε into R<sub>1</sub>, ε from its accept states back to its start"],
      ],
    },
  },

  details: [
    {
      id: "idea",
      title: "The idea: induction on the regex",
      lec: [3],
      html: `
        <p>Regular expressions are built up recursively: atomic pieces (∅, ε, a), then ∪, concatenation, and star. So prove “L(R) is regular” by <b>induction on the complexity</b> of R, and the proof turns into an algorithm.</p>
        <ul>
          <li><b>Base case:</b> show that the atomic regexes have NFAs.</li>
          <li><b>Inductive step:</b> assume every regex of complexity ≤ n has an NFA. A regex of complexity n + 1 is R<sub>1</sub> ∪ R<sub>2</sub>, R<sub>1</sub>R<sub>2</sub>, or R<sub>1</sub>*, where R<sub>1</sub>, R<sub>2</sub> have complexity ≤ n. They have NFAs, and regular languages are closed under ∪, concatenation, and star. So R has an NFA too.</li>
        </ul>`,
    },
    {
      id: "base",
      title: "Base cases",
      lec: [3],
      html: `
        <ul>
          <li><b>R = ∅:</b> a single start state that isn’t accepting, with no arrows. It accepts nothing.</li>
          <li><b>R = ε:</b> a single start state that <b>is</b> accepting, with no arrows. It accepts only ε.</li>
          <li><b>R = a:</b> a start state with an a-arrow to an accept state. It accepts only “a”.</li>
        </ul>`,
    },
    {
      id: "combine",
      title: "Combining NFAs",
      lec: [2, 3],
      html: `
        <p>These are the same constructions as the closure proofs:</p>
        <ul>
          <li><b>R<sub>1</sub> ∪ R<sub>2</sub>:</b> a new start state with ε-arrows to the start states of N<sub>1</sub> and N<sub>2</sub>. Keep all accept states.</li>
          <li><b>R<sub>1</sub>R<sub>2</sub>:</b> ε-arrows from each accept state of N<sub>1</sub> to N<sub>2</sub>’s start. Start in N<sub>1</sub>; only N<sub>2</sub>’s accept states accept.</li>
          <li><b>R<sub>1</sub>*:</b> a new start state that accepts, with an ε-arrow to N<sub>1</sub>’s start, plus ε-arrows from N<sub>1</sub>’s accept states back to N<sub>1</sub>’s start.</li>
        </ul>
        <p class="callout tip">Each construction adds at most one new state. So the NFA has at most about 2 states per symbol in R, plus one per ∪ or *: the NFA grows only linearly with the regex.</p>`,
    },
    {
      id: "example",
      title: "Worked example: (ab ∪ a)*",
      lec: [3],
      html: `
        <p>Read the syntax tree from the leaves up:</p>
        <ol>
          <li><b>a</b> and <b>b</b>: two-state NFAs.</li>
          <li><b>ab</b>: concatenate them with an ε-arrow from a’s accept state to b’s start.</li>
          <li><b>a</b> (the second one): another two-state NFA.</li>
          <li><b>ab ∪ a</b>: a new start state with ε-arrows to the NFAs for ab and for a.</li>
          <li><b>(ab ∪ a)*</b>: a new accepting start state, an ε-arrow into the union NFA, and ε-arrows from its accept states back to the union’s start.</li>
        </ol>
        <p class="callout try">Step through this one in the Playground. Then try (ε ∪ a)ba*, the other example from the slides.</p>`,
    },
    {
      id: "pipeline",
      title: "The big picture",
      lec: [3],
      html: `
        <p>Now you can go around the whole loop:</p>
        <ul>
          <li><b>Regex → NFA:</b> this construction.</li>
          <li><b>NFA → DFA:</b> the subset construction.</li>
          <li><b>DFA → regex:</b> the GNFA state-removal method.</li>
        </ul>
        <p>So regular expressions, NFAs, and DFAs all describe exactly the regular languages. Real regex engines (like grep) do regex → NFA → DFA, then run the DFA over the text.</p>`,
    },
  ],

  playground: [
    {
      id: "build",
      title: "Build the NFA step by step",
      lec: [3],
      intro: `<p>Type a regular expression (or pick one). Each step builds the NFA for one node of the syntax tree, starting from the leaves, and the <b>Recipe</b> shows which construction it uses. When it’s done, test strings on the finished NFA.</p>`,
      widget: "regex-nfa-stepper",
      config: {
        examples: ["(ab ∪ a)*", "(ε ∪ a)ba*", "a ∪ b", "ab", "a*", "0(0 ∪ 1)*1", "01*1 ∪ 0"],
        strings: { ab: ["aba", "abab", "b", ""], "01": ["0101", "011", "10", ""] },
      },
    },
  ],

  flashcards: [
    { front: "What does Regex → NFA prove?", back: "If R is a regular expression, then L(R) is regular (one direction of “regular ⇔ described by a regex”)." },
    { front: "How is Regex → NFA proved?", back: "By induction on the complexity of R: NFAs for the atomic regexes, then the closure constructions for ∪, concatenation, and star." },
    { front: "NFA for ∅", back: "One start state that doesn’t accept, with no arrows." },
    { front: "NFA for ε", back: "One start state that accepts, with no arrows." },
    { front: "NFA for a symbol a", back: "A start state with an a-arrow to an accept state." },
    { front: "In what order do you build the NFAs?", back: "Bottom-up on the syntax tree: leaves first, then each operation once its parts are built." },
    { front: "How big is the NFA you get?", back: "Linear in the size of R: about 2 states per symbol, plus 1 per ∪ or *." },
    { front: "The full loop of conversions", back: "Regex → NFA (this construction) → DFA (subset construction) → regex (GNFA state removal)." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [3],
      q: "In the regex → NFA construction, what NFA does the base case give for the regular expression <b>ε</b>?",
      options: ["One state that is the start and accepts", "One state that doesn’t accept", "Two states joined by an ε-arrow, the second accepting", "No states at all"],
      answer: 0,
      explain: "ε is the language {ε}: the NFA must accept without reading anything, so its start state accepts. (One non-accepting state is the NFA for ∅.)",
    },
    {
      type: "mc",
      lec: [3],
      q: "This NFA was built from a regex with the lecture constructions. Which regex?",
      machine: NFA_A_OR_B,
      options: ["ab", "a ∪ b", "(ab)*", "a*b"],
      answer: 1,
      explain: "A new start state with ε-arrows into two separate one-symbol NFAs is the <b>union</b> construction, here for a and b.",
    },
    {
      type: "mc",
      lec: [3],
      q: "When converting (ab ∪ a)*, which construction is applied <b>last</b>?",
      options: ["Concatenation of a and b", "Union", "Star", "The base case for a"],
      answer: 2,
      explain: "The star is the root of the syntax tree: it applies to the whole union, so it’s built last, after ab, a, and ab ∪ a.",
    },
    {
      type: "tf",
      lec: [3],
      q: "True or false: the proof that every regex describes a regular language is by induction on the complexity of the regex.",
      answer: true,
      explain: "The base cases are the atomic regexes, and the inductive step uses closure of the regular languages under ∪, concatenation, and star.",
    },
    {
      type: "mc",
      lec: [3],
      q: "In the concatenation step R<sub>1</sub>R<sub>2</sub>, where do the new ε-arrows go?",
      options: ["From R<sub>2</sub>’s accept states to R<sub>1</sub>’s start", "From R<sub>1</sub>’s accept states to R<sub>2</sub>’s start", "From a new start state to both start states", "From every state to R<sub>2</sub>’s start"],
      answer: 1,
      explain: "After reading a string from R<sub>1</sub> (ending in one of its accept states), the NFA can jump into R<sub>2</sub>.",
    },
    {
      type: "tf",
      lec: [3],
      q: "True or false: the NFA built from a regex can have exponentially many states compared to the length of the regex.",
      answer: false,
      explain: "Each piece adds only a constant number of states, so the NFA’s size is linear in the regex. (It’s the NFA → DFA step that can blow up exponentially.)",
    },
  ],
});
})();
