// Exam questions for Goals of Design (lecture 4). See ../../../course/exam.js for the format.
registerExam("design-goals", [
  // ----- Which goal is suffering? -----
  {
    id: "design-goal-path", type: "design", lec: [4], sec: "change-test",
    q: "<code>reportUsage()</code> reads <code>/Users/sam/devices.txt</code>, computes each device’s daily usage, and prints a table. It works on Sam’s laptop. Which design goal suffers <b>most</b>?",
    options: ["Functional correctness", "Testability", "Readability", "None; it works"],
    answer: 1,
    model: "<b>Testability</b>. The fixed file path and the printing mean an automated test can’t supply its own input or check the output, so someone has to test it by hand (and only on Sam’s machine). Pass the data in and return the result instead.",
    explain: "Rigid assumptions, like manual input or fixed file paths, force manual testing.",
  },
  {
    id: "design-goal-names", type: "design", lec: [4], sec: "understand-read",
    q: "A method is declared <code>double c(List&lt;Light&gt; a, int b, int x2)</code>, and its body is one 140-character line. It passes every test. Which goal suffers most?",
    options: ["Readability", "Testability", "Functional correctness", "Changeability"],
    answer: 0,
    model: "<b>Readability</b>: the written code itself is hard to read. Meaningless names and one huge line hide what it does. Better names and breaking the line into steps fix it without changing behavior.",
    explain: "Readability is about the code on the page: size, structure, names, and conventions.",
  },
  {
    id: "design-goal-onboard", type: "design", lec: [4], sec: "understand-read",
    q: "A new teammate can read every method fine, but can’t figure out <b>why</b> the system is split into these classes, or where a new feature belongs. Which goal is the design missing?",
    options: ["Readability", "Understandability", "Testability", "Functional correctness"],
    answer: 1,
    model: "<b>Understandability</b>: someone who didn’t create the design can’t see how and why it works. Readability is narrower: each line can be readable while the overall design is still a mystery. Documentation of the design’s intent helps here.",
    explain: "Readable lines don’t guarantee an understandable design.",
  },
  {
    id: "design-goal-switch", type: "design", lec: [4], sec: "change-test",
    q: "Every time the team adds a new kind of device, they have to edit twelve <code>switch</code> statements spread across the codebase, and they usually miss one. Which goal is the problem?",
    options: ["Testability", "Readability", "Changeability", "Functional correctness"],
    answer: 2,
    model: "<b>Changeability</b>: a common, expected change touches many places, so it’s slow and error-prone. Putting device-specific behavior in each device class (polymorphism) would make adding a device a change in one place.",
    explain: "Code that’s hard to change tends to become incorrect as changes pile up.",
  },
  {
    id: "design-clever", type: "design", lec: [2, 4], sec: "understand-read",
    q: "A teammate rewrote a clear 6-line loop as a “clever” one-liner that’s about 2% faster in a part of the program that runs once at startup. What should you do?",
    options: ["Keep the one-liner; faster is better", "Keep the clear loop", "Keep both versions in the code", "Delete the method"],
    answer: 1,
    model: "Keep the clear version. Don’t trade clarity for “optimization” that doesn’t matter. Every future reader pays the readability cost, and a 2% gain in code that runs once saves nothing noticeable.",
    explain: "Readability and changeability matter for the whole life of the code. That speedup doesn’t.",
  },
  {
    id: "design-big-codebase", type: "design", lec: [4], sec: "correctness",
    q: "You’re asked to add a feature to a 200,000-line codebase you’ve never seen. What should you do first?",
    options: ["Start writing the feature and fix whatever breaks", "Understand the code you’ll touch: its documentation, how it’s called, and its existing tests", "Rewrite the module so you understand it", "Ask an AI to add it without reading anything"],
    answer: 1,
    model: "If you’re extending existing code, correctness depends on how well you understood it first. Read the relevant docs, trace how the code is called, and run its tests, so you know what “still works” means before you change anything.",
    explain: "Practices have to scale beyond small programs. Understanding comes before changing.",
  },
  {
    id: "design-ai-tests", type: "design", lec: [4], sec: "ai",
    q: "An AI tool generated a class <b>and</b> the tests for it, and all the tests pass. Is that good evidence the class is correct?",
    options: ["Yes, passing tests prove correctness", "Not really: tests written by the same tool can share its misunderstanding, so a human still has to verify both", "Yes, as long as the code compiles", "No, AI code can never be correct"],
    answer: 1,
    model: "Letting AI test its own code is often <b>self-defeating</b>: if it misread the requirement, the tests encode the same mistake and pass anyway. A developer who understands the intended behavior has to check that the tests actually test the right thing.",
    explain: "Understanding the codebase is still required to verify AI output.",
  },
  // ----- Fix it -----
  {
    id: "bug-stdin", type: "bug", lec: [4], sec: "change-test",
    q: "This works, but you can’t write an automated test for it without someone typing numbers. Which line causes the problem, and what’s the best change?",
    lines: [
      "public static double averageTemp() {",
      "    Scanner in = new Scanner(System.in);",
      "    int n = in.nextInt();",
      "    double sum = 0;",
      "    for (int i = 0; i < n; i++) {",
      "        sum += in.nextInt();",
      "    }",
      "    return sum / n;",
      "}",
    ],
    answer: 1,
    fixes: ["Take the readings as a parameter, like <code>averageTemp(List&lt;Integer&gt; temps)</code>, and read input elsewhere", "Read from a fixed file path instead", "Print the average instead of returning it", "Make <code>sum</code> an <code>int</code>"],
    fix: 0,
    explain: "Reading <code>System.in</code> inside the calculation ties it to manual input. Separate getting input from computing: a test can then call <code>averageTemp(List.of(20, 22))</code> and check the answer.",
  },
  {
    id: "bug-print-return", type: "bug", lec: [4], sec: "change-test",
    q: "A test can’t check this method’s answer. Which line is the problem, and how do you fix it?",
    lines: [
      "public static void countOn(List<IoTDevice> devices) {",
      "    int count = 0;",
      "    for (IoTDevice d : devices) {",
      "        if (d.isOn()) {",
      "            count++;",
      "        }",
      "    }",
      "    System.out.println(count + \" devices on\");",
      "}",
    ],
    answer: 7,
    fixes: ["Return <code>count</code> (make the method return <code>int</code>) and let the caller print it", "Use <code>System.err</code> instead", "Start <code>count</code> at 1", "Loop with an index instead"],
    fix: 0,
    explain: "A method that only prints gives a test nothing to <code>assertEquals</code> against. Return the value and keep printing in the caller.",
  },
  {
    id: "parsons-count-on", type: "parsons", lec: [4], sec: "change-test",
    q: "Build a <b>testable</b> method that counts how many of the given devices are on.",
    lines: [
      "public static int countOn(List<IoTDevice> devices) {",
      "    int count = 0;",
      "    for (IoTDevice d : devices) {",
      "        if (d.isOn()) {",
      "            count++;",
      "        }",
      "    }",
      "    return count;",
      "}",
    ],
    distractors: [
      { code: "    List<IoTDevice> devices = loadDevices(\"/home/sam/devices.txt\");", why: "A fixed file path makes the method untestable. The devices come in as a parameter." },
      { code: "    System.out.println(count);", why: "Printing gives a test nothing to check. Return the count instead." },
    ],
    explain: "Input comes in through the parameter, and the answer goes out through <code>return</code>. A test can build any list it likes and check the result.",
  },
  {
    id: "write-avg-brightness", type: "write", lec: [4], sec: "change-test",
    q: "Write a <b>testable</b> <code>public static double averageBrightness(List&lt;Light&gt; lights)</code> that returns the average of <code>getBrightness()</code> over the list. Throw an <code>IllegalArgumentException</code> for an empty list. No files, no printing.",
    rubric: [
      { text: "Signature takes <code>List&lt;Light&gt;</code> and returns <code>double</code>", re: "double\\s+averageBrightness\\s*\\(\\s*List\\s*<\\s*Light\\s*>\\s+\\w+\\s*\\)" },
      { text: "No files, Scanner, or printing inside", re: "^(?![\\s\\S]*(new\\s+File|Scanner|System\\.(out|err)))", flags: "" },
      { text: "Rejects an empty list with <code>IllegalArgumentException</code>", re: "(isEmpty\\s*\\(\\s*\\)|size\\s*\\(\\s*\\)\\s*==\\s*0)[\\s\\S]*throw\\s+new\\s+IllegalArgumentException" },
      { text: "Adds up <code>getBrightness()</code> in a loop", re: "for\\s*\\([\\s\\S]*getBrightness\\s*\\(\\s*\\)" },
      { text: "Avoids integer division (casts or uses a <code>double</code>)", re: "\\(\\s*double\\s*\\)|double\\s+\\w+\\s*=" },
      { text: "Returns total ÷ <code>size()</code>", re: "return[^;]*/\\s*\\w+\\.size\\s*\\(\\s*\\)" },
    ],
    model: `public static double averageBrightness(List<Light> lights) {
    if (lights.isEmpty()) {
        throw new IllegalArgumentException("no lights");
    }
    int total = 0;
    for (Light l : lights) {
        total += l.getBrightness();
    }
    return (double) total / lights.size();
}`,
    explain: "Without the cast, <code>total / lights.size()</code> is integer division: 40 and 45 would average to 42, not 42.5. Taking the list as a parameter is what makes this easy to test.",
  },
  {
    id: "fill-test-average", type: "fill", lec: [2, 4], sec: "change-test",
    q: "Now that <code>averageBrightness</code> is testable, fill in the blanks of a JUnit test for it.",
    code: `[[1]]
void averageOfTwoLights() {
    List<Light> lights = List.of(new Light("a", 40), new Light("b", 80));
    [[2]](60.0, Lighting.averageBrightness([[3]]));
}`,
    blanks: [["@Test"], ["assertEquals", "Assertions.assertEquals"], ["lights"]],
    explain: "The test builds its own input, calls the method, and compares expected to actual. No files and no typing, so it runs automatically every time.",
  },
  {
    id: "write-test-average", type: "write", lec: [2, 4], sec: "change-test",
    q: "Write <b>two</b> JUnit 5 tests for <code>Lighting.averageBrightness</code>: one checks that lights at 40 and 80 average to 60.0, and one checks that an empty list throws <code>IllegalArgumentException</code>.",
    rubric: [
      { text: "Two methods marked <code>@Test</code>", re: "@Test[\\s\\S]*@Test" },
      { text: "Builds a list of lights for the normal case", re: "(List\\.of|Arrays\\.asList|new\\s+ArrayList)[\\s\\S]*new\\s+Light\\s*\\(" },
      { text: "<code>assertEquals(60.0, …)</code> (or 60)", re: "assertEquals\\s*\\(\\s*60(\\.0)?\\s*,\\s*[\\s\\S]*averageBrightness" },
      { text: "<code>assertThrows(IllegalArgumentException.class, …)</code>", re: "assertThrows\\s*\\(\\s*IllegalArgumentException\\.class" },
      { text: "Passes an empty list in the second test", re: "averageBrightness\\s*\\(\\s*(List\\.of\\s*\\(\\s*\\)|new\\s+ArrayList\\s*<\\s*>\\s*\\(\\s*\\)|Collections\\.emptyList\\s*\\(\\s*\\)|empty\\w*\\s*\\))" },
    ],
    model: `@Test
void averagesTwoLights() {
    List<Light> lights = List.of(new Light("a", 40), new Light("b", 80));
    assertEquals(60.0, Lighting.averageBrightness(lights));
}

@Test
void emptyListThrows() {
    assertThrows(IllegalArgumentException.class,
        () -> Lighting.averageBrightness(List.of()));
}`,
    explain: "Test the normal case <b>and</b> the edge case. Each test is independent, builds its own input, and checks one thing.",
  },
  // ----- Concepts -----
  {
    id: "multi-nonfunctional", type: "multi", lec: [4], sec: "non-functional",
    q: "Which of these are <b>non-functional</b> design goals?",
    options: ["Readability", "Changeability", "Returning the right answer for every input", "Testability"],
    answers: [0, 1, 3],
    explain: "Returning the right answer is <b>functional correctness</b>. The others are about how well the code holds up over time, and they’re much harder to measure.",
  },
  {
    id: "multi-ai", type: "multi", lec: [4], sec: "ai",
    q: "According to lecture, why do design goals still matter when AI writes a lot of the code?",
    options: ["To prompt AI well and check its output, you need to understand the codebase", "Unreadable code leads to slow understanding or over-reliance on AI", "Code that’s hard to change means repeated regeneration, and each version needs verifying again", "AI-generated code doesn’t need testing"],
    answers: [0, 1, 2],
    explain: "AI code still needs to be understood, verified, and changed by people. The last option is the opposite of the lecture’s point.",
  },
  {
    id: "tf-tests-pass", type: "tf", lec: [4], sec: "non-functional",
    q: "True or false: if code is functionally correct today, its design doesn’t matter.",
    answer: false,
    explain: "Correct code that ignores non-functional goals tends to become <b>incorrect</b> as changes pile up. Software engineering is “the integral of programming over time.”",
  },
  {
    id: "tf-read-narrower", type: "tf", lec: [4], sec: "understand-read",
    q: "True or false: readability is a narrower goal than understandability.",
    answer: true,
    explain: "Readability is about the written code itself. Understandability is about whether someone else can grasp how and why the whole design works.",
  },
  {
    id: "mc-integral", type: "mc", lec: [4], sec: "non-functional",
    q: "What does “software engineering is the integral of programming over time” mean?",
    options: ["Programs should use calculus", "Engineering is about how code holds up as it’s changed again and again over its life, not just whether it works today", "Older code is always better", "You should write code as fast as possible"],
    answer: 1,
    explain: "Programming gets something working now; engineering adds up the cost of every future change. That’s why non-functional goals matter.",
  },
  {
    id: "mc-incremental", type: "mc", lec: [4], sec: "correctness",
    q: "Which practice best helps you confirm correctness <b>incrementally and continuously</b> as the code changes?",
    options: ["Automated tests", "Reading the code once at the end", "Adding print statements", "Manual testing before each release"],
    answer: 0,
    explain: "Automated tests rerun every time anything changes, so you find breakage right away. Documentation, meanwhile, captures what the intended function is.",
  },
]);
