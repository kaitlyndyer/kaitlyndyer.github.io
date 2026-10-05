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

    // ======================================================================
    // DFA runner: step a string through a DFA, like the sort visualizer.
    // config: { machines: [{ id, name, lang, machine, examples: [] }] }
    // ======================================================================
    W["dfa-runner"] = function (el, config, ctx) {
        const { icon, esc, buddy } = ctx;
        let mi = 0, m, w = "", run, k = 0, timer = null, speed = 3, revealed = false;

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
                <div class="run-status" aria-live="polite"><span class="rs-av"></span><span class="rs-text"></span></div>
                <div class="run-controls">
                    <label class="input-w">w =
                        <input type="text" inputmode="numeric" maxlength="16" spellcheck="false" autocomplete="off" aria-label="Input string">
                    </label>
                    <div class="examples"></div>
                </div>
                <div class="player">
                    <button type="button" class="ctl" data-act="reset" title="Back to the start" aria-label="Back to the start">${icon("arrow-clockwise")}</button>
                    <button type="button" class="ctl" data-act="back" title="Step back (←)" aria-label="Step back">◀</button>
                    <button type="button" class="ctl play" data-act="play" title="Play (space)" aria-label="Play">▶</button>
                    <button type="button" class="ctl" data-act="step" title="Step (→)" aria-label="Step forward">▶|</button>
                    <label class="speed">Speed <input type="range" min="1" max="5" value="3" style="--fill: 50%" aria-label="Speed"></label>
                </div>
                <div class="run-side">
                    <div class="side-box">
                        <div class="side-title">Extended transition function</div>
                        <ol class="trace"></ol>
                    </div>
                    <div class="side-box">
                        <div class="side-title">Formal definition</div>
                        <div class="formal"></div>
                    </div>
                </div>
            </div>`;

        const $ = s => el.querySelector(s);
        const input = $(".input-w input");

        function loadMachine(i) {
            mi = i; m = config.machines[i].machine; revealed = false;
            el.querySelectorAll(".pick").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
            $(".diagram").innerHTML = A.render(m, { label: "State diagram of the machine" });
            $(".lang-a").hidden = true; $('[data-act="reveal"]').hidden = false;
            $(".lang-a").innerHTML = config.machines[i].lang;
            $(".examples").innerHTML = config.machines[i].examples.map(x => `<button type="button" class="ex" data-w="${esc(x)}">${esc(show(x))}</button>`).join("");
            drawFormal();
            setInput(config.machines[i].examples[0]);
        }

        function setInput(str) {
            stop();
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

            let msg, mood = "idle";
            if (!done() && k === 0) msg = `Start in ${sub(m.start)}. Press <b>Step</b> or <b>Play</b> to read the first symbol.`;
            else if (!done()) msg = `Read <b>${esc(last.sym)}</b>: δ(${sub(last.state)}, ${esc(last.sym)}) = ${sub(last.next)}, so move to ${sub(last.next)}.`;
            else {
                const ok = run.accepted;
                mood = ok ? "happy" : "oops";
                msg = `${w.length ? `Done reading. ` : `The input is empty, so nothing gets read. `}M ended in ${sub(q)}, which is ${ok ? "" : "<b>not</b> "}an accept state, so M <b class="${ok ? "yes" : "no"}">${ok ? "accepts" : "rejects"}</b> ${esc(show(w))}.`;
            }
            $(".rs-text").innerHTML = msg;
            $(".run-status").className = "run-status" + (done() ? (run.accepted ? " yes" : " no") : "");
            buddy.react($(".rs-av"), mood, done() && k === w.length ? (run.accepted ? "bounce" : "wobble") : "");

            $(".trace").innerHTML = Array.from({ length: k + 1 }, (_, j) =>
                `<li class="${j === k ? "now" : ""}">δ̂(${sub(m.start)}, ${esc(show(w.slice(0, j)))}) = ${sub(stateAt(j))}</li>`).join("");

            el.querySelectorAll(".formal td[data-q]").forEach(td =>
                td.classList.toggle("now", !!last && td.dataset.q === last.state && td.dataset.a === last.sym));
            $('[data-act="back"]').disabled = k === 0;
            $('[data-act="step"]').disabled = done();
            const play = $('[data-act="play"]');
            play.textContent = timer ? "❚❚" : "▶";
            play.setAttribute("aria-label", timer ? "Pause" : "Play");
        }

        function drawFormal() {
            const Q = Object.keys(m.states);
            $(".formal").innerHTML = `
                <p>Q = {${Q.map(sub).join(", ")}}, Σ = {${m.alphabet.join(", ")}}, q<sub>start</sub> = ${sub(m.start)}, F = {${m.accept.map(sub).join(", ")}}</p>
                <table class="delta"><thead><tr><th>δ</th>${m.alphabet.map(a => `<th>${esc(a)}</th>`).join("")}</tr></thead>
                <tbody>${Q.map(q => `<tr><th>${q === m.start ? "→" : ""}${sub(q)}${m.accept.includes(q) ? "*" : ""}</th>${m.alphabet.map(a => `<td data-q="${esc(q)}" data-a="${esc(a)}">${sub(m.delta[q][a])}</td>`).join("")}</tr>`).join("")}</tbody></table>
                <p class="muted">→ start state, * accept state</p>`;
        }

        function step(d) { stopIfDone(); k = Math.max(0, Math.min(w.length, k + d)); draw(); if (done()) stop(); }
        function stopIfDone() { if (done() && timer) stop(); }
        function stop() { clearInterval(timer); timer = null; }
        function play() {
            if (timer) { stop(); draw(); return; }
            if (done()) k = 0;
            timer = setInterval(() => { if (done()) { stop(); draw(); } else step(1); }, 1500 / speed);
            draw();
        }

        el.querySelector(".pick-row").addEventListener("click", e => { const b = e.target.closest("[data-m]"); if (b) loadMachine(+b.dataset.m); });
        $(".examples").addEventListener("click", e => { const b = e.target.closest("[data-w]"); if (b) setInput(b.dataset.w); });
        input.addEventListener("input", () => {
            const clean = input.value.split("").filter(c => m.alphabet.includes(c)).join("");
            if (clean !== input.value) input.value = clean;
            setInput(clean);
        });
        $('[data-act="reveal"]').addEventListener("click", e => { $(".lang-a").hidden = false; e.target.hidden = true; revealed = true; });
        $('[data-act="reset"]').addEventListener("click", () => { stop(); k = 0; draw(); });
        $('[data-act="back"]').addEventListener("click", () => { stop(); step(-1); });
        $('[data-act="step"]').addEventListener("click", () => { stop(); step(1); });
        $('[data-act="play"]').addEventListener("click", play);
        $(".speed input").addEventListener("input", e => {
            speed = +e.target.value;
            if (timer) { stop(); play(); }
        });
        ctx.setKeyHandler(e => {
            if (!document.body.contains(el)) { stop(); return; }
            if (e.target.matches("input, textarea, select")) return;
            if (e.key === "ArrowRight") { stop(); step(1); }
            else if (e.key === "ArrowLeft") { stop(); step(-1); }
            else if (e.key === " " && el.contains(document.activeElement)) { e.preventDefault(); play(); }
        });

        loadMachine(0);
    };

    // ======================================================================
    // NFA runner: keep the SET of states the NFA could be in, one symbol at a time.
    // Optional predict mode: click the states you expect before each step.
    // config: { machines: [{ id, name, lang, machine, examples: [] }] }
    // ======================================================================
    const setStr = list => `{${list.map(sub).join(", ")}}`.replace("{}", "∅");

    W["nfa-runner"] = function (el, config, ctx) {
        const { icon, esc, buddy, progress, course } = ctx;
        let mi = 0, m, w = "", run, k = 0, timer = null, speed = 3;
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
                <div class="run-status" aria-live="polite"><span class="rs-av"></span><span class="rs-text"></span></div>
                <div class="run-controls">
                    <label class="input-w">w = <input type="text" inputmode="numeric" maxlength="12" spellcheck="false" autocomplete="off" aria-label="Input string"></label>
                    <div class="examples"></div>
                </div>
                <div class="player">
                    <button type="button" class="ctl" data-act="reset" title="Back to the start" aria-label="Back to the start">${icon("arrow-clockwise")}</button>
                    <button type="button" class="ctl" data-act="back" title="Step back (←)" aria-label="Step back">◀</button>
                    <button type="button" class="ctl play" data-act="play" title="Play" aria-label="Play">▶</button>
                    <button type="button" class="ctl" data-act="step" title="Step (→)" aria-label="Step forward">▶|</button>
                    <button type="button" class="btn primary" data-act="check" hidden>${icon("check")} Check my guess</button>
                    <label class="toggle"><input type="checkbox" data-act="predict"> Predict mode</label>
                    <label class="speed">Speed <input type="range" min="1" max="5" value="3" style="--fill: 50%" aria-label="Speed"></label>
                </div>
                <div class="run-side">
                    <div class="side-box">
                        <div class="side-title">Extended transition function</div>
                        <ol class="trace"></ol>
                    </div>
                    <div class="side-box">
                        <div class="side-title">Every possible run at once</div>
                        <div class="grid-wrap"><table class="threads"></table></div>
                        <p class="muted">A dot means the NFA could be in that state after that many symbols.</p>
                    </div>
                </div>
            </div>`;
        const $ = s => el.querySelector(s);
        const input = $(".input-w input");
        const svg = () => $(".diagram svg");

        function loadMachine(i) {
            mi = i; m = config.machines[i].machine;
            el.querySelectorAll(".pick").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
            $(".diagram").innerHTML = A.render(m, { label: "State diagram of the NFA" });
            svg().querySelectorAll(".st").forEach(g => { g.setAttribute("tabindex", "-1"); g.setAttribute("role", "button"); });
            $(".lang-a").hidden = true; $('[data-act="reveal"]').hidden = false;
            $(".lang-a").innerHTML = config.machines[i].lang;
            $(".examples").innerHTML = config.machines[i].examples.map(x => `<button type="button" class="ex" data-w="${esc(x)}">${esc(show(x))}</button>`).join("");
            setInput(config.machines[i].examples[0]);
        }
        function setInput(str) {
            stop();
            w = str.split("").filter(c => m.alphabet.includes(c)).join("");
            input.value = w;
            run = A.runNFA(m, w);
            k = 0; guess.clear(); checked = null; allRight = true;
            draw();
        }
        const done = () => k === w.length;
        const asking = () => predict && !done();

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
                g.classList.remove("guess-missed", "extra");
                if (checked) { g.classList.toggle("guess-missed", checked.missed.includes(q)); g.classList.toggle("extra", checked.extra.includes(q)); }
            });

            $(".tape").innerHTML = w.length
                ? w.split("").map((c, j) => `<span class="cell${j < k ? " read" : ""}${j === k ? " head" : ""}">${esc(c)}</span>`).join("") + `<span class="cell end${done() ? " head" : ""}" aria-hidden="true">⊣</span>`
                : `<span class="cell eps head">ε</span>`;

            let msg, mood = "idle";
            const ask = `<b>Your turn:</b> which states can the NFA be in after reading <b>${esc(w[k])}</b>? Click them on the diagram (remember the ε-arrows), then press <b>Check my guess</b>.`;
            if (asking() && !checked) {
                msg = k === 0 && cur.length > 1 ? `You start in E(${sub(m.start)}) = ${setStr(cur)}. ${ask}` : ask;
            } else if (checked) {
                mood = checked.ok ? "happy" : "oops";
                msg = checked.ok ? `<b>Exactly right!</b> After reading ${esc(w[k - 1])}, the NFA can be in ${setStr(cur)}.`
                    : `<b>Not quite.</b> The NFA can be in ${setStr(cur)}.${checked.missed.length ? ` You missed ${checked.missed.map(sub).join(", ")}.` : ""}${checked.extra.length ? ` It can’t reach ${checked.extra.map(sub).join(", ")}.` : ""}`;
                msg += done() ? endMsg() : `<br>${ask}`;
            } else if (k === 0) {
                const extra = cur.length > 1 ? ` Following ε-arrows from ${sub(m.start)} before reading anything gives ${setStr(cur)}.` : "";
                msg = `Start in ${sub(m.start)}.${extra}${done() ? endMsg() : " Press <b>Step</b> to read the first symbol."}`;
            } else {
                const viaEps = last.closed.length > last.moved.length;
                msg = `Read <b>${esc(last.sym)}</b>: from ${setStr(last.from)}, the ${esc(last.sym)}-arrows lead to ${setStr(last.moved)}.` +
                    (last.moved.length === 0 ? " No arrows, so every run dies here." : viaEps ? ` Following ε-arrows adds more: now ${setStr(last.closed)}.` : "");
                if (done()) msg += endMsg();
            }
            if (done()) mood = run.accepted ? "happy" : "oops";
            $(".rs-text").innerHTML = msg;
            $(".run-status").className = "run-status" + (done() ? (run.accepted ? " yes" : " no") : asking() ? " ask" : "");
            buddy.react($(".rs-av"), mood, "");

            $(".trace").innerHTML = Array.from({ length: k + 1 }, (_, j) =>
                `<li class="${j === k ? "now" : ""}">δ̂(${sub(m.start)}, ${esc(show(w.slice(0, j)))}) = ${setStr(run.sets[j])}</li>`).join("");

            const Q = Object.keys(m.states);
            $(".threads").innerHTML = `<thead><tr><th></th>${Array.from({ length: w.length + 1 }, (_, j) => `<th class="${j === k ? "now" : ""}">${j === 0 ? "start" : esc(w[j - 1])}</th>`).join("")}</tr></thead>
                <tbody>${Q.map(q => `<tr><th>${sub(q)}${m.accept.includes(q) ? "*" : ""}</th>${Array.from({ length: w.length + 1 }, (_, j) =>
                    `<td class="${j === k ? "now" : ""}">${j <= k && run.sets[j].includes(q) ? `<span class="dot${m.accept.includes(q) && j === w.length ? " acc" : ""}"></span>` : ""}</td>`).join("")}</tr>`).join("")}</tbody>`;

            $('[data-act="back"]').disabled = k === 0;
            $('[data-act="step"]').disabled = done() || asking();
            $('[data-act="play"]').disabled = predict;
            $('[data-act="check"]').hidden = !asking();
            const play = $('[data-act="play"]');
            play.textContent = timer ? "❚❚" : "▶";
        }
        function endMsg() {
            const hit = run.sets[k].filter(q => m.accept.includes(q));
            return run.accepted
                ? ` Done reading, and ${hit.map(sub).join(", ")} is an accept state, so at least one run accepts: M <b class="yes">accepts</b> ${esc(show(w))}.`
                : ` Done reading, and none of ${setStr(run.sets[k])} is an accept state, so every run fails: M <b class="no">rejects</b> ${esc(show(w))}.`;
        }

        function step(d) { checked = null; k = Math.max(0, Math.min(w.length, k + d)); draw(); if (done()) stop(); }
        function stop() { clearInterval(timer); timer = null; }
        function play() {
            if (timer) { stop(); draw(); return; }
            if (done()) k = 0;
            timer = setInterval(() => { if (done()) { stop(); draw(); } else step(1); }, 1700 / speed);
            draw();
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

        $(".diagram").addEventListener("click", e => {
            const g = e.target.closest(".st");
            if (!g || !asking()) return;
            const q = g.dataset.state;
            checked = null; // start the next guess; clears the last round's marks
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
        $('[data-act="reset"]').addEventListener("click", () => { stop(); k = 0; checked = null; guess.clear(); allRight = true; draw(); });
        $('[data-act="back"]').addEventListener("click", () => { stop(); step(-1); });
        $('[data-act="step"]').addEventListener("click", () => { stop(); step(1); });
        $('[data-act="play"]').addEventListener("click", play);
        $('[data-act="check"]').addEventListener("click", checkGuess);
        $('[data-act="predict"]').addEventListener("change", e => { predict = e.target.checked; stop(); k = 0; checked = null; guess.clear(); allRight = true; draw(); });
        $(".speed input").addEventListener("input", e => { speed = +e.target.value; if (timer) { stop(); play(); } });
        ctx.setKeyHandler(e => {
            if (!document.body.contains(el)) { stop(); return; }
            if (e.target.matches("input, textarea, select") || asking()) return;
            if (e.key === "ArrowRight") { stop(); step(1); }
            else if (e.key === "ArrowLeft") { stop(); step(-1); }
        });

        loadMachine(0);
    };

    // ======================================================================
    // Subset construction: build the DFA for an NFA one transition at a time.
    // config: { examples: [{ id, name, nfa }] }
    // ======================================================================
    W["subset-stepper"] = function (el, config, ctx) {
        const { icon, esc, buddy } = ctx;
        let ei = 0, m, sc, k = 0, timer = null, speed = 3;

        el.innerHTML = `
            <div class="subset">
                <div class="pick-row" role="group" aria-label="Choose an NFA">
                    ${config.examples.map((x, i) => `<button type="button" class="pick" data-e="${i}">${esc(x.name)}</button>`).join("")}
                </div>
                <div class="two-up">
                    <div><div class="panel-label">The NFA</div><div class="diagram nfa"></div></div>
                    <div><div class="panel-label">The DFA so far</div><div class="diagram dfa"></div></div>
                </div>
                <div class="run-status" aria-live="polite"><span class="rs-av"></span><span class="rs-text"></span></div>
                <div class="player">
                    <button type="button" class="ctl" data-act="reset" title="Start over" aria-label="Start over">${icon("arrow-clockwise")}</button>
                    <button type="button" class="ctl" data-act="back" title="Step back (←)" aria-label="Step back">◀</button>
                    <button type="button" class="ctl play" data-act="play" title="Play" aria-label="Play">▶</button>
                    <button type="button" class="ctl" data-act="step" title="Step (→)" aria-label="Step forward">▶|</button>
                    <span class="step-no" aria-label="Step number"></span>
                    <label class="speed">Speed <input type="range" min="1" max="5" value="3" style="--fill: 50%" aria-label="Speed"></label>
                </div>
                <div class="table-wrap"><table class="delta subset-table"></table></div>
            </div>`;
        const $ = s => el.querySelector(s);

        function load(i) {
            ei = i; m = config.examples[i].nfa; sc = A.subsetConstruction(m); k = 0; stop();
            el.querySelectorAll(".pick").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
            $(".diagram.nfa").innerHTML = A.render(m, { label: "The NFA" });
            draw();
        }
        // The DFA after the first k steps.
        function snapshot() {
            const done = sc.steps.slice(0, k);
            const names = [], delta = {};
            done.forEach(s => {
                if (s.kind === "start") names.push(s.name);
                if (s.kind === "edge") {
                    if (s.isNew) names.push(s.to);
                    (delta[s.from] = delta[s.from] || {})[s.sym] = s.to;
                }
            });
            const fin = done.some(s => s.kind === "accept");
            return { names, delta, accept: fin ? sc.accept : [], fin };
        }
        const setOf = name => sc.dstates.find(d => d.name === name).set;

        function draw() {
            const snap = snapshot(), cur = sc.steps[k - 1];
            if (snap.names.length) {
                const dm = { states: A.layout(snap.names), start: "A", accept: snap.accept, alphabet: m.alphabet, delta: snap.delta };
                $(".diagram.dfa").innerHTML = A.render(dm, { label: "The DFA built so far" });
                const dsvg = $(".diagram.dfa svg");
                if (cur && cur.kind === "start") A.highlight(dsvg, { states: ["A"] });
                if (cur && cur.kind === "edge") A.highlight(dsvg, { states: [cur.to], edge: { from: cur.from, to: cur.to } });
                if (cur && cur.kind === "accept") A.highlight(dsvg, { states: sc.accept, result: "accept" });
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

            let msg;
            if (!cur) msg = "Each DFA state stands for a <b>set</b> of NFA states: everywhere the NFA could be. Press <b>Step</b> to build the DFA one transition at a time.";
            else if (cur.kind === "start") msg = `The DFA starts in <b>E({${sub(m.start)}}) = ${setStr(cur.set)}</b>: every state the NFA can reach before reading anything. Call it <b>A</b>.`;
            else if (cur.kind === "edge") {
                const target = cur.set.length === 0 ? "∅" : setStr(cur.set);
                msg = `From <b>${cur.from} = ${setStr(cur.fromSet)}</b> on <b>${esc(cur.sym)}</b>: the ${esc(cur.sym)}-arrows lead to ${setStr(cur.moved)}` +
                    (cur.set.length > cur.moved.length ? `, and ε-arrows add more: ${target}.` : ".") +
                    (cur.set.length === 0 ? " Nothing is reachable, so this is the <b>dead state ∅</b>." : "") +
                    (cur.isNew ? ` That set is new, so it becomes state <b>${cur.to}</b>.` : ` That’s state <b>${cur.to}</b>, which we already have.`);
            } else {
                msg = `Last step: a DFA state accepts if its set contains an NFA accept state (${m.accept.map(sub).join(", ")}). So the accept states are <b>${sc.accept.join(", ") || "none"}</b>. Done: ${sc.dstates.length} DFA states, out of 2<sup>${Object.keys(m.states).length}</sup> = ${2 ** Object.keys(m.states).length} possible subsets.`;
            }
            $(".rs-text").innerHTML = msg;
            $(".step-no").textContent = `Step ${k} of ${sc.steps.length}`;
            // Buddy: cheers at the end, perks up at each new state, and frowns at the dead state.
            const mood = !cur ? "idle" : cur.kind === "accept" ? "cheer" : cur.kind === "edge" && cur.set.length === 0 ? "oops" : cur.kind === "edge" && cur.isNew ? "happy" : "idle";
            buddy.react($(".rs-av"), mood, mood === "cheer" ? "party" : mood === "happy" ? "bounce" : mood === "oops" ? "wobble" : "");
            $(".run-status").className = "run-status" + (cur && cur.kind === "accept" ? " yes" : "");

            $(".subset-table").innerHTML = `<thead><tr><th>DFA state</th><th>NFA states</th>${m.alphabet.map(a => `<th>on ${esc(a)}</th>`).join("")}</tr></thead>
                <tbody>${snap.names.map(n => `<tr class="${cur && cur.kind === "edge" && cur.to === n && cur.isNew ? "new" : ""}">
                    <th>${n === "A" ? "→" : ""}${n}${snap.fin && sc.accept.includes(n) ? "*" : ""}</th>
                    <td class="set">${setStr(setOf(n))}</td>
                    ${m.alphabet.map(a => `<td class="${cur && cur.kind === "edge" && cur.from === n && cur.sym === a ? "now" : ""}">${(snap.delta[n] || {})[a] || ""}</td>`).join("")}
                </tr>`).join("") || `<tr><td colspan="${m.alphabet.length + 2}" class="muted">No states yet.</td></tr>`}</tbody>`;

            $('[data-act="back"]').disabled = k === 0;
            $('[data-act="step"]').disabled = k === sc.steps.length;
            $('[data-act="play"]').textContent = timer ? "❚❚" : "▶";
        }
        function step(d) { k = Math.max(0, Math.min(sc.steps.length, k + d)); draw(); if (k === sc.steps.length) stop(); }
        function stop() { clearInterval(timer); timer = null; }
        function play() {
            if (timer) { stop(); draw(); return; }
            if (k === sc.steps.length) k = 0;
            timer = setInterval(() => { if (k === sc.steps.length) { stop(); draw(); } else step(1); }, 4000 / speed);
            draw();
        }
        el.querySelector(".pick-row").addEventListener("click", e => { const b = e.target.closest("[data-e]"); if (b) load(+b.dataset.e); });
        $('[data-act="reset"]').addEventListener("click", () => { stop(); k = 0; draw(); });
        $('[data-act="back"]').addEventListener("click", () => { stop(); step(-1); });
        $('[data-act="step"]').addEventListener("click", () => { stop(); step(1); });
        $('[data-act="play"]').addEventListener("click", play);
        $(".speed input").addEventListener("input", e => { speed = +e.target.value; if (timer) { stop(); play(); } });
        ctx.setKeyHandler(e => {
            if (!document.body.contains(el)) { stop(); return; }
            if (e.target.matches("input, textarea, select")) return;
            if (e.key === "ArrowRight") { stop(); step(1); }
            else if (e.key === "ArrowLeft") { stop(); step(-1); }
        });
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
