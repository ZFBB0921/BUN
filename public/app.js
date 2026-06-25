
// ── Firebase 配置 ──
const FB_CONFIG = {
  apiKey: "AIzaSyDHTP_BKw2xGZFazzJPLsjYo-YUndUaqtI",
  authDomain: "benyin-cms-b5437.firebaseapp.com",
  projectId: "benyin-cms-b5437",
  storageBucket: "benyin-cms-b5437.firebasestorage.app",
  messagingSenderId: "727363404095",
  appId: "1:727363404095:web:cd20fe19488124e8bfd38a"
};
let db=null,uid=null,syncReady=false,unsub=null;
const STORAGE_KEY = 'benyin_backup';

const ACCOUNTS = [
  { id:'acc-001', name:'本殷', type:'Vlog/氛围感', posting:'odd', postDays:[1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31], platforms:['抖音','小红书','B站'] },
  { id:'acc-002', name:'BUNIN本殷', type:'好物种草', posting:'even', postDays:[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30], platforms:['抖音','小红书','B站','闲鱼','电商店铺'] },
  { id:'acc-003', name:'殷然说', type:'感悟分享', posting:'odd', postDays:[1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31], platforms:['抖音','小宇宙'] },
  { id:'acc-004', name:'本殷食叙', type:'美食教程', posting:'even', postDays:[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30], platforms:['抖音','小红书','B站'] },
  { id:'acc-005', name:'本殷视觉', type:'拍摄展示', posting:'odd', postDays:[1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31], platforms:['抖音','闲鱼'] },
  { id:'acc-006', name:'本殷伴行', type:'服务监督', posting:'even', postDays:[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30], platforms:['闲鱼'] }
];

const ACC_CLR = {
  'acc-001':{d:'#D4A574',l:'#F5ECD7'},'acc-002':{d:'#B8956A',l:'#EDE0D0'},
  'acc-003':{d:'#9BA88C',l:'#E1E8DC'},'acc-004':{d:'#D4956A',l:'#F5E5D5'},
  'acc-005':{d:'#9B8CB4',l:'#E4DCF0'},'acc-006':{d:'#7DA898',l:'#D5E8E0'}
};

const PLATFORM_ACCOUNTS = {
  '抖音': ['acc-001','acc-002','acc-003','acc-004','acc-005'],
  '小红书': ['acc-001','acc-002','acc-004'],
  'B站': ['acc-001','acc-002','acc-004'],
  '闲鱼': ['acc-002','acc-005','acc-006'],
  '电商店铺': ['acc-002'],
  '小宇宙': ['acc-003']
};

const STATUSES = ['pending','planning','ready','done'];
const ST_LABEL = {pending:'未开始',planning:'选题中',ready:'待发布',done:'已发布'};
const ST_CLR = {
  pending:{bg:'#F5F5F0',tx:'#9E9E98'},planning:{bg:'#FFF3E0',tx:'#E67E22'},
  ready:{bg:'#E3F0FF',tx:'#2B7BD6'},done:{bg:'#E8F5E9',tx:'#388E3C'}
};
const NEXT_ST = {pending:'planning',planning:'ready',ready:'done',done:'pending'};

function defData(){
  const d={tasks:{},content:[],drafts:[],ideas:[]};
  for(let day=1;day<=31;day++){
    const dt='2026-07-'+String(day).padStart(2,'0');d.tasks[dt]={};
    ACCOUNTS.forEach(a=>{if(a.postDays.includes(day))d.tasks[dt][a.id]={status:'pending',checked:false};});
  }
  ACCOUNTS.forEach(a=>{a.postDays.forEach(day=>{
    const dt='2026-07-'+String(day).padStart(2,'0');
    a.platforms.forEach(p=>{d.content.push({id:'c_'+a.id+'_'+day+'_'+p,accountId:a.id,accountName:a.name,platform:p,date:dt,topic:'',title:'',cover:'待制作',content:'',caption:'',status:'pending',data:{followers:0,likes:0,views:0},link:'',analysis:'',adjustment:'',avoid:''});});
  });});
  d.analytics=[];
  d.ideas=[{id:'i1',account:'本殷',cat:'Vlog日常',desc:'一日品牌主理人工作流记录',plan:'拍摄咖啡-产品检查-会议-收工',priority:'P2',status:'待拍摄'},{id:'i2',account:'BUNIN本殷',cat:'好物种草',desc:'发现小众高级感香薰蜡烛',plan:'特写+场景+音乐+文案',priority:'P1',status:'待选品'},{id:'i3',account:'殷然说',cat:'认知分享',desc:'普通人如何建立个人品牌',plan:'3分钟口播+金句字幕',priority:'P2',status:'待写稿'},{id:'i4',account:'本殷食叙',cat:'美食教程',desc:'给对象做精致晚餐，节假日不去人挤人',plan:'俯拍制作+摆盘+食谱文案',priority:'P1',status:'已生成'},{id:'i5',account:'本殷视觉',cat:'拍摄展示',desc:'香水产品主图拍摄全流程',plan:'布光+参数+对比+成片',priority:'P1',status:'待拍摄'},{id:'i6',account:'本殷伴行',cat:'信息差',desc:'帮粉丝解决AI工具问题',plan:'录屏+常见问题解答',priority:'P2',status:'待准备'},{id:'i7',account:'本殷',cat:'氛围感',desc:'黄昏光影下的日常碎片',plan:'光线-拍摄-Lr调色',priority:'P2',status:'待拍摄'},{id:'i8',account:'BUNIN本殷',cat:'好物种草',desc:'提升幸福感的桌面好物合集',plan:'俯拍+单品+体验',priority:'P1',status:'待选品'},{id:'i9',account:'本殷食叙',cat:'美食分享',desc:'探店小众咖啡馆',plan:'环境-咖啡-甜点-评价',priority:'P1',status:'待探店'}];
  return d;
}


// ── Supabase 初始化 ──
function initFB(){if(window._fbFailed||typeof firebase==="undefined"){ld();syncReady=true;const el=document.getElementById("syncStatus");if(el){el.textContent="○ 离线 (未联网)";el.style.display="inline";el.style.color="var(--muted)";}refreshUI();return;}
  try{
    firebase.initializeApp(FB_CONFIG);
    db=firebase.firestore();
    db.enablePersistence({synchronizeTabs:true}).catch(()=>{});
    // 尝试匿名登录，失败也不影响
    firebase.auth().signInAnonymously().then(()=>{uid=firebase.auth().currentUser?.uid||'anon';}).catch(()=>{uid='anon';}).finally(()=>{startSync();});
    function startSync(){
      unsub=db.collection('app_data').doc('main').onSnapshot(doc=>{
        if(doc.exists){
          const r=doc.data();
          if(!r._ut||!DATA._ut||r._ut>=DATA._ut){
            DATA.tasks=r.tasks||{};DATA.content=r.content||[];DATA.drafts=r.drafts||[];DATA.ideas=r.ideas||[];
            DATA._ut=r._ut||0;
            if(syncReady)refreshUI();
          }
        }else{
          DATA=defData();DATA._ut=Date.now();sv();
        }
        syncReady=true;
        const el=document.getElementById('syncStatus');try{if(el)el.style.display='inline';}catch(e){}
        refreshUI();
      },err=>{console.error(err);ld();syncReady=true;refreshUI();});
    }
  }catch(e){console.error(e);ld();syncReady=true;refreshUI();}
}function sv(){
  DATA._ut=Date.now();
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(DATA));}catch(e){}
  if(db){
    db.collection('app_data').doc('main').set({
      tasks:DATA.tasks,content:DATA.content,drafts:DATA.drafts,ideas:DATA.ideas,analytics:DATA.analytics,platformUrls:DATA.platformUrls,_ut:DATA._ut
    },{merge:true}).then(()=>{
      const el=document.getElementById('syncStatus');if(el){el.textContent='● 已同步';el.style.color='var(--success)';}
    }).catch(()=>{
      const el2=document.getElementById('syncStatus');if(el2){el2.textContent='○ 离线';el2.style.color='var(--muted)';}
    });
  }
}
function ld(){try{const r=localStorage.getItem(STORAGE_KEY);if(r){const p=JSON.parse(r);if(!p.ideas||!p.ideas.length)p.ideas=defData().ideas;if(!p.drafts)p.drafts=[];if(!p.analytics)p.analytics=[];if(!p.platformUrls)p.platformUrls=[];DATA=p;return;}}catch(e){}DATA=defData();}function refreshUI(){
  if(curView==='dashboard')rd();else if(curView==='calendar')rc();
  else if(curView==='creation')rct();else if(curView==='drafts')rdf();
  else if(curView==='tracking')rt();else if(curView==='ideas')ri();
}
let DATA={tasks:{},content:[],drafts:[],ideas:[],analytics:[],platformUrls:[]},curView='dashboard',curAcc=ACCOUNTS[0].id,editCid=null,editIid=null,calY=2026,calM=7,calSel=null,draftSelId=null;
let ctFilterPlatform='',ctFilterAccount='',ctDateFrom='',ctDateTo='',wkFilter='',alPage=0,ctPage=0,deleteMode=false,expandedPlatform=null;
let aiApiKey=localStorage.getItem('deepseek_key')||'';
let aiStep=0,aiPlatform=null,aiAccount=null,aiTopic='',aiTitles=[],aiSelTitle=-1,aiContents=[],aiSelContent=-1;

