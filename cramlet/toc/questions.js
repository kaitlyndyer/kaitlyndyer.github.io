// Theory of Computation question types for practice exams, plugged into the shared exam engine (course/exam.js).
//
//   dfa  Build a DFA by filling in its transition table; the diagram draws itself. There's no string tester,
//        like on paper (the lesson playgrounds have one).
//        { q, alphabet?: ["0", "1"], maxStates?: 6, explain,
//          answer: { start, accept: [...], delta: { q0: { 0: "q1", 1: "q0" }, ... }, meaning?: { q0: "what q0 remembers" } } }
//        Grading, like a human grader: 3 points for exactly the right language (any correct DFA, any layout).
//        Otherwise partial credit goes by how many changes (one arrow, or one accept state) would make it right,
//        allowing any renaming of states: 1 change = 2 points, 2 changes = 1 point. A DFA with a different number
//        of states can't be compared that way, so it can also earn 2 or 1 points by being wrong on under 5% or 25% of
//        the strings up to a fixed length, counted separately for strings in and not in the language (so
//        "reject everything" earns nothing). It gets the better of the two.
//        Arrows left blank go to a trap state that rejects, the way most courses let you leave the trap out.
(function () {
    "use strict";

    const A = CRAMLET.automata;
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const sub = name => { const m = /^([A-Za-z]+)(\d+)$/.exec(name); return m ? `${esc(m[1])}<sub>${m[2]}</sub>` : esc(name); };
    const show = w => (w === "" ? "ε" : w);
    const icon = (name, cls) => (CRAMLET.icon ? CRAMLET.icon(name, cls) : "");

    const POINTS = 3, MAX_STRINGS = 2047;
    const sigmaOf = q => q.alphabet || ["0", "1"];
    // The longest length checked, so the count stays near 2,000 strings whatever the alphabet (length 10 for {0, 1}).
    const checkLen = k => { let n = 0, total = 1, layer = 1; while (total + layer * k <= MAX_STRINGS) { layer *= k; total += layer; n++; } return n; };

    // ---------- Machines ----------
    // The student's answer: a = { n, d: [[target index or null, per symbol], ...], acc: [true|false, ...] }.
    const names = n => Array.from({ length: n }, (_, i) => "q" + i);
    function mine(q, a) {
        const S = sigmaOf(q), Q = names(a.n);
        return {
            states: A.layout(Q), start: "q0", alphabet: S,
            accept: Q.filter((_, i) => a.acc[i]),
            delta: Object.fromEntries(Q.map((s, i) => [s, Object.fromEntries(S.map((c, k) => [c, a.d[i][k]]).filter(([, t]) => t !== null && t !== undefined).map(([c, t]) => [c, "q" + t]))])),
        };
    }
    function right(q) {
        const M = q.answer, Q = Object.keys(M.delta);
        return { states: M.states || A.layout(Q), start: M.start || Q[0], accept: M.accept, alphabet: sigmaOf(q), delta: M.delta, curves: M.curves };
    }
    const blank = q => ({ n: 2, d: [0, 1].map(() => sigmaOf(q).map(() => null)), acc: [false, false] });
    const missingOf = (q, a) => { const out = []; a.d.forEach((row, i) => row.forEach((t, k) => { if (t === null || t === undefined) out.push(["q" + i, sigmaOf(q)[k]]); })); return out; };

    // One step, where null is the trap state (it never accepts and never leaves).
    const step = (m, s, c) => (s === null ? null : ((m.delta[s] || {})[c] || null));
    const acc = (m, s) => s !== null && m.accept.includes(s);

    // ---------- How many changes from a right answer ----------
    // Machines as index tables: { n, d: [[target or null, per symbol], ...], acc: [...] }, start state 0.
    const studentTable = a => ({ n: a.n, d: a.d.map(r => r.slice()), acc: a.acc.slice() });
    function answerTable(q) {
        const M = q.answer, S = sigmaOf(q), Q = Object.keys(M.delta), start = M.start || Q[0];
        const order = [start, ...Q.filter(x => x !== start)], at = x => (x ? order.indexOf(x) : null);
        return { n: order.length, d: order.map(x => S.map(c => at(M.delta[x][c]))), acc: order.map(x => M.accept.includes(x)) };
    }
    // Blank arrows go to one added trap state.
    function complete(m) {
        if (!m.d.some(r => r.some(t => t === null))) return m;
        const T = m.n;
        return { n: m.n + 1, d: m.d.map(r => r.map(t => (t === null ? T : t))).concat([m.d[0].map(() => T)]), acc: m.acc.concat(false), trap: T };
    }
    // Drop unreachable states and merge states that act alike (Moore's algorithm). State 0 stays the start.
    function minimize(m) {
        const order = [0];
        for (let i = 0; i < order.length; i++) m.d[order[i]].forEach(t => { if (!order.includes(t)) order.push(t); });
        let cls = Object.fromEntries(order.map(i => [i, m.acc[i] ? 1 : 0])), count = 0;
        for (;;) {
            const ids = new Map(), next = {};
            order.forEach(i => { const sig = cls[i] + "|" + m.d[i].map(t => cls[t]).join(","); if (!ids.has(sig)) ids.set(sig, ids.size); next[i] = ids.get(sig); });
            cls = next;
            if (ids.size === count) break;
            count = ids.size;
        }
        const rep = []; order.forEach(i => { if (rep[cls[i]] === undefined) rep[cls[i]] = i; });
        return { n: count, d: rep.map(i => m.d[i].map(t => cls[t])), acc: rep.map(i => m.acc[i]) };
    }
    // The fewest changes that turn x into y, trying every renaming of x's states that keeps the start state.
    // Only for machines with the same number of states. Returns the list of changes, in x's names.
    function changes(x, y) {
        if (x.n !== y.n || x.n > 8) return null;
        let best = null;
        const p = [0], used = new Set([0]);
        const tally = () => {
            const inv = []; p.forEach((v, i) => { inv[v] = i; });
            const out = [];
            for (let i = 0; i < x.n && (!best || out.length < best.length); i++) {
                if (x.acc[i] !== y.acc[p[i]]) out.push({ state: i, accept: y.acc[p[i]] });
                x.d[i].forEach((t, k) => { const want = y.d[p[i]][k]; if (t === null || p[t] !== want) out.push({ state: i, k, from: t, to: inv[want] }); });
            }
            if (!best || out.length < best.length) best = out;
        };
        const go = () => {
            if (p.length === x.n) return tally();
            for (let v = 1; v < x.n; v++) if (!used.has(v)) { used.add(v); p.push(v); go(); p.pop(); used.delete(v); if (best && !best.length) return; }
        };
        go();
        return best;
    }

    // Run both machines side by side. The first breadth-first difference is the shortest string they disagree on;
    // none at all means they recognize exactly the same language. Counting paths per length gives how often
    // they disagree on strings up to length L, kept separately for strings in and not in the language.
    function compare(q, a) {
        const S = sigmaOf(q), M = mine(q, a), R = right(q), L = checkLen(S.length);
        const key = (x, y) => `${x}|${y}`;
        let first = null;
        const seen = new Set([key(M.start, R.start)]), queue = [[M.start, R.start, ""]];
        while (queue.length) {
            const [x, y, w] = queue.shift();
            if (acc(M, x) !== acc(R, y)) { first = w; break; }
            S.forEach(c => { const nx = step(M, x, c), ny = step(R, y, c), k = key(nx, ny); if (!seen.has(k)) { seen.add(k); queue.push([nx, ny, w + c]); } });
        }
        let layer = new Map([[key(M.start, R.start), [M.start, R.start, 1]]]), total = 0, inL = 0, missed = 0, extra = 0;
        for (let n = 0; n <= L; n++) {
            const next = new Map();
            layer.forEach(([x, y, cnt]) => {
                total += cnt;
                if (acc(R, y)) { inL += cnt; if (!acc(M, x)) missed += cnt; } else if (acc(M, x)) extra += cnt;
                if (n < L) S.forEach(c => { const nx = step(M, x, c), ny = step(R, y, c), k = key(nx, ny), e = next.get(k); if (e) e[2] += cnt; else next.set(k, [nx, ny, cnt]); });
            });
            layer = next;
        }
        const outL = total - inL, share = Math.max(inL ? missed / inL : 0, outL ? extra / outL : 0);
        // Fewest changes to a right answer: the DFA as drawn, with its trap filled in, or with merged states.
        let fixes = null;
        if (first !== null) {
            const target = minimize(complete(answerTable(q))), raw = studentTable(a), full = complete(raw);
            [changes(raw, target), changes(full, target), changes(minimize(full), target)].forEach((c, i) => {
                if (c && (!fixes || c.length < fixes.list.length)) fixes = { list: c, named: i < 2, trap: i === 1 ? full.trap : undefined };
            });
        }
        const byFix = fixes ? (fixes.list.length === 1 ? 2 : fixes.list.length === 2 ? 1 : 0) : 0;
        const byStrings = share < 0.05 ? 2 : share < 0.25 ? 1 : 0;
        const pts = first === null ? POINTS : Math.max(byFix, byStrings);
        return { M, R, first, total, inL, outL, missed, extra, share, pts, L, fixes, missing: missingOf(q, a).length };
    }

    // The states a machine passes through reading w (null = the trap).
    const path = (m, w) => { const out = [m.start]; for (const c of w) out.push(step(m, out[out.length - 1], c)); return out; };

    // ---------- Pieces shared by the question and the results ----------
    const sigmaText = q => `Σ = {${sigmaOf(q).join(", ")}}`;
    const meaningList = q => {
        const m = q.answer.meaning;
        return m ? `<ul class="dq-meaning">${Object.entries(m).map(([s, t]) => `<li><span class="dq-st">${sub(s)}</span> ${t}</li>`).join("")}</ul>` : "";
    };
    const answerPanel = q => `<div class="diagram">${A.render(right(q), { label: "A correct DFA" })}</div>${meaningList(q)}`;
    const traceHTML = (w, states, at) => states.map((s, k) => `${k ? `<span class="dq-arrow">${esc(w[k - 1])}→</span>` : ""}<span class="dq-chip${k === at ? " on" : ""}${s === null ? " trap" : ""}">${s === null ? "trap" : sub(s)}</span>`).join("");

    // ---------- Answering ----------
    function draw(q, a) {
        return `<div class="dq" style="--c: var(--brand)">
            <p class="dq-meta">${sigmaText(q)}. Your start state is q<sub>0</sub>. An arrow left as — goes to a trap state that rejects.</p>
            <div class="build-grid">
                <div class="build-table">
                    <div class="count-row">
                        <span>States</span>
                        <button type="button" class="ctl small" data-dq="less" aria-label="Remove the last state">−</button>
                        <b class="count"></b>
                        <button type="button" class="ctl small" data-dq="more" aria-label="Add a state">+</button>
                        <button type="button" class="btn ghost small dq-reset" data-dq="reset">${icon("arrow-clockwise")} Start over</button>
                    </div>
                    <table class="delta edit"></table>
                    <p class="muted">Pick where each state goes on each symbol, and tick the accept states.</p>
                </div>
                <div class="diagram"></div>
            </div>
            <div class="dq-checks" aria-live="polite"></div>
        </div>`;
    }

    function mount(el, q, saved, save) {
        if (!el) return;
        const S = sigmaOf(q), MAX = q.maxStates || 6;
        let a = saved && saved.n ? JSON.parse(JSON.stringify(saved)) : blank(q);
        const $ = s => el.querySelector(s);
        const commit = () => save({ n: a.n, d: a.d, acc: a.acc, touched: true });

        function drawTable() {
            $(".count").textContent = a.n;
            $('[data-dq="less"]').disabled = a.n <= 1;
            $('[data-dq="more"]').disabled = a.n >= MAX;
            const opts = sel => `<option value=""${sel === null || sel === undefined ? " selected" : ""}>—</option>` + names(a.n).map((s, j) => `<option value="${j}"${j === sel ? " selected" : ""}>q${j}</option>`).join("");
            $(".delta.edit").innerHTML = `<thead><tr><th>State</th>${S.map(c => `<th>on ${esc(c)}</th>`).join("")}<th>Accept?</th></tr></thead><tbody>${
                names(a.n).map((s, i) => `<tr>
                    <th>${i === 0 ? "→ " : ""}${sub(s)}</th>
                    ${S.map((c, k) => `<td><select class="${a.d[i][k] === null ? "missing" : ""}" data-i="${i}" data-k="${k}" aria-label="δ(q${i}, ${esc(c)})">${opts(a.d[i][k])}</select></td>`).join("")}
                    <td><input type="checkbox" data-acc="${i}" ${a.acc[i] ? "checked" : ""} aria-label="q${i} is an accept state"></td>
                </tr>`).join("")}</tbody>`;
        }
        function drawRest() {
            $(".diagram").innerHTML = A.render(mine(q, a), { label: "Your DFA" });
            const miss = missingOf(q, a);
            const chips = [];
            if (!a.acc.some(Boolean)) chips.push(["warn", "No accept states yet, so it rejects everything"]);
            if (miss.length) chips.push(["warn", miss.length <= 3 ? miss.map(([s, c]) => `${sub(s)} has no arrow on ${esc(c)}`).join(" · ") : `${miss.length} arrows left blank (they go to the trap)`]);
            else chips.push(["ok", `Every state has one arrow for each symbol`]);
            $(".dq-checks").innerHTML = chips.map(([k, t]) => `<span class="dq-chk ${k}">${icon(k === "ok" ? "check-circle" : "warning")} ${t}</span>`).join("");
        }

        el.addEventListener("change", e => {
            const t = e.target;
            if (t.dataset.acc !== undefined) a.acc[+t.dataset.acc] = t.checked;
            else if (t.dataset.i !== undefined) { a.d[+t.dataset.i][+t.dataset.k] = t.value === "" ? null : +t.value; t.classList.toggle("missing", t.value === ""); }
            else return;
            commit(); drawRest();
        });
        el.addEventListener("click", e => {
            const b = e.target.closest("[data-dq]");
            if (!b) return;
            if (b.dataset.dq === "more" && a.n < MAX) { a.n++; a.d.push(S.map(() => null)); a.acc.push(false); }
            else if (b.dataset.dq === "less" && a.n > 1) { a.n--; a.d.pop(); a.acc.pop(); a.d = a.d.map(r => r.map(t => (t !== null && t >= a.n ? null : t))); }
            else if (b.dataset.dq === "reset") a = blank(q);
            else return;
            commit(); drawTable(); drawRest();
        });
        drawTable(); drawRest();
    }

    // ---------- Results ----------
    function review(q, a) {
        if (!a || !a.touched) return `<div class="dq-review"><p><i>No answer.</i></p><div class="side-title">One right answer</div>${answerPanel(q)}${rubric(null, checkLen(sigmaOf(q).length))}</div>`;
        const g = compare(q, a), w = g.first;
        const head = g.pts === POINTS ? "Right language!" : g.pts === 2 ? "So close." : g.pts === 1 ? "Partly there." : "Not this language yet.";
        let ce = "";
        if (w !== null) {
            const yes = acc(g.M, path(g.M, w).pop());
            ce = `<div class="dq-ce">
                <div class="side-title">The shortest string it gets wrong</div>
                <div class="dq-row"><span class="dq-str">${esc(show(w))}</span>
                    <span>Your DFA <span class="dq-res ${yes ? "yes" : "no"}">${yes ? "accepts" : "rejects"}</span> it, but it should <span class="dq-res ${yes ? "no" : "yes"}">${yes ? "reject" : "accept"}</span>.</span>
                    <button type="button" class="btn small" data-dq="replay">${icon("play")} Watch your DFA read it</button></div>
                <div class="dq-trace">${traceHTML(w, path(g.M, w), -1)}</div>
            </div>`;
        }
        return `<div class="dq-review">
            <p class="dq-head"><b>${head}</b> ${w === null ? "It accepts exactly the strings in the language." : `Checked on every string up to length ${g.L}: it ${g.missed ? `misses <b>${g.missed.toLocaleString()}</b> of the ${g.inL.toLocaleString()} strings it should accept` : "accepts every string it should"}${g.extra ? ` and wrongly accepts <b>${g.extra.toLocaleString()}</b> of the ${g.outL.toLocaleString()} it should reject` : g.missed ? ", and never accepts one it should reject" : ", and rejects every one it should"}.`}
                ${g.missing ? `<span class="muted">${g.missing} blank arrow${g.missing > 1 ? "s were" : " was"} treated as going to a trap state, which rejects.</span>` : ""}</p>
            ${fixList(q, g)}
            ${ce}
            <div class="dq-side">
                <div><div class="side-title">Your DFA</div><div class="diagram dq-mine">${A.render(g.M, { label: "Your DFA" })}</div></div>
                <div><div class="side-title">One right answer</div>${answerPanel(q)}</div>
            </div>
            ${rubric(g.pts, g.L)}
        </div>`;
    }
    // The changes that would make it right, in the student's own state names (when the DFA can be compared that way).
    function fixList(q, g) {
        const f = g.fixes;
        if (!f || !f.list.length || f.list.length > 2) return "";
        const S = sigmaOf(q), nm = i => (i === f.trap ? "the trap your blank arrows go to" : sub("q" + i));
        const text = c => (c.k === undefined ? (c.state === f.trap ? `The trap your blank arrows go to should be a real accept state that loops on every symbol.` : `${nm(c.state)} should ${c.accept ? "" : "<b>not</b> "}be an accept state.`)
            : c.to === undefined ? `${nm(c.state)} on ${esc(S[c.k])} should go to a new state that your DFA doesn’t have yet.`
            : `${nm(c.state)} on ${esc(S[c.k])} should go to ${nm(c.to)}${c.from === null ? " (it’s blank)" : `, not ${nm(c.from)}`}.`);
        if (!f.named) return `<p class="dq-fixes">${f.list.length === 1 ? "One change" : "Two changes"} from a right answer, once states that act the same are merged.</p>`;
        return `<div class="dq-fixes"><div class="side-title">${f.list.length === 1 ? "One change" : "Two changes"} from a right answer</div><ul>${f.list.map(c => `<li>${text(c)}</li>`).join("")}</ul></div>`;
    }
    const rubric = (pts, L) => `<details class="dq-rubric"><summary>How build questions are graded</summary><ul>
        <li class="${pts === 3 ? "on" : ""}">3 points: recognizes exactly the right language.</li>
        <li class="${pts === 2 ? "on" : ""}">2 points: one change from a right answer (one arrow or one accept state), or wrong on fewer than 5% of the strings up to length ${L}.</li>
        <li class="${pts === 1 ? "on" : ""}">1 point: two changes from a right answer, or wrong on fewer than 25% of those strings.</li>
        <li class="${pts === 0 ? "on" : ""}">0 points: further off than that.</li></ul>
        <p class="muted">Any correct DFA gets full points, even one with extra states or a different layout. Blank arrows go to a trap state. “Wrong on” is counted separately for strings it should accept and strings it should reject, so rejecting everything earns nothing. Anything under 3 points goes in your Missed deck so you build it again.</p></details>`;

    function mountReview(el, q, a) {
        const btn = el.querySelector('[data-dq="replay"]');
        if (!btn) return;
        const g = compare(q, a), w = g.first, states = path(g.M, w);
        const svg = el.querySelector(".dq-mine svg"), tr = el.querySelector(".dq-trace");
        let timer = null;
        btn.addEventListener("click", () => {
            clearInterval(timer);
            let k = 0;
            const show1 = () => {
                const s = states[k], last = k === states.length - 1;
                tr.innerHTML = traceHTML(w, states, k);
                A.highlight(svg, { states: s ? [s] : [], edge: k && states[k - 1] && s ? { from: states[k - 1], to: s } : null, result: last ? (acc(g.M, s) ? "accept" : "reject") : null });
            };
            show1();
            timer = setInterval(() => { if (k >= states.length - 1) { clearInterval(timer); return; } k++; show1(); }, 650);
        });
    }

    window.registerQuestionType("dfa", {
        section: { id: "build", name: "Build a DFA" },
        how: "Picture the DFA you’d build",
        points: () => POINTS,
        answered: a => !!a.touched,
        brief: (q, a) => (a.touched ? `${a.n} state${a.n > 1 ? "s" : ""}${missingOf(q, a).length ? ` · ${missingOf(q, a).length} blank arrow${missingOf(q, a).length > 1 ? "s" : ""}` : ""}` : ""),
        grade: (q, a) => ({ earned: a.touched ? compare(q, a).pts : 0 }),
        draw, mount, review, mountReview,
        answer: q => answerPanel(q),
    });
})();
