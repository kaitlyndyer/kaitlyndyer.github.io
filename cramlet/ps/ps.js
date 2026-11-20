// Probability & Statistics helpers for content files.
//   PS.frac(top, bottom)   a stacked fraction, inline
//   PS.calc(text)          a calculator command, written the way you'd write it on the test: normalcdf(−E99, 12, 12.2, 0.4)
//   PS.box(html)           a boxed final answer
//   PS.blank(k)            an answer box for the step-by-step walkthroughs (course/stepper.js)
(function () {
    "use strict";
    const frac = (a, b) => `<span class="fr"><span class="fr-t">${a}</span><span class="fr-b">${b}</span></span>`;
    const calc = t => `<code class="calc">${String(t).replace(/-/g, "−")}</code>`;
    const box = h => `<span class="boxed">${h}</span>`;
    const blank = k => `<input class="blank" data-b="${k}" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="decimal" aria-label="Answer box ${k + 1}">`;
    window.PS = { frac, calc, box, blank };
})();
