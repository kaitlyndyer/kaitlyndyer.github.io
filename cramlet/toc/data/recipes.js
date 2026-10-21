// Recipe Box for Theory of Computation (course/recipes.js): how to think through each kind of midterm problem.
// Worked examples use lecture-style languages that aren't in the exam bank, so a walkthrough never gives away
// a practice question. Every example machine and regex here is checked by the tests.
(function () {
    "use strict";

    // ---------- Worked-example machines ----------
    // Build a DFA: starts with 0 and has even length.
    const DFA_EX = {
        states: { q0: [70, 130], q1: [250, 50], q2: [430, 50], q3: [250, 220, { loop: 90 }] },
        start: "q0", accept: ["q2"], alphabet: ["0", "1"],
        delta: { q0: { 0: "q1", 1: "q3" }, q1: { 0: "q2", 1: "q2" }, q2: { 0: "q1", 1: "q1" }, q3: { 0: "q3", 1: "q3" } },
    };
    // Build an NFA: (0 ∪ 1)*01 ∪ 1*
    const NFA_EX = {
        states: { s: [60, 130], a: [200, 50], b: [340, 50], d: [480, 50], c: [200, 210, { loop: 0 }] },
        start: "s", accept: ["d", "c"], alphabet: ["0", "1"],
        delta: { s: { ε: ["a", "c"] }, a: { 0: ["a", "b"], 1: ["a"] }, b: { 1: ["d"] }, d: {}, c: { 1: ["c"] } },
    };
    // NFA → DFA: ends in 00, and the DFA the subset construction gives.
    const SUB_NFA = {
        states: { q0: [80, 120], q1: [260, 120], q2: [440, 120] },
        start: "q0", accept: ["q2"], alphabet: ["0", "1"],
        delta: { q0: { 0: ["q0", "q1"], 1: ["q0"] }, q1: { 0: ["q2"] }, q2: {} },
    };
    const SUB_DFA = {
        states: { A: [80, 120, { loop: -90 }], B: [260, 120], C: [440, 120, { loop: -90 }] },
        start: "A", accept: ["C"], alphabet: ["0", "1"],
        labels: { A: "{q₀}", B: "{q₀,q₁}", C: "{q₀,q₁,q₂}" },
        delta: { A: { 0: "B", 1: "A" }, B: { 0: "C", 1: "A" }, C: { 0: "C", 1: "A" } },
    };
    // DFA → regex: the lecture's "ends in 1" DFA, as a GNFA, then after each removal.
    const G0 = {
        states: { s: [50, 130], q0: [190, 130], q1: [350, 130], f: [490, 130] },
        start: "s", accept: ["f"], alphabet: ["0", "1", "ε"],
        delta: { s: { ε: "q0" }, q0: { 0: "q0", 1: "q1" }, q1: { 0: "q0", 1: "q1", ε: "f" }, f: {} },
    };
    const G1 = {
        states: { s: [60, 130], q1: [270, 130, { loop: -90 }], f: [480, 130] },
        start: "s", accept: ["f"], alphabet: ["0*1", "00*1 ∪ 1", "ε"],
        delta: { s: { "0*1": "q1" }, q1: { "00*1 ∪ 1": "q1", ε: "f" }, f: {} },
    };
    const G2 = {
        states: { s: [80, 100], f: [440, 100] },
        start: "s", accept: ["f"], alphabet: ["0*1(00*1 ∪ 1)*"],
        delta: { s: { "0*1(00*1 ∪ 1)*": "f" }, f: {} },
    };

    registerRecipes([
        // ======================================================================
        {
            id: "build-dfa", c: "dfa", title: "Build a DFA", icon: "automaton",
            when: "“Construct a DFA for L.”",
            for: { types: ["dfa"] },
            card: {
                steps: [
                    "Ask: <b>what does the machine have to remember</b> after reading part of the string?",
                    "Make <b>one state per memory</b> and write its meaning next to it (“last symbol was 1”, “odd so far”).",
                    "The start state is the memory for ε. The accept states are the memories that mean “in L right now”.",
                    "Fill in <b>every</b> arrow: from each state, on each symbol, which memory is true now?",
                    "Anything that can never be fixed goes to a <b>trap</b> state that loops on everything.",
                ],
                check: ["Run ε, the shortest string in L, and one string just outside L.", "Every state has exactly one arrow per symbol.", "Two states with the same meaning? Merge them."],
            },
            full: {
                intro: "A DFA is a fixed, finite memory. Building one is mostly deciding what to remember. Once each state has a clear meaning, the arrows almost fill themselves in.",
                steps: [
                    { t: "Find the memory", html: "<p>Imagine reading the string one symbol at a time, left to right, and someone stops you halfway. What is the <b>least</b> you need to know to finish the job? Common answers: the last symbol or two, a count mod k, a count up to a small cap (“0, 1, 2 or more”), whether something has happened yet, or the first symbol.</p><p>If the honest answer is “an exact count with no limit,” stop: the language is probably not regular (see <a href=\"#/recipes/regular-or-not\">Is it regular?</a>).</p>" },
                    { t: "One state per memory, with its meaning", html: "<p>Write the meaning inside or next to each state. It makes the arrows easy, and on an exam it shows the grader your reasoning even if one arrow is wrong.</p><p>If L is “this <b>and</b> that,” you can remember both facts at once: that’s the product idea, with one state per pair of memories.</p>" },
                    { t: "Start and accept states", html: "<p>The start state is whatever is true before reading anything (ε). Mark as accepting every state whose meaning says “the string so far is in L.” Check ε separately: is ε in L? Then the start state must accept.</p>" },
                    { t: "Fill in every arrow", html: "<p>For each state and each symbol, ask: if I knew this and then read that symbol, what do I know now? A DFA needs <b>exactly one</b> arrow for every (state, symbol) pair.</p>" },
                    { t: "Add a trap if needed", html: "<p>Some mistakes can never be undone (a forbidden substring appeared, the string started wrong). Send those to a non-accepting trap state that loops on every symbol.</p>" },
                    { t: "Test it", html: "<p>Run a few strings through by hand: ε, the shortest string in L, and a string that is <i>almost</i> in L. Most wrong DFAs fail on one of these.</p>" },
                ],
                example: {
                    title: "L = { w | w starts with 0 and has even length }",
                    html: "<p><b>Memory:</b> how it started (0, 1, or nothing yet), and after a 0, whether the length so far is odd or even. A string that starts with 1 can never get into L.</p><ul><li>q<sub>0</sub>: nothing read yet (ε is not in L: it doesn’t start with 0).</li><li>q<sub>1</sub>: started with 0, odd length so far.</li><li>q<sub>2</sub>: started with 0, even length so far. <b>Accept.</b></li><li>q<sub>3</sub>: started with 1. <b>Trap.</b></li></ul><p><b>Arrows:</b> from q<sub>0</sub>, a 0 goes to q<sub>1</sub> (length 1, odd) and a 1 goes to the trap. After that only parity matters, so q<sub>1</sub> and q<sub>2</sub> swap on every symbol.</p><p><b>Test:</b> ε → q<sub>0</sub> rejects ✓. 01 → q<sub>2</sub> accepts ✓. 0 → q<sub>1</sub> rejects ✓. 10 → q<sub>3</sub> rejects ✓.</p>",
                    machines: [{ label: "The finished DFA", machine: DFA_EX }],
                },
                traps: ["Forgetting an arrow. In a DFA every state needs one arrow for every symbol (a missing one only works if you say it goes to a trap).", "Accepting ε by accident: the start state accepts only if ε ∈ L.", "Remembering too much. If two states would always act the same, they’re one state."],
                practice: [{ label: "Build-a-DFA challenges", href: "#/c/dfa/playground" }, { label: "DFA lesson", href: "#/c/dfa/details/memory" }],
            },
        },
        // ======================================================================
        {
            id: "shapes", c: "dfa", title: "Language shapes", icon: "puzzle-piece",
            when: "You see the language and need a starting idea for a DFA, NFA, or regex.",
            for: { concepts: [] },
            card: {
                table: {
                    head: ["L looks like…", "DFA remembers", "Regex idea"],
                    rows: [
                        ["ends in x", "how much of x the end matches", "Σ*x"],
                        ["contains x", "progress toward x; then accept forever", "Σ*xΣ*"],
                        ["starts with x", "the first |x| symbols; else trap", "xΣ*"],
                        ["count of 1s mod k", "k states in a cycle", "0*(10*…)*"],
                        ["exactly / at least k of a symbol", "count up to k (then trap or stay)", "1*01*01* …"],
                        ["even / odd length", "2 states that swap", "(ΣΣ)*"],
                        ["A <b>and</b> B", "both memories (product)", "harder: build the DFA first"],
                        ["A <b>or</b> B", "both memories, or NFA + ε", "R<sub>A</sub> ∪ R<sub>B</sub>"],
                        ["not A", "flip the DFA’s accept states", "build the DFA, then convert"],
                    ],
                },
                check: ["Σ means any one symbol: (0 ∪ 1).", "For “not …”, build the easy DFA, then flip it."],
            },
            full: {
                intro: "Most exam languages are one of a handful of shapes, or two of them glued together with “and”, “or”, or “not”. Spot the shape first, then use its usual trick.",
                steps: [
                    { t: "Ends in x", html: "<p>The DFA tracks how much of x the end of the input matches (like in “ends in 01”). Careful with fallbacks: after a mismatch, the end of the input might still match the <i>start</i> of x. An NFA is easier: loop, then guess where x starts. Regex: Σ*x.</p>" },
                    { t: "Contains x", html: "<p>Same progress-tracking as “ends in x”, but once x has appeared you accept forever (a state that loops on everything). Regex: Σ*xΣ*.</p>" },
                    { t: "Counting", html: "<p>Counting mod k is a cycle of k states. “Exactly k” or “at least k” counts up to k and then goes to a trap (exactly) or stays (at least). Regex: write the symbols you count with the others starred around them, like 0*10*10* for exactly two 1s.</p>" },
                    { t: "Two conditions", html: "<p><b>And:</b> remember both facts at once (product construction), or intersect two DFAs. <b>Or:</b> same product with “either accepts”, or an NFA with ε-arrows into two small machines. <b>Not:</b> build the DFA for the positive version and swap accept and non-accept states. Never swap on an NFA.</p>" },
                ],
                example: {
                    title: "L = { w | w has even length or ends in 1 }",
                    html: "<p>Two shapes joined by “or”: even length (2 states that swap) and ends in 1 (2 states: last symbol was 1 or not). <b>NFA:</b> a new start state with ε-arrows into each little machine. <b>Regex:</b> ((0 ∪ 1)(0 ∪ 1))* ∪ (0 ∪ 1)*1. <b>DFA:</b> track both facts: 4 pairs (even/odd, last 1 / not), accepting a pair if either fact holds.</p>",
                },
                traps: ["“Ends in x” with overlaps (like 0101): after a mismatch, don’t always go back to the start.", "Using complement on an NFA. Convert to a DFA first."],
                practice: [{ label: "NFA lesson", href: "#/c/nfa/details/why" }, { label: "Closure lesson", href: "#/c/closure/details/product" }],
            },
        },
        // ======================================================================
        {
            id: "write-regex", c: "regex", title: "Write a regex", icon: "asterisk",
            when: "“Give a regular expression for L.”",
            for: { concepts: ["regex"] },
            card: {
                steps: [
                    "Find the <b>repeating pieces</b> a string in L can be cut into (like “0” and “10”).",
                    "Pieces that repeat → <b>( … ∪ … )*</b>.",
                    "Required parts → <b>concatenate</b> them in order (prefix, middle, ending).",
                    "Different kinds of strings in L → join the cases with <b>∪</b>.",
                    "Special-case ε and very short strings if needed.",
                ],
                check: ["Does it produce ε? Should it?", "Test a string just outside L: your regex must NOT make it.", "Star binds tightest, then concatenation, then ∪. Add parentheses."],
            },
            full: {
                intro: "A regex describes how strings in L are <b>built</b>. The best way in is usually to ask how you would cut any string in L into simple pieces.",
                steps: [
                    { t: "Look for pieces", html: "<p>Can every string in L be cut into blocks from a small set? “Every 1 is followed by 0” cuts into blocks <b>0</b> and <b>10</b>, so the core is (0 ∪ 10)*.</p>" },
                    { t: "Add the fixed parts", html: "<p>A required start, middle or end is just concatenated: “starts with 1” is 1Σ*, “contains 00” is Σ*00Σ*.</p>" },
                    { t: "Split into cases", html: "<p>If L has two kinds of strings (“starts with 0 and ends with 1, <i>or</i> the other way round”), write one regex per kind and join them with ∪.</p>" },
                    { t: "Check both directions", html: "<p>Everything the regex makes must be in L, and everything in L must be makeable. Test ε, a short string in L, and a string just outside L.</p>" },
                    { t: "Stuck? Use the DFA", html: "<p>If you already have a DFA, the GNFA method always works: see <a href=\"#/recipes/dfa-to-regex\">DFA → regex</a>. That’s also how the midterm solutions get a regex from a DFA.</p>" },
                ],
                example: {
                    title: "Two quick ones",
                    html: "<p><b>L = { w | w has exactly one 0 }.</b> One 0 with any number of 1s on each side: <b>1*01*</b>. Check: “0” ✓, “1101” ✓, “00” ✗ ✓.</p><p><b>L = { w | w contains 00 or 11 }.</b> Two cases joined by ∪, each a “contains” shape: <b>(0 ∪ 1)*00(0 ∪ 1)* ∪ (0 ∪ 1)*11(0 ∪ 1)*</b>, or more compactly <b>(0 ∪ 1)*(00 ∪ 11)(0 ∪ 1)*</b>.</p>",
                },
                traps: ["Writing 01* when you mean (01)*: the star only grabs the symbol right before it.", "(R ∪ S)* is not R* ∪ S*: the first lets you mix pieces.", "Mixing up ε (one string, the empty one) and ∅ (no strings)."],
                practice: [{ label: "Regex writer", href: "#/c/regex/playground" }, { label: "Regex lesson", href: "#/c/regex/details/practice" }],
            },
        },
        // ======================================================================
        {
            id: "build-nfa", c: "nfa", title: "Build an NFA", icon: "arrows-split",
            when: "“Construct an NFA for L” or “for the regular expression R.”",
            for: { types: ["nfa"] },
            card: {
                steps: [
                    "Think <b>guess and check</b>: the NFA may guess where the interesting part starts.",
                    "<b>∪</b>: a new start state with ε-arrows into one small NFA per side.",
                    "<b>Concatenation</b>: from the first part’s accept states, ε (or just keep going) into the second part.",
                    "<b>Star</b>: a loop back to an accepting “home” state, so zero copies (ε) is accepted too.",
                    "A wrong guess may simply have <b>no arrow</b>: that branch dies.",
                ],
                check: ["Trace one string that should be accepted: is there SOME path to an accept state?", "Trace one that shouldn’t: does EVERY path fail?", "Does ε behave right?"],
            },
            full: {
                intro: "An NFA accepts if <b>some</b> run accepts. That means you only have to make the right guess possible. Wrong guesses can die quietly. NFAs are usually much smaller than DFAs for the same language.",
                steps: [
                    { t: "Split the regex at its top level", html: "<p>Find the operation that is applied last: a ∪ between the main parts, then concatenations, then stars. Build the small parts first.</p>" },
                    { t: "Unions with ε", html: "<p>For R ∪ S, add a new start state with ε-arrows to a machine for R and a machine for S. Each side only has to handle its own strings.</p>" },
                    { t: "Loops for stars", html: "<p>For (pieces)*, make a home state that accepts, and have each piece leave it and come back. If the piece’s first symbol is clear, you often don’t need ε-arrows at all.</p>" },
                    { t: "Guess the special spot", html: "<p>For “ends in x” or “contains x”, loop on everything in one state, and on the first symbol of x <i>also</i> branch into reading x. The branch that guessed right reaches the accept state.</p>" },
                    { t: "Check with sets", html: "<p>To check a string, track the <b>set</b> of states the NFA could be in after each symbol (don’t forget ε-arrows). It accepts if the final set contains an accept state.</p>" },
                ],
                example: {
                    title: "The regex (0 ∪ 1)*01 ∪ 1*",
                    html: "<p>The last operation is the ∪, so: a start state s with ε-arrows to two machines.</p><ul><li><b>(0 ∪ 1)*01:</b> state a loops on 0 and 1; on a 0 it can also guess “this is the final 01” and go to b; b reads the 1 and goes to d, which accepts.</li><li><b>1*:</b> state c accepts and loops on 1.</li></ul><p><b>Check 101:</b> sets {s, a, c} → 1 → {a, c} → 0 → {a, b} → 1 → {a, d}: contains d, accept ✓. <b>Check 10:</b> … → {a, b}: no accept state, reject ✓.</p>",
                    machines: [{ label: "An NFA for (0 ∪ 1)*01 ∪ 1*", machine: NFA_EX }],
                },
                traps: ["For a star, making the old start state accepting can let in extra strings if arrows lead back into it. Add a new accepting start when in doubt.", "Forgetting that ε-arrows are followed before reading the first symbol too."],
                practice: [{ label: "Regex → NFA stepper", href: "#/c/regex-to-nfa/playground" }, { label: "NFA runner", href: "#/c/nfa/playground" }],
            },
        },
        // ======================================================================
        {
            id: "dfa-to-regex", c: "dfa-to-regex", title: "DFA → regex (GNFA)", icon: "note-pencil",
            when: "You have a DFA (or NFA) and need a regex for the same language.",
            for: { concepts: ["dfa-to-regex"] },
            card: {
                steps: [
                    "Add a <b>new start</b> state with ε to the old start.",
                    "Add <b>one new accept</b> state; ε to it from every old accept state.",
                    "Pick a state to remove. For every path p → it → r, the new label is <b>R₁(R₂)*R₃ ∪ R₄</b>.",
                    "Repeat until only the new start and new accept are left.",
                    "The label between them is the regex. Simplify it if you can.",
                ],
                check: ["R₁: p → removed, R₂: its self-loop (none = ε), R₃: removed → r, R₄: old p → r (none = ∅).", "Handle every in-arrow and out-arrow pair, including p = r."],
            },
            full: {
                intro: "This always works, even when you can’t see a regex directly. Any order of removing states gives a correct answer; some orders give shorter ones.",
                steps: [
                    { t: "Make it a GNFA", html: "<p>Add a new start state s with an ε-arrow to the old start, and a new accept state f with ε-arrows from every old accept state (they stop accepting). Now nothing points into s and nothing leaves f.</p>" },
                    { t: "Remove one state", html: "<p>Pick a state q to rip out. For every state p with an arrow into q and every state r with an arrow out of q, replace the path p → q → r with one arrow p → r labeled <b>R₁(R₂)*R₃ ∪ R₄</b>: in, loop any number of times, out, or the direct way you already had.</p>" },
                    { t: "Repeat", html: "<p>Keep removing states until only s and f are left. The label on s → f is the regex.</p>" },
                    { t: "Simplify", html: "<p>εR = R, R ∪ ∅ = R, and (R*)* = R*. If you know an equivalent shorter regex, you may use it, but only if it’s really the same language.</p>" },
                ],
                example: {
                    title: "The DFA for “ends in 1”",
                    html: "<p>q<sub>0</sub> loops on 0 and goes to q<sub>1</sub> on 1; q<sub>1</sub> loops on 1 and goes back to q<sub>0</sub> on 0; q<sub>1</sub> accepts.</p><p><b>Remove q<sub>0</sub>.</b> In-arrows: s (ε) and q<sub>1</sub> (0). Its loop: 0. Out-arrow: to q<sub>1</sub> (1).</p><ul><li>s → q<sub>1</sub>: ε 0* 1 = <b>0*1</b>.</li><li>q<sub>1</sub> → q<sub>1</sub>: 0 0* 1 ∪ 1 (the old loop) = <b>00*1 ∪ 1</b>.</li></ul><p><b>Remove q<sub>1</sub>.</b> s → f: 0*1 (00*1 ∪ 1)* ε = <b>0*1(00*1 ∪ 1)*</b>.</p><p>That describes exactly the strings that end in 1, the same as the shorter (0 ∪ 1)*1.</p>",
                    machines: [{ label: "Step 1: the GNFA (new s and f)", machine: G0 }, { label: "Step 2: after removing q₀", machine: G1 }, { label: "Step 3: after removing q₁", machine: G2 }],
                },
                traps: ["Forgetting the old direct arrow R₄ (the ∪ part).", "Forgetting that a path can go from a state back to itself (p = r), which updates that state’s loop.", "Leaving an old accept state accepting after adding f."],
                practice: [{ label: "GNFA stepper", href: "#/c/dfa-to-regex/playground" }],
            },
        },
        // ======================================================================
        {
            id: "nfa-to-dfa", c: "nfa-to-dfa", title: "NFA → DFA (subsets)", icon: "tree-structure",
            when: "You need a DFA, and an NFA is easier to build first.",
            for: { concepts: ["nfa-to-dfa"] },
            card: {
                steps: [
                    "DFA start = the <b>ε-closure</b> of the NFA’s start state.",
                    "For a DFA state (a set S) and a symbol a: everywhere S can go on a, then take the ε-closure.",
                    "Each new set you get is a new DFA state. Repeat until no new sets appear.",
                    "The empty set ∅ is a dead state (it loops to itself).",
                    "A set is accepting if it contains <b>any</b> NFA accept state.",
                ],
                check: ["Every DFA state has one arrow per symbol.", "Only build sets you can actually reach."],
            },
            full: {
                intro: "A DFA state is the <b>set</b> of states the NFA could be in. That’s why the construction always works, and why it can blow up to 2ⁿ states in the worst case.",
                steps: [
                    { t: "Start", html: "<p>Before reading anything, the NFA can be anywhere ε-arrows take it from its start. That set is the DFA’s start state.</p>" },
                    { t: "One symbol at a time", html: "<p>From a set S on symbol a: collect every state reachable from a state in S by an a-arrow, then add everything reachable from those by ε-arrows.</p>" },
                    { t: "Keep a worklist", html: "<p>List the sets you’ve found. For each one, fill in its arrows; any set you haven’t seen becomes a new row. Stop when every row is filled.</p>" },
                    { t: "Accept states", html: "<p>A DFA state accepts if its set contains at least one NFA accept state, because the NFA accepts when some run does.</p>" },
                ],
                example: {
                    title: "The NFA for “ends in 00”",
                    html: "<p>NFA: q<sub>0</sub> loops on 0 and 1, and on 0 can also go to q<sub>1</sub>; q<sub>1</sub> goes to q<sub>2</sub> on 0; q<sub>2</sub> accepts. No ε-arrows.</p><ul><li>A = {q<sub>0</sub>}. On 0: {q<sub>0</sub>, q<sub>1</sub>} = B (new). On 1: {q<sub>0</sub>} = A.</li><li>B = {q<sub>0</sub>, q<sub>1</sub>}. On 0: {q<sub>0</sub>, q<sub>1</sub>, q<sub>2</sub>} = C (new). On 1: {q<sub>0</sub>} = A.</li><li>C = {q<sub>0</sub>, q<sub>1</sub>, q<sub>2</sub>}. On 0: C. On 1: A.</li></ul><p>C contains q<sub>2</sub>, so C accepts. Three DFA states instead of the possible 2³ = 8.</p>",
                    machines: [{ label: "The NFA", machine: SUB_NFA }, { label: "The DFA from the subset construction", machine: SUB_DFA }],
                },
                traps: ["Forgetting the ε-closure, especially for the start state.", "Making a set accepting only when ALL its states accept (it’s ANY)."],
                practice: [{ label: "Subset construction stepper", href: "#/c/nfa-to-dfa/playground" }],
            },
        },
        // ======================================================================
        {
            id: "pumping", c: "pumping", title: "Pumping lemma proof", icon: "arrow-clockwise",
            when: "“Use the pumping lemma to prove that L is not regular.”",
            for: { types: ["pump"], concepts: ["pumping"] },
            card: {
                steps: [
                    "<b>Assume</b> L is regular, and let p be its pumping length. (Don’t pick a number for p.)",
                    "<b>Choose w</b> ∈ L with |w| ≥ p, built from p. Put the part L must “remember” at the front: usually p copies of one symbol.",
                    "<b>Every split</b>: since |xy| ≤ p and |y| ≥ 1, say what y must be (often y = 0ᵏ, 1 ≤ k ≤ p). If y could be different kinds of things, do cases.",
                    "<b>Choose i</b> (pump up with 2, or down with 0) and write out xyⁱz.",
                    "<b>Explain</b> why xyⁱz ∉ L. Contradiction, so L is not regular.",
                ],
                check: ["You chose w and i, and nothing else.", "Your argument works for every k from 1 to p.", "You wrote out xyⁱz and said exactly which rule of L it breaks."],
            },
            full: {
                intro: "The proof is the lecture’s game written down: the adversary picks p, you pick w, the adversary splits it, you pick i. Most of the thinking is in choosing w.",
                steps: [
                    { t: "The skeleton", html: "<p class=\"rf-skeleton\">Assume L is regular, and let p be its pumping length.<br>Choose w = ____. Then w ∈ L because ____, and |w| = ____ ≥ p.<br>Let w = xyz be any split with |xy| ≤ p and |y| ≥ 1.<br>Since ____, y = ____ for some k with 1 ≤ k ≤ p.<br>Choose i = ____. Then xyⁱz = ____.<br>This is not in L because ____.<br>This contradicts the pumping lemma, so L is not regular.</p>" },
                    { t: "Choosing w", html: "<p>Ask what L has to remember with no upper limit (a count, a match, a length). Then pick w so that:</p><ol><li>w is in L for <b>every</b> p (it’s built from p, not a fixed string),</li><li>its first p symbols are all the same, so y is forced to be just that symbol, and</li><li>it’s <b>barely</b> in L, so a small change pushes it out.</li></ol>" },
                    { t: "Patterns that usually work", html: "<table class=\"rc-table\"><thead><tr><th>L says…</th><th>Try w =</th><th>Then i =</th></tr></thead><tbody><tr><td>two counts are equal (0ⁿ1ⁿ, equal 0s and 1s)</td><td>0ᵖ1ᵖ</td><td>2 (or 0)</td></tr><tr><td>fewer 0s than 1s (&lt;)</td><td>0ᵖ1ᵖ⁺¹</td><td>2: pump up to close the gap</td></tr><tr><td>at least as many 0s (≥)</td><td>0ᵖ1ᵖ</td><td>0: pump down</td></tr><tr><td>a copy or match (ss, 0ⁿ10ⁿ)</td><td>0ᵖ10ᵖ1 or 0ᵖ10ᵖ</td><td>2 or 0</td></tr><tr><td>length is special (squares, primes, powers of 2)</td><td>1 with that length</td><td>land between two allowed lengths</td></tr><tr><td>strings start with a fixed symbol (10ⁿ1ⁿ)</td><td>that symbol, then 0ᵖ…</td><td>cases: y is all 0s, or y has the first symbol</td></tr></tbody></table>" },
                    { t: "Choosing i", html: "<p>If adding copies of y breaks L’s rule, pump <b>up</b> (i = 2). If adding copies keeps the string in L (like extra 0s in “at least as many 0s”), pump <b>down</b> (i = 0). i = 1 never works: xy¹z is just w.</p>" },
                    { t: "Finish the argument", html: "<p>Write xyⁱz in terms of p and k, and point at the rule it breaks: “p + k 0s but only p 1s, and k ≥ 1, so the counts differ.” Then conclude with the contradiction.</p>" },
                ],
                example: {
                    title: "L = { 0²ⁿ1ⁿ | n ≥ 0 } is not regular",
                    html: "<p><b>What L remembers:</b> that there are exactly twice as many 0s as 1s, with no limit. So put many 0s at the front.</p><ol><li>Assume L is regular, and let p be its pumping length.</li><li>Choose w = 0²ᵖ1ᵖ. It has n = p, so w ∈ L, and |w| = 3p ≥ p.</li><li>Let w = xyz be any split with |xy| ≤ p and |y| ≥ 1.</li><li>The first 2p ≥ p symbols are all 0s, so y = 0ᵏ with 1 ≤ k ≤ p.</li><li>Choose i = 2: xy²z = 0²ᵖ⁺ᵏ1ᵖ.</li><li>To be in L it would need 2p + k = 2 · p, so k = 0. But k ≥ 1, so xy²z ∉ L.</li><li>This contradicts the pumping lemma, so L is not regular.</li></ol>",
                },
                traps: ["Picking p yourself (“let p = 3”). The adversary picks p.", "Picking one convenient split. You must handle every split with |xy| ≤ p and |y| ≥ 1.", "A fixed w like 0011: it’s too short once p is bigger.", "Showing xyⁱz IS in L. You need it to be outside L."],
                practice: [{ label: "Write the proof (3 modes)", href: "#/c/pumping/playground" }, { label: "Choosing w well", href: "#/c/pumping/details/choosing-w" }],
            },
        },
        // ======================================================================
        {
            id: "regular-or-not", c: "pumping", title: "Is it regular?", icon: "compass",
            when: "A language shows up and you have to decide: build a machine, or prove it isn’t regular.",
            for: { concepts: [] },
            card: {
                steps: [
                    "<b>Finite?</b> Then it’s regular (list the strings).",
                    "Can a <b>fixed amount of memory</b> do it (the last few symbols, a count mod k, a few yes/no facts)? → regular: build it.",
                    "Does it compare <b>two counts with no limit</b>, or need a <b>copy/match</b> of unbounded length, or a <b>sparse set of lengths</b>? → probably not regular: pumping lemma.",
                    "Built from regular languages with ∪, ∩, complement, concatenation, or star? → regular by closure.",
                ],
                check: ["{0ᵐ1ⁿ} with no link between m and n is regular (0*1*).", "A subset of a regular language can still be non-regular."],
            },
            full: {
                intro: "The question to ask is always the same: <b>how much does a machine need to remember?</b> A bounded amount means regular; an amount that grows with the input means not regular.",
                steps: [
                    { t: "Bounded memory → regular", html: "<p>Last k symbols, a count mod k, a count capped at k, a handful of yes/no facts: all fit in finitely many states. Build the DFA, NFA or regex.</p>" },
                    { t: "Unbounded memory → not regular", html: "<p>“Same number of 0s and 1s”, “0ⁿ1ⁿ”, “ss”, “length is a perfect square”: a DFA would need to remember an exact number that can be as big as you like. Prove it with the pumping lemma.</p>" },
                    { t: "Look-alikes", html: "<p>Some languages <i>look</i> like counting but aren’t: {0ᵐ1ⁿ | m, n ≥ 0} is 0*1*, and “the number of 1s is a multiple of 3” is a 3-state cycle. Ask whether the condition really links two unbounded quantities.</p>" },
                    { t: "Closure shortcuts", html: "<p>If L is built from regular languages using ∪, ∩, complement, difference, concatenation or star, it’s regular, no machine needed. The rules only promise something when the inputs are regular.</p>" },
                ],
                example: {
                    title: "Three quick calls",
                    html: "<ul><li><b>{ w | w has an even number of 0s and an odd number of 1s }</b>: two parities, 4 states. Regular.</li><li><b>{ 0ⁿ1ᵐ | n ≤ m }</b>: compares two unbounded counts. Not regular: w = 0ᵖ1ᵖ, i = 2.</li><li><b>{ w | w contains 0101 }</b>: progress toward a fixed string. Regular.</li></ul>",
                },
                traps: ["Deciding “not regular” just because the language is infinite.", "Trying the pumping lemma to show a language IS regular. It can’t."],
                practice: [{ label: "Myth or fact?", href: "#/myths" }, { label: "Pumping game", href: "#/c/pumping/playground" }],
            },
        },
        // ======================================================================
        {
            id: "true-false", c: "closure", title: "True or false", icon: "lightbulb",
            when: "The midterm’s 10 true/false questions on closure, equivalences, the pumping lemma, and Turing machines.",
            for: { types: ["tf"] },
            card: {
                steps: [
                    "Translate machine words: <b>DFA = NFA = regex = regular</b>.",
                    "Closure: if A and B are regular, so are A ∪ B, A ∩ B, Ā, A − B, AB, A*.",
                    "Statements going <b>backwards</b> (“if A ∪ B is regular then…”) are usually false: try L and its complement, Σ*, or ∅.",
                    "The pumping lemma only goes one way: regular ⇒ pumpable.",
                    "TMs: regular ⊆ decidable ⊆ recognizable. A recognizer may <b>loop</b>; a decider always halts.",
                ],
                check: ["“Every / always” → one counterexample makes it false.", "An “if” part that can never be true → the statement is (vacuously) true."],
            },
            full: {
                intro: "Most true/false questions test one fact, or a short chain of facts. Write the chain out in a few words before you answer.",
                steps: [
                    { t: "Rewrite in plain terms", html: "<p>Replace “recognized by an NFA”, “described by a regex” and “recognized by a DFA” with “regular”. Many statements become simple closure questions.</p>" },
                    { t: "Apply closure forwards", html: "<p>Regular in, regular out: union, intersection, complement, difference (A ∩ B̄), concatenation, star. Infinite unions are not covered.</p>" },
                    { t: "Attack converses with examples", html: "<p>For “if the result is regular, then the inputs are”, try a non-regular L with its complement (union = Σ*, intersection = ∅), or Σ* itself. One counterexample makes the statement false.</p>" },
                    { t: "Know the one-way facts", html: "<p>Regular ⇒ pumpable (not the reverse). Decidable ⇒ recognizable (not the reverse). Every regular language is decidable, because a TM can simulate the DFA.</p>" },
                ],
                example: {
                    title: "Chaining facts",
                    html: "<p><b>“If A has a regex and B has an NFA, then A − B has a DFA.”</b> Regex ⇒ A regular. NFA ⇒ B regular. A − B = A ∩ B̄ is regular by closure. Regular ⇒ some DFA. <b>True.</b></p><p><b>“If A ∩ B is regular, then A is regular.”</b> Take A = {0ⁿ1ⁿ} and B = ∅: A ∩ B = ∅ is regular, but A isn’t. <b>False.</b></p>",
                },
                traps: ["Swapping accept states only complements a DFA, not an NFA.", "“Recognizes” is not “decides”: looping on strings outside L is allowed.", "A finite language is always regular."],
                practice: [{ label: "Myth or fact?", href: "#/myths" }, { label: "Closure lesson", href: "#/c/closure/details/closed" }],
            },
        },
    ]);

    // For the tests: the examples' languages.
    window.STUDY.recipeChecks = {
        dfa: { machine: DFA_EX, test: w => w[0] === "0" && w.length % 2 === 0 },
        nfa: { machine: NFA_EX, regex: "(0 ∪ 1)*01 ∪ 1*" },
        subset: { nfa: SUB_NFA, dfa: SUB_DFA },
        gnfa: { dfa: { states: { q0: [0, 0], q1: [0, 0] }, start: "q0", accept: ["q1"], alphabet: ["0", "1"], delta: { q0: { 0: "q0", 1: "q1" }, q1: { 0: "q0", 1: "q1" } } }, regex: "0*1(00*1 ∪ 1)*" },
        shapes: { regex: "((0 ∪ 1)(0 ∪ 1))* ∪ (0 ∪ 1)*1", test: w => w.length % 2 === 0 || w.endsWith("1") },
        regex: [{ regex: "1*01*", test: w => w.split("0").length - 1 === 1 }, { regex: "(0 ∪ 1)*(00 ∪ 11)(0 ∪ 1)*", test: w => /00|11/.test(w) }],
    };
})();
