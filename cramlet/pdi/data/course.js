// Course structure: lectures, concept groups, and the concepts in each group.
// Concept content lives in data/concepts/<id>.js and registers itself with
// registerConcept(). A concept listed here without a content file shows as
// "coming soon".

window.STUDY = {
  course: {
    id: "pdi",
    // Key kept from the old /study address so saved progress carries over to cramlet.
    storeKey: "study.pdi.v1",
    title: "Program Design & Implementation",
    tagline: "A concept-by-concept study guide to designing programs in Java.",
  },

  lectures: {
    1: "OO vs. Functional Design",
    2: "Java Tooling, Inheritance & Polymorphism",
    3: "Generics, Data Structures & I/O",
    4: "Goals of Design",
    5: "Program Understanding",
    6: "Specifications & Common Contracts",
    7: "Code Readability",
    8: "Changeability: Modularity, Coupling & Cohesion",
  },

  groups: [
    {
      id: "design",
      title: "Design Thinking",
      icon: "compass",
      concepts: [
        { id: "paradigms", title: "OO vs. Functional Design", icon: "arrows-split", color: "#ff7a59", lectures: [1] },
        { id: "design-goals", title: "Goals of Design", icon: "target", color: "#f25c8a", lectures: [4] },
        { id: "program-understanding", title: "Program Understanding", icon: "magnifying-glass", color: "#e0567c", lectures: [5] },
      ],
    },
    {
      id: "oo",
      title: "Object-Oriented Java",
      icon: "stack",
      concepts: [
        { id: "interfaces", title: "Interfaces & Abstract Classes", icon: "puzzle-piece", color: "#7c5cff", lectures: [1, 2, 6] },
        { id: "inheritance", title: "Inheritance & Access Modifiers", icon: "tree-structure", color: "#5b6cff", lectures: [2] },
        { id: "polymorphism", title: "Polymorphism & Dynamic Dispatch", icon: "mask-happy", color: "#3f8cff", lectures: [2, 3] },
      ],
    },
    {
      id: "language",
      title: "The Java Language",
      icon: "coffee",
      concepts: [
        { id: "types-generics", title: "Types, Generics & Pass-by-Value", icon: "tag", color: "#11a8a0", lectures: [3] },
        { id: "exceptions", title: "Exceptions", icon: "siren", color: "#ef6c3b", lectures: [2] },
        { id: "collections", title: "Collections", icon: "package", color: "#2fae6b", lectures: [3] },
        { id: "io", title: "Input & Output", icon: "tray-arrow-down", color: "#3aa8d8", lectures: [3] },
      ],
    },
    {
      id: "specs",
      title: "Specs & Contracts",
      icon: "scroll",
      concepts: [
        { id: "specifications", title: "Writing Specifications", icon: "note-pencil", color: "#d99a00", lectures: [6] },
        { id: "nullness", title: "Nullness & JSpecify", icon: "prohibit", color: "#c56a1a", lectures: [6] },
        { id: "contracts", title: "equals, hashCode & compareTo", icon: "handshake", color: "#b8862d", lectures: [6] },
      ],
    },
    {
      id: "changeable",
      title: "Readable & Changeable Code",
      icon: "lightbulb",
      concepts: [
        { id: "readable-code", title: "Style & Naming", icon: "note", color: "#14a37f", lectures: [7] },
        { id: "concise-java", title: "Records & Pattern Matching", icon: "sparkle", color: "#0e9bb5", lectures: [7] },
        { id: "lambdas", title: "Lambdas & Functional Interfaces", icon: "lambda", color: "#8a5cf6", lectures: [7] },
        { id: "information-hiding", title: "Modularity & Information Hiding", icon: "lock", color: "#d0527a", lectures: [8] },
        { id: "coupling-cohesion", title: "Coupling & Cohesion", icon: "venn", color: "#e2763a", lectures: [8] },
      ],
    },
    {
      id: "tools",
      title: "Tools",
      icon: "wrench",
      concepts: [
        { id: "tooling", title: "javac, JVM, Gradle & JUnit", icon: "gear-six", color: "#6b7a90", lectures: [1, 2] },
      ],
    },
  ],

  // Filled in by registerConcept().
  // What the shared pages say and do for this course (see course/settings.js for every option).
  settings: {
    exam: {
      // 25 multiple choice in 60 minutes is the real exam's size; pick "Multiple choice only" to match it.
      lengths: {
        full: { name: "Full exam", minutes: 120, mix: { choice: 9, trace: 7, bug: 4, fill: 4, parsons: 4, design: 3, write: 4 } },
        sim: { name: "Exam length", minutes: 60, mix: { choice: 12, trace: 4, bug: 2, fill: 2, parsons: 1, design: 3, write: 1 } },
        half: { name: "Half exam", minutes: 60, hidden: true, mix: { choice: 5, trace: 4, bug: 2, fill: 2, parsons: 2, design: 1, write: 2 } },
        quick: { name: "Quick check", minutes: 0, mix: { choice: 4, trace: 2, bug: 1, fill: 1, parsons: 1, design: 1, write: 0 } },
      },
      mixed: "Trace, find the bug, fill in, build, design, and write code",
      intro: "A closed-book exam drawn fresh from {course}’s question bank. Notes, search, and hints are hidden until you submit. Most questions are graded automatically; for written code and design answers you check your work against a model answer.",
    },
    myths: {
      line: "Rapid-fire statements built from the traps behind wrong answers, like “compareTo returns -1” or “records have setters.” Decide fast, and every answer comes with the reason.",
    },
    cast: { title: "The examples exam questions name", asCode: true },
    pep: {
      tips: [
        "Read every option before you pick. Wrong answers are usually common misconceptions, so name the trap.",
        "Stuck? Flag it, move on, and come back. Another question may jog your memory.",
        "Breathe out slowly before you start. Long exhales settle the jitters.",
      ],
    },
  },

  content: {},
};

window.registerConcept = function (concept) {
  window.STUDY.content[concept.id] = concept;
};
