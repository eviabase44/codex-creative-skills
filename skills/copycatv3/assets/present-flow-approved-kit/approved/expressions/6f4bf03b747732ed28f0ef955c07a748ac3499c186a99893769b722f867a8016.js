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

var SG = Math.max(0, ctl("Stagger"));

// ── the three durations ─────────────────────────────────
// You set how long each PART takes and the rig derives the step,
// rather than the other way round.
//
// ENTER is 4 beats. The word cuts in at its Enter offset and
// HOLDS there one beat before travelling - without that beat it
// would already be at Tail A on the frame it becomes visible, and
// the offset you authored would never render. Then two tails,
// then home.
//
// EXIT is 3 beats and has no park beat: the word is already
// visible at home through the hold, so it leaves immediately. The
// tails run in REVERSE, which reads as acceleration away rather
// than a settle - the mirror of the entrance.
//
// T Exit 0 means the words never leave.
var TE = Math.max(1, Math.round(ctl("T Enter")));
var TH = Math.max(0, Math.round(ctl("T Hold")));
var TX = Math.max(0, Math.round(ctl("T Exit")));

var HE = Math.max(1, Math.round(TE / 4));
var HX = (TX > 0) ? Math.max(1, Math.round(TX / 3)) : 0;

// How long one word is on screen, start to finish.
var life = TE + TH + TX;

var TOTAL = (NW - 1) * SG + life;
if (TOTAL < 1) TOTAL = 1;
// T Exit / 3. Zero means the words never leave.
HX;