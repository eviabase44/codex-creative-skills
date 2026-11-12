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

var SG = Math.max(0, ctl("Stagger"));
var H  = Math.max(1, Math.round(ctl("Hold Frames")));

// A word cuts in at its authored offset and HOLDS there one full
// Hold Frames before it starts stepping — otherwise it would
// already be at Tail A on the frame it becomes visible and the
// offset would never actually render. So the move is 3 steps and
// the whole appearance is 4.
var mv   = 3 * H;
var span = H + mv;
var TOTAL = (NW - 1) * SG + span;
if (TOTAL < 1) TOTAL = 1;

var s = ctl("Start");
var d = ctl("Duration");

// Duration 0 means NATIVE: run at TOTAL, the length the stagger
// and the moves actually add up to, so every step lasts exactly
// Hold Frames. Any other value time-scales the assembly —
// longer stretches the steps, on-4s becomes on-8s. To slow the
// rig without softening the staccato, raise Hold Frames and
// leave this at 0.
if (d <= 0) d = TOTAL;

// Floor to whole frames so the stepped cuts stay crisp even when
// Duration is not a multiple of the native length.
var f = Math.floor(time / thisComp.frameDuration + 1e-6);

linear(f, s, s + d, 0, 100);
