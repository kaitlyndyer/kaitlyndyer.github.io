// cramlet critters: the avatar art shared by every page.
// Each critter is a list of simple shapes drawn into a 140x140 SVG (Soft style).
(function () {
    "use strict";

    const INK = '#2b2340';
    const LEAF = '#7fd19b';
    const CREAM = '#fff4e4';

    function hex(h) { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
    function mix(a, b, t) {
      const x = hex(a), y = hex(b);
      return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
    }

    // Shape helpers. k picks the fill: body, light, accent, accentLight, leaf, cream.
    // round > 0 softens sharp corners by stroking the shape in its own color.
    const E = (cx, cy, rx, ry, rot = 0, k = 'body') => ({ k, tag: 'ellipse', a: `cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}` });
    const C = (cx, cy, r, k = 'body') => ({ k, tag: 'circle', a: `cx="${cx}" cy="${cy}" r="${r}"` });
    const P = (d, k = 'body', round = 0) => ({ k, tag: 'path', a: `d="${d}"`, round });
    const stroke = (d, c, w = 2.6) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

    function starPath(cx, cy, R, r) {
      let d = '';
      for (let i = 0; i < 10; i++) {
        const ang = (-90 + i * 36) * Math.PI / 180, rad = i % 2 ? r : R;
        d += (i ? 'L' : 'M') + (cx + rad * Math.cos(ang)).toFixed(1) + ' ' + (cy + rad * Math.sin(ang)).toFixed(1) + ' ';
      }
      return d + 'Z';
    }

    const CRITTERS = [
      { id: 'pip', name: 'Pip', color: '#b9a6ff', bio: 'Grows a new sprout every lecture.',
        parts: [P('M58.5 39 C58 33 59 28 61 23 L64 24 C62.5 29 62 34 62.5 39Z', 'leaf'), E(51, 22, 9, 5, -25, 'leaf'), E(71, 19, 9, 5, 25, 'leaf'), E(60, 72, 40, 35)],
        face: { x: 60, y: 70, g: 13 }, arms: [[22, 78], [98, 78]], hl: [40, 52], top: [60, 40] },
      { id: 'glim', name: 'Glim', color: '#ffd56b', accent: '#ff8fb7', bio: 'Its antenna lights up when something clicks.',
        parts: [P('M57 33 L64 12 L68 13.5 L62 34Z'), C(67, 11, 6.5, 'accent'), P('M60 30 C76 30 98 56 98 78 C98 96 82 106 60 106 C38 106 22 96 22 78 C22 56 44 30 60 30Z')],
        face: { x: 60, y: 76, g: 12 }, arms: [[24, 86], [96, 86]], hl: [44, 56], top: [60, 38] },
      { id: 'lopkin', name: 'Lopkin', color: '#ffb48f', bio: 'Ears droop the night before an exam.',
        parts: [E(24, 58, 10, 24, 25), E(96, 58, 10, 24, -25), E(25, 60, 5, 16, 25, 'light'), E(95, 60, 5, 16, -25, 'light'), E(60, 70, 32, 38)],
        face: { x: 60, y: 70, g: 11 }, arms: [[30, 88], [90, 88]], hl: [47, 44], top: [60, 34] },
      { id: 'snork', name: 'Snork', color: '#8edfb4', accent: '#fff0c4', bio: 'Tiny horns, big opinions about clean code.',
        parts: [P('M33 52 Q28 34 38 26 Q44 38 47 48Z', 'accent'), P('M87 52 Q92 34 82 26 Q76 38 73 48Z', 'accent'), E(60, 74, 44, 32)],
        face: { x: 60, y: 74, g: 14 }, arms: [[18, 84], [102, 84]], hl: [38, 58], top: [60, 44] },
      { id: 'puff', name: 'Puff', color: '#9fd0ff', bio: 'Floats through flashcards without a care.',
        parts: [C(37, 80, 22), C(83, 80, 22), C(60, 62, 27), C(60, 86, 22)],
        face: { x: 60, y: 76, g: 12 }, arms: [[14, 88], [106, 88]], hl: [48, 50], top: [60, 38] },
      { id: 'mimbo', name: 'Mimbo', color: '#ffa3c7', bio: 'Remembers everything. Supposedly.',
        parts: [C(32, 38, 14), C(88, 38, 14), C(31, 36, 7, 'light'), C(89, 36, 7, 'light'), E(60, 74, 38, 34)],
        face: { x: 60, y: 74, g: 12 }, arms: [[22, 86], [98, 86]], hl: [44, 54], top: [60, 42] },
      { id: 'jelli', name: 'Jelli', color: '#8fe3dc', bio: 'Wobbles under pressure but never drops a card.',
        parts: [P('M22 76 C22 48 40 32 60 32 C80 32 98 48 98 76 Q98 94 88 92 Q82 86 74 93 Q67 100 60 93 Q53 86 46 93 Q38 100 32 92 Q22 94 22 76Z')],
        details: c => stroke('M60 32 C60 23 69 21 69 27 C69 31 64 31 64 28', c, 3),
        face: { x: 60, y: 64, g: 12 }, arms: [[24, 76], [96, 76]], hl: [43, 46], top: [60, 34] },
      { id: 'dumpy', name: 'Dumpy', color: '#ffd9a0', bio: 'Stuffed full of facts.',
        parts: [C(60, 41, 7), P('M16 90 C16 60 36 42 60 42 C84 42 104 60 104 90 C104 102 92 104 60 104 C28 104 16 102 16 90Z')],
        details: c => stroke('M50 46 Q53 53 50 59', c) + stroke('M60 48 L60 59', c) + stroke('M70 46 Q67 53 70 59', c),
        face: { x: 60, y: 78, g: 14 }, arms: [[18, 92], [102, 92]], hl: [38, 64], top: [60, 42] },

      { id: 'spori', name: 'Spori', isNew: true, color: '#ff9e9e', bio: 'Pops up wherever there is a quiet place to read.',
        parts: [E(60, 84, 27, 24, 0, 'cream'), P('M14 62 C14 34 36 20 60 20 C84 20 106 34 106 62 C106 69 98 71 60 71 C22 71 14 69 14 62Z'), C(38, 46, 6, 'light'), C(62, 32, 5, 'light'), C(85, 48, 7, 'light')],
        face: { x: 60, y: 84, g: 10 }, arms: [[34, 92], [86, 92]], hl: [32, 40], top: [60, 22] },
      { id: 'beanie', name: 'Beanie', isNew: true, color: '#c4b5fd', accent: '#ff9a8a', bio: 'Keeps its hat on during every all-nighter.',
        parts: [E(60, 76, 38, 32), P('M25 60 C25 36 41 26 60 26 C79 26 95 36 95 60 Q60 52 25 60Z', 'accent'), P('M22 57 Q60 46 98 57 L98 65 Q60 55 22 65Z', 'accentLight', 6), C(60, 24, 9, 'accentLight')],
        face: { x: 60, y: 80, g: 12 }, arms: [[24, 88], [96, 88]], hl: [40, 42], top: [60, 28] },
      { id: 'cubby', name: 'Cubby', isNew: true, color: '#ffc9b9', bio: 'Neat, square, and always organized.',
        parts: [P('M30 36 H90 Q102 36 102 48 V94 Q102 106 90 106 H30 Q18 106 18 94 V48 Q18 36 30 36Z')],
        details: c => stroke('M60 36 C57 27 67 25 64 32', c, 3),
        face: { x: 60, y: 70, g: 13 }, arms: [[14, 82], [106, 82]], hl: [32, 48], top: [60, 38] },
      { id: 'starla', name: 'Starla', isNew: true, color: '#ffe27a', bio: 'Gold stars only. Has never missed a deadline.',
        parts: [P(starPath(60, 68, 46, 25), 'body', 12)],
        face: { x: 60, y: 70, g: 11 }, arms: null, hl: [52, 38], top: [60, 30] },
      { id: 'fenn', name: 'Fenn', isNew: true, color: '#a9b8ff', bio: 'Hears the professor say "this will be on the exam."',
        parts: [P('M30 58 L34 18 L56 46Z', 'body', 10), P('M90 58 L86 18 L64 46Z', 'body', 10), P('M37 50 L37.5 29 L49 44Z', 'light', 4), P('M83 50 L82.5 29 L71 44Z', 'light', 4), E(60, 76, 37, 32)],
        face: { x: 60, y: 76, g: 12 }, arms: [[26, 90], [94, 90]], hl: [42, 58], top: [60, 46] },
      { id: 'noodle', name: 'Noodle', isNew: true, color: '#b5e48c', accent: '#ffb48f', bio: 'Inches through the reading one page at a time.',
        parts: [P('M64 42 L58 20 L61.5 19 L67.5 41Z'), P('M86 41 L94 20 L97.5 21.5 L90 43Z'), C(59, 17, 5, 'accent'), C(96, 18, 5, 'accent'), C(22, 84, 15, 'light'), C(44, 80, 18), C(76, 68, 29)],
        face: { x: 76, y: 70, g: 11 }, arms: null, hl: [64, 50], top: [76, 41] },
      { id: 'nutmeg', name: 'Nutmeg', isNew: true, color: '#f2c79b', accent: '#b98457', bio: 'Stashes snacks and flashcards for later.',
        parts: [P('M24 58 C24 86 40 104 60 109 C80 104 96 86 96 58Z'), P('M57 32 L58 17 L64 17 L63 32Z', 'accent', 3), P('M17 60 C17 38 38 28 60 28 C82 28 103 38 103 60 Q60 69 17 60Z', 'accent')],
        details: c => stroke('M28 48 Q60 40 92 48', mix('#b98457', '#ffffff', .35), 2.2) + stroke('M23 56 Q60 49 97 56', mix('#b98457', '#ffffff', .35), 2.2),
        face: { x: 60, y: 80, g: 12 }, arms: [[24, 82], [96, 82]], hl: [40, 36], top: [60, 30] },
      { id: 'lumi', name: 'Lumi', isNew: true, color: '#fff0a0', accent: '#c4bdd6', bio: 'Lights up when it gets a bright idea.',
        parts: [P('M44 82 H76 V102 Q76 108 70 108 H50 Q44 108 44 102Z', 'accent'), C(60, 56, 38)],
        under: () => [[-150, 10], [-120, 12], [-60, 12], [-30, 10]].map(([a]) => {
          const r = a * Math.PI / 180, x1 = 60 + 46 * Math.cos(r), y1 = 56 + 46 * Math.sin(r), x2 = 60 + 56 * Math.cos(r), y2 = 56 + 56 * Math.sin(r);
          return stroke(`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`, '#ffc94d', 4);
        }).join(''),
        details: () => stroke('M47 95 H73', '#9d95b5', 2.4) + stroke('M47 101 H73', '#9d95b5', 2.4),
        face: { x: 60, y: 58, g: 13 }, arms: [[22, 66], [98, 66]], hl: [42, 36], top: [60, 20] },
    ];
    const COLORS = ['#b9a6ff', '#a9b8ff', '#9fd0ff', '#8fe3dc', '#8edfb4', '#b5e48c', '#ffe27a', '#ffd9a0', '#ffb48f', '#ff9e9e', '#ffa3c7', '#ffc9b9'];

    function star(x, y, r) { return `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z" fill="#ffc94d"/>`; }

    function face({ x, y, g }, mood) {
      let s = '';
      const eyes = [x - g, x + g], my = y + 9;
      eyes.forEach(e => { s += `<ellipse cx="${e + (e < x ? -6 : 6)}" cy="${y + 7}" rx="5.5" ry="3.2" fill="#ff7aa8" opacity=".45"/>`; });
      if (mood === 'happy' || mood === 'cheer') {
        eyes.forEach(e => { s += stroke(`M${e - 4.5} ${y + 1.5} Q${e} ${y - 5} ${e + 4.5} ${y + 1.5}`, INK, 3); });
        s += `<path d="M${x - 5.5} ${my - 2} Q${x} ${my + 8} ${x + 5.5} ${my - 2}Z" fill="${INK}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`;
        s += `<ellipse cx="${x}" cy="${my + 2.4}" rx="2.6" ry="1.5" fill="#ff7aa8"/>`;
      } else {
        const ry = mood === 'oops' ? 4.4 : 5.2;
        eyes.forEach(e => { s += `<ellipse cx="${e}" cy="${y}" rx="4.1" ry="${ry}" fill="${INK}"/><circle cx="${e + 1.4}" cy="${y - 1.8}" r="1.4" fill="#fff"/>`; });
        if (mood === 'oops') {
          s += stroke(`M${x + g - 4.5} ${y - 9} L${x + g + 4} ${y - 11.5}`, INK, 2.4);
          s += stroke(`M${x - 6} ${my} Q${x - 3} ${my - 3} ${x} ${my} Q${x + 3} ${my + 3} ${x + 6} ${my}`, INK, 2.4);
          const dx = x + g + 15, dy = y - 12;
          s += `<path d="M${dx} ${dy - 6} Q${dx + 5} ${dy + 2} ${dx} ${dy + 3.5} Q${dx - 5} ${dy + 2} ${dx} ${dy - 6}Z" fill="#8fd3ff"/>`;
        } else {
          s += stroke(`M${x - 4} ${my - 1} Q${x} ${my + 3.5} ${x + 4} ${my - 1}`, INK, 2.6);
        }
      }
      return s;
    }

    function accessory(c, acc) {
      if (acc === 'glasses') {
        const { x, y, g } = c.face;
        return [x - g, x + g].map(e => `<circle cx="${e}" cy="${y}" r="8.5" fill="#fff" fill-opacity=".25" stroke="${INK}" stroke-width="2.4"/>`).join('')
          + stroke(`M${x - g + 8.5} ${y - 1} Q${x} ${y - 5} ${x + g - 8.5} ${y - 1}`, INK, 2.4);
      }
      if (acc === 'cap') {
        const [tx, ty] = c.top;
        return `<path d="M${tx - 15} ${ty + 1} L${tx - 15} ${ty + 11} Q${tx} ${ty + 17} ${tx + 15} ${ty + 11} L${tx + 15} ${ty + 1}Z" fill="#3b3155"/>`
          + `<path d="M${tx - 27} ${ty} L${tx} ${ty - 11} L${tx + 27} ${ty} L${tx} ${ty + 11}Z" fill="#4a3f68" stroke="#4a3f68" stroke-width="2" stroke-linejoin="round"/>`
          + stroke(`M${tx} ${ty} L${tx + 21} ${ty + 3} L${tx + 21} ${ty + 15}`, '#ffc94d', 2.2)
          + `<circle cx="${tx + 21}" cy="${ty + 17}" r="3" fill="#ffc94d"/>`;
      }
      if (acc === 'pencil') {
        // a pencil tucked against the right side, like it is ready to take notes
        const x = (c.arms ? c.arms[1][0] : c.face.x + c.face.g + 24) + 2, y = (c.arms ? c.arms[1][1] : c.face.y + 14) - 16;
        return `<g transform="rotate(20 ${x} ${y})"><rect x="${x - 4}" y="${y - 20}" width="8" height="30" rx="2" fill="#ffc94d"/><rect x="${x - 4}" y="${y - 24}" width="8" height="6" rx="2" fill="#ff8fb7"/><path d="M${x - 4} ${y + 10} L${x + 4} ${y + 10} L${x} ${y + 18}Z" fill="#f2d3a8"/><path d="M${x - 1.5} ${y + 14.5} L${x + 1.5} ${y + 14.5} L${x} ${y + 18}Z" fill="${INK}"/></g>`;
      }
      return '';
    }

    function critterSVG(c, { color = c.color, mood = 'idle', acc = '', label } = {}) {
      const fills = { body: color, light: mix(color, '#ffffff', .55), accent: c.accent || mix(color, INK, .5), accentLight: mix(c.accent || color, '#ffffff', .55), leaf: LEAF, cream: CREAM };
      const up = mood === 'cheer';
      const arms = (c.arms || []).map(([ax, ay], i) => {
        const side = i === 0 ? -1 : 1;
        return up ? E(ax + side * 4, ay - 22, 6.5, 10, side * 30) : E(ax, ay, 6.5, 9.5, side * -25);
      });
      const parts = [...arms, ...c.parts];
      const draw = p => {
        const f = fills[p.k];
        return `<${p.tag} ${p.a} fill="${f}"${p.round ? ` stroke="${f}" stroke-width="${p.round}" stroke-linejoin="round"` : ''}/>`;
      };
      let s = `<ellipse cx="60" cy="112" rx="30" ry="4.5" fill="${INK}" opacity=".1"/>`;
      if (c.under) s += c.under();
      s += parts.map(draw).join('');
      s += `<ellipse cx="${c.hl[0]}" cy="${c.hl[1]}" rx="9" ry="5.5" transform="rotate(-28 ${c.hl[0]} ${c.hl[1]})" fill="#fff" opacity=".45"/>`;
      if (c.details) s += c.details(mix(color, INK, .5));
      s += face(c.face, mood);
      s += accessory(c, acc);
      if (up) s += star(4, 30, 7) + star(114, 22, 6) + star(108, 48, 4);
      const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
      return `<svg viewBox="-10 -10 140 140" ${a11y} xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
    }

    function pawsSVG(color) {
      let s = '';
      [30, 62].forEach(x => {
        s += `<ellipse cx="${x}" cy="10" rx="9" ry="6.5" fill="${color}"/>`;
        s += stroke(`M${x - 2.5} 8 L${x - 2.5} 12 M${x + 2.5} 8 L${x + 2.5} 12`, mix(color, INK, .45), 1.6);
      });
      return `<svg viewBox="0 0 92 20" aria-hidden="true">${s}</svg>`;
    }

    function peekLogo(c, { acc = '', mood = 'idle', color } = {}) {
      return `<div class="peek" role="img" aria-label="cramlet logo with ${c.name} peeking over the letters">
        <div class="clip">${critterSVG(c, { mood, acc, color })}</div>
        <div class="paws">${pawsSVG(color || c.color)}</div>
        <div class="word" aria-hidden="true">cramlet</div>
      </div>`;
    }

    const byId = id => CRITTERS.find(c => c.id === id) || CRITTERS[0];

    // The site logo: Pip in glasses peeking over the wordmark.
    const MASCOT = { id: 'pip', acc: 'glasses' };
    const logo = () => peekLogo(byId(MASCOT.id), { acc: MASCOT.acc });

    window.CRAMLET = { CRITTERS, COLORS, byId, critterSVG, peekLogo, logo, MASCOT };
})();
