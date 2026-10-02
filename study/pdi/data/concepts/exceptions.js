registerConcept({
  id: "exceptions",
  oneLiner:
    "Exceptions catch problems the compiler can’t, <b>at runtime</b>: <code>throw</code> when something is invalid, <code>catch</code> where you can handle it, and test both paths.",

  related: ["specifications", "tooling", "io"],

  summary: {
    keyPoints: [
      { lec: [2], html: "Some problems can’t be caught by the compiler: <code>new DimmableLight(\"Bedroom\", -10)</code> is nonsense, but <code>-10</code> is a valid <code>int</code>." },
      { lec: [2], html: "<code>throw new IllegalArgumentException(...)</code> aborts the method or constructor instead of returning." },
      { lec: [2], html: "Wrap risky calls in <code>try</code>/<code>catch</code>. If nothing is thrown, the <code>catch</code> block is skipped." },
      { lec: [2], html: "<b>Unchecked</b> exceptions (subclasses of <code>RuntimeException</code>) don’t have to be caught. <b>Checked</b> exceptions must be caught or declared, and the compiler enforces it." },
      { lec: [2], html: "<code>Error</code>s (like <code>OutOfMemoryError</code>) are usually fatal and detected by the JVM. Don’t throw them yourself." },
      { lec: [2], html: "For each possible error: <b>prevent</b> it if you can, else <b>recover</b> locally, else <b>declare and throw</b> an exception." },
    ],
    compare: {
      head: ["Kind", "Examples", "Must you catch or declare it?"],
      rows: [
        ["<b>Error</b>", "<code>OutOfMemoryError</code>, <code>StackOverflowError</code>", "No. Usually fatal; don’t throw these yourself."],
        ["<b>Unchecked</b> (<code>RuntimeException</code> and subclasses)", "<code>IllegalArgumentException</code>, <code>NullPointerException</code>, <code>ClassCastException</code>", "No"],
        ["<b>Checked</b> (all other <code>Exception</code>s)", "<code>FileNotFoundException</code>", "<b>Yes</b>, the compiler enforces it"],
      ],
    },
  },

  details: [
    {
      id: "why",
      title: "Why we need exceptions",
      lec: [2],
      html: `
        <p>A negative brightness is nonsensical, but the compiler can’t catch it because it’s just an <code>int</code>. We want the constructor to say “don’t pass me a negative number.”</p>
        <p>Exceptions let us catch problems like this <b>at runtime</b>: invalid input, impossible operations, missing files, and so on.</p>`,
    },
    {
      id: "throwing",
      title: "Throwing an exception",
      lec: [2],
      html: `
        <p>Check the input and <code>throw</code> if it’s invalid:</p>
        <ul>
          <li><b>Valid input:</b> the object is built normally.</li>
          <li><b>Invalid input:</b> the constructor aborts and throws instead of returning.</li>
        </ul>
        <p>Document it in the Javadoc with <code>@throws</code>, so callers know what to expect.</p>`,
    },
    {
      id: "catching",
      title: "Catching an exception",
      lec: [2],
      html: `
        <p>Wrap calls that might throw in <code>try</code>/<code>catch</code>. The <code>catch</code> block runs only if that exception type was thrown; otherwise it’s skipped.</p>
        <p>For cleanup that must always happen, there’s also <code>finally</code>, and for resources like files there’s <b>try-with-resources</b> (see <b>Input &amp; Output</b>).</p>`,
    },
    {
      id: "types",
      title: "Exception types in Java",
      lec: [2],
      html: `
        <p>All exceptions are instances of <code>Throwable</code>:</p>
        <ul>
          <li><code>Error</code>: usually fatal and detected by the JVM (<code>OutOfMemoryError</code>, <code>StackOverflowError</code>). Don’t throw these yourself.</li>
          <li><code>Exception</code>, which splits into:
            <ul>
              <li><b>unchecked</b>: subclasses of <code>RuntimeException</code>. Not required to be caught.</li>
              <li><b>checked</b>: everything else. Must be caught or declared, and the compiler enforces it.</li>
            </ul>
          </li>
        </ul>
        <p>This is different from Python, where <b>all</b> exceptions are unchecked.</p>`,
    },
    {
      id: "testing",
      title: "Testing methods that throw",
      lec: [2],
      html: `
        <ol>
          <li><code>try</code>/<code>catch</code>, and call <code>fail(...)</code> if the wrong thing happens.</li>
          <li><code>@Test(expected = IllegalArgumentException.class)</code> (the older JUnit 4 style).</li>
          <li><b>JUnit 5, most concise:</b> <code>assertThrows(ExceptionType.class, () -&gt; ...)</code>.</li>
        </ol>`,
    },
    {
      id: "recipe",
      title: "Recipe: writing a method with exceptions",
      lec: [2],
      html: `
        <ol>
          <li>Write its purpose (Javadoc) and signature.</li>
          <li>Implement the <b>happy path</b> first.</li>
          <li>Identify the possible errors.</li>
          <li>For each error: <b>prevent</b> it if you can → else <b>recover locally</b> if you can → else choose an exception type, <b>declare it, and throw it</b>.</li>
        </ol>`,
    },
  ],

  code: [
    {
      title: "Throwing on invalid input",
      lec: [2],
      code: `public DimmableLight(String name, int brightness) {
    super(name, 1);
    if ((brightness < MIN_BRIGHTNESS) || (brightness > MAX_BRIGHTNESS)) {
        throw new IllegalArgumentException(
            "Brightness must be between " + MIN_BRIGHTNESS +
            " and " + MAX_BRIGHTNESS);
    }
    this.brightness = brightness;
}`,
    },
    {
      title: "Catching it",
      lec: [2],
      code: `IoTDevice bedroomLight;
try {
    bedroomLight = new DimmableLight("Bedroom light", -10);
}
catch (IllegalArgumentException e) {
    // runs only if an IllegalArgumentException was thrown
}`,
    },
    {
      title: "Testing it with JUnit 5",
      lec: [2],
      note: "The lambda <code>() -&gt; ...</code> is the code that should throw.",
      code: `@Test
public void testInvalidBrightness() {
    assertThrows(IllegalArgumentException.class,
        () -> new DimmableLight("Bedroom light", -10));
}`,
    },
  ],

  flashcards: [
    { front: "Why use exceptions?", back: "To catch problems the compiler can’t (like invalid input) <b>at runtime</b>." },
    { front: "What does <code>throw</code> do in a constructor?", back: "Aborts it. The constructor throws instead of returning an object." },
    { front: "Unchecked exception", back: "A subclass of <code>RuntimeException</code>. You don’t have to catch or declare it." },
    { front: "Checked exception", back: "Any other <code>Exception</code>. It must be caught or declared, and the compiler enforces this." },
    { front: "<code>Error</code>", back: "Usually fatal and JVM-detected (<code>OutOfMemoryError</code>, <code>StackOverflowError</code>). Don’t throw it yourself." },
    { front: "Python vs. Java exceptions", back: "In Python, <b>all</b> exceptions are unchecked. Java has both checked and unchecked." },
    { front: "<code>assertThrows</code>", back: "JUnit 5’s concise way to test that code throws a given exception." },
    { front: "Prevent → recover → ?", back: "…→ <b>throw</b>. Declare and throw an exception only if you can’t prevent or recover." },
  ],

  quiz: [
    {
      type: "mc", lec: [2],
      q: "Which exception type is <b>checked</b>?",
      options: ["<code>IllegalArgumentException</code>", "<code>NullPointerException</code>", "<code>FileNotFoundException</code>", "<code>ClassCastException</code>"],
      answer: 2,
      explain: "The others extend <code>RuntimeException</code>, so they’re unchecked. <code>FileNotFoundException</code> must be caught or declared.",
    },
    {
      type: "mc", lec: [2],
      q: "What happens to the <code>catch</code> block if no exception is thrown?",
      options: ["It runs anyway", "It’s skipped", "It runs after the method returns", "The program crashes"],
      answer: 1,
      explain: "The <code>catch</code> only runs when a matching exception was thrown.",
    },
    {
      type: "mc", lec: [2],
      q: "Which is the most concise JUnit 5 way to test that a constructor throws?",
      options: ["<code>assertTrue(false)</code>", "<code>assertThrows(IllegalArgumentException.class, () -&gt; new DimmableLight(\"x\", -10))</code>", "<code>@Test(expected = ...)</code>", "Print the stack trace and look at it"],
      answer: 1,
      explain: "<code>assertThrows</code> is the JUnit 5 option. <code>@Test(expected = ...)</code> is the older JUnit 4 style.",
    },
    {
      type: "mc", lec: [2],
      q: "Your method finds a problem it can’t prevent but <i>can</i> fix itself. According to the recipe, what should it do?",
      options: ["Throw an exception anyway", "Recover locally", "Throw an Error", "Ignore it"],
      answer: 1,
      explain: "Prevent if you can, else recover locally if you can, and only then throw.",
    },
    {
      type: "tf", lec: [2],
      q: "True or false: you should throw <code>OutOfMemoryError</code> when your data structure gets too big.",
      answer: false,
      explain: "<code>Error</code>s are for fatal, JVM-detected problems. Don’t throw them yourself.",
    },
    {
      type: "bug", lec: [2],
      q: "The constructor should reject out-of-range brightness. Click the line with the bug.",
      lines: [
        "public DimmableLight(String name, int brightness) {",
        "    super(name, 1);",
        "    if ((brightness < MIN_BRIGHTNESS) && (brightness > MAX_BRIGHTNESS)) {",
        "        throw new IllegalArgumentException(\"Out of range\");",
        "    }",
        "    this.brightness = brightness;",
        "}",
      ],
      answer: 2,
      explain: "A number can’t be both below the minimum <b>and</b> above the maximum, so this never throws. It should be <code>||</code>.",
    },
  ],
});
