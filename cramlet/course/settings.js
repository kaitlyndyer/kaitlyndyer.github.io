// Per-course settings: everything the shared pages say or do that depends on the subject.
// A course sets what it needs in STUDY.settings (in its data/course.js). Anything it leaves out falls back to
// DEFAULTS below, which are worded to fit any course, so a new course works before it sets anything.
//   CRAMLET.settings(S) → the merged settings for course S
//
// What a course can set (all optional):
//   exam.lengths    { id: { name, minutes, mix: { <section id>: count } } }  the exam sizes on the start page
//   exam.sections   { <section id>: name }  renames a question section, e.g. { choice: "Concept checks" }
//   exam.mixed      the one-line description of the Mixed mode (default: the sections the bank actually has)
//   exam.intro      the exam page's description when it isn't inside the Test Kitchen
//   myths.line      the Myth or fact page's one-line description (a good place for two course examples)
//   cast.title      the heading over the example flip cards on the Cookie Sheet
//   cast.asCode     true when example names are code (class names), so they're shown in code font
//   pep.tips        the exam-day tips at the end of Crumb Run, Morning of
(function () {
    "use strict";

    const DEFAULTS = {
        exam: {
            lengths: {
                full: { name: "Full exam", minutes: 75, mix: { choice: 25 } },
                quick: { name: "Quick check", minutes: 0, mix: { choice: 10 } },
            },
            sections: {},
            mixed: null,
            intro: "A closed-book exam drawn fresh from {course}’s question bank. Notes, search, and hints are hidden until you submit. Most questions are graded automatically; for written answers you check your work against a model answer.",
        },
        myths: {
            line: "Rapid-fire statements built from the traps behind wrong answers. Decide fast, and every answer comes with the reason.",
        },
        cast: { title: "Examples from the course", asCode: false },
        pep: {
            tips: [
                "Read the whole question before you answer. Then check that your answer responds to what it actually asks.",
                "Stuck? Flag it, move on, and come back. Another question may jog your memory.",
                "Breathe out slowly before you start. Long exhales settle the jitters.",
            ],
        },
    };

    // Plain objects merge key by key; anything else (strings, arrays, lengths) is replaced whole.
    const isObj = v => v && typeof v === "object" && !Array.isArray(v);
    const merge = (base, over) => {
        if (!isObj(over)) return over === undefined ? base : over;
        const out = { ...base };
        Object.keys(over).forEach(k => { out[k] = k === "lengths" ? over[k] : merge(base[k], over[k]); });
        return out;
    };

    const cache = new WeakMap();
    function settings(S) {
        if (!cache.has(S)) cache.set(S, merge(DEFAULTS, S.settings || {}));
        return cache.get(S);
    }

    window.CRAMLET = Object.assign(window.CRAMLET || {}, { settings });
})();
