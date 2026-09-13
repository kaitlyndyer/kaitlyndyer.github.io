/* Math Coloring Book
 * Solve a problem -> earn a click -> flood-fill one region of the line art.
 *
 * How the coloring works:
 *   The source PNG is plain black line art on white. On load we walk the
 *   pixels once and label every enclosed white area ("region"). Because the
 *   regions come from the artwork and never change, a click is just a lookup
 *   of the region id under the cursor - no per-click flood fill, and erasing
 *   an area is the exact same operation with a transparent color.
 *
 *   Three stacked canvases make it look like real crayon under real ink:
 *     paintCanvas - the colors the child lays down
 *     hoverCanvas - a preview tint of the area under the cursor
 *     lineCanvas  - the artwork, drawn as black with alpha = darkness, so the
 *                   anti-aliased edges blend over the color instead of
 *                   leaving a white halo around it.
 */

/* ---------------- Config ---------------- */

const PAGES = [
    { id: 'dragon-fairy', name: 'Dragon & Fairy', src: 'pages/dragon-fairy.png' }
];

const CRAYONS = [
    { name: 'Red',       hex: '#ED2A34' },
    { name: 'Orange',    hex: '#FF8B1F' },
    { name: 'Yellow',    hex: '#FFD92E' },
    { name: 'Green',     hex: '#38B34A' },
    { name: 'Sky Blue',  hex: '#56C5E8' },
    { name: 'Blue',      hex: '#2B62C4' },
    { name: 'Purple',    hex: '#8A55B5' },
    { name: 'Pink',      hex: '#F78DB5' },
    { name: 'Brown',     hex: '#9C5A2D' },
    { name: 'Tan',       hex: '#F0C29A' },
    { name: 'Gray',      hex: '#9AA5B1' },
    { name: 'Black',     hex: '#22262B' }
];

// A pixel this bright is "inside" an area the child can color.
const OPEN = 220;
// How far a fill creeps under the ink so no white halo shows at the edges.
// Capped, so it can never bleed through a line into the next area.
const DILATE = 3;
// Areas smaller than this are still clickable but don't count toward progress.
const MIN_COUNTABLE = 120;

const STORE_KEY = 'mathcolor:v1';

/* ---------------- Small helpers ---------------- */

const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const LITTLE_ENDIAN = (() => {
    const buf = new ArrayBuffer(4);
    new Uint32Array(buf)[0] = 1;
    return new Uint8Array(buf)[0] === 1;
})();

function packRGBA(r, g, b, a) {
    return LITTLE_ENDIAN
        ? (((a << 24) | (b << 16) | (g << 8) | r) >>> 0)
        : (((r << 24) | (g << 16) | (b << 8) | a) >>> 0);
}

function hexToRGB(hex) {
    const v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function packHex(hex, alpha = 255) {
    const [r, g, b] = hexToRGB(hex);
    return packRGBA(r, g, b, alpha);
}

/* ---------------- State ---------------- */

const state = {
    page: PAGES[0],
    grade: 'k',
    tool: 'crayon',            // 'crayon' | 'eraser'
    color: CRAYONS[0].hex,
    credits: 0,                // areas the child has earned the right to color
    stars: 0,
    problem: null,
    wrongTries: 0,
    locked: false,             // input freeze during answer feedback
    ready: false               // artwork processed
};

// Region data, filled in by prepareArtwork()
let W = 0, H = 0;
let labels = null;             // Int32Array, region id per pixel (0 = bare ink)
let regionStart = null;        // CSR offsets into regionPixels
let regionCount = null;        // pixels per region
let regionBox = null;          // [x0, y0, x1, y1] per region
let regionPixels = null;
let nRegions = 0;
let countableTotal = 0;      // areas big enough to count toward progress
let painted = null;            // region id -> hex color, or null

let paintCtx, hoverCtx, lineCtx;
let paintImg, paintBuf;        // ImageData + Uint32 view
let hoverImg, hoverBuf;
let hoverRegion = 0;

/* ---------------- Artwork processing ---------------- */

async function loadImageGray(src) {
    const img = new Image();
    img.decoding = 'async';
    await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = () => rej(new Error('Could not load ' + src));
        img.src = src;
    });

    W = img.naturalWidth;
    H = img.naturalHeight;

    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    let data;
    try {
        data = ctx.getImageData(0, 0, W, H).data;
    } catch (err) {
        // Reading pixels from a file:// page is blocked by the browser.
        throw new Error('NEEDS_SERVER');
    }

    const gray = new Uint8Array(W * H);
    for (let i = 0, p = 0; i < gray.length; i++, p += 4) {
        gray[i] = (data[p] * 299 + data[p + 1] * 587 + data[p + 2] * 114) / 1000;
    }
    return gray;
}

