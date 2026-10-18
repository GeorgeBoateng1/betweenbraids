'use strict';
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)');
const detailCopy={braids:'Your braids have had their moment. Let us patiently undo your style, so you can look forward to what’s next.',weave:'A careful goodbye to your sewn-in weave. We take the time to remove your style with your natural hair in mind.','cornrow-natural':'Natural cornrows, gently undone. Thoughtful removal for cornrows without extensions.','cornrow-extensions':'From added braiding hair back to your own. Careful removal of cornrows with extensions.','kids-braids':'Little heads deserve patient hands, too. A braid takedown for your child’s next hair chapter.',tangled:'Extra tangles need extra care. Clear photos are required to assess your hair and confirm the price before booking.'};
const bookLabels={braids:'Choose braid takedown',weave:'Choose weave takedown','cornrow-natural':'Choose natural cornrows','cornrow-extensions':'Choose cornrow removal','kids-braids':'Choose kids’ takedown',tangled:'Plan a photo quote'};
function updateFeature(value){
 document.querySelectorAll('.service').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.service===value)));
 document.getElementById('feature-title').textContent=services[value].name;
 document.getElementById('feature-copy').textContent=detailCopy[value];
 document.getElementById('feature-price').textContent=services[value].price;
 document.getElementById('feature-price-note').textContent=value==='tangled'?'Final price by photo quote':'Service price';
 const link=document.getElementById('feature-book');link.replaceChildren(document.createTextNode(bookLabels[value]+' '));const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');link.append(arrow);
 const copy=document.querySelector('.service-detail-copy');copy.classList.remove('changing');if(!reducedMotion.matches){requestAnimationFrame(()=>requestAnimationFrame(()=>copy.classList.add('changing')));}
}
document.querySelectorAll('[data-service]').forEach(b=>{b.onclick=()=>{const value=b.dataset.service;document.getElementById('service-select').value=value;syncSummary();updateFeature(value);if(value==='tangled'||window.innerWidth<=600){document.querySelector('.service-detail').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'center'});}};});
document.getElementById('service-select').addEventListener('change',e=>updateFeature(e.target.value));
updateFeature('braids');
const revealTargets=document.querySelectorAll('.care-intro .statement,.care-intro-bottom,.section-head,.service-explorer,.quote-note,.process-step,.results-title,.results-photo,.home-copy,.faq-section>div:first-child,.closing>div');
if('IntersectionObserver' in window&&!reducedMotion.matches){const reveals=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');reveals.unobserve(entry.target);}});},{threshold:.08,rootMargin:'0px 0px -25px 0px'});revealTargets.forEach(el=>{el.classList.add('reveal');reveals.observe(el);});}
const header=document.querySelector('.site-header'),hero=document.querySelector('.premium-hero'),heroImage=document.querySelector('.hero-image-wrap img'),careSymbol=document.querySelector('.care-symbol'),booking=document.getElementById('booking'),floating=document.querySelector('.floating-cta');
let pending=false;
function onScroll(){if(pending)return;pending=true;requestAnimationFrame(()=>{const y=window.scrollY;header.classList.toggle('scrolled',y>30);const rect=booking.getBoundingClientRect(),menuRect=document.getElementById('services').getBoundingClientRect();floating.classList.toggle('visible',y>hero.offsetHeight+100&&!(rect.top<innerHeight&&rect.bottom>0)&&!(menuRect.top<innerHeight&&menuRect.bottom>0));if(!reducedMotion.matches){const heroRect=hero.getBoundingClientRect();if(heroRect.bottom>0)heroImage.style.setProperty('--hero-shift',Math.min(45,y*.065)+'px');const careRect=careSymbol.getBoundingClientRect();if(careRect.bottom>0&&careRect.top<innerHeight)careSymbol.style.setProperty('--care-rotation',((innerHeight-careRect.top)*.07)+'deg');}pending=false;});}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
document.querySelectorAll('.magnetic').forEach(button=>{button.addEventListener('pointermove',e=>{if(reducedMotion.matches||!finePointer.matches)return;const rect=button.getBoundingClientRect();button.style.transform=`translate(${(e.clientX-rect.left-rect.width/2)*.08}px,${(e.clientY-rect.top-rect.height/2)*.13}px)`;});button.addEventListener('pointerleave',()=>button.style.transform='');});
const progressSteps=document.querySelectorAll('.booking-progress li');
new MutationObserver(()=>{progressSteps.forEach((step,i)=>{const active=i===0||i===1&&!!chosenDate||i===2&&!!chosenDate&&!!chosenTime;step.classList.toggle('active',active);if(i===(chosenTime?2:chosenDate?1:0))step.setAttribute('aria-current','step');else step.removeAttribute('aria-current');});}).observe(document.getElementById('summary-date'),{childList:true});
reducedMotion.addEventListener('change',e=>{if(e.matches){document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in-view'));document.querySelectorAll('.magnetic').forEach(el=>el.style.transform='');}});
