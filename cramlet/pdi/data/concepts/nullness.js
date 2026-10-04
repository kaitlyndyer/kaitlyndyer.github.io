registerConcept({
  id: "nullness",
  oneLiner:
    "Any reference can be <code>null</code> at runtime. Mark the package <code>@NullMarked</code> so everything is <b>non-null by default</b>, then label the exceptions with <code>@Nullable</code>.",

  related: ["specifications", "contracts", "types-generics"],

  summary: {
    keyPoints: [
      { lec: [6], html: "A common, bug-prone assumption is that parameters are non-null, but <b>any reference-type value can be <code>null</code></b> at runtime." },
      { lec: [6], html: "<b>Type annotations</b> (added in Java 8, 2014) let a checker catch nullness errors at <b>compile time</b>." },
      { lec: [6], html: "<code>@NonNull</code> was never standardized, so a coalition (Google, JetBrains, Microsoft, Uber, Oracle…) proposed <b>JSpecify</b>. <b>This class uses JSpecify.</b>" },
      { lec: [6], html: "Setup: mark the package <code>@NullMarked</code> in <code>package-info.java</code>, then annotate only the nullable things with <code>@Nullable</code>." },
      { lec: [6], html: "For values you <i>know</i> are non-null but the checker can’t tell (like <code>List.of()</code>), use <code>Objects.requireNonNull(...)</code>." },
      { lec: [6], kind: "warn", html: "Don’t use <code>requireNonNull</code> to silence warnings you don’t understand, or on things that really can be null, like <code>Map.get()</code>." },
    ],
    compare: {
      head: ["Situation", "What to do"],
      rows: [
        ["New project", "<code>@NullMarked</code> on the package; <code>@Nullable</code> only where needed (fewer annotations overall)"],
        ["Migrating legacy code", "Assume nullable, and add <code>@NonNull</code> incrementally"],
        ["Unannotated library you <b>know</b> returns non-null", "<code>Objects.requireNonNull(...)</code>"],
        ["Method that <b>can</b> return null (e.g., <code>Map.get</code>)", "Handle <code>null</code> properly with an explicit check"],
      ],
    },
  },

  details: [
    {
      id: "problem",
      title: "The nullness problem",
      lec: [6],
      html: `
        <p>Assuming parameters are non-null is common and bug-prone. In Java, any reference-type parameter or field can be <code>null</code> at runtime, and the error only shows up as a <code>NullPointerException</code> when the code runs.</p>
        <p><b>Type annotations</b>, developed by University of Washington researchers and added in Java 8 (2014), let tools catch these errors at <b>compile time</b>. The catch: you need to annotate all parameters and fields, which is easier in new codebases.</p>`,
    },
    {
      id: "jspecify",
      title: "Why JSpecify?",
      lec: [6],
      html: `
        <p>Not all type annotations are enforced by the Java compiler. <code>@NonNull</code> isn’t standardized (a proposal to add it was rejected), and several competing definitions exist.</p>
        <p>A coalition including Google, JetBrains, Microsoft, Uber, and Oracle proposed <b>JSpecify</b>, and <b>this class uses JSpecify annotations</b>. (Active research continues, such as annotating whether a type is immutable.)</p>`,
    },
    {
      id: "setup",
      title: "Suggested usage",
      lec: [6],
      html: `
        <ol>
          <li>Mark the package <code>@NullMarked</code> in <code>package-info.java</code>. All types in the package are then <b>non-null by default</b>.</li>
          <li>Annotate nullable types with <code>@Nullable</code>, which makes nullability visible in the code.</li>
        </ol>
        <p>For new projects, prefer <code>@NullMarked</code>: you only annotate where something is nullable, so there are fewer annotations overall. For legacy code, the alternative is to assume nullable and mark <code>@NonNull</code> incrementally.</p>
        <p class="callout tip">This is why <code>equals(@Nullable Object obj)</code> needs <code>@Nullable</code>: its contract says <code>x.equals(null)</code> must return false, so <code>null</code> is a valid input.</p>`,
    },
    {
      id: "libraries",
      title: "Working with unannotated libraries",
      lec: [6],
      html: `
        <p>Many libraries, even parts of the JDK, aren’t annotated, so the checker treats their results as <b>unknown nullness</b>. <code>List.of()</code> never returns null (its docs say so), but the checker can’t know that and warns.</p>
        <p><b>Two options:</b></p>
        <ol>
          <li>Check for null explicitly. Unnecessary, but it satisfies the checker.</li>
          <li><b>Preferred:</b> <code>Objects.requireNonNull(...)</code>. It tells the checker “this is non-null,” documents your reasoning, and <b>fails fast</b> at runtime if you were wrong.</li>
        </ol>
        <p><b>Use it for:</b> <code>List.of()</code>, <code>Set.of()</code>, <code>Map.of()</code>; library methods whose docs guarantee non-null; values from unannotated third-party libraries.</p>
        <p class="callout warn"><b>Don’t use it</b> to silence warnings you don’t understand, or for methods like <code>Map.get()</code> that can legitimately return null. Handle null properly there.</p>`,
    },
  ],

  code: [
    {
      title: "Marking a package @NullMarked",
      lec: [6],
      note: "This goes in <code>package-info.java</code>.",
      code: `@NullMarked
package edu.neu.cs3100.myproject;

import org.jspecify.annotations.NullMarked;`,
    },
    {
      title: "Only annotate what’s nullable",
      lec: [6],
      code: `// In a @NullMarked package, arr is assumed non-null
public int sum(int[] arr) { ... }

// Explicitly mark nullable parameters
public String format(@Nullable String prefix, String value) { ... }`,
    },
    {
      title: "Unannotated libraries",
      lec: [6],
      code: `String name = "Alice";
List<String> names = List.of(name);   // checker: might this be null?
System.out.println(names.size());     // Warning: names might be null

// Option 1: explicit check (unnecessary, but satisfies the checker)
if (names != null) { System.out.println(names.size()); }

// Option 2: assert non-null and document why
List<String> safeNames = Objects.requireNonNull(List.of(name));
System.out.println(safeNames.size()); // No warning`,
    },
  ],

  flashcards: [
    { front: "<code>@NullMarked</code>", back: "Package-level annotation: every type in the package is <b>non-null by default</b>." },
    { front: "<code>@Nullable</code>", back: "Marks a specific type as allowed to be <code>null</code>." },
    { front: "JSpecify", back: "The standard set of nullness annotations proposed by a coalition of companies. Used in this class." },
    { front: "<code>Objects.requireNonNull(x)</code>", back: "Tells the checker <code>x</code> is non-null, documents why, and fails fast at runtime if it isn’t." },
    { front: "When should you NOT use <code>requireNonNull</code>?", back: "To silence warnings you don’t understand, or on values that can really be null, like <code>Map.get()</code>." },
    { front: "Why does <code>equals</code> take a <code>@Nullable Object</code>?", back: "Its contract says <code>x.equals(null)</code> returns false, so null is a valid argument." },
    { front: "When were type annotations added to Java?", back: "Java 8 (2014)." },
  ],

  quiz: [
    {
      type: "mc", lec: [6],
      q: "In a <code>@NullMarked</code> package, what does this signature tell you?",
      code: `public String format(@Nullable String prefix, String value)`,
      options: ["Both parameters may be null", "<code>prefix</code> may be null; <code>value</code> may not", "Neither may be null", "Only <code>value</code> may be null"],
      answer: 1,
      explain: "Everything is non-null by default. Only the <code>@Nullable</code> parameter may be null.",
    },
    {
      type: "mc", lec: [6],
      q: "The checker warns that <code>List.of(name)</code> might be null. What’s the recommended fix?",
      options: ["Ignore the warning", "<code>Objects.requireNonNull(List.of(name))</code>", "Mark the list <code>@Nullable</code>", "Catch NullPointerException"],
      answer: 1,
      explain: "<code>List.of</code> never returns null, but the library isn’t annotated. <code>requireNonNull</code> documents that and fails fast if wrong.",
    },
    {
      type: "bug", lec: [6],
      q: "Click the line that misuses <code>Objects.requireNonNull</code>.",
      lines: [
        "List<String> names = Objects.requireNonNull(List.of(\"a\", \"b\"));",
        "Set<Integer> ids = Objects.requireNonNull(Set.of(1, 2, 3));",
        "Light l = Objects.requireNonNull(lightsByRoom.get(\"attic\"));",
        "Map<String, Integer> m = Objects.requireNonNull(Map.of(\"x\", 1));",
      ],
      answer: 2,
      explain: "<code>Map.get</code> returns <code>null</code> when the key is missing. That’s a real possibility you need to handle, not silence.",
    },
    {
      type: "mc", lec: [6],
      q: "Where does <code>@NullMarked</code> usually go?",
      options: ["On every method", "In <code>package-info.java</code>, on the package", "In <code>build.gradle</code>", "On each field"],
      answer: 1,
      explain: "Marking the package makes all types in it non-null by default.",
    },
    {
      type: "tf", lec: [6],
      q: "True or false: for a new project, assuming everything is nullable and adding <code>@NonNull</code> everywhere is the recommended approach.",
      answer: false,
      explain: "That’s the legacy-migration approach. For new projects, prefer <code>@NullMarked</code>, which needs fewer annotations.",
    },
  ],
});
