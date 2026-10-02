registerConcept({
  id: "inheritance",
  oneLiner:
    "Inheritance models real-world <b>“is-a”</b> relationships. Push shared code <b>up</b> the hierarchy, and use <b>access modifiers</b> to hide everything you can.",

  related: ["interfaces", "polymorphism", "paradigms"],

  summary: {
    keyPoints: [
      { lec: [2], html: "Core principle: <b>make your data mean something</b>. Program elements should mirror real-world concepts." },
      { lec: [2], html: "<b>Inheritance = “is-a”</b>: a Light <i>is an</i> IoT device, a Rook <i>is a</i> chess piece. Parent = <b>superclass</b>, child = <b>subclass</b>." },
      { lec: [2], html: "A subclass <b>inherits</b> its parent’s fields and methods and can <b>override</b> them." },
      { lec: [2], html: "<code>super(...)</code> calls the parent’s constructor and must be the <b>first line</b>. <code>this</code> is this object; <code>super</code> is its parent part." },
      { lec: [2], html: "Access modifiers: <code>private</code> (class only), package-private (no keyword), <code>protected</code> (package + subclasses), <code>public</code> (anywhere)." },
      { lec: [2], html: "Design rules: one responsibility per class, hide what you can, <b>avoid duplication</b> by moving shared parts up, and don’t trade clarity for “optimization.”" },
    ],
    compare: {
      head: ["Modifier", "Visible from", "UML"],
      rows: [
        ["<code>private</code>", "Only inside the same class", "<code>-</code>"],
        ["<i>(none)</i> package-private", "Classes in the same package", "<code>~</code>"],
        ["<code>protected</code>", "Same class, same package, and subclasses", "<code>#</code>"],
        ["<code>public</code>", "Anywhere", "<code>+</code>"],
      ],
    },
  },

  details: [
    {
      id: "is-a",
      title: "Inheritance models “is-a”",
      lec: [2],
      html: `
        <p>Make your data mean something: program elements should mirror real-world concepts. Inheritance captures <b>“is-a”</b> relationships and sets up a hierarchy of <b>parent/superclass</b> and <b>child/subclass</b>, with ancestors above and descendants below.</p>
        <ul>
          <li>A class <b>extends exactly one</b> other class (abstract or concrete).</li>
          <li>It <b>inherits</b> the parent’s fields and methods, and can <b>override</b> methods to change behavior.</li>
          <li>It can also implement any number of interfaces.</li>
        </ul>`,
    },
    {
      id: "access",
      title: "Access modifiers",
      lec: [2],
      html: `
        <ul>
          <li><code>private</code>: only within the same class.</li>
          <li><i>No modifier</i> (package-private): only within the same package.</li>
          <li><code>protected</code>: within the class, the same package, and descendants.</li>
          <li><code>public</code>: from anywhere.</li>
        </ul>
        <p>Rule of thumb: <b>hide what you can</b>. In the first IoT design, most fields were <code>private</code>, but <code>Light</code>’s fields were <code>protected</code> so <code>DimmableLight</code> and <code>TunableWhiteLight</code> could use them.</p>`,
    },
    {
      id: "first-cut",
      title: "A first cut: three kinds of lights",
      lec: [2],
      html: `
        <p>The system grows to three lights: a normal <code>Light</code>, a <code>DimmableLight</code> (adjustable brightness), and a <code>TunableWhiteLight</code> (adjustable color temperature).</p>
        <ul>
          <li><code>DimmableLight extends Light</code> and adds <code>setBrightness(..)</code>.</li>
          <li><code>TunableWhiteLight extends Light</code>, stores a color temperature, and adds <code>get/setColorTemperature(..)</code>.</li>
        </ul>
        <p>But <code>Light</code>, <code>Fan</code>, and <code>Thermostat</code> all duplicated a name, an on/off status, and identical <code>turnOn()</code>/<code>turnOff()</code>/<code>isOn()</code> code. All the light constructors duplicated name/brightness setup too.</p>`,
    },
    {
      id: "abstraction",
      title: "Abstraction: moving common code up",
      lec: [2],
      html: `
        <p>The fix is a shared base type between <code>IoTDevice</code> and the devices: an abstract <code>BaseIoTDevice</code>.</p>
        <ul>
          <li>Shared fields (<code>name</code>, <code>isOn</code>) and methods (<code>turnOn</code>, <code>turnOff</code>, <code>isOn</code>) move up into it.</li>
          <li>It doesn’t implement <code>identify()</code>, so it must be <b>abstract</b>.</li>
          <li>Each subclass keeps only what’s unique to it, and its constructor <b>delegates</b> to the parent with <code>super(name)</code>.</li>
        </ul>
        <p>Result: no duplicated code across device classes.</p>
        <p class="widget-hint">👇 <b>Try it:</b> click a class to see everything it inherits and where each method comes from.</p>`,
      widget: "hierarchy",
    },
    {
      id: "rules",
      title: "Best design practices: a first cut",
      lec: [2],
      html: `
        <ol>
          <li>Each interface or class represents <b>one thing</b> (single responsibility).</li>
          <li>Use access modifiers judiciously: <b>hide what you can</b>.</li>
          <li><b>Avoid duplication</b>: capture common aspects higher in the hierarchy.</li>
          <li><b>Don’t lose meaning</b>: don’t sacrifice clarity for “optimization.”</li>
        </ol>`,
    },
  ],

  // Lecture 2's design after introducing BaseIoTDevice.
  hierarchy: {
    hint: "Click <b>DimmableLight</b> to see everything it inherits, then compare it with <b>Fan</b>.",
    rows: [
      ["IoTDevice"],
      ["BaseIoTDevice"],
      ["Light", "Fan", "Thermostat"],
      ["DimmableLight", "TunableWhiteLight"],
    ],
    nodes: {
      IoTDevice: { kind: "interface", methods: ["identify()", "turnOn()", "turnOff()", "isOn()"], note: "The contract every device promises." },
      BaseIoTDevice: { kind: "abstract", implements: ["IoTDevice"], methods: ["turnOn()", "turnOff()", "isOn()"], note: "Holds the shared <code>protected</code> fields <code>name</code> and <code>isOn</code>. Abstract because it doesn’t implement <code>identify()</code>." },
      Light: { kind: "class", extends: ["BaseIoTDevice"], methods: ["identify()", "getBrightness()"], note: "Adds a <code>protected</code> <code>brightness</code> field that its subclasses can use." },
      Fan: { kind: "class", extends: ["BaseIoTDevice"], methods: ["identify()"], note: "Keeps only its <code>private</code> <code>speed</code>. Everything else is inherited." },
      Thermostat: { kind: "class", extends: ["BaseIoTDevice"], methods: ["identify()"], note: "Keeps only its <code>private</code> <code>temperature</code>. (Lecture 6 points out it shouldn’t have <code>turnOn/turnOff</code> at all.)" },
      DimmableLight: { kind: "class", extends: ["Light"], methods: ["identify()", "setBrightness(int)"], note: "Overrides <code>identify()</code> and adds <code>setBrightness</code>. Has <code>MIN_BRIGHTNESS</code>/<code>MAX_BRIGHTNESS</code> constants." },
      TunableWhiteLight: { kind: "class", extends: ["Light"], methods: ["identify()", "getColorTemperature()", "setColorTemperature(int)"], note: "Adds a <code>private</code> color temperature with <code>MIN_COLORTEMPERATURE</code>/<code>MAX_COLORTEMPERATURE</code> constants." },
    },
  },

  code: [
    {
      title: "Delegating to the parent constructor",
      lec: [2],
      note: "<code>super(name)</code> must be the first line. <code>this</code> refers to this object; <code>super</code> refers to its parent part.",
      code: `public class Light extends BaseIoTDevice {
    protected int brightness;

    public Light(String name, int brightness) {
        super(name);                    // must be the first line
        this.brightness = brightness;
    }

    @Override
    public String identify() {
        return "Light at " + brightness + "% brightness";
    }

    public int getBrightness() {
        return brightness;
    }
}`,
    },
    {
      title: "A subclass of a subclass",
      lec: [2],
      note: "<code>DimmableLight</code> inherits from <code>Light</code>, which inherits from <code>BaseIoTDevice</code>, so it gets <code>turnOn()</code> without writing it. It can use <code>brightness</code> because that field is <code>protected</code>.",
      code: `public class DimmableLight extends Light {
    public static final int MIN_BRIGHTNESS = 0;
    public static final int MAX_BRIGHTNESS = 100;

    public DimmableLight(String name, int brightness) {
        super(name, brightness);
    }

    public void setBrightness(int value) {
        this.brightness = value;     // protected field from Light
    }
}`,
    },
  ],

  flashcards: [
    { front: "Inheritance", back: "Modeling an <b>“is-a”</b> relationship: a subclass inherits a superclass’s fields and methods." },
    { front: "Override", back: "A subclass providing its own version of an inherited method (mark it with <code>@Override</code>)." },
    { front: "<code>private</code>", back: "Visible only inside the same class." },
    { front: "<code>protected</code>", back: "Visible in the class, the same package, and all subclasses." },
    { front: "Package-private", back: "No modifier. Visible only within the same package." },
    { front: "<code>super(...)</code>", back: "Calls the parent’s constructor. Must be the <b>first line</b> of the constructor." },
    { front: "<code>this</code> vs. <code>super</code>", back: "<code>this</code> = this object. <code>super</code> = this object’s parent part." },
    { front: "Why move code into a base class?", back: "To <b>avoid duplication</b>: shared fields and methods live in one place." },
  ],

  quiz: [
    {
      type: "mc", lec: [2],
      q: "<code>DimmableLight</code> needs to change the <code>brightness</code> field it inherits from <code>Light</code>. What’s the most restrictive modifier that still allows it?",
      options: ["<code>private</code>", "<code>protected</code>", "<code>public</code>", "It’s impossible"],
      answer: 1,
      explain: "<code>protected</code> lets subclasses use the field while still hiding it from unrelated classes. That’s why <code>Light</code>’s fields were protected.",
    },
    {
      type: "mc", lec: [2],
      q: "Which statement about inheritance in Java is true?",
      options: ["A class can extend several classes", "A class extends exactly one class and can implement many interfaces", "Interfaces can’t extend anything", "Subclasses can’t override methods"],
      answer: 1,
      explain: "One superclass, many interfaces.",
    },
    {
      type: "bug", lec: [2],
      q: "Click the line that won’t compile.",
      lines: [
        "public class Fan extends BaseIoTDevice {",
        "    private int speed;",
        "    public Fan(String name, int speed) {",
        "        this.speed = speed;",
        "        super(name);",
        "    }",
        "}",
      ],
      answer: 4,
      explain: "<code>super(name)</code> has to be the first line of the constructor.",
    },
    {
      type: "mc", lec: [2],
      q: "<code>Light</code>, <code>Fan</code>, and <code>Thermostat</code> all had identical <code>turnOn()</code> code. Which design rule does that break?",
      options: ["Hide what you can", "Avoid duplication", "Single responsibility", "Don’t lose meaning"],
      answer: 1,
      explain: "Duplicated code should move higher in the hierarchy, into <code>BaseIoTDevice</code>.",
    },
    {
      type: "mc", lec: [2],
      q: "Why must <code>BaseIoTDevice</code> be declared <code>abstract</code>?",
      options: ["Because it has fields", "Because it doesn’t implement <code>identify()</code> from IoTDevice", "Because it has a constructor", "Because it’s used as a parent"],
      answer: 1,
      explain: "A class that doesn’t implement all of the abstract methods it inherits must itself be abstract.",
    },
    {
      type: "tf", lec: [2],
      q: "True or false: a field with no access modifier can be used by any class anywhere.",
      answer: false,
      explain: "No modifier means <b>package-private</b>: only classes in the same package can see it.",
    },
  ],
});
