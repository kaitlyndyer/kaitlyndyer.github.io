registerConcept({
  id: "polymorphism",
  oneLiner:
    "Which method runs is decided <b>at runtime</b> by the object’s <b>actual type</b>, not the variable’s declared type. That lets one loop treat many kinds of objects the same way.",

  related: ["inheritance", "interfaces", "types-generics"],

  summary: {
    keyPoints: [
      { lec: [2], html: "<b>Dynamic dispatch:</b> the JVM picks the method at <b>runtime</b>, based on the object’s actual type, not the variable’s declared type." },
      { lec: [2], html: "Lookup rule: if the actual type <code>T</code> declares the method, use it. Otherwise check <code>T</code>’s superclass, and keep going up." },
      { lec: [2], kind: "warn", html: "A <b>cast doesn’t change</b> the object’s runtime type, so it doesn’t change which method runs." },
      { lec: [2], html: "This lets you treat a mix of types <b>uniformly</b>, for example looping over an <code>IoTDevice[]</code> of different devices." },
      { lec: [2], html: "<code>static</code> members belong to the <b>class</b>, are shared by all objects, and are bound at <b>compile time</b>, so there’s no dynamic dispatch." },
      { lec: [3], html: "<b>Overloading</b> (same name, different parameters) is resolved at <b>compile time</b> by argument types. Don’t confuse it with overriding." },
    ],
    compare: {
      head: ["", "Overriding", "Overloading"],
      rows: [
        ["What it is", "A subclass redefines an inherited method with the <b>same signature</b>", "Several methods with the <b>same name, different parameters</b>"],
        ["Decided when?", "<b>Runtime</b> (dynamic dispatch)", "<b>Compile time</b> (by argument types)"],
        ["Example", "<code>Fan.identify()</code> overrides the interface’s <code>identify()</code>", "<code>read()</code>, <code>read(byte[] b)</code>, <code>read(byte[] b, int off, int len)</code>"],
      ],
    },
  },

  details: [
    {
      id: "question",
      title: "The question: which identify() runs?",
      lec: [2],
      html: `
        <p>Both variables below have the declared type <code>IoTDevice</code>, but they point at different objects. Which class’s <code>identify()</code> runs?</p>
        <p><b>Dynamic dispatch:</b> the JVM decides at <b>runtime</b>, based on the object’s actual type. So <code>livingRoomLight.identify()</code> runs <code>Light</code>’s version and <code>fan.identify()</code> runs <code>Fan</code>’s.</p>`,
    },
    {
      id: "lookup",
      title: "How the JVM decides",
      lec: [2],
      html: `
        <p>To call method <code>m</code> on an object <code>o</code> whose actual type is <code>T</code>:</p>
        <ol>
          <li>If <code>T</code> declares <code>m</code>, use that.</li>
          <li>Otherwise, check <code>T</code>’s superclass, and recurse upward.</li>
        </ol>
        <p>For a <code>TunableWhiteLight</code>, the search for <code>turnOn()</code> starts at <code>TunableWhiteLight</code>, not at the variable’s type. Casting to <code>(Light)</code> doesn’t change that, because <b>a cast doesn’t change the object’s actual runtime type</b>.</p>`,
    },
    {
      id: "uniform",
      title: "Treating mixed types uniformly",
      lec: [2],
      html: `
        <p>Because dispatch follows the actual object, you can store different kinds of devices in one <code>IoTDevice[]</code> (or <code>List&lt;IoTDevice&gt;</code>) and call the same method on each. Each object runs its own version. This is the payoff of designing to an interface.</p>`,
    },
    {
      id: "static",
      title: "static: shared by the whole class",
      lec: [2],
      html: `
        <ul>
          <li>Normally, each object gets its own copy of the fields.</li>
          <li><code>static</code> fields and methods are <b>shared across all objects</b> of a class, and you access them through the class name: <code>TunableWhiteLight.MIN_COLORTEMPERATURE</code>.</li>
          <li><code>static</code> methods are bound at <b>compile time</b>, so no dynamic dispatch is needed.</li>
          <li><code>public static final</code> is the usual way to write a constant.</li>
        </ul>`,
    },
    {
      id: "overloading",
      title: "Overloading is not overriding",
      lec: [3],
      html: `
        <p>Lecture 3’s I/O classes have several methods with the same name, like <code>read()</code>, <code>read(byte[] b)</code>, and <code>read(byte[] b, int off, int len)</code>. That’s <b>method overloading</b>, and the compiler picks one at <b>compile time</b> based on the argument types.</p>
        <p>Overriding is different: same signature in a subclass, chosen at <b>runtime</b> by dynamic dispatch.</p>`,
    },
  ],

  code: [
    {
      title: "Dynamic dispatch",
      lec: [2],
      note: "The declared type is <code>IoTDevice</code>, but each call runs the actual object’s method.",
      code: `IoTDevice livingRoomLight = new Light("livingRoomLight", 100);
IoTDevice fan = new Fan("fan", 50);

livingRoomLight.identify();   // runs Light's identify()
fan.identify();               // runs Fan's identify()`,
    },
    {
      title: "A cast doesn’t change the runtime type",
      lec: [2],
      note: "Both calls start the lookup at <code>TunableWhiteLight</code>, the object’s actual type.",
      code: `IoTDevice light = new TunableWhiteLight("living-room", 2700, 100);
light.turnOn();               // lookup starts at TunableWhiteLight
((Light) light).turnOn();     // still starts at TunableWhiteLight!`,
    },
    {
      title: "One loop, many types",
      lec: [2],
      code: `IoTDevice[] devices = new IoTDevice[] {
    new TunableWhiteLight("light-1", 2700, 100),
    new DimmableLight("light-2", 100)
};
for (IoTDevice d : devices) {
    d.turnOn();   // dispatches to each object's actual class
}`,
    },
    {
      title: "static constants",
      lec: [2],
      note: "Shared by every <code>TunableWhiteLight</code>, accessed through the class name.",
      code: `public class TunableWhiteLight extends Light {
    public static final int MIN_COLORTEMPERATURE = 2000;
    public static final int MAX_COLORTEMPERATURE = 8000;
    ...
}

int lowest = TunableWhiteLight.MIN_COLORTEMPERATURE;`,
    },
  ],

  flashcards: [
    { front: "Dynamic dispatch", back: "Choosing which method runs <b>at runtime</b>, based on the object’s <b>actual type</b>." },
    { front: "How does the JVM find method <code>m</code> on an object of type <code>T</code>?", back: "Use <code>T</code>’s <code>m</code> if it declares one. Otherwise check the superclass, and keep going up." },
    { front: "Does casting change which method runs?", back: "<b>No.</b> A cast doesn’t change the object’s runtime type." },
    { front: "<code>static</code> field", back: "One copy shared by all objects of the class. Accessed through the class name." },
    { front: "When are <code>static</code> methods bound?", back: "At <b>compile time</b>. No dynamic dispatch." },
    { front: "Overloading", back: "Same method name, different parameters. Chosen at <b>compile time</b> by argument types." },
    { front: "Overriding", back: "A subclass redefines an inherited method with the same signature. Chosen at <b>runtime</b>." },
  ],

  quiz: [
    {
      type: "mc", lec: [2],
      q: "What does this print? (<code>Fan</code>’s identify returns “Fan spins at 50% speed”.)",
      code: `IoTDevice d = new Fan("fan", 50);
System.out.println(d.identify());`,
      options: ["Nothing. IoTDevice has no body for identify()", "“Fan spins at 50% speed”", "A compile error", "“Unknown Device”"],
      answer: 1,
      explain: "The declared type is <code>IoTDevice</code>, but the object is a <code>Fan</code>, so dynamic dispatch runs <code>Fan</code>’s <code>identify()</code>.",
    },
    {
      type: "mc", lec: [2],
      q: "Where does the JVM start looking for <code>turnOn()</code> in the second line?",
      code: `IoTDevice light = new TunableWhiteLight("living-room", 2700, 100);
((Light) light).turnOn();`,
      options: ["In Light, because of the cast", "In IoTDevice, the declared type", "In TunableWhiteLight, the actual type", "In Object"],
      answer: 2,
      explain: "A cast doesn’t change the object’s runtime type. The lookup starts at <code>TunableWhiteLight</code> and walks up from there.",
    },
    {
      type: "mc", lec: [2],
      q: "How do you access <code>MIN_COLORTEMPERATURE</code>, a <code>public static final</code> field?",
      options: ["<code>new TunableWhiteLight().MIN_COLORTEMPERATURE</code> only", "<code>TunableWhiteLight.MIN_COLORTEMPERATURE</code>", "<code>super.MIN_COLORTEMPERATURE</code>", "You can’t access static fields"],
      answer: 1,
      explain: "Static members belong to the class, so you access them through the class name.",
    },
    {
      type: "mc", lec: [3],
      q: "<code>InputStream</code> has <code>read()</code>, <code>read(byte[] b)</code>, and <code>read(byte[] b, int off, int len)</code>. What is this called?",
      options: ["Overriding", "Overloading", "Dynamic dispatch", "Generics"],
      answer: 1,
      explain: "Same name, different parameter lists = overloading, resolved at compile time.",
    },
    {
      type: "tf", lec: [2],
      q: "True or false: <code>static</code> methods use dynamic dispatch.",
      answer: false,
      explain: "Static methods are bound at compile time, so no dynamic dispatch is needed.",
    },
    {
      type: "mc", lec: [2],
      q: "Why can one <code>for</code> loop call <code>turnOn()</code> on a mix of lights, fans, and thermostats?",
      options: ["Because they all have the same fields", "Because dynamic dispatch runs each object’s own version through the shared interface type", "Because the loop casts each one", "Because <code>turnOn</code> is static"],
      answer: 1,
      explain: "Each object is an <code>IoTDevice</code>, and dispatch picks the right method for each actual object.",
    },
  ],
});
