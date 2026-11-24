/* 공지 아카이브 → 스케줄표 이벤트 태그
   notices/events.json 의 이벤트를 각 회차 날짜 칸 아래에 붙여요.
   정산판 코드는 건드리지 않고, 이미 같은 링크/이름의 태그가 있으면 건너뜁니다. */
(function(){
  var DATA=null, busy=false;
  function sidOf(u){var m=String(u||'').match(/status\/(\d+)/);return m?m[1]:'';}
  function rowInfo(r){
    var sid=r.getAttribute('data-sid')||'', mo, d, t='';
    var m=sid.match(/^(?:\d{2})?(\d{2})(\d{2})-(\d{2})(\d{2})$/);
    if(m){mo=+m[1];d=+m[2];t=m[3]+':'+m[4];}
    else{
      var tx=(r.innerText||r.textContent||'');
      var a=tx.match(/(\d{1,2})\s*(?:\/|월\s*)(\d{1,2})/); if(a){mo=+a[1];d=+a[2];}
      var b=tx.match(/(\d{1,2}):(\d{2})/); if(b)t=('0'+b[1]).slice(-2)+':'+b[2];
    }
    return mo?{mo:mo,d:d,t:t}:null;
  }
  function parseMD(s){var m=String(s).match(/(\d{1,2})\/(\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);return m?{mo:+m[1],d:+m[2],t:m[3]?(('0'+m[3]).slice(-2)+':'+m[4]):''}:null;}
  function apply(){
    if(!DATA||busy)return; busy=true;
    try{
      var rows=[].slice.call(document.querySelectorAll('.row[data-sid]')); if(!rows.length)return;
      var infos=rows.map(rowInfo), startM=null;
      for(var i=0;i<infos.length;i++){if(infos[i]){startM=infos[i].mo;break;}}
      var ord=function(o){return ((o.mo<startM?o.mo+12:o.mo)*40)+o.d;};
      (DATA.events||[]).forEach(function(e){
        var on=(e.on||[]).map(parseMD).filter(Boolean), fr=e.from?parseMD(e.from):null, to=e.to?parseMD(e.to):null;
        rows.forEach(function(r,i){
          var o=infos[i]; if(!o)return;
          var hit=false;
          on.forEach(function(x){if(x.mo===o.mo&&x.d===o.d&&(!x.t||x.t===o.t))hit=true;});
          if(fr&&to&&ord(o)>=ord(fr)&&ord(o)<=ord(to)&&(!e.times||e.times.indexOf(o.t)>-1))hit=true;
          if(!hit)return;
          var cell=r.querySelector('.cell.date,.cell.info')||r.querySelector('.cell'); if(!cell)return;
          var tags=[].slice.call(r.querySelectorAll('.event-tag')), sid=sidOf(e.url), dup=false;
          tags.forEach(function(g){var h=g.getAttribute('href')||'';if((sid&&sidOf(h)===sid&&g.textContent.trim()===e.label)||g.textContent.trim()===e.label)dup=true;});
          if(dup)return;
          var a=document.createElement('a');a.className=(DATA.tagClass||'event-tag')+' np-ev';a.href=e.url;a.target='_blank';a.rel='noopener';a.textContent=e.label;
          var last=tags.length?tags[tags.length-1]:null;
          if(last&&last.parentNode)last.parentNode.insertBefore(a,last.nextSibling);else cell.appendChild(a);
        });
      });
    }finally{busy=false;}
  }
  function start(){
    fetch('notices/events.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(j){
      if(!j)return; DATA=j; apply();
      var t=null; new MutationObserver(function(){if(busy)return;clearTimeout(t);t=setTimeout(apply,120);}).observe(document.body,{childList:true,subtree:true});
    }).catch(function(){});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