/* Label every enclosed white area with a scanline flood fill. */
function labelRegions(gray) {
    const n = W * H;
    labels = new Int32Array(n);
    let id = 0;

    for (let seed = 0; seed < n; seed++) {
        if (gray[seed] < OPEN || labels[seed]) continue;
        id++;
        const stack = [seed];

        while (stack.length) {
            const p = stack.pop();
            if (labels[p]) continue;

            const y = (p / W) | 0;
            const row = y * W;
            let xl = p - row;
            let xr = xl;

            while (xl > 0 && gray[row + xl - 1] >= OPEN && !labels[row + xl - 1]) xl--;
            while (xr < W - 1 && gray[row + xr + 1] >= OPEN && !labels[row + xr + 1]) xr++;

            for (let x = xl; x <= xr; x++) labels[row + x] = id;

            // Queue only the start of each unlabeled run in the rows above and
            // below - keeps the stack small on big areas like the background.
            for (const ny of [y - 1, y + 1]) {
                if (ny < 0 || ny >= H) continue;
                const nrow = ny * W;
                let inRun = false;
                for (let x = xl; x <= xr; x++) {
                    const q = nrow + x;
                    const open = gray[q] >= OPEN && !labels[q];
                    if (open && !inRun) { stack.push(q); inRun = true; }
                    else if (!open) inRun = false;
                }
            }
        }
    }
    nRegions = id;
}

/* Grow each area a few pixels under the ink so fills meet the lines cleanly. */
function dilateRegions() {
    const n = W * H;
    let frontier = [];

    for (let p = 0; p < n; p++) {
        if (!labels[p]) continue;
        const x = p % W;
        if ((x > 0 && !labels[p - 1]) || (x < W - 1 && !labels[p + 1]) ||
            (p >= W && !labels[p - W]) || (p < n - W && !labels[p + W])) {
            frontier.push(p);
        }
    }

    for (let step = 0; step < DILATE; step++) {
        const next = [];
        for (const p of frontier) {
            const lab = labels[p];
            const x = p % W;
            if (x > 0 && !labels[p - 1]) { labels[p - 1] = lab; next.push(p - 1); }
            if (x < W - 1 && !labels[p + 1]) { labels[p + 1] = lab; next.push(p + 1); }
            if (p >= W && !labels[p - W]) { labels[p - W] = lab; next.push(p - W); }
            if (p < n - W && !labels[p + W]) { labels[p + W] = lab; next.push(p + W); }
        }
        frontier = next;
    }
}

