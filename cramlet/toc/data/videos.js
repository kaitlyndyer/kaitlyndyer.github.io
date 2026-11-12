// Videos to watch for each concept, shown in the Study Plan, on concept pages, and beside Details sections.
// MIT 18.404 (Fall 2020, taught by Michael Sipser, who wrote the course textbook) clip times were checked against
// the lecture transcripts on MIT OpenCourseWare. The Easy Theory videos were picked by topic, length, and how
// closely they follow Sipser's notation; their times are the whole video.
// Fields: id, title, by, yt (YouTube id), start/end (seconds), concept, secs (Details section ids), role ("main" or
// "alt" = "if that didn't click"), why, warn (a notation difference from this course).
(function () {
"use strict";
const t = (m, s = 0) => m * 60 + s;
const MIT = "MIT 18.404 · Sipser";
const ET = "Easy Theory";
const SIPSER_ETM = "Sipser’s E<sub>TM</sub> means “L(M) = ∅” (accepts nothing). In this class, E<sub>TM</sub> means “M accepts ε”. The proof idea is the same.";

registerVideos([
  // ---------- Turing machine refresher ----------
  { id: "mit5-tm", title: "Turing machines: the model, recognize vs decide", by: MIT, yt: "IycOPFmEQk8", start: t(47, 30), end: t(71, 0),
    concept: "turing-machines", secs: ["model", "computation", "recognize-decide"], role: "main",
    why: "The second half of Lecture 5. Sipser builds the TM model and ends with the recognizer/decider distinction everything this unit depends on." },
  { id: "mit5-recdec", title: "Recognizable vs decidable (short clip)", by: MIT, yt: "IycOPFmEQk8", start: t(66, 30), end: t(71, 0),
    concept: "turing-machines", secs: ["recognize-decide"], role: "alt",
    why: "Just the definitions: halting states, deciders, and why every decidable language is recognizable. 4½ minutes." },

  // ---------- Countability ----------
  { id: "mit8-countable", title: "Countable sets: matching ℕ, ℤ and the rationals", by: MIT, yt: "3PzuSPQPEU4", start: t(3, 0), end: t(19, 0),
    concept: "countability", secs: ["comparing", "countable"], role: "main",
    why: "One-to-one correspondences, then ℤ and the positive rationals listed against ℕ. Sipser’s “countable” uses a correspondence; ours uses a one-to-one map into ℕ. Both work." },
  { id: "mitocw-countable", title: "Countable and uncountable sets (short)", by: "MIT OpenCourseWare", yt: "MqocbJ-FPo0",
    concept: "countability", secs: ["countable"], role: "alt",
    why: "A 6-minute summary from MIT’s Math for Computer Science course." },
  { id: "mit8-diagonal", title: "Cantor’s diagonal proof: ℝ is uncountable", by: MIT, yt: "3PzuSPQPEU4", start: t(19, 0), end: t(31, 0),
    concept: "countability", secs: ["uncountable"], role: "main",
    why: "The diagonal argument done slowly, including the “can’t I just add the missing number?” question. He uses decimals; ours uses binary sequences. Same idea." },
  { id: "bazett-diagonal", title: "Cantor’s diagonal argument", by: "Dr. Trefor Bazett", yt: "0HF39OWyl54",
    concept: "countability", secs: ["uncountable"], role: "alt",
    why: "A clear 6-minute version with good visuals, if the lecture pace is too slow or too fast." },
  { id: "mit8-counting", title: "More languages than Turing machines", by: MIT, yt: "3PzuSPQPEU4", start: t(31, 0), end: t(37, 0),
    concept: "countability", secs: ["more-uncountable", "counting"], role: "main",
    why: "Why the set of all languages is uncountable, the set of TMs is countable, and so some language has no TM at all." },

  // ---------- A_TM and self-reference ----------
  { id: "mit8-atm", title: "A<sub>TM</sub> is undecidable (diagonalization)", by: MIT, yt: "3PzuSPQPEU4", start: t(41, 0), end: t(56, 0),
    concept: "countability", secs: ["self-acceptance"], role: "main",
    why: "Sipser’s version builds D from a pretend decider H and feeds D its own description. Our lecture splits this into SU<sub>TM</sub> first, then A<sub>TM</sub>. Same diagonal. (There’s a 1-minute break around 50:30.)" },
  { id: "et-atm", title: "Acceptance for Turing machines is undecidable, but recognizable", by: ET, yt: "ASgv7SmUCzo",
    concept: "reductions", secs: ["atm"], role: "alt",
    why: "A 12-minute version that also shows the universal TM recognizing A<sub>TM</sub>." },

  // ---------- Unrecognizability ----------
  { id: "mit8-corec", title: "The complement of A<sub>TM</sub> is unrecognizable", by: MIT, yt: "3PzuSPQPEU4", start: t(56, 0), end: t(61, 0),
    concept: "recognizability", secs: ["co-recognizable"], role: "main",
    why: "The theorem “A and its complement both recognizable ⇒ A decidable”, the picture of recognizable vs co-recognizable languages, and why the complement of A<sub>TM</sub> can’t be recognized. 5 minutes." },
  { id: "et-corec", title: "Decidable iff recognizable and co-recognizable", by: ET, yt: "4WtVdGxjVyE",
    concept: "recognizability", secs: ["co-recognizable"], role: "alt",
    why: "An 8-minute walk through the same theorem, running the two recognizers side by side." },

  // ---------- Reductions ----------
  { id: "mit8-halt", title: "Reducibility and the halting problem", by: MIT, yt: "3PzuSPQPEU4", start: t(64, 0), end: t(76, 30),
    concept: "reductions", secs: ["reduction", "halting"], role: "main",
    why: "Sipser’s first reduction, A<sub>TM</sub> to HALT, matching our lecture’s proof line for line." },
  { id: "mit9-direction", title: "What a reduction is, and which way it goes", by: MIT, yt: "N28g_YBXY8Y", start: t(0, 30), end: t(21, 30),
    concept: "reductions", secs: ["reduction", "template", "halting"], role: "main",
    why: "Lecture 9 re-does HALT slowly, then spends 10 minutes on the direction of a reduction (the most common exam mistake), with everyday examples." },
  { id: "lydia-reduce", title: "What are reductions?", by: "lydia", yt: "U4yGQp5aCTM",
    concept: "reductions", secs: ["reduction"], role: "alt",
    why: "A 5-minute animated intro to reductions, if the idea still feels slippery." },
  { id: "et-halt", title: "Why is the halting problem undecidable?", by: ET, yt: "4tbCR10QGTI",
    concept: "reductions", secs: ["halting"], role: "alt",
    why: "A 10-minute focused version of the halting proof." },
  { id: "mit9-etm", title: "The emptiness problem E<sub>TM</sub> (the M<sub>w</sub> trick)", by: MIT, yt: "N28g_YBXY8Y", start: t(21, 30), end: t(35, 0),
    concept: "reductions", secs: ["empty-string"], role: "main", warn: SIPSER_ETM,
    why: "How Sipser invents the helper machine M<sub>w</sub>, including “we never run M<sub>w</sub>”. His M<sub>w</sub> filters inputs instead of ignoring them, but the logic is the same." },
  { id: "et-etm", title: "Emptiness for Turing machines is undecidable", by: ET, yt: "iN0auyB0Hv0",
    concept: "reductions", secs: ["empty-string"], role: "alt", warn: SIPSER_ETM,
    why: "A 9-minute version of the same proof." },
  { id: "et-regular", title: "Regularity for Turing machines is undecidable", by: ET, yt: "zo3kyFumkws",
    concept: "reductions", secs: ["regular"], role: "main",
    why: "MIT doesn’t do this one in lecture. An 8-minute version of the 0ⁿ1ⁿ trick." },
  { id: "et-eq", title: "Equivalence for Turing machines is undecidable", by: ET, yt: "LGbI-mnQKRo",
    concept: "reductions", secs: ["equivalence"], role: "main",
    why: "A 5-minute version of the EQ<sub>TM</sub> proof." },

  // ---------- Mapping reductions ----------
  { id: "mit9-mapping", title: "Mapping reductions", by: MIT, yt: "N28g_YBXY8Y", start: t(35, 0), end: t(54, 30),
    concept: "reductions", secs: ["mapping"], role: "main", warn: SIPSER_ETM,
    why: "Computable functions, A ≤<sub>m</sub> B, why it gives a decider, and the check-in on complements (A ≤<sub>m</sub> B means Ā ≤<sub>m</sub> B̄) around 47:00." },
  { id: "et-mapping", title: "Mapping reducibility + reductions, what are they?", by: ET, yt: "-5TAx4tZlro",
    concept: "reductions", secs: ["mapping"], role: "alt",
    why: "An 8-minute summary of mapping reductions and how they relate to ordinary ones." },
  { id: "mit9-unrec", title: "Proving languages unrecognizable with mapping reductions", by: MIT, yt: "N28g_YBXY8Y", start: t(54, 30), end: t(76, 0),
    concept: "recognizability", secs: ["mapping-unrec"], role: "main", warn: SIPSER_ETM,
    why: "Why general reductions can’t prove unrecognizability but mapping reductions can, then E<sub>TM</sub> is unrecognizable and EQ<sub>TM</sub> is neither recognizable nor co-recognizable." },
  { id: "et-eq-neither", title: "EQ<sub>TM</sub> is neither recognizable nor co-recognizable", by: ET, yt: "Dj2sjiahYng",
    concept: "recognizability", secs: ["mapping-unrec"], role: "alt",
    why: "12 minutes on the two mapping reductions behind it." },

  // ---------- Rice's theorem ----------
  { id: "et-rice-use", title: "How to use Rice’s theorem in 5 minutes", by: ET, yt: "kr7n_3LpWhc",
    concept: "rice", secs: ["using"], role: "main",
    why: "Sipser leaves Rice’s theorem as an exercise, so this comes from Easy Theory. Start here: it’s about <b>using</b> the theorem, which is what exam questions ask." },
  { id: "et-rice-proof", title: "Rice’s theorem: proof", by: ET, yt: "jIAEpYwJgbA",
    concept: "rice", secs: ["proof"], role: "main",
    why: "The proof, by reduction from A<sub>TM</sub>, the same shape as our lecture’s M<sub>w</sub>(x) = M(w) && M′(x)." },
  { id: "et-rice-examples", title: "Rice’s theorem: 5 proofs and examples", by: ET, yt: "n-kBE750AFc",
    concept: "rice", secs: ["limits"], role: "alt",
    why: "Worked examples, including properties where Rice’s theorem does <b>not</b> apply." },
]);
})();
