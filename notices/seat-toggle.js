/* 정산판 좌석표 켜기/끄기 — 기본은 켜짐, 끄면 카운팅만 보이고 이미지 저장에도 빠짐 */
(function(){
  var KEY='np-seatmap-off';
  var st=document.createElement('style');
  st.textContent='html.np-seat-off .np-seat-t{display:none!important}'+
    '.np-seat-sw{display:flex;justify-content:center;margin:0 auto 12px;max-width:720px;padding:0 10px}'+
    '.np-seat-sw button{display:inline-flex;align-items:center;gap:9px;background:transparent;color:inherit;border:1px solid currentColor;border-radius:999px;padding:5px 13px 5px 10px;font:700 11.5px "Noto Sans KR",sans-serif;cursor:pointer;opacity:.8;min-height:32px}'+
    '.np-seat-sw button:hover{opacity:1}'+
    '.np-seat-sw i{position:relative;width:24px;height:14px;border-radius:999px;background:currentColor;opacity:.85;flex:none}'+
    '.np-seat-sw i::after{content:"";position:absolute;top:2px;left:12px;width:10px;height:10px;border-radius:50%;background:#fff;transition:left .15s}'+
    'html.np-seat-off .np-seat-sw i{opacity:.3}html.np-seat-off .np-seat-sw i::after{left:2px}';
  document.head.appendChild(st);
  function off(){try{return localStorage.getItem(KEY)==='1'}catch(e){return false}}
  function targets(){
    var t=[].slice.call(document.querySelectorAll('.seat-map-section,.jseat-map-wrap'));
    var hy=document.querySelector('.jseat-map-wrap'),p=hy&&hy.previousElementSibling;
    if(p&&/탑승권|좌석/.test(p.textContent||''))t.push(p);
    return t;
  }
  function init(){
    var t=targets(); if(!t.length)return;
    t.forEach(function(e){e.classList.add('np-seat-t')});
    var cap=t[0].closest('#captureArea,#capture-area,.jeongsan-wrap')||document.querySelector('.settle-wrap')||t[0];
    var box=document.createElement('div');box.className='np-seat-sw';
    box.innerHTML='<button type="button" aria-pressed="true"><i aria-hidden="true"></i><span>정산판에 좌석표 같이 보기</span></button>';
    cap.parentNode.insertBefore(box,cap);
    try{var ref=document.querySelector('#np-tabs button[aria-selected=true]');if(ref)box.style.color=getComputedStyle(ref).color}catch(e){}
    var b=box.querySelector('button');
    function set(o){document.documentElement.classList.toggle('np-seat-off',o);b.setAttribute('aria-pressed',String(!o));
      b.querySelector('span').textContent=o?'좌석표 숨김 · 카운팅만 보기':'정산판에 좌석표 같이 보기';}
    set(off());
    b.addEventListener('click',function(){var o=!document.documentElement.classList.contains('np-seat-off');set(o);try{localStorage.setItem(KEY,o?'1':'0')}catch(e){}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
