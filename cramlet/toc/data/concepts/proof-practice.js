(function () {
"use strict";

registerConcept({
  id: "proof-practice",
  oneLiner:
    "Proofs get easier when you know the <b>shape</b> each kind of proof takes. Learn the templates, then practice putting real proofs together and spotting broken ones.",

  related: ["logic-proofs", "pumping", "closure"],

  summary: {
    keyPoints: [
      { lec: [0], kind: "key", html: "Before writing anything, ask: <b>what kind of statement is this?</b> “There exists…” → construction. “… is not …” or “… is impossible” → often contradiction. “For all n…” → often induction. “L is not regular” → pumping lemma." },
      { lec: [0], html: "<b>Construction:</b> build the object, then explain why it works. Most closure proofs (“regular languages are closed under …”) are constructions." },
      { lec: [0], html: "<b>Contradiction:</b> assume the opposite of what you want, follow it until something impossible happens, then conclude. Say clearly what you assumed and what it contradicts." },
      { lec: [0], html: "<b>Induction:</b> state P(n) clearly, prove the base case, assume P(n) (the inductive hypothesis), and use it to prove P(n + 1). Point out exactly where you use the hypothesis." },
      { lec: [4], html: "<b>Pumping lemma:</b> you choose w and i; the adversary chooses p and the split. Your argument must handle <b>every</b> split with |xy| ≤ p and |y| &gt; 0." },
      { lec: [0], kind: "warn", html: "Checking examples is <b>not</b> a proof. “It works for n = 1, 2, 3” proves nothing about all n." },
      { lec: [0], html: "Write for a human reader: full sentences, define every variable before you use it, and say why each step follows from the ones before it." },
    ],
    compare: {
      head: ["The statement looks like…", "Try…", "First sentence"],
      rows: [
        ["“There is a DFA / NFA / regex for L”", "Construction", "“Let M be a DFA for A. Build M′ = …”"],
        ["“X is impossible” / “√2 is irrational”", "Contradiction", "“Suppose, for contradiction, that …”"],
        ["“For every n ≥ 0, …”", "Induction", "“We prove P(n) by induction on n.”"],
        ["“L is not regular”", "Pumping lemma (by contradiction)", "“Assume L is regular, with pumping length p.”"],
        ["“A is closed under …”", "Construction", "“Let A, B be regular, with machines M<sub>A</sub>, M<sub>B</sub>.”"],
      ],
    },
  },

  details: [
    {
      id: "construction",
      title: "Template: proof by construction",
      lec: [1, 2],
      html: `
        <p>Use it to show something <b>exists</b>, like “A̅ is regular” (there’s a DFA for it).</p>
        <ol>
          <li><b>Start from what you’re given.</b> “Let A be regular. Then some DFA M = (Q, Σ, δ, q<sub>start</sub>, F) recognizes A.”</li>
          <li><b>Build the new thing</b>, precisely. “Let M′ = (Q, Σ, δ, q<sub>start</sub>, Q \\ F).”</li>
          <li><b>Show it works</b> for every input. “On any w, M′ ends in the same state as M, which is in Q \\ F exactly when M rejects. So M′ accepts w ⇔ w ∉ A.”</li>
          <li><b>Conclude.</b> “So M′ recognizes A̅, and A̅ is regular. ∎”</li>
        </ol>
        <p class="callout warn">Step 3 is the one people skip. Building the machine isn’t enough; explain why it accepts exactly the right strings.</p>`,
    },
    {
      id: "contradiction",
      title: "Template: proof by contradiction",
      lec: [0],
      html: `
        <ol>
          <li><b>Assume the opposite.</b> “Suppose, for contradiction, that √2 is rational.”</li>
          <li><b>Unpack the assumption</b> into something concrete. “Then √2 = p/q for integers p, q, not both even.”</li>
          <li><b>Reason forward</b>, one justified step at a time, until something impossible happens. “… so p and q are both even.”</li>
          <li><b>Name the contradiction</b> out loud. “This contradicts p and q not both being even.”</li>
          <li><b>Conclude.</b> “So the assumption was false, and √2 is irrational. ∎”</li>
        </ol>`,
    },
    {
      id: "induction",
      title: "Template: proof by induction",
      lec: [0, 2],
      html: `
        <ol>
          <li><b>State P(n) exactly.</b> “P(n): every set with n elements has 2<sup>n</sup> subsets.”</li>
          <li><b>Base case.</b> Prove P(0) (or P(1), whatever the smallest case is).</li>
          <li><b>Inductive hypothesis.</b> “Assume P(n) holds for some n ≥ 0.”</li>
          <li><b>Inductive step.</b> Prove P(n + 1), and point out where you <b>use</b> the hypothesis.</li>
          <li><b>Conclude.</b> “By induction, P(n) holds for all n ≥ 0. ∎”</li>
        </ol>
        <p class="callout warn">The step from n to n + 1 has to work for <b>every</b> n, including the smallest ones. The “Find the flaw” induction puzzle in the Playground breaks exactly there.</p>`,
    },
    {
      id: "pumping",
      title: "Template: L is not regular (pumping lemma)",
      lec: [4],
      html: `
        <ol>
          <li>“Assume for contradiction that L is regular, and let p be its pumping length.” (Don’t pick a number for p.)</li>
          <li>“Choose w = ….” Pick w <b>in terms of p</b>, with w ∈ L and |w| ≥ p. Usually the first p symbols are all the same.</li>
          <li>“By the pumping lemma, w = xyz with |xy| ≤ p, |y| &gt; 0, and xy<sup>i</sup>z ∈ L for all i ≥ 0.” (Don’t pick x, y, z.)</li>
          <li>“Since |xy| ≤ p, y consists only of ….” This is where you use |xy| ≤ p to pin down y for <b>every</b> split.</li>
          <li>“Take i = …. Then xy<sup>i</sup>z = …, which is not in L because ….”</li>
          <li>“This contradicts the pumping lemma, so L is not regular. ∎”</li>
        </ol>`,
    },
    {
      id: "checklist",
      title: "Checklist before you hand it in",
      lec: [0],
      html: `
        <ul>
          <li>Did I say what kind of proof this is in the first sentence?</li>
          <li>Is every variable defined before I use it?</li>
          <li>Does every step say <b>why</b> it follows (“since |xy| ≤ p, …”)?</li>
          <li>Did I prove the general case, not just examples?</li>
          <li>For a contradiction: did I name what is contradicted?</li>
          <li>For induction: did I use the inductive hypothesis, and does the step work for the smallest n?</li>
          <li>For the pumping lemma: did I avoid choosing p or the split myself?</li>
          <li>Does the last sentence state exactly what the problem asked?</li>
        </ul>`,
    },
  ],

  playground: [
    {
      id: "puzzles",
      title: "Proof puzzles",
      lec: [0, 1, 4],
      intro: `<p>Two kinds of puzzles. <b>Build the proof:</b> pick the right steps (a few don’t belong) and put them in order, then check. Use <b>Hint</b> if you’re stuck. <b>Find the flaw:</b> click the one broken line. Each solved puzzle earns crumbs.</p>`,
      widget: "proof-puzzle",
      config: {
        puzzles: [
          {
            id: "complement", name: "Complement is regular", type: "order",
            theorem: "If A is regular, then its complement A̅ is regular.",
            steps: [
              "Let A be a regular language. Then some DFA M = (Q, Σ, δ, q<sub>start</sub>, F) recognizes A.",
              "Build M′ = (Q, Σ, δ, q<sub>start</sub>, Q \\ F): the same DFA with accept and non-accept states swapped.",
              "On any input w, M′ makes exactly the same moves as M, so both end in the state δ̂(q<sub>start</sub>, w).",
              "That state is in Q \\ F exactly when it isn’t in F. So M′ accepts w ⇔ M rejects w ⇔ w ∉ A.",
              "So M′ recognizes A̅, and A̅ is regular. ∎",
            ],
            distractors: [
              { html: "Let N be an NFA for A, and swap its accept and non-accept states.", why: "Swapping only works for a DFA. An NFA can have one run that accepts and another that rejects the same string." },
              { html: "Assume for contradiction that A̅ is not regular.", why: "This is a proof by construction: just build a machine for A̅. No contradiction is needed." },
              { html: "Add a new start state with ε-arrows to every state of M.", why: "That isn’t part of the complement construction, and it would change which strings the machine accepts." },
            ],
            done: "This is the construction template: start from what you’re given, build the new machine, explain why it works, conclude.",
          },
          {
            id: "sqrt2", name: "√2 is irrational", type: "order",
            theorem: "√2 is irrational.",
            steps: [
              "Suppose, for contradiction, that √2 is rational.",
              "Then √2 = p/q for some integers p and q with q ≠ 0, and we can assume p and q are not both even (divide out factors of 2).",
              "Squaring both sides gives p² = 2q².",
              "So p² is even, which means p is even. Write p = 2k.",
              "Then (2k)² = 2q², so q² = 2k². So q² is even, and q is even too.",
              "Now p and q are both even, which contradicts our choice of p and q.",
              "So the assumption was false, and √2 is irrational. ∎",
            ],
            distractors: [
              { html: "Suppose √2 is irrational.", why: "That’s what we want to prove. A proof by contradiction assumes the <b>opposite</b>: that √2 is rational." },
              { html: "Since p² is even, p² must equal 2.", why: "Even means a multiple of 2, not equal to 2." },
              { html: "Try p = 7 and q = 5: (7/5)² = 1.96 ≠ 2, so √2 isn’t a fraction.", why: "Checking examples proves nothing about <b>all</b> p and q." },
            ],
            done: "Notice the shape: assume the opposite, unpack it, reason forward, name the contradiction, conclude.",
          },
          {
            id: "0n1n", name: "0ⁿ1ⁿ isn’t regular", type: "order",
            theorem: "L = {0ⁿ1ⁿ | n ≥ 0} is not regular.",
            steps: [
              "Assume for contradiction that L is regular, and let p be its pumping length.",
              "Choose w = 0ᵖ1ᵖ. Then w ∈ L and |w| = 2p ≥ p.",
              "By the pumping lemma, w = xyz with |xy| ≤ p, |y| &gt; 0, and xyⁱz ∈ L for every i ≥ 0.",
              "Since |xy| ≤ p and the first p symbols of w are all 0s, y consists only of 0s.",
              "Take i = 2: xy²z = 0<sup>p+|y|</sup>1ᵖ has more 0s than 1s, so it isn’t in L.",
              "This contradicts the pumping lemma, so L is not regular. ∎",
            ],
            distractors: [
              { html: "Let p = 4.", why: "You don’t choose p. The proof has to work for whatever pumping length the lemma gives you." },
              { html: "Let x = ε, y = 0, and z = 0<sup>p−1</sup>1ᵖ.", why: "You don’t choose the split either. The argument has to cover <b>every</b> split with |xy| ≤ p and |y| &gt; 0." },
              { html: "Choose w = 0011.", why: "w has to be at least p long, so it must depend on p. A fixed string is too short when p is large." },
            ],
            done: "This is the pumping-lemma template. The key move is step 4: |xy| ≤ p pins down y for every possible split.",
          },
          {
            id: "pump-down", name: "More 0s than 1s isn’t regular", type: "order",
            theorem: "L = {0ⁱ1ʲ | i &gt; j} is not regular.",
            steps: [
              "Assume for contradiction that L is regular, with pumping length p.",
              "Choose w = 0<sup>p+1</sup>1ᵖ. It’s in L (p + 1 &gt; p) and |w| ≥ p.",
              "By the pumping lemma, w = xyz with |xy| ≤ p, |y| &gt; 0, and xyⁱz ∈ L for every i ≥ 0.",
              "Since |xy| ≤ p, y is made of 0s only: y = 0ᵏ for some k ≥ 1.",
              "Take i = 0: xz = 0<sup>p+1−k</sup>1ᵖ has at most p 0s and exactly p 1s, so it isn’t in L.",
              "That contradicts the pumping lemma, so L is not regular. ∎",
            ],
            distractors: [
              { html: "Take i = 2: xy²z has even more 0s, so it isn’t in L.", why: "More 0s keeps i &gt; j true, so xy²z is still in L. Here you have to pump <b>down</b>." },
              { html: "Choose w = 0<sup>2p</sup>1ᵖ.", why: "With this w, deleting up to p 0s still leaves more than p of them, so pumping down doesn’t leave L." },
            ],
            done: "When pumping up keeps you in L, try i = 0.",
          },
          {
            id: "powerset", name: "|P(A)| = 2ⁿ", type: "order",
            theorem: "Every set A with |A| = n has |Powerset(A)| = 2ⁿ.",
            steps: [
              "We prove this by induction on n.",
              "Base case n = 0: A = ∅, and its only subset is ∅, so |Powerset(A)| = 1 = 2⁰.",
              "Inductive hypothesis: assume every set with n elements has 2ⁿ subsets.",
              "Let |A| = n + 1. Pick an element a ∈ A and let A′ = A \\ {a}, so |A′| = n.",
              "Every subset of A either leaves a out (it’s a subset of A′) or contains a (it’s a subset of A′ with a added).",
              "By the inductive hypothesis each kind has 2ⁿ subsets, so |Powerset(A)| = 2ⁿ + 2ⁿ = 2ⁿ⁺¹. ∎",
            ],
            distractors: [
              { html: "Check n = 1, 2, 3: there are 2, 4, and 8 subsets, so the pattern holds for every n.", why: "A few examples aren’t a proof. Induction needs the step from n to n + 1." },
              { html: "Assume every set with n + 1 elements has 2ⁿ⁺¹ subsets.", why: "That’s assuming what you’re trying to prove. The hypothesis is about size n." },
            ],
            done: "Base case, hypothesis, step that uses the hypothesis, conclusion: the induction template.",
          },
          {
            id: "flaw-split", name: "Flaw: who picks the split?", type: "flaw",
            theorem: "<b>Claim:</b> L = { w | w has the same number of 0s and 1s } is not regular. (The claim is true, but this proof is broken.)",
            lines: [
              { html: "Assume for contradiction that L is regular, with pumping length p.", ok: "Pumping-lemma proofs start exactly like this." },
              { html: "Choose w = (01)ᵖ, which is in L and has length 2p ≥ p.", ok: "This w is in L and long enough, so choosing it is allowed." },
              { html: "Split it as x = ε, y = 0, and z = 1(01)<sup>p−1</sup>.", ok: "" },
              { html: "Take i = 2: xy²z = 001(01)<sup>p−1</sup> has more 0s than 1s, so it isn’t in L.", ok: "For the split in line 3, this calculation is correct." },
              { html: "This contradicts the pumping lemma, so L is not regular. ∎", ok: "This would follow if the earlier lines were valid." },
            ],
            flaw: 2,
            why: "You don’t get to choose the split. The pumping lemma only promises that <b>some</b> split exists, so the proof must work for every split with |xy| ≤ p and |y| &gt; 0. Here the adversary can pick y = 01, and pumping 01 keeps the counts equal. (A correct proof uses w = 0ᵖ1ᵖ.)",
          },
          {
            id: "flaw-nfa", name: "Flaw: complementing an NFA", type: "flaw",
            theorem: "<b>Claim:</b> if A is regular, so is A̅. (The claim is true, but this proof is broken.)",
            lines: [
              { html: "Let A be a regular language.", ok: "That’s the given." },
              { html: "Then some NFA N recognizes A.", ok: "True: every regular language has an NFA (and a DFA)." },
              { html: "Let N′ be N with its accept and non-accept states swapped.", ok: "Building N′ is fine. The question is what it accepts." },
              { html: "N′ accepts w exactly when N rejects w, because every accept state became non-accepting and vice versa.", ok: "" },
              { html: "So N′ recognizes A̅, and A̅ is regular. ∎", ok: "This would follow if the line before it were true." },
            ],
            flaw: 3,
            why: "For an NFA this is false. N accepts w if <b>some</b> run ends in an accept state. If one run ends in an accept state and another doesn’t, then after swapping, N′ <b>also</b> accepts w. The fix: convert N to a DFA first, then swap.",
          },
          {
            id: "flaw-induction", name: "Flaw: an induction that breaks", type: "flaw",
            theorem: "<b>Claim:</b> in any set of n ≥ 1 strings, all the strings have the same length. (Obviously false! Find where the proof goes wrong.)",
            lines: [
              { html: "We prove this by induction on n.", ok: "Setting up an induction is fine, even for a false claim." },
              { html: "Base case n = 1: a single string has the same length as itself.", ok: "True." },
              { html: "Step: given n + 1 strings w₁, …, w<sub>n+1</sub>, the first n all have the same length by the inductive hypothesis, and so do the last n.", ok: "Each group has n strings, so the hypothesis applies to both." },
              { html: "The two groups share w₂, …, wₙ, so all n + 1 strings have the same length as those shared strings.", ok: "" },
              { html: "By induction, all the strings in any set have the same length. ∎", ok: "This would follow if the step worked for every n." },
            ],
            flaw: 3,
            why: "When n = 1, the two groups are {w₁} and {w₂}, and they share <b>nothing</b>. So the step from 1 to 2 fails, and every later step depends on it. Always check that your inductive step works for the smallest n.",
          },
        ],
      },
    },
  ],

  flashcards: [
    { front: "Which proof type for “there exists a DFA for L”?", back: "<b>Construction</b>: build the DFA and explain why it accepts exactly L." },
    { front: "Which proof type for “L is not regular”?", back: "The <b>pumping lemma</b>, as a proof by contradiction." },
    { front: "Which proof type for “for every n ≥ 0, …”?", back: "Usually <b>induction</b> on n." },
    { front: "The three parts of an induction proof", back: "Base case, inductive hypothesis (assume P(n)), inductive step (prove P(n + 1) using the hypothesis)." },
    { front: "First line of a proof by contradiction", back: "“Suppose, for contradiction, that …” followed by the <b>opposite</b> of what you want to prove." },
    { front: "In a pumping proof, what may you NOT choose?", back: "The pumping length p and the split x, y, z." },
    { front: "Is checking examples a proof?", back: "No. A few cases (n = 1, 2, 3) say nothing about all n." },
    { front: "The step people forget in construction proofs", back: "Explaining <b>why</b> the construction works for every input, not just building it." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [0],
      q: "You need to prove “regular languages are closed under intersection.” What kind of proof fits best?",
      options: ["Pumping lemma", "Construction: build a machine for A ∩ B (like the product construction)", "Checking small examples", "Proof by contradiction using √2"],
      answer: 1,
      explain: "Closure statements say a machine exists for the new language, so build one and explain why it accepts exactly the right strings. In lecture: the product construction, or De Morgan with complement and union.",
    },
    {
      type: "mc",
      lec: [4],
      q: "A pumping proof starts with “Let p = 3.” What’s wrong?",
      options: ["Nothing", "p must be even", "You don’t choose p; the proof must work for any pumping length", "p must be larger than |w|"],
      answer: 2,
      explain: "The pumping lemma hands you p (the adversary’s move). Your choice of w and i must work for whatever p is.",
    },
    {
      type: "mc",
      lec: [0],
      q: "What does a proof by contradiction assume first?",
      options: ["The statement you want to prove", "The opposite of the statement you want to prove", "A base case", "That every example works"],
      answer: 1,
      explain: "Assume the negation, show it leads to something impossible, and conclude the original statement is true.",
    },
    {
      type: "tf",
      lec: [0],
      q: "True or false: in an induction proof, it’s fine if the inductive step only works for n ≥ 2, as long as the base case is n = 1.",
      answer: false,
      explain: "The step has to connect the base case to everything after it. If it fails from 1 to 2, nothing beyond 1 is proved. That’s the bug in the “all strings have the same length” puzzle.",
    },
    {
      type: "mc",
      lec: [4],
      q: "In a pumping proof with w = 0ᵖ1ᵖ, which sentence uses |xy| ≤ p correctly?",
      options: ["“So y = 01.”", "“So y consists only of 0s.”", "“So y is the whole string.”", "“So x is empty.”"],
      answer: 1,
      explain: "The first p symbols are 0s, and xy fits inside them, so y is all 0s. It works for every split, which is what you need.",
    },
    {
      type: "tf",
      lec: [0],
      q: "True or false: showing that a claim holds for n = 1, 2, 3, and 4 proves it holds for all n.",
      answer: false,
      explain: "Examples can suggest a pattern, but only a general argument (like induction) proves it for every n.",
    },
  ],
});
})();
