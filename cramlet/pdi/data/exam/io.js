registerExam("io", [
  {
    id: "parsons-scanner", type: "parsons", lec: [3], sec: "twr",
    q: "Build a method body that prints every line of the file at <code>path</code>, closes the file automatically, and prints an error if the file doesn’t exist.",
    lines: [
      "try (Scanner sc = new Scanner(new File(path))) {",
      "    while (sc.hasNextLine()) {",
      "        System.out.println(sc.nextLine());",
      "    }",
      "} catch (FileNotFoundException e) {",
      "    System.err.println(\"No such file: \" + path);",
      "}",
    ],
    distractors: [
      { code: "Scanner sc = new Scanner(System.in);", why: "That reads from the keyboard, not the file." },
      { code: "    while (sc.nextLine() != null) {", why: "nextLine() throws at the end of input instead of returning null; use hasNextLine()." },
      { code: "} catch (NullPointerException e) {", why: "A missing file throws FileNotFoundException." },
    ],
    explain: "Try-with-resources (<code>try (… ) {</code>) closes the <code>Scanner</code> automatically, even if an exception happens. <code>hasNextLine()</code> checks before each <code>nextLine()</code>, and a missing file is a checked <code>FileNotFoundException</code>.",
  },
]);
