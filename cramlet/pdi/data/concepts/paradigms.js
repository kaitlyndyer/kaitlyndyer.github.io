registerConcept({
  id: "paradigms",
  oneLiner:
    "The same problem can be organized as <b>separate data + functions</b> or as <b>objects that bundle both</b>. The better choice depends on <i>which future changes</i> you expect.",

  related: ["interfaces", "design-goals", "polymorphism"],

  summary: {
    keyPoints: [
      { lec: [1], html: "<b>Code = data</b> (representation) <b>+ functions</b> (manipulation). The same problem can be organized many different ways." },
      { lec: [1], html: "<b>Design 1 (procedural/functional):</b> represent data first (“nouns”), then write functions (“verbs”) that act on it. Data and behavior stay separate." },
      { lec: [1], html: "<b>Design 2 (object-oriented):</b> pair data with the functions that act on it in a <b>class</b>. Each object is responsible for its own behavior (<b>encapsulation</b>)." },
      { lec: [1], html: "Adding a <b>new type</b> is easy in OO (just add a class) but means editing existing functions in Design 1." },
      { lec: [1], html: "Adding a <b>new operation</b> is easy in Design 1 (one new function) but means editing every class in OO." },
      { lec: [1], html: "There’s <b>no universal best</b>. Choice of paradigm ≠ choice of language, and you can mix paradigms in one program." },
    ],
    compare: {
      head: ["", "Design 1: data & functions separate", "Design 2: object-oriented"],
      rows: [
        ["Mental model", "“Function, take this device and identify it.”", "“Device, identify yourself.”"],
        ["Call style", "<code>identifyDevice(light)</code>", "<code>light.identify()</code>"],
        ["Add a new type", "<i data-icon=\"no\"></i> Edit existing functions (new <code>elif</code>)", "<i data-icon=\"yes\"></i> Add one new class"],
        ["Add a new operation", "<i data-icon=\"yes\"></i> Add one new function", "<i data-icon=\"no\"></i> Edit every class"],
        ["Behavior by type", "Branches on type, one case at a time", "Each class supplies its own version"],
      ],
    },
  },

  details: [
    {
      id: "example",
      title: "The running example: IoT devices",
      lec: [1],
      html: `
        <p>“Smart devices” combine sensors with network connectivity (the Internet of Things). We model two kinds:</p>
        <ul>
          <li><b>Shared:</b> every device has a unique name, can turn on/off, and can identify itself.</li>
          <li><b>Different:</b> a light has a <i>power</i>, a fan has a <i>speed</i>.</li>
          <li><b>Identifying differs too:</b> a light blinks twice, a fan turns on briefly.</li>
        </ul>`,
    },
    {
      id: "design1",
      title: "Design 1: data and functions kept separate",
      lec: [1],
      html: `
        <p>Represent the data first as compound types: <code>Light(name, power, on-status)</code>, <code>Fan(name, speed, on-status)</code>. Then write functions that act on any device: <code>identify(device)</code>, <code>turn_on(device)</code>, <code>turn_off(device)</code>, <code>status(device)</code>.</p>
        <p>In Python, each device is a <b>dictionary</b>. Helper functions check that a dict really is a device before acting on it, and <code>identifyDevice</code> <b>branches on the type</b>, checking one case at a time.</p>
        <p><b>Adding a Thermostat:</b> <code>createThermostat</code> is easy, and <code>turnOn</code>/<code>turnOff</code>/<code>isOn</code> work as-is. But <code>identifyDevice</code> needs a new <code>elif</code> branch. A new device type means <b>modifying a function every device depends on</b>.</p>`,
    },
    {
      id: "design2",
      title: "Design 2: data and functions combined (OO)",
      lec: [1],
      html: `
        <p>Pair data with the functions that act on it in a <b>class</b>. A base <code>IoTDevice</code> class holds the shared parts, and <code>Light</code> and <code>Fan</code> subclasses each provide their own <code>identify()</code>.</p>
        <p><b>Adding a Thermostat:</b> write a new, self-contained <code>Thermostat</code> class. <b>No existing class changes.</b></p>
        <p>This is classic object-oriented design. Its core principle is <b>encapsulation</b>: objects are self-contained, with <b>state</b> (attributes) and <b>behavior</b> (methods) together.</p>`,
    },
    {
      id: "which",
      title: "Which design is “better”?",
      lec: [1],
      html: `
        <p>It depends on <b>which future changes you must support</b>:</p>
        <ul>
          <li>Expect lots of <b>new device types</b>? OO keeps each change isolated.</li>
          <li>Expect lots of <b>new operations</b>? Separate functions let you add one function that works for every device.</li>
        </ul>
        <p>New feature requests are often unpredictable, so be open to multiple paradigms, even within one application. Many modern languages, including Python, support several.</p>`,
    },
    {
      id: "to-java",
      title: "From Python to Java",
      lec: [1],
      html: `
        <p>Both Python designs share weaknesses: <code>identifyDevice()</code> has to guess the type from dict contents, there’s no succinct way to see a device’s capabilities, and Python lets code reach into objects freely (<b>tight coupling</b>).</p>
        <p>Java formalizes Design 2: an <b>interface</b> declares the shared behavior, <code>private</code> fields hide data, and the compiler checks that every promised method exists. See <b>Interfaces &amp; Abstract Classes</b> for the details.</p>`,
    },
  ],

  code: [
    {
      title: "Design 1 in Python: devices as dictionaries",
      lec: [1],
      note: "Behavior is outside the data. <code>identifyDevice</code> has to check each type in turn.",
      code: `def createIoTDevice(type: str, name: str):
    return {'type': type, 'name': name, 'isOn': False}

def createLight(name: str, power: int):
    record = createIoTDevice("light", name)
    record['power'] = power
    return record

def identifyDevice(device: dict):
    if isLight(device):
        return f"Light blinks at {device['power']}% power"
    elif isFan(device):
        return f"Fan spins at {device['speed']}% speed"
    else:
        raise ValueError("Unknown device")`,
    },
    {
      title: "Design 2 in Python: classes",
      lec: [1],
      note: "Each class identifies itself, so adding <code>Thermostat</code> means adding a class, not editing one.",
      code: `class IoTDevice:
    def __init__(self, type, name):
        self.__type__, self.__name__ = type, name
        self.__isOn__ = False
    def identify(self):
        return "Unknown Device"
    def turnOn(self):  self.__isOn__ = True
    def turnOff(self): self.__isOn__ = False
    def isOn(self):    return self.__isOn__

class Light(IoTDevice):
    def __init__(self, id, power):
        super().__init__("light", id)
        self.__power__ = power
    def identify(self):
        return f"Light blinks at {self.__power__}% power"`,
    },
    {
      title: "The same idea in Java",
      lec: [1],
      note: "Java requires a formal entry point, <code>main</code>. Python just runs top-level statements.",
      code: `public class DeviceMain {
    public static void main(String[] args) {
        IoTDevice light = new Light("livingRoomLight", 100);
        System.out.println(light.identify());   // "Device, identify yourself."
        light.turnOn();
        System.out.println("Light on: " + light.isOn());
    }
}`,
    },
  ],

  flashcards: [
    { front: "Code = ? + ?", back: "<b>Data</b> (representation) + <b>functions</b> (manipulation)." },
    { front: "Design 1 (procedural/functional)", back: "Data first as compound types (“nouns”), then separate functions (“verbs”) that act on it." },
    { front: "Design 2 (object-oriented)", back: "Each class bundles its data with the methods that act on it. Objects identify themselves." },
    { front: "Encapsulation", back: "Keeping data and behavior together in an object. The core principle of OO design." },
    { front: "Which design makes adding a new <b>type</b> easy?", back: "<b>OO.</b> Add a new class; no existing code changes." },
    { front: "Which design makes adding a new <b>operation</b> easy?", back: "<b>Separate functions.</b> One new function works for every device." },
    { front: "Is OO vs. functional the same as choosing a language?", back: "No. <b>Paradigm ≠ language.</b> Many languages support several paradigms, and you can mix them." },
  ],

  quiz: [
    {
      type: "mc", lec: [1],
      q: "Your app will mostly get <b>new kinds of devices</b> over time. Which design makes that easiest?",
      options: ["Data & functions separate", "Object-oriented (classes)", "Both are equally easy", "Neither. You’d need a new language."],
      answer: 1,
      explain: "In OO, a new device type is a new, self-contained class. In the separate design you’d edit every function that branches on type.",
    },
    {
      type: "mc", lec: [1],
      q: "Your app will mostly get <b>new operations</b> (like <code>reset()</code>) for the same devices. Which design makes that easiest?",
      options: ["Data & functions separate", "Object-oriented (classes)", "Both are equally easy", "Neither"],
      answer: 0,
      explain: "With separate functions, one new function handles every device. In OO you’d add the method to every class.",
    },
    {
      type: "mc", lec: [1],
      q: "Which call matches the object-oriented mental model “Device, identify yourself”?",
      options: ["<code>identifyDevice(light)</code>", "<code>light.identify()</code>", "<code>identify(light, true)</code>", "<code>Light.identify()</code>"],
      answer: 1,
      explain: "In OO, you ask the object to do the work: <code>light.identify()</code>.",
    },
    {
      type: "bug", lec: [1],
      q: "In Lecture 1’s Design 1 (devices are plain dicts, and one function handles every type), we added a Thermostat. Which line had to be added to <b>existing</b> code?",
      lines: [
        "def identifyDevice(device: dict):",
        "    if isLight(device):",
        "        return f\"Light blinks at {device['power']}% power\"",
        "    elif isThermostat(device):",
        "        return f\"Thermostat display on ...\"",
        "    else:",
        "        raise ValueError(\"Unknown device\")",
      ],
      answer: 3,
      explain: "The new <code>elif isThermostat</code> branch is an edit to a function every device uses. That’s the cost of Design 1 when adding types.",
    },
    {
      type: "tf", lec: [1],
      q: "True or false: choosing Python means you must use the functional design, and choosing Java means you must use OO.",
      answer: false,
      explain: "Paradigm ≠ language. Python supports both designs (Lecture 1 showed both in Python), and you can mix them within one app.",
    },
    {
      type: "mc", lec: [1],
      q: "Which is <b>not</b> one of the weaknesses of the Python designs that Java addresses?",
      options: ["identifyDevice() must guess the type from dict contents", "No succinct way to see a device’s capabilities", "Code can reach into objects freely", "Python can’t create classes"],
      answer: 3,
      explain: "Python has classes (Design 2 used them). The real issues were type guessing, unclear capabilities, and tight coupling.",
    },
  ],
});
