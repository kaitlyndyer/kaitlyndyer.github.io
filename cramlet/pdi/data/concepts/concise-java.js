registerConcept({
  id: "concise-java",
  oneLiner:
    "Shorter code is often more readable. <b>Pattern matching for instanceof</b> and <b>records</b> say the same thing with far less boilerplate.",

  related: ["readable-code", "contracts", "information-hiding"],

  summary: {
    keyPoints: [
      { lec: [7], html: "<b>Brief = readable</b> is a useful (imperfect) rule. Java offers shortcuts that express the same logic in fewer lines." },
      { lec: [7], kind: "key", html: "<b>Pattern matching</b> (Java 16): <code>if (obj instanceof DimmableLight other)</code> checks the type and binds a variable in one step. No separate cast, so you can’t cast to the wrong type." },
      { lec: [7], html: "The pattern variable is <b>only in scope where the match is guaranteed</b>." },
      { lec: [7], kind: "key", html: "<b>Records</b>: <code>record Point(int x, int y) {}</code> gives a constructor, accessors <code>x()</code>/<code>y()</code>, correct <code>equals</code>/<code>hashCode</code>/<code>toString</code>, and <b>final fields</b>." },
      { lec: [7], kind: "warn", html: "Records do <b>not</b> provide setters: they’re immutable. Validate in a <b>compact constructor</b>, and add your own methods if needed." },
      { lec: [7], html: "Use records for data-transfer objects, return types that bundle values, and building immutable classes cheaply." },
    ],
  },

  details: [
    {
      id: "brief",
      title: "Brief = readable?",
      lec: [7],
      html: `
        <p>A useful hypothesis: shorter, more succinct code is easier to read. It isn’t always true, but most languages offer shortcuts for common logic, and Java has two good examples: <b>pattern matching for instanceof</b> and <b>records</b>.</p>`,
    },
    {
      id: "pattern",
      title: "Pattern matching for instanceof",
      lec: [7],
      html: `
        <p>The traditional <code>equals</code> checks the type, then casts in a <b>separate</b> step: <code>if (!(obj instanceof DimmableLight)) return false; DimmableLight other = (DimmableLight) obj;</code></p>
        <p>Since Java 16, <code>obj instanceof DimmableLight other</code> <b>checks and binds in one step</b>. It’s shorter, and it’s safer: with a separate cast you could accidentally cast to a different type than you checked.</p>
        <p>Pattern matching is a core feature of functional languages (Haskell, OCaml, F#), built into Rust and Swift (Kotlin has “smart casts”), and was added to Java later.</p>`,
    },
    {
      id: "scope",
      title: "Pattern variable scope",
      lec: [7],
      html: `
        <p>The pattern variable exists <b>only where the match is guaranteed</b>. In <code>if (device instanceof DimmableLight dimmable) { … } else if (device instanceof SwitchedLight switched) { … }</code>, <code>dimmable</code> is usable only in the first block and <code>switched</code> only in the second. After the whole <code>if</code>, neither exists. This makes it natural to handle different subtypes differently.</p>`,
    },
    {
      id: "records",
      title: "Records",
      lec: [7],
      html: `
        <p>A simple immutable class like <code>Point</code> needs private final fields, a constructor, accessors, <code>equals</code>, <code>hashCode</code>, and <code>toString</code>: 30+ lines of boilerplate. A record says it in one line: <code>public record Point(int x, int y) {}</code>.</p>
        <p>A record automatically provides:</p>
        <ul>
          <li>a constructor that initializes all fields</li>
          <li>an accessor for each field, named after it: <code>x()</code> and <code>y()</code> (not <code>getX()</code>)</li>
          <li>correct <code>equals</code>, <code>hashCode</code>, and <code>toString</code> (like <code>Point[x=1, y=2]</code>)</li>
          <li><b>immutability</b>: all fields are final, and there are <b>no setters</b></li>
        </ul>`,
    },
    {
      id: "records-use",
      title: "When to use records, and customizing them",
      lec: [7],
      html: `
        <p>Good fits: <b>data-transfer objects</b> (passing data between systems), <b>return types that bundle several values</b>, and enforcing immutability across many classes. It’s a classic example of generating boilerplate automatically: write a class in only as many lines as it needs.</p>
        <p>You can still customize a record: validate arguments in a <b>compact constructor</b> (no parameter list; the fields are assigned after it runs), and add your own methods.</p>`,
    },
  ],

  code: [
    {
      title: "equals with pattern matching",
      lec: [7],
      code: `@Override
public boolean equals(@Nullable Object obj) {
    if (this == obj) return true;
    if (obj instanceof DimmableLight other) {      // check + bind
        return this.color == other.color
            && this.brightness == other.brightness
            && this.on == other.on;
    }
    return false;
}`,
    },
    {
      title: "Pattern variables are scoped to where they’re valid",
      lec: [7],
      code: `public void adjustLight(IoTDevice device) {
    if (device instanceof DimmableLight dimmable) {
        dimmable.setBrightness(50);   // only dimmable is in scope
    } else if (device instanceof SwitchedLight switched) {
        switched.turnOn();            // only switched is in scope
    }
    // neither is in scope here
}`,
    },
    {
      title: "A record, with validation and a custom method",
      lec: [7],
      code: `public record ColorTemperature(int kelvin) {
    public ColorTemperature {             // compact constructor
        if (kelvin < 1000 || kelvin > 10000) {
            throw new IllegalArgumentException("Kelvin must be 1000–10000");
        }
    }

    public int toMired() { return 1000000 / kelvin; }
}

ColorTemperature warm = new ColorTemperature(2700);
warm.kelvin();     // 2700 (accessor named after the field)`,
    },
  ],

  flashcards: [
    { front: "Pattern matching for instanceof", back: "<code>obj instanceof T name</code>: checks the type and binds a variable in one step (Java 16)." },
    { front: "Why is pattern matching safer than check-then-cast?", back: "You can’t accidentally cast to a different type than the one you checked." },
    { front: "Where is a pattern variable in scope?", back: "Only where the match is guaranteed (e.g. inside that <code>if</code> block)." },
    { front: "What does a record provide automatically?", back: "Constructor, accessors (<code>x()</code>), equals, hashCode, toString, and final fields." },
    { front: "What does a record NOT provide?", back: "Setters. Records are immutable." },
    { front: "Accessor name for <code>record Point(int x, int y)</code>", back: "<code>x()</code> and <code>y()</code>, not <code>getX()</code>." },
    { front: "Compact constructor", back: "A record constructor without a parameter list, used for validation. Fields are assigned after it runs." },
    { front: "Good uses for records", back: "Data-transfer objects, bundling several return values, cheap immutable classes." },
  ],

  quiz: [
    {
      type: "mc", lec: [7],
      q: "Given <code>record Fan(String name, int speed) {}</code> and <code>Fan f = new Fan(\"attic\", 2);</code>, which line does <b>not</b> compile?",
      options: ["<code>String n = f.name();</code>", "<code>f.setSpeed(3);</code>", "<code>boolean same = f.equals(new Fan(\"attic\", 2));</code>", "<code>System.out.println(f);</code>"],
      answer: 1,
      explain: "Records are immutable: all fields are final, so there are no setters.",
    },
    {
      type: "mc", lec: [7],
      q: "What’s the main advantage of <code>if (obj instanceof Fan f)</code> over an <code>instanceof</code> check followed by a cast?",
      options: ["It runs on older Java versions", "It checks and binds in one step, so you can’t cast to the wrong type", "It works on primitives", "It makes <code>f</code> visible in the whole method"],
      answer: 1,
      explain: "Shorter and safer. <code>f</code> is only in scope where the match is guaranteed.",
    },
    {
      type: "mc", lec: [7],
      q: "Given <code>record Point(int x, int y) {}</code>, how do you read a point’s x value?",
      options: ["<code>p.getX()</code>", "<code>p.x()</code>", "<code>p.x</code> (it’s a public field)", "<code>Point.x(p)</code>"],
      answer: 1,
      explain: "Record accessors are named after the components: <code>x()</code>.",
    },
    {
      type: "mc", lec: [7],
      q: "Where should a record validate its constructor arguments?",
      options: ["In a setter", "In a compact constructor", "Records can’t validate", "In <code>toString</code>"],
      answer: 1,
      explain: "A compact constructor (no parameter list) runs before the fields are assigned, so it can throw on bad values.",
    },
    {
      type: "mc", lec: [7],
      q: "Which is the <b>best</b> fit for a record?",
      options: ["A light whose brightness changes over time", "A value bundling a min and max reading returned from one method", "A class with many setters", "A class that must be subclassed"],
      answer: 1,
      explain: "Records suit immutable data, like bundling several return values. They can’t be mutated or extended.",
    },
    {
      type: "tf", lec: [7],
      q: "True or false: in <code>if (d instanceof DimmableLight dl) { … }</code>, <code>dl</code> can still be used after the <code>if</code> statement ends.",
      answer: false,
      explain: "Here the pattern variable is scoped to where the match is guaranteed: inside that block.",
    },
  ],
});
