(function () {
"use strict";

// Recognizable, co-recognizable, closure, and unrecognizability (lecture 9).
// The lemma "L and L̄ recognizable ⇒ L decidable" is PS4 Problem 1: it's stated and used here (as in lecture),
// but its proof is NOT written out. Closure facts follow the published PS3 solution sketches. All examples are new.
const sb = s => `<sub>${s}</sub>`;
const ATM = `A${sb("TM")}`, coATM = `<span class="ovl">A${sb("TM")}</span>`;
const co = s => `<span class="ovl">${s}</span>`;
const ZONES = ["Decidable", "Recognizable only", "Co-recognizable only", "Neither"];

// ---------- Picture: the map of languages (also used by the lang-map widget) ----------
// zone ids: dec, rec, co, none
const MAP_POS = { rec: [105, 132], dec: [260, 132], co: [415, 132] };
function mapSVG(chips, label) {
  // chips: { rec: [html…], dec: [...], co: [...], none: [...] } (text with <tspan> for subscripts)
  // A chip is text, or { t, bar } for a complement: bar = the width of the bar drawn over the whole symbol.
  const chip = (z, c, x, y) => `<text class="lm-chip z-${z}" x="${x}" y="${y}">${c.t || c}</text>` +
    (c.bar ? `<line class="lm-bar" x1="${x - c.bar / 2}" x2="${x + c.bar / 2}" y1="${y - 15}" y2="${y - 15}"/>` : "");
  const col = (z, list) => list.map((c, k) => chip(z, c, MAP_POS[z][0], MAP_POS[z][1] + k * 22)).join("");
  const none = (chips.none || []).map((c, k, a) => chip("none", c, 260 + (k - (a.length - 1) / 2) * 150, 284)).join("");
  return `<svg class="lm-svg" viewBox="0 0 520 300" role="img" aria-label="${label}">
    <rect class="lm-all" x="2" y="2" width="516" height="296" rx="16"/>
    <text class="lm-title" x="16" y="24">All languages</text>
    <ellipse class="lm-rec" cx="205" cy="148" rx="158" ry="100"/>
    <ellipse class="lm-co" cx="315" cy="148" rx="158" ry="100"/>
    <text class="lm-zl rec" x="120" y="40">Recognizable</text>
    <text class="lm-zl co" x="400" y="40">Co-recognizable</text>
    <text class="lm-zl dec" x="260" y="104">Decidable</text>
    <text class="lm-zl" x="260" y="266">Neither</text>
    ${col("rec", chips.rec || [])}${col("dec", chips.dec || [])}${col("co", chips.co || [])}${none}
  </svg>`;
}
(window.CRAMLET = window.CRAMLET || {}).langMapSVG = mapSVG;
const T = (a, s) => `${a}<tspan class="lm-sub" dy="4">${s}</tspan><tspan dy="-4"></tspan>`;
const TBAR = (a, s) => ({ t: T(a, s), bar: 26 });
const MAP = `<figure class="lm-fig">${mapSVG({
  rec: [T("A", "TM"), "HALT", "M accepts ε"],
  dec: ["{0ⁿ1ⁿ}", T("E", "DFA"), "regular langs"],
  co: [TBAR("A", "TM"), { t: "HALT", bar: 40 }, "L(M) = ∅"],
  none: [T("EQ", "TM"), "L(M) finite"],
}, "Two overlapping ovals: recognizable languages and co-recognizable languages. Their overlap is the decidable languages. Outside both: neither.")}
  <figcaption>The <b>overlap</b> of the two ovals is exactly the decidable languages. A language and its complement sit in <b>mirror-image</b> spots: A<sub>TM</sub> on the left, its complement on the right.</figcaption></figure>`;

// ---------- "Your turn" boxes ----------
const zoneStep = (n, lang, answer, hint, why, whys) => ({
  title: `Language ${n}`, ask: `Where does ${lang} go?`, choices: ZONES, keepOrder: true, answer, whys, hint, why,
});
const TURNS = {
  map: {
    title: "Place it on the map",
    intro: "<p>For each language ask two questions: <b>is L recognizable?</b> and <b>is its complement recognizable?</b> Yes + yes = decidable.</p>",
    config: {
      award: "turn:corec-map",
      steps: [
        zoneStep(1, "{ ⟨M⟩ | M accepts 0 }", 1,
          "Can you recognize it? Can you recognize “M doesn’t accept 0”?",
          "Recognizable: run M on 0, accept if it accepts. It’s undecidable (Rice), so it can’t be in the overlap. So: recognizable only.",
          ["It’s undecidable (Rice: non-trivial and only about L(M)).", null, "Is the language itself recognizable? Try running M on 0.", "You can recognize it: run M on 0."]),
        zoneStep(2, "{ ⟨M⟩ | M does not accept 0 }", 2,
          "It’s the complement of language 1.",
          "Its complement (language 1) is recognizable, so it’s co-recognizable. It’s undecidable, so it isn’t recognizable too (or it would be decidable). Mirror image of language 1.",
          ["It’s undecidable.", "To recognize it you’d have to be sure M never accepts 0, and you can’t wait forever.", null, "Its complement is recognizable, so it’s co-recognizable."]),
        zoneStep(3, "{ ⟨D⟩ | D is a DFA that accepts 0 }", 0,
          "This is a DFA, not a TM.",
          "Run D on 0. A DFA always halts, so this decides it. Decidable languages are in the overlap.",
          [null, "A DFA always finishes its input, so the simulation halts. That’s a decider.", "Decidable languages are both recognizable and co-recognizable.", "Running a DFA always halts."]),
        zoneStep(4, `${coATM} = { ⟨M, w⟩ | M does not accept w }`, 2,
          `Its complement is ${ATM}.`,
          `${ATM} is recognizable (the universal TM), so ${coATM} is co-recognizable. It is <b>not</b> recognizable: that’s the big theorem of this lesson.`,
          [`${ATM} is undecidable, and so is its complement.`, `That’s where ${ATM} goes. This is its complement.`, null, `${ATM} is recognizable, so ${coATM} is co-recognizable.`]),
      ],
      done: "A language and its complement are mirror images on the map. If one is <b>recognizable only</b>, the other is <b>co-recognizable only</b>.",
    },
  },

  parallel: {
    title: "Recognize “M accepts something”",
    intro: "<p>Build a recognizer for N = { ⟨M⟩ | L(M) ≠ ∅ }: M accepts at least one string. The catch: M might loop on some strings.</p>",
    config: {
      award: "turn:parallel",
      steps: [
        { title: "One at a time?",
          ask: "Plan A: run M on ε, then on 0, then on 1, then 00, …, and accept as soon as one accepts. What goes wrong?",
          choices: ["If M loops on ε, we never try any other string, even if M accepts 0", "Nothing; it works", "It takes too much memory"],
          answer: 0,
          whys: [null, "What if M loops on ε but accepts 0?", "Memory isn’t the problem; getting stuck is."],
          hint: "What if M loops on the very first string?",
          why: "Running each string to the end can get stuck forever on a string M loops on, and never reach the one M accepts." },
        { title: "The fix: rounds",
          ask: "Plan B: for k = 1, 2, 3, …: run M for k steps on each of the first k strings. Accept if any run accepts. Why does this work?",
          choices: ["If M accepts some s in t steps, then by round max(t, position of s) we run M on s for long enough", "Because M halts on every string", "Because there are only k strings"],
          answer: 0,
          whys: [null, "M doesn’t have to halt on every string. That’s the whole point.", "There are infinitely many strings, but round k only looks at the first k."],
          hint: "Each round is finite. Will the accepting run ever get enough steps?",
          why: "Each round does finitely much work, so no round gets stuck. If M accepts s (the p-th string) after t steps, round max(p, t) catches it." },
        { title: "What if L(M) = ∅?",
          ask: "If M accepts nothing, what does Plan B do?",
          choices: ["Runs forever, which is fine for a recognizer", "Rejects after a while", "Crashes"],
          answer: 0,
          whys: [null, "When could it safely reject? Some string might be accepted at round 1,000,000.", "Nothing crashes; it just keeps going."],
          hint: "A recognizer only has to accept the strings in the language.",
          why: "It loops. That’s allowed: a recognizer must accept every ⟨M⟩ in N, and must just not accept the others. So N is recognizable." },
      ],
      done: "This trick is called <b>dovetailing</b>: give every candidate a little more time each round, so no single loop can block you.",
    },
  },

  closure: {
    title: "Closed or not?",
    config: {
      award: "turn:closure",
      steps: [
        { title: "Recognizable ∩",
          ask: "Recognizable languages are closed under intersection. The recognizer for A ∩ B on input w…",
          choices: ["runs M<sub>A</sub>(w) and M<sub>B</sub>(w) one after the other (or in parallel), and accepts if both accept", "runs M<sub>A</sub>(w); if it rejects, runs M<sub>B</sub>(w)", "accepts if either accepts"],
          answer: 0,
          whys: [null, "That’s backwards: for ∩, if M<sub>A</sub> rejects you can reject.", "That’s union, not intersection."],
          hint: "For w ∈ A ∩ B, both machines accept. Does running them in order risk anything?",
          why: "For ∩ you need both to accept anyway, so even one-after-the-other works: if M<sub>A</sub> loops, w ∉ A, so w ∉ A ∩ B and looping is allowed." },
        { title: "Recognizable ∪",
          ask: "For A ∪ B, why must you run M<sub>A</sub> and M<sub>B</sub> in <b>parallel</b> (alternating steps)?",
          choices: ["w might be in B while M<sub>A</sub> loops on w; running M<sub>A</sub> first would get stuck", "It’s faster", "Because M<sub>B</sub> might reject"],
          answer: 0,
          whys: [null, "Speed isn’t the issue. Correctness is.", "Rejecting is fine; it’s looping that causes trouble."],
          hint: "Which order could make you miss a string you should accept?",
          why: "If w ∈ B but M<sub>A</sub> loops on w, running M<sub>A</sub> first never reaches M<sub>B</sub>. Alternating steps means whichever accepts, you’ll see it." },
        { title: "Complement",
          ask: "Are recognizable languages closed under complement?",
          choices: [`No: ${ATM} is recognizable but ${coATM} isn’t`, "Yes: swap accept and reject", "Yes, like decidable languages"],
          answer: 0,
          whys: [null, "Swapping doesn’t touch the loops. Strings in the complement that M loops on still aren’t accepted.", "Deciders always halt, so swapping works for them. Recognizers can loop."],
          hint: "Think about the strings where the recognizer loops.",
          why: `Swapping accept/reject turns loops into loops, so it doesn’t give a recognizer. And ${ATM} is a real counterexample: recognizable, with an unrecognizable complement.` },
        { title: "Decidable complement",
          ask: "Why does swapping accept and reject work for <b>deciders</b>?",
          choices: ["A decider always halts, so every string ends in exactly one of accept/reject", "Deciders never reject", "It doesn’t"],
          answer: 0,
          whys: [null, "Deciders reject plenty of strings.", "It does work for deciders."],
          hint: "What’s the one thing deciders do that recognizers might not?",
          why: "No loops: each string ends in accept or reject, so flipping gives a decider for the complement." },
      ],
      done: "Decidable: closed under ∪, ∩, complement, concatenation, star. Recognizable: ∪, ∩, concatenation, star, but <b>not</b> complement.",
    },
  },

  corec: {
    title: "Prove a language is unrecognizable",
    intro: "<p>Prove that EMPTY = { ⟨M⟩ | L(M) = ∅ } is <b>not</b> recognizable. Use the recipe: find a recognizable, undecidable complement.</p>",
    config: {
      award: "turn:corec",
      steps: [
        { title: "The complement",
          ask: "What is the complement of EMPTY? (Ignore strings that aren’t TM encodings.)",
          choices: ["{ ⟨M⟩ | L(M) ≠ ∅ }: M accepts at least one string", "{ ⟨M⟩ | L(M) = Σ* }", "{ ⟨M⟩ | M rejects everything }"],
          answer: 0,
          whys: [null, "Not empty doesn’t mean everything. One accepted string is enough.", "That’s inside EMPTY, not its complement."],
          hint: "Negate “accepts nothing”.",
          why: "Not accepting nothing = accepting at least one string." },
        { title: "Recognizable?",
          ask: "Is the complement recognizable?",
          choices: ["Yes: dovetail M over all strings, accept if any run accepts", "No", "Yes: run M on ε"],
          answer: 0,
          whys: [null, "Look back at the parallel trick from the previous section.", "M might accept 0 but not ε."],
          hint: "You built this recognizer in “Running machines in parallel”.",
          why: "Round k: run M for k steps on the first k strings. If M accepts anything, some round sees it." },
        { title: "Undecidable?",
          ask: "Why is the complement undecidable?",
          choices: ["Rice’s theorem: it depends only on L(M); M<sub>accept</sub> is in, M<sub>reject</sub> is out", "Because it’s recognizable", "Because M might loop"],
          answer: 0,
          whys: [null, "Recognizable languages can be decidable too.", "That’s why simple simulation fails, but it isn’t a proof."],
          hint: "It’s a non-trivial property of L(M).",
          why: "Non-trivial and language-only, so undecidable by Rice. (Or reduce A<sub>TM</sub> to it with M′<sub>w</sub>.)" },
        { title: "Conclude",
          ask: "So EMPTY is not recognizable, because…",
          choices: ["if it were, the complement would be recognizable and co-recognizable, hence decidable: a contradiction", "it’s undecidable", "Rice’s theorem says so"],
          answer: 0,
          whys: [null, "Undecidable alone isn’t enough: A<sub>TM</sub> is undecidable but recognizable.", "Rice only gives undecidable, never unrecognizable."],
          hint: "Use the lemma: L and L̄ both recognizable ⇒ L decidable.",
          why: "EMPTY recognizable + its complement recognizable ⇒ decidable. It isn’t, so EMPTY isn’t recognizable. ∎" },
      ],
      done: "The recipe: <b>L̄ recognizable + L̄ undecidable ⇒ L unrecognizable.</b> On paper: name the complement, give its recognizer, cite why it’s undecidable, apply the lemma.",
    },
  },

  mapunrec: {
    title: "Unrecognizable by mapping reduction",
    intro: `<p>Show FINITE = { ⟨M⟩ | L(M) is finite } is unrecognizable with a mapping reduction from ${coATM}.</p>`,
    config: {
      award: "turn:map-unrec",
      steps: [
        { title: "Which direction?",
          ask: "To show FINITE is unrecognizable, we need…",
          choices: [`${coATM} ≤<sub>m</sub> FINITE`, `FINITE ≤<sub>m</sub> ${coATM}`, `${ATM} ≤<sub>m</sub> FINITE`],
          answer: 0,
          whys: [null, "That would show FINITE is no harder than something unrecognizable, which says nothing.", `That shows FINITE is undecidable, not unrecognizable (${ATM} is recognizable).`],
          hint: "The known unrecognizable language goes on the left.",
          why: `If ${coATM} ≤<sub>m</sub> FINITE and FINITE were recognizable, ${coATM} would be too. It isn’t.` },
        { title: "Build f",
          ask: `f(⟨M, w⟩) = ⟨M′<sub>w</sub>⟩, where M′<sub>w</sub>(x) runs M(w) and accepts if it accepts. What is L(M′<sub>w</sub>)?`,
          choices: ["Σ* if M accepts w; ∅ otherwise", "{w} if M accepts w", "∅ if M accepts w; Σ* otherwise"],
          answer: 0,
          whys: [null, "M′<sub>w</sub> ignores x, so it can’t single out w.", "Flipped: M′<sub>w</sub> accepts when M accepts w."],
          hint: "M′<sub>w</sub> ignores its input x.",
          why: "Every x gets the same answer: accept if M accepts w. So L(M′<sub>w</sub>) is everything or nothing." },
        { title: "Check ⇔",
          ask: `Is ⟨M, w⟩ ∈ ${coATM} ⇔ ⟨M′<sub>w</sub>⟩ ∈ FINITE?`,
          choices: ["Yes: M doesn’t accept w ⇔ L(M′<sub>w</sub>) = ∅ (finite); M accepts w ⇔ L(M′<sub>w</sub>) = Σ* (infinite)", "No, it’s backwards", "Only one direction holds"],
          answer: 0,
          whys: [null, "Check: not accepting gives ∅, which is finite. That’s the right side.", "Both cases are covered: accept → infinite, not accept → finite."],
          hint: "Check both cases: M accepts w, and M doesn’t.",
          why: "Both directions hold, and f is computable (it only writes code). So FINITE is unrecognizable. ∎" },
        { title: "Why not a general reduction?",
          ask: `D(⟨M, w⟩) = “flip the answer of a decider for ${ATM}” is a general reduction from ${coATM} to ${ATM}. Does it prove ${ATM} is unrecognizable?`,
          choices: [`No. ${ATM} is recognizable. General reductions can flip answers, so they don’t carry recognizability`, "Yes", `Only if ${ATM} is decidable`],
          answer: 0,
          whys: [null, `${ATM} is recognizable (the universal TM), so that conclusion is false.`, "That isn’t the issue."],
          hint: `Is ${ATM} actually unrecognizable?`,
          why: "Flipping an answer needs the subroutine to halt. With only a recognizer, you can’t flip a loop. Mapping reductions don’t flip, so they pass recognizers along: R<sub>A</sub>(w) = R<sub>B</sub>(f(w))." },
      ],
      done: "For <b>unrecognizable</b>, use a <b>mapping</b> reduction from an unrecognizable language (usually the complement of A<sub>TM</sub>).",
    },
  },
};

registerConcept({
  id: "recognizability",
  oneLiner:
    `A recognizer only has to accept the right strings; it may loop on the rest. Some languages, like ${coATM}, can’t even be recognized. The key fact: <b>L is decidable ⇔ L and its complement are both recognizable</b>.`,

  related: ["reductions", "rice", "turing-machines"],

  summary: {
    keyPoints: [
      { lec: [9], html: "<b>Recognizable:</b> some TM accepts exactly the strings in L (it may loop on others). <b>Decidable:</b> some TM accepts those and rejects the rest, always halting." },
      { lec: [9], html: "<b>Co-recognizable:</b> the complement L̄ is recognizable." },
      { lec: [9], kind: "key", html: "<b>Lemma.</b> If L and L̄ are both recognizable, L is decidable. So <b>decidable = recognizable ∩ co-recognizable</b>. (Proof: PS4 Problem 1.)" },
      { lec: [9], kind: "key", html: `<b>${coATM} is not recognizable.</b> ${ATM} is recognizable; if ${coATM} were too, ${ATM} would be decidable.` },
      { lec: [9], html: "<b>Recipe:</b> L̄ recognizable and undecidable ⇒ L is unrecognizable." },
      { lec: [9], html: "<b>Running in parallel</b> (alternating steps, or dovetailing over many strings) stops one looping run from blocking the others." },
      { lec: [9], html: "Closure: decidable languages are closed under ∪, ∩, complement, concatenation, star. Recognizable ones under ∪, ∩, concatenation, star, but <b>not complement</b>." },
      { lec: [9], html: `<b>Mapping reductions</b> carry recognizability: if A ≤<sub>m</sub> B and B is recognizable, so is A. So ${coATM} ≤<sub>m</sub> B proves B unrecognizable. (A ≤<sub>m</sub> B also gives Ā ≤<sub>m</sub> B̄ with the same f.)` },
      { lec: [9], kind: "warn", html: "Undecidable is <b>not</b> the same as unrecognizable. A<sub>TM</sub> and HALT are undecidable but recognizable." },
    ],
    compare: {
      head: ["Language", "Recognizable?", "Co-recognizable?", "So it’s…"],
      rows: [
        ["{0ⁿ1ⁿ}, any regular language", "yes", "yes", "decidable"],
        [ATM + ", HALT", "yes", "no", "recognizable only"],
        [coATM + ", " + co("HALT"), "no", "yes", "co-recognizable only"],
        ["{ ⟨M⟩ | L(M) = ∅ }", "no", "yes", "co-recognizable only"],
        ["EQ" + sb("TM") + ", { ⟨M⟩ | L(M) finite }", "no", "no", "neither"],
      ],
    },
  },

  details: [
    {
      id: "map",
      yourTurn: TURNS.map,
      title: "The map of languages",
      lec: [9],
      html: `
        <p>Recall the two kinds of TM:</p>
        <ul>
          <li>A <b>recognizer</b> for L accepts every string in L. On strings not in L it may reject <b>or loop</b>.</li>
          <li>A <b>decider</b> for L accepts the strings in L and rejects all others. It <b>always halts</b>.</li>
        </ul>
        <p>Call L <b>co-recognizable</b> if its complement L̄ is recognizable. That gives every language a place on this map:</p>
        ${MAP}
        <p class="callout key">To place a language, ask two questions: <b>Is L recognizable?</b> <b>Is L̄ recognizable?</b> Yes to both means decidable (that’s the lemma below).</p>`,
    },
    {
      id: "parallel",
      yourTurn: TURNS.parallel,
      title: "Running machines in parallel",
      lec: [9],
      html: `
        <p>Recognizers can loop, so you have to be careful about <b>order</b>. If you run one machine to completion and it loops, nothing after it ever runs.</p>
        <p><b>Example: recognizable languages are closed under union.</b> Given recognizers M<sub>A</sub>, M<sub>B</sub>:</p>
        <pre class="pseudo">M<sub>A∪B</sub>(w) {
  for t = 1, 2, 3, …:
    run M<sub>A</sub>(w) for t steps; if it accepted, accept
    run M<sub>B</sub>(w) for t steps; if it accepted, accept
}</pre>
        <p>If w ∈ B, M<sub>B</sub> accepts after some number of steps s, so round s accepts, <b>even if M<sub>A</sub> loops on w</b>. If w is in neither, nothing accepts and it loops, which a recognizer is allowed to do.</p>
        <p class="callout warn">“Run M<sub>A</sub>(w); if it rejects, run M<sub>B</sub>(w)” is <b>wrong</b>: if M<sub>A</sub> loops on a string in B, you never get to M<sub>B</sub>.</p>
        <h4>Dovetailing: infinitely many runs</h4>
        <p>The same idea handles infinitely many strings. To check “does M accept <b>some</b> string?”: in round k, run M for k steps on each of the first k strings. Every round is finite, and any accepting run is eventually given enough steps.</p>
        <p class="callout tip">Parallel = each run gets a turn, a little at a time. Use it whenever you’d accept if <b>any</b> of several (possibly looping) runs accepts.</p>`,
    },
    {
      id: "closure",
      yourTurn: TURNS.closure,
      title: "Closure properties",
      lec: [9],
      html: `
        <div class="table-wrap"><table class="compare"><thead><tr><th>Operation</th><th>Decidable</th><th>Recognizable</th><th>How</th></tr></thead><tbody>
          <tr><td>Union A ∪ B</td><td>✓</td><td>✓</td><td>Recognizers: run both <b>in parallel</b>, accept if either does</td></tr>
          <tr><td>Intersection A ∩ B</td><td>✓</td><td>✓</td><td>Run both (in order is fine here), accept if both do</td></tr>
          <tr><td>Complement Ā</td><td>✓</td><td><b>✗</b></td><td>Deciders: swap accept/reject. Recognizers can’t: loops stay loops</td></tr>
          <tr><td>Concatenation AB</td><td>✓</td><td>✓</td><td>Try every split w = xy; for recognizers, run all splits in parallel</td></tr>
          <tr><td>Star A*</td><td>✓</td><td>✓</td><td>Try every way to cut w into pieces (in parallel for recognizers)</td></tr>
        </tbody></table></div>
        <p class="callout key">The one difference: recognizable languages are <b>not closed under complement</b>. ${ATM} is recognizable, but ${coATM} isn’t (next section).</p>
        <p class="callout tip">The PS3 solution sketches (Problem 2) have full proofs for the decidable cases and for concatenation and intersection of recognizable languages. Compare them with this table.</p>`,
    },
    {
      id: "co-recognizable",
      yourTurn: TURNS.corec,
      title: "Decidable = recognizable + co-recognizable",
      lec: [9],
      html: `
        <p class="callout key"><b>Lemma.</b> For any language L: if L is recognizable and L̄ is recognizable, then L is decidable.</p>
        <p>The other direction is easy: if L is decidable, its decider recognizes L, and the decider with accept/reject swapped recognizes L̄. So:</p>
        <p style="text-align:center"><b>L decidable ⇔ L recognizable and co-recognizable.</b></p>
        <p class="callout tip">The lemma is <b>PS4 Problem 1</b>, so it isn’t proved here. If you want to revisit it, think about the tool from “Running machines in parallel”: every string is in exactly one of L and L̄.</p>
        <h4>The first explicit unrecognizable language</h4>
        <p><b>Theorem.</b> ${coATM} = { ⟨M, w⟩ | M does not accept w } is not recognizable.</p>
        <p><b>Proof.</b> ${ATM} is recognizable: the universal TM runs M on w and accepts if M does. If ${coATM} were recognizable too, the lemma would make ${ATM} decidable. But ${ATM} is undecidable. So ${coATM} is not recognizable. ∎</p>
        <p class="callout key"><b>The recipe:</b> to show L is unrecognizable, show that L̄ is <b>recognizable</b> and <b>undecidable</b>. Then L can’t be recognizable, or L̄ would be decidable.</p>
        <p class="callout warn">Both parts matter. “L is undecidable” alone doesn’t make it unrecognizable (A<sub>TM</sub>). And the recognizable one must be the <b>complement</b>.</p>`,
    },
    {
      id: "mapping-unrec",
      yourTurn: TURNS.mapunrec,
      title: "Unrecognizability with mapping reductions",
      lec: [9],
      html: `
        <p>The recipe above needs L̄ to be recognizable. When it isn’t (like EQ<sub>TM</sub>), use a mapping reduction.</p>
        <p class="callout key"><b>Theorem.</b> If A ≤<sub>m</sub> B and B is recognizable, then A is recognizable. So if A is <b>un</b>recognizable, B is too.</p>
        <p>Why: if R<sub>B</sub> recognizes B, then R<sub>A</sub>(w) = R<sub>B</sub>(f(w)) recognizes A, since w ∈ A ⇔ f(w) ∈ B. It may loop, but only when R<sub>B</sub> does, on inputs not in A.</p>
        <p class="callout warn"><b>General reductions don’t work here.</b> “Flip the answer of D<sub>A</sub>” is a fine reduction from ${coATM} to ${ATM}, yet ${ATM} is recognizable. Flipping needs the subroutine to halt. Mapping reductions never flip, so they carry recognizers over.</p>
        <h4>Example: FINITE = { ⟨M⟩ | L(M) is finite } is unrecognizable</h4>
        <p>Show ${coATM} ≤<sub>m</sub> FINITE with f(⟨M, w⟩) = ⟨M′<sub>w</sub>⟩:</p>
        <pre class="pseudo">M′<sub>w</sub>(x) {   // ignores x
  run M(w); if it accepts, accept
}</pre>
        <ul>
          <li>M doesn’t accept w ⇒ L(M′<sub>w</sub>) = ∅, which is finite ⇒ ⟨M′<sub>w</sub>⟩ ∈ FINITE.</li>
          <li>M accepts w ⇒ L(M′<sub>w</sub>) = Σ*, which is infinite ⇒ ⟨M′<sub>w</sub>⟩ ∉ FINITE.</li>
        </ul>
        <p>So ⟨M, w⟩ ∈ ${coATM} ⇔ f(⟨M, w⟩) ∈ FINITE, and f is computable. FINITE is unrecognizable. ∎</p>
        <p class="callout tip">Useful facts: A ≤<sub>m</sub> B ⇔ Ā ≤<sub>m</sub> B̄ (same f). So “${coATM} ≤<sub>m</sub> B” is the same as “${ATM} ≤<sub>m</sub> B̄”. And EQ<sub>TM</sub> is <b>neither</b> recognizable nor co-recognizable: there are mapping reductions from ${coATM} to EQ<sub>TM</sub> and to its complement.</p>`,
    },
  ],

  playground: [
    {
      id: "lang-map",
      title: "The language map",
      lec: [9],
      intro: `<p>Place each language on the map. Ask: <b>is L recognizable?</b> <b>Is its complement?</b> Each one you place stays on the map, so by the end you’ll have the whole picture.</p>`,
      widget: "lang-map",
      config: {
        items: [
          { lang: "{ 0ⁿ1ⁿ | n ≥ 0 }", chip: "{0ⁿ1ⁿ}", zone: "dec",
            why: "A TM can decide it (cross off matching 0s and 1s). Decidable languages sit in the overlap." },
          { lang: `${ATM} = { ⟨M, w⟩ | M accepts w }`, chip: T("A", "TM"), zone: "rec",
            why: `Recognizable (the universal TM), but undecidable. So its complement isn’t recognizable: recognizable only.` },
          { lang: `${coATM} = { ⟨M, w⟩ | M doesn’t accept w }`, chip: TBAR("A", "TM"), zone: "co",
            why: `Its complement ${ATM} is recognizable, so it’s co-recognizable. It isn’t recognizable itself (the lemma).` },
          { lang: "HALT = { ⟨M, w⟩ | M halts on w }", chip: "HALT", zone: "rec",
            why: "Run M on w and accept if it halts: recognizable. Undecidable, so not co-recognizable." },
          { lang: "{ ⟨M⟩ | L(M) = ∅ }", chip: "L(M) = ∅", zone: "co",
            why: "Its complement (M accepts something) is recognizable by dovetailing, and it’s undecidable. So this one is co-recognizable only." },
          { lang: "{ ⟨D⟩ | D is a DFA and L(D) = ∅ }", chip: T("E", "DFA"), zone: "dec",
            why: "Decidable: check whether any accept state is reachable from the start state. DFA questions are usually decidable." },
          { lang: "{ ⟨M⟩ | M accepts some string of length ≤ 3 }", chip: "len ≤ 3", zone: "rec",
            why: "Recognizable: run M on the 15 strings of length ≤ 3 in parallel. Undecidable by Rice, so not co-recognizable." },
          { lang: `EQ${sb("TM")} = { ⟨M₁, M₂⟩ | L(M₁) = L(M₂) }`, chip: T("EQ", "TM"), zone: "none",
            why: `Neither. ${coATM} mapping-reduces to EQ${sb("TM")} and to its complement, so neither side is recognizable.` },
          { lang: "{ ⟨M⟩ | M has exactly 4 states }", chip: "4 states", zone: "dec",
            why: "Decidable: read ⟨M⟩ and count. (A property of the code, not the language.)" },
          { lang: "{ ⟨M⟩ | L(M) is finite }", chip: "L(M) finite", zone: "none",
            why: `Neither. ${coATM} ≤<sub>m</sub> FINITE (see Details), and also ${coATM} ≤<sub>m</sub> its complement, using M′(x) = “run M on w for |x| steps; accept if it hasn’t accepted yet.”` },
        ],
      },
    },
  ],

  flashcards: [
    { front: "Recognizable vs. decidable", back: "Recognizer: accepts exactly L, may loop on other strings. Decider: accepts L, rejects the rest, always halts." },
    { front: "Co-recognizable", back: "L̄ (the complement) is recognizable." },
    { front: "The lemma about L and L̄", back: "If L and L̄ are both recognizable, L is decidable. (PS4 Problem 1.)" },
    { front: "Decidable = ?", back: "Recognizable ∩ co-recognizable." },
    { front: `Is ${coATM} recognizable?`, back: `No. ${ATM} is recognizable; if ${coATM} were too, ${ATM} would be decidable.` },
    { front: "Recipe: show L is unrecognizable", back: "Show L̄ is recognizable and undecidable. Or give a mapping reduction from an unrecognizable language to L." },
    { front: "Why run recognizers in parallel?", back: "One run might loop. Alternating steps lets any accepting run finish." },
    { front: "Dovetailing", back: "Round k: run M for k steps on the first k strings. Recognizes “M accepts some string”." },
    { front: "Recognizable languages: closed under complement?", back: `No. ${ATM} is recognizable, ${coATM} isn’t. (Closed under ∪, ∩, concatenation, star.)` },
    { front: "Decidable languages: closure", back: "Closed under ∪, ∩, complement, concatenation, star." },
    { front: "A ≤<sub>m</sub> B and B recognizable ⇒ ?", back: "A is recognizable: R<sub>A</sub>(w) = R<sub>B</sub>(f(w))." },
    { front: `To show B unrecognizable by mapping reduction`, back: `Show ${coATM} ≤<sub>m</sub> B (equivalently ${ATM} ≤<sub>m</sub> B̄).` },
    { front: "Why can’t general reductions prove unrecognizability?", back: `They may flip answers, which needs a halting subroutine. Flipping a decider reduces ${coATM} to ${ATM}, yet ${ATM} is recognizable.` },
    { front: "EQ<sub>TM</sub>", back: "Neither recognizable nor co-recognizable." },
  ],

  quiz: [
    {
      type: "mc", lec: [9],
      q: "Which language is <b>not recognizable</b>?",
      options: [`${coATM}`, `${ATM}`, "HALT", "{ ⟨M⟩ | M accepts 01 }"],
      answer: 0,
      whys: [null, "The universal TM recognizes it.", "Run M on w; accept if it halts.", "Run M on 01; accept if it accepts."],
      explain: `${ATM} is recognizable, so if ${coATM} were too, ${ATM} would be decidable.`,
    },
    {
      type: "mc", lec: [9],
      q: "L is undecidable and L̄ is recognizable. What can you conclude?",
      options: ["L is not recognizable", "L is recognizable", "L̄ is decidable", "Nothing"],
      answer: 0,
      whys: [null, "Then L and L̄ would both be recognizable, so L would be decidable.", "L̄ is decidable ⇔ L is, and L isn’t.", "The lemma gives a conclusion."],
      explain: "If L were recognizable, both L and L̄ would be, so L would be decidable. Contradiction.",
    },
    {
      type: "mc", lec: [9],
      q: "Recognizable languages are <b>not</b> closed under…",
      options: ["complement", "union", "intersection", "concatenation"],
      answer: 0,
      whys: [null, "Run both recognizers in parallel.", "Run both; accept if both accept.", "Try every split in parallel."],
      explain: `${ATM} is recognizable but its complement isn’t.`,
    },
    {
      type: "mc", lec: [9],
      q: "To recognize A ∪ B from recognizers M<sub>A</sub>, M<sub>B</sub>, why not just run M<sub>A</sub>(w), then M<sub>B</sub>(w)?",
      options: ["M<sub>A</sub> might loop on a w that’s in B", "M<sub>A</sub> might reject", "It would be too slow", "It works fine"],
      answer: 0,
      whys: [null, "If it rejects, you move on to M<sub>B</sub>. Rejecting is fine.", "Speed isn’t the problem.", "It fails when M<sub>A</sub> loops on a string in B."],
      explain: "Alternate steps between the two so a loop in one can’t block the other.",
    },
    {
      type: "mc", lec: [9],
      q: "Which reduction proves B is <b>unrecognizable</b>?",
      options: [`${coATM} ≤<sub>m</sub> B`, `${ATM} ≤<sub>m</sub> B`, `B ≤<sub>m</sub> ${coATM}`, "A general (non-mapping) reduction from A<sub>TM</sub> to B"],
      answer: 0,
      whys: [null, `${ATM} is recognizable, so this only shows B is undecidable.`, "Wrong direction: the known-hard language goes on the left.", "General reductions show undecidability, not unrecognizability."],
      explain: "Mapping reductions carry recognizers: if B were recognizable, so would " + coATM + " be.",
    },
    {
      type: "mc", lec: [9],
      q: "Where does { ⟨M⟩ | L(M) = ∅ } go on the map?",
      options: ["Co-recognizable only", "Recognizable only", "Decidable", "Neither"],
      answer: 0,
      whys: [null, "You can never be sure M accepts nothing.", "It’s undecidable (Rice).", "Its complement (M accepts something) is recognizable by dovetailing."],
      explain: "Its complement is recognizable (dovetail over strings) and undecidable, so this one is co-recognizable only.",
    },
    { type: "tf", lec: [9], q: "True or false: every undecidable language is unrecognizable.", answer: false,
      explain: `${ATM} and HALT are undecidable but recognizable.` },
    { type: "tf", lec: [9], q: "True or false: if L and L̄ are both recognizable, then L is decidable.", answer: true,
      explain: "That’s the lemma from lecture (PS4 Problem 1)." },
    { type: "tf", lec: [9], q: "True or false: if A ≤<sub>m</sub> B, then Ā ≤<sub>m</sub> B̄.", answer: true,
      explain: "Use the same f: w ∈ A ⇔ f(w) ∈ B is the same as w ∉ A ⇔ f(w) ∉ B." },
    { type: "tf", lec: [9], q: "True or false: decidable languages are closed under complement.", answer: true,
      explain: "A decider always halts, so swapping accept and reject decides the complement." },
    { type: "tf", lec: [9], q: "True or false: EQ" + sb("TM") + " is co-recognizable.", answer: false,
      explain: "EQ<sub>TM</sub> is neither recognizable nor co-recognizable." },
    { type: "tf", lec: [9], q: "True or false: if A ≤<sub>m</sub> B and A is recognizable, then B is recognizable.", answer: false,
      explain: "Wrong direction. Recognizability flows from B to A: if B is recognizable, A is." },
  ],
});
})();
