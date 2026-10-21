// "Build an NFA" exam questions (the nfa question type in ../../questions.js).
// Each answer is one correct NFA; any NFA for the same language gets full points. regex is the language as a regular
// expression: shown in the question when it's given as a regex, and always used by the tests to check the answer.
registerExam("regex-to-nfa", [
    {
        id: "nfa/11star-or-0star1", type: "nfa", regex: "(11)* ∪ 0*1",
        q: `Build an NFA for the language of the regular expression <span class="set">(11)* ∪ 0*1</span>.`,
        answer: {
            start: "q0", accept: ["q1", "q4"],
            delta: { q0: { ε: ["q1", "q3"] }, q1: { 1: ["q2"] }, q2: { 1: ["q1"] }, q3: { 0: ["q3"], 1: ["q4"] }, q4: {} },
            meaning: { q0: "start: guess which side of the ∪", q1: "an even number of 1s so far (accept)", q2: "an odd number of 1s", q3: "reading the 0s of 0*1", q4: "read the final 1 (accept)" },
        },
        explain: "For a union, start with ε-arrows into one small machine per side, the same trick as the union construction. Each side only has to work on its own strings; the NFA accepts if either guess works.",
    },
    {
        id: "nfa/ends-101", type: "nfa", regex: "(0 ∪ 1)*101",
        q: `Build an NFA for the language of the regular expression <span class="set">(0 ∪ 1)*101</span>.`,
        answer: {
            start: "q0", accept: ["q3"],
            delta: { q0: { 0: ["q0"], 1: ["q0", "q1"] }, q1: { 0: ["q2"] }, q2: { 1: ["q3"] }, q3: {} },
            meaning: { q0: "anything so far", q1: "guessed this 1 starts the final 101", q2: "read 10 of it", q3: "read 101 at the very end (accept)" },
        },
        explain: "Loop on q0 for the (0 ∪ 1)* part, then guess where the final 101 starts. If the guess is wrong, that branch dies or doesn’t end in q3, and only the right guess has to work.",
    },
    {
        id: "nfa/01or1-star-0", type: "nfa", regex: "(01 ∪ 1)*0",
        q: `Build an NFA for the language of the regular expression <span class="set">(01 ∪ 1)*0</span>.`,
        answer: {
            start: "q0", accept: ["q2"],
            delta: { q0: { 0: ["q1", "q2"], 1: ["q0"] }, q1: { 1: ["q0"] }, q2: {} },
            meaning: { q0: "between pieces of (01 ∪ 1)*", q1: "in the middle of a 01 piece", q2: "read the final 0 (accept)" },
        },
        explain: "q0 is the star’s loop: a 1 is a whole piece, and 0 then 1 is the other piece. Every 0 is a choice: start a 01 piece (q1), or guess it’s the last symbol (q2).",
    },
    {
        id: "nfa/1-anything-0-or-eps", type: "nfa", regex: "1(0 ∪ 1)*0 ∪ ε",
        q: `Build an NFA for the language of the regular expression <span class="set">1(0 ∪ 1)*0 ∪ ε</span>.`,
        answer: {
            start: "q0", accept: ["q0", "q2"],
            delta: { q0: { 1: ["q1"] }, q1: { 0: ["q1", "q2"], 1: ["q1"] }, q2: {} },
            meaning: { q0: "start, accepting so that ε is in", q1: "started with 1; anything since", q2: "guessed the last 0 (accept)" },
        },
        explain: "Making the start state accepting handles the ε part. That’s safe here because nothing leads back into q0. Then: a 1, anything, and a guess that this 0 is the last symbol.",
    },
    {
        id: "nfa/10or0-star-1", type: "nfa", regex: "(10 ∪ 0)*1",
        q: `Build an NFA for the language of the regular expression <span class="set">(10 ∪ 0)*1</span>.`,
        answer: {
            start: "q0", accept: ["q2"],
            delta: { q0: { 0: ["q0"], 1: ["q1", "q2"] }, q1: { 0: ["q0"] }, q2: {} },
            meaning: { q0: "between pieces of (10 ∪ 0)*", q1: "in the middle of a 10 piece", q2: "read the final 1 (accept)" },
        },
        explain: "Like (01 ∪ 1)*0 with the roles swapped. Each 1 is a choice: the start of a 10 piece, or the final 1.",
    },
    {
        id: "nfa/0-any-0-or-1", type: "nfa", regex: "0(0 ∪ 1)*0 ∪ 1",
        q: `Build an NFA for the language of the regular expression <span class="set">0(0 ∪ 1)*0 ∪ 1</span>.`,
        answer: {
            start: "q0", accept: ["q2", "q3"],
            delta: { q0: { 0: ["q1"], 1: ["q3"] }, q1: { 0: ["q1", "q2"], 1: ["q1"] }, q2: {}, q3: {} },
            meaning: { q0: "start", q1: "started with 0; anything since", q2: "guessed the final 0 (accept)", q3: "the string 1 (accept)" },
        },
        explain: "The two sides of the ∪ start with different symbols, so the first symbol already picks the side and no ε-arrows are needed. On the 0 side, every later 0 might be the last one.",
    },
    {
        id: "nfa/011-or-1-star", type: "nfa", regex: "(011 ∪ 1)*",
        q: `Build an NFA for the language of the regular expression <span class="set">(011 ∪ 1)*</span>.`,
        answer: {
            start: "q0", accept: ["q0"],
            delta: { q0: { 0: ["q1"], 1: ["q0"] }, q1: { 1: ["q2"] }, q2: { 1: ["q0"] } },
            meaning: { q0: "between pieces (accept: ε and complete pieces)", q1: "read the 0 of 011", q2: "read 01" },
        },
        explain: "A star of pieces is a loop back to one accepting home state. Here the home state can also be the start, because the only way back into it is by finishing a piece.",
    },
    {
        id: "nfa/1star-01star-0star", type: "nfa", regex: "1*(01)*0*",
        q: `Build an NFA for the language of the regular expression <span class="set">1*(01)*0*</span>.`,
        answer: {
            start: "q0", accept: ["q3"],
            delta: { q0: { 1: ["q0"], ε: ["q1"] }, q1: { 0: ["q2"], ε: ["q3"] }, q2: { 1: ["q1"] }, q3: { 0: ["q3"] } },
            meaning: { q0: "reading the 1*", q1: "between 01 pieces", q2: "read the 0 of a 01", q3: "reading the final 0* (accept)" },
        },
        explain: "Three parts in a row, each its own loop, joined by ε-arrows so the NFA can move on (or skip a part) whenever it likes. ε is in the language, since every part can be empty.",
    },
    {
        id: "nfa/10star-01star", type: "nfa", regex: "(10)*(01)*",
        q: `Build an NFA for the language of the regular expression <span class="set">(10)*(01)*</span>.`,
        answer: {
            start: "q0", accept: ["q2"],
            delta: { q0: { 1: ["q1"], ε: ["q2"] }, q1: { 0: ["q0"] }, q2: { 0: ["q3"] }, q3: { 1: ["q2"] } },
            meaning: { q0: "between 10 pieces", q1: "read the 1 of a 10", q2: "between 01 pieces (accept)", q3: "read the 0 of a 01" },
        },
        explain: "One loop for (10)*, one for (01)*, and an ε-arrow from the first loop’s home state to the second’s. The ε-arrow is the guess that the first part is over.",
    },
]);

