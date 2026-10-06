// Exam questions for Polymorphism & Dynamic Dispatch. See ../../../course/exam.js for the question format.
registerExam("polymorphism", [
  {
    id: "trace-cast", type: "trace", lec: [2], sec: "lookup",
    q: "What does this print?",
    code: `class Light implements IoTDevice {
    public String identify() { return "Light"; }
}
class DimmableLight extends Light {
    @Override
    public String identify() { return "DimmableLight"; }
}

IoTDevice d = new DimmableLight();
Light l = (Light) d;
System.out.println(l.identify());
System.out.println(d instanceof Light);`,
    out: { kind: "output", text: "DimmableLight\ntrue" },
    explain: "The object is a <code>DimmableLight</code> the whole time. Casting it to <code>Light</code> changes only the variable’s type, so dynamic dispatch still runs <code>DimmableLight</code>’s <code>identify()</code>. And a <code>DimmableLight</code> <b>is a</b> <code>Light</code>, so <code>instanceof</code> is true.",
  },
  {
    id: "trace-overload", type: "trace", lec: [3], sec: "overloading",
    q: "What does this print?",
    code: `class Printer {
    void show(Object o) { System.out.println("object"); }
    void show(String s) { System.out.println("string"); }
}

Object x = "hi";
Printer p = new Printer();
p.show(x);
p.show("hi");`,
    out: { kind: "output", text: "object\nstring" },
    explain: "Overloads are chosen at <b>compile time</b> from the <b>declared</b> types of the arguments. <code>x</code> is declared <code>Object</code>, so <code>show(Object)</code> is picked even though it holds a String. The literal <code>\"hi\"</code> is a String, so <code>show(String)</code> is picked.",
  },
  {
    id: "trace-static", type: "trace", lec: [2], sec: "static",
    q: "What does this print?",
    code: `class Counter {
    static int total = 0;
    int mine = 0;
    void hit() { total++; mine++; }
}

Counter a = new Counter();
Counter b = new Counter();
a.hit();
a.hit();
b.hit();
System.out.println(a.mine + " " + b.mine + " " + Counter.total);`,
    out: { kind: "output", text: "2 1 3" },
    explain: "<code>mine</code> is an instance field: each object has its own. <code>total</code> is <code>static</code>: one copy shared by every <code>Counter</code>, so all three calls add to it.",
  },
  {
    id: "trace-declared-type", type: "trace", lec: [2], sec: "lookup",
    q: "What happens? (<code>IoTDevice</code> declares <code>identify()</code>, <code>turnOn()</code>, <code>turnOff()</code>, and <code>isOn()</code>. <code>Light</code> also has <code>setBrightness(int)</code>.)",
    code: `IoTDevice d = new Light("desk", 60);
d.setBrightness(80);
System.out.println("done");`,
    out: { kind: "compile" },
    explain: "The compiler only lets you call methods that the <b>declared</b> type has. <code>IoTDevice</code> has no <code>setBrightness</code>, so this doesn’t compile, even though the object is a <code>Light</code>. You’d need a cast: <code>((Light) d).setBrightness(80)</code>.",
  },
]);

// ---------- Batch 1 (lectures 1–2) ----------
registerExam("polymorphism", [
  {
    id: "trace-loop", type: "trace", lec: [2], sec: "uniform",
    q: "What does this print?",
    code: `class Fan implements IoTDevice {
    public String identify() { return "Fan"; }
}
class Light implements IoTDevice {
    public String identify() { return "Light"; }
}

IoTDevice[] devices = { new Fan(), new Light(), new Fan() };
for (IoTDevice d : devices) {
    System.out.print(d.identify() + " ");
}`,
    out: { kind: "output", text: "Fan Light Fan" },
    explain: "Each call dispatches to the object’s own class, in array order. (Trailing spaces don’t matter in your answer.)",
  },
  {
    id: "trace-overload-device", type: "trace", lec: [3], sec: "overloading",
    q: "What does this print?",
    code: `static void greet(IoTDevice d) { System.out.println("device"); }
static void greet(Light l)     { System.out.println("light"); }

IoTDevice x = new Light("desk", 50);
Light y = new Light("lamp", 70);
greet(x);
greet(y);`,
    out: { kind: "output", text: "device\nlight" },
    explain: "Overloads are picked at compile time by the <b>declared</b> type. <code>x</code> is declared <code>IoTDevice</code>, so <code>greet(IoTDevice)</code> runs even though it holds a <code>Light</code>.",
  },
  {
    id: "trace-bad-cast", type: "trace", lec: [2], sec: "lookup",
    q: "What happens? (<code>Fan</code> and <code>Light</code> both implement <code>IoTDevice</code>; neither extends the other.)",
    code: `IoTDevice d = new Fan("fan", 40);
Light l = (Light) d;
System.out.println("cast worked");`,
    out: { kind: "exception" },
    explain: "It compiles, because an <code>IoTDevice</code> <i>might</i> be a <code>Light</code>. But at runtime the object is a <code>Fan</code>, so the cast throws a <code>ClassCastException</code>. A cast can’t change what an object really is.",
  },
]);
