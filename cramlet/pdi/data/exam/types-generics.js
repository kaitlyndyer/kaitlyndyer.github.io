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
