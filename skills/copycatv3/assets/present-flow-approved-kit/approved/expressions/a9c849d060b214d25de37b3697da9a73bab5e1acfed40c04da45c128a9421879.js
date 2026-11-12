var I=1; var P="W02";
var C=thisComp.layer("[CTRL] SH33 Offset"); function c(n){return C.effect(n)(1);}
var f=clamp(c("Progress"),0,100)*c("[OUT] Total (frames)")/100;
var he=c("[OUT] Enter Step (frames)"), hx=c("[OUT] Exit Step (frames)");
var spawn=I*Math.max(0,Math.round(c("Stagger (frames)")))+Math.max(0,Math.round(c(P+" Delay (frames)")));
var rank=c("Reverse Exit Order")?2-I:I;
var ex=c("[OUT] Exit Begins (frames)")+rank*Math.max(0,Math.round(c("Exit Stagger (frames)")));
var a=Math.max(0,c("Tail A (px)")), b=Math.min(a,Math.max(0,c("Tail B (px)")));
function tail(v,d){var n=length(v);return n>0?v*(Math.min(d,n)/n):[0,0];}
var vin=c(P+" Enter (px)"), vout=c(P+" Exit (px)"), t=f-spawn, delta=[0,0];
if(t<he)delta=vin; else if(t<2*he)delta=tail(vin,a); else if(t<3*he)delta=tail(vin,b);
if(c("Run Exit") && f>=ex){var x=f-ex;delta=x<hx?tail(vout,b):(x<2*hx?tail(vout,a):vout);}
value+delta;