function esc(s){return s?String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'):'';}
function todayStr(){const n=new Date();return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');}
function todayJul(){const n=new Date();if(n.getFullYear()===2026&&n.getMonth()+1===7)return n.getDate();return 1;}

// NAVIGATION
function nav(v){
  curView=v;document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pg=document.getElementById('page-'+v);if(pg)pg.classList.add('active');
  document.querySelectorAll('#topNav a,#mobileNav a').forEach(a=>a.classList.toggle('active',a.dataset.view===v));
  document.getElementById('mobileNav').classList.remove('show');
  if(v==='dashboard')rd();if(v==='calendar')rc();if(v==='creation')rct();
  if(v==='ai')initAIWizard();if(v==='drafts')rdf();if(v==='tracking')rt();if(v==='ideas')ri();
}
document.querySelectorAll('#topNav a,#mobileNav a').forEach(a=>a.addEventListener('click',function(e){e.preventDefault();nav(this.dataset.view);}));
function toggleMb(){document.getElementById('mobileNav').classList.toggle('show');}

// DASHBOARD
function rd(){
  const td='2026-07-'+String(todayJul()).padStart(2,'0');
  const tt=DATA.tasks[td]||{};const tc=Object.keys(tt).length;
  const allC=DATA.content;const doneC=allC.filter(c=>c.status==='done').length;
  let ttl=0,dn=0;Object.values(DATA.tasks).forEach(day=>Object.values(day).forEach(t=>{ttl++;if(t.checked)dn++;}));
  document.getElementById('statCards').innerHTML=
    '<div class="stat-card"><div class="stat-val" style="color:#E67E22">'+tc+'</div><div class="stat-label">今日发布任务</div></div>'+
    '<div class="stat-card"><div class="stat-val" style="color:#388E3C">'+doneC+'/'+allC.length+'</div><div class="stat-label">内容完成进度</div></div>'+
    '<div class="stat-card"><div class="stat-val">'+(ttl?Math.round(dn/ttl*100):0)+'%</div><div class="stat-label">总打卡完成率</div></div>';
  renderPlatformOverview();document.getElementById('accCards').innerHTML=ACCOUNTS.map(a=>{
    const cl=ACC_CLR[a.id];const ac=DATA.content.filter(c=>c.accountId===a.id);
    const ad=ac.filter(c=>c.status==='done').length;const pct=ac.length?Math.round(ad/ac.length*100):0;
    const sz=68,sw=5,rd=(sz-sw)/2,cir=2*Math.PI*rd,off=cir-(pct/100)*cir;
    const tk=DATA.tasks[td]&&DATA.tasks[td][a.id];const isT=!!tk,ch=tk?tk.checked:false;
    const isDefault=a.id.startsWith('acc-')&&['acc-001','acc-002','acc-003','acc-004','acc-005','acc-006'].includes(a.id);return '<div class="card acc-card card-shadow'+(deleteMode&&!isDefault?' acc-del-target':'')+'" '+(deleteMode&&!isDefault?'onclick="deleteAccount(\''+a.id+'\');"':'')+'><div class="acc-card-bar" style="background:'+cl.l+'"></div>'+(deleteMode&&!isDefault?'<div class="acc-del-overlay"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg><span style="color:#e74c3c;font-weight:600;font-size:13px">删除</span></div>':'')+'<div class="acc-card-body">'+
      '<div class="acc-card-row"><div><div class="acc-card-name">'+a.name+'</div><div class="acc-card-plats">'+a.platforms.map(p=>'<span>'+p+'</span>').join('')+'</div></div>'+
      '<div class="circle-prog"><svg width="'+sz+'" height="'+sz+'"><circle cx="'+(sz/2)+'" cy="'+(sz/2)+'" r="'+rd+'" class="bg-c" stroke="'+cl.l+'" stroke-width="'+sw+'"/><circle cx="'+(sz/2)+'" cy="'+(sz/2)+'" r="'+rd+'" class="fg-c" stroke="'+cl.d+'" stroke-width="'+sw+'" stroke-dasharray="'+cir+'" stroke-dashoffset="'+off+'"/></svg><div class="pct" style="color:'+cl.d+'">'+pct+'%</div></div></div>'+
      '<div class="acc-card-meta">本月 <strong>'+ad+'/'+ac.length+'</strong> &nbsp;|&nbsp; '+(a.posting==='odd'?'奇数日':'偶数日')+'发布</div>'+
      '<div class="acc-card-foot">'+(isT?'<label class="check-wrap" onclick="tglChk(\''+a.id+'\')"><div class="check-box'+(ch?' on':'')+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div><span class="text-sm'+(ch?' text-muted':'')+'">'+(ch?'已完成':'今日打卡')+'</span></label>':'<span class="text-sm text-muted">今日无任务</span>')+
      '<button class="btn btn-sec btn-sm ml-auto" onclick="nav(\'ai\');">AI创作</button></div></div></div>';
  }).join('');
}
function tglChk(id){
  const td='2026-07-'+String(todayJul()).padStart(2,'0');
  if(!DATA.tasks[td]||!DATA.tasks[td][id])return;
  DATA.tasks[td][id].checked=!DATA.tasks[td][id].checked;sv();rd();
}

// CALENDAR
function rc(){
  document.getElementById('calMonthLabel').textContent=calY+'年'+calM+'月';
  const WDS=['一','二','三','四','五','六','日'];
  const fd=new Date(calY,calM-1,1).getDay();const off=fd===0?6:fd-1;
  const dim=new Date(calY,calM,0).getDate();
  const pm=calM===1?12:calM-1,py=calM===1?calY-1:calY;
  const pd=new Date(py,pm,0).getDate();
  let g=[];for(let i=off-1;i>=0;i--)g.push({d:pd-i,dt:py+'-'+String(pm).padStart(2,'0')+'-'+String(pd-i).padStart(2,'0'),inM:false});
  for(let d=1;d<=dim;d++)g.push({d:d,dt:calY+'-'+String(calM).padStart(2,'0')+'-'+String(d).padStart(2,'0'),inM:true});
  const rm=7-(g.length%7);if(rm<7){const nm=calM===12?1:calM+1,ny=calM===12?calY+1:calY;for(let d=1;d<=rm;d++)g.push({d:d,dt:ny+'-'+String(nm).padStart(2,'0')+'-'+String(d).padStart(2,'0'),inM:false});}
  const ts=todayStr();let h='<div class="cal-grid">';
  WDS.forEach(w=>{h+='<div class="cal-wday">'+w+'</div>';});
  g.forEach(gd=>{
    const isT=gd.dt===ts&&gd.inM,isS=gd.dt===calSel;
    const dayTs=DATA.tasks[gd.dt]||{};const tAccs=Object.entries(dayTs).map(([id,t])=>{const a=ACCOUNTS.find(ac=>ac.id===id);return a?{...a,status:t.status,checked:t.checked}:null;}).filter(Boolean);
    let cls=['cal-day'];if(!gd.inM)cls.push('off');if(isT)cls.push('today');if(isS)cls.push('sel');if(tAccs.length&&gd.inM)cls.push('has-tasks');
    h+='<div class="'+cls.join(' ')+'" onclick="calClick(\''+gd.dt+'\','+gd.inM+')"><span>'+gd.d+'</span>';
    if(tAccs.length&&gd.inM){h+='<div class="cal-dots">';tAccs.slice(0,4).forEach(ac=>{const cl=ACC_CLR[ac.id];h+='<span class="cal-dot" style="background:'+(ac.checked?cl.d:cl.l)+'"></span>';});if(tAccs.length>4)h+='<span class="text-xs text-muted">+'+ (tAccs.length-4)+'</span>';h+='</div>';}
    h+='</div>';
  });
  h+='</div>';document.getElementById('calGrid').innerHTML=h;
  rdt();rup();
}
function calClick(dt,inM){if(!inM)return;calSel=calSel===dt?null:dt;rc();}
function calShift(dir){calM+=dir;if(calM>12){calY++;calM=1;}else if(calM<1){calY--;calM=12;}calSel=null;rc();}
function rdt(){
  const c=document.getElementById('dateTasks');
  if(!calSel){c.innerHTML='<div class="date-task-empty">点击日历上的日期查看任务</div>';return;}
  const dayTs=DATA.tasks[calSel]||{};
  const tAccs=Object.entries(dayTs).map(([id,t])=>{const a=ACCOUNTS.find(ac=>ac.id===id);return a?{...a,status:t.status,checked:t.checked}:null;}).filter(Boolean);
  if(!tAccs.length){c.innerHTML='<div class="date-task-empty">当天无发布任务</div>';return;}
  let h='';
  tAccs.forEach(ac=>{
    const cl=ACC_CLR[ac.id];
    const contents=DATA.content.filter(ct=>ct.accountId===ac.id&&ct.date===calSel);
    h+='<div class="date-task-card">';
    h+='<div class="date-task-bar" style="background:'+cl.d+'"></div>';
    h+='<div class="date-task-body">';
    h+='<div class="date-task-head"><span class="date-task-acc" style="background:'+cl.l+';color:'+cl.d+'">'+ac.name+'</span><span class="date-task-count">'+contents.length+'个平台</span></div>';
    h+='<div class="date-task-rows">';
    contents.forEach(ct=>{
      const sc=ST_CLR[ct.status]||ST_CLR.pending;
      h+='<div class="date-task-row">';
      h+='<span class="date-task-plat">'+ct.platform+'</span>';
      h+='<span class="date-task-topic">'+(ct.title?esc(ct.title):'--')+'</span>';
      h+='<button class="date-task-stbtn" style="background:'+sc.bg+';color:'+sc.tx+'" onclick="toggleContentStatus(\''+ct.id+'\',this)">'+ST_LABEL[ct.status]+'</button>';
      h+='</div>';
    });
    h+='</div></div></div>';
  });
  c.innerHTML=h;
}
function cycSt(dt,id){if(!DATA.tasks[dt]||!DATA.tasks[dt][id])return;DATA.tasks[dt][id].status=NEXT_ST[DATA.tasks[dt][id].status]||'pending';if(DATA.tasks[dt][id].status==='done')DATA.tasks[dt][id].checked=true;sv();rc();}
function toggleContentStatus(cid,btn){
  const ct=DATA.content.find(c=>c.id===cid);if(!ct)return;
  ct.status=NEXT_ST[ct.status]||'pending';
  if(ct.status==='done'){
    const dt=ct.date;if(DATA.tasks[dt]&&DATA.tasks[dt][ct.accountId])DATA.tasks[dt][ct.accountId].checked=true;
  }
  // Instantly update the clicked button
  if(btn){
    const sc=ST_CLR[ct.status]||ST_CLR.pending;
    btn.textContent=ST_LABEL[ct.status];
    btn.style.background=sc.bg;
    btn.style.color=sc.tx;
  }
  sv();
}
function rup(){
  const c=document.getElementById('upcomingList');const td7=todayStr();let h='';
  for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()+i);const dt=d.toISOString().split('T')[0];const m=d.getMonth()+1,dy=d.getDate();const WDS2=['周日','周一','周二','周三','周四','周五','周六'];const isT=dt===td7;const dayTs=DATA.tasks[dt]||{};const tAccs=Object.entries(dayTs).map(([id,t])=>{const a=ACCOUNTS.find(ac=>ac.id===id);return a?{...a,status:t.status,checked:t.checked}:null;}).filter(Boolean);
    h+='<div class="upcoming-day'+(isT?' today':'')+'"><div class="upcoming-date">'+m+'月'+dy+'日 '+WDS2[d.getDay()]+(isT?' <span class="upcoming-today-badge">今天</span>':'')+(tAccs.length===0?' <span class="text-sm" style="opacity:.5">无排期</span>':'')+'</div>';
    if(tAccs.length){h+='<div class="upcoming-items">';tAccs.forEach(ac=>{
      const cl=ACC_CLR[ac.id];
      const dayContents=DATA.content.filter(ct=>ct.accountId===ac.id&&ct.date===dt);
      h+='<span class="upcoming-acc" style="background:'+cl.l+';color:'+cl.d+'">'+ac.name+'</span>';
      if(dayContents.length){
        dayContents.forEach(dc=>{
          const sc=ST_CLR[dc.status]||ST_CLR.pending;
          h+='<span class="upcoming-plat" style="background:'+sc.bg+';color:'+sc.tx+'">'+dc.platform+'</span>';
        });
      }
    });h+='</div>';}
    h+='</div>';
  }c.innerHTML=h;
}
function rct(){
  // ── Unified filter bar ──
  const allPlats=[...new Set(DATA.content.map(c=>c.platform))].sort();
  let fh='<div class="filter-bar"><span style="font-size:13px;font-weight:600;color:var(--fg-soft);margin-right:4px;display:flex;align-items:center;gap:4px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>筛选</span>';
  // Account dropdown
  fh+='<select class="form-sel filter-sel" onchange="ctFilterAccount=this.value;rct();">';
  fh+='<option value="">全部账号</option>';
  ACCOUNTS.forEach(a=>{fh+='<option value="'+a.id+'"'+(ctFilterAccount===a.id?' selected':'')+'>'+a.name+'</option>';});
  fh+='</select>';
  // Platform dropdown
  fh+='<select class="form-sel filter-sel" onchange="ctFilterPlatform=this.value;rct();">';
  fh+='<option value="">全部平台</option>';
  allPlats.forEach(p=>{fh+='<option value="'+p+'"'+(ctFilterPlatform===p?' selected':'')+'>'+p+'</option>';});
  fh+='</select>';
  // Date range
  fh+='<input class="form-inp filter-inp" type="date" value="'+ctDateFrom+'" onchange="ctDateFrom=this.value;rct();" placeholder="起始日期">';
  fh+='<span class="filter-sep">至</span>';
  fh+='<input class="form-inp filter-inp" type="date" value="'+ctDateTo+'" onchange="ctDateTo=this.value;rct();" placeholder="结束日期">';
  // Clear button
  fh+='<button class="btn btn-pri btn-sm" style="margin-left:4px" onclick="openAddContent()">+ 新增</button>';
  fh+='<button class="btn btn-ghost btn-sm filter-clear" onclick="ctFilterAccount=\x27\x27;ctFilterPlatform=\x27\x27;ctDateFrom=\x27\x27;ctDateTo=\x27\x27;rct();">清除筛选</button>';
  fh+='</div>';
  document.getElementById('creationTabs').innerHTML=fh;

  ctPage=0;
  // ── Filter + Sort ──
  let items=DATA.content.slice();
  if(ctFilterAccount) items=items.filter(c=>c.accountId===ctFilterAccount);
  if(ctFilterPlatform) items=items.filter(c=>c.platform===ctFilterPlatform);
  if(ctDateFrom) items=items.filter(c=>c.date>=ctDateFrom);
  if(ctDateTo) items=items.filter(c=>c.date<=ctDateTo);
  items.sort((a,b)=>a.date.localeCompare(b.date)||a.platform.localeCompare(b.platform)||a.accountName.localeCompare(b.accountName));

  // ── Pagination ──
  const perPage=20;
  const totalPages=Math.ceil(items.length/perPage);
  if(ctPage>=totalPages) ctPage=Math.max(0,totalPages-1);
  const pageItems=items.slice(ctPage*perPage,(ctPage+1)*perPage);
  
  // ── Table ──
  let h='';
  if(items.length>perPage){
    h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">';
    h+='<span class="text-xs text-muted">共 '+items.length+' 条</span>';
    h+='<div class="flex gap-8">';
    if(ctPage>0) h+='<button class="btn btn-ghost btn-xs" onclick="ctPage=0;rct();">首页</button>';
    if(ctPage>0) h+='<button class="btn btn-ghost btn-xs" onclick="ctPage--;rct();">上一页</button>';
    h+='<span class="text-xs" style="padding:4px 8px">'+(ctPage+1)+'/'+totalPages+'</span>';
    if(ctPage<totalPages-1) h+='<button class="btn btn-ghost btn-xs" onclick="ctPage++;rct();">下一页</button>';
    if(ctPage<totalPages-1) h+='<button class="btn btn-ghost btn-xs" onclick="ctPage='+(totalPages-1)+';rct();">末页</button>';
    h+='</div></div>';
  }
  h+='<table><thead><tr><th>日期</th><th>账号</th><th>平台</th><th>选题大纲</th><th>标题</th><th>状态</th><th>总数据</th><th>发布链接</th><th>操作</th></tr></thead><tbody>';
  pageItems.forEach(it=>{const sc=ST_CLR[it.status]||ST_CLR.pending;
    const dd=it.data||it.data1d||{followers:0,likes:0,views:0};
    const f=(dd.followers||0);const tdStr='粉'+(f>999?(f/1000).toFixed(1)+'k':f)+' 赞'+(dd.likes||0)+' 观'+(dd.views||0);
    h+='<tr><td>'+it.date.slice(5)+'</td><td style="font-weight:500;font-size:12px">'+it.accountName+'</td><td>'+it.platform+'</td><td style="max-width:130px;cursor:pointer;font-size:12px" onclick="openCM(\''+it.id+'\')">'+(it.topic?esc(it.topic).substring(0,28)+(it.topic.length>28?'...':''):'<span style="color:#CCC">点击填写</span>')+'</td><td style="max-width:120px;font-size:12px">'+(it.title?esc(it.title).substring(0,18)+(it.title.length>18?'...':''):'-')+'</td><td><span class="badge" style="background:'+sc.bg+';color:'+sc.tx+'">'+ST_LABEL[it.status]+'</span></td><td style="font-size:11px">'+tdStr+'</td><td style="max-width:150px;font-size:11px">'+(it.link?'<a href="'+esc(it.link)+'" target="_blank" style="color:var(--primary);word-break:break-all">'+esc(it.link).substring(0,28)+'...</a>':'-')+'</td><td style="white-space:nowrap"><button class="btn btn-sec btn-sm" onclick="openCM(\''+it.id+'\')">编辑</button> <button class="btn btn-ghost btn-sm" style="color:#D4A0A0" onclick="deleteContent(\''+it.id+'\')">删除</button></td></tr>';
  });h+='</tbody></table>';document.getElementById('creationTable').innerHTML=h;
}
function openCM(id){editCid=id;const it=DATA.content.find(c=>c.id===id);if(!it)return;
  // Ensure unified data field exists (migrate from old format)
  if(!it.data){it.data={followers:0,likes:0,views:0};if(it.data1d){it.data.likes=(it.data1d.likes||0)+(it.data3d?it.data3d.likes||0:0);it.data.views=(it.data1d.views||0)+(it.data3d?it.data3d.views||0:0);}}
  if(!it.link)it.link='';
  document.getElementById('contentModalTitle').textContent='编辑 \u00b7 '+it.accountName+' \u00b7 '+it.platform+' \u00b7 '+it.date;
  document.getElementById('contentModalBody').innerHTML=
    '<div class="form-grp"><label class="form-lbl">选题大纲</label><textarea class="form-txt" id="edT">'+esc(it.topic)+'</textarea></div>'+
    '<div class="form-grp"><label class="form-lbl">标题</label><input class="form-inp" id="edTi" value="'+esc(it.title)+'"></div>'+
    '<div class="form-grp"><label class="form-lbl">封面</label><input class="form-inp" id="edCv" value="'+esc(it.cover)+'"></div>'+
    '<div class="form-grp"><label class="form-lbl">发布链接</label><input class="form-inp" id="edLk" value="'+esc(it.link)+'" placeholder="https://..."></div>'+
    '<div class="form-grp"><label class="form-lbl">内容脚本</label><textarea class="form-txt" id="edCt" style="min-height:120px">'+esc(it.content)+'</textarea></div>'+
    '<div class="form-grp"><label class="form-lbl">发布文案</label><textarea class="form-txt" id="edCp" style="min-height:80px">'+esc(it.caption)+'</textarea></div>'+
    '<div class="form-grp"><label class="form-lbl">状态</label><select class="form-sel" id="edSt">'+STATUSES.map(s=>'<option value="'+s+'" '+(it.status===s?'selected':'')+'>'+ST_LABEL[s]+'</option>').join('')+'</select></div>'+
    '<div><label class="form-lbl">核心数据</label><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+['followers','likes','views'].map(k=>'<div><small>'+(k==='followers'?'粉丝':k==='likes'?'获赞':'观看')+'</small><input class="form-inp" type="number" id="edDt'+k+'" value="'+(it.data[k]||0)+'"></div>').join('')+'</div></div>'+
    '<div class="form-grp mt-8"><label class="form-lbl">数据分析</label><textarea class="form-txt" id="edAn">'+esc(it.analysis)+'</textarea></div>'+
    '<div class="form-grp"><label class="form-lbl">调整建议</label><textarea class="form-txt" id="edAj">'+esc(it.adjustment)+'</textarea></div>'+
    '<div class="form-grp"><label class="form-lbl">需避免问题</label><textarea class="form-txt" id="edAv">'+esc(it.avoid)+'</textarea></div>';
  document.getElementById('contentModal').classList.add('show');
}

function closeCM(){document.getElementById('contentModal').classList.remove('show');editCid=null;}
function saveCM(){
  if(!editCid)return;const it=DATA.content.find(c=>c.id===editCid);if(!it)return;
  it.topic=document.getElementById('edT').value;it.title=document.getElementById('edTi').value;
  it.cover=document.getElementById('edCv').value;it.link=document.getElementById('edLk').value;it.content=document.getElementById('edCt').value;
  it.caption=document.getElementById('edCp').value;it.status=document.getElementById('edSt').value;
  ['followers','likes','views'].forEach(k=>{it.data[k]=parseInt(document.getElementById('edDt'+k).value)||0;});
  it.analysis=document.getElementById('edAn').value;it.adjustment=document.getElementById('edAj').value;it.avoid=document.getElementById('edAv').value;
  sv();if(it.status==='done'){if(DATA.tasks[it.date]&&DATA.tasks[it.date][it.accountId])DATA.tasks[it.date][it.accountId].checked=true;}closeCM();rct();
}
function closeContentModal(){closeCM();}

function saveContent(){saveCM();}

function deleteContent(id){
  if(!confirm('确定删除这条内容？此操作不可恢复。'))return;
  DATA.content=DATA.content.filter(c=>c.id!==id);
  sv();rct();
}


// ── Add new content ──
function openAddContent(){
  document.getElementById('addAcc').innerHTML='<option value="">请选择账号</option>'+ACCOUNTS.map(a=>'<option value="'+a.id+'">'+a.name+'</option>').join('');
  document.getElementById('addPlat').innerHTML='<option value="">请先选择账号</option>';
  document.getElementById('addDate').value='';
  document.getElementById('addContentModal').classList.add('show');
}
function updateAddPlatforms(){
  const aid=document.getElementById('addAcc').value;
  if(!aid){document.getElementById('addPlat').innerHTML='<option value="">请先选择账号</option>';return;}
  const acc=ACCOUNTS.find(a=>a.id===aid);
  document.getElementById('addPlat').innerHTML='<option value="">请选择平台</option><option value="__ALL__">全平台 ('+acc.platforms.length+'个)</option>'+acc.platforms.map(p=>'<option value="'+p+'">'+p+'</option>').join('');
}
function closeAddContent(){document.getElementById('addContentModal').classList.remove('show');}
function saveAddContent(){
  const aid=document.getElementById('addAcc').value;
  const plat=document.getElementById('addPlat').value;
  const date=document.getElementById('addDate').value;
  if(!aid||!plat||!date){alert('请填写完整信息');return;}
  const acc=ACCOUNTS.find(a=>a.id===aid);
  const platforms = plat==='__ALL__' ? acc.platforms : [plat];
  platforms.forEach(p=>{
    const newId='c_'+aid+'_'+date+'_'+p+'_'+Date.now()+Math.random().toString(36).slice(2,6);
    DATA.content.push({
      id:newId,accountId:aid,accountName:acc.name,platform:p,date:date,
      topic:'',title:'',cover:'待制作',content:'',caption:'',status:'pending',
      data:{followers:0,likes:0,views:0},link:'',
      analysis:'',adjustment:'',avoid:''
    });
  });
  const dtKey=date;
  if(!DATA.tasks[dtKey])DATA.tasks[dtKey]={};
  if(!DATA.tasks[dtKey][aid])DATA.tasks[dtKey][aid]={status:'pending',checked:false};
  sv();closeAddContent();rct();
}


// TRACKING
function rt(){
  const gd=(c)=>{if(c.data)return c.data;const d={followers:0,likes:0,views:0};if(c.data1d){d.likes=c.data1d.likes||0;d.views=c.data1d.views||0;}if(c.data3d){d.likes+=c.data3d.likes||0;d.views+=c.data3d.views||0;}return d;};
  let h='<table><thead><tr><th>账号</th><th>总篇数</th><th>已发布</th><th>完成率</th><th>粉丝</th><th>总观看</th><th>总点赞</th></tr></thead><tbody>';
  ACCOUNTS.forEach(a=>{const it=DATA.content.filter(c=>c.accountId===a.id);const tl=it.length,dn=it.filter(c=>c.status==='done').length;const pct=tl?Math.round(dn/tl*100):0;const cl=ACC_CLR[a.id];
    let vw=0,lk=0,fl=0;it.forEach(c=>{const d=gd(c);vw+=d.views;lk+=d.likes;fl+=d.followers||0;});
    h+='<tr><td style="font-weight:600">'+a.name+'</td><td>'+tl+'</td><td>'+dn+'</td><td><div class="prog-bar" style="height:4px;margin-bottom:2px"><div class="prog-fill" style="width:'+pct+'%;background:'+cl.d+'"></div></div><span class="text-xs">'+pct+'%</span></td><td>'+fl.toLocaleString()+'</td><td>'+vw.toLocaleString()+'</td><td>'+lk.toLocaleString()+'</td></tr>';
  });h+='</tbody></table>';document.getElementById('trackingTable').innerHTML=h;
  // ── Dynamic weekly computation ──
  const allDates=[...new Set(DATA.content.map(c=>c.date))].sort();
  const weeks=[];
  if(allDates.length>0){
    let ws=new Date(allDates[0]+'T00:00:00');ws.setDate(ws.getDate()-ws.getDay()+1); // Monday of first week
    const lastDate=new Date(allDates[allDates.length-1]+'T00:00:00');
    while(ws<=lastDate){
      const we=new Date(ws);we.setDate(we.getDate()+6);
      const wsStr=ws.toISOString().split('T')[0];
      const weStr=we.toISOString().split('T')[0];
      weeks.push({label:formatWeekLabel(ws,we),start:wsStr,end:weStr});
      ws.setDate(ws.getDate()+7);
    }
  }
  // Week filter dropdown
  let wfH='<div class="flex items-center gap-8 mb-12"><span style="font-weight:700;font-size:14px">每周数据</span>';
  wfH+='<select class="form-sel" style="font-size:12px;padding:4px 10px" onchange="wkFilter=this.value;rt();">';
  wfH+='<option value="">全部周期</option>';
  weeks.forEach((w,i)=>{wfH+='<option value="'+w.start+'"'+(wkFilter===w.start?' selected':'')+'>'+w.label+'</option>';});
  wfH+='</select></div>';
  
  let wh=wfH+'<table><thead><tr><th>周期</th><th>发布数</th><th>总互动</th><th>最佳内容</th><th>本周总结</th></tr></thead><tbody>';
  weeks.forEach(w=>{
    if(wkFilter&&w.start!==wkFilter)return;
    const it=DATA.content.filter(c=>c.date>=w.start&&c.date<=w.end);
    const dn=it.filter(c=>c.status==='done');
    let intr=0;dn.forEach(c=>{const d=gd(c);intr+=d.likes+d.views;});
    wh+='<tr><td>'+w.label+'</td><td>'+dn.length+'/'+it.length+'</td><td>'+intr.toLocaleString()+'</td><td>-</td><td>-</td></tr>';
  });
  wh+='</tbody></table>';document.getElementById('weeklyTable').innerHTML=wh;
  initQuickData(true);initVizSelects();rviz();renderAnalyticsList();
}


// ── Data Visualization ──
let vizChartLine=null,vizChartBar=null;
// ── Quick Data Entry ──
// Pre-save platform URL for auto-fill
function savePlatformUrl(){
  const aid=document.getElementById('qdAccount').value;
  const plat=document.getElementById('qdPlatform').value;
  const url=document.getElementById('qdUrl').value.trim();
  if(!aid||!plat){alert('请先选择账号和平台');return;}
  if(!url){alert('请输入主页链接');return;}
  let pu=DATA.platformUrls.find(u=>u.accountId===aid&&u.platform===plat);
  if(pu){pu.url=url;}
  else{DATA.platformUrls.push({accountId:aid,platform:plat,url:url});}
  sv();
  const urlInp=document.getElementById('qdUrl');
  urlInp.style.borderColor='#4caf50';
  setTimeout(()=>{urlInp.style.borderColor='';},1500);
}
function initQuickData(force){
  const sel=document.getElementById('qdAccount');
  if(!force&&sel.options.length>1)return;
  sel.innerHTML='<option value="">选择账号</option>'+ACCOUNTS.map(a=>'<option value="'+a.id+'">'+a.name+'</option>').join('');
}
function updateQDPlatforms(){
  const aid=document.getElementById('qdAccount').value;
  const platSel=document.getElementById('qdPlatform');
  const urlInp=document.getElementById('qdUrl');
  if(!aid){platSel.innerHTML='<option value="">先选账号</option>';urlInp.value='';return;}
  const acc=ACCOUNTS.find(a=>a.id===aid);
  platSel.innerHTML='<option value="">选择平台</option>'+acc.platforms.map(p=>'<option value="'+p+'">'+p+'</option>').join('');
  platSel.onchange=()=>{
    const p=platSel.value;
    if(!p){urlInp.value='';return;}
    const saved=DATA.platformUrls.find(u=>u.accountId===aid&&u.platform===p);
    urlInp.value=saved?saved.url:'';
    urlInp.placeholder=saved?'':'输入主页链接，保存后下次自动填充';
  };
}
function openProfileUrl(){
  const url=document.getElementById('qdUrl').value.trim();
  if(!url){alert('请输入主页链接');return;}
  window.open(url,'_blank');
}
function saveQuickData(){
  const aid=document.getElementById('qdAccount').value;
  const plat=document.getElementById('qdPlatform').value;
  if(!aid||!plat){alert('请选择账号和平台');return;}
  const fl=parseInt(document.getElementById('qdFollowers').value)||0;
  const lk=parseInt(document.getElementById('qdLikes').value)||0;
  const vw=parseInt(document.getElementById('qdViews').value)||0;
  const today=new Date().toISOString().split('T')[0];
  const acc=ACCOUNTS.find(a=>a.id===aid);
  // Upsert analytics entry
  let entry=DATA.analytics.find(a=>a.accountId===aid&&a.platform===plat&&a.date===today);
  if(entry){
    entry.followers=fl;entry.likes=lk;entry.views=vw;
    entry.url=document.getElementById('qdUrl').value.trim();
  }else{
    DATA.analytics.push({
      id:'an_'+aid+'_'+today+'_'+plat,
      accountId:aid,accountName:acc.name,platform:plat,date:today,
      followers:fl,likes:lk,views:vw,
      url:document.getElementById('qdUrl').value.trim()
    });
  }
  sv();rt();
  document.getElementById('qdFollowers').value='';
  document.getElementById('qdLikes').value='';
  document.getElementById('qdViews').value='';
  alPage=0;const qdUrl=document.getElementById('qdUrl').value.trim();
  // Save URL to platformUrls for auto-fill
  if(qdUrl){
    let pu=DATA.platformUrls.find(u=>u.accountId===aid&&u.platform===plat);
    if(pu){pu.url=qdUrl;}else{
      DATA.platformUrls.push({accountId:aid,platform:plat,url:qdUrl});
    }
  }
  alert('数据已保存！');
  renderAnalyticsList();
  rviz();
}

function renderAnalyticsList(){
  const el=document.getElementById('analyticsList');
  const pager=document.getElementById('analyticsPager');
  if(!el)return;
  if(!DATA.analytics||!DATA.analytics.length){el.innerHTML='<span class="text-muted">暂无数据</span>';pager.innerHTML='';return;}
  
  const dateFrom=document.getElementById('alDateFrom')?.value||'';
  const dateTo=document.getElementById('alDateTo')?.value||'';
  
  let items=[...DATA.analytics];
  if(dateFrom) items=items.filter(a=>a.date>=dateFrom);
  if(dateTo) items=items.filter(a=>a.date<=dateTo);
  items.sort((a,b)=>b.date.localeCompare(a.date)||a.accountName.localeCompare(b.accountName));
  
  const total=items.length;
  const perPage=10;
  const totalPages=Math.ceil(total/perPage);
  if(alPage>=totalPages) alPage=Math.max(0,totalPages-1);
  const start=alPage*perPage;
  const pageItems=items.slice(start,start+perPage);
  
  if(total===0){el.innerHTML='<span class="text-muted">无匹配数据</span>';pager.innerHTML='';return;}
  
  let h='<table style="font-size:12px"><thead><tr><th>日期</th><th>账号</th><th>平台</th><th>粉丝</th><th>获赞</th><th>观看</th><th>操作</th></tr></thead><tbody>';
  pageItems.forEach(a=>{
    h+='<tr><td>'+a.date.slice(5)+'</td><td>'+esc(a.accountName)+'</td><td>'+esc(a.platform)+'</td><td>'+(a.followers||0).toLocaleString()+'</td><td>'+(a.likes||0).toLocaleString()+'</td><td>'+(a.views||0).toLocaleString()+'</td><td><button class="btn btn-ghost btn-xs" style="color:var(--danger)" onclick="deleteAnalytics(\''+a.id+'\')">删除</button></td></tr>';
  });
  h+='</tbody></table>';
  el.innerHTML=h;
  
  // Pagination
  let ph='<span class="text-xs text-muted">共 '+total+' 条</span> ';
  if(totalPages>1){
    if(alPage>0) ph+='<button class="btn btn-ghost btn-xs" onclick="alPage=0;renderAnalyticsList();">首页</button> ';
    if(alPage>0) ph+='<button class="btn btn-ghost btn-xs" onclick="alPage--;renderAnalyticsList();">上一页</button> ';
    ph+='<span class="text-xs">'+(alPage+1)+'/'+totalPages+'</span> ';
    if(alPage<totalPages-1) ph+='<button class="btn btn-ghost btn-xs" onclick="alPage++;renderAnalyticsList();">下一页</button> ';
    if(alPage<totalPages-1) ph+='<button class="btn btn-ghost btn-xs" onclick="alPage='+(totalPages-1)+';renderAnalyticsList();">末页</button>';
  }
  pager.innerHTML=ph;
}
function deleteAnalytics(id){
  if(!confirm('确定删除这条数据记录？'))return;
  DATA.analytics=DATA.analytics.filter(a=>a.id!==id);
  sv();alPage=0;renderAnalyticsList();rviz();
}

function initVizSelects(){
  const accSel=document.getElementById('vizAccount');
  if(accSel.options.length>1)return; // Already initialized
  accSel.innerHTML='<option value="">全部账号</option>'+ACCOUNTS.map(a=>'<option value="'+a.id+'">'+a.name+'</option>').join('');
  const platSel=document.getElementById('vizPlatform');
  const plats=[...new Set(DATA.content.map(c=>c.platform))].sort();
  platSel.innerHTML='<option value="">全部平台</option>'+plats.map(p=>'<option value="'+p+'">'+p+'</option>').join('');
  // Set default date range to first and last content dates
  const allDates=[...new Set([...DATA.content.map(c=>c.date),...DATA.analytics.map(a=>a.date)])].sort();const dates=allDates;
  if(dates.length>0&&!document.getElementById('vizDateFrom').value){
    document.getElementById('vizDateFrom').value=dates[0];
    document.getElementById('vizDateTo').value=dates[dates.length-1];
  }
}
function rviz(){
  if(typeof Chart==="undefined"){setTimeout(rviz,200);return;}
  const accId=document.getElementById('vizAccount').value;
  const plat=document.getElementById('vizPlatform').value;
  const from=document.getElementById('vizDateFrom').value;
  const to=document.getElementById('vizDateTo').value;
  const metric=document.getElementById('vizMetric').value;
  
  // Use analytics data
  let items=DATA.analytics.slice();
  if(accId) items=items.filter(c=>c.accountId===accId);
  if(plat) items=items.filter(c=>c.platform===plat);
  if(from) items=items.filter(c=>c.date>=from);
  if(to) items=items.filter(c=>c.date<=to);
  items.sort((a,b)=>a.date.localeCompare(b.date));
  
  // Aggregate by date
  const dateMap={};
  items.forEach(c=>{
    dateMap[c.date]=(dateMap[c.date]||0)+(c[metric]||0);
  });
  const dates=Object.keys(dateMap).sort();
  const values=dates.map(d=>dateMap[d]);
  const labels=dates.map(d=>d.slice(5));
  
  // Aggregate by account
  const accMap={};
  items.forEach(c=>{
    accMap[c.accountName]=(accMap[c.accountName]||0)+(c[metric]||0);
  });
  const accLabels=Object.keys(accMap);
  const accValues=Object.values(accMap);
  
  const metricLabel={followers:'粉丝',views:'观看',likes:'点赞'}[metric];
  const colors=['#3D3832','#C9A87C','#9BA88C','#9B8CB4','#D4956A','#7DA898'];
  
  if(vizChartLine){vizChartLine.destroy();vizChartLine=null;}
  if(vizChartBar){vizChartBar.destroy();vizChartBar=null;}
  if(labels.length===0){
    document.getElementById('vizLineChart').style.display='none';
    document.getElementById('vizBarChart').style.display='none';
    return;
  }
  document.getElementById('vizLineChart').style.display='';
  document.getElementById('vizBarChart').style.display='';
  
  const ctx1=document.getElementById('vizLineChart').getContext('2d');
  vizChartLine=new Chart(ctx1,{
    type:'line',
    data:{
      labels:labels,
      datasets:[{
        label:metricLabel+'趋势',
        data:values,
        borderColor:'#3D3832',
        backgroundColor:'rgba(61,56,50,.06)',
        borderWidth:2.5,
        pointBackgroundColor:'#3D3832',
        pointRadius:4,pointHoverRadius:7,
        tension:.3,fill:true
      }]
    },
    options:{
      responsive:true,maintainAspectRatio:true,
      animation:{duration:800,easing:'easeInOutQuart'},
      plugins:{legend:{display:false}},
      scales:{
        x:{grid:{display:false},ticks:{font:{size:11}}},
        y:{beginAtZero:true,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}
      }
    }
  });
  
  const ctx2=document.getElementById('vizBarChart').getContext('2d');
  vizChartBar=new Chart(ctx2,{
    type:'bar',
    data:{
      labels:accLabels,
      datasets:[{
        label:metricLabel+'对比',
        data:accValues,
        backgroundColor:accLabels.map((_,i)=>colors[i%colors.length]),
        borderRadius:6,borderSkipped:false
      }]
    },
    options:{
      responsive:true,maintainAspectRatio:true,
      animation:{duration:800,easing:'easeInOutQuart'},
      plugins:{legend:{display:false}},
      scales:{
        x:{grid:{display:false},ticks:{font:{size:11}}},
        y:{beginAtZero:true,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}
      }
    }
  });
}


// AI CREATION WIZARD (DeepSeek)
function initAIWizard(){aiStep=0;aiPlatform=null;aiAccount=null;aiTopic='';aiTitles=[];aiSelTitle=-1;aiContents=[];aiSelContent=-1;rai();}

async function callDeepSeek(prompt){
  if(!aiApiKey){alert('请先设置DeepSeek API Key');return null;}
  try{
    const resp=await fetch('https://api.deepseek.com/v1/chat/completions',{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+aiApiKey},
      body:JSON.stringify({model:'deepseek-chat',messages:[{role:'user',content:prompt}],temperature:0.8,max_tokens:2000})
    });
    const data=await resp.json();
    if(data.choices&&data.choices[0])return data.choices[0].message.content;
    alert('API错误: '+(data.error?data.error.message:'未知错误'));return null;
  }catch(e){alert('请求失败: '+e.message);return null;}
}