// Languages described in words (not as a regex) belong to the NFA concept.
registerExam("nfa", [
    {
        id: "nfa/third-last-1", type: "nfa", regex: "(0 ∪ 1)*1(0 ∪ 1)(0 ∪ 1)",
        q: `Build an NFA for <span class="set">{ w | the third symbol from the end of w is 1 }</span>.`,
        answer: {
            start: "q0", accept: ["q3"],
            delta: { q0: { 0: ["q0"], 1: ["q0", "q1"] }, q1: { 0: ["q2"], 1: ["q2"] }, q2: { 0: ["q3"], 1: ["q3"] }, q3: {} },
            meaning: { q0: "waiting", q1: "guessed this 1 is third from the end", q2: "one more symbol read", q3: "exactly two more read (accept)" },
        },
        explain: "Guess the 1 that is third from the end, then read exactly two more symbols. The NFA has 4 states; any DFA for this language needs 8, because it has to remember the last three symbols.",
    },
    {
        id: "nfa/has11-or-ends0", type: "nfa", regex: "(0 ∪ 1)*11(0 ∪ 1)* ∪ (0 ∪ 1)*0",
        q: `Build an NFA for <span class="set">{ w | w contains 11 or w ends in 0 }</span>.`,
        answer: {
            start: "q0", accept: ["q3", "q5"],
            delta: { q0: { ε: ["q1", "q4"] }, q1: { 0: ["q1"], 1: ["q1", "q2"] }, q2: { 1: ["q3"] }, q3: { 0: ["q3"], 1: ["q3"] }, q4: { 0: ["q4", "q5"], 1: ["q4"] }, q5: {} },
            meaning: { q0: "start: guess which condition", q1: "looking for 11", q2: "guessed this 1 starts 11", q3: "found 11 (accept from here on)", q4: "looking for the last 0", q5: "guessed this 0 is last (accept)" },
        },
        explain: "An “or” is a union: ε-arrows to one small NFA for “contains 11” and one for “ends in 0.” Each only has to be right about its own condition.",
    },
    {
        id: "nfa/mult-2-or-3", type: "nfa", alphabet: ["0"], regex: "(00)* ∪ (000)*",
        q: `Over Σ = {0}, build an NFA for <span class="set">{ 0<sup>n</sup> | n is a multiple of 2 or a multiple of 3 }</span>.`,
        answer: {
            start: "q0", accept: ["q1", "q3"],
            delta: { q0: { ε: ["q1", "q3"] }, q1: { 0: ["q2"] }, q2: { 0: ["q1"] }, q3: { 0: ["q4"] }, q4: { 0: ["q5"] }, q5: { 0: ["q3"] } },
            meaning: { q0: "start: guess 2 or 3", q1: "count ≡ 0 (mod 2), accept", q2: "count ≡ 1 (mod 2)", q3: "count ≡ 0 (mod 3), accept", q4: "≡ 1 (mod 3)", q5: "≡ 2 (mod 3)" },
        },
        explain: "Two counting loops, one mod 2 and one mod 3, joined by ε-arrows from a new start state. Note that n = 0 (the empty string) is a multiple of both, so ε is in the language.",
    },
    {
        id: "nfa/contains-1001", type: "nfa", regex: "(0 ∪ 1)*1001(0 ∪ 1)*",
        q: `Build an NFA for <span class="set">{ w | w contains 1001 as a substring }</span>.`,
        answer: {
            start: "q0", accept: ["q4"],
            delta: { q0: { 0: ["q0"], 1: ["q0", "q1"] }, q1: { 0: ["q2"] }, q2: { 0: ["q3"] }, q3: { 1: ["q4"] }, q4: { 0: ["q4"], 1: ["q4"] } },
            meaning: { q0: "anything so far", q1: "guessed 1001 starts here", q2: "read 10", q3: "read 100", q4: "found 1001 (accept from here on)" },
        },
        explain: "Loop until you guess where 1001 begins, read it, then loop on anything. The DFA for this needs careful “fallback” arrows; the NFA doesn’t, because wrong guesses just die.",
    },
    {
        id: "nfa/1-in-last-two", type: "nfa", regex: "(0 ∪ 1)*1(ε ∪ 0 ∪ 1)",
        q: `Build an NFA for <span class="set">{ w | w has a 1 in its last position or its second-to-last position }</span>.`,
        answer: {
            start: "q0", accept: ["q1", "q2"],
            delta: { q0: { 0: ["q0"], 1: ["q0", "q1"] }, q1: { 0: ["q2"], 1: ["q2"] }, q2: {} },
            meaning: { q0: "waiting", q1: "guessed this 1 is last or second-to-last (accept if it’s last)", q2: "read one more symbol (accept)" },
        },
        explain: "Guess the 1, then allow at most one more symbol. Making both q1 and q2 accepting covers “last” and “second-to-last” at once.",
    },
]);
