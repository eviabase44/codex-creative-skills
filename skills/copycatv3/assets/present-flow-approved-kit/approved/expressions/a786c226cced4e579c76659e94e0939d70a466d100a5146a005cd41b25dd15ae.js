var S = thisComp.layer("[SRC] Text").text.sourceText;
var T = S.replace(/\r\n/g, "\r")
         .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
         .replace(/[\r\n\u0003\u000B\u2028\u2029\f]/g, " \u0001 ");
var RAW = T.replace(/^\s+|\s+$/g, "").split(/\s+/);

var W = [], BRK = [], WOF = [];
for (var si = 0; si < RAW.length; si++) {
  if (RAW[si] === "\u0001") {
    WOF[si] = -1;
    if (W.length && (!BRK.length || BRK[BRK.length - 1] !== W.length)) BRK.push(W.length);
  } else if (RAW[si] !== "") {
    WOF[si] = W.length; W.push(RAW[si]);
  } else { WOF[si] = -1; }
}
while (BRK.length && BRK[BRK.length - 1] >= W.length) BRK.pop();
var NW = Math.max(W.length, 1);

var C = thisComp.layer("[CTRL] Master");
function ctl(n) { return C.effect(n)("Slider"); }
function pnt(n) { return C.effect(n)("Point"); }
function chk(n) { return C.effect(n)("Checkbox"); }

// Read the live paragraph leading so restyling in the Character
// panel is picked up automatically; fall back to the value baked
// in at build if the style API is unavailable on this AE build.
function lead() {
  var L = 0;
  try { L = thisComp.layer("[TXT] Words").text.sourceText.style.leading; } catch (e) { L = 0; }
  return (L > 0) ? L : 99;
}

function widthOf(i) {
  try { return thisComp.layer("[MEA] w" + (i < 9 ? "0" : "") + (i + 1))
                       .sourceRectAtTime(0, false).width; } catch (e) { return 0; }
}