function rai(){
  const steps=[{n:1,l:'选择平台'},{n:2,l:'选择账号'},{n:3,l:'填写大纲'},{n:4,l:'AI生成标题'},{n:5,l:'AI生成内容'}];
  document.getElementById('aiSteps').innerHTML=steps.map((s,i)=>{
    let cls='ai-step';if(i<aiStep)cls+=' done';if(i===aiStep)cls+=' active';
    return '<div class="'+cls+'"><span class="num">'+(i<aiStep?'?':s.n)+'</span>'+s.l+'</div>'+(i<4?'<span class="ai-step-arrow">→</span>':'');
  }).join('');

  const ct=document.getElementById('aiContent');
  if(aiStep===0)renderAIStep0(ct);
  else if(aiStep===1)renderAIStep1(ct);
  else if(aiStep===2)renderAIStep2(ct);
  else if(aiStep===3)renderAIStep3(ct);
  else if(aiStep===4)renderAIStep4(ct);
}

// Step 0: Select Platform
function renderAIStep0(ct){
  // API key setup
  let h='<div class="form-grp mb-16"><label class="form-lbl">DeepSeek API Key</label><div class="api-key-wrap"><input class="form-inp api-key-input" id="apiKeyInput" type="password" value="'+esc(aiApiKey)+'" placeholder="sk-..."><button class="btn btn-sec btn-sm" onclick="saveApiKey()">保存</button></div><span class="text-xs text-muted">密钥仅保存在浏览器本地，不会上传</span></div>';
  h+='<div style="font-size:14px;font-weight:600;margin-bottom:10px">选择发布平台</div>';
  h+='<div class="plat-grid">';
  Object.entries(PLATFORM_ACCOUNTS).forEach(([pname,accs])=>{
    h+='<div class="plat-card'+(aiPlatform===pname?' sel':'')+'" onclick="aiPlatform=\''+pname+'\';rai();"><div class="plat-name">'+pname+'</div><div class="plat-count">关联 '+accs.length+' 个账号</div></div>';
  });h+='</div>';
  h+='<div class="flex mt-16" style="justify-content:flex-end"><button class="btn btn-pri" '+(aiPlatform?'':'disabled')+' onclick="aiStep=1;rai();">下一步 →</button></div>';
  ct.innerHTML=h;
}

