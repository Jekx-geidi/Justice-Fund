import { BRAND_IDS, DEFAULT_BRAND } from './brands';
import { TYPEFACES, TYPEFACE_IDS, googleFontsUrl } from './typefaces';

/**
 * The inline `<script>` source Next embeds verbatim into the document
 * `<head>` (via `dangerouslySetInnerHTML`) so `data-brand`/`data-type` are
 * set before first paint. Written as a plain string template — not a
 * function handed through `Function.prototype.toString()` — because a
 * minifier is free to rename/inline a real function, and `.toString()`
 * would then capture the mangled build output rather than this source.
 * There is exactly one place this logic lives; this string is it.
 */
export function buildPrePaintScript(): string {
  const fontUrls: Record<string, string | null> = Object.fromEntries(
    TYPEFACES.map((pairing) => [pairing.id, googleFontsUrl(pairing)])
  );
  return `(function(){try{
var brandIds=${JSON.stringify(BRAND_IDS)};
var defaultBrand=${JSON.stringify(DEFAULT_BRAND)};
var typeIds=${JSON.stringify(TYPEFACE_IDS)};
var fontUrls=${JSON.stringify(fontUrls)};
var params=new URLSearchParams(window.location.search);
var qBrand=params.get('brand');
var qType=params.get('type');
var brand=qBrand!==null?qBrand:(function(){try{return localStorage.getItem('brand');}catch(e){return null;}})();
var type=qType!==null?qType:(function(){try{return localStorage.getItem('type');}catch(e){return null;}})();
brand=(brand&&brandIds.indexOf(brand)!==-1)?brand:defaultBrand;
type=(type&&typeIds.indexOf(type)!==-1)?type:null;
if(qBrand!==null){try{localStorage.setItem('brand',brand);}catch(e){}}
if(qType!==null){try{if(type)localStorage.setItem('type',type);else localStorage.removeItem('type');}catch(e){}}
try{document.documentElement.dataset.chooserCollapsed=String(localStorage.getItem('chooserCollapsed')!=='false');}catch(e){}
document.documentElement.setAttribute('data-brand',brand);
if(type){
document.documentElement.setAttribute('data-type',type);
var url=fontUrls[type];
if(url){
var link=document.createElement('link');
link.rel='stylesheet';
link.href=url;
link.id='brand-typeface-font';
document.head.appendChild(link);
}
}
}catch(e){}})();`;
}
