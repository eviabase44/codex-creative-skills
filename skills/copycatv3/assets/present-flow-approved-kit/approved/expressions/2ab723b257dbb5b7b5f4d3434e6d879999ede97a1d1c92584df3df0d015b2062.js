var S = thisComp.layer("[SRC] Text").text.sourceText;

// Line breaks arrive as \r. Splitting on /\s+/ would swallow
// them, so swap each one for a sentinel token first. \u0001 is
// a control char: it is not whitespace, so it survives the
// split, and it cannot occur in text anyone actually types.
var T = S.replace(/\r\n|\r|\n/g, " \u0001 ");
var RAW = T.replace(/^\s+|\s+$/g, "").split(/\s+/);

var W = [], MAP = [];
for (var i = 0; i < RAW.length; i++) {
  if (RAW[i] !== "\u0001" && RAW[i] !== "") { W.push(RAW[i]); MAP.push(i); }
}
var N = Math.max(W.length, 1);
var pos = effect("Progress")("Slider") / 100 * N;

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

  var count = Math.min(Math.max(Math.ceil(pos), 0), N);
  var lc = count > 0 ? LINE[count - 1] : 0;   // newest line index
  out = [0, lc * L];
}

out;