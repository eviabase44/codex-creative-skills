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
// The row count is not a parameter. It is the number of
// Returns in [SRC] Text, read straight off the string.
NROWS;