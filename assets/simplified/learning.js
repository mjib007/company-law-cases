'use strict';
(()=>{
 const cfg=window.LESSON;if(!cfg)throw Error('Missing lesson configuration');
 const $=id=>document.getElementById(id);const all=sel=>[...document.querySelectorAll(sel)];
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
 const PRE=cfg.preIds.map(id=>cfg.questions.find(q=>q.id===id));const POST=cfg.questions;
 if(PRE.some(q=>!q)||new Set(POST.map(q=>q.id)).size!==POST.length)throw Error('Invalid question configuration');
 let sid='',state=null,storageOK=true;
 const normalized=v=>v.normalize('NFKC').trim().toUpperCase();const validID=v=>/^[A-Z0-9]{4,20}$/.test(v);
 const key=id=>'commerce-learning:'+cfg.id+':'+cfg.version+':'+id;
 const date=ts=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(ts));
 const fresh=(attempt=1)=>({schema:1,studentId:sid,topic:cfg.id,version:cfg.version,attempt,pre:{},post:{},preSubmittedAt:null,completedAt:null,startedAt:Date.now(),receipt:null});
 function answerValid(q,r){return !!r&&Number.isInteger(r.choice)&&r.choice>=0&&r.choice<q.options.length&&typeof r.sure==='boolean'}
 function validAnswers(qs,answers){return qs.every(q=>answerValid(q,answers[q.id]))}
 function read(){let raw=null;try{raw=JSON.parse(localStorage.getItem(key(sid))||'null')}catch{storageOK=false}
  if(!raw||raw.schema!==1||raw.studentId!==sid||raw.topic!==cfg.id||raw.version!==cfg.version)return fresh();
  const st=fresh(Number.isInteger(raw.attempt)&&raw.attempt>0?raw.attempt:1);
  for(const mode of ['pre','post'])for(const q of mode==='pre'?PRE:POST){const a=raw[mode]?.[q.id];if(a&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<q.options.length)st[mode][q.id]={choice:a.choice,...(typeof a.sure==='boolean'?{sure:a.sure}:{})}}
  const timestamp=v=>typeof v==='number'&&Number.isFinite(v)&&v>0&&v<=Date.now()+60000;
  if(timestamp(raw.startedAt))st.startedAt=raw.startedAt;
  if(timestamp(raw.preSubmittedAt)&&validAnswers(PRE,st.pre))st.preSubmittedAt=raw.preSubmittedAt;
  if(st.preSubmittedAt&&timestamp(raw.completedAt)&&raw.completedAt>=st.preSubmittedAt&&validAnswers(POST,st.post)){st.completedAt=raw.completedAt;st.receipt=typeof raw.receipt==='string'?raw.receipt:null}
  return st;
 }
 function persist(){try{localStorage.setItem(key(sid),JSON.stringify(state));localStorage.setItem('commerce-last-id',sid)}catch{storageOK=false}storageNotice()}
 function storageNotice(){ $('storageNote').textContent=storageOK?'紀錄只保存在此瀏覽器；完成後請截圖交給老師。':'此瀏覽器無法保存紀錄；本頁仍可作答，請完成後立即截圖，重新整理可能清除進度。'; }
 function status(id,text){$(id).textContent=text}
 function markPhase(){const stage=!sid?'identity':!state.preSubmittedAt?'pre':!state.completedAt?'learn':'report';
  all('nav a').forEach(a=>{const target=a.hash.slice(1);const locked=target!=='identity'&&(!sid||(!state.preSubmittedAt&&target!=='pre')||(target==='report'&&!state.completedAt));a.setAttribute('aria-disabled',String(locked));a.classList.toggle('active',target===stage)});
  $('studentBadge').textContent=sid?'學號 '+sid:'尚未填學號';$('changeStudent').hidden=!sid;
  $('identity').hidden=!!sid;$('pre').hidden=!sid;$('learn').hidden=!sid||!state.preSubmittedAt;$('post').hidden=!sid||!state.preSubmittedAt;$('report').hidden=!sid;
  $('preSubmit').disabled=!!state?.preSubmittedAt;$('postSubmit').disabled=!!state?.completedAt;
  $('preNext').hidden=!state?.preSubmittedAt;$('postSubmit').hidden=!!state?.completedAt;
  $('redo').hidden=!state?.completedAt;$('reportTools').hidden=!state?.completedAt;
  if(sid){status('preStatus',state.preSubmittedAt?'事前練習已送出，答案已保留。現在可以閱讀教材。':'先完成每題答案與把握程度，再送出。');status('postStatus',state.completedAt?'事後練習已送出，學習診斷報告已產生。':'讀完教材後作答，再一次送出；送出後顯示答案與解析。')}
 }
 function buildQuestion(q,mode,index){const card=el('div','quiz');card.id=mode+'-'+q.id;const fs=el('fieldset');const legend=el('legend',null,`${index+1}．${q.prompt}`);fs.append(legend);const choices=el('div','options');
  q.options.forEach((text,k)=>{const label=el('label','option');const input=el('input');input.type='radio';input.name=mode+'-'+q.id+'-choice';input.value=String(k);input.dataset.choice=String(k);input.addEventListener('change',()=>{if(locked(mode))return;const r=state[mode][q.id]||{};r.choice=k;state[mode][q.id]=r;persist();updateProgress(mode)});label.append(input,el('span',null,text));choices.append(label)});
  fs.append(choices);const confidence=el('div','confidence');confidence.append(el('span',null,'這個答案，你有多確定？'));
  for(const [text,value] of [['有把握',true],['不確定／用猜的',false]]){const label=el('label');const input=el('input');input.type='radio';input.name=mode+'-'+q.id+'-sure';input.value=String(value);input.dataset.sure=String(value);input.addEventListener('change',()=>{if(locked(mode))return;const r=state[mode][q.id]||{};r.sure=value;state[mode][q.id]=r;persist();updateProgress(mode)});label.append(input,el('span',null,text));confidence.append(label)}
  fs.append(confidence);card.append(fs);return card;
 }
 const locked=mode=>mode==='pre'?!!state.preSubmittedAt:!!state.completedAt;
 function renderQuestions(mode){const host=$(mode+'Questions');host.replaceChildren();const qs=mode==='pre'?PRE:POST;qs.forEach((q,i)=>{const card=buildQuestion(q,mode,i);host.append(card);const r=state[mode][q.id];if(r){card.querySelectorAll('[data-choice]').forEach(e=>e.checked=Number(e.value)===r.choice);card.querySelectorAll('[data-sure]').forEach(e=>e.checked=String(r.sure)===e.value)}card.querySelector('fieldset').disabled=locked(mode);
   if(mode==='post'&&state.completedAt){const correct=r.choice===q.answer;const fb=el('div','feedback '+(correct?'correct':'wrong'));fb.append(el('strong',null,correct?'答對了。':'這題需要再釐清。'),el('div',null,q.why));card.append(fb)}
  });updateProgress(mode);
 }
 function updateProgress(mode){const qs=mode==='pre'?PRE:POST;const done=qs.filter(q=>answerValid(q,state[mode][q.id])).length;$(mode+'Progress').style.width=Math.round(done/qs.length*100)+'%';status(mode+'Count',`已完成${done}／${qs.length}題（含把握程度）`);}
 function refresh(){markPhase();storageNotice();if(!sid)return;renderQuestions('pre');renderQuestions('post');renderReport();if(state.preSubmittedAt)loadVideo()}
 function missing(mode){const qs=mode==='pre'?PRE:POST;return qs.map((q,i)=>answerValid(q,state[mode][q.id])?null:i+1).filter(Boolean)}
 function submit(mode){if(!sid)return;const miss=missing(mode);if(miss.length){status(mode+'Error','請完成第'+miss.join('、')+'題的答案及把握程度。');$(mode+'-'+(mode==='pre'?PRE:POST)[miss[0]-1].id).scrollIntoView({block:'center'});return}status(mode+'Error','');
  if(mode==='pre'&&!state.preSubmittedAt){state.preSubmittedAt=Date.now();persist();refresh();$('learn').scrollIntoView({block:'start'})}
  if(mode==='post'&&state.preSubmittedAt&&!state.completedAt){state.completedAt=Date.now();state.receipt=cfg.code+'-'+new Date(state.completedAt).toISOString().replace(/\D/g,'').slice(0,14)+'-'+crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(0,5).toUpperCase();persist();refresh();$('report').scrollIntoView({block:'start'})}
 }
 function loadVideo(){if(!cfg.videoId||$('lessonVideo').querySelector('iframe'))return;const f=el('iframe');f.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(cfg.videoId);f.title=cfg.title;f.loading='lazy';f.referrerPolicy='strict-origin-when-cross-origin';f.allow='accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture';f.allowFullscreen=true;$('lessonVideo').hidden=false;if($('videoNotice'))$('videoNotice').hidden=true;$('lessonVideo').append(f)}
 function unitScore(ids){return ids.filter(id=>{const q=POST.find(q=>q.id===id);return state.post[id].choice===q.answer}).length}
 function reportModel(){if(!state?.completedAt)return null;const preScore=PRE.filter(q=>state.pre[q.id].choice===q.answer).length;const postPair=PRE.filter(q=>state.post[q.id].choice===q.answer).length;const correct=POST.filter(q=>state.post[q.id].choice===q.answer).length;
  const g={mastered:[],priority:[],uncertain:[],practice:[]};POST.forEach((q,i)=>{const r=state.post[q.id];const right=r.choice===q.answer;g[right?(r.sure?'mastered':'uncertain'):(r.sure?'priority':'practice')].push({q,no:i+1})});
  return {preScore,postPair,correct,groups:g,completedAt:state.completedAt,studentId:sid,attempt:state.attempt};
 }
 function renderReport(){const host=$('reportCard');host.replaceChildren();host.className='';const m=reportModel();if(!m){host.append(el('div','card',sid?'完成事前與事後練習後，這裡會產生含學號的診斷報告。':'請先輸入學號。'));return}
  const head=el('div','report-head');head.append(el('h2',null,'學習診斷報告'),el('p','report-topic',cfg.title));const idline=el('div','student-line');idline.append(el('span',null,'學號'),el('strong','report-student-id'+(sid.length>12?' long-id':''),sid));const meta=el('div','report-meta');meta.append(el('span',null,`完成：${date(state.completedAt)}（台灣時間）`),document.createTextNode('｜'),el('span',null,`第${state.attempt}次練習｜教材${cfg.version}`));head.append(idline,meta);
  const body=el('div','report-body'),kpis=el('div','kpis');for(const [v,label] of [[m.preScore+'／'+PRE.length,'事前練習'],[m.correct+'／'+POST.length,'事後練習'],[(m.postPair-m.preScore>0?'+':'')+(m.postPair-m.preScore)+'題','同題前後變化']]){const box=el('div','kpi');box.append(el('b',null,v),el('span',null,label));kpis.append(box)}body.append(kpis,el('p','comparison',`前後比較只看相同的${PRE.length}題：事前${m.preScore}題→事後${m.postPair}題。`));
  body.append(el('h3',null,'各觀念掌握度'));for(const unit of cfg.units){const row=el('div','unit-row');const label=el('a',null,unit.label);label.href=unit.href;const track=el('div','track');const fill=el('div','fill');const v=unitScore(unit.questions);fill.style.width=v/unit.questions.length*100+'%';track.setAttribute('role','img');track.setAttribute('aria-label',`${unit.label}答對${v}／${unit.questions.length}題`);track.append(fill);row.append(label,track,el('span',null,v+'／'+unit.questions.length));body.append(row)}
  body.append(el('h3',null,'把握程度與作答結果'));const grid=el('div','confidence-grid');for(const [key,label,cls] of [['mastered','有把握・答對','good'],['priority','有把握・答錯','priority'],['uncertain','不確定・答對','uncertain'],['practice','不確定・答錯','']]){const c=el('div','confidence-cell '+cls);c.append(el('b',null,m.groups[key].length+'題'),el('span',null,label));grid.append(c)}body.append(grid);
  body.append(el('h3',null,'下一步建議'));const list=el('ul','review-list');const review=[...m.groups.priority,...m.groups.practice];const seen=new Set();for(const item of review){if(seen.has(item.q.unit))continue;seen.add(item.q.unit);const li=el('li');li.append(document.createTextNode(`第${item.no}題：${item.q.review} `));const a=el('a',null,'回教材');a.href=cfg.units.find(u=>u.id===item.q.unit).href;li.append(a);list.append(li)}if(!review.length)list.append(el('li',null,m.groups.uncertain.length?'全部答對；把不確定的題目再說明一次理由。':'全部答對且有把握；試著向同學說明判斷理由。'));body.append(list);
  const done=el('div','completion','已完成：學號確認✓　事前練習✓　事後練習✓');body.append(done);
  const foot=el('div','report-foot');foot.append(el('div',null,'請截取完整報告交給老師，保留學號、專題與完成時間。'),el('div',null,'依本次作答整理，紀錄保存在此瀏覽器，未自動傳送給老師。'));
  host.append(head,body,foot);host.className='report';window.__reportModel=m;
 }
 function enter(id){status('preError','');status('postError','');sid=id;state=read();persist();refresh();const dest=state.completedAt?'report':state.preSubmittedAt?'learn':'pre';$(dest).scrollIntoView({block:'start'});status('identityError','')}
 $('identityForm').addEventListener('submit',ev=>{ev.preventDefault();const id=normalized($('studentId').value);if(!validID(id)){status('identityError','請填4～20碼英文字母或數字的學號；前面的0會保留。');$('studentId').focus();return}enter(id)});
 $('changeStudent').onclick=()=>{document.body.classList.remove('snapshot-mode');sid='';state=null;window.__reportModel=null;markPhase();$('studentId').value='';$('identity').scrollIntoView();$('studentId').focus();$('lessonVideo').replaceChildren()};
 $('preSubmit').onclick=()=>submit('pre');$('postSubmit').onclick=()=>submit('post');
 $('preNext').onclick=()=>{$('learn').scrollIntoView()};
 $('captureMode').onclick=()=>{document.body.classList.add('snapshot-mode');window.scrollTo(0,0);$('exitCapture').focus({preventScroll:true})};
 $('exitCapture').onclick=()=>{document.body.classList.remove('snapshot-mode');$('report').scrollIntoView()};
 $('printReport').onclick=()=>window.print();
 $('reportCard').addEventListener('click',e=>{if(e.target.closest('a[href^="#"]'))document.body.classList.remove('snapshot-mode')});
 $('redo').onclick=()=>{$('restartDialog').showModal()};$('cancelRestart').onclick=()=>{$('restartDialog').close()};$('confirmRestart').onclick=()=>{state=fresh(state.attempt+1);persist();$('restartDialog').close();document.body.classList.remove('snapshot-mode');refresh();$('pre').scrollIntoView()};
 all('nav a').forEach(a=>a.addEventListener('click',e=>{if(a.hash==='#identity'&&sid){e.preventDefault();$('changeStudent').click();return}if(a.getAttribute('aria-disabled')==='true'){e.preventDefault();status('identityHint',!sid?'請先輸入學號。':'先完成事前練習，才能開始學習；完成事後練習後會產生報告。');(!sid?$('identity'):$('pre')).scrollIntoView();return}all('nav a').forEach(b=>b.classList.toggle('active',b===a))}));
 try{$('studentId').value=localStorage.getItem('commerce-last-id')||''}catch{storageOK=false}
 if(!storageOK)storageNotice();markPhase();
 window.__learning={reportModel,topic:cfg.id,version:cfg.version};
})();
