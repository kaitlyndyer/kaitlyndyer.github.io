registerExam("program-understanding", [
  {
    id: "bug-off-by-one", type: "bug", lec: [5], sec: "control",
    q: "This method should return the sum of the array. Click the line with the bug, then pick the fix.",
    lines: [
      "static int sum(int[] nums) {",
      "    int total = 0;",
      "    for (int i = 0; i <= nums.length; i++) {",
      "        total += nums[i];",
      "    }",
      "    return total;",
      "}",
    ],
    answer: 2,
    fixes: ["Change <code>i &lt;= nums.length</code> to <code>i &lt; nums.length</code>", "Start <code>i</code> at 1", "Return <code>total + 1</code>", "Use <code>nums[i - 1]</code>"],
    fix: 0,
    explain: "Valid indexes go from 0 to <code>nums.length - 1</code>. With <code>&lt;=</code>, the last iteration reads <code>nums[nums.length]</code> and throws. Tracing the loop’s control flow at its boundary finds it.",
  },
  {
    id: "trace-npe", type: "trace", lec: [5, 6], sec: "data",
    q: "What happens?",
    code: `String name = null;
if (Math.random() < 2) {
    System.out.println("checking");
}
System.out.println(name.length());`,
    out: { kind: "exception" },
    explain: "<code>Math.random()</code> is always below 2, so <code>checking</code> prints first, and then <code>name.length()</code> dereferences <code>null</code> and throws a <code>NullPointerException</code> at runtime. (Following where <code>name</code>’s value comes from is data-flow reasoning.)",
  },
]);
