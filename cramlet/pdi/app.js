(function () {
    "use strict";

    const S = window.STUDY;
    const icon = CRAMLET.icon;
    document.getElementById("search-icon").innerHTML = icon("magnifying-glass");
    const buddy = CRAMLET.buddy;
    buddy.mountChip(document.getElementById("buddy-chip"));
    document.getElementById("brand").innerHTML = CRAMLET.logo();
    const main = document.getElementById("main");
    const nav = document.getElementById("concept-nav");

    // ---------- Lookup helpers ----------

    const allConcepts = S.groups.flatMap(g => g.concepts.map(c => ({ ...c, group: g })));
    const conceptById = Object.fromEntries(allConcepts.map(c => [c.id, c]));
    const hasContent = id => Boolean(S.content[id]);

    const TABS = [
        { id: "summary", label: "Summary", icon: "note" },
        { id: "details", label: "Details", icon: "microscope" },
        { id: "code", label: "Code", icon: "code" },
        { id: "practice", label: "Practice", icon: "brain" },
    ];

    // ---------- Saved progress (per browser) ----------

    // Key kept from the old /study address so saved progress carries over to cramlet.
    const STORE_KEY = "study.pdi.v1";
    let saved = { status: {} };
    try {
        saved = JSON.parse(localStorage.getItem(STORE_KEY)) || saved;
    } catch (e) { /* storage unavailable: progress just won't persist */ }

    function save() {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(saved)); } catch (e) { /* ignore */ }
    }

    function setStatus(id, status) {
        if (saved.status[id] === status) delete saved.status[id];
        else saved.status[id] = status;
        save();
        renderNav();
    }

    // ---------- Small utilities ----------

    const esc = s => String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
    const stripTags = html => html
        .replace(/<\/?(p|li|ul|ol|h\d|div|br)\b[^>]*>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/&[a-z#0-9]+;/gi, " ")
        .replace(/\s+/g, " ").trim();

    function lectureChips(lecs, small) {
        return lecs.map(n =>
            `<span class="lec-chip${small ? " small" : ""}" title="Lecture ${n}: ${esc(S.lectures[n] || "")}">L${n}</span>`
        ).join("");
    }

    function statusBadge(id) {
        const st = saved.status[id];
        if (st === "got") return `<span class="status got" title="Marked: got it">${icon("check")}</span>`;
        if (st === "review") return `<span class="status review" title="Marked: review again">${icon("arrow-clockwise")}</span>`;
        return "";
    }

    // Tiny Java highlighter: comments, strings, annotations, keywords, numbers.
    const JAVA_RE = /(\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*")|(@\w+)|\b(public|private|protected|class|interface|abstract|extends|implements|return|if|else|new|try|catch|finally|throw|throws|while|for|static|final|void|int|long|double|float|char|byte|short|boolean|this|super|null|true|false|instanceof|package|import|def|elif|raise|self|None|True|False)\b|\b(\d+)\b/gm;

    function highlight(code) {
        let out = "", last = 0, m;
        JAVA_RE.lastIndex = 0;
        while ((m = JAVA_RE.exec(code))) {
            out += esc(code.slice(last, m.index));
            const cls = m[1] ? "c" : m[2] ? "s" : m[3] ? "a" : m[4] ? "k" : "n";
            out += `<span class="tok-${cls}">${esc(m[0])}</span>`;
            last = m.index + m[0].length;
        }
        return out + esc(code.slice(last));
    }

    function codeBlock(code) {
        return `<div class="codeblock"><button class="copy-btn" type="button" data-copy>Copy</button><pre><code>${highlight(code)}</code></pre></div>`;
    }

    function celebrate(el) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = el.getBoundingClientRect();
        const colors = ["#7c5cff", "#ffc94d", "#ff7aa8", "#2fae6b", "#3f8cff"];
        for (let i = 0; i < 12; i++) {
            const s = document.createElement("span");
            s.className = "burst";
            s.innerHTML = icon(i % 3 ? "sparkle" : "star");
            s.style.color = colors[i % colors.length];
            s.style.left = r.left + r.width / 2 + "px";
            s.style.top = r.top + r.height / 2 + "px";
            const angle = (Math.PI * 2 * i) / 12;
            s.style.setProperty("--dx", Math.cos(angle) * (60 + Math.random() * 40) + "px");
            s.style.setProperty("--dy", Math.sin(angle) * (60 + Math.random() * 40) + "px");
            document.body.appendChild(s);
            setTimeout(() => s.remove(), 900);
        }
    }

    // ---------- Sidebar ----------

    function renderNav(activeId) {
        if (activeId !== undefined) nav.dataset.active = activeId;
        const current = nav.dataset.active || "";
        nav.innerHTML = S.groups.map(g => `
            <div class="nav-group">
                <div class="nav-group-title">${icon(g.icon)} ${esc(g.title)}</div>
                ${g.concepts.map(c => `
                    <a class="nav-item${c.id === current ? " active" : ""}${hasContent(c.id) ? "" : " soon"}"
                       href="#/c/${c.id}" style="--c:${c.color}" ${c.id === current ? 'aria-current="page"' : ""}>
                        <span class="nav-icon">${icon(c.icon)}</span>
                        <span class="nav-label">${esc(c.title)}</span>
                        ${hasContent(c.id) ? statusBadge(c.id) : `<span class="soon-tag">soon</span>`}
                    </a>`).join("")}
            </div>`).join("");
    }

    // ---------- Home ----------

    function renderHome() {
        const ready = allConcepts.filter(c => hasContent(c.id)).length;
        const got = allConcepts.filter(c => saved.status[c.id] === "got").length;
        const pct = Math.round((got / allConcepts.length) * 100);
        const lecs = Object.keys(S.lectures);

        main.innerHTML = `
            <section class="hero">
                <div class="hero-text">
                    <h1>${esc(S.course.title)}</h1>
                    <p>${esc(S.course.tagline)}</p>
                    <p class="hero-meta">${allConcepts.length} concepts · Lectures ${lecs[0]}–${lecs[lecs.length - 1]} · ${ready} ready so far</p>
                    <button class="btn primary" type="button" data-focus-search>${icon("magnifying-glass")} Search the notes</button>
                </div>
                <div class="ring" style="--pct:${pct}" role="img" aria-label="${got} of ${allConcepts.length} concepts marked got it">
                    <div class="ring-inner"><b>${got}</b><span>of ${allConcepts.length}<br>got it</span></div>
                </div>
            </section>
            ${S.groups.map(g => `
                <section class="home-group">
                    <h2>${icon(g.icon)} ${esc(g.title)}</h2>
                    <div class="card-grid">
                        ${g.concepts.map(c => `
                            <a class="concept-card${hasContent(c.id) ? "" : " soon"}" href="#/c/${c.id}" style="--c:${c.color}">
                                <span class="card-icon">${icon(c.icon)}</span>
                                <span class="card-title">${esc(c.title)}</span>
                                <span class="card-meta">${lectureChips(c.lectures, true)}
                                    ${hasContent(c.id) ? statusBadge(c.id) : `<span class="soon-tag">soon</span>`}</span>
                            </a>`).join("")}
                    </div>
                </section>`).join("")}
        `;
    }

    // ---------- Concept page ----------

    function renderSoon(c) {
        main.innerHTML = `
            <div class="concept-head" style="--c:${c.color}">
                <div class="concept-icon">${icon(c.icon)}</div>
                <div>
                    <h1>${esc(c.title)}</h1>
                    <div class="chips">${lectureChips(c.lectures)}</div>
                </div>
            </div>
            <div class="empty">
                <div class="empty-icon">${icon("hourglass-medium")}</div>
                <h2>Coming soon</h2>
                <p>This concept will be built from ${c.lectures.map(n => `Lecture ${n} (${esc(S.lectures[n])})`).join(", ")}.</p>
                <a class="btn" href="#/c/interfaces">Try a finished concept: ${icon("puzzle-piece")} Interfaces &amp; Abstract Classes</a>
            </div>`;
    }

    function renderConcept(id, tab, section) {
        const c = conceptById[id];
        if (!c) { location.hash = "#/"; return; }
        if (!hasContent(id)) { renderSoon(c); return; }

        const d = S.content[id];
        if (!TABS.some(t => t.id === tab)) tab = "summary";
        const st = saved.status[id];

        main.innerHTML = `
            <div class="concept" style="--c:${c.color}">
                <div class="concept-head">
                    <div class="concept-icon">${icon(c.icon)}</div>
                    <div>
                        <div class="concept-group">${icon(c.group.icon)}${esc(c.group.title)}</div>
                        <h1>${esc(c.title)}</h1>
                        <div class="chips">${lectureChips(c.lectures)}</div>
                    </div>
                </div>

                <div class="one-liner"><span class="one-liner-label">In one sentence</span>${d.oneLiner}</div>

                <div class="tabs" role="tablist" aria-label="${esc(c.title)} sections">
                    ${TABS.map(t => `
                        <a class="tab${t.id === tab ? " active" : ""}" role="tab" href="#/c/${id}/${t.id}"
                           aria-selected="${t.id === tab}">${icon(t.icon)} ${t.label}</a>`).join("")}
                </div>

                <div class="tab-panel" role="tabpanel" id="tab-panel"></div>

                <div class="concept-foot">
                    <div class="feel">
                        <span>How’s this concept feeling?</span>
                        <button type="button" class="pill got${st === "got" ? " on" : ""}" data-status="got">${icon("check")} Got it</button>
                        <button type="button" class="pill review${st === "review" ? " on" : ""}" data-status="review">${icon("arrow-clockwise")} Review again</button>
                    </div>
                    ${d.related && d.related.length ? `
                    <div class="related">
                        <span>Related:</span>
                        ${d.related.map(r => conceptById[r]).filter(Boolean).map(r =>
                            `<a class="related-chip" href="#/c/${r.id}" style="--c:${r.color}">${icon(r.icon)}${esc(r.title)}</a>`).join("")}
                    </div>` : ""}
                </div>
            </div>`;

        const panel = document.getElementById("tab-panel");
        ({ summary: renderSummary, details: renderDetails, code: renderCode, practice: renderPractice })[tab](panel, d, c);
        CRAMLET.decorateIcons(panel);

        main.querySelectorAll("[data-status]").forEach(b =>
            b.addEventListener("click", () => {
                setStatus(id, b.dataset.status);
                if (saved.status[id] === "got") { celebrate(b); buddy.cheerChip(); }
                renderConcept(id, tab);
            }));

        if (section) {
            const target = document.getElementById("sec-" + section);
            if (target) {
                requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
                target.classList.add("flash");
                setTimeout(() => target.classList.remove("flash"), 1600);
            }
        }
    }

    function renderSummary(panel, d) {
        const s = d.summary;
        panel.innerHTML = `
            <h2 class="panel-title">Key ideas</h2>
            <ul class="keypoints">
                ${s.keyPoints.map(k => `<li${k.kind ? ` class="kp-${k.kind}"` : ""}>${k.kind ? icon(k.kind, "kp-ic") : ""}<span class="kp-text">${k.html}</span>${lectureChips(k.lec, true)}</li>`).join("")}
            </ul>
            ${s.compare ? `
                <h2 class="panel-title">At a glance</h2>
                <div class="table-wrap"><table class="compare">
                    <thead><tr>${s.compare.head.map(h => `<th>${h}</th>`).join("")}</tr></thead>
                    <tbody>${s.compare.rows.map(r => `<tr>${r.map((cell, i) => i === 0 ? `<th scope="row">${cell}</th>` : `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
                </table></div>` : ""}
        `;
    }

    function renderDetails(panel, d, c) {
        panel.innerHTML = `
            <div class="toc">
                <span class="toc-label">Jump to</span>
                ${d.details.map(s => `<a href="#/c/${c.id}/details/${s.id}">${esc(s.title)}</a>`).join("")}
            </div>
            ${d.details.map(s => `
                <section class="detail" id="sec-${s.id}">
                    <h3>${esc(s.title)} ${lectureChips(s.lec, true)}</h3>
                    <div class="prose">${s.html}</div>
                    ${s.widget === "hierarchy" ? `<div class="hierarchy" id="hierarchy"></div>` : ""}
                </section>`).join("")}
        `;
        if (d.hierarchy) mountHierarchy(document.getElementById("hierarchy"), d.hierarchy);
    }

    function renderCode(panel, d) {
        panel.innerHTML = d.code.map(ex => `
            <section class="code-ex">
                <h3>${esc(ex.title)} ${lectureChips(ex.lec, true)}</h3>
                ${codeBlock(ex.code)}
                ${ex.note ? `<p class="code-note callout tip">${ex.note}</p>` : ""}
            </section>`).join("");
    }

    // ---------- Practice: flashcards + quiz ----------

    function renderPractice(panel, d, c) {
        const mode = (saved.practiceMode === "quiz") ? "quiz" : "cards";
        panel.innerHTML = `
            <div class="seg" role="group" aria-label="Practice mode">
                <button type="button" class="seg-btn${mode === "cards" ? " active" : ""}" data-mode="cards">${icon("cards")} Flashcards <span class="count">${d.flashcards.length}</span></button>
                <button type="button" class="seg-btn${mode === "quiz" ? " active" : ""}" data-mode="quiz">${icon("list-checks")} Quiz <span class="count">${d.quiz.length}</span></button>
            </div>
            <div id="practice-area"></div>`;
        panel.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => {
            saved.practiceMode = b.dataset.mode;
            save();
            renderPractice(panel, d, c);
        }));
        const area = document.getElementById("practice-area");
        if (mode === "cards") mountFlashcards(area, d.flashcards);
        else mountQuiz(area, d.quiz);
    }

    let keyHandler = null;
    function setKeyHandler(fn) {
        if (keyHandler) document.removeEventListener("keydown", keyHandler);
        keyHandler = fn;
        if (fn) document.addEventListener("keydown", fn);
    }

    function mountFlashcards(area, cards) {
        let order = cards.map((_, i) => i);
        let i = 0, flipped = false;
        const seen = new Set();
        let mood = "idle", line = buddy.say("cardsStart"), anim = "", deckDone = false;

        function draw() {
            const card = cards[order[i]];
            area.innerHTML = `
                <div class="flash-wrap">
                    <button type="button" class="flashcard${flipped ? " flipped" : ""}" aria-label="Flashcard. Click to flip.">
                        <span class="face front"><span class="face-label">Term</span><span class="face-body">${card.front}</span><span class="hint">click or press space to flip</span></span>
                        <span class="face back"><span class="face-label">Answer</span><span class="face-body">${card.back}</span></span>
                    </button>
                    <div class="flash-controls">
                        <button type="button" class="btn" data-act="prev" aria-label="Previous card">←</button>
                        <span class="flash-count">${i + 1} / ${cards.length}</span>
                        <button type="button" class="btn" data-act="next" aria-label="Next card">→</button>
                        <button type="button" class="btn ghost" data-act="shuffle">${icon("shuffle")} Shuffle</button>
                    </div>
                    <div class="dots">${order.map((_, k) => `<span class="dot${k === i ? " on" : ""}"></span>`).join("")}</div>
                    <div class="flash-buddy">
                        <span class="fb-av"></span>
                        <span class="buddy-say" aria-live="polite">${esc(line)}</span>
                    </div>
                </div>`;
            buddy.react(area.querySelector(".fb-av"), mood, anim);
            anim = "";
            area.querySelector(".flashcard").addEventListener("click", flip);
            area.querySelector('[data-act="prev"]').addEventListener("click", () => go(-1));
            area.querySelector('[data-act="next"]').addEventListener("click", () => go(1));
            area.querySelector('[data-act="shuffle"]').addEventListener("click", () => {
                order = order.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(p => p[1]);
                i = 0; flipped = false; draw();
            });
        }
        function flip() {
            flipped = !flipped;
            area.querySelector(".flashcard").classList.toggle("flipped", flipped);
            if (!flipped) return;
            seen.add(order[i]);
            if (!deckDone && seen.size === cards.length) {
                deckDone = true;
                mood = "cheer"; anim = "party"; line = buddy.say("deck");
                celebrate(area.querySelector(".fb-av"));
            } else {
                mood = "happy"; anim = "bounce"; line = buddy.say("flip");
            }
            buddy.react(area.querySelector(".fb-av"), mood, anim);
            area.querySelector(".flash-buddy .buddy-say").textContent = line;
            anim = "";
        }
        function go(step) {
            i = (i + step + cards.length) % cards.length;
            flipped = false;
            if (!deckDone) mood = "idle";
            draw();
        }
        setKeyHandler(e => {
            if (!document.body.contains(area) || e.target.matches("input, textarea")) return;
            if (e.key === " ") { e.preventDefault(); flip(); }
            else if (e.key === "ArrowRight") go(1);
            else if (e.key === "ArrowLeft") go(-1);
        });
        draw();
    }

    function mountQuiz(area, questions) {
        setKeyHandler(null);
        let pool = questions.map((_, i) => i);
        let pos = 0;
        let results = {}; // question index -> true/false

        function draw() {
            if (pos >= pool.length) return drawEnd();
            const qi = pool[pos];
            const q = questions[qi];
            const options = q.type === "tf" ? ["True", "False"] : q.options;

            let body;
            if (q.type === "bug") {
                body = `<div class="bug-code" role="group" aria-label="Code lines">
                    ${q.lines.map((ln, k) => `<button type="button" class="bug-line" data-pick="${k}">
                        <span class="ln">${k + 1}</span><code>${highlight(ln) || "&nbsp;"}</code></button>`).join("")}
                </div>`;
            } else {
                body = `${q.code ? codeBlock(q.code) : ""}
                <div class="options">
                    ${options.map((o, k) => `<button type="button" class="option" data-pick="${k}">
                        <span class="opt-letter">${"ABCD"[k]}</span><span>${o}</span></button>`).join("")}
                </div>`;
            }

            area.innerHTML = `
                <div class="quiz">
                    <div class="quiz-progress">
                        <span>Question ${pos + 1} of ${pool.length}</span>
                        <div class="bar"><div style="width:${(pos / pool.length) * 100}%"></div></div>
                        ${lectureChips(q.lec || [], true)}
                    </div>
                    <div class="question">${q.q}</div>
                    ${body}
                    <div class="feedback" hidden></div>
                    <div class="quiz-next" hidden><button type="button" class="btn primary" data-next>${pos + 1 < pool.length ? "Next question →" : "See results"}</button></div>
                </div>`;

            area.querySelectorAll("[data-pick]").forEach(btn => btn.addEventListener("click", () => {
                const pick = Number(btn.dataset.pick);
                const correctIdx = q.type === "tf" ? (q.answer ? 0 : 1) : q.answer;
                const right = pick === correctIdx;
                results[qi] = right;

                area.querySelectorAll("[data-pick]").forEach(b => {
                    b.disabled = true;
                    if (Number(b.dataset.pick) === correctIdx) b.classList.add("correct");
                });
                if (!right) btn.classList.add("wrong");
                else celebrate(btn);

                const fb = area.querySelector(".feedback");
                fb.hidden = false;
                fb.className = "feedback " + (right ? "good" : "bad");
                fb.innerHTML = `<span class="fb-av"></span>
                    <div class="fb-text"><b>${esc(buddy.say(right ? "right" : "wrong"))}</b> ${q.explain}</div>`;
                buddy.react(fb.querySelector(".fb-av"), right ? "happy" : "oops", right ? "bounce" : "wobble");
                const next = area.querySelector(".quiz-next");
                next.hidden = false;
                next.querySelector("button").focus();
            }));
            area.querySelector("[data-next]").addEventListener("click", () => { pos++; draw(); });
        }

        function drawEnd() {
            const missed = pool.filter(qi => !results[qi]);
            const right = pool.length - missed.length;
            const perfect = missed.length === 0;
            const good = right / pool.length >= 0.7;
            area.innerHTML = `
                <div class="quiz-end">
                    <div class="end-buddy"></div>
                    <p class="end-say buddy-say">${esc(buddy.say(perfect ? "perfect" : good ? "good" : "keepGoing"))}</p>
                    <h3>${perfect ? "Perfect round!" : `You got ${right} of ${pool.length}`}</h3>
                    <p>${perfect ? "You really know this one. Consider marking it “Got it” below." : "Missed questions are great to revisit. Try just those again:"}</p>
                    ${missed.length ? `<ul class="missed">${missed.map(qi => `<li>${stripTags(questions[qi].q)}</li>`).join("")}</ul>` : ""}
                    <div class="end-actions">
                        ${missed.length ? `<button type="button" class="btn primary" data-retry>${icon("arrow-clockwise")} Retry missed (${missed.length})</button>` : ""}
                        <button type="button" class="btn" data-restart>Start over</button>
                    </div>
                </div>`;
            const retry = area.querySelector("[data-retry]");
            if (retry) retry.addEventListener("click", () => { pool = missed; pos = 0; results = {}; draw(); });
            area.querySelector("[data-restart]").addEventListener("click", () => { pool = questions.map((_, i) => i); pos = 0; results = {}; draw(); });
            buddy.react(area.querySelector(".end-buddy"), perfect ? "cheer" : good ? "happy" : "idle", perfect ? "party" : "bounce");
            if (perfect) celebrate(area.querySelector(".end-buddy"));
        }

        draw();
    }

    // ---------- Interactive class hierarchy ----------

    function mountHierarchy(el, h) {
        const nodes = h.nodes;
        const parents = n => [...(nodes[n].extends || []), ...(nodes[n].implements || [])];
        function ancestors(n, acc = new Set()) {
            parents(n).forEach(p => { if (!acc.has(p)) { acc.add(p); ancestors(p, acc); } });
            return acc;
        }
        const kindLabel = { interface: "«interface»", abstract: "«abstract»", class: "class" };

        el.innerHTML = `
            <div class="hier-legend">
                <span><i class="sw interface"></i>interface</span>
                <span><i class="sw abstract"></i>abstract class</span>
                <span><i class="sw class"></i>concrete class</span>
                <span><i class="ln-solid"></i>extends</span>
                <span><i class="ln-dashed"></i>implements</span>
            </div>
            <div class="hier-stage">
                <svg class="hier-lines" aria-hidden="true"></svg>
                ${h.rows.map(row => `<div class="hier-row">${row.map(n => `
                    <button type="button" class="hnode ${nodes[n].kind}" data-node="${n}">
                        <span class="hkind">${kindLabel[nodes[n].kind]}</span>
                        <span class="hname">${n}</span>
                    </button>`).join("")}</div>`).join("")}
            </div>
            <div class="hier-info" aria-live="polite">
                <p class="hier-placeholder">${h.hint || "Click a box above to see what it is and which methods you can call on it."}</p>
            </div>`;

        const stage = el.querySelector(".hier-stage");
        const svg = el.querySelector(".hier-lines");

        function drawLines() {
            const box = stage.getBoundingClientRect();
            svg.setAttribute("width", box.width);
            svg.setAttribute("height", box.height);
            let paths = "";
            Object.keys(nodes).forEach(child => {
                const cEl = stage.querySelector(`[data-node="${child}"]`);
                const add = (parent, dashed) => {
                    const pEl = stage.querySelector(`[data-node="${parent}"]`);
                    if (!cEl || !pEl) return;
                    const a = cEl.getBoundingClientRect(), b = pEl.getBoundingClientRect();
                    const x1 = a.left + a.width / 2 - box.left, y1 = a.top - box.top;
                    const x2 = b.left + b.width / 2 - box.left, y2 = b.bottom - box.top;
                    const my = (y1 + y2) / 2;
                    paths += `<path data-from="${child}" data-to="${parent}" class="${dashed ? "dashed" : ""}" d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}" />`;
                };
                (nodes[child].extends || []).forEach(p => add(p, false));
                (nodes[child].implements || []).forEach(p => add(p, true));
            });
            svg.innerHTML = paths;
        }

        function select(name) {
            const anc = ancestors(name);
            stage.querySelectorAll(".hnode").forEach(b => {
                const n = b.dataset.node;
                b.classList.toggle("selected", n === name);
                b.classList.toggle("ancestor", anc.has(n));
                b.classList.toggle("dim", n !== name && !anc.has(n));
            });
            svg.querySelectorAll("path").forEach(p => {
                const on = (p.dataset.from === name || anc.has(p.dataset.from)) && anc.has(p.dataset.to);
                p.classList.toggle("on", on);
            });

            const node = nodes[name];
            const chain = [name, ...anc];
            const methods = [];
            chain.forEach(n => (nodes[n].methods || []).forEach(m => {
                if (!methods.some(x => x.m === m)) methods.push({ m, from: n });
            }));
            const isTypes = [...anc];
            el.querySelector(".hier-info").innerHTML = `
                <div class="hi-head"><span class="hkind-pill ${node.kind}">${kindLabel[node.kind]}</span> <b>${name}</b></div>
                <p>${node.note}</p>
                ${isTypes.length ? `<p><b>${name} is-a:</b> ${isTypes.map(t => `<code>${t}</code>`).join(", ")}</p>` : `<p><b>${name}</b> is the top of the hierarchy.</p>`}
                <p><b>Methods you can call on it:</b></p>
                <div class="method-list">${methods.map(x => `<span class="method"><code>${x.m}</code><small>from ${x.from}</small></span>`).join("")}</div>
                ${node.kind !== "class" ? `<p class="muted"><i class="inline-ic ic-warn">${icon("warning")}</i> ${node.kind === "interface" ? "Interfaces" : "Abstract classes"} can’t be created with <code>new</code>.</p>` : ""}`;
        }

        stage.querySelectorAll(".hnode").forEach(b => b.addEventListener("click", () => select(b.dataset.node)));
        requestAnimationFrame(drawLines);
        if (window.ResizeObserver) new ResizeObserver(drawLines).observe(stage);
    }

    // ---------- Search ----------

    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    const index = [];

    allConcepts.forEach(c => {
        index.push({ concept: c, title: c.title, where: "Concept", text: c.title, href: `#/c/${c.id}` });
        const d = S.content[c.id];
        if (!d) return;
        d.summary.keyPoints.forEach(k => index.push({ concept: c, title: "Key idea", where: "Summary", text: stripTags(k.html), href: `#/c/${c.id}/summary` }));
        d.details.forEach(s => index.push({ concept: c, title: s.title, where: "Details", text: s.title + " " + stripTags(s.html), href: `#/c/${c.id}/details/${s.id}` }));
        d.code.forEach(ex => index.push({ concept: c, title: ex.title, where: "Code", text: ex.title + " " + ex.code + " " + stripTags(ex.note || ""), href: `#/c/${c.id}/code` }));
        d.flashcards.forEach(f => index.push({ concept: c, title: stripTags(f.front), where: "Flashcard", text: stripTags(f.front + " " + f.back), href: `#/c/${c.id}/practice` }));
    });

    let activeResult = -1;

    function snippet(text, words) {
        const lower = text.toLowerCase();
        const at = Math.max(0, lower.indexOf(words[0]));
        const start = Math.max(0, at - 40);
        let s = (start > 0 ? "…" : "") + text.slice(start, start + 120) + (start + 120 < text.length ? "…" : "");
        s = esc(s);
        words.forEach(w => {
            const re = new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
            s = s.replace(re, "<mark>$1</mark>");
        });
        return s;
    }

    function runSearch() {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) { searchResults.hidden = true; return; }
        const words = q.split(/\s+/);
        const hits = index
            .filter(e => words.every(w => e.text.toLowerCase().includes(w)))
            .map(e => ({ e, score: (e.title.toLowerCase().includes(q) ? 10 : 0) + (e.where === "Concept" ? 5 : 0) + (e.where === "Details" ? 2 : 0) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 8);

        activeResult = hits.length ? 0 : -1;
        const r = searchInput.getBoundingClientRect();
        searchResults.style.left = r.left + "px";
        searchResults.style.top = r.bottom + 6 + "px";
        searchResults.hidden = false;
        searchResults.innerHTML = hits.length
            ? hits.map(({ e }, k) => `
                <a class="result${k === 0 ? " active" : ""}" role="option" href="${e.href}" style="--c:${e.concept.color}">
                    <span class="r-top"><span class="r-icon">${icon(e.concept.icon)}</span><b>${esc(e.title)}</b><span class="r-where">${e.where}</span></span>
                    <span class="r-snip">${e.where === "Concept" ? esc(e.concept.group.title) + (hasContent(e.concept.id) ? "" : " · coming soon") : snippet(e.text, words)}</span>
                </a>`).join("")
            : `<div class="no-results">No matches for “${esc(q)}”. Try a different word.</div>`;
    }

    function moveActive(step) {
        const items = [...searchResults.querySelectorAll(".result")];
        if (!items.length) return;
        activeResult = (activeResult + step + items.length) % items.length;
        items.forEach((it, k) => it.classList.toggle("active", k === activeResult));
        items[activeResult].scrollIntoView({ block: "nearest" });
    }

    function closeSearch() {
        searchResults.hidden = true;
        searchInput.value = "";
        searchInput.blur();
    }

    searchInput.addEventListener("input", runSearch);
    searchInput.addEventListener("keydown", e => {
        if (e.key === "ArrowDown") { e.preventDefault(); moveActive(1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
        else if (e.key === "Enter") {
            const items = searchResults.querySelectorAll(".result");
            if (items[activeResult]) { location.hash = items[activeResult].getAttribute("href"); closeSearch(); }
        } else if (e.key === "Escape") closeSearch();
    });
    searchResults.addEventListener("click", e => { if (e.target.closest(".result")) closeSearch(); });
    document.addEventListener("click", e => { if (!e.target.closest(".search")) searchResults.hidden = true; });
    document.addEventListener("keydown", e => {
        if (e.key === "/" && !e.target.matches("input, textarea")) { e.preventDefault(); searchInput.focus(); }
    });

    // ---------- Global click handlers ----------

    document.addEventListener("click", e => {
        const copy = e.target.closest("[data-copy]");
        if (copy) {
            const text = copy.parentElement.querySelector("code").innerText;
            const done = () => { copy.textContent = "Copied!"; setTimeout(() => (copy.textContent = "Copy"), 1200); };
            if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => {});
        }
        if (e.target.closest("[data-focus-search]")) searchInput.focus();
    });

    // ---------- Router ----------

    function route() {
        setKeyHandler(null);
        const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
        if (parts[0] === "c" && parts[1]) {
            renderNav(parts[1]);
            renderConcept(parts[1], parts[2] || "summary", parts[3]);
            const c = conceptById[parts[1]];
            document.title = (c ? c.title + " · " : "") + "cramlet";
        } else {
            renderNav("");
            renderHome();
            document.title = "Program Design & Implementation · cramlet";
        }
        if (!parts[3]) window.scrollTo(0, 0);
    }

    window.addEventListener("hashchange", route);
    route();
    buddy.welcomeIfNew();
})();
