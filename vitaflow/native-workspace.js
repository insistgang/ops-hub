/* Generated VitaFlow runs in one lexical scope; this file supplies the native shell. */
// Vendor code must capture the browser's actual globals, outside the app facades.
(function () {
  if (window.OpsVitaFlowNative) return;

(function() {
var module = undefined;
var exports = undefined;
var define = undefined;
/**
 * Skipped minification because the original files appears to be already minified.
 * Original file: /npm/chart.js@4.4.0/dist/chart.umd.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
/*!
 * Chart.js v4.4.0
 * https://www.chartjs.org
 * (c) 2023 Chart.js Contributors
 * Released under the MIT License
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).Chart=e()}(this,(function(){"use strict";var t=Object.freeze({__proto__:null,get Colors(){return Go},get Decimation(){return Qo},get Filler(){return ma},get Legend(){return ya},get SubTitle(){return ka},get Title(){return Ma},get Tooltip(){return Ba}});function e(){}const i=(()=>{let t=0;return()=>t++})();function s(t){return null==t}function n(t){if(Array.isArray&&Array.isArray(t))return!0;const e=Object.prototype.toString.call(t);return"[object"===e.slice(0,7)&&"Array]"===e.slice(-6)}function o(t){return null!==t&&"[object Object]"===Object.prototype.toString.call(t)}function a(t){return("number"==typeof t||t instanceof Number)&&isFinite(+t)}function r(t,e){return a(t)?t:e}function l(t,e){return void 0===t?e:t}const h=(t,e)=>"string"==typeof t&&t.endsWith("%")?parseFloat(t)/100:+t/e,c=(t,e)=>"string"==typeof t&&t.endsWith("%")?parseFloat(t)/100*e:+t;function d(t,e,i){if(t&&"function"==typeof t.call)return t.apply(i,e)}function u(t,e,i,s){let a,r,l;if(n(t))if(r=t.length,s)for(a=r-1;a>=0;a--)e.call(i,t[a],a);else for(a=0;a<r;a++)e.call(i,t[a],a);else if(o(t))for(l=Object.keys(t),r=l.length,a=0;a<r;a++)e.call(i,t[l[a]],l[a])}function f(t,e){let i,s,n,o;if(!t||!e||t.length!==e.length)return!1;for(i=0,s=t.length;i<s;++i)if(n=t[i],o=e[i],n.datasetIndex!==o.datasetIndex||n.index!==o.index)return!1;return!0}function g(t){if(n(t))return t.map(g);if(o(t)){const e=Object.create(null),i=Object.keys(t),s=i.length;let n=0;for(;n<s;++n)e[i[n]]=g(t[i[n]]);return e}return t}function p(t){return-1===["__proto__","prototype","constructor"].indexOf(t)}function m(t,e,i,s){if(!p(t))return;const n=e[t],a=i[t];o(n)&&o(a)?b(n,a,s):e[t]=g(a)}function b(t,e,i){const s=n(e)?e:[e],a=s.length;if(!o(t))return t;const r=(i=i||{}).merger||m;let l;for(let e=0;e<a;++e){if(l=s[e],!o(l))continue;const n=Object.keys(l);for(let e=0,s=n.length;e<s;++e)r(n[e],t,l,i)}return t}function x(t,e){return b(t,e,{merger:_})}function _(t,e,i){if(!p(t))return;const s=e[t],n=i[t];o(s)&&o(n)?x(s,n):Object.prototype.hasOwnProperty.call(e,t)||(e[t]=g(n))}const y={"":t=>t,x:t=>t.x,y:t=>t.y};function v(t){const e=t.split("."),i=[];let s="";for(const t of e)s+=t,s.endsWith("\\")?s=s.slice(0,-1)+".":(i.push(s),s="");return i}function M(t,e){const i=y[e]||(y[e]=function(t){const e=v(t);return t=>{for(const i of e){if(""===i)break;t=t&&t[i]}return t}}(e));return i(t)}function w(t){return t.charAt(0).toUpperCase()+t.slice(1)}const k=t=>void 0!==t,S=t=>"function"==typeof t,P=(t,e)=>{if(t.size!==e.size)return!1;for(const i of t)if(!e.has(i))return!1;return!0};function D(t){return"mouseup"===t.type||"click"===t.type||"contextmenu"===t.type}const C=Math.PI,O=2*C,A=O+C,T=Number.POSITIVE_INFINITY,L=C/180,E=C/2,R=C/4,I=2*C/3,z=Math.log10,F=Math.sign;function V(t,e,i){return Math.abs(t-e)<i}function B(t){const e=Math.round(t);t=V(t,e,t/1e3)?e:t;const i=Math.pow(10,Math.floor(z(t))),s=t/i;return(s<=1?1:s<=2?2:s<=5?5:10)*i}function W(t){const e=[],i=Math.sqrt(t);let s;for(s=1;s<i;s++)t%s==0&&(e.push(s),e.push(t/s));return i===(0|i)&&e.push(i),e.sort(((t,e)=>t-e)).pop(),e}function N(t){return!isNaN(parseFloat(t))&&isFinite(t)}function H(t,e){const i=Math.round(t);return i-e<=t&&i+e>=t}function j(t,e,i){let s,n,o;for(s=0,n=t.length;s<n;s++)o=t[s][i],isNaN(o)||(e.min=Math.min(e.min,o),e.max=Math.max(e.max,o))}function $(t){return t*(C/180)}function Y(t){return t*(180/C)}function U(t){if(!a(t))return;let e=1,i=0;for(;Math.round(t*e)/e!==t;)e*=10,i++;return i}function X(t,e){const i=e.x-t.x,s=e.y-t.y,n=Math.sqrt(i*i+s*s);let o=Math.atan2(s,i);return o<-.5*C&&(o+=O),{angle:o,distance:n}}function q(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}function K(t,e){return(t-e+A)%O-C}function G(t){return(t%O+O)%O}function Z(t,e,i,s){const n=G(t),o=G(e),a=G(i),r=G(o-n),l=G(a-n),h=G(n-o),c=G(n-a);return n===o||n===a||s&&o===a||r>l&&h<c}function J(t,e,i){return Math.max(e,Math.min(i,t))}function Q(t){return J(t,-32768,32767)}function tt(t,e,i,s=1e-6){return t>=Math.min(e,i)-s&&t<=Math.max(e,i)+s}function et(t,e,i){i=i||(i=>t[i]<e);let s,n=t.length-1,o=0;for(;n-o>1;)s=o+n>>1,i(s)?o=s:n=s;return{lo:o,hi:n}}const it=(t,e,i,s)=>et(t,i,s?s=>{const n=t[s][e];return n<i||n===i&&t[s+1][e]===i}:s=>t[s][e]<i),st=(t,e,i)=>et(t,i,(s=>t[s][e]>=i));function nt(t,e,i){let s=0,n=t.length;for(;s<n&&t[s]<e;)s++;for(;n>s&&t[n-1]>i;)n--;return s>0||n<t.length?t.slice(s,n):t}const ot=["push","pop","shift","splice","unshift"];function at(t,e){t._chartjs?t._chartjs.listeners.push(e):(Object.defineProperty(t,"_chartjs",{configurable:!0,enumerable:!1,value:{listeners:[e]}}),ot.forEach((e=>{const i="_onData"+w(e),s=t[e];Object.defineProperty(t,e,{configurable:!0,enumerable:!1,value(...e){const n=s.apply(this,e);return t._chartjs.listeners.forEach((t=>{"function"==typeof t[i]&&t[i](...e)})),n}})})))}function rt(t,e){const i=t._chartjs;if(!i)return;const s=i.listeners,n=s.indexOf(e);-1!==n&&s.splice(n,1),s.length>0||(ot.forEach((e=>{delete t[e]})),delete t._chartjs)}function lt(t){const e=new Set(t);return e.size===t.length?t:Array.from(e)}const ht="undefined"==typeof window?function(t){return t()}:window.requestAnimationFrame;function ct(t,e){let i=[],s=!1;return function(...n){i=n,s||(s=!0,ht.call(window,(()=>{s=!1,t.apply(e,i)})))}}function dt(t,e){let i;return function(...s){return e?(clearTimeout(i),i=setTimeout(t,e,s)):t.apply(this,s),e}}const ut=t=>"start"===t?"left":"end"===t?"right":"center",ft=(t,e,i)=>"start"===t?e:"end"===t?i:(e+i)/2,gt=(t,e,i,s)=>t===(s?"left":"right")?i:"center"===t?(e+i)/2:e;function pt(t,e,i){const s=e.length;let n=0,o=s;if(t._sorted){const{iScale:a,_parsed:r}=t,l=a.axis,{min:h,max:c,minDefined:d,maxDefined:u}=a.getUserBounds();d&&(n=J(Math.min(it(r,l,h).lo,i?s:it(e,l,a.getPixelForValue(h)).lo),0,s-1)),o=u?J(Math.max(it(r,a.axis,c,!0).hi+1,i?0:it(e,l,a.getPixelForValue(c),!0).hi+1),n,s)-n:s-n}return{start:n,count:o}}function mt(t){const{xScale:e,yScale:i,_scaleRanges:s}=t,n={xmin:e.min,xmax:e.max,ymin:i.min,ymax:i.max};if(!s)return t._scaleRanges=n,!0;const o=s.xmin!==e.min||s.xmax!==e.max||s.ymin!==i.min||s.ymax!==i.max;return Object.assign(s,n),o}class bt{constructor(){this._request=null,this._charts=new Map,this._running=!1,this._lastDate=void 0}_notify(t,e,i,s){const n=e.listeners[s],o=e.duration;n.forEach((s=>s({chart:t,initial:e.initial,numSteps:o,currentStep:Math.min(i-e.start,o)})))}_refresh(){this._request||(this._running=!0,this._request=ht.call(window,(()=>{this._update(),this._request=null,this._running&&this._refresh()})))}_update(t=Date.now()){let e=0;this._charts.forEach(((i,s)=>{if(!i.running||!i.items.length)return;const n=i.items;let o,a=n.length-1,r=!1;for(;a>=0;--a)o=n[a],o._active?(o._total>i.duration&&(i.duration=o._total),o.tick(t),r=!0):(n[a]=n[n.length-1],n.pop());r&&(s.draw(),this._notify(s,i,t,"progress")),n.length||(i.running=!1,this._notify(s,i,t,"complete"),i.initial=!1),e+=n.length})),this._lastDate=t,0===e&&(this._running=!1)}_getAnims(t){const e=this._charts;let i=e.get(t);return i||(i={running:!1,initial:!0,items:[],listeners:{complete:[],progress:[]}},e.set(t,i)),i}listen(t,e,i){this._getAnims(t).listeners[e].push(i)}add(t,e){e&&e.length&&this._getAnims(t).items.push(...e)}has(t){return this._getAnims(t).items.length>0}start(t){const e=this._charts.get(t);e&&(e.running=!0,e.start=Date.now(),e.duration=e.items.reduce(((t,e)=>Math.max(t,e._duration)),0),this._refresh())}running(t){if(!this._running)return!1;const e=this._charts.get(t);return!!(e&&e.running&&e.items.length)}stop(t){const e=this._charts.get(t);if(!e||!e.items.length)return;const i=e.items;let s=i.length-1;for(;s>=0;--s)i[s].cancel();e.items=[],this._notify(t,e,Date.now(),"complete")}remove(t){return this._charts.delete(t)}}var xt=new bt;
/*!
 * @kurkle/color v0.3.2
 * https://github.com/kurkle/color#readme
 * (c) 2023 Jukka Kurkela
 * Released under the MIT License
 */function _t(t){return t+.5|0}const yt=(t,e,i)=>Math.max(Math.min(t,i),e);function vt(t){return yt(_t(2.55*t),0,255)}function Mt(t){return yt(_t(255*t),0,255)}function wt(t){return yt(_t(t/2.55)/100,0,1)}function kt(t){return yt(_t(100*t),0,100)}const St={0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,A:10,B:11,C:12,D:13,E:14,F:15,a:10,b:11,c:12,d:13,e:14,f:15},Pt=[..."0123456789ABCDEF"],Dt=t=>Pt[15&t],Ct=t=>Pt[(240&t)>>4]+Pt[15&t],Ot=t=>(240&t)>>4==(15&t);function At(t){var e=(t=>Ot(t.r)&&Ot(t.g)&&Ot(t.b)&&Ot(t.a))(t)?Dt:Ct;return t?"#"+e(t.r)+e(t.g)+e(t.b)+((t,e)=>t<255?e(t):"")(t.a,e):void 0}const Tt=/^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;function Lt(t,e,i){const s=e*Math.min(i,1-i),n=(e,n=(e+t/30)%12)=>i-s*Math.max(Math.min(n-3,9-n,1),-1);return[n(0),n(8),n(4)]}function Et(t,e,i){const s=(s,n=(s+t/60)%6)=>i-i*e*Math.max(Math.min(n,4-n,1),0);return[s(5),s(3),s(1)]}function Rt(t,e,i){const s=Lt(t,1,.5);let n;for(e+i>1&&(n=1/(e+i),e*=n,i*=n),n=0;n<3;n++)s[n]*=1-e-i,s[n]+=e;return s}function It(t){const e=t.r/255,i=t.g/255,s=t.b/255,n=Math.max(e,i,s),o=Math.min(e,i,s),a=(n+o)/2;let r,l,h;return n!==o&&(h=n-o,l=a>.5?h/(2-n-o):h/(n+o),r=function(t,e,i,s,n){return t===n?(e-i)/s+(e<i?6:0):e===n?(i-t)/s+2:(t-e)/s+4}(e,i,s,h,n),r=60*r+.5),[0|r,l||0,a]}function zt(t,e,i,s){return(Array.isArray(e)?t(e[0],e[1],e[2]):t(e,i,s)).map(Mt)}function Ft(t,e,i){return zt(Lt,t,e,i)}function Vt(t){return(t%360+360)%360}function Bt(t){const e=Tt.exec(t);let i,s=255;if(!e)return;e[5]!==i&&(s=e[6]?vt(+e[5]):Mt(+e[5]));const n=Vt(+e[2]),o=+e[3]/100,a=+e[4]/100;return i="hwb"===e[1]?function(t,e,i){return zt(Rt,t,e,i)}(n,o,a):"hsv"===e[1]?function(t,e,i){return zt(Et,t,e,i)}(n,o,a):Ft(n,o,a),{r:i[0],g:i[1],b:i[2],a:s}}const Wt={x:"dark",Z:"light",Y:"re",X:"blu",W:"gr",V:"medium",U:"slate",A:"ee",T:"ol",S:"or",B:"ra",C:"lateg",D:"ights",R:"in",Q:"turquois",E:"hi",P:"ro",O:"al",N:"le",M:"de",L:"yello",F:"en",K:"ch",G:"arks",H:"ea",I:"ightg",J:"wh"},Nt={OiceXe:"f0f8ff",antiquewEte:"faebd7",aqua:"ffff",aquamarRe:"7fffd4",azuY:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"0",blanKedOmond:"ffebcd",Xe:"ff",XeviTet:"8a2be2",bPwn:"a52a2a",burlywood:"deb887",caMtXe:"5f9ea0",KartYuse:"7fff00",KocTate:"d2691e",cSO:"ff7f50",cSnflowerXe:"6495ed",cSnsilk:"fff8dc",crimson:"dc143c",cyan:"ffff",xXe:"8b",xcyan:"8b8b",xgTMnPd:"b8860b",xWay:"a9a9a9",xgYF:"6400",xgYy:"a9a9a9",xkhaki:"bdb76b",xmagFta:"8b008b",xTivegYF:"556b2f",xSange:"ff8c00",xScEd:"9932cc",xYd:"8b0000",xsOmon:"e9967a",xsHgYF:"8fbc8f",xUXe:"483d8b",xUWay:"2f4f4f",xUgYy:"2f4f4f",xQe:"ced1",xviTet:"9400d3",dAppRk:"ff1493",dApskyXe:"bfff",dimWay:"696969",dimgYy:"696969",dodgerXe:"1e90ff",fiYbrick:"b22222",flSOwEte:"fffaf0",foYstWAn:"228b22",fuKsia:"ff00ff",gaRsbSo:"dcdcdc",ghostwEte:"f8f8ff",gTd:"ffd700",gTMnPd:"daa520",Way:"808080",gYF:"8000",gYFLw:"adff2f",gYy:"808080",honeyMw:"f0fff0",hotpRk:"ff69b4",RdianYd:"cd5c5c",Rdigo:"4b0082",ivSy:"fffff0",khaki:"f0e68c",lavFMr:"e6e6fa",lavFMrXsh:"fff0f5",lawngYF:"7cfc00",NmoncEffon:"fffacd",ZXe:"add8e6",ZcSO:"f08080",Zcyan:"e0ffff",ZgTMnPdLw:"fafad2",ZWay:"d3d3d3",ZgYF:"90ee90",ZgYy:"d3d3d3",ZpRk:"ffb6c1",ZsOmon:"ffa07a",ZsHgYF:"20b2aa",ZskyXe:"87cefa",ZUWay:"778899",ZUgYy:"778899",ZstAlXe:"b0c4de",ZLw:"ffffe0",lime:"ff00",limegYF:"32cd32",lRF:"faf0e6",magFta:"ff00ff",maPon:"800000",VaquamarRe:"66cdaa",VXe:"cd",VScEd:"ba55d3",VpurpN:"9370db",VsHgYF:"3cb371",VUXe:"7b68ee",VsprRggYF:"fa9a",VQe:"48d1cc",VviTetYd:"c71585",midnightXe:"191970",mRtcYam:"f5fffa",mistyPse:"ffe4e1",moccasR:"ffe4b5",navajowEte:"ffdead",navy:"80",Tdlace:"fdf5e6",Tive:"808000",TivedBb:"6b8e23",Sange:"ffa500",SangeYd:"ff4500",ScEd:"da70d6",pOegTMnPd:"eee8aa",pOegYF:"98fb98",pOeQe:"afeeee",pOeviTetYd:"db7093",papayawEp:"ffefd5",pHKpuff:"ffdab9",peru:"cd853f",pRk:"ffc0cb",plum:"dda0dd",powMrXe:"b0e0e6",purpN:"800080",YbeccapurpN:"663399",Yd:"ff0000",Psybrown:"bc8f8f",PyOXe:"4169e1",saddNbPwn:"8b4513",sOmon:"fa8072",sandybPwn:"f4a460",sHgYF:"2e8b57",sHshell:"fff5ee",siFna:"a0522d",silver:"c0c0c0",skyXe:"87ceeb",UXe:"6a5acd",UWay:"708090",UgYy:"708090",snow:"fffafa",sprRggYF:"ff7f",stAlXe:"4682b4",tan:"d2b48c",teO:"8080",tEstN:"d8bfd8",tomato:"ff6347",Qe:"40e0d0",viTet:"ee82ee",JHt:"f5deb3",wEte:"ffffff",wEtesmoke:"f5f5f5",Lw:"ffff00",LwgYF:"9acd32"};let Ht;function jt(t){Ht||(Ht=function(){const t={},e=Object.keys(Nt),i=Object.keys(Wt);let s,n,o,a,r;for(s=0;s<e.length;s++){for(a=r=e[s],n=0;n<i.length;n++)o=i[n],r=r.replace(o,Wt[o]);o=parseInt(Nt[a],16),t[r]=[o>>16&255,o>>8&255,255&o]}return t}(),Ht.transparent=[0,0,0,0]);const e=Ht[t.toLowerCase()];return e&&{r:e[0],g:e[1],b:e[2],a:4===e.length?e[3]:255}}const $t=/^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;const Yt=t=>t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055,Ut=t=>t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4);function Xt(t,e,i){if(t){let s=It(t);s[e]=Math.max(0,Math.min(s[e]+s[e]*i,0===e?360:1)),s=Ft(s),t.r=s[0],t.g=s[1],t.b=s[2]}}function qt(t,e){return t?Object.assign(e||{},t):t}function Kt(t){var e={r:0,g:0,b:0,a:255};return Array.isArray(t)?t.length>=3&&(e={r:t[0],g:t[1],b:t[2],a:255},t.length>3&&(e.a=Mt(t[3]))):(e=qt(t,{r:0,g:0,b:0,a:1})).a=Mt(e.a),e}function Gt(t){return"r"===t.charAt(0)?function(t){const e=$t.exec(t);let i,s,n,o=255;if(e){if(e[7]!==i){const t=+e[7];o=e[8]?vt(t):yt(255*t,0,255)}return i=+e[1],s=+e[3],n=+e[5],i=255&(e[2]?vt(i):yt(i,0,255)),s=255&(e[4]?vt(s):yt(s,0,255)),n=255&(e[6]?vt(n):yt(n,0,255)),{r:i,g:s,b:n,a:o}}}(t):Bt(t)}class Zt{constructor(t){if(t instanceof Zt)return t;const e=typeof t;let i;var s,n,o;"object"===e?i=Kt(t):"string"===e&&(o=(s=t).length,"#"===s[0]&&(4===o||5===o?n={r:255&17*St[s[1]],g:255&17*St[s[2]],b:255&17*St[s[3]],a:5===o?17*St[s[4]]:255}:7!==o&&9!==o||(n={r:St[s[1]]<<4|St[s[2]],g:St[s[3]]<<4|St[s[4]],b:St[s[5]]<<4|St[s[6]],a:9===o?St[s[7]]<<4|St[s[8]]:255})),i=n||jt(t)||Gt(t)),this._rgb=i,this._valid=!!i}get valid(){return this._valid}get rgb(){var t=qt(this._rgb);return t&&(t.a=wt(t.a)),t}set rgb(t){this._rgb=Kt(t)}rgbString(){return this._valid?(t=this._rgb)&&(t.a<255?`rgba(${t.r}, ${t.g}, ${t.b}, ${wt(t.a)})`:`rgb(${t.r}, ${t.g}, ${t.b})`):void 0;var t}hexString(){return this._valid?At(this._rgb):void 0}hslString(){return this._valid?function(t){if(!t)return;const e=It(t),i=e[0],s=kt(e[1]),n=kt(e[2]);return t.a<255?`hsla(${i}, ${s}%, ${n}%, ${wt(t.a)})`:`hsl(${i}, ${s}%, ${n}%)`}(this._rgb):void 0}mix(t,e){if(t){const i=this.rgb,s=t.rgb;let n;const o=e===n?.5:e,a=2*o-1,r=i.a-s.a,l=((a*r==-1?a:(a+r)/(1+a*r))+1)/2;n=1-l,i.r=255&l*i.r+n*s.r+.5,i.g=255&l*i.g+n*s.g+.5,i.b=255&l*i.b+n*s.b+.5,i.a=o*i.a+(1-o)*s.a,this.rgb=i}return this}interpolate(t,e){return t&&(this._rgb=function(t,e,i){const s=Ut(wt(t.r)),n=Ut(wt(t.g)),o=Ut(wt(t.b));return{r:Mt(Yt(s+i*(Ut(wt(e.r))-s))),g:Mt(Yt(n+i*(Ut(wt(e.g))-n))),b:Mt(Yt(o+i*(Ut(wt(e.b))-o))),a:t.a+i*(e.a-t.a)}}(this._rgb,t._rgb,e)),this}clone(){return new Zt(this.rgb)}alpha(t){return this._rgb.a=Mt(t),this}clearer(t){return this._rgb.a*=1-t,this}greyscale(){const t=this._rgb,e=_t(.3*t.r+.59*t.g+.11*t.b);return t.r=t.g=t.b=e,this}opaquer(t){return this._rgb.a*=1+t,this}negate(){const t=this._rgb;return t.r=255-t.r,t.g=255-t.g,t.b=255-t.b,this}lighten(t){return Xt(this._rgb,2,t),this}darken(t){return Xt(this._rgb,2,-t),this}saturate(t){return Xt(this._rgb,1,t),this}desaturate(t){return Xt(this._rgb,1,-t),this}rotate(t){return function(t,e){var i=It(t);i[0]=Vt(i[0]+e),i=Ft(i),t.r=i[0],t.g=i[1],t.b=i[2]}(this._rgb,t),this}}function Jt(t){if(t&&"object"==typeof t){const e=t.toString();return"[object CanvasPattern]"===e||"[object CanvasGradient]"===e}return!1}function Qt(t){return Jt(t)?t:new Zt(t)}function te(t){return Jt(t)?t:new Zt(t).saturate(.5).darken(.1).hexString()}const ee=["x","y","borderWidth","radius","tension"],ie=["color","borderColor","backgroundColor"];const se=new Map;function ne(t,e,i){return function(t,e){e=e||{};const i=t+JSON.stringify(e);let s=se.get(i);return s||(s=new Intl.NumberFormat(t,e),se.set(i,s)),s}(e,i).format(t)}const oe={values:t=>n(t)?t:""+t,numeric(t,e,i){if(0===t)return"0";const s=this.chart.options.locale;let n,o=t;if(i.length>1){const e=Math.max(Math.abs(i[0].value),Math.abs(i[i.length-1].value));(e<1e-4||e>1e15)&&(n="scientific"),o=function(t,e){let i=e.length>3?e[2].value-e[1].value:e[1].value-e[0].value;Math.abs(i)>=1&&t!==Math.floor(t)&&(i=t-Math.floor(t));return i}(t,i)}const a=z(Math.abs(o)),r=isNaN(a)?1:Math.max(Math.min(-1*Math.floor(a),20),0),l={notation:n,minimumFractionDigits:r,maximumFractionDigits:r};return Object.assign(l,this.options.ticks.format),ne(t,s,l)},logarithmic(t,e,i){if(0===t)return"0";const s=i[e].significand||t/Math.pow(10,Math.floor(z(t)));return[1,2,3,5,10,15].includes(s)||e>.8*i.length?oe.numeric.call(this,t,e,i):""}};var ae={formatters:oe};const re=Object.create(null),le=Object.create(null);function he(t,e){if(!e)return t;const i=e.split(".");for(let e=0,s=i.length;e<s;++e){const s=i[e];t=t[s]||(t[s]=Object.create(null))}return t}function ce(t,e,i){return"string"==typeof e?b(he(t,e),i):b(he(t,""),e)}class de{constructor(t,e){this.animation=void 0,this.backgroundColor="rgba(0,0,0,0.1)",this.borderColor="rgba(0,0,0,0.1)",this.color="#666",this.datasets={},this.devicePixelRatio=t=>t.chart.platform.getDevicePixelRatio(),this.elements={},this.events=["mousemove","mouseout","click","touchstart","touchmove"],this.font={family:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",size:12,style:"normal",lineHeight:1.2,weight:null},this.hover={},this.hoverBackgroundColor=(t,e)=>te(e.backgroundColor),this.hoverBorderColor=(t,e)=>te(e.borderColor),this.hoverColor=(t,e)=>te(e.color),this.indexAxis="x",this.interaction={mode:"nearest",intersect:!0,includeInvisible:!1},this.maintainAspectRatio=!0,this.onHover=null,this.onClick=null,this.parsing=!0,this.plugins={},this.responsive=!0,this.scale=void 0,this.scales={},this.showLine=!0,this.drawActiveElementsOnTop=!0,this.describe(t),this.apply(e)}set(t,e){return ce(this,t,e)}get(t){return he(this,t)}describe(t,e){return ce(le,t,e)}override(t,e){return ce(re,t,e)}route(t,e,i,s){const n=he(this,t),a=he(this,i),r="_"+e;Object.defineProperties(n,{[r]:{value:n[e],writable:!0},[e]:{enumerable:!0,get(){const t=this[r],e=a[s];return o(t)?Object.assign({},e,t):l(t,e)},set(t){this[r]=t}}})}apply(t){t.forEach((t=>t(this)))}}var ue=new de({_scriptable:t=>!t.startsWith("on"),_indexable:t=>"events"!==t,hover:{_fallback:"interaction"},interaction:{_scriptable:!1,_indexable:!1}},[function(t){t.set("animation",{delay:void 0,duration:1e3,easing:"easeOutQuart",fn:void 0,from:void 0,loop:void 0,to:void 0,type:void 0}),t.describe("animation",{_fallback:!1,_indexable:!1,_scriptable:t=>"onProgress"!==t&&"onComplete"!==t&&"fn"!==t}),t.set("animations",{colors:{type:"color",properties:ie},numbers:{type:"number",properties:ee}}),t.describe("animations",{_fallback:"animation"}),t.set("transitions",{active:{animation:{duration:400}},resize:{animation:{duration:0}},show:{animations:{colors:{from:"transparent"},visible:{type:"boolean",duration:0}}},hide:{animations:{colors:{to:"transparent"},visible:{type:"boolean",easing:"linear",fn:t=>0|t}}}})},function(t){t.set("layout",{autoPadding:!0,padding:{top:0,right:0,bottom:0,left:0}})},function(t){t.set("scale",{display:!0,offset:!1,reverse:!1,beginAtZero:!1,bounds:"ticks",clip:!0,grace:0,grid:{display:!0,lineWidth:1,drawOnChartArea:!0,drawTicks:!0,tickLength:8,tickWidth:(t,e)=>e.lineWidth,tickColor:(t,e)=>e.color,offset:!1},border:{display:!0,dash:[],dashOffset:0,width:1},title:{display:!1,text:"",padding:{top:4,bottom:4}},ticks:{minRotation:0,maxRotation:50,mirror:!1,textStrokeWidth:0,textStrokeColor:"",padding:3,display:!0,autoSkip:!0,autoSkipPadding:3,labelOffset:0,callback:ae.formatters.values,minor:{},major:{},align:"center",crossAlign:"near",showLabelBackdrop:!1,backdropColor:"rgba(255, 255, 255, 0.75)",backdropPadding:2}}),t.route("scale.ticks","color","","color"),t.route("scale.grid","color","","borderColor"),t.route("scale.border","color","","borderColor"),t.route("scale.title","color","","color"),t.describe("scale",{_fallback:!1,_scriptable:t=>!t.startsWith("before")&&!t.startsWith("after")&&"callback"!==t&&"parser"!==t,_indexable:t=>"borderDash"!==t&&"tickBorderDash"!==t&&"dash"!==t}),t.describe("scales",{_fallback:"scale"}),t.describe("scale.ticks",{_scriptable:t=>"backdropPadding"!==t&&"callback"!==t,_indexable:t=>"backdropPadding"!==t})}]);function fe(){return"undefined"!=typeof window&&"undefined"!=typeof document}function ge(t){let e=t.parentNode;return e&&"[object ShadowRoot]"===e.toString()&&(e=e.host),e}function pe(t,e,i){let s;return"string"==typeof t?(s=parseInt(t,10),-1!==t.indexOf("%")&&(s=s/100*e.parentNode[i])):s=t,s}const me=t=>t.ownerDocument.defaultView.getComputedStyle(t,null);function be(t,e){return me(t).getPropertyValue(e)}const xe=["top","right","bottom","left"];function _e(t,e,i){const s={};i=i?"-"+i:"";for(let n=0;n<4;n++){const o=xe[n];s[o]=parseFloat(t[e+"-"+o+i])||0}return s.width=s.left+s.right,s.height=s.top+s.bottom,s}const ye=(t,e,i)=>(t>0||e>0)&&(!i||!i.shadowRoot);function ve(t,e){if("native"in t)return t;const{canvas:i,currentDevicePixelRatio:s}=e,n=me(i),o="border-box"===n.boxSizing,a=_e(n,"padding"),r=_e(n,"border","width"),{x:l,y:h,box:c}=function(t,e){const i=t.touches,s=i&&i.length?i[0]:t,{offsetX:n,offsetY:o}=s;let a,r,l=!1;if(ye(n,o,t.target))a=n,r=o;else{const t=e.getBoundingClientRect();a=s.clientX-t.left,r=s.clientY-t.top,l=!0}return{x:a,y:r,box:l}}(t,i),d=a.left+(c&&r.left),u=a.top+(c&&r.top);let{width:f,height:g}=e;return o&&(f-=a.width+r.width,g-=a.height+r.height),{x:Math.round((l-d)/f*i.width/s),y:Math.round((h-u)/g*i.height/s)}}const Me=t=>Math.round(10*t)/10;function we(t,e,i,s){const n=me(t),o=_e(n,"margin"),a=pe(n.maxWidth,t,"clientWidth")||T,r=pe(n.maxHeight,t,"clientHeight")||T,l=function(t,e,i){let s,n;if(void 0===e||void 0===i){const o=ge(t);if(o){const t=o.getBoundingClientRect(),a=me(o),r=_e(a,"border","width"),l=_e(a,"padding");e=t.width-l.width-r.width,i=t.height-l.height-r.height,s=pe(a.maxWidth,o,"clientWidth"),n=pe(a.maxHeight,o,"clientHeight")}else e=t.clientWidth,i=t.clientHeight}return{width:e,height:i,maxWidth:s||T,maxHeight:n||T}}(t,e,i);let{width:h,height:c}=l;if("content-box"===n.boxSizing){const t=_e(n,"border","width"),e=_e(n,"padding");h-=e.width+t.width,c-=e.height+t.height}h=Math.max(0,h-o.width),c=Math.max(0,s?h/s:c-o.height),h=Me(Math.min(h,a,l.maxWidth)),c=Me(Math.min(c,r,l.maxHeight)),h&&!c&&(c=Me(h/2));return(void 0!==e||void 0!==i)&&s&&l.height&&c>l.height&&(c=l.height,h=Me(Math.floor(c*s))),{width:h,height:c}}function ke(t,e,i){const s=e||1,n=Math.floor(t.height*s),o=Math.floor(t.width*s);t.height=Math.floor(t.height),t.width=Math.floor(t.width);const a=t.canvas;return a.style&&(i||!a.style.height&&!a.style.width)&&(a.style.height=`${t.height}px`,a.style.width=`${t.width}px`),(t.currentDevicePixelRatio!==s||a.height!==n||a.width!==o)&&(t.currentDevicePixelRatio=s,a.height=n,a.width=o,t.ctx.setTransform(s,0,0,s,0,0),!0)}const Se=function(){let t=!1;try{const e={get passive(){return t=!0,!1}};window.addEventListener("test",null,e),window.removeEventListener("test",null,e)}catch(t){}return t}();function Pe(t,e){const i=be(t,e),s=i&&i.match(/^(\d+)(\.\d+)?px$/);return s?+s[1]:void 0}function De(t){return!t||s(t.size)||s(t.family)?null:(t.style?t.style+" ":"")+(t.weight?t.weight+" ":"")+t.size+"px "+t.family}function Ce(t,e,i,s,n){let o=e[n];return o||(o=e[n]=t.measureText(n).width,i.push(n)),o>s&&(s=o),s}function Oe(t,e,i,s){let o=(s=s||{}).data=s.data||{},a=s.garbageCollect=s.garbageCollect||[];s.font!==e&&(o=s.data={},a=s.garbageCollect=[],s.font=e),t.save(),t.font=e;let r=0;const l=i.length;let h,c,d,u,f;for(h=0;h<l;h++)if(u=i[h],null==u||n(u)){if(n(u))for(c=0,d=u.length;c<d;c++)f=u[c],null==f||n(f)||(r=Ce(t,o,a,r,f))}else r=Ce(t,o,a,r,u);t.restore();const g=a.length/2;if(g>i.length){for(h=0;h<g;h++)delete o[a[h]];a.splice(0,g)}return r}function Ae(t,e,i){const s=t.currentDevicePixelRatio,n=0!==i?Math.max(i/2,.5):0;return Math.round((e-n)*s)/s+n}function Te(t,e){(e=e||t.getContext("2d")).save(),e.resetTransform(),e.clearRect(0,0,t.width,t.height),e.restore()}function Le(t,e,i,s){Ee(t,e,i,s,null)}function Ee(t,e,i,s,n){let o,a,r,l,h,c,d,u;const f=e.pointStyle,g=e.rotation,p=e.radius;let m=(g||0)*L;if(f&&"object"==typeof f&&(o=f.toString(),"[object HTMLImageElement]"===o||"[object HTMLCanvasElement]"===o))return t.save(),t.translate(i,s),t.rotate(m),t.drawImage(f,-f.width/2,-f.height/2,f.width,f.height),void t.restore();if(!(isNaN(p)||p<=0)){switch(t.beginPath(),f){default:n?t.ellipse(i,s,n/2,p,0,0,O):t.arc(i,s,p,0,O),t.closePath();break;case"triangle":c=n?n/2:p,t.moveTo(i+Math.sin(m)*c,s-Math.cos(m)*p),m+=I,t.lineTo(i+Math.sin(m)*c,s-Math.cos(m)*p),m+=I,t.lineTo(i+Math.sin(m)*c,s-Math.cos(m)*p),t.closePath();break;case"rectRounded":h=.516*p,l=p-h,a=Math.cos(m+R)*l,d=Math.cos(m+R)*(n?n/2-h:l),r=Math.sin(m+R)*l,u=Math.sin(m+R)*(n?n/2-h:l),t.arc(i-d,s-r,h,m-C,m-E),t.arc(i+u,s-a,h,m-E,m),t.arc(i+d,s+r,h,m,m+E),t.arc(i-u,s+a,h,m+E,m+C),t.closePath();break;case"rect":if(!g){l=Math.SQRT1_2*p,c=n?n/2:l,t.rect(i-c,s-l,2*c,2*l);break}m+=R;case"rectRot":d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+u,s-a),t.lineTo(i+d,s+r),t.lineTo(i-u,s+a),t.closePath();break;case"crossRot":m+=R;case"cross":d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a);break;case"star":d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a),m+=R,d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a);break;case"line":a=n?n/2:Math.cos(m)*p,r=Math.sin(m)*p,t.moveTo(i-a,s-r),t.lineTo(i+a,s+r);break;case"dash":t.moveTo(i,s),t.lineTo(i+Math.cos(m)*(n?n/2:p),s+Math.sin(m)*p);break;case!1:t.closePath()}t.fill(),e.borderWidth>0&&t.stroke()}}function Re(t,e,i){return i=i||.5,!e||t&&t.x>e.left-i&&t.x<e.right+i&&t.y>e.top-i&&t.y<e.bottom+i}function Ie(t,e){t.save(),t.beginPath(),t.rect(e.left,e.top,e.right-e.left,e.bottom-e.top),t.clip()}function ze(t){t.restore()}function Fe(t,e,i,s,n){if(!e)return t.lineTo(i.x,i.y);if("middle"===n){const s=(e.x+i.x)/2;t.lineTo(s,e.y),t.lineTo(s,i.y)}else"after"===n!=!!s?t.lineTo(e.x,i.y):t.lineTo(i.x,e.y);t.lineTo(i.x,i.y)}function Ve(t,e,i,s){if(!e)return t.lineTo(i.x,i.y);t.bezierCurveTo(s?e.cp1x:e.cp2x,s?e.cp1y:e.cp2y,s?i.cp2x:i.cp1x,s?i.cp2y:i.cp1y,i.x,i.y)}function Be(t,e,i,s,n){if(n.strikethrough||n.underline){const o=t.measureText(s),a=e-o.actualBoundingBoxLeft,r=e+o.actualBoundingBoxRight,l=i-o.actualBoundingBoxAscent,h=i+o.actualBoundingBoxDescent,c=n.strikethrough?(l+h)/2:h;t.strokeStyle=t.fillStyle,t.beginPath(),t.lineWidth=n.decorationWidth||2,t.moveTo(a,c),t.lineTo(r,c),t.stroke()}}function We(t,e){const i=t.fillStyle;t.fillStyle=e.color,t.fillRect(e.left,e.top,e.width,e.height),t.fillStyle=i}function Ne(t,e,i,o,a,r={}){const l=n(e)?e:[e],h=r.strokeWidth>0&&""!==r.strokeColor;let c,d;for(t.save(),t.font=a.string,function(t,e){e.translation&&t.translate(e.translation[0],e.translation[1]),s(e.rotation)||t.rotate(e.rotation),e.color&&(t.fillStyle=e.color),e.textAlign&&(t.textAlign=e.textAlign),e.textBaseline&&(t.textBaseline=e.textBaseline)}(t,r),c=0;c<l.length;++c)d=l[c],r.backdrop&&We(t,r.backdrop),h&&(r.strokeColor&&(t.strokeStyle=r.strokeColor),s(r.strokeWidth)||(t.lineWidth=r.strokeWidth),t.strokeText(d,i,o,r.maxWidth)),t.fillText(d,i,o,r.maxWidth),Be(t,i,o,d,r),o+=Number(a.lineHeight);t.restore()}function He(t,e){const{x:i,y:s,w:n,h:o,radius:a}=e;t.arc(i+a.topLeft,s+a.topLeft,a.topLeft,1.5*C,C,!0),t.lineTo(i,s+o-a.bottomLeft),t.arc(i+a.bottomLeft,s+o-a.bottomLeft,a.bottomLeft,C,E,!0),t.lineTo(i+n-a.bottomRight,s+o),t.arc(i+n-a.bottomRight,s+o-a.bottomRight,a.bottomRight,E,0,!0),t.lineTo(i+n,s+a.topRight),t.arc(i+n-a.topRight,s+a.topRight,a.topRight,0,-E,!0),t.lineTo(i+a.topLeft,s)}function je(t,e=[""],i,s,n=(()=>t[0])){const o=i||t;void 0===s&&(s=ti("_fallback",t));const a={[Symbol.toStringTag]:"Object",_cacheable:!0,_scopes:t,_rootScopes:o,_fallback:s,_getTarget:n,override:i=>je([i,...t],e,o,s)};return new Proxy(a,{deleteProperty:(e,i)=>(delete e[i],delete e._keys,delete t[0][i],!0),get:(i,s)=>qe(i,s,(()=>function(t,e,i,s){let n;for(const o of e)if(n=ti(Ue(o,t),i),void 0!==n)return Xe(t,n)?Je(i,s,t,n):n}(s,e,t,i))),getOwnPropertyDescriptor:(t,e)=>Reflect.getOwnPropertyDescriptor(t._scopes[0],e),getPrototypeOf:()=>Reflect.getPrototypeOf(t[0]),has:(t,e)=>ei(t).includes(e),ownKeys:t=>ei(t),set(t,e,i){const s=t._storage||(t._storage=n());return t[e]=s[e]=i,delete t._keys,!0}})}function $e(t,e,i,s){const a={_cacheable:!1,_proxy:t,_context:e,_subProxy:i,_stack:new Set,_descriptors:Ye(t,s),setContext:e=>$e(t,e,i,s),override:n=>$e(t.override(n),e,i,s)};return new Proxy(a,{deleteProperty:(e,i)=>(delete e[i],delete t[i],!0),get:(t,e,i)=>qe(t,e,(()=>function(t,e,i){const{_proxy:s,_context:a,_subProxy:r,_descriptors:l}=t;let h=s[e];S(h)&&l.isScriptable(e)&&(h=function(t,e,i,s){const{_proxy:n,_context:o,_subProxy:a,_stack:r}=i;if(r.has(t))throw new Error("Recursion detected: "+Array.from(r).join("->")+"->"+t);r.add(t);let l=e(o,a||s);r.delete(t),Xe(t,l)&&(l=Je(n._scopes,n,t,l));return l}(e,h,t,i));n(h)&&h.length&&(h=function(t,e,i,s){const{_proxy:n,_context:a,_subProxy:r,_descriptors:l}=i;if(void 0!==a.index&&s(t))return e[a.index%e.length];if(o(e[0])){const i=e,s=n._scopes.filter((t=>t!==i));e=[];for(const o of i){const i=Je(s,n,t,o);e.push($e(i,a,r&&r[t],l))}}return e}(e,h,t,l.isIndexable));Xe(e,h)&&(h=$e(h,a,r&&r[e],l));return h}(t,e,i))),getOwnPropertyDescriptor:(e,i)=>e._descriptors.allKeys?Reflect.has(t,i)?{enumerable:!0,configurable:!0}:void 0:Reflect.getOwnPropertyDescriptor(t,i),getPrototypeOf:()=>Reflect.getPrototypeOf(t),has:(e,i)=>Reflect.has(t,i),ownKeys:()=>Reflect.ownKeys(t),set:(e,i,s)=>(t[i]=s,delete e[i],!0)})}function Ye(t,e={scriptable:!0,indexable:!0}){const{_scriptable:i=e.scriptable,_indexable:s=e.indexable,_allKeys:n=e.allKeys}=t;return{allKeys:n,scriptable:i,indexable:s,isScriptable:S(i)?i:()=>i,isIndexable:S(s)?s:()=>s}}const Ue=(t,e)=>t?t+w(e):e,Xe=(t,e)=>o(e)&&"adapters"!==t&&(null===Object.getPrototypeOf(e)||e.constructor===Object);function qe(t,e,i){if(Object.prototype.hasOwnProperty.call(t,e))return t[e];const s=i();return t[e]=s,s}function Ke(t,e,i){return S(t)?t(e,i):t}const Ge=(t,e)=>!0===t?e:"string"==typeof t?M(e,t):void 0;function Ze(t,e,i,s,n){for(const o of e){const e=Ge(i,o);if(e){t.add(e);const o=Ke(e._fallback,i,n);if(void 0!==o&&o!==i&&o!==s)return o}else if(!1===e&&void 0!==s&&i!==s)return null}return!1}function Je(t,e,i,s){const a=e._rootScopes,r=Ke(e._fallback,i,s),l=[...t,...a],h=new Set;h.add(s);let c=Qe(h,l,i,r||i,s);return null!==c&&((void 0===r||r===i||(c=Qe(h,l,r,c,s),null!==c))&&je(Array.from(h),[""],a,r,(()=>function(t,e,i){const s=t._getTarget();e in s||(s[e]={});const a=s[e];if(n(a)&&o(i))return i;return a||{}}(e,i,s))))}function Qe(t,e,i,s,n){for(;i;)i=Ze(t,e,i,s,n);return i}function ti(t,e){for(const i of e){if(!i)continue;const e=i[t];if(void 0!==e)return e}}function ei(t){let e=t._keys;return e||(e=t._keys=function(t){const e=new Set;for(const i of t)for(const t of Object.keys(i).filter((t=>!t.startsWith("_"))))e.add(t);return Array.from(e)}(t._scopes)),e}function ii(t,e,i,s){const{iScale:n}=t,{key:o="r"}=this._parsing,a=new Array(s);let r,l,h,c;for(r=0,l=s;r<l;++r)h=r+i,c=e[h],a[r]={r:n.parse(M(c,o),h)};return a}const si=Number.EPSILON||1e-14,ni=(t,e)=>e<t.length&&!t[e].skip&&t[e],oi=t=>"x"===t?"y":"x";function ai(t,e,i,s){const n=t.skip?e:t,o=e,a=i.skip?e:i,r=q(o,n),l=q(a,o);let h=r/(r+l),c=l/(r+l);h=isNaN(h)?0:h,c=isNaN(c)?0:c;const d=s*h,u=s*c;return{previous:{x:o.x-d*(a.x-n.x),y:o.y-d*(a.y-n.y)},next:{x:o.x+u*(a.x-n.x),y:o.y+u*(a.y-n.y)}}}function ri(t,e="x"){const i=oi(e),s=t.length,n=Array(s).fill(0),o=Array(s);let a,r,l,h=ni(t,0);for(a=0;a<s;++a)if(r=l,l=h,h=ni(t,a+1),l){if(h){const t=h[e]-l[e];n[a]=0!==t?(h[i]-l[i])/t:0}o[a]=r?h?F(n[a-1])!==F(n[a])?0:(n[a-1]+n[a])/2:n[a-1]:n[a]}!function(t,e,i){const s=t.length;let n,o,a,r,l,h=ni(t,0);for(let c=0;c<s-1;++c)l=h,h=ni(t,c+1),l&&h&&(V(e[c],0,si)?i[c]=i[c+1]=0:(n=i[c]/e[c],o=i[c+1]/e[c],r=Math.pow(n,2)+Math.pow(o,2),r<=9||(a=3/Math.sqrt(r),i[c]=n*a*e[c],i[c+1]=o*a*e[c])))}(t,n,o),function(t,e,i="x"){const s=oi(i),n=t.length;let o,a,r,l=ni(t,0);for(let h=0;h<n;++h){if(a=r,r=l,l=ni(t,h+1),!r)continue;const n=r[i],c=r[s];a&&(o=(n-a[i])/3,r[`cp1${i}`]=n-o,r[`cp1${s}`]=c-o*e[h]),l&&(o=(l[i]-n)/3,r[`cp2${i}`]=n+o,r[`cp2${s}`]=c+o*e[h])}}(t,o,e)}function li(t,e,i){return Math.max(Math.min(t,i),e)}function hi(t,e,i,s,n){let o,a,r,l;if(e.spanGaps&&(t=t.filter((t=>!t.skip))),"monotone"===e.cubicInterpolationMode)ri(t,n);else{let i=s?t[t.length-1]:t[0];for(o=0,a=t.length;o<a;++o)r=t[o],l=ai(i,r,t[Math.min(o+1,a-(s?0:1))%a],e.tension),r.cp1x=l.previous.x,r.cp1y=l.previous.y,r.cp2x=l.next.x,r.cp2y=l.next.y,i=r}e.capBezierPoints&&function(t,e){let i,s,n,o,a,r=Re(t[0],e);for(i=0,s=t.length;i<s;++i)a=o,o=r,r=i<s-1&&Re(t[i+1],e),o&&(n=t[i],a&&(n.cp1x=li(n.cp1x,e.left,e.right),n.cp1y=li(n.cp1y,e.top,e.bottom)),r&&(n.cp2x=li(n.cp2x,e.left,e.right),n.cp2y=li(n.cp2y,e.top,e.bottom)))}(t,i)}const ci=t=>0===t||1===t,di=(t,e,i)=>-Math.pow(2,10*(t-=1))*Math.sin((t-e)*O/i),ui=(t,e,i)=>Math.pow(2,-10*t)*Math.sin((t-e)*O/i)+1,fi={linear:t=>t,easeInQuad:t=>t*t,easeOutQuad:t=>-t*(t-2),easeInOutQuad:t=>(t/=.5)<1?.5*t*t:-.5*(--t*(t-2)-1),easeInCubic:t=>t*t*t,easeOutCubic:t=>(t-=1)*t*t+1,easeInOutCubic:t=>(t/=.5)<1?.5*t*t*t:.5*((t-=2)*t*t+2),easeInQuart:t=>t*t*t*t,easeOutQuart:t=>-((t-=1)*t*t*t-1),easeInOutQuart:t=>(t/=.5)<1?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2),easeInQuint:t=>t*t*t*t*t,easeOutQuint:t=>(t-=1)*t*t*t*t+1,easeInOutQuint:t=>(t/=.5)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2),easeInSine:t=>1-Math.cos(t*E),easeOutSine:t=>Math.sin(t*E),easeInOutSine:t=>-.5*(Math.cos(C*t)-1),easeInExpo:t=>0===t?0:Math.pow(2,10*(t-1)),easeOutExpo:t=>1===t?1:1-Math.pow(2,-10*t),easeInOutExpo:t=>ci(t)?t:t<.5?.5*Math.pow(2,10*(2*t-1)):.5*(2-Math.pow(2,-10*(2*t-1))),easeInCirc:t=>t>=1?t:-(Math.sqrt(1-t*t)-1),easeOutCirc:t=>Math.sqrt(1-(t-=1)*t),easeInOutCirc:t=>(t/=.5)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1),easeInElastic:t=>ci(t)?t:di(t,.075,.3),easeOutElastic:t=>ci(t)?t:ui(t,.075,.3),easeInOutElastic(t){const e=.1125;return ci(t)?t:t<.5?.5*di(2*t,e,.45):.5+.5*ui(2*t-1,e,.45)},easeInBack(t){const e=1.70158;return t*t*((e+1)*t-e)},easeOutBack(t){const e=1.70158;return(t-=1)*t*((e+1)*t+e)+1},easeInOutBack(t){let e=1.70158;return(t/=.5)<1?t*t*((1+(e*=1.525))*t-e)*.5:.5*((t-=2)*t*((1+(e*=1.525))*t+e)+2)},easeInBounce:t=>1-fi.easeOutBounce(1-t),easeOutBounce(t){const e=7.5625,i=2.75;return t<1/i?e*t*t:t<2/i?e*(t-=1.5/i)*t+.75:t<2.5/i?e*(t-=2.25/i)*t+.9375:e*(t-=2.625/i)*t+.984375},easeInOutBounce:t=>t<.5?.5*fi.easeInBounce(2*t):.5*fi.easeOutBounce(2*t-1)+.5};function gi(t,e,i,s){return{x:t.x+i*(e.x-t.x),y:t.y+i*(e.y-t.y)}}function pi(t,e,i,s){return{x:t.x+i*(e.x-t.x),y:"middle"===s?i<.5?t.y:e.y:"after"===s?i<1?t.y:e.y:i>0?e.y:t.y}}function mi(t,e,i,s){const n={x:t.cp2x,y:t.cp2y},o={x:e.cp1x,y:e.cp1y},a=gi(t,n,i),r=gi(n,o,i),l=gi(o,e,i),h=gi(a,r,i),c=gi(r,l,i);return gi(h,c,i)}const bi=/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/,xi=/^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;function _i(t,e){const i=(""+t).match(bi);if(!i||"normal"===i[1])return 1.2*e;switch(t=+i[2],i[3]){case"px":return t;case"%":t/=100}return e*t}const yi=t=>+t||0;function vi(t,e){const i={},s=o(e),n=s?Object.keys(e):e,a=o(t)?s?i=>l(t[i],t[e[i]]):e=>t[e]:()=>t;for(const t of n)i[t]=yi(a(t));return i}function Mi(t){return vi(t,{top:"y",right:"x",bottom:"y",left:"x"})}function wi(t){return vi(t,["topLeft","topRight","bottomLeft","bottomRight"])}function ki(t){const e=Mi(t);return e.width=e.left+e.right,e.height=e.top+e.bottom,e}function Si(t,e){t=t||{},e=e||ue.font;let i=l(t.size,e.size);"string"==typeof i&&(i=parseInt(i,10));let s=l(t.style,e.style);s&&!(""+s).match(xi)&&(console.warn('Invalid font style specified: "'+s+'"'),s=void 0);const n={family:l(t.family,e.family),lineHeight:_i(l(t.lineHeight,e.lineHeight),i),size:i,style:s,weight:l(t.weight,e.weight),string:""};return n.string=De(n),n}function Pi(t,e,i,s){let o,a,r,l=!0;for(o=0,a=t.length;o<a;++o)if(r=t[o],void 0!==r&&(void 0!==e&&"function"==typeof r&&(r=r(e),l=!1),void 0!==i&&n(r)&&(r=r[i%r.length],l=!1),void 0!==r))return s&&!l&&(s.cacheable=!1),r}function Di(t,e,i){const{min:s,max:n}=t,o=c(e,(n-s)/2),a=(t,e)=>i&&0===t?0:t+e;return{min:a(s,-Math.abs(o)),max:a(n,o)}}function Ci(t,e){return Object.assign(Object.create(t),e)}function Oi(t,e,i){return t?function(t,e){return{x:i=>t+t+e-i,setWidth(t){e=t},textAlign:t=>"center"===t?t:"right"===t?"left":"right",xPlus:(t,e)=>t-e,leftForLtr:(t,e)=>t-e}}(e,i):{x:t=>t,setWidth(t){},textAlign:t=>t,xPlus:(t,e)=>t+e,leftForLtr:(t,e)=>t}}function Ai(t,e){let i,s;"ltr"!==e&&"rtl"!==e||(i=t.canvas.style,s=[i.getPropertyValue("direction"),i.getPropertyPriority("direction")],i.setProperty("direction",e,"important"),t.prevTextDirection=s)}function Ti(t,e){void 0!==e&&(delete t.prevTextDirection,t.canvas.style.setProperty("direction",e[0],e[1]))}function Li(t){return"angle"===t?{between:Z,compare:K,normalize:G}:{between:tt,compare:(t,e)=>t-e,normalize:t=>t}}function Ei({start:t,end:e,count:i,loop:s,style:n}){return{start:t%i,end:e%i,loop:s&&(e-t+1)%i==0,style:n}}function Ri(t,e,i){if(!i)return[t];const{property:s,start:n,end:o}=i,a=e.length,{compare:r,between:l,normalize:h}=Li(s),{start:c,end:d,loop:u,style:f}=function(t,e,i){const{property:s,start:n,end:o}=i,{between:a,normalize:r}=Li(s),l=e.length;let h,c,{start:d,end:u,loop:f}=t;if(f){for(d+=l,u+=l,h=0,c=l;h<c&&a(r(e[d%l][s]),n,o);++h)d--,u--;d%=l,u%=l}return u<d&&(u+=l),{start:d,end:u,loop:f,style:t.style}}(t,e,i),g=[];let p,m,b,x=!1,_=null;const y=()=>x||l(n,b,p)&&0!==r(n,b),v=()=>!x||0===r(o,p)||l(o,b,p);for(let t=c,i=c;t<=d;++t)m=e[t%a],m.skip||(p=h(m[s]),p!==b&&(x=l(p,n,o),null===_&&y()&&(_=0===r(p,n)?t:i),null!==_&&v()&&(g.push(Ei({start:_,end:t,loop:u,count:a,style:f})),_=null),i=t,b=p));return null!==_&&g.push(Ei({start:_,end:d,loop:u,count:a,style:f})),g}function Ii(t,e){const i=[],s=t.segments;for(let n=0;n<s.length;n++){const o=Ri(s[n],t.points,e);o.length&&i.push(...o)}return i}function zi(t,e){const i=t.points,s=t.options.spanGaps,n=i.length;if(!n)return[];const o=!!t._loop,{start:a,end:r}=function(t,e,i,s){let n=0,o=e-1;if(i&&!s)for(;n<e&&!t[n].skip;)n++;for(;n<e&&t[n].skip;)n++;for(n%=e,i&&(o+=n);o>n&&t[o%e].skip;)o--;return o%=e,{start:n,end:o}}(i,n,o,s);if(!0===s)return Fi(t,[{start:a,end:r,loop:o}],i,e);return Fi(t,function(t,e,i,s){const n=t.length,o=[];let a,r=e,l=t[e];for(a=e+1;a<=i;++a){const i=t[a%n];i.skip||i.stop?l.skip||(s=!1,o.push({start:e%n,end:(a-1)%n,loop:s}),e=r=i.stop?a:null):(r=a,l.skip&&(e=a)),l=i}return null!==r&&o.push({start:e%n,end:r%n,loop:s}),o}(i,a,r<a?r+n:r,!!t._fullLoop&&0===a&&r===n-1),i,e)}function Fi(t,e,i,s){return s&&s.setContext&&i?function(t,e,i,s){const n=t._chart.getContext(),o=Vi(t.options),{_datasetIndex:a,options:{spanGaps:r}}=t,l=i.length,h=[];let c=o,d=e[0].start,u=d;function f(t,e,s,n){const o=r?-1:1;if(t!==e){for(t+=l;i[t%l].skip;)t-=o;for(;i[e%l].skip;)e+=o;t%l!=e%l&&(h.push({start:t%l,end:e%l,loop:s,style:n}),c=n,d=e%l)}}for(const t of e){d=r?d:t.start;let e,o=i[d%l];for(u=d+1;u<=t.end;u++){const r=i[u%l];e=Vi(s.setContext(Ci(n,{type:"segment",p0:o,p1:r,p0DataIndex:(u-1)%l,p1DataIndex:u%l,datasetIndex:a}))),Bi(e,c)&&f(d,u-1,t.loop,c),o=r,c=e}d<u-1&&f(d,u-1,t.loop,c)}return h}(t,e,i,s):e}function Vi(t){return{backgroundColor:t.backgroundColor,borderCapStyle:t.borderCapStyle,borderDash:t.borderDash,borderDashOffset:t.borderDashOffset,borderJoinStyle:t.borderJoinStyle,borderWidth:t.borderWidth,borderColor:t.borderColor}}function Bi(t,e){if(!e)return!1;const i=[],s=function(t,e){return Jt(e)?(i.includes(e)||i.push(e),i.indexOf(e)):e};return JSON.stringify(t,s)!==JSON.stringify(e,s)}var Wi=Object.freeze({__proto__:null,HALF_PI:E,INFINITY:T,PI:C,PITAU:A,QUARTER_PI:R,RAD_PER_DEG:L,TAU:O,TWO_THIRDS_PI:I,_addGrace:Di,_alignPixel:Ae,_alignStartEnd:ft,_angleBetween:Z,_angleDiff:K,_arrayUnique:lt,_attachContext:$e,_bezierCurveTo:Ve,_bezierInterpolation:mi,_boundSegment:Ri,_boundSegments:Ii,_capitalize:w,_computeSegments:zi,_createResolver:je,_decimalPlaces:U,_deprecated:function(t,e,i,s){void 0!==e&&console.warn(t+': "'+i+'" is deprecated. Please use "'+s+'" instead')},_descriptors:Ye,_elementsEqual:f,_factorize:W,_filterBetween:nt,_getParentNode:ge,_getStartAndCountOfVisiblePoints:pt,_int16Range:Q,_isBetween:tt,_isClickEvent:D,_isDomSupported:fe,_isPointInArea:Re,_limitValue:J,_longestText:Oe,_lookup:et,_lookupByKey:it,_measureText:Ce,_merger:m,_mergerIf:_,_normalizeAngle:G,_parseObjectDataRadialScale:ii,_pointInLine:gi,_readValueToProps:vi,_rlookupByKey:st,_scaleRangesChanged:mt,_setMinAndMaxByKey:j,_splitKey:v,_steppedInterpolation:pi,_steppedLineTo:Fe,_textX:gt,_toLeftRightCenter:ut,_updateBezierControlPoints:hi,addRoundedRectPath:He,almostEquals:V,almostWhole:H,callback:d,clearCanvas:Te,clipArea:Ie,clone:g,color:Qt,createContext:Ci,debounce:dt,defined:k,distanceBetweenPoints:q,drawPoint:Le,drawPointLegend:Ee,each:u,easingEffects:fi,finiteOrDefault:r,fontString:function(t,e,i){return e+" "+t+"px "+i},formatNumber:ne,getAngleFromPoint:X,getHoverColor:te,getMaximumSize:we,getRelativePosition:ve,getRtlAdapter:Oi,getStyle:be,isArray:n,isFinite:a,isFunction:S,isNullOrUndef:s,isNumber:N,isObject:o,isPatternOrGradient:Jt,listenArrayEvents:at,log10:z,merge:b,mergeIf:x,niceNum:B,noop:e,overrideTextDirection:Ai,readUsedSize:Pe,renderText:Ne,requestAnimFrame:ht,resolve:Pi,resolveObjectKey:M,restoreTextDirection:Ti,retinaScale:ke,setsEqual:P,sign:F,splineCurve:ai,splineCurveMonotone:ri,supportsEventListenerOptions:Se,throttled:ct,toDegrees:Y,toDimension:c,toFont:Si,toFontString:De,toLineHeight:_i,toPadding:ki,toPercentage:h,toRadians:$,toTRBL:Mi,toTRBLCorners:wi,uid:i,unclipArea:ze,unlistenArrayEvents:rt,valueOrDefault:l});function Ni(t,e,i,s){const{controller:n,data:o,_sorted:a}=t,r=n._cachedMeta.iScale;if(r&&e===r.axis&&"r"!==e&&a&&o.length){const t=r._reversePixels?st:it;if(!s)return t(o,e,i);if(n._sharedOptions){const s=o[0],n="function"==typeof s.getRange&&s.getRange(e);if(n){const s=t(o,e,i-n),a=t(o,e,i+n);return{lo:s.lo,hi:a.hi}}}}return{lo:0,hi:o.length-1}}function Hi(t,e,i,s,n){const o=t.getSortedVisibleDatasetMetas(),a=i[e];for(let t=0,i=o.length;t<i;++t){const{index:i,data:r}=o[t],{lo:l,hi:h}=Ni(o[t],e,a,n);for(let t=l;t<=h;++t){const e=r[t];e.skip||s(e,i,t)}}}function ji(t,e,i,s,n){const o=[];if(!n&&!t.isPointInArea(e))return o;return Hi(t,i,e,(function(i,a,r){(n||Re(i,t.chartArea,0))&&i.inRange(e.x,e.y,s)&&o.push({element:i,datasetIndex:a,index:r})}),!0),o}function $i(t,e,i,s,n,o){let a=[];const r=function(t){const e=-1!==t.indexOf("x"),i=-1!==t.indexOf("y");return function(t,s){const n=e?Math.abs(t.x-s.x):0,o=i?Math.abs(t.y-s.y):0;return Math.sqrt(Math.pow(n,2)+Math.pow(o,2))}}(i);let l=Number.POSITIVE_INFINITY;return Hi(t,i,e,(function(i,h,c){const d=i.inRange(e.x,e.y,n);if(s&&!d)return;const u=i.getCenterPoint(n);if(!(!!o||t.isPointInArea(u))&&!d)return;const f=r(e,u);f<l?(a=[{element:i,datasetIndex:h,index:c}],l=f):f===l&&a.push({element:i,datasetIndex:h,index:c})})),a}function Yi(t,e,i,s,n,o){return o||t.isPointInArea(e)?"r"!==i||s?$i(t,e,i,s,n,o):function(t,e,i,s){let n=[];return Hi(t,i,e,(function(t,i,o){const{startAngle:a,endAngle:r}=t.getProps(["startAngle","endAngle"],s),{angle:l}=X(t,{x:e.x,y:e.y});Z(l,a,r)&&n.push({element:t,datasetIndex:i,index:o})})),n}(t,e,i,n):[]}function Ui(t,e,i,s,n){const o=[],a="x"===i?"inXRange":"inYRange";let r=!1;return Hi(t,i,e,((t,s,l)=>{t[a](e[i],n)&&(o.push({element:t,datasetIndex:s,index:l}),r=r||t.inRange(e.x,e.y,n))})),s&&!r?[]:o}var Xi={evaluateInteractionItems:Hi,modes:{index(t,e,i,s){const n=ve(e,t),o=i.axis||"x",a=i.includeInvisible||!1,r=i.intersect?ji(t,n,o,s,a):Yi(t,n,o,!1,s,a),l=[];return r.length?(t.getSortedVisibleDatasetMetas().forEach((t=>{const e=r[0].index,i=t.data[e];i&&!i.skip&&l.push({element:i,datasetIndex:t.index,index:e})})),l):[]},dataset(t,e,i,s){const n=ve(e,t),o=i.axis||"xy",a=i.includeInvisible||!1;let r=i.intersect?ji(t,n,o,s,a):Yi(t,n,o,!1,s,a);if(r.length>0){const e=r[0].datasetIndex,i=t.getDatasetMeta(e).data;r=[];for(let t=0;t<i.length;++t)r.push({element:i[t],datasetIndex:e,index:t})}return r},point:(t,e,i,s)=>ji(t,ve(e,t),i.axis||"xy",s,i.includeInvisible||!1),nearest(t,e,i,s){const n=ve(e,t),o=i.axis||"xy",a=i.includeInvisible||!1;return Yi(t,n,o,i.intersect,s,a)},x:(t,e,i,s)=>Ui(t,ve(e,t),"x",i.intersect,s),y:(t,e,i,s)=>Ui(t,ve(e,t),"y",i.intersect,s)}};const qi=["left","top","right","bottom"];function Ki(t,e){return t.filter((t=>t.pos===e))}function Gi(t,e){return t.filter((t=>-1===qi.indexOf(t.pos)&&t.box.axis===e))}function Zi(t,e){return t.sort(((t,i)=>{const s=e?i:t,n=e?t:i;return s.weight===n.weight?s.index-n.index:s.weight-n.weight}))}function Ji(t,e){const i=function(t){const e={};for(const i of t){const{stack:t,pos:s,stackWeight:n}=i;if(!t||!qi.includes(s))continue;const o=e[t]||(e[t]={count:0,placed:0,weight:0,size:0});o.count++,o.weight+=n}return e}(t),{vBoxMaxWidth:s,hBoxMaxHeight:n}=e;let o,a,r;for(o=0,a=t.length;o<a;++o){r=t[o];const{fullSize:a}=r.box,l=i[r.stack],h=l&&r.stackWeight/l.weight;r.horizontal?(r.width=h?h*s:a&&e.availableWidth,r.height=n):(r.width=s,r.height=h?h*n:a&&e.availableHeight)}return i}function Qi(t,e,i,s){return Math.max(t[i],e[i])+Math.max(t[s],e[s])}function ts(t,e){t.top=Math.max(t.top,e.top),t.left=Math.max(t.left,e.left),t.bottom=Math.max(t.bottom,e.bottom),t.right=Math.max(t.right,e.right)}function es(t,e,i,s){const{pos:n,box:a}=i,r=t.maxPadding;if(!o(n)){i.size&&(t[n]-=i.size);const e=s[i.stack]||{size:0,count:1};e.size=Math.max(e.size,i.horizontal?a.height:a.width),i.size=e.size/e.count,t[n]+=i.size}a.getPadding&&ts(r,a.getPadding());const l=Math.max(0,e.outerWidth-Qi(r,t,"left","right")),h=Math.max(0,e.outerHeight-Qi(r,t,"top","bottom")),c=l!==t.w,d=h!==t.h;return t.w=l,t.h=h,i.horizontal?{same:c,other:d}:{same:d,other:c}}function is(t,e){const i=e.maxPadding;function s(t){const s={left:0,top:0,right:0,bottom:0};return t.forEach((t=>{s[t]=Math.max(e[t],i[t])})),s}return s(t?["left","right"]:["top","bottom"])}function ss(t,e,i,s){const n=[];let o,a,r,l,h,c;for(o=0,a=t.length,h=0;o<a;++o){r=t[o],l=r.box,l.update(r.width||e.w,r.height||e.h,is(r.horizontal,e));const{same:a,other:d}=es(e,i,r,s);h|=a&&n.length,c=c||d,l.fullSize||n.push(r)}return h&&ss(n,e,i,s)||c}function ns(t,e,i,s,n){t.top=i,t.left=e,t.right=e+s,t.bottom=i+n,t.width=s,t.height=n}function os(t,e,i,s){const n=i.padding;let{x:o,y:a}=e;for(const r of t){const t=r.box,l=s[r.stack]||{count:1,placed:0,weight:1},h=r.stackWeight/l.weight||1;if(r.horizontal){const s=e.w*h,o=l.size||t.height;k(l.start)&&(a=l.start),t.fullSize?ns(t,n.left,a,i.outerWidth-n.right-n.left,o):ns(t,e.left+l.placed,a,s,o),l.start=a,l.placed+=s,a=t.bottom}else{const s=e.h*h,a=l.size||t.width;k(l.start)&&(o=l.start),t.fullSize?ns(t,o,n.top,a,i.outerHeight-n.bottom-n.top):ns(t,o,e.top+l.placed,a,s),l.start=o,l.placed+=s,o=t.right}}e.x=o,e.y=a}var as={addBox(t,e){t.boxes||(t.boxes=[]),e.fullSize=e.fullSize||!1,e.position=e.position||"top",e.weight=e.weight||0,e._layers=e._layers||function(){return[{z:0,draw(t){e.draw(t)}}]},t.boxes.push(e)},removeBox(t,e){const i=t.boxes?t.boxes.indexOf(e):-1;-1!==i&&t.boxes.splice(i,1)},configure(t,e,i){e.fullSize=i.fullSize,e.position=i.position,e.weight=i.weight},update(t,e,i,s){if(!t)return;const n=ki(t.options.layout.padding),o=Math.max(e-n.width,0),a=Math.max(i-n.height,0),r=function(t){const e=function(t){const e=[];let i,s,n,o,a,r;for(i=0,s=(t||[]).length;i<s;++i)n=t[i],({position:o,options:{stack:a,stackWeight:r=1}}=n),e.push({index:i,box:n,pos:o,horizontal:n.isHorizontal(),weight:n.weight,stack:a&&o+a,stackWeight:r});return e}(t),i=Zi(e.filter((t=>t.box.fullSize)),!0),s=Zi(Ki(e,"left"),!0),n=Zi(Ki(e,"right")),o=Zi(Ki(e,"top"),!0),a=Zi(Ki(e,"bottom")),r=Gi(e,"x"),l=Gi(e,"y");return{fullSize:i,leftAndTop:s.concat(o),rightAndBottom:n.concat(l).concat(a).concat(r),chartArea:Ki(e,"chartArea"),vertical:s.concat(n).concat(l),horizontal:o.concat(a).concat(r)}}(t.boxes),l=r.vertical,h=r.horizontal;u(t.boxes,(t=>{"function"==typeof t.beforeLayout&&t.beforeLayout()}));const c=l.reduce(((t,e)=>e.box.options&&!1===e.box.options.display?t:t+1),0)||1,d=Object.freeze({outerWidth:e,outerHeight:i,padding:n,availableWidth:o,availableHeight:a,vBoxMaxWidth:o/2/c,hBoxMaxHeight:a/2}),f=Object.assign({},n);ts(f,ki(s));const g=Object.assign({maxPadding:f,w:o,h:a,x:n.left,y:n.top},n),p=Ji(l.concat(h),d);ss(r.fullSize,g,d,p),ss(l,g,d,p),ss(h,g,d,p)&&ss(l,g,d,p),function(t){const e=t.maxPadding;function i(i){const s=Math.max(e[i]-t[i],0);return t[i]+=s,s}t.y+=i("top"),t.x+=i("left"),i("right"),i("bottom")}(g),os(r.leftAndTop,g,d,p),g.x+=g.w,g.y+=g.h,os(r.rightAndBottom,g,d,p),t.chartArea={left:g.left,top:g.top,right:g.left+g.w,bottom:g.top+g.h,height:g.h,width:g.w},u(r.chartArea,(e=>{const i=e.box;Object.assign(i,t.chartArea),i.update(g.w,g.h,{left:0,top:0,right:0,bottom:0})}))}};class rs{acquireContext(t,e){}releaseContext(t){return!1}addEventListener(t,e,i){}removeEventListener(t,e,i){}getDevicePixelRatio(){return 1}getMaximumSize(t,e,i,s){return e=Math.max(0,e||t.width),i=i||t.height,{width:e,height:Math.max(0,s?Math.floor(e/s):i)}}isAttached(t){return!0}updateConfig(t){}}class ls extends rs{acquireContext(t){return t&&t.getContext&&t.getContext("2d")||null}updateConfig(t){t.options.animation=!1}}const hs="$chartjs",cs={touchstart:"mousedown",touchmove:"mousemove",touchend:"mouseup",pointerenter:"mouseenter",pointerdown:"mousedown",pointermove:"mousemove",pointerup:"mouseup",pointerleave:"mouseout",pointerout:"mouseout"},ds=t=>null===t||""===t;const us=!!Se&&{passive:!0};function fs(t,e,i){t.canvas.removeEventListener(e,i,us)}function gs(t,e){for(const i of t)if(i===e||i.contains(e))return!0}function ps(t,e,i){const s=t.canvas,n=new MutationObserver((t=>{let e=!1;for(const i of t)e=e||gs(i.addedNodes,s),e=e&&!gs(i.removedNodes,s);e&&i()}));return n.observe(document,{childList:!0,subtree:!0}),n}function ms(t,e,i){const s=t.canvas,n=new MutationObserver((t=>{let e=!1;for(const i of t)e=e||gs(i.removedNodes,s),e=e&&!gs(i.addedNodes,s);e&&i()}));return n.observe(document,{childList:!0,subtree:!0}),n}const bs=new Map;let xs=0;function _s(){const t=window.devicePixelRatio;t!==xs&&(xs=t,bs.forEach(((e,i)=>{i.currentDevicePixelRatio!==t&&e()})))}function ys(t,e,i){const s=t.canvas,n=s&&ge(s);if(!n)return;const o=ct(((t,e)=>{const s=n.clientWidth;i(t,e),s<n.clientWidth&&i()}),window),a=new ResizeObserver((t=>{const e=t[0],i=e.contentRect.width,s=e.contentRect.height;0===i&&0===s||o(i,s)}));return a.observe(n),function(t,e){bs.size||window.addEventListener("resize",_s),bs.set(t,e)}(t,o),a}function vs(t,e,i){i&&i.disconnect(),"resize"===e&&function(t){bs.delete(t),bs.size||window.removeEventListener("resize",_s)}(t)}function Ms(t,e,i){const s=t.canvas,n=ct((e=>{null!==t.ctx&&i(function(t,e){const i=cs[t.type]||t.type,{x:s,y:n}=ve(t,e);return{type:i,chart:e,native:t,x:void 0!==s?s:null,y:void 0!==n?n:null}}(e,t))}),t);return function(t,e,i){t.addEventListener(e,i,us)}(s,e,n),n}class ws extends rs{acquireContext(t,e){const i=t&&t.getContext&&t.getContext("2d");return i&&i.canvas===t?(function(t,e){const i=t.style,s=t.getAttribute("height"),n=t.getAttribute("width");if(t[hs]={initial:{height:s,width:n,style:{display:i.display,height:i.height,width:i.width}}},i.display=i.display||"block",i.boxSizing=i.boxSizing||"border-box",ds(n)){const e=Pe(t,"width");void 0!==e&&(t.width=e)}if(ds(s))if(""===t.style.height)t.height=t.width/(e||2);else{const e=Pe(t,"height");void 0!==e&&(t.height=e)}}(t,e),i):null}releaseContext(t){const e=t.canvas;if(!e[hs])return!1;const i=e[hs].initial;["height","width"].forEach((t=>{const n=i[t];s(n)?e.removeAttribute(t):e.setAttribute(t,n)}));const n=i.style||{};return Object.keys(n).forEach((t=>{e.style[t]=n[t]})),e.width=e.width,delete e[hs],!0}addEventListener(t,e,i){this.removeEventListener(t,e);const s=t.$proxies||(t.$proxies={}),n={attach:ps,detach:ms,resize:ys}[e]||Ms;s[e]=n(t,e,i)}removeEventListener(t,e){const i=t.$proxies||(t.$proxies={}),s=i[e];if(!s)return;({attach:vs,detach:vs,resize:vs}[e]||fs)(t,e,s),i[e]=void 0}getDevicePixelRatio(){return window.devicePixelRatio}getMaximumSize(t,e,i,s){return we(t,e,i,s)}isAttached(t){const e=ge(t);return!(!e||!e.isConnected)}}function ks(t){return!fe()||"undefined"!=typeof OffscreenCanvas&&t instanceof OffscreenCanvas?ls:ws}var Ss=Object.freeze({__proto__:null,BasePlatform:rs,BasicPlatform:ls,DomPlatform:ws,_detectPlatform:ks});const Ps="transparent",Ds={boolean:(t,e,i)=>i>.5?e:t,color(t,e,i){const s=Qt(t||Ps),n=s.valid&&Qt(e||Ps);return n&&n.valid?n.mix(s,i).hexString():e},number:(t,e,i)=>t+(e-t)*i};class Cs{constructor(t,e,i,s){const n=e[i];s=Pi([t.to,s,n,t.from]);const o=Pi([t.from,n,s]);this._active=!0,this._fn=t.fn||Ds[t.type||typeof o],this._easing=fi[t.easing]||fi.linear,this._start=Math.floor(Date.now()+(t.delay||0)),this._duration=this._total=Math.floor(t.duration),this._loop=!!t.loop,this._target=e,this._prop=i,this._from=o,this._to=s,this._promises=void 0}active(){return this._active}update(t,e,i){if(this._active){this._notify(!1);const s=this._target[this._prop],n=i-this._start,o=this._duration-n;this._start=i,this._duration=Math.floor(Math.max(o,t.duration)),this._total+=n,this._loop=!!t.loop,this._to=Pi([t.to,e,s,t.from]),this._from=Pi([t.from,s,e])}}cancel(){this._active&&(this.tick(Date.now()),this._active=!1,this._notify(!1))}tick(t){const e=t-this._start,i=this._duration,s=this._prop,n=this._from,o=this._loop,a=this._to;let r;if(this._active=n!==a&&(o||e<i),!this._active)return this._target[s]=a,void this._notify(!0);e<0?this._target[s]=n:(r=e/i%2,r=o&&r>1?2-r:r,r=this._easing(Math.min(1,Math.max(0,r))),this._target[s]=this._fn(n,a,r))}wait(){const t=this._promises||(this._promises=[]);return new Promise(((e,i)=>{t.push({res:e,rej:i})}))}_notify(t){const e=t?"res":"rej",i=this._promises||[];for(let t=0;t<i.length;t++)i[t][e]()}}class Os{constructor(t,e){this._chart=t,this._properties=new Map,this.configure(e)}configure(t){if(!o(t))return;const e=Object.keys(ue.animation),i=this._properties;Object.getOwnPropertyNames(t).forEach((s=>{const a=t[s];if(!o(a))return;const r={};for(const t of e)r[t]=a[t];(n(a.properties)&&a.properties||[s]).forEach((t=>{t!==s&&i.has(t)||i.set(t,r)}))}))}_animateOptions(t,e){const i=e.options,s=function(t,e){if(!e)return;let i=t.options;if(!i)return void(t.options=e);i.$shared&&(t.options=i=Object.assign({},i,{$shared:!1,$animations:{}}));return i}(t,i);if(!s)return[];const n=this._createAnimations(s,i);return i.$shared&&function(t,e){const i=[],s=Object.keys(e);for(let e=0;e<s.length;e++){const n=t[s[e]];n&&n.active()&&i.push(n.wait())}return Promise.all(i)}(t.options.$animations,i).then((()=>{t.options=i}),(()=>{})),n}_createAnimations(t,e){const i=this._properties,s=[],n=t.$animations||(t.$animations={}),o=Object.keys(e),a=Date.now();let r;for(r=o.length-1;r>=0;--r){const l=o[r];if("$"===l.charAt(0))continue;if("options"===l){s.push(...this._animateOptions(t,e));continue}const h=e[l];let c=n[l];const d=i.get(l);if(c){if(d&&c.active()){c.update(d,h,a);continue}c.cancel()}d&&d.duration?(n[l]=c=new Cs(d,t,l,h),s.push(c)):t[l]=h}return s}update(t,e){if(0===this._properties.size)return void Object.assign(t,e);const i=this._createAnimations(t,e);return i.length?(xt.add(this._chart,i),!0):void 0}}function As(t,e){const i=t&&t.options||{},s=i.reverse,n=void 0===i.min?e:0,o=void 0===i.max?e:0;return{start:s?o:n,end:s?n:o}}function Ts(t,e){const i=[],s=t._getSortedDatasetMetas(e);let n,o;for(n=0,o=s.length;n<o;++n)i.push(s[n].index);return i}function Ls(t,e,i,s={}){const n=t.keys,o="single"===s.mode;let r,l,h,c;if(null!==e){for(r=0,l=n.length;r<l;++r){if(h=+n[r],h===i){if(s.all)continue;break}c=t.values[h],a(c)&&(o||0===e||F(e)===F(c))&&(e+=c)}return e}}function Es(t,e){const i=t&&t.options.stacked;return i||void 0===i&&void 0!==e.stack}function Rs(t,e,i){const s=t[e]||(t[e]={});return s[i]||(s[i]={})}function Is(t,e,i,s){for(const n of e.getMatchingVisibleMetas(s).reverse()){const e=t[n.index];if(i&&e>0||!i&&e<0)return n.index}return null}function zs(t,e){const{chart:i,_cachedMeta:s}=t,n=i._stacks||(i._stacks={}),{iScale:o,vScale:a,index:r}=s,l=o.axis,h=a.axis,c=function(t,e,i){return`${t.id}.${e.id}.${i.stack||i.type}`}(o,a,s),d=e.length;let u;for(let t=0;t<d;++t){const i=e[t],{[l]:o,[h]:d}=i;u=(i._stacks||(i._stacks={}))[h]=Rs(n,c,o),u[r]=d,u._top=Is(u,a,!0,s.type),u._bottom=Is(u,a,!1,s.type);(u._visualValues||(u._visualValues={}))[r]=d}}function Fs(t,e){const i=t.scales;return Object.keys(i).filter((t=>i[t].axis===e)).shift()}function Vs(t,e){const i=t.controller.index,s=t.vScale&&t.vScale.axis;if(s){e=e||t._parsed;for(const t of e){const e=t._stacks;if(!e||void 0===e[s]||void 0===e[s][i])return;delete e[s][i],void 0!==e[s]._visualValues&&void 0!==e[s]._visualValues[i]&&delete e[s]._visualValues[i]}}}const Bs=t=>"reset"===t||"none"===t,Ws=(t,e)=>e?t:Object.assign({},t);class Ns{static defaults={};static datasetElementType=null;static dataElementType=null;constructor(t,e){this.chart=t,this._ctx=t.ctx,this.index=e,this._cachedDataOpts={},this._cachedMeta=this.getMeta(),this._type=this._cachedMeta.type,this.options=void 0,this._parsing=!1,this._data=void 0,this._objectData=void 0,this._sharedOptions=void 0,this._drawStart=void 0,this._drawCount=void 0,this.enableOptionSharing=!1,this.supportsDecimation=!1,this.$context=void 0,this._syncList=[],this.datasetElementType=new.target.datasetElementType,this.dataElementType=new.target.dataElementType,this.initialize()}initialize(){const t=this._cachedMeta;this.configure(),this.linkScales(),t._stacked=Es(t.vScale,t),this.addElements(),this.options.fill&&!this.chart.isPluginEnabled("filler")&&console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options")}updateIndex(t){this.index!==t&&Vs(this._cachedMeta),this.index=t}linkScales(){const t=this.chart,e=this._cachedMeta,i=this.getDataset(),s=(t,e,i,s)=>"x"===t?e:"r"===t?s:i,n=e.xAxisID=l(i.xAxisID,Fs(t,"x")),o=e.yAxisID=l(i.yAxisID,Fs(t,"y")),a=e.rAxisID=l(i.rAxisID,Fs(t,"r")),r=e.indexAxis,h=e.iAxisID=s(r,n,o,a),c=e.vAxisID=s(r,o,n,a);e.xScale=this.getScaleForId(n),e.yScale=this.getScaleForId(o),e.rScale=this.getScaleForId(a),e.iScale=this.getScaleForId(h),e.vScale=this.getScaleForId(c)}getDataset(){return this.chart.data.datasets[this.index]}getMeta(){return this.chart.getDatasetMeta(this.index)}getScaleForId(t){return this.chart.scales[t]}_getOtherScale(t){const e=this._cachedMeta;return t===e.iScale?e.vScale:e.iScale}reset(){this._update("reset")}_destroy(){const t=this._cachedMeta;this._data&&rt(this._data,this),t._stacked&&Vs(t)}_dataCheck(){const t=this.getDataset(),e=t.data||(t.data=[]),i=this._data;if(o(e))this._data=function(t){const e=Object.keys(t),i=new Array(e.length);let s,n,o;for(s=0,n=e.length;s<n;++s)o=e[s],i[s]={x:o,y:t[o]};return i}(e);else if(i!==e){if(i){rt(i,this);const t=this._cachedMeta;Vs(t),t._parsed=[]}e&&Object.isExtensible(e)&&at(e,this),this._syncList=[],this._data=e}}addElements(){const t=this._cachedMeta;this._dataCheck(),this.datasetElementType&&(t.dataset=new this.datasetElementType)}buildOrUpdateElements(t){const e=this._cachedMeta,i=this.getDataset();let s=!1;this._dataCheck();const n=e._stacked;e._stacked=Es(e.vScale,e),e.stack!==i.stack&&(s=!0,Vs(e),e.stack=i.stack),this._resyncElements(t),(s||n!==e._stacked)&&zs(this,e._parsed)}configure(){const t=this.chart.config,e=t.datasetScopeKeys(this._type),i=t.getOptionScopes(this.getDataset(),e,!0);this.options=t.createResolver(i,this.getContext()),this._parsing=this.options.parsing,this._cachedDataOpts={}}parse(t,e){const{_cachedMeta:i,_data:s}=this,{iScale:a,_stacked:r}=i,l=a.axis;let h,c,d,u=0===t&&e===s.length||i._sorted,f=t>0&&i._parsed[t-1];if(!1===this._parsing)i._parsed=s,i._sorted=!0,d=s;else{d=n(s[t])?this.parseArrayData(i,s,t,e):o(s[t])?this.parseObjectData(i,s,t,e):this.parsePrimitiveData(i,s,t,e);const a=()=>null===c[l]||f&&c[l]<f[l];for(h=0;h<e;++h)i._parsed[h+t]=c=d[h],u&&(a()&&(u=!1),f=c);i._sorted=u}r&&zs(this,d)}parsePrimitiveData(t,e,i,s){const{iScale:n,vScale:o}=t,a=n.axis,r=o.axis,l=n.getLabels(),h=n===o,c=new Array(s);let d,u,f;for(d=0,u=s;d<u;++d)f=d+i,c[d]={[a]:h||n.parse(l[f],f),[r]:o.parse(e[f],f)};return c}parseArrayData(t,e,i,s){const{xScale:n,yScale:o}=t,a=new Array(s);let r,l,h,c;for(r=0,l=s;r<l;++r)h=r+i,c=e[h],a[r]={x:n.parse(c[0],h),y:o.parse(c[1],h)};return a}parseObjectData(t,e,i,s){const{xScale:n,yScale:o}=t,{xAxisKey:a="x",yAxisKey:r="y"}=this._parsing,l=new Array(s);let h,c,d,u;for(h=0,c=s;h<c;++h)d=h+i,u=e[d],l[h]={x:n.parse(M(u,a),d),y:o.parse(M(u,r),d)};return l}getParsed(t){return this._cachedMeta._parsed[t]}getDataElement(t){return this._cachedMeta.data[t]}applyStack(t,e,i){const s=this.chart,n=this._cachedMeta,o=e[t.axis];return Ls({keys:Ts(s,!0),values:e._stacks[t.axis]._visualValues},o,n.index,{mode:i})}updateRangeFromParsed(t,e,i,s){const n=i[e.axis];let o=null===n?NaN:n;const a=s&&i._stacks[e.axis];s&&a&&(s.values=a,o=Ls(s,n,this._cachedMeta.index)),t.min=Math.min(t.min,o),t.max=Math.max(t.max,o)}getMinMax(t,e){const i=this._cachedMeta,s=i._parsed,n=i._sorted&&t===i.iScale,o=s.length,r=this._getOtherScale(t),l=((t,e,i)=>t&&!e.hidden&&e._stacked&&{keys:Ts(i,!0),values:null})(e,i,this.chart),h={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY},{min:c,max:d}=function(t){const{min:e,max:i,minDefined:s,maxDefined:n}=t.getUserBounds();return{min:s?e:Number.NEGATIVE_INFINITY,max:n?i:Number.POSITIVE_INFINITY}}(r);let u,f;function g(){f=s[u];const e=f[r.axis];return!a(f[t.axis])||c>e||d<e}for(u=0;u<o&&(g()||(this.updateRangeFromParsed(h,t,f,l),!n));++u);if(n)for(u=o-1;u>=0;--u)if(!g()){this.updateRangeFromParsed(h,t,f,l);break}return h}getAllParsedValues(t){const e=this._cachedMeta._parsed,i=[];let s,n,o;for(s=0,n=e.length;s<n;++s)o=e[s][t.axis],a(o)&&i.push(o);return i}getMaxOverflow(){return!1}getLabelAndValue(t){const e=this._cachedMeta,i=e.iScale,s=e.vScale,n=this.getParsed(t);return{label:i?""+i.getLabelForValue(n[i.axis]):"",value:s?""+s.getLabelForValue(n[s.axis]):""}}_update(t){const e=this._cachedMeta;this.update(t||"default"),e._clip=function(t){let e,i,s,n;return o(t)?(e=t.top,i=t.right,s=t.bottom,n=t.left):e=i=s=n=t,{top:e,right:i,bottom:s,left:n,disabled:!1===t}}(l(this.options.clip,function(t,e,i){if(!1===i)return!1;const s=As(t,i),n=As(e,i);return{top:n.end,right:s.end,bottom:n.start,left:s.start}}(e.xScale,e.yScale,this.getMaxOverflow())))}update(t){}draw(){const t=this._ctx,e=this.chart,i=this._cachedMeta,s=i.data||[],n=e.chartArea,o=[],a=this._drawStart||0,r=this._drawCount||s.length-a,l=this.options.drawActiveElementsOnTop;let h;for(i.dataset&&i.dataset.draw(t,n,a,r),h=a;h<a+r;++h){const e=s[h];e.hidden||(e.active&&l?o.push(e):e.draw(t,n))}for(h=0;h<o.length;++h)o[h].draw(t,n)}getStyle(t,e){const i=e?"active":"default";return void 0===t&&this._cachedMeta.dataset?this.resolveDatasetElementOptions(i):this.resolveDataElementOptions(t||0,i)}getContext(t,e,i){const s=this.getDataset();let n;if(t>=0&&t<this._cachedMeta.data.length){const e=this._cachedMeta.data[t];n=e.$context||(e.$context=function(t,e,i){return Ci(t,{active:!1,dataIndex:e,parsed:void 0,raw:void 0,element:i,index:e,mode:"default",type:"data"})}(this.getContext(),t,e)),n.parsed=this.getParsed(t),n.raw=s.data[t],n.index=n.dataIndex=t}else n=this.$context||(this.$context=function(t,e){return Ci(t,{active:!1,dataset:void 0,datasetIndex:e,index:e,mode:"default",type:"dataset"})}(this.chart.getContext(),this.index)),n.dataset=s,n.index=n.datasetIndex=this.index;return n.active=!!e,n.mode=i,n}resolveDatasetElementOptions(t){return this._resolveElementOptions(this.datasetElementType.id,t)}resolveDataElementOptions(t,e){return this._resolveElementOptions(this.dataElementType.id,e,t)}_resolveElementOptions(t,e="default",i){const s="active"===e,n=this._cachedDataOpts,o=t+"-"+e,a=n[o],r=this.enableOptionSharing&&k(i);if(a)return Ws(a,r);const l=this.chart.config,h=l.datasetElementScopeKeys(this._type,t),c=s?[`${t}Hover`,"hover",t,""]:[t,""],d=l.getOptionScopes(this.getDataset(),h),u=Object.keys(ue.elements[t]),f=l.resolveNamedOptions(d,u,(()=>this.getContext(i,s,e)),c);return f.$shared&&(f.$shared=r,n[o]=Object.freeze(Ws(f,r))),f}_resolveAnimations(t,e,i){const s=this.chart,n=this._cachedDataOpts,o=`animation-${e}`,a=n[o];if(a)return a;let r;if(!1!==s.options.animation){const s=this.chart.config,n=s.datasetAnimationScopeKeys(this._type,e),o=s.getOptionScopes(this.getDataset(),n);r=s.createResolver(o,this.getContext(t,i,e))}const l=new Os(s,r&&r.animations);return r&&r._cacheable&&(n[o]=Object.freeze(l)),l}getSharedOptions(t){if(t.$shared)return this._sharedOptions||(this._sharedOptions=Object.assign({},t))}includeOptions(t,e){return!e||Bs(t)||this.chart._animationsDisabled}_getSharedOptions(t,e){const i=this.resolveDataElementOptions(t,e),s=this._sharedOptions,n=this.getSharedOptions(i),o=this.includeOptions(e,n)||n!==s;return this.updateSharedOptions(n,e,i),{sharedOptions:n,includeOptions:o}}updateElement(t,e,i,s){Bs(s)?Object.assign(t,i):this._resolveAnimations(e,s).update(t,i)}updateSharedOptions(t,e,i){t&&!Bs(e)&&this._resolveAnimations(void 0,e).update(t,i)}_setStyle(t,e,i,s){t.active=s;const n=this.getStyle(e,s);this._resolveAnimations(e,i,s).update(t,{options:!s&&this.getSharedOptions(n)||n})}removeHoverStyle(t,e,i){this._setStyle(t,i,"active",!1)}setHoverStyle(t,e,i){this._setStyle(t,i,"active",!0)}_removeDatasetHoverStyle(){const t=this._cachedMeta.dataset;t&&this._setStyle(t,void 0,"active",!1)}_setDatasetHoverStyle(){const t=this._cachedMeta.dataset;t&&this._setStyle(t,void 0,"active",!0)}_resyncElements(t){const e=this._data,i=this._cachedMeta.data;for(const[t,e,i]of this._syncList)this[t](e,i);this._syncList=[];const s=i.length,n=e.length,o=Math.min(n,s);o&&this.parse(0,o),n>s?this._insertElements(s,n-s,t):n<s&&this._removeElements(n,s-n)}_insertElements(t,e,i=!0){const s=this._cachedMeta,n=s.data,o=t+e;let a;const r=t=>{for(t.length+=e,a=t.length-1;a>=o;a--)t[a]=t[a-e]};for(r(n),a=t;a<o;++a)n[a]=new this.dataElementType;this._parsing&&r(s._parsed),this.parse(t,e),i&&this.updateElements(n,t,e,"reset")}updateElements(t,e,i,s){}_removeElements(t,e){const i=this._cachedMeta;if(this._parsing){const s=i._parsed.splice(t,e);i._stacked&&Vs(i,s)}i.data.splice(t,e)}_sync(t){if(this._parsing)this._syncList.push(t);else{const[e,i,s]=t;this[e](i,s)}this.chart._dataChanges.push([this.index,...t])}_onDataPush(){const t=arguments.length;this._sync(["_insertElements",this.getDataset().data.length-t,t])}_onDataPop(){this._sync(["_removeElements",this._cachedMeta.data.length-1,1])}_onDataShift(){this._sync(["_removeElements",0,1])}_onDataSplice(t,e){e&&this._sync(["_removeElements",t,e]);const i=arguments.length-2;i&&this._sync(["_insertElements",t,i])}_onDataUnshift(){this._sync(["_insertElements",0,arguments.length])}}class Hs{static defaults={};static defaultRoutes=void 0;x;y;active=!1;options;$animations;tooltipPosition(t){const{x:e,y:i}=this.getProps(["x","y"],t);return{x:e,y:i}}hasValue(){return N(this.x)&&N(this.y)}getProps(t,e){const i=this.$animations;if(!e||!i)return this;const s={};return t.forEach((t=>{s[t]=i[t]&&i[t].active()?i[t]._to:this[t]})),s}}function js(t,e){const i=t.options.ticks,n=function(t){const e=t.options.offset,i=t._tickSize(),s=t._length/i+(e?0:1),n=t._maxLength/i;return Math.floor(Math.min(s,n))}(t),o=Math.min(i.maxTicksLimit||n,n),a=i.major.enabled?function(t){const e=[];let i,s;for(i=0,s=t.length;i<s;i++)t[i].major&&e.push(i);return e}(e):[],r=a.length,l=a[0],h=a[r-1],c=[];if(r>o)return function(t,e,i,s){let n,o=0,a=i[0];for(s=Math.ceil(s),n=0;n<t.length;n++)n===a&&(e.push(t[n]),o++,a=i[o*s])}(e,c,a,r/o),c;const d=function(t,e,i){const s=function(t){const e=t.length;let i,s;if(e<2)return!1;for(s=t[0],i=1;i<e;++i)if(t[i]-t[i-1]!==s)return!1;return s}(t),n=e.length/i;if(!s)return Math.max(n,1);const o=W(s);for(let t=0,e=o.length-1;t<e;t++){const e=o[t];if(e>n)return e}return Math.max(n,1)}(a,e,o);if(r>0){let t,i;const n=r>1?Math.round((h-l)/(r-1)):null;for($s(e,c,d,s(n)?0:l-n,l),t=0,i=r-1;t<i;t++)$s(e,c,d,a[t],a[t+1]);return $s(e,c,d,h,s(n)?e.length:h+n),c}return $s(e,c,d),c}function $s(t,e,i,s,n){const o=l(s,0),a=Math.min(l(n,t.length),t.length);let r,h,c,d=0;for(i=Math.ceil(i),n&&(r=n-s,i=r/Math.floor(r/i)),c=o;c<0;)d++,c=Math.round(o+d*i);for(h=Math.max(o,0);h<a;h++)h===c&&(e.push(t[h]),d++,c=Math.round(o+d*i))}const Ys=(t,e,i)=>"top"===e||"left"===e?t[e]+i:t[e]-i,Us=(t,e)=>Math.min(e||t,t);function Xs(t,e){const i=[],s=t.length/e,n=t.length;let o=0;for(;o<n;o+=s)i.push(t[Math.floor(o)]);return i}function qs(t,e,i){const s=t.ticks.length,n=Math.min(e,s-1),o=t._startPixel,a=t._endPixel,r=1e-6;let l,h=t.getPixelForTick(n);if(!(i&&(l=1===s?Math.max(h-o,a-h):0===e?(t.getPixelForTick(1)-h)/2:(h-t.getPixelForTick(n-1))/2,h+=n<e?l:-l,h<o-r||h>a+r)))return h}function Ks(t){return t.drawTicks?t.tickLength:0}function Gs(t,e){if(!t.display)return 0;const i=Si(t.font,e),s=ki(t.padding);return(n(t.text)?t.text.length:1)*i.lineHeight+s.height}function Zs(t,e,i){let s=ut(t);return(i&&"right"!==e||!i&&"right"===e)&&(s=(t=>"left"===t?"right":"right"===t?"left":t)(s)),s}class Js extends Hs{constructor(t){super(),this.id=t.id,this.type=t.type,this.options=void 0,this.ctx=t.ctx,this.chart=t.chart,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.width=void 0,this.height=void 0,this._margins={left:0,right:0,top:0,bottom:0},this.maxWidth=void 0,this.maxHeight=void 0,this.paddingTop=void 0,this.paddingBottom=void 0,this.paddingLeft=void 0,this.paddingRight=void 0,this.axis=void 0,this.labelRotation=void 0,this.min=void 0,this.max=void 0,this._range=void 0,this.ticks=[],this._gridLineItems=null,this._labelItems=null,this._labelSizes=null,this._length=0,this._maxLength=0,this._longestTextCache={},this._startPixel=void 0,this._endPixel=void 0,this._reversePixels=!1,this._userMax=void 0,this._userMin=void 0,this._suggestedMax=void 0,this._suggestedMin=void 0,this._ticksLength=0,this._borderValue=0,this._cache={},this._dataLimitsCached=!1,this.$context=void 0}init(t){this.options=t.setContext(this.getContext()),this.axis=t.axis,this._userMin=this.parse(t.min),this._userMax=this.parse(t.max),this._suggestedMin=this.parse(t.suggestedMin),this._suggestedMax=this.parse(t.suggestedMax)}parse(t,e){return t}getUserBounds(){let{_userMin:t,_userMax:e,_suggestedMin:i,_suggestedMax:s}=this;return t=r(t,Number.POSITIVE_INFINITY),e=r(e,Number.NEGATIVE_INFINITY),i=r(i,Number.POSITIVE_INFINITY),s=r(s,Number.NEGATIVE_INFINITY),{min:r(t,i),max:r(e,s),minDefined:a(t),maxDefined:a(e)}}getMinMax(t){let e,{min:i,max:s,minDefined:n,maxDefined:o}=this.getUserBounds();if(n&&o)return{min:i,max:s};const a=this.getMatchingVisibleMetas();for(let r=0,l=a.length;r<l;++r)e=a[r].controller.getMinMax(this,t),n||(i=Math.min(i,e.min)),o||(s=Math.max(s,e.max));return i=o&&i>s?s:i,s=n&&i>s?i:s,{min:r(i,r(s,i)),max:r(s,r(i,s))}}getPadding(){return{left:this.paddingLeft||0,top:this.paddingTop||0,right:this.paddingRight||0,bottom:this.paddingBottom||0}}getTicks(){return this.ticks}getLabels(){const t=this.chart.data;return this.options.labels||(this.isHorizontal()?t.xLabels:t.yLabels)||t.labels||[]}getLabelItems(t=this.chart.chartArea){return this._labelItems||(this._labelItems=this._computeLabelItems(t))}beforeLayout(){this._cache={},this._dataLimitsCached=!1}beforeUpdate(){d(this.options.beforeUpdate,[this])}update(t,e,i){const{beginAtZero:s,grace:n,ticks:o}=this.options,a=o.sampleSize;this.beforeUpdate(),this.maxWidth=t,this.maxHeight=e,this._margins=i=Object.assign({left:0,right:0,top:0,bottom:0},i),this.ticks=null,this._labelSizes=null,this._gridLineItems=null,this._labelItems=null,this.beforeSetDimensions(),this.setDimensions(),this.afterSetDimensions(),this._maxLength=this.isHorizontal()?this.width+i.left+i.right:this.height+i.top+i.bottom,this._dataLimitsCached||(this.beforeDataLimits(),this.determineDataLimits(),this.afterDataLimits(),this._range=Di(this,n,s),this._dataLimitsCached=!0),this.beforeBuildTicks(),this.ticks=this.buildTicks()||[],this.afterBuildTicks();const r=a<this.ticks.length;this._convertTicksToLabels(r?Xs(this.ticks,a):this.ticks),this.configure(),this.beforeCalculateLabelRotation(),this.calculateLabelRotation(),this.afterCalculateLabelRotation(),o.display&&(o.autoSkip||"auto"===o.source)&&(this.ticks=js(this,this.ticks),this._labelSizes=null,this.afterAutoSkip()),r&&this._convertTicksToLabels(this.ticks),this.beforeFit(),this.fit(),this.afterFit(),this.afterUpdate()}configure(){let t,e,i=this.options.reverse;this.isHorizontal()?(t=this.left,e=this.right):(t=this.top,e=this.bottom,i=!i),this._startPixel=t,this._endPixel=e,this._reversePixels=i,this._length=e-t,this._alignToPixels=this.options.alignToPixels}afterUpdate(){d(this.options.afterUpdate,[this])}beforeSetDimensions(){d(this.options.beforeSetDimensions,[this])}setDimensions(){this.isHorizontal()?(this.width=this.maxWidth,this.left=0,this.right=this.width):(this.height=this.maxHeight,this.top=0,this.bottom=this.height),this.paddingLeft=0,this.paddingTop=0,this.paddingRight=0,this.paddingBottom=0}afterSetDimensions(){d(this.options.afterSetDimensions,[this])}_callHooks(t){this.chart.notifyPlugins(t,this.getContext()),d(this.options[t],[this])}beforeDataLimits(){this._callHooks("beforeDataLimits")}determineDataLimits(){}afterDataLimits(){this._callHooks("afterDataLimits")}beforeBuildTicks(){this._callHooks("beforeBuildTicks")}buildTicks(){return[]}afterBuildTicks(){this._callHooks("afterBuildTicks")}beforeTickToLabelConversion(){d(this.options.beforeTickToLabelConversion,[this])}generateTickLabels(t){const e=this.options.ticks;let i,s,n;for(i=0,s=t.length;i<s;i++)n=t[i],n.label=d(e.callback,[n.value,i,t],this)}afterTickToLabelConversion(){d(this.options.afterTickToLabelConversion,[this])}beforeCalculateLabelRotation(){d(this.options.beforeCalculateLabelRotation,[this])}calculateLabelRotation(){const t=this.options,e=t.ticks,i=Us(this.ticks.length,t.ticks.maxTicksLimit),s=e.minRotation||0,n=e.maxRotation;let o,a,r,l=s;if(!this._isVisible()||!e.display||s>=n||i<=1||!this.isHorizontal())return void(this.labelRotation=s);const h=this._getLabelSizes(),c=h.widest.width,d=h.highest.height,u=J(this.chart.width-c,0,this.maxWidth);o=t.offset?this.maxWidth/i:u/(i-1),c+6>o&&(o=u/(i-(t.offset?.5:1)),a=this.maxHeight-Ks(t.grid)-e.padding-Gs(t.title,this.chart.options.font),r=Math.sqrt(c*c+d*d),l=Y(Math.min(Math.asin(J((h.highest.height+6)/o,-1,1)),Math.asin(J(a/r,-1,1))-Math.asin(J(d/r,-1,1)))),l=Math.max(s,Math.min(n,l))),this.labelRotation=l}afterCalculateLabelRotation(){d(this.options.afterCalculateLabelRotation,[this])}afterAutoSkip(){}beforeFit(){d(this.options.beforeFit,[this])}fit(){const t={width:0,height:0},{chart:e,options:{ticks:i,title:s,grid:n}}=this,o=this._isVisible(),a=this.isHorizontal();if(o){const o=Gs(s,e.options.font);if(a?(t.width=this.maxWidth,t.height=Ks(n)+o):(t.height=this.maxHeight,t.width=Ks(n)+o),i.display&&this.ticks.length){const{first:e,last:s,widest:n,highest:o}=this._getLabelSizes(),r=2*i.padding,l=$(this.labelRotation),h=Math.cos(l),c=Math.sin(l);if(a){const e=i.mirror?0:c*n.width+h*o.height;t.height=Math.min(this.maxHeight,t.height+e+r)}else{const e=i.mirror?0:h*n.width+c*o.height;t.width=Math.min(this.maxWidth,t.width+e+r)}this._calculatePadding(e,s,c,h)}}this._handleMargins(),a?(this.width=this._length=e.width-this._margins.left-this._margins.right,this.height=t.height):(this.width=t.width,this.height=this._length=e.height-this._margins.top-this._margins.bottom)}_calculatePadding(t,e,i,s){const{ticks:{align:n,padding:o},position:a}=this.options,r=0!==this.labelRotation,l="top"!==a&&"x"===this.axis;if(this.isHorizontal()){const a=this.getPixelForTick(0)-this.left,h=this.right-this.getPixelForTick(this.ticks.length-1);let c=0,d=0;r?l?(c=s*t.width,d=i*e.height):(c=i*t.height,d=s*e.width):"start"===n?d=e.width:"end"===n?c=t.width:"inner"!==n&&(c=t.width/2,d=e.width/2),this.paddingLeft=Math.max((c-a+o)*this.width/(this.width-a),0),this.paddingRight=Math.max((d-h+o)*this.width/(this.width-h),0)}else{let i=e.height/2,s=t.height/2;"start"===n?(i=0,s=t.height):"end"===n&&(i=e.height,s=0),this.paddingTop=i+o,this.paddingBottom=s+o}}_handleMargins(){this._margins&&(this._margins.left=Math.max(this.paddingLeft,this._margins.left),this._margins.top=Math.max(this.paddingTop,this._margins.top),this._margins.right=Math.max(this.paddingRight,this._margins.right),this._margins.bottom=Math.max(this.paddingBottom,this._margins.bottom))}afterFit(){d(this.options.afterFit,[this])}isHorizontal(){const{axis:t,position:e}=this.options;return"top"===e||"bottom"===e||"x"===t}isFullSize(){return this.options.fullSize}_convertTicksToLabels(t){let e,i;for(this.beforeTickToLabelConversion(),this.generateTickLabels(t),e=0,i=t.length;e<i;e++)s(t[e].label)&&(t.splice(e,1),i--,e--);this.afterTickToLabelConversion()}_getLabelSizes(){let t=this._labelSizes;if(!t){const e=this.options.ticks.sampleSize;let i=this.ticks;e<i.length&&(i=Xs(i,e)),this._labelSizes=t=this._computeLabelSizes(i,i.length,this.options.ticks.maxTicksLimit)}return t}_computeLabelSizes(t,e,i){const{ctx:o,_longestTextCache:a}=this,r=[],l=[],h=Math.floor(e/Us(e,i));let c,d,f,g,p,m,b,x,_,y,v,M=0,w=0;for(c=0;c<e;c+=h){if(g=t[c].label,p=this._resolveTickFontOptions(c),o.font=m=p.string,b=a[m]=a[m]||{data:{},gc:[]},x=p.lineHeight,_=y=0,s(g)||n(g)){if(n(g))for(d=0,f=g.length;d<f;++d)v=g[d],s(v)||n(v)||(_=Ce(o,b.data,b.gc,_,v),y+=x)}else _=Ce(o,b.data,b.gc,_,g),y=x;r.push(_),l.push(y),M=Math.max(_,M),w=Math.max(y,w)}!function(t,e){u(t,(t=>{const i=t.gc,s=i.length/2;let n;if(s>e){for(n=0;n<s;++n)delete t.data[i[n]];i.splice(0,s)}}))}(a,e);const k=r.indexOf(M),S=l.indexOf(w),P=t=>({width:r[t]||0,height:l[t]||0});return{first:P(0),last:P(e-1),widest:P(k),highest:P(S),widths:r,heights:l}}getLabelForValue(t){return t}getPixelForValue(t,e){return NaN}getValueForPixel(t){}getPixelForTick(t){const e=this.ticks;return t<0||t>e.length-1?null:this.getPixelForValue(e[t].value)}getPixelForDecimal(t){this._reversePixels&&(t=1-t);const e=this._startPixel+t*this._length;return Q(this._alignToPixels?Ae(this.chart,e,0):e)}getDecimalForPixel(t){const e=(t-this._startPixel)/this._length;return this._reversePixels?1-e:e}getBasePixel(){return this.getPixelForValue(this.getBaseValue())}getBaseValue(){const{min:t,max:e}=this;return t<0&&e<0?e:t>0&&e>0?t:0}getContext(t){const e=this.ticks||[];if(t>=0&&t<e.length){const i=e[t];return i.$context||(i.$context=function(t,e,i){return Ci(t,{tick:i,index:e,type:"tick"})}(this.getContext(),t,i))}return this.$context||(this.$context=Ci(this.chart.getContext(),{scale:this,type:"scale"}))}_tickSize(){const t=this.options.ticks,e=$(this.labelRotation),i=Math.abs(Math.cos(e)),s=Math.abs(Math.sin(e)),n=this._getLabelSizes(),o=t.autoSkipPadding||0,a=n?n.widest.width+o:0,r=n?n.highest.height+o:0;return this.isHorizontal()?r*i>a*s?a/i:r/s:r*s<a*i?r/i:a/s}_isVisible(){const t=this.options.display;return"auto"!==t?!!t:this.getMatchingVisibleMetas().length>0}_computeGridLineItems(t){const e=this.axis,i=this.chart,s=this.options,{grid:n,position:a,border:r}=s,h=n.offset,c=this.isHorizontal(),d=this.ticks.length+(h?1:0),u=Ks(n),f=[],g=r.setContext(this.getContext()),p=g.display?g.width:0,m=p/2,b=function(t){return Ae(i,t,p)};let x,_,y,v,M,w,k,S,P,D,C,O;if("top"===a)x=b(this.bottom),w=this.bottom-u,S=x-m,D=b(t.top)+m,O=t.bottom;else if("bottom"===a)x=b(this.top),D=t.top,O=b(t.bottom)-m,w=x+m,S=this.top+u;else if("left"===a)x=b(this.right),M=this.right-u,k=x-m,P=b(t.left)+m,C=t.right;else if("right"===a)x=b(this.left),P=t.left,C=b(t.right)-m,M=x+m,k=this.left+u;else if("x"===e){if("center"===a)x=b((t.top+t.bottom)/2+.5);else if(o(a)){const t=Object.keys(a)[0],e=a[t];x=b(this.chart.scales[t].getPixelForValue(e))}D=t.top,O=t.bottom,w=x+m,S=w+u}else if("y"===e){if("center"===a)x=b((t.left+t.right)/2);else if(o(a)){const t=Object.keys(a)[0],e=a[t];x=b(this.chart.scales[t].getPixelForValue(e))}M=x-m,k=M-u,P=t.left,C=t.right}const A=l(s.ticks.maxTicksLimit,d),T=Math.max(1,Math.ceil(d/A));for(_=0;_<d;_+=T){const t=this.getContext(_),e=n.setContext(t),s=r.setContext(t),o=e.lineWidth,a=e.color,l=s.dash||[],d=s.dashOffset,u=e.tickWidth,g=e.tickColor,p=e.tickBorderDash||[],m=e.tickBorderDashOffset;y=qs(this,_,h),void 0!==y&&(v=Ae(i,y,o),c?M=k=P=C=v:w=S=D=O=v,f.push({tx1:M,ty1:w,tx2:k,ty2:S,x1:P,y1:D,x2:C,y2:O,width:o,color:a,borderDash:l,borderDashOffset:d,tickWidth:u,tickColor:g,tickBorderDash:p,tickBorderDashOffset:m}))}return this._ticksLength=d,this._borderValue=x,f}_computeLabelItems(t){const e=this.axis,i=this.options,{position:s,ticks:a}=i,r=this.isHorizontal(),l=this.ticks,{align:h,crossAlign:c,padding:d,mirror:u}=a,f=Ks(i.grid),g=f+d,p=u?-d:g,m=-$(this.labelRotation),b=[];let x,_,y,v,M,w,k,S,P,D,C,O,A="middle";if("top"===s)w=this.bottom-p,k=this._getXAxisLabelAlignment();else if("bottom"===s)w=this.top+p,k=this._getXAxisLabelAlignment();else if("left"===s){const t=this._getYAxisLabelAlignment(f);k=t.textAlign,M=t.x}else if("right"===s){const t=this._getYAxisLabelAlignment(f);k=t.textAlign,M=t.x}else if("x"===e){if("center"===s)w=(t.top+t.bottom)/2+g;else if(o(s)){const t=Object.keys(s)[0],e=s[t];w=this.chart.scales[t].getPixelForValue(e)+g}k=this._getXAxisLabelAlignment()}else if("y"===e){if("center"===s)M=(t.left+t.right)/2-g;else if(o(s)){const t=Object.keys(s)[0],e=s[t];M=this.chart.scales[t].getPixelForValue(e)}k=this._getYAxisLabelAlignment(f).textAlign}"y"===e&&("start"===h?A="top":"end"===h&&(A="bottom"));const T=this._getLabelSizes();for(x=0,_=l.length;x<_;++x){y=l[x],v=y.label;const t=a.setContext(this.getContext(x));S=this.getPixelForTick(x)+a.labelOffset,P=this._resolveTickFontOptions(x),D=P.lineHeight,C=n(v)?v.length:1;const e=C/2,i=t.color,o=t.textStrokeColor,h=t.textStrokeWidth;let d,f=k;if(r?(M=S,"inner"===k&&(f=x===_-1?this.options.reverse?"left":"right":0===x?this.options.reverse?"right":"left":"center"),O="top"===s?"near"===c||0!==m?-C*D+D/2:"center"===c?-T.highest.height/2-e*D+D:-T.highest.height+D/2:"near"===c||0!==m?D/2:"center"===c?T.highest.height/2-e*D:T.highest.height-C*D,u&&(O*=-1),0===m||t.showLabelBackdrop||(M+=D/2*Math.sin(m))):(w=S,O=(1-C)*D/2),t.showLabelBackdrop){const e=ki(t.backdropPadding),i=T.heights[x],s=T.widths[x];let n=O-e.top,o=0-e.left;switch(A){case"middle":n-=i/2;break;case"bottom":n-=i}switch(k){case"center":o-=s/2;break;case"right":o-=s}d={left:o,top:n,width:s+e.width,height:i+e.height,color:t.backdropColor}}b.push({label:v,font:P,textOffset:O,options:{rotation:m,color:i,strokeColor:o,strokeWidth:h,textAlign:f,textBaseline:A,translation:[M,w],backdrop:d}})}return b}_getXAxisLabelAlignment(){const{position:t,ticks:e}=this.options;if(-$(this.labelRotation))return"top"===t?"left":"right";let i="center";return"start"===e.align?i="left":"end"===e.align?i="right":"inner"===e.align&&(i="inner"),i}_getYAxisLabelAlignment(t){const{position:e,ticks:{crossAlign:i,mirror:s,padding:n}}=this.options,o=t+n,a=this._getLabelSizes().widest.width;let r,l;return"left"===e?s?(l=this.right+n,"near"===i?r="left":"center"===i?(r="center",l+=a/2):(r="right",l+=a)):(l=this.right-o,"near"===i?r="right":"center"===i?(r="center",l-=a/2):(r="left",l=this.left)):"right"===e?s?(l=this.left+n,"near"===i?r="right":"center"===i?(r="center",l-=a/2):(r="left",l-=a)):(l=this.left+o,"near"===i?r="left":"center"===i?(r="center",l+=a/2):(r="right",l=this.right)):r="right",{textAlign:r,x:l}}_computeLabelArea(){if(this.options.ticks.mirror)return;const t=this.chart,e=this.options.position;return"left"===e||"right"===e?{top:0,left:this.left,bottom:t.height,right:this.right}:"top"===e||"bottom"===e?{top:this.top,left:0,bottom:this.bottom,right:t.width}:void 0}drawBackground(){const{ctx:t,options:{backgroundColor:e},left:i,top:s,width:n,height:o}=this;e&&(t.save(),t.fillStyle=e,t.fillRect(i,s,n,o),t.restore())}getLineWidthForValue(t){const e=this.options.grid;if(!this._isVisible()||!e.display)return 0;const i=this.ticks.findIndex((e=>e.value===t));if(i>=0){return e.setContext(this.getContext(i)).lineWidth}return 0}drawGrid(t){const e=this.options.grid,i=this.ctx,s=this._gridLineItems||(this._gridLineItems=this._computeGridLineItems(t));let n,o;const a=(t,e,s)=>{s.width&&s.color&&(i.save(),i.lineWidth=s.width,i.strokeStyle=s.color,i.setLineDash(s.borderDash||[]),i.lineDashOffset=s.borderDashOffset,i.beginPath(),i.moveTo(t.x,t.y),i.lineTo(e.x,e.y),i.stroke(),i.restore())};if(e.display)for(n=0,o=s.length;n<o;++n){const t=s[n];e.drawOnChartArea&&a({x:t.x1,y:t.y1},{x:t.x2,y:t.y2},t),e.drawTicks&&a({x:t.tx1,y:t.ty1},{x:t.tx2,y:t.ty2},{color:t.tickColor,width:t.tickWidth,borderDash:t.tickBorderDash,borderDashOffset:t.tickBorderDashOffset})}}drawBorder(){const{chart:t,ctx:e,options:{border:i,grid:s}}=this,n=i.setContext(this.getContext()),o=i.display?n.width:0;if(!o)return;const a=s.setContext(this.getContext(0)).lineWidth,r=this._borderValue;let l,h,c,d;this.isHorizontal()?(l=Ae(t,this.left,o)-o/2,h=Ae(t,this.right,a)+a/2,c=d=r):(c=Ae(t,this.top,o)-o/2,d=Ae(t,this.bottom,a)+a/2,l=h=r),e.save(),e.lineWidth=n.width,e.strokeStyle=n.color,e.beginPath(),e.moveTo(l,c),e.lineTo(h,d),e.stroke(),e.restore()}drawLabels(t){if(!this.options.ticks.display)return;const e=this.ctx,i=this._computeLabelArea();i&&Ie(e,i);const s=this.getLabelItems(t);for(const t of s){const i=t.options,s=t.font;Ne(e,t.label,0,t.textOffset,s,i)}i&&ze(e)}drawTitle(){const{ctx:t,options:{position:e,title:i,reverse:s}}=this;if(!i.display)return;const a=Si(i.font),r=ki(i.padding),l=i.align;let h=a.lineHeight/2;"bottom"===e||"center"===e||o(e)?(h+=r.bottom,n(i.text)&&(h+=a.lineHeight*(i.text.length-1))):h+=r.top;const{titleX:c,titleY:d,maxWidth:u,rotation:f}=function(t,e,i,s){const{top:n,left:a,bottom:r,right:l,chart:h}=t,{chartArea:c,scales:d}=h;let u,f,g,p=0;const m=r-n,b=l-a;if(t.isHorizontal()){if(f=ft(s,a,l),o(i)){const t=Object.keys(i)[0],s=i[t];g=d[t].getPixelForValue(s)+m-e}else g="center"===i?(c.bottom+c.top)/2+m-e:Ys(t,i,e);u=l-a}else{if(o(i)){const t=Object.keys(i)[0],s=i[t];f=d[t].getPixelForValue(s)-b+e}else f="center"===i?(c.left+c.right)/2-b+e:Ys(t,i,e);g=ft(s,r,n),p="left"===i?-E:E}return{titleX:f,titleY:g,maxWidth:u,rotation:p}}(this,h,e,l);Ne(t,i.text,0,0,a,{color:i.color,maxWidth:u,rotation:f,textAlign:Zs(l,e,s),textBaseline:"middle",translation:[c,d]})}draw(t){this._isVisible()&&(this.drawBackground(),this.drawGrid(t),this.drawBorder(),this.drawTitle(),this.drawLabels(t))}_layers(){const t=this.options,e=t.ticks&&t.ticks.z||0,i=l(t.grid&&t.grid.z,-1),s=l(t.border&&t.border.z,0);return this._isVisible()&&this.draw===Js.prototype.draw?[{z:i,draw:t=>{this.drawBackground(),this.drawGrid(t),this.drawTitle()}},{z:s,draw:()=>{this.drawBorder()}},{z:e,draw:t=>{this.drawLabels(t)}}]:[{z:e,draw:t=>{this.draw(t)}}]}getMatchingVisibleMetas(t){const e=this.chart.getSortedVisibleDatasetMetas(),i=this.axis+"AxisID",s=[];let n,o;for(n=0,o=e.length;n<o;++n){const o=e[n];o[i]!==this.id||t&&o.type!==t||s.push(o)}return s}_resolveTickFontOptions(t){return Si(this.options.ticks.setContext(this.getContext(t)).font)}_maxDigits(){const t=this._resolveTickFontOptions(0).lineHeight;return(this.isHorizontal()?this.width:this.height)/t}}class Qs{constructor(t,e,i){this.type=t,this.scope=e,this.override=i,this.items=Object.create(null)}isForType(t){return Object.prototype.isPrototypeOf.call(this.type.prototype,t.prototype)}register(t){const e=Object.getPrototypeOf(t);let i;(function(t){return"id"in t&&"defaults"in t})(e)&&(i=this.register(e));const s=this.items,n=t.id,o=this.scope+"."+n;if(!n)throw new Error("class does not have id: "+t);return n in s||(s[n]=t,function(t,e,i){const s=b(Object.create(null),[i?ue.get(i):{},ue.get(e),t.defaults]);ue.set(e,s),t.defaultRoutes&&function(t,e){Object.keys(e).forEach((i=>{const s=i.split("."),n=s.pop(),o=[t].concat(s).join("."),a=e[i].split("."),r=a.pop(),l=a.join(".");ue.route(o,n,l,r)}))}(e,t.defaultRoutes);t.descriptors&&ue.describe(e,t.descriptors)}(t,o,i),this.override&&ue.override(t.id,t.overrides)),o}get(t){return this.items[t]}unregister(t){const e=this.items,i=t.id,s=this.scope;i in e&&delete e[i],s&&i in ue[s]&&(delete ue[s][i],this.override&&delete re[i])}}class tn{constructor(){this.controllers=new Qs(Ns,"datasets",!0),this.elements=new Qs(Hs,"elements"),this.plugins=new Qs(Object,"plugins"),this.scales=new Qs(Js,"scales"),this._typedRegistries=[this.controllers,this.scales,this.elements]}add(...t){this._each("register",t)}remove(...t){this._each("unregister",t)}addControllers(...t){this._each("register",t,this.controllers)}addElements(...t){this._each("register",t,this.elements)}addPlugins(...t){this._each("register",t,this.plugins)}addScales(...t){this._each("register",t,this.scales)}getController(t){return this._get(t,this.controllers,"controller")}getElement(t){return this._get(t,this.elements,"element")}getPlugin(t){return this._get(t,this.plugins,"plugin")}getScale(t){return this._get(t,this.scales,"scale")}removeControllers(...t){this._each("unregister",t,this.controllers)}removeElements(...t){this._each("unregister",t,this.elements)}removePlugins(...t){this._each("unregister",t,this.plugins)}removeScales(...t){this._each("unregister",t,this.scales)}_each(t,e,i){[...e].forEach((e=>{const s=i||this._getRegistryForType(e);i||s.isForType(e)||s===this.plugins&&e.id?this._exec(t,s,e):u(e,(e=>{const s=i||this._getRegistryForType(e);this._exec(t,s,e)}))}))}_exec(t,e,i){const s=w(t);d(i["before"+s],[],i),e[t](i),d(i["after"+s],[],i)}_getRegistryForType(t){for(let e=0;e<this._typedRegistries.length;e++){const i=this._typedRegistries[e];if(i.isForType(t))return i}return this.plugins}_get(t,e,i){const s=e.get(t);if(void 0===s)throw new Error('"'+t+'" is not a registered '+i+".");return s}}var en=new tn;class sn{constructor(){this._init=[]}notify(t,e,i,s){"beforeInit"===e&&(this._init=this._createDescriptors(t,!0),this._notify(this._init,t,"install"));const n=s?this._descriptors(t).filter(s):this._descriptors(t),o=this._notify(n,t,e,i);return"afterDestroy"===e&&(this._notify(n,t,"stop"),this._notify(this._init,t,"uninstall")),o}_notify(t,e,i,s){s=s||{};for(const n of t){const t=n.plugin;if(!1===d(t[i],[e,s,n.options],t)&&s.cancelable)return!1}return!0}invalidate(){s(this._cache)||(this._oldCache=this._cache,this._cache=void 0)}_descriptors(t){if(this._cache)return this._cache;const e=this._cache=this._createDescriptors(t);return this._notifyStateChanges(t),e}_createDescriptors(t,e){const i=t&&t.config,s=l(i.options&&i.options.plugins,{}),n=function(t){const e={},i=[],s=Object.keys(en.plugins.items);for(let t=0;t<s.length;t++)i.push(en.getPlugin(s[t]));const n=t.plugins||[];for(let t=0;t<n.length;t++){const s=n[t];-1===i.indexOf(s)&&(i.push(s),e[s.id]=!0)}return{plugins:i,localIds:e}}(i);return!1!==s||e?function(t,{plugins:e,localIds:i},s,n){const o=[],a=t.getContext();for(const r of e){const e=r.id,l=nn(s[e],n);null!==l&&o.push({plugin:r,options:on(t.config,{plugin:r,local:i[e]},l,a)})}return o}(t,n,s,e):[]}_notifyStateChanges(t){const e=this._oldCache||[],i=this._cache,s=(t,e)=>t.filter((t=>!e.some((e=>t.plugin.id===e.plugin.id))));this._notify(s(e,i),t,"stop"),this._notify(s(i,e),t,"start")}}function nn(t,e){return e||!1!==t?!0===t?{}:t:null}function on(t,{plugin:e,local:i},s,n){const o=t.pluginScopeKeys(e),a=t.getOptionScopes(s,o);return i&&e.defaults&&a.push(e.defaults),t.createResolver(a,n,[""],{scriptable:!1,indexable:!1,allKeys:!0})}function an(t,e){const i=ue.datasets[t]||{};return((e.datasets||{})[t]||{}).indexAxis||e.indexAxis||i.indexAxis||"x"}function rn(t){if("x"===t||"y"===t||"r"===t)return t}function ln(t,...e){if(rn(t))return t;for(const s of e){const e=s.axis||("top"===(i=s.position)||"bottom"===i?"x":"left"===i||"right"===i?"y":void 0)||t.length>1&&rn(t[0].toLowerCase());if(e)return e}var i;throw new Error(`Cannot determine type of '${t}' axis. Please provide 'axis' or 'position' option.`)}function hn(t,e,i){if(i[e+"AxisID"]===t)return{axis:e}}function cn(t,e){const i=re[t.type]||{scales:{}},s=e.scales||{},n=an(t.type,e),a=Object.create(null);return Object.keys(s).forEach((e=>{const r=s[e];if(!o(r))return console.error(`Invalid scale configuration for scale: ${e}`);if(r._proxy)return console.warn(`Ignoring resolver passed as options for scale: ${e}`);const l=ln(e,r,function(t,e){if(e.data&&e.data.datasets){const i=e.data.datasets.filter((e=>e.xAxisID===t||e.yAxisID===t));if(i.length)return hn(t,"x",i[0])||hn(t,"y",i[0])}return{}}(e,t),ue.scales[r.type]),h=function(t,e){return t===e?"_index_":"_value_"}(l,n),c=i.scales||{};a[e]=x(Object.create(null),[{axis:l},r,c[l],c[h]])})),t.data.datasets.forEach((i=>{const n=i.type||t.type,o=i.indexAxis||an(n,e),r=(re[n]||{}).scales||{};Object.keys(r).forEach((t=>{const e=function(t,e){let i=t;return"_index_"===t?i=e:"_value_"===t&&(i="x"===e?"y":"x"),i}(t,o),n=i[e+"AxisID"]||e;a[n]=a[n]||Object.create(null),x(a[n],[{axis:e},s[n],r[t]])}))})),Object.keys(a).forEach((t=>{const e=a[t];x(e,[ue.scales[e.type],ue.scale])})),a}function dn(t){const e=t.options||(t.options={});e.plugins=l(e.plugins,{}),e.scales=cn(t,e)}function un(t){return(t=t||{}).datasets=t.datasets||[],t.labels=t.labels||[],t}const fn=new Map,gn=new Set;function pn(t,e){let i=fn.get(t);return i||(i=e(),fn.set(t,i),gn.add(i)),i}const mn=(t,e,i)=>{const s=M(e,i);void 0!==s&&t.add(s)};class bn{constructor(t){this._config=function(t){return(t=t||{}).data=un(t.data),dn(t),t}(t),this._scopeCache=new Map,this._resolverCache=new Map}get platform(){return this._config.platform}get type(){return this._config.type}set type(t){this._config.type=t}get data(){return this._config.data}set data(t){this._config.data=un(t)}get options(){return this._config.options}set options(t){this._config.options=t}get plugins(){return this._config.plugins}update(){const t=this._config;this.clearCache(),dn(t)}clearCache(){this._scopeCache.clear(),this._resolverCache.clear()}datasetScopeKeys(t){return pn(t,(()=>[[`datasets.${t}`,""]]))}datasetAnimationScopeKeys(t,e){return pn(`${t}.transition.${e}`,(()=>[[`datasets.${t}.transitions.${e}`,`transitions.${e}`],[`datasets.${t}`,""]]))}datasetElementScopeKeys(t,e){return pn(`${t}-${e}`,(()=>[[`datasets.${t}.elements.${e}`,`datasets.${t}`,`elements.${e}`,""]]))}pluginScopeKeys(t){const e=t.id;return pn(`${this.type}-plugin-${e}`,(()=>[[`plugins.${e}`,...t.additionalOptionScopes||[]]]))}_cachedScopes(t,e){const i=this._scopeCache;let s=i.get(t);return s&&!e||(s=new Map,i.set(t,s)),s}getOptionScopes(t,e,i){const{options:s,type:n}=this,o=this._cachedScopes(t,i),a=o.get(e);if(a)return a;const r=new Set;e.forEach((e=>{t&&(r.add(t),e.forEach((e=>mn(r,t,e)))),e.forEach((t=>mn(r,s,t))),e.forEach((t=>mn(r,re[n]||{},t))),e.forEach((t=>mn(r,ue,t))),e.forEach((t=>mn(r,le,t)))}));const l=Array.from(r);return 0===l.length&&l.push(Object.create(null)),gn.has(e)&&o.set(e,l),l}chartOptionScopes(){const{options:t,type:e}=this;return[t,re[e]||{},ue.datasets[e]||{},{type:e},ue,le]}resolveNamedOptions(t,e,i,s=[""]){const o={$shared:!0},{resolver:a,subPrefixes:r}=xn(this._resolverCache,t,s);let l=a;if(function(t,e){const{isScriptable:i,isIndexable:s}=Ye(t);for(const o of e){const e=i(o),a=s(o),r=(a||e)&&t[o];if(e&&(S(r)||_n(r))||a&&n(r))return!0}return!1}(a,e)){o.$shared=!1;l=$e(a,i=S(i)?i():i,this.createResolver(t,i,r))}for(const t of e)o[t]=l[t];return o}createResolver(t,e,i=[""],s){const{resolver:n}=xn(this._resolverCache,t,i);return o(e)?$e(n,e,void 0,s):n}}function xn(t,e,i){let s=t.get(e);s||(s=new Map,t.set(e,s));const n=i.join();let o=s.get(n);if(!o){o={resolver:je(e,i),subPrefixes:i.filter((t=>!t.toLowerCase().includes("hover")))},s.set(n,o)}return o}const _n=t=>o(t)&&Object.getOwnPropertyNames(t).reduce(((e,i)=>e||S(t[i])),!1);const yn=["top","bottom","left","right","chartArea"];function vn(t,e){return"top"===t||"bottom"===t||-1===yn.indexOf(t)&&"x"===e}function Mn(t,e){return function(i,s){return i[t]===s[t]?i[e]-s[e]:i[t]-s[t]}}function wn(t){const e=t.chart,i=e.options.animation;e.notifyPlugins("afterRender"),d(i&&i.onComplete,[t],e)}function kn(t){const e=t.chart,i=e.options.animation;d(i&&i.onProgress,[t],e)}function Sn(t){return fe()&&"string"==typeof t?t=document.getElementById(t):t&&t.length&&(t=t[0]),t&&t.canvas&&(t=t.canvas),t}const Pn={},Dn=t=>{const e=Sn(t);return Object.values(Pn).filter((t=>t.canvas===e)).pop()};function Cn(t,e,i){const s=Object.keys(t);for(const n of s){const s=+n;if(s>=e){const o=t[n];delete t[n],(i>0||s>e)&&(t[s+i]=o)}}}function On(t,e,i){return t.options.clip?t[i]:e[i]}class An{static defaults=ue;static instances=Pn;static overrides=re;static registry=en;static version="4.4.0";static getChart=Dn;static register(...t){en.add(...t),Tn()}static unregister(...t){en.remove(...t),Tn()}constructor(t,e){const s=this.config=new bn(e),n=Sn(t),o=Dn(n);if(o)throw new Error("Canvas is already in use. Chart with ID '"+o.id+"' must be destroyed before the canvas with ID '"+o.canvas.id+"' can be reused.");const a=s.createResolver(s.chartOptionScopes(),this.getContext());this.platform=new(s.platform||ks(n)),this.platform.updateConfig(s);const r=this.platform.acquireContext(n,a.aspectRatio),l=r&&r.canvas,h=l&&l.height,c=l&&l.width;this.id=i(),this.ctx=r,this.canvas=l,this.width=c,this.height=h,this._options=a,this._aspectRatio=this.aspectRatio,this._layers=[],this._metasets=[],this._stacks=void 0,this.boxes=[],this.currentDevicePixelRatio=void 0,this.chartArea=void 0,this._active=[],this._lastEvent=void 0,this._listeners={},this._responsiveListeners=void 0,this._sortedMetasets=[],this.scales={},this._plugins=new sn,this.$proxies={},this._hiddenIndices={},this.attached=!1,this._animationsDisabled=void 0,this.$context=void 0,this._doResize=dt((t=>this.update(t)),a.resizeDelay||0),this._dataChanges=[],Pn[this.id]=this,r&&l?(xt.listen(this,"complete",wn),xt.listen(this,"progress",kn),this._initialize(),this.attached&&this.update()):console.error("Failed to create chart: can't acquire context from the given item")}get aspectRatio(){const{options:{aspectRatio:t,maintainAspectRatio:e},width:i,height:n,_aspectRatio:o}=this;return s(t)?e&&o?o:n?i/n:null:t}get data(){return this.config.data}set data(t){this.config.data=t}get options(){return this._options}set options(t){this.config.options=t}get registry(){return en}_initialize(){return this.notifyPlugins("beforeInit"),this.options.responsive?this.resize():ke(this,this.options.devicePixelRatio),this.bindEvents(),this.notifyPlugins("afterInit"),this}clear(){return Te(this.canvas,this.ctx),this}stop(){return xt.stop(this),this}resize(t,e){xt.running(this)?this._resizeBeforeDraw={width:t,height:e}:this._resize(t,e)}_resize(t,e){const i=this.options,s=this.canvas,n=i.maintainAspectRatio&&this.aspectRatio,o=this.platform.getMaximumSize(s,t,e,n),a=i.devicePixelRatio||this.platform.getDevicePixelRatio(),r=this.width?"resize":"attach";this.width=o.width,this.height=o.height,this._aspectRatio=this.aspectRatio,ke(this,a,!0)&&(this.notifyPlugins("resize",{size:o}),d(i.onResize,[this,o],this),this.attached&&this._doResize(r)&&this.render())}ensureScalesHaveIDs(){u(this.options.scales||{},((t,e)=>{t.id=e}))}buildOrUpdateScales(){const t=this.options,e=t.scales,i=this.scales,s=Object.keys(i).reduce(((t,e)=>(t[e]=!1,t)),{});let n=[];e&&(n=n.concat(Object.keys(e).map((t=>{const i=e[t],s=ln(t,i),n="r"===s,o="x"===s;return{options:i,dposition:n?"chartArea":o?"bottom":"left",dtype:n?"radialLinear":o?"category":"linear"}})))),u(n,(e=>{const n=e.options,o=n.id,a=ln(o,n),r=l(n.type,e.dtype);void 0!==n.position&&vn(n.position,a)===vn(e.dposition)||(n.position=e.dposition),s[o]=!0;let h=null;if(o in i&&i[o].type===r)h=i[o];else{h=new(en.getScale(r))({id:o,type:r,ctx:this.ctx,chart:this}),i[h.id]=h}h.init(n,t)})),u(s,((t,e)=>{t||delete i[e]})),u(i,(t=>{as.configure(this,t,t.options),as.addBox(this,t)}))}_updateMetasets(){const t=this._metasets,e=this.data.datasets.length,i=t.length;if(t.sort(((t,e)=>t.index-e.index)),i>e){for(let t=e;t<i;++t)this._destroyDatasetMeta(t);t.splice(e,i-e)}this._sortedMetasets=t.slice(0).sort(Mn("order","index"))}_removeUnreferencedMetasets(){const{_metasets:t,data:{datasets:e}}=this;t.length>e.length&&delete this._stacks,t.forEach(((t,i)=>{0===e.filter((e=>e===t._dataset)).length&&this._destroyDatasetMeta(i)}))}buildOrUpdateControllers(){const t=[],e=this.data.datasets;let i,s;for(this._removeUnreferencedMetasets(),i=0,s=e.length;i<s;i++){const s=e[i];let n=this.getDatasetMeta(i);const o=s.type||this.config.type;if(n.type&&n.type!==o&&(this._destroyDatasetMeta(i),n=this.getDatasetMeta(i)),n.type=o,n.indexAxis=s.indexAxis||an(o,this.options),n.order=s.order||0,n.index=i,n.label=""+s.label,n.visible=this.isDatasetVisible(i),n.controller)n.controller.updateIndex(i),n.controller.linkScales();else{const e=en.getController(o),{datasetElementType:s,dataElementType:a}=ue.datasets[o];Object.assign(e,{dataElementType:en.getElement(a),datasetElementType:s&&en.getElement(s)}),n.controller=new e(this,i),t.push(n.controller)}}return this._updateMetasets(),t}_resetElements(){u(this.data.datasets,((t,e)=>{this.getDatasetMeta(e).controller.reset()}),this)}reset(){this._resetElements(),this.notifyPlugins("reset")}update(t){const e=this.config;e.update();const i=this._options=e.createResolver(e.chartOptionScopes(),this.getContext()),s=this._animationsDisabled=!i.animation;if(this._updateScales(),this._checkEventBindings(),this._updateHiddenIndices(),this._plugins.invalidate(),!1===this.notifyPlugins("beforeUpdate",{mode:t,cancelable:!0}))return;const n=this.buildOrUpdateControllers();this.notifyPlugins("beforeElementsUpdate");let o=0;for(let t=0,e=this.data.datasets.length;t<e;t++){const{controller:e}=this.getDatasetMeta(t),i=!s&&-1===n.indexOf(e);e.buildOrUpdateElements(i),o=Math.max(+e.getMaxOverflow(),o)}o=this._minPadding=i.layout.autoPadding?o:0,this._updateLayout(o),s||u(n,(t=>{t.reset()})),this._updateDatasets(t),this.notifyPlugins("afterUpdate",{mode:t}),this._layers.sort(Mn("z","_idx"));const{_active:a,_lastEvent:r}=this;r?this._eventHandler(r,!0):a.length&&this._updateHoverStyles(a,a,!0),this.render()}_updateScales(){u(this.scales,(t=>{as.removeBox(this,t)})),this.ensureScalesHaveIDs(),this.buildOrUpdateScales()}_checkEventBindings(){const t=this.options,e=new Set(Object.keys(this._listeners)),i=new Set(t.events);P(e,i)&&!!this._responsiveListeners===t.responsive||(this.unbindEvents(),this.bindEvents())}_updateHiddenIndices(){const{_hiddenIndices:t}=this,e=this._getUniformDataChanges()||[];for(const{method:i,start:s,count:n}of e){Cn(t,s,"_removeElements"===i?-n:n)}}_getUniformDataChanges(){const t=this._dataChanges;if(!t||!t.length)return;this._dataChanges=[];const e=this.data.datasets.length,i=e=>new Set(t.filter((t=>t[0]===e)).map(((t,e)=>e+","+t.splice(1).join(",")))),s=i(0);for(let t=1;t<e;t++)if(!P(s,i(t)))return;return Array.from(s).map((t=>t.split(","))).map((t=>({method:t[1],start:+t[2],count:+t[3]})))}_updateLayout(t){if(!1===this.notifyPlugins("beforeLayout",{cancelable:!0}))return;as.update(this,this.width,this.height,t);const e=this.chartArea,i=e.width<=0||e.height<=0;this._layers=[],u(this.boxes,(t=>{i&&"chartArea"===t.position||(t.configure&&t.configure(),this._layers.push(...t._layers()))}),this),this._layers.forEach(((t,e)=>{t._idx=e})),this.notifyPlugins("afterLayout")}_updateDatasets(t){if(!1!==this.notifyPlugins("beforeDatasetsUpdate",{mode:t,cancelable:!0})){for(let t=0,e=this.data.datasets.length;t<e;++t)this.getDatasetMeta(t).controller.configure();for(let e=0,i=this.data.datasets.length;e<i;++e)this._updateDataset(e,S(t)?t({datasetIndex:e}):t);this.notifyPlugins("afterDatasetsUpdate",{mode:t})}}_updateDataset(t,e){const i=this.getDatasetMeta(t),s={meta:i,index:t,mode:e,cancelable:!0};!1!==this.notifyPlugins("beforeDatasetUpdate",s)&&(i.controller._update(e),s.cancelable=!1,this.notifyPlugins("afterDatasetUpdate",s))}render(){!1!==this.notifyPlugins("beforeRender",{cancelable:!0})&&(xt.has(this)?this.attached&&!xt.running(this)&&xt.start(this):(this.draw(),wn({chart:this})))}draw(){let t;if(this._resizeBeforeDraw){const{width:t,height:e}=this._resizeBeforeDraw;this._resize(t,e),this._resizeBeforeDraw=null}if(this.clear(),this.width<=0||this.height<=0)return;if(!1===this.notifyPlugins("beforeDraw",{cancelable:!0}))return;const e=this._layers;for(t=0;t<e.length&&e[t].z<=0;++t)e[t].draw(this.chartArea);for(this._drawDatasets();t<e.length;++t)e[t].draw(this.chartArea);this.notifyPlugins("afterDraw")}_getSortedDatasetMetas(t){const e=this._sortedMetasets,i=[];let s,n;for(s=0,n=e.length;s<n;++s){const n=e[s];t&&!n.visible||i.push(n)}return i}getSortedVisibleDatasetMetas(){return this._getSortedDatasetMetas(!0)}_drawDatasets(){if(!1===this.notifyPlugins("beforeDatasetsDraw",{cancelable:!0}))return;const t=this.getSortedVisibleDatasetMetas();for(let e=t.length-1;e>=0;--e)this._drawDataset(t[e]);this.notifyPlugins("afterDatasetsDraw")}_drawDataset(t){const e=this.ctx,i=t._clip,s=!i.disabled,n=function(t,e){const{xScale:i,yScale:s}=t;return i&&s?{left:On(i,e,"left"),right:On(i,e,"right"),top:On(s,e,"top"),bottom:On(s,e,"bottom")}:e}(t,this.chartArea),o={meta:t,index:t.index,cancelable:!0};!1!==this.notifyPlugins("beforeDatasetDraw",o)&&(s&&Ie(e,{left:!1===i.left?0:n.left-i.left,right:!1===i.right?this.width:n.right+i.right,top:!1===i.top?0:n.top-i.top,bottom:!1===i.bottom?this.height:n.bottom+i.bottom}),t.controller.draw(),s&&ze(e),o.cancelable=!1,this.notifyPlugins("afterDatasetDraw",o))}isPointInArea(t){return Re(t,this.chartArea,this._minPadding)}getElementsAtEventForMode(t,e,i,s){const n=Xi.modes[e];return"function"==typeof n?n(this,t,i,s):[]}getDatasetMeta(t){const e=this.data.datasets[t],i=this._metasets;let s=i.filter((t=>t&&t._dataset===e)).pop();return s||(s={type:null,data:[],dataset:null,controller:null,hidden:null,xAxisID:null,yAxisID:null,order:e&&e.order||0,index:t,_dataset:e,_parsed:[],_sorted:!1},i.push(s)),s}getContext(){return this.$context||(this.$context=Ci(null,{chart:this,type:"chart"}))}getVisibleDatasetCount(){return this.getSortedVisibleDatasetMetas().length}isDatasetVisible(t){const e=this.data.datasets[t];if(!e)return!1;const i=this.getDatasetMeta(t);return"boolean"==typeof i.hidden?!i.hidden:!e.hidden}setDatasetVisibility(t,e){this.getDatasetMeta(t).hidden=!e}toggleDataVisibility(t){this._hiddenIndices[t]=!this._hiddenIndices[t]}getDataVisibility(t){return!this._hiddenIndices[t]}_updateVisibility(t,e,i){const s=i?"show":"hide",n=this.getDatasetMeta(t),o=n.controller._resolveAnimations(void 0,s);k(e)?(n.data[e].hidden=!i,this.update()):(this.setDatasetVisibility(t,i),o.update(n,{visible:i}),this.update((e=>e.datasetIndex===t?s:void 0)))}hide(t,e){this._updateVisibility(t,e,!1)}show(t,e){this._updateVisibility(t,e,!0)}_destroyDatasetMeta(t){const e=this._metasets[t];e&&e.controller&&e.controller._destroy(),delete this._metasets[t]}_stop(){let t,e;for(this.stop(),xt.remove(this),t=0,e=this.data.datasets.length;t<e;++t)this._destroyDatasetMeta(t)}destroy(){this.notifyPlugins("beforeDestroy");const{canvas:t,ctx:e}=this;this._stop(),this.config.clearCache(),t&&(this.unbindEvents(),Te(t,e),this.platform.releaseContext(e),this.canvas=null,this.ctx=null),delete Pn[this.id],this.notifyPlugins("afterDestroy")}toBase64Image(...t){return this.canvas.toDataURL(...t)}bindEvents(){this.bindUserEvents(),this.options.responsive?this.bindResponsiveEvents():this.attached=!0}bindUserEvents(){const t=this._listeners,e=this.platform,i=(i,s)=>{e.addEventListener(this,i,s),t[i]=s},s=(t,e,i)=>{t.offsetX=e,t.offsetY=i,this._eventHandler(t)};u(this.options.events,(t=>i(t,s)))}bindResponsiveEvents(){this._responsiveListeners||(this._responsiveListeners={});const t=this._responsiveListeners,e=this.platform,i=(i,s)=>{e.addEventListener(this,i,s),t[i]=s},s=(i,s)=>{t[i]&&(e.removeEventListener(this,i,s),delete t[i])},n=(t,e)=>{this.canvas&&this.resize(t,e)};let o;const a=()=>{s("attach",a),this.attached=!0,this.resize(),i("resize",n),i("detach",o)};o=()=>{this.attached=!1,s("resize",n),this._stop(),this._resize(0,0),i("attach",a)},e.isAttached(this.canvas)?a():o()}unbindEvents(){u(this._listeners,((t,e)=>{this.platform.removeEventListener(this,e,t)})),this._listeners={},u(this._responsiveListeners,((t,e)=>{this.platform.removeEventListener(this,e,t)})),this._responsiveListeners=void 0}updateHoverStyle(t,e,i){const s=i?"set":"remove";let n,o,a,r;for("dataset"===e&&(n=this.getDatasetMeta(t[0].datasetIndex),n.controller["_"+s+"DatasetHoverStyle"]()),a=0,r=t.length;a<r;++a){o=t[a];const e=o&&this.getDatasetMeta(o.datasetIndex).controller;e&&e[s+"HoverStyle"](o.element,o.datasetIndex,o.index)}}getActiveElements(){return this._active||[]}setActiveElements(t){const e=this._active||[],i=t.map((({datasetIndex:t,index:e})=>{const i=this.getDatasetMeta(t);if(!i)throw new Error("No dataset found at index "+t);return{datasetIndex:t,element:i.data[e],index:e}}));!f(i,e)&&(this._active=i,this._lastEvent=null,this._updateHoverStyles(i,e))}notifyPlugins(t,e,i){return this._plugins.notify(this,t,e,i)}isPluginEnabled(t){return 1===this._plugins._cache.filter((e=>e.plugin.id===t)).length}_updateHoverStyles(t,e,i){const s=this.options.hover,n=(t,e)=>t.filter((t=>!e.some((e=>t.datasetIndex===e.datasetIndex&&t.index===e.index)))),o=n(e,t),a=i?t:n(t,e);o.length&&this.updateHoverStyle(o,s.mode,!1),a.length&&s.mode&&this.updateHoverStyle(a,s.mode,!0)}_eventHandler(t,e){const i={event:t,replay:e,cancelable:!0,inChartArea:this.isPointInArea(t)},s=e=>(e.options.events||this.options.events).includes(t.native.type);if(!1===this.notifyPlugins("beforeEvent",i,s))return;const n=this._handleEvent(t,e,i.inChartArea);return i.cancelable=!1,this.notifyPlugins("afterEvent",i,s),(n||i.changed)&&this.render(),this}_handleEvent(t,e,i){const{_active:s=[],options:n}=this,o=e,a=this._getActiveElements(t,s,i,o),r=D(t),l=function(t,e,i,s){return i&&"mouseout"!==t.type?s?e:t:null}(t,this._lastEvent,i,r);i&&(this._lastEvent=null,d(n.onHover,[t,a,this],this),r&&d(n.onClick,[t,a,this],this));const h=!f(a,s);return(h||e)&&(this._active=a,this._updateHoverStyles(a,s,e)),this._lastEvent=l,h}_getActiveElements(t,e,i,s){if("mouseout"===t.type)return[];if(!i)return e;const n=this.options.hover;return this.getElementsAtEventForMode(t,n.mode,n,s)}}function Tn(){return u(An.instances,(t=>t._plugins.invalidate()))}function Ln(){throw new Error("This method is not implemented: Check that a complete date adapter is provided.")}class En{static override(t){Object.assign(En.prototype,t)}options;constructor(t){this.options=t||{}}init(){}formats(){return Ln()}parse(){return Ln()}format(){return Ln()}add(){return Ln()}diff(){return Ln()}startOf(){return Ln()}endOf(){return Ln()}}var Rn={_date:En};function In(t){const e=t.iScale,i=function(t,e){if(!t._cache.$bar){const i=t.getMatchingVisibleMetas(e);let s=[];for(let e=0,n=i.length;e<n;e++)s=s.concat(i[e].controller.getAllParsedValues(t));t._cache.$bar=lt(s.sort(((t,e)=>t-e)))}return t._cache.$bar}(e,t.type);let s,n,o,a,r=e._length;const l=()=>{32767!==o&&-32768!==o&&(k(a)&&(r=Math.min(r,Math.abs(o-a)||r)),a=o)};for(s=0,n=i.length;s<n;++s)o=e.getPixelForValue(i[s]),l();for(a=void 0,s=0,n=e.ticks.length;s<n;++s)o=e.getPixelForTick(s),l();return r}function zn(t,e,i,s){return n(t)?function(t,e,i,s){const n=i.parse(t[0],s),o=i.parse(t[1],s),a=Math.min(n,o),r=Math.max(n,o);let l=a,h=r;Math.abs(a)>Math.abs(r)&&(l=r,h=a),e[i.axis]=h,e._custom={barStart:l,barEnd:h,start:n,end:o,min:a,max:r}}(t,e,i,s):e[i.axis]=i.parse(t,s),e}function Fn(t,e,i,s){const n=t.iScale,o=t.vScale,a=n.getLabels(),r=n===o,l=[];let h,c,d,u;for(h=i,c=i+s;h<c;++h)u=e[h],d={},d[n.axis]=r||n.parse(a[h],h),l.push(zn(u,d,o,h));return l}function Vn(t){return t&&void 0!==t.barStart&&void 0!==t.barEnd}function Bn(t,e,i,s){let n=e.borderSkipped;const o={};if(!n)return void(t.borderSkipped=o);if(!0===n)return void(t.borderSkipped={top:!0,right:!0,bottom:!0,left:!0});const{start:a,end:r,reverse:l,top:h,bottom:c}=function(t){let e,i,s,n,o;return t.horizontal?(e=t.base>t.x,i="left",s="right"):(e=t.base<t.y,i="bottom",s="top"),e?(n="end",o="start"):(n="start",o="end"),{start:i,end:s,reverse:e,top:n,bottom:o}}(t);"middle"===n&&i&&(t.enableBorderRadius=!0,(i._top||0)===s?n=h:(i._bottom||0)===s?n=c:(o[Wn(c,a,r,l)]=!0,n=h)),o[Wn(n,a,r,l)]=!0,t.borderSkipped=o}function Wn(t,e,i,s){var n,o,a;return s?(a=i,t=Nn(t=(n=t)===(o=e)?a:n===a?o:n,i,e)):t=Nn(t,e,i),t}function Nn(t,e,i){return"start"===t?e:"end"===t?i:t}function Hn(t,{inflateAmount:e},i){t.inflateAmount="auto"===e?1===i?.33:0:e}class jn extends Ns{static id="doughnut";static defaults={datasetElementType:!1,dataElementType:"arc",animation:{animateRotate:!0,animateScale:!1},animations:{numbers:{type:"number",properties:["circumference","endAngle","innerRadius","outerRadius","startAngle","x","y","offset","borderWidth","spacing"]}},cutout:"50%",rotation:0,circumference:360,radius:"100%",spacing:0,indexAxis:"r"};static descriptors={_scriptable:t=>"spacing"!==t,_indexable:t=>"spacing"!==t&&!t.startsWith("borderDash")&&!t.startsWith("hoverBorderDash")};static overrides={aspectRatio:1,plugins:{legend:{labels:{generateLabels(t){const e=t.data;if(e.labels.length&&e.datasets.length){const{labels:{pointStyle:i,color:s}}=t.legend.options;return e.labels.map(((e,n)=>{const o=t.getDatasetMeta(0).controller.getStyle(n);return{text:e,fillStyle:o.backgroundColor,strokeStyle:o.borderColor,fontColor:s,lineWidth:o.borderWidth,pointStyle:i,hidden:!t.getDataVisibility(n),index:n}}))}return[]}},onClick(t,e,i){i.chart.toggleDataVisibility(e.index),i.chart.update()}}}};constructor(t,e){super(t,e),this.enableOptionSharing=!0,this.innerRadius=void 0,this.outerRadius=void 0,this.offsetX=void 0,this.offsetY=void 0}linkScales(){}parse(t,e){const i=this.getDataset().data,s=this._cachedMeta;if(!1===this._parsing)s._parsed=i;else{let n,a,r=t=>+i[t];if(o(i[t])){const{key:t="value"}=this._parsing;r=e=>+M(i[e],t)}for(n=t,a=t+e;n<a;++n)s._parsed[n]=r(n)}}_getRotation(){return $(this.options.rotation-90)}_getCircumference(){return $(this.options.circumference)}_getRotationExtents(){let t=O,e=-O;for(let i=0;i<this.chart.data.datasets.length;++i)if(this.chart.isDatasetVisible(i)&&this.chart.getDatasetMeta(i).type===this._type){const s=this.chart.getDatasetMeta(i).controller,n=s._getRotation(),o=s._getCircumference();t=Math.min(t,n),e=Math.max(e,n+o)}return{rotation:t,circumference:e-t}}update(t){const e=this.chart,{chartArea:i}=e,s=this._cachedMeta,n=s.data,o=this.getMaxBorderWidth()+this.getMaxOffset(n)+this.options.spacing,a=Math.max((Math.min(i.width,i.height)-o)/2,0),r=Math.min(h(this.options.cutout,a),1),l=this._getRingWeight(this.index),{circumference:d,rotation:u}=this._getRotationExtents(),{ratioX:f,ratioY:g,offsetX:p,offsetY:m}=function(t,e,i){let s=1,n=1,o=0,a=0;if(e<O){const r=t,l=r+e,h=Math.cos(r),c=Math.sin(r),d=Math.cos(l),u=Math.sin(l),f=(t,e,s)=>Z(t,r,l,!0)?1:Math.max(e,e*i,s,s*i),g=(t,e,s)=>Z(t,r,l,!0)?-1:Math.min(e,e*i,s,s*i),p=f(0,h,d),m=f(E,c,u),b=g(C,h,d),x=g(C+E,c,u);s=(p-b)/2,n=(m-x)/2,o=-(p+b)/2,a=-(m+x)/2}return{ratioX:s,ratioY:n,offsetX:o,offsetY:a}}(u,d,r),b=(i.width-o)/f,x=(i.height-o)/g,_=Math.max(Math.min(b,x)/2,0),y=c(this.options.radius,_),v=(y-Math.max(y*r,0))/this._getVisibleDatasetWeightTotal();this.offsetX=p*y,this.offsetY=m*y,s.total=this.calculateTotal(),this.outerRadius=y-v*this._getRingWeightOffset(this.index),this.innerRadius=Math.max(this.outerRadius-v*l,0),this.updateElements(n,0,n.length,t)}_circumference(t,e){const i=this.options,s=this._cachedMeta,n=this._getCircumference();return e&&i.animation.animateRotate||!this.chart.getDataVisibility(t)||null===s._parsed[t]||s.data[t].hidden?0:this.calculateCircumference(s._parsed[t]*n/O)}updateElements(t,e,i,s){const n="reset"===s,o=this.chart,a=o.chartArea,r=o.options.animation,l=(a.left+a.right)/2,h=(a.top+a.bottom)/2,c=n&&r.animateScale,d=c?0:this.innerRadius,u=c?0:this.outerRadius,{sharedOptions:f,includeOptions:g}=this._getSharedOptions(e,s);let p,m=this._getRotation();for(p=0;p<e;++p)m+=this._circumference(p,n);for(p=e;p<e+i;++p){const e=this._circumference(p,n),i=t[p],o={x:l+this.offsetX,y:h+this.offsetY,startAngle:m,endAngle:m+e,circumference:e,outerRadius:u,innerRadius:d};g&&(o.options=f||this.resolveDataElementOptions(p,i.active?"active":s)),m+=e,this.updateElement(i,p,o,s)}}calculateTotal(){const t=this._cachedMeta,e=t.data;let i,s=0;for(i=0;i<e.length;i++){const n=t._parsed[i];null===n||isNaN(n)||!this.chart.getDataVisibility(i)||e[i].hidden||(s+=Math.abs(n))}return s}calculateCircumference(t){const e=this._cachedMeta.total;return e>0&&!isNaN(t)?O*(Math.abs(t)/e):0}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart,s=i.data.labels||[],n=ne(e._parsed[t],i.options.locale);return{label:s[t]||"",value:n}}getMaxBorderWidth(t){let e=0;const i=this.chart;let s,n,o,a,r;if(!t)for(s=0,n=i.data.datasets.length;s<n;++s)if(i.isDatasetVisible(s)){o=i.getDatasetMeta(s),t=o.data,a=o.controller;break}if(!t)return 0;for(s=0,n=t.length;s<n;++s)r=a.resolveDataElementOptions(s),"inner"!==r.borderAlign&&(e=Math.max(e,r.borderWidth||0,r.hoverBorderWidth||0));return e}getMaxOffset(t){let e=0;for(let i=0,s=t.length;i<s;++i){const t=this.resolveDataElementOptions(i);e=Math.max(e,t.offset||0,t.hoverOffset||0)}return e}_getRingWeightOffset(t){let e=0;for(let i=0;i<t;++i)this.chart.isDatasetVisible(i)&&(e+=this._getRingWeight(i));return e}_getRingWeight(t){return Math.max(l(this.chart.data.datasets[t].weight,1),0)}_getVisibleDatasetWeightTotal(){return this._getRingWeightOffset(this.chart.data.datasets.length)||1}}class $n extends Ns{static id="polarArea";static defaults={dataElementType:"arc",animation:{animateRotate:!0,animateScale:!0},animations:{numbers:{type:"number",properties:["x","y","startAngle","endAngle","innerRadius","outerRadius"]}},indexAxis:"r",startAngle:0};static overrides={aspectRatio:1,plugins:{legend:{labels:{generateLabels(t){const e=t.data;if(e.labels.length&&e.datasets.length){const{labels:{pointStyle:i,color:s}}=t.legend.options;return e.labels.map(((e,n)=>{const o=t.getDatasetMeta(0).controller.getStyle(n);return{text:e,fillStyle:o.backgroundColor,strokeStyle:o.borderColor,fontColor:s,lineWidth:o.borderWidth,pointStyle:i,hidden:!t.getDataVisibility(n),index:n}}))}return[]}},onClick(t,e,i){i.chart.toggleDataVisibility(e.index),i.chart.update()}}},scales:{r:{type:"radialLinear",angleLines:{display:!1},beginAtZero:!0,grid:{circular:!0},pointLabels:{display:!1},startAngle:0}}};constructor(t,e){super(t,e),this.innerRadius=void 0,this.outerRadius=void 0}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart,s=i.data.labels||[],n=ne(e._parsed[t].r,i.options.locale);return{label:s[t]||"",value:n}}parseObjectData(t,e,i,s){return ii.bind(this)(t,e,i,s)}update(t){const e=this._cachedMeta.data;this._updateRadius(),this.updateElements(e,0,e.length,t)}getMinMax(){const t=this._cachedMeta,e={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY};return t.data.forEach(((t,i)=>{const s=this.getParsed(i).r;!isNaN(s)&&this.chart.getDataVisibility(i)&&(s<e.min&&(e.min=s),s>e.max&&(e.max=s))})),e}_updateRadius(){const t=this.chart,e=t.chartArea,i=t.options,s=Math.min(e.right-e.left,e.bottom-e.top),n=Math.max(s/2,0),o=(n-Math.max(i.cutoutPercentage?n/100*i.cutoutPercentage:1,0))/t.getVisibleDatasetCount();this.outerRadius=n-o*this.index,this.innerRadius=this.outerRadius-o}updateElements(t,e,i,s){const n="reset"===s,o=this.chart,a=o.options.animation,r=this._cachedMeta.rScale,l=r.xCenter,h=r.yCenter,c=r.getIndexAngle(0)-.5*C;let d,u=c;const f=360/this.countVisibleElements();for(d=0;d<e;++d)u+=this._computeAngle(d,s,f);for(d=e;d<e+i;d++){const e=t[d];let i=u,g=u+this._computeAngle(d,s,f),p=o.getDataVisibility(d)?r.getDistanceFromCenterForValue(this.getParsed(d).r):0;u=g,n&&(a.animateScale&&(p=0),a.animateRotate&&(i=g=c));const m={x:l,y:h,innerRadius:0,outerRadius:p,startAngle:i,endAngle:g,options:this.resolveDataElementOptions(d,e.active?"active":s)};this.updateElement(e,d,m,s)}}countVisibleElements(){const t=this._cachedMeta;let e=0;return t.data.forEach(((t,i)=>{!isNaN(this.getParsed(i).r)&&this.chart.getDataVisibility(i)&&e++})),e}_computeAngle(t,e,i){return this.chart.getDataVisibility(t)?$(this.resolveDataElementOptions(t,e).angle||i):0}}var Yn=Object.freeze({__proto__:null,BarController:class extends Ns{static id="bar";static defaults={datasetElementType:!1,dataElementType:"bar",categoryPercentage:.8,barPercentage:.9,grouped:!0,animations:{numbers:{type:"number",properties:["x","y","base","width","height"]}}};static overrides={scales:{_index_:{type:"category",offset:!0,grid:{offset:!0}},_value_:{type:"linear",beginAtZero:!0}}};parsePrimitiveData(t,e,i,s){return Fn(t,e,i,s)}parseArrayData(t,e,i,s){return Fn(t,e,i,s)}parseObjectData(t,e,i,s){const{iScale:n,vScale:o}=t,{xAxisKey:a="x",yAxisKey:r="y"}=this._parsing,l="x"===n.axis?a:r,h="x"===o.axis?a:r,c=[];let d,u,f,g;for(d=i,u=i+s;d<u;++d)g=e[d],f={},f[n.axis]=n.parse(M(g,l),d),c.push(zn(M(g,h),f,o,d));return c}updateRangeFromParsed(t,e,i,s){super.updateRangeFromParsed(t,e,i,s);const n=i._custom;n&&e===this._cachedMeta.vScale&&(t.min=Math.min(t.min,n.min),t.max=Math.max(t.max,n.max))}getMaxOverflow(){return 0}getLabelAndValue(t){const e=this._cachedMeta,{iScale:i,vScale:s}=e,n=this.getParsed(t),o=n._custom,a=Vn(o)?"["+o.start+", "+o.end+"]":""+s.getLabelForValue(n[s.axis]);return{label:""+i.getLabelForValue(n[i.axis]),value:a}}initialize(){this.enableOptionSharing=!0,super.initialize();this._cachedMeta.stack=this.getDataset().stack}update(t){const e=this._cachedMeta;this.updateElements(e.data,0,e.data.length,t)}updateElements(t,e,i,n){const o="reset"===n,{index:a,_cachedMeta:{vScale:r}}=this,l=r.getBasePixel(),h=r.isHorizontal(),c=this._getRuler(),{sharedOptions:d,includeOptions:u}=this._getSharedOptions(e,n);for(let f=e;f<e+i;f++){const e=this.getParsed(f),i=o||s(e[r.axis])?{base:l,head:l}:this._calculateBarValuePixels(f),g=this._calculateBarIndexPixels(f,c),p=(e._stacks||{})[r.axis],m={horizontal:h,base:i.base,enableBorderRadius:!p||Vn(e._custom)||a===p._top||a===p._bottom,x:h?i.head:g.center,y:h?g.center:i.head,height:h?g.size:Math.abs(i.size),width:h?Math.abs(i.size):g.size};u&&(m.options=d||this.resolveDataElementOptions(f,t[f].active?"active":n));const b=m.options||t[f].options;Bn(m,b,p,a),Hn(m,b,c.ratio),this.updateElement(t[f],f,m,n)}}_getStacks(t,e){const{iScale:i}=this._cachedMeta,n=i.getMatchingVisibleMetas(this._type).filter((t=>t.controller.options.grouped)),o=i.options.stacked,a=[],r=t=>{const i=t.controller.getParsed(e),n=i&&i[t.vScale.axis];if(s(n)||isNaN(n))return!0};for(const i of n)if((void 0===e||!r(i))&&((!1===o||-1===a.indexOf(i.stack)||void 0===o&&void 0===i.stack)&&a.push(i.stack),i.index===t))break;return a.length||a.push(void 0),a}_getStackCount(t){return this._getStacks(void 0,t).length}_getStackIndex(t,e,i){const s=this._getStacks(t,i),n=void 0!==e?s.indexOf(e):-1;return-1===n?s.length-1:n}_getRuler(){const t=this.options,e=this._cachedMeta,i=e.iScale,s=[];let n,o;for(n=0,o=e.data.length;n<o;++n)s.push(i.getPixelForValue(this.getParsed(n)[i.axis],n));const a=t.barThickness;return{min:a||In(e),pixels:s,start:i._startPixel,end:i._endPixel,stackCount:this._getStackCount(),scale:i,grouped:t.grouped,ratio:a?1:t.categoryPercentage*t.barPercentage}}_calculateBarValuePixels(t){const{_cachedMeta:{vScale:e,_stacked:i,index:n},options:{base:o,minBarLength:a}}=this,r=o||0,l=this.getParsed(t),h=l._custom,c=Vn(h);let d,u,f=l[e.axis],g=0,p=i?this.applyStack(e,l,i):f;p!==f&&(g=p-f,p=f),c&&(f=h.barStart,p=h.barEnd-h.barStart,0!==f&&F(f)!==F(h.barEnd)&&(g=0),g+=f);const m=s(o)||c?g:o;let b=e.getPixelForValue(m);if(d=this.chart.getDataVisibility(t)?e.getPixelForValue(g+p):b,u=d-b,Math.abs(u)<a){u=function(t,e,i){return 0!==t?F(t):(e.isHorizontal()?1:-1)*(e.min>=i?1:-1)}(u,e,r)*a,f===r&&(b-=u/2);const t=e.getPixelForDecimal(0),s=e.getPixelForDecimal(1),o=Math.min(t,s),h=Math.max(t,s);b=Math.max(Math.min(b,h),o),d=b+u,i&&!c&&(l._stacks[e.axis]._visualValues[n]=e.getValueForPixel(d)-e.getValueForPixel(b))}if(b===e.getPixelForValue(r)){const t=F(u)*e.getLineWidthForValue(r)/2;b+=t,u-=t}return{size:u,base:b,head:d,center:d+u/2}}_calculateBarIndexPixels(t,e){const i=e.scale,n=this.options,o=n.skipNull,a=l(n.maxBarThickness,1/0);let r,h;if(e.grouped){const i=o?this._getStackCount(t):e.stackCount,l="flex"===n.barThickness?function(t,e,i,s){const n=e.pixels,o=n[t];let a=t>0?n[t-1]:null,r=t<n.length-1?n[t+1]:null;const l=i.categoryPercentage;null===a&&(a=o-(null===r?e.end-e.start:r-o)),null===r&&(r=o+o-a);const h=o-(o-Math.min(a,r))/2*l;return{chunk:Math.abs(r-a)/2*l/s,ratio:i.barPercentage,start:h}}(t,e,n,i):function(t,e,i,n){const o=i.barThickness;let a,r;return s(o)?(a=e.min*i.categoryPercentage,r=i.barPercentage):(a=o*n,r=1),{chunk:a/n,ratio:r,start:e.pixels[t]-a/2}}(t,e,n,i),c=this._getStackIndex(this.index,this._cachedMeta.stack,o?t:void 0);r=l.start+l.chunk*c+l.chunk/2,h=Math.min(a,l.chunk*l.ratio)}else r=i.getPixelForValue(this.getParsed(t)[i.axis],t),h=Math.min(a,e.min*e.ratio);return{base:r-h/2,head:r+h/2,center:r,size:h}}draw(){const t=this._cachedMeta,e=t.vScale,i=t.data,s=i.length;let n=0;for(;n<s;++n)null!==this.getParsed(n)[e.axis]&&i[n].draw(this._ctx)}},BubbleController:class extends Ns{static id="bubble";static defaults={datasetElementType:!1,dataElementType:"point",animations:{numbers:{type:"number",properties:["x","y","borderWidth","radius"]}}};static overrides={scales:{x:{type:"linear"},y:{type:"linear"}}};initialize(){this.enableOptionSharing=!0,super.initialize()}parsePrimitiveData(t,e,i,s){const n=super.parsePrimitiveData(t,e,i,s);for(let t=0;t<n.length;t++)n[t]._custom=this.resolveDataElementOptions(t+i).radius;return n}parseArrayData(t,e,i,s){const n=super.parseArrayData(t,e,i,s);for(let t=0;t<n.length;t++){const s=e[i+t];n[t]._custom=l(s[2],this.resolveDataElementOptions(t+i).radius)}return n}parseObjectData(t,e,i,s){const n=super.parseObjectData(t,e,i,s);for(let t=0;t<n.length;t++){const s=e[i+t];n[t]._custom=l(s&&s.r&&+s.r,this.resolveDataElementOptions(t+i).radius)}return n}getMaxOverflow(){const t=this._cachedMeta.data;let e=0;for(let i=t.length-1;i>=0;--i)e=Math.max(e,t[i].size(this.resolveDataElementOptions(i))/2);return e>0&&e}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart.data.labels||[],{xScale:s,yScale:n}=e,o=this.getParsed(t),a=s.getLabelForValue(o.x),r=n.getLabelForValue(o.y),l=o._custom;return{label:i[t]||"",value:"("+a+", "+r+(l?", "+l:"")+")"}}update(t){const e=this._cachedMeta.data;this.updateElements(e,0,e.length,t)}updateElements(t,e,i,s){const n="reset"===s,{iScale:o,vScale:a}=this._cachedMeta,{sharedOptions:r,includeOptions:l}=this._getSharedOptions(e,s),h=o.axis,c=a.axis;for(let d=e;d<e+i;d++){const e=t[d],i=!n&&this.getParsed(d),u={},f=u[h]=n?o.getPixelForDecimal(.5):o.getPixelForValue(i[h]),g=u[c]=n?a.getBasePixel():a.getPixelForValue(i[c]);u.skip=isNaN(f)||isNaN(g),l&&(u.options=r||this.resolveDataElementOptions(d,e.active?"active":s),n&&(u.options.radius=0)),this.updateElement(e,d,u,s)}}resolveDataElementOptions(t,e){const i=this.getParsed(t);let s=super.resolveDataElementOptions(t,e);s.$shared&&(s=Object.assign({},s,{$shared:!1}));const n=s.radius;return"active"!==e&&(s.radius=0),s.radius+=l(i&&i._custom,n),s}},DoughnutController:jn,LineController:class extends Ns{static id="line";static defaults={datasetElementType:"line",dataElementType:"point",showLine:!0,spanGaps:!1};static overrides={scales:{_index_:{type:"category"},_value_:{type:"linear"}}};initialize(){this.enableOptionSharing=!0,this.supportsDecimation=!0,super.initialize()}update(t){const e=this._cachedMeta,{dataset:i,data:s=[],_dataset:n}=e,o=this.chart._animationsDisabled;let{start:a,count:r}=pt(e,s,o);this._drawStart=a,this._drawCount=r,mt(e)&&(a=0,r=s.length),i._chart=this.chart,i._datasetIndex=this.index,i._decimated=!!n._decimated,i.points=s;const l=this.resolveDatasetElementOptions(t);this.options.showLine||(l.borderWidth=0),l.segment=this.options.segment,this.updateElement(i,void 0,{animated:!o,options:l},t),this.updateElements(s,a,r,t)}updateElements(t,e,i,n){const o="reset"===n,{iScale:a,vScale:r,_stacked:l,_dataset:h}=this._cachedMeta,{sharedOptions:c,includeOptions:d}=this._getSharedOptions(e,n),u=a.axis,f=r.axis,{spanGaps:g,segment:p}=this.options,m=N(g)?g:Number.POSITIVE_INFINITY,b=this.chart._animationsDisabled||o||"none"===n,x=e+i,_=t.length;let y=e>0&&this.getParsed(e-1);for(let i=0;i<_;++i){const g=t[i],_=b?g:{};if(i<e||i>=x){_.skip=!0;continue}const v=this.getParsed(i),M=s(v[f]),w=_[u]=a.getPixelForValue(v[u],i),k=_[f]=o||M?r.getBasePixel():r.getPixelForValue(l?this.applyStack(r,v,l):v[f],i);_.skip=isNaN(w)||isNaN(k)||M,_.stop=i>0&&Math.abs(v[u]-y[u])>m,p&&(_.parsed=v,_.raw=h.data[i]),d&&(_.options=c||this.resolveDataElementOptions(i,g.active?"active":n)),b||this.updateElement(g,i,_,n),y=v}}getMaxOverflow(){const t=this._cachedMeta,e=t.dataset,i=e.options&&e.options.borderWidth||0,s=t.data||[];if(!s.length)return i;const n=s[0].size(this.resolveDataElementOptions(0)),o=s[s.length-1].size(this.resolveDataElementOptions(s.length-1));return Math.max(i,n,o)/2}draw(){const t=this._cachedMeta;t.dataset.updateControlPoints(this.chart.chartArea,t.iScale.axis),super.draw()}},PieController:class extends jn{static id="pie";static defaults={cutout:0,rotation:0,circumference:360,radius:"100%"}},PolarAreaController:$n,RadarController:class extends Ns{static id="radar";static defaults={datasetElementType:"line",dataElementType:"point",indexAxis:"r",showLine:!0,elements:{line:{fill:"start"}}};static overrides={aspectRatio:1,scales:{r:{type:"radialLinear"}}};getLabelAndValue(t){const e=this._cachedMeta.vScale,i=this.getParsed(t);return{label:e.getLabels()[t],value:""+e.getLabelForValue(i[e.axis])}}parseObjectData(t,e,i,s){return ii.bind(this)(t,e,i,s)}update(t){const e=this._cachedMeta,i=e.dataset,s=e.data||[],n=e.iScale.getLabels();if(i.points=s,"resize"!==t){const e=this.resolveDatasetElementOptions(t);this.options.showLine||(e.borderWidth=0);const o={_loop:!0,_fullLoop:n.length===s.length,options:e};this.updateElement(i,void 0,o,t)}this.updateElements(s,0,s.length,t)}updateElements(t,e,i,s){const n=this._cachedMeta.rScale,o="reset"===s;for(let a=e;a<e+i;a++){const e=t[a],i=this.resolveDataElementOptions(a,e.active?"active":s),r=n.getPointPositionForValue(a,this.getParsed(a).r),l=o?n.xCenter:r.x,h=o?n.yCenter:r.y,c={x:l,y:h,angle:r.angle,skip:isNaN(l)||isNaN(h),options:i};this.updateElement(e,a,c,s)}}},ScatterController:class extends Ns{static id="scatter";static defaults={datasetElementType:!1,dataElementType:"point",showLine:!1,fill:!1};static overrides={interaction:{mode:"point"},scales:{x:{type:"linear"},y:{type:"linear"}}};getLabelAndValue(t){const e=this._cachedMeta,i=this.chart.data.labels||[],{xScale:s,yScale:n}=e,o=this.getParsed(t),a=s.getLabelForValue(o.x),r=n.getLabelForValue(o.y);return{label:i[t]||"",value:"("+a+", "+r+")"}}update(t){const e=this._cachedMeta,{data:i=[]}=e,s=this.chart._animationsDisabled;let{start:n,count:o}=pt(e,i,s);if(this._drawStart=n,this._drawCount=o,mt(e)&&(n=0,o=i.length),this.options.showLine){this.datasetElementType||this.addElements();const{dataset:n,_dataset:o}=e;n._chart=this.chart,n._datasetIndex=this.index,n._decimated=!!o._decimated,n.points=i;const a=this.resolveDatasetElementOptions(t);a.segment=this.options.segment,this.updateElement(n,void 0,{animated:!s,options:a},t)}else this.datasetElementType&&(delete e.dataset,this.datasetElementType=!1);this.updateElements(i,n,o,t)}addElements(){const{showLine:t}=this.options;!this.datasetElementType&&t&&(this.datasetElementType=this.chart.registry.getElement("line")),super.addElements()}updateElements(t,e,i,n){const o="reset"===n,{iScale:a,vScale:r,_stacked:l,_dataset:h}=this._cachedMeta,c=this.resolveDataElementOptions(e,n),d=this.getSharedOptions(c),u=this.includeOptions(n,d),f=a.axis,g=r.axis,{spanGaps:p,segment:m}=this.options,b=N(p)?p:Number.POSITIVE_INFINITY,x=this.chart._animationsDisabled||o||"none"===n;let _=e>0&&this.getParsed(e-1);for(let c=e;c<e+i;++c){const e=t[c],i=this.getParsed(c),p=x?e:{},y=s(i[g]),v=p[f]=a.getPixelForValue(i[f],c),M=p[g]=o||y?r.getBasePixel():r.getPixelForValue(l?this.applyStack(r,i,l):i[g],c);p.skip=isNaN(v)||isNaN(M)||y,p.stop=c>0&&Math.abs(i[f]-_[f])>b,m&&(p.parsed=i,p.raw=h.data[c]),u&&(p.options=d||this.resolveDataElementOptions(c,e.active?"active":n)),x||this.updateElement(e,c,p,n),_=i}this.updateSharedOptions(d,n,c)}getMaxOverflow(){const t=this._cachedMeta,e=t.data||[];if(!this.options.showLine){let t=0;for(let i=e.length-1;i>=0;--i)t=Math.max(t,e[i].size(this.resolveDataElementOptions(i))/2);return t>0&&t}const i=t.dataset,s=i.options&&i.options.borderWidth||0;if(!e.length)return s;const n=e[0].size(this.resolveDataElementOptions(0)),o=e[e.length-1].size(this.resolveDataElementOptions(e.length-1));return Math.max(s,n,o)/2}}});function Un(t,e,i,s){const n=vi(t.options.borderRadius,["outerStart","outerEnd","innerStart","innerEnd"]);const o=(i-e)/2,a=Math.min(o,s*e/2),r=t=>{const e=(i-Math.min(o,t))*s/2;return J(t,0,Math.min(o,e))};return{outerStart:r(n.outerStart),outerEnd:r(n.outerEnd),innerStart:J(n.innerStart,0,a),innerEnd:J(n.innerEnd,0,a)}}function Xn(t,e,i,s){return{x:i+t*Math.cos(e),y:s+t*Math.sin(e)}}function qn(t,e,i,s,n,o){const{x:a,y:r,startAngle:l,pixelMargin:h,innerRadius:c}=e,d=Math.max(e.outerRadius+s+i-h,0),u=c>0?c+s+i+h:0;let f=0;const g=n-l;if(s){const t=((c>0?c-s:0)+(d>0?d-s:0))/2;f=(g-(0!==t?g*t/(t+s):g))/2}const p=(g-Math.max(.001,g*d-i/C)/d)/2,m=l+p+f,b=n-p-f,{outerStart:x,outerEnd:_,innerStart:y,innerEnd:v}=Un(e,u,d,b-m),M=d-x,w=d-_,k=m+x/M,S=b-_/w,P=u+y,D=u+v,O=m+y/P,A=b-v/D;if(t.beginPath(),o){const e=(k+S)/2;if(t.arc(a,r,d,k,e),t.arc(a,r,d,e,S),_>0){const e=Xn(w,S,a,r);t.arc(e.x,e.y,_,S,b+E)}const i=Xn(D,b,a,r);if(t.lineTo(i.x,i.y),v>0){const e=Xn(D,A,a,r);t.arc(e.x,e.y,v,b+E,A+Math.PI)}const s=(b-v/u+(m+y/u))/2;if(t.arc(a,r,u,b-v/u,s,!0),t.arc(a,r,u,s,m+y/u,!0),y>0){const e=Xn(P,O,a,r);t.arc(e.x,e.y,y,O+Math.PI,m-E)}const n=Xn(M,m,a,r);if(t.lineTo(n.x,n.y),x>0){const e=Xn(M,k,a,r);t.arc(e.x,e.y,x,m-E,k)}}else{t.moveTo(a,r);const e=Math.cos(k)*d+a,i=Math.sin(k)*d+r;t.lineTo(e,i);const s=Math.cos(S)*d+a,n=Math.sin(S)*d+r;t.lineTo(s,n)}t.closePath()}function Kn(t,e,i,s,n){const{fullCircles:o,startAngle:a,circumference:r,options:l}=e,{borderWidth:h,borderJoinStyle:c,borderDash:d,borderDashOffset:u}=l,f="inner"===l.borderAlign;if(!h)return;t.setLineDash(d||[]),t.lineDashOffset=u,f?(t.lineWidth=2*h,t.lineJoin=c||"round"):(t.lineWidth=h,t.lineJoin=c||"bevel");let g=e.endAngle;if(o){qn(t,e,i,s,g,n);for(let e=0;e<o;++e)t.stroke();isNaN(r)||(g=a+(r%O||O))}f&&function(t,e,i){const{startAngle:s,pixelMargin:n,x:o,y:a,outerRadius:r,innerRadius:l}=e;let h=n/r;t.beginPath(),t.arc(o,a,r,s-h,i+h),l>n?(h=n/l,t.arc(o,a,l,i+h,s-h,!0)):t.arc(o,a,n,i+E,s-E),t.closePath(),t.clip()}(t,e,g),o||(qn(t,e,i,s,g,n),t.stroke())}function Gn(t,e,i=e){t.lineCap=l(i.borderCapStyle,e.borderCapStyle),t.setLineDash(l(i.borderDash,e.borderDash)),t.lineDashOffset=l(i.borderDashOffset,e.borderDashOffset),t.lineJoin=l(i.borderJoinStyle,e.borderJoinStyle),t.lineWidth=l(i.borderWidth,e.borderWidth),t.strokeStyle=l(i.borderColor,e.borderColor)}function Zn(t,e,i){t.lineTo(i.x,i.y)}function Jn(t,e,i={}){const s=t.length,{start:n=0,end:o=s-1}=i,{start:a,end:r}=e,l=Math.max(n,a),h=Math.min(o,r),c=n<a&&o<a||n>r&&o>r;return{count:s,start:l,loop:e.loop,ilen:h<l&&!c?s+h-l:h-l}}function Qn(t,e,i,s){const{points:n,options:o}=e,{count:a,start:r,loop:l,ilen:h}=Jn(n,i,s),c=function(t){return t.stepped?Fe:t.tension||"monotone"===t.cubicInterpolationMode?Ve:Zn}(o);let d,u,f,{move:g=!0,reverse:p}=s||{};for(d=0;d<=h;++d)u=n[(r+(p?h-d:d))%a],u.skip||(g?(t.moveTo(u.x,u.y),g=!1):c(t,f,u,p,o.stepped),f=u);return l&&(u=n[(r+(p?h:0))%a],c(t,f,u,p,o.stepped)),!!l}function to(t,e,i,s){const n=e.points,{count:o,start:a,ilen:r}=Jn(n,i,s),{move:l=!0,reverse:h}=s||{};let c,d,u,f,g,p,m=0,b=0;const x=t=>(a+(h?r-t:t))%o,_=()=>{f!==g&&(t.lineTo(m,g),t.lineTo(m,f),t.lineTo(m,p))};for(l&&(d=n[x(0)],t.moveTo(d.x,d.y)),c=0;c<=r;++c){if(d=n[x(c)],d.skip)continue;const e=d.x,i=d.y,s=0|e;s===u?(i<f?f=i:i>g&&(g=i),m=(b*m+e)/++b):(_(),t.lineTo(e,i),u=s,b=0,f=g=i),p=i}_()}function eo(t){const e=t.options,i=e.borderDash&&e.borderDash.length;return!(t._decimated||t._loop||e.tension||"monotone"===e.cubicInterpolationMode||e.stepped||i)?to:Qn}const io="function"==typeof Path2D;function so(t,e,i,s){io&&!e.options.segment?function(t,e,i,s){let n=e._path;n||(n=e._path=new Path2D,e.path(n,i,s)&&n.closePath()),Gn(t,e.options),t.stroke(n)}(t,e,i,s):function(t,e,i,s){const{segments:n,options:o}=e,a=eo(e);for(const r of n)Gn(t,o,r.style),t.beginPath(),a(t,e,r,{start:i,end:i+s-1})&&t.closePath(),t.stroke()}(t,e,i,s)}class no extends Hs{static id="line";static defaults={borderCapStyle:"butt",borderDash:[],borderDashOffset:0,borderJoinStyle:"miter",borderWidth:3,capBezierPoints:!0,cubicInterpolationMode:"default",fill:!1,spanGaps:!1,stepped:!1,tension:0};static defaultRoutes={backgroundColor:"backgroundColor",borderColor:"borderColor"};static descriptors={_scriptable:!0,_indexable:t=>"borderDash"!==t&&"fill"!==t};constructor(t){super(),this.animated=!0,this.options=void 0,this._chart=void 0,this._loop=void 0,this._fullLoop=void 0,this._path=void 0,this._points=void 0,this._segments=void 0,this._decimated=!1,this._pointsUpdated=!1,this._datasetIndex=void 0,t&&Object.assign(this,t)}updateControlPoints(t,e){const i=this.options;if((i.tension||"monotone"===i.cubicInterpolationMode)&&!i.stepped&&!this._pointsUpdated){const s=i.spanGaps?this._loop:this._fullLoop;hi(this._points,i,t,s,e),this._pointsUpdated=!0}}set points(t){this._points=t,delete this._segments,delete this._path,this._pointsUpdated=!1}get points(){return this._points}get segments(){return this._segments||(this._segments=zi(this,this.options.segment))}first(){const t=this.segments,e=this.points;return t.length&&e[t[0].start]}last(){const t=this.segments,e=this.points,i=t.length;return i&&e[t[i-1].end]}interpolate(t,e){const i=this.options,s=t[e],n=this.points,o=Ii(this,{property:e,start:s,end:s});if(!o.length)return;const a=[],r=function(t){return t.stepped?pi:t.tension||"monotone"===t.cubicInterpolationMode?mi:gi}(i);let l,h;for(l=0,h=o.length;l<h;++l){const{start:h,end:c}=o[l],d=n[h],u=n[c];if(d===u){a.push(d);continue}const f=r(d,u,Math.abs((s-d[e])/(u[e]-d[e])),i.stepped);f[e]=t[e],a.push(f)}return 1===a.length?a[0]:a}pathSegment(t,e,i){return eo(this)(t,this,e,i)}path(t,e,i){const s=this.segments,n=eo(this);let o=this._loop;e=e||0,i=i||this.points.length-e;for(const a of s)o&=n(t,this,a,{start:e,end:e+i-1});return!!o}draw(t,e,i,s){const n=this.options||{};(this.points||[]).length&&n.borderWidth&&(t.save(),so(t,this,i,s),t.restore()),this.animated&&(this._pointsUpdated=!1,this._path=void 0)}}function oo(t,e,i,s){const n=t.options,{[i]:o}=t.getProps([i],s);return Math.abs(e-o)<n.radius+n.hitRadius}function ao(t,e){const{x:i,y:s,base:n,width:o,height:a}=t.getProps(["x","y","base","width","height"],e);let r,l,h,c,d;return t.horizontal?(d=a/2,r=Math.min(i,n),l=Math.max(i,n),h=s-d,c=s+d):(d=o/2,r=i-d,l=i+d,h=Math.min(s,n),c=Math.max(s,n)),{left:r,top:h,right:l,bottom:c}}function ro(t,e,i,s){return t?0:J(e,i,s)}function lo(t){const e=ao(t),i=e.right-e.left,s=e.bottom-e.top,n=function(t,e,i){const s=t.options.borderWidth,n=t.borderSkipped,o=Mi(s);return{t:ro(n.top,o.top,0,i),r:ro(n.right,o.right,0,e),b:ro(n.bottom,o.bottom,0,i),l:ro(n.left,o.left,0,e)}}(t,i/2,s/2),a=function(t,e,i){const{enableBorderRadius:s}=t.getProps(["enableBorderRadius"]),n=t.options.borderRadius,a=wi(n),r=Math.min(e,i),l=t.borderSkipped,h=s||o(n);return{topLeft:ro(!h||l.top||l.left,a.topLeft,0,r),topRight:ro(!h||l.top||l.right,a.topRight,0,r),bottomLeft:ro(!h||l.bottom||l.left,a.bottomLeft,0,r),bottomRight:ro(!h||l.bottom||l.right,a.bottomRight,0,r)}}(t,i/2,s/2);return{outer:{x:e.left,y:e.top,w:i,h:s,radius:a},inner:{x:e.left+n.l,y:e.top+n.t,w:i-n.l-n.r,h:s-n.t-n.b,radius:{topLeft:Math.max(0,a.topLeft-Math.max(n.t,n.l)),topRight:Math.max(0,a.topRight-Math.max(n.t,n.r)),bottomLeft:Math.max(0,a.bottomLeft-Math.max(n.b,n.l)),bottomRight:Math.max(0,a.bottomRight-Math.max(n.b,n.r))}}}}function ho(t,e,i,s){const n=null===e,o=null===i,a=t&&!(n&&o)&&ao(t,s);return a&&(n||tt(e,a.left,a.right))&&(o||tt(i,a.top,a.bottom))}function co(t,e){t.rect(e.x,e.y,e.w,e.h)}function uo(t,e,i={}){const s=t.x!==i.x?-e:0,n=t.y!==i.y?-e:0,o=(t.x+t.w!==i.x+i.w?e:0)-s,a=(t.y+t.h!==i.y+i.h?e:0)-n;return{x:t.x+s,y:t.y+n,w:t.w+o,h:t.h+a,radius:t.radius}}var fo=Object.freeze({__proto__:null,ArcElement:class extends Hs{static id="arc";static defaults={borderAlign:"center",borderColor:"#fff",borderDash:[],borderDashOffset:0,borderJoinStyle:void 0,borderRadius:0,borderWidth:2,offset:0,spacing:0,angle:void 0,circular:!0};static defaultRoutes={backgroundColor:"backgroundColor"};static descriptors={_scriptable:!0,_indexable:t=>"borderDash"!==t};circumference;endAngle;fullCircles;innerRadius;outerRadius;pixelMargin;startAngle;constructor(t){super(),this.options=void 0,this.circumference=void 0,this.startAngle=void 0,this.endAngle=void 0,this.innerRadius=void 0,this.outerRadius=void 0,this.pixelMargin=0,this.fullCircles=0,t&&Object.assign(this,t)}inRange(t,e,i){const s=this.getProps(["x","y"],i),{angle:n,distance:o}=X(s,{x:t,y:e}),{startAngle:a,endAngle:r,innerRadius:h,outerRadius:c,circumference:d}=this.getProps(["startAngle","endAngle","innerRadius","outerRadius","circumference"],i),u=(this.options.spacing+this.options.borderWidth)/2,f=l(d,r-a)>=O||Z(n,a,r),g=tt(o,h+u,c+u);return f&&g}getCenterPoint(t){const{x:e,y:i,startAngle:s,endAngle:n,innerRadius:o,outerRadius:a}=this.getProps(["x","y","startAngle","endAngle","innerRadius","outerRadius"],t),{offset:r,spacing:l}=this.options,h=(s+n)/2,c=(o+a+l+r)/2;return{x:e+Math.cos(h)*c,y:i+Math.sin(h)*c}}tooltipPosition(t){return this.getCenterPoint(t)}draw(t){const{options:e,circumference:i}=this,s=(e.offset||0)/4,n=(e.spacing||0)/2,o=e.circular;if(this.pixelMargin="inner"===e.borderAlign?.33:0,this.fullCircles=i>O?Math.floor(i/O):0,0===i||this.innerRadius<0||this.outerRadius<0)return;t.save();const a=(this.startAngle+this.endAngle)/2;t.translate(Math.cos(a)*s,Math.sin(a)*s);const r=s*(1-Math.sin(Math.min(C,i||0)));t.fillStyle=e.backgroundColor,t.strokeStyle=e.borderColor,function(t,e,i,s,n){const{fullCircles:o,startAngle:a,circumference:r}=e;let l=e.endAngle;if(o){qn(t,e,i,s,l,n);for(let e=0;e<o;++e)t.fill();isNaN(r)||(l=a+(r%O||O))}qn(t,e,i,s,l,n),t.fill()}(t,this,r,n,o),Kn(t,this,r,n,o),t.restore()}},BarElement:class extends Hs{static id="bar";static defaults={borderSkipped:"start",borderWidth:0,borderRadius:0,inflateAmount:"auto",pointStyle:void 0};static defaultRoutes={backgroundColor:"backgroundColor",borderColor:"borderColor"};constructor(t){super(),this.options=void 0,this.horizontal=void 0,this.base=void 0,this.width=void 0,this.height=void 0,this.inflateAmount=void 0,t&&Object.assign(this,t)}draw(t){const{inflateAmount:e,options:{borderColor:i,backgroundColor:s}}=this,{inner:n,outer:o}=lo(this),a=(r=o.radius).topLeft||r.topRight||r.bottomLeft||r.bottomRight?He:co;var r;t.save(),o.w===n.w&&o.h===n.h||(t.beginPath(),a(t,uo(o,e,n)),t.clip(),a(t,uo(n,-e,o)),t.fillStyle=i,t.fill("evenodd")),t.beginPath(),a(t,uo(n,e)),t.fillStyle=s,t.fill(),t.restore()}inRange(t,e,i){return ho(this,t,e,i)}inXRange(t,e){return ho(this,t,null,e)}inYRange(t,e){return ho(this,null,t,e)}getCenterPoint(t){const{x:e,y:i,base:s,horizontal:n}=this.getProps(["x","y","base","horizontal"],t);return{x:n?(e+s)/2:e,y:n?i:(i+s)/2}}getRange(t){return"x"===t?this.width/2:this.height/2}},LineElement:no,PointElement:class extends Hs{static id="point";parsed;skip;stop;static defaults={borderWidth:1,hitRadius:1,hoverBorderWidth:1,hoverRadius:4,pointStyle:"circle",radius:3,rotation:0};static defaultRoutes={backgroundColor:"backgroundColor",borderColor:"borderColor"};constructor(t){super(),this.options=void 0,this.parsed=void 0,this.skip=void 0,this.stop=void 0,t&&Object.assign(this,t)}inRange(t,e,i){const s=this.options,{x:n,y:o}=this.getProps(["x","y"],i);return Math.pow(t-n,2)+Math.pow(e-o,2)<Math.pow(s.hitRadius+s.radius,2)}inXRange(t,e){return oo(this,t,"x",e)}inYRange(t,e){return oo(this,t,"y",e)}getCenterPoint(t){const{x:e,y:i}=this.getProps(["x","y"],t);return{x:e,y:i}}size(t){let e=(t=t||this.options||{}).radius||0;e=Math.max(e,e&&t.hoverRadius||0);return 2*(e+(e&&t.borderWidth||0))}draw(t,e){const i=this.options;this.skip||i.radius<.1||!Re(this,e,this.size(i)/2)||(t.strokeStyle=i.borderColor,t.lineWidth=i.borderWidth,t.fillStyle=i.backgroundColor,Le(t,i,this.x,this.y))}getRange(){const t=this.options||{};return t.radius+t.hitRadius}}});function go(t,e,i,s){const n=t.indexOf(e);if(-1===n)return((t,e,i,s)=>("string"==typeof e?(i=t.push(e)-1,s.unshift({index:i,label:e})):isNaN(e)&&(i=null),i))(t,e,i,s);return n!==t.lastIndexOf(e)?i:n}function po(t){const e=this.getLabels();return t>=0&&t<e.length?e[t]:t}function mo(t,e,{horizontal:i,minRotation:s}){const n=$(s),o=(i?Math.sin(n):Math.cos(n))||.001,a=.75*e*(""+t).length;return Math.min(e/o,a)}class bo extends Js{constructor(t){super(t),this.start=void 0,this.end=void 0,this._startValue=void 0,this._endValue=void 0,this._valueRange=0}parse(t,e){return s(t)||("number"==typeof t||t instanceof Number)&&!isFinite(+t)?null:+t}handleTickRangeOptions(){const{beginAtZero:t}=this.options,{minDefined:e,maxDefined:i}=this.getUserBounds();let{min:s,max:n}=this;const o=t=>s=e?s:t,a=t=>n=i?n:t;if(t){const t=F(s),e=F(n);t<0&&e<0?a(0):t>0&&e>0&&o(0)}if(s===n){let e=0===n?1:Math.abs(.05*n);a(n+e),t||o(s-e)}this.min=s,this.max=n}getTickLimit(){const t=this.options.ticks;let e,{maxTicksLimit:i,stepSize:s}=t;return s?(e=Math.ceil(this.max/s)-Math.floor(this.min/s)+1,e>1e3&&(console.warn(`scales.${this.id}.ticks.stepSize: ${s} would result generating up to ${e} ticks. Limiting to 1000.`),e=1e3)):(e=this.computeTickLimit(),i=i||11),i&&(e=Math.min(i,e)),e}computeTickLimit(){return Number.POSITIVE_INFINITY}buildTicks(){const t=this.options,e=t.ticks;let i=this.getTickLimit();i=Math.max(2,i);const n=function(t,e){const i=[],{bounds:n,step:o,min:a,max:r,precision:l,count:h,maxTicks:c,maxDigits:d,includeBounds:u}=t,f=o||1,g=c-1,{min:p,max:m}=e,b=!s(a),x=!s(r),_=!s(h),y=(m-p)/(d+1);let v,M,w,k,S=B((m-p)/g/f)*f;if(S<1e-14&&!b&&!x)return[{value:p},{value:m}];k=Math.ceil(m/S)-Math.floor(p/S),k>g&&(S=B(k*S/g/f)*f),s(l)||(v=Math.pow(10,l),S=Math.ceil(S*v)/v),"ticks"===n?(M=Math.floor(p/S)*S,w=Math.ceil(m/S)*S):(M=p,w=m),b&&x&&o&&H((r-a)/o,S/1e3)?(k=Math.round(Math.min((r-a)/S,c)),S=(r-a)/k,M=a,w=r):_?(M=b?a:M,w=x?r:w,k=h-1,S=(w-M)/k):(k=(w-M)/S,k=V(k,Math.round(k),S/1e3)?Math.round(k):Math.ceil(k));const P=Math.max(U(S),U(M));v=Math.pow(10,s(l)?P:l),M=Math.round(M*v)/v,w=Math.round(w*v)/v;let D=0;for(b&&(u&&M!==a?(i.push({value:a}),M<a&&D++,V(Math.round((M+D*S)*v)/v,a,mo(a,y,t))&&D++):M<a&&D++);D<k;++D){const t=Math.round((M+D*S)*v)/v;if(x&&t>r)break;i.push({value:t})}return x&&u&&w!==r?i.length&&V(i[i.length-1].value,r,mo(r,y,t))?i[i.length-1].value=r:i.push({value:r}):x&&w!==r||i.push({value:w}),i}({maxTicks:i,bounds:t.bounds,min:t.min,max:t.max,precision:e.precision,step:e.stepSize,count:e.count,maxDigits:this._maxDigits(),horizontal:this.isHorizontal(),minRotation:e.minRotation||0,includeBounds:!1!==e.includeBounds},this._range||this);return"ticks"===t.bounds&&j(n,this,"value"),t.reverse?(n.reverse(),this.start=this.max,this.end=this.min):(this.start=this.min,this.end=this.max),n}configure(){const t=this.ticks;let e=this.min,i=this.max;if(super.configure(),this.options.offset&&t.length){const s=(i-e)/Math.max(t.length-1,1)/2;e-=s,i+=s}this._startValue=e,this._endValue=i,this._valueRange=i-e}getLabelForValue(t){return ne(t,this.chart.options.locale,this.options.ticks.format)}}class xo extends bo{static id="linear";static defaults={ticks:{callback:ae.formatters.numeric}};determineDataLimits(){const{min:t,max:e}=this.getMinMax(!0);this.min=a(t)?t:0,this.max=a(e)?e:1,this.handleTickRangeOptions()}computeTickLimit(){const t=this.isHorizontal(),e=t?this.width:this.height,i=$(this.options.ticks.minRotation),s=(t?Math.sin(i):Math.cos(i))||.001,n=this._resolveTickFontOptions(0);return Math.ceil(e/Math.min(40,n.lineHeight/s))}getPixelForValue(t){return null===t?NaN:this.getPixelForDecimal((t-this._startValue)/this._valueRange)}getValueForPixel(t){return this._startValue+this.getDecimalForPixel(t)*this._valueRange}}const _o=t=>Math.floor(z(t)),yo=(t,e)=>Math.pow(10,_o(t)+e);function vo(t){return 1===t/Math.pow(10,_o(t))}function Mo(t,e,i){const s=Math.pow(10,i),n=Math.floor(t/s);return Math.ceil(e/s)-n}function wo(t,{min:e,max:i}){e=r(t.min,e);const s=[],n=_o(e);let o=function(t,e){let i=_o(e-t);for(;Mo(t,e,i)>10;)i++;for(;Mo(t,e,i)<10;)i--;return Math.min(i,_o(t))}(e,i),a=o<0?Math.pow(10,Math.abs(o)):1;const l=Math.pow(10,o),h=n>o?Math.pow(10,n):0,c=Math.round((e-h)*a)/a,d=Math.floor((e-h)/l/10)*l*10;let u=Math.floor((c-d)/Math.pow(10,o)),f=r(t.min,Math.round((h+d+u*Math.pow(10,o))*a)/a);for(;f<i;)s.push({value:f,major:vo(f),significand:u}),u>=10?u=u<15?15:20:u++,u>=20&&(o++,u=2,a=o>=0?1:a),f=Math.round((h+d+u*Math.pow(10,o))*a)/a;const g=r(t.max,f);return s.push({value:g,major:vo(g),significand:u}),s}class ko extends Js{static id="logarithmic";static defaults={ticks:{callback:ae.formatters.logarithmic,major:{enabled:!0}}};constructor(t){super(t),this.start=void 0,this.end=void 0,this._startValue=void 0,this._valueRange=0}parse(t,e){const i=bo.prototype.parse.apply(this,[t,e]);if(0!==i)return a(i)&&i>0?i:null;this._zero=!0}determineDataLimits(){const{min:t,max:e}=this.getMinMax(!0);this.min=a(t)?Math.max(0,t):null,this.max=a(e)?Math.max(0,e):null,this.options.beginAtZero&&(this._zero=!0),this._zero&&this.min!==this._suggestedMin&&!a(this._userMin)&&(this.min=t===yo(this.min,0)?yo(this.min,-1):yo(this.min,0)),this.handleTickRangeOptions()}handleTickRangeOptions(){const{minDefined:t,maxDefined:e}=this.getUserBounds();let i=this.min,s=this.max;const n=e=>i=t?i:e,o=t=>s=e?s:t;i===s&&(i<=0?(n(1),o(10)):(n(yo(i,-1)),o(yo(s,1)))),i<=0&&n(yo(s,-1)),s<=0&&o(yo(i,1)),this.min=i,this.max=s}buildTicks(){const t=this.options,e=wo({min:this._userMin,max:this._userMax},this);return"ticks"===t.bounds&&j(e,this,"value"),t.reverse?(e.reverse(),this.start=this.max,this.end=this.min):(this.start=this.min,this.end=this.max),e}getLabelForValue(t){return void 0===t?"0":ne(t,this.chart.options.locale,this.options.ticks.format)}configure(){const t=this.min;super.configure(),this._startValue=z(t),this._valueRange=z(this.max)-z(t)}getPixelForValue(t){return void 0!==t&&0!==t||(t=this.min),null===t||isNaN(t)?NaN:this.getPixelForDecimal(t===this.min?0:(z(t)-this._startValue)/this._valueRange)}getValueForPixel(t){const e=this.getDecimalForPixel(t);return Math.pow(10,this._startValue+e*this._valueRange)}}function So(t){const e=t.ticks;if(e.display&&t.display){const t=ki(e.backdropPadding);return l(e.font&&e.font.size,ue.font.size)+t.height}return 0}function Po(t,e,i,s,n){return t===s||t===n?{start:e-i/2,end:e+i/2}:t<s||t>n?{start:e-i,end:e}:{start:e,end:e+i}}function Do(t){const e={l:t.left+t._padding.left,r:t.right-t._padding.right,t:t.top+t._padding.top,b:t.bottom-t._padding.bottom},i=Object.assign({},e),s=[],o=[],a=t._pointLabels.length,r=t.options.pointLabels,l=r.centerPointLabels?C/a:0;for(let u=0;u<a;u++){const a=r.setContext(t.getPointLabelContext(u));o[u]=a.padding;const f=t.getPointPosition(u,t.drawingArea+o[u],l),g=Si(a.font),p=(h=t.ctx,c=g,d=n(d=t._pointLabels[u])?d:[d],{w:Oe(h,c.string,d),h:d.length*c.lineHeight});s[u]=p;const m=G(t.getIndexAngle(u)+l),b=Math.round(Y(m));Co(i,e,m,Po(b,f.x,p.w,0,180),Po(b,f.y,p.h,90,270))}var h,c,d;t.setCenterPoint(e.l-i.l,i.r-e.r,e.t-i.t,i.b-e.b),t._pointLabelItems=function(t,e,i){const s=[],n=t._pointLabels.length,o=t.options,{centerPointLabels:a,display:r}=o.pointLabels,l={extra:So(o)/2,additionalAngle:a?C/n:0};let h;for(let o=0;o<n;o++){l.padding=i[o],l.size=e[o];const n=Oo(t,o,l);s.push(n),"auto"===r&&(n.visible=Ao(n,h),n.visible&&(h=n))}return s}(t,s,o)}function Co(t,e,i,s,n){const o=Math.abs(Math.sin(i)),a=Math.abs(Math.cos(i));let r=0,l=0;s.start<e.l?(r=(e.l-s.start)/o,t.l=Math.min(t.l,e.l-r)):s.end>e.r&&(r=(s.end-e.r)/o,t.r=Math.max(t.r,e.r+r)),n.start<e.t?(l=(e.t-n.start)/a,t.t=Math.min(t.t,e.t-l)):n.end>e.b&&(l=(n.end-e.b)/a,t.b=Math.max(t.b,e.b+l))}function Oo(t,e,i){const s=t.drawingArea,{extra:n,additionalAngle:o,padding:a,size:r}=i,l=t.getPointPosition(e,s+n+a,o),h=Math.round(Y(G(l.angle+E))),c=function(t,e,i){90===i||270===i?t-=e/2:(i>270||i<90)&&(t-=e);return t}(l.y,r.h,h),d=function(t){if(0===t||180===t)return"center";if(t<180)return"left";return"right"}(h),u=function(t,e,i){"right"===i?t-=e:"center"===i&&(t-=e/2);return t}(l.x,r.w,d);return{visible:!0,x:l.x,y:c,textAlign:d,left:u,top:c,right:u+r.w,bottom:c+r.h}}function Ao(t,e){if(!e)return!0;const{left:i,top:s,right:n,bottom:o}=t;return!(Re({x:i,y:s},e)||Re({x:i,y:o},e)||Re({x:n,y:s},e)||Re({x:n,y:o},e))}function To(t,e,i){const{left:n,top:o,right:a,bottom:r}=i,{backdropColor:l}=e;if(!s(l)){const i=wi(e.borderRadius),s=ki(e.backdropPadding);t.fillStyle=l;const h=n-s.left,c=o-s.top,d=a-n+s.width,u=r-o+s.height;Object.values(i).some((t=>0!==t))?(t.beginPath(),He(t,{x:h,y:c,w:d,h:u,radius:i}),t.fill()):t.fillRect(h,c,d,u)}}function Lo(t,e,i,s){const{ctx:n}=t;if(i)n.arc(t.xCenter,t.yCenter,e,0,O);else{let i=t.getPointPosition(0,e);n.moveTo(i.x,i.y);for(let o=1;o<s;o++)i=t.getPointPosition(o,e),n.lineTo(i.x,i.y)}}class Eo extends bo{static id="radialLinear";static defaults={display:!0,animate:!0,position:"chartArea",angleLines:{display:!0,lineWidth:1,borderDash:[],borderDashOffset:0},grid:{circular:!1},startAngle:0,ticks:{showLabelBackdrop:!0,callback:ae.formatters.numeric},pointLabels:{backdropColor:void 0,backdropPadding:2,display:!0,font:{size:10},callback:t=>t,padding:5,centerPointLabels:!1}};static defaultRoutes={"angleLines.color":"borderColor","pointLabels.color":"color","ticks.color":"color"};static descriptors={angleLines:{_fallback:"grid"}};constructor(t){super(t),this.xCenter=void 0,this.yCenter=void 0,this.drawingArea=void 0,this._pointLabels=[],this._pointLabelItems=[]}setDimensions(){const t=this._padding=ki(So(this.options)/2),e=this.width=this.maxWidth-t.width,i=this.height=this.maxHeight-t.height;this.xCenter=Math.floor(this.left+e/2+t.left),this.yCenter=Math.floor(this.top+i/2+t.top),this.drawingArea=Math.floor(Math.min(e,i)/2)}determineDataLimits(){const{min:t,max:e}=this.getMinMax(!1);this.min=a(t)&&!isNaN(t)?t:0,this.max=a(e)&&!isNaN(e)?e:0,this.handleTickRangeOptions()}computeTickLimit(){return Math.ceil(this.drawingArea/So(this.options))}generateTickLabels(t){bo.prototype.generateTickLabels.call(this,t),this._pointLabels=this.getLabels().map(((t,e)=>{const i=d(this.options.pointLabels.callback,[t,e],this);return i||0===i?i:""})).filter(((t,e)=>this.chart.getDataVisibility(e)))}fit(){const t=this.options;t.display&&t.pointLabels.display?Do(this):this.setCenterPoint(0,0,0,0)}setCenterPoint(t,e,i,s){this.xCenter+=Math.floor((t-e)/2),this.yCenter+=Math.floor((i-s)/2),this.drawingArea-=Math.min(this.drawingArea/2,Math.max(t,e,i,s))}getIndexAngle(t){return G(t*(O/(this._pointLabels.length||1))+$(this.options.startAngle||0))}getDistanceFromCenterForValue(t){if(s(t))return NaN;const e=this.drawingArea/(this.max-this.min);return this.options.reverse?(this.max-t)*e:(t-this.min)*e}getValueForDistanceFromCenter(t){if(s(t))return NaN;const e=t/(this.drawingArea/(this.max-this.min));return this.options.reverse?this.max-e:this.min+e}getPointLabelContext(t){const e=this._pointLabels||[];if(t>=0&&t<e.length){const i=e[t];return function(t,e,i){return Ci(t,{label:i,index:e,type:"pointLabel"})}(this.getContext(),t,i)}}getPointPosition(t,e,i=0){const s=this.getIndexAngle(t)-E+i;return{x:Math.cos(s)*e+this.xCenter,y:Math.sin(s)*e+this.yCenter,angle:s}}getPointPositionForValue(t,e){return this.getPointPosition(t,this.getDistanceFromCenterForValue(e))}getBasePosition(t){return this.getPointPositionForValue(t||0,this.getBaseValue())}getPointLabelPosition(t){const{left:e,top:i,right:s,bottom:n}=this._pointLabelItems[t];return{left:e,top:i,right:s,bottom:n}}drawBackground(){const{backgroundColor:t,grid:{circular:e}}=this.options;if(t){const i=this.ctx;i.save(),i.beginPath(),Lo(this,this.getDistanceFromCenterForValue(this._endValue),e,this._pointLabels.length),i.closePath(),i.fillStyle=t,i.fill(),i.restore()}}drawGrid(){const t=this.ctx,e=this.options,{angleLines:i,grid:s,border:n}=e,o=this._pointLabels.length;let a,r,l;if(e.pointLabels.display&&function(t,e){const{ctx:i,options:{pointLabels:s}}=t;for(let n=e-1;n>=0;n--){const e=t._pointLabelItems[n];if(!e.visible)continue;const o=s.setContext(t.getPointLabelContext(n));To(i,o,e);const a=Si(o.font),{x:r,y:l,textAlign:h}=e;Ne(i,t._pointLabels[n],r,l+a.lineHeight/2,a,{color:o.color,textAlign:h,textBaseline:"middle"})}}(this,o),s.display&&this.ticks.forEach(((t,e)=>{if(0!==e){r=this.getDistanceFromCenterForValue(t.value);const i=this.getContext(e),a=s.setContext(i),l=n.setContext(i);!function(t,e,i,s,n){const o=t.ctx,a=e.circular,{color:r,lineWidth:l}=e;!a&&!s||!r||!l||i<0||(o.save(),o.strokeStyle=r,o.lineWidth=l,o.setLineDash(n.dash),o.lineDashOffset=n.dashOffset,o.beginPath(),Lo(t,i,a,s),o.closePath(),o.stroke(),o.restore())}(this,a,r,o,l)}})),i.display){for(t.save(),a=o-1;a>=0;a--){const s=i.setContext(this.getPointLabelContext(a)),{color:n,lineWidth:o}=s;o&&n&&(t.lineWidth=o,t.strokeStyle=n,t.setLineDash(s.borderDash),t.lineDashOffset=s.borderDashOffset,r=this.getDistanceFromCenterForValue(e.ticks.reverse?this.min:this.max),l=this.getPointPosition(a,r),t.beginPath(),t.moveTo(this.xCenter,this.yCenter),t.lineTo(l.x,l.y),t.stroke())}t.restore()}}drawBorder(){}drawLabels(){const t=this.ctx,e=this.options,i=e.ticks;if(!i.display)return;const s=this.getIndexAngle(0);let n,o;t.save(),t.translate(this.xCenter,this.yCenter),t.rotate(s),t.textAlign="center",t.textBaseline="middle",this.ticks.forEach(((s,a)=>{if(0===a&&!e.reverse)return;const r=i.setContext(this.getContext(a)),l=Si(r.font);if(n=this.getDistanceFromCenterForValue(this.ticks[a].value),r.showLabelBackdrop){t.font=l.string,o=t.measureText(s.label).width,t.fillStyle=r.backdropColor;const e=ki(r.backdropPadding);t.fillRect(-o/2-e.left,-n-l.size/2-e.top,o+e.width,l.size+e.height)}Ne(t,s.label,0,-n,l,{color:r.color,strokeColor:r.textStrokeColor,strokeWidth:r.textStrokeWidth})})),t.restore()}drawTitle(){}}const Ro={millisecond:{common:!0,size:1,steps:1e3},second:{common:!0,size:1e3,steps:60},minute:{common:!0,size:6e4,steps:60},hour:{common:!0,size:36e5,steps:24},day:{common:!0,size:864e5,steps:30},week:{common:!1,size:6048e5,steps:4},month:{common:!0,size:2628e6,steps:12},quarter:{common:!1,size:7884e6,steps:4},year:{common:!0,size:3154e7}},Io=Object.keys(Ro);function zo(t,e){return t-e}function Fo(t,e){if(s(e))return null;const i=t._adapter,{parser:n,round:o,isoWeekday:r}=t._parseOpts;let l=e;return"function"==typeof n&&(l=n(l)),a(l)||(l="string"==typeof n?i.parse(l,n):i.parse(l)),null===l?null:(o&&(l="week"!==o||!N(r)&&!0!==r?i.startOf(l,o):i.startOf(l,"isoWeek",r)),+l)}function Vo(t,e,i,s){const n=Io.length;for(let o=Io.indexOf(t);o<n-1;++o){const t=Ro[Io[o]],n=t.steps?t.steps:Number.MAX_SAFE_INTEGER;if(t.common&&Math.ceil((i-e)/(n*t.size))<=s)return Io[o]}return Io[n-1]}function Bo(t,e,i){if(i){if(i.length){const{lo:s,hi:n}=et(i,e);t[i[s]>=e?i[s]:i[n]]=!0}}else t[e]=!0}function Wo(t,e,i){const s=[],n={},o=e.length;let a,r;for(a=0;a<o;++a)r=e[a],n[r]=a,s.push({value:r,major:!1});return 0!==o&&i?function(t,e,i,s){const n=t._adapter,o=+n.startOf(e[0].value,s),a=e[e.length-1].value;let r,l;for(r=o;r<=a;r=+n.add(r,1,s))l=i[r],l>=0&&(e[l].major=!0);return e}(t,s,n,i):s}class No extends Js{static id="time";static defaults={bounds:"data",adapters:{},time:{parser:!1,unit:!1,round:!1,isoWeekday:!1,minUnit:"millisecond",displayFormats:{}},ticks:{source:"auto",callback:!1,major:{enabled:!1}}};constructor(t){super(t),this._cache={data:[],labels:[],all:[]},this._unit="day",this._majorUnit=void 0,this._offsets={},this._normalized=!1,this._parseOpts=void 0}init(t,e={}){const i=t.time||(t.time={}),s=this._adapter=new Rn._date(t.adapters.date);s.init(e),x(i.displayFormats,s.formats()),this._parseOpts={parser:i.parser,round:i.round,isoWeekday:i.isoWeekday},super.init(t),this._normalized=e.normalized}parse(t,e){return void 0===t?null:Fo(this,t)}beforeLayout(){super.beforeLayout(),this._cache={data:[],labels:[],all:[]}}determineDataLimits(){const t=this.options,e=this._adapter,i=t.time.unit||"day";let{min:s,max:n,minDefined:o,maxDefined:r}=this.getUserBounds();function l(t){o||isNaN(t.min)||(s=Math.min(s,t.min)),r||isNaN(t.max)||(n=Math.max(n,t.max))}o&&r||(l(this._getLabelBounds()),"ticks"===t.bounds&&"labels"===t.ticks.source||l(this.getMinMax(!1))),s=a(s)&&!isNaN(s)?s:+e.startOf(Date.now(),i),n=a(n)&&!isNaN(n)?n:+e.endOf(Date.now(),i)+1,this.min=Math.min(s,n-1),this.max=Math.max(s+1,n)}_getLabelBounds(){const t=this.getLabelTimestamps();let e=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY;return t.length&&(e=t[0],i=t[t.length-1]),{min:e,max:i}}buildTicks(){const t=this.options,e=t.time,i=t.ticks,s="labels"===i.source?this.getLabelTimestamps():this._generate();"ticks"===t.bounds&&s.length&&(this.min=this._userMin||s[0],this.max=this._userMax||s[s.length-1]);const n=this.min,o=nt(s,n,this.max);return this._unit=e.unit||(i.autoSkip?Vo(e.minUnit,this.min,this.max,this._getLabelCapacity(n)):function(t,e,i,s,n){for(let o=Io.length-1;o>=Io.indexOf(i);o--){const i=Io[o];if(Ro[i].common&&t._adapter.diff(n,s,i)>=e-1)return i}return Io[i?Io.indexOf(i):0]}(this,o.length,e.minUnit,this.min,this.max)),this._majorUnit=i.major.enabled&&"year"!==this._unit?function(t){for(let e=Io.indexOf(t)+1,i=Io.length;e<i;++e)if(Ro[Io[e]].common)return Io[e]}(this._unit):void 0,this.initOffsets(s),t.reverse&&o.reverse(),Wo(this,o,this._majorUnit)}afterAutoSkip(){this.options.offsetAfterAutoskip&&this.initOffsets(this.ticks.map((t=>+t.value)))}initOffsets(t=[]){let e,i,s=0,n=0;this.options.offset&&t.length&&(e=this.getDecimalForValue(t[0]),s=1===t.length?1-e:(this.getDecimalForValue(t[1])-e)/2,i=this.getDecimalForValue(t[t.length-1]),n=1===t.length?i:(i-this.getDecimalForValue(t[t.length-2]))/2);const o=t.length<3?.5:.25;s=J(s,0,o),n=J(n,0,o),this._offsets={start:s,end:n,factor:1/(s+1+n)}}_generate(){const t=this._adapter,e=this.min,i=this.max,s=this.options,n=s.time,o=n.unit||Vo(n.minUnit,e,i,this._getLabelCapacity(e)),a=l(s.ticks.stepSize,1),r="week"===o&&n.isoWeekday,h=N(r)||!0===r,c={};let d,u,f=e;if(h&&(f=+t.startOf(f,"isoWeek",r)),f=+t.startOf(f,h?"day":o),t.diff(i,e,o)>1e5*a)throw new Error(e+" and "+i+" are too far apart with stepSize of "+a+" "+o);const g="data"===s.ticks.source&&this.getDataTimestamps();for(d=f,u=0;d<i;d=+t.add(d,a,o),u++)Bo(c,d,g);return d!==i&&"ticks"!==s.bounds&&1!==u||Bo(c,d,g),Object.keys(c).sort(zo).map((t=>+t))}getLabelForValue(t){const e=this._adapter,i=this.options.time;return i.tooltipFormat?e.format(t,i.tooltipFormat):e.format(t,i.displayFormats.datetime)}format(t,e){const i=this.options.time.displayFormats,s=this._unit,n=e||i[s];return this._adapter.format(t,n)}_tickFormatFunction(t,e,i,s){const n=this.options,o=n.ticks.callback;if(o)return d(o,[t,e,i],this);const a=n.time.displayFormats,r=this._unit,l=this._majorUnit,h=r&&a[r],c=l&&a[l],u=i[e],f=l&&c&&u&&u.major;return this._adapter.format(t,s||(f?c:h))}generateTickLabels(t){let e,i,s;for(e=0,i=t.length;e<i;++e)s=t[e],s.label=this._tickFormatFunction(s.value,e,t)}getDecimalForValue(t){return null===t?NaN:(t-this.min)/(this.max-this.min)}getPixelForValue(t){const e=this._offsets,i=this.getDecimalForValue(t);return this.getPixelForDecimal((e.start+i)*e.factor)}getValueForPixel(t){const e=this._offsets,i=this.getDecimalForPixel(t)/e.factor-e.end;return this.min+i*(this.max-this.min)}_getLabelSize(t){const e=this.options.ticks,i=this.ctx.measureText(t).width,s=$(this.isHorizontal()?e.maxRotation:e.minRotation),n=Math.cos(s),o=Math.sin(s),a=this._resolveTickFontOptions(0).size;return{w:i*n+a*o,h:i*o+a*n}}_getLabelCapacity(t){const e=this.options.time,i=e.displayFormats,s=i[e.unit]||i.millisecond,n=this._tickFormatFunction(t,0,Wo(this,[t],this._majorUnit),s),o=this._getLabelSize(n),a=Math.floor(this.isHorizontal()?this.width/o.w:this.height/o.h)-1;return a>0?a:1}getDataTimestamps(){let t,e,i=this._cache.data||[];if(i.length)return i;const s=this.getMatchingVisibleMetas();if(this._normalized&&s.length)return this._cache.data=s[0].controller.getAllParsedValues(this);for(t=0,e=s.length;t<e;++t)i=i.concat(s[t].controller.getAllParsedValues(this));return this._cache.data=this.normalize(i)}getLabelTimestamps(){const t=this._cache.labels||[];let e,i;if(t.length)return t;const s=this.getLabels();for(e=0,i=s.length;e<i;++e)t.push(Fo(this,s[e]));return this._cache.labels=this._normalized?t:this.normalize(t)}normalize(t){return lt(t.sort(zo))}}function Ho(t,e,i){let s,n,o,a,r=0,l=t.length-1;i?(e>=t[r].pos&&e<=t[l].pos&&({lo:r,hi:l}=it(t,"pos",e)),({pos:s,time:o}=t[r]),({pos:n,time:a}=t[l])):(e>=t[r].time&&e<=t[l].time&&({lo:r,hi:l}=it(t,"time",e)),({time:s,pos:o}=t[r]),({time:n,pos:a}=t[l]));const h=n-s;return h?o+(a-o)*(e-s)/h:o}var jo=Object.freeze({__proto__:null,CategoryScale:class extends Js{static id="category";static defaults={ticks:{callback:po}};constructor(t){super(t),this._startValue=void 0,this._valueRange=0,this._addedLabels=[]}init(t){const e=this._addedLabels;if(e.length){const t=this.getLabels();for(const{index:i,label:s}of e)t[i]===s&&t.splice(i,1);this._addedLabels=[]}super.init(t)}parse(t,e){if(s(t))return null;const i=this.getLabels();return((t,e)=>null===t?null:J(Math.round(t),0,e))(e=isFinite(e)&&i[e]===t?e:go(i,t,l(e,t),this._addedLabels),i.length-1)}determineDataLimits(){const{minDefined:t,maxDefined:e}=this.getUserBounds();let{min:i,max:s}=this.getMinMax(!0);"ticks"===this.options.bounds&&(t||(i=0),e||(s=this.getLabels().length-1)),this.min=i,this.max=s}buildTicks(){const t=this.min,e=this.max,i=this.options.offset,s=[];let n=this.getLabels();n=0===t&&e===n.length-1?n:n.slice(t,e+1),this._valueRange=Math.max(n.length-(i?0:1),1),this._startValue=this.min-(i?.5:0);for(let i=t;i<=e;i++)s.push({value:i});return s}getLabelForValue(t){return po.call(this,t)}configure(){super.configure(),this.isHorizontal()||(this._reversePixels=!this._reversePixels)}getPixelForValue(t){return"number"!=typeof t&&(t=this.parse(t)),null===t?NaN:this.getPixelForDecimal((t-this._startValue)/this._valueRange)}getPixelForTick(t){const e=this.ticks;return t<0||t>e.length-1?null:this.getPixelForValue(e[t].value)}getValueForPixel(t){return Math.round(this._startValue+this.getDecimalForPixel(t)*this._valueRange)}getBasePixel(){return this.bottom}},LinearScale:xo,LogarithmicScale:ko,RadialLinearScale:Eo,TimeScale:No,TimeSeriesScale:class extends No{static id="timeseries";static defaults=No.defaults;constructor(t){super(t),this._table=[],this._minPos=void 0,this._tableRange=void 0}initOffsets(){const t=this._getTimestampsForTable(),e=this._table=this.buildLookupTable(t);this._minPos=Ho(e,this.min),this._tableRange=Ho(e,this.max)-this._minPos,super.initOffsets(t)}buildLookupTable(t){const{min:e,max:i}=this,s=[],n=[];let o,a,r,l,h;for(o=0,a=t.length;o<a;++o)l=t[o],l>=e&&l<=i&&s.push(l);if(s.length<2)return[{time:e,pos:0},{time:i,pos:1}];for(o=0,a=s.length;o<a;++o)h=s[o+1],r=s[o-1],l=s[o],Math.round((h+r)/2)!==l&&n.push({time:l,pos:o/(a-1)});return n}_generate(){const t=this.min,e=this.max;let i=super.getDataTimestamps();return i.includes(t)&&i.length||i.splice(0,0,t),i.includes(e)&&1!==i.length||i.push(e),i.sort(((t,e)=>t-e))}_getTimestampsForTable(){let t=this._cache.all||[];if(t.length)return t;const e=this.getDataTimestamps(),i=this.getLabelTimestamps();return t=e.length&&i.length?this.normalize(e.concat(i)):e.length?e:i,t=this._cache.all=t,t}getDecimalForValue(t){return(Ho(this._table,t)-this._minPos)/this._tableRange}getValueForPixel(t){const e=this._offsets,i=this.getDecimalForPixel(t)/e.factor-e.end;return Ho(this._table,i*this._tableRange+this._minPos,!0)}}});const $o=["rgb(54, 162, 235)","rgb(255, 99, 132)","rgb(255, 159, 64)","rgb(255, 205, 86)","rgb(75, 192, 192)","rgb(153, 102, 255)","rgb(201, 203, 207)"],Yo=$o.map((t=>t.replace("rgb(","rgba(").replace(")",", 0.5)")));function Uo(t){return $o[t%$o.length]}function Xo(t){return Yo[t%Yo.length]}function qo(t){let e=0;return(i,s)=>{const n=t.getDatasetMeta(s).controller;n instanceof jn?e=function(t,e){return t.backgroundColor=t.data.map((()=>Uo(e++))),e}(i,e):n instanceof $n?e=function(t,e){return t.backgroundColor=t.data.map((()=>Xo(e++))),e}(i,e):n&&(e=function(t,e){return t.borderColor=Uo(e),t.backgroundColor=Xo(e),++e}(i,e))}}function Ko(t){let e;for(e in t)if(t[e].borderColor||t[e].backgroundColor)return!0;return!1}var Go={id:"colors",defaults:{enabled:!0,forceOverride:!1},beforeLayout(t,e,i){if(!i.enabled)return;const{data:{datasets:s},options:n}=t.config,{elements:o}=n;if(!i.forceOverride&&(Ko(s)||(a=n)&&(a.borderColor||a.backgroundColor)||o&&Ko(o)))return;var a;const r=qo(t);s.forEach(r)}};function Zo(t){if(t._decimated){const e=t._data;delete t._decimated,delete t._data,Object.defineProperty(t,"data",{configurable:!0,enumerable:!0,writable:!0,value:e})}}function Jo(t){t.data.datasets.forEach((t=>{Zo(t)}))}var Qo={id:"decimation",defaults:{algorithm:"min-max",enabled:!1},beforeElementsUpdate:(t,e,i)=>{if(!i.enabled)return void Jo(t);const n=t.width;t.data.datasets.forEach(((e,o)=>{const{_data:a,indexAxis:r}=e,l=t.getDatasetMeta(o),h=a||e.data;if("y"===Pi([r,t.options.indexAxis]))return;if(!l.controller.supportsDecimation)return;const c=t.scales[l.xAxisID];if("linear"!==c.type&&"time"!==c.type)return;if(t.options.parsing)return;let{start:d,count:u}=function(t,e){const i=e.length;let s,n=0;const{iScale:o}=t,{min:a,max:r,minDefined:l,maxDefined:h}=o.getUserBounds();return l&&(n=J(it(e,o.axis,a).lo,0,i-1)),s=h?J(it(e,o.axis,r).hi+1,n,i)-n:i-n,{start:n,count:s}}(l,h);if(u<=(i.threshold||4*n))return void Zo(e);let f;switch(s(a)&&(e._data=h,delete e.data,Object.defineProperty(e,"data",{configurable:!0,enumerable:!0,get:function(){return this._decimated},set:function(t){this._data=t}})),i.algorithm){case"lttb":f=function(t,e,i,s,n){const o=n.samples||s;if(o>=i)return t.slice(e,e+i);const a=[],r=(i-2)/(o-2);let l=0;const h=e+i-1;let c,d,u,f,g,p=e;for(a[l++]=t[p],c=0;c<o-2;c++){let s,n=0,o=0;const h=Math.floor((c+1)*r)+1+e,m=Math.min(Math.floor((c+2)*r)+1,i)+e,b=m-h;for(s=h;s<m;s++)n+=t[s].x,o+=t[s].y;n/=b,o/=b;const x=Math.floor(c*r)+1+e,_=Math.min(Math.floor((c+1)*r)+1,i)+e,{x:y,y:v}=t[p];for(u=f=-1,s=x;s<_;s++)f=.5*Math.abs((y-n)*(t[s].y-v)-(y-t[s].x)*(o-v)),f>u&&(u=f,d=t[s],g=s);a[l++]=d,p=g}return a[l++]=t[h],a}(h,d,u,n,i);break;case"min-max":f=function(t,e,i,n){let o,a,r,l,h,c,d,u,f,g,p=0,m=0;const b=[],x=e+i-1,_=t[e].x,y=t[x].x-_;for(o=e;o<e+i;++o){a=t[o],r=(a.x-_)/y*n,l=a.y;const e=0|r;if(e===h)l<f?(f=l,c=o):l>g&&(g=l,d=o),p=(m*p+a.x)/++m;else{const i=o-1;if(!s(c)&&!s(d)){const e=Math.min(c,d),s=Math.max(c,d);e!==u&&e!==i&&b.push({...t[e],x:p}),s!==u&&s!==i&&b.push({...t[s],x:p})}o>0&&i!==u&&b.push(t[i]),b.push(a),h=e,m=0,f=g=l,c=d=u=o}}return b}(h,d,u,n);break;default:throw new Error(`Unsupported decimation algorithm '${i.algorithm}'`)}e._decimated=f}))},destroy(t){Jo(t)}};function ta(t,e,i,s){if(s)return;let n=e[t],o=i[t];return"angle"===t&&(n=G(n),o=G(o)),{property:t,start:n,end:o}}function ea(t,e,i){for(;e>t;e--){const t=i[e];if(!isNaN(t.x)&&!isNaN(t.y))break}return e}function ia(t,e,i,s){return t&&e?s(t[i],e[i]):t?t[i]:e?e[i]:0}function sa(t,e){let i=[],s=!1;return n(t)?(s=!0,i=t):i=function(t,e){const{x:i=null,y:s=null}=t||{},n=e.points,o=[];return e.segments.forEach((({start:t,end:e})=>{e=ea(t,e,n);const a=n[t],r=n[e];null!==s?(o.push({x:a.x,y:s}),o.push({x:r.x,y:s})):null!==i&&(o.push({x:i,y:a.y}),o.push({x:i,y:r.y}))})),o}(t,e),i.length?new no({points:i,options:{tension:0},_loop:s,_fullLoop:s}):null}function na(t){return t&&!1!==t.fill}function oa(t,e,i){let s=t[e].fill;const n=[e];let o;if(!i)return s;for(;!1!==s&&-1===n.indexOf(s);){if(!a(s))return s;if(o=t[s],!o)return!1;if(o.visible)return s;n.push(s),s=o.fill}return!1}function aa(t,e,i){const s=function(t){const e=t.options,i=e.fill;let s=l(i&&i.target,i);void 0===s&&(s=!!e.backgroundColor);if(!1===s||null===s)return!1;if(!0===s)return"origin";return s}(t);if(o(s))return!isNaN(s.value)&&s;let n=parseFloat(s);return a(n)&&Math.floor(n)===n?function(t,e,i,s){"-"!==t&&"+"!==t||(i=e+i);if(i===e||i<0||i>=s)return!1;return i}(s[0],e,n,i):["origin","start","end","stack","shape"].indexOf(s)>=0&&s}function ra(t,e,i){const s=[];for(let n=0;n<i.length;n++){const o=i[n],{first:a,last:r,point:l}=la(o,e,"x");if(!(!l||a&&r))if(a)s.unshift(l);else if(t.push(l),!r)break}t.push(...s)}function la(t,e,i){const s=t.interpolate(e,i);if(!s)return{};const n=s[i],o=t.segments,a=t.points;let r=!1,l=!1;for(let t=0;t<o.length;t++){const e=o[t],s=a[e.start][i],h=a[e.end][i];if(tt(n,s,h)){r=n===s,l=n===h;break}}return{first:r,last:l,point:s}}class ha{constructor(t){this.x=t.x,this.y=t.y,this.radius=t.radius}pathSegment(t,e,i){const{x:s,y:n,radius:o}=this;return e=e||{start:0,end:O},t.arc(s,n,o,e.end,e.start,!0),!i.bounds}interpolate(t){const{x:e,y:i,radius:s}=this,n=t.angle;return{x:e+Math.cos(n)*s,y:i+Math.sin(n)*s,angle:n}}}function ca(t){const{chart:e,fill:i,line:s}=t;if(a(i))return function(t,e){const i=t.getDatasetMeta(e),s=i&&t.isDatasetVisible(e);return s?i.dataset:null}(e,i);if("stack"===i)return function(t){const{scale:e,index:i,line:s}=t,n=[],o=s.segments,a=s.points,r=function(t,e){const i=[],s=t.getMatchingVisibleMetas("line");for(let t=0;t<s.length;t++){const n=s[t];if(n.index===e)break;n.hidden||i.unshift(n.dataset)}return i}(e,i);r.push(sa({x:null,y:e.bottom},s));for(let t=0;t<o.length;t++){const e=o[t];for(let t=e.start;t<=e.end;t++)ra(n,a[t],r)}return new no({points:n,options:{}})}(t);if("shape"===i)return!0;const n=function(t){const e=t.scale||{};if(e.getPointPositionForValue)return function(t){const{scale:e,fill:i}=t,s=e.options,n=e.getLabels().length,a=s.reverse?e.max:e.min,r=function(t,e,i){let s;return s="start"===t?i:"end"===t?e.options.reverse?e.min:e.max:o(t)?t.value:e.getBaseValue(),s}(i,e,a),l=[];if(s.grid.circular){const t=e.getPointPositionForValue(0,a);return new ha({x:t.x,y:t.y,radius:e.getDistanceFromCenterForValue(r)})}for(let t=0;t<n;++t)l.push(e.getPointPositionForValue(t,r));return l}(t);return function(t){const{scale:e={},fill:i}=t,s=function(t,e){let i=null;return"start"===t?i=e.bottom:"end"===t?i=e.top:o(t)?i=e.getPixelForValue(t.value):e.getBasePixel&&(i=e.getBasePixel()),i}(i,e);if(a(s)){const t=e.isHorizontal();return{x:t?s:null,y:t?null:s}}return null}(t)}(t);return n instanceof ha?n:sa(n,s)}function da(t,e,i){const s=ca(e),{line:n,scale:o,axis:a}=e,r=n.options,l=r.fill,h=r.backgroundColor,{above:c=h,below:d=h}=l||{};s&&n.points.length&&(Ie(t,i),function(t,e){const{line:i,target:s,above:n,below:o,area:a,scale:r}=e,l=i._loop?"angle":e.axis;t.save(),"x"===l&&o!==n&&(ua(t,s,a.top),fa(t,{line:i,target:s,color:n,scale:r,property:l}),t.restore(),t.save(),ua(t,s,a.bottom));fa(t,{line:i,target:s,color:o,scale:r,property:l}),t.restore()}(t,{line:n,target:s,above:c,below:d,area:i,scale:o,axis:a}),ze(t))}function ua(t,e,i){const{segments:s,points:n}=e;let o=!0,a=!1;t.beginPath();for(const r of s){const{start:s,end:l}=r,h=n[s],c=n[ea(s,l,n)];o?(t.moveTo(h.x,h.y),o=!1):(t.lineTo(h.x,i),t.lineTo(h.x,h.y)),a=!!e.pathSegment(t,r,{move:a}),a?t.closePath():t.lineTo(c.x,i)}t.lineTo(e.first().x,i),t.closePath(),t.clip()}function fa(t,e){const{line:i,target:s,property:n,color:o,scale:a}=e,r=function(t,e,i){const s=t.segments,n=t.points,o=e.points,a=[];for(const t of s){let{start:s,end:r}=t;r=ea(s,r,n);const l=ta(i,n[s],n[r],t.loop);if(!e.segments){a.push({source:t,target:l,start:n[s],end:n[r]});continue}const h=Ii(e,l);for(const e of h){const s=ta(i,o[e.start],o[e.end],e.loop),r=Ri(t,n,s);for(const t of r)a.push({source:t,target:e,start:{[i]:ia(l,s,"start",Math.max)},end:{[i]:ia(l,s,"end",Math.min)}})}}return a}(i,s,n);for(const{source:e,target:l,start:h,end:c}of r){const{style:{backgroundColor:r=o}={}}=e,d=!0!==s;t.save(),t.fillStyle=r,ga(t,a,d&&ta(n,h,c)),t.beginPath();const u=!!i.pathSegment(t,e);let f;if(d){u?t.closePath():pa(t,s,c,n);const e=!!s.pathSegment(t,l,{move:u,reverse:!0});f=u&&e,f||pa(t,s,h,n)}t.closePath(),t.fill(f?"evenodd":"nonzero"),t.restore()}}function ga(t,e,i){const{top:s,bottom:n}=e.chart.chartArea,{property:o,start:a,end:r}=i||{};"x"===o&&(t.beginPath(),t.rect(a,s,r-a,n-s),t.clip())}function pa(t,e,i,s){const n=e.interpolate(i,s);n&&t.lineTo(n.x,n.y)}var ma={id:"filler",afterDatasetsUpdate(t,e,i){const s=(t.data.datasets||[]).length,n=[];let o,a,r,l;for(a=0;a<s;++a)o=t.getDatasetMeta(a),r=o.dataset,l=null,r&&r.options&&r instanceof no&&(l={visible:t.isDatasetVisible(a),index:a,fill:aa(r,a,s),chart:t,axis:o.controller.options.indexAxis,scale:o.vScale,line:r}),o.$filler=l,n.push(l);for(a=0;a<s;++a)l=n[a],l&&!1!==l.fill&&(l.fill=oa(n,a,i.propagate))},beforeDraw(t,e,i){const s="beforeDraw"===i.drawTime,n=t.getSortedVisibleDatasetMetas(),o=t.chartArea;for(let e=n.length-1;e>=0;--e){const i=n[e].$filler;i&&(i.line.updateControlPoints(o,i.axis),s&&i.fill&&da(t.ctx,i,o))}},beforeDatasetsDraw(t,e,i){if("beforeDatasetsDraw"!==i.drawTime)return;const s=t.getSortedVisibleDatasetMetas();for(let e=s.length-1;e>=0;--e){const i=s[e].$filler;na(i)&&da(t.ctx,i,t.chartArea)}},beforeDatasetDraw(t,e,i){const s=e.meta.$filler;na(s)&&"beforeDatasetDraw"===i.drawTime&&da(t.ctx,s,t.chartArea)},defaults:{propagate:!0,drawTime:"beforeDatasetDraw"}};const ba=(t,e)=>{let{boxHeight:i=e,boxWidth:s=e}=t;return t.usePointStyle&&(i=Math.min(i,e),s=t.pointStyleWidth||Math.min(s,e)),{boxWidth:s,boxHeight:i,itemHeight:Math.max(e,i)}};class xa extends Hs{constructor(t){super(),this._added=!1,this.legendHitBoxes=[],this._hoveredItem=null,this.doughnutMode=!1,this.chart=t.chart,this.options=t.options,this.ctx=t.ctx,this.legendItems=void 0,this.columnSizes=void 0,this.lineWidths=void 0,this.maxHeight=void 0,this.maxWidth=void 0,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.height=void 0,this.width=void 0,this._margins=void 0,this.position=void 0,this.weight=void 0,this.fullSize=void 0}update(t,e,i){this.maxWidth=t,this.maxHeight=e,this._margins=i,this.setDimensions(),this.buildLabels(),this.fit()}setDimensions(){this.isHorizontal()?(this.width=this.maxWidth,this.left=this._margins.left,this.right=this.width):(this.height=this.maxHeight,this.top=this._margins.top,this.bottom=this.height)}buildLabels(){const t=this.options.labels||{};let e=d(t.generateLabels,[this.chart],this)||[];t.filter&&(e=e.filter((e=>t.filter(e,this.chart.data)))),t.sort&&(e=e.sort(((e,i)=>t.sort(e,i,this.chart.data)))),this.options.reverse&&e.reverse(),this.legendItems=e}fit(){const{options:t,ctx:e}=this;if(!t.display)return void(this.width=this.height=0);const i=t.labels,s=Si(i.font),n=s.size,o=this._computeTitleHeight(),{boxWidth:a,itemHeight:r}=ba(i,n);let l,h;e.font=s.string,this.isHorizontal()?(l=this.maxWidth,h=this._fitRows(o,n,a,r)+10):(h=this.maxHeight,l=this._fitCols(o,s,a,r)+10),this.width=Math.min(l,t.maxWidth||this.maxWidth),this.height=Math.min(h,t.maxHeight||this.maxHeight)}_fitRows(t,e,i,s){const{ctx:n,maxWidth:o,options:{labels:{padding:a}}}=this,r=this.legendHitBoxes=[],l=this.lineWidths=[0],h=s+a;let c=t;n.textAlign="left",n.textBaseline="middle";let d=-1,u=-h;return this.legendItems.forEach(((t,f)=>{const g=i+e/2+n.measureText(t.text).width;(0===f||l[l.length-1]+g+2*a>o)&&(c+=h,l[l.length-(f>0?0:1)]=0,u+=h,d++),r[f]={left:0,top:u,row:d,width:g,height:s},l[l.length-1]+=g+a})),c}_fitCols(t,e,i,s){const{ctx:n,maxHeight:o,options:{labels:{padding:a}}}=this,r=this.legendHitBoxes=[],l=this.columnSizes=[],h=o-t;let c=a,d=0,u=0,f=0,g=0;return this.legendItems.forEach(((t,o)=>{const{itemWidth:p,itemHeight:m}=function(t,e,i,s,n){const o=function(t,e,i,s){let n=t.text;n&&"string"!=typeof n&&(n=n.reduce(((t,e)=>t.length>e.length?t:e)));return e+i.size/2+s.measureText(n).width}(s,t,e,i),a=function(t,e,i){let s=t;"string"!=typeof e.text&&(s=_a(e,i));return s}(n,s,e.lineHeight);return{itemWidth:o,itemHeight:a}}(i,e,n,t,s);o>0&&u+m+2*a>h&&(c+=d+a,l.push({width:d,height:u}),f+=d+a,g++,d=u=0),r[o]={left:f,top:u,col:g,width:p,height:m},d=Math.max(d,p),u+=m+a})),c+=d,l.push({width:d,height:u}),c}adjustHitBoxes(){if(!this.options.display)return;const t=this._computeTitleHeight(),{legendHitBoxes:e,options:{align:i,labels:{padding:s},rtl:n}}=this,o=Oi(n,this.left,this.width);if(this.isHorizontal()){let n=0,a=ft(i,this.left+s,this.right-this.lineWidths[n]);for(const r of e)n!==r.row&&(n=r.row,a=ft(i,this.left+s,this.right-this.lineWidths[n])),r.top+=this.top+t+s,r.left=o.leftForLtr(o.x(a),r.width),a+=r.width+s}else{let n=0,a=ft(i,this.top+t+s,this.bottom-this.columnSizes[n].height);for(const r of e)r.col!==n&&(n=r.col,a=ft(i,this.top+t+s,this.bottom-this.columnSizes[n].height)),r.top=a,r.left+=this.left+s,r.left=o.leftForLtr(o.x(r.left),r.width),a+=r.height+s}}isHorizontal(){return"top"===this.options.position||"bottom"===this.options.position}draw(){if(this.options.display){const t=this.ctx;Ie(t,this),this._draw(),ze(t)}}_draw(){const{options:t,columnSizes:e,lineWidths:i,ctx:s}=this,{align:n,labels:o}=t,a=ue.color,r=Oi(t.rtl,this.left,this.width),h=Si(o.font),{padding:c}=o,d=h.size,u=d/2;let f;this.drawTitle(),s.textAlign=r.textAlign("left"),s.textBaseline="middle",s.lineWidth=.5,s.font=h.string;const{boxWidth:g,boxHeight:p,itemHeight:m}=ba(o,d),b=this.isHorizontal(),x=this._computeTitleHeight();f=b?{x:ft(n,this.left+c,this.right-i[0]),y:this.top+c+x,line:0}:{x:this.left+c,y:ft(n,this.top+x+c,this.bottom-e[0].height),line:0},Ai(this.ctx,t.textDirection);const _=m+c;this.legendItems.forEach(((y,v)=>{s.strokeStyle=y.fontColor,s.fillStyle=y.fontColor;const M=s.measureText(y.text).width,w=r.textAlign(y.textAlign||(y.textAlign=o.textAlign)),k=g+u+M;let S=f.x,P=f.y;r.setWidth(this.width),b?v>0&&S+k+c>this.right&&(P=f.y+=_,f.line++,S=f.x=ft(n,this.left+c,this.right-i[f.line])):v>0&&P+_>this.bottom&&(S=f.x=S+e[f.line].width+c,f.line++,P=f.y=ft(n,this.top+x+c,this.bottom-e[f.line].height));if(function(t,e,i){if(isNaN(g)||g<=0||isNaN(p)||p<0)return;s.save();const n=l(i.lineWidth,1);if(s.fillStyle=l(i.fillStyle,a),s.lineCap=l(i.lineCap,"butt"),s.lineDashOffset=l(i.lineDashOffset,0),s.lineJoin=l(i.lineJoin,"miter"),s.lineWidth=n,s.strokeStyle=l(i.strokeStyle,a),s.setLineDash(l(i.lineDash,[])),o.usePointStyle){const a={radius:p*Math.SQRT2/2,pointStyle:i.pointStyle,rotation:i.rotation,borderWidth:n},l=r.xPlus(t,g/2);Ee(s,a,l,e+u,o.pointStyleWidth&&g)}else{const o=e+Math.max((d-p)/2,0),a=r.leftForLtr(t,g),l=wi(i.borderRadius);s.beginPath(),Object.values(l).some((t=>0!==t))?He(s,{x:a,y:o,w:g,h:p,radius:l}):s.rect(a,o,g,p),s.fill(),0!==n&&s.stroke()}s.restore()}(r.x(S),P,y),S=gt(w,S+g+u,b?S+k:this.right,t.rtl),function(t,e,i){Ne(s,i.text,t,e+m/2,h,{strikethrough:i.hidden,textAlign:r.textAlign(i.textAlign)})}(r.x(S),P,y),b)f.x+=k+c;else if("string"!=typeof y.text){const t=h.lineHeight;f.y+=_a(y,t)+c}else f.y+=_})),Ti(this.ctx,t.textDirection)}drawTitle(){const t=this.options,e=t.title,i=Si(e.font),s=ki(e.padding);if(!e.display)return;const n=Oi(t.rtl,this.left,this.width),o=this.ctx,a=e.position,r=i.size/2,l=s.top+r;let h,c=this.left,d=this.width;if(this.isHorizontal())d=Math.max(...this.lineWidths),h=this.top+l,c=ft(t.align,c,this.right-d);else{const e=this.columnSizes.reduce(((t,e)=>Math.max(t,e.height)),0);h=l+ft(t.align,this.top,this.bottom-e-t.labels.padding-this._computeTitleHeight())}const u=ft(a,c,c+d);o.textAlign=n.textAlign(ut(a)),o.textBaseline="middle",o.strokeStyle=e.color,o.fillStyle=e.color,o.font=i.string,Ne(o,e.text,u,h,i)}_computeTitleHeight(){const t=this.options.title,e=Si(t.font),i=ki(t.padding);return t.display?e.lineHeight+i.height:0}_getLegendItemAt(t,e){let i,s,n;if(tt(t,this.left,this.right)&&tt(e,this.top,this.bottom))for(n=this.legendHitBoxes,i=0;i<n.length;++i)if(s=n[i],tt(t,s.left,s.left+s.width)&&tt(e,s.top,s.top+s.height))return this.legendItems[i];return null}handleEvent(t){const e=this.options;if(!function(t,e){if(("mousemove"===t||"mouseout"===t)&&(e.onHover||e.onLeave))return!0;if(e.onClick&&("click"===t||"mouseup"===t))return!0;return!1}(t.type,e))return;const i=this._getLegendItemAt(t.x,t.y);if("mousemove"===t.type||"mouseout"===t.type){const o=this._hoveredItem,a=(n=i,null!==(s=o)&&null!==n&&s.datasetIndex===n.datasetIndex&&s.index===n.index);o&&!a&&d(e.onLeave,[t,o,this],this),this._hoveredItem=i,i&&!a&&d(e.onHover,[t,i,this],this)}else i&&d(e.onClick,[t,i,this],this);var s,n}}function _a(t,e){return e*(t.text?t.text.length:0)}var ya={id:"legend",_element:xa,start(t,e,i){const s=t.legend=new xa({ctx:t.ctx,options:i,chart:t});as.configure(t,s,i),as.addBox(t,s)},stop(t){as.removeBox(t,t.legend),delete t.legend},beforeUpdate(t,e,i){const s=t.legend;as.configure(t,s,i),s.options=i},afterUpdate(t){const e=t.legend;e.buildLabels(),e.adjustHitBoxes()},afterEvent(t,e){e.replay||t.legend.handleEvent(e.event)},defaults:{display:!0,position:"top",align:"center",fullSize:!0,reverse:!1,weight:1e3,onClick(t,e,i){const s=e.datasetIndex,n=i.chart;n.isDatasetVisible(s)?(n.hide(s),e.hidden=!0):(n.show(s),e.hidden=!1)},onHover:null,onLeave:null,labels:{color:t=>t.chart.options.color,boxWidth:40,padding:10,generateLabels(t){const e=t.data.datasets,{labels:{usePointStyle:i,pointStyle:s,textAlign:n,color:o,useBorderRadius:a,borderRadius:r}}=t.legend.options;return t._getSortedDatasetMetas().map((t=>{const l=t.controller.getStyle(i?0:void 0),h=ki(l.borderWidth);return{text:e[t.index].label,fillStyle:l.backgroundColor,fontColor:o,hidden:!t.visible,lineCap:l.borderCapStyle,lineDash:l.borderDash,lineDashOffset:l.borderDashOffset,lineJoin:l.borderJoinStyle,lineWidth:(h.width+h.height)/4,strokeStyle:l.borderColor,pointStyle:s||l.pointStyle,rotation:l.rotation,textAlign:n||l.textAlign,borderRadius:a&&(r||l.borderRadius),datasetIndex:t.index}}),this)}},title:{color:t=>t.chart.options.color,display:!1,position:"center",text:""}},descriptors:{_scriptable:t=>!t.startsWith("on"),labels:{_scriptable:t=>!["generateLabels","filter","sort"].includes(t)}}};class va extends Hs{constructor(t){super(),this.chart=t.chart,this.options=t.options,this.ctx=t.ctx,this._padding=void 0,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.width=void 0,this.height=void 0,this.position=void 0,this.weight=void 0,this.fullSize=void 0}update(t,e){const i=this.options;if(this.left=0,this.top=0,!i.display)return void(this.width=this.height=this.right=this.bottom=0);this.width=this.right=t,this.height=this.bottom=e;const s=n(i.text)?i.text.length:1;this._padding=ki(i.padding);const o=s*Si(i.font).lineHeight+this._padding.height;this.isHorizontal()?this.height=o:this.width=o}isHorizontal(){const t=this.options.position;return"top"===t||"bottom"===t}_drawArgs(t){const{top:e,left:i,bottom:s,right:n,options:o}=this,a=o.align;let r,l,h,c=0;return this.isHorizontal()?(l=ft(a,i,n),h=e+t,r=n-i):("left"===o.position?(l=i+t,h=ft(a,s,e),c=-.5*C):(l=n-t,h=ft(a,e,s),c=.5*C),r=s-e),{titleX:l,titleY:h,maxWidth:r,rotation:c}}draw(){const t=this.ctx,e=this.options;if(!e.display)return;const i=Si(e.font),s=i.lineHeight/2+this._padding.top,{titleX:n,titleY:o,maxWidth:a,rotation:r}=this._drawArgs(s);Ne(t,e.text,0,0,i,{color:e.color,maxWidth:a,rotation:r,textAlign:ut(e.align),textBaseline:"middle",translation:[n,o]})}}var Ma={id:"title",_element:va,start(t,e,i){!function(t,e){const i=new va({ctx:t.ctx,options:e,chart:t});as.configure(t,i,e),as.addBox(t,i),t.titleBlock=i}(t,i)},stop(t){const e=t.titleBlock;as.removeBox(t,e),delete t.titleBlock},beforeUpdate(t,e,i){const s=t.titleBlock;as.configure(t,s,i),s.options=i},defaults:{align:"center",display:!1,font:{weight:"bold"},fullSize:!0,padding:10,position:"top",text:"",weight:2e3},defaultRoutes:{color:"color"},descriptors:{_scriptable:!0,_indexable:!1}};const wa=new WeakMap;var ka={id:"subtitle",start(t,e,i){const s=new va({ctx:t.ctx,options:i,chart:t});as.configure(t,s,i),as.addBox(t,s),wa.set(t,s)},stop(t){as.removeBox(t,wa.get(t)),wa.delete(t)},beforeUpdate(t,e,i){const s=wa.get(t);as.configure(t,s,i),s.options=i},defaults:{align:"center",display:!1,font:{weight:"normal"},fullSize:!0,padding:0,position:"top",text:"",weight:1500},defaultRoutes:{color:"color"},descriptors:{_scriptable:!0,_indexable:!1}};const Sa={average(t){if(!t.length)return!1;let e,i,s=0,n=0,o=0;for(e=0,i=t.length;e<i;++e){const i=t[e].element;if(i&&i.hasValue()){const t=i.tooltipPosition();s+=t.x,n+=t.y,++o}}return{x:s/o,y:n/o}},nearest(t,e){if(!t.length)return!1;let i,s,n,o=e.x,a=e.y,r=Number.POSITIVE_INFINITY;for(i=0,s=t.length;i<s;++i){const s=t[i].element;if(s&&s.hasValue()){const t=q(e,s.getCenterPoint());t<r&&(r=t,n=s)}}if(n){const t=n.tooltipPosition();o=t.x,a=t.y}return{x:o,y:a}}};function Pa(t,e){return e&&(n(e)?Array.prototype.push.apply(t,e):t.push(e)),t}function Da(t){return("string"==typeof t||t instanceof String)&&t.indexOf("\n")>-1?t.split("\n"):t}function Ca(t,e){const{element:i,datasetIndex:s,index:n}=e,o=t.getDatasetMeta(s).controller,{label:a,value:r}=o.getLabelAndValue(n);return{chart:t,label:a,parsed:o.getParsed(n),raw:t.data.datasets[s].data[n],formattedValue:r,dataset:o.getDataset(),dataIndex:n,datasetIndex:s,element:i}}function Oa(t,e){const i=t.chart.ctx,{body:s,footer:n,title:o}=t,{boxWidth:a,boxHeight:r}=e,l=Si(e.bodyFont),h=Si(e.titleFont),c=Si(e.footerFont),d=o.length,f=n.length,g=s.length,p=ki(e.padding);let m=p.height,b=0,x=s.reduce(((t,e)=>t+e.before.length+e.lines.length+e.after.length),0);if(x+=t.beforeBody.length+t.afterBody.length,d&&(m+=d*h.lineHeight+(d-1)*e.titleSpacing+e.titleMarginBottom),x){m+=g*(e.displayColors?Math.max(r,l.lineHeight):l.lineHeight)+(x-g)*l.lineHeight+(x-1)*e.bodySpacing}f&&(m+=e.footerMarginTop+f*c.lineHeight+(f-1)*e.footerSpacing);let _=0;const y=function(t){b=Math.max(b,i.measureText(t).width+_)};return i.save(),i.font=h.string,u(t.title,y),i.font=l.string,u(t.beforeBody.concat(t.afterBody),y),_=e.displayColors?a+2+e.boxPadding:0,u(s,(t=>{u(t.before,y),u(t.lines,y),u(t.after,y)})),_=0,i.font=c.string,u(t.footer,y),i.restore(),b+=p.width,{width:b,height:m}}function Aa(t,e,i,s){const{x:n,width:o}=i,{width:a,chartArea:{left:r,right:l}}=t;let h="center";return"center"===s?h=n<=(r+l)/2?"left":"right":n<=o/2?h="left":n>=a-o/2&&(h="right"),function(t,e,i,s){const{x:n,width:o}=s,a=i.caretSize+i.caretPadding;return"left"===t&&n+o+a>e.width||"right"===t&&n-o-a<0||void 0}(h,t,e,i)&&(h="center"),h}function Ta(t,e,i){const s=i.yAlign||e.yAlign||function(t,e){const{y:i,height:s}=e;return i<s/2?"top":i>t.height-s/2?"bottom":"center"}(t,i);return{xAlign:i.xAlign||e.xAlign||Aa(t,e,i,s),yAlign:s}}function La(t,e,i,s){const{caretSize:n,caretPadding:o,cornerRadius:a}=t,{xAlign:r,yAlign:l}=i,h=n+o,{topLeft:c,topRight:d,bottomLeft:u,bottomRight:f}=wi(a);let g=function(t,e){let{x:i,width:s}=t;return"right"===e?i-=s:"center"===e&&(i-=s/2),i}(e,r);const p=function(t,e,i){let{y:s,height:n}=t;return"top"===e?s+=i:s-="bottom"===e?n+i:n/2,s}(e,l,h);return"center"===l?"left"===r?g+=h:"right"===r&&(g-=h):"left"===r?g-=Math.max(c,u)+n:"right"===r&&(g+=Math.max(d,f)+n),{x:J(g,0,s.width-e.width),y:J(p,0,s.height-e.height)}}function Ea(t,e,i){const s=ki(i.padding);return"center"===e?t.x+t.width/2:"right"===e?t.x+t.width-s.right:t.x+s.left}function Ra(t){return Pa([],Da(t))}function Ia(t,e){const i=e&&e.dataset&&e.dataset.tooltip&&e.dataset.tooltip.callbacks;return i?t.override(i):t}const za={beforeTitle:e,title(t){if(t.length>0){const e=t[0],i=e.chart.data.labels,s=i?i.length:0;if(this&&this.options&&"dataset"===this.options.mode)return e.dataset.label||"";if(e.label)return e.label;if(s>0&&e.dataIndex<s)return i[e.dataIndex]}return""},afterTitle:e,beforeBody:e,beforeLabel:e,label(t){if(this&&this.options&&"dataset"===this.options.mode)return t.label+": "+t.formattedValue||t.formattedValue;let e=t.dataset.label||"";e&&(e+=": ");const i=t.formattedValue;return s(i)||(e+=i),e},labelColor(t){const e=t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);return{borderColor:e.borderColor,backgroundColor:e.backgroundColor,borderWidth:e.borderWidth,borderDash:e.borderDash,borderDashOffset:e.borderDashOffset,borderRadius:0}},labelTextColor(){return this.options.bodyColor},labelPointStyle(t){const e=t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);return{pointStyle:e.pointStyle,rotation:e.rotation}},afterLabel:e,afterBody:e,beforeFooter:e,footer:e,afterFooter:e};function Fa(t,e,i,s){const n=t[e].call(i,s);return void 0===n?za[e].call(i,s):n}class Va extends Hs{static positioners=Sa;constructor(t){super(),this.opacity=0,this._active=[],this._eventPosition=void 0,this._size=void 0,this._cachedAnimations=void 0,this._tooltipItems=[],this.$animations=void 0,this.$context=void 0,this.chart=t.chart,this.options=t.options,this.dataPoints=void 0,this.title=void 0,this.beforeBody=void 0,this.body=void 0,this.afterBody=void 0,this.footer=void 0,this.xAlign=void 0,this.yAlign=void 0,this.x=void 0,this.y=void 0,this.height=void 0,this.width=void 0,this.caretX=void 0,this.caretY=void 0,this.labelColors=void 0,this.labelPointStyles=void 0,this.labelTextColors=void 0}initialize(t){this.options=t,this._cachedAnimations=void 0,this.$context=void 0}_resolveAnimations(){const t=this._cachedAnimations;if(t)return t;const e=this.chart,i=this.options.setContext(this.getContext()),s=i.enabled&&e.options.animation&&i.animations,n=new Os(this.chart,s);return s._cacheable&&(this._cachedAnimations=Object.freeze(n)),n}getContext(){return this.$context||(this.$context=(t=this.chart.getContext(),e=this,i=this._tooltipItems,Ci(t,{tooltip:e,tooltipItems:i,type:"tooltip"})));var t,e,i}getTitle(t,e){const{callbacks:i}=e,s=Fa(i,"beforeTitle",this,t),n=Fa(i,"title",this,t),o=Fa(i,"afterTitle",this,t);let a=[];return a=Pa(a,Da(s)),a=Pa(a,Da(n)),a=Pa(a,Da(o)),a}getBeforeBody(t,e){return Ra(Fa(e.callbacks,"beforeBody",this,t))}getBody(t,e){const{callbacks:i}=e,s=[];return u(t,(t=>{const e={before:[],lines:[],after:[]},n=Ia(i,t);Pa(e.before,Da(Fa(n,"beforeLabel",this,t))),Pa(e.lines,Fa(n,"label",this,t)),Pa(e.after,Da(Fa(n,"afterLabel",this,t))),s.push(e)})),s}getAfterBody(t,e){return Ra(Fa(e.callbacks,"afterBody",this,t))}getFooter(t,e){const{callbacks:i}=e,s=Fa(i,"beforeFooter",this,t),n=Fa(i,"footer",this,t),o=Fa(i,"afterFooter",this,t);let a=[];return a=Pa(a,Da(s)),a=Pa(a,Da(n)),a=Pa(a,Da(o)),a}_createItems(t){const e=this._active,i=this.chart.data,s=[],n=[],o=[];let a,r,l=[];for(a=0,r=e.length;a<r;++a)l.push(Ca(this.chart,e[a]));return t.filter&&(l=l.filter(((e,s,n)=>t.filter(e,s,n,i)))),t.itemSort&&(l=l.sort(((e,s)=>t.itemSort(e,s,i)))),u(l,(e=>{const i=Ia(t.callbacks,e);s.push(Fa(i,"labelColor",this,e)),n.push(Fa(i,"labelPointStyle",this,e)),o.push(Fa(i,"labelTextColor",this,e))})),this.labelColors=s,this.labelPointStyles=n,this.labelTextColors=o,this.dataPoints=l,l}update(t,e){const i=this.options.setContext(this.getContext()),s=this._active;let n,o=[];if(s.length){const t=Sa[i.position].call(this,s,this._eventPosition);o=this._createItems(i),this.title=this.getTitle(o,i),this.beforeBody=this.getBeforeBody(o,i),this.body=this.getBody(o,i),this.afterBody=this.getAfterBody(o,i),this.footer=this.getFooter(o,i);const e=this._size=Oa(this,i),a=Object.assign({},t,e),r=Ta(this.chart,i,a),l=La(i,a,r,this.chart);this.xAlign=r.xAlign,this.yAlign=r.yAlign,n={opacity:1,x:l.x,y:l.y,width:e.width,height:e.height,caretX:t.x,caretY:t.y}}else 0!==this.opacity&&(n={opacity:0});this._tooltipItems=o,this.$context=void 0,n&&this._resolveAnimations().update(this,n),t&&i.external&&i.external.call(this,{chart:this.chart,tooltip:this,replay:e})}drawCaret(t,e,i,s){const n=this.getCaretPosition(t,i,s);e.lineTo(n.x1,n.y1),e.lineTo(n.x2,n.y2),e.lineTo(n.x3,n.y3)}getCaretPosition(t,e,i){const{xAlign:s,yAlign:n}=this,{caretSize:o,cornerRadius:a}=i,{topLeft:r,topRight:l,bottomLeft:h,bottomRight:c}=wi(a),{x:d,y:u}=t,{width:f,height:g}=e;let p,m,b,x,_,y;return"center"===n?(_=u+g/2,"left"===s?(p=d,m=p-o,x=_+o,y=_-o):(p=d+f,m=p+o,x=_-o,y=_+o),b=p):(m="left"===s?d+Math.max(r,h)+o:"right"===s?d+f-Math.max(l,c)-o:this.caretX,"top"===n?(x=u,_=x-o,p=m-o,b=m+o):(x=u+g,_=x+o,p=m+o,b=m-o),y=x),{x1:p,x2:m,x3:b,y1:x,y2:_,y3:y}}drawTitle(t,e,i){const s=this.title,n=s.length;let o,a,r;if(n){const l=Oi(i.rtl,this.x,this.width);for(t.x=Ea(this,i.titleAlign,i),e.textAlign=l.textAlign(i.titleAlign),e.textBaseline="middle",o=Si(i.titleFont),a=i.titleSpacing,e.fillStyle=i.titleColor,e.font=o.string,r=0;r<n;++r)e.fillText(s[r],l.x(t.x),t.y+o.lineHeight/2),t.y+=o.lineHeight+a,r+1===n&&(t.y+=i.titleMarginBottom-a)}}_drawColorBox(t,e,i,s,n){const a=this.labelColors[i],r=this.labelPointStyles[i],{boxHeight:l,boxWidth:h}=n,c=Si(n.bodyFont),d=Ea(this,"left",n),u=s.x(d),f=l<c.lineHeight?(c.lineHeight-l)/2:0,g=e.y+f;if(n.usePointStyle){const e={radius:Math.min(h,l)/2,pointStyle:r.pointStyle,rotation:r.rotation,borderWidth:1},i=s.leftForLtr(u,h)+h/2,o=g+l/2;t.strokeStyle=n.multiKeyBackground,t.fillStyle=n.multiKeyBackground,Le(t,e,i,o),t.strokeStyle=a.borderColor,t.fillStyle=a.backgroundColor,Le(t,e,i,o)}else{t.lineWidth=o(a.borderWidth)?Math.max(...Object.values(a.borderWidth)):a.borderWidth||1,t.strokeStyle=a.borderColor,t.setLineDash(a.borderDash||[]),t.lineDashOffset=a.borderDashOffset||0;const e=s.leftForLtr(u,h),i=s.leftForLtr(s.xPlus(u,1),h-2),r=wi(a.borderRadius);Object.values(r).some((t=>0!==t))?(t.beginPath(),t.fillStyle=n.multiKeyBackground,He(t,{x:e,y:g,w:h,h:l,radius:r}),t.fill(),t.stroke(),t.fillStyle=a.backgroundColor,t.beginPath(),He(t,{x:i,y:g+1,w:h-2,h:l-2,radius:r}),t.fill()):(t.fillStyle=n.multiKeyBackground,t.fillRect(e,g,h,l),t.strokeRect(e,g,h,l),t.fillStyle=a.backgroundColor,t.fillRect(i,g+1,h-2,l-2))}t.fillStyle=this.labelTextColors[i]}drawBody(t,e,i){const{body:s}=this,{bodySpacing:n,bodyAlign:o,displayColors:a,boxHeight:r,boxWidth:l,boxPadding:h}=i,c=Si(i.bodyFont);let d=c.lineHeight,f=0;const g=Oi(i.rtl,this.x,this.width),p=function(i){e.fillText(i,g.x(t.x+f),t.y+d/2),t.y+=d+n},m=g.textAlign(o);let b,x,_,y,v,M,w;for(e.textAlign=o,e.textBaseline="middle",e.font=c.string,t.x=Ea(this,m,i),e.fillStyle=i.bodyColor,u(this.beforeBody,p),f=a&&"right"!==m?"center"===o?l/2+h:l+2+h:0,y=0,M=s.length;y<M;++y){for(b=s[y],x=this.labelTextColors[y],e.fillStyle=x,u(b.before,p),_=b.lines,a&&_.length&&(this._drawColorBox(e,t,y,g,i),d=Math.max(c.lineHeight,r)),v=0,w=_.length;v<w;++v)p(_[v]),d=c.lineHeight;u(b.after,p)}f=0,d=c.lineHeight,u(this.afterBody,p),t.y-=n}drawFooter(t,e,i){const s=this.footer,n=s.length;let o,a;if(n){const r=Oi(i.rtl,this.x,this.width);for(t.x=Ea(this,i.footerAlign,i),t.y+=i.footerMarginTop,e.textAlign=r.textAlign(i.footerAlign),e.textBaseline="middle",o=Si(i.footerFont),e.fillStyle=i.footerColor,e.font=o.string,a=0;a<n;++a)e.fillText(s[a],r.x(t.x),t.y+o.lineHeight/2),t.y+=o.lineHeight+i.footerSpacing}}drawBackground(t,e,i,s){const{xAlign:n,yAlign:o}=this,{x:a,y:r}=t,{width:l,height:h}=i,{topLeft:c,topRight:d,bottomLeft:u,bottomRight:f}=wi(s.cornerRadius);e.fillStyle=s.backgroundColor,e.strokeStyle=s.borderColor,e.lineWidth=s.borderWidth,e.beginPath(),e.moveTo(a+c,r),"top"===o&&this.drawCaret(t,e,i,s),e.lineTo(a+l-d,r),e.quadraticCurveTo(a+l,r,a+l,r+d),"center"===o&&"right"===n&&this.drawCaret(t,e,i,s),e.lineTo(a+l,r+h-f),e.quadraticCurveTo(a+l,r+h,a+l-f,r+h),"bottom"===o&&this.drawCaret(t,e,i,s),e.lineTo(a+u,r+h),e.quadraticCurveTo(a,r+h,a,r+h-u),"center"===o&&"left"===n&&this.drawCaret(t,e,i,s),e.lineTo(a,r+c),e.quadraticCurveTo(a,r,a+c,r),e.closePath(),e.fill(),s.borderWidth>0&&e.stroke()}_updateAnimationTarget(t){const e=this.chart,i=this.$animations,s=i&&i.x,n=i&&i.y;if(s||n){const i=Sa[t.position].call(this,this._active,this._eventPosition);if(!i)return;const o=this._size=Oa(this,t),a=Object.assign({},i,this._size),r=Ta(e,t,a),l=La(t,a,r,e);s._to===l.x&&n._to===l.y||(this.xAlign=r.xAlign,this.yAlign=r.yAlign,this.width=o.width,this.height=o.height,this.caretX=i.x,this.caretY=i.y,this._resolveAnimations().update(this,l))}}_willRender(){return!!this.opacity}draw(t){const e=this.options.setContext(this.getContext());let i=this.opacity;if(!i)return;this._updateAnimationTarget(e);const s={width:this.width,height:this.height},n={x:this.x,y:this.y};i=Math.abs(i)<.001?0:i;const o=ki(e.padding),a=this.title.length||this.beforeBody.length||this.body.length||this.afterBody.length||this.footer.length;e.enabled&&a&&(t.save(),t.globalAlpha=i,this.drawBackground(n,t,s,e),Ai(t,e.textDirection),n.y+=o.top,this.drawTitle(n,t,e),this.drawBody(n,t,e),this.drawFooter(n,t,e),Ti(t,e.textDirection),t.restore())}getActiveElements(){return this._active||[]}setActiveElements(t,e){const i=this._active,s=t.map((({datasetIndex:t,index:e})=>{const i=this.chart.getDatasetMeta(t);if(!i)throw new Error("Cannot find a dataset at index "+t);return{datasetIndex:t,element:i.data[e],index:e}})),n=!f(i,s),o=this._positionChanged(s,e);(n||o)&&(this._active=s,this._eventPosition=e,this._ignoreReplayEvents=!0,this.update(!0))}handleEvent(t,e,i=!0){if(e&&this._ignoreReplayEvents)return!1;this._ignoreReplayEvents=!1;const s=this.options,n=this._active||[],o=this._getActiveElements(t,n,e,i),a=this._positionChanged(o,t),r=e||!f(o,n)||a;return r&&(this._active=o,(s.enabled||s.external)&&(this._eventPosition={x:t.x,y:t.y},this.update(!0,e))),r}_getActiveElements(t,e,i,s){const n=this.options;if("mouseout"===t.type)return[];if(!s)return e;const o=this.chart.getElementsAtEventForMode(t,n.mode,n,i);return n.reverse&&o.reverse(),o}_positionChanged(t,e){const{caretX:i,caretY:s,options:n}=this,o=Sa[n.position].call(this,t,e);return!1!==o&&(i!==o.x||s!==o.y)}}var Ba={id:"tooltip",_element:Va,positioners:Sa,afterInit(t,e,i){i&&(t.tooltip=new Va({chart:t,options:i}))},beforeUpdate(t,e,i){t.tooltip&&t.tooltip.initialize(i)},reset(t,e,i){t.tooltip&&t.tooltip.initialize(i)},afterDraw(t){const e=t.tooltip;if(e&&e._willRender()){const i={tooltip:e};if(!1===t.notifyPlugins("beforeTooltipDraw",{...i,cancelable:!0}))return;e.draw(t.ctx),t.notifyPlugins("afterTooltipDraw",i)}},afterEvent(t,e){if(t.tooltip){const i=e.replay;t.tooltip.handleEvent(e.event,i,e.inChartArea)&&(e.changed=!0)}},defaults:{enabled:!0,external:null,position:"average",backgroundColor:"rgba(0,0,0,0.8)",titleColor:"#fff",titleFont:{weight:"bold"},titleSpacing:2,titleMarginBottom:6,titleAlign:"left",bodyColor:"#fff",bodySpacing:2,bodyFont:{},bodyAlign:"left",footerColor:"#fff",footerSpacing:2,footerMarginTop:6,footerFont:{weight:"bold"},footerAlign:"left",padding:6,caretPadding:2,caretSize:5,cornerRadius:6,boxHeight:(t,e)=>e.bodyFont.size,boxWidth:(t,e)=>e.bodyFont.size,multiKeyBackground:"#fff",displayColors:!0,boxPadding:0,borderColor:"rgba(0,0,0,0)",borderWidth:0,animation:{duration:400,easing:"easeOutQuart"},animations:{numbers:{type:"number",properties:["x","y","width","height","caretX","caretY"]},opacity:{easing:"linear",duration:200}},callbacks:za},defaultRoutes:{bodyFont:"font",footerFont:"font",titleFont:"font"},descriptors:{_scriptable:t=>"filter"!==t&&"itemSort"!==t&&"external"!==t,_indexable:!1,callbacks:{_scriptable:!1,_indexable:!1},animation:{_fallback:!1},animations:{_fallback:"animation"}},additionalOptionScopes:["interaction"]};return An.register(Yn,jo,fo,t),An.helpers={...Wi},An._adapters=Rn,An.Animation=Cs,An.Animations=Os,An.animator=xt,An.controllers=en.controllers.items,An.DatasetController=Ns,An.Element=Hs,An.elements=fo,An.Interaction=Xi,An.layouts=as,An.platforms=Ss,An.Scale=Js,An.Ticks=ae,Object.assign(An,Yn,jo,fo,t,Ss),An.Chart=An,"undefined"!=typeof window&&(window.Chart=An),An}));
//# sourceMappingURL=chart.umd.js.map

})();

})();

(function (realWindow, realDocument) {
  if (realWindow.OpsVitaFlowNative) return;
  const nativeRoot = realDocument.getElementById('vitaflow-native');
  if (!nativeRoot) return;
  const nativeBody = "<div class=\"container\" id=\"mainPage\">\n        <a class=\"skip-link\" href=\"#dailyPlan\">跳到日程与待办</a>\n        <header class=\"app-header\">\n            <div>\n                <p class=\"app-kicker\">YOUR PERSONAL ENERGY SPACE</p>\n                <h1>VitaFlow <span>维拓流</span></h1>\n                <p class=\"app-description\">照顾好自己的精力，把时间留给重要的事。</p>\n            </div>\n            <nav class=\"section-nav\" aria-label=\"主页快捷导航\">\n                <a href=\"#energyOverview\">精力概览</a>\n                <a href=\"#dailyPlan\">日程待办</a>\n                <a href=\"#energyTrends\">状态趋势</a>\n                <a href=\"#creativeSpace\">创作与学习</a>\n            </nav>\n        </header>\n        <div class=\"user-profile\">\n            <details class=\"profile-details\">\n                <summary>使用说明 <span>查看记录方式</span></summary>\n            <div class=\"user-name\">VitaFlow · 精力记录</div>\n            <p class=\"user-intro\">用于记录体能、情感、思维与意志账户的每日状态。首次使用从空白记录开始；评分、趋势和分析只基于已保存的记录。</p>\n            <div class=\"tags\">\n                <span class=\"tag\">🏃 体能记录</span>\n                <span class=\"tag\">❤️ 情感回顾</span>\n                <span class=\"tag\">🧠 思维状态</span>\n                <span class=\"tag\">🌟 意志复盘</span>\n                <span class=\"tag\">📊 按记录汇总</span>\n            </div>\n\n            </details>\n            <!-- 数据备份 / 迁移 / 自动保存 工具栏 -->\n            <details class=\"data-tools\">\n                <summary>\n                    <span>数据保险箱 <span class=\"summary-hint\">备份、导入与保存</span></span>\n                    <span id=\"saveStatus\" role=\"status\" aria-live=\"polite\">就绪</span>\n                </summary>\n                <div class=\"backup-actions\">\n                    <button id=\"exportHtmlBtn\" onclick=\"exportHtmlWithData()\" style=\"background: linear-gradient(135deg, #c4679c, #8b5e9e); color: white; border: none; border-radius: 22px; padding: 10px 18px; font-weight: 600; font-size: 0.88rem; cursor: pointer; box-shadow: 0 4px 12px rgba(196, 103, 156, 0.25);\">\n                        📤 导出当前 HTML（含数据）\n                    </button>\n                    <button id=\"saveFileBtn\" onclick=\"saveToOriginalFile()\" style=\"background: linear-gradient(135deg, #a78bfa, #8b5cf6); color: white; border: none; border-radius: 22px; padding: 10px 18px; font-weight: 600; font-size: 0.88rem; cursor: pointer; box-shadow: 0 4px 12px rgba(167, 139, 250, 0.25);\">\n                        💾 直接保存到原文件\n                    </button>\n                    <button id=\"exportJsonBtn\" onclick=\"exportJsonFile()\" style=\"background: linear-gradient(135deg, #74ebd5, #9face6); color: white; border: none; border-radius: 22px; padding: 10px 18px; font-weight: 600; font-size: 0.88rem; cursor: pointer; box-shadow: 0 4px 12px rgba(116, 235, 213, 0.25);\">\n                        📤 导出 JSON\n                    </button>\n                    <button id=\"saveJsonBtn\" onclick=\"saveToJsonFile()\" style=\"background: linear-gradient(135deg, #22c55e, #14b8a6); color: white; border: none; border-radius: 22px; padding: 10px 18px; font-weight: 600; font-size: 0.88rem; cursor: pointer; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);\">\n                        💾 保存到 JSON\n                    </button>\n                    <button onclick=\"importFromHtmlFile()\" style=\"background: rgba(255, 255, 255, 0.85); color: #8b5e9e; border: 1.5px solid #bc8fcf; border-radius: 22px; padding: 10px 18px; font-weight: 600; font-size: 0.88rem; cursor: pointer;\">\n                        📥 从 HTML 导入数据\n                    </button>\n                    <button onclick=\"importFromJsonFile()\" style=\"background: rgba(255, 255, 255, 0.85); color: #0f766e; border: 1.5px solid #5eead4; border-radius: 22px; padding: 10px 18px; font-weight: 600; font-size: 0.88rem; cursor: pointer;\">\n                        📥 从 JSON 导入\n                    </button>\n                    <button id=\"autoSaveToggle\" onclick=\"toggleAutoSave()\" style=\"background: rgba(255, 255, 255, 0.85); color: #8b5e9e; border: 1.5px solid #bc8fcf; border-radius: 22px; padding: 10px 18px; font-weight: 600; font-size: 0.88rem; cursor: pointer;\">\n                        ⏰ 自动保存: 开\n                    </button>\n                </div>\n                <div class=\"backup-help\">\n                    💡 <strong>导出 HTML</strong> = 打包当前所有数据到一个新 HTML 文件，可换电脑继续用；<br>\n                    💡 <strong>保存到 JSON</strong> = 把网页里的最新记录写进 my-schedule.json，方便手机/电脑/平板互相导入；<br>\n                    💡 <strong>直接保存</strong> = 首次会选一次原文件，之后覆盖保存（仅 Edge/Chrome 支持）；<br>\n                    💡 <strong>从 HTML/JSON 导入</strong> = 完整恢复其他设备的备份，会替换当前 VitaFlow 数据。\n                </div>\n            </details>\n        </div>\n\n        <div class=\"section-heading\" id=\"energyOverview\"><h2>四账户精力</h2><p>点击账户，记录与回看自己的状态。</p></div>\n        <div class=\"accounts-grid\">\n            <button type=\"button\" class=\"account-card\" onclick=\"openDetail('physical')\">\n                <span class=\"account-icon\">🏃</span>\n                <span class=\"account-title\">体能账户</span>\n                <span class=\"account-score\" id=\"physicalScore\">—</span>\n                <span class=\"trend-badge\">按记录计算</span>\n            </button>\n            <button type=\"button\" class=\"account-card\" onclick=\"openDetail('emotional')\">\n                <span class=\"account-icon\">❤️</span>\n                <span class=\"account-title\">情感账户</span>\n                <span class=\"account-score\" id=\"emotionalScore\">—</span>\n                <span class=\"trend-badge\">按记录计算</span>\n            </button>\n            <button type=\"button\" class=\"account-card\" onclick=\"openDetail('focus')\">\n                <span class=\"account-icon\">🎯</span>\n                <span class=\"account-title\">思维账户</span>\n                <span class=\"account-score\" id=\"focusScore\">—</span>\n                <span class=\"trend-badge\">按记录计算</span>\n            </button>\n            <button type=\"button\" class=\"account-card\" onclick=\"openDetail('meaning')\">\n                <span class=\"account-icon\">🌟</span>\n                <span class=\"account-title\">意志账户</span>\n                <span class=\"account-score\" id=\"meaningScore\">—</span>\n                <span class=\"trend-badge\">按记录计算</span>\n            </button>\n        </div>\n\n        <div class=\"section-heading\" id=\"dailyPlan\" tabindex=\"-1\"><h2>日程与待办</h2><p>选一个日期，安排当天的行动。</p></div>\n        <div class=\"row-split\">\n            <div class=\"calendar-panel\">\n                <div class=\"month-nav\">\n                    <button class=\"month-btn\" onclick=\"changeMonth(-1)\"><i class=\"fas fa-chevron-left\"></i> 上月</button>\n                    <span class=\"current-month\" id=\"currentMonth\">2026年4月</span>\n                    <button class=\"month-btn\" onclick=\"changeMonth(1)\">下月 <i class=\"fas fa-chevron-right\"></i></button>\n                </div>\n                <div class=\"weekdays\"><div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div></div>\n                <div class=\"calendar-grid\" id=\"calendar\"></div>\n            </div>\n\n            <div class=\"todo-panel\">\n                <h3 class=\"panel-title\"><i class=\"fas fa-tasks\"></i> 今日待办</h3>\n                <div class=\"todo-input-area\">\n                    <div class=\"account-add-btns\">\n                        <button class=\"account-add-btn active\" data-account=\"physical\" onclick=\"selectAddAccount('physical')\">🏃 体能</button>\n                        <button class=\"account-add-btn\" data-account=\"emotional\" onclick=\"selectAddAccount('emotional')\">❤️ 情感</button>\n                        <button class=\"account-add-btn\" data-account=\"focus\" onclick=\"selectAddAccount('focus')\">🧠 思维</button>\n                        <button class=\"account-add-btn\" data-account=\"meaning\" onclick=\"selectAddAccount('meaning')\">🔥 意志</button>\n                    </div>\n                    <div class=\"todo-input-group\">\n                        <input type=\"text\" id=\"todoInput\" aria-label=\"待办内容\" placeholder=\"输入今日待办...\">\n                        <select class=\"happy-select\" id=\"happySelect\" aria-label=\"这项待办的幸福感评分\">\n                            <option value=\"1\">😣</option><option value=\"3\">😕</option><option value=\"5\">😐</option>\n                            <option value=\"7\" selected>😊</option><option value=\"9\">😄</option><option value=\"10\">🤩</option>\n                        </select>\n                        <button class=\"add-btn\" onclick=\"addTodo()\">添加</button>\n                    </div>\n                </div>\n                <div class=\"todo-list\" id=\"todoList\"></div>\n            </div>\n        </div>\n\n        <div class=\"stats-grid\">\n            <button type=\"button\" class=\"stat-card\" onclick=\"openDetail('streak')\">\n                <span class=\"stat-value\" id=\"streakDays\">0</span>\n                <span class=\"stat-label\">🔥 连续打卡</span>\n            </button>\n            <button type=\"button\" class=\"stat-card\" onclick=\"openDetail('tasks')\">\n                <span class=\"stat-value\" id=\"completedTasks\">0</span>\n                <span class=\"stat-label\">✅ 累计完成</span>\n            </button>\n            <button type=\"button\" class=\"stat-card\" onclick=\"openDetail('avg')\">\n                <span class=\"stat-value\" id=\"avgScore\">—</span>\n                <span class=\"stat-label\">📊 平均得分</span>\n            </button>\n        </div>\n\n        <div style=\"margin-top: 28px;\">\n            <h3 class=\"panel-title\"><i class=\"fas fa-list-check\"></i> 📋 待办事项看板</h3>\n            <div class=\"responsive-grid\" style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 20px;\">\n                <div style=\"background: rgba(255, 250, 252, 0.9); border-radius: 24px; padding: 20px; border: 1px solid #ffe2f0; max-height: 350px;\">\n                    <div style=\"display: flex; align-items: center; gap: 10px; margin-bottom: 16px;\">\n                        <span style=\"font-size: 1.3rem;\">📝</span>\n                        <h4 style=\"font-size: 1.1rem; font-weight: 700; color: #6a4a7a;\">未完成</h4>\n                        <span style=\"margin-left: auto; background: rgba(232, 138, 76, 0.2); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; color: #e88a4c;\" id=\"todoPendingCount\">0</span>\n                    </div>\n                    <div id=\"todoKanbanPending\" style=\"max-height: 260px; overflow-y: auto; padding-right: 8px;\"></div>\n                </div>\n                <div style=\"background: rgba(250, 255, 252, 0.9); border-radius: 24px; padding: 20px; border: 1px solid #d4f5e8; max-height: 350px;\">\n                    <div style=\"display: flex; align-items: center; gap: 10px; margin-bottom: 16px;\">\n                        <span style=\"font-size: 1.3rem;\">✅</span>\n                        <h4 style=\"font-size: 1.1rem; font-weight: 700; color: #4a8a5a;\">已完成</h4>\n                        <span style=\"margin-left: auto; background: rgba(74, 222, 128, 0.2); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; color: #22c55e;\" id=\"todoCompletedCount\">0</span>\n                    </div>\n                    <div id=\"todoKanbanCompleted\" style=\"max-height: 260px; overflow-y: auto; padding-right: 8px;\"></div>\n                </div>\n            </div>\n        </div>\n\n        <div class=\"dashboard-section\" id=\"energyTrends\" style=\"margin-top: 28px;\">\n            <h3 class=\"panel-title\"><i class=\"fas fa-chart-line\"></i> 精力趋势分析</h3>\n            <div style=\"display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;\">\n                <span style=\"font-size: 0.9rem; color: #8b7a7a;\">选择时间区间：</span>\n                <input type=\"date\" id=\"trendStartDate\" aria-label=\"趋势开始日期\" min=\"2026-01-01\" max=\"2030-12-31\">\n                <span style=\"color: #8b5e9e;\">至</span>\n                <input type=\"date\" id=\"trendEndDate\" aria-label=\"趋势结束日期\" min=\"2026-01-01\" max=\"2030-12-31\">\n                <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #8b5e9e, #6a4a7a);\" onclick=\"renderAllTrendCharts()\">📊 更新所有图表</button>\n            </div>\n            <div class=\"responsive-grid\" style=\"display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;\">\n                <div style=\"background: rgba(255, 250, 252, 0.9); border-radius: 20px; padding: 16px; border: 1px solid #ffe2f0;\">\n                    <h4 style=\"color: #e88a4c; font-size: 0.9rem; margin-bottom: 8px;\">🏃 体能得分趋势</h4>\n                    <div style=\"height: 140px; position: relative;\"><canvas id=\"physicalTrendChart\"></canvas><div id=\"physicalTrendChartEmpty\" style=\"position: absolute; inset: 50% 0 auto; text-align: center; color: #8b7a7a;\">待记录评分后展示趋势</div></div>\n                </div>\n                <div style=\"background: rgba(255, 250, 252, 0.9); border-radius: 20px; padding: 16px; border: 1px solid #ffe2f0;\">\n                    <h4 style=\"color: #c4679c; font-size: 0.9rem; margin-bottom: 8px;\">❤️ 情感得分趋势</h4>\n                    <div style=\"height: 140px; position: relative;\"><canvas id=\"emotionalTrendChart\"></canvas><div id=\"emotionalTrendChartEmpty\" style=\"position: absolute; inset: 50% 0 auto; text-align: center; color: #8b7a7a;\">待记录评分后展示趋势</div></div>\n                </div>\n                <div style=\"background: rgba(255, 250, 252, 0.9); border-radius: 20px; padding: 16px; border: 1px solid #ffe2f0;\">\n                    <h4 style=\"color: #8b5e9e; font-size: 0.9rem; margin-bottom: 8px;\">🧠 思维得分趋势</h4>\n                    <div style=\"height: 140px; position: relative;\"><canvas id=\"focusTrendChart\"></canvas><div id=\"focusTrendChartEmpty\" style=\"position: absolute; inset: 50% 0 auto; text-align: center; color: #8b7a7a;\">待记录评分后展示趋势</div></div>\n                </div>\n                <div style=\"background: rgba(255, 250, 252, 0.9); border-radius: 20px; padding: 16px; border: 1px solid #ffe2f0;\">\n                    <h4 style=\"color: #a78bfa; font-size: 0.9rem; margin-bottom: 8px;\">🔥 意志得分趋势</h4>\n                    <div style=\"height: 140px; position: relative;\"><canvas id=\"meaningTrendChart\"></canvas><div id=\"meaningTrendChartEmpty\" style=\"position: absolute; inset: 50% 0 auto; text-align: center; color: #8b7a7a;\">待记录评分后展示趋势</div></div>\n                </div>\n            </div>\n        </div>\n\n        <div style=\"margin-top: 28px;\">\n            <h3 class=\"panel-title\"><i class=\"fas fa-smile\"></i> 情感标记看板</h3>\n            <div class=\"emotion-layout\">\n                <div style=\"flex: 1; background: rgba(255, 250, 252, 0.9); border-radius: 24px; padding: 20px; border: 1px solid #ffe2f0;\">\n                    <div style=\"display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;\">\n                        <select id=\"emotionYear\" aria-label=\"情感看板年份\" onchange=\"renderEmotionBoard()\">\n                            <option value=\"2026\">2026年</option>\n                            <option value=\"2027\">2027年</option>\n                            <option value=\"2028\">2028年</option>\n                            <option value=\"2029\">2029年</option>\n                            <option value=\"2030\">2030年</option>\n                        </select>\n                        <select id=\"emotionMonth\" aria-label=\"情感看板月份\" onchange=\"renderEmotionBoard()\">\n                            <option value=\"0\">1月</option><option value=\"1\">2月</option><option value=\"2\">3月</option><option value=\"3\">4月</option>\n                            <option value=\"4\">5月</option><option value=\"5\">6月</option><option value=\"6\">7月</option><option value=\"7\">8月</option>\n                            <option value=\"8\">9月</option><option value=\"9\">10月</option><option value=\"10\">11月</option><option value=\"11\">12月</option>\n                        </select>\n                    </div>\n                    <div style=\"display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;\" id=\"emotionBoard\"></div>\n                </div>\n                <div style=\"flex: 1; background: rgba(255, 250, 252, 0.9); border-radius: 24px; padding: 20px; border: 1px solid #ffe2f0;\">\n                    <h4 style=\"color: #c4679c; font-size: 1rem; margin-bottom: 16px;\">📝 情绪波动记录</h4>\n                    <div style=\"margin-bottom: 16px;\">\n                        <label style=\"font-size: 0.9rem; color: #6a4a5a; margin-bottom: 8px; display: block;\">关联时间（可选）</label>\n                        <div style=\"display: flex; gap: 12px; flex-wrap: wrap;\">\n                            <input type=\"date\" id=\"emotionStartDate\" aria-label=\"情绪记录开始日期\" min=\"2026-01-01\" max=\"2030-12-31\" style=\"flex: 1; min-width: 120px;\">\n                            <span style=\"color: #8b5e9e; align-self: center;\">至</span>\n                            <input type=\"date\" id=\"emotionEndDate\" aria-label=\"情绪记录结束日期\" min=\"2026-01-01\" max=\"2030-12-31\" style=\"flex: 1; min-width: 120px;\">\n                        </div>\n                    </div>\n                    <div style=\"margin-bottom: 16px;\">\n                        <label style=\"font-size: 0.9rem; color: #6a4a5a; margin-bottom: 8px; display: block;\">记录情绪波动原因</label>\n                        <textarea id=\"emotionNotes\" aria-label=\"情绪波动原因\" style=\"width: 100%; background: rgba(255, 255, 255, 0.8); border: 1px solid rgba(200, 160, 200, 0.3); border-radius: 16px; padding: 14px; color: #3a2a47; font-size: 0.95rem; min-height: 200px; resize: vertical; outline: none;\" placeholder=\"记录情绪波动的原因...&#10;&#10;例如：&#10;- 本周工作压力较大，周三情绪低落&#10;- 周五和朋友聚会，心情很好&#10;- 周末休息充足，精力充沛&#10;- 学习了新技能，感觉很有成就感&#10;- 和家人通话，感受到温暖与支持\"></textarea>\n                    </div>\n                    <div style=\"display: flex; justify-content: flex-end; margin-bottom: 20px;\">\n                        <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #c4679c, #9c5a8e);\" onclick=\"saveEmotionNotes()\">💾 保存记录</button>\n                    </div>\n                    <div style=\"border-top: 1px solid rgba(200, 160, 200, 0.3); padding-top: 16px;\">\n                        <h5 style=\"color: #8b7a7a; font-size: 0.9rem; margin-bottom: 12px;\">📋 历史记录</h5>\n                        <div id=\"emotionNotesList\" style=\"max-height: 200px; overflow-y: auto;\"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n\n        <div class=\"goal-section\">\n            <div class=\"calendar-panel\">\n                <h3 class=\"panel-title\"><i class=\"fas fa-rocket\"></i> 目标拆解</h3>\n                <div class=\"goal-input-area\">\n                    <input type=\"text\" id=\"goalInput\" aria-label=\"中长期目标\" placeholder=\"输入希望推进的目标（例如：完成一个项目）...\">\n                    <button class=\"add-btn\" onclick=\"generateGoalSuggestions()\">🎯 AI拆解</button>\n                </div>\n                <div id=\"goalSuggestions\" class=\"goal-suggestions\" style=\"display: none;\"></div>\n            </div>\n        </div>\n\n        <div class=\"media-section\" id=\"creativeSpace\">\n            <h3 class=\"panel-title\"><i class=\"fas fa-pen-fancy\"></i> 自媒体运营中心</h3>\n            <div class=\"media-grid\">\n                <button type=\"button\" class=\"media-card\" onclick=\"openMediaDetail('writing')\">\n                    <span class=\"media-icon\">✍️</span>\n                    <span class=\"media-title\">小小号写作中</span>\n                    <span class=\"media-count\" id=\"writingCount\">0 个文档</span>\n                </button>\n                <button type=\"button\" class=\"media-card\" onclick=\"openMediaDetail('lazyy')\">\n                    <span class=\"media-icon\">😴</span>\n                    <span class=\"media-title\">OMG摆烂运营中</span>\n                    <span class=\"media-count\" id=\"lazyyCount\">0 个想法</span>\n                </button>\n                <button type=\"button\" class=\"media-card\" onclick=\"openMediaDetail('ads')\">\n                    <span class=\"media-icon\">💰</span>\n                    <span class=\"media-title\">接广告赚钱钱钱</span>\n                    <span class=\"media-count\" id=\"adsCount\">0 个记录</span>\n                </button>\n                <button type=\"button\" class=\"media-card\" onclick=\"openMediaDetail('ideas')\">\n                    <span class=\"media-icon\">💡</span>\n                    <span class=\"media-title\">新的想法和探索</span>\n                    <span class=\"media-count\" id=\"ideasCount\">0 个灵感</span>\n                </button>\n            </div>\n        </div>\n\n        <!-- 自媒体运营日历模块 -->\n        <div class=\"media-section\" style=\"margin-top: 28px;\">\n            <h3 class=\"panel-title\"><i class=\"fas fa-calendar-alt\"></i> 📅 自媒体运营日历</h3>\n            <div style=\"display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;\">\n                <span style=\"font-size: 0.9rem; color: #8b7a7a;\">选择时间区间：</span>\n                <input type=\"date\" id=\"mediaCalendarStartDate\" aria-label=\"运营日历开始日期\" onchange=\"renderMediaCalendar()\">\n                <span style=\"color: #8b5e9e;\">至</span>\n                <input type=\"date\" id=\"mediaCalendarEndDate\" aria-label=\"运营日历结束日期\" onchange=\"renderMediaCalendar()\">\n                <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #c4679c, #8b5e9e);\" onclick=\"renderMediaCalendar()\">📊 更新日历</button>\n                <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #667eea, #764ba2);\" onclick=\"renderMediaCalendarStats()\">📈 查看统计</button>\n            </div>\n            <div id=\"mediaCalendarContainer\" style=\"background: rgba(255, 250, 252, 0.9); border-radius: 24px; padding: 20px; border: 1px solid rgba(200, 160, 200, 0.3); overflow-x: auto;\">\n                <div id=\"mediaCalendarTable\"></div>\n            </div>\n            <div id=\"mediaCalendarStatsContainer\" style=\"margin-top: 20px; display: none;\">\n                <div style=\"background: rgba(255, 250, 252, 0.9); border-radius: 24px; padding: 20px; border: 1px solid rgba(200, 160, 200, 0.3);\">\n                    <h4 style=\"color: #6a4a5a; font-size: 1rem; margin-bottom: 16px;\">📊 更新数量统计</h4>\n                    <div style=\"height: 200px;\"><canvas id=\"mediaCalendarStatsChart\"></canvas></div>\n                    <div class=\"responsive-grid\" style=\"display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-top: 16px;\">\n                        <div style=\"text-align: center; padding: 12px; background: rgba(255, 179, 71, 0.1); border-radius: 12px;\">\n                            <div style=\"font-size: 0.8rem; color: #8b7a7a;\">抖音</div>\n                            <div style=\"font-size: 1.5rem; font-weight: 700; color: #ffb347;\" id=\"mediaStatsDouyin\">0</div>\n                        </div>\n                        <div style=\"text-align: center; padding: 12px; background: rgba(196, 103, 156, 0.1); border-radius: 12px;\">\n                            <div style=\"font-size: 0.8rem; color: #8b7a7a;\">网易</div>\n                            <div style=\"font-size: 1.5rem; font-weight: 700; color: #c4679c;\" id=\"mediaStatsWangyi\">0</div>\n                        </div>\n                        <div style=\"text-align: center; padding: 12px; background: rgba(139, 94, 158, 0.1); border-radius: 12px;\">\n                            <div style=\"font-size: 0.8rem; color: #8b7a7a;\">大号</div>\n                            <div style=\"font-size: 1.5rem; font-weight: 700; color: #8b5e9e;\" id=\"mediaStatsDahao\">0</div>\n                        </div>\n                        <div style=\"text-align: center; padding: 12px; background: rgba(167, 139, 250, 0.1); border-radius: 12px;\">\n                            <div style=\"font-size: 0.8rem; color: #8b7a7a;\">小号</div>\n                            <div style=\"font-size: 1.5rem; font-weight: 700; color: #a78bfa;\" id=\"mediaStatsXiaohao\">0</div>\n                        </div>\n                        <div style=\"text-align: center; padding: 12px; background: rgba(232, 138, 76, 0.1); border-radius: 12px;\">\n                            <div style=\"font-size: 0.8rem; color: #8b7a7a;\">小小号</div>\n                            <div style=\"font-size: 1.5rem; font-weight: 700; color: #e88a4c;\" id=\"mediaStatsXiaoxiaohao\">0</div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n\n        <div class=\"media-section\">\n            <h3 class=\"panel-title\"><i class=\"fas fa-graduation-cap\"></i> 我学学学</h3>\n            <div class=\"media-grid\">\n                <button type=\"button\" class=\"media-card\" onclick=\"openIdeasTab('analysis')\">\n                    <span class=\"media-icon\">🎯</span>\n                    <span class=\"media-title\">对标分析</span>\n                    <span class=\"media-count\" id=\"benchmarkCount\">0 个笔记</span>\n                </button>\n                <button type=\"button\" class=\"media-card\" onclick=\"openIdeasTab('ip')\">\n                    <span class=\"media-icon\">💼</span>\n                    <span class=\"media-title\">IP商业分析</span>\n                    <span class=\"media-count\" id=\"businessCount\">0 个笔记</span>\n                </button>\n                <button type=\"button\" class=\"media-card\" onclick=\"openIdeasTab('skills')\">\n                    <span class=\"media-icon\">🎨</span>\n                    <span class=\"media-title\">新技能学习</span>\n                    <span class=\"media-count\" id=\"skillsCount\">0 个笔记</span>\n                </button>\n                <button type=\"button\" class=\"media-card\" onclick=\"openDeepSeekDetail()\">\n                    <span class=\"media-icon\">🤖</span>\n                    <span class=\"media-title\">聊点什么呢</span>\n                    <span class=\"media-count\" id=\"deepseekCount\">0 个文档</span>\n                </button>\n            </div>\n        </div>\n\n        <div class=\"media-section\">\n            <h3 class=\"panel-title\"><i class=\"fas fa-book-open\"></i> 文学创作类中心</h3>\n            <div class=\"media-grid\">\n                <button type=\"button\" class=\"media-card\" onclick=\"openLiteratureDetail()\">\n                    <span class=\"media-icon\">📚</span>\n                    <span class=\"media-title\">创作灵感库</span>\n                    <span class=\"media-count\" id=\"literatureCount\">0 个文档</span>\n                </button>\n                <button type=\"button\" class=\"media-card\" onclick=\"openNovelOutlineDetail()\">\n                    <span class=\"media-icon\">🗺️</span>\n                    <span class=\"media-title\">小说大纲</span>\n                    <span class=\"media-count\" id=\"novelOutlineCount\">0 个大纲</span>\n                </button>\n                <button type=\"button\" class=\"media-card\" onclick=\"openReadingNoteDetail()\">\n                    <span class=\"media-icon\">📖</span>\n                    <span class=\"media-title\">读书笔记</span>\n                    <span class=\"media-count\" id=\"readingNoteCount\">0 个笔记</span>\n                </button>\n                <button type=\"button\" class=\"media-card\" onclick=\"openFilmDetail()\">\n                    <span class=\"media-icon\">🎬</span>\n                    <span class=\"media-title\">电影鉴赏</span>\n                    <span class=\"media-count\" id=\"filmCount\">0 个笔记</span>\n                </button>\n            </div>\n        </div>\n\n        <div class=\"calendar-panel\" style=\"margin-top: 28px;\">\n            <h3 class=\"panel-title\"><i class=\"fas fa-clock\"></i> 番茄钟专注记录</h3>\n            <div id=\"pomodoroTimer\" style=\"text-align: center; margin-bottom: 16px; padding: 20px; background: linear-gradient(135deg, rgba(139, 94, 158, 0.1), rgba(106, 74, 122, 0.1)); border-radius: 20px; display: none;\">\n                <div id=\"timerDisplay\" style=\"font-size: 3rem; font-weight: 700; color: #8b5e9e; font-family: monospace;\">25:00</div>\n                <div id=\"timerStatus\" style=\"font-size: 1rem; color: #8b7a7a; margin-top: 8px;\">专注中...</div>\n            </div>\n            <div class=\"pomodoros-grid\" id=\"pomodoroGrid\"></div>\n            <div style=\"display: flex; gap: 12px; flex-wrap: wrap;\">\n                <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #8b5e9e, #6a4a7a);\" onclick=\"startPomodoro()\" id=\"startPomodoroBtn\">🍅 开始专注 (25分钟)</button>\n                <button class=\"add-btn\" style=\"background: rgba(200, 100, 100, 0.3); display: none;\" onclick=\"stopPomodoro()\" id=\"stopPomodoroBtn\">⏹ 停止</button>\n                <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #74ebd5, #9face6);\" onclick=\"openDetail('pomodoro')\">📊 查看详细记录</button>\n            </div>\n        </div>\n\n        <div class=\"calendar-panel\" style=\"margin-top: 28px;\">\n            <h3 class=\"panel-title\"><i class=\"fas fa-sync-alt\"></i> 每周复盘</h3>\n            <div class=\"goal-input-area\">\n                <input type=\"date\" id=\"reviewStartDate\" aria-label=\"复盘开始日期\">\n                <span style=\"color: #8b5e9e; font-weight: 600;\">至</span>\n                <input type=\"date\" id=\"reviewEndDate\" aria-label=\"复盘结束日期\">\n                <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #667eea, #764ba2);\" onclick=\"addWeeklyReview()\">+ 添加复盘周</button>\n            </div>\n            <div id=\"reviewList\"></div>\n        </div>\n    </div>\n\n    <!-- 体能账户详情页 -->\n    <div class=\"detail-page\" id=\"physicalPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">🏃</div>\n            <h2 class=\"detail-title physical-theme\">体能账户</h2>\n            <div class=\"progress-ring\">\n                <svg viewBox=\"0 0 100 100\">\n                    <circle class=\"bg\" cx=\"50\" cy=\"50\" r=\"42\"/>\n                    <circle class=\"fg\" cx=\"50\" cy=\"50\" r=\"42\" stroke=\"#e88a4c\" stroke-dasharray=\"264\" stroke-dashoffset=\"264\" opacity=\"0.25\"/>\n                </svg>\n                <div class=\"center\"><div class=\"number physical-theme\" id=\"physicalProgress\">—</div><div class=\"label\">当前能量</div></div>\n            </div>\n        </div>\n        <div class=\"tabs\">\n            <button class=\"tab-btn active\" onclick=\"switchTab('physical', 'theory')\">📚 理论</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('physical', 'trend')\">📈 趋势</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('physical', 'record')\">✍️ 记录</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('physical', 'guide')\">💡 引导</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('physical', 'history')\">📝 历史</button>\n        </div>\n        <div id=\"physical-theory\" class=\"tab-content active\">\n            <div class=\"theory-card\">\n                <div class=\"theory-title\"><i class=\"fas fa-book\"></i> Loehr 精力金字塔</div>\n                <div class=\"theory-text\">体能是精力管理的基础。根据吉姆·洛尔的精力管理理论，体能包括身体能量，通过规律的运动、充足的睡眠和均衡的饮食来维持。体能账户的核心是：精力不是消耗品，而是可以通过锻炼不断积累和恢复的资源。</div>\n            </div>\n        </div>\n        <div id=\"physical-trend\" class=\"tab-content\"><div class=\"chart-container\" style=\"position: relative;\"><canvas id=\"physicalChart\"></canvas><div id=\"physicalChartEmpty\" style=\"position: absolute; inset: 50% 0 auto; text-align: center; color: #8b7a7a;\">待记录评分后展示趋势</div></div></div>\n        <div id=\"physical-record\" class=\"tab-content\">\n            <div class=\"record-form\">\n                <div class=\"form-group\">\n                    <label class=\"form-label\">今日得分 (0-100)</label>\n                    <input type=\"range\" class=\"form-range\" id=\"physicalScoreInput\" min=\"0\" max=\"100\" oninput=\"updateScorePreview('physical', this.value)\">\n                    <div style=\"text-align: center; font-size: 1.5rem; font-weight: 700; color: #e88a4c; margin-top: 8px;\" id=\"physicalPreview\">待记录</div>\n                </div>\n                <div class=\"form-group\">\n                    <label class=\"form-label\">日期</label>\n                    <input type=\"date\" class=\"form-input\" id=\"physicalDateInput\">\n                </div>\n                <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #e88a4c, #d470a0);\" onclick=\"saveRecord('physical')\">保存记录</button>\n            </div>\n        </div>\n        <div id=\"physical-guide\" class=\"tab-content\">\n            <div class=\"responsive-grid\" style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;\">\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(232, 138, 76, 0.1), rgba(212, 112, 160, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-wind\"></i> 呼吸训练</div>\n                    <div style=\"text-align: center; padding: 20px;\">\n                        <div id=\"breathCircle\" style=\"width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #e88a4c, #d470a0); margin: 0 auto 16px; transition: all 3s ease-in-out;\"></div>\n                        <div id=\"breathInstruction\" style=\"font-size: 1.2rem; color: #e88a4c; font-weight: 600;\">准备开始...</div>\n                        <div id=\"breathCount\" style=\"font-size: 2rem; color: #6a4a7a; font-weight: 700; margin-top: 8px;\">0</div>\n                    </div>\n                    <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #e88a4c, #d470a0);\" onclick=\"startBreathing()\">🌬️ 开始3-6呼吸法</button>\n                </div>\n\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(52, 211, 153, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-clock\"></i> 间歇训练计时器</div>\n                    <div style=\"text-align: center; padding: 16px;\">\n                        <div id=\"intervalTimer\" style=\"font-size: 2.5rem; font-weight: 700; color: #4ade80; font-family: monospace;\">25:00</div>\n                        <div id=\"intervalStatus\" style=\"font-size: 1rem; color: #6a4a7a; margin-top: 8px;\">准备开始</div>\n                    </div>\n                    <div style=\"display: flex; gap: 8px; margin-bottom: 12px;\">\n                        <button class=\"add-btn\" style=\"flex: 1; background: linear-gradient(135deg, #4ade80, #22c55e);\" onclick=\"startIntervalTraining()\">▶️ 开始训练</button>\n                        <button class=\"add-btn\" style=\"flex: 1; background: rgba(200, 100, 100, 0.3);\" onclick=\"stopIntervalTraining()\">⏹️ 停止</button>\n                    </div>\n                    <div style=\"font-size: 0.8rem; color: #6a4a7a; padding: 0 8px;\">\n                        <p style=\"margin-bottom: 4px;\"><strong>💡 间歇训练建议：</strong></p>\n                        <ul style=\"margin: 0; padding-left: 16px;\">\n                            <li>热身5分钟</li>\n                            <li>高强度运动30秒</li>\n                            <li>休息1分钟</li>\n                            <li>重复8-10次</li>\n                            <li>每周3-5次</li>\n                        </ul>\n                    </div>\n                </div>\n\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1)); grid-column: span 2;\">\n                    <div class=\"theory-title\"><i class=\"fas fa-utensils\"></i> 饮食记录</div>\n                    <div style=\"display: flex; gap: 16px; margin-bottom: 16px;\">\n                        <div style=\"flex: 1;\">\n                            <label class=\"form-label\" style=\"font-size: 0.9rem;\">选择日期</label>\n                            <input type=\"date\" class=\"form-input\" id=\"foodDate\" style=\"margin-bottom: 12px;\">\n                            <label class=\"form-label\" style=\"font-size: 0.9rem;\">饮水量 (ml)</label>\n                            <input type=\"number\" class=\"form-input\" id=\"waterIntake\" placeholder=\"输入饮水量\" style=\"margin-bottom: 8px;\">\n                            <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #3b82f6, #8b5cf6);\" onclick=\"saveWaterIntake()\">💧 记录饮水</button>\n                            <div style=\"margin-top: 12px; text-align: center;\">\n                                <div style=\"font-size: 2rem; font-weight: 700; color: #3b82f6;\" id=\"waterProgress\">0</div>\n                                <div style=\"font-size: 0.9rem; color: #8b7a7a;\">/ 1800ml</div>\n                            </div>\n                        </div>\n                        <div style=\"flex: 1;\">\n                            <label class=\"form-label\" style=\"font-size: 0.9rem;\">饮食分类</label>\n                            <div style=\"display: flex; flex-wrap: gap: 8px; margin-bottom: 12px;\">\n                                <button class=\"add-btn\" style=\"background: #4ade80; margin: 4px;\" onclick=\"addFood('healthy')\">🥗 健康</button>\n                                <button class=\"add-btn\" style=\"background: #fbbf24; margin: 4px;\" onclick=\"addFood('moderate')\">🍕 中等</button>\n                                <button class=\"add-btn\" style=\"background: #f87171; margin: 4px;\" onclick=\"addFood('unhealthy')\">🍟 不健康</button>\n                            </div>\n                            <div style=\"height: 120px;\">\n                                <canvas id=\"foodChart\"></canvas>\n                            </div>\n                        </div>\n                    </div>\n                    <div style=\"border-top: 1px solid rgba(139, 92, 246, 0.2); padding-top: 12px;\">\n                        <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;\">\n                            <span style=\"font-size: 0.9rem; color: #6a4a7a;\">📋 历史记录</span>\n                            <button class=\"add-btn\" style=\"background: rgba(139, 92, 246, 0.2); font-size: 0.8rem;\" onclick=\"renderFoodHistory()\">🔄 刷新</button>\n                        </div>\n                        <div id=\"foodHistoryList\" style=\"max-height: 150px; overflow-y: auto;\"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div id=\"physical-history\" class=\"tab-content\">\n            <div class=\"responsive-grid\" style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;\">\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-tint\"></i> 💧 饮水记录看板</div>\n                    <div style=\"max-height: 300px; overflow-y: auto;\">\n                        <div id=\"physicalWaterBoard\"></div>\n                    </div>\n                </div>\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(52, 211, 153, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-utensils\"></i> 🍽️ 饮食记录看板</div>\n                    <div style=\"max-height: 300px; overflow-y: auto;\">\n                        <div id=\"physicalFoodBoard\"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n    <!-- 情感账户详情页 -->\n    <div class=\"detail-page\" id=\"emotionalPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">❤️</div>\n            <h2 class=\"detail-title emotional-theme\">情感账户</h2>\n            <div class=\"progress-ring\">\n                <svg viewBox=\"0 0 100 100\">\n                    <circle class=\"bg\" cx=\"50\" cy=\"50\" r=\"42\"/>\n                    <circle class=\"fg\" cx=\"50\" cy=\"50\" r=\"42\" stroke=\"#c4679c\" stroke-dasharray=\"264\" stroke-dashoffset=\"264\" opacity=\"0.25\"/>\n                </svg>\n                <div class=\"center\"><div class=\"number emotional-theme\" id=\"emotionalProgress\">—</div><div class=\"label\">当前能量</div></div>\n            </div>\n        </div>\n        <div class=\"tabs\">\n            <button class=\"tab-btn active\" onclick=\"switchTab('emotional', 'theory')\">📚 理论</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('emotional', 'trend')\">📈 趋势</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('emotional', 'record')\">✍️ 记录</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('emotional', 'guide')\">💡 引导</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('emotional', 'history')\">📝 历史</button>\n        </div>\n        <div id=\"emotional-theory\" class=\"tab-content active\">\n            <div class=\"theory-card\">\n                <div class=\"theory-title\"><i class=\"fas fa-book\"></i> 积极心理学拓展建构理论</div>\n                <div class=\"theory-text\">积极情绪不仅是结果，更是资源。根据弗雷德里克森的拓展建构理论，积极情绪能拓展我们的思维视野和行动资源。情感账户的核心是：通过记录和感恩，主动积累积极情绪体验。</div>\n            </div>\n        </div>\n        <div id=\"emotional-trend\" class=\"tab-content\"><div class=\"chart-container\" style=\"position: relative;\"><canvas id=\"emotionalChart\"></canvas><div id=\"emotionalChartEmpty\" style=\"position: absolute; inset: 50% 0 auto; text-align: center; color: #8b7a7a;\">待记录评分后展示趋势</div></div></div>\n        <div id=\"emotional-record\" class=\"tab-content\">\n            <div class=\"record-form\">\n                <div class=\"form-group\">\n                    <label class=\"form-label\">今日得分 (0-100)</label>\n                    <input type=\"range\" class=\"form-range\" id=\"emotionalScoreInput\" min=\"0\" max=\"100\" oninput=\"updateScorePreview('emotional', this.value)\">\n                    <div style=\"text-align: center; font-size: 1.5rem; font-weight: 700; color: #c4679c; margin-top: 8px;\" id=\"emotionalPreview\">待记录</div>\n                </div>\n                <div class=\"form-group\">\n                    <label class=\"form-label\">日期</label>\n                    <input type=\"date\" class=\"form-input\" id=\"emotionalDateInput\">\n                </div>\n                <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #c4679c, #9c5a8e);\" onclick=\"saveRecord('emotional')\">保存记录</button>\n            </div>\n        </div>\n        <div id=\"emotional-guide\" class=\"tab-content\">\n            <div class=\"responsive-grid\" style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;\">\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(196, 103, 156, 0.1), rgba(156, 90, 142, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-comment\"></i> 三明治批评法</div>\n                    <div style=\"margin-bottom: 12px;\">\n                        <label class=\"form-label\" style=\"font-size: 0.9rem;\">真诚肯定</label>\n                        <input type=\"text\" class=\"form-input\" id=\"sandwichPositive\" placeholder=\"描述优点...\">\n                    </div>\n                    <div style=\"margin-bottom: 12px;\">\n                        <label class=\"form-label\" style=\"font-size: 0.9rem;\">建设性建议</label>\n                        <input type=\"text\" class=\"form-input\" id=\"sandwichSuggestion\" placeholder=\"提出改进方向...\">\n                    </div>\n                    <div style=\"margin-bottom: 12px;\">\n                        <label class=\"form-label\" style=\"font-size: 0.9rem;\">鼓励支持</label>\n                        <input type=\"text\" class=\"form-input\" id=\"sandwichEncourage\" placeholder=\"表达信心...\">\n                    </div>\n                    <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #c4679c, #9c5a8e);\" onclick=\"saveSandwich()\">💾 保存模板</button>\n                    <div style=\"margin-top: 12px; border-top: 1px solid rgba(196, 103, 156, 0.2); padding-top: 12px;\">\n                        <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;\">\n                            <span style=\"font-size: 0.85rem; color: #6a4a7a;\">📋 历史模板</span>\n                            <button class=\"add-btn\" style=\"background: rgba(196, 103, 156, 0.2); font-size: 0.75rem;\" onclick=\"renderSandwichHistory()\">🔄 查看</button>\n                        </div>\n                        <div id=\"sandwichHistoryList\" style=\"max-height: 120px; overflow-y: auto;\"></div>\n                    </div>\n                </div>\n\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(139, 92, 246, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-users\"></i> 社会支持图谱</div>\n                    <div style=\"margin-bottom: 12px;\">\n                        <label class=\"form-label\" style=\"font-size: 0.9rem;\">联系人姓名</label>\n                        <input type=\"text\" class=\"form-input\" id=\"supportName\" placeholder=\"输入姓名\">\n                    </div>\n                    <div style=\"margin-bottom: 12px;\">\n                        <label class=\"form-label\" style=\"font-size: 0.9rem;\">关系类型</label>\n                        <select class=\"form-input\" id=\"supportType\">\n                            <option value=\"family\">👨‍👩‍👧 亲情</option>\n                            <option value=\"friend\">👫 友情</option>\n                            <option value=\"love\">💕 爱情</option>\n                            <option value=\"work\">💼 工作</option>\n                        </select>\n                    </div>\n                    <div style=\"margin-bottom: 12px;\">\n                        <label class=\"form-label\" style=\"font-size: 0.9rem;\">亲密度 (1-10)</label>\n                        <input type=\"range\" class=\"form-range\" id=\"supportIntimacy\" min=\"1\" max=\"10\" value=\"5\">\n                        <div style=\"text-align: center; color: #8b5cf6;\">亲密度: <span id=\"intimacyValue\">5</span></div>\n                    </div>\n                    <div style=\"margin-bottom: 12px;\">\n                        <label class=\"form-label\" style=\"font-size: 0.9rem;\">备注</label>\n                        <input type=\"text\" class=\"form-input\" id=\"supportNote\" placeholder=\"输入备注信息...\">\n                    </div>\n                    <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #a78bfa, #8b5cf6);\" onclick=\"saveSupport()\">➕ 添加联系人</button>\n                    <div style=\"margin-top: 12px; border-top: 1px solid rgba(167, 139, 250, 0.2); padding-top: 12px;\">\n                        <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;\">\n                            <span style=\"font-size: 0.85rem; color: #6a4a7a;\">📋 联系人列表</span>\n                            <button class=\"add-btn\" style=\"background: rgba(167, 139, 250, 0.2); font-size: 0.75rem;\" onclick=\"renderSupportHistory()\">🔄 查看</button>\n                        </div>\n                        <div id=\"supportHistoryList\" style=\"max-height: 100px; overflow-y: auto;\"></div>\n                    </div>\n                </div>\n\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(244, 114, 182, 0.1), rgba(236, 72, 153, 0.1)); grid-column: span 2;\">\n                    <div class=\"theory-title\"><i class=\"fas fa-heart\"></i> 情感再生活动库</div>\n                    <div class=\"responsive-grid\" style=\"display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;\">\n                        <button class=\"add-btn\" style=\"background: rgba(244, 114, 182, 0.3);\" onclick=\"recordActivity('sing')\">🎤 唱歌</button>\n                        <button class=\"add-btn\" style=\"background: rgba(244, 114, 182, 0.3);\" onclick=\"recordActivity('dance')\">💃 跳舞</button>\n                        <button class=\"add-btn\" style=\"background: rgba(244, 114, 182, 0.3);\" onclick=\"recordActivity('garden')\">🌱 园艺</button>\n                        <button class=\"add-btn\" style=\"background: rgba(244, 114, 182, 0.3);\" onclick=\"recordActivity('read')\">📚 读书</button>\n                        <button class=\"add-btn\" style=\"background: rgba(244, 114, 182, 0.3);\" onclick=\"recordActivity('park')\">🌳 逛公园</button>\n                        <button class=\"add-btn\" style=\"background: rgba(244, 114, 182, 0.3);\" onclick=\"recordActivity('museum')\">🏛️ 博物馆</button>\n                        <button class=\"add-btn\" style=\"background: rgba(244, 114, 182, 0.3);\" onclick=\"recordActivity('music')\">🎵 听音乐</button>\n                        <button class=\"add-btn\" style=\"background: rgba(244, 114, 182, 0.3);\" onclick=\"recordActivity('meditate')\">🧘 冥想</button>\n                    </div>\n                    <div style=\"margin-top: 12px; border-top: 1px solid rgba(244, 114, 182, 0.2); padding-top: 12px;\">\n                        <div style=\"display: flex; justify-content: space-between; align-items: center;\">\n                            <span style=\"font-size: 0.9rem; color: #8b7a7a;\">📋 活动记录</span>\n                            <button class=\"add-btn\" style=\"background: rgba(244, 114, 182, 0.2); font-size: 0.8rem;\" onclick=\"renderActivityHistory()\">🔄 刷新</button>\n                        </div>\n                        <div id=\"activityHistoryList\" style=\"max-height: 100px; overflow-y: auto; margin-top: 8px;\"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div id=\"emotional-history\" class=\"tab-content\">\n            <div class=\"responsive-grid\" style=\"display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;\">\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(196, 103, 156, 0.1), rgba(156, 90, 142, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-comment\"></i> 🗣️ 三明治批评法记录</div>\n                    <div style=\"max-height: 350px; overflow-y: auto;\">\n                        <div id=\"emotionalSandwichBoard\"></div>\n                    </div>\n                </div>\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(139, 92, 246, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-users\"></i> 👥 社会支持图谱</div>\n                    <div style=\"max-height: 350px; overflow-y: auto;\">\n                        <div id=\"emotionalSupportBoard\"></div>\n                    </div>\n                </div>\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(244, 114, 182, 0.1), rgba(236, 72, 153, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-heart\"></i> 🎨 情感再生活动</div>\n                    <div style=\"max-height: 350px; overflow-y: auto;\">\n                        <div id=\"emotionalActivityBoard\"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n    <!-- 思维账户详情页 -->\n    <div class=\"detail-page\" id=\"focusPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">🧠</div>\n            <h2 class=\"detail-title focus-theme\">思维账户</h2>\n            <div class=\"progress-ring\">\n                <svg viewBox=\"0 0 100 100\">\n                    <circle class=\"bg\" cx=\"50\" cy=\"50\" r=\"42\"/>\n                    <circle class=\"fg\" cx=\"50\" cy=\"50\" r=\"42\" stroke=\"#8b5e9e\" stroke-dasharray=\"264\" stroke-dashoffset=\"264\" opacity=\"0.25\"/>\n                </svg>\n                <div class=\"center\"><div class=\"number focus-theme\" id=\"focusProgress\">—</div><div class=\"label\">当前能量</div></div>\n            </div>\n        </div>\n        <div class=\"tabs\">\n            <button class=\"tab-btn active\" onclick=\"switchTab('focus', 'theory')\">📚 理论</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('focus', 'trend')\">📈 趋势</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('focus', 'record')\">✍️ 记录</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('focus', 'guide')\">💡 引导</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('focus', 'history')\">📝 历史</button>\n        </div>\n        <div id=\"focus-theory\" class=\"tab-content active\">\n            <div class=\"theory-card\">\n                <div class=\"theory-title\"><i class=\"fas fa-book\"></i> 心流理论与深度工作</div>\n                <div class=\"theory-text\">深度专注是最高质量的思维能量。根据契克森米哈赖的心流理论，当挑战与技能匹配时，我们会进入完全沉浸的状态。专注账户的核心是：保护深度工作时间，减少碎片化，保持高专注度的积累。</div>\n            </div>\n        </div>\n        <div id=\"focus-trend\" class=\"tab-content\"><div class=\"chart-container\" style=\"position: relative;\"><canvas id=\"focusChart\"></canvas><div id=\"focusChartEmpty\" style=\"position: absolute; inset: 50% 0 auto; text-align: center; color: #8b7a7a;\">待记录评分后展示趋势</div></div></div>\n        <div id=\"focus-record\" class=\"tab-content\">\n            <div class=\"record-form\">\n                <div class=\"form-group\">\n                    <label class=\"form-label\">今日得分 (0-100)</label>\n                    <input type=\"range\" class=\"form-range\" id=\"focusScoreInput\" min=\"0\" max=\"100\" oninput=\"updateScorePreview('focus', this.value)\">\n                    <div style=\"text-align: center; font-size: 1.5rem; font-weight: 700; color: #8b5e9e; margin-top: 8px;\" id=\"focusPreview\">待记录</div>\n                </div>\n                <div class=\"form-group\">\n                    <label class=\"form-label\">日期</label>\n                    <input type=\"date\" class=\"form-input\" id=\"focusDateInput\">\n                </div>\n                <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #8b5e9e, #6a4a7a);\" onclick=\"saveRecord('focus')\">保存记录</button>\n            </div>\n        </div>\n        <div id=\"focus-guide\" class=\"tab-content\">\n            <div class=\"responsive-grid\" style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;\">\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(139, 94, 158, 0.1), rgba(106, 74, 122, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-clock\"></i> 活动转换计时器</div>\n                    <div style=\"text-align: center; padding: 16px;\">\n                        <div id=\"switchTimer\" style=\"font-size: 2.5rem; font-weight: 700; color: #8b5e9e; font-family: monospace;\">90:00</div>\n                        <div id=\"switchStatus\" style=\"font-size: 1rem; color: #6a4a7a; margin-top: 8px;\">工作中...</div>\n                    </div>\n                    <div style=\"display: flex; gap: 8px; margin-bottom: 12px;\">\n                        <button class=\"add-btn\" style=\"flex: 1; background: linear-gradient(135deg, #8b5e9e, #6a4a7a);\" onclick=\"startSwitchTimer()\">▶️ 开始计时</button>\n                        <button class=\"add-btn\" style=\"flex: 1; background: rgba(200, 100, 100, 0.3);\" onclick=\"stopSwitchTimer()\">⏹️ 停止</button>\n                    </div>\n                    <div style=\"font-size: 0.8rem; color: #6a4a7a; padding: 0 8px;\">\n                        <p style=\"margin-bottom: 4px;\"><strong>💡 建议：</strong></p>\n                        <ul style=\"margin: 0; padding-left: 16px;\">\n                            <li>每90-120分钟切换活动</li>\n                            <li>从脑力转体力活动</li>\n                            <li>避免长时间单一思维</li>\n                        </ul>\n                    </div>\n                </div>\n\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(196, 103, 156, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-ban\"></i> 大脑放空区</div>\n                    <div style=\"text-align: center; padding: 20px;\">\n                        <div id=\"focusLockIcon\" style=\"font-size: 3rem; margin-bottom: 12px;\">🔓</div>\n                        <div id=\"focusLockStatus\" style=\"font-size: 1rem; color: #6a4a7a;\">未锁定</div>\n                    </div>\n                    <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #ec4899, #c4679c);\" onclick=\"toggleFocusLock()\">🔐 专注锁定</button>\n                    <div style=\"margin-top: 12px; font-size: 0.8rem; color: #6a4a7a; padding: 0 8px;\">\n                        <p>开启后：禁止刷手机，专注当前任务</p>\n                    </div>\n                </div>\n\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(107, 70, 193, 0.1)); grid-column: span 2;\">\n                    <div class=\"theory-title\"><i class=\"fas fa-book-open\"></i> 每日反思模板</div>\n                    <div class=\"responsive-grid\" style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;\">\n                        <div>\n                            <label class=\"form-label\" style=\"font-size: 0.9rem;\">🎯 今日挑战（上班途中思考）</label>\n                            <textarea class=\"form-input\" id=\"reflectionChallenge\" placeholder=\"今天工作中最大的挑战是什么？如何应对？\" style=\"min-height: 80px;\"></textarea>\n                        </div>\n                        <div>\n                            <label class=\"form-label\" style=\"font-size: 0.9rem;\">💡 今日收获</label>\n                            <textarea class=\"form-input\" id=\"reflectionGain\" placeholder=\"今天学到了什么新知识或新技能？\" style=\"min-height: 80px;\"></textarea>\n                        </div>\n                        <div>\n                            <label class=\"form-label\" style=\"font-size: 0.9rem;\">❌ 今日不足</label>\n                            <textarea class=\"form-input\" id=\"reflectionWeak\" placeholder=\"今天哪里可以做得更好？\" style=\"min-height: 80px;\"></textarea>\n                        </div>\n                        <div>\n                            <label class=\"form-label\" style=\"font-size: 0.9rem;\">📝 明日计划</label>\n                            <textarea class=\"form-input\" id=\"reflectionTomorrow\" placeholder=\"明天最重要的三件事是什么？\" style=\"min-height: 80px;\"></textarea>\n                        </div>\n                    </div>\n                    <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #8b5cf6, #6b46c1); margin-top: 12px;\" onclick=\"saveReflection()\">💾 保存反思</button>\n                    <div style=\"margin-top: 12px; border-top: 1px solid rgba(139, 92, 246, 0.2); padding-top: 12px;\">\n                        <div style=\"display: flex; justify-content: space-between; align-items: center;\">\n                            <span style=\"font-size: 0.9rem; color: #8b7a7a;\">📋 反思记录</span>\n                            <button class=\"add-btn\" style=\"background: rgba(139, 92, 246, 0.2); font-size: 0.8rem;\" onclick=\"renderReflectionHistory()\">🔄 刷新</button>\n                        </div>\n                        <div id=\"reflectionHistoryList\" style=\"max-height: 120px; overflow-y: auto; margin-top: 8px;\"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div id=\"focus-history\" class=\"tab-content\">\n            <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(139, 94, 158, 0.1), rgba(106, 74, 122, 0.1));\">\n                <div class=\"theory-title\"><i class=\"fas fa-book-open\"></i> 📝 每日反思记录看板</div>\n                <div style=\"max-height: 400px; overflow-y: auto;\">\n                    <div id=\"focusReflectionBoard\"></div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n    <!-- 意志账户详情页 -->\n    <div class=\"detail-page\" id=\"meaningPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">🔥</div>\n            <h2 class=\"detail-title meaning-theme\">意志账户</h2>\n            <div class=\"progress-ring\">\n                <svg viewBox=\"0 0 100 100\">\n                    <circle class=\"bg\" cx=\"50\" cy=\"50\" r=\"42\"/>\n                    <circle class=\"fg\" cx=\"50\" cy=\"50\" r=\"42\" stroke=\"#a78bfa\" stroke-dasharray=\"264\" stroke-dashoffset=\"264\" opacity=\"0.25\"/>\n                </svg>\n                <div class=\"center\"><div class=\"number meaning-theme\" id=\"meaningProgress\">—</div><div class=\"label\">当前能量</div></div>\n            </div>\n        </div>\n        <div class=\"tabs\">\n            <button class=\"tab-btn active\" onclick=\"switchTab('meaning', 'theory')\">📚 理论</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('meaning', 'trend')\">📈 趋势</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('meaning', 'record')\">✍️ 记录</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('meaning', 'guide')\">💡 引导</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('meaning', 'history')\">📝 历史</button>\n        </div>\n        <div id=\"meaning-theory\" class=\"tab-content active\">\n            <div class=\"theory-card\">\n                <div class=\"theory-title\"><i class=\"fas fa-book\"></i> 自我决定理论与价值观行动</div>\n                <div class=\"theory-text\">意义感来自自主、胜任、关联三种基本心理需求的满足。根据自我决定理论，当我们的行动与内在价值观一致时，会获得最深层的满足感。意义账户的核心是：将日常行动与深层价值观连接。</div>\n            </div>\n        </div>\n        <div id=\"meaning-trend\" class=\"tab-content\"><div class=\"chart-container\" style=\"position: relative;\"><canvas id=\"meaningChart\"></canvas><div id=\"meaningChartEmpty\" style=\"position: absolute; inset: 50% 0 auto; text-align: center; color: #8b7a7a;\">待记录评分后展示趋势</div></div></div>\n        <div id=\"meaning-record\" class=\"tab-content\">\n            <div class=\"record-form\">\n                <div class=\"form-group\">\n                    <label class=\"form-label\">今日得分 (0-100)</label>\n                    <input type=\"range\" class=\"form-range\" id=\"meaningScoreInput\" min=\"0\" max=\"100\" oninput=\"updateScorePreview('meaning', this.value)\">\n                    <div style=\"text-align: center; font-size: 1.5rem; font-weight: 700; color: #a78bfa; margin-top: 8px;\" id=\"meaningPreview\">待记录</div>\n                </div>\n                <div class=\"form-group\">\n                    <label class=\"form-label\">日期</label>\n                    <input type=\"date\" class=\"form-input\" id=\"meaningDateInput\">\n                </div>\n                <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #a78bfa, #8b6bda);\" onclick=\"saveRecord('meaning')\">保存记录</button>\n            </div>\n        </div>\n        <div id=\"meaning-guide\" class=\"tab-content\">\n            <div class=\"responsive-grid\" style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;\">\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(139, 92, 246, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-heart\"></i> 人生意义三问</div>\n                    <div style=\"margin-bottom: 12px;\">\n                        <label class=\"form-label\" style=\"font-size: 0.9rem;\">1. 早上起床的兴奋度 (1-10)</label>\n                        <input type=\"range\" class=\"form-range\" id=\"meaningQ1\" min=\"1\" max=\"10\" value=\"5\" data-selected=\"false\" oninput=\"updateMeaningScore(this)\">\n                        <div style=\"text-align: center; color: #a78bfa;\">得分: <span id=\"meaningQ1Value\">未选择</span></div>\n                    </div>\n                    <div style=\"margin-bottom: 12px;\">\n                        <label class=\"form-label\" style=\"font-size: 0.9rem;\">2. 享受过程的程度 (1-10)</label>\n                        <input type=\"range\" class=\"form-range\" id=\"meaningQ2\" min=\"1\" max=\"10\" value=\"5\" data-selected=\"false\" oninput=\"updateMeaningScore(this)\">\n                        <div style=\"text-align: center; color: #a78bfa;\">得分: <span id=\"meaningQ2Value\">未选择</span></div>\n                    </div>\n                    <div style=\"margin-bottom: 12px;\">\n                        <label class=\"form-label\" style=\"font-size: 0.9rem;\">3. 价值取向责任感 (1-10)</label>\n                        <input type=\"range\" class=\"form-range\" id=\"meaningQ3\" min=\"1\" max=\"10\" value=\"5\" data-selected=\"false\" oninput=\"updateMeaningScore(this)\">\n                        <div style=\"text-align: center; color: #a78bfa;\">得分: <span id=\"meaningQ3Value\">未选择</span></div>\n                    </div>\n                    <div style=\"text-align: center; padding: 12px; background: rgba(167, 139, 250, 0.2); border-radius: 12px;\">\n                        <div style=\"font-size: 2rem; font-weight: 700; color: #a78bfa;\" id=\"meaningTotalScore\">待评估</div>\n                        <div style=\"font-size: 0.9rem; color: #6a4a7a;\" id=\"meaningInterpretation\">请选择三项后查看结果</div>\n                    </div>\n                    <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #a78bfa, #8b5cf6); margin-top: 12px;\" onclick=\"saveMeaningQuiz()\">💾 保存评估</button>\n                    <div style=\"margin-top: 12px; border-top: 1px solid rgba(167, 139, 250, 0.2); padding-top: 12px;\">\n                        <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;\">\n                            <span style=\"font-size: 0.85rem; color: #6a4a7a;\">📋 评估历史</span>\n                            <button class=\"add-btn\" style=\"background: rgba(167, 139, 250, 0.2); font-size: 0.75rem;\" onclick=\"renderMeaningQuizHistory()\">🔄 查看</button>\n                        </div>\n                        <div id=\"meaningQuizHistoryList\" style=\"max-height: 80px; overflow-y: auto;\"></div>\n                    </div>\n                    <div style=\"margin-top: 12px;\">\n                        <canvas id=\"meaningQuizChart\" style=\"max-height: 100px;\"></canvas>\n                    </div>\n                </div>\n\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(232, 138, 76, 0.1), rgba(212, 112, 160, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-star\"></i> 价值观澄清</div>\n                    <div style=\"margin-bottom: 12px;\">\n                        <label class=\"form-label\" style=\"font-size: 0.9rem;\">💭 临终前最想做的三件事</label>\n                        <textarea class=\"form-input\" id=\"valueDeathbed\" placeholder=\"写下你临终前最想完成的三件事...\" style=\"min-height: 60px;\"></textarea>\n                    </div>\n                    <div style=\"margin-bottom: 12px;\">\n                        <label class=\"form-label\" style=\"font-size: 0.9rem;\">🏆 最敬重的人的三个品质</label>\n                        <textarea class=\"form-input\" id=\"valueAdmire\" placeholder=\"写下你最敬重的人的三个品质...\" style=\"min-height: 60px;\"></textarea>\n                    </div>\n                    <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #e88a4c, #d470a0);\" onclick=\"saveValues()\">💾 保存价值观</button>\n                    <div style=\"margin-top: 12px; border-top: 1px solid rgba(232, 138, 76, 0.2); padding-top: 12px;\">\n                        <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;\">\n                            <span style=\"font-size: 0.85rem; color: #6a4a7a;\">📋 价值观历史</span>\n                            <button class=\"add-btn\" style=\"background: rgba(232, 138, 76, 0.2); font-size: 0.75rem;\" onclick=\"renderValuesHistory()\">🔄 查看</button>\n                        </div>\n                        <div id=\"valuesHistoryList\" style=\"max-height: 80px; overflow-y: auto;\"></div>\n                    </div>\n                </div>\n\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(52, 211, 153, 0.1)); grid-column: span 2;\">\n                    <div class=\"theory-title\"><i class=\"fas fa-flag\"></i> 仪式感创建器</div>\n                    <div class=\"responsive-grid\" style=\"display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;\">\n                        <div>\n                            <label class=\"form-label\" style=\"font-size: 0.9rem;\">🕐 时间</label>\n                            <input type=\"text\" class=\"form-input\" id=\"ritualTime\" placeholder=\"如：早上7点\">\n                        </div>\n                        <div>\n                            <label class=\"form-label\" style=\"font-size: 0.9rem;\">📍 地点</label>\n                            <input type=\"text\" class=\"form-input\" id=\"ritualPlace\" placeholder=\"如：书房\">\n                        </div>\n                        <div>\n                            <label class=\"form-label\" style=\"font-size: 0.9rem;\">✨ 动作</label>\n                            <input type=\"text\" class=\"form-input\" id=\"ritualAction\" placeholder=\"如：点燃蜡烛\">\n                        </div>\n                    </div>\n                    <div style=\"margin-top: 12px;\">\n                        <label class=\"form-label\" style=\"font-size: 0.9rem;\">📝 仪式描述</label>\n                        <textarea class=\"form-input\" id=\"ritualDesc\" placeholder=\"描述这个仪式的意义和感受...\" style=\"min-height: 60px;\"></textarea>\n                    </div>\n                    <div style=\"display: flex; gap: 12px; margin-top: 12px;\">\n                        <button class=\"add-btn\" style=\"flex: 1; background: linear-gradient(135deg, #4ade80, #22c55e);\" onclick=\"saveRitual()\">➕ 创建仪式</button>\n                        <button class=\"add-btn\" style=\"flex: 1; background: rgba(74, 222, 128, 0.3);\" onclick=\"renderRitualList()\">📋 查看仪式</button>\n                    </div>\n                    <div id=\"ritualList\" style=\"margin-top: 12px; max-height: 100px; overflow-y: auto;\"></div>\n                </div>\n            </div>\n        </div>\n        <div id=\"meaning-history\" class=\"tab-content\">\n            <div class=\"guide-card\" style=\"margin-bottom: 20px; background: linear-gradient(135deg, rgba(167,139,250,0.1), rgba(139,92,246,0.1));\">\n                <div class=\"theory-title\"><i class=\"fas fa-chart-line\"></i> ❓ 人生意义三问趋势</div>\n                <div class=\"chart-container\" style=\"height: 200px;\">\n                    <canvas id=\"meaningQuizHistoryChart\"></canvas>\n                </div>\n            </div>\n            <div class=\"responsive-grid\" style=\"display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;\">\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(139, 92, 246, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-heart\"></i> ❓ 人生意义三问记录</div>\n                    <div style=\"max-height: 350px; overflow-y: auto;\">\n                        <div id=\"meaningQuizBoard\"></div>\n                    </div>\n                </div>\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(232, 138, 76, 0.1), rgba(212, 112, 160, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-star\"></i> 💎 价值观澄清记录</div>\n                    <div style=\"max-height: 350px; overflow-y: auto;\">\n                        <div id=\"meaningValuesBoard\"></div>\n                    </div>\n                </div>\n                <div class=\"guide-card\" style=\"background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(52, 211, 153, 0.1));\">\n                    <div class=\"theory-title\"><i class=\"fas fa-flag\"></i> ✨ 仪式感记录</div>\n                    <div style=\"max-height: 350px; overflow-y: auto;\">\n                        <div id=\"meaningRitualBoard\"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n    <!-- 连续打卡详情页 -->\n    <div class=\"detail-page\" id=\"streakPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">🔥</div>\n            <h2 class=\"detail-title streak-theme\">连续打卡看板</h2>\n            <div class=\"progress-ring\">\n                <svg viewBox=\"0 0 100 100\">\n                    <circle class=\"bg\" cx=\"50\" cy=\"50\" r=\"42\"/>\n                    <circle class=\"fg\" cx=\"50\" cy=\"50\" r=\"42\" stroke=\"#ffb347\" stroke-dasharray=\"264\" stroke-dashoffset=\"264\" opacity=\"0.25\"/>\n                </svg>\n                <div class=\"center\"><div class=\"number streak-theme\" id=\"streakProgress\">0</div><div class=\"label\">连续天数</div></div>\n            </div>\n        </div>\n        <div class=\"tabs\">\n            <button class=\"tab-btn active\" onclick=\"switchTab('streak', 'record')\">✍️ 打卡记录</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('streak', 'trend')\">📈 打卡趋势</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('streak', 'analysis')\">📊 数据分析</button>\n        </div>\n        <div id=\"streak-record\" class=\"tab-content active\">\n            <div class=\"record-form\">\n                <div class=\"form-group\">\n                    <label class=\"form-label\">今日打卡</label>\n                    <input type=\"date\" class=\"form-input\" id=\"streakDateInput\">\n                </div>\n                <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #ffb347, #ff6b9d);\" onclick=\"recordStreak()\">打卡！</button>\n            </div>\n            <div class=\"history-list\" id=\"streakHistoryList\"></div>\n        </div>\n        <div id=\"streak-trend\" class=\"tab-content\"><div class=\"chart-container\"><canvas id=\"streakChart\"></canvas></div></div>\n        <div id=\"streak-analysis\" class=\"tab-content\">\n            <div class=\"guide-card\">\n                <div class=\"theory-title\"><i class=\"fas fa-chart-pie\"></i> 打卡分析</div>\n                <ul class=\"guide-list\">\n                    <li><i class=\"fas fa-star\"></i> 你的最长连续打卡：<span id=\"streakLongest\">0天</span></li>\n                    <li><i class=\"fas fa-calendar-check\"></i> 本月打卡率：<span id=\"streakMonthRate\">0%</span></li>\n                    <li><i class=\"fas fa-clock\"></i> 最常打卡时段：<span id=\"streakCommonTime\">暂无数据</span></li>\n                    <li><i class=\"fas fa-trophy\"></i> 统计仅依据已保存的打卡记录。</li>\n                </ul>\n            </div>\n        </div>\n    </div>\n\n    <!-- 完成任务详情页 -->\n    <div class=\"detail-page\" id=\"tasksPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">✅</div>\n            <h2 class=\"detail-title tasks-theme\">完成任务看板</h2>\n            <div class=\"progress-ring\">\n                <svg viewBox=\"0 0 100 100\">\n                    <circle class=\"bg\" cx=\"50\" cy=\"50\" r=\"42\"/>\n                    <circle class=\"fg\" cx=\"50\" cy=\"50\" r=\"42\" stroke=\"#74ebd5\" stroke-dasharray=\"264\" stroke-dashoffset=\"264\" opacity=\"0.25\"/>\n                </svg>\n                <div class=\"center\"><div class=\"number tasks-theme\" id=\"tasksProgress\">0</div><div class=\"label\">累计完成</div></div>\n            </div>\n        </div>\n        <div class=\"tabs\">\n            <button class=\"tab-btn active\" onclick=\"switchTab('tasks', 'all')\">📋 全部任务</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('tasks', 'trend')\">📈 趋势分析</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('tasks', 'distribution')\">🎯 分布统计</button>\n        </div>\n        <div id=\"tasks-all\" class=\"tab-content active\">\n            <div class=\"history-list\" id=\"allTasksList\"></div>\n        </div>\n        <div id=\"tasks-trend\" class=\"tab-content\"><div class=\"chart-container\"><canvas id=\"tasksChart\"></canvas></div></div>\n        <div id=\"tasks-distribution\" class=\"tab-content\">\n            <div class=\"guide-card\">\n                <div class=\"theory-title\"><i class=\"fas fa-chart-pie\"></i> 任务分布</div>\n                <ul class=\"guide-list\">\n                    <li><i class=\"fas fa-running\"></i> 体能任务：12个</li>\n                    <li><i class=\"fas fa-heart\"></i> 情绪任务：10个</li>\n                    <li><i class=\"fas fa-bullseye\"></i> 思维任务：13个</li>\n                    <li><i class=\"fas fa-star\"></i> 意志任务：7个</li>\n                </ul>\n            </div>\n        </div>\n    </div>\n\n    <!-- 平均得分详情页 -->\n    <div class=\"detail-page\" id=\"avgPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">📊</div>\n            <h2 class=\"detail-title avg-theme\">平均得分看板</h2>\n            <div class=\"progress-ring\">\n                <svg viewBox=\"0 0 100 100\">\n                    <circle class=\"bg\" cx=\"50\" cy=\"50\" r=\"42\"/>\n                    <circle class=\"fg\" cx=\"50\" cy=\"50\" r=\"42\" stroke=\"#667eea\" stroke-dasharray=\"264\" stroke-dashoffset=\"38\"/>\n                </svg>\n                <div class=\"center\"><div class=\"number avg-theme\" id=\"avgProgress\">—</div><div class=\"label\">平均得分</div></div>\n            </div>\n        </div>\n        <div class=\"tabs\">\n            <button class=\"tab-btn active\" onclick=\"switchTab('avg', 'trend')\">📈 得分趋势</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('avg', 'compare')\">🆚 账户对比</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('avg', 'insights')\">💡 深度洞察</button>\n        </div>\n        <div id=\"avg-trend\" class=\"tab-content active\"><div class=\"chart-container\" style=\"position: relative;\"><canvas id=\"avgChart\"></canvas><div id=\"avgChartEmpty\" style=\"position: absolute; inset: 50% 0 auto; text-align: center; color: #8b7a7a;\">待记录账户评分后展示趋势</div></div></div>\n        <div id=\"avg-compare\" class=\"tab-content\"><div class=\"chart-container\" style=\"position: relative;\"><canvas id=\"compareChart\"></canvas><div id=\"compareChartEmpty\" style=\"position: absolute; inset: 50% 0 auto; text-align: center; color: #8b7a7a;\">待录入账户评分后展示对比</div></div></div>\n        <div id=\"avg-insights\" class=\"tab-content\">\n            <div class=\"guide-card\">\n                <div class=\"theory-title\"><i class=\"fas fa-lightbulb\"></i> 数据使用说明</div>\n                <ul class=\"guide-list\">\n                    <li><i class=\"fas fa-brain\"></i> 趋势只汇总已记录的账户评分，缺失日期保持空白</li>\n                    <li><i class=\"fas fa-heart\"></i> 已记录的 0 分会按 0 分参与展示与汇总</li>\n                    <li><i class=\"fas fa-anchor\"></i> 保存评分后，账户趋势与对比将基于这些记录更新</li>\n                    <li><i class=\"fas fa-snowflake\"></i> 此处不预设个人评价；请结合自己的记录理解结果</li>\n                </ul>\n            </div>\n        </div>\n    </div>\n\n    <!-- 写作详情页 -->\n    <div class=\"detail-page\" id=\"writingPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">✍️</div>\n            <h2 class=\"detail-title\" style=\"background: linear-gradient(135deg, #e88a4c, #d470a0); -webkit-background-clip: text; background-clip: text; color: transparent;\">小小号写作中</h2>\n        </div>\n        <div class=\"tabs\">\n            <button class=\"tab-btn active\" onclick=\"switchMediaTab('writing', 'list')\">📝 文档列表</button>\n            <button class=\"tab-btn\" onclick=\"switchMediaTab('writing', 'editor')\">✍️ 写作</button>\n        </div>\n        <div id=\"writing-list\" class=\"tab-content active\">\n            <div class=\"record-form\" style=\"margin-bottom: 16px;\">\n                <div class=\"form-group\">\n                    <label class=\"form-label\">新建文档标题</label>\n                    <input type=\"text\" class=\"form-input\" id=\"writingTitleInput\" placeholder=\"输入文档标题...\">\n                </div>\n                <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #e88a4c, #d470a0);\" onclick=\"createWriting()\">+ 创建新文档</button>\n            </div>\n            <div id=\"writingDocsList\"></div>\n        </div>\n        <div id=\"writing-editor\" class=\"tab-content\">\n            <div style=\"margin-bottom: 16px;\">\n                <input type=\"text\" class=\"form-input\" id=\"writingDocTitle\" placeholder=\"文档标题\" style=\"font-size: 1.2rem; font-weight: 600; margin-bottom: 12px;\">\n            </div>\n            <textarea class=\"text-editor\" id=\"writingContent\" placeholder=\"开始写作吧...在这里记录你的灵感、想法和故事。\"></textarea>\n            <div style=\"margin-top: 12px; display: flex; gap: 12px;\">\n                <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #e88a4c, #d470a0);\" onclick=\"saveWriting()\">💾 保存</button>\n                <button class=\"add-btn\" style=\"background: rgba(200, 160, 200, 0.3);\" onclick=\"switchMediaTab('writing', 'list')\">取消</button>\n            </div>\n        </div>\n    </div>\n\n    <!-- 摆烂运营详情页 -->\n    <div class=\"detail-page\" id=\"lazyyPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">😴</div>\n            <h2 class=\"detail-title\" style=\"background: linear-gradient(135deg, #f093fb, #f5576c); -webkit-background-clip: text; background-clip: text; color: transparent;\">OMG摆烂运营中</h2>\n        </div>\n        <div class=\"tabs\">\n            <button class=\"tab-btn active\" onclick=\"switchMediaTab('lazyy', 'list')\">💤 想法列表</button>\n            <button class=\"tab-btn\" onclick=\"switchMediaTab('lazyy', 'editor')\">✍️ 记录</button>\n        </div>\n        <div id=\"lazyy-list\" class=\"tab-content active\">\n            <div class=\"record-form\" style=\"margin-bottom: 16px;\">\n                <div class=\"form-group\">\n                    <label class=\"form-label\">新想法标题</label>\n                    <input type=\"text\" class=\"form-input\" id=\"lazyyTitleInput\" placeholder=\"输入想法标题...\">\n                </div>\n                <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #f093fb, #f5576c);\" onclick=\"createLazyy()\">+ 记录想法</button>\n            </div>\n            <div id=\"lazyyDocsList\"></div>\n        </div>\n        <div id=\"lazyy-editor\" class=\"tab-content\">\n            <input type=\"text\" class=\"form-input\" id=\"lazyyDocTitle\" placeholder=\"想法标题\" style=\"font-size: 1.2rem; font-weight: 600; margin-bottom: 12px;\">\n            <textarea class=\"text-editor\" id=\"lazyyContent\" placeholder=\"详细记录你的摆烂运营想法...\"></textarea>\n            <div style=\"margin-top: 12px; display: flex; gap: 12px;\">\n                <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #f093fb, #f5576c);\" onclick=\"saveLazyy()\">💾 保存</button>\n                <button class=\"add-btn\" style=\"background: rgba(200, 160, 200, 0.3);\" onclick=\"switchMediaTab('lazyy', 'list')\">取消</button>\n            </div>\n        </div>\n    </div>\n\n    <!-- 接广告详情页 -->\n    <div class=\"detail-page\" id=\"adsPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">💰</div>\n            <h2 class=\"detail-title\" style=\"background: linear-gradient(135deg, #11998e, #38ef7d); -webkit-background-clip: text; background-clip: text; color: transparent;\">接广告赚钱钱钱钱</h2>\n        </div>\n        <div class=\"tabs\">\n            <button class=\"tab-btn active\" onclick=\"switchMediaTab('ads', 'list')\">💵 记录列表</button>\n            <button class=\"tab-btn\" onclick=\"switchMediaTab('ads', 'editor')\">✍️ 记录</button>\n        </div>\n        <div id=\"ads-list\" class=\"tab-content active\">\n            <div class=\"record-form\" style=\"margin-bottom: 16px;\">\n                <div class=\"form-group\">\n                    <label class=\"form-label\">广告记录标题</label>\n                    <input type=\"text\" class=\"form-input\" id=\"adsTitleInput\" placeholder=\"输入记录标题（品牌名/合作类型）...\">\n                </div>\n                <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #11998e, #38ef7d);\" onclick=\"createAds()\">+ 添加记录</button>\n            </div>\n            <div id=\"adsDocsList\"></div>\n        </div>\n        <div id=\"ads-editor\" class=\"tab-content\">\n            <input type=\"text\" class=\"form-input\" id=\"adsDocTitle\" placeholder=\"广告合作标题\" style=\"font-size: 1.2rem; font-weight: 600; margin-bottom: 12px;\">\n            <textarea class=\"text-editor\" id=\"adsContent\" placeholder=\"记录广告合作详情：品牌名、报价、沟通进度、落地情况等...\"></textarea>\n            <div style=\"margin-top: 12px; display: flex; gap: 12px;\">\n                <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #11998e, #38ef7d);\" onclick=\"saveAds()\">💾 保存</button>\n                <button class=\"add-btn\" style=\"background: rgba(200, 160, 200, 0.3);\" onclick=\"switchMediaTab('ads', 'list')\">取消</button>\n            </div>\n        </div>\n    </div>\n\n    <!-- 新想法详情页 -->\n    <div class=\"detail-page\" id=\"ideasPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">💡</div>\n            <h2 class=\"detail-title\" style=\"background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; background-clip: text; color: transparent;\">新的想法和探索</h2>\n        </div>\n        <div class=\"tabs\">\n            <button class=\"tab-btn active\" onclick=\"switchMediaTab('ideas', 'list')\">💡 灵感列表</button>\n            <button class=\"tab-btn\" onclick=\"switchMediaTab('ideas', 'vault')\">🧺 想法仓库</button>\n            <button class=\"tab-btn\" onclick=\"switchMediaTab('ideas', 'analysis')\">🎯 对标分析</button>\n            <button class=\"tab-btn\" onclick=\"switchMediaTab('ideas', 'ip')\">💼 IP商业分析</button>\n            <button class=\"tab-btn\" onclick=\"switchMediaTab('ideas', 'skills')\">📚 新技能学习</button>\n        </div>\n        <div id=\"ideas-list\" class=\"tab-content active\">\n            <div class=\"record-form\" style=\"margin-bottom: 16px;\">\n                <div class=\"form-group\">\n                    <label class=\"form-label\">灵感标题</label>\n                    <input type=\"text\" class=\"form-input\" id=\"ideasTitleInput\" placeholder=\"输入灵感标题...\">\n                </div>\n                <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #667eea, #764ba2);\" onclick=\"createIdeas()\">+ 记录灵感</button>\n            </div>\n            <div id=\"ideasDocsList\"></div>\n        </div>\n        <div id=\"ideas-editor\" class=\"tab-content\">\n            <input type=\"text\" class=\"form-input\" id=\"ideasDocTitle\" placeholder=\"灵感标题\" style=\"font-size: 1.2rem; font-weight: 600; margin-bottom: 12px;\">\n            <textarea class=\"text-editor\" id=\"ideasContent\" placeholder=\"详细记录你的新想法和探索方向...\"></textarea>\n            <div style=\"margin-top: 12px; display: flex; gap: 12px;\">\n                <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #667eea, #764ba2);\" onclick=\"saveIdeas()\">💾 保存</button>\n                <button class=\"add-btn\" style=\"background: rgba(200, 160, 200, 0.3);\" onclick=\"switchMediaTab('ideas', 'list')\">取消</button>\n            </div>\n        </div>\n        <div id=\"ideas-vault\" class=\"tab-content\">\n            <div class=\"idea-vault-layout\">\n                <div class=\"idea-vault-column\">\n                    <div class=\"idea-vault-panel\">\n                        <div class=\"idea-vault-panel-title\">\n                            <span>1. 收集箱</span>\n                            <span class=\"idea-vault-kicker\">先存原话</span>\n                        </div>\n                        <div class=\"form-group\">\n                            <label class=\"form-label\">想法</label>\n                            <textarea class=\"idea-vault-textarea\" id=\"ideaVaultIdea\" placeholder=\"一句原话就行，不用润色。\"></textarea>\n                        </div>\n                        <div class=\"idea-vault-mini-grid\">\n                            <div class=\"form-group\">\n                                <label class=\"form-label\">触发它的原因</label>\n                                <textarea class=\"idea-vault-textarea compact\" id=\"ideaVaultTrigger\" placeholder=\"来自对话、文章、经历、问题...\"></textarea>\n                            </div>\n                            <div class=\"form-group\">\n                                <label class=\"form-label\">它可能属于哪个主题</label>\n                                <input type=\"text\" class=\"form-input\" id=\"ideaVaultMotif\" list=\"ideaVaultMotifList\" placeholder=\"可留空\">\n                                <datalist id=\"ideaVaultMotifList\"></datalist>\n                            </div>\n                        </div>\n                        <div class=\"idea-vault-mini-grid\">\n                            <div class=\"form-group\">\n                                <label class=\"form-label\">我还不确定的地方</label>\n                                <textarea class=\"idea-vault-textarea compact\" id=\"ideaVaultUncertainty\" placeholder=\"卡在哪里、缺什么证据...\"></textarea>\n                            </div>\n                            <div class=\"form-group\">\n                                <label class=\"form-label\">下一步</label>\n                                <textarea class=\"idea-vault-textarea compact\" id=\"ideaVaultNextStep\" placeholder=\"查资料、问人、做小实验...\"></textarea>\n                            </div>\n                        </div>\n                        <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #667eea, #38bdf8);\" onclick=\"createIdeaVaultFragment()\">+ 收进仓库</button>\n                    </div>\n\n                    <div class=\"idea-vault-panel\">\n                        <div class=\"idea-vault-panel-title\">\n                            <span>2. 想法母题</span>\n                            <span id=\"ideaVaultMotifCount\" class=\"idea-vault-kicker\">0 个</span>\n                        </div>\n                        <div class=\"idea-vault-input-row\">\n                            <input type=\"text\" class=\"form-input\" id=\"ideaVaultMotifName\" placeholder=\"新增母题\">\n                            <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #11998e, #38ef7d);\" onclick=\"addIdeaVaultMotif()\">添加</button>\n                        </div>\n                        <div id=\"ideaVaultMotifs\" class=\"idea-vault-list compact-list\"></div>\n                    </div>\n                </div>\n\n                <div class=\"idea-vault-column\">\n                    <div class=\"idea-vault-panel\">\n                        <div class=\"idea-vault-panel-title\">\n                            <span>收集箱碎片</span>\n                            <span id=\"ideaVaultInboxCount\" class=\"idea-vault-kicker\">0 条</span>\n                        </div>\n                        <div id=\"ideaVaultInbox\" class=\"idea-vault-list\"></div>\n                    </div>\n\n                    <div class=\"idea-vault-panel\">\n                        <div class=\"idea-vault-panel-title\">\n                            <span>3. 可推进条目</span>\n                            <span id=\"ideaVaultActionCount\" class=\"idea-vault-kicker\">0 条</span>\n                        </div>\n                        <div class=\"idea-vault-action-form\">\n                            <select class=\"form-select\" id=\"ideaVaultActionSource\"></select>\n                            <select class=\"form-select\" id=\"ideaVaultActionType\">\n                                <option>问题</option>\n                                <option>假设</option>\n                                <option>待验证点</option>\n                                <option>行动任务</option>\n                                <option>文章/产品/方案骨架</option>\n                            </select>\n                            <input type=\"text\" class=\"form-input\" id=\"ideaVaultActionTitle\" placeholder=\"可推进条目\">\n                            <textarea class=\"idea-vault-textarea compact\" id=\"ideaVaultActionNext\" placeholder=\"下一步怎么验证或推进\"></textarea>\n                            <button class=\"add-btn\" style=\"width: 100%; background: linear-gradient(135deg, #e88a4c, #d470a0);\" onclick=\"createIdeaVaultAction()\">+ 变成可推进条目</button>\n                        </div>\n                        <div id=\"ideaVaultActions\" class=\"idea-vault-list compact-list\"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div id=\"ideas-analysis\" class=\"tab-content\">\n            <div style=\"margin-bottom: 16px;\">\n                <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #667eea, #764ba2);\" onclick=\"addAnalysisItem()\">+ 添加创作者分析</button>\n            </div>\n            <div id=\"analysisList\"></div>\n        </div>\n        <div id=\"ideas-ip\" class=\"tab-content\">\n            <div style=\"margin-bottom: 16px;\">\n                <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #11998e, #38ef7d);\" onclick=\"addIPItem()\">+ 添加商业分析</button>\n            </div>\n            <div id=\"ipList\"></div>\n        </div>\n        <div id=\"ideas-skills\" class=\"tab-content\">\n            <div style=\"margin-bottom: 16px;\">\n                <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #e88a4c, #d470a0);\" onclick=\"addSkillItem()\">+ 添加学习技能</button>\n            </div>\n            <div id=\"skillsList\"></div>\n        </div>\n    </div>\n\n    <!-- 番茄钟详情页 -->\n    <div class=\"detail-page\" id=\"pomodoroPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">🍅</div>\n            <h2 class=\"detail-title\" style=\"background: linear-gradient(135deg, #8b5e9e, #6a4a7a); -webkit-background-clip: text; background-clip: text; color: transparent;\">番茄钟专注记录</h2>\n        </div>\n        <div class=\"tabs\">\n            <button class=\"tab-btn active\" onclick=\"switchMediaTab('pomodoro', 'stats')\">📊 统计数据</button>\n            <button class=\"tab-btn\" onclick=\"switchMediaTab('pomodoro', 'history')\">📝 历史记录</button>\n        </div>\n        <div id=\"pomodoro-stats\" class=\"tab-content active\">\n            <div class=\"guide-card\">\n                <div class=\"theory-title\"><i class=\"fas fa-chart-bar\"></i> 本周专注统计</div>\n                <ul class=\"guide-list\">\n                    <li><i class=\"fas fa-fire\"></i> 总专注次数：<strong id=\"pomodoroTotalCount\">0</strong> 次</li>\n                    <li><i class=\"fas fa-clock\"></i> 总专注时长：<strong id=\"pomodoroTotalTime\">0</strong> 分钟</li>\n                    <li><i class=\"fas fa-calendar\"></i> 日均专注：<strong id=\"pomodoroAvgCount\">0</strong> 次</li>\n                    <li><i class=\"fas fa-trophy\"></i> 最长连续专注：<strong id=\"pomodoroBestStreak\">0</strong> 天</li>\n                </ul>\n            </div>\n            <div class=\"chart-container\"><canvas id=\"pomodoroChart\"></canvas></div>\n        </div>\n        <div id=\"pomodoro-history\" class=\"tab-content\">\n            <div id=\"pomodoroHistoryList\"></div>\n        </div>\n    </div>\n\n    <!-- 每周复盘详情页 -->\n    <div class=\"detail-page\" id=\"reviewDetailPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">🔄</div>\n            <h2 class=\"detail-title\" style=\"background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; background-clip: text; color: transparent;\">复盘详情</h2>\n        </div>\n        <div id=\"reviewDetailContent\"></div>\n    </div>\n\n    <!-- DeepSeek聊什么详情页 -->\n    <div class=\"detail-page\" id=\"deepseekPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">🤖</div>\n            <h2 class=\"detail-title\" style=\"background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; background-clip: text; color: transparent;\">又在和DeepSeek聊什么</h2>\n        </div>\n        <div style=\"display: flex; gap: 12px; margin-bottom: 20px;\">\n            <div class=\"goal-input-area\" style=\"flex: 1;\">\n                <input type=\"text\" id=\"deepseekSearch\" placeholder=\"🔍 关键词搜索文档...\">\n                <button class=\"add-btn\" onclick=\"searchDeepSeekDocs()\" style=\"background: linear-gradient(135deg, #667eea, #764ba2);\">搜索</button>\n            </div>\n        </div>\n        <div style=\"display: flex; gap: 20px;\">\n            <div style=\"flex: 0 0 280px;\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;\">\n                    <h3 style=\"color: #6a4a7a; font-weight: 600; font-size: 1rem;\">📚 合集分类</h3>\n                    <button class=\"add-btn\" style=\"padding: 6px 12px; font-size: 0.8rem; background: linear-gradient(135deg, #667eea, #764ba2);\" onclick=\"addDeepSeekCategory()\">+ 新建</button>\n                </div>\n                <div id=\"deepseekCategories\" style=\"background: rgba(255,255,255,0.5); border-radius: 16px; padding: 12px;\"></div>\n            </div>\n            <div style=\"flex: 1;\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;\">\n                    <h3 style=\"color: #6a4a7a; font-weight: 600; font-size: 1rem;\" id=\"deepseekCurrentTitle\">📝 全部文档</h3>\n                    <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #667eea, #764ba2);\" onclick=\"openDeepSeekEditor()\">+ 新建文档</button>\n                </div>\n                <div id=\"deepseekDocs\" style=\"display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;\"></div>\n            </div>\n        </div>\n    </div>\n\n    <!-- 文学创作类中心 -->\n    <div class=\"detail-page\" id=\"literaturePage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">📚</div>\n            <h2 class=\"detail-title\" style=\"background: linear-gradient(135deg, #e88a4c, #d470a0); -webkit-background-clip: text; background-clip: text; color: transparent;\">文学创作类中心</h2>\n        </div>\n        <div style=\"display: flex; gap: 12px; margin-bottom: 20px;\">\n            <div class=\"goal-input-area\" style=\"flex: 1;\">\n                <input type=\"text\" id=\"literatureSearch\" placeholder=\"🔍 关键词搜索文档...\">\n                <button class=\"add-btn\" onclick=\"searchLiteratureDocs()\" style=\"background: linear-gradient(135deg, #e88a4c, #d470a0);\">搜索</button>\n            </div>\n        </div>\n        <div style=\"display: flex; gap: 20px;\">\n            <div style=\"flex: 0 0 280px;\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;\">\n                    <h3 style=\"color: #6a4a7a; font-weight: 600; font-size: 1rem;\">📚 合集分类</h3>\n                    <button class=\"add-btn\" style=\"padding: 6px 12px; font-size: 0.8rem; background: linear-gradient(135deg, #e88a4c, #d470a0);\" onclick=\"addLiteratureCategory()\">+ 新建</button>\n                </div>\n                <div id=\"literatureCategories\" style=\"background: rgba(255,255,255,0.5); border-radius: 16px; padding: 12px;\"></div>\n            </div>\n            <div style=\"flex: 1;\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;\">\n                    <h3 style=\"color: #6a4a7a; font-weight: 600; font-size: 1rem;\" id=\"literatureCurrentTitle\">📝 全部文档</h3>\n                    <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #e88a4c, #d470a0);\" onclick=\"openLiteratureEditor()\">+ 新建文档</button>\n                </div>\n                <div id=\"literatureDocs\" style=\"display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;\"></div>\n            </div>\n        </div>\n    </div>\n\n    <!-- 小说大纲 -->\n    <div class=\"detail-page\" id=\"novelOutlinePage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">🗺️</div>\n            <h2 class=\"detail-title\" style=\"background: linear-gradient(135deg, #e88a4c, #d470a0); -webkit-background-clip: text; background-clip: text; color: transparent;\">小说大纲构建器</h2>\n        </div>\n        <div style=\"display: flex; gap: 12px; margin-bottom: 20px;\">\n            <div class=\"goal-input-area\" style=\"flex: 1;\">\n                <input type=\"text\" id=\"novelSearch\" placeholder=\"🔍 搜索小说大纲...\">\n                <button class=\"add-btn\" onclick=\"searchNovelOutlines()\" style=\"background: linear-gradient(135deg, #e88a4c, #d470a0);\">搜索</button>\n            </div>\n        </div>\n        <div style=\"display: flex; gap: 20px;\">\n            <div style=\"flex: 1;\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;\">\n                    <h3 style=\"color: #6a4a7a; font-weight: 600; font-size: 1rem;\">📖 我的小说大纲</h3>\n                    <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #e88a4c, #d470a0);\" onclick=\"openNovelOutlineEditor()\">+ 创建新小说</button>\n                </div>\n                <div id=\"novelOutlineList\" style=\"display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;\"></div>\n            </div>\n        </div>\n    </div>\n\n    <!-- 学习模块 - 对标分析/IP商业分析/新技能学习 -->\n    <div class=\"detail-page\" id=\"learningPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\" id=\"learningIcon\">🎯</div>\n            <h2 class=\"detail-title\" id=\"learningPageTitle\" style=\"background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; background-clip: text; color: transparent;\">学习笔记</h2>\n        </div>\n        <div style=\"display: flex; gap: 12px; margin-bottom: 20px;\">\n            <div class=\"goal-input-area\" style=\"flex: 1;\">\n                <input type=\"text\" id=\"learningSearch\" placeholder=\"🔍 搜索笔记...\">\n                <button class=\"add-btn\" onclick=\"searchLearningNotes()\" style=\"background: linear-gradient(135deg, #667eea, #764ba2);\">搜索</button>\n            </div>\n        </div>\n        <div style=\"display: flex; gap: 20px;\">\n            <div style=\"flex: 0 0 280px;\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;\">\n                    <h3 style=\"color: #6a4a7a; font-weight: 600; font-size: 1rem;\">📚 分类</h3>\n                    <button class=\"add-btn\" style=\"padding: 6px 12px; font-size: 0.8rem; background: linear-gradient(135deg, #667eea, #764ba2);\" onclick=\"addLearningCategory()\">+ 新建</button>\n                </div>\n                <div id=\"learningCategories\" style=\"background: rgba(255,255,255,0.5); border-radius: 16px; padding: 12px;\"></div>\n            </div>\n            <div style=\"flex: 1;\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;\">\n                    <h3 style=\"color: #6a4a7a; font-weight: 600; font-size: 1rem;\" id=\"learningCurrentTitle\">📝 全部笔记</h3>\n                    <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #667eea, #764ba2);\" onclick=\"openLearningEditor()\">+ 新建笔记</button>\n                </div>\n                <div id=\"learningNotes\" style=\"display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;\"></div>\n            </div>\n        </div>\n    </div>\n\n    <!-- 读书笔记 -->\n    <div class=\"detail-page\" id=\"readingNotePage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">📖</div>\n            <h2 class=\"detail-title\" style=\"background: linear-gradient(135deg, #74ebd5, #9face6); -webkit-background-clip: text; background-clip: text; color: transparent;\">读书笔记</h2>\n        </div>\n        <div style=\"display: flex; gap: 12px; margin-bottom: 20px;\">\n            <div class=\"goal-input-area\" style=\"flex: 1;\">\n                <input type=\"text\" id=\"readingSearch\" placeholder=\"🔍 搜索书籍笔记...\">\n                <button class=\"add-btn\" onclick=\"searchReadingNotes()\" style=\"background: linear-gradient(135deg, #74ebd5, #9face6);\">搜索</button>\n            </div>\n        </div>\n        <div style=\"display: flex; gap: 20px;\">\n            <div style=\"flex: 0 0 280px;\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;\">\n                    <h3 style=\"color: #6a4a7a; font-weight: 600; font-size: 1rem;\">📚 书籍分类</h3>\n                    <button class=\"add-btn\" style=\"padding: 6px 12px; font-size: 0.8rem; background: linear-gradient(135deg, #74ebd5, #9face6);\" onclick=\"addReadingCategory()\">+ 新建</button>\n                </div>\n                <div id=\"readingCategories\" style=\"background: rgba(255,255,255,0.5); border-radius: 16px; padding: 12px;\"></div>\n            </div>\n            <div style=\"flex: 1;\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;\">\n                    <h3 style=\"color: #6a4a7a; font-weight: 600; font-size: 1rem;\" id=\"readingCurrentTitle\">📝 全部笔记</h3>\n                    <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #74ebd5, #9face6);\" onclick=\"openReadingEditor()\">+ 新建笔记</button>\n                </div>\n                <div id=\"readingNotes\" style=\"display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;\"></div>\n            </div>\n        </div>\n    </div>\n\n    <!-- 电影鉴赏 -->\n    <div class=\"detail-page\" id=\"filmPage\">\n        <button class=\"back-btn\" onclick=\"goBack()\"><i class=\"fas fa-arrow-left\"></i> 返回主页</button>\n        <div class=\"detail-header\">\n            <div class=\"detail-icon\">🎬</div>\n            <h2 class=\"detail-title\" style=\"background: linear-gradient(135deg, #e88a4c, #d470a0); -webkit-background-clip: text; background-clip: text; color: transparent;\">电影鉴赏</h2>\n        </div>\n        <div style=\"display: flex; gap: 12px; margin-bottom: 20px;\">\n            <div class=\"goal-input-area\" style=\"flex: 1;\">\n                <input type=\"text\" id=\"filmSearch\" placeholder=\"🔍 搜索电影笔记...\">\n                <button class=\"add-btn\" onclick=\"searchFilmNotes()\" style=\"background: linear-gradient(135deg, #e88a4c, #d470a0);\">搜索</button>\n            </div>\n        </div>\n        <div style=\"display: flex; gap: 20px;\">\n            <div style=\"flex: 0 0 280px;\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;\">\n                    <h3 style=\"color: #6a4a7a; font-weight: 600; font-size: 1rem;\">🎞️ 电影分类</h3>\n                    <button class=\"add-btn\" style=\"padding: 6px 12px; font-size: 0.8rem; background: linear-gradient(135deg, #e88a4c, #d470a0);\" onclick=\"addFilmCategory()\">+ 新建</button>\n                </div>\n                <div id=\"filmCategories\" style=\"background: rgba(255,255,255,0.5); border-radius: 16px; padding: 12px;\"></div>\n            </div>\n            <div style=\"flex: 1;\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;\">\n                    <h3 style=\"color: #6a4a7a; font-weight: 600; font-size: 1rem;\" id=\"filmCurrentTitle\">📝 全部笔记</h3>\n                    <button class=\"add-btn\" style=\"background: linear-gradient(135deg, #e88a4c, #d470a0);\" onclick=\"openFilmEditor()\">+ 新建笔记</button>\n                </div>\n                <div id=\"filmNotes\" style=\"display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;\"></div>\n            </div>\n        </div>\n    </div>";
  const nativeNames = ["addAnalysisItem","addDeepSeekCategory","addFilmCategory","addFood","addIPItem","addIdeaVaultMotif","addLearningCategory","addLiteratureCategory","addReadingCategory","addSkillItem","addTodo","addWeeklyReview","changeMonth","closeDeepseekPopup","closeFilmPopup","closeLearningPopup","closeLiteraturePopup","closeNovelPopup","closeReadingPopup","createAds","createIdeaVaultAction","createIdeaVaultFragment","createIdeas","createLazyy","createWriting","deleteDeepseekCategory","deleteDeepseekDoc","deleteFilmCategory","deleteFilmNote","deleteIdeaVaultAction","deleteIdeaVaultFragment","deleteLearningCategory","deleteLearningNote","deleteLiteratureCategory","deleteLiteratureDoc","deleteNovelOutline","deleteReadingCategory","deleteReadingNote","deleteReview","deleteTodo","editFoodRecord","editMeaningQuizRecord","editRitualRecord","editSandwichRecord","editSupportRecord","editValueRecord","editWaterRecord","exportHtmlWithData","exportJsonFile","generateGoalSuggestions","goBack","importFromHtmlFile","importFromJsonFile","openAdsDoc","openAnalysisDetail","openDeepSeekDetail","openDeepSeekEditor","openDeepseekDocDetail","openDetail","openFilmDetail","openFilmEditor","openIPDetail","openIdeasDoc","openIdeasTab","openLazyyDoc","openLearningEditor","openLiteratureDetail","openLiteratureDocDetail","openLiteratureEditor","openMediaDetail","openNovelOutlineDetail","openNovelOutlineEditor","openReadingEditor","openReadingNoteDetail","openReviewDetail","openSkillDetail","openWritingDoc","previewFilmImage","promoteIdeaVaultFragment","recordActivity","recordStreak","removeAnalysisImage","removeFilmImage","removeIPImage","removeSkillImage","renderActivityHistory","renderAllTrendCharts","renderAnalysisList","renderEmotionBoard","renderFoodHistory","renderIPList","renderMeaningQuizHistory","renderMediaCalendar","renderMediaCalendarStats","renderReflectionHistory","renderRitualList","renderSandwichHistory","renderSkillsList","renderSupportHistory","renderValuesHistory","saveAds","saveAnalysis","saveDeepseekDoc","saveEmotionNotes","saveFilmNote","saveIP","saveIdeas","saveLazyy","saveLearningNote","saveLiteratureDoc","saveMeaningQuiz","saveMediaCalendarItem","saveMediaCalendarNotes","saveNovelOutline","saveReadingNote","saveRecord","saveReflection","saveReview","saveRitual","saveSandwich","saveSkill","saveSupport","saveToJsonFile","saveToOriginalFile","saveValues","saveWaterIntake","saveWriting","searchDeepSeekDocs","searchFilmNotes","searchLearningNotes","searchLiteratureDocs","searchNovelOutlines","searchReadingNotes","selectAddAccount","selectDeepseekCategory","selectFilmCategory","selectLearningCategory","selectLiteratureCategory","selectReadingCategory","setHappiness","showActivityFullDetail","showEmojiSelector","showFoodDetail","showMeaningQuizDetail","showMeaningQuizFullDetail","showReflectionDetail","showRitualFullDetail","showSandwichDetail","showSupportDetail","showValueDetail","showValueFullDetail","startBreathing","startIntervalTraining","startPomodoro","startSwitchTimer","stopIntervalTraining","stopPomodoro","stopSwitchTimer","switchMediaTab","switchTab","toggleAutoSave","toggleFocusLock","toggleIdeaVaultAction","toggleTodo","updateMeaningScore","updateScorePreview"];
  for (const name of nativeNames) {
    if (typeof realWindow[name] !== 'undefined') throw new Error('VitaFlow UI function conflicts with the host: ' + name);
  }
  nativeRoot.innerHTML = nativeBody;
  nativeRoot.classList.add('ops-hub-native', 'ops-hub-embed');
  const scriptUrl = realDocument.currentScript?.src || new URL('vitaflow/native-workspace.js', realWindow.location.href).href;
  const nativeSourceUrl = new URL('schedule-system-2.0.html', scriptUrl).href;
  const nativeContext = { mode: 'browser', origin: null, key: '', generation: 0 };
  const nativeRequests = new Set();
  let nativeReady = false;
  let nativeBoot;
  const document = {
    getElementById(id) {
      const escaped = realWindow.CSS?.escape ? realWindow.CSS.escape(String(id)) : String(id).replace(/[^a-zA-Z0-9_-]/g, character => '\\' + character);
      return nativeRoot.querySelector('#' + escaped);
    },
    querySelector: selector => nativeRoot.querySelector(selector),
    querySelectorAll: selector => nativeRoot.querySelectorAll(selector),
    createElement: (...args) => realDocument.createElement(...args),
    body: nativeRoot,
    get readyState() { return realDocument.readyState; },
    addEventListener: (...args) => realDocument.addEventListener(...args)
  };
  const location = {
    get href() { return nativeSourceUrl; },
    get search() { return nativeContext.mode === 'browser' ? '?mode=browser' : '?key=' + encodeURIComponent(nativeContext.key); },
    get protocol() { return nativeContext.origin ? new URL(nativeContext.origin).protocol : realWindow.location.protocol; },
    reload() { nativeRefresh(); }
  };
  const window = new Proxy(realWindow, {
    get(target, name) {
      if (name === 'location') return location;
      if (name === 'parent') return window;
      const value = target[name];
      return ['addEventListener', 'dispatchEvent', 'matchMedia', 'showSaveFilePicker'].includes(name) && typeof value === 'function' ? value.bind(target) : value;
    },
    set(target, name, value) {
      target[name] = value;
      if (target[name] !== value) throw new Error('VitaFlow window field could not be saved: ' + String(name));
      return true;
    }
  });
  const fetch = async (input, options = {}) => {
    const syncRequest = typeof input === 'string' && /^\/api\/data(?:[?]|$)/.test(input);
    if (!syncRequest) return realWindow.fetch(input, options);
    if (nativeContext.mode !== 'private' || !nativeContext.origin) throw new Error('Private sync is disabled');
    const generation = nativeContext.generation;
    const controller = new realWindow.AbortController();
    nativeRequests.add(controller);
    try {
      const headers = { ...options.headers };
      for (const name of Object.keys(headers)) if (name.toLowerCase() === 'x-vitaflow-token') delete headers[name];
      if (nativeContext.key) headers['x-vitaflow-token'] = nativeContext.key;
      const response = await realWindow.fetch(new URL(input, nativeContext.origin).href, { ...options, headers, signal: controller.signal });
      const current = () => {
        if (generation !== nativeContext.generation) {
          const error = new Error('VitaFlow connection changed');
          error.name = 'AbortError';
          throw error;
        }
      };
      current();
      if (!response.ok || response.status === 304) nativeRequests.delete(controller);
      return {
        get ok() { current(); return response.ok; },
        get status() { current(); return response.status; },
        async json() {
          try { const value = await response.json(); current(); return value; }
          finally { nativeRequests.delete(controller); }
        }
      };
    } catch (error) { nativeRequests.delete(controller); throw error; }
  };
  // Native input always starts empty; it never restores a host or repository snapshot.
  const EMBEDDED_DATA = undefined;
  const Chart = realWindow.Chart;

        // 用户输入插入 innerHTML 前必须经过转义，防止 < > " ' 破坏页面结构
        function escapeHtml(value) {
            return (value === null || value === undefined ? '' : String(value))
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function inlineHandlerArg(value) {
            const serialized = JSON.stringify(value);
            return escapeHtml(serialized === undefined ? 'null' : serialized);
        }

        function formatLocalDate(date = new Date()) {
            if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        function parseLocalDate(value) {
            if (value instanceof Date) return new Date(value.getTime());
            const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
            if (!match) return null;
            const year = Number(match[1]);
            const month = Number(match[2]) - 1;
            const day = Number(match[3]);
            const date = new Date(year, month, day);
            if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
            return date;
        }
        function getRecentDateEntries(dayCount = 7, endDate = new Date()) {
            const count = Math.max(1, Number.parseInt(dayCount, 10) || 7);
            const end = endDate instanceof Date && !Number.isNaN(endDate.getTime())
                ? new Date(endDate.getTime())
                : new Date();
            const entries = [];
            for (let offset = count - 1; offset >= 0; offset--) {
                const date = new Date(end.getTime());
                date.setDate(date.getDate() - offset);
                entries.push({
                    date: formatLocalDate(date),
                    label: `${date.getMonth() + 1}/${date.getDate()}`,
                });
            }
            return entries;
        }

        function getCompletedTaskTrend(todos, dayCount = 7, endDate = new Date()) {
            const entries = getRecentDateEntries(dayCount, endDate);
            const records = Array.isArray(todos) ? todos : [];
            return {
                labels: entries.map(entry => entry.label),
                dates: entries.map(entry => entry.date),
                values: entries.map(entry => records.filter(todo => todo && todo.completed === true && todo.date === entry.date).length),
            };
        }

        function getAverageAccountTrend(accountData, dayCount = 7, endDate = new Date()) {
            const entries = getRecentDateEntries(dayCount, endDate);
            const accountKeys = ['physical', 'emotional', 'focus', 'meaning'];
            return {
                labels: entries.map(entry => entry.label),
                dates: entries.map(entry => entry.date),
                values: entries.map(entry => {
                    const scores = accountKeys
                        .map(key => {
                            const history = Array.isArray(accountData?.[key]?.history) ? accountData[key].history : [];
                            const record = history.find(item => item && item.date === entry.date);
                            return Number(record?.score);
                        })
                        .filter(Number.isFinite);
                    if (scores.length === 0) return null;
                    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
                }),
            };
        }

        function getValidStreakRecords(records) {
            return (Array.isArray(records) ? records : []).filter(record => {
                return record && parseLocalDate(record.date) !== null;
            });
        }

        function getStreakTrend(records, dayCount = 7, endDate = new Date()) {
            const entries = getRecentDateEntries(dayCount, endDate);
            const recordedDates = new Set(getValidStreakRecords(records).map(record => record.date));
            return {
                labels: entries.map(entry => entry.label),
                dates: entries.map(entry => entry.date),
                values: entries.map(entry => recordedDates.has(entry.date) ? 1 : 0),
            };
        }

        function getStreakSummary(records, referenceDate = new Date()) {
            const validRecords = getValidStreakRecords(records);
            const uniqueDates = [...new Set(validRecords.map(record => record.date))].sort();
            const recordedDates = new Set(uniqueDates);
            const reference = referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime())
                ? new Date(referenceDate.getTime())
                : new Date();

            let current = 0;
            const cursor = new Date(reference.getTime());
            while (recordedDates.has(formatLocalDate(cursor))) {
                current++;
                cursor.setDate(cursor.getDate() - 1);
            }

            let longest = 0;
            let run = 0;
            let previousDate = null;
            uniqueDates.forEach(dateString => {
                const date = parseLocalDate(dateString);
                if (previousDate) {
                    const expected = new Date(previousDate.getTime());
                    expected.setDate(expected.getDate() + 1);
                    run = formatLocalDate(expected) === dateString ? run + 1 : 1;
                } else {
                    run = 1;
                }
                longest = Math.max(longest, run);
                previousDate = date;
            });

            const monthPrefix = `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, '0')}-`;
            const monthCount = uniqueDates.filter(date => date.startsWith(monthPrefix) && date <= formatLocalDate(reference)).length;
            const elapsedDays = Math.max(1, reference.getDate());
            const monthRate = Math.round((monthCount / elapsedDays) * 100);

            const hourCounts = new Map();
            validRecords.forEach(record => {
                if (!record.created) return;
                const created = new Date(record.created);
                if (Number.isNaN(created.getTime())) return;
                const hour = created.getHours();
                hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
            });
            let commonHour = null;
            let commonHourCount = 0;
            hourCounts.forEach((count, hour) => {
                if (count > commonHourCount || (count === commonHourCount && (commonHour === null || hour < commonHour))) {
                    commonHour = hour;
                    commonHourCount = count;
                }
            });
            const commonTime = commonHour === null
                ? '暂无数据'
                : `${String(commonHour).padStart(2, '0')}:00-${String((commonHour + 1) % 24).padStart(2, '0')}:00`;

            return { current, longest, monthRate, commonTime };
        }

        const happyEmojis = { 1: '😣', 3: '😕', 5: '😐', 7: '😊', 9: '😄', 10: '🤩' };
        const accountNames = { physical: '🏃 体能', emotional: '❤️ 情感', focus: '🧠 思维', meaning: '🔥 意志' };
        const accountColors = { physical: '#e88a4c', emotional: '#c4679c', focus: '#8b5e9e', meaning: '#a78bfa' };

        const initialCalendarDate = new Date();
        let selectedAddAccount = 'physical';
        let selectedDate = formatLocalDate(initialCalendarDate);
        let currentYear = initialCalendarDate.getFullYear();
        let currentMonth = initialCalendarDate.getMonth();
        let mainChart, accountCharts = {}, streakChart, tasksChart, avgChart, compareChart;
        let accountsData = {};

        function initData() {
            const today = formatLocalDate();

            // 首次打开某个“带数据 HTML 包”时，用嵌入数据覆盖恢复一次。
            // 之后同一个包不再重复覆盖，避免用户后续新增/修改被每次打开重置。
            try {
	                if (typeof EMBEDDED_DATA !== 'undefined' && EMBEDDED_DATA && typeof EMBEDDED_DATA === 'object' && Object.keys(EMBEDDED_DATA).length > 0) {
	                    const signature = getEmbeddedDataSignature(EMBEDDED_DATA);
	                    if (localStorage.getItem(embeddedRestoreSignatureKey) !== signature) {
	                        if ((typeof localSyncHasRemoteData !== 'undefined' && localSyncHasRemoteData) ||
	                            (typeof hasLocalSyncPending === 'function' && hasLocalSyncPending())) {
	                            console.warn('检测到服务器数据或待同步的本机修改，已跳过 HTML 内嵌快照的自动恢复');
	                            if (typeof showLocalSyncDiagnostic === 'function') {
	                                showLocalSyncDiagnostic('已保留当前数据，未自动恢复此 HTML 的旧快照');
	                            }
	                        } else {
	                            restoreBackupData(EMBEDDED_DATA);
	                            console.log('✅ 已从 HTML 嵌入数据覆盖恢复 ' + Object.keys(EMBEDDED_DATA).length + ' 项');
	                        }
	                    }
	                }
            } catch (e) {
                console.warn('嵌入数据迁移失败:', e);
            }

            if (!localStorage.getItem('vitaflow_accounts')) {
                accountsData = {
                    physical: { score: null, history: [] },
                    emotional: { score: null, history: [] },
                    focus: { score: null, history: [] },
                    meaning: { score: null, history: [] }
                };
                localStorage.setItem('vitaflow_accounts', JSON.stringify(accountsData));
            } else {
                accountsData = JSON.parse(localStorage.getItem('vitaflow_accounts'));
            }

            if (!localStorage.getItem('vitaflow_todos')) {
                localStorage.setItem('vitaflow_todos', JSON.stringify([]));
            }

            if (!localStorage.getItem('vitaflow_happiness')) {
                localStorage.setItem('vitaflow_happiness', JSON.stringify({}));
            }

            if (!localStorage.getItem('vitaflow_streak')) localStorage.setItem('vitaflow_streak', '0');
            if (!localStorage.getItem('vitaflow_streak_records')) localStorage.setItem('vitaflow_streak_records', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_completed')) localStorage.setItem('vitaflow_completed', '0');
            if (!localStorage.getItem('vitaflow_goal')) localStorage.setItem('vitaflow_goal', '');

            document.getElementById('physicalDateInput').value = today;
            document.getElementById('emotionalDateInput').value = today;
            document.getElementById('focusDateInput').value = today;
            document.getElementById('meaningDateInput').value = today;
            document.getElementById('streakDateInput').value = today;
            document.getElementById('emotionYear').value = String(new Date().getFullYear());
            document.getElementById('emotionMonth').value = String(new Date().getMonth());
            document.getElementById('goalInput').value = localStorage.getItem('vitaflow_goal') || '';

            updateMainScores();
        }

        function renderCalendar() {
            const calendarEl = document.getElementById('calendar');
            calendarEl.innerHTML = '';

            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const happiness = JSON.parse(localStorage.getItem('vitaflow_happiness') || '{}');

            document.getElementById('currentMonth').textContent = currentYear + '年' + (currentMonth + 1) + '月';

            for (let i = 0; i < firstDay; i++) {
                const empty = document.createElement('div');
                empty.className = 'cal-day';
                empty.style.visibility = 'hidden';
                calendarEl.appendChild(empty);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = formatLocalDate(new Date(currentYear, currentMonth, day));
                const dayEl = document.createElement('div');
                dayEl.className = 'cal-day' + (dateStr === selectedDate ? ' selected' : '');
                dayEl.innerHTML = day;
                if (happiness[dateStr]) {
                    dayEl.innerHTML += '<div class="happy-marker">' + (happyEmojis[happiness[dateStr]] || '😐') + '</div>';
                }
                dayEl.onclick = () => selectDate(dateStr, day);
                calendarEl.appendChild(dayEl);
            }
        }

        function changeMonth(delta) {
            currentMonth += delta;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            } else if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            // 限制在2026-2030年
            if (currentYear > 2030) { currentYear = 2030; currentMonth = 11; }
            if (currentYear < 2026) { currentYear = 2026; currentMonth = 0; }
            renderCalendar();
        }

        function selectDate(dateStr, day) {
            selectedDate = dateStr;
            renderCalendar();
            renderTodoList();
        }

        function renderTodoList() {
            const todos = JSON.parse(localStorage.getItem('vitaflow_todos') || '[]');
            const filtered = todos.filter(t => t.date === selectedDate);
            const todoListEl = document.getElementById('todoList');

            if (filtered.length === 0) {
                todoListEl.innerHTML = '<div style="text-align: center; color: #aa9a9a; padding: 30px;">今日暂无待办，点击添加</div>';
                return;
            }

            todoListEl.innerHTML = filtered.map(todo => `
                <div class="todo-item">
                    <div class="todo-left">
                        <input type="checkbox" class="todo-check" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${inlineHandlerArg(todo.id)})">
                        <span class="todo-text ${todo.completed ? 'completed' : ''}">${escapeHtml(todo.text)}</span>
                    </div>
                    <div>
                        <span class="todo-account">${escapeHtml(accountNames[todo.account])}</span>
                        <span class="todo-happy">${escapeHtml(happyEmojis[todo.happy])}</span>
                        <button class="delete-btn" onclick="deleteTodo(${inlineHandlerArg(todo.id)})"><i class="fas fa-times"></i></button>
                    </div>
                </div>
            `).join('');
        }

        function selectAddAccount(account) {
            selectedAddAccount = account;
            document.querySelectorAll('.account-add-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.account === account);
            });
        }

        function addTodo() {
            const input = document.getElementById('todoInput');
            const text = input.value.trim();
            const happy = parseInt(document.getElementById('happySelect').value);
            if (!text) return;

            const todos = JSON.parse(localStorage.getItem('vitaflow_todos') || '[]');
            todos.push({ id: Date.now(), text, account: selectedAddAccount, happy, date: selectedDate, completed: false });
            localStorage.setItem('vitaflow_todos', JSON.stringify(todos));
            input.value = '';
            renderTodoList();
            renderTodoKanban();
            syncLocalDataNow('vitaflow_todos');
        }

        function toggleTodo(id) {
            const todos = JSON.parse(localStorage.getItem('vitaflow_todos') || '[]');
            const todo = todos.find(t => t.id === id);
            if (todo) {
                todo.completed = !todo.completed;
                if (todo.completed) {
                    const completed = parseInt(localStorage.getItem('vitaflow_completed') || '0') + 1;
                    localStorage.setItem('vitaflow_completed', completed);
                    document.getElementById('completedTasks').textContent = completed;
                } else {
                    const completed = Math.max(0, parseInt(localStorage.getItem('vitaflow_completed') || '0') - 1);
                    localStorage.setItem('vitaflow_completed', completed);
                    document.getElementById('completedTasks').textContent = completed;
                }
                localStorage.setItem('vitaflow_todos', JSON.stringify(todos));
                renderTodoList();
                renderTodoKanban();
                syncLocalDataNow('vitaflow_todos');
            }
        }

        function deleteTodo(id) {
            let todos = JSON.parse(localStorage.getItem('vitaflow_todos') || '[]');
            todos = todos.filter(t => t.id !== id);
            localStorage.setItem('vitaflow_todos', JSON.stringify(todos));
            renderTodoList();
            renderTodoKanban();
            syncLocalDataNow('vitaflow_todos');
        }

        function renderTodoKanban() {
            const todos = JSON.parse(localStorage.getItem('vitaflow_todos') || '[]');
            const pending = todos.filter(t => !t.completed);
            const completed = todos.filter(t => t.completed);

            const pendingEl = document.getElementById('todoKanbanPending');
            const completedEl = document.getElementById('todoKanbanCompleted');

            document.getElementById('todoPendingCount').textContent = pending.length;
            document.getElementById('todoCompletedCount').textContent = completed.length;

            if (pending.length === 0) {
                pendingEl.innerHTML = '<div style="text-align: center; color: #aa9a9a; padding: 30px;">暂无未完成任务</div>';
            } else {
                pendingEl.innerHTML = pending.map(todo => `
                    <div style="background: #fffbfe; border-radius: 16px; padding: 14px; margin-bottom: 10px; border: 1px solid #fbe0f0; display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                                <input type="checkbox" onchange="toggleTodo(${inlineHandlerArg(todo.id)})" style="width: 18px; height: 18px; accent-color: #c4679c;">
                                <span style="color: #4a3a4a; font-size: 0.95rem;">${escapeHtml(todo.text)}</span>
                            </div>
                            <div style="display: flex; gap: 8px; font-size: 0.8rem;">
                                <span style="background: linear-gradient(135deg, #ffe0f0, #f0e0ff); border-radius: 16px; padding: 3px 10px; color: #8b5e9e;">${escapeHtml(accountNames[todo.account])}</span>
                                <span>${escapeHtml(happyEmojis[todo.happy])}</span>
                                <span style="color: #aa9a9a;">${escapeHtml(todo.date)}</span>
                            </div>
                        </div>
                        <button onclick="deleteTodo(${inlineHandlerArg(todo.id)})" style="background: none; border: none; color: #c4679c; cursor: pointer; padding: 6px; margin-left: 10px;" title="删除">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `).join('');
            }

            if (completed.length === 0) {
                completedEl.innerHTML = '<div style="text-align: center; color: #aa9a9a; padding: 30px;">暂无已完成任务</div>';
            } else {
                completedEl.innerHTML = completed.map(todo => `
                    <div style="background: #f0fff4; border-radius: 16px; padding: 14px; margin-bottom: 10px; border: 1px solid #d4f5e8; display: flex; justify-content: space-between; align-items: center; opacity: 0.8;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                                <input type="checkbox" checked onchange="toggleTodo(${inlineHandlerArg(todo.id)})" style="width: 18px; height: 18px; accent-color: #22c55e;">
                                <span style="color: #6a8a7a; font-size: 0.95rem; text-decoration: line-through;">${escapeHtml(todo.text)}</span>
                            </div>
                            <div style="display: flex; gap: 8px; font-size: 0.8rem;">
                                <span style="background: rgba(74, 222, 128, 0.2); border-radius: 16px; padding: 3px 10px; color: #22c55e;">${escapeHtml(accountNames[todo.account])}</span>
                                <span>${escapeHtml(happyEmojis[todo.happy])}</span>
                                <span style="color: #aa9a9a;">${escapeHtml(todo.date)}</span>
                            </div>
                        </div>
                        <button onclick="deleteTodo(${inlineHandlerArg(todo.id)})" style="background: none; border: none; color: #6a8a7a; cursor: pointer; padding: 6px; margin-left: 10px;" title="删除">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `).join('');
            }
        }
        function openDetail(type) {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById(type + 'Page').classList.add('active');

            if (['physical', 'emotional', 'focus', 'meaning'].includes(type)) {
                const score = accountsData[type].score;
                const input = document.getElementById(type + 'ScoreInput');
                input.value = score == null ? 50 : score;
                input.dataset.scoreSelected = score == null ? 'false' : 'true';
                document.getElementById(type + 'Preview').textContent = score == null ? '待记录' : score;
                renderAccountChart(type);
                renderHistory(type);
            } else if (type === 'streak') {
                renderStreakChart();
                renderStreakHistory();
                renderStreakAnalysis();
            } else if (type === 'tasks') {
                renderAllTasks();
                renderTasksChart();
            } else if (type === 'avg') {
                renderAvgChart();
                renderCompareChart();
            }
        }

        function goBack() {
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('mainPage').style.display = 'block';
            updateMainScores();
            initMainChart();
        }

        function switchTab(account, tab) {
            const page = document.getElementById(account + 'Page');
            page.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            page.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById(account + '-' + tab).classList.add('active');

            if (tab === 'trend') {
                if (['physical', 'emotional', 'focus', 'meaning'].includes(account)) {
                    renderAccountChart(account);
                } else if (account === 'streak') {
                    renderStreakChart();
                } else if (account === 'tasks') {
                    renderTasksChart();
                } else if (account === 'avg') {
                    renderAvgChart();
                }
            } else if (tab === 'analysis' && account === 'streak') {
                renderStreakAnalysis();
            } else if (tab === 'compare') {
                renderCompareChart();
            } else if (tab === 'history' && account === 'meaning') {
                renderMeaningBoards();
                renderMeaningQuizHistoryChart();
            } else if (tab === 'guide' && account === 'meaning') {
                renderMeaningQuizChart();
            } else if (tab === 'history' && account === 'emotional') {
                renderEmotionalBoards();
            } else if (tab === 'history' && account === 'focus') {
                renderFocusReflectionBoard();
            } else if (tab === 'history' && account === 'physical') {
                renderPhysicalBoards();
            }
        }

        function updateScorePreview(account, value) {
            const input = document.getElementById(account + 'ScoreInput');
            if (input) input.dataset.scoreSelected = 'true';
            document.getElementById(account + 'Preview').textContent = value;
        }

        function saveRecord(account) {
            const scoreInput = document.getElementById(account + 'ScoreInput');
            if (accountsData[account].score == null && scoreInput.dataset.scoreSelected !== 'true') {
                alert('请先选择评分，再保存记录。');
                return;
            }
            const score = parseInt(scoreInput.value, 10);
            if (!Number.isFinite(score)) {
                alert('请选择有效评分。');
                return;
            }
            const date = document.getElementById(account + 'DateInput').value;

            accountsData[account].score = score;
            const history = accountsData[account].history;
            const existingIndex = history.findIndex(h => h.date === date);
            if (existingIndex >= 0) {
                history[existingIndex].score = score;
            } else {
                history.push({ date, score });
            }
            history.sort((a, b) => new Date(a.date) - new Date(b.date));

            localStorage.setItem('vitaflow_accounts', JSON.stringify(accountsData));
            document.getElementById(account + 'Progress').textContent = score;
            updateProgressRing(account, score);
            renderHistory(account);
            updateMainScores();
            alert('✅ ' + accountNames[account] + '记录已保存！');
        }

        function updateProgressRing(account, score) {
            const circumference = 264;
            const numericScore = score == null || score === '' ? null : Number(score);
            const offset = Number.isFinite(numericScore) ? circumference - (numericScore / 100) * circumference : circumference;
            const fg = document.querySelector('#' + account + 'Page .progress-ring .fg');
            if (fg) {
                fg.style.strokeDashoffset = offset;
                fg.style.opacity = Number.isFinite(numericScore) ? '1' : '0.25';
            }
        }

        function renderHistory(account) {
            const history = accountsData[account].history.slice(-7).reverse();
            const listEl = document.getElementById(account + 'HistoryList');
            if (!listEl) return;
            if (history.length === 0) {
                listEl.innerHTML = '<div style="text-align: center; color: #8b7a7a;">暂无记录</div>';
                return;
            }

            listEl.innerHTML = history.map((item, i) => {
                const prev = history[i + 1];
                const trend = prev ? (item.score > prev.score ? 'up' : item.score < prev.score ? 'down' : '') : '';
                const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';
                return `
                    <div class="history-item">
                        <div>
                            <span class="history-date">${escapeHtml(item.date)}</span>
                            ${trend ? '<span class="history-trend ' + trend + '">' + trendIcon + ' ' + Math.abs(item.score - prev.score) + '</span>' : ''}
                        </div>
                        <div class="history-score" style="color: ${accountColors[account]}">${escapeHtml(item.score)}</div>
                    </div>
                `;
            }).join('');
        }

        function updateMainScores() {
            const setText = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            };
            ['physical', 'emotional', 'focus', 'meaning'].forEach(account => {
                const score = accountsData[account].score;
                const displayScore = score == null ? '—' : score;
                setText(account + 'Score', displayScore);
                setText(account + 'Progress', displayScore);
                updateProgressRing(account, score);
            });
            const streak = localStorage.getItem('vitaflow_streak') || '0';
            const completed = localStorage.getItem('vitaflow_completed') || '0';
            setText('streakDays', streak);
            setText('streakProgress', streak);
            setText('completedTasks', completed);
            setText('tasksProgress', completed);

            const scores = ['physical', 'emotional', 'focus', 'meaning']
                .map(account => accountsData[account].score)
                .filter(score => typeof score === 'number' && Number.isFinite(score));
            const avg = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
            const displayAverage = avg == null ? '—' : avg;
            setText('avgScore', displayAverage);
            setText('avgProgress', displayAverage);
            updateProgressRing('avg', avg);
        }

        function renderAllTrendCharts() {
            const startDate = document.getElementById('trendStartDate').value;
            const endDate = document.getElementById('trendEndDate').value;

            const end = endDate ? parseLocalDate(endDate) : new Date();
            if (!end) {
                alert('请选择有效日期');
                return;
            }
            const start = startDate ? parseLocalDate(startDate) : new Date(end.getTime());

            if (!start) {
                alert('请选择有效日期');
                return;
            }
            if (!startDate) start.setDate(start.getDate() - 6);

            if (start > end) {
                alert('开始日期不能晚于结束日期');
                return;
            }

            const labels = [];
            const current = new Date(start);
            while (current <= end) {
                labels.push((current.getMonth() + 1) + '/' + current.getDate());
                current.setDate(current.getDate() + 1);
            }

            const physicalData = getAccountDataForRange('physical', start, end);
            const emotionalData = getAccountDataForRange('emotional', start, end);
            const focusData = getAccountDataForRange('focus', start, end);
            const meaningData = getAccountDataForRange('meaning', start, end);

            renderTrendChart('physicalTrendChart', '体能', physicalData, labels, '#e88a4c');
            renderTrendChart('emotionalTrendChart', '情感', emotionalData, labels, '#c4679c');
            renderTrendChart('focusTrendChart', '思维', focusData, labels, '#8b5e9e');
            renderTrendChart('meaningTrendChart', '意志', meaningData, labels, '#a78bfa');
        }

        function getAccountDataForRange(accountType, start, end) {
            const history = accountsData[accountType].history;
            const data = [];
            const current = new Date(start);

            while (current <= end) {
                const dateStr = formatLocalDate(current);
                const record = history.find(h => h.date === dateStr);
                const score = record?.score;
                data.push(typeof score === 'number' && Number.isFinite(score) ? score : null);
                current.setDate(current.getDate() + 1);
            }
            return data;
        }

        function renderTrendChart(canvasId, label, data, labels, color) {
            const ctx = document.getElementById(canvasId).getContext('2d');
            const emptyState = document.getElementById(canvasId + 'Empty');
            if (emptyState) emptyState.style.display = data.some(value => value !== null && value !== undefined) ? 'none' : 'block';
            const chartKey = canvasId.replace('Chart', '');
            if (window[chartKey]) window[chartKey].destroy();

            window[chartKey] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: label,
                        data: data,
                        borderColor: color,
                        borderWidth: 3,
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        fill: false,
                        pointBackgroundColor: color,
                        pointRadius: 6,
                        pointBorderWidth: 2,
                        pointBorderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b7a7a', font: { size: 10 } }, grid: { color: 'rgba(200, 160, 200, 0.2)' } },
                        y: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' }, suggestedMin: 60, suggestedMax: 100 }
                    }
                }
            });
        }

        function initMainChart() {
            renderAllTrendCharts();
        }

        function renderAccountChart(account) {
            const ctx = document.getElementById(account + 'Chart').getContext('2d');
            if (accountCharts[account]) accountCharts[account].destroy();

            const history = accountsData[account].history.slice(-7);
            const scores = history.map(item => typeof item.score === 'number' && Number.isFinite(item.score) ? item.score : null);
            const emptyState = document.getElementById(account + 'ChartEmpty');
            if (emptyState) emptyState.style.display = scores.some(score => score !== null) ? 'none' : 'block';
            const labels = history.map(h => {
                const d = new Date(h.date);
                return (d.getMonth() + 1) + '/' + d.getDate();
            });

            accountCharts[account] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: accountNames[account] + '得分',
                        data: scores,
                        borderColor: accountColors[account],
                        backgroundColor: accountColors[account] + '25',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: accountColors[account]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } },
                        y: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' }, suggestedMin: 60, suggestedMax: 100 }
                    }
                }
            });
        }

        function renderStreakChart() {
            const ctx = document.getElementById('streakChart').getContext('2d');
            if (streakChart) streakChart.destroy();
            const trend = getStreakTrend(getStoredStreakRecords());

            streakChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: trend.labels,
                    datasets: [{
                        label: '打卡状态',
                        data: trend.values,
                        backgroundColor: 'rgba(255, 179, 71, 0.4)',
                        borderColor: '#ffb347',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } },
                        y: { ticks: { color: '#8b7a7a', stepSize: 1 }, grid: { color: 'rgba(200, 160, 200, 0.2)' }, suggestedMin: 0, suggestedMax: 1 }
                    }
                }
            });
        }

        function renderStreakHistory() {
            const listEl = document.getElementById('streakHistoryList');
            const history = getStoredStreakRecords()
                .slice()
                .sort((a, b) => b.date.localeCompare(a.date));

            if (history.length === 0) {
                listEl.innerHTML = '<div style="text-align: center; color: #aa9a9a; padding: 30px;">暂无打卡记录</div>';
                return;
            }

            listEl.innerHTML = history.map(item => `
                <div class="history-item">
                    <div>
                        <span class="history-date">${escapeHtml(item.date)}</span>
                        <span style="background: rgba(100, 200, 150, 0.3); border-radius: 12px; padding: 4px 10px; margin-left: 10px;">
                            ✅ 已打卡
                        </span>
                    </div>
                    <div style="font-size: 1.5rem;">🔥</div>
                </div>
            `).join('');
        }

        function renderAllTasks() {
            const todos = JSON.parse(localStorage.getItem('vitaflow_todos') || '[]');
            const listEl = document.getElementById('allTasksList');

            listEl.innerHTML = todos.slice().reverse().map(todo => `
                <div class="history-item">
                    <div>
                        <span class="history-date">${escapeHtml(todo.date)}</span>
                        <span class="todo-account" style="margin-left: 10px;">${escapeHtml(accountNames[todo.account])}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="todo-happy">${escapeHtml(happyEmojis[todo.happy])}</span>
                        <span style="${todo.completed ? 'text-decoration: line-through; color: #aa9a9a;' : ''}">${escapeHtml(todo.text)}</span>
                    </div>
                </div>
            `).join('');
        }

        function renderTasksChart() {
            const ctx = document.getElementById('tasksChart').getContext('2d');
            if (tasksChart) tasksChart.destroy();
            const todos = JSON.parse(localStorage.getItem('vitaflow_todos') || '[]');
            const trend = getCompletedTaskTrend(todos);

            tasksChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: trend.labels,
                    datasets: [{
                        label: '完成任务数',
                        data: trend.values,
                        borderColor: '#74ebd5',
                        backgroundColor: 'rgba(116, 235, 213, 0.2)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#74ebd5'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } },
                        y: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' }, suggestedMin: 0, suggestedMax: 10 }
                    }
                }
            });
        }

        function renderAvgChart() {
            const ctx = document.getElementById('avgChart').getContext('2d');
            if (avgChart) avgChart.destroy();
            const trend = getAverageAccountTrend(accountsData);
            const emptyState = document.getElementById('avgChartEmpty');
            if (emptyState) emptyState.style.display = trend.values.some(value => value !== null) ? 'none' : 'block';

            avgChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: trend.labels,
                    datasets: [{
                        label: '平均得分',
                        data: trend.values,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#667eea'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } },
                        y: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' }, suggestedMin: 60, suggestedMax: 100 }
                    }
                }
            });
        }

        function renderCompareChart() {
            const ctx = document.getElementById('compareChart').getContext('2d');
            if (compareChart) compareChart.destroy();
            const accounts = [
                ['physical', '体能'], ['emotional', '情绪'], ['focus', '思维'], ['meaning', '意志'],
            ].filter(([key]) => typeof accountsData[key].score === 'number' && Number.isFinite(accountsData[key].score));
            const emptyState = document.getElementById('compareChartEmpty');
            if (emptyState) emptyState.style.display = accounts.length ? 'none' : 'block';

            compareChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: accounts.map(([, label]) => label),
                    datasets: [{
                        data: accounts.map(([key]) => accountsData[key].score),
                        backgroundColor: ['#e88a4c', '#c4679c', '#8b5e9e', '#a78bfa'],
                        borderColor: '#ffffff',
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#6a4a5a' }
                        }
                    }
                }
            });
        }

        function recordStreak() {
            const date = document.getElementById('streakDateInput').value || formatLocalDate();
            const selectedStreakDate = parseLocalDate(date);
            if (!selectedStreakDate) {
                alert('请选择有效日期');
                return;
            }
            const records = getStoredStreakRecords();
            if (records.some(record => record.date === date)) {
                alert('这一天已经打卡了');
                return;
            }
            const legacyCurrent = Math.max(0, Number.parseInt(localStorage.getItem('vitaflow_streak') || '0', 10) || 0);
            const legacyDays = Math.min(legacyCurrent, 3650);
            if (records.length === 0 && legacyDays > 0) {
                for (let offset = legacyDays; offset >= 1; offset--) {
                    const migratedDate = new Date(selectedStreakDate.getTime());
                    migratedDate.setDate(migratedDate.getDate() - offset);
                    records.push({ date: formatLocalDate(migratedDate), migrated: true });
                }
            }
            records.push({ date, created: new Date().toISOString() });
            records.sort((a, b) => a.date.localeCompare(b.date));
            localStorage.setItem('vitaflow_streak_records', JSON.stringify(records));
            const summary = getStreakSummary(records);
            localStorage.setItem('vitaflow_streak', String(summary.current));
            renderStreakHistory();
            renderStreakChart();
            renderStreakAnalysis();
            updateMainScores();
            alert('🔥 打卡成功！已连续打卡' + summary.current + '天！');
        }

        function getStoredStreakRecords() {
            try {
                const records = JSON.parse(localStorage.getItem('vitaflow_streak_records') || '[]');
                return Array.isArray(records) ? records : [];
            } catch (e) {
                console.warn('打卡记录读取失败:', e);
                return [];
            }
        }

        function renderStreakAnalysis() {
            const records = getStoredStreakRecords();
            const summary = getStreakSummary(records);
            const legacyCurrent = Number.parseInt(localStorage.getItem('vitaflow_streak') || '0', 10) || 0;
            const current = records.length > 0 ? summary.current : legacyCurrent;
            document.getElementById('streakProgress').textContent = current;
            document.getElementById('streakLongest').textContent = Math.max(summary.longest, current) + '天';
            document.getElementById('streakMonthRate').textContent = summary.monthRate + '%';
            document.getElementById('streakCommonTime').textContent = summary.commonTime;
        }

        function generateGoalSuggestions() {
            const goal = document.getElementById('goalInput').value.trim();
            if (!goal) { alert('请输入目标'); return; }
            localStorage.setItem('vitaflow_goal', goal);

            const suggestions = `
                <div class="suggestion-item">
                    <div class="suggestion-title"><i class="fas fa-running"></i> 体能维度</div>
                    <div class="suggestion-text">保障精力输出：保持每周4次运动、每天7-8小时睡眠、用番茄工作法保护专注时段。你的结构化审美会帮你设计出可持续的精力管理方案。</div>
                </div>
                <div class="suggestion-item">
                    <div class="suggestion-title"><i class="fas fa-heart"></i> 情绪维度</div>
                    <div class="suggestion-text">通过叙事复盘转化焦虑：把你的学习过程和思考记录下来，这不仅是整理思路，更是用你的叙事表达能力把经历变成资产。</div>
                </div>
                <div class="suggestion-item">
                    <div class="suggestion-title"><i class="fas fa-bullseye"></i> 思维维度</div>
                    <div class="suggestion-text">保护深度创作时间：每天设置2小时"深度工作舱"，在这段时间里关闭社交软件，用你最强的元认知能力进入心流状态。</div>
                </div>
                <div class="suggestion-item">
                    <div class="suggestion-title"><i class="fas fa-star"></i> 意志维度</div>
                    <div class="suggestion-text">将大目标拆解为季度里程碑：你的"出题人"身份转换已经证明了——你完全有能力把宏大愿景分解成可执行的小步骤。</div>
                </div>
                <div class="suggestion-item">
                    <div class="suggestion-title"><i class="fas fa-rocket"></i> 第一周行动</div>
                    <div class="suggestion-text">1. 列出成为目标所需的核心技能 2. 找到2-3个榜样案例分析 3. 设计你的最小可行产品（MVP）</div>
                </div>
            `;

            const container = document.getElementById('goalSuggestions');
            container.innerHTML = suggestions;
            container.style.display = 'block';
        }

        function openMediaDetail(type) {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById(type + 'Page').classList.add('active');
            switchMediaTab(type, 'list');

            if (type === 'writing') renderWritingDocs();
            else if (type === 'lazyy') renderLazyyDocs();
            else if (type === 'ads') renderAdsDocs();
            else if (type === 'ideas') renderIdeasDocs();
            else if (type === 'pomodoro') renderPomodoroStats();
        }

        function switchMediaTab(media, tab) {
            const page = document.getElementById(media + 'Page');
            if (page) {
                page.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                page.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                const tabButtons = Array.from(page.querySelectorAll('.tab-btn'));
                const targetButton = tabButtons.find(btn => (btn.getAttribute('onclick') || '').includes("'" + tab + "'"));
                const currentEvent = typeof event === 'undefined' ? null : event;
                if (currentEvent?.target && page.contains(currentEvent.target)) currentEvent.target.classList.add('active');
                else if (targetButton) targetButton.classList.add('active');
                const targetContent = document.getElementById(media + '-' + tab);
                if (targetContent) targetContent.classList.add('active');

                if (media === 'ideas') {
                    if (tab === 'analysis') renderAnalysisList();
                    else if (tab === 'ip') renderIPList();
                    else if (tab === 'skills') renderSkillsList();
                    else if (tab === 'vault') renderIdeaVault();
                }
            }
        }

        function initMediaStorage() {
            if (!localStorage.getItem('vitaflow_writing')) localStorage.setItem('vitaflow_writing', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_lazyy')) localStorage.setItem('vitaflow_lazyy', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_ads')) localStorage.setItem('vitaflow_ads', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_ideas')) localStorage.setItem('vitaflow_ideas', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_pomodoro')) localStorage.setItem('vitaflow_pomodoro', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_reviews')) localStorage.setItem('vitaflow_reviews', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_analysis')) localStorage.setItem('vitaflow_analysis', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_ip')) localStorage.setItem('vitaflow_ip', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_skills')) localStorage.setItem('vitaflow_skills', JSON.stringify([]));
            if (typeof ensureIdeaVaultStorage === 'function') ensureIdeaVaultStorage();
            updateMediaCounts();
        }

        function updateMediaCounts() {
            const writing = JSON.parse(localStorage.getItem('vitaflow_writing') || '[]');
            const lazyy = JSON.parse(localStorage.getItem('vitaflow_lazyy') || '[]');
            const ads = JSON.parse(localStorage.getItem('vitaflow_ads') || '[]');
            const ideas = JSON.parse(localStorage.getItem('vitaflow_ideas') || '[]');
            const ideaVault = JSON.parse(localStorage.getItem('vitaflow_idea_vault') || '{"fragments":[]}');
            const ideaVaultCount = Array.isArray(ideaVault.fragments) ? ideaVault.fragments.length : 0;
            const analysis = JSON.parse(localStorage.getItem('vitaflow_analysis') || '[]');
            const ip = JSON.parse(localStorage.getItem('vitaflow_ip') || '[]');
            const skills = JSON.parse(localStorage.getItem('vitaflow_skills') || '[]');
            document.getElementById('writingCount').textContent = writing.length + ' 个文档';
            document.getElementById('lazyyCount').textContent = lazyy.length + ' 个想法';
            document.getElementById('adsCount').textContent = ads.length + ' 个记录';
            document.getElementById('ideasCount').textContent = (ideas.length + ideaVaultCount) + ' 个灵感';
            const benchmarkCountEl = document.getElementById('benchmarkCount');
            const businessCountEl = document.getElementById('businessCount');
            const skillsCountEl = document.getElementById('skillsCount');
            if (benchmarkCountEl) benchmarkCountEl.textContent = analysis.length + ' 个笔记';
            if (businessCountEl) businessCountEl.textContent = ip.length + ' 个笔记';
            if (skillsCountEl) skillsCountEl.textContent = skills.length + ' 个笔记';
        }

        const mediaDocModules = {
            writing: {
                storageKey: 'vitaflow_writing',
                createInputId: 'writingTitleInput',
                titleInputId: 'writingDocTitle',
                contentInputId: 'writingContent',
                listId: 'writingDocsList',
                openFunctionName: 'openWritingDoc',
                emptyText: '暂无文档，点击上方创建第一篇',
                createTitleMessage: '请输入文档标题',
                saveTitleMessage: '请输入标题',
                savedMessage: '✅ 文档已保存',
                showStatus: true,
                showUpdatedDate: true
            },
            lazyy: {
                storageKey: 'vitaflow_lazyy',
                createInputId: 'lazyyTitleInput',
                titleInputId: 'lazyyDocTitle',
                contentInputId: 'lazyyContent',
                listId: 'lazyyDocsList',
                openFunctionName: 'openLazyyDoc',
                emptyText: '暂无想法记录，开始记录吧',
                createTitleMessage: '请输入想法标题',
                savedMessage: '✅ 已保存'
            },
            ads: {
                storageKey: 'vitaflow_ads',
                createInputId: 'adsTitleInput',
                titleInputId: 'adsDocTitle',
                contentInputId: 'adsContent',
                listId: 'adsDocsList',
                openFunctionName: 'openAdsDoc',
                emptyText: '暂无广告记录',
                createTitleMessage: '请输入记录标题',
                savedMessage: '✅ 已保存'
            },
            ideas: {
                storageKey: 'vitaflow_ideas',
                createInputId: 'ideasTitleInput',
                titleInputId: 'ideasDocTitle',
                contentInputId: 'ideasContent',
                listId: 'ideasDocsList',
                openFunctionName: 'openIdeasDoc',
                emptyText: '暂无灵感记录',
                createTitleMessage: '请输入灵感标题',
                savedMessage: '✅ 已保存'
            }
        };

        function getMediaDocModule(moduleName) {
            const config = mediaDocModules[moduleName];
            if (!config) throw new Error('未知文档模块：' + moduleName);
            return config;
        }

        function readMediaDocs(config) {
            return JSON.parse(localStorage.getItem(config.storageKey) || '[]');
        }

        function writeMediaDocs(config, docs) {
            localStorage.setItem(config.storageKey, JSON.stringify(docs));
        }

        function formatMediaDocMeta(doc, config) {
            const created = new Date(doc.created).toLocaleDateString();
            if (!config.showUpdatedDate) return created;
            return '创建于 ' + created + ' | 更新于 ' + new Date(doc.updated).toLocaleDateString();
        }

        function renderMediaDocCard(doc, config) {
            const status = config.showStatus ? `<span class="doc-status ${doc.content ? 'active' : 'pending'}">${doc.content ? '已写' : '草稿'}</span>` : '';
            return `
                <div class="doc-card" onclick="${config.openFunctionName}(${inlineHandlerArg(doc.id)})">
                    <div class="doc-title">
                        <span>${escapeHtml(doc.title)}</span>
                        ${status}
                    </div>
                    <div class="doc-preview">${escapeHtml(doc.content) || '暂无内容'}</div>
                    <div class="doc-meta">${formatMediaDocMeta(doc, config)}</div>
                </div>
            `;
        }

        function createMediaDoc(moduleName) {
            const config = getMediaDocModule(moduleName);
            const titleInput = document.getElementById(config.createInputId);
            const title = titleInput.value.trim();
            if (!title) { alert(config.createTitleMessage); return; }
            const docs = readMediaDocs(config);
            const now = new Date().toISOString();
            docs.unshift({ id: Date.now(), title, content: '', created: now, updated: now });
            writeMediaDocs(config, docs);
            titleInput.value = '';
            renderMediaDocs(moduleName);
            updateMediaCounts();
        }

        function renderMediaDocs(moduleName) {
            const config = getMediaDocModule(moduleName);
            const docs = readMediaDocs(config);
            const listEl = document.getElementById(config.listId);
            if (docs.length === 0) {
                listEl.innerHTML = `<div style="text-align: center; color: #aa9a9a; padding: 30px;">${config.emptyText}</div>`;
                return;
            }
            listEl.innerHTML = docs.map(doc => renderMediaDocCard(doc, config)).join('');
        }

        function openMediaDoc(moduleName, id) {
            const config = getMediaDocModule(moduleName);
            const docs = readMediaDocs(config);
            const doc = docs.find(d => d.id === id);
            if (doc) {
                const contentInput = document.getElementById(config.contentInputId);
                document.getElementById(config.titleInputId).value = doc.title;
                contentInput.value = doc.content;
                contentInput.dataset.docId = id;
                switchMediaTab(moduleName, 'editor');
            }
        }

        function saveMediaDoc(moduleName) {
            const config = getMediaDocModule(moduleName);
            const title = document.getElementById(config.titleInputId).value.trim();
            const contentInput = document.getElementById(config.contentInputId);
            const content = contentInput.value;
            const docId = parseInt(contentInput.dataset.docId);
            if (config.saveTitleMessage && !title) { alert(config.saveTitleMessage); return; }
            const docs = readMediaDocs(config);
            const index = docs.findIndex(d => d.id === docId);
            if (index >= 0) {
                docs[index].title = title;
                docs[index].content = content;
                docs[index].updated = new Date().toISOString();
                writeMediaDocs(config, docs);
                alert(config.savedMessage);
                switchMediaTab(moduleName, 'list');
                renderMediaDocs(moduleName);
            }
        }

        function createWriting() { createMediaDoc('writing'); }
        function renderWritingDocs() { renderMediaDocs('writing'); }
        function openWritingDoc(id) { openMediaDoc('writing', id); }
        function saveWriting() { saveMediaDoc('writing'); }
        function createLazyy() { createMediaDoc('lazyy'); }
        function renderLazyyDocs() { renderMediaDocs('lazyy'); }
        function openLazyyDoc(id) { openMediaDoc('lazyy', id); }
        function saveLazyy() { saveMediaDoc('lazyy'); }
        function createAds() { createMediaDoc('ads'); }
        function renderAdsDocs() { renderMediaDocs('ads'); }
        function openAdsDoc(id) { openMediaDoc('ads', id); }
        function saveAds() { saveMediaDoc('ads'); }
        function createIdeas() { createMediaDoc('ideas'); }
        function renderIdeasDocs() { renderMediaDocs('ideas'); }
        function openIdeasDoc(id) { openMediaDoc('ideas', id); }
        function saveIdeas() { saveMediaDoc('ideas'); }

        const ideaVaultStorageKey = 'vitaflow_idea_vault';
        const ideaVaultDefaultMotifs = ['AI 产品想法', '个人知识管理', '内容创作', '项目灵感', '反复思考的问题'];
        const ideaVaultActionTypes = ['问题', '假设', '待验证点', '行动任务', '文章/产品/方案骨架'];

        function generateIdeaVaultId() {
            return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        }

        function normalizeIdeaVaultId(value) {
            const id = String(value || '');
            return /^[a-z0-9_-]+$/i.test(id) ? id : generateIdeaVaultId();
        }

        function normalizeIdeaVaultText(value) {
            return value === null || value === undefined ? '' : String(value);
        }

        function createDefaultIdeaVault() {
            const now = new Date().toISOString();
            return {
                fragments: [],
                motifs: ideaVaultDefaultMotifs.map(name => ({ id: generateIdeaVaultId(), name, created: now })),
                actions: []
            };
        }

        function normalizeIdeaVault(vault) {
            const now = new Date().toISOString();
            const rawMotifs = Array.isArray(vault?.motifs) ? vault.motifs : [];
            const motifs = rawMotifs
                .map(motif => ({
                    id: normalizeIdeaVaultId(motif.id),
                    name: normalizeIdeaVaultText(motif.name).trim(),
                    created: motif.created || now
                }))
                .filter(motif => motif.name);

            ideaVaultDefaultMotifs.forEach(name => {
                if (!motifs.some(motif => motif.name === name)) {
                    motifs.push({ id: generateIdeaVaultId(), name, created: now });
                }
            });

            const fragments = (Array.isArray(vault?.fragments) ? vault.fragments : [])
                .map(fragment => ({
                    id: normalizeIdeaVaultId(fragment.id),
                    idea: normalizeIdeaVaultText(fragment.idea).trim(),
                    trigger: normalizeIdeaVaultText(fragment.trigger).trim(),
                    motif: normalizeIdeaVaultText(fragment.motif).trim(),
                    uncertainty: normalizeIdeaVaultText(fragment.uncertainty).trim(),
                    nextStep: normalizeIdeaVaultText(fragment.nextStep).trim(),
                    status: fragment.status === 'promoted' ? 'promoted' : 'inbox',
                    created: fragment.created || now,
                    updated: fragment.updated || fragment.created || now
                }))
                .filter(fragment => fragment.idea);

            const actions = (Array.isArray(vault?.actions) ? vault.actions : [])
                .map(action => ({
                    id: normalizeIdeaVaultId(action.id),
                    sourceId: action.sourceId ? normalizeIdeaVaultId(action.sourceId) : '',
                    type: ideaVaultActionTypes.includes(action.type) ? action.type : '待验证点',
                    title: normalizeIdeaVaultText(action.title).trim(),
                    nextAction: normalizeIdeaVaultText(action.nextAction).trim(),
                    status: action.status === 'done' ? 'done' : 'open',
                    created: action.created || now,
                    updated: action.updated || action.created || now
                }))
                .filter(action => action.title);

            return { fragments, motifs, actions };
        }

        function readIdeaVault() {
            const raw = localStorage.getItem(ideaVaultStorageKey);
            if (!raw) return createDefaultIdeaVault();
            try {
                return normalizeIdeaVault(JSON.parse(raw));
            } catch (e) {
                return createDefaultIdeaVault();
            }
        }

        function saveIdeaVault(vault) {
            localStorage.setItem(ideaVaultStorageKey, JSON.stringify(normalizeIdeaVault(vault)));
            updateMediaCounts();
        }

        function ensureIdeaVaultStorage() {
            if (!localStorage.getItem(ideaVaultStorageKey)) {
                localStorage.setItem(ideaVaultStorageKey, JSON.stringify(createDefaultIdeaVault()));
            }
        }

        function formatIdeaVaultDate(value) {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '';
            return date.toLocaleDateString();
        }

        function getIdeaVaultFieldValue(id) {
            const field = document.getElementById(id);
            return field ? field.value.trim() : '';
        }

        function setIdeaVaultFieldValue(id, value) {
            const field = document.getElementById(id);
            if (field) field.value = value;
        }

        function createIdeaVaultFragment() {
            const idea = getIdeaVaultFieldValue('ideaVaultIdea');
            if (!idea) {
                alert('先写一句原话就行');
                return;
            }

            const vault = readIdeaVault();
            const now = new Date().toISOString();
            const motif = getIdeaVaultFieldValue('ideaVaultMotif');

            if (motif && !vault.motifs.some(item => item.name === motif)) {
                vault.motifs.push({ id: generateIdeaVaultId(), name: motif, created: now });
            }

            vault.fragments.unshift({
                id: generateIdeaVaultId(),
                idea,
                trigger: getIdeaVaultFieldValue('ideaVaultTrigger'),
                motif,
                uncertainty: getIdeaVaultFieldValue('ideaVaultUncertainty'),
                nextStep: getIdeaVaultFieldValue('ideaVaultNextStep'),
                status: 'inbox',
                created: now,
                updated: now
            });

            saveIdeaVault(vault);
            ['ideaVaultIdea', 'ideaVaultTrigger', 'ideaVaultMotif', 'ideaVaultUncertainty', 'ideaVaultNextStep'].forEach(id => setIdeaVaultFieldValue(id, ''));
            renderIdeaVault();
        }

        function addIdeaVaultMotif() {
            const name = getIdeaVaultFieldValue('ideaVaultMotifName');
            if (!name) {
                alert('请输入母题名称');
                return;
            }

            const vault = readIdeaVault();
            if (vault.motifs.some(motif => motif.name === name)) {
                alert('这个母题已经存在');
                return;
            }

            vault.motifs.push({ id: generateIdeaVaultId(), name, created: new Date().toISOString() });
            saveIdeaVault(vault);
            setIdeaVaultFieldValue('ideaVaultMotifName', '');
            renderIdeaVault();
        }

        function promoteIdeaVaultFragment(id) {
            const vault = readIdeaVault();
            const fragment = vault.fragments.find(item => item.id === id);
            if (!fragment) return;

            setIdeaVaultFieldValue('ideaVaultActionSource', fragment.id);
            setIdeaVaultFieldValue('ideaVaultActionType', fragment.nextStep ? '行动任务' : '待验证点');
            setIdeaVaultFieldValue('ideaVaultActionTitle', fragment.nextStep || fragment.idea);
            setIdeaVaultFieldValue('ideaVaultActionNext', fragment.nextStep || '');

            const titleInput = document.getElementById('ideaVaultActionTitle');
            if (titleInput) titleInput.focus();
        }

        function createIdeaVaultAction() {
            const vault = readIdeaVault();
            const sourceId = getIdeaVaultFieldValue('ideaVaultActionSource');
            const source = vault.fragments.find(fragment => fragment.id === sourceId);
            const type = getIdeaVaultFieldValue('ideaVaultActionType') || '待验证点';
            const fallbackTitle = source ? (source.nextStep || source.idea) : '';
            const title = getIdeaVaultFieldValue('ideaVaultActionTitle') || fallbackTitle;

            if (!title) {
                alert('请输入可推进条目');
                return;
            }

            const now = new Date().toISOString();
            vault.actions.unshift({
                id: generateIdeaVaultId(),
                sourceId: source ? source.id : '',
                type,
                title,
                nextAction: getIdeaVaultFieldValue('ideaVaultActionNext'),
                status: 'open',
                created: now,
                updated: now
            });

            if (source) {
                source.status = 'promoted';
                source.updated = now;
            }

            saveIdeaVault(vault);
            setIdeaVaultFieldValue('ideaVaultActionSource', '');
            setIdeaVaultFieldValue('ideaVaultActionTitle', '');
            setIdeaVaultFieldValue('ideaVaultActionNext', '');
            renderIdeaVault();
        }

        function deleteIdeaVaultFragment(id) {
            if (!confirm('删除这条碎片想法？')) return;
            const vault = readIdeaVault();
            vault.fragments = vault.fragments.filter(fragment => fragment.id !== id);
            vault.actions = vault.actions.filter(action => action.sourceId !== id);
            saveIdeaVault(vault);
            renderIdeaVault();
        }

        function deleteIdeaVaultAction(id) {
            if (!confirm('删除这个可推进条目？')) return;
            const vault = readIdeaVault();
            vault.actions = vault.actions.filter(action => action.id !== id);
            saveIdeaVault(vault);
            renderIdeaVault();
        }

        function toggleIdeaVaultAction(id) {
            const vault = readIdeaVault();
            const action = vault.actions.find(item => item.id === id);
            if (!action) return;
            action.status = action.status === 'done' ? 'open' : 'done';
            action.updated = new Date().toISOString();
            saveIdeaVault(vault);
            renderIdeaVault();
        }

        function renderIdeaVaultOptions(vault) {
            const motifList = document.getElementById('ideaVaultMotifList');
            if (motifList) {
                motifList.innerHTML = vault.motifs.map(motif => `<option value="${escapeHtml(motif.name)}"></option>`).join('');
            }

            const sourceSelect = document.getElementById('ideaVaultActionSource');
            if (sourceSelect) {
                const options = vault.fragments.map(fragment => {
                    const status = fragment.status === 'promoted' ? '已推进' : '收集箱';
                    return `<option value="${escapeHtml(fragment.id)}">${escapeHtml(fragment.idea.slice(0, 36))} · ${status}</option>`;
                }).join('');
                sourceSelect.innerHTML = `<option value="">不绑定来源</option>${options}`;
            }
        }

        function renderIdeaVaultInbox(vault) {
            const list = document.getElementById('ideaVaultInbox');
            if (!list) return;

            const inbox = vault.fragments.filter(fragment => fragment.status !== 'promoted');
            const count = document.getElementById('ideaVaultInboxCount');
            if (count) count.textContent = inbox.length + ' 条';

            if (inbox.length === 0) {
                list.innerHTML = '<div class="idea-vault-empty">还没有碎片，先写一句原话。</div>';
                return;
            }

            list.innerHTML = inbox.map(fragment => `
                <div class="idea-vault-item">
                    <div class="idea-vault-item-title">${escapeHtml(fragment.idea)}</div>
                    <div class="idea-vault-meta">
                        ${fragment.motif ? `<span class="idea-vault-chip">${escapeHtml(fragment.motif)}</span>` : '<span class="idea-vault-chip">未归组</span>'}
                        <span>${formatIdeaVaultDate(fragment.created)}</span>
                    </div>
                    ${fragment.trigger ? `<div class="idea-vault-line"><strong>触发：</strong>${escapeHtml(fragment.trigger)}</div>` : ''}
                    ${fragment.uncertainty ? `<div class="idea-vault-line"><strong>不确定：</strong>${escapeHtml(fragment.uncertainty)}</div>` : ''}
                    ${fragment.nextStep ? `<div class="idea-vault-line"><strong>下一步：</strong>${escapeHtml(fragment.nextStep)}</div>` : ''}
                    <div class="idea-vault-actions">
                        <button class="idea-vault-small-btn" onclick="promoteIdeaVaultFragment(${inlineHandlerArg(fragment.id)})">推进</button>
                        <button class="idea-vault-small-btn danger" onclick="deleteIdeaVaultFragment(${inlineHandlerArg(fragment.id)})">删除</button>
                    </div>
                </div>
            `).join('');
        }

        function renderIdeaVaultMotifs(vault) {
            const list = document.getElementById('ideaVaultMotifs');
            if (!list) return;

            const motifNames = vault.motifs.map(motif => motif.name);
            const ungrouped = vault.fragments.filter(fragment => !fragment.motif).length;
            const motifRows = motifNames.map(name => {
                const fragments = vault.fragments.filter(fragment => fragment.motif === name);
                return {
                    name,
                    count: fragments.length,
                    latest: fragments[0]?.idea || ''
                };
            });
            if (ungrouped > 0) {
                motifRows.unshift({ name: '未归组', count: ungrouped, latest: '等待之后归到母题' });
            }

            const count = document.getElementById('ideaVaultMotifCount');
            if (count) count.textContent = motifRows.filter(row => row.count > 0 || row.name !== '未归组').length + ' 个';

            list.innerHTML = motifRows.map(row => `
                <div class="idea-vault-item">
                    <div class="idea-vault-item-title">${escapeHtml(row.name)}</div>
                    <div class="idea-vault-meta">
                        <span class="idea-vault-chip">${row.count} 条碎片</span>
                    </div>
                    ${row.latest ? `<div class="idea-vault-line">${escapeHtml(row.latest)}</div>` : ''}
                </div>
            `).join('');
        }

        function renderIdeaVaultActions(vault) {
            const list = document.getElementById('ideaVaultActions');
            if (!list) return;

            const count = document.getElementById('ideaVaultActionCount');
            if (count) count.textContent = vault.actions.length + ' 条';

            if (vault.actions.length === 0) {
                list.innerHTML = '<div class="idea-vault-empty">还没有可推进条目。</div>';
                return;
            }

            list.innerHTML = vault.actions.map(action => {
                const source = vault.fragments.find(fragment => fragment.id === action.sourceId);
                return `
                    <div class="idea-vault-item ${action.status === 'done' ? 'done' : ''}">
                        <div class="idea-vault-item-title">${escapeHtml(action.title)}</div>
                        <div class="idea-vault-meta">
                            <span class="idea-vault-chip">${escapeHtml(action.type)}</span>
                            <span>${action.status === 'done' ? '已完成' : '推进中'}</span>
                        </div>
                        ${action.nextAction ? `<div class="idea-vault-line"><strong>下一步：</strong>${escapeHtml(action.nextAction)}</div>` : ''}
                        ${source ? `<div class="idea-vault-line"><strong>来源：</strong>${escapeHtml(source.idea)}</div>` : ''}
                        <div class="idea-vault-actions">
                            <button class="idea-vault-small-btn" onclick="toggleIdeaVaultAction(${inlineHandlerArg(action.id)})">${action.status === 'done' ? '重开' : '完成'}</button>
                            <button class="idea-vault-small-btn danger" onclick="deleteIdeaVaultAction(${inlineHandlerArg(action.id)})">删除</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderIdeaVault() {
            const vaultContainer = document.getElementById('ideas-vault');
            if (!vaultContainer) return;

            const vault = readIdeaVault();
            renderIdeaVaultOptions(vault);
            renderIdeaVaultInbox(vault);
            renderIdeaVaultMotifs(vault);
            renderIdeaVaultActions(vault);
        }
        function addAnalysisItem() {
            const analysisList = JSON.parse(localStorage.getItem('vitaflow_analysis') || '[]');
            const newItem = {
                id: Date.now(),
                name: '',
                platform: '',
                strengths: `【优势分析引导】
1. 内容定位：这个创作者的核心受众是谁？他们解决了什么问题？
2. 内容形式：他们常用什么形式（图文/视频/直播等）？
3. 差异化：他们与同类创作者有什么不同？
4. 数据表现：他们的平均播放/点赞/评论数据如何？
5. 变现模式：他们是怎么变现的（广告/直播/课程等）？`,
                weaknesses: `【可改进之处引导】
1. 更新频率：是否有断更或更新不稳定的问题？
2. 内容质量：哪些方面可以进一步提升？
3. 互动性：与粉丝的互动如何？
4. 差异化：是否有同质化问题？
5. 品牌建设：个人品牌辨识度如何？`,
                insights: `【洞察与启发引导】
1. 我可以学习的3个点：
   -
   -
   -
2. 我可以借鉴的创作方法：
   -
   -
3. 跟进计划：
   - 下一步我要尝试什么？
   - 什么时候再复盘这次分析？`,
                images: [],
                created: new Date().toISOString()
            };
            analysisList.unshift(newItem);
            localStorage.setItem('vitaflow_analysis', JSON.stringify(analysisList));
            renderAnalysisList();
            openAnalysisDetail(newItem.id);
        }

        function renderAnalysisList() {
            const list = JSON.parse(localStorage.getItem('vitaflow_analysis') || '[]');
            const el = document.getElementById('analysisList');
            if (list.length === 0) {
                el.innerHTML = `
                    <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border-radius: 24px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(102, 126, 234, 0.2);">
                        <div style="font-size: 1.2rem; font-weight: 700; color: #667eea; margin-bottom: 16px;">🎯 对标分析引导</div>
                        <div style="color: #6a4a7a; line-height: 1.8;">
                            <p style="margin-bottom: 12px;"><strong>为什么要做对标分析？</strong></p>
                            <ul style="margin-left: 20px; margin-bottom: 16px;">
                                <li>学习优秀创作者的成功经验</li>
                                <li>找到自己的差异化定位</li>
                                <li>避免走弯路，快速成长</li>
                            </ul>
                            <p style="margin-bottom: 8px;"><strong>如何有效使用这个模块：</strong></p>
                            <ol style="margin-left: 20px;">
                                <li>点击上方按钮添加对标创作者</li>
                                <li>填写优势、可改进之处和你的洞察</li>
                                <li>定期跟进（建议每周复盘一次）</li>
                                <li>把学到的东西应用到自己的创作中</li>
                            </ol>
                        </div>
                    </div>
                    <div style="text-align: center; color: #aa9a9a; padding: 20px;">暂无对标分析记录，点击上方按钮开始第一个分析吧！</div>
                `;
                return;
            }
            el.innerHTML = list.map(item => `
                <div class="doc-card" onclick="openAnalysisDetail(${inlineHandlerArg(item.id)})">
                    <div class="doc-title"><span>${escapeHtml(item.name) || '未命名创作者'}</span></div>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        ${item.platform ? `<span style="font-size: 0.75rem; color: #8b5e9e; background: rgba(139, 94, 158, 0.1); padding: 4px 8px; border-radius: 8px;">${escapeHtml(item.platform)}</span>` : ''}
                        ${item.images.length > 0 ? `<span style="font-size: 0.75rem; color: #c4679c;">📷 ${item.images.length}张图</span>` : ''}
                    </div>
                    <div class="doc-preview">${escapeHtml(item.insights) || '暂无分析内容'}</div>
                    <div class="doc-meta">${new Date(item.created).toLocaleDateString()}</div>
                </div>
            `).join('');
        }

        function openAnalysisDetail(id) {
            const list = JSON.parse(localStorage.getItem('vitaflow_analysis') || '[]');
            const item = list.find(i => i.id === id);
            if (!item) return;

            document.getElementById('ideas-analysis').innerHTML = `
                <div class="record-form">
                    <div class="form-group">
                        <label class="form-label">创作者名称</label>
                        <input type="text" class="form-input" id="analysisName" value="${escapeHtml(item.name)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">平台</label>
                        <input type="text" class="form-input" id="analysisPlatform" value="${escapeHtml(item.platform)}" placeholder="如：B站、小红书、抖音等">
                    </div>
                    <div class="form-group">
                        <label class="form-label">优势分析</label>
                        <textarea class="text-editor" id="analysisStrengths">${escapeHtml(item.strengths)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">可改进之处</label>
                        <textarea class="text-editor" id="analysisWeaknesses">${escapeHtml(item.weaknesses)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">洞察与启发</label>
                        <textarea class="text-editor" id="analysisInsights">${escapeHtml(item.insights)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">上传图片</label>
                        <input type="file" id="analysisImageInput" accept="image/*" multiple style="display: none;">
                        <button class="add-btn" style="width: 100%; background: rgba(139, 94, 158, 0.3);" onclick="document.getElementById('analysisImageInput').click()">📷 选择图片</button>
                        <div id="analysisImagesPreview" style="margin-top: 12px;">
                            ${item.images.map((img, idx) => `<img src="${escapeHtml(img)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 8px; margin-bottom: 8px;" onclick="removeAnalysisImage(${inlineHandlerArg(id)}, ${idx})">`).join('')}
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 16px;">
                        <button class="add-btn" style="background: linear-gradient(135deg, #667eea, #764ba2);" onclick="saveAnalysis(${inlineHandlerArg(id)})">💾 保存</button>
                        <button class="add-btn" style="background: rgba(200, 160, 200, 0.3);" onclick="renderAnalysisList()">返回列表</button>
                    </div>
                </div>
            `;

            document.getElementById('analysisImageInput').addEventListener('change', function(e) {
                const files = e.target.files;
                for (let i = 0; i < files.length; i++) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const list = JSON.parse(localStorage.getItem('vitaflow_analysis') || '[]');
                        const item = list.find(i => i.id === id);
                        if (item) {
                            item.images.push(event.target.result);
                            localStorage.setItem('vitaflow_analysis', JSON.stringify(list));
                            document.getElementById('analysisImagesPreview').innerHTML += `<img src="${escapeHtml(event.target.result)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 8px; margin-bottom: 8px;">`;
                        }
                    };
                    reader.readAsDataURL(files[i]);
                }
            });
        }

        function removeAnalysisImage(itemId, imgIndex) {
            const list = JSON.parse(localStorage.getItem('vitaflow_analysis') || '[]');
            const item = list.find(i => i.id === itemId);
            if (item) {
                item.images.splice(imgIndex, 1);
                localStorage.setItem('vitaflow_analysis', JSON.stringify(list));
                openAnalysisDetail(itemId);
            }
        }

        function saveAnalysis(id) {
            const list = JSON.parse(localStorage.getItem('vitaflow_analysis') || '[]');
            const index = list.findIndex(i => i.id === id);
            if (index >= 0) {
                list[index].name = document.getElementById('analysisName').value;
                list[index].platform = document.getElementById('analysisPlatform').value;
                list[index].strengths = document.getElementById('analysisStrengths').value;
                list[index].weaknesses = document.getElementById('analysisWeaknesses').value;
                list[index].insights = document.getElementById('analysisInsights').value;
                localStorage.setItem('vitaflow_analysis', JSON.stringify(list));
                alert('✅ 已保存');
                document.getElementById('ideas-analysis').innerHTML = '<div style="margin-bottom: 16px;"><button class="add-btn" style="background: linear-gradient(135deg, #667eea, #764ba2);" onclick="addAnalysisItem()">+ 添加创作者分析</button></div><div id="analysisList"></div>';
                renderAnalysisList();
            }
        }

        function addIPItem() {
            const ipList = JSON.parse(localStorage.getItem('vitaflow_ip') || '[]');
            const newItem = {
                id: Date.now(),
                title: '',
                audience: `【目标受众分析引导】
1. 核心画像：
   - 年龄：
   - 性别：
   - 地域：
   - 职业/身份：

2. 痛点与需求：
   - 他们目前面临什么问题？
   - 他们渴望获得什么？

3. 触达渠道：
   - 他们活跃在哪些平台？
   - 什么内容形式最吸引他们？`,
                monetization: `【变现模式分析引导】
1. 现有变现方式：
   - 广告收入？
   - 直播打赏？
   - 电商带货？
   - 知识付费？
   - 其他？

2. 变现效率分析：
   - 哪些方式收益最高？
   - 哪些方式投入产出比最好？

3. 可拓展的方向：
   - 还有哪些变现可能？
   - 需要什么资源来实现？`,
                competition: `【竞争格局分析引导】
1. 直接竞争对手：
   - 有哪些同类型的创作者？
   - 他们的优势和劣势是什么？

2. 市场饱和度：
   - 这个赛道拥挤吗？
   - 还有空白机会吗？

3. 差异化机会：
   - 我可以从什么角度切入？
   - 我的独特性在哪里？`,
                opportunities: `【机会与风险分析引导】
1. 短期机会（1-3个月）：
   -
   -

2. 中期机会（3-12个月）：
   -
   -

3. 潜在风险：
   -
   -

4. 跟进计划：
   - 下一步行动是什么？
   - 什么时候重新评估？`,
                images: [],
                created: new Date().toISOString()
            };
            ipList.unshift(newItem);
            localStorage.setItem('vitaflow_ip', JSON.stringify(ipList));
            renderIPList();
            openIPDetail(newItem.id);
        }

        function renderIPList() {
            const list = JSON.parse(localStorage.getItem('vitaflow_ip') || '[]');
            const el = document.getElementById('ipList');
            if (list.length === 0) {
                el.innerHTML = `
                    <div style="background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1)); border-radius: 24px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(17, 153, 142, 0.2);">
                        <div style="font-size: 1.2rem; font-weight: 700; color: #11998e; margin-bottom: 16px;">💼 IP商业分析引导</div>
                        <div style="color: #6a4a7a; line-height: 1.8;">
                            <p style="margin-bottom: 12px;"><strong>为什么要做IP商业分析？</strong></p>
                            <ul style="margin-left: 20px; margin-bottom: 16px;">
                                <li>系统性思考你的个人品牌商业模式</li>
                                <li>明确目标受众和变现路径</li>
                                <li>识别市场机会和潜在风险</li>
                                <li>制定可执行的商业计划</li>
                            </ul>
                            <p style="margin-bottom: 8px;"><strong>分析框架建议：</strong></p>
                            <ol style="margin-left: 20px;">
                                <li>目标受众：谁是你的核心用户？</li>
                                <li>变现模式：你打算怎么赚钱？</li>
                                <li>竞争格局：市场上还有谁？</li>
                                <li>机会风险：机遇和挑战是什么？</li>
                            </ol>
                        </div>
                    </div>
                    <div style="text-align: center; color: #aa9a9a; padding: 20px;">暂无IP商业分析记录，点击上方按钮开始你的第一个商业分析！</div>
                `;
                return;
            }
            el.innerHTML = list.map(item => `
                <div class="doc-card" onclick="openIPDetail(${inlineHandlerArg(item.id)})">
                    <div class="doc-title"><span>${escapeHtml(item.title) || '未命名分析'}</span></div>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        ${item.audience ? `<span style="font-size: 0.75rem; color: #11998e; background: rgba(17, 153, 142, 0.1); padding: 4px 8px; border-radius: 8px;">目标受众</span>` : ''}
                        ${item.images.length > 0 ? `<span style="font-size: 0.75rem; color: #c4679c;">📷 ${item.images.length}张图</span>` : ''}
                    </div>
                    <div class="doc-preview">${escapeHtml(item.opportunities) || '暂无分析内容'}</div>
                    <div class="doc-meta">${new Date(item.created).toLocaleDateString()}</div>
                </div>
            `).join('');
        }

        function openIPDetail(id) {
            const list = JSON.parse(localStorage.getItem('vitaflow_ip') || '[]');
            const item = list.find(i => i.id === id);
            if (!item) return;

            document.getElementById('ideas-ip').innerHTML = `
                <div class="record-form">
                    <div class="form-group">
                        <label class="form-label">分析标题</label>
                        <input type="text" class="form-input" id="ipTitle" value="${escapeHtml(item.title)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">目标受众分析</label>
                        <textarea class="text-editor" id="ipAudience">${escapeHtml(item.audience)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">变现方式</label>
                        <textarea class="text-editor" id="ipMonetization">${escapeHtml(item.monetization)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">竞争分析</label>
                        <textarea class="text-editor" id="ipCompetition">${escapeHtml(item.competition)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">机会与风险</label>
                        <textarea class="text-editor" id="ipOpportunities">${escapeHtml(item.opportunities)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">上传图片</label>
                        <input type="file" id="ipImageInput" accept="image/*" multiple style="display: none;">
                        <button class="add-btn" style="width: 100%; background: rgba(17, 153, 142, 0.3);" onclick="document.getElementById('ipImageInput').click()">📷 选择图片</button>
                        <div id="ipImagesPreview" style="margin-top: 12px;">
                            ${item.images.map((img, idx) => `<img src="${escapeHtml(img)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 8px; margin-bottom: 8px;" onclick="removeIPImage(${inlineHandlerArg(id)}, ${idx})">`).join('')}
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 16px;">
                        <button class="add-btn" style="background: linear-gradient(135deg, #11998e, #38ef7d);" onclick="saveIP(${inlineHandlerArg(id)})">💾 保存</button>
                        <button class="add-btn" style="background: rgba(200, 160, 200, 0.3);" onclick="renderIPList()">返回列表</button>
                    </div>
                </div>
            `;

            document.getElementById('ipImageInput').addEventListener('change', function(e) {
                const files = e.target.files;
                for (let i = 0; i < files.length; i++) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const list = JSON.parse(localStorage.getItem('vitaflow_ip') || '[]');
                        const item = list.find(i => i.id === id);
                        if (item) {
                            item.images.push(event.target.result);
                            localStorage.setItem('vitaflow_ip', JSON.stringify(list));
                            document.getElementById('ipImagesPreview').innerHTML += `<img src="${escapeHtml(event.target.result)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 8px; margin-bottom: 8px;">`;
                        }
                    };
                    reader.readAsDataURL(files[i]);
                }
            });
        }

        function removeIPImage(itemId, imgIndex) {
            const list = JSON.parse(localStorage.getItem('vitaflow_ip') || '[]');
            const item = list.find(i => i.id === itemId);
            if (item) {
                item.images.splice(imgIndex, 1);
                localStorage.setItem('vitaflow_ip', JSON.stringify(list));
                openIPDetail(itemId);
            }
        }

        function saveIP(id) {
            const list = JSON.parse(localStorage.getItem('vitaflow_ip') || '[]');
            const index = list.findIndex(i => i.id === id);
            if (index >= 0) {
                list[index].title = document.getElementById('ipTitle').value;
                list[index].audience = document.getElementById('ipAudience').value;
                list[index].monetization = document.getElementById('ipMonetization').value;
                list[index].competition = document.getElementById('ipCompetition').value;
                list[index].opportunities = document.getElementById('ipOpportunities').value;
                localStorage.setItem('vitaflow_ip', JSON.stringify(list));
                alert('✅ 已保存');
                document.getElementById('ideas-ip').innerHTML = '<div style="margin-bottom: 16px;"><button class="add-btn" style="background: linear-gradient(135deg, #11998e, #38ef7d);" onclick="addIPItem()">+ 添加商业分析</button></div><div id="ipList"></div>';
                renderIPList();
            }
        }

        function addSkillItem() {
            const skillsList = JSON.parse(localStorage.getItem('vitaflow_skills') || '[]');
            const newItem = {
                id: Date.now(),
                name: '',
                category: '',
                progress: 0,
                resources: `【学习资源整理引导】
1. 教程与课程：
   -
   -

2. 参考资料/书籍：
   -
   -

3. 优质博主/创作者：
   -
   -

4. 实用工具：
   -
   - `,
                notes: `【学习笔记与跟进计划引导】
1. 学习目标（SMART原则）：
   - 具体目标是什么？
   - 何时达成？
   - 如何衡量？

2. 阶段计划：
   - 第1周：
   - 第2-4周：
   - 第2个月：

3. 学习笔记：
   - 重要概念记录
   - 遇到的坑与解决方案
   - 顿悟时刻

4. 实践应用计划：
   - 如何将这个技能用到实际中？
   - 计划做什么作品/项目？

5. 跟进复盘：
   - 每周学习成果
   - 遇到的问题
   - 下周计划`,
                images: [],
                created: new Date().toISOString()
            };
            skillsList.unshift(newItem);
            localStorage.setItem('vitaflow_skills', JSON.stringify(skillsList));
            renderSkillsList();
            openSkillDetail(newItem.id);
        }

        function renderSkillsList() {
            const list = JSON.parse(localStorage.getItem('vitaflow_skills') || '[]');
            const el = document.getElementById('skillsList');
            if (list.length === 0) {
                el.innerHTML = `
                    <div style="background: linear-gradient(135deg, rgba(232, 138, 76, 0.1), rgba(212, 112, 160, 0.1)); border-radius: 24px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(232, 138, 76, 0.2);">
                        <div style="font-size: 1.2rem; font-weight: 700; color: #e88a4c; margin-bottom: 16px;">🎨 新技能学习引导</div>
                        <div style="color: #6a4a7a; line-height: 1.8;">
                            <p style="margin-bottom: 12px;"><strong>为什么要系统记录学习过程？</strong></p>
                            <ul style="margin-left: 20px; margin-bottom: 16px;">
                                <li>避免碎片化学习，建立知识更系统</li>
                                <li>记录成长轨迹，看见自己的进步</li>
                                <li>整理学习资源，方便回顾查找</li>
                                <li>制定跟进计划，确保学习效果</li>
                            </ul>
                            <p style="margin-bottom: 8px;"><strong>推荐的学习框架：</strong></p>
                            <ol style="margin-left: 20px;">
                                <li>明确目标：用SMART原则制定可衡量的目标</li>
                                <li>收集资源：教程、书籍、博主等</li>
                                <li>分阶段学习：循序渐进</li>
                                <li>实践应用：做项目练手</li>
                                <li>定期复盘：每周回顾调整</li>
                            </ol>
                        </div>
                    </div>
                    <div style="text-align: center; color: #aa9a9a; padding: 20px;">暂无技能学习记录，点击上方按钮开始学习新技能！</div>
                `;
                return;
            }
            el.innerHTML = list.map(item => {
                const progress = Math.max(0, Math.min(100, Number(item.progress) || 0));
                return `
                <div class="doc-card" onclick="openSkillDetail(${inlineHandlerArg(item.id)})">
                    <div class="doc-title"><span>${escapeHtml(item.name) || '未命名技能'}</span></div>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        ${item.category ? `<span style="font-size: 0.75rem; color: #e88a4c; background: rgba(232, 138, 76, 0.1); padding: 4px 8px; border-radius: 8px;">${escapeHtml(item.category)}</span>` : ''}
                        <span style="font-size: 0.75rem; color: #8b5e9e;">进度: ${progress}%</span>
                        ${item.images.length > 0 ? `<span style="font-size: 0.75rem; color: #c4679c;">📷 ${item.images.length}张图</span>` : ''}
                    </div>
                    <div style="height: 8px; background: rgba(200, 160, 200, 0.2); border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
                        <div style="height: 100%; background: linear-gradient(135deg, #e88a4c, #d470a0); width: ${progress}%; transition: width 0.3s;"></div>
                    </div>
                    <div class="doc-preview">${escapeHtml(item.notes) || '暂无学习笔记'}</div>
                    <div class="doc-meta">${new Date(item.created).toLocaleDateString()}</div>
                </div>
            `;
            }).join('');
        }

        function openSkillDetail(id) {
            const list = JSON.parse(localStorage.getItem('vitaflow_skills') || '[]');
            const item = list.find(i => i.id === id);
            if (!item) return;
            const progress = Math.max(0, Math.min(100, Number(item.progress) || 0));

            document.getElementById('ideas-skills').innerHTML = `
                <div class="record-form">
                    <div class="form-group">
                        <label class="form-label">技能名称</label>
                        <input type="text" class="form-input" id="skillName" value="${escapeHtml(item.name)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">分类</label>
                        <input type="text" class="form-input" id="skillCategory" value="${escapeHtml(item.category)}" placeholder="如：编程、设计、写作等">
                    </div>
                    <div class="form-group">
                        <label class="form-label">学习进度: ${progress}%</label>
                        <input type="range" class="form-range" id="skillProgress" min="0" max="100" value="${progress}" oninput="document.getElementById('skillProgressValue').textContent = this.value + '%'">
                        <div style="text-align: center; font-size: 1.2rem; font-weight: 700; color: #e88a4c;" id="skillProgressValue">${progress}%</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">学习资源</label>
                        <textarea class="text-editor" id="skillResources">${escapeHtml(item.resources)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">学习笔记</label>
                        <textarea class="text-editor" id="skillNotes">${escapeHtml(item.notes)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">上传图片</label>
                        <input type="file" id="skillImageInput" accept="image/*" multiple style="display: none;">
                        <button class="add-btn" style="width: 100%; background: rgba(232, 138, 76, 0.3);" onclick="document.getElementById('skillImageInput').click()">📷 选择图片</button>
                        <div id="skillImagesPreview" style="margin-top: 12px;">
                            ${item.images.map((img, idx) => `<img src="${escapeHtml(img)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 8px; margin-bottom: 8px;" onclick="removeSkillImage(${inlineHandlerArg(id)}, ${idx})">`).join('')}
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 16px;">
                        <button class="add-btn" style="background: linear-gradient(135deg, #e88a4c, #d470a0);" onclick="saveSkill(${inlineHandlerArg(id)})">💾 保存</button>
                        <button class="add-btn" style="background: rgba(200, 160, 200, 0.3);" onclick="renderSkillsList()">返回列表</button>
                    </div>
                </div>
            `;

            document.getElementById('skillImageInput').addEventListener('change', function(e) {
                const files = e.target.files;
                for (let i = 0; i < files.length; i++) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const list = JSON.parse(localStorage.getItem('vitaflow_skills') || '[]');
                        const item = list.find(i => i.id === id);
                        if (item) {
                            item.images.push(event.target.result);
                            localStorage.setItem('vitaflow_skills', JSON.stringify(list));
                            document.getElementById('skillImagesPreview').innerHTML += `<img src="${escapeHtml(event.target.result)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 8px; margin-bottom: 8px;">`;
                        }
                    };
                    reader.readAsDataURL(files[i]);
                }
            });
        }

        function removeSkillImage(itemId, imgIndex) {
            const list = JSON.parse(localStorage.getItem('vitaflow_skills') || '[]');
            const item = list.find(i => i.id === itemId);
            if (item) {
                item.images.splice(imgIndex, 1);
                localStorage.setItem('vitaflow_skills', JSON.stringify(list));
                openSkillDetail(itemId);
            }
        }

        function saveSkill(id) {
            const list = JSON.parse(localStorage.getItem('vitaflow_skills') || '[]');
            const index = list.findIndex(i => i.id === id);
            if (index >= 0) {
                list[index].name = document.getElementById('skillName').value;
                list[index].category = document.getElementById('skillCategory').value;
                list[index].progress = parseInt(document.getElementById('skillProgress').value);
                list[index].resources = document.getElementById('skillResources').value;
                list[index].notes = document.getElementById('skillNotes').value;
                localStorage.setItem('vitaflow_skills', JSON.stringify(list));
                alert('✅ 已保存');
                document.getElementById('ideas-skills').innerHTML = '<div style="margin-bottom: 16px;"><button class="add-btn" style="background: linear-gradient(135deg, #e88a4c, #d470a0);" onclick="addSkillItem()">+ 添加学习技能</button></div><div id="skillsList"></div>';
                renderSkillsList();
            }
        }

        let pomodoroInterval = null;
        let pomodoroTimeLeft = 0;
        function startPomodoro() {
            if (pomodoroInterval) {
                alert('🍅 专注中，请先完成当前番茄钟！');
                return;
            }
            pomodoroTimeLeft = 25 * 60;
            document.getElementById('pomodoroTimer').style.display = 'block';
            document.getElementById('startPomodoroBtn').style.display = 'none';
            document.getElementById('stopPomodoroBtn').style.display = 'inline-block';
            updateTimerDisplay();
            pomodoroInterval = setInterval(() => {
                pomodoroTimeLeft--;
                updateTimerDisplay();
                if (pomodoroTimeLeft <= 0) {
                    clearInterval(pomodoroInterval);
                    pomodoroInterval = null;
                    completePomodoro();
                }
            }, 1000);
        }

        function updateTimerDisplay() {
            const minutes = Math.floor(pomodoroTimeLeft / 60);
            const seconds = pomodoroTimeLeft % 60;
            document.getElementById('timerDisplay').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function stopPomodoro() {
            if (pomodoroInterval) {
                clearInterval(pomodoroInterval);
                pomodoroInterval = null;
                const elapsed = 25 * 60 - pomodoroTimeLeft;
                if (elapsed >= 60) {
                    const records = JSON.parse(localStorage.getItem('vitaflow_pomodoro') || '[]');
                    records.unshift({ date: new Date().toISOString(), duration: Math.floor(elapsed / 60) });
                    localStorage.setItem('vitaflow_pomodoro', JSON.stringify(records));
                    alert('⏹ 已记录 ' + Math.floor(elapsed / 60) + ' 分钟专注');
                    renderPomodoroGrid();
                }
            }
            document.getElementById('pomodoroTimer').style.display = 'none';
            document.getElementById('startPomodoroBtn').style.display = 'inline-block';
            document.getElementById('stopPomodoroBtn').style.display = 'none';
        }

        function completePomodoro() {
            const records = JSON.parse(localStorage.getItem('vitaflow_pomodoro') || '[]');
            records.unshift({ date: new Date().toISOString(), duration: 25 });
            localStorage.setItem('vitaflow_pomodoro', JSON.stringify(records));
            alert('🎉 专注完成！休息5分钟吧');
            document.getElementById('pomodoroTimer').style.display = 'none';
            document.getElementById('startPomodoroBtn').style.display = 'inline-block';
            document.getElementById('stopPomodoroBtn').style.display = 'none';
            renderPomodoroGrid();
        }

        let breathInterval = null;
        let breathCount = 0;

        function startBreathing() {
            if (breathInterval) {
                clearInterval(breathInterval);
                breathInterval = null;
                document.getElementById('breathInstruction').textContent = '准备开始...';
                document.getElementById('breathCount').textContent = '0';
                document.getElementById('breathCircle').style.transform = 'scale(1)';
                return;
            }

            breathCount = 0;
            let phase = 'inhale';
            let phaseTime = 0;

            breathInterval = setInterval(() => {
                const circle = document.getElementById('breathCircle');

                if (phase === 'inhale') {
                    const progress = phaseTime / 3000;
                    circle.style.transform = `scale(${0.6 + progress * 0.8})`;
                    document.getElementById('breathInstruction').textContent = '吸气...';
                    phaseTime += 100;
                    if (phaseTime >= 3000) {
                        phase = 'hold';
                        phaseTime = 0;
                    }
                } else if (phase === 'hold') {
                    phaseTime += 100;
                    document.getElementById('breathInstruction').textContent = '屏息...';
                    if (phaseTime >= 1000) {
                        phase = 'exhale';
                        phaseTime = 0;
                    }
                } else if (phase === 'exhale') {
                    const progress = phaseTime / 6000;
                    circle.style.transform = `scale(${1.4 - progress * 0.8})`;
                    document.getElementById('breathInstruction').textContent = '呼气...';
                    phaseTime += 100;
                    if (phaseTime >= 6000) {
                        breathCount++;
                        document.getElementById('breathCount').textContent = breathCount;
                        phase = 'inhale';
                        phaseTime = 0;

                        if (breathCount >= 10) {
                            clearInterval(breathInterval);
                            breathInterval = null;
                            alert('🎯 呼吸训练完成！');
                        }
                    }
                }
            }, 100);
        }

        let intervalInterval = null;
        let intervalTimeLeft = 25 * 60;

        function startIntervalTraining() {
            if (intervalInterval) {
                alert('⏳ 训练中，请先完成当前训练！');
                return;
            }
            intervalTimeLeft = 25 * 60;
            document.getElementById('intervalStatus').textContent = '训练中...';
            updateIntervalDisplay();

            intervalInterval = setInterval(() => {
                intervalTimeLeft--;
                updateIntervalDisplay();

                if (intervalTimeLeft <= 0) {
                    clearInterval(intervalInterval);
                    intervalInterval = null;
                    document.getElementById('intervalStatus').textContent = '训练完成！';
                    alert('🎉 间歇训练完成！休息5分钟吧');
                }
            }, 1000);
        }

        function updateIntervalDisplay() {
            const minutes = Math.floor(intervalTimeLeft / 60);
            const seconds = intervalTimeLeft % 60;
            document.getElementById('intervalTimer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function stopIntervalTraining() {
            if (intervalInterval) {
                clearInterval(intervalInterval);
                intervalInterval = null;
                document.getElementById('intervalStatus').textContent = '已停止';
            }
        }

        function saveWaterIntake() {
            const intake = parseInt(document.getElementById('waterIntake').value);
            const dateInput = document.getElementById('foodDate').value;
            const selectedDate = dateInput || formatLocalDate();

            if (!isNaN(intake) && intake > 0) {
                const records = JSON.parse(localStorage.getItem('vitaflow_water') || '[]');
                const existingRecord = records.find(r => r.date === selectedDate);
                if (existingRecord) {
                    existingRecord.amount += intake;
                } else {
                    records.unshift({ date: selectedDate, amount: intake });
                }
                localStorage.setItem('vitaflow_water', JSON.stringify(records));
                updateWaterProgress();
                document.getElementById('waterIntake').value = '';
                renderFoodHistory();
                alert('✅ 已记录');
            }
        }

        function updateWaterProgress() {
            const dateInput = document.getElementById('foodDate').value;
            const selectedDate = dateInput || formatLocalDate();
            const records = JSON.parse(localStorage.getItem('vitaflow_water') || '[]');
            const record = records.find(r => r.date === selectedDate);
            const total = record ? record.amount : 0;
            document.getElementById('waterProgress').textContent = total;
        }

        let foodChart = null;

        function addFood(type) {
            const dateInput = document.getElementById('foodDate').value;
            const selectedDate = dateInput || formatLocalDate();
            const records = JSON.parse(localStorage.getItem('vitaflow_food') || '[]');
            let record = records.find(r => r.date === selectedDate);
            if (!record) {
                record = { date: selectedDate, healthy: 0, moderate: 0, unhealthy: 0 };
                records.unshift(record);
            }
            record[type]++;
            localStorage.setItem('vitaflow_food', JSON.stringify(records));
            renderFoodChart();
            renderFoodHistory();
        }

        function renderFoodHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_food') || '[]');
            const waterRecords = JSON.parse(localStorage.getItem('vitaflow_water') || '[]');
            const list = document.getElementById('foodHistoryList');

            if (records.length === 0 && waterRecords.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a;">暂无记录</div>';
                return;
            }

            const allDates = [...new Set([...records.map(r => r.date), ...waterRecords.map(r => r.date)])];
            allDates.sort((a, b) => new Date(b) - new Date(a));

            let html = '';
            allDates.slice(0, 10).forEach(date => {
                const foodRecord = records.find(r => r.date === date);
                const waterRecord = waterRecords.find(r => r.date === date);
                const foodIcons = [];
                if (foodRecord) {
                    if (foodRecord.healthy > 0) foodIcons.push(`🥗${foodRecord.healthy}`);
                    if (foodRecord.moderate > 0) foodIcons.push(`🍕${foodRecord.moderate}`);
                    if (foodRecord.unhealthy > 0) foodIcons.push(`🍟${foodRecord.unhealthy}`);
                }
                html += `
                    <div onclick="showFoodDetail(${inlineHandlerArg(date)})" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.5); border-radius: 8px; margin-bottom: 6px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(139,92,246,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.5)'">
                        <span style="color: #6a4a7a; font-weight: 500;">${escapeHtml(date)}</span>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            ${foodIcons.length > 0 ? `<span>${foodIcons.join(' ')}</span>` : ''}
                            ${waterRecord ? `<span style="color: #3b82f6; font-weight: 600;">💧${escapeHtml(waterRecord.amount)}ml</span>` : ''}
                            <span style="color: #8b7a7a;">▶</span>
                        </div>
                    </div>
                `;
            });
            list.innerHTML = html;
            renderPhysicalBoards();
        }

        function renderPhysicalBoards() {
            const waterRecords = JSON.parse(localStorage.getItem('vitaflow_water') || '[]');
            const foodRecords = JSON.parse(localStorage.getItem('vitaflow_food') || '[]');

            waterRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
            foodRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

            let waterHtml = '';
            if (waterRecords.length === 0) {
                waterHtml = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无饮水记录</div>';
            } else {
                waterRecords.forEach(record => {
                    const amount = Math.max(0, Number(record.amount) || 0);
                    const percent = Math.max(0, Math.round(amount / 1800 * 100));
                    waterHtml += `
                        <div style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(59,130,246,0.2);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(59,130,246,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${escapeHtml(record.date)}</span>
                                <button onclick="editWaterRecord(${inlineHandlerArg(record.date)})" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="text-align: center; margin-bottom: 10px;">
                                <div style="font-size: 2rem; font-weight: 700; color: #3b82f6;">💧 ${amount}<span style="font-size: 1rem;">ml</span></div>
                                <div style="font-size: 0.85rem; color: #8b7a7a;">目标: 1800ml</div>
                            </div>
                            <div style="background: #e5e7eb; border-radius: 6px; height: 8px; margin-bottom: 6px;">
                                <div style="background: linear-gradient(90deg, #3b82f6, #8b5cf6); height: 8px; border-radius: 6px; width: ${Math.min(100, percent)}%;"></div>
                            </div>
                            <div style="text-align: center; font-size: 0.85rem; color: ${percent >= 100 ? '#22c55e' : '#8b7a7a'};">完成度: ${percent}%${percent >= 100 ? ' ✅' : ''}</div>
                        </div>
                    `;
                });
            }
            document.getElementById('physicalWaterBoard').innerHTML = waterHtml;

            let foodHtml = '';
            if (foodRecords.length === 0) {
                foodHtml = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无饮食记录</div>';
            } else {
                foodRecords.forEach(record => {
                    foodHtml += `
                        <div style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(74,222,128,0.2);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(74,222,128,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${escapeHtml(record.date)}</span>
                                <button onclick="editFoodRecord(${inlineHandlerArg(record.date)})" style="background: linear-gradient(135deg, #4ade80, #22c55e); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                                <div style="text-align: center; padding: 12px; background: rgba(74,222,128,0.1); border-radius: 8px;">
                                    <div style="font-size: 1.5rem;">🥗</div>
                                    <div style="font-size: 1.2rem; font-weight: 700; color: #22c55e;">${escapeHtml(record.healthy)}</div>
                                    <div style="font-size: 0.75rem; color: #8b7a7a;">健康</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: rgba(251,191,36,0.1); border-radius: 8px;">
                                    <div style="font-size: 1.5rem;">🍕</div>
                                    <div style="font-size: 1.2rem; font-weight: 700; color: #fbbf24;">${escapeHtml(record.moderate)}</div>
                                    <div style="font-size: 0.75rem; color: #8b7a7a;">中等</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: rgba(248,113,113,0.1); border-radius: 8px;">
                                    <div style="font-size: 1.5rem;">🍟</div>
                                    <div style="font-size: 1.2rem; font-weight: 700; color: #ef4444;">${escapeHtml(record.unhealthy)}</div>
                                    <div style="font-size: 0.75rem; color: #8b7a7a;">不健康</div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            document.getElementById('physicalFoodBoard').innerHTML = foodHtml;
        }

        function editWaterRecord(date) {
            const waterRecords = JSON.parse(localStorage.getItem('vitaflow_water') || '[]');
            const record = waterRecords.find(r => r.date === date);
            if (record) {
                const newAmount = prompt('💧 饮水量 (ml):', record.amount.toString());
                if (newAmount !== null) {
                    record.amount = parseInt(newAmount) || 0;
                    localStorage.setItem('vitaflow_water', JSON.stringify(waterRecords));
                    alert('✅ 已更新');
                    renderPhysicalBoards();
                }
            }
        }

        function editFoodRecord(date) {
            const records = JSON.parse(localStorage.getItem('vitaflow_food') || '[]');
            const record = records.find(r => r.date === date);
            if (record) {
                const newHealthy = prompt('🥗 健康次数:', record.healthy.toString());
                if (newHealthy !== null) {
                    const newModerate = prompt('🍕 中等次数:', record.moderate.toString());
                    if (newModerate !== null) {
                        const newUnhealthy = prompt('🍟 不健康次数:', record.unhealthy.toString());
                        if (newUnhealthy !== null) {
                            record.healthy = parseInt(newHealthy) || 0;
                            record.moderate = parseInt(newModerate) || 0;
                            record.unhealthy = parseInt(newUnhealthy) || 0;
                            localStorage.setItem('vitaflow_food', JSON.stringify(records));
                            alert('✅ 已更新');
                            renderPhysicalBoards();
                        }
                    }
                }
            }
        }

        function showFoodDetail(date) {
            const records = JSON.parse(localStorage.getItem('vitaflow_food') || '[]');
            const waterRecords = JSON.parse(localStorage.getItem('vitaflow_water') || '[]');
            const foodRecord = records.find(r => r.date === date);
            const waterRecord = waterRecords.find(r => r.date === date);

            const newWater = prompt('💧 饮水量 (ml):', waterRecord ? waterRecord.amount.toString() : '0');
            if (newWater !== null) {
                const newHealthy = prompt('🥗 健康次数:', foodRecord ? foodRecord.healthy.toString() : '0');
                if (newHealthy !== null) {
                    const newModerate = prompt('🍕 中等次数:', foodRecord ? foodRecord.moderate.toString() : '0');
                    if (newModerate !== null) {
                        const newUnhealthy = prompt('🍟 不健康次数:', foodRecord ? foodRecord.unhealthy.toString() : '0');
                        if (newUnhealthy !== null) {
                            const waterIdx = waterRecords.findIndex(r => r.date === date);
                            if (waterIdx >= 0) {
                                waterRecords[waterIdx].amount = parseInt(newWater) || 0;
                            } else if (parseInt(newWater) > 0) {
                                waterRecords.push({ date, amount: parseInt(newWater) || 0 });
                            }
                            localStorage.setItem('vitaflow_water', JSON.stringify(waterRecords));

                            const foodIdx = records.findIndex(r => r.date === date);
                            if (foodIdx >= 0) {
                                records[foodIdx] = { date, healthy: parseInt(newHealthy) || 0, moderate: parseInt(newModerate) || 0, unhealthy: parseInt(newUnhealthy) || 0 };
                            } else {
                                records.push({ date, healthy: parseInt(newHealthy) || 0, moderate: parseInt(newModerate) || 0, unhealthy: parseInt(newUnhealthy) || 0 });
                            }
                            localStorage.setItem('vitaflow_food', JSON.stringify(records));

                            alert('✅ 已更新');
                            renderFoodHistory();
                            renderFoodChart();
                        }
                    }
                }
            }
        }

        function renderEmotionalBoards() {
            renderEmotionalSandwichBoard();
            renderEmotionalSupportBoard();
            renderEmotionalActivityBoard();
        }

        function renderEmotionalSandwichBoard() {
            const records = JSON.parse(localStorage.getItem('vitaflow_sandwich') || '[]');
            let html = '';
            if (records.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无记录</div>';
            } else {
                records.forEach(record => {
                    const date = new Date(record.date);
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                    html += `
                        <div style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(196,103,156,0.2);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(196,103,156,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${dateStr}</span>
                                <button onclick="editSandwichRecord(${inlineHandlerArg(record.id)})" style="background: linear-gradient(135deg, #c4679c, #9c5a8e); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <div style="font-size: 0.9rem; font-weight: 600; color: #22c55e; margin-bottom: 6px;">✅ 真诚肯定</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(34,197,94,0.05); padding: 10px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(record.positive) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <div style="font-size: 0.9rem; font-weight: 600; color: #8b5cf6; margin-bottom: 6px;">💡 建设性建议</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(139,92,246,0.05); padding: 10px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(record.suggestion) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.9rem; font-weight: 600; color: #ec4899; margin-bottom: 6px;">🌟 鼓励支持</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(236,72,153,0.05); padding: 10px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(record.encourage) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                        </div>
                    `;
                });
            }
            document.getElementById('emotionalSandwichBoard').innerHTML = html;
        }

        function editSandwichRecord(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_sandwich') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newPositive = prompt('✅ 真诚肯定:', record.positive);
                if (newPositive !== null) {
                    const newSuggestion = prompt('💡 建设性建议:', record.suggestion);
                    if (newSuggestion !== null) {
                        const newEncourage = prompt('🌟 鼓励支持:', record.encourage);
                        if (newEncourage !== null) {
                            record.positive = newPositive;
                            record.suggestion = newSuggestion;
                            record.encourage = newEncourage;
                            localStorage.setItem('vitaflow_sandwich', JSON.stringify(records));
                            alert('✅ 已更新');
                            renderEmotionalSandwichBoard();
                        }
                    }
                }
            }
        }

        function renderEmotionalSupportBoard() {
            const records = JSON.parse(localStorage.getItem('vitaflow_support') || '[]');
            const typeIcons = { family: '👨‍👩‍👧', friend: '👫', love: '💕', work: '💼' };
            const typeNames = { family: '亲情', friend: '友情', love: '爱情', work: '工作' };
            let html = '';
            if (records.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无联系人</div>';
            } else {
                records.forEach(record => {
                    const intimacy = Math.max(0, Math.min(10, Number.parseInt(record.intimacy, 10) || 0));
                    const intimacyStars = '★'.repeat(intimacy) + '☆'.repeat(10 - intimacy);
                    html += `
                        <div style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(167,139,250,0.2);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(167,139,250,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a; font-size: 1rem;">${typeIcons[record.type] || '👤'} ${escapeHtml(record.name)}</span>
                                <button onclick="editSupportRecord(${inlineHandlerArg(record.id)})" style="background: linear-gradient(135deg, #a78bfa, #8b5cf6); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 6px;">📋 关系类型: <span style="color: #6a4a7a; font-weight: 500;">${typeNames[record.type] || '未知'}</span></div>
                                <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 6px;">⭐ 亲密度: <span style="color: #a78bfa; font-weight: 600;">${intimacyStars}</span> (${intimacy}/10)</div>
                            </div>
                            <div>
                                <div style="font-size: 0.9rem; font-weight: 600; color: #8b5cf6; margin-bottom: 6px;">📝 备注</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(139,92,246,0.05); padding: 10px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(record.note) || '<span style="color:#999">暂无备注</span>'}</div>
                            </div>
                        </div>
                    `;
                });
            }
            document.getElementById('emotionalSupportBoard').innerHTML = html;
        }

        function editSupportRecord(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_support') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newName = prompt('👤 联系人姓名:', record.name);
                if (newName !== null) {
                    const newType = prompt('📋 类型 (family/friend/love/work):', record.type);
                    if (newType !== null) {
                        const newIntimacy = prompt('⭐ 亲密度 (1-10):', record.intimacy.toString());
                        if (newIntimacy !== null) {
                            const newNote = prompt('📝 备注:', record.note || '');
                            if (newNote !== null) {
                                record.name = newName;
                                record.type = newType;
                                record.intimacy = parseInt(newIntimacy) || 5;
                                record.note = newNote;
                                localStorage.setItem('vitaflow_support', JSON.stringify(records));
                                alert('✅ 已更新');
                                renderEmotionalSupportBoard();
                            }
                        }
                    }
                }
            }
        }

        function renderEmotionalActivityBoard() {
            const records = JSON.parse(localStorage.getItem('vitaflow_emotion_activities') || '[]');
            const activityNames = { sing: '唱歌', dance: '跳舞', garden: '园艺', read: '读书', park: '逛公园', museum: '博物馆', music: '听音乐', meditate: '冥想' };
            let html = '';
            if (records.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无活动记录</div>';
            } else {
                records.forEach(record => {
                    const date = new Date(record.date);
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                    html += `
                        <div onclick="showActivityFullDetail(${inlineHandlerArg(record.id)})" style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(236,72,153,0.2); cursor: pointer;" onmouseover="this.style.background='rgba(236,72,153,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${dateStr}</span>
                                <span style="font-size: 2rem;">${escapeHtml(record.icon)}</span>
                            </div>
                            <div style="font-size: 1rem; font-weight: 600; color: #ec4899;">${activityNames[record.type] || escapeHtml(record.type)}</div>
                        </div>
                    `;
                });
            }
            document.getElementById('emotionalActivityBoard').innerHTML = html;
        }

        function showActivityFullDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_emotion_activities') || '[]');
            const record = records.find(r => r.id === id);
            if (!record) return;
            const date = new Date(record.date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
            const activityNames = { sing: '唱歌', dance: '跳舞', garden: '园艺', read: '读书', park: '逛公园', museum: '博物馆', music: '听音乐', meditate: '冥想' };

            const popup = document.createElement('div');
            popup.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 1000; max-width: 400px; width: 90%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.2rem; color: #6a4a7a;">📅 ${dateStr}</div>
                        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="text-align: center; padding: 24px; background: rgba(236,72,153,0.1); border-radius: 16px; margin-bottom: 20px;">
                        <div style="font-size: 4rem; margin-bottom: 12px;">${escapeHtml(record.icon)}</div>
                        <div style="font-size: 1.3rem; font-weight: 600; color: #ec4899;">${activityNames[record.type] || escapeHtml(record.type)}</div>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200,160,200,0.2);" onclick="this.parentElement.parentElement.remove()">关闭</button>
                    </div>
                </div>
            `;
            document.body.appendChild(popup);
        }

        function renderFoodChart() {
            const records = JSON.parse(localStorage.getItem('vitaflow_food') || '[]');
            const dateInput = document.getElementById('foodDate')?.value;
            const selectedDate = dateInput || formatLocalDate();
            const record = records.find(r => r.date === selectedDate) || { healthy: 1, moderate: 1, unhealthy: 0 };

            const ctx = document.getElementById('foodChart').getContext('2d');
            if (foodChart) foodChart.destroy();

            foodChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['健康', '中等', '不健康'],
                    datasets: [{
                        data: [record.healthy, record.moderate, record.unhealthy],
                        backgroundColor: ['#4ade80', '#fbbf24', '#f87171']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%'
                }
            });
        }

        function saveSandwich() {
            const positive = document.getElementById('sandwichPositive').value;
            const suggestion = document.getElementById('sandwichSuggestion').value;
            const encourage = document.getElementById('sandwichEncourage').value;

            if (positive && suggestion && encourage) {
                const records = JSON.parse(localStorage.getItem('vitaflow_sandwich') || '[]');
                records.unshift({
                    id: Date.now(),
                    positive,
                    suggestion,
                    encourage,
                    date: new Date().toISOString()
                });
                localStorage.setItem('vitaflow_sandwich', JSON.stringify(records));
                alert('✅ 三明治批评模板已保存');
                document.getElementById('sandwichPositive').value = '';
                document.getElementById('sandwichSuggestion').value = '';
                document.getElementById('sandwichEncourage').value = '';
                renderSandwichHistory();
            } else {
                alert('请填写完整的三个部分');
            }
        }

        function renderSandwichHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_sandwich') || '[]');
            const list = document.getElementById('sandwichHistoryList');

            if (records.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a; font-size: 0.85rem;">暂无记录</div>';
                return;
            }

            let html = '';
            records.slice(0, 8).forEach(record => {
                const date = new Date(record.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                html += `
                    <div onclick="showSandwichDetail(${inlineHandlerArg(record.id)})" style="padding: 8px; background: rgba(255,255,255,0.5); border-radius: 6px; margin-bottom: 4px; cursor: pointer;" onmouseover="this.style.background='rgba(196,103,156,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.5)'">
                        <div style="font-size: 0.8rem; color: #8b7a7a;">${dateStr}</div>
                        <div style="font-size: 0.85rem; color: #6a4a7a; margin-top: 4px;">"${escapeHtml(record.positive.slice(0, 15))}..."</div>
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        function showSandwichDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_sandwich') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newPositive = prompt('✅ 真诚肯定:', record.positive);
                if (newPositive !== null) {
                    const newSuggestion = prompt('💡 建设性建议:', record.suggestion);
                    if (newSuggestion !== null) {
                        const newEncourage = prompt('🌟 鼓励支持:', record.encourage);
                        if (newEncourage !== null) {
                            record.positive = newPositive;
                            record.suggestion = newSuggestion;
                            record.encourage = newEncourage;
                            localStorage.setItem('vitaflow_sandwich', JSON.stringify(records));
                            alert('✅ 已更新');
                            renderSandwichHistory();
                        }
                    }
                }
            }
        }

        function saveSupport() {
            const name = document.getElementById('supportName').value;
            const type = document.getElementById('supportType').value;
            const intimacy = document.getElementById('supportIntimacy').value;
            const note = document.getElementById('supportNote').value;

            if (name) {
                const records = JSON.parse(localStorage.getItem('vitaflow_support') || '[]');
                records.push({
                    id: Date.now(),
                    name,
                    type,
                    intimacy: parseInt(intimacy),
                    note,
                    lastContact: new Date().toISOString()
                });
                localStorage.setItem('vitaflow_support', JSON.stringify(records));
                alert('✅ 联系人已添加');
                document.getElementById('supportName').value = '';
                document.getElementById('supportNote').value = '';
                document.getElementById('supportIntimacy').value = 5;
                document.getElementById('intimacyValue').textContent = 5;
                renderSupportHistory();
            } else {
                alert('请输入联系人姓名');
            }
        }

        function renderSupportHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_support') || '[]');
            const list = document.getElementById('supportHistoryList');
            const typeIcons = { family: '👨‍👩‍👧', friend: '👫', love: '💕', work: '💼' };

            if (records.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a; font-size: 0.85rem;">暂无联系人</div>';
                return;
            }

            let html = '';
            records.forEach(record => {
                const intimacy = Math.max(0, Math.min(10, Number.parseInt(record.intimacy, 10) || 0));
                const intimacyStars = '★'.repeat(intimacy) + '☆'.repeat(10 - intimacy);
                html += `
                    <div onclick="showSupportDetail(${inlineHandlerArg(record.id)})" style="padding: 8px; background: rgba(255,255,255,0.5); border-radius: 6px; margin-bottom: 4px; cursor: pointer;" onmouseover="this.style.background='rgba(167,139,250,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.5)'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.9rem; color: #6a4a7a;">${typeIcons[record.type] || '👤'} ${escapeHtml(record.name)}</span>
                            <span style="font-size: 0.75rem; color: #a78bfa;">${intimacyStars.slice(0, 5)}</span>
                        </div>
                        ${record.note ? `<div style="font-size: 0.75rem; color: #8b7a7a; margin-top: 2px;">📝 ${escapeHtml(record.note.slice(0, 20))}...</div>` : ''}
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        function showSupportDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_support') || '[]');
            const record = records.find(r => r.id === id);
            const typeNames = { family: '👨‍👩‍👧 亲情', friend: '👫 友情', love: '💕 爱情', work: '💼 工作' };
            if (record) {
                const newName = prompt('👤 联系人姓名:', record.name);
                if (newName !== null) {
                    const newType = prompt('📋 类型 (family/friend/love/work):', record.type);
                    if (newType !== null) {
                        const newIntimacy = prompt('⭐ 亲密度 (1-10):', record.intimacy.toString());
                        if (newIntimacy !== null) {
                            const newNote = prompt('📝 备注:', record.note || '');
                            if (newNote !== null) {
                                record.name = newName;
                                record.type = newType;
                                record.intimacy = parseInt(newIntimacy) || 5;
                                record.note = newNote;
                                localStorage.setItem('vitaflow_support', JSON.stringify(records));
                                alert('✅ 已更新');
                                renderSupportHistory();
                            }
                        }
                    }
                }
            }
        }

        const activityIcons = {
            sing: '🎤', dance: '💃', garden: '🌱', read: '📚',
            park: '🌳', museum: '🏛️', music: '🎵', meditate: '🧘'
        };

        function recordActivity(type) {
            const records = JSON.parse(localStorage.getItem('vitaflow_emotion_activities') || '[]');
            records.unshift({
                id: Date.now(),
                type,
                icon: activityIcons[type],
                date: new Date().toISOString()
            });
            localStorage.setItem('vitaflow_emotion_activities', JSON.stringify(records));
            renderActivityHistory();
            alert(`✅ ${activityIcons[type]} 活动已记录`);
        }

        function renderActivityHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_emotion_activities') || '[]');
            const list = document.getElementById('activityHistoryList');

            if (records.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a;">暂无活动记录</div>';
                return;
            }

            let html = '';
            records.slice(0, 10).forEach(record => {
                const date = new Date(record.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: rgba(255,255,255,0.5); border-radius: 6px; margin-bottom: 3px;">
                        <span>${escapeHtml(record.icon)} ${escapeHtml(record.type)}</span>
                        <span style="font-size: 0.8rem; color: #8b7a7a;">${dateStr}</span>
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        let switchInterval = null;
        let switchTimeLeft = 90 * 60;

        function startSwitchTimer() {
            if (switchInterval) {
                alert('⏳ 计时中，请先停止当前计时！');
                return;
            }
            switchTimeLeft = 90 * 60;
            document.getElementById('switchStatus').textContent = '工作中...';
            updateSwitchDisplay();

            switchInterval = setInterval(() => {
                switchTimeLeft--;
                updateSwitchDisplay();

                if (switchTimeLeft <= 0) {
                    clearInterval(switchInterval);
                    switchInterval = null;
                    document.getElementById('switchStatus').textContent = '该休息了！';
                    alert('⏰ 建议切换活动！试试做些不同的事情');
                }
            }, 1000);
        }

        function updateSwitchDisplay() {
            const minutes = Math.floor(switchTimeLeft / 60);
            const seconds = switchTimeLeft % 60;
            document.getElementById('switchTimer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function stopSwitchTimer() {
            if (switchInterval) {
                clearInterval(switchInterval);
                switchInterval = null;
                document.getElementById('switchStatus').textContent = '已停止';
            }
        }

        function toggleFocusLock() {
            const icon = document.getElementById('focusLockIcon');
            const status = document.getElementById('focusLockStatus');

            if (icon.textContent === '🔓') {
                icon.textContent = '🔐';
                status.textContent = '已锁定';
                alert('🔐 专注锁定已开启！请专注当前任务，远离手机');
            } else {
                icon.textContent = '🔓';
                status.textContent = '未锁定';
                alert('🔓 专注锁定已解除');
            }
        }

        function saveReflection() {
            const challenge = document.getElementById('reflectionChallenge').value;
            const gain = document.getElementById('reflectionGain').value;
            const weak = document.getElementById('reflectionWeak').value;
            const tomorrow = document.getElementById('reflectionTomorrow').value;

            if (challenge || gain || weak || tomorrow) {
                const records = JSON.parse(localStorage.getItem('vitaflow_reflection') || '[]');
                records.unshift({
                    id: Date.now(),
                    challenge,
                    gain,
                    weak,
                    tomorrow,
                    date: new Date().toISOString()
                });
                localStorage.setItem('vitaflow_reflection', JSON.stringify(records));
                alert('✅ 反思已保存');
                document.getElementById('reflectionChallenge').value = '';
                document.getElementById('reflectionGain').value = '';
                document.getElementById('reflectionWeak').value = '';
                document.getElementById('reflectionTomorrow').value = '';
                renderReflectionHistory();
            } else {
                alert('请至少填写一项内容');
            }
        }

        function renderReflectionHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_reflection') || '[]');
            const list = document.getElementById('reflectionHistoryList');

            if (records.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a;">暂无反思记录</div>';
                return;
            }

            let html = '';
            records.slice(0, 5).forEach(record => {
                const date = new Date(record.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                html += `
                    <div onclick="showReflectionDetail(${inlineHandlerArg(record.id)})" style="padding: 10px; background: rgba(255,255,255,0.5); border-radius: 8px; margin-bottom: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(139,92,246,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.5)'">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="font-size: 0.85rem; color: #6a4a7a; font-weight: 500;">${dateStr}</span>
                            <span style="color: #8b7a7a;">▶</span>
                        </div>
                        ${record.challenge ? `<div style="font-size: 0.85rem;">🎯 ${escapeHtml(record.challenge.slice(0, 25))}...</div>` : ''}
                        ${record.gain ? `<div style="font-size: 0.8rem; color: #8b7a7a;">💡 ${escapeHtml(record.gain.slice(0, 20))}...</div>` : ''}
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        function showReflectionDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_reflection') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newChallenge = prompt('🎯 今日挑战:', record.challenge || '');
                if (newChallenge !== null) {
                    const newGain = prompt('💡 今日收获:', record.gain || '');
                    if (newGain !== null) {
                        const newWeak = prompt('❌ 今日不足:', record.weak || '');
                        if (newWeak !== null) {
                            const newTomorrow = prompt('📝 明日计划:', record.tomorrow || '');
                            if (newTomorrow !== null) {
                                record.challenge = newChallenge;
                                record.gain = newGain;
                                record.weak = newWeak;
                                record.tomorrow = newTomorrow;
                                localStorage.setItem('vitaflow_reflection', JSON.stringify(records));
                                alert('✅ 已更新');
                                renderReflectionHistory();
                                renderFocusReflectionBoard();
                            }
                        }
                    }
                }
            }
        }

        function renderFocusReflectionBoard() {
            const records = JSON.parse(localStorage.getItem('vitaflow_reflection') || '[]');
            let html = '';
            if (records.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无反思记录</div>';
            } else {
                records.forEach(record => {
                    const date = new Date(record.date);
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                    html += `
                        <div style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(139,94,158,0.2);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(139,94,158,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${dateStr}</span>
                                <button onclick="showReflectionDetail(${inlineHandlerArg(record.id)})" style="background: linear-gradient(135deg, #8b5e9e, #6a4a7a); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="margin-bottom: 8px;">
                                <div style="font-size: 0.9rem; font-weight: 600; color: #8b5e9e; margin-bottom: 4px;">🎯 今日挑战</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(139,94,158,0.05); padding: 8px; border-radius: 6px;">${escapeHtml(record.challenge) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                            <div style="margin-bottom: 8px;">
                                <div style="font-size: 0.9rem; font-weight: 600; color: #22c55e; margin-bottom: 4px;">💡 今日收获</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(34,197,94,0.05); padding: 8px; border-radius: 6px;">${escapeHtml(record.gain) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                            <div style="margin-bottom: 8px;">
                                <div style="font-size: 0.9rem; font-weight: 600; color: #ef4444; margin-bottom: 4px;">❌ 今日不足</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(239,68,68,0.05); padding: 8px; border-radius: 6px;">${escapeHtml(record.weak) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.9rem; font-weight: 600; color: #3b82f6; margin-bottom: 4px;">📝 明日计划</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(59,130,246,0.05); padding: 8px; border-radius: 6px;">${escapeHtml(record.tomorrow) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                        </div>
                    `;
                });
            }
            document.getElementById('focusReflectionBoard').innerHTML = html;
        }
        function updateMeaningScore(input) {
            if (input) input.dataset.selected = 'true';
            const inputs = [1, 2, 3].map(index => document.getElementById('meaningQ' + index));
            const selected = inputs.map(element => element.dataset.selected === 'true');
            inputs.forEach((element, index) => {
                document.getElementById('meaningQ' + (index + 1) + 'Value').textContent = selected[index] ? element.value : '未选择';
            });
            if (!selected.every(Boolean)) {
                document.getElementById('meaningTotalScore').textContent = '待评估';
                document.getElementById('meaningInterpretation').textContent = '请选择三项后查看结果';
                return;
            }

            const q1 = parseInt(document.getElementById('meaningQ1').value);
            const q2 = parseInt(document.getElementById('meaningQ2').value);
            const q3 = parseInt(document.getElementById('meaningQ3').value);

            const total = q1 + q2 + q3;
            document.getElementById('meaningTotalScore').textContent = total;

            let interpretation = '';
            if (total >= 27) interpretation = '🎯 强目标感';
            else if (total >= 21) interpretation = '✨ 目标感良好';
            else if (total >= 15) interpretation = '⚡ 目标感一般';
            else interpretation = '💫 需要探索意义';

            document.getElementById('meaningInterpretation').textContent = interpretation;
        }

        function saveMeaningQuiz() {
            const inputs = [1, 2, 3].map(index => document.getElementById('meaningQ' + index));
            if (inputs.some(input => input.dataset.selected !== 'true')) {
                alert('请先选择三项评分，再保存评估。');
                return;
            }
            const q1 = parseInt(document.getElementById('meaningQ1').value);
            const q2 = parseInt(document.getElementById('meaningQ2').value);
            const q3 = parseInt(document.getElementById('meaningQ3').value);
            const total = q1 + q2 + q3;

            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            records.unshift({
                id: Date.now(),
                q1, q2, q3, total,
                date: new Date().toISOString()
            });
            localStorage.setItem('vitaflow_meaning_quiz', JSON.stringify(records));
            alert('✅ 人生意义评估已保存');
            renderMeaningQuizHistory();
            renderMeaningQuizChart();
        }

        function renderMeaningQuizHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            const list = document.getElementById('meaningQuizHistoryList');

            if (records.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a; font-size: 0.85rem;">暂无评估记录</div>';
                return;
            }

            let html = '';
            records.slice(0, 5).forEach(record => {
                const date = new Date(record.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                html += `
                    <div onclick="showMeaningQuizDetail(${inlineHandlerArg(record.id)})" style="padding: 6px; background: rgba(255,255,255,0.5); border-radius: 6px; margin-bottom: 4px; cursor: pointer;" onmouseover="this.style.background='rgba(167,139,250,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.5)'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.8rem; color: #6a4a7a;">${dateStr}</span>
                            <span style="font-size: 0.9rem; font-weight: 600; color: #a78bfa;">${escapeHtml(record.total)}分</span>
                        </div>
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        let meaningQuizChart = null;
        let meaningQuizHistoryChart = null;

        function renderMeaningQuizChart() {
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            const ctx = document.getElementById('meaningQuizChart');
            if (!ctx) return;

            const sortedRecords = [...records].slice(0, 10).reverse();
            if (sortedRecords.length === 0) return;

            const labels = sortedRecords.map(r => {
                const date = new Date(r.date);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            });
            const data = sortedRecords.map(r => r.total);

            if (meaningQuizChart) meaningQuizChart.destroy();

            meaningQuizChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: '目标感',
                        data,
                        borderColor: '#a78bfa',
                        backgroundColor: 'rgba(167, 139, 250, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#a78bfa'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { min: 0, max: 30, ticks: { stepSize: 10 } },
                        x: { ticks: { font: { size: 10 } } }
                    }
                }
            });
        }

        function renderMeaningQuizHistoryChart() {
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            const ctx = document.getElementById('meaningQuizHistoryChart');
            if (!ctx) return;

            const sortedRecords = [...records].slice(0, 15).reverse();
            if (sortedRecords.length === 0) return;

            const labels = sortedRecords.map(r => {
                const date = new Date(r.date);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            });
            const data = sortedRecords.map(r => r.total);

            if (meaningQuizHistoryChart) meaningQuizHistoryChart.destroy();

            meaningQuizHistoryChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: '目标感',
                        data,
                        borderColor: '#a78bfa',
                        backgroundColor: 'rgba(167, 139, 250, 0.1)',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 6,
                        pointBackgroundColor: '#a78bfa',
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { min: 0, max: 30, ticks: { stepSize: 5, color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } },
                        x: { ticks: { font: { size: 10 }, color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } }
                    }
                }
            });
        }

        function showMeaningQuizDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newQ1 = prompt('🌅 起床兴奋度 (1-10):', record.q1.toString());
                if (newQ1 !== null) {
                    const newQ2 = prompt('💫 享受过程 (1-10):', record.q2.toString());
                    if (newQ2 !== null) {
                        const newQ3 = prompt('🎯 价值责任感 (1-10):', record.q3.toString());
                        if (newQ3 !== null) {
                            record.q1 = parseInt(newQ1) || 1;
                            record.q2 = parseInt(newQ2) || 1;
                            record.q3 = parseInt(newQ3) || 1;
                            record.total = record.q1 + record.q2 + record.q3;
                            localStorage.setItem('vitaflow_meaning_quiz', JSON.stringify(records));
                            alert('✅ 已更新');
                            renderMeaningQuizHistory();
                            renderMeaningQuizChart();
                        }
                    }
                }
            }
        }

        function saveValues() {
            const deathbed = document.getElementById('valueDeathbed').value;
            const admire = document.getElementById('valueAdmire').value;

            if (deathbed || admire) {
                const records = JSON.parse(localStorage.getItem('vitaflow_values') || '[]');
                records.unshift({
                    id: Date.now(),
                    deathbed,
                    admire,
                    date: new Date().toISOString()
                });
                localStorage.setItem('vitaflow_values', JSON.stringify(records));
                alert('✅ 价值观已保存');
                document.getElementById('valueDeathbed').value = '';
                document.getElementById('valueAdmire').value = '';
                renderValuesHistory();
            } else {
                alert('请至少填写一项内容');
            }
        }

        function renderValuesHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_values') || '[]');
            const list = document.getElementById('valuesHistoryList');

            if (records.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a; font-size: 0.85rem;">暂无价值观记录</div>';
                return;
            }

            let html = '';
            records.slice(0, 5).forEach(record => {
                const date = new Date(record.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                html += `
                    <div onclick="showValueDetail(${inlineHandlerArg(record.id)})" style="padding: 8px; background: rgba(255,255,255,0.5); border-radius: 6px; margin-bottom: 4px; cursor: pointer;" onmouseover="this.style.background='rgba(232,138,76,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.5)'">
                        <div style="font-size: 0.8rem; color: #8b7a7a;">${dateStr}</div>
                        <div style="font-size: 0.8rem; color: #6a4a7a; margin-top: 2px;">💭 ${escapeHtml((record.deathbed || '').slice(0, 20))}...</div>
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        function showValueDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_values') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newDeathbed = prompt('💭 临终前三件事:', record.deathbed || '');
                if (newDeathbed !== null) {
                    const newAdmire = prompt('🏆 敬重之人的品质:', record.admire || '');
                    if (newAdmire !== null) {
                        record.deathbed = newDeathbed;
                        record.admire = newAdmire;
                        localStorage.setItem('vitaflow_values', JSON.stringify(records));
                        alert('✅ 已更新');
                        renderValuesHistory();
                        renderMeaningBoards();
                    }
                }
            }
        }

        function renderMeaningBoards() {
            renderMeaningQuizBoard();
            renderMeaningValuesBoard();
            renderMeaningRitualBoard();
        }

        function renderMeaningQuizBoard() {
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            let html = '';
            if (records.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无评估记录</div>';
            } else {
                records.forEach(record => {
                    const date = new Date(record.date);
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                    let interpretation = record.total >= 27 ? '🎯 强目标感' : record.total >= 21 ? '✨ 目标感良好' : record.total >= 15 ? '⚡ 目标感一般' : '💫 需要探索意义';
                    html += `
                        <div onclick="showMeaningQuizFullDetail(${inlineHandlerArg(record.id)})" style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(167,139,250,0.2); cursor: pointer;" onmouseover="this.style.background='rgba(167,139,250,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(167,139,250,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${dateStr}</span>
                                <button onclick="event.stopPropagation(); editMeaningQuizRecord(${inlineHandlerArg(record.id)})" style="background: linear-gradient(135deg, #a78bfa, #8b5cf6); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="text-align: center; margin-bottom: 12px;">
                                <div style="font-size: 2.5rem; font-weight: 700; color: #a78bfa;">${escapeHtml(record.total)}<span style="font-size: 1rem;">/30</span></div>
                                <div style="font-size: 0.9rem; color: #8b7a7a;">${interpretation}</div>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                                <div style="text-align: center; padding: 10px; background: rgba(251,191,36,0.1); border-radius: 8px;">
                                    <div style="font-size: 0.8rem; color: #8b7a7a;">🌅 起床兴奋度</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #fbbf24;">${escapeHtml(record.q1)}</div>
                                </div>
                                <div style="text-align: center; padding: 10px; background: rgba(167,139,250,0.1); border-radius: 8px;">
                                    <div style="font-size: 0.8rem; color: #8b7a7a;">💫 享受过程</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #a78bfa;">${escapeHtml(record.q2)}</div>
                                </div>
                                <div style="text-align: center; padding: 10px; background: rgba(236,72,153,0.1); border-radius: 8px;">
                                    <div style="font-size: 0.8rem; color: #8b7a7a;">🎯 价值责任</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #ec4899;">${escapeHtml(record.q3)}</div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            document.getElementById('meaningQuizBoard').innerHTML = html;
        }

        function editMeaningQuizRecord(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newQ1 = prompt('🌅 起床兴奋度 (1-10):', record.q1.toString());
                if (newQ1 !== null) {
                    const newQ2 = prompt('💫 享受过程 (1-10):', record.q2.toString());
                    if (newQ2 !== null) {
                        const newQ3 = prompt('🎯 价值责任感 (1-10):', record.q3.toString());
                        if (newQ3 !== null) {
                            record.q1 = parseInt(newQ1) || 1;
                            record.q2 = parseInt(newQ2) || 1;
                            record.q3 = parseInt(newQ3) || 1;
                            record.total = record.q1 + record.q2 + record.q3;
                            localStorage.setItem('vitaflow_meaning_quiz', JSON.stringify(records));
                            alert('✅ 已更新');
                            renderMeaningQuizBoard();
                            renderMeaningQuizChart();
                        }
                    }
                }
            }
        }

        function showMeaningQuizFullDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            const record = records.find(r => r.id === id);
            if (!record) return;
            const date = new Date(record.date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
            let interpretation = record.total >= 27 ? '🎯 强目标感' : record.total >= 21 ? '✨ 目标感良好' : record.total >= 15 ? '⚡ 目标感一般' : '💫 需要探索意义';

            const popup = document.createElement('div');
            popup.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 1000; max-width: 500px; width: 90%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.2rem; color: #6a4a7a;">📅 ${dateStr}</div>
                        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="text-align: center; margin-bottom: 16px; padding: 16px; background: rgba(167,139,250,0.1); border-radius: 16px;">
                        <div style="font-size: 3rem; font-weight: 700; color: #a78bfa;">${escapeHtml(record.total)}<span style="font-size: 1.2rem;">/30</span></div>
                        <div style="font-size: 1rem; color: #8b7a7a;">${interpretation}</div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                        <div style="text-align: center; padding: 16px; background: rgba(251,191,36,0.1); border-radius: 12px;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 8px;">🌅 起床兴奋度</div>
                            <div style="font-size: 2rem; font-weight: 700; color: #fbbf24;">${escapeHtml(record.q1)}</div>
                        </div>
                        <div style="text-align: center; padding: 16px; background: rgba(167,139,250,0.1); border-radius: 12px;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 8px;">💫 享受过程</div>
                            <div style="font-size: 2rem; font-weight: 700; color: #a78bfa;">${escapeHtml(record.q2)}</div>
                        </div>
                        <div style="text-align: center; padding: 16px; background: rgba(236,72,153,0.1); border-radius: 12px;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 8px;">🎯 价值责任</div>
                            <div style="font-size: 2rem; font-weight: 700; color: #ec4899;">${escapeHtml(record.q3)}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #a78bfa, #8b5cf6);" onclick="this.parentElement.parentElement.remove(); editMeaningQuizRecord(${inlineHandlerArg(id)})">✏️ 修改</button>
                        <button class="add-btn" style="flex: 1; background: rgba(200,160,200,0.2);" onclick="this.parentElement.parentElement.remove()">关闭</button>
                    </div>
                </div>
            `;
            document.body.appendChild(popup);
        }

        function renderMeaningValuesBoard() {
            const records = JSON.parse(localStorage.getItem('vitaflow_values') || '[]');
            let html = '';
            if (records.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无价值观记录</div>';
            } else {
                records.forEach(record => {
                    const date = new Date(record.date);
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                    html += `
                        <div onclick="showValueFullDetail(${inlineHandlerArg(record.id)})" style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(232,138,76,0.2); cursor: pointer;" onmouseover="this.style.background='rgba(232,138,76,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(232,138,76,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${dateStr}</span>
                                <button onclick="event.stopPropagation(); editValueRecord(${inlineHandlerArg(record.id)})" style="background: linear-gradient(135deg, #e88a4c, #d470a0); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <div style="font-size: 0.9rem; font-weight: 600; color: #e88a4c; margin-bottom: 6px;">💭 临终前最想做的三件事</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(232,138,76,0.05); padding: 10px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(record.deathbed) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.9rem; font-weight: 600; color: #d470a0; margin-bottom: 6px;">🏆 最敬重的人的三个品质</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(212,112,160,0.05); padding: 10px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(record.admire) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                        </div>
                    `;
                });
            }
            document.getElementById('meaningValuesBoard').innerHTML = html;
        }

        function editValueRecord(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_values') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newDeathbed = prompt('💭 临终前最想做的三件事:', record.deathbed || '');
                if (newDeathbed !== null) {
                    const newAdmire = prompt('🏆 最敬重的人的三个品质:', record.admire || '');
                    if (newAdmire !== null) {
                        record.deathbed = newDeathbed;
                        record.admire = newAdmire;
                        localStorage.setItem('vitaflow_values', JSON.stringify(records));
                        alert('✅ 已更新');
                        renderMeaningValuesBoard();
                    }
                }
            }
        }

        function showValueFullDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_values') || '[]');
            const record = records.find(r => r.id === id);
            if (!record) return;
            const date = new Date(record.date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;

            const popup = document.createElement('div');
            popup.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 1000; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.2rem; color: #6a4a7a;">📅 ${dateStr}</div>
                        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="margin-bottom: 16px; padding: 16px; background: rgba(232,138,76,0.1); border-radius: 16px;">
                        <div style="font-size: 1rem; font-weight: 600; color: #e88a4c; margin-bottom: 12px;">💭 临终前最想做的三件事</div>
                        <div style="font-size: 0.95rem; color: #4a3a5a; white-space: pre-wrap;">${escapeHtml(record.deathbed) || '<span style="color:#999">未填写</span>'}</div>
                    </div>
                    <div style="margin-bottom: 20px; padding: 16px; background: rgba(212,112,160,0.1); border-radius: 16px;">
                        <div style="font-size: 1rem; font-weight: 600; color: #d470a0; margin-bottom: 12px;">🏆 最敬重的人的三个品质</div>
                        <div style="font-size: 0.95rem; color: #4a3a5a; white-space: pre-wrap;">${escapeHtml(record.admire) || '<span style="color:#999">未填写</span>'}</div>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #e88a4c, #d470a0);" onclick="this.parentElement.parentElement.remove(); editValueRecord(${inlineHandlerArg(id)})">✏️ 修改</button>
                        <button class="add-btn" style="flex: 1; background: rgba(200,160,200,0.2);" onclick="this.parentElement.parentElement.remove()">关闭</button>
                    </div>
                </div>
            `;
            document.body.appendChild(popup);
        }

        function renderMeaningRitualBoard() {
            const records = JSON.parse(localStorage.getItem('vitaflow_rituals') || '[]');
            let html = '';
            if (records.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无仪式记录</div>';
            } else {
                records.forEach(record => {
                    html += `
                        <div onclick="showRitualFullDetail(${inlineHandlerArg(record.id)})" style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(74,222,128,0.2); cursor: pointer;" onmouseover="this.style.background='rgba(74,222,128,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(74,222,128,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${new Date(record.date).getMonth()+1}/${new Date(record.date).getDate()}</span>
                                <button onclick="event.stopPropagation(); editRitualRecord(${inlineHandlerArg(record.id)})" style="background: linear-gradient(135deg, #4ade80, #22c55e); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
                                <span style="background: rgba(74,222,128,0.2); padding: 4px 10px; border-radius: 8px; font-size: 0.8rem;">🕐 ${escapeHtml(record.time)}</span>
                                <span style="background: rgba(52,211,153,0.2); padding: 4px 10px; border-radius: 8px; font-size: 0.8rem;">📍 ${escapeHtml(record.place)}</span>
                            </div>
                            <div style="font-size: 0.9rem; font-weight: 600; color: #22c55e; margin-bottom: 6px;">✨ ${escapeHtml(record.action)}</div>
                            ${record.desc ? `<div style="font-size: 0.85rem; color: #8b7a7a;">${escapeHtml(record.desc)}</div>` : ''}
                        </div>
                    `;
                });
            }
            document.getElementById('meaningRitualBoard').innerHTML = html;
        }

        function editRitualRecord(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_rituals') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newTime = prompt('🕐 时间:', record.time);
                if (newTime !== null) {
                    const newPlace = prompt('📍 地点:', record.place);
                    if (newPlace !== null) {
                        const newAction = prompt('✨ 动作:', record.action);
                        if (newAction !== null) {
                            const newDesc = prompt('📝 仪式描述:', record.desc || '');
                            if (newDesc !== null) {
                                record.time = newTime;
                                record.place = newPlace;
                                record.action = newAction;
                                record.desc = newDesc;
                                localStorage.setItem('vitaflow_rituals', JSON.stringify(records));
                                alert('✅ 已更新');
                                renderMeaningRitualBoard();
                            }
                        }
                    }
                }
            }
        }

        function showRitualFullDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_rituals') || '[]');
            const record = records.find(r => r.id === id);
            if (!record) return;
            const date = new Date(record.date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;

            const popup = document.createElement('div');
            popup.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 1000; max-width: 500px; width: 90%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.2rem; color: #6a4a7a;">📅 ${dateStr}</div>
                        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                        <div style="padding: 16px; background: rgba(74,222,128,0.1); border-radius: 12px; text-align: center;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 8px;">🕐 时间</div>
                            <div style="font-size: 1.1rem; font-weight: 600; color: #22c55e;">${escapeHtml(record.time)}</div>
                        </div>
                        <div style="padding: 16px; background: rgba(52,211,153,0.1); border-radius: 12px; text-align: center;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 8px;">📍 地点</div>
                            <div style="font-size: 1.1rem; font-weight: 600; color: #14b8a6;">${escapeHtml(record.place)}</div>
                        </div>
                    </div>
                    <div style="margin-bottom: 16px; padding: 16px; background: rgba(74,222,128,0.1); border-radius: 16px;">
                        <div style="font-size: 1rem; font-weight: 600; color: #22c55e; margin-bottom: 12px;">✨ 动作</div>
                        <div style="font-size: 0.95rem; color: #4a3a5a;">${escapeHtml(record.action)}</div>
                    </div>
                    ${record.desc ? `
                    <div style="margin-bottom: 20px; padding: 16px; background: rgba(52,211,153,0.1); border-radius: 16px;">
                        <div style="font-size: 1rem; font-weight: 600; color: #14b8a6; margin-bottom: 12px;">📝 仪式描述</div>
                        <div style="font-size: 0.95rem; color: #4a3a5a; white-space: pre-wrap;">${escapeHtml(record.desc)}</div>
                    </div>
                    ` : ''}
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #4ade80, #22c55e);" onclick="this.parentElement.parentElement.remove(); editRitualRecord(${inlineHandlerArg(id)})">✏️ 修改</button>
                        <button class="add-btn" style="flex: 1; background: rgba(200,160,200,0.2);" onclick="this.parentElement.parentElement.remove()">关闭</button>
                    </div>
                </div>
            `;
            document.body.appendChild(popup);
        }

        function saveRitual() {
            const time = document.getElementById('ritualTime').value;
            const place = document.getElementById('ritualPlace').value;
            const action = document.getElementById('ritualAction').value;
            const desc = document.getElementById('ritualDesc').value;

            if (time && place && action) {
                const records = JSON.parse(localStorage.getItem('vitaflow_rituals') || '[]');
                records.push({
                    id: Date.now(),
                    time, place, action, desc,
                    date: new Date().toISOString()
                });
                localStorage.setItem('vitaflow_rituals', JSON.stringify(records));
                alert('✅ 仪式已创建');
                document.getElementById('ritualTime').value = '';
                document.getElementById('ritualPlace').value = '';
                document.getElementById('ritualAction').value = '';
                document.getElementById('ritualDesc').value = '';
                renderRitualList();
            } else {
                alert('请填写时间、地点和动作');
            }
        }

        function renderRitualList() {
            const records = JSON.parse(localStorage.getItem('vitaflow_rituals') || '[]');
            const list = document.getElementById('ritualList');

            if (records.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a;">暂无仪式记录</div>';
                return;
            }

            let html = '';
            records.forEach(record => {
                html += `
                    <div style="padding: 8px; background: rgba(255,255,255,0.5); border-radius: 8px; margin-bottom: 4px;">
                        <div style="font-size: 0.9rem; font-weight: 600; color: #4ade80;">🕐 ${escapeHtml(record.time)} | 📍 ${escapeHtml(record.place)} | ✨ ${escapeHtml(record.action)}</div>
                        ${record.desc ? `<div style="font-size: 0.85rem; color: #6a4a7a; margin-top: 4px;">${escapeHtml(record.desc)}</div>` : ''}
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        function renderPomodoroGrid() {
            const grid = document.getElementById('pomodoroGrid');
            const records = JSON.parse(localStorage.getItem('vitaflow_pomodoro') || '[]');
            const today = new Date();
            let html = '';
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const dateStr = formatLocalDate(d);
                const dayRecords = records.filter(r => formatLocalDate(new Date(r.date)) === dateStr);
                const count = dayRecords.length;
                const totalTime = dayRecords.reduce((sum, r) => sum + r.duration, 0);
                const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
                html += `
                    <div class="pomodoro-item">
                        <div class="pomodoro-day">${dayNames[d.getDay()]}</div>
                        <div class="pomodoro-count">${count}</div>
                        <div class="pomodoro-time">${totalTime}分钟</div>
                    </div>
                `;
            }
            grid.innerHTML = html;
        }

        function renderPomodoroStats() {
            const records = JSON.parse(localStorage.getItem('vitaflow_pomodoro') || '[]');
            const totalCount = records.length;
            const totalTime = records.reduce((sum, r) => sum + r.duration, 0);
            const avgCount = totalCount > 0 ? (totalCount / 7).toFixed(1) : 0;
            document.getElementById('pomodoroTotalCount').textContent = totalCount;
            document.getElementById('pomodoroTotalTime').textContent = totalTime;
            document.getElementById('pomodoroAvgCount').textContent = avgCount;
            document.getElementById('pomodoroBestStreak').textContent = Math.max(0, Math.floor(totalCount / 7));
            renderPomodoroHistory();
            renderPomodoroChart();
        }

        function renderPomodoroChart() {
            const ctx = document.getElementById('pomodoroChart');
            if (!ctx) return;
            const records = JSON.parse(localStorage.getItem('vitaflow_pomodoro') || '[]');
            const labels = [];
            const data = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = formatLocalDate(d);
                labels.push((d.getMonth() + 1) + '/' + d.getDate());
                const dayRecords = records.filter(r => formatLocalDate(new Date(r.date)) === dateStr);
                data.push(dayRecords.length);
            }
            if (window.pomodoroChartInstance) window.pomodoroChartInstance.destroy();
            window.pomodoroChartInstance = new Chart(ctx, {
                type: 'bar',
                data: { labels, datasets: [{ label: '专注次数', data, backgroundColor: 'rgba(139, 94, 158, 0.4)', borderColor: '#8b5e9e', borderWidth: 2 }] },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } }, y: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' }, suggestedMin: 0 } } }
            });
        }

        function renderPomodoroHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_pomodoro') || '[]');
            const listEl = document.getElementById('pomodoroHistoryList');
            if (records.length === 0) {
                listEl.innerHTML = '<div style="text-align: center; color: #aa9a9a; padding: 30px;">暂无专注记录</div>';
                return;
            }
            listEl.innerHTML = records.slice(0, 20).map(r => `
                <div class="history-item">
                    <div><span class="history-date">${new Date(r.date).toLocaleString()}</span></div>
                    <div style="color: #8b5e9e; font-weight: 600;">🍅 ${escapeHtml(r.duration)}分钟</div>
                </div>
            `).join('');
        }

        function addWeeklyReview() {
            const startDate = document.getElementById('reviewStartDate').value;
            const endDate = document.getElementById('reviewEndDate').value;
            if (!startDate || !endDate) { alert('请选择开始和结束日期'); return; }
            const reviews = JSON.parse(localStorage.getItem('vitaflow_reviews') || '[]');
            const newReview = {
                id: Date.now(),
                startDate,
                endDate,
                emotion: '',
                achievements: '',
                questions: '',
                nextDirection: '',
                created: new Date().toISOString()
            };
            reviews.unshift(newReview);
            localStorage.setItem('vitaflow_reviews', JSON.stringify(reviews));
            document.getElementById('reviewStartDate').value = '';
            document.getElementById('reviewEndDate').value = '';
            renderReviewList();
        }

        function renderReviewList() {
            const reviews = JSON.parse(localStorage.getItem('vitaflow_reviews') || '[]');
            const listEl = document.getElementById('reviewList');
            if (reviews.length === 0) {
                listEl.innerHTML = '<div style="text-align: center; color: #aa9a9a; padding: 30px;">暂无复盘记录，点击上方添加</div>';
                return;
            }
            listEl.innerHTML = reviews.map(r => `
                <div class="review-card" onclick="openReviewDetail(${inlineHandlerArg(r.id)})">
                    <div class="review-header">
                        <div class="review-title">第${reviews.indexOf(r) + 1}周复盘</div>
                        <div class="review-dates">${escapeHtml(r.startDate)} 至 ${escapeHtml(r.endDate)}</div>
                    </div>
                    <div style="font-size: 0.85rem; color: #8b7a7a;">
                        ${r.emotion ? '😌 已记录情感' : '❌ 未记录'} |
                        ${r.achievements ? '🏆 已记录成就' : '❌ 未记录'}
                    </div>
                </div>
            `).join('');
        }

        function openReviewDetail(id) {
            const reviews = JSON.parse(localStorage.getItem('vitaflow_reviews') || '[]');
            const review = reviews.find(r => r.id === id);
            if (!review) return;
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('reviewDetailPage').classList.add('active');
            document.getElementById('reviewDetailContent').innerHTML = `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-title">第${reviews.indexOf(review) + 1}周复盘</div>
                        <div class="review-dates">${escapeHtml(review.startDate)} 至 ${escapeHtml(review.endDate)}</div>
                    </div>
                    <div class="review-section">
                        <div class="review-section-title">😊 情感记录（可标注表情）</div>
                        <textarea class="review-textarea" id="reviewEmotion" placeholder="记录这周的情感变化、心情起伏...你可以标注：😌😊😣😔等">${escapeHtml(review.emotion)}</textarea>
                    </div>
                    <div class="review-section">
                        <div class="review-section-title">🏆 阶段性成就和探索</div>
                        <textarea class="review-textarea" id="reviewAchievements" placeholder="这周完成了什么？有哪些新的探索和突破？">${escapeHtml(review.achievements)}</textarea>
                    </div>
                    <div class="review-section">
                        <div class="review-section-title">❓ 本周的问题和困惑</div>
                        <textarea class="review-textarea" id="reviewQuestions" placeholder="遇到了什么困难？有什么让你困惑的地方？">${escapeHtml(review.questions)}</textarea>
                    </div>
                    <div class="review-section">
                        <div class="review-section-title">🎯 下周的方向</div>
                        <textarea class="review-textarea" id="reviewNext" placeholder="下周的计划是什么？有哪些需要调整的地方？">${escapeHtml(review.nextDirection)}</textarea>
                    </div>
                    <div style="margin-top: 20px; display: flex; gap: 12px;">
                        <button class="add-btn" style="background: linear-gradient(135deg, #667eea, #764ba2);" onclick="saveReview(${inlineHandlerArg(review.id)})">💾 保存复盘</button>
                        <button class="add-btn" style="background: rgba(200, 100, 100, 0.3);" onclick="deleteReview(${inlineHandlerArg(review.id)})">🗑️ 删除</button>
                    </div>
                </div>
            `;
        }

        function saveReview(id) {
            const reviews = JSON.parse(localStorage.getItem('vitaflow_reviews') || '[]');
            const index = reviews.findIndex(r => r.id === id);
            if (index >= 0) {
                reviews[index].emotion = document.getElementById('reviewEmotion').value;
                reviews[index].achievements = document.getElementById('reviewAchievements').value;
                reviews[index].questions = document.getElementById('reviewQuestions').value;
                reviews[index].nextDirection = document.getElementById('reviewNext').value;
                localStorage.setItem('vitaflow_reviews', JSON.stringify(reviews));
                alert('✅ 复盘已保存');
                goBack();
                renderReviewList();
            }
        }

        function deleteReview(id) {
            if (!confirm('确定要删除这个复盘吗？')) return;
            let reviews = JSON.parse(localStorage.getItem('vitaflow_reviews') || '[]');
            reviews = reviews.filter(r => r.id !== id);
            localStorage.setItem('vitaflow_reviews', JSON.stringify(reviews));
            goBack();
            renderReviewList();
        }

        function renderEmotionBoard() {
            const board = document.getElementById('emotionBoard');
            board.innerHTML = '';
            const happiness = JSON.parse(localStorage.getItem('vitaflow_happiness') || '{}');
            const selectedYear = Number.parseInt(document.getElementById('emotionYear').value, 10);
            const selectedMonth = Number.parseInt(document.getElementById('emotionMonth').value, 10);
            const year = Number.isInteger(selectedYear) ? selectedYear : new Date().getFullYear();
            const month = Number.isInteger(selectedMonth) ? selectedMonth : new Date().getMonth();

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();
            const todayStr = formatLocalDate(today);

            let dayIndex = 0;
            for (let i = 0; i < 42; i++) {
                const weekDay = i % 7;
                if (i < firstDay || dayIndex >= daysInMonth) {
                    board.innerHTML += '<div style="visibility: hidden; border-radius: 16px; padding: 12px 8px;"></div>';
                } else {
                    const dayNum = dayIndex + 1;
                    const dateStr = formatLocalDate(new Date(year, month, dayNum));
                    const score = Object.prototype.hasOwnProperty.call(happiness, dateStr) ? happiness[dateStr] : null;
                    const emoji = score == null ? '—' : (happyEmojis[score] || '😐');
                    const isToday = dateStr === todayStr;
                    const bgColor = score == null ? 'rgba(200, 160, 200, 0.08)' : score >= 7 ? 'rgba(100, 200, 150, 0.2)' : score >= 5 ? 'rgba(255, 200, 100, 0.2)' : 'rgba(200, 100, 100, 0.2)';

                    board.innerHTML += `
                        <div style="background: ${bgColor}; border-radius: 16px; padding: 10px 6px; text-align: center; border: 2px solid ${isToday ? '#c4679c' : 'rgba(200, 160, 200, 0.2)'};"
                             onclick="showEmojiSelector(${inlineHandlerArg(dateStr)}, ${dayNum}, this)">
                            <div style="font-size: 0.7rem; color: #8b7a7a; margin-bottom: 2px;">${dayNum}</div>
                            <div style="font-size: 1.4rem;">${emoji}</div>
                        </div>
                    `;
                    dayIndex++;
                }
            }
            renderDefaultEmotionChart();
        }

        function showEmojiSelector(dateStr, day, element) {
            const emojis = [
                { score: 1, emoji: '😣', label: '难受' },
                { score: 3, emoji: '😕', label: '一般' },
                { score: 5, emoji: '😐', label: '平静' },
                { score: 7, emoji: '😊', label: '开心' },
                { score: 9, emoji: '😄', label: '很开心' },
                { score: 10, emoji: '🤩', label: '超开心' }
            ];

            const selector = document.createElement('div');
            selector.innerHTML = `<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 1000;">
                <div style="font-weight: 700; color: #5a3a4a; margin-bottom: 16px; text-align: center;">选择情感状态</div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                    ${emojis.map(e => `<button onclick="setHappiness(${inlineHandlerArg(dateStr)}, ${e.score}, ${inlineHandlerArg(e.emoji)}, this)"
                        style="padding: 12px; font-size: 1.5rem; border: none; border-radius: 12px; background: rgba(248, 240, 255, 0.8); cursor: pointer;"
                        title="${e.label}">${e.emoji}</button>`).join('')}
                </div>
                <button onclick="this.parentElement.remove()"
                    style="width: 100%; margin-top: 16px; padding: 10px; border: 1px solid #ffe2f0; border-radius: 16px; background: rgba(200, 160, 200, 0.1); cursor: pointer;">取消</button>
            </div>`;
            document.body.appendChild(selector);
        }

        function setHappiness(dateStr, score, emoji, btn) {
            const happiness = JSON.parse(localStorage.getItem('vitaflow_happiness') || '{}');
            happiness[dateStr] = score;
            localStorage.setItem('vitaflow_happiness', JSON.stringify(happiness));
            btn.parentElement.parentElement.remove();
            renderEmotionBoard();
            renderDefaultEmotionChart();
        }

        function renderDefaultEmotionChart() {
            const happiness = JSON.parse(localStorage.getItem('vitaflow_happiness') || '{}');
            const labels = [];
            const data = [];

            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = formatLocalDate(d);
                labels.push((d.getMonth() + 1) + '/' + d.getDate());
                data.push(happiness[dateStr] ?? null);
            }
            renderEmotionChart(labels, data);
        }

        function renderEmotionChartWithRange() {
            const startDate = document.getElementById('emotionStartDate').value;
            const endDate = document.getElementById('emotionEndDate').value;

            if (!startDate || !endDate) {
                alert('请选择开始和结束日期');
                return;
            }

            const start = parseLocalDate(startDate);
            const end = parseLocalDate(endDate);

            if (start > end) {
                alert('开始日期不能晚于结束日期');
                return;
            }

            const happiness = JSON.parse(localStorage.getItem('vitaflow_happiness') || '{}');
            const labels = [];
            const data = [];

            const current = new Date(start);
            while (current <= end) {
                const dateStr = formatLocalDate(current);
                labels.push((current.getMonth() + 1) + '/' + current.getDate());
                data.push(happiness[dateStr] ?? null);
                current.setDate(current.getDate() + 1);
            }

            renderEmotionChart(labels, data);
        }

        function renderEmotionChart(labels, data) {
            const canvas = document.getElementById('emotionChart');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (window.emotionChart) window.emotionChart.destroy();

            window.emotionChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '情感得分',
                        data: data,
                        borderColor: '#c4679c',
                        borderWidth: 3,
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        fill: false,
                        pointBackgroundColor: '#c4679c',
                        pointRadius: 6,
                        pointBorderWidth: 2,
                        pointBorderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b7a7a', font: { size: 10 } }, grid: { color: 'rgba(200, 160, 200, 0.2)' } },
                        y: { ticks: { color: '#8b7a7a', stepSize: 2 }, grid: { color: 'rgba(200, 160, 200, 0.2)' }, min: 0, max: 10 }
                    }
                }
            });
        }

        function saveEmotionNotes() {
            const notes = document.getElementById('emotionNotes').value.trim();
            if (!notes) {
                alert('请输入情绪波动记录');
                return;
            }
            const startDate = document.getElementById('emotionStartDate').value;
            const endDate = document.getElementById('emotionEndDate').value;
            const timeRange = startDate && endDate ? `${startDate} 至 ${endDate}` : '当前选择的时间范围';

            const emotionNotesList = JSON.parse(localStorage.getItem('vitaflow_emotion_notes') || '[]');
            emotionNotesList.unshift({
                id: Date.now(),
                notes: notes,
                timeRange: timeRange,
                created: new Date().toISOString()
            });
            localStorage.setItem('vitaflow_emotion_notes', JSON.stringify(emotionNotesList));
            document.getElementById('emotionNotes').value = '';
            alert('✅ 记录已保存');
            renderEmotionNotesList();
        }

        function renderEmotionNotesList() {
            const notesList = JSON.parse(localStorage.getItem('vitaflow_emotion_notes') || '[]');
            const el = document.getElementById('emotionNotesList');
            if (notesList.length === 0) {
                el.innerHTML = '<div style="text-align: center; color: #aa9a9a; font-size: 0.9rem;">暂无记录</div>';
                return;
            }
            el.innerHTML = notesList.slice(0, 5).map(item => `
                <div style="background: rgba(200, 160, 200, 0.1); border-radius: 12px; padding: 12px; margin-bottom: 10px;">
                    <div style="font-size: 0.75rem; color: #c4679c; margin-bottom: 6px;">📅 ${escapeHtml(item.timeRange)}</div>
                    <div style="font-size: 0.9rem; color: #5a3a4a; line-height: 1.5;">${escapeHtml(item.notes)}</div>
                    <div style="font-size: 0.7rem; color: #aa9a9a; margin-top: 6px;">${new Date(item.created).toLocaleString()}</div>
                </div>
            `).join('');
        }

        // DeepSeek聊什么模块
        let deepseekCurrentCategory = null;
        let deepseekCurrentPopup = null;

        function closeDeepseekPopup() {
            if (deepseekCurrentPopup) {
                deepseekCurrentPopup.remove();
                deepseekCurrentPopup = null;
            }
        }

        function openIdeasTab(tab) {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('ideasPage').classList.add('active');

            const ideasPage = document.getElementById('ideasPage');
            ideasPage.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            ideasPage.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            const tabButtons = ideasPage.querySelectorAll('.tab-btn');
            let targetButton = null;
            tabButtons.forEach(btn => {
                const onclickStr = btn.getAttribute('onclick');
                if (onclickStr && onclickStr.includes(tab)) {
                    targetButton = btn;
                }
            });
            if (targetButton) targetButton.classList.add('active');

            document.getElementById('ideas-' + tab).classList.add('active');

            if (tab === 'analysis') renderAnalysisList();
            else if (tab === 'ip') renderIPList();
            else if (tab === 'skills') renderSkillsList();
            else if (tab === 'vault') renderIdeaVault();

            updateMediaCounts();
        }

        function openDeepSeekDetail() {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('deepseekPage').classList.add('active');
            renderDeepSeekCategories();
            renderDeepSeekDocs();
            updateDeepseekCount();
        }

        function renderDeepSeekCategories() {
            const categories = JSON.parse(localStorage.getItem('vitaflow_deepseek_categories') || '[]');
            const docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');

            let html = `
                <div onclick="selectDeepseekCategory(null)" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${deepseekCurrentCategory === null ? 'background: linear-gradient(135deg, #667eea, #764ba2); color: white;' : 'background: rgba(102, 126, 234, 0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(102,126,234,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(102,126,234,0.1)'">
                    📂 全部文档 <span style="float: right; font-size: 0.8rem;">${docs.length}</span>
                </div>
            `;

            categories.forEach(cat => {
                const count = docs.filter(d => d.category === cat.id).length;
                html += `
                    <div onclick="selectDeepseekCategory(${inlineHandlerArg(cat.id)})" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${deepseekCurrentCategory === cat.id ? 'background: linear-gradient(135deg, #667eea, #764ba2); color: white;' : 'background: rgba(102,126,234,0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(102,126,234,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(102,126,234,0.1)'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</span>
                            <div style="display: flex; gap: 4px;">
                                <span style="font-size: 0.8rem;">${count}</span>
                                <button onclick="event.stopPropagation(); deleteDeepseekCategory(${inlineHandlerArg(cat.id)})" style="background: none; border: none; cursor: pointer; opacity: 0.6;" title="删除">×</button>
                            </div>
                        </div>
                    </div>
                `;
            });

            document.getElementById('deepseekCategories').innerHTML = html;
        }

        function selectDeepseekCategory(catId) {
            deepseekCurrentCategory = catId;
            const categories = JSON.parse(localStorage.getItem('vitaflow_deepseek_categories') || '[]');
            if (catId === null) {
                document.getElementById('deepseekCurrentTitle').textContent = '📝 全部文档';
            } else {
                const cat = categories.find(c => c.id === catId);
                document.getElementById('deepseekCurrentTitle').textContent = `📝 ${cat ? cat.name : ''}`;
            }
            renderDeepSeekCategories();
            renderDeepSeekDocs();
        }

        function addDeepSeekCategory() {
            const name = prompt('请输入合集名称：');
            if (!name) return;
            const emoji = prompt('请输入一个表情（可选，默认📁）：') || '📁';

            const categories = JSON.parse(localStorage.getItem('vitaflow_deepseek_categories') || '[]');
            categories.push({
                id: Date.now().toString(),
                name: name,
                emoji: emoji
            });
            localStorage.setItem('vitaflow_deepseek_categories', JSON.stringify(categories));
            renderDeepSeekCategories();
        }

        function deleteDeepseekCategory(catId) {
            if (!confirm('确定要删除这个合集吗？文档不会被删除，只是会移出这个合集。')) return;

            const categories = JSON.parse(localStorage.getItem('vitaflow_deepseek_categories') || '[]');
            const docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');

            docs.forEach(doc => {
                if (doc.category === catId) {
                    doc.category = null;
                }
            });

            const newCategories = categories.filter(c => c.id !== catId);
            localStorage.setItem('vitaflow_deepseek_categories', JSON.stringify(newCategories));
            localStorage.setItem('vitaflow_deepseek_docs', JSON.stringify(docs));

            if (deepseekCurrentCategory === catId) {
                deepseekCurrentCategory = null;
                document.getElementById('deepseekCurrentTitle').textContent = '📝 全部文档';
            }

            renderDeepSeekCategories();
            renderDeepSeekDocs();
        }

        function renderDeepSeekDocs(searchTerm = '') {
            let docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');

            if (deepseekCurrentCategory !== null) {
                docs = docs.filter(d => d.category === deepseekCurrentCategory);
            }

            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                docs = docs.filter(d =>
                    d.title.toLowerCase().includes(term) ||
                    d.content.toLowerCase().includes(term)
                );
            }

            docs.sort((a, b) => new Date(b.date) - new Date(a.date));

            const categories = JSON.parse(localStorage.getItem('vitaflow_deepseek_categories') || '[]');

            let html = '';
            if (docs.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 40px; grid-column: 1 / -1;">还没有文档哦，快写点什么吧！</div>';
            } else {
                docs.forEach(doc => {
                    const cat = categories.find(c => c.id === doc.category);
                    const date = new Date(doc.date);
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
                    const preview = doc.content.slice(0, 80) + (doc.content.length > 80 ? '...' : '');

                    html += `
                        <div onclick="openDeepseekDocDetail(${inlineHandlerArg(doc.id)})" style="background: rgba(255,255,255,0.7); border-radius: 16px; padding: 16px; cursor: pointer; border: 1px solid rgba(102, 126, 234, 0.2);" onmouseover="this.style.background='rgba(102,126,234,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                            <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 8px; font-size: 1rem;">${escapeHtml(doc.title)}</div>
                            <div style="font-size: 0.85rem; color: #5a4a5a; line-height: 1.5; margin-bottom: 10px; white-space: pre-wrap;">${escapeHtml(preview)}</div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="font-size: 0.75rem; color: #8b7a7a;">${dateStr}</div>
                                ${cat ? `<div style="font-size: 0.75rem; background: rgba(102,126,234,0.2); padding: 2px 8px; border-radius: 8px;">${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</div>` : ''}
                            </div>
                        </div>
                    `;
                });
            }

            document.getElementById('deepseekDocs').innerHTML = html;
        }

        function openDeepSeekEditor(docId = null) {
            const docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_deepseek_categories') || '[]');

            let doc = null;
            if (docId) {
                doc = docs.find(d => d.id === docId);
            }

            deepseekCurrentPopup = document.createElement('div');
            deepseekCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000;"></div>
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.3rem; color: #6a4a7a;">${doc ? '✏️ 编辑文档' : '📝 新建文档'}</div>
                        <button onclick="closeDeepseekPopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">标题</label>
                        <input type="text" id="deepseekDocTitle" placeholder="输入文档标题..." style="width: 100%; padding: 12px; border: 2px solid rgba(102,126,234,0.3); border-radius: 12px; font-size: 1rem;" value="${doc ? escapeHtml(doc.title) : ''}">
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">归类（可选）</label>
                        <select id="deepseekDocCategory" style="width: 100%; padding: 12px; border: 2px solid rgba(102,126,234,0.3); border-radius: 12px; font-size: 1rem;">
                            <option value="">不归类</option>
                            ${categories.map(cat => `<option value="${escapeHtml(cat.id)}" ${doc && doc.category === cat.id ? 'selected' : ''}>${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">内容</label>
                        <textarea id="deepseekDocContent" placeholder="在这里写下你和DeepSeek聊的内容..." style="width: 100%; height: 300px; padding: 12px; border: 2px solid rgba(102,126,234,0.3); border-radius: 12px; font-size: 1rem; resize: vertical;">${doc ? escapeHtml(doc.content) : ''}</textarea>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeDeepseekPopup()">取消</button>
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #667eea, #764ba2);" onclick="saveDeepseekDoc(${inlineHandlerArg(docId)})">保存</button>
                    </div>
                </div>
            `;
            document.body.appendChild(deepseekCurrentPopup);
        }

        function saveDeepseekDoc(docId) {
            const title = document.getElementById('deepseekDocTitle').value.trim();
            const content = document.getElementById('deepseekDocContent').value.trim();
            const category = document.getElementById('deepseekDocCategory').value;

            if (!title || !content) {
                alert('请填写标题和内容！');
                return;
            }

            let docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');

            if (docId && docId !== 'null') {
                const index = docs.findIndex(d => d.id === docId);
                if (index >= 0) {
                    docs[index] = {
                        ...docs[index],
                        title: title,
                        content: content,
                        category: category || null,
                        date: new Date().toISOString()
                    };
                }
            } else {
                docs.push({
                    id: Date.now().toString(),
                    title: title,
                    content: content,
                    category: category || null,
                    date: new Date().toISOString()
                });
            }

            localStorage.setItem('vitaflow_deepseek_docs', JSON.stringify(docs));

            closeDeepseekPopup();

            renderDeepSeekDocs();
            renderDeepSeekCategories();
            updateDeepseekCount();
        }

        function openDeepseekDocDetail(docId) {
            const docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_deepseek_categories') || '[]');
            const doc = docs.find(d => d.id === docId);
            if (!doc) return;

            const cat = categories.find(c => c.id === doc.category);
            const date = new Date(doc.date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;

            deepseekCurrentPopup = document.createElement('div');
            deepseekCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000;"></div>
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="font-weight: 700; font-size: 1.3rem; color: #6a4a7a;">${escapeHtml(doc.title)}</div>
                        <button onclick="closeDeepseekPopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px; font-size: 0.85rem; color: #8b7a7a;">
                        <span>📅 ${dateStr}</span>
                        ${cat ? `<span style="background: rgba(102,126,234,0.2); padding: 4px 10px; border-radius: 10px;">${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</span>` : ''}
                    </div>
                    <div style="background: rgba(102,126,234,0.05); padding: 16px; border-radius: 12px; line-height: 1.8; white-space: pre-wrap; color: #4a3a4a; margin-bottom: 16px;">${escapeHtml(doc.content)}</div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeDeepseekPopup()">关闭</button>
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #8b5e9e, #6a4a7a);" onclick="deleteDeepseekDoc(${inlineHandlerArg(doc.id)})">删除</button>
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #667eea, #764ba2);" onclick="closeDeepseekPopup(); openDeepSeekEditor(${inlineHandlerArg(doc.id)});">编辑</button>
                    </div>
                </div>
            `;
            document.body.appendChild(deepseekCurrentPopup);
        }

        function deleteDeepseekDoc(docId) {
            if (!confirm('确定要删除这个文档吗？')) return;

            let docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');
            docs = docs.filter(d => d.id !== docId);
            localStorage.setItem('vitaflow_deepseek_docs', JSON.stringify(docs));

            closeDeepseekPopup();

            renderDeepSeekDocs();
            renderDeepSeekCategories();
            updateDeepseekCount();
        }

        function searchDeepSeekDocs() {
            const term = document.getElementById('deepseekSearch').value.trim();
            renderDeepSeekDocs(term);
        }

        function updateDeepseekCount() {
            const docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');
            const el = document.getElementById('deepseekCount');
            if (el) {
                el.textContent = docs.length + ' 个文档';
            }
        }

        // 文学创作类中心
        let literatureCurrentCategory = null;
        let literatureCurrentPopup = null;

        function closeLiteraturePopup() {
            if (literatureCurrentPopup) {
                literatureCurrentPopup.remove();
                literatureCurrentPopup = null;
            }
        }

        function openLiteratureDetail() {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('literaturePage').classList.add('active');
            renderLiteratureCategories();
            renderLiteratureDocs();
            updateLiteratureCount();
        }

        function renderLiteratureCategories() {
            const categories = JSON.parse(localStorage.getItem('vitaflow_literature_categories') || '[]');
            const docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');

            let html = `
                <div onclick="selectLiteratureCategory(null)" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${literatureCurrentCategory === null ? 'background: linear-gradient(135deg, #e88a4c, #d470a0); color: white;' : 'background: rgba(232,138,76,0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(232,138,76,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(232,138,76,0.1)'">
                    📂 全部文档 <span style="float: right; font-size: 0.8rem;">${docs.length}</span>
                </div>
            `;

            categories.forEach(cat => {
                const count = docs.filter(d => d.category === cat.id).length;
                html += `
                    <div onclick="selectLiteratureCategory(${inlineHandlerArg(cat.id)})" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${literatureCurrentCategory === cat.id ? 'background: linear-gradient(135deg, #e88a4c, #d470a0); color: white;' : 'background: rgba(232,138,76,0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(232,138,76,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(232,138,76,0.1)'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</span>
                            <div style="display: flex; gap: 4px;">
                                <span style="font-size: 0.8rem;">${count}</span>
                                <button onclick="event.stopPropagation(); deleteLiteratureCategory(${inlineHandlerArg(cat.id)})" style="background: none; border: none; cursor: pointer; opacity: 0.6;" title="删除">×</button>
                            </div>
                        </div>
                    </div>
                `;
            });

            document.getElementById('literatureCategories').innerHTML = html;
        }

        function selectLiteratureCategory(catId) {
            literatureCurrentCategory = catId;
            const categories = JSON.parse(localStorage.getItem('vitaflow_literature_categories') || '[]');
            if (catId === null) {
                document.getElementById('literatureCurrentTitle').textContent = '📝 全部文档';
            } else {
                const cat = categories.find(c => c.id === catId);
                document.getElementById('literatureCurrentTitle').textContent = `📝 ${cat ? cat.name : ''}`;
            }
            renderLiteratureCategories();
            renderLiteratureDocs();
        }

        function addLiteratureCategory() {
            const name = prompt('请输入合集名称：');
            if (!name) return;
            const emoji = prompt('请输入一个表情（可选，默认📁）：') || '📁';

            const categories = JSON.parse(localStorage.getItem('vitaflow_literature_categories') || '[]');
            categories.push({
                id: Date.now().toString(),
                name: name,
                emoji: emoji
            });
            localStorage.setItem('vitaflow_literature_categories', JSON.stringify(categories));
            renderLiteratureCategories();
        }

        function deleteLiteratureCategory(catId) {
            if (!confirm('确定要删除这个合集吗？文档不会被删除。')) return;

            const categories = JSON.parse(localStorage.getItem('vitaflow_literature_categories') || '[]');
            const docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');

            docs.forEach(doc => {
                if (doc.category === catId) {
                    doc.category = null;
                }
            });

            const newCategories = categories.filter(c => c.id !== catId);
            localStorage.setItem('vitaflow_literature_categories', JSON.stringify(newCategories));
            localStorage.setItem('vitaflow_literature_docs', JSON.stringify(docs));

            if (literatureCurrentCategory === catId) {
                literatureCurrentCategory = null;
                document.getElementById('literatureCurrentTitle').textContent = '📝 全部文档';
            }

            renderLiteratureCategories();
            renderLiteratureDocs();
        }

        function renderLiteratureDocs(searchTerm = '') {
            let docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');

            if (literatureCurrentCategory !== null) {
                docs = docs.filter(d => d.category === literatureCurrentCategory);
            }

            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                docs = docs.filter(d =>
                    d.title.toLowerCase().includes(term) ||
                    d.content.toLowerCase().includes(term)
                );
            }

            docs.sort((a, b) => new Date(b.date) - new Date(a.date));

            const categories = JSON.parse(localStorage.getItem('vitaflow_literature_categories') || '[]');

            let html = '';
            if (docs.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 40px; grid-column: 1 / -1;">还没有文档哦，快写点什么吧！</div>';
            } else {
                docs.forEach(doc => {
                    const cat = categories.find(c => c.id === doc.category);
                    const date = new Date(doc.date);
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
                    const preview = doc.content.slice(0, 80) + (doc.content.length > 80 ? '...' : '');

                    html += `
                        <div onclick="openLiteratureDocDetail(${inlineHandlerArg(doc.id)})" style="background: rgba(255,255,255,0.7); border-radius: 16px; padding: 16px; cursor: pointer; border: 1px solid rgba(232,138,76,0.2);" onmouseover="this.style.background='rgba(232,138,76,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                            <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 8px; font-size: 1rem;">${escapeHtml(doc.title)}</div>
                            <div style="font-size: 0.85rem; color: #5a4a5a; line-height: 1.5; margin-bottom: 10px; white-space: pre-wrap;">${escapeHtml(preview)}</div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="font-size: 0.75rem; color: #8b7a7a;">${dateStr}</div>
                                ${cat ? `<div style="font-size: 0.75rem; background: rgba(232,138,76,0.2); padding: 2px 8px; border-radius: 8px;">${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</div>` : ''}
                            </div>
                        </div>
                    `;
                });
            }

            document.getElementById('literatureDocs').innerHTML = html;
        }

        function openLiteratureEditor(docId = null) {
            const docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_literature_categories') || '[]');

            let doc = null;
            if (docId) {
                doc = docs.find(d => d.id === docId);
            }

            literatureCurrentPopup = document.createElement('div');
            literatureCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000;"></div>
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.3rem; color: #6a4a7a;">${doc ? '✏️ 编辑文档' : '📝 新建文档'}</div>
                        <button onclick="closeLiteraturePopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">标题</label>
                        <input type="text" id="literatureDocTitle" placeholder="输入文档标题..." style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;" value="${doc ? escapeHtml(doc.title) : ''}">
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">归类（可选）</label>
                        <select id="literatureDocCategory" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;">
                            <option value="">不归类</option>
                            ${categories.map(cat => `<option value="${escapeHtml(cat.id)}" ${doc && doc.category === cat.id ? 'selected' : ''}>${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">内容</label>
                        <textarea id="literatureDocContent" placeholder="在这里记录你的创作灵感..." style="width: 100%; height: 300px; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem; resize: vertical;">${doc ? escapeHtml(doc.content) : ''}</textarea>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeLiteraturePopup()">取消</button>
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #e88a4c, #d470a0);" onclick="saveLiteratureDoc(${inlineHandlerArg(docId)})">保存</button>
                    </div>
                </div>
            `;
            document.body.appendChild(literatureCurrentPopup);
        }

        function saveLiteratureDoc(docId) {
            const title = document.getElementById('literatureDocTitle').value.trim();
            const content = document.getElementById('literatureDocContent').value.trim();
            const category = document.getElementById('literatureDocCategory').value;

            if (!title || !content) {
                alert('请填写标题和内容！');
                return;
            }

            let docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');

            if (docId && docId !== 'null') {
                const index = docs.findIndex(d => d.id === docId);
                if (index >= 0) {
                    docs[index] = {
                        ...docs[index],
                        title: title,
                        content: content,
                        category: category || null,
                        date: new Date().toISOString()
                    };
                }
            } else {
                docs.push({
                    id: Date.now().toString(),
                    title: title,
                    content: content,
                    category: category || null,
                    date: new Date().toISOString()
                });
            }

            localStorage.setItem('vitaflow_literature_docs', JSON.stringify(docs));

            closeLiteraturePopup();

            renderLiteratureDocs();
            renderLiteratureCategories();
            updateLiteratureCount();
        }

        function openLiteratureDocDetail(docId) {
            const docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_literature_categories') || '[]');
            const doc = docs.find(d => d.id === docId);
            if (!doc) return;

            const cat = categories.find(c => c.id === doc.category);
            const date = new Date(doc.date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;

            literatureCurrentPopup = document.createElement('div');
            literatureCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000;"></div>
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="font-weight: 700; font-size: 1.3rem; color: #6a4a7a;">${escapeHtml(doc.title)}</div>
                        <button onclick="closeLiteraturePopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px; font-size: 0.85rem; color: #8b7a7a;">
                        <span>📅 ${dateStr}</span>
                        ${cat ? `<span style="background: rgba(232,138,76,0.2); padding: 4px 10px; border-radius: 10px;">${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</span>` : ''}
                    </div>
                    <div style="background: rgba(232,138,76,0.05); padding: 16px; border-radius: 12px; line-height: 1.8; white-space: pre-wrap; color: #4a3a4a; margin-bottom: 16px;">${escapeHtml(doc.content)}</div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeLiteraturePopup()">关闭</button>
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #8b5e9e, #6a4a7a);" onclick="deleteLiteratureDoc(${inlineHandlerArg(doc.id)})">删除</button>
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #e88a4c, #d470a0);" onclick="closeLiteraturePopup(); openLiteratureEditor(${inlineHandlerArg(doc.id)});">编辑</button>
                    </div>
                </div>
            `;
            document.body.appendChild(literatureCurrentPopup);
        }

        function deleteLiteratureDoc(docId) {
            if (!confirm('确定要删除这个文档吗？')) return;

            let docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');
            docs = docs.filter(d => d.id !== docId);
            localStorage.setItem('vitaflow_literature_docs', JSON.stringify(docs));

            closeLiteraturePopup();

            renderLiteratureDocs();
            renderLiteratureCategories();
            updateLiteratureCount();
        }

        function searchLiteratureDocs() {
            const term = document.getElementById('literatureSearch').value.trim();
            renderLiteratureDocs(term);
        }

        function updateLiteratureCount() {
            const docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');
            const el = document.getElementById('literatureCount');
            if (el) {
                el.textContent = docs.length + ' 个文档';
            }
        }

        // 小说大纲构建器
        let novelCurrentPopup = null;

        function closeNovelPopup() {
            if (novelCurrentPopup) {
                novelCurrentPopup.remove();
                novelCurrentPopup = null;
            }
        }

        function openNovelOutlineDetail() {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('novelOutlinePage').classList.add('active');
            renderNovelOutlines();
            updateNovelOutlineCount();
        }

        function renderNovelOutlines(searchTerm = '') {
            let novels = JSON.parse(localStorage.getItem('vitaflow_novel_outlines') || '[]');

            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                novels = novels.filter(n =>
                    n.title.toLowerCase().includes(term) ||
                    n.genre.toLowerCase().includes(term)
                );
            }

            novels.sort((a, b) => new Date(b.date) - new Date(a.date));

            let html = '';
            if (novels.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 40px; grid-column: 1 / -1;">还没有小说大纲哦，开始创作吧！</div>';
            } else {
                novels.forEach(novel => {
                    const date = new Date(novel.date);
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

                    html += `
                        <div onclick="openNovelOutlineEditor(${inlineHandlerArg(novel.id)})" style="background: rgba(255,255,255,0.7); border-radius: 16px; padding: 16px; cursor: pointer; border: 1px solid rgba(232,138,76,0.2);" onmouseover="this.style.background='rgba(232,138,76,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                            <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 8px; font-size: 1.1rem;">${escapeHtml(novel.title)}</div>
                            <div style="font-size: 0.85rem; color: #5a4a5a; margin-bottom: 8px;">📖 ${escapeHtml(novel.genre) || '未分类'}</div>
                            <div style="font-size: 0.75rem; color: #8b7a7a;">📅 ${dateStr}</div>
                            <div style="margin-top: 10px; font-size: 0.8rem; color: #6a4a5a;">
                                ${novel.concept ? '💡 有核心创意' : '⚠️ 待完善核心创意'}
                                ${novel.structure ? ' | 📐 有结构设计' : ''}
                            </div>
                        </div>
                    `;
                });
            }

            document.getElementById('novelOutlineList').innerHTML = html;
        }

        function openNovelOutlineEditor(novelId = null) {
            const novels = JSON.parse(localStorage.getItem('vitaflow_novel_outlines') || '[]');

            let novel = null;
            if (novelId) {
                novel = novels.find(n => n.id === novelId);
            }

            novelCurrentPopup = document.createElement('div');
            novelCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; overflow-y: auto;"></div>
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 900px; width: 95%; max-height: 95vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div style="font-weight: 700; font-size: 1.5rem; color: #6a4a7a;">${novel ? '✏️ 编辑小说大纲' : '🗺️ 创建新小说大纲'}</div>
                        <button onclick="closeNovelPopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 8px;">📖 小说标题</label>
                        <input type="text" id="novelTitle" placeholder="给你的小说起个名字..." style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1.1rem;" value="${novel ? escapeHtml(novel.title) : ''}">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                        <div>
                            <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 8px;">🏷️ 类型/题材</label>
                            <select id="novelGenre" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;">
                                <option value="">选择类型</option>
                                <option value="都市情感" ${novel && novel.genre === '都市情感' ? 'selected' : ''}>都市情感</option>
                                <option value="职场商战" ${novel && novel.genre === '职场商战' ? 'selected' : ''}>职场商战</option>
                                <option value="悬疑推理" ${novel && novel.genre === '悬疑推理' ? 'selected' : ''}>悬疑推理</option>
                                <option value="科幻未来" ${novel && novel.genre === '科幻未来' ? 'selected' : ''}>科幻未来</option>
                                <option value="历史穿越" ${novel && novel.genre === '历史穿越' ? 'selected' : ''}>历史穿越</option>
                                <option value="校园青春" ${novel && novel.genre === '校园青春' ? 'selected' : ''}>校园青春</option>
                                <option value="玄幻奇幻" ${novel && novel.genre === '玄幻奇幻' ? 'selected' : ''}>玄幻奇幻</option>
                                <option value="武侠江湖" ${novel && novel.genre === '武侠江湖' ? 'selected' : ''}>武侠江湖</option>
                                <option value="现实主义" ${novel && novel.genre === '现实主义' ? 'selected' : ''}>现实主义</option>
                                <option value="其他" ${novel && novel.genre === '其他' ? 'selected' : ''}>其他</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 8px;">📏 预计篇幅</label>
                            <select id="novelLength" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;">
                                <option value="">选择篇幅</option>
                                <option value="短篇 (1-3万字)" ${novel && novel.length === '短篇 (1-3万字)' ? 'selected' : ''}>短篇 (1-3万字)</option>
                                <option value="中篇 (3-10万字)" ${novel && novel.length === '中篇 (3-10万字)' ? 'selected' : ''}>中篇 (3-10万字)</option>
                                <option value="长篇 (10-30万字)" ${novel && novel.length === '长篇 (10-30万字)' ? 'selected' : ''}>长篇 (10-30万字)</option>
                                <option value="超长篇 (30万字以上)" ${novel && novel.length === '超长篇 (30万字以上)' ? 'selected' : ''}>超长篇 (30万字以上)</option>
                            </select>
                        </div>
                    </div>

                    <div style="background: linear-gradient(135deg, rgba(232,138,76,0.1), rgba(212,112,160,0.1)); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">💡 核心创意概念</div>
                        <textarea id="novelConcept" placeholder="用一个简洁的句子描述你的故事核心：&#10;例如：'一个被困在时间循环里的社畜，必须在每天结束时拯救一个人才能逃脱'&#10;&#10;思考：&#10;• 什么东西让这个故事独特？&#10;• 读者为什么会想看这个故事？&#10;• 有什么新意或反转？" style="width: 100%; height: 120px; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${novel ? escapeHtml(novel.concept) : ''}</textarea>
                    </div>

                    <div style="background: rgba(255,255,255,0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">👤 人物设定</div>
                        <div style="margin-bottom: 16px;">
                            <div style="font-size: 0.9rem; color: #8b7a7a; margin-bottom: 8px;">🎭 主角</div>
                            <textarea id="novelProtagonist" placeholder="主角是谁？&#10;• 性格特点&#10;• 外貌特征&#10;• 核心欲望/恐惧&#10;• 与故事的关联" style="width: 100%; height: 100px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.9rem; resize: vertical;">${novel ? escapeHtml(novel.protagonist) : ''}</textarea>
                        </div>
                        <div style="margin-bottom: 16px;">
                            <div style="font-size: 0.9rem; color: #8b7a7a; margin-bottom: 8px;">⚡ 核心冲突人物（反派/对手）</div>
                            <textarea id="novelAntagonist" placeholder="主角面临的主要对手或障碍是什么？&#10;• 他们想要什么？&#10;• 与主角的核心矛盾是什么？&#10;• 为什么会形成冲突？" style="width: 100%; height: 100px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.9rem; resize: vertical;">${novel ? escapeHtml(novel.antagonist) : ''}</textarea>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; color: #8b7a7a; margin-bottom: 8px;">👥 关键配角</div>
                            <textarea id="novelSupporting" placeholder="其他重要角色（导师、朋友、情人等）：&#10;• 他们的作用是什么？&#10;• 如何推动主线或制造转折？" style="width: 100%; height: 80px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.9rem; resize: vertical;">${novel ? escapeHtml(novel.supporting) : ''}</textarea>
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">📐 结构设计</div>
                        <div style="margin-bottom: 16px;">
                            <div style="font-size: 0.9rem; color: #8b7a7a; margin-bottom: 8px;">🎬 三幕结构概览</div>
                            <textarea id="novelStructure" placeholder="第一幕 (建置)：&#10;• 世界观/背景设定&#10;• 主角的日常状态&#10;• 催化事件是什么？&#10;&#10;第二幕 (对抗)：&#10;• 主要冲突展开&#10;• 主角遭遇的障碍&#10;• 中点转折是什么？&#10;• 最低谷/最大危机？&#10;&#10;第三幕 (解决)：&#10;• 如何高潮对决？&#10;• 如何收尾？" style="width: 100%; height: 180px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.9rem; resize: vertical;">${novel ? escapeHtml(novel.structure) : ''}</textarea>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; color: #8b7a7a; margin-bottom: 8px;">🔑 关键情节点</div>
                            <textarea id="novelPlotPoints" placeholder="列出3-5个核心情节点：&#10;1. 开端钩子：&#10;2. 第一个转折：&#10;3. 中点高潮：&#10;4. 第二个转折：&#10;5. 最终高潮：" style="width: 100%; height: 120px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.9rem; resize: vertical;">${novel ? escapeHtml(novel.plotPoints) : ''}</textarea>
                        </div>
                    </div>

                    <div style="background: linear-gradient(135deg, rgba(232,138,76,0.1), rgba(212,112,160,0.1)); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">🎯 主题与意义</div>
                        <textarea id="novelTheme" placeholder="这个故事想要表达什么？&#10;• 核心主题是什么？（如：救赎、成长、复仇）&#10;• 希望读者看完后有什么感受？&#10;• 有什么现实意义或思考？" style="width: 100%; height: 100px; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${novel ? escapeHtml(novel.theme) : ''}</textarea>
                    </div>

                    <div style="background: rgba(255,255,255,0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">💭 灵感笔记</div>
                        <textarea id="novelNotes" placeholder="记录任何灵感碎片：&#10;• 场景描写&#10;• 对话片段&#10;• 想要埋下的伏笔&#10;• 参考素材" style="width: 100%; height: 100px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.9rem; resize: vertical;">${novel ? escapeHtml(novel.notes) : ''}</textarea>
                    </div>

                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeNovelPopup()">取消</button>
                        ${novel ? `<button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #c4679c, #8b5e9e);" onclick="deleteNovelOutline(${inlineHandlerArg(novel.id)})">删除</button>` : ''}
                        <button class="add-btn" style="flex: 2; background: linear-gradient(135deg, #e88a4c, #d470a0);" onclick="saveNovelOutline(${inlineHandlerArg(novelId)})">保存大纲</button>
                    </div>
                </div>
            `;
            document.body.appendChild(novelCurrentPopup);
        }

        function saveNovelOutline(novelId) {
            const title = document.getElementById('novelTitle').value.trim();
            const genre = document.getElementById('novelGenre').value;
            const length = document.getElementById('novelLength').value;
            const concept = document.getElementById('novelConcept').value.trim();
            const protagonist = document.getElementById('novelProtagonist').value.trim();
            const antagonist = document.getElementById('novelAntagonist').value.trim();
            const supporting = document.getElementById('novelSupporting').value.trim();
            const structure = document.getElementById('novelStructure').value.trim();
            const plotPoints = document.getElementById('novelPlotPoints').value.trim();
            const theme = document.getElementById('novelTheme').value.trim();
            const notes = document.getElementById('novelNotes').value.trim();

            if (!title) {
                alert('请填写小说标题！');
                return;
            }

            let novels = JSON.parse(localStorage.getItem('vitaflow_novel_outlines') || '[]');

            if (novelId && novelId !== 'null') {
                const index = novels.findIndex(n => n.id === novelId);
                if (index >= 0) {
                    novels[index] = {
                        ...novels[index],
                        title,
                        genre,
                        length,
                        concept,
                        protagonist,
                        antagonist,
                        supporting,
                        structure,
                        plotPoints,
                        theme,
                        notes,
                        date: new Date().toISOString()
                    };
                }
            } else {
                novels.push({
                    id: Date.now().toString(),
                    title,
                    genre,
                    length,
                    concept,
                    protagonist,
                    antagonist,
                    supporting,
                    structure,
                    plotPoints,
                    theme,
                    notes,
                    date: new Date().toISOString()
                });
            }

            localStorage.setItem('vitaflow_novel_outlines', JSON.stringify(novels));

            closeNovelPopup();

            renderNovelOutlines();
            updateNovelOutlineCount();
        }

        function deleteNovelOutline(novelId) {
            if (!confirm('确定要删除这个小说大纲吗？')) return;

            let novels = JSON.parse(localStorage.getItem('vitaflow_novel_outlines') || '[]');
            novels = novels.filter(n => n.id !== novelId);
            localStorage.setItem('vitaflow_novel_outlines', JSON.stringify(novels));

            closeNovelPopup();

            renderNovelOutlines();
            updateNovelOutlineCount();
        }

        function searchNovelOutlines() {
            const term = document.getElementById('novelSearch').value.trim();
            renderNovelOutlines(term);
        }

        function updateNovelOutlineCount() {
            const novels = JSON.parse(localStorage.getItem('vitaflow_novel_outlines') || '[]');
            const el = document.getElementById('novelOutlineCount');
            if (el) {
                el.textContent = novels.length + ' 个大纲';
            }
        }

        // 学习模块（对标分析/IP商业分析/新技能学习）
        let learningCurrentCategory = null;
        let learningCurrentType = null;
        let learningCurrentPopup = null;

        function closeLearningPopup() {
            if (learningCurrentPopup) {
                learningCurrentPopup.remove();
                learningCurrentPopup = null;
            }
        }

        function openLearningDetail(type) {
            learningCurrentType = type;
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('learningPage').classList.add('active');

            const titles = { benchmark: '🎯 对标分析', business: '💼 IP商业分析', skills: '🎨 新技能学习' };
            const icons = { benchmark: '🎯', business: '💼', skills: '🎨' };
            document.getElementById('learningPageTitle').textContent = titles[type] || '学习笔记';
            document.getElementById('learningIcon').textContent = icons[type] || '📚';

            learningCurrentCategory = null;
            document.getElementById('learningCurrentTitle').textContent = '📝 全部笔记';
            renderLearningCategories();
            renderLearningNotes();
            updateLearningCount();
        }

        function renderLearningCategories() {
            const categories = JSON.parse(localStorage.getItem('vitaflow_learning_categories') || '[]');
            const notes = JSON.parse(localStorage.getItem('vitaflow_learning_notes') || '[]');
            const typeCategories = categories.filter(c => c.type === learningCurrentType);

            let html = `
                <div onclick="selectLearningCategory(null)" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${learningCurrentCategory === null ? 'background: linear-gradient(135deg, #667eea, #764ba2); color: white;' : 'background: rgba(102, 126, 234, 0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(102,126,234,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(102,126,234,0.1)'">
                    📂 全部笔记 <span style="float: right; font-size: 0.8rem;">${notes.filter(n => n.type === learningCurrentType).length}</span>
                </div>
            `;

            typeCategories.forEach(cat => {
                const count = notes.filter(n => n.category === cat.id && n.type === learningCurrentType).length;
                html += `
                    <div onclick="selectLearningCategory(${inlineHandlerArg(cat.id)})" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${learningCurrentCategory === cat.id ? 'background: linear-gradient(135deg, #667eea, #764ba2); color: white;' : 'background: rgba(102,126,234,0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(102,126,234,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(102,126,234,0.1)'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</span>
                            <div style="display: flex; gap: 4px;">
                                <span style="font-size: 0.8rem;">${count}</span>
                                <button onclick="event.stopPropagation(); deleteLearningCategory(${inlineHandlerArg(cat.id)})" style="background: none; border: none; cursor: pointer; opacity: 0.6;" title="删除">×</button>
                            </div>
                        </div>
                    </div>
                `;
            });

            document.getElementById('learningCategories').innerHTML = html;
        }

        function selectLearningCategory(catId) {
            learningCurrentCategory = catId;
            const categories = JSON.parse(localStorage.getItem('vitaflow_learning_categories') || '[]');
            if (catId === null) {
                document.getElementById('learningCurrentTitle').textContent = '📝 全部笔记';
            } else {
                const cat = categories.find(c => c.id === catId);
                document.getElementById('learningCurrentTitle').textContent = `📝 ${cat ? cat.emoji + ' ' + cat.name : ''}`;
            }
            renderLearningCategories();
            renderLearningNotes();
        }

        function addLearningCategory() {
            const name = prompt('请输入分类名称：');
            if (!name) return;
            const emoji = prompt('请输入表情符号：') || '📌';

            const categories = JSON.parse(localStorage.getItem('vitaflow_learning_categories') || '[]');
            categories.push({ id: Date.now().toString(), name, emoji, type: learningCurrentType });
            localStorage.setItem('vitaflow_learning_categories', JSON.stringify(categories));

            renderLearningCategories();
        }

	        function deleteLearningCategory(catId) {
	            const categories = JSON.parse(localStorage.getItem('vitaflow_learning_categories') || '[]');
	            const categoryIndex = categories.findIndex(c => c.id === catId);
	            if (categoryIndex < 0) return;
	            if (!confirm('确定要删除这个分类吗？笔记不会被删除。')) return;

            const notes = JSON.parse(localStorage.getItem('vitaflow_learning_notes') || '[]');
            notes.forEach(note => {
                if (note.category === catId) note.category = null;
            });
            localStorage.setItem('vitaflow_learning_notes', JSON.stringify(notes));

	            categories.splice(categoryIndex, 1);
            localStorage.setItem('vitaflow_learning_categories', JSON.stringify(categories));

            renderLearningCategories();
            renderLearningNotes();
        }

        function renderLearningNotes(searchTerm = '') {
            const notes = JSON.parse(localStorage.getItem('vitaflow_learning_notes') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_learning_categories') || '[]');

            let filtered = notes.filter(n => n.type === learningCurrentType);
            if (learningCurrentCategory) {
                filtered = filtered.filter(n => n.category === learningCurrentCategory);
            }
            if (searchTerm) {
                filtered = filtered.filter(n => n.title.includes(searchTerm) || n.content.includes(searchTerm));
            }

            if (filtered.length === 0) {
                document.getElementById('learningNotes').innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #8b7a7a;">
                        <div style="font-size: 3rem; margin-bottom: 12px;">📝</div>
                        <div>暂无笔记</div>
                    </div>
                `;
                return;
            }

            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

            let html = '';
            filtered.forEach(note => {
                const cat = categories.find(c => c.id === note.category);
                const dateStr = new Date(note.date).toLocaleDateString('zh-CN');
                const preview = note.content.slice(0, 80) + (note.content.length > 80 ? '...' : '');

                html += `
                    <div onclick="openLearningEditor(${inlineHandlerArg(note.id)})" style="background: rgba(255,255,255,0.7); border-radius: 16px; padding: 16px; cursor: pointer; border: 1px solid rgba(102, 126, 234, 0.2);" onmouseover="this.style.background='rgba(102,126,234,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 8px; font-size: 1rem;">${escapeHtml(note.title)}</div>
                        <div style="font-size: 0.85rem; color: #5a4a5a; line-height: 1.5; margin-bottom: 10px; white-space: pre-wrap;">${escapeHtml(preview)}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 0.75rem; color: #8b7a7a;">${dateStr}</div>
                            ${cat ? `<div style="font-size: 0.75rem; background: rgba(102,126,234,0.2); padding: 2px 8px; border-radius: 8px;">${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</div>` : ''}
                        </div>
                    </div>
                `;
            });

            document.getElementById('learningNotes').innerHTML = html;
        }

        function openLearningEditor(noteId = null) {
            closeLearningPopup();

            const notes = JSON.parse(localStorage.getItem('vitaflow_learning_notes') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_learning_categories') || '[]');
            const note = noteId ? notes.find(n => n.id === noteId) : null;

            const typeLabels = { benchmark: '对标分析', business: 'IP商业分析', skills: '新技能学习' };

            learningCurrentPopup = document.createElement('div');
            learningCurrentPopup.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center;';
            learningCurrentPopup.onclick = function(e) { if (e.target === this) closeLearningPopup(); };

            const saveFunc = 'saveLearningNote(' + inlineHandlerArg(note ? note.id : null) + ')';

            learningCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.3rem; color: #6a4a7a;">${note ? '✏️ 编辑笔记' : '📝 新建笔记'} - ${typeLabels[learningCurrentType]}</div>
                        <button onclick="closeLearningPopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">标题</label>
                        <input type="text" id="learningNoteTitle" placeholder="输入笔记标题..." style="width: 100%; padding: 12px; border: 2px solid rgba(102,126,234,0.3); border-radius: 12px; font-size: 1rem;" value="${note ? escapeHtml(note.title) : ''}">
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">归类（可选）</label>
                        <select id="learningCategory" style="width: 100%; padding: 12px; border: 2px solid rgba(102,126,234,0.3); border-radius: 12px; font-size: 1rem;">
                            <option value="">不归类</option>
                            ${categories.filter(c => c.type === learningCurrentType).map(c => `<option value="${escapeHtml(c.id)}" ${note && note.category === c.id ? 'selected' : ''}>${escapeHtml(c.emoji)} ${escapeHtml(c.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">笔记内容</label>
                        <textarea id="learningContent" placeholder="输入笔记内容..." style="width: 100%; height: 200px; padding: 12px; border: 2px solid rgba(102,126,234,0.3); border-radius: 12px; font-size: 1rem; resize: vertical;">${note ? escapeHtml(note.content) : ''}</textarea>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeLearningPopup()">取消</button>
                        ${note ? `<button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #c4679c, #8b5e9e);" onclick="deleteLearningNote(${inlineHandlerArg(note.id)})">删除</button>` : ''}
                        <button class="add-btn" style="flex: 2; background: linear-gradient(135deg, #667eea, #764ba2);" onclick="${saveFunc}">保存笔记</button>
                    </div>
                </div>
            `;
            document.body.appendChild(learningCurrentPopup);
        }

        function saveLearningNote(noteId) {
            const title = document.getElementById('learningNoteTitle').value.trim();
            const content = document.getElementById('learningContent').value.trim();
            const category = document.getElementById('learningCategory').value;

            if (!title) { alert('请输入笔记标题！'); return; }

            let notes = JSON.parse(localStorage.getItem('vitaflow_learning_notes') || '[]');

            if (noteId !== null && noteId !== undefined && noteId !== 'null') {
                const index = notes.findIndex(n => n.id === noteId);
                if (index >= 0) {
                    notes[index] = { ...notes[index], title, content, category: category || null, date: new Date().toISOString() };
                }
            } else {
                notes.push({ id: Date.now().toString(), title, content, category: category || null, type: learningCurrentType, date: new Date().toISOString() });
            }

            localStorage.setItem('vitaflow_learning_notes', JSON.stringify(notes));
            closeLearningPopup();
            renderLearningNotes();
            renderLearningCategories();
            updateLearningCount();
        }

        function deleteLearningNote(noteId) {
            if (!confirm('确定要删除这条笔记吗？')) return;
            let notes = JSON.parse(localStorage.getItem('vitaflow_learning_notes') || '[]');
            notes = notes.filter(n => n.id !== noteId);
            localStorage.setItem('vitaflow_learning_notes', JSON.stringify(notes));
            closeLearningPopup();
            renderLearningNotes();
            renderLearningCategories();
            updateLearningCount();
        }

        function searchLearningNotes() {
            const term = document.getElementById('learningSearch').value.trim();
            renderLearningNotes(term);
        }

        function updateLearningCount() {
            const notes = JSON.parse(localStorage.getItem('vitaflow_learning_notes') || '[]');
            const counts = { benchmark: 0, business: 0, skills: 0 };
            notes.forEach(n => { if (counts[n.type] !== undefined) counts[n.type]++; });
            const ids = { benchmark: 'benchmarkCount', business: 'businessCount', skills: 'skillsCount' };
            Object.keys(counts).forEach(type => {
                const el = document.getElementById(ids[type]);
                if (el) el.textContent = counts[type] + ' 个笔记';
            });
        }

        // 读书笔记模块
        let readingCurrentCategory = null;
        let readingCurrentPopup = null;

        function closeReadingPopup() {
            if (readingCurrentPopup) {
                readingCurrentPopup.remove();
                readingCurrentPopup = null;
            }
        }

        function openReadingNoteDetail() {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('readingNotePage').classList.add('active');
            readingCurrentCategory = null;
            document.getElementById('readingCurrentTitle').textContent = '📝 全部书籍';
            renderReadingCategories();
            renderReadingNotes();
            updateReadingNoteCount();
        }

        function renderReadingCategories() {
            const categories = JSON.parse(localStorage.getItem('vitaflow_reading_categories') || '[]');
            const notes = JSON.parse(localStorage.getItem('vitaflow_reading_notes') || '[]');

            let html = `
                <div onclick="selectReadingCategory(null)" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${readingCurrentCategory === null ? 'background: linear-gradient(135deg, #74ebd5, #9face6); color: white;' : 'background: rgba(116, 235, 213, 0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(116,235,213,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(116,235,213,0.1)'">
                    📚 全部书籍 <span style="float: right; font-size: 0.8rem;">${notes.length}</span>
                </div>
            `;

            categories.forEach(cat => {
                const count = notes.filter(n => n.category === cat.id).length;
                html += `
                    <div onclick="selectReadingCategory(${inlineHandlerArg(cat.id)})" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${readingCurrentCategory === cat.id ? 'background: linear-gradient(135deg, #74ebd5, #9face6); color: white;' : 'background: rgba(116,235,213,0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(116,235,213,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(116,235,213,0.1)'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</span>
                            <div style="display: flex; gap: 4px;">
                                <span style="font-size: 0.8rem;">${count}</span>
                                <button onclick="event.stopPropagation(); deleteReadingCategory(${inlineHandlerArg(cat.id)})" style="background: none; border: none; cursor: pointer; opacity: 0.6;" title="删除">×</button>
                            </div>
                        </div>
                    </div>
                `;
            });

            document.getElementById('readingCategories').innerHTML = html;
        }

        function selectReadingCategory(catId) {
            readingCurrentCategory = catId;
            const categories = JSON.parse(localStorage.getItem('vitaflow_reading_categories') || '[]');
            if (catId === null) {
                document.getElementById('readingCurrentTitle').textContent = '📚 全部书籍';
            } else {
                const cat = categories.find(c => c.id === catId);
                document.getElementById('readingCurrentTitle').textContent = `📚 ${cat ? cat.emoji + ' ' + cat.name : ''}`;
            }
            renderReadingCategories();
            renderReadingNotes();
        }

        function addReadingCategory() {
            const name = prompt('请输入书籍分类名称（如：小说、心理学、技术类）：');
            if (!name) return;
            const emoji = prompt('请输入表情符号：') || '📖';

            const categories = JSON.parse(localStorage.getItem('vitaflow_reading_categories') || '[]');
            categories.push({ id: Date.now().toString(), name, emoji });
            localStorage.setItem('vitaflow_reading_categories', JSON.stringify(categories));

            renderReadingCategories();
        }

	        function deleteReadingCategory(catId) {
	            const categories = JSON.parse(localStorage.getItem('vitaflow_reading_categories') || '[]');
	            const categoryIndex = categories.findIndex(c => c.id === catId);
	            if (categoryIndex < 0) return;
	            if (!confirm('确定要删除这个分类吗？笔记不会被删除。')) return;

            const notes = JSON.parse(localStorage.getItem('vitaflow_reading_notes') || '[]');
            notes.forEach(note => { if (note.category === catId) note.category = null; });
            localStorage.setItem('vitaflow_reading_notes', JSON.stringify(notes));

	            categories.splice(categoryIndex, 1);
            localStorage.setItem('vitaflow_reading_categories', JSON.stringify(categories));

            renderReadingCategories();
            renderReadingNotes();
        }

        function renderReadingNotes(searchTerm = '') {
            const notes = JSON.parse(localStorage.getItem('vitaflow_reading_notes') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_reading_categories') || '[]');

            let filtered = [...notes];
            if (readingCurrentCategory) {
                filtered = filtered.filter(n => n.category === readingCurrentCategory);
            }
            if (searchTerm) {
                filtered = filtered.filter(n => n.bookTitle.includes(searchTerm) || n.thoughts.includes(searchTerm) || n.summary.includes(searchTerm));
            }

            if (filtered.length === 0) {
                document.getElementById('readingNotes').innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #8b7a7a;">
                        <div style="font-size: 3rem; margin-bottom: 12px;">📖</div>
                        <div>暂无读书笔记</div>
                    </div>
                `;
                return;
            }

            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

            let html = '';
            filtered.forEach(note => {
                const cat = categories.find(c => c.id === note.category);
                const dateStr = new Date(note.date).toLocaleDateString('zh-CN');
                const progress = Math.max(0, Math.min(100, Number(note.progress) || 0));

                html += `
                    <div onclick="openReadingEditor(${inlineHandlerArg(note.id)})" style="background: rgba(255,255,255,0.7); border-radius: 16px; padding: 16px; cursor: pointer; border: 1px solid rgba(116, 235, 213, 0.3);" onmouseover="this.style.background='rgba(116,235,213,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 8px; font-size: 1rem;">📖 ${escapeHtml(note.bookTitle)}</div>
                        <div style="font-size: 0.85rem; color: #5a4a5a; margin-bottom: 8px;">章节：${escapeHtml(note.chapter) || '未设置'}</div>
                        <div style="background: rgba(116,235,213,0.2); border-radius: 8px; height: 6px; margin-bottom: 8px;">
                            <div style="background: linear-gradient(135deg, #74ebd5, #9face6); height: 100%; border-radius: 8px; width: ${progress}%;"></div>
                        </div>
                        <div style="font-size: 0.75rem; color: #8b7a7a; margin-bottom: 8px;">阅读进度：${progress}%</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 0.75rem; color: #8b7a7a;">${dateStr}</div>
                            ${cat ? `<div style="font-size: 0.75rem; background: rgba(116,235,213,0.3); padding: 2px 8px; border-radius: 8px;">${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</div>` : ''}
                        </div>
                    </div>
                `;
            });

            document.getElementById('readingNotes').innerHTML = html;
        }

        function openReadingEditor(noteId = null) {
            closeReadingPopup();

            const notes = JSON.parse(localStorage.getItem('vitaflow_reading_notes') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_reading_categories') || '[]');
            const note = noteId ? notes.find(n => n.id === noteId) : null;
            const progress = note ? Math.max(0, Math.min(100, Number(note.progress) || 0)) : 0;

            readingCurrentPopup = document.createElement('div');
            readingCurrentPopup.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center;';
            readingCurrentPopup.onclick = function(e) { if (e.target === this) closeReadingPopup(); };

            readingCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.3rem; color: #6a4a7a;">${note ? '✏️ 编辑读书笔记' : '📖 新建读书笔记'}</div>
                        <button onclick="closeReadingPopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>

                    <div style="background: linear-gradient(135deg, rgba(116,235,213,0.1), rgba(159,206,230,0.1)); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">📚 书籍信息</div>
                        <div style="margin-bottom: 12px;">
                            <input type="text" id="readingBookTitle" placeholder="书名：《...》" style="width: 100%; padding: 12px; border: 2px solid rgba(116,235,213,0.3); border-radius: 12px; font-size: 1rem;" value="${note ? escapeHtml(note.bookTitle) : ''}">
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <div style="flex: 1;">
                                <input type="text" id="readingChapter" placeholder="当前章节" style="width: 100%; padding: 12px; border: 2px solid rgba(116,235,213,0.3); border-radius: 12px; font-size: 1rem;" value="${note ? escapeHtml(note.chapter) : ''}">
                            </div>
                            <div style="flex: 1;">
                                <select id="readingCategorySelect" style="width: 100%; padding: 12px; border: 2px solid rgba(116,235,213,0.3); border-radius: 12px; font-size: 1rem;">
                                    <option value="">选择分类</option>
                                    ${categories.map(c => `<option value="${escapeHtml(c.id)}" ${note && note.category === c.id ? 'selected' : ''}>${escapeHtml(c.emoji)} ${escapeHtml(c.name)}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div style="margin-top: 12px;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 8px;">阅读进度：<span id="readingProgressValue">${progress}</span>%</div>
                            <input type="range" id="readingProgress" min="0" max="100" value="${progress}" oninput="document.getElementById('readingProgressValue').textContent = this.value" style="width: 100%;">
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">📝 章节小结</div>
                        <textarea id="readingSummary" placeholder="用自己的话总结这一章节/部分的核心内容..." style="width: 100%; height: 100px; padding: 12px; border: 2px solid rgba(116,235,213,0.2); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.summary) : ''}</textarea>
                    </div>

                    <div style="background: linear-gradient(135deg, rgba(116,235,213,0.1), rgba(159,206,230,0.1)); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">💡 思考与感悟</div>
                        <textarea id="readingThoughts" placeholder="这一章节引发了哪些思考？&#10;• 与已有知识有什么联系？&#10;• 有什么疑问或困惑？&#10;• 对实际生活有什么启发？" style="width: 100%; height: 120px; padding: 12px; border: 2px solid rgba(116,235,213,0.3); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.thoughts) : ''}</textarea>
                    </div>

                    <div style="background: rgba(255,255,255,0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">📒 摘录与笔记</div>
                        <textarea id="readingQuotes" placeholder="记录喜欢的段落、金句或重要知识点..." style="width: 100%; height: 100px; padding: 12px; border: 2px solid rgba(116,235,213,0.2); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.quotes) : ''}</textarea>
                    </div>

                    <div style="background: linear-gradient(135deg, rgba(116,235,213,0.1), rgba(159,206,230,0.1)); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">🎯 下一步行动</div>
                        <textarea id="readingAction" placeholder="基于阅读内容，接下来要做什么？&#10;• 继续阅读下一章节&#10;• 查找相关资料&#10;• 实践书中的方法" style="width: 100%; height: 80px; padding: 12px; border: 2px solid rgba(116,235,213,0.3); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.action) : ''}</textarea>
                    </div>

                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeReadingPopup()">取消</button>
                        ${note ? `<button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #c4679c, #8b5e9e);" onclick="deleteReadingNote(${inlineHandlerArg(note.id)})">删除</button>` : ''}
                        <button class="add-btn" style="flex: 2; background: linear-gradient(135deg, #74ebd5, #9face6);" onclick="saveReadingNote(${inlineHandlerArg(note ? note.id : null)})">保存笔记</button>
                    </div>
                </div>
            `;
            document.body.appendChild(readingCurrentPopup);
        }

        function saveReadingNote(noteId) {
            const bookTitle = document.getElementById('readingBookTitle').value.trim();
            const chapter = document.getElementById('readingChapter').value.trim();
            const category = document.getElementById('readingCategorySelect').value;
            const progress = parseInt(document.getElementById('readingProgress').value);
            const summary = document.getElementById('readingSummary').value.trim();
            const thoughts = document.getElementById('readingThoughts').value.trim();
            const quotes = document.getElementById('readingQuotes').value.trim();
            const action = document.getElementById('readingAction').value.trim();

            if (!bookTitle) { alert('请输入书名！'); return; }

            let notes = JSON.parse(localStorage.getItem('vitaflow_reading_notes') || '[]');

            if (noteId && noteId !== 'null') {
                const index = notes.findIndex(n => n.id === noteId);
                if (index >= 0) {
                    notes[index] = { ...notes[index], bookTitle, chapter, category: category || null, progress, summary, thoughts, quotes, action, date: new Date().toISOString() };
                }
            } else {
                notes.push({ id: Date.now().toString(), bookTitle, chapter, category: category || null, progress, summary, thoughts, quotes, action, date: new Date().toISOString() });
            }

            localStorage.setItem('vitaflow_reading_notes', JSON.stringify(notes));
            closeReadingPopup();
            renderReadingNotes();
            renderReadingCategories();
            updateReadingNoteCount();
        }

        function deleteReadingNote(noteId) {
            if (!confirm('确定要删除这条读书笔记吗？')) return;
            let notes = JSON.parse(localStorage.getItem('vitaflow_reading_notes') || '[]');
            notes = notes.filter(n => n.id !== noteId);
            localStorage.setItem('vitaflow_reading_notes', JSON.stringify(notes));
            closeReadingPopup();
            renderReadingNotes();
            renderReadingCategories();
            updateReadingNoteCount();
        }

        function searchReadingNotes() {
            const term = document.getElementById('readingSearch').value.trim();
            renderReadingNotes(term);
        }

        function updateReadingNoteCount() {
            const notes = JSON.parse(localStorage.getItem('vitaflow_reading_notes') || '[]');
            const el = document.getElementById('readingNoteCount');
            if (el) el.textContent = notes.length + ' 个笔记';
        }

        // 电影鉴赏模块
        let filmCurrentCategory = null;
        let filmCurrentPopup = null;
        let filmImageData = [];

        function closeFilmPopup() {
            if (filmCurrentPopup) {
                filmCurrentPopup.remove();
                filmCurrentPopup = null;
                filmImageData = [];
            }
        }

        function openFilmDetail() {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('filmPage').classList.add('active');
            filmCurrentCategory = null;
            document.getElementById('filmCurrentTitle').textContent = '🎬 全部电影';
            renderFilmCategories();
            renderFilmNotes();
            updateFilmCount();
        }

        function renderFilmCategories() {
            const categories = JSON.parse(localStorage.getItem('vitaflow_film_categories') || '[]');
            const notes = JSON.parse(localStorage.getItem('vitaflow_film_notes') || '[]');

            let html = `
                <div onclick="selectFilmCategory(null)" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${filmCurrentCategory === null ? 'background: linear-gradient(135deg, #e88a4c, #d470a0); color: white;' : 'background: rgba(232,138,76,0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(232,138,76,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(232,138,76,0.1)'">
                    🎬 全部电影 <span style="float: right; font-size: 0.8rem;">${notes.length}</span>
                </div>
            `;

            categories.forEach(cat => {
                const count = notes.filter(n => n.category === cat.id).length;
                html += `
                    <div onclick="selectFilmCategory(${inlineHandlerArg(cat.id)})" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${filmCurrentCategory === cat.id ? 'background: linear-gradient(135deg, #e88a4c, #d470a0); color: white;' : 'background: rgba(232,138,76,0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(232,138,76,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(232,138,76,0.1)'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</span>
                            <div style="display: flex; gap: 4px;">
                                <span style="font-size: 0.8rem;">${count}</span>
                                <button onclick="event.stopPropagation(); deleteFilmCategory(${inlineHandlerArg(cat.id)})" style="background: none; border: none; cursor: pointer; opacity: 0.6;" title="删除">×</button>
                            </div>
                        </div>
                    </div>
                `;
            });

            document.getElementById('filmCategories').innerHTML = html;
        }

        function selectFilmCategory(catId) {
            filmCurrentCategory = catId;
            const categories = JSON.parse(localStorage.getItem('vitaflow_film_categories') || '[]');
            if (catId === null) {
                document.getElementById('filmCurrentTitle').textContent = '🎬 全部电影';
            } else {
                const cat = categories.find(c => c.id === catId);
                document.getElementById('filmCurrentTitle').textContent = `🎬 ${cat ? cat.emoji + ' ' + cat.name : ''}`;
            }
            renderFilmCategories();
            renderFilmNotes();
        }

        function addFilmCategory() {
            const name = prompt('请输入电影分类名称（如：剧情片、纪录片、科幻片）：');
            if (!name) return;
            const emoji = prompt('请输入表情符号：') || '🎬';

            const categories = JSON.parse(localStorage.getItem('vitaflow_film_categories') || '[]');
            categories.push({ id: Date.now().toString(), name, emoji });
            localStorage.setItem('vitaflow_film_categories', JSON.stringify(categories));

            renderFilmCategories();
        }

	        function deleteFilmCategory(catId) {
	            const categories = JSON.parse(localStorage.getItem('vitaflow_film_categories') || '[]');
	            const categoryIndex = categories.findIndex(c => c.id === catId);
	            if (categoryIndex < 0) return;
	            if (!confirm('确定要删除这个分类吗？笔记不会被删除。')) return;

            const notes = JSON.parse(localStorage.getItem('vitaflow_film_notes') || '[]');
            notes.forEach(note => { if (note.category === catId) note.category = null; });
            localStorage.setItem('vitaflow_film_notes', JSON.stringify(notes));

	            categories.splice(categoryIndex, 1);
            localStorage.setItem('vitaflow_film_categories', JSON.stringify(categories));

            renderFilmCategories();
            renderFilmNotes();
        }

        function renderFilmNotes(searchTerm = '') {
            const notes = JSON.parse(localStorage.getItem('vitaflow_film_notes') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_film_categories') || '[]');

            let filtered = [...notes];
            if (filmCurrentCategory) {
                filtered = filtered.filter(n => n.category === filmCurrentCategory);
            }
            if (searchTerm) {
                filtered = filtered.filter(n => n.filmTitle.includes(searchTerm) || n.director.includes(searchTerm) || n.reflection.includes(searchTerm));
            }

            if (filtered.length === 0) {
                document.getElementById('filmNotes').innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #8b7a7a;">
                        <div style="font-size: 3rem; margin-bottom: 12px;">🎬</div>
                        <div>暂无电影笔记</div>
                    </div>
                `;
                return;
            }

            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

            let html = '';
            filtered.forEach(note => {
                const cat = categories.find(c => c.id === note.category);
                const dateStr = new Date(note.date).toLocaleDateString('zh-CN');
                const preview = note.reflection ? note.reflection.slice(0, 60) + (note.reflection.length > 60 ? '...' : '') : '';
                const rating = Math.max(0, Math.min(10, Number.parseInt(note.rating, 10) || 0));

                html += `
                    <div onclick="openFilmEditor(${inlineHandlerArg(note.id)})" style="background: rgba(255,255,255,0.7); border-radius: 16px; padding: 16px; cursor: pointer; border: 1px solid rgba(232,138,76,0.3);" onmouseover="this.style.background='rgba(232,138,76,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                        ${note.images && note.images.length > 0 ? `<div style="width: 100%; height: 100px; border-radius: 12px; overflow: hidden; margin-bottom: 12px; background: rgba(232,138,76,0.1);"><img src="${escapeHtml(note.images[0])}" style="width: 100%; height: 100%; object-fit: cover;"></div>` : ''}
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 8px; font-size: 1rem;">🎬 ${escapeHtml(note.filmTitle)}</div>
                        <div style="font-size: 0.85rem; color: #5a4a5a; margin-bottom: 8px;">导演：${escapeHtml(note.director) || '未知'}</div>
                        <div style="font-size: 0.85rem; color: #5a4a5a; margin-bottom: 8px;">评分：${'⭐'.repeat(rating)}</div>
                        ${preview ? `<div style="font-size: 0.85rem; color: #5a4a5a; line-height: 1.4;">${escapeHtml(preview)}</div>` : ''}
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                            <div style="font-size: 0.75rem; color: #8b7a7a;">${dateStr}</div>
                            ${cat ? `<div style="font-size: 0.75rem; background: rgba(232,138,76,0.2); padding: 2px 8px; border-radius: 8px;">${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</div>` : ''}
                        </div>
                    </div>
                `;
            });

            document.getElementById('filmNotes').innerHTML = html;
        }

        function openFilmEditor(noteId = null) {
            closeFilmPopup();

            const notes = JSON.parse(localStorage.getItem('vitaflow_film_notes') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_film_categories') || '[]');
            const note = noteId ? notes.find(n => n.id === noteId) : null;
            const rating = note ? Math.max(1, Math.min(10, Number.parseInt(note.rating, 10) || 5)) : 5;

            filmImageData = note && note.images ? [...note.images] : [];

            filmCurrentPopup = document.createElement('div');
            filmCurrentPopup.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center;';
            filmCurrentPopup.onclick = function(e) { if (e.target === this) closeFilmPopup(); };

            filmCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 900px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.3rem; color: #6a4a7a;">${note ? '✏️ 编辑电影笔记' : '🎬 新建电影笔记'}</div>
                        <button onclick="closeFilmPopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>

                    <div style="background: linear-gradient(135deg, rgba(232,138,76,0.1), rgba(212,112,160,0.1)); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">🎬 电影基本信息</div>
                        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                            <div style="flex: 2;">
                                <input type="text" id="filmTitle" placeholder="电影名称" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;" value="${note ? escapeHtml(note.filmTitle) : ''}">
                            </div>
                            <div style="flex: 1;">
                                <input type="text" id="filmYear" placeholder="年份" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;" value="${note ? escapeHtml(note.year) : ''}">
                            </div>
                        </div>
                        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                            <div style="flex: 1;">
                                <input type="text" id="filmDirector" placeholder="导演" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;" value="${note ? escapeHtml(note.director) : ''}">
                            </div>
                            <div style="flex: 1;">
                                <select id="filmCategory" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;">
                                    <option value="">选择分类</option>
                                    ${categories.map(c => `<option value="${escapeHtml(c.id)}" ${note && note.category === c.id ? 'selected' : ''}>${escapeHtml(c.emoji)} ${escapeHtml(c.name)}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <select id="filmGenre" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;">
                                <option value="">选择类型</option>
                                <option value="剧情" ${note && note.genre === '剧情' ? 'selected' : ''}>剧情</option>
                                <option value="喜剧" ${note && note.genre === '喜剧' ? 'selected' : ''}>喜剧</option>
                                <option value="动作" ${note && note.genre === '动作' ? 'selected' : ''}>动作</option>
                                <option value="科幻" ${note && note.genre === '科幻' ? 'selected' : ''}>科幻</option>
                                <option value="悬疑" ${note && note.genre === '悬疑' ? 'selected' : ''}>悬疑</option>
                                <option value="恐怖" ${note && note.genre === '恐怖' ? 'selected' : ''}>恐怖</option>
                                <option value="爱情" ${note && note.genre === '爱情' ? 'selected' : ''}>爱情</option>
                                <option value="纪录片" ${note && note.genre === '纪录片' ? 'selected' : ''}>纪录片</option>
                                <option value="动画" ${note && note.genre === '动画' ? 'selected' : ''}>动画</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 8px;">个人评分：<span id="filmRatingValue">${rating}</span>/10</div>
                            <input type="range" id="filmRating" min="1" max="10" value="${rating}" oninput="document.getElementById('filmRatingValue').textContent = this.value" style="width: 100%;">
                        </div>
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 8px;">🖼️ 海报/截图上传</label>
                            <input type="file" id="filmImage" accept="image/*" style="display: none;" onchange="previewFilmImage(event)">
                            <button class="add-btn" style="background: rgba(232,138,76,0.2); color: #6a4a7a; border: 1px dashed rgba(232,138,76,0.4);" onclick="document.getElementById('filmImage').click()">上传图片</button>
                            <div id="filmImagePreview" style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 12px;"></div>
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">🎬 导演视角分析</div>
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 6px;">导演想要表达什么？叙事风格有何特点？</div>
                            <textarea id="filmDirectorView" placeholder="从编导角度分析：&#10;• 导演的创作意图&#10;• 叙事结构与节奏把控&#10;• 镜头语言的运用" style="width: 100%; height: 80px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.directorView) : ''}</textarea>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 6px;">技术层面的评价（摄影、剪辑、配乐等）</div>
                            <textarea id="filmTechnical" placeholder="技术分析：&#10;• 摄影风格与画面构图&#10;• 剪辑节奏与转场效果&#10;• 配乐与声音设计" style="width: 100%; height: 80px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.technical) : ''}</textarea>
                        </div>
                    </div>

                    <div style="background: linear-gradient(135deg, rgba(232,138,76,0.1), rgba(212,112,160,0.1)); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">🎭 影视鉴赏视角</div>
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 6px;">主题与内涵解读</div>
                            <textarea id="filmTheme" placeholder="主题分析：&#10;• 核心主题是什么？&#10;• 表达了什么深层含义？&#10;• 与社会/文化有什么联系？" style="width: 100%; height: 80px; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.theme) : ''}</textarea>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 6px;">符号、隐喻与象征手法</div>
                            <textarea id="filmSymbolism" placeholder="符号分析：&#10;• 片中有哪些重要符号？&#10;• 有什么隐喻或象征？&#10;• 色彩/场景有何寓意？" style="width: 100%; height: 80px; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.symbolism) : ''}</textarea>
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">💭 个人感受与反思</div>
                        <textarea id="filmReflection" placeholder="写下你的观影感受：&#10;• 这部电影带给你什么触动？&#10;• 与你之前看过的同类型电影相比如何？&#10;• 会推荐给什么人看？" style="width: 100%; height: 120px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.reflection) : ''}</textarea>
                    </div>

                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeFilmPopup()">取消</button>
                        ${note ? `<button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #c4679c, #8b5e9e);" onclick="deleteFilmNote(${inlineHandlerArg(note.id)})">删除</button>` : ''}
                        <button class="add-btn" style="flex: 2; background: linear-gradient(135deg, #e88a4c, #d470a0);" onclick="saveFilmNote(${inlineHandlerArg(note ? note.id : null)})">保存笔记</button>
                    </div>
                </div>
            `;
            document.body.appendChild(filmCurrentPopup);

            if (filmImageData.length > 0) {
                renderFilmImagePreviews();
            }
        }

        function previewFilmImage(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                filmImageData.push(e.target.result);
                renderFilmImagePreviews();
            };
            reader.readAsDataURL(file);
        }

        function renderFilmImagePreviews() {
            const container = document.getElementById('filmImagePreview');
            if (!container) return;

            container.innerHTML = filmImageData.map((img, idx) => `
                <div style="position: relative; width: 100px; height: 100px;">
                    <img src="${escapeHtml(img)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                    <button onclick="removeFilmImage(${idx})" style="position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; border-radius: 50%; background: #c4679c; color: white; border: none; cursor: pointer; font-size: 14px; line-height: 24px;">×</button>
                </div>
            `).join('');
        }

        function removeFilmImage(idx) {
            filmImageData.splice(idx, 1);
            renderFilmImagePreviews();
        }

        function saveFilmNote(noteId) {
            const filmTitle = document.getElementById('filmTitle').value.trim();
            const year = document.getElementById('filmYear').value.trim();
            const director = document.getElementById('filmDirector').value.trim();
            const genre = document.getElementById('filmGenre').value;
            const rating = parseInt(document.getElementById('filmRating').value);
            const category = document.getElementById('filmCategory').value;
            const directorView = document.getElementById('filmDirectorView').value.trim();
            const technical = document.getElementById('filmTechnical').value.trim();
            const theme = document.getElementById('filmTheme').value.trim();
            const symbolism = document.getElementById('filmSymbolism').value.trim();
            const reflection = document.getElementById('filmReflection').value.trim();

            if (!filmTitle) { alert('请输入电影名称！'); return; }

            let notes = JSON.parse(localStorage.getItem('vitaflow_film_notes') || '[]');

            if (noteId && noteId !== 'null') {
                const index = notes.findIndex(n => n.id === noteId);
                if (index >= 0) {
                    notes[index] = { ...notes[index], filmTitle, year, director, genre, rating, category: category || null, directorView, technical, theme, symbolism, reflection, images: filmImageData, date: new Date().toISOString() };
                }
            } else {
                notes.push({ id: Date.now().toString(), filmTitle, year, director, genre, rating, category: category || null, directorView, technical, theme, symbolism, reflection, images: filmImageData, date: new Date().toISOString() });
            }

            localStorage.setItem('vitaflow_film_notes', JSON.stringify(notes));
            closeFilmPopup();
            renderFilmNotes();
            renderFilmCategories();
            updateFilmCount();
        }

        function deleteFilmNote(noteId) {
            if (!confirm('确定要删除这条电影笔记吗？')) return;
            let notes = JSON.parse(localStorage.getItem('vitaflow_film_notes') || '[]');
            notes = notes.filter(n => n.id !== noteId);
            localStorage.setItem('vitaflow_film_notes', JSON.stringify(notes));
            closeFilmPopup();
            renderFilmNotes();
            renderFilmCategories();
            updateFilmCount();
        }

        function searchFilmNotes() {
            const term = document.getElementById('filmSearch').value.trim();
            renderFilmNotes(term);
        }

        function updateFilmCount() {
            const notes = JSON.parse(localStorage.getItem('vitaflow_film_notes') || '[]');
            const el = document.getElementById('filmCount');
            if (el) el.textContent = notes.length + ' 个笔记';
        }

        // 自媒体运营日历模块
        let mediaCalendarStatsChart = null;

        function initMediaCalendarStorage() {
            if (!localStorage.getItem('vitaflow_media_calendar')) {
                localStorage.setItem('vitaflow_media_calendar', JSON.stringify({}));
            }
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 6);
            document.getElementById('mediaCalendarStartDate').value = formatLocalDate(startDate);
            document.getElementById('mediaCalendarEndDate').value = formatLocalDate(today);
        }

        function renderMediaCalendar() {
            const startDate = document.getElementById('mediaCalendarStartDate').value;
            const endDate = document.getElementById('mediaCalendarEndDate').value;

            if (!startDate || !endDate) {
                alert('请选择开始和结束日期');
                return;
            }

            const start = parseLocalDate(startDate);
            const end = parseLocalDate(endDate);

            if (start > end) {
                alert('开始日期不能晚于结束日期');
                return;
            }

            const data = JSON.parse(localStorage.getItem('vitaflow_media_calendar') || '{}');
            const tableEl = document.getElementById('mediaCalendarTable');

            const dates = [];
            const current = new Date(start);
            while (current <= end) {
                dates.push(formatLocalDate(current));
                current.setDate(current.getDate() + 1);
            }

            let html = `
                <table style="width: 100%; border-collapse: separate; border-spacing: 0 12px;">
                    <thead>
                        <tr style="background: linear-gradient(135deg, rgba(196, 103, 156, 0.1), rgba(139, 94, 158, 0.1));">
                            <th style="padding: 12px 16px; border-radius: 12px 0 0 12px; font-weight: 600; color: #6a4a5a; text-align: left; width: 120px;">日期</th>
                            <th style="padding: 12px 8px; font-weight: 600; color: #ffb347; text-align: center; width: 60px;">抖音</th>
                            <th style="padding: 12px 8px; font-weight: 600; color: #c4679c; text-align: center; width: 60px;">网易</th>
                            <th style="padding: 12px 8px; font-weight: 600; color: #8b5e9e; text-align: center; width: 60px;">大号</th>
                            <th style="padding: 12px 8px; font-weight: 600; color: #a78bfa; text-align: center; width: 60px;">小号</th>
                            <th style="padding: 12px 8px; font-weight: 600; color: #e88a4c; text-align: center; width: 70px;">小小号</th>
                            <th style="padding: 12px 16px; border-radius: 0 12px 12px 0; font-weight: 600; color: #6a4a5a; text-align: left;">运营想法</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            dates.forEach(dateStr => {
                const dateObj = parseLocalDate(dateStr);
                const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                const dayName = dayNames[dateObj.getDay()];
                const dateDisplay = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dayName}`;
                const isToday = dateStr === formatLocalDate();

                const record = data[dateStr] || { douyin: false, wangyi: false, dahao: false, xiaohao: false, xiaoxiaohao: false, notes: '' };

                html += `
                    <tr style="background: ${isToday ? 'rgba(196, 103, 156, 0.15)' : 'rgba(255, 250, 252, 0.7)'}; border-radius: 16px;">
                        <td style="padding: 14px 16px; border-radius: 16px 0 0 16px; font-weight: ${isToday ? '700' : '500'}; color: ${isToday ? '#c4679c' : '#6a4a5a'};">
                            ${dateDisplay}
                            ${isToday ? '<span style="font-size: 0.7rem; background: rgba(196,103,156,0.3); padding: 2px 6px; border-radius: 6px; margin-left: 4px;">今天</span>' : ''}
                        </td>
                        <td style="padding: 14px 8px; text-align: center;">
                            <input type="checkbox" ${record.douyin ? 'checked' : ''} onchange="saveMediaCalendarItem('${dateStr}', 'douyin', this.checked)" style="width: 20px; height: 20px; accent-color: #ffb347; cursor: pointer;">
                        </td>
                        <td style="padding: 14px 8px; text-align: center;">
                            <input type="checkbox" ${record.wangyi ? 'checked' : ''} onchange="saveMediaCalendarItem('${dateStr}', 'wangyi', this.checked)" style="width: 20px; height: 20px; accent-color: #c4679c; cursor: pointer;">
                        </td>
                        <td style="padding: 14px 8px; text-align: center;">
                            <input type="checkbox" ${record.dahao ? 'checked' : ''} onchange="saveMediaCalendarItem('${dateStr}', 'dahao', this.checked)" style="width: 20px; height: 20px; accent-color: #8b5e9e; cursor: pointer;">
                        </td>
                        <td style="padding: 14px 8px; text-align: center;">
                            <input type="checkbox" ${record.xiaohao ? 'checked' : ''} onchange="saveMediaCalendarItem('${dateStr}', 'xiaohao', this.checked)" style="width: 20px; height: 20px; accent-color: #a78bfa; cursor: pointer;">
                        </td>
                        <td style="padding: 14px 8px; text-align: center;">
                            <input type="checkbox" ${record.xiaoxiaohao ? 'checked' : ''} onchange="saveMediaCalendarItem('${dateStr}', 'xiaoxiaohao', this.checked)" style="width: 20px; height: 20px; accent-color: #e88a4c; cursor: pointer;">
                        </td>
                        <td style="padding: 14px 16px; border-radius: 0 16px 16px 0;">
                            <input type="text" value="${record.notes ? escapeHtml(record.notes) : ''}" placeholder="记录运营想法..." onchange="saveMediaCalendarNotes('${dateStr}', this.value)" style="width: 100%; background: rgba(255, 245, 252, 0.9); border: 1px solid rgba(200, 160, 200, 0.3); border-radius: 12px; padding: 8px 12px; color: #4a3a4a; font-size: 0.9rem; outline: none;">
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            tableEl.innerHTML = html;
            renderMediaCalendarStats();
        }

        function saveMediaCalendarItem(dateStr, field, value) {
            const data = JSON.parse(localStorage.getItem('vitaflow_media_calendar') || '{}');
            if (!data[dateStr]) {
                data[dateStr] = { douyin: false, wangyi: false, dahao: false, xiaohao: false, xiaoxiaohao: false, notes: '' };
            }
            data[dateStr][field] = value;
            localStorage.setItem('vitaflow_media_calendar', JSON.stringify(data));
            renderMediaCalendarStats();
        }

        function saveMediaCalendarNotes(dateStr, notes) {
            const data = JSON.parse(localStorage.getItem('vitaflow_media_calendar') || '{}');
            if (!data[dateStr]) {
                data[dateStr] = { douyin: false, wangyi: false, dahao: false, xiaohao: false, xiaoxiaohao: false, notes: '' };
            }
            data[dateStr].notes = notes;
            localStorage.setItem('vitaflow_media_calendar', JSON.stringify(data));
        }

        function renderMediaCalendarStats() {
            const startDate = document.getElementById('mediaCalendarStartDate').value;
            const endDate = document.getElementById('mediaCalendarEndDate').value;

            if (!startDate || !endDate) return;

            const start = parseLocalDate(startDate);
            const end = parseLocalDate(endDate);

            const data = JSON.parse(localStorage.getItem('vitaflow_media_calendar') || '{}');

            let stats = { douyin: 0, wangyi: 0, dahao: 0, xiaohao: 0, xiaoxiaohao: 0 };
            const current = new Date(start);
            while (current <= end) {
                const dateStr = formatLocalDate(current);
                const record = data[dateStr] || { douyin: false, wangyi: false, dahao: false, xiaohao: false, xiaoxiaohao: false };

                if (record.douyin) stats.douyin++;
                if (record.wangyi) stats.wangyi++;
                if (record.dahao) stats.dahao++;
                if (record.xiaohao) stats.xiaohao++;
                if (record.xiaoxiaohao) stats.xiaoxiaohao++;

                current.setDate(current.getDate() + 1);
            }

            document.getElementById('mediaStatsDouyin').textContent = stats.douyin;
            document.getElementById('mediaStatsWangyi').textContent = stats.wangyi;
            document.getElementById('mediaStatsDahao').textContent = stats.dahao;
            document.getElementById('mediaStatsXiaohao').textContent = stats.xiaohao;
            document.getElementById('mediaStatsXiaoxiaohao').textContent = stats.xiaoxiaohao;

            document.getElementById('mediaCalendarStatsContainer').style.display = 'block';

            const ctx = document.getElementById('mediaCalendarStatsChart').getContext('2d');
            if (mediaCalendarStatsChart) mediaCalendarStatsChart.destroy();

            mediaCalendarStatsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['抖音', '网易', '大号', '小号', '小小号'],
                    datasets: [{
                        label: '更新次数',
                        data: [stats.douyin, stats.wangyi, stats.dahao, stats.xiaohao, stats.xiaoxiaohao],
                        backgroundColor: [
                            'rgba(255, 179, 71, 0.6)',
                            'rgba(196, 103, 156, 0.6)',
                            'rgba(139, 94, 158, 0.6)',
                            'rgba(167, 139, 250, 0.6)',
                            'rgba(232, 138, 76, 0.6)'
                        ],
                        borderColor: [
                            '#ffb347',
                            '#c4679c',
                            '#8b5e9e',
                            '#a78bfa',
                            '#e88a4c'
                        ],
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: '时间区间内各平台更新统计',
                            color: '#6a4a5a',
                            font: { size: 14, weight: '600' }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#8b7a7a', font: { size: 12 } },
                            grid: { color: 'rgba(200, 160, 200, 0.2)' }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#8b7a7a', stepSize: 1 },
                            grid: { color: 'rgba(200, 160, 200, 0.2)' }
                        }
                    }
                }
            });
        }

        // ============================================
        // 数据备份 / 单文件携带 / 跨设备迁移 系统
        // ============================================
        let fileHandle = null;
        let jsonFileHandle = null;
        let lastSavedDataSnapshot = null;
        let lastSavedJsonDataSnapshot = null;
        let autoSaveEnabled = true;
        let isSaving = false;
        let isSavingJson = false;
        let localSyncAvailable = false;
        let localSyncReady = false;
        let localSyncApplyingRemote = false;
        let localSyncSaveTimer = null;
        let localSyncPollTimer = null;
        let localSyncDirtyTimer = null;
        let localSyncUploading = false;
        let localSyncUploadAgain = false;
	        let localSyncLastUpdatedAt = null;
	        let localSyncLastSyncedSnapshot = null;
	        let localSyncLastRevision = null;
	        let localSyncChangedKeys = new Set();
	        let localSyncDeletedKeys = new Set();
	        let localSyncSupportsPatch = false;
	        let localSyncShouldSeed = false;
	        let localSyncHasRemoteData = false;
	        let localSyncConflict = null;
	        let localSyncForceReplace = false;

        const embeddedRestoreSignatureKey = '__vitaflow_embedded_restore_signature';
	        const localSyncApiPath = '/api/data';
	        const localSyncKeyStorageName = '__vitaflow_sync_key';
	        const localSyncPendingStorageName = '__vitaflow_sync_pending';
	        const localSyncDirtyFallbackIntervalMs = 30000;
	        const structuredBackupDataKeys = new Set([
	            'vitaflow_accounts', 'vitaflow_ads', 'vitaflow_ai_chat', 'vitaflow_analysis',
	            'vitaflow_calendar', 'vitaflow_canvas', 'vitaflow_completed', 'vitaflow_deepseek',
	            'vitaflow_deepseek_categories', 'vitaflow_deepseek_docs', 'vitaflow_emotion_activities',
	            'vitaflow_emotion_notes', 'vitaflow_film', 'vitaflow_film_categories',
	            'vitaflow_film_notes', 'vitaflow_food', 'vitaflow_happiness', 'vitaflow_idea_vault',
	            'vitaflow_ideas', 'vitaflow_ip', 'vitaflow_lazyy', 'vitaflow_learning_categories',
	            'vitaflow_learning_notes', 'vitaflow_literature', 'vitaflow_literature_categories',
	            'vitaflow_literature_docs', 'vitaflow_meaning_quiz', 'vitaflow_media_calendar',
	            'vitaflow_novel', 'vitaflow_novel_outlines', 'vitaflow_pomodoro', 'vitaflow_reading',
	            'vitaflow_reading_categories', 'vitaflow_reading_notes', 'vitaflow_reflection',
	            'vitaflow_reviews', 'vitaflow_rituals', 'vitaflow_sandwich', 'vitaflow_skills',
	            'vitaflow_streak', 'vitaflow_streak_records', 'vitaflow_support', 'vitaflow_todos',
	            'vitaflow_values', 'vitaflow_water', 'vitaflow_writing'
	        ]);

        // 访问口令：优先取地址栏 ?key=，并存入 localStorage 作为后备（该键不以 vitaflow_ 开头，不会被同步出去）
        function getLocalSyncKey() {
            try {
                const search = (typeof location !== 'undefined' && location.search) ? location.search : '';
                const match = search.match(/[?&]key=([^&]+)/);
                if (match) {
                    const key = decodeURIComponent(match[1]);
                    try { localStorage.setItem(localSyncKeyStorageName, key); } catch (e) {}
                    return key;
                }
            } catch (e) {}
            try { return localStorage.getItem(localSyncKeyStorageName) || ''; } catch (e) {}
            return '';
        }

	        function localSyncHeaders(extra) {
	            const headers = Object.assign({}, extra || {});
	            const key = getLocalSyncKey();
	            if (key) headers['x-vitaflow-token'] = key;
	            return headers;
	        }

	        function setLocalSyncPending(pending) {
	            try {
	                if (pending) localStorage.setItem(localSyncPendingStorageName, '1');
	                else localStorage.removeItem(localSyncPendingStorageName);
	            } catch (e) {
	                console.warn('记录本地同步待处理状态失败:', e);
	            }
	        }

	        function hasLocalSyncPending() {
	            try {
	                return localStorage.getItem(localSyncPendingStorageName) === '1';
	            } catch (e) {
	                return false;
	            }
	        }

	        function getEmbeddedDataSignature(data) {
            const embeddedJson = JSON.stringify(data || {});
            let hash = 0;
            for (let i = 0; i < embeddedJson.length; i++) {
                hash = ((hash << 5) - hash + embeddedJson.charCodeAt(i)) | 0;
            }
            return 'v2:' + embeddedJson.length + ':' + hash;
        }

	        function showLocalSyncDiagnostic(message, isError = false) {
            if (typeof document === 'undefined') return;
            let el = document.getElementById('localSyncDiagnostic');
            if (!el && document.body) {
                el = document.createElement('div');
                el.id = 'localSyncDiagnostic';
                el.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:9999;max-width:280px;padding:9px 12px;border-radius:14px;font-size:12px;line-height:1.4;box-shadow:0 8px 24px rgba(40,20,50,.18);background:rgba(255,255,255,.95);border:1px solid rgba(180,140,190,.35);color:#5a3a66;';
                document.body.appendChild(el);
            }
            if (el) {
                el.textContent = message;
                el.style.borderColor = isError ? 'rgba(220,70,70,.45)' : 'rgba(120,170,120,.45)';
                el.style.color = isError ? '#9f2f2f' : '#38633b';
            }
        }

        function markCurrentEmbeddedDataAsRestored() {
            try {
                if (typeof EMBEDDED_DATA !== 'undefined' && EMBEDDED_DATA && typeof EMBEDDED_DATA === 'object') {
                    localStorage.setItem(embeddedRestoreSignatureKey, getEmbeddedDataSignature(EMBEDDED_DATA));
                }
	            } catch (e) {
	                console.warn('记录嵌入数据恢复状态失败:', e);
	            }
	        }

	        function showLocalSyncConflictDiagnostic() {
	            showLocalSyncDiagnostic('检测到其他设备的新版本，请选择保留哪一份。', true);
	            if (typeof document === 'undefined') return;
	            const el = document.getElementById('localSyncDiagnostic');
	            if (!el) return;
	            const actions = document.createElement('div');
	            actions.style.cssText = 'display:flex;gap:6px;margin-top:8px;';
	            const keepLocalButton = document.createElement('button');
	            keepLocalButton.type = 'button';
	            keepLocalButton.textContent = '保留本机';
	            keepLocalButton.style.cssText = 'border:1px solid #8db8d8;background:#eaf6ff;color:#245c82;padding:5px 8px;border-radius:6px;cursor:pointer;';
	            keepLocalButton.addEventListener('click', () => resolveLocalSyncConflict('local'));
	            const useRemoteButton = document.createElement('button');
	            useRemoteButton.type = 'button';
	            useRemoteButton.textContent = '采用服务器';
	            useRemoteButton.style.cssText = 'border:1px solid #b7c1c8;background:#fff;color:#46525a;padding:5px 8px;border-radius:6px;cursor:pointer;';
	            useRemoteButton.addEventListener('click', () => resolveLocalSyncConflict('remote'));
	            actions.appendChild(keepLocalButton);
	            actions.appendChild(useRemoteButton);
	            el.appendChild(actions);
	        }

        // 读取全部 localStorage 数据
        function getAllData() {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('vitaflow_')) {
                    data[k] = localStorage.getItem(k);
                }
            }
            return data;
        }

	        function normalizeBackupData(data) {
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                throw new Error('JSON 根内容必须是对象');
            }
            const normalized = {};
            Object.keys(data).forEach(k => {
                if (k.startsWith('vitaflow_')) {
                    normalized[k] = typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k]);
                }
            });
	            return normalized;
	        }

	        function validateBackupData(normalized) {
	            Object.keys(normalized).forEach(key => {
	                if (!structuredBackupDataKeys.has(key)) return;
	                try {
	                    JSON.parse(normalized[key]);
	                } catch (error) {
	                    throw new Error(key + ' 数据格式损坏，已取消恢复');
	                }
	            });
	        }

	        function writeVitaFlowStorage(normalized) {
	            const currentKeys = [];
	            for (let i = 0; i < localStorage.length; i++) {
	                const key = localStorage.key(i);
	                if (key && key.startsWith('vitaflow_')) currentKeys.push(key);
	            }
	            currentKeys.forEach(key => localStorage.removeItem(key));
	            Object.keys(normalized).forEach(key => localStorage.setItem(key, normalized[key]));
	        }

	        function replaceVitaFlowStorage(normalized) {
	            validateBackupData(normalized);
	            const previousData = getAllData();
	            try {
	                writeVitaFlowStorage(normalized);
	            } catch (error) {
	                try {
	                    writeVitaFlowStorage(previousData);
	                } catch (rollbackError) {
	                    console.error('VitaFlow 数据回滚失败:', rollbackError);
	                    error.message += '；自动回滚也失败：' + rollbackError.message;
	                }
	                throw error;
	            }
	        }

	        function restoreBackupData(data) {
	            const normalized = normalizeBackupData(data);
	            const keys = Object.keys(normalized);
	            if (keys.length === 0) {
	                throw new Error('没有找到 vitaflow_ 开头的数据项');
	            }
	            const wasApplyingRemote = localSyncApplyingRemote;
	            localSyncApplyingRemote = true;
	            try {
	                replaceVitaFlowStorage(normalized);
	                markCurrentEmbeddedDataAsRestored();
	                lastSavedDataSnapshot = JSON.stringify(getAllData());
	                lastSavedJsonDataSnapshot = lastSavedDataSnapshot;
	            } finally {
	                localSyncApplyingRemote = wasApplyingRemote;
	            }
	            if (!wasApplyingRemote) {
	                localSyncChangedKeys.clear();
	                localSyncDeletedKeys.clear();
	                localSyncSupportsPatch = false;
	                setLocalSyncPending(true);
	                scheduleLocalSyncUpload(300);
	            }
	            return keys.length;
	        }

	        function installLocalSyncHook() {
	            if (Storage.prototype.__vitaflowSyncPatched) return;
	            const originalSetItem = Storage.prototype.setItem;
	            const originalRemoveItem = Storage.prototype.removeItem;
	            const originalClear = Storage.prototype.clear;
	            Storage.prototype.setItem = function(key, value) {
	                originalSetItem.call(this, key, value);
	                if (this === localStorage && key && key.startsWith('vitaflow_') && !localSyncApplyingRemote) {
	                    markLocalDataChanged(key);
	                }
	            };
	            Storage.prototype.removeItem = function(key) {
	                const shouldSync = this === localStorage && key && key.startsWith('vitaflow_') && !localSyncApplyingRemote;
	                originalRemoveItem.call(this, key);
	                if (shouldSync) {
	                    markLocalDataChanged(key, true);
	                }
	            };
	            Storage.prototype.clear = function() {
	                const removedKeys = [];
	                if (this === localStorage && !localSyncApplyingRemote) {
	                    for (let i = 0; i < localStorage.length; i++) {
	                        const key = localStorage.key(i);
	                        if (key && key.startsWith('vitaflow_')) removedKeys.push(key);
                    }
                }
                originalClear.call(this);
                removedKeys.forEach(key => markLocalDataChanged(key, true));
            };
            Storage.prototype.__vitaflowSyncPatched = true;
        }

        function isLocalSyncPossible() {
            const browserOnly = /(?:^|[?&])mode=browser(?:&|$)/.test(location.search || '');
            return !browserOnly && (location.protocol === 'http:' || location.protocol === 'https:');
        }

        async function initLocalSync() {
            const nativeSyncGeneration = nativeContext.generation;
            if (!isLocalSyncPossible()) {
                showLocalSyncDiagnostic('当前浏览器本机保存（未启用跨设备同步）');
                return;
            }
            localSyncHasRemoteData = false;
            localSyncConflict = null;
            try {
                const response = await fetch(localSyncApiPath + '?t=' + Date.now(), { cache: 'no-store', headers: localSyncHeaders() });
                if (response.status === 401) throw new Error('缺少访问口令，请用终端里带 ?key= 的地址打开本页面');
                if (!response.ok) throw new Error('HTTP ' + response.status);
                const payload = await response.json();
                const remoteData = normalizeBackupData(payload.data || payload);
                const hasPendingLocalChanges = hasLocalSyncPending();
                localSyncAvailable = true;
                localSyncSupportsPatch = !!(payload.features && payload.features.patch);
                localSyncLastUpdatedAt = payload.updatedAt || null;
                localSyncLastRevision = payload.revision || null;
                if (hasPendingLocalChanges) {
                    localSyncHasRemoteData = true;
                    localSyncLastSyncedSnapshot = JSON.stringify(remoteData);
                    handleLocalSyncConflict({ ...payload, data: remoteData });
                } else if (Object.keys(remoteData).length > 0) {
                    localSyncApplyingRemote = true;
                    try {
                        restoreBackupData(remoteData);
                    } finally {
                        localSyncApplyingRemote = false;
                    }
                    localSyncHasRemoteData = true;
                    localSyncLastSyncedSnapshot = JSON.stringify(getAllData());
                    updateSaveStatus('☁️ 已连接本地同步：' + Object.keys(remoteData).length + ' 项');
                    showLocalSyncDiagnostic('本地同步已连接：' + Object.keys(remoteData).length + ' 项');
                } else {
                    localSyncShouldSeed = true;
                    updateSaveStatus('☁️ 本地同步已连接，等待写入初始数据');
                    showLocalSyncDiagnostic('本地同步已连接：0 项');
                }
            } catch (e) {
                if (nativeSyncGeneration !== nativeContext.generation) return;
                localSyncAvailable = false;
                showLocalSyncDiagnostic('本地同步未连接：' + (e && e.message ? e.message : '无法访问 /api/data'), true);
            }
        }

	        function enableLocalSyncAfterInitialRender() {
	            if (!localSyncAvailable) return;
	            localSyncReady = true;
            if (localSyncLastSyncedSnapshot === null) {
                localSyncLastSyncedSnapshot = JSON.stringify(getAllData());
            }
            if (localSyncShouldSeed) {
                setLocalSyncPending(true);
                scheduleLocalSyncUpload();
            }
            startLocalSyncDirtyWatcher();
            startLocalSyncPolling();
        }

	        function markLocalDataChanged(key, deleted = false) {
	            if (key && key.startsWith('vitaflow_')) {
	                if (deleted) {
	                    localSyncChangedKeys.delete(key);
	                    localSyncDeletedKeys.add(key);
                } else {
                    localSyncDeletedKeys.delete(key);
	                    localSyncChangedKeys.add(key);
	                }
	                setLocalSyncPending(true);
	            }
	            scheduleLocalSyncUpload(300);
	        }

        function syncLocalDataNow(key, deleted = false) {
            if (key && key.startsWith('vitaflow_')) {
                if (deleted) {
                    localSyncChangedKeys.delete(key);
                    localSyncDeletedKeys.add(key);
                } else {
                    localSyncDeletedKeys.delete(key);
                    localSyncChangedKeys.add(key);
                }
                setLocalSyncPending(true);
            }
	            if (!localSyncAvailable || !localSyncReady || localSyncApplyingRemote) {
	                scheduleLocalSyncUpload(300);
	                return;
	            }
	            clearTimeout(localSyncSaveTimer);
	            uploadLocalSyncData();
	        }

	        function scheduleLocalSyncUpload(delay = 1200) {
	            if (!localSyncAvailable || !localSyncReady || localSyncConflict) return;
            clearTimeout(localSyncSaveTimer);
            localSyncSaveTimer = setTimeout(uploadLocalSyncData, delay);
        }

	        function reconcileLocalSyncUpload(uploadedData, serverData) {
            const remoteData = normalizeBackupData(serverData);
            const currentData = getAllData();
            const concurrentKeys = new Set();
            const comparedKeys = new Set([...Object.keys(uploadedData), ...Object.keys(currentData)]);

            comparedKeys.forEach(key => {
                if (uploadedData[key] !== currentData[key]) concurrentKeys.add(key);
            });

            const reconciledData = { ...remoteData };
            concurrentKeys.forEach(key => {
                if (Object.prototype.hasOwnProperty.call(currentData, key)) {
                    reconciledData[key] = currentData[key];
                } else {
                    delete reconciledData[key];
                }
            });

            const beforeApply = JSON.stringify(currentData);
            const wasApplyingRemote = localSyncApplyingRemote;
            localSyncApplyingRemote = true;
            try {
                replaceVitaFlowStorage(reconciledData);
            } finally {
                localSyncApplyingRemote = wasApplyingRemote;
            }

            localSyncChangedKeys.clear();
            localSyncDeletedKeys.clear();
            concurrentKeys.forEach(key => {
                if (Object.prototype.hasOwnProperty.call(currentData, key)) {
                    localSyncChangedKeys.add(key);
                } else {
                    localSyncDeletedKeys.add(key);
                }
            });

            localSyncLastSyncedSnapshot = concurrentKeys.size > 0
                ? JSON.stringify(remoteData)
                : JSON.stringify(getAllData());
	            return beforeApply !== JSON.stringify(getAllData());
	        }

        function handleLocalSyncConflict(payload) {
            const remoteData = normalizeBackupData(payload.data || {});
            localSyncConflict = {
                remoteData,
                revision: payload.revision || null,
                updatedAt: payload.updatedAt || null
            };
            localSyncUploadAgain = false;
            setLocalSyncPending(true);
            updateSaveStatus('⚠️ 检测到同步冲突，等待选择保留版本');
            showLocalSyncConflictDiagnostic();
        }

        async function resolveLocalSyncConflict(choice) {
            if (!localSyncConflict) return;
            const conflict = localSyncConflict;
            if (choice === 'remote') {
                const wasApplyingRemote = localSyncApplyingRemote;
                localSyncApplyingRemote = true;
                try {
                    replaceVitaFlowStorage(conflict.remoteData);
                } finally {
                    localSyncApplyingRemote = wasApplyingRemote;
                }
                localSyncLastRevision = conflict.revision;
                localSyncLastUpdatedAt = conflict.updatedAt;
                localSyncLastSyncedSnapshot = JSON.stringify(getAllData());
                localSyncChangedKeys.clear();
                localSyncDeletedKeys.clear();
                localSyncConflict = null;
                localSyncForceReplace = false;
                localSyncHasRemoteData = Object.keys(conflict.remoteData).length > 0;
                setLocalSyncPending(false);
                lastSavedDataSnapshot = localSyncLastSyncedSnapshot;
                lastSavedJsonDataSnapshot = localSyncLastSyncedSnapshot;
                if (typeof refreshVisibleData === 'function') refreshVisibleData();
                updateSaveStatus('☁️ 已采用服务器版本');
                showLocalSyncDiagnostic('已采用服务器版本，恢复自动同步');
                return;
            }
            if (choice !== 'local') return;
            if (!conflict.revision) {
                showLocalSyncDiagnostic('服务器未返回版本号，暂时无法安全覆盖', true);
                return;
            }
            localSyncLastRevision = conflict.revision;
            localSyncLastUpdatedAt = conflict.updatedAt;
            localSyncLastSyncedSnapshot = JSON.stringify(conflict.remoteData);
            localSyncConflict = null;
            localSyncForceReplace = true;
            setLocalSyncPending(true);
            showLocalSyncDiagnostic('正在用本机版本覆盖服务器…');
            await uploadLocalSyncData();
        }

        async function uploadLocalSyncData() {
            const nativeSyncGeneration = nativeContext.generation;
            if (!localSyncAvailable || localSyncApplyingRemote || localSyncConflict) return;
            if (localSyncUploading) {
                localSyncUploadAgain = true;
                return;
            }
            localSyncUploading = true;
            try {
                const data = getAllData();
                const body = { baseRevision: localSyncLastRevision };
                if (!localSyncForceReplace && localSyncSupportsPatch && (localSyncChangedKeys.size > 0 || localSyncDeletedKeys.size > 0)) {
                    body.patch = {};
                    localSyncChangedKeys.forEach(key => {
                        if (Object.prototype.hasOwnProperty.call(data, key)) body.patch[key] = data[key];
                    });
                    localSyncDeletedKeys.forEach(key => {
                        body.patch[key] = null;
                    });
                } else {
                    body.data = data;
                }
                const response = await fetch(localSyncApiPath, {
                    method: 'POST',
                    headers: localSyncHeaders({ 'content-type': 'application/json' }),
                    body: JSON.stringify(body)
                });
                let payload = {};
                try {
                    payload = await response.json();
                } catch (error) {
                    if (response.ok) throw error;
                }
                if (response.status === 409 || response.status === 428) {
                    handleLocalSyncConflict(payload);
                    return;
                }
                if (!response.ok) throw new Error(payload.error || ('HTTP ' + response.status));
                localSyncSupportsPatch = !!(payload.features && payload.features.patch);
                localSyncLastUpdatedAt = payload.updatedAt || localSyncLastUpdatedAt;
                localSyncLastRevision = payload.revision || localSyncLastRevision;
                let appliedServerMerge = false;
                if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
                    appliedServerMerge = reconcileLocalSyncUpload(data, payload.data);
                } else {
                    localSyncLastSyncedSnapshot = JSON.stringify(data);
                    localSyncChangedKeys.clear();
                    localSyncDeletedKeys.clear();
                }
                localSyncShouldSeed = false;
                localSyncForceReplace = false;
                if (appliedServerMerge && typeof refreshVisibleData === 'function') refreshVisibleData();
                if (localSyncChangedKeys.size > 0 || localSyncDeletedKeys.size > 0) {
                    localSyncUploadAgain = true;
                } else {
                    setLocalSyncPending(false);
                }
                updateSaveStatus('☁️ 已同步到本地服务 ' + new Date().toLocaleTimeString('zh-CN'));
                showLocalSyncDiagnostic('已同步到本地 JSON：' + new Date().toLocaleTimeString('zh-CN'));
            } catch (e) {
                if (nativeSyncGeneration !== nativeContext.generation) return;
                updateSaveStatus('⚠️ 本地同步失败，已保存在当前浏览器');
                showLocalSyncDiagnostic('本地同步失败：' + (e && e.message ? e.message : '请求失败'), true);
            } finally {
                if (nativeSyncGeneration !== nativeContext.generation) return;
                localSyncUploading = false;
                if (localSyncUploadAgain && !localSyncConflict) {
                    localSyncUploadAgain = false;
                    scheduleLocalSyncUpload(300);
                }
            }
        }

        function startLocalSyncDirtyWatcher() {
            if (localSyncDirtyTimer) return;
            localSyncDirtyTimer = setInterval(checkLocalSyncDirty, localSyncDirtyFallbackIntervalMs);
        }

        function checkLocalSyncDirty() {
            if (!localSyncAvailable || !localSyncReady || localSyncApplyingRemote || localSyncConflict) return;
            const currentSnapshot = JSON.stringify(getAllData());
            if (localSyncLastSyncedSnapshot === null) {
                localSyncLastSyncedSnapshot = currentSnapshot;
                return;
            }
            if (currentSnapshot !== localSyncLastSyncedSnapshot) {
                setLocalSyncPending(true);
                if (localSyncChangedKeys.size === 0 && localSyncDeletedKeys.size === 0) {
                    localSyncSupportsPatch = false;
                }
                scheduleLocalSyncUpload();
            }
        }

        function startLocalSyncPolling() {
            if (localSyncPollTimer) return;
            localSyncPollTimer = setInterval(fetchLocalSyncUpdates, 10000);
        }

        async function fetchLocalSyncUpdates() {
            const nativeSyncGeneration = nativeContext.generation;
            if (!localSyncAvailable || !localSyncReady || localSyncApplyingRemote || localSyncConflict || localSyncUploading) return;
            const snapshotAtRequest = JSON.stringify(getAllData());
            const revisionAtRequest = localSyncLastRevision;
            if (localSyncLastSyncedSnapshot && snapshotAtRequest !== localSyncLastSyncedSnapshot) {
                setLocalSyncPending(true);
                scheduleLocalSyncUpload(300);
                return;
            }
            try {
                const query = new URLSearchParams({ t: String(Date.now()) });
                if (localSyncLastRevision) query.set('revision', localSyncLastRevision);
                const response = await fetch(localSyncApiPath + '?' + query.toString(), { cache: 'no-store', headers: localSyncHeaders() });
                if (response.status === 304) return;
                if (!response.ok) throw new Error('HTTP ' + response.status);
                const payload = await response.json();
                // A local edit or upload may have happened while the request was in flight.
                // Never replace that newer state with the older polling response.
                if (JSON.stringify(getAllData()) !== snapshotAtRequest) {
                    setLocalSyncPending(true);
                    scheduleLocalSyncUpload(300);
                    return;
                }
                if (localSyncUploading || localSyncConflict || localSyncLastRevision !== revisionAtRequest) return;
                localSyncSupportsPatch = !!(payload.features && payload.features.patch);
                if (payload.revision && payload.revision === localSyncLastRevision) return;
                if (!payload.revision && (!payload.updatedAt || payload.updatedAt === localSyncLastUpdatedAt)) return;
                const remoteData = normalizeBackupData(payload.data || {});
                if (JSON.stringify(remoteData) === JSON.stringify(getAllData())) {
                    localSyncLastUpdatedAt = payload.updatedAt;
                    localSyncLastRevision = payload.revision || localSyncLastRevision;
                    localSyncLastSyncedSnapshot = JSON.stringify(getAllData());
                    setLocalSyncPending(false);
                    return;
                }
                localSyncApplyingRemote = true;
                try {
                    restoreBackupData(remoteData);
                } finally {
                    localSyncApplyingRemote = false;
                }
                localSyncLastUpdatedAt = payload.updatedAt;
                localSyncLastRevision = payload.revision || localSyncLastRevision;
                localSyncLastSyncedSnapshot = JSON.stringify(getAllData());
                setLocalSyncPending(false);
                refreshVisibleData();
                updateSaveStatus('☁️ 已拉取其他设备更新 ' + new Date().toLocaleTimeString('zh-CN'));
            } catch (e) {
                if (nativeSyncGeneration !== nativeContext.generation) return;
                console.warn('拉取其他设备更新失败:', e);
                showLocalSyncDiagnostic('拉取其他设备更新失败：' + (e && e.message ? e.message : '请求失败'), true);
            }
        }

        function refreshVisibleData() {
            try {
                updateMainScores();
                renderCalendar();
                renderTodoList();
                renderTodoKanban();
                renderEmotionBoard();
                renderPomodoroGrid();
                renderReviewList();
                renderEmotionNotesList();
                updateMediaCounts();
                updateDeepseekCount();
                updateLiteratureCount();
                updateNovelOutlineCount();
                updateReadingNoteCount();
                updateFilmCount();
                renderMediaCalendar();

                const activePage = document.querySelector('.detail-page.active');
                if (!activePage) return;
                if (activePage.id === 'deepseekPage') { renderDeepSeekCategories(); renderDeepSeekDocs(); }
                if (activePage.id === 'literaturePage') { renderLiteratureCategories(); renderLiteratureDocs(); }
                if (activePage.id === 'novelOutlinePage') renderNovelOutlines();
                if (activePage.id === 'readingNotePage') { renderReadingCategories(); renderReadingNotes(); }
                if (activePage.id === 'filmPage') { renderFilmCategories(); renderFilmNotes(); }
                if (activePage.id === 'ideasPage') { updateMediaCounts(); renderIdeaVault(); }
                if (activePage.id === 'streakPage') { renderStreakHistory(); renderStreakChart(); renderStreakAnalysis(); }
            } catch (e) {
                console.warn('刷新可见数据失败:', e);
            }
        }

        // 读取当前 HTML 的源码字符串
        async function getCurrentHtmlSource() {
            const response = await fetch(window.location.href);
            if (!response.ok) throw new Error('无法读取自身源码 (HTTP ' + response.status + ')');
            return await response.text();
        }

        // 把数据注入到 HTML 源码中（替换占位符）
        function injectDataIntoHtml(html, data) {
            const safe = JSON.stringify(data)
                .replace(/</g, '\\u003c')
                .replace(/\u2028/g, '\\u2028')
                .replace(/\u2029/g, '\\u2029');
            // 构造新的注入块
            const block = '<script>window.EMBEDDED_DATA = ' + safe + ';<\/script>';
            // 先移除老的占位符
            const placeholder = /<script>\s*\/\*\s*__EMBEDDED_DATA_PLACEHOLDER__\s*\*\/\s*<\/script>/;
            if (placeholder.test(html)) {
                html = html.replace(placeholder, block);
            } else {
                // 移除老的 EMBEDDED_DATA 赋值块
                html = html.replace(/<script>window\.EMBEDDED_DATA\s*=\s*\{[\s\S]*?\};?<\/script>/, '');
                // 找到 EMBEDDED_DATA_PLACEHOLDER 注释位置插入
                const marker = /<!--\s*EMBEDDED_DATA_PLACEHOLDER[\s\S]*?-->/;
                if (marker.test(html)) {
                    html = html.replace(marker, '<!-- EMBEDDED_DATA_PLACEHOLDER: 自动注入 -->\n    ' + block);
                } else {
                    // 兜底：在 </head> 前插入
                    html = html.replace('</head>', '    ' + block + '\n</head>');
                }
            }
            return html;
        }

        // 从另一个 HTML 文件中导入数据
        function importFromHtmlFile() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.html,text/html';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const text = await file.text();
                    const match = text.match(/window\.EMBEDDED_DATA\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
                    if (!match) {
                        alert('❌ 这个 HTML 文件里没有找到嵌入的数据。\n\n请确认你打开的是从本系统导出的"带数据"版本。');
                        return;
                    }
                    const data = JSON.parse(match[1]);
                    const keys = Object.keys(normalizeBackupData(data));
                    if (keys.length === 0) {
                        alert('⚠️ 这个文件里的数据是空的。');
                        return;
                    }
                    if (!confirm('将导入 ' + keys.length + ' 项数据并覆盖当前数据，确定继续吗？')) return;
                    const count = restoreBackupData(data);
                    alert('✅ 已导入 ' + count + ' 项数据！\n\n即将刷新页面...');
                    setTimeout(() => location.reload(), 800);
                } catch (err) {
                    alert('导入失败：' + err.message);
                }
            };
            input.click();
        }

        // 从 JSON 备份导入数据
        function importFromJsonFile() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,application/json';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const data = JSON.parse(await file.text());
                    const keys = Object.keys(normalizeBackupData(data));
                    if (keys.length === 0) {
                        alert('⚠️ 这个 JSON 文件里没有找到可导入的数据。');
                        return;
                    }
                    if (!confirm('将导入 ' + keys.length + ' 项 JSON 数据并覆盖当前数据，确定继续吗？')) return;
                    const count = restoreBackupData(data);
                    alert('✅ 已导入 ' + count + ' 项 JSON 数据！\n\n即将刷新页面...');
                    setTimeout(() => location.reload(), 800);
                } catch (err) {
                    alert('导入 JSON 失败：' + err.message);
                }
            };
            input.click();
        }

        // 导出 JSON 文件，适合手机/平板/电脑之间手动同步
        function exportJsonFile() {
            const btn = document.getElementById('exportJsonBtn');
            if (btn) { btn.disabled = true; btn.textContent = '⏳ 正在导出...'; }
            try {
                const data = getAllData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const ts = formatLocalDate();
                a.download = 'my-schedule_' + ts + '.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                updateSaveStatus('✅ 已导出 JSON ' + ts);
            } catch (e) {
                alert('❌ 导出 JSON 失败：' + e.message);
                updateSaveStatus('❌ JSON 导出失败');
            } finally {
                if (btn) { btn.disabled = false; btn.textContent = '📤 导出 JSON'; }
            }
        }

        // 方法 A：导出新的 HTML 文件（含数据）
        async function exportHtmlWithData() {
            const btn = document.getElementById('exportHtmlBtn');
            if (btn) { btn.disabled = true; btn.textContent = '⏳ 正在打包...'; }
            try {
                const data = getAllData();
                const html = await getCurrentHtmlSource();
                const newHtml = injectDataIntoHtml(html, data);
                const blob = new Blob([newHtml], {type: 'text/html;charset=utf-8'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const ts = formatLocalDate();
                a.download = 'schedule-system_' + ts + '_with-data.html';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                updateSaveStatus('✅ 已导出带数据的 HTML ' + ts);
                alert('✅ 导出成功！\n\n文件名：schedule-system_' + ts + '_with-data.html\n\n使用方法：\n1. 打开下载的文件\n2. 你的所有数据会自动恢复\n3. 可以把这个文件拷到任何设备/给任何人用');
            } catch (e) {
                alert('❌ 导出失败：' + e.message + '\n\n可能原因：通过 file:// 打开的页面有时无法读取自身源码。\n请尝试用"💾 直接保存到原文件"按钮。');
                updateSaveStatus('❌ 导出失败');
            } finally {
                if (btn) { btn.disabled = false; btn.textContent = '📤 导出当前 HTML（含数据）'; }
            }
        }

        // 方法 B：直接保存到原 HTML 文件（File System Access API）
        async function saveToOriginalFile(silent) {
            if (!window.showSaveFilePicker) {
                if (!silent) alert('⚠️ 你的浏览器不支持"直接保存到原文件"功能。\n\n请改用"📤 导出当前 HTML"功能。\n（推荐使用 Edge 或 Chrome 浏览器）');
                return false;
            }
            if (isSaving) return false;
            isSaving = true;
            const btn = document.getElementById('saveFileBtn');
            if (btn && !silent) { btn.disabled = true; btn.textContent = '⏳ 保存中...'; }
            try {
                // 第一次需要用户选文件并授权
                if (!fileHandle) {
                    fileHandle = await window.showSaveFilePicker({
                        suggestedName: 'schedule-system-2.0.html',
                        types: [{ description: 'HTML 文件', accept: { 'text/html': ['.html'] } }]
                    });
                    // 保存句柄到 IndexedDB 以便下次自动恢复
                    try { await saveHandleToIDB(fileHandle); } catch (e) {}
                }
                // 检查权限
                if (fileHandle.queryPermission) {
                    const perm = await fileHandle.queryPermission({ mode: 'readwrite' });
                    if (perm !== 'granted') {
                        const req = await fileHandle.requestPermission({ mode: 'readwrite' });
                        if (req !== 'granted') throw new Error('用户未授权');
                    }
                }
                const data = getAllData();
                const html = await getCurrentHtmlSource();
                const newHtml = injectDataIntoHtml(html, data);
                const writable = await fileHandle.createWritable();
                await writable.write(newHtml);
                await writable.close();
                lastSavedDataSnapshot = JSON.stringify(data);
                updateSaveStatus('✅ 已保存到原文件 ' + new Date().toLocaleTimeString('zh-CN'));
                return true;
            } catch (e) {
                if (e.name === 'AbortError') {
                    updateSaveStatus('保存已取消');
                } else if (!silent) {
                    alert('❌ 保存失败：' + e.message);
                    updateSaveStatus('❌ 保存失败');
                }
                fileHandle = null;
                return false;
            } finally {
                isSaving = false;
                if (btn && !silent) { btn.disabled = false; btn.textContent = '💾 直接保存到原文件'; }
            }
        }

        // 方法 C：直接保存到 JSON 文件（File System Access API）
        async function saveToJsonFile(silent) {
            if (!window.showSaveFilePicker) {
                if (!silent) alert('⚠️ 你的浏览器不支持"直接保存到 JSON"功能。\n\n请改用"📤 导出 JSON"，再把下载的 JSON 发到其他设备。\n（桌面 Edge/Chrome 支持直接覆盖保存）');
                return false;
            }
            if (isSavingJson) return false;
            isSavingJson = true;
            const btn = document.getElementById('saveJsonBtn');
            if (btn && !silent) { btn.disabled = true; btn.textContent = '⏳ 保存中...'; }
            try {
                if (!jsonFileHandle) {
                    jsonFileHandle = await window.showSaveFilePicker({
                        suggestedName: 'my-schedule.json',
                        types: [{ description: 'JSON 文件', accept: { 'application/json': ['.json'] } }]
                    });
                    try { await saveHandleToIDB(jsonFileHandle, 'jsonHandle'); } catch (e) {}
                }
                if (jsonFileHandle.queryPermission) {
                    const perm = await jsonFileHandle.queryPermission({ mode: 'readwrite' });
                    if (perm !== 'granted') {
                        const req = await jsonFileHandle.requestPermission({ mode: 'readwrite' });
                        if (req !== 'granted') throw new Error('用户未授权');
                    }
                }
                const data = getAllData();
                const writable = await jsonFileHandle.createWritable();
                await writable.write(JSON.stringify(data, null, 2));
                await writable.close();
                lastSavedJsonDataSnapshot = JSON.stringify(data);
                updateSaveStatus('✅ 已保存到 JSON ' + new Date().toLocaleTimeString('zh-CN'));
                return true;
            } catch (e) {
                if (e.name === 'AbortError') {
                    updateSaveStatus('JSON 保存已取消');
                } else if (!silent) {
                    alert('❌ 保存 JSON 失败：' + e.message);
                    updateSaveStatus('❌ JSON 保存失败');
                }
                jsonFileHandle = null;
                return false;
            } finally {
                isSavingJson = false;
                if (btn && !silent) { btn.disabled = false; btn.textContent = '💾 保存到 JSON'; }
            }
        }

        // IndexedDB 持久化 file handle
        function openHandleDB() {
            return new Promise((resolve, reject) => {
                const req = indexedDB.open('vitaflow-handles', 1);
                req.onupgradeneeded = () => { try { req.result.createObjectStore('handles'); } catch (e) {} };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
        }
        async function saveHandleToIDB(handle, key = 'htmlHandle') {
            try {
                const db = await openHandleDB();
                const tx = db.transaction('handles', 'readwrite');
                tx.objectStore('handles').put(handle, key);
            } catch (e) {}
        }
        async function getHandleFromIDB(key = 'htmlHandle') {
            try {
                const db = await openHandleDB();
                return await new Promise((resolve) => {
                    try {
                        const tx = db.transaction('handles', 'readonly');
                        const req = tx.objectStore('handles').get(key);
                        req.onsuccess = () => resolve(req.result || null);
                        req.onerror = () => resolve(null);
                    } catch (e) { resolve(null); }
                });
            } catch (e) { return null; }
        }

        // 自动保存
        function startAutoSave() {
            setInterval(async () => {
                if (!autoSaveEnabled) return;
                if (!fileHandle && !jsonFileHandle) return;
                const current = JSON.stringify(getAllData());
                if (fileHandle && current !== lastSavedDataSnapshot) {
                    updateSaveStatus('🔄 检测到变化，自动保存中...');
                    await saveToOriginalFile(true);
                }
                if (jsonFileHandle && current !== lastSavedJsonDataSnapshot) {
                    updateSaveStatus('🔄 检测到变化，自动保存 JSON 中...');
                    await saveToJsonFile(true);
                }
            }, 60000);
        }
        function toggleAutoSave() {
            autoSaveEnabled = !autoSaveEnabled;
            const btn = document.getElementById('autoSaveToggle');
            if (btn) btn.textContent = autoSaveEnabled ? '⏰ 自动保存: 开' : '⏰ 自动保存: 关';
            updateSaveStatus(autoSaveEnabled ? '自动保存已开启（需先绑定 HTML 或 JSON 文件）' : '自动保存已关闭');
        }
        function updateSaveStatus(msg) {
            const el = document.getElementById('saveStatus');
            if (el) {
                el.textContent = msg;
                el.style.opacity = '1';
                clearTimeout(el._t);
                el._t = setTimeout(() => { el.style.opacity = '0.4'; }, 4000);
            }
        }

        // 初始化保存系统：尝试恢复 file handle
        async function initSaveSystem() {
            try {
                const h = await getHandleFromIDB();
                if (h) {
                    fileHandle = h;
                    if (h.queryPermission) {
                        const p = await h.queryPermission({ mode: 'readwrite' });
                        if (p === 'granted') {
                            updateSaveStatus('📁 已绑定原文件，可随时保存');
                        } else {
                            updateSaveStatus('📁 检测到原文件，请点击"💾 直接保存"重新授权');
                        }
                    }
                }
                const j = await getHandleFromIDB('jsonHandle');
                if (j) {
                    jsonFileHandle = j;
                    lastSavedJsonDataSnapshot = JSON.stringify(getAllData());
                    if (j.queryPermission) {
                        const p = await j.queryPermission({ mode: 'readwrite' });
                        if (p === 'granted') {
                            updateSaveStatus('📁 已绑定 JSON，可自动保存');
                        } else {
                            updateSaveStatus('📁 检测到 JSON 文件，请点击"💾 保存到 JSON"重新授权');
                        }
                    }
                }
            } catch (e) {}
        }

        let vitaflowBooted = false;

        function runInitStep(name, fn) {
            try {
                return fn();
            } catch (e) {
                console.warn(name + ' 初始化失败:', e);
                return undefined;
            }
        }

        function initChartsAfterAssetsReady() {
            if (typeof Chart === 'undefined') return;
            const accountKeys = ['physical', 'emotional', 'focus', 'meaning'];
            if (!accountKeys.every(key => Array.isArray(accountsData?.[key]?.history))) return;
            runInitStep('initMainChart', initMainChart);
        }

        async function bootVitaFlow() {
            if (vitaflowBooted) return;
	            vitaflowBooted = true;
	            installLocalSyncHook();
	            await initLocalSync();
	            runInitStep('initData', initData);
            runInitStep('initSaveSystem', initSaveSystem);
            runInitStep('startAutoSave', startAutoSave);
            runInitStep('initMediaStorage', initMediaStorage);
            runInitStep('initMediaCalendarStorage', initMediaCalendarStorage);
            runInitStep('renderCalendar', renderCalendar);
            runInitStep('renderTodoList', renderTodoList);
            runInitStep('renderTodoKanban', renderTodoKanban);
            initChartsAfterAssetsReady();
            runInitStep('renderEmotionBoard', renderEmotionBoard);
            runInitStep('renderPomodoroGrid', renderPomodoroGrid);
            runInitStep('renderReviewList', renderReviewList);
            runInitStep('renderEmotionNotesList', renderEmotionNotesList);
            runInitStep('updateDeepseekCount', updateDeepseekCount);
            runInitStep('updateLiteratureCount', updateLiteratureCount);
            runInitStep('updateNovelOutlineCount', updateNovelOutlineCount);
            runInitStep('updateReadingNoteCount', updateReadingNoteCount);
            runInitStep('updateFilmCount', updateFilmCount);
            runInitStep('renderMediaCalendar', renderMediaCalendar);
            enableLocalSyncAfterInitialRender();
            window.dispatchEvent(new Event('vitaflow:ready'));
        }


        (() => {
            if (new URLSearchParams(window.location.search).get('embed') !== 'ops-hub' || window.parent === window) return;
            document.body.classList.add('ops-hub-embed');
            const views = new Set(['energyOverview', 'dailyPlan', 'energyTrends', 'creativeSpace']);
            window.addEventListener('vitaflow:ready', () => {
                window.parent.postMessage({ type: 'ops:vitaflow:ready', storage: localSyncAvailable ? 'server' : 'browser' }, '*');
            });
            window.addEventListener('message', event => {
                if (event.source !== window.parent || !event.data || typeof event.data !== 'object') return;
                if (event.data.type === 'ops:vitaflow:theme' && ['dark', 'light'].includes(event.data.theme)) {
                    document.body.setAttribute('data-ops-theme', event.data.theme);
                }
                if (event.data.type === 'ops:vitaflow:navigate' && views.has(event.data.view)) {
                    goBack();
                    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
                    document.getElementById(event.data.view)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
                }
            });
        })();


  const nativeUi = { addAnalysisItem: addAnalysisItem,
addDeepSeekCategory: addDeepSeekCategory,
addFilmCategory: addFilmCategory,
addFood: addFood,
addIPItem: addIPItem,
addIdeaVaultMotif: addIdeaVaultMotif,
addLearningCategory: addLearningCategory,
addLiteratureCategory: addLiteratureCategory,
addReadingCategory: addReadingCategory,
addSkillItem: addSkillItem,
addTodo: addTodo,
addWeeklyReview: addWeeklyReview,
changeMonth: changeMonth,
closeDeepseekPopup: closeDeepseekPopup,
closeFilmPopup: closeFilmPopup,
closeLearningPopup: closeLearningPopup,
closeLiteraturePopup: closeLiteraturePopup,
closeNovelPopup: closeNovelPopup,
closeReadingPopup: closeReadingPopup,
createAds: createAds,
createIdeaVaultAction: createIdeaVaultAction,
createIdeaVaultFragment: createIdeaVaultFragment,
createIdeas: createIdeas,
createLazyy: createLazyy,
createWriting: createWriting,
deleteDeepseekCategory: deleteDeepseekCategory,
deleteDeepseekDoc: deleteDeepseekDoc,
deleteFilmCategory: deleteFilmCategory,
deleteFilmNote: deleteFilmNote,
deleteIdeaVaultAction: deleteIdeaVaultAction,
deleteIdeaVaultFragment: deleteIdeaVaultFragment,
deleteLearningCategory: deleteLearningCategory,
deleteLearningNote: deleteLearningNote,
deleteLiteratureCategory: deleteLiteratureCategory,
deleteLiteratureDoc: deleteLiteratureDoc,
deleteNovelOutline: deleteNovelOutline,
deleteReadingCategory: deleteReadingCategory,
deleteReadingNote: deleteReadingNote,
deleteReview: deleteReview,
deleteTodo: deleteTodo,
editFoodRecord: editFoodRecord,
editMeaningQuizRecord: editMeaningQuizRecord,
editRitualRecord: editRitualRecord,
editSandwichRecord: editSandwichRecord,
editSupportRecord: editSupportRecord,
editValueRecord: editValueRecord,
editWaterRecord: editWaterRecord,
exportHtmlWithData: exportHtmlWithData,
exportJsonFile: exportJsonFile,
generateGoalSuggestions: generateGoalSuggestions,
goBack: goBack,
importFromHtmlFile: importFromHtmlFile,
importFromJsonFile: importFromJsonFile,
openAdsDoc: openAdsDoc,
openAnalysisDetail: openAnalysisDetail,
openDeepSeekDetail: openDeepSeekDetail,
openDeepSeekEditor: openDeepSeekEditor,
openDeepseekDocDetail: openDeepseekDocDetail,
openDetail: openDetail,
openFilmDetail: openFilmDetail,
openFilmEditor: openFilmEditor,
openIPDetail: openIPDetail,
openIdeasDoc: openIdeasDoc,
openIdeasTab: openIdeasTab,
openLazyyDoc: openLazyyDoc,
openLearningEditor: openLearningEditor,
openLiteratureDetail: openLiteratureDetail,
openLiteratureDocDetail: openLiteratureDocDetail,
openLiteratureEditor: openLiteratureEditor,
openMediaDetail: openMediaDetail,
openNovelOutlineDetail: openNovelOutlineDetail,
openNovelOutlineEditor: openNovelOutlineEditor,
openReadingEditor: openReadingEditor,
openReadingNoteDetail: openReadingNoteDetail,
openReviewDetail: openReviewDetail,
openSkillDetail: openSkillDetail,
openWritingDoc: openWritingDoc,
previewFilmImage: previewFilmImage,
promoteIdeaVaultFragment: promoteIdeaVaultFragment,
recordActivity: recordActivity,
recordStreak: recordStreak,
removeAnalysisImage: removeAnalysisImage,
removeFilmImage: removeFilmImage,
removeIPImage: removeIPImage,
removeSkillImage: removeSkillImage,
renderActivityHistory: renderActivityHistory,
renderAllTrendCharts: renderAllTrendCharts,
renderAnalysisList: renderAnalysisList,
renderEmotionBoard: renderEmotionBoard,
renderFoodHistory: renderFoodHistory,
renderIPList: renderIPList,
renderMeaningQuizHistory: renderMeaningQuizHistory,
renderMediaCalendar: renderMediaCalendar,
renderMediaCalendarStats: renderMediaCalendarStats,
renderReflectionHistory: renderReflectionHistory,
renderRitualList: renderRitualList,
renderSandwichHistory: renderSandwichHistory,
renderSkillsList: renderSkillsList,
renderSupportHistory: renderSupportHistory,
renderValuesHistory: renderValuesHistory,
saveAds: saveAds,
saveAnalysis: saveAnalysis,
saveDeepseekDoc: saveDeepseekDoc,
saveEmotionNotes: saveEmotionNotes,
saveFilmNote: saveFilmNote,
saveIP: saveIP,
saveIdeas: saveIdeas,
saveLazyy: saveLazyy,
saveLearningNote: saveLearningNote,
saveLiteratureDoc: saveLiteratureDoc,
saveMeaningQuiz: saveMeaningQuiz,
saveMediaCalendarItem: saveMediaCalendarItem,
saveMediaCalendarNotes: saveMediaCalendarNotes,
saveNovelOutline: saveNovelOutline,
saveReadingNote: saveReadingNote,
saveRecord: saveRecord,
saveReflection: saveReflection,
saveReview: saveReview,
saveRitual: saveRitual,
saveSandwich: saveSandwich,
saveSkill: saveSkill,
saveSupport: saveSupport,
saveToJsonFile: saveToJsonFile,
saveToOriginalFile: saveToOriginalFile,
saveValues: saveValues,
saveWaterIntake: saveWaterIntake,
saveWriting: saveWriting,
searchDeepSeekDocs: searchDeepSeekDocs,
searchFilmNotes: searchFilmNotes,
searchLearningNotes: searchLearningNotes,
searchLiteratureDocs: searchLiteratureDocs,
searchNovelOutlines: searchNovelOutlines,
searchReadingNotes: searchReadingNotes,
selectAddAccount: selectAddAccount,
selectDeepseekCategory: selectDeepseekCategory,
selectFilmCategory: selectFilmCategory,
selectLearningCategory: selectLearningCategory,
selectLiteratureCategory: selectLiteratureCategory,
selectReadingCategory: selectReadingCategory,
setHappiness: setHappiness,
showActivityFullDetail: showActivityFullDetail,
showEmojiSelector: showEmojiSelector,
showFoodDetail: showFoodDetail,
showMeaningQuizDetail: showMeaningQuizDetail,
showMeaningQuizFullDetail: showMeaningQuizFullDetail,
showReflectionDetail: showReflectionDetail,
showRitualFullDetail: showRitualFullDetail,
showSandwichDetail: showSandwichDetail,
showSupportDetail: showSupportDetail,
showValueDetail: showValueDetail,
showValueFullDetail: showValueFullDetail,
startBreathing: startBreathing,
startIntervalTraining: startIntervalTraining,
startPomodoro: startPomodoro,
startSwitchTimer: startSwitchTimer,
stopIntervalTraining: stopIntervalTraining,
stopPomodoro: stopPomodoro,
stopSwitchTimer: stopSwitchTimer,
switchMediaTab: switchMediaTab,
switchTab: switchTab,
toggleAutoSave: toggleAutoSave,
toggleFocusLock: toggleFocusLock,
toggleIdeaVaultAction: toggleIdeaVaultAction,
toggleTodo: toggleTodo,
updateMeaningScore: updateMeaningScore,
updateScorePreview: updateScorePreview };
  const nativeViews = new Set(['energyOverview', 'dailyPlan', 'energyTrends', 'creativeSpace', 'physical', 'emotional', 'focus', 'meaning']);
  const nativeAccounts = ['physical', 'emotional', 'focus', 'meaning'];
  const originalVisibleRefresh = refreshVisibleData;
  const originalMarkChanged = markLocalDataChanged;
  const originalResolveConflict = resolveLocalSyncConflict;

  function nativeStorage() { return nativeContext.mode === 'private' && localSyncAvailable ? 'server' : 'browser'; }
  function nativeNotify(type = 'ops:vitaflow-data') {
    realWindow.dispatchEvent(new realWindow.CustomEvent(type, { detail: { storage: nativeStorage() } }));
  }
  function nativeRead(key, fallback) {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  }
  function nativeSummary(day) {
    let savedAccounts = {}, savedTodos = [], error = '';
    try {
      savedAccounts = nativeRead('vitaflow_accounts', {});
      if (!savedAccounts || typeof savedAccounts !== 'object' || Array.isArray(savedAccounts)) throw new Error('Invalid account records');
    } catch (_) { savedAccounts = {}; error = '精力记录读取失败，原记录已保留。'; }
    try {
      savedTodos = nativeRead('vitaflow_todos', []);
      if (!Array.isArray(savedTodos)) throw new Error('Invalid todo records');
    } catch (_) { savedTodos = []; error += '待办记录读取失败，原记录已保留。'; }
    const accounts = nativeAccounts.map(key => {
      const score = savedAccounts?.[key]?.score;
      const valid = typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100;
      if (score !== undefined && score !== null && !valid) error = error || '精力记录格式有误，原记录已保留。';
      return { key, label: accountNames[key], score: valid ? score : null };
    });
    const todos = (Array.isArray(savedTodos) ? savedTodos : []).filter(item => item && item.date === day && typeof item.text === 'string' && ['string', 'number'].includes(typeof item.id))
      .map(item => ({ id: item.id, text: item.text, completed: item.completed === true, account: item.account }));
    return { accounts, todos, completed: todos.filter(item => item.completed).length, total: todos.length, storage: nativeStorage(), conflict: !!localSyncConflict, error };
  }
  function nativeRefresh() {
    try {
      initData();
      originalVisibleRefresh();
      initChartsAfterAssetsReady();
      nativeNotify();
      return true;
    } catch (_) {
      updateSaveStatus('记录读取失败，原记录已保留；请检查浏览器存储。');
      return false;
    }
  }
  refreshVisibleData = nativeRefresh;
  markLocalDataChanged = function (key, deleted) {
    originalMarkChanged(key, deleted);
    if (nativeReady) nativeNotify();
  };
  resolveLocalSyncConflict = async function (choice) {
    try { return await originalResolveConflict(choice); }
    finally { nativeNotify(); }
  };
  function nativeStopSync() {
    nativeContext.generation++;
    for (const request of nativeRequests) request.abort();
    nativeRequests.clear();
    clearTimeout(localSyncSaveTimer);
    clearInterval(localSyncPollTimer);
    clearInterval(localSyncDirtyTimer);
    localSyncSaveTimer = localSyncPollTimer = localSyncDirtyTimer = null;
    localSyncAvailable = localSyncReady = localSyncUploading = localSyncUploadAgain = localSyncShouldSeed = false;
  }
  function nativeUseBrowser() {
    nativeStopSync();
    nativeContext.mode = 'browser';
    nativeContext.origin = null;
    showLocalSyncDiagnostic('当前浏览器本机保存（未启用跨设备同步）');
    nativeNotify();
  }
  async function nativeConnect(value, key = '') {
    await nativeBoot;
    let url;
    try {
      url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol');
    } catch (_) {
      showLocalSyncDiagnostic('私有服务地址无效，当前记录已保留。', true);
      return { connected: false, conflict: !!localSyncConflict };
    }
    nativeStopSync();
    nativeContext.mode = 'private';
    nativeContext.origin = url.origin;
    nativeContext.key = String(key ?? '').trim();
    const generation = nativeContext.generation;
    await initLocalSync();
    if (generation !== nativeContext.generation) return { connected: false, conflict: false };
    if (localSyncAvailable) enableLocalSyncAfterInitialRender();
    nativeRefresh();
    return { connected: localSyncAvailable, conflict: !!localSyncConflict };
  }
  function nativeActivate(view, day) {
    if (!nativeReady || !nativeViews.has(view)) return false;
    const date = typeof day === 'string' ? parseLocalDate(day) : null;
    if (date) {
      selectedDate = day;
      currentYear = date.getFullYear();
      currentMonth = date.getMonth();
      for (const key of nativeAccounts) document.getElementById(key + 'DateInput').value = day;
    }
    if (nativeAccounts.includes(view)) openDetail(view);
    else {
      goBack();
      document.getElementById(view)?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
    const resize = () => {
      for (const chart of Object.values(accountCharts)) chart?.resize?.();
      for (const chart of [mainChart, streakChart, tasksChart, avgChart, compareChart, realWindow.emotionChart, realWindow.pomodoroChartInstance]) chart?.resize?.();
      for (const name of ['physicalTrend', 'emotionalTrend', 'focusTrend', 'meaningTrend']) realWindow[name]?.resize?.();
    };
    if (typeof realWindow.requestAnimationFrame === 'function') realWindow.requestAnimationFrame(resize);
    else setTimeout(resize, 0);
    return true;
  }
  for (const [name, fn] of Object.entries(nativeUi)) {
    realWindow[name] = function (...args) {
      const result = fn.apply(this, args);
      if (result && typeof result.then === 'function') return result.then(value => { nativeNotify(); return value; });
      nativeNotify();
      return result;
    };
  }
  realWindow.OpsVitaFlowNative = {
    isReady: () => nativeReady,
    activate: nativeActivate,
    setTheme(theme) { if (['dark', 'light'].includes(theme)) nativeRoot.setAttribute('data-ops-theme', theme); },
    getSummary: nativeSummary,
    toggleTodo(id) { const result = toggleTodo(id); nativeNotify(); return result; },
    connect: nativeConnect,
    useBrowser: nativeUseBrowser,
    refresh: nativeRefresh
  };
  nativeBoot = bootVitaFlow().then(() => {
    nativeReady = true;
    nativeNotify('ops:vitaflow-ready');
  }).catch(error => {
    updateSaveStatus('工作区初始化失败，原记录已保留。');
    console.error('Native VitaFlow initialization failed:', error);
  });
})(window, document);
