(function () {
"use strict";

const isPrime = n => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };

registerConcept({
  id: "languages",
  oneLiner:
    "In this class, a computational problem is a <b>language</b>: a set of strings. Solving it means <b>deciding</b>, for any input string, whether it’s in the set.",

  related: ["dfa", "logic-proofs", "regex"],

  summary: {
    keyPoints: [
      { lec: [0], html: "An <b>alphabet</b> Σ is a finite set of symbols. A <b>string</b> over Σ is a finite sequence w = w<sub>1</sub>w<sub>2</sub>…w<sub>n</sub> of symbols, and its <b>length</b> is |w| = n." },
      { lec: [0], html: "The <b>empty string ε</b> has length 0. <b>Σ<sup>i</sup></b> is the set of strings of length i, and <b>Σ* = Σ<sup>0</sup> ∪ Σ<sup>1</sup> ∪ Σ<sup>2</sup> ∪ …</b> is all strings over Σ." },
      { lec: [0], kind: "warn", html: "<b>Σ<sup>0</sup> = {ε}</b> has one element. The empty set ∅ has none. So |{ε}| = 1, |∅| = 0, and |ε| = 0 (its length)." },
      { lec: [0], html: "v is a <b>substring</b> of w if its symbols appear <b>consecutively</b> in w. ε is a substring of every string." },
      { lec: [0], html: "A <b>language</b> over Σ is any subset L ⊆ Σ*. It can be finite or infinite." },
      { lec: [0], kind: "key", html: "Languages and yes/no functions are the same thing: given f : Σ* → {accept, reject}, let L = { w | f(w) = accept }. <b>Computing f is deciding whether w ∈ L.</b>" },
      { lec: [0], html: "Why strings? Any input can be encoded as a string. Why yes/no? It’s simple, and most results generalize." },
      { lec: [0], html: "A program (a DFA, a Turing machine) is a <b>finite</b> description of a language that may be <b>infinite</b>." },
    ],
    compare: {
      head: ["", "What it is", "Size"],
      rows: [
        ["ε", "The empty string (a string)", "Length |ε| = 0"],
        ["∅", "The empty set (no elements)", "|∅| = 0"],
        ["{ε}", "A set containing the empty string", "|{ε}| = 1"],
        ["Σ<sup>i</sup>", "All strings of length i", "|Σ|<sup>i</sup>"],
        ["Σ*", "All strings of every length", "Infinite (if Σ ≠ ∅)"],
      ],
    },
  },

  details: [
    {
      id: "sets",
      title: "Sets",
      lec: [0],
      html: `
        <ul>
          <li>Define a set <b>explicitly</b>, A = {1, 16, 23}, or <b>implicitly</b>, A = { x | x &gt; 7 and x is even } = {8, 10, 12, …}. In general A = { x | P(x) } for some condition P(x).</li>
          <li>The size |A| is the number of elements. It can be infinite.</li>
          <li><b>Union</b> A ∪ B = { x | x ∈ A or x ∈ B }, <b>intersection</b> A ∩ B = { x | x ∈ A and x ∈ B }, <b>complement</b> A̅ = { x | x ∉ A }, and <b>difference</b> A \\ B = { x | x ∈ A but x ∉ B } = A ∩ B̅.</li>
          <li><b>De Morgan’s laws</b> for sets: complement of (A ∪ B) = A̅ ∩ B̅, and complement of (A ∩ B) = A̅ ∪ B̅.</li>
        </ul>`,
    },
    {
      id: "powerset",
      title: "Power sets, tuples, and Cartesian products",
      lec: [0],
      html: `
        <ul>
          <li>The <b>power set</b> Powerset(A) is the set of all subsets of A. Powerset({1, 2, 3}) = {∅, {1}, {2}, {3}, {1, 2}, {2, 3}, {1, 3}, {1, 2, 3}}. If A is finite, <b>|Powerset(A)| = 2<sup>|A|</sup></b>: each element is either in a subset or not.</li>
          <li>A <b>tuple</b> (a<sub>1</sub>, …, a<sub>k</sub>) is an <b>ordered</b> finite sequence; k is its arity. (1, 5) ≠ (5, 1), but {1, 5} = {5, 1}.</li>
          <li>The <b>Cartesian product</b> A × B = { (a, b) | a ∈ A, b ∈ B }. For A = {1, 2} and B = {a, b}: A × B = {(1, a), (1, b), (2, a), (2, b)}. A<sup>k</sup> means A × A × … × A (k times).</li>
        </ul>
        <p class="callout try">The <b>Set lab</b> in the Playground computes all of these for any two small sets you type.</p>`,
    },
    {
      id: "strings",
      title: "Strings and Σ*",
      lec: [0],
      html: `
        <p>Fix a finite <b>alphabet</b> Σ, like {0, 1}. A <b>string</b> over Σ is a tuple of symbols, written without parentheses or commas: 110110 is a string over {0, 1}.</p>
        <ul>
          <li>|w| is the length. The <b>empty string ε</b> is the only string of length 0.</li>
          <li><b>Σ<sup>i</sup></b> is the set of strings of length i, so |Σ<sup>i</sup>| = |Σ|<sup>i</sup>. For Σ = {0, 1}: Σ<sup>2</sup> = {00, 01, 10, 11}.</li>
          <li><b>Σ* = ⋃<sub>i ≥ 0</sub> Σ<sup>i</sup> = Σ<sup>0</sup> ∪ Σ<sup>1</sup> ∪ Σ<sup>2</sup> ∪ …</b>: every string over Σ. It’s infinite, but every string in it is finite.</li>
          <li>v is a <b>substring</b> of w if v’s symbols appear consecutively in w: 00 is a substring of 10001. ε is a substring of every string.</li>
        </ul>
        <p class="callout warn">Σ<sup>0</sup> = {ε} is <b>not</b> the empty set: it has one element, the empty string. So |Σ<sup>0</sup>| = 1, while |∅| = 0.</p>`,
    },
    {
      id: "functions",
      title: "Functions",
      lec: [0],
      html: `
        <p>f : D → R is a function from domain D to range R: each input x ∈ D maps to exactly one output f(x) ∈ R.</p>
        <ul>
          <li>add : ℤ × ℤ → ℤ with add(x, y) = x + y.</li>
          <li>reverse : {0, 1}* → {0, 1}*, which reverses a string: reverse(0011) = 1100.</li>
        </ul>
        <p>This class focuses on functions <b>f : Σ* → {accept, reject}</b>: string inputs and yes/no outputs. Any input (a number, a graph, a program) can be encoded as a string, and yes/no questions already capture a lot.</p>`,
    },
    {
      id: "languages",
      title: "Languages and decision problems",
      lec: [0],
      html: `
        <p>A <b>language</b> over Σ is a subset L ⊆ Σ*. Languages and yes/no functions carry the same information:</p>
        <ul>
          <li>Given f, define L = { w | f(w) = accept }.</li>
          <li>Given L, define f(w) = accept if w ∈ L, and reject otherwise.</li>
        </ul>
        <p>So <b>computing f(w) is the same as deciding whether w ∈ L</b>. Examples:</p>
        <ul>
          <li>L = { w | w starts with a 0 and ends with a 1 }: easy (a DFA can do it).</li>
          <li>L = { w | w is the binary representation of a prime }: harder, but computable.</li>
          <li>L = { w | w is a C++ program that halts on the empty input }: <b>not computable at all</b>. You’ll see why later in the course.</li>
        </ul>
        <p class="callout warn">L = ∅ (no strings) and L = {ε} (just the empty string) are different languages.</p>
        <p>Deciding L means giving a “program” (an automaton, a Turing machine, …) that accepts every w ∈ L and rejects every w ∉ L. A program has a <b>finite</b> description, but the language it decides can be <b>infinite</b>.</p>`,
    },
  ],

  playground: [
    {
      id: "sigma",
      title: "Build Σ* one length at a time",
      lec: [0],
      intro: `<p>Step through Σ* = Σ<sup>0</sup> ∪ Σ<sup>1</sup> ∪ Σ<sup>2</sup> ∪ … for Σ = {0, 1}, and pick a language to see which strings it contains. Watch the counts: |Σ<sup>i</sup>| = 2<sup>i</sup>.</p>`,
      widget: "sigma-explorer",
      config: {
        alphabet: ["0", "1"],
        maxLen: 4,
        languages: [
          { id: "ends1", name: "Ends with 1", set: "{ w | w ends with a 1 }", test: w => w.endsWith("1"), note: "From the lecture: {1, 01, 11, 001, 011, 101, 111, …}." },
          { id: "start0-end1", name: "Starts 0, ends 1", set: "{ w | w starts with a 0 and ends with a 1 }", test: w => w.length >= 2 && w[0] === "0" && w.endsWith("1"), note: "An infinite language with a finite description." },
          { id: "prime", name: "Binary primes", set: "{ w | w is the binary representation of a prime }", test: w => /^1[01]*$/.test(w) && isPrime(parseInt(w, 2)), note: "10 = 2, 11 = 3, 101 = 5, 111 = 7, 1011 = 11, … (no leading zeros)." },
          { id: "even", name: "Even length", set: "{ w | |w| is even }", test: w => w.length % 2 === 0, note: "Includes ε, since |ε| = 0 is even." },
          { id: "empty", name: "∅", set: "∅ = {}", test: () => false, note: "The empty language: no strings at all, not even ε." },
          { id: "eps", name: "{ε}", set: "{ε}", test: w => w === "", note: "Exactly one string: the empty one. Compare with ∅." },
        ],
      },
    },
    {
      id: "sets",
      title: "Set lab",
      lec: [0],
      intro: `<p>Type two small sets to see their union, intersection, differences, Cartesian product, and power set, with sizes. Notice that |A × B| = |A|·|B| and |P(A)| = 2<sup>|A|</sup>.</p>`,
      widget: "set-lab",
      config: {
        examples: [{ a: "1, 2", b: "a, b" }, { a: "1, 2, 3", b: "2, 3, 4" }, { a: "1, 16, 23", b: "" }, { a: "1, 5", b: "5, 1" }],
      },
    },
  ],

  flashcards: [
    { front: "Alphabet Σ", back: "A finite set of symbols, like {0, 1}." },
    { front: "String over Σ", back: "A finite sequence of symbols from Σ, written w = w<sub>1</sub>w<sub>2</sub>…w<sub>n</sub>. Its length is |w| = n." },
    { front: "ε", back: "The empty string: the unique string of length 0." },
    { front: "Σ<sup>i</sup> and Σ*", back: "Σ<sup>i</sup> = strings of length i (there are |Σ|<sup>i</sup>). Σ* = Σ<sup>0</sup> ∪ Σ<sup>1</sup> ∪ … = all strings over Σ." },
    { front: "|Σ<sup>0</sup>|, |∅|, and |ε|", back: "|Σ<sup>0</sup>| = |{ε}| = 1, |∅| = 0, and |ε| = 0 (its length)." },
    { front: "Substring", back: "v is a substring of w if v’s symbols appear <b>consecutively</b> in w. ε is a substring of every string." },
    { front: "Language", back: "Any subset L ⊆ Σ*. It may be finite or infinite." },
    { front: "Languages vs. functions", back: "f : Σ* → {accept, reject} gives L = { w | f(w) = accept }, and vice versa. Computing f = deciding membership in L." },
    { front: "|Powerset(A)|", back: "2<sup>|A|</sup> for a finite set A." },
    { front: "Tuple vs. set", back: "Tuples are ordered: (1, 5) ≠ (5, 1). Sets aren’t: {1, 5} = {5, 1}." },
    { front: "Cartesian product A × B", back: "{ (a, b) | a ∈ A, b ∈ B }. Its size is |A| · |B|." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [0],
      q: "For Σ = {0, 1}, what are |Σ<sup>0</sup>|, |∅|, and |{ε}|?",
      options: ["0, 0, 0", "1, 0, 1", "0, 0, 1", "1, 1, 1"],
      answer: 1,
      explain: "Σ<sup>0</sup> = {ε} has one element (the empty string). ∅ has no elements. {ε} has one element.",
    },
    {
      type: "mc",
      lec: [0],
      q: "How many strings are in Σ<sup>3</sup> for Σ = {0, 1}?",
      options: ["3", "6", "8", "9"],
      answer: 2,
      explain: "|Σ<sup>i</sup>| = |Σ|<sup>i</sup> = 2<sup>3</sup> = 8: 000, 001, 010, 011, 100, 101, 110, 111.",
    },
    {
      type: "tf",
      lec: [0],
      q: "True or false: the languages L = ∅ and L = {ε} are the same.",
      answer: false,
      explain: "∅ contains no strings. {ε} contains one string, the empty string. A machine for {ε} must accept ε; a machine for ∅ accepts nothing.",
    },
    {
      type: "tf",
      lec: [0],
      q: "True or false: 01 is a substring of 0011.",
      answer: true,
      explain: "Its symbols appear consecutively in 0<b>01</b>1.",
    },
    {
      type: "mc",
      lec: [0],
      q: "What is |Powerset({1, 2, 3})|?",
      options: ["3", "6", "8", "9"],
      answer: 2,
      explain: "|Powerset(A)| = 2<sup>|A|</sup> = 2<sup>3</sup> = 8, counting ∅ and {1, 2, 3}.",
    },
    {
      type: "mc",
      lec: [0],
      q: "A = {1, 2} and B = {a, b}. Which is in A × B?",
      options: ["(a, 1)", "{1, a}", "(2, b)", "(1, 2)"],
      answer: 2,
      explain: "A × B contains ordered pairs (x, y) with x ∈ A first and y ∈ B second. (a, 1) has them in the wrong order.",
    },
    {
      type: "mc",
      lec: [0],
      q: "In this course, what does it mean to compute a function f : Σ* → {accept, reject}?",
      options: ["To list every string in Σ*", "To decide, for any input w, whether w is in L = { w | f(w) = accept }", "To find the shortest string in L", "To count the strings in L"],
      answer: 1,
      explain: "Yes/no functions and languages are the same thing, so computing f means deciding membership in its language.",
    },
    {
      type: "tf",
      lec: [0],
      q: "True or false: a language can be infinite even though the program that decides it has a finite description.",
      answer: true,
      explain: "A two-state DFA describes { w | w ends with 1 }, which has infinitely many strings. That’s the whole point of a finite description.",
    },
    {
      type: "tf",
      lec: [0],
      q: "True or false: (1, 5) and (5, 1) are the same tuple.",
      answer: false,
      explain: "Tuples are ordered, so these are different. As sets, {1, 5} and {5, 1} are the same.",
    },
  ],
});
})();
