// Exam questions for Inheritance & Access Modifiers. See ../../../course/exam.js for the format.
registerExam("inheritance", [
  {
    id: "trace-ctor-order", type: "trace", lec: [2], sec: "abstraction",
    q: "What does this print?",
    code: `class Base {
    Base() { System.out.println("Base"); }
}
class Child extends Base {
    Child() {
        super();
        System.out.println("Child");
    }
}

new Child();`,
    out: { kind: "output", text: "Base\nChild" },
    explain: "<code>super()</code> runs the parent constructor <b>first</b>, so the parent part of the object is set up before the child’s own code runs.",
  },
  {
    id: "trace-template", type: "trace", lec: [2], sec: "abstraction",
    q: "What does this print?",
    code: `abstract class BaseIoTDevice {
    private boolean on = false;
    public void turnOn() {
        on = true;
        System.out.println(identify() + " is on");
    }
    public abstract String identify();
}
class Fan extends BaseIoTDevice {
    public String identify() { return "Fan"; }
}

BaseIoTDevice d = new Fan();
d.turnOn();`,
    out: { kind: "output", text: "Fan is on" },
    explain: "<code>turnOn()</code> is inherited from <code>BaseIoTDevice</code>, but its call to <code>identify()</code> still uses dynamic dispatch: the object is a <code>Fan</code>, so <code>Fan</code>’s <code>identify()</code> runs.",
  },
  {
    id: "bug-private-field", type: "bug", lec: [2], sec: "access",
    q: "Which line doesn’t compile, and what’s the cleanest fix?",
    lines: [
      "public abstract class BaseIoTDevice implements IoTDevice {",
      "    private final String name;",
      "    protected BaseIoTDevice(String name) { this.name = name; }",
      "}",
      "",
      "public class Fan extends BaseIoTDevice {",
      "    public Fan(String name) { super(name); }",
      "    public String identify() { return \"Fan \" + name; }",
      "}",
    ],
    answer: 7,
    fixes: ["Make <code>name</code> <code>protected</code> in <code>BaseIoTDevice</code> (or add a <code>protected getName()</code>)", "Remove <code>super(name)</code>", "Make <code>Fan</code> abstract", "Declare another <code>name</code> field in <code>Fan</code>"],
    fix: 0,
    explain: "<code>private</code> means only <code>BaseIoTDevice</code> itself can use <code>name</code>. Subclasses need <code>protected</code> access (or a getter). Lecture did the same with <code>Light</code>’s fields for <code>DimmableLight</code>.",
  },
  {
    id: "mc-protected", type: "mc", lec: [2], sec: "access",
    q: "<code>Light</code>’s <code>brightness</code> field is <code>protected</code>. Which code <b>can’t</b> access it?",
    options: ["Code inside <code>Light</code>", "<code>DimmableLight</code>, a subclass in another package", "Another class in <code>Light</code>’s package", "An unrelated class in a different package"],
    answer: 3,
    whys: ["A class can always access its own fields.", "Subclasses can access protected members, even in another package.", "protected includes package access, so same-package classes can access it.", null],
    explain: "<code>protected</code> = the class itself, its package, and its descendants. An unrelated class in another package is shut out.",
  },
  {
    id: "design-helper-access", type: "design", lec: [2], sec: "rules",
    q: "<code>Light</code> has a helper method <code>clamp(int value)</code> that only <code>Light</code>’s own methods call. What access modifier should it get?",
    options: ["<code>public</code>", "<code>protected</code>", "<code>private</code>", "No modifier (package-private)"],
    answer: 2,
    whys: ["public exposes a helper nobody else needs.", "protected exposes it to subclasses and the package, which is more than needed.", null, "Package-private still exposes it to the whole package."],
    model: "<b>Hide what you can.</b> Nothing outside <code>Light</code> needs <code>clamp</code>, so make it <code>private</code>. That keeps it out of the class’s public contract, so you can change or delete it later without breaking anyone.",
    explain: "Start with the most restrictive modifier and loosen it only when something really needs access.",
  },
  {
    id: "tf-private-inherited", type: "tf", lec: [2], sec: "access",
    q: "True or false: a subclass can read its parent’s <code>private</code> fields directly by name.",
    answer: false,
    explain: "<code>private</code> members are visible only inside the class that declares them. Subclasses reach them through <code>protected</code> fields or methods instead.",
  },
  {
    id: "parsons-dimmable", type: "parsons", lec: [2], sec: "first-cut",
    q: "Build a <code>DimmableLight</code> constructor that passes the name up to <code>Light</code> and rejects a brightness outside 0–100.",
    lines: [
      "public DimmableLight(String name, int brightness) {",
      "    super(name);",
      "    if (brightness < 0 || brightness > 100) {",
      "        throw new IllegalArgumentException(\"brightness out of range: \" + brightness);",
      "    }",
      "    this.brightness = brightness;",
      "}",
    ],
    distractors: [
      { code: "        return;", why: "Returning silently would leave a half-built object with a bad value. Throw instead." },
      { code: "        throws new IllegalArgumentException(\"brightness out of range: \" + brightness);", why: "“throws” belongs in a method header; inside the body you use “throw”." },
    ],
    explain: "<code>super(name)</code> has to be the first statement. Then validate before assigning, so an invalid object is never created.",
  },
]);

