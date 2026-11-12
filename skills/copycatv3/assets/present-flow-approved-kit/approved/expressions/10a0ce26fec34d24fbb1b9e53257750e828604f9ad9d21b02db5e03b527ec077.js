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
  return (v > 0) ? v : 90;
}

var TE = Math.max(1, Math.round(mctl("T Enter")));
var TH = Math.max(0, Math.round(mctl("T Hold")));
var TX = Math.max(0, Math.round(mctl("T Exit")));
var TA = Math.abs(mctl("Tail A"));
var TB = Math.abs(mctl("Tail B"));

var HE = Math.max(1, Math.round(TE / 4));
var HX = (TX > 0) ? Math.max(1, Math.round(TX / 3)) : 0;
var life = TE + TH + TX;

// Read it, do not re-derive it.
var TOTAL = mctl("[OUT] Total Frames");
if (!(TOTAL > 0)) {
  // Older master with no readout: fall back to the same formula.
  TOTAL = (NW - 1) * Math.max(0, mctl("Stagger")) + life;
}
if (TOTAL < 1) TOTAL = 1;

var F = mctl("Progress") / 100 * TOTAL;
// Mirrors the master, so you can see at a glance whether the
// two are looking at the same shot length.
TOTAL;