(function () {
"use strict";

// ---------- Guided reduction walkthroughs (the shared "stepper" widget, ../course/stepper.js) ----------
// Each one tests the proof on a real example machine M and three real strings w, one per thing M can do.
// You predict each move before it's shown. The picture beside the steps (stepFigures.reduction in widgets.js)
// shows the code with w filled in, the helper machine on a few inputs, and a case check that fills in.
const SUB = s => `<sub>${s}</sub>`;
const ATM = `A${SUB("TM")}`, SATM = `SA${SUB("TM")}`;
const Mw = `M′${SUB("w")}`;
const D = x => `D${SUB(x)}`;
const ETM = `E${SUB("TM")}`, EQ = `EQ${SUB("TM")}`, REG = `REGULAR${SUB("TM")}`;

// Our example machine. It does all three things, depending on w.
const M_HTML = "M(w): if w is empty, <b>loop forever</b>. Otherwise <b>accept</b> if w ends in 1 and <b>reject</b> if w ends in 0.";
const CASES = [
  { w: "01", does: "accepts", cls: "acc" },
  { w: "10", does: "rejects", cls: "rej" },
  { w: "", does: "loops", cls: "loop" },
];
const fig = (decider, helper, decide, extra = {}) => ({ provider: "reduction", machine: M_HTML, cases: CASES, decider, helper, decide, ...extra });
const M01 = `M′${SUB("01")}`, M10 = `M′${SUB("10")}`, Me = `M′${SUB("ε")}`;
const row = (w, inA, says) => ({ w, inA, says });

const WALKS = [
  // ---------------------------------------------------------------- HALT
  {
    id: "halt", name: "HALT",
    intro: `<p><b>Goal:</b> prove HALT = { ⟨M, w⟩ | M halts on w } is undecidable. We’ll check the proof on a real machine M (on the right) and three strings: one it accepts, one it rejects, and one it loops on.</p>`,
    config: {
      award: "walk:halt",
      figure: fig(
        [`${D("A")}(⟨M, w⟩) {`, `  if ${D("H")}(⟨M, w⟩) rejects: reject`, "  else run M(w); output what it outputs", "}"],
        null, `${D("A")} says`),
      steps: [
        { title: "Which way does the reduction go?",
          ask: "To prove HALT is undecidable, what do we build?",
          choices: [
            `A decider for ${ATM}, using a (pretend) decider for HALT`,
            `A decider for HALT, using a (pretend) decider for ${ATM}`,
            "A pumping-lemma proof that HALT isn’t regular",
          ],
          answer: 0,
          whys: [null,
            `That shows HALT is no harder than ${ATM}. ${ATM} is already impossible, so that tells us nothing about HALT.`,
            "Not regular doesn’t mean undecidable: {0ⁿ1ⁿ} isn’t regular, but a TM decides it easily."],
          hint: "The impossible problem has to be the one we’d end up solving.",
          why: `If a HALT decider would let us decide ${ATM}, and ${ATM} can’t be decided, then the HALT decider can’t exist. So we reduce ${ATM} <b>to</b> HALT: build ${D("A")} out of ${D("H")}.` },
        { title: "The decider we build",
          why: `${D("H")} is our pretend decider for HALT: it always halts and says whether M halts on w. ${D("A")} asks it first. Only if M halts does ${D("A")} actually run M(w), and then it copies M’s answer. Now let’s test ${D("A")} on our M, one case at a time.`,
          fig: { hl: { d: [1, 2] } } },
        { title: "Case 1: w = 01",
          ask: `${D("A")} gets ⟨M, 01⟩. What does ${D("H")} answer?`,
          choices: ["Accept: M halts on 01", "Reject: M doesn’t halt on 01", `It runs M on 01 and waits`],
          answer: 0,
          whys: [null, "01 isn’t empty, so M doesn’t loop. Check M’s rule on the right.", `${D("H")} is a decider: it always answers, and we don’t need to know how.`],
          hint: "Use M’s rule: 01 isn’t empty, and it ends in 1.",
          why: `M accepts 01 (it ends in 1), and accepting is halting. So ${D("H")} accepts, and ${D("A")} goes on to line 3.`,
          fig: { w: "01", preview: true, hl: { d: [1] } } },
        { title: "Case 1, continued",
          ask: `Line 3 runs M(01). What does ${D("A")} output, and is that right?`,
          choices: [`Accept. Right, because ⟨M, 01⟩ ∈ ${ATM}`, "Accept. Wrong, because HALT isn’t about accepting", "Reject, because M halted"],
          answer: 0,
          whys: [null, `${D("A")} is supposed to decide ${ATM}, and M does accept 01. Accept is the right answer.`, "Halting isn’t rejecting. Line 3 copies what M outputs, and M accepts."],
          hint: `${D("A")} copies whatever M(01) outputs. What should a decider for ${ATM} say about ⟨M, 01⟩?`,
          why: `M(01) accepts, so ${D("A")} accepts, and that matches: ⟨M, 01⟩ is in ${ATM}.`,
          fig: { hl: { d: [2] }, row: row("01", true, "accept") } },
        { title: "Case 2: w = 10",
          ask: `Now ⟨M, 10⟩. What does ${D("A")} output?`,
          choices: [
            `${D("H")} accepts (M halts by rejecting), then M(10) rejects, so ${D("A")} rejects`,
            `${D("H")} rejects, so ${D("A")} rejects at line 2`,
            `${D("H")} accepts, so ${D("A")} accepts`,
          ],
          answer: 0,
          whys: [null, "Rejecting is halting too. M does halt on 10, so D<sub>H</sub> accepts.", `${D("H")} only says M halts. ${D("A")} still runs M(10) and copies its answer, which is reject.`],
          hint: "Does M halt on 10? (Rejecting counts as halting.) Then what does M(10) output?",
          why: `M rejects 10, which is halting, so ${D("H")} accepts and line 3 runs M(10). It rejects, so ${D("A")} rejects. Right: M doesn’t accept 10.`,
          fig: { w: "10", preview: true, hl: { d: [1, 2] }, row: row("10", false, "reject") } },
        { title: "Case 3: w = ε (the dangerous one)",
          ask: `Now ⟨M, ε⟩. M loops on ε. What happens?`,
          choices: [
            `${D("A")} runs M(ε) on line 3 and gets stuck forever`,
            `${D("H")} rejects, so ${D("A")} rejects at line 2, and that’s right`,
            `${D("H")} loops too, because M loops`,
          ],
          answer: 1,
          whys: [`${D("A")} never reaches line 3: ${D("H")} already said M doesn’t halt, so line 2 rejects first.`, null,
            `${D("H")} is a decider, so it always halts. That’s the one thing we assumed about it.`],
          hint: `What does ${D("H")} say when M doesn’t halt? Which line does ${D("A")} stop on?`,
          why: `${D("H")} rejects (M doesn’t halt on ε), so line 2 rejects right away and M(ε) never runs. Right answer: M doesn’t accept ε. This is why ${D("A")} asks ${D("H")} first. Without it, ${D("A")} would loop here, and it wouldn’t be a decider.`,
          fig: { w: "", preview: true, hl: { d: [1] }, row: row("", false, "reject") } },
        { title: "What did we prove?",
          ask: `${D("A")} halted with the right answer in all three cases. What follows?`,
          choices: [
            `${D("A")} decides ${ATM}. That’s impossible, so ${D("H")} can’t exist: HALT is undecidable`,
            "HALT is decidable after all",
            `Nothing yet: ${D("A")} was only checked on one machine M`,
          ],
          answer: 0,
          whys: [null, `We only <b>pretended</b> ${D("H")} exists, to see what it would let us do. It would let us decide ${ATM}, which can’t happen.`,
            "Nothing we did used anything special about this M. Every M, on every w, accepts, rejects or loops, and those are exactly the three cases we checked."],
          hint: "Every machine on every input does one of three things. We just checked all three.",
          why: `The three cases cover every machine and every string, so ${D("A")} would decide ${ATM}. ${ATM} is undecidable, so the assumption was wrong: no ${D("H")} exists. On the exam, write exactly this: assume ${D("H")}, build ${D("A")}, check that it always halts, check the three cases, contradiction.` },
      ],
      done: "Now close your notes and write this proof on paper: the code for D<sub>A</sub>, why it always halts, and the three cases.",
    },
  },

  // ---------------------------------------------------------------- Accepts ε
  {
    id: "eps", name: "Accepts ε",
    intro: `<p><b>Goal:</b> prove ${ETM} = { ⟨M⟩ | M accepts ε } is undecidable (the lecture’s meaning of ${ETM}). This is the most common reduction trick: build a new machine with w baked in, and never run it.</p>`,
    config: {
      award: "walk:eps",
      figure: fig(
        [`${D("A")}(⟨M, w⟩) {`, "  write the code of {Mw}", `  output ${D("E")}(⟨{Mw}⟩)`, "}"],
        ["{Mw}(x) {   // ignores x", "  run M on {w}; output what it outputs", "}"],
        `${D("A")} says`),
      steps: [
        { title: "What should D_A do with ⟨M, w⟩?".replace("D_A", D("A")),
          ask: `We pretend ${D("E")} decides ${ETM}. ${D("A")} gets ⟨M, w⟩. What should it do?`,
          choices: [
            `Run M on w, then ask ${D("E")}`,
            `Write the code of a new machine ${Mw} that ignores its input and runs M on w, then ask ${D("E")} about it`,
            `Ask ${D("E")} about ⟨M⟩`,
          ],
          answer: 1,
          whys: [`If M loops on w, ${D("A")} gets stuck and is no longer a decider. Never run M on w yourself.`, null,
            `${D("E")}(⟨M⟩) says whether M accepts ε. We need to know whether M accepts <b>w</b>.`],
          hint: `${D("E")} can only answer “does this machine accept ε?”. Build a machine whose answer to that is the answer we want.`,
          why: `${Mw} has w baked into its code, and it ignores its own input. So it accepts ε exactly when M accepts w. ${D("A")} only <b>writes</b> this code (that always finishes) and hands it to ${D("E")}.`,
          fig: { hl: { d: [1, 2], h: [0, 1] } } },
        { title: "Case 1: w = 01",
          ask: `Here’s ${M01} (on the right). What does it do on the input x = 1100?`,
          choices: ["Accepts", "Rejects", "Loops"],
          answer: 0,
          whys: [null, "Look at the code: it ignores x completely. What does M do on 01?", "It runs M on 01, not on 1100, and M halts on 01."],
          hint: `${M01} ignores x and runs M on 01. What does M do on 01?`,
          why: `x doesn’t matter: ${M01} runs M on 01, which accepts. So ${M01} accepts 1100, and every other input too.`,
          fig: { w: "01", preview: true, hl: { h: [1] }, samples: [["", "accepts"], ["0", "accepts"], ["1100", "accepts"]] } },
        { title: "Case 1, continued",
          ask: `${D("E")} is asked “does ${M01} accept ε?”. What does ${D("A")} output, and is it right?`,
          choices: [`Accept. Right: M accepts 01`, `Reject, because ε isn’t 01`, `${D("A")} has to run ${M01} on ε to find out`],
          answer: 0,
          whys: [null, `${M01} doesn’t compare its input with 01; it accepts everything, ε included.`, `${D("A")} never runs anything. ${D("E")} answers, and it always halts.`],
          hint: "Look at the table: what does it do on ε?",
          why: `${M01} accepts ε, so ${D("E")} accepts, so ${D("A")} accepts. Right: ⟨M, 01⟩ ∈ ${ATM}.`,
          fig: { hl: { d: [2] }, row: row("01", true, "accept") } },
        { title: "Case 2: w = 10",
          ask: `What does ${D("A")} output on ⟨M, 10⟩?`,
          choices: [
            `Reject: ${M10} rejects every input, so it doesn’t accept ε`,
            `Accept: ${M10} halts on ε`,
            `It loops`,
          ],
          answer: 0,
          whys: [null, `Halting isn’t accepting. ${D("E")} asks whether it <b>accepts</b> ε.`, `Nothing loops here: ${D("A")} only writes code, and M halts on 10 anyway.`],
          hint: "M rejects 10. What does that make the new machine do on ε?",
          why: `${M10} runs M on 10, which rejects, so ${M10} rejects everything. ${D("E")} rejects, ${D("A")} rejects. Right: M doesn’t accept 10.`,
          fig: { w: "10", preview: true, hl: { h: [1] }, samples: [["", "rejects"], ["0", "rejects"], ["1100", "rejects"]], row: row("10", false, "reject") } },
        { title: "Case 3: w = ε",
          ask: `M loops on ε. What does ${Me} do on the input ε?`,
          choices: ["Loops forever", "Rejects", "Accepts"],
          answer: 0,
          whys: [null, `It never finishes running M on ε, so it never gets to output anything, not even reject.`, "M never accepts ε, so nothing accepts here."],
          hint: `${Me} runs M on ε. Does that ever finish?`,
          why: `${Me} runs M on ε, which never finishes. So ${Me} loops on every input. Looping isn’t accepting, so ${Me} doesn’t accept ε.`,
          fig: { w: "", preview: true, hl: { h: [1] }, samples: [["", "loops"], ["0", "loops"], ["1100", "loops"]] } },
        { title: "Case 3, continued",
          ask: `So what does ${D("A")} do?`,
          choices: [
            `Loops, because ${Me} loops`,
            `Asks ${D("E")}, which halts and rejects. So ${D("A")} rejects, which is right`,
            "Accepts",
          ],
          answer: 1,
          whys: [`${D("A")} never runs ${Me}. It only writes its code. Only ${D("E")} looks at it, and ${D("E")} always halts.`, null, `${Me} doesn’t accept ε, so ${D("E")} rejects.`],
          hint: `Does ${D("A")} ever run the machine it builds?`,
          why: `${D("E")} rejects (${Me} doesn’t accept ε), so ${D("A")} rejects. Right: M doesn’t accept ε. ${D("A")} halted even though M loops. That’s the whole point of building the machine instead of running M.`,
          fig: { hl: { d: [2] }, row: row("", false, "reject") } },
        { title: "The key point",
          why: `In every case: <b>${Mw} accepts ε ⇔ M accepts w</b>. So ${D("A")} decides ${ATM}, which is impossible, and ${D("E")} can’t exist. Write that key point in every proof like this one. It’s the line graders look for.` },
      ],
      done: "On paper: write the code for D<sub>A</sub> and M′<sub>w</sub>, the key point, and the three cases. Then try the “Your turn” boxes in Details.",
    },
  },

  // ---------------------------------------------------------------- EQ_TM
  {
    id: "eq", name: EQ,
    intro: `<p><b>Goal:</b> prove ${EQ} = { ⟨M₁, M₂⟩ | L(M₁) = L(M₂) } is undecidable. Same trick, but now ${D("A")} builds <b>two</b> machines and compares their languages.</p>`,
    config: {
      award: "walk:eq",
      figure: fig(
        [`${D("A")}(⟨M, w⟩) {`, "  write the code of M₁ and M₂", `  output ${D("EQ")}(⟨M₁, M₂⟩)`, "}"],
        ["M₁(x) { accept }", "M₂(x) { run M on {w}; output what it outputs }"],
        `${D("A")} says`),
      steps: [
        { title: "Choose M₁",
          ask: `M₂ ignores its input and runs M on w, so L(M₂) is either Σ* (M accepts w) or ∅ (it doesn’t). What should M₁ be?`,
          choices: ["A machine that accepts everything: L(M₁) = Σ*", "A machine that rejects everything: L(M₁) = ∅", "M itself"],
          answer: 0,
          whys: [null, `Then L(M₁) = L(M₂) would mean M does <b>not</b> accept w: the answer comes out flipped. (You could flip it back, but Σ* is simpler.)`,
            "L(M) has nothing to do with w in particular, so comparing against it doesn’t tell you about w."],
          hint: "We want “the languages are equal” to happen exactly when M accepts w.",
          why: `With L(M₁) = Σ*: the languages are equal ⇔ L(M₂) = Σ* ⇔ M accepts w.`,
          fig: { hl: { h: [0] } } },
        { title: "Case 1: w = 01",
          ask: `What is L(M₂), and what does ${D("A")} output?`,
          choices: [`L(M₂) = Σ* = L(M₁), so ${D("EQ")} accepts and ${D("A")} accepts`, "L(M₂) = {01}, so they differ and D<sub>A</sub> rejects", "L(M₂) = ∅, so D<sub>A</sub> rejects"],
          answer: 0,
          whys: [null, "M₂ doesn’t look at its input, so it can’t single out 01.", "M accepts 01, so M₂ accepts everything."],
          hint: "M accepts 01, and M₂ ignores its input.",
          why: `M₂ accepts every input, so L(M₂) = Σ* = L(M₁). ${D("EQ")} accepts, so ${D("A")} accepts. Right.`,
          fig: { w: "01", preview: true, hl: { h: [1] }, row: row("01", true, "accept") } },
        { title: "Case 2: w = 10",
          ask: `What does ${D("A")} output on ⟨M, 10⟩?`,
          choices: [`Reject: L(M₂) = ∅ ≠ Σ*`, "Accept: both machines halt on everything"],
          answer: 0,
          whys: [null, `${EQ} compares the <b>languages</b> (what gets accepted), not whether they halt.`],
          hint: "M rejects 10. Which strings does M₂ accept?",
          why: `M₂ rejects everything, so L(M₂) = ∅. That isn’t Σ*, so ${D("EQ")} rejects and ${D("A")} rejects. Right.`,
          fig: { w: "10", preview: true, hl: { h: [1] }, row: row("10", false, "reject") } },
        { title: "Case 3: w = ε",
          ask: "M loops on ε. What is L(M₂)?",
          choices: ["∅", "Σ*, since M₂ never rejects anything", "It isn’t defined, since M₂ never halts"],
          answer: 0,
          whys: [null, "Never rejecting isn’t the same as accepting. A string is in L(M₂) only if M₂ accepts it.", "L(M₂) is always defined: it’s the set of strings M₂ accepts. Here that’s none."],
          hint: "A string is in L(M₂) only if M₂ accepts it. Does M₂ ever accept?",
          why: `M₂ loops on every input, so it accepts nothing: L(M₂) = ∅ ≠ Σ*. ${D("EQ")} (a decider, so it halts) rejects, and ${D("A")} rejects. Right.`,
          fig: { w: "", preview: true, hl: { h: [1] }, row: row("", false, "reject") } },
        { title: "The key point",
          why: `<b>L(M₁) = L(M₂) ⇔ M accepts w.</b> So ${D("A")} decides ${ATM}, which is impossible: ${EQ} is undecidable. Notice that M₂ is the same ${Mw} as before, just compared against a machine with a known language.` },
      ],
      done: "Try it with a twist: the “Your turn” box under “Do two TMs recognize the same language?” in Details uses L(M₁) ⊆ L(M₂).",
    },
  },

  // ---------------------------------------------------------------- REGULAR_TM
  {
    id: "reg", name: REG,
    intro: `<p><b>Goal:</b> prove ${REG} = { ⟨M⟩ | L(M) is regular } is undecidable. The new idea: make the helper’s language <b>jump</b> between a regular one and a non-regular one.</p>`,
    config: {
      award: "walk:reg",
      figure: fig(
        [`${D("A")}(⟨M, w⟩) {`, "  write the code of {Mw}", `  output ${D("R")}(⟨{Mw}⟩)`, "}"],
        ["{Mw}(x) {", "  if x has the form 0ⁿ1ⁿ: accept", "  else run M on {w}; output what it outputs", "}"],
        `${D("A")} says`),
      steps: [
        { title: "Why not the usual helper?",
          ask: `The plain helper (ignore x, run M on w) has language Σ* or ∅. Why doesn’t it work for ${REG}?`,
          choices: ["Σ* and ∅ are both regular, so D<sub>R</sub> says “regular” either way", "∅ isn’t a language", "Σ* isn’t regular"],
          answer: 0,
          whys: [null, "∅ is a language (the one with no strings), and it’s regular.", "Σ* is regular: a one-state DFA accepts it."],
          hint: "Is Σ* regular? Is ∅ regular?",
          why: `Both are regular, so ${D("R")} would accept no matter what M does on w. We need a helper whose language is regular in one case and <b>not</b> regular in the other. Hence the 0ⁿ1ⁿ line.`,
          fig: { hl: { h: [1, 2] } } },
        { title: "Case 1: w = 01",
          ask: `What is L(${M01})?`,
          choices: ["Σ*", "{0ⁿ1ⁿ}", "{01}", "∅"],
          answer: 0,
          whys: [null, "The 0ⁿ1ⁿ strings are accepted on line 2, but every other string reaches line 3, and M accepts 01.", "The helper doesn’t compare x with 01.", "Line 2 always accepts 0ⁿ1ⁿ strings, so it’s never empty."],
          hint: "0ⁿ1ⁿ strings are accepted on line 2. What happens to every other string on line 3?",
          why: `0ⁿ1ⁿ strings are accepted on line 2. Everything else reaches line 3, which runs M on 01 and accepts. So ${M01} accepts everything: L = Σ*.`,
          fig: { w: "01", preview: true, hl: { h: [1, 2] }, samples: [["0011", "accepts (line 2)"], ["10", "accepts (line 3)"], ["0", "accepts (line 3)"]] } },
        { title: "Case 1, continued",
          ask: `What does ${D("A")} output on ⟨M, 01⟩?`,
          choices: ["Accept: Σ* is regular, so D<sub>R</sub> accepts", "Reject: the helper has a 0ⁿ1ⁿ test in it"],
          answer: 0,
          whys: [null, `${D("R")} asks about the <b>language</b>, not the code. The code tests 0ⁿ1ⁿ, but the language ends up being Σ*.`],
          hint: "D<sub>R</sub> only cares about the language.",
          why: `L(${M01}) = Σ*, which is regular, so ${D("R")} accepts and ${D("A")} accepts. Right: M accepts 01.`,
          fig: { hl: { d: [2] }, row: row("01", true, "accept") } },
        { title: "Case 2: w = 10",
          ask: `What is L(${M10})?`,
          choices: ["{0ⁿ1ⁿ | n ≥ 0}", "∅", "Σ*"],
          answer: 0,
          whys: [null, "Line 2 still accepts every 0ⁿ1ⁿ string, before M is ever run.", "Strings like 10 reach line 3, where M rejects."],
          hint: "Line 2 accepts some strings no matter what. What about the rest?",
          why: `Only line 2 ever accepts; line 3 rejects everything else (M rejects 10). So L = {0ⁿ1ⁿ}, which isn’t regular. ${D("R")} rejects, ${D("A")} rejects. Right.`,
          fig: { w: "10", preview: true, hl: { h: [1, 2] }, samples: [["0011", "accepts (line 2)"], ["10", "rejects (line 3)"], ["0", "rejects (line 3)"]], row: row("10", false, "reject") } },
        { title: "Case 3: w = ε",
          ask: `M loops on ε. What is L(${Me})?`,
          choices: ["{0ⁿ1ⁿ | n ≥ 0}", "∅, because it loops", "Σ*"],
          answer: 0,
          whys: [null, "Only the strings that reach line 3 loop. The 0ⁿ1ⁿ strings are accepted on line 2 first.", "Strings that reach line 3 loop, and looping isn’t accepting."],
          hint: "Which strings never reach line 3?",
          why: `0ⁿ1ⁿ strings are still accepted on line 2. Every other string loops on line 3, so it isn’t accepted. L = {0ⁿ1ⁿ}, not regular, so ${D("R")} rejects and ${D("A")} rejects. Right. (If you wrote ∅ here, the proof would break: ∅ is regular, and ${D("A")} would wrongly accept.)`,
          fig: { w: "", preview: true, hl: { h: [1, 2] }, samples: [["0011", "accepts (line 2)"], ["10", "loops (line 3)"], ["0", "loops (line 3)"]], row: row("", false, "reject") } },
        { title: "The key point",
          why: `<b>L(${Mw}) is regular ⇔ M accepts w</b> (it’s Σ* if M accepts w, and {0ⁿ1ⁿ} otherwise). So ${D("A")} decides ${ATM}, which is impossible: ${REG} is undecidable.` },
      ],
      done: "The pattern to remember: when the property is true of both Σ* and ∅, mix in a language that doesn’t have it.",
    },
  },

  // ---------------------------------------------------------------- A_TM from SA_TM
  {
    id: "atm", name: `${ATM} from ${SATM}`,
    intro: `<p><b>Goal:</b> prove ${ATM} is undecidable, using ${SATM} = { ⟨M⟩ | M accepts ⟨M⟩ }, which diagonalization showed is undecidable. This one is short but abstract: there’s no example M, because the input is a machine’s own code.</p>`,
    config: {
      award: "walk:atm",
      figure: { provider: "reduction", decider: [`${D("S")}(⟨M⟩) {`, `  output ${D("A")}(⟨M, ⟨M⟩⟩)`, "}"], decide: `${D("S")} says` },
      steps: [
        { title: "Which question to ask",
          ask: `We pretend ${D("A")} decides ${ATM}. Which question to ${D("A")} answers “is ⟨M⟩ in ${SATM}?”`,
          choices: ["Does M accept ⟨M⟩? That is, ask about ⟨M, ⟨M⟩⟩", "Does M accept ε? That is, ask about ⟨M, ε⟩", "Ask about ⟨M, w⟩ for every string w"],
          answer: 0,
          whys: [null, `${SATM} is about M on its <b>own code</b>, not on ε.`, "There are infinitely many strings, so that never finishes."],
          hint: `${SATM} asks whether M accepts its own description.`,
          why: `⟨M⟩ ∈ ${SATM} ⇔ M accepts ⟨M⟩ ⇔ ⟨M, ⟨M⟩⟩ ∈ ${ATM}. So ${D("S")} just asks ${D("A")} about the pair ⟨M, ⟨M⟩⟩.`,
          fig: { hl: { d: [1] } } },
        { title: "The loop case",
          ask: `Suppose M loops on ⟨M⟩. What does ${D("S")} do?`,
          choices: [`${D("A")} rejects, so ${D("S")} rejects. Right, because ⟨M⟩ ∉ ${SATM}`, `${D("S")} loops, because M loops`, `${D("S")} accepts`],
          answer: 0,
          whys: [null, `${D("S")} never runs M. ${D("A")} answers, and it’s a decider.`, "M doesn’t accept ⟨M⟩, so the answer must be reject."],
          hint: `Who actually answers inside ${D("S")}?`,
          why: `M doesn’t accept ⟨M⟩, so ${D("A")} (which always halts) rejects, and ${D("S")} rejects. If M accepts ⟨M⟩, ${D("A")} accepts and so does ${D("S")}. Either way ${D("S")} is right.`,
          fig: { hl: { d: [1] } } },
        { title: "Conclusion",
          why: `${D("S")} would decide ${SATM}, which is impossible, so ${D("A")} can’t exist: ${ATM} is undecidable. The idea in one line: ${SATM} is just the special case of ${ATM} where w = ⟨M⟩. If you can’t solve the special case, you can’t solve the general one.` },
      ],
      done: "Every other reduction in this course starts from A<sub>TM</sub>, so this is the one link that connects them all back to diagonalization.",
    },
  },
];

// ---------- "Your turn" boxes at the end of Details sections (course/app.js renders section.yourTurn) ----------
// New languages only (none from the problem sets). Each is a short stepper: predict, then read why.
const REJ = `REJECT${SUB("TM")}`, ALL = `ALL${SUB("TM")}`, FIN = `FINITE${SUB("TM")}`, SUBSET = `SUBSET${SUB("TM")}`;
const TURNS = {
  reduction: {
    title: "Which way does it go?",
    config: {
      award: "turn:direction",
      steps: [
        { title: "Pick the reduction",
          ask: `You want to prove ${ALL} = { ⟨M⟩ | L(M) = Σ* } is undecidable. What do you show?`,
          choices: [`A decider for ${ALL} would give a decider for ${ATM}`, `A decider for ${ATM} would give a decider for ${ALL}`, `${ALL} is not regular`],
          answer: 0,
          whys: [null, `That reduces ${ALL} to ${ATM}. ${ATM} has no decider, so this says nothing about ${ALL}.`, "Non-regular languages can still be decidable."],
          hint: "The new language’s decider is the pretend tool. What impossible thing would it build?",
          why: `Reduce ${ATM} <b>to</b> ${ALL}: pretend ${D("ALL")} exists and use it to build ${D("A")}. Since ${D("A")} can’t exist, neither can ${D("ALL")}.` },
        { title: "Read a friend’s proof",
          ask: `A friend writes: “Given a decider for ${ATM}, I can decide HALT. So HALT is undecidable.” Is that a proof?`,
          choices: ["No: it goes the wrong way and proves nothing about HALT", "Yes: it connects HALT to an undecidable language", "Yes, as long as the construction is correct"],
          answer: 0,
          whys: [null, "Connecting isn’t enough; the direction matters.", `Even a correct construction only shows “if ${ATM} were decidable, HALT would be.” ${ATM} isn’t, so nothing follows.`],
          hint: "What does a decider for A<sub>TM</sub> let you conclude, given that none exists?",
          why: `“HALT reduces to ${ATM}” means HALT is no harder than ${ATM}. Both being undecidable is consistent with that, but so is HALT being easy. To prove HALT undecidable, reduce ${ATM} to HALT.` },
        { title: "The other use of reductions",
          ask: "A reduces to B, and B is decidable. What do you know about A?",
          choices: ["A is decidable", "A is undecidable", "Nothing"],
          answer: 0,
          whys: [null, "Reductions carry decidability from B down to A, not undecidability.", "Plug the decider for B into the reduction: you get a decider for A."],
          hint: "A reduction is a recipe for solving A using a solver for B.",
          why: "If you can solve B and you know how to solve A using B, you can solve A. This is how an algorithms class uses reductions; this class uses the other direction to prove things impossible." },
      ],
    },
  },
  halting: {
    title: `Is ${REJ} undecidable?`,
    intro: `<p>${REJ} = { ⟨M, w⟩ | M <b>rejects</b> w }. Pretend ${D("R")} decides it, and build a decider for ${ATM}. Watch the loop case.</p>`,
    config: {
      award: "turn:reject",
      steps: [
        { title: "A tempting shortcut",
          ask: `Why not let ${D("A")}(⟨M, w⟩) = the opposite of ${D("R")}(⟨M, w⟩)?`,
          choices: [
            `Because when M loops on w, M doesn’t reject, so ${D("R")} rejects, and flipping says “accept”, but M didn’t accept w`,
            `Because ${D("R")} might loop`,
            "It works fine",
          ],
          answer: 0,
          whys: [null, `${D("R")} is a decider, so it never loops.`, "Check the case where M loops on w."],
          hint: "“Doesn’t reject” isn’t the same as “accepts”. Which case is both?",
          why: "Not rejecting = accepting or looping. Flipping the answer lumps looping in with accepting, so the shortcut is wrong exactly in the loop case. This is the most common mistake on reduction proofs." },
        { title: "Build a better machine",
          ask: `Which machine should ${D("A")} write down and ask ${D("R")} about (on the same w)?`,
          choices: [
            "M̄: a copy of M with its accept and reject states swapped",
            `${Mw}: ignore the input, run M on w`,
            "M itself",
          ],
          answer: 0,
          whys: [null, `${D("R")} needs a machine and a string. ${Mw} rejects (any input) exactly when M rejects w, which is the wrong question again.`, "That’s the shortcut from the last step."],
          hint: "You want a machine that rejects w exactly when M accepts w.",
          why: "M̄ does exactly what M does, but says reject where M says accept and vice versa. So M̄ rejects w ⇔ M accepts w. And if M loops, M̄ loops too. Writing M̄ is just editing M’s code, so it always finishes." },
        { title: "Check the loop case",
          ask: `M loops on w. What does ${D("A")}(⟨M, w⟩) = ${D("R")}(⟨M̄, w⟩) answer?`,
          choices: ["Reject, which is right", "Accept, which is wrong", `${D("A")} loops`],
          answer: 0,
          whys: [null, "Does M̄ reject w when it loops?", `${D("A")} only edits code and asks ${D("R")}, which always halts.`],
          hint: "M̄ loops on w too. Does a looping machine reject?",
          why: `M̄ loops on w, so it doesn’t reject w, so ${D("R")} rejects, and ${D("A")} rejects. Right: M doesn’t accept w. Accept case: M̄ rejects w, ${D("R")} accepts. Reject case: M̄ accepts w, ${D("R")} rejects. All three are right, so ${D("A")} decides ${ATM}: contradiction, and ${REJ} is undecidable.` },
      ],
      done: "On paper, write the full proof: assume D<sub>R</sub>, build D<sub>A</sub> with M̄, explain why it halts, the key point (M̄ rejects w ⇔ M accepts w), and the three cases.",
    },
  },
  "empty-string": {
    title: `${ALL}: does M accept everything?`,
    intro: `<p>${ALL} = { ⟨M⟩ | L(M) = Σ* }. Prove it’s undecidable by reducing ${ATM} to it.</p>`,
    config: {
      award: "turn:all",
      steps: [
        { title: "Choose the helper",
          ask: `Which ${Mw} makes “L(${Mw}) = Σ*” mean “M accepts w”?`,
          choices: [`${Mw}(x): ignore x, run M on w, output what it outputs`, `${Mw}(x): run M on x`, `${Mw}(x): accept if x = w, else reject`],
          answer: 0,
          whys: [null, `That doesn’t involve w at all: L(${Mw}) = L(M).`, `Then L(${Mw}) = {w} no matter what M does. It’s never Σ*.`],
          hint: "The usual trick: bake w into the code and ignore the input.",
          why: `The same helper as in the ε proof. It accepts everything if M accepts w, and nothing otherwise.` },
        { title: "The reject case",
          ask: `M rejects w. What is L(${Mw}), and what does ${D("ALL")} say?`,
          choices: [`∅, so ${D("ALL")} rejects`, `Σ*, so ${D("ALL")} accepts`, `{w}, so ${D("ALL")} rejects`],
          answer: 0,
          whys: [null, "M rejects w, so the helper rejects every input.", "The helper ignores its input, so it treats every string the same way."],
          hint: "The helper does the same thing on every input.",
          why: `${Mw} rejects every input, so L = ∅ ≠ Σ*, and ${D("ALL")} rejects, which is right. (Loop case: L = ∅ again, still right. Accept case: L = Σ*, ${D("ALL")} accepts.)` },
        { title: "The key point",
          ask: "Which sentence is the key point of the proof?",
          choices: [`L(${Mw}) = Σ* ⇔ M accepts w`, `${Mw} halts ⇔ M halts on w`, `L(${Mw}) = Σ* ⇔ M halts on w`],
          answer: 0,
          whys: [null, `True, but ${ALL} is about what’s accepted, not halting.`, `If M <b>rejects</b> w, ${Mw} halts on everything but accepts nothing.`],
          hint: `The key point always connects “${Mw} is in the new language” to “M accepts w”.`,
          why: `With it, ${D("A")}(⟨M, w⟩) = ${D("ALL")}(⟨${Mw}⟩) decides ${ATM}, which is impossible.` },
      ],
      done: "Write it on paper from memory. Then compare with the ε proof: it’s almost word for word the same.",
    },
  },
  regular: {
    title: `${FIN}: is L(M) finite?`,
    intro: `<p>${FIN} = { ⟨M⟩ | L(M) is finite }. This one has a twist: the answer comes out <b>flipped</b>.</p>`,
    config: {
      award: "turn:finite",
      steps: [
        { title: "Use the usual helper",
          ask: `With ${Mw}(x) = “ignore x, run M on w”, L(${Mw}) is Σ* or ∅. Which one is finite?`,
          choices: ["∅", "Σ*", "Both", "Neither"],
          answer: 0,
          whys: [null, "Σ* has infinitely many strings.", "Σ* is infinite.", "∅ has zero strings, which is a finite number."],
          hint: "Count the strings in each.",
          why: "∅ has 0 strings (finite). Σ* has infinitely many." },
        { title: "Read D_FIN’s answer".replace("D_FIN", D("FIN")),
          ask: `So ${D("FIN")}(⟨${Mw}⟩) accepts exactly when…`,
          choices: ["M does <b>not</b> accept w", "M accepts w", "M halts on w"],
          answer: 0,
          whys: [null, `If M accepts w, L(${Mw}) = Σ*, which is infinite, so ${D("FIN")} rejects.`, `If M rejects w, the language is ∅ (finite), the same as when it loops. Halting doesn’t decide it.`],
          hint: "Finite happens when the language is ∅. When is it ∅?",
          why: `L(${Mw}) is finite ⇔ L(${Mw}) = ∅ ⇔ M doesn’t accept w.` },
        { title: "Fix it",
          ask: `How should ${D("A")} answer?`,
          choices: [`The opposite of ${D("FIN")}(⟨${Mw}⟩)`, `The same as ${D("FIN")}(⟨${Mw}⟩)`, "Run M on w to double-check"],
          answer: 0,
          whys: [null, "That gives the wrong answer in every case.", "Running M on w can loop forever."],
          hint: "The answer we get is always backwards.",
          why: `Flip it. ${D("FIN")} always halts, so the flipped answer always comes back too, and ${D("A")} is still a decider. That’s allowed: a reduction can use the B-decider’s answer however it likes. (It isn’t a <b>mapping</b> reduction from ${ATM} to ${FIN}, though. It maps ${ATM} to the complement of ${FIN}. More on that in Mapping reductions.)` },
      ],
    },
  },
  equivalence: {
    title: `${SUBSET}: is L(M₁) ⊆ L(M₂)?`,
    intro: `<p>${SUBSET} = { ⟨M₁, M₂⟩ | L(M₁) ⊆ L(M₂) }. Choose the two machines so that the answer means “M accepts w”.</p>`,
    config: {
      award: "turn:subset",
      steps: [
        { title: "Choose the machines",
          ask: "Which pair works?",
          choices: [
            `M₁ accepts everything; M₂ = ${Mw}`,
            `M₁ = ${Mw}; M₂ accepts everything`,
            `M₁ rejects everything; M₂ = ${Mw}`,
          ],
          answer: 0,
          whys: [null, "Every language is a subset of Σ*, so the answer is always yes, whatever M does.", "∅ is a subset of everything, so the answer is always yes."],
          hint: "If one side is the same in every case, it can’t tell you anything. Check each pair for that.",
          why: `Σ* ⊆ L(${Mw}) ⇔ L(${Mw}) = Σ* ⇔ M accepts w.` },
        { title: "The loop case",
          ask: `M loops on w. What does ${D("SUB")} answer?`,
          choices: ["Reject: Σ* ⊄ ∅", "Accept: the helper never rejects anything"],
          answer: 0,
          whys: [null, `Never rejecting isn’t accepting. L(${Mw}) = ∅.`],
          hint: "What does the helper accept when M loops?",
          why: `L(${Mw}) = ∅, and Σ* isn’t a subset of ∅, so ${D("SUB")} rejects, and ${D("A")} rejects. Right.` },
      ],
    },
  },
  mapping: {
    title: "Is this a mapping reduction?",
    intro: `<p>A mapping reduction needs <b>both</b> directions: w ∈ A ⇒ f(w) ∈ B, and w ∉ A ⇒ f(w) ∉ B. To break one, find a single input that goes the wrong way. Use our example M from the walkthroughs: it loops on ε, accepts strings ending in 1, and rejects strings ending in 0.</p>`,
    config: {
      award: "turn:mapping",
      steps: [
        { title: "Candidate 1",
          ask: `f(⟨M, w⟩) = ⟨M⟩. Is this a mapping reduction from ${ATM} to ${ETM} (M accepts ε)?`,
          choices: ["No: ⟨M, 01⟩ is in A<sub>TM</sub>, but our M doesn’t accept ε", "Yes", "No, because f isn’t computable"],
          answer: 0,
          whys: [null, "Try our example M with w = 01.", "Deleting w from the input is easy to compute. The problem is elsewhere."],
          hint: "Find an M and w where M accepts w but not ε.",
          why: `Our M accepts 01, so ⟨M, 01⟩ ∈ ${ATM}. But M loops on ε, so ⟨M⟩ ∉ ${ETM}. One input in A that lands outside B is enough to break it.` },
        { title: "Candidate 2",
          ask: `f(⟨M, w⟩) = ⟨${Mw}⟩ (ignore the input, run M on w). Is this a mapping reduction from ${ATM} to ${ETM}?`,
          choices: ["Yes", "No: it fails when M loops on w"],
          answer: 0,
          whys: [null, `If M loops on w, ⟨M, w⟩ ∉ ${ATM}, and ${Mw} doesn’t accept ε, so f(⟨M, w⟩) ∉ ${ETM}. That direction holds.`],
          hint: "Check both directions, including the loop case.",
          why: `M accepts w ⇒ ${Mw} accepts ε. M doesn’t accept w (rejects or loops) ⇒ ${Mw} doesn’t accept ε. And writing ${Mw} is computable. This is the lecture’s reduction, written as a function.` },
        { title: "Candidate 3",
          ask: `The same f(⟨M, w⟩) = ⟨${Mw}⟩. Is it a mapping reduction from ${ATM} to ${FIN} (L(M) is finite)?`,
          choices: ["No: when M accepts w, L(M′<sub>w</sub>) = Σ*, which isn’t finite", "Yes"],
          answer: 0,
          whys: [null, "Check the case where M accepts w."],
          hint: "When M accepts w, which language does the helper have?",
          why: `It sends ${ATM} to the <b>complement</b> of ${FIN}: w ∈ ${ATM} ⇔ f(w) ∉ ${FIN}. So it’s a mapping reduction from ${ATM} to the complement of ${FIN}, not to ${FIN}. (The “Your turn” in “Is L(M) regular?” fixes this by flipping the answer, which an ordinary reduction is allowed to do.)` },
        { title: "Complements",
          ask: "If f is a mapping reduction from A to B, which of these is also true?",
          choices: ["The same f is a mapping reduction from Ā to B̄", "f is a mapping reduction from B to A", "f is a mapping reduction from Ā to B"],
          answer: 0,
          whys: [null, "f goes from A’s inputs to B’s inputs; it can’t just be reversed.", "w ∈ Ā means w ∉ A, so f(w) ∉ B. It lands in B̄, not B."],
          hint: "Negate both sides of w ∈ A ⇔ f(w) ∈ B.",
          why: "w ∈ A ⇔ f(w) ∈ B is the same as w ∉ A ⇔ f(w) ∉ B, which says w ∈ Ā ⇔ f(w) ∈ B̄. This is the tool for proving languages are <b>unrecognizable</b>, which is coming up next." },
      ],
    },
  },
};

registerConcept({
  id: "reductions",
  oneLiner:
    "To show B is undecidable, show that a decider for B would let you decide something already known to be undecidable, like A<sub>TM</sub>. The trick is usually to <b>build a new machine’s code</b> and ask about it, never to run M yourself.",

  related: ["countability", "church-turing", "turing-machines"],

  summary: {
    keyPoints: [
      { lec: [8], html: "<b>A<sub>TM</sub> = { ⟨M, w⟩ | M accepts w }</b> is undecidable: a decider D<sub>A</sub> would decide SA<sub>TM</sub> via D<sub>S</sub>(⟨M⟩) = D<sub>A</sub>(⟨M, ⟨M⟩⟩)." },
      { lec: [8], html: "<b>Reducing A to B</b> means solving A using a (hypothetical) decider for B as a subroutine. It shows: if B is decidable, so is A. Equivalently, <b>if A is undecidable, so is B</b>." },
      { lec: [8], kind: "key", html: "To prove a new language B is undecidable, reduce a <b>known undecidable</b> language (usually A<sub>TM</sub>) <b>to B</b>. The known one goes on the left." },
      { lec: [8], html: "The decider you build must <b>always halt</b>. Don’t run M on w directly (it might loop). Instead, write down a new machine that runs M on w, and ask the B-decider about it." },
      { lec: [8], html: "Undecidable by reduction from A<sub>TM</sub>: the <b>halting problem</b>, “does M accept ε?”, “is L(M) regular?”, and “do M₁ and M₂ recognize the same language?”" },
      { lec: [8], html: "A <b>mapping reduction</b> A ≤<sub>m</sub> B is a computable f with w ∈ A ⇔ f(w) ∈ B. Then D<sub>A</sub>(w) = D<sub>B</sub>(f(w))." },
      { lec: [8], kind: "warn", html: "A<sub>TM</sub> is <b>recognizable</b> (the universal TM runs M on w) but not decidable: the universal TM loops whenever M does." },
    ],
    compare: {
      head: ["Language B", "Reduce from", "What D<sub>A</sub> builds", "Key fact"],
      rows: [
        ["A<sub>TM</sub>", "SA<sub>TM</sub>", "the pair ⟨M, ⟨M⟩⟩", "M accepts ⟨M⟩ ⇔ ⟨M, ⟨M⟩⟩ ∈ A<sub>TM</sub>"],
        ["HALT", "A<sub>TM</sub>", "asks D<sub>H</sub> first, then runs M(w) only if it halts", "M(w) is run only when it’s safe"],
        ["E<sub>TM</sub> (accepts ε)", "A<sub>TM</sub>", "M′<sub>w</sub>(x): run M(w)", "M′<sub>w</sub> accepts ε ⇔ M accepts w"],
        ["REGULAR<sub>TM</sub>", "A<sub>TM</sub>", "M′<sub>w</sub>(x): accept 0ⁿ1ⁿ, else run M(w)", "L(M′<sub>w</sub>) is Σ* or {0ⁿ1ⁿ}"],
        ["EQ<sub>TM</sub>", "A<sub>TM</sub>", "M₁ accepts all; M₂(x): run M(w)", "L(M₁) = L(M₂) ⇔ M accepts w"],
      ],
    },
  },

  details: [
    {
      id: "atm",
      title: "A_TM is undecidable",
      lec: [8],
      html: `
        <p>The <b>acceptance problem</b>: A<sub>TM</sub> = { ⟨M, w⟩ | M is a TM and M accepts w }.</p>
        <p>It is <b>recognizable</b>: the universal TM runs M on w and accepts if M does. But that recognizer loops whenever M loops, so it isn’t a decider. In fact, no decider exists.</p>
        <p><b>Theorem.</b> A<sub>TM</sub> is undecidable.</p>
        <p><b>Proof.</b> Suppose D<sub>A</sub> decides A<sub>TM</sub>. Then this TM would decide SA<sub>TM</sub> = { ⟨M⟩ | M accepts ⟨M⟩ }:</p>
        <pre class="pseudo">D<sub>S</sub>(⟨M⟩) {
  output D<sub>A</sub>(⟨M, ⟨M⟩⟩)
}</pre>
        <p>D<sub>S</sub> always halts (D<sub>A</sub> does), and it accepts ⟨M⟩ ⇔ M accepts ⟨M⟩. But SA<sub>TM</sub> is undecidable (see Countability). Contradiction. ∎</p>
        <p class="callout key">SA<sub>TM</sub> is just the special case of A<sub>TM</sub> where w = ⟨M⟩. If you can’t solve the special case, you can’t solve the general one.</p>`,
    },
    {
      id: "reduction",
      yourTurn: TURNS.reduction,
      title: "What a reduction is (and which way it goes)",
      lec: [8],
      html: `
        <p><b>Reducing A to B</b> means: show how to solve A, given a way to solve B. For languages, build a decider D<sub>A</sub> for A that calls a hypothetical decider D<sub>B</sub> as a subroutine.</p>
        <p>A reduction from A to B shows that <b>A is no harder than B</b>. So:</p>
        <ul>
          <li>If B is decidable, then A is decidable. (This is how an algorithms class uses reductions.)</li>
          <li>If A is undecidable, then B is undecidable. (This is how <b>this</b> class uses them.)</li>
        </ul>
        <p class="callout warn"><b>Direction matters.</b> To prove B undecidable, the <b>known</b> undecidable problem A goes first: reduce A <b>to</b> B, i.e., build a decider for A out of a decider for B. Reducing B to A proves nothing about B.</p>
        <p class="callout tip">Memory hook: “If I could solve <b>B</b> (the new one), I could solve <b>A<sub>TM</sub></b> (the impossible one). So I can’t solve B.”</p>`,
    },
    {
      id: "template",
      title: "The template for an undecidability proof",
      lec: [8],
      html: `
        <ol>
          <li><b>Pick a known undecidable A.</b> Usually A<sub>TM</sub>.</li>
          <li><b>Assume a decider D<sub>B</sub></b> for the language B you’re studying.</li>
          <li><b>Build D<sub>A</sub>.</b> On input ⟨M, w⟩, it usually writes down the code of a new machine (M′<sub>w</sub>) whose behavior depends on whether M accepts w, then asks D<sub>B</sub> about it.</li>
          <li><b>Check that D<sub>A</sub> always halts.</b> Writing code always finishes; D<sub>B</sub> always halts. Running M on w does <b>not</b> always finish.</li>
          <li><b>Check that D<sub>A</sub> is right</b>, in both directions: M accepts w ⇒ D<sub>A</sub> accepts, and M doesn’t accept w (rejects <b>or loops</b>) ⇒ D<sub>A</sub> rejects. Usually this is one “key point”: M′<sub>w</sub> ∈ B ⇔ M accepts w.</li>
          <li><b>Conclude.</b> D<sub>A</sub> decides A, which is impossible, so D<sub>B</sub> doesn’t exist and B is undecidable.</li>
        </ol>
        <p class="callout key">The helper machine M′<sub>w</sub> is <b>built, not run</b>. D<sub>A</sub> treats it as text and hands it to D<sub>B</sub>. Only D<sub>B</sub>’s guarantee that it always halts is used.</p>`,
    },
    {
      id: "halting",
      yourTurn: TURNS.halting,
      title: "The halting problem",
      lec: [8],
      html: `
        <p>HALT = { ⟨M, w⟩ | M is a TM and M halts on w }.</p>
        <p><b>Theorem.</b> HALT is undecidable.</p>
        <p><b>Proof.</b> Reduce A<sub>TM</sub> to HALT. Suppose D<sub>H</sub> decides HALT, and build:</p>
        <pre class="pseudo">D<sub>A</sub>(⟨M, w⟩) {
  run D<sub>H</sub>(⟨M, w⟩); if it rejects, reject
  else run M(w) and output what it outputs
}</pre>
        <ul>
          <li><b>Halts:</b> D<sub>H</sub> always halts, and M(w) only runs after D<sub>H</sub> says it halts.</li>
          <li><b>Right:</b> if M accepts w, D<sub>H</sub> accepts and M(w) accepts. If M rejects w, M(w) rejects. If M loops on w, D<sub>H</sub> rejects.</li>
        </ul>
        <p>So D<sub>A</sub> decides A<sub>TM</sub>, a contradiction. ∎</p>
        <p class="callout tip">This is the one lecture reduction where D<sub>A</sub> does run M(w), and it’s safe only because D<sub>H</sub> checked first.</p>`,
    },
    {
      id: "empty-string",
      yourTurn: TURNS["empty-string"],
      title: "Does M accept ε?",
      lec: [8],
      html: `
        <p>E<sub>TM</sub> = { ⟨M⟩ | M is a TM and M accepts ε }.</p>
        <p class="callout warn">Names vary. In lecture, E<sub>TM</sub> means “accepts the empty string.” In Sipser, E<sub>TM</sub> means “L(M) = ∅” (accepts nothing). Read the definition on the exam. The proof idea is the same either way.</p>
        <p><b>Theorem.</b> E<sub>TM</sub> is undecidable.</p>
        <p><b>Proof.</b> Suppose D<sub>E</sub> decides E<sub>TM</sub>. Build:</p>
        <pre class="pseudo">D<sub>A</sub>(⟨M, w⟩) {
  build ⟨M′<sub>w</sub>⟩
  output D<sub>E</sub>(⟨M′<sub>w</sub>⟩)
}

M′<sub>w</sub>(x) {   // ignores x
  run M(w); output what it outputs
}</pre>
        <p><b>Key point:</b> M′<sub>w</sub> accepts ε ⇔ M accepts w. (If M loops on w, M′<sub>w</sub> loops on ε, so it doesn’t accept it.) D<sub>A</sub> halts because it only <b>writes</b> M′<sub>w</sub>, and D<sub>E</sub> always halts. So D<sub>A</sub> decides A<sub>TM</sub>, a contradiction. ∎</p>
        <p>The same M′<sub>w</sub> works for many questions, since it accepts <b>everything</b> if M accepts w and <b>nothing</b> otherwise.</p>`,
    },
    {
      id: "regular",
      yourTurn: TURNS.regular,
      title: "Is L(M) regular?",
      lec: [8],
      html: `
        <p>REGULAR<sub>TM</sub> = { ⟨M⟩ | M is a TM and L(M) is regular }.</p>
        <p><b>Proof idea.</b> Make M′<sub>w</sub>’s language jump between a regular and a non-regular language depending on whether M accepts w:</p>
        <pre class="pseudo">M′<sub>w</sub>(x) {
  if x has the form 0ⁿ1ⁿ: accept
  else run M(w); output what it outputs
}</pre>
        <ul>
          <li>M accepts w ⇒ every string is accepted ⇒ L(M′<sub>w</sub>) = Σ*, which is regular.</li>
          <li>M doesn’t accept w ⇒ only the 0ⁿ1ⁿ strings are accepted ⇒ L(M′<sub>w</sub>) = {0ⁿ1ⁿ}, which isn’t regular.</li>
        </ul>
        <p>D<sub>A</sub>(⟨M, w⟩) builds ⟨M′<sub>w</sub>⟩ and outputs D<sub>R</sub>(⟨M′<sub>w</sub>⟩). <b>Key point:</b> L(M′<sub>w</sub>) is regular ⇔ M accepts w. ∎</p>`,
    },
    {
      id: "equivalence",
      yourTurn: TURNS.equivalence,
      title: "Do two TMs recognize the same language?",
      lec: [8],
      html: `
        <p>EQ<sub>TM</sub> = { ⟨M₁, M₂⟩ | M₁, M₂ are TMs and L(M₁) = L(M₂) }.</p>
        <pre class="pseudo">D<sub>A</sub>(⟨M, w⟩) {
  build ⟨M₁⟩, ⟨M₂⟩
  output D<sub>EQ</sub>(⟨M₁, M₂⟩)
}

M₁(x) { accept }
M₂(x) { run M(w); output what it outputs }</pre>
        <p>L(M₁) = Σ*. L(M₂) = Σ* if M accepts w, and ∅ otherwise. <b>Key point:</b> L(M₁) = L(M₂) ⇔ M accepts w. ∎</p>
        <p class="callout tip">Compare with DFAs: equivalence of two DFAs <b>is</b> decidable (compare them on the product machine). The jump to TMs is what makes it undecidable.</p>`,
    },
    {
      id: "mapping",
      yourTurn: TURNS.mapping,
      title: "Mapping reductions",
      lec: [8],
      html: `
        <p>Most of the reductions above have the same shape: transform the input, ask D<sub>B</sub> once, and output its answer unchanged.</p>
        <p class="callout key">A <b>mapping reduction</b> from A to B is a computable function f such that, for every input w: <b>w ∈ A ⇔ f(w) ∈ B</b>. Sipser writes <b>A ≤<sub>m</sub> B</b>.</p>
        <p>A mapping reduction automatically gives a normal reduction: D<sub>A</sub>(w) = D<sub>B</sub>(f(w)).</p>
        <div class="table-wrap"><table class="compare"><thead><tr><th>Reduction</th><th>f</th></tr></thead><tbody>
          <tr><td>SA<sub>TM</sub> ≤<sub>m</sub> A<sub>TM</sub></td><td>⟨M⟩ ↦ ⟨M, ⟨M⟩⟩</td></tr>
          <tr><td>A<sub>TM</sub> ≤<sub>m</sub> E<sub>TM</sub></td><td>⟨M, w⟩ ↦ ⟨M′<sub>w</sub>⟩</td></tr>
          <tr><td>A<sub>TM</sub> ≤<sub>m</sub> REGULAR<sub>TM</sub></td><td>⟨M, w⟩ ↦ ⟨M′<sub>w</sub>⟩ (the 0ⁿ1ⁿ version)</td></tr>
          <tr><td>A<sub>TM</sub> ≤<sub>m</sub> EQ<sub>TM</sub></td><td>⟨M, w⟩ ↦ ⟨M₁, M₂⟩</td></tr>
        </tbody></table></div>
        <p class="callout warn">f has to be <b>computable</b> (always halt), but it doesn’t decide anything. It just rewrites the input. And “⇔” needs both directions: inputs in A go into B, <b>and</b> inputs outside A go outside B.</p>
        <p>The halting reduction above isn’t written as a mapping reduction, since it runs M(w) after calling D<sub>H</sub>. (It can be turned into one: map ⟨M, w⟩ to ⟨M″, w⟩, where M″ runs M and loops instead of rejecting.)</p>`,
    },
  ],

  playground: [
    {
      id: "walkthrough",
      title: "Walk through a reduction",
      lec: [8],
      intro: `<p>Each walkthrough tests a lecture proof on a <b>real machine M</b> and three real strings w: one M accepts, one it rejects, and one it loops on. <b>Predict each step before it’s shown</b>: pick an answer, and if you’re stuck take a Hint, then Show me. The picture beside the steps fills in as you go. Start with HALT; it’s the most natural one.</p>`,
      widget: "stepper",
      config: { walks: WALKS },
    },
    {
      id: "puzzles",
      title: "Reduction proof puzzles",
      lec: [8],
      intro: `<p><b>Build the proof:</b> pick the right steps (some don’t belong) and put them in order. <b>Find the flaw:</b> click the one broken line. These follow the lecture’s proofs, so they double as a template for writing your own.</p>`,
      widget: "proof-puzzle",
      config: {
        puzzles: [
          {
            id: "red-atm", name: "A_TM is undecidable", type: "order",
            theorem: "A<sub>TM</sub> = { ⟨M, w⟩ | M accepts w } is undecidable.",
            steps: [
              "Assume, for contradiction, that a TM D<sub>A</sub> decides A<sub>TM</sub>.",
              "Build D<sub>S</sub>: on input ⟨M⟩, output D<sub>A</sub>(⟨M, ⟨M⟩⟩).",
              "D<sub>S</sub> always halts, because D<sub>A</sub> always halts.",
              "D<sub>S</sub> accepts ⟨M⟩ ⇔ M accepts ⟨M⟩ ⇔ ⟨M⟩ ∈ SA<sub>TM</sub>. So D<sub>S</sub> decides SA<sub>TM</sub>.",
              "But SA<sub>TM</sub> is undecidable. Contradiction, so A<sub>TM</sub> is undecidable. ∎",
            ],
            groups: [[2, 3]],
            distractors: [
              { html: "Build D<sub>S</sub>: on input ⟨M⟩, run M on ⟨M⟩ and output what it outputs.", why: "That never uses D<sub>A</sub>, and it loops whenever M loops on ⟨M⟩, so it isn’t a decider." },
              { html: "The universal TM runs M on w, so A<sub>TM</sub> is decidable.", why: "The universal TM only <b>recognizes</b> A<sub>TM</sub>: it loops whenever M loops." },
            ],
            done: "The whole reduction is one line: ask about M on its own description.",
          },
          {
            id: "red-halt", name: "HALT is undecidable", type: "order",
            theorem: "HALT = { ⟨M, w⟩ | M halts on w } is undecidable.",
            steps: [
              "Assume, for contradiction, that a TM D<sub>H</sub> decides HALT.",
              "Build D<sub>A</sub>: on input ⟨M, w⟩, run D<sub>H</sub>(⟨M, w⟩). If it rejects, reject.",
              "Otherwise M halts on w, so run M on w and output what it outputs.",
              "D<sub>A</sub> always halts: D<sub>H</sub> always halts, and M(w) is only run when it’s guaranteed to halt.",
              "If M accepts w, D<sub>A</sub> accepts. If M rejects or loops on w, D<sub>A</sub> rejects. So D<sub>A</sub> decides A<sub>TM</sub>.",
              "But A<sub>TM</sub> is undecidable. Contradiction, so HALT is undecidable. ∎",
            ],
            groups: [[3, 4]],
            distractors: [
              { html: "Assume, for contradiction, that a TM decides A<sub>TM</sub>.", why: "We already know A<sub>TM</sub> has no decider. Assume a decider for the <b>new</b> language, HALT." },
              { html: "Build D<sub>A</sub>: on input ⟨M, w⟩, run M on w; if it halts, accept.", why: "If M loops on w, this loops too, so it isn’t a decider. Ask D<sub>H</sub> first." },
              { html: "Use D<sub>A</sub> to build a decider for HALT.", why: "Wrong direction. Build a decider for the known undecidable A<sub>TM</sub> out of the assumed D<sub>H</sub>." },
            ],
            done: "Ask the halting decider first; only run M(w) once it’s safe.",
          },
          {
            id: "red-eps", name: "“Accepts ε” is undecidable", type: "order",
            theorem: "E<sub>TM</sub> = { ⟨M⟩ | M accepts ε } is undecidable.",
            steps: [
              "Assume, for contradiction, that a TM D<sub>E</sub> decides E<sub>TM</sub>.",
              "Build D<sub>A</sub>: on input ⟨M, w⟩, write down the code of M′<sub>w</sub>, which ignores its input x, runs M on w, and outputs what M outputs.",
              "Then D<sub>A</sub> outputs D<sub>E</sub>(⟨M′<sub>w</sub>⟩).",
              "D<sub>A</sub> always halts: it only writes down ⟨M′<sub>w</sub>⟩ (it never runs it), and D<sub>E</sub> always halts.",
              "M′<sub>w</sub> accepts ε ⇔ M accepts w, so D<sub>A</sub> accepts ⟨M, w⟩ ⇔ ⟨M, w⟩ ∈ A<sub>TM</sub>.",
              "So D<sub>A</sub> decides A<sub>TM</sub>, which is impossible. So E<sub>TM</sub> is undecidable. ∎",
            ],
            groups: [[3, 4]],
            distractors: [
              { html: "D<sub>A</sub> runs M′<sub>w</sub> on ε to see whether it accepts.", why: "That could loop forever (when M loops on w). D<sub>A</sub> only <b>builds</b> M′<sub>w</sub> and hands its code to D<sub>E</sub>." },
              { html: "M′<sub>w</sub> accepts ε ⇔ M accepts ε.", why: "M′<sub>w</sub> ignores its input and runs M on <b>w</b>, the string baked into it. It’s about M on w." },
            ],
            done: "This is the pattern for most reductions: build M′<sub>w</sub>, never run it, and state the key point M′<sub>w</sub> ∈ B ⇔ M accepts w.",
          },
          {
            id: "red-eq", name: "EQ_TM is undecidable", type: "order",
            theorem: "EQ<sub>TM</sub> = { ⟨M₁, M₂⟩ | L(M₁) = L(M₂) } is undecidable.",
            steps: [
              "Assume, for contradiction, that a TM D<sub>EQ</sub> decides EQ<sub>TM</sub>.",
              "Build D<sub>A</sub>: on input ⟨M, w⟩, write down M₁, which accepts every input, and M₂, which ignores its input and runs M on w.",
              "Then D<sub>A</sub> outputs D<sub>EQ</sub>(⟨M₁, M₂⟩). It always halts, since it only writes code and D<sub>EQ</sub> always halts.",
              "L(M₁) = Σ*, and L(M₂) = Σ* if M accepts w, ∅ otherwise. So L(M₁) = L(M₂) ⇔ M accepts w.",
              "So D<sub>A</sub> decides A<sub>TM</sub>, which is impossible. So EQ<sub>TM</sub> is undecidable. ∎",
            ],
            distractors: [
              { html: "If M loops on w, L(M₂) = Σ*, because M₂ never rejects anything.", why: "Never rejecting isn’t accepting. If M₂ loops on every input, it accepts nothing: L(M₂) = ∅." },
              { html: "Let M₁ be any TM that rejects every input.", why: "Then L(M₁) = ∅, and L(M₁) = L(M₂) would mean M does <b>not</b> accept w: the answer is flipped. (Flipping D<sub>EQ</sub>’s answer would fix it, but this proof doesn’t do that.)" },
            ],
            done: "Same M′<sub>w</sub> trick (here called M₂), compared against a machine with a known language.",
          },
          {
            id: "flaw-direction", name: "Flaw: which way?", type: "flaw",
            theorem: "<b>Claim:</b> HALT is undecidable. (The claim is true, but this proof is broken.)",
            lines: [
              { html: "We know A<sub>TM</sub> is undecidable: no TM decides it.", ok: "True; it was proved from SA<sub>TM</sub>." },
              { html: "Given a decider D<sub>A</sub> for A<sub>TM</sub>, we could decide HALT: on ⟨M, w⟩, ask D<sub>A</sub> about ⟨M, w⟩ and about ⟨M̄, w⟩, where M̄ is M with accept and reject swapped, and accept if either one accepts.", ok: "This construction really works: M halts on w exactly when M or M̄ accepts w. It reduces HALT to A<sub>TM</sub>." },
              { html: "Since no decider for A<sub>TM</sub> exists, this construction never produces a decider for HALT.", ok: "True as far as it goes, but look at what the next line concludes from it." },
              { html: "So HALT is undecidable. ∎", ok: "" },
            ],
            flaw: 3,
            why: "Wrong direction. Reducing HALT <b>to</b> A<sub>TM</sub> only shows “if A<sub>TM</sub> were decidable, so would HALT be.” Since A<sub>TM</sub> isn’t, that says nothing about HALT (a failed recipe doesn’t mean no other recipe exists). To prove HALT undecidable, reduce A<sub>TM</sub> <b>to</b> HALT: build a decider for A<sub>TM</sub> from a decider for HALT.",
          },
          {
            id: "flaw-run", name: "Flaw: running M on w", type: "flaw",
            theorem: "<b>Claim:</b> E<sub>TM</sub> = { ⟨M⟩ | M accepts ε } is undecidable. (The claim is true, but this proof is broken.)",
            lines: [
              { html: "Suppose, for contradiction, that D<sub>E</sub> decides E<sub>TM</sub>.", ok: "The right thing to assume: a decider for the new language." },
              { html: "Build D<sub>A</sub> for A<sub>TM</sub>: on input ⟨M, w⟩, first run M on w.", ok: "" },
              { html: "If M accepted, let M′ be a TM that accepts every input; otherwise let M′ reject every input.", ok: "Fine, if the line before it always finished." },
              { html: "Output D<sub>E</sub>(⟨M′⟩). M′ accepts ε exactly when M accepted w.", ok: "True for the M′ built on the line before." },
              { html: "So D<sub>A</sub> decides A<sub>TM</sub>, a contradiction. ∎", ok: "This would follow if D<sub>A</sub> were really a decider." },
            ],
            flaw: 1,
            why: "If M loops on w, D<sub>A</sub> gets stuck on line 2 and never halts, so D<sub>A</sub> isn’t a decider. (And if running M on w were safe, you wouldn’t need D<sub>E</sub> at all.) Fix: don’t run M; bake w into M′<sub>w</sub>’s code and let D<sub>E</sub> answer.",
          },
          {
            id: "flaw-loop", name: "Flaw: the loop case", type: "flaw",
            theorem: "<b>Claim:</b> REGULAR<sub>TM</sub> is undecidable, using M′<sub>w</sub>(x): “if x has the form 0ⁿ1ⁿ, accept; else run M(w) and output what it outputs.” (The claim is true, but this proof is broken.)",
            lines: [
              { html: "Suppose D<sub>R</sub> decides REGULAR<sub>TM</sub>, and let D<sub>A</sub>(⟨M, w⟩) build ⟨M′<sub>w</sub>⟩ and output D<sub>R</sub>(⟨M′<sub>w</sub>⟩).", ok: "This is the lecture’s construction." },
              { html: "D<sub>A</sub> always halts, since it only writes code and D<sub>R</sub> always halts.", ok: "Correct: M′<sub>w</sub> is built, never run." },
              { html: "If M accepts w, M′<sub>w</sub> accepts every string, so L(M′<sub>w</sub>) = Σ*, which is regular.", ok: "Correct." },
              { html: "If M loops on w, M′<sub>w</sub> loops on every string, so L(M′<sub>w</sub>) = ∅, which is regular.", ok: "" },
              { html: "If M rejects w, L(M′<sub>w</sub>) = {0ⁿ1ⁿ}, which is not regular.", ok: "Correct." },
            ],
            flaw: 3,
            why: "Line 2 of M′<sub>w</sub> still accepts every 0ⁿ1ⁿ string <b>before</b> M is ever run, so when M loops on w, L(M′<sub>w</sub>) = {0ⁿ1ⁿ}, not ∅. (If it were ∅, regular, D<sub>A</sub> would wrongly accept, and the reduction would break.)",
          },
        ],
      },
    },
  ],

  flashcards: [
    { front: "A<sub>TM</sub>", back: "{ ⟨M, w⟩ | M is a TM that accepts w }. Recognizable (universal TM), not decidable." },
    { front: "Why is A<sub>TM</sub> undecidable?", back: "A decider D<sub>A</sub> would decide SA<sub>TM</sub>: D<sub>S</sub>(⟨M⟩) = D<sub>A</sub>(⟨M, ⟨M⟩⟩)." },
    { front: "“Reduce A to B” means…", back: "Build a decider for A using a hypothetical decider for B as a subroutine." },
    { front: "A reduces to B. What follows?", back: "B decidable ⇒ A decidable. A undecidable ⇒ B undecidable." },
    { front: "To prove B undecidable, reduce ___ to ___", back: "A known undecidable language (like A<sub>TM</sub>) <b>to</b> B." },
    { front: "HALT", back: "{ ⟨M, w⟩ | M halts on w }. Undecidable: reduce A<sub>TM</sub> to it (ask D<sub>H</sub> first, run M(w) only if it halts)." },
    { front: "The M′<sub>w</sub> trick", back: "M′<sub>w</sub>(x) ignores x and runs M on w. It accepts everything if M accepts w, and nothing otherwise." },
    { front: "Why can D<sub>A</sub> build M′<sub>w</sub> safely?", back: "It only writes down M′<sub>w</sub>’s code, which always finishes. It never runs M′<sub>w</sub>." },
    { front: "E<sub>TM</sub> (lecture’s definition)", back: "{ ⟨M⟩ | M accepts ε }. Key point: M′<sub>w</sub> accepts ε ⇔ M accepts w." },
    { front: "REGULAR<sub>TM</sub> reduction: M′<sub>w</sub>", back: "If x is 0ⁿ1ⁿ, accept; else run M(w). L(M′<sub>w</sub>) = Σ* if M accepts w, {0ⁿ1ⁿ} otherwise." },
    { front: "EQ<sub>TM</sub> reduction", back: "M₁ accepts everything; M₂ runs M(w). L(M₁) = L(M₂) ⇔ M accepts w." },
    { front: "Mapping reduction A ≤<sub>m</sub> B", back: "A computable f with w ∈ A ⇔ f(w) ∈ B. Then D<sub>A</sub>(w) = D<sub>B</sub>(f(w))." },
    { front: "Three cases to check in a reduction", back: "M accepts w, M rejects w, M loops on w. The decider must halt and be right in all three." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [8],
      q: "You want to prove a new language B is undecidable. What should you show?",
      options: ["A decider for A<sub>TM</sub> would give a decider for B", "A decider for B would give a decider for A<sub>TM</sub>", "B is recognizable", "B is not regular"],
      answer: 1,
      whys: ["That reduces B to A<sub>TM</sub>. Since A<sub>TM</sub> has no decider, it tells you nothing about B.", null, "Recognizable languages can be decidable or not.", "Plenty of non-regular languages, like {0ⁿ1ⁿ}, are decidable."],
      explain: "Reduce the known undecidable A<sub>TM</sub> <b>to</b> B. If B had a decider, A<sub>TM</sub> would too, which is impossible.",
    },
    {
      type: "mc",
      lec: [8],
      q: "A reduces to B, and B is decidable. What can you conclude?",
      options: ["A is decidable", "A is undecidable", "B is regular", "Nothing"],
      answer: 0,
      whys: [null, "A reduction can only transfer decidability from B to A, not undecidability.", "Decidable doesn’t mean regular.", "Plug the decider for B into the reduction, and you get a decider for A."],
      explain: "That’s what a reduction is: a way to solve A using a solver for B.",
    },
    {
      type: "mc",
      lec: [8],
      q: "In the A<sub>TM</sub> → HALT reduction, why does D<sub>A</sub> call D<sub>H</sub> <b>before</b> running M on w?",
      options: ["To save time", "So that D<sub>A</sub> never runs M(w) when it would loop", "Because D<sub>H</sub> tells it whether M accepts", "It doesn’t matter which comes first"],
      answer: 1,
      whys: ["Speed doesn’t matter in decidability; halting does.", null, "D<sub>H</sub> only says whether M halts, not whether it accepts. That’s why D<sub>A</sub> still runs M(w).", "Running M(w) first could loop forever, and then D<sub>A</sub> isn’t a decider."],
      explain: "D<sub>A</sub> must always halt. Asking D<sub>H</sub> first means M(w) only runs when it’s guaranteed to halt.",
    },
    {
      type: "mc",
      lec: [8],
      q: "M′<sub>w</sub>(x) ignores x and runs M on w, outputting what M outputs. If M <b>loops</b> on w, what is L(M′<sub>w</sub>)?",
      options: ["Σ*", "∅", "{w}", "{ε}"],
      answer: 1,
      whys: ["That’s when M accepts w.", null, "M′<sub>w</sub> treats every input the same way, so it can’t single out w.", "M′<sub>w</sub> loops on ε too, so it doesn’t accept it."],
      explain: "M′<sub>w</sub> loops on every input, so it accepts nothing. Looping counts as not accepting.",
    },
    {
      type: "mc",
      lec: [8],
      q: "Why does the decider D<sub>A</sub> in the E<sub>TM</sub> reduction always halt, even when M loops on w?",
      options: ["Because M′<sub>w</sub> always halts", "Because D<sub>A</sub> only writes down M′<sub>w</sub>’s code and D<sub>E</sub> always halts", "Because ε is a short input", "Because it times out after a while"],
      answer: 1,
      whys: ["M′<sub>w</sub> loops whenever M loops on w.", null, "Short inputs can still make a TM loop.", "TMs don’t have timeouts, and a timeout would give wrong answers for slow machines."],
      explain: "Building a machine’s code is a finite text edit. Only D<sub>E</sub> looks at M′<sub>w</sub>, and it’s a decider.",
    },
    {
      type: "mc",
      lec: [8],
      q: "In the REGULAR<sub>TM</sub> reduction, M′<sub>w</sub> accepts 0ⁿ1ⁿ strings and otherwise runs M(w). If M <b>accepts</b> w, L(M′<sub>w</sub>) is…",
      options: ["{0ⁿ1ⁿ}", "∅", "Σ*", "{w}"],
      answer: 2,
      whys: ["That’s when M doesn’t accept w.", "The 0ⁿ1ⁿ strings are always accepted, so it’s never empty.", null, "M′<sub>w</sub> doesn’t look for w in its input."],
      explain: "The 0ⁿ1ⁿ strings are accepted at once, and every other string reaches M(w), which accepts. So everything is accepted.",
    },
    {
      type: "mc",
      lec: [8],
      q: "Which is a mapping reduction from SA<sub>TM</sub> to A<sub>TM</sub>?",
      options: ["⟨M⟩ ↦ ⟨M, ε⟩", "⟨M⟩ ↦ ⟨M, ⟨M⟩⟩", "⟨M, w⟩ ↦ ⟨M⟩", "⟨M⟩ ↦ ⟨M′<sub>w</sub>⟩"],
      answer: 1,
      whys: ["That asks whether M accepts ε, not ⟨M⟩.", null, "That goes the wrong way: from A<sub>TM</sub>’s inputs to SA<sub>TM</sub>’s.", "There’s no w in an SA<sub>TM</sub> input."],
      explain: "M accepts ⟨M⟩ ⇔ ⟨M, ⟨M⟩⟩ ∈ A<sub>TM</sub>, and the map is easy to compute.",
    },
    {
      type: "tf",
      lec: [8],
      q: "True or false: A<sub>TM</sub> is Turing-recognizable.",
      answer: true,
      explain: "The universal TM runs M on w and accepts if M accepts. It may loop when M loops, which is allowed for a recognizer.",
    },
    {
      type: "tf",
      lec: [8],
      q: "True or false: if A<sub>TM</sub> reduces to B, then B is undecidable.",
      answer: true,
      explain: "A decider for B would give a decider for A<sub>TM</sub>, which doesn’t exist.",
    },
  ],
});
})();