function saveApiKey(){aiApiKey=document.getElementById('apiKeyInput').value.trim();localStorage.setItem('deepseek_key',aiApiKey);alert('API Key 已保存');}

// Step 1: Select Account
function renderAIStep1(ct){
  const accs=PLATFORM_ACCOUNTS[aiPlatform].map(id=>ACCOUNTS.find(a=>a.id===id)).filter(Boolean);
  let h='<div style="font-size:14px;font-weight:600;margin-bottom:10px">平台: '+aiPlatform+' · 选择发布账号</div>';
  h+='<div class="acc-select-grid">';
  accs.forEach(a=>{const cl=ACC_CLR[a.id];
    h+='<div class="acc-select-card'+(aiAccount===a.id?' sel':'')+'" onclick="aiAccount=\''+a.id+'\';rai();" style="border-left:3px solid '+cl.d+'"><div class="acc-sel-name">'+a.name+'</div><div class="acc-sel-plat">'+a.type+' · '+a.platforms.join(' / ')+'</div></div>';
  });h+='</div>';
  h+='<div class="flex gap-8 mt-16" style="justify-content:space-between"><button class="btn btn-sec" onclick="aiStep=0;rai();">← 上一步</button><button class="btn btn-pri" '+(aiAccount?'':'disabled')+' onclick="aiStep=2;rai();">下一步 →</button></div>';
  ct.innerHTML=h;
}

