// cramlet progress: crumbs (points), the daily streak, and buddy levels. Shared by every course.
// Saved in this browser only (localStorage), like the buddy.
//
// Pages call CRAMLET.progress.award(kind, id, { at: element }) when the visitor does something.
// The first time you earn something gives full crumbs; doing it again on a later day gives a few;
// doing it again the same day gives none, so replaying one quiz can't farm crumbs.
(function () {
    "use strict";

    const KEY = "cramlet.progress";
    const listeners = [];

    // kind: [first time, again on a later day]
    const RULES = {
        answer: [10, 2],     // a correct quiz answer (id = course:question)
        quiz: [15, 5],       // finishing a quiz (id = course:concept)
        perfect: [25, 5],    // bonus for a perfect quiz
        deck: [15, 5],       // flipping every card in a flashcard deck
        got: [5, 0],         // marking a concept "Got it"
        challenge: [30, 5],  // solving a playground challenge
    };
    // A day counts toward the streak after any one of these.
    const STREAK_GOAL = { answers: 5, decks: 1, challenges: 1 };

    // ---------- Saved state ----------

    function blank() { return { v: 1, crumbs: 0, best: 0, days: {}, earned: {} }; }
    function load() {
        try {
            const s = JSON.parse(localStorage.getItem(KEY));
            if (s && s.v === 1) return Object.assign(blank(), s);
        } catch (e) { /* storage unavailable: progress just won't persist */ }
        return blank();
    }
    let state = load();
    function save() {
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    }
    // Another tab earned crumbs: pick them up here too.
    window.addEventListener("storage", e => {
        if (e.key !== KEY) return;
        state = load();
        listeners.forEach(fn => fn(summary()));
    });

    // ---------- Dates (local time, "YYYY-MM-DD") ----------

    const dayKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const today = () => dayKey(new Date());
    function dayBefore(key) {
        const [y, m, d] = key.split("-").map(Number);
        return dayKey(new Date(y, m - 1, d - 1));
    }
    const dayOf = key => state.days[key] || { crumbs: 0, answers: 0, decks: 0, challenges: 0 };
    const counts = key => {
        const d = dayOf(key);
        return d.answers >= STREAK_GOAL.answers || d.decks >= STREAK_GOAL.decks || d.challenges >= STREAK_GOAL.challenges;
    };

    // Days in a row that counted. Today not counting yet doesn't break it (you still have until midnight).
    function streak() {
        let key = today(), n = 0;
        if (!counts(key)) key = dayBefore(key);
        while (counts(key)) { n++; key = dayBefore(key); }
        return n;
    }

    // ---------- Levels ----------
    // Reaching level L takes 25·L·(L−1) crumbs in total: 50, 150, 300, 500, 750, …

    const crumbsFor = level => 25 * level * (level - 1);
    const levelOf = crumbs => Math.floor((1 + Math.sqrt(1 + 0.16 * crumbs)) / 2);

    function summary() {
        const level = levelOf(state.crumbs);
        return {
            crumbs: state.crumbs,
            level,
            levelStart: crumbsFor(level),
            nextLevel: crumbsFor(level + 1),
            streak: streak(),
            best: Math.max(state.best, streak()),
            countsToday: counts(today()),
            today: dayOf(today()),
        };
    }

    // ---------- Earning ----------

    function award(kind, id, opts = {}) {
        const rule = RULES[kind];
        if (!rule) throw new Error("cramlet progress: unknown kind " + kind);
        const t = today();
        const before = summary();
        const day = Object.assign({}, dayOf(t));

        if (kind === "answer") day.answers++;
        if (kind === "deck") day.decks++;
        if (kind === "challenge") day.challenges++;

        let gained = 0;
        if (opts.correct !== false) {
            const k = kind + ":" + id;
            const last = state.earned[k];
            gained = last === undefined ? rule[0] : last === t ? 0 : rule[1];
            state.earned[k] = t;
        }
        day.crumbs += gained;
        state.days[t] = day;
        state.crumbs += gained;
        state.best = Math.max(state.best, streak());
        save();

        const after = summary();
        const result = Object.assign(after, {
            gained,
            leveledUp: after.level > before.level,
            streakDay: after.countsToday && !before.countsToday, // today just started counting
        });
        if (opts.at) celebrate(opts.at, result);
        listeners.forEach(fn => fn(result));
        return result;
    }

    // ---------- The crumb: a pink-frosted sugar cookie (soft style, like the critters) ----------

    // A slightly lumpy circle, like baked dough.
    function blob(cx, cy, r, amp, k, phase) {
        let d = "";
        for (let i = 0; i <= 72; i++) {
            const a = (i / 72) * Math.PI * 2;
            const rr = r + amp * Math.sin(k * a + phase) + amp * .5 * Math.sin((k + 4) * a + phase * 2);
            d += (i ? "L" : "M") + (cx + rr * Math.cos(a)).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1);
        }
        return d + "Z";
    }
    const SPRINKLES = [[24, 22, 20, "#9d85ff"], [37, 18, -35, "#ffd56b"], [44, 29, 60, "#7fd1c0"], [29, 34, -10, "#ffffff"],
        [21, 31, 70, "#7fd1c0"], [38, 39, 25, "#9d85ff"], [30, 25, 85, "#ffd56b"], [45, 39, -50, "#ffffff"]];
    const CRUMB_SVG = '<svg class="crumb-ic" viewBox="0 0 64 64" aria-hidden="true" focusable="false">'
        + '<ellipse cx="32" cy="59" rx="19" ry="2.6" fill="#2b2340" opacity=".12"/>'
        + `<path d="${blob(32, 33, 25, .8, 9, 1)}" fill="#e7b26c"/><path d="${blob(32, 31, 24, .8, 9, 1)}" fill="#f7cf8e"/>`
        + `<path d="${blob(32, 30, 19, 1.5, 8, .2)}" fill="#ff9fc2"/><path d="${blob(31.5, 29, 18.2, 1.5, 8, .2)}" fill="#ffb7d0"/>`
        + SPRINKLES.map(([x, y, r, c]) => `<rect x="${x - 2.4}" y="${y - .95}" width="4.8" height="1.9" rx=".95" transform="rotate(${r} ${x} ${y})" fill="${c}"/>`).join("")
        + '<ellipse cx="24" cy="17" rx="5" ry="2.8" transform="rotate(-30 24 17)" fill="#fff" opacity=".5"/></svg>';
    const crumbIcon = () => CRUMB_SVG;

    // ---------- Little floating "+10 crumbs" ----------

    function pop(el, html, cls = "", lift = 0) {
        const r = el.getBoundingClientRect();
        const p = document.createElement("span");
        p.className = "crumb-pop " + cls;
        p.innerHTML = html;
        p.style.left = r.left + r.width / 2 + "px";
        p.style.top = r.top - lift + "px";
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1600);
    }
    function celebrate(el, r) {
        const icon = window.CRAMLET.icon;
        const pops = [];
        if (r.gained) pops.push([`${crumbIcon()} +${r.gained} crumbs`, ""]);
        if (r.streakDay) pops.push([`${icon("fire")} ${r.streak > 1 ? `${r.streak}-day streak!` : "Streak started!"}`, "streak"]);
        if (r.leveledUp) pops.push([`${icon("star")} Level ${r.level}!`, "level"]);
        // Stack them in a column (first one lowest) so they don't cover each other.
        pops.forEach(([html, cls], i) => setTimeout(() => pop(el, html, cls, i * 42), i * 150));
    }

    window.CRAMLET = Object.assign(window.CRAMLET || {}, {
        progress: {
            award, summary, levelOf, crumbsFor, crumbIcon, RULES, STREAK_GOAL,
            onChange: fn => listeners.push(fn),
            // A short stable id for a question, from its text (survives reordering the quiz).
            idFor: text => {
                let h = 5381;
                for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
                return (h >>> 0).toString(36);
            },
        },
    });
})();
