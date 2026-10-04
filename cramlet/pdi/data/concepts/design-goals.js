registerConcept({
  id: "design-goals",
  oneLiner:
    "Working code is <b>necessary but not sufficient</b>. Good code is also <b>understandable, readable, changeable, and testable</b>.",

  related: ["program-understanding", "specifications", "paradigms"],

  summary: {
    keyPoints: [
      { lec: [4], html: "<b>Functional correctness</b> (“does it work?”) is the most objective measure of quality. It’s binary and about the present: it works right now, or it doesn’t." },
      { lec: [4], html: "<b>Non-functional goals</b> determine long-term quality: understandability, readability, changeability, and testability." },
      { lec: [4], kind: "warn", html: "Correct code that fails the non-functional goals <b>tends to evolve into incorrect code</b>, because each change gets harder and riskier." },
      { lec: [4], kind: "key", html: "“Software engineering is the <b>integral of programming over time</b>.”" },
      { lec: [4], html: "These goals still matter with AI: you must understand code to prompt and verify AI, and AI testing its own code is often self-defeating." },
    ],
    compare: {
      head: ["Goal", "Question it asks", "Why it matters"],
      rows: [
        ["<b>Functional correctness</b>", "Does it work right now?", "Objective and binary. Supported by documentation and automated tests."],
        ["<b>Understandability</b>", "Can others see how and why it works?", "Keeps future contributions consistent in style and structure."],
        ["<b>Readability</b>", "Is the written code easy to read?", "Narrower than understandability. Extending code means reading it."],
        ["<b>Changeability</b>", "Can it withstand future change?", "Every change costs time and money: review, testing, verification."],
        ["<b>Testability</b>", "Can it be verified with automated tests?", "Rigid assumptions force manual testing, which doesn’t scale."],
      ],
    },
  },

  details: [
    {
      id: "correctness",
      title: "Functional correctness",
      lec: [4],
      html: `
        <p>A program that doesn’t work isn’t useful, no matter how well it’s designed. Key questions:</p>
        <ul>
          <li>How well have we understood the intended function? → the role of <b>documentation</b></li>
          <li>How do we infer correctness incrementally and continuously? → the role of <b>automated testing</b></li>
          <li>If we’re extending existing code, how well did we understand it first?</li>
          <li>Do our practices <b>scale</b> to hundreds of thousands of lines, not just small programs?</li>
        </ul>`,
    },
    {
      id: "non-functional",
      title: "Why non-functional goals matter",
      lec: [4],
      html: `
        <p>Long-term design quality comes from goals unrelated to whether the code works today. Code that ignores them gets harder and more error-prone to change, and the problems compound over time.</p>
        <p>They’re much harder to measure objectively than correctness, which is why the course spends so much time on practices that support them.</p>`,
    },
    {
      id: "understand-read",
      title: "Understandability and readability",
      lec: [4],
      html: `
        <p><b>Understandability:</b> good design stands the test of time because others can see <i>how and why</i> it works. Ask: what makes a design understandable to someone who didn’t create it? What tools help a developer understand existing code efficiently?</p>
        <p><b>Readability</b> is narrower: it’s about the written code itself. Ask: what makes code readable (size, structure, language, best practices)? What techniques make it more readable to others?</p>`,
    },
    {
      id: "change-test",
      title: "Changeability and testability",
      lec: [4],
      html: `
        <p><b>Changeability:</b> systems are constantly repaired, enhanced, debugged, and grown. The goal is code that can withstand that inevitable change. Ask: which practices make a system easier to change? Do familiar “best practices,” like design patterns, actually help?</p>
        <p><b>Testability:</b> code doesn’t automatically support automated tests. Rigid assumptions such as manual input or fixed file paths force <b>manual</b> testing, and patience runs out before coverage is complete. Ask: what makes a function, class, or module testable? Does targeting testability ever hurt other goals, like changeability?</p>`,
    },
    {
      id: "ai",
      title: "Do these goals matter in the age of AI?",
      lec: [4],
      html: `
        <p><b>Yes</b>, even as AI writes more code:</p>
        <ul>
          <li>To prompt AI well and verify its output, developers must understand the existing codebase.</li>
          <li>Letting AI test its own generated code is often self-defeating.</li>
          <li>Unreadable code means slower human understanding or over-reliance on AI. Neither is productive.</li>
          <li>Unchangeable code means repeated rewrites or regeneration, each needing fresh verification.</li>
        </ul>`,
    },
  ],

  code: [
    {
      title: "Testability: a rigid method vs. a testable one",
      lec: [4],
      note: "An illustration of the lecture’s point (not from the slides): hard-coded input and file paths force manual testing, while passing them in makes automated tests easy.",
      code: `// Hard to test: reads a fixed file and prints the result
public void printAverageBrightness() {
    List<Light> lights = loadLights("/Users/me/lights.txt");
    System.out.println(average(lights));
}

// Easy to test: input comes in, the answer comes out
public double averageBrightness(List<Light> lights) {
    return average(lights);
}`,
    },
  ],

  flashcards: [
    { front: "Functional correctness", back: "Does the code work? The most objective measure: binary and about the present." },
    { front: "Understandability", back: "Others can see <b>how and why</b> the design works, so future contributions stay consistent." },
    { front: "Readability", back: "How easy the written code itself is to read. Narrower than understandability." },
    { front: "Changeability", back: "How well code withstands inevitable future changes (repairs, features, debugging)." },
    { front: "Testability", back: "How easily code can be verified with <b>automated</b> tests instead of manual testing." },
    { front: "“Software engineering is…”", back: "“…the integral of programming over time.”" },
    { front: "What happens to correct code that ignores non-functional goals?", back: "It tends to evolve into <b>incorrect</b> code as changes pile up." },
  ],

  quiz: [
    {
      type: "mc", lec: [4],
      q: "Which goal is the most <b>objective</b> measure of code quality?",
      options: ["Readability", "Functional correctness", "Changeability", "Understandability"],
      answer: 1,
      explain: "Correctness is binary: it works right now or it doesn’t. The non-functional goals are much harder to quantify.",
    },
    {
      type: "mc", lec: [4],
      q: "A method reads input only from a hard-coded path on your laptop. Which goal does that hurt most?",
      options: ["Testability", "Functional correctness", "Readability", "None. Fixed paths are fine."],
      answer: 0,
      explain: "Rigid assumptions like fixed file paths force manual testing, which doesn’t scale.",
    },
    {
      type: "tf", lec: [4],
      q: "True or false: if code is functionally correct today, its design quality doesn’t matter.",
      answer: false,
      explain: "Correct code that fails non-functional goals tends to become incorrect over time as changes get harder and riskier.",
    },
    {
      type: "mc", lec: [4],
      q: "How is <b>readability</b> different from <b>understandability</b>?",
      options: [
        "They mean exactly the same thing",
        "Readability is narrower: it’s about the written code itself",
        "Readability is about whether the code runs fast",
        "Understandability only applies to comments",
      ],
      answer: 1,
      explain: "Understandability is about seeing how and why a design works. Readability is specifically about reading the code.",
    },
    {
      type: "mc", lec: [4],
      q: "Why does the lecture say letting AI test its own generated code is a problem?",
      options: ["AI can’t write tests", "It’s often self-defeating: the same blind spots produce both the code and the tests", "Tests are illegal for AI code", "AI tests are always too slow"],
      answer: 1,
      explain: "Verification needs an independent check. Humans still need to understand and verify what’s produced.",
    },
  ],
});
