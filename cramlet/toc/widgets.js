// Theory of Computation playground widgets. Each registers in CRAMLET.widgets and is mounted by
// ../course/app.js as widget(el, config, ctx), where ctx has { course, concept, icon, esc, buddy, progress, celebrate, setKeyHandler }.
(function () {
    "use strict";

    const A = CRAMLET.automata;
    const W = CRAMLET.widgets || (CRAMLET.widgets = {});
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
                    <label class="speed">Speed <input type="range" min="1" max="5" value="3" aria-label="Speed"></label>
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
