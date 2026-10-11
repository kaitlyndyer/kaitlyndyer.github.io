// Program Design & Implementation widgets. Each registers in CRAMLET.widgets and is mounted by
// ../course/app.js as widget(el, config, ctx), where ctx has { course, concept, icon, esc, highlight, buddy, progress, celebrate, setKeyHandler }.
//
// call-graph and sequence-diagram both replay a recorded run: config.scenarios[i].run = { steps, loops } (built by nightRun in
// data/concepts/program-understanding.js). Steps: call { from, to, line, args, short, who? }, return { value? },
// throw { error, line }, unwind { error }; each has a say (the status message). loops: { from, to, label } as step indexes.
(function () {
    "use strict";

    const W = CRAMLET.widgets || (CRAMLET.widgets = {});
    const { playerHTML, bindPlayer, statusHTML, setStatus, sideHTML } = CRAMLET.player;
    let uid = 0;

    // Replays steps[0..k) and returns the call stack and what just happened.
    // Each frame: { m (method id), args, who, line (index into the method's code), err }.
    function replay(entry, steps, k) {
        const stack = [{ m: entry, args: "", line: 1 }];
        const counts = {};
        let popped = null;
        for (let i = 0; i < k; i++) {
            const s = steps[i];
            popped = null;
            if (s.kind === "call") {
                stack[stack.length - 1].line = s.line;
                stack.push({ m: s.to, args: s.args, who: s.who, line: 1 });
                const key = s.from + ">" + s.to;
                counts[key] = (counts[key] || 0) + 1;
            } else if (s.kind === "return" || s.kind === "unwind") {
                popped = stack.pop();
                if (s.kind === "unwind") stack[stack.length - 1].err = s.error;
            } else if (s.kind === "throw") {
                const top = stack[stack.length - 1];
                top.line = s.line; top.err = s.error;
            }
        }
        return { stack, counts, popped, last: k ? steps[k - 1] : null };
    }

    const isErr = s => s && (s.kind === "throw" || s.kind === "unwind");
    function statusFor(el, ctx, sc, st, k) {
        const s = st.last;
        if (!s) return setStatus(el, ctx, `${sc.note ? sc.note + " " : ""}Press <b>Step</b> or <b>Play</b> to start the run.`);
        const end = k === sc.run.steps.length;
        const tone = isErr(s) ? "no" : end ? "yes" : "";
        const react = s.kind === "throw" || (end && isErr(s)) ? "bad" : end ? "good" : "";
        setStatus(el, ctx, s.say, tone, react);
    }

    // The code of the method on top of the stack, with the current line highlighted.
    function codeHTML(ctx, methods, frame) {
        const m = methods[frame.m];
        return `<div class="run-code-head"><code>${ctx.esc(m.cls)}.${ctx.esc(m.name.replace(/\(.*\)/, ""))}(${ctx.esc(frame.args)})</code>${frame.who ? ` <span class="muted">on the ${ctx.esc(frame.who)}</span>` : ""}</div>
            <pre class="run-code"><code>${m.code.map((ln, i) => `<span class="ln-row${i === frame.line ? (frame.err ? " now err" : " now") : ""}">${ctx.highlight(ln) || " "}</span>`).join("\n")}</code></pre>`;
    }

    // The call stack, top first.
    function stackHTML(ctx, methods, stack) {
        return `<ol class="call-stack">${stack.slice().reverse().map((f, i) => {
            const m = methods[f.m];
            return `<li class="${i === 0 ? "top" : ""}${f.err ? " err" : ""}"><code>${ctx.esc(m.cls)}.${ctx.esc(m.name.replace(/\(.*\)/, ""))}(${ctx.esc(f.args)})</code>${f.who ? `<small>${ctx.esc(f.who)}</small>` : ""}${f.err ? `<small class="err-tag">${ctx.esc(f.err)}</small>` : ""}</li>`;
        }).join("")}</ol>`;
    }

    const pickRow = (esc, scenarios) => `<div class="pick-row" role="group" aria-label="Choose a run">
        ${scenarios.map((x, i) => `<button type="button" class="pick" data-sc="${i}">${esc(x.name)}</button>`).join("")}</div>`;

    // ======================================================================
    // Call graph: which methods call which, traced through a real run.
    // config: { methods: { id: { cls, name, x, y, code } }, edges: [{ from, to, recursive? }], entry, scenarios }
    // ======================================================================
    W["call-graph"] = function (el, config, ctx) {
        const { icon, esc } = ctx;
        const M = config.methods, id = "cg" + uid++;
        const NW = 176, NH = 56;
        let sc, k = 0, player, picked = null;

        el.innerHTML = `
            <div class="runner callgraph">
                ${pickRow(esc, config.scenarios)}
                <div class="diagram cg-diagram"></div>
                <p class="cg-info muted">Click a method to see what it calls and what calls it.</p>
                ${statusHTML}
                ${playerHTML(icon)}
                ${sideHTML([["Running now", `<div class="run-now"></div>`], ["Call stack (top = running)", `<div class="run-stack"></div>`]])}
            </div>`;
        const $ = s => el.querySelector(s);

        // Static drawing: nodes, edges (with count badges), and arrowheads.
        const ctr = m => [M[m].x + NW / 2, M[m].y + NH / 2];
        function border(m, tx, ty) {
            const [cx, cy] = ctr(m), dx = tx - cx, dy = ty - cy;
            const f = 1 / Math.max(Math.abs(dx) / (NW / 2), Math.abs(dy) / (NH / 2));
            return [cx + dx * f, cy + dy * f];
        }
        function edgeGeom(e) {
            if (e.from === e.to) {
                const { x, y } = M[e.from];
                return { d: `M${x + NW * 0.72},${y + NH} C${x + NW * 0.95},${y + NH + 78} ${x + NW * 0.05},${y + NH + 78} ${x + NW * 0.28},${y + NH + 6}`, bx: x + NW / 2, by: y + NH + 64 };
            }
            const [fx, fy] = ctr(e.from), [tx, ty] = ctr(e.to);
            const [x1, y1] = border(e.from, tx, ty), [x2, y2] = border(e.to, fx, fy);
            const len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
            return { d: `M${x1},${y1} L${x2 - (x2 - x1) / len * 4},${y2 - (y2 - y1) / len * 4}`, bx: (x1 + x2) / 2 + nx * 14, by: (y1 + y2) / 2 + ny * 14 };
        }
        const width = Math.max(...Object.values(M).map(m => m.x)) + NW + 12;
        const height = Math.max(...Object.values(M).map(m => m.y)) + NH + 30;
        $(".cg-diagram").innerHTML = `
            <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Call graph">
                <defs>${["plain", "hot", "rec"].map(t => `<marker id="${id}-${t}" class="cg-arrow ${t}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker>`).join("")}</defs>
                ${config.edges.map((e, i) => { const g = edgeGeom(e); return `
                    <path class="cg-edge${e.recursive ? " rec" : ""}" data-e="${i}" d="${g.d}" marker-end="url(#${id}-${e.recursive ? "rec" : "plain"})"/>
                    <g class="cg-count" data-e="${i}" transform="translate(${g.bx},${g.by})"><rect x="-17" y="-11" width="34" height="22" rx="11"/><text text-anchor="middle" dy="4.5"></text></g>`; }).join("")}
                ${Object.entries(M).map(([m, n]) => `
                    <g class="cg-node" data-m="${esc(m)}" tabindex="0" role="button" aria-label="${esc(n.cls + "." + n.name)}">
                        <rect class="cg-box" x="${n.x}" y="${n.y}" width="${NW}" height="${NH}" rx="14"/>
                        <text class="cg-cls" x="${n.x + NW / 2}" y="${n.y + 22}" text-anchor="middle">${esc(n.cls)}</text>
                        <text class="cg-name" x="${n.x + NW / 2}" y="${n.y + 41}" text-anchor="middle">${esc(n.name)}</text>
                        <g class="cg-depth" transform="translate(${n.x + 4},${n.y + 2})"><title>Running more than once at the same time (recursion)</title><rect x="-14" y="-11" width="40" height="22" rx="11"/><text x="6" dy="4.5" text-anchor="middle"></text></g>
                    </g>`).join("")}
            </svg>`;
        const edgeEls = i => el.querySelectorAll(`[data-e="${i}"]`);

        function draw() {
            const st = replay(config.entry, sc.run.steps, k), s = st.last;
            const top = st.stack[st.stack.length - 1];
            const onStack = {};
            st.stack.forEach(f => { onStack[f.m] = (onStack[f.m] || 0) + 1; });
            el.querySelectorAll(".cg-node").forEach(g => {
                const m = g.dataset.m, n = onStack[m] || 0;
                g.classList.toggle("on", n > 0);
                g.classList.toggle("now", m === top.m);
                g.classList.toggle("err", m === top.m && !!top.err);
                g.classList.toggle("picked", m === picked);
                const badge = g.querySelector(".cg-depth");
                badge.style.display = n > 1 ? "" : "none";
                badge.querySelector("text").textContent = `×${n}`;
            });
            config.edges.forEach((e, i) => {
                const n = st.counts[e.from + ">" + e.to] || 0;
                const [path, badge] = edgeEls(i);
                const hot = s && s.kind === "call" && s.from === e.from && s.to === e.to;
                const back = s && st.popped && st.popped.m === e.to && top.m === e.from;
                path.classList.toggle("hot", hot);
                path.classList.toggle("back", !!back);
                path.classList.toggle("errback", !!back && s.kind === "unwind");
                path.classList.toggle("used", n > 0);
                path.setAttribute("marker-end", `url(#${id}-${hot || back ? "hot" : e.recursive ? "rec" : "plain"})`);
                badge.style.display = n ? "" : "none";
                badge.querySelector("text").textContent = `×${n}`;
            });
            statusFor(el, ctx, sc, st, k);
            $(".run-now").innerHTML = codeHTML(ctx, M, top);
            $(".run-stack").innerHTML = stackHTML(ctx, M, st.stack);
            if (player) player.sync();
        }

        // Clicking a method: what it calls and what calls it (like the IDE's Jump to Definition / Find All References).
        function pick(m) {
            picked = picked === m ? null : m;
            const name = x => `<code>${esc(M[x].cls)}.${esc(M[x].name.replace(/\(.*\)/, "()"))}</code>`;
            const calls = config.edges.filter(e => e.from === m).map(e => name(e.to) + (e.recursive ? " (itself!)" : ""));
            const by = config.edges.filter(e => e.to === m).map(e => name(e.from) + (e.recursive ? " (itself!)" : ""));
            $(".cg-info").classList.toggle("muted", !picked);
            $(".cg-info").innerHTML = picked
                ? `${name(m)} calls ${calls.length ? calls.join(", ") : "nothing we drew"}. It is called by ${by.length ? by.join(", ") : "nothing: it’s the entry point"}.`
                : "Click a method to see what it calls and what calls it.";
            draw();
        }

        function load(i) {
            if (player) player.stop();
            sc = config.scenarios[i];
            el.querySelectorAll(".pick").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
            k = 0;
            draw();
        }

        player = bindPlayer(el, ctx, {
            pos: () => k, max: () => sc.run.steps.length, go: v => { k = v; draw(); },
            counter: (j, n) => (j === 0 ? "Not started" : `Step ${j} of ${n}`),
        });
        $(".pick-row").addEventListener("click", e => { const b = e.target.closest("[data-sc]"); if (b) load(+b.dataset.sc); });
        $(".cg-diagram").addEventListener("click", e => { const g = e.target.closest(".cg-node"); if (g) pick(g.dataset.m); });
        $(".cg-diagram").addEventListener("keydown", e => {
            const g = e.target.closest(".cg-node");
            if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pick(g.dataset.m); }
        });
        load(0);
    };

    // ======================================================================
    // Sequence diagram: the same kind of run, drawn as objects (columns) and messages over time (rows).
    // config: { methods, entry, lifelines: [class, ...], scenarios }
    // ======================================================================
    W["sequence-diagram"] = function (el, config, ctx) {
        const { icon, esc } = ctx;
        const M = config.methods, L = config.lifelines, id = "sq" + uid++;
        const COL = 150, X0 = 85, HEAD = 46, ROW = 34, BAR = 12;
        const colX = cls => X0 + L.indexOf(cls) * COL;
        let sc, k = 0, player;

        el.innerHTML = `
            <div class="runner seqdiag">
                ${pickRow(esc, config.scenarios)}
                <div class="diagram sq-diagram"><div class="sq-scroll"></div></div>
                ${statusHTML}
                ${playerHTML(icon)}
                ${sideHTML([["Running now", `<div class="run-now"></div>`], ["Call stack (top = running)", `<div class="run-stack"></div>`]])}
            </div>`;
        const $ = s => el.querySelector(s);

        // Lay out the whole run once: every message's row and endpoints, and every activation bar.
        function layout(steps) {
            const msgs = [], bars = [];
            const stack = [{ m: config.entry, bar: { cls: M[config.entry].cls, from: -0.6, to: null, depth: 0 } }];
            bars.push(stack[0].bar);
            const depthOf = cls => stack.filter(f => M[f.m].cls === cls).length;
            const xEdge = (bar, toward) => colX(bar.cls) + bar.depth * 6 + (toward >= colX(bar.cls) ? BAR / 2 : -BAR / 2);
            steps.forEach((s, i) => {
                const top = stack[stack.length - 1];
                if (s.kind === "call") {
                    const cls = M[s.to].cls;
                    const bar = { cls, from: i, to: null, depth: depthOf(cls) };
                    bars.push(bar);
                    msgs.push({ i, kind: "call", self: cls === top.bar.cls, from: top.bar, to: bar, label: s.short });
                    stack.push({ m: s.to, bar });
                } else if (s.kind === "return" || s.kind === "unwind") {
                    const f = stack.pop();
                    f.bar.to = i;
                    msgs.push({ i, kind: s.kind, self: f.bar.cls === stack[stack.length - 1].bar.cls, from: f.bar, to: stack[stack.length - 1].bar, label: s.kind === "unwind" ? s.error : (s.value || "") });
                } else if (s.kind === "throw") {
                    msgs.push({ i, kind: "throw", from: top.bar, label: s.error });
                }
            });
            return { msgs, bars, xEdge };
        }

        function draw() {
            const steps = sc.run.steps, n = steps.length;
            const { msgs, bars, xEdge } = layout(steps);
            // Each loop box gets a little extra space above its first message, for its label.
            const GAP = 24, starts = sc.run.loops.map(f => f.from);
            const rowY = i => HEAD + 30 + i * ROW + GAP * starts.filter(f => f <= i).length;
            const H = rowY(n) + 10, Wd = X0 + (L.length - 1) * COL + 90;
            const st = replay(config.entry, steps, k);
            const cur = k - 1;

            const heads = L.map(cls => `
                <g class="sq-head"><rect x="${colX(cls) - 58}" y="6" width="116" height="32" rx="10"/><text x="${colX(cls)}" y="27" text-anchor="middle">${esc(cls)}</text></g>
                <line class="sq-life" x1="${colX(cls)}" y1="38" x2="${colX(cls)}" y2="${H}"/>`).join("");

            const shownBars = bars.filter(b => b.from < k).map(b => {
                const y1 = b.from < 0 ? HEAD + 10 : rowY(b.from);
                const end = b.to === null || b.to >= k ? Math.max(cur, b.from < 0 ? 0 : b.from) + 0.6 : b.to;
                const x = colX(b.cls) - BAR / 2 + b.depth * 6;
                return `<rect class="sq-bar${b.to === null || b.to >= k ? " open" : ""}" x="${x}" y="${y1}" width="${BAR}" height="${Math.max(10, rowY(end) - y1)}" rx="3"/>`;
            }).join("");

            // Loop frames (nested ones sit a little inside their parents).
            const tabs = [];
            const loops = sc.run.loops.filter(f => f.from < k).map(f => {
                const last = Math.min(f.to === null ? n - 1 : f.to, cur);
                const inRange = msgs.filter(m => m.i >= f.from && m.i <= last);
                const xs = inRange.flatMap(m => [colX(m.from.cls), m.to ? colX(m.to.cls) : colX(m.from.cls)]);
                const level = sc.run.loops.filter(g => g !== f && g.from <= f.from && (g.to === null || (f.to !== null && g.to >= f.to))).length;
                const x1 = Math.min(...xs) - 40 + level * 8, x2 = Math.max(...xs) + 66 - level * 8;
                const y1 = rowY(f.from) - 22 - GAP + level * 4, y2 = rowY(last) + 14;
                const tw = f.label.length * 7 + 56;
                tabs.push(`<g class="sq-loop-tab"><path d="M${x1 + 1},${y1 + 1} H${x1 + tw + 8} V${y1 + 10} L${x1 + tw},${y1 + 19} H${x1 + 1} Z"/><text x="${x1 + 7}" y="${y1 + 14}">loop [${esc(f.label)}]</text></g>`);
                return `<rect class="sq-loop" x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="6"/>`;
            }).join("");

            const arrows = msgs.filter(m => m.i < k).map(m => {
                const y = rowY(m.i), cls = `sq-msg ${m.kind}${m.i === cur ? " now" : ""}`;
                if (m.kind === "throw") {
                    const x = colX(m.from.cls) + m.from.depth * 6;
                    return `<g class="${cls}"><path class="sq-x" d="M${x - 9},${y - 9} l18,18 m0,-18 l-18,18"/><text x="${x + 16}" y="${y + 5}">${esc(m.label)}</text></g>`;
                }
                const mk = `url(#${id}-${m.kind === "call" ? "solid" : "open"})`;
                if (m.self) {
                    const xa = xEdge(m.from, Infinity), xb = xEdge(m.to, Infinity);
                    const y0 = m.kind === "call" ? y - 14 : y - 12;
                    return `<g class="${cls}"><path d="M${xa},${y0} h34 v14 H${xb + 3}" marker-end="${mk}"/><text x="${Math.max(xa, xb) + 40}" y="${y - 2}">${esc(m.label)}</text></g>`;
                }
                const x1 = xEdge(m.from, colX(m.to.cls)), x2 = xEdge(m.to, colX(m.from.cls));
                return `<g class="${cls}"><path d="M${x1},${y} H${x2 + (x2 > x1 ? -2 : 2)}" marker-end="${mk}"/><text x="${(x1 + x2) / 2}" y="${y - 7}" text-anchor="middle">${esc(m.label)}</text></g>`;
            }).join("");

            const box = $(".sq-scroll");
            box.innerHTML = `
                <svg viewBox="0 0 ${Wd} ${H}" width="${Wd}" height="${H}" role="img" aria-label="Sequence diagram">
                    <defs>
                        <marker id="${id}-solid" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path class="sq-head-solid" d="M0,0 L10,5 L0,10 z"/></marker>
                        <marker id="${id}-open" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path class="sq-head-open" d="M0,0 L10,5 L0,10"/></marker>
                    </defs>
                    ${heads}${loops}${shownBars}${tabs.join("")}${arrows}
                    ${k === 0 ? `<text class="sq-empty" x="${Wd / 2}" y="${HEAD + 60}" text-anchor="middle">Messages appear here, one per step, as time moves down.</text>` : ""}
                </svg>`;
            // Keep the newest message in view.
            const y = rowY(Math.max(cur, 0));
            if (y > box.scrollTop + box.clientHeight - 40 || y < box.scrollTop + 40) box.scrollTop = Math.max(0, y - box.clientHeight / 2);

            statusFor(el, ctx, sc, st, k);
            $(".run-now").innerHTML = codeHTML(ctx, M, st.stack[st.stack.length - 1]);
            $(".run-stack").innerHTML = stackHTML(ctx, M, st.stack);
            if (player) player.sync();
        }

        function load(i) {
            if (player) player.stop();
            sc = config.scenarios[i];
            el.querySelectorAll(".pick").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
            k = 0;
            $(".sq-scroll").scrollTop = 0;
            draw();
        }

        player = bindPlayer(el, ctx, {
            pos: () => k, max: () => sc.run.steps.length, go: v => { k = v; draw(); },
            counter: (j, n) => (j === 0 ? "Not started" : `Message ${j} of ${n}`),
        });
        $(".pick-row").addEventListener("click", e => { const b = e.target.closest("[data-sc]"); if (b) load(+b.dataset.sc); });
        load(0);
    };
})();
