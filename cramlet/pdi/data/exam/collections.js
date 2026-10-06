registerExam("collections", [
  {
    id: "trace-treeset", type: "trace", lec: [3], sec: "sets",
    q: "What does this print?",
    code: `Set<String> fruits = new TreeSet<>();
fruits.add("pear");
fruits.add("apple");
fruits.add("fig");
fruits.add("apple");
System.out.println(fruits.size() + " " + fruits);`,
    out: { kind: "output", text: "3 [apple, fig, pear]" },
    explain: "A <code>Set</code> ignores the duplicate <code>\"apple\"</code>, so there are 3 elements. A <code>TreeSet</code> keeps them <b>sorted</b>, which for Strings is alphabetical.",
  },
  {
    id: "design-usernames", type: "design", lec: [3], sec: "sets",
    q: "You need to store usernames so that <b>no name appears twice</b>, and show them in <b>alphabetical order</b>. Which do you use?",
    options: ["<code>ArrayList&lt;String&gt;</code>", "<code>HashSet&lt;String&gt;</code>", "<code>TreeSet&lt;String&gt;</code>", "<code>LinkedHashSet&lt;String&gt;</code>"],
    answer: 2,
    model: "A <code>Set</code> rules out duplicates, and <code>TreeSet</code> keeps its elements sorted. <code>HashSet</code> has no useful order, <code>LinkedHashSet</code> keeps insertion order (not alphabetical), and a list allows duplicates.",
    explain: "Pick the interface for the behavior you need (<code>Set</code>: no duplicates), then the implementation for the extra property (<code>TreeSet</code>: sorted).",
  },
]);