// Step 2: Topic Outline
function renderAIStep2(ct){
  const acc=ACCOUNTS.find(a=>a.id===aiAccount);
  let h='<div style="font-size:14px;font-weight:600;margin-bottom:4px">'+acc.name+' · '+aiPlatform+'</div>';
  h+='<div class="text-sm text-muted mb-12">'+acc.type+' · 请描述你的内容主题和大致方向</div>';
  h+='<div class="form-grp"><label class="form-lbl">选题大纲 / 内容描述</label><textarea class="form-txt" id="aiTopicInput" style="min-height:120px" placeholder="例如：给对象做的精致晚餐，节假日不去外面人挤人。拍摄香煎牛排+芦笋+红酒的完整制作过程，突出氛围感和仪式感...">'+esc(aiTopic)+'</textarea></div>';
  h+='<div class="flex gap-8" style="justify-content:space-between"><button class="btn btn-sec" onclick="aiTopic=document.getElementById(\'aiTopicInput\').value;aiStep=1;rai();">← 上一步</button><button class="btn btn-ai" onclick="genTitles()">? AI生成标题</button></div>';
  ct.innerHTML=h;
}

async function genTitles(){
  aiTopic=document.getElementById('aiTopicInput').value.trim();
  if(!aiTopic){alert('请填写选题大纲');return;}
  const acc=ACCOUNTS.find(a=>a.id===aiAccount);
  const prompt='你是一个专业的自媒体内容创作者。请根据以下信息，为该内容生成3个不同风格的标题，用于'+aiPlatform+'平台发布。\n\n账号：'+acc.name+'（'+acc.type+'）\n平台：'+aiPlatform+'\n内容主题：'+aiTopic+'\n\n要求：\n1. 标题有吸引力，符合'+aiPlatform+'平台调性\n2. 3个标题风格不同（如：悬念式、直给式、共鸣式）\n3. 每个标题不超过30字\n4. 直接输出3个标题，每行一个，用数字1. 2. 3. 开头，不要其他内容';
  
  document.getElementById('aiContent').innerHTML='<div class="loading"><div class="spinner"></div>AI正在生成标题...</div>';
  const result=await callDeepSeek(prompt);
  if(!result){aiStep=2;rai();return;}
  aiTitles=result.split('\n').filter(l=>l.match(/^\d+\.\s*/)).map(l=>l.replace(/^\d+\.\s*/,'').trim()).filter(Boolean);
  if(aiTitles.length<3){for(let i=aiTitles.length;i<3;i++)aiTitles.push('备选标题 '+(i+1));}
  aiStep=3;aiSelTitle=-1;rai();
}

