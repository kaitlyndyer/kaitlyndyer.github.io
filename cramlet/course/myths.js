// Myth or fact: a rapid-fire round of true/false statements built from common misconceptions.
// A course adds statements with registerMyths([{ id, c, sec, s, fact, why }, ...]) in <course>/data/myths.js.
// Routes: #/myths (start), #/myths/play, #/myths/done.
// Saved per course in cramlet.myths.<course>: { stats: { id: { r, w, at } }, prefs, round }.
// Rounds put statements you've missed (or never seen) first, so repeat rounds drill your weak spots.
(function () {
    "use strict";

    const bank = [];
    window.registerMyths = list => { bank.push(...list); };

    const SECONDS = 15; // per statement, when the timer is on
    const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } };
    const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

    function render(main, ctx, parts) {
        const { S, COURSE, esc, icon, conceptById, celebrate, setKeyHandler } = ctx;
        const K = CRAMLET.kitchen;
        const KEY = `cramlet.myths.${COURSE}`;
        const buddy = CRAMLET.buddy, progress = CRAMLET.progress;
        const state = () => read(KEY, { stats: {}, prefs: {} });
        const save = st => write(KEY, st);
        const byId = Object.fromEntries(bank.map(m => [m.id, m]));
        const weak = st => bank.filter(m => { const x = st.stats[m.id]; return x && x.w > 0 && x.last === false; });
        let timer = null;
        const stopTimer = () => { if (timer) { clearInterval(timer); timer = null; } };

        // Missed last time first, then never seen, then the rest (least recently seen first), each group shuffled.
        function buildRound(size, only) {
            const st = state();
            const pool = only ? only.map(id => byId[id]).filter(Boolean) : bank.slice();
            const rank = m => { const x = st.stats[m.id]; return !x ? 1 : x.last === false ? 0 : 2; };
            const groups = [0, 1, 2].map(r => shuffle(pool.filter(m => rank(m) === r)));
            groups[2].sort((a, b) => (st.stats[a.id].at || 0) - (st.stats[b.id].at || 0));
            return shuffle(groups.flat().slice(0, size || pool.length)).map(m => m.id);
        }

        // ---------- Start ----------
        function drawStart() {
            const st = state(), prefs = st.prefs || {}, w = weak(st);
            const seen = bank.filter(m => st.stats[m.id]).length;
            const sizes = [[15, "Quick round", "15 statements"], [30, "Long round", "30 statements"], [0, "Everything", `All ${bank.length} statements`]];
            const size = sizes.some(s => s[0] === prefs.size) ? prefs.size : 15;
            main.innerHTML = `
                <div class="exam-start myths">
                    ${K ? K.header(ctx, "myths", { line: "Rapid-fire statements built from the traps behind wrong answers, like “compareTo returns -1” or “records have setters.” Decide fast, and every answer comes with the reason." }) : `<div class="exam-hero"><div>
                        <h1>${icon("lightbulb")} Myth or fact?</h1>
                        <p>Rapid-fire statements built from the misconceptions that wrong exam answers are made of, like “compareTo returns -1” or “records have setters.” Decide fast: <b>myth</b> or <b>fact</b>. Every answer comes with the reason, so you learn the trap, not just the answer.</p>
                    </div></div>`}
                    <div class="build-actions${K ? " kh-slim" : ""}">
                        ${K ? `<span class="kh-label">Seen</span><span class="kh-grow"><b>${seen}</b> of ${bank.length}${w.length ? ` · ${w.length} missed last time` : ""}. Missed ones come first in every round.</span>` : ""}
                        <button type="button" class="btn primary" data-act="start">${icon("lightbulb")} Start a round</button>
                        ${w.length ? `<button type="button" class="btn" data-act="weak">${icon("arrow-clockwise")} Just the ones I missed · ${w.length}</button>` : ""}
                        ${st.round && st.round.pos < st.round.ids.length ? `<button type="button" class="btn ghost" data-act="resume">Continue my round (${st.round.pos} of ${st.round.ids.length})</button>` : ""}
                    </div>
                    <div class="exam-setup">
                        <div class="side-box"><div class="side-title">Round</div>
                            <div class="exam-lengths">${sizes.map(([n, name, sub]) => `<label class="exam-len"><input type="radio" name="myth-size" value="${n}" ${n === size ? "checked" : ""}><span><b>${name}</b><small>${sub}</small></span></label>`).join("")}</div>
                        </div>
                        <div class="side-box"><div class="side-title">Options</div>
                            <label class="exam-len"><input type="checkbox" name="myth-timer" ${prefs.timer !== false ? "checked" : ""}><span><b>Beat the clock</b><small>${SECONDS} seconds per statement; running out counts as a miss</small></span></label>
                            <p class="muted myth-keys">Keys: <kbd>M</kbd> or <kbd>←</kbd> for myth, <kbd>F</kbd> or <kbd>→</kbd> for fact, <kbd>Enter</kbd> for the next one.</p>
                            ${K ? "" : `<p class="muted">You’ve seen ${seen} of ${bank.length}. Statements you missed come first in every round.</p>`}
                        </div>
                    </div>
                </div>`;
            if (K) K.mount(main);
            main.querySelector(".myths").addEventListener("click", e => {
                const t = e.target.closest("button[data-act]");
                if (!t) return;
                const s = state();
                const n = +main.querySelector("[name=myth-size]:checked").value, timed = main.querySelector("[name=myth-timer]").checked;
                s.prefs = { size: n, timer: timed };
                if (t.dataset.act !== "resume") s.round = { ids: t.dataset.act === "weak" ? buildRound(0, weak(s).map(m => m.id)) : buildRound(n), pos: 0, picks: [], timed, streak: 0, best: 0 };
                save(s);
                location.hash = "#/myths/play";
            });
        }

        // ---------- Play ----------
        function drawPlay() {
            const st = state(), R = st.round;
            if (!R || !R.ids.length) { location.hash = "#/myths"; return; }
            if (R.pos >= R.ids.length) { location.hash = "#/myths/done"; return; }
            const m = byId[R.ids[R.pos]];
            if (!m) { R.pos++; save(st); return drawPlay(); }
            const c = conceptById[m.c];
            const right = R.picks.filter(p => p.ok).length;
            main.innerHTML = `
                <div class="myth-play" style="--c:${c ? c.color : "var(--brand)"}">
                    <div class="quiz-progress">
                        <span>Statement ${R.pos + 1} of ${R.ids.length}</span>
                        <div class="bar"><div style="width:${(R.pos / R.ids.length) * 100}%"></div></div>
                        <span class="myth-score">${icon("check-circle")} ${right}</span>
                        <span class="myth-streak${R.streak >= 3 ? " hot" : ""}" title="Right in a row">${icon("fire")} ${R.streak}</span>
                        <a class="btn ghost small" href="#/myths" title="Leave the round. Your place is saved.">${icon("x-circle")} Exit</a>
                    </div>
                    <div class="myth-card">
                        ${c ? `<span class="myth-concept">${icon(c.icon)} ${esc(c.title)}</span>` : ""}
                        <div class="myth-s">${m.s}</div>
                        ${R.timed ? `<div class="myth-clock"><div></div></div>` : ""}
                        <div class="myth-btns">
                            <button type="button" class="myth-btn myth" data-pick="myth">${icon("x-circle")} Myth <kbd>M</kbd></button>
                            <button type="button" class="myth-btn fact" data-pick="fact">${icon("check-circle")} Fact <kbd>F</kbd></button>
                        </div>
                        <div class="feedback" hidden></div>
                        <div class="quiz-next" hidden><button type="button" class="btn primary" data-next>${R.pos + 1 < R.ids.length ? "Next →" : "See how you did"}</button></div>
                    </div>
                </div>`;
            let answered = false;
            const answer = pick => {
                if (answered) return;
                answered = true;
                stopTimer();
                const s = state(), r = s.round;
                const ok = pick !== null && (pick === "fact") === m.fact;
                r.picks.push({ id: m.id, ok, pick });
                r.streak = ok ? r.streak + 1 : 0;
                r.best = Math.max(r.best, r.streak);
                const x = s.stats[m.id] || { r: 0, w: 0 };
                if (ok) x.r++; else x.w++;
                x.last = ok; x.at = Date.now();
                s.stats[m.id] = x;
                r.pos++;
                save(s);
                main.querySelectorAll(".myth-btn").forEach(b => {
                    b.disabled = true;
                    if ((b.dataset.pick === "fact") === m.fact) b.classList.add("correct");
                    else if (b.dataset.pick === pick) b.classList.add("wrong");
                });
                const fb = main.querySelector(".feedback");
                fb.hidden = false;
                fb.className = "feedback " + (ok ? "good" : "bad");
                fb.innerHTML = `<span class="fb-av"></span><div class="fb-text"><b>${pick === null ? "Time’s up!" : esc(buddy.say(ok ? "right" : "wrong"))}</b> It’s a <b>${m.fact ? "fact" : "myth"}</b>. ${m.why}
                    ${c ? `<a class="related-chip myth-review" href="#/c/${c.id}/details/${m.sec || ""}">${icon("note")} Review ${esc((((S.content[c.id] || {}).details || []).find(d => d.id === m.sec) || c).title)}</a>` : ""}</div>`;
                buddy.react(fb.querySelector(".fb-av"), ok ? "happy" : "oops", ok ? "bounce" : "wobble");
                const next = main.querySelector(".quiz-next");
                next.hidden = false;
                next.querySelector("button").focus();
                if (ok) {
                    celebrate(main.querySelector(".myth-btn.correct"));
                    progress.award("answer", `${COURSE}:myth:${m.id}`, { correct: true, at: fb });
                }
                main.querySelector(".myth-streak").innerHTML = `${icon("fire")} ${r.streak}`;
                main.querySelector(".myth-streak").classList.toggle("hot", r.streak >= 3);
                main.querySelector(".myth-score").innerHTML = `${icon("check-circle")} ${r.picks.filter(p => p.ok).length}`;
            };
            main.querySelectorAll(".myth-btn").forEach(b => b.addEventListener("click", () => answer(b.dataset.pick)));
            main.querySelector("[data-next]").addEventListener("click", () => drawPlay());
            setKeyHandler(e => {
                if (e.metaKey || e.ctrlKey || e.altKey) return;
                const k = e.key.toLowerCase();
                if (!answered && (k === "m" || k === "arrowleft")) { e.preventDefault(); answer("myth"); }
                else if (!answered && (k === "f" || k === "arrowright")) { e.preventDefault(); answer("fact"); }
                else if (answered && (k === "enter" || k === " ") && document.activeElement && !document.activeElement.matches("[data-next]")) { e.preventDefault(); drawPlay(); }
            });
            if (R.timed) {
                const bar = main.querySelector(".myth-clock div"), end = Date.now() + SECONDS * 1000;
                timer = setInterval(() => {
                    if (!document.body.contains(bar)) return stopTimer();
                    const left = Math.max(0, end - Date.now());
                    bar.style.width = (left / (SECONDS * 1000)) * 100 + "%";
                    bar.classList.toggle("low", left < 5000);
                    if (!left) answer(null);
                }, 100);
            }
        }

        // ---------- Done ----------
        function drawDone() {
            const st = state(), R = st.round;
            if (!R || !R.picks.length) { location.hash = "#/myths"; return; }
            const right = R.picks.filter(p => p.ok).length, n = R.picks.length, pct = Math.round((right / n) * 100);
            const missed = R.picks.filter(p => !p.ok).map(p => ({ ...p, m: byId[p.id] })).filter(p => p.m);
            if (!R.awarded) {
                progress.award("quiz", `${COURSE}:myths`, {});
                if (right === n && n >= 10) progress.award("perfect", `${COURSE}:myths`, {});
                R.awarded = true;
                save(st);
            }
            const mood = pct === 100 ? ["cheer", "party", "perfect"] : pct >= 80 ? ["happy", "bounce", "good"] : ["idle", "bounce", "keepGoing"];
            main.innerHTML = `
                <div class="exam-results myths">
                    <div class="exam-hero res with-buddy">
                        <div class="score-ring" style="--p:${pct}"><span>${pct}%</span></div>
                        <div><h1>${pct === 100 ? "No myth got past you!" : pct >= 80 ? "Sharp eye." : "Good practice. Here are the traps that got you."}</h1>
                            <p>${right} of ${n} right · best streak ${R.best}${R.timed ? ` · ${SECONDS}-second timer` : ""}</p>
                            <div class="build-actions">
                                ${missed.length ? `<button type="button" class="btn primary" data-act="retry">${icon("arrow-clockwise")} Retry the ${missed.length} I missed</button>` : ""}
                                <button type="button" class="btn${missed.length ? "" : " primary"}" data-act="again">${icon("lightbulb")} New round</button>
                            </div></div>
                        <div class="res-buddy"><div class="end-buddy"></div><p class="buddy-say">${esc(buddy.say(mood[2]))}</p></div>
                    </div>
                    ${missed.length ? `<h2 class="panel-title">The ones that got you</h2>
                    <div class="myth-missed">${missed.map(({ m, pick }) => { const c = conceptById[m.c]; return `
                        <div class="myth-miss" style="--c:${c ? c.color : "var(--brand)"}">
                            <div class="myth-s">${m.s}</div>
                            <p><span class="tag ${m.fact ? "yes" : "no"}">${m.fact ? "Fact" : "Myth"}</span>${pick === null ? ` <span class="muted">(ran out of time)</span>` : ""} ${m.why}</p>
                            ${c ? `<a class="related-chip" href="#/c/${c.id}/details/${m.sec || ""}">${icon(c.icon)} ${esc(c.title)}</a>` : ""}
                        </div>`; }).join("")}</div>` : ""}
                </div>`;
            buddy.react(main.querySelector(".end-buddy"), mood[0], mood[1]);
            if (pct === 100) celebrate(main.querySelector(".score-ring"));
            main.querySelector(".myths").addEventListener("click", e => {
                const t = e.target.closest("button[data-act]");
                if (!t) return;
                const s = state();
                if (t.dataset.act === "retry") s.round = { ids: buildRound(0, missed.map(p => p.id)), pos: 0, picks: [], timed: R.timed, streak: 0, best: 0 };
                else { save(s); location.hash = "#/myths"; return; }
                save(s);
                location.hash = "#/myths/play";
            });
        }

        stopTimer();
        if (parts[1] === "play") drawPlay();
        else if (parts[1] === "done") drawDone();
        else drawStart();
    }

    // Statements this course's visitor got wrong the last time they saw them (for the night-before review).
    const missed = course => { const st = read(`cramlet.myths.${course}`, { stats: {} }); return bank.filter(m => { const x = (st.stats || {})[m.id]; return x && x.last === false; }); };

    // For the Test Kitchen overview: how many statements you've seen, and how many got you last time.
    const progress = course => { const st = read(`cramlet.myths.${course}`, { stats: {} }), stats = st.stats || {}; return { seen: bank.filter(m => stats[m.id]).length, total: bank.length, missed: missed(course).length }; };

    window.CRAMLET = Object.assign(window.CRAMLET || {}, { myths: { render, count: () => bank.length, missed, get: id => bank.find(m => m.id === id), progress } });
})();
