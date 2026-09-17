#!/usr/bin/env python3
"""Close hairline gaps in a coloring page's line art.

The game decides what "one area" is by flood-filling the white space in the
PNG, so a stroke that stops a few pixels short of meeting another one lets two
areas that should be separate share a single fill. Clicking either one then
colors both.

This script inks the short bridging strokes that close those gaps. Each seal is
recorded below with the coordinates it was measured at, so the fix can be
re-applied if the artwork is ever re-exported. Running it twice is harmless -
inking an already-black pixel changes nothing.

    python3 tools/seal-gaps.py pages/dragon-fairy.png

Finding new gaps: colour every area a different colour and look for two things
that should be separate sharing one colour (the fairy's eye and her face were
found exactly that way).
"""

import math
import struct
import sys
import zlib

# page id -> list of (x0, y0, x1, y1, radius) ink strokes, in source pixels
SEALS = {
    'dragon-fairy': [
        # The fairy's left eye: the lower rim stroke tapers out at x=784 and
        # never reaches the eye outline, whose tip ends at x=791. The ~6px hole
        # between them let her eye white and her face fill as one area.
        (785, 410, 790, 408, 1.0),
    ],
}


def read_png_gray(path):
    data = open(path, 'rb').read()
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise SystemExit('not a PNG: ' + path)
    pos, idat, w, h, bd, ct = 8, b'', None, None, None, None
    while pos < len(data):
        ln, typ = struct.unpack('>I4s', data[pos:pos + 8])
        pos += 8
        chunk = data[pos:pos + ln]
        pos += ln + 4
        if typ == b'IHDR':
            w, h, bd, ct = struct.unpack('>IIBBBBB', chunk)[:4]
        elif typ == b'IDAT':
            idat += chunk
        elif typ == b'IEND':
            break
    if bd != 8:
        raise SystemExit('need an 8-bit PNG')
    nch = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[ct]
    stride = w * nch
    raw = zlib.decompress(idat)
    out = bytearray(h * stride)
    prev = bytearray(stride)
    p = 0
    for y in range(h):
        f = raw[p]; p += 1
        line = bytearray(raw[p:p + stride]); p += stride
        if f == 1:
            for i in range(nch, stride):
                line[i] = (line[i] + line[i - nch]) & 255
        elif f == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 255
        elif f == 3:
            for i in range(stride):
                a = line[i - nch] if i >= nch else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 255
        elif f == 4:
            for i in range(stride):
                a = line[i - nch] if i >= nch else 0
                c = prev[i - nch] if i >= nch else 0
                b = prev[i]
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 255
        out[y * stride:(y + 1) * stride] = line
        prev = line
    gray = bytearray(w * h)
    for i in range(w * h):
        j = i * nch
        gray[i] = (out[j] * 299 + out[j + 1] * 587 + out[j + 2] * 114) // 1000 if nch >= 3 else out[j]
    return w, h, gray


def write_png_gray(path, w, h, gray):
    raw = bytearray()
    prev = bytearray(w)
    for y in range(h):
        row = gray[y * w:(y + 1) * w]
        cands = [(0, bytes(row))]
        s = bytearray(w)
        for i in range(w):
            s[i] = (row[i] - (row[i - 1] if i else 0)) & 255
        cands.append((1, bytes(s)))
        u = bytearray(w)
        for i in range(w):
            u[i] = (row[i] - prev[i]) & 255
        cands.append((2, bytes(u)))
        a = bytearray(w)
        for i in range(w):
            left = row[i - 1] if i else 0
            a[i] = (row[i] - ((left + prev[i]) >> 1)) & 255
        cands.append((3, bytes(a)))
        ft, best = min(cands, key=lambda c: sum(b if b < 128 else 256 - b for b in c[1]))
        raw.append(ft)
        raw += best
        prev = row

    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 0, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    png += chunk(b'IEND', b'')
    open(path, 'wb').write(png)


def ink_stroke(gray, w, h, x0, y0, x1, y1, rad):
    steps = int(max(abs(x1 - x0), abs(y1 - y0)) * 6) + 1
    r = int(math.ceil(rad))
    changed = 0
    for s in range(steps + 1):
        t = s / steps
        cx = int(round(x0 + (x1 - x0) * t))
        cy = int(round(y0 + (y1 - y0) * t))
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                if dx * dx + dy * dy <= rad * rad + 0.01:
                    x, y = cx + dx, cy + dy
                    if 0 <= x < w and 0 <= y < h and gray[y * w + x] != 0:
                        gray[y * w + x] = 0
                        changed += 1
    return changed


def count_areas(gray, w, h, open_at=220):
    """Same flood fill the game uses, so the count here matches the game's."""
    lab = bytearray(w * h)
    total = 0
    for seed in range(w * h):
        if gray[seed] < open_at or lab[seed]:
            continue
        total += 1
        stack = [seed]
        while stack:
            p = stack.pop()
            if lab[p]:
                continue
            y = p // w
            row = y * w
            xl = p - row
            xr = xl
            while xl > 0 and gray[row + xl - 1] >= open_at and not lab[row + xl - 1]:
                xl -= 1
            while xr < w - 1 and gray[row + xr + 1] >= open_at and not lab[row + xr + 1]:
                xr += 1
            for x in range(xl, xr + 1):
                lab[row + x] = 1
            for ny in (y - 1, y + 1):
                if 0 <= ny < h:
                    nr = ny * w
                    run = False
                    for x in range(xl, xr + 1):
                        q = nr + x
                        ok = gray[q] >= open_at and not lab[q]
                        if ok and not run:
                            stack.append(q)
                            run = True
                        elif not ok:
                            run = False
    return total


def main():
    if len(sys.argv) != 2:
        raise SystemExit('usage: seal-gaps.py <page.png>')
    path = sys.argv[1]
    page = path.rsplit('/', 1)[-1].rsplit('.', 1)[0]
    seals = SEALS.get(page)
    if not seals:
        raise SystemExit('no seals recorded for page "%s"' % page)

    w, h, gray = read_png_gray(path)
    before = count_areas(gray, w, h)
    inked = sum(ink_stroke(gray, w, h, *s) for s in seals)
    after = count_areas(gray, w, h)
    write_png_gray(path, w, h, gray)

    print('%s: %d seal(s), %d pixels inked' % (page, len(seals), inked))
    print('colorable areas: %d -> %d' % (before, after))


if __name__ == '__main__':
    main()
