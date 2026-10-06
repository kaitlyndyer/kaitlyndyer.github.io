registerExam("types-generics", [
  {
    id: "trace-pass-by-value", type: "trace", lec: [3], sec: "pass-by-value",
    q: "What does this print?",
    code: `static void addOne(List<Integer> list) { list.add(1); }
static void replace(List<Integer> list) {
    list = new ArrayList<>();
    list.add(99);
}
static void bump(int n) { n = n + 1; }

List<Integer> nums = new ArrayList<>();
addOne(nums);
replace(nums);
int k = 5;
bump(k);
System.out.println(nums + " " + k);`,
    out: { kind: "output", text: "[1] 5" },
    explain: "Java passes <b>copies of values</b>. For an object, the value is a reference, so <code>addOne</code> mutates the same list. <code>replace</code> only points its own copy of the reference at a new list, which the caller never sees. <code>bump</code> changes its own copy of the int.",
  },
  {
    id: "fill-generics", type: "fill", lec: [3], sec: "generics",
    q: "Fill in the blanks so this compiles without warnings and <code>first</code> needs no cast.",
    code: `List<[[1]]> names = new ArrayList<[[2]]>();
names.add("Ada");
[[3]] first = names.get(0);`,
    blanks: [["String"], ["", "String"], ["String", "var"]],
    explain: "<code>List&lt;String&gt;</code> tells the compiler what the list holds, so <code>get</code> returns a <code>String</code>. On the right, the empty diamond <code>&lt;&gt;</code> lets Java infer the type.",
  },
  {
    id: "mc-raw", type: "multi", lec: [3], sec: "raw",
    q: "Which statements about raw types like <code>List list = new ArrayList();</code> are true?",
    options: ["The compiler can’t check what you put into the list", "Mistakes show up later, as a ClassCastException at runtime", "They make the program run faster", "You need casts when you take elements out"],
    answers: [0, 1, 3],
    explain: "A raw type throws away the element type, so the compiler can’t catch wrong insertions; you cast on the way out, and a wrong cast fails at runtime. Generics move those errors to compile time. Speed isn’t affected.",
  },
]);

