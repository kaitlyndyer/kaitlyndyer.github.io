// Visual explorers: pictures you can drag that show what a matrix does and where each answer lives.
// Each one has short missions (a goal, checked live as you drag, then an explanation) and free play after.
//
//   transform2d  config: { missions: [id…] }   a 2×2 matrix warping the plane; inputs on the left, outputs on the right
//   spaces       config: { matrices: [{ A, items: [[…], …] }] }   where ker A and im A live, rank–nullity, sorting vectors
//   proj3d       config: { missions: [id…] }   a plane V and the line V⊥ in 3D; x splits into x∥ + x⊥
//   basisgrid    config: { T?: [[a, b], [c, d]], missions: [id…], v1, v2, x }   coordinates in a basis; the B-matrix of T
//
// The widgets draw their own math with LA.M / LA.V, so their roots are marked no-pretty for the plain-text formatter.
(function () {
    "use strict";

    const C = (window.CRAMLET = window.CRAMLET || {});
    const W = C.widgets || (C.widgets = {});
    const { M, V } = LA;

    // ---------- numbers ----------
    const EPS = 1e-7;
    const near = (a, b) => Math.abs(a - b) < EPS;
    const zero = v => v.every(x => Math.abs(x) < EPS);
    function toFrac(x) {
        for (let d = 1; d <= 100; d++) { const n = Math.round(x * d); if (Math.abs(n / d - x) < 1e-9) return [n, d]; }
        return null;
    }
    // A number as text: integers, then fractions like "-1/2", then 2-decimal approximations.
    function nf(x) {
        if (Math.abs(x) < 1e-9) return "0";
        const f = toFrac(x);
        if (!f) return String(Math.round(x * 100) / 100).replace(/^-/, "−");
        return (f[1] === 1 ? String(f[0]) : `${f[0]}/${f[1]}`).replace(/^-/, "−");
    }
    const pn = x => (x < -1e-9 ? `(${nf(x)})` : nf(x)); // a factor in a product: 2·(−1)
    const mm = rows => M(rows.map(r => r.map(nf)));
    const vv = xs => V(...xs.map(nf));
    const plain = xs => "(" + xs.map(nf).join(", ") + ")";
    const snap = (x, step) => Math.round(x / step) * step;

    // Reduced row-echelon form (floats, fine for the small integer matrices here).
    function rref(A) {
        const R = A.map(r => r.slice()), n = R.length, m = R[0].length, piv = [];
        let row = 0;
        for (let col = 0; col < m && row < n; col++) {
            let p = row;
            for (let i = row + 1; i < n; i++) if (Math.abs(R[i][col]) > Math.abs(R[p][col])) p = i;
            if (Math.abs(R[p][col]) < EPS) continue;
            [R[row], R[p]] = [R[p], R[row]];
            const k = R[row][col];
            R[row] = R[row].map(x => x / k);
            for (let i = 0; i < n; i++) if (i !== row) { const f = R[i][col]; R[i] = R[i].map((x, j) => x - f * R[row][j]); }
            piv.push(col); row++;
        }
        R.forEach(r => r.forEach((x, j) => { if (Math.abs(x) < 1e-10) r[j] = 0; }));
        return { R, piv };
    }
    const mul = (A, x) => A.map(r => r.reduce((s, a, j) => s + a * x[j], 0));
    const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);

    // ---------- SVG ----------
    const S = 26; // pixels per unit in the 2D pictures (viewBox −150…150, so about ±5.7 units show)
    const P = ([x, y]) => [x * S, -y * S];
    function arrow(a, b, cls, w = 2.6) {
        const [x1, y1] = a, [x2, y2] = b, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
        if (L < 1.5) return "";
        const ux = dx / L, uy = dy / L, hl = Math.min(11, L * 0.5), hw = hl * 0.55, bx = x2 - ux * hl, by = y2 - uy * hl;
        return `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke-width="${w}"/>
            <polygon class="${cls} hd" points="${x2},${y2} ${bx - uy * hw},${by + ux * hw} ${bx + uy * hw},${by - ux * hw}"/>`;
    }
    const line = (a, b, cls, extra = "") => `<line class="${cls}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" ${extra}/>`;
    const label = (p, text, cls, dx = 6, dy = -6) => `<text class="lbl ${cls}" x="${p[0] + dx}" y="${p[1] + dy}">${text}</text>`;
    const handle = (p, id, cls) => `<g class="hdl ${cls}" data-h="${id}"><circle cx="${p[0]}" cy="${p[1]}" r="16" class="hit"/><circle cx="${p[0]}" cy="${p[1]}" r="6.5" class="dot"/></g>`;
    function grid(cls = "gr") {
        let s = "";
        for (let k = -6; k <= 6; k++) s += line([k * S, -160], [k * S, 160], k ? cls : "ax") + line([-160, k * S], [160, k * S], k ? cls : "ax");
        return s;
    }
    // Long line through the origin along direction d (math coords), drawn in screen coords.
    const fullLine = (d, cls, extra) => { const L = 20 / Math.hypot(d[0], d[1]); return line(P([-d[0] * L, -d[1] * L]), P([d[0] * L, d[1] * L]), cls, extra); };

    function svgPoint(svg, e) {
        const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const q = pt.matrixTransform(svg.getScreenCTM().inverse());
        return [q.x / S, -q.y / S];
    }
    // Drag the [data-h] handles of an svg; onMove(id, mathPoint). The svg itself is never replaced, only its contents.
    function draggable(svg, onMove) {
        let active = null;
        svg.addEventListener("pointerdown", e => {
            const h = e.target.closest("[data-h]");
            if (!h) return;
            active = h.dataset.h; svg.setPointerCapture(e.pointerId); e.preventDefault();
        });
        svg.addEventListener("pointermove", e => { if (active) onMove(active, svgPoint(svg, e)); });
        const stop = () => { active = null; };
        svg.addEventListener("pointerup", stop); svg.addEventListener("pointercancel", stop);
    }

    // ---------- missions ----------
    // list: [{ goal, hint?, test(state) → bool, why: html | (state) → html }]
    function missions(host, list, icon, onFinish) {
        let i = 0, solved = false, last = null;
        function paint() {
            if (!list.length) { host.innerHTML = ""; return; }
            if (i >= list.length) {
                host.innerHTML = `<div class="vz-m all">${icon("star")} <span><b>All missions done.</b> Free play now: try the presets, and predict what will happen <i>before</i> you click.</span>
                    <button type="button" class="btn ghost small" data-act="again">${icon("arrow-clockwise")} Missions again</button></div>`;
                host.querySelector('[data-act="again"]').addEventListener("click", () => { i = 0; solved = false; paint(); if (last) check(last); });
                if (onFinish) onFinish();
                return;
            }
            const m = list[i];
            host.innerHTML = `<div class="vz-m${solved ? " ok" : ""}">
                <div class="vz-mh"><b>${solved ? icon("check") + " Mission " + (i + 1) + " done" : "Mission " + (i + 1) + " of " + list.length}</b>
                    <span class="st-dots">${list.map((_, k) => `<span class="${k < i ? "done" : k === i ? (solved ? "done" : "now") : ""}"></span>`).join("")}</span></div>
                <p class="vz-goal">${m.goal}</p>
                ${solved ? `<div class="st-why">${typeof m.why === "function" ? m.why(last) : m.why}</div>
                    <div class="st-btns"><button type="button" class="btn small" data-act="next">${i + 1 < list.length ? "Next mission →" : "Finish"}</button></div>`
                    : `<div class="st-btns">${m.hint ? `<button type="button" class="btn ghost small" data-act="hint">${icon("lightbulb")} Hint</button>` : ""}
                        <button type="button" class="btn ghost small" data-act="skip">Skip</button></div><div class="vz-hint"></div>`}
            </div>`;
            const on = (a, fn) => { const b = host.querySelector(`[data-act="${a}"]`); if (b) b.addEventListener("click", fn); };
            on("next", () => { i++; solved = false; paint(); if (last) check(last); });
            on("skip", () => { i++; solved = false; paint(); if (last) check(last); });
            on("hint", () => { host.querySelector(".vz-hint").innerHTML = `<div class="st-hint">${m.hint}</div>`; });
        }
        function check(state) {
            last = state;
            if (i < list.length && !solved && list[i].test(state)) { solved = true; paint(); }
        }
        paint();
        return { check };
    }

    const presetButtons = (list) => list.map((p, k) => `<button type="button" class="vz-chip" data-p="${k}">${p[0]}</button>`).join("");

    // =====================================================================================
    // transform2d: what a 2×2 matrix does to the plane
    // =====================================================================================
    const R45 = Math.SQRT1_2;
    const T_PRESETS = [
        ["Identity", [1, 0, 0, 1]], ["Rotate 90°", [0, -1, 1, 0]], ["Rotate 45°", [R45, -R45, R45, R45]],
        ["Reflect in x-axis", [1, 0, 0, -1]], ["Reflect in y = x", [0, 1, 1, 0]], ["Project onto x-axis", [1, 0, 0, 0]],
        ["Project onto y = x", [0.5, 0.5, 0.5, 0.5]], ["Shear", [1, 1, 0, 1]], ["Scale by 2", [2, 0, 0, 2]],
        ["Squash flat", [1, 2, 2, 4]], ["Zero matrix", [0, 0, 0, 0]],
    ];
    const eqA = (A, B) => A.every((x, i) => near(x, B[i]));
    const rank2 = ([a, b, c, d]) => !near(a * d - b * c, 0) ? 2 : zero([a, b, c, d]) ? 0 : 1;

    function describe2([a, b, c, d]) {
        const det = a * d - b * c;
        if (zero([a, b, c, d])) return "the zero map: every input goes to 0.";
        const orth = near(a * a + c * c, 1) && near(b * b + d * d, 1) && near(a * b + c * d, 0);
        if (orth && near(det, 1)) {
            const th = Math.round(Math.atan2(c, a) * 180 / Math.PI);
            return th === 0 ? "the identity: nothing moves." : `a rotation by ${Math.abs(th)}° ${th > 0 ? "counterclockwise" : "clockwise"}.`;
        }
        if (orth && near(det, -1)) {
            const half = Math.round(Math.atan2(c, a) * 90 / Math.PI);
            const name = { 0: "the x-axis", 90: "the y-axis", "-90": "the y-axis", 45: "the line y = x", "-45": "the line y = −x" }[half] || `the line at ${half}° from the x-axis`;
            return `a reflection in ${name}. It flips the plane over, so det A = −1.`;
        }
        if (near(b, c) && near(a + d, 1) && near(det, 0)) return "an orthogonal projection onto a line: each point drops straight (at 90°) onto the green line.";
        if (near(b, 0) && near(c, 0) && near(a, d)) return `scaling by ${nf(a)}: everything stretches by the same factor.`;
        if (near(a, 1) && near(d, 1) && (near(b, 0) !== near(c, 0))) return "a shear: one axis stays put and the other slides sideways.";
        return "";
    }

    const T_MISSIONS = {
        e1: { goal: "In the <b>Outputs</b> picture, drag the tip of the <span class=\"k-e1\">red arrow</span> to the point (2, 1). The red arrow shows where e₁ = (1, 0) lands.",
            hint: "Grab the red dot and drop it 2 right and 1 up from the center.",
            test: s => near(s.A[0], 2) && near(s.A[2], 1),
            why: s => `Column 1 of A is now (2, 1): ${mm([[s.A[0], s.A[1]], [s.A[2], s.A[3]]])}. <b>The columns of A are where e₁ and e₂ land</b>, and the whole grid follows them, because x = x₁e₁ + x₂e₂ always goes to x₁(column 1) + x₂(column 2).` },
        rot90: { goal: "Make A rotate everything 90° counterclockwise by dragging both arrow tips in the Outputs picture.",
            hint: "Turning 90° counterclockwise: e₁ = (1, 0) ends up pointing straight up, and e₂ = (0, 1) ends up pointing left.",
            test: s => eqA(s.A, [0, -1, 1, 0]),
            why: `A = ${M([[0, -1], [1, 0]])}: column 1 = where e₁ lands = (0, 1), column 2 = where e₂ lands = (−1, 0). That's the recipe for <b>any</b> transformation matrix: find T(e₁) and T(e₂) and stand them up as columns.` },
        scale: { goal: "Make A stretch everything to twice its size, in every direction.",
            test: s => eqA(s.A, [2, 0, 0, 2]),
            why: `A = 2I. Look at the readout: A<sup>−1</sup> = ${M([["1/2", 0], [0, "1/2"]])}, which shrinks things back by half. The square's area grew by det A = 4.` },
        refl: { goal: "Swap the axes: make e₁ land on (0, 1) and e₂ land on (1, 0).",
            test: s => eqA(s.A, [0, 1, 1, 0]),
            why: `That's the reflection in the line y = x. det A = −1: the minus sign means the plane got <b>flipped over</b> (the square's red and blue edges swapped sides). Reflect twice and you're back where you started, so this A is its own inverse.` },
        flat: { goal: "Squash the plane flat: drag the arrow tips so that <b>every</b> output lands on one line.",
            hint: "Put both arrow tips on the same line through the center (for example (1, 1) and (2, 2)).",
            test: s => rank2(s.A) === 1,
            why: `The columns are parallel, so every output is a multiple of one vector. The image (green, in the <b>Outputs</b>) is just a line: rank 1. The square got flattened to area 0, so det A = 0 and A is <b>not invertible</b>: two different inputs land on the same output, so you can't undo it.` },
        kernel: { goal: "Some inputs got crushed to 0. In the <b>Inputs</b> picture, drag the purple x so that Ax = 0 (with x ≠ 0). If the plane isn't squashed flat right now, squash it first.",
            hint: "Look for the orange line in the Inputs picture: put x on it.",
            test: s => rank2(s.A) < 2 && !zero(s.x) && zero(mul([[s.A[0], s.A[1]], [s.A[2], s.A[3]]], s.x)),
            why: s => `x = ${plain(s.x)} goes to 0, and so does every point on the orange line: that line is <b>ker A</b>. Notice where things live: ker A is in the <b>Inputs</b> picture, im A is in the <b>Outputs</b>. And dim ker A + dim im A = ${rank2(s.A) === 0 ? "2 + 0" : "1 + 1"} = 2 = the number of columns (rank–nullity).` },
        proj: { goal: "Make A the projection onto the x-axis: every point should drop straight down (or up) onto the x-axis.",
            hint: "Where does e₁ = (1, 0) go? It's already on the x-axis. Where does e₂ = (0, 1) go?",
            test: s => eqA(s.A, [1, 0, 0, 0]),
            why: `A = ${M([[1, 0], [0, 0]])}. im A = the x-axis (where things land, in the Outputs), and ker A = the y-axis (what drops to 0, in the Inputs). Projecting twice changes nothing: A² = A.` },
    };

    W.transform2d = function (el, config, ctx) {
        const { icon } = ctx;
        const s = { A: [1, 0, 0, 1], x: [2, 1], t: 1 };
        el.classList.add("no-pretty");
        el.innerHTML = `<div class="vz">
            <div class="vz-mission"></div>
            <div class="vz-panes">
                <figure><figcaption><b>Inputs</b> x live here (ℝ²)</figcaption><svg class="vz-svg" viewBox="-150 -150 300 300" data-pane="in"></svg></figure>
                <figure><figcaption><b>Outputs</b> Ax live here (ℝ²)</figcaption><svg class="vz-svg" viewBox="-150 -150 300 300" data-pane="out"></svg></figure>
            </div>
            <div class="vz-ctrl">
                <div class="vz-amat"><span>A =</span><span class="mat" style="--cols:2">${[0, 1, 2, 3].map(k => `<span><input class="vz-num" type="number" step="0.5" data-k="${k}" aria-label="Matrix entry ${k + 1}"></span>`).join("")}</span></div>
                <label class="vz-morph">Watch it happen <input type="range" min="0" max="100" value="100"> <button type="button" class="btn ghost small" data-act="play">▶ Play</button></label>
            </div>
            <div class="vz-presets">${presetButtons(T_PRESETS)}</div>
            <div class="vz-read"></div>
        </div>`;
        const inSvg = el.querySelector('[data-pane="in"]'), outSvg = el.querySelector('[data-pane="out"]');
        const nums = [...el.querySelectorAll(".vz-num")], range = el.querySelector(".vz-morph input");
        const read = el.querySelector(".vz-read");
        const ms = missions(el.querySelector(".vz-mission"), (config.missions || Object.keys(T_MISSIONS)).map(id => T_MISSIONS[id]), icon);

        function draw() {
            const [a, b, c, d] = s.A, A = [[a, b], [c, d]], r = rank2(s.A), det = a * d - b * c;
            const t = s.t, Mt = [(1 - t) + t * a, t * b, t * c, (1 - t) + t * d];
            const map = ([x, y]) => [Mt[0] * x + Mt[1] * y, Mt[2] * x + Mt[3] * y];
            const kerDir = !zero([a, b]) ? [-b, a] : [-d, c];
            const imDir = !zero([a, c]) ? [a, c] : [b, d];

            // Inputs
            let h = grid();
            if (r === 0) h += `<rect x="-150" y="-150" width="300" height="300" class="kerfill"/>` + label([-140, -128], "ker A = all of ℝ²", "k-ker", 0, 0);
            if (r === 1) h += fullLine(kerDir, "kerline") + label(P([kerDir[0] * 4.2 / Math.hypot(...kerDir), kerDir[1] * 4.2 / Math.hypot(...kerDir)]), "ker A", "k-ker");
            h += `<polygon class="sq" points="${[[0, 0], [1, 0], [1, 1], [0, 1]].map(P).join(" ")}"/>`;
            h += arrow(P([0, 0]), P([1, 0]), "e1") + arrow(P([0, 0]), P([0, 1]), "e2");
            h += label(P([1, 0]), "e₁", "k-e1", 2, 16) + label(P([0, 1]), "e₂", "k-e2", -18, -2);
            h += arrow(P([0, 0]), P(s.x), "xv") + label(P(s.x), "x", "k-x") + handle(P(s.x), "x", "h-x");
            inSvg.innerHTML = h;

            // Outputs: the grid lines of the input, carried along by A
            let o = "";
            for (let k = -6; k <= 6; k++) {
                o += line(P(map([k, -8])), P(map([k, 8])), k ? "gr warp" : "ax warp") + line(P(map([-8, k])), P(map([8, k])), k ? "gr warp" : "ax warp");
            }
            const done = t === 1;
            if (done && r === 1) o += fullLine(imDir, "imline") + label(P([imDir[0] * 4.2 / Math.hypot(...imDir), imDir[1] * 4.2 / Math.hypot(...imDir)]), "im A", "k-im");
            if (done && r === 2) o += label([-140, -128], "im A = all of ℝ²", "k-im", 0, 0);
            if (done && r === 0) o += `<circle cx="0" cy="0" r="6" class="imdot"/>` + label([0, 0], "im A = {0}", "k-im", 8, -8);
            o += `<polygon class="sq${det < 0 && done ? " flip" : ""}" points="${[[0, 0], [1, 0], [1, 1], [0, 1]].map(p => P(map(p))).join(" ")}"/>`;
            const e1 = map([1, 0]), e2 = map([0, 1]), Ax = map(s.x);
            o += arrow(P([0, 0]), P(Ax), "xv") + label(P(Ax), "Ax", "k-x");
            o += arrow(P([0, 0]), P(e1), "e1") + arrow(P([0, 0]), P(e2), "e2");
            if (done) o += handle(P(e1), "e1", "h-e1") + handle(P(e2), "e2", "h-e2");
            o += label(P(e1), "Ae₁", "k-e1", 4, 16) + label(P(e2), "Ae₂", "k-e2", 4, -6);
            outSvg.innerHTML = o;

            nums.forEach((inp, k) => { if (document.activeElement !== inp) inp.value = String(Math.round(s.A[k] * 1000) / 1000); });

            // Readout
            const Ax1 = mul(A, s.x), name = describe2(s.A);
            const inv = r === 2 ? mm([[d / det, -b / det], [-c / det, a / det]]) : "";
            read.innerHTML = `
                ${name ? `<p><b>What A does:</b> ${name}</p>` : ""}
                <div class="mrow">Ax = ${mm(A)}${vv(s.x)} = ${nf(s.x[0])}${vv([a, c])} + ${nf(s.x[1])}${vv([b, d])} = ${vv(Ax1)}</div>
                <p class="muted small">Ax = x₁·(column 1) + x₂·(column 2): x tells you how many of each column to take.</p>
                <ul class="vz-facts">
                    <li><b>det A</b> = ad − bc = ${pn(a)}·${pn(d)} − ${pn(b)}·${pn(c)} = <b>${nf(det)}</b>. The unit square's area gets multiplied by |det A|${det < 0 ? ", and the minus sign means the plane was flipped over" : ""}.</li>
                    <li><b>rank A = ${r}</b>, so <span class="k-im">im A</span> ${r === 2 ? "= all of ℝ² (every output is reachable)" : r === 1 ? `= the line through ${plain(imDir)} (only outputs on it are reachable)` : "= {0}"}. It lives in the <b>Outputs</b>.</li>
                    <li><span class="k-ker">ker A</span> ${r === 2 ? "= {0}: only x = 0 goes to 0" : r === 1 ? `= the line through ${plain(kerDir)}: all of it goes to 0` : "= all of ℝ²"}. It lives in the <b>Inputs</b>. dim ker + rank = ${2 - r} + ${r} = 2.</li>
                    <li>${r === 2 ? `<b>Invertible</b> (det ≠ 0). A<sup>−1</sup> = ${inv} undoes it.` : "<b>Not invertible</b> (det = 0): different inputs land on the same output, so there's no way to undo A."}</li>
                </ul>`;
            ms.check({ A: s.A.slice(), x: s.x.slice() });
        }

        draggable(outSvg, (id, p) => {
            const q = [snap(p[0], 0.5), snap(p[1], 0.5)];
            if (id === "e1") { s.A[0] = q[0]; s.A[2] = q[1]; }
            if (id === "e2") { s.A[1] = q[0]; s.A[3] = q[1]; }
            draw();
        });
        draggable(inSvg, (id, p) => { s.x = [snap(p[0], 0.5), snap(p[1], 0.5)]; draw(); });
        nums.forEach(inp => inp.addEventListener("input", () => { const v = parseFloat(inp.value); if (isFinite(v)) { s.A[+inp.dataset.k] = v; s.t = 1; range.value = 100; draw(); } }));
        el.querySelectorAll(".vz-chip").forEach(b => b.addEventListener("click", () => { s.A = T_PRESETS[+b.dataset.p][1].slice(); play(); }));
        range.addEventListener("input", () => { s.t = range.value / 100; draw(); });
        let anim = 0;
        function play() {
            cancelAnimationFrame(anim);
            const t0 = performance.now();
            const step = now => { const t = Math.min(1, (now - t0) / 1100); s.t = t < 1 ? t * t * (3 - 2 * t) : 1; range.value = Math.round(s.t * 100); draw(); if (t < 1) anim = requestAnimationFrame(step); };
            anim = requestAnimationFrame(step);
        }
        el.querySelector('[data-act="play"]').addEventListener("click", e => { e.preventDefault(); play(); });
        draw();
    };

    // =====================================================================================
    // spaces: where ker A and im A live, rank–nullity, and sorting vectors into the right space
    // =====================================================================================
    W.spaces = function (el, config, ctx) {
        const { icon } = ctx;
        const list = config.matrices;
        let mi = 0;
        el.classList.add("no-pretty");

        function show() {
            const { A, items } = list[mi], n = A.length, m = A[0].length;
            const { R, piv } = rref(A), r = piv.length;
            const placed = { kin: [], kout: [], iin: [], iout: [] };
            let stage = 0, item = 0;

            // Truth for one vector: which space, and the work that shows it.
            // Items are vectors, or { v, role: "in" | "out" } when A is square and the length can't tell them apart.
            const vecOf = it => Array.isArray(it) ? it : it.v;
            const roleOf = it => Array.isArray(it) ? (it.length === m ? "in" : "out") : it.role;
            function judge(it) {
                const v = vecOf(it);
                if (roleOf(it) === "in") {
                    const Av = mul(A, v), inK = zero(Av);
                    return { where: inK ? "kin" : "kout", why: `${m === n ? "It's labeled x," : `It has <b>${m}</b> entries,`} so it's an <b>input</b> (in ℝ<sup>${m}</sup>). ${mm(A)}${vv(v)} = ${vv(Av)}${inK ? ", which is 0, so it's <b>in ker A</b>." : ", which isn't 0, so it's <b>not in ker A</b>."}` };
                }
                const aug = rref(A.map((row, i) => row.concat([v[i]])));
                const bad = aug.piv.includes(m);
                const outWhy = `${m === n ? "It's labeled b," : `It has <b>${n}</b> entries,`} so it's an <b>output</b>`;
                if (bad) return { where: "iout", why: `${outWhy} (in ℝ<sup>${n}</sup>). Row reducing [A | b] gives a row [0 … 0 | nonzero], so no x has Ax = b: it's <b>not in im A</b>.` };
                const x = new Array(m).fill(0);
                aug.piv.forEach((c, i) => { x[c] = aug.R[i][m]; });
                const terms = x.map((c, j) => near(c, 0) ? "" : `${nf(c)}${vv(A.map(row => row[j]))}`).filter(Boolean);
                return { where: "iin", why: `${outWhy} (in ℝ<sup>${n}</sup>). [A | b] is consistent: x = ${vv(x)} works, so b = ${terms.join(" + ") || "0"} is a combination of the columns: <b>in im A</b>.` };
            }
            const chip = it => `<span class="vz-vec">${m === n ? (roleOf(it) === "in" ? "x = " : "b = ") : ""}${vv(vecOf(it))}</span>`;

            function paint() {
                const bar = Array.from({ length: m }, (_, j) => `<span class="${piv.includes(j) ? "pv" : "fr"}">${piv.includes(j) ? "pivot" : "free"}</span>`).join("");
                const R2 = R.map(row => row.map(x => x));
                el.innerHTML = `<div class="vz">
                    <div class="vz-tabs">${list.map((x, k) => `<button type="button" class="vz-chip${k === mi ? " on" : ""}" data-m="${k}">${x.A.length}×${x.A[0].length} matrix</button>`).join("")}</div>
                    <div class="mrow"><b>A =</b> ${mm(A)} <span class="muted">(${n} rows × ${m} columns)</span></div>
                    <div class="vz-stage"></div>
                    <div class="vz-map${stage >= 1 ? "" : " dim"}">
                        <div class="vz-space in"><div class="vz-sh">Inputs: ℝ<sup>${stage >= 1 ? m : "?"}</sup></div>
                            <div class="vz-sub ker"><div class="vz-sh">ker A ${stage >= 2 ? `(dim ${m - r})` : ""}</div><div class="vz-bin">${placed.kin.map(chip).join("")}</div></div>
                            <div class="vz-bin">${placed.kout.map(chip).join("")}</div>
                            <p class="vz-note">x goes in here. ker A = the inputs A sends to 0.</p></div>
                        <div class="vz-arrow">A<span>→</span></div>
                        <div class="vz-space out"><div class="vz-sh">Outputs: ℝ<sup>${stage >= 1 ? n : "?"}</sup></div>
                            <div class="vz-sub im"><div class="vz-sh">im A ${stage >= 2 ? `(dim ${r})` : ""}</div><div class="vz-bin">${placed.iin.map(chip).join("")}</div></div>
                            <div class="vz-bin">${placed.iout.map(chip).join("")}</div>
                            <p class="vz-note">Ax comes out here. im A = every output you can actually reach.</p></div>
                    </div>
                    ${stage >= 2 ? `<div class="vz-rn"><div class="mrow"><b>rref A =</b> ${mm(R2)}</div>
                        <div class="vz-bar">${bar}</div>
                        <p>Every column is either a <b class="k-im">pivot</b> column (adds a dimension to im A) or <b class="k-ker">free</b> (adds a direction to ker A). So <b>dim ker A + dim im A = ${m - r} + ${r} = ${m}</b> = number of columns.</p></div>` : ""}
                </div>`;
                el.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => { mi = +b.dataset.m; show(); }));
                stagePaint();
            }

            function stagePaint() {
                const host = el.querySelector(".vz-stage");
                const box = (k, w) => `<input class="blank${w ? " wide" : ""}" data-b="${k}" inputmode="numeric" autocomplete="off" aria-label="Answer box ${k + 1}">`;
                if (stage === 0) {
                    host.innerHTML = `<div class="vz-m"><p class="vz-goal"><b>Step 1: predict.</b> Ax only makes sense when x has as many entries as A has columns.</p>
                        <p>Inputs x live in ℝ<sup>${box(0)}</sup> &nbsp; Outputs Ax live in ℝ<sup>${box(1)}</sup></p>
                        <div class="st-btns"><button type="button" class="btn small" data-act="ck">${icon("check")} Check</button><button type="button" class="btn ghost small" data-act="sh">Show me</button></div><div class="st-msg"></div></div>`;
                    wireBoxes(host, [m, n], `x needs ${m} entries (one per column), and Ax has ${n} entries (one per row). <b>Columns → inputs, rows → outputs.</b>`);
                } else if (stage === 1) {
                    host.innerHTML = `<div class="vz-m"><p class="vz-goal"><b>Step 2: predict the sizes.</b> Row reduce A in your head or on paper.</p>
                        <p>rank A = dim im A = ${box(0)} &nbsp; dim ker A = ${box(1)}</p>
                        <div class="st-btns"><button type="button" class="btn small" data-act="ck">${icon("check")} Check</button><button type="button" class="btn ghost small" data-act="sh">Show me</button></div><div class="st-msg"></div></div>`;
                    wireBoxes(host, [r, m - r], `${r} pivot${r === 1 ? "" : "s"}, so rank ${r}. The other ${m - r} column${m - r === 1 ? " is" : "s are"} free, so dim ker A = ${m - r}.`);
                } else if (item < items.length) {
                    const v = items[item], vec = vecOf(v), role = roleOf(v);
                    host.innerHTML = `<div class="vz-m"><p class="vz-goal"><b>Step 3: where does it live?</b> (${item + 1} of ${items.length})</p>
                        <div class="mrow">${chip(v)}</div>
                        <div class="vz-sort">
                            <button type="button" class="vz-chip" data-w="kin">Input, in ker A</button><button type="button" class="vz-chip" data-w="kout">Input, not in ker A</button>
                            <button type="button" class="vz-chip" data-w="iin">Output, in im A</button><button type="button" class="vz-chip" data-w="iout">Output, not in im A</button>
                        </div><div class="st-msg"></div><div class="vz-after"></div></div>`;
                    const truth = judge(v);
                    let missed = false;
                    host.querySelectorAll("[data-w]").forEach(b => b.addEventListener("click", () => {
                        if (b.dataset.w !== truth.where) {
                            missed = true; b.classList.add("bad"); b.disabled = true;
                            const msg = host.querySelector(".st-msg"); msg.className = "st-msg bad";
                            msg.textContent = m === n ? (role === "in" ? "Not that one. It's labeled x, so it's an input. Multiply it by A." : "Not that one. It's labeled b, so it's an output. Is it a combination of the columns?")
                                : role === "in" ? `Not that one. Count its entries: ${vec.length} = number of columns. Then try multiplying by A.` : `Not that one. Count its entries: ${vec.length} = number of rows. Then ask: is it a combination of the columns?`;
                            return;
                        }
                        placed[truth.where].push(v);
                        host.querySelectorAll("[data-w]").forEach(x => { x.disabled = true; if (x === b) x.classList.add("ok"); });
                        const msg = host.querySelector(".st-msg"); msg.className = "st-msg ok"; msg.textContent = missed ? "That's it." : "Yes!";
                        host.querySelector(".vz-after").innerHTML = `<div class="st-why">${truth.why}</div><div class="st-btns"><button type="button" class="btn small" data-act="nx">Next →</button></div>`;
                        host.querySelector('[data-act="nx"]').addEventListener("click", () => { item++; paint(); });
                    }));
                } else {
                    host.innerHTML = `<div class="vz-m all">${icon("star")} <span><b>Done with this matrix.</b> ${mi + 1 < list.length ? "Try the next one: its shape is different, so things live in different places." : "Every vector lives in exactly one of the two spaces: count entries first, then test."}</span>
                        ${mi + 1 < list.length ? `<button type="button" class="btn small" data-act="nm">Next matrix →</button>` : ""}</div>`;
                    const nm = host.querySelector('[data-act="nm"]');
                    if (nm) nm.addEventListener("click", () => { mi++; show(); });
                }
            }

            function wireBoxes(host, want, why) {
                const inputs = [...host.querySelectorAll("input.blank")], msg = host.querySelector(".st-msg");
                const advance = () => { inputs.forEach((x, k) => { x.value = want[k]; x.disabled = true; x.classList.add("ok"); });
                    msg.className = "st-msg ok"; msg.innerHTML = why;
                    host.querySelector(".st-btns").innerHTML = `<button type="button" class="btn small" data-act="go">Next →</button>`;
                    host.querySelector('[data-act="go"]').addEventListener("click", () => { stage++; paint(); });
                    stage === 0 && el.querySelector(".vz-map").classList.remove("dim"); };
                const check = () => {
                    let all = true;
                    inputs.forEach((x, k) => { const ok = Number(x.value.trim()) === want[k] && x.value.trim() !== ""; x.classList.toggle("ok", ok); x.classList.toggle("bad", !ok); if (!ok) all = false; });
                    if (all) advance(); else { msg.className = "st-msg bad"; msg.textContent = "Not quite: the red boxes are off. Try again, or press Show me."; }
                };
                host.querySelector('[data-act="ck"]').addEventListener("click", check);
                host.querySelector('[data-act="sh"]').addEventListener("click", advance);
                inputs.forEach(x => x.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); check(); } }));
            }
            paint();
        }
        show();
    };

    // =====================================================================================
    // proj3d: a plane V and its perpendicular line V⊥; x = x∥ + x⊥
    // =====================================================================================
    const NORMALS = [["Plane x + 2y + 2z = 0", [1, 2, 2]], ["The xy-plane", [0, 0, 1]], ["Plane x − y = 0", [1, -1, 0]]];
    const P_MISSIONS = {
        inV: { goal: "Use the sliders to move x <b>into V</b>, so that x⊥ disappears (x⊥ = 0). Keep x ≠ 0.",
            hint: "x is in V when it satisfies V's equation. For x + 2y + 2z = 0, try x = 2, y = −1, z = 0.",
            test: s => s.mode === "plane" && !zero(s.x) && zero(s.perp),
            why: s => `x = ${plain(s.x)} is already in V, so its projection is itself: x∥ = x. That's why <b>im P = V</b> and Px = x for every x in V.` },
        perp: { goal: "Now move x onto the <span class=\"k-ker\">orange line V⊥</span>, so that x∥ disappears (x∥ = 0).",
            hint: "V⊥ is spanned by the normal vector of the plane: try x equal to the coefficients of the equation.",
            test: s => !zero(s.x) && zero(s.par),
            why: s => `x = ${plain(s.x)} is perpendicular to the whole of V, so its shadow on V is just the origin: Px = 0. That's why <b>ker P = V⊥</b>. Notice V⊥ = the set of vectors whose dot product with everything in V is 0.` },
        edge: { goal: "Drag the picture to turn it until you're looking at the plane <b>edge-on</b> (it looks like a line).",
            hint: "Drag sideways first, then up or down, until the green plane becomes thin.",
            test: s => s.edge,
            why: "Edge-on, V looks like a line and the orange V⊥ points straight out of it at 90°. x⊥ is always parallel to V⊥: it's the part of x that sticks out of V." },
        line: { goal: "Switch V from a plane to a <b>line</b> (button above the picture). What happens to V⊥?",
            test: s => s.mode === "line",
            why: "Now V is a line, so V⊥ is the whole plane perpendicular to it. The roles swap, and the dimensions still add up: dim V + dim V⊥ = 1 + 2 = 3. (Before, it was 2 + 1 = 3.)" },
    };

    W.proj3d = function (el, config, ctx) {
        const { icon } = ctx;
        const s = { x: [0, 4, 1], n: [1, 2, 2], mode: "plane", yaw: -1.7, pitch: 0.3 };
        el.classList.add("no-pretty");
        el.innerHTML = `<div class="vz">
            <div class="vz-mission"></div>
            <div class="vz-tabs">${NORMALS.map((p, k) => `<button type="button" class="vz-chip${k === 0 ? " on" : ""}" data-n="${k}">${p[0]}</button>`).join("")}
                <span class="vz-sep"></span><button type="button" class="vz-chip on" data-mode="plane">V is a plane</button><button type="button" class="vz-chip" data-mode="line">V is a line</button></div>
            <div class="vz-panes one">
                <figure><figcaption>Drag the picture to turn it. <span class="k-im">■ V</span> <span class="k-ker">■ V⊥</span> <span class="k-x">■ x</span></figcaption><svg class="vz-svg grab" viewBox="-170 -150 340 300"></svg></figure>
                <div class="vz-sliders">${["x₁", "x₂", "x₃"].map((nm, k) => `<label>${nm} <input type="range" min="-4" max="4" step="1" data-k="${k}"> <output></output></label>`).join("")}</div>
            </div>
            <div class="vz-read"></div>
        </div>`;
        const svg = el.querySelector("svg"), read = el.querySelector(".vz-read");
        const sliders = [...el.querySelectorAll(".vz-sliders input")];
        const ms = missions(el.querySelector(".vz-mission"), (config.missions || Object.keys(P_MISSIONS)).map(id => P_MISSIONS[id]), icon);
        const S3 = 30;

        function cam(p) {
            const cy = Math.cos(s.yaw), sy = Math.sin(s.yaw), cp = Math.cos(s.pitch), sp = Math.sin(s.pitch);
            const x1 = p[0] * cy - p[1] * sy, y1 = p[0] * sy + p[1] * cy, z1 = p[2];
            return { X: x1, Y: y1 * sp + z1 * cp, depth: y1 * cp - z1 * sp };
        }
        const Q = p => { const c = cam(p); return [c.X * S3, -c.Y * S3]; };
        const scale = (v, k) => v.map(x => x * k), add = (a, b) => a.map((x, i) => x + b[i]), sub = (a, b) => a.map((x, i) => x - b[i]);
        function basisOf(n) { // orthonormal pair spanning the plane n·x = 0
            const L = Math.hypot(...n), u = n.map(x => x / L);
            const t = Math.abs(u[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
            let a = sub(t, scale(u, dot(t, u))); a = scale(a, 1 / Math.hypot(...a));
            const b = [u[1] * a[2] - u[2] * a[1], u[2] * a[0] - u[0] * a[2], u[0] * a[1] - u[1] * a[0]];
            return [a, b, u];
        }
        const poly = (pts, cls) => `<polygon class="${cls}" points="${pts.map(Q).join(" ")}"/>`;
        const seg = (a, b, cls, extra = "") => line(Q(a), Q(b), cls, extra);

        function draw() {
            const n = s.n, nn = dot(n, n), k = dot(s.x, n);
            const onN = scale(n, k / nn), other = sub(s.x, onN); // part along n, part in the plane n·x = 0
            const [a, b, u] = basisOf(n);
            s.par = s.mode === "plane" ? other : onN;
            s.perp = s.mode === "plane" ? onN : other;
            s.edge = s.mode === "plane" && Math.abs(cam(u).depth) < 0.07;

            let h = "";
            const R = 4.2;
            const sheet = cls => poly([add(scale(a, R), scale(b, R)), add(scale(a, R), scale(b, -R)), add(scale(a, -R), scale(b, -R)), add(scale(a, -R), scale(b, R))], cls);
            h += s.mode === "plane" ? sheet("plane3") : sheet("plane3 perpfill");
            [[0, "x"], [1, "y"], [2, "z"]].forEach(([i, nm]) => { const e = [0, 0, 0]; e[i] = 4.6; h += seg(scale(e, -1), e, "ax3") + label(Q(e), nm, "k-ax", 4, 4); });
            if (s.mode === "plane") h += seg(scale(u, -6), scale(u, 6), "kerline", 'stroke-dasharray="7 5"') + label(Q(scale(u, 4.8)), "V⊥", "k-ker");
            else h += seg(scale(u, -6), scale(u, 6), "imline") + label(Q(scale(u, 4.8)), "V", "k-im");
            h += label(Q(add(scale(a, R), scale(b, R))), s.mode === "plane" ? "V" : "V⊥", s.mode === "plane" ? "k-im" : "k-ker", 4, 0);
            h += seg(s.par, s.x, "drop", 'stroke-dasharray="3 4"');
            // right-angle mark where x⊥ meets V
            if (!zero(s.par) && !zero(s.perp)) {
                const p1 = scale(s.par, 1 - 0.35 / Math.hypot(...s.par)), d = scale(s.perp, 0.35 / Math.hypot(...s.perp));
                h += `<polyline class="rt" points="${[p1, add(p1, d), add(s.par, d)].map(Q).join(" ")}"/>`;
            }
            h += arrow(Q([0, 0, 0]), Q(s.par), "e-par", 3) + arrow(Q(s.par), Q(s.x), "e-perp", 3) + arrow(Q([0, 0, 0]), Q(s.x), "xv", 3);
            h += label(Q(s.x), "x", "k-x") + label(Q(s.par), "x∥", "k-im", 6, 14);
            svg.innerHTML = h;

            sliders.forEach((sl, i) => { sl.value = s.x[i]; sl.nextElementSibling.textContent = nf(s.x[i]); });

            const Pm = s.mode === "plane" ? [0, 1, 2].map(i => [0, 1, 2].map(j => (i === j ? 1 : 0) - n[i] * n[j] / nn)) : [0, 1, 2].map(i => [0, 1, 2].map(j => n[i] * n[j] / nn));
            // The plane's equation, e.g. x₁ + 2x₂ + 2x₃ = 0
            const eq = n.map((c, i) => c === 0 ? "" : `${c < 0 ? " − " : " + "}${Math.abs(c) === 1 ? "" : Math.abs(c)}x${"₁₂₃"[i]}`).join("").replace(/^ \+ /, "").replace(/^ − /, "−") + " = 0";
            read.innerHTML = s.mode === "plane" ? `
                <p><b>V</b> = the plane ${eq} = ker ${mm([n])}. <b>V⊥</b> = the line through n = ${plain(n)}: n is perpendicular to everything in V.</p>
                <div class="mrow"><span class="k-ker">x⊥</span> = <span class="frac"><span>x · n</span><span>n · n</span></span> n = <span class="frac"><span>${nf(k)}</span><span>${nf(nn)}</span></span>${vv(n)} = ${vv(s.perp)} <span class="muted">(the part of x along V⊥)</span></div>
                <div class="mrow"><span class="k-im">x∥</span> = x − x⊥ = ${vv(s.x)} − ${vv(s.perp)} = ${vv(s.par)} <span class="muted">(the shadow of x on V)</span></div>
                <p>Check: x∥ · n = ${nf(dot(s.par, n))}, so x∥ really is in V. You get the same x∥ from (u₁·x)u₁ + (u₂·x)u₂ with an orthonormal basis u₁, u₂ of V.</p>
                <ul class="vz-facts"><li>Projection matrix: P = I − nnᵀ/(n·n) = ${mm(Pm)}, and Px = x∥.</li>
                    <li><b>im P = V</b> (dim 2) and <b>ker P = V⊥</b> (dim 1): 2 + 1 = 3.</li></ul>`
                : `
                <p><b>V</b> = the line through w = ${plain(n)}. <b>V⊥</b> = the plane of everything perpendicular to w = ker ${mm([n])}.</p>
                <div class="mrow"><span class="k-im">x∥</span> = <span class="frac"><span>x · w</span><span>w · w</span></span> w = <span class="frac"><span>${nf(k)}</span><span>${nf(nn)}</span></span>${vv(n)} = ${vv(s.par)} <span class="muted">(the shadow of x on the line)</span></div>
                <div class="mrow"><span class="k-ker">x⊥</span> = x − x∥ = ${vv(s.x)} − ${vv(s.par)} = ${vv(s.perp)}</div>
                <p>Check: x⊥ · w = ${nf(dot(s.perp, n))}, so x⊥ really is perpendicular to the line.</p>
                <ul class="vz-facts"><li>Projection matrix: P = wwᵀ/(w·w) = ${mm(Pm)}, and Px = x∥.</li>
                    <li><b>im P = V</b> (dim 1) and <b>ker P = V⊥</b> (dim 2): 1 + 2 = 3.</li></ul>`;
            ms.check({ x: s.x.slice(), par: s.par, perp: s.perp, mode: s.mode, edge: s.edge });
        }

        let drag = null;
        svg.addEventListener("pointerdown", e => { drag = [e.clientX, e.clientY]; svg.setPointerCapture(e.pointerId); e.preventDefault(); });
        svg.addEventListener("pointermove", e => {
            if (!drag) return;
            s.yaw += (e.clientX - drag[0]) * 0.01;
            s.pitch = Math.max(-1.5, Math.min(1.5, s.pitch + (e.clientY - drag[1]) * 0.01));
            drag = [e.clientX, e.clientY]; draw();
        });
        const stop = () => { drag = null; };
        svg.addEventListener("pointerup", stop); svg.addEventListener("pointercancel", stop);
        sliders.forEach(sl => sl.addEventListener("input", () => { s.x[+sl.dataset.k] = +sl.value; draw(); }));
        el.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => {
            s.n = NORMALS[+b.dataset.n][1]; el.querySelectorAll("[data-n]").forEach(x => x.classList.toggle("on", x === b)); draw();
        }));
        el.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => {
            s.mode = b.dataset.mode; el.querySelectorAll("[data-mode]").forEach(x => x.classList.toggle("on", x === b)); draw();
        }));
        draw();
    };

    // =====================================================================================
    // basisgrid: coordinates in a basis B = (v₁, v₂), and (with T) the B-matrix
    // =====================================================================================
    const B_MISSIONS = {
        reach: { goal: "Drag the purple point x until <b>[x]<sub>B</sub> = (2, 1)</b>: 2 steps along v₁, then 1 step along v₂.",
            hint: "Follow the slanted grid: go 2 slanted squares in the v₁ direction, then 1 in the v₂ direction.",
            test: s => s.c && near(s.c[0], 2) && near(s.c[1], 1),
            why: s => `x = 2v₁ + 1v₂ = ${plain(s.x)} in ordinary coordinates, but [x]<sub>B</sub> = (2, 1): the <b>same point</b> described with a different grid. x = S[x]<sub>B</sub> where S = [v₁ v₂].` },
        move: { goal: "Now leave x where it is and drag <span class=\"k-e1\">v₁</span> somewhere else. Watch [x]<sub>B</sub>.",
            test: s => s.moved,
            why: "The point x didn't move, but its coordinates [x]<sub>B</sub> changed, because the grid you measure with changed. Coordinates belong to a basis, not to the point." },
        std: { goal: "Make B the standard basis: put v₁ on (1, 0) and v₂ on (0, 1).",
            test: s => eqA([...s.v1, ...s.v2], [1, 0, 0, 1]),
            why: "Now S = I, so [x]<sub>B</sub> = x: ordinary coordinates are just coordinates in the standard basis." },
        flat: { goal: "Put v₂ on the same line as v₁ (both nonzero).",
            test: s => !zero(s.v1) && !zero(s.v2) && near(s.v1[0] * s.v2[1] - s.v1[1] * s.v2[0], 0),
            why: "The slanted grid collapsed onto one line. v₁ and v₂ are now dependent, so they're <b>not a basis</b>: most points can't be reached and [x]<sub>B</sub> makes no sense. (det S = 0, so S<sup>−1</sup> doesn't exist.)" },
        col1: { goal: "The dashed arrows show T(v₁) and T(v₂). Drag v₁ until <b>column 1 of the B-matrix is (3, 0)</b>.",
            hint: "(3, 0) in column 1 means T(v₁) = 3v₁ + 0v₂: T(v₁) has to point the same way as v₁. Try the diagonal directions.",
            test: s => s.B && near(s.B[0][0], 3) && near(s.B[1][0], 0),
            why: s => `T(v₁) = 3v₁: T just stretches v₁ by 3. <b>Column j of the B-matrix = [T(vⱼ)]<sub>B</sub></b>, the coordinates of T(vⱼ) in the basis, not T(vⱼ) itself. Here v₁ = ${plain(s.v1)}.` },
        diag: { goal: "Now drag v₂ too, until the whole B-matrix is <b>diagonal</b> (both off-diagonal entries 0).",
            hint: "You need T(v₂) to point along v₂ as well (or exactly backwards). Try a direction perpendicular to v₁.",
            test: s => s.B && near(s.B[0][1], 0) && near(s.B[1][0], 0),
            why: s => `B = ${mm(s.B)}. In this basis T is simple: it multiplies v₁ by ${nf(s.B[0][0])} and v₂ by ${nf(s.B[1][1])}${s.B[0][0] < 0 || s.B[1][1] < 0 ? " (a negative factor flips that vector around)" : ""}, and that's all. Same T, simpler matrix: A = SBS<sup>−1</sup>, so <b>A ∼ B</b>.` },
        swap: { goal: "Get the diagonal the other way round: <b>B = diag(−1, 3)</b>.",
            hint: "Swap the roles of v₁ and v₂.",
            test: s => s.B && eqA([s.B[0][0], s.B[0][1], s.B[1][0], s.B[1][1]], [-1, 0, 0, 3]),
            why: "The order of the basis vectors decides the order on the diagonal. diag(3, −1) and diag(−1, 3) are both similar to A (and to each other): similar matrices share det (−3), trace (2) and rank." },
    };

    W.basisgrid = function (el, config, ctx) {
        const { icon } = ctx;
        const T = config.T || null;
        const s = { v1: (config.v1 || [2, 1]).slice(), v2: (config.v2 || [-1, 1]).slice(), x: (config.x || [1, 2]).slice(), moved: false };
        const v1Start = s.v1.slice();
        el.classList.add("no-pretty");
        el.innerHTML = `<div class="vz">
            <div class="vz-mission"></div>
            <div class="vz-panes one"><figure><figcaption>Drag <span class="k-e1">v₁</span>, <span class="k-e2">v₂</span>${T ? "" : " and <span class=\"k-x\">x</span>"}. The slanted grid is the B-grid.${T ? " Dashed: T(v₁), T(v₂)." : ""}</figcaption>
                <svg class="vz-svg" viewBox="-150 -150 300 300"></svg></figure></div>
            <div class="vz-read"></div>
        </div>`;
        const svg = el.querySelector("svg"), read = el.querySelector(".vz-read");
        const ms = missions(el.querySelector(".vz-mission"), (config.missions || (T ? ["col1", "diag", "swap"] : ["reach", "move", "std", "flat"])).map(id => B_MISSIONS[id]), icon);

        function draw() {
            const [p, q] = s.v1, [r, t] = s.v2, det = p * t - q * r, ok = !near(det, 0);
            const Sinv = ok ? [[t / det, -r / det], [-q / det, p / det]] : null;
            s.c = ok ? mul(Sinv, s.x) : null;
            s.B = ok && T ? (() => { const Tv1 = mul(T, s.v1), Tv2 = mul(T, s.v2), c1 = mul(Sinv, Tv1), c2 = mul(Sinv, Tv2); return [[c1[0], c2[0]], [c1[1], c2[1]]]; })() : null;

            let h = grid("gr faint");
            if (ok) for (let k = -8; k <= 8; k++) {
                const a1 = [k * p - 9 * r, k * q - 9 * t], a2 = [k * p + 9 * r, k * q + 9 * t];
                const b1 = [k * r - 9 * p, k * t - 9 * q], b2 = [k * r + 9 * p, k * t + 9 * q];
                h += line(P(a1), P(a2), "bgrid") + line(P(b1), P(b2), "bgrid");
            } else if (!zero(s.v1) || !zero(s.v2)) h += fullLine(!zero(s.v1) ? s.v1 : s.v2, "kerline");
            if (!T && s.c) { // the "steps": c₁v₁, then c₂v₂
                const mid = [s.c[0] * p, s.c[0] * q];
                h += arrow(P([0, 0]), P(mid), "e1 step", 2) + arrow(P(mid), P(s.x), "e2 step", 2);
            }
            if (T) {
                const Tv1 = mul(T, s.v1), Tv2 = mul(T, s.v2);
                h += arrow(P([0, 0]), P(Tv1), "e1 tv", 2.2) + label(P(Tv1), "T(v₁)", "k-e1") + arrow(P([0, 0]), P(Tv2), "e2 tv", 2.2) + label(P(Tv2), "T(v₂)", "k-e2");
            }
            h += arrow(P([0, 0]), P(s.v1), "e1", 3) + arrow(P([0, 0]), P(s.v2), "e2", 3);
            h += label(P(s.v1), "v₁", "k-e1") + label(P(s.v2), "v₂", "k-e2");
            if (!T) h += `<circle cx="${P(s.x)[0]}" cy="${P(s.x)[1]}" r="5" class="xdot"/>` + label(P(s.x), "x", "k-x") + handle(P(s.x), "x", "h-x");
            h += handle(P(s.v1), "v1", "h-e1") + handle(P(s.v2), "v2", "h-e2");
            svg.innerHTML = h;

            const Sm = mm([[p, r], [q, t]]);
            if (!T) {
                read.innerHTML = ok ? `
                    <div class="mrow">x = ${vv(s.x)} = <b>${nf(s.c[0])}</b>${vv(s.v1)} + <b>${nf(s.c[1])}</b>${vv(s.v2)}, so <b>[x]<sub>B</sub> = ${vv(s.c)}</b></div>
                    <p class="muted small">The red and blue step arrows on the picture are ${nf(s.c[0])}·v₁ and ${nf(s.c[1])}·v₂.</p>
                    <ul class="vz-facts"><li>S = [v₁ v₂] = ${Sm}, and x = S[x]<sub>B</sub>.</li>
                        <li>Going the other way: [x]<sub>B</sub> = S<sup>−1</sup>x = ${mm(Sinv)}${vv(s.x)} = ${vv(s.c)}.</li></ul>`
                    : `<p><b>Not a basis.</b> v₁ and v₂ are on one line (det S = ${nf(det)}), so they only reach points on that line. [x]<sub>B</sub> isn't defined.</p>`;
            } else {
                const [[a, b], [c, d]] = T;
                read.innerHTML = ok ? `
                    <div class="mrow">A = ${mm(T)} <span class="muted">(T in ordinary coordinates)</span> &nbsp; S = ${Sm}</div>
                    <div class="mrow">T(v₁) = ${vv(mul(T, s.v1))} = <b>${nf(s.B[0][0])}</b>v₁ + <b>${nf(s.B[1][0])}</b>v₂ &nbsp;→ column 1 = ${vv([s.B[0][0], s.B[1][0]])}</div>
                    <div class="mrow">T(v₂) = ${vv(mul(T, s.v2))} = <b>${nf(s.B[0][1])}</b>v₁ + <b>${nf(s.B[1][1])}</b>v₂ &nbsp;→ column 2 = ${vv([s.B[0][1], s.B[1][1]])}</div>
                    <div class="mrow"><b>B = S<sup>−1</sup>AS = ${mm(s.B)}</b> ${near(s.B[0][1], 0) && near(s.B[1][0], 0) ? `<span class="vz-badge">${icon("star")} diagonal</span>` : ""}</div>
                    <ul class="vz-facts"><li>B and A describe the same T in two different grids, so <b>A ∼ B</b> (AS = SB).</li>
                        <li>They share det (${nf(a * d - b * c)} and ${nf(s.B[0][0] * s.B[1][1] - s.B[0][1] * s.B[1][0])}) and trace (${nf(a + d)} and ${nf(s.B[0][0] + s.B[1][1])}).</li></ul>`
                    : `<p><b>Not a basis.</b> v₁ and v₂ are on one line (det S = 0), so S<sup>−1</sup> doesn't exist and there is no B-matrix.</p>`;
            }
            ms.check({ v1: s.v1.slice(), v2: s.v2.slice(), x: s.x.slice(), c: s.c, B: s.B, moved: s.moved });
        }
        draggable(svg, (id, pt) => {
            const v = [snap(pt[0], id === "x" ? 0.5 : 1), snap(pt[1], id === "x" ? 0.5 : 1)];
            if (id === "x") s.x = v;
            if (id === "v1") { s.v1 = v; if (!eqA(v, v1Start)) s.moved = true; }
            if (id === "v2") s.v2 = v;
            draw();
        });
        draw();
    };
})();
