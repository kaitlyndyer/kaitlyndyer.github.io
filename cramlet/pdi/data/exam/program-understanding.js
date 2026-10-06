registerExam("program-understanding", [
  {
    id: "bug-off-by-one", type: "bug", lec: [5], sec: "control",
    q: "This method should return the sum of the array. Click the line with the bug, then pick the fix.",
    lines: [
      "static int sum(int[] nums) {",
      "    int total = 0;",
      "    for (int i = 0; i <= nums.length; i++) {",
      "        total += nums[i];",
      "    }",
      "    return total;",
      "}",
    ],
    answer: 2,
    fixes: ["Change <code>i &lt;= nums.length</code> to <code>i &lt; nums.length</code>", "Start <code>i</code> at 1", "Return <code>total + 1</code>", "Use <code>nums[i - 1]</code>"],
    fix: 0,
    explain: "Valid indexes go from 0 to <code>nums.length - 1</code>. With <code>&lt;=</code>, the last iteration reads <code>nums[nums.length]</code> and throws. Tracing the loop’s control flow at its boundary finds it.",
  },
  {
    id: "trace-npe", type: "trace", lec: [5, 6], sec: "data",
    q: "What happens?",
    code: `String name = null;
if (Math.random() < 2) {
    System.out.println("checking");
}
System.out.println(name.length());`,
    out: { kind: "exception" },
    explain: "<code>Math.random()</code> is always below 2, so <code>checking</code> prints first, and then <code>name.length()</code> dereferences <code>null</code> and throws a <code>NullPointerException</code> at runtime. (Following where <code>name</code>’s value comes from is data-flow reasoning.)",
  },
]);

