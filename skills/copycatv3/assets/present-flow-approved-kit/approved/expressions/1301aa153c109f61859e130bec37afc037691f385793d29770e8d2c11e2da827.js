var I=2; var P="W03";
var C=thisComp.layer("[CTRL] SH33 Offset"); function c(n){return C.effect(n)(1);}
var f=clamp(c("Progress"),0,100)*c("[OUT] Total (frames)")/100;
var he=c("[OUT] Enter Step (frames)"), hx=c("[OUT] Exit Step (frames)");
var spawn=I*Math.max(0,Math.round(c("Stagger (frames)")))+Math.max(0,Math.round(c(P+" Delay (frames)")));
var rank=c("Reverse Exit Order")?2-I:I;
var ex=c("[OUT] Exit Begins (frames)")+rank*Math.max(0,Math.round(c("Exit Stagger (frames)")));
(f<=0 || f<spawn || (c("Run Exit") && f>=ex+3*hx))?0:value;