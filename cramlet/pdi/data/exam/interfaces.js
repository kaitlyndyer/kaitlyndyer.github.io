registerExam("interfaces", [
  {
    id: "parsons-base", type: "parsons", lec: [2], sec: "base-class",
    q: "Build an abstract base class that stores a device’s <code>name</code>, and a <code>Fan</code> that extends it.",
    lines: [
      "public abstract class BaseIoTDevice implements IoTDevice {",
      "    private final String name;",
      "    protected BaseIoTDevice(String name) {",
      "        this.name = name;",
      "    }",
      "}",
      "public class Fan extends BaseIoTDevice {",
      "    public Fan(String name) {",
      "        super(name);",
      "    }",
      "}",
    ],
    distractors: [
      { code: "public class Fan implements BaseIoTDevice {", why: "BaseIoTDevice is a class, so Fan extends it; you implement interfaces." },
      { code: "        this.name = name;   // in Fan's constructor", why: "name is private to BaseIoTDevice, so Fan can’t assign it; call super(name) instead." },
    ],
    explain: "Shared state lives in the abstract base class, and the subclass passes it up with <code>super(name)</code> as the first line of its constructor.",
  },
  {
    id: "design-skeletal", type: "design", lec: [2], sec: "skeletal",
    q: "Several device classes share the same <code>name</code> field and <code>isOn</code> logic, and other code should only depend on what devices <b>can do</b>. What’s the best design?",
    options: ["Just an interface", "Just an abstract class", "An interface plus an abstract base class that implements it", "Copy the shared code into each class"],
    answer: 2,
    model: "This is the skeletal implementation pattern from lecture. The interface (<code>IoTDevice</code>) is what other code depends on, and the abstract base class (<code>BaseIoTDevice</code>) holds the shared fields and code so each device class stays small.",
    explain: "Interfaces describe <i>what</i> an object does; abstract classes share <i>how</i>. Using both gives you each benefit, like the JDK’s <code>List</code> + <code>AbstractList</code>.",
  },
  {
    id: "multi-interface", type: "multi", lec: [2], sec: "three-kinds",
    q: "Which are true about Java interfaces as defined in lecture?",
    options: ["They declare what an object can do, not what it has", "A class can implement several interfaces", "You can create one with new", "They can declare instance fields"],
    answers: [0, 1],
    explain: "An interface lists public method signatures. A class can implement many of them, but you can’t instantiate an interface, and it has no instance fields.",
  },
]);