/* Pack each region's pixel list into one flat array for fast fills. */
function indexRegions() {
    const n = W * H;
    regionCount = new Int32Array(nRegions + 1);
    regionStart = new Int32Array(nRegions + 2);
    regionBox = new Int32Array((nRegions + 1) * 4);

    for (let r = 1; r <= nRegions; r++) {
        regionBox[r * 4] = W; regionBox[r * 4 + 1] = H;
        regionBox[r * 4 + 2] = -1; regionBox[r * 4 + 3] = -1;
    }

    for (let p = 0; p < n; p++) {
        const r = labels[p];
        if (!r) continue;
        regionCount[r]++;
        const x = p % W, y = (p / W) | 0;
        const b = r * 4;
        if (x < regionBox[b]) regionBox[b] = x;
        if (y < regionBox[b + 1]) regionBox[b + 1] = y;
        if (x > regionBox[b + 2]) regionBox[b + 2] = x;
        if (y > regionBox[b + 3]) regionBox[b + 3] = y;
    }

    let acc = 0;
    for (let r = 1; r <= nRegions; r++) { regionStart[r] = acc; acc += regionCount[r]; }
    regionStart[nRegions + 1] = acc;

    regionPixels = new Int32Array(acc);
    const cursor = Int32Array.from(regionStart);
    for (let p = 0; p < n; p++) {
        const r = labels[p];
        if (r) regionPixels[cursor[r]++] = p;
    }
}

/* Draw the artwork as black ink whose alpha is its darkness. */
function renderLineLayer(gray) {
    const img = lineCtx.createImageData(W, H);
    const buf = new Uint32Array(img.data.buffer);
    for (let i = 0; i < buf.length; i++) {
        buf[i] = packRGBA(0, 0, 0, 255 - gray[i]);
    }
    lineCtx.putImageData(img, 0, 0);
}

async function prepareArtwork() {
    const gray = await loadImageGray(state.page.src);

    for (const c of [$('paintCanvas'), $('hoverCanvas'), $('lineCanvas')]) {
        c.width = W;
        c.height = H;
    }
    paintCtx = $('paintCanvas').getContext('2d');
    hoverCtx = $('hoverCanvas').getContext('2d');
    lineCtx = $('lineCanvas').getContext('2d');

    labelRegions(gray);
    dilateRegions();
    indexRegions();
    renderLineLayer(gray);

    paintImg = paintCtx.createImageData(W, H);
    paintBuf = new Uint32Array(paintImg.data.buffer);
    hoverImg = hoverCtx.createImageData(W, H);
    hoverBuf = new Uint32Array(hoverImg.data.buffer);

    painted = new Array(nRegions + 1).fill(null);
    countableTotal = 0;
    for (let r = 1; r <= nRegions; r++) {
        if (regionCount[r] >= MIN_COUNTABLE) countableTotal++;
    }
    state.ready = true;
}

/* ---------------- Painting ---------------- */

function paintRegion(r, hex) {
    if (r < 1 || r > nRegions) return;
    const value = hex ? packHex(hex) : 0;
    const from = regionStart[r];
    const to = from + regionCount[r];
    for (let i = from; i < to; i++) paintBuf[regionPixels[i]] = value;
    painted[r] = hex;

    const b = r * 4;
    const x = regionBox[b], y = regionBox[b + 1];
    paintCtx.putImageData(paintImg, 0, 0, x, y, regionBox[b + 2] - x + 1, regionBox[b + 3] - y + 1);
}

function setHover(r) {
    if (r === hoverRegion) return;

    const clear = (id) => {
        if (id < 1) return;
        const from = regionStart[id];
        const to = from + regionCount[id];
        for (let i = from; i < to; i++) hoverBuf[regionPixels[i]] = 0;
        const b = id * 4;
        const x = regionBox[b], y = regionBox[b + 1];
        hoverCtx.putImageData(hoverImg, 0, 0, x, y, regionBox[b + 2] - x + 1, regionBox[b + 3] - y + 1);
    };

    clear(hoverRegion);
    hoverRegion = r;

    if (r >= 1) {
        // Preview in the chosen crayon; a neutral gray stands in for the eraser.
        const value = state.tool === 'eraser'
            ? packRGBA(120, 130, 145, 90)
            : packHex(state.color, 96);
        const from = regionStart[r];
        const to = from + regionCount[r];
        for (let i = from; i < to; i++) hoverBuf[regionPixels[i]] = value;
        const b = r * 4;
        const x = regionBox[b], y = regionBox[b + 1];
        hoverCtx.putImageData(hoverImg, 0, 0, x, y, regionBox[b + 2] - x + 1, regionBox[b + 3] - y + 1);
    }
}

