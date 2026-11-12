var S = thisComp.layer("[SRC] Text").text.sourceText;
var T = S.replace(/\r\n/g, "\r")
         .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
         .replace(/[\r\n\u0003\u000B\u2028\u2029\f]/g, " \u0001 ");
var RAW = T.replace(/^\s+|\s+$/g, "").split(/\s+/);

var W = [], BRK = [];
for (var si = 0; si < RAW.length; si++) {
  if (RAW[si] === "\u0001") {
    if (W.length && (!BRK.length || BRK[BRK.length - 1] !== W.length)) BRK.push(W.length);
  } else if (RAW[si] !== "") W.push(RAW[si]);
}
while (BRK.length && BRK[BRK.length - 1] >= W.length) BRK.pop();

function lead() {
  var L = 0;
  try { L = thisComp.layer("[TXT] Title").text.sourceText.style.leading; } catch (e) { L = 0; }
  return (L > 0) ? L : 90 * 1.1;
}

var C = thisComp.layer("[CTRL] Master");
function ctl(n) { return C.effect(n)("Slider"); }

function widthOf(i) {
  try { return thisComp.layer("[MEA] w" + (i < 9 ? "0" : "") + (i + 1))
                       .sourceRectAtTime(0, false).width; } catch (e) { return 0; }
}

var ROWOF = [], NROWS = 1;
var nW = W.length;

if (C.effect("Auto Rows")("Checkbox") < 1 && BRK.length) {
  var r = 0, bi = 0;
  for (var i0 = 0; i0 < nW; i0++) {
    if (bi < BRK.length && i0 === BRK[bi]) { r++; bi++; }
    ROWOF[i0] = r;
  }
  NROWS = r + 1;
} else {
  // rows from word count, then balance by measured width
  var want = (nW <= 2) ? 1 : (nW === 3 ? 2 : Math.round(ctl("Rows")));
  want = Math.max(1, Math.min(want, nW));
  var WID = [], sp = ctl("Space W");
  for (var i1 = 0; i1 < nW; i1++) WID[i1] = widthOf(i1);

  function rowW(a, b) {
    var t = 0; for (var q = a; q < b; q++) t += WID[q];
    return t + sp * (b - a - 1);
  }
  var bestV = -1, bestCuts = [nW];
  function rec(start, depth, cuts) {
    if (depth === want - 1) {
      var all = cuts.concat([nW]), pv = 0, ws = [];
      for (var z = 0; z < all.length; z++) {
        if (all[z] - pv < 1) return;
        ws.push(rowW(pv, all[z])); pv = all[z];
      }
      var m = 0, y;
      for (y = 0; y < ws.length; y++) m += ws[y];
      m /= ws.length;
      var v = 0;
      for (y = 0; y < ws.length; y++) v += (ws[y] - m) * (ws[y] - m);
      if (bestV < 0 || v < bestV) { bestV = v; bestCuts = all; }
      return;
    }
    for (var c = start + 1; c <= nW - (want - 1 - depth); c++) rec(c, depth + 1, cuts.concat([c]));
  }
  rec(0, 0, []);
  var pr = 0;
  for (var cc = 0; cc < bestCuts.length; cc++) {
    for (var w2 = pr; w2 < bestCuts[cc]; w2++) ROWOF[w2] = cc;
    pr = bestCuts[cc];
  }
  NROWS = bestCuts.length;
}

var L  = lead();
var H  = Math.max(1, Math.round(ctl("Hold Frames")));
var TA = ctl("Tail A"), TB = ctl("Tail B");
var ST = Math.max(0, ctl("Stagger"));
var GAP = ctl("Phase Gap"), SPW = ctl("Space W");

// Row starts, and each word's x within its row.
var NATX = [], NATY = [], pen = 0, curR = -1;
for (var i2 = 0; i2 < nW; i2++) {
  if (ROWOF[i2] !== curR) { curR = ROWOF[i2]; pen = 0; }
  NATX[i2] = pen;
  NATY[i2] = ROWOF[i2] * L;
  pen += widthOf(i2) + SPW;
}

// ── the spawn origin ────────────────────────────────────
// A FIXED offset from r1w1's home: Origin X px along, Origin
// Row rows down. Not the frame centre.
//
// Frame-centring made the travel distance a function of the
// spawning word's WIDTH, so every string moved a different
// amount and the motion never felt like the same move twice.
// Pinned to r1w1 it is string-independent by construction —
// and because the block is left-pinned (anchor x = 0), r1w1's
// home does not drift either.
//
// At Origin Row = 1 the origin lands exactly on the handoff
// word's own row, which is why the handoff never has to move
// vertically. That used to be an accident of the middle-row
// geometry; now it is stated outright.
var OX  = ctl("Origin X");
var ORW = ctl("Origin Row");

