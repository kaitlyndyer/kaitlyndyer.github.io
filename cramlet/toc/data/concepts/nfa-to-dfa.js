(function () {
"use strict";

const NFA_SECOND_LAST_1 = {
  states: { q0: [80, 110], q1: [260, 110], q2: [440, 110] },
  start: "q0", accept: ["q2"], alphabet: ["0", "1"],
  delta: { q0: { 0: ["q0"], 1: ["q0", "q1"] }, q1: { 0: ["q2"], 1: ["q2"] } },
};
const NFA_ENDS_00 = {
  states: { q0: [60, 110], q1: [200, 110], q2: [340, 110], q3: [480, 110] },
  start: "q0", accept: ["q3"], alphabet: ["0", "1"],
  delta: { q0: { "ε": ["q1"] }, q1: { 0: ["q1", "q2"], 1: ["q1"] }, q2: { 0: ["q3"] } },
};
const NFA_01_STAR = {
  states: { q0: [100, 110], q1: [320, 110] },
  start: "q0", accept: ["q0"], alphabet: ["0", "1"],
  delta: { q0: { 0: ["q1"] }, q1: { 1: ["q0"] } },
};

registerConcept({
  id: "nfa-to-dfa",
  oneLiner:
    "Every NFA has an equivalent DFA. Its states are <b>sets</b> of NFA states: the DFA keeps track of <b>everywhere the NFA could be</b>.",

  related: ["nfa", "dfa", "closure"],

  summary: {
    keyPoints: [
      { lec: [2], kind: "key", html: "<b>Theorem:</b> for every NFA N there is a DFA D with <b>L(D) = L(N)</b>. So a language is regular if and only if some NFA recognizes it." },
      { lec: [2], html: "The idea: after reading w, the DFA is in state <b>S</b> exactly when S is the set of NFA states reachable on w." },
      { lec: [2], html: "<b>States:</b> Q′ = Powerset(Q). <b>Start:</b> q′<sub>start</sub> = E(q<sub>start</sub>). <b>Accept:</b> F′ = { S | S contains an NFA accept state }." },
      { lec: [2], html: "<b>Transitions:</b> δ′(S, a) = E( ⋃<sub>q ∈ S</sub> δ(q, a) ). Follow a-arrows from every state in S, then take the ε-closure." },
      { lec: [2], html: "With n NFA states there are up to <b>2<sup>n</sup></b> DFA states, but many can’t be reached. Building only the reachable ones, starting from E(q<sub>start</sub>), gives a much smaller DFA." },
      { lec: [2], kind: "warn", html: "<b>∅</b> is a real DFA state (a dead state). It appears when no NFA state has an arrow for the symbol, and it loops to itself." },
      { lec: [2], html: "Why it’s correct: by induction on |w|, δ̂<sub>NFA</sub>(q<sub>start</sub>, w) = δ̂<sub>DFA</sub>(q′<sub>start</sub>, w). So N accepts w ⇔ that set meets F ⇔ D accepts w." },
    ],
  },

  details: [
    {
      id: "idea",
      title: "The idea",
      lec: [2],
      html: `
        <p>An NFA can be in many states at once. A DFA can only be in one. The trick is to make each DFA state <b>stand for a set</b> of NFA states.</p>
        <p>If the NFA could be in {q<sub>0</sub>, q<sub>2</sub>} after reading some input, the DFA is in a single state named “{q<sub>0</sub>, q<sub>2</sub>}”. Reading the next symbol moves the whole set at once, which is exactly the set-of-states simulation from the NFA concept, written down ahead of time as a table.</p>`,
    },
    {
      id: "construction",
      title: "The construction",
      lec: [2],
      html: `
        <p>Given an NFA N = (Q, Σ, δ, q<sub>start</sub>, F), build D = (Q′, Σ, δ′, q′<sub>start</sub>, F′):</p>
        <ul>
          <li><b>Q′ = Powerset(Q)</b>: one DFA state per subset of NFA states.</li>
          <li><b>q′<sub>start</sub> = E(q<sub>start</sub>)</b>: where the NFA can be before reading anything.</li>
          <li><b>F′ = { S ∈ Q′ | S ∩ F ≠ ∅ }</b>: accept if the set contains <b>at least one</b> NFA accept state (because the NFA accepts if <b>some</b> run does).</li>
          <li><b>δ′(S, a) = E( ⋃<sub>q ∈ S</sub> δ(q, a) )</b>: follow the a-arrows from every state in S, collect the results, then add everything reachable by ε-arrows.</li>
        </ul>
        <p class="callout tip">In practice, don’t write down all 2<sup>n</sup> subsets. Start from E(q<sub>start</sub>), compute its transitions, and only add the sets you actually reach. That’s what the Playground does.</p>`,
    },
    {
      id: "example",
      title: "Worked example: second-to-last symbol is 1",
      lec: [2],
      html: `
        <p>The NFA: q<sub>0</sub> loops on 0 and 1, q<sub>0</sub> —1→ q<sub>1</sub>, q<sub>1</sub> —0,1→ q<sub>2</sub>, and q<sub>2</sub> accepts. There are no ε-arrows, so every closure is just the set itself.</p>
        <div class="table-wrap"><table class="compare">
          <thead><tr><th>DFA state</th><th>NFA states</th><th>on 0</th><th>on 1</th></tr></thead>
          <tbody>
            <tr><th>→A</th><td>{q<sub>0</sub>}</td><td>A</td><td>B</td></tr>
            <tr><th>B</th><td>{q<sub>0</sub>, q<sub>1</sub>}</td><td>C</td><td>D</td></tr>
            <tr><th>C*</th><td>{q<sub>0</sub>, q<sub>2</sub>}</td><td>A</td><td>B</td></tr>
            <tr><th>D*</th><td>{q<sub>0</sub>, q<sub>1</sub>, q<sub>2</sub>}</td><td>C</td><td>D</td></tr>
          </tbody>
        </table></div>
        <p>For example, δ′(B, 0): from q<sub>0</sub>, 0 goes to q<sub>0</sub>; from q<sub>1</sub>, 0 goes to q<sub>2</sub>. So B on 0 is {q<sub>0</sub>, q<sub>2</sub>} = C. C and D contain q<sub>2</sub>, so they accept.</p>
        <p>Only 4 of the 2<sup>3</sup> = 8 subsets are reachable. The other 4 (like {q<sub>1</sub>} or ∅) never come up, so they can be left out.</p>`,
    },
    {
      id: "unreachable",
      title: "Unreachable states and the dead state",
      lec: [2],
      html: `
        <ul>
          <li>The full construction makes all 2<sup>n</sup> subsets, but most may be <b>unreachable</b> from the start state. Deleting them doesn’t change the language.</li>
          <li>If no state in S has an arrow for a, then δ′(S, a) = <b>∅</b>. The ∅ state goes to ∅ on every symbol and doesn’t accept, so it’s a <b>dead (sink) state</b>. Keep it: a DFA needs an arrow for every symbol.</li>
        </ul>`,
    },
    {
      id: "proof",
      title: "Why it works (proof sketch)",
      lec: [2],
      html: `
        <p><b>Lemma:</b> for every string w, δ̂<sub>NFA</sub>(q<sub>start</sub>, w) = δ̂<sub>DFA</sub>(q′<sub>start</sub>, w). In words: the DFA’s single state is exactly the NFA’s set of possible states.</p>
        <p><b>Proof by induction on |w|.</b></p>
        <ul>
          <li><b>Base case (w = ε):</b> both sides are E(q<sub>start</sub>), by the definitions of δ̂<sub>NFA</sub> and q′<sub>start</sub>.</li>
          <li><b>Inductive step:</b> write w = w′a. Both sides take the set for w′ (equal by the inductive hypothesis), follow a-arrows from every state in it, and take the ε-closure. That’s the definition of δ̂<sub>NFA</sub> on one side and of δ′ on the other.</li>
        </ul>
        <p><b>Theorem:</b> N accepts w ⇔ δ̂<sub>NFA</sub>(q<sub>start</sub>, w) ∩ F ≠ ∅ ⇔ δ̂<sub>DFA</sub>(q′<sub>start</sub>, w) ∈ F′ ⇔ D accepts w. So L(N) = L(D).</p>`,
    },
  ],

  playground: [
    {
      id: "stepper",
      title: "Build the DFA step by step",
      lec: [2],
      intro: `<p>Watch the subset construction add one transition at a time. The NFA on the left highlights the set being computed, and the DFA on the right grows as new sets are discovered. The <b>Recipe</b> below shows which rule each step uses.</p>`,
      widget: "subset-stepper",
      config: {
        examples: [
          { id: "second-last-1", name: "Second-to-last is 1", nfa: NFA_SECOND_LAST_1 },
          { id: "ends-00", name: "Ends in 00 (with ε)", nfa: NFA_ENDS_00 },
          { id: "01-star", name: "(01)* (has a dead state)", nfa: NFA_01_STAR },
        ],
      },
    },
  ],

  flashcards: [
    { front: "Subset construction", back: "Converts an NFA to a DFA whose states are <b>sets</b> of NFA states. The DFA tracks everywhere the NFA could be." },
    { front: "Start state of the subset DFA", back: "<b>E(q<sub>start</sub>)</b>, the ε-closure of the NFA’s start state." },
    { front: "Accept states of the subset DFA", back: "Every set S that contains <b>at least one</b> NFA accept state: F′ = { S | S ∩ F ≠ ∅ }." },
    { front: "δ′(S, a) in the subset construction", back: "<b>E( ⋃<sub>q ∈ S</sub> δ(q, a) )</b>: follow a-arrows from every state in S, then take the ε-closure." },
    { front: "How many states can the subset DFA have?", back: "Up to <b>2<sup>n</sup></b> for an n-state NFA, though usually far fewer are reachable." },
    { front: "What is the ∅ state?", back: "A dead (sink) state: reached when no NFA state has an arrow for the symbol. It loops to itself and never accepts." },
    { front: "Key lemma for correctness", back: "For all w: δ̂<sub>NFA</sub>(q<sub>start</sub>, w) = δ̂<sub>DFA</sub>(q′<sub>start</sub>, w). Proved by induction on the length of w." },
    { front: "Corollary of NFA → DFA", back: "A language is regular <b>if and only if</b> some NFA recognizes it." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [2],
      q: "In the subset construction, what is the DFA’s start state?",
      options: ["{q<sub>start</sub>}", "E(q<sub>start</sub>)", "All of Q", "∅"],
      answer: 1,
      explain: "Before reading anything, the NFA can already follow ε-arrows, so the DFA starts in the ε-closure E(q<sub>start</sub>). It equals {q<sub>start</sub>} only when there are no ε-arrows out of the start.",
    },
    {
      type: "mc",
      lec: [2],
      q: "Which DFA states are accept states?",
      options: ["Sets contained in F", "Sets that contain at least one NFA accept state", "Sets that contain every NFA accept state", "Only the set F itself"],
      answer: 1,
      explain: "The NFA accepts if <b>some</b> run ends in an accept state, so a set accepts as soon as it contains <b>one</b> accept state: F′ = { S | S ∩ F ≠ ∅ }.",
    },
    {
      type: "mc",
      lec: [2],
      q: "For this NFA, what is δ′({q<sub>0</sub>, q<sub>1</sub>}, 0)?",
      machine: NFA_SECOND_LAST_1,
      options: ["{q<sub>0</sub>}", "{q<sub>2</sub>}", "{q<sub>0</sub>, q<sub>2</sub>}", "{q<sub>0</sub>, q<sub>1</sub>, q<sub>2</sub>}"],
      answer: 2,
      explain: "From q<sub>0</sub>, 0 goes to q<sub>0</sub>. From q<sub>1</sub>, 0 goes to q<sub>2</sub>. No ε-arrows to add, so the result is {q<sub>0</sub>, q<sub>2</sub>}.",
    },
    {
      type: "mc",
      lec: [2],
      q: "An NFA has 5 states. At most how many states does the subset-construction DFA have?",
      options: ["5", "10", "25", "32"],
      answer: 3,
      explain: "One DFA state per subset of the 5 NFA states: 2<sup>5</sup> = 32. Usually only some of them are reachable.",
    },
    {
      type: "tf",
      lec: [2],
      q: "True or false: when δ′(S, a) comes out as ∅, you can just leave out that arrow in the final DFA and still have a valid DFA by the formal definition.",
      answer: false,
      explain: "A DFA must have an arrow for every (state, symbol). ∅ is a real state (a dead state that loops to itself). Leaving it out is only allowed as a drawing shortcut, with the hidden sink understood.",
    },
    {
      type: "mc",
      lec: [2],
      q: "For this NFA (with an ε-arrow), what is the subset DFA’s start state?",
      machine: NFA_ENDS_00,
      options: ["{q<sub>0</sub>}", "{q<sub>1</sub>}", "{q<sub>0</sub>, q<sub>1</sub>}", "{q<sub>0</sub>, q<sub>1</sub>, q<sub>2</sub>}"],
      answer: 2,
      explain: "E(q<sub>0</sub>) = {q<sub>0</sub>, q<sub>1</sub>}: q<sub>0</sub> itself, plus q<sub>1</sub> through the ε-arrow. q<sub>2</sub> needs a 0 to reach.",
    },
    {
      type: "mc",
      lec: [2],
      q: "How is the correctness of the subset construction proved in lecture?",
      options: ["By contradiction, using the pumping lemma", "By induction on the length of w, showing both machines reach the same set", "By trying every string up to length n", "By the pigeonhole principle"],
      answer: 1,
      explain: "The lemma δ̂<sub>NFA</sub>(q<sub>start</sub>, w) = δ̂<sub>DFA</sub>(q′<sub>start</sub>, w) is proved by induction on |w|. Acceptance then matches because F′ is exactly the sets that meet F.",
    },
  ],
});
})();
