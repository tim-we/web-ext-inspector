(()=>{"use strict";var e={428:(e,n,t)=>{t.d(n,{Z:()=>a});var o=t(81),r=t.n(o),l=t(645),i=t.n(l)()(r());i.push([e.id,'/**\n * okaidia theme for JavaScript, CSS and HTML\n * Loosely based on Monokai textmate theme by http://www.monokai.nl/\n * @author ocodia\n */\ncode[class*="language-"],\npre[class*="language-"] {\n  color: #f8f8f2;\n  background: none;\n  text-shadow: 0 1px rgba(0, 0, 0, 0.3);\n  font-family: Consolas, Monaco, \'Andale Mono\', \'Ubuntu Mono\', monospace;\n  font-size: 1em;\n  text-align: left;\n  white-space: pre;\n  word-spacing: normal;\n  word-break: normal;\n  word-wrap: normal;\n  line-height: 1.5;\n  -moz-tab-size: 4;\n  -o-tab-size: 4;\n  tab-size: 4;\n  -webkit-hyphens: none;\n  -moz-hyphens: none;\n  -ms-hyphens: none;\n  hyphens: none;\n}\n/* Code blocks */\npre[class*="language-"] {\n  padding: 1em;\n  margin: 0.5em 0;\n  overflow: auto;\n  border-radius: 0.3em;\n}\n:not(pre) > code[class*="language-"],\npre[class*="language-"] {\n  background: #272822;\n}\n/* Inline code */\n:not(pre) > code[class*="language-"] {\n  padding: 0.1em;\n  border-radius: 0.3em;\n  white-space: normal;\n}\n.token.comment,\n.token.prolog,\n.token.doctype,\n.token.cdata {\n  color: #8292a2;\n}\n.token.punctuation {\n  color: #f8f8f2;\n}\n.token.namespace {\n  opacity: 0.7;\n}\n.token.property,\n.token.tag,\n.token.constant,\n.token.symbol,\n.token.deleted {\n  color: #f92672;\n}\n.token.boolean,\n.token.number {\n  color: #ae81ff;\n}\n.token.selector,\n.token.attr-name,\n.token.string,\n.token.char,\n.token.builtin,\n.token.inserted {\n  color: #a6e22e;\n}\n.token.operator,\n.token.entity,\n.token.url,\n.language-css .token.string,\n.style .token.string,\n.token.variable {\n  color: #f8f8f2;\n}\n.token.atrule,\n.token.attr-value,\n.token.function,\n.token.class-name {\n  color: #e6db74;\n}\n.token.keyword {\n  color: #66d9ef;\n}\n.token.regex,\n.token.important {\n  color: #fd971f;\n}\n.token.important,\n.token.bold {\n  font-weight: bold;\n}\n.token.italic {\n  font-style: italic;\n}\n.token.entity {\n  cursor: help;\n}\n',""]);const a=i},462:(e,n,t)=>{t.d(n,{Z:()=>a});var o=t(81),r=t.n(o),l=t(645),i=t.n(l)()(r());i.push([e.id,"body {\n  font-family: sans-serif;\n  background: #2b2b2b;\n  color: white;\n  margin: 0;\n  padding: 0;\n  height: 100vh;\n}\n#controls {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 0;\n  background-color: #5a5a5a;\n  padding: 0 5px;\n  display: none;\n}\n#file-content {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  overflow: auto;\n  padding: 10px;\n}\n#file-content pre {\n  margin: 0;\n  -moz-tab-size: 4;\n  tab-size: 4;\n}\n",""]);const a=i},645:e=>{e.exports=function(e){var n=[];return n.toString=function(){return this.map((function(n){var t="",o=void 0!==n[5];return n[4]&&(t+="@supports (".concat(n[4],") {")),n[2]&&(t+="@media ".concat(n[2]," {")),o&&(t+="@layer".concat(n[5].length>0?" ".concat(n[5]):""," {")),t+=e(n),o&&(t+="}"),n[2]&&(t+="}"),n[4]&&(t+="}"),t})).join("")},n.i=function(e,t,o,r,l){"string"==typeof e&&(e=[[null,e,void 0]]);var i={};if(o)for(var a=0;a<this.length;a++){var s=this[a][0];null!=s&&(i[s]=!0)}for(var c=0;c<e.length;c++){var u=[].concat(e[c]);o&&i[u[0]]||(void 0!==l&&(void 0===u[5]||(u[1]="@layer".concat(u[5].length>0?" ".concat(u[5]):""," {").concat(u[1],"}")),u[5]=l),t&&(u[2]?(u[1]="@media ".concat(u[2]," {").concat(u[1],"}"),u[2]=t):u[2]=t),r&&(u[4]?(u[1]="@supports (".concat(u[4],") {").concat(u[1],"}"),u[4]=r):u[4]="".concat(r)),n.push(u))}},n}},81:e=>{e.exports=function(e){return e[1]}},379:(e,n,t)=>{var o,r=function(){var e={};return function(n){if(void 0===e[n]){var t=document.querySelector(n);if(window.HTMLIFrameElement&&t instanceof window.HTMLIFrameElement)try{t=t.contentDocument.head}catch(e){t=null}e[n]=t}return e[n]}}(),l=[];function i(e){for(var n=-1,t=0;t<l.length;t++)if(l[t].identifier===e){n=t;break}return n}function a(e,n){for(var t={},o=[],r=0;r<e.length;r++){var a=e[r],s=n.base?a[0]+n.base:a[0],c=t[s]||0,u="".concat(s," ").concat(c);t[s]=c+1;var _=i(u),d={css:a[1],media:a[2],sourceMap:a[3]};-1!==_?(l[_].references++,l[_].updater(d)):l.push({identifier:u,updater:h(d,n),references:1}),o.push(u)}return o}function s(e){var n=document.createElement("style"),o=e.attributes||{};if(void 0===o.nonce){var l=t.nc;l&&(o.nonce=l)}if(Object.keys(o).forEach((function(e){n.setAttribute(e,o[e])})),"function"==typeof e.insert)e.insert(n);else{var i=r(e.insert||"head");if(!i)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");i.appendChild(n)}return n}var c,u=(c=[],function(e,n){return c[e]=n,c.filter(Boolean).join("\n")});function _(e,n,t,o){var r=t?"":o.media?"@media ".concat(o.media," {").concat(o.css,"}"):o.css;if(e.styleSheet)e.styleSheet.cssText=u(n,r);else{var l=document.createTextNode(r),i=e.childNodes;i[n]&&e.removeChild(i[n]),i.length?e.insertBefore(l,i[n]):e.appendChild(l)}}function d(e,n,t){var o=t.css,r=t.media,l=t.sourceMap;if(r?e.setAttribute("media",r):e.removeAttribute("media"),l&&"undefined"!=typeof btoa&&(o+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(l))))," */")),e.styleSheet)e.styleSheet.cssText=o;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(o))}}var p=null,f=0;function h(e,n){var t,o,r;if(n.singleton){var l=f++;t=p||(p=s(n)),o=_.bind(null,t,l,!1),r=_.bind(null,t,l,!0)}else t=s(n),o=d.bind(null,t,n),r=function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(t)};return o(e),function(n){if(n){if(n.css===e.css&&n.media===e.media&&n.sourceMap===e.sourceMap)return;o(e=n)}else r()}}e.exports=function(e,n){(n=n||{}).singleton||"boolean"==typeof n.singleton||(n.singleton=(void 0===o&&(o=Boolean(window&&document&&document.all&&!window.atob)),o));var t=a(e=e||[],n);return function(e){if(e=e||[],"[object Array]"===Object.prototype.toString.call(e)){for(var o=0;o<t.length;o++){var r=i(t[o]);l[r].references--}for(var s=a(e,n),c=0;c<t.length;c++){var u=i(t[c]);0===l[u].references&&(l[u].updater(),l.splice(u,1))}t=s}}}}},n={};function t(o){var r=n[o];if(void 0!==r)return r.exports;var l=n[o]={id:o,exports:{}};return e[o](l,l.exports,t),l.exports}t.n=e=>{var n=e&&e.__esModule?()=>e.default:()=>e;return t.d(n,{a:n}),n},t.d=(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},t.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),t.nc=void 0,(()=>{var e,n,o,r,l,i,a={},s=[],c=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function u(e,n){for(var t in n)e[t]=n[t];return e}function _(e){var n=e.parentNode;n&&n.removeChild(e)}function d(e,t,r,l,i){var a={type:e,props:t,key:r,ref:l,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==i?++o:i};return null==i&&null!=n.vnode&&n.vnode(a),a}function p(e){return e.children}function f(e,n){this.props=e,this.context=n}function h(e,n){if(null==n)return e.__?h(e.__,e.__.__k.indexOf(e)+1):null;for(var t;n<e.__k.length;n++)if(null!=(t=e.__k[n])&&null!=t.__e)return t.__e;return"function"==typeof e.type?h(e):null}function v(e){var n,t;if(null!=(e=e.__)&&null!=e.__c){for(e.__e=e.__c.base=null,n=0;n<e.__k.length;n++)if(null!=(t=e.__k[n])&&null!=t.__e){e.__e=e.__c.base=t.__e;break}return v(e)}}function m(e){(!e.__d&&(e.__d=!0)&&r.push(e)&&!y.__r++||i!==n.debounceRendering)&&((i=n.debounceRendering)||l)(y)}function y(){for(var e;y.__r=r.length;)e=r.sort((function(e,n){return e.__v.__b-n.__v.__b})),r=[],e.some((function(e){var n,t,o,r,l,i;e.__d&&(l=(r=(n=e).__v).__e,(i=n.__P)&&(t=[],(o=u({},r)).__v=r.__v+1,C(i,r,o,n.__n,void 0!==i.ownerSVGElement,null!=r.__h?[l]:null,t,null==l?h(r):l,r.__h),M(t,r),r.__e!=l&&v(r)))}))}function g(e,n,t,o,r,l,i,c,u,_){var f,v,m,y,g,w,E,S=o&&o.__k||s,x=S.length;for(t.__k=[],f=0;f<n.length;f++)if(null!=(y=t.__k[f]=null==(y=n[f])||"boolean"==typeof y?null:"string"==typeof y||"number"==typeof y||"bigint"==typeof y?d(null,y,null,null,y):Array.isArray(y)?d(p,{children:y},null,null,null):y.__b>0?d(y.type,y.props,y.key,null,y.__v):y)){if(y.__=t,y.__b=t.__b+1,null===(m=S[f])||m&&y.key==m.key&&y.type===m.type)S[f]=void 0;else for(v=0;v<x;v++){if((m=S[v])&&y.key==m.key&&y.type===m.type){S[v]=void 0;break}m=null}C(e,y,m=m||a,r,l,i,c,u,_),g=y.__e,(v=y.ref)&&m.ref!=v&&(E||(E=[]),m.ref&&E.push(m.ref,null,y),E.push(v,y.__c||g,y)),null!=g?(null==w&&(w=g),"function"==typeof y.type&&y.__k===m.__k?y.__d=u=b(y,u,e):u=k(e,y,m,S,g,u),"function"==typeof t.type&&(t.__d=u)):u&&m.__e==u&&u.parentNode!=e&&(u=h(m))}for(t.__e=w,f=x;f--;)null!=S[f]&&("function"==typeof t.type&&null!=S[f].__e&&S[f].__e==t.__d&&(t.__d=h(o,f+1)),T(S[f],S[f]));if(E)for(f=0;f<E.length;f++)P(E[f],E[++f],E[++f])}function b(e,n,t){for(var o,r=e.__k,l=0;r&&l<r.length;l++)(o=r[l])&&(o.__=e,n="function"==typeof o.type?b(o,n,t):k(t,o,o,r,o.__e,n));return n}function k(e,n,t,o,r,l){var i,a,s;if(void 0!==n.__d)i=n.__d,n.__d=void 0;else if(null==t||r!=l||null==r.parentNode)e:if(null==l||l.parentNode!==e)e.appendChild(r),i=null;else{for(a=l,s=0;(a=a.nextSibling)&&s<o.length;s+=2)if(a==r)break e;e.insertBefore(r,l),i=l}return void 0!==i?i:r.nextSibling}function w(e,n,t){"-"===n[0]?e.setProperty(n,t):e[n]=null==t?"":"number"!=typeof t||c.test(n)?t:t+"px"}function E(e,n,t,o,r){var l;e:if("style"===n)if("string"==typeof t)e.style.cssText=t;else{if("string"==typeof o&&(e.style.cssText=o=""),o)for(n in o)t&&n in t||w(e.style,n,"");if(t)for(n in t)o&&t[n]===o[n]||w(e.style,n,t[n])}else if("o"===n[0]&&"n"===n[1])l=n!==(n=n.replace(/Capture$/,"")),n=n.toLowerCase()in e?n.toLowerCase().slice(2):n.slice(2),e.l||(e.l={}),e.l[n+l]=t,t?o||e.addEventListener(n,l?x:S,l):e.removeEventListener(n,l?x:S,l);else if("dangerouslySetInnerHTML"!==n){if(r)n=n.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if("href"!==n&&"list"!==n&&"form"!==n&&"tabIndex"!==n&&"download"!==n&&n in e)try{e[n]=null==t?"":t;break e}catch(e){}"function"==typeof t||(null!=t&&(!1!==t||"a"===n[0]&&"r"===n[1])?e.setAttribute(n,t):e.removeAttribute(n))}}function S(e){this.l[e.type+!1](n.event?n.event(e):e)}function x(e){this.l[e.type+!0](n.event?n.event(e):e)}function C(e,t,o,r,l,i,a,s,c){var _,d,h,v,m,y,b,k,w,E,S,x,C,M=t.type;if(void 0!==t.constructor)return null;null!=o.__h&&(c=o.__h,s=t.__e=o.__e,t.__h=null,i=[s]),(_=n.__b)&&_(t);try{e:if("function"==typeof M){if(k=t.props,w=(_=M.contextType)&&r[_.__c],E=_?w?w.props.value:_.__:r,o.__c?b=(d=t.__c=o.__c).__=d.__E:("prototype"in M&&M.prototype.render?t.__c=d=new M(k,E):(t.__c=d=new f(k,E),d.constructor=M,d.render=A),w&&w.sub(d),d.props=k,d.state||(d.state={}),d.context=E,d.__n=r,h=d.__d=!0,d.__h=[]),null==d.__s&&(d.__s=d.state),null!=M.getDerivedStateFromProps&&(d.__s==d.state&&(d.__s=u({},d.__s)),u(d.__s,M.getDerivedStateFromProps(k,d.__s))),v=d.props,m=d.state,h)null==M.getDerivedStateFromProps&&null!=d.componentWillMount&&d.componentWillMount(),null!=d.componentDidMount&&d.__h.push(d.componentDidMount);else{if(null==M.getDerivedStateFromProps&&k!==v&&null!=d.componentWillReceiveProps&&d.componentWillReceiveProps(k,E),!d.__e&&null!=d.shouldComponentUpdate&&!1===d.shouldComponentUpdate(k,d.__s,E)||t.__v===o.__v){d.props=k,d.state=d.__s,t.__v!==o.__v&&(d.__d=!1),d.__v=t,t.__e=o.__e,t.__k=o.__k,t.__k.forEach((function(e){e&&(e.__=t)})),d.__h.length&&a.push(d);break e}null!=d.componentWillUpdate&&d.componentWillUpdate(k,d.__s,E),null!=d.componentDidUpdate&&d.__h.push((function(){d.componentDidUpdate(v,m,y)}))}if(d.context=E,d.props=k,d.__v=t,d.__P=e,S=n.__r,x=0,"prototype"in M&&M.prototype.render)d.state=d.__s,d.__d=!1,S&&S(t),_=d.render(d.props,d.state,d.context);else do{d.__d=!1,S&&S(t),_=d.render(d.props,d.state,d.context),d.state=d.__s}while(d.__d&&++x<25);d.state=d.__s,null!=d.getChildContext&&(r=u(u({},r),d.getChildContext())),h||null==d.getSnapshotBeforeUpdate||(y=d.getSnapshotBeforeUpdate(v,m)),C=null!=_&&_.type===p&&null==_.key?_.props.children:_,g(e,Array.isArray(C)?C:[C],t,o,r,l,i,a,s,c),d.base=t.__e,t.__h=null,d.__h.length&&a.push(d),b&&(d.__E=d.__=null),d.__e=!1}else null==i&&t.__v===o.__v?(t.__k=o.__k,t.__e=o.__e):t.__e=L(o.__e,t,o,r,l,i,a,c);(_=n.diffed)&&_(t)}catch(e){t.__v=null,(c||null!=i)&&(t.__e=s,t.__h=!!c,i[i.indexOf(s)]=null),n.__e(e,t,o)}}function M(e,t){n.__c&&n.__c(t,e),e.some((function(t){try{e=t.__h,t.__h=[],e.some((function(e){e.call(t)}))}catch(e){n.__e(e,t.__v)}}))}function L(n,t,o,r,l,i,s,c){var u,d,p,f=o.props,v=t.props,m=t.type,y=0;if("svg"===m&&(l=!0),null!=i)for(;y<i.length;y++)if((u=i[y])&&"setAttribute"in u==!!m&&(m?u.localName===m:3===u.nodeType)){n=u,i[y]=null;break}if(null==n){if(null===m)return document.createTextNode(v);n=l?document.createElementNS("http://www.w3.org/2000/svg",m):document.createElement(m,v.is&&v),i=null,c=!1}if(null===m)f===v||c&&n.data===v||(n.data=v);else{if(i=i&&e.call(n.childNodes),d=(f=o.props||a).dangerouslySetInnerHTML,p=v.dangerouslySetInnerHTML,!c){if(null!=i)for(f={},y=0;y<n.attributes.length;y++)f[n.attributes[y].name]=n.attributes[y].value;(p||d)&&(p&&(d&&p.__html==d.__html||p.__html===n.innerHTML)||(n.innerHTML=p&&p.__html||""))}if(function(e,n,t,o,r){var l;for(l in t)"children"===l||"key"===l||l in n||E(e,l,null,t[l],o);for(l in n)r&&"function"!=typeof n[l]||"children"===l||"key"===l||"value"===l||"checked"===l||t[l]===n[l]||E(e,l,n[l],t[l],o)}(n,v,f,l,c),p)t.__k=[];else if(y=t.props.children,g(n,Array.isArray(y)?y:[y],t,o,r,l&&"foreignObject"!==m,i,s,i?i[0]:o.__k&&h(o,0),c),null!=i)for(y=i.length;y--;)null!=i[y]&&_(i[y]);c||("value"in v&&void 0!==(y=v.value)&&(y!==n.value||"progress"===m&&!y||"option"===m&&y!==f.value)&&E(n,"value",y,f.value,!1),"checked"in v&&void 0!==(y=v.checked)&&y!==n.checked&&E(n,"checked",y,f.checked,!1))}return n}function P(e,t,o){try{"function"==typeof e?e(t):e.current=t}catch(e){n.__e(e,o)}}function T(e,t,o){var r,l;if(n.unmount&&n.unmount(e),(r=e.ref)&&(r.current&&r.current!==e.__e||P(r,null,t)),null!=(r=e.__c)){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(e){n.__e(e,t)}r.base=r.__P=null}if(r=e.__k)for(l=0;l<r.length;l++)r[l]&&T(r[l],t,"function"!=typeof e.type);o||null==e.__e||_(e.__e),e.__e=e.__d=void 0}function A(e,n,t){return this.constructor(e,t)}function N(t,o,r){var l,i,s;n.__&&n.__(t,o),i=(l="function"==typeof r)?null:r&&r.__k||o.__k,s=[],C(o,t=(!l&&r||o).__k=function(n,t,o){var r,l,i,a={};for(i in t)"key"==i?r=t[i]:"ref"==i?l=t[i]:a[i]=t[i];if(arguments.length>2&&(a.children=arguments.length>3?e.call(arguments,2):o),"function"==typeof n&&null!=n.defaultProps)for(i in n.defaultProps)void 0===a[i]&&(a[i]=n.defaultProps[i]);return d(n,a,r,l,null)}(p,null,[t]),i||a,a,void 0!==o.ownerSVGElement,!l&&r?[r]:i?null:o.firstChild?e.call(o.childNodes):null,s,!l&&r?r:i?i.__e:o.firstChild,l),M(s,t)}e=s.slice,n={__e:function(e,n,t,o){for(var r,l,i;n=n.__;)if((r=n.__c)&&!r.__)try{if((l=r.constructor)&&null!=l.getDerivedStateFromError&&(r.setState(l.getDerivedStateFromError(e)),i=r.__d),null!=r.componentDidCatch&&(r.componentDidCatch(e,o||{}),i=r.__d),i)return r.__E=r}catch(n){e=n}throw e}},o=0,f.prototype.setState=function(e,n){var t;t=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=u({},this.state),"function"==typeof e&&(e=e(u({},t),this.props)),e&&u(t,e),null!=e&&this.__v&&(n&&this.__h.push(n),m(this))},f.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),m(this))},f.prototype.render=p,r=[],l="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,y.__r=0;var O=0;function j(e,t,o,r,l){var i,a,s={};for(a in t)"ref"==a?i=t[a]:s[a]=t[a];var c={type:e,props:s,key:o,ref:i,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:--O,__source:l,__self:r};if("function"==typeof e&&(i=e.defaultProps))for(a in i)void 0===s[a]&&(s[a]=i[a]);return n.vnode&&n.vnode(c),c}const D=Symbol("Comlink.proxy"),z=Symbol("Comlink.endpoint"),R=Symbol("Comlink.releaseProxy"),U=Symbol("Comlink.thrown"),H=e=>"object"==typeof e&&null!==e||"function"==typeof e,I=new Map([["proxy",{canHandle:e=>H(e)&&e[D],serialize(e){const{port1:n,port2:t}=new MessageChannel;return W(e,n),[t,[t]]},deserialize:e=>(e.start(),Z(e,[],undefined))}],["throw",{canHandle:e=>H(e)&&U in e,serialize({value:e}){let n;return n=e instanceof Error?{isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:{isError:!1,value:e},[n,[]]},deserialize(e){if(e.isError)throw Object.assign(new Error(e.value.message),e.value);throw e.value}}]]);function W(e,n=self){n.addEventListener("message",(function t(o){if(!o||!o.data)return;const{id:r,type:l,path:i}=Object.assign({path:[]},o.data),a=(o.data.argumentList||[]).map(V);let s;try{const n=i.slice(0,-1).reduce(((e,n)=>e[n]),e),t=i.reduce(((e,n)=>e[n]),e);switch(l){case"GET":s=t;break;case"SET":n[i.slice(-1)[0]]=V(o.data.value),s=!0;break;case"APPLY":s=t.apply(n,a);break;case"CONSTRUCT":s=function(e){return Object.assign(e,{[D]:!0})}(new t(...a));break;case"ENDPOINT":{const{port1:n,port2:t}=new MessageChannel;W(e,t),s=function(e,n){return $.set(e,n),e}(n,[n])}break;case"RELEASE":s=void 0;break;default:return}}catch(e){s={value:e,[U]:0}}Promise.resolve(s).catch((e=>({value:e,[U]:0}))).then((e=>{const[o,i]=J(e);n.postMessage(Object.assign(Object.assign({},o),{id:r}),i),"RELEASE"===l&&(n.removeEventListener("message",t),F(n))}))})),n.start&&n.start()}function F(e){(function(e){return"MessagePort"===e.constructor.name})(e)&&e.close()}function B(e){if(e)throw new Error("Proxy has been released and is not useable")}function Z(e,n=[],t=function(){}){let o=!1;const r=new Proxy(t,{get(t,l){if(B(o),l===R)return()=>Y(e,{type:"RELEASE",path:n.map((e=>e.toString()))}).then((()=>{F(e),o=!0}));if("then"===l){if(0===n.length)return{then:()=>r};const t=Y(e,{type:"GET",path:n.map((e=>e.toString()))}).then(V);return t.then.bind(t)}return Z(e,[...n,l])},set(t,r,l){B(o);const[i,a]=J(l);return Y(e,{type:"SET",path:[...n,r].map((e=>e.toString())),value:i},a).then(V)},apply(t,r,l){B(o);const i=n[n.length-1];if(i===z)return Y(e,{type:"ENDPOINT"}).then(V);if("bind"===i)return Z(e,n.slice(0,-1));const[a,s]=G(l);return Y(e,{type:"APPLY",path:n.map((e=>e.toString())),argumentList:a},s).then(V)},construct(t,r){B(o);const[l,i]=G(r);return Y(e,{type:"CONSTRUCT",path:n.map((e=>e.toString())),argumentList:l},i).then(V)}});return r}function G(e){const n=e.map(J);return[n.map((e=>e[0])),(t=n.map((e=>e[1])),Array.prototype.concat.apply([],t))];var t}const $=new WeakMap;function J(e){for(const[n,t]of I)if(t.canHandle(e)){const[o,r]=t.serialize(e);return[{type:"HANDLER",name:n,value:o},r]}return[{type:"RAW",value:e},$.get(e)||[]]}function V(e){switch(e.type){case"HANDLER":return I.get(e.name).deserialize(e.value);case"RAW":return e.value}}function Y(e,n,t){return new Promise((o=>{const r=new Array(4).fill(0).map((()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16))).join("-");e.addEventListener("message",(function n(t){t.data&&t.data.id&&t.data.id===r&&(e.removeEventListener("message",n),o(t.data))})),e.start&&e.start(),e.postMessage(Object.assign({id:r},n),t)}))}var q=t(379),X=t.n(q),K=t(428);X()(K.Z,{insert:"head",singleton:!1}),K.Z.locals;var Q=t(462);X()(Q.Z,{insert:"head",singleton:!1}),Q.Z.locals;class ee extends f{render(){const e={__html:this.props.html},n=[];return this.props.language&&n.push("language-"+this.props.language),j(p,{children:[j("div",{id:"controls",children:j("button",{children:"beautify"})}),j("div",{id:"file-content",children:j("pre",{children:j("code",{class:n.join(" "),dangerouslySetInnerHTML:e})})})]})}}window.opener?W(new class{async show(e,n,t){document.title=e,N(j(ee,{html:n,language:t}),document.body)}ping(){return"pong"}},function(e,n=self,t="*"){return{postMessage:(n,o)=>e.postMessage(n,t,o),addEventListener:n.addEventListener.bind(n),removeEventListener:n.removeEventListener.bind(n)}}(window.opener)):N(j("section",{id:"error",children:"Failed to connect with opener window."}),document.body)})()})();