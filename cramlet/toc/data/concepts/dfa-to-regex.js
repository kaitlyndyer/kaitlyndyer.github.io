(function () {
"use strict";

const ENDS_1 = {
  states: { q0: [100, 120], q1: [320, 120] }, start: "q0", accept: ["q1"], alphabet: ["0", "1"],
  delta: { q0: { 0: "q0", 1: "q1" }, q1: { 0: "q0", 1: "q1" } },
};
const EVEN_ONES = {
  states: { q0: [100, 120], q1: [320, 120] }, start: "q0", accept: ["q0"], alphabet: ["0", "1"],
  delta: { q0: { 0: "q0", 1: "q1" }, q1: { 0: "q1", 1: "q0" } },
};
const CONTAINS_00 = {
  states: { q0: [80, 120], q1: [260, 120], q2: [440, 120] }, start: "q0", accept: ["q2"], alphabet: ["0", "1"],
  delta: { q0: { 0: "q1", 1: "q0" }, q1: { 0: "q2", 1: "q0" }, q2: { 0: "q2", 1: "q2" } },
};
const START0_END1 = {
  states: { q0: [80, 90], q1: [260, 90], q2: [440, 90], q3: [80, 230, { loop: 90 }] }, start: "q0", accept: ["q2"], alphabet: ["0", "1"],
  delta: { q0: { 0: "q1", 1: "q3" }, q1: { 0: "q1", 1: "q2" }, q2: { 0: "q1", 1: "q2" }, q3: { 0: "q3", 1: "q3" } },
};

// A small GNFA (labels are regular expressions) for the quiz.
// The general "remove q_kill" step: R1 in, R2 loop, R3 out, R4 the direct arrow.
const QUIZ_RIP = {
  states: { "qᵢ": [0, 130], "qₖᵢₗₗ": [170, 20], "qⱼ": [340, 130] }, accept: [], alphabet: [],
  delta: { "qᵢ": { "R₁": ["qₖᵢₗₗ"], "R₄": ["qⱼ"] }, "qₖᵢₗₗ": { "R₂": ["qₖᵢₗₗ"], "R₃": ["qⱼ"] } },
};

const QUIZ_GNFA = {
  states: { s: [0, 100], q1: [160, 100], f: [320, 100] }, start: "s", accept: ["f"], alphabet: [],
  delta: { s: { "ε": ["q1"] }, q1: { "0": ["q1"], "1": ["f"] } },
};

registerConcept({
  id: "dfa-to-regex",
  oneLiner:
    "Turn a DFA into a regular expression: put it in <b>simple form</b>, then <b>remove states one at a time</b>, relabeling arrows with regular expressions until one arrow is left.",

  related: ["regex", "regex-to-nfa", "dfa"],

  summary: {
    keyPoints: [
      { lec: [3], kind: "key", html: "<b>Theorem (other direction):</b> if A is regular, some regular expression R has L(R) = A. Together with Regex → NFA: <b>regular ⇔ described by a regex</b>." },
      { lec: [3], html: "A <b>generalized NFA (GNFA)</b> has arrows labeled with <b>regular expressions</b>. It can follow an arrow by reading any block of input that matches the label." },
      { lec: [3], html: "Every DFA is an NFA, and every NFA is a GNFA (single symbols are regexes), but not the other way around." },
      { lec: [3], html: "<b>Simple form:</b> one accept state with no arrows leaving it; a start state with no arrows entering it; at most one arrow between each pair of states (combine labels with ∪)." },
      { lec: [3], html: "<b>Remove a state q<sub>kill</sub>:</b> for each pair q<sub>i</sub>, q<sub>j</sub> connected through it, replace the path with one arrow labeled <b>R<sub>1</sub>(R<sub>2</sub>)*R<sub>3</sub> ∪ R<sub>4</sub></b>. This also applies when q<sub>i</sub> = q<sub>j</sub>." },
      { lec: [3], html: "R<sub>1</sub>: q<sub>i</sub> → q<sub>kill</sub>. R<sub>2</sub>: the loop on q<sub>kill</sub>. R<sub>3</sub>: q<sub>kill</sub> → q<sub>j</sub>. R<sub>4</sub>: the direct arrow q<sub>i</sub> → q<sub>j</sub> (∅ if there isn’t one)." },
      { lec: [3], html: "Removing a state doesn’t change which strings the GNFA accepts. When only the start and accept states are left, the label between them is the regex." },
      { lec: [3], kind: "warn", html: "Removing states in a different order can give a different-looking regex. They all describe the <b>same language</b>." },
    ],
    compare: {
      head: ["Label", "What it means"],
      rows: [
        ["R<sub>1</sub>", "Get from q<sub>i</sub> into q<sub>kill</sub>"],
        ["(R<sub>2</sub>)*", "Go around q<sub>kill</sub>’s loop any number of times (ε if there’s no loop)"],
        ["R<sub>3</sub>", "Leave q<sub>kill</sub> for q<sub>j</sub>"],
        ["∪ R<sub>4</sub>", "Or skip q<sub>kill</sub> and take the direct arrow"],
      ],
    },
  },

  details: [
    {
      id: "gnfa",
      title: "Generalized NFAs",
      lec: [3],
      html: `
        <p>A <b>GNFA</b> is like an NFA, but each arrow is labeled with a <b>regular expression</b> instead of a single symbol. To follow an arrow labeled R, read a block of input that matches R.</p>
        <p>A GNFA <b>accepts</b> w if there’s a path from the start state to an accept state with labels R<sub>1</sub>, R<sub>2</sub>, …, R<sub>k</sub> such that w ∈ L(R<sub>1</sub>R<sub>2</sub>…R<sub>k</sub>): w can be cut into blocks, one matching each label along the path.</p>
        <p>For example, if a path has an arrow labeled <b>0*1</b> followed by an arrow labeled <b>1 ∪ 10</b>, the GNFA can read <b>00110</b> along it: 001 matches 0*1, then 10 matches 1 ∪ 10.</p>
        <p>A DFA is an NFA, and an NFA is a GNFA (a symbol is a regex), so we can start from a DFA and keep simplifying.</p>`,
    },
    {
      id: "simple",
      title: "Step 1: simple form",
      lec: [3],
      html: `
        <p>Before removing states, make the GNFA tidy:</p>
        <ol>
          <li><b>Unique accept state, nothing leaving it.</b> Add a new accept state with ε-arrows from the old accept states, which stop accepting.</li>
          <li><b>Nothing entering the start state.</b> Add a new start state with an ε-arrow to the old one.</li>
          <li><b>At most one arrow per pair.</b> If there are several arrows from q to r with labels R<sub>1</sub>, R<sub>2</sub>, …, replace them with one arrow labeled R<sub>1</sub> ∪ R<sub>2</sub> ∪ ….</li>
        </ol>
        <p>The new start and accept states are never removed, so at the end the start state has exactly one arrow: to the accept state.</p>`,
    },
    {
      id: "rip",
      title: "Step 2: removing a state",
      lec: [3],
      html: `
        <p>Pick any state q<sub>kill</sub> other than the start and accept states. Every way to pass through it looks like this:</p>
        <p class="callout key">Go from q<sub>i</sub> into q<sub>kill</sub> (R<sub>1</sub>), loop there any number of times (R<sub>2</sub>*), then leave for q<sub>j</sub> (R<sub>3</sub>). Or skip q<sub>kill</sub> entirely with the direct arrow (R<sub>4</sub>). So the new label for q<sub>i</sub> → q<sub>j</sub> is <b>R<sub>1</sub>(R<sub>2</sub>)*R<sub>3</sub> ∪ R<sub>4</sub></b>.</p>
        <ul>
          <li>Do this for <b>every</b> pair (q<sub>i</sub>, q<sub>j</sub>) with an arrow into q<sub>kill</sub> and an arrow out of it, including q<sub>i</sub> = q<sub>j</sub> (that pair updates q<sub>i</sub>’s loop).</li>
          <li>If there’s no loop on q<sub>kill</sub>, (R<sub>2</sub>)* is just ε. If there’s no direct arrow, R<sub>4</sub> = ∅ and the “∪ R<sub>4</sub>” disappears.</li>
          <li>Then delete q<sub>kill</sub>. The GNFA accepts exactly the same strings as before.</li>
        </ul>`,
    },
    {
      id: "finish",
      title: "Step 3: read off the answer",
      lec: [3],
      html: `
        <p>Repeat until only the start and accept states are left. In simple form, the start state has no incoming arrows and the accept state has no outgoing ones, so there’s exactly one arrow left: start → accept. Its label R satisfies <b>L(R) = A</b>.</p>
        <h4>The whole algorithm</h4>
        <ol>
          <li>Start with a DFA D that recognizes A.</li>
          <li>Convert it into a GNFA G in simple form.</li>
          <li>Remove the middle states of G one at a time.</li>
          <li>The label on the last arrow is a regex R with L(R) = A.</li>
        </ol>
        <p class="callout tip">Try different removal orders in the Playground: the regexes look different but always describe the same language. Removing states with fewer arrows first usually gives shorter regexes.</p>`,
    },
    {
      id: "simplifying",
      title: "Simplifying labels as you go",
      lec: [3],
      html: `
        <p>The formula R<sub>1</sub>(R<sub>2</sub>)*R<sub>3</sub> ∪ R<sub>4</sub> often produces labels with ε and ∅ in them. These rules keep them short (the Playground uses them):</p>
        <ul>
          <li>∅ ∪ R = R, and R ∪ R = R</li>
          <li>εR = Rε = R, and ∅R = R∅ = ∅</li>
          <li>ε* = ∅* = ε, and (R*)* = R*</li>
          <li>ε ∪ R* = R*</li>
        </ul>`,
    },
  ],

  playground: [
    {
      id: "remove",
      title: "Turn a DFA into a regex",
      lec: [3],
      intro: `<p>Pick a DFA and step through the GNFA method: simple form first, then remove the middle states one at a time. Each path through a removed state gets its own step, with R<sub>1</sub> to R<sub>4</sub> spelled out. Click a middle state to choose which one to remove next, then check the final regex against the DFA.</p>`,
      widget: "gnfa-stepper",
      config: {
        machines: [
          { id: "ends1", name: "Ends in 1", lang: "strings that end in 1", machine: ENDS_1, examples: ["0101", "0110", "1", ""] },
          { id: "even-ones", name: "Even # of 1s", lang: "strings with an even number of 1s", machine: EVEN_ONES, examples: ["0110", "0111", "", "1"] },
          { id: "contains-00", name: "Contains 00", lang: "strings that contain 00", machine: CONTAINS_00, examples: ["1001", "0101", "00"] },
          { id: "start0-end1", name: "Starts 0, ends 1", lang: "strings that start with 0 and end with 1", machine: START0_END1, examples: ["0101", "0110", "1001"] },
        ],
      },
    },
  ],

  flashcards: [
    { front: "GNFA", back: "A <b>generalized NFA</b>: arrows are labeled with regular expressions. Following an arrow reads a block of input that matches its label." },
    { front: "Simple form of a GNFA", back: "One accept state with no arrows leaving it; a start state with no arrows entering it; at most one arrow between each pair of states." },
    { front: "Making the accept state unique", back: "Add a new accept state with ε-arrows from the old accept states; the old ones stop accepting." },
    { front: "Combining parallel arrows", back: "Replace arrows labeled R<sub>1</sub>, R<sub>2</sub>, … between the same two states with one arrow labeled R<sub>1</sub> ∪ R<sub>2</sub> ∪ …." },
    { front: "Removing q<sub>kill</sub>: the new label for q<sub>i</sub> → q<sub>j</sub>", back: "<b>R<sub>1</sub>(R<sub>2</sub>)*R<sub>3</sub> ∪ R<sub>4</sub></b>: into q<sub>kill</sub>, around its loop, out to q<sub>j</sub>, or the direct arrow." },
    { front: "What is R<sub>4</sub> if there’s no direct arrow?", back: "∅, so the “∪ R<sub>4</sub>” part disappears." },
    { front: "What if q<sub>kill</sub> has no loop?", back: "Then (R<sub>2</sub>)* is ε, and the label is just R<sub>1</sub>R<sub>3</sub> ∪ R<sub>4</sub>." },
    { front: "When does state removal stop?", back: "When only the start and accept states are left. The label on the arrow between them is the regex." },
    { front: "Does the removal order matter?", back: "It can change how the regex looks, but every order gives a regex for the <b>same</b> language." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [3],
      q: "In this piece of a GNFA, R<sub>1</sub> labels q<sub>i</sub> → q<sub>kill</sub>, R<sub>2</sub> is q<sub>kill</sub>’s self-loop, R<sub>3</sub> labels q<sub>kill</sub> → q<sub>j</sub>, and R<sub>4</sub> labels the direct arrow q<sub>i</sub> → q<sub>j</sub>. After removing q<sub>kill</sub>, what is the new label on q<sub>i</sub> → q<sub>j</sub>?",
      machine: QUIZ_RIP,
      options: ["R<sub>1</sub>R<sub>2</sub>R<sub>3</sub> ∪ R<sub>4</sub>", "R<sub>1</sub>(R<sub>2</sub>)*R<sub>3</sub> ∪ R<sub>4</sub>", "(R<sub>1</sub> ∪ R<sub>3</sub>)*R<sub>4</sub>", "R<sub>4</sub>(R<sub>2</sub>)*"],
      answer: 1,
      explain: "Enter q<sub>kill</sub> (R<sub>1</sub>), loop any number of times ((R<sub>2</sub>)*), leave for q<sub>j</sub> (R<sub>3</sub>), or skip it with the direct arrow (∪ R<sub>4</sub>).",
    },
    {
      type: "mc",
      lec: [3],
      q: "Which of these is <b>not</b> part of putting a GNFA in simple form?",
      options: ["A single accept state with no arrows leaving it", "No arrows entering the start state", "At most one arrow between each pair of states", "Every state must be an accept state"],
      answer: 3,
      explain: "Simple form has exactly one accept state (the new one). The other three conditions are the lecture’s simple form.",
    },
    {
      type: "mc",
      lec: [3],
      q: "Removing q<sub>1</sub> from this GNFA (in simple form) leaves one arrow s → f. What is its label?",
      machine: QUIZ_GNFA,
      options: ["01", "0*1", "(01)*", "0 ∪ 1"],
      answer: 1,
      explain: "R<sub>1</sub> = ε (s → q<sub>1</sub>), R<sub>2</sub> = 0 (the loop), R<sub>3</sub> = 1 (q<sub>1</sub> → f), and R<sub>4</sub> = ∅. So the label is ε(0)*1 ∪ ∅ = 0*1.",
    },
    {
      type: "tf",
      lec: [3],
      q: "True or false: removing a middle state from a GNFA can change the language it accepts, so you have to check the result.",
      answer: false,
      explain: "Every path through q<sub>kill</sub> is replaced by an arrow whose label matches exactly the strings that path could read. The language stays the same.",
    },
    {
      type: "tf",
      lec: [3],
      q: "True or false: removing the states in a different order can give a different regular expression for the same language.",
      answer: true,
      explain: "The regexes can look quite different, but they all describe the language of the original DFA.",
    },
    {
      type: "mc",
      lec: [3],
      q: "Why do we add a new start state with no incoming arrows and a new accept state with no outgoing arrows?",
      options: ["So the GNFA becomes deterministic", "So that at the end, exactly one arrow (start → accept) is left, and its label is the answer", "Because ε-arrows aren’t allowed in a DFA", "To make the GNFA smaller"],
      answer: 1,
      explain: "They’re never removed, and nothing can loop back into the start or out of the accept state, so after removing everything else, one arrow start → accept remains.",
    },
    {
      type: "mc",
      lec: [3],
      q: "What does the theorem proved by DFA → Regex and Regex → NFA say?",
      options: ["Every language is regular", "A language is regular if and only if some regular expression describes it", "Regular expressions are more powerful than DFAs", "Every NFA has a unique regular expression"],
      answer: 1,
      explain: "Regex → NFA shows every regex describes a regular language; DFA → Regex shows every regular language has a regex. So DFA = NFA = regex.",
    },
  ],
});
})();
