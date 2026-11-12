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
      theorem: `TOTAL${sb("TM")} = { ⟨M⟩ | M halts on every input } is undecidable.`,
      steps: [
        `Assume, for contradiction, that a TM ${D("T")} decides TOTAL${sb("TM")}.`,
        `Build ${D("A")}: on input ⟨M, w⟩, write the code of ${Mw}(x): “run M on w; if M accepts, accept; if M rejects, loop forever.”`,
        `Then ${D("A")} outputs ${D("T")}(⟨${Mw}⟩). It always halts: it only writes code, and ${D("T")} always halts.`,
        `If M accepts w, ${Mw} accepts (so halts on) every input. If M rejects or loops on w, ${Mw} loops on every input.`,
        `So ${Mw} ∈ TOTAL${sb("TM")} ⇔ M accepts w, and ${D("A")} decides ${ATM}.`,
        `But ${ATM} is undecidable. Contradiction, so TOTAL${sb("TM")} is undecidable. ∎`,
      ],
      groups: [[2, 3]],
      distractors: [
        { html: `${Mw}(x): “run M on w and output what it outputs.”`, why: `Then if M rejects w, ${Mw} halts on everything (by rejecting), so it would be in TOTAL${sb("TM")} even though M didn’t accept w. Rejecting must turn into looping.` },
        { html: `${D("A")} runs ${Mw} on a few inputs to see if it halts.`, why: `${Mw} might loop, and then ${D("A")} isn’t a decider. Only ${D("T")} looks at ${Mw}.` },
      ],
      done: "The twist here: “halts” counts rejecting, so the helper turns a reject into a loop.",
    },
    checklist: [
      { text: `Reduces <b>${ATM} to the new language</b>: assumes a decider for the new language and builds a decider for ${ATM}`, key: true },
      { text: `${D("A")} only <b>writes code</b> (never runs M on w itself)`, key: true },
      { text: `Defines the helper machine(s) precisely: what it does on an input x`, key: true },
      { text: `States the key point: helper ∈ new language ⇔ M accepts w`, key: true },
      { text: `Checks all three cases: M accepts w, rejects w, <b>loops on w</b>`, key: true },
      { text: `Says why ${D("A")} always halts`, key: false },
      { text: `Ends with the contradiction (${ATM} is undecidable)`, key: false },
    ],
    prompts: [
      { id: "both01", task: `Prove that { ⟨M⟩ | M accepts both 0 and 1 } is undecidable.`,
        model: `Assume ${D("B")} decides it. Build ${D("A")}(⟨M, w⟩): write ${Mw}(x) = “ignore x; run M on w; output what it outputs”, then output ${D("B")}(⟨${Mw}⟩).<br><b>Halts:</b> ${D("A")} only writes code, and ${D("B")} always halts.<br><b>Key point:</b> if M accepts w, ${Mw} accepts everything, including 0 and 1. If M rejects or loops on w, ${Mw} accepts nothing. So ${Mw} accepts 0 and 1 ⇔ M accepts w.<br>So ${D("A")} decides ${ATM}, a contradiction. ∎` },
      { id: "infinite", task: `Prove that INFINITE${sb("TM")} = { ⟨M⟩ | L(M) is infinite } is undecidable.`,
        model: `Assume ${D("I")} decides it. ${D("A")}(⟨M, w⟩) writes ${Mw}(x) = “ignore x; run M on w; output what it outputs” and outputs ${D("I")}(⟨${Mw}⟩).<br><b>Halts:</b> it only writes code; ${D("I")} always halts.<br><b>Cases:</b> M accepts w ⇒ L(${Mw}) = Σ*, infinite, so ${D("I")} accepts. M rejects or loops on w ⇒ L(${Mw}) = ∅, finite, so ${D("I")} rejects.<br><b>Key point:</b> L(${Mw}) is infinite ⇔ M accepts w. So ${D("A")} decides ${ATM}: contradiction. ∎` },
      { id: "intersect", task: `Prove that { ⟨M₁, M₂⟩ | L(M₁) ∩ L(M₂) ≠ ∅ } is undecidable.`,
        model: `Assume ${D("X")} decides it. ${D("A")}(⟨M, w⟩) writes M₁ = “accept every input” and M₂ = ${Mw} = “ignore x; run M on w; output what it outputs”, and outputs ${D("X")}(⟨M₁, M₂⟩).<br><b>Halts:</b> only writes code; ${D("X")} always halts.<br><b>Key point:</b> L(M₁) ∩ L(M₂) = Σ* ∩ L(${Mw}) = L(${Mw}), which is Σ* (nonempty) if M accepts w and ∅ if M rejects or loops on w. So the intersection is nonempty ⇔ M accepts w.<br>So ${D("A")} decides ${ATM}: contradiction. ∎` },
      { id: "ww", task: `Prove that { ⟨M, s⟩ | M accepts the string ss } is undecidable. (You get to choose the string s too.)`,
        model: `Assume ${D("S")} decides it. ${D("A")}(⟨M, w⟩) writes ${Mw}(x) = “ignore x; run M on w; output what it outputs” and outputs ${D("S")}(⟨${Mw}, ε⟩). (Any s works, since ${Mw} ignores its input; with s = ε, ss = ε.)<br><b>Halts:</b> only writes code; ${D("S")} always halts.<br><b>Key point:</b> ${Mw} accepts εε = ε ⇔ M accepts w (if M loops on w, ${Mw} loops on ε, so it doesn’t accept).<br>So ${D("A")} decides ${ATM}: contradiction. ∎` },
      { id: "total", task: `Prove that TOTAL${sb("TM")} = { ⟨M⟩ | M halts on every input } is undecidable.`,
        model: `Assume ${D("T")} decides it. ${D("A")}(⟨M, w⟩) writes ${Mw}(x) = “run M on w; if M accepts, accept; if M rejects, <b>loop forever</b>”, and outputs ${D("T")}(⟨${Mw}⟩).<br><b>Halts:</b> only writes code; ${D("T")} always halts.<br><b>Cases:</b> M accepts w ⇒ ${Mw} halts (accepts) on every input. M rejects w ⇒ ${Mw} loops on every input. M loops on w ⇒ ${Mw} loops on every input.<br><b>Key point:</b> ${Mw} halts on every input ⇔ M accepts w. So ${D("A")} decides ${ATM}: contradiction. ∎<br><i>Trap:</i> with the plain helper, a reject would count as halting.` },
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
      { id: "acc01", task: `Give a mapping reduction from ${ATM} to { ⟨M⟩ | M accepts 01 }.`,
        model: `f(⟨M, w⟩) = ⟨${Mw}⟩ with ${Mw}(x) = “ignore x; run M on w; output what it outputs.” Computable: it only writes code.<br>⟨M, w⟩ ∈ ${ATM} ⇒ ${Mw} accepts everything, including 01 ⇒ f(⟨M, w⟩) is in B.<br>⟨M, w⟩ ∉ ${ATM} (M rejects or loops on w) ⇒ ${Mw} accepts nothing, so not 01 ⇒ f(⟨M, w⟩) ∉ B. ∎` },
      { id: "cofinite", task: `Give a mapping reduction from ${ATM} to the complement of FINITE${sb("TM")}, i.e. to { ⟨M⟩ | L(M) is infinite }.`,
        model: `f(⟨M, w⟩) = ⟨${Mw}⟩, the usual helper. Computable: only writes code.<br>M accepts w ⇒ L(${Mw}) = Σ*, infinite ⇒ in B.<br>M rejects or loops on w ⇒ L(${Mw}) = ∅, finite ⇒ not in B. ∎<br>(Notice this is <b>not</b> a mapping reduction to FINITE${sb("TM")} itself: it would land on the wrong side.)` },
      { id: "complement", task: `Explain why, if f is a mapping reduction from A to B, the same f is a mapping reduction from Ā to B̄.`,
        model: `f satisfies w ∈ A ⇔ f(w) ∈ B for every w. Negating both sides: w ∉ A ⇔ f(w) ∉ B, that is, w ∈ Ā ⇔ f(w) ∈ B̄. And f is still computable. ∎` },
      { id: "eps-map", task: `Give a mapping reduction from ${ATM} to E${sb("TM")} = { ⟨M⟩ | M accepts ε } (this class’s meaning).`,
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
      { id: "three", task: "Use Rice’s theorem to prove { ⟨M⟩ | L(M) has exactly 3 strings } is undecidable.",
        model: "Only the language matters: if L(M) = L(M′), both have the same number of strings. Non-trivial: a TM that accepts exactly ε, 0 and 1 (and rejects everything else) is in it; a TM that rejects everything (L = ∅) is not. By Rice’s theorem, the language is undecidable. ∎" },
      { id: "palin", task: "Use Rice’s theorem to prove { ⟨M⟩ | every string in L(M) is a palindrome } is undecidable.",
        model: "Depends only on L(M). Non-trivial: a TM that rejects everything has L = ∅, and every string in ∅ is a palindrome (vacuously), so it’s in. A TM that accepts everything has 01 ∈ L, not a palindrome, so it’s out. By Rice’s theorem, undecidable. ∎" },
      { id: "regular", task: "Use Rice’s theorem to prove REGULAR" + sb("TM") + " = { ⟨M⟩ | L(M) is regular } is undecidable.",
        model: "Depends only on L(M). Non-trivial: a TM accepting everything has L = Σ*, regular, so it’s in; a TM deciding {0ⁿ1ⁿ} (cross off matching 0s and 1s) has a non-regular language, so it’s out. By Rice’s theorem, undecidable. ∎ (Same result as the lecture’s reduction, in three lines.)" },
      { id: "notrice", task: "Is { ⟨M⟩ | M has at most 10 states } decidable? Can Rice’s theorem be used? Explain.",
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
      done: "The recipe: L recognizable + L undecidable ⇒ L̄ unrecognizable.",
    },
    checklist: [
      { text: "States the theorem being used (L and L̄ both recognizable ⇒ L decidable), or uses a mapping reduction from an unrecognizable language", key: true },
      { text: "Shows the <b>other</b> language is recognizable, with a recognizer", key: true },
      { text: "Shows (or cites) that it’s undecidable", key: true },
      { text: "Concludes: if this one were recognizable too, that would be decidable, a contradiction", key: true },
    ],
    prompts: [
      { id: "coeps", task: "Prove that { ⟨M⟩ | M does not accept ε } is not recognizable.",
        model: "Its complement is E" + sb("TM") + " = { ⟨M⟩ | M accepts ε }. E" + sb("TM") + " is recognizable: run M on ε and accept if it accepts. E" + sb("TM") + " is undecidable (by reduction from A" + sb("TM") + "). If its complement were also recognizable, E" + sb("TM") + " would be decidable by the theorem. Contradiction, so the language is not recognizable. ∎" },
      { id: "coatm", task: "Prove that the complement of A" + sb("TM") + " is not recognizable.",
        model: "A" + sb("TM") + " is recognizable (the universal TM runs M on w and accepts if M accepts) and undecidable. If its complement were recognizable, A" + sb("TM") + " would be decidable by the theorem. Contradiction. ∎" },
      { id: "coboth", task: "Prove that { ⟨M⟩ | M accepts neither 0 nor 1 } is not recognizable. (Hint: its complement is { ⟨M⟩ | M accepts 0 or 1 }.)",
        model: "The complement C = { ⟨M⟩ | M accepts 0 or 1 } is recognizable: run M on 0 and on 1 in parallel (alternating steps), and accept if either accepts. C is undecidable (Rice’s theorem: it depends only on L(M); accept-everything is in, reject-everything is out). If the given language were recognizable too, C would be decidable. Contradiction. ∎" },
    ],
  },
]);
})();
