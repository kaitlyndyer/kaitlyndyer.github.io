// Exam questions for javac, JVM, Gradle & JUnit. See ../../../course/exam.js for the format.
registerExam("tooling", [
  {
    id: "mc-javac", type: "mc", lec: [2], sec: "two-steps",
    q: "What does <code>javac Fan.java</code> produce?",
    options: ["Machine code for your CPU", "Bytecode in <code>Fan.class</code>, which the JVM runs", "An HTML documentation page", "A Gradle build file"],
    answer: 1,
    explain: "<code>javac</code> compiles source into platform-independent <b>bytecode</b> (<code>.class</code> files); <code>java</code> then runs that bytecode on the JVM. That’s “write once, run anywhere.”",
  },
  {
    id: "mc-gradle", type: "mc", lec: [2], sec: "gradle",
    q: "Your project needs a new library. Which file do you edit to add the dependency?",
    options: ["<code>settings.gradle</code>", "<code>build.gradle</code>", "<code>gradlew</code>", "Any <code>.java</code> file"],
    answer: 1,
    explain: "<code>build.gradle</code> is the main config: JDK version, dependencies (including JUnit), and the entry point. <code>settings.gradle</code> is root-folder config that rarely changes.",
  },
  {
    id: "multi-junit", type: "multi", lec: [2], sec: "junit",
    q: "Which statements about JUnit (as used in lecture) are true?",
    options: ["<code>@Test</code> marks a test method", "<code>@BeforeEach</code> runs once before every test", "JUnit is bundled with the JDK", "<code>assertThrows</code> checks that code throws an exception"],
    answers: [0, 1, 3],
    explain: "JUnit is an <b>external library</b> (added through Gradle), not part of the JDK. The other three are how lecture uses it.",
  },
  {
    id: "fill-assert-throws", type: "fill", lec: [2], sec: "junit",
    q: "Fill in the blanks so this JUnit 5 test checks that a negative brightness is rejected.",
    code: `[[1]]
void rejectsNegativeBrightness() {
    [[2]](IllegalArgumentException.class,
        () [[3]] new Light("desk", -5));
}`,
    blanks: [["@Test"], ["assertThrows", "Assertions.assertThrows"], ["->"]],
    explain: "<code>@Test</code> marks the method. <code>assertThrows(Type.class, () -&gt; …)</code> runs the lambda and passes only if it throws that exception type.",
  },
  {
    id: "parsons-junit", type: "parsons", lec: [2], sec: "junit",
    q: "Build a JUnit test class that creates a fresh <code>Light</code> before each test and checks that <code>turnOn()</code> turns it on.",
    lines: [
      "class LightTest {",
      "    private Light light;",
      "    @BeforeEach",
      "    void setUp() {",
      "        light = new Light(\"desk\", 50);",
      "    }",
      "    @Test",
      "    void turnOnTurnsItOn() {",
      "        light.turnOn();",
      "        assertTrue(light.isOn());",
      "    }",
      "}",
    ],
    distractors: [
      { code: "    public static void main(String[] args) {", why: "JUnit finds and runs @Test methods itself; a test class doesn’t need main." },
      { code: "        assertEquals(light.isOn());", why: "assertEquals compares an expected and an actual value; to check a boolean, use assertTrue." },
    ],
    explain: "<code>@BeforeEach</code> gives every test a fresh object, so tests don’t affect each other. Each <code>@Test</code> does something, then asserts the result.",
  },
  {
    id: "write-junit", type: "write", lec: [2], sec: "junit",
    q: "Write a JUnit 5 test method that checks that <code>new Light(\"desk\", 150)</code> throws an <code>IllegalArgumentException</code> (brightness must be 0–100).",
    rubric: [
      { text: "Annotated with <code>@Test</code>", re: "@Test\\b" },
      { text: "A <code>void</code> method with no parameters", re: "void\\s+\\w+\\s*\\(\\s*\\)" },
      { text: "Uses <code>assertThrows(IllegalArgumentException.class, …)</code>", re: "assertThrows\\s*\\(\\s*IllegalArgumentException\\.class" },
      { text: "Passes a lambda <code>() -&gt; …</code> that builds the light", re: "\\(\\s*\\)\\s*->\\s*\\{?\\s*new\\s+Light\\s*\\(" },
      { text: "Uses an out-of-range brightness like 150", re: "new\\s+Light\\s*\\([^)]*,\\s*(10[1-9]|1[1-9]\\d|[2-9]\\d\\d|\\d{4,}|-\\s*\\d+)\\s*\\)" },
    ],
    model: `@Test
void rejectsBrightnessOver100() {
    assertThrows(IllegalArgumentException.class,
        () -> new Light("desk", 150));
}`,
    explain: "Put the code that should throw inside the lambda. If it doesn’t throw, or throws a different type, <code>assertThrows</code> fails the test.",
  },
]);
