registerExam("exceptions", [
  {
    id: "trace-try", type: "trace", lec: [2], sec: "catching",
    q: "What does this print?",
    code: `try {
    System.out.println("A");
    int[] nums = new int[2];
    nums[2] = 5;
    System.out.println("B");
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("C");
}
System.out.println("D");`,
    out: { kind: "output", text: "A\nC\nD" },
    explain: "<code>nums</code> has indexes 0 and 1, so <code>nums[2]</code> throws. The rest of the <code>try</code> block (<code>B</code>) is skipped, the matching <code>catch</code> runs, and then execution continues after the try/catch.",
  },
  {
    id: "write-ctor", type: "write", lec: [2], sec: "throwing",
    q: "Write a constructor <code>Light(String name, int brightness)</code> that stores both fields, but throws an <code>IllegalArgumentException</code> with a helpful message if <code>brightness</code> isn’t between 0 and 100 (inclusive). The fields are <code>private final String name</code> and <code>private final int brightness</code>.",
    rubric: [
      { text: "Correct constructor header: <code>public Light(String name, int brightness)</code>", re: "Light\\s*\\(\\s*String\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)" },
      { text: "Checks both ends of the range (below 0 and above 100)", re: "(<\\s*0|0\\s*>)[\\s\\S]*(>\\s*100|100\\s*<)|(>\\s*100|100\\s*<)[\\s\\S]*(<\\s*0|0\\s*>)" },
      { text: "<code>throw new IllegalArgumentException(...)</code> with a message", re: "throw\\s+new\\s+IllegalArgumentException\\s*\\(\\s*\"" },
      { text: "Stores both fields with <code>this.name = …</code> and <code>this.brightness = …</code>", re: "this\\.name\\s*=[\\s\\S]*this\\.brightness\\s*=|this\\.brightness\\s*=[\\s\\S]*this\\.name\\s*=" },
      { text: "Checks the input <b>before</b> storing anything" },
    ],
    model: `public Light(String name, int brightness) {
    if (brightness < 0 || brightness > 100) {
        throw new IllegalArgumentException(
            "brightness must be between 0 and 100, got " + brightness);
    }
    this.name = name;
    this.brightness = brightness;
}`,
    explain: "Validate first, then assign: the object is never half-built. Include the bad value in the message so whoever sees the exception knows what went wrong.",
  },
]);
