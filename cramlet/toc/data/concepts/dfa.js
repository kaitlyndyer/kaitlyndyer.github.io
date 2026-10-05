(function () {
"use strict";

// Example machines (from the lecture and example slides). Positions are in diagram units.
const DFA_ENDS1 = {
  states: { q0: [100, 100], q1: [320, 100] }, start: "q0", accept: ["q1"], alphabet: ["0", "1"],
  delta: { q0: { 0: "q0", 1: "q1" }, q1: { 0: "q0", 1: "q1" } },
};
const DFA_ENDS1_FLIPPED = { ...DFA_ENDS1, accept: ["q0"] };
const DFA_EVEN_LENGTH = {
  states: { q0: [100, 100], q1: [320, 100] }, start: "q0", accept: ["q0"], alphabet: ["0", "1"],
  delta: { q0: { 0: "q1", 1: "q1" }, q1: { 0: "q0", 1: "q0" } },
};
const DFA_EVEN_ONES = {
  states: { q0: [100, 100], q1: [320, 100] }, start: "q0", accept: ["q0"], alphabet: ["0", "1"],
  delta: { q0: { 0: "q0", 1: "q1" }, q1: { 0: "q1", 1: "q0" } },
};
const DFA_START0_END1 = {
  states: { q0: [80, 90], q1: [260, 90], q2: [440, 90], q3: [80, 230, { loop: 90 }] }, start: "q0", accept: ["q2"], alphabet: ["0", "1"],
  delta: { q0: { 0: "q1", 1: "q3" }, q1: { 0: "q1", 1: "q2" }, q2: { 0: "q1", 1: "q2" }, q3: { 0: "q3", 1: "q3" } },
};
const DFA_SAME_ENDS = {
  states: { q0: [70, 150], q1: [240, 60], q2: [430, 60], q3: [240, 240, { loop: 90 }], q4: [430, 240, { loop: 90 }] },
  start: "q0", accept: ["q1", "q3"], alphabet: ["0", "1"],
  delta: { q0: { 0: "q1", 1: "q3" }, q1: { 0: "q1", 1: "q2" }, q2: { 0: "q1", 1: "q2" }, q3: { 0: "q4", 1: "q3" }, q4: { 0: "q4", 1: "q3" } },
};

const count = (w, c) => w.split(c).length - 1;

registerConcept({
  id: "dfa",
  oneLiner:
    "A <b>DFA</b> reads its input once, left to right, hopping between a fixed, finite set of states. If it ends in an <b>accept state</b>, it accepts.",

  related: ["languages", "nfa", "closure"],

  // ---------- Summary tab ----------
  summary: {
    keyPoints: [
      { lec: [1], html: "A finite automaton has a <b>fixed, finite number of states</b>, so it has a fixed amount of memory no matter how long the input is." },
      { lec: [1], html: "It reads the input <b>once, left to right</b>, following the arrow for each symbol. When the input runs out, it <b>accepts</b> if it’s in an accept state and <b>rejects</b> otherwise." },
      { lec: [1], html: "<b>Deterministic</b> means no choices: from every state, there is <b>exactly one</b> arrow for each symbol of Σ." },
      { lec: [1], html: "Formally, a DFA is a 5-tuple <b>M = (Q, Σ, δ, q<sub>start</sub>, F)</b>, where <b>δ : Q × Σ → Q</b> gives the next state." },
      { lec: [1], html: "<b>δ̂(q, w)</b> is the state you end up in if you start at q and read all of w. M accepts w exactly when <b>δ̂(q<sub>start</sub>, w) ∈ F</b>." },
      { lec: [1], html: "<b>L(M)</b> is the set of strings M accepts. A language is <b>regular</b> if some DFA recognizes it." },
      { lec: [1], kind: "warn", html: "Don’t forget the empty string: M accepts <b>ε</b> exactly when the <b>start state is an accept state</b>." },
      { lec: [1], html: "Finite memory has limits: no DFA can count without a bound, so <b>{0<sup>n</sup>1<sup>n</sup> : n ≥ 0}</b> is not regular. (You prove this with the pumping lemma.)" },
    ],
    compare: {
      head: ["Piece", "In the diagram", "In the 5-tuple"],
      rows: [
        ["States", "Circles", "<b>Q</b>, a finite set"],
        ["Alphabet", "The symbols on the arrows", "<b>Σ</b>, a finite set of symbols"],
        ["Transitions", "Arrows labeled with symbols", "<b>δ : Q × Σ → Q</b>"],
        ["Start state", "The arrow coming from nowhere", "<b>q<sub>start</sub> ∈ Q</b>"],
        ["Accept states", "Double circles", "<b>F ⊆ Q</b>"],
      ],
    },
  },

  // ---------- Details tab ----------
  details: [
    {
      id: "running",
      title: "How a DFA runs",
      lec: [1],
      html: `
        <p>Think of a DFA as a board game piece moving between circles. To run it on a string <i>w</i>:</p>
        <ol>
          <li>Put the piece on the <b>start state</b> (the one with the arrow coming from nowhere).</li>
          <li>Read the next symbol of <i>w</i> and follow the arrow labeled with it.</li>
          <li>Repeat until the input runs out. You can’t go back and you can’t peek ahead.</li>
          <li>If the piece is on a <b>double circle</b> (an accept state), the DFA <b>accepts</b>. Otherwise it <b>rejects</b>.</li>
        </ol>
        <p>For the machine that accepts strings ending in 1, running <i>w</i> = 011101 visits q<sub>0</sub> → q<sub>0</sub> → q<sub>1</sub> → q<sub>1</sub> → q<sub>1</sub> → q<sub>0</sub> → q<sub>1</sub>. It ends in q<sub>1</sub>, an accept state, so it accepts.</p>
        <p class="callout try">Open the <b>Playground</b> tab to step through this run (and others) one symbol at a time.</p>`,
    },
    {
      id: "deterministic",
      title: "What makes it deterministic",
      lec: [1],
      html: `
        <p>In a <b>deterministic</b> finite automaton, every state has <b>exactly one</b> outgoing arrow for <b>each</b> symbol in the alphabet. So for any input there’s only one possible run, and the machine never gets stuck.</p>
        <ul>
          <li>Two arrows labeled 0 leaving the same state? <i data-icon="no"></i> Not a DFA.</li>
          <li>A state with no arrow for 1? <i data-icon="no"></i> Not a DFA, unless you’re using the “hidden sink” convention below.</li>
        </ul>
        <p>Relaxing this rule (allowing several arrows, no arrow, or ε-arrows) gives you an <b>NFA</b>, which comes next.</p>`,
    },
    {
      id: "formal",
      title: "The formal definition",
      lec: [1],
      html: `
        <p>A <b>DFA</b> is a 5-tuple <b>M = (Q, Σ, δ, q<sub>start</sub>, F)</b>:</p>
        <ul>
          <li><b>Q</b> is a finite set of <b>states</b>.</li>
          <li><b>Σ</b> is a finite <b>alphabet</b>.</li>
          <li><b>δ : Q × Σ → Q</b> is the <b>transition function</b>. Give it a state and a symbol, and it returns the next state.</li>
          <li><b>q<sub>start</sub> ∈ Q</b> is the <b>start state</b>.</li>
          <li><b>F ⊆ Q</b> is the set of <b>accept states</b> (also called final states).</li>
        </ul>
        <h4>Example: strings that end in 1</h4>
        <p>Q = {q<sub>0</sub>, q<sub>1</sub>}, Σ = {0, 1}, q<sub>start</sub> = q<sub>0</sub>, F = {q<sub>1</sub>}, and</p>
        <p>δ(q<sub>0</sub>, 0) = q<sub>0</sub>, δ(q<sub>0</sub>, 1) = q<sub>1</sub>, δ(q<sub>1</sub>, 0) = q<sub>0</sub>, δ(q<sub>1</sub>, 1) = q<sub>1</sub>.</p>
        <p class="callout tip">A transition table is often easier to read than a list: one row per state, one column per symbol. The Playground shows the table next to the diagram and highlights the cell being used.</p>`,
    },
    {
      id: "extended",
      title: "The extended transition function δ̂",
      lec: [1],
      html: `
        <p>δ only handles <b>one</b> symbol. To talk about a whole string, define <b>δ̂ : Q × Σ* → Q</b>, where δ̂(q, w) is the state you reach from q after reading all of w. It’s defined by recursion on the length of w:</p>
        <ul>
          <li><b>δ̂(q, ε) = q</b>: reading nothing leaves you where you are.</li>
          <li><b>δ̂(q, w<sub>1</sub>…w<sub>n</sub>) = δ(δ̂(q, w<sub>1</sub>…w<sub>n−1</sub>), w<sub>n</sub>)</b>: read everything but the last symbol, then take one more step.</li>
        </ul>
        <h4>Example: w = 011 on the “ends in 1” machine</h4>
        <p>δ̂(q<sub>0</sub>, 0) = q<sub>0</sub>, then δ̂(q<sub>0</sub>, 01) = δ(q<sub>0</sub>, 1) = q<sub>1</sub>, then δ̂(q<sub>0</sub>, 011) = δ(q<sub>1</sub>, 1) = q<sub>1</sub>. Since q<sub>1</sub> ∈ F, M accepts 011.</p>
        <p>So the official definition: <b>M accepts w if δ̂(q<sub>start</sub>, w) ∈ F</b>, and rejects it otherwise.</p>`,
    },
    {
      id: "language",
      title: "The language of a DFA",
      lec: [1],
      html: `
        <p>The <b>language</b> of M is <b>L(M) = { w ∈ Σ* | M accepts w }</b>. We say M <b>recognizes</b> (or decides) L(M).</p>
        <p>A language is <b>regular</b> if there is <b>some</b> DFA that recognizes it. Regular languages are exactly the ones you can decide with a fixed amount of memory in one left-to-right pass, in O(n) time.</p>
        <h4>Small changes, different languages</h4>
        <ul>
          <li>With q<sub>1</sub> as the accept state, the two-state machine above accepts strings that <b>end in 1</b>.</li>
          <li>Make q<sub>0</sub> the accept state instead, and it accepts strings that <b>end in 0, plus the empty string</b> (q<sub>0</sub> is also the start state).</li>
          <li>Send both symbols back and forth between two states, and you get strings of <b>even length</b>.</li>
        </ul>
        <p class="callout warn">When you describe L(M), check ε separately. It’s the most commonly forgotten string.</p>`,
    },
    {
      id: "conventions",
      title: "Drawing conventions",
      lec: [1],
      html: `
        <ul>
          <li><b>One arrow, several symbols.</b> If 0 and 1 both go from q to r, draw one arrow labeled “0,1”.</li>
          <li><b>Hidden sink state.</b> A <b>sink</b> (or trap) state is a non-accepting state that loops to itself on every symbol; once you’re in, you can never accept. To keep pictures small, people often leave it out: if a state has no arrow for a symbol, imagine that symbol sends you to an invisible sink, and the string is rejected.</li>
          <li><b>State names.</b> q<sub>0</sub>, q<sub>1</sub>, … is standard, but naming states by what they remember (“seen a 0”, “last symbol was 1”) makes a design much easier to check.</li>
        </ul>`,
    },
    {
      id: "memory",
      title: "Designing a DFA: memory lives in the states",
      lec: [1],
      html: `
        <p>A DFA can’t write anything down. The <b>only</b> thing it remembers is which state it’s in. So to design one, ask: <i>what do I need to remember about the input so far?</i> Then make one state for each possible answer.</p>
        <ul>
          <li><b>Even number of 1s?</b> Remember one bit: even or odd. Two states.</li>
          <li><b>Starts and ends with the same symbol?</b> Remember the first symbol <i>and</i> whether the latest symbol matches it, plus a start state that hasn’t seen anything yet.</li>
          <li><b>{0<sup>n</sup>1<sup>n</sup>}?</b> You’d have to remember how many 0s you’ve seen, and that number has no limit. A finite set of states can’t do it, so this language is not regular.</li>
        </ul>
        <p class="callout try">Try the <b>Build a DFA</b> challenges in the Playground. Each one checks your machine against the language and shows you the shortest string it gets wrong.</p>`,
    },
  ],

  // ---------- Playground tab ----------
  playground: [
    {
      id: "runner",
      title: "Run a DFA",
      lec: [1],
      intro: `<p>Pick a machine, type a string (or pick an example), and step through it. Before you run anything, try to guess what each machine accepts.</p>`,
      widget: "dfa-runner",
      config: {
        machines: [
          { id: "ends1", name: "Machine A", lang: "L(M) = { w | w ends in 1 }", machine: DFA_ENDS1, examples: ["011101", "0110", "1", ""] },
          { id: "even-length", name: "Machine B", lang: "L(M) = { w | w has even length }", machine: DFA_EVEN_LENGTH, examples: ["0110", "101", ""] },
          { id: "even-ones", name: "Machine C", lang: "L(M) = { w | w has an even number of 1s }", machine: DFA_EVEN_ONES, examples: ["0110", "0111", "0000"] },
          { id: "start0-end1", name: "Machine D", lang: "L(M) = { w | w starts with 0 and ends with 1 }", machine: DFA_START0_END1, examples: ["0101", "0011", "010", "1001"] },
          { id: "same-ends", name: "Machine E", lang: "L(M) = { w | w starts and ends with the same symbol }", machine: DFA_SAME_ENDS, examples: ["0110", "1001", "10", "0"] },
        ],
      },
    },
    {
      id: "build",
      title: "Build a DFA",
      lec: [1],
      intro: `<p>Fill in the transition table to build a DFA for each language. The diagram updates as you go. When you check it, cramlet tests your machine on every string up to length 12. If something’s wrong, it shows the <b>shortest</b> string your DFA gets wrong.</p>`,
      widget: "dfa-builder",
      config: {
        maxStates: 5,
        challenges: [
          { id: "ends0", name: "Ends in 0", lang: "{ w | w ends in 0 }", test: w => w.endsWith("0"),
            hint: "Two states are enough: one that means “the last symbol was 0” and one for everything else, including ε." },
          { id: "even-zeros", name: "Even # of 0s", lang: "{ w | w has an even number of 0s }", test: w => count(w, "0") % 2 === 0,
            hint: "Remember one bit: have you seen an even or an odd number of 0s so far? Reading a 1 doesn’t change it. Is ε in the language?" },
          { id: "starts1", name: "Starts with 1", lang: "{ w | w starts with 1 }", test: w => w.startsWith("1"),
            hint: "Once you’ve read the first symbol, the answer never changes. Strings that start with 0 need a trap (sink) state." },
          { id: "exactly-one-1", name: "Exactly one 1", lang: "{ w | w contains exactly one 1 }", test: w => count(w, "1") === 1,
            hint: "Count the 1s, but only up to “too many”: none yet, exactly one, or two or more. The last one is a trap." },
          { id: "contains11", name: "Contains 11", lang: "{ w | w contains 11 as a substring }", test: w => w.includes("11"),
            hint: "Remember how much of “11” you’ve just seen: nothing, a single 1, or the whole thing. After you’ve found 11, stay in an accept state no matter what." },
          { id: "length-mod3", name: "Length divisible by 3", lang: "{ w | the length of w is divisible by 3 }", test: w => w.length % 3 === 0,
            hint: "Keep the length mod 3: three states in a cycle, and both symbols move you one step around it." },
        ],
      },
    },
  ],

  // ---------- Practice tab ----------
  flashcards: [
    { front: "DFA", back: "A <b>deterministic finite automaton</b>: finitely many states, reads the input once left to right, and has exactly one transition for each (state, symbol). It accepts if it ends in an accept state." },
    { front: "The 5-tuple (Q, Σ, δ, q<sub>start</sub>, F)", back: "<b>Q</b> states, <b>Σ</b> alphabet, <b>δ</b> transition function, <b>q<sub>start</sub></b> start state, <b>F</b> accept states." },
    { front: "The type of δ for a DFA", back: "<b>δ : Q × Σ → Q</b>. It takes a state and a symbol and returns the next state." },
    { front: "δ̂(q, w)", back: "The state you reach from q after reading all of w. <b>δ̂(q, ε) = q</b> and <b>δ̂(q, w<sub>1</sub>…w<sub>n</sub>) = δ(δ̂(q, w<sub>1</sub>…w<sub>n−1</sub>), w<sub>n</sub>)</b>." },
    { front: "When does M accept w?", back: "When <b>δ̂(q<sub>start</sub>, w) ∈ F</b>: reading all of w from the start state lands in an accept state." },
    { front: "L(M)", back: "The language of M: the set of all strings M accepts. M <b>recognizes</b> L(M)." },
    { front: "Regular language", back: "A language that some DFA recognizes." },
    { front: "What makes an automaton deterministic?", back: "From every state, there is <b>exactly one</b> outgoing transition for <b>each</b> symbol. One possible run per input." },
    { front: "Sink (trap) state", back: "A non-accepting state that loops to itself on every symbol. Drawings often leave it out: a missing arrow means “go to the sink and reject.”" },
    { front: "Does M accept ε?", back: "Exactly when the <b>start state is an accept state</b>, since δ̂(q<sub>start</sub>, ε) = q<sub>start</sub>." },
    { front: "Why can’t a DFA recognize {0<sup>n</sup>1<sup>n</sup>}?", back: "It would have to remember how many 0s it has read, with no upper limit. A DFA only has finitely many states, so it has finite memory." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [1],
      q: "What is L(M) for this DFA?",
      machine: DFA_ENDS1,
      options: ["Strings that contain a 1", "Strings that end in 1", "Strings that end in 0", "Strings with an odd number of 1s"],
      answer: 1,
      explain: "Every 1 sends you to q<sub>1</sub> and every 0 sends you to q<sub>0</sub>, so the state just records the <b>last symbol</b>. You accept when the last symbol was 1.",
    },
    {
      type: "mc",
      lec: [1],
      q: "Same machine, but now <b>q<sub>0</sub></b> is the only accept state. What is L(M)?",
      machine: DFA_ENDS1_FLIPPED,
      options: ["Strings that end in 0", "Strings that end in 0, plus the empty string", "Strings that end in 1", "Every string"],
      answer: 1,
      explain: "q<sub>0</sub> still means “the last symbol was 0”, but it’s also the <b>start state</b>, so ε is accepted too. Always check ε separately.",
    },
    {
      type: "mc",
      lec: [1],
      q: "What is L(M) for this DFA?",
      machine: DFA_EVEN_LENGTH,
      options: ["Strings with an even number of 1s", "Strings with an even number of 0s", "Strings of even length", "Strings that start and end with the same symbol"],
      answer: 2,
      explain: "Both 0 and 1 flip you between q<sub>0</sub> and q<sub>1</sub>, so the state tracks whether you’ve read an even or odd number of symbols. q<sub>0</sub> (even) accepts.",
    },
    {
      type: "mc",
      lec: [1],
      q: "Which string does this DFA accept?",
      machine: DFA_START0_END1,
      options: ["1001", "0110", "0101", "ε"],
      answer: 2,
      explain: "The machine accepts strings that <b>start with 0 and end with 1</b>. 1001 falls into the sink q<sub>3</sub> right away, 0110 ends in 0, and ε stays in the non-accepting start state.",
    },
    {
      type: "tf",
      lec: [1],
      q: "True or false: in a DFA, one state can have two outgoing arrows labeled 0 as long as they go to different states.",
      answer: false,
      explain: "Deterministic means <b>exactly one</b> arrow per symbol from each state. Two arrows for the same symbol is something only an NFA allows.",
    },
    {
      type: "mc",
      lec: [1],
      q: "What is the type of the transition function δ of a DFA?",
      options: ["δ : Q → Σ", "δ : Q × Σ → Q", "δ : Q × Σ → Powerset(Q)", "δ : Σ → Q"],
      answer: 1,
      explain: "A DFA’s δ takes a (state, symbol) pair and returns <b>one</b> state. Returning a <b>set</b> of states (Powerset(Q)) is what an NFA’s δ does.",
    },
    {
      type: "mc",
      lec: [1],
      q: "For the “ends in 1” machine (start q<sub>0</sub>, accept q<sub>1</sub>), what is δ̂(q<sub>0</sub>, 0110)?",
      machine: DFA_ENDS1,
      options: ["q<sub>0</sub>", "q<sub>1</sub>", "It’s undefined because the string contains 0s", "{q<sub>0</sub>, q<sub>1</sub>}"],
      answer: 0,
      explain: "The state only depends on the last symbol read. 0110 ends in 0, so δ̂(q<sub>0</sub>, 0110) = q<sub>0</sub>. (A DFA’s δ̂ is always a single state, never a set.)",
    },
    {
      type: "tf",
      lec: [1],
      q: "True or false: a DFA accepts the empty string ε exactly when its start state is an accept state.",
      answer: true,
      explain: "δ̂(q<sub>start</sub>, ε) = q<sub>start</sub>: reading nothing leaves you at the start. So ε is accepted exactly when q<sub>start</sub> ∈ F.",
    },
    {
      type: "mc",
      lec: [1],
      q: "Which of these languages over {0, 1} is <b>not</b> regular?",
      options: ["{ w | w ends in 1 }", "{ w | w has even length }", "{ 0<sup>n</sup>1<sup>n</sup> | n ≥ 0 }", "{ w | w contains 11 }"],
      answer: 2,
      explain: "To check 0<sup>n</sup>1<sup>n</sup>, a machine must remember how many 0s it read, with no upper limit. A DFA has only finitely many states. The others each need only a few states.",
    },
    {
      type: "mc",
      lec: [1],
      q: "How much memory does a DFA use while reading an input of length n?",
      options: ["A fixed amount that doesn’t depend on n", "About n symbols", "About log n bits", "It depends on how many 1s the input has"],
      answer: 0,
      explain: "All a DFA remembers is its current state, and there are finitely many states. That’s why regular languages can be decided in one streaming pass with constant memory.",
    },
    {
      type: "tf",
      lec: [1],
      q: "True or false: if a state has no arrow for some symbol, the common convention is that the string is rejected.",
      answer: true,
      explain: "A missing arrow means the symbol leads to a hidden <b>sink state</b>, which never accepts. Drawings leave it out to stay compact.",
    },
  ],
});
})();
