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
