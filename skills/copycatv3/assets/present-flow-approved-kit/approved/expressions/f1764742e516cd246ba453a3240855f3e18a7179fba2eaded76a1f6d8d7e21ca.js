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
var count = Math.min(Math.max(Math.ceil(pos), 0), N);
var last  = count > 0 ? MAP[count - 1] : -1;

var out = "";
for (var k = 0; k <= last; k++) {
  if (RAW[k] === "\u0001") { out += "\r"; }
  else { out += (out === "" || out.charAt(out.length - 1) === "\r" ? "" : " ") + RAW[k]; }
}
out;