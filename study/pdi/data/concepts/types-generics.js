registerConcept({
  id: "types-generics",
  oneLiner:
    "Generics make containers <b>reusable and type-safe</b>. Primitive vs. reference types decide how assignment, <code>==</code>, and method calls behave, and Java is <b>always pass-by-value</b>.",

  related: ["collections", "contracts", "polymorphism"],

  summary: {
    keyPoints: [
      { lec: [3], html: "Without generics, containers hold <code>Object</code>, so mistakes compile fine and crash at <b>runtime</b> with <code>ClassCastException</code>." },
      { lec: [3], html: "<code>List&lt;Light&gt;</code> uses a <b>type parameter</b>, so adding a <code>Fan</code> won’t compile. Errors move to <b>compile time</b>." },
      { lec: [3], html: "⚠️ <b>Raw types</b> (<code>new ArrayList()</code>) aren’t type-safe. In this course, <b>unchecked warnings count as errors</b>." },
      { lec: [3], html: "<b>Primitive</b> variables hold the value. <b>Reference</b> variables hold an address of an object elsewhere in memory." },
      { lec: [3], html: "Java is <b>always pass-by-value</b>: the variable’s contents are copied. For references, the <i>address</i> is copied, so mutations are visible to the caller but reassignment isn’t." },
      { lec: [3], html: "Type parameters must be reference types, so use <b>wrappers</b> (<code>Integer</code>, <code>Double</code>…). Java <b>autoboxes</b> <code>int ↔ Integer</code>." },
    ],
    compare: {
      head: ["", "Primitive types", "Reference types"],
      rows: [
        ["Examples", "<code>boolean</code>, <code>byte</code>, <code>short</code>, <code>int</code>, <code>long</code>, <code>float</code>, <code>double</code>, <code>char</code> (8 total)", "Classes, interfaces, arrays"],
        ["Variable holds", "The value itself", "A reference (address) to an object"],
        ["<code>b = a</code>", "Copies the value", "Both point to the <b>same object</b>"],
        ["<code>a == b</code>", "Same value?", "Same object? (not “equal values”)"],
        ["Passed to a method", "Changes stay inside the method", "Mutating the object is visible to the caller; reassigning the parameter isn’t"],
      ],
    },
  },

  details: [
    {
      id: "problem",
      title: "The problem: Object-based containers",
      lec: [3],
      html: `
        <p>Code shouldn’t care <i>what</i> it stores, only that it stores it safely. Without generics, the only way to write a reusable list is to store <code>Object</code>, the superclass of everything.</p>
        <p>Then every element is “just an <code>Object</code>”: you have to remember each element’s type and cast it yourself. Get it wrong and the code still compiles, but throws <code>ClassCastException</code> <b>at runtime</b>.</p>`,
    },
    {
      id: "generics",
      title: "The fix: generic types",
      lec: [3],
      html: `
        <p>Add a <b>type parameter</b>: <code>List&lt;ElementType&gt;</code>. A type with a parameter is a <b>parameterized type</b>, and now the list itself enforces what it can hold.</p>
        <p>The compiler catches mistakes <b>before the program runs</b>. That’s the core advantage of statically typed languages like Java over dynamically typed ones like Python.</p>`,
    },
    {
      id: "raw",
      title: "Raw types and unchecked warnings",
      lec: [3],
      html: `
        <ul>
          <li>A <b>raw type</b> is a generic type used without its parameter, like <code>List list = new ArrayList();</code>. It exists only for backward compatibility (generics arrived in Java 5).</li>
          <li>An <b>unchecked warning</b> means the compiler couldn’t verify type safety.</li>
          <li>📌 <b>In this course, unchecked warnings count as errors.</b> Always give the type parameter: <code>new ArrayList&lt;Light&gt;()</code> or <code>new ArrayList&lt;&gt;()</code>.</li>
        </ul>`,
    },
    {
      id: "two-types",
      title: "A tale of two types",
      lec: [3],
      html: `
        <p>Every Java type is either <b>primitive</b> or a <b>reference</b> type.</p>
        <ul>
          <li><b>Primitive</b> (8 of them): <code>boolean</code>; whole numbers <code>byte</code>, <code>short</code>, <code>int</code>, <code>long</code>; floating-point <code>float</code>, <code>double</code>; and <code>char</code>. The variable is a small chunk of memory holding the value directly.</li>
          <li><b>Reference</b>: classes, interfaces, arrays. The variable stores a <b>reference (address)</b> to the object, not the object itself. Assigning one reference to another makes both point to the <b>same object</b>.</li>
        </ul>
        <p>⚠️ For references, <code>a == b</code> checks whether they point to the same object, not whether they represent equal values. (For value equality, see <b>equals, hashCode &amp; compareTo</b>.)</p>`,
    },
    {
      id: "pass-by-value",
      title: "Method arguments: always pass-by-value",
      lec: [3],
      html: `
        <p>Java always copies the contents of the variable into the parameter.</p>
        <ul>
          <li><b>Primitive argument:</b> the value is copied, so changes inside the method never escape it.</li>
          <li><b>Reference argument:</b> the address is copied, so both variables point to the same object.
            <ul>
              <li><b>Mutating</b> the object through the parameter <b>is visible</b> to the caller.</li>
              <li><b>Reassigning</b> the parameter to a new object <b>is not visible</b> to the caller.</li>
            </ul>
          </li>
        </ul>
        <p>Most of Java’s object behavior follows directly from this distinction.</p>`,
    },
    {
      id: "wrappers",
      title: "Wrapper types and autoboxing",
      lec: [3],
      html: `
        <p>Type parameters (the <code>T</code> in <code>List&lt;T&gt;</code>) can only be <b>reference types</b>, so <code>List&lt;int&gt;</code> is illegal. Java provides wrapper types instead: <code>Integer</code>, <code>Double</code>, <code>Boolean</code>, <code>Character</code>, and so on.</p>
        <p>Java converts automatically: <b>autoboxing</b> (<code>int → Integer</code>) and <b>auto-unboxing</b> (<code>Integer → int</code>). Prefer primitives when you can, because they’re faster and use less memory.</p>`,
    },
  ],

  code: [
    {
      title: "Without generics: compiles, then crashes",
      lec: [3],
      code: `public interface List {
    void add(Object o);
    Object get(int index);
}

list.add(new TunableWhiteLight(2700));
list.add(new Fan());
// Compiles fine, but throws ClassCastException at runtime!
TunableWhiteLight light = (TunableWhiteLight) list.get(1);`,
    },
    {
      title: "With generics: the compiler catches it",
      lec: [3],
      code: `public interface List<ElementType> {
    void add(ElementType o);
    ElementType get(int index);
}

List<Light> lights = new ArrayList<Light>();
lights.add(new TunableWhiteLight(2700));
lights.add(new Fan());   // This will not compile!`,
    },
    {
      title: "Pass-by-value in action",
      lec: [3],
      note: "An illustration of the lecture’s rules (method names are made up for the example).",
      code: `void reset(int x) { x = 0; }
void dim(Light l) { l.setBrightness(10); }
void replace(Light l) { l = new Light("new", 100); }

int n = 5;
reset(n);              // n is still 5 (the value was copied)

Light lamp = new Light("lamp", 80);
dim(lamp);             // lamp's brightness IS now 10 (same object)
replace(lamp);         // lamp still points to the original object`,
    },
    {
      title: "Autoboxing",
      lec: [3],
      code: `List<Integer> list = new ArrayList<>();
list.add(1);            // autobox: int -> Integer
int x = list.get(0);    // auto-unbox: Integer -> int`,
    },
  ],

  flashcards: [
    { front: "Type parameter", back: "The placeholder in a generic type, like <code>ElementType</code> in <code>List&lt;ElementType&gt;</code>." },
    { front: "Raw type", back: "A generic type used without its parameter (<code>new ArrayList()</code>). Not type-safe; kept for backward compatibility." },
    { front: "Unchecked warnings in this course", back: "They count as <b>errors</b>. Always eliminate them." },
    { front: "The 8 primitive types", back: "<code>boolean</code>, <code>byte</code>, <code>short</code>, <code>int</code>, <code>long</code>, <code>float</code>, <code>double</code>, <code>char</code>." },
    { front: "What does <code>==</code> check for references?", back: "Whether both point to the <b>same object</b>, not whether the values are equal." },
    { front: "Is Java pass-by-value or pass-by-reference?", back: "<b>Always pass-by-value.</b> For references, the address is the value that gets copied." },
    { front: "Mutating vs. reassigning a reference parameter", back: "Mutating the object <b>is</b> visible to the caller. Reassigning the parameter <b>is not</b>." },
    { front: "Autoboxing", back: "Java’s automatic conversion between primitives and wrappers, like <code>int ↔ Integer</code>." },
  ],

  quiz: [
    {
      type: "mc", lec: [3],
      q: "What happens with this code?",
      code: `List<Light> lights = new ArrayList<>();
lights.add(new Fan());`,
      options: ["It compiles and works", "It compiles, then throws ClassCastException", "It doesn’t compile", "The Fan is silently converted to a Light"],
      answer: 2,
      explain: "The type parameter makes the compiler reject a <code>Fan</code>. That’s the point of generics: catch it before runtime.",
    },
    {
      type: "mc", lec: [3],
      q: "What does this print?",
      code: `void reset(int x) { x = 0; }

int n = 5;
reset(n);
System.out.println(n);`,
      options: ["0", "5", "null", "It doesn’t compile"],
      answer: 1,
      explain: "Primitives are copied. Changing <code>x</code> inside <code>reset</code> never affects <code>n</code>.",
    },
    {
      type: "mc", lec: [3],
      q: "After this runs, what is <code>lamp</code>’s name?",
      code: `void replace(Light l) { l = new Light("new", 100); }

Light lamp = new Light("lamp", 80);
replace(lamp);`,
      options: ["\"new\"", "\"lamp\"", "null", "It depends on the JVM"],
      answer: 1,
      explain: "The address was copied into <code>l</code>. Reassigning <code>l</code> only changes the local copy, so <code>lamp</code> still points to the original object.",
    },
    {
      type: "bug", lec: [3],
      q: "Which line would produce an unchecked warning (an error in this course)?",
      lines: [
        "List<Light> a = new ArrayList<Light>();",
        "List<Light> b = new ArrayList<>();",
        "List c = new ArrayList();",
        "List<Integer> d = new ArrayList<>();",
      ],
      answer: 2,
      explain: "<code>List c = new ArrayList();</code> uses raw types. Always specify the type parameter.",
    },
    {
      type: "mc", lec: [3],
      q: "Why is <code>List&lt;int&gt;</code> illegal?",
      options: ["Lists can’t hold numbers", "Type parameters must be reference types, so you use <code>List&lt;Integer&gt;</code>", "<code>int</code> is deprecated", "It’s legal"],
      answer: 1,
      explain: "Generics only work with reference types. Wrappers like <code>Integer</code> fill the gap, with autoboxing doing the conversion.",
    },
    {
      type: "tf", lec: [3],
      q: "True or false: if <code>a</code> and <code>b</code> are two different <code>Light</code> objects with identical fields, <code>a == b</code> is true.",
      answer: false,
      explain: "For references, <code>==</code> checks whether they’re the same object. Two separate objects are never <code>==</code>.",
    },
  ],
});
