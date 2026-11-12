// Proof Box (#/proofs, a Test Kitchen tool): the proofs a course expects you to write, each climbing four levels.
//   1 With hints        done automatically when you finish any of its hint activities (progress award ids)
//   2 Build from steps  a proof puzzle (the course's "proof-puzzle" widget); done when it's solved
//   3 On your own       write the proof for a new prompt, then grade yourself with a checklist + model answer
//   4 Timed             the same against the clock, for a prompt you haven't written up yet
// A level counts as passed when every key checklist item is ticked (and, for Timed, you finished in time).
// Misses go into the Study Plan's mistake log. Saved in cramlet.proofs.<course> (this browser only).
//   registerProofs([{ id, title, topic, minutes, hints: [{ label, href, key }], puzzle, checklist, prompts }])
(function () {
    "use strict";

    const ST = () => (window.STUDY = window.STUDY || {});
    window.registerProofs = list => { ST().proofs = (ST().proofs || []).concat(list); };

    const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } };
    const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
    const KEY = course => `cramlet.proofs.${course}`;
    const LEVELS = ["With hints", "Build from steps", "On your own", "Timed"];
    const list = () => ST().proofs || [];
    const byId = id => list().find(p => p.id === id);

    function store(course) { return read(KEY(course), {}); }
    function rec(course, id) { const s = store(course); return s[id] || { attempts: [], used: [] }; }
    function saveRec(course, id, r) { const s = store(course); s[id] = r; write(KEY(course), s); }

    // Which levels are passed, as [l1, l2, l3, l4].
    function passed(ctx, p) {
        const course = ctx.COURSE || ctx.course;
        const keys = new Set(CRAMLET.progress ? CRAMLET.progress.keys() : []);
        const solved = read(`cramlet.${course}.solved`, []);
        const r = rec(course, p.id);
        return [
            (p.hints || []).some(h => keys.has(h.key)),
            !!(p.puzzle && solved.includes("proof-" + p.puzzle.id)),
            r.attempts.some(a => a.lvl === 3 && a.pass) || r.attempts.some(a => a.lvl === 4 && a.pass),
            r.attempts.some(a => a.lvl === 4 && a.pass),
        ];
    }
    // The highest level passed (0–4). A higher level counts even if you skipped a lower one.
    function level(ctx, id) { const p = byId(id); if (!p) return 0; const ps = passed(ctx, p); return ps.lastIndexOf(true) + 1; }
    function levelsHTML(lv, icon) {
        return `<span class="pb-lvls">${LEVELS.map((l, i) => `<span class="pb-lvl${i < lv ? " on" : i === lv ? " next" : ""}">${i < lv ? icon("check") : ""}${l}</span>`).join("")}</span>`;
    }

    // ---------- Pages ----------
    function render(main, ctx, parts) {
        const { S, COURSE, esc, icon } = ctx;
        const K = CRAMLET.kitchen;
        const p = parts[1] && byId(parts[1]);
        if (!p) return renderList(main, ctx);

        const r0 = rec(COURSE, p.id);
        let session = r0.active || null; // { lvl, prompt, start, text, graded, ticks }
        let timer = null;
        main.innerHTML = `${K.header(ctx, "proofs", { line: `${p.title}. Climb the four levels; only Timed counts as exam-ready.` })}
            <div class="kh-slim"><a class="btn ghost small" href="#/proofs">${icon("note-pencil")} All proofs</a><span class="kh-grow"></span><span class="pb-status"></span></div>
            <div class="pb-levels"></div>`;
        K.mount(main);
        const $ = s => main.querySelector(s);

        function status() { $(".pb-status").innerHTML = levelsHTML(level(ctx, p.id), icon); }
        function draw() {
            status();
            const ps = passed(ctx, p), r = rec(COURSE, p.id);
            const done = i => (ps[i] ? `<span class="pb-done">${icon("check")} Done</span>` : "");
            $(".pb-levels").innerHTML = `
                <section class="pb-level${ps[0] ? " passed" : ""}">
                    <h2><span class="pb-n">1</span> With hints ${done(0)}</h2>
                    <p>Work through a guided version first. Any one of these counts:</p>
                    <ul class="pb-hints">${(p.hints || []).map(h => `<li><a href="${h.href}">${h.label}</a></li>`).join("")}</ul>
                </section>
                <section class="pb-level${ps[1] ? " passed" : ""}">
                    <h2><span class="pb-n">2</span> Build from steps ${done(1)}</h2>
                    <p>Put the proof in order. Some steps don’t belong: leave them out.</p>
                    <div class="widget pb-puzzle" style="--c:var(--brand)"></div>
                </section>
                <section class="pb-level${ps[2] ? " passed" : ""}" id="pb-l3">
                    <h2><span class="pb-n">3</span> On your own ${done(2)}</h2>
                    ${sessionHTML(3)}
                </section>
                <section class="pb-level${ps[3] ? " passed" : ""}" id="pb-l4">
                    <h2><span class="pb-n">4</span> Timed (${p.minutes} min) ${done(3)}</h2>
                    ${sessionHTML(4)}
                </section>
                ${r.attempts.length ? `<section class="pb-level pb-history"><h2>Your attempts</h2><ul>${r.attempts.slice().reverse().slice(0, 8).map(a => {
                    const pr = p.prompts.find(x => x.id === a.prompt);
                    return `<li><span class="pb-tag ${a.pass ? "ok" : "no"}">${a.pass ? "Passed" : "Not yet"}</span> ${LEVELS[a.lvl - 1]} · ${new Date(a.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}${a.secs ? ` · ${Math.round(a.secs / 60)} min` : ""} · ${pr ? pr.task : ""}${a.missed && a.missed.length ? `<div class="pb-missed">Missed: ${a.missed.join("; ")}</div>` : ""}</li>`;
                }).join("")}</ul></section>` : ""}`;
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
            return lvl === 3 ? pool[0] : pool[pool.length > 1 ? 1 + Math.floor(Math.random() * (pool.length - 1)) : 0];
        }

        function sessionHTML(lvl) {
            if (!session || session.lvl !== lvl) {
                const intro = lvl === 3
                    ? "You’ll get a language you haven’t proved yet. Write the full proof (here or on paper), then grade it against the checklist and the model answer."
                    : `Same, but against a ${p.minutes}-minute clock, like on the exam. Close your notes first.`;
                return `<p>${intro}</p><button type="button" class="btn primary" data-start="${lvl}" ${session ? "disabled" : ""}>${icon(lvl === 4 ? "hourglass-medium" : "note-pencil")} ${session ? "Finish the open proof first" : "Start"}</button>`;
            }
            const pr = p.prompts.find(x => x.id === session.prompt);
            if (!session.graded) return `
                <div class="pb-task"><span class="pb-k">Prove it</span>${pr.task}</div>
                ${lvl === 4 ? `<div class="pb-timer" aria-live="off"></div>` : ""}
                <label class="pb-write"><span>Write your proof here, or on paper (this box is optional and only saved in this browser):</span>
                    <textarea rows="9" data-text>${esc(session.text || "")}</textarea></label>
                <div class="pb-acts"><button type="button" class="btn primary" data-grade>${icon("check")} I’m done: grade it</button><button type="button" class="btn ghost" data-quit>Give up for now</button></div>`;
            const over = lvl === 4 && session.secs > p.minutes * 60;
            return `
                <div class="pb-task"><span class="pb-k">Prove it</span>${pr.task}</div>
                ${lvl === 4 ? `<div class="pb-time ${over ? "over" : ""}">Time: ${Math.floor(session.secs / 60)}:${String(session.secs % 60).padStart(2, "0")} of ${p.minutes}:00${over ? ". Over time: this one doesn’t count as passed, but grade it anyway." : ""}</div>` : ""}
                <div class="pb-grade">
                    <div class="pb-col"><span class="pb-k">Grade your proof</span><p class="pb-hint">Tick only what your proof actually does. Starred items must all be ticked to pass.</p>
                        ${p.checklist.map((c, i) => `<label class="pb-item"><input type="checkbox" data-tick="${i}" ${session.ticks && session.ticks[i] ? "checked" : ""}> <span>${c.key ? "<b class=\"pb-star\">★</b> " : ""}${c.text}</span></label>`).join("")}
                        <div class="pb-acts"><button type="button" class="btn primary" data-save>Save my grade</button></div></div>
                    <div class="pb-col"><span class="pb-k">Model answer</span><div class="pb-model">${pr.model}</div>
                        ${session.text ? `<details class="pb-mine"><summary>Your answer</summary><pre>${esc(session.text)}</pre></details>` : ""}</div>
                </div>`;
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

        function wire() {
            main.querySelectorAll("[data-start]").forEach(b => b.addEventListener("click", () => {
                const lvl = +b.dataset.start, pr = pickPrompt(lvl);
                session = { lvl, prompt: pr.id, start: Date.now(), text: "", graded: false };
                persistSession(); draw();
                const sec = $(`#pb-l${lvl}`); if (sec) sec.scrollIntoView({ block: "start", behavior: "smooth" });
            }));
            const ta = main.querySelector("[data-text]");
            if (ta) { let tm; ta.addEventListener("input", () => { clearTimeout(tm); tm = setTimeout(() => { session.text = ta.value; persistSession(); }, 300); }); }
            const g = main.querySelector("[data-grade]");
            if (g) g.addEventListener("click", () => {
                if (ta) session.text = ta.value;
                session.secs = Math.round((Date.now() - session.start) / 1000);
                session.graded = true; session.ticks = {};
                persistSession(); clearInterval(timer); draw();
            });
            const q = main.querySelector("[data-quit]");
            if (q) q.addEventListener("click", () => { session = null; const r = rec(COURSE, p.id); delete r.active; saveRec(COURSE, p.id, r); clearInterval(timer); draw(); });
            main.querySelectorAll("[data-tick]").forEach(cb => cb.addEventListener("change", () => { session.ticks[cb.dataset.tick] = cb.checked; persistSession(); }));
            const sv = main.querySelector("[data-save]");
            if (sv) sv.addEventListener("click", () => {
                const missedItems = p.checklist.filter((c, i) => c.key && !session.ticks[i]).map(c => c.text.replace(/<[^>]+>/g, ""));
                const overtime = session.lvl === 4 && session.secs > p.minutes * 60;
                const pass = !missedItems.length && !overtime;
                const r = rec(COURSE, p.id);
                r.attempts.push({ lvl: session.lvl, prompt: session.prompt, at: Date.now(), secs: session.lvl === 4 ? session.secs : 0, pass, missed: missedItems.concat(overtime ? ["finished over time"] : []) });
                r.used = Array.from(new Set([...(r.used || []), session.prompt]));
                delete r.active; saveRec(COURSE, p.id, r);
                if (!pass) {
                    // Into the Study Plan's mistake log, so it comes back.
                    const plan = read(`cramlet.plan.${COURSE}`, {}); plan.mistakes = plan.mistakes || [];
                    const pr = p.prompts.find(x => x.id === session.prompt);
                    plan.mistakes.unshift({ q: `${pr.task.replace(/<[^>]+>/g, "")}: missed ${missedItems.length ? missedItems.join("; ") : "the time limit"}`, src: `Proof Box · ${LEVELS[session.lvl - 1]}`, topic: p.topic, why: overtime && !missedItems.length ? "time" : "setup", at: Date.now(), right: [], tries: [] });
                    write(`cramlet.plan.${COURSE}`, plan);
                } else if (CRAMLET.progress) CRAMLET.progress.award("challenge", `${COURSE}:proofbox:${p.id}:${session.lvl}`, { at: sv });
                const lvl = session.lvl;
                session = null; draw();
                const sec = $(`#pb-l${lvl}`);
                if (sec) sec.insertAdjacentHTML("beforeend", pass
                    ? `<div class="callout tip done">${icon("star", "callout-ic")}<div class="callout-body"><span class="callout-label">Passed</span>${lvl === 4 ? "That’s exam-ready. Come back in a couple of days and do another prompt to keep it there." : "Nice. When you feel ready, try it Timed."}</div></div>`
                    : `<div class="callout warn done">${icon("warning", "callout-ic")}<div class="callout-body"><span class="callout-label">Not yet</span>It’s in your Study Plan’s mistake log. Reread the model answer, then try another prompt (tomorrow is even better).</div></div>`);
            });
        }

        if (CRAMLET.progress && CRAMLET.progress.onChange) CRAMLET.progress.onChange(() => { if (document.body.contains($(".pb-status"))) { status(); } });
        draw();
    }

    function renderList(main, ctx) {
        const { icon } = ctx;
        const K = CRAMLET.kitchen;
        main.innerHTML = `${K.header(ctx, "proofs")}
            <div class="kh-slim"><span class="kh-grow">Each proof climbs four levels: <b>with hints</b>, <b>build from steps</b>, <b>on your own</b>, then <b>timed</b>. Only Timed counts as exam-ready.</span>${CRAMLET.plan && CRAMLET.plan.has(ctx.S) ? `<a class="btn ghost small" href="#/plan/proofs">${icon("calendar")} Study Plan</a>` : ""}</div>
            <div class="pb-list">${list().map(p => {
                const lv = level(ctx, p.id);
                return `<a class="pb-card" href="#/proofs/${p.id}"><span class="pb-ctitle">${p.title}</span>${levelsHTML(lv, icon)}<span class="pb-cnext">${lv >= 4 ? `${icon("check")} Exam-ready` : `Next: ${LEVELS[lv]} →`}</span></a>`;
            }).join("")}</div>`;
        K.mount(main);
    }

    CRAMLET.proofBox = { render, list, byId, level, levelsHTML, LEVELS, has: S => !!(S.proofs && S.proofs.length) };
})();
