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

// Spawn needs the STAGGER and nothing else. mv, span and TOTAL
// belong to CLOCK; computing them here too would be three copies
// of one timing model waiting to disagree.
var SG = Math.max(0, ctl("Stagger"));

var __NX = [], __NY = [];
if (chk("Disperse") > 0 && nW > 1) {
  // Only the dispersal needs the layout, so only it pays for it.
  var __L = lead(), __SPW = spaceAdvance(), __pen = 0, __curR = -1;
  for (var i2 = 0; i2 < nW; i2++) {
    if (ROWOF[i2] !== __curR) { __curR = ROWOF[i2]; __pen = 0; }
    __NX[i2] = __pen;
    __NY[i2] = ROWOF[i2] * __L;
    __pen += wordWidth(i2) + __SPW;
  }
}

// Reading order reads mechanical and pure random reads sloppy.
// Disperse takes a seeded start, then repeatedly picks whichever
// word sits FARTHEST from the one that just landed, so consecutive
// arrivals never cluster. Same seed, same order - expressions
// cannot use Math.random and stay stable.
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
      var ddx = __NX[pool[j2]] - __NX[pv], ddy = __NY[pool[j2]] - __NY[pv];
      var dd2 = ddx * ddx + ddy * ddy;
      if (dd2 > bd) { bd = dd2; bj = j2; }
    }
    ORD.push(pool.splice(bj, 1)[0]);
  }
} else {
  for (var i5 = 0; i5 < nW; i5++) ORD.push(i5);
}

var SPAWN = [];
for (var i6 = 0; i6 < ORD.length; i6++) SPAWN[ORD[i6]] = i6 * SG;
var s = SPAWN[0];
(s == null) ? 0 : s;