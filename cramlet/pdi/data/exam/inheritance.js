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
    explain: "<code>protected</code> = the class itself, its package, and its descendants. An unrelated class in another package is shut out.",
  },
  {
    id: "design-helper-access", type: "design", lec: [2], sec: "rules",
    q: "<code>Light</code> has a helper method <code>clamp(int value)</code> that only <code>Light</code>’s own methods call. What access modifier should it get?",
    options: ["<code>public</code>", "<code>protected</code>", "<code>private</code>", "No modifier (package-private)"],
    answer: 2,
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
