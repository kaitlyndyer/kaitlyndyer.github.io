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
