registerConcept({
  id: "contracts",
  oneLiner:
    "Every class inherits <code>toString</code>, <code>equals</code>, and <code>hashCode</code> from <code>Object</code>. Override them <b>following their contracts</b>, and use <code>Comparable</code>/<code>Comparator</code> for ordering.",

  related: ["collections", "nullness", "specifications"],

  summary: {
    keyPoints: [
      { lec: [6], html: "Every class extends <code>java.lang.Object</code>, so every object has <code>toString</code>, <code>equals</code>, and <code>hashCode</code>. The JDK and libraries call them implicitly." },
      { lec: [6], kind: "key", html: "<b>Always override <code>toString</code>.</b> The default (<code>DimmableLight@abdfd</code>) isn’t helpful." },
      { lec: [6], html: "<code>equals</code> must be an <b>equivalence relation</b>: reflexive, symmetric, transitive, consistent, and <code>x.equals(null)</code> is false." },
      { lec: [6], kind: "key", html: "<b>Override <code>equals</code> ⇒ override <code>hashCode</code>.</b> Equal objects must have equal hash codes." },
      { lec: [6], html: "<code>Comparable.compareTo</code> defines one <b>natural ordering</b> inside the class. <code>Comparator.compare</code> defines extra orderings outside it." },
      { lec: [6], kind: "key", html: "In this course, <code>compareTo</code> must be <b>consistent with equals</b>: <code>x.equals(y)</code> ⇒ <code>x.compareTo(y) == 0</code>." },
    ],
    compare: {
      head: ["Method", "Contract", "Tips"],
      rows: [
        ["<code>toString</code>", "A concise, informative text version of the object. Not guaranteed stable.", "<i data-icon=\"key\"></i> Always override."],
        ["<code>equals</code>", "Reflexive, symmetric, transitive, consistent; <code>equals(null)</code> is false", "<code>==</code> check → <code>instanceof</code> check → compare fields. Parameter is <code>@Nullable Object</code>."],
        ["<code>hashCode</code>", "Equal objects → same hash; consistent within one run", "<i data-icon=\"key\"></i> Override with <code>equals</code>. <code>Objects.hash(...)</code> works."],
        ["<code>compareTo</code>", "Negative / 0 / positive; reversible; transitive; throws on <code>null</code> or wrong type", "One natural order, inside the class. Consistent with <code>equals</code> (required here)."],
        ["<code>compare</code>", "Same return meaning as <code>compareTo</code>", "Many orders, written outside the class."],
      ],
    },
  },

  details: [
    {
      id: "object",
      title: "“Default specifications” of every class",
      lec: [6],
      html: `
        <p>Every class extends <code>java.lang.Object</code>, directly or transitively, so all code can assume every object has <code>Object</code>’s methods. Three are frequently worth overriding: <code>toString</code>, <code>equals</code>, and <code>hashCode</code>. They’re called explicitly by our code and implicitly by the JDK and libraries (for example, <code>HashSet</code> calls <code>hashCode</code> and <code>equals</code>).</p>`,
    },
    {
      id: "tostring",
      title: "toString",
      lec: [6],
      html: `
        <ul>
          <li><b>Contract:</b> a string that “textually represents” the object. Concise but informative, easy for a person to read, and <b>not necessarily stable</b> over time or across JVM runs.</li>
          <li><b>Default:</b> class name + hash code, like <code>DimmableLight@abdfd</code>.</li>
          <li>Called automatically by <code>println</code>, <code>printf</code>, string concatenation, and <code>assert</code>.</li>
          <li>Better: <code>DimmableLight(color=2700K, brightness=100, on=true)</code>.</li>
        </ul>
        <p><b>Sidebar on generality:</b> the “not stable” sentence was added in <b>Java 17</b>. Earlier specs implied a stable string, but some implementations weren’t stable, and that caused bugs.</p>`,
    },
    {
      id: "equals",
      title: "equals",
      lec: [6],
      html: `
        <p><code>equals</code> compares objects (like Python’s <code>__eq__</code>) and is used by <code>Set</code>, <code>List.contains</code>, and more. <code>Object</code>’s default is <b>reference equality</b>, which is true only for the very same object.</p>
        <p>It must be an <b>equivalence relation</b> on non-null references:</p>
        <ul>
          <li><b>Reflexive:</b> <code>x.equals(x)</code></li>
          <li><b>Symmetric:</b> <code>x.equals(y)</code> ⇔ <code>y.equals(x)</code></li>
          <li><b>Transitive:</b> <code>x.equals(y)</code> and <code>y.equals(z)</code> ⇒ <code>x.equals(z)</code></li>
          <li><b>Consistent:</b> same result as long as the compared fields don’t change</li>
          <li><code>x.equals(null)</code> is <b>false</b></li>
        </ul>
        <p><b>Recipe:</b> (1) <code>==</code> check against <code>this</code> → <code>true</code> (an optimization); (2) <code>instanceof</code> check → <code>false</code> if wrong type; (3) cast and compare the fields you care about.</p>
        <p class="callout warn">Don’t make objects of different types equal (e.g., a <code>TunableWhiteLight</code> and a <code>DimmableLight</code>). It generally breaks symmetry or transitivity. And in a <code>@NullMarked</code> package, the parameter must be <code>@Nullable</code> (NullAway reports an error otherwise).</p>`,
    },
    {
      id: "hashcode",
      title: "hashCode",
      lec: [6],
      html: `
        <p>In Java, all objects have <code>hashCode</code> (unlike Python’s <code>__hash__</code>). <code>HashMap</code> and <code>HashSet</code> depend on it.</p>
        <p><b>Contract:</b> consistent within one execution if the equality fields don’t change; <b>equal objects ⇒ same hash code</b>; unequal objects <i>may</i> collide, but distinct values improve hash-table performance.</p>
        <p><b>Recipe</b> (good hashes are fast and spread out unequal objects):</p>
        <ol>
          <li>Declare <code>int result</code>, initialized to the hash of the first equality field.</li>
          <li>Compute a hash for each other field that affects equality.</li>
          <li>Combine them with a bitwise/arithmetic step, or just use <code>Objects.hash(...)</code>.</li>
          <li>Return <code>result</code>. (See <i>Effective Java</i> for details.)</li>
        </ol>`,
    },
    {
      id: "ordering",
      title: "Ordering: Comparable and Comparator",
      lec: [6],
      html: `
        <p>Sorting and finding the smallest/largest element need an ordering. Unlike equality, ordering doesn’t make sense for every object (strings: yes; devices: usually not), so it isn’t a default spec of every class.</p>
        <p><b><code>Comparable.compareTo</code></b>: implement it when there’s an obvious <b>natural ordering</b>. It returns negative, zero, or positive (less, equal, greater) and must be:</p>
        <ul>
          <li><b>Reversible:</b> <code>x.compareTo(y) &gt; 0</code> ⇒ <code>y.compareTo(x) &lt; 0</code> (and exceptions behave symmetrically too)</li>
          <li><b>Transitive:</b> <code>x &gt; y</code> and <code>y &gt; z</code> ⇒ <code>x &gt; z</code></li>
          <li><code>x.compareTo(y) == 0</code> ⇒ <code>x</code> and <code>y</code> compare the same way against any <code>z</code></li>
        </ul>
        <p>Unlike <code>equals</code>, it specifies exceptions: a <code>null</code> argument → <code>NullPointerException</code>; an unexpected type → <code>ClassCastException</code>. <b>Consistent with equals</b> isn’t required by Java, but it’s a good idea and <b>required in this course</b>.</p>
        <p><b><code>Comparator.compare</code></b>: use it when a class doesn’t implement <code>Comparable</code> (and changing it is risky), or when there are several viable orderings, like books by title, year, or price. <code>compareTo</code> can only be implemented once; comparators live <b>outside</b> the class.</p>
        <p>APIs that use orderings: <code>Collections.sort(list)</code> (natural order), <code>Collections.sort(list, comparator)</code>, and <code>TreeSet</code>/<code>TreeMap</code>.</p>`,
    },
  ],

  code: [
    {
      title: "equals and hashCode, done right",
      lec: [6],
      code: `@Override
public boolean equals(@Nullable Object obj) {
    if (this == obj) return true;
    if (!(obj instanceof DimmableLight other)) return false;
    return this.color == other.color
        && this.brightness == other.brightness
        && this.on == other.on;
}

@Override
public int hashCode() {
    return Objects.hash(color, brightness, on);   // same fields as equals
}`,
    },
    {
      title: "A helpful toString",
      lec: [6],
      note: "Illustrative implementation of the lecture’s “better” output.",
      code: `@Override
public String toString() {
    return "DimmableLight(color=" + color + "K, brightness=" + brightness
        + ", on=" + on + ")";
}

System.out.println("Created new light: " + light);
// Created new light: DimmableLight(color=2700K, brightness=100, on=true)`,
    },
    {
      title: "Several orderings with Comparator",
      lec: [6],
      note: "The class names are from the lecture; the method body is an illustration.",
      code: `class BookComparatorByTitle implements Comparator<Book> { ... }
class BookComparatorByPrice implements Comparator<Book> { ... }

class BookComparatorByYear implements Comparator<Book> {
    @Override
    public int compare(Book a, Book b) {
        return Integer.compare(a.getYear(), b.getYear());
    }
}

Collections.sort(books);                              // natural order (Comparable)
Collections.sort(books, new BookComparatorByYear());  // by year`,
    },
  ],

  flashcards: [
    { front: "Default <code>toString</code> output", back: "Class name + hash code, like <code>DimmableLight@abdfd</code>. Always override it." },
    { front: "The 5 rules of <code>equals</code>", back: "Reflexive, symmetric, transitive, consistent, and <code>x.equals(null)</code> is false." },
    { front: "<code>equals</code> recipe", back: "1) <code>this == obj</code> → true. 2) <code>instanceof</code> check → false if wrong type. 3) Compare the fields." },
    { front: "If you override <code>equals</code>…", back: "…you <b>must</b> override <code>hashCode</code>. Equal objects need equal hash codes." },
    { front: "Can unequal objects have the same hash code?", back: "Yes (a collision), but distinct values give better hash-table performance." },
    { front: "<code>compareTo</code> return value", back: "Negative = less, 0 = equal, positive = greater." },
    { front: "Comparable vs. Comparator", back: "Comparable: one natural order, inside the class. Comparator: any number of orders, outside the class." },
    { front: "Consistent with equals", back: "<code>x.equals(y)</code> ⇒ <code>x.compareTo(y) == 0</code>. Required in this course." },
  ],

  quiz: [
    {
      type: "mc", lec: [6],
      q: "You overrode <code>equals</code> but not <code>hashCode</code>. What can go wrong?",
      options: ["Nothing", "Equal objects may get different hash codes, so <code>HashSet</code>/<code>HashMap</code> misbehave", "The code won’t compile", "<code>toString</code> stops working"],
      answer: 1,
      explain: "The contract requires equal objects to have equal hash codes. Hash-based collections rely on it to find things.",
    },
    {
      type: "bug", lec: [6],
      q: "Click the line that breaks the <code>equals</code> recipe.",
      lines: [
        "@Override",
        "public boolean equals(@Nullable Object obj) {",
        "    if (this == obj) return true;",
        "    DimmableLight other = (DimmableLight) obj;",
        "    return this.brightness == other.brightness;",
        "}",
      ],
      answer: 3,
      explain: "It casts without an <code>instanceof</code> check. Passing <code>null</code> or another type would misbehave instead of returning false.",
    },
    {
      type: "mc", lec: [6],
      q: "Why is the <code>equals</code> parameter marked <code>@Nullable</code>?",
      options: ["It’s optional decoration", "The contract says <code>x.equals(null)</code> returns false, so null is a valid input", "Because all Object parameters are nullable", "To make it faster"],
      answer: 1,
      explain: "In a <code>@NullMarked</code> package parameters default to non-null, so <code>equals</code> must explicitly allow null (NullAway reports an error otherwise).",
    },
    {
      type: "mc", lec: [6],
      q: "You want to sort books by title in one place and by price in another. What should you use?",
      options: ["Two <code>compareTo</code> methods in Book", "Two <code>Comparator</code> classes", "<code>equals</code>", "<code>hashCode</code>"],
      answer: 1,
      explain: "<code>compareTo</code> can only be implemented once. Comparators give you as many orderings as you need, outside the class.",
    },
    {
      type: "mc", lec: [6],
      q: "If <code>x.compareTo(y)</code> returns a positive number, what must <code>y.compareTo(x)</code> return?",
      options: ["A positive number", "Zero", "A negative number", "Anything"],
      answer: 2,
      explain: "That’s the reversibility rule.",
    },
    {
      type: "tf", lec: [6],
      q: "True or false: it’s fine for a <code>TunableWhiteLight</code> to be <code>equals</code> to a <code>DimmableLight</code> with the same brightness.",
      answer: false,
      explain: "Making different types equal generally breaks symmetry or transitivity.",
    },
    {
      type: "mc", lec: [6],
      q: "What does <code>Object</code>’s default <code>equals</code> check?",
      options: ["That all fields match", "Reference equality: whether it’s the very same object", "That the hash codes match", "That the toString outputs match"],
      answer: 1,
      explain: "By default, <code>equals</code> behaves like <code>==</code> for references.",
    },
  ],
});
