'use strict';
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)');
const detailCopy={braids:'Removal of a braided style, section by section, down to your natural hair.',weave:'Removal of a sewn-in weave and the braided base underneath it.','cornrow-natural':'Removal of cornrows braided with your own hair, no extensions.','cornrow-extensions':'Removal of cornrows braided with added hair, extensions included.','kids-braids':'Removal of a child’s braided style, priced lower than the adult takedown.',tangled:'For braids that are matted or badly tangled. Send clear photos first so the extra work can be quoted before you book.'};
const bookLabels={braids:'Book braid takedown',weave:'Book weave takedown','cornrow-natural':'Book natural cornrows','cornrow-extensions':'Book cornrow removal','kids-braids':'Book kids’ takedown',tangled:'Send photos for a quote'};
function updateFeature(value){
 document.querySelectorAll('.service').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.service===value)));
 document.getElementById('feature-title').textContent=services[value].name;
 document.getElementById('feature-copy').textContent=detailCopy[value];
 document.getElementById('feature-price').textContent=services[value].price;
 document.getElementById('feature-price-note').textContent=value==='tangled'?'Final price by photo quote':'Service price';
 const link=document.getElementById('feature-book');link.replaceChildren(document.createTextNode(bookLabels[value]+' '));const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');link.append(arrow);
 const copy=document.querySelector('.service-detail-copy');copy.classList.remove('changing');if(!reducedMotion.matches){requestAnimationFrame(()=>requestAnimationFrame(()=>copy.classList.add('changing')));}
}
/* Picking a service is an intent signal, so it carries straight through to
   the booking form with that service already selected. The detail card is
   still updated, so it shows the right thing on the way back up. */
document.querySelectorAll('[data-service]').forEach(b=>{b.onclick=()=>{
  const value=b.dataset.service;
  document.getElementById('service-select').value=value;
  syncSummary();
  updateFeature(value);
  document.getElementById('booking').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});
};});
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

/* Mobile navigation ------------------------------------------------- */
(function(){
  const toggle = document.getElementById('nav-toggle');
  const panel = document.getElementById('mobile-nav');
  if (!toggle || !panel) return;

  const items = panel.querySelectorAll('nav a');
  items.forEach((a, i) => a.style.setProperty('--i', i));

  let lastFocus = null;

  function open(){
    lastFocus = document.activeElement;
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
    const first = panel.querySelector('a');
    if (first) first.focus({preventScroll:true});
  }

  function close(returnFocus){
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    if (returnFocus) (lastFocus || toggle).focus({preventScroll:true});
  }

  toggle.addEventListener('click', () => {
    panel.hidden ? open() : close(true);
  });

  // Anchor links should land on the section, not leave the panel covering it.
  panel.addEventListener('click', e => {
    if (e.target.closest('a')) close(false);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !panel.hidden) close(true);
  });

  // Keep the tab ring inside the panel while it is open.
  panel.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = panel.querySelectorAll('a[href], button');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });

  // Returning to a wide viewport must not leave the page scroll-locked.
  const wide = matchMedia('(min-width:601px)');
  wide.addEventListener('change', e => { if (e.matches && !panel.hidden) close(false); });
})();

/* Before / after compare -------------------------------------------- */
(function(){
  const box = document.getElementById('compare');
  const handle = document.getElementById('compare-handle');
  if (!box || !handle) return;

  let pos = 52;
  let dragging = false;

  function render(){
    box.style.setProperty('--pos', pos + '%');
    const v = Math.round(pos);
    handle.setAttribute('aria-valuenow', v);
    handle.setAttribute('aria-valuetext', v + '% braided style shown');
  }

  function setFromX(clientX){
    const r = box.getBoundingClientRect();
    if (!r.width) return;
    pos = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
    render();
  }

  box.addEventListener('pointerdown', e => {
    dragging = true;
    box.setPointerCapture?.(e.pointerId);
    setFromX(e.clientX);
  });
  box.addEventListener('pointermove', e => { if (dragging) setFromX(e.clientX); });
  const stop = () => { dragging = false; };
  box.addEventListener('pointerup', stop);
  box.addEventListener('pointercancel', stop);
  box.addEventListener('pointerleave', stop);

  handle.addEventListener('keydown', e => {
    const step = e.shiftKey ? 10 : 3;
    if (e.key === 'ArrowLeft') pos = Math.max(0, pos - step);
    else if (e.key === 'ArrowRight') pos = Math.min(100, pos + step);
    else if (e.key === 'Home') pos = 0;
    else if (e.key === 'End') pos = 100;
    else return;
    e.preventDefault();
    render();
  });

  render();
})();
