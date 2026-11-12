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

// Rebuild the string with the SOLVED row breaks, so Auto
// Rows actually re-flows the type rather than just moving
// words around under a fixed set of returns.
var out = "";
for (var i = 0; i < W.length; i++) {
  if (i > 0) out += (ROWOF[i] !== ROWOF[i - 1]) ? "\r" : " ";
  out += W[i];
}
out;