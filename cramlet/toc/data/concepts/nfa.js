(function () {
"use strict";

// Example NFAs (from the lecture slides). δ values are lists of states; "ε" is an ε-arrow.
const NFA_ENDS_00_OR_11 = {
  states: { q0: [60, 150], q1: [200, 70], q2: [340, 70], q3: [480, 70], q4: [200, 230, { loop: 90 }], q5: [340, 230], q6: [480, 230] },
  start: "q0", accept: ["q3", "q6"], alphabet: ["0", "1"],
  delta: { q0: { "ε": ["q1", "q4"] }, q1: { 0: ["q1", "q2"], 1: ["q1"] }, q2: { 0: ["q3"] }, q4: { 0: ["q4"], 1: ["q4", "q5"] }, q5: { 1: ["q6"] } },
};
const NFA_ENDS_00 = {
  states: { q0: [60, 110], q1: [200, 110], q2: [340, 110], q3: [480, 110] },
  start: "q0", accept: ["q3"], alphabet: ["0", "1"],
  delta: { q0: { "ε": ["q1"] }, q1: { 0: ["q1", "q2"], 1: ["q1"] }, q2: { 0: ["q3"] } },
};
const NFA_SECOND_LAST_1 = {
  states: { q0: [80, 110], q1: [260, 110], q2: [440, 110] },
  start: "q0", accept: ["q2"], alphabet: ["0", "1"],
  delta: { q0: { 0: ["q0"], 1: ["q0", "q1"] }, q1: { 0: ["q2"], 1: ["q2"] } },
};
// A* for A = {00, 11}, built with the star construction (new accepting start state + ε-arrows back).
const NFA_STAR = {
  states: { q0: [60, 140], q1: [200, 140], q2: [340, 60], q3: [340, 220], q4: [480, 140] },
  start: "q0", accept: ["q0", "q4"], alphabet: ["0", "1"],
  delta: { q0: { "ε": ["q1"] }, q1: { 0: ["q2"], 1: ["q3"] }, q2: { 0: ["q4"] }, q3: { 1: ["q4"] }, q4: { "ε": ["q1"] } },
};

registerConcept({
  id: "nfa",
  oneLiner:
    "An <b>NFA</b> may have several choices at each step (or none), plus <b>ε-arrows</b> it can take for free. It accepts if <b>at least one</b> run ends in an accept state.",

  related: ["dfa", "nfa-to-dfa", "closure"],

  summary: {
    keyPoints: [
      { lec: [2], html: "An NFA relaxes the DFA rules: a state can have <b>any number</b> of arrows for a symbol (zero, one, or many), and arrows can be labeled <b>ε</b>, which you follow <b>without reading</b> any input." },
      { lec: [2], html: "So there can be many possible runs. The NFA <b>accepts w</b> if <b>some</b> run reads all of w and ends in an accept state. Runs that get stuck just die." },
      { lec: [2], html: "Formally, <b>M = (Q, Σ, δ, q<sub>start</sub>, F)</b> with <b>δ : Q × (Σ ∪ {ε}) → Powerset(Q)</b>: each (state, symbol) gives a <b>set</b> of possible next states." },
      { lec: [2], html: "To run an NFA efficiently, track the <b>set of every state it could be in</b>. The <b>ε-closure E(q)</b> is everything reachable from q using only ε-arrows." },
      { lec: [2], html: "<b>δ̂(q, ε) = E(q)</b>, and <b>δ̂(q, w<sub>1</sub>…w<sub>n</sub>) = E(⋃ δ(p, w<sub>n</sub>))</b> over all p ∈ δ̂(q, w<sub>1</sub>…w<sub>n−1</sub>). M accepts w if δ̂(q<sub>start</sub>, w) contains an accept state." },
      { lec: [2], kind: "key", html: "NFAs are <b>not more powerful</b> than DFAs. Every NFA can be converted to a DFA for the same language, so NFAs recognize exactly the <b>regular languages</b>." },
      { lec: [2], html: "NFAs are often <b>much easier to build</b>, because they can “guess.” To actually run on a computer, you convert to a DFA." },
    ],
    compare: {
      head: ["", "DFA", "NFA"],
      rows: [
        ["Arrows per (state, symbol)", "Exactly one", "Any number, including zero"],
        ["ε-arrows?", "<i data-icon=\"no\"></i> No", "<i data-icon=\"yes\"></i> Yes"],
        ["Transition function", "δ : Q × Σ → Q", "δ : Q × (Σ ∪ {ε}) → Powerset(Q)"],
        ["Runs on an input", "Exactly one", "Possibly many (or none that finish)"],
        ["Accepts w when", "The run ends in F", "<b>Some</b> run ends in F"],
        ["Languages it can recognize", "Regular", "Regular (the same ones!)"],
      ],
    },
  },

  details: [
    {
      id: "relaxing",
      title: "What changes from a DFA",
      lec: [2],
      html: `
        <p>A DFA has exactly one arrow for every (state, symbol) pair. An NFA drops that rule:</p>
        <ul>
          <li>A state can have <b>several</b> arrows with the same symbol. The NFA can go either way.</li>
          <li>A state can have <b>no</b> arrow for a symbol. A run that needs that arrow just <b>dies</b>.</li>
          <li>Arrows can be labeled <b>ε</b>. The NFA can follow them at any time <b>without reading</b> a symbol.</li>
        </ul>
        <p>Every DFA is also an NFA (one that happens to never use these freedoms), but not the other way around.</p>`,
    },
    {
      id: "accepting",
      title: "When an NFA accepts",
      lec: [2],
      html: `
        <p>Because of the choices, one input can have many <b>runs</b> (also called executions or computation paths). The rule is generous:</p>
        <p class="callout key">An NFA <b>accepts</b> w if <b>at least one</b> run reads all of w and ends in an accept state. It rejects only if <b>every</b> run fails.</p>
        <h4>Example: the “ends in 00 or 11” NFA from lecture</h4>
        <p>The start state q<sub>0</sub> has ε-arrows to two branches: q<sub>1</sub>→q<sub>2</sub>→q<sub>3</sub> checks for a final 00, and q<sub>4</sub>→q<sub>5</sub>→q<sub>6</sub> checks for a final 11.</p>
        <ul>
          <li>On <b>01100</b>, one run takes the bottom branch and loops in q<sub>4</sub> forever (doesn’t accept). Another run takes the top branch, loops in q<sub>1</sub> for 011, then reads 00 through q<sub>2</sub> to q<sub>3</sub>. That run accepts, so the NFA <b>accepts</b>.</li>
          <li>On <b>0110</b>, no run works: a run that reaches q<sub>6</sub> early gets stuck because q<sub>6</sub> has no arrow for the last 0, and no run can end in q<sub>3</sub>. The NFA <b>rejects</b>.</li>
        </ul>
        <p class="callout try">In the Playground, the “every possible run” grid shows all of these runs at once.</p>`,
    },
    {
      id: "formal",
      title: "The formal definition",
      lec: [2],
      html: `
        <p>An <b>NFA</b> is a 5-tuple <b>M = (Q, Σ, δ, q<sub>start</sub>, F)</b>, the same as a DFA except for δ:</p>
        <ul>
          <li><b>δ : Q × (Σ ∪ {ε}) → Powerset(Q)</b>. The input is a state and a symbol <b>or ε</b>; the output is the <b>set</b> of possible next states (possibly ∅).</li>
        </ul>
        <h4>Example: an NFA for strings ending in 00</h4>
        <p>Q = {q<sub>0</sub>, q<sub>1</sub>, q<sub>2</sub>, q<sub>3</sub>}, Σ = {0, 1}, q<sub>start</sub> = q<sub>0</sub>, F = {q<sub>3</sub>}, and</p>
        <div class="table-wrap"><table class="compare">
          <thead><tr><th>δ</th><th>ε</th><th>0</th><th>1</th></tr></thead>
          <tbody>
            <tr><th>q<sub>0</sub></th><td>{q<sub>1</sub>}</td><td>∅</td><td>∅</td></tr>
            <tr><th>q<sub>1</sub></th><td>∅</td><td>{q<sub>1</sub>, q<sub>2</sub>}</td><td>{q<sub>1</sub>}</td></tr>
            <tr><th>q<sub>2</sub></th><td>∅</td><td>{q<sub>3</sub>}</td><td>∅</td></tr>
            <tr><th>q<sub>3</sub></th><td>∅</td><td>∅</td><td>∅</td></tr>
          </tbody>
        </table></div>`,
    },
    {
      id: "simulating",
      title: "Running an NFA: sets of states and ε-closure",
      lec: [2],
      html: `
        <p>Trying every run one at a time could take exponentially long. Instead, keep the <b>set of all states</b> the NFA could be in, and update the whole set for each symbol.</p>
        <p>The <b>ε-closure</b> of a state, <b>E(q)</b>, is every state reachable from q using only ε-arrows (including q itself). For a set P, E(P) is the union of E(p) for every p in P.</p>
        <p>Then the extended transition function for NFAs works on sets:</p>
        <ul>
          <li><b>δ̂(q, ε) = E(q)</b>: before reading anything, you can already be anywhere ε-arrows take you.</li>
          <li><b>δ̂(q, w<sub>1</sub>…w<sub>n</sub>) = E( ⋃<sub>p ∈ δ̂(q, w<sub>1</sub>…w<sub>n−1</sub>)</sub> δ(p, w<sub>n</sub>) )</b>: from every state you could be in, follow the w<sub>n</sub>-arrows, then take the ε-closure.</li>
        </ul>
        <p>M <b>accepts</b> w if <b>δ̂(q<sub>start</sub>, w) ∩ F ≠ ∅</b>.</p>
        <h4>Example: w = 100 on the “ends in 00 or 11” NFA</h4>
        <ul>
          <li>δ̂(q<sub>0</sub>, ε) = E(q<sub>0</sub>) = {q<sub>0</sub>, q<sub>1</sub>, q<sub>4</sub>}</li>
          <li>δ̂(q<sub>0</sub>, 1) = {q<sub>1</sub>, q<sub>4</sub>, q<sub>5</sub>}</li>
          <li>δ̂(q<sub>0</sub>, 10) = {q<sub>1</sub>, q<sub>2</sub>, q<sub>4</sub>}</li>
          <li>δ̂(q<sub>0</sub>, 100) = {q<sub>1</sub>, q<sub>2</sub>, q<sub>3</sub>, q<sub>4</sub>}, which contains the accept state q<sub>3</sub>, so the NFA accepts 100.</li>
        </ul>
        <p class="callout warn">Take the ε-closure <b>after every step</b>, and also <b>at the very start</b>. Forgetting the starting closure is the most common mistake.</p>`,
    },
    {
      id: "why",
      title: "Why bother with NFAs?",
      lec: [2],
      html: `
        <p>NFAs can <b>guess</b>. That makes many machines much smaller and easier to design, and it makes proofs about regular languages short:</p>
        <ul>
          <li><b>Union:</b> add a new start state with ε-arrows into machines for A and B. The NFA guesses which one to run.</li>
          <li><b>Concatenation:</b> a DFA for A ∘ B would need to know where A’s part ends. An NFA just guesses, with ε-arrows from A’s accept states into B.</li>
          <li><b>Star:</b> ε-arrows from accept states back to the start let the NFA guess where each piece ends.</li>
        </ul>
        <p>The catch: a real computer can’t guess. That’s why the next concept, converting an NFA to a DFA, matters.</p>`,
    },
  ],

  playground: [
    {
      id: "runner",
      title: "Run an NFA",
      lec: [2],
      intro: `<p>Step through an input and watch the <b>set</b> of states the NFA could be in. Turn on <b>Predict mode</b> to click the states you expect before each step. Get a whole string of 3 or more symbols right to earn crumbs.</p>`,
      widget: "nfa-runner",
      config: {
        machines: [
          { id: "ends-00-11", name: "Machine A", lang: "L(M) = { w | w ends in 00 or 11 }", machine: NFA_ENDS_00_OR_11, examples: ["01100", "0110", "100", "11"] },
          { id: "ends-00", name: "Machine B", lang: "L(M) = { w | w ends in 00 }", machine: NFA_ENDS_00, examples: ["0100", "010", "00"] },
          { id: "second-last-1", name: "Machine C", lang: "L(M) = { w | the second-to-last symbol of w is 1 }", machine: NFA_SECOND_LAST_1, examples: ["0110", "0101", "10"] },
          { id: "star", name: "Machine D", lang: "L(M) = {00, 11}*: strings made of 00 and 11 blocks (including ε)", machine: NFA_STAR, examples: ["0011000011", "001", "", "1100"] },
        ],
      },
    },
  ],

  flashcards: [
    { front: "NFA", back: "A <b>nondeterministic finite automaton</b>: like a DFA, but a state can have any number of arrows per symbol (including none), and ε-arrows. It accepts if <b>some</b> run ends in an accept state." },
    { front: "The type of δ for an NFA", back: "<b>δ : Q × (Σ ∪ {ε}) → Powerset(Q)</b>. Each (state, symbol or ε) gives a <b>set</b> of possible next states." },
    { front: "ε-arrow", back: "A transition the NFA can take <b>without reading</b> any input symbol." },
    { front: "When does an NFA accept w?", back: "When <b>at least one</b> run reads all of w and ends in an accept state. Equivalently, when δ̂(q<sub>start</sub>, w) contains an accept state." },
    { front: "What happens to a run with no arrow to follow?", back: "It <b>dies</b>. That run doesn’t accept, but other runs can still accept." },
    { front: "ε-closure E(q)", back: "Every state reachable from q using only ε-arrows, <b>including q itself</b>." },
    { front: "δ̂(q, ε) for an NFA", back: "<b>E(q)</b>, the ε-closure of q (not just {q})." },
    { front: "How to simulate an NFA efficiently", back: "Keep the <b>set</b> of states it could be in. For each symbol: follow that symbol’s arrows from every state in the set, then take the ε-closure." },
    { front: "Are NFAs more powerful than DFAs?", back: "<b>No.</b> Every NFA has an equivalent DFA (subset construction). Both recognize exactly the regular languages." },
    { front: "Is every DFA an NFA?", back: "<b>Yes.</b> A DFA is an NFA that happens to have exactly one arrow per symbol and no ε-arrows." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [2],
      q: "What is L(M) for this NFA?",
      machine: NFA_SECOND_LAST_1,
      options: ["Strings that end in 1", "Strings whose second-to-last symbol is 1", "Strings that contain 1", "Strings that end in 10"],
      answer: 1,
      explain: "q<sub>0</sub> loops on everything, and on some 1 the NFA guesses “this is the second-to-last symbol” and moves to q<sub>1</sub>. Then exactly one more symbol takes it to q<sub>2</sub>, which has no arrows out.",
    },
    {
      type: "mc",
      lec: [2],
      q: "For this NFA, what is δ̂(q<sub>0</sub>, ε)?",
      machine: NFA_ENDS_00_OR_11,
      options: ["{q<sub>0</sub>}", "{q<sub>1</sub>, q<sub>4</sub>}", "{q<sub>0</sub>, q<sub>1</sub>, q<sub>4</sub>}", "∅"],
      answer: 2,
      explain: "δ̂(q, ε) is the ε-closure E(q): q itself plus everything reachable by ε-arrows. q<sub>0</sub> has ε-arrows to q<sub>1</sub> and q<sub>4</sub>, so it’s {q<sub>0</sub>, q<sub>1</sub>, q<sub>4</sub>}.",
    },
    {
      type: "mc",
      lec: [2],
      q: "For this NFA, you are in the set of states {q<sub>0</sub>, q<sub>1</sub>, q<sub>4</sub>}. Which set are you in after reading <b>1</b> (including any ε-arrows)?",
      machine: NFA_ENDS_00_OR_11,
      options: ["{q<sub>1</sub>, q<sub>4</sub>}", "{q<sub>1</sub>, q<sub>4</sub>, q<sub>5</sub>}", "{q<sub>4</sub>, q<sub>5</sub>}", "{q<sub>0</sub>, q<sub>1</sub>, q<sub>4</sub>, q<sub>5</sub>}"],
      answer: 1,
      explain: "q<sub>0</sub> has no 1-arrow. q<sub>1</sub> loops to q<sub>1</sub>. q<sub>4</sub> goes to q<sub>4</sub> or q<sub>5</sub>. None of those have ε-arrows, so the set is {q<sub>1</sub>, q<sub>4</sub>, q<sub>5</sub>}. (q<sub>0</sub> drops out: you can’t get back to it.)",
    },
    {
      type: "tf",
      lec: [2],
      q: "True or false: an NFA rejects w if some run on w ends in a non-accepting state.",
      answer: false,
      explain: "One failing run doesn’t matter. The NFA accepts if <b>any</b> run accepts, and rejects only if <b>every</b> run fails.",
    },
    {
      type: "mc",
      lec: [2],
      q: "What is the type of δ for an NFA?",
      options: ["δ : Q × Σ → Q", "δ : Q × (Σ ∪ {ε}) → Q", "δ : Q × (Σ ∪ {ε}) → Powerset(Q)", "δ : Powerset(Q) × Σ → Q"],
      answer: 2,
      explain: "The input can be a symbol <b>or ε</b>, and the output is a <b>set</b> of states, an element of Powerset(Q).",
    },
    {
      type: "tf",
      lec: [2],
      q: "True or false: some languages can be recognized by an NFA but not by any DFA.",
      answer: false,
      explain: "Every NFA can be converted into a DFA for the same language (the subset construction). NFAs and DFAs recognize exactly the same languages: the regular ones.",
    },
    {
      type: "mc",
      lec: [2],
      q: "Which string does this NFA accept?",
      machine: NFA_STAR,
      options: ["001", "0011", "0101", "1"],
      answer: 1,
      explain: "This NFA accepts strings built from 00 and 11 blocks. 0011 = 00·11 works. 001 leaves a lone 1, 0101 doesn’t split into 00/11 blocks, and 1 is half a block.",
    },
    {
      type: "mc",
      lec: [2],
      q: "Why are NFAs useful if they aren’t more powerful than DFAs?",
      options: ["They run faster on real computers", "They are often much smaller and easier to design, and they make closure proofs simple", "They can count without a bound", "They don’t need accept states"],
      answer: 1,
      explain: "NFAs can “guess” (like where one part of a string ends), so constructions such as union, concatenation, and star are short. To actually run one, you convert it to a DFA.",
    },
    {
      type: "tf",
      lec: [2],
      q: "True or false: when you simulate an NFA with sets of states, you need the ε-closure at the start, before reading any symbol.",
      answer: true,
      explain: "δ̂(q<sub>start</sub>, ε) = E(q<sub>start</sub>). The NFA can follow ε-arrows before reading anything, so the starting set is the whole ε-closure.",
    },
  ],
});
})();
