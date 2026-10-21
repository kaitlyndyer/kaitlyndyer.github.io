(function () {
"use strict";

registerConcept({
  id: "church-turing",
  oneLiner:
    "Extra tapes, random access, and nondeterminism make Turing machines <b>faster or easier to program</b>, but never more powerful. That robustness is why “TM” is a stand-in for “algorithm.”",

  related: ["turing-machines", "nfa-to-dfa"],

  summary: {
    keyPoints: [
      { lec: [6], html: "TMs can <b>compute functions</b>, not just accept languages: the output is what’s left on the tape when the machine halts (like n ↦ n + 1 in binary)." },
      { lec: [6], html: "<b>Multi-tape TMs</b> are no more powerful: one tape can hold all k tapes side by side, separated by #, with a mark on each simulated head’s cell." },
      { lec: [6], html: "<b>Random-access TMs</b> are no more powerful: store memory as (location, value) pairs on a tape and scan for the right location." },
      { lec: [6], html: "<b>Nondeterministic TMs</b> accept if <b>some</b> branch accepts. A deterministic TM can search the tree of branches breadth-first, so they recognize the same languages (but the simulation may take exponentially longer)." },
      { lec: [6], html: "<b>Church–Turing thesis:</b> any algorithm, in the informal sense, can be carried out by a Turing machine. It’s not a theorem: “algorithm” has no formal definition to prove it against." },
      { lec: [6], html: "Anything can be <b>encoded as a string</b>: ⟨n⟩ for a number, ⟨G⟩ for a graph, ⟨M⟩ for a TM. So TMs can take other machines as input." },
      { lec: [6], html: "The <b>universal TM</b> U takes ⟨M⟩ and w and runs M on w: it accepts if M accepts, rejects if M rejects, and <b>loops if M loops</b>." },
      { lec: [6], kind: "key", html: "From now on we can describe a TM with high-level pseudocode. If a human can follow the steps, a TM can carry them out." },
      { lec: [6], kind: "warn", html: "“More features” changes speed, not power. None of these variants recognizes a language a plain one-tape TM can’t." },
    ],
    compare: {
      head: ["Variant", "Extra feature", "How a plain TM simulates it", "Cost"],
      rows: [
        ["Multi-tape", "k tapes, k heads", "All tapes on one, separated by #, heads marked", "Each step scans the whole tape"],
        ["Random access", "Read/write R[location] directly", "List of (location, value) pairs; scan for a match", "Each access scans the list"],
        ["Nondeterministic", "Several possible moves per step", "Breadth-first search of the branch tree", "Possibly exponential time"],
      ],
    },
  },

  details: [
    {
      id: "functions",
      title: "Computing functions",
      lec: [6],
      html: `
        <p>A TM computes a function f if, started with ⟨x⟩ on the tape, it halts with ⟨f(x)⟩ on the tape. For example, adding 1 to a binary number:</p>
        <ol>
          <li>Mark the leftmost cell (say with #) and remember the bit that was there, so the head can find the left end later.</li>
          <li>Walk right to the last bit.</li>
          <li>Walk back to the left with a carry that starts at 1: at each bit x, write (x + carry) mod 2 and keep the carry if x + carry = 2.</li>
          <li>At the left end, restore the first bit (adding the carry). If a carry is still left over, shift everything right one cell and write a 1 in front.</li>
        </ol>
        <p>Binary addition a + b works the same way with extra tapes: copy a and b onto two work tapes, lowest bit first, then add bit by bit with a carry and write the answer on the main tape.</p>`,
    },
    {
      id: "multi-tape",
      title: "Multi-tape TMs",
      lec: [6],
      html: `
        <p>A <b>k-tape TM</b> has k tapes, each with its own head. The input starts on tape 1 and the others are blank. One transition reads all k symbols under the heads and, for each tape, writes a symbol and moves:</p>
        <p class="callout key">δ : Q × Γ<sup>k</sup> → Q × Γ<sup>k</sup> × {L, R}<sup>k</sup></p>
        <h4>Compiling it down to one tape</h4>
        <ul>
          <li>Store all k tapes one after another on a single tape, separated by #.</li>
          <li>Mark where each head is by using an “underlined” copy of the symbol in that cell (so Γ gets bigger).</li>
          <li>To simulate one step, sweep the whole tape once to read the k marked symbols, then sweep again to write and move the marks.</li>
          <li>If one simulated tape needs more room, shift everything to its right over by one cell.</li>
        </ul>
        <p>So any language a k-tape TM recognizes (or decides), a one-tape TM does too. It’s just slower.</p>`,
    },
    {
      id: "random-access",
      title: "Random-access TMs",
      lec: [6],
      html: `
        <p>A <b>random-access TM</b> can read or write any memory cell R[i] directly, without walking there. Besides the input tape, it has a <b>location</b> tape and a <b>value</b> tape, plus special transitions: “write” sets R[location] = value, and “read” copies R[location] onto the value tape.</p>
        <h4>Simulating it with a multi-tape TM</h4>
        <ul>
          <li>Keep memory on a tape as a list of pairs (location<sub>1</sub>, value<sub>1</sub>), (location<sub>2</sub>, value<sub>2</sub>), …</li>
          <li><b>Read:</b> scan the list for the location; copy its value to the value tape, or a blank if it’s not there.</li>
          <li><b>Write:</b> scan for the location and replace its value, or add a new pair at the end.</li>
        </ul>
        <p>This is the bridge to real computers: assembly code runs on a random-access machine, and every programming language compiles to assembly.</p>`,
    },
    {
      id: "nondeterministic",
      title: "Nondeterministic TMs",
      lec: [6],
      html: `
        <p>A <b>nondeterministic TM</b> may have several possible moves at each step:</p>
        <p class="callout key">δ : Q × Γ → 𝒫(Q × Γ × {L, R})</p>
        <ul>
          <li>It <b>accepts</b> if <b>some</b> way of making the choices reaches q<sub>accept</sub>.</li>
          <li>It <b>rejects</b> if <b>every</b> branch rejects.</li>
        </ul>
        <h4>Simulating it deterministically</h4>
        <p>Picture all the runs as a tree of configurations: each node’s children are the configurations it can move to. A deterministic TM explores this tree <b>breadth-first</b>, level by level, and accepts as soon as it finds an accepting configuration.</p>
        <p class="callout warn">Use breadth-first, not depth-first. Depth-first could dive down one branch that loops forever and never reach an accepting branch next to it.</p>
        <p>If the nondeterministic TM runs for n steps with at most b choices per step, the tree can have about b<sup>n</sup> nodes, so the simulation can take <b>exponentially</b> longer. Same power, possibly much more time. (Compare NFA → DFA: same languages, possibly exponentially more states.)</p>`,
    },
    {
      id: "thesis",
      title: "How powerful are TMs? The Church–Turing thesis",
      lec: [6],
      html: `
        <p><b>Theorem:</b> any function computable in a programming language like Java, C++, or LISP is computable by a TM. Proof sketch: every program compiles to assembly code; assembly instructions can be carried out by a random-access TM; and a random-access TM can be simulated by an ordinary TM.</p>
        <p><b>Church–Turing thesis:</b> any “algorithm” in the informal, intuitive sense can be implemented on a Turing machine.</p>
        <p class="callout warn">The thesis is not a theorem. “Algorithm” in the informal sense has no precise definition, so there’s nothing to prove it against. It’s supported by evidence: every reasonable model anyone has proposed (λ-calculus, recursive functions, multi-tape and random-access machines, real programming languages) turns out to be equivalent to TMs.</p>
        <h4>Some history</h4>
        <p>In 1928, Hilbert asked for an algorithm that decides whether any mathematical statement is true (the <i>Entscheidungsproblem</i>). Between 1931 and 1936, Gödel (recursive functions), Church (λ-calculus), and Turing (Turing machines) each gave a definition of “algorithm” and showed no such algorithm exists. Their three definitions turned out to be equivalent.</p>
        <h4>Why bother with TMs instead of Java?</h4>
        <p>They’re simple: it’s striking how little is needed for general computation. And their simplicity makes them easier to reason about in proofs, partly because each step is <b>local</b> (see below).</p>`,
    },
    {
      id: "encodings",
      title: "Encodings: anything can be an input",
      lec: [6],
      html: `
        <p>TMs only read strings, but anything can be <b>encoded</b> as a string. ⟨O⟩ means “some fixed encoding of the object O as a string.”</p>
        <ul>
          <li>⟨n⟩ for an integer: its binary representation.</li>
          <li>⟨G⟩ for a graph: an edge list per vertex, a 0/1 adjacency matrix, … Any reasonable choice works.</li>
          <li>⟨M⟩ for a TM: write out its 7-tuple as a string.</li>
        </ul>
        <p>That lets us ask about much richer languages than {0<sup>n</sup>1<sup>n</sup>}:</p>
        <ul>
          <li>{ ⟨p⟩ | p is a prime number }</li>
          <li>{ ⟨G⟩ | G is a connected graph }</li>
          <li>{ ⟨M⟩ | M is a TM that halts on the empty input }</li>
        </ul>
        <p>With the Church–Turing thesis, we describe a TM for such a language with pseudocode. For example, a decider for {0<sup>n</sup>1<sup>n</sup>}: “check that w ∈ 0*1*, otherwise reject; count the 0s and the 1s; accept if the counts are equal, otherwise reject.”</p>`,
    },
    {
      id: "universal",
      title: "The universal Turing machine",
      lec: [6],
      html: `
        <p>There is a single TM <b>U</b> that can run any other TM. On input ⟨M, w⟩, U simulates M on w:</p>
        <ul>
          <li>if M accepts w, U accepts;</li>
          <li>if M rejects w, U rejects;</li>
          <li>if M loops on w, U loops too.</li>
        </ul>
        <p class="callout key">U is like an interpreter (or a general-purpose computer): the program ⟨M⟩ is just more input. Because U loops whenever M does, U <b>recognizes</b> { ⟨M, w⟩ | M accepts w } but isn’t automatically a decider for it.</p>`,
    },
    {
      id: "locality",
      title: "Locality of TM steps",
      lec: [6],
      html: `
        <p>One step of a TM only touches the cell under the head and moves the head by one. So to check whether configuration C yields C′, you can line them up and check every small window (2 rows × 3 cells) for consistency with δ. No window needs to see the whole tape.</p>
        <p>This depends on memory being a tape. In Java, any line could change any memory location, so there’s no such local check. Locality is one reason TMs show up in later proofs about what can’t be computed.</p>`,
    },
  ],

  flashcards: [
    { front: "Multi-tape TM: more powerful?", back: "No. One tape stores all k tapes separated by #, with marked symbols for the head positions. Slower, same languages." },
    { front: "Transition function of a k-tape TM", back: "δ : Q × Γ<sup>k</sup> → Q × Γ<sup>k</sup> × {L, R}<sup>k</sup>" },
    { front: "Random-access TM: how to simulate?", back: "Keep memory as (location, value) pairs on a tape; scan for the location on each read or write." },
    { front: "When does a nondeterministic TM accept? Reject?", back: "Accept: <b>some</b> branch accepts. Reject: <b>every</b> branch rejects." },
    { front: "Nondeterministic TM → deterministic TM", back: "Breadth-first search of the tree of configurations. Same languages; possibly exponentially more time." },
    { front: "Why breadth-first, not depth-first?", back: "Depth-first could follow one infinite branch forever and miss an accepting branch." },
    { front: "Church–Turing thesis", back: "Every algorithm (informal sense) can be implemented by a Turing machine. Not provable: “algorithm” isn’t formally defined." },
    { front: "⟨O⟩", back: "A string encoding of the object O: a number, a graph, a TM, …" },
    { front: "Universal TM U(⟨M⟩, w)", back: "Runs M on w: accepts if M accepts, rejects if M rejects, loops if M loops." },
    { front: "Locality of TM computation", back: "Whether C yields C′ can be checked with small 2 × 3 windows, because a step only changes cells next to the head." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [6],
      q: "What does adding a second tape to a Turing machine change?",
      options: ["It can now recognize non-recognizable languages", "It can decide languages no one-tape TM can decide", "It can be faster and easier to program, but recognizes the same languages", "It can no longer loop"],
      answer: 2,
      explain: "A one-tape TM can simulate k tapes by storing them side by side with marked head positions. The variant is more convenient, not more powerful.",
    },
    {
      type: "mc",
      lec: [6],
      q: "How does a deterministic TM simulate a nondeterministic one?",
      options: ["Pick one branch at random", "Depth-first search of the branch tree", "Breadth-first search of the branch tree", "It can’t; nondeterministic TMs are more powerful"],
      answer: 2,
      explain: "Breadth-first search reaches any accepting configuration at a finite depth. Depth-first could get lost forever in a looping branch.",
    },
    {
      type: "mc",
      lec: [6],
      q: "Why can’t the Church–Turing thesis be proved?",
      options: ["Because it’s false", "Because nobody has tried hard enough", "Because “algorithm” in the informal sense has no precise definition", "Because Turing machines have infinite tapes"],
      answer: 2,
      explain: "A proof needs both sides defined formally. TMs are formal; “any algorithm” is an intuitive idea. The thesis is supported by evidence, not proof.",
    },
    {
      type: "mc",
      lec: [6],
      q: "The universal TM U is given ⟨M, w⟩, and M loops on w. What does U do?",
      options: ["Rejects", "Accepts", "Loops", "Detects the loop and halts"],
      answer: 2,
      explain: "U just runs M on w step by step. If M never halts, neither does U.",
    },
    {
      type: "mc",
      lec: [6],
      q: "A nondeterministic TM N runs on input w. One branch loops, one rejects, and one accepts. What does N do on w?",
      options: ["Accepts", "Rejects", "Loops", "It depends on which branch runs first"],
      answer: 0,
      explain: "A nondeterministic TM accepts if <b>any</b> branch accepts. The looping and rejecting branches don’t matter.",
    },
    {
      type: "tf",
      lec: [6],
      q: "True or false: a TM can take another TM as its input.",
      answer: true,
      explain: "Any TM M can be encoded as a string ⟨M⟩ (its 7-tuple written out), and strings are exactly what TMs read.",
    },
    {
      type: "tf",
      lec: [6],
      q: "True or false: simulating a random-access TM with an ordinary TM changes which languages can be recognized.",
      answer: false,
      explain: "An ordinary TM keeps memory as (location, value) pairs and scans for each access. Same languages, just slower.",
    },
  ],
});
})();
