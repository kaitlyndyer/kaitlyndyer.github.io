registerConcept({
  id: "io",
  oneLiner:
    "Programs read input and write output through <b>streams</b>. Use <code>Scanner</code> for structured input and <b>try-with-resources</b> so files always get closed.",

  related: ["exceptions", "polymorphism", "collections"],

  summary: {
    keyPoints: [
      { lec: [3], html: "Three standard streams: <code>System.in</code> (input), <code>System.out</code> (normal output), <code>System.err</code> (error messages). It’s a historical Unix convention." },
      { lec: [3], html: "<code>InputStream</code> / <code>OutputStream</code> are abstract classes for reading and writing <b>bytes</b>. Both implement <code>Closeable</code>." },
      { lec: [3], html: "<code>FileInputStream</code> / <code>FileOutputStream</code> work with files and accept a <code>String</code> path or a <code>File</code>." },
      { lec: [3], html: "<code>PrintStream</code> adds formatted output (<code>print</code>, <code>println</code>). <code>System.out</code> and <code>System.err</code> are <code>PrintStream</code>s." },
      { lec: [3], html: "<code>Scanner</code> reads structured data: lines, ints, doubles, and words." },
      { lec: [3], html: "<b>try-with-resources</b> closes the resource automatically, even if an exception occurs." },
    ],
    compare: {
      head: ["Class", "What it does"],
      rows: [
        ["<code>Closeable</code>", "Interface with one method, <code>close()</code>, for cleaning up resources"],
        ["<code>InputStream</code> / <code>OutputStream</code>", "Abstract classes: read/write a byte, a byte array, or part of an array"],
        ["<code>FileInputStream</code> / <code>FileOutputStream</code>", "Concrete classes for reading/writing files"],
        ["<code>PrintStream</code>", "Extends <code>OutputStream</code> with <code>print</code>/<code>println</code>. Can target a file or wrap another stream."],
        ["<code>Scanner</code>", "Reads structured input: <code>hasNext()</code>, <code>next()</code>, <code>nextInt()</code>, <code>nextDouble()</code>, <code>nextLine()</code>"],
      ],
    },
  },

  details: [
    {
      id: "standard",
      title: "Standard streams",
      lec: [3],
      html: `
        <p>Programs need to read input and write output to the console, files, and more. Java provides three built-in streams:</p>
        <ul>
          <li><code>System.in</code>: standard input, the source of program input.</li>
          <li><code>System.out</code>: standard output, for normal output. It’s a <code>PrintStream</code>.</li>
          <li><code>System.err</code>: standard error, for error messages.</li>
        </ul>`,
    },
    {
      id: "streams",
      title: "java.io: streams of bytes",
      lec: [3],
      html: `
        <ul>
          <li><code>Closeable</code> is an interface with one method, <code>close()</code>, for cleaning up resources.</li>
          <li><code>InputStream</code> and <code>OutputStream</code> are <b>abstract classes</b> for reading and writing bytes. Both implement <code>Closeable</code>.</li>
          <li>Each defines <code>read</code>/<code>write</code> for a single byte, a byte array, or part of one. Same name, different parameters: that’s <b>method overloading</b>, resolved at compile time.</li>
          <li><code>FileInputStream</code>/<code>FileOutputStream</code> are the concrete file versions.</li>
          <li><code>PrintStream</code> extends <code>OutputStream</code> and adds <code>print</code>/<code>println</code>. It can target a file or wrap an existing <code>OutputStream</code>.</li>
        </ul>`,
    },
    {
      id: "scanner",
      title: "Reading structured data with Scanner",
      lec: [3],
      html: `
        <p><code>Scanner</code> can read from an <code>InputStream</code> (like <code>System.in</code>), a <code>File</code>, or a <code>String</code>. Its methods include <code>hasNext()</code>, <code>next()</code>, <code>nextInt()</code>, <code>nextDouble()</code>, <code>nextLine()</code>, and <code>close()</code>.</p>
        <p>Opening a <code>File</code> can throw <code>FileNotFoundException</code>, a <b>checked</b> exception, so you have to catch or declare it.</p>`,
    },
    {
      id: "twr",
      title: "try-with-resources",
      lec: [3],
      html: `
        <p>Declare the resource in parentheses after <code>try</code>, and Java closes it automatically, <b>even if an exception occurs</b>. It’s equivalent to a hand-written nested <code>try</code> with <code>finally { scanner.close(); }</code>, but much shorter and harder to get wrong.</p>`,
    },
  ],

  code: [
    {
      title: "Reading a file line by line",
      lec: [3],
      code: `try (Scanner scanner = new Scanner(new File("input.txt"))) {
    while (scanner.hasNextLine()) {
        String line = scanner.nextLine();
        System.out.println(line);
    }
} catch (FileNotFoundException e) {
    System.err.println("Error: " + e.getMessage());
}`,
    },
    {
      title: "What try-with-resources saves you from writing",
      lec: [3],
      note: "The <code>finally</code> block guarantees <code>close()</code> runs no matter what.",
      code: `try {
    Scanner scanner = new Scanner(new File("input.txt"));
    try {
        while (scanner.hasNext()) {
            System.out.println(scanner.nextLine());
        }
    } finally {
        scanner.close();
    }
} catch (FileNotFoundException e) {
    System.err.println("Error: " + e.getMessage());
}`,
    },
    {
      title: "Overloaded read methods",
      lec: [3],
      code: `public abstract class InputStream implements Closeable {
    public abstract int read();
    public int read(byte[] b) { ... }
    public int read(byte[] b, int off, int len) { ... }
    public void close() { ... }
}`,
    },
  ],

  flashcards: [
    { front: "<code>System.in</code> / <code>System.out</code> / <code>System.err</code>", back: "Standard input / standard output / standard error." },
    { front: "<code>Closeable</code>", back: "An interface with one method, <code>close()</code>, for cleaning up resources." },
    { front: "<code>InputStream</code> / <code>OutputStream</code>", back: "Abstract classes for reading/writing <b>bytes</b>." },
    { front: "<code>PrintStream</code>", back: "An <code>OutputStream</code> with <code>print</code>/<code>println</code>. <code>System.out</code> is one." },
    { front: "<code>Scanner</code>", back: "Reads structured input: <code>nextLine()</code>, <code>nextInt()</code>, <code>hasNext()</code>…" },
    { front: "try-with-resources", back: "<code>try (Resource r = ...) { }</code> closes <code>r</code> automatically, even if an exception occurs." },
    { front: "Method overloading", back: "Same name, different parameters (like the three <code>read</code> methods). Resolved at compile time." },
  ],

  quiz: [
    {
      type: "mc", lec: [3],
      q: "Where should a program print an error message?",
      options: ["<code>System.in</code>", "<code>System.out</code>", "<code>System.err</code>", "A Scanner"],
      answer: 2,
      explain: "<code>System.err</code> is the standard error stream, meant for error messages.",
    },
    {
      type: "mc", lec: [3],
      q: "What’s the main benefit of try-with-resources?",
      options: ["It makes reading faster", "The resource is closed automatically, even if an exception occurs", "It removes the need to catch exceptions", "It reads the whole file at once"],
      answer: 1,
      explain: "It’s equivalent to a <code>finally</code> block that calls <code>close()</code>, without the boilerplate.",
    },
    {
      type: "mc", lec: [3],
      q: "What type is <code>System.out</code>?",
      options: ["<code>Scanner</code>", "<code>PrintStream</code>", "<code>FileOutputStream</code>", "<code>String</code>"],
      answer: 1,
      explain: "<code>System.out</code> and <code>System.err</code> are just wrapped <code>PrintStream</code>s.",
    },
    {
      type: "mc", lec: [3],
      q: "Why must <code>new Scanner(new File(\"input.txt\"))</code> be inside a try/catch (or declared)?",
      options: ["Scanner is abstract", "It can throw <code>FileNotFoundException</code>, a checked exception", "Files are always missing", "It can’t. That code never compiles."],
      answer: 1,
      explain: "Checked exceptions must be caught or declared, and the compiler enforces it.",
    },
    {
      type: "tf", lec: [3],
      q: "True or false: <code>InputStream</code> is an interface.",
      answer: false,
      explain: "It’s an <b>abstract class</b> that implements the <code>Closeable</code> interface.",
    },
  ],
});
