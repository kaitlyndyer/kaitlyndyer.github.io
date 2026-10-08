registerExam("io", [
  {
    id: "parsons-scanner", type: "parsons", lec: [3], sec: "twr",
    q: "Build a method body that prints every line of the file at <code>path</code>, closes the file automatically, and prints an error if the file doesn’t exist.",
    lines: [
      "try (Scanner sc = new Scanner(new File(path))) {",
      "    while (sc.hasNextLine()) {",
      "        System.out.println(sc.nextLine());",
      "    }",
      "} catch (FileNotFoundException e) {",
      "    System.err.println(\"No such file: \" + path);",
      "}",
    ],
    distractors: [
      { code: "Scanner sc = new Scanner(System.in);", why: "That reads from the keyboard, not the file." },
      { code: "    while (sc.nextLine() != null) {", why: "nextLine() throws at the end of input instead of returning null; use hasNextLine()." },
      { code: "} catch (NullPointerException e) {", why: "A missing file throws FileNotFoundException." },
    ],
    explain: "Try-with-resources (<code>try (… ) {</code>) closes the <code>Scanner</code> automatically, even if an exception happens. <code>hasNextLine()</code> checks before each <code>nextLine()</code>, and a missing file is a checked <code>FileNotFoundException</code>.",
  },
]);