// ---------- Batch 2 (lecture 3) ----------
registerExam("types-generics", [
  {
    id: "trace-array-param", type: "trace", lec: [3], sec: "pass-by-value",
    q: "What does this print?",
    code: `static void bump(int[] a, int b) {
    a[0]++;
    b++;
}

int[] arr = {1, 2};
int x = 1;
bump(arr, x);
System.out.println(arr[0] + " " + x);`,
    out: { kind: "output", text: "2 1" },
    explain: "Both arguments are copied. <code>a</code> gets a copy of the <b>address</b>, so <code>a[0]++</code> changes the caller’s array. <code>b</code> gets a copy of the <b>value</b> 1, so <code>b++</code> never reaches <code>x</code>.",
  },
  {
    id: "trace-reassign-param", type: "trace", lec: [3], sec: "pass-by-value",
    q: "What does this print?",
    code: `static void change(List<String> list) {
    list.add("b");
    list = new ArrayList<>();
    list.add("c");
}

List<String> items = new ArrayList<>();
items.add("a");
change(items);
System.out.println(items);`,
    out: { kind: "output", text: "[a, b]" },
    explain: "<code>list.add(\"b\")</code> mutates the caller’s list (same object). Then <code>list</code> is pointed at a brand-new list, which the caller never sees, so <code>\"c\"</code> goes nowhere.",
  },
  {
    id: "trace-alias", type: "trace", lec: [3], sec: "two-types",
    q: "What does this print?",
    code: `List<Integer> a = new ArrayList<>();
List<Integer> b = a;
b.add(5);
System.out.println(a.size() + " " + (a == b));`,
    out: { kind: "output", text: "1 true" },
    explain: "<code>b = a</code> copies the reference, not the list. Both variables point to the same object, so adding through <code>b</code> shows up in <code>a</code>, and <code>==</code> is true.",
  },
  {
    id: "trace-string-eq", type: "trace", lec: [3, 6], sec: "two-types",
    q: "What does this print?",
    code: `String a = new String("lamp");
String b = new String("lamp");
System.out.println((a == b) + " " + a.equals(b));`,
    out: { kind: "output", text: "false true" },
    explain: "Two <code>new</code> calls make two different objects, so <code>==</code> (same object?) is false. <code>equals</code> compares the text, so it’s true.",
  },
  {
    id: "trace-unbox-null", type: "trace", lec: [3], sec: "wrappers",
    q: "What happens?",
    code: `Map<String, Integer> temps = new HashMap<>();
temps.put("kitchen", 21);
int t = temps.get("garage");
System.out.println(t);`,
    out: { kind: "exception" },
    explain: "<code>get</code> returns <code>null</code> for a missing key. Auto-unboxing <code>null</code> into an <code>int</code> throws a <code>NullPointerException</code>. (Using <code>Integer t</code> would just store null.)",
  },
  {
    id: "bug-string-eq", type: "bug", lec: [3], sec: "two-types",
    q: "This sometimes returns <code>false</code> even when the room is in the list. Which line is the bug, and how do you fix it?",
    lines: [
      "public static boolean hasRoom(List<String> rooms, String target) {",
      "    for (String r : rooms) {",
      "        if (r == target) {",
      "            return true;",
      "        }",
      "    }",
      "    return false;",
      "}",
    ],
    answer: 2,
    fixes: ["Use <code>r.equals(target)</code>", "Use <code>r = target</code>", "Change <code>String</code> to <code>char[]</code>", "Return <code>true</code> after the loop"],
    fix: 0,
    explain: "<code>==</code> checks whether two references point to the <b>same object</b>. Two strings with the same text can be different objects, so compare values with <code>equals</code>.",
  },
  {
    id: "bug-raw-list", type: "bug", lec: [3], sec: "raw",
    q: "The last line throws a <code>ClassCastException</code>. Which line should you change so the <b>compiler</b> catches the mistake instead, and how?",
    lines: [
      "List lights = new ArrayList();",
      "lights.add(new Light(\"desk\", 50));",
      "lights.add(\"kitchen\");",
      "Light l = (Light) lights.get(1);",
    ],
    answer: 0,
    fixes: ["Declare it as <code>List&lt;Light&gt; lights = new ArrayList&lt;&gt;();</code>", "Wrap the cast in try/catch", "Use a <code>LinkedList</code> instead", "Cast to <code>Object</code> instead"],
    fix: 0,
    explain: "A raw <code>List</code> accepts anything, so the mistake only shows up at runtime. With <code>List&lt;Light&gt;</code>, line 3 becomes a compile error and the cast disappears.",
  },
  {
    id: "bug-reset", type: "bug", lec: [3], sec: "pass-by-value",
    q: "The author expected this to print <code>0 0</code>, but it prints <code>5 0</code>. Which line doesn’t do what they expected, and how do you fix it?",
    lines: [
      "static void resetAll(int count, List<Light> lights) {",
      "    count = 0;",
      "    lights.clear();",
      "}",
      "",
      "int alerts = 5;",
      "List<Light> on = new ArrayList<>(List.of(desk, lamp));",
      "resetAll(alerts, on);",
      "System.out.println(alerts + \" \" + on.size());",
    ],
    answer: 1,
    fixes: ["Don’t change the parameter; set <code>alerts = 0</code> at the call site (or return the new value and assign it)", "Change <code>int</code> to <code>Integer</code>", "Make <code>count</code> <code>final</code>", "Call <code>lights.clear()</code> first"],
    fix: 0,
    explain: "<code>count</code> is a copy of <code>alerts</code>, so setting it to 0 changes only the copy. <code>lights.clear()</code> works because it mutates the shared list. (<code>Integer</code> wouldn’t help: reassigning a parameter is never visible to the caller.)",
  },
  {
    id: "fill-box", type: "fill", lec: [3], sec: "generics",
    q: "Fill in the blanks to make a generic <code>Box</code> class, then create one that holds whole numbers.",
    code: `public class Box[[1]] {
    private T item;
    public void put([[2]] item) { this.item = item; }
    public T get() { return item; }
}

Box<[[3]]> b = new Box<>();`,
    blanks: [["<T>"], ["T"], ["Integer"]],
    explain: "The class declares its type parameter as <code>&lt;T&gt;</code>, then uses <code>T</code> like any type. Type arguments must be reference types, so whole numbers use the wrapper <code>Integer</code>, not <code>int</code>.",
  },
  {
    id: "write-pair", type: "write", lec: [3], sec: "generics",
    q: "Write a generic class <code>Pair&lt;A, B&gt;</code> with two <code>private final</code> fields, a constructor that takes both values, and getters <code>first()</code> and <code>second()</code>.",
    rubric: [
      { text: "<code>class Pair&lt;A, B&gt;</code>", re: "class\\s+Pair\\s*<\\s*A\\s*,\\s*B\\s*>" },
      { text: "<code>private final</code> fields of type <code>A</code> and <code>B</code>", re: "^(?=[\\s\\S]*private\\s+final\\s+A\\s+\\w+\\s*;)(?=[\\s\\S]*private\\s+final\\s+B\\s+\\w+\\s*;)", flags: "" },
      { text: "Constructor <code>Pair(A …, B …)</code> that sets both fields", re: "Pair\\s*\\(\\s*A\\s+\\w+\\s*,\\s*B\\s+\\w+\\s*\\)\\s*\\{[^}]*=[^}]*=" },
      { text: "<code>public A first()</code>", re: "public\\s+A\\s+first\\s*\\(\\s*\\)" },
      { text: "<code>public B second()</code>", re: "public\\s+B\\s+second\\s*\\(\\s*\\)" },
    ],
    model: `public class Pair<A, B> {
    private final A first;
    private final B second;

    public Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }

    public A first() { return first; }
    public B second() { return second; }
}`,
    explain: "A class can have several type parameters. Inside, <code>A</code> and <code>B</code> work like ordinary types. Callers pick them, as in <code>new Pair&lt;String, Integer&gt;(\"desk\", 80)</code>.",
  },
  {
    id: "mc-primitive", type: "mc", lec: [3], sec: "two-types",
    q: "Which of these is <b>not</b> a primitive type?",
    options: ["<code>char</code>", "<code>long</code>", "<code>String</code>", "<code>boolean</code>"],
    answer: 2,
    explain: "<code>String</code> is a class, so it’s a reference type. The 8 primitives are boolean, byte, short, int, long, float, double, and char.",
  },
  {
    id: "multi-legal-generic", type: "multi", lec: [3], sec: "wrappers",
    q: "Which declarations compile?",
    options: ["<code>List&lt;Integer&gt; a = new ArrayList&lt;&gt;();</code>", "<code>List&lt;int&gt; b = new ArrayList&lt;&gt;();</code>", "<code>Map&lt;String, Double&gt; c = new HashMap&lt;&gt;();</code>", "<code>Set&lt;char&gt; d = new HashSet&lt;&gt;();</code>"],
    answers: [0, 2],
    explain: "Type arguments must be <b>reference</b> types. Use the wrappers <code>Integer</code> and <code>Character</code> instead of <code>int</code> and <code>char</code>.",
  },
  {
    id: "design-int-array", type: "design", lec: [3], sec: "wrappers",
    q: "You’ll store exactly 10 million temperature readings (whole numbers) and do a lot of math on them. Which is the better choice?",
    options: ["<code>List&lt;Integer&gt;</code>", "<code>int[]</code>", "<code>List&lt;Object&gt;</code>", "<code>Map&lt;Integer, Integer&gt;</code>"],
    answer: 1,
    model: "The size is fixed and known, and primitives are <b>faster and smaller</b> than wrappers. Every <code>Integer</code> is a separate object reached through a reference, and the math would box and unbox constantly. A plain <code>int[]</code> stores the values contiguously.",
    explain: "Prefer primitives when you can. Use wrappers when a generic type requires them.",
  },
]);
