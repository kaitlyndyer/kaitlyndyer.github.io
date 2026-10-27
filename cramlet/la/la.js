// Linear Algebra helpers, loaded before the course data.
//
//   LA.M(rows, { aug })   a matrix in brackets: M([[1, 2], [3, 4]]). aug: k draws a bar after column k (augmented matrix).
//   LA.V(a, b, c, …)      a column vector.
//   LA.set(v1, v2, …)     a set of vectors in braces: { v1, v2 }.
//   LA.frac(n, d)         a stacked fraction.
//   LA.blank(k)           an answer box for the step-by-step walkthroughs (la/stepper.js); put it in a matrix cell or text.
// Negative numbers get a real minus sign, and "a/b" entries are drawn as stacked fractions.
//
// Math written as plain text anywhere on the page is redrawn the way you'd write it on paper (LA.prettify):
//   [[1, 2], [3, 4]]  → a bracketed matrix          (1, −2, 3) → a column vector (numbers only, not f(1, 2))
//   1/(ad − bc), (x·w)/(w·w) → stacked fractions
//   [x]_B, proj_V, u_m, T(e_{m+1})  → real subscripts
// It runs on everything the app draws, through a MutationObserver, so data files can stay plain text.
(function () {
    "use strict";

    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const frac = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
    const SIMPLE_FRAC = /^([−-]?)(\d+)\/(\d+)$/;
    function num(x) {
        if (typeof x === "number") return x < 0 ? "−" + -x : String(x);
        const s = String(x), f = SIMPLE_FRAC.exec(s);
        if (f) return (f[1] ? "−" : "") + frac(f[2], f[3]);
        return s.replace(/^-/, "−");
    }
    function M(rows, opts = {}) {
        const cols = rows[0].length;
        const cells = rows.map(r => r.map((x, j) => `<span${opts.aug === j + 1 ? ' class="bar"' : ""}>${num(x)}</span>`).join("")).join("");
        return `<span class="mat" style="--cols:${cols}">${cells}</span>`;
    }
    const V = (...xs) => M(xs.map(x => [x]));
    const set = (...vs) => `<span class="vset">{ ${vs.join(", ")} }</span>`;
    const blank = k => `<input class="blank" data-b="${k}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Answer box ${k + 1}">`;

    // ---------- Plain-text math → paper-style math ----------
    // Matrices: [[a, b], [c, d]] (rows of comma-separated entries without brackets inside).
    const MATRIX = /\[\[[^\[\]]+\](?:,\s*\[[^\[\]]+\])*\]/g;
    // Number entries: −2, 3, 1/3, ½, 0.6 …
    const ENTRY = "[−-]?(?:\\d+(?:[./]\\d+)?|[½⅓⅔¼¾⅑]|\\d*√\\d+)";
    // A numeric tuple (2+ entries), not right after a letter, digit, or closing bracket (so f(1, 2) and diag(1, 0) stay).
    const TUPLE = new RegExp(`(^|[^\\p{L}\\p{N}\\)\\]_⁻])\\((${ENTRY}(?:,\\s*${ENTRY})+)\\)`, "gu");
    // Fractions: 1/(…), (…)/(…), (…)/x where x is a short token like ‖vᵢ‖².
    const FRAC = /(\([^()]{1,40}\)|\b\d+)\/(\([^()]{1,40}\)|[‖\p{L}\p{N}ᵢⱼₖ₁₂₃²]+)/gu;
    // Typed subscripts: a letter or closing bracket, "_", then a short word or {group}.
    const SUB = /([\p{L}\]\)ᵀ])_(\{[^{}]{1,12}\}|[\p{L}\p{N}]{1,3})/gu;
    const strip = s => (s[0] === "(" && s[s.length - 1] === ")" ? s.slice(1, -1) : s);

    function convert(text) {
        let changed = false;
        const parts = [];
        // Tokenize: matrices first, then tuples, then fractions, all on the escaped text.
        let html = esc(text);
        html = html.replace(MATRIX, m => {
            changed = true;
            const rows = m.slice(1, -1).match(/\[[^\[\]]+\]/g).map(r => r.slice(1, -1).split(",").map(x => x.trim()));
            if (rows.some(r => r.length !== rows[0].length)) return m;
            return M(rows);
        });
        html = html.replace(TUPLE, (all, pre, body) => { changed = true; return pre + V(...body.split(",").map(x => x.trim())); });
        html = html.replace(FRAC, (all, n, d) => {
            if (/^\d+$/.test(n) && /^\d+$/.test(d)) return all; // leave 3/4 in prose alone
            changed = true;
            return frac(strip(n), strip(d));
        });
        html = html.replace(SUB, (all, base, x) => { changed = true; return `${base}<sub>${x.replace(/^\{|\}$/g, "")}</sub>`; });
        html = html.replace(/ℝ/g, () => { changed = true; return '<span class="bb">ℝ</span>'; });
        parts.push(html);
        return changed ? parts.join("") : null;
    }

    const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SELECT", "OPTION", "CODE", "PRE", "TITLE"]);
    function prettify(root) {
        if (!root) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(n) {
                if (!n.nodeValue || !/[\[(\/_ℝ]/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
                for (let p = n.parentNode; p && p !== root.parentNode; p = p.parentNode) {
                    if (p.nodeType === 1 && (SKIP.has(p.tagName) || p.classList.contains("mat") || p.classList.contains("frac") || p.classList.contains("bb") || p.classList.contains("no-pretty") || p.isContentEditable)) return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            },
        });
        const todo = [];
        while (walker.nextNode()) todo.push(walker.currentNode);
        todo.forEach(n => {
            const html = convert(n.nodeValue);
            if (html === null) return;
            const span = document.createElement("span");
            span.className = "pm";
            span.innerHTML = html;
            n.parentNode.replaceChild(span, n);
        });
    }

    let queued = false;
    function watch() {
        const run = () => { queued = false; prettify(document.body); };
        new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(run); } })
            .observe(document.body, { childList: true, subtree: true, characterData: true });
        run();
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch);
    else watch();

    window.LA = { M, V, set, num, frac, blank, prettify, convert };
})();
