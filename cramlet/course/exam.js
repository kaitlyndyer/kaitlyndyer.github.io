// cramlet exam mode, shared by every course: a closed-book practice exam drawn from the course's question bank.
//
// The bank is every concept's quiz questions plus extra exam questions registered with
//   registerExam(conceptId, [question, ...])     (files in <course>/data/exam/)
// Each question has a type, the lectures it covers (lec), and optionally the Details section that teaches it (sec):
//   mc     { q, options, answer, explain, code? }                 multiple choice (1 pt)
//   tf     { q, answer: true|false, explain }                      true/false (1 pt)
//   multi  { q, options, answers: [i, ...], explain }              select all that apply (2 pts)
//   bug    { q, lines, answer, explain }                           click the broken line (1 pt, or 2 with fixes)
//          + fixes: [..], fix: i                                   …then pick the right fix
//   trace  { q, code, out: { kind: "output"|"compile"|"exception", text }, explain }   exact output (2 pts)
//   fill   { q, code with [[1]], [[2]], …, blanks: [[accepted, …], …], explain }      fill in the blanks (1 pt each)
//   parsons{ q, lines: [code in order], groups?, distractors: [{ code, why }], explain } build the code (3 pts)
//   design { q, options, answer, model, explain }                  pick (1 pt) + justification you check yourself (1 pt)
//   write  { q, starter?, rubric: [{ text, re? }], model, explain } write code; the rubric is partly checked automatically
//
// Modes: "mixed" uses every type above; "mc" (multiple choice only) uses mc + design questions, all 1 point,
// with no written justification. Answer options are shuffled per exam (E.perm), but answers are stored and
// graded by the question's original option index, so shuffling never changes grading.
//
// Missed deck: every exam or concept-quiz question you miss (or only guessed) goes in the deck, and it
// leaves once you answer it right in DECK_WINS different sessions in a row.
//
// Everything is saved in this browser: the exam in progress (so a refresh can't lose it), past results, and seen questions.
(function () {
    "use strict";

    const SECTIONS = [
        { id: "choice", name: "Multiple choice", types: ["mc", "tf", "multi"] },
        { id: "trace", name: "Trace the code", types: ["trace"] },
        { id: "bug", name: "Spot the bug", types: ["bug"] },
        { id: "fill", name: "Fill in the blanks", types: ["fill"] },
        { id: "parsons", name: "Build the code", types: ["parsons"] },
        { id: "design", name: "Design decisions", types: ["design"] },
        { id: "write", name: "Write the code", types: ["write"] },
    ];
    const sectionOf = type => SECTIONS.find(s => s.types.includes(type));
    const LENGTHS = {
        full: { name: "Full exam", minutes: 120, mix: { choice: 9, trace: 7, bug: 4, fill: 4, parsons: 4, design: 3, write: 4 } },
        sim: { name: "Exam length", minutes: 60, mix: { choice: 12, trace: 4, bug: 2, fill: 2, parsons: 1, design: 3, write: 1 } },
        half: { name: "Half exam", minutes: 60, hidden: true, mix: { choice: 5, trace: 4, bug: 2, fill: 2, parsons: 2, design: 1, write: 2 } },
        quick: { name: "Quick check", minutes: 0, mix: { choice: 4, trace: 2, bug: 1, fill: 1, parsons: 1, design: 1, write: 0 } },
        deck: { name: "Missed deck", minutes: 0, mix: {}, hidden: true },
    };
    const countOf = L => Object.values(L.mix).reduce((a, b) => a + b, 0);
    const MC_TYPES = ["mc", "design"]; // the "multiple choice only" pool: one right answer out of a few options
    const DECK_WINS = 2;               // right answers, in different sessions, needed to leave the missed deck
    const stripTags = t => String(t || "").replace(/<[^>]+>/g, "");
    // Options that refer to other options ("all of the above", "both A and B") must keep their order.
    const fixedOrder = list => (list || []).some(o => /\b(all|none) of the above\b|\b(both|either|neither) [A-D] (and|or|nor) [A-D]\b|^\s*[A-D] and [A-D]\b/i.test(stripTags(o)));
    function makePerms(qs) {
        const perm = {};
        qs.forEach(q => {
            if (q.options && ["mc", "design", "multi"].includes(q.type) && !fixedOrder(q.options)) perm[q.id] = shuffle(q.options.map((_, k) => k));
            if (q.fixes && !fixedOrder(q.fixes)) perm[q.id + "#fix"] = shuffle(q.fixes.map((_, k) => k));
        });
        return perm;
    }

    const bank = {}; // conceptId → extra exam questions
    let awayKey = null;
    window.registerExam = (conceptId, questions) => { (bank[conceptId] = bank[conceptId] || []).push(...questions); };

    const read = (k, fallback) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? fallback : v; } catch (e) { return fallback; } };
    const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
    const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);

    function pointsOf(q, mode) {
        if (mode === "mc" && MC_TYPES.includes(q.type)) return 1;
        return { mc: 1, tf: 1, multi: 2, bug: q.fixes ? 2 : 1, trace: 2, fill: (q.blanks || []).length, parsons: 3, design: 2, write: (q.rubric || []).length }[q.type] || 1;
    }

    // ---------- Grading ----------
    const normLines = t => String(t || "").replace(/\r/g, "").split("\n").map(l => l.replace(/\s+$/, "")).join("\n").replace(/^\n+|\n+$/g, "");
    const squash = t => String(t || "").replace(/\s+/g, "");

    function parsonsGrade(q, ids) {
        const n = q.lines.length, slots = [];
        for (let i = 0; i < n;) {
            const g = (q.groups || []).find(g => g[0] === i), hi = g ? g[1] : i;
            slots.push(Array.from({ length: hi - i + 1 }, (_, k) => "s" + (i + k)));
            i = hi + 1;
        }
        const marks = ids.map(id => (id[0] === "d" ? "bad" : "place"));
        let pos = 0;
        // Lines with identical text (like two "}") are interchangeable.
        const text = id => (id && id[0] === "s" ? q.lines[+id.slice(1)] : null);
        slots.forEach(slot => { slot.forEach((_, t) => { const id = ids[pos + t]; if (id && (slot.includes(id) || slot.some(s => text(s) === text(id)))) marks[pos + t] = "ok"; }); pos += slot.length; });
        const ok = marks.filter(m => m === "ok").length, bad = marks.filter(m => m === "bad").length;
        return { marks, frac: Math.max(0, (ok - bad) / n), perfect: ok === n && ids.length === n };
    }

    // Returns { earned, max, auto: true|false, detail }
    function grade(q, a, self, mode) {
        const max = pointsOf(q, mode);
        a = a || {};
        switch (q.type) {
            case "mc": return { earned: a.pick === q.answer ? 1 : 0, max };
            case "tf": return { earned: a.pick === (q.answer ? 0 : 1) ? 1 : 0, max };
            case "multi": {
                const picks = a.picks || [], right = picks.filter(i => q.answers.includes(i)).length, wrong = picks.length - right;
                return { earned: Math.round(Math.max(0, (right - wrong) / q.answers.length) * max * 2) / 2, max };
            }
            case "bug": return { earned: (a.line === q.answer ? 1 : 0) + (q.fixes && a.fix === q.fix ? 1 : 0), max };
            case "trace": {
                const kindOk = (a.kind || "output") === q.out.kind;
                const textOk = q.out.kind !== "output" || normLines(a.text) === normLines(q.out.text) || (q.out.alt || []).some(x => normLines(a.text) === normLines(x));
                return { earned: kindOk && textOk ? 2 : 0, max };
            }
            case "fill": {
                const got = (q.blanks || []).map((acc, i) => acc.some(x => squash(x) === squash((a.blanks || [])[i]))).filter(Boolean).length;
                return { earned: got, max };
            }
            case "parsons": { const g = parsonsGrade(q, a.order || []); return { earned: Math.round(g.frac * max * 2) / 2, max, detail: g }; }
            case "design":
                if (mode === "mc") return { earned: a.pick === q.answer ? 1 : 0, max };
                return { earned: (a.pick === q.answer ? 1 : 0) + (self && self.reason ? 1 : 0), max, needsSelf: true };
            case "write": {
                const checks = (q.rubric || []).map((r, i) => (self && self.items && i in self.items ? !!self.items[i] : autoFound(r, a.code)));
                return { earned: checks.filter(Boolean).length, max, needsSelf: true, checks };
            }
            default: return { earned: 0, max };
        }
    }
    // Does the code obviously contain what this rubric item looks for? (Only items with a pattern can be found automatically.)
    function autoFound(item, code) {
        if (!item.re || !code) return false;
        try { return new RegExp(item.re, item.flags || "m").test(code); } catch (e) { return false; }
    }

    const clockText = ms => { ms = Math.max(0, ms); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${h ? h + ":" : ""}${String(m).padStart(h ? 2 : 1, "0")}:${String(s).padStart(2, "0")}`; };

    // ---------- Missed deck ----------
    const deckKey = course => `cramlet.exam.${course}.missed`;
    function readDeck(course) {
        const d = read(deckKey(course), null);
        if (d) return d;
        // First run: start from the old mistake log.
        const old = read(`cramlet.exam.${course}.mistakes`, {}), out = {};
        Object.entries(old).forEach(([id, m]) => { out[id] = { at: m.at || Date.now(), concept: m.concept, wins: [] }; });
        return out;
    }
    // ok = answered fully right (and not just guessed). session = which sitting this was, e.g. "exam:<time>".
    function recordAnswer(course, id, ok, session, concept) {
        const d = readDeck(course);
        if (!ok) d[id] = { at: Date.now(), concept: concept || (d[id] || {}).concept, wins: [], misses: ((d[id] || {}).misses || 0) + 1 };
        else if (d[id]) {
            const wins = d[id].wins || [];
            if (!wins.includes(session)) wins.push(session);
            d[id].wins = wins;
            if (wins.length >= DECK_WINS) delete d[id];
        }
        write(deckKey(course), d);
    }
    const deckCount = course => Object.keys(readDeck(course)).length;

    // ---------- The exam page ----------
    function render(main, ctx, parts) {
        const { S, COURSE, esc, icon, codeBlock, highlight, conceptById, allConcepts } = ctx;
        const KEY = `cramlet.exam.${COURSE}`;
        const lectures = Object.keys(S.lectures).map(Number);

        // What a question shows above its answer area: an automaton diagram (ToC) and/or a code block.
        const machineOf = q => (q.machine && CRAMLET.automata ? `<div class="quiz-machine">${CRAMLET.automata.render(q.machine)}</div>` : "");
        const media = q => machineOf(q) + (q.code ? codeBlock(q.code) : "");

        function poolFor(lecs) {
            const pool = [];
            allConcepts.forEach(c => {
                const d = S.content[c.id];
                if (!d) return;
                (d.quiz || []).forEach(q => pool.push({ ...q, concept: c.id, lec: q.lec || c.lectures, id: `${c.id}/quiz/${CRAMLET.progress.idFor(q.q + (q.code || "") + (q.lines || []).join(""))}` }));
                (bank[c.id] || []).forEach(q => pool.push({ ...q, concept: c.id, lec: q.lec || c.lectures, id: `${c.id}/${q.id}` }));
            });
            return pool.filter(q => q.lec.some(l => lecs.includes(l)));
        }

        // Pick questions for each section, spreading them across concepts and preferring ones not seen recently.
        function build(lengthId, lecs, mode) {
            const L = LENGTHS[lengthId], pool = poolFor(lecs), seen = read(`${KEY}.seen`, {});
            const used = new Set(), perConcept = {};
            const out = [];
            // Multiple choice only: one pool, spread across concepts, then in lecture order like a real exam.
            if (mode === "mc") {
                const cands = shuffle(pool.filter(q => MC_TYPES.includes(q.type)));
                const want = countOf(L);
                while (out.length < want && cands.length) {
                    cands.sort((x, y) => ((perConcept[x.concept] || 0) - (perConcept[y.concept] || 0)) || ((seen[x.id] || 0) - (seen[y.id] || 0)));
                    const q = cands.shift();
                    out.push(q); perConcept[q.concept] = (perConcept[q.concept] || 0) + 1;
                }
                const order = allConcepts.map(c => c.id);
                return out.sort((x, y) => (Math.min(...x.lec) - Math.min(...y.lec)) || (order.indexOf(x.concept) - order.indexOf(y.concept)));
            }
            let carry = 0;
            SECTIONS.forEach(sec => {
                let want = (L.mix[sec.id] || 0) + (sec.id === "choice" ? 0 : 0);
                const cands = shuffle(pool.filter(q => sec.types.includes(q.type) && !used.has(q.id)));
                const picked = [];
                while (picked.length < want && cands.length) {
                    cands.sort((x, y) => ((perConcept[x.concept] || 0) - (perConcept[y.concept] || 0)) || ((seen[x.id] || 0) - (seen[y.id] || 0)));
                    const q = cands.shift();
                    picked.push(q); used.add(q.id); perConcept[q.concept] = (perConcept[q.concept] || 0) + 1;
                }
                carry += want - picked.length;
                out.push(...picked);
            });
            // Not enough of some types yet: top up with more multiple choice.
            if (carry > 0) {
                const extra = shuffle(pool.filter(q => sectionOf(q.type).id === "choice" && !used.has(q.id)))
                    .sort((x, y) => (seen[x.id] || 0) - (seen[y.id] || 0)).slice(0, carry);
                const at = out.findIndex(q => sectionOf(q.type).id !== "choice");
                out.splice(at < 0 ? out.length : at, 0, ...extra);
            }
            return out;
        }

        const exam = () => read(`${KEY}.active`, null);
        const saveExam = e => write(`${KEY}.active`, e);
        const history = () => read(`${KEY}.history`, []);

        // ---------- Start screen ----------
        function drawStart() {
            document.body.classList.remove("exam-focus");
            const active = exam(), hist = history();
            const counts = lecs => { const p = poolFor(lecs); return SECTIONS.map(s => [s, p.filter(q => s.types.includes(q.type)).length]); };
            const prefs = read(`${KEY}.prefs`, {});
            const deckN = deckCount(COURSE);
            main.innerHTML = `
                <div class="exam-start">
                    <div class="exam-hero">
                        <div><h1>${icon("list-checks")} Practice exam</h1>
                        <p>A closed-book exam drawn fresh from ${esc(S.course.title)}’s question bank. Notes, search, and hints are hidden until you submit. Most questions are graded automatically; for written code and design answers you check your work against a model answer.</p></div>
                    </div>
                    ${active ? `<div class="callout key done exam-resume">${icon("hourglass-medium", "callout-ic")}<div class="callout-body"><span class="callout-label">Exam in progress</span>You have an unfinished ${(() => {
                        const paused = active.pausedAt ? (active.deadline ? `paused with ${clockText(active.deadline - active.pausedAt)} left` : "paused") : "";
                        const bits = active.length === "deck" ? [paused] : [esc(LENGTHS[active.length].name), active.mode === "mc" ? "multiple choice" : "", paused];
                        const info = bits.filter(Boolean).join(", ");
                        return (active.length === "deck" ? "missed-deck retake" : "practice exam") + (info ? ` (${info})` : "");
                    })()}. <button type="button" class="btn primary small" data-act="resume">Continue it</button> <button type="button" class="btn ghost small" data-act="discard">Throw it away</button></div></div>` : ""}
                    <div class="exam-setup">
                        <div class="side-box"><div class="side-title">Length</div>
                            <div class="exam-lengths">${Object.entries(LENGTHS).filter(([, L]) => !L.hidden).map(([id, L], i) => {
                                const on = prefs.length && !(LENGTHS[prefs.length] || {}).hidden ? prefs.length === id : i === 0;
                                return `<label class="exam-len"><input type="radio" name="exam-len" value="${id}" ${on ? "checked" : ""}><span><b>${L.name}</b><small>${countOf(L)} questions · ${L.minutes ? `${L.minutes} minutes` : "no timer"}</small></span></label>`;
                            }).join("")}</div>
                            <div class="side-title exam-types-title">Question types</div>
                            <div class="exam-lengths">
                                <label class="exam-len"><input type="radio" name="exam-mode" value="mixed" ${prefs.mode !== "mc" ? "checked" : ""}><span><b>Mixed</b><small>Trace, find the bug, fill in, build, design, and write code</small></span></label>
                                <label class="exam-len"><input type="radio" name="exam-mode" value="mc" ${prefs.mode === "mc" ? "checked" : ""}><span><b>Multiple choice only</b><small>One answer from A–D, every question worth the same</small></span></label>
                            </div>
                        </div>
                        <div class="side-box"><div class="side-title">Lectures</div>
                            <div class="exam-lecs">${lectures.map(n => `<label class="exam-lec"><input type="checkbox" value="${n}" checked><span><b>L${n}</b> ${esc(S.lectures[n])}</span></label>`).join("")}</div>
                        </div>
                    </div>
                    <div class="exam-bank"></div>
                    <div class="build-actions"><button type="button" class="btn primary" data-act="start">${icon("hourglass-medium")} Start the exam</button>${deckN ? `<a class="btn" href="#/exam/missed">${icon("cards")} Missed deck · ${deckN}</a>` : ""}</div>
                    ${hist.length ? `<div class="side-box"><div class="side-title">Past exams</div><ol class="exam-hist">${hist.slice().reverse().map((h, i) => `<li><button type="button" class="hist-link" data-hist="${hist.length - 1 - i}"><b>${Math.round(h.pct)}%</b> ${esc(LENGTHS[h.length].name)}${h.mode === "mc" ? " · multiple choice" : ""} · ${new Date(h.at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</button></li>`).join("")}</ol></div>` : ""}
                </div>`;
            const selLecs = () => [...main.querySelectorAll(".exam-lec input:checked")].map(x => +x.value);
            const selMode = () => main.querySelector('[name="exam-mode"]:checked').value;
            const drawBank = () => {
                const lecs = selLecs();
                if (selMode() === "mc") {
                    const n = poolFor(lecs).filter(q => MC_TYPES.includes(q.type)).length, per = countOf(LENGTHS[main.querySelector('[name="exam-len"]:checked').value]);
                    main.querySelector(".exam-bank").innerHTML = `<p class="muted">${n} multiple-choice questions in the bank for these lectures${n >= per * 2 ? `, enough for about ${Math.floor(n / per)} exams without repeats` : ""}.</p>`;
                    return;
                }
                const c = counts(lecs), total = c.reduce((a, [, n]) => a + n, 0);
                main.querySelector(".exam-bank").innerHTML = `<p class="muted">${total} questions in the bank for these lectures: ${c.filter(([, n]) => n).map(([s, n]) => `${n} ${s.name.toLowerCase()}`).join(" · ")}.</p>`;
            };
            main.querySelectorAll(".exam-lec input, [name=exam-mode], [name=exam-len]").forEach(x => x.addEventListener("change", drawBank));
            drawBank();
            main.querySelector(".exam-start").addEventListener("click", e => {
                const t = e.target.closest("button");
                if (!t) return;
                if (t.dataset.act === "resume") location.hash = "#/exam/take";
                else if (t.dataset.act === "discard") { localStorage.removeItem(`${KEY}.active`); drawStart(); }
                else if (t.dataset.hist !== undefined) location.hash = `#/exam/results/${t.dataset.hist}`;
                else if (t.dataset.act === "start") {
                    const lecs = selLecs();
                    if (!lecs.length) return;
                    const length = main.querySelector('[name="exam-len"]:checked').value, mode = selMode();
                    write(`${KEY}.prefs`, { length, mode });
                    const qs = build(length, lecs, mode);
                    const L = LENGTHS[length];
                    saveExam({ length, mode, lecs, ids: qs.map(q => q.id), perm: makePerms(qs), answers: {}, flags: [], guess: [], t: {}, at: Date.now(), deadline: L.minutes ? Date.now() + L.minutes * 60000 : 0, away: 0, cur: 0 });
                    location.hash = "#/exam/take";
                }
            });
        }

        const byId = () => { const all = poolFor(lectures); return Object.fromEntries(all.map(q => [q.id, q])); };

        // ---------- Taking the exam ----------
        let timer = null;
        function drawTake() {
            let E = exam();
            if (!E) { location.hash = "#/exam"; return; }
            document.body.classList.add("exam-focus");
            const Q = byId(), qs = E.ids.map(id => Q[id]).filter(Boolean);
            const answered = i => { const a = E.answers[qs[i].id]; return !!a && Object.values(a).some(v => (Array.isArray(v) ? v.length : v !== "" && v !== undefined && v !== null)); };
            const mcMode = E.mode === "mc", plainMap = mcMode || E.length === "deck";
            const secName = q => (mcMode ? "Multiple choice" : sectionOf(q.type).name);
            // Time spent on each question (for the results page). Time away from the page isn't counted on resume.
            const leaveQ = X => { const id = qs[X.cur] && qs[X.cur].id; if (!id) return; X.t = X.t || {}; X.t[id] = (X.t[id] || 0) + Math.min(Date.now() - (X.tAt || Date.now()), 20 * 60000); X.tAt = Date.now(); };
            E.tAt = Date.now(); saveExam(E);

            main.innerHTML = `
                <div class="exam-take">
                    <div class="exam-bar">
                        <span class="exam-title">${icon(E.length === "deck" ? "cards" : "list-checks")} ${esc(LENGTHS[E.length].name)}${mcMode ? " · multiple choice" : ""}</span>
                        <span class="exam-pace" aria-live="off"></span>
                        <span class="exam-clock" aria-live="off"></span>
                        <button type="button" class="btn ghost small exam-pause-btn" data-act="pause" title="Pause the exam (the timer stops)">${icon("hourglass-medium")} Pause</button>
                        <button type="button" class="btn ghost small" data-act="exit" title="Save your answers and leave. Continue any time from the exam page.">Save &amp; exit</button>
                        <button type="button" class="btn primary small" data-act="review">Review &amp; submit</button>
                    </div>
                    <div class="exam-body">
                        <nav class="exam-map" aria-label="Questions"></nav>
                        <div class="exam-q"></div>
                    </div>
                </div>`;
            const $ = s => main.querySelector(s);

            function drawMap() {
                let html = "", last = null;
                qs.forEach((q, i) => {
                    const sec = sectionOf(q.type);
                    if (!plainMap && sec !== last) { html += `<div class="map-sec">${esc(sec.name)}</div>`; last = sec; }
                    html += `<button type="button" class="map-q${answered(i) ? " done" : ""}${E.flags.includes(i) ? " flag" : ""}${i === E.cur ? " cur" : ""}" data-go="${i}" aria-label="Question ${i + 1}">${i + 1}</button>`;
                });
                html += `<button type="button" class="map-review${E.review ? " cur" : ""}" data-act="review">${icon("list-checks")} Review</button>`;
                $(".exam-map").innerHTML = html;
            }
            function store(patch) {
                E = exam();
                const id = qs[E.cur].id;
                E.answers[id] = { ...(E.answers[id] || {}), ...patch };
                saveExam(E);
                drawMap();
            }

            // A one-line summary of an answer, for the review page.
            function brief(q, a = {}) {
                const cut = (t, n = 70) => { t = stripTags(t).replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n - 1) + "…" : t; };
                const letterOf = (k, key = q.id) => { const o = (E.perm || {})[key]; return "ABCDEFG"[o ? o.indexOf(k) : k]; };
                if (q.type === "mc" || q.type === "design") return a.pick === undefined ? "" : `<b>${letterOf(a.pick)}.</b> ${esc(cut(q.options[a.pick]))}${q.type === "design" && !mcMode ? (a.why ? " · reason written" : " · <i>no reason yet</i>") : ""}`;
                if (q.type === "tf") return a.pick === undefined ? "" : a.pick === 0 ? "True" : "False";
                if (q.type === "multi") return (a.picks || []).length ? a.picks.map(k => letterOf(k)).sort().join(", ") : "";
                if (q.type === "bug") return a.line === undefined ? "" : `Line ${a.line + 1}${q.fixes ? (a.fix === undefined ? " · <i>no fix picked</i>" : ` · fix ${letterOf(a.fix, q.id + "#fix")}`) : ""}`;
                if (q.type === "trace") return (a.kind || "output") === "output" ? (a.text ? `<code>${esc(cut(a.text.split("\n").join(" ⏎ "), 50))}</code>` : "") : a.kind === "compile" ? "Compile error" : "Runtime exception";
                if (q.type === "fill") return (a.blanks || []).some(Boolean) ? (a.blanks || []).map((b, k) => `<code>${esc(b || "—")}</code>`).join(" · ") : "";
                if (q.type === "parsons") return (a.order || []).length ? `${a.order.length} line${a.order.length > 1 ? "s" : ""} placed` : "";
                if (q.type === "write") { const n = (a.code || "").split("\n").filter(l => l.trim()).length; return n ? `${n} line${n > 1 ? "s" : ""} of code` : ""; }
                return "";
            }

            function drawReview() {
                const open = qs.filter((_, k) => !answered(k)).length;
                $(".exam-q").innerHTML = `
                    <div class="q-head"><span class="q-sec">Review</span><span class="q-num">${qs.length - open} of ${qs.length} answered${E.flags.length ? ` · ${E.flags.length} flagged` : ""}${(E.guess || []).length ? ` · ${E.guess.length} guessed` : ""}</span></div>
                    <h2 class="review-title">Review your answers</h2>
                    <p class="muted">Click any question to go back and change it. When you’re happy, submit the exam.</p>
                    <div class="review-list">${qs.map((q, k) => {
                        const b = brief(q, E.answers[q.id]);
                        const tags = (E.flags.includes(k) ? `<span class="tag in">${icon("push-pin")} flagged</span>` : "") + ((E.guess || []).includes(q.id) ? `<span class="tag in">${icon("shuffle")} guessed</span>` : "");
                        return `<button type="button" class="rev-row${answered(k) ? "" : " open"}" data-go="${k}">
                            <span class="rev-n">${k + 1}</span>
                            <span class="rev-main"><span class="rev-q">${esc(stripTags(q.q).replace(/\s+/g, " ").slice(0, 110))}${stripTags(q.q).length > 110 ? "…" : ""}</span>
                            <span class="rev-a">${b || `<span class="rev-none">Not answered</span>`}</span></span>
                            <span class="rev-tags">${tags}</span>
                        </button>`;
                    }).join("")}</div>
                    <div class="q-nav">
                        <button type="button" class="btn" data-go="${qs.length - 1}">← Back to questions</button>
                        <button type="button" class="btn primary" data-act="submit">${icon("check")} Submit exam</button>
                    </div>`;
                drawMap();
            }

            // Pausing freezes the timer: on resume the deadline moves later by however long you were away.
            function pause() {
                E = exam();
                if (!E.pausedAt) { if (!E.review) leaveQ(E); E.pausedAt = Date.now(); saveExam(E); }
            }
            function resume() {
                E = exam();
                if (E.pausedAt) {
                    if (E.deadline) E.deadline += Date.now() - E.pausedAt;
                    delete E.pausedAt; E.tAt = Date.now(); saveExam(E);
                }
                drawQ(); tick();
            }
            function drawPaused() {
                const open = qs.filter((_, k) => !answered(k)).length;
                $(".exam-q").innerHTML = `
                    <div class="exam-paused">
                        <div class="paused-ic">${icon("hourglass-medium")}</div>
                        <h2>Exam paused</h2>
                        <p>${E.deadline ? `The timer is stopped with <b>${clockText(E.deadline - E.pausedAt)}</b> left. ` : ""}${qs.length - open} of ${qs.length} questions answered. Your answers are saved, even if you close this page.</p>
                        <div class="build-actions"><button type="button" class="btn primary" data-act="resume">${icon("arrow-clockwise")} Resume</button><button type="button" class="btn" data-act="exit">Save &amp; exit</button></div>
                    </div>`;
                drawMap();
            }

            function drawQ() {
                if (E.pausedAt) return drawPaused();
                if (E.review) return drawReview();
                const i = E.cur, q = qs[i], a = E.answers[q.id] || {}, pts = pointsOf(q, E.mode);
                const head = `<div class="q-head"><span class="q-sec">${esc(secName(q))}</span><span class="q-num">Question ${i + 1} of ${qs.length} · ${pts} pt${pts > 1 ? "s" : ""}</span></div>`;
                let body = "";
                // attr: which answer field the buttons set (pick, toggle for select-all, fix for bug fixes)
                // Options appear in this exam's shuffled order, but each button still carries its original index.
                const opts = (list, attr = "pick") => {
                    const order = ((E.perm || {})[attr === "fix" ? q.id + "#fix" : q.id]) || list.map((_, k) => k);
                    return `<div class="options">${order.map((k, pos) => {
                        const o = list[k], on = attr === "toggle" ? (a.picks || []).includes(k) : a[attr] === k;
                        return `<button type="button" class="option${on ? " picked" : ""}" data-${attr}="${k}" aria-pressed="${on}"><span class="opt-letter">${attr === "toggle" ? (on ? "✓" : "") : "ABCDEFG"[pos]}</span><span>${o}</span></button>`;
                    }).join("")}</div>`;
                };
                if (q.type === "mc") body = media(q) + opts(q.options);
                else if (q.type === "tf") body = media(q) + opts(["True", "False"]);
                else if (q.type === "multi") body = media(q) + `<p class="muted">Select every correct answer.</p>` + opts(q.options, "toggle");
                else if (q.type === "bug") {
                    body = `<div class="bug-code" role="group" aria-label="Code lines">${q.lines.map((ln, k) => `<button type="button" class="bug-line${a.line === k ? " picked" : ""}" data-line="${k}"><span class="ln">${k + 1}</span><code>${highlight(ln) || "&nbsp;"}</code></button>`).join("")}</div>`;
                    if (q.fixes) body += `<p class="q-sub">Which change fixes it?</p>` + opts(q.fixes, "fix");
                } else if (q.type === "trace") {
                    body = codeBlock(q.code) + `
                        <div class="trace-kind" role="radiogroup" aria-label="What happens">
                            ${[["output", "It prints:"], ["compile", "Compile error"], ["exception", "Runtime exception"]].map(([k, t]) => `<label><input type="radio" name="tk" value="${k}" ${(a.kind || "output") === k ? "checked" : ""}> ${t}</label>`).join("")}
                        </div>
                        <textarea class="code-in" rows="5" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Exact output" placeholder="Type the exact output, one line per line." ${(a.kind || "output") !== "output" ? "disabled" : ""}>${esc(a.text || "")}</textarea>`;
                } else if (q.type === "fill") {
                    let n = 0;
                    const code = esc(q.code).replace(/\[\[(\d+)\]\]/g, (_, d) => { const k = +d - 1; n++; return `<input class="blank" data-blank="${k}" value="${esc((a.blanks || [])[k] || "")}" spellcheck="false" autocomplete="off" aria-label="Blank ${d}" size="${Math.max(6, ...(q.blanks[k] || [""]).map(x => x.length + 2))}">`; });
                    body = `<div class="codeblock fill"><pre><code>${code}</code></pre></div>`;
                } else if (q.type === "parsons") {
                    const all = [...q.lines.map((c, k) => ({ id: "s" + k, code: c })), ...(q.distractors || []).map((d, k) => ({ id: "d" + k, code: d.code }))];
                    const order = a.order || [];
                    const pool = (a.pool && a.pool.length + order.length === all.length ? a.pool : shuffle(all.map(x => x.id).filter(id => !order.includes(id))));
                    if (!a.pool) store({ pool });
                    const code = id => all.find(x => x.id === id).code;
                    body = `<div class="proof-cols">
                        <div class="side-box"><div class="side-title">Lines to choose from</div><div class="pool">${pool.map(id => `<button type="button" class="pstep code" data-take="${id}"><code>${esc(code(id))}</code></button>`).join("") || `<p class="muted">You’ve used every line.</p>`}</div></div>
                        <div class="side-box"><div class="side-title">Your code</div>${order.length ? `<ol class="mine">${order.map((id, k) => `<li><span class="mnum">${k + 1}</span><span class="mtext"><code class="pcode">${esc(code(id))}</code></span><span class="mctl"><button type="button" class="ctl small" data-up="${k}" ${k ? "" : "disabled"} aria-label="Move up">↑</button><button type="button" class="ctl small" data-down="${k}" ${k < order.length - 1 ? "" : "disabled"} aria-label="Move down">↓</button><button type="button" class="ctl small" data-out="${k}" aria-label="Remove">✕</button></span></li>`).join("")}</ol>` : `<p class="muted">Click lines on the left to build the code. Some lines don’t belong.</p>`}</div>
                    </div>`;
                } else if (q.type === "design") {
                    body = media(q) + opts(q.options) + (mcMode ? "" : `<label class="q-sub" for="why">Why? Justify your choice in one or two sentences.</label><textarea id="why" class="text-in" rows="3" data-why>${esc(a.why || "")}</textarea>`);
                } else if (q.type === "write") {
                    body = media(q) + `<textarea class="code-in big" rows="16" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Your code" placeholder="Write your code here. No autocomplete, just like on paper.">${esc(a.code !== undefined ? a.code : (q.starter || ""))}</textarea><p class="muted">Tab inserts four spaces.</p>`;
                }
                $(".exam-q").innerHTML = `
                    ${head}
                    <div class="question">${q.q}</div>${["bug", "trace", "fill", "parsons"].includes(q.type) ? machineOf(q) : ""}
                    ${body}
                    <div class="q-nav">
                        <button type="button" class="btn" data-act="prev" ${i ? "" : "disabled"}>← Previous</button>
                        <span class="q-marks">
                            <button type="button" class="btn ghost${E.flags.includes(i) ? " flagged" : ""}" data-act="flag">${icon("push-pin")} ${E.flags.includes(i) ? "Flagged" : "Flag for later"}</button>
                            <button type="button" class="btn ghost${(E.guess || []).includes(q.id) ? " flagged" : ""}" data-act="guess" title="A right guess still goes in your missed deck">${icon("shuffle")} ${(E.guess || []).includes(q.id) ? "Marked as a guess" : "I guessed"}</button>
                        </span>
                        <button type="button" class="btn primary" data-act="${i < qs.length - 1 ? "next" : "review"}">${i < qs.length - 1 ? "Next →" : "Review answers →"}</button>
                    </div>`;
                drawMap();
            }

            function tick() {
                const el = $(".exam-clock");
                if (!el) { clearInterval(timer); return; }
                const E2 = exam();
                if (!E2) { clearInterval(timer); return; }
                $(".exam-pause-btn") && ($(".exam-pause-btn").disabled = !!E2.pausedAt);
                if (E2.pausedAt) { el.textContent = E2.deadline ? `${clockText(E2.deadline - E2.pausedAt)} · paused` : "Paused"; el.classList.remove("low"); const pace = $(".exam-pace"); if (pace) pace.textContent = ""; return; }
                if (!E2.deadline) { const m = Math.floor((Date.now() - E2.at) / 60000); el.textContent = `${m} min so far`; return; }
                // Pace: where you'd be if every question took the same share of the time.
                const pace = $(".exam-pace");
                if (pace) {
                    const expected = Math.min(qs.length, Math.floor((Date.now() - E2.at) / ((E2.deadline - E2.at) / qs.length)));
                    const done = qs.filter((_, k) => answered(k)).length, behind = expected - done;
                    pace.textContent = behind > 0 ? `${behind} behind pace` : "On pace";
                    pace.classList.toggle("behind", behind > 1);
                }
                const left = Math.max(0, E2.deadline - Date.now());
                const h = Math.floor(left / 3600000), m = Math.floor(left / 60000) % 60, s = Math.floor(left / 1000) % 60;
                el.textContent = `${h ? h + ":" : ""}${String(m).padStart(h ? 2 : 1, "0")}:${String(s).padStart(2, "0")} left`;
                el.classList.toggle("low", left < 5 * 60000);
                if (!left) { clearInterval(timer); finish(true); }
            }

            function confirmSubmit() {
                const open = qs.filter((_, i) => !answered(i)).length, flagged = E.flags.length;
                $(".exam-q").insertAdjacentHTML("afterbegin", `<div class="callout warn done exam-confirm">${icon("warning", "callout-ic")}<div class="callout-body"><span class="callout-label">Submit the exam?</span>${open ? `${open} question${open > 1 ? "s are" : " is"} unanswered. ` : ""}${flagged ? `${flagged} ${flagged > 1 ? "are" : "is"} flagged. ` : ""}You can’t change answers after this.
                    <div class="build-actions"><button type="button" class="btn primary small" data-act="really">Yes, submit</button><button type="button" class="btn ghost small" data-act="cancel">Keep working</button></div></div></div>`);
            }
            function finish() { clearInterval(timer); E = exam(); if (!E.review) leaveQ(E); E.done = Date.now(); saveExam(E); location.hash = "#/exam/check"; }

            main.querySelector(".exam-take").addEventListener("click", e => {
                const t = e.target.closest("button");
                if (!t) return;
                const d = t.dataset;
                E = exam();
                const q = qs[E.cur], a = E.answers[q.id] || {};
                if (d.act === "pause") { pause(); drawQ(); tick(); return; }
                if (d.act === "resume") { resume(); return; }
                if (d.act === "exit") { pause(); clearInterval(timer); location.hash = "#/exam"; return; }
                if (E.pausedAt) return;
                if (d.go !== undefined) { if (E.review) { E.review = false; E.tAt = Date.now(); } else leaveQ(E); E.cur = +d.go; saveExam(E); drawQ(); window.scrollTo(0, 0); }
                else if (d.act === "review") { if (!E.review) leaveQ(E); E.review = true; saveExam(E); drawQ(); window.scrollTo(0, 0); }
                else if (d.act === "prev") { leaveQ(E); E.cur--; saveExam(E); drawQ(); }
                else if (d.act === "next") { leaveQ(E); E.cur++; saveExam(E); drawQ(); }
                else if (d.act === "guess") { const g = E.guess || []; E.guess = g.includes(q.id) ? g.filter(x => x !== q.id) : [...g, q.id]; saveExam(E); drawQ(); }
                else if (d.act === "flag") { E.flags = E.flags.includes(E.cur) ? E.flags.filter(x => x !== E.cur) : [...E.flags, E.cur]; saveExam(E); drawQ(); }
                else if (d.act === "submit") { if (!main.querySelector(".exam-confirm")) { confirmSubmit(); window.scrollTo(0, 0); } }
                else if (d.act === "really") finish();
                else if (d.act === "cancel") main.querySelector(".exam-confirm").remove();
                else if (d.pick !== undefined) { store({ pick: +d.pick }); drawQ(); }
                else if (d.fix !== undefined) { store({ fix: +d.fix }); drawQ(); }
                else if (d.toggle !== undefined) { const k = +d.toggle, p = a.picks || []; store({ picks: p.includes(k) ? p.filter(x => x !== k) : [...p, k] }); drawQ(); }
                else if (d.line !== undefined) { store({ line: +d.line }); drawQ(); }
                else if (d.take !== undefined) { store({ order: [...(a.order || []), d.take], pool: (a.pool || []).filter(x => x !== d.take) }); drawQ(); }
                else if (d.out !== undefined) { const o = [...a.order], [id] = o.splice(+d.out, 1); store({ order: o, pool: [...(a.pool || []), id] }); drawQ(); }
                else if (d.up !== undefined || d.down !== undefined) { const o = [...a.order], k = +(d.up ?? d.down), j = d.up !== undefined ? k - 1 : k + 1; [o[k], o[j]] = [o[j], o[k]]; store({ order: o }); drawQ(); }
            });
            main.querySelector(".exam-take").addEventListener("input", e => {
                const t = e.target;
                if (t.matches(".blank")) { E = exam(); const b = [...((E.answers[qs[E.cur].id] || {}).blanks || [])]; b[+t.dataset.blank] = t.value; store({ blanks: b }); }
                else if (t.matches("[data-why]")) store({ why: t.value });
                else if (t.matches(".code-in.big")) store({ code: t.value });
                else if (t.matches(".code-in")) store({ text: t.value });
            });
            main.querySelector(".exam-take").addEventListener("change", e => { if (e.target.name === "tk") { store({ kind: e.target.value }); drawQ(); } });
            main.querySelector(".exam-take").addEventListener("keydown", e => {
                if (e.key === "Tab" && e.target.matches(".code-in")) {
                    e.preventDefault();
                    const t = e.target, s = t.selectionStart;
                    t.value = t.value.slice(0, s) + "    " + t.value.slice(t.selectionEnd);
                    t.selectionStart = t.selectionEnd = s + 4;
                    t.dispatchEvent(new Event("input", { bubbles: true }));
                }
            });
            drawQ();
            clearInterval(timer);
            timer = setInterval(tick, 1000);
            tick();
        }
        // Honor-system note: count how often the exam page was left (one listener per page, whatever we draw).
        if (!awayKey) {
            let leavingPage = false; // a refresh or closing the tab isn't "looking something up"
            window.addEventListener("beforeunload", () => { leavingPage = true; });
            document.addEventListener("visibilitychange", () => {
                if (leavingPage || !document.hidden || !location.hash.startsWith("#/exam/take")) return;
                const E = read(awayKey, null);
                if (E && !E.done && !E.pausedAt) { E.away = (E.away || 0) + 1; write(awayKey, E); }
            });
        }
        awayKey = `${KEY}.active`;

        // ---------- Check your written answers ----------
        function drawCheck() {
            document.body.classList.remove("exam-focus");
            const E = exam();
            if (!E) { location.hash = "#/exam"; return; }
            const Q = byId(), qs = E.ids.map(id => Q[id]).filter(Boolean);
            const toCheck = qs.map((q, i) => ({ q, i })).filter(({ q }) => q.type === "write" || (q.type === "design" && E.mode !== "mc"));
            E.self = E.self || {};
            if (!toCheck.length) return finalize();
            main.innerHTML = `
                <div class="exam-start">
                    <h1>${icon("check")} Check your written answers</h1>
                    <p>Everything else is graded automatically. For these, compare your answer with the model answer and tick what you really did. Items marked <span class="auto-tag">found</span> were spotted in your code automatically.</p>
                    ${toCheck.map(({ q, i }) => {
                        const a = E.answers[q.id] || {};
                        if (q.type === "design") return `
                            <section class="detail check-q" data-q="${esc(q.id)}">
                                <h3>Question ${i + 1} <span class="q-sec">Design decision</span></h3>
                                <div class="question">${q.q}</div>${media(q)}
                                <p><b>You picked:</b> ${a.pick === undefined ? "<i>nothing</i>" : q.options[a.pick]} ${a.pick === q.answer ? `<span class="tag ok">correct</span>` : `<span class="tag in">not the best choice</span>`}</p>
                                <p><b>Your reason:</b> ${a.why ? esc(a.why) : "<i>none</i>"}</p>
                                <div class="callout tip done">${icon("lightbulb", "callout-ic")}<div class="callout-body"><span class="callout-label">Model answer</span><b>${q.options[q.answer]}.</b> ${q.model}</div></div>
                                <label class="self-item"><input type="checkbox" data-reason="${esc(q.id)}" ${E.self[q.id] && E.self[q.id].reason ? "checked" : ""}> My reason makes the same main point as the model answer.</label>
                            </section>`;
                        const g = grade(q, a, E.self[q.id], E.mode);
                        return `
                            <section class="detail check-q" data-q="${esc(q.id)}">
                                <h3>Question ${i + 1} <span class="q-sec">Write the code</span></h3>
                                <div class="question">${q.q}</div>${media(q)}
                                <div class="side-by-side">
                                    <div><div class="side-title">Your code</div><div class="codeblock"><pre><code>${a.code ? esc(a.code) : "<i>(empty)</i>"}</code></pre></div></div>
                                    <div><div class="side-title">Model answer</div>${codeBlock(q.model)}</div>
                                </div>
                                <div class="side-title">Checklist</div>
                                ${q.rubric.map((r, k) => { const found = autoFound(r, a.code); return `<label class="self-item"><input type="checkbox" data-item="${esc(q.id)}" data-k="${k}" ${g.checks[k] ? "checked" : ""}> ${r.text} ${found ? `<span class="auto-tag">found</span>` : ""}</label>`; }).join("")}
                            </section>`;
                    }).join("")}
                    <div class="build-actions"><button type="button" class="btn primary" data-act="grade">${icon("check")} See my results</button></div>
                </div>`;
            main.querySelector(".exam-start").addEventListener("change", e => {
                const t = e.target, E2 = exam();
                E2.self = E2.self || {};
                if (t.dataset.reason) E2.self[t.dataset.reason] = { ...(E2.self[t.dataset.reason] || {}), reason: t.checked };
                if (t.dataset.item) { const s = E2.self[t.dataset.item] = E2.self[t.dataset.item] || { items: {} }; s.items = s.items || {}; s.items[t.dataset.k] = t.checked; }
                saveExam(E2);
            });
            main.querySelector('[data-act="grade"]').addEventListener("click", () => {
                const E2 = exam();
                E2.self = E2.self || {};
                // Record the checkbox state for every write question, including the ones left as they were.
                main.querySelectorAll("[data-item]").forEach(cb => { const s = E2.self[cb.dataset.item] = E2.self[cb.dataset.item] || { items: {} }; s.items = s.items || {}; s.items[cb.dataset.k] = cb.checked; });
                saveExam(E2);
                finalize();
            });
        }

        // ---------- Score it, save it, and show the results ----------
        function finalize() {
            const E = exam(), Q = byId(), qs = E.ids.map(id => Q[id]).filter(Boolean);
            const items = qs.map(q => {
                const g = grade(q, E.answers[q.id], (E.self || {})[q.id], E.mode);
                return { id: q.id, concept: q.concept, lec: q.lec, sec: q.sec || null, type: q.type, earned: g.earned, max: g.max, guessed: (E.guess || []).includes(q.id), ms: (E.t || {})[q.id] || 0 };
            });
            const earned = items.reduce((a, x) => a + x.earned, 0), max = items.reduce((a, x) => a + x.max, 0);
            const result = { at: E.at, done: E.done || Date.now(), length: E.length, mode: E.mode || "mixed", perm: E.perm || {}, lecs: E.lecs, away: E.away || 0, earned, max, pct: (earned / max) * 100, items, answers: E.answers, self: E.self || {} };
            const hist = history(); hist.push(result); write(`${KEY}.history`, hist.slice(-20));
            const seen = read(`${KEY}.seen`, {}); E.ids.forEach(id => { seen[id] = Date.now(); }); write(`${KEY}.seen`, seen);
            // Missed (or only guessed) questions go in the missed deck; right answers count toward leaving it.
            items.forEach(x => recordAnswer(COURSE, x.id, x.earned >= x.max && !x.guessed, `exam:${E.at}`, x.concept));
            localStorage.removeItem(`${KEY}.active`);
            if (CRAMLET.progress) CRAMLET.progress.award("quiz", `${COURSE}:exam:${E.at}`, {});
            location.hash = `#/exam/results/${hist.slice(-20).length - 1}`;
        }

        function drawResults(idx) {
            document.body.classList.remove("exam-focus");
            const hist = history(), R = hist[idx];
            if (!R) { location.hash = "#/exam"; return; }
            const prev = hist.slice(0, idx).reverse().find(h => h.length === R.length);
            const Q = byId();
            const group = key => {
                const m = {};
                R.items.forEach(x => [].concat(key(x)).forEach(k => { m[k] = m[k] || { earned: 0, max: 0, missed: [] }; m[k].earned += x.earned; m[k].max += x.max; if (x.earned < x.max) m[k].missed.push(x); }));
                return m;
            };
            const byLec = group(x => x.lec), byConcept = group(x => x.concept);
            const bar = (label, g, color) => { const p = g.max ? (g.earned / g.max) * 100 : 0; return `<div class="part"><span>${label}</span><div class="bar"><div style="width:${p}%;background:${color || "var(--brand)"}"></div></div><span class="num">${Math.round(p)}%</span></div>`; };
            const plan = Object.entries(byConcept).map(([cid, g]) => ({ c: conceptById[cid], g, lost: g.max - g.earned })).filter(x => x.lost > 0 && x.c).sort((a, b) => b.lost - a.lost);
            const secTitle = (cid, sec) => { const d = S.content[cid]; const s = d && (d.details || []).find(x => x.id === sec); return s ? s.title : null; };
            const letter = (q, k) => { const o = (R.perm || {})[q.id]; return "ABCDEFG"[o ? o.indexOf(k) : k] + ") "; };
            const yours = (q, a = {}) => {
                if (q.type === "mc" || q.type === "design") return a.pick === undefined ? "<i>no answer</i>" : letter(q, a.pick) + q.options[a.pick];
                if (q.type === "tf") return a.pick === undefined ? "<i>no answer</i>" : a.pick === 0 ? "True" : "False";
                if (q.type === "multi") return (a.picks || []).length ? a.picks.map(k => q.options[k]).join("; ") : "<i>no answer</i>";
                if (q.type === "bug") return a.line === undefined ? "<i>no answer</i>" : `line ${a.line + 1}${q.fixes ? `, fix: ${a.fix === undefined ? "<i>none</i>" : q.fixes[a.fix]}` : ""}`;
                if (q.type === "trace") return (a.kind || "output") === "output" ? `<pre class="mini">${esc(a.text || "") || "<i>(nothing)</i>"}</pre>` : a.kind === "compile" ? "Compile error" : "Runtime exception";
                if (q.type === "fill") return (a.blanks || []).map((b, k) => `${k + 1}: <code>${esc(b || "—")}</code>`).join(" · ") || "<i>no answer</i>";
                if (q.type === "parsons") {
                    // Your lines as code, colored by how they were graded, so you can compare with the model line by line.
                    const order = a.order || [];
                    if (!order.length) return "<i>no answer</i>";
                    const marks = parsonsGrade(q, order).marks;
                    const line = id => (id[0] === "s" ? { code: q.lines[+id.slice(1)] } : q.distractors[+id.slice(1)]);
                    return `<div class="parsons-scroll"><ol class="parsons-ans">${order.map((id, k) => {
                        const l = line(id), m = marks[k];
                        return `<li class="${m}" title="${m === "ok" ? "Right line, right place" : m === "place" ? "Right line, wrong place" : "This line doesn’t belong"}"><code>${esc(l.code)}</code>${m === "bad" && l.why ? `<span class="pwhy">${esc(l.why)}</span>` : ""}</li>`;
                    }).join("")}</ol></div>
                    <p class="parsons-key"><span class="k ok"></span>right place <span class="k place"></span>wrong place <span class="k bad"></span>doesn’t belong</p>`;
                }
                if (q.type === "write") return a.code ? `<pre class="mini">${esc(a.code)}</pre>` : "<i>(empty)</i>";
                return "";
            };
            const model = q => {
                if (q.type === "mc" || q.type === "design") return letter(q, q.answer) + q.options[q.answer];
                if (q.type === "tf") return q.answer ? "True" : "False";
                if (q.type === "multi") return q.answers.map(k => q.options[k]).join("; ");
                if (q.type === "bug") return `line ${q.answer + 1}: <code>${esc(q.lines[q.answer].trim())}</code>${q.fixes ? `. Fix: ${q.fixes[q.fix]}` : ""}`;
                if (q.type === "trace") return q.out.kind === "output" ? `<pre class="mini">${esc(q.out.text)}</pre>` : q.out.kind === "compile" ? "Compile error" : "Runtime exception";
                if (q.type === "fill") return q.blanks.map((b, k) => `${k + 1}: <code>${esc(b[0])}</code>`).join(" · ");
                if (q.type === "parsons") return codeBlock(q.lines.join("\n"));
                if (q.type === "write") return codeBlock(q.model);
                return "";
            };
            // Timing: on a timed exam each question's fair share is minutes ÷ questions; twice that is "slow".
            const L = LENGTHS[R.length] || {}, share = L.minutes ? (L.minutes * 60000) / R.items.length : 0;
            const mmss = ms => `${Math.floor(ms / 60000)}:${String(Math.round(ms / 1000) % 60).padStart(2, "0")}`;
            const slow = x => share && x.ms > share * 2;
            const timed = R.items.filter(x => x.ms), avg = timed.length ? timed.reduce((a, x) => a + x.ms, 0) / timed.length : 0;
            // The study buddy reacts to the score.
            const mood = R.pct >= 85 ? { face: "cheer", anim: "party", line: "examGreat" }
                : R.pct >= 70 ? { face: "happy", anim: "bounce", line: "examGood" }
                : R.pct >= 50 ? { face: "idle", anim: "bounce", line: "examOkay" }
                : { face: "oops", anim: "wobble", line: "examLow" };
            const qCard = (x, n) => {
                const q = Q[x.id];
                if (!q) return "";
                const a = R.answers[x.id] || {}, c = conceptById[x.concept];
                const full = x.earned >= x.max, none = x.earned === 0;
                return `<details class="res-q ${full ? "full" : none ? "zero" : "part-cred"}"${full ? "" : " open"}>
                    <summary><span class="res-n">${n}</span><span class="res-what"><b>${esc(c ? c.title : x.concept)}</b> · ${esc(R.mode === "mc" ? "Multiple choice" : sectionOf(q.type).name)}${x.guessed ? ` <span class="tag in">guessed</span>` : ""}${slow(x) ? ` <span class="tag in">slow</span>` : ""}</span>${x.ms ? `<span class="res-time">${mmss(x.ms)}</span>` : ""}<span class="res-pts">${x.earned}/${x.max}</span></summary>
                    <div class="question">${q.q}</div>
                    ${machineOf(q)}${q.code && q.type !== "fill" ? codeBlock(q.code) : ""}
                    ${q.type === "bug" ? `<div class="bug-code">${q.lines.map((ln, k) => `<div class="bug-line${k === q.answer ? " correct" : k === a.line ? " wrong" : ""}"><span class="ln">${k + 1}</span><code>${highlight(ln) || "&nbsp;"}</code></div>`).join("")}</div>` : ""}
                    <div class="res-ans"><div><div class="side-title">Your answer</div>${yours(q, a)}</div><div><div class="side-title">Model answer</div>${model(q)}</div></div>
                    ${q.explain ? `<div class="callout tip done">${icon("lightbulb", "callout-ic")}<div class="callout-body"><span class="callout-label">Why</span>${q.explain}</div></div>` : ""}
                    ${c ? `<a class="btn small" href="#/c/${c.id}/${q.sec ? `details/${q.sec}` : "summary"}">${icon("note")} Review ${esc(q.sec && secTitle(c.id, q.sec) ? secTitle(c.id, q.sec) : c.title)}</a>` : ""}
                </details>`;
            };
            main.innerHTML = `
                <div class="exam-results">
                    <div class="exam-hero res${CRAMLET.buddy ? " with-buddy" : ""}">
                        <div class="score-ring" style="--p:${Math.round(R.pct)}"><span>${Math.round(R.pct)}%</span></div>
                        <div><h1>${R.pct >= 85 ? "Great exam!" : R.pct >= 70 ? "Solid work." : "Good practice. Here’s what to review."}</h1>
                        <p>${R.earned} of ${R.max} points · ${esc(LENGTHS[R.length].name)}${R.mode === "mc" ? " · multiple choice" : ""} · ${Math.max(1, Math.round((R.done - R.at) / 60000))} minutes${prev ? ` · last time ${Math.round(prev.pct)}% (${R.pct >= prev.pct ? "+" : ""}${Math.round(R.pct - prev.pct)})` : ""}${R.away ? ` · you left the exam page ${R.away} time${R.away > 1 ? "s" : ""}` : ""}</p>
                        ${avg ? `<p class="muted">Average ${mmss(avg)} per question${share ? ` (the time limit allows ${mmss(share)})` : ""}${(() => { const g = R.items.filter(x => x.guessed).length; return g ? ` · ${g} marked as ${g > 1 ? "guesses, which go" : "a guess, which goes"} in your missed deck` : ""; })()}.</p>` : ""}
                        <div class="build-actions"><a class="btn primary" href="#/exam">${icon("arrow-clockwise")} Take another exam</a><a class="btn" href="#/exam/missed">${icon("cards")} Missed deck · ${deckCount(COURSE)}</a></div></div>
                        ${CRAMLET.buddy ? `<div class="res-buddy"><div class="end-buddy"></div><p class="buddy-say">${esc(CRAMLET.buddy.say(mood.line))}</p></div>` : ""}
                    </div>
                    <div class="run-side">
                        <div class="side-box"><div class="side-title">Score by lecture</div><div class="parts">${Object.keys(byLec).sort((a, b) => a - b).map(l => bar(`L${l}`, byLec[l])).join("")}</div></div>
                        <div class="side-box"><div class="side-title">Score by concept</div><div class="parts">${Object.entries(byConcept).sort((a, b) => a[1].earned / a[1].max - b[1].earned / b[1].max).map(([cid, g]) => bar(esc(conceptById[cid] ? conceptById[cid].title : cid), g, conceptById[cid] && conceptById[cid].color)).join("")}</div></div>
                    </div>
                    <section class="detail review-plan">
                        <h3>${icon("target")} What to review next</h3>
                        ${plan.length ? `<ol class="plan">${plan.slice(0, 5).map(({ c, g, lost }) => {
                            const secs = [...new Set(g.missed.map(x => x.sec).filter(Boolean))];
                            return `<li style="--c:${c.color}"><div class="plan-top"><span class="nav-icon">${icon(c.icon)}</span><b>${esc(c.title)}</b><span class="muted">lost ${lost} point${lost === 1 ? "" : "s"} · ${g.missed.length} question${g.missed.length > 1 ? "s" : ""} missed</span></div>
                                <div class="plan-links">${secs.length ? secs.map(s => secTitle(c.id, s) ? `<a class="related-chip" href="#/c/${c.id}/details/${s}">${icon("note")}${esc(secTitle(c.id, s))}</a>` : "").join("") : `<a class="related-chip" href="#/c/${c.id}/summary">${icon("note")}Summary</a>`}<a class="related-chip" href="#/c/${c.id}/practice">${icon("brain")}Practice</a></div></li>`;
                        }).join("")}</ol>` : `<p>You didn’t lose points anywhere. Try a full exam or another set of lectures.</p>`}
                    </section>
                    <h2 class="panel-title">Every question</h2>
                    <div class="res-list">${R.items.map((x, n) => qCard(x, n + 1)).join("")}</div>
                </div>`;
            if (CRAMLET.buddy) CRAMLET.buddy.react(main.querySelector(".res-buddy .end-buddy"), mood.face, mood.anim);
        }

        // ---------- Missed deck ----------
        function drawMissed() {
            document.body.classList.remove("exam-focus");
            const deck = readDeck(COURSE), Q = byId();
            const all = Object.entries(deck).map(([id, m]) => ({ id, ...m, q: Q[id] })).filter(x => x.q);
            const lecsIn = [...new Set(all.flatMap(x => x.q.lec))].filter(l => lectures.includes(l)).sort((x, y) => x - y);
            const pick = read(`${KEY}.deckLecs`, null);
            let chosen = (pick || lecsIn).filter(l => lecsIn.includes(l));
            if (!chosen.length) chosen = lecsIn;
            const draw = () => {
                const list = all.filter(x => x.q.lec.some(l => chosen.includes(l))).sort((x, y) => (Math.min(...x.q.lec) - Math.min(...y.q.lec)) || (x.at - y.at));
                const n = list.length;
                main.innerHTML = `
                    <div class="exam-start">
                        <div class="exam-hero"><div>
                            <h1>${icon("cards")} Missed deck</h1>
                            <p>Every question you’ve missed on a practice exam or a concept quiz, plus right answers you marked as guesses. Retakes come in a new shuffled order with shuffled options. A question leaves the deck after you get it right in <b>${DECK_WINS} different sessions</b> in a row; a miss starts it over.</p>
                        </div></div>
                        ${all.length ? `
                        <div class="build-actions">
                            ${n ? [10, 25].filter(k => k < n).map(k => `<button type="button" class="btn${k === 10 ? " primary" : ""}" data-redo="${k}">${icon("shuffle")} Retake ${k}</button>`).join("") + `<button type="button" class="btn${n <= 10 ? " primary" : ""}" data-redo="${n}">${icon("arrow-clockwise")} Retake all ${n}</button>` : `<span class="muted">No missed questions in these lectures.</span>`}
                            <a class="btn ghost" href="#/exam">Back to exams</a>
                        </div>
                        <div class="deck-filter"><span class="side-title">Lectures</span>${lecsIn.map(l => `<label class="deck-chip" title="${esc(S.lectures[l])}"><input type="checkbox" value="${l}" ${chosen.includes(l) ? "checked" : ""}><span>L${l} · ${all.filter(x => x.q.lec.includes(l)).length}</span></label>`).join("")}</div>
                        <ol class="mistakes">${list.map(x => {
                            const c = conceptById[x.concept || x.q.concept], wins = (x.wins || []).length;
                            return `<li style="--c:${c ? c.color : "var(--brand)"}"><span class="stripe"></span><span><b>${esc(c ? c.title : x.q.concept)}</b> · ${esc(sectionOf(x.q.type).name)} <span class="deck-dots" title="${wins} of ${DECK_WINS} sessions right">${Array.from({ length: DECK_WINS }, (_, k) => `<i class="${k < wins ? "on" : ""}"></i>`).join("")}</span><br><span class="muted">${esc(stripTags(x.q.q).slice(0, 140))}</span></span></li>`;
                        }).join("")}</ol>`
                        : `<p class="muted">Your deck is empty. Questions you miss on exams and concept quizzes will show up here.</p><a class="btn" href="#/exam">Back to exams</a>`}
                    </div>`;
                main.querySelectorAll(".deck-chip input").forEach(cb => cb.addEventListener("change", () => {
                    chosen = [...main.querySelectorAll(".deck-chip input:checked")].map(x => +x.value);
                    write(`${KEY}.deckLecs`, chosen);
                    draw();
                }));
                main.querySelectorAll("[data-redo]").forEach(btn => btn.addEventListener("click", () => {
                    const qs = shuffle(list).slice(0, +btn.dataset.redo).map(x => x.q);
                    saveExam({ length: "deck", mode: "mixed", lecs: chosen, ids: qs.map(q => q.id), perm: makePerms(qs), answers: {}, flags: [], guess: [], t: {}, at: Date.now(), deadline: 0, away: 0, cur: 0 });
                    location.hash = "#/exam/take";
                }));
            };
            draw();
        }

        if (parts[1] === "take") drawTake();
        else if (parts[1] === "check") drawCheck();
        else if (parts[1] === "results") drawResults(+parts[2]);
        else if (parts[1] === "missed" || parts[1] === "mistakes") drawMissed();
        else drawStart();
    }

    // Latest exam result for a course, for concept badges and the dashboard.
    function latest(course) {
        const h = read(`cramlet.exam.${course}.history`, []).filter(x => x.length !== "deck"); // retakes aren't a fair sample
        return h[h.length - 1] || null;
    }

    window.CRAMLET = Object.assign(window.CRAMLET || {}, { exam: { render, latest, SECTIONS, LENGTHS, grade, pointsOf, recordAnswer, deckCount } });
})();
