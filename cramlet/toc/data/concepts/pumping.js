(function () {
"use strict";

const sup = n => String(n).split("").map(d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]).join("");
const count = (w, c) => w.split(c).length - 1;
const isPrime = n => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
const nextPrime = n => { while (!isPrime(n)) n++; return n; };
const r = (s, n) => s.repeat(n);

registerConcept({
  id: "pumping",
  oneLiner:
    "If L is regular, every long enough string in L has a piece near the start that you can repeat or delete and stay in L. Find a string where that <b>fails</b>, and L isn’t regular.",

  related: ["dfa", "nfa-to-dfa", "regex"],

  summary: {
    keyPoints: [
      { lec: [4], html: "Not every language is regular. <b>{0<sup>n</sup>1<sup>n</sup> | n ≥ 0}</b> isn’t: a DFA would have to count the 0s with no upper limit, and it only has finitely many states." },
      { lec: [4], html: "<b>Pumping lemma:</b> if L is regular, there is a p ≥ 1 such that every w ∈ L with |w| ≥ p can be split as <b>w = xyz</b> with <b>|y| &gt; 0</b> and <b>|xy| ≤ p</b>, where <b>xy<sup>i</sup>z ∈ L for every i ≥ 0</b>." },
      { lec: [4], html: "Why it’s true: take p = the number of DFA states. Reading the first p symbols visits p + 1 states, so some state repeats (pigeonhole). The part read between the repeats is a <b>loop</b>: that’s y, and you can go around it any number of times." },
      { lec: [4], html: "To prove L is <b>not</b> regular, use the contrapositive: for <b>every</b> p, find <b>some</b> w ∈ L with |w| ≥ p such that for <b>every</b> split xyz (|xy| ≤ p, |y| &gt; 0) there is <b>some</b> i with <b>xy<sup>i</sup>z ∉ L</b>." },
      { lec: [4], html: "Think of it as a game: the <b>adversary</b> picks p, <b>you</b> pick w, the adversary splits it, <b>you</b> pick i. If you have a strategy that always wins, L is not regular." },
      { lec: [4], kind: "warn", html: "You choose <b>w</b> and <b>i</b>. You do <b>not</b> choose p or the split, so your argument has to work for <b>any</b> p and <b>every</b> legal split." },
      { lec: [4], kind: "warn", html: "The pumping lemma can only show a language is <b>not</b> regular. A language that can be pumped might still be non-regular." },
      { lec: [4], kind: "key", html: "<b>|xy| ≤ p</b> is your best tool. Put p copies of one symbol at the start of w, and y is forced to be made of that symbol only." },
    ],
    compare: {
      head: ["Quantifier", "Who picks", "What they pick"],
      rows: [
        ["∀ p ≥ 1", "Adversary", "The pumping length p"],
        ["∃ w", "You", "A string w ∈ L with |w| ≥ p"],
        ["∀ x, y, z", "Adversary", "A split w = xyz with |xy| ≤ p and |y| &gt; 0"],
        ["∃ i ≥ 0", "You", "A number i with xy<sup>i</sup>z ∉ L"],
      ],
    },
  },

  details: [
    {
      id: "direct",
      title: "Why {0ⁿ1ⁿ} isn’t regular, directly",
      lec: [4],
      html: `
        <p>Suppose some DFA M with p states recognizes L = {0<sup>n</sup>1<sup>n</sup>}. Feed it 0, 00, 000, …, 0<sup>p</sup>. That’s p + 1 strings but only p states, so two of them, say 0<sup>i</sup> and 0<sup>j</sup> with i &lt; j, end in the <b>same state</b>.</p>
        <p>From that state, M behaves the same no matter how it got there. M must accept 0<sup>i</sup>1<sup>i</sup> (it’s in L), so it must also accept 0<sup>j</sup>1<sup>i</sup>. But i ≠ j, so 0<sup>j</sup>1<sup>i</sup> ∉ L. Contradiction, so no such DFA exists.</p>
        <p>The pumping lemma packages this argument so you can reuse it for many languages.</p>`,
    },
    {
      id: "lemma",
      title: "The pumping lemma",
      lec: [4],
      html: `
        <p class="callout key">If L is a regular language, then there is an integer <b>p ≥ 1</b> (the pumping length) such that every string <b>w ∈ L with |w| ≥ p</b> can be written as <b>w = xyz</b> where:</p>
        <ol>
          <li><b>|y| &gt; 0</b> (the pumped part isn’t empty),</li>
          <li><b>|xy| ≤ p</b> (the pumped part is within the first p symbols), and</li>
          <li><b>xy<sup>i</sup>z ∈ L for every i ≥ 0</b> (repeat y any number of times, including 0, and you stay in L).</li>
        </ol>
        <h4>Why it’s true</h4>
        <p>Let p be the number of states in a DFA for L. Reading the first p symbols of w visits p + 1 states (counting the start), so some state r appears twice. Let x be the input before the first visit to r, y the input between the two visits, and z the rest. Since y takes r back to r, you can skip the loop (i = 0) or go around it again and again, and the run still ends in the same place.</p>`,
    },
    {
      id: "contrapositive",
      title: "Flipping it around to prove non-regularity",
      lec: [4],
      html: `
        <p>The lemma says “regular ⇒ pumpable.” Its <b>contrapositive</b> (¬B ⇒ ¬A) says “not pumpable ⇒ not regular.” Negating “pumpable” flips every quantifier (De Morgan’s laws: ¬∀ = ∃¬ and ¬∃ = ∀¬):</p>
        <p class="callout key">If <b>for every p ≥ 1</b> there <b>exists</b> w ∈ L with |w| ≥ p such that <b>for every</b> split w = xyz with |y| &gt; 0 and |xy| ≤ p there <b>exists</b> i ≥ 0 with xy<sup>i</sup>z ∉ L, then <b>L is not regular</b>.</p>
        <p>Reading the quantifiers as turns gives the game: ∀ = the adversary moves, ∃ = you move.</p>`,
    },
    {
      id: "example",
      title: "Worked example: {0ⁿ1ⁿ}",
      lec: [4],
      html: `
        <ol>
          <li>The adversary picks p.</li>
          <li>You pick <b>w = 0<sup>p</sup>1<sup>p</sup></b>. It’s in L and |w| = 2p ≥ p.</li>
          <li>The adversary picks x, y, z with |xy| ≤ p and |y| &gt; 0. Since the first p symbols of w are all 0s, <b>y contains only 0s</b>.</li>
          <li>You pick <b>i = 2</b>. Then xy<sup>2</sup>z = 0<sup>p+|y|</sup>1<sup>p</sup>, which has more 0s than 1s, so it’s not in L. You win.</li>
        </ol>
        <p>You never needed to know exactly where the adversary split, just that y is all 0s. That’s the |xy| ≤ p trick.</p>`,
    },
    {
      id: "choosing-w",
      title: "Choosing w well",
      lec: [4],
      html: `
        <p>The same language can be easy or impossible depending on your w. Take <b>L = { w | w has the same number of 0s and 1s }</b>:</p>
        <ul>
          <li><b>w = 0<sup>p</sup>1<sup>p</sup></b> works, with the same argument as above: y is all 0s, and pumping up breaks the balance.</li>
          <li><b>w = (01)<sup>p</sup></b> fails: the adversary picks y = 01, and pumping 01 keeps the counts equal for every i.</li>
          <li><b>w = 0<sup>p−1</sup>1<sup>p−1</sup></b> also fails: now the first p symbols include the first 1, so the adversary can pick y = 01.</li>
        </ul>
        <p class="callout tip">Pick w so that the first p symbols are all the same and changing how many there are breaks the language.</p>`,
    },
    {
      id: "more",
      title: "More examples: pumping down, and one-letter languages",
      lec: [4],
      html: `
        <ul>
          <li><b>{ww | w ∈ {0,1}*}:</b> pick w = 0<sup>p</sup>10<sup>p</sup>1. y is in the first block of 0s; with i = 2 the two halves no longer match.</li>
          <li><b>{0<sup>i</sup>1<sup>j</sup> | i &gt; j}:</b> pumping <b>up</b> only adds 0s, which keeps i &gt; j. Pump <b>down</b> instead: pick w = 0<sup>p+1</sup>1<sup>p</sup> and i = 0, leaving at most p 0s.</li>
          <li><b>{1<sup>n²</sup> | n ≥ 0}:</b> pick w = 1<sup>p²</sup> and i = 2. The length becomes p² + |y|, which is between p² and p² + p &lt; (p + 1)², so it isn’t a perfect square.</li>
          <li><b>{1<sup>n</sup> | n is prime}:</b> pick w = 1<sup>q</sup> for a prime q ≥ p, and i = q + 1. The length becomes q + q|y| = q(|y| + 1), which is not prime because both factors are at least 2.</li>
        </ul>`,
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      lec: [4],
      html: `
        <ul>
          <li><b>Picking p yourself</b> (“let p = 3”). Your argument has to work for any p.</li>
          <li><b>Picking the split yourself.</b> You must handle <b>every</b> split allowed by |xy| ≤ p and |y| &gt; 0.</li>
          <li><b>Forgetting i = 0.</b> Sometimes pumping down is the only move that works.</li>
          <li><b>Choosing w ∉ L, or |w| &lt; p.</b> Your w must be in the language and long enough.</li>
          <li><b>Using the lemma to prove a language <i>is</i> regular.</b> It can’t do that. To show regularity, build a DFA, NFA, or regular expression.</li>
        </ul>`,
    },
  ],

  playground: [
    {
      id: "game",
      title: "Beat the adversary",
      lec: [4],
      intro: `<p>Play the pumping-lemma game. The adversary checks <b>every</b> legal split of your w, so if your w can be pumped safely, it will find out. Win a round for each language to earn crumbs, then open “See all splits” to see the full proof.</p>`,
      widget: "pumping-game",
      config: {
        languages: [
          { id: "0n1n", name: "0ⁿ1ⁿ", lang: "L = { 0ⁿ1ⁿ | n ≥ 0 }",
            test: w => /^0*1*$/.test(w) && count(w, "0") === count(w, "1"),
            suggest: p => [{ label: `0${sup(p)}1${sup(p)}`, w: r("0", p) + r("1", p) }] },
          { id: "equal", name: "Equal 0s and 1s", lang: "L = { w | w has the same number of 0s and 1s }",
            test: w => count(w, "0") === count(w, "1"),
            suggest: p => [{ label: `0${sup(p)}1${sup(p)}`, w: r("0", p) + r("1", p) }, { label: `(01)${sup(p)}`, w: r("01", p) }, { label: `0${sup(p - 1)}1${sup(p - 1)}`, w: r("0", p - 1) + r("1", p - 1) }] },
          { id: "ww", name: "ww", lang: "L = { ww | w ∈ {0,1}* }",
            test: w => w.length % 2 === 0 && w.slice(0, w.length / 2) === w.slice(w.length / 2),
            suggest: p => [{ label: `0${sup(p)}10${sup(p)}1`, w: r("0", p) + "1" + r("0", p) + "1" }, { label: `0${sup(2 * p)}`, w: r("0", 2 * p) }] },
          { id: "more-zeros", name: "More 0s than 1s", lang: "L = { 0ⁱ1ʲ | i > j }",
            test: w => /^0*1*$/.test(w) && count(w, "0") > count(w, "1"),
            suggest: p => [{ label: `0${sup(p + 1)}1${sup(p)}`, w: r("0", p + 1) + r("1", p) }, { label: `0${sup(2 * p)}1${sup(p)}`, w: r("0", 2 * p) + r("1", p) }] },
          { id: "squares", name: "Square lengths", lang: "L = { 1^(n²) | n ≥ 0 }",
            test: w => /^1*$/.test(w) && Number.isInteger(Math.sqrt(w.length)),
            suggest: p => [{ label: `1^(${p}²) = 1${sup(p * p)}`, w: r("1", p * p) }, { label: `1${sup(p)}`, w: r("1", p) }] },
          { id: "primes", name: "Prime lengths", lang: "L = { 1ⁿ | n is prime }",
            test: w => /^1*$/.test(w) && isPrime(w.length),
            suggest: p => [{ label: `1${sup(nextPrime(p))} (a prime ≥ p)`, w: r("1", nextPrime(p)) }] },
        ],
      },
    },
  ],

  flashcards: [
    { front: "The pumping lemma", back: "If L is regular, there’s a p ≥ 1 so that every w ∈ L with |w| ≥ p splits as w = xyz with <b>|y| &gt; 0</b>, <b>|xy| ≤ p</b>, and <b>xy<sup>i</sup>z ∈ L for all i ≥ 0</b>." },
    { front: "Pumping length p", back: "A number that works for the language; in the proof it’s the number of states in a DFA for L." },
    { front: "Why is the pumping lemma true?", back: "Pigeonhole: reading the first p symbols visits p + 1 states, so one repeats. The input read between the repeats (y) is a loop you can skip or repeat." },
    { front: "How do you use the pumping lemma?", back: "To show a language is <b>not</b> regular: for every p, give a w ∈ L with |w| ≥ p such that every legal split has some i with xy<sup>i</sup>z ∉ L." },
    { front: "The pumping game: who picks what?", back: "Adversary picks <b>p</b>. You pick <b>w</b>. Adversary picks <b>x, y, z</b>. You pick <b>i</b>. You win if xy<sup>i</sup>z ∉ L." },
    { front: "Why choose w = 0<sup>p</sup>1<sup>p</sup>?", back: "Because |xy| ≤ p forces <b>y to be all 0s</b>, whatever split the adversary picks." },
    { front: "When should you pump down (i = 0)?", back: "When pumping up keeps the string in L, like in {0<sup>i</sup>1<sup>j</sup> | i &gt; j}, where extra 0s don’t hurt but removing them does." },
    { front: "Can the pumping lemma prove a language is regular?", back: "<b>No.</b> It only gives a way to prove a language is <b>not</b> regular." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [4],
      q: "In a pumping-lemma proof, which of these do <b>you</b> get to choose?",
      options: ["p and the split x, y, z", "w and i", "p and i", "w and the split x, y, z"],
      answer: 1,
      explain: "The adversary picks p and the split. You pick w (in L, with |w| ≥ p) and i. Your argument must work for every p and every legal split.",
    },
    {
      type: "mc",
      lec: [4],
      q: "You pick w = 0<sup>p</sup>1<sup>p</sup> for L = {0<sup>n</sup>1<sup>n</sup>}. What do you know about y?",
      options: ["y contains at least one 1", "y is all 0s", "y = 01", "Nothing; it could be anything"],
      answer: 1,
      explain: "|xy| ≤ p, and the first p symbols of w are all 0s, so y is made of 0s only (and |y| &gt; 0).",
    },
    {
      type: "mc",
      lec: [4],
      q: "For L = { w | w has the same number of 0s and 1s }, which w makes the pumping argument <b>fail</b>?",
      options: ["0<sup>p</sup>1<sup>p</sup>", "(01)<sup>p</sup>", "Both work", "Neither works"],
      answer: 1,
      explain: "With (01)<sup>p</sup>, the adversary can pick y = 01. Pumping 01 adds one 0 and one 1 each time, so every xy<sup>i</sup>z stays in L. With 0<sup>p</sup>1<sup>p</sup>, y is all 0s and pumping breaks the balance.",
    },
    {
      type: "mc",
      lec: [4],
      q: "For L = {0<sup>i</sup>1<sup>j</sup> | i &gt; j} with w = 0<sup>p+1</sup>1<sup>p</sup>, which i wins?",
      options: ["i = 0", "i = 1", "i = 2", "Any i ≥ 2"],
      answer: 0,
      explain: "y is all 0s. Pumping up adds 0s, which keeps i &gt; j. Pumping down (i = 0) removes at least one 0, leaving at most p 0s and p 1s, so the string is no longer in L.",
    },
    {
      type: "tf",
      lec: [4],
      q: "True or false: if a language satisfies the conditions of the pumping lemma, it must be regular.",
      answer: false,
      explain: "The lemma only goes one way: regular ⇒ pumpable. Some non-regular languages are pumpable too, so passing the test proves nothing.",
    },
    {
      type: "mc",
      lec: [4],
      q: "Why does the pumping lemma require |xy| ≤ p?",
      options: ["To make y as long as possible", "Because a state must repeat within the first p symbols read", "Because x must be empty", "So that z is longer than y"],
      answer: 1,
      explain: "With p states, reading p symbols visits p + 1 states, so a repeat (and the loop y) happens within the first p symbols. That’s also what lets you control what y can contain.",
    },
    {
      type: "mc",
      lec: [4],
      q: "In the pumping lemma for L = {1<sup>n</sup> | n is prime}, with w = 1<sup>q</sup> (q prime, q ≥ p), why does i = q + 1 win?",
      options: ["Because q + 1 is even", "Because the new length is q(|y| + 1), which has two factors that are each at least 2", "Because y becomes empty", "Because the string gets shorter"],
      answer: 1,
      explain: "xy<sup>q+1</sup>z has length q + q|y| = q(|y| + 1). Since q ≥ 2 and |y| + 1 ≥ 2, that number is composite, so the string isn’t in L.",
    },
    {
      type: "tf",
      lec: [4],
      q: "True or false: in the contrapositive form, “for every split” becomes the adversary’s move.",
      answer: true,
      explain: "Each ∀ is the adversary’s move and each ∃ is yours: ∀p (adversary), ∃w (you), ∀ split (adversary), ∃i (you).",
    },
  ],
});
})();
