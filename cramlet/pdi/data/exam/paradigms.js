registerExam("paradigms", [
  {
    id: "design-oo-vs-fn", type: "design", lec: [1], sec: "which",
    q: "Your smart-home app will keep getting <b>new kinds of devices</b>, but the set of operations (turn on, turn off, identify) will rarely change. Which design handles that better?",
    options: ["Object-oriented: one class per device type", "Separate data plus functions that switch on the device type", "It makes no difference"],
    answer: 0,
    model: "With OO, adding a device type means adding <b>one new class</b>, and existing code doesn’t change. With separate functions, every function that switches on the type has to be edited. (If you expected many new <b>operations</b> instead, separate functions would win.)",
    explain: "The better design depends on which future changes you have to support.",
  },
]);

// ---------- Batch 1 (lectures 1–2) ----------
registerExam("paradigms", [
  {
    id: "design-new-ops", type: "design", lec: [1], sec: "which",
    q: "The app supports exactly three kinds of devices, and that won’t change. But every month you’re asked for a <b>new operation</b> over all of them (an energy report, a schedule, a status export…). Which design makes those changes easiest?",
    options: ["Object-oriented: add a method to every device class each time", "Separate data plus functions: add one new function that handles every device", "It makes no difference"],
    answer: 1,
    model: "With separate functions, a new operation is <b>one new function</b> in one place. With OO, every new operation means editing every device class. (If new device types were the common change, OO would win.)",
    explain: "Choose the paradigm that isolates the change you expect most.",
  },
  {
    id: "tf-every-method", type: "tf", lec: [1], sec: "to-java",
    q: "True or false: in Java, every method has to live inside a class or an interface.",
    answer: true,
    explain: "Unlike Python, Java has no top-level functions. Even <code>main</code> lives inside a class.",
  },
  {
    id: "fill-main", type: "fill", lec: [1], sec: "to-java",
    q: "Fill in the blanks to write Java’s required entry point.",
    code: `public class App {
    public [[1]] void main([[2]] args) {
        System.out.println("Hello");
    }
}`,
    blanks: [["static"], ["String[]", "String..."]],
    explain: "The entry point is <code>public static void main(String[] args)</code>. It’s <code>static</code> because no <code>App</code> object exists yet when the program starts.",
  },
]);