var TL = thisComp.layer("[TXT] Title");
var TP = TL.position;
var AY = (NROWS - 1) * L / 2;

function homeOf(i) {
  if (i >= nW) return [TP[0], TP[1]];
  return [TP[0] + NATX[i], TP[1] + NATY[i] - AY];
}

// ── roles ───────────────────────────────────────────────
var seed = 0, handoff = -1;
for (var i3 = 0; i3 < nW; i3++) { if (ROWOF[i3] === 1) { handoff = i3; break; } }

// ── arrival order for the fill ──────────────────────────
// Pure random reads sloppy, reading order reads mechanical.
// Seeded start, then repeatedly take whichever word sits
// FARTHEST from the one that just landed, so consecutive
// arrivals never cluster. Same seed, same order.
var seedN = Math.round(ctl("Order Seed")) & 0x7fffffff;
function rnd() { seedN = (seedN * 1103515245 + 12345) & 0x7fffffff; return seedN / 0x7fffffff; }

var pool = [];
for (var i4 = 0; i4 < nW; i4++) if (i4 !== seed && i4 !== handoff) pool.push(i4);
var ORD = [];
if (pool.length) {
  var px = Math.floor(rnd() * pool.length);
  ORD.push(pool.splice(px, 1)[0]);
  while (pool.length) {
    var pv2 = ORD[ORD.length - 1], bj = 0, bd = -1;
    for (var j2 = 0; j2 < pool.length; j2++) {
      var ddx = NATX[pool[j2]] - NATX[pv2], ddy = NATY[pool[j2]] - NATY[pv2];
      var dd = ddx * ddx + ddy * ddy;
      if (dd > bd) { bd = dd; bj = j2; }
    }
    ORD.push(pool.splice(bj, 1)[0]);
  }
}

// ── the clock ───────────────────────────────────────────
var V   = ctl("Void");
var CH  = ctl("Centre Hold");
var rackS   = V + CH;
var rackE   = rackS + 3 * H;
var setS    = rackE + GAP;
var setE    = setS + (handoff >= 0 ? ST : 0) + 3 * H;
var fillS   = setE + GAP;
var TOTAL   = fillS + (ORD.length > 0 ? (ORD.length - 1) * ST + 4 * H : 0);
if (TOTAL < 1) TOTAL = 1;

var F = ctl("Progress") / 100 * TOTAL;

// ── spawn frames ────────────────────────────────────────
var SPAWN = [];
SPAWN[seed] = V;
if (handoff >= 0) SPAWN[handoff] = rackS;
for (var i5 = 0; i5 < ORD.length; i5++) SPAWN[ORD[i5]] = fillS + i5 * ST;

/**
 * One stepped move, resolved at frame F. No interpolation:
 * hold at `from`, then cut to TA short of target, then TB,
 * then land. Tails are signed AGAINST travel, so the word
 * always arrives short and closes the gap — that is what
 * reads as a settle.
 */
function stepv(from, start) {
  if (F < start) return from;
  var s = (from > 0) ? 1 : ((from < 0) ? -1 : 0);
  if (F < start + H)     return s * Math.abs(TA);
  if (F < start + 2 * H) return s * Math.abs(TB);
  return 0;
}

function offsetOf(i) {
  if (i >= nW) return [0, 0];

  // Displacement from THIS word's home to the shared spawn
  // origin. Both the seed and the handoff are first-words-of-a-
  // row, which sit on the layer origin in a left-justified
  // paragraph, so these are exact — no measurement, no
  // accumulated error, no dependence on word width.
  var ox0 = (NATX[seed] + OX) - NATX[i];
  var oy0 = (ROWOF[seed] + ORW - ROWOF[i]) * L;

  if (i === seed) {
    // Vertical first (the rack), then horizontal (the settle).
    // Never both at once.
    return [ stepv(ox0, setS + (handoff >= 0 ? ST : 0)),
             stepv(oy0, rackS) ];
  }
  if (i === handoff) {
    // oy0 is 0 at Origin Row = 1, so this vertical step is a
    // no-op in the default score and only wakes up if the
    // origin is moved off the handoff's row.
    return [ stepv(ox0, setS), stepv(oy0, rackS + H) ];
  }

  // Fill. Clamp the approach to the gap to the right-hand
  // neighbour so a word can never cross into an occupied
  // slot, however wide the style asks for.
  var amt = ctl("Approach");
  var isLast = (i === nW - 1) || (ROWOF[i + 1] !== ROWOF[i]);
  if (!isLast) amt = Math.min(amt, SPW);
  return [stepv(amt, (SPAWN[i] == null ? 0 : SPAWN[i]) + H), 0];
}
var i = 6;
var h = homeOf(i);
var o = offsetOf(i);
[h[0] + o[0], h[1] + o[1]];