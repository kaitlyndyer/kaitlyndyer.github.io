// Course structure: lectures, concept groups, and the concepts in each group.
// Concept content lives in data/concepts/<id>.js and registers itself with
// registerConcept(). A concept listed here without a content file shows as
// "coming soon".

window.STUDY = {
  course: {
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
      id: "tools",
      title: "Tools",
      icon: "wrench",
      concepts: [
        { id: "tooling", title: "javac, JVM, Gradle & JUnit", icon: "gear-six", color: "#6b7a90", lectures: [1, 2] },
      ],
    },
  ],

  // Filled in by registerConcept().
  content: {},
};

window.registerConcept = function (concept) {
  window.STUDY.content[concept.id] = concept;
};