// ---------- Batch 2 (lecture 3) ----------
registerExam("io", [
  {
    id: "trace-scanner-string", type: "trace", lec: [3], sec: "scanner",
    q: "What does this print?",
    code: `Scanner sc = new Scanner("3 4 lamp");
int a = sc.nextInt();
int b = sc.nextInt();
String name = sc.next();
System.out.println(name + " " + (a + b));
System.out.println(sc.hasNext());`,
    out: { kind: "output", text: "lamp 7\nfalse" },
    explain: "A <code>Scanner</code> can read from a <code>String</code>. It splits on whitespace: two ints, then a word. The parentheses make <code>a + b</code> add as numbers. Nothing is left, so <code>hasNext()</code> is false.",
  },
  {
    id: "trace-twr-order", type: "trace", lec: [3], sec: "twr",
    q: "What does this print?",
    code: `class Res implements Closeable {
    public void close() { System.out.println("close"); }
}

try (Res r = new Res()) {
    System.out.println("use");
    throw new IllegalStateException("oops");
} catch (IllegalStateException e) {
    System.out.println("caught");
} finally {
    System.out.println("finally");
}`,
    out: { kind: "output", text: "use\nclose\ncaught\nfinally" },
    explain: "try-with-resources closes the resource as soon as the <code>try</code> block ends, even when it ends with an exception. That happens <b>before</b> the <code>catch</code> runs, and <code>finally</code> runs last.",
  },
  {
    id: "trace-fnf-compile", type: "trace", lec: [3], sec: "scanner",
    q: "What happens? (Assume <code>rooms.txt</code> exists.)",
    code: `public static void main(String[] args) {
    Scanner sc = new Scanner(new File("rooms.txt"));
    System.out.println(sc.nextLine());
}`,
    out: { kind: "compile" },
    explain: "<code>new Scanner(File)</code> can throw <code>FileNotFoundException</code>, a <b>checked</b> exception. You must catch it or declare <code>throws</code>. The compiler doesn’t care whether the file actually exists.",
  },
  {
    id: "fill-twr", type: "fill", lec: [3], sec: "twr",
    q: "Fill in the blanks to print every line of <code>rooms.txt</code>, closing the file automatically.",
    code: `[[1]] (Scanner sc = new Scanner(new [[2]]("rooms.txt"))) {
    while (sc.[[3]]()) {
        System.out.println(sc.nextLine());
    }
} catch ([[4]] e) {
    System.err.println("missing file");
}`,
    blanks: [["try"], ["File"], ["hasNextLine"], ["FileNotFoundException", "IOException"]],
    explain: "The resource is declared in parentheses after <code>try</code>, and Java closes it for you. <code>hasNextLine()</code> pairs with <code>nextLine()</code>. Opening a file can throw <code>FileNotFoundException</code>.",
  },
  {
    id: "parsons-sum-file", type: "parsons", lec: [3], sec: "scanner",
    q: "Build a method that adds up every whole number in a file and lets a missing-file exception go to the caller.",
    lines: [
      "public static int sumFile(String path) throws FileNotFoundException {",
      "    int total = 0;",
      "    try (Scanner sc = new Scanner(new File(path))) {",
      "        while (sc.hasNextInt()) {",
      "            total += sc.nextInt();",
      "        }",
      "    }",
      "    return total;",
      "}",
    ],
    distractors: [
      { code: "    try (Scanner sc = new Scanner(path)) {", why: "Scanner(String) reads the text of the string itself, not the file it names. Wrap it in new File(path)." },
      { code: "            total += sc.nextLine();", why: "nextLine returns a String, which can’t be added to an int total." },
    ],
    explain: "<code>throws</code> in the header passes the checked exception on to the caller, so this <code>try</code> needs no <code>catch</code>. The resource still closes automatically.",
  },
  {
    id: "write-read-lines", type: "write", lec: [3], sec: "twr",
    q: "Write <code>public static List&lt;String&gt; readLines(String path)</code>: it returns every line of the file. If the file is missing, print a message to standard error and return an empty list. Use try-with-resources.",
    rubric: [
      { text: "Correct signature", re: "public\\s+static\\s+List\\s*<\\s*String\\s*>\\s+readLines\\s*\\(\\s*String\\s+\\w+\\s*\\)" },
      { text: "Creates a <code>List&lt;String&gt;</code> to fill", re: "List\\s*<\\s*String\\s*>\\s+\\w+\\s*=\\s*new\\s+(ArrayList|LinkedList)\\s*<" },
      { text: "<code>try (Scanner … = new Scanner(new File(…)))</code>", re: "try\\s*\\(\\s*Scanner\\s+\\w+\\s*=\\s*new\\s+Scanner\\s*\\(\\s*new\\s+File\\s*\\(" },
      { text: "Loops with <code>hasNextLine()</code> / <code>nextLine()</code>", re: "hasNextLine\\s*\\(\\s*\\)[\\s\\S]*nextLine\\s*\\(\\s*\\)" },
      { text: "Catches <code>FileNotFoundException</code> and prints to <code>System.err</code>", re: "catch\\s*\\(\\s*(FileNotFoundException|IOException)\\s+\\w+\\s*\\)\\s*\\{[^}]*System\\.err" },
      { text: "Returns the list", re: "return\\s+\\w+\\s*;" },
    ],
    model: `public static List<String> readLines(String path) {
    List<String> lines = new ArrayList<>();
    try (Scanner sc = new Scanner(new File(path))) {
        while (sc.hasNextLine()) {
            lines.add(sc.nextLine());
        }
    } catch (FileNotFoundException e) {
        System.err.println("Missing file: " + path);
    }
    return lines;
}`,
    explain: "Creating the list before the <code>try</code> means there’s something to return either way. Error messages belong on <code>System.err</code>, not <code>System.out</code>.",
  },
  {
    id: "design-twr", type: "design", lec: [3], sec: "twr",
    q: "A teammate opens a <code>Scanner</code> on a file and calls <code>sc.close()</code> on the last line of the <code>try</code> block. What’s the problem, and the best fix?",
    options: ["No problem; that’s the standard pattern", "If an exception happens first, <code>close()</code> never runs. Use try-with-resources", "<code>close()</code> should go in the <code>catch</code> block", "Scanners never need closing"],
    answer: 1,
    model: "An exception skips the rest of the <code>try</code> block, including <code>close()</code>, so the file stays open. try-with-resources (<code>try (Scanner sc = …)</code>) closes it no matter how the block ends. It does the same job as a hand-written <code>finally { sc.close(); }</code>, but it’s shorter and harder to get wrong.",
    explain: "Putting close() in catch would miss the normal path; finally or try-with-resources covers both.",
  },
  {
    id: "multi-streams", type: "multi", lec: [3], sec: "streams",
    q: "Which statements are true?",
    options: ["<code>System.out</code> is a <code>PrintStream</code>", "<code>InputStream</code> is an abstract class for reading bytes", "<code>Closeable</code> has one method, <code>close()</code>", "<code>System.err</code> is for reading user input"],
    answers: [0, 1, 2],
    explain: "<code>System.in</code> is for input. <code>System.err</code> is standard <b>error</b>, an output stream for error messages.",
  },
  {
    id: "tf-scanner-string", type: "tf", lec: [3], sec: "scanner",
    q: "True or false: <code>new Scanner(\"data.txt\")</code> reads the contents of the file <code>data.txt</code>.",
    answer: false,
    explain: "Given a <code>String</code>, a <code>Scanner</code> reads that text itself, so you’d get the word <i>data.txt</i>. To read the file, use <code>new Scanner(new File(\"data.txt\"))</code>.",
  },
]);

// ---------- Batch 6 (exam-style multiple choice) ----------
registerExam("io", [
  {
    id: "mc6-twr-why", type: "mc", lec: [3], sec: "twr",
    q: "What is the main advantage of try-with-resources over calling <code>close()</code> at the end of the try block?",
    options: ["It reads files faster", "The resource is closed automatically even if an exception is thrown", "It removes the need to handle FileNotFoundException", "It lets you open more files"],
    answer: 1,
    explain: "An exception would skip a close() at the end of the try. try-with-resources acts like a guaranteed finally.",
  },
  {
    id: "mc6-stderr", type: "mc", lec: [3], sec: "standard",
    q: "Where should a program print an error message like “Missing file: rooms.txt”?",
    options: ["<code>System.in</code>", "<code>System.err</code>", "A comment", "<code>System.exit</code>"],
    answer: 1,
    explain: "Standard error keeps error messages separate from normal output on System.out.",
  },
]);
