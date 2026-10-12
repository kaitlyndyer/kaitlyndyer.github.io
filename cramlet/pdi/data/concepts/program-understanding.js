(function () {
// ---------- The night-scene program, for the call-graph and sequence-diagram widgets (pdi/widgets.js) ----------
// Our own version of the lecture's smart-home scene example. Line numbers in each step point into these methods.
const METHODS = {
  "Client.activateNighttime": { cls: "Client", name: "activateNighttime()", x: 12, y: 110, code: [
    "void activateNighttime() {",
    "    AreaScene.activate(house, \"night\");",
    "}"] },
  "AreaScene.activate": { cls: "AreaScene", name: "activate(area, name)", x: 232, y: 110, code: [
    "static void activate(Area area, String name) {",
    "    Scene scene = area.scenes.get(name);",
    "    scene.activate();",
    "    for (Area child : area.getChildren()) {",
    "        activate(child, name);   // recursive call",
    "    }",
    "}"] },
  "Scene.activate": { cls: "Scene", name: "activate()", x: 452, y: 30, code: [
    "void activate() {",
    "    for (Device d : devices) {",
    "        d.setState(Setting.DIM);",
    "    }",
    "}"] },
  "Device.setState": { cls: "Device", name: "setState(setting)", x: 672, y: 30, code: [
    "void setState(Setting s) {",
    "    this.setting = s;",
    "}"] },
  "Area.getChildren": { cls: "Area", name: "getChildren()", x: 452, y: 190, code: [
    "List<Area> getChildren() {",
    "    return children;",
    "}"] },
};
const EDGES = [
  { from: "Client.activateNighttime", to: "AreaScene.activate" },
  { from: "AreaScene.activate", to: "Scene.activate" },
  { from: "Scene.activate", to: "Device.setState" },
  { from: "AreaScene.activate", to: "Area.getChildren" },
  { from: "AreaScene.activate", to: "AreaScene.activate", recursive: true },
];

// Runs activateNighttime on an area tree and records every call, return, and exception as a step.
// areas: { name: { scene: bool, devices: [..], children: [..] } }. limit: max recursion depth (StackOverflowError past it).
function nightRun(areas, root, limit = 50) {
  const steps = [], loops = [];
  let depth = 0;
  const list = xs => xs.length === 1 ? xs[0] : xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1];
  function activate(name, from, line, say) {
    steps.push({ kind: "call", from, to: "AreaScene.activate", line, args: `${name}, "night"`, short: `activate(${name})`, say });
    depth++;
    if (depth > limit) {
      steps.push({ kind: "throw", error: "StackOverflowError", line: 1, say: `The call stack is full! Every activation is still waiting on the next one, so Java throws a <b>StackOverflowError</b>. (Real Java gets thousands of calls deep first; we stopped early.)` });
      return false;
    }
    const a = areas[name];
    if (!a.scene) {
      steps.push({ kind: "throw", error: "NullPointerException", line: 2, say: `${name} has no "night" scene, so <code>scene</code> is <code>null</code> and <code>scene.activate()</code> throws a <b>NullPointerException</b>.` });
      return false;
    }
    steps.push({ kind: "call", from: "AreaScene.activate", to: "Scene.activate", line: 2, args: "", short: "activate()", say: `Found ${name}’s night scene. Activate it.` });
    const d0 = steps.length;
    a.devices.forEach(dev => {
      steps.push({ kind: "call", from: "Scene.activate", to: "Device.setState", line: 2, args: "DIM", short: "setState(DIM)", who: dev, say: `Dim the ${dev}.` });
      steps.push({ kind: "return", say: `The ${dev} is dimmed. <code>setState</code> returns nothing (void).` });
    });
    if (a.devices.length > 1) loops.push({ from: d0, to: steps.length - 1, label: "for each device" });
    steps.push({ kind: "return", say: `${name}’s scene is done. Back in <b>AreaScene.activate</b> for ${name}.` });
    steps.push({ kind: "call", from: "AreaScene.activate", to: "Area.getChildren", line: 3, args: "", short: "getChildren()", say: `Which areas are inside ${name}?` });
    steps.push({ kind: "return", value: `[${a.children.join(", ")}]`, say: a.children.length ? `${name} contains ${list(a.children)}. Loop over ${a.children.length > 1 ? "them" : "it"}.` : `${name} has no child areas, so the loop body never runs.` });
    const loop = a.children.length ? { from: steps.length, to: null, label: "for each child", owner: depth } : null;
    if (loop) loops.push(loop);
    for (const c of a.children)
      if (!activate(c, "AreaScene.activate", 4, `<b>Recursion!</b> AreaScene.activate calls <b>itself</b>, this time for ${c}.`)) return false;
    if (loop) loop.to = steps.length - 1;
    depth--;
    steps.push({ kind: "return", say: depth ? `Done with ${name}. Return to the activation that’s still waiting on it.` : `Done with ${name} and everything inside it. Back in <b>Client.activateNighttime</b>: the whole house is in night mode.`, done: !depth });
    return true;
  }
  if (!activate(root, "Client.activateNighttime", 1, `The client asks for the night scene on the whole ${root}.`)) {
    const err = steps[steps.length - 1].error;
    for (let i = depth; i >= 1; i--) {
      steps.push({ kind: "unwind", error: err, say: i > 1 ? `Nothing catches the ${err}, so this activation ends too and the exception moves up to its caller.` : `Nothing catches it in <b>activateNighttime</b> either, so the exception escapes and the program crashes.`, done: i === 1 });
      // The exception leaves a "for each child" loop when it pops the child activation inside it.
      loops.forEach(f => { if (f.to === null && f.owner === i - 1) f.to = steps.length - 1; });
    }
  }
  return { steps, loops };
}
const HOUSE = {
  House: { scene: true, devices: ["porch light"], children: ["Upstairs", "Downstairs"] },
  Upstairs: { scene: true, devices: ["bedroom lamp", "hall light"], children: [] },
  Downstairs: { scene: true, devices: ["kitchen light"], children: [] },
};

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
        </ol>
        <p class="callout try">Step through a real run below. Watch the call stack grow and shrink, and see how many times each call happens. Click a method to see what it calls and what calls it.</p>`,
      widget: "call-graph",
      config: {
        methods: METHODS, edges: EDGES, entry: "Client.activateNighttime",
        scenarios: [
          { id: "house", name: "Night mode for the house", run: nightRun(HOUSE, "House") },
          { id: "cycle", name: "Bug: an area inside itself", note: "Here someone put House inside Downstairs by mistake, so the areas form a loop.",
            run: nightRun({ House: { scene: true, devices: ["porch light"], children: ["Downstairs"] }, Downstairs: { scene: true, devices: ["kitchen light"], children: ["House"] } }, "House", 4) },
        ],
      },
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
        </ol>
        <p class="callout try">Build a sequence diagram one message at a time. Each call is a solid arrow, each return is a dashed arrow, and the bars show which objects are busy.</p>`,
      widget: "sequence-diagram",
      config: {
        methods: METHODS, entry: "Client.activateNighttime",
        lifelines: ["Client", "AreaScene", "Scene", "Device", "Area"],
        scenarios: [
          { id: "upstairs", name: "Night mode for the house", run: nightRun({ House: { scene: true, devices: ["porch light"], children: ["Upstairs"] }, Upstairs: HOUSE.Upstairs }, "House") },
          { id: "npe", name: "Bug: a missing scene", note: "Here Upstairs has no \"night\" scene. Where does the chain break?",
            run: nightRun({ House: { scene: true, devices: ["porch light"], children: ["Upstairs"] }, Upstairs: { scene: false, devices: ["bedroom lamp"], children: [] } }, "House") },
        ],
      },
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
      whys: ["That’s data flow: a value used before it’s assigned.", null, "That’s data flow: shared data changing.", "That’s data flow: a null value reaching a dereference."],
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
      whys: ["The if (scene != null) check stops the NullPointerException.", null, "Nothing in the code picks a default.", "There’s no loop that retries."],
      explain: "The <code>if (scene != null)</code> just skips everything, so the caller never learns something went wrong.",
    },
    {
      type: "mc", lec: [5],
      q: "You’re debugging a problem that bounces between five objects. Which diagram fits best?",
      options: ["A sequence diagram", "A class hierarchy", "A truth table", "None. Just add print statements."],
      answer: 0,
      whys: [null, "A class hierarchy shows types, not the order of calls.", "A truth table is for logic, not object interactions.", "Prints across five objects are hard to follow."],
      explain: "Sequence diagrams show the order of calls between objects, which is exactly what multi-object bugs need.",
    },
    {
      type: "mc", lec: [5],
      q: "When drawing a call graph, what does “expand selectively” mean?",
      options: ["Draw every possible call in the program", "Follow only the path you’re investigating", "Only draw recursive calls", "Use a tool instead of sketching"],
      answer: 1,
      whys: ["Drawing everything is exactly what “expand selectively” avoids.", null, "You follow the relevant path, not only recursive calls.", "Sketching by hand is recommended."],
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
})();
