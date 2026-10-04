registerConcept({
  id: "collections",
  oneLiner:
    "Pick a data structure by its <b>rules</b>: a <b>List</b> keeps order and allows duplicates, a <b>Set</b> keeps unique elements, and a <b>Map</b> links unique keys to values.",

  related: ["types-generics", "contracts", "interfaces"],

  summary: {
    keyPoints: [
      { lec: [3], html: "<b>Arrays</b> are the most basic structure: fixed size, zero-indexed, stored contiguously for fast random access." },
      { lec: [3], html: "The <b>Collections API</b> (<code>java.util</code>) gives richer structures. <code>Collection&lt;E&gt;</code> has the shared operations: <code>add</code>, <code>remove</code>, <code>contains</code>, <code>size</code>." },
      { lec: [3], html: "<code>Collection</code> extends <code>Iterable</code>, so <b>every collection works in a for-each loop</b>." },
      { lec: [3], html: "<b>List:</b> ordered, duplicates allowed, indexed. <code>ArrayList</code> = fast random access; <code>LinkedList</code> = fast add/remove at the ends." },
      { lec: [3], html: "<b>Set:</b> unique elements, fast <code>contains</code>. <code>HashSet</code> (unordered), <code>LinkedHashSet</code> (insertion order), <code>TreeSet</code> (sorted)." },
      { lec: [3], html: "<b>Map:</b> unique key → value. <code>HashMap</code> and <code>TreeMap</code> have the same tradeoffs as <code>HashSet</code> and <code>TreeSet</code>." },
    ],
    compare: {
      head: ["Structure", "Rules", "Implementations"],
      rows: [
        ["<b>Array</b>", "Fixed size, zero-indexed, contiguous", "<code>int[]</code>, <code>IoTDevice[]</code>"],
        ["<b>List</b>", "Ordered, duplicates OK, indexed", "<code>ArrayList</code>: fast <code>get(i)</code>, resizes by copying<br><code>LinkedList</code>: fast add/remove at either end"],
        ["<b>Set</b>", "Unique elements, fast <code>contains</code>", "<code>HashSet</code>: unordered<br><code>LinkedHashSet</code>: insertion order<br><code>TreeSet</code>: sorted, O(log n)"],
        ["<b>Map</b>", "Unique key → value", "<code>HashMap</code>: unordered by key<br><code>TreeMap</code>: sorted by key"],
      ],
    },
  },

  details: [
    {
      id: "arrays",
      title: "Arrays",
      lec: [3],
      html: `
        <p>The most basic data structure: <b>fixed size</b> once created, <b>zero-indexed</b>, and stored <b>contiguously</b> in memory, which makes random access efficient. Beyond arrays, the Collections API in <code>java.util</code> provides richer structures.</p>`,
    },
    {
      id: "api",
      title: "The Collections API",
      lec: [3],
      html: `
        <ul>
          <li><code>Collection&lt;E&gt;</code>: operations shared by all collections: <code>add</code>, <code>remove</code>, <code>contains</code>, <code>size</code>, <code>isEmpty</code>.</li>
          <li><code>Collection</code> extends <code>Iterable&lt;E&gt;</code>, which provides <code>iterator()</code>. That’s what makes for-each loops work.</li>
          <li>An <code>Iterator&lt;E&gt;</code> has <code>hasNext()</code>, <code>next()</code>, and <code>remove()</code>.</li>
          <li>The two main sub-types of <code>Collection</code> are <code>List</code> and <code>Set</code>. <code>Map</code> is a separate hierarchy.</li>
        </ul>`,
    },
    {
      id: "lists",
      title: "Lists",
      lec: [3],
      html: `
        <p>An <b>ordered</b> collection that <b>may contain duplicates</b>. It adds indexed operations beyond <code>Collection</code>: <code>get(index)</code>, <code>add(index, element)</code>, <code>remove(index)</code>, <code>indexOf(o)</code>. New elements are appended by default, like Python lists.</p>
        <ul>
          <li><code>ArrayList</code>: backed by an array, so contiguous memory and <b>fast random access</b>. It resizes by copying into a new, larger array.</li>
          <li><code>LinkedList</code>: a doubly-linked list, so <b>fast insertion/removal at either end</b> (<code>addFirst</code>, <code>addLast</code>, <code>getFirst</code>, <code>getLast</code>), but more memory per element and no contiguous storage.</li>
        </ul>`,
    },
    {
      id: "sets",
      title: "Sets",
      lec: [3],
      html: `
        <p>An <b>unordered</b> collection of <b>unique</b> elements, like a mathematical set. Adding a duplicate has no effect. Sets are typically optimized for fast search (<code>contains</code>).</p>
        <ul>
          <li><code>SortedSet</code> retrieves contents in an imposed order. <code>NavigableSet</code> adds navigation, like “the largest item smaller than X.”</li>
          <li><code>HashSet</code>: a hash table based on <code>hashCode()</code>. Unordered.</li>
          <li><code>LinkedHashSet</code>: hash table + linked list. Iterates in <b>insertion order</b>.</li>
          <li><code>TreeSet</code>: a balanced binary search tree. Ordered and navigable, with <b>logarithmic</b> add/remove/search. Ordering comes from <code>Comparable</code> or a <code>Comparator</code>.</li>
        </ul>
        <p class="callout tip">Hash-based sets depend on <code>equals</code> and <code>hashCode</code> being implemented correctly (see <b>equals, hashCode &amp; compareTo</b>).</p>`,
    },
    {
      id: "maps",
      title: "Maps",
      lec: [3],
      html: `
        <p>Stores <b>key–value pairs</b>, where the key uniquely identifies the value. Real-world analogies: a dictionary (word → meaning) or a map (location → geographic data). Since keys can’t repeat, the key set behaves like a <code>Set</code>.</p>
        <ul>
          <li><code>TreeMap</code>: balanced BST ordered by key, with the same tradeoffs as <code>TreeSet</code>.</li>
          <li><code>HashMap</code>: hash table based on key hash values, with the same tradeoffs as <code>HashSet</code>.</li>
        </ul>`,
    },
  ],

  code: [
    {
      title: "The core interfaces",
      lec: [3],
      code: `Collection<E>   add(E e), remove(Object o), size(), isEmpty(), contains(Object o)
  List<E>       add(int index, E e), get(int index), remove(int index), indexOf(Object o)
  Set<E>        (no duplicates)
Iterable<E>     iterator()
Iterator<E>     hasNext(), next(), remove()`,
    },
    {
      title: "Using a List, a Set, and a Map",
      lec: [3],
      note: "An illustration combining the lecture’s structures (not copied from a slide).",
      code: `List<String> rooms = new ArrayList<>();
rooms.add("kitchen");
rooms.add("kitchen");              // duplicates allowed
String first = rooms.get(0);       // indexed access

Set<String> unique = new HashSet<>(rooms);
unique.contains("kitchen");        // true; only one copy stored

Map<String, IoTDevice> byName = new HashMap<>();
byName.put("hall", new Light("hall", 80));
IoTDevice d = byName.get("hall");  // look up by key

for (String r : rooms) {           // every Collection is Iterable
    System.out.println(r);
}`,
    },
  ],

  flashcards: [
    { front: "Array", back: "Fixed size, zero-indexed, contiguous memory, fast random access." },
    { front: "List", back: "Ordered, duplicates allowed, indexed operations (<code>get</code>, <code>add(i, e)</code>, <code>remove(i)</code>)." },
    { front: "<code>ArrayList</code> vs. <code>LinkedList</code>", back: "ArrayList: fast random access, resizes by copying. LinkedList: fast add/remove at either end, more memory per element." },
    { front: "Set", back: "Unique elements. Adding a duplicate has no effect. Fast <code>contains</code>." },
    { front: "<code>HashSet</code> / <code>LinkedHashSet</code> / <code>TreeSet</code>", back: "Unordered / insertion order / sorted (balanced BST, O(log n))." },
    { front: "Map", back: "Key → value pairs, keys unique. The key set behaves like a Set." },
    { front: "Why does every Collection work in a for-each loop?", back: "Because <code>Collection</code> extends <code>Iterable</code>, which provides <code>iterator()</code>." },
    { front: "<code>NavigableSet</code>", back: "A sorted set with navigation operations, like “largest item smaller than X.”" },
  ],

  quiz: [
    {
      type: "mc", lec: [3],
      q: "You need to store device names in the order they were added and quickly check whether a name exists. Which fits best?",
      options: ["<code>TreeSet</code>", "<code>HashSet</code>", "<code>LinkedHashSet</code>", "An array"],
      answer: 2,
      explain: "<code>LinkedHashSet</code> combines a hash table (fast <code>contains</code>) with a linked list that keeps <b>insertion order</b>.",
    },
    {
      type: "mc", lec: [3],
      q: "You call <code>get(i)</code> with random indexes thousands of times. Which List is the better choice?",
      options: ["<code>ArrayList</code>", "<code>LinkedList</code>", "They’re the same", "Neither supports get(i)"],
      answer: 0,
      explain: "<code>ArrayList</code> is backed by contiguous memory, so random access is fast.",
    },
    {
      type: "mc", lec: [3],
      q: "What happens when you add a duplicate element to a <code>Set</code>?",
      options: ["It throws an exception", "The set stores two copies", "Nothing. Adding a duplicate has no effect.", "It replaces the whole set"],
      answer: 2,
      explain: "Sets hold unique elements, so a duplicate add is simply ignored.",
    },
    {
      type: "mc", lec: [3],
      q: "Which structure keeps its elements <b>sorted</b> and supports “largest item smaller than X”?",
      options: ["<code>HashSet</code>", "<code>TreeSet</code>", "<code>ArrayList</code>", "<code>HashMap</code>"],
      answer: 1,
      explain: "<code>TreeSet</code> is a balanced BST: ordered and navigable.",
    },
    {
      type: "tf", lec: [3],
      q: "True or false: a Map can have two entries with the same key.",
      answer: false,
      explain: "Keys uniquely identify values, so the key set behaves like a Set.",
    },
    {
      type: "mc", lec: [3],
      q: "Why can you write <code>for (Light l : lights)</code> when <code>lights</code> is a <code>Set&lt;Light&gt;</code>?",
      options: ["Sets are secretly arrays", "<code>Collection</code> extends <code>Iterable</code>", "The compiler converts it to a List", "Only Lists support for-each"],
      answer: 1,
      explain: "Every collection is <code>Iterable</code>, and for-each uses its <code>iterator()</code>.",
    },
  ],
});
