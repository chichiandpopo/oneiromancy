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
