// The night-before review's "cast of characters": the lecture and course examples that exam questions
// name with only a short description. One or two lines each, in our own words. Never assignment solutions.
window.STUDY.cast = [
  {
    title: "The smart-home devices",
    intro: "The course’s running example, from Lecture 1 onward. The design gets better as the lectures go on.",
    ref: "devices-improved",
    items: [
      { name: "IoTDevice", kind: "interface", c: "interfaces", html: "What every device can do. In the improved design that’s only <code>identify()</code> and <code>isOn()</code>. On/off moved out into Switchable." },
      { name: "Switchable", kind: "interface", c: "interfaces", html: "Devices you can <code>turnOn()</code> / <code>turnOff()</code>. Split out of IoTDevice because a Thermostat is always on (Interface Segregation)." },
      { name: "Light → DimmableLight, TunableLight", kind: "interfaces", c: "interfaces", html: "Light adds <code>getBrightness()</code>; DimmableLight adds <code>setBrightness</code>; TunableLight adds color temperature. In the improved design, every public method comes from some interface." },
      { name: "BaseIoTDevice", kind: "abstract class", c: "inheritance", html: "Holds the code every device shares (the name, the on/off state, <code>isOn()</code>) but leaves <code>identify()</code> abstract. So it must be abstract, and you can’t <code>new</code> one." },
      { name: "BaseSwitchableDevice", kind: "abstract class", c: "inheritance", html: "Shares the <code>turnOn</code>/<code>turnOff</code> code. Together with the interfaces, this is the skeletal-implementation pattern (like <code>List</code> + <code>AbstractList</code>)." },
      { name: "Fan, Thermostat", kind: "classes", c: "polymorphism", html: "Concrete devices that each supply their own <code>identify()</code>. Dynamic dispatch picks the right one, even through an <code>IoTDevice</code> variable." },
      { name: "DimmableLight, TunableWhiteLight", kind: "classes / interface", c: "inheritance", html: "In Lecture 2 these are subclasses of a Light class with a <code>protected</code> brightness field. TunableWhiteLight adds color temperature (in Kelvin). Light’s extra public <code>getBrightness()</code> came “out of thin air,” which the improved design fixes." },
    ],
  },
  {
    title: "Scenes and the hub",
    intro: "Used for program understanding (Lecture 5) and coupling (Lecture 8).",
    items: [
      { name: "Scene", kind: "class", c: "program-understanding", html: "A saved setting for some devices, like “night.” <code>activate()</code> sets each of its devices." },
      { name: "AreaScene", kind: "class", c: "program-understanding", html: "Activates an area’s scene, then <b>calls itself</b> for each child area (the recursion in the call graph). Its two bugs: a missing scene (null) and an area loop, which recurses forever until a StackOverflowError." },
      { name: "DeviceHub", kind: "class", c: "coupling-cohesion", html: "Manages many devices. The Lecture 8 bad versions: <code>addLights(Light[])</code> + <code>addFans(Fan[])</code>, a public device list, and an <code>instanceof</code> chain in <code>ecoMode()</code>. The fix: depend on <code>List&lt;IoTDevice&gt;</code>." },
    ],
  },
  {
    title: "CookYourBooks",
    intro: "The recipe app from the assignments. The exam uses its class names in concept questions, with a short description.",
    items: [
      { name: "Recipe", kind: "class", c: "coupling-cohesion", html: "A recipe with a list of ingredients. Reaching through it (<code>recipe.getIngredients().get(i).getQuantity()…</code>) is a coupling smell: ask for what you actually use." },
      { name: "MeasuredIngredient", kind: "class", c: "contracts", html: "An ingredient with a name and a Quantity. A classic place for <code>equals</code> + <code>hashCode</code> questions (override both!) and for <code>Comparator.comparing(MeasuredIngredient::getName)</code>." },
      { name: "Quantity", kind: "abstract class", c: "inheritance", html: "How much of something, with a unit. Abstract, with methods like <code>toDecimal()</code> that each kind implements, so <code>new Quantity()</code> doesn’t compile." },
      { name: "ExactQuantity, FractionalQuantity, RangeQuantity", kind: "subclasses", c: "inheritance", html: "The kinds of Quantity: an exact amount (2.5 cups), a fraction (1/2 cup), and a range (2–3 cups). Each must keep Quantity’s promises (Liskov), and only FractionalQuantity has fraction methods like <code>getNumerator()</code>, so calling it through a <code>Quantity</code> variable doesn’t compile." },
    ],
  },
];
