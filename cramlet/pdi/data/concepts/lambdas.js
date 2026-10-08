registerConcept({
  id: "lambdas",
  oneLiner:
    "Java treats <b>functions as values</b>: a <b>lambda</b> or <b>method reference</b> can stand in for any interface with exactly one abstract method.",

  related: ["paradigms", "contracts", "readable-code"],

  summary: {
    keyPoints: [
      { lec: [7], html: "Functional programming treats <b>functions as first-class values</b>: stored in variables and passed around like data. Java has supported this since <b>Java 8</b>." },
      { lec: [7], html: "To sort by brightness you can write a named <code>Comparator</code> class, an <b>anonymous class</b> at the point of use, or a <b>lambda</b>: <code>(l1, l2) -&gt; Integer.compare(…)</code>." },
      { lec: [7], kind: "key", html: "A <b>functional interface</b> has exactly <b>one abstract method</b> (static and default methods don’t count). That’s what lets a lambda skip the method name." },
      { lec: [7], html: "<b>Method reference</b>: <code>DimmableLight::getBrightness</code> refers to an existing method, called on each object. <code>Comparator.comparingInt(DimmableLight::getBrightness)</code> builds a comparator from it." },
      { lec: [7], kind: "warn", html: "Lambdas can use enclosing variables only if they’re <b>final or effectively final</b> (never reassigned), and a lambda parameter can’t reuse an enclosing variable’s name." },
      { lec: [7], html: "Use the standard interfaces in <code>java.util.function</code> (<code>Predicate</code>, <code>Function</code>, <code>Consumer</code>, <code>Supplier</code>, <code>BiFunction</code>), and <b>primitive versions</b> like <code>ToIntFunction</code> to avoid boxing." },
      { lec: [7], html: "Short lambdas are very readable. Long or complicated ones (no name, no docs) aren’t: use a named method or class instead." },
    ],
    compare: {
      head: ["Interface", "Method", "Shape"],
      rows: [
        ["<code>Predicate&lt;T&gt;</code>", "<code>boolean test(T t)</code>", "T → boolean"],
        ["<code>Function&lt;T, R&gt;</code>", "<code>R apply(T t)</code>", "T → R"],
        ["<code>Consumer&lt;T&gt;</code>", "<code>void accept(T t)</code>", "T → nothing"],
        ["<code>Supplier&lt;T&gt;</code>", "<code>T get()</code>", "nothing → T"],
        ["<code>BiFunction&lt;T, U, R&gt;</code>", "<code>R apply(T t, U u)</code>", "T, U → R"],
        ["<code>Runnable</code>", "<code>void run()</code>", "nothing → nothing"],
      ],
    },
  },

  details: [
    {
      id: "values",
      title: "Functions as values",
      lec: [7],
      html: `
        <p>In functional programming, functions are <b>first-class values</b>: you can store them in variables (even as objects) and pass them around like data. That often gives shorter, more elegant solutions. Java is object-oriented but has supported this style since <b>Java 8</b>, and modern Java mixes both paradigms.</p>`,
    },
    {
      id: "evolution",
      title: "From named class to anonymous class to lambda",
      lec: [7],
      html: `
        <p>Task: sort a list of <code>DimmableLight</code> by brightness. <code>sort</code> needs a <code>Comparator</code>, so before Java 8 you’d write:</p>
        <ol>
          <li>A <b>named class</b> <code>BrightnessComparator implements Comparator&lt;DimmableLight&gt;</code>, then <code>lights.sort(new BrightnessComparator())</code>.</li>
          <li>An <b>anonymous class</b>: the same <code>compare</code> method, defined right at its only place of use with <code>new Comparator&lt;&gt;() { … }</code>.</li>
          <li>A <b>lambda</b>: <code>lights.sort((l1, l2) -&gt; Integer.compare(l1.getBrightness(), l2.getBrightness()))</code>. It expresses exactly and only what we want.</li>
        </ol>
        <p>In every version, the sort algorithm calls <code>compare</code> each time it compares two elements. The lambda’s main advantage is <b>conciseness</b>: far less boilerplate.</p>`,
    },
    {
      id: "functional-interface",
      title: "Functional interfaces",
      lec: [7],
      html: `
        <p>Why can <code>Comparator</code> be written as a lambda? Because it declares <b>only one abstract method</b>, <code>compare</code>. A lambda is an anonymous (nameless) function, and we can skip the name when there’s only one function to implement. The interface may still have <code>static</code> methods.</p>
        <p>Check <code>java.util.function</code> before inventing your own: <code>Predicate</code>, <code>Function</code>, <code>Consumer</code>, <code>Supplier</code>, <code>BiFunction</code>, plus <code>Runnable</code> (<code>void run()</code>). Standard interfaces are instantly recognizable and work with the Stream API.</p>`,
    },
    {
      id: "syntax",
      title: "Writing lambdas",
      lec: [7],
      html: `
        <ul>
          <li>No parameters: empty parentheses, <code>() -&gt; System.out.println("hi")</code></li>
          <li>One parameter: parentheses optional, <code>s -&gt; '"' + s + '"'</code></li>
          <li>Several parameters: parentheses required, <code>(l1, l2) -&gt; …</code></li>
          <li>Parameter types and the <b>return type are inferred</b>; you never write the return type.</li>
          <li>A one-expression body needs no braces (its value is returned). Several statements go in <code>{ … }</code>.</li>
        </ul>`,
    },
    {
      id: "method-refs",
      title: "Method references",
      lec: [7],
      html: `
        <p>A method reference passes an <b>existing method</b> as a function: <code>DimmableLight::getBrightness</code> means “call <code>getBrightness()</code> on each <code>DimmableLight</code> you’re given.” It is not a call on the class itself.</p>
        <p><code>Comparator.comparingInt(DimmableLight::getBrightness)</code> is a <b>static</b> method that returns a new <code>Comparator</code> comparing objects by the int the reference returns.</p>
        <p><b>Lambda or method reference?</b> The method reference is shorter, with less syntax in the way. The lambda’s named parameters can make the intent clearer, while a method reference can be more cryptic. Both are tools; pick the clearer one.</p>`,
    },
    {
      id: "capture",
      title: "Using variables from the enclosing scope",
      lec: [7],
      html: `
        <p>A lambda shares names with its enclosing scope: if <code>l1</code> already exists, <code>(l1, l2) -&gt; …</code> doesn’t compile. It can also <b>read</b> enclosing variables, but only ones that are <code>final</code> or <b>effectively final</b>: never modified after initialization. A loop counter like <code>i</code> in <code>for (int i = 0; …; i++)</code> changes, so a lambda can’t use it.</p>`,
    },
    {
      id: "when",
      title: "When (not) to use lambdas",
      lec: [7],
      html: `
        <p>Short, simple lambdas (often one line) are very readable. But lambdas have <b>no name, no documentation, and often no explicit types</b>, so readability suffers when one isn’t self-explanatory, runs longer than a few lines, or has complicated logic. Then a <b>named method or class</b> is clearer.</p>`,
    },
    {
      id: "primitive",
      title: "Primitive functional interfaces",
      lec: [7],
      html: `
        <p>Generics need reference types, so <code>Function&lt;DimmableLight, Integer&gt;</code> <b>boxes</b> every int. Boxing costs performance and can hide bugs (an unexpected <code>null</code>). Primitive versions avoid it: <code>IntPredicate</code>, <code>IntUnaryOperator</code>, <code>ToIntFunction&lt;T&gt;</code>, <code>IntFunction&lt;R&gt;</code>, <code>IntConsumer</code>, <code>IntSupplier</code> (and long/double variants).</p>
        <p><code>Comparator.comparingInt</code> takes a <code>ToIntFunction</code>, hence its name. Rule of thumb: for <code>int</code>, <code>long</code>, and <code>double</code>, prefer the primitive variants.</p>`,
    },
  ],

  code: [
    {
      title: "Three ways to sort by brightness",
      lec: [7],
      code: `// 1. Anonymous class
lights.sort(new Comparator<>() {
    @Override
    public int compare(DimmableLight l1, DimmableLight l2) {
        return Integer.compare(l1.getBrightness(), l2.getBrightness());
    }
});

// 2. Lambda
lights.sort((l1, l2) -> Integer.compare(l1.getBrightness(), l2.getBrightness()));

// 3. Method reference
lights.sort(Comparator.comparingInt(DimmableLight::getBrightness));`,
    },
    {
      title: "Standard functional interfaces",
      lec: [7],
      code: `Predicate<DimmableLight> isBright = light -> light.getBrightness() > 50;
Function<String, String> quote = s -> '"' + s + '"';
Consumer<Light> turnOn = Light::turnOn;
Supplier<DimmableLight> makeDefault = () -> new DimmableLight("default", 100);
BiFunction<Integer, Integer, Integer> avg = (a, b) -> (a + b) / 2;

quote.apply("hi");          // "\\"hi\\""
lights.forEach(turnOn);`,
    },
    {
      title: "Effectively final",
      lec: [7],
      code: `String message = "Hello";
Runnable ok = () -> System.out.println(message);   // fine: never reassigned

for (int i = 0; i < 10; i++) {
    Runnable bad = () -> System.out.println(i);    // compile error: i changes
}`,
    },
  ],

  flashcards: [
    { front: "Functional interface", back: "An interface with exactly <b>one abstract method</b>. Lambdas and method references can implement it." },
    { front: "Main advantage of a lambda over an anonymous class", back: "Conciseness: much less boilerplate for the same behavior." },
    { front: "<code>DimmableLight::getBrightness</code>", back: "A method reference: <code>getBrightness()</code> will be called on each DimmableLight instance." },
    { front: "<code>Comparator.comparingInt(f)</code>", back: "A static method returning a Comparator that compares by the int <code>f</code> returns. Takes a <code>ToIntFunction</code>." },
    { front: "Effectively final", back: "Never modified after initialization. Lambdas may only use enclosing local variables that are (effectively) final." },
    { front: "Predicate / Function / Consumer / Supplier", back: "T→boolean (test) / T→R (apply) / T→void (accept) / ()→T (get)." },
    { front: "Runnable", back: "<code>void run()</code>: no arguments, no result." },
    { front: "Why use ToIntFunction instead of Function&lt;T, Integer&gt;?", back: "Avoids boxing every int: faster, and no surprise nulls." },
    { front: "When should you avoid a lambda?", back: "When it’s long, complicated, or not self-explanatory. Use a named method or class." },
  ],

  quiz: [
    {
      type: "mc", lec: [7],
      q: "A teammate replaces a 6-line anonymous <code>Comparator</code> class with <code>(a, b) -&gt; Integer.compare(a.getArea(), b.getArea())</code>. What did that change gain?",
      options: ["The sort now uses a faster algorithm", "The same behavior in far less code, so it’s easier to read", "The comparator can now have two compare methods", "It can now change local variables freely"],
      answer: 1,
      explain: "The behavior is the same; the lambda just says it in far fewer lines.",
    },
    {
      type: "mc", lec: [7],
      q: "Which makes an interface usable with a lambda?",
      options: ["It has no methods at all", "It has exactly one abstract method", "All its methods are static", "It extends <code>Object</code>"],
      answer: 1,
      explain: "That’s a functional interface. Static (and default) methods don’t count toward the one.",
    },
    {
      type: "mc", lec: [7],
      q: "In <code>rooms.sort(Comparator.comparingInt(Room::getArea))</code>, what does <code>Room::getArea</code> do?",
      options: ["It calls getArea once, before sorting starts", "It hands the comparator the getArea method, which it calls on each Room it compares", "It requires getArea to be a static method", "It creates a new Room for every element"],
      answer: 1,
      explain: "A method reference passes the method itself as a value; <code>comparingInt</code> calls it on each pair of objects it compares.",
    },
    {
      type: "mc", lec: [7],
      q: "Which standard interface fits a function that takes a <code>Light</code> and returns <code>true</code> or <code>false</code>?",
      options: ["<code>Supplier&lt;Light&gt;</code>", "<code>Consumer&lt;Light&gt;</code>", "<code>Predicate&lt;Light&gt;</code>", "<code>Runnable</code>"],
      answer: 2,
      explain: "Predicate: <code>boolean test(T t)</code>.",
    },
    {
      type: "mc", lec: [7],
      q: "Why doesn’t <code>for (int i = 0; i &lt; 3; i++) { Runnable r = () -&gt; System.out.println(i); }</code> compile?",
      options: ["Runnable can’t print", "<code>i</code> isn’t effectively final, since the loop modifies it", "Lambdas can’t be declared inside loops", "<code>i</code> must be an Integer"],
      answer: 1,
      explain: "Lambdas may only use enclosing local variables that are final or effectively final.",
    },
    {
      type: "mc", lec: [7],
      q: "Why prefer <code>ToIntFunction&lt;DimmableLight&gt;</code> over <code>Function&lt;DimmableLight, Integer&gt;</code>?",
      options: ["It avoids boxing each int into an Integer", "Function can’t return numbers", "ToIntFunction can return null", "There’s no difference"],
      answer: 0,
      explain: "Primitive variants skip boxing: more efficient, and no surprise nulls.",
    },
    {
      type: "tf", lec: [7],
      q: "True or false: when writing a lambda, you must declare its return type.",
      answer: false,
      explain: "The return type (and usually parameter types) are inferred from context.",
    },
    {
      type: "mc", lec: [7],
      q: "A teammate wrote a 15-line lambda with nested ifs inside a <code>sort</code> call. What does the lecture suggest?",
      options: ["Keep it; lambdas are always more readable", "Move the logic into a named method or class", "Convert it to an anonymous class with the same body", "Delete the comparator"],
      answer: 1,
      explain: "Lambdas have no name or docs, so long or complicated ones hurt readability. A named method can be documented.",
    },
  ],
});
