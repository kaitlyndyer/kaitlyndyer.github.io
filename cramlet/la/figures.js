// Pictures that build up with a walkthrough (la/stepper.js). LA.figure(host, spec, steps, ctx) → { show(p, open) }
//   spec     = { type: "2d" | "3d" | "map", view: {…}, start: { add: [item…], caption } }
//   step.fig = { add?: [item…], caption?: html, ask?: html }
// show(p, open) draws start + the adds of steps 0 … p−1, with the caption of the last of those that has one.
// open is the step you're on: its fig.ask is shown as the question. Nothing a step finds appears before you answer it.
//
// Items for "2d" and "3d" (points are [x, y] or [x, y, z]):
//   { t: "vec", to, from?, c, label?, dash?, lp?: [dx, dy], anchor?, mid? }   an arrow; the label sits past the tip (or at the middle with mid), lp nudges it (px)
//   Any item can have an id: a later step's item with the same id replaces it (e.g. a label that gains its B-coordinates).
//   { t: "seg", a, b, c, dash?, label?, lp? }                   a segment, label at its middle
//   { t: "dot", at, c, label?, lp? }                            a point
//   { t: "right", at, u, v, size? }                             a right-angle mark at `at` between directions u and v
//   { t: "bgrid", v1, v2, n? }                                  2d: the slanted grid of the basis v1, v2
//   { t: "plane", v1, v2, span: [[s0, s1], [t0, t1]], label?, grid? }   3d: the patch s·v1 + t·v2 of the plane, with its grid
// Colors c: v1 (red), v2 (blue), x (purple), par (green), perp (orange), muted, ink.
// 2d view: { x: [lo, hi], y: [lo, hi] }.  3d view: { R, d: camera direction, views: [{ label, d }], tick? }.
// Items for "map" (spaces too big to draw, like ℝ⁵): see drawMap.
(function () {
    "use strict";

    const NS = 'xmlns="http://www.w3.org/2000/svg"';
    const sub = (a, b) => a.map((x, i) => x - b[i]);
    const add = (a, b) => a.map((x, i) => x + b[i]);
    const mul = (k, a) => a.map(x => k * x);
    const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
    const unit = a => { const n = Math.hypot(...a) || 1; return a.map(x => x / n); };
    const escT = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

    // ---------- drawing in screen coordinates ----------
    const f1 = x => Math.round(x * 10) / 10;
    function arrow(a, b, c, dash) {
        const d = sub(b, a), L = Math.hypot(...d);
        if (L < 2) return "";
        const u = mul(1 / L, d), n = [-u[1], u[0]], h = Math.min(11, L * 0.45), w = h * 0.5;
        const base = sub(b, mul(h, u));
        return `<line class="fg-ln c-${c}${dash ? " dash" : ""}" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(base[0])}" y2="${f1(base[1])}"/>` +
            `<polygon class="fg-hd c-${c}" points="${[b, add(base, mul(w, n)), sub(base, mul(w, n))].map(p => p.map(f1).join(",")).join(" ")}"/>`;
    }
    const seg = (a, b, c, dash, cls = "fg-ln") => `<line class="${cls} c-${c}${dash ? " dash" : ""}" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}"/>`;
    function text(p, s, c, anchor = "middle", cls = "fg-lbl") {
        return `<text class="${cls} c-${c}" x="${f1(p[0])}" y="${f1(p[1])}" text-anchor="${anchor}">${escT(s)}</text>`;
    }
    // Item labels are placed last, and one that would overlap an earlier label slides up or down until it's clear.
    function placeLabels(list) {
        const boxes = [];
        const box = (l, dy) => {
            const w = l.s.length * 7.1, x = l.anchor === "start" ? l.p[0] : l.anchor === "end" ? l.p[0] - w : l.p[0] - w / 2;
            return { x0: x - 2, x1: x + w + 2, y0: l.p[1] + dy - 12, y1: l.p[1] + dy + 3 };
        };
        const hits = b => boxes.some(o => b.x0 < o.x1 && o.x0 < b.x1 && b.y0 < o.y1 && o.y0 < b.y1);
        return list.map(l => {
            let dy = 0;
            for (const t of [0, 15, -15, 30, -30, 45, -45]) { if (!hits(box(l, t))) { dy = t; break; } }
            boxes.push(box(l, dy));
            return text([l.p[0], l.p[1] + dy], l.s, l.c, l.anchor);
        }).join("");
    }
    // A label just past point b, continuing direction dir (screen); lp nudges it.
    function tipLabel(b, dir, s, c, lp = [0, 0], fixed) {
        const u = unit(dir), p = add(add(b, mul(13, u)), lp);
        const anchor = fixed || (u[0] > 0.35 ? "start" : u[0] < -0.35 ? "end" : "middle");
        p[1] += u[1] > 0.35 ? 9 : u[1] < -0.35 ? -1 : 4;
        return { p, s, c, anchor };
    }

    // ---------- items → svg, given a projection P(point) → screen [x, y] ----------
    function drawItems(items, P, extra = {}) {
        let back = "", front = "";
        const labels = [];
        items.forEach(it => {
            if (it.t === "vec") {
                const a = P(it.from || it.to.map(() => 0)), b = P(it.to);
                front += arrow(a, b, it.c, it.dash);
                if (it.label && it.mid) labels.push({ p: add(mul(0.5, add(a, b)), it.lp || [0, -8]), s: it.label, c: it.c, anchor: it.anchor || "middle" });
                else if (it.label) labels.push(tipLabel(b, sub(b, a), it.label, it.c, it.lp, it.anchor));
            } else if (it.t === "seg") {
                const a = P(it.a), b = P(it.b);
                front += seg(a, b, it.c, it.dash);
                if (it.label) labels.push({ p: add(mul(0.5, add(a, b)), it.lp || [0, -6]), s: it.label, c: it.c, anchor: "middle" });
            } else if (it.t === "dot") {
                const p = P(it.at);
                front += `<circle class="fg-dot c-${it.c}" cx="${f1(p[0])}" cy="${f1(p[1])}" r="4.5"/>`;
                if (it.label) labels.push({ p: add(p, it.lp || [8, -8]), s: it.label, c: it.c, anchor: (it.lp && it.lp[0] < 0) ? "end" : "start" });
            } else if (it.t === "right") {
                const s = it.size || 0.4, u = mul(s, unit(it.u)), v = mul(s, unit(it.v));
                const pts = [add(it.at, u), add(add(it.at, u), v), add(it.at, v)].map(P);
                front += `<polyline class="fg-right" points="${pts.map(p => p.map(f1).join(",")).join(" ")}"/>`;
            } else if (it.t === "bgrid" && extra.bgrid) back += extra.bgrid(it);
            else if (it.t === "plane" && extra.plane) back += extra.plane(it);
        });
        return back + front + placeLabels(labels);
    }

    // ---------- 2d ----------
    function draw2d(view, items) {
        const U = view.U || 46, [x0, x1] = view.x, [y0, y1] = view.y;
        const P = p => [p[0] * U, -p[1] * U];
        let g = "";
        for (let i = Math.ceil(x0); i <= x1; i++) g += seg(P([i, y0]), P([i, y1]), "muted", false, "fg-grid");
        for (let j = Math.ceil(y0); j <= y1; j++) g += seg(P([x0, j]), P([x1, j]), "muted", false, "fg-grid");
        g += seg(P([x0, 0]), P([x1, 0]), "muted", false, "fg-axis") + seg(P([0, y0]), P([0, y1]), "muted", false, "fg-axis");
        for (let i = Math.ceil(x0); i <= x1; i++) if (i) g += text(add(P([i, 0]), [0, 14]), i < 0 ? "−" + -i : i, "muted", "middle", "fg-tick");
        for (let j = Math.ceil(y0); j <= y1; j++) if (j) g += text(add(P([0, j]), [-6, 4]), j < 0 ? "−" + -j : j, "muted", "end", "fg-tick");
        const bgrid = it => {
            const n = it.n || 6;
            let h = "";
            for (let k = -n; k <= n; k++) {
                h += seg(P(add(mul(k, it.v1), mul(-n, it.v2))), P(add(mul(k, it.v1), mul(n, it.v2))), "x", false, "fg-bgrid");
                h += seg(P(add(mul(k, it.v2), mul(-n, it.v1))), P(add(mul(k, it.v2), mul(n, it.v1))), "x", false, "fg-bgrid");
            }
            return h;
        };
        const id = "fgc" + Math.random().toString(36).slice(2, 8);
        const box = [x0 * U, -y1 * U, (x1 - x0) * U, (y1 - y0) * U];
        return `<svg ${NS} class="fg-svg no-pretty" viewBox="${box.join(" ")}" role="img">
            <defs><clipPath id="${id}"><rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"/></clipPath></defs>
            <g clip-path="url(#${id})">${g}${drawItems(items, P, { bgrid })}</g></svg>`;
    }

    // ---------- 3d (orthographic camera you can turn) ----------
    function camera(d) {
        const u0 = unit(d);
        return { th: Math.atan2(u0[1], u0[0]), ph: Math.asin(Math.max(-1, Math.min(1, u0[2]))) };
    }
    function projector(cam, k) {
        const ct = Math.cos(cam.th), st = Math.sin(cam.th), cp = Math.cos(cam.ph), sp = Math.sin(cam.ph);
        const r = [-st, ct, 0], u = [-sp * ct, -sp * st, cp];
        return p => [k * dot(p, r), -k * dot(p, u)];
    }
    function draw3d(view, items, cam) {
        const k = 150 / view.R, P = projector(cam, k), L = view.axes || view.R * 0.95, tick = view.tick || 1;
        let g = "";
        ["x₁", "x₂", "x₃"].forEach((name, i) => {
            const e = [0, 0, 0]; e[i] = 1;
            g += seg(P(mul(-L, e)), P(mul(L, e)), "muted", false, "fg-axis");
            g += arrow(P(mul(L * 0.9, e)), P(mul(L, e)), "muted");
            const al = tipLabel(P(mul(L, e)), sub(P(mul(L, e)), P([0, 0, 0])), name, "muted"); g += text(al.p, al.s, al.c, al.anchor);
            for (let t = tick; t < L * 0.9; t += tick) {
                const p = P(mul(t, e)), q = P(mul(-t, e));
                g += `<circle class="fg-tickdot" cx="${f1(p[0])}" cy="${f1(p[1])}" r="1.6"/><circle class="fg-tickdot" cx="${f1(q[0])}" cy="${f1(q[1])}" r="1.6"/>`;
            }
        });
        const plane = it => {
            const [[s0, s1], [t0, t1]] = it.span, at = (s, t) => add(mul(s, it.v1), mul(t, it.v2));
            const poly = [at(s0, t0), at(s1, t0), at(s1, t1), at(s0, t1)].map(P);
            let h = `<polygon class="fg-plane" points="${poly.map(p => p.map(f1).join(",")).join(" ")}"/>`;
            if (it.grid !== false) {
                for (let s = Math.ceil(s0); s <= s1; s++) h += seg(P(at(s, t0)), P(at(s, t1)), "x", false, "fg-bgrid");
                for (let t = Math.ceil(t0); t <= t1; t++) h += seg(P(at(s0, t)), P(at(s1, t)), "x", false, "fg-bgrid");
            }
            if (it.label) h += text(add(P(at(s1, t1)), [4, -4]), it.label, "par", "start", "fg-lbl fg-plbl");
            return h;
        };
        return `<svg ${NS} class="fg-svg fg-3d no-pretty" viewBox="-160 -160 320 320" role="img">${g}${drawItems(items, P, { plane })}</svg>`;
    }

    // ---------- map (inputs → outputs, for ℝ⁴, ℝ⁵ …) ----------
    // view: { name: "A", inDim, outDim }
    // items: { t: "strip", kinds: ["pivot" | "free", …] }   pivot/free label under each column
    //        { t: "ker", v, label? } / { t: "im", v, label? }   a vector placed in ker A / im A
    //        { t: "dim", side: "ker" | "im", n }               the dimension, once you've found it
    //        { t: "note", side: "in" | "out", html }          a short remark inside that space
    function drawMap(view, items) {
        const V = window.LA.V, A = view.name || "A";
        const of = t => items.filter(i => i.t === t);
        const dim = side => { const d = of("dim").find(i => i.side === side); return d ? d.n : "?"; };
        const vecs = side => of(side).map(i => `<span class="fg-mv">${V(...i.v)}${i.label ? `<small>${i.label}</small>` : ""}</span>`).join("") || `<span class="fg-empty">not found yet</span>`;
        const note = side => of("note").filter(i => i.side === side).map(i => `<p class="fg-note">${i.html}</p>`).join("");
        const strip = of("strip").pop();
        return `<div class="fg-map">
            <div class="fg-space in"><div class="fg-sh">Inputs x live in ℝ<sup>${view.inDim}</sup> <small>(x has ${view.inDim} entries)</small></div>
                <div class="fg-subsp ker"><div class="fg-sh">ker ${A} <small>dim ${dim("ker")}</small></div><div class="fg-vs">${vecs("ker")}</div>
                    <p class="fg-note">the inputs ${A} sends to 0</p></div>
                ${note("in")}
            </div>
            <div class="fg-arr" aria-hidden="true"><span>${A}</span>→</div>
            <div class="fg-space out"><div class="fg-sh">Outputs ${A}x live in ℝ<sup>${view.outDim}</sup> <small>(${A}x has ${view.outDim} entries)</small></div>
                <div class="fg-subsp im"><div class="fg-sh">im ${A} <small>dim ${dim("im")}</small></div><div class="fg-vs">${vecs("im")}</div>
                    <p class="fg-note">every output ${A} can actually reach</p></div>
                ${note("out")}
            </div>
            ${strip ? `<div class="fg-strip">${strip.kinds.map((k, i) => `<span class="${k}"><b>col ${i + 1}</b>${k}</span>`).join("")}</div>` : ""}
        </div>`;
    }

    window.LA = window.LA || {};
    window.LA.figure = function (host, spec, steps, ctx) {
        const view = spec.view || {};
        let cam = spec.type === "3d" ? camera(view.d || [1, 0.6, 0.5]) : null;
        let last = { p: 0, open: null }, anim = 0;
        host.innerHTML = `
            <div class="fg-head">Picture <small>${spec.type === "3d" ? "drag to turn it" : "it fills in as you answer"}</small></div>
            <div class="fg-canvas"></div>
            ${spec.type === "3d" ? `<div class="fg-views">${(view.views || []).map((v, i) => `<button type="button" class="vz-chip" data-v="${i}">${v.label}</button>`).join("")}</div>` : ""}
            <div class="fg-cap" aria-live="polite"></div>`;
        const canvas = host.querySelector(".fg-canvas"), cap = host.querySelector(".fg-cap");

        function itemsAt(p) {
            let items = [...((spec.start && spec.start.add) || [])];
            for (let i = 0; i < p && i < steps.length; i++) if (steps[i].fig && steps[i].fig.add) items = items.concat(steps[i].fig.add);
            // A later item with the same id replaces an earlier one (e.g. a label that gets its number).
            const seen = new Map();
            items.forEach((it, i) => seen.set(it.id || "#" + i, it));
            return [...seen.values()];
        }
        function captionAt(p) {
            for (let i = Math.min(p, steps.length) - 1; i >= 0; i--) if (steps[i].fig && steps[i].fig.caption) return steps[i].fig.caption;
            return (spec.start && spec.start.caption) || "";
        }
        function paint() {
            const items = itemsAt(last.p);
            canvas.innerHTML = spec.type === "2d" ? draw2d(view, items) : spec.type === "3d" ? draw3d(view, items, cam) : drawMap(view, items);
        }
        function show(p, open) {
            last = { p, open };
            paint();
            const ask = open && open.fig && open.fig.ask;
            cap.innerHTML = `<p>${captionAt(p)}</p>${ask ? `<p class="fg-ask"><b>Your turn:</b> ${ask}</p>` : ""}`;
        }

        if (spec.type === "3d") {
            let drag = null;
            canvas.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); cancelAnimationFrame(anim); });
            canvas.addEventListener("pointermove", e => {
                if (!drag) return;
                cam.th -= (e.clientX - drag.x) * 0.01;
                cam.ph = Math.max(-1.45, Math.min(1.45, cam.ph + (e.clientY - drag.y) * 0.01));
                drag = { x: e.clientX, y: e.clientY };
                paint();
            });
            const end = () => { drag = null; };
            canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
            host.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => {
                const to = camera(view.views[+b.dataset.v].d), from = { ...cam };
                let dth = to.th - from.th;
                dth = Math.atan2(Math.sin(dth), Math.cos(dth));
                const t0 = performance.now();
                cancelAnimationFrame(anim);
                const step = now => {
                    const t = Math.min(1, (now - t0) / 600), e = t * t * (3 - 2 * t);
                    cam = { th: from.th + dth * e, ph: from.ph + (to.ph - from.ph) * e };
                    paint();
                    if (t < 1) anim = requestAnimationFrame(step);
                };
                anim = requestAnimationFrame(step);
            }));
        }
        return { show };
    };
})();
