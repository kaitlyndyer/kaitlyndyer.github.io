// Math-friendly free text, shared by every course (CRAMLET.mathText). Used wherever you type a proof or explanation.
//
//   format(text) → HTML: line breaks kept, and the usual typed shorthands shown as real math:
//       0^p, 0^2p, 0^(p-k), 0^{p+1}  →  superscripts      q_0, q_{acc}  →  subscripts
//       >=  <=  !=  =>  ->  →  ≥ ≤ ≠ ⇒ →
//   mount(textarea, { onChange }) adds a symbol bar above the box and a live preview below it, and turns
//   >= <= != => -> into ≥ ≤ ≠ ⇒ → as you type (so the box itself already reads well).
(function () {
    "use strict";

    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    // Typed two-character shorthands, replaced as you type. Order matters: "<=" before "=>" so "<=>" isn't split oddly.
    const TYPED = [[">=", "≥"], ["<=", "≤"], ["!=", "≠"], ["=>", "⇒"], ["->", "→"]];
    const minus = s => s.replace(/-/g, "−");

    function format(text) {
        let h = esc(text || "");
        TYPED.forEach(([a, b]) => { h = h.split(esc(a)).join(b); });
        // Superscripts: ^{…} or ^(…) for anything longer, else digits with an optional variable (0^2p), or one letter (0^p).
        h = h.replace(/\^\{([^}]*)\}/g, (_, x) => `<sup>${minus(x)}</sup>`)
             .replace(/\^\(([^)]*)\)/g, (_, x) => `<sup>${minus(x)}</sup>`)
             .replace(/\^(\d+[pnkmij]?|[A-Za-z*+])/g, (_, x) => `<sup>${x}</sup>`);
        // Subscripts: q_0, q_{accept}
        h = h.replace(/_\{([^}]*)\}/g, "<sub>$1</sub>").replace(/_([A-Za-z0-9]+)/g, "<sub>$1</sub>");
        return h.replace(/\n/g, "<br>");
    }

    const KEYS = [
        ["≤", "≤"], ["≥", "≥"], ["≠", "≠"], ["∈", "∈"], ["∉", "∉"], ["ε", "ε"], ["∪", "∪"], ["∩", "∩"], ["Σ", "Σ"], ["∅", "∅"], ["⇒", "⇒"], ["·", "·"],
    ];

    function insert(t, text, back = 0) {
        const a = t.selectionStart ?? t.value.length, b = t.selectionEnd ?? a;
        t.value = t.value.slice(0, a) + text + t.value.slice(b);
        const at = a + text.length - back;
        t.focus(); t.setSelectionRange(at, at);
        t.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function mount(t, opts = {}) {
        if (!t || t.dataset.mathText) return;
        t.dataset.mathText = "1";
        const bar = document.createElement("div");
        bar.className = "mt-bar";
        bar.setAttribute("role", "toolbar");
        bar.setAttribute("aria-label", "Insert a math symbol");
        bar.innerHTML = KEYS.map(([k, ins]) => `<button type="button" class="mt-key" data-ins="${esc(ins)}" title="Insert ${esc(k)}">${esc(k)}</button>`).join("")
            + `<button type="button" class="mt-key wide" data-sup title="Superscript: type the exponent inside ^( )">x<sup>n</sup></button>`
            + `<button type="button" class="mt-key wide" data-sub title="Subscript, like q_0">x<sub>0</sub></button>`;
        const help = document.createElement("p");
        help.className = "mt-help muted";
        help.innerHTML = "Shortcuts: <code>0^p</code> → 0<sup>p</sup>, <code>0^(p-k)</code> → 0<sup>p−k</sup>, <code>q_0</code> → q<sub>0</sub>, and <code>&gt;=</code> <code>&lt;=</code> <code>!=</code> <code>=&gt;</code> become ≥ ≤ ≠ ⇒ as you type.";
        const prev = document.createElement("div");
        prev.className = "mt-preview";
        prev.innerHTML = `<div class="side-title">Preview</div><div class="mt-out"></div>`;
        t.before(bar);
        t.after(prev);
        t.after(help);
        const out = prev.querySelector(".mt-out");
        const draw = () => { out.innerHTML = t.value.trim() ? format(t.value) : `<span class="muted">Your answer, formatted, appears here.</span>`; };

        bar.addEventListener("mousedown", e => { if (e.target.closest(".mt-key")) e.preventDefault(); }); // keep the caret in the box
        bar.addEventListener("click", e => {
            const b = e.target.closest(".mt-key");
            if (!b || t.readOnly) return;
            if (b.dataset.sup !== undefined) insert(t, "^()", 1);
            else if (b.dataset.sub !== undefined) insert(t, "_");
            else insert(t, b.dataset.ins);
        });
        t.addEventListener("input", () => {
            const v = t.value, caret = t.selectionStart;
            let nv = v, shift = 0;
            TYPED.forEach(([a, b]) => {
                let i = nv.indexOf(a);
                while (i >= 0) {
                    if (i < caret + shift) shift -= a.length - b.length;
                    nv = nv.slice(0, i) + b + nv.slice(i + a.length);
                    i = nv.indexOf(a, i + b.length);
                }
            });
            if (nv !== v) { t.value = nv; const c = Math.max(0, caret + shift); t.setSelectionRange(c, c); }
            draw();
            if (opts.onChange) opts.onChange(t.value);
        });
        draw();
    }

    window.CRAMLET = Object.assign(window.CRAMLET || {}, { mathText: { format, mount } });
})();
