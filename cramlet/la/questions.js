// Linear Algebra question types for practice exams, plugged into the shared exam engine (course/exam.js).
//
//   work  A multi-part problem you solve on paper, then check against a model solution and a checklist,
//         like a grader would (1 point per checklist item).  { q, model, checklist: [...], explain }
(function () {
    "use strict";

    // ======================================================================
    // work: solve a problem on paper, then grade yourself against a model solution and a checklist
    // ======================================================================
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const icon = (name, cls) => (CRAMLET.icon ? CRAMLET.icon(name, cls) : "");
    const text = t => (CRAMLET.mathText ? CRAMLET.mathText.format(t) : esc(t || "").replace(/\n/g, "<br>"));
    const ticks = (self, n) => Array.from({ length: n }, (_, k) => !!(self && self.items && self.items[k]));
    const has = a => !!(a && (a.done || (a.text && a.text.trim())));

    function draw(q, a) {
        return `<div class="wq">
            <p class="muted">Work this out on paper, the way you would on the test, with every step shown. Jot your final answers below if you like. After you submit, you’ll compare your work with a model solution and tick what you really got.</p>
            <textarea class="pq-in" rows="6" spellcheck="false" aria-label="Your final answers" placeholder="Final answers (optional): ker(A) = span{…}, dim = …">${esc((a && a.text) || "")}</textarea>
            <label class="self-item wq-done"><input type="checkbox" ${a && a.done ? "checked" : ""}> I worked this problem out on paper.</label>
        </div>`;
    }
    function mount(el, q, saved, save) {
        if (!el) return;
        const t = el.querySelector(".pq-in"), box = el.querySelector(".wq-done input");
        if (t) {
            if (CRAMLET.mathText) CRAMLET.mathText.mount(t, { onChange: v => save({ text: v }) });
            else t.addEventListener("input", () => save({ text: t.value }));
        }
        if (box) box.addEventListener("change", () => save({ done: box.checked }));
    }
    const model = q => `<div class="callout key done">${icon("push-pin", "callout-ic")}<div class="callout-body"><span class="callout-label">Model solution</span>${q.model}</div></div>`;
    const yours = a => (a && a.text && a.text.trim() ? text(a.text) : a && a.done ? "<i>Worked on paper.</i>" : "<i>(nothing)</i>");
    function check(q, a, self) {
        const on = ticks(self, q.checklist.length);
        return `<div class="side-by-side">
                <div><div class="side-title">Your answers</div><div class="pq-yours">${yours(a)}</div></div>
                <div><div class="side-title">Model solution</div>${model(q)}</div>
            </div>
            <div class="side-title">Checklist: tick only what your work really has (1 point each)</div>
            ${q.checklist.map((c, k) => `<label class="self-item"><input type="checkbox" data-item="${esc(q.id)}" data-k="${k}" ${on[k] ? "checked" : ""}> <span>${c}</span></label>`).join("")}
            <p class="muted">A different but correct basis is fine: any basis of the same space earns the point. Be strict about arithmetic, like a grader would.</p>`;
    }
    function review(q, a, self) {
        const on = ticks(self, q.checklist.length);
        return `<div class="dq-review">
            <div class="side-by-side">
                <div><div class="side-title">Your answers</div><div class="pq-yours">${yours(a)}</div></div>
                <div><div class="side-title">Model solution</div>${model(q)}</div>
            </div>
            <div class="side-title">Your checklist</div>
            <ul class="wq-list">${q.checklist.map((c, k) => `<li class="${on[k] ? "ok" : "miss"}">${icon(on[k] ? "check-circle" : "x-circle")} ${c}</li>`).join("")}</ul>
        </div>`;
    }

    window.registerQuestionType("work", {
        section: { id: "work", name: "Show-your-work problems" },
        how: "Work it out on paper",
        points: q => q.checklist.length,
        answered: has,
        brief: (q, a) => (a && a.text && a.text.trim() ? "answers written" : a && a.done ? "worked on paper" : ""),
        grade: (q, a, self) => ({ earned: has(a) ? ticks(self, q.checklist.length).filter(Boolean).length : 0 }),
        check, draw, mount, review,
        answer: q => model(q),
    });
})();
