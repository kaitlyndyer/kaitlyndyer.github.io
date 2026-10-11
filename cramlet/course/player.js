// Shared step-through player for every course's widgets (CRAMLET.player). Every step-through widget is built
// from these parts, so they all look and behave the same: diagram → status box → controls → player → two side boxes.
// Styles: player.css. Widgets get ctx from course/app.js ({ icon, esc, buddy, setKeyHandler, … }).
(function () {
    "use strict";

    // Speed sliders draw their own filled part (see .speed input in player.css).
    document.addEventListener("input", e => {
        const r = e.target;
        if (r.matches && r.matches(".speed input")) r.style.setProperty("--fill", ((r.value - r.min) / (r.max - r.min)) * 100 + "%");
    });

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

    // ← → step one player. A page can show several (e.g. two widgets in one Details tab), so the keys go to the
    // player you last clicked in, or else the one nearest the middle of the screen.
    const live = [];
    let lastUsed = null;
    const markUsed = e => { const p = live.find(x => x.el.contains(e.target)); if (p) lastUsed = p; };
    document.addEventListener("pointerdown", markUsed, true);
    document.addEventListener("focusin", markUsed, true);
    function onKey(e) {
        for (let i = live.length - 1; i >= 0; i--) if (!document.body.contains(live[i].el)) { live[i].stop(); live.splice(i, 1); }
        if (!live.length || (e.target.matches && e.target.matches("input, textarea, select"))) return;
        const box = p => p.el.getBoundingClientRect();
        const onScreen = p => box(p).bottom > 0 && box(p).top < innerHeight;
        const offCenter = p => Math.abs((box(p).top + box(p).bottom) / 2 - innerHeight / 2);
        const p = (lastUsed && live.includes(lastUsed) && onScreen(lastUsed) && lastUsed)
            || live.filter(onScreen).sort((a, b) => offCenter(a) - offCenter(b))[0]
            || (live.includes(lastUsed) ? lastUsed : live[live.length - 1]);
        p.key(e);
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
        live.push({ el, stop, key: e => {
            if (e.key === "ArrowRight" && can()) { stop(); step(1); }
            else if (e.key === "ArrowLeft") { stop(); step(-1); }
        } });
        ctx.setKeyHandler(onKey);
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

    CRAMLET.player = { STEP_MS, playerHTML, bindPlayer, statusHTML, setStatus, sideHTML, recipeHTML };
})();