function regionAtEvent(e) {
    const wrap = $('canvasWrap');
    const rect = wrap.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * W);
    const y = Math.floor((e.clientY - rect.top) / rect.height * H);
    if (x < 0 || y < 0 || x >= W || y >= H) return 0;
    return labels[y * W + x];
}

function coloredTotal() {
    let done = 0;
    for (let r = 1; r <= nRegions; r++) {
        if (painted[r] && regionCount[r] >= MIN_COUNTABLE) done++;
    }
    return done;
}

/* ---------------- Math problems ---------------- */

function dotGroup(count, goneFrom = -1) {
    let html = '<div class="dot-group">';
    for (let i = 0; i < count; i++) {
        const gone = goneFrom >= 0 && i >= goneFrom;
        html += '<span class="dot' + (gone ? ' gone' : '') + '"></span>';
    }
    return html + '</div>';
}

const KINDERGARTEN = [
    function addWithin10() {
        const a = rand(1, 5), b = rand(1, Math.min(5, 10 - a));
        return {
            prompt: 'Add them up',
            equation: a + ' + ' + b + ' = ?',
            dots: dotGroup(a) + '<span class="dot-op">+</span>' + dotGroup(b),
            answer: a + b
        };
    },
    function subWithin10() {
        const a = rand(2, 10), b = rand(1, a - 1);
        return {
            prompt: 'Take some away',
            equation: a + ' − ' + b + ' = ?',
            dots: dotGroup(a, a - b),
            answer: a - b
        };
    },
    function countThem() {
        const n = rand(3, 10);
        return {
            prompt: 'Count the dots',
            equation: 'How many?',
            dots: dotGroup(n),
            answer: n
        };
    },
    function whatComesNext() {
        const n = rand(1, 18);
        const after = Math.random() < 0.7;
        return {
            prompt: 'Number order',
            equation: after ? 'What comes after ' + n + '?' : 'What comes before ' + (n + 1) + '?',
            dots: '',
            answer: after ? n + 1 : n
        };
    }
];

const GRADE_ONE = [
    function addWithin20() {
        const a = rand(2, 12), b = rand(2, Math.min(10, 20 - a));
        return { prompt: 'Add', equation: a + ' + ' + b + ' = ?', dots: '', answer: a + b };
    },
    function subWithin20() {
        const a = rand(6, 20), b = rand(2, a - 1);
        return { prompt: 'Subtract', equation: a + ' − ' + b + ' = ?', dots: '', answer: a - b };
    },
    function missingAddend() {
        const total = rand(8, 20), a = rand(2, total - 2);
        return {
            prompt: 'Find the missing number',
            equation: a + ' + ? = ' + total,
            dots: '',
            answer: total - a
        };
    },
    function doubles() {
        const a = rand(3, 10);
        return { prompt: 'Doubles', equation: a + ' + ' + a + ' = ?', dots: '', answer: a + a };
    },
    function tenMoreLess() {
        const n = rand(11, 60);
        const more = Math.random() < 0.5;
        return {
            prompt: more ? '10 more' : '10 less',
            equation: n + (more ? ' + 10' : ' − 10') + ' = ?',
            dots: '',
            answer: more ? n + 10 : n - 10
        };
    }
];

function makeChoices(answer, count) {
    const set = new Set([answer]);
    let guard = 0;
    while (set.size < count && guard++ < 80) {
        const delta = rand(1, 3) * (Math.random() < 0.5 ? -1 : 1);
        const v = answer + delta;
        if (v >= 0) set.add(v);
    }
    while (set.size < count) set.add(rand(0, answer + 6));
    return shuffle([...set]);
}

function newProblem() {
    const pool = state.grade === 'k' ? KINDERGARTEN : GRADE_ONE;
    const p = pick(pool)();
    p.choices = makeChoices(p.answer, state.grade === 'k' ? 3 : 4);
    state.problem = p;
    state.wrongTries = 0;
    state.locked = false;
    renderProblem();
}

