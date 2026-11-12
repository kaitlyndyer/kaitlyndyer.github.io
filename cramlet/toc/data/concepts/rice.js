(function () {
"use strict";

// Rice's theorem (lecture 9). Every example, prompt and machine here is new (none from the problem sets or exams).
const sb = s => `<sub>${s}</sub>`;
const ATM = `A${sb("TM")}`;
const LANG = ["Only on L(M)", "On the machine itself"];

// ---------- Picture: a property must take or leave whole "same-language" bubbles ----------
// Each bubble holds machines with the same language; dots show the machine's number of states.
const dot = (x, y, n, on) => `<g class="rb-dot${on ? " on" : ""}"><circle cx="${x}" cy="${y}" r="15"/><text x="${x}" y="${y + 5}">${n}</text></g>`;
const bubble = (cx, label, on, dots) => `
  <g class="rb-bubble${on === true ? " on" : on === false ? " off" : ""}">
    <ellipse cx="${cx}" cy="92" rx="62" ry="58"/>
    <text class="rb-lab" x="${cx}" y="22">${label}</text>
    ${dots}
  </g>`;
const BUBBLES = `
<div class="rb-figs" role="group" aria-label="Two properties drawn over machines grouped by language">
  <figure class="rb-fig good">
    <svg viewBox="0 0 400 158" role="img" aria-label="Property: L(M) is regular. It takes the whole empty-language bubble and the whole all-strings bubble, and leaves the whole 0^n1^n bubble.">
      ${bubble(68, "L(M) = ∅", true, dot(48, 80, 1, true) + dot(88, 80, 7, true) + dot(68, 118, 3, true))}
      ${bubble(200, "L(M) = Σ*", true, dot(180, 80, 1, true) + dot(220, 80, 12, true) + dot(200, 118, 4, true))}
      ${bubble(332, "L(M) = {0ⁿ1ⁿ}", false, dot(312, 80, 6, false) + dot(352, 80, 9, false) + dot(332, 118, 15, false))}
    </svg>
    <figcaption><b class="rb-ok">✓ “L(M) is regular”</b> takes or leaves each bubble <b>whole</b>. It only cares about the language.</figcaption>
  </figure>
  <figure class="rb-fig bad">
    <svg viewBox="0 0 400 158" role="img" aria-label="Property: M has at most 4 states. It splits every bubble: some machines with the same language are in, others are out.">
      ${bubble(68, "L(M) = ∅", null, dot(48, 80, 1, true) + dot(88, 80, 7, false) + dot(68, 118, 3, true))}
      ${bubble(200, "L(M) = Σ*", null, dot(180, 80, 1, true) + dot(220, 80, 12, false) + dot(200, 118, 4, true))}
      ${bubble(332, "L(M) = {0ⁿ1ⁿ}", null, dot(312, 80, 6, false) + dot(352, 80, 9, false) + dot(332, 118, 15, false))}
    </svg>
    <figcaption><b class="rb-no">✗ “M has at most 4 states”</b> <b>splits</b> bubbles: machines with the same language land on both sides. Rice can’t be used.</figcaption>
  </figure>
</div>
<p class="rb-key"><span class="rb-dot-key on">3</span> has the property <span class="rb-dot-key">9</span> doesn’t (the number is the machine’s state count). Each bubble is every TM with that language.</p>`;

// ---------- "Your turn" boxes ----------
const langStep = (n, prop, answer, hint, why, wrong) => ({
  title: `Property ${n}`, ask: `${prop}<br>Does it depend…`, choices: LANG, keepOrder: true, answer,
  whys: answer ? [wrong, null] : [null, wrong], hint, why,
});
const TURNS = {
  property: {
    title: "Language or machine?",
    intro: "<p>For each property, ask: <b>could two TMs with the same language disagree on it?</b> If yes, it depends on the machine. If no, it depends only on L(M).</p>",
    config: {
      award: "turn:rice-lang",
      steps: [
        langStep(1, "“M accepts the string 0110.”", 0,
          "Whether 0110 is accepted is written in L(M).",
          "0110 ∈ L(M) or it isn’t. Two TMs with the same language agree on it.",
          "It’s just asking whether 0110 ∈ L(M), and that’s fixed once you know the language."),
        langStep(2, "“M has exactly 12 states.”", 1,
          "Can you add a state to a TM without changing what it accepts?",
          "Add an unreachable state: same language, one more state. So two machines with the same language can disagree.",
          "Adding an unused state changes the count but not the language."),
        langStep(3, "“L(M) is infinite.”", 0,
          "The property is stated entirely in terms of L(M).",
          "Same language ⇒ same answer. Infinite is a property of the set of strings.",
          "If L(M) = L(M′), they’re equally infinite (or not)."),
        langStep(4, "“M halts on every input.”", 1,
          "Think of two machines for the empty language ∅: one rejects every string, one loops on every string.",
          "Both have L = ∅, but only the first halts on every input. Halting is about behavior, not the language. (Rejecting and looping both mean “not in L(M)”.)",
          "L(M) only records what’s accepted. Rejecting and looping look the same in the language."),
        langStep(5, "“M accepts 0 within 5 steps.”", 1,
          "Could a slow machine and a fast machine accept the same strings?",
          "Make a copy of M that wastes 10 steps before starting. Same language, but it can’t accept anything within 5 steps. So it depends on the machine.",
          "Speed isn’t part of the language. A slowed-down copy has the same L(M)."),
      ],
      done: "The test: two TMs with the <b>same language</b> must get the <b>same answer</b>. If you can build two that disagree, Rice’s theorem doesn’t apply.",
    },
  },

  trivial: {
    title: "Trivial or not?",
    intro: "<p>Each property below depends only on L(M). Decide if it’s <b>non-trivial</b>: some TM has it <b>and</b> some TM doesn’t. Remember: every TM’s language is recognizable (by that TM).</p>",
    config: {
      award: "turn:rice-trivial",
      steps: [
        { title: "Recognizable",
          ask: "“L(M) is recognizable.”",
          choices: ["Trivial: every TM has it", "Non-trivial", "Trivial: no TM has it"], keepOrder: true, answer: 0,
          whys: [null, "Which TM could fail it? M itself recognizes L(M).", "M recognizes its own language, so every TM has it."],
          hint: "Who recognizes L(M)?",
          why: "M recognizes L(M), by definition. So every TM has the property, it’s trivial, and { ⟨M⟩ | L(M) is recognizable } is decidable: accept every valid TM encoding." },
        { title: "Decidable",
          ask: "“L(M) is decidable.”",
          choices: ["Trivial: every TM has it", "Non-trivial", "Trivial: no TM has it"], keepOrder: true, answer: 1,
          whys: ["Is the language of every TM decidable? Think of the universal TM.", null, "A TM that rejects everything has L = ∅, which is decidable."],
          hint: "Find a TM whose language is decidable, and one whose language isn’t. The universal TM U recognizes A<sub>TM</sub>.",
          why: `Some TM has it: M<sub>reject</sub> has L = ∅, which is decidable. Some TM doesn’t: the universal TM U has L(U) = ${ATM}, which is undecidable. So it’s non-trivial, and by Rice, { ⟨M⟩ | L(M) is decidable } is undecidable.` },
        { title: "Countable",
          ask: "“L(M) is countable” (finite or countably infinite).",
          choices: ["Trivial: every TM has it", "Non-trivial", "Trivial: no TM has it"], keepOrder: true, answer: 0,
          whys: [null, "Is there any language at all that is uncountable?", "Every language is a set of strings. How big can that be?"],
          hint: "Every language is a subset of Σ*. Is Σ* countable?",
          why: "Σ* is countable, and every language is a subset of it. So every L(M) is countable: trivial, and decidable." },
        { title: "Contains 01",
          ask: "“01 ∈ L(M) and 01 ∉ L(M).”",
          choices: ["Trivial: every TM has it", "Non-trivial", "Trivial: no TM has it"], keepOrder: true, answer: 2,
          whys: ["Can a string be in a set and not in it?", "It can’t be true for any language.", null],
          hint: "Read it carefully.",
          why: "No language has it, so no TM has it. Trivial, and decidable: reject every input. Trivial cuts both ways: <b>all</b> TMs or <b>none</b>." },
      ],
      done: "Non-trivial needs two witnesses: <b>one TM in, one TM out</b>. Name them in your proof.",
    },
  },

  rice: {
    title: "Write a Rice proof",
    intro: "<p>Prove that L = { ⟨M⟩ | M is a TM and L(M) contains some string of length 5 } is undecidable, using Rice’s theorem. Build it one line at a time.</p>",
    config: {
      award: "turn:rice",
      steps: [
        { title: "Name the property",
          ask: "First line of the proof?",
          choices: ["Let P = the set of TMs M such that L(M) contains some string of length 5. Then L = L<sub>P</sub>.", "Run M on every string of length 5.", "Assume L is decidable and reduce L to A<sub>TM</sub>."],
          answer: 0,
          whys: [null, "That’s an attempt at an algorithm; if M loops on one, you’re stuck. And Rice’s proof doesn’t need one.", "That’s the wrong direction, and with Rice you don’t write a reduction at all."],
          hint: "Rice’s theorem talks about a set P of TMs. Say what P is.",
          why: "Rice’s theorem is about L<sub>P</sub> = { ⟨M⟩ | M ∈ P }. Naming P makes it clear which property you’re checking." },
        { title: "Condition 1: only the language",
          ask: "Why does P depend only on the language?",
          choices: ["If L(M) = L(M′), then L(M) has a length-5 string ⇔ L(M′) does, so M ∈ P ⇔ M′ ∈ P", "Because M always halts", "Because there are 32 strings of length 5"],
          answer: 0,
          whys: [null, "M doesn’t have to halt. The property doesn’t mention halting at all.", "True, but that doesn’t show anything about two machines with the same language."],
          hint: "Take two TMs with the same language. Do they have to agree?",
          why: "The property is stated only in terms of L(M), so machines with the same language agree on it." },
        { title: "Condition 2a: a TM in P",
          ask: "Name a TM that <b>has</b> the property.",
          choices: ["A TM that accepts every string", "A TM that rejects every string", "A TM with exactly 5 states"],
          answer: 0,
          whys: [null, "Its language is ∅, which has no strings of length 5.", "The number of states has nothing to do with it. Which strings does it accept?"],
          hint: "You need L(M) to include some string like 00000.",
          why: "Its language is Σ*, which includes 00000. So it’s in P." },
        { title: "Condition 2b: a TM not in P",
          ask: "Name a TM that <b>doesn’t</b> have the property.",
          choices: ["M<sub>reject</sub>, which rejects every string (L = ∅)", "A TM that accepts only 00000", "A TM that accepts every string of length at least 5"],
          answer: 0,
          whys: [null, "00000 has length 5, so that one is in P.", "Its language includes 00000, so it’s in P."],
          hint: "The empty language is usually the easiest “out” (or “in”) witness.",
          why: "L(M<sub>reject</sub>) = ∅ has no strings at all, so M<sub>reject</sub> ∉ P. (Any TM whose language has no length-5 string works, like one accepting only 0; M<sub>reject</sub> is the simplest.)" },
        { title: "Conclude",
          ask: "So…",
          choices: ["P is a non-trivial property of the language, so by Rice’s theorem L<sub>P</sub> = L is undecidable. ∎", "P is non-trivial, so L is unrecognizable. ∎", "So L is decidable. ∎"],
          answer: 0,
          whys: [null, "Rice’s theorem gives undecidable, not unrecognizable. (In fact this L is recognizable: try all length-5 strings in parallel.)", "Both conditions hold, so Rice says the opposite."],
          hint: "What does Rice’s theorem conclude?",
          why: "Both conditions hold, so Rice’s theorem applies: L is undecidable." },
      ],
      done: "That’s a full Rice proof: <b>name P, show it depends only on L(M), name one TM in and one out, conclude.</b> Now write one on paper for { ⟨M⟩ | L(M) contains no string starting with 1 }.",
    },
  },

  limits: {
    title: "Can you use Rice here?",
    intro: "<p>For each language, decide if Rice’s theorem applies. If it doesn’t, decide what to do instead.</p>",
    config: {
      award: "turn:rice-limits",
      steps: [
        { title: "Two machines",
          ask: "{ ⟨M<sub>1</sub>, M<sub>2</sub>⟩ | L(M<sub>1</sub>) ⊆ L(M<sub>2</sub>) }",
          choices: ["Rice doesn’t apply directly: the input is a pair of machines. Prove it with a reduction from A<sub>TM</sub>", "Rice applies: it’s about languages", "It’s decidable: compare the languages"],
          answer: 0,
          whys: [null, "Rice’s theorem is about sets of single TMs, { ⟨M⟩ | M ∈ P }. A pair needs a reduction.", "You can’t compare two TM languages: they’re infinite, and the machines might loop."],
          hint: "Look at the input format. How many machines?",
          why: "Rice is stated for inputs ⟨M⟩. With two machines, write a reduction: fix M<sub>1</sub> to accept everything and let M<sub>2</sub>(x) run M(w). Then L(M<sub>1</sub>) ⊆ L(M<sub>2</sub>) ⇔ M accepts w. This is exactly the kind of problem the exam asks for." },
        { title: "A machine and a string",
          ask: "{ ⟨M⟩ | M halts on input ε }",
          choices: ["Rice doesn’t apply (halting isn’t about the language), but it’s still undecidable: reduce from HALT or A<sub>TM</sub>", "Rice applies, so it’s undecidable", "Rice doesn’t apply, so it’s decidable"],
          answer: 0,
          whys: [null, "A TM that rejects ε and one that loops on ε can have the same language. So the property isn’t language-only.", "“Rice doesn’t apply” never means “decidable.” It only means you need another proof."],
          hint: "Two TMs with ε ∉ L: one rejects ε, one loops on ε. Do they agree?",
          why: "Not language-only, so no Rice. But it’s undecidable anyway: on ⟨M, w⟩, build M′ that ignores its input and runs M on w, looping instead of rejecting. M′ halts on ε ⇔ M accepts w." },
        { title: "A step limit",
          ask: "{ ⟨M⟩ | M halts on ε within 100 steps }",
          choices: ["Decidable: simulate M on ε for 100 steps", "Undecidable by Rice", "Undecidable: it’s the halting problem"],
          answer: 0,
          whys: [null, "Step counts aren’t part of the language, so Rice doesn’t apply. And there’s a simple decider.", "The step limit makes it different: the simulation always stops."],
          hint: "Can you run M for exactly 100 steps and then stop, no matter what?",
          why: "Simulate 100 steps and check. That always halts, so it’s a decider." },
        { title: "The exam rule",
          ask: "An exam problem says: “Show L is undecidable. You may not use Rice’s theorem.” What do you write?",
          choices: [`A reduction: assume a decider D${sb("L")}, use it to build a decider for ${ATM}, and check both cases`, "Rice’s theorem anyway, since the answer is the same", "Show L is not recognizable"],
          answer: 0,
          whys: [null, "You’d lose most of the points. Use Rice only to check your answer, then write the reduction.", "Undecidable ≠ unrecognizable, and the question asks for undecidable."],
          hint: "What does Rice’s own proof do?",
          why: "Write the reduction. Rice’s proof is itself a reduction from A<sub>TM</sub> with M<sub>w</sub>(x) = M(w) && M′(x), and the same trick works for most single-machine problems." },
      ],
      done: "Rice is a <b>shortcut</b> for single-machine, language-only, non-trivial properties. Anywhere else, and whenever the exam bans it, write a reduction.",
    },
  },

  proof: {
    title: "Run the proof on a real property",
    intro: "<p>Follow the proof of Rice’s theorem for P = the TMs whose language is <b>infinite</b>. Here M<sub>w</sub>(x) = M(w) && M′(x) means: run M on w; if it accepts, run M′ on x and output that.</p>",
    config: {
      award: "turn:rice-proof",
      steps: [
        { title: "Where is M<sub>reject</sub>?",
          ask: "The proof assumes M<sub>reject</sub> ∉ P. Is that true here?",
          choices: ["Yes: L(M<sub>reject</sub>) = ∅, which is finite", "No: M<sub>reject</sub> is in P"],
          keepOrder: true, answer: 0,
          whys: [null, "∅ has 0 strings. Is that infinite?"],
          hint: "L(M<sub>reject</sub>) = ∅.",
          why: "∅ is finite, so M<sub>reject</sub> ∉ P. We can go straight on. (If it were in P, we’d run the same proof on the complement of P.)" },
        { title: "Pick M′",
          ask: "Pick M′ ∈ P.",
          choices: ["M′ accepts every string", "M′ accepts only ε", "M′ = M<sub>reject</sub>"],
          answer: 0,
          whys: [null, "{ε} is finite, so that M′ isn’t in P.", "M<sub>reject</sub> ∉ P; we need a machine in P."],
          hint: "Any TM whose language is infinite.",
          why: "L(M′) = Σ*, which is infinite. So M′ ∈ P." },
        { title: "If M accepts w",
          ask: "Suppose M accepts w. What is L(M<sub>w</sub>)?",
          choices: ["L(M′) = Σ*, so M<sub>w</sub> ∈ P", "∅, so M<sub>w</sub> ∉ P", "{w}"],
          answer: 0,
          whys: [null, "M(w) accepts, so M<sub>w</sub> goes on to run M′(x).", "M<sub>w</sub> ignores whether x = w; w is built in."],
          hint: "M(w) accepts, so M<sub>w</sub>(x) outputs M′(x) for every x.",
          why: "M<sub>w</sub> behaves exactly like M′, so L(M<sub>w</sub>) = L(M′) = Σ*. Since P only depends on the language, M<sub>w</sub> ∈ P, and D<sub>P</sub> accepts ⟨M<sub>w</sub>⟩." },
        { title: "If M doesn’t accept w",
          ask: "Suppose M rejects w, or loops on w. What is L(M<sub>w</sub>)?",
          choices: ["∅ = L(M<sub>reject</sub>), so M<sub>w</sub> ∉ P", "Σ*", "It depends on x"],
          answer: 0,
          whys: [null, "M<sub>w</sub> never gets to run M′.", "Every x is stuck at the same first step: M(w)."],
          hint: "M<sub>w</sub> starts by running M(w) on every input x.",
          why: "On every x, M<sub>w</sub> rejects (if M rejects w) or loops (if M loops on w). Either way it accepts nothing: L(M<sub>w</sub>) = ∅ = L(M<sub>reject</sub>). Same language as M<sub>reject</sub> ∉ P, so M<sub>w</sub> ∉ P." },
        { title: "Put it together",
          ask: `So D${sb("ATM")}(⟨M, w⟩) = “build ⟨M<sub>w</sub>⟩, output D${sb("P")}(⟨M<sub>w</sub>⟩)” …`,
          choices: [`decides ${ATM}, which is impossible, so D${sb("P")} can’t exist`, `recognizes ${ATM}, which is fine`, `loops when M loops on w`],
          answer: 0,
          whys: [null, "It always halts (it only builds code and calls a decider), so it decides.", "D<sub>ATM</sub> never runs M(w). It only writes M<sub>w</sub>’s code."],
          hint: "Does D<sub>ATM</sub> ever run M on w itself?",
          why: "It accepts ⇔ M<sub>w</sub> ∈ P ⇔ M accepts w, and it always halts. That decides A<sub>TM</sub>: contradiction. ∎" },
      ],
      done: "The pattern to remember: M<sub>w</sub> copies M′ if M accepts w, and accepts nothing otherwise. You’ll reuse it in reductions where Rice is off-limits.",
    },
  },
};

registerConcept({
  id: "rice",
  oneLiner:
    "Any question about <b>which strings a TM accepts</b> is undecidable, unless every TM gives the same answer. Check two things: it depends <b>only on L(M)</b>, and <b>some TM has it, some doesn’t</b>.",

  related: ["reductions", "countability"],

  summary: {
    keyPoints: [
      { lec: [9], kind: "key", html: "<b>Rice’s theorem.</b> Let P be a set of TMs such that (1) <b>some TM is in P and some isn’t</b> (non-trivial), and (2) whenever L(M) = L(M′), M ∈ P ⇔ M′ ∈ P (it depends only on the language). Then L<sub>P</sub> = { ⟨M⟩ | M ∈ P } is <b>undecidable</b>." },
      { lec: [9], html: "Test for condition (2): <b>could two TMs with the same language disagree?</b> Number of states, running time, and halting are about the machine, not the language." },
      { lec: [9], html: "A <b>trivial</b> property (all TMs, or no TMs) is decidable: always accept, or always reject." },
      { lec: [9], html: "A Rice proof is four lines: <b>name P; it depends only on L(M); one TM in, one TM out; so L<sub>P</sub> is undecidable</b>." },
      { lec: [9], kind: "warn", html: "“Rice doesn’t apply” does <b>not</b> mean decidable. And Rice only says undecidable, not unrecognizable." },
      { lec: [9], kind: "warn", html: "Rice is for inputs ⟨M⟩ only. Pairs like ⟨M<sub>1</sub>, M<sub>2</sub>⟩ or ⟨M, w⟩ need a reduction. On the practice exam, the reduction problems <b>ban Rice</b>: use it to check your answer, then write the reduction." },
      { lec: [9], html: "Proof: reduce A<sub>TM</sub> to L<sub>P</sub>. With M<sub>reject</sub> ∉ P and M′ ∈ P, build M<sub>w</sub>(x) = M(w) && M′(x). Then L(M<sub>w</sub>) = L(M′) if M accepts w, and ∅ otherwise." },
      { lec: [9], html: "Undecidability isn’t only about TMs: Post’s correspondence problem, Hilbert’s 10th problem, and the truth of number-theory statements are undecidable too." },
    ],
    compare: {
      head: ["Property of M", "Only L(M)?", "Non-trivial?", "Verdict"],
      rows: [
        ["L(M) is infinite", "yes", "yes", "undecidable (Rice)"],
        ["M accepts 0110", "yes", "yes", "undecidable (Rice)"],
        ["L(M) is recognizable", "yes", "no: every TM", "decidable (accept all)"],
        ["M has 12 states", "no", "", "decidable (read ⟨M⟩)"],
        ["M halts on ε", "no", "", "undecidable (reduction, not Rice)"],
        ["M halts on ε within 100 steps", "no", "", "decidable (simulate 100 steps)"],
      ],
    },
  },

  details: [
    {
      id: "property",
      yourTurn: TURNS.property,
      title: "Properties of the language vs. the machine",
      lec: [9],
      html: `
        <p>A <b>property</b> of TMs is just a set P of TMs: the ones that have it. Testing it means deciding L<sub>P</sub> = { ⟨M⟩ | M ∈ P }.</p>
        <p>Some properties only care about <b>what M accepts</b>, L(M). Others care about <b>how M is built or how it runs</b>. Picture every TM sorted into bubbles by its language. A language property takes or leaves each bubble whole:</p>
        ${BUBBLES}
        <p class="callout key"><b>The test:</b> could two TMs with the <b>same language</b> disagree on the property? If yes, it’s about the machine. If no, it’s about the language.</p>
        <ul>
          <li><b>About the language:</b> “M accepts 0110”, “L(M) is empty”, “L(M) is regular”, “L(M) is infinite”.</li>
          <li><b>About the machine:</b> “M has 12 states”, “M runs for more than 50 steps on ε”, “M halts on every input”. For the last one: a machine that rejects everything and one that loops on everything both have L = ∅.</li>
        </ul>
        <p class="callout warn">Rejecting and looping look the <b>same</b> in L(M): both just mean “not accepted.” So anything about halting is a machine property.</p>`,
    },
    {
      id: "statement",
      yourTurn: TURNS.trivial,
      title: "Rice’s theorem",
      lec: [9],
      html: `
        <p class="callout key"><b>Rice’s theorem.</b> Let P be a set of TMs such that:
        <br>1. <b>Non-trivial:</b> some TM is in P, and some TM isn’t.
        <br>2. <b>Language-only:</b> whenever L(M) = L(M′), M ∈ P ⇔ M′ ∈ P.
        <br>Then L<sub>P</sub> = { ⟨M⟩ | M ∈ P } is <b>undecidable</b>.</p>
        <p>Informally: <b>every non-trivial question about the language of a TM is undecidable.</b> Given only the code ⟨M⟩, you can’t decide whether L(M) is empty, regular, finite, contains 0110, …</p>
        <h4>Why non-trivial matters</h4>
        <p>If <b>every</b> TM has the property, a decider just accepts every valid TM encoding. If <b>no</b> TM has it, it rejects everything. Both are decidable. Watch for properties that look interesting but are trivial:</p>
        <ul>
          <li>“L(M) is recognizable”: every TM has it (M recognizes its own language).</li>
          <li>“L(M) is countable”: every language is a subset of Σ*, which is countable.</li>
        </ul>
        <p class="callout tip">To show non-trivial, name <b>two witnesses</b>: a TM in P and a TM not in P. The usual ones: M<sub>accept</sub> (accepts everything, L = Σ*) and M<sub>reject</sub> (rejects everything, L = ∅).</p>`,
    },
    {
      id: "using",
      yourTurn: TURNS.rice,
      title: "Using Rice’s theorem",
      lec: [9],
      html: `
        <p>Here’s a complete proof for L = { ⟨M⟩ | L(M) is finite }.</p>
        <div class="callout key"><ol>
          <li><b>Name P.</b> Let P = the set of TMs M with L(M) finite. Then L = L<sub>P</sub>.</li>
          <li><b>Language-only.</b> If L(M) = L(M′), then L(M) is finite ⇔ L(M′) is finite. So M ∈ P ⇔ M′ ∈ P.</li>
          <li><b>Non-trivial.</b> M<sub>reject</sub> ∈ P, since ∅ is finite. M<sub>accept</sub> ∉ P, since Σ* is infinite.</li>
          <li><b>Conclude.</b> By Rice’s theorem, L is undecidable. ∎</li>
        </ol></div>
        <p>That’s the whole thing. Most of the marks are in steps 2 and 3, so don’t skip them: <b>say why</b> it depends only on the language, and <b>name</b> the two machines.</p>
        <p class="callout warn">Common slips: using a machine property (“M has 5 states”); forgetting a witness; or concluding “unrecognizable.” Rice only gives <b>undecidable</b>. For example, { ⟨M⟩ | M accepts 0110 } is undecidable but recognizable: run M on 0110.</p>`,
    },
    {
      id: "limits",
      yourTurn: TURNS.limits,
      title: "When Rice doesn’t apply",
      lec: [9],
      html: `
        <p>Rice’s theorem is a shortcut with a narrow door. It does <b>not</b> apply when:</p>
        <ul>
          <li><b>The property depends on the machine.</b> “M has 12 states” is decidable (read ⟨M⟩). But “M halts on ε” is <b>undecidable</b>, by a reduction. So without Rice, you have to work it out.</li>
          <li><b>The input isn’t a single ⟨M⟩.</b> A<sub>TM</sub> takes ⟨M, w⟩; EQ<sub>TM</sub> and “L(M<sub>1</sub>) ⊆ L(M<sub>2</sub>)” take two machines. Use a reduction from A<sub>TM</sub>.</li>
          <li><b>The property is trivial.</b> Then it’s decidable.</li>
          <li><b>The question is about recognizability.</b> Rice says nothing about whether L<sub>P</sub> is recognizable.</li>
        </ul>
        <p class="callout key"><b>On the exam:</b> the practice midterm’s reduction problems (30 of 50 points) say <b>“you are not allowed to rely on Rice’s theorem.”</b> Use Rice in your head to check that a language is undecidable, then write the reduction: assume a decider D<sub>L</sub>, build D<sub>ATM</sub>, and check both cases (M accepts w; M doesn’t accept w).</p>
        <p class="callout tip">Rice’s proof gives you a reduction for free: M<sub>w</sub>(x) = M(w) && M′(x) works for almost any language property. See the next section.</p>`,
    },
    {
      id: "proof",
      yourTurn: TURNS.proof,
      title: "The proof: a reduction from A_TM",
      lec: [9],
      html: `
        <p><b>Setup.</b> Assume M<sub>reject</sub> ∉ P. (If M<sub>reject</sub> ∈ P, run this proof on the complement of P instead. L<sub>P</sub> is decidable exactly when its complement is.) Since P is non-trivial, pick some M′ ∈ P. Suppose, for contradiction, that D<sub>P</sub> decides L<sub>P</sub>.</p>
        <pre class="pseudo">D<sub>ATM</sub>(⟨M, w⟩) {
  build ⟨M<sub>w</sub>⟩
  output D<sub>P</sub>(⟨M<sub>w</sub>⟩)
}

M<sub>w</sub>(x) {
  run M(w); if it rejects, reject     // loops if M loops on w
  run M′(x); output what it outputs
}</pre>
        <div class="table-wrap"><table class="compare"><thead><tr><th>If M on w…</th><th>M<sub>w</sub> on any x</th><th>L(M<sub>w</sub>)</th><th>So M<sub>w</sub>…</th><th>D<sub>ATM</sub></th></tr></thead><tbody>
          <tr><td>accepts</td><td>acts like M′(x)</td><td>L(M′)</td><td>∈ P (same language as M′)</td><td>accepts ✓</td></tr>
          <tr><td>rejects</td><td>rejects</td><td>∅</td><td>∉ P (same language as M<sub>reject</sub>)</td><td>rejects ✓</td></tr>
          <tr><td>loops</td><td>loops</td><td>∅</td><td>∉ P</td><td>rejects ✓</td></tr>
        </tbody></table></div>
        <p>D<sub>ATM</sub> always halts: it only <b>writes</b> M<sub>w</sub>’s code and calls D<sub>P</sub>, which always halts. So D<sub>ATM</sub> decides A<sub>TM</sub>, a contradiction. ∎</p>
        <p class="callout key">Both conditions get used: <b>non-trivial</b> gives M′, and <b>language-only</b> is what lets us say “same language as M′, so in P.”</p>`,
    },
    {
      id: "beyond",
      title: "Undecidable problems beyond TMs",
      lec: [9],
      html: `
        <p>So far every undecidable problem has been about Turing machines. But undecidability shows up elsewhere too:</p>
        <ul>
          <li><b>Post’s correspondence problem:</b> given a set of dominoes, each with a string on top and bottom, can you line up copies so the top and bottom read the same?</li>
          <li><b>Hilbert’s 10th problem:</b> does a polynomial equation (several variables, integer coefficients) have an integer solution?</li>
          <li><b>Number theory:</b> is a given statement about natural numbers (with +, ×, =, &lt;, ∀, ∃) true?</li>
        </ul>
        <p>The idea for number theory: given ⟨M, w⟩, write a statement that says “there is a number x that encodes an accepting run of M on w.” It’s true ⇔ M accepts w. That’s a reduction from A<sub>TM</sub>.</p>
        <p>A consequence: there is no proof system for number theory that is <b>sound</b> (proves only true statements), <b>complete</b> (proves every true one), and <b>checkable</b> (a TM can check a proof). If there were, you could decide any statement by trying every possible proof of it, and of its negation.</p>
        <p class="callout tip">Undecidable means no algorithm works on <b>every</b> input. Program checkers, virus scanners, and theorem provers still work on many useful inputs, using heuristics.</p>`,
    },
  ],

  playground: [
    {
      id: "rice-check",
      title: "Does Rice apply?",
      lec: [9],
      intro: `<p>Sort each property with the flowchart. First: does it depend <b>only on L(M)</b>? Then: is it <b>non-trivial</b>? If Rice can’t be used, decide whether the language is decidable anyway. The flowchart lights up the path you take.</p>`,
      widget: "rice-check",
      config: {
        items: [
          { prop: "M accepts the string 11", lang: true, trivial: false,
            w1: "M<sub>accept</sub> has it (11 ∈ Σ*); M<sub>reject</sub> doesn’t (∅).",
            end: "Undecidable by Rice. (It’s recognizable, though: run M on 11.)" },
          { prop: "M has an even number of states", lang: false, decidable: true,
            w1: "Add an unreachable state to M: same language, odd ↔ even flips.",
            end: "Decidable: read ⟨M⟩ and count the states." },
          { prop: "L(M) is recognizable", lang: true, trivial: true,
            w1: "Every TM has it: M recognizes L(M).",
            end: "Trivial, so decidable: accept every TM encoding." },
          { prop: "L(M) is decidable", lang: true, trivial: false,
            w1: "M<sub>reject</sub> has it (∅ is decidable). The universal TM U doesn’t: L(U) = A<sub>TM</sub>.",
            end: "Undecidable by Rice. A surprise: you can’t even decide whether a TM’s language is decidable." },
          { prop: "M halts on input ε", lang: false, decidable: false,
            w1: "One TM rejects ε, another loops on ε. Same language (ε ∉ L), different answers.",
            end: "Undecidable, but by a reduction from HALT or A<sub>TM</sub>, not by Rice." },
          { prop: "M runs for more than 50 steps on ε", lang: false, decidable: true,
            w1: "A slowed-down copy of M has the same language but takes longer.",
            end: "Decidable: simulate M on ε for 51 steps and see if it’s still running." },
          { prop: "L(M) is finite", lang: true, trivial: false,
            w1: "M<sub>reject</sub> has it (∅ is finite); M<sub>accept</sub> doesn’t (Σ* is infinite).",
            end: "Undecidable by Rice." },
          { prop: "L(M) ⊆ {0, 1}*", lang: true, trivial: true,
            w1: "The alphabet is {0, 1}, so every language is a subset of {0, 1}*. Every TM has it.",
            end: "Trivial, so decidable: accept every TM encoding." },
          { prop: "M accepts ε", lang: true, trivial: false,
            w1: "M<sub>accept</sub> has it; M<sub>reject</sub> doesn’t.",
            end: "Undecidable by Rice. This is the lecture’s E<sub>TM</sub>, which was proved with a reduction instead." },
          { prop: "M accepts some string within 10 steps", lang: false, decidable: true,
            w1: "A copy of M that wastes 20 steps first has the same language but accepts nothing within 10 steps.",
            end: "Decidable: in 10 steps M reads at most 10 symbols, so try every string of length ≤ 10 for 10 steps each. Finitely many runs, all bounded." },
        ],
      },
    },
  ],

  flashcards: [
    { front: "Rice’s theorem", back: "If P is non-trivial (some TM in, some out) and depends only on L(M), then { ⟨M⟩ | M ∈ P } is undecidable." },
    { front: "Test for “depends only on L(M)”", back: "Could two TMs with the same language disagree? If yes, it’s a machine property, and Rice can’t be used." },
    { front: "Non-trivial", back: "Some TM has the property and some TM doesn’t. Name one of each." },
    { front: "Is “M has 12 states” a language property?", back: "No: add an unreachable state and the language stays the same. (It’s decidable: read ⟨M⟩.)" },
    { front: "Is “M halts on every input” a language property?", back: "No. A TM rejecting everything and one looping on everything both have L = ∅." },
    { front: "{ ⟨M⟩ | L(M) is recognizable }", back: "Trivial (every TM has it), so decidable." },
    { front: "{ ⟨M⟩ | L(M) is decidable }", back: "Undecidable by Rice. M<sub>reject</sub> is in (∅); the universal TM is out (A<sub>TM</sub>)." },
    { front: "Does Rice’s theorem show unrecognizability?", back: "No, only undecidability. { ⟨M⟩ | M accepts 11 } is undecidable but recognizable." },
    { front: "Rice doesn’t apply. Is the language decidable?", back: "Not necessarily. “M halts on ε” isn’t a language property but is still undecidable." },
    { front: "Can Rice handle { ⟨M<sub>1</sub>, M<sub>2</sub>⟩ | L(M<sub>1</sub>) ⊆ L(M<sub>2</sub>) }?", back: "Not directly: the input is two machines. Use a reduction from A<sub>TM</sub>." },
    { front: "M<sub>w</sub> in Rice’s proof", back: "M<sub>w</sub>(x) = M(w) && M′(x), with M′ ∈ P. L(M<sub>w</sub>) = L(M′) if M accepts w, else ∅." },
    { front: "Why assume M<sub>reject</sub> ∉ P in the proof?", back: "So that L(M<sub>w</sub>) = ∅ puts M<sub>w</sub> outside P. If M<sub>reject</sub> ∈ P, use the complement of P." },
    { front: "Three undecidable problems not about TMs", back: "Post’s correspondence problem, Hilbert’s 10th problem (integer roots of polynomials), truth of number-theory statements." },
  ],

  quiz: [
    {
      type: "mc", lec: [9],
      q: "Which language can Rice’s theorem prove undecidable?",
      options: ["{ ⟨M⟩ | L(M) contains 101 }", "{ ⟨M⟩ | M has at most 7 states }", "{ ⟨M, w⟩ | M accepts w }", "{ ⟨M⟩ | L(M) is recognizable }"],
      answer: 0,
      whys: [null, "That’s about the machine, not the language. It’s decidable.", "The input includes w. Rice is about single machines ⟨M⟩.", "Every TM has that property, so it’s trivial (and decidable)."],
      explain: "“101 ∈ L(M)” depends only on L(M), and it’s non-trivial: M<sub>accept</sub> has it, M<sub>reject</sub> doesn’t.",
    },
    {
      type: "mc", lec: [9],
      q: "{ ⟨M⟩ | M halts on input 0 } is…",
      options: ["undecidable, but Rice’s theorem doesn’t prove it", "undecidable by Rice’s theorem", "decidable, because Rice doesn’t apply", "decidable: run M on 0"],
      answer: 0,
      whys: [null, "Halting isn’t a language property: a TM rejecting 0 and one looping on 0 can have the same language.", "Rice not applying tells you nothing about decidability.", "If M loops on 0, so does this “decider.”"],
      explain: "It’s a machine property, so Rice is out. A reduction from A<sub>TM</sub> (build a machine that runs M(w) and loops instead of rejecting) shows it’s undecidable.",
    },
    {
      type: "mc", lec: [9],
      q: "In a Rice’s-theorem proof, how do you show the property is non-trivial?",
      options: ["Name one TM that has it and one that doesn’t", "Show it’s about L(M)", "Reduce A<sub>TM</sub> to it", "Show that a TM can recognize it"],
      answer: 0,
      whys: [null, "That’s the other condition (language-only).", "That’s what Rice’s theorem saves you from doing.", "Recognizability isn’t part of Rice’s theorem."],
      explain: "Non-trivial means some TM is in P and some isn’t. Name two witnesses, e.g. M<sub>accept</sub> and M<sub>reject</sub>.",
    },
    {
      type: "mc", lec: [9],
      q: "In Rice’s proof, M<sub>w</sub>(x) = M(w) && M′(x), where M′ ∈ P and M<sub>reject</sub> ∉ P. If M <b>loops</b> on w, then L(M<sub>w</sub>) is…",
      options: ["∅", "L(M′)", "{w}", "Σ*"],
      answer: 0,
      whys: [null, "M<sub>w</sub> never gets past M(w), so it never runs M′.", "M<sub>w</sub> doesn’t check x = w.", "It accepts nothing, not everything."],
      explain: "M<sub>w</sub> loops on every x, so it accepts nothing. L(M<sub>w</sub>) = ∅ = L(M<sub>reject</sub>), so M<sub>w</sub> ∉ P.",
    },
    {
      type: "mc", lec: [9],
      q: "Which property is <b>trivial</b>?",
      options: ["L(M) is a countable set", "L(M) is finite", "L(M) is regular", "L(M) = ∅"],
      answer: 0,
      whys: [null, "M<sub>reject</sub> has it, M<sub>accept</sub> doesn’t.", "M<sub>accept</sub> has it (Σ*); a TM for {0ⁿ1ⁿ} doesn’t.", "M<sub>reject</sub> has it, M<sub>accept</sub> doesn’t."],
      explain: "Every language is a subset of Σ*, which is countable. So every TM has the property: trivial.",
    },
    {
      type: "mc", lec: [9],
      q: "Which statement about Post’s correspondence problem, Hilbert’s 10th problem, and number-theory truth is correct?",
      options: ["All three are undecidable", "They’re decidable because they aren’t about TMs", "Only Hilbert’s 10th problem is undecidable", "They’re undecidable by Rice’s theorem"],
      answer: 0,
      whys: [null, "Undecidability isn’t limited to questions about TMs.", "All three are undecidable.", "Rice is only about properties of TM languages. These are shown by reductions."],
      explain: "Each can encode TM computations, so A<sub>TM</sub> reduces to it.",
    },
    { type: "tf", lec: [9], q: "True or false: Rice’s theorem shows that { ⟨M⟩ | L(M) = ∅ } is unrecognizable.", answer: false,
      explain: "Rice only gives undecidable. (This one happens to be unrecognizable, since its complement is recognizable and it’s undecidable, but that’s a different argument.)" },
    { type: "tf", lec: [9], q: "True or false: if Rice’s theorem doesn’t apply to a property, then the language is decidable.", answer: false,
      explain: "“M halts on ε” isn’t a language property but is still undecidable. Rice not applying only means you need another proof." },
    { type: "tf", lec: [9], q: "True or false: { ⟨M⟩ | L(M) is decidable } is undecidable.", answer: true,
      explain: "Language-only and non-trivial (M<sub>reject</sub> in, the universal TM out), so Rice applies." },
    { type: "tf", lec: [9], q: "True or false: { ⟨M⟩ | M has more than 100 states } is decidable.", answer: true,
      explain: "Read ⟨M⟩ and count. It’s a property of the machine, so Rice doesn’t apply." },
    { type: "tf", lec: [9], q: "True or false: a TM that rejects every input and a TM that loops on every input have the same language.", answer: true,
      explain: "Both accept nothing, so both have L = ∅. This is why halting is not a property of the language." },
    { type: "tf", lec: [9], q: "True or false: there is a sound, complete proof system for number theory whose proofs a TM can check.", answer: false,
      explain: "Then you could decide number theory by searching for a proof of φ or of ¬φ. But number theory is undecidable." },
  ],
});
})();
