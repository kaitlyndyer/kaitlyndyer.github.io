registerConcept({
  id: "information-hiding",
  oneLiner:
    "Design for change: split the system into <b>modules</b> with clear interfaces, and use the language to <b>hide</b> everything else.",

  related: ["coupling-cohesion", "inheritance", "interfaces"],

  summary: {
    keyPoints: [
      { lec: [8], html: "Working code isn’t enough: systems get repaired, enhanced, and grown, and every change costs review and testing. <b>Changeability</b> is a design problem." },
      { lec: [8], html: "<b>Modularity</b>: like a car’s parts, each module has one well-defined role and a clear interface. Modules can then be built in parallel, and individually optimized, changed, and tested." },
      { lec: [8], kind: "key", html: "<b>Information hiding</b> enforces that modules use each other <b>only through interfaces</b>. <b>Hyrum’s Law</b>: with enough users, every observable behavior gets depended on by someone." },
      { lec: [8], html: "Interfaces as shields: every <code>public</code> method should come from an interface, and callers should refer to the interface type." },
      { lec: [8], html: "Minimize accessibility: fields <code>private</code> by default. A public field lets anyone break the class’s <b>invariant</b>." },
      { lec: [8], kind: "key", html: "Immutable class recipe: no mutators, <code>final</code> class, <code>private final</code> fields, and <b>defensive copies</b> of mutable reference fields." },
      { lec: [8], html: "<b>Sealed</b> classes allow only listed subclasses (<code>permits</code>). The <b>module system</b> (<code>module-info.java</code>, <code>exports</code>) hides whole packages." },
    ],
    compare: {
      head: ["Scope", "Mechanism", "What it hides"],
      rows: [
        ["Field", "<code>private</code>", "State inside a class"],
        ["Class", "package-private (no keyword)", "Helper classes inside a package"],
        ["Hierarchy", "<code>sealed … permits</code>", "The ability to extend a type"],
        ["Library", "module system (<code>exports</code>)", "Internal packages of a library"],
      ],
    },
  },

  details: [
    {
      id: "changeability",
      title: "Why changeability?",
      lec: [8],
      html: `
        <p>A correctly working program is useful, but not enough. Systems are constantly repaired, enhanced, debugged, and grown, and every change needs review and testing, which costs time and money. (“Software engineering is the integral of programming over time.”)</p>
        <p>The goal is software that can <b>withstand inevitable change</b>. That’s a lofty, underspecified goal (which changes? how do we anticipate them?), so the lecture focuses on four design aspects that make change easier: <b>modularity</b>, <b>information hiding</b>, <b>coupling</b>, and <b>cohesion</b>.</p>`,
    },
    {
      id: "modularity",
      title: "Modularity",
      lec: [8],
      html: `
        <p>Break the system into relatively <b>independent modules</b>. Think of a car: one object, but really a sum of well-defined parts, each with a specific purpose, fitting together the same way no matter how each is made.</p>
        <ul>
          <li>You can think about <b>one part at a time</b>, which tames complexity.</li>
          <li>A clear specification gives each module a <b>well-defined interface</b>, so it can be implemented knowing only that interface, and several developers can build modules simultaneously.</li>
          <li>Independent modules can be individually <b>optimized</b>, <b>changed</b> without affecting others, and <b>verified</b> more easily.</li>
        </ul>
        <p>A module can be a class, a package, or a whole program, and modules compose into larger ones.</p>`,
    },
    {
      id: "hiding",
      title: "Information hiding and Hyrum’s Law",
      lec: [8],
      html: `
        <p>The intent of modularity is that modules use each other <b>only through their interfaces</b>. In practice, code gets written based on what <i>can</i> be done, not what <i>should</i> be done. <b>Hyrum’s Law</b>: with enough users of an API, every observable behavior will be depended on by somebody.</p>
        <p>Information hiding puts <b>guardrails</b> in the code so the modular intent becomes reality. Effective hiding is <b>enforced by the language</b>, not left to developers “doing the right thing.” Python’s <code>__name__</code> convention signals “internal” but anyone can still change it; Java’s <code>private</code> makes <code>l.power = 50</code> a compile error.</p>
        <p><b>Interfaces as shields:</b> an interface specifies the <i>what</i> without the <i>how</i>. If every public method comes from an interface and callers use only the interface type, the implementation can change without affecting other modules.</p>`,
    },
    {
      id: "access",
      title: "Access modifiers and invariants",
      lec: [8],
      html: `
        <p>The four levels: <code>private</code> (class only), package-private (no keyword; package only), <code>protected</code> (package + subclasses), and <code>public</code> (anywhere).</p>
        <p>Example: a <code>Counter</code> promises its count is never negative and only increases. With <code>public int count</code>, any caller can write <code>c.count = 0</code> and break that <b>invariant</b>, so nobody can rely on the class. Making the field <code>private</code> (with a <code>getCount()</code> getter) lets the class <b>enforce</b> its invariant.</p>
        <p><b>Best practice: minimize accessibility.</b> Fields as restrictive as possible (<code>private</code> by default). Make as many methods non-public as possible; every public method (except constructors) should come from an interface.</p>`,
    },
    {
      id: "immutability",
      title: "Immutability and defensive copies",
      lec: [8],
      html: `
        <p><b>Immutable</b> objects can’t change after creation. They’re simpler to reason about, their behavior is fixed by the constructor, and you know they won’t change when passed around. Rule: <b>immutable by default</b>, mutable only for good reason.</p>
        <p><code>final</code> on a field means the <b>variable</b> can’t be reassigned. For a reference field, that only fixes <i>which</i> object it points to; the object’s contents can still change. If a constructor stores the caller’s array directly, the caller can later change it (<code>number[0] = 4</code>) and the “immutable” object changes too, because both share an <b>alias</b>.</p>
        <p>Fix: a <b>defensive copy</b>. Copy the array in the constructor (for example with <code>System.arraycopy</code>), and copy again in any getter that returns it.</p>
        <p><b>Recipe for an immutable class:</b> no mutators; make the class <code>final</code> (so subclasses can’t add mutability); make all fields <code>final</code> and <code>private</code>; make defensive copies of mutable reference fields.</p>`,
    },
    {
      id: "sealed",
      title: "Sealed classes",
      lec: [8],
      html: `
        <p><code>final</code> forbids inheritance entirely. A <b>sealed</b> class allows <b>only the subclasses it lists</b>: <code>public sealed class IoTDevice permits DimmableLight, SwitchedLight, Thermostat</code>. Any other subclass fails to compile.</p>
        <p>Each permitted subclass must say how it continues: <code>final</code> (no further subclasses), <code>sealed</code> (with its own <code>permits</code>), or <code>non-sealed</code> (reopens the hierarchy).</p>
        <p>Why it helps changeability:</p>
        <ol>
          <li><b>Controlled evolution</b>: you can add permitted subclasses later, with no surprise subclasses in the wild.</li>
          <li><b>Exhaustive pattern matching</b>: the compiler knows every subtype.</li>
          <li><b>Domain modeling</b>: closed sets of possibilities, like a payment method that is only a credit card, bank transfer, or digital wallet.</li>
        </ol>`,
    },
    {
      id: "modules",
      title: "The Java module system",
      lec: [8],
      html: `
        <p>Class-level hiding isn’t enough for libraries: they need internal helper classes that are <code>public</code> (shared across the library’s packages) but not meant for consumers. Before Java 9, the best you could do was write “internal, do not use” in Javadoc. Consumers used them anyway and broke when they changed: Hyrum’s Law at library scale.</p>
        <p>Java 9 modules fix this: <code>module-info.java</code> lists the packages a module <code>exports</code>. Unexported packages are invisible to consumers, <b>even their public classes</b>. The result: less coupling, clearer contracts (exported packages are the API), and safer evolution.</p>`,
    },
  ],

  code: [
    {
      title: "A public field breaks the invariant",
      lec: [8],
      code: `/** A counter. The count is never negative and only increases. */
public class Counter {
    public int count;                    // anyone can write c.count = 0
    public void increment() { count++; }
}

// Fixed: the class enforces its invariant
public class Counter {
    private int count;
    public int getCount() { return count; }
    public void increment() { count++; }
}`,
    },
    {
      title: "final isn’t enough: defensive copies",
      lec: [8],
      code: `public final class PhoneNumber {
    private final short[] number;

    public PhoneNumber(short[] number) {
        // this.number = number;  ← would share the caller's array!
        this.number = new short[number.length];
        System.arraycopy(number, 0, this.number, 0, number.length);
    }
}`,
    },
    {
      title: "Sealed hierarchy",
      lec: [8],
      code: `public sealed class IoTDevice permits DimmableLight, SwitchedLight, Thermostat { }

public final class DimmableLight extends IoTDevice { }   // no further subclasses
public final class SwitchedLight extends IoTDevice { }
public non-sealed class Thermostat extends IoTDevice { } // reopened

public class Fan extends IoTDevice { }                   // compile error: not permitted`,
    },
    {
      title: "module-info.java",
      lec: [8],
      code: `module com.smarthome {
    exports com.smarthome.devices;   // public API
    exports com.smarthome.hubs;
    // com.smarthome.hubs.simplehub is not exported:
    // its public classes are invisible to consumers
}`,
    },
  ],

  flashcards: [
    { front: "Changeability", back: "How well a design withstands inevitable change. A design and engineering problem." },
    { front: "Modularity", back: "Splitting a system into relatively independent modules with well-defined interfaces." },
    { front: "Information hiding", back: "Language-enforced guardrails so modules use each other only through their interfaces." },
    { front: "Hyrum’s Law", back: "With enough users of an API, every observable behavior will be depended on by somebody." },
    { front: "Why make fields private?", back: "So the class can enforce its invariants; a public field lets anyone break them." },
    { front: "What does <code>final</code> on a reference field guarantee?", back: "Only that it always points to the same object, not that the object’s contents can’t change." },
    { front: "Defensive copy", back: "Copying a mutable argument (or return value) so callers can’t change the object’s internal state through an alias." },
    { front: "Immutable class recipe", back: "No mutators, final class, private final fields, defensive copies of mutable references." },
    { front: "Sealed class", back: "<code>sealed … permits A, B</code>: only the listed subclasses are allowed." },
    { front: "final / sealed / non-sealed subclass", back: "No further subclasses / its own permits list / open to anyone." },
    { front: "module-info.java <code>exports</code>", back: "Lists a module’s public API packages. Unexported packages are hidden, even their public classes." },
  ],

  quiz: [
    {
      type: "mc", lec: [8],
      q: "What does Hyrum’s Law say?",
      options: ["Every program eventually becomes a library", "With enough users of an API, every observable behavior will be depended on by somebody", "Modules should have at most seven methods", "Private fields make code slower"],
      answer: 1,
      explain: "That’s why hiding must be enforced: if something can be used, someone will use it.",
    },
    {
      type: "mc", lec: [8],
      q: "A <code>Counter</code> promises its count never decreases, but its field is <code>public int count</code>. What’s the problem?",
      options: ["Public fields don’t compile", "Any caller can set <code>count</code> directly, breaking the invariant", "It uses too much memory", "Counters must be records"],
      answer: 1,
      explain: "Making the field private lets the class enforce its invariant.",
    },
    {
      type: "mc", lec: [8],
      q: "A class has <code>private final List&lt;String&gt; rooms</code>, assigned straight from a constructor argument. Is the object immutable?",
      options: ["Yes, <code>final</code> makes the list unchangeable", "No: the caller still holds the same list and can change its contents", "Yes, because the field is private", "No, because lists can’t be final"],
      answer: 1,
      explain: "<code>final</code> only fixes which object the field points to. A defensive copy is needed.",
    },
    {
      type: "mc", lec: [8],
      q: "Which is <b>not</b> part of the recipe for an immutable class?",
      options: ["Make all fields private and final", "Make the class final", "Provide a setter for each field", "Make defensive copies of mutable reference fields"],
      answer: 2,
      explain: "Immutable classes provide no mutators at all.",
    },
    {
      type: "mc", lec: [8],
      q: "What does <code>public sealed class IoTDevice permits DimmableLight, Thermostat</code> do?",
      options: ["Makes IoTDevice impossible to extend", "Allows only DimmableLight and Thermostat to extend IoTDevice", "Makes all IoTDevice fields private", "Hides IoTDevice from other packages"],
      answer: 1,
      explain: "Sealed classes allow exactly the permitted subclasses; others fail to compile.",
    },
    {
      type: "mc", lec: [8],
      q: "Why is information hiding most effective when <b>enforced by the language</b>?",
      options: ["It makes programs run faster", "It doesn’t rely on every developer “doing the right thing”", "It removes the need for interfaces", "Python requires it"],
      answer: 1,
      explain: "Conventions (like Python’s underscores) are easily ignored; access modifiers make violations compile errors.",
    },
    {
      type: "mc", lec: [8],
      q: "In Java 9+, what happens to a <code>public</code> class in a package the module does <b>not</b> export?",
      options: ["It’s still usable by any consumer", "It’s invisible to code outside the module", "It becomes private", "It fails to compile"],
      answer: 1,
      explain: "Only exported packages form the module’s API, so internals stay hidden even if public.",
    },
    {
      type: "tf", lec: [8],
      q: "True or false: the lecture recommends that every public method (other than constructors) come from an interface.",
      answer: true,
      explain: "Then callers depend only on the interface, shielding them from implementation changes.",
    },
  ],
});
