// Study Plan (#/plan): a day-by-day plan to an exam, a five-step ladder for every topic, a mistake log, practice-exam
// scores and notes. Course-agnostic: a course registers its plan, videos and proofs in its data files.
//   registerPlan({ exam: { title, date, scope }, topics: [...], days: [...] })   (see toc/data/plan.js)
//   registerVideos([{ id, title, by, yt, start?, end?, concept, secs?, role, why, warn? }])
//   registerProofs([...])                                                        (course/proofbox.js)
// Most of the page fills itself in from what you do elsewhere in cramlet: videos you mark watched, concepts you
// visit, walkthroughs and "Your turn" boxes you finish (progress awards), Proof Box levels, quiz bests, practice-exam
// scores and the missed deck. Everything you type or tick here is saved in this browser: cramlet.plan.<course>.
(function () {
    "use strict";

    // Always look STUDY up when needed: data/course.js replaces the object when it loads.
    const ST = () => (window.STUDY = window.STUDY || {});
    window.registerPlan = p => { ST().plan = p; };
    window.registerVideos = list => { ST().videos = (ST().videos || []).concat(list); };

    const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } };
    const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
    const pad = n => String(n).padStart(2, "0");
    const dayKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const today = () => dayKey(new Date());
    const parseDay = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
    const daysBetween = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 86400000);
    const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const short = s => { const d = parseDay(s); return `${DOW[d.getDay()]} ${d.getDate()}`; };
    const long = s => { const d = parseDay(s); return `${DOW[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`; };
    const mmss = s => `${Math.floor(s / 60)}:${pad(s % 60)}`;

    // ---------- Videos (also used by concept pages) ----------
    const videoById = id => (ST().videos || []).find(v => v.id === id);
    const videoUrl = v => `https://www.youtube.com/watch?v=${v.yt}${v.start ? `&t=${v.start}s` : ""}`;
    const videoMins = v => (v.end ? Math.max(1, Math.round((v.end - (v.start || 0)) / 60)) : null);
    const clipLabel = v => (v.end ? `${mmss(v.start || 0)}–${mmss(v.end)}` : "whole video");
    const videosFor = (concept, sec) => (ST().videos || []).filter(v => v.concept === concept && (sec ? (v.secs || []).includes(sec) : true));

    // ---------- Saved state ----------
    const KEY = course => `cramlet.plan.${course}`;
    function state(course) {
        const s = read(KEY(course), {});
        ["done", "doneOn", "moved", "steps", "conf", "watched", "notes", "revealed"].forEach(k => { s[k] = s[k] || {}; });
        ["mistakes", "oh", "scores"].forEach(k => { s[k] = s[k] || []; });
        return s;
    }
    const save = (course, s) => write(KEY(course), s);
    function markWatched(course, id, on = true) {
        const s = state(course);
        if (on) s.watched[id] = Date.now(); else delete s.watched[id];
        save(course, s);
    }

    // ---------- What cramlet already knows ----------
    function facts(ctx) {
        const { S: St, COURSE } = ctx;
        const keys = new Set(CRAMLET.progress ? CRAMLET.progress.keys() : []);
        const visits = (read("cramlet.visits", {})[COURSE]) || {};
        const store = read(St.course.storeKey, {});
        const quizBest = store.quizBest || {};
        const latest = CRAMLET.exam ? CRAMLET.exam.latest(COURSE) : null;
        const examBy = {};
        if (latest) latest.items.forEach(x => { const g = examBy[x.concept] = examBy[x.concept] || { earned: 0, max: 0 }; g.earned += x.earned; g.max += x.max; });
        return { keys, visits, quizBest, latest, examBy, plan: state(COURSE), proofLevel: id => (CRAMLET.proofBox ? CRAMLET.proofBox.level(ctx, id) : 0) };
    }

    // The five steps for one topic: each is 0 (not yet), 1 (you ticked it) or 2 (cramlet filled it in).
    const STEPS = ["Seen it", "Explain it", "Do it with help", "Do it alone", "Exam-ready"];
    const STEP_HOW = [
        "Watch one of its videos (mark it watched), or open its lesson.",
        "Say each “Explain it” answer out loud without notes, then check it against the model answer.",
        "Finish one of its walkthroughs, “Your turn” boxes or proof puzzles.",
        "Write one of its Proof Box proofs on your own (or score 80%+ on its concept quiz).",
        "Do a timed Proof Box proof and score 80%+ on it in a practice exam.",
    ];
    function topicScore(F, t) {
        let e = 0, m = 0;
        (t.concepts || []).forEach(c => { const g = F.examBy[c]; if (g) { e += g.earned; m += g.max; } });
        if (m) return { pct: Math.round((e / m) * 100), from: "exam" };
        const qs = (t.concepts || []).map(c => F.quizBest[c]).filter(Boolean);
        if (qs.length) { const r = qs.reduce((a, q) => a + q.right, 0), n = qs.reduce((a, q) => a + q.total, 0); return { pct: Math.round((r / n) * 100), from: "quiz" }; }
        return null;
    }
    function ladder(F, t) {
        const self = F.plan.steps[t.id] || {};
        const proofs = t.proofs || [];
        const maxProof = proofs.reduce((a, p) => Math.max(a, F.proofLevel(p)), 0);
        const seen = (t.videos || []).some(v => F.plan.watched[v]) || (t.concepts || []).some(c => F.visits[c]);
        const help = (t.help || []).some(k => F.keys.has(k)) || maxProof >= 1;
        const quizOk = (t.concepts || []).some(c => { const q = F.quizBest[c]; return q && q.right / q.total >= 0.8; });
        const alone = proofs.length ? maxProof >= 3 : quizOk;
        let examOk = false, examSeen = false;
        (t.concepts || []).forEach(c => { const g = F.examBy[c]; if (g && g.max) { examSeen = true; if (g.earned / g.max >= 0.8) examOk = true; } });
        const ready = (proofs.length ? maxProof >= 4 : true) && examSeen && examOk;
        const auto = [seen, false, help, alone, ready];
        return auto.map((a, i) => (a ? 2 : self[i] ? 1 : 0));
    }

    // Is a task done? (Ticked by hand, or cramlet saw you do it.)
    // done[id] is true (you ticked it) or false (you unticked something cramlet ticked).
    function taskDone(F, task) {
        if (task.id in F.plan.done) return !!F.plan.done[task.id];
        return autoDone(F, task);
    }
    function autoDone(F, task) {
        if (task.kind === "watch") return !!F.plan.watched[task.video];
        if (task.kind === "prove") return F.proofLevel(task.proof) >= task.level;
        if (task.kind === "explain") return !!((F.plan.steps[task.topic] || {})[1]);
        if (task.key) return F.keys.has(task.key);
        return false;
    }
    // Days with their tasks, after "Move to ...". Past days drop off the plan:
    // anything left undone on them rolls into today and counts as "behind".
    // moved[id] is a date (older saves used a day index).
    function schedule(F) {
        const all = ST().plan.days, T = today();
        const days = all.map(d => ({ ...d, tasks: [] }));
        const first = all.findIndex(d => d.date >= T); // -1 once the exam is over
        all.forEach((d, di) => d.tasks.forEach(task => {
            const to = F.plan.moved[task.id];
            let idx = typeof to === "string" ? all.findIndex(x => x.date === to) : to !== undefined ? Math.min(Math.max(+to, 0), all.length - 1) : di;
            if (idx < 0) idx = di;
            let late = false;
            if (first > 0 && idx < first) {
                if (taskDone(F, task) && F.plan.doneOn[task.id] !== T) return; // finished before today: it leaves with its day
                idx = first; late = true;
            }
            days[idx].tasks.push({ ...task, from: idx !== di ? d.date : null, late });
        }));
        // Leftovers go first, so they're the next thing to do.
        days.forEach(d => d.tasks.sort((a, b) => b.late - a.late));
        return first > 0 ? days.slice(first) : days;
    }
    const lateTasks = F => { const d = schedule(F)[0]; return d ? d.tasks.filter(t => t.late && !taskDone(F, t)) : []; };

    // ---------- Rendering ----------
    function render(main, ctx, parts) {
        const { S: St, COURSE, esc, icon } = ctx;
        const P = St.plan;
        const topicById = Object.fromEntries(P.topics.map(t => [t.id, t]));
        let F = facts(ctx);
        const st = () => F.plan;
        const persist = () => { save(COURSE, F.plan); };
        const T = today();
        const days = () => schedule(F);
        const todayIdx = () => { const ds = days(); const i = ds.findIndex(d => d.date === T); return i >= 0 ? i : T < ds[0].date ? 0 : ds.length - 1; };
        let sel = st().selDay && days().some(d => d.date === st().selDay) ? st().selDay : days()[todayIdx()].date;
        let openTopic = null, mf = "open", logOpen = false;

        main.innerHTML = `<div class="plan">
            <section class="pl-hero"></section>
            <section class="pl-card" id="pl-week" aria-labelledby="pl-week-h"></section>
            <section class="pl-card" id="pl-topics" aria-labelledby="pl-topics-h"></section>
            <section class="pl-card" id="pl-mistakes" aria-labelledby="pl-mis-h"></section>
            <section class="pl-card" id="pl-proofs" aria-labelledby="pl-proofs-h"></section>
            <div class="pl-two"><section class="pl-card" id="pl-scores"></section><section class="pl-card" id="pl-notes"></section></div>
        </div>`;
        const $ = s => main.querySelector(s);
        const refresh = () => { F = facts(ctx); drawHero(); drawWeek(); drawTopics(); drawMistakes(); drawProofs(); drawScores(); };

        // ----- Hero -----
        function drawHero() {
            const left = daysBetween(T, P.exam.date);
            const lad = P.topics.map(t => ladder(F, t));
            const filled = lad.reduce((a, l) => a + l.filter(Boolean).length, 0), total = P.topics.length * 5;
            const ready = lad.filter(l => l[4]).length;
            const pct = Math.round((filled / total) * 100);
            const ds = days(), ti = todayIdx(), todayTasks = ds[ti].tasks, leftToday = todayTasks.filter(t => !taskDone(F, t));
            const weakest = P.topics.map((t, i) => ({ t, n: lad[i].filter(Boolean).length })).sort((a, b) => a.n - b.n)[0];
            const nextTask = leftToday[0];
            const late = lateTasks(F), lateMin = late.reduce((a, t) => a + taskMins(t), 0);
            const say = left < 0 ? "The exam is over. Look back at what worked, and take a breath."
                : left === 0 ? "Exam day! Do the Morning-of Crumb Run, eat something, and trust the work you did."
                : late.length ? `You’re a bit behind: ${late.length} task${late.length > 1 ? "s" : ""} from earlier day${late.length > 1 ? "s" : ""} moved to today. Do them first, or spread them out below.`
                : leftToday.length ? `${leftToday.length} task${leftToday.length > 1 ? "s" : ""} left today.${leftToday.some(t => t.kind === "prove") ? " The proof one counts the most." : ""}`
                : "Today’s plan is done. Sleep is part of studying, too.";
            $(".pl-hero").innerHTML = `
                <div class="pl-hero-text">
                    <div class="pl-eyebrow">${icon("calendar")} Study Plan · ${esc(P.exam.title)}</div>
                    <h1>${esc(P.exam.title)}: ${long(P.exam.date)}</h1>
                    <p class="pl-scope">${P.exam.scope}</p>
                    <div class="pl-pills">
                        <span class="pl-pill">${left > 1 ? `${left} days left` : left === 1 ? "Tomorrow!" : left === 0 ? "Today" : "Done"}</span>
                        ${late.length ? `<span class="pl-pill behind">Behind: ${late.length} task${late.length > 1 ? "s" : ""} · ${lateMin} min</span>` : `<span class="pl-pill ontrack">On track</span>`}
                        <span class="pl-pill">${filled} of ${total} steps</span>
                        <span class="pl-pill">${ready} of ${P.topics.length} topics exam-ready</span>
                    </div>
                    <div class="pl-next">
                        <div class="pl-ring" style="--p:${pct}" role="img" aria-label="${pct}% of all topic steps done"><b>${pct}%</b></div>
                        <div>
                            <div class="pl-k">Do next</div>
                            ${nextTask ? `<div>${taskLink(nextTask, true)}</div>` : `<div>Nothing pending. Work on your weakest topic: <a href="#/plan/topics" data-open-topic="${weakest.t.id}">${weakest.t.title}</a>.</div>`}
                            <div class="muted pl-weak">Weakest topic: <a href="#/plan/topics" data-open-topic="${weakest.t.id}">${weakest.t.title}</a></div>
                        </div>
                    </div>
                </div>
                <div class="pl-buddy"><div class="pl-av"></div><div class="pl-say">${say}</div></div>`;
            if (CRAMLET.buddy) CRAMLET.buddy.react($(".pl-av"), late.length ? "idle" : leftToday.length ? "happy" : "cheer", "bounce");
        }

        // A task's title, as a link to where you do it.
        function taskTitle(task) {
            if (task.kind === "watch") { const v = videoById(task.video); return v ? `Watch: ${v.title}` : "Watch"; }
            if (task.kind === "prove") { const p = CRAMLET.proofBox && CRAMLET.proofBox.byId(task.proof); return p ? `${["", "With hints", "Build from steps", "On your own", "Timed"][task.level]}: ${p.title}` : "Proof Box"; }
            if (task.kind === "explain") { const t = topicById[task.topic]; return `Explain it out loud: ${t ? t.title : ""}`; }
            return task.title;
        }
        function taskHref(task) {
            if (task.kind === "watch") { const v = videoById(task.video); return v ? videoUrl(v) : "#/plan"; }
            if (task.kind === "prove") return `#/proofs/${task.proof}`;
            if (task.kind === "explain") return "#/plan/topics";
            return task.href;
        }
        function taskLink(task, withKind) {
            const ext = task.kind === "watch";
            return `${withKind ? `<span class="pl-kind k-${task.kind}">${KIND[task.kind]}</span> ` : ""}<a href="${taskHref(task)}"${ext ? ' target="_blank" rel="noopener"' : ""}${task.kind === "explain" ? ` data-open-topic="${task.topic}"` : ""}>${taskTitle(task)}${ext ? " ↗" : ""}</a>`;
        }
        const KIND = { watch: "Watch", learn: "Learn", practice: "Practice", prove: "Prove", explain: "Explain", review: "Review", exam: "Exam" };
        const taskMins = task => (task.kind === "watch" ? videoMins(videoById(task.video)) || 10 : task.min || 10);

        // ----- Week + selected day's tasks -----
        function drawWeek() {
            const ds = days(), d = ds.find(x => x.date === sel) || ds[0], di = ds.indexOf(d);
            const left = d.tasks.filter(t => !taskDone(F, t)).reduce((a, t) => a + taskMins(t), 0);
            const late = lateTasks(F), spreadTo = ds.filter(x => !x.exam).length;
            $("#pl-week").innerHTML = `
                <div class="pl-h"><h2 id="pl-week-h">This week</h2><span class="pl-sub">Tap a day to see its tasks. Past days drop off, and anything you didn’t finish moves to today.</span></div>
                ${late.length ? `<div class="pl-behind">${icon("warning")}<div><b>You’re behind by ${late.length} task${late.length > 1 ? "s" : ""}</b> (about ${late.reduce((a, t) => a + taskMins(t), 0)} min). They’re at the top of today’s list.</div>${late.length > 1 && spreadTo > 1 ? `<button type="button" class="pl-link" data-spread="1">Spread them over the next ${spreadTo} days</button>` : ""}</div>` : ""}
                <div class="pl-days" style="grid-template-columns:repeat(${ds.length}, minmax(0, 1fr))">${ds.map(x => {
                    const n = x.tasks.length, k = x.tasks.filter(t => taskDone(F, t)).length, behind = x.tasks.some(t => t.late && !taskDone(F, t));
                    return `<button type="button" class="pl-day${x.date === sel ? " sel" : ""}${x.exam ? " exam" : ""}${x.date === T ? " today" : ""}${behind ? " behind" : ""}" data-day="${x.date}" aria-pressed="${x.date === sel}">
                        <span class="pl-dname">${short(x.date)}${x.date === T ? " · today" : ""}</span><span class="pl-dfocus">${x.focus}</span>
                        <span class="pl-bar"><i style="width:${n ? (k / n) * 100 : 0}%"></i></span></button>`;
                }).join("")}</div>
                <div class="pl-h pl-dayh"><h3>${d.date === T ? "Today · " : ""}${long(d.date)}: ${d.focus}</h3><span class="pl-sub">${left ? `about ${left} min left` : "All done ✓"}</span></div>
                <div class="pl-tasks">${d.tasks.map(task => {
                    const done = taskDone(F, task), v = task.kind === "watch" ? videoById(task.video) : null;
                    const isAuto = done && !(task.id in st().done), unticked = !done && st().done[task.id] === false && autoDone(F, task);
                    return `<div class="pl-task${done ? " done" : ""}${task.late && !done ? " late" : ""}">
                        <button type="button" class="pl-check" data-task="${task.id}" aria-pressed="${done}" aria-label="${done ? "Mark not done" : "Mark done"}: ${esc(taskTitle(task).replace(/<[^>]+>/g, ""))}" title="${isAuto ? "Cramlet saw you do this. Click to untick it." : done ? "Click to untick" : "Click to tick"}">${icon("check")}</button>
                        <span class="pl-kind k-${task.kind}">${KIND[task.kind]}</span>
                        <div class="pl-tbody">
                            <div class="pl-ttitle">${taskLink(task, false)}</div>
                            ${v ? `<div class="pl-tsub">${esc(v.by)} · ${clipLabel(v)} · ${v.why}</div>${v.warn ? `<div class="pl-warn">${icon("warning")} ${v.warn}</div>` : ""}` : ""}
                            ${task.kind === "explain" ? `<div class="pl-tsub">Open the topic and answer each prompt aloud before revealing the model answer.</div>` : ""}
                            ${task.late && !done ? `<div class="pl-tsub pl-late">${icon("warning")} Left over from ${short(task.from)}</div>` : task.from ? `<div class="pl-tsub">Moved from ${short(task.from)}</div>` : ""}
                            ${isAuto ? `<div class="pl-tsub pl-auto">${icon("check")} Cramlet saw you do this · click the box to untick</div>` : ""}
                            ${unticked ? `<div class="pl-tsub">You unticked this. <button type="button" class="pl-link" data-reauto="${task.id}">Let Cramlet track it again</button></div>` : ""}
                        </div>
                        <div class="pl-tside">
                            <span class="pl-mins">${taskMins(task)} min</span>
                            ${v ? `<button type="button" class="pl-link" data-watched="${v.id}">${st().watched[v.id] ? "Watched ✓" : "I watched it"}</button>` : ""}
                            ${!done && di < ds.length - 1 && !ds[di + 1].exam ? `<button type="button" class="pl-link" data-move="${task.id}" data-to="${ds[di + 1].date}">Move to ${short(ds[di + 1].date)} →</button>` : ""}
                        </div>
                    </div>`;
                }).join("")}</div>`;
        }

        // ----- Topics, step by step -----
        function drawTopics() {
            $("#pl-topics").innerHTML = `
                <div class="pl-h"><h2 id="pl-topics-h">Topics, step by step</h2><span class="pl-sub">Every topic climbs the same five steps. Open a topic for its videos, lessons, prompts and proofs.</span></div>
                <div class="pl-key">${STEPS.map((s, i) => `<span><b>${i + 1}</b> ${s}</span>`).join("")}<span><i class="pl-dot auto"></i> filled in by cramlet</span><span><i class="pl-dot self"></i> you ticked it</span></div>
                <div class="table-wrap"><table class="pl-table">
                    <thead><tr><th>Topic</th><th>Steps</th><th>Confidence</th><th>Score</th><th></th></tr></thead>
                    <tbody>${P.topics.map(t => {
                        const l = ladder(F, t), sc = topicScore(F, t), conf = st().conf[t.id] || 0;
                        const missing = (t.concepts || []).some(c => !St.content[c]);
                        return `<tr class="pl-trow${openTopic === t.id ? " open" : ""}" data-topic="${t.id}">
                            <td><button type="button" class="pl-tname" data-toggle="${t.id}" aria-expanded="${openTopic === t.id}">${t.title}</button> <span class="pl-lec">${t.lec}</span>${t.badge ? ` <span class="pl-badge">${t.badge}</span>` : ""}${missing ? ` <span class="pl-soon">lesson coming</span>` : ""}</td>
                            <td><div class="pl-steps">${l.map((v, i) => `<button type="button" class="pl-st${v ? " on" : ""}${v === 2 ? " auto" : ""}" data-step="${t.id}:${i}" ${v === 2 ? "disabled" : ""} title="${STEPS[i]}${v === 2 ? ": filled in by cramlet" : v === 1 ? ": you ticked it (click to undo)" : `: ${STEP_HOW[i]}`}" aria-label="${t.title.replace(/<[^>]+>/g, "")}, step ${i + 1}, ${STEPS[i]}${v ? ", done" : ""}">${i + 1}</button>`).join("")}</div></td>
                            <td><div class="pl-conf" role="group" aria-label="How confident are you?">${[1, 2, 3].map(c => `<button type="button" class="${conf === c ? "on" : ""}" data-conf="${t.id}:${c}" title="${["", "Shaky", "Getting there", "Confident"][c]}">${c}</button>`).join("")}</div></td>
                            <td>${sc ? `<span class="pl-score ${sc.pct < 60 ? "low" : sc.pct < 80 ? "mid" : "hi"}" title="From your ${sc.from === "exam" ? "latest practice exam" : "best concept quiz"}">${sc.pct}%</span>` : `<span class="muted">–</span>`}</td>
                            <td><button type="button" class="pl-link" data-toggle="${t.id}">${openTopic === t.id ? "Hide ▴" : "Open ▾"}</button></td>
                        </tr>${openTopic === t.id ? `<tr class="pl-detail"><td colspan="5">${topicDetail(t, l)}</td></tr>` : ""}`;
                    }).join("")}</tbody>
                </table></div>`;
        }
        function topicDetail(t, l) {
            const vids = (t.videos || []).map(videoById).filter(Boolean);
            const proofs = (t.proofs || []).map(id => CRAMLET.proofBox && CRAMLET.proofBox.byId(id)).filter(Boolean);
            const revealed = st().revealed[t.id] || {};
            const nextStep = l.findIndex(v => !v);
            return `<div class="pl-dgrid">
                <div><h4>Watch</h4>${vids.map(v => `<div class="pl-vid">
                    <span class="pl-vrole ${v.role}">${v.role === "main" ? "Main" : "If that didn’t click"}</span>
                    <a href="${videoUrl(v)}" target="_blank" rel="noopener"><b>${v.title}</b> ↗</a>
                    <div class="pl-tsub">${esc(v.by)} · ${clipLabel(v)}${videoMins(v) ? ` · ${videoMins(v)} min` : ""}</div>
                    <div class="pl-tsub">${v.why}</div>
                    ${v.warn ? `<div class="pl-warn">${icon("warning")} ${v.warn}</div>` : ""}
                    <button type="button" class="btn small" data-watched="${v.id}">${st().watched[v.id] ? `${icon("check")} Watched` : "I watched it"}</button>
                </div>`).join("") || `<p class="muted">No video for this one.</p>`}</div>
                <div><h4>Learn in cramlet</h4><ul class="pl-ul">${(t.links || []).map(x => `<li><a href="${x.href}">${x.label}</a></li>`).join("")}</ul>
                    <h4>Explain it (step 2)</h4>
                    <p class="pl-tsub">Say each answer out loud, without notes. Then reveal the model answer and compare.</p>
                    ${(t.explain || []).map((e, i) => `<div class="pl-ex"><div class="pl-exq">${e.q}</div>${revealed[i] ? `<div class="pl-exa">${e.a}</div>` : `<button type="button" class="btn small ghost" data-reveal="${t.id}:${i}">Reveal the model answer</button>`}</div>`).join("")}
                    ${(t.explain || []).length ? `<button type="button" class="btn small" data-step="${t.id}:1">${l[1] ? `${icon("check")} I explained it` : "I explained all of these"}</button>` : ""}
                </div>
                <div><h4>Prove it (steps 4–5)</h4>${proofs.length ? proofs.map(p => { const lv = CRAMLET.proofBox.level(ctx, p.id); return `<div class="pl-proof"><a href="#/proofs/${p.id}">${p.title}</a>${CRAMLET.proofBox.levelsHTML(lv, icon)}</div>`; }).join("") : `<p class="pl-tsub">No proof for this topic: it shows up as true/false and short answers. Step 4 fills in at 80%+ on its concept quiz.</p>`}
                    ${nextStep >= 0 ? `<div class="pl-nexthint"><b>Next step: ${STEPS[nextStep]}.</b> ${STEP_HOW[nextStep]}</div>` : `<div class="pl-nexthint good">${icon("check")} Every step done. Come back to it in a couple of days to keep it fresh.</div>`}
                </div>
            </div>`;
        }

        // ----- Mistake log -----
        const WHY = { concept: "Didn’t understand it", setup: "Set it up wrong", careless: "Careless", time: "Ran out of time" };
        function autoMistakes() {
            if (!CRAMLET.exam) return [];
            const Q = CRAMLET.exam.questionsById(St, ctx.allConcepts), deck = read(`cramlet.exam.${COURSE}.missed`, {});
            return CRAMLET.exam.missedIds(COURSE).map(id => {
                const q = Q[id], d = deck[id] || {};
                if (!q) return null;
                const topic = P.topics.find(t => (t.concepts || []).includes(q.concept));
                const text = String(q.q || q.prompt || q.statement || q.title || "A missed question").replace(/<[^>]+>/g, "").slice(0, 140);
                return { auto: true, id, q: text, src: "Cramlet · missed deck", topic: topic ? topic.id : null, wins: (d.wins || []).length };
            }).filter(Boolean);
        }
        function drawMistakes() {
            const mine = st().mistakes.map((m, i) => ({ ...m, idx: i, fixedN: (m.right || []).length }));
            const autos = autoMistakes();
            const all = [...mine, ...autos];
            const open = m => (m.auto ? true : m.fixedN < 2);
            const list = all.filter(m => mf === "all" ? true : mf === "open" ? open(m) : mf === "paper" ? m.src && /^Paper/.test(m.src) : mf === "cramlet" ? m.auto : m.why === mf);
            const T0 = T;
            $("#pl-mistakes").innerHTML = `
                <div class="pl-h"><h2 id="pl-mis-h">Mistake log</h2><span class="pl-sub">Practice-exam and quiz misses show up here on their own. Log paper tests by hand. A mistake is fixed once you get it right on two different days.</span>
                    <span class="pl-grow"></span><button type="button" class="btn primary small" data-act="log">${icon("note-pencil")} Log a paper test</button></div>
                ${logOpen ? `<form class="pl-log" id="pl-logform">
                    <label>Test<input id="pl-lt" required value="${esc(st().lastTest || "Professor’s practice exam")}"></label>
                    <label>Problem<input id="pl-lp" placeholder="e.g. 3b"></label>
                    <label>Points lost<input id="pl-lpts" placeholder="e.g. 2 of 5"></label>
                    <label>Topic<select id="pl-ltopic">${P.topics.map(t => `<option value="${t.id}">${t.title.replace(/<[^>]+>/g, "")}</option>`).join("")}</select></label>
                    <label class="wide">What went wrong<input id="pl-lnote" required placeholder="e.g. forgot the case where M loops on w"></label>
                    <label>Why<select id="pl-lwhy">${Object.entries(WHY).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
                    <div class="pl-logact"><button type="submit" class="btn primary small">Add to the log</button><button type="button" class="btn ghost small" data-act="log">Done</button>
                    <span class="pl-tsub">Add one row per lost point or problem. The form stays open so you can keep going.</span></div>
                </form>` : ""}
                <div class="pl-filters">${[["open", "Still open"], ["all", "All"], ["paper", "Paper tests"], ["cramlet", "From cramlet"], ...Object.entries(WHY)].map(([k, l]) => `<button type="button" class="pl-chip${mf === k ? " on" : ""}" data-mf="${k}" aria-pressed="${mf === k}">${l}</button>`).join("")}</div>
                <div class="pl-mlist">${list.length ? list.map(m => {
                    const t = m.topic && topicById[m.topic];
                    const doneToday = !m.auto && (m.tries || []).some(x => x.day === T0);
                    return `<div class="pl-mist${!m.auto && m.fixedN >= 2 ? " fixed" : ""}">
                        <div><div class="pl-mq">${esc(m.q)}</div><div class="pl-mmeta">
                            <span class="pl-tag">${esc(m.src)}</span>${t ? `<a class="pl-tag" href="#/plan/topics" data-open-topic="${t.id}">${t.title}</a>` : ""}${m.why ? `<span class="pl-tag why-${m.why}">${WHY[m.why]}</span>` : ""}${m.pts ? `<span class="pl-tag">${esc(m.pts)}</span>` : ""}</div></div>
                        <div class="pl-mside">${m.auto
                            ? `<span class="pl-fix" title="Right in two different sessions takes it out of the deck"><i class="${m.wins > 0 ? "on" : ""}"></i><i class="${m.wins > 1 ? "on" : ""}"></i></span><a class="btn small" href="#/exam/missed">Retake in the Missed deck</a>`
                            : m.fixedN >= 2 ? `<span class="pl-fixed">${icon("check")} Fixed</span><button type="button" class="pl-link" data-del="${m.idx}">Remove</button>`
                            : `<span class="pl-fix" title="Right on two different days = fixed"><i class="${m.fixedN > 0 ? "on" : ""}"></i><i class="${m.fixedN > 1 ? "on" : ""}"></i></span>
                               ${doneToday ? `<span class="pl-tsub">Tried today. Again tomorrow.</span>` : `<span class="pl-redo">Redo it, then: <button type="button" class="btn small" data-right="${m.idx}">Got it right</button><button type="button" class="btn small ghost" data-wrong="${m.idx}">Still wrong</button></span>`}
                               <button type="button" class="pl-link" data-del="${m.idx}">Remove</button>`}</div>
                    </div>`;
                }).join("") : `<p class="muted">${mf === "open" ? "Nothing open. Take a practice exam or log a paper test, and what you miss shows up here." : "Nothing here."}</p>`}</div>`;
            if (logOpen) {
                $("#pl-logform").addEventListener("submit", e => {
                    e.preventDefault();
                    const s = st();
                    const test = $("#pl-lt").value.trim(), prob = $("#pl-lp").value.trim();
                    s.lastTest = test;
                    s.mistakes.unshift({ q: $("#pl-lnote").value.trim(), src: `Paper · ${test}${prob ? `, ${prob}` : ""}`, pts: $("#pl-lpts").value.trim(), topic: $("#pl-ltopic").value, why: $("#pl-lwhy").value, at: Date.now(), right: [], tries: [] });
                    persist(); mf = "open"; drawMistakes(); drawHero();
                    const n = $("#pl-lnote"); if (n) n.focus();
                });
            }
        }

        // ----- Proofs summary -----
        function drawProofs() {
            const list = CRAMLET.proofBox ? CRAMLET.proofBox.list() : [];
            $("#pl-proofs").innerHTML = `
                <div class="pl-h"><h2 id="pl-proofs-h">Proofs you should be able to write</h2><span class="pl-sub">Each one climbs four levels in the Proof Box. Only Timed counts as exam-ready.</span><span class="pl-grow"></span><a class="btn small" href="#/proofs">${icon("note-pencil")} Open the Proof Box</a></div>
                <div class="pl-proofs">${list.map(p => { const lv = CRAMLET.proofBox.level(ctx, p.id); return `<a class="pl-pcard" href="#/proofs/${p.id}"><span class="pl-ptitle">${p.title}</span>${CRAMLET.proofBox.levelsHTML(lv, icon)}<span class="pl-pnext">${lv >= 4 ? `${icon("check")} Ready` : `Next: ${CRAMLET.proofBox.LEVELS[lv]}`}</span></a>`; }).join("")}</div>`;
        }

        // ----- Scores + notes -----
        function drawScores() {
            const hist = read(`cramlet.exam.${COURSE}.history`, []).filter(h => h.length !== "deck").map(h => ({ name: "Cramlet exam", at: h.done || h.at, pct: Math.round(h.pct) }));
            const pts = [...hist, ...st().scores].sort((a, b) => a.at - b.at).slice(-8);
            const W = 420, H = 190, x0 = 40, x1 = 405, yv = p => 155 - ((Math.max(30, Math.min(100, p)) - 30) / 70) * 135;
            const xs = i => (pts.length < 2 ? (x0 + x1) / 2 : x0 + 20 + (i * (x1 - x0 - 40)) / (pts.length - 1));
            const d = new Date();
            $("#pl-scores").innerHTML = `
                <div class="pl-h"><h2>Practice exam scores</h2><span class="pl-sub">% of points. Cramlet exams appear on their own.</span></div>
                ${pts.length ? `<svg class="pl-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Practice exam scores: ${pts.map(p => p.pct + "%").join(", ")}">
                    ${[100, 80, 60, 40].map(v => `<line x1="${x0}" x2="${x1}" y1="${yv(v)}" y2="${yv(v)}" class="grid"/><text x="${x0 - 6}" y="${yv(v) + 4}" text-anchor="end">${v}</text>`).join("")}
                    <line x1="${x0}" x2="${x1}" y1="${yv(80)}" y2="${yv(80)}" class="goal"/><text x="${x1}" y="${yv(80) - 6}" text-anchor="end" class="goal-t">goal 80%</text>
                    ${pts.length > 1 ? `<polyline points="${pts.map((p, i) => `${xs(i)},${yv(p.pct)}`).join(" ")}" class="line"/>` : ""}
                    ${pts.map((p, i) => `<circle cx="${xs(i)}" cy="${yv(p.pct)}" r="${i === pts.length - 1 ? 6 : 4.5}" class="dot"/><text x="${xs(i)}" y="${yv(p.pct) - 11}" text-anchor="middle" class="val">${p.pct}%</text><text x="${xs(i)}" y="178" text-anchor="middle">${esc(p.name.length > 14 ? p.name.slice(0, 13) + "…" : p.name)}</text>`).join("")}
                </svg>` : `<p class="muted">No scores yet. Take a practice exam in the Test Kitchen, or add a paper one below.</p>`}
                <form class="pl-scoreform" id="pl-sf"><label>Paper test<input id="pl-sn" required placeholder="Professor’s practice exam"></label><label>Score %<input id="pl-sp" type="number" min="0" max="100" required></label><button type="submit" class="btn small">Add score</button></form>`;
            $("#pl-sf").addEventListener("submit", e => {
                e.preventDefault();
                st().scores.push({ name: $("#pl-sn").value.trim(), pct: Math.max(0, Math.min(100, +$("#pl-sp").value)), at: Date.now() });
                persist(); drawScores();
            });
            void d;
        }
        function drawNotes() {
            const note = st().notes[T] || "";
            $("#pl-notes").innerHTML = `
                <div class="pl-h"><h2>What confused me</h2><span class="pl-sub">Saved for today (${short(T)}).</span></div>
                <textarea id="pl-note" rows="4" placeholder="Write down anything that didn’t click today.">${esc(note)}</textarea>
                <div class="pl-noteact"><button type="button" class="btn small" data-act="oh">Add it to my office-hours list</button></div>
                <h3 class="pl-ohh">Office-hours questions</h3>
                <ul class="pl-oh">${st().oh.map((q, i) => `<li><span>${esc(q)}</span><button type="button" class="pl-link" data-ohdel="${i}">Remove</button></li>`).join("") || `<li class="pl-ohempty">Questions you add show up here. Bring them to office hours.</li>`}</ul>`;
            const ta = $("#pl-note");
            let tm;
            ta.addEventListener("input", () => { clearTimeout(tm); tm = setTimeout(() => { st().notes[T] = ta.value; persist(); }, 300); });
        }

        // ----- Events -----
        main.addEventListener("click", e => {
            const b = e.target.closest("button, a");
            if (!b) return;
            const d = b.dataset, s = st();
            if (d.day) { sel = d.day; s.selDay = sel; persist(); drawWeek(); return; }
            if (d.task) {
                const task = ST().plan.days.flatMap(x => x.tasks).find(t => t.id === d.task);
                const now = !taskDone(F, task);
                // Back to matching what cramlet saw? Drop the override; otherwise remember your choice.
                if (now === autoDone(F, task)) delete s.done[d.task]; else s.done[d.task] = now;
                if (now) s.doneOn[d.task] = T; else delete s.doneOn[d.task];
                persist(); drawWeek(); drawHero(); return;
            }
            if (d.reauto) { delete s.done[d.reauto]; persist(); drawWeek(); drawHero(); return; }
            if (d.move) { s.moved[d.move] = d.to; persist(); drawWeek(); drawHero(); return; }
            if (d.spread) {
                const targets = days().filter(x => !x.exam).map(x => x.date);
                lateTasks(F).forEach((t, i) => { s.moved[t.id] = targets[i % targets.length]; });
                persist(); drawWeek(); drawHero(); return;
            }
            if (d.watched) { if (s.watched[d.watched]) delete s.watched[d.watched]; else s.watched[d.watched] = Date.now(); persist(); refresh(); return; }
            if (d.toggle) { openTopic = openTopic === d.toggle ? null : d.toggle; drawTopics(); return; }
            if (d.openTopic) { openTopic = d.openTopic; drawTopics(); setTimeout(() => { const r = main.querySelector(`tr[data-topic="${d.openTopic}"]`); if (r) r.scrollIntoView({ block: "start", behavior: "smooth" }); }, 50); if (b.tagName === "A") e.preventDefault(); return; }
            if (d.step) {
                const [tid, i] = d.step.split(":"); s.steps[tid] = s.steps[tid] || {};
                if (s.steps[tid][i]) delete s.steps[tid][i]; else s.steps[tid][i] = Date.now();
                persist(); drawTopics(); drawHero(); drawWeek(); return;
            }
            if (d.conf) { const [tid, c] = d.conf.split(":"); s.conf[tid] = s.conf[tid] === +c ? 0 : +c; persist(); drawTopics(); return; }
            if (d.reveal) { const [tid, i] = d.reveal.split(":"); (s.revealed[tid] = s.revealed[tid] || {})[i] = true; persist(); drawTopics(); return; }
            if (d.mf) { mf = d.mf; drawMistakes(); return; }
            if (d.act === "log") { logOpen = !logOpen; drawMistakes(); if (logOpen) { const n = $("#pl-lnote"); if (n) n.focus(); } return; }
            if (d.right !== undefined || d.wrong !== undefined) {
                const m = s.mistakes[+(d.right !== undefined ? d.right : d.wrong)];
                m.tries = m.tries || []; m.right = m.right || [];
                m.tries.push({ day: T, ok: d.right !== undefined });
                if (d.right !== undefined && !m.right.includes(T)) m.right.push(T);
                persist(); drawMistakes();
                if (d.right !== undefined && m.right.length >= 2 && CRAMLET.progress) CRAMLET.progress.award("challenge", `${COURSE}:plan-fix:${m.at}`, { at: b });
                return;
            }
            if (d.del !== undefined) { s.mistakes.splice(+d.del, 1); persist(); drawMistakes(); return; }
            if (d.act === "oh") { const v = $("#pl-note").value.trim(); if (v) { s.oh.push(v); persist(); drawNotes(); } return; }
            if (d.ohdel !== undefined) { s.oh.splice(+d.ohdel, 1); persist(); drawNotes(); return; }
        });

        refresh(); drawNotes();
        const jump = { mistakes: "#pl-mistakes", topics: "#pl-topics", proofs: "#pl-proofs", week: "#pl-week" }[parts[1]];
        if (jump) setTimeout(() => { const el = $(jump); if (el) el.scrollIntoView({ block: "start" }); }, 60);
    }

    // "Watch" links for a concept page header and its Details sections.
    function watchChips(concept, sec, icon, esc) {
        const vs = videosFor(concept, sec).filter(v => (sec ? true : v.role === "main")).slice(0, sec ? 4 : 3);
        if (!vs.length) return "";
        return `<div class="watch-row">${icon("play")}<span class="watch-k">Watch</span>${vs.map(v => `<a class="watch-chip${v.role === "alt" ? " alt" : ""}" href="${videoUrl(v)}" target="_blank" rel="noopener" title="${esc(v.why.replace(/<[^>]+>/g, ""))}"><span class="wc-t">${v.title}</span> <span class="wc-by">${esc(v.by)} · ${clipLabel(v)}</span></a>`).join("")}</div>`;
    }

    CRAMLET.plan = { render, has: St => !!(St.plan && St.plan.topics), watchChips, videoById, videoUrl, markWatched, today };
})();
