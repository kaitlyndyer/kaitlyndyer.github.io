// Midterm 2 bank, matched to the practice midterm's format: 10 true/false, 2 short answers ("prove it or find a
// counterexample"), and 3 reductions from A_TM written without Rice's theorem, in the solution's style:
// "Assume a decider D_L … build D_ATM … prove D_ATM decides A_TM: if M accepts w … if M does not accept w …".
// Every question is new: none from the problem sets, the practice midterm, or the Proof Box prompts.
//   reduce { q, model, checklist, explain }   self-graded with the checklist (questions.js), 5 items × 2 = 10 points
//   short  { q, model, checklist, explain }   self-graded, 5 items = 5 points
(function () {
"use strict";
const sb = s => `<sub>${s}</sub>`;
const ATM = `A${sb("TM")}`, DA = `D${sb("ATM")}`, Mw = `M${sb("w")}`;
const D = x => `D${sb(x)}`;

// ---------------------------------------------------------------------------------------------- Reductions
// A model answer in the solution's shape. machines: [[name, [lines]]], call: how D_ATM uses D_L,
// yes / no: the two cases (M accepts w; M rejects or loops on w).
function model({ L, dl, machines, call, yes, no, note }) {
  const mach = machines.map(([name, lines], k) => `<li>Construct a TM ${name} that ${lines.length > 1 ? `works as follows on input x:<ul>${lines.map(l => `<li>${l}</li>`).join("")}</ul>` : lines[0]}</li>`).join("");
  return `<p>Assume there is a decider ${dl} for ${L}. We use it to build a decider ${DA} for ${ATM}.</p>
    <p>${DA} = “On input ⟨M, w⟩:<ol>${mach}<li>${call}</li></ol>”</p>
    <p>${DA} always halts: it only <b>writes</b> machine descriptions (it never runs M on w itself), and ${dl} always halts.</p>
    <p><b>${DA} decides ${ATM} if ${dl} decides ${L}:</b></p>
    <ul><li><b>If M accepts w:</b> ${yes}</li><li><b>If M does not accept w</b> (it rejects or loops): ${no}</li></ul>
    <p>So ${DA} decides ${ATM}, which is undecidable. Contradiction: ${L} is undecidable. ∎</p>${note ? `<p class="muted">${note}</p>` : ""}`;
}
const CHECK = (helper, key) => [
  `Sets up the reduction the right way round: assumes a decider for L and uses it to build a decider ${DA} for ${ATM} on input ⟨M, w⟩.`,
  `Defines the machine(s) ${DA} constructs precisely (${helper}), and ${DA} never runs M on w itself.`,
  `Says how ${DA} uses the decider for L and why ${DA} always halts.`,
  `Case M accepts w: shows ${key.yes}, so ${DA} accepts.`,
  `Case M does not accept w (<b>rejects or loops</b>): shows ${key.no}, so ${DA} rejects. Concludes L is undecidable without using Rice’s theorem.`,
];
const RUN = `ignores x; runs M on w; if M accepts, accepts (if M rejects, rejects; if M loops, loops)`;

const REDUCE = [
  {
    id: "len3", L: `L = { ⟨M⟩ | M accepts at least one string of length exactly 3 }`,
    m: { L: "L", dl: D("L"), machines: [[Mw, [RUN]]], call: `Run ${D("L")}(⟨${Mw}⟩). If it accepts, accept. If it rejects, reject.`,
      yes: `${Mw} accepts every input, including 000, so ⟨${Mw}⟩ ∈ L and ${DA} accepts.`,
      no: `${Mw} accepts nothing, so it accepts no string of length 3. ⟨${Mw}⟩ ∉ L and ${DA} rejects.` },
    helper: `e.g. ${Mw}: ignore x, run M on w`, key: { yes: `⟨${Mw}⟩ ∈ L (it accepts every string, so some of length 3)`, no: `⟨${Mw}⟩ ∉ L (it accepts nothing)` },
    explain: `The all-or-nothing helper: ${Mw} accepts everything if M accepts w, and nothing otherwise.`,
  },
  {
    id: "two", L: `L = { ⟨M⟩ | L(M) contains at least two strings }`,
    m: { L: "L", dl: D("L"), machines: [[Mw, [RUN]]], call: `Run ${D("L")}(⟨${Mw}⟩) and output its answer.`,
      yes: `L(${Mw}) = Σ*, which has (infinitely) many strings, so ⟨${Mw}⟩ ∈ L and ${DA} accepts.`,
      no: `L(${Mw}) = ∅, which has no strings, so ⟨${Mw}⟩ ∉ L and ${DA} rejects.` },
    helper: `e.g. ${Mw}: ignore x, run M on w`, key: { yes: `L(${Mw}) = Σ*, so ⟨${Mw}⟩ ∈ L`, no: `L(${Mw}) = ∅, so ⟨${Mw}⟩ ∉ L` },
    explain: `Same helper as always. Σ* has at least two strings and ∅ has none.`,
  },
  {
    id: "starts1", L: `L = { ⟨M⟩ | M accepts some string that starts with 1 }`,
    m: { L: "L", dl: D("L"), machines: [[Mw, [RUN]]], call: `Run ${D("L")}(⟨${Mw}⟩) and output its answer.`,
      yes: `${Mw} accepts every string, including 1, so ⟨${Mw}⟩ ∈ L and ${DA} accepts.`,
      no: `${Mw} accepts no string at all, so none starting with 1. ⟨${Mw}⟩ ∉ L and ${DA} rejects.` },
    helper: `e.g. ${Mw}: ignore x, run M on w`, key: { yes: `${Mw} accepts 1, so ⟨${Mw}⟩ ∈ L`, no: `${Mw} accepts nothing, so ⟨${Mw}⟩ ∉ L` },
    explain: `Any property that Σ* has and ∅ doesn’t works with the all-or-nothing helper.`,
  },
  {
    id: "union-all", L: `L = { ⟨M₁, M₂⟩ | L(M₁) ∪ L(M₂) = Σ* }`,
    m: { L: "L", dl: D("L"), machines: [["M₁", ["rejects every input (so L(M₁) = ∅)."]], ["M₂", [RUN]]],
      call: `Run ${D("L")}(⟨M₁, M₂⟩) and output its answer.`,
      yes: `L(M₂) = Σ*, so L(M₁) ∪ L(M₂) = Σ*. ⟨M₁, M₂⟩ ∈ L and ${DA} accepts.`,
      no: `L(M₂) = ∅, so L(M₁) ∪ L(M₂) = ∅ ≠ Σ*. ⟨M₁, M₂⟩ ∉ L and ${DA} rejects.` },
    helper: `M₁ rejects everything; M₂ ignores x and runs M on w`, key: { yes: `L(M₁) ∪ L(M₂) = Σ*`, no: `L(M₁) ∪ L(M₂) = ∅ ≠ Σ*` },
    explain: `With two machines, fix one (M₁ accepts nothing) so the answer depends only on the other.`,
  },
  {
    id: "neq", L: `L = { ⟨M₁, M₂⟩ | L(M₁) ≠ L(M₂) }`,
    m: { L: "L", dl: D("L"), machines: [["M₁", ["rejects every input (so L(M₁) = ∅)."]], ["M₂", [RUN]]],
      call: `Run ${D("L")}(⟨M₁, M₂⟩) and output its answer.`,
      yes: `L(M₂) = Σ* ≠ ∅ = L(M₁), so ⟨M₁, M₂⟩ ∈ L and ${DA} accepts.`,
      no: `L(M₂) = ∅ = L(M₁), so ⟨M₁, M₂⟩ ∉ L and ${DA} rejects.` },
    helper: `M₁ rejects everything; M₂ ignores x and runs M on w`, key: { yes: `L(M₁) = ∅ ≠ Σ* = L(M₂)`, no: `L(M₁) = L(M₂) = ∅` },
    explain: `Pick M₁ so that “different” lines up with “M accepts w”: M₁ accepts nothing.`,
  },
  {
    id: "rejects-some", L: `L = { ⟨M⟩ | M rejects at least one input } (rejects means halts in the reject state)`,
    m: { L: "L", dl: D("L"), machines: [[Mw, ["Ignore x and run M on w.", "If M accepts w, <b>reject</b>.", "If M rejects w, <b>loop forever</b>. (If M loops on w, this loops too.)"]]],
      call: `Run ${D("L")}(⟨${Mw}⟩) and output its answer.`,
      yes: `${Mw} rejects every input, so it rejects at least one. ⟨${Mw}⟩ ∈ L and ${DA} accepts.`,
      no: `${Mw} loops on every input (whether M rejects or loops on w), so it rejects nothing. ⟨${Mw}⟩ ∉ L and ${DA} rejects.` },
    helper: `${Mw}: run M on w; accept → reject; reject → loop`, key: { yes: `${Mw} rejects every input, so ⟨${Mw}⟩ ∈ L`, no: `${Mw} loops on every input, so it rejects nothing and ⟨${Mw}⟩ ∉ L` },
    explain: `The twist: a reject of M must <b>not</b> count, so the helper turns it into a loop. (Rice couldn’t help here anyway: rejecting isn’t a property of the language.)`,
  },
  {
    id: "no-eps", L: `L = { ⟨M⟩ | M does not accept ε }`,
    m: { L: "L", dl: D("L"), machines: [[Mw, [RUN]]],
      call: `Run ${D("L")}(⟨${Mw}⟩). If it accepts, <b>reject</b>. If it rejects, <b>accept</b>. (Flip the answer.)`,
      yes: `${Mw} accepts ε, so ⟨${Mw}⟩ ∉ L. ${D("L")} rejects, and ${DA} flips that to accept.`,
      no: `${Mw} accepts nothing, so it doesn’t accept ε: ⟨${Mw}⟩ ∈ L. ${D("L")} accepts, and ${DA} flips that to reject.`,
      note: "Flipping the answer is allowed in a (general) reduction, because the decider always halts. It is not a mapping reduction." },
    helper: `e.g. ${Mw}: ignore x, run M on w`, key: { yes: `⟨${Mw}⟩ ∉ L, and ${DA} flips ${D("L")}’s reject to accept`, no: `⟨${Mw}⟩ ∈ L, and ${DA} flips ${D("L")}’s accept to reject` },
    explain: `When L is a “does not” language, ${D("L")} answers the opposite question, so ${DA} flips its answer.`,
  },
  {
    id: "reverse", L: `L = { ⟨M⟩ | L(M) is closed under reversal: whenever x ∈ L(M), the reverse of x is in L(M) too }`,
    m: { L: "L", dl: D("L"), machines: [[Mw, ["If x = 10, accept.", "If x = 01, run M on w; if M accepts, accept (if M rejects, reject; if M loops, loop).", "On any other x, reject."]]],
      call: `Run ${D("L")}(⟨${Mw}⟩) and output its answer.`,
      yes: `L(${Mw}) = {10, 01}. The reverse of 10 is 01 and vice versa, so it’s closed under reversal: ⟨${Mw}⟩ ∈ L and ${DA} accepts.`,
      no: `L(${Mw}) = {10}, but the reverse of 10 is 01 ∉ L(${Mw}). Not closed: ⟨${Mw}⟩ ∉ L and ${DA} rejects.`,
      note: "The all-or-nothing helper doesn’t work here: both Σ* and ∅ are closed under reversal. So the helper always accepts 10, and accepts 01 only if M accepts w." },
    helper: `${Mw}: accept 10; on 01 run M on w; reject the rest`, key: { yes: `L(${Mw}) = {10, 01}, closed under reversal`, no: `L(${Mw}) = {10}, not closed (01 is missing)` },
    explain: `When Σ* and ∅ land on the same side, build a helper whose language switches between one “in” language and one “out” language.`,
  },
];

registerExam("reductions", REDUCE.map(r => ({
  id: `mt2/reduce/${r.id}`, type: "reduce", lec: [8], sec: "template",
  q: `You may <b>not</b> use Rice’s theorem. Recall that ${ATM} = { ⟨M, w⟩ | M is a TM and M accepts w } is undecidable. Show that the following language is undecidable by reducing ${ATM} to it:<p class="set">${r.L}</p>`,
  model: model(r.m), checklist: CHECK(r.helper, r.key), explain: r.explain,
})));

// ---------------------------------------------------------------------------------------------- Short answers
const SHORT = [
  { c: "reductions", id: "dec-to-dec", sec: "mapping",
    q: "Suppose A ≤<sub>m</sub> B and B is decidable. Is A decidable? Prove your answer or give a counterexample.",
    model: `<p><b>Yes.</b> Let f be the mapping reduction and D<sub>B</sub> a decider for B. Then D<sub>A</sub> = “On input w: compute f(w), run D<sub>B</sub> on f(w), and output its answer.”</p><p>D<sub>A</sub> always halts, since f is computable and D<sub>B</sub> always halts. It is correct because w ∈ A ⇔ f(w) ∈ B. So A is decidable.</p>`,
    checklist: ["Answers <b>yes</b>.", "Builds a decider for A from the decider for B: compute f(w), then run D<sub>B</sub> on f(w).", "Says why it always halts (f is computable, D<sub>B</sub> always halts).", "Says why it’s correct: w ∈ A ⇔ f(w) ∈ B.", "Concludes A is decidable."],
    explain: "This is the direction reductions are built for: if B is easy, so is A." },
  { c: "recognizability", id: "rec-forward", sec: "mapping-unrec",
    q: "Suppose A ≤<sub>m</sub> B and A is recognizable. Is B recognizable? Prove your answer or give a counterexample.",
    model: `<p><b>No.</b> Counterexample: A = ∅ and B = the complement of A<sub>TM</sub>.</p><p>A = ∅ is recognizable (even decidable). Let y₀ be a fixed string not in B, for example the encoding of ⟨M, w⟩ where M accepts every string. Then f(x) = y₀ is computable, and x ∈ ∅ ⇔ f(x) ∈ B holds for every x, since both sides are false. So A ≤<sub>m</sub> B, yet B is not recognizable.</p>`,
    checklist: ["Answers <b>no</b>.", "Gives a specific recognizable A and unrecognizable B (like ∅ and the complement of A<sub>TM</sub>).", "Gives a specific computable f.", "Checks w ∈ A ⇔ f(w) ∈ B for every w (both directions).", "Says why A is recognizable and B is not."],
    explain: "Recognizability flows from B to A, never from A to B." },
  { c: "reductions", id: "union-undec", sec: "reduction",
    q: "If A and B are both undecidable, must A ∪ B be undecidable? Prove your answer or give a counterexample.",
    model: `<p><b>No.</b> Let A = A<sub>TM</sub> and B = its complement (all strings not in A<sub>TM</sub>). Both are undecidable (a language is decidable exactly when its complement is).</p><p>But A ∪ B = Σ*, which is decidable: accept every input.</p>`,
    checklist: ["Answers <b>no</b>.", "Picks two specific undecidable languages.", "Says why each is undecidable.", "Computes A ∪ B correctly.", "Shows A ∪ B is decidable."],
    explain: "A language and its complement cover everything between them." },
  { c: "reductions", id: "subset", sec: "reduction",
    q: "If L is decidable and L′ ⊆ L, must L′ be decidable? Prove your answer or give a counterexample.",
    model: `<p><b>No.</b> Let L = Σ*, which is decidable (accept everything), and L′ = A<sub>TM</sub> ⊆ Σ*. A<sub>TM</sub> is undecidable.</p>`,
    checklist: ["Answers <b>no</b>.", "Picks a specific decidable L.", "Picks a specific undecidable L′.", "Checks that L′ ⊆ L.", "Says why L is decidable and L′ isn’t."],
    explain: "Being inside an easy set says nothing. Every language is a subset of Σ*." },
  { c: "countability", id: "decidable-count", sec: "counting",
    q: "Is the set of all decidable languages over {0, 1} countable or uncountable? Prove your answer.",
    model: `<p><b>Countable.</b> Send each decidable language L to the first TM, in a fixed listing of all TMs, that decides L. Two different languages can’t have the same decider, so this map is one-to-one from the decidable languages into the set of TMs.</p><p>The set of TMs is countable (each TM has a finite description ⟨M⟩). So the decidable languages are countable.</p>`,
    checklist: ["Answers <b>countable</b>.", "Gives a one-to-one map from decidable languages into TMs (or into strings).", "Says why it’s one-to-one: a TM decides only one language.", "Says why the TMs are countable (finite descriptions).", "Concludes countable."],
    explain: "Same idea as the counting argument: at most one language per machine." },
  { c: "countability", id: "infinite-subsets", sec: "more-uncountable",
    q: "Is the set of all <b>infinite</b> subsets of ℕ countable or uncountable? Prove your answer.",
    model: `<p><b>Uncountable.</b> Map each infinite binary sequence s = a₁a₂a₃… to the set f(s) = { 2i | a<sub>i</sub> = 1 } ∪ { 2i + 1 | a<sub>i</sub> = 0 }.</p><p>f(s) is infinite: for every i, it contains 2i or 2i + 1. f is one-to-one: if s ≠ t, they differ at some i, and then exactly one of f(s), f(t) contains 2i. Since the infinite binary sequences are uncountable, so are the infinite subsets of ℕ.</p><p class="muted">Another way: all subsets of ℕ = finite subsets ∪ infinite subsets. The finite ones are countable, so if the infinite ones were too, 𝒫(ℕ) would be countable.</p>`,
    checklist: ["Answers <b>uncountable</b>.", "Gives a one-to-one map from an uncountable set <b>into</b> the infinite subsets (or the union argument).", "Checks that each image really is infinite.", "Checks one-to-one (or that the finite subsets are countable).", "Concludes uncountable."],
    explain: "Careful: the plain map s ↦ {i | aᵢ = 1} can give finite sets, so it needs adjusting." },
  { c: "recognizability", id: "co-finite", sec: "co-recognizable",
    q: "L is recognizable and its complement L̄ is finite. Is L decidable? Prove your answer.",
    model: `<p><b>Yes.</b> A finite language is decidable: a TM can store the finitely many strings and compare its input against each one. So L̄ is decidable, and therefore so is L (swap accept and reject of the decider for L̄).</p>`,
    checklist: ["Answers <b>yes</b>.", "Says why a finite language is decidable.", "Uses that L̄ decidable ⇒ L decidable (swap accept and reject).", "Says why that decider always halts (it only compares the input with finitely many strings).", "Concludes L is decidable."],
    explain: "The “recognizable” part is a distraction: finiteness of the complement already settles it." },
  { c: "recognizability", id: "dec-cap-rec", sec: "closure",
    q: "If L₁ is decidable and L₂ is recognizable, must L₁ ∩ L₂ be decidable? Prove your answer or give a counterexample.",
    model: `<p><b>No.</b> Let L₁ = Σ* (decidable) and L₂ = A<sub>TM</sub> (recognizable by the universal TM). Then L₁ ∩ L₂ = A<sub>TM</sub>, which is undecidable.</p><p class="muted">It is always <b>recognizable</b>, though: run the decider for L₁, and if it accepts, run the recognizer for L₂.</p>`,
    checklist: ["Answers <b>no</b>.", "Picks a specific decidable L₁ and recognizable L₂.", "Says why L₂ is recognizable.", "Computes L₁ ∩ L₂.", "Says why the intersection is undecidable."],
    explain: "Intersecting with Σ* changes nothing." },
  { c: "rice", id: "rice-total", sec: "limits",
    q: "Can Rice’s theorem be used to show that { ⟨M⟩ | M halts on every input } is undecidable? Explain.",
    model: `<p><b>No.</b> Rice’s theorem only covers properties that depend on L(M) alone. Here, a TM that rejects every input and a TM that loops on every input both have L = ∅, but only the first halts on every input. So this isn’t a property of the language.</p><p>(The language is still undecidable, but that needs a reduction from A<sub>TM</sub>: build M<sub>w</sub> that runs M on w, accepts if M accepts, and loops if M rejects.)</p>`,
    checklist: ["Answers <b>no</b>.", "Names the condition that fails: it doesn’t depend only on L(M).", "Gives two TMs with the same language that disagree on it.", "Doesn’t claim that “Rice doesn’t apply” makes it decidable.", "(Bonus) Says how to prove it undecidable instead."],
    explain: "Rejecting and looping look the same in L(M)." },
  { c: "recognizability", id: "complement-hard", sec: "co-recognizable",
    q: "L is recognizable but not decidable. Is its complement L̄ recognizable? Prove your answer.",
    model: `<p><b>No.</b> Suppose L̄ were recognizable. Then L and L̄ would both be recognizable, so L would be decidable (lemma from lecture). That contradicts L being undecidable. So L̄ is not recognizable.</p>`,
    checklist: ["Answers <b>no</b>.", "Assumes L̄ is recognizable, for contradiction.", "Uses the lemma: L and L̄ both recognizable ⇒ L decidable.", "Points out the contradiction with L being undecidable.", "Concludes L̄ is not recognizable."],
    explain: "This is the argument that the complement of A<sub>TM</sub> is unrecognizable, for any L." },
];
const byC = {};
SHORT.forEach(s => (byC[s.c] = byC[s.c] || []).push({
  id: `mt2/short/${s.id}`, type: "short", sec: s.sec, lec: s.c === "countability" ? [7] : s.c === "reductions" ? [8] : [9],
  q: s.q, model: s.model, checklist: s.checklist, explain: s.explain,
}));

// ---------------------------------------------------------------------------------------------- True / false
const TF = [
  ["countability", 7, "The set of all regular languages over {0, 1} is countable.", true, "Each regular language has a DFA, and there are only countably many DFAs (finite descriptions)."],
  ["countability", 7, "If A ⊆ B and B is countable, then A is countable (or finite).", true, "The identity map is one-to-one from A into B, and B maps one-to-one into ℕ."],
  ["countability", 7, "There is a language over {0, 1} that no Turing machine recognizes.", true, "There are uncountably many languages and only countably many TMs."],
  ["countability", 7, "The set of all finite strings over {0, 1} is uncountable.", false, "{0,1}* is countable: x ↦ the number with binary form 1x is one-to-one."],
  ["reductions", 8, "Every regular language is decidable.", true, "A TM can simulate a DFA and always halt."],
  ["reductions", 8, "If A ≤<sub>m</sub> B and A is decidable, then B is decidable.", false, "Wrong direction. For example ∅ ≤<sub>m</sub> A<sub>TM</sub>, but A<sub>TM</sub> isn’t decidable."],
  ["reductions", 8, "If A ≤<sub>m</sub> B, then Ā ≤<sub>m</sub> B̄.", true, "The same f works: w ∉ A ⇔ f(w) ∉ B."],
  ["reductions", 8, "To prove L is undecidable, you reduce L to A<sub>TM</sub>.", false, "Backwards: reduce A<sub>TM</sub> to L (build a decider for A<sub>TM</sub> out of one for L)."],
  ["reductions", 8, "The halting problem HALT is recognizable.", true, "Run M on w and accept if it halts."],
  ["reductions", 8, "A decider for A<sub>TM</sub> could be built by running M on w and returning its answer.", false, "If M loops on w, that machine loops too, so it isn’t a decider."],
  ["recognizability", 9, "Every decidable language is recognizable.", true, "A decider is also a recognizer."],
  ["recognizability", 9, "The complement of every recognizable language is recognizable.", false, "A<sub>TM</sub> is recognizable, but its complement isn’t."],
  ["recognizability", 9, "If L is undecidable, then L or its complement is unrecognizable.", true, "If both were recognizable, L would be decidable."],
  ["recognizability", 9, "The union of two recognizable languages is recognizable.", true, "Run both recognizers in parallel and accept if either accepts."],
  ["rice", 9, "{ ⟨M⟩ | L(M) contains 0011 } is undecidable.", true, "Rice’s theorem: language-only and non-trivial. (Or reduce A<sub>TM</sub> to it.)"],
  ["rice", 9, "{ ⟨M⟩ | M has exactly 10 states } is undecidable by Rice’s theorem.", false, "It’s a property of the machine, not its language, and it’s decidable: count the states."],
];
TF.forEach(([c, lec, q, answer, explain], k) => (byC[c] = byC[c] || []).push({ id: `mt2/tf/${k}`, type: "tf", lec: [lec], q, answer, explain }));

Object.entries(byC).forEach(([c, qs]) => registerExam(c, qs));
})();
