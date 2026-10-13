// Crumb Run (a Test Kitchen tool; this file was first called Last Crumbs): a short, guided last-minute session built on what the research supports.
//   Tonight (25 min): recall first, then flip and rate yourself. Missed cards come back until you get each one
//     right once (successive relearning), topics are mixed (interleaving), and it ends with "lights out",
//     because sleep right after studying helps memory stick.
//   Morning of (10 min): relearn last night's hardest cards (study, sleep, relearn), an optional brain dump
//     (writing out worries before an exam), and a pep talk that reframes nerves as energy.
// Cards come from what the visitor already has: missed-deck questions, missed Myth or fact statements, the
// course's examples (S.cast), and flashcards, weighted toward concepts under 70% on the last practice exam.
// Routes: #/last-crumbs (start), #/last-crumbs/go (the session). Saved in cramlet.lastcrumbs.<course>.
(function () {
    "use strict";

    const MODES = {
        night: { name: "Tonight", icon: "moon", minutes: 25, size: 30 },
        morning: { name: "Morning of", icon: "sun", minutes: 10, size: 15 },
    };
    const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } };
    const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const mmss = ms => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
    // Evenings and late nights suggest Tonight; mornings and early afternoons suggest Morning of.
    const suggested = () => { const h = new Date().getHours(); return h >= 15 || h < 4 ? "night" : "morning"; };

    function render(main, ctx, parts) {
        const { S, COURSE, esc, icon, codeBlock, highlight, exampleRef, conceptById, allConcepts, celebrate, setKeyHandler } = ctx;
        const KEY = `cramlet.lastcrumbs.${COURSE}`;
        const buddy = CRAMLET.buddy, progress = CRAMLET.progress;
        const state = () => read(KEY, { seen: {} });
        const save = v => write(KEY, v);
        const Q = CRAMLET.exam ? CRAMLET.exam.questionsById(S, allConcepts) : {};
        const idFor = t => progress.idFor(t);

        // ---------- Cards ----------
        // A card is stored as an id: q:<question id>, m:<myth id>, x:<example name>, f:<concept>:<front id>.
        const castItems = (S.cast || []).flatMap(g => g.items.map(it => ({ ...it, group: g })));
        function cardOf(id) {
            const [kind, ...rest] = id.split(":"), key = rest.join(":");
            if (kind === "q") { const q = Q[key]; return q && { id, kind, q, concept: q.concept, src: "From your missed deck" }; }
            if (kind === "m") { const m = CRAMLET.myths && CRAMLET.myths.get(key); return m && { id, kind, m, concept: m.c, src: "A myth or fact that got you" }; }
            if (kind === "x") { const it = castItems.find(x => x.name === key); return it && { id, kind, it, concept: it.c, src: "An example the exam names" }; }
            if (kind === "f") {
                const [cid, fid] = [rest[0], rest.slice(1).join(":")];
                const fc = ((S.content[cid] || {}).flashcards || []).find(f => idFor(f.front) === fid);
                return fc && { id, kind, fc, concept: cid, src: "Flashcard" };
            }
            return null;
        }
        const flashIds = cid => ((S.content[cid] || {}).flashcards || []).map(f => `f:${cid}:${idFor(f.front)}`);

        // Concepts under 70% on the latest practice exam.
        function weakConcepts() {
            const R = CRAMLET.exam && CRAMLET.exam.latest(COURSE);
            if (!R) return [];
            const by = {};
            R.items.forEach(x => { by[x.concept] = by[x.concept] || [0, 0]; by[x.concept][0] += x.earned; by[x.concept][1] += x.max; });
            return Object.entries(by).filter(([, [e, m]]) => m && e / m < 0.7).map(([c]) => c).filter(c => S.content[c]);
        }

        // Pick the deck: your misses first, then the examples, then flashcards from weak concepts, topped up with
        // flashcards you've seen least. Then mix them all together.
        function buildDeck(mode) {
            const st = state(), seen = st.seen || {};
            const M = MODES[mode], picked = [], counts = {};
            const add = (ids, max, label) => { let n = 0; for (const id of ids) { if (picked.length >= M.size || n >= max) break; if (!picked.includes(id) && cardOf(id)) { picked.push(id); n++; } } if (n) counts[label] = (counts[label] || 0) + n; };
            const leastSeen = ids => shuffle(ids.slice()).sort((a, b) => ((seen[a] || {}).got || 0) - ((seen[b] || {}).got || 0));
            const night = st.lastNight && Date.now() - st.lastNight.at < 20 * 3600000 ? st.lastNight : null;
            if (mode === "morning" && night) {
                add(shuffle(night.hard.slice()), M.size, "tricky from last night");
                add(shuffle((night.left || []).slice()), 6, "left over from last night");
            }
            const missedQ = CRAMLET.exam ? CRAMLET.exam.missedIds(COURSE).map(id => "q:" + id) : [];
            const missedM = CRAMLET.myths ? CRAMLET.myths.missed(COURSE).map(m => "m:" + m.id) : [];
            add(shuffle(missedQ), mode === "night" ? 10 : 5, "from your missed deck");
            add(shuffle(missedM), mode === "night" ? 6 : 3, "myths that got you");
            // Examples you haven't nailed yet come first.
            const cast = castItems.map(it => "x:" + it.name);
            add(shuffle(cast).sort((a, b) => ((seen[b] || {}).miss || 0) - ((seen[a] || {}).miss || 0) || ((seen[a] || {}).got || 0) - ((seen[b] || {}).got || 0)), mode === "night" ? 6 : 3, "course examples");
            const weak = weakConcepts();
            add(leastSeen(weak.flatMap(flashIds)), mode === "night" ? 10 : 4, "flashcards from weak concepts");
            add(leastSeen(allConcepts.filter(c => S.content[c.id]).flatMap(c => flashIds(c.id))), M.size, "flashcards");
            return { ids: shuffle(picked), counts, weak, night: !!night };
        }

        // ---------- Card faces ----------
        const letter = k => "ABCDEFG"[k];
        function frontOf(card) {
            if (card.kind === "m") return `<div class="lc-prompt">Myth or fact?</div><div class="lc-big">${card.m.s}</div>`;
            if (card.kind === "x") return `<div class="lc-prompt">What is it, and why does it matter?</div><div class="lc-big"><code>${esc(card.it.name)}</code> <span class="cast-kind">${esc(card.it.kind)}</span></div><p class="muted">${esc(card.it.group.title)}</p>`;
            if (card.kind === "f") return `<div class="lc-prompt">What does this mean?</div><div class="lc-big">${card.fc.front}</div>`;
            const q = card.q;
            let media = exampleRef(q);
            if (q.machine && CRAMLET.automata) media += `<div class="quiz-machine">${CRAMLET.automata.render(q.machine)}</div>`;
            if (q.type === "fill") media += codeBlock(q.code.replace(/\[\[\d+\]\]/g, "____"));
            else if (q.type === "bug") media += `<div class="bug-code">${q.lines.map((ln, k) => `<div class="bug-line"><span class="ln">${k + 1}</span><code>${highlight(ln) || "&nbsp;"}</code></div>`).join("")}</div>`;
            else if (q.code) media += codeBlock(q.code);
            const opts = q.options && ["mc", "design", "multi"].includes(q.type)
                ? `<ol class="lc-opts">${q.options.map((o, k) => `<li><span class="opt-letter">${letter(k)}</span><span>${o}</span></li>`).join("")}</ol>` : "";
            const how = { mc: "Pick one", design: "Pick one, and know why", multi: "Pick every one that’s true", tf: "True or false?", trace: "What happens?", bug: "Which line is the bug?", fill: "Fill in the blanks", parsons: "Picture the code", write: "Sketch the code in your head" }[q.type] || "";
            return `<div class="lc-prompt">${how}</div><div class="lc-big">${q.q}</div>${media}${opts}`;
        }
        function backOf(card) {
            if (card.kind === "m") return `<p><span class="tag ${card.m.fact ? "yes" : "no"}">${card.m.fact ? "Fact" : "Myth"}</span> ${card.m.why}</p>`;
            if (card.kind === "x") return `<p>${card.it.html}</p>${card.it.group.ref ? exampleRef({ ref: card.it.group.ref }) : ""}`;
            if (card.kind === "f") return `<p>${card.fc.back}</p>`;
            const q = card.q;
            let ans = "";
            if (q.type === "mc" || q.type === "design") ans = `<b>${letter(q.answer)}.</b> ${q.options[q.answer]}`;
            else if (q.type === "multi") ans = q.answers.map(k => `<b>${letter(k)}.</b> ${q.options[k]}`).join("<br>");
            else if (q.type === "tf") ans = q.answer ? "True" : "False";
            else if (q.type === "bug") ans = `Line ${q.answer + 1}: <code>${esc(q.lines[q.answer].trim())}</code>${q.fixes ? `<br>Fix: ${q.fixes[q.fix]}` : ""}`;
            else if (q.type === "trace") ans = q.out.kind === "output" ? `<pre class="mini">${esc(q.out.text)}</pre>` : q.out.kind === "compile" ? "Compile error" : "Runtime exception";
            else if (q.type === "fill") ans = q.blanks.map((b, k) => `${k + 1}: <code>${esc(b[0])}</code>`).join(" · ");
            else if (q.type === "parsons") ans = codeBlock(q.lines.join("\n"));
            else if (q.type === "write") ans = codeBlock(q.model);
            return `<div class="lc-answer"><div class="side-title">Answer</div>${ans}</div>
                ${q.type === "design" && q.model ? `<p>${q.model}</p>` : ""}
                ${q.explain ? `<p>${q.explain}</p>` : ""}`;
        }

        // ---------- Start ----------
        function drawStart() {
            const st = state(), sug = suggested();
            const active = st.session && st.session.step !== "end" ? st.session : null;
            const plan = { night: buildDeck("night"), morning: buildDeck("morning") };
            const card = mode => {
                const M = MODES[mode], p = plan[mode];
                const what = Object.entries(p.counts).map(([k, n]) => `${n} ${n === 1 ? k.replace(/\b(myths|examples|flashcards)\b/, w => w.slice(0, -1)) : k}`).join(" · ");
                return `<div class="lc-mode${mode === sug ? " suggested" : ""}">
                    <div class="lc-mode-top"><span class="lc-mode-ic">${icon(M.icon)}</span><h2>${M.name}</h2>${mode === sug ? `<span class="tag ok">Right now</span>` : ""}</div>
                    ${mode === "night"
                        ? `<p>${M.minutes} minutes of quick recall, then lights out. Missed cards come back until you get them.</p>`
                        : `<p>${M.minutes} minutes: relearn ${p.night ? "last night’s tricky cards" : "your weak spots"}, an optional brain dump, and a pep talk.</p>`}
                    <p class="muted lc-what">${p.ids.length ? `${p.ids.length} cards: ${what}` : "No cards yet."}</p>
                    <button type="button" class="btn${mode === sug ? " primary" : ""}" data-start="${mode}" ${p.ids.length ? "" : "disabled"}>${icon(M.icon)} Start ${M.name.toLowerCase()}</button>
                </div>`;
            };
            main.innerHTML = `
                <div class="lc">
                    ${CRAMLET.kitchen.header(ctx, "run", { line: "The last bits before an exam, done the way the research says works: <b>recall instead of rereading</b>, keep going until you get each one, then <b>sleep</b>, and relearn in the morning.", mood: "happy" })}
                    <div class="kh-slim"><span class="kh-label">Right now</span><span class="kh-grow"><b>${MODES[sug].name}</b> is the one to do now.</span>${plan.night.weak.length ? `<span class="muted lc-weak">Weighted toward ${plan.night.weak.map(c => esc(conceptById[c].title)).join(" and ")}</span>` : ""}</div>
                    ${active ? `<div class="callout key done">${icon("hourglass-medium", "callout-ic")}<div class="callout-body"><span class="callout-label">Session in progress</span>You have an unfinished ${MODES[active.mode].name.toLowerCase()} session. <button type="button" class="btn primary small" data-act="resume">Continue it</button> <button type="button" class="btn ghost small" data-act="discard">Throw it away</button></div></div>` : ""}
                    <div class="lc-modes">${card("night")}${card("morning")}</div>
                    <details class="lc-why">
                        <summary>${icon("lightbulb")} Why it works this way</summary>
                        <ul>
                            <li><b>Recall first.</b> Trying to remember before you look beats rereading, especially a day or more later. Rereading feels productive but helps much less.</li>
                            <li><b>Until you get it.</b> Missed cards come back in the same session until you get each one right. The app decides when a card is done, because when students drop cards themselves, the benefit disappears.</li>
                            <li><b>Mixed topics.</b> Shuffling concepts together trains you to tell similar ideas apart, which is what multiple choice tests.</li>
                            <li><b>Then sleep.</b> Memory consolidates during sleep, and losing sleep hurts it, so tonight’s session ends with lights out, not “just one more.”</li>
                            <li><b>Relearn in the morning.</b> Studying, sleeping, then relearning took about half the practice and was remembered much better a week later.</li>
                            <li><b>Calm the nerves.</b> Writing out worries before an exam, and reading nerves as energy instead of a threat, both helped scores in studies.</li>
                        </ul>
                    </details>
                </div>`;
            CRAMLET.kitchen.mount(main);
            main.querySelector(".lc").addEventListener("click", e => {
                const t = e.target.closest("button");
                if (!t) return;
                const s = state();
                if (t.dataset.act === "resume") { location.hash = "#/last-crumbs/go"; return; }
                if (t.dataset.act === "discard") { delete s.session; save(s); drawStart(); return; }
                if (t.dataset.start) {
                    const mode = t.dataset.start, M = MODES[mode];
                    s.session = { mode, ids: plan[mode].ids, done: [], misses: {}, start: Date.now(), deadline: Date.now() + M.minutes * 60000, step: "cards" };
                    save(s);
                    location.hash = "#/last-crumbs/go";
                }
            });
        }

        // ---------- The session ----------
        let tick = null;
        const stopTick = () => { if (tick) { clearInterval(tick); tick = null; } };
        function drawSession() {
            const st = state(), T = st.session;
            if (!T) { location.hash = "#/last-crumbs"; return; }
            if (T.step === "dump") return drawDump();
            if (T.step === "pep") return drawPep();
            if (T.step === "end") return drawEnd();
            const timeUp = Date.now() >= T.deadline;
            if (!T.ids.length) return finishCards();
            const card = cardOf(T.ids[0]);
            if (!card) { T.ids.shift(); save(st); return drawSession(); }
            const c = conceptById[card.concept];
            const total = T.done.length + T.ids.length;
            main.innerHTML = `
                <div class="lc lc-session ${T.mode}" style="--c:${c ? c.color : "var(--brand)"}">
                    <div class="quiz-progress">
                        <span class="lc-mode-name">${icon(MODES[T.mode].icon)} ${MODES[T.mode].name}</span>
                        <div class="bar"><div style="width:${(T.done.length / total) * 100}%"></div></div>
                        <span class="lc-left">${T.done.length} of ${total} done</span>
                        <span class="lc-clock${timeUp ? " up" : ""}" title="Time left">${icon("hourglass-medium")} <b>${timeUp ? "0:00" : mmss(T.deadline - Date.now())}</b></span>
                        <a class="btn ghost small" href="#/last-crumbs" title="Leave. Your place is saved.">${icon("x-circle")} Exit</a>
                    </div>
                    ${timeUp ? `<p class="lc-timeup">${icon("moon")} Time’s up. Finish this card, then ${T.mode === "night" ? "it’s lights out" : "on to the last steps"}.</p>` : ""}
                    <div class="lc-card">
                        <div class="lc-meta">${c ? `<span class="myth-concept">${icon(c.icon)} ${esc(c.title)}</span>` : ""}<span class="lc-src">${esc(card.src)}${T.misses[card.id] ? ` · back for another try` : ""}</span><span class="lc-buddy"></span></div>
                        <div class="lc-front">${frontOf(card)}</div>
                        <div class="lc-back" hidden>${backOf(card)}</div>
                        <div class="lc-actions">
                            <button type="button" class="btn primary" data-flip>Show the answer <kbd>Space</kbd></button>
                            <div class="lc-rate" hidden>
                                <button type="button" class="myth-btn myth" data-rate="miss">${icon("x-circle")} Missed it <kbd>M</kbd></button>
                                <button type="button" class="myth-btn fact" data-rate="got">${icon("check-circle")} Got it <kbd>G</kbd></button>
                            </div>
                        </div>
                    </div>
                </div>`;
            CRAMLET.decorateIcons(main);
            buddy.react(main.querySelector(".lc-buddy"), "idle");
            let flipped = false;
            const flip = () => {
                if (flipped) return;
                flipped = true;
                main.querySelector(".lc-back").hidden = false;
                main.querySelector("[data-flip]").hidden = true;
                main.querySelector(".lc-rate").hidden = false;
                buddy.react(main.querySelector(".lc-buddy"), "happy", "bounce");
            };
            const rate = got => {
                if (!flipped) return;
                const s = state(), t = s.session, id = t.ids.shift();
                const seen = (s.seen = s.seen || {})[id] || { got: 0, miss: 0 };
                if (got) {
                    t.done.push(id); seen.got++;
                    progress.award("answer", `${COURSE}:lc:${id}`, { correct: true, at: main.querySelector(".lc-buddy") });
                } else {
                    // Back in a few cards, so it's a real retrieval and not just short-term memory.
                    t.misses[id] = (t.misses[id] || 0) + 1; seen.miss++;
                    t.ids.splice(Math.min(t.ids.length, 3 + Math.floor(Math.random() * 3)), 0, id);
                }
                seen.at = Date.now();
                s.seen[id] = seen;
                save(s);
                stopTick();
                if (Date.now() >= t.deadline || !t.ids.length) return finishCards();
                drawSession();
            };
            main.querySelector("[data-flip]").addEventListener("click", flip);
            main.querySelectorAll("[data-rate]").forEach(b => b.addEventListener("click", () => rate(b.dataset.rate === "got")));
            setKeyHandler(e => {
                if (e.metaKey || e.ctrlKey || e.altKey || (e.target.closest && e.target.closest("textarea, input"))) return;
                const k = e.key.toLowerCase();
                if (!flipped && (k === " " || k === "enter")) { e.preventDefault(); flip(); }
                else if (flipped && (k === "g" || k === "arrowright")) { e.preventDefault(); rate(true); }
                else if (flipped && (k === "m" || k === "arrowleft")) { e.preventDefault(); rate(false); }
            });
            stopTick();
            tick = setInterval(() => {
                const el = main.querySelector(".lc-clock b");
                if (!el) return stopTick();
                const left = T.deadline - Date.now();
                el.textContent = left > 0 ? mmss(left) : "0:00";
                if (left <= 0 && !main.querySelector(".lc-timeup")) {
                    main.querySelector(".lc-clock").classList.add("up");
                    main.querySelector(".quiz-progress").insertAdjacentHTML("afterend", `<p class="lc-timeup">${icon("moon")} Time’s up. Finish this card, then ${T.mode === "night" ? "it’s lights out" : "on to the last steps"}.</p>`);
                }
            }, 1000);
        }

        function finishCards() {
            stopTick();
            const s = state(), t = s.session;
            // Tricky = missed at least once tonight. Cards the clock cut off carry over to the morning too.
            const hard = Object.keys(t.misses), left = t.ids.filter(id => !t.misses[id]);
            t.hard = hard;
            if (t.mode === "night") { s.lastNight = { at: Date.now(), hard, left }; t.step = "end"; }
            else t.step = "dump";
            if (!t.awarded) { progress.award("deck", `${COURSE}:lastcrumbs:${t.mode}`, {}); t.awarded = true; }
            save(s);
            drawSession();
        }

        // ---------- Morning: brain dump, then pep talk ----------
        function drawDump() {
            main.innerHTML = `
                <div class="lc lc-step">
                    <div class="lc-card">
                        <h2>${icon("note-pencil")} Brain dump <span class="muted">(optional)</span></h2>
                        <p>Take 2–5 minutes and write whatever you’re worried about for this exam: topics you’re shaky on, the clock, anything. Getting worries onto the page can free up the attention they’d otherwise take during the exam.</p>
                        <p class="muted">This stays on this screen only. It’s never saved, and it disappears when you move on.</p>
                        <textarea class="text-in lc-dump" rows="8" placeholder="I’m worried that…"></textarea>
                        <div class="build-actions"><button type="button" class="btn primary" data-next>${icon("check")} Done, let it go</button><button type="button" class="btn ghost" data-next>Skip, I feel fine</button></div>
                    </div>
                </div>`;
            setKeyHandler(null);
            main.querySelectorAll("[data-next]").forEach(b => b.addEventListener("click", () => {
                main.querySelector(".lc-dump").value = "";
                const s = state(); s.session.step = "pep"; save(s); drawSession();
            }));
        }
        function drawPep() {
            const s = state(), t = s.session;
            main.innerHTML = `
                <div class="lc lc-step">
                    <div class="lc-card lc-pep">
                        <div class="kh-eyebrow res-back"><a href="#/kitchen" data-done>${icon("chef-hat")} Test Kitchen</a></div>
                        <div class="lc-pep-buddy"></div>
                        <h2>You’re ready. ${esc(buddy.nameOf())} says so!</h2>
                        <p class="lc-reframe">Feeling jittery? That buzz is your body getting ready. It’s <b>energy</b>, and it helps you focus. You don’t need to calm down; aim it at the questions.</p>
                        <ul class="lc-tips">
                            <li>Read every option before you pick. Wrong answers are usually common misconceptions, so name the trap.</li>
                            <li>Stuck? Flag it, move on, and come back. Another question may jog your memory.</li>
                            <li>Breathe out slowly before you start. Long exhales settle the jitters.</li>
                        </ul>
                        <p class="muted">This morning: ${t.done.length} card${t.done.length === 1 ? "" : "s"} relearned.</p>
                        <div class="build-actions"><button type="button" class="btn primary" data-done>${icon("star")} Go get it</button></div>
                    </div>
                </div>`;
            buddy.react(main.querySelector(".lc-pep-buddy"), "cheer", "party");
            celebrate(main.querySelector(".lc-pep-buddy"));
            main.querySelectorAll("[data-done]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); const s2 = state(); delete s2.session; save(s2); location.hash = "#/kitchen"; }));
        }

        // ---------- Night: lights out ----------
        function drawEnd() {
            const s = state(), t = s.session;
            if (t.mode !== "night") { delete s.session; save(s); location.hash = "#/last-crumbs"; return; }
            const hard = t.hard || [];
            main.innerHTML = `
                <div class="lc lc-step">
                    <div class="lc-card lc-lights">
                        <div class="kh-eyebrow res-back"><a href="#/kitchen" data-done>${icon("chef-hat")} Test Kitchen</a></div>
                        <div class="lc-sleep"><div class="lc-sleep-buddy"></div><span class="zzz">z</span><span class="zzz">z</span><span class="zzz">z</span></div>
                        <h2>Lights out, ${esc(buddy.nameOf())}.</h2>
                        <p>You got through <b>${t.done.length}</b> card${t.done.length === 1 ? "" : "s"}${hard.length ? `, and <b>${hard.length}</b> tricky one${hard.length === 1 ? " is" : "s are"} saved for the morning` : ""}. Sleep is when tonight’s studying sticks, so this is the best next step you can take.</p>
                        <p class="muted">Tomorrow morning, open the Test Kitchen and start a Crumb Run, <b>Morning of</b>: about 10 minutes to relearn ${hard.length ? "those cards" : "your weak spots"}, plus a pep talk.</p>
                        <div class="build-actions"><button type="button" class="btn primary" data-done>${icon("moon")} Good night</button></div>
                    </div>
                </div>`;
            setKeyHandler(null);
            buddy.react(main.querySelector(".lc-sleep-buddy"), "idle");
            main.querySelectorAll("[data-done]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); const s2 = state(); delete s2.session; save(s2); location.hash = "#/kitchen"; }));
        }

        stopTick();
        if (parts[1] === "go") drawSession();
        else drawStart();
    }

    window.CRAMLET = Object.assign(window.CRAMLET || {}, { lastCrumbs: { render } });
})();