// ---------- Batch 4 (lecture 5) ----------
registerExam("program-understanding", [
  // ----- Control flow -----
  {
    id: "trace-branches", type: "trace", lec: [5], sec: "control",
    q: "What does this print?",
    code: `static void process(boolean[] connected, boolean useDefaults) {
    for (boolean c : connected) {
        if (c) {
            if (useDefaults) {
                System.out.print("D ");
            } else {
                System.out.print("U ");
            }
        } else {
            System.out.print("X ");
        }
    }
}

process(new boolean[] {true, false, true}, false);`,
    out: { kind: "output", text: "U X U" },
    explain: "Each element takes one of three paths. Connected + not defaults → <code>U</code>, disconnected → <code>X</code>. (Trailing spaces don’t matter.)",
  },
  {
    id: "trace-halving", type: "trace", lec: [5], sec: "control",
    q: "What does this print?",
    code: `int b = 100;
int steps = 0;
while (b > 10) {
    b = b / 2;
    steps++;
}
System.out.println(b + " " + steps);`,
    out: { kind: "output", text: "6 4" },
    explain: "100 → 50 → 25 → 12 → 6 (integer division), four steps. The loop stops once <code>b &gt; 10</code> is false.",
  },
  {
    id: "trace-nested-count", type: "trace", lec: [5], sec: "control",
    q: "What does this print?",
    code: `int calls = 0;
for (int i = 0; i < 3; i++) {
    for (int j = i; j < 3; j++) {
        calls++;
    }
}
System.out.println(calls);`,
    out: { kind: "output", text: "6" },
    explain: "The inner loop starts at <code>i</code>, so it runs 3, then 2, then 1 times: 6 in total.",
  },
  {
    id: "trace-dead-branch", type: "trace", lec: [5], sec: "control",
    q: "What does this print?",
    code: `static String level(int b) {
    if (b > 50) {
        return "bright";
    } else if (b > 80) {
        return "very bright";
    } else {
        return "dim";
    }
}

System.out.println(level(90) + " " + level(30));`,
    out: { kind: "output", text: "bright dim" },
    explain: "90 &gt; 50 is true, so the first branch returns right away. Any value over 80 is also over 50, so <code>\"very bright\"</code> can <b>never</b> be returned: it’s dead code.",
  },
  {
    id: "bug-dead-branch", type: "bug", lec: [5], sec: "control",
    q: "<code>\"very bright\"</code> is never returned, for any input. Which line causes it, and how do you fix it?",
    lines: [
      "static String level(int b) {",
      "    if (b > 50) {",
      "        return \"bright\";",
      "    } else if (b > 80) {",
      "        return \"very bright\";",
      "    } else {",
      "        return \"dim\";",
      "    }",
      "}",
    ],
    answer: 3,
    fixes: ["Check <code>b &gt; 80</code> first, then <code>b &gt; 50</code>", "Change <code>else if</code> to <code>if</code>", "Delete the <code>else</code> branch", "Change <code>&gt;</code> to <code>&gt;=</code> on that line"],
    fix: 0,
    explain: "Every value that passes <code>b &gt; 80</code> already took the <code>b &gt; 50</code> branch. Test the narrower condition first.",
  },
  {
    id: "bug-never-ends", type: "bug", lec: [5], sec: "control",
    q: "This loop never ends. Which line is the problem, and how do you fix it?",
    lines: [
      "int b = 0;",
      "while (b != 25) {",
      "    b += 10;",
      "    System.out.println(\"brightness \" + b);",
      "}",
    ],
    answer: 1,
    fixes: ["Use <code>b &lt; 25</code> as the condition", "Start <code>b</code> at 1", "Use <code>b -= 10</code>", "Move the print above the addition"],
    fix: 0,
    explain: "<code>b</code> goes 0, 10, 20, 30… and skips 25, so <code>b != 25</code> stays true forever. When you check termination, make sure the condition will actually become false.",
  },
  {
    id: "mc-paths", type: "mc", lec: [5], sec: "control",
    q: "In <code>processLights</code> from lecture (a loop with “is connected?”, then “use defaults?” nested inside), how many different paths can <b>one</b> light take through the loop body?",
    options: ["2", "3", "4", "1"],
    answer: 1,
    explain: "Connected + defaults, connected + user preference, or disconnected (logged). The inner choice only exists on the connected side.",
  },
  // ----- Data flow -----
  {
    id: "trace-avg-ok", type: "trace", lec: [5], sec: "data",
    q: "What does this print?",
    code: `static int average(int[] levels, boolean[] connected) {
    int total = 0;
    int count = 0;
    for (int i = 0; i < levels.length; i++) {
        if (connected[i]) {
            total += levels[i];
            count++;
        }
    }
    return total / count;
}

System.out.println(average(new int[] {40, 90, 75}, new boolean[] {true, false, true}));`,
    out: { kind: "output", text: "57" },
    explain: "Only 40 and 75 count: total 115, count 2. Integer division gives 57, not 57.5.",
  },
  {
    id: "trace-avg-zero", type: "trace", lec: [5], sec: "data",
    q: "Same <code>average</code> method as before. What happens?",
    code: `static int average(int[] levels, boolean[] connected) {
    int total = 0;
    int count = 0;
    for (int i = 0; i < levels.length; i++) {
        if (connected[i]) {
            total += levels[i];
            count++;
        }
    }
    return total / count;
}

System.out.println(average(new int[] {50, 60}, new boolean[] {false, false}));`,
    out: { kind: "exception" },
    explain: "Follow <code>count</code>: no light is connected, so it’s still 0 at the return, and <code>total / 0</code> throws an <code>ArithmeticException</code>.",
  },
  {
    id: "trace-shared-list", type: "trace", lec: [3, 5], sec: "data",
    q: "What does this print?",
    code: `List<Integer> levels = new ArrayList<>(List.of(30, 60, 90));
List<Integer> backup = levels;
levels.set(0, 100);
backup.remove(2);
System.out.println(levels + " " + backup.size());`,
    out: { kind: "output", text: "[100, 60] 2" },
    explain: "<code>backup</code> isn’t a copy: both names point to one list. That’s an unexpected mutation that data-flow analysis catches. <code>remove(2)</code> removes index 2 (the 90).",
  },
  {
    id: "trace-uninit", type: "trace", lec: [5], sec: "data",
    q: "What happens?",
    code: `int[] levels = {40, 80};
int total;
if (levels.length > 0) {
    total = levels[0];
}
System.out.println(total);`,
    out: { kind: "compile" },
    explain: "On the path where the <code>if</code> is false, <code>total</code> is never assigned. Java rejects reading a local variable that <i>might</i> not be initialized, even if that path never actually happens.",
  },
  {
    id: "bug-div-zero", type: "bug", lec: [5], sec: "data",
    q: "Following the data flow, which line can crash, and what’s the best fix?",
    lines: [
      "public int averageBrightness(List<Light> lights) {",
      "    int total = 0;",
      "    int count = 0;",
      "    for (Light light : lights) {",
      "        if (light.isConnected()) {",
      "            total += light.getBrightness();",
      "            count++;",
      "        }",
      "    }",
      "    return total / count;",
      "}",
    ],
    answer: 9,
    fixes: ["Check <code>count == 0</code> before dividing, and throw (or return a documented default)", "Start <code>count</code> at 1", "Wrap the whole loop in try/catch", "Make <code>total</code> a <code>double</code>"],
    fix: 0,
    explain: "If no light is connected, <code>count</code> is 0 at the return. Starting it at 1 would hide the problem and give wrong averages everywhere else.",
  },
  {
    id: "fill-guard-avg", type: "fill", lec: [5], sec: "data",
    q: "Fill in the blanks so the method counts connected lights and refuses to divide by zero.",
    code: `int total = 0;
int count = 0;
for (Light l : lights) {
    if (l.isConnected()) {
        total += l.getBrightness();
        [[1]];
    }
}
if (count [[2]] 0) {
    throw new IllegalStateException("no connected lights");
}
return total / count;`,
    blanks: [["count++", "++count", "count+=1", "count=count+1"], ["=="]],
    explain: "Each connected light adds to both <code>total</code> and <code>count</code>. Check <code>count == 0</code> right before the division.",
  },
  {
    id: "mc-flow-kind", type: "mc", lec: [5], sec: "data",
    q: "“Can <code>count</code> still be 0 when we reach the <code>return</code>?” is mainly which kind of question?",
    options: ["A data-flow question", "A sequence-diagram question", "A readability question", "A Gradle question"],
    answer: 0,
    explain: "Data flow asks where a variable is assigned and read, and what values it can have at each point.",
  },
  // ----- Combining both, recursion -----
  {
    id: "trace-recursion-order", type: "trace", lec: [5], sec: "combined",
    q: "What does this print?",
    code: `static void activate(int depth, int max) {
    System.out.println("area " + depth);
    if (depth < max) {
        activate(depth + 1, max);
    }
    System.out.println("done " + depth);
}

activate(1, 3);`,
    out: { kind: "output", text: "area 1\narea 2\narea 3\ndone 3\ndone 2\ndone 1" },
    explain: "Each call prints “area” on the way down. The “done” lines print as the calls return, innermost first.",
  },
  {
    id: "trace-missed-base", type: "trace", lec: [5], sec: "combined",
    q: "What happens?",
    code: `static int countdown(int n) {
    if (n == 0) {
        return 0;
    }
    return countdown(n - 2);
}

System.out.println(countdown(5));`,
    out: { kind: "exception" },
    explain: "5 → 3 → 1 → −1 → … skips 0, so the base case is never reached. The recursion never stops and ends in a <code>StackOverflowError</code>. Always check that every path reaches the base case.",
  },
  {
    id: "trace-silent", type: "trace", lec: [5], sec: "combined",
    q: "What does this print?",
    code: `static Map<String, String> scenes = new HashMap<>(Map.of("night", "dim all"));

static void activate(String name) {
    String scene = scenes.get(name);
    if (scene != null) {
        System.out.println("running " + scene);
    }
}

activate("party");
System.out.println("finished");`,
    out: { kind: "output", text: "finished" },
    explain: "<code>\"party\"</code> isn’t a key, so <code>scene</code> is null and the method quietly does nothing. That’s the <b>silent failure</b> from lecture: you only see it by combining data flow (scene can be null) and control flow (the branch is skipped).",
  },
  {
    id: "bug-silent", type: "bug", lec: [5], sec: "combined",
    q: "Activating a misspelled scene does nothing, and nobody is told. Which line lets it fail silently, and what’s the fix?",
    lines: [
      "public void activateAreaScene(Area area, String sceneName) {",
      "    Scene scene = findScene(sceneName);",
      "    if (scene != null) {",
      "        scene.activate();",
      "        for (Area child : area.getChildren()) {",
      "            activateAreaScene(child, sceneName);",
      "        }",
      "    }",
      "}",
    ],
    answer: 2,
    fixes: ["Handle the null case: throw an exception (or log and report it) when no scene is found", "Delete the null check", "Move <code>findScene</code> inside the loop", "Make <code>sceneName</code> <code>final</code>"],
    fix: 0,
    explain: "The <code>if</code> has no <code>else</code>, so the null path just ends. Throwing (for example <code>IllegalArgumentException(\"no scene: \" + sceneName)</code>) makes the mistake visible.",
  },
  {
    id: "bug-sum-base", type: "bug", lec: [5], sec: "combined",
    q: "<code>sumTo(0)</code> crashes with a <code>StackOverflowError</code>. Which line is the problem, and how do you fix it?",
    lines: [
      "public static int sumTo(int n) {",
      "    if (n == 1) {",
      "        return 1;",
      "    }",
      "    return n + sumTo(n - 1);",
      "}",
    ],
    answer: 1,
    fixes: ["Use a base case every input reaches, like <code>if (n &lt;= 0) return 0;</code>", "Change <code>n - 1</code> to <code>n + 1</code>", "Return <code>n</code> instead of 1", "Make the method non-static"],
    fix: 0,
    explain: "From 0 the calls go −1, −2, … and never hit <code>n == 1</code>. A base case of <code>n &lt;= 0</code> catches every input that reaches the bottom.",
  },
  {
    id: "fill-depth-guard", type: "fill", lec: [5], sec: "combined",
    q: "Fill in the blanks so the recursion stops at a maximum depth, even if the area tree has a cycle.",
    code: `static void activate(Area area, int depth) {
    if (depth [[1]] MAX_DEPTH) {
        return;
    }
    area.lightsOn();
    for (Area child : area.getChildren()) {
        activate(child, depth [[2]] 1);
    }
}`,
    blanks: [[">=", ">"], ["+"]],
    explain: "Each call goes one level deeper, so <code>depth + 1</code>. Once it reaches the limit, return without recursing. That guarantees termination.",
  },
  {
    id: "parsons-require-scene", type: "parsons", lec: [5], sec: "combined",
    q: "Build a method that looks up a scene and <b>never fails silently</b>.",
    lines: [
      "public Scene requireScene(String name) {",
      "    Scene scene = findScene(name);",
      "    if (scene == null) {",
      "        throw new IllegalArgumentException(\"no scene: \" + name);",
      "    }",
      "    return scene;",
      "}",
    ],
    distractors: [
      { code: "        return null;", why: "Returning null just moves the silent failure to the caller." },
      { code: "    if (scene != null) {", why: "That checks the wrong case. You want to react when the scene is missing." },
    ],
    explain: "Turn “nothing found” into a clear, early error, so every caller gets a real <code>Scene</code> or an exception that explains what went wrong.",
  },
  {
    id: "parsons-activate-all", type: "parsons", lec: [5], sec: "combined",
    q: "Build a recursive method that activates a scene in an area and then in all of its child areas.",
    lines: [
      "public void activateAll(Area area, Scene scene) {",
      "    scene.activateIn(area);",
      "    for (Area child : area.getChildren()) {",
      "        activateAll(child, scene);",
      "    }",
      "}",
    ],
    distractors: [
      { code: "        activateAll(area, scene);", why: "Recursing on the same area never makes progress, so it runs forever." },
      { code: "    while (area.hasChildren()) {", why: "Nothing in the loop changes area, so this never ends. Loop over the children instead." },
    ],
    explain: "Each call handles one area and recurses on its <b>children</b>. The recursion stops at areas with no children, because the loop body never runs.",
  },
  {
    id: "write-count-areas", type: "write", lec: [5], sec: "combined",
    q: "Write a recursive <code>public static int countAreas(Area area)</code> that returns how many areas there are in total: this area plus all of its descendants. (<code>area.getChildren()</code> returns a <code>List&lt;Area&gt;</code>.)",
    rubric: [
      { text: "Correct signature", re: "public\\s+static\\s+int\\s+countAreas\\s*\\(\\s*Area\\s+\\w+\\s*\\)" },
      { text: "Counts this area (starts at 1)", re: "int\\s+\\w+\\s*=\\s*1\\s*;|return\\s+1\\s*\\+" },
      { text: "Loops over <code>getChildren()</code>", re: "for\\s*\\(\\s*Area\\s+\\w+\\s*:\\s*\\w+\\.getChildren\\s*\\(\\s*\\)\\s*\\)" },
      { text: "Recursive call on each <b>child</b> (not the same area)", re: "countAreas\\s*\\(\\s*(?!area\\b)\\w+\\s*\\)" },
      { text: "Adds the results and returns the total", re: "\\+=\\s*countAreas|return\\s+\\w+\\s*;" },
    ],
    model: `public static int countAreas(Area area) {
    int count = 1;
    for (Area child : area.getChildren()) {
        count += countAreas(child);
    }
    return count;
}`,
    explain: "The base case is built in: an area with no children skips the loop and returns 1. Each recursive call works on a smaller part of the tree.",
  },
  // ----- Call graphs & sequence diagrams -----
  {
    id: "trace-call-order", type: "trace", lec: [5], sec: "interprocedural",
    q: "What does this print?",
    code: `static int a(int x) {
    System.out.println("a" + x);
    return b(x + 1) * 2;
}
static int b(int x) {
    System.out.println("b" + x);
    return x + c(x);
}
static int c(int x) {
    System.out.println("c" + x);
    return 1;
}

System.out.println(a(1));`,
    out: { kind: "output", text: "a1\nb2\nc2\n6" },
    explain: "Follow the calls: <code>a(1)</code> calls <code>b(2)</code>, which calls <code>c(2)</code>. Then the returns come back: c gives 1, b gives 2 + 1 = 3, a gives 3 × 2 = 6.",
  },
  {
    id: "write-call-graph", type: "write", lec: [5], sec: "call-graphs",
    q: "Write the call graph for <code>start()</code> as text, one edge per line in the form <code>caller -&gt; callee</code>.",
    code: `void start() { load(); run(3); }
void load() { parse(); }
void run(int n) {
    if (n > 0) { step(); run(n - 1); }
}`,
    rubric: [
      { text: "<code>start -&gt; load</code>", re: "start\\s*-+>\\s*load" },
      { text: "<code>start -&gt; run</code>", re: "start\\s*-+>\\s*run" },
      { text: "<code>load -&gt; parse</code>", re: "load\\s*-+>\\s*parse" },
      { text: "<code>run -&gt; step</code>", re: "run\\s*-+>\\s*step" },
      { text: "<code>run -&gt; run</code> (the recursive edge)", re: "run\\s*-+>\\s*run" },
    ],
    model: `start -> load
start -> run
load -> parse
run -> step
run -> run    // recursion`,
    explain: "One arrow per caller → callee pair, starting from the entry point. Mark the self-edge clearly: that’s where you check for a base case.",
  },
  {
    id: "design-which-diagram", type: "design", lec: [5], sec: "sequence",
    q: "A bug only shows up when <code>Client</code>, <code>AreaScene</code>, <code>Scene</code>, and <code>Device</code> call each other in a particular <b>order</b>, and one return value is wrong partway through. Which diagram helps most?",
    options: ["A call graph", "A sequence diagram", "A class hierarchy diagram", "No diagram; just add print statements"],
    answer: 1,
    model: "A <b>sequence diagram</b>: objects as columns and time flowing down, so you can see the order of calls, which object is active, and the dashed return arrows where the wrong value appears. A call graph shows <i>who can call whom</i>, not the order or the values.",
    explain: "Sequence diagrams are for debugging interactions between several objects.",
  },
  {
    id: "design-find-recursion", type: "design", lec: [5], sec: "call-graphs",
    q: "You want to know whether <code>AreaScene.activate</code> can end up calling itself, possibly through other methods. What’s the best tool?",
    options: ["A sequence diagram of one run", "A call graph starting at <code>AreaScene.activate</code>", "Reading only the method’s own body", "A JUnit test"],
    answer: 1,
    model: "A <b>call graph</b> shows every caller → callee edge, so a cycle back to <code>AreaScene.activate</code> (direct or through other methods) is easy to spot. Lecture highlighted that recursive edge in red. A single run’s sequence diagram only shows the path that happened that time.",
    explain: "Call graphs make recursion obvious.",
  },
  {
    id: "mc-dashed", type: "mc", lec: [5], sec: "sequence",
    q: "In a sequence diagram, what does a <b>dashed</b> arrow show?",
    options: ["A method call", "A return value", "A loop", "An object being created"],
    answer: 1,
    explain: "Solid arrows are calls and dashed arrows are returns. Boxes like <code>loop [for each child]</code> show loops.",
  },
  {
    id: "mc-find-refs", type: "mc", lec: [5], sec: "interprocedural",
    q: "You’re about to change what <code>setBrightness</code> does. Which IDE tool shows you every place that calls it?",
    options: ["Jump to Definition", "Find All References", "Rename Variable", "Run All Tests"],
    answer: 1,
    explain: "Find All References lists every caller. Jump to Definition goes the other way: from a call to the method itself.",
  },
  {
    id: "multi-call-graph-steps", type: "multi", lec: [5], sec: "call-graphs",
    q: "Which are good practices for drawing a call graph?",
    options: ["Start with the entry point you’re trying to understand", "Include every method in the whole program", "Expand selectively along the path you’re investigating", "Mark recursion clearly"],
    answers: [0, 2, 3],
    explain: "Sketch by hand, start from the entry point, and follow only the path you care about. Drawing everything buries the part you need.",
  },
]);
