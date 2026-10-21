// Recipe Box (a Test Kitchen tool): how to think through each kind of problem, shared by every course.
//   #/recipes       every recipe as a quick card (prints as a cheat sheet)
//   #/recipes/<id>  one recipe's full walkthrough, with a worked example
// A course registers its recipes with registerRecipes([...]) from <course>/data/recipes.js. Each recipe:
//   { id, c: concept id (for its color), title, icon, when: "the kind of question it's for",
//     card: { steps: [html…], table?: { head, rows }, check: [html…] },     the quick card
//     full: { intro, steps: [{ t, html }], example: { title, html, machines?: [{ label, machine }] },
//             traps: [html…], practice: [{ label, href }] },                  the walkthrough
//     for: { types: [question types], concepts: [concept ids] } }           which exam questions link to it
(function () {
    "use strict";

    const bank = [];
    window.registerRecipes = list => { bank.push(...list); };

    // The recipe an exam question should point to: by question type first, then by concept.
    function forQuestion(q) {
        return bank.find(r => r.for && (r.for.types || []).includes(q.type))
            || bank.find(r => r.for && (r.for.concepts || []).includes(q.concept));
    }
    const linkFor = (q, icon) => { const r = forQuestion(q); return r ? `<a class="btn small" href="#/recipes/${r.id}">${icon("scroll")} Recipe: ${r.title}</a>` : ""; };

    function render(main, ctx, parts) {
        const { S, esc, icon, conceptById } = ctx;
        const K = CRAMLET.kitchen;
        const color = r => (conceptById[r.c] || {}).color || "var(--brand)";
        const r = parts[1] && bank.find(x => x.id === parts[1]);

        const card = x => `
            <article class="rc" style="--c:${color(x)}">
                <header class="rc-head"><span class="rc-ic">${icon(x.icon || "scroll")}</span><h3>${esc(x.title)}</h3></header>
                <p class="rc-when">${x.when}</p>
                ${x.card.table ? `<table class="rc-table"><thead><tr>${x.card.table.head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${x.card.table.rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>` : ""}
                ${x.card.steps ? `<ol class="rc-steps">${x.card.steps.map(s => `<li>${s}</li>`).join("")}</ol>` : ""}
                ${x.card.check ? `<div class="rc-check"><span class="rc-label">${icon("check-circle")} Before you move on</span><ul>${x.card.check.map(s => `<li>${s}</li>`).join("")}</ul></div>` : ""}
                <a class="rc-more" href="#/recipes/${x.id}">Full walkthrough →</a>
            </article>`;

        if (!r) {
            main.innerHTML = `
                <div class="recipes">
                    ${K.header(ctx, "recipes")}
                    <div class="kh-slim"><span class="kh-label">How to use it</span><span class="kh-grow">Read the card before you start a problem, and run its checklist before you move on. Open a walkthrough when you want the reasoning and a worked example.</span>
                        <button type="button" class="btn small" data-act="print">${icon("note")} Print the cards</button></div>
                    <div class="rc-grid">${bank.map(card).join("")}</div>
                </div>`;
        } else {
            const i = bank.indexOf(r), prev = bank[i - 1], next = bank[i + 1], f = r.full;
            const A = CRAMLET.automata;
            main.innerHTML = `
                <div class="recipes recipe-full" style="--c:${color(r)}">
                    ${K.header(ctx, "recipes", { line: `<b>${esc(r.title)}.</b> ${r.when}` })}
                    <div class="kh-slim"><a class="btn ghost small" href="#/recipes">← All recipes</a><span class="kh-grow"></span>
                        <button type="button" class="btn small" data-act="print">${icon("note")} Print this recipe</button></div>
                    <div class="rf">
                        <aside class="rf-card">${card(r)}</aside>
                        <div class="rf-body">
                            ${f.intro ? `<p class="rf-intro">${f.intro}</p>` : ""}
                            <h2>The steps, and why</h2>
                            <ol class="rf-steps">${f.steps.map(s => `<li><h3>${s.t}</h3><div>${s.html}</div></li>`).join("")}</ol>
                            ${f.example ? `<section class="rf-example"><div class="side-title">${icon("lightbulb")} Worked example</div><h3>${f.example.title}</h3>${f.example.html}
                                ${(f.example.machines || []).map(m => `<figure class="rf-fig"><div class="diagram">${A ? A.render(m.machine, { label: m.label }) : ""}</div><figcaption>${m.label}</figcaption></figure>`).join("")}</section>` : ""}
                            ${f.traps && f.traps.length ? `<div class="callout warn done">${icon("warning", "callout-ic")}<div class="callout-body"><span class="callout-label">Common traps</span><ul>${f.traps.map(t => `<li>${t}</li>`).join("")}</ul></div></div>` : ""}
                            ${f.practice && f.practice.length ? `<div class="rf-practice"><span class="rc-label">Practice it</span>${f.practice.map(p => `<a class="btn small" href="${p.href}">${esc(p.label)}</a>`).join("")}</div>` : ""}
                            <nav class="rf-nav">${prev ? `<a class="btn ghost" href="#/recipes/${prev.id}">← ${esc(prev.title)}</a>` : "<span></span>"}${next ? `<a class="btn ghost" href="#/recipes/${next.id}">${esc(next.title)} →</a>` : ""}</nav>
                        </div>
                    </div>
                </div>`;
        }
        K.mount(main);
        main.querySelectorAll('[data-act="print"]').forEach(b => b.addEventListener("click", () => window.print()));
        window.scrollTo(0, 0);
    }

    window.CRAMLET = Object.assign(window.CRAMLET || {}, { recipes: { render, count: () => bank.length, forQuestion, linkFor, list: () => bank.slice() } });
})();
