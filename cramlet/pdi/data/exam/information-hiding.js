// Exam questions for Modularity & Information Hiding (lecture 8). See ../../../course/exam.js for the format.
registerExam("information-hiding", [
  {
    id: "trace-alias-array", type: "trace", lec: [8], sec: "immutability",
    q: "What does this print?",
    code: `final class Schedule {
    private final int[] hours;
    Schedule(int[] hours) { this.hours = hours; }
    int first() { return hours[0]; }
}

int[] h = {7, 9};
Schedule s = new Schedule(h);
h[0] = 6;
System.out.println(s.first());`,
    out: { kind: "output", text: "6" },
    explain: "The constructor stored the caller’s array, so <code>h</code> and <code>s.hours</code> are aliases. <code>final</code> doesn’t stop the array’s contents from changing.",
  },
  {
    id: "trace-defensive-copy", type: "trace", lec: [8], sec: "immutability",
    q: "This version of <code>Schedule</code> copies the array in its constructor. What does this print?",
    code: `final class Schedule {
    private final int[] hours;
    Schedule(int[] hours) { this.hours = Arrays.copyOf(hours, hours.length); }
    int first() { return hours[0]; }
}

int[] h = {7, 9};
Schedule s = new Schedule(h);
h[0] = 6;
System.out.println(s.first());`,
    out: { kind: "output", text: "7" },
    explain: "The defensive copy means <code>Schedule</code> has its own array, so the caller’s later change doesn’t reach it.",
  },
  {
    id: "trace-final-list", type: "trace", lec: [8], sec: "immutability",
    q: "What does this print?",
    code: `final List<String> rooms = new ArrayList<>();
rooms.add("den");
rooms.add("hall");
System.out.println(rooms.size());`,
    out: { kind: "output", text: "2" },
    explain: "<code>final</code> means <code>rooms</code> can’t be reassigned to another list. The list itself can still change.",
  },
  {
    id: "trace-sealed", type: "trace", lec: [8], sec: "sealed",
    q: "What happens?",
    code: `sealed interface Payment permits Card, Transfer {}
final class Card implements Payment {}
final class Transfer implements Payment {}
final class Cash implements Payment {}`,
    out: { kind: "compile" },
    explain: "<code>Payment</code> only permits <code>Card</code> and <code>Transfer</code>. <code>Cash</code> isn’t listed, so it can’t implement it.",
  },
  {
    id: "mc-hyrum", type: "mc", lec: [8], sec: "hiding",
    q: "A library changes the <b>order</b> of results from a search method. Its docs never promised any order, but many users’ programs break. Which idea explains this?",
    options: ["Hyrum’s Law: with enough users, every observable behavior gets depended on", "Low cohesion", "The Liskov principle", "The library broke its own spec"],
    answer: 0,
    whys: [null, "Cohesion is about a module’s purpose, not users relying on behavior.", "Liskov is about subclasses keeping their parent’s promises.", "The spec never promised an order, so the library kept its spec. Users relied on something unpromised."],
    explain: "Code gets written based on what it <i>can</i> rely on, not what it <i>should</i>. That’s why hiding needs to be enforced.",
  },
  {
    id: "mc-final-class-why", type: "mc", lec: [8], sec: "immutability",
    q: "Why does the immutable-class recipe say to make the class <code>final</code>?",
    options: ["Final classes run faster", "So subclasses can’t add mutable state or change its behavior", "So its fields automatically become final", "Java requires it for private fields"],
    answer: 1,
    whys: ["final isn’t about speed; it stops subclassing.", null, "A final class doesn’t make its fields final; you declare those yourself.", "Private fields don’t require a final class."],
    explain: "A subclass could add setters or override methods, breaking the immutability guarantee.",
  },
  {
    id: "mc-non-sealed", type: "mc", lec: [8], sec: "sealed",
    q: "In a sealed hierarchy, what does declaring a permitted subclass <code>non-sealed</code> do?",
    options: ["Forbids any further subclasses", "Reopens that branch so anyone can extend it", "Makes the subclass abstract", "Removes it from the permits list"],
    answer: 1,
    whys: ["That’s what final does.", null, "non-sealed doesn’t make the class abstract.", "It stays in the permits list; it just opens its own branch."],
    explain: "Permitted subclasses must be <code>final</code> (closed), <code>sealed</code> (their own permits list), or <code>non-sealed</code> (open again).",
  },
  {
    id: "mc-sealed-benefit", type: "mc", lec: [8], sec: "sealed",
    q: "Which is <b>not</b> a benefit of sealed classes from the lecture?",
    options: ["Controlled evolution of the type hierarchy", "The compiler knows every subtype (exhaustive pattern matching)", "Modeling a closed set of domain possibilities", "Objects of sealed classes use less memory"],
    answer: 3,
    whys: ["That is a benefit: you control who can extend the type.", "That is a benefit: the compiler can check that a switch covers every subtype.", "That is a benefit: some domains really have a fixed set of cases.", null],
    explain: "Sealing is about controlling who can extend a type, not about memory.",
  },
  {
    id: "mc-enforced", type: "mc", lec: [8], sec: "hiding",
    q: "In Python, a field named <code>__power__</code> signals “internal”, but other code can still set it. What does Java’s <code>private</code> add?",
    options: ["Nothing; it’s also just a convention", "Enforcement: outside code that touches the field won’t compile", "Faster field access", "It stops the field from changing after construction"],
    answer: 1,
    whys: ["Java’s private is enforced by the compiler; it isn’t just a convention.", null, "Access modifiers don’t change speed.", "That’s final. private controls who can access the field, not whether it changes."],
    explain: "Effective information hiding is enforced by the language, not left to developers doing the right thing.",
  },
  {
    id: "mc-module-exports", type: "mc", lec: [8], sec: "modules",
    q: "A library has a <code>public</code> helper class in <code>com.smarthome.internal</code>, and <code>module-info.java</code> doesn’t export that package. Can a consumer of the library use the class?",
    options: ["Yes, because it’s public", "No: unexported packages are hidden from consumers, even their public classes", "Only through reflection in the same package", "Only if the consumer is in the same folder"],
    answer: 1,
    whys: ["public isn’t enough across modules: an unexported package is hidden.", null, "Same-package reflection doesn’t help someone outside the module; the package is hidden.", "Folders don’t matter; module exports decide access."],
    explain: "The module system hides whole packages. Only exported packages form the library’s API.",
  },
  {
    id: "mc-shield", type: "mc", lec: [8], sec: "hiding",
    q: "Why does the lecture recommend that callers refer to an <b>interface</b> type (like <code>IoTDevice</code>) rather than the concrete class?",
    options: ["Interfaces are faster", "The implementation can change without affecting callers", "Concrete classes can’t be passed as arguments", "Calls through an interface are type-checked at runtime instead of compile time"],
    answer: 1,
    whys: ["Interfaces aren’t about speed.", null, "Concrete objects can be passed anywhere their type fits.", "Calls through an interface are checked at compile time like any other."],
    explain: "An interface specifies the <i>what</i> without the <i>how</i>, so it shields callers from implementation details.",
  },
  {
    id: "mc-modularity-not", type: "mc", lec: [8], sec: "modularity",
    q: "Which is <b>not</b> a benefit of independent modules?",
    options: ["Several developers can build modules at the same time", "A module can be changed without affecting others", "Modules can be verified more easily", "Modules guarantee the program has no bugs"],
    answer: 3,
    whys: ["That is a benefit: teams can work in parallel.", "That is a benefit: changes stay inside one module.", "That is a benefit: smaller modules are easier to test.", null],
    explain: "Modularity makes code easier to build, change, optimize, and test, but it doesn’t guarantee correctness.",
  },
  {
    id: "design-counter", type: "design", lec: [8], sec: "access",
    q: "<code>Counter</code> documents that its count never decreases, but it declares <code>public int count;</code>. What’s the best fix?",
    options: ["Add a comment telling people not to change <code>count</code>", "Make <code>count</code> private and expose <code>getCount()</code> and <code>increment()</code>", "Make <code>count</code> final", "Make <code>Counter</code> abstract"],
    answer: 1,
    whys: ["A comment doesn’t stop anyone. Hiding should be enforced by the language.", null, "final would stop count from ever increasing, too.", "abstract stops creating Counters, but count is still public."],
    model: "A public field lets any caller write <code>c.count = 0</code> and break the invariant, so nobody can rely on it. Making it <b>private</b> lets the class <b>enforce</b> the invariant: only <code>increment()</code> can change it. (Making it final would stop increment from working.)",
    explain: "Minimize accessibility: fields private by default.",
  },
]);
