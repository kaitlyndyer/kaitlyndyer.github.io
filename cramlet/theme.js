// cramlet light/dark mode. Load this in <head> (before the stylesheets paint) so the page never flashes the wrong theme.
// Follows the computer's setting until the visitor picks one with the toggle; the pick is saved in this browser only.
(function () {
    "use strict";

    const KEY = "cramlet.theme";
    const root = document.documentElement;
    const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

    function saved() {
        try { const t = localStorage.getItem(KEY); return t === "light" || t === "dark" ? t : null; }
        catch (e) { return null; }
    }
    function current() { return saved() || (media && media.matches ? "dark" : "light"); }
    function apply() { root.dataset.theme = current(); }

    apply();
    if (media && media.addEventListener) media.addEventListener("change", () => { if (!saved()) apply(); });

    // Sun/moon button. Shows the theme you'd switch TO.
    function mountToggle(btn) {
        function paint() {
            const next = current() === "dark" ? "light" : "dark";
            btn.innerHTML = window.CRAMLET.icon(next === "dark" ? "moon" : "sun");
            btn.setAttribute("aria-label", `Switch to ${next} mode`);
            btn.title = `Switch to ${next} mode`;
        }
        btn.classList.add("theme-toggle");
        btn.addEventListener("click", () => {
            const next = current() === "dark" ? "light" : "dark";
            try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
            apply();
            paint();
        });
        if (media && media.addEventListener) media.addEventListener("change", paint);
        paint();
    }

    window.CRAMLET = Object.assign(window.CRAMLET || {}, { theme: { current, mountToggle } });
})();
