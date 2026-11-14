// Proof Box (#/proofs, a Test Kitchen tool): the proofs a course expects you to write, each climbing levels.
//   1 With hints        done automatically when you finish any of its hint activities (progress award ids)
//   2 Build from steps  a proof puzzle (the course's "proof-puzzle" widget); done when it's solved
//   fill  Fill the blanks   (proofs with a `scaffold` only) the proof's outline is written out; you fill in the parts
//                           that change from problem to problem. Picks and short answers are checked for you.
//   outline Outline only    (scaffold only) just the section headings; write each section, grade with the checklist
//   3 On your own       a blank box. You may peek at the outline, but then the attempt counts as practice, not a pass
//   4 Timed             the same against the clock, for a prompt you haven't written up yet
// Each scaffolded level shows a worked example of a *different* language first (open on Fill, folded on Outline,
// gone after that), so every attempt starts right after seeing the format done correctly.
// level() stays on the 0–4 scale (hints, steps, own, timed) that the Study Plan and Test Kitchen count.
// Misses go into the Study Plan's mistake log. Saved in cramlet.proofs.<course> (this browser only).
//   registerProofs([{ id, title, topic, minutes, hints: [{ label, href, key }], puzzle, checklist: [{ text, key, part }],
//                     prompts: [{ id, task, model | sc }],
//                     scaffold: { model(sc), fill(sc), outline, starters: [..], examples: [{ id, task, sc, kind }],
//                                 study(sc) → HTML shown under a worked example, mountStudy(el, sc) to make it work } }])
//   A fill template marks its blanks: <input data-blank="k" data-alts="[json]" data-show="html">,
//   <select data-blank="k" data-ans="value">, and <textarea data-blank="k" data-free data-show="html"> (self-checked).
(function () {
    "use strict";

    const ST = () => (window.STUDY = window.STUDY || {});
    window.registerProofs = list => { ST().proofs = (ST().proofs || []).concat(list); };

    const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } };
    const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
    const KEY = course => `cramlet.proofs.${course}`;
    const NAMES = { 1: "With hints", 2: "Build from steps", fill: "Fill the blanks", outline: "Outline only", 3: "On your own", 4: "Timed" };
    const LEVELS = [NAMES[1], NAMES[2], NAMES[3], NAMES[4]];
    const list = () => ST().proofs || [];
    const byId = id => list().find(p => p.id === id);
    const stepsOf = p => (p && p.scaffold ? [1, 2, "fill", "outline", 3, 4] : [1, 2, 3, 4]);
    const modelOf = (p, pr) => pr.model || (p.scaffold && pr.sc ? p.scaffold.model(pr.sc) : "");
    const fmt = t => (CRAMLET.mathText ? CRAMLET.mathText.format(t) : String(t || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])).replace(/\n/g, "<br>"));

    function store(course) { return read(KEY(course), {}); }
    function rec(course, id) { const s = store(course); return s[id] || { attempts: [], used: [] }; }
    function saveRec(course, id, r) { const s = store(course); s[id] = r; write(KEY(course), s); }

    // Is one step passed? A later step counts for the earlier written ones (doing it on your own covers the outline).
    function stepDone(ctx, p, step) {
        const course = ctx.COURSE || ctx.course;
        const r = rec(course, p.id), A = r.attempts;
        const ok = l => A.some(a => a.lvl === l && a.pass);
        if (step === 1) { const keys = new Set(CRAMLET.progress ? CRAMLET.progress.keys() : []); return (p.hints || []).some(h => keys.has(h.key)); }
        if (step === 2) return !!(p.puzzle && read(`cramlet.${course}.solved`, []).includes("proof-" + p.puzzle.id));
        if (step === 4) return ok(4);
        if (step === 3) return ok(3) || ok(4);
        if (step === "outline") return ok("outline") || ok(3) || ok(4);
        if (step === "fill") return ok("fill") || ok("outline") || ok(3) || ok(4);
        return false;
    }
    // The highest of the four milestones passed (0–4). A higher one counts even if you skipped a lower one.
    function level(ctx, id) { const p = byId(id); if (!p) return 0; const ps = [1, 2, 3, 4].map(s => stepDone(ctx, p, s)); return ps.lastIndexOf(true) + 1; }
    // For Study Plan tasks: level is 1–4 or "fill" / "outline".
    function taskDone(ctx, id, lvl) { const p = byId(id); if (!p) return false; return typeof lvl === "number" ? level(ctx, id) >= lvl : stepDone(ctx, p, lvl); }
    const levelName = l => NAMES[l] || "";
    function levelsHTML(ctx, p, icon) {
        const steps = stepsOf(p), done = steps.map(s => stepDone(ctx, p, s));
        const last = done.lastIndexOf(true), next = last + 1;
        return `<span class="pb-lvls">${steps.map((s, i) => `<span class="pb-lvl${i <= last ? " on" : i === next ? " next" : ""}">${i <= last ? icon("check") : ""}${NAMES[s]}</span>`).join("")}</span>`;
    }
    const nextName = (ctx, p) => { const steps = stepsOf(p), last = steps.map(s => stepDone(ctx, p, s)).lastIndexOf(true); return last >= steps.length - 1 ? "" : NAMES[steps[last + 1]]; };

    // ---------- Pages ----------
    function render(main, ctx, parts) {
        const { COURSE, esc, icon } = ctx;
        const K = CRAMLET.kitchen;
        const p = parts[1] && byId(parts[1]);
        if (!p) return renderList(main, ctx);
        const SC = p.scaffold;
        const steps = stepsOf(p);

        const r0 = rec(COURSE, p.id);
        let session = r0.active || null; // { lvl, prompt, start, text, graded, ticks, peek, fill, marks }
        let timer = null;
        main.innerHTML = `${K.header(ctx, "proofs", { line: `${p.title}. Climb the levels in order; only Timed counts as exam-ready.` })}
            <div class="kh-slim"><a class="btn ghost small" href="#/proofs">${icon("note-pencil")} All proofs</a><span class="kh-grow"></span><span class="pb-status"></span></div>
            <div class="pb-levels"></div>`;
        K.mount(main);
        const $ = s => main.querySelector(s);
        const sid = l => `pb-l-${l}`;

        function status() { $(".pb-status").innerHTML = levelsHTML(ctx, p, icon); }
        function draw() {
            status();
            const r = rec(COURSE, p.id);
            const head = (l, i, extra = "") => `<h2><span class="pb-n">${i + 1}</span> ${NAMES[l]}${extra} ${stepDone(ctx, p, l) ? `<span class="pb-done">${icon("check")} Done</span>` : ""}</h2>`;
            $(".pb-levels").innerHTML = steps.map((l, i) => {
                const cls = `pb-level${stepDone(ctx, p, l) ? " passed" : ""}`;
                if (l === 1) return `<section class="${cls}" id="${sid(l)}">${head(l, i)}
                    <p>Work through a guided version first. Any one of these counts:</p>
                    <ul class="pb-hints">${(p.hints || []).map(h => `<li><a href="${h.href}">${h.label}</a></li>`).join("")}</ul></section>`;
                if (l === 2) return `<section class="${cls}" id="${sid(l)}">${head(l, i)}
                    <p>Put the proof in order. Some steps don’t belong: leave them out.</p>
                    <div class="widget pb-puzzle" style="--c:var(--brand)"></div></section>`;
                return `<section class="${cls}" id="${sid(l)}">${head(l, i, l === 4 ? ` (${p.minutes} min)` : "")}${sessionHTML(l)}</section>`;
            }).join("") + (r.attempts.length ? `<section class="pb-level pb-history"><h2>Your attempts</h2><ul>${r.attempts.slice().reverse().slice(0, 8).map(a => {
                const pr = p.prompts.find(x => x.id === a.prompt);
                return `<li><span class="pb-tag ${a.pass ? "ok" : a.peek ? "peek" : "no"}">${a.pass ? "Passed" : a.peek ? "Peeked" : "Not yet"}</span> ${NAMES[a.lvl] || ""} · ${new Date(a.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}${a.secs ? ` · ${Math.round(a.secs / 60)} min` : ""} · ${pr ? pr.task : ""}${a.missed && a.missed.length ? `<div class="pb-missed">Missed: ${a.missed.join("; ")}</div>` : ""}</li>`;
            }).join("")}</ul></section>` : "");
            if (p.puzzle && CRAMLET.widgets && CRAMLET.widgets["proof-puzzle"]) {
                try { CRAMLET.widgets["proof-puzzle"]($(".pb-puzzle"), { puzzles: [p.puzzle] }, ctx.widgetCtx); }
                catch (e) { $(".pb-puzzle").innerHTML = `<p class="muted">The puzzle didn’t load. Try refreshing.</p>`; }
            } else $(".pb-puzzle").innerHTML = `<p class="muted">No puzzle for this one yet.</p>`;
            wire();
            tick();
        }

        function pickPrompt(lvl) {
            const r = rec(COURSE, p.id), used = new Set(r.used || []);
            const fresh = p.prompts.filter(x => !used.has(x.id));
            const pool = fresh.length ? fresh : p.prompts;
            return lvl !== 4 ? pool[0] : pool[pool.length > 1 ? 1 + Math.floor(Math.random() * (pool.length - 1)) : 0];
        }
        // A worked example for a different language, matched to the prompt's twist when there is one.
        function exampleFor(pr) {
            const ex = (SC && SC.examples) || [];
            return ex.find(e => e.kind && pr.sc && e.kind === pr.sc.kind) || ex[0] || null;
        }
        function exampleHTML(pr, open) {
            const e = exampleFor(pr);
            if (!e) return "";
            return `<details class="pb-example"${open ? " open" : ""}><summary>${icon("lightbulb")} Worked example: ${e.task}</summary><div class="pb-model">${SC.model(e.sc)}</div>${SC.study ? `<div class="pb-study" data-ex="${e.id}">${SC.study(e.sc)}</div>` : ""}</details>`;
        }

        const INTRO = {
            fill: "A new language, with the proof already laid out in the format your class uses. You fill in only the parts that change from problem to problem. Read the worked example first, then fill the blanks.",
            outline: "Only the section headings are given. Write each section yourself, then grade it with the checklist. The worked example is folded away: open it only if you’re stuck.",
            3: "A blank box, like the exam. Stuck? You can peek at the outline, but then this attempt counts as practice, not a pass.",
            4: `A blank box against a ${p.minutes}-minute clock, like the exam. Close your notes first. No outline here.`,
        };
        if (!SC) INTRO[3] = "You’ll get a language you haven’t proved yet. Write the full proof (here or on paper), then grade it against the checklist and the model answer.";

        function sessionHTML(lvl) {
            if (!session || session.lvl !== lvl) {
                return `<p>${INTRO[lvl]}</p><button type="button" class="btn primary" data-start="${lvl}" ${session ? "disabled" : ""}>${icon(lvl === 4 ? "hourglass-medium" : "note-pencil")} ${session ? "Finish the open proof first" : "Start"}</button>`;
            }
            const pr = p.prompts.find(x => x.id === session.prompt);
            const task = `<div class="pb-task"><span class="pb-k">Prove it</span>${pr.task}</div>`;
            if (lvl === "fill") return fillHTML(pr, task);
            if (!session.graded) return `
                ${lvl === "outline" ? exampleHTML(pr, false) : ""}
                ${task}
                ${lvl === 4 ? `<div class="pb-timer" aria-live="off"></div>` : ""}
                ${lvl === "outline" && SC.starters ? `<div class="pb-starters"><span class="pb-k">Starter phrases (click to type one at the cursor)</span>${SC.starters.map((s, i) => `<button type="button" class="pb-starter" data-starter="${i}">${fmt(s)}</button>`).join("")}</div>` : ""}
                <label class="pb-write"><span>${lvl === "outline" ? "Fill in each section:" : "Write your proof here, or on paper (only saved in this browser):"}</span>
                    <textarea rows="${lvl === "outline" ? 16 : 12}" data-text spellcheck="false">${esc(session.text || "")}</textarea></label>
                <div class="pb-acts"><button type="button" class="btn primary" data-grade>${icon("check")} I’m done: grade it</button>
                    ${lvl === 3 && SC && SC.outline ? `<button type="button" class="btn ghost" data-peek ${session.peek ? "disabled" : ""}>${icon("magnifying-glass")} ${session.peek ? "Outline added (this one counts as practice)" : "Peek at the outline"}</button>` : ""}
                    <button type="button" class="btn ghost" data-quit>Give up for now</button></div>`;
            const over = lvl === 4 && session.secs > p.minutes * 60;
            return `
                ${task}
                ${lvl === 4 ? `<div class="pb-time ${over ? "over" : ""}">Time: ${Math.floor(session.secs / 60)}:${String(session.secs % 60).padStart(2, "0")} of ${p.minutes}:00${over ? ". Over time: this one doesn’t count as passed, but grade it anyway." : ""}</div>` : ""}
                ${session.peek ? `<p class="pb-peeknote">${icon("magnifying-glass")} You peeked at the outline, so this attempt is practice. Grade it anyway, then do another one without peeking to pass this level.</p>` : ""}
                <div class="pb-grade">
                    <div class="pb-col"><span class="pb-k">Grade your proof</span><p class="pb-hint">Tick only what your proof actually does. Starred items must all be ticked to pass.${SC ? " The colors match the parts of the model answer." : ""}</p>
                        ${p.checklist.map((c, i) => `<label class="pb-item"><input type="checkbox" data-tick="${i}" ${session.ticks && session.ticks[i] ? "checked" : ""}> <span>${c.part ? `<i class="rd-dot rd-${c.part}" aria-hidden="true"></i>` : ""}${c.key ? "<b class=\"pb-star\">★</b> " : ""}${c.text}</span></label>`).join("")}
                        <div class="pb-acts"><button type="button" class="btn primary" data-save>Save my grade</button></div></div>
                    <div class="pb-col"><span class="pb-k">Model answer</span><div class="pb-model">${modelOf(p, pr)}</div>
                        ${session.text && session.text.trim() ? `<details class="pb-mine" open><summary>Your answer</summary><div class="pb-yours">${fmt(session.text)}</div></details>` : ""}</div>
                </div>`;
        }

        // ----- Fill the blanks -----
        function fillHTML(pr, task) {
            const checked = !!session.marks;
            let foot;
            if (!checked) foot = `<div class="pb-acts"><button type="button" class="btn primary" data-check>${icon("check")} Check my blanks</button><button type="button" class="btn ghost" data-quit>Give up for now</button></div>`;
            else {
                const m = session.marks, ks = Object.keys(m), right = ks.filter(k => m[k] === "ok").length, open = ks.filter(k => m[k] === "self").length;
                foot = `<div class="pb-fillsum${right === ks.length ? " ok" : ""}">${open ? `Compare the part marked <b>Your call</b> with the model, then save.` : right === ks.length ? `${icon("check")} Every blank is right.` : `${right} of ${ks.length} blanks right. The answer is shown next to each miss.`}</div>
                    <div class="pb-acts"><button type="button" class="btn primary" data-savefill ${open ? "disabled" : ""}>Save and continue</button></div>`;
            }
            return `${exampleHTML(pr, !checked)}${task}<div class="pb-fill">${SC.fill(pr.sc)}</div>${foot}`;
        }
        const norm = s => String(s || "").toLowerCase().replace(/<[^>]+>/g, "").replace(/[\s.,"“”'’()]/g, "").replace(/φ|ϕ/g, "∅").replace(/\{\}/g, "∅");
        function checkFill(root) {
            const marks = {}, vals = {};
            root.querySelectorAll("[data-blank]").forEach(b => {
                const k = b.dataset.blank, v = b.value; vals[k] = v;
                if (b.hasAttribute("data-free")) marks[k] = "self";
                else if (b.tagName === "SELECT") marks[k] = v === b.dataset.ans ? "ok" : "miss";
                else { const alts = JSON.parse(b.dataset.alts || "[]").map(norm); marks[k] = v.trim() && alts.includes(norm(v)) ? "ok" : "miss"; }
            });
            return { marks, vals };
        }
        // After checking: put the answers back, lock them, and mark each blank.
        function paintFill(root) {
            root.querySelectorAll("[data-blank]").forEach(b => {
                const k = b.dataset.blank, m = session.marks[k];
                b.value = session.fill[k] || "";
                b.disabled = true;
                b.classList.add("pb-" + m);
                const show = b.dataset.show || (b.tagName === "SELECT" ? b.dataset.ans : "");
                let note = "";
                if (m === "miss") note = `<span class="pb-want">→ ${show}${b.tagName === "SELECT" ? "" : ` <button type="button" class="pb-count" data-count="${k}">Mine means the same</button>`}</span>`;
                if (m === "self") note = `<span class="pb-want pb-self"><span class="pb-k">Your call: does yours do this?</span>${show}<span class="pb-selfbtns"><button type="button" class="btn small" data-self="${k}" data-v="ok">${icon("check")} Mine does the same</button><button type="button" class="btn small ghost" data-self="${k}" data-v="miss">Mine is different</button></span></span>`;
                if (note) b.insertAdjacentHTML("afterend", note);
            });
        }

        function persistSession() { const r = rec(COURSE, p.id); r.active = session; saveRec(COURSE, p.id, r); }
        function tick() {
            clearInterval(timer);
            const el = main.querySelector(".pb-timer");
            if (!el || !session || session.graded) return;
            const show = () => {
                const secs = Math.round((Date.now() - session.start) / 1000), left = p.minutes * 60 - secs;
                el.className = "pb-timer" + (left < 0 ? " over" : left < 120 ? " low" : "");
                el.textContent = left >= 0 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")} left` : `${Math.floor(-left / 60)}:${String(-left % 60).padStart(2, "0")} over time`;
            };
            show(); timer = setInterval(() => { if (!document.body.contains(el)) return clearInterval(timer); show(); }, 1000);
        }

        function finish(lvl, pass, missedItems, extra = {}) {
            const r = rec(COURSE, p.id);
            r.attempts.push(Object.assign({ lvl, prompt: session.prompt, at: Date.now(), secs: lvl === 4 ? session.secs : 0, pass, missed: missedItems }, extra));
            r.used = Array.from(new Set([...(r.used || []), session.prompt]));
            delete r.active; saveRec(COURSE, p.id, r);
            if (pass && CRAMLET.progress) CRAMLET.progress.award("challenge", `${COURSE}:proofbox:${p.id}:${lvl}`, { at: main.querySelector(`#${sid(lvl)}`) });
            session = null; draw();
        }
        function callout(lvl, kind, label, text) {
            const sec = $(`#${sid(lvl)}`);
            if (sec) sec.insertAdjacentHTML("beforeend", `<div class="callout ${kind} done">${icon(kind === "tip" ? "star" : "warning", "callout-ic")}<div class="callout-body"><span class="callout-label">${label}</span>${text}</div></div>`);
        }

        function wire() {
            // Study tools inside a worked example (the course's scaffold.study / scaffold.mountStudy)
            if (SC && SC.mountStudy) main.querySelectorAll(".pb-study").forEach(el => { const e = (SC.examples || []).find(x => x.id === el.dataset.ex); if (e) SC.mountStudy(el, e.sc); });
            main.querySelectorAll("[data-start]").forEach(b => b.addEventListener("click", () => {
                const raw = b.dataset.start, lvl = /^\d$/.test(raw) ? +raw : raw, pr = pickPrompt(lvl);
                session = { lvl, prompt: pr.id, start: Date.now(), text: lvl === "outline" ? SC.outline : "", graded: false };
                persistSession(); draw();
                const sec = $(`#${sid(lvl)}`); if (sec) sec.scrollIntoView({ block: "start", behavior: "smooth" });
            }));
            const ta = main.querySelector("[data-text]");
            let mt = null;
            if (ta) {
                const save = v => { session.text = v; persistSession(); };
                let tm;
                if (CRAMLET.mathText) mt = CRAMLET.mathText.mount(ta, { onChange: v => { clearTimeout(tm); tm = setTimeout(() => save(v), 300); } });
                else ta.addEventListener("input", () => { clearTimeout(tm); tm = setTimeout(() => save(ta.value), 300); });
            }
            main.querySelectorAll("[data-starter]").forEach(b => {
                b.addEventListener("mousedown", e => e.preventDefault()); // keep the caret where it is
                b.addEventListener("click", () => { const s = SC.starters[+b.dataset.starter]; if (mt) mt.insert(s); });
            });
            const pk = main.querySelector("[data-peek]");
            if (pk) pk.addEventListener("click", () => {
                session.peek = true;
                session.text = SC.outline + (ta && ta.value.trim() ? "\n\n" + ta.value : "");
                persistSession(); draw();
            });
            const g = main.querySelector("[data-grade]");
            if (g) g.addEventListener("click", () => {
                if (ta) session.text = ta.value;
                session.secs = Math.round((Date.now() - session.start) / 1000);
                session.graded = true; session.ticks = {};
                persistSession(); clearInterval(timer); draw();
            });
            main.querySelectorAll("[data-quit]").forEach(q => q.addEventListener("click", () => { session = null; const r = rec(COURSE, p.id); delete r.active; saveRec(COURSE, p.id, r); clearInterval(timer); draw(); }));
            main.querySelectorAll("[data-tick]").forEach(cb => cb.addEventListener("change", () => { session.ticks[cb.dataset.tick] = cb.checked; persistSession(); }));

            // Fill the blanks
            const fillRoot = main.querySelector(".pb-fill");
            if (fillRoot && session && session.marks) paintFill(fillRoot);
            else if (fillRoot && session && session.fill) fillRoot.querySelectorAll("[data-blank]").forEach(b => { b.value = session.fill[b.dataset.blank] || ""; });
            if (fillRoot && session && !session.marks) {
                const keep = () => { session.fill = checkFill(fillRoot).vals; persistSession(); };
                fillRoot.addEventListener("input", keep);
                fillRoot.addEventListener("change", keep);
            }
            if (fillRoot) fillRoot.querySelectorAll("[data-ins]").forEach(b => {
                b.addEventListener("mousedown", e => e.preventDefault());
                b.addEventListener("click", () => {
                    const inp = fillRoot.querySelector(`[data-blank="${b.dataset.for}"]`);
                    if (!inp || inp.disabled) return;
                    inp.value = b.dataset.ins; inp.dispatchEvent(new Event("input", { bubbles: true })); inp.focus();
                });
            });
            const ck = main.querySelector("[data-check]");
            if (ck) ck.addEventListener("click", () => {
                const { marks, vals } = checkFill(fillRoot);
                const empty = Object.keys(vals).filter(k => !String(vals[k]).trim());
                fillRoot.querySelectorAll("[data-blank]").forEach(b => b.classList.toggle("pb-empty", !String(b.value).trim()));
                if (empty.length) { const first = fillRoot.querySelector(".pb-empty"); if (first) first.focus(); return; }
                session.fill = vals; session.marks = marks;
                persistSession(); draw();
            });
            main.querySelectorAll("[data-count], [data-self]").forEach(b => b.addEventListener("click", () => {
                const k = b.dataset.count || b.dataset.self;
                session.marks[k] = b.dataset.count ? "ok" : b.dataset.v;
                persistSession(); draw();
                const sum = main.querySelector(".pb-fillsum"); if (sum) sum.scrollIntoView({ block: "nearest" });
            }));
            const sf = main.querySelector("[data-savefill]");
            if (sf) sf.addEventListener("click", () => {
                const m = session.marks, missed = Object.keys(m).filter(k => m[k] !== "ok");
                const labels = missed.map(k => { const b = fillRoot.querySelector(`[data-blank="${k}"]`); return (b && b.getAttribute("aria-label")) || k; });
                const pass = !missed.length;
                finish("fill", pass, labels);
                callout("fill", pass ? "tip" : "warn", pass ? "Passed" : "Not yet",
                    pass ? "Nice. Next, try Outline only: same format, but you write each section." : "Read the answer next to each miss, then start another language. Fill the blanks again until they’re all right.");
            });

            const sv = main.querySelector("[data-save]");
            if (sv) sv.addEventListener("click", () => {
                const missedItems = p.checklist.filter((c, i) => c.key && !session.ticks[i]).map(c => c.text.replace(/<[^>]+>/g, ""));
                const lvl = session.lvl;
                const overtime = lvl === 4 && session.secs > p.minutes * 60;
                const peek = !!session.peek;
                const pass = !missedItems.length && !overtime && !peek;
                if (!pass && !(peek && !missedItems.length)) {
                    // Into the Study Plan's mistake log, so it comes back.
                    const plan = read(`cramlet.plan.${COURSE}`, {}); plan.mistakes = plan.mistakes || [];
                    const pr = p.prompts.find(x => x.id === session.prompt);
                    plan.mistakes.unshift({ q: `${pr.task.replace(/<[^>]+>/g, "")}: missed ${missedItems.length ? missedItems.join("; ") : "the time limit"}`, src: `Proof Box · ${NAMES[lvl]}`, topic: p.topic, why: overtime && !missedItems.length ? "time" : "setup", at: Date.now(), right: [], tries: [] });
                    write(`cramlet.plan.${COURSE}`, plan);
                }
                finish(lvl, pass, missedItems.concat(overtime ? ["finished over time"] : []), peek ? { peek: true } : {});
                const nxt = steps[steps.indexOf(lvl) + 1];
                if (pass) callout(lvl, "tip", "Passed", lvl === 4 ? "That’s exam-ready. Come back in a couple of days and do another prompt to keep it there." : `Nice. When you feel ready, try ${NAMES[nxt]}.`);
                else if (peek && !missedItems.length) callout(lvl, "tip", "Good practice", "Everything’s there. Since you peeked, do one more without the outline to pass this level.");
                else callout(lvl, "warn", "Not yet", "It’s in your Study Plan’s mistake log. Reread the model answer, then try another prompt (tomorrow is even better).");
            });
        }

        if (CRAMLET.progress && CRAMLET.progress.onChange) CRAMLET.progress.onChange(() => { if (document.body.contains($(".pb-status"))) { status(); } });
        draw();
    }

    function renderList(main, ctx) {
        const { icon } = ctx;
        const K = CRAMLET.kitchen;
        main.innerHTML = `${K.header(ctx, "proofs")}
            <div class="kh-slim"><span class="kh-grow">Each proof climbs from <b>with hints</b> to <b>timed</b>. The reduction proof has two extra steps in between, <b>fill the blanks</b> and <b>outline only</b>, so the jump to a blank page is smaller. Only Timed counts as exam-ready.</span>${CRAMLET.plan && CRAMLET.plan.has(ctx.S) ? `<a class="btn ghost small" href="#/plan/proofs">${icon("calendar")} Study Plan</a>` : ""}</div>
            <div class="pb-list">${list().map(p => {
                const nx = nextName(ctx, p);
                return `<a class="pb-card" href="#/proofs/${p.id}"><span class="pb-ctitle">${p.title}</span>${levelsHTML(ctx, p, icon)}<span class="pb-cnext">${!nx ? `${icon("check")} Exam-ready` : `Next: ${nx} →`}</span></a>`;
            }).join("")}</div>`;
        K.mount(main);
    }

    CRAMLET.proofBox = { render, list, byId, level, taskDone, levelName, levelsHTML, nextName, LEVELS, has: S => !!(S.proofs && S.proofs.length) };
})();
