registerExam("contracts", [
  {
    id: "trace-eq", type: "trace", lec: [3, 6], sec: "equals",
    q: "What does this print?",
    code: `String a = new String("hi");
String b = new String("hi");
System.out.println(a == b);
System.out.println(a.equals(b));`,
    out: { kind: "output", text: "false\ntrue" },
    explain: "<code>==</code> on objects compares <b>references</b>: two <code>new</code> Strings are different objects. <code>equals</code> compares <b>contents</b>, which are the same.",
  },
  {
    id: "fill-equals", type: "fill", lec: [6], sec: "equals",
    q: "Fill in the blanks to finish <code>equals</code> and <code>hashCode</code> for <code>Book</code>, which has fields <code>String title</code> and <code>int pages</code>.",
    code: `@Override
public boolean equals(@Nullable Object obj) {
    if ([[1]] == obj) return true;
    if (!(obj [[2]] Book other)) return false;
    return this.title.[[3]](other.title)
        && this.pages == other.pages;
}

@Override
public int hashCode() {
    return [[4]](title, pages);
}`,
    blanks: [["this"], ["instanceof"], ["equals"], ["Objects.hash", "java.util.Objects.hash"]],
    explain: "Same shape as the lecture’s <code>DimmableLight</code>: shortcut on <code>this == obj</code>, check the type with <code>instanceof</code> (which also gives you <code>other</code>), compare object fields with <code>equals</code> and primitives with <code>==</code>, and hash <b>the same fields</b> with <code>Objects.hash</code>.",
  },
  {
    id: "write-equals", type: "write", lec: [6], sec: "equals",
    q: "Write <code>equals</code> and <code>hashCode</code> for this class. Two points are equal when both coordinates match.",
    code: `public final class Point {
    private final int x;
    private final int y;
    ...
}`,
    starter: "",
    rubric: [
      { text: "<code>@Override</code> on both methods", re: "@Override[\\s\\S]*@Override" },
      { text: "<code>equals</code> takes an <code>Object</code> (not a <code>Point</code>)", re: "equals\\s*\\(\\s*(@Nullable\\s+)?(final\\s+)?Object\\s+\\w+" },
      { text: "Shortcut: returns true when <code>this == obj</code>", re: "this\\s*==\\s*\\w+|\\w+\\s*==\\s*this" },
      { text: "Checks the type with <code>instanceof</code> (or <code>getClass()</code>) before using the fields", re: "instanceof\\s+Point|getClass\\s*\\(\\s*\\)" },
      { text: "Compares both <code>x</code> and <code>y</code>", re: "\\bx\\s*==[\\s\\S]*\\by\\s*==|\\by\\s*==[\\s\\S]*\\bx\\s*==" },
      { text: "<code>hashCode</code> uses the same fields, e.g. <code>Objects.hash(x, y)</code>", re: "Objects\\.hash\\s*\\(\\s*(this\\.)?[xy]\\s*,\\s*(this\\.)?[xy]\\s*\\)" },
    ],
    model: `@Override
public boolean equals(@Nullable Object obj) {
    if (this == obj) return true;
    if (!(obj instanceof Point other)) return false;
    return this.x == other.x && this.y == other.y;
}

@Override
public int hashCode() {
    return Objects.hash(x, y);
}`,
    explain: "Equal objects must have equal hash codes, so <code>hashCode</code> must use exactly the fields <code>equals</code> compares. Otherwise a <code>HashSet</code> can hold two “equal” points.",
  },
  {
    id: "tf-hash", type: "tf", lec: [6], sec: "hashcode",
    q: "True or false: if you override <code>equals</code> but not <code>hashCode</code>, a <code>HashSet</code> can end up containing two objects that are <code>equals</code>.",
    answer: true,
    explain: "<code>HashSet</code> uses <code>hashCode</code> to pick a bucket first. Without an override, two equal objects usually get different hash codes, land in different buckets, and are never compared with <code>equals</code>.",
  },
]);

