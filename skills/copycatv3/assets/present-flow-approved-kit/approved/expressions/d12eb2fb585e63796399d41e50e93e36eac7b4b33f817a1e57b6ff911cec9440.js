var S = thisComp.layer("[SRC] Text").text.sourceText;
var T = S.replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
         .replace(/[\r\n\u0003\u000B\u2028\u2029\f]/g, " ");
var W = T.replace(/^\s+|\s+$/g, "").split(/\s+/);
if (W.length === 1 && W[0] === "") W = [];
var NW = Math.max(W.length, 1);

// Two control layers: M is the rig we attach to, G is our own.
var M = thisComp.layer("[CTRL] Master");
var G = thisComp.layer("[CTRL] Ghost");
function mctl(n) { try { return M.effect(n)("Slider"); } catch (e) { return 0; } }
function gctl(n) { try { return G.effect(n)("Slider"); } catch (e) { return 0; } }
function gpnt(n) { try { return G.effect(n)("Point");  } catch (e) { return [0, 0]; } }
function gchk(n) { try { return G.effect(n)("Checkbox"); } catch (e) { return 0; } }
function gcol(n) { try { return G.effect(n)("Color"); } catch (e) { return [1, 1, 1, 1]; } }

// Size comes from the MASTER, so the ghost is a scaled copy of the
// same type rather than a second opinion about it. Scale % does the
// blowing up.
function mfsz() {
  var v = mctl("Font Size");
  return (v > 0) ? v : 326;
}

// ONE LINE by definition: the words are joined with spaces and
// the row breaks dropped. The ghost is a copy of the WORDS, not
// of the layout.
var OUT = W.join(" ");
if (gchk("Uppercase") > 0) OUT = OUT.toUpperCase();

// Uppercase happens HERE, not by restyling, so it cannot drift
// from the source and costs nothing.
var __res = null;
try {
  var __st = text.sourceText.style;
  try {
    var __src = thisComp.layer("[SRC] Text").text.sourceText.style;
    __st = __st.setFont(__src.font);
  } catch (e) {}
  try { __st = __st.setAutoLeading(false); } catch (e) {}
  __st = __st.setFontSize(mfsz());
  try { __st = __st.setTracking(gctl("Tracking")); } catch (e) {}
  try { __st = __st.setFillColor(gcol("Color")); } catch (e) {}
  __res = __st.setText(OUT);
} catch (e) { __res = null; }

__res !== null ? __res : OUT;