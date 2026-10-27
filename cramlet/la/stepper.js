// "stepper" widget: an interactive worked example. Each step asks you to predict the next move before it shows you.
//   config: { problem: html, steps: [step, …], figure?: picture spec (la/figures.js) }
//   step:   { title, ask?: html, show?: html with LA.blank(k) boxes, answers?: [answer | [answer, alternative…]],
//             choices?: [html…], answer?: index, hint: html, why: html, fig?: { add?, caption?, ask? } }
// A step with answers is fill-in-the-blank; with choices it's multiple choice; with neither it's read-only.
// Every question step needs a hint (a nudge that doesn't give it away) and a why (the full working, and what it means);
// a read-only step needs a why. A step missing one shows a visible warning instead of failing silently.
// With a figure, the picture sits beside the steps (or above them on narrow screens) and gains a piece each time you
// answer a step, so you build it yourself.
// Answers are compared as numbers when they look like numbers (so 2, 2.0, and 4/2 all match), otherwise as text
// with spaces removed and − treated as -.
(function () {
    "use strict";

    const C = (window.CRAMLET = window.CRAMLET || {});
    const W = C.widgets || (C.widgets = {});

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

    W.stepper = function (el, config, ctx) {
        const { icon } = ctx;
        const steps = config.steps;
        let at = 0;
        const result = []; // "first" (right on the first try), "later" (right after a miss), "shown" (revealed), "read"
        steps.forEach((s, i) => { if (missing(s).length) console.error(`[stepper] "${s.title}" (step ${i + 1}) is missing: ${missing(s).join(", ")}`); });

        el.innerHTML = `<div class="st${config.figure ? " has-fig" : ""}">
            ${config.problem ? `<div class="st-problem">${config.problem}</div>` : ""}
            <div class="st-bar"></div>
            <div class="st-body"><div class="st-log"></div>${config.figure ? `<aside class="st-fig" aria-label="Picture of this problem"></aside>` : ""}</div>
            <div class="st-endbox"></div>
        </div>`;
        const bar = el.querySelector(".st-bar"), log = el.querySelector(".st-log"), endbox = el.querySelector(".st-endbox");
        const fig = config.figure && window.LA && LA.figure ? LA.figure(el.querySelector(".st-fig"), config.figure, steps, ctx) : null;
        // When the picture is pinned above the steps (narrow screens), scrolling to a step leaves room for it.
        if (fig && window.ResizeObserver) {
            const figEl = el.querySelector(".st-fig"), st = el.querySelector(".st");
            new ResizeObserver(() => {
                const cs = getComputedStyle(figEl), pinned = cs.position === "sticky" && cs.order === "-1"; // CSS puts it first only when stacked
                st.style.setProperty("--fig-h", pinned ? figEl.offsetHeight + 12 + "px" : "0px");
            }).observe(figEl);
        }

        function stepHtml(s, i) {
            const kind = kindOf(s), gap = missing(s);
            return `<div class="st-step${i === at ? " now" : ""}" data-i="${i}">
                <h4>${s.title}</h4>
                ${s.ask ? `<p class="st-ask">${s.ask}</p>` : ""}
                ${s.show ? `<div class="st-show">${s.show}</div>` : ""}
                ${kind === "choice" ? `<div class="st-choices">${s.choices.map((o, k) => `<button type="button" class="st-choice" data-k="${k}">${o}</button>`).join("")}</div>` : ""}
                <div class="st-msg" aria-live="polite"></div>
                <div class="st-hintbox"></div>
                <div class="st-after"></div>
                ${gap.length ? `<p class="st-gap">This step is missing its ${gap.join(" and ")}. Please tell Claude so it can be fixed.</p>` : ""}
                <div class="st-btns">
                    ${kind === "fill" ? `<button type="button" class="btn small" data-act="check">${icon("check")} Check</button>` : ""}
                    ${kind !== "read" && s.hint ? `<button type="button" class="btn ghost small" data-act="hint">${icon("lightbulb")} Hint</button>` : ""}
                    ${kind !== "read" ? `<button type="button" class="btn ghost small" data-act="show">Show me</button>` : ""}
                    ${kind === "read" ? `<button type="button" class="btn small" data-act="next">Got it, next step →</button>` : ""}
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
            bar.querySelector('[data-act="restart"]').addEventListener("click", () => { at = 0; result.length = 0; render(); });
            endbox.innerHTML = at >= steps.length ? `<div class="st-end">${icon("star")} Done! You got ${firstTry} of ${asked} steps right on the first try.
                ${firstTry < asked ? "Start over and try the yellow ones again: getting them from memory is what makes them stick." : "Now try a homework problem like this one on paper, without looking."}</div>` : "";
            log.innerHTML = "";
            steps.slice(0, Math.min(at + 1, steps.length)).forEach((s, i) => {
                log.insertAdjacentHTML("beforeend", stepHtml(s, i));
                const box = log.lastElementChild;
                if (i < at) finish(box, s, false);
                else wire(box, s, i);
            });
            if (fig) fig.show(at, at < steps.length && kindOf(steps[at]) !== "read" ? steps[at] : null);
            const now = log.querySelector(".st-step.now");
            if (now && at > 0) {
                const pinned = parseFloat(el.querySelector(".st").style.getPropertyValue("--fig-h")) > 0;
                // Wait for la.js to redraw the step's math (it makes the steps above taller), then scroll.
                setTimeout(() => now.scrollIntoView({ block: pinned ? "start" : "nearest", behavior: "smooth" }), 80);
                const first = now.querySelector("input.blank");
                if (first) first.focus({ preventScroll: true });
            }
        }

        // Lock a step and show its explanation; with a Next button if it's the current one.
        function finish(box, s, current) {
            box.classList.remove("now");
            if (s.answers) box.querySelectorAll("input.blank").forEach(inp => { const k = +inp.dataset.b; inp.value = pretty(s.answers[k]); inp.disabled = true; inp.classList.remove("bad"); inp.classList.add("ok"); });
            if (s.choices) box.querySelectorAll(".st-choice").forEach(b => { b.disabled = true; if (+b.dataset.k === s.answer) b.classList.add("ok"); });
            box.querySelector(".st-btns").innerHTML = current ? `<button type="button" class="btn small" data-act="next">Next step →</button>` : "";
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
                finish(box, s, true);
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
                    if (+b.dataset.k === s.answer) return done(missed ? "later" : "first");
                    missed = true;
                    b.classList.add("bad"); b.disabled = true;
                    msg.className = "st-msg bad"; msg.textContent = "Not that one. Try another.";
                }));
            }
        }

        render();
    };
})();
