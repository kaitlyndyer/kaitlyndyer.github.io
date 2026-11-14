// Proof Box: the proofs you should be able to write for Midterm 2, each climbing four levels:
//   1 With hints: a guided walkthrough or "Your turn" (checked automatically from cramlet's awards)
//   2 Build from steps: put the proof in order, leaving out the steps that don't belong (a proof puzzle)
//   3 On your own: write the whole proof for a new language, then grade it with the checklist
//   4 Timed: the same, against the clock, for a language you haven't written up before
// Prompts are new (none come from the problem sets). Every prompt has a model answer.
// Fields: id, title, topic (Study Plan topic id), minutes (the timed limit), hints: [{ label, href, key }]
// (key = a cramlet award id "kind:course:id"; any one earns level 1), puzzle (proof-puzzle config for level 2),
// checklist: [{ text, key: true if it must be ticked to pass }], prompts: [{ id, task, model }].
(function () {
"use strict";
const sb = s => `<sub>${s}</sub>`;
const ATM = `A${sb("TM")}`, Mw = `M${sb("w")}`;
const D = x => `D${sb(x)}`;

// ---------- The reduction proof, laid out the way the course's solutions write it ----------
// One renderer makes the color-coded model answer, the worked examples and the fill-in-the-blanks version, so the
// same structure shows up every time: Setup, Construction, the two cases, Conclusion.
//   sc = { kind, helper: { name, lines }, fixed: [{ name, text }], arg, yes: { pre, val, alts, keys, why, in }, no: {…}, note }
//   yes.in / no.in: is the constructed input in L in that case? (yes.in false means D_ATM flips D_L's answer)
const DL = D("L"), DATM = D("ATM");
const attr = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const strip = s => String(s).replace(/<[^>]+>/g, "");
const PLAIN = ["Run M(w).", "If M(w) accepts, accept.", "If M(w) rejects, reject.", "If M(w) loops, loop."];
const LOOPY = ["Run M(w).", "If M(w) accepts, accept.", "If M(w) rejects, <b>loop forever</b>.", "If M(w) loops, loop."];
const SIGMA = ["Σ*", "sigma*", "Σ^*", "all strings", "every string", "everything", "all inputs", "every input", "{0,1}*", "L(M₂) = Σ*"];
const EMPTY = ["∅", "{}", "empty", "the empty set", "empty set", "emptyset", "nothing", "no strings", "none", "L(M₂) = ∅"];
const HALTS = ["halts on every input", "halts on all inputs", "halts on everything", "halts", "accepts every input", "accepts all inputs", "accepts everything", "accepts all strings", "accepts every string"];
const LOOPS = ["loops on every input", "loops on all inputs", "loops on everything", "loops", "loops forever", "never halts", "halts on no input", "doesn't halt", "does not halt"];
const pick = (k, ans, opts, label) => `<select class="pb-pick" data-blank="${k}" data-ans="${attr(ans)}" aria-label="${attr(label)}"><option value="">choose</option>${opts.map(o => `<option>${o}</option>`).join("")}</select>`;
const blank = (k, alts, show, label, keys) => `<span class="pb-bwrap"><input class="pb-blank" data-blank="${k}" data-alts="${attr(JSON.stringify(alts || [show]))}" data-show="${attr(show)}" aria-label="${attr(label)}" autocomplete="off" spellcheck="false">${(keys || []).map(x => `<button type="button" class="pb-ins" data-for="${k}" data-ins="${attr(x)}" title="Type ${attr(x)}">${x}</button>`).join("")}</span>`;
const ul = lines => `<ul>${lines.map(l => `<li>${l}</li>`).join("")}</ul>`;
function reduction(sc, fill) {
  const h = sc.helper, flip = !sc.yes.in;
  const helperLi = `<li>Construct a TM ${h.name} that ignores its input and behaves as follows:${fill
    ? `<textarea class="pb-blank pb-free" data-blank="helper" data-free rows="4" aria-label="What ${h.name} does" data-show="${attr(ul(h.lines))}" placeholder="What does ${h.name} do? Say what happens when M(w) accepts, rejects, and loops."></textarea>`
    : ul(h.lines)}</li>`;
  const fixed = (sc.fixed || []).map(f => `<li>Construct a TM ${f.name} that ${f.text}.</li>`).join("");
  const a1 = flip ? "reject" : "accept", a2 = flip ? "accept" : "reject";
  const run = fill
    ? `<li>Run ${DL}(${sc.arg}). If it accepts, ${pick("acc", a1, ["accept", "reject"], "Step 2: if D_L accepts")}. If it rejects, ${pick("rej", a2, ["accept", "reject"], "Step 2: if D_L rejects")}.”</li>`
    : `<li>Run ${DL}(${sc.arg}). If it accepts, ${flip ? "<b>reject</b>" : "accept"}. If it rejects, ${flip ? "<b>accept</b>" : "reject"}.”</li>`;
  const kase = which => {
    const c = sc[which], yes = which === "yes", n = yes ? "Case 1" : "Case 2";
    const head = yes ? "If M(w) accepts" : "If M(w) does not accept (it rejects or loops)";
    const mem = c.in ? "∈" : "∉", out = yes ? "accepts" : "rejects";
    if (!fill) return `${head}, then ${c.pre} ${c.val}${c.why ? `, ${c.why}` : ""}, so ${sc.arg} ${mem} L. Then ${DATM} ${out}.`;
    return `${head}, then ${c.pre} ${blank(which + "v", c.alts, c.val, `${n}: ${strip(c.pre)} …`, c.keys)}, so ${sc.arg} ${pick(which + "m", mem, ["∈", "∉"], `${n}: ∈ or ∉ L`)} L. Then ${DATM} ${pick(which + "o", out, ["accepts", "rejects"], `${n}: what D_ATM does`)}.`;
  };
  return `<div class="rd">
    <div class="rd-part rd-setup"><span class="rd-tag">Setup</span>Assume there exists a decider ${DL} for L. We will use ${DL} to build a decider ${DATM} for ${ATM} as follows.</div>
    <div class="rd-part rd-build"><span class="rd-tag">Construction</span>${DATM} = “On input ⟨M, w⟩:<ol>${helperLi}${fixed}${run}</ol></div>
    <div class="rd-part rd-cases"><span class="rd-tag">Prove that ${DATM} decides ${ATM} if ${DL} decides L</span>
      <p class="rd-yes">${kase("yes")}</p>
      <p class="rd-no">${kase("no")}</p></div>
    <div class="rd-part rd-end"><span class="rd-tag">Conclusion</span>${DATM} always halts (it only constructs machines and runs the decider ${DL}), so it would decide ${ATM}. But ${ATM} is undecidable. Contradiction: L is undecidable. ∎</div>
    ${!fill && sc.note ? `<p class="rd-note">${sc.note}</p>` : ""}
  </div>`;
}

registerProofs([
  // ----------------------------------------------------------------------------------------------- Reductions
  {
    id: "reduction", title: "Prove a language is undecidable (reduction from A<sub>TM</sub>)", topic: "reductions-mw", minutes: 15,
    hints: [
      { label: "Walk through the “Accepts ε” reduction", href: "#/c/reductions/playground/walkthrough", key: "challenge:toc:walk:eps" },
      { label: "Your turn: ALL<sub>TM</sub>", href: "#/c/reductions/details/empty-string", key: "challenge:toc:turn:all" },
    ],
    puzzle: {
      id: "box-total", name: "Halts on everything", type: "order",
      theorem: `L = { ⟨M⟩ | M is a TM that halts on every input } is undecidable.`,
      steps: [
        `Assume there exists a decider ${DL} for L. We will use ${DL} to build a decider ${DATM} for ${ATM}.`,
        `${DATM} = “On input ⟨M, w⟩: construct a TM M₂ that ignores its input and runs M(w). If M(w) accepts, accept. If M(w) rejects, <b>loop forever</b>. If M(w) loops, loop.`,
        `Then run ${DL}(⟨M₂⟩). If it accepts, accept. If it rejects, reject.”`,
        `If M(w) accepts, then M₂ halts on every input, so ⟨M₂⟩ ∈ L. Then ${DATM} accepts.`,
        `If M(w) does not accept (it rejects or loops), then M₂ loops on every input, so ⟨M₂⟩ ∉ L. Then ${DATM} rejects.`,
        `${DATM} always halts, so it would decide ${ATM}. Contradiction: L is undecidable. ∎`,
      ],
      groups: [[3, 4]],
      distractors: [
        { html: `M₂ runs M(w) and does whatever M does: if M(w) rejects, reject.`, why: `Then if M rejects w, M₂ halts on everything (by rejecting), so ⟨M₂⟩ ∈ L even though M didn’t accept w. Rejecting must turn into looping.` },
        { html: `${DATM} runs M₂ on a few inputs to see if it halts.`, why: `M₂ might loop, and then ${DATM} isn’t a decider. Only ${DL} looks at M₂.` },
      ],
      done: "The twist here: “halts” counts rejecting, so the helper turns a reject into a loop.",
    },
    checklist: [
      { part: "setup", text: `Sets it up the right way round: assumes a decider ${DL} for L and uses it to build a decider ${DATM} for ${ATM}`, key: true },
      { part: "build", text: `Says exactly what each constructed machine does on its input, including when M(w) <b>rejects</b> or <b>loops</b>`, key: true },
      { part: "build", text: `${DATM} only <b>constructs</b> machines and runs ${DL} (never runs M on w itself), and says what it outputs for each answer of ${DL}`, key: true },
      { part: "yes", text: `Case M(w) accepts: says what the machine’s language (or behavior) is, so it’s in L, so ${DATM} accepts`, key: true },
      { part: "no", text: `Case M(w) does not accept (<b>rejects or loops</b>): says what it is then, so it’s not in L, so ${DATM} rejects`, key: true },
      { part: "end", text: `Ends with the contradiction: ${DATM} would decide ${ATM}, so L is undecidable`, key: false },
    ],
    scaffold: {
      model: sc => reduction(sc, false),
      fill: sc => reduction(sc, true),
      outline: `Setup:\n\n\nD_ATM = "On input ⟨M, w⟩:\n  1. Construct a TM M₂ that\n\n  2. Run D_L(   ). If it accepts, ___. If it rejects, ___."\n\nProve that D_ATM decides A_TM if D_L decides L:\nIf M(w) accepts, then\n\nIf M(w) does not accept (it rejects or loops), then\n\nConclusion:\n`,
      starters: [
        "Assume there exists a decider D_L for L. We will use D_L to build a decider D_ATM for A_TM as follows.",
        "Construct a TM M₂ that ignores its input and behaves as follows:",
        "Run M(w).",
        "Run D_L(⟨M₂⟩). If it accepts, accept. If it rejects, reject.",
        "so ⟨M₂⟩ ∈ L. Then D_ATM accepts.",
        "so ⟨M₂⟩ ∉ L. Then D_ATM rejects.",
        "D_ATM always halts, so it would decide A_TM. But A_TM is undecidable. Contradiction: L is undecidable. ∎",
      ],
      examples: [
        { id: "ex-even", kind: "plain", task: `L = { ⟨M⟩ | M is a TM that accepts some string of even length }`,
          sc: { kind: "plain", helper: { name: "M₂", lines: PLAIN }, arg: "⟨M₂⟩",
            yes: { pre: "L(M₂) =", val: "Σ*", why: "which contains 00, a string of even length", in: true },
            no: { pre: "L(M₂) =", val: "∅", why: "which contains no strings at all", in: false } } },
        { id: "ex-flip", kind: "flip", task: `L = { ⟨M⟩ | M is a TM that accepts no string starting with 0 }`,
          sc: { kind: "flip", helper: { name: "M₂", lines: PLAIN }, arg: "⟨M₂⟩",
            yes: { pre: "L(M₂) =", val: "Σ*", why: "which contains 0, a string starting with 0", in: false },
            no: { pre: "L(M₂) =", val: "∅", why: "which has no strings, so none starting with 0", in: true },
            note: "The twist: here ⟨M₂⟩ is in L exactly when M does <b>not</b> accept w, so step 2 flips D<sub>L</sub>’s answer." } },
        { id: "ex-loop", kind: "loop", task: `L = { ⟨M⟩ | M is a TM that halts on ε }`,
          sc: { kind: "loop", helper: { name: "M₂", lines: LOOPY }, arg: "⟨M₂⟩",
            yes: { pre: "M₂", val: "halts on every input, including ε", in: true },
            no: { pre: "M₂", val: "loops on every input, including ε", in: false },
            note: "The twist: halting includes rejecting, so M₂ turns a reject into a loop. Otherwise a machine that rejects w would land in L." } },
        { id: "ex-two", kind: "two", task: `L = { ⟨M₁, M₂⟩ | M₁, M₂ are TMs and L(M₁) ∩ L(M₂) = Σ* }`,
          sc: { kind: "two", helper: { name: "M₂", lines: PLAIN }, fixed: [{ name: "M₁", text: "accepts all strings" }], arg: "⟨M₁, M₂⟩",
            yes: { pre: "L(M₁) ∩ L(M₂) = Σ* ∩ Σ* =", val: "Σ*", in: true },
            no: { pre: "L(M₁) ∩ L(M₂) = Σ* ∩ ∅ =", val: "∅", why: "which is not Σ*", in: false },
            note: "With two machines, fix one (M₁ accepts everything) so the answer depends only on M₂." } },
      ],
    },
    prompts: [
      { id: "both01", task: `Let L = { ⟨M⟩ | M is a TM that accepts both 0 and 1 }. Show that L is undecidable by reducing ${ATM} to L.`,
        sc: { kind: "plain", helper: { name: "M₂", lines: PLAIN }, arg: "⟨M₂⟩",
          yes: { pre: "L(M₂) =", val: "Σ*", alts: SIGMA, keys: ["Σ*", "∅"], why: "so M₂ accepts both 0 and 1", in: true },
          no: { pre: "L(M₂) =", val: "∅", alts: EMPTY, keys: ["Σ*", "∅"], why: "so M₂ accepts neither 0 nor 1", in: false } } },
      { id: "infinite", task: `Let L = { ⟨M⟩ | M is a TM and L(M) is infinite }. Show that L is undecidable by reducing ${ATM} to L.`,
        sc: { kind: "plain", helper: { name: "M₂", lines: PLAIN }, arg: "⟨M₂⟩",
          yes: { pre: "L(M₂) =", val: "Σ*", alts: SIGMA, keys: ["Σ*", "∅"], why: "which is infinite", in: true },
          no: { pre: "L(M₂) =", val: "∅", alts: EMPTY, keys: ["Σ*", "∅"], why: "which is finite", in: false } } },
      { id: "empty", task: `Let L = { ⟨M⟩ | M is a TM and L(M) = ∅ }. Show that L is undecidable by reducing ${ATM} to L.`,
        sc: { kind: "flip", helper: { name: "M₂", lines: PLAIN }, arg: "⟨M₂⟩",
          yes: { pre: "L(M₂) =", val: "Σ*", alts: SIGMA, keys: ["Σ*", "∅"], why: "which is not empty", in: false },
          no: { pre: "L(M₂) =", val: "∅", alts: EMPTY, keys: ["Σ*", "∅"], in: true },
          note: "The twist: ⟨M₂⟩ ∈ L exactly when M does <b>not</b> accept w, so step 2 flips D<sub>L</sub>’s answer." } },
      { id: "intersect", task: `Let L = { ⟨M₁, M₂⟩ | M₁, M₂ are TMs and L(M₁) ∩ L(M₂) ≠ ∅ }. Show that L is undecidable by reducing ${ATM} to L.`,
        sc: { kind: "two", helper: { name: "M₂", lines: PLAIN }, fixed: [{ name: "M₁", text: "accepts all strings" }], arg: "⟨M₁, M₂⟩",
          yes: { pre: "L(M₁) ∩ L(M₂) = Σ* ∩ L(M₂) =", val: "Σ*", alts: SIGMA, keys: ["Σ*", "∅"], why: "which is not empty", in: true },
          no: { pre: "L(M₁) ∩ L(M₂) = Σ* ∩ L(M₂) =", val: "∅", alts: EMPTY, keys: ["Σ*", "∅"], in: false } } },
      { id: "total", task: `Let L = { ⟨M⟩ | M is a TM that halts on every input }. Show that L is undecidable by reducing ${ATM} to L.`,
        sc: { kind: "loop", helper: { name: "M₂", lines: LOOPY }, arg: "⟨M₂⟩",
          yes: { pre: "M₂", val: "halts on every input", alts: HALTS, in: true },
          no: { pre: "M₂", val: "loops on every input", alts: LOOPS, in: false },
          note: "Trap: with the plain helper, a machine that rejects w would make M₂ halt (by rejecting) on everything." } },
      { id: "short", task: `Let L = { ⟨M⟩ | M is a TM that accepts every string of length at most 2 }. Show that L is undecidable by reducing ${ATM} to L.`,
        sc: { kind: "plain", helper: { name: "M₂", lines: PLAIN }, arg: "⟨M₂⟩",
          yes: { pre: "L(M₂) =", val: "Σ*", alts: SIGMA, keys: ["Σ*", "∅"], why: "which contains every string of length at most 2", in: true },
          no: { pre: "L(M₂) =", val: "∅", alts: EMPTY, keys: ["Σ*", "∅"], why: "which doesn’t even contain ε", in: false } } },
      { id: "ww", task: `Let L = { ⟨M, s⟩ | M is a TM that accepts the string ss }. Show that L is undecidable by reducing ${ATM} to L. (You choose the string s that ${DATM} passes to ${DL}.)`,
        sc: { kind: "plain", helper: { name: "M₂", lines: PLAIN }, arg: "⟨M₂, ε⟩",
          yes: { pre: "L(M₂) =", val: "Σ*", alts: SIGMA, keys: ["Σ*", "∅"], why: "so M₂ accepts εε = ε", in: true },
          no: { pre: "L(M₂) =", val: "∅", alts: EMPTY, keys: ["Σ*", "∅"], why: "so M₂ does not accept εε = ε", in: false },
          note: "Any fixed s works here, because M₂ ignores its input. ε keeps it short." } },
    ],
  },

  // ----------------------------------------------------------------------------------------------- Mapping reductions
  {
    id: "mapping", title: "Give a mapping reduction", topic: "mapping", minutes: 10,
    hints: [
      { label: "Your turn: is this a mapping reduction?", href: "#/c/reductions/details/mapping", key: "challenge:toc:turn:mapping" },
    ],
    puzzle: {
      id: "box-mapping", name: "A_TM ≤_m ALL_TM", type: "order",
      theorem: `${ATM} ≤${sb("m")} ALL${sb("TM")}, where ALL${sb("TM")} = { ⟨M⟩ | L(M) = Σ* }.`,
      steps: [
        `Define f(⟨M, w⟩) = ⟨${Mw}⟩, where ${Mw}(x) = “ignore x; run M on w; output what it outputs.”`,
        `f is computable: it only writes down the code of ${Mw}, which always finishes. It never runs M.`,
        `If ⟨M, w⟩ ∈ ${ATM}, M accepts w, so ${Mw} accepts every x: f(⟨M, w⟩) ∈ ALL${sb("TM")}.`,
        `If ⟨M, w⟩ ∉ ${ATM}, M rejects or loops on w, so ${Mw} accepts nothing: L(${Mw}) = ∅ ≠ Σ*, and f(⟨M, w⟩) ∉ ALL${sb("TM")}.`,
        `So ⟨M, w⟩ ∈ ${ATM} ⇔ f(⟨M, w⟩) ∈ ALL${sb("TM")}: f is a mapping reduction. ∎`,
      ],
      groups: [[2, 3]],
      distractors: [
        { html: `f is computable because it runs M on w and returns ⟨M⟩ if M accepts.`, why: "Running M on w can loop forever, so that f wouldn’t always halt. A mapping reduction only rewrites the input." },
        { html: `f only needs to send strings in ${ATM} into ALL${sb("TM")}.`, why: "Both directions are needed: strings outside A must land outside B too." },
      ],
      done: "Define f, say why it’s computable, then check both directions.",
    },
    checklist: [
      { text: "Defines f precisely: what it outputs for every input", key: true },
      { text: "Says why f is <b>computable</b> (it always halts: it only rewrites/writes code)", key: true },
      { text: "Shows w ∈ A ⇒ f(w) ∈ B", key: true },
      { text: "Shows w ∉ A ⇒ f(w) ∉ B (including the <b>loop</b> case)", key: true },
      { text: "Doesn’t flip the answer (a mapping reduction can’t negate)", key: false },
    ],
    prompts: [
      { id: "acc01", task: `Let B = { ⟨M⟩ | M is a TM that accepts 01 }. Give a mapping reduction from ${ATM} to B.`,
        model: `f(⟨M, w⟩) = ⟨${Mw}⟩ with ${Mw}(x) = “ignore x; run M on w; output what it outputs.” Computable: it only writes code.<br>⟨M, w⟩ ∈ ${ATM} ⇒ ${Mw} accepts everything, including 01 ⇒ f(⟨M, w⟩) is in B.<br>⟨M, w⟩ ∉ ${ATM} (M rejects or loops on w) ⇒ ${Mw} accepts nothing, so not 01 ⇒ f(⟨M, w⟩) ∉ B. ∎` },
      { id: "cofinite", task: `Let B = { ⟨M⟩ | M is a TM and L(M) is infinite } (the complement of FINITE${sb("TM")}). Give a mapping reduction from ${ATM} to B.`,
        model: `f(⟨M, w⟩) = ⟨${Mw}⟩, the usual helper. Computable: only writes code.<br>M accepts w ⇒ L(${Mw}) = Σ*, infinite ⇒ in B.<br>M rejects or loops on w ⇒ L(${Mw}) = ∅, finite ⇒ not in B. ∎<br>(Notice this is <b>not</b> a mapping reduction to FINITE${sb("TM")} itself: it would land on the wrong side.)` },
      { id: "complement", task: `Explain why, if f is a mapping reduction from A to B, the same f is a mapping reduction from <span class='ovl'>A</span> to <span class='ovl'>B</span>.`,
        model: `f satisfies w ∈ A ⇔ f(w) ∈ B for every w. Negating both sides: w ∉ A ⇔ f(w) ∉ B, that is, w ∈ <span class='ovl'>A</span> ⇔ f(w) ∈ <span class='ovl'>B</span>. And f is still computable. ∎` },
      { id: "eps-map", task: `Let B = E${sb("TM")} = { ⟨M⟩ | M is a TM that accepts ε } (this class’s meaning). Give a mapping reduction from ${ATM} to B.`,
        model: `f(⟨M, w⟩) = ⟨${Mw}⟩, ${Mw}(x) = “ignore x; run M on w; output what it outputs.” Computable: only writes code.<br>M accepts w ⇒ ${Mw} accepts ε ⇒ in E${sb("TM")}.<br>M rejects w ⇒ ${Mw} rejects ε; M loops on w ⇒ ${Mw} loops on ε. Either way it doesn’t accept ε ⇒ not in E${sb("TM")}. ∎` },
    ],
  },

  // ----------------------------------------------------------------------------------------------- Countable
  {
    id: "countable", title: "Prove a set is countable", topic: "countable", minutes: 10,
    hints: [
      { label: "Your turn: countable or not?", href: "#/c/countability/details/countable", key: "challenge:toc:turn:countable-sort" },
    ],
    puzzle: {
      id: "box-countable", name: "Finite subsets of ℕ", type: "order",
      theorem: "The set F of all finite subsets of ℕ is countable.",
      steps: [
        "It’s enough to give a one-to-one map from F into a set we know is countable.",
        "Map each finite set S = {a₁ < a₂ < … < aₖ} to the string “a₁,a₂,…,aₖ” over the alphabet {0, 1, …, 9, comma} (the empty set goes to ε).",
        "Listing the elements in increasing order means each set gets exactly one string.",
        "Two different sets differ in some element, so their strings differ: the map is one-to-one.",
        "Strings over a finite alphabet are countable, so F is countable. ∎",
      ],
      groups: [[2, 3]],
      distractors: [
        { html: "List them by size: first all sets with 1 element, then all with 2 elements, …", why: "There are infinitely many 1-element sets, so you’d never get to the 2-element ones." },
        { html: "F is a subset of 𝒫(ℕ), which is uncountable, so F is uncountable.", why: "Being inside an uncountable set doesn’t make a set uncountable (ℕ is inside ℝ)." },
      ],
      done: "The recipe: give each element its own finite string.",
    },
    checklist: [
      { text: "Gives an explicit encoding or listing (each element → a string or a natural number, or a list order)", key: true },
      { text: "Shows it’s <b>one-to-one</b> (different elements → different strings/numbers), or that every element appears in the list", key: true },
      { text: "Uses that strings over a finite alphabet (or ℕ) are countable", key: true },
      { text: "Avoids lists that never reach some elements (like “all of one infinite group first”)", key: false },
    ],
    prompts: [
      { id: "finz", task: "Prove that the set of all finite subsets of ℤ is countable.",
        model: "Map S = {a₁ < a₂ < … < aₖ} to the string “a₁,a₂,…,aₖ” over {0–9, −, comma} (∅ ↦ ε). Listing in increasing order gives each set one string; different sets have different elements, so different strings. The map is one-to-one into a set of strings over a finite alphabet, which is countable. So the set is countable. ∎" },
      { id: "qq", task: "Prove that ℚ × ℚ (pairs of rational numbers) is countable.",
        model: "Write each rational in lowest terms m/n with n > 0, then map the pair (p, q) to the string “p;q”, e.g. (−1/2, 3/1) ↦ “−1/2;3/1”, over {0–9, −, /, ;}. Lowest terms gives each rational one form, so different pairs give different strings: one-to-one into a countable set of strings. ∎" },
      { id: "python", task: "Prove that the set of all Python programs is countable.",
        model: "Each program is a finite text file: a finite string over the finite set of characters a program may use. Different programs are different strings, so the identity map is one-to-one into the strings over that alphabet, which are countable. ∎" },
      { id: "eventually0", task: "Prove that the set of infinite binary sequences that are eventually all 0s (only finitely many 1s) is countable.",
        model: "Such a sequence s has a last 1, at some position k (or no 1s at all). Map s to the finite string s₁s₂…sₖ (or ε for all 0s). Two different such sequences differ at some position; both are 0 after their last 1, so they differ within their prefixes, and the strings differ. One-to-one into {0,1}*, which is countable. ∎" },
    ],
  },

  // ----------------------------------------------------------------------------------------------- Uncountable
  {
    id: "uncountable", title: "Prove a set is uncountable", topic: "uncountable", minutes: 12,
    hints: [
      { label: "Your turn: diagonalize the digit sequences", href: "#/c/countability/details/uncountable", key: "challenge:toc:turn:diag-digits" },
      { label: "Flip the diagonal: Your turn mode", href: "#/c/countability/playground/diagonal", key: "challenge:toc:diagonal-turn:sequences" },
    ],
    puzzle: {
      id: "box-abc", name: "Sequences over {a, b, c}", type: "order",
      theorem: "The set T of all infinite sequences over {a, b, c} is uncountable.",
      steps: [
        "Assume, for contradiction, that T is countable, so its elements can be listed t₁, t₂, t₃, … with every sequence somewhere on the list.",
        "Build t*: its i-th symbol is a if the i-th symbol of tᵢ is b or c, and b if it is a.",
        "Then t* differs from each tᵢ at position i.",
        "So t* is not on the list.",
        "But t* is an infinite sequence over {a, b, c}, so it should be on the list. Contradiction: T is uncountable. ∎",
      ],
      groups: [],
      distractors: [
        { html: "Build t* by flipping every symbol of t₁.", why: "That only guarantees t* ≠ t₁. It has to differ from every tᵢ, one position each." },
        { html: "Add t* to the list, which fixes it.", why: "The proof works for every list. Adding t* gives a new list, which has its own missing diagonal sequence." },
      ],
      done: "The recipe: assume a list, change the diagonal, show the new element is missing.",
    },
    checklist: [
      { text: "Either assumes a list of all elements (proof by contradiction) <b>or</b> gives a one-to-one map from a known uncountable set <b>into</b> the set", key: true },
      { text: "Diagonal: defines the new element explicitly, differing from the i-th element at position i", key: true },
      { text: "Shows the new element differs from <b>every</b> listed element (or, for a map, why it’s one-to-one)", key: true },
      { text: "Concludes with the contradiction (the list was supposed to have everything)", key: true },
      { text: "Map proofs: the map goes from the uncountable set into the new one, not the other way", key: false },
    ],
    prompts: [
      { id: "abc", task: "Prove that the set of all infinite sequences over {a, b, c} is uncountable.",
        model: "Assume it is countable: list all sequences t₁, t₂, …. Define t* by: symbol i of t* is a if symbol i of tᵢ is b or c, and b if it is a. Then t* differs from every tᵢ at position i, so t* is not on the list. But t* is such a sequence. Contradiction, so the set is uncountable. ∎" },
      { id: "evens", task: "Prove that the set of all subsets of the even numbers is uncountable.",
        model: "Map each infinite binary sequence s = s₁s₂s₃… to the set f(s) = { 2i | sᵢ = 1 }. If s ≠ t, they differ at some position i, so 2i is in exactly one of f(s), f(t): f is one-to-one. The infinite binary sequences are uncountable, so the set of subsets of the evens is too. ∎ (A direct diagonal proof also works: list the subsets E₁, E₂, …, and let E* contain 2i exactly when 2i ∉ Eᵢ.)" },
      { id: "langab", task: "Prove that the set of all languages over {a, b} is uncountable.",
        model: "List all strings over {a, b} as w₁, w₂, w₃, … (they’re countable). Map each infinite binary sequence s to the language L(s) = { wᵢ | sᵢ = 1 }. Different sequences differ at some i, so exactly one of the two languages contains wᵢ: one-to-one. The sequences are uncountable, so the languages are too. ∎" },
    ],
  },

  // ----------------------------------------------------------------------------------------------- Rice
  {
    id: "rice", title: "Use Rice’s theorem", topic: "rice", minutes: 8,
    hints: [
      { label: "Your turn: write a Rice proof", href: "#/c/rice/details/using", key: "challenge:toc:turn:rice" },
    ],
    puzzle: {
      id: "box-rice", name: "Contains 0110", type: "order",
      theorem: "{ ⟨M⟩ | 0110 ∈ L(M) } is undecidable.",
      steps: [
        "Let P = the set of TMs M with 0110 ∈ L(M). We check the two conditions of Rice’s theorem.",
        "Only the language matters: if L(M) = L(M′), then 0110 ∈ L(M) ⇔ 0110 ∈ L(M′).",
        "Some TM is in P: a machine that accepts everything.",
        "Some TM is not in P: a machine that rejects everything.",
        "So P is a non-trivial property of the language, and by Rice’s theorem { ⟨M⟩ | M ∈ P } is undecidable. ∎",
      ],
      groups: [[2, 3]],
      distractors: [
        { html: "Some TM is not in P: a machine with more than 0110 states.", why: "The number of states isn’t about the language. You need a machine whose <b>language</b> doesn’t contain 0110." },
        { html: "Run M on 0110 to check the property.", why: "That only recognizes the language (it can loop). Rice’s theorem is what proves no decider exists." },
      ],
      done: "Rice in three lines: it depends only on L(M), some TM has it, some TM doesn’t.",
    },
    checklist: [
      { text: "Shows the property depends <b>only on L(M)</b>: machines with the same language agree", key: true },
      { text: "Gives a <b>specific</b> TM that has the property", key: true },
      { text: "Gives a <b>specific</b> TM that doesn’t", key: true },
      { text: "Concludes with Rice’s theorem (the language of encodings is undecidable)", key: true },
      { text: "Doesn’t use Rice on a property of the machine itself (states, steps, code)", key: false },
    ],
    prompts: [
      { id: "three", task: "Let L = { ⟨M⟩ | M is a TM and L(M) has exactly 3 strings }. Use Rice’s theorem to prove L is undecidable.",
        model: "Only the language matters: if L(M) = L(M′), both have the same number of strings. Non-trivial: a TM that accepts exactly ε, 0 and 1 (and rejects everything else) is in it; a TM that rejects everything (L = ∅) is not. By Rice’s theorem, the language is undecidable. ∎" },
      { id: "palin", task: "Let L = { ⟨M⟩ | M is a TM and every string in L(M) is a palindrome }. Use Rice’s theorem to prove L is undecidable.",
        model: "Depends only on L(M). Non-trivial: a TM that rejects everything has L = ∅, and every string in ∅ is a palindrome (vacuously), so it’s in. A TM that accepts everything has 01 ∈ L, not a palindrome, so it’s out. By Rice’s theorem, undecidable. ∎" },
      { id: "regular", task: "Let L = REGULAR" + sb("TM") + " = { ⟨M⟩ | M is a TM and L(M) is regular }. Use Rice’s theorem to prove L is undecidable.",
        model: "Depends only on L(M). Non-trivial: a TM accepting everything has L = Σ*, regular, so it’s in; a TM deciding {0ⁿ1ⁿ} (cross off matching 0s and 1s) has a non-regular language, so it’s out. By Rice’s theorem, undecidable. ∎ (Same result as the lecture’s reduction, in three lines.)" },
      { id: "notrice", task: "Let L = { ⟨M⟩ | M is a TM with at most 10 states }. Is L decidable? Can Rice’s theorem be used? Explain.",
        model: "Rice’s theorem doesn’t apply: two machines can have the same language and different numbers of states, so this isn’t a property of L(M). And it’s decidable: read ⟨M⟩ and count the states (always halts). ∎" },
    ],
  },

  // ----------------------------------------------------------------------------------------------- Unrecognizable
  {
    id: "unrecognizable", title: "Prove a language is unrecognizable", topic: "recognizability", minutes: 10,
    hints: [
      { label: "Your turn: prove a language is unrecognizable", href: "#/c/recognizability/details/co-recognizable", key: "challenge:toc:turn:corec" },
    ],
    puzzle: {
      id: "box-cohalt", name: "Complement of HALT", type: "order",
      theorem: "The complement of HALT, { ⟨M, w⟩ | M does not halt on w }, is not recognizable.",
      steps: [
        "Theorem (lecture): if a language and its complement are both recognizable, the language is decidable.",
        "HALT is recognizable: run M on w and accept if it halts.",
        "HALT is undecidable (by reduction from A<sub>TM</sub>).",
        "If the complement of HALT were recognizable, then HALT and its complement would both be recognizable, so HALT would be decidable.",
        "That’s a contradiction, so the complement of HALT is not recognizable. ∎",
      ],
      groups: [[1, 2]],
      distractors: [
        { html: "Recognize the complement by running M on w and accepting if it loops.", why: "You can never tell that M loops: it might halt one step later. That’s exactly why this fails." },
        { html: "HALT is undecidable, so its complement is unrecognizable.", why: "Undecidable alone isn’t enough (HALT itself is undecidable but recognizable). You also need HALT recognizable." },
      ],
      done: "The recipe: L recognizable + L undecidable ⇒ <span class='ovl'>L</span> unrecognizable.",
    },
    checklist: [
      { text: "States the theorem being used (L and <span class='ovl'>L</span> both recognizable ⇒ L decidable), or uses a mapping reduction from an unrecognizable language", key: true },
      { text: "Shows the <b>other</b> language is recognizable, with a recognizer", key: true },
      { text: "Shows (or cites) that it’s undecidable", key: true },
      { text: "Concludes: if this one were recognizable too, that would be decidable, a contradiction", key: true },
    ],
    prompts: [
      { id: "coeps", task: "Let L = { ⟨M⟩ | M is a TM that does not accept ε }. Prove that L is not recognizable.",
        model: "Its complement is E" + sb("TM") + " = { ⟨M⟩ | M accepts ε }. E" + sb("TM") + " is recognizable: run M on ε and accept if it accepts. E" + sb("TM") + " is undecidable (by reduction from A" + sb("TM") + "). If its complement were also recognizable, E" + sb("TM") + " would be decidable by the theorem. Contradiction, so the language is not recognizable. ∎" },
      { id: "coatm", task: "Prove that the complement of A" + sb("TM") + " is not recognizable.",
        model: "A" + sb("TM") + " is recognizable (the universal TM runs M on w and accepts if M accepts) and undecidable. If its complement were recognizable, A" + sb("TM") + " would be decidable by the theorem. Contradiction. ∎" },
      { id: "coboth", task: "Let L = { ⟨M⟩ | M is a TM that accepts neither 0 nor 1 }. Prove that L is not recognizable. (Hint: its complement is { ⟨M⟩ | M accepts 0 or 1 }.)",
        model: "The complement C = { ⟨M⟩ | M accepts 0 or 1 } is recognizable: run M on 0 and on 1 in parallel (alternating steps), and accept if either accepts. C is undecidable (Rice’s theorem: it depends only on L(M); accept-everything is in, reject-everything is out). If the given language were recognizable too, C would be decidable. Contradiction. ∎" },
    ],
  },
]);
})();
