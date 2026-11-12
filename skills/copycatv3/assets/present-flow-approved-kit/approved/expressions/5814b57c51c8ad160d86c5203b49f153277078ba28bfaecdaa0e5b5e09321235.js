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

// Size and leading come from the CONTROL surface, not from any
// layer. Sixteen probes and the stage all have to agree about the
// type, and the only way to guarantee that is for none of them to
// own it. The baked values are fallbacks for a comp whose [CTRL]
// went missing.
function fsz() {
  var v = 0;
  try { v = ctl("Font Size"); } catch (e) { v = 0; }
  return (v > 0) ? v : 90;
}

// Derived, not read off the paragraph. Reading the paragraph would
// leave the rows at the old spacing the moment the size changed —
// the same bug one level down.
// Thousandths of an em, AE's own unit. 0 is the font metrics.
function trk() {
  var v = 0;
  try { v = ctl("Tracking"); } catch (e) { v = 0; }
  return (v === null) ? 0 : v;
}

function lead() {
  var f = 0;
  try { f = ctl("Lead Factor"); } catch (e) { f = 0; }
  if (!(f > 0)) f = 1.1;
  return fsz() * f;
}

var ROWOF = [], NROWS = 1;
var nW = W.length;
var rr = 0, bi = 0;
for (var i0 = 0; i0 < nW; i0++) {
  if (bi < BRK.length && i0 === BRK[bi]) { rr++; bi++; }
  ROWOF[i0] = rr;
}
NROWS = rr + 1;

function probeW(nm) {
  try { return thisComp.layer(nm).sourceRectAtTime(0, false).width; }
  catch (e) { return 0; }
}
function wordWidth(i) {
  return probeW("[MEA] w" + (i < 9 ? "0" : "") + (i + 1));
}
function rowMeasured(r) {
  if (r >= 6) return 0;
  return probeW("[MEA] r" + (r < 9 ? "0" : "") + (r + 1));
}
function spaceAdvance() {
  var g = probeW("[MEA] sp2") - probeW("[MEA] sp1");
  return (g > 0) ? g : 0;
}

var SLOTS_N = 8;
var L   = lead();
var SPW = spaceAdvance();
var MW  = Math.max(0, ctl("Max Width"));

// ── natural layout ──────────────────────────────────────
// Row starts, and each word's x within its row. This is HOME:
// wherever AE's paragraph engine already put the word, so the
// offset at rest is zero and the type engine is never
// reproduced. It is an ESTIMATE — per-word widths plus the
// measured space advance, which still ignores pair kerning —
// and that is allowed precisely because home cancels.
var NATX = [], NATY = [], pen = 0, curR = -1;
for (var i2 = 0; i2 < nW; i2++) {
  if (ROWOF[i2] !== curR) { curR = ROWOF[i2]; pen = 0; }
  NATX[i2] = pen;
  NATY[i2] = ROWOF[i2] * L;
  pen += wordWidth(i2) + SPW;
}

// ── row widths ──────────────────────────────────────────
// MEASURED per row, not accumulated from the estimate above.
// Falls back to the estimate only for rows past the probe cap.
var ROWW = [];
for (var r0 = 0; r0 < NROWS; r0++) {
  var mw0 = rowMeasured(r0);
  if (mw0 > 0) { ROWW[r0] = mw0; continue; }
  var est = 0;
  for (var i3 = 0; i3 < nW; i3++) {
    if (ROWOF[i3] !== r0) continue;
    var rt = NATX[i3] + wordWidth(i3);
    if (rt > est) est = rt;
  }
  ROWW[r0] = est;
}

// ── the layout offset: the max-width fit ────────────────
// Max Width is a budget measured RIGHTWARD FROM POSITION. The
// block is left-justified with anchor x = 0, so Position.x is
// the left edge of every row.
//
//   row 0        starts on the box's left edge
//   last row     its RIGHT edge lands exactly on Max Width
//   in between   LEFT edges march evenly — that is what reads
//                as a staircase, because the eye follows the
//                leading edge, not the trailing one.
//
// This is NOT part of home. home cancels in the animator, so
// anything folded into it never reaches the glyph — that was
// the v01 bug: the nulls stepped and the type did not.
function rowShift(r) {
  var lastR = NROWS - 1;
  var fitSpan = Math.max(0, MW - ROWW[lastR]);
  var sx = (lastR > 0) ? (r / lastR) * fitSpan : 0;
  var sy = 0;
  // Opt-in per-row override, for the irregular layout the fit
  // cannot express. Added BEFORE the clamp, so it can never
  // push a row out of the box.
  if (r < 6) {
    try {
      var __nd = pnt("R" + (r + 1) + " Nudge");
      sx += __nd[0];
      // Y is deliberately NOT clamped. Max Width is a WIDTH
      // budget; there is no height budget to clamp against, so
      // a vertical nudge is free to lift a row clear of the
      // block. That is the whole point of having it.
      sy += __nd[1];
    } catch (e) {}
  }
  // The box is an invariant, not a suggestion.
  var room = MW - ROWW[r];
  if (room < 0) room = 0;
  return [Math.min(Math.max(sx, 0), room), sy];
}

// How far the widest row overruns the box. 0 when everything
// fits. Surfaced as a readout rather than silently corrected —
// auto-scaling the font to fit is what the v11-v16 experiments
// tried and it was abandoned as unpredictable.
function fitOverflow() {
  var over = 0;
  for (var q0 = 0; q0 < NROWS; q0++) {
    var dd = ROWW[q0] - MW;
    if (dd > over) over = dd;
  }
  return over;
}

// ── home · layout ───────────────────────────────────────
// THE RULE: home is AE's layout, nothing more. It is the only
// term that cancels, so it must hold none of our intent.
// Because home is pure, disabling a [POS] expression and
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
// whatever the copy is. Measured from the word's STEPPED
// resting place, because layoutOf is applied alongside it — so a
// word flies in to its step, not to where it would have sat
// without one. Words past the slot cap get [0,0]: they still
// reveal on their spawn frame, they just do not move.
function slotName(i) { return "W" + (i < 9 ? "0" : "") + (i + 1); }

function offsetEnter(i) {
  if (i >= SLOTS_N) return [0, 0];
  var p = pnt(slotName(i) + " Enter");
  return [p[0], p[1]];
}

function offsetExit(i) {
  if (i >= SLOTS_N) return [0, 0];
  var p = pnt(slotName(i) + " Exit");
  return [p[0], p[1]];
}
var i = 1;
var h = homeOf(i);
var l = layoutOf(i);
var a = offsetAuthored(i);
[h[0] + l[0] + a[0], h[1] + l[1] + a[1]];