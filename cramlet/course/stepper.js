// "stepper" widget: an interactive worked example. Each step asks you to predict the next move before it shows you.
// Shared by every course (Linear Algebra walkthroughs, ToC reduction walkthroughs and "Your turn" boxes).
//   config: { problem?: html, steps: [step, …], figure?: picture spec, award?: id, done?: html }
//   step:   { title, ask?: html, show?: html with blank boxes (<input class="blank" data-b="k">, e.g. LA.blank(k)),
//             answers?: [answer | [answer, alternative…]], choices?: [html…], answer?: index, whys?: [html | null, …],
//             hint: html, why: html, fig?: anything the figure understands }
// A step with answers is fill-in-the-blank; with choices it's multiple choice; with neither it's read-only.
// Every question step needs a hint (a nudge that doesn't give it away) and a why (the full working, and what it means);
// a read-only step needs a why. A step missing one shows a visible warning instead of failing silently.
// whys (optional, multiple choice only): one line per choice, shown when you pick that wrong choice.
// Choices are shuffled each time the walkthrough starts; keepOrder: true on a step keeps them as written.
// figure: a picture beside the steps (or above them on narrow screens) that changes as you answer. The course provides it:
//   config.figure.provider names a function registered in CRAMLET.stepFigures; with no provider, LA.figure is used.
//   A provider is (el, spec, steps, ctx) => { show(i, pendingStep) }, where i = how many steps are finished.
// award: when every step is finished, the visitor earns a "challenge" award with this id (once per day, like the others).
// Several walkthroughs in one widget: config = { walks: [{ id, name, intro?, config }, …] } shows a picker.
// Answers are compared as numbers when they look like numbers (so 2, 2.0, and 4/2 all match), otherwise as text
// with spaces removed and − treated as -.
(function () {
    "use strict";

    const C = (window.CRAMLET = window.CRAMLET || {});
    const W = C.widgets || (C.widgets = {});
    const FIGS = C.stepFigures || (C.stepFigures = {});

    const clean = s => String(s).trim().replace(/−/g, "-").replace(/\s+/g, "").toLowerCase();
    const asNum = s => {
        const m = /^(-?\d+(?:\.\d+)?)(?:\/(-?\d+(?:\.\d+)?))?$/.exec(clean(s));
        return m ? Number(m[1]) / (m[2] === undefined ? 1 : Number(m[2])) : null;
    };
    const same = (given, want) => [].concat(want).some(w => {
        const a = asNum(given), b = asNum(w);
        return a !== null && b !== null ? Math.abs(a - b) < 1e-9 : clean(given) === clean(w) && clean(given) !== "";
    });
    const pretty = w => String([].concat(w)[0]).replace(/-/g, "−");
    const kindOf = s => (s.answers ? "fill" : s.choices ? "choice" : "read");
    const missing = s => (kindOf(s) === "read" ? (s.why ? [] : ["explanation"]) : ["hint", "why"].filter(k => !s[k]).map(k => (k === "why" ? "explanation" : k)));

    function figureFor(spec) {
        if (!spec) return null;
        if (spec.provider) return FIGS[spec.provider] || null;
        return window.LA && LA.figure ? LA.figure : null;
    }

    W.stepper = function (el, config, ctx) {
        if (config.walks) return picker(el, config, ctx);
        const { icon } = ctx;
        const steps = config.steps;
        let at = 0, awarded = false;
        const result = []; // "first" (right on the first try), "later" (right after a miss), "shown" (revealed), "read"
        steps.forEach((s, i) => { if (missing(s).length) console.error(`[stepper] "${s.title}" (step ${i + 1}) is missing: ${missing(s).join(", ")}`); });

        const makeFig = figureFor(config.figure);
        el.innerHTML = `<div class="st${makeFig ? " has-fig" : ""}">
            ${config.problem ? `<div class="st-problem">${config.problem}</div>` : ""}
            <div class="st-bar"></div>
            <div class="st-body"><div class="st-log"></div>${makeFig ? `<aside class="st-fig" aria-label="Picture of this problem"></aside>` : ""}</div>
            <div class="st-endbox"></div>
        </div>`;
        const bar = el.querySelector(".st-bar"), log = el.querySelector(".st-log"), endbox = el.querySelector(".st-endbox");
        const fig = makeFig ? makeFig(el.querySelector(".st-fig"), config.figure, steps, ctx) : null;
        // When the picture is pinned above the steps (narrow screens), scrolling to a step leaves room for it.
        if (fig && window.ResizeObserver) {
            const figEl = el.querySelector(".st-fig"), st = el.querySelector(".st");
            new ResizeObserver(() => {
                const cs = getComputedStyle(figEl), pinned = cs.position === "sticky" && cs.order === "-1"; // CSS puts it first only when stacked
                st.style.setProperty("--fig-h", pinned ? figEl.offsetHeight + 12 + "px" : "0px");
            }).observe(figEl);
        }
        const isLast = i => i === steps.length - 1;
        // Choices are shown in a fresh random order each time the walkthrough starts (so the right answer isn't
        // always in the same spot), unless the step sets keepOrder (e.g. a fixed "Countable / Uncountable" pair).
        let order = [];
        const shuffle = () => {
            order = steps.map(s => {
                const idx = (s.choices || []).map((_, k) => k);
                if (!s.keepOrder) for (let k = idx.length - 1; k > 0; k--) { const r = Math.floor(Math.random() * (k + 1)); [idx[k], idx[r]] = [idx[r], idx[k]]; }
                return idx;
            });
        };
        shuffle();

        function stepHtml(s, i) {
            const kind = kindOf(s), gap = missing(s);
            return `<div class="st-step${i === at ? " now" : ""}" data-i="${i}">
                <h4>${s.title}</h4>
                ${s.ask ? `<p class="st-ask">${s.ask}</p>` : ""}
                ${s.show ? `<div class="st-show">${s.show}</div>` : ""}
                ${kind === "choice" ? `<div class="st-choices">${order[i].map(k => `<button type="button" class="st-choice" data-k="${k}">${s.choices[k]}</button>`).join("")}</div>` : ""}
                <div class="st-msg" aria-live="polite"></div>
                <div class="st-hintbox"></div>
                <div class="st-after"></div>
                ${gap.length ? `<p class="st-gap">This step is missing its ${gap.join(" and ")}. Please tell Claude so it can be fixed.</p>` : ""}
                <div class="st-btns">
                    ${kind === "fill" ? `<button type="button" class="btn small" data-act="check">${icon("check")} Check</button>` : ""}
                    ${kind !== "read" && s.hint ? `<button type="button" class="btn ghost small" data-act="hint">${icon("lightbulb")} Hint</button>` : ""}
                    ${kind !== "read" ? `<button type="button" class="btn ghost small" data-act="show">Show me</button>` : ""}
                    ${kind === "read" ? `<button type="button" class="btn small" data-act="next">${isLast(i) ? "Finish" : "Got it, next step →"}</button>` : ""}
                </div>
            </div>`;
        }

        const whyHtml = s => (s.why ? `<div class="st-why"><b>Why:</b> ${s.why}</div>` : "");

        function render() {
            const firstTry = result.filter(r => r === "first").length;
            const asked = steps.filter(s => s.answers || s.choices).length;
            bar.innerHTML = `
                <span>Step ${Math.min(at + 1, steps.length)} of ${steps.length}</span>
                <span class="st-dots">${steps.map((_, i) => `<span class="${i < at ? (result[i] === "shown" ? "shown" : "done") : i === at ? "now" : ""}"></span>`).join("")}</span>
                <button type="button" class="btn ghost small" data-act="restart">${icon("arrow-clockwise")} Start over</button>`;
            bar.querySelector('[data-act="restart"]').addEventListener("click", () => { at = 0; result.length = 0; shuffle(); render(); });
            const end = at >= steps.length;
            endbox.innerHTML = end ? `<div class="st-end">${icon("star")} Done! You got ${firstTry} of ${asked} steps right on the first try.
                ${firstTry < asked ? " Start over and try the yellow ones again: getting them from memory is what makes them stick." : ""}
                ${config.done ? `<div class="st-done">${config.done}</div>` : firstTry === asked ? " Now try one like it on paper, without looking." : ""}</div>` : "";
            if (end && !awarded && config.award && ctx.progress) {
                awarded = true;
                ctx.progress.award("challenge", `${ctx.course}:${config.award}`, { at: endbox.firstElementChild });
            }
            log.innerHTML = "";
            steps.slice(0, Math.min(at + 1, steps.length)).forEach((s, i) => {
                log.insertAdjacentHTML("beforeend", stepHtml(s, i));
                const box = log.lastElementChild;
                if (i < at) finish(box, s, i, false);
                else wire(box, s, i);
            });
            if (fig) fig.show(at, at < steps.length && kindOf(steps[at]) !== "read" ? steps[at] : null);
            const now = log.querySelector(".st-step.now");
            if (now && at > 0) {
                const pinned = parseFloat(el.querySelector(".st").style.getPropertyValue("--fig-h")) > 0;
                // Wait for any math formatting to redraw the steps above (it makes them taller), then scroll.
                setTimeout(() => now.scrollIntoView({ block: pinned ? "start" : "nearest", behavior: "smooth" }), 80);
                const first = now.querySelector("input.blank");
                if (first) first.focus({ preventScroll: true });
            } else if (end && at > 0) {
                setTimeout(() => endbox.scrollIntoView({ block: "nearest", behavior: "smooth" }), 80);
            }
        }

        // Lock a step and show its explanation; with a Next button if it's the current one.
        function finish(box, s, i, current) {
            box.classList.remove("now");
            if (s.answers) box.querySelectorAll("input.blank").forEach(inp => { const k = +inp.dataset.b; inp.value = pretty(s.answers[k]); inp.disabled = true; inp.classList.remove("bad"); inp.classList.add("ok"); });
            if (s.choices) box.querySelectorAll(".st-choice").forEach(b => { b.disabled = true; if (+b.dataset.k === s.answer) b.classList.add("ok"); });
            box.querySelector(".st-btns").innerHTML = current ? `<button type="button" class="btn small" data-act="next">${isLast(i) ? "Finish" : "Next step →"}</button>` : "";
            box.querySelector(".st-after").innerHTML = whyHtml(s);
            const next = box.querySelector('[data-act="next"]');
            if (next) next.addEventListener("click", () => { at++; render(); });
        }

        function wire(box, s, i) {
            let missed = false;
            const msg = box.querySelector(".st-msg");
            const done = how => {
                result[i] = how;
                msg.className = "st-msg ok";
                msg.textContent = how === "shown" ? "Here’s the answer. Read why it works below, then go on." : "Yes! Read why below, then go on.";
                finish(box, s, i, true);
                if (fig) fig.show(i + 1, null);
            };
            if (kindOf(s) === "read") {
                box.querySelector(".st-after").innerHTML = whyHtml(s);
                if (fig) fig.show(i + 1, null);
                box.querySelector('[data-act="next"]').addEventListener("click", () => { result[i] = "read"; at++; render(); });
                return;
            }
            const act = (name, fn) => { const b = box.querySelector(`[data-act="${name}"]`); if (b) b.addEventListener("click", fn); };
            act("hint", () => { box.querySelector(".st-hintbox").innerHTML = `<div class="st-hint"><b>Hint:</b> ${s.hint}</div>`; });
            act("show", () => done("shown"));
            if (s.answers) {
                const inputs = [...box.querySelectorAll("input.blank")];
                const check = () => {
                    let all = true;
                    inputs.forEach(inp => {
                        const ok = same(inp.value, s.answers[+inp.dataset.b]);
                        inp.classList.toggle("ok", ok); inp.classList.toggle("bad", !ok && inp.value.trim() !== "");
                        if (!ok) all = false;
                    });
                    if (all) return done(missed ? "later" : "first");
                    missed = true;
                    msg.className = "st-msg bad";
                    msg.textContent = inputs.some(x => !x.value.trim()) ? "Fill in every box first (red ones are wrong so far)." : "Not quite: the red boxes are off. Try again, or take a hint.";
                };
                act("check", check);
                inputs.forEach(inp => inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); check(); } }));
            } else {
                box.querySelectorAll(".st-choice").forEach(b => b.addEventListener("click", () => {
                    const k = +b.dataset.k;
                    if (k === s.answer) return done(missed ? "later" : "first");
                    missed = true;
                    b.classList.add("bad"); b.disabled = true;
                    msg.className = "st-msg bad";
                    msg.innerHTML = s.whys && s.whys[k] ? `Not that one. ${s.whys[k]}` : "Not that one. Try another.";
                }));
            }
        }

        render();
    };

    // A row of chips to choose between several walkthroughs; the chosen one mounts below.
    function picker(el, config, ctx) {
        let cur = -1;
        el.innerHTML = `<div class="st-set">
            <div class="pick-row st-picks" role="group" aria-label="Choose a walkthrough"></div>
            <div class="st-sub"></div>
        </div>`;
        const picks = el.querySelector(".st-picks"), sub = el.querySelector(".st-sub");
        function load(i) {
            cur = i;
            picks.innerHTML = config.walks.map((w, j) => `<button type="button" class="pick" data-w="${j}" aria-pressed="${j === cur}"><span>${w.name}</span></button>`).join("");
            const w = config.walks[cur];
            sub.innerHTML = w.intro ? `<div class="prose st-walk-intro">${w.intro}</div>` : "";
            const box = document.createElement("div");
            sub.appendChild(box);
            W.stepper(box, w.config, ctx);
        }
        picks.addEventListener("click", e => { const b = e.target.closest("[data-w]"); if (b && +b.dataset.w !== cur) load(+b.dataset.w); });
        load(0);
    }
})();
