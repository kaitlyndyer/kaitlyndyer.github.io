(function () {
"use strict";

// ---------- "Your turn" boxes at the end of Details sections (course/app.js renders section.yourTurn) ----------
// New sets only (none from the problem sets).
const sb = s => `<sub>${s}</sub>`;
const cell = (v, diag) => `<td><span class="dg-cell${diag ? " diag used" : ""}">${v}</span></td>`;
const DIGITS = [[3, 1, 4, 1], [2, 5, 7, 1], [9, 9, 5, 0], [0, 0, 0, 5]];
const DIGIT_TABLE = `<div class="dg-wrap"><table class="dg-table">
  <thead><tr><th></th>${[1, 2, 3, 4].map(j => `<th>${j}</th>`).join("")}<th class="dg-more">…</th></tr></thead>
  <tbody>${DIGITS.map((r, i) => `<tr><th>d${sb(i + 1)}</th>${r.map((v, j) => cell(v, i === j)).join("")}<td class="dg-more">…</td></tr>`).join("")}
  <tr class="dg-dots"><th>⋮</th><td></td><td></td><td></td><td></td><td></td></tr>
  <tr class="dg-star"><th>d*</th>${[0, 1, 2, 3].map(k => `<td><input class="blank" data-b="${k}" inputmode="numeric" maxlength="1" autocomplete="off" aria-label="Digit ${k + 1} of d*"></td>`).join("")}<td class="dg-more">…</td></tr></tbody>
</table></div>`;
const C_OR_U = ["Countable", "Uncountable"];
const sortStep = (n, set, answer, hint, why, wrong) => ({
  title: `Set ${n}`, ask: `${set}: countable or uncountable?`, choices: C_OR_U, keepOrder: true, answer, whys: answer ? [wrong, null] : [null, wrong], hint, why,
});
const TURNS = {
  countable: {
    title: "Countable or not?",
    intro: "<p>For each set, decide, then read why. The rule of thumb: if every element has a <b>finite description</b>, the set is countable. Watch for the tricky ones.</p>",
    config: {
      award: "turn:countable-sort",
      steps: [
        sortStep(1, "ℤ × ℤ, all pairs of integers", 0,
          "Can you write any pair as a finite string?",
          "Write (3, −7) as the string “3,-7” over the alphabet {0–9, −, comma}. Different pairs give different strings, and strings are countable.",
          "Each pair is two finite numbers, so it has a finite description."),
        sortStep(2, "All <b>finite</b> subsets of ℕ", 0,
          "A finite set can be written out in full.",
          "Write {2, 5, 11} as the string “2,5,11” (list it in increasing order so each set has one string). So the finite subsets are countable.",
          "Each one is finite, so you can write it down completely."),
        sortStep(3, "<b>All</b> subsets of ℕ", 1,
          "Some subsets, like the even numbers, are infinite. Think about the map to infinite binary sequences.",
          "Each infinite binary sequence gives a subset (the positions of its 1s), and different sequences give different subsets. The sequences are uncountable, so 𝒫(ℕ) is too. Compare with set 2: allowing infinite subsets changes the answer.",
          "Infinite subsets have no finite description in general. Diagonalization applies."),
        sortStep(4, "Infinite binary sequences with only <b>finitely many 1s</b>", 0,
          "After the last 1, the sequence is all 0s. How much do you need to write down?",
          "Each such sequence is decided by the finite part up to its last 1 (like 1011 then 0000…). Write that finite string, and you’ve described it. So this set is countable, even though the sequences are infinite.",
          "Infinite sequences aren’t automatically uncountable. These ones have a finite description: everything up to the last 1."),
        sortStep(5, "Infinite binary sequences with <b>infinitely many 1s</b>", 1,
          "Together with set 4, these make up all infinite binary sequences.",
          "If this set were countable, then all sequences = (set 4) ∪ (this set) would be a union of two countable sets, which is countable. But all sequences are uncountable. So this set must be uncountable.",
          "Two countable sets together are still countable. Sets 4 and 5 together make every infinite sequence."),
        sortStep(6, "All Java programs", 0,
          "A program is a text file.",
          "Every program is a finite string over a finite alphabet (its characters). So there are countably many, just like TMs.",
          "Programs are finite strings."),
        sortStep(7, "All languages over the one-letter alphabet {a}", 1,
          "A language over {a} is any set of strings like a, aa, aaa, …",
          "Send the infinite sequence s = s₁s₂s₃… to the language { aⁱ | sᵢ = 1 }. Different sequences give different languages, so there are at least as many languages as sequences: uncountable. One letter is enough.",
          "Even with one letter, a language can be any subset of {ε, a, aa, …}, and there are uncountably many subsets."),
      ],
      done: "The pattern: a finite description of every element ⇒ countable. A map from the infinite sequences into the set (one-to-one) ⇒ uncountable.",
    },
  },
  uncountable: {
    title: "Diagonalize a new set",
    intro: "<p>Prove that 𝒟, the set of all infinite sequences of <b>digits 0–9</b>, is uncountable. It’s the same proof as for binary sequences, with one change.</p>",
    config: {
      award: "turn:diag-digits",
      steps: [
        { title: "Start the proof",
          ask: "How does the proof begin?",
          choices: ["Assume 𝒟 is countable, so its elements can be listed d₁, d₂, d₃, … with every sequence somewhere on the list", "Assume 𝒟 is finite", "List the first ten sequences"],
          answer: 0,
          whys: [null, "𝒟 is obviously infinite. The question is which infinity.", "A proof has to handle every possible list, not one example."],
          hint: "It’s a proof by contradiction. What are you trying to show is impossible?",
          why: "Countable means it can be listed. We’ll show every list misses something." },
        { title: "Choose the flipping rule",
          ask: "Digit i of the new sequence d* should be…",
          choices: ["5 if the i-th digit of dᵢ isn’t 5, and 4 if it is", "The i-th digit of dᵢ", "Any digit other than 0", "The i-th digit of d₁, plus 1"],
          answer: 0,
          whys: [null, "That copies the diagonal; it doesn’t make d* different from anything.", "It has to differ from dᵢ’s i-th digit specifically, which might not be 0.", "That only looks at d₁, so it can’t be different from every row."],
          hint: "With binary there was only one other choice. With 10 digits, pick any rule that always differs from dᵢ’s i-th digit.",
          why: "Any rule works as long as digit i of d* is never equal to digit i of dᵢ. “5, or 4 if it’s 5” is a simple one. (Avoiding 0 and 9 also dodges a side issue if you ever do this with real numbers, where 0.0999… = 0.1000….)" },
        { title: "Build d*",
          ask: "Here’s the start of a list. Fill in the first four digits of d*.",
          show: DIGIT_TABLE,
          answers: [5, 4, 4, 4],
          hint: "Read the highlighted diagonal: 3, 5, 5, 5. Apply the rule to each.",
          why: "The diagonal is 3, 5, 5, 5. 3 isn’t 5, so d* starts with 5; the next three are 5, so d* gets 4 each time: d* = 5, 4, 4, 4, …" },
        { title: "Why d* isn’t on the list",
          ask: "Why can’t d* be d_k for some k?".replace("d_k", "d<sub>k</sub>"),
          choices: ["d* and d<sub>k</sub> differ at digit k", "d* is longer than d<sub>k</sub>", "d* has no 0s"],
          answer: 0,
          whys: [null, "All the sequences are infinite.", "d<sub>k</sub> might have no 0s either; that isn’t the reason."],
          hint: "Digit k of d* was built from row k.",
          why: "Digit k of d* was chosen to be different from digit k of d<sub>k</sub>. So d* differs from every row, and isn’t on the list. But the list had every sequence: contradiction. 𝒟 is uncountable. ∎" },
      ],
      done: "Write this proof on paper: assume a list, define d* with your rule, show it differs from every d<sub>k</sub> at digit k, contradiction.",
    },
  },
  "more-uncountable": {
    title: "Which way does the map go?",
    config: {
      award: "turn:map-direction",
      steps: [
        { title: "Big or small?",
          ask: "To prove a set A is uncountable, you need a one-to-one map…",
          choices: ["from an uncountable set (like the infinite binary sequences) into A", "from A into ℕ", "from ℕ into A"],
          answer: 0,
          whys: [null, "That shows A is countable: the opposite.", "Every infinite set has one of those, including countable ones."],
          hint: "A one-to-one map from S into T shows |S| ≤ |T|. Which side should the uncountable set be on?",
          why: "A one-to-one map from 𝒮 into A shows |𝒮| ≤ |A|, so A is at least as big as something uncountable." },
        { title: "Check a map",
          ask: "f sends each binary sequence s to the set of positions where s has a 1 (a subset of ℕ). Why is f one-to-one?",
          choices: ["If s ≠ t, they differ at some position i, so exactly one of f(s), f(t) contains i", "Because every subset of ℕ is f of something", "Because both sets are infinite"],
          answer: 0,
          whys: [null, "That’s “onto”, a different property. One-to-one is about different inputs giving different outputs.", "Being infinite doesn’t make a map one-to-one."],
          hint: "One-to-one means different inputs give different outputs.",
          why: "Two different sequences have a position i where one has 1 and the other 0. Then i is in one set and not the other, so the sets are different." },
      ],
    },
  },
  "self-acceptance": {
    title: "Run D on itself",
    intro: `<p>Suppose D decides SU${sb("TM")} = { ⟨M⟩ | M doesn’t accept ⟨M⟩ }. D is a TM, so we can ask what it does on its own description ⟨D⟩.</p>`,
    config: {
      award: "turn:self",
      steps: [
        { title: "If D accepts ⟨D⟩",
          ask: "Suppose D accepts ⟨D⟩. Then…",
          choices: [`⟨D⟩ ∈ SU${sb("TM")}, which means D doesn’t accept ⟨D⟩. Contradiction`, "Everything is fine", `⟨D⟩ ∈ SA${sb("TM")}, so D should have accepted. Fine`],
          answer: 0,
          whys: [null, "D decides SU<sub>TM</sub>, so “D accepts ⟨D⟩” means ⟨D⟩ is in SU<sub>TM</sub>. Read the definition.", "D decides SU<sub>TM</sub>, not SA<sub>TM</sub>. Its accepting means ⟨D⟩ ∈ SU<sub>TM</sub>."],
          hint: "D accepts exactly the strings in SU<sub>TM</sub>. What does it mean for ⟨D⟩ to be in SU<sub>TM</sub>?",
          why: `D accepts ⟨D⟩ ⇒ ⟨D⟩ ∈ SU${sb("TM")} ⇒ D doesn’t accept ⟨D⟩. Impossible.` },
        { title: "If D rejects ⟨D⟩",
          ask: "Suppose instead D rejects ⟨D⟩. Then…",
          choices: [`D doesn’t accept ⟨D⟩, so ⟨D⟩ ∈ SU${sb("TM")}, so D should accept. Contradiction`, "Everything is fine"],
          answer: 0,
          whys: [null, "Follow the definition one more step: not accepting ⟨D⟩ puts ⟨D⟩ in SU<sub>TM</sub>."],
          hint: "Rejecting means not accepting. Which set does that put ⟨D⟩ in?",
          why: `D rejects ⟨D⟩ ⇒ D doesn’t accept ⟨D⟩ ⇒ ⟨D⟩ ∈ SU${sb("TM")} ⇒ D (a decider for it) accepts ⟨D⟩. Impossible.` },
        { title: "The way out?",
          ask: "Could D escape by looping on ⟨D⟩?",
          choices: ["No: D is a decider, so it halts on every input", "Yes, that resolves it"],
          answer: 0,
          whys: [null, "A decider always halts. Looping would mean D isn’t a decider at all."],
          hint: "What does “decides” promise?",
          why: `D must accept or reject ⟨D⟩, and both are impossible. So no decider for SU${sb("TM")} exists. ∎` },
      ],
    },
  },
};

registerConcept({
  id: "countability",
  oneLiner:
    "Some infinities are bigger than others. There are only <b>countably many</b> Turing machines but <b>uncountably many</b> languages, so most languages have no TM at all. Diagonalization even names one: SU<sub>TM</sub>.",

  related: ["church-turing", "reductions", "proof-practice"],

  summary: {
    keyPoints: [
      { lec: [7], html: "To compare the sizes of infinite sets, use <b>one-to-one</b> functions: if there’s a one-to-one f : S → T, then |S| ≤ |T|. If it works both ways, |S| = |T|." },
      { lec: [7], html: "The natural numbers ℕ are the <b>smallest infinity</b>. An infinite set A is <b>countable</b> if |A| = |ℕ|; it’s enough to find a one-to-one map from A into ℕ." },
      { lec: [7], html: "Anything with a <b>finite description</b> is countable: strings, integers, rationals, finite tuples, and every set of machines (DFAs, TMs, …). Write each object as a string, and strings are countable." },
      { lec: [7], html: "The set of <b>infinite binary sequences</b> is <b>uncountable</b>. Proof by <b>diagonalization</b>: given any list, flip the diagonal to build a sequence that differs from every row." },
      { lec: [7], html: "The reals, the subsets of ℕ, and the set of <b>all languages</b> over {0, 1} are uncountable too: each has a one-to-one map from the infinite sequences into it." },
      { lec: [7], kind: "key", html: "Countably many TMs, uncountably many languages ⇒ <b>some language isn’t recognized by any TM</b> (so it isn’t decidable either)." },
      { lec: [7], html: "<b>SU<sub>TM</sub> = { ⟨M⟩ | M doesn’t accept ⟨M⟩ }</b> is undecidable: a decider D for it would accept ⟨D⟩ exactly when it doesn’t accept ⟨D⟩." },
      { lec: [7], kind: "warn", html: "“Infinite” doesn’t mean “uncountable.” ℕ, the even numbers, {0,1}*, and the rationals are all the same size." },
    ],
    compare: {
      head: ["Set", "Countable?", "Why"],
      rows: [
        ["Even numbers, integers", "Countable", "List them: 0, 1, −1, 2, −2, …"],
        ["Strings {0,1}*", "Countable", "x ↦ the binary number 1x is one-to-one"],
        ["Rationals ℚ", "Countable", "Write m/n in lowest terms as a string"],
        ["All TMs (or DFAs, NFAs, …)", "Countable", "Each has a finite description ⟨M⟩"],
        ["Infinite binary sequences", "Uncountable", "Diagonalization"],
        ["Reals, subsets of ℕ, all languages", "Uncountable", "The infinite sequences map into them one-to-one"],
      ],
    },
  },

  details: [
    {
      id: "plan",
      title: "The plan: are there problems no TM can solve?",
      lec: [7],
      html: `
        <p>So far, every language we met had a TM that decides it. This lecture shows that isn’t luck running out: <b>most</b> languages have no TM at all. The argument has three steps.</p>
        <ol>
          <li><b>Count.</b> There are “fewer” TMs than languages, so some language is left without a machine. This needs a way to compare the sizes of infinite sets.</li>
          <li><b>Name one.</b> Counting proves an undecidable language exists, but doesn’t say which. Diagonalization gives a specific one: SU<sub>TM</sub>.</li>
          <li><b>Spread it.</b> Reductions (next concept) carry undecidability from SU<sub>TM</sub> to problems people actually care about, like A<sub>TM</sub> and the halting problem.</li>
        </ol>`,
    },
    {
      id: "comparing",
      title: "Comparing infinities",
      lec: [7],
      html: `
        <p>For finite sets, count the elements. For infinite sets, Cantor’s idea (1870s) is to <b>pair them up</b>.</p>
        <p>A function f : S → T is <b>one-to-one</b> if different inputs always give different outputs: a ≠ b ⇒ f(a) ≠ f(b). Then every element of S gets its own element of T, so T is at least as big:</p>
        <p class="callout key">|S| ≤ |T| if there is a one-to-one f : S → T. And |S| = |T| if |S| ≤ |T| and |T| ≤ |S|.</p>
        <ul>
          <li><b>It chains.</b> If g : R → S and f : S → T are one-to-one, then h(x) = f(g(x)) is one-to-one too. So |R| ≤ |S| ≤ |T| gives |R| ≤ |T|.</li>
          <li><b>Evens vs. naturals.</b> f(x) = x maps the evens into ℕ, and g(n) = 2n maps ℕ into the evens. Both are one-to-one, so the even numbers and ℕ are the <b>same size</b>, even though one is a proper subset of the other.</li>
        </ul>
        <p class="callout warn">With infinite sets, “a proper subset” doesn’t mean “smaller.” Only one-to-one maps decide sizes.</p>`,
    },
    {
      id: "countable",
      yourTurn: TURNS.countable,
      title: "Countable sets",
      lec: [7],
      widget: "string-numberer",
      html: `
        <p>ℕ = {1, 2, 3, …} is the <b>smallest infinity</b>: every infinite set has at least as many elements. An infinite set A is <b>countable</b> if |A| = |ℕ|. Because ℕ is the smallest, it’s enough to show <b>|A| ≤ |ℕ|</b>: find a one-to-one map from A into ℕ. Intuitively, A can be listed as a<sub>1</sub>, a<sub>2</sub>, a<sub>3</sub>, … with every element showing up somewhere.</p>
        <h4>Strings are countable</h4>
        <p>Map a string x ∈ {0,1}* to the number whose binary form is <b>1x</b>: ε ↦ 1, 0 ↦ 10₂ = 2, 1 ↦ 11₂ = 3, 00 ↦ 100₂ = 4, … The leading 1 keeps 0 and 00 apart. Different strings give different numbers, so it’s one-to-one. Try it below.</p>
        <p>The same trick works for Σ* over <b>any finite alphabet</b> Σ (use base |Σ| + 1 instead of binary).</p>
        <h4>Rationals are countable</h4>
        <p>Reduce m/n to lowest terms and write it as a string over Σ = {−, 0, …, 9, /}, like “−3/4”. Different rationals give different strings, so |ℚ| ≤ |Σ*| ≤ |ℕ|.</p>
        <h4>The general rule: finite descriptions</h4>
        <p class="callout key">If every object in A can be written down as its own finite string over a finite alphabet, then A is countable.</p>
        <p>That covers the integers, finite tuples of naturals, and, most importantly, <b>the set of all Turing machines</b>: each TM M has a finite encoding ⟨M⟩ (its 7-tuple written out). The same goes for DFAs, NFAs, regexes, and Java programs.</p>`,
    },
    {
      id: "uncountable",
      yourTurn: TURNS.uncountable,
      title: "An uncountable set: diagonalization",
      lec: [7],
      html: `
        <p>An <b>infinite binary sequence</b> is a<sub>1</sub>, a<sub>2</sub>, a<sub>3</sub>, … with every a<sub>i</sub> ∈ {0, 1}, going on forever. Let 𝒮 be the set of all of them.</p>
        <p class="callout warn">𝒮 is not {0,1}*. Strings are finite; these sequences never end.</p>
        <p><b>Theorem.</b> 𝒮 is uncountable.</p>
        <ol>
          <li><b>Assume</b> 𝒮 is countable, so there’s a one-to-one f : 𝒮 → ℕ.</li>
          <li>Then the sequences can be <b>listed</b> s<sub>1</sub>, s<sub>2</sub>, s<sub>3</sub>, …: let s<sub>i</sub> be the sequence that f sends to i (or all 0s if there isn’t one). Every sequence appears somewhere on this list.</li>
          <li>Write the list as a table: row i is s<sub>i</sub>, and the entry in column j is the j-th bit of s<sub>i</sub>.</li>
          <li><b>Flip the diagonal.</b> Build s* whose i-th bit is the <b>opposite</b> of the i-th bit of s<sub>i</sub>.</li>
          <li>s* differs from s<sub>1</sub> in bit 1, from s<sub>2</sub> in bit 2, and from every s<sub>i</sub> in bit i. So s* is <b>not on the list</b>.</li>
          <li>But the list contains every sequence. <b>Contradiction</b>, so 𝒮 is uncountable. ∎</li>
        </ol>
        <p class="callout tip">Why not just add s* to the list? Then you have a new list, and flipping its diagonal makes a new s** that’s missing. Every list misses something. The Playground lets you try to fix a row so it matches s*, and shows why you can’t.</p>`,
    },
    {
      id: "more-uncountable",
      yourTurn: TURNS["more-uncountable"],
      title: "More uncountable sets",
      lec: [7],
      html: `
        <p>To show A is uncountable, find an uncountable B and a one-to-one map <b>from B into A</b>. Then |B| ≤ |A|, and A is at least as big as something uncountable. 𝒮 is the usual choice of B. For a sequence s = a<sub>1</sub>, a<sub>2</sub>, a<sub>3</sub>, …:</p>
        <ul>
          <li><b>Reals ℝ:</b> f(s) = the decimal number 0.a<sub>1</sub>a<sub>2</sub>a<sub>3</sub>… (digits are only 0s and 1s, so different sequences give different numbers).</li>
          <li><b>Subsets of ℕ, 𝒫(ℕ):</b> f(s) = { i | a<sub>i</sub> = 1 }, the positions of the 1s.</li>
          <li><b>All languages over {0, 1}:</b> f(s) = { ⟨i⟩ | a<sub>i</sub> = 1 }, the binary forms of the positions of the 1s.</li>
        </ul>
        <p class="callout warn">Watch the direction. A one-to-one map from 𝒮 <b>into</b> A shows A is big. A map from A into ℕ would show A is small (countable).</p>`,
    },
    {
      id: "counting",
      title: "Counting: more languages than TMs",
      lec: [7],
      html: `
        <p>Put the two results side by side:</p>
        <ul>
          <li>The set of all TMs is <b>countable</b> (finite descriptions).</li>
          <li>The set of all languages is <b>uncountable</b>.</li>
        </ul>
        <p><b>Theorem.</b> Some language is not recognizable (and so not decidable).</p>
        <p><b>Proof.</b> Suppose every language were recognized by some TM. Send each language L to <b>the first TM (in a fixed listing) that recognizes L</b>. Two different languages can’t share a recognizer, since a TM recognizes exactly one language, so this map is one-to-one from languages into TMs. Then |languages| ≤ |TMs|, which is countable: a contradiction. ∎</p>
        <p class="callout key">There are far more problems than programs. Almost every language has no TM at all.</p>
        <p>The catch: this proof doesn’t name a single such language. Is there one we actually care about? Yes, and that’s next.</p>`,
    },
    {
      id: "self-acceptance",
      yourTurn: TURNS["self-acceptance"],
      title: "A specific one: self-acceptance",
      lec: [7],
      html: `
        <p>Since ⟨M⟩ is a string, a TM can be run on its <b>own description</b>. Call M <b>self-accepting</b> if M accepts ⟨M⟩.</p>
        <ul>
          <li>SA<sub>TM</sub> = { ⟨M⟩ | M is a TM that accepts ⟨M⟩ }</li>
          <li>SU<sub>TM</sub> = { ⟨M⟩ | M is a TM that does <b>not</b> accept ⟨M⟩ }</li>
        </ul>
        <p>If we assume every string encodes some TM, these are complements of each other, so one is decidable exactly when the other is (a decider for one, with its answer flipped, decides the other).</p>
        <p><b>Theorem.</b> SU<sub>TM</sub> is undecidable.</p>
        <ol>
          <li>Assume, for contradiction, that a decider D for SU<sub>TM</sub> exists. D always halts, and for every TM M: <b>D accepts ⟨M⟩ ⇔ M does not accept ⟨M⟩</b>.</li>
          <li>D is a TM too, so plug in M = D: <b>D accepts ⟨D⟩ ⇔ D does not accept ⟨D⟩</b>.</li>
          <li>Both answers are impossible. Contradiction, so no decider exists. ∎</li>
        </ol>
        <p>So SA<sub>TM</sub> is undecidable as well.</p>
        <h4>It’s the same diagonal</h4>
        <p>List all TMs M<sub>1</sub>, M<sub>2</sub>, … as rows and their encodings ⟨M<sub>1</sub>⟩, ⟨M<sub>2</sub>⟩, … as columns. Entry (i, j) says whether M<sub>i</sub> accepts ⟨M<sub>j</sub>⟩. The diagonal says which machines are self-accepting. <b>Flip it</b>, and you get exactly the row a decider for SU<sub>TM</sub> would need, and that row differs from every machine’s row on the diagonal. So no machine on the list is D.</p>`,
    },
    {
      id: "specific",
      title: "Undecidable problems we care about",
      lec: [7],
      html: `
        <p>Most questions about <b>what a program does</b>, given its code ⟨M⟩, are undecidable. For example, given a TM M (and a string w):</p>
        <ul>
          <li>Does M accept w? (A<sub>TM</sub>)</li>
          <li>Does M halt on w? (the halting problem)</li>
          <li>Does M accept the empty string?</li>
          <li>Is L(M) regular? Do two TMs recognize the same language?</li>
        </ul>
        <p>All of these are undecidable. They’re proved with <b>reductions</b>, starting from SA<sub>TM</sub>: see the next concept.</p>
        <p class="callout tip">Questions about the <b>code</b> itself (“does ⟨M⟩ have more than 10 states?”) can be decidable. It’s questions about the <b>language</b> or <b>behavior</b> that get you into trouble.</p>`,
    },
  ],

  playground: [
    {
      id: "diagonal",
      title: "Flip the diagonal",
      lec: [7],
      intro: `<p><b>Watch it:</b> step through Cantor’s proof. s* is built one bit at a time by flipping the diagonal, then checked against every row. Afterwards, <b>click any bit</b> in the table to try to sneak s* onto the list, and watch s* change to escape. <b>Your turn:</b> build s* yourself and check it. Press New list for a fresh one.</p>`,
      widget: "diagonal",
      config: { kind: "sequences" },
    },
    {
      id: "self",
      title: "The self-acceptance diagonal",
      lec: [7],
      intro: `<p>The same picture with Turing machines. <b>Rows</b> are machines doing the running; <b>columns</b> are inputs, and the inputs are machines’ codes. Cell (i, j) is ✓ if M<sub>i</sub> accepts ⟨M<sub>j</sub>⟩. The diagonal is each machine run on its own code. A decider for SU<sub>TM</sub> would need the flipped diagonal as its row. <b>Watch it</b> to see why no machine has that row, or take <b>Your turn</b> and fill in D’s row yourself.</p>`,
      widget: "diagonal",
      config: { kind: "machines" },
    },
  ],

  flashcards: [
    { front: "One-to-one function f : S → T", back: "a ≠ b ⇒ f(a) ≠ f(b). Different inputs, different outputs." },
    { front: "When is |S| ≤ |T|?", back: "When there’s a one-to-one function f : S → T." },
    { front: "Countable (for an infinite set A)", back: "|A| = |ℕ|. Enough to show a one-to-one map A → ℕ, because ℕ is the smallest infinity." },
    { front: "Why are the even numbers the same size as ℕ?", back: "x ↦ x maps evens into ℕ, and n ↦ 2n maps ℕ into the evens. Both are one-to-one." },
    { front: "A one-to-one map {0,1}* → ℕ", back: "x ↦ the number with binary form 1x. (ε ↦ 1, 0 ↦ 2, 1 ↦ 3, 00 ↦ 4, …)" },
    { front: "Why is the set of all TMs countable?", back: "Each TM has a finite description ⟨M⟩, a string, and strings are countable." },
    { front: "Infinite binary sequences: countable?", back: "No, uncountable. Diagonalization: flip the diagonal of any list to get a sequence that isn’t on it." },
    { front: "Diagonalization in one line", back: "Build s* whose i-th bit differs from the i-th bit of s<sub>i</sub>; then s* differs from every row." },
    { front: "How to show A is uncountable", back: "Find a one-to-one map from an uncountable set (like the infinite sequences) <b>into</b> A." },
    { front: "Why do non-recognizable languages exist?", back: "Countably many TMs, uncountably many languages. There aren’t enough machines to go around." },
    { front: "SU<sub>TM</sub>", back: "{ ⟨M⟩ | M doesn’t accept ⟨M⟩ }. Undecidable." },
    { front: "Why is SU<sub>TM</sub> undecidable?", back: "A decider D would satisfy: D accepts ⟨D⟩ ⇔ D doesn’t accept ⟨D⟩. Contradiction." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [7],
      q: "Which set is <b>uncountable</b>?",
      options: ["The rational numbers", "All strings over {0, 1}", "All infinite binary sequences", "All Turing machines"],
      answer: 2,
      whys: ["Each rational, in lowest terms, can be written as a finite string, so the rationals are countable.", "x ↦ the binary number 1x is one-to-one into ℕ, so {0,1}* is countable.", null, "Every TM has a finite description ⟨M⟩, so there are only countably many."],
      explain: "Diagonalization shows no list can contain every infinite binary sequence. The other three sets have finite descriptions, so they’re countable.",
    },
    {
      type: "mc",
      lec: [7],
      q: "To prove a set A is <b>countable</b>, it’s enough to show…",
      options: ["A is infinite", "There’s a one-to-one function from A into ℕ", "There’s a one-to-one function from ℕ into A", "A is a subset of ℝ"],
      answer: 1,
      whys: ["Being infinite says nothing about which infinity. ℝ is infinite and uncountable.", null, "That shows |ℕ| ≤ |A|, which every infinite set satisfies, including uncountable ones.", "ℝ has countable subsets (ℕ) and uncountable ones (ℝ itself)."],
      explain: "A one-to-one map into ℕ shows |A| ≤ |ℕ|. Since ℕ is the smallest infinity, an infinite A then has |A| = |ℕ|.",
    },
    {
      type: "mc",
      lec: [7],
      q: "Under the map x ↦ (the number with binary form 1x), which number does the string <b>01</b> get?",
      options: ["1", "3", "5", "6"],
      answer: 2,
      whys: ["1 is the number for ε (binary 1).", "3 is binary 11, the number for the string 1.", null, "6 is binary 110, the number for the string 10."],
      explain: "Put a 1 in front: 101 in binary is 5.",
    },
    {
      type: "mc",
      lec: [7],
      q: "In the diagonal proof, why can’t s* appear as some row s<sub>k</sub> of the list?",
      options: ["s* is longer than every row", "s* differs from s<sub>k</sub> in bit k", "s* has infinitely many 1s", "The list only has finitely many rows"],
      answer: 1,
      whys: ["Every sequence is infinite; none is longer than another.", null, "s* might have any pattern of bits; that isn’t the reason.", "The list is infinite: it’s supposed to hold every sequence."],
      explain: "s* is built so its k-th bit is the opposite of s<sub>k</sub>’s k-th bit, for every k.",
    },
    {
      type: "mc",
      lec: [7],
      q: "Which fact, together with “there are uncountably many languages,” shows that some language isn’t recognizable?",
      options: ["Every TM halts on some input", "The set of TMs is countable", "Every regular language is decidable", "Universal TMs exist"],
      answer: 1,
      whys: ["Not true in general, and not about how many TMs there are.", null, "True, but it says nothing about languages with no machine.", "True, but irrelevant to counting."],
      explain: "Countably many machines can’t cover uncountably many languages, so some language has no recognizer.",
    },
    {
      type: "mc",
      lec: [7],
      q: "Suppose D decides SU<sub>TM</sub> = { ⟨M⟩ | M doesn’t accept ⟨M⟩ }. What goes wrong when D runs on ⟨D⟩?",
      options: ["D loops forever", "D accepts ⟨D⟩ exactly when D doesn’t accept ⟨D⟩", "⟨D⟩ isn’t a valid input", "Nothing; D just rejects"],
      answer: 1,
      whys: ["D is a decider, so it always halts. The problem is that neither answer is consistent.", null, "⟨D⟩ is a string like any other TM encoding.", "If D rejects ⟨D⟩, then D doesn’t accept ⟨D⟩, so ⟨D⟩ ∈ SU<sub>TM</sub>, and D should have accepted."],
      explain: "Plug M = D into “D accepts ⟨M⟩ ⇔ M doesn’t accept ⟨M⟩.” Both answers contradict themselves.",
    },
    {
      type: "tf",
      lec: [7],
      q: "True or false: since the even numbers are a proper subset of ℕ, there are fewer even numbers than natural numbers.",
      answer: false,
      explain: "n ↦ 2n is a one-to-one map from ℕ onto the evens, so they’re the same size. For infinite sets, proper subsets can be just as big.",
    },
    {
      type: "tf",
      lec: [7],
      q: "True or false: the set of all languages over {0, 1} is uncountable.",
      answer: true,
      explain: "Map each infinite sequence a<sub>1</sub>a<sub>2</sub>… to the language { ⟨i⟩ | a<sub>i</sub> = 1 }. That’s one-to-one, so there are at least as many languages as sequences.",
    },
  ],
});
})();
