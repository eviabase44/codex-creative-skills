var S = thisComp.layer("[SRC] Text").text.sourceText;

// Normalise EVERY flavour of line break to one sentinel.
// A typed Return arrives as \r, but pasted text can carry \n,
// \u0003 (AE's paragraph marker), \u000B (soft return) or the
// Unicode separators. Several of those are NOT whitespace, so
// leaving them in place makes split(/\s+/) glue two words into
// a single token — AE still renders the break, but every index
// downstream is wrong. That is the paste-vs-type bug.
//
// Zero-width characters are stripped outright: pasted text is
// full of them and they would otherwise become phantom glyphs.
var T = S.replace(/\r\n/g, "\r")
         .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
         .replace(/[\r\n\u0003\u000B\u2028\u2029\f]/g, " \u0001 ");

// \u0001 is a control char: not whitespace, so the sentinel
// survives the split and cannot collide with typed text.
var RAW = T.replace(/^\s+|\s+$/g, "").split(/\s+/);

var W = [], MAP = [], WOF = [];
for (var i = 0; i < RAW.length; i++) {
  if (RAW[i] !== "\u0001" && RAW[i] !== "") {
    WOF[i] = W.length; W.push(RAW[i]); MAP.push(i);
  } else { WOF[i] = -1; }
}
var N = Math.max(W.length, 1);
var pos = effect("Progress")("Slider") / 100 * N;
var count = Math.min(Math.max(Math.ceil(pos), 0), N);
var last = count > 0 ? MAP[count - 1] : -1;

var out = "";
for (var k = 0; k <= last; k++) {
  if (RAW[k] === "\u0001") { out += "\r"; }
  else { out += (out === "" || out.charAt(out.length - 1) === "\r" ? "" : " ") + RAW[k]; }
}
out;