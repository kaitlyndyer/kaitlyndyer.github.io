// Exam questions for Records & Pattern Matching (lecture 7). See ../../../course/exam.js for the format.
registerExam("concise-java", [
  {
    id: "trace-record-equals", type: "trace", lec: [7], sec: "records",
    q: "What does this print?",
    code: `record Point(int x, int y) {}

Point a = new Point(1, 2);
Point b = new Point(1, 2);
System.out.println(a.equals(b) + " " + (a == b));
System.out.println(a);`,
    out: { kind: "output", text: "true false\nPoint[x=1, y=2]" },
    explain: "Records generate <code>equals</code> that compares the fields (true), but <code>==</code> still compares references (two different objects). The generated <code>toString</code> looks like <code>Point[x=1, y=2]</code>.",
  },
  {
    id: "trace-record-setter", type: "trace", lec: [7], sec: "records",
    q: "What happens?",
    code: `record Reading(String room, int temp) {}

Reading r = new Reading("hall", 20);
r.temp = 22;
System.out.println(r.temp());`,
    out: { kind: "compile" },
    explain: "Record fields are <code>private final</code>: you can read them through the accessor <code>temp()</code>, but you can’t assign them. To “change” a record, make a new one.",
  },
  {
    id: "trace-compact-ctor", type: "trace", lec: [7], sec: "records-use",
    q: "What happens?",
    code: `record Percent(int value) {
    Percent {
        if (value < 0 || value > 100) {
            throw new IllegalArgumentException("bad: " + value);
        }
    }
}

Percent ok = new Percent(40);
Percent bad = new Percent(140);
System.out.println("made both");`,
    out: { kind: "exception" },
    explain: "The compact constructor runs for every <code>new Percent(…)</code>. 140 fails the check, so an <code>IllegalArgumentException</code> is thrown before the print.",
  },
  {
    id: "mc-record-not", type: "mc", lec: [7], sec: "records",
    q: "<code>public record Lamp(String name, int brightness) {}</code>. Which of these does Java <b>not</b> generate?",
    options: ["<code>name()</code> and <code>brightness()</code>", "<code>setBrightness(int)</code>", "<code>equals</code> and <code>hashCode</code> using both fields", "A constructor taking both values"],
    answer: 1,
    explain: "Records are immutable, so no setters. Accessors are named after the fields.",
  },
  {
    id: "mc-record-when", type: "mc", lec: [7], sec: "records-use",
    q: "Which situation is the <b>worst</b> fit for a record?",
    options: ["Returning a min and max from one method", "Passing a small bundle of data between two systems", "A <code>Fan</code> whose speed changes while the program runs", "An immutable <code>Point(x, y)</code>"],
    answer: 2,
    explain: "Records are immutable. Something whose state changes over time should be a regular class.",
  },
  {
    id: "mc-pattern-why", type: "mc", lec: [7], sec: "pattern",
    q: "Why is <code>if (obj instanceof DimmableLight other)</code> considered <b>safer</b> than checking with <code>instanceof</code> and then casting?",
    options: ["It runs faster", "The type you check and the type you bind can’t accidentally differ", "It catches NullPointerExceptions", "It works with primitives"],
    answer: 1,
    explain: "With a separate cast you could check one type and cast to another. Pattern matching does both in one step.",
  },
  {
    id: "mc-pattern-scope", type: "mc", lec: [7], sec: "scope",
    q: "In the code below, where can <code>dimmable</code> be used?",
    code: `if (device instanceof DimmableLight dimmable) {
    // (1)
} else if (device instanceof SwitchedLight switched) {
    // (2)
}
// (3)`,
    options: ["Only at (1)", "At (1) and (2)", "At (1), (2), and (3)", "Nowhere; it must be declared first"],
    answer: 0,
    explain: "A pattern variable is in scope only where the match is guaranteed: inside the block for that check.",
  },
  {
    id: "mc-record-accessor", type: "mc", lec: [7], sec: "records",
    q: "Given <code>record Temp(int kelvin) {}</code> and <code>Temp t = new Temp(2700);</code>, which expression returns 2700?",
    options: ["<code>t.getKelvin()</code>", "<code>t.kelvin()</code>", "<code>t.kelvin</code> from another class", "<code>Temp.kelvin(t)</code>"],
    answer: 1,
    explain: "Record accessors use the component name, with no <code>get</code> prefix. The field itself is private.",
  },
  {
    id: "fill-record", type: "fill", lec: [7], sec: "records",
    q: "Fill in the blanks to declare an immutable <code>Range</code> with a <code>min</code> and <code>max</code> in one line, then read its max.",
    code: `public [[1]] Range(int min, int max) {}

Range r = new Range(10, 90);
int top = r.[[2]]();`,
    blanks: [["record"], ["max"]],
    explain: "One line gives you the constructor, accessors <code>min()</code>/<code>max()</code>, equals, hashCode, and toString.",
  },
]);
