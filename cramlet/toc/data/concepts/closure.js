(function () {
"use strict";

const count = (w, c) => w.split(c).length - 1;
// Small DFAs to combine. Positions don't matter here: the widget lays them out.
const at = {};
const CONTAINS_0 = { states: { q0: at, q1: at }, start: "q0", accept: ["q1"], alphabet: ["0", "1"],
  delta: { q0: { 0: "q1", 1: "q0" }, q1: { 0: "q1", 1: "q1" } } };
const EXACTLY_TWO_1S = { states: { q0: at, q1: at, q2: at, q3: at }, start: "q0", accept: ["q2"], alphabet: ["0", "1"],
  delta: { q0: { 0: "q0", 1: "q1" }, q1: { 0: "q1", 1: "q2" }, q2: { 0: "q2", 1: "q3" }, q3: { 0: "q3", 1: "q3" } } };
const ENDS_1 = { states: { q0: at, q1: at }, start: "q0", accept: ["q1"], alphabet: ["0", "1"],
  delta: { q0: { 0: "q0", 1: "q1" }, q1: { 0: "q0", 1: "q1" } } };
const EVEN_LENGTH = { states: { q0: at, q1: at }, start: "q0", accept: ["q0"], alphabet: ["0", "1"],
  delta: { q0: { 0: "q1", 1: "q1" }, q1: { 0: "q0", 1: "q0" } } };
const BLOCK_00_11 = { states: { q0: at, q1: at, q2: at, q3: at, q4: at }, start: "q0", accept: ["q3"], alphabet: ["0", "1"],
  delta: { q0: { 0: "q1", 1: "q2" }, q1: { 0: "q3", 1: "q4" }, q2: { 0: "q4", 1: "q3" }, q3: { 0: "q4", 1: "q4" }, q4: { 0: "q4", 1: "q4" } } };

// Little machines drawn for the quiz.
const QUIZ_UNION = {
  states: { s: [0, 130], a0: [140, 50], a1: [280, 50], b0: [140, 210, { loop: 90 }], b1: [280, 210, { loop: 90 }] },
  start: "s", accept: ["a1", "b0"], alphabet: ["0", "1"],
  delta: { s: { "ε": ["a0", "b0"] }, a0: { 0: ["a0"], 1: ["a1"] }, a1: { 0: ["a0"], 1: ["a1"] }, b0: { 0: ["b1"], 1: ["b1"] }, b1: { 0: ["b0"], 1: ["b0"] } },
};

registerConcept({
  id: "closure",
  oneLiner:
    "Combine regular languages with <b>union, concatenation, star, complement, or intersection</b>, and the result is <b>still regular</b>. Each proof is a recipe for building the new machine.",

  related: ["nfa", "dfa", "regex"],

  summary: {
    keyPoints: [
      { lec: [1], html: "A set of languages is <b>closed</b> under an operation if applying it to languages in the set always gives a language in the set." },
      { lec: [1, 2], kind: "key", html: "The regular languages are closed under <b>union</b> (A ∪ B), <b>concatenation</b> (A ∘ B), <b>star</b> (A*), <b>complement</b> (A̅), and <b>intersection</b> (A ∩ B)." },
      { lec: [1], html: "<b>Complement:</b> take a <b>DFA</b> for A and swap accept and non-accept states." },
      { lec: [2], html: "<b>Union:</b> a new start state with ε-arrows to the start states of machines for A and B. The NFA guesses which one to run." },
      { lec: [2], html: "<b>Concatenation:</b> ε-arrows from A’s accept states to B’s start. Start in A, accept only in B. The NFA guesses where A’s part ends." },
      { lec: [2], html: "<b>Star:</b> a new <b>accepting</b> start state with an ε-arrow to A’s start, plus ε-arrows from A’s accept states back to A’s start." },
      { lec: [2], html: "<b>Intersection:</b> by De Morgan, A ∩ B = complement of (A̅ ∪ B̅). Or directly, with the <b>product construction</b>: run both DFAs at once on pairs of states." },
      { lec: [1], kind: "warn", html: "Swapping accept states only complements a <b>DFA</b>. On an NFA it can go wrong, because “some run accepts” and “some run rejects” can both be true." },
    ],
    compare: {
      head: ["Operation", "Means", "Construction"],
      rows: [
        ["A ∪ B", "w ∈ A or w ∈ B", "New start + ε to both (or product, accept if either)"],
        ["A ∘ B", "w = xy with x ∈ A, y ∈ B", "ε from A’s accept states to B’s start"],
        ["A*", "w = w<sub>1</sub>…w<sub>k</sub>, k ≥ 0, each w<sub>i</sub> ∈ A", "New accepting start + ε back to A’s start"],
        ["A̅", "w ∉ A", "Swap accept states of a DFA"],
        ["A ∩ B", "w ∈ A and w ∈ B", "Product, accept if both (or De Morgan)"],
      ],
    },
  },

  details: [
    {
      id: "closed",
      title: "What “closed under” means",
      lec: [1],
      html: `
        <p>The integers are closed under addition: add two integers and you get an integer. They aren’t closed under division (1 ÷ 2 isn’t an integer).</p>
        <p>The same idea for languages: if A and B are regular, are A ∪ B, A ∘ B, A*, A̅, and A ∩ B regular too? For all five, <b>yes</b>. Each proof shows how to build a machine for the new language out of machines for A and B.</p>
        <p class="callout tip">This is a powerful tool: to show a complicated language is regular, write it as simple regular languages combined with these operations.</p>`,
    },
    {
      id: "complement",
      title: "Complement: swap the accept states",
      lec: [1],
      html: `
        <p>Let M = (Q, Σ, δ, q<sub>start</sub>, F) be a DFA for A. Build M′ = (Q, Σ, δ, q<sub>start</sub>, <b>Q \\ F</b>): same everything, but the accept states are exactly the states that weren’t accepting before.</p>
        <p>Why it works: M′ makes the same moves as M, so it ends in the same state δ̂(q<sub>start</sub>, w). That state is in Q \\ F exactly when it isn’t in F. So M′ accepts w ⇔ M rejects w.</p>
        <p class="callout warn">This needs a <b>DFA</b>. In an NFA, one run might end in an accept state while another doesn’t, so after the swap both the original and the “complement” could accept the same string. Convert to a DFA first.</p>`,
    },
    {
      id: "union",
      title: "Union: guess which machine to run",
      lec: [2],
      html: `
        <p>Take NFAs (or DFAs) for A and B. Add a <b>new start state</b> with <b>ε-arrows</b> to both old start states. Keep all the old accept states.</p>
        <p>On input w, the new NFA can follow either ε-arrow, then run that machine. Some run accepts ⇔ A accepts w or B accepts w.</p>`,
    },
    {
      id: "product",
      title: "Union and intersection with the product construction",
      lec: [1],
      html: `
        <p>You can also combine two <b>DFAs</b> without any ε-arrows by running them <b>at the same time</b>:</p>
        <ul>
          <li><b>States:</b> pairs (p, q), with p a state of A’s DFA and q a state of B’s DFA. That’s |Q<sub>A</sub>| × |Q<sub>B</sub>| states.</li>
          <li><b>Start:</b> (start of A, start of B).</li>
          <li><b>Transitions:</b> δ((p, q), x) = (δ<sub>A</sub>(p, x), δ<sub>B</sub>(q, x)). Both machines take a step.</li>
          <li><b>Accept:</b> for A ∪ B, pairs where <b>p or q</b> accepts. For A ∩ B, pairs where <b>p and q</b> both accept.</li>
        </ul>
        <p>The result is a DFA, which also means you can complement it right away.</p>`,
    },
    {
      id: "concatenation",
      title: "Concatenation: guess where to split",
      lec: [1, 2],
      html: `
        <p>Is w = 0101011 in A ∘ B, for A = {w | w contains a 0} and B = {w | w contains exactly two 1s}? Yes: split it as <b>0101 · 011</b>. 0101 contains a 0, and 011 has exactly two 1s. But finding that split means trying different places to cut (0 · 101011 doesn’t work: four 1s). A DFA reads once and can’t go back to try another cut, which is why concatenation is hard to build directly.</p>
        <p>An NFA can guess. Take machines for A and B and:</p>
        <ul>
          <li>Add <b>ε-arrows from every accept state of A</b> to B’s start state.</li>
          <li>The start state is A’s start state.</li>
          <li>The accept states are <b>B’s</b> accept states only.</li>
        </ul>
        <p>Every time the input read so far is in A, the NFA can guess “A’s part ends here” and jump into B. Some run accepts ⇔ w can be split as xy with x ∈ A and y ∈ B.</p>`,
    },
    {
      id: "star",
      title: "Star: any number of pieces",
      lec: [2],
      html: `
        <p>A* = { w<sub>1</sub>w<sub>2</sub>…w<sub>k</sub> | k ≥ 0 and each w<sub>i</sub> ∈ A }. For A = {00, 11}, 0011000011 = 00·11·00·00·11 is in A*, but 001 isn’t. ε is always in A* (k = 0).</p>
        <p>From a machine for A:</p>
        <ul>
          <li>Add a <b>new start state</b> that is also an <b>accept state</b>, with an ε-arrow to A’s old start state. (This accepts ε.)</li>
          <li>Add <b>ε-arrows from every accept state of A</b> back to A’s old start state, to begin the next piece.</li>
        </ul>
        <p class="callout warn">Why a <b>new</b> start state? Just making A’s old start state accepting can accept extra strings, when the old start state has arrows coming back into it.</p>`,
    },
    {
      id: "intersection",
      title: "Intersection with De Morgan",
      lec: [2],
      html: `
        <p>Once you have complement and union, intersection comes for free:</p>
        <p class="callout key"><b>A ∩ B = complement of ( A̅ ∪ B̅ )</b></p>
        <p>A̅ and B̅ are regular (complement), so their union is regular, so its complement is regular. Or use the product construction directly.</p>`,
    },
  ],

  playground: [
    {
      id: "build",
      title: "Build it step by step",
      lec: [1, 2],
      intro: `<p>Pick an operation and the machines to combine, then build the new machine <b>one small step at a time</b>. The <b>Recipe</b> below checks off each rule as it’s used. When it’s done, test strings to see that the new machine accepts exactly the right ones. For concatenation and star, the tester also shows how a string splits into pieces.</p>`,
      widget: "closure-builder",
      config: {
        machines: [
          { id: "contains-0", name: "contains a 0", m: CONTAINS_0, test: w => w.includes("0") },
          { id: "exactly-two-1s", name: "exactly two 1s", m: EXACTLY_TWO_1S, test: w => count(w, "1") === 2 },
          { id: "ends-1", name: "ends in 1", m: ENDS_1, test: w => w.endsWith("1") },
          { id: "even-length", name: "even length", m: EVEN_LENGTH, test: w => w.length % 2 === 0 },
          { id: "block", name: "exactly 00 or 11", m: BLOCK_00_11, test: w => w === "00" || w === "11" },
        ],
        defaults: { complement: [2, 0], "union-eps": [2, 3], "union-product": [2, 3], intersection: [0, 2], concat: [0, 1], star: [4, 0] },
        examples: {
          complement: ["0110", "1", ""],
          "union-eps": ["0110", "101", "10"],
          "union-product": ["0110", "101", "10"],
          intersection: ["011", "1", "00"],
          concat: ["0101011", "0011", "110"],
          star: ["0011000011", "001", ""],
        },
      },
    },
  ],

  flashcards: [
    { front: "Closed under an operation", back: "Applying the operation to languages in the set always gives a language in the set." },
    { front: "Which operations are the regular languages closed under?", back: "Union, concatenation, star, complement, and intersection (and more)." },
    { front: "Complement construction", back: "Take a <b>DFA</b> for A and swap accept and non-accept states: F′ = Q \\ F." },
    { front: "Union construction (NFA)", back: "New start state with ε-arrows to the start states of machines for A and B. Keep all accept states." },
    { front: "Concatenation construction", back: "ε-arrows from each accept state of A to B’s start. Start = A’s start; accept states = B’s accept states only." },
    { front: "Star construction", back: "New start state that <b>is accepting</b>, with ε to A’s start. Add ε-arrows from A’s accept states back to A’s start." },
    { front: "Product construction", back: "States are pairs (p, q); δ((p, q), x) = (δ<sub>A</sub>(p, x), δ<sub>B</sub>(q, x)). Accept if either (union) or both (intersection) accept." },
    { front: "Intersection via De Morgan", back: "A ∩ B = complement of (A̅ ∪ B̅)." },
    { front: "Why can’t you complement an NFA by swapping accept states?", back: "One run may accept while another rejects the same string, so the swapped NFA can accept strings the original also accepts." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [2],
      q: "This NFA was built with the union construction. Which language does it recognize?",
      machine: QUIZ_UNION,
      options: ["Strings that end in 1 <b>and</b> have even length", "Strings that end in 1 <b>or</b> have even length", "Strings that end in 1, followed by a string of even length", "Strings of even length that don’t end in 1"],
      answer: 1,
      explain: "The top branch (a<sub>0</sub>, a<sub>1</sub>) accepts strings ending in 1; the bottom branch (b<sub>0</sub>, b<sub>1</sub>) accepts even-length strings. The ε-arrows let the NFA run either one, so it accepts the <b>union</b>.",
    },
    {
      type: "mc",
      lec: [1],
      q: "How do you build a DFA for A̅ from a DFA for A?",
      options: ["Reverse every arrow", "Swap accept and non-accept states", "Add a new start state with ε-arrows", "Make every state accepting"],
      answer: 1,
      explain: "Same states and arrows, with F′ = Q \\ F. The DFA ends in the same state as before, and that state now accepts exactly when it didn’t before.",
    },
    {
      type: "tf",
      lec: [1],
      q: "True or false: swapping accept and non-accept states of any NFA gives an NFA for the complement.",
      answer: false,
      explain: "An NFA accepts if <b>some</b> run accepts. After the swap, a string with one accepting and one rejecting run is still accepted, so it’s in both languages. Convert to a DFA first.",
    },
    {
      type: "mc",
      lec: [2],
      q: "In the concatenation construction for A ∘ B, which states are accept states?",
      options: ["A’s accept states and B’s accept states", "Only A’s accept states", "Only B’s accept states", "A new accept state"],
      answer: 2,
      explain: "The whole string must be xy with y ∈ B, so a run must finish inside B. A’s accept states only get ε-arrows into B; they stop accepting.",
    },
    {
      type: "mc",
      lec: [2],
      q: "In the star construction, why is the new start state an accept state?",
      options: ["So the NFA accepts ε, which is always in A*", "So every string is accepted", "Because A’s start state was accepting", "It isn’t; only A’s accept states are"],
      answer: 0,
      explain: "A* includes zero pieces, the empty string ε. The new start state accepts ε without accidentally accepting anything else.",
    },
    {
      type: "mc",
      lec: [1],
      q: "A DFA for A has 3 states and a DFA for B has 4. How many states does the product construction have?",
      options: ["7", "12", "16", "2<sup>7</sup>"],
      answer: 1,
      explain: "One state per pair: 3 × 4 = 12.",
    },
    {
      type: "mc",
      lec: [2],
      q: "Which identity proves that regular languages are closed under intersection, using complement and union?",
      options: ["A ∩ B = A̅ ∪ B̅", "A ∩ B = complement of (A̅ ∪ B̅)", "A ∩ B = complement of (A ∪ B)", "A ∩ B = A ∘ B"],
      answer: 1,
      explain: "De Morgan’s law: something is in both A and B exactly when it is not in (not A or not B).",
    },
    {
      type: "tf",
      lec: [2],
      q: "True or false: with A = {00, 11}, the string 001 is in A*.",
      answer: false,
      explain: "A* strings are made of 00 and 11 blocks. 001 would need a piece “1”, which isn’t in A.",
    },
  ],
});
})();
