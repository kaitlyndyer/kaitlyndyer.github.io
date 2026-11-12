// Study Plan for Midterm 2 (course/plan.js renders it at #/plan).
// topics: each climbs five steps (Seen it, Explain it, Do it with help, Do it alone, Exam-ready). Steps fill in from
//   cramlet where possible: seen = a video watched or the concept visited; help = any award in `help`;
//   alone = a Proof Box proof done on your own (or, with no proofs, a concept quiz best ≥ 80%);
//   ready = a timed Proof Box proof (when the topic has proofs) and ≥ 80% on the topic's concepts in your latest
//   practice exam. You can tick any step yourself too.
// days: the schedule. Task kinds: watch (video id), learn / practice / review / exam (href), prove (proof id + level),
//   explain (topic id). A task with `key` (a cramlet award id) or a watch / prove task ticks itself when you do it.
(function () {
"use strict";
const sb = s => `<sub>${s}</sub>`;
const ATM = `A${sb("TM")}`;

registerPlan({
  exam: { title: "Midterm 2", date: "2026-11-17", scope: "Countability through Rice’s theorem (lectures 7–9), plus the Turing machine basics they rest on" },
  topics: [
    { id: "tm", title: "Recognize vs decide (TM refresher)", lec: "L5–6", concepts: ["turing-machines", "church-turing"],
      videos: ["mit5-recdec", "mit5-tm"], help: ["quiz:toc:turing-machines", "quiz:toc:church-turing"],
      links: [{ label: "Recognizing vs deciding", href: "#/c/turing-machines/details/recognize-decide" }, { label: "Run a Turing machine", href: "#/c/turing-machines/playground" }],
      explain: [
        { q: "What’s the difference between a recognizer and a decider?", a: "A recognizer for L accepts exactly the strings in L, but on strings outside L it may reject <b>or loop forever</b>. A decider is a recognizer that always halts, so it rejects every string outside L." },
        { q: `Name a language that is recognizable but not decidable, and say why it’s recognizable.`, a: `${ATM}. The universal TM runs M on w and accepts if M accepts; if M loops, it loops too, which a recognizer is allowed to do.` },
      ] },
    { id: "countable", title: "Countable sets", lec: "L7", concepts: ["countability"],
      videos: ["mit8-countable", "mitocw-countable"], help: ["challenge:toc:turn:countable-sort"], proofs: ["countable"],
      links: [{ label: "Comparing infinities", href: "#/c/countability/details/comparing" }, { label: "Countable sets", href: "#/c/countability/details/countable" }],
      explain: [
        { q: "What does it mean for an infinite set to be countable, and what’s the quickest way to prove it?", a: "Its elements can be listed so every element appears (|A| = |ℕ|). Quickest proof: a one-to-one map from A into ℕ, or into the strings over a finite alphabet (give each element its own finite description)." },
        { q: "Why is the set of all Turing machines countable?", a: "Every TM has a finite description ⟨M⟩, a string over a finite alphabet, and different TMs have different descriptions. Strings are countable." },
      ] },
    { id: "uncountable", title: "Uncountable sets & diagonalization", lec: "L7", concepts: ["countability"],
      videos: ["mit8-diagonal", "bazett-diagonal", "mit8-counting"], help: ["challenge:toc:turn:diag-digits", "challenge:toc:diagonal-turn:sequences", "challenge:toc:diagonal:sequences", "challenge:toc:turn:map-direction"], proofs: ["uncountable"],
      links: [{ label: "Diagonalization", href: "#/c/countability/details/uncountable" }, { label: "More languages than TMs", href: "#/c/countability/details/counting" }, { label: "Flip the diagonal", href: "#/c/countability/playground/diagonal" }],
      explain: [
        { q: "Explain the diagonal argument in four sentences.", a: "Assume the set can be listed s₁, s₂, …. Build s* whose i-th entry differs from the i-th entry of sᵢ. Then s* differs from every sᵢ (from sᵢ at position i), so it isn’t on the list. But the list had everything: contradiction." },
        { q: "Why does “there are more languages than TMs” mean some language isn’t recognizable?", a: "TMs are countable and languages are uncountable, so there aren’t enough machines to go around: some language has no TM that recognizes it." },
      ] },
    { id: "atm", title: `SU${sb("TM")} and ${ATM} are undecidable`, lec: "L7–8", concepts: ["countability", "reductions"],
      videos: ["mit8-atm", "et-atm"], help: ["challenge:toc:turn:self", "challenge:toc:walk:atm", "challenge:toc:diagonal-turn:machines", "challenge:toc:proof:red-atm"], proofs: ["reduction"],
      links: [{ label: "Self-acceptance", href: "#/c/countability/details/self-acceptance" }, { label: `${ATM} is undecidable`, href: "#/c/reductions/details/atm" }],
      explain: [
        { q: `Why can’t a decider D for SU${sb("TM")} exist?`, a: `D accepts ⟨D⟩ ⇔ ⟨D⟩ ∈ SU${sb("TM")} ⇔ D doesn’t accept ⟨D⟩. Both answers contradict themselves, and a decider can’t loop.` },
        { q: `How does that give ${ATM} undecidable?`, a: `A decider for ${ATM} would decide SA${sb("TM")} by asking about ⟨M, ⟨M⟩⟩, and SA${sb("TM")} is undecidable (it’s the complement of SU${sb("TM")}).` },
      ] },
    { id: "reductions-halt", title: "Reductions: the idea, and HALT", lec: "L8", concepts: ["reductions"],
      videos: ["mit8-halt", "mit9-direction", "lydia-reduce", "et-halt"], help: ["challenge:toc:walk:halt", "challenge:toc:turn:direction", "challenge:toc:turn:reject", "challenge:toc:proof:red-halt", "challenge:toc:proof:flaw-direction"], proofs: ["reduction"],
      links: [{ label: "Which way it goes", href: "#/c/reductions/details/reduction" }, { label: "The proof template", href: "#/c/reductions/details/template" }, { label: "Walk through HALT", href: "#/c/reductions/playground/walkthrough" }],
      explain: [
        { q: "To prove B is undecidable, which way does the reduction go, and why?", a: `Reduce ${ATM} <b>to</b> B: show a decider for B would give a decider for ${ATM}. Since ${ATM} has no decider, neither does B. Reducing B to ${ATM} proves nothing.` },
        { q: "Why does the HALT reduction ask the HALT decider before running M on w?", a: "So the new decider never runs M(w) when it might loop. It only runs M(w) after being told M halts, so it always halts." },
      ] },
    { id: "reductions-mw", title: "Reductions with a helper machine (ε, REGULAR, EQ)", lec: "L8", concepts: ["reductions"],
      videos: ["mit9-etm", "et-etm", "et-regular", "et-eq"], help: ["challenge:toc:walk:eps", "challenge:toc:walk:reg", "challenge:toc:walk:eq", "challenge:toc:turn:all", "challenge:toc:turn:finite", "challenge:toc:turn:subset", "challenge:toc:proof:red-eps", "challenge:toc:proof:red-eq"], proofs: ["reduction"],
      links: [{ label: "Does M accept ε?", href: "#/c/reductions/details/empty-string" }, { label: "Is L(M) regular?", href: "#/c/reductions/details/regular" }, { label: "Same language?", href: "#/c/reductions/details/equivalence" }],
      explain: [
        { q: `What is M${sb("w")}, and why is it safe for the decider to build it?`, a: `M${sb("w")} is a new machine with w baked into its code (usually: ignore the input, run M on w). Writing its code always finishes; the decider never runs it, it only hands the code to the pretend decider.` },
        { q: "What goes wrong in the loop case if you’re careless?", a: "Looping isn’t accepting or rejecting. If M loops on w, the helper accepts nothing (L = ∅), not Σ*, and “doesn’t reject” isn’t “accepts”." },
      ] },
    { id: "mapping", title: "Mapping reductions", lec: "L8", concepts: ["reductions"],
      videos: ["mit9-mapping", "et-mapping"], help: ["challenge:toc:turn:mapping", "challenge:toc:proof:box-mapping"], proofs: ["mapping"],
      links: [{ label: "Mapping reductions", href: "#/c/reductions/details/mapping" }],
      explain: [
        { q: "What makes a function f a mapping reduction from A to B?", a: "f is computable (always halts), and for every w: w ∈ A ⇔ f(w) ∈ B. Both directions." },
        { q: "If A ≤ₘ B, what else is true?", a: "Ā ≤ₘ B̄ (same f). If B is decidable/recognizable, so is A. If A is undecidable/unrecognizable, so is B." },
      ] },
    { id: "recognizability", title: "Unrecognizable languages", lec: "L9", concepts: ["recognizability"],
      videos: ["mit8-corec", "et-corec", "mit9-unrec", "et-eq-neither"], help: ["challenge:toc:turn:corec", "challenge:toc:proof:box-cohalt"], proofs: ["unrecognizable"],
      links: [{ label: "Recognizable or not (lesson coming next)", href: "#/c/recognizability" }],
      explain: [
        { q: `Why is the complement of ${ATM} not recognizable?`, a: `${ATM} is recognizable. If its complement were too, ${ATM} would be decidable (L and L̄ both recognizable ⇒ L decidable). It isn’t.` },
        { q: "Can a language be neither recognizable nor co-recognizable?", a: `Yes: EQ${sb("TM")}. (Countability also guarantees unrecognizable languages exist.)` },
      ] },
    { id: "rice", title: "Rice’s theorem", lec: "L9", concepts: ["rice"],
      videos: ["et-rice-use", "et-rice-proof", "et-rice-examples"], help: ["challenge:toc:turn:rice", "challenge:toc:proof:box-rice"], proofs: ["rice"],
      links: [{ label: "Rice’s theorem lesson", href: "#/c/rice" }, { label: "Does Rice apply? (flowchart)", href: "#/c/rice/playground/rice-check" }],
      explain: [
        { q: "What two conditions does Rice’s theorem need?", a: "The property depends only on L(M) (machines with the same language agree), and it’s non-trivial (some TM has it, some TM doesn’t). Then { ⟨M⟩ | M has it } is undecidable." },
        { q: "Why doesn’t Rice’s theorem say “M has 10 states” is undecidable?", a: "That’s a property of the machine, not its language: two machines with the same language can have different numbers of states. (And it’s decidable: count them.)" },
      ] },
  ],

  days: [
    { date: "2026-11-11", focus: "TM refresher + countable sets", tasks: [
      { id: "w1", kind: "watch", video: "mit5-recdec", topic: "tm" },
      { id: "w2", kind: "learn", title: "Read: Recognizing vs deciding", href: "#/c/turing-machines/details/recognize-decide", min: 10, topic: "tm" },
      { id: "w3", kind: "watch", video: "mit8-countable", topic: "countable" },
      { id: "w4", kind: "learn", title: "Read: Comparing infinities + Countable sets", href: "#/c/countability/details/comparing", min: 15, topic: "countable" },
      { id: "w5", kind: "practice", title: "Your turn: countable or not? (7 sets)", href: "#/c/countability/details/countable", min: 10, key: "challenge:toc:turn:countable-sort", topic: "countable" },
      { id: "w6", kind: "explain", topic: "countable", min: 5 },
    ] },
    { date: "2026-11-12", focus: "Uncountable + A<sub>TM</sub>", tasks: [
      { id: "t1", kind: "watch", video: "mit8-diagonal", topic: "uncountable" },
      { id: "t2", kind: "practice", title: "Flip the diagonal: Your turn mode", href: "#/c/countability/playground/diagonal", min: 10, key: "challenge:toc:diagonal-turn:sequences", topic: "uncountable" },
      { id: "t3", kind: "practice", title: "Your turn: diagonalize the digit sequences", href: "#/c/countability/details/uncountable", min: 10, key: "challenge:toc:turn:diag-digits", topic: "uncountable" },
      { id: "t4", kind: "watch", video: "mit8-counting", topic: "uncountable" },
      { id: "t5", kind: "prove", proof: "uncountable", level: 3, min: 15, topic: "uncountable" },
      { id: "t6", kind: "watch", video: "mit8-atm", topic: "atm" },
      { id: "t7", kind: "practice", title: "Your turn: run D on itself", href: "#/c/countability/details/self-acceptance", min: 5, key: "challenge:toc:turn:self", topic: "atm" },
      { id: "t8", kind: "explain", topic: "uncountable", min: 5 },
      { id: "t9", kind: "review", title: "Myth or fact: a 15-statement round", href: "#/myths", min: 8 },
    ] },
    { date: "2026-11-13", focus: "Reductions", tasks: [
      { id: "f1", kind: "watch", video: "mit8-halt", topic: "reductions-halt" },
      { id: "f2", kind: "watch", video: "mit9-direction", topic: "reductions-halt" },
      { id: "f3", kind: "practice", title: "Walk through a reduction: HALT", href: "#/c/reductions/playground/walkthrough", min: 10, key: "challenge:toc:walk:halt", topic: "reductions-halt" },
      { id: "f4", kind: "practice", title: "Your turn: which way does it go? + REJECT", href: "#/c/reductions/details/reduction", min: 12, key: "challenge:toc:turn:direction", topic: "reductions-halt" },
      { id: "f5", kind: "watch", video: "mit9-etm", topic: "reductions-mw" },
      { id: "f6", kind: "practice", title: "Walkthroughs: accepts ε, EQ, REGULAR", href: "#/c/reductions/playground/walkthrough", min: 25, key: "challenge:toc:walk:eps", topic: "reductions-mw" },
      { id: "f7", kind: "prove", proof: "reduction", level: 2, min: 10, topic: "reductions-mw" },
      { id: "f8", kind: "prove", proof: "reduction", level: 3, min: 15, topic: "reductions-mw" },
      { id: "f9", kind: "explain", topic: "reductions-mw", min: 5 },
    ] },
    { date: "2026-11-14", focus: "Mapping, unrecognizable, Rice", tasks: [
      { id: "s1", kind: "watch", video: "mit9-mapping", topic: "mapping" },
      { id: "s2", kind: "practice", title: "Your turn: is this a mapping reduction?", href: "#/c/reductions/details/mapping", min: 10, key: "challenge:toc:turn:mapping", topic: "mapping" },
      { id: "s3", kind: "prove", proof: "mapping", level: 3, min: 10, topic: "mapping" },
      { id: "s4", kind: "watch", video: "mit8-corec", topic: "recognizability" },
      { id: "s5", kind: "learn", title: "Lesson: Recognizable or not", href: "#/c/recognizability", min: 20, topic: "recognizability" },
      { id: "s6", kind: "prove", proof: "unrecognizable", level: 3, min: 10, topic: "recognizability" },
      { id: "s7", kind: "watch", video: "et-rice-use", topic: "rice" },
      { id: "s8", kind: "learn", title: "Lesson: Rice’s theorem", href: "#/c/rice", min: 20, topic: "rice" },
      { id: "s9", kind: "prove", proof: "rice", level: 3, min: 8, topic: "rice" },
    ] },
    { date: "2026-11-15", focus: "Practice exam + fix mistakes", tasks: [
      { id: "u1", kind: "exam", title: "Your professor’s practice exam: on paper, timed, closed notes", href: "#/plan/mistakes", min: 75 },
      { id: "u2", kind: "review", title: "Log every lost point in the Mistake log (pick a reason)", href: "#/plan/mistakes", min: 20 },
      { id: "u3", kind: "review", title: "Redo the mistakes that are due", href: "#/plan/mistakes", min: 30 },
      { id: "u4", kind: "prove", proof: "reduction", level: 4, min: 15, topic: "reductions-mw" },
      { id: "u5", kind: "prove", proof: "uncountable", level: 4, min: 12, topic: "uncountable" },
    ] },
    { date: "2026-11-16", focus: "Mixed practice, then rest", tasks: [
      { id: "m1", kind: "exam", title: "Cramlet practice exam (Midterm 2)", href: "#/exam", min: 75 },
      { id: "m2", kind: "review", title: "Redo the mistakes that are due", href: "#/plan/mistakes", min: 30 },
      { id: "m3", kind: "prove", proof: "rice", level: 4, min: 8, topic: "rice" },
      { id: "m4", kind: "prove", proof: "mapping", level: 4, min: 10, topic: "mapping" },
      { id: "m5", kind: "prove", proof: "unrecognizable", level: 4, min: 10, topic: "recognizability" },
      { id: "m6", kind: "review", title: "Crumb Run: Tonight (then lights out)", href: "#/last-crumbs", min: 25 },
    ] },
    { date: "2026-11-17", focus: "Exam day", exam: true, tasks: [
      { id: "x1", kind: "review", title: "Crumb Run: Morning of (10 minutes, then the pep talk)", href: "#/last-crumbs", min: 10 },
    ] },
  ],
});
})();
