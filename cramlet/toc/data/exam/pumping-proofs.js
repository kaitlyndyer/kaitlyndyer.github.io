// Pumping-lemma proofs: the "Write the proof" playground (proof-trainer widget) and the exam's "pump" questions.
// Every proof follows the lecture's game: the adversary picks p, you pick w, the adversary splits w = xyz with
// |xy| ≤ p and |y| ≥ 1, you pick i, and you win if xyⁱz ∉ L. Each w here starts with p 0s, so y is always 0ᵏ.
// Fields (HTML, authored here): lang, w (with why it’s in L), pumped (xyⁱz for the chosen i), notIn (why it's not in L), the other w's and
// i's someone might try (badW, iOpts), and sec (the Pumping Lemma section to review).
// Most w's start with p 0s, so y = 0ᵏ. A proof where that's not so gives its own y (the step), yShort (the one-line
// fact for the multiple-choice and checklist), yNot (a tempting wrong claim about y), and sym (the symbol y is made of).
(function () {
    "use strict";

    const Y = "The first p symbols of w are all 0s and |xy| ≤ p, so y = 0ᵏ for some k with 1 ≤ k ≤ p.";
    const sup = { 0: "⁰", 1: "¹", 2: "²" };

    const P = [
        {
            id: "0n12n", sec: "example", lang: "L = { 0ⁿ1²ⁿ | n ≥ 0 }",
            w: "0ᵖ1²ᵖ", wIn: "It has n = p, so w ∈ L, and |w| = 3p ≥ p.",
            i: 2, pumped: "0ᵖ⁺ᵏ1²ᵖ",
            notIn: "That string has p + k 0s and 2p 1s. To be in L it would need 2p = 2(p + k), so k = 0. But k ≥ 1, so xy²z ∉ L.",
            iOpts: [
                { i: 2, ok: true, why: "xy²z = 0ᵖ⁺ᵏ1²ᵖ: too many 0s for 2p 1s." },
                { i: 0, ok: true, why: "Also works: xz = 0ᵖ⁻ᵏ1²ᵖ has too few 0s for 2p 1s." },
                { i: 1, ok: false, why: "xy¹z is just w, which is in L. i = 1 never wins." },
            ],
            badW: [
                { w: "0¹1²", why: "A fixed string is too short once the adversary picks p > 3. You need |w| ≥ p, so w must grow with p." },
                { w: "0ᵖ1ᵖ", why: "Not in L (for p ≥ 1): it needs twice as many 1s as 0s. w must be in L." },
                { w: "(011)ᵖ", why: "Not in L (for p ≥ 2): in L, every 0 comes before every 1." },
            ],
        },
        {
            id: "fewer0", sec: "choosing-w", lang: "L = { 0ⁱ1ʲ | i < j }",
            w: "0ᵖ1ᵖ⁺¹", wIn: "It has p 0s and p + 1 1s, so w ∈ L, and |w| = 2p + 1 ≥ p.",
            i: 2, pumped: "0ᵖ⁺ᵏ1ᵖ⁺¹",
            notIn: "Now there are p + k ≥ p + 1 0s and only p + 1 1s, so the 0s are no longer fewer than the 1s. So xy²z ∉ L.",
            iOpts: [
                { i: 2, ok: true, why: "Pumping up adds k ≥ 1 0s, which uses up the one-symbol gap." },
                { i: 0, ok: false, why: "xz = 0ᵖ⁻ᵏ1ᵖ⁺¹ has even fewer 0s, so it’s still in L. Pump up here." },
                { i: 1, ok: false, why: "xy¹z is just w, which is in L." },
            ],
            badW: [
                { w: "0ᵖ1ᵖ", why: "Not in L: it needs fewer 0s than 1s, and p < p is false." },
                { w: "(01)ᵖ", why: "Not in L: for p ≥ 2 the 0s and 1s are mixed, and 01 has equal counts." },
                { w: "0²1³", why: "Too short: the adversary can pick p > 5, and w must have |w| ≥ p." },
            ],
        },
        {
            id: "0n10n", sec: "example", lang: "L = { 0ⁿ10ⁿ | n ≥ 0 }",
            w: "0ᵖ10ᵖ", wIn: "It has n = p, so w ∈ L, and |w| = 2p + 1 ≥ p.",
            i: 0, pumped: "0ᵖ⁻ᵏ10ᵖ",
            notIn: "That string has p − k 0s before the 1 and p 0s after it. Since k ≥ 1, the two counts differ, so xz ∉ L.",
            iOpts: [
                { i: 0, ok: true, why: "Removing y leaves fewer 0s before the 1 than after it." },
                { i: 2, ok: true, why: "Also works: xy²z = 0ᵖ⁺ᵏ10ᵖ has more 0s before the 1 than after." },
                { i: 1, ok: false, why: "xy¹z is just w, which is in L." },
            ],
            badW: [
                { w: "010", why: "Too short: the adversary can pick p > 3, and w must have |w| ≥ p." },
                { w: "0ᵖ1ᵖ", why: "Not in L: strings in L have a single 1 with equally many 0s on each side." },
                { w: "10ᵖ", why: "Not in L (for p ≥ 1): there are no 0s before the 1 but p after it." },
            ],
        },
        {
            id: "at-least", sec: "more", lang: "L = { 0ⁱ1ʲ | i ≥ j }",
            w: "0ᵖ1ᵖ", wIn: "It has i = j = p, so w ∈ L, and |w| = 2p ≥ p.",
            i: 0, pumped: "0ᵖ⁻ᵏ1ᵖ",
            notIn: "That string has p − k 0s and p 1s. Since k ≥ 1, p − k < p, so i ≥ j fails and xz ∉ L.",
            iOpts: [
                { i: 0, ok: true, why: "Pumping down removes 0s, and then there are fewer 0s than 1s." },
                { i: 2, ok: false, why: "xy²z = 0ᵖ⁺ᵏ1ᵖ has even more 0s, so it stays in L. Pump down instead." },
                { i: 1, ok: false, why: "xy¹z is just w, which is in L." },
            ],
            badW: [
                { w: "0ᵖ⁺¹1ᵖ", why: "It’s in L, but if the adversary picks |y| = 1, removing it leaves 0ᵖ1ᵖ, still in L, and pumping up stays in L too. So this w doesn’t beat every split. Use no spare 0s." },
                { w: "1ᵖ0ᵖ", why: "Not in L (for p ≥ 1): in L, every 0 comes before every 1." },
                { w: "0³1³", why: "Too short: the adversary can pick p > 6, and w must have |w| ≥ p." },
            ],
        },
        {
            id: "0n1n0n", sec: "choosing-w", lang: "L = { 0ⁿ1ⁿ0ⁿ | n ≥ 0 }",
            w: "0ᵖ1ᵖ0ᵖ", wIn: "It has n = p, so w ∈ L, and |w| = 3p ≥ p.",
            i: 2, pumped: "0ᵖ⁺ᵏ1ᵖ0ᵖ",
            notIn: "The first block now has p + k 0s, while the 1s and the last block of 0s still have p each. Since k ≥ 1, the three counts aren’t equal, so xy²z ∉ L.",
            iOpts: [
                { i: 2, ok: true, why: "Only the first block grows, so the three blocks no longer match." },
                { i: 0, ok: true, why: "Also works: xz = 0ᵖ⁻ᵏ1ᵖ0ᵖ has a shorter first block." },
                { i: 1, ok: false, why: "xy¹z is just w, which is in L." },
            ],
            badW: [
                { w: "(010)ᵖ", why: "Not in L (for p ≥ 2): in L, all the 1s sit together in one block." },
                { w: "0ᵖ1ᵖ", why: "Not in L (for p ≥ 1): it’s missing the last block of 0s." },
                { w: "010", why: "Too short: the adversary can pick p > 3, and w must have |w| ≥ p." },
            ],
        },
        {
            id: "more1s", sec: "choosing-w", lang: "L = { w | w has more 1s than 0s }",
            w: "0ᵖ1ᵖ⁺¹", wIn: "It has p 0s and p + 1 1s, so w ∈ L, and |w| = 2p + 1 ≥ p.",
            i: 2, pumped: "0ᵖ⁺ᵏ1ᵖ⁺¹",
            notIn: "Now there are p + k ≥ p + 1 0s and p + 1 1s, so the 1s no longer outnumber the 0s. So xy²z ∉ L.",
            iOpts: [
                { i: 2, ok: true, why: "Adding k ≥ 1 0s closes the one-symbol lead the 1s had." },
                { i: 0, ok: false, why: "Removing 0s only makes the 1s’ lead bigger, so xz is still in L." },
                { i: 1, ok: false, why: "xy¹z is just w, which is in L." },
            ],
            badW: [
                { w: "(01)ᵖ1", why: "It’s in L, but the adversary can pick y = 01 (for p ≥ 2). Pumping 01 never changes how many more 1s there are, so every xyⁱz stays in L." },
                { w: "0ᵖ1ᵖ", why: "Not in L: equal counts aren’t “more 1s.”" },
                { w: "011", why: "Too short: the adversary can pick p > 3, and w must have |w| ≥ p." },
            ],
        },
        {
            id: "0n1n", sec: "example", lang: "L = { 0ⁿ1ⁿ | n ≥ 0 }",
            w: "0ᵖ1ᵖ", wIn: "It has n = p, so w ∈ L, and |w| = 2p ≥ p.",
            i: 2, pumped: "0ᵖ⁺ᵏ1ᵖ",
            notIn: "That string has p + k 0s but only p 1s. Since k ≥ 1, the counts differ, so xy²z ∉ L.",
            iOpts: [
                { i: 2, ok: true, why: "Extra 0s with no extra 1s break the match." },
                { i: 0, ok: true, why: "Also works: xz = 0ᵖ⁻ᵏ1ᵖ has fewer 0s than 1s." },
                { i: 1, ok: false, why: "xy¹z is just w, which is in L." },
            ],
            badW: [
                { w: "(01)ᵖ", why: "Not in L (for p ≥ 2): in L, all the 0s come before all the 1s." },
                { w: "0ᵖ", why: "Not in L (for p ≥ 1): it has no 1s to match the 0s." },
                { w: "0011", why: "Too short: the adversary can pick p > 4, and w must have |w| ≥ p." },
            ],
        },
        {
            id: "equal", sec: "choosing-w", lang: "L = { w | w has the same number of 0s and 1s }",
            w: "0ᵖ1ᵖ", wIn: "It has p 0s and p 1s, so w ∈ L, and |w| = 2p ≥ p.",
            i: 2, pumped: "0ᵖ⁺ᵏ1ᵖ",
            notIn: "That string has p + k 0s and p 1s. Since k ≥ 1, the counts aren’t equal, so xy²z ∉ L.",
            iOpts: [
                { i: 2, ok: true, why: "Adding 0s without adding 1s unbalances it." },
                { i: 0, ok: true, why: "Also works: removing 0s unbalances it the other way." },
                { i: 1, ok: false, why: "xy¹z is just w, which is in L." },
            ],
            badW: [
                { w: "(01)ᵖ", why: "It’s in L, but the adversary can pick y = 01 (for p ≥ 2). Pumping 01 adds one 0 and one 1 each time, so every xyⁱz stays in L." },
                { w: "0ᵖ1ᵖ⁺¹", why: "Not in L: it has one more 1 than 0s." },
                { w: "01", why: "Too short: the adversary can pick p > 2, and w must have |w| ≥ p." },
            ],
        },
        {
            id: "ss", sec: "choosing-w", lang: "L = { ss | s ∈ {0,1}* }",
            w: "0ᵖ10ᵖ1", wIn: "It’s ss with s = 0ᵖ1, so w ∈ L, and |w| = 2p + 2 ≥ p.",
            i: 2, pumped: "0ᵖ⁺ᵏ10ᵖ1",
            notIn: "Suppose 0ᵖ⁺ᵏ10ᵖ1 = ss. It ends in 1, so s ends in 1, and since it has only two 1s, each copy of s holds exactly one. Then the first s is 0ᵖ⁺ᵏ1 and the second is 0ᵖ1. Those differ because k ≥ 1, so xy²z ∉ L.",
            iOpts: [
                { i: 2, ok: true, why: "The first half gets extra 0s, so the two halves can’t match." },
                { i: 0, ok: true, why: "Also works by the same argument: xz = 0ᵖ⁻ᵏ10ᵖ1, and 0ᵖ⁻ᵏ1 ≠ 0ᵖ1." },
                { i: 1, ok: false, why: "xy¹z is just w, which is in L." },
            ],
            badW: [
                { w: "0ᵖ0ᵖ", why: "It’s in L, but it’s just 0²ᵖ. The adversary can pick y = 00 (for p ≥ 2), and every xyⁱz is an even number of 0s, which is still in L." },
                { w: "0ᵖ1", why: "Not in L: a string ss always has an even number of 1s." },
                { w: "0101", why: "Too short: the adversary can pick p > 4, and w must have |w| ≥ p." },
            ],
        },
        {
            id: "pow2", sec: "more", lang: "L = { 1<sup>2ⁿ</sup> | n ≥ 0 }", sym: "1",
            w: "1<sup>2ᵖ</sup>", wIn: "Its length 2ᵖ is a power of 2, so w ∈ L, and 2ᵖ ≥ p.",
            y: "Every symbol of w is 1, so y = 1ᵏ for some k with 1 ≤ k ≤ p (since |xy| ≤ p and |y| ≥ 1).",
            yShort: "y = 1ᵏ for some 1 ≤ k ≤ p", yNot: "y contains a 0",
            i: 2, pumped: "1<sup>2ᵖ + k</sup>",
            notIn: "Its length is 2ᵖ + k with 1 ≤ k ≤ p < 2ᵖ, so 2ᵖ < 2ᵖ + k < 2ᵖ⁺¹. No power of 2 lies strictly between 2ᵖ and 2ᵖ⁺¹, so xy²z ∉ L.",
            iOpts: [
                { i: 2, ok: true, why: "The new length lands strictly between 2ᵖ and 2ᵖ⁺¹." },
                { i: 0, ok: false, why: "For small p, 2ᵖ − k can be a power of 2 (p = 2 and k = 2 give length 2), so it doesn’t beat every split." },
                { i: 1, ok: false, why: "xy¹z is just w, which is in L." },
            ],
            badW: [
                { w: "1ᵖ", why: "Not in L unless p happens to be a power of 2 (p = 3 gives 111). w must be in L for every p." },
                { w: "1<sup>2p</sup>", why: "Not in L unless 2p is a power of 2 (p = 3 gives length 6)." },
                { w: "1⁸", why: "Too short: a fixed string fails once the adversary picks p > 8." },
            ],
        },
        {
            id: "10n1n", sec: "choosing-w", lang: "L = { 10ⁿ1ⁿ | n ≥ 0 }",
            w: "10ᵖ1ᵖ", wIn: "It has n = p, so w ∈ L, and |w| = 2p + 1 ≥ p.",
            y: "Since |xy| ≤ p, y lies inside the first p symbols, 10ᵖ⁻¹. So there are two cases: y = 0ᵏ with k ≥ 1, or x = ε and y starts with the leading 1.",
            yShort: "y is all 0s, or y starts with the leading 1", yNot: "y always contains the leading 1",
            i: 0, pumped: "xz, which is w with y removed",
            notIn: "Case 1, y = 0ᵏ: xz = 10ᵖ⁻ᵏ1ᵖ has fewer 0s than 1s, so it’s not in L. Case 2, y contains the leading 1: xz starts with 0, but every string in L starts with 1. Either way, xz ∉ L.",
            iOpts: [
                { i: 0, ok: true, why: "Removing y breaks the string in both cases." },
                { i: 2, ok: true, why: "Also works, with its own two cases: an extra 1 can’t fit the 10ⁿ1ⁿ pattern, and extra 0s unbalance it." },
                { i: 1, ok: false, why: "xy¹z is just w, which is in L." },
            ],
            badW: [
                { w: "0ᵖ1ᵖ", why: "Not in L: every string in L starts with 1." },
                { w: "1ᵖ0ᵖ", why: "Not in L (for p ≥ 1): in L, the 0s sit between the first 1 and the last 1s." },
                { w: "101", why: "Too short: the adversary can pick p > 3, and w must have |w| ≥ p." },
            ],
        },
    ];

    // The proof, step by step, and the lines someone might wrongly add.
    P.forEach(p => {
        const iSup = sup[p.i];
        p.steps = [
            "Assume L is regular, and let p be its pumping length.",
            `Choose w = ${p.w}. ${p.wIn}`,
            "Let w = xyz be any split with |xy| ≤ p and |y| ≥ 1.",
            p.y || Y,
            `Choose i = ${p.i}: xy${iSup}z = ${p.pumped}.`,
            p.notIn,
            "This contradicts the pumping lemma, so L is not regular.",
        ];
        p.distractors = [
            { text: "Choose p = 3.", why: "The adversary picks p. Your proof has to work for every p." },
            { text: `Choose the split x = ε, y = ${p.sym || "0"}, and z = the rest of w.`, why: "The adversary picks the split. You have to handle every split with |xy| ≤ p and |y| ≥ 1." },
            { text: `So xy${iSup}z ∈ L, which shows L is not regular.`, why: "Backwards: you win when the pumped string is NOT in L." },
            { text: `Choose w = ${p.badW[0].w}.`, why: p.badW[0].why },
        ];
        p.model = `<p><b>Claim:</b> ${p.lang} is not regular.</p><ol>${p.steps.map(s => `<li>${s}</li>`).join("")}</ol>`;
        p.checklist = [
            "Assumes L is regular (or starts the game) with pumping length p, without picking a number for p.",
            `Picks a w ∈ L with |w| ≥ p that depends on p (like ${p.w}) and says why it’s in L.`,
            `Covers <b>every</b> split with |xy| ≤ p and |y| ≥ 1, and says what y must be (here ${p.yShort || "y = 0ᵏ with k ≥ 1"}).`,
            `Picks a specific i and writes out xyⁱz (like xy${iSup}z = ${p.pumped}).`,
            "Explains why xyⁱz ∉ L, and concludes that L is not regular.",
        ];
    });

    window.STUDY.pumpProofs = P;

    registerExam("pumping", P.map(p => ({
        id: `proof/${p.id}`, type: "pump", sec: p.sec, lec: [4],
        q: `Use the pumping lemma to prove that <span class="set">${p.lang}</span> is not regular. (Σ = {0, 1})`,
        model: p.model, checklist: p.checklist,
        explain: `The key move is choosing w = ${p.w}: its first p symbols are all 0s, so whatever split the adversary picks, y is made only of 0s. Then i = ${p.i} breaks the pattern L requires.`,
    })));
})();
