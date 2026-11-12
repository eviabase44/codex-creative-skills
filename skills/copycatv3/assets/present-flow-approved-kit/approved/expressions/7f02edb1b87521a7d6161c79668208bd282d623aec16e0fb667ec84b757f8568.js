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

var LINE = [], FIRST = [];
var ln = 0, j = 0;
for (var q = 0; q < RAW.length; q++) {
  if (RAW[q] === "\u0001") { ln++; }
  else if (RAW[q] !== "") {
    LINE[j] = ln;
    if (FIRST[ln] == null) FIRST[ln] = j;
    j++;
  }
}

var out = [0, 0];

if (effect("Pin Bottom")("Checkbox") > 0) {

  // What one line is worth. Read the live paragraph leading so
  // restyling in the Character panel is picked up automatically;
  // fall back to the value baked in at build if the style API is
  // unavailable on this AE build.
  var L;
  try { L = text.sourceText.style.leading; } catch (e) { L = 0; }
  if (!L || L <= 0) L = 108;

  var lc = count > 0 ? LINE[count - 1] : 0;   // newest line index
  out = [0, lc * L];
}

out;