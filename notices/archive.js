/* 공지 아카이브 탭 — notices/notices.json 과 notices/img/*.webp 를 읽어 그린다 */
(function(){
var root=document.getElementById('np'),tabs=document.getElementById('np-tabs');
if(!root||!tabs)return;
var BASE=root.getAttribute('data-base')||'notices/';
var ACC=root.getAttribute('data-account')||'';
var WD='일월화수목금토';
var items=[],loaded=false,loading=false,cat='전체',q='',open={},lbList=[],lbIdx=0,updatedAt=null;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function link(s){return esc(s).replace(/https:\/\/[^\s<>"']+/g,function(u){return '<a href="'+u+'" target="_blank" rel="noopener">'+u+'</a>'})}
function kst(iso){return new Date(new Date(iso).getTime()+9*3600e3)}
function two(n){return String(n).padStart(2,'0')}
function head(x,n){return (x.text||'').slice(0,n)}
function catOf(t){var h=t.slice(0,80);
  if(/캐스팅 변경|캐스트 및 공연 일정|일정 변경|하차|지연 입장|캐스팅 참여 일정|합류 예정|캐스팅 공개|뉴캐스트 공개/.test(t))return'캐스팅·일정';
  if(/재관람/.test(h))return'이벤트·안내';
  if(/티켓 ?오픈|타임세일|할인|무통장|권종|프로모션|판매보류|예매처/.test(t.slice(0,280)))return'티켓';
  if(/(^|[^A-Z])MD([^A-Z부]|$)|품절|재입고|프로그램북|대본집|(^|[^A-Z])OST|팔찌|뱃지|손수건/.test(h))return'MD';
  if(/이벤트|위크|WEEK|커튼콜|적립|증정|사인회|관객과의 대화|무대 인사|매진 공약|당첨|살롱|라이브|사전 질문|객석|가사지|증표|넘버리스트|카카오톡|카페|디자인 티켓/.test(h))return'이벤트·안내';
  return'사진·영상'}
function isVid(x){return x.cat==='사진·영상'&&(!!x.video||/youtu\.?be|buly\.kr/.test(x.text||''))}
function titleOf(t){return t.split('\n').map(function(l){return l.trim()}).filter(function(l){return l&&!/^\[[^\]]*\]$|^(뮤지컬|연극) #\S+$|^(뮤지컬|연극) \[[^\]]*\]$|^𝖒𝖚𝖘𝖎𝖈𝖆𝖑|^musical\b/i.test(l)}).slice(0,2).join(' ')}
var DISC=/할인|타임세일|타임 ?티켓|프로모션|특가|토핑|toping|넵프라이즈|비지정석|할인율|반값|(VIP|R|S|A|전)석[^\n]{0,12}\d{1,2} ?%|석 ?\d{1,3}(,\d{3}| ?만) ?원/i;
function isDisc(x){if(x.cat==='MD')return false;var t=x.text||'',ti=titleOf(t);
  if(/재관람|적립/.test(ti)&&!/타임세일|특가|할인율/.test(ti))return false;
  if(DISC.test(ti))return true;
  if(/티켓 ?오픈|캐스팅|스케줄|변경|하차|취소|이벤트/.test(ti))return false;
  return x.cat!=='사진·영상'&&/타임세일|타임 ?티켓|특가|할인율|비지정석|넵프라이즈/.test(t.slice(0,400))}
function isPoster(x){return !!x.poster||/포스터|POSTER/i.test(head(x,100))}
function kind(x){if(!isDisc(x)&&!isPoster(x)&&x.cat==='티켓'&&/이벤트/.test(titleOf(x.text||'')))return '이벤트';return isDisc(x)?'할인':isPoster(x)?'포스터':x.cat==='사진·영상'?(isVid(x)?'영상':'사진'):(x.cat==='티켓'||x.cat==='캐스팅·일정')?'일정':x.cat==='MD'?'MD':'이벤트'}
var KINDS=['전체','일정','이벤트','할인','포스터','사진','영상','MD'];
function file(m){return BASE+'img/'+m.replace(/[^A-Za-z0-9_-]/g,'_')+'.webp'}
function orig(m){return m.indexOf('/')>=0?'https://pbs.twimg.com/'+m:'https://pbs.twimg.com/media/'+m+'?format=jpg&name=orig'}
function tweet(x){return 'https://x.com/'+ACC+'/status/'+x.id}
function ph(x,m,cap){var v=/video_thumb/.test(m);
  return '<button class="np-ph" data-m="'+esc(m)+'" data-id="'+esc(x.id)+'" aria-label="사진 크게 보기"><img src="'+esc(file(m))+'" alt="" loading="lazy" onerror="this.onerror=null;this.src=\''+esc(orig(m)).replace(/'/g,'')+'\'">'+(v?'<span class="np-play">영상</span>':'')+(cap?'<span class="np-cap">'+esc(cap)+'</span>':'')+'</button>'}
function capOf(x){var d=kst(x.ts);var line=(x.text||'').split('\n').map(function(l){return l.trim()}).filter(function(l){return l&&!/^\[[^\]]*\]$|^뮤지컬 #|^뮤지컬 \[|^\[#|^\d+th Anniversary$|^▪/.test(l)})[0]||'';return (d.getUTCMonth()+1+'.'+d.getUTCDate()+' '+line).slice(0,40)}
function card(x){var d=kst(x.ts),k=kind(x);
  var fresh=Date.now()-new Date(x.ts).getTime()<3*864e5;
  var long=(x.text||'').split('\n').length>7||(x.text||'').length>300;
  var media=(x.media||[]).map(function(m){return ph(x,m)}).join('');
  return '<article class="np-n"><div class="np-d"><b>'+two(d.getUTCMonth()+1)+'.'+two(d.getUTCDate())+'</b><span>'+WD[d.getUTCDay()]+' '+two(d.getUTCHours())+':'+two(d.getUTCMinutes())+'</span></div><div>'
   +'<span class="np-tag '+(['사진','영상','포스터'].indexOf(k)>=0?'':'k')+'">'+esc(k)+'</span>'+(fresh?'<span class="np-tag new">NEW</span>':'')
   +'<p class="np-txt '+(long&&!open[x.id]?'clip':'')+'">'+link(x.text)+'</p>'+(long?'<button class="np-more" data-id="'+esc(x.id)+'">'+(open[x.id]?'접기':'더 보기')+'</button>':'')
   +(media?'<div class="np-strip">'+media+'</div>':'')
   +'<div class="np-links">'+(x.video?'<a href="'+esc(tweet(x))+'" target="_blank" rel="noopener">영상 재생 ↗</a>':'')+'<a href="'+esc(tweet(x))+'" target="_blank" rel="noopener">원문 보기 ↗</a></div></div></article>'}
function render(){
  if(!loaded){root.querySelector('.np-list').innerHTML='<p class="np-empty">'+(loading?'공지를 불러오는 중이에요…':'공지를 불러오지 못했어요. 새로고침해 주세요.')+'</p>';return}
  root.querySelector('.np-seg').innerHTML=KINDS.map(function(k){var n=k==='전체'?items.length:items.filter(function(x){return kind(x)===k}).length;return '<button data-c="'+k+'" class="'+(k===cat?'on':'')+'" aria-pressed="'+(k===cat)+'">'+k+'<b>'+n+'</b></button>'}).join('');
  var words=q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  var list=items.filter(function(x){return cat==='전체'||kind(x)===cat}).filter(function(x){var t=(x.text||'').toLowerCase();return words.every(function(w){return t.indexOf(w)>=0})});
  root.querySelector('.np-count').textContent=list.length?list.length+'건':'';
  var html='';lbList=[];
  if(cat==='사진'||cat==='포스터'){list.forEach(function(x){(x.media||[]).forEach(function(m){lbList.push([m,x.id]);html+=ph(x,m,capOf(x))})});html=html?'<div class="np-grid">'+html+'</div>':''}
  else{var mo='';list.forEach(function(x){(x.media||[]).forEach(function(m){lbList.push([m,x.id])});var d=kst(x.ts),k=d.getUTCFullYear()+'. '+(d.getUTCMonth()+1);if(k!==mo){html+='<h3 class="np-month">'+k+'</h3>';mo=k}html+=card(x)})}
  root.querySelector('.np-list').innerHTML=html||'<p class="np-empty">'+(q?'검색어와 맞는 글이 없어요.':'이 분류에는 아직 글이 없어요.')+'</p>';
  if(updatedAt){var c=kst(updatedAt);root.querySelector('.np-sub').textContent='X 공식계정 @'+ACC+'에서 모은 글 · 마지막 업데이트 '+(c.getUTCMonth()+1)+'/'+c.getUTCDate()+' '+two(c.getUTCHours())+':'+two(c.getUTCMinutes())}}
function load(){if(loaded||loading)return;loading=true;render();
  fetch(BASE+'notices.json?v='+Math.floor(Date.now()/3e5),{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    var seen={};items=(d.items||[]).filter(function(x){if(!x||!x.id||seen[x.id]||x.hidden)return false;seen[x.id]=1;return true}).map(function(x){x.media=Array.isArray(x.media)?x.media:[];x.cat=x.cat||catOf(x.text||'');return x}).sort(function(a,b){return a.ts<b.ts?1:-1});
    updatedAt=d.updatedAt||null;loaded=true;loading=false;render()}).catch(function(){loading=false;render()})}
function show(on){document.body.classList.toggle('np-on',on);root.hidden=!on;
  [].forEach.call(tabs.querySelectorAll('button'),function(b){b.setAttribute('aria-selected',String((b.getAttribute('data-t')==='np')===on))});
  if(on)load()}
root.innerHTML='<div class="np-head">공지 아카이브</div><div class="np-sub">X 공식계정 @'+esc(ACC)+'에서 모은 글</div><div class="np-tools"><div class="np-seg" role="group" aria-label="분류"></div><input type="search" placeholder="캐스팅, 티켓, 배우 이름…" aria-label="공지 검색"></div><p class="np-count"></p><div class="np-list"></div><p class="np-note">공식계정 글을 1시간마다 모아요. 사진은 함께 저장돼서 원본 글이 지워져도 남아요.</p>';
tabs.innerHTML='<button type="button" data-t="main" aria-selected="true">출연 일정 · 정산</button><button type="button" data-t="np" aria-selected="false">📢 공지 아카이브</button>';
var lb=document.createElement('div');lb.className='np-lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','사진 크게 보기');
lb.innerHTML='<img alt=""><div><button type="button" data-a="prev">이전</button><a target="_blank" rel="noopener">원본 열기 ↗</a><button type="button" data-a="next">다음</button><button type="button" data-a="close">닫기</button></div>';
document.body.appendChild(lb);
function showLb(){var p=lbList[lbIdx];if(!p)return;var img=lb.querySelector('img');img.onerror=function(){img.onerror=null;img.src=orig(p[0])};img.src=file(p[0]);lb.querySelector('a').href=orig(p[0]);lb.classList.add('on');lb.querySelector('[data-a=close]').focus()}
lb.addEventListener('click',function(e){var a=e.target.getAttribute&&e.target.getAttribute('data-a');if(e.target===lb||a==='close')lb.classList.remove('on');else if(a==='prev'){lbIdx=(lbIdx-1+lbList.length)%lbList.length;showLb()}else if(a==='next'){lbIdx=(lbIdx+1)%lbList.length;showLb()}});
document.addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')lb.classList.remove('on');if(e.key==='ArrowLeft'){lbIdx=(lbIdx-1+lbList.length)%lbList.length;showLb()}if(e.key==='ArrowRight'){lbIdx=(lbIdx+1)%lbList.length;showLb()}});
tabs.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var on=b.getAttribute('data-t')==='np';show(on);try{history.replaceState(null,'',on?'#notice':location.pathname+location.search)}catch(_){}});
root.addEventListener('click',function(e){var p=e.target.closest('.np-ph');if(p){lbIdx=0;for(var i=0;i<lbList.length;i++){if(lbList[i][0]===p.getAttribute('data-m')&&lbList[i][1]===p.getAttribute('data-id')){lbIdx=i;break}}showLb();return}
  var c=e.target.closest('.np-seg button');if(c){cat=c.getAttribute('data-c');render();return}
  var m=e.target.closest('.np-more');if(m){var id=m.getAttribute('data-id');open[id]=!open[id];render()}});
root.querySelector('input').addEventListener('input',function(e){q=e.target.value;render()});
function fromHash(){if(location.hash==='#notice'){show(true);tabs.scrollIntoView({block:'start'})}}
window.addEventListener('hashchange',fromHash);fromHash();
})();
