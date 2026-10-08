registerConcept({
  id: "program-understanding",
  oneLiner:
    "Read code through <b>control flow</b> (what runs, in what order) and <b>data flow</b> (how values change), then use <b>diagrams</b> when a system gets too big to read line by line.",

  related: ["design-goals", "polymorphism", "exceptions"],

  summary: {
    keyPoints: [
      { lec: [5], html: "<b>Control flow</b> = the order statements execute: branches, loops, and recursion." },
      { lec: [5], html: "<b>Data flow</b> = how data moves through a program: where variables are assigned, read, and changed." },
      { lec: [5], html: "Many real bugs live at the <b>intersection</b> of the two and only show up when you combine both views." },
      { lec: [5], html: "Look beyond the current method (<b>interprocedural</b> flow) with IDE tools: <i>Find All References</i> and <i>Jump to Definition</i>." },
      { lec: [5], html: "<b>Call graphs</b> show which methods call which. <b>Sequence diagrams</b> show calls between objects over time." },
    ],
    compare: {
      head: ["", "Control flow", "Data flow"],
      rows: [
        ["<b>Tracks</b>", "Which paths execute and in what order", "Where values are assigned, read, and transformed"],
        ["<b>Ask</b>", "Which branches are possible? Any dead code? Missing paths? When do loops end? What’s the base case?", "Where is it set/read? What values can it have here? Unintended mutations? Used before initialized?"],
        ["<b>Common bugs</b>", "Off-by-one loops, wrong boolean logic, early returns that skip cleanup, missing <code>else</code>", "Uninitialized variables, shared-state mutation, divide by zero, null pointers, off-by-one indexes"],
      ],
    },
  },

  details: [
    {
      id: "control",
      title: "Control flow analysis",
      lec: [5],
      html: `
        <p>Control flow is the order in which statements execute. Understanding it helps you identify which code paths actually run, which branches are taken, and how loops iterate and terminate.</p>
        <p><b>Questions to ask:</b></p>
        <ul>
          <li>Which branches are possible given different inputs?</li>
          <li>Are there paths that never execute? (<b>dead code</b>)</li>
          <li>Are there paths that should execute but don’t? (<b>missing functionality</b>)</li>
          <li>What are the loop termination conditions? If there’s recursion, what’s the base case?</li>
        </ul>`,
    },
    {
      id: "interprocedural",
      title: "Looking beyond one method",
      lec: [5],
      html: `
        <p>Understanding control flow often means following calls <b>into other methods</b>. That’s interprocedural control flow, usually drawn as a <b>call graph</b>.</p>
        <ul>
          <li><b>Find All References:</b> every place that calls a given method.</li>
          <li><b>Jump to Definition:</b> takes you to a method’s definition.</li>
        </ul>`,
    },
    {
      id: "data",
      title: "Data flow analysis",
      lec: [5],
      html: `
        <p>Data flow is how data moves through a program and how values change. It helps you track assignments and reads, understand transformations, and spot uninitialized variables or unexpected mutations.</p>
        <p><b>Questions to ask:</b> Where is this variable assigned? Where is it read? What are all its possible values at this point? Are there unintended mutations? Is it used before it’s initialized?</p>
        <p>In <code>calculateAverageBrightness</code> (see the Code tab), if no light is connected, <code>count</code> is still <code>0</code> at the return, so the method <b>divides by zero</b>.</p>`,
    },
    {
      id: "combined",
      title: "Combining both views",
      lec: [5],
      html: `
        <p>Look at <code>activateAreaScene</code> on the Code tab. Two bugs appear only when you combine control and data flow:</p>
        <ul>
          <li>If <code>scene</code> is <code>null</code>, the method <b>fails silently</b>: nothing is logged or reported.</li>
          <li>If <code>sceneName</code> doesn’t exist in a child area, the recursion could run forever (<b>infinite recursion</b>).</li>
        </ul>
        <p>Neither bug is visible from control flow or data flow alone.</p>`,
    },
    {
      id: "call-graphs",
      title: "Call graphs",
      lec: [5],
      html: `
        <p>A call graph shows which methods call which. It traces the flow from the initial request to the final effect and makes recursion obvious (the lecture highlighted the recursive edge in red).</p>
        <p><b>How to draw one:</b></p>
        <ol>
          <li><b>Hand-sketch first.</b> Don’t worry about perfect formatting.</li>
          <li><b>Start with the entry point</b>, the method you’re trying to understand.</li>
          <li><b>Add direct calls</b> as arrows.</li>
          <li><b>Expand selectively.</b> Follow the path you’re investigating, not every possible call.</li>
          <li><b>Mark recursion</b> clearly.</li>
        </ol>`,
    },
    {
      id: "sequence",
      title: "Sequence diagrams",
      lec: [5],
      html: `
        <p>Objects are columns, time flows downward, and each method call is an arrow between objects. Dashed arrows show return values, and boxes like <code>loop [for each child]</code> show loops.</p>
        <p><b>They show:</b> the order of calls, which object is active, loops and conditionals, return values and how they affect the flow, and where bugs might occur in the chain.</p>
        <p><b>Use them for:</b> debugging issues involving several objects, understanding asynchronous operations, clarifying callback sequences, and documenting complex workflows.</p>
        <p><b>How to draw one:</b></p>
        <ol>
          <li>Identify the objects involved (usually <b>3–6</b> key objects).</li>
          <li>Start with the <b>triggering event</b>.</li>
          <li>Follow the control flow: <b>each call becomes an arrow</b>.</li>
          <li>Show returns with <b>dashed arrows</b>.</li>
          <li>Add notes for key state changes.</li>
        </ol>`,
    },
  ],

  code: [
    {
      title: "Reading control flow",
      lec: [5],
      note: "One loop and two branch points give three possible paths for each light.",
      code: `public void processLights(List<Light> lights, boolean useDefaults) {
    for (Light light : lights) {               // Loop entry point
        if (light.isConnected()) {             // Branch point 1
            if (useDefaults) {                 // Branch point 2
                light.setBrightness(50);
            } else {
                light.setBrightness(getUserPreference());
            }
        } else {
            logDisconnectedDevice(light);
        }
    }
}`,
    },
    {
      title: "Reading data flow",
      lec: [5],
      note: "Follow <code>count</code>: if no light is connected, it’s still 0 at the return.",
      code: `public int calculateAverageBrightness(List<Light> lights) {
    int total = 0;   // defined
    int count = 0;   // defined
    for (Light light : lights) {
        if (light.isConnected()) {
            total += light.getBrightness();   // total modified
            count++;                          // count modified
        }
    }
    return total / count;   // both read: potential divide by zero!
}`,
    },
    {
      title: "Control + data flow together",
      lec: [5],
      note: "A <code>null</code> scene fails silently, and the recursion over child areas needs a guaranteed way to stop.",
      code: `public void activateAreaScene(Area area, String sceneName) {
    Scene scene = findScene(sceneName);            // Data: scene assigned
    if (scene != null) {                           // Control: branch
        scene.activate();
        if (area.hasCascadeEnabled()) {            // Control: nested branch
            for (Area child : area.getChildren()) {     // Control: loop
                activateAreaScene(child, sceneName);    // Recursive call
            }
        }
    }
}`,
    },
    {
      title: "The call graph, as text",
      lec: [5],
      note: "The recursive edge (AreaScene.activate calling itself) is the one to watch.",
      code: `Client.activateNighttime
  └─▶ AreaScene.activate
        ├─▶ Scene.activate ─▶ Device.setState
        ├─▶ Area.getChildren
        └─▶ AreaScene.activate   // recursive call`,
    },
  ],

  flashcards: [
    { front: "Control flow", back: "The order in which statements execute: branches, loops, recursion." },
    { front: "Data flow", back: "How data moves through a program and how values change." },
    { front: "Dead code", back: "Code on a path that can never execute." },
    { front: "Interprocedural analysis", back: "Following control flow into the methods a method calls. Often drawn as a call graph." },
    { front: "Call graph", back: "A diagram of which methods call which. Good for tracing a request and spotting recursion." },
    { front: "Sequence diagram", back: "Objects as columns, time downward, calls as arrows, returns as dashed arrows." },
    { front: "How many objects should a sequence diagram usually show?", back: "About <b>3–6</b> key objects." },
    { front: "Two IDE tools for following calls", back: "<b>Find All References</b> and <b>Jump to Definition</b>." },
  ],

  quiz: [
    {
      type: "bug", lec: [5],
      q: "Click the line that can crash when no light is connected.",
      lines: [
        "public int calculateAverageBrightness(List<Light> lights) {",
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
      explain: "If nothing is connected, <code>count</code> is still 0, so <code>total / count</code> divides by zero. Following the data flow of <code>count</code> reveals it.",
    },
    {
      type: "mc", lec: [5],
      q: "Which bug comes from <b>control flow</b>?",
      options: ["Using a variable before it’s initialized", "An early return that skips necessary cleanup", "Unintended mutation of shared state", "A null pointer from a missing null check"],
      answer: 1,
      explain: "An early return changes which statements execute. The other three are data-flow problems.",
    },
    {
      type: "mc", lec: [5],
      q: "In this method, what happens when <code>findScene</code> returns <code>null</code>?",
      code: `public void activateAreaScene(Area area, String sceneName) {
    Scene scene = findScene(sceneName);
    if (scene != null) {
        scene.activate();
        if (area.hasCascadeEnabled()) {
            for (Area child : area.getChildren()) {
                activateAreaScene(child, sceneName);
            }
        }
    }
}`,
      options: ["It throws a NullPointerException", "It fails silently: nothing is logged or reported", "It activates a default scene", "It retries forever"],
      answer: 1,
      explain: "The <code>if (scene != null)</code> just skips everything, so the caller never learns something went wrong.",
    },
    {
      type: "mc", lec: [5],
      q: "You’re debugging a problem that bounces between five objects. Which diagram fits best?",
      options: ["A sequence diagram", "A class hierarchy", "A truth table", "None. Just add print statements."],
      answer: 0,
      explain: "Sequence diagrams show the order of calls between objects, which is exactly what multi-object bugs need.",
    },
    {
      type: "mc", lec: [5],
      q: "When drawing a call graph, what does “expand selectively” mean?",
      options: ["Draw every possible call in the program", "Follow only the path you’re investigating", "Only draw recursive calls", "Use a tool instead of sketching"],
      answer: 1,
      explain: "A call graph for everything is unreadable. Follow the path that matters for your question.",
    },
    {
      type: "tf", lec: [5],
      q: "True or false: you can always find a bug by looking at control flow or data flow alone.",
      answer: false,
      explain: "Many real bugs, like the ones in <code>activateAreaScene</code>, only appear when you combine both views.",
    },
  ],
});