function renderProblem() {
    const p = state.problem;
    $('mathPrompt').textContent = p.prompt;
    $('mathEquation').textContent = p.equation;
    $('mathDots').innerHTML = p.dots || '';
    $('mathReward').hidden = true;
    $('mathcard').classList.remove('correct');

    const box = $('mathAnswers');
    box.className = 'math-answers cols-' + (p.choices.length === 3 ? 3 : 2);
    box.innerHTML = '';
    p.choices.forEach((choice) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = choice;
        btn.setAttribute('aria-label', 'Answer ' + choice);
        btn.addEventListener('click', () => submitAnswer(choice, btn));
        box.appendChild(btn);
    });
}

function submitAnswer(choice, btn) {
    if (state.locked) return;
    const p = state.problem;

    if (choice === p.answer) {
        state.locked = true;
        btn.classList.add('is-correct');
        $('mathcard').classList.add('correct');
        state.stars++;
        state.credits++;
        updateHUD();
        save();
        burstConfetti();
        setTimeout(showReward, 550);
    } else {
        btn.classList.add('is-wrong');
        $('mathcard').classList.add('wrong');
        state.wrongTries++;
        setTimeout(() => $('mathcard').classList.remove('wrong'), 420);
        setTimeout(() => btn.classList.remove('is-wrong'), 700);

        // After two misses, quietly remove a wrong option to keep it winnable.
        if (state.wrongTries >= 2) {
            const others = [...$('mathAnswers').children].filter(
                (b) => Number(b.textContent) !== p.answer && !b.classList.contains('faded')
            );
            if (others.length > 1) pick(others).classList.add('faded');
        }
    }
}

const PRAISE = ['Great job!', 'You got it!', 'Awesome!', 'Nice work!', 'Super!', 'Well done!'];

function showReward() {
    $('rewardTitle').textContent = pick(PRAISE);
    $('mathReward').hidden = false;
    updateReadyState();
}

/* ---------------- UI wiring ---------------- */

function updateHUD() {
    const done = state.ready ? coloredTotal() : 0;
    $('starCount').textContent = state.stars;
    $('colorCount').textContent = done;
    $('progressLabel').textContent = done + ' / ' + countableTotal;
    $('progressFill').style.width = countableTotal ? (done / countableTotal * 100) + '%' : '0';
}

function canPaint() {
    return state.ready && (state.credits > 0 || state.tool === 'eraser');
}

function updateReadyState() {
    const active = canPaint();
    $('canvasWrap').classList.toggle('ready', active);
    $('canvasWrap').classList.toggle('erasing', state.tool === 'eraser');
    $('canvasCard').classList.toggle('unlocked', active && state.tool === 'crayon');
    if (!active) setHover(0);
}

function buildCrayons() {
    const box = $('crayons');
    CRAYONS.forEach((c, i) => {
        const b = document.createElement('button');
        b.className = 'crayon' + (i === 0 ? ' selected' : '');
        b.style.background = c.hex;
        b.style.color = c.hex;           // drives the ::before tip
        b.title = c.name;
        b.setAttribute('aria-label', c.name + ' crayon');
        b.addEventListener('click', () => {
            state.color = c.hex;
            state.tool = 'crayon';
            [...box.children].forEach((el) => el.classList.remove('selected'));
            b.classList.add('selected');
            $('eraserBtn').classList.remove('active');
            const hovered = hoverRegion;
            setHover(0);
            setHover(hovered);
            updateReadyState();
        });
        box.appendChild(b);
    });
}

function onCanvasClick(e) {
    if (!state.ready) return;
    const r = regionAtEvent(e);
    if (r < 1) return;

    if (state.tool === 'eraser') {
        if (!painted[r]) return;
        paintRegion(r, null);
        updateHUD();
        save();
        return;
    }

    if (state.credits < 1) return;

    paintRegion(r, state.color);
    state.credits--;
    updateHUD();
    save();
    updateReadyState();
    setTimeout(newProblem, 320);
}

