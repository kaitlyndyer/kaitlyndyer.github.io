(function () {
"use strict";

const B = "␣";

// Machine A: rewrite every bit, accept at the first blank. Decides Σ*.
const TM_FLIP = {
  states: { q0: [150, 130, { loop: -90 }], qacc: [380, 130] },
  start: "q0", accept: "qacc", reject: "qrej",
  input: ["0", "1"], tape: ["0", "1", B],
  delta: { q0: { "0": ["q0", "1", "R"], "1": ["q0", "0", "R"], [B]: ["qacc", B, "R"] } },
};

// Machine B: {0ⁿ1ⁿ}. Cross off a 0 (x) and a matching 1 (y), go back, repeat.
const TM_0N1N = {
  states: {
    q1: [80, 130, { loop: 180 }], q2: [280, 130, { loop: 0 }], q3: [180, 30, { loop: -90 }],
    q4: [180, 240, { loop: 90 }], qacc: [400, 240],
  },
  start: "q1", accept: "qacc", reject: "qrej",
  input: ["0", "1"], tape: ["0", "1", "x", "y", B],
  delta: {
    q1: { "0": ["q2", "x", "R"], "y": ["q4", "y", "R"], [B]: ["qacc", B, "R"] },
    q2: { "0": ["q2", "0", "R"], "y": ["q2", "y", "R"], "1": ["q3", "y", "L"] },
    q3: { "0": ["q3", "0", "L"], "y": ["q3", "y", "L"], "x": ["q1", "x", "R"] },
    q4: { "y": ["q4", "y", "R"], [B]: ["qacc", B, "R"] },
  },
};

// Machine C: {0^(2ⁿ)}. Cross off every other 0; if one 0 is left, accept; if an odd number (> 1) is left, reject.
const TM_POW2 = {
  states: {
    q1: [60, 60], q2: [210, 60, { loop: -90 }], q3: [380, 60, { loop: -90 }],
    q4: [380, 230, { loop: 90 }], q5: [210, 230, { loop: 90 }], qacc: [60, 230],
  },
  start: "q1", accept: "qacc", reject: "qrej",
  input: ["0"], tape: ["0", "x", B],
  delta: {
    q1: { "0": ["q2", B, "R"] },
    q2: { "x": ["q2", "x", "R"], [B]: ["qacc", B, "R"], "0": ["q3", "x", "R"] },
    q3: { "x": ["q3", "x", "R"], "0": ["q4", "0", "R"], [B]: ["q5", B, "L"] },
    q4: { "x": ["q4", "x", "R"], "0": ["q3", "x", "R"] },
    q5: { "0": ["q5", "0", "L"], "x": ["q5", "x", "L"], [B]: ["q2", B, "R"] },
  },
};

// Machine D: accepts 0*, but runs right forever once it sees a 1. Recognizes 0* without deciding it.
const TM_LOOP = {
  states: { q1: [140, 130, { loop: -90 }], qacc: [380, 50], q2: [380, 210, { loop: 90 }] },
  start: "q1", accept: "qacc", reject: "qrej",
  input: ["0", "1"], tape: ["0", "1", B],
  delta: {
    q1: { "0": ["q1", "0", "R"], [B]: ["qacc", B, "R"], "1": ["q2", "1", "R"] },
    q2: { "0": ["q2", "0", "R"], "1": ["q2", "1", "R"], [B]: ["q2", B, "R"] },
  },
};

registerConcept({
  id: "turing-machines",
  oneLiner:
    "A Turing machine is a finite-state control with an <b>infinite tape</b> it can read, write, and move along in both directions. It’s our formal model of an algorithm.",

  related: ["dfa", "church-turing", "pumping"],

  summary: {
    keyPoints: [
      { lec: [5], html: "A <b>Turing machine (TM)</b> is like a DFA with an infinite tape. The input starts on the tape followed by blanks (␣), and the head starts on the leftmost cell." },
      { lec: [5], html: "Each step depends on the <b>state</b> and the <b>symbol under the head</b>. The machine <b>writes</b> a symbol, moves the head <b>L or R</b>, and changes state: δ(q, a) = (r, b, L)." },
      { lec: [5], html: "There’s one <b>accept state</b> and one <b>reject state</b>. Entering either one halts the machine immediately, even in the middle of the input." },
      { lec: [5], html: "On any input, a TM does one of three things: <b>accept</b>, <b>reject</b>, or <b>loop</b> (run forever)." },
      { lec: [5], html: "A <b>configuration</b> u q v captures one moment: the state is q, the tape is uv (then blanks), and the head is on the <b>first symbol of v</b>." },
      { lec: [5], html: "L(M) = { w | M accepts w }. M <b>recognizes</b> L(M). M <b>decides</b> L if it accepts every w ∈ L and <b>rejects</b> every w ∉ L, so it always halts." },
      { lec: [5], kind: "warn", html: "Recognizing is weaker than deciding: a recognizer may <b>loop</b> on strings outside L. A string M loops on is not in L(M)." },
      { lec: [5], kind: "key", html: "Every regular language is decidable (a TM can just simulate the DFA), and some non-regular languages like {0<sup>n</sup>1<sup>n</sup>} are decidable too. TMs are strictly more powerful than DFAs." },
      { lec: [5], kind: "tip", html: "Nobody writes full state diagrams for big TMs. A <b>tape-head level description</b> (how the head walks and what it writes) is enough." },
    ],
    compare: {
      head: ["", "DFA", "Turing machine"],
      rows: [
        ["Memory", "Only its finite states", "Finite states + an infinite tape"],
        ["Head moves", "Right only, one symbol per step", "Left or right"],
        ["Writes?", "No", "Yes, any symbol of Γ"],
        ["When it stops", "After the last input symbol", "Only on entering q<sub>accept</sub> or q<sub>reject</sub>; may never stop"],
        ["Outcomes", "Accept or reject", "Accept, reject, or loop"],
        ["Recognize vs decide", "The same thing", "Different: recognizers may loop"],
      ],
    },
  },

  details: [
    {
      id: "model",
      title: "The model: a DFA with a tape",
      lec: [5],
      html: `
        <p>DFAs have a hard limit: they only remember which of finitely many states they’re in. That’s why they can’t handle {0<sup>n</sup>1<sup>n</sup>}. A Turing machine keeps the finite control but adds an <b>infinite tape</b> it can use as scratch memory.</p>
        <ul>
          <li>At the start, the tape holds the input w, one symbol per cell, followed by blanks <b>␣</b> forever. The head is on the leftmost cell.</li>
          <li>In each step the machine looks at its state and the symbol under the head, then <b>writes</b> a symbol in that cell, moves the head one cell <b>left or right</b>, and moves to a new state.</li>
          <li>If it tries to move left from the leftmost cell, the head <b>stays where it is</b>.</li>
          <li>It can write extra symbols that aren’t in the input alphabet (like x to cross off a symbol).</li>
          <li>Entering the <b>accept</b> or <b>reject</b> state halts it on the spot. It doesn’t have to read the whole input.</li>
        </ul>
        <p class="callout tip">In a diagram, an arrow labeled <b>0 → x, R</b> means “reading 0, write x and move right.” A label like <b>0, y → R</b> is shorthand for “reading 0 or y, leave it alone and move right.” A missing arrow means the machine rejects.</p>`,
    },
    {
      id: "formal",
      title: "Formal definition",
      lec: [5],
      html: `
        <p>A Turing machine is a 7-tuple <b>M = (Q, Σ, Γ, δ, q<sub>start</sub>, q<sub>accept</sub>, q<sub>reject</sub>)</b>:</p>
        <ul>
          <li><b>Q</b>: a finite set of states.</li>
          <li><b>Σ</b>: the input alphabet. It does <b>not</b> contain the blank.</li>
          <li><b>Γ</b>: the tape alphabet, with <b>Σ ⊆ Γ</b> and the blank ␣ ∈ Γ.</li>
          <li><b>δ : Q′ × Γ → Q × Γ × {L, R}</b>, where Q′ = Q − {q<sub>accept</sub>, q<sub>reject</sub>}. Input: current state and symbol read. Output: next state, symbol to write, direction.</li>
          <li><b>q<sub>start</sub></b>, <b>q<sub>accept</sub></b>, <b>q<sub>reject</sub></b> ∈ Q, with q<sub>accept</sub> ≠ q<sub>reject</sub>.</li>
        </ul>
        <p class="callout key">The blank can’t be in Σ, because the blank is how the machine finds where the input ends. And δ isn’t defined on the two halting states, because there’s no “next move” after halting.</p>`,
    },
    {
      id: "configurations",
      title: "Configurations",
      lec: [5],
      html: `
        <p>A <b>configuration</b> is a snapshot with everything needed to continue: the current state, the tape contents, and the head position. We write it as <b>u q v</b> with u, v ∈ Γ* and q ∈ Q:</p>
        <ul>
          <li>the machine is in state q,</li>
          <li>the tape holds uv followed by blanks, and</li>
          <li>the head is on the <b>first symbol of v</b>.</li>
        </ul>
        <p>Example: <b>1x q<sub>3</sub> 0y</b> means state q<sub>3</sub>, tape 1x0y␣␣…, head on the 0.</p>
        <h4>One step (“C yields C′”)</h4>
        <p>Say the head reads b and δ(q, b) = (q′, b′, dir):</p>
        <ul>
          <li><b>Moving right:</b> u q bw yields u b′ q′ w.</li>
          <li><b>Moving left:</b> ua q bw yields u q′ a b′ w.</li>
          <li><b>Moving left at the left end:</b> q bw yields q′ b′w (the head stays put).</li>
        </ul>
        <p>The <b>start configuration</b> on input w is q<sub>start</sub> w. A configuration is <b>accepting</b> or <b>rejecting</b> if its state is q<sub>accept</sub> or q<sub>reject</sub>.</p>`,
    },
    {
      id: "computation",
      title: "Accept, reject, or loop",
      lec: [5],
      html: `
        <p>M <b>accepts</b> w if there’s a sequence of configurations C<sub>1</sub>, C<sub>2</sub>, …, C<sub>n</sub> where C<sub>1</sub> is the start configuration on w, each C<sub>i</sub> yields C<sub>i+1</sub>, and C<sub>n</sub> is accepting. <b>Rejects</b> is the same with a rejecting C<sub>n</sub>.</p>
        <p>Unlike a DFA, a TM might do neither: it can run forever without entering either halting state. That’s called <b>looping</b>. It doesn’t have to repeat a configuration to loop; it can wander off to the right forever, for example.</p>
        <p class="callout warn">Looping is not rejecting. If M loops on w, then M doesn’t accept w, so w ∉ L(M), but M never <b>says</b> no either.</p>`,
    },
    {
      id: "recognize-decide",
      title: "Recognizing vs deciding",
      lec: [5],
      html: `
        <p>The <b>language of M</b> is L(M) = { w | M accepts w }, and we say M <b>recognizes</b> L(M).</p>
        <p>M <b>decides</b> L if M accepts every w ∈ L <b>and rejects</b> every w ∉ L. Equivalently, M recognizes L <b>and</b> halts on every input.</p>
        <ul>
          <li>L is <b>recognizable</b> if some TM recognizes it.</li>
          <li>L is <b>decidable</b> if some TM decides it.</li>
          <li>Every decidable language is recognizable (a decider is a recognizer).</li>
        </ul>
        <h4>Proving “M recognizes L”</h4>
        <p>Showing that M accepts every string in L isn’t enough: a machine that accepts everything does that for any L. You need both directions:</p>
        <ol>
          <li>every w ∈ L is accepted by M, and</li>
          <li>every w accepted by M is in L (equivalently: every w ∉ L is <b>not</b> accepted).</li>
        </ol>
        <h4>Why DFAs don’t have this distinction</h4>
        <p>A DFA always halts after reading its input, so it never loops: anything a DFA recognizes, it decides. TMs can loop, so recognizing and deciding come apart. Machine D in the playground recognizes 0* but doesn’t decide it: it runs forever on any string containing a 1.</p>
        <p class="callout key">Every regular language is decidable: a TM can simulate the DFA by moving right one symbol at a time and halting at the first blank.</p>`,
    },
    {
      id: "describing",
      title: "Describing a TM: tape-head level",
      lec: [5],
      html: `
        <p>Formal 7-tuples and full state diagrams get huge fast, so we rarely write them. Instead we give a <b>tape-head level description</b>: how the head walks across the tape and what it writes. The machine’s states act like a small memory of fixed size that can’t grow with the input.</p>
        <h4>{0<sup>2<sup>n</sup></sup> | n ≥ 0}: lengths that are powers of 2</h4>
        <ol>
          <li>Sweep left to right, crossing off every other 0.</li>
          <li>If exactly one 0 was on the tape, accept.</li>
          <li>Otherwise, if the number of 0s was odd, reject.</li>
          <li>Otherwise, return the head to the left end and repeat.</li>
        </ol>
        <p>Each sweep halves the number of 0s, so the count keeps halving evenly down to 1 exactly when it was a power of 2. (Machine C in the playground.)</p>
        <h4>{w#w | w ∈ {0,1}*}: two copies separated by #</h4>
        <ol>
          <li>Cross off the first unmarked symbol left of #, remembering it in the state.</li>
          <li>Move right past # to the first unmarked symbol there. If it’s different (or missing), reject. Otherwise cross it off.</li>
          <li>Return left and repeat. When everything left of # is crossed off, check that nothing unmarked is left on the right; accept if so, reject if not.</li>
        </ol>
        <h4>{0<sup>n</sup>1<sup>n</sup> | n ≥ 0}</h4>
        <p>Machine B zigzags: cross off a 0 as x, run right to the first 1 and cross it off as y, run back to the x, step right, and repeat. When no 0s are left, check that only y’s remain.</p>`,
    },
  ],

  playground: [
    {
      id: "run",
      title: "Run a Turing machine",
      lec: [5],
      intro: `<p>Step a TM through its input and watch the head move both ways and write on the tape. The <b>Configurations</b> box lists u q v after each step. Try Machine D on a string with a 1 to see a machine that never halts.</p>`,
      widget: "tm-runner",
      config: {
        machines: [
          { id: "flip", name: "Machine A", lang: "Accepts every string (L(M) = Σ*), after rewriting each 0 as 1 and each 1 as 0.", machine: TM_FLIP, examples: ["0110", "1", ""] },
          { id: "0n1n", name: "Machine B", lang: "L(M) = { 0<sup>n</sup>1<sup>n</sup> | n ≥ 0 }. It always halts, so it <b>decides</b> this non-regular language.", machine: TM_0N1N, examples: ["0011", "001", "0101", "", "000111"] },
          { id: "pow2", name: "Machine C", lang: "L(M) = { 0<sup>2<sup>n</sup></sup> | n ≥ 0 }: strings of 0s whose length is a power of 2. Σ = {0}.", machine: TM_POW2, examples: ["0000", "000", "0", "00000000", "000000"] },
          { id: "loop", name: "Machine D", lang: "L(M) = 0*. On any string with a 1, it runs right forever. It <b>recognizes</b> 0* but doesn’t <b>decide</b> it.", machine: TM_LOOP, examples: ["000", "0010", ""] },
        ],
      },
    },
  ],

  flashcards: [
    { front: "Turing machine (informally)", back: "A finite-state control plus an infinite tape. Each step reads the symbol under the head, writes a symbol, moves L or R, and changes state." },
    { front: "The 7-tuple of a TM", back: "(Q, Σ, Γ, δ, q<sub>start</sub>, q<sub>accept</sub>, q<sub>reject</sub>), with Σ ⊆ Γ, ␣ ∈ Γ, ␣ ∉ Σ." },
    { front: "δ for a TM", back: "δ : Q′ × Γ → Q × Γ × {L, R}, with Q′ = Q − {q<sub>accept</sub>, q<sub>reject</sub>}. (state, read) ↦ (next state, write, move)." },
    { front: "Configuration u q v", back: "State q, tape uv followed by blanks, head on the <b>first symbol of v</b>." },
    { front: "Three possible outcomes of running a TM", back: "Accept, reject, or <b>loop</b> (never halt)." },
    { front: "Moving left at the left end", back: "The head stays where it is. The machine doesn’t crash." },
    { front: "L(M)", back: "{ w | M accepts w }. M <b>recognizes</b> L(M). Strings M loops on are not in L(M)." },
    { front: "M decides L", back: "M accepts every w ∈ L and rejects every w ∉ L. So M recognizes L <b>and</b> always halts." },
    { front: "Recognizable vs decidable", back: "Recognizable: some TM accepts exactly L (may loop on others). Decidable: some TM accepts L and rejects everything else. Decidable ⇒ recognizable." },
    { front: "Why is recognize = decide for DFAs?", back: "A DFA always halts after reading its input, so it can never loop." },
    { front: "Is every regular language decidable?", back: "Yes. A TM can simulate the DFA: move right reading each symbol, then accept or reject at the first blank." },
    { front: "Tape-head level description", back: "Describe how the head moves and what it writes, instead of listing states and transitions." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [5],
      q: "A TM is in state q<sub>2</sub> reading 0, and δ(q<sub>2</sub>, 0) = (q<sub>5</sub>, x, L). What happens?",
      options: ["It writes 0, moves left, and goes to q<sub>5</sub>", "It writes x, moves left, and goes to q<sub>5</sub>", "It moves left, then writes x in the new cell", "It goes to q<sub>5</sub> without changing the tape"],
      answer: 1,
      explain: "δ gives (next state, symbol to write, direction). The machine writes x in the <b>current</b> cell, then moves left, then is in q<sub>5</sub>.",
    },
    {
      type: "mc",
      lec: [5],
      q: "In the configuration <b>01 q<sub>4</sub> x1</b>, which symbol is under the head?",
      options: ["The 1 just before q<sub>4</sub>", "x", "The last 1", "A blank"],
      answer: 1,
      explain: "In u q v the head is on the first symbol of v. Here v = x1, so the head reads x.",
    },
    {
      type: "mc",
      lec: [5],
      q: "Which statement about a TM M that <b>recognizes</b> L is guaranteed?",
      options: ["M halts on every input", "M rejects every string not in L", "M accepts exactly the strings in L", "M loops on every string not in L"],
      answer: 2,
      explain: "Recognizing means L(M) = L: M accepts exactly the strings in L. On strings outside L, M may reject <b>or</b> loop; nothing forces either.",
    },
    {
      type: "mc",
      lec: [5],
      q: "Why must the blank symbol ␣ not be in the input alphabet Σ?",
      options: ["So the tape can be infinite", "So the machine can tell where the input ends", "Because ␣ means “reject”", "Because Γ must be smaller than Σ"],
      answer: 1,
      explain: "The input is followed by blanks. If ␣ could appear inside an input, the machine couldn’t tell the end of the input from a blank in the middle.",
    },
    {
      type: "mc",
      lec: [5],
      q: "Machine M always accepts, so L(M) = Σ*. Someone claims “M recognizes L = {1}” because M accepts every string in {1}. What’s wrong?",
      options: ["Nothing; M does recognize {1}", "M also accepts strings outside {1}, so L(M) ≠ {1}", "M has to reject 1", "A TM can’t recognize a finite language"],
      answer: 1,
      explain: "To show M recognizes L, you need both directions: everything in L is accepted, <b>and</b> everything accepted is in L. M accepts 0, 11, … too, so L(M) = Σ* ≠ {1}.",
    },
    {
      type: "tf",
      lec: [5],
      q: "True or false: if a TM halts and accepts, it must have read every symbol of its input first.",
      answer: false,
      explain: "Entering q<sub>accept</sub> halts immediately, wherever the head is. A TM can accept after looking at just the first symbol.",
    },
    {
      type: "tf",
      lec: [5],
      q: "True or false: {0<sup>n</sup>1<sup>n</sup> | n ≥ 0} is decidable.",
      answer: true,
      explain: "It isn’t regular, but a TM can cross off matching 0s and 1s (or count them) and always halts, so it decides the language.",
    },
    {
      type: "tf",
      lec: [5],
      q: "True or false: if M loops on input w, then w ∉ L(M).",
      answer: true,
      explain: "L(M) is the set of strings M accepts. Looping isn’t accepting, so w ∉ L(M), even though M never rejects w either.",
    },
    {
      type: "tf",
      lec: [5],
      q: "True or false: every language a TM recognizes is also decided by that same TM.",
      answer: false,
      explain: "A recognizer can loop on strings outside its language, and a decider can’t. Machine D in the playground recognizes 0* but loops on 1.",
    },
  ],
});
})();
