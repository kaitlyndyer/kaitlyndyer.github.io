registerExam("exceptions", [
  {
    id: "trace-try", type: "trace", lec: [2], sec: "catching",
    q: "What does this print?",
    code: `try {
    System.out.println("A");
    int[] nums = new int[2];
    nums[2] = 5;
    System.out.println("B");
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("C");
}
System.out.println("D");`,
    out: { kind: "output", text: "A\nC\nD" },
    explain: "<code>nums</code> has indexes 0 and 1, so <code>nums[2]</code> throws. The rest of the <code>try</code> block (<code>B</code>) is skipped, the matching <code>catch</code> runs, and then execution continues after the try/catch.",
  },
  {
    id: "write-ctor", type: "write", lec: [2], sec: "throwing",
    q: "Write a constructor <code>Light(String name, int brightness)</code> that stores both fields, but throws an <code>IllegalArgumentException</code> with a helpful message if <code>brightness</code> isn’t between 0 and 100 (inclusive). The fields are <code>private final String name</code> and <code>private final int brightness</code>.",
    rubric: [
      { text: "Correct constructor header: <code>public Light(String name, int brightness)</code>", re: "Light\\s*\\(\\s*String\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)" },
      { text: "Checks both ends of the range (below 0 and above 100)", re: "(<\\s*0|0\\s*>)[\\s\\S]*(>\\s*100|100\\s*<)|(>\\s*100|100\\s*<)[\\s\\S]*(<\\s*0|0\\s*>)" },
      { text: "<code>throw new IllegalArgumentException(...)</code> with a message", re: "throw\\s+new\\s+IllegalArgumentException\\s*\\(\\s*\"" },
      { text: "Stores both fields with <code>this.name = …</code> and <code>this.brightness = …</code>", re: "this\\.name\\s*=[\\s\\S]*this\\.brightness\\s*=|this\\.brightness\\s*=[\\s\\S]*this\\.name\\s*=" },
      { text: "Checks the input <b>before</b> storing anything" },
    ],
    model: `public Light(String name, int brightness) {
    if (brightness < 0 || brightness > 100) {
        throw new IllegalArgumentException(
            "brightness must be between 0 and 100, got " + brightness);
    }
    this.name = name;
    this.brightness = brightness;
}`,
    explain: "Validate first, then assign: the object is never half-built. Include the bad value in the message so whoever sees the exception knows what went wrong.",
  },
]);