var ROWOF = [], NROWS = 1;
var nW = W.length;
if (chk("Auto Rows") < 1 && BRK.length) {
  var r = 0, bi = 0;
  for (var i0 = 0; i0 < nW; i0++) {
    if (bi < BRK.length && i0 === BRK[bi]) { r++; bi++; }
    ROWOF[i0] = r;
  }
  NROWS = r + 1;
} else if (chk("Auto Rows") < 1) {
  for (var i9 = 0; i9 < nW; i9++) ROWOF[i9] = 0;
  NROWS = 1;
} else {
  var want = Math.round(ctl("Rows"));
  want = Math.max(1, Math.min(want, Math.max(nW, 1)));
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

var L   = lead();
var H   = Math.max(1, Math.round(ctl("Hold Frames")));
var SG  = Math.max(0, ctl("Stagger"));
var TA  = Math.abs(ctl("Tail A"));
var TB  = Math.abs(ctl("Tail B"));
var SPW = ctl("Space W");
var SLOTS = 8;

// ── natural layout ──────────────────────────────────────
// Row starts, and each word's x within its row. This is HOME:
// wherever AE's paragraph engine already put the word, so the
// offset at rest is zero and the type engine is never
// reproduced. Kerning, tracking and justification stay AE's
// problem.
var NATX = [], NATY = [], pen = 0, curR = -1;
for (var i2 = 0; i2 < nW; i2++) {
  if (ROWOF[i2] !== curR) { curR = ROWOF[i2]; pen = 0; }
  NATX[i2] = pen;
  NATY[i2] = ROWOF[i2] * L;
  pen += widthOf(i2) + SPW;
}

// ── per-row widths ──────────────────────────────────────
// Right edge of each row in layer space, from the measured
// probes. FIT needs these; the other modes get them free.
var ROWW = [];
for (var i3 = 0; i3 < nW; i3++) {
  var r3 = ROWOF[i3];
  var rt = NATX[i3] + widthOf(i3);
  if (ROWW[r3] == null || rt > ROWW[r3]) ROWW[r3] = rt;
}
for (var r4 = 0; r4 < NROWS; r4++) if (ROWW[r4] == null) ROWW[r4] = 0;

// ── the layout offset ───────────────────────────────────
// A PERMANENT displacement per row, and it is deliberately NOT
// part of home. home cancels in the animator, so anything folded
// into it never reaches the glyph — that was the v01 bug: the
// nulls stepped and the type did not.
//
// A slider per row was rejected: the row COUNT is dynamic once
// Auto Rows is on, so a fixed bank is either short or mostly
// idle, and it makes a clean staircase — the common case — a
// manual arithmetic exercise.
//
//   0 LINEAR     r * step         a staircase
//   1 ALTERNATE  (r % 2) * step   a brick / zigzag
//   2 CENTERED   (r - mid) * step a symmetric fan
//   3 FIT        distributed across Max Width
var RS = pnt("Row Step");
var RM = Math.round(ctl("Row Mode"));
var MW = ctl("Max Width");

function rowShift(r) {
  var sx, sy;
  if (RM === 3) {
    // Even LEFT edges: the row starts march evenly, so the eye
    // reads a staircase — it follows the leading edge. Row 0 sits
    // on the box's left edge and the LAST row's RIGHT edge lands
    // exactly on Max Width.
    var lastR = NROWS - 1;
    var span  = Math.max(0, MW - ROWW[lastR]);
    sx = (lastR > 0) ? (r / lastR) * span : 0;
    // Max Width governs X only, so a vertical step can be
    // combined with a horizontal fit.
    sy = r * RS[1];
  } else if (RM === 1) {
    sx = (r % 2) * RS[0];  sy = (r % 2) * RS[1];
  } else if (RM === 2) {
    var f = r - (NROWS - 1) / 2;
    sx = f * RS[0];  sy = f * RS[1];
  } else {
    sx = r * RS[0];  sy = r * RS[1];
  }
  if (RM === 3) {
    // The box is an invariant, not a suggestion. Clamping AFTER
    // the nudge is what makes that true: no combination of
    // controls can push a row out of the box. A row WIDER than
    // the box pins to 0 and raises [OUT] Fit Overflow px.
    var room = MW - ROWW[r];
    if (room < 0) room = 0;
    sx = Math.min(Math.max(sx, 0), room);
  }
  return [sx, sy];
}

// How far the widest row overruns the box. 0 when everything
// fits. Surfaced as a readout rather than silently corrected —
// auto-scaling the font to fit is what the v11-v16 experiments
// tried and it was abandoned as unpredictable.
function fitOverflow() {
  var over = 0;
  for (var q = 0; q < NROWS; q++) {
    var dd = ROWW[q] - MW;
    if (dd > over) over = dd;
  }
  return over;
}

// ── home · layout · motion ──────────────────────────────
// THE RULE: home is AE's layout, nothing more. It is the only
// term that cancels, so it must hold none of our intent.
//
//   homeOf    AE's natural layout. An ESTIMATE. Cancels.
//   layoutOf  permanent, applied, non-zero at rest.
//   motionOf  animated, applied, decays to zero.
//
// Because home is now pure, disabling a [POS] expression and
// dragging the null puts the glyph exactly where you dropped it.
var TL = thisComp.layer("[TXT] Words");
var TP = TL.position;
var AY = (NROWS - 1) * L / 2;

function homeOf(i) {
  if (i >= nW) return [TP[0], TP[1]];
  return [TP[0] + NATX[i], TP[1] + NATY[i] - AY];
}

function layoutOf(i) {
  if (i >= nW) return [0, 0];
  return rowShift(ROWOF[i]);
}

// ── the authored offset ─────────────────────────────────
// A RELATIVE displacement in pixels, so the move is identical
// whatever the copy is. It is measured from the word's STEPPED
// resting place, because layoutOf is applied alongside it — so a
// word flies in to its step, not to where it would have sat
// without one. Words past the slot cap get [0,0]: they still
// reveal on their spawn frame, they just do not move.
function offsetAuthored(i) {
  if (i >= SLOTS) return [0, 0];
  var p = pnt("W" + (i < 9 ? "0" : "") + (i + 1) + " Offset");
  return [p[0], p[1]];
}

// ── arrival order ───────────────────────────────────────
// Reading order reads mechanical and pure random reads sloppy.
// Disperse takes a seeded start, then repeatedly picks whichever
// word sits FARTHEST from the one that just landed, so
// consecutive arrivals never cluster. Same seed, same order —
// expressions cannot use Math.random and stay stable.
var ORD = [];
if (chk("Disperse") > 0 && nW > 1) {
  var seedN = Math.round(ctl("Order Seed")) & 0x7fffffff;
  function rnd() { seedN = (seedN * 1103515245 + 12345) & 0x7fffffff; return seedN / 0x7fffffff; }
  var pool = [];
  for (var i4 = 0; i4 < nW; i4++) pool.push(i4);
  ORD.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  while (pool.length) {
    var pv = ORD[ORD.length - 1], bj = 0, bd = -1;
    for (var j2 = 0; j2 < pool.length; j2++) {
      var ddx = NATX[pool[j2]] - NATX[pv], ddy = NATY[pool[j2]] - NATY[pv];
      var dd = ddx * ddx + ddy * ddy;
      if (dd > bd) { bd = dd; bj = j2; }
    }
    ORD.push(pool.splice(bj, 1)[0]);
  }
} else {
  for (var i5 = 0; i5 < nW; i5++) ORD.push(i5);
}

// ── the schedule ────────────────────────────────────────
// One phase. Stagger is the gap between two words APPEARING, and
// it says nothing about how long a move takes. Set it below
// span (4 * Hold Frames) and the appearances overlap; nothing
// special handles that and nothing needs to, because stepv is a
// pure function of the playhead and its own start frame.
var mv   = 3 * H;
var span = H + mv;
var TOTAL = (NW - 1) * SG + span;
if (TOTAL < 1) TOTAL = 1;

var SPAWN = [];
for (var i6 = 0; i6 < ORD.length; i6++) SPAWN[ORD[i6]] = i6 * SG;

var F = ctl("Progress") / 100 * TOTAL;

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
  if (F < start + H)     return s * TA;
  if (F < start + 2 * H) return s * TB;
  return 0;
}

// Both axes move together on the same start frame: this is one
// diagonal move, unlike rack-puzzle-01 where the seed goes
// vertical first and horizontal second.
//
// The move starts one Hold AFTER the spawn frame, so the word is
// visibly parked at its authored offset for a beat before it
// travels. Without that the word would appear already at Tail A
// and the offset you authored would never render.
function motionOf(i) {
  if (i >= nW) return [0, 0];
  var o = offsetAuthored(i);
  var s = (SPAWN[i] == null) ? 0 : SPAWN[i];
  return [stepv(o[0], s + H), stepv(o[1], s + H)];
}
// home CANCELS in the animator, so the two applied terms
// have to ride on top of it rather than inside it.
var i = 1;
var h = homeOf(i);
var l = layoutOf(i);
var m = motionOf(i);
[h[0] + l[0] + m[0], h[1] + l[1] + m[1]];