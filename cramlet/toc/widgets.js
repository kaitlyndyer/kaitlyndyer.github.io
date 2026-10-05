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
                    <div class="callout warn">${icon("warning", "callout-ic")}<div class="callout-body"><span class="callout-label">This w can’t win</span>With this w, I have a split you can’t beat. A proof has to work against <b>every</b> split, so pick a different w.</div></div>
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
                <div class="callout tip ch-hint" hidden></div>
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
