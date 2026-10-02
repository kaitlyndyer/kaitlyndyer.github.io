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
      icon: "🧭",
      concepts: [
        { id: "paradigms", title: "OO vs. Functional Design", icon: "🔀", color: "#ff7a59", lectures: [1] },
        { id: "design-goals", title: "Goals of Design", icon: "🎯", color: "#f25c8a", lectures: [4] },
        { id: "program-understanding", title: "Program Understanding", icon: "🔍", color: "#e0567c", lectures: [5] },
      ],
    },
    {
      id: "oo",
      title: "Object-Oriented Java",
      icon: "🧱",
      concepts: [
        { id: "interfaces", title: "Interfaces & Abstract Classes", icon: "🧩", color: "#7c5cff", lectures: [1, 2, 6] },
        { id: "inheritance", title: "Inheritance & Access Modifiers", icon: "🧬", color: "#5b6cff", lectures: [2] },
        { id: "polymorphism", title: "Polymorphism & Dynamic Dispatch", icon: "🎭", color: "#3f8cff", lectures: [2, 3] },
      ],
    },
    {
      id: "language",
      title: "The Java Language",
      icon: "☕",
      concepts: [
        { id: "types-generics", title: "Types, Generics & Pass-by-Value", icon: "🏷️", color: "#11a8a0", lectures: [3] },
        { id: "exceptions", title: "Exceptions", icon: "🚨", color: "#ef6c3b", lectures: [2] },
        { id: "collections", title: "Collections", icon: "📦", color: "#2fae6b", lectures: [3] },
        { id: "io", title: "Input & Output", icon: "📥", color: "#3aa8d8", lectures: [3] },
      ],
    },
    {
      id: "specs",
      title: "Specs & Contracts",
      icon: "📜",
      concepts: [
        { id: "specifications", title: "Writing Specifications", icon: "✍️", color: "#d99a00", lectures: [6] },
        { id: "nullness", title: "Nullness & JSpecify", icon: "🚫", color: "#c56a1a", lectures: [6] },
        { id: "contracts", title: "equals, hashCode & compareTo", icon: "🤝", color: "#b8862d", lectures: [6] },
      ],
    },
    {
      id: "tools",
      title: "Tools",
      icon: "🛠️",
      concepts: [
        { id: "tooling", title: "javac, JVM, Gradle & JUnit", icon: "⚙️", color: "#6b7a90", lectures: [1, 2] },
      ],
    },
  ],

  // Filled in by registerConcept().
  content: {},
};

window.registerConcept = function (concept) {
  window.STUDY.content[concept.id] = concept;
};
