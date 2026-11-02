'use strict';
(()=>{
 const cfg=window.LESSON,root=document.getElementById('lawReader');
 if(!root||!cfg?.laws?.length)return;
 const $=id=>document.getElementById(id);
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
 let selected=cfg.laws[0].id,step=0;
 const tabs=$('lawTabs'),words=$('lawWords');
 cfg.laws.forEach(l=>{const b=el('button','btn','第'+l.id.replace('-','條之')+(l.id.includes('-')?'':'條'));b.type='button';b.dataset.law=l.id;b.addEventListener('click',()=>open(l.id,0));tabs.append(b)});
 function render(){
  const law=cfg.laws.find(l=>l.id===selected),parts=law.paragraphs.flat();step=Math.max(0,Math.min(parts.length-1,step));
  $('lawTitle').textContent=law.title;$('lawScope').textContent=law.scope+'｜2026-11-02核對現行條文';$('lawWarning').textContent=law.warning;
  words.replaceChildren();let i=0;
  for(const para of law.paragraphs){const p=el('p');for(const part of para){const span=el('span','law-piece'+(i===step?' current':''),part.text);span.dataset.step=String(i);if(i===step)span.setAttribute('aria-current','step');p.append(span);i++}words.append(p)}
  const active=parts[step];$('lawStep').textContent=active.label+'｜第'+(step+1)+'句／共'+parts.length+'句';$('lawExplain').textContent=active.note;
  $('lawPrev').disabled=step===0;$('lawNext').textContent=step===parts.length-1?'回到第一句':'看下一句';$('lawSource').href=law.source;
  tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.law===selected)));
  scrollCurrent();
 }
 function scrollCurrent(){const active=words.querySelector('.current');if(active&&words.clientHeight){const offset=active.getBoundingClientRect().top-words.getBoundingClientRect().top+words.scrollTop;words.scrollTop=Math.max(0,offset-18)}}
 function open(id,index=0){if(!cfg.laws.some(l=>l.id===id))return false;selected=id;step=Number.isInteger(index)?index:0;render();return true}
 $('lawPrev').addEventListener('click',()=>{if(step>0){step--;render()}});
 $('lawNext').addEventListener('click',()=>{const n=cfg.laws.find(l=>l.id===selected).paragraphs.flat().length;step=(step+1)%n;render()});
 window.__lawReader={open,scrollCurrent,current:()=>({law:selected,step})};render();
})();