function burstConfetti() {
    const layer = $('confetti');
    const colors = CRAYONS.map((c) => c.hex);
    for (let i = 0; i < 36; i++) {
        const bit = document.createElement('i');
        bit.style.left = rand(0, 100) + 'vw';
        bit.style.background = pick(colors);
        bit.style.animationDuration = (1.1 + Math.random() * 0.9) + 's';
        bit.style.animationDelay = (Math.random() * 0.25) + 's';
        layer.appendChild(bit);
        setTimeout(() => bit.remove(), 2400);
    }
}

/* ---------------- Save / restore ---------------- */

function save() {
    try {
        const fills = {};
        for (let r = 1; r <= nRegions; r++) {
            if (painted[r]) fills[r] = painted[r];
        }
        localStorage.setItem(STORE_KEY + ':' + state.page.id, JSON.stringify({
            regions: nRegions,
            stars: state.stars,
            fills
        }));
    } catch (err) {
        /* private browsing or full storage - progress just won't persist */
    }
}

function restore() {
    try {
        const raw = localStorage.getItem(STORE_KEY + ':' + state.page.id);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data.regions !== nRegions) return;   // artwork changed; start clean
        state.stars = data.stars || 0;
        for (const [r, hex] of Object.entries(data.fills || {})) {
            paintRegion(Number(r), hex);
        }
    } catch (err) {
        /* ignore unreadable saves */
    }
}

function resetPicture() {
    if (!confirm('Clear the whole picture and start over?')) return;
    for (let r = 1; r <= nRegions; r++) {
        if (painted[r]) paintRegion(r, null);
    }
    state.stars = 0;
    state.credits = 0;
    updateHUD();
    updateReadyState();
    save();
    newProblem();
}

function savePicture() {
    const out = document.createElement('canvas');
    out.width = W;
    out.height = H;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage($('paintCanvas'), 0, 0);
    ctx.drawImage($('lineCanvas'), 0, 0);

    const link = document.createElement('a');
    link.download = 'my-coloring-page.png';
    link.href = out.toDataURL('image/png');
    link.click();
}

/* ---------------- Start ---------------- */

async function init() {
    buildCrayons();
    updateHUD();

    $('eraserBtn').addEventListener('click', () => {
        state.tool = state.tool === 'eraser' ? 'crayon' : 'eraser';
        $('eraserBtn').classList.toggle('active', state.tool === 'eraser');
        const hovered = hoverRegion;
        setHover(0);
        setHover(hovered);
        updateReadyState();
    });

    $('resetBtn').addEventListener('click', resetPicture);
    $('saveBtn').addEventListener('click', savePicture);

    document.querySelectorAll('.grade-btn').forEach((b) => {
        b.addEventListener('click', () => {
            document.querySelectorAll('.grade-btn').forEach((x) => x.classList.remove('active'));
            b.classList.add('active');
            state.grade = b.dataset.grade;
            newProblem();
        });
    });

    // Number keys pick an answer - handy for a grown-up helping out.
    document.addEventListener('keydown', (e) => {
        const i = Number(e.key) - 1;
        const btns = $('mathAnswers').children;
        if (i >= 0 && i < btns.length) btns[i].click();
    });

    const wrap = $('canvasWrap');
    wrap.addEventListener('mousemove', (e) => {
        setHover(canPaint() ? regionAtEvent(e) : 0);
    });
    wrap.addEventListener('mouseleave', () => setHover(0));
    wrap.addEventListener('click', onCanvasClick);

    newProblem();

    try {
        await prepareArtwork();
    } catch (err) {
        const text = err.message === 'NEEDS_SERVER'
            ? 'This page needs to be served over http to read the picture. ' +
              'Run "python3 -m http.server" in this folder, then open http://localhost:8000/color/'
            : 'Sorry, the picture could not be loaded.';
        $('loadingText').textContent = text;
        document.querySelector('.spinner').style.display = 'none';
        return;
    }

    restore();
    $('loading').hidden = true;
    updateHUD();
    updateReadyState();
}

init();
