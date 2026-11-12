var ID=1;var C=thisComp.layer("[CTRL] SH22 Motion");
function c(n){return C.effect(n)(1);}
function cl(v,a,b){return Math.max(a,Math.min(b,v));}
// Quantize real composition time, not an eased progress value.
var step=Math.max(1,Math.round(c("Hold Duration (frames)")));
var phase=((ID*Math.round(c("Per-Element Phase (frames)")))%step+step)%step;
var frame=(time-thisComp.displayStartTime)/thisComp.frameDuration;
var T=thisComp.displayStartTime+Math.max(0,Math.floor((frame+phase+.00001)/step)*step-phase)*thisComp.frameDuration;
var F=cl(c("Appearance Progress").valueAtTime(T),0,100)*32/100;
var angle=c("Rotation Angle (degrees)").valueAtTime(T)*Math.PI/180;
var pb=cl(c("Pullback Progress").valueAtTime(T),0,100)/100;
var zoom=1-cl(c("Pullback Amount (%)")/100,0,.45)*pb;
var center=c("Pullback Center"),pop=1;
var rankStarts=[0,2,4,6,8,10,12,14,16,18,10,12,16,20];
var start=Math.min(31,rankStarts[ID]*cl(c("Entrance Stagger (%)")/100,0,2));
var alpha=F>=start?100:0;

var start=17+C.effect("Cursor Delay (frames)")(1),u=cl((F-start)/4,0,1);
var travel=C.effect("Cursor Travel (px)")(1)*Math.pow(1-u,3);value+[travel,travel*.6];