// ---------- Batch 1 (lectures 1–2) ----------
registerExam("exceptions", [
  {
    id: "trace-finally", type: "trace", lec: [2], sec: "catching",
    q: "What does this print?",
    code: `try {
    System.out.println("open");
    throw new IllegalStateException("boom");
} catch (IllegalStateException e) {
    System.out.println("caught " + e.getMessage());
} finally {
    System.out.println("close");
}`,
    out: { kind: "output", text: "open\ncaught boom\nclose" },
    explain: "The throw jumps to the matching <code>catch</code>, and <code>finally</code> always runs afterward, whether or not an exception happened.",
  },
  {
    id: "trace-uncaught", type: "trace", lec: [2], sec: "catching",
    q: "What happens?",
    code: `try {
    int x = 10 / 0;
    System.out.println(x);
} catch (IllegalArgumentException e) {
    System.out.println("bad argument");
}
System.out.println("end");`,
    out: { kind: "exception" },
    explain: "<code>10 / 0</code> throws an <code>ArithmeticException</code>. The <code>catch</code> only handles <code>IllegalArgumentException</code>, so nothing catches it, “end” never prints, and the program crashes.",
  },
  {
    id: "multi-unchecked", type: "multi", lec: [2], sec: "types",
    q: "Which of these are <b>unchecked</b> exceptions (not required to be caught or declared)?",
    options: ["<code>IllegalArgumentException</code>", "<code>NullPointerException</code>", "<code>FileNotFoundException</code>", "<code>ArithmeticException</code>"],
    answers: [0, 1, 3],
    explain: "Unchecked exceptions are subclasses of <code>RuntimeException</code>. <code>FileNotFoundException</code> is <b>checked</b>: you must catch it or declare <code>throws</code>.",
  },
  {
    id: "fill-throw-throws", type: "fill", lec: [2, 3], sec: "throwing",
    q: "Fill in the two blanks: one method throws an exception itself, the other passes a checked exception on to its caller.",
    code: `public void setBrightness(int b) {
    if (b < 0 || b > 100) {
        [[1]] new IllegalArgumentException("bad brightness: " + b);
    }
    this.brightness = b;
}

public Scanner open(String path) [[2]] FileNotFoundException {
    return new Scanner(new File(path));
}`,
    blanks: [["throw"], ["throws"]],
    explain: "<code>throw</code> (a statement) raises an exception now. <code>throws</code> (in the header) declares that the method may let a checked exception escape.",
  },
  {
    id: "design-negative", type: "design", lec: [2], sec: "recipe",
    q: "A caller passes a negative brightness to your <code>Light</code> constructor. Following the lecture’s recipe, what should the constructor do?",
    options: ["Quietly use 0 instead", "Print an error message and keep going", "Throw an <code>IllegalArgumentException</code> and document it with <code>@throws</code>", "Return <code>null</code>"],
    answer: 2,
    model: "The recipe: prevent the error if you can, else recover locally if that makes sense, else throw. The constructor can’t prevent bad input from its caller, and silently changing it would hide a bug. So throw an exception and document it with <code>@throws</code>.",
    explain: "Constructors can’t return null, and printing doesn’t stop the bad object from being built.",
  },
  {
    id: "write-parse", type: "write", lec: [2], sec: "throwing",
    q: "Write <code>public static int parsePercent(String s)</code>: it returns <code>s</code> as an int (use <code>Integer.parseInt</code>), but throws an <code>IllegalArgumentException</code> with a message if the number isn’t between 0 and 100.",
    rubric: [
      { text: "Correct signature: <code>public static int parsePercent(String s)</code>", re: "public\\s+static\\s+int\\s+parsePercent\\s*\\(\\s*String\\s+\\w+\\s*\\)" },
      { text: "Uses <code>Integer.parseInt</code>", re: "Integer\\.parseInt\\s*\\(" },
      { text: "Checks both ends of the range", re: "(<\\s*0|0\\s*>)[\\s\\S]*(>\\s*100|100\\s*<)|(>\\s*100|100\\s*<)[\\s\\S]*(<\\s*0|0\\s*>)" },
      { text: "<code>throw new IllegalArgumentException(\"…\")</code> with a message", re: "throw\\s+new\\s+IllegalArgumentException\\s*\\(\\s*\"" },
      { text: "Returns the value when it’s valid", re: "return\\s+\\w+\\s*;" },
    ],
    model: `public static int parsePercent(String s) {
    int value = Integer.parseInt(s);
    if (value < 0 || value > 100) {
        throw new IllegalArgumentException("not a percent: " + value);
    }
    return value;
}`,
    explain: "Parse, validate, then return. (If <code>s</code> isn’t a number at all, <code>Integer.parseInt</code> already throws a <code>NumberFormatException</code>.)",
  },
]);

// ---------- Batch 6 (exam-style multiple choice) ----------
registerExam("exceptions", [
  {
    id: "mc6-checked-diff", type: "mc", lec: [2], sec: "types",
    q: "<code>loadRooms()</code> opens a file and can throw <code>FileNotFoundException</code>. <code>setBrightness()</code> can throw <code>IllegalArgumentException</code>. Which statement is correct?",
    options: ["Callers of loadRooms must catch the exception or declare it with throws; callers of setBrightness don’t have to", "Both must be declared with throws", "Neither can be caught", "IllegalArgumentException is checked because it’s about arguments"],
    answer: 0,
    explain: "FileNotFoundException is a <b>checked</b> exception (the compiler enforces handling). IllegalArgumentException extends RuntimeException, so it’s <b>unchecked</b>.",
  },

  {
    id: "mc6-catch-order", type: "mc", lec: [2], sec: "catching",
    q: "A <code>try</code> has <code>catch (Exception e)</code> followed by <code>catch (IllegalArgumentException e)</code>. What happens?",
    options: ["The second catch handles IllegalArgumentException", "Compile error: the second catch can never be reached", "Both catches run", "The order doesn’t matter"],
    answer: 1,
    explain: "<code>Exception</code> already catches every IllegalArgumentException, so the more specific catch must come first.",
  },
  {
    id: "mc6-finally", type: "mc", lec: [2], sec: "catching",
    q: "When does a <code>finally</code> block run?",
    options: ["Only when an exception is thrown", "Only when no exception is thrown", "After the try (and any catch), whether or not an exception happened", "Only if the method returns void"],
    answer: 2,
    explain: "That’s why it’s used for cleanup, like closing resources.",
  },
  {
    id: "mc6-recipe", type: "mc", lec: [2], sec: "recipe",
    q: "Which order matches the lecture’s recipe for handling errors?",
    options: ["Throw first, then try to prevent", "Prevent the error if you can, else recover locally if it makes sense, else throw", "Always catch everything", "Print an error and continue"],
    answer: 1,
    explain: "Throwing is the last resort, but silently ignoring a problem is never the answer.",
  },
]);
