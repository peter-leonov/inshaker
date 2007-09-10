/* borderadius.js 1.0 (30-Aug-2007). (c) by Christian Effenberger. All Rights Reserved. Source: borderadius.netzgesta.de Distributed under NSL. License permits free of charge use on non-commercial and private web sites only */
var tmp=navigator.appName=='Microsoft Internet Explorer'&&navigator.userAgent.indexOf('Opera')<1?1:0;var isGe=navigator.userAgent.indexOf('Gecko')>-1&&navigator.userAgent.indexOf('Safari')<1?1:0;var isOp=navigator.userAgent.indexOf('Opera')>-1?1:0;if(tmp)var isIE=document.namespaces?1:0;if(isIE){if(document.namespaces['v']==null){var stl=document.createStyleSheet();stl.addRule("v\\:*","behavior: url(#default#VML);");document.namespaces.add("v","urn:schemas-microsoft-com:vml");}}
function hex2rgb(val,trans){if(val.indexOf('transparent')>-1)val="#000000";if(val.length==7){var tp1=Math.max(0,Math.min(parseInt(val.substr(1,2),16),255));var tp2=Math.max(0,Math.min(parseInt(val.substr(3,2),16),255));var tp3=Math.max(0,Math.min(parseInt(val.substr(5,2),16),255));return'rgba('+tp1+','+tp2+','+tp3+','+trans+')';}}
function parseTrans(c,w,s){if(c.indexOf('transparent')>-1){return 0.0;}else if(w<=0){return 0.0;}else if(s.match(/^(none|hidden)$/i)){return 0.0;}else{return 1.0;}}
function parseColor(val){if(val.indexOf('#')>-1||val.indexOf('transparent')>-1){return val;}else if(val.indexOf('rgb')>-1){var col=val.split("(")[1].split(")")[0].split(",");for(var i=0;i<3;i++){col[i]=(col[i]*1).toString(16);if(!col[i].match(/^[0-9a-f][0-9a-f]$/i))col[i]='0'+col[i];}
return"#"+col[0]+col[1]+col[2];}else{return"#000000";}}
function parseStyle(val){if(!val.match(/^(none|hidden|solid|dotted|dashed|double)$/i)){return'solid';}else{return val;}}
function parseWidth(val){if(val.match(/^thin$/i)){return 2;}else if(val.match(/^medium$/i)){return 4;}else if(val.match(/^thick$/i)){return 6;}else{return parseFloat(val);}}
function borderCorner(ctx,w,h,r,pos){ctx.beginPath();if(pos==0){ctx.moveTo(w,h);ctx.lineTo(0,h);if(r<h)ctx.lineTo(0,r);ctx.quadraticCurveTo(0,0,r,0);if(r<w)ctx.lineTo(w,0);}
if(pos==1){ctx.moveTo(0,h);ctx.lineTo(0,0);if(r<w)ctx.lineTo(w-r,0);ctx.quadraticCurveTo(w,0,w,r);if(r<h)ctx.lineTo(w,h);}
if(pos==2){ctx.moveTo(w,0);ctx.lineTo(0,0);if(r<h)ctx.lineTo(0,h-r);ctx.quadraticCurveTo(0,h,r,h);if(r<w)ctx.lineTo(w,h);}
if(pos==3){ctx.moveTo(0,0);ctx.lineTo(0,h);if(r<w)ctx.lineTo(w-r,h);ctx.quadraticCurveTo(w,h,w,h-r);if(r<h)ctx.lineTo(w,0);}
ctx.closePath();}
function borderCornerIE(w,h,r,pos){var path="m ";if(pos==0){path+=w+","+h+" l "+w+",0";if(r<w)path+=" l "+r+",0";path+=" qx 0,"+r;if(r<h)path+=" l 0,"+h;}
if(pos==1){path+="0,"+h+" l "+w+","+h;if(r<h)path+=" l "+w+","+r;path+=" qy "+(w-r)+",0";if(r<w)path+=" l 0,0";}
if(pos==2){path+=w+",0 l 0,0";if(r<h)path+=" l 0,"+(h-r);path+=" qy "+r+","+h;if(r<w)path+=" l "+w+","+h;}
if(pos==3){path+="0,0 l 0,"+h;if(r<w)path+=" l "+(w-r)+","+h;path+=" qx "+w+","+(h-r);if(r<h)path+=" l "+w+",0";}
path+=" x e";return path;}
function cornerBorder(ctx,w,h,r,pos,wa,wb){ctx.beginPath();if(pos==0){ctx.moveTo(wa,h);if(r<h)ctx.lineTo(wa,r);ctx.quadraticCurveTo(wa,wb,r,wb);if(r<w)ctx.lineTo(w,wb);ctx.lineTo(w,0);if(r<w)ctx.lineTo(r,0);ctx.quadraticCurveTo(0,0,0,r);if(r<h)ctx.lineTo(0,h);}
if(pos==1){ctx.moveTo(w-wa,h);if(r<h)ctx.lineTo(w-wa,r);ctx.quadraticCurveTo(w-wa,wb,w-r,wb);if(r<w)ctx.lineTo(0,wb);ctx.lineTo(0,0);if(r<w)ctx.lineTo(w-r,0);ctx.quadraticCurveTo(w,0,w,r);if(r<h)ctx.lineTo(w,h);}
if(pos==2){ctx.moveTo(wa,0);if(r<h)ctx.lineTo(wa,h-r);ctx.quadraticCurveTo(wa,h-wb,r,h-wb);if(r<w)ctx.lineTo(w,h-wb);ctx.lineTo(w,h);if(r<w)ctx.lineTo(r,h);ctx.quadraticCurveTo(0,h,0,h-r);if(r<h)ctx.lineTo(0,0);}
if(pos==3){ctx.moveTo(w-wa,0);if(r<h)ctx.lineTo(w-wa,h-r);ctx.quadraticCurveTo(w-wa,h-wb,w-r,h-wb);if(r<w)ctx.lineTo(0,h-wb);ctx.lineTo(0,h);if(r<w)ctx.lineTo(w-r,h);ctx.quadraticCurveTo(w,h,w,h-r);if(r<h)ctx.lineTo(w,0);}
ctx.closePath();}
function cornerBorderIE(w,h,r,pos,wa,wb){var path="m ";if(pos==0){path+=w+","+wb;if(r<w)path+=" l "+r+","+wb;path+=" qx "+wa+","+r;if(r<h)path+=" l "+wa+","+h;path+=" l 0,"+h;if(r<h)path+=" l 0,"+r;path+=" qy "+r+",0";if(r<w)path+=" l "+w+",0";}
if(pos==1){path+=w+","+h;if(r<h)path+=" l "+w+","+r;path+=" qy "+(w-r)+",0";if(r<w)path+=" l 0,0";path+=" l 0,"+wb;if(r<w)path+=" l "+(w-r)+","+wb;path+=" qx "+(w-wa)+","+r;if(r<h)path+=" l "+(w-wa)+","+h;}
if(pos==2){path+="0,0";if(r<h)path+=" l 0,"+(h-r);path+=" qy "+r+","+h;if(r<w)path+=" l "+w+","+h;path+=" l "+w+","+(h-wb);if(r<w)path+=" l "+r+","+(h-wb);path+=" qx "+wa+","+(h-r);if(r<h)path+=" l "+wa+",0";}
if(pos==3){path+="0,"+h;if(r<w)path+=" l "+(w-r)+","+h;path+=" qx "+w+","+(h-r);if(r<h)path+=" l "+w+",0";path+=" l "+(w-wa)+",0";if(r<h)path+=" l "+(w-wa)+","+(h-r);path+=" qy "+(w-r)+","+r;if(r<w)path+=" l 0,"+r;}
path+=" x e";return path;}
function fillBorder(ctx,x,y,w,h,coa,cob){var stl=ctx.createLinearGradient(x,y,w,h);stl.addColorStop(0,coa);stl.addColorStop(1,cob);return stl;}
function addBorderRadius()
{
	var image,object,parent,dummy,outer,inner,canvas,context,classNames,path;
	var tmp,radius,topr,botr;var cs='';var classes='';var newClasses='';
	var i,j,s,t,w,h,a,b,o,u,iw,ih,ltr,rtr,rbr,lbr,bgi,bgc,fwd,child;
	var tl,tr,bl,br,btc,bts,btw,brc,brs,brw,bbc,bbs,bbw,blc,bls,blw;
	var children=document.getElementsByTagName('div');
	var theobjects=new Array();
	for(i=0;i<children.length;i++){child=children[i];classNames=child.className.split(' ');
	for(j=0;j<classNames.length;j++){tmp=classNames[j];if(tmp.match(/^borderadius/i)){theobjects.push(child);break;}}}
for(i=0;i<theobjects.length;i++){object=theobjects[i];parent=object.parentNode;canvas=document.createElement('canvas');iw=0;ih=0;ltr=0;rtr=0;lbr=0;rbr=0;fwd=0;if(isIE||canvas.getContext){newClasses='';classes=object.className.split(' ');for(j=0;j<classes.length;j++){if(classes[j].indexOf("borderadius")==0){tmp=classes[j].substring(11);ltr=parseFloat(tmp.substr(0,2));ltr=(isNaN(ltr)?0:ltr);rtr=parseFloat(tmp.substr(2,2));rtr=(isNaN(rtr)?(isNaN(ltr)?0:ltr):rtr);lbr=parseFloat(tmp.substr(4,2));lbr=(isNaN(lbr)?(isNaN(ltr)?0:ltr):lbr);rbr=parseFloat(tmp.substr(6,2));rbr=(isNaN(rbr)?(isNaN(ltr)?0:ltr):rbr);}
if(classes[j].indexOf("fixedwidthdiv")==0)fwd=1;}
for(j=0;j<classes.length;j++){if(!classes[j].match(/^borderadius/i)){if(newClasses){newClasses+=' ';}
newClasses+=classes[j];}}
if(object.currentStyle){cs=object.currentStyle;}else if(document.defaultView&&document.defaultView.getComputedStyle){cs=document.defaultView.getComputedStyle(object,"");}else{cs=object.style;}
topr=Math.max(ltr,rtr);botr=Math.max(lbr,rbr);radius=Math.max(topr,botr);bgc=parseColor(cs.backgroundColor);if(cs.backgroundImage!='none'&&cs.backgroundImage!=''){bgi=cs.backgroundImage.split("(")[1].split(")")[0];image=new Image();image.src=bgi;iw=image.width;ih=image.height;}else{bgi="";}
if(radius>0&&(typeof cs.borderRadius)=="undefined"){btc=parseColor(cs.borderTopColor);bts=parseStyle(cs.borderTopStyle);btw=isIE?parseWidth(cs.borderTopWidth):parseFloat(cs.borderTopWidth);brc=parseColor(cs.borderRightColor);brs=parseStyle(cs.borderRightStyle);brw=isIE?parseWidth(cs.borderRightWidth):parseFloat(cs.borderRightWidth);bbc=parseColor(cs.borderBottomColor);bbs=parseStyle(cs.borderBottomStyle);bbw=isIE?parseWidth(cs.borderBottomWidth):parseFloat(cs.borderBottomWidth);blc=parseColor(cs.borderLeftColor);bls=parseStyle(cs.borderLeftStyle);blw=isIE?parseWidth(cs.borderLeftWidth):parseFloat(cs.borderLeftWidth);blp=parseFloat(cs.paddingLeft);btp=parseFloat(cs.paddingTop);brp=parseFloat(cs.paddingRight);bbp=parseFloat(cs.paddingBottom);dummy=document.createElement('div');parent.insertBefore(dummy,object);outer=document.createElement('div');outer.className=newClasses;outer.id=object.id;outer.title=object.title;s=outer.style;s.cssText=object.style.cssText;s.background='none';s.border='none';s.position=(cs.position=='static'?'relative':cs.position);s.paddingLeft=0+'px';s.paddingRight=0+'px';s.paddingTop=topr+'px';s.paddingBottom=botr+'px';if((fwd>0||object.style.width!='')&&cs.width!='auto')s.width=(parseFloat(cs.width)+(isOp?0:parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight)+blw+brw))+'px';if(isIE){s.height='1%';s.zoom=1;}else{s.height='auto';}
parent.replaceChild(outer,dummy);t=hex2rgb(bgc,bgc.indexOf('transparent')>-1?0.0:1.0);inner=document.createElement('div');s=inner.style;s.height=topr+'px';if(bgi!='')s.background='url('+bgi+') bottom left';s.backgroundColor=bgc;s.backgroundPosition='-'+topr+'px';s.marginBottom='0px';s.marginTop='-'+topr+'px';s.marginRight=topr+brw+'px';s.marginLeft=topr+blw+'px';s.borderTopWidth=btw+'px';s.borderTopStyle=bts;s.borderTopColor=btc;if(isIE){s.zoom=1;s.fontSize='0px';}
outer.appendChild(inner);inner=document.createElement('div');s=inner.style;s.left=0+'px';s.top=0+'px';if(bgi!='')s.background='url('+bgi+') top left';s.backgroundColor=bgc;s.position='relative';s.paddingTop=(btp>topr?btp-topr:0)+'px';s.paddingBottom=(bbp>botr?bbp-botr:0)+'px';s.paddingLeft=blp+'px';s.paddingRight=brp+'px';s.borderLeftWidth=blw+'px';s.borderLeftStyle=bls;s.borderLeftColor=blc;s.borderRightWidth=brw+'px';s.borderRightStyle=brs;s.borderRightColor=brc;outer.appendChild(inner);canvas=document.createElement('div');object.id='';object.title='';object.className='';s=object.style;s.cssText='';s.border='none';s.padding='0px';s.margin='0px';s.display=(isGe?'table':'inline-block');canvas=object;inner.appendChild(canvas);inner=document.createElement('div');s=inner.style;s.height=botr+'px';if(bgi!='')s.background='url('+bgi+') top left';s.backgroundColor=bgc;s.backgroundPosition='-'+botr+'px';s.marginTop='0px';s.marginBottom='-'+botr+'px';s.marginRight=botr+brw+'px';s.marginLeft=botr+blw+'px';s.borderBottomWidth=bbw+'px';s.borderBottomStyle=bbs;s.borderBottomColor=bbc;if(isIE){s.zoom=1;s.fontSize='0px';}
outer.appendChild(inner);if(ltr>0){w=topr+blw;h=topr+btw;o=parseTrans(blc,blw,bls);a=hex2rgb(o==1?blc:btc,o);u=parseTrans(btc,btw,bts);b=hex2rgb(u==1?btc:blc,u);if(isIE){w+=1;h+=1;a=(o==1?blc:btc);b=(u==1?btc:blc);lt=document.createElement(['<var style="zoom:1;overflow:hidden;display:block;position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;padding:0px;margin:0px;">'].join(''));path=borderCornerIE(w,h,ltr,0);t='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="'+bgc+'" coordorigin="0,0" coordsize="'+w+','+h+'" path="'+path+'" style="zoom:1;margin:0px;padding:0px;position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;"><v:fill ';if(bgi!='none'&&bgi!=''){t+='src='+bgi+' type="tile"';}else{t+='color="'+bgc+'"';}t+=' /></v:shape>';path=cornerBorderIE(w,h,ltr,0,blw,btw);s='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" coordorigin="0,0" coordsize="'+w+','+h+'" path="'+path+'" style="zoom:1;margin:0px;padding:0px;position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;"><v:fill method="linear sigma" type="gradient" angle="315" color="'+a+'" opacity="'+o+'" color2="'+b+'" a:opacity2="'+u+'" colors="25%'+a+', 75%'+b+'" /></v:shape>';lt.innerHTML=[t+s].join('');outer.appendChild(lt);}else{lt=document.createElement('canvas');lt.height=h;lt.width=w;lt.style.height=h+'px';lt.style.width=w+'px';lt.style.position='absolute';lt.style.left=0+'px';lt.style.top=0+'px';context=lt.getContext("2d");outer.appendChild(lt);context.clearRect(0,0,w,h);globalCompositeOperation="source-in";borderCorner(context,w,h,ltr,0);context.clip();context.fillStyle=t;context.fillRect(0,0,w,h);if(bgi!='none'&&bgi!=''&&iw>0&&ih>0){if(iw>=(w+w)&&ih>=(h+h)){context.drawImage(image,iw-w,ih-h,w,h,0,0,w,h);}else{context.drawImage(image,0,0);}}
cornerBorder(context,w,h,ltr,0,blw,btw);context.fillStyle=fillBorder(context,(isOp?0:blw),h,w,(isOp?0:btw),a,b);context.fill();}}else{inner=document.createElement('div');s=inner.style;s.position='absolute';if(bgi!='')s.background='url('+bgi+') bottom right';s.backgroundColor=bgc;s.width=topr+(isIE?2:0)+'px';s.height=topr+(isIE?1:0)+'px';s.left=0+'px';s.top=0+'px';s.borderWidth=btw+'px 0px 0px '+blw+'px';s.borderStyle=bts+' solid solid '+bls;s.borderColor=btc+' #000 #000 '+blc;if(isIE){s.zoom=1;s.fontSize='0px';}
outer.appendChild(inner);}
if(rtr>0){s=hex2rgb(bgc,bgc.indexOf('transparent')>-1?0.0:1.0);w=topr+brw;h=topr+btw;o=parseTrans(brc,brw,brs);a=hex2rgb(o==1?brc:btc,o);u=parseTrans(btc,btw,bts);b=hex2rgb(u==1?btc:brc,u);if(isIE){w+=1;h+=1;a=(o==1?brc:btc);b=(u==1?btc:brc);rt=document.createElement(['<var style="zoom:1;overflow:hidden;display:block;position:absolute;right:0px;top:0px;width:'+w+'px;height:'+h+'px;padding:0px;margin:0px;">'].join(''));path=borderCornerIE(w,h,rtr,1);t='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="'+bgc+'" coordorigin="0,0" coordsize="'+w+','+h+'" path="'+path+'" style="zoom:1;margin:0px;padding:0px;position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;"><v:fill ';if(bgi!='none'&&bgi!=''){t+='src='+bgi+' type="tile"';}else{t+='color="'+bgc+'"';}t+=' /></v:shape>';path=cornerBorderIE(w,h,rtr,1,brw,btw);s='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" coordorigin="0,0" coordsize="'+w+','+h+'" path="'+path+'" style="zoom:1;margin:0px;padding:0px;position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;"><v:fill method="linear sigma" type="gradient" angle="45" color="'+a+'" opacity="'+o+'" color2="'+b+'" a:opacity2="'+u+'" colors="25%'+a+', 75%'+b+'" /></v:shape>';rt.innerHTML=[t+s].join('');outer.appendChild(rt);}else{rt=document.createElement('canvas');rt.height=h;rt.width=w;rt.style.height=h+'px';rt.style.width=w+'px';rt.style.position='absolute';rt.style.right=0+'px';rt.style.top=0+'px';context=rt.getContext("2d");outer.appendChild(rt);context.clearRect(0,0,w,h);globalCompositeOperation="source-in";borderCorner(context,w,h,rtr,1);context.clip();context.fillStyle=t;context.fillRect(0,0,w,h);if(bgi!='none'&&bgi!=''&&iw>0&&ih>0){if(iw>=w&&ih>=(h+h)){context.drawImage(image,0,ih-h,w,h,0,0,w,h);}else{context.drawImage(image,0,0);}}
cornerBorder(context,w,h,rtr,1,brw,btw);context.fillStyle=fillBorder(context,(isOp?w:w-brw),h,0,(isOp?0:btw),a,b);context.fill();}}else{inner=document.createElement('div');s=inner.style;s.position='absolute';if(bgi!='')s.background='url('+bgi+') bottom left';s.backgroundColor=bgc;s.width=topr+(isIE?2:0)+'px';s.height=topr+(isIE?2:0)+'px';s.right=0+'px';s.top=0+'px';s.borderWidth=btw+'px '+brw+'px 0px 0px';s.borderStyle=bts+' '+brs+' solid solid';s.borderColor=btc+' '+brc+' #000 #000';if(isIE){s.zoom=1;s.fontSize='0px';}
outer.appendChild(inner);}
if(lbr>0){w=botr+blw;h=botr+bbw;o=parseTrans(blc,blw,bls);a=hex2rgb(o==1?blc:bbc,o);u=parseTrans(bbc,bbw,bbs);b=hex2rgb(u==1?bbc:blc,u);if(isIE){w+=1;h+=1;a=(o==1?blc:bbc);b=(u==1?bbc:blc);lb=document.createElement(['<var style="zoom:1;overflow:hidden;display:block;position:absolute;left:0px;bottom:0px;width:'+w+'px;height:'+h+'px;padding:0px;margin:0px;">'].join(''));path=borderCornerIE(w,h,lbr,2);t='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="'+bgc+'" coordorigin="0,0" coordsize="'+w+','+h+'" path="'+path+'" style="zoom:1;margin:0px;padding:0px;position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;"><v:fill ';if(bgi!='none'&&bgi!=''){t+='src='+bgi+' type="tile"';}else{t+='color="'+bgc+'"';}t+=' /></v:shape>';path=cornerBorderIE(w,h,lbr,2,blw,bbw);s='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" coordorigin="0,0" coordsize="'+w+','+h+'" path="'+path+'" style="zoom:1;margin:0px;padding:0px;position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;"><v:fill method="linear sigma" type="gradient" angle="225" color="'+a+'" opacity="'+o+'" color2="'+b+'" a:opacity2="'+u+'" colors="25%'+a+', 75%'+b+'" /></v:shape>';lb.innerHTML=[t+s].join('');outer.appendChild(lb);}else{lb=document.createElement('canvas');lb.height=h;lb.width=w;lb.style.height=h+'px';lb.style.width=w+'px';lb.style.position='absolute';lb.style.left=0+'px';lb.style.bottom=0+'px';context=lb.getContext("2d");outer.appendChild(lb);context.clearRect(0,0,w,h);globalCompositeOperation="source-in";borderCorner(context,w,h,lbr,2);context.clip();context.fillStyle=t;context.fillRect(0,0,w,h);if(bgi!='none'&&bgi!=''&&iw>0&&ih>0){if(iw>=(w+w)&&ih>=h){context.drawImage(image,iw-w,0,w,h,0,0,w,h);}else{context.drawImage(image,0,0);}}
cornerBorder(context,w,h,lbr,2,blw,bbw);context.fillStyle=fillBorder(context,(isOp?0:blw),0,w,(isOp?h:h-bbw),a,b);context.fill();}}else{inner=document.createElement('div');s=inner.style;s.position='absolute';s.backgroundColor=bgc;if(bgi!='')s.background='url('+bgi+') top right';s.width=botr+(isIE?2:0)+'px';s.height=botr+(isIE?2:0)+'px';s.left=0+'px';s.bottom=0+'px';s.borderWidth='0px 0px '+bbw+'px '+blw+'px';s.borderStyle='solid solid '+bbs+' '+bls;s.borderColor='#000 #000 '+bbc+' '+blc;if(isIE){s.zoom=1;s.fontSize='0px';}
outer.appendChild(inner);}
if(rbr>0){w=botr+brw;h=botr+bbw;o=parseTrans(brc,brw,brs);a=hex2rgb(o==1?brc:bbc,o);u=parseTrans(bbc,bbw,bbs);b=hex2rgb(u==1?bbc:brc,u);if(isIE){w+=1;h+=1;a=(o==1?brc:bbc);b=(u==1?bbc:brc);rb=document.createElement(['<var style="zoom:1;overflow:hidden;display:block;position:absolute;right:0px;bottom:0px;width:'+w+'px;height:'+h+'px;padding:0px;margin:0px;">'].join(''));path=borderCornerIE(w,h,rbr,3);t='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="'+bgc+'" coordorigin="0,0" coordsize="'+w+','+h+'" path="'+path+'" style="zoom:1;margin:0px;padding:0px;position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;"><v:fill ';if(bgi!='none'&&bgi!=''){t+='src='+bgi+' type="tile"';}else{t+='color="'+bgc+'"';}t+=' /></v:shape>';path=cornerBorderIE(w,h,rbr,3,brw,bbw);s='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" coordorigin="0,0" coordsize="'+w+','+h+'" path="'+path+'" style="zoom:1;margin:0px;padding:0px;position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;"><v:fill method="linear sigma" type="gradient" angle="135" color="'+a+'" opacity="'+o+'" color2="'+b+'" a:opacity2="'+u+'" colors="25%'+a+', 75%'+b+'" /></v:shape>';rb.innerHTML=[t+s].join('');outer.appendChild(rb);}else{rb=document.createElement('canvas');rb.height=h;rb.width=w;rb.style.height=h+'px';rb.style.width=w+'px';rb.style.position='absolute';rb.style.right=0+'px';rb.style.bottom=0+'px';context=rb.getContext("2d");outer.appendChild(rb);context.clearRect(0,0,w,h);globalCompositeOperation="source-in";borderCorner(context,w,h,rbr,3);context.clip();context.fillStyle=t;context.fillRect(0,0,w,h);if(bgi!='none'&&bgi!=''&&iw>0&&ih>0){if(iw>=w&&ih>=h){context.drawImage(image,0,0,w,h,0,0,w,h);}else{context.drawImage(image,0,0);}}
cornerBorder(context,w,h,rbr,3,brw,bbw);context.fillStyle=fillBorder(context,(isOp?w:w-brw),0,0,(isOp?h:h-bbw),a,b);context.fill();}}else{inner=document.createElement('div');s=inner.style;s.position='absolute';s.backgroundColor=bgc;if(bgi!='')s.background='url('+bgi+') top left';s.width=botr+(isIE?2:0)+'px';s.height=botr+(isIE?2:0)+'px';s.right=0+'px';s.bottom=0+'px';s.borderWidth='0px '+brw+'px '+bbw+'px 0px';s.borderStyle='solid '+brs+' '+bbs+' solid';s.borderColor='#000 '+brc+' '+bbc+' #000';if(isIE){s.zoom=1;s.fontSize='0px';}
outer.appendChild(inner);}}}}}
var bordersOnload=window.onload;window.onload=function(){if(bordersOnload)bordersOnload();addBorderRadius();}