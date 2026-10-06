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

// ---------- Batch 1 (lectures 1–2) ----------
registerExam("interfaces", [
  {
    id: "trace-new-interface", type: "trace", lec: [2], sec: "three-kinds",
    q: "What happens?",
    code: `IoTDevice d = new IoTDevice();
System.out.println(d.identify());`,
    out: { kind: "compile" },
    explain: "An interface has no implementation, so you can’t create one with <code>new</code>. You create a class that implements it, like <code>new Light(…)</code>.",
  },
  {
    id: "bug-missing-methods", type: "bug", lec: [2], sec: "three-kinds",
    q: "<code>IoTDevice</code> declares <code>identify()</code>, <code>turnOn()</code>, <code>turnOff()</code>, and <code>isOn()</code>. Which line causes the compile error, and how do you fix it?",
    lines: [
      "public class Fan implements IoTDevice {",
      "    private boolean on;",
      "",
      "    @Override",
      "    public String identify() {",
      "        return \"Fan\";",
      "    }",
      "}",
    ],
    answer: 0,
    fixes: ["Implement <code>turnOn()</code>, <code>turnOff()</code>, and <code>isOn()</code> (or declare <code>Fan</code> abstract)", "Remove <code>@Override</code>", "Make <code>on</code> public", "Change <code>implements</code> to <code>extends</code>"],
    fix: 0,
    explain: "A concrete class must implement <b>every</b> method of the interfaces it implements. The compiler reports it on the class declaration: <i>Fan is not abstract and does not override abstract method turnOn()</i>.",
  },
  {
    id: "design-isp-thermostat", type: "design", lec: [6], sec: "isp",
    q: "<code>Thermostat</code> implements <code>IoTDevice</code>, which includes <code>turnOn()</code> and <code>turnOff()</code>, but a thermostat is always on. What’s the best fix?",
    options: ["Leave <code>turnOff()</code> empty", "Make <code>turnOff()</code> throw <code>UnsupportedOperationException</code>", "Split out a <code>Switchable</code> interface with <code>turnOn</code>/<code>turnOff</code>, and only switchable devices implement it", "Remove <code>Thermostat</code>"],
    answer: 2,
    model: "That’s the <b>Interface Segregation Principle</b>: clients should only see the methods relevant to them. Keep <code>IoTDevice</code> small, put on/off in <code>Switchable</code>, and have <code>Light</code> and <code>Fan</code> implement both while <code>Thermostat</code> doesn’t.",
    explain: "Empty or throwing methods are a sign the interface is too big for this class.",
  },
  {
    id: "fill-abstract-base", type: "fill", lec: [2], sec: "base-class",
    q: "Fill in the blanks: <code>BaseIoTDevice</code> holds shared code but doesn’t implement <code>identify()</code>, and <code>Fan</code> builds on it.",
    code: `public [[1]] class BaseIoTDevice [[2]] IoTDevice {
    private final String name;
    protected BaseIoTDevice(String name) { this.name = name; }
}

public class Fan [[3]] BaseIoTDevice {
    public Fan(String name) {
        [[4]](name);
    }
}`,
    blanks: [["abstract"], ["implements"], ["extends"], ["super"]],
    explain: "A class that doesn’t implement every interface method must be <code>abstract</code>. Classes <code>implement</code> interfaces and <code>extend</code> classes, and a subclass constructor passes values up with <code>super(…)</code>.",
  },
  {
    id: "multi-abstract", type: "multi", lec: [2], sec: "three-kinds",
    q: "Which can an <b>abstract class</b> have?",
    options: ["Fields", "Constructors", "Methods with bodies", "Objects created directly with <code>new</code>"],
    answers: [0, 1, 2],
    explain: "An abstract class is an incomplete blueprint: it can have fields, constructors (called with <code>super</code>), and implemented methods, but you can’t instantiate it.",
  },
  {
    id: "write-switchable", type: "write", lec: [2, 6], sec: "isp",
    q: "Write an interface <code>Switchable</code> with <code>turnOn()</code>, <code>turnOff()</code>, and <code>isOn()</code>, and a class <code>Fan</code> that implements it using a <code>private boolean</code> field.",
    rubric: [
      { text: "Declares <code>interface Switchable</code>", re: "interface\\s+Switchable" },
      { text: "Declares all three methods without bodies (<code>void turnOn();</code> …)", re: "^(?=[\\s\\S]*void\\s+turnOn\\s*\\(\\s*\\)\\s*;)(?=[\\s\\S]*void\\s+turnOff\\s*\\(\\s*\\)\\s*;)(?=[\\s\\S]*boolean\\s+isOn\\s*\\(\\s*\\)\\s*;)", flags: "" },
      { text: "<code>class Fan implements Switchable</code>", re: "class\\s+Fan\\s+implements\\s+Switchable" },
      { text: "A <code>private boolean</code> field for the state", re: "private\\s+boolean\\s+\\w+" },
      { text: "Implements all three as <code>public</code> methods", re: "^(?=[\\s\\S]*public\\s+void\\s+turnOn\\s*\\(\\s*\\)\\s*\\{)(?=[\\s\\S]*public\\s+void\\s+turnOff\\s*\\(\\s*\\)\\s*\\{)(?=[\\s\\S]*public\\s+boolean\\s+isOn\\s*\\(\\s*\\)\\s*\\{)", flags: "" },
      { text: "<code>@Override</code> on the implemented methods", re: "(@Override[\\s\\S]*){3}" },
    ],
    model: `public interface Switchable {
    void turnOn();
    void turnOff();
    boolean isOn();
}

public class Fan implements Switchable {
    private boolean on = false;

    @Override
    public void turnOn() { on = true; }

    @Override
    public void turnOff() { on = false; }

    @Override
    public boolean isOn() { return on; }
}`,
    explain: "Interface methods are implicitly <code>public</code> and abstract, so the implementations must be <code>public</code>. <code>@Override</code> makes the compiler check that each one really matches the interface.",
  },
]);
