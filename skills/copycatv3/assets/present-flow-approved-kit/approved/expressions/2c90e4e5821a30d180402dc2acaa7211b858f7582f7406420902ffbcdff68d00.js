var C=thisComp.layer("[CTRL] SH33 Offset"); function c(n){return C.effect(n)(1);}
var total=c("[OUT] Total (frames)"), f=clamp(c("Progress"),0,100)*total/100;
var role="Meta", he=c("[OUT] Enter Step (frames)"), st=Math.max(0,Math.round(c("Stagger (frames)")));
var spawn1=Math.max(0,c("W01 Delay (frames)")), spawn2=st+Math.max(0,c("W02 Delay (frames)")), spawn3=2*st+Math.max(0,c("W03 Delay (frames)"));
var entry=role=="Signal"?0:(role=="Meta"?spawn1+he:(role=="Code"?spawn2+he:spawn3+he));
var en=Math.max(4,Math.round(Math.max(0,c("Surround Enter Time (frames)"))/4)*4);
var exdur=Math.max(3,Math.round(Math.max(0,c("Surround Exit Time (frames)"))/3)*3);
entry=clamp(entry+c(role+" Entry Offset (frames)"),0,Math.max(0,total-en-exdur));
var exit=c("[OUT] Exit Begins (frames)");
exit=role=="Signal"?total-exdur:(role=="Meta"?total-exdur-6:(role=="Code"?exit+6:exit));
exit=clamp(exit+c(role+" Exit Offset (frames)"),entry+en,Math.max(entry+en,total-exdur));
function tail(v,d){var n=length(v);return n>0?v*(Math.min(d,n)/n):[0,0];}
var a=Math.max(0,c("Surround Tail A (px)")),b=Math.min(a,Math.max(0,c("Surround Tail B (px)")));
var vin=c(role+" Enter (px)"),vout=c(role+" Exit (px)"),t=f-entry,h=en/4,delta=[0,0];
if(t<h)delta=vin;else if(t<2*h)delta=tail(vin,a);else if(t<3*h)delta=tail(vin,b);
if(c("Run Exit") && f>=exit){var x=f-exit;delta=x<exdur/3?tail(vout,b):(x<2*exdur/3?tail(vout,a):vout);}
c("Animate Surroundings")?value+delta:value;