// Step 3: Select Title
function renderAIStep3(ct){
  let h='<div style="font-size:14px;font-weight:600;margin-bottom:4px">AI生成了以下标题，请选择一个</div>';
  h+='<div class="text-sm text-muted mb-12">选题: '+esc(aiTopic).substring(0,60)+'...</div>';
  h+='<div class="title-options">';
  aiTitles.forEach((t,i)=>{h+='<div class="title-opt'+(aiSelTitle===i?' sel':'')+'" onclick="aiSelTitle='+i+';rai();"><strong>#'+(i+1)+'</strong> '+esc(t)+'</div>';});
  h+='</div>';
  h+='<div class="flex gap-8 mt-16" style="justify-content:space-between"><button class="btn btn-sec" onclick="aiStep=2;rai();">← 返回修改大纲</button><button class="btn btn-ai" '+(aiSelTitle>=0?'':'disabled')+' onclick="genContent()">? 生成内容正文</button></div>';
  ct.innerHTML=h;
}

async function genContent(){
  if(aiSelTitle<0)return;
  const acc=ACCOUNTS.find(a=>a.id===aiAccount);
  const selTitle=aiTitles[aiSelTitle];
  const prompt='你是一个专业的自媒体内容创作者。请根据以下信息，为'+aiPlatform+'平台生成3个版本的内容正文。\n\n账号：'+acc.name+'（'+acc.type+'）\n平台：'+aiPlatform+'\n选题：'+aiTopic+'\n选定标题：'+selTitle+'\n\n要求：\n1. 3个版本的风格不同（如：详细教程版、情感共鸣版、短小精悍版）\n2. 适合'+aiPlatform+'平台的调性和受众\n3. 包含发布文案/简介\n4. 用明确的数字标记版本1/2/3，每个版本用---分隔';

  document.getElementById('aiContent').innerHTML='<div class="loading"><div class="spinner"></div>AI正在生成内容正文，请稍候...</div>';
  const result=await callDeepSeek(prompt);
  if(!result){aiStep=3;rai();return;}
  aiContents=result.split(/版本\s*\d|───|^##\s/m).filter(s=>s.trim().length>30).map(s=>s.trim());
  if(aiContents.length<3){aiContents=result.split('---').filter(s=>s.trim().length>20).map(s=>s.trim());}
  if(aiContents.length<3){for(let i=aiContents.length;i<3;i++)aiContents.push('版本'+(i+1)+':\n'+result.substring(0,300));}
  aiStep=4;aiSelContent=-1;rai();
}

// Step 4: Select Content + Save
function renderAIStep4(ct){
  const acc=ACCOUNTS.find(a=>a.id===aiAccount);
  let h='<div style="font-size:14px;font-weight:600;margin-bottom:4px">选择最终版本 · '+(aiSelContent>=0?'已选择版本'+(aiSelContent+1):'请点击选择')+'</div>';
  h+='<div class="text-sm text-muted mb-4">标题: <strong>'+esc(aiTitles[aiSelTitle])+'</strong></div>';
  h+='<div class="content-options">';
  aiContents.forEach((c,i)=>{h+='<div class="content-opt'+(aiSelContent===i?' sel':'')+'" onclick="aiSelContent='+i+';rai();"><strong>版本'+(i+1)+'</strong>\n\n'+esc(c)+'</div>';});
  h+='</div>';
  h+='<div class="flex gap-8 mt-16" style="justify-content:space-between"><button class="btn btn-sec" onclick="aiStep=3;rai();">← 重新选标题</button><div class="flex gap-8"><button class="btn btn-sec" onclick="genContent()">?? 重新生成</button><button class="btn btn-pri" '+(aiSelContent>=0?'':'disabled')+' onclick="saveAIContent()">?? 保存到内容库</button></div></div>';
  ct.innerHTML=h;
}

function saveAIContent(){
  if(aiSelTitle<0||aiSelContent<0)return;
  const acc=ACCOUNTS.find(a=>a.id===aiAccount);
  const draft={
    id:'draft_'+Date.now(),
    accountId:aiAccount,accountName:acc.name,platform:aiPlatform,
    topic:aiTopic,title:aiTitles[aiSelTitle],content:aiContents[aiSelContent],
    caption:aiContents[aiSelContent].split('\n').slice(0,5).join('\n'),
    createdAt:new Date().toISOString()
  };
  if(!DATA.drafts)DATA.drafts=[];
  DATA.drafts.unshift(draft);
  sv();
  alert('已保存到「待发布内容」！\n账号: '+acc.name+' · 平台: '+aiPlatform);
  initAIWizard();
}


// DRAFTS PAGE
function rdf(){
  if(!DATA.drafts)DATA.drafts=[];
  const c=document.getElementById('draftsList');
  if(DATA.drafts.length===0){c.innerHTML='<div class="date-task-empty">暂无待发布内容，去「AI创作」生成吧</div>';return;}
  c.innerHTML=DATA.drafts.map((d,i)=>{
    const cl=ACC_CLR[d.accountId]||{d:'#999',l:'#EEE'};
    const dt=new Date(d.createdAt);
    const ts=dt.getMonth()+1+'/'+dt.getDate()+' '+String(dt.getHours()).padStart(2,'0')+':'+String(dt.getMinutes()).padStart(2,'0');
    return '<div class="draft-card">'+
      '<div class="draft-card-bar" style="background:'+cl.l+'"></div>'+
      '<div class="draft-card-body">'+
        '<div class="flex items-center justify-between mb-8">'+
          '<div><span class="badge" style="background:'+cl.l+';color:'+cl.d+'">'+esc(d.accountName)+'</span><span class="text-sm text-muted" style="margin-left:6px">'+esc(d.platform)+'</span></div>'+
          '<span class="text-xs text-muted">'+ts+'</span>'+
        '</div>'+
        '<div style="font-size:14px;font-weight:600;margin-bottom:4px">'+esc(d.title)+'</div>'+
        '<div class="text-sm text-muted mb-8" style="line-height:1.5;max-height:60px;overflow:hidden">'+esc(d.content).substring(0,150)+'...</div>'+
        '<div class="flex gap-8">'+
          '<button class="btn btn-pri btn-sm" onclick="useDraft(\''+d.id+'\')">应用到内容创作</button>'+
          '<button class="btn btn-ghost btn-sm" style="color:#D4A0A0" onclick="delDraft(\''+d.id+'\')">删除</button>'+
        '</div>'+
      '</div></div>';
  }).join('');
}

let useDraftId=null;
function useDraft(id){
  useDraftId=id;
  const d=DATA.drafts.find(dr=>dr.id===id);if(!d)return;
  const acc=ACCOUNTS.find(a=>a.id===d.accountId);if(!acc)return;
  const WDS=['日','一','二','三','四','五','六'];
  // Get existing content dates for this account+platform, sorted
  const existDates=[...new Set(DATA.content.filter(c=>c.accountId===d.accountId&&c.platform===d.platform).map(c=>c.date))].sort();
  let h='<h3>选择发布日期 \u00b7 '+esc(acc.name)+'</h3>';
  h+='<div class="text-sm text-muted mb-8">平台: '+esc(d.platform)+' | 标题: '+esc(d.title)+'</div>';
  if(existDates.length===0){
    h+='<div class="text-sm text-muted mb-12">暂无内容创作记录，请先在内容创作中新增日期</div>';
  }else{
    h+='<div class="text-xs text-muted mb-8">以下为内容创作中已存在的日期，点击填入：(共'+existDates.length+'条)</div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;max-height:350px;overflow-y:auto">';
    existDates.forEach(dt=>{
      const parts=dt.split('-');
      const m=parseInt(parts[1]),dy=parseInt(parts[2]);
      const dObj=new Date(parseInt(parts[0]),m-1,dy);
      const wd=WDS[dObj.getDay()];
      const existing=DATA.content.find(c=>c.accountId===d.accountId&&c.platform===d.platform&&c.date===dt);
      const hasContent=existing&&existing.topic;
      const bg=hasContent?'#FFF3E0':'#F5F5F0';
      const txt=hasContent?'#E67E22':'#787872';
      const label=hasContent?'已有内容 (点击覆盖)':'空 (点击填入)';
      h+='<div style="padding:10px 12px;background:'+bg+';border:1px solid var(--border);border-radius:8px;cursor:pointer;transition:all .15s" onclick="applyDraftToDate(\''+dt+'\')">';
      h+='<div style="font-weight:600;font-size:13px;color:'+txt+'">'+m+'月'+dy+'日 周'+wd+'</div>';
      h+='<div style="font-size:11px;color:'+txt+'">'+label+'</div>';
      h+='</div>';
    });
    h+='</div>';
  }
  h+='<div class="flex mt-12" style="justify-content:flex-end"><button class="btn btn-sec btn-sm" onclick="closeDraftPicker()">取消</button></div>';
  document.getElementById('draftPickerBody').innerHTML=h;
  document.getElementById('draftPicker').classList.add('show');
}
function applyDraftToDate(dt){
  const d=DATA.drafts.find(dr=>dr.id===useDraftId);if(!d)return;
  let entry=DATA.content.find(c=>c.accountId===d.accountId&&c.platform===d.platform&&c.date===dt);
  if(!entry){
    const acc=ACCOUNTS.find(a=>a.id===d.accountId);
    entry={
      id:'from_'+d.id+'_'+dt.slice(8),accountId:d.accountId,accountName:acc.name,platform:d.platform,
      date:dt,topic:d.topic,title:d.title,content:d.content,
      caption:d.caption,cover:'待制作',status:'planning',
      data:{followers:0,likes:0,views:0},link:'',
      analysis:'',adjustment:'',avoid:''
    };
    DATA.content.push(entry);
  }else{
    entry.topic=d.topic;entry.title=d.title;entry.content=d.content;entry.caption=d.caption;entry.status='planning';
  }
  DATA.drafts=DATA.drafts.filter(dr=>dr.id!==useDraftId);
  sv();closeDraftPicker();
  alert('已应用到 '+d.accountName+' · '+d.platform+' · '+dt.slice(5));
  rct();rdf();useDraftId=null;
}

function delDraft(id){if(!confirm('删除这条待发布内容？'))return;DATA.drafts=DATA.drafts.filter(d=>d.id!==id);sv();rdf();}

// Draft quick-select modal in content editor
function showDraftPicker(accId){
  if(!DATA.drafts||!DATA.drafts.length){alert('暂无待发布内容');return;}
  const drafts=DATA.drafts.filter(d=>d.accountId===accId);
  if(!drafts.length){alert('该账号暂无待发布内容');return;}
  
  let h='<h3>选择待发布内容</h3><div style="max-height:400px;overflow-y:auto">';
  drafts.forEach(d=>{
    h+='<div style="padding:12px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer;transition:all .15s" '+
      'onmouseover="this.style.borderColor=\'#666\'" onmouseout="this.style.borderColor=\'var(--border)\'" '+
      'onclick="applyDraftToEditor(\''+d.id+'\')">'+
      '<div style="font-weight:600;margin-bottom:4px">'+esc(d.title)+'</div>'+
      '<div class="text-xs text-muted">'+esc(d.topic).substring(0,80)+'</div>'+
    '</div>';
  });
  h+='</div><div class="flex mt-8" style="justify-content:flex-end"><button class="btn btn-sec btn-sm" onclick="closeDraftPicker()">关闭</button></div>';
  document.getElementById('draftPickerBody').innerHTML=h;
  document.getElementById('draftPicker').classList.add('show');
}
function closeDraftPicker(){document.getElementById('draftPicker').classList.remove('show');}
function applyDraftToEditor(id){
  const d=DATA.drafts.find(dr=>dr.id===id);if(!d)return;
  document.getElementById('edT').value=d.topic;
  document.getElementById('edTi').value=d.title;
  document.getElementById('edCt').value=d.content;
  document.getElementById('edCp').value=d.caption;
  document.getElementById('edSt').value='planning';
  closeDraftPicker();
}

function ri(){
  document.getElementById('ideaAccount').innerHTML=ACCOUNTS.map(a=>'<option value="'+a.name+'">'+a.name+'</option>').join('');
  document.getElementById('ideaCards').innerHTML=DATA.ideas.map(idea=>
    '<div class="idea-card">'+'<div class="idea-hdr"><span class="badge" style="background:#F5F5F0">'+esc(idea.account)+'</span><span class="text-xs text-muted">'+esc(idea.cat)+' · '+esc(idea.priority)+'</span></div><div class="idea-desc">'+esc(idea.desc)+'</div><div class="idea-plan">执行: '+esc(idea.plan)+'</div><div class="idea-foot"><span class="badge" style="background:'+(idea.status.includes('完成')||idea.status.includes('已')?'#E8F5E9':'#FFF3E0')+';color:'+(idea.status.includes('完成')||idea.status.includes('已')?'#388E3C':'#E67E22')+'">'+esc(idea.status)+'</span><div class="flex gap-8"><button class="btn btn-ghost btn-sm" onclick="editIdea(\''+idea.id+'\')">编辑</button><button class="btn btn-ghost btn-sm" style="color:#D4A0A0" onclick="delIdea(\''+idea.id+'\')">删除</button></div></div></div>'
  ).join('')+'<div class="idea-add" onclick="openIdeaModal()">+ 新增灵感</div>';
}
function openIdeaModal(){editIid=null;document.getElementById('ideaModalTitle').textContent='新增灵感';document.getElementById('ideaCat').value='';document.getElementById('ideaDesc').value='';document.getElementById('ideaPlan').value='';document.getElementById('ideaSaveBtn').textContent='保存';document.getElementById('ideaModal').classList.add('show');}
function editIdea(id){const idea=DATA.ideas.find(i=>i.id===id);if(!idea)return;editIid=id;document.getElementById('ideaModalTitle').textContent='编辑灵感';document.getElementById('ideaAccount').value=idea.account;document.getElementById('ideaCat').value=idea.cat;document.getElementById('ideaDesc').value=idea.desc;document.getElementById('ideaPlan').value=idea.plan;document.getElementById('ideaPriority').value=idea.priority;document.getElementById('ideaSaveBtn').textContent='更新';document.getElementById('ideaModal').classList.add('show');}
function closeIdeaModal(){document.getElementById('ideaModal').classList.remove('show');editIid=null;}
function saveIdea(){
  const idea={id:editIid||'i'+Date.now(),account:document.getElementById('ideaAccount').value,cat:document.getElementById('ideaCat').value,desc:document.getElementById('ideaDesc').value,plan:document.getElementById('ideaPlan').value,priority:document.getElementById('ideaPriority').value,image:'',status:editIid?(DATA.ideas.find(i=>i.id===editIid)?.status||'新灵感'):'新灵感'};
  if(editIid){const idx=DATA.ideas.findIndex(i=>i.id===editIid);if(idx>=0)DATA.ideas[idx]=idea;}else{DATA.ideas.unshift(idea);}
  sv();closeIdeaModal();ri();
}
function delIdea(id){if(!confirm('确定删除？'))return;DATA.ideas=DATA.ideas.filter(i=>i.id!==id);sv();ri();}


// ── Add custom account ──
const ACC_PALETTE = [
  {d:'#D4A574',l:'#F5ECD7'},{d:'#B8956A',l:'#EDE0D0'},{d:'#9BA88C',l:'#E1E8DC'},
  {d:'#D4956A',l:'#F5E5D5'},{d:'#9B8CB4',l:'#E4DCF0'},{d:'#7DA898',l:'#D5E8E0'},
  {d:'#C97D60',l:'#F2DCD3'},{d:'#6B9E8A',l:'#D8EDE4'},{d:'#8A7EB8',l:'#DFD9EE'},
  {d:'#B8885E',l:'#EDE0D0'},{d:'#7E9CB8',l:'#D8E5F0'},{d:'#A87DA0',l:'#EBD9E5'}
];
function openAddAccount(){
  document.getElementById('newAccName').value='';
  document.getElementById('newAccType').value='';
  document.getElementById('newAccPosting').value='odd';
  document.getElementById('newAccPlatforms').value='';
  document.getElementById('addAccountModal').classList.add('show');
}
function closeAddAccount(){document.getElementById('addAccountModal').classList.remove('show');}
function saveNewAccount(){
  const name=document.getElementById('newAccName').value.trim();
  const type=document.getElementById('newAccType').value.trim();
  const posting=document.getElementById('newAccPosting').value;
  const platformsRaw=document.getElementById('newAccPlatforms').value.trim();
  if(!name||!type||!platformsRaw){alert('请填写完整信息');return;}
  const platforms=platformsRaw.split(/[,，\s]+/).filter(Boolean);
  if(!platforms.length){alert('请至少输入一个平台');return;}
  const id='acc-'+Date.now().toString(36);
  const postDays=posting==='odd'?
    [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31]:
    [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30];
  const newAcc={id,name,type,posting,postDays,platforms};
  ACCOUNTS.push(newAcc);
  // Pick a unique color
  const usedColors=Object.values(ACC_CLR).map(c=>c.d);
  const avail=ACC_PALETTE.find(p=>!usedColors.includes(p.d))||ACC_PALETTE[ACCOUNTS.length%ACC_PALETTE.length];
  ACC_CLR[id]={d:avail.d,l:avail.l};
  // Add to PLATFORM_ACCOUNTS
  platforms.forEach(p=>{
    if(!PLATFORM_ACCOUNTS[p])PLATFORM_ACCOUNTS[p]=[];
    if(!PLATFORM_ACCOUNTS[p].includes(id))PLATFORM_ACCOUNTS[p].push(id);
  });
  // Generate tasks for new account
  for(let day=1;day<=31;day++){
    if(!postDays.includes(day))continue;
    const dt='2026-07-'+String(day).padStart(2,'0');
    if(!DATA.tasks[dt])DATA.tasks[dt]={};
    DATA.tasks[dt][id]={status:'pending',checked:false};
    platforms.forEach(p=>{
      DATA.content.push({
        id:'c_'+id+'_'+day+'_'+p+'_'+Date.now()+Math.random().toString(36).slice(2,6),
        accountId:id,accountName:name,platform:p,date:dt,
        topic:'',title:'',cover:'待制作',content:'',caption:'',status:'pending',
        data:{followers:0,likes:0,views:0},link:'',analysis:'',adjustment:'',avoid:''
      });
    });
  }
  saveAccounts();savePlatformAccounts();sv();
  closeAddAccount();
  alert('账号「'+name+'」已添加！');
  rd();rct();initQuickData(true);
}

// ── Toggle delete mode ──
function toggleDeleteMode(){
  deleteMode=!deleteMode;
  const btn=document.getElementById('delModeBtn');
  if(deleteMode){
    btn.textContent='取消';
    btn.style.background='#e74c3c';
    btn.style.color='#fff';
  }else{
    btn.textContent='删除';
    btn.style.background='';
    btn.style.color='';
  }
  rd();
}
// ── Delete custom account ──
function deleteAccount(id){
  const acc=ACCOUNTS.find(a=>a.id===id);
  if(!acc){alert('账号不存在');return;}
  const defaultIds=['acc-001','acc-002','acc-003','acc-004','acc-005','acc-006'];
  if(defaultIds.includes(id)){alert('默认账号不可删除');return;}
  if(!confirm('确定要删除账号「'+acc.name+'」吗？\n\n该操作会同时删除该账号下的所有内容和任务数据，不可恢复。'))return;
  ACCOUNTS.splice(ACCOUNTS.findIndex(a=>a.id===id),1);
  delete ACC_CLR[id];
  Object.keys(PLATFORM_ACCOUNTS).forEach(p=>{
    PLATFORM_ACCOUNTS[p]=PLATFORM_ACCOUNTS[p].filter(aid=>aid!==id);
    if(PLATFORM_ACCOUNTS[p].length===0)delete PLATFORM_ACCOUNTS[p];
  });
  Object.keys(DATA.tasks).forEach(dt=>{delete DATA.tasks[dt][id];});
  DATA.content=DATA.content.filter(c=>c.accountId!==id);
  if(DATA.analytics)DATA.analytics=DATA.analytics.filter(a=>a.accountId!==id);
  if(DATA.platformUrls)DATA.platformUrls=DATA.platformUrls.filter(u=>u.accountId!==id);
  if(DATA.ideas)DATA.ideas=DATA.ideas.filter(i=>i.account!==acc.name);
  saveAccounts();savePlatformAccounts();sv();
  deleteMode=false;
  const dmBtn=document.getElementById('delModeBtn');
  if(dmBtn){dmBtn.textContent='删除';dmBtn.style.background='';dmBtn.style.color='';}
  alert('账号「'+acc.name+'」已删除');
  rd();rct();initQuickData(true);
}

// ── Platform Overview ──
function renderPlatformOverview(){
  const el=document.getElementById('platformOverview');
  if(!el)return;
  let h='<div class="plat-grid">';
  Object.entries(PLATFORM_ACCOUNTS).sort(([a],[b])=>a.localeCompare(b,'zh')).forEach(([pname,accs])=>{
    const isExp=expandedPlatform===pname;
    const accObjs=accs.map(id=>ACCOUNTS.find(a=>a.id===id)).filter(Boolean);
    h+='<div class="plat-card'+(isExp?' sel':'')+'" onclick="expandedPlatform=expandedPlatform===\''+pname+'\'?null:\''+pname+'\';renderPlatformOverview();" style="cursor:pointer">';
    h+='<div class="plat-name">'+pname+'</div><div class="plat-count">关联 '+accObjs.length+' 个账号</div>';
    if(isExp){
      h+='<div class="plat-acc-list mt-8" onclick="event.stopPropagation()">';
      accObjs.forEach(a=>{
        const cl=ACC_CLR[a.id];
        h+='<div class="plat-acc-item" style="border-left:3px solid '+cl.d+'">';
        h+='<div style="font-weight:600;font-size:13px">'+a.name+'</div>';
        h+='<div style="font-size:11px;color:var(--muted)">'+a.type+' · '+(a.posting==='odd'?'奇数日':'偶数日')+'发布</div>';
        h+='</div>';
      });
      h+='<button class="btn btn-pri btn-sm mt-8" style="width:100%;font-size:12px" onclick="openAddAccountForPlatform(\''+pname+'\');">+ 在此平台添加账号</button>';
      h+='</div>';
    }
    h+='</div>';
  });
  h+='</div>';
  el.innerHTML=h;
}
function openAddPlatform(){
  const name=prompt('请输入新平台名称（例如：快手、视频号）：');
  if(!name||!name.trim())return;
  const pname=name.trim();
  if(PLATFORM_ACCOUNTS[pname]){alert('平台「'+pname+'」已存在');return;}
  PLATFORM_ACCOUNTS[pname]=[];
  savePlatformAccounts();sv();
  expandedPlatform=pname;
  renderPlatformOverview();
  rd();
}
function openAddAccountForPlatform(pname){
  document.getElementById('newAccName').value='';
  document.getElementById('newAccType').value='';
  document.getElementById('newAccPosting').value='odd';
  document.getElementById('newAccPlatforms').value=pname;
  document.getElementById('addAccountModal').classList.add('show');
}

// INIT
function formatWeekLabel(ws,we){
  const sm=ws.getMonth()+1,sd=ws.getDate(),em=we.getMonth()+1,ed=we.getDate();
  return sm+'\u6708'+sd+'\u65e5 - '+em+'\u6708'+ed+'\u65e5';
}
function init(){ld();initFB();}
init();
// PWA service worker
if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js');}










