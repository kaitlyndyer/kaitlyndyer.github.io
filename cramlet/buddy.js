// cramlet buddy: the critter each visitor picks and names.
// Saved in this browser only (localStorage). Shows a welcome picker on the first visit,
// a button in the top bar to change it, and helpers for quiz and flashcard reactions.
(function () {
    "use strict";

    const C = window.CRAMLET;
    const KEY = "cramlet.buddy";
    const listeners = [];

    const esc = s => String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
    const pick = list => list[Math.floor(Math.random() * list.length)];

    function saved() {
        try {
            const b = JSON.parse(localStorage.getItem(KEY));
            if (b && C.CRITTERS.some(c => c.id === b.critter)) return b;
        } catch (e) { /* storage unavailable: fall back to Pip */ }
        return null;
    }
    const current = () => saved() || { critter: "pip", color: null, name: "" };
    const nameOf = (b = current()) => (b.name || "").trim() || C.byId(b.critter).name;

    function save(b) {
        try { localStorage.setItem(KEY, JSON.stringify(b)); } catch (e) { /* ignore */ }
        listeners.forEach(fn => fn(b));
    }

    // Accessories unlock as the buddy levels up (see progress.js). The one picked is worn everywhere.
    const ACCESSORIES = [
        { id: "glasses", name: "Glasses", level: 2 },
        { id: "pencil", name: "Pencil", level: 3 },
        { id: "cap", name: "Grad cap", level: 4 },
    ];
    const level = () => (C.progress ? C.progress.summary().level : 1);
    const wearing = (b = current()) => { const a = ACCESSORIES.find(x => x.id === b.acc); return a && level() >= a.level ? a.id : ""; };
    function setAccessory(id) { save({ ...current(), acc: id || "" }); }

    // SVG of the current buddy with a mood: idle, happy, oops, cheer.
    function svg(mood = "idle", b = current()) {
        const c = C.byId(b.critter);
        return C.critterSVG(c, { color: b.color || c.color, mood, acc: wearing(b), label: mood === "idle" ? nameOf(b) : undefined });
    }

    // Swap the buddy inside el to a new mood and replay an animation (bounce, wobble, party).
    function react(el, mood, anim) {
        if (!el) return;
        el.innerHTML = svg(mood);
        el.classList.remove("bounce", "wobble", "party");
        if (anim) { void el.offsetWidth; el.classList.add(anim); }
    }

    // Lines the buddy says. {name} is replaced with the buddy's name.
    const LINES = {
        right: ["Nice one!", "You got it!", "Yes! Exactly right.", "{name} is impressed!", "That’s the one!"],
        wrong: ["Not quite. Let’s look at why.", "Close! Read the explanation below.", "Oops. That one’s tricky."],
        flip: ["Did you get it?", "How did you do?", "Was that what you thought?"],
        deck: ["That’s every card in the deck! {name} is proud of you."],
        cardsStart: ["Flip the card when you have an answer in mind."],
        perfect: ["{name} is so proud of you!"],
        good: ["Great work! Almost all of them."],
        keepGoing: ["{name} believes in you. Let’s try the missed ones."],
        examGreat: ["{name} is doing a happy dance. You crushed it!", "{name} knew you could do it!", "Wow! {name} wants to frame this score."],
        examGood: ["Solid exam! {name} is proud of you.", "Nice work. Just a few to review, and you’ve got this.", "{name} gives this exam two thumbs up."],
        examOkay: ["Good practice! {name} picked out what to review below.", "You’re getting there. {name} is cheering you on.", "Every miss now is one less surprise on the real exam."],
        examLow: ["Tough one! {name} is right here with you. Let’s review and try again.", "Don’t worry. {name} thinks the missed deck will help a lot.", "That’s what practice is for. {name} believes in you!"],
    };
    const say = kind => pick(LINES[kind]).replace("{name}", nameOf());

    // ---------- Top bar button ----------

    function mountChip(el) {
        if (!el) return;
        const draw = () => {
            const p = C.progress && C.progress.summary();
            el.innerHTML = `<span class="chip-av">${svg()}</span><span class="chip-name">${esc(nameOf())}</span>` +
                (p ? `<span class="chip-crumbs" title="Level ${p.level}">${C.progress.crumbIcon()}${p.crumbs.toLocaleString()}</span>` : "");
            el.title = "Change your study buddy";
        };
        draw();
        listeners.push(draw);
        if (C.progress) C.progress.onChange(r => { draw(); if (r && (r.leveledUp || r.streakDay)) cheerChip(); });
        el.addEventListener("click", () => openPicker());
    }
    const cheerChip = () => {
        const av = document.querySelector(".buddy-chip .chip-av");
        if (av) react(av, "happy", "bounce");
    };

    // ---------- Picker (welcome on first visit, then "change buddy") ----------

    function openPicker({ first = false } = {}) {
        const start = current();
        const draft = { critter: start.critter, color: start.color, name: start.name || "" };

        const dlg = document.createElement("dialog");
        dlg.className = "buddy-dialog";
        dlg.setAttribute("aria-labelledby", "bd-title");
        dlg.innerHTML = `
            <form method="dialog" class="bd">
                <header class="bd-head">
                    ${first ? `<div class="bd-logo">${C.logo()}</div>` : ""}
                    <h2 id="bd-title">${first ? "Welcome to cramlet!" : "Change your study buddy"}</h2>
                    <p>${first ? "Pick a study buddy and give it a name. It will cheer you on in quizzes and flashcards." : "Pick a different critter, color, or name."}</p>
                </header>
                <div class="bd-main">
                    <div class="bd-preview">
                        <div class="bd-big"></div>
                        <div class="bd-bubble" aria-live="polite"></div>
                    </div>
                    <div class="bd-controls">
                        <div class="bd-label" id="bd-critter-label">Critter</div>
                        <div class="bd-grid" role="group" aria-labelledby="bd-critter-label"></div>
                        <div class="bd-label" id="bd-color-label">Color</div>
                        <div class="bd-swatches" role="group" aria-labelledby="bd-color-label"></div>
                        <label class="bd-label" for="bd-name">Name</label>
                        <input type="text" id="bd-name" maxlength="16" autocomplete="off">
                    </div>
                </div>
                <p class="bd-note">Your buddy is saved in this browser. Change it anytime from the button in the top bar.</p>
                <div class="bd-actions">
                    <button type="button" class="bd-btn ghost" data-act="${first ? "skip" : "cancel"}">${first ? "Maybe later" : "Cancel"}</button>
                    <button type="submit" class="bd-btn primary" data-act="save"></button>
                </div>
            </form>`;
        document.body.appendChild(dlg);

        const $ = s => dlg.querySelector(s);
        const nameInput = $("#bd-name");
        const critter = () => C.byId(draft.critter);
        const color = () => draft.color || critter().color;

        function drawPreview(mood = "happy", anim = "bounce", line) {
            const big = $(".bd-big");
            big.innerHTML = C.critterSVG(critter(), { color: color(), mood, label: nameOf(draft) });
            big.classList.remove("bounce");
            if (anim) { void big.offsetWidth; big.classList.add(anim); }
            $(".bd-bubble").textContent = line || `Hi! I’m ${nameOf(draft)}. ${critter().bio}`;
            $('[data-act="save"]').textContent = `Study with ${nameOf(draft)}`;
        }
        function drawControls() {
            $(".bd-grid").innerHTML = C.CRITTERS.map(c => `
                <button type="button" class="bd-pick" data-id="${c.id}" aria-pressed="${c.id === draft.critter}">
                    ${C.critterSVG(c, { color: c.id === draft.critter ? color() : c.color })}<span>${c.name}</span>
                </button>`).join("");
            $(".bd-swatches").innerHTML = C.COLORS.map((col, i) => `
                <button type="button" class="bd-swatch" data-color="${col}" style="background:${col}"
                        aria-label="Color ${i + 1}" aria-pressed="${col === color()}"></button>`).join("");
            nameInput.placeholder = critter().name;
        }

        $(".bd-grid").addEventListener("click", e => {
            const b = e.target.closest("[data-id]"); if (!b) return;
            draft.critter = b.dataset.id; draft.color = null;
            drawControls(); drawPreview();
        });
        $(".bd-swatches").addEventListener("click", e => {
            const b = e.target.closest("[data-color]"); if (!b) return;
            draft.color = b.dataset.color;
            drawControls(); drawPreview();
        });
        nameInput.value = draft.name;
        nameInput.addEventListener("input", () => { draft.name = nameInput.value; drawPreview("idle", null); });

        function close() { dlg.close(); dlg.remove(); }
        // First visit: skipping keeps Pip so the welcome doesn't come back on every page.
        const skip = () => { if (first) save({ critter: "pip", color: null, name: "" }); close(); };
        $('[data-act="skip"], [data-act="cancel"]').addEventListener("click", skip);
        dlg.addEventListener("cancel", e => { e.preventDefault(); skip(); });
        $(".bd").addEventListener("submit", e => {
            e.preventDefault();
            save({ ...current(), critter: draft.critter, color: draft.color, name: draft.name.trim() });
            close();
            cheerChip();
        });

        drawControls();
        drawPreview("happy", null, first ? "Hi! Pick me, or any of my friends." : undefined);
        dlg.showModal();
        nameInput.blur();
    }

    // Show the welcome picker the first time someone visits.
    function welcomeIfNew() {
        if (saved()) return;
        try { localStorage.setItem("cramlet.test", "1"); localStorage.removeItem("cramlet.test"); }
        catch (e) { return; } // no storage: we couldn't remember the choice, so don't ask
        openPicker({ first: true });
    }

    C.buddy = { current, nameOf, svg, react, say, mountChip, cheerChip, openPicker, welcomeIfNew, onChange: fn => listeners.push(fn),
        ACCESSORIES, wearing, setAccessory };
})();
