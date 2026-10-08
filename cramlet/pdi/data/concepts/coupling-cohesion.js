registerConcept({
  id: "coupling-cohesion",
  oneLiner:
    "Good modules have <b>low coupling</b> (changes elsewhere rarely affect them) and <b>high cohesion</b> (one purpose, fulfilled fully).",

  related: ["information-hiding", "design-goals", "interfaces"],

  summary: {
    keyPoints: [
      { lec: [8], html: "<b>Coupling</b>: how much a module is affected by changes in others (a common synonym is <i>dependency</i>). <b>Low coupling promotes changeability.</b>" },
      { lec: [8], html: "Coupling is about more than the number of connections: ask <b>how likely each one is to cause harm</b>." },
      { lec: [8], kind: "key", html: "Depend on <b>interfaces and abstract classes</b>, not concrete implementations (<code>addDevices(IoTDevice[])</code>, not <code>addLights(Light[])</code> + <code>addFans(Fan[])</code>), and on modules that rarely change (<code>List</code>, not a custom <code>MyList</code>)." },
      { lec: [8], kind: "warn", html: "Don’t expose implementation details (a <code>public static List</code>) that invite coupling. And watch for <b>logic coupling</b>: <code>instanceof</code> chains with device-specific code break whenever devices change." },
      { lec: [8], html: "<b>Cohesion</b>: how much a module is related to its responsibilities. Highly cohesive = <b>one specific purpose, as self-sufficient as possible</b>." },
      { lec: [8], kind: "key", html: "A <b>utility class</b> of unrelated operations has low cohesion: “a house for orphaned operations” that changes for every reason. Combining a device’s data with its operations is highly cohesive." },
      { lec: [8], html: "Strive for <b>high cohesion, low coupling, and good information hiding</b>." },
    ],
    compare: {
      head: ["", "Coupling", "Cohesion"],
      rows: [
        ["Measures", "How much a module is affected by changes in <b>others</b>", "How closely a module’s contents relate to <b>its own</b> purpose"],
        ["Want it", "<b>Low</b>", "<b>High</b>"],
        ["Warning sign", "Depends on concrete classes or exposed internals; instanceof chains", "Grab-bag “Utility” classes; data split from its operations"],
      ],
    },
  },

  details: [
    {
      id: "coupling",
      title: "Coupling",
      lec: [8],
      html: `
        <p><b>Coupling</b> is how much a module is affected by changes in other modules: a measure of how well modularity is implemented. In a car, a part connected to many others is hard to change, because changes cascade. <b>Low coupling promotes changeability.</b></p>
        <p>Picture modules as nodes in a graph, with an edge for each direct coupling: a sparser graph means lower coupling. But it’s more nuanced than counting edges. The key question is <b>how likely a coupling is to cause harm</b>.</p>`,
    },
    {
      id: "concrete",
      title: "Depend on interfaces, not implementations",
      lec: [8],
      html: `
        <p>A <code>DeviceHub</code> with <code>addLights(Light[])</code> and <code>addFans(Fan[])</code> is coupled to <code>Light</code>, <code>Fan</code>, and transitively <code>IoTDevice</code>. A change to any Light or Fan method can break the hub, even though the hub didn’t change. Implementations change often, so harm is likely.</p>
        <p>With <code>addDevices(IoTDevice[])</code>, the hub can’t reach device-specific operations, so Light/Fan changes that keep their public spec don’t affect it. It’s still coupled to <code>IoTDevice</code>, but <b>interfaces change rarely</b>.</p>
        <p class="callout">Best practice: depend on interfaces and abstract classes, not specific implementations.</p>
        <p>A parameter is also coupled to <b>how data is organized</b>: an array (fixed Java construct), a <code>List</code> (standard interface, very unlikely to change), or a custom <code>MyList</code> (may change often, so riskiest). Prefer coupling to modules less likely to change.</p>`,
    },
    {
      id: "exposing",
      title: "Don’t expose implementation details",
      lec: [8],
      html: `
        <p>If <code>DeviceHub</code> exposes <code>public static List&lt;IoTDevice&gt; devices</code>, a <code>HubViewer</code> will loop over it directly. Later, switching to a <code>Map&lt;String, IoTDevice&gt;</code> forces <code>HubViewer</code> to change too. Don’t expose implementation details in a way that invites coupling.</p>
        <p>The same idea at small scale: a method that takes a whole <code>Order</code> but only uses <code>order.customer.email</code> is coupled to (and must be tested with) the entire <code>Order</code>/<code>Customer</code> structure. Asking only for what it needs (the email) lowers coupling.</p>`,
    },
    {
      id: "logic",
      title: "Coupled to logic",
      lec: [8],
      html: `
        <p>Even when the data is only typed as <code>IoTDevice</code>, the <b>logic</b> can be device-specific: an <code>ecoMode()</code> method with <code>if (dev instanceof Light l) { … } else if (dev instanceof Fan f) { … }</code>. Now ecoMode must change when a device method changes or a new device type is added, and the <code>IoTDevice</code> maintainer can’t even see that the hub is affected. The damage is discovered later, the hard way.</p>
        <p>Moving “eco mode” into each device (distributing responsibility, as in OO design) fixes that, but then every new operation anywhere changes all the device classes, which trades one maintenance problem for another. (The Visitor design pattern addresses this; not covered in detail.)</p>`,
    },
    {
      id: "cohesion",
      title: "Cohesion",
      lec: [8],
      html: `
        <p><b>Cohesion</b> is how much a module is related to its responsibilities. A highly cohesive module has <b>one specific purpose</b> and is <b>as self-sufficient as possible</b>, like a car part that performs exactly one function, fully.</p>
        <ul>
          <li>A module with <b>multiple purposes</b> changes more often (once for each purpose).</li>
          <li>A module with an <b>incomplete purpose</b> changes whenever the other parts it relies on change.</li>
        </ul>
        <p>With one self-contained purpose per module, it’s easy to pinpoint which module a new feature affects, and changes stay isolated. <b>High cohesion promotes changeability.</b></p>`,
    },
    {
      id: "evolution",
      title: "From a utility class to cohesive device types",
      lec: [8],
      html: `
        <ol>
          <li><b>Records + one <code>DeviceOperations</code> class</b> with <code>setLightPower</code>, <code>turnOnFan</code>, <code>identifyLight</code>, … The records each have one purpose, but <code>DeviceOperations</code> is a loosely related grab-bag: <b>low cohesion</b>. Utility classes are “a house for orphaned operations.” It changes when an identifier format changes, an operation is added, a device type is added, or any operation changes.</li>
          <li><b><code>LightOperations</code> + <code>FanOperations</code></b>: more cohesive. A new device gets its own class, and no existing class changes. But <code>Light</code> and <code>Fan</code> are now data without operations, needing accessors, so changing a light property changes both <code>Light</code> and <code>LightOperations</code>.</li>
          <li><b>Combine each device’s data with its operations</b>: <code>Light</code> has <code>setPower</code>, <code>turnOn</code>, <code>turnOff</code>, <code>identify</code>. Only <code>Light</code> changes for light-specific changes, and no existing class changes for new devices. <b>Highly cohesive</b>, with fewer, more isolated changes.</li>
        </ol>`,
    },
  ],

  code: [
    {
      title: "Coupled to concrete types vs. an interface",
      lec: [8],
      code: `// Coupled to Light and Fan: any change there may break the hub
class DeviceHub {
    void addLights(Light[] lights) { ... }
    void addFans(Fan[] fans) { ... }
}

// Coupled only to IoTDevice, which rarely changes
class DeviceHub {
    void addDevices(List<IoTDevice> devices) { ... }
}`,
    },
    {
      title: "Logic coupling",
      lec: [8],
      code: `public void ecoMode() {
    for (IoTDevice dev : devices) {
        if (dev instanceof Light l) {
            l.setBrightness(2);
        } else if (dev instanceof Fan f) {
            f.setSpeed(1);
        } // every new device type means editing this method
    }
}`,
    },
    {
      title: "Low vs. high cohesion",
      lec: [8],
      code: `// Low cohesion: a grab-bag of loosely related operations
public class DeviceOperations {
    public void setLightPower(Light l, int power) { ... }
    public void turnOnFan(Fan f) { ... }
    public String identifyLight(Light l) { ... }
    // ...
}

// High cohesion: each device owns its data and operations
class Light {
    public void setPower(int power) { ... }
    public void turnOn() { ... }
    public String identify() { ... }
}`,
    },
  ],

  flashcards: [
    { front: "Coupling", back: "How much a module is affected by changes in other modules. Want it <b>low</b>." },
    { front: "Cohesion", back: "How much a module is related to its responsibilities: one purpose, fulfilled fully. Want it <b>high</b>." },
    { front: "Is coupling just the number of dependencies?", back: "No. Also ask how likely each dependency is to cause harm (how often it changes)." },
    { front: "Best practice for parameter types", back: "Depend on interfaces/abstract classes (<code>IoTDevice</code>, <code>List</code>), not concrete or custom classes." },
    { front: "Why is exposing <code>public static List devices</code> bad?", back: "Other classes couple to that representation; changing it (e.g. to a Map) forces them to change." },
    { front: "Logic coupling", back: "Device-specific logic (instanceof chains) in another module, which must change whenever devices change." },
    { front: "Why do utility classes have low cohesion?", back: "Unrelated operations share a class, so it changes for many unrelated reasons: “a house for orphaned operations.”" },
    { front: "Multiple purposes vs. incomplete purpose", back: "Multiple purposes → changes more often. Incomplete purpose → changes when other parts change." },
    { front: "What promotes changeability?", back: "High cohesion, low coupling, and good information hiding." },
  ],

  quiz: [
    {
      type: "mc", lec: [8],
      q: "Which best defines <b>coupling</b>?",
      options: ["How many lines a module has", "How much a module is affected by changes in other modules", "How closely a module’s methods relate to one purpose", "How fast modules communicate"],
      answer: 1,
      explain: "“How closely a module’s methods relate to one purpose” is cohesion. Coupling is about dependence on other modules.",
    },
    {
      type: "mc", lec: [8],
      q: "Which <code>DeviceHub</code> method has the <b>lowest</b> harmful coupling?",
      options: ["<code>addLights(Light[] l)</code> and <code>addFans(Fan[] f)</code>", "<code>addDevices(MyList&lt;IoTDevice&gt; d)</code> (a custom list class)", "<code>addDevices(List&lt;IoTDevice&gt; d)</code>", "<code>addDevices(ArrayList&lt;Light&gt; d)</code>"],
      answer: 2,
      explain: "It depends on the stable <code>IoTDevice</code> interface and the standard <code>List</code> interface, both unlikely to change.",
    },
    {
      type: "mc", lec: [8],
      q: "<code>notify(Order order)</code> only ever uses <code>order.customer.email</code>. What’s the main design problem?",
      options: ["It’s slower than passing a String", "It’s coupled to the whole Order/Customer structure, so tests must build a full Order", "It violates the equals contract", "Nothing; passing objects is always better"],
      answer: 1,
      explain: "Ask only for what you need. Taking the email directly lowers coupling and makes testing easy.",
    },
    {
      type: "mc", lec: [8],
      q: "A <code>Helpers</code> class contains <code>formatPrice()</code>, <code>parseCsv()</code>, and <code>sendAlert()</code>. What’s the main problem?",
      options: ["The class will be too slow", "Low cohesion: unrelated responsibilities, so it changes for many unrelated reasons", "High coupling between the three methods", "The methods must be made private"],
      answer: 1,
      explain: "Utility grab-bags are hard to navigate, and a change for one purpose risks the others.",
    },
    {
      type: "mc", lec: [8],
      q: "Why is <code>ecoMode()</code> with an <code>instanceof Light</code> / <code>instanceof Fan</code> chain a coupling problem?",
      options: ["instanceof doesn’t compile on interfaces", "Its logic depends on each device type, so new devices or device changes force it to change", "It makes the hub immutable", "It’s a cohesion problem only"],
      answer: 1,
      explain: "That’s logic coupling: even though the data is typed as IoTDevice, the logic knows every device.",
    },
    {
      type: "mc", lec: [8],
      q: "Which combination best promotes changeability?",
      options: ["High coupling, high cohesion", "Low coupling, low cohesion", "Low coupling, high cohesion", "High coupling, low cohesion"],
      answer: 2,
      explain: "Plus good information hiding.",
    },
    {
      type: "mc", lec: [8],
      q: "Why does a module with an <b>incomplete</b> purpose hurt changeability?",
      options: ["It runs out of memory", "It must change whenever the other modules it relies on change", "It can’t be compiled separately", "It has too many methods"],
      answer: 1,
      explain: "Highly cohesive modules are self-sufficient: one purpose, fulfilled fully.",
    },
    {
      type: "tf", lec: [8],
      q: "True or false: coupling can be fully measured by counting how many other modules a module depends on.",
      answer: false,
      explain: "It also matters how likely each dependency is to change and cause harm.",
    },
  ],
});
