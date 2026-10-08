// Exam questions for Lambdas & Functional Interfaces (lecture 7). See ../../../course/exam.js for the format.
registerExam("lambdas", [
  {
    id: "trace-function-apply", type: "trace", lec: [7], sec: "functional-interface",
    q: "What does this print?",
    code: `Function<String, String> shout = s -> s.toUpperCase() + "!";
Function<Integer, Integer> twice = n -> n * 2;
System.out.println(shout.apply("hi") + " " + twice.apply(21));`,
    out: { kind: "output", text: "HI! 42" },
    explain: "A <code>Function</code> runs when you call <code>apply</code>. The lambda body’s value is what <code>apply</code> returns.",
  },
  {
    id: "trace-comparing-int", type: "trace", lec: [7], sec: "method-refs",
    q: "What does this print?",
    code: `List<String> names = new ArrayList<>(List.of("lamp", "fan", "thermostat"));
names.sort(Comparator.comparingInt(String::length));
System.out.println(names);
names.sort((a, b) -> b.compareTo(a));
System.out.println(names);`,
    out: { kind: "output", text: "[fan, lamp, thermostat]\n[thermostat, lamp, fan]" },
    explain: "<code>comparingInt(String::length)</code> orders by length (3, 4, 10). The lambda compares <code>b</code> to <code>a</code>, which reverses alphabetical order.",
  },
  {
    id: "trace-effectively-final", type: "trace", lec: [7], sec: "capture",
    q: "What happens?",
    code: `int count = 0;
List<String> rooms = List.of("hall", "den");
rooms.forEach(r -> count++);
System.out.println(count);`,
    out: { kind: "compile" },
    explain: "A lambda can only use local variables that are final or <b>effectively final</b>. <code>count++</code> modifies <code>count</code>, so this doesn’t compile.",
  },
  {
    id: "trace-predicate", type: "trace", lec: [7], sec: "functional-interface",
    q: "What does this print?",
    code: `Predicate<Integer> bright = b -> b > 50;
int n = 0;
for (int b : List.of(30, 60, 90, 50)) {
    if (bright.test(b)) {
        n++;
    }
}
System.out.println(n);`,
    out: { kind: "output", text: "2" },
    explain: "<code>test</code> returns true for 60 and 90. 50 isn’t greater than 50.",
  },
  {
    id: "trace-runnable", type: "trace", lec: [7], sec: "syntax",
    q: "What does this print?",
    code: `Runnable r = () -> {
    System.out.println("on");
    System.out.println("off");
};
System.out.println("start");
r.run();
r.run();`,
    out: { kind: "output", text: "start\non\noff\non\noff" },
    explain: "Creating the lambda doesn’t run it. Its body runs each time <code>run()</code> is called.",
  },
  {
    id: "mc-which-functional", type: "mc", lec: [7], sec: "functional-interface",
    q: "Which of these can be implemented with a lambda?",
    options: ["An interface with three abstract methods", "<code>Comparator&lt;T&gt;</code>, which has one abstract method (<code>compare</code>) plus static methods", "Any abstract class", "<code>Iterator&lt;T&gt;</code>, which needs <code>hasNext()</code> and <code>next()</code>"],
    answer: 1,
    explain: "A lambda needs a functional interface: exactly one abstract method. Static (and default) methods don’t count.",
  },
  {
    id: "mc-invalid-lambda", type: "mc", lec: [7], sec: "syntax",
    q: "Which lambda is <b>not</b> valid Java?",
    options: ["<code>x -&gt; x * 2</code>", "<code>() -&gt; System.out.println(\"hi\")</code>", "<code>int (a, b) -&gt; a + b</code>", "<code>(a, b) -&gt; a + b</code>"],
    answer: 2,
    explain: "You never write a lambda’s return type; it’s inferred.",
  },
  {
    id: "mc-consumer", type: "mc", lec: [7], sec: "functional-interface",
    q: "<code>lights.forEach(turnOn)</code> should call <code>turnOn()</code> on every light and return nothing. What type should <code>turnOn</code> have?",
    options: ["<code>Supplier&lt;Light&gt;</code>", "<code>Predicate&lt;Light&gt;</code>", "<code>Consumer&lt;Light&gt;</code>", "<code>Function&lt;Light, Light&gt;</code>"],
    answer: 2,
    explain: "Consumer: takes an argument and returns nothing (<code>void accept(T t)</code>), so <code>Consumer&lt;Light&gt; turnOn = Light::turnOn</code>.",
  },
  {
    id: "mc-supplier", type: "mc", lec: [7], sec: "functional-interface",
    q: "Which functional interface takes <b>no</b> argument and <b>returns</b> a value?",
    options: ["<code>Supplier&lt;T&gt;</code>", "<code>Consumer&lt;T&gt;</code>", "<code>Runnable</code>", "<code>Predicate&lt;T&gt;</code>"],
    answer: 0,
    explain: "<code>T get()</code>. Runnable takes nothing and returns nothing.",
  },
  {
    id: "mc-name-clash", type: "mc", lec: [7], sec: "capture",
    q: "Why doesn’t this compile? <code>DimmableLight l1 = lights.get(0); lights.sort((l1, l2) -&gt; …);</code>",
    options: ["Lambdas can’t take two parameters", "A lambda shares names with its enclosing scope, so <code>l1</code> is already defined", "<code>sort</code> needs a named class", "<code>l1</code> isn’t effectively final"],
    answer: 1,
    explain: "Lambda parameters can’t reuse the name of a local variable that’s already in scope.",
  },
  {
    id: "mc-ref-tradeoff", type: "mc", lec: [7], sec: "method-refs",
    q: "Which statement about lambdas vs. method references matches the lecture?",
    options: ["Method references are always more readable", "A method reference is shorter; a lambda’s named parameters can make the intent clearer", "Lambdas run faster than method references", "Method references can only refer to static methods"],
    answer: 1,
    explain: "Both are tools. Choose whichever reads more clearly in context.",
  },
  {
    id: "mc-anon-class", type: "mc", lec: [7], sec: "evolution",
    q: "Compared with a named <code>BrightnessComparator</code> class, what does an <b>anonymous class</b> change?",
    options: ["It defines the comparator right at its only place of use", "It makes sorting faster", "It removes the need for a <code>compare</code> method", "It lets the comparator have two abstract methods"],
    answer: 0,
    explain: "Same <code>compare</code> method, just defined inline. A lambda shortens it further.",
  },
  {
    id: "mc-comparingint-name", type: "mc", lec: [7], sec: "primitive",
    q: "Why is it <code>Comparator.comparing<b>Int</b></code> rather than just <code>comparing</code> for brightness?",
    options: ["It only works on lists of Integer", "It takes a <code>ToIntFunction</code>, which returns a primitive int and avoids boxing", "It sorts in descending order", "It converts the list to an array"],
    answer: 1,
    explain: "Primitive functional interfaces skip boxing: more efficient, and no surprise nulls.",
  },
  {
    id: "design-long-lambda", type: "design", lec: [7], sec: "when",
    q: "A <code>sort</code> call contains a 12-line lambda with nested <code>if</code>s that ranks devices by several rules. What’s the most readable fix?",
    options: ["Keep it; lambdas are always clearer", "Move the logic into a named, documented comparator method or class", "Turn it into an anonymous class with the same body", "Squeeze it into one line"],
    answer: 1,
    model: "Lambdas have <b>no name, no documentation, and often no explicit types</b>. Short ones are very readable, but long or complicated ones aren’t. A named method or class can explain the ranking rules and be tested on its own.",
    explain: "Readability of lambdas doesn’t scale.",
  },
  {
    id: "fill-lambda-sort", type: "fill", lec: [7], sec: "method-refs",
    q: "Fill in the blanks: sort with a lambda, then do the same with a method reference.",
    code: `lights.sort((l1, l2) [[1]] Integer.compare(l1.getBrightness(), l2.getBrightness()));

lights.sort(Comparator.[[2]](DimmableLight[[3]]getBrightness));`,
    blanks: [["->"], ["comparingInt"], ["::"]],
    explain: "<code>-&gt;</code> separates parameters from the body. <code>::</code> makes a method reference, and <code>comparingInt</code> builds the comparator.",
  },
]);
