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

// ---------- Batch 2 (lecture 3) ----------
registerExam("collections", [
  {
    id: "trace-treemap", type: "trace", lec: [3], sec: "maps",
    q: "What does this print?",
    code: `Map<String, Integer> rooms = new TreeMap<>();
rooms.put("kitchen", 2);
rooms.put("bath", 1);
rooms.put("kitchen", 3);
rooms.put("attic", 0);
System.out.println(rooms);`,
    out: { kind: "output", text: "{attic=0, bath=1, kitchen=3}" },
    explain: "Keys are unique, so the second <code>put(\"kitchen\", …)</code> replaces the old value. A <code>TreeMap</code> keeps keys sorted, so they print alphabetically.",
  },
  {
    id: "trace-linkedhashset", type: "trace", lec: [3], sec: "sets",
    q: "What does this print?",
    code: `Set<String> s = new LinkedHashSet<>();
s.add("fan");
s.add("light");
s.add("fan");
s.add("lock");
System.out.println(s + " " + s.size());`,
    out: { kind: "output", text: "[fan, light, lock] 3" },
    explain: "Adding a duplicate does nothing. A <code>LinkedHashSet</code> iterates in <b>insertion order</b>. (A plain <code>HashSet</code> has no guaranteed order, which is why it isn’t used here.)",
  },
  {
    id: "trace-remove-overload", type: "trace", lec: [3], sec: "lists",
    q: "What does this print?",
    code: `List<Integer> nums = new ArrayList<>(List.of(10, 20, 30));
nums.remove(1);
nums.remove(Integer.valueOf(10));
System.out.println(nums);`,
    out: { kind: "output", text: "[30]" },
    explain: "<code>remove</code> is overloaded. <code>remove(1)</code> takes an <code>int</code>, so it removes <b>index</b> 1 (the 20). <code>remove(Integer.valueOf(10))</code> takes an object, so it removes the <b>value</b> 10.",
  },
  {
    id: "trace-array-default", type: "trace", lec: [3], sec: "arrays",
    q: "What does this print?",
    code: `int[] levels = new int[3];
levels[2] = 7;
System.out.println(levels[0] + levels[2] + " " + levels.length);`,
    out: { kind: "output", text: "7 3" },
    explain: "A new <code>int</code> array is filled with 0s, so <code>0 + 7 = 7</code> (numbers add before the string joins in). The length is fixed at 3.",
  },
  {
    id: "bug-foreach-remove", type: "bug", lec: [3], sec: "api",
    q: "This throws a <code>ConcurrentModificationException</code>. Which line causes it, and how do you fix it?",
    lines: [
      "List<String> devices = new ArrayList<>(List.of(\"fan\", \"lamp\", \"lock\"));",
      "for (String d : devices) {",
      "    if (d.startsWith(\"f\")) {",
      "        devices.remove(d);",
      "    }",
      "}",
    ],
    answer: 3,
    fixes: ["Loop with an explicit <code>Iterator</code> and call <code>it.remove()</code>", "Use <code>devices.remove(0)</code> instead", "Change the list to a <code>LinkedList</code>", "Make the list <code>final</code>"],
    fix: 0,
    explain: "A for-each loop uses a hidden iterator. Changing the list behind its back breaks it. <code>Iterator.remove()</code> removes the current element safely. (<code>devices.removeIf(…)</code> also works.)",
  },
  {
    id: "fill-treemap", type: "fill", lec: [3], sec: "maps",
    q: "Fill in the blanks: map each room to its brightness, with rooms coming out <b>alphabetically</b>.",
    code: `Map<String, [[1]]> brightness = new [[2]]<>();
brightness.put("desk", 80);
brightness.put("attic", 20);
for (String room : brightness.[[3]]()) {
    System.out.println(room + " " + brightness.get(room));
}`,
    blanks: [["Integer"], ["TreeMap"], ["keySet"]],
    explain: "Values must be a reference type (<code>Integer</code>). A <code>TreeMap</code> keeps keys sorted, and <code>keySet()</code> gives you the keys to loop over.",
  },
  {
    id: "fill-iterator", type: "fill", lec: [3], sec: "api",
    q: "Fill in the blanks to safely remove every empty name while looping.",
    code: `Iterator<String> it = names.[[1]]();
while (it.[[2]]()) {
    String n = it.[[3]]();
    if (n.isEmpty()) {
        it.[[4]]();
    }
}`,
    blanks: [["iterator"], ["hasNext"], ["next"], ["remove"]],
    explain: "<code>iterator()</code> comes from <code>Iterable</code>. An <code>Iterator</code> has three methods: <code>hasNext()</code>, <code>next()</code>, and <code>remove()</code>, which removes the element <code>next()</code> just returned.",
  },
  {
    id: "parsons-unique-order", type: "parsons", lec: [3], sec: "sets",
    q: "Build a method that returns the rooms with duplicates removed, keeping the order they first appeared.",
    lines: [
      "public static List<String> uniqueInOrder(List<String> rooms) {",
      "    Set<String> seen = new LinkedHashSet<>();",
      "    for (String r : rooms) {",
      "        seen.add(r);",
      "    }",
      "    return new ArrayList<>(seen);",
      "}",
    ],
    distractors: [
      { code: "    Set<String> seen = new HashSet<>();", why: "A HashSet removes duplicates but doesn’t keep insertion order." },
      { code: "    return seen;", why: "seen is a Set, but the method promises a List. Copy it into a new ArrayList." },
    ],
    explain: "A set ignores duplicates for you, and <code>LinkedHashSet</code> remembers insertion order. Copying it into an <code>ArrayList</code> gives back a <code>List</code>.",
  },
  {
    id: "parsons-count-types", type: "parsons", lec: [3], sec: "maps",
    q: "Build a method that counts how many devices of each type there are (by <code>identify()</code>), with types in alphabetical order.",
    lines: [
      "public static Map<String, Integer> countTypes(List<IoTDevice> devices) {",
      "    Map<String, Integer> counts = new TreeMap<>();",
      "    for (IoTDevice d : devices) {",
      "        String type = d.identify();",
      "        counts.put(type, counts.getOrDefault(type, 0) + 1);",
      "    }",
      "    return counts;",
      "}",
    ],
    distractors: [
      { code: "        counts.put(type, counts.get(type) + 1);", why: "The first time a type appears, get returns null, and unboxing null throws a NullPointerException." },
      { code: "    Map<String, int> counts = new TreeMap<>();", why: "Type arguments can’t be primitives. Use Integer." },
    ],
    explain: "<code>getOrDefault(type, 0)</code> starts each new type at 0, and <code>put</code> overwrites the old count. <code>TreeMap</code> keeps the types sorted.",
  },
  {
    id: "design-event-log", type: "design", lec: [3], sec: "lists",
    q: "You’re logging device events in the order they happen. The same event can happen twice, and the UI often asks for “event #k”. Which structure fits best?",
    options: ["<code>TreeSet</code>", "<code>HashSet</code>", "<code>ArrayList</code>", "<code>TreeMap</code> keyed by event name"],
    answer: 2,
    model: "You need <b>order</b>, <b>duplicates</b>, and fast <b>access by index</b>: that’s a List, and <code>ArrayList</code>’s contiguous array makes <code>get(k)</code> fast. Sets would drop repeated events, and a map keyed by name would overwrite them.",
    explain: "Ask three questions: does order matter, are duplicates allowed, and how will you look things up?",
  },
  {
    id: "design-sorted-map", type: "design", lec: [3], sec: "maps",
    q: "You need to look up each device’s brightness by its name, and the settings page lists devices <b>alphabetically</b>. Which structure fits best?",
    options: ["<code>HashMap&lt;String, Integer&gt;</code>", "<code>TreeMap&lt;String, Integer&gt;</code>", "<code>ArrayList&lt;Integer&gt;</code>", "<code>LinkedHashSet&lt;String&gt;</code>"],
    answer: 1,
    model: "Lookup by name means a <b>Map</b>. Sorted output means a <code>TreeMap</code>: it keeps keys in order (balanced BST, O(log n) operations). A <code>HashMap</code> is a bit faster but has no order, so you’d have to sort every time.",
    explain: "TreeMap/TreeSet trade a little speed for keeping things sorted.",
  },
  {
    id: "mc-iterable", type: "mc", lec: [3], sec: "api",
    q: "Why can you use a for-each loop on <b>any</b> <code>Collection</code>?",
    options: ["Because <code>Collection</code> extends <code>Iterable</code>, which provides <code>iterator()</code>", "Because every collection is backed by an array", "Because <code>Collection</code> extends <code>Comparable</code>", "Because the compiler turns every collection into a <code>List</code>"],
    answer: 0,
    explain: "For-each works on anything <code>Iterable</code>. Behind the scenes it calls <code>iterator()</code>, then <code>hasNext()</code>/<code>next()</code>.",
  },
  {
    id: "write-count-above", type: "write", lec: [3], sec: "maps",
    q: "Write <code>public static int countAbove(Map&lt;String, Integer&gt; temps, int limit)</code>: it returns how many rooms have a temperature strictly above <code>limit</code>.",
    rubric: [
      { text: "Correct signature", re: "public\\s+static\\s+int\\s+countAbove\\s*\\(\\s*Map\\s*<\\s*String\\s*,\\s*Integer\\s*>\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)" },
      { text: "Starts a counter at 0", re: "int\\s+\\w+\\s*=\\s*0\\s*;" },
      { text: "Loops over the map’s <code>values()</code>, <code>keySet()</code>, or <code>entrySet()</code>", re: "\\.(values|keySet|entrySet)\\s*\\(\\s*\\)" },
      { text: "Uses a strict <code>&gt;</code> comparison", re: "if\\s*\\([^)]*(?<![-=>])>(?!=)" },
      { text: "Returns the count", re: "return\\s+\\w+\\s*;" },
    ],
    model: `public static int countAbove(Map<String, Integer> temps, int limit) {
    int count = 0;
    for (int t : temps.values()) {
        if (t > limit) {
            count++;
        }
    }
    return count;
}`,
    explain: "<code>values()</code> gives just the temperatures. Writing <code>int t</code> auto-unboxes each <code>Integer</code>.",
  },
]);
