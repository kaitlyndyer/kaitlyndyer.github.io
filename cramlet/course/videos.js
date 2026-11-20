// "Watch" links on concept pages: short video clips a course registers in its data files.
//   registerVideos([{ id, title, by, yt, start?, end?, concept, secs?, role: "main" | "alt", why }])
// The chips render on a concept's header (main videos, up to 3) and on Details sections (up to 4).
// Styles: the "Watch links" block in course/plan.css.
(function () {
    "use strict";

    // Always look STUDY up when needed: data/course.js replaces the object when it loads.
    const ST = () => (window.STUDY = window.STUDY || {});
    window.registerVideos = list => { ST().videos = (ST().videos || []).concat(list); };

    const pad = n => String(n).padStart(2, "0");
    const mmss = s => `${Math.floor(s / 60)}:${pad(s % 60)}`;
    const videoById = id => (ST().videos || []).find(v => v.id === id);
    const videoUrl = v => `https://www.youtube.com/watch?v=${v.yt}${v.start ? `&t=${v.start}s` : ""}`;
    const clipLabel = v => (v.end ? `${mmss(v.start || 0)}–${mmss(v.end)}` : "whole video");
    const videosFor = (concept, sec) => (ST().videos || []).filter(v => v.concept === concept && (sec ? (v.secs || []).includes(sec) : true));

    function watchChips(concept, sec, icon, esc) {
        const vs = videosFor(concept, sec).filter(v => (sec ? true : v.role === "main")).slice(0, sec ? 4 : 3);
        if (!vs.length) return "";
        return `<div class="watch-row">${icon("play")}<span class="watch-k">Watch</span>${vs.map(v => `<a class="watch-chip${v.role === "alt" ? " alt" : ""}" href="${videoUrl(v)}" target="_blank" rel="noopener" title="${esc(v.why.replace(/<[^>]+>/g, ""))}"><span class="wc-t">${v.title}</span> <span class="wc-by">${esc(v.by)} · ${clipLabel(v)}</span></a>`).join("")}</div>`;
    }

    window.CRAMLET = Object.assign(window.CRAMLET || {}, { videos: { watchChips, videoById, videoUrl } });
})();
