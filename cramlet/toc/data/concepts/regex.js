(function () {
"use strict";

const count = (w, c) => w.split(c).length - 1;

registerConcept({
  id: "regex",
  oneLiner:
    "A <b>regular expression</b> describes a language by building it from single symbols with <b>∪</b>, <b>concatenation</b>, and <b>*</b>. The languages regexes describe are exactly the <b>regular</b> languages.",

  related: ["closure", "regex-to-nfa", "dfa-to-regex"],

  summary: {
    keyPoints: [
      { lec: [3], html: "The <b>regular operations</b> are union (∪), concatenation (∘), and star (*). A regular expression is a recipe that builds a language with them." },
      { lec: [3], html: "<b>Atomic</b> expressions: <b>∅</b> (no strings), <b>ε</b> (just the empty string), and <b>a</b> for each symbol a ∈ Σ." },
      { lec: [3], html: "If R<sub>1</sub> and R<sub>2</sub> are regular expressions, so are <b>(R<sub>1</sub> ∪ R<sub>2</sub>)</b>, <b>(R<sub>1</sub>R<sub>2</sub>)</b>, and <b>(R<sub>1</sub>*)</b>." },
      { lec: [3], html: "The <b>language</b> L(R) is defined the same way: L(R<sub>1</sub> ∪ R<sub>2</sub>) = L(R<sub>1</sub>) ∪ L(R<sub>2</sub>), L(R<sub>1</sub>R<sub>2</sub>) = L(R<sub>1</sub>) ∘ L(R<sub>2</sub>), and L(R*) = L(R)*." },
      { lec: [3], kind: "key", html: "<b>Precedence:</b> * first, then concatenation, then ∪. So 01*1 ∪ 0 means ((0(1*))1) ∪ 0." },
      { lec: [3], html: "Shorthand: <b>Σ</b> means any one symbol (for Σ = {0, 1}, it’s (0 ∪ 1)). <b>R<sup>+</sup> = RR*</b> means one or more copies. <b>R<sup>n</sup></b> means n copies in a row." },
      { lec: [3], kind: "warn", html: "<b>∅</b> and <b>ε</b> are different. L(∅) is the empty set (no strings). L(ε) = {ε} has one string, the empty one." },
      { lec: [3], kind: "key", html: "<b>Theorem:</b> a language is regular <b>if and only if</b> some regular expression describes it. So DFAs, NFAs, and regexes all describe the same languages." },
    ],
    compare: {
      head: ["Regex", "Language", "In words"],
      rows: [
        ["a ∪ b", "{a, b}", "a or b"],
        ["a(b ∪ a)", "{ab, aa}", "a, then b or a"],
        ["(ab)*", "{ε, ab, abab, …}", "any number of ab’s"],
        ["0(0 ∪ 1)*1", "{01, 001, 011, …}", "starts with 0 and ends with 1"],
        ["Σ*1Σ*", "{1, 01, 10, 11, …}", "contains a 1"],
      ],
    },
  },

  details: [
    {
      id: "why",
      title: "Why regular expressions?",
      lec: [3],
      html: `
        <p>A DFA or NFA describes a language with a picture, which can get complicated. A <b>regular expression</b> describes it with a formula built from simple pieces, using the three <b>regular operations</b>:</p>
        <ul>
          <li><b>Union</b> A ∪ B: strings in A or in B.</li>
          <li><b>Concatenation</b> A ∘ B: a string from A followed by a string from B.</li>
          <li><b>Star</b> A*: zero or more strings from A stuck together.</li>
        </ul>
        <p>For example, <b>0(0 ∪ 1)*1</b> describes strings that start with 0 and end with 1: a 0, then anything, then a 1.</p>`,
    },
    {
      id: "syntax",
      title: "Syntax: what counts as a regular expression",
      lec: [3],
      html: `
        <p>R is a regular expression over Σ if it is:</p>
        <ul>
          <li><b>Atomic</b> (complexity 0): <b>∅</b>, <b>ε</b>, or <b>a</b> for some a ∈ Σ.</li>
          <li><b>Built from smaller ones:</b> if R<sub>1</sub> and R<sub>2</sub> are regular expressions, then so are (R<sub>1</sub> ∪ R<sub>2</sub>), (R<sub>1</sub>R<sub>2</sub>), and (R<sub>1</sub>*).</li>
        </ul>
        <p>The <b>complexity</b> of R counts how many operations it takes to build. If R<sub>1</sub> and R<sub>2</sub> have complexity n<sub>1</sub> and n<sub>2</sub>, the new expression has complexity max(n<sub>1</sub>, n<sub>2</sub>) + 1. This is what lets you prove things about every regex by induction.</p>
        <p class="callout try">The Playground draws the <b>syntax tree</b> of any regex you type: the leaves are the atomic pieces, and each operation sits above what it combines.</p>`,
    },
    {
      id: "semantics",
      title: "Semantics: the language L(R)",
      lec: [3],
      html: `
        <p>L(R) is defined by the same recursion as the syntax:</p>
        <ul>
          <li>L(∅) = ∅, L(ε) = {ε}, and L(a) = {a}.</li>
          <li>L(R<sub>1</sub> ∪ R<sub>2</sub>) = L(R<sub>1</sub>) ∪ L(R<sub>2</sub>)</li>
          <li>L(R<sub>1</sub>R<sub>2</sub>) = L(R<sub>1</sub>) ∘ L(R<sub>2</sub>)</li>
          <li>L(R<sub>1</sub>*) = L(R<sub>1</sub>)*</li>
        </ul>
        <h4>Worked examples (Σ = {a, b})</h4>
        <ul>
          <li>L(a ∪ b) = L(a) ∪ L(b) = {a} ∪ {b} = <b>{a, b}</b></li>
          <li>L(a(b ∪ a)) = L(a) ∘ L(b ∪ a) = {a} ∘ {b, a} = <b>{ab, aa}</b></li>
          <li>L((ab)*) = L(ab)* = {ab}* = <b>{ε, ab, abab, ababab, …}</b></li>
        </ul>`,
    },
    {
      id: "notation",
      title: "Simplifying the notation",
      lec: [3],
      html: `
        <ul>
          <li><b>Precedence:</b> * binds tightest, then concatenation, then ∪, so you can drop most parentheses. 01*1 ∪ 0 means ((0(1*))1) ∪ 0, the same way 2·3² + 1 means (2·(3²)) + 1.</li>
          <li><b>Concatenation</b> is written by putting things next to each other: R<sub>1</sub>R<sub>2</sub> instead of R<sub>1</sub> ∘ R<sub>2</sub>.</li>
          <li><b>Σ</b> stands for “any one symbol.” With Σ = {0, 1}, Σ means (0 ∪ 1), so Σ0Σ1* means (0 ∪ 1)0(0 ∪ 1)1*.</li>
          <li><b>R<sup>+</sup> = RR*</b>: one or more copies of R.</li>
          <li><b>R<sup>n</sup></b>: exactly n copies of R in a row.</li>
        </ul>
        <p class="callout warn">Be careful with star and parentheses: <b>ab*</b> is a followed by any number of b’s (a, ab, abb, …), but <b>(ab)*</b> is any number of ab’s (ε, ab, abab, …).</p>`,
    },
    {
      id: "theorem",
      title: "Regular expressions describe exactly the regular languages",
      lec: [3],
      html: `
        <p class="callout key"><b>Theorem:</b> A is regular ⇔ there is a regular expression R with L(R) = A.</p>
        <p>So all three ways of describing a language are equally powerful: <b>DFA = NFA = regular expression</b>.</p>
        <ul>
          <li><b>Regex ⇒ regular:</b> by induction on the complexity of R. The atomic cases ∅, ε, and a each have a tiny NFA. For the inductive step, R is R<sub>1</sub> ∪ R<sub>2</sub>, R<sub>1</sub>R<sub>2</sub>, or R<sub>1</sub>*, and regular languages are closed under all three operations. The proof is also a recipe for turning any regex into an NFA: see <b>Regex → NFA</b>.</li>
          <li><b>Regular ⇒ regex:</b> convert a DFA into a regex using generalized NFAs. See <b>DFA → Regex</b>.</li>
        </ul>`,
    },
    {
      id: "practice",
      title: "Regular expressions in practice",
      lec: [3],
      html: `
        <p>Regexes are everywhere in programming: searching text (grep), checking formats like phone numbers or license plates, and filtering spam. A typical regex engine follows the same path as the theory: <b>regex → NFA → DFA</b> (with many optimizations), then runs the DFA over the text in one pass.</p>
        <p class="callout tip">Programming languages write union as <b>|</b> instead of ∪. You can type | in the Playground too.</p>`,
    },
  ],

  playground: [
    {
      id: "unfold",
      title: "Unfold L(R)",
      lec: [3],
      intro: `<p>Type a regular expression (or pick one), see its syntax tree, then step through working out its language from the leaves up, one rule at a time. Use the buttons to type ∪, ε, ∅, and Σ, or type | for ∪.</p>`,
      widget: "regex-explorer",
      config: {
        examples: ["a(b ∪ a)", "(ab)*", "a ∪ b", "0(0 ∪ 1)*1", "01*1 ∪ 0", "(ab ∪ a)*", "(ε ∪ a)ba*"],
        strings: { ab: ["ab", "abab", "aab", ""], "01": ["0101", "011", "10", ""] },
      },
    },
    {
      id: "write",
      title: "Write a regex",
      lec: [3],
      intro: `<p>Write a regular expression for each language. cramlet checks it on every string up to length 10 and shows the <b>shortest</b> string it gets wrong. Press Enter or <b>Check my regex</b>.</p>`,
      widget: "regex-writer",
      config: {
        alphabet: ["0", "1"],
        challenges: [
          { id: "ends1", name: "Ends in 1", lang: "{ w | w ends in 1 }", test: w => w.endsWith("1"),
            hint: "Anything at all, then a 1. “Anything at all” is (0 ∪ 1)*, or Σ*." },
          { id: "contains00", name: "Contains 00", lang: "{ w | w contains 00 }", test: w => w.includes("00"),
            hint: "Anything, then 00, then anything." },
          { id: "even-length", name: "Even length", lang: "{ w | w has even length }", test: w => w.length % 2 === 0,
            hint: "Even length means you can cut w into pieces of length 2. One piece of length 2 is ΣΣ." },
          { id: "exactly-one-1", name: "Exactly one 1", lang: "{ w | w contains exactly one 1 }", test: w => count(w, "1") === 1,
            hint: "Any number of 0s, then the 1, then any number of 0s." },
          { id: "same-ends", name: "Starts and ends the same", lang: "{ w | w starts and ends with the same symbol }", test: w => w.length > 0 && w[0] === w[w.length - 1],
            hint: "Split into cases with ∪: strings that start and end with 0, strings that start and end with 1. Don’t forget the one-symbol strings 0 and 1." },
          { id: "no-11", name: "No 11", lang: "{ w | w doesn’t contain 11 }", test: w => !w.includes("11"),
            hint: "Every 1 has to be followed by a 0, except possibly a 1 at the very end. Try building w out of the pieces 0 and 10, then allow an optional 1 at the end with (ε ∪ 1)." },
        ],
      },
    },
  ],

  flashcards: [
    { front: "The regular operations", back: "Union (∪), concatenation (∘), and star (*)." },
    { front: "Atomic regular expressions", back: "<b>∅</b>, <b>ε</b>, and <b>a</b> for each symbol a ∈ Σ." },
    { front: "L(∅) vs. L(ε)", back: "L(∅) = ∅, the empty set (no strings). L(ε) = {ε}, a set with one string, the empty string." },
    { front: "L(R<sub>1</sub>R<sub>2</sub>)", back: "L(R<sub>1</sub>) ∘ L(R<sub>2</sub>): every string of L(R<sub>1</sub>) followed by every string of L(R<sub>2</sub>)." },
    { front: "L(R*)", back: "L(R)*: zero or more strings from L(R) stuck together. It always contains ε." },
    { front: "Precedence of regex operations", back: "* first, then concatenation, then ∪. 01*1 ∪ 0 = ((0(1*))1) ∪ 0." },
    { front: "Σ in a regex", back: "Shorthand for any one symbol: with Σ = {0, 1}, Σ = (0 ∪ 1)." },
    { front: "R<sup>+</sup>", back: "RR*: one or more copies of R." },
    { front: "Complexity of a regex", back: "Atomic expressions have complexity 0. Combining expressions of complexity n<sub>1</sub> and n<sub>2</sub> gives max(n<sub>1</sub>, n<sub>2</sub>) + 1. Used for proofs by induction." },
    { front: "Regex and regular languages", back: "A language is regular <b>if and only if</b> some regular expression describes it." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [3],
      q: "With Σ = {a, b}, what is L(a(b ∪ a))?",
      options: ["{ab}", "{ab, aa}", "{a, b, ab}", "{abaa}"],
      answer: 1,
      explain: "L(a) ∘ L(b ∪ a) = {a} ∘ {b, a} = {ab, aa}.",
    },
    {
      type: "mc",
      lec: [3],
      q: "How is <b>01*1 ∪ 0</b> read, with the usual precedence?",
      options: ["(01)*(1 ∪ 0)", "((0(1*))1) ∪ 0", "0(1*(1 ∪ 0))", "(0(11)*) ∪ 0"],
      answer: 1,
      explain: "* binds tightest (only to the 1 right before it), then concatenation, then ∪. So it’s ((0(1*))1) ∪ 0.",
    },
    {
      type: "mc",
      lec: [3],
      q: "Which string is in L(0(0 ∪ 1)*1)?",
      options: ["0", "10", "0101", "011010"],
      answer: 2,
      explain: "The regex means “starts with 0 and ends with 1” (and has length at least 2). Only 0101 fits.",
    },
    {
      type: "mc",
      lec: [3],
      q: "Which of these is in L((ab)*)?",
      options: ["a", "aab", "ε", "aba"],
      answer: 2,
      explain: "(ab)* is any number of ab’s, including zero, so it contains ε, ab, abab, … but nothing with a lone a.",
    },
    {
      type: "tf",
      lec: [3],
      q: "True or false: L(∅) and L(ε) are the same language.",
      answer: false,
      explain: "L(∅) is the empty set, with no strings at all. L(ε) = {ε} contains one string: the empty string.",
    },
    {
      type: "mc",
      lec: [3],
      q: "With Σ = {0, 1}, what does Σ*1Σ* describe?",
      options: ["Strings that end in 1", "Strings that contain at least one 1", "Strings with exactly one 1", "Strings that start with 1"],
      answer: 1,
      explain: "Anything, then a 1, then anything: every string with a 1 somewhere in it.",
    },
    {
      type: "tf",
      lec: [3],
      q: "True or false: ab* and (ab)* describe the same language.",
      answer: false,
      explain: "ab* is a followed by any number of b’s (a, ab, abb, …). (ab)* is any number of ab’s (ε, ab, abab, …). For example, a is in the first but not the second.",
    },
    {
      type: "mc",
      lec: [3],
      q: "How does lecture prove that every regular expression describes a regular language?",
      options: ["With the pumping lemma", "By induction on the complexity of R, using closure under ∪, concatenation, and star", "By converting a DFA into a GNFA", "By the subset construction"],
      answer: 1,
      explain: "The atomic cases are easy NFAs, and each operation that builds a bigger regex is one the regular languages are closed under. The GNFA method is for the other direction.",
    },
    {
      type: "tf",
      lec: [3],
      q: "True or false: R<sup>+</sup> means the same as RR*.",
      answer: true,
      explain: "R<sup>+</sup> is one or more copies of R: one copy, then zero or more more.",
    },
  ],
});
})();
