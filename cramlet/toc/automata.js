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

        let paths = "", labels = "";
        edges.forEach(e => {
            const [ax, ay] = pos(e.from), [bx, by] = pos(e.to);
            const text = e.syms.join(",");
            const data = `data-from="${esc(e.from)}" data-to="${esc(e.to)}" data-syms="${esc(e.syms.join(" "))}"`;
            let d, lx, ly;
            if (e.from === e.to) {
                // self-loop on the side given by the state's loop angle (default: straight up)
                const ang = ((pos(e.from)[2] || {}).loop ?? -90) * Math.PI / 180, spread = .5;
                const p1 = [ax + R * Math.cos(ang - spread), ay + R * Math.sin(ang - spread)];
                const p2 = [ax + R * Math.cos(ang + spread), ay + R * Math.sin(ang + spread)];
                const c1 = [ax + R * 2.9 * Math.cos(ang - .55), ay + R * 2.9 * Math.sin(ang - .55)];
                const c2 = [ax + R * 2.9 * Math.cos(ang + .55), ay + R * 2.9 * Math.sin(ang + .55)];
                d = `M${f(p1[0])} ${f(p1[1])} C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
                lx = ax + R * 2.75 * Math.cos(ang); ly = ay + R * 2.75 * Math.sin(ang) + 5;
                box(ax + R * 2.3 * Math.cos(ang), ay + R * 2.3 * Math.sin(ang), 14);
            } else {
                const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
                if (has(e.to, e.from)) {
                    // two-way: bend each arrow to its own side so they don't overlap
                    const t = .42, bend = Math.min(46, len * .22);
                    const s = [ax + R * (ux * Math.cos(t) + nx * Math.sin(t)), ay + R * (uy * Math.cos(t) + ny * Math.sin(t))];
                    const en = [bx + R * (-ux * Math.cos(t) + nx * Math.sin(t)), by + R * (-uy * Math.cos(t) + ny * Math.sin(t))];
                    const c = [(ax + bx) / 2 + nx * bend * 2, (ay + by) / 2 + ny * bend * 2];
                    d = `M${f(s[0])} ${f(s[1])} Q${f(c[0])} ${f(c[1])} ${f(en[0])} ${f(en[1])}`;
                    lx = .25 * s[0] + .5 * c[0] + .25 * en[0] + nx * 11; ly = .25 * s[1] + .5 * c[1] + .25 * en[1] + ny * 11 + 5;
                    box((s[0] + 2 * c[0] + en[0]) / 4, (s[1] + 2 * c[1] + en[1]) / 4, 4);
                } else {
                    d = `M${f(ax + ux * R)} ${f(ay + uy * R)} L${f(bx - ux * R)} ${f(by - uy * R)}`;
                    lx = (ax + bx) / 2 + nx * 13; ly = (ay + by) / 2 + ny * 13 + 5;
                }
            }
            box(lx, ly - 5, 6 + 4.5 * text.length);
            paths += `<path class="ed" ${data} d="${d}" marker-end="url(#${id}-arr)"/>`;
            labels += `<text class="el" ${data} x="${f(lx)}" y="${f(ly)}">${esc(text)}</text>`;
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

        // Natural size is a little over 1:1; CSS shrinks it to fit narrow screens.
        return `<svg class="automaton" data-mid="${id}" viewBox="${vb.map(f).join(" ")}" width="${f(vb[2] * 1.4)}" height="${f(vb[3] * 1.4)}" role="img" aria-label="${esc(opts.label || "State diagram")}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="${id}-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="arrowhead" d="M1 1 L9 5 L1 9 Z"/></marker>
                <marker id="${id}-arr-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse"><path class="arrowhead on" d="M1 1 L9 5 L1 9 Z"/></marker>
            </defs>
            ${startArrow}${paths}${states}${labels}
        </svg>`;
    }

    // Light up the current state(s) and the arrow just taken.
    function highlight(svg, { states = [], edge = null, result = null } = {}) {
        svg.querySelectorAll(".st").forEach(g => {
            const on = states.includes(g.dataset.state);
            g.classList.toggle("on", on);
            g.classList.toggle("yes", on && result === "accept");
            g.classList.toggle("no", on && result === "reject");
        });
        const mid = svg.dataset.mid;
        svg.querySelectorAll(".ed, .el").forEach(p => {
            const on = !!edge && p.dataset.from === edge.from && p.dataset.to === edge.to;
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
        automata: { runDFA, accepts, strings, render, highlight, layout, stateLabel },
    });
})();
