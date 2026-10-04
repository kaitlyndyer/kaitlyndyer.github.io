registerConcept({
  id: "interfaces",
  oneLiner:
    "An <b>interface</b> says what an object <i>can do</i>, an <b>abstract class</b> shares <i>how</i> some of it is done, and a <b>concrete class</b> does all of it.",

  related: ["inheritance", "polymorphism", "specifications"],

  // ---------- Summary tab ----------
  summary: {
    keyPoints: [
      { lec: [2], html: "An <b>interface</b> is a contract: the signatures of public methods, with no bodies and no fields. It answers <i>“if I have this object, what can I call on it?”</i>" },
      { lec: [1], html: "Java checks <code>implements</code> at <b>compile time</b>. That’s a much stronger guarantee than Python’s “hope the method exists.”" },
      { lec: [2], html: "An <b>abstract class</b> is an incomplete blueprint: it can have fields and some implemented methods, but it <b>can’t be instantiated</b>." },
      { lec: [2], html: "A class can <b>extend one</b> class but <b>implement many</b> interfaces. That’s how Java avoids the diamond problem." },
      { lec: [2], html: "<b>Skeletal implementation:</b> pair an interface with an abstract base class (<code>IoTDevice</code> + <code>BaseIoTDevice</code>), like the JDK’s <code>AbstractList</code>." },
      { lec: [6], html: "<b>Rule:</b> every <code>public</code> method should come from an interface the object implements (constructors excepted)." },
      { lec: [6], html: "<b>Interface Segregation:</b> objects should only offer, and clients should only see, the methods relevant to them. A thermostat isn’t <code>Switchable</code>." },
    ],
    compare: {
      head: ["", "Interface", "Abstract class", "Concrete class"],
      rows: [
        ["Describes", "What an object <b>can do</b>", "Shared, partial implementation", "A full implementation"],
        ["Method bodies?", "No (all abstract)", "Some", "All"],
        ["Fields?", "No", "Optional", "Yes"],
        ["Can you <code>new</code> it?", "<i data-icon=\"no\"></i> No", "<i data-icon=\"no\"></i> No", "<i data-icon=\"yes\"></i> Yes"],
        ["Inherits from", "Many interfaces", "One class + many interfaces", "One class + many interfaces"],
      ],
    },
  },

  // ---------- Details tab ----------
  details: [
    {
      id: "why",
      title: "Why interfaces? The Python problem",
      lec: [1],
      html: `
        <p>In Lecture 1 we modeled IoT devices (lights, fans) in Python. Both Python designs shared three weaknesses:</p>
        <ol>
          <li><code>identifyDevice()</code> had to <b>guess</b> a device’s type from what was in its dictionary.</li>
          <li>There was no quick way to see <b>what a device can do</b>.</li>
          <li>Python lets any code reach into any object, which leads to <b>tightly coupled</b> code.</li>
        </ol>
        <p>Java fixes this by writing the shared behavior down as an <b>interface</b>. A class that says <code>implements IoTDevice</code> is <i>promising</i> to provide every method, and the compiler checks the promise before the program ever runs.</p>`,
    },
    {
      id: "three-kinds",
      title: "Interface vs. abstract class vs. concrete class",
      lec: [2],
      html: `
        <div class="def-grid">
          <div class="def"><div class="def-tag iface">interface</div><p>Signatures of methods that will be <code>public</code> in implementing classes. Every method is abstract, and there are <b>no fields</b>. It specifies what an object <i>does</i>, not what it <i>has</i>.</p></div>
          <div class="def"><div class="def-tag abs">abstract class</div><p>An “incomplete blueprint” with at least one abstract method. It <b>may have fields</b> and implemented methods, and it <b>can’t be instantiated</b>.</p></div>
          <div class="def"><div class="def-tag conc">concrete class</div><p>Provides implementations for <b>every</b> promised method. This is the only kind you can <code>new</code>.</p></div>
        </div>
        <h4>Rules to remember</h4>
        <ul>
          <li>A class that doesn’t implement all of its inherited abstract methods <b>must be declared <code>abstract</code></b>.</li>
          <li>A class <b>extends exactly one</b> class and can <b>implement many</b> interfaces.</li>
          <li>An interface can <b>extend multiple</b> interfaces, and can only declare <code>public</code> methods.</li>
          <li>An abstract class with <i>only</i> public abstract methods is basically an interface.</li>
        </ul>`,
    },
    {
      id: "base-class",
      title: "Removing duplication with an abstract base class",
      lec: [2],
      html: `
        <p>In the first version, <code>Light</code>, <code>Fan</code>, and <code>Thermostat</code> each repeated a <code>name</code>, an on/off flag, and identical <code>turnOn()</code> / <code>turnOff()</code> / <code>isOn()</code> code.</p>
        <p>The fix is to add an <b>abstract</b> class between the interface and the devices, and move the shared parts <b>up</b> into it:</p>
        <ul>
          <li><code>BaseIoTDevice</code> holds <code>name</code> and <code>isOn</code> as <code>protected</code> fields, so subclasses can use them, and implements the on/off methods once.</li>
          <li>It doesn’t implement <code>identify()</code>, so it <b>must be abstract</b>.</li>
          <li>Each device keeps only what is unique to it, and calls <code>super(name)</code> as the <b>first line</b> of its constructor.</li>
        </ul>
        <p>This is the <b>“avoid duplication”</b> design rule: capture common parts higher up in the hierarchy.</p>`,
    },
    {
      id: "skeletal",
      title: "Skeletal implementations",
      lec: [2],
      html: `
        <p>Pairing an <b>interface</b> with an <b>abstract base class</b> is a common pattern called a <i>skeletal implementation</i>. It gives other programmers a choice:</p>
        <ul>
          <li><b>Extend the abstract class</b> for convenience, since most of the work is already done.</li>
          <li><b>Implement the interface directly</b> when they need fully custom behavior.</li>
        </ul>
        <p>The Java standard library uses this pattern a lot: <code>List</code> + <code>AbstractList</code>, <code>Map</code> + <code>AbstractMap</code>, <code>Collection</code> + <code>AbstractCollection</code>.</p>`,
    },
    {
      id: "diamond",
      title: "The diamond problem",
      lec: [2],
      html: `
        <p>Some objects belong to more than one category, like a <b>fan with a built-in light</b>. If a class could extend both <code>Fan</code> and <code>Light</code>, and both implemented <code>identify()</code> differently, which one should run? That ambiguity is the <b>diamond problem</b>.</p>
        <p><b>Java’s solution:</b> only allow multiple inheritance of <b>interfaces</b>. Interfaces (usually) provide no implementation, so there’s nothing to conflict, and the implementing class decides the behavior itself.</p>`,
    },
    {
      id: "every-object",
      title: "Rule: an interface for every object",
      lec: [6],
      html: `
        <p class="callout key"><b>“An object is what it does, not what it has.”</b> An object’s specification is its public methods, which is exactly what an interface describes.</p>
        <ul>
          <li><b>Every <code>public</code> method should come from an interface</b> that the object implements. No public methods “out of thin air.” (Constructors are the exception.)</li>
          <li>Design an object by <b>defining its interface first</b>. Then reading the interfaces tells you everything the object can do.</li>
        </ul>
        <p>The Lecture 2 design broke this rule: <code>getBrightness()</code>, <code>setBrightness()</code>, and <code>get/setColorTemperature()</code> were added directly in classes, not in any interface.</p>`,
    },
    {
      id: "isp",
      title: "Interface Segregation & the improved design",
      lec: [6],
      html: `
        <p><b>The thermostat problem:</b> thermostats don’t have an on/off switch (they’re on whenever they’re powered), yet <code>Thermostat</code> inherited <code>turnOn()</code> / <code>turnOff()</code>. That causes:</p>
        <ul>
          <li>a <b>representational gap</b>: the class doesn’t faithfully model a real thermostat;</li>
          <li>an <b>unnecessary dependency</b>: changes to <code>turnOn/turnOff</code> now affect <code>Thermostat</code>.</li>
        </ul>
        <p><b>Interface Segregation Principle:</b> objects should only offer methods relevant to them, and clients should only be exposed to the methods they need. The fix splits on/off into its own <code>Switchable</code> interface and gives every public method a home in some interface.</p>
        <p class="callout try">Click any box to see what it <i>is</i> and which methods you can call on it.</p>`,
      widget: "hierarchy",
    },
  ],

  // Data for the interactive hierarchy explorer (Lecture 6's improved design).
  // "extends" = solid line, "implements" = dashed line, as in the slides.
  hierarchy: {
    hint: "Click a box above. Try <b>Thermostat</b>, then <b>Fan</b>, and compare which methods each one gets.",
    rows: [
      ["IoTDevice"],
      ["Switchable", "BaseIoTDevice"],
      ["Light", "BaseSwitchableDevice", "Thermostat"],
      ["TunableLight", "DimmableLight", "Fan", "NormalLight"],
      ["SimpleDimmableLight"],
      ["TunableWhiteLight"],
    ],
    nodes: {
      IoTDevice: { kind: "interface", methods: ["identify()", "isOn()"], note: "What <i>every</i> device can do. No more <code>turnOn/turnOff</code> here." },
      Switchable: { kind: "interface", extends: ["IoTDevice"], methods: ["turnOn()", "turnOff()"], note: "Only devices with an on/off switch." },
      Light: { kind: "interface", extends: ["Switchable"], methods: ["getBrightness()"], note: "Methods that apply to <i>all</i> lights." },
      DimmableLight: { kind: "interface", extends: ["Light"], methods: ["setBrightness(int)"], note: "Only for lights you can dim." },
      TunableLight: { kind: "interface", extends: ["Light"], methods: ["getColorTemperature()", "setColorTemperature(int)"], note: "Only for lights with adjustable color temperature." },
      BaseIoTDevice: { kind: "abstract", implements: ["IoTDevice"], methods: ["isOn()"], note: "Code shared by <i>all</i> devices." },
      BaseSwitchableDevice: { kind: "abstract", extends: ["BaseIoTDevice"], implements: ["Switchable"], methods: ["turnOn()", "turnOff()"], note: "Code shared by switchable devices." },
      Thermostat: { kind: "class", extends: ["BaseIoTDevice"], methods: ["identify()"], note: "Just an <code>IoTDevice</code>. It is <b>not</b> switchable, which fixes the representational gap." },
      Fan: { kind: "class", extends: ["BaseSwitchableDevice"], methods: ["identify()"], note: "A switchable device." },
      NormalLight: { kind: "class", extends: ["BaseSwitchableDevice"], implements: ["Light"], methods: ["identify()", "getBrightness()"], note: "A simple switchable light (formerly <code>Light</code>)." },
      SimpleDimmableLight: { kind: "class", extends: ["NormalLight"], implements: ["DimmableLight"], methods: ["setBrightness(int)"], note: "A dimmable light (formerly <code>DimmableLight</code>)." },
      TunableWhiteLight: { kind: "class", extends: ["SimpleDimmableLight"], implements: ["TunableLight", "DimmableLight"], methods: ["getColorTemperature()", "setColorTemperature(int)"], note: "Dimmable <i>and</i> tunable, with <b>no new public methods</b> of its own. Every method comes from an interface." },
    },
  },

  // ---------- Code tab ----------
  code: [
    {
      title: "Declaring and implementing an interface",
      lec: [1],
      note: "<code>implements</code> is a promise to provide every method. <code>private</code> hides the data, and <code>@Override</code> marks methods that come from the interface.",
      code: `public interface IoTDevice {
    String identify();
    void turnOn();
    void turnOff();
    boolean isOn();
}

public class Light implements IoTDevice {
    private final String name;
    private final int power;
    private boolean isOn;

    public Light(String name, int power) {
        this.name = name;
        this.power = power;
        this.isOn = false;
    }

    @Override
    public String identify() {
        return String.format("Light blinks at %d%% power", this.power);
    }

    // turnOn / turnOff / isOn ...
}`,
    },
    {
      title: "Using the interface as a type",
      lec: [1, 2],
      note: "Variables can have an interface type. Which <code>identify()</code> runs depends on the object’s actual class (see Polymorphism).",
      code: `IoTDevice light = new Light("livingRoomLight", 100);
IoTDevice fan = new Fan("fan", 50);

IoTDevice[] devices = { light, fan };
for (IoTDevice d : devices) {
    System.out.println(d.identify());
}`,
    },
    {
      title: "An abstract base class that removes duplication",
      lec: [2],
      note: "<code>BaseIoTDevice</code> doesn’t implement <code>identify()</code>, so it has to be <code>abstract</code>. <code>protected</code> lets subclasses use the shared fields.",
      code: `public abstract class BaseIoTDevice implements IoTDevice {
    protected String name;
    protected boolean isOn;

    protected BaseIoTDevice(String name) {
        this.name = name;
        this.isOn = false;
    }

    @Override public void turnOn()   { this.isOn = true; }
    @Override public void turnOff()  { this.isOn = false; }
    @Override public boolean isOn()  { return this.isOn; }
}

public class Light extends BaseIoTDevice {
    protected int brightness;

    public Light(String name, int brightness) {
        super(name);              // must be the first line
        this.brightness = brightness;
    }

    @Override
    public String identify() {
        return "Light at " + brightness + "% brightness";
    }
}`,
    },
    {
      title: "Segregated interfaces (the improved design)",
      lec: [6],
      note: "On/off lives in its own <code>Switchable</code> interface, so <code>Thermostat</code> never gets <code>turnOn()</code>. The class bodies are a sketch of the slide’s diagram.",
      code: `public interface IoTDevice {
    String identify();
    boolean isOn();
}

public interface Switchable extends IoTDevice {
    void turnOn();
    void turnOff();
}

public interface Light extends Switchable {
    int getBrightness();
}

// Thermostat is only an IoTDevice: no turnOn/turnOff to misuse.
public class Thermostat extends BaseIoTDevice { ... }

// Fan is switchable, so it builds on the switchable base class.
public class Fan extends BaseSwitchableDevice { ... }`,
    },
  ],

  // ---------- Practice tab ----------
  flashcards: [
    { front: "Interface", back: "A contract listing the signatures of public methods. No method bodies and no fields. It describes what an object <b>does</b>." },
    { front: "Abstract class", back: "An incomplete blueprint with at least one abstract method. It may have fields and implemented methods, but it <b>can’t be instantiated</b>." },
    { front: "Concrete class", back: "A class that implements <b>every</b> promised method. It’s the only kind you can create with <code>new</code>." },
    { front: "When must a class be declared <code>abstract</code>?", back: "When it doesn’t implement all of the abstract methods it inherits." },
    { front: "How many classes can a Java class extend? How many interfaces can it implement?", back: "It can extend <b>one</b> class and implement <b>many</b> interfaces." },
    { front: "The diamond problem", back: "The ambiguity when two parents implement the same method differently. Java avoids it by only allowing multiple inheritance of <b>interfaces</b>." },
    { front: "Skeletal implementation", back: "An interface paired with an abstract base class (e.g., <code>IoTDevice</code> + <code>BaseIoTDevice</code>, <code>List</code> + <code>AbstractList</code>)." },
    { front: "“An object is what it does, not what it has.”", back: "An object’s spec is its <b>public methods</b>, so every public method should come from an interface." },
    { front: "Interface Segregation Principle", back: "Objects should only offer methods relevant to them, and clients should only see the methods they need." },
    { front: "Representational gap", back: "When a class doesn’t faithfully model the real thing, like a <code>Thermostat</code> that has <code>turnOff()</code>." },
    { front: "<code>super(name)</code> in a constructor", back: "Calls the parent class’s constructor. It must be the <b>first line</b>." },
  ],

  quiz: [
    {
      type: "mc",
      lec: [2],
      q: "Using Lecture 2’s definition, what does an interface contain?",
      options: ["Fields and method signatures", "Only public method signatures", "Constructors and methods", "Private helper methods"],
      answer: 1,
      explain: "An interface specifies what an object <b>does</b>, not what it has. That means public method signatures only, with no fields.",
    },
    {
      type: "mc",
      lec: [2],
      q: "Why won’t this line compile?",
      code: `IoTDevice d = new BaseIoTDevice("hall");`,
      options: ["IoTDevice is the wrong variable type", "BaseIoTDevice is abstract, so it can’t be instantiated", "The constructor needs two arguments", "You must cast the result to IoTDevice"],
      answer: 1,
      explain: "Abstract classes are incomplete blueprints. You can’t create one with <code>new</code>; you create a concrete subclass instead.",
    },
    {
      type: "tf",
      lec: [2],
      q: "True or false: a Java class can extend two classes as long as they don’t share any method names.",
      answer: false,
      explain: "A class can extend <b>exactly one</b> class, whatever the method names. Multiple inheritance is only allowed for <b>interfaces</b>, which is how Java avoids the diamond problem.",
    },
    {
      type: "bug",
      lec: [2],
      q: "Click the line that causes a compile error.",
      lines: [
        "public class Light extends BaseIoTDevice {",
        "    protected int brightness;",
        "",
        "    public Light(String name, int brightness) {",
        "        this.brightness = brightness;",
        "        super(name);",
        "    }",
        "}",
      ],
      answer: 5,
      explain: "A call to <code>super(...)</code> must be the <b>first line</b> of the constructor. Move it above <code>this.brightness = brightness;</code>.",
    },
    {
      type: "mc",
      lec: [1],
      q: "When does Java tell you that a class claiming <code>implements IoTDevice</code> is missing <code>turnOff()</code>?",
      options: ["When turnOff() is first called", "At compile time, before the program runs", "Only if a unit test covers it", "Never. It’s the programmer’s job to remember."],
      answer: 1,
      explain: "The compiler checks the promise made by <code>implements</code>. That’s a stronger guarantee than Python’s “hope the method exists.”",
    },
    {
      type: "bug",
      lec: [6],
      q: "Using the improved design, which line breaks the Interface Segregation Principle?",
      lines: [
        "public class Fan extends BaseSwitchableDevice { ... }",
        "public class NormalLight extends BaseSwitchableDevice implements Light { ... }",
        "public class Thermostat extends BaseSwitchableDevice { ... }",
        "public class SimpleDimmableLight extends NormalLight implements DimmableLight { ... }",
      ],
      answer: 2,
      explain: "Thermostats have no on/off switch. Extending <code>BaseSwitchableDevice</code> would give <code>Thermostat</code> <code>turnOn()</code> / <code>turnOff()</code> again. It should extend <code>BaseIoTDevice</code>.",
    },
    {
      type: "mc",
      lec: [6],
      q: "In the Lecture 2 design, <code>Light</code> added a public <code>getBrightness()</code> that wasn’t in any interface. Which rule does that break?",
      options: ["Every public method should come from an interface", "Fields must always be private", "Constructors must call super()", "Abstract classes can’t have fields"],
      answer: 0,
      explain: "Public methods shouldn’t appear “out of thin air.” The improved design moves <code>getBrightness()</code> into a <code>Light</code> interface.",
    },
    {
      type: "mc",
      lec: [6],
      q: "In the improved design, you have a variable <code>IoTDevice d</code>. Which methods can you call on it?",
      options: ["identify(), turnOn(), turnOff(), isOn()", "identify() and isOn()", "turnOn() and turnOff()", "Only identify()"],
      answer: 1,
      explain: "<code>IoTDevice</code> now only declares <code>identify()</code> and <code>isOn()</code>. On/off moved to <code>Switchable</code>.",
    },
    {
      type: "mc",
      lec: [2],
      q: "What’s the main benefit of a <b>skeletal implementation</b> (interface + abstract base class)?",
      options: [
        "It makes the code run faster",
        "Others can extend the base class for convenience or implement the interface directly for custom behavior",
        "It lets a class extend multiple classes",
        "It removes the need for constructors",
      ],
      answer: 1,
      explain: "It gives flexibility: reuse the shared code by extending the abstract class, or start fresh from the interface.",
    },
    {
      type: "mc",
      lec: [6],
      q: "How many new public methods does <code>TunableWhiteLight</code> declare that don’t come from an interface?",
      options: ["None", "One", "Two", "Four"],
      answer: 0,
      explain: "None. Its color-temperature methods come from <code>TunableLight</code>, and the rest come from its other interfaces. That’s the goal of the improved design.",
    },
  ],
});
