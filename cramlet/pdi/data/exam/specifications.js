registerExam("specifications", [
  {
    id: "design-vague-spec", type: "design", lec: [6], sec: "clear",
    q: "A method’s Javadoc says: <i>“Processes the requests promptly.”</i> What’s the main problem?",
    options: ["It’s too restrictive", "It isn’t clear or restrictive enough: “processes” and “promptly” could mean anything", "Javadoc shouldn’t describe behavior", "Nothing; short specs are best"],
    answer: 1,
    model: "A spec should be <b>restrictive</b> (rule out wrong implementations), <b>general</b> (allow every right one), and <b>clear</b>. This one is vague: it doesn’t say what processing does, what “promptly” means, what’s returned, or what happens on bad input. A better spec names the inputs, the result, and the exceptions (<code>@param</code>, <code>@return</code>, <code>@throws</code>).",
    explain: "Ask: could two reasonable people implement this and get different behavior? If yes, it isn’t restrictive or clear enough.",
  },
]);

// ---------- Batch 5 (lecture 6) ----------
registerExam("specifications", [
  {
    id: "design-behavioral", type: "design", lec: [6], sec: "general",
    q: "Clients of <code>search(arr, target)</code> only need <i>some</i> index where the target appears. Which spec is better?",
    options: ["“Examines each element in order; returns the index of the first match.”", "“Returns an index of arr that contains target.”", "“Searches the array.”", "“Uses binary search to find target.”"],
    answer: 1,
    model: "The <b>behavioral</b> spec says <i>what</i>, not <i>how</i>. The operational one rules out correct implementations (searching backward, in parallel…) that clients would be happy with. “Searches the array” isn’t restrictive enough, and “uses binary search” describes the implementation.",
    explain: "To check generality, ask whether each requirement rules out a correct implementation.",
  },
  {
    id: "design-first-needed", type: "design", lec: [6], sec: "general",
    q: "Now a client <b>relies on</b> getting the first matching index (it highlights the earliest event). Is “Returns an index of arr that contains target” still a good spec?",
    options: ["Yes, general specs are always better", "No: it isn’t restrictive enough. Say “the smallest index” (or “first”)", "No: it should describe the loop", "Yes, but rename the method"],
    answer: 1,
    model: "Generality has to be balanced against restrictiveness. If clients truly need the first occurrence, the spec must promise it: “Returns the <b>smallest</b> index of arr that contains target.” That’s still behavioral, not a description of the loop.",
    explain: "Either spec can be right; it depends on what clients need.",
  },
  {
    id: "design-restrict-average", type: "design", lec: [6], sec: "restrictive",
    q: "A Javadoc says only: <i>“Returns the average brightness of the lights.”</i> What’s the most important thing missing?",
    options: ["How the average is computed", "What happens for an empty or null list", "The author’s name", "A longer description of “average”"],
    answer: 1,
    model: "It isn’t <b>restrictive</b> enough: for an empty list, returning 0, returning NaN, and throwing would all “satisfy” it. Add <code>@throws IllegalArgumentException if lights is empty</code> (and say what happens for null), so clients know what to expect.",
    explain: "Consider all inputs, especially the edge cases.",
  },
  {
    id: "design-spec-debt", type: "design", lec: [6], sec: "debt",
    q: "A spec says <i>“Show the top 10 players by score.”</i> Two developers implement it differently: one breaks ties alphabetically by name, the other by who reached the score first. What’s going on?",
    options: ["Nothing; both meet the spec, so it’s fine", "Specification debt: the ambiguity left a consequential decision to implementers, and one choice systematically favors certain players", "The spec is too restrictive", "It’s a performance problem"],
    answer: 1,
    model: "The spec is <b>ambiguous</b> about ties, so implementers made the decision without realizing it mattered. Breaking ties alphabetically always favors names like “Adams” over “Zhang”, which is a fairness issue. Fixing the spec now is far cheaper than fixing deployed code later.",
    explain: "Ask: could reasonable interpretations lead to different outcomes for different groups?",
  },
  {
    id: "mc-redundant", type: "mc", lec: [6], sec: "clear",
    q: "Which spec is the <b>clearest</b>?",
    options: ["“Returns the sum of the elements. The sum is computed by adding each element. It is the total of all the elements.”", "“Returns the sum of the elements in arr.”", "“Does the math on arr.”", "“Returns the total, which is the sum, i.e., the aggregate of the elements.”"],
    answer: 1,
    explain: "Concise and complete. The redundant versions repeat themselves and even make you wonder whether “sum” and “total” are different things. “Does the math” is vague.",
  },
  {
    id: "tf-purposeful", type: "tf", lec: [6], sec: "clear",
    q: "True or false: some redundancy in a spec is fine when it defines a domain term the reader might not know.",
    answer: true,
    explain: "Like explaining what “present value of an income stream” means. Purposeful redundancy helps; repeating yourself doesn’t.",
  },
  {
    id: "mc-invariant", type: "mc", lec: [6], sec: "invariants",
    q: "Which of these is an <b>invariant</b> of a <code>DimmableLight</code>?",
    options: ["“<code>setBrightness</code> was called at least once”", "“brightness is always between 0 and 100”", "“the light was created on a Tuesday”", "“<code>toString</code> is fast”"],
    answer: 1,
    explain: "An invariant is a condition that must <b>always</b> hold for the object. The constructor and every setter must keep it true (for example by throwing on bad values).",
  },
  {
    id: "mc-chunking", type: "mc", lec: [6], sec: "why",
    q: "Why does lecture bring up “chunking” (about 7 ± 2 items in short-term memory)?",
    options: ["To set a maximum method length", "Clear specs let you treat a whole method as one chunk, so you can reason about several pieces at once without reading their code", "To show that programs should have at most 7 classes", "To explain why Java has 8 primitive types"],
    answer: 1,
    explain: "Modularization only helps if each module has a clear spec. Then a method is one “item” in your head, not its whole implementation.",
  },
  {
    id: "fill-javadoc-tags", type: "fill", lec: [2, 6], sec: "restrictive",
    q: "Fill in the Javadoc tags.",
    code: `/**
 * Returns the sum of the elements in the array.
 * @[[1]] arr the array to sum
 * @[[2]] the sum of the elements in arr
 * @[[3]] NullPointerException if arr is null
 */
public int sum(int[] arr) { ... }`,
    blanks: [["param"], ["return"], ["throws", "exception"]],
    explain: "<code>@param</code> per parameter, <code>@return</code> for the result, and <code>@throws</code> for each exception, which is what makes the spec restrictive about bad input.",
  },
  {
    id: "write-javadoc", type: "write", lec: [6], sec: "restrictive",
    q: "Write a Javadoc spec (just the comment) for <code>int indexOf(List&lt;IoTDevice&gt; devices, String name)</code>. Clients need the <b>first</b> device whose <code>identify()</code> equals <code>name</code>. It throws <code>NoSuchElementException</code> if there’s no match.",
    code: `public int indexOf(List<IoTDevice> devices, String name)`,
    rubric: [
      { text: "A Javadoc comment (<code>/** … */</code>)", re: "/\\*\\*[\\s\\S]*\\*/" },
      { text: "Says it’s the <b>first</b> (smallest) matching index", re: "\\b(first|smallest|lowest)\\b", flags: "i" },
      { text: "<code>@param</code> for both <code>devices</code> and <code>name</code>", re: "^(?=[\\s\\S]*@param\\s+devices\\b)(?=[\\s\\S]*@param\\s+name\\b)", flags: "" },
      { text: "<code>@return</code> describing the index", re: "@return\\s+\\S" },
      { text: "<code>@throws NoSuchElementException</code> with when", re: "@throws\\s+(java\\.util\\.)?NoSuchElementException\\s+\\S" },
    ],
    model: `/**
 * Returns the index of the first device in devices whose
 * identify() equals name.
 *
 * @param devices the devices to search
 * @param name the name to look for
 * @return the smallest index i such that
 *         devices.get(i).identify() equals name
 * @throws NoSuchElementException if no device has that name
 */`,
    explain: "Say <i>what</i> it returns (behavioral), promise “first” because clients rely on it (restrictive), and cover the no-match case with <code>@throws</code>.",
  },
]);