// ---------- Batch 6 (exam-style multiple choice) ----------
registerExam("inheritance", [
  {
    id: "mc6-substitutable", type: "mc", lec: [2], sec: "is-a",
    q: "A method <code>dimAll(List&lt;Light&gt; lights)</code> was written and tested using plain <code>Light</code> objects. Later, <code>NightLight extends Light</code> is added. What should be true of NightLight?",
    options: ["dimAll should keep working correctly when the list contains NightLights", "dimAll must be rewritten to check for NightLight", "NightLight may change what setBrightness means, since it’s a new class", "NightLight must copy every method from Light unchanged"],
    answer: 0,
    whys: [null, "Needing to check for the subclass means it isn’t a safe substitute.", "A subclass may change how setBrightness works, but not what it promises.", "Subclasses can override methods; they just have to keep the parent’s promises."],
    explain: "Substitutability (the Liskov Substitution Principle): a subclass object must work anywhere its parent is expected. It can change <i>how</i> things are done, but must keep the parent’s promises.",
  },

  {
    id: "mc6-lsp-break", type: "mc", lec: [2], sec: "is-a",
    q: "<code>Light.setBrightness(b)</code> promises to accept 0–100. A subclass <code>NightLight</code> overrides it to throw for anything above 30. What’s wrong?",
    options: ["Nothing; subclasses can add any rules", "Code that works with any Light can now break when given a NightLight, so it isn’t a safe substitute", "Overriding setters isn’t allowed", "Nothing, as long as <code>NightLight</code>’s own Javadoc documents the lower limit"],
    answer: 1,
    whys: ["Subclasses can’t add rules that reject inputs the parent accepted.", null, "Overriding setters is allowed; this override breaks the parent’s promise.", "Documenting the limit doesn’t help code written against Light, which expects 0–100 to work."],
    explain: "A subclass that accepts less than its parent promises breaks substitutability (Liskov).",
  },
  {
    id: "mc6-is-a", type: "mc", lec: [2], sec: "is-a",
    q: "Which relationship is the best fit for <b>inheritance</b>?",
    options: ["A <code>Thermostat</code> has a <code>TemperatureSensor</code>", "A <code>Fan</code> is an <code>IoTDevice</code>", "A <code>House</code> has many <code>Rooms</code>", "A <code>Light</code> uses a <code>Logger</code>"],
    answer: 1,
    whys: ["That’s has-a: a thermostat contains a sensor, so it should be a field.", null, "That’s has-a: a house contains rooms, so they should be a field.", "That’s uses-a: a light depends on a logger, it isn’t one."],
    explain: "Inheritance models “is-a”. “Has-a” relationships are fields.",
  },
  {
    id: "mc6-super-first", type: "mc", lec: [2], sec: "abstraction",
    q: "In a subclass constructor, where must <code>super(name)</code> go?",
    options: ["Anywhere in the constructor", "It must be the first statement", "After the fields are assigned", "In a separate init() method"],
    answer: 1,
    whys: ["Java requires super(...) to be the very first statement.", null, "The parent must be set up before the subclass’s own code runs, including field assignments.", "super(...) can only be called from a constructor."],
    explain: "The parent part of the object is set up before the subclass’s own code runs.",
  },
  {
    id: "mc6-duplication", type: "mc", lec: [2], sec: "rules",
    q: "<code>Light</code>, <code>Fan</code>, and <code>Thermostat</code> each have identical <code>name</code> fields and <code>identifyPrefix()</code> methods. What does the lecture recommend?",
    options: ["Leave the copies; they’re small", "Move the shared parts up into a common (abstract) base class", "Make all three classes final", "Put the method in a utility class"],
    answer: 1,
    whys: ["Small copies still drift apart, and a fix has to be made in three places.", null, "final stops subclassing; it doesn’t remove the duplicate code.", "A utility class separates the method from the data it works on, so it isn’t the lecture’s fix."],
    explain: "Avoid duplication by moving shared parts up, as with <code>BaseIoTDevice</code>.",
  },

  // Calibration batch (2026-10-11): practice-exam style "why" questions with misconception distractors.
  {
    id: "cal-lsp-def", type: "mc", lec: [2], sec: "is-a",
    q: "Which statement best captures the <b>Liskov Substitution Principle</b>?",
    options: ["A subclass must reuse every method implementation of its parent unchanged", "An object of a subclass must work anywhere its parent type is expected, without breaking the program", "A subclass may add new methods but may never override existing ones", "Every subclass should be declared <code>final</code> so it can’t be substituted"],
    answer: 1,
    whys: ["Subclasses are allowed to override; reuse isn’t the rule.", null, "Overriding is allowed, as long as the subclass keeps the parent’s promises.", "Making subclasses final has nothing to do with substitution."],
    explain: "Subclasses may change <i>how</i> things are done (that’s what overriding is for), but they must keep every promise the parent makes so callers never notice the swap.",
  },
  {
    id: "cal-lsp-zero", type: "mc", lec: [2], sec: "is-a",
    q: "In CookYourBooks, <code>ExactQuantity</code>, <code>FractionalQuantity</code> and <code>RangeQuantity</code> all extend <code>Quantity</code>. Suppose <code>Quantity</code>’s spec promises that <code>toDecimal()</code> returns a positive number, and recipe-scaling code divides by it. A new subclass returns <code>0</code> from <code>toDecimal()</code> in some cases. What is the real problem?",
    options: ["Nothing, because the subclass compiles and overrides the method", "The subclass breaks a promise of its parent, so code written for any <code>Quantity</code> can fail when handed this one", "Overridden methods are not allowed to return a different value than the parent’s", "It only matters if the subclass is also declared abstract"],
    answer: 1,
    whys: ["Compiling isn’t the bar. The compiler doesn’t check promises in specs.", null, "Overrides may return different values; they just can’t break the parent’s promises.", "Being abstract has nothing to do with it. The broken promise is the issue."],
    explain: "Compiling isn’t the bar. Callers rely on the parent’s spec; a subclass that weakens it is not a safe substitute (Liskov).",
  },
  {
    id: "cal-lsp-stronger", type: "mc", lec: [2], sec: "is-a",
    q: "A subclass overrides a method so that it accepts <b>every input the parent accepts</b> and promises <b>slightly more</b> about the result (for example, the result is also rounded). Does this break substitutability?",
    options: ["Yes, any change to an overridden method’s behavior breaks substitutability", "No, callers still get everything the parent promised, so the subclass is a safe substitute", "Yes, because the subclass now returns different values than the parent", "No, but only because Java checks substitutability at compile time"],
    answer: 1,
    whys: ["Changes are fine if callers still get everything the parent promised.", null, "Different values are fine, as long as they keep the parent’s promises.", "Java never checks substitutability. That part of the answer is wrong."],
    explain: "Accepting at least as much and promising at least as much keeps every caller happy. The compiler never checks this; it’s a design rule you have to uphold.",
  },
  {
    id: "cal-abstract-new", type: "mc", lec: [2], sec: "abstraction",
    q: "<code>Quantity</code> is declared <code>abstract</code> and declares <code>toDecimal()</code> without a body. Someone writes <code>Quantity q = new Quantity();</code>. What happens, and why is that a good thing?",
    options: ["It compiles but <code>toDecimal()</code> returns 0, which is a safe default", "It’s a compile error, which is good: a quantity that isn’t any specific kind has no meaningful <code>toDecimal()</code>", "It throws an exception at runtime because abstract classes use less memory", "It compiles, because only interfaces can’t be instantiated"],
    answer: 1,
    whys: ["You can’t instantiate an abstract class at all, so there’s no default toDecimal().", null, "It never gets to run: the compiler rejects new on an abstract class. (Memory isn’t the reason.)", "Abstract classes can’t be instantiated either."],
    explain: "Abstract classes can’t be instantiated. That guarantees every <code>Quantity</code> you meet is a concrete kind that implements the abstract methods.",
  },
]);
