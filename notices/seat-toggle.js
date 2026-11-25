/* 정산판 좌석표·페어 켜기/끄기 — 기본은 켜짐, 끄면 정산판과 이미지 저장에서 빠짐 */
(function(){
  var st=document.createElement('style');
  st.textContent='html.np-seat-off .np-seat-t,html.np-pair-off .np-pair-t{display:none!important}'+
    '.np-seat-sw{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin:16px auto;max-width:720px;padding:0 10px}'+
    '.np-seat-sw button{display:inline-flex;align-items:center;gap:9px;background:transparent;color:inherit;border:1px solid currentColor;border-radius:999px;padding:5px 13px 5px 10px;font:700 11.5px "Noto Sans KR",sans-serif;cursor:pointer;opacity:.8;min-height:32px}'+
    '.np-seat-sw button:hover{opacity:1}'+
    '.np-seat-sw i{position:relative;width:24px;height:14px;border-radius:999px;background:currentColor;opacity:.85;flex:none}'+
    '.np-seat-sw i::after{content:"";position:absolute;top:2px;left:12px;width:10px;height:10px;border-radius:50%;background:#fff;transition:left .15s}'+
    '.np-seat-sw.np-dk i::after{background:#2b1d1d}.np-seat-sw button[aria-pressed=false] i{opacity:.3}.np-seat-sw button[aria-pressed=false] i::after{left:2px}';
  document.head.appendChild(st);
  function get(k){try{return localStorage.getItem(k)==='1'}catch(e){return false}}
  function seatTargets(){ var t=[].slice.call(document.querySelectorAll('.seat-map-section,.jseat-map-wrap'));
    var hy=document.querySelector('.jseat-map-wrap'),p=hy&&hy.previousElementSibling;
    if(p&&/탑승권|좌석/.test(p.textContent||''))t.push(p); return t; }
  function pairTargets(){ var t=[].slice.call(document.querySelectorAll('#pairHead,#pairList,.pair-section,#jpair-grid'));
    t.slice().forEach(function(e){var p=e.previousElementSibling;
      if(p&&t.indexOf(p)<0&&(p.textContent||'').length<20&&/페어|PAIR/i.test(p.textContent||''))t.push(p)}); return t; }
  function init(){
    var defs=[{t:seatTargets(),k:'np-seatmap-off',c:'np-seat-off',on:'좌석표 같이 보기',off:'좌석표 숨김'},
              {t:pairTargets(),k:'np-pair-off',c:'np-pair-off',on:'페어 정산 같이 보기',off:'페어 정산 숨김'}].filter(function(d){return d.t.length});
    if(!defs.length)return;
    if(defs.length===1&&defs[0].c==='np-seat-off'){defs[0].on='정산판에 좌석표 같이 보기';defs[0].off='좌석표 숨김 · 카운팅만 보기'}
    var first=defs[0].t[0];
    var cap=first.closest('#captureArea,#capture-area,.jeongsan-wrap')||document.querySelector('.settle-wrap')||first;
    var box=document.createElement('div');box.className='np-seat-sw';
    cap.parentNode.insertBefore(box,cap);
    defs.forEach(function(d){
      d.t.forEach(function(e){e.classList.add(d.c==='np-seat-off'?'np-seat-t':'np-pair-t')});
      var b=document.createElement('button');b.type='button';b.innerHTML='<i aria-hidden="true"></i><span></span>';box.appendChild(b);
      function set(o){document.documentElement.classList.toggle(d.c,o);b.setAttribute('aria-pressed',String(!o));b.querySelector('span').textContent=o?d.off:d.on}
      set(get(d.k));
      b.addEventListener('click',function(){var o=!document.documentElement.classList.contains(d.c);set(o);try{localStorage.setItem(d.k,o?'1':'0')}catch(e){}});
    });
    function lum(c){var m=String(c).match(/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+))?/);if(!m)return null;if(m[4]!==undefined&&+m[4]<.4)return null;return (0.299*m[1]+0.587*m[2]+0.114*m[3])/255}
    function paint(){try{var ref=document.querySelector('#np-tabs button[aria-selected=true]');if(ref){box.style.color=getComputedStyle(ref).color;return}
      for(var e=box.parentElement;e;e=e.parentElement){var cs=getComputedStyle(e),L=lum(cs.backgroundColor);if(L===null){var g=(cs.backgroundImage||'').match(/rgba?\([^)]+\)/);if(g)L=lum(g[0])}
        if(L!==null){box.style.color=L<.45?'#f1e2bf':'';box.classList.toggle('np-dk',L<.45);return}}}catch(_){}}
    paint();setTimeout(paint,600);setTimeout(paint,2000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

/* 아이폰·인앱브라우저 정산판 저장 — 다운로드 대신 이미지 창을 띄워 '사진에 저장'/길게 눌러 저장 */
(function(){
  var ua=navigator.userAgent||'';
  var IOS=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var INAPP=/KAKAOTALK|Instagram|FBAN|FBAV|NAVER\(inapp|Line\/|DaumApps|everytimeApp/i.test(ua);
  if(!IOS&&!INAPP)return;
  var st=document.createElement('style');
  st.textContent='.np-sv{position:fixed;inset:0;z-index:2147483000;background:#0c0a0a;display:flex;flex-direction:column;align-items:center;padding:14px 12px calc(14px + env(safe-area-inset-bottom));box-sizing:border-box;font-family:"Noto Sans KR",sans-serif;color:#fff}'+
    '.np-sv p{margin:2px 0 10px;font-size:13px;font-weight:700;text-align:center;line-height:1.5;opacity:.92}'+
    '.np-sv .np-sv-im{flex:1;min-height:0;width:100%;overflow:auto;-webkit-overflow-scrolling:touch;text-align:center}'+
    '.np-sv img{max-width:100%;height:auto;-webkit-touch-callout:default;user-select:auto;border-radius:6px}'+
    '.np-sv .np-sv-b{display:flex;gap:8px;margin-top:12px;width:100%;max-width:420px}'+
    '.np-sv button{flex:1;min-height:46px;border-radius:12px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.1);color:#fff;font:800 14px "Noto Sans KR",sans-serif}'+
    '.np-sv button.np-sv-main{background:#fff;color:#111;border-color:#fff}';
  document.head.appendChild(st);
  function toBlob(url){return fetch(url).then(function(r){return r.blob()})}
  function show(url,name){
    var box=document.createElement('div');box.className='np-sv';
    var canShare=!!(navigator.share&&navigator.canShare);
    box.innerHTML='<p>'+(canShare?'아래 <b>사진에 저장</b>을 누르거나, ':'')+'이미지를 <b>길게 눌러</b> 사진에 저장해 주세요</p>'+
      '<div class="np-sv-im"><img alt="정산판 이미지"></div><div class="np-sv-b">'+
      (canShare?'<button type="button" class="np-sv-main" data-a="share">사진에 저장</button>':'')+
      '<button type="button" data-a="close">닫기</button></div>';
    box.querySelector('img').src=url;
    document.body.appendChild(box);
    box.addEventListener('click',function(e){var a=e.target.closest('button');if(!a)return;
      if(a.dataset.a==='close'){box.remove();return}
      toBlob(url).then(function(b){var f=new File([b],name||'정산판.jpg',{type:b.type||'image/jpeg'});
        if(navigator.canShare({files:[f]}))return navigator.share({files:[f]});
        throw new Error('noshare');
      }).catch(function(err){if(err&&err.name==='AbortError')return;a.textContent='길게 눌러 저장해 주세요'});
    });
  }
  var keep={};
  var rv=URL.revokeObjectURL;URL.revokeObjectURL=function(u){if(keep[u])return;return rv.apply(URL,arguments)};
  if(navigator.share){var osh=navigator.share.bind(navigator);
    navigator.share=function(data){return osh(data).catch(function(e){
      var f=data&&data.files&&data.files[0];
      if(e&&e.name==='NotAllowedError'&&f&&/^image\//.test(f.type||'')){var u=URL.createObjectURL(f);keep[u]=1;show(u,f.name);return}
      throw e;})};}
  var orig=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){
    var h=this.getAttribute('href')||'',d=this.getAttribute('download');
    if(d!==null&&(/^data:image\//.test(h)||(/^blob:/.test(h)&&/\.(jpe?g|png|webp)$/i.test(d)))){if(/^blob:/.test(h))keep[h]=1;show(h,d);return}
    return orig.apply(this,arguments);
  };
})();
