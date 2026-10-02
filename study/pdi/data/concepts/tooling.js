registerConcept({
  id: "tooling",
  oneLiner:
    "<code>javac</code> compiles your code to bytecode, <code>java</code> runs it on the JVM, <b>JUnit</b> tests it, <b>Javadoc</b> documents it, and <b>Gradle</b> builds the whole project.",

  related: ["exceptions", "paradigms", "inheritance"],

  summary: {
    keyPoints: [
      { lec: [2], html: "Java runs in two steps: <code>javac</code> compiles <code>.java</code> files to <b>bytecode</b> (<code>.class</code>), and <code>java</code> interprets that bytecode on the <b>JVM</b>." },
      { lec: [2], html: "Bytecode is platform-independent: <b>“write once, run anywhere.”</b> Java is both <b>compiled and interpreted</b>." },
      { lec: [2], html: "<b>JDK</b> = tools to <i>write</i> programs (<code>javac</code>, <code>javap</code>, <code>javadoc</code>). <b>JRE</b> = what you need to <i>run</i> them." },
      { lec: [2], html: "The <b>classpath</b> tells the compiler where all used classes and libraries (jar files) live. IDEs manage it for you." },
      { lec: [2], html: "<b>JUnit</b> is Java’s <code>pytest</code>: <code>@Test</code>, <code>@BeforeEach</code>, <code>assertEquals</code>/<code>assertTrue</code>/<code>assertFalse</code>." },
      { lec: [2], html: "<b>Gradle</b> manages dependencies, tasks (build, run, test, style checks), and where outputs go. Run tasks with <code>./gradlew</code>." },
    ],
    compare: {
      head: ["", "Compilation", "Interpretation"],
      rows: [
        ["How", "Process the whole program first, then run it", "Translate and execute one chunk at a time"],
        ["Strength", "Sees full context, so more optimization", "Faster to start"],
        ["Weakness", "Slower to start", "Less context awareness"],
        ["Example", "C++", "Python"],
      ],
    },
  },

  details: [
    {
      id: "two-steps",
      title: "From source code to machine instructions",
      lec: [2],
      html: `
        <p>All high-level code must eventually become low-level CPU instructions. Java does this in <b>two steps</b>:</p>
        <ol>
          <li><code>javac</code> compiles <code>.java</code> files into <b>bytecode</b> (<code>.class</code> files). Bytecode is a set of instructions for a fictitious machine, the <b>Java Virtual Machine (JVM)</b>, and it’s platform-independent. Inspect it with <code>javap -c Fan.class</code>.</li>
          <li><code>java</code> interprets the bytecode chunk by chunk. Think of <code>java</code> as <i>simulating</i> the JVM.</li>
        </ol>
        <p>Result: <b>“write once, run anywhere.”</b> Compile on one platform and run the <code>.class</code> files anywhere. Other bytecode languages include Kotlin, Scala, Clojure, and Groovy.</p>
        <p>Python is interpreted, C++ is compiled, and Java is <b>both</b>.</p>`,
    },
    {
      id: "ecosystem",
      title: "The Java ecosystem: JDK, JRE, classpath",
      lec: [2],
      html: `
        <ul>
          <li>Java code relies on a vast ecosystem of classes and frameworks, packaged as <b>jar files</b> stored in <b>Maven repositories</b>.</li>
          <li>“Installing Java” means two things: the <b>JDK</b> (Java Development Kit) for writing programs, including <code>javac</code> and <code>javap</code>, and the <b>JRE</b> (Java Runtime Environment) for running them, usually preinstalled.</li>
          <li>Multiple JDK/JRE versions can coexist; one is chosen as the default.</li>
          <li>The <b>classpath</b> is a sequence of folder paths telling the compiler where your libraries live. IDEs handle it automatically; without one, you configure it yourself, especially for external libraries.</li>
        </ul>`,
    },
    {
      id: "main",
      title: "The main method",
      lec: [1],
      html: `
        <p>Java requires a formal entry point: <code>public static void main(String[] args)</code>. Python runs top-level statements directly, with no <code>main</code> required. And in Java, <b>every method lives inside a class or interface</b>.</p>`,
    },
    {
      id: "junit",
      title: "Unit tests with JUnit",
      lec: [2],
      html: `
        <ul>
          <li><b>JUnit</b> is Java’s equivalent of Python’s <code>pytest</code>. It’s an <b>external library</b>, not bundled with the JDK.</li>
          <li><code>@Test</code> marks a test method.</li>
          <li><code>@BeforeEach</code> marks setup logic that runs <b>before every test</b>.</li>
          <li><code>assertEquals</code>, <code>assertTrue</code>, and <code>assertFalse</code> check actual vs. expected. For exceptions, see <code>assertThrows</code> in <b>Exceptions</b>.</li>
        </ul>`,
    },
    {
      id: "javadoc",
      title: "Documentation with Javadoc",
      lec: [2],
      html: `
        <p><code>javadoc</code> is a JDK tool that turns code comments into HTML documentation. A Javadoc comment starts with <code>/**</code> and ends with <code>*/</code>, and supports tags like <code>@param</code>, <code>@return</code>, and <code>@throws</code>. Writing good ones is covered in <b>Writing Specifications</b>.</p>`,
    },
    {
      id: "gradle",
      title: "Building at scale with Gradle",
      lec: [2],
      html: `
        <p><b>Building</b> means converting all source files into an executable form. A build system must:</p>
        <ol>
          <li>Identify dependencies (libraries and their versions).</li>
          <li>Download and wire those dependencies into the build.</li>
          <li>Support tasks: build, run, test, style checks, and more.</li>
          <li>Specify where build artifacts (bytecode, jars, docs) are stored.</li>
        </ol>
        <p>This course uses <b>Gradle</b>:</p>
        <ul>
          <li><code>settings.gradle</code>: root folder config. Auto-generated and rarely changes.</li>
          <li><code>build.gradle</code>: the main config, with JDK version, dependencies, JUnit version, and entry point. Changes often.</li>
          <li><code>src/main/java</code>: the sources root, for all Java source files.</li>
          <li>A separate <b>test sources root</b> keeps tests apart from code. The slide lists <code>src/main/test</code>; 💡 Gradle’s standard default is <code>src/test/java</code>, so check your project template.</li>
          <li><code>gradlew</code>: the script that runs Gradle tasks, like <code>./gradlew run</code>.</li>
        </ul>`,
    },
  ],

  code: [
    {
      title: "Compile, inspect, run",
      lec: [2],
      code: `> javac DeviceMain.java     // compile: .java -> .class bytecode
> javap -c Fan.class         // peek at the bytecode
> java DeviceMain            // run on the JVM`,
    },
    {
      title: "A JUnit test class",
      lec: [2],
      code: `public class DeviceTest {
    private IoTDevice livingRoomLight, fan;

    @BeforeEach
    public void setup() {
        livingRoomLight = new Light("livingRoomLight", 100);
        fan = new Fan("fan", 50);
    }

    @Test
    public void testTurnOn() {
        livingRoomLight.turnOn();
        assertTrue(livingRoomLight.isOn());
    }
}`,
    },
    {
      title: "A Javadoc comment",
      lec: [2],
      code: `/**
 * Sets this light's brightness.
 * @param value the new brightness, from MIN_BRIGHTNESS to MAX_BRIGHTNESS
 * @throws IllegalArgumentException if value is out of range
 */
public void setBrightness(int value) { ... }`,
    },
    {
      title: "Running Gradle tasks",
      lec: [2],
      code: `> ./gradlew build    // compile everything
> ./gradlew test     // run the JUnit tests
> ./gradlew run      // run the program`,
    },
  ],

  flashcards: [
    { front: "<code>javac</code>", back: "The compiler: turns <code>.java</code> source into <code>.class</code> bytecode." },
    { front: "Bytecode", back: "Platform-independent instructions for the Java Virtual Machine." },
    { front: "JVM", back: "The Java Virtual Machine: a fictitious machine that <code>java</code> simulates to run bytecode." },
    { front: "JDK vs. JRE", back: "JDK = development tools (<code>javac</code>, <code>javap</code>, <code>javadoc</code>). JRE = what you need to run Java." },
    { front: "Classpath", back: "The list of folder paths where the compiler finds the classes and libraries you use." },
    { front: "<code>@BeforeEach</code>", back: "JUnit setup method that runs before <b>every</b> test." },
    { front: "<code>build.gradle</code>", back: "Gradle’s main config: JDK version, dependencies, JUnit version, entry point." },
    { front: "Is Java compiled or interpreted?", back: "<b>Both</b>: <code>javac</code> compiles to bytecode, then <code>java</code> interprets it." },
  ],

  quiz: [
    {
      type: "mc", lec: [2],
      q: "What does <code>javac DeviceMain.java</code> produce?",
      options: ["Machine code for your CPU", "Bytecode in a <code>.class</code> file", "A jar file", "An HTML page"],
      answer: 1,
      explain: "<code>javac</code> compiles to platform-independent bytecode, which <code>java</code> then runs on the JVM.",
    },
    {
      type: "mc", lec: [2],
      q: "Why can the same <code>.class</code> file run on Windows, macOS, and Linux?",
      options: ["Each OS has a different javac", "Bytecode is platform-independent and runs on any JVM", "Java recompiles itself every time", "It can’t"],
      answer: 1,
      explain: "That’s “write once, run anywhere.”",
    },
    {
      type: "mc", lec: [2],
      q: "Which Gradle file changes most often as a project grows?",
      options: ["<code>settings.gradle</code>", "<code>build.gradle</code>", "<code>gradlew</code>", "<code>.class</code> files"],
      answer: 1,
      explain: "<code>build.gradle</code> holds dependencies, versions, and the entry point. <code>settings.gradle</code> rarely changes.",
    },
    {
      type: "mc", lec: [2],
      q: "Which JUnit annotation runs setup code before <b>each</b> test?",
      options: ["<code>@Test</code>", "<code>@BeforeEach</code>", "<code>@Override</code>", "<code>@Setup</code>"],
      answer: 1,
      explain: "<code>@BeforeEach</code> runs before every test method, so each test starts fresh.",
    },
    {
      type: "tf", lec: [2],
      q: "True or false: JUnit comes bundled with the JDK.",
      answer: false,
      explain: "JUnit is an external library. A build system like Gradle downloads and wires it in.",
    },
    {
      type: "mc", lec: [1],
      q: "What does Java require that Python doesn’t?",
      options: ["Indentation", "A formal entry point: <code>public static void main(String[] args)</code>", "Comments", "A file extension"],
      answer: 1,
      explain: "Python runs top-level statements directly. Java starts at <code>main</code>, and every method must live in a class or interface.",
    },
  ],
});
