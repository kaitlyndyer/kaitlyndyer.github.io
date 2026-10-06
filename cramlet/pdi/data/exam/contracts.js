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
    q: "Write <code>equals</code> and <code>hashCode</code> for this class. Two points are equal when both coordinates match.<pre class=\"mini\">public final class Point {\n    private final int x;\n    private final int y;\n    ...\n}</pre>",
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
