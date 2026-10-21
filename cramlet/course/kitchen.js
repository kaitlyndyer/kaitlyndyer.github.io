// Test Kitchen: one home for every exam-prep tool (practice exams, the missed deck, Myth or fact, the Recipe Box,
// Crumb Run and the Cookie Sheet). Every tool page shares one header card with tabs along its bottom edge, followed by a slim
// row for that page's own controls, so moving between tools never changes the frame.
//   CRAMLET.kitchen.header(ctx, toolId, { line }) → the shared header's HTML (toolId "overview" for the hub)
//   CRAMLET.kitchen.mount(root)                   → wakes up the buddy in a header after it's on the page
//   CRAMLET.kitchen.render(main, ctx)             → the overview at #/kitchen
// A tool only shows up when the course has it (the ToC course has practice exams but no Myth or fact yet).
(function () {
    "use strict";

    const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } };

    const TOOLS = [
        { id: "exam", name: "Practice exam", icon: "list-checks", href: "#/exam", group: "practice",
            line: "A timed exam drawn fresh from the question bank, graded with an explanation for every answer.", has: () => !!CRAMLET.exam },
        { id: "missed", name: "Missed deck", icon: "cards", href: "#/exam/missed", group: "practice",
            line: "Every question you missed or guessed. Each one leaves once you get it right in two different sessions.", has: () => !!CRAMLET.exam },
        { id: "myths", name: "Myth or fact?", icon: "lightbulb", href: "#/myths", group: "practice",
            line: "Rapid-fire statements built from the traps behind wrong answers. Decide fast, then learn why.", has: () => !!(CRAMLET.myths && CRAMLET.myths.count()) },
        { id: "recipes", name: "Recipe Box", icon: "scroll", href: "#/recipes", group: "practice",
            line: "How to think through each kind of problem: a quick card to follow, and a full walkthrough with a worked example.", has: () => !!(CRAMLET.recipes && CRAMLET.recipes.count()) },
        { id: "run", name: "Crumb Run", icon: "hourglass-medium", href: "#/last-crumbs", group: "last",
            line: "A short recall session: Tonight before bed, then the Morning of to relearn the tricky ones.", has: S => !!CRAMLET.lastCrumbs && hasCards(S) },
        { id: "sheet", name: "Cookie Sheet", icon: "note", href: "#/last-crumbs/sheet", group: "last",
            line: "Everything on one page. Fill in the hidden terms from memory, and stick a cookie on what you know.", has: S => !!CRAMLET.lastCrumbs && hasCards(S) },
    ];
    const GROUPS = [
        { id: "practice", title: "Practice", sub: "Any day: find out what you don’t know yet, and fix it" },
        { id: "last", title: "Last-minute", sub: "The night before and the morning of the exam" },
    ];
    // Crumb Run and the Cookie Sheet need something to recall: flashcards, or the course's example cards.
    const hasCards = S => !!(S.cast && S.cast.length) || Object.values(S.content || {}).some(d => (d.flashcards || []).length);
    const toolsFor = S => TOOLS.filter(t => t.has(S));
    // Which page of the course belongs to the Test Kitchen (for the sidebar).
    const owns = parts => ["kitchen", "exam", "myths", "recipes", "last-crumbs", "review"].includes(parts[0]);

    function header(ctx, active, opts = {}) {
        const { S, esc, icon } = ctx;
        const tools = toolsFor(S), t = tools.find(x => x.id === active);
        const deck = CRAMLET.exam ? CRAMLET.exam.deckCount(ctx.COURSE) : 0;
        const title = t ? t.name : "Test Kitchen";
        const line = opts.line || (t ? t.line : "Everything for getting ready for an exam, in one place. Practice any day, and save the last-minute tools for the night before.");
        return `<header class="kh">
            <div class="kh-top">
                <div class="kh-text">
                    <div class="kh-eyebrow">${t ? `<a href="#/kitchen">${icon("chef-hat")} Test Kitchen</a>` : esc(S.course.title)}</div>
                    <h1>${icon(t ? t.icon : "chef-hat")} ${esc(title)}</h1>
                    <p>${line}</p>
                </div>
                <div class="kh-buddy" data-mood="${opts.mood || (t ? "idle" : "happy")}"></div>
            </div>
            <nav class="kh-tabs" aria-label="Test Kitchen tools">
                <a class="kh-tab${t ? "" : " on"}" href="#/kitchen"${t ? "" : ' aria-current="page"'}>${icon("chef-hat")} Overview</a>
                ${tools.map(x => `<a class="kh-tab${x.id === active ? " on" : ""}" href="${x.href}"${x.id === active ? ' aria-current="page"' : ""}>${icon(x.icon)} ${esc(x.name)}${x.id === "missed" && deck ? `<span class="kh-badge">${deck}</span>` : ""}</a>`).join("")}
            </nav>
        </header>`;
    }
    function mount(root) {
        const el = root.querySelector(".kh-buddy");
        if (el && CRAMLET.buddy) CRAMLET.buddy.react(el, el.dataset.mood || "idle", "bounce");
        const on = root.querySelector(".kh-tab.on");
        if (on && on.scrollIntoView && on.offsetLeft + on.offsetWidth > on.parentElement.clientWidth) on.parentElement.scrollLeft = on.offsetLeft - 20;
    }

    // ---------- The overview ----------
    function render(main, ctx) {
        const { S, COURSE, esc, icon, allConcepts } = ctx;
        const tools = toolsFor(S), has = id => tools.some(t => t.id === id);
        const R = CRAMLET.exam && CRAMLET.exam.latest(COURSE);
        const deck = CRAMLET.exam ? CRAMLET.exam.deckCount(COURSE) : 0;
        const activeExam = read(`cramlet.exam.${COURSE}.active`, null);
        const lc = read(`cramlet.lastcrumbs.${COURSE}`, {});
        const lcSession = lc.session && lc.session.step !== "end" ? lc.session : null;
        const lastNight = lc.lastNight && Date.now() - lc.lastNight.at < 20 * 3600000 ? lc.lastNight : null;
        const sheet = read(`cramlet.cookiesheet.${COURSE}`, { known: [] });
        const points = allConcepts.reduce((a, c) => a + (((S.content[c.id] || {}).summary || {}).keyPoints || []).length, 0);
        const myth = CRAMLET.myths ? CRAMLET.myths.progress(COURSE) : null;

        // Each tile's number, and a word about what it counts.
        const stat = {
            exam: R ? [`${Math.round(R.pct)}%`, "on your last exam"] : ["–", "no exam yet"],
            missed: [String(deck), deck === 1 ? "card to retake" : "cards to retake"],
            myths: myth ? [String(myth.seen), `of ${myth.total} seen${myth.missed ? ` · ${myth.missed} missed` : ""}`] : ["", ""],
            run: lcSession ? ["…", "session in progress"] : lastNight ? [String(lastNight.hard.length), "tricky cards for the morning"] : ["25", "minutes tonight"],
            sheet: [String((sheet.known || []).length), `of ${points} points stickered`],
            recipes: [String(CRAMLET.recipes ? CRAMLET.recipes.count() : 0), "problem types"],
        };

        // What to do right now: finish what's open, then go by the time of day.
        const h = new Date().getHours();
        let now;
        if (activeExam && has("exam")) now = { text: `You have a practice exam in progress.`, href: "#/exam/take", label: "Continue the exam", ic: "list-checks" };
        else if (lcSession && has("run")) now = { text: `You have an unfinished Crumb Run.`, href: "#/last-crumbs/go", label: "Continue it", ic: "hourglass-medium" };
        else if ((h >= 19 || h < 4) && has("run")) now = { text: `It’s evening: a <b>Crumb Run (Tonight)</b> for 25 minutes, then sleep.`, href: "#/last-crumbs", label: "Start a Crumb Run", ic: "moon" };
        else if (h >= 4 && h < 12 && lastNight && has("run")) now = { text: `Good morning! Relearn last night’s <b>${lastNight.hard.length}</b> tricky card${lastNight.hard.length === 1 ? "" : "s"} with a <b>Crumb Run (Morning of)</b>.`, href: "#/last-crumbs", label: "Start Morning of", ic: "sun" };
        else if (deck >= 10 && has("missed")) now = { text: `Your <b>Missed deck</b> has ${deck} cards. Clearing a few is the quickest win.`, href: "#/exam/missed", label: "Open the Missed deck", ic: "cards" };
        else if (has("exam")) now = { text: R ? `Take another <b>practice exam</b> and see if you can beat ${Math.round(R.pct)}%.` : `Start with a <b>practice exam</b> to find out what you already know.`, href: "#/exam", label: "Start a practice exam", ic: "list-checks" };

        main.innerHTML = `
            <div class="kitchen">
                ${header(ctx, "overview")}
                ${now ? `<div class="kh-slim"><span class="kh-label">Right now</span><span class="kh-grow">${now.text}</span><a class="btn primary small" href="${now.href}">${icon(now.ic)} ${now.label}</a></div>` : ""}
                ${GROUPS.map(g => {
                    const list = tools.filter(t => t.group === g.id);
                    if (!list.length) return "";
                    return `<section class="kt-group">
                        <div class="kt-title"><h2>${g.title}</h2><span class="muted">${g.sub}</span></div>
                        <div class="kt-tiles">${list.map(t => `
                            <a class="kt-tile" href="${t.href}">
                                <span class="kt-ic">${icon(t.icon)}</span>
                                <h3>${esc(t.name)}</h3>
                                <span class="kt-stat">${stat[t.id][0]} <small>${stat[t.id][1]}</small></span>
                                <p>${t.line}</p>
                            </a>`).join("")}</div>
                    </section>`;
                }).join("")}
            </div>`;
        mount(main);
    }

    window.CRAMLET = Object.assign(window.CRAMLET || {}, { kitchen: { header, mount, render, owns, has: (S, id) => toolsFor(S).some(t => t.id === id) } });
})();
