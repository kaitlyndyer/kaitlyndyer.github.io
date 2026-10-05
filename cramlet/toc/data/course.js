// Course structure: lectures, concept groups, and the concepts in each group.
// Concept content lives in data/concepts/<id>.js and registers itself with
// registerConcept(). A concept listed here without a content file shows as
// "coming soon".

window.STUDY = {
  course: {
    id: "toc",
    storeKey: "cramlet.toc.v1",
    title: "Theory of Computation",
    tagline: "What can a computer compute? Automata, regular expressions, and their limits, with machines you can run.",
  },

  lectures: {
    0: "Introduction & Math Background",
    1: "Finite Automata",
    2: "Nondeterminism & Closure",
    3: "Regular Expressions",
    4: "Non-Regular Languages",
  },

  groups: [
    {
      id: "foundations",
      title: "Foundations",
      icon: "compass",
      concepts: [
        { id: "languages", title: "Strings & Languages", icon: "venn", color: "#ff7a59", lectures: [0] },
        { id: "logic-proofs", title: "Logic & Proofs", icon: "scroll", color: "#e0567c", lectures: [0] },
        { id: "proof-practice", title: "Proof Practice", icon: "list-checks", color: "#c2569b", lectures: [0, 1, 4] },
      ],
    },
    {
      id: "automata",
      title: "Finite Automata",
      icon: "automaton",
      concepts: [
        { id: "dfa", title: "Deterministic Finite Automata", icon: "automaton", color: "#7c5cff", lectures: [1] },
        { id: "nfa", title: "Nondeterministic Finite Automata", icon: "arrows-split", color: "#5b6cff", lectures: [2] },
        { id: "nfa-to-dfa", title: "NFA → DFA (Subset Construction)", icon: "tree-structure", color: "#3f8cff", lectures: [2] },
        { id: "closure", title: "Closure Properties", icon: "puzzle-piece", color: "#3aa8d8", lectures: [1, 2] },
      ],
    },
    {
      id: "regex",
      title: "Regular Expressions",
      icon: "asterisk",
      concepts: [
        { id: "regex", title: "Regular Expressions", icon: "asterisk", color: "#11a8a0", lectures: [3] },
        { id: "regex-to-nfa", title: "Regex → NFA", icon: "code", color: "#2fae6b", lectures: [3] },
        { id: "dfa-to-regex", title: "DFA → Regex (GNFAs)", icon: "note-pencil", color: "#5fa83a", lectures: [3] },
      ],
    },
    {
      id: "limits",
      title: "Limits of Regular Languages",
      icon: "prohibit",
      concepts: [
        { id: "pumping", title: "The Pumping Lemma", icon: "arrow-clockwise", color: "#e08a00", lectures: [4] },
      ],
    },
  ],

  // Filled in by registerConcept().
  content: {},
};

window.registerConcept = function (concept) {
  window.STUDY.content[concept.id] = concept;
};
