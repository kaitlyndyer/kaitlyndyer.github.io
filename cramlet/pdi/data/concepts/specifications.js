registerConcept({
  id: "specifications",
  oneLiner:
    "A good spec lets you use a method <b>without reading its code</b>. It should be <b>general</b>, <b>restrictive</b>, and <b>clear</b>, because ambiguity turns into specification debt.",

  related: ["nullness", "contracts", "design-goals"],

  summary: {
    keyPoints: [
      { lec: [6], html: "<b>Modularization</b> breaks programs into pieces (modules, classes, methods), and each piece needs a clear specification." },
      { lec: [6], html: "<b>Chunking:</b> we hold about <b>7 ± 2 items</b> in short-term memory (Miller’s Law). A clear spec turns a method into one chunk." },
      { lec: [6], html: "<b>Restrictive:</b> rule out unacceptable implementations, for example by saying what happens on <code>null</code>." },
      { lec: [6], html: "<b>General:</b> don’t rule out correct implementations. Describe <i>what</i> it does (behavioral), not <i>how</i> (operational)." },
      { lec: [6], html: "<b>Clear:</b> concise and unambiguous. Redundancy is only OK when it defines domain terms." },
      { lec: [6], kind: "warn", html: "<b>Specification debt:</b> ambiguous specs push consequential decisions onto implementers. Fixing it in the spec is far cheaper than fixing deployed code." },
    ],
    compare: {
      head: ["Property", "Means", "Fails when…"],
      rows: [
        ["<b>Restrictive</b>", "Any implementation that doesn’t satisfy it is incorrect", "It’s silent about inputs like <code>null</code>, or about ordering"],
        ["<b>General</b>", "Any implementation that satisfies it is correct", "It dictates <i>how</i> to implement (an operational spec)"],
        ["<b>Clear</b>", "Concise, unambiguous, easy to understand", "It’s redundant or open to different interpretations"],
      ],
    },
  },

  details: [
    {
      id: "why",
      title: "Why specifications matter",
      lec: [6],
      html: `
        <p>The goal since the dawn of programming: make large programs easier to write. The key tool is <b>modularization</b>, and every piece needs a clear spec.</p>
        <p><b>Psychology sidebar, chunking:</b> humans hold about 7 ± 2 items in short-term memory, but an “item” can vary in size. <code>10, 20, 30, …, 80</code> is easy to remember because it’s one chunk: “multiples of 10 from 10 to 80.” The same numbers shuffled are not.</p>
        <p>Clear specs let us hold several pieces in mind at once, understand a method without reading its implementation, and design one chunk at a time.</p>`,
    },
    {
      id: "restrictive",
      title: "Restrictiveness: consider all inputs",
      lec: [6],
      html: `
        <p>A spec should rule out implementations that clients would find unacceptable.</p>
        <ul>
          <li>“Returns the sum of the elements in the array” says nothing about <code>null</code>. Throwing, returning garbage, or crashing would all “satisfy” it. Adding <code>@throws NullPointerException if the array is null</code> fixes that.</li>
          <li>A <code>Set</code>’s <code>iterator()</code> spec could leave clients expecting some order. The real docs add: <i>“The elements are returned in no particular order.”</i></li>
        </ul>`,
    },
    {
      id: "general",
      title: "Generality: describe what, not how",
      lec: [6],
      html: `
        <p>An <b>operational</b> spec (“examines each element in order… returns its index”) describes <i>how</i> to implement the method. It rules out correct implementations that return <i>any</i> matching index.</p>
        <p>A <b>behavioral</b> spec (“returns an index of <code>arr</code> that contains <code>searchTarget</code>”) permits any occurrence, and it’s shorter.</p>
        <p><b>Striking the balance:</b> if clients truly need the <i>first</i> occurrence, the general spec isn’t restrictive enough. Either version can be right in context. To check generality, examine each requirement and ask whether it rules out a correct implementation. That takes understanding the domain and the clients (for now, domain constraints will be given).</p>`,
    },
    {
      id: "clear",
      title: "Clarity: concise, not redundant",
      lec: [6],
      html: `
        <p>Dangerous specs let developers <i>think</i> they understand when they don’t. Aim for concise, but the shortest isn’t always clearest, and long isn’t always complete.</p>
        <ul>
          <li><i data-icon="no"></i> “Returns the sum… The sum is computed by adding each element… It is the total of all the elements…” is redundant. Are “sum” and “total” different concepts?</li>
          <li><i data-icon="yes"></i> Purposeful redundancy is fine when it <b>defines a domain term</b>, like explaining what “present value of an income stream” means.</li>
        </ul>`,
    },
    {
      id: "debt",
      title: "Ambiguity and specification debt",
      lec: [6],
      html: `
        <p>Ambiguous specs accrue hidden costs: different developers make different interpretations, which leads to bugs, complaints, and refactoring.</p>
        <p><b>Example:</b> “submissions should be processed promptly.” One developer processes them alphabetically, so “Zhang” always waits longer than “Adams.” Perhaps there was also an unstated <b>fairness</b> requirement.</p>
        <ul>
          <li>Unclear specs delegate decisions to implementers, who may not realize the choices are consequential.</li>
          <li><b>Specification debt</b> is fine at first and becomes a liability as the system scales.</li>
          <li>Ask: <i>could reasonable interpretations lead to different outcomes for different groups?</i></li>
          <li>Fixing ambiguity in the spec ≪ fixing it in deployed code. Architecture goal: eliminate “too expensive to change” decisions.</li>
        </ul>`,
    },
    {
      id: "invariants",
      title: "Invariants",
      lec: [6],
      html: `
        <p>An <b>invariant</b> is a condition that must always hold for a component, like “a date object’s fields always form a valid date.”</p>
        <p>The best invariants are readable by humans <b>and enforced by the language</b>. “Whole numbers only” is enforced by Java’s integer types, while Python would need extra code. Most languages can’t enforce every invariant, but nullness annotations help with one of the most common ones (see <b>Nullness &amp; JSpecify</b>).</p>`,
    },
  ],

  code: [
    {
      title: "A more restrictive spec",
      lec: [6],
      code: `/**
 * Returns the sum of the elements in the array.
 * @param arr the array to sum
 * @return the sum of the elements in the array
 * @throws NullPointerException if the array is null
 */
public int sum(int[] arr) { ... }`,
    },
    {
      title: "Operational (too specific) vs. behavioral (general)",
      lec: [6],
      note: "The behavioral version allows returning <i>any</i> matching index, and it’s shorter.",
      code: `/**
 * If arr is null, throw a NullPointerException.
 * Else: examines each element of arr in order. If the current element
 * equals searchTarget, return its index. If it reaches the end without
 * finding it, throw a NoSuchElementException.
 */
public int search(int[] arr, int searchTarget)

/**
 * Returns an index of arr that contains searchTarget.
 * @return an index of arr that contains searchTarget
 * @throws NullPointerException if arr is null
 * @throws NoSuchElementException if arr does not contain it
 */
public int search(int[] arr, int searchTarget)`,
    },
    {
      title: "Purposeful redundancy: defining a domain term",
      lec: [6],
      code: `/**
 * Computes the present value of an income stream.
 * The present value of an income stream is the amount of money
 * that, if invested at the given interest rate, would grow to
 * the total income over the given number of years.
 */
public float presentValue(float income, float interestRate, int years)`,
    },
  ],

  flashcards: [
    { front: "Miller’s Law", back: "We hold about <b>7 ± 2</b> items (chunks) in short-term memory." },
    { front: "Restrictive spec", back: "Any implementation that <b>doesn’t</b> satisfy it is incorrect. It rules out unacceptable behavior." },
    { front: "General spec", back: "Any implementation that <b>does</b> satisfy it is correct. It doesn’t over-constrain." },
    { front: "Operational vs. behavioral spec", back: "Operational says <i>how</i> to implement. Behavioral says <i>what</i> it does. Prefer behavioral." },
    { front: "When is redundancy in a spec OK?", back: "When it purposefully defines a <b>domain term</b>." },
    { front: "Specification debt", back: "Ambiguity that delegates consequential decisions to implementers. Cheap to fix in the spec, expensive later." },
    { front: "Invariant", back: "A condition that must always hold for a component, ideally enforced by the language." },
  ],

  quiz: [
    {
      type: "mc", lec: [6],
      q: "A spec says “returns the sum of the elements” but nothing about <code>null</code>. What’s wrong with it?",
      options: ["It’s not general enough", "It’s not restrictive enough", "It’s too redundant", "Nothing"],
      answer: 1,
      explain: "With <code>null</code> unspecified, throwing, returning garbage, or crashing would all satisfy it. Add an <code>@throws</code> clause.",
    },
    {
      type: "mc", lec: [6],
      q: "A spec says “examines each element in order and returns the index of the first match.” Clients only need <i>some</i> matching index. What’s the problem?",
      options: ["It’s operational, so it’s not general enough", "It’s not restrictive enough", "It’s ambiguous", "It defines a domain term"],
      answer: 0,
      explain: "Describing <i>how</i> rules out correct implementations that return any match. Write a behavioral spec instead.",
    },
    {
      type: "tf", lec: [6],
      q: "True or false: the shortest possible spec is always the clearest.",
      answer: false,
      explain: "Shortest isn’t always clearest, and long isn’t always complete. Aim for concise <i>and</i> unambiguous.",
    },
    {
      type: "mc", lec: [6],
      q: "“Process submissions promptly” led to alphabetical processing, so “Zhang” always waited longest. What is this an example of?",
      options: ["A restrictive spec", "Specification debt from ambiguity", "An invariant", "Dynamic dispatch"],
      answer: 1,
      explain: "The ambiguous spec let an implementer make a consequential choice, with unfair outcomes for some groups.",
    },
    {
      type: "mc", lec: [6],
      q: "Which spec sentence is <b>purposeful</b> redundancy?",
      options: [
        "“It is the total of all the elements in the array.” (after already saying it returns the sum)",
        "“The present value of an income stream is the amount of money that, if invested… would grow to the total income.”",
        "“This method returns a value.”",
        "“The sum is computed by adding each element.”",
      ],
      answer: 1,
      explain: "Defining a domain term like “present value” helps clients. Restating “sum” as “total” just adds confusion.",
    },
    {
      type: "mc", lec: [6],
      q: "Why does the real <code>Set.iterator()</code> documentation say “the elements are returned in no particular order”?",
      options: ["To make the spec more restrictive about what clients can expect", "Because sets are always sorted", "To make the method faster", "It’s a typo"],
      answer: 0,
      explain: "Without it, clients might assume an ordering. Stating it explicitly rules out that misunderstanding.",
    },
  ],
});