// ---------- Batch 5 (lecture 6) ----------
registerExam("contracts", [
  // ----- toString -----
  {
    id: "trace-tostring", type: "trace", lec: [6], sec: "tostring",
    q: "What does this print?",
    code: `class Fan {
    private int speed = 2;
    @Override
    public String toString() {
        return "Fan(speed=" + speed + ")";
    }
}

Fan f = new Fan();
System.out.println("Made " + f);`,
    out: { kind: "output", text: "Made Fan(speed=2)" },
    explain: "String concatenation calls <code>toString()</code> automatically. Without the override you’d get something like <code>Fan@1b6d3586</code>.",
  },
  {
    id: "multi-tostring-auto", type: "multi", lec: [6], sec: "tostring",
    q: "Which of these call an object’s <code>toString()</code> <b>automatically</b>?",
    options: ["<code>System.out.println(light)</code>", "<code>\"Light: \" + light</code>", "<code>set.add(light)</code> on a <code>HashSet</code>", "<code>String.format(\"%s\", light)</code>"],
    answers: [0, 1, 3],
    explain: "println, printf/format, and string concatenation (and <code>assert</code> messages) use <code>toString</code>. <code>HashSet.add</code> uses <code>hashCode</code> and <code>equals</code> instead.",
  },
  {
    id: "write-tostring", type: "write", lec: [6], sec: "tostring",
    q: "<code>Thermostat</code> has fields <code>private final String name</code> and <code>private int temperature</code>. Override <code>toString</code> so a thermostat named hall at 21 prints as <code>Thermostat(name=hall, temperature=21)</code>.",
    rubric: [
      { text: "<code>@Override</code>", re: "@Override" },
      { text: "<code>public String toString()</code>", re: "public\\s+String\\s+toString\\s*\\(\\s*\\)" },
      { text: "Starts with <code>\"Thermostat(name=\"</code>", re: "\"Thermostat\\(name=" },
      { text: "Includes both <code>name</code> and <code>temperature</code>", re: "\\bname\\b[\\s\\S]*\\btemperature\\b" },
      { text: "Returns the string (doesn’t print it)", re: "return\\s+\"Thermostat\\(" },
    ],
    model: `@Override
public String toString() {
    return "Thermostat(name=" + name + ", temperature=" + temperature + ")";
}`,
    explain: "toString should be concise but informative: the class name and the fields a person would want to see. It returns the string; whoever calls it decides whether to print.",
  },
  // ----- equals & hashCode -----
  {
    id: "trace-list-contains", type: "trace", lec: [6], sec: "equals",
    q: "What does this print? (<code>Tag</code> does <b>not</b> override <code>equals</code>.)",
    code: `class Tag {
    private final String name;
    Tag(String name) { this.name = name; }
}

List<Tag> tags = new ArrayList<>();
tags.add(new Tag("red"));
System.out.println(tags.contains(new Tag("red")));`,
    out: { kind: "output", text: "false" },
    explain: "<code>contains</code> uses <code>equals</code>. Object’s default <code>equals</code> is reference equality, and the two <code>new Tag(\"red\")</code> objects are different objects.",
  },
  {
    id: "trace-hashset-points", type: "trace", lec: [6], sec: "hashcode",
    q: "What does this print? (<code>Point</code> overrides <code>equals</code> and <code>hashCode</code> correctly, using <code>x</code> and <code>y</code>.)",
    code: `Set<Point> pts = new HashSet<>();
pts.add(new Point(1, 2));
pts.add(new Point(1, 2));
pts.add(new Point(2, 1));
System.out.println(pts.size() + " " + pts.contains(new Point(2, 1)));`,
    out: { kind: "output", text: "2 true" },
    explain: "The second <code>(1, 2)</code> is equal to the first, so the set ignores it. <code>(2, 1)</code> is a different point. <code>contains</code> finds an equal object even though it’s a new one.",
  },
  {
    id: "bug-equals-overload", type: "bug", lec: [6], sec: "equals",
    q: "A <code>HashSet&lt;Point&gt;</code> keeps holding duplicate points. Which line is the bug, and what’s the fix?",
    lines: [
      "public boolean equals(Point other) {",
      "    return this.x == other.x && this.y == other.y;",
      "}",
      "",
      "@Override",
      "public int hashCode() {",
      "    return Objects.hash(x, y);",
      "}",
    ],
    answer: 0,
    fixes: ["Take <code>@Nullable Object obj</code>, check <code>instanceof Point</code>, then compare", "Make the method <code>final</code>", "Use <code>Objects.hash(y, x)</code>", "Compare with <code>equals</code> instead of <code>==</code>"],
    fix: 0,
    explain: "<code>equals(Point)</code> <b>overloads</b> rather than overrides <code>equals(Object)</code>, so <code>HashSet</code> still calls Object’s version. Writing <code>@Override</code> on it would have turned this into a compile error, which is exactly why the annotation is worth having.",
  },
  {
    id: "bug-hash-fields", type: "bug", lec: [6], sec: "hashcode",
    q: "Two lights that are <code>equals</code> sometimes end up twice in a <code>HashSet</code>. Which line breaks the contract, and how do you fix it?",
    lines: [
      "@Override",
      "public boolean equals(@Nullable Object obj) {",
      "    if (this == obj) return true;",
      "    if (!(obj instanceof DimmableLight other)) return false;",
      "    return color == other.color && brightness == other.brightness && on == other.on;",
      "}",
      "",
      "@Override",
      "public int hashCode() {",
      "    return Objects.hash(name, color, brightness, on);",
      "}",
    ],
    answer: 9,
    fixes: ["Hash exactly the fields <code>equals</code> compares: <code>Objects.hash(color, brightness, on)</code>", "Add <code>name</code> to <code>hashCode</code> twice", "Remove the <code>this == obj</code> check", "Return 0 from <code>equals</code>"],
    fix: 0,
    explain: "Equal objects must have equal hash codes. <code>equals</code> ignores <code>name</code>, but <code>hashCode</code> uses it, so two equal lights with different names can hash differently.",
  },
  {
    id: "parsons-fan-equals", type: "parsons", lec: [6], sec: "equals",
    q: "Build <code>equals</code> and <code>hashCode</code> for <code>Fan</code>: two fans are equal when their <code>speed</code> and <code>on</code> match.",
    lines: [
      "@Override",
      "public boolean equals(@Nullable Object obj) {",
      "    if (this == obj) return true;",
      "    if (!(obj instanceof Fan other)) return false;",
      "    return this.speed == other.speed && this.on == other.on;",
      "}",
      "@Override",
      "public int hashCode() {",
      "    return Objects.hash(speed, on);",
      "}",
    ],
    distractors: [
      { code: "public boolean equals(Fan obj) {", why: "That overloads equals instead of overriding equals(Object)." },
      { code: "    return Objects.hash(speed, on, name);", why: "hashCode must use the same fields as equals, and equals doesn’t compare name." },
    ],
    explain: "The recipe: shortcut on <code>this == obj</code>, type check with <code>instanceof</code>, compare the fields, then hash those same fields.",
  },
  {
    id: "multi-equals-rules", type: "multi", lec: [6], sec: "equals",
    q: "Which are part of the <code>equals</code> contract (for non-null references)?",
    options: ["Reflexive: <code>x.equals(x)</code>", "Symmetric: <code>x.equals(y)</code> ⇔ <code>y.equals(x)</code>", "Equal objects must have equal <code>toString()</code> output", "<code>x.equals(null)</code> returns false"],
    answers: [0, 1, 3],
    explain: "The full list: reflexive, symmetric, transitive, consistent, and <code>x.equals(null)</code> is false. Nothing ties <code>equals</code> to <code>toString</code>.",
  },
  {
    id: "tf-unequal-hash", type: "tf", lec: [6], sec: "hashcode",
    q: "True or false: two <b>unequal</b> objects must have different hash codes.",
    answer: false,
    explain: "Unequal objects <i>may</i> collide. Distinct hash codes just make hash tables faster. Only the other direction is required: equal ⇒ same hash code.",
  },
  {
    id: "design-cross-type", type: "design", lec: [6], sec: "equals",
    q: "Should a <code>DimmableLight</code> and a <code>TunableWhiteLight</code> with the same brightness and on-state be <code>equals</code>?",
    options: ["Yes, they look the same to the user", "No: equality across different types generally breaks symmetry or transitivity", "Only if both are on", "Yes, but only in a <code>HashSet</code>"],
    answer: 1,
    model: "No. If <code>DimmableLight.equals</code> accepted a <code>TunableWhiteLight</code>, the <code>TunableWhiteLight</code>’s own <code>equals</code> (which also checks color temperature) would say no, breaking <b>symmetry</b>. Or two tunable lights with different temperatures would both equal one dimmable light, breaking <b>transitivity</b>.",
    explain: "Keep equality within one type.",
  },
  // ----- Ordering -----
  {
    id: "trace-sort-two-ways", type: "trace", lec: [6], sec: "ordering",
    q: "What does this print?",
    code: `class Room implements Comparable<Room> {
    final String name;
    final int area;
    Room(String name, int area) { this.name = name; this.area = area; }
    public int compareTo(Room o) { return Integer.compare(area, o.area); }
    public String toString() { return name; }
}
class ByName implements Comparator<Room> {
    public int compare(Room a, Room b) { return a.name.compareTo(b.name); }
}

List<Room> rooms = new ArrayList<>(List.of(
    new Room("hall", 30), new Room("den", 12), new Room("loft", 20)));
Collections.sort(rooms);
System.out.println(rooms);
Collections.sort(rooms, new ByName());
System.out.println(rooms);`,
    out: { kind: "output", text: "[den, loft, hall]\n[den, hall, loft]" },
    explain: "<code>Collections.sort(list)</code> uses the natural order (<code>compareTo</code>, by area: 12, 20, 30). With a <code>Comparator</code>, it uses that order instead: alphabetical by name.",
  },
  {
    id: "trace-treeset-ties", type: "trace", lec: [3, 6], sec: "ordering",
    q: "Same <code>Room</code> class (natural order by <code>area</code>). What does this print?",
    code: `Set<Room> s = new TreeSet<>();
s.add(new Room("den", 12));
s.add(new Room("nook", 12));
s.add(new Room("hall", 30));
System.out.println(s);`,
    out: { kind: "output", text: "[den, hall]" },
    explain: "A <code>TreeSet</code> decides “duplicate” with <code>compareTo</code>, not <code>equals</code>. The nook compares as 0 against the den, so it’s dropped. That’s why this course requires <code>compareTo</code> to be consistent with <code>equals</code>.",
  },
  {
    id: "trace-compare-signs", type: "trace", lec: [6], sec: "ordering",
    q: "What does this print?",
    code: `System.out.println(Integer.compare(5, 3) > 0);
System.out.println("apple".compareTo("banana") < 0);
System.out.println(Integer.compare(4, 4));`,
    out: { kind: "output", text: "true\ntrue\n0" },
    explain: "compare/compareTo return a negative, zero, or positive number for less, equal, greater. 5 &gt; 3 → positive; “apple” comes before “banana” → negative; equal → 0.",
  },
  {
    id: "fill-compareto", type: "fill", lec: [6], sec: "ordering",
    q: "Fill in the blanks to give <code>Room</code> a natural ordering by area.",
    code: `public class Room implements [[1]]<Room> {
    private final int area;
    ...
    @Override
    public int [[2]](Room other) {
        return Integer.[[3]](this.area, other.area);
    }
}`,
    blanks: [["Comparable"], ["compareTo"], ["compare"]],
    explain: "<code>Comparable&lt;T&gt;</code> declares <code>compareTo(T)</code>. <code>Integer.compare</code> returns the right sign without the overflow risk of subtracting.",
  },
  {
    id: "fill-comparator", type: "fill", lec: [6], sec: "ordering",
    q: "Fill in the blanks to sort books by year without changing the <code>Book</code> class.",
    code: `class BookByYear implements [[1]]<Book> {
    @Override
    public int [[2]](Book a, Book b) {
        return Integer.compare(a.getYear(), b.getYear());
    }
}

Collections.sort(books, new [[3]]());`,
    blanks: [["Comparator"], ["compare"], ["BookByYear"]],
    explain: "A <code>Comparator</code> lives outside the class and has <code>compare(a, b)</code>. Pass one to <code>Collections.sort</code> to use that ordering.",
  },
  {
    id: "write-comparator-desc", type: "write", lec: [6], sec: "ordering",
    q: "Write a class <code>BrightestFirst</code> that implements <code>Comparator&lt;Light&gt;</code> and orders lights from <b>highest</b> to lowest <code>getBrightness()</code>.",
    rubric: [
      { text: "<code>class BrightestFirst implements Comparator&lt;Light&gt;</code>", re: "class\\s+BrightestFirst\\s+implements\\s+Comparator\\s*<\\s*Light\\s*>" },
      { text: "<code>public int compare(Light a, Light b)</code>", re: "public\\s+int\\s+compare\\s*\\(\\s*Light\\s+\\w+\\s*,\\s*Light\\s+\\w+\\s*\\)" },
      { text: "Uses <code>Integer.compare</code> on the brightness values", re: "Integer\\.compare\\s*\\([^;]*getBrightness" },
      { text: "Reversed: compares the <b>second</b> light’s brightness first", re: "compare\\s*\\(\\s*Light\\s+(\\w+)\\s*,\\s*Light\\s+(\\w+)\\s*\\)[\\s\\S]*Integer\\.compare\\s*\\(\\s*\\2\\.getBrightness\\s*\\(\\s*\\)\\s*,\\s*\\1\\.getBrightness" },
      { text: "<code>@Override</code>", re: "@Override" },
    ],
    model: `class BrightestFirst implements Comparator<Light> {
    @Override
    public int compare(Light a, Light b) {
        return Integer.compare(b.getBrightness(), a.getBrightness());
    }
}`,
    explain: "Swapping the arguments reverses the order. A comparator is the right tool here because “brightest first” is one of several reasonable orderings, not the natural one.",
  },
  {
    id: "design-comparator", type: "design", lec: [6], sec: "ordering",
    q: "The bookstore app shows books sorted by title on one page, by price on another, and by year on a third. How should you provide these orderings?",
    options: ["Implement <code>compareTo</code> three times in <code>Book</code>", "Make <code>Book</code> <code>Comparable</code> by price only", "Write three <code>Comparator</code> classes", "Sort by hand with loops on each page"],
    answer: 2,
    model: "<code>compareTo</code> can only be implemented once, and none of these is obviously “the” natural order. Separate <b>comparators</b> (by title, price, year) live outside the class, and each page passes the one it needs to <code>Collections.sort</code>.",
    explain: "Comparable = one obvious natural order. Comparator = several orderings, or a class you can’t change.",
  },
  {
    id: "mc-compareto-null", type: "mc", lec: [6], sec: "ordering",
    q: "According to the <code>Comparable</code> contract, what should <code>x.compareTo(null)</code> do?",
    options: ["Return 0", "Return a negative number", "Throw a <code>NullPointerException</code>", "Return false"],
    answer: 2,
    explain: "Unlike <code>equals</code> (which returns false for null), <code>compareTo</code> specifies exceptions: null → <code>NullPointerException</code>, an unexpected type → <code>ClassCastException</code>.",
  },
]);
