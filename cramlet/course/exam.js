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
        half: { name: "Half exam", minutes: 60, mix: { choice: 5, trace: 4, bug: 2, fill: 2, parsons: 2, design: 1, write: 2 } },
        quick: { name: "Quick check", minutes: 0, mix: { choice: 4, trace: 2, bug: 1, fill: 1, parsons: 1, design: 1, write: 0 } },
    };

    const bank = {}; // conceptId → extra exam questions
    let awayKey = null;
    window.registerExam = (conceptId, questions) => { (bank[conceptId] = bank[conceptId] || []).push(...questions); };

    const read = (k, fallback) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? fallback : v; } catch (e) { return fallback; } };
    const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
    const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);

    function pointsOf(q) {
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
        slots.forEach(slot => { slot.forEach((_, t) => { const id = ids[pos + t]; if (id && slot.includes(id)) marks[pos + t] = "ok"; }); pos += slot.length; });
        const ok = marks.filter(m => m === "ok").length, bad = marks.filter(m => m === "bad").length;
        return { marks, frac: Math.max(0, (ok - bad) / n), perfect: ok === n && ids.length === n };
    }

    // Returns { earned, max, auto: true|false, detail }
    function grade(q, a, self) {
        const max = pointsOf(q);
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
            case "design": return { earned: (a.pick === q.answer ? 1 : 0) + (self && self.reason ? 1 : 0), max, needsSelf: true };
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

    // ---------- The exam page ----------
    function render(main, ctx, parts) {
        const { S, COURSE, esc, icon, codeBlock, highlight, conceptById, allConcepts } = ctx;
        const KEY = `cramlet.exam.${COURSE}`;
        const lectures = Object.keys(S.lectures).map(Number);

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
        function build(lengthId, lecs) {
            const L = LENGTHS[lengthId], pool = poolFor(lecs), seen = read(`${KEY}.seen`, {});
            const used = new Set(), perConcept = {};
            const out = [];
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
            main.innerHTML = `
                <div class="exam-start">
                    <div class="exam-hero">
                        <div><h1>${icon("list-checks")} Practice exam</h1>
                        <p>A closed-book exam drawn fresh from ${esc(S.course.title)}’s question bank. Notes, search, and hints are hidden until you submit. Most questions are graded automatically; for written code and design answers you check your work against a model answer.</p></div>
                    </div>
                    ${active ? `<div class="callout key done exam-resume">${icon("hourglass-medium", "callout-ic")}<div class="callout-body"><span class="callout-label">Exam in progress</span>You have a ${esc(LENGTHS[active.length].name.toLowerCase())} that isn’t finished. <button type="button" class="btn primary small" data-act="resume">Continue it</button> <button type="button" class="btn ghost small" data-act="discard">Throw it away</button></div></div>` : ""}
                    <div class="exam-setup">
                        <div class="side-box"><div class="side-title">Length</div>
                            <div class="exam-lengths">${Object.entries(LENGTHS).map(([id, L], i) => {
                                const n = Object.values(L.mix).reduce((a, b) => a + b, 0);
                                return `<label class="exam-len"><input type="radio" name="exam-len" value="${id}" ${i === 0 ? "checked" : ""}><span><b>${L.name}</b><small>${n} questions · ${L.minutes ? `${L.minutes} minutes` : "no timer"}</small></span></label>`;
                            }).join("")}</div>
                        </div>
                        <div class="side-box"><div class="side-title">Lectures</div>
                            <div class="exam-lecs">${lectures.map(n => `<label class="exam-lec"><input type="checkbox" value="${n}" checked><span><b>L${n}</b> ${esc(S.lectures[n])}</span></label>`).join("")}</div>
                        </div>
                    </div>
                    <div class="exam-bank"></div>
                    <div class="build-actions"><button type="button" class="btn primary" data-act="start">${icon("hourglass-medium")} Start the exam</button></div>
                    ${hist.length ? `<div class="side-box"><div class="side-title">Past exams</div><ol class="exam-hist">${hist.slice().reverse().map((h, i) => `<li><button type="button" class="hist-link" data-hist="${hist.length - 1 - i}"><b>${Math.round(h.pct)}%</b> ${esc(LENGTHS[h.length].name)} · ${new Date(h.at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</button></li>`).join("")}</ol></div>` : ""}
                </div>`;
            const selLecs = () => [...main.querySelectorAll(".exam-lec input:checked")].map(x => +x.value);
            const drawBank = () => {
                const c = counts(selLecs()), total = c.reduce((a, [, n]) => a + n, 0);
                main.querySelector(".exam-bank").innerHTML = `<p class="muted">${total} questions in the bank for these lectures: ${c.filter(([, n]) => n).map(([s, n]) => `${n} ${s.name.toLowerCase()}`).join(" · ")}.</p>`;
            };
            main.querySelectorAll(".exam-lec input").forEach(x => x.addEventListener("change", drawBank));
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
                    const length = main.querySelector('[name="exam-len"]:checked').value;
                    const qs = build(length, lecs);
                    const L = LENGTHS[length];
                    saveExam({ length, lecs, ids: qs.map(q => q.id), answers: {}, flags: [], at: Date.now(), deadline: L.minutes ? Date.now() + L.minutes * 60000 : 0, away: 0, cur: 0 });
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

            main.innerHTML = `
                <div class="exam-take">
                    <div class="exam-bar">
                        <span class="exam-title">${icon("list-checks")} ${esc(LENGTHS[E.length].name)}</span>
                        <span class="exam-clock" aria-live="off"></span>
                        <button type="button" class="btn primary small" data-act="submit">Submit exam</button>
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
                    if (sec !== last) { html += `<div class="map-sec">${esc(sec.name)}</div>`; last = sec; }
                    html += `<button type="button" class="map-q${answered(i) ? " done" : ""}${E.flags.includes(i) ? " flag" : ""}${i === E.cur ? " cur" : ""}" data-go="${i}" aria-label="Question ${i + 1}">${i + 1}</button>`;
                });
                $(".exam-map").innerHTML = html;
            }
            function store(patch) {
                E = exam();
                const id = qs[E.cur].id;
                E.answers[id] = { ...(E.answers[id] || {}), ...patch };
                saveExam(E);
                drawMap();
            }

            function drawQ() {
                const i = E.cur, q = qs[i], a = E.answers[q.id] || {}, sec = sectionOf(q.type);
                const head = `<div class="q-head"><span class="q-sec">${esc(sec.name)}</span><span class="q-num">Question ${i + 1} of ${qs.length} · ${pointsOf(q)} pt${pointsOf(q) > 1 ? "s" : ""}</span></div>`;
                let body = "";
                // attr: which answer field the buttons set (pick, toggle for select-all, fix for bug fixes)
                const opts = (list, attr = "pick") => `<div class="options">${list.map((o, k) => {
                    const on = attr === "toggle" ? (a.picks || []).includes(k) : a[attr] === k;
                    return `<button type="button" class="option${on ? " picked" : ""}" data-${attr}="${k}" aria-pressed="${on}"><span class="opt-letter">${attr === "toggle" ? (on ? "✓" : "") : "ABCDEFG"[k]}</span><span>${o}</span></button>`;
                }).join("")}</div>`;
                if (q.type === "mc") body = (q.code ? codeBlock(q.code) : "") + opts(q.options);
                else if (q.type === "tf") body = opts(["True", "False"]);
                else if (q.type === "multi") body = `<p class="muted">Select every correct answer.</p>` + opts(q.options, "toggle");
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
                    body = (q.code ? codeBlock(q.code) : "") + opts(q.options) + `<label class="q-sub" for="why">Why? Justify your choice in one or two sentences.</label><textarea id="why" class="text-in" rows="3" data-why>${esc(a.why || "")}</textarea>`;
                } else if (q.type === "write") {
                    body = `<textarea class="code-in big" rows="16" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Your code" placeholder="Write your code here. No autocomplete, just like on paper.">${esc(a.code !== undefined ? a.code : (q.starter || ""))}</textarea><p class="muted">Tab inserts four spaces.</p>`;
                }
                $(".exam-q").innerHTML = `
                    ${head}
                    <div class="question">${q.q}</div>
                    ${body}
                    <div class="q-nav">
                        <button type="button" class="btn" data-act="prev" ${i ? "" : "disabled"}>← Previous</button>
                        <button type="button" class="btn ghost${E.flags.includes(i) ? " flagged" : ""}" data-act="flag">${icon("push-pin")} ${E.flags.includes(i) ? "Flagged" : "Flag for later"}</button>
                        <button type="button" class="btn primary" data-act="${i < qs.length - 1 ? "next" : "submit"}">${i < qs.length - 1 ? "Next →" : "Submit exam"}</button>
                    </div>`;
                drawMap();
            }

            function tick() {
                const el = $(".exam-clock");
                if (!el) { clearInterval(timer); return; }
                const E2 = exam();
                if (!E2) { clearInterval(timer); return; }
                if (!E2.deadline) { const m = Math.floor((Date.now() - E2.at) / 60000); el.textContent = `${m} min so far`; return; }
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
            function finish() { clearInterval(timer); E = exam(); E.done = Date.now(); saveExam(E); location.hash = "#/exam/check"; }

            main.querySelector(".exam-take").addEventListener("click", e => {
                const t = e.target.closest("button");
                if (!t) return;
                const d = t.dataset;
                E = exam();
                const q = qs[E.cur], a = E.answers[q.id] || {};
                if (d.go !== undefined) { E.cur = +d.go; saveExam(E); drawQ(); }
                else if (d.act === "prev") { E.cur--; saveExam(E); drawQ(); }
                else if (d.act === "next") { E.cur++; saveExam(E); drawQ(); }
                else if (d.act === "flag") { E.flags = E.flags.includes(E.cur) ? E.flags.filter(x => x !== E.cur) : [...E.flags, E.cur]; saveExam(E); drawQ(); }
                else if (d.act === "submit") { if (!main.querySelector(".exam-confirm")) confirmSubmit(); }
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
                if (E && !E.done) { E.away = (E.away || 0) + 1; write(awayKey, E); }
            });
        }
        awayKey = `${KEY}.active`;

        // ---------- Check your written answers ----------
        function drawCheck() {
            document.body.classList.remove("exam-focus");
            const E = exam();
            if (!E) { location.hash = "#/exam"; return; }
            const Q = byId(), qs = E.ids.map(id => Q[id]).filter(Boolean);
            const toCheck = qs.map((q, i) => ({ q, i })).filter(({ q }) => q.type === "write" || q.type === "design");
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
                                <div class="question">${q.q}</div>
                                <p><b>You picked:</b> ${a.pick === undefined ? "<i>nothing</i>" : q.options[a.pick]} ${a.pick === q.answer ? `<span class="tag ok">correct</span>` : `<span class="tag in">not the best choice</span>`}</p>
                                <p><b>Your reason:</b> ${a.why ? esc(a.why) : "<i>none</i>"}</p>
                                <div class="callout tip done">${icon("lightbulb", "callout-ic")}<div class="callout-body"><span class="callout-label">Model answer</span><b>${q.options[q.answer]}.</b> ${q.model}</div></div>
                                <label class="self-item"><input type="checkbox" data-reason="${esc(q.id)}" ${E.self[q.id] && E.self[q.id].reason ? "checked" : ""}> My reason makes the same main point as the model answer.</label>
                            </section>`;
                        const g = grade(q, a, E.self[q.id]);
                        return `
                            <section class="detail check-q" data-q="${esc(q.id)}">
                                <h3>Question ${i + 1} <span class="q-sec">Write the code</span></h3>
                                <div class="question">${q.q}</div>
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
                const g = grade(q, E.answers[q.id], (E.self || {})[q.id]);
                return { id: q.id, concept: q.concept, lec: q.lec, sec: q.sec || null, type: q.type, earned: g.earned, max: g.max };
            });
            const earned = items.reduce((a, x) => a + x.earned, 0), max = items.reduce((a, x) => a + x.max, 0);
            const result = { at: E.at, done: E.done || Date.now(), length: E.length, lecs: E.lecs, away: E.away || 0, earned, max, pct: (earned / max) * 100, items, answers: E.answers, self: E.self || {} };
            const hist = history(); hist.push(result); write(`${KEY}.history`, hist.slice(-20));
            const seen = read(`${KEY}.seen`, {}); E.ids.forEach(id => { seen[id] = Date.now(); }); write(`${KEY}.seen`, seen);
            // Missed questions go to the mistake log.
            const log = read(`${KEY}.mistakes`, {});
            items.forEach(x => { if (x.earned < x.max) log[x.id] = { at: Date.now(), concept: x.concept }; else delete log[x.id]; });
            write(`${KEY}.mistakes`, log);
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
            const yours = (q, a = {}) => {
                if (q.type === "mc" || q.type === "design") return a.pick === undefined ? "<i>no answer</i>" : q.options[a.pick];
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
                if (q.type === "mc" || q.type === "design") return q.options[q.answer];
                if (q.type === "tf") return q.answer ? "True" : "False";
                if (q.type === "multi") return q.answers.map(k => q.options[k]).join("; ");
                if (q.type === "bug") return `line ${q.answer + 1}: <code>${esc(q.lines[q.answer].trim())}</code>${q.fixes ? `. Fix: ${q.fixes[q.fix]}` : ""}`;
                if (q.type === "trace") return q.out.kind === "output" ? `<pre class="mini">${esc(q.out.text)}</pre>` : q.out.kind === "compile" ? "Compile error" : "Runtime exception";
                if (q.type === "fill") return q.blanks.map((b, k) => `${k + 1}: <code>${esc(b[0])}</code>`).join(" · ");
                if (q.type === "parsons") return codeBlock(q.lines.join("\n"));
                if (q.type === "write") return codeBlock(q.model);
                return "";
            };
            const qCard = (x, n) => {
                const q = Q[x.id];
                if (!q) return "";
                const a = R.answers[x.id] || {}, c = conceptById[x.concept];
                const full = x.earned >= x.max, none = x.earned === 0;
                return `<details class="res-q ${full ? "full" : none ? "zero" : "part-cred"}"${full ? "" : " open"}>
                    <summary><span class="res-n">${n}</span><span class="res-what"><b>${esc(c ? c.title : x.concept)}</b> · ${esc(sectionOf(q.type).name)}</span><span class="res-pts">${x.earned}/${x.max}</span></summary>
                    <div class="question">${q.q}</div>
                    ${q.code && q.type !== "trace" && q.type !== "fill" ? codeBlock(q.code) : ""}${q.type === "trace" ? codeBlock(q.code) : ""}
                    ${q.type === "bug" ? `<div class="bug-code">${q.lines.map((ln, k) => `<div class="bug-line${k === q.answer ? " correct" : k === a.line ? " wrong" : ""}"><span class="ln">${k + 1}</span><code>${highlight(ln) || "&nbsp;"}</code></div>`).join("")}</div>` : ""}
                    <div class="res-ans"><div><div class="side-title">Your answer</div>${yours(q, a)}</div><div><div class="side-title">Model answer</div>${model(q)}</div></div>
                    ${q.explain ? `<div class="callout tip done">${icon("lightbulb", "callout-ic")}<div class="callout-body"><span class="callout-label">Why</span>${q.explain}</div></div>` : ""}
                    ${c ? `<a class="btn small" href="#/c/${c.id}/${q.sec ? `details/${q.sec}` : "summary"}">${icon("note")} Review ${esc(q.sec && secTitle(c.id, q.sec) ? secTitle(c.id, q.sec) : c.title)}</a>` : ""}
                </details>`;
            };
            main.innerHTML = `
                <div class="exam-results">
                    <div class="exam-hero res">
                        <div class="score-ring" style="--p:${Math.round(R.pct)}"><span>${Math.round(R.pct)}%</span></div>
                        <div><h1>${R.pct >= 85 ? "Great exam!" : R.pct >= 70 ? "Solid work." : "Good practice. Here’s what to review."}</h1>
                        <p>${R.earned} of ${R.max} points · ${esc(LENGTHS[R.length].name)} · ${Math.max(1, Math.round((R.done - R.at) / 60000))} minutes${prev ? ` · last time ${Math.round(prev.pct)}% (${R.pct >= prev.pct ? "+" : ""}${Math.round(R.pct - prev.pct)})` : ""}${R.away ? ` · you left the exam page ${R.away} time${R.away > 1 ? "s" : ""}` : ""}</p>
                        <div class="build-actions"><a class="btn primary" href="#/exam">${icon("arrow-clockwise")} Take another exam</a><a class="btn" href="#/exam/mistakes">${icon("list-checks")} Mistake log</a></div></div>
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
        }

        // ---------- Mistake log ----------
        function drawMistakes() {
            document.body.classList.remove("exam-focus");
            const log = read(`${KEY}.mistakes`, {}), Q = byId();
            const list = Object.entries(log).map(([id, m]) => ({ id, ...m, q: Q[id] })).filter(x => x.q).sort((a, b) => a.at - b.at);
            main.innerHTML = `
                <div class="exam-start">
                    <h1>${icon("list-checks")} Mistake log</h1>
                    <p>Every exam question you didn’t get full marks on. Getting it right on a later exam removes it. <b>Redo</b> starts a short exam made only of these.</p>
                    ${list.length ? `<div class="build-actions"><button type="button" class="btn primary" data-act="redo">${icon("arrow-clockwise")} Redo ${Math.min(10, list.length)} mistakes</button><a class="btn" href="#/exam">Back to exams</a></div>
                    <ol class="mistakes">${list.map(x => { const c = conceptById[x.concept]; return `<li style="--c:${c ? c.color : "var(--brand)"}"><span class="stripe"></span><span><b>${esc(c ? c.title : x.concept)}</b> · ${esc(sectionOf(x.q.type).name)}<br><span class="muted">${esc(String(x.q.q).replace(/<[^>]+>/g, "").slice(0, 120))}</span></span></li>`; }).join("")}</ol>`
                    : `<p class="muted">No mistakes logged yet. Take an exam first.</p><a class="btn" href="#/exam">Back to exams</a>`}
                </div>`;
            const redo = main.querySelector('[data-act="redo"]');
            if (redo) redo.addEventListener("click", () => {
                const ids = list.slice(0, 10).map(x => x.id);
                saveExam({ length: "quick", lecs: lectures, ids, answers: {}, flags: [], at: Date.now(), deadline: 0, away: 0, cur: 0 });
                location.hash = "#/exam/take";
            });
        }

        if (parts[1] === "take") drawTake();
        else if (parts[1] === "check") drawCheck();
        else if (parts[1] === "results") drawResults(+parts[2]);
        else if (parts[1] === "mistakes") drawMistakes();
        else drawStart();
    }

    // Latest exam result for a course, for concept badges and the dashboard.
    function latest(course) {
        const h = read(`cramlet.exam.${course}.history`, []);
        return h[h.length - 1] || null;
    }

    window.CRAMLET = Object.assign(window.CRAMLET || {}, { exam: { render, latest, SECTIONS, LENGTHS, grade, pointsOf } });
})();
