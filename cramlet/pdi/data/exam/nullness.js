// Exam questions for Nullness & JSpecify (lecture 6). See ../../../course/exam.js for the format.
registerExam("nullness", [
  {
    id: "trace-require-nonnull", type: "trace", lec: [6], sec: "libraries",
    q: "What happens?",
    code: `Map<String, String> owners = new HashMap<>();
owners.put("fan", "Sam");
String o = Objects.requireNonNull(owners.get("lamp"), "no owner");
System.out.println("owner " + o);`,
    out: { kind: "exception" },
    explain: "<code>get(\"lamp\")</code> returns null, so <code>requireNonNull</code> throws a <code>NullPointerException</code> right away. It fails fast, but this is exactly the case lecture says <b>not</b> to use it for: <code>Map.get</code> can legitimately return null, so handle that properly.",
  },
  {
    id: "design-nullmarked", type: "design", lec: [6], sec: "setup",
    q: "You’re starting a brand-new project and using JSpecify. What’s the recommended setup?",
    options: ["Put <code>@NonNull</code> on every parameter and field", "Mark the package <code>@NullMarked</code> and annotate only nullable types with <code>@Nullable</code>", "Don’t annotate anything; check for null everywhere", "Annotate only the public methods"],
    answer: 1,
    model: "<code>@NullMarked</code> in <code>package-info.java</code> makes everything non-null by default, so you only write <code>@Nullable</code> where null is truly allowed. Fewer annotations, and the nullable spots stand out. (Marking <code>@NonNull</code> incrementally is the approach for legacy code.)",
    explain: "Non-null by default; nullable is the visible exception.",
  },
  {
    id: "design-map-get", type: "design", lec: [6], sec: "libraries",
    q: "The checker warns that <code>scenes.get(name)</code> might be null. A teammate wraps it in <code>Objects.requireNonNull(…)</code> to silence the warning. Good idea?",
    options: ["Yes, that’s what requireNonNull is for", "No: <code>Map.get</code> really can return null for a missing key, so handle that case (for example, throw a clear exception or use a default)", "Yes, but only in tests", "No, use <code>@SuppressWarnings</code> instead"],
    answer: 1,
    model: "<code>requireNonNull</code> is for values you <b>know</b> are non-null but the checker can’t see (like <code>List.of(…)</code>). A missing key is a real, expected case, so write code that handles it, rather than hiding it behind an assertion that crashes.",
    explain: "Don’t use it to silence warnings you don’t understand.",
  },
  {
    id: "multi-require-ok", type: "multi", lec: [6], sec: "libraries",
    q: "In which cases is <code>Objects.requireNonNull(…)</code> an appropriate way to satisfy the null checker?",
    options: ["Wrapping <code>List.of(name)</code>", "Wrapping <code>map.get(key)</code>", "Wrapping a library call whose docs guarantee it never returns null", "Wrapping <code>Set.of(a, b)</code>"],
    answers: [0, 2, 3],
    explain: "Use it when the docs guarantee non-null but the library isn’t annotated. <code>Map.get</code> can legitimately return null.",
  },
  {
    id: "mc-equals-nullable", type: "mc", lec: [6], sec: "setup",
    q: "In a <code>@NullMarked</code> package, why is <code>equals</code> declared as <code>equals(@Nullable Object obj)</code>?",
    options: ["Because the contract says <code>x.equals(null)</code> returns false, so null is a valid argument", "Because <code>@Nullable</code> makes it faster", "Because <code>Object</code> can’t be non-null", "It isn’t needed; it’s just style"],
    answer: 0,
    explain: "Null is a legal input to <code>equals</code>. Without <code>@Nullable</code>, the checker (NullAway) reports an error, because Object’s own spec allows null.",
  },
  {
    id: "fill-nullmarked", type: "fill", lec: [6], sec: "setup",
    q: "Fill in the annotations: everything in the package is non-null by default, except <code>prefix</code>, which may be null.",
    code: `// package-info.java
@[[1]]
package edu.neu.cs3100.lights;

// Formatter.java
public String format(@[[2]] String prefix, String value) { ... }`,
    blanks: [["NullMarked"], ["Nullable"]],
    explain: "<code>@NullMarked</code> on the package sets the default. <code>@Nullable</code> marks the exceptions.",
  },
  {
    id: "tf-nonnull-standard", type: "tf", lec: [6], sec: "jspecify",
    q: "True or false: <code>@NonNull</code> is a standard part of Java, enforced by <code>javac</code>.",
    answer: false,
    explain: "A proposal to standardize it was rejected, and several competing definitions exist. That’s why a coalition (Google, JetBrains, Microsoft, Uber, Oracle…) created JSpecify, and why checking is done by separate tools.",
  },
  {
    id: "mc-null-when", type: "mc", lec: [6], sec: "problem",
    q: "Without annotations, when do you find out that a reference parameter was unexpectedly null?",
    options: ["At compile time", "Only at runtime, as a <code>NullPointerException</code>", "When Javadoc is generated", "Never; Java forbids null parameters"],
    answer: 1,
    explain: "Any reference can be null at runtime. Nullness annotations plus a checker move that error to compile time.",
  },
]);

// ---------- Batch 6 (exam-style multiple choice) ----------
registerExam("nullness", [
  {
    id: "mc6-nullable-mark", type: "mc", lec: [6], sec: "setup",
    q: "In a <code>@NullMarked</code> package, a parameter <code>String nickname</code> is allowed to be null. What should you write?",
    options: ["Nothing; everything may be null", "<code>@Nullable String nickname</code>", "<code>@NonNull String nickname</code>", "<code>final String nickname</code>"],
    answer: 1,
    explain: "@NullMarked makes everything non-null by default, so only nullable types need annotating.",
  },
]);
