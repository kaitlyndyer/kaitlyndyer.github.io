// cramlet home dashboard: your buddy, crumbs, streak and level; where you left off; a calendar of study days;
// progress in each course; what to review; and the buddy closet. Everything comes from this browser’s storage:
//   cramlet.progress (progress.js), cramlet.buddy (buddy.js), each course’s own store,
//   cramlet.courses / cramlet.last / cramlet.visits (written by course/app.js when you study).
(function () {
    "use strict";

    const C = window.CRAMLET, icon = C.icon, P = C.progress, B = C.buddy;
    const esc = s => String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
    const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } };

    const COURSES = [
        { id: "pdi", url: "pdi/", title: "Program Design & Implementation", desc: "Designing programs in Java: interfaces, inheritance, generics, specs, and more.", color: "#7c5cff", icon: "coffee" },
        { id: "toc", url: "toc/", title: "Theory of Computation", desc: "Automata, regular expressions, and the pumping lemma, with machines you can run step by step.", color: "#11a8a0", icon: "automaton" },
    ];
    const TAB_NAME = { summary: "Summary", details: "Details", playground: "Playground", code: "Code", practice: "Practice" };

    // ---------- Progress on one concept: a mix of quiz, challenges, flashcards, and “Got it” ----------
    const WEIGHTS = { quiz: 40, challenges: 30, cards: 15, got: 15 };
    function conceptParts(course, info, store, keys) {
        const best = (store.quizBest || {})[info.id];
        const quiz = best ? best.right / best.total
            : keys.has(`perfect:${course}:${info.id}`) ? 1
            : keys.has(`quiz:${course}:${info.id}`) ? 0.5 // finished before scores were saved
            : 0;
        let challenges = null;
        if (info.challenges) {
            const solved = [...keys].filter(k => info.kinds.some(kind => k === `challenge:${course}:${kind}` || k.startsWith(`challenge:${course}:${kind}:`))).length;
            challenges = Math.min(1, solved / info.challenges);
        }
        return {
            quiz, challenges,
            cards: keys.has(`deck:${course}:${info.id}`) ? 1 : 0,
            got: (store.status || {})[info.id] === "got" ? 1 : 0,
            best, review: (store.status || {})[info.id] === "review",
        };
    }
    function mastery(p) {
        let sum = 0, weight = 0;
        Object.entries(WEIGHTS).forEach(([k, w]) => { if (p[k] !== null) { sum += w * p[k]; weight += w; } });
        return sum / weight;
    }
    function courseProgress(course) {
        const all = read("cramlet.courses") || {}, snap = all[course.id];
        if (!snap) return null;
        const store = read(snap.storeKey) || {}, keys = new Set(P.keys());
        const concepts = snap.concepts.map(info => { const parts = conceptParts(course.id, info, store, keys); return { info, parts, m: mastery(parts) }; });
        const avg = k => { const xs = concepts.map(c => c.parts[k]).filter(v => v !== null); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; };
        return {
            concepts,
            m: concepts.reduce((a, c) => a + c.m, 0) / Math.max(1, concepts.length),
            parts: { quiz: avg("quiz"), challenges: avg("challenges"), cards: avg("cards"), got: avg("got") },
            mastered: concepts.filter(c => c.m >= 0.8).length,
        };
    }

    // ---------- Pieces ----------
    const pct = x => Math.round(x * 100);
    function ago(t) {
        const s = (Date.now() - t) / 1000;
        if (s < 90) return "just now";
        if (s < 3600) return `${Math.round(s / 60)} minutes ago`;
        if (s < 86400) return `${Math.round(s / 3600)} hour${Math.round(s / 3600) === 1 ? "" : "s"} ago`;
        const d = Math.round(s / 86400);
        return d === 1 ? "yesterday" : `${d} days ago`;
    }

    function heroHTML(sum) {
        const name = esc(B.nameOf());
        const next = B.ACCESSORIES.find(a => a.level > sum.level);
        const say = sum.countsToday ? `Nice work today! Your ${sum.streak}-day streak is safe.`
            : sum.streak ? `You’re on a ${sum.streak}-day streak. Answer 5 questions today to keep it going.`
            : sum.crumbs ? `Answer 5 questions, finish a flashcard deck, or solve a challenge to start a streak.`
            : `Pick a course below and answer a few questions to earn your first crumbs.`;
        const into = sum.crumbs - sum.levelStart, span = sum.nextLevel - sum.levelStart;
        return `
            <section class="dash-card hero">
                <div class="hero-buddy">${B.svg(sum.countsToday ? "happy" : "idle")}</div>
                <p class="hello">${sum.crumbs ? `Welcome back! ${name} missed you.` : `Hi! I’m ${name}.`}</p>
                <p class="say">${say}</p>
                <div class="stats">
                    <span class="spill crumbs">${P.crumbIcon()}${sum.crumbs.toLocaleString()} crumbs</span>
                    <span class="spill streak">${icon("fire")}${sum.streak}-day streak</span>
                    <span class="spill level">${icon("star")}Level ${sum.level}</span>
                </div>
                <div class="lvl">
                    <div class="lvl-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${span}" aria-valuenow="${into}" aria-label="Progress to level ${sum.level + 1}"><div style="width:${(into / span) * 100}%"></div></div>
                    <span class="lvl-note">${span - into} crumbs to level ${sum.level + 1}${next && next.level === sum.level + 1 ? `: unlocks the ${next.name.toLowerCase()}` : ""}</span>
                </div>
            </section>`;
    }

    function calendarHTML(sum) {
        const WEEKS = 12, days = P.days(), today = new Date();
        const key = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay())); // this Saturday
        const heat = c => (c >= 100 ? 4 : c >= 50 ? 3 : c >= 20 ? 2 : c > 0 ? 1 : 0);
        let cols = "";
        for (let w = WEEKS - 1; w >= 0; w--) {
            let col = "";
            for (let d = 6; d >= 0; d--) {
                const day = new Date(end.getFullYear(), end.getMonth(), end.getDate() - w * 7 - d);
                const k = key(day), info = days[k], future = day > today;
                const label = future ? "" : `${day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}: ${info && info.crumbs ? `${info.crumbs} crumbs` : "no studying"}`;
                col += `<span class="d${future ? " future" : ` h${heat(info ? info.crumbs : 0)}`}${k === key(today) ? " today" : ""}"${label ? ` title="${label}"` : ""}></span>`;
            }
            cols += `<div class="col">${col}</div>`;
        }
        return `
            <section class="dash-card">
                <div class="dlabel"><span>Study days</span><span>Best streak: ${sum.best}</span></div>
                <div class="cal" role="img" aria-label="Calendar of study days for the last ${WEEKS} weeks">${cols}</div>
                <div class="cal-key">Less <i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i> More</div>
            </section>`;
    }

    function closetHTML(sum) {
        const wearing = B.wearing();
        const tile = (id, name, lv) => {
            const locked = lv > sum.level, on = (id || "") === wearing;
            return `<button type="button" class="acc${locked ? " locked" : ""}" data-acc="${id}" aria-pressed="${on}" ${locked ? "disabled" : ""}>
                <span class="acc-av">${C.critterSVG(C.byId(B.current().critter), { color: B.current().color || C.byId(B.current().critter).color, acc: id })}</span>
                <span>${locked ? `Level ${lv}` : name}</span></button>`;
        };
        return `
            <section class="dash-card">
                <div class="dlabel"><span>Buddy closet</span><span>${B.ACCESSORIES.filter(a => a.level <= sum.level).length} of ${B.ACCESSORIES.length} unlocked</span></div>
                <div class="closet">${tile("", "Nothing", 1)}${B.ACCESSORIES.map(a => tile(a.id, a.name, a.level)).join("")}</div>
                <p class="dash-note">Level up to unlock more. Whatever ${esc(B.nameOf())} wears shows up everywhere on cramlet.</p>
            </section>`;
    }

    function continueHTML() {
        const last = read("cramlet.last"), course = last && COURSES.find(c => c.id === last.course);
        if (!course) return `
            <section class="dash-card">
                <div class="dlabel"><span>Pick up where you left off</span></div>
                <p class="dash-note">Nothing yet. Open a course below, and next time you’ll be able to jump right back in.</p>
            </section>`;
        return `
            <section class="dash-card">
                <div class="dlabel"><span>Pick up where you left off</span></div>
                <a class="continue" href="${course.url}#/c/${esc(last.concept)}/${esc(last.tab)}" style="--c:${esc(last.color)}">
                    <span class="c-icon">${icon(last.icon)}</span>
                    <span class="c-text"><span class="c-title">${esc(last.title)}</span><span class="c-meta">${esc(last.courseTitle)} · ${TAB_NAME[last.tab] || "Summary"} · ${ago(last.at)}</span></span>
                    <span class="go">Continue →</span>
                </a>
            </section>`;
    }

    function coursesHTML(progress) {
        return `<section class="dash-courses" aria-label="Courses">${COURSES.map(course => {
            const p = progress[course.id];
            if (!p) return `
                <a class="dash-card dcourse fresh" href="${course.url}" style="--c:${course.color}">
                    <span class="course-icon">${icon(course.icon)}</span>
                    <span class="dc-title">${esc(course.title)}</span>
                    <span class="dc-desc">${esc(course.desc)}</span>
                    <span class="dc-go">Start studying →</span>
                </a>`;
            const bar = (name, v) => `<div class="part"><span>${name}</span><div class="bar"><div style="width:${v === null ? 0 : pct(v)}%"></div></div><span class="num">${v === null ? "none" : pct(v) + "%"}</span></div>`;
            return `
                <a class="dash-card dcourse" href="${course.url}" style="--c:${course.color}">
                    <span class="dc-top">
                        <span class="ring" style="--p:${pct(p.m)}"><span>${pct(p.m)}%</span></span>
                        <span><span class="dc-title">${esc(course.title)}</span><span class="dc-sub">${p.concepts.length} concepts · ${p.mastered} mastered</span></span>
                    </span>
                    <span class="parts">${bar("Quizzes", p.parts.quiz)}${bar("Challenges", p.parts.challenges)}${bar("Flashcards", p.parts.cards)}${bar("Got it", p.parts.got)}</span>
                    <span class="dots">${p.concepts.map(c => `<span class="dot" style="--m:${Math.max(0.06, c.m).toFixed(2)}" title="${esc(c.info.title)}: ${pct(c.m)}%"></span>`).join("")}</span>
                </a>`;
        }).join("")}</section>`;
    }

    // Concepts to come back to: marked “Review again”, low quiz scores, or started but not opened for a week.
    function reviewHTML(progress) {
        const visits = read("cramlet.visits") || {}, out = [], WEEK = 7 * 86400000;
        COURSES.forEach(course => {
            const p = progress[course.id];
            if (!p) return;
            p.concepts.forEach(({ info, parts, m }) => {
                const seen = (visits[course.id] || {})[info.id];
                const why = [];
                let score = 0;
                if (parts.review) { why.push("you marked it “Review again”"); score += 3; }
                if (parts.best && parts.best.right / parts.best.total < 0.7) { why.push(`best quiz ${parts.best.right}/${parts.best.total}`); score += 2; }
                if (seen && Date.now() - seen > WEEK && m < 0.8) { why.push(`not opened in ${Math.round((Date.now() - seen) / 86400000)} days`); score += 1; }
                if (score) out.push({ course, info, why, score, tab: parts.best && parts.best.right / parts.best.total < 0.7 ? "practice" : "summary" });
            });
        });
        out.sort((a, b) => b.score - a.score);
        return `
            <section class="dash-card">
                <div class="dlabel"><span>Needs review</span>${out.length > 4 ? `<span>${out.length - 4} more</span>` : ""}</div>
                ${out.length ? `<div class="review">${out.slice(0, 4).map(r => `
                    <a class="ritem" href="${r.course.url}#/c/${r.info.id}/${r.tab}" style="--c:${r.info.color}">
                        <span class="stripe"></span>
                        <span class="rtext"><b>${esc(r.info.title)}</b><span class="why">${esc(r.course.title)} · ${r.why.map(esc).join(" · ").replace(/^./, ch => ch.toUpperCase())}</span></span>
                        <span class="rbtn">Review</span>
                    </a>`).join("")}</div>`
                    : `<p class="dash-note">Nothing to review right now. Concepts show up here when you mark them “Review again,” score under 70% on a quiz, or haven’t opened them in a week.</p>`}
            </section>`;
    }

    // ---------- Put it together ----------
    function draw() {
        const el = document.getElementById("dashboard");
        const sum = P.summary(), progress = {};
        COURSES.forEach(c => { progress[c.id] = courseProgress(c); });
        el.innerHTML = `
            <div class="dash-side">${heroHTML(sum)}${calendarHTML(sum)}${closetHTML(sum)}</div>
            <div class="dash-main">${continueHTML()}${coursesHTML(progress)}${reviewHTML(progress)}</div>`;
    }

    document.getElementById("dashboard").addEventListener("click", e => {
        const b = e.target.closest("[data-acc]");
        if (b && !b.disabled) B.setAccessory(b.dataset.acc);
    });
    B.onChange(draw);
    P.onChange(draw);
    draw();
})();
