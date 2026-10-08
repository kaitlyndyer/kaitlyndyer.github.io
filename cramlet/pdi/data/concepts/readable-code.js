registerConcept({
  id: "readable-code",
  oneLiner:
    "Correct code can still be hard to read. <b>Consistent style</b> and <b>careful naming</b> make code easier to understand, use, and extend.",

  related: ["concise-java", "lambdas", "design-goals"],

  summary: {
    keyPoints: [
      { lec: [7], html: "Readable code is <b>understood better, used more, and extended more easily</b>. Code has more structure than prose, so it’s easier to make readable." },
      { lec: [7], html: "<b>Code style</b>: a consistent format (spacing, indentation, braces, documentation rules) lowers cognitive load. Tools like Checkstyle and Spotless/google-java-format enforce it automatically." },
      { lec: [7], kind: "key", html: "<b>Naming</b> is one of the most important readability factors. <b>Name molds</b> are a 3-step method: select the concepts, choose the words, construct the name." },
      { lec: [7], html: "<b>Same word ⇒ same concept.</b> Don’t mix <code>colorTemperature</code>, <code>colorTemp</code>, and <code>cct</code>. A <b>lexicon</b> documents the canonical words." },
      { lec: [7], html: "<b>Name length matches scope</b>: <code>i</code> or <code>light</code> in a short loop is fine; fields and public methods get descriptive names." },
      { lec: [7], kind: "warn", html: "Readability changes over time: code that’s obvious to its author can be opaque to whoever inherits it. Most software cost is <b>maintenance</b>." },
    ],
    compare: {
      head: ["Name-mold step", "Question to ask", "Example"],
      rows: [
        ["<b>1. Select the concepts</b>", "What, when, which unit?", "startup + color temperature (+ Kelvin?)"],
        ["<b>2. Choose the words</b>", "Precise domain words, used consistently?", "always <code>colorTemperature</code>, never <code>cct</code>"],
        ["<b>3. Construct the name</b>", "Consistent word order and casing?", "<code>startupColorTemperature</code> (camelCase)"],
      ],
    },
  },

  details: [
    {
      id: "why",
      title: "Why readability matters",
      lec: [7],
      html: `
        <p>Picture a great novel delivered as a messy handwritten draft, with inconsistent sentences, three different words for the same thing, and chapters named at random. The story is fine; the <b>presentation</b> makes it hard to enjoy.</p>
        <p>Code is the same: it can be correct and even efficient, yet hard to read. Readable code is <b>understood better, used more, and extended more easily</b>. The good news is that code has more and tighter structure than prose, so there are fewer ways to say the same thing, and it’s easier to make readable.</p>
        <p class="callout">Caveat: readability is <b>subjective</b>. Few rules are universally and objectively “more readable.”</p>`,
    },
    {
      id: "style",
      title: "Code style",
      lec: [7],
      html: `
        <p>There’s no universal standard, but most companies mandate one, because <b>consistency reduces cognitive load</b>. A style guide typically fixes:</p>
        <ul>
          <li>spacing and indentation</li>
          <li>how constructs are formatted (whitespace isn’t syntax in Java, so it has to be agreed on)</li>
          <li>mandatory documentation and its format</li>
          <li>otherwise-optional syntax, like braces around one-line <code>if</code> bodies</li>
        </ul>
        <p>Style is easy to enforce <b>automatically</b>: Spotless with google-java-format reformats code, and Checkstyle reports violations.</p>`,
    },
    {
      id: "name-molds",
      title: "Naming with name molds",
      lec: [7],
      html: `
        <p>Research consistently finds naming is one of the most important readability factors. Feitelson’s <b>name molds</b> put consistency and recognizability first, with three steps:</p>
        <ol>
          <li><b>Select the concepts</b> the name should carry. For a light’s color temperature: <i>what</i> (color temperature), <i>when</i> (startup? current? target?), and maybe the <i>unit</i> (Kelvin).</li>
          <li><b>Choose the words</b>: precise words from the problem domain, the <b>same word for the same concept</b> everywhere.</li>
          <li><b>Construct the name</b>: a consistent word order (modifier-first or modifier-last, then stick with it) and casing.</li>
        </ol>
        <p><b>Should the unit be in the name?</b> It depends on the codebase. If everything is in Kelvin, the unit in every name is noise. If units are mixed (Kelvin vs. mired), the unit prevents dangerous confusion. Unit mix-ups have caused real disasters, like the Mars Climate Orbiter (1999). Even better than naming conventions: types that enforce units.</p>`,
    },
    {
      id: "consistency",
      title: "Consistency, lexicons, and casing",
      lec: [7],
      html: `
        <p>The key insight: <b>same word ⇒ same concept</b>. Then readers can build a reliable mental model. Mixed synonyms (<code>colorTemperature</code>, <code>colorTemp</code>, <code>whitePoint</code>, <code>cct</code>) force them to keep checking whether two names mean the same thing.</p>
        <p>A <b>lexicon</b> is a documented mapping from concepts to their canonical words. It’s especially valuable on large teams and long-lived projects.</p>
        <p>Casing: <b>consistency matters more than the choice</b>. Java’s convention is camelCase for variables and methods and PascalCase for classes.</p>`,
    },
    {
      id: "length",
      title: "Name length matches scope",
      lec: [7],
      html: `
        <p>A variable that lives for two lines can have a short name (<code>i</code>, <code>light</code>): its meaning is right there. A field or public method is read far from where it’s defined, so it needs a <b>descriptive</b> name like <code>startupColorTemperature</code>.</p>`,
    },
    {
      id: "over-time",
      title: "Readability over time",
      lec: [7],
      html: `
        <p>Readability depends on <b>who</b> reads the code, and when. Most software cost is <b>maintenance</b>, not initial development. Code that’s clear to its author can be opaque to someone who inherits it years later, with a different background, native language, or set of “obvious” assumptions.</p>
        <p>Open source shows why this matters: projects must outlive any one contributor. Code only the core maintainers can read creates a <b>bus-factor</b> problem, and readable code cuts expensive onboarding time.</p>`,
    },
  ],

  code: [
    {
      title: "Building a name, step by step",
      lec: [7],
      code: `// Concepts: "startup" + "color temperature"
int startupColorTemperature;

// Add the unit only if the codebase mixes units
int startupColorTemperatureKelvin;`,
    },
    {
      title: "Same word, same concept",
      lec: [7],
      code: `// If "colorTemperature" is the term, use it everywhere
int getColorTemperature();
void setColorTemperature(int colorTemperature);

// Don't mix: colorTemperature, colorTemp, whitePoint, cct`,
    },
    {
      title: "Length matches scope",
      lec: [7],
      code: `// Short scope: a short name is fine
for (TunableWhiteLight light : lights) {
    light.setColorTemperature(2700);
}

// Long-lived field: a descriptive name
private final int startupColorTemperature;`,
    },
  ],

  flashcards: [
    { front: "Why does a consistent code style help?", back: "It reduces <b>cognitive load</b>: readers don’t have to adjust to a new format in every file." },
    { front: "Tools that enforce Java style", back: "Spotless + google-java-format (reformat), Checkstyle (report violations)." },
    { front: "The 3 name-mold steps", back: "1. Select the concepts. 2. Choose the words. 3. Construct the name." },
    { front: "Same word ⇒ ?", back: "Same concept. Never use two different words for one concept." },
    { front: "Lexicon", back: "A documented mapping from concepts to canonical words for a codebase." },
    { front: "Should a unit go in a variable name?", back: "If the codebase mixes units, yes (prevents confusion). If every value uses one unit, it’s noise." },
    { front: "Name length rule", back: "Length matches scope: short names for short scopes, descriptive names for fields and public methods." },
    { front: "Java casing conventions", back: "camelCase for variables and methods, PascalCase for classes." },
    { front: "Why readability over time?", back: "Most cost is maintenance, and future readers don’t share the author’s context." },
  ],

  quiz: [
    {
      type: "mc", lec: [7],
      q: "What is the main benefit of a team-wide code style?",
      options: ["The code runs faster", "Consistency reduces cognitive load for readers", "The compiler requires it", "It removes the need for documentation"],
      answer: 1,
      explain: "Style is about readers, not the compiler or performance. A consistent format means less mental effort per file.",
    },
    {
      type: "mc", lec: [7],
      q: "A codebase uses <code>colorTemp</code>, <code>colorTemperature</code>, and <code>cct</code> for the same idea. What’s the problem?",
      options: ["Nothing, as long as the code compiles", "Readers can’t tell whether the names mean the same thing, so they keep checking", "Long names are slower", "Java forbids abbreviations"],
      answer: 1,
      explain: "Same word ⇒ same concept. Synonyms break the reader’s mental model.",
    },
    {
      type: "mc", lec: [7],
      q: "Which is the <b>first</b> step of the name-mold method?",
      options: ["Pick camelCase or snake_case", "Select the concepts the name should represent", "Make the name as short as possible", "Add the unit of measurement"],
      answer: 1,
      explain: "Select the concepts, then choose the words, then construct the name.",
    },
    {
      type: "mc", lec: [7],
      q: "When does putting a unit like <code>Kelvin</code> in a variable name help most?",
      options: ["Always; every number needs a unit in its name", "When the codebase mixes units, so the name prevents confusion", "Never; units belong only in comments", "Only for constants"],
      answer: 1,
      explain: "If everything uses one unit, it’s noise. With mixed units it prevents dangerous mix-ups (or better, use types that enforce units).",
    },
    {
      type: "mc", lec: [7],
      q: "Which name choice best follows “length matches scope”?",
      options: ["A loop variable named <code>currentlyIteratedTunableWhiteLight</code>", "A private field named <code>t</code>", "A loop variable named <code>light</code> and a field named <code>startupColorTemperature</code>", "Every name exactly 8 characters"],
      answer: 2,
      explain: "Short scopes can use short names; long-lived fields and public methods need descriptive ones.",
    },
    {
      type: "tf", lec: [7],
      q: "True or false: for casing conventions, being consistent matters more than which convention you choose.",
      answer: true,
      explain: "Pick one (Java: camelCase for variables/methods, PascalCase for classes) and apply it uniformly.",
    },
    {
      type: "mc", lec: [7],
      q: "Why does the lecture say readability matters <b>over time</b>?",
      options: ["Old code runs slower", "Most cost is maintenance, and future maintainers don’t share the author’s assumptions", "Java syntax changes every year", "Readable code never needs to change"],
      answer: 1,
      explain: "Code clear to its author can be opaque to whoever inherits it. Readable code lowers onboarding and maintenance cost.",
    },
  ],
});
