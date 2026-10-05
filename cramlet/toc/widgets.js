// Theory of Computation playground widgets. Each registers in CRAMLET.widgets and is mounted by
// ../course/app.js as widget(el, config, ctx), where ctx has { course, concept, icon, esc, buddy, progress, celebrate, setKeyHandler }.
(function () {
    "use strict";

    const A = CRAMLET.automata;
    const W = CRAMLET.widgets || (CRAMLET.widgets = {});
    // Speed sliders draw their own filled part (see .speed input in toc.css).
    document.addEventListener("input", e => {
        const r = e.target;
        if (r.matches && r.matches(".speed input")) r.style.setProperty("--fill", ((r.value - r.min) / (r.max - r.min)) * 100 + "%");
    });
    const sub = name => A.stateLabel(name).replace(/<tspan class="sub" dy="4">(\d+)<\/tspan>/, "<sub>$1</sub>");
    const show = w => (w === "" ? "ε" : w);
    const setStr = list => `{${list.map(sub).join(", ")}}`.replace("{}", "∅");

    // ======================================================================
    // Shared parts. Every step-through widget is built from these, so they all
    // look and behave the same: diagram → status box → controls → player → two side boxes.
    // ======================================================================

    const STEP_MS = 4500; // time per step at speed 1; the default speed (3) is 1.5 s per step

    // Player: reset, back, play/pause, step, (widget extras), step counter, speed, keyboard hint.
    function playerHTML(icon, extra = "") {
        return `
            <div class="player">
                <button type="button" class="ctl" data-act="reset" title="Back to the start" aria-label="Back to the start">${icon("arrow-clockwise")}</button>
                <button type="button" class="ctl" data-act="back" title="Step back (←)" aria-label="Step back">◀</button>
                <button type="button" class="ctl play" data-act="play" title="Play or pause" aria-label="Play">▶</button>
                <button type="button" class="ctl" data-act="step" title="Step forward (→)" aria-label="Step forward">▶|</button>
                ${extra}
                <span class="step-no"></span>
                <label class="speed">Speed <input type="range" min="1" max="5" value="3" style="--fill: 50%" aria-label="Speed"></label>
                <span class="keys" aria-hidden="true"><kbd>←</kbd> <kbd>→</kbd> to step</span>
            </div>`;
    }

    // Wires up a player. o = { pos(), max(), go(k), counter(k, n), canStep() (optional) }.
    // o.go(k) should move the widget to position k and redraw (the redraw should call player.sync()).
    function bindPlayer(el, ctx, o) {
        const $ = s => el.querySelector(s);
        const can = () => !o.canStep || o.canStep();
        let timer = null, speed = 3;
        function stop() { clearInterval(timer); timer = null; }
        function step(d) {
            const k = Math.max(0, Math.min(o.max(), o.pos() + d));
            if (k !== o.pos()) o.go(k);
            if (o.pos() >= o.max()) stop();
            sync();
        }
        function play() {
            if (timer) { stop(); sync(); return; }
            if (!can()) return;
            if (o.pos() >= o.max()) o.go(0);
            timer = setInterval(() => { if (o.pos() >= o.max() || !can()) { stop(); sync(); } else step(1); }, STEP_MS / speed);
            sync();
        }
        function sync() {
            const k = o.pos(), n = o.max();
            $('[data-act="back"]').disabled = k === 0;
            $('[data-act="step"]').disabled = k >= n || !can();
            const p = $('[data-act="play"]');
            p.disabled = !timer && (!can() || n === 0);
            p.textContent = timer ? "❚❚" : "▶";
            p.setAttribute("aria-label", timer ? "Pause" : "Play");
            $(".step-no").textContent = o.counter(k, n);
        }
        $('[data-act="reset"]').addEventListener("click", () => { stop(); o.go(0); sync(); });
        $('[data-act="back"]').addEventListener("click", () => { stop(); step(-1); });
        $('[data-act="step"]').addEventListener("click", () => { stop(); step(1); });
        $('[data-act="play"]').addEventListener("click", play);
        $(".speed input").addEventListener("input", e => { speed = +e.target.value; if (timer) { stop(); play(); } });
        ctx.setKeyHandler(e => {
            if (!document.body.contains(el)) { stop(); return; }
            if (e.target.matches("input, textarea, select")) return;
            if (e.key === "ArrowRight" && can()) { stop(); step(1); }
            else if (e.key === "ArrowLeft") { stop(); step(-1); }
        });
        return { stop, sync };
    }

    // Status box: the buddy plus a message.
    //   tone:  "" (neutral), "yes" (accepted / correct / finished), "no" (rejected / wrong), "ask" (your turn)
    //   react: "" (just show the buddy), "good" (bounce), "great" (party), "bad" (wobble). Use it only on the step that earned it.
    const statusHTML = `<div class="run-status" aria-live="polite"><span class="rs-av"></span><span class="rs-text"></span></div>`;
    const REACT = { good: ["happy", "bounce"], great: ["cheer", "party"], bad: ["oops", "wobble"] };
    function setStatus(el, ctx, html, tone = "", react = "") {
        const box = el.querySelector(".run-status");
        box.className = "run-status" + (tone ? " " + tone : "");
        box.querySelector(".rs-text").innerHTML = html;
        const [mood, anim] = REACT[react] || [tone === "yes" ? "happy" : tone === "no" ? "oops" : "idle", ""];
        ctx.buddy.react(box.querySelector(".rs-av"), mood, anim);
    }

    // Two boxes side by side under the player: [[title, html], [title, html]].
    const sideHTML = boxes => `<div class="run-side">${boxes.map(([title, inner]) =>
        `<div class="side-box"><div class="side-title">${title}</div>${inner}</div>`).join("")}</div>`;

    // Recipe checklist: the rules of a construction. used = rules applied in earlier steps (✓), now = rules this step applies.
    function recipeHTML(icon, items, used, now) {
        return items.map((t, i) => {
            const cls = now.includes(i) ? "now" : used.has(i) ? "used" : "";
            return `<li class="${cls}"><span class="r-mark">${cls === "used" ? icon("check") : i + 1}</span><span>${t}</span></li>`;
        }).join("");
    }

    // String picker shared by the runners and the tester: "w = [input]  Try: [chips]".
    const inputHTML = (max, label = "Input string", extra = "") => `
        <div class="run-controls">
            <label class="input-w">w = <input type="text" inputmode="numeric" maxlength="${max}" spellcheck="false" autocomplete="off" aria-label="${label}"></label>
            <div class="examples"></div>
            ${extra}
        </div>`;
    const exampleChips = (esc, list) => list.map(x => `<button type="button" class="ex" data-w="${esc(x)}">${esc(show(x))}</button>`).join("");

    // ======================================================================
    // DFA runner: step a string through a DFA, like the sort visualizer.
    // config: { machines: [{ id, name, lang, machine, examples: [] }] }
    // ======================================================================
    W["dfa-runner"] = function (el, config, ctx) {
        const { icon, esc } = ctx;
        let m, w = "", run, k = 0, player;

        el.innerHTML = `
            <div class="runner">
                <div class="pick-row" role="group" aria-label="Choose a machine">
                    ${config.machines.map((x, i) => `<button type="button" class="pick" data-m="${i}">${esc(x.name)}</button>`).join("")}
                </div>
                <div class="lang-row">
                    <span class="lang-q">What does this machine accept?</span>
                    <span class="lang-a" hidden></span>
                    <button type="button" class="btn small" data-act="reveal">Show L(M)</button>
                </div>
                <div class="diagram"></div>
                <div class="tape" aria-label="Input tape"></div>
                ${statusHTML}
                ${inputHTML(16)}
                ${playerHTML(icon)}
                ${sideHTML([["Extended transition function", `<ol class="trace"></ol>`], ["Formal definition", `<div class="formal"></div>`]])}
            </div>`;
        const $ = s => el.querySelector(s);
        const input = $(".input-w input");

        function loadMachine(i) {
            const x = config.machines[i];
            m = x.machine;
            el.querySelectorAll(".pick").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
            $(".diagram").innerHTML = A.render(m, { label: "State diagram of the machine" });
            $(".lang-a").hidden = true; $('[data-act="reveal"]').hidden = false;
            $(".lang-a").innerHTML = x.lang;
            $(".examples").innerHTML = exampleChips(esc, x.examples);
            drawFormal();
            setInput(x.examples[0]);
        }
        function setInput(str) {
            if (player) player.stop();
            w = str.split("").filter(c => m.alphabet.includes(c)).join("");
            input.value = w;
            run = A.runDFA(m, w);
            k = 0;
            draw();
        }
        const stateAt = j => (j === 0 ? m.start : run.steps[j - 1].next);
        const done = () => k === w.length;

        function draw() {
            const q = stateAt(k), last = k > 0 ? run.steps[k - 1] : null;
            const result = done() ? (run.accepted ? "accept" : "reject") : null;
            A.highlight($(".diagram svg"), { states: [q], edge: last && { from: last.state, to: last.next }, result });

            $(".tape").innerHTML = w.length
                ? w.split("").map((c, j) => `<span class="cell${j < k ? " read" : ""}${j === k ? " head" : ""}">${esc(c)}</span>`).join("") + `<span class="cell end${done() ? " head" : ""}" aria-hidden="true">⊣</span>`
                : `<span class="cell eps head">ε</span>`;

            if (!done() && k === 0) setStatus(el, ctx, `Start in ${sub(m.start)}. Press <b>Step</b> or <b>Play</b> to read the first symbol.`);
            else if (!done()) setStatus(el, ctx, `Read <b>${esc(last.sym)}</b>: δ(${sub(last.state)}, ${esc(last.sym)}) = ${sub(last.next)}, so move to ${sub(last.next)}.`);
            else {
                const ok = run.accepted;
                setStatus(el, ctx, `${w.length ? "Done reading. " : "The input is empty, so nothing gets read. "}M ended in ${sub(q)}, which is ${ok ? "" : "<b>not</b> "}an accept state, so M <b class="${ok ? "yes" : "no"}">${ok ? "accepts" : "rejects"}</b> ${esc(show(w))}.`,
                    ok ? "yes" : "no", ok ? "good" : "bad");
            }

            $(".trace").innerHTML = Array.from({ length: k + 1 }, (_, j) =>
                `<li class="${j === k ? "now" : ""}">δ̂(${sub(m.start)}, ${esc(show(w.slice(0, j)))}) = ${sub(stateAt(j))}</li>`).join("");
            el.querySelectorAll(".formal td[data-q]").forEach(td =>
                td.classList.toggle("now", !!last && td.dataset.q === last.state && td.dataset.a === last.sym));
            if (player) player.sync();
        }
        function drawFormal() {
            const Q = Object.keys(m.states);
            $(".formal").innerHTML = `
                <p>Q = {${Q.map(sub).join(", ")}}, Σ = {${m.alphabet.join(", ")}}, q<sub>start</sub> = ${sub(m.start)}, F = {${m.accept.map(sub).join(", ")}}</p>
                <table class="delta"><thead><tr><th>δ</th>${m.alphabet.map(a => `<th>${esc(a)}</th>`).join("")}</tr></thead>
                <tbody>${Q.map(q => `<tr><th>${q === m.start ? "→" : ""}${sub(q)}${m.accept.includes(q) ? "*" : ""}</th>${m.alphabet.map(a => `<td data-q="${esc(q)}" data-a="${esc(a)}">${sub(m.delta[q][a])}</td>`).join("")}</tr>`).join("")}</tbody></table>
                <p class="muted">→ start state, * accept state</p>`;
        }

        player = bindPlayer(el, ctx, {
            pos: () => k, max: () => w.length, go: v => { k = v; draw(); },
            counter: (j, n) => (n === 0 ? "Nothing to read" : j === 0 ? "Not started" : `Read ${j} of ${n}`),
        });
        el.querySelector(".pick-row").addEventListener("click", e => { const b = e.target.closest("[data-m]"); if (b) loadMachine(+b.dataset.m); });
        $(".examples").addEventListener("click", e => { const b = e.target.closest("[data-w]"); if (b) setInput(b.dataset.w); });
        input.addEventListener("input", () => {
            const clean = input.value.split("").filter(c => m.alphabet.includes(c)).join("");
            if (clean !== input.value) input.value = clean;
            setInput(clean);
        });
        $('[data-act="reveal"]').addEventListener("click", e => { $(".lang-a").hidden = false; e.currentTarget.hidden = true; });
        loadMachine(0);
    };

    // ======================================================================
    // NFA runner: keep the SET of states the NFA could be in, one symbol at a time.
    // Optional predict mode: click the states you expect before each step.
    // config: { machines: [{ id, name, lang, machine, examples: [] }] }
    // ======================================================================
    W["nfa-runner"] = function (el, config, ctx) {
        const { icon, esc, progress, course } = ctx;
        let mi = 0, m, w = "", run, k = 0, player;
        let predict = false, guess = new Set(), checked = null, allRight = true;

        el.innerHTML = `
            <div class="runner">
                <div class="pick-row" role="group" aria-label="Choose a machine">
                    ${config.machines.map((x, i) => `<button type="button" class="pick" data-m="${i}">${esc(x.name)}</button>`).join("")}
                </div>
                <div class="lang-row">
                    <span class="lang-q">What does this NFA accept?</span>
                    <span class="lang-a" hidden></span>
                    <button type="button" class="btn small" data-act="reveal">Show L(M)</button>
                </div>
                <div class="diagram"></div>
                <div class="tape" aria-label="Input tape"></div>
                ${statusHTML}
                ${inputHTML(12, "Input string", `
                    <label class="toggle"><input type="checkbox" data-act="predict"> Predict mode</label>
                    <button type="button" class="btn primary" data-act="check" hidden>${icon("check")} Check my guess</button>`)}
                ${playerHTML(icon)}
                ${sideHTML([["Extended transition function", `<ol class="trace"></ol>`],
                    ["Every possible run at once", `<div class="grid-wrap"><table class="threads"></table></div><p class="muted">A dot means the NFA could be in that state after that many symbols.</p>`]])}
            </div>`;
        const $ = s => el.querySelector(s);
        const input = $(".input-w input");
        const svg = () => $(".diagram svg");

        function loadMachine(i) {
            const x = config.machines[i];
            mi = i; m = x.machine;
            el.querySelectorAll(".pick").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
            $(".diagram").innerHTML = A.render(m, { label: "State diagram of the NFA" });
            svg().querySelectorAll(".st").forEach(g => g.setAttribute("role", "button"));
            $(".lang-a").hidden = true; $('[data-act="reveal"]').hidden = false;
            $(".lang-a").innerHTML = x.lang;
            $(".examples").innerHTML = exampleChips(esc, x.examples);
            setInput(x.examples[0]);
        }
        function setInput(str) {
            if (player) player.stop();
            w = str.split("").filter(c => m.alphabet.includes(c)).join("");
            input.value = w;
            run = A.runNFA(m, w);
            restart();
        }
        function restart() { k = 0; guess.clear(); checked = null; allRight = true; draw(); }
        const done = () => k === w.length;
        const asking = () => predict && !done();

        function endMsg() {
            const hit = run.sets[k].filter(q => m.accept.includes(q));
            return run.accepted
                ? ` Done reading, and ${hit.map(sub).join(", ")} ${hit.length > 1 ? "are accept states" : "is an accept state"}, so at least one run accepts: M <b class="yes">accepts</b> ${esc(show(w))}.`
                : ` Done reading, and none of ${setStr(run.sets[k])} is an accept state, so every run fails: M <b class="no">rejects</b> ${esc(show(w))}.`;
        }

        function draw() {
            const cur = run.sets[k], last = k > 0 ? run.steps[k - 1] : null;
            const result = done() ? (run.accepted ? "accept" : "reject") : null;
            A.highlight(svg(), { states: cur, edges: last ? last.edges : [], result });
            svg().classList.toggle("picking", asking());
            svg().querySelectorAll(".st").forEach(g => {
                const q = g.dataset.state;
                g.classList.toggle("guess", asking() && guess.has(q));
                g.setAttribute("tabindex", asking() ? "0" : "-1");
                g.setAttribute("aria-pressed", asking() ? String(guess.has(q)) : "false");
                g.classList.toggle("guess-missed", !!checked && checked.missed.includes(q));
                g.classList.toggle("extra", !!checked && checked.extra.includes(q));
            });

            $(".tape").innerHTML = w.length
                ? w.split("").map((c, j) => `<span class="cell${j < k ? " read" : ""}${j === k ? " head" : ""}">${esc(c)}</span>`).join("") + `<span class="cell end${done() ? " head" : ""}" aria-hidden="true">⊣</span>`
                : `<span class="cell eps head">ε</span>`;

            const ask = `<b>Your turn:</b> which states can the NFA be in after reading <b>${esc(w[k])}</b>? Click them on the diagram (remember the ε-arrows), then press <b>Check my guess</b>.`;
            const endTone = run.accepted ? "yes" : "no";
            if (checked) {
                const msg = checked.ok ? `<b>Exactly right!</b> After reading ${esc(w[k - 1])}, the NFA can be in ${setStr(cur)}.`
                    : `<b>Not quite.</b> The NFA can be in ${setStr(cur)}.${checked.missed.length ? ` You missed ${checked.missed.map(sub).join(", ")}.` : ""}${checked.extra.length ? ` It can’t reach ${checked.extra.map(sub).join(", ")}.` : ""}`;
                const perfect = done() && allRight && w.length >= 3;
                setStatus(el, ctx, msg + (done() ? endMsg() : `<br>${ask}`), done() ? endTone : checked.ok ? "yes" : "no", perfect ? "great" : checked.ok ? "good" : "bad");
            } else if (asking()) {
                setStatus(el, ctx, (k === 0 && cur.length > 1 ? `You start in E(${sub(m.start)}) = ${setStr(cur)}. ` : "") + ask, "ask");
            } else if (k === 0) {
                const extra = cur.length > 1 ? ` Following ε-arrows from ${sub(m.start)} before reading anything gives ${setStr(cur)}.` : "";
                if (done()) setStatus(el, ctx, `Start in ${sub(m.start)}.${extra}${endMsg()}`, endTone, run.accepted ? "good" : "bad");
                else setStatus(el, ctx, `Start in ${sub(m.start)}.${extra} Press <b>Step</b> or <b>Play</b> to read the first symbol.`);
            } else {
                const viaEps = last.closed.length > last.moved.length;
                const msg = `Read <b>${esc(last.sym)}</b>: from ${setStr(last.from)}, the ${esc(last.sym)}-arrows lead to ${setStr(last.moved)}.` +
                    (last.moved.length === 0 ? " No arrows, so every run dies here." : viaEps ? ` Following ε-arrows adds more: now ${setStr(last.closed)}.` : "");
                if (done()) setStatus(el, ctx, msg + endMsg(), endTone, run.accepted ? "good" : "bad");
                else setStatus(el, ctx, msg);
            }

            $(".trace").innerHTML = Array.from({ length: k + 1 }, (_, j) =>
                `<li class="${j === k ? "now" : ""}">δ̂(${sub(m.start)}, ${esc(show(w.slice(0, j)))}) = ${setStr(run.sets[j])}</li>`).join("");
            const Q = Object.keys(m.states);
            $(".threads").innerHTML = `<thead><tr><th></th>${Array.from({ length: w.length + 1 }, (_, j) => `<th class="${j === k ? "now" : ""}">${j === 0 ? "start" : esc(w[j - 1])}</th>`).join("")}</tr></thead>
                <tbody>${Q.map(q => `<tr><th>${sub(q)}${m.accept.includes(q) ? "*" : ""}</th>${Array.from({ length: w.length + 1 }, (_, j) =>
                    `<td class="${j === k ? "now" : ""}">${j <= k && run.sets[j].includes(q) ? `<span class="dot${m.accept.includes(q) && j === w.length ? " acc" : ""}"></span>` : ""}</td>`).join("")}</tr>`).join("")}</tbody>`;

            $('[data-act="check"]').hidden = !asking();
            if (player) player.sync();
        }

        function checkGuess() {
            const target = run.sets[k + 1];
            const missed = target.filter(q => !guess.has(q)), extra = [...guess].filter(q => !target.includes(q));
            const ok = !missed.length && !extra.length;
            if (!ok) allRight = false;
            k++; guess.clear();
            checked = { ok, missed, extra };
            draw();
            if (done() && allRight && w.length >= 3) {
                ctx.celebrate($(".rs-av"));
                progress.award("challenge", `${course}:nfa-predict:${config.machines[mi].id}`, { at: $(".rs-av") });
            }
        }

        player = bindPlayer(el, ctx, {
            pos: () => k, max: () => w.length, canStep: () => !asking(),
            go: v => { k = v; checked = null; guess.clear(); draw(); },
            counter: (j, n) => (n === 0 ? "Nothing to read" : j === 0 ? "Not started" : `Read ${j} of ${n}`),
        });
        $(".diagram").addEventListener("click", e => {
            const g = e.target.closest(".st");
            if (!g || !asking()) return;
            const q = g.dataset.state;
            checked = null; // starting the next guess clears the last round's marks
            guess.has(q) ? guess.delete(q) : guess.add(q);
            draw();
        });
        $(".diagram").addEventListener("keydown", e => {
            const g = e.target.closest(".st");
            if (g && asking() && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); g.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
        });
        el.querySelector(".pick-row").addEventListener("click", e => { const b = e.target.closest("[data-m]"); if (b) loadMachine(+b.dataset.m); });
        $(".examples").addEventListener("click", e => { const b = e.target.closest("[data-w]"); if (b) setInput(b.dataset.w); });
        input.addEventListener("input", () => {
            const clean = input.value.split("").filter(c => m.alphabet.includes(c)).join("");
            if (clean !== input.value) input.value = clean;
            setInput(clean);
        });
        $('[data-act="reveal"]').addEventListener("click", e => { $(".lang-a").hidden = false; e.currentTarget.hidden = true; });
        $('[data-act="check"]').addEventListener("click", checkGuess);
        $('[data-act="predict"]').addEventListener("change", e => { predict = e.target.checked; player.stop(); restart(); });
        loadMachine(0);
    };

    // ======================================================================
    // Subset construction: build the DFA for an NFA one transition at a time.
    // config: { examples: [{ id, name, nfa }] }
    // ======================================================================
    const SUBSET_RECIPE = [
        "The DFA’s start state is E(q<sub>start</sub>): every NFA state reachable before reading anything.",
        "For a DFA state S and a symbol a: follow the a-arrows from every NFA state in S, then add everything reachable by ε-arrows.",
        "If that set is new, it becomes a new DFA state. Repeat rule 2 until every DFA state has an arrow for every symbol.",
        "The accept states are the sets that contain at least one NFA accept state.",
    ];
    const subsetRules = st => (st.kind === "start" ? [0] : st.kind === "accept" ? [3] : st.isNew ? [1, 2] : [1]);

    W["subset-stepper"] = function (el, config, ctx) {
        const { icon, esc } = ctx;
        let m, sc, k = 0, player;

        el.innerHTML = `
            <div class="subset">
                <div class="pick-row" role="group" aria-label="Choose an NFA">
                    ${config.examples.map((x, i) => `<button type="button" class="pick" data-e="${i}">${esc(x.name)}</button>`).join("")}
                </div>
                <div class="two-up">
                    <div><div class="panel-label">The NFA</div><div class="diagram nfa"></div></div>
                    <div><div class="panel-label">The DFA so far</div><div class="diagram dfa"></div></div>
                </div>
                ${statusHTML}
                ${playerHTML(icon)}
                ${sideHTML([["Recipe", `<ol class="recipe"></ol>`], ["The DFA’s states and transitions", `<div class="table-wrap"><table class="delta subset-table"></table></div>`]])}
            </div>`;
        const $ = s => el.querySelector(s);

        function load(i) {
            if (player) player.stop();
            m = config.examples[i].nfa; sc = A.subsetConstruction(m); k = 0;
            el.querySelectorAll(".pick").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
            $(".diagram.nfa").innerHTML = A.render(m, { label: "The NFA" });
            draw();
        }
        // The DFA after the first k steps.
        function snapshot() {
            const names = [], delta = {};
            sc.steps.slice(0, k).forEach(s => {
                if (s.kind === "start") names.push(s.name);
                if (s.kind === "edge") {
                    if (s.isNew) names.push(s.to);
                    (delta[s.from] = delta[s.from] || {})[s.sym] = s.to;
                }
            });
            const fin = k === sc.steps.length;
            return { names, delta, accept: fin ? sc.accept : [], fin };
        }
        const setOf = name => sc.dstates.find(d => d.name === name).set;

        function draw() {
            const snap = snapshot(), cur = sc.steps[k - 1];
            if (snap.names.length) {
                const dm = { states: A.layout(snap.names), start: "A", accept: snap.accept, alphabet: m.alphabet, delta: snap.delta };
                $(".diagram.dfa").innerHTML = A.render(dm, { label: "The DFA built so far" });
                const dsvg = $(".diagram.dfa svg");
                if (cur.kind === "start") A.highlight(dsvg, { states: ["A"] });
                if (cur.kind === "edge") A.highlight(dsvg, { states: [cur.to], edge: { from: cur.from, to: cur.to } });
                if (cur.kind === "accept") A.highlight(dsvg, { states: sc.accept, result: "accept" });
            } else {
                $(".diagram.dfa").innerHTML = `<p class="muted empty-dfa">Press <b>Step</b> to start building.</p>`;
            }

            const nsvg = $(".diagram.nfa svg");
            if (!cur) A.highlight(nsvg, {});
            else if (cur.kind === "start") A.highlight(nsvg, { states: cur.set });
            else if (cur.kind === "edge") {
                const edges = [];
                cur.fromSet.forEach(q => [].concat((m.delta[q] || {})[cur.sym] || []).forEach(r => edges.push({ from: q, to: r })));
                cur.set.forEach(q => [].concat((m.delta[q] || {})["ε"] || []).forEach(r => { if (cur.set.includes(r)) edges.push({ from: q, to: r }); }));
                A.highlight(nsvg, { states: cur.set, edges });
            } else A.highlight(nsvg, { states: m.accept, result: "accept" });

            if (!cur) setStatus(el, ctx, "Each DFA state stands for a <b>set</b> of NFA states: everywhere the NFA could be. Press <b>Step</b> or <b>Play</b> to build the DFA one transition at a time.");
            else if (cur.kind === "start") setStatus(el, ctx, `The DFA starts in <b>E({${sub(m.start)}}) = ${setStr(cur.set)}</b>: every state the NFA can reach before reading anything. Call it <b>A</b>.`, "", "good");
            else if (cur.kind === "edge") {
                const msg = `From <b>${cur.from} = ${setStr(cur.fromSet)}</b> on <b>${esc(cur.sym)}</b>: the ${esc(cur.sym)}-arrows lead to ${setStr(cur.moved)}` +
                    (cur.set.length > cur.moved.length ? `, and ε-arrows add more: ${setStr(cur.set)}.` : ".") +
                    (cur.set.length === 0 ? " Nothing is reachable, so this is the <b>dead state ∅</b>." : "") +
                    (cur.isNew ? ` That set is new, so it becomes state <b>${cur.to}</b>.` : ` That’s state <b>${cur.to}</b>, which we already have.`);
                setStatus(el, ctx, msg, "", cur.set.length === 0 ? "bad" : cur.isNew ? "good" : "");
            } else {
                setStatus(el, ctx, `A DFA state accepts if its set contains an NFA accept state (${m.accept.map(sub).join(", ")}). So the accept states are <b>${sc.accept.join(", ") || "none"}</b>. Done: ${sc.dstates.length} DFA states, out of 2<sup>${Object.keys(m.states).length}</sup> = ${2 ** Object.keys(m.states).length} possible subsets.`, "yes", "great");
            }

            const used = new Set(sc.steps.slice(0, Math.max(0, k - 1)).flatMap(subsetRules));
            $(".recipe").innerHTML = recipeHTML(icon, SUBSET_RECIPE, used, cur ? subsetRules(cur) : []);
            $(".subset-table").innerHTML = `<thead><tr><th>DFA state</th><th>NFA states</th>${m.alphabet.map(a => `<th>on ${esc(a)}</th>`).join("")}</tr></thead>
                <tbody>${snap.names.map(n => `<tr class="${cur && cur.kind === "edge" && cur.to === n && cur.isNew ? "new" : ""}">
                    <th>${n === "A" ? "→" : ""}${n}${snap.fin && sc.accept.includes(n) ? "*" : ""}</th>
                    <td class="set">${setStr(setOf(n))}</td>
                    ${m.alphabet.map(a => `<td class="${cur && cur.kind === "edge" && cur.from === n && cur.sym === a ? "now" : ""}">${(snap.delta[n] || {})[a] || ""}</td>`).join("")}
                </tr>`).join("") || `<tr><td colspan="${m.alphabet.length + 2}" class="muted">No states yet.</td></tr>`}</tbody>`;
            if (player) player.sync();
        }

        player = bindPlayer(el, ctx, {
            pos: () => k, max: () => sc.steps.length, go: v => { k = v; draw(); },
            counter: (j, n) => (j === 0 ? "Not started" : `Step ${j} of ${n}`),
        });
        el.querySelector(".pick-row").addEventListener("click", e => { const b = e.target.closest("[data-e]"); if (b) load(+b.dataset.e); });
        load(0);
    };

    // ======================================================================
    // Closure constructions: build a machine for A̅, A ∪ B, A ∩ B, A ∘ B or A* one small step at a time,
    // with the recipe beside it, then test strings against A, B and the result.
    // config: { machines: [{ id, name, m (a DFA), test(w) }], defaults: { op: [a, b] }, examples: { op: [] } }
    // ======================================================================
    const OPS = {
        complement: { label: "Complement", sym: "A̅", two: false, want: (a, b, w) => !a(w), say: "not in A",
            recipe: ["Start from a <b>DFA</b> for A (exactly one arrow per symbol from every state).", "Every accept state becomes a <b>non-accept</b> state.", "Every non-accept state becomes an <b>accept</b> state.", "Keep the same states, arrows, and start state."] },
        "union-eps": { label: "Union (ε)", sym: "A ∪ B", two: true, want: (a, b, w) => a(w) || b(w), say: "in A or in B",
            recipe: ["Add a <b>new start state</b> s.", "Add an <b>ε-arrow</b> from s to A’s start state.", "Add an <b>ε-arrow</b> from s to B’s start state.", "Keep <b>every</b> accept state of A and of B."] },
        "union-product": { label: "Union (product)", sym: "A ∪ B", two: true, product: true, want: (a, b, w) => a(w) || b(w), say: "in A or in B",
            recipe: ["Make a state <b>(i, j)</b> for every pair: a state of A and a state of B.", "The start state is <b>(A’s start, B’s start)</b>.", "For each pair and symbol x, move <b>both</b>: (i, j) → (δ<sub>A</sub>(i, x), δ<sub>B</sub>(j, x)).", "Accept (i, j) if i <b>or</b> j is an accept state."] },
        intersection: { label: "Intersection", sym: "A ∩ B", two: true, product: true, want: (a, b, w) => a(w) && b(w), say: "in A and in B",
            recipe: ["Make a state <b>(i, j)</b> for every pair: a state of A and a state of B.", "The start state is <b>(A’s start, B’s start)</b>.", "For each pair and symbol x, move <b>both</b>: (i, j) → (δ<sub>A</sub>(i, x), δ<sub>B</sub>(j, x)).", "Accept (i, j) if i <b>and</b> j are both accept states."] },
        concat: { label: "Concatenation", sym: "A ∘ B", two: true, want: null, say: "a string from A followed by a string from B",
            recipe: ["Add an <b>ε-arrow</b> from each accept state of A to B’s start state.", "Start <b>only</b> at A’s start state.", "Accept <b>only</b> at B’s accept states (A’s accept states stop accepting)."] },
        star: { label: "Star", sym: "A*", two: false, want: null, say: "zero or more strings from A stuck together",
            recipe: ["Add a <b>new start state</b> s.", "Make s an <b>accept</b> state, so ε (zero pieces) is accepted.", "Add an <b>ε-arrow</b> from s to A’s old start state.", "Add an <b>ε-arrow</b> from each accept state of A back to A’s old start state.", "Keep A’s accept states."] },
    };
    // Split w as x·y with x ∈ A and y ∈ B (the first split that works).
    const concatSplit = (a, b, w) => { for (let k = 0; k <= w.length; k++) if (a(w.slice(0, k)) && b(w.slice(k))) return [w.slice(0, k), w.slice(k)]; return null; };
    // Split w into non-empty pieces that are each in A (ε splits into zero pieces).
    function starSplit(a, w) {
        const best = [[]];
        for (let i = 1; i <= w.length; i++) {
            best[i] = null;
            for (let j = 0; j < i && !best[i]; j++) if (best[j] && a(w.slice(j, i))) best[i] = best[j].concat(w.slice(j, i));
        }
        return best[w.length];
    }

    W["closure-builder"] = function (el, config, ctx) {
        const { icon, esc } = ctx;
        const M = config.machines;
        let op = Object.keys(OPS)[0], ai, bi, steps, k = 0, player;

        el.innerHTML = `
            <div class="closure">
                <div class="pick-row" role="group" aria-label="Choose an operation">
                    ${Object.entries(OPS).map(([id, o]) => `<button type="button" class="pick" data-op="${id}">${esc(o.label)}</button>`).join("")}
                </div>
                <div class="machine-picks">
                    <label>A = <select data-which="a" aria-label="Machine A"></select></label>
                    <label class="pick-b">B = <select data-which="b" aria-label="Machine B"></select></label>
                    <span class="op-sym"></span>
                </div>
                <div class="diagram"></div>
                ${statusHTML}
                ${playerHTML(icon)}
                ${sideHTML([["Recipe", `<ol class="recipe"></ol>`], ["Test a string", `${inputHTML(14, "String to test")}<div class="verdicts"></div>`]])}
            </div>`;
        const $ = s => el.querySelector(s);
        const input = $(".input-w input");
        const accA = w => M[ai].test(w), accB = w => M[bi].test(w);

        // ---- building the steps: each step is a small machine snapshot + what changed + which rules it uses ----
        function rename(m, prefix, at) {
            const Q = Object.keys(m.states), name = q => prefix + Q.indexOf(q);
            const states = {}, delta = {};
            Q.forEach((q, i) => {
                states[name(q)] = at(i, Q.length);
                delta[name(q)] = {};
                Object.entries(m.delta[q] || {}).forEach(([a, t]) => { delta[name(q)][a] = [].concat(t).map(name); });
            });
            return { Q: Q.map(name), states, delta, start: name(m.start), accept: m.accept.map(name) };
        }
        const row = (x0, y, loop) => i => [x0 + i * 120, y, { loop }];
        const mach = parts => Object.assign({ alphabet: ["0", "1"], accept: [], delta: {}, states: {} }, parts);
        const merge = (...ds) => {
            const out = {};
            ds.forEach(d => Object.entries(d).forEach(([q, r]) => {
                out[q] = out[q] || {};
                Object.entries(r).forEach(([a, t]) => { out[q][a] = (out[q][a] || []).concat(t); });
            }));
            return out;
        };
        const sets = list => (list.length ? list.map(sub).join(", ") : "none");

        function build() {
            const MA = M[ai].m, MB = M[bi].m, nameA = esc(M[ai].name), nameB = esc(M[bi].name);
            const out = [];
            const add = (m, msg, r = [], on = [], edges = []) => out.push({ m, msg, r, on, edges });

            if (op === "complement") {
                const a = rename(MA, "q", row(60, 120, -90));
                const non = a.Q.filter(q => !a.accept.includes(q));
                const base = { states: a.states, delta: a.delta, start: a.start };
                add(mach({ ...base, accept: a.accept }), `Here’s a DFA for <b>A = ${nameA}</b>. Its accept states are ${sets(a.accept)}. Press <b>Step</b> to build a machine for A̅, the strings A rejects.`);
                add(mach({ ...base, accept: a.accept }), `First, check that it’s a <b>DFA</b>: every state has exactly one 0-arrow and one 1-arrow. It is. (With an NFA you’d convert it to a DFA first; swapping wouldn’t work.)`, [0], a.Q);
                add(mach({ ...base, accept: [] }), `Turn the accept state${a.accept.length > 1 ? "s" : ""} ${sets(a.accept)} into <b>non-accept</b> state${a.accept.length > 1 ? "s" : ""}.`, [1], a.accept);
                add(mach({ ...base, accept: non }), `Turn the non-accept state${non.length > 1 ? "s" : ""} ${sets(non)} into <b>accept</b> state${non.length > 1 ? "s" : ""}.`, [2], non);
                add(mach({ ...base, accept: non }), `Everything else stays the same: same states, same arrows, same start ${sub(a.start)}. The DFA ends in the same state as before, and that state now accepts exactly when it didn’t. <b>Done:</b> this DFA recognizes A̅. Test some strings below.`, [3]);
                return out;
            }
            if (op === "union-eps") {
                const a = rename(MA, "a", row(150, 50, -90)), b = rename(MB, "b", row(150, 250, 90));
                const both = { ...a.states, ...b.states }, d = merge(a.delta, b.delta), acc = [...a.accept, ...b.accept];
                const S = { s: [0, 150] }, all = { ...S, ...both };
                const e1 = merge(d, { s: { "ε": [a.start] } }), e2 = merge(d, { s: { "ε": [a.start, b.start] } });
                add(mach({ states: both, delta: d, starts: [a.start, b.start], accept: acc }), `Here are DFAs for <b>A = ${nameA}</b> (top) and <b>B = ${nameB}</b> (bottom). Press <b>Step</b> to combine them into one machine for A ∪ B.`);
                add(mach({ states: all, delta: d, starts: ["s"], accept: acc }), `Add a <b>new start state s</b>. It isn’t an accept state. A’s and B’s old start states are no longer start states.`, [0], ["s"]);
                add(mach({ states: all, delta: e1, start: "s", accept: acc }), `Add an <b>ε-arrow</b> from s to A’s old start ${sub(a.start)}. Following it means “run A.”`, [1], [a.start], [{ from: "s", to: a.start }]);
                add(mach({ states: all, delta: e2, start: "s", accept: acc }), `Add an <b>ε-arrow</b> from s to B’s old start ${sub(b.start)}. Following it means “run B.” The NFA can take <b>both</b> at once, so it runs A and B side by side.`, [2], [b.start], [{ from: "s", to: b.start }]);
                add(mach({ states: all, delta: e2, start: "s", accept: acc }), `Keep every accept state: ${sets(acc)}. If <b>either</b> machine would accept, some run ends in one of them. <b>Done:</b> this NFA recognizes A ∪ B. Test some strings below.`, [3], acc);
                return out;
            }
            if (op === "concat") {
                const a = rename(MA, "a", row(60, 50, -90)), nA = a.Q.length;
                const b = rename(MB, "b", row(60 + 120 * Math.max(0, nA - 1), 250, 90));
                const both = { ...a.states, ...b.states };
                let d = merge(a.delta, b.delta);
                add(mach({ states: both, delta: d, starts: [a.start, b.start], accept: [...a.accept, ...b.accept] }), `Here are DFAs for <b>A = ${nameA}</b> (top) and <b>B = ${nameB}</b> (bottom). Press <b>Step</b> to join them into a machine for A ∘ B: a string from A, then a string from B.`);
                a.accept.forEach((q, i) => {
                    d = merge(d, { [q]: { "ε": [b.start] } });
                    add(mach({ states: both, delta: d, starts: [a.start, b.start], accept: [...a.accept, ...b.accept] }),
                        `Add an <b>ε-arrow</b> from A’s accept state ${sub(q)} to B’s start ${sub(b.start)}. Whenever the input so far is in A (the run is in ${sub(q)}), the NFA can guess “A’s part ends here” and jump into B.${a.accept.length > 1 ? ` (${i + 1} of ${a.accept.length})` : ""}`,
                        [0], [q, b.start], [{ from: q, to: b.start }]);
                });
                add(mach({ states: both, delta: d, start: a.start, accept: [...a.accept, ...b.accept] }), `Start <b>only</b> at A’s start ${sub(a.start)}. ${sub(b.start)} isn’t a start state anymore: the only way into B is through an ε-arrow, after reading a string from A.`, [1], [a.start, b.start]);
                add(mach({ states: both, delta: d, start: a.start, accept: b.accept }), `A’s accept state${a.accept.length > 1 ? "s" : ""} ${sets(a.accept)} stop accepting. Only B’s accept state${b.accept.length > 1 ? "s" : ""} ${sets(b.accept)} accept, so a run has to finish inside B. <b>Done:</b> this NFA recognizes A ∘ B. Test some strings below.`, [2], [...a.accept, ...b.accept]);
                return out;
            }
            if (op === "star") {
                const a = rename(MA, "a", row(150, 150, -90));
                const S = { s: [0, 150, { loop: 90 }] }, all = { ...S, ...a.states };
                let d = merge(a.delta, { s: { "ε": [a.start] } });
                add(mach({ states: a.states, delta: a.delta, start: a.start, accept: a.accept }), `Here’s a DFA for <b>A = ${nameA}</b>. Press <b>Step</b> to build a machine for A*: any number of strings from A stuck together (including none).`);
                add(mach({ states: all, delta: a.delta, start: "s", accept: a.accept }), `Add a <b>new start state s</b>. A’s old start ${sub(a.start)} is no longer the start.`, [0], ["s"]);
                add(mach({ states: all, delta: a.delta, start: "s", accept: ["s", ...a.accept] }), `Make s an <b>accept</b> state. Then ε, which is zero pieces, is accepted. (Using a new state, rather than making ${sub(a.start)} accepting, avoids accepting extra strings that loop back into ${sub(a.start)}.)`, [1], ["s"]);
                add(mach({ states: all, delta: d, start: "s", accept: ["s", ...a.accept] }), `Add an <b>ε-arrow</b> from s to ${sub(a.start)}, to start reading the first piece.`, [2], [a.start], [{ from: "s", to: a.start }]);
                a.accept.forEach((q, i) => {
                    d = merge(d, { [q]: { "ε": [a.start] } });
                    add(mach({ states: all, delta: d, start: "s", accept: ["s", ...a.accept] }),
                        `Add an <b>ε-arrow</b> from A’s accept state ${sub(q)} back to ${sub(a.start)}. After reading one piece from A, the NFA can guess “that piece is done” and start the next one.${a.accept.length > 1 ? ` (${i + 1} of ${a.accept.length})` : ""}`,
                        [3], [q, a.start], [{ from: q, to: a.start }]);
                });
                add(mach({ states: all, delta: d, start: "s", accept: ["s", ...a.accept] }), `Keep A’s accept state${a.accept.length > 1 ? "s" : ""} ${sets(a.accept)}: a run that has just finished a piece can stop there. <b>Done:</b> this NFA recognizes A*. Test some strings below.`, [4], a.accept);
                return out;
            }

            // Product construction (union or intersection): run both DFAs at the same time.
            const a = rename(MA, "a", row(150, 50, -90)), b = rename(MB, "b", row(150, 250, 90));
            add(mach({ states: { ...a.states, ...b.states }, delta: merge(a.delta, b.delta), starts: [a.start, b.start], accept: [...a.accept, ...b.accept] }),
                `Here are DFAs for <b>A = ${nameA}</b> (top) and <b>B = ${nameB}</b> (bottom). Press <b>Step</b> to build one DFA that runs both at the same time.`);
            const QA = Object.keys(MA.states), QB = Object.keys(MB.states);
            const name = (i, j) => `p${i}_${j}`;
            const states = {}, labels = {};
            QA.forEach((qa, i) => QB.forEach((qb, j) => {
                const loop = i === 0 ? -90 : i === QA.length - 1 ? 90 : j === 0 ? 180 : 0;
                states[name(i, j)] = [80 + 150 * j, 60 + 120 * i, { loop }];
                labels[name(i, j)] = `${i},${j}`;
            }));
            const start = name(QA.indexOf(MA.start), QB.indexOf(MB.start));
            const pair = n => n.slice(1).split("_").map(Number);
            add(mach({ states, labels }), `Make one state for every pair, ${QA.length} × ${QB.length} = ${QA.length * QB.length} in all. State <b>i,j</b> means “A is in a<sub>i</sub> and B is in b<sub>j</sub>.”`, [0], Object.keys(states));
            add(mach({ states, labels, start }), `The start state is the pair of start states: <b>${labels[start]}</b>.`, [1], [start]);
            const delta = {};
            Object.keys(states).forEach(n => {
                const [i, j] = pair(n);
                delta[n] = {};
                const parts = ["0", "1"].map(x => {
                    const ti = QA.indexOf(MA.delta[QA[i]][x]), tj = QB.indexOf(MB.delta[QB[j]][x]);
                    delta[n][x] = name(ti, tj);
                    return `on <b>${x}</b>, A goes a<sub>${i}</sub>→a<sub>${ti}</sub> and B goes b<sub>${j}</sub>→b<sub>${tj}</sub>, so <b>${labels[n]} → ${ti},${tj}</b>`;
                });
                const snapshot = JSON.parse(JSON.stringify(delta));
                add(mach({ states, labels, start, delta: snapshot }), `From <b>${labels[n]}</b>: ${parts.join("; ")}.`, [2], [n], ["0", "1"].map(x => ({ from: n, to: delta[n][x] })));
            });
            const acc = Object.keys(states).filter(n => {
                const [i, j] = pair(n), inA = MA.accept.includes(QA[i]), inB = MB.accept.includes(QB[j]);
                return op === "intersection" ? inA && inB : inA || inB;
            });
            add(mach({ states, labels, start, delta, accept: acc }), (op === "intersection"
                ? `Accept a pair when <b>both</b> parts are accept states (A accepts <b>and</b> B accepts): ${acc.map(n => labels[n]).join("; ") || "none"}. <b>Done:</b> this DFA recognizes A ∩ B.`
                : `Accept a pair when <b>at least one</b> part is an accept state (A accepts <b>or</b> B accepts): ${acc.map(n => labels[n]).join("; ")}. <b>Done:</b> this DFA recognizes A ∪ B, with no ε-arrows.`) + " Test some strings below.", [3], acc);
            return out;
        }

        // ---- drawing ----
        function fillSelects() {
            const o = OPS[op], ok = x => !o.product || Object.keys(x.m.states).length <= 3;
            ["a", "b"].forEach(which => {
                $(`[data-which="${which}"]`).innerHTML = M.map((x, i) => (ok(x) ? `<option value="${i}"${i === (which === "a" ? ai : bi) ? " selected" : ""}>${esc(x.name)}</option>` : "")).join("");
            });
            $(".pick-b").hidden = !o.two;
            $(".op-sym").innerHTML = `Building a machine for <b>${o.sym}</b>`;
        }
        function load(newOp) {
            op = newOp;
            [ai, bi] = (config.defaults || {})[op] || [0, 1];
            el.querySelectorAll("[data-op]").forEach(b => b.setAttribute("aria-pressed", b.dataset.op === op));
            fillSelects();
            const ex = (config.examples || {})[op] || [""];
            $(".examples").innerHTML = exampleChips(esc, ex);
            input.value = ex[0];
            rebuild();
        }
        function rebuild() { if (player) player.stop(); steps = build(); k = 0; draw(); }
        const done = () => k === steps.length - 1;

        function draw() {
            const st = steps[k];
            $(".diagram").innerHTML = A.render(st.m, { label: "The construction so far" });
            const svg = $(".diagram svg");
            if (done()) {
                const r = A.runNFA(st.m, input.value);
                A.highlight(svg, { states: r.sets[r.sets.length - 1], result: r.accepted ? "accept" : "reject" });
            } else A.highlight(svg, { states: st.on, edges: st.edges });
            setStatus(el, ctx, st.msg, done() ? "yes" : "", done() ? "great" : "");
            const used = new Set(steps.slice(1, k).flatMap(s => s.r));
            $(".recipe").innerHTML = recipeHTML(icon, OPS[op].recipe, used, st.r);
            test();
            if (player) player.sync();
        }

        function test() {
            const w = input.value, o = OPS[op];
            const got = A.acceptsNFA(steps[steps.length - 1].m, w);
            let want, why = "";
            if (op === "concat") {
                const sp = concatSplit(accA, accB, w);
                want = !!sp;
                why = sp ? `Split: <code>${esc(show(sp[0]))}</code> ∈ A, then <code>${esc(show(sp[1]))}</code> ∈ B.` : "There’s no way to split it into a string from A followed by a string from B.";
            } else if (op === "star") {
                const sp = starSplit(accA, w);
                want = !!sp;
                why = sp ? (sp.length ? `Pieces from A: ${sp.map(x => `<code>${esc(x)}</code>`).join(" · ")}` : "ε is zero pieces, which is always allowed.") : "It can’t be cut into pieces that are each in A.";
            } else want = o.want(accA, accB, w);
            const chip = (label, yes) => `<span class="vchip ${yes ? "yes" : "no"}">${label} ${yes ? "accepts" : "rejects"}</span>`;
            $(".verdicts").innerHTML = `
                <div class="vrow">${chip("A", accA(w))}${o.two ? chip("B", accB(w)) : ""}${done() ? chip(`New machine`, got) : ""}</div>
                <p class="vnote">${esc(show(w))} ${want ? "<b>is</b>" : "is <b>not</b>"} in ${o.sym} (${o.say}). ${why}</p>
                ${done() ? `<p class="vnote">${got === want ? `<span class="tag ok">Correct</span> The new machine gets it right.` : `<span class="tag in">Mismatch</span>`}</p>`
                    : `<p class="muted">Finish the construction to test the new machine on this string.</p>`}`;
        }

        player = bindPlayer(el, ctx, {
            pos: () => k, max: () => steps.length - 1, go: v => { k = v; draw(); },
            counter: (j, n) => (j === 0 ? "Not started" : `Step ${j} of ${n}`),
        });
        el.querySelector(".pick-row").addEventListener("click", e => { const b = e.target.closest("[data-op]"); if (b) load(b.dataset.op); });
        el.querySelector(".machine-picks").addEventListener("change", e => {
            if (e.target.dataset.which === "a") ai = +e.target.value; else bi = +e.target.value;
            rebuild();
        });
        $(".examples").addEventListener("click", e => { const b = e.target.closest("[data-w]"); if (b) { input.value = b.dataset.w; draw(); } });
        input.addEventListener("input", () => { input.value = input.value.replace(/[^01]/g, ""); draw(); });
        load(op);
    };

    // ======================================================================
    // Regular expressions: shared bits for typing a regex and drawing its syntax tree.
    // ======================================================================
    const REGEX_KEYS = ["ε", "∅", "∪", "*", "+", "(", ")", "Σ"];
    // "R = [input]" plus buttons that type the special symbols.
    const regexInputHTML = (label = "R") => `
        <div class="regex-row">
            <label class="input-w regex-in">${label} = <input type="text" spellcheck="false" autocomplete="off" aria-label="Regular expression"></label>
            <div class="sym-keys" role="group" aria-label="Insert a symbol">${REGEX_KEYS.map(k => `<button type="button" class="sym-key" data-key="${k}" title="Insert ${k}">${k}</button>`).join("")}</div>
        </div>`;
    function bindRegexKeys(el, input, onChange) {
        el.querySelector(".sym-keys").addEventListener("click", e => {
            const b = e.target.closest("[data-key]");
            if (!b) return;
            const at = input.selectionStart ?? input.value.length, end = input.selectionEnd ?? at;
            input.value = input.value.slice(0, at) + b.dataset.key + input.value.slice(end);
            input.focus();
            input.setSelectionRange(at + b.dataset.key.length, at + b.dataset.key.length);
            onChange();
        });
        input.addEventListener("input", onChange);
    }
    const NODE_LABEL = { union: "∪", concat: "∘", star: "*", plus: "+", eps: "ε", empty: "∅", sigma: "Σ" };

    // Syntax tree as SVG: leaves spread out left to right, each parent centered over its children.
    function treeSVG(ast, esc) {
        const nodes = [], edges = [];
        let slot = 0, depthMax = 0;
        (function place(n, d) {
            depthMax = Math.max(depthMax, d);
            const kids = [n.a, n.b].filter(Boolean);
            kids.forEach(k => place(k, d + 1));
            n._x = kids.length ? kids.reduce((s, k) => s + k._x, 0) / kids.length : slot++ * 56;
            n._y = d * 62;
            n._id = nodes.length;
            nodes.push(n);
            kids.forEach(k => edges.push([n, k]));
        })(ast, 0);
        const w = Math.max(0, (slot - 1) * 56), R = 19, pad = 26;
        const vb = [-pad, -pad, w + pad * 2, depthMax * 62 + pad * 2];
        const scale = Math.min(1.25, 300 / vb[3]);
        return `<svg class="tree" viewBox="${vb.join(" ")}" width="${vb[2] * scale}" height="${vb[3] * scale}" role="img" aria-label="Syntax tree of the regular expression">
            ${edges.map(([p, c]) => `<line class="tl" data-n="${c._id}" x1="${p._x}" y1="${p._y + R}" x2="${c._x}" y2="${c._y - R}"/>`).join("")}
            ${nodes.map(n => `<g class="tn ${n.a ? "op" : "leaf"}" data-n="${n._id}"><circle cx="${n._x}" cy="${n._y}" r="${R}"/><text x="${n._x}" y="${n._y + 6}">${esc(NODE_LABEL[n.t] || n.c)}</text></g>`).join("")}
        </svg>`;
    }

    // ======================================================================
    // Unfold L(R): work out the language of a regex bottom-up, one rule per step.
    // config: { examples: [regex strings], strings: { "01": [test strings], ab: [test strings] } }
    // The alphabet is {a, b} if the expression uses a or b, and {0, 1} otherwise (the lecture uses both).
    // ======================================================================
    const LANG_RULES = [
        "<b>L(a) = {a}</b> for a symbol a",
        "<b>L(ε) = {ε}</b>",
        "<b>L(∅) = ∅</b>",
        "<b>L(R<sub>1</sub> ∪ R<sub>2</sub>) = L(R<sub>1</sub>) ∪ L(R<sub>2</sub>)</b>",
        "<b>L(R<sub>1</sub>R<sub>2</sub>) = L(R<sub>1</sub>) ∘ L(R<sub>2</sub>)</b>: a string from the first, then one from the second",
        "<b>L(R*) = L(R)*</b>: any number of strings from L(R) stuck together, including ε",
        "Shorthand: <b>Σ</b> is any one symbol, and <b>R<sup>+</sup> = RR*</b> (one or more)",
    ];
    const RULE_OF = { sym: 0, eps: 1, empty: 2, union: 3, concat: 4, star: 5, sigma: 6, plus: 6 };
    const SHOW_LEN = 6;

    W["regex-explorer"] = function (el, config, ctx) {
        const { icon, esc } = ctx;
        let SIG = [], ast = null, order = [], k = 0, player, langs, more;

        el.innerHTML = `
            <div class="regex-x">
                ${regexInputHTML()}
                <div class="sigma-note"></div>
                <div class="examples regex-ex">${config.examples.map(x => `<button type="button" class="ex" data-r="${esc(x)}">${esc(x)}</button>`).join("")}</div>
                <div class="regex-err" aria-live="polite"></div>
                <div class="diagram tree-box"></div>
                ${statusHTML}
                ${playerHTML(icon)}
                ${sideHTML([["Recipe: what each piece means", `<ol class="recipe"></ol>`], ["Test a string", `${inputHTML(14, "String to test")}<div class="verdicts"></div>`]])}
            </div>`;
        const $ = s => el.querySelector(s);
        const rin = $(".regex-in input"), win = $(".run-controls .input-w input");

        // A set of strings, shortest first, cut off with "…" when there are more.
        function setText(set, hasMore) {
            const list = A.byLength(set);
            if (!list.length) return "∅";
            const shown = list.slice(0, 10).map(x => esc(show(x)));
            return `{${shown.join(", ")}${list.length > 10 || hasMore ? ", …" : ""}}`;
        }
        function load(text) {
            if (player) player.stop();
            rin.value = text;
            parse();
        }
        function parse() {
            const key = /[ab]/.test(rin.value) ? "ab" : "01";
            if (SIG.join("") !== key) {
                SIG = key.split("");
                const list = (config.strings || {})[key] || [""];
                $(".run-controls .examples").innerHTML = exampleChips(esc, list);
                win.value = list[0];
            }
            $(".sigma-note").innerHTML = `Alphabet: Σ = {${SIG.join(", ")}}`;
            const r = A.parseRegex(rin.value, SIG);
            $(".regex-err").textContent = r.error || "";
            if (r.error) {
                ast = null;
                $(".tree-box").innerHTML = `<p class="muted empty-dfa">Fix the expression to see its syntax tree.</p>`;
                setStatus(el, ctx, r.error, "no");
                $(".recipe").innerHTML = recipeHTML(icon, LANG_RULES, new Set(), []);
                $(".verdicts").innerHTML = "";
                if (player) player.sync();
                return;
            }
            ast = r.ast;
            order = A.postorder(ast);
            const memo = new Map(), memo2 = new Map();
            A.regexLang(ast, SIG, SHOW_LEN, memo);
            A.regexLang(ast, SIG, SHOW_LEN + 1, memo2);
            langs = order.map(n => memo.get(n));
            more = order.map(n => memo2.get(n).size > memo.get(n).size);
            $(".tree-box").innerHTML = treeSVG(ast, esc);
            k = 0;
            draw();
        }

        function draw() {
            if (!ast) return;
            const cur = order[k - 1], i = k - 1;
            el.querySelectorAll(".tree .tn").forEach(g => {
                const n = +g.dataset.n;
                g.classList.toggle("now", n === i);
                g.classList.toggle("done", n < i);
            });
            el.querySelectorAll(".tree .tl").forEach(l => l.classList.toggle("done", +l.dataset.n < k));
            const L = j => setText(langs[j], more[j]), txt = n => esc(A.regexText(n));
            const idx = n => order.indexOf(n);
            if (!cur) setStatus(el, ctx, `This is the <b>syntax tree</b> of R = ${esc(A.regexText(ast))}. ${order.length > 1 ? "* binds tightest, then concatenation (∘), then ∪. " : ""}Press <b>Step</b> or <b>Play</b> to work out L(R) from the leaves up.`);
            else {
                let msg;
                if (cur.t === "sym") msg = `L(${txt(cur)}) = <b>{${esc(cur.c)}}</b>: a single symbol matches just itself.`;
                else if (cur.t === "eps") msg = `L(ε) = <b>{ε}</b>: just the empty string.`;
                else if (cur.t === "empty") msg = `L(∅) = <b>∅</b>: it matches nothing at all.`;
                else if (cur.t === "sigma") msg = `L(Σ) = <b>{${SIG.join(", ")}}</b>: Σ is shorthand for any one symbol (${SIG.join(" ∪ ")}).`;
                else if (cur.t === "union") msg = `L(${txt(cur)}) = L(${txt(cur.a)}) ∪ L(${txt(cur.b)}) = ${L(idx(cur.a))} ∪ ${L(idx(cur.b))} = <b>${L(i)}</b>.`;
                else if (cur.t === "concat") msg = `L(${txt(cur)}) = L(${txt(cur.a)}) ∘ L(${txt(cur.b)}): each string of ${L(idx(cur.a))} followed by each string of ${L(idx(cur.b))} = <b>${L(i)}</b>.`;
                else if (cur.t === "star") msg = `L(${txt(cur)}) = L(${txt(cur.a)})*: zero or more strings from ${L(idx(cur.a))} stuck together = <b>${L(i)}</b>.`;
                else msg = `${txt(cur)} means ${txt(cur.a)}(${txt(cur.a)})*: one or more strings from ${L(idx(cur.a))} = <b>${L(i)}</b>.`;
                if (k === order.length) msg += ` That’s all of R.${more[i] ? ` (The language is infinite; strings up to length ${SHOW_LEN} are shown.)` : ""}`;
                setStatus(el, ctx, msg, k === order.length ? "yes" : "", k === order.length ? "great" : "");
            }
            const used = new Set(order.slice(0, Math.max(0, k - 1)).map(n => RULE_OF[n.t]));
            $(".recipe").innerHTML = recipeHTML(icon, LANG_RULES, used, cur ? [RULE_OF[cur.t]] : []);
            test();
            if (player) player.sync();
        }

        function test() {
            if (!ast) return;
            const w = win.value, yes = A.acceptsNFA(A.regexToNFA(ast, SIG), w);
            $(".verdicts").innerHTML = `<div class="vrow"><span class="vchip ${yes ? "yes" : "no"}">R ${yes ? "matches" : "doesn’t match"} ${esc(show(w))}</span></div>
                <p class="vnote">${esc(show(w))} ${yes ? "<b>is</b>" : "is <b>not</b>"} in L(${esc(A.regexText(ast))}).</p>`;
        }

        player = bindPlayer(el, ctx, {
            pos: () => k, max: () => (ast ? order.length : 0), go: v => { k = v; draw(); },
            counter: (j, n) => (n === 0 ? "No expression" : j === 0 ? "Not started" : `Step ${j} of ${n}`),
        });
        bindRegexKeys(el, rin, () => { player.stop(); parse(); });
        $(".regex-ex").addEventListener("click", e => { const b = e.target.closest("[data-r]"); if (b) load(b.dataset.r); });
        $(".run-controls .examples").addEventListener("click", e => { const b = e.target.closest("[data-w]"); if (b) { win.value = b.dataset.w; test(); } });
        win.addEventListener("input", () => { win.value = win.value.split("").filter(c => SIG.includes(c)).join(""); test(); });
        load(config.examples[0]);
    };

    // ======================================================================
    // Regex → NFA: build the NFA for each node of the syntax tree, bottom-up, with the lecture's constructions.
    // config: { examples: [regex strings], strings: { "01": [...], ab: [...] } }
    // ======================================================================
    const NFA_RULES = [
        "<b>a</b>: two states joined by an a-arrow; the second one accepts.",
        "<b>ε</b>: one state that is both the start and an accept state.",
        "<b>∅</b>: one state that doesn’t accept.",
        "<b>R<sub>1</sub> ∪ R<sub>2</sub></b>: a new start state with ε-arrows to both NFAs. Keep all their accept states.",
        "<b>R<sub>1</sub>R<sub>2</sub></b>: ε-arrows from R<sub>1</sub>’s accept states to R<sub>2</sub>’s start. Only R<sub>2</sub>’s accept states accept.",
        "<b>R*</b>: a new start state that accepts, an ε-arrow to the old start, and ε-arrows from the accept states back to the old start.",
        "Shorthand: <b>Σ</b> is one arrow labeled with every symbol, and <b>R<sup>+</sup> = RR*</b>.",
    ];

    W["regex-nfa-stepper"] = function (el, config, ctx) {
        const { icon, esc } = ctx;
        let SIG = [], ast = null, order = [], steps = [], k = 0, player;

        el.innerHTML = `
            <div class="regex-x">
                ${regexInputHTML()}
                <div class="sigma-note"></div>
                <div class="examples regex-ex">${config.examples.map(x => `<button type="button" class="ex" data-r="${esc(x)}">${esc(x)}</button>`).join("")}</div>
                <div class="regex-err" aria-live="polite"></div>
                <div class="two-up wide-right">
                    <div><div class="panel-label">Syntax tree</div><div class="diagram tree-box"></div></div>
                    <div><div class="panel-label nfa-label">The NFA</div><div class="diagram nfa-box"></div></div>
                </div>
                ${statusHTML}
                ${playerHTML(icon)}
                ${sideHTML([["Recipe", `<ol class="recipe"></ol>`], ["Test a string", `${inputHTML(14, "String to test")}<div class="verdicts"></div>`]])}
            </div>`;
        const $ = s => el.querySelector(s);
        const rin = $(".regex-in input"), win = $(".run-controls .input-w input");
        const last = () => steps[steps.length - 1];

        function parse() {
            const key = /[ab]/.test(rin.value) ? "ab" : "01";
            if (SIG.join("") !== key) {
                SIG = key.split("");
                const list = (config.strings || {})[key] || [""];
                $(".run-controls .examples").innerHTML = exampleChips(esc, list);
                win.value = list[0];
            }
            $(".sigma-note").innerHTML = `Alphabet: Σ = {${SIG.join(", ")}}`;
            const r = A.parseRegex(rin.value, SIG);
            $(".regex-err").textContent = r.error || "";
            if (r.error) {
                ast = null; steps = []; k = 0;
                $(".tree-box").innerHTML = `<p class="muted empty-dfa">Fix the expression to see its syntax tree.</p>`;
                $(".nfa-box").innerHTML = "";
                setStatus(el, ctx, r.error, "no");
                $(".recipe").innerHTML = recipeHTML(icon, NFA_RULES, new Set(), []);
                $(".verdicts").innerHTML = "";
                if (player) player.sync();
                return;
            }
            ast = r.ast;
            order = A.postorder(ast);
            steps = A.regexNFASteps(ast, SIG);
            $(".tree-box").innerHTML = treeSVG(ast, esc);
            k = 0;
            draw();
        }

        function draw() {
            if (!ast) return;
            const st = steps[k - 1], i = k - 1;
            el.querySelectorAll(".tree .tn").forEach(g => { const n = +g.dataset.n; g.classList.toggle("now", n === i); g.classList.toggle("done", n < i); });
            el.querySelectorAll(".tree .tl").forEach(l => l.classList.toggle("done", +l.dataset.n < k));
            const fin = k === steps.length;
            if (!st) {
                $(".nfa-box").innerHTML = `<p class="muted empty-dfa">Press <b>Step</b> to build the NFA, starting from the leaves.</p>`;
                $(".nfa-label").textContent = "The NFA";
                setStatus(el, ctx, `R = ${esc(A.regexText(ast))}. Build an NFA for every node of the syntax tree, <b>leaves first</b>. Each step glues together NFAs you’ve already built, so at the top you have an NFA for all of R. Press <b>Step</b> or <b>Play</b>.`);
            } else {
                const n = st.node, txt = esc(A.regexText(n)), kids = [n.a, n.b].filter(Boolean).map(c => esc(A.regexText(c)));
                $(".nfa-label").innerHTML = `The NFA for <b>${txt}</b>`;
                $(".nfa-box").innerHTML = A.render(st.machine, { label: "NFA for " + A.regexText(n) });
                const svg = $(".nfa-box svg");
                // Don't shrink the NFA below a readable size; the panel scrolls sideways instead.
                svg.style.minWidth = Math.min(+svg.getAttribute("width"), +svg.getAttribute("width") * .62) + "px";
                if (fin) {
                    const r = A.runNFA(st.machine, win.value);
                    A.highlight(svg, { states: r.sets[r.sets.length - 1], result: r.accepted ? "accept" : "reject" });
                } else A.highlight(svg, { states: st.added, edges: st.edges });
                let msg;
                if (n.t === "sym") msg = `<b>${txt}</b> is a single symbol: two states joined by a ${txt}-arrow. The NFA accepts exactly “${txt}”.`;
                else if (n.t === "sigma") msg = `<b>Σ</b> is any one symbol: two states joined by one arrow labeled ${SIG.join(",")}.`;
                else if (n.t === "eps") msg = `<b>ε</b>: one state that is both the start and an accept state, so the NFA accepts only the empty string.`;
                else if (n.t === "empty") msg = `<b>∅</b>: one state with no accept states, so the NFA accepts nothing.`;
                else if (n.t === "union") msg = `<b>${txt}</b>: add a new start state with ε-arrows to the NFAs for <b>${kids[0]}</b> (top) and <b>${kids[1]}</b> (bottom). The NFA guesses which one to run. Both keep their accept states.`;
                else if (n.t === "concat") msg = `<b>${txt}</b>: put the NFA for <b>${kids[0]}</b> first and the NFA for <b>${kids[1]}</b> after it. ε-arrows go from ${kids[0]}’s accept state${st.edges.length > 1 ? "s" : ""} to ${kids[1]}’s start, and only ${kids[1]}’s accept states still accept.`;
                else if (n.t === "star") msg = `<b>${txt}</b>: add a new start state that accepts (for ε), an ε-arrow into the NFA for <b>${kids[0]}</b>, and ε-arrows from its accept state${st.edges.length > 2 ? "s" : ""} back to its start, so it can repeat.`;
                else msg = `<b>${txt}</b> means ${kids[0]}(${kids[0]})*: a copy of the NFA for <b>${kids[0]}</b>, followed by the star construction on another copy.`;
                if (fin) msg += ` <b>Done:</b> this NFA has ${Object.keys(st.machine.states).length} states and recognizes L(${esc(A.regexText(ast))}). Test some strings below.`;
                setStatus(el, ctx, msg, fin ? "yes" : "", fin ? "great" : "");
            }
            const ruleOf = n => RULE_OF[n.t];
            const used = new Set(steps.slice(0, Math.max(0, k - 1)).map(s => ruleOf(s.node)));
            $(".recipe").innerHTML = recipeHTML(icon, NFA_RULES, used, st ? [ruleOf(st.node)] : []);
            test();
            if (player) player.sync();
        }

        function test() {
            if (!ast) return;
            const w = win.value, nfa = last().machine, yes = A.acceptsNFA(nfa, w);
            const want = A.regexLang(ast, SIG, Math.max(w.length, 1)).has(w);
            $(".verdicts").innerHTML = `<div class="vrow"><span class="vchip ${want ? "yes" : "no"}">${esc(show(w))} ${want ? "is" : "isn’t"} in L(R)</span>${k === steps.length ? `<span class="vchip ${yes ? "yes" : "no"}">The NFA ${yes ? "accepts" : "rejects"}</span>` : ""}</div>
                ${k === steps.length ? `<p class="vnote">${yes === want ? `<span class="tag ok">Correct</span> The NFA agrees with the regex.` : `<span class="tag in">Mismatch</span>`}</p>`
                    : `<p class="muted">Finish building to run the NFA on this string.</p>`}`;
        }

        player = bindPlayer(el, ctx, {
            pos: () => k, max: () => steps.length, go: v => { k = v; draw(); },
            counter: (j, n) => (n === 0 ? "No expression" : j === 0 ? "Not started" : `Step ${j} of ${n}`),
        });
        bindRegexKeys(el, rin, () => { player.stop(); parse(); });
        $(".regex-ex").addEventListener("click", e => { const b = e.target.closest("[data-r]"); if (b) { player.stop(); rin.value = b.dataset.r; parse(); } });
        $(".run-controls .examples").addEventListener("click", e => { const b = e.target.closest("[data-w]"); if (b) { win.value = b.dataset.w; draw(); } });
        win.addEventListener("input", () => { win.value = win.value.split("").filter(c => SIG.includes(c)).join(""); draw(); });
        rin.value = config.examples[0];
        parse();
    };

    // ======================================================================
    // DFA → regex: simple-form GNFA, then remove the middle states one at a time.
    // config: { machines: [{ id, name, lang, machine (a DFA), examples: [] }] }
    // ======================================================================
    const GNFA_RULES = [
        "Start with a <b>DFA</b> for the language.",
        "Add a <b>new accept state</b> with ε-arrows from the old accept states, which stop accepting. No arrows leave it.",
        "Add a <b>new start state</b> with an ε-arrow to the old start. No arrows enter it.",
        "Keep <b>at most one arrow</b> between each pair of states: combine labels with ∪.",
        "<b>Remove a middle state</b> q<sub>kill</sub>: for each path q<sub>i</sub> → q<sub>kill</sub> → q<sub>j</sub>, label q<sub>i</sub> → q<sub>j</sub> with <b>R<sub>1</sub>(R<sub>2</sub>)*R<sub>3</sub> ∪ R<sub>4</sub></b>.",
        "When only the start and accept states are left, the label between them is the <b>regular expression</b>.",
    ];

    W["gnfa-stepper"] = function (el, config, ctx) {
        const { icon, esc } = ctx;
        let mi = 0, m, order, steps, k = 0, player;

        el.innerHTML = `
            <div class="gnfa">
                <div class="pick-row" role="group" aria-label="Choose a DFA">
                    ${config.machines.map((x, i) => `<button type="button" class="pick" data-m="${i}">${esc(x.name)}</button>`).join("")}
                </div>
                <div class="order-row"></div>
                <div class="diagram gnfa-box"></div>
                ${statusHTML}
                ${playerHTML(icon)}
                ${sideHTML([["Recipe", `<ol class="recipe"></ol>`], ["Check the regex", `${inputHTML(14, "String to test")}<div class="verdicts"></div>`]])}
            </div>`;
        const $ = s => el.querySelector(s);
        const win = $(".run-controls .input-w input");
        const rx = n => `<span class="rx">${esc(A.regexText(n))}</span>`;
        const middle = () => Object.keys(m.states);

        function load(i) {
            if (player) player.stop();
            mi = i; m = config.machines[i].machine;
            el.querySelectorAll(".pick").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
            $(".run-controls .examples").innerHTML = exampleChips(esc, config.machines[i].examples);
            win.value = config.machines[i].examples[0];
            order = middle();
            steps = A.gnfaSteps(m, order);
            k = 0;
            draw();
        }
        // States already removed before step k, and the one being removed right now (if any).
        function progress() {
            const done = [], seen = steps.slice(0, k + 1);
            seen.forEach(s => { if (s.kind === "removed") done.push(s.kill); });
            const cur = steps[k];
            const busy = cur && ["pick", "pair"].includes(cur.kind) ? cur.kill : null;
            return { done, busy };
        }
        const canChoose = () => { const cur = steps[k]; return cur && !["pair", "pick", "done"].includes(cur.kind) && progress().done.length < middle().length; };

        function choose(q) {
            const { done, busy } = progress();
            if (done.includes(q) || q === busy) return;
            order = [...done, ...(busy ? [busy] : []), q, ...order.filter(x => !done.includes(x) && x !== busy && x !== q)];
            steps = A.gnfaSteps(m, order);
            if (player) player.stop();
            k = Math.min(k + 1, steps.length - 1);
            draw();
        }

        function draw() {
            const st = steps[k];
            $(".gnfa-box").innerHTML = A.render(st.machine, { label: "The GNFA" });
            const svg = $(".gnfa-box svg");
            A.highlight(svg, { states: st.on, edges: st.edges, result: st.kind === "done" ? "accept" : null });
            const { done } = progress();
            const pickable = canChoose();
            svg.querySelectorAll(".st").forEach(g => {
                const ok = pickable && middle().includes(g.dataset.state) && !done.includes(g.dataset.state);
                g.classList.toggle("pickable", ok);
                g.setAttribute("tabindex", ok ? "0" : "-1");
                if (ok) g.setAttribute("role", "button");
            });
            $(".order-row").innerHTML = `Removal order: ${order.map(q => `<span class="ord${done.includes(q) ? " gone" : ""}">${sub(q)}</span>`).join(" → ")}`;

            const choose = pickable ? ` <span class="hintline">Click a middle state on the diagram to choose which one to remove next, or press <b>Step</b>.</span>` : "";
            let msg, tone = "", react = "";
            if (st.kind === "dfa") msg = `Here’s a DFA for <b>${esc(config.machines[mi].lang)}</b>. Press <b>Step</b> to turn it into a regular expression.`;
            else if (st.kind === "accept") msg = `Add a <b>new accept state f</b> with ε-arrows from the old accept state${st.oldAcc.length > 1 ? "s" : ""} ${st.oldAcc.map(sub).join(", ")}, which stop accepting. Now there’s exactly one accept state, and no arrows leave it.`;
            else if (st.kind === "start") msg = `Add a <b>new start state s</b> with an ε-arrow to the old start ${sub(st.oldStart)}. No arrows come into s.`;
            else if (st.kind === "merge") msg = st.merged.length
                ? `Labels are now regular expressions. An arrow that used to say “0,1” now says <b>0 ∪ 1</b>, so there’s at most one arrow between any two states. This is the <b>simple form</b>.`
                : `Labels are now regular expressions, and there’s already at most one arrow between any two states. This is the <b>simple form</b>.`;
            else if (st.kind === "pick") msg = `Remove <b>${sub(st.kill)}</b>. Every path that goes through it needs a replacement arrow: ${st.ins.length * st.outs.length ? `${st.ins.length * st.outs.length} path${st.ins.length * st.outs.length > 1 ? "s" : ""} (${st.ins.length} arrow${st.ins.length > 1 ? "s" : ""} in × ${st.outs.length} out)` : "none, because nothing passes through it"}.${st.loop ? ` Its loop is ${rx(st.loop)}.` : ""}`;
            else if (st.kind === "pair") {
                msg = `Path ${sub(st.p)} → ${sub(st.kill)} → ${sub(st.q)}${st.p === st.q ? " (back to itself, so it becomes a loop)" : ""}: ` +
                    `R<sub>1</sub> = ${rx(st.R1)}, R<sub>2</sub> = ${st.R2 ? rx(st.R2) : "none (no loop, so (R<sub>2</sub>)* = ε)"}, R<sub>3</sub> = ${rx(st.R3)}, R<sub>4</sub> = ${st.R4.t === "empty" ? "∅ (no direct arrow yet)" : rx(st.R4)}. ` +
                    `New label: R<sub>1</sub>(R<sub>2</sub>)*R<sub>3</sub> ∪ R<sub>4</sub> = <b>${rx(st.result)}</b>.`;
            } else if (st.kind === "removed") msg = `All paths through ${sub(st.kill)} have their own arrows now, so <b>delete ${sub(st.kill)}</b> and its arrows. The GNFA accepts the same strings.`;
            else { msg = `Only s and f are left. The label between them is the answer: <b>R = ${rx(st.regex)}</b>. Check it on some strings below.`; tone = "yes"; react = "great"; }
            setStatus(el, ctx, msg + (st.kind !== "done" ? choose : ""), tone, react);

            const used = new Set(steps.slice(0, k).map(s => s.rule));
            $(".recipe").innerHTML = recipeHTML(icon, GNFA_RULES, used, [st.rule]);
            test();
            if (player) player.sync();
        }

        function test() {
            const w = win.value, dfaSays = A.accepts(m, w), last = steps[steps.length - 1], fin = k === steps.length - 1;
            const re = last.regex, reSays = A.acceptsNFA(A.regexToNFA(re, m.alphabet), w);
            $(".verdicts").innerHTML = `<div class="vrow"><span class="vchip ${dfaSays ? "yes" : "no"}">The DFA ${dfaSays ? "accepts" : "rejects"}</span>${fin ? `<span class="vchip ${reSays ? "yes" : "no"}">R ${reSays ? "matches" : "doesn’t match"}</span>` : ""}</div>
                ${fin ? `<p class="vnote">${reSays === dfaSays ? `<span class="tag ok">Correct</span> The regex agrees with the DFA on ${esc(show(w))}.` : `<span class="tag in">Mismatch</span>`}</p>` : `<p class="muted">Finish removing states to get the regex and test it.</p>`}`;
        }

        player = bindPlayer(el, ctx, {
            pos: () => k, max: () => steps.length - 1, go: v => { k = v; draw(); },
            counter: (j, n) => (j === 0 ? "Not started" : `Step ${j} of ${n}`),
        });
        $(".gnfa-box").addEventListener("click", e => { const g = e.target.closest(".st.pickable"); if (g) choose(g.dataset.state); });
        $(".gnfa-box").addEventListener("keydown", e => { const g = e.target.closest(".st.pickable"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); choose(g.dataset.state); } });
        el.querySelector(".pick-row").addEventListener("click", e => { const b = e.target.closest("[data-m]"); if (b) load(+b.dataset.m); });
        $(".run-controls .examples").addEventListener("click", e => { const b = e.target.closest("[data-w]"); if (b) { win.value = b.dataset.w; test(); } });
        win.addEventListener("input", () => { win.value = win.value.split("").filter(c => m.alphabet.includes(c)).join(""); test(); });
        load(0);
    };

    // ======================================================================
    // Σ* explorer: build Σ* = Σ⁰ ∪ Σ¹ ∪ Σ² ∪ … one length at a time, and see which strings a language contains.
    // config: { alphabet, maxLen, languages: [{ id, name, set, test(w), note }] }
    // ======================================================================
    W["sigma-explorer"] = function (el, config, ctx) {
        const { icon, esc } = ctx;
        const SIG = config.alphabet || ["0", "1"], MAX = config.maxLen || 4;
        let li = 0, k = 0, player;
        const rows = Array.from({ length: MAX + 1 }, (_, i) => [...A.strings(SIG, i)].filter(w => w.length === i));
        const supN = n => String(n).split("").map(d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]).join("");

        el.innerHTML = `
            <div class="sigma">
                <div class="pick-row" role="group" aria-label="Choose a language"></div>
                <div class="challenge"><div class="ch-lang"></div><div class="ch-meta"></div></div>
                <div class="diagram sigma-rows"></div>
                ${statusHTML}
                ${playerHTML(icon)}
                ${sideHTML([["Counting strings", `<table class="delta sigma-count"></table>`], ["Test a string", `${inputHTML(12, "String to test")}<div class="verdicts"></div>`]])}
            </div>`;
        const $ = s => el.querySelector(s);
        const win = $(".run-controls .input-w input");
        $(".run-controls .examples").innerHTML = exampleChips(esc, ["101", "0101", "", "10"]);
        win.value = "101";
        const L = () => config.languages[li];

        function pick(i) {
            li = i;
            el.querySelectorAll(".pick").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
            $(".ch-lang").innerHTML = `<span class="set">L = ${L().set}</span>`;
            $(".ch-meta").innerHTML = L().note || "";
            draw();
        }
        function draw() {
            const member = L().test;
            $(".sigma-rows").innerHTML = rows.map((r, i) => `
                <div class="srow${i < k ? " shown" : ""}${i === k - 1 ? " now" : ""}">
                    <span class="slabel">Σ${supN(i)}</span>
                    <span class="schips">${i < k ? r.map(w => `<span class="schip${member(w) ? " in" : ""}">${esc(show(w))}</span>`).join("") : `<span class="muted">${r.length} string${r.length > 1 ? "s" : ""} of length ${i}</span>`}</span>
                </div>`).join("") + `<div class="srow more"><span class="slabel">…</span><span class="muted">Σ* keeps going: strings of every length</span></div>`;
            const inL = r => r.filter(L().test).length;
            if (k === 0) setStatus(el, ctx, `Σ = {${SIG.join(", ")}}. <b>Σ*</b> is every string over Σ: Σ* = Σ<sup>0</sup> ∪ Σ<sup>1</sup> ∪ Σ<sup>2</sup> ∪ …, where Σ<sup>i</sup> is the strings of length i. Press <b>Step</b> to build it one length at a time. Strings in L are highlighted.`);
            else {
                const i = k - 1, n = rows[i].length;
                let msg = i === 0 ? `<b>Σ<sup>0</sup> = {ε}</b>: exactly one string of length 0, the empty string. So |Σ<sup>0</sup>| = 1, not 0. (The empty <i>set</i> ∅ has no strings at all.)`
                    : `<b>Σ${supN(i)}</b>: all strings of length ${i}. There are |Σ|${supN(i)} = ${SIG.length}${supN(i)} = <b>${n}</b> of them.`;
                msg += ` ${inL(rows[i])} of them ${inL(rows[i]) === 1 ? "is" : "are"} in L.`;
                if (k === MAX + 1) msg += ` That’s every string up to length ${MAX}. Σ* goes on forever, but each string in it is <b>finite</b>.`;
                setStatus(el, ctx, msg, k === MAX + 1 ? "yes" : "", k === MAX + 1 ? "great" : "");
            }
            $(".sigma-count").innerHTML = `<thead><tr><th>i</th><th>|Σ<sup>i</sup>|</th><th>in L</th></tr></thead><tbody>${rows.map((r, i) =>
                `<tr class="${i === k - 1 ? "now-row" : ""}"><th>${i}</th><td>${i < k ? r.length : ""}</td><td>${i < k ? inL(r) : ""}</td></tr>`).join("")}</tbody>`;
            test();
            if (player) player.sync();
        }
        function test() {
            const w = win.value, yes = L().test(w);
            $(".verdicts").innerHTML = `<div class="vrow"><span class="vchip ${yes ? "yes" : "no"}">${esc(show(w))} ${yes ? "∈" : "∉"} L</span></div>
                <p class="vnote">Length |${esc(show(w))}| = ${w.length}, so it’s in Σ${supN(w.length)}.</p>`;
        }
        $(".pick-row").innerHTML = config.languages.map((x, i) => `<button type="button" class="pick" data-l="${i}">${esc(x.name)}</button>`).join("");
        $(".pick-row").addEventListener("click", e => { const b = e.target.closest("[data-l]"); if (b) pick(+b.dataset.l); });
        $(".run-controls .examples").addEventListener("click", e => { const b = e.target.closest("[data-w]"); if (b) { win.value = b.dataset.w; test(); } });
        win.addEventListener("input", () => { win.value = win.value.split("").filter(c => SIG.includes(c)).join(""); test(); });
        player = bindPlayer(el, ctx, {
            pos: () => k, max: () => MAX + 1, go: v => { k = v; draw(); },
            counter: (j, n) => (j === 0 ? "Not started" : `Length ${j - 1} of ${n - 1}`),
        });
        pick(0);
    };

    // ======================================================================
    // Set lab: union, intersection, difference, Cartesian product, and power set of two small sets.
    // config: { examples: [{ a: "1, 2", b: "a, b" }] }
    // ======================================================================
    W["set-lab"] = function (el, config, ctx) {
        const { esc } = ctx;
        el.innerHTML = `
            <div class="setlab">
                <div class="set-inputs">
                    <label class="input-w">A = { <input type="text" data-set="a" spellcheck="false" autocomplete="off" aria-label="Elements of A"> }</label>
                    <label class="input-w">B = { <input type="text" data-set="b" spellcheck="false" autocomplete="off" aria-label="Elements of B"> }</label>
                </div>
                <div class="examples set-ex">${config.examples.map((x, i) => `<button type="button" class="ex" data-x="${i}">A = {${esc(x.a)}}, B = {${esc(x.b)}}</button>`).join("")}</div>
                <p class="muted">Separate elements with commas. Repeats don’t count: a set has each element once.</p>
                <div class="set-results"></div>
            </div>`;
        const $ = s => el.querySelector(s);
        const ia = $('[data-set="a"]'), ib = $('[data-set="b"]');
        const parse = t => [...new Set(t.split(",").map(x => x.trim()).filter(Boolean))];
        const fmt = list => (list.length ? `{${list.map(esc).join(", ")}}` : "∅");
        function draw() {
            const A = parse(ia.value), B = parse(ib.value);
            const union = [...new Set([...A, ...B])], inter = A.filter(x => B.includes(x));
            const aMinusB = A.filter(x => !B.includes(x)), bMinusA = B.filter(x => !A.includes(x));
            const prod = A.length * B.length <= 30 ? A.flatMap(x => B.map(y => `(${x}, ${y})`)) : null;
            const subsets = A.length <= 4 ? Array.from({ length: 2 ** A.length }, (_, m) => A.filter((_, i) => m & (1 << i))).sort((x, y) => x.length - y.length) : null;
            const row = (name, def, val, size) => `<div class="set-row"><div class="set-name">${name}</div><div class="set-def">${def}</div><div class="set-val">${val}</div><div class="set-size">${size}</div></div>`;
            $(".set-results").innerHTML = `
                <div class="set-row head"><div>Operation</div><div>Means</div><div>Result</div><div>Size</div></div>
                ${row("A ∪ B", "in A or in B", fmt(union), union.length)}
                ${row("A ∩ B", "in A and in B", fmt(inter), inter.length)}
                ${row("A \\ B", "in A but not in B", fmt(aMinusB), aMinusB.length)}
                ${row("B \\ A", "in B but not in A", fmt(bMinusA), bMinusA.length)}
                ${row("A × B", "ordered pairs (a, b)", prod ? fmt(prod) : `<span class="muted">too many to list</span>`, `${A.length} × ${B.length} = ${A.length * B.length}`)}
                ${row("P(A)", "every subset of A", subsets ? `{${subsets.map(x => (x.length ? `{${x.map(esc).join(", ")}}` : "∅")).join(", ")}}` : `<span class="muted">A is too big to list (try 4 or fewer)</span>`, `2<sup>${A.length}</sup> = ${2 ** A.length}`)}`;
        }
        function load(i) { ia.value = config.examples[i].a; ib.value = config.examples[i].b; draw(); }
        ia.addEventListener("input", draw); ib.addEventListener("input", draw);
        $(".set-ex").addEventListener("click", e => { const b = e.target.closest("[data-x]"); if (b) load(+b.dataset.x); });
        load(0);
    };

    // ======================================================================
    // Truth tables: evaluate a formula with P, Q, R, … and compare it with a second one.
    // Syntax: letters, T/F, ¬ (also ~ or !), ∧ (&), ∨ (|), → (->), ↔ (<->), parentheses.
    // Precedence: ¬, then ∧, then ∨, then → (right to left), then ↔.
    // config: { examples: [[formula, other]] }
    // ======================================================================
    function parseLogic(text) {
        const src = text.replace(/\s+/g, "").replace(/<->|<=>/g, "↔").replace(/->|=>/g, "→").replace(/[~!]/g, "¬").replace(/&/g, "∧").replace(/\|/g, "∨");
        let i = 0;
        const err = m => { throw { error: m }; };
        const peek = () => src[i];
        function iff() { let n = imp(); while (peek() === "↔") { i++; n = { op: "↔", a: n, b: imp() }; } return n; }
        function imp() { const n = or(); if (peek() === "→") { i++; return { op: "→", a: n, b: imp() }; } return n; }
        function or() { let n = and(); while (peek() === "∨") { i++; n = { op: "∨", a: n, b: and() }; } return n; }
        function and() { let n = not(); while (peek() === "∧") { i++; n = { op: "∧", a: n, b: not() }; } return n; }
        function not() { if (peek() === "¬") { i++; return { op: "¬", a: not() }; } return atom(); }
        function atom() {
            const c = peek();
            if (c === "(") { i++; const n = iff(); if (peek() !== ")") err("A “(” is never closed."); i++; return n; }
            if (c === "T" || c === "F") { i++; return { k: c === "T" }; }
            if (c && /[A-Z]/.test(c)) { i++; return { v: c }; }
            err(!c ? "Something is missing at the end." : /[a-z]/.test(c) ? `Use capital letters (P, Q, R, …) for variables, not “${c}”.` : `Unexpected “${c}”.`);
        }
        try {
            if (!src) err("Type a formula.");
            const n = iff();
            if (i < src.length) err(`Unexpected “${src[i]}”.`);
            return { ast: n };
        } catch (e) { if (e && e.error) return e; throw e; }
    }
    const LPREC = { "↔": 1, "→": 2, "∨": 3, "∧": 4, "¬": 5 };
    function logicText(n, outer = 0) {
        if (n.v) return n.v;
        if ("k" in n) return n.k ? "T" : "F";
        if (n.op === "¬") return "¬" + logicText(n.a, 5);
        // Mixed ∧/∨ always get parentheses, as in the lecture: R ∨ (P ∧ Q), not R ∨ P ∧ Q.
        const mixed = c => c.op && ["∧", "∨"].includes(c.op) && ["∧", "∨"].includes(n.op) && c.op !== n.op;
        const side = (c, p) => (mixed(c) ? `(${logicText(c)})` : logicText(c, p));
        const s = `${side(n.a, LPREC[n.op] + (n.op === "→" ? 1 : 0))} ${n.op} ${side(n.b, LPREC[n.op] + (n.op === "→" ? 0 : 1))}`;
        return LPREC[n.op] < outer ? `(${s})` : s;
    }
    const logicVars = (n, s = new Set()) => { if (n.v) s.add(n.v); if (n.a) logicVars(n.a, s); if (n.b) logicVars(n.b, s); return s; };
    function evalLogic(n, env) {
        if (n.v) return env[n.v];
        if ("k" in n) return n.k;
        const a = evalLogic(n.a, env), b = n.b ? evalLogic(n.b, env) : null;
        return { "¬": !a, "∧": a && b, "∨": a || b, "→": !a || b, "↔": a === b }[n.op];
    }
    const subformulas = (n, out = []) => { if (n.a) subformulas(n.a, out); if (n.b) subformulas(n.b, out); if (n.op && !out.some(x => logicText(x) === logicText(n))) out.push(n); return out; };
    const LOGIC_KEYS = ["¬", "∧", "∨", "→", "↔", "(", ")", "T", "F"];

    W["truth-table"] = function (el, config, ctx) {
        const { esc, icon } = ctx;
        let focus;
        el.innerHTML = `
            <div class="truth">
                <div class="regex-row"><label class="input-w regex-in">φ = <input type="text" data-f="1" spellcheck="false" autocomplete="off" aria-label="Formula"></label></div>
                <div class="regex-row"><label class="input-w regex-in">ψ = <input type="text" data-f="2" spellcheck="false" autocomplete="off" aria-label="Formula to compare (optional)" placeholder="optional: compare with"></label></div>
                <div class="sym-keys" role="group" aria-label="Insert a symbol">${LOGIC_KEYS.map(k => `<button type="button" class="sym-key" data-key="${k}">${k}</button>`).join("")}</div>
                <div class="examples tt-ex">${config.examples.map((x, i) => `<button type="button" class="ex" data-x="${i}">${esc(x[0])}${x[1] ? " vs " + esc(x[1]) : ""}</button>`).join("")}</div>
                <div class="regex-err" aria-live="polite"></div>
                <div class="table-wrap tt-wrap"><table class="delta tt"></table></div>
                <div class="verdict" aria-live="polite" hidden></div>
            </div>`;
        const $ = s => el.querySelector(s);
        const f1 = $('[data-f="1"]'), f2 = $('[data-f="2"]');
        focus = f1;
        [f1, f2].forEach(inp => { inp.addEventListener("focus", () => { focus = inp; }); inp.addEventListener("input", draw); });
        $(".sym-keys").addEventListener("click", e => {
            const b = e.target.closest("[data-key]"); if (!b) return;
            const at = focus.selectionStart ?? focus.value.length, end = focus.selectionEnd ?? at;
            focus.value = focus.value.slice(0, at) + b.dataset.key + focus.value.slice(end);
            focus.focus(); focus.setSelectionRange(at + 1, at + 1);
            draw();
        });
        $(".tt-ex").addEventListener("click", e => { const b = e.target.closest("[data-x]"); if (!b) return; const x = config.examples[+b.dataset.x]; f1.value = x[0]; f2.value = x[1] || ""; draw(); });

        function draw() {
            const p1 = parseLogic(f1.value), p2 = f2.value.trim() ? parseLogic(f2.value) : null;
            const errs = [p1.error && `φ: ${p1.error}`, p2 && p2.error && `ψ: ${p2.error}`].filter(Boolean);
            $(".regex-err").textContent = errs.join(" ");
            const v = $(".verdict");
            if (p1.error || (p2 && p2.error)) { $(".tt").innerHTML = ""; v.hidden = true; return; }
            const vars = [...new Set([...logicVars(p1.ast), ...(p2 ? logicVars(p2.ast) : [])])].sort();
            const cols = [...subformulas(p1.ast), ...(p2 ? subformulas(p2.ast) : [])].filter((x, i, a) => a.findIndex(y => logicText(y) === logicText(x)) === i);
            const last1 = logicText(p1.ast), last2 = p2 ? logicText(p2.ast) : null;
            const rows = Array.from({ length: 2 ** vars.length }, (_, r) => Object.fromEntries(vars.map((x, i) => [x, !(r & (1 << (vars.length - 1 - i)))])));
            const cell = b => `<span class="tv ${b ? "t" : "f"}">${b ? "T" : "F"}</span>`;
            const diff = r => p2 && evalLogic(p1.ast, r) !== evalLogic(p2.ast, r);
            $(".tt").innerHTML = `<thead><tr>${vars.map(x => `<th>${x}</th>`).join("")}${cols.map(c => { const t = logicText(c); return `<th class="${t === last1 ? "main" : t === last2 ? "main2" : ""}">${esc(t)}</th>`; }).join("")}</tr></thead>
                <tbody>${rows.map(r => `<tr class="${diff(r) ? "diff" : ""}">${vars.map(x => `<td>${cell(r[x])}</td>`).join("")}${cols.map(c => { const t = logicText(c); return `<td class="${t === last1 ? "main" : t === last2 ? "main2" : ""}">${cell(evalLogic(c, r))}</td>`; }).join("")}</tr>`).join("")}</tbody>`;
            if (!p2) {
                const vals = rows.map(r => evalLogic(p1.ast, r));
                v.hidden = false;
                v.className = "verdict neutral";
                v.innerHTML = `<span class="fb-av"></span><div>${vals.every(Boolean) ? `<b>${esc(last1)}</b> is true in every row: it’s a <b>tautology</b>.` : vals.some(Boolean) ? `<b>${esc(last1)}</b> is true in ${vals.filter(Boolean).length} of ${vals.length} rows.` : `<b>${esc(last1)}</b> is false in every row: it’s a <b>contradiction</b>.`} Type a second formula ψ to compare.</div>`;
                ctx.buddy.react(v.querySelector(".fb-av"), "idle", "");
                return;
            }
            const bad = rows.filter(diff);
            v.hidden = false;
            v.className = "verdict " + (bad.length ? "no" : "yes");
            v.innerHTML = `<span class="fb-av"></span><div>${bad.length
                ? `<b>Not equivalent.</b> They disagree in ${bad.length} row${bad.length > 1 ? "s" : ""} (highlighted), for example when ${vars.map(x => `${x} = ${bad[0][x] ? "T" : "F"}`).join(", ")}.`
                : `<b>Equivalent!</b> φ and ψ have the same value in every row, so you can always replace one with the other.`}</div>`;
            ctx.buddy.react(v.querySelector(".fb-av"), bad.length ? "oops" : "happy", bad.length ? "wobble" : "bounce");
        }
        f1.value = config.examples[0][0]; f2.value = config.examples[0][1] || "";
        draw();
    };

    // ======================================================================
    // Card puzzle (Intro slide 26): which cards must you flip to test "if even, then red"?
    // config: { cards: [{ face, kind: "even"|"odd"|"red"|"other" }] }
    // ======================================================================
    W["card-puzzle"] = function (el, config, ctx) {
        const { icon, esc, buddy, progress, course } = ctx;
        const cards = config.cards, picked = new Set();
        const needed = i => cards[i].kind === "even" || cards[i].kind === "other";
        el.innerHTML = `
            <div class="cards-game">
                <div class="challenge"><div class="ch-lang">Each card has a <b>number</b> on one side and a <b>color</b> on the other. Someone claims: <span class="set">“If a card has an even number on one side, then its other side is red.”</span></div>
                <div class="ch-meta">Which cards do you <b>have</b> to turn over to test the claim? Click to pick them, then check.</div></div>
                <div class="card-row">${cards.map((c, i) => `<button type="button" class="pcard ${c.kind === "red" ? "red" : c.kind === "other" ? "brown" : "num"}" data-c="${i}" aria-pressed="false">${esc(c.face)}</button>`).join("")}</div>
                <div class="build-actions">
                    <button type="button" class="btn primary" data-act="check">${icon("check")} Check my cards</button>
                    <button type="button" class="btn ghost" data-act="clear">${icon("arrow-clockwise")} Start over</button>
                </div>
                <div class="verdict" aria-live="polite" hidden></div>
            </div>`;
        const $ = s => el.querySelector(s);
        $(".card-row").addEventListener("click", e => {
            const b = e.target.closest("[data-c]"); if (!b) return;
            const i = +b.dataset.c;
            picked.has(i) ? picked.delete(i) : picked.add(i);
            b.setAttribute("aria-pressed", picked.has(i));
            $(".verdict").hidden = true;
        });
        $('[data-act="clear"]').addEventListener("click", () => { picked.clear(); el.querySelectorAll(".pcard").forEach(b => b.setAttribute("aria-pressed", "false")); $(".verdict").hidden = true; });
        $('[data-act="check"]').addEventListener("click", () => {
            const ok = cards.every((_, i) => picked.has(i) === needed(i));
            const why = cards.map((c, i) => `<li><b>${esc(c.face)}</b>: ${needed(i) ? "<b>flip it.</b> " : "leave it. "}${c.kind === "even" ? "It’s even, so the claim says its back must be red. Check that it is." : c.kind === "odd" ? "The claim says nothing about odd numbers; any color is fine." : c.kind === "red" ? "The claim doesn’t say red cards must be even (that’s the converse). Either number is fine." : "If its back were even, the claim would be false. By the contrapositive, “not red → not even,” you must check it."}</li>`).join("");
            const v = $(".verdict");
            v.hidden = false;
            v.className = "verdict " + (ok ? "yes" : "no");
            v.innerHTML = `<span class="fb-av"></span><div>${ok ? "<b>Exactly right!</b>" : "<b>Not quite.</b> Here’s each card:"}<ul class="card-why">${why}</ul></div>`;
            buddy.react(v.querySelector(".fb-av"), ok ? "cheer" : "oops", ok ? "party" : "wobble");
            if (ok) { ctx.celebrate($('[data-act="check"]')); progress.award("challenge", `${course}:card-puzzle`, { at: $('[data-act="check"]') }); }
        });
    };

    // ======================================================================
    // Proof puzzles. Two kinds:
    //   order: pick proof steps (mixed with a few wrong ones) and put them in order.
    //          { id, name, type: "order", theorem, steps: [html in the right order], groups: [[i, j]] (steps i..j may come in
    //            any order), distractors: [{ html, why }] }
    //   flaw:  find the one broken line in a proof. { id, name, type: "flaw", theorem, lines: [{ html, ok }], flaw, why }
    // config: { puzzles: [...] }
    // ======================================================================
    W["proof-puzzle"] = function (el, config, ctx) {
        const { icon, esc, buddy, progress, course } = ctx;
        let pi = 0, pool = [], mine = [], checked = null, hint = null;
        const solvedList = () => { try { return JSON.parse(localStorage.getItem("cramlet.toc.solved")) || []; } catch (e) { return []; } };
        const P = () => config.puzzles[pi];
        const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);

        el.innerHTML = `
            <div class="proofs">
                <div class="pick-row" role="group" aria-label="Choose a proof"></div>
                <div class="challenge"><div class="ch-lang"></div><div class="ch-meta"></div></div>
                <div class="proof-area"></div>
                <div class="build-actions">
                    <button type="button" class="btn primary" data-act="check">${icon("check")} Check my proof</button>
                    <button type="button" class="btn ghost" data-act="hint">${icon("lightbulb")} Hint</button>
                    <button type="button" class="btn ghost" data-act="clear">${icon("arrow-clockwise")} Start over</button>
                </div>
                <div class="callout tip ch-hint done" hidden></div>
                <div class="verdict" aria-live="polite" hidden></div>
            </div>`;
        const $ = s => el.querySelector(s);

        function drawPicks() {
            const sv = solvedList();
            $(".pick-row").innerHTML = config.puzzles.map((x, i) =>
                `<button type="button" class="pick" data-p="${i}" aria-pressed="${i === pi}">${sv.includes("proof-" + x.id) ? `<span class="done">${icon("check")}</span>` : ""}${esc(x.name)}</button>`).join("");
        }
        function load(i) {
            pi = i; checked = null; hint = null; mine = [];
            const p = P();
            pool = p.type === "order" ? shuffle([...p.steps.map((h, k) => ({ id: "s" + k, html: h })), ...(p.distractors || []).map((d, k) => ({ id: "d" + k, html: d.html, why: d.why }))]) : [];
            $(".ch-lang").innerHTML = `<span class="ptype">${p.type === "order" ? "Build the proof" : "Find the flaw"}</span> ${p.theorem}`;
            $(".ch-meta").innerHTML = p.type === "order"
                ? `Click steps to add them to your proof, then put them in order. <b>Some steps don’t belong</b>: leave those out.`
                : `This proof has exactly <b>one</b> broken step. Click the line you think is wrong.`;
            $(".verdict").hidden = true; $(".ch-hint").hidden = true;
            $('[data-act="check"]').hidden = p.type !== "order";
            $('[data-act="hint"]').hidden = p.type !== "order";
            drawPicks();
            draw();
        }

        // Which positions are right, given that steps in a group can come in any order.
        function grade() {
            const p = P(), n = p.steps.length, slots = [];
            for (let i = 0; i < n;) {
                const g = (p.groups || []).find(g => g[0] === i);
                const hi = g ? g[1] : i;
                slots.push(Array.from({ length: hi - i + 1 }, (_, k) => "s" + (i + k)));
                i = hi + 1;
            }
            const marks = mine.map(x => (x.id[0] === "d" ? "bad" : "place"));
            let pos = 0, firstWrong = -1, expected = null;
            for (const slot of slots) {
                for (let t = 0; t < slot.length; t++) {
                    const item = mine[pos + t];
                    if (item && slot.includes(item.id)) marks[pos + t] = "ok";
                    else if (firstWrong < 0) {
                        firstWrong = pos + t;
                        const okIds = mine.slice(pos, pos + slot.length).filter(x => slot.includes(x.id)).map(x => x.id);
                        expected = slot.find(id => !okIds.includes(id));
                    }
                }
                pos += slot.length;
            }
            const solved = firstWrong < 0 && mine.length === n;
            return { marks, solved, firstWrong: firstWrong < 0 ? (mine.length > n ? n : -1) : firstWrong, expected, missing: Math.max(0, n - mine.filter((_, i) => marks[i] === "ok").length) };
        }

        function draw() {
            const p = P();
            if (p.type === "flaw") {
                $(".proof-area").innerHTML = `<ol class="flaw-lines">${p.lines.map((l, i) => `<li><button type="button" class="fline${checked && checked.i === i ? (checked.ok ? " ok" : " bad") : ""}" data-l="${i}"><span class="fnum">${i + 1}</span><span>${l.html}</span></button></li>`).join("")}</ol>`;
                return;
            }
            const marks = checked ? checked.marks : [];
            $(".proof-area").innerHTML = `
                <div class="proof-cols">
                    <div class="side-box"><div class="side-title">Steps to choose from</div>
                        <div class="pool">${pool.length ? pool.map((x, i) => `<button type="button" class="pstep" data-pool="${i}">${x.html}</button>`).join("") : `<p class="muted">You’ve used every step.</p>`}</div></div>
                    <div class="side-box"><div class="side-title">Your proof</div>
                        ${mine.length ? `<ol class="mine">${mine.map((x, i) => `<li class="${marks[i] || ""}">
                            <span class="mnum">${i + 1}</span><span class="mtext">${x.html}${marks[i] === "bad" ? `<span class="mwhy">${x.why}</span>` : marks[i] === "place" ? `<span class="mwhy">This step belongs in the proof, but not here.</span>` : ""}</span>
                            <span class="mctl"><button type="button" class="ctl small" data-up="${i}" aria-label="Move up" ${i === 0 ? "disabled" : ""}>↑</button><button type="button" class="ctl small" data-down="${i}" aria-label="Move down" ${i === mine.length - 1 ? "disabled" : ""}>↓</button><button type="button" class="ctl small" data-out="${i}" aria-label="Remove">✕</button></span>
                        </li>`).join("")}</ol>` : `<p class="muted">Click a step on the left to start your proof.</p>`}</div>
                </div>`;
        }
        const changed = () => { checked = null; $(".verdict").hidden = true; draw(); };

        function check() {
            const g = grade(), v = $(".verdict"), p = P();
            checked = g;
            draw();
            v.hidden = false;
            if (g.solved) {
                v.className = "verdict yes";
                v.innerHTML = `<span class="fb-av"></span><div><b>That’s a complete, correct proof!</b> ${p.done || ""}</div>`;
                buddy.react(v.querySelector(".fb-av"), "cheer", "party");
                ctx.celebrate($('[data-act="check"]'));
                solve();
                return;
            }
            const bad = g.marks.filter(m => m === "bad").length, place = g.marks.filter(m => m === "place").length;
            v.className = "verdict no";
            v.innerHTML = `<span class="fb-av"></span><div><b>Not yet.</b> ${[
                g.marks.filter(m => m === "ok").length ? `${g.marks.filter(m => m === "ok").length} step${g.marks.filter(m => m === "ok").length > 1 ? "s are" : " is"} in the right place (green).` : "",
                place ? `${place} belong${place > 1 ? "" : "s"} somewhere else (orange).` : "",
                bad ? `${bad} ${bad > 1 ? "don’t" : "doesn’t"} belong in the proof at all (red); read why.` : "",
                g.missing ? `${g.missing} step${g.missing > 1 ? "s are" : " is"} still missing or misplaced.` : "",
            ].filter(Boolean).join(" ")}</div>`;
            buddy.react(v.querySelector(".fb-av"), "oops", "wobble");
        }
        function solve() {
            const p = P();
            progress.award("challenge", `${course}:proof:${p.id}`, { at: $(".build-actions .btn") });
            const sv = solvedList();
            if (!sv.includes("proof-" + p.id)) { sv.push("proof-" + p.id); try { localStorage.setItem("cramlet.toc.solved", JSON.stringify(sv)); } catch (e) { /* ignore */ } }
            drawPicks();
        }
        function showHint() {
            const g = grade(), p = P(), h = $(".ch-hint");
            let text;
            if (g.solved) text = "Your proof is already complete. Press <b>Check my proof</b>.";
            else if (g.firstWrong < 0) text = `So far so good. The next step is: <i>${p.steps[mine.length]}</i>`;
            else {
                const k = +g.expected.slice(1);
                text = `Step ${g.firstWrong + 1} should be: <i>${p.steps[k]}</i>`;
            }
            h.innerHTML = `${icon("lightbulb", "callout-ic")}<div class="callout-body"><span class="callout-label">Hint</span>${text}</div>`;
            h.hidden = false;
        }

        el.addEventListener("click", e => {
            const t = e.target.closest("button");
            if (!t || !el.contains(t)) return;
            const d = t.dataset;
            if (d.p !== undefined) load(+d.p);
            else if (d.pool !== undefined) { mine.push(pool.splice(+d.pool, 1)[0]); changed(); }
            else if (d.up !== undefined) { const i = +d.up; [mine[i - 1], mine[i]] = [mine[i], mine[i - 1]]; changed(); }
            else if (d.down !== undefined) { const i = +d.down; [mine[i + 1], mine[i]] = [mine[i], mine[i + 1]]; changed(); }
            else if (d.out !== undefined) { pool.push(mine.splice(+d.out, 1)[0]); changed(); }
            else if (d.l !== undefined) {
                const p = P(), i = +d.l, ok = i === p.flaw, v = $(".verdict");
                checked = { i, ok };
                draw();
                v.hidden = false;
                v.className = "verdict " + (ok ? "yes" : "no");
                v.innerHTML = `<span class="fb-av"></span><div>${ok ? `<b>Found it!</b> Line ${i + 1} is the flaw. ${p.why}` : `<b>Line ${i + 1} is fine.</b> ${p.lines[i].ok || ""} Look for another line.`}</div>`;
                buddy.react(v.querySelector(".fb-av"), ok ? "cheer" : "oops", ok ? "party" : "wobble");
                if (ok) { ctx.celebrate(t); solve(); }
            }
            else if (d.act === "check") check();
            else if (d.act === "hint") showHint();
            else if (d.act === "clear") load(pi);
        });
        load(0);
    };

    // ======================================================================
    // Write a regex: type a regex for a language; check it on every string up to length 10.
    // config: { alphabet, challenges: [{ id, name, lang, test(w), hint }] }
    // ======================================================================
    W["regex-writer"] = function (el, config, ctx) {
        const { icon, esc, buddy, progress, course } = ctx;
        const SIG = config.alphabet || ["0", "1"], CHECK_LEN = 10;
        let ci = 0;
        el.innerHTML = `
            <div class="builder">
                <div class="pick-row" role="group" aria-label="Choose a challenge"></div>
                <div class="challenge">
                    <div class="ch-lang"></div>
                    <div class="ch-meta">Σ = {${SIG.join(", ")}}. Use ∪, *, +, ε, ∅, Σ and parentheses.</div>
                </div>
                ${regexInputHTML()}
                <div class="regex-err" aria-live="polite"></div>
                <div class="build-actions">
                    <button type="button" class="btn primary" data-act="check">${icon("check")} Check my regex</button>
                    <button type="button" class="btn ghost" data-act="hint">${icon("lightbulb")} Hint</button>
                    <button type="button" class="btn ghost" data-act="clear">${icon("arrow-clockwise")} Start over</button>
                </div>
                <div class="callout tip ch-hint done" hidden></div>
                <div class="verdict" aria-live="polite" hidden></div>
            </div>`;
        const $ = s => el.querySelector(s);
        const rin = $(".regex-in input");
        const solvedList = () => { try { return JSON.parse(localStorage.getItem("cramlet.toc.solved")) || []; } catch (e) { return []; } };

        function drawPicks() {
            const sv = solvedList();
            $(".pick-row").innerHTML = config.challenges.map((c, i) =>
                `<button type="button" class="pick" data-c="${i}" aria-pressed="${i === ci}">${sv.includes("regex-" + c.id) ? `<span class="done">${icon("check")}</span>` : ""}${esc(c.name)}</button>`).join("");
        }
        function load(i) {
            ci = i;
            const c = config.challenges[i];
            $(".ch-lang").innerHTML = `Write a regular expression for <span class="set">${c.lang}</span>`;
            $(".ch-hint").hidden = true;
            $(".ch-hint").innerHTML = `${icon("lightbulb", "callout-ic")}<div class="callout-body"><span class="callout-label">Hint</span>${c.hint}</div>`;
            $(".verdict").hidden = true;
            rin.value = "";
            $(".regex-err").textContent = "";
            drawPicks();
        }
        function check() {
            const c = config.challenges[ci], v = $(".verdict"), r = A.parseRegex(rin.value, SIG);
            v.hidden = false;
            if (r.error) {
                v.className = "verdict no";
                v.innerHTML = `<span class="fb-av"></span><div><b>That isn’t a regular expression yet.</b> ${esc(r.error)}</div>`;
                buddy.react(v.querySelector(".fb-av"), "oops", "wobble");
                return;
            }
            const nfa = A.regexToNFA(r.ast, SIG);
            let bad = null;
            for (const w of A.strings(SIG, CHECK_LEN)) if (A.acceptsNFA(nfa, w) !== c.test(w)) { bad = w; break; }
            if (bad === null) {
                v.className = "verdict yes";
                v.innerHTML = `<span class="fb-av"></span><div><b>It works!</b> ${esc(A.regexText(r.ast))} matches exactly the right strings, checked on every string up to length ${CHECK_LEN}.</div>`;
                buddy.react(v.querySelector(".fb-av"), "cheer", "party");
                ctx.celebrate($('[data-act="check"]'));
                progress.award("challenge", `${course}:regex-write:${c.id}`, { at: $('[data-act="check"]') });
                const sv = solvedList();
                if (!sv.includes("regex-" + c.id)) { sv.push("regex-" + c.id); try { localStorage.setItem("cramlet.toc.solved", JSON.stringify(sv)); } catch (e) { /* ignore */ } }
                drawPicks();
                return;
            }
            const should = c.test(bad);
            v.className = "verdict no";
            v.innerHTML = `<span class="fb-av"></span><div><b>Not yet.</b> Your regex ${should ? "doesn’t match" : "matches"} <code>${esc(show(bad))}</code>, but that string ${should ? "<b>is</b>" : "is <b>not</b>"} in the language. It’s the shortest string your regex gets wrong.</div>`;
            buddy.react(v.querySelector(".fb-av"), "oops", "wobble");
        }
        bindRegexKeys(el, rin, () => {
            const r = A.parseRegex(rin.value, SIG);
            $(".regex-err").textContent = rin.value.trim() && r.error ? r.error : "";
            $(".verdict").hidden = true;
        });
        rin.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
        $(".pick-row").addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (b) load(+b.dataset.c); });
        $('[data-act="check"]').addEventListener("click", check);
        $('[data-act="hint"]').addEventListener("click", () => { $(".ch-hint").hidden = false; });
        $('[data-act="clear"]').addEventListener("click", () => load(ci));
        load(0);
    };

    // ======================================================================
    // Pumping lemma game: you vs. the adversary.
    //   adversary picks p → you pick w ∈ L, |w| ≥ p → adversary splits w = xyz (|xy| ≤ p, |y| > 0)
    //   → you pick i and win if xyⁱz ∉ L.
    // The adversary tries every legal split, so a w that can't win gets caught right away.
    // config: { languages: [{ id, name, lang, test(w), suggest(p) → [{ label, w, note? }] }] }
    // ======================================================================
    const sup = n => String(n).split("").map(d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]).join("");
    // Short strings show every symbol; long ones are written with exponents, like 0¹²1³.
    function compact(str) {
        if (str.length <= 14) return str;
        return str.replace(/(.)\1*/g, run => run.length > 2 ? run[0] + sup(run.length) : run);
    }

    W["pumping-game"] = function (el, config, ctx) {
        const { icon, esc, buddy, progress, course } = ctx;
        let li = 0, L, p, w, split, phase;
        const I_MAX = 6;

        el.innerHTML = `
            <div class="pump">
                <div class="pick-row" role="group" aria-label="Choose a language"></div>
                <div class="challenge">
                    <div class="ch-lang"></div>
                    <div class="ch-meta">Prove it’s not regular by beating the adversary.</div>
                </div>
                <ol class="moves"></ol>
            </div>`;
        const $ = s => el.querySelector(s);

        const splits = str => {
            const out = [];
            for (let a = 0; a < p; a++) for (let b = a + 1; b <= Math.min(p, str.length); b++) out.push({ x: str.slice(0, a), y: str.slice(a, b), z: str.slice(b) });
            return out;
        };
        const pump = (sp, i) => sp.x + sp.y.repeat(i) + sp.z;
        const iLimit = () => Math.max(I_MAX, w.length + 2);
        // The i values (0..limit) that break this split, i.e. pump w out of L.
        const winners = sp => Array.from({ length: iLimit() + 1 }, (_, i) => i).filter(i => !L.test(pump(sp, i)));

        function segs(sp, i) {
            const y = sp.y.repeat(i);
            const part = (t, cls, label) => t ? `<span class="pseg ${cls}"><span class="pseg-t">${esc(compact(t))}</span><span class="pseg-l">${label}</span></span>` : "";
            return `<span class="psegs">${part(sp.x, "x", "x")}${i === 1 ? part(sp.y, "y", "y") : y ? part(y, "y", `y${sup(i)}`) : `<span class="pseg y gone"><span class="pseg-t">·</span><span class="pseg-l">y⁰</span></span>`}${part(sp.z, "z", "z")}</span>`;
        }

        function drawPicks() {
            const solved = JSON.parse(localStorage.getItem("cramlet.toc.solved") || "[]");
            $(".pick-row").innerHTML = config.languages.map((x, i) =>
                `<button type="button" class="pick" data-l="${i}" aria-pressed="${i === li}">${solved.includes("pump-" + x.id) ? `<span class="done">${icon("check")}</span>` : ""}${esc(x.name)}</button>`).join("");
        }
        function newRound(i = li) {
            li = i; L = config.languages[i];
            p = 3 + Math.floor(Math.random() * 3);
            w = null; split = null; phase = "w";
            $(".ch-lang").innerHTML = `<span class="set">${L.lang}</span>`;
            drawPicks();
            draw();
        }

        function draw() {
            const moves = [];
            moves.push(`<li class="move them"><span class="who">Adversary</span><div>I pick the pumping length <b class="big">p = ${p}</b>.</div></li>`);

            if (phase === "w") {
                moves.push(`<li class="move you active"><span class="who">You</span><div>
                    Pick a string <b>w ∈ L</b> with <b>|w| ≥ ${p}</b>. Choose wisely: I’ll get to split it.
                    <div class="sugg">${L.suggest(p).map((s, j) => `<button type="button" class="ex" data-s="${j}">${esc(s.label)}</button>`).join("")}</div>
                    <div class="w-row"><label class="input-w">w = <input type="text" spellcheck="false" autocomplete="off" aria-label="Your string w"></label>
                    <button type="button" class="btn primary" data-act="use">Use this w</button></div>
                    <div class="w-err" aria-live="polite"></div></div></li>`);
            } else {
                moves.push(`<li class="move you"><span class="who">You</span><div>I pick <b>w = ${esc(compact(w))}</b> <span class="muted">(length ${w.length})</span>.</div></li>`);
            }

            if (phase === "caught") {
                moves.push(`<li class="move them win-them"><span class="who">Adversary</span><div>
                    I split it as ${segs(split, 1)} and now <b>every</b> xyⁱz is still in L:
                    <div class="pumped">${[0, 1, 2, 3].map(i => `<div>i = ${i}: ${esc(compact(pump(split, i)))} <span class="tag in">in L</span></div>`).join("")}</div>
                    <div class="callout warn done">${icon("warning", "callout-ic")}<div class="callout-body"><span class="callout-label">This w can’t win</span>With this w, I have a split you can’t beat. A proof has to work against <b>every</b> split, so pick a different w.</div></div>
                    <button type="button" class="btn" data-act="again">${icon("arrow-clockwise")} Pick another w</button></div></li>`);
            }

            if (phase === "i" || phase === "won") {
                moves.push(`<li class="move them"><span class="who">Adversary</span><div>
                    I split w = xyz with |xy| ≤ ${p} and |y| > 0: ${segs(split, 1)}</div></li>`);
            }
            if (phase === "i") {
                moves.push(`<li class="move you active"><span class="who">You</span><div>
                    Pick <b>i ≥ 0</b>. You win if <b>xyⁱz ∉ L</b>.
                    <div class="i-row">${Array.from({ length: 5 }, (_, i) => `<button type="button" class="ctl" data-i="${i}">${i}</button>`).join("")}
                    <label class="input-w small">or i = <input type="number" min="0" max="${iLimit()}" aria-label="Another value of i"></label></div>
                    <div class="i-try" aria-live="polite"></div></div></li>`);
            }
            if (phase === "won") {
                const all = splits(w).map(sp => ({ sp, ws: winners(sp) }));
                moves.push(`<li class="move you"><span class="who">You</span><div>
                    I pick <b>i = ${split.i}</b>: ${segs(split, split.i)} <span class="tag out">not in L</span></div></li>`);
                moves.push(`<li class="move won"><span class="rs-av"></span><div>
                    <b>You win!</b> And not by luck: <b>every</b> way I could have split this w loses to some i. That’s exactly what a pumping-lemma proof shows, so L is <b>not regular</b>.
                    <details class="every"><summary>See all ${all.length} splits and an i that beats each one</summary>
                    <table class="delta"><thead><tr><th>x</th><th>y</th><th>z</th><th>winning i</th></tr></thead><tbody>
                    ${all.map(({ sp, ws }) => `<tr><td>${esc(compact(sp.x)) || "ε"}</td><td>${esc(compact(sp.y))}</td><td>${esc(compact(sp.z)) || "ε"}</td><td>${ws.slice(0, 3).join(", ")}${ws.length > 3 ? ", …" : ""}</td></tr>`).join("")}
                    </tbody></table></details>
                    <div class="w-row"><button type="button" class="btn primary" data-act="again">${icon("arrow-clockwise")} Play again</button></div></div></li>`);
            }
            $(".moves").innerHTML = moves.join("");

            const r = $(".move.won .rs-av");
            if (r) buddy.react(r, "cheer", "party");
        }

        function useW(str) {
            const err = $(".w-err");
            if (!/^[01]*$/.test(str)) { err.textContent = "Use only 0s and 1s."; return; }
            if (!L.test(str)) { err.textContent = `${str || "ε"} isn’t in L. Pick a string from the language.`; return; }
            if (str.length < p) { err.textContent = `That’s only ${str.length} long. It needs |w| ≥ ${p}.`; return; }
            w = str;
            // The adversary looks for a split that survives every i.
            const all = splits(w);
            const safe = all.find(sp => winners(sp).length === 0);
            if (safe) { split = safe; phase = "caught"; draw(); return; }
            // Otherwise it picks the split that's hardest to beat (fewest winning i's), with some randomness.
            const ranked = all.map(sp => ({ sp, n: winners(sp).length })).sort((a, b) => a.n - b.n);
            const hardest = ranked.filter(r => r.n === ranked[0].n);
            split = hardest[Math.floor(Math.random() * hardest.length)].sp;
            phase = "i";
            draw();
        }
        function tryI(i) {
            const out = pump(split, i), msg = $(".i-try");
            if (L.test(out)) {
                msg.innerHTML = `<div class="tried">i = ${i}: ${segs(split, i)} <span class="tag in">still in L</span> Try a different i.</div>`;
                return;
            }
            split.i = i;
            phase = "won";
            draw();
            ctx.celebrate($(".move.won .rs-av"));
            progress.award("challenge", `${course}:pump:${L.id}`, { at: $(".move.won .rs-av") });
            const solved = JSON.parse(localStorage.getItem("cramlet.toc.solved") || "[]");
            if (!solved.includes("pump-" + L.id)) { solved.push("pump-" + L.id); try { localStorage.setItem("cramlet.toc.solved", JSON.stringify(solved)); } catch (e) { /* ignore */ } }
            drawPicks();
        }

        el.addEventListener("click", e => {
            const t = e.target.closest("button");
            if (!t) return;
            if (t.dataset.l !== undefined) newRound(+t.dataset.l);
            else if (t.dataset.s !== undefined) { const s = L.suggest(p)[+t.dataset.s]; $(".input-w input").value = s.w; useW(s.w); }
            else if (t.dataset.act === "use") useW($(".input-w input").value.trim());
            else if (t.dataset.act === "again") newRound();
            else if (t.dataset.i !== undefined) tryI(+t.dataset.i);
        });
        el.addEventListener("keydown", e => {
            if (e.key !== "Enter") return;
            if (e.target.matches('.w-row input')) useW(e.target.value.trim());
            if (e.target.matches('.i-row input') && e.target.value !== "") tryI(Math.min(iLimit(), Math.max(0, parseInt(e.target.value, 10) || 0)));
        });
        newRound(0);
    };

    // ======================================================================
    // DFA builder: fill in a transition table, then check it against the language.
    // config: { maxStates, challenges: [{ id, name, lang, test(w) -> bool, hint }] }
    // ======================================================================
    const SOLVED_KEY = "cramlet.toc.solved";
    const solved = () => { try { return JSON.parse(localStorage.getItem(SOLVED_KEY)) || []; } catch (e) { return []; } };
    function markSolved(id) {
        const s = solved();
        if (!s.includes(id)) { s.push(id); try { localStorage.setItem(SOLVED_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ } }
    }

    W["dfa-builder"] = function (el, config, ctx) {
        const { icon, esc, buddy, progress, course } = ctx;
        const SIGMA = ["0", "1"], MAX = config.maxStates || 5, CHECK_LEN = 12;
        let ci = 0, n, delta, accept;

        el.innerHTML = `
            <div class="builder">
                <div class="pick-row" role="group" aria-label="Choose a challenge"></div>
                <div class="challenge">
                    <div class="ch-lang"></div>
                    <div class="ch-meta">Σ = {0, 1}. Your start state is q<sub>0</sub>.</div>
                </div>
                <div class="build-grid">
                    <div class="build-table">
                        <div class="count-row">
                            <span>States</span>
                            <button type="button" class="ctl small" data-act="less" aria-label="Remove a state">−</button>
                            <b class="count"></b>
                            <button type="button" class="ctl small" data-act="more" aria-label="Add a state">+</button>
                        </div>
                        <table class="delta edit"></table>
                        <p class="muted">Pick where each state goes on 0 and on 1, and tick the accept states.</p>
                    </div>
                    <div class="diagram"></div>
                </div>
                <div class="build-actions">
                    <button type="button" class="btn primary" data-act="check">${icon("check")} Check my DFA</button>
                    <button type="button" class="btn ghost" data-act="hint">${icon("lightbulb")} Hint</button>
                    <button type="button" class="btn ghost" data-act="clear">${icon("arrow-clockwise")} Start over</button>
                </div>
                <div class="callout tip ch-hint done" hidden></div>
                <div class="verdict" aria-live="polite" hidden></div>
            </div>`;
        const $ = s => el.querySelector(s);
        const names = () => Array.from({ length: n }, (_, i) => "q" + i);
        const machine = () => {
            const Q = names();
            return { states: A.layout(Q), start: "q0", accept: Q.filter((_, i) => accept[i]), alphabet: SIGMA,
                delta: Object.fromEntries(Q.map((q, i) => [q, { 0: "q" + delta[i][0], 1: "q" + delta[i][1] }])) };
        };

        function drawPicks() {
            const s = solved();
            $(".pick-row").innerHTML = config.challenges.map((c, i) =>
                `<button type="button" class="pick" data-c="${i}" aria-pressed="${i === ci}">${s.includes(c.id) ? `<span class="done">${icon("check")}</span>` : ""}${esc(c.name)}</button>`).join("");
        }
        function load(i) {
            ci = i;
            n = 2; delta = [[0, 0], [0, 0]]; accept = [false, false];
            $(".ch-lang").innerHTML = `Build a DFA that recognizes <span class="set">${config.challenges[i].lang}</span>`;
            $(".ch-hint").hidden = true;
            $(".ch-hint").innerHTML = `${icon("lightbulb", "callout-ic")}<div class="callout-body"><span class="callout-label">Hint</span>${config.challenges[i].hint}</div>`;
            $(".verdict").hidden = true;
            drawPicks();
            draw();
        }
        function draw() {
            $(".count").textContent = n;
            $('[data-act="less"]').disabled = n <= 1;
            $('[data-act="more"]').disabled = n >= MAX;
            const opts = sel => names().map((q, j) => `<option value="${j}"${j === sel ? " selected" : ""}>q${j}</option>`).join("");
            $(".delta.edit").innerHTML = `<thead><tr><th>State</th><th>on 0</th><th>on 1</th><th>Accept?</th></tr></thead><tbody>${
                names().map((q, i) => `<tr>
                    <th>${i === 0 ? "→" : ""}${sub(q)}</th>
                    ${SIGMA.map(a => `<td><select data-i="${i}" data-a="${a}" aria-label="δ(q${i}, ${a})">${opts(delta[i][a])}</select></td>`).join("")}
                    <td><input type="checkbox" data-acc="${i}" ${accept[i] ? "checked" : ""} aria-label="q${i} is an accept state"></td>
                </tr>`).join("")}</tbody>`;
            $(".diagram").innerHTML = A.render(machine(), { label: "Your DFA" });
        }

        function check() {
            const c = config.challenges[ci], m = machine();
            let bad = null;
            for (const s of A.strings(SIGMA, CHECK_LEN)) {
                if (A.accepts(m, s) !== c.test(s)) { bad = s; break; }
            }
            const v = $(".verdict");
            v.hidden = false;
            if (bad === null) {
                v.className = "verdict yes";
                v.innerHTML = `<span class="fb-av"></span><div><b>It works!</b> Your DFA agrees with the language on every string up to length ${CHECK_LEN}.</div>`;
                buddy.react(v.querySelector(".fb-av"), "cheer", "party");
                ctx.celebrate($('[data-act="check"]'));
                progress.award("challenge", `${course}:dfa-build:${c.id}`, { at: $('[data-act="check"]') });
                markSolved(c.id);
                drawPicks();
                return;
            }
            const run = A.runDFA(m, bad), should = c.test(bad);
            const path = [sub("q0")].concat(run.steps.map(s => `<span class="arrow">—${esc(s.sym)}→</span>${sub(s.next)}`)).join(" ");
            v.className = "verdict no";
            v.innerHTML = `<span class="fb-av"></span><div>
                <b>Not yet.</b> Your DFA ${should ? "rejects" : "accepts"} <code>${esc(show(bad))}</code>, but that string ${should ? "<b>is</b>" : "is <b>not</b>"} in the language.
                It's the shortest string your DFA gets wrong.
                <div class="path">${path} <span class="muted">(${run.accepted ? "accept" : "not an accept"} state)</span></div></div>`;
            buddy.react(v.querySelector(".fb-av"), "oops", "wobble");
        }

        el.addEventListener("change", e => {
            const t = e.target;
            if (t.dataset.acc !== undefined) accept[+t.dataset.acc] = t.checked;
            else if (t.dataset.i !== undefined) delta[+t.dataset.i][t.dataset.a] = +t.value;
            else return;
            $(".verdict").hidden = true;
            draw();
        });
        $(".pick-row").addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (b) load(+b.dataset.c); });
        $('[data-act="more"]').addEventListener("click", () => { n++; delta.push([0, 0]); accept.push(false); $(".verdict").hidden = true; draw(); });
        $('[data-act="less"]').addEventListener("click", () => {
            n--; delta.pop(); accept.pop();
            delta = delta.map(r => r.map(t => (t >= n ? 0 : t)));
            $(".verdict").hidden = true; draw();
        });
        $('[data-act="check"]').addEventListener("click", check);
        $('[data-act="hint"]').addEventListener("click", () => { $(".ch-hint").hidden = false; });
        $('[data-act="clear"]').addEventListener("click", () => load(ci));

        load(0);
    };
})();
