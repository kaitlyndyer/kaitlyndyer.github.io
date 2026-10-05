// cramlet automata: draw finite automata as SVG and run strings through them.
// Shared by the Theory of Computation widgets (DFA runner, DFA builder, and later NFAs).
//
// A machine looks like:
//   {
//     states: { q0: [x, y], q1: [x, y, { loop: 90 }] },   // position; loop = angle (deg) for a self-loop, default up
//     start: "q0", accept: ["q1"], alphabet: ["0", "1"],
//     delta: { q0: { 0: "q0", 1: "q1" }, q1: { 0: "q0", 1: "q1" } },
//   }
(function () {
    "use strict";

    const R = 24;          // state radius
    let uid = 0;           // keeps marker ids unique when several diagrams share a page

    // ---------- Running ----------

    // Every step of running a DFA on w: [{ state, i, sym, next }], plus where it ended.
    function runDFA(m, w) {
        const steps = [];
        let q = m.start;
        for (let i = 0; i < w.length; i++) {
            const next = (m.delta[q] || {})[w[i]];
            steps.push({ state: q, i, sym: w[i], next: next || null });
            if (!next) return { steps, end: null, accepted: false, stuck: true };
            q = next;
        }
        return { steps, end: q, accepted: m.accept.includes(q), stuck: false };
    }
    const accepts = (m, w) => runDFA(m, w).accepted;

    // ---------- NFAs: delta values are lists of states, and "ε" is a symbol ----------

    const targets = (m, q, a) => [].concat((m.delta[q] || {})[a] || []);
    const sortStates = (m, set) => Object.keys(m.states).filter(q => set.has(q));

    // ε-closure E(P): everything reachable from P using only ε-arrows (including P itself).
    function eclose(m, states) {
        const seen = new Set(states), todo = [...states];
        while (todo.length) targets(m, todo.pop(), "ε").forEach(r => { if (!seen.has(r)) { seen.add(r); todo.push(r); } });
        return sortStates(m, seen);
    }
    // States reachable from P by reading a, before taking the ε-closure.
    function move(m, states, a) {
        const out = new Set();
        states.forEach(q => targets(m, q, a).forEach(r => out.add(r)));
        return sortStates(m, out);
    }

    // Run an NFA the efficient way: keep the set of every state you could be in.
    // sets[j] = δ̂(q_start, first j symbols). Each step also lists the arrows used.
    function runNFA(m, w) {
        const sets = [eclose(m, [m.start])], steps = [];
        for (let i = 0; i < w.length; i++) {
            const from = sets[i], moved = move(m, from, w[i]), closed = eclose(m, moved);
            const edges = [];
            from.forEach(q => targets(m, q, w[i]).forEach(r => edges.push({ from: q, to: r })));
            closed.forEach(q => targets(m, q, "ε").forEach(r => { if (closed.includes(r)) edges.push({ from: q, to: r, eps: true }); }));
            steps.push({ i, sym: w[i], from, moved, closed, edges });
            sets.push(closed);
        }
        const last = sets[sets.length - 1];
        return { sets, steps, accepted: last.some(q => m.accept.includes(q)) };
    }
    const acceptsNFA = (m, w) => runNFA(m, w).accepted;

    // Subset construction, recorded one (DFA state, symbol) at a time so it can be animated.
    // DFA states get letter names A, B, C, … in the order they're discovered.
    function subsetConstruction(m) {
        const key = set => set.join(",");
        const start = eclose(m, [m.start]);
        const dstates = [{ name: "A", set: start }];
        const byKey = { [key(start)]: "A" };
        const delta = {};
        const steps = [{ kind: "start", set: start, name: "A" }];
        for (let i = 0; i < dstates.length; i++) {
            const S = dstates[i];
            delta[S.name] = {};
            m.alphabet.forEach(a => {
                const moved = move(m, S.set, a), T = eclose(m, moved), k = key(T);
                const isNew = !(k in byKey);
                if (isNew) {
                    byKey[k] = String.fromCharCode(65 + dstates.length);
                    dstates.push({ name: byKey[k], set: T });
                }
                delta[S.name][a] = byKey[k];
                steps.push({ kind: "edge", from: S.name, fromSet: S.set, sym: a, moved, set: T, to: byKey[k], isNew });
            });
        }
        const accept = dstates.filter(d => d.set.some(q => m.accept.includes(q))).map(d => d.name);
        steps.push({ kind: "accept", accept });
        return { dstates, delta, accept, steps };
    }

    // All strings over the alphabet, shortest first, up to maxLen (includes the empty string).
    function* strings(alphabet, maxLen) {
        let level = [""];
        for (let n = 0; n <= maxLen; n++) {
            yield* level;
            level = level.flatMap(s => alphabet.map(a => s + a));
        }
    }

    // ---------- Drawing ----------

    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const f = n => n.toFixed(1);

    // "q12" -> q with a subscript 12
    function stateLabel(name) {
        const m = /^([A-Za-z]+)(\d+)$/.exec(name);
        return m ? `${esc(m[1])}<tspan class="sub" dy="4">${m[2]}</tspan>` : esc(name);
    }

    // Group transitions into one arrow per (from, to) pair with all its symbols: "0,1".
    function edgesOf(m) {
        const map = new Map();
        Object.entries(m.delta).forEach(([from, row]) => Object.entries(row).forEach(([sym, to]) => {
            [].concat(to).forEach(t => {
                const k = from + "\u0000" + t;
                if (!map.has(k)) map.set(k, { from, to: t, syms: [] });
                map.get(k).syms.push(sym);
            });
        }));
        const order = m.alphabet.concat("ε");
        return [...map.values()].map(e => ({ ...e, syms: e.syms.sort((a, b) => order.indexOf(a) - order.indexOf(b)) }));
    }

    function render(m, opts = {}) {
        const id = "am" + (++uid);
        const pos = name => m.states[name];
        const edges = edgesOf(m);
        const has = (a, b) => edges.some(e => e.from === a && e.to === b);
        // Everything drawn adds points here, so the viewBox fits loops, curves and labels.
        const pts = [];
        const box = (x, y, r) => pts.push([x - r, y - r], [x + r, y + r]);
        Object.values(m.states).forEach(([x, y]) => box(x, y, R + 3));

        // Pass 1: the shape of every arrow. pointAt(t) gives a point on it and the normal there.
        const shapes = edges.map(e => {
            const [ax, ay] = pos(e.from), [bx, by] = pos(e.to);
            const text = e.syms.join(",");
            if (e.from === e.to) {
                // self-loop on the side given by the state's loop angle (default: straight up)
                const ang = ((pos(e.from)[2] || {}).loop ?? -90) * Math.PI / 180, spread = .5;
                const p1 = [ax + R * Math.cos(ang - spread), ay + R * Math.sin(ang - spread)];
                const p2 = [ax + R * Math.cos(ang + spread), ay + R * Math.sin(ang + spread)];
                const c1 = [ax + R * 2.9 * Math.cos(ang - .55), ay + R * 2.9 * Math.sin(ang - .55)];
                const c2 = [ax + R * 2.9 * Math.cos(ang + .55), ay + R * 2.9 * Math.sin(ang + .55)];
                const at = t => { const u = 1 - t; return [0, 1].map(k => u * u * u * p1[k] + 3 * u * u * t * c1[k] + 3 * u * t * t * c2[k] + t * t * t * p2[k]); };
                box(ax + R * 2.3 * Math.cos(ang), ay + R * 2.3 * Math.sin(ang), 14);
                return { e, text, kind: "loop", ang, a: [ax, ay], at,
                    d: `M${f(p1[0])} ${f(p1[1])} C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}` };
            }
            const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
            if (has(e.to, e.from)) {
                // two-way: bend each arrow to its own side so they don't overlap
                const t0 = .42, bend = Math.min(46, len * .22);
                const s0 = [ax + R * (ux * Math.cos(t0) + nx * Math.sin(t0)), ay + R * (uy * Math.cos(t0) + ny * Math.sin(t0))];
                const en = [bx + R * (-ux * Math.cos(t0) + nx * Math.sin(t0)), by + R * (-uy * Math.cos(t0) + ny * Math.sin(t0))];
                const c = [(ax + bx) / 2 + nx * bend * 2, (ay + by) / 2 + ny * bend * 2];
                const at = t => { const u = 1 - t; return [0, 1].map(k => u * u * s0[k] + 2 * u * t * c[k] + t * t * en[k]); };
                box(...at(.5), 4);
                return { e, text, kind: "curve", at, n: [nx, ny], d: `M${f(s0[0])} ${f(s0[1])} Q${f(c[0])} ${f(c[1])} ${f(en[0])} ${f(en[1])}` };
            }
            const s0 = [ax + ux * R, ay + uy * R], en = [bx - ux * R, by - uy * R];
            const at = t => [s0[0] + (en[0] - s0[0]) * t, s0[1] + (en[1] - s0[1]) * t];
            return { e, text, kind: "line", at, n: [nx, ny], d: `M${f(s0[0])} ${f(s0[1])} L${f(en[0])} ${f(en[1])}` };
        });

        // Pass 2: place labels so none of them touch another label, a state, or someone else's arrow.
        const samples = shapes.map(sh => Array.from({ length: 25 }, (_, i) => sh.at(i / 24)));
        const placed = [];
        const halfW = text => 3 + 4.8 * text.length, HALF_H = 9;
        function clashes(cx, cy, text, own) {
            const hw = halfW(text) + 3, hh = HALF_H + 3;
            let n = 0;
            placed.forEach(([px, py, pw]) => { if (Math.abs(px - cx) < hw + pw && Math.abs(py - cy) < hh + HALF_H) n += 10; });
            Object.values(m.states).forEach(([x, y]) => {
                const qx = Math.max(cx - hw, Math.min(x, cx + hw)), qy = Math.max(cy - hh, Math.min(y, cy + hh));
                if (Math.hypot(qx - x, qy - y) < R + 2) n += 10;
            });
            samples.forEach((pts, j) => { if (j !== own) pts.forEach(([x, y]) => { if (Math.abs(x - cx) < hw && Math.abs(y - cy) < hh) n += 1; }); });
            return n;
        }
        const T_TRY = [.5, .38, .62, .28, .72, .2, .8];
        const order = shapes.map((sh, i) => i).sort((a, b) => ({ loop: 0, curve: 1, line: 2 }[shapes[a].kind] - { loop: 0, curve: 1, line: 2 }[shapes[b].kind]));
        const spots = [];
        order.forEach(i => {
            const sh = shapes[i];
            let best = null;
            if (sh.kind === "loop") {
                best = [sh.a[0] + R * 2.75 * Math.cos(sh.ang), sh.a[1] + R * 2.75 * Math.sin(sh.ang) - 1];
            } else {
                const off = sh.kind === "curve" ? 12 : 13, sides = [1, -1];
                let bestScore = Infinity;
                search: for (const extra of [0, 9]) for (const side of sides) for (const t of T_TRY) {
                    const [px, py] = sh.at(t), d = (off + extra) * side, cx = px + sh.n[0] * d, cy = py + sh.n[1] * d;
                    const score = clashes(cx, cy, sh.text, i) + (side < 0 ? .5 : 0) + Math.abs(t - .5) + extra / 30;
                    if (score < bestScore) { bestScore = score; best = [cx, cy]; }
                    if (score < 1) break search;
                }
            }
            placed.push([best[0], best[1], halfW(sh.text)]);
            spots[i] = best;
            box(best[0], best[1], halfW(sh.text));
        });

        let paths = "", labels = "";
        shapes.forEach((sh, i) => {
            const data = `data-from="${esc(sh.e.from)}" data-to="${esc(sh.e.to)}" data-syms="${esc(sh.e.syms.join(" "))}"`;
            paths += `<path class="ed" ${data} d="${sh.d}" marker-end="url(#${id}-arr)"/>`;
            labels += `<text class="el" ${data} x="${f(spots[i][0])}" y="${f(spots[i][1] + 5)}">${esc(sh.text)}</text>`;
        });

        const [sx, sy] = pos(m.start);
        const startArrow = `<path class="start-arrow" d="M${sx - R - 38} ${sy} L${sx - R} ${sy}" marker-end="url(#${id}-arr)"/>`;
        box(sx - R - 38, sy, 4);

        const pad = 10;
        const x0 = Math.min(...pts.map(p => p[0])) - pad, y0 = Math.min(...pts.map(p => p[1])) - pad;
        const vb = [x0, y0, Math.max(...pts.map(p => p[0])) + pad - x0, Math.max(...pts.map(p => p[1])) + pad - y0];

        const states = Object.keys(m.states).map(name => {
            const [x, y] = pos(name);
            const acc = m.accept.includes(name);
            return `<g class="st${acc ? " acc" : ""}" data-state="${esc(name)}">
                <circle class="st-body" cx="${x}" cy="${y}" r="${R}"/>
                ${acc ? `<circle class="st-ring" cx="${x}" cy="${y}" r="${R - 5}"/>` : ""}
                <text class="st-name" x="${x}" y="${y + 5}">${stateLabel(name)}</text>
            </g>`;
        }).join("");

        // Natural size is a bit over 1:1 (capped so tall machines stay on screen); CSS shrinks it on narrow screens.
        const scale = Math.min(1.4, 330 / vb[3]);
        return `<svg class="automaton" data-mid="${id}" viewBox="${vb.map(f).join(" ")}" width="${f(vb[2] * scale)}" height="${f(vb[3] * scale)}" role="img" aria-label="${esc(opts.label || "State diagram")}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="${id}-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="arrowhead" d="M1 1 L9 5 L1 9 Z"/></marker>
                <marker id="${id}-arr-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse"><path class="arrowhead on" d="M1 1 L9 5 L1 9 Z"/></marker>
            </defs>
            ${startArrow}${paths}${states}${labels}
        </svg>`;
    }

    // Light up the current state(s) and the arrow just taken.
    function highlight(svg, { states = [], edge = null, edges = null, result = null } = {}) {
        const list = edges || (edge ? [edge] : []);
        svg.querySelectorAll(".st").forEach(g => {
            const on = states.includes(g.dataset.state);
            g.classList.toggle("on", on);
            g.classList.toggle("yes", on && result === "accept");
            g.classList.toggle("no", on && result === "reject");
        });
        const mid = svg.dataset.mid;
        svg.querySelectorAll(".ed, .el").forEach(p => {
            const on = list.some(e => p.dataset.from === e.from && p.dataset.to === e.to);
            p.classList.toggle("on", on);
            if (p.classList.contains("ed")) p.setAttribute("marker-end", `url(#${mid}-arr${on ? "-on" : ""})`);
        });
    }

    // Spots for n states (n ≤ 6) in a 520×260 box, with self-loops pointing away from the middle.
    function layout(names) {
        const n = names.length, cx = 260, cy = 130;
        const spots = {
            1: [[cx, cy]],
            2: [[150, cy], [370, cy]],
            3: [[110, 170], [260, 60], [410, 170]],
            4: [[110, 70], [410, 70], [410, 200], [110, 200]],
            5: [[90, 140], [220, 50], [400, 50], [430, 200], [230, 220]],
            6: [[80, 70], [260, 50], [440, 70], [440, 210], [260, 230], [80, 210]],
        }[n] || names.map((_, i) => [cx + 190 * Math.cos(i / n * 2 * Math.PI), cy + 100 * Math.sin(i / n * 2 * Math.PI)]);
        const out = {};
        names.forEach((name, i) => {
            const [x, y] = spots[i];
            const loop = n === 1 ? -90 : Math.atan2(y - cy, x - cx) * 180 / Math.PI;
            out[name] = [x, y, { loop: n <= 2 ? -90 : Math.abs(y - cy) < 20 ? loop : (y < cy ? -90 : 90) }];
        });
        return out;
    }

    window.CRAMLET = Object.assign(window.CRAMLET || {}, {
        automata: { runDFA, accepts, strings, eclose, move, runNFA, acceptsNFA, subsetConstruction, render, highlight, layout, stateLabel },
    });
})();
