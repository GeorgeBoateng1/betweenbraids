'use strict';
const services={'kids-braids':{name:'Kids’ braid takedown',price:'$45'},braids:{name:'Braid takedown',price:'$80'},weave:{name:'Weave takedown',price:'$60'},'cornrow-natural':{name:'Natural cornrows',price:'$40'},'cornrow-extensions':{name:'Cornrows with extensions',price:'$55'},tangled:{name:'Tangled or matted braids',price:'From $120'}};
const $=id=>document.getElementById(id);
const east=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
const part=t=>east.find(p=>p.type===t).value;
const today=new Date(Number(part('year')),Number(part('month'))-1,Number(part('day')));
let year=today.getFullYear(),month=today.getMonth(),chosenDate=null,chosenTime=null;
const weekdaySlots=['9:00 AM','12:00 PM','3:00 PM','7:00 PM'];
const weekendSlots=['7:00 AM','9:00 AM','11:00 AM','1:00 PM','3:00 PM','5:00 PM','7:00 PM'];
const slots=[...new Set([...weekendSlots,...weekdaySlots])];
function slotsForDate(date){return date.getDay()===0||date.getDay()===6?weekendSlots:weekdaySlots;}
const formatDate=d=>new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(d);
function available(d){return d>=today && d.getDay()!==1 && d.getDay()!==3;}
const DEPOSIT=25;
const money=n=>'$'+Math.round(n);
const isHome=()=>document.querySelector('input[name=location]:checked').value==='home';
const isQuote=()=>$('service-select').value==='tangled';
const payMode=()=>{const el=document.querySelector('input[name=payment]:checked');return el?el.value:'deposit';};

/* Travel is $1 per mile, there and back, and is always paid upfront. */
function travelFee(){
  if(!isHome()) return 0;
  const m=parseFloat($('miles').value);
  return Number.isFinite(m)&&m>0?Math.round(m)*2:0;
}
function serviceAmount(){
  if(isQuote()) return null;
  return Number(services[$('service-select').value].price.replace(/[^0-9.]/g,''));
}
/* What is charged now, and what is left for the day of service. */
function charges(){
  const svc=serviceAmount(),travel=travelFee();
  if(svc===null) return {svc:null,travel,total:null,now:null,balance:null};
  const total=svc+travel;
  const now=(payMode()==='full'?svc:DEPOSIT)+travel;
  return {svc,travel,total,now,balance:total-now};
}

function syncSummary(){
  const quote=isQuote();
  $('appointment-details').hidden=quote||!chosenDate||!chosenTime;
  const service=services[$('service-select').value];
  $('summary-service').textContent=service.name;
  const home=isHome();
  $('home-fields').hidden=!home;
  $('location-note').hidden=home;
  $('summary-location').textContent=home?'Home visit':'At our location';
  $('summary-date').textContent=chosenDate?formatDate(chosenDate)+(chosenTime?' at '+chosenTime:' \u00b7 choose a time'):'Choose a date and time.';

  const c=charges();
  $('t-travel-row').hidden=!home;
  $('t-travel').textContent=money(c.travel);
  if(c.total===null){
    $('t-service').textContent='From $120';
    $('t-total').textContent='Quoted after review';
    $('t-now').textContent='$0 today';
    $('t-balance').textContent='Set once you accept the quote';
  }else{
    $('t-service').textContent=money(c.svc);
    $('t-total').textContent=money(c.total);
    $('t-now').textContent=money(c.now);
    $('t-balance').textContent=money(c.balance);
  }
  $('quote-request').hidden=!quote;
  $('review').textContent=quote?'Send photos for a quote':'Review my selection';
  const note=$('pay-travel-note');
  if(note) note.hidden=!home;
  const dep=$('pay-deposit-note');
  if(dep&&c.svc!==null) dep.textContent='It comes off your service total. '+money(c.svc-DEPOSIT)+' is due on the day.';
  $('feedback').textContent='';
}
function renderCalendar(){const first=new Date(year,month,1);$('month-title').textContent=first.toLocaleDateString('en-US',{month:'long',year:'numeric'});$('prev-month').disabled=year===today.getFullYear()&&month===today.getMonth();$('dates').replaceChildren();for(let i=0;i<first.getDay();i++){$('dates').append(document.createElement('span'));}for(let day=1;day<=new Date(year,month+1,0).getDate();day++){const date=new Date(year,month,day),b=document.createElement('button');b.type='button';b.textContent=day;b.disabled=!available(date);b.setAttribute('aria-label',formatDate(date)+(b.disabled?' unavailable':' sample appointments'));const selected=chosenDate?.getTime()===date.getTime();b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));b.addEventListener('click',()=>{chosenDate=date;chosenTime=null;renderCalendar();renderTimes();renderQuickDates();syncSummary();});$('dates').append(b);}}
function renderTimes(){$('times').replaceChildren();if(!chosenDate){const p=document.createElement('p');p.textContent='Choose a date to see sample times.';$('times').append(p);return;}for(const time of slotsForDate(chosenDate)){const b=document.createElement('button');b.type='button';b.textContent=time;b.classList.toggle('selected',time===chosenTime);b.setAttribute('aria-pressed',String(time===chosenTime));b.onclick=()=>{chosenTime=time;renderTimes();syncSummary();};$('times').append(b);}}
function moveMonth(delta){month+=delta;if(month<0){month=11;year--;}if(month>11){month=0;year++;}renderCalendar();}
$('prev-month').onclick=()=>moveMonth(-1);$('next-month').onclick=()=>moveMonth(1);
$('allergies-toggle').onchange=()=>{const yes=$('allergies-toggle').checked;$('allergy-fields').hidden=!yes;$('allergy-details').required=yes;if(yes)$('allergy-details').focus();};
$('service-select').onchange=syncSummary;document.querySelectorAll('input[name=location]').forEach(i=>i.onchange=syncSummary);
document.querySelectorAll('[data-service]').forEach(b=>b.onclick=()=>{$('service-select').value=b.dataset.service;syncSummary();$('booking').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
$('home-cta').addEventListener('click',()=>{document.querySelector('input[value=home]').checked=true;syncSummary();});
function reviewSelection(){
if(isQuote()) return requestQuote();
if(!chosenDate||!chosenTime){$('feedback').textContent='Please choose a date and time.';return {error:'Date and time are required.'};}const home=document.querySelector('input[name=location]:checked').value==='home';if(home&&!$('area').value.trim()){$('feedback').textContent='Please enter the address for your home visit.';$('area').focus();return {error:'Home visit address is required.'};}if(home&&travelFee()<=0){$('feedback').textContent='Please enter the distance in miles so the travel fee can be added.';$('miles').focus();return {error:'Home visit distance is required.'};}for(const id of ['client-name','client-phone',...($('allergies-toggle').checked?['allergy-details']:[])]){const field=$(id);if(!field.value.trim()||!field.checkValidity()){$('feedback').textContent=id==='allergy-details'?'Please list your product allergies or sensitivities.':'Please add your name and a phone number.';field.focus();field.reportValidity();return {error:'Appointment details are required.'};}}if(!$('policy').checked){$('feedback').textContent='Please confirm the deposit and cancellation policy.';$('policy').focus();return {error:'Policy acknowledgement is required.'};}const s=services[$('service-select').value];
const c=charges();
const host=$('review-content');
host.replaceChildren();

const section=(title)=>{const h=document.createElement('h3');h.className='receipt-head';h.textContent=title;host.append(h);};
const row=(label,value,cls)=>{
  const d=document.createElement('div');d.className='receipt-row'+(cls?' '+cls:'');
  const a=document.createElement('span');a.textContent=label;
  const b=document.createElement('strong');b.textContent=value;
  d.append(a,b);host.append(d);
};
const note=(text)=>{const n=document.createElement('p');n.className='receipt-note';n.textContent=text;host.append(n);};

section('Appointment');
row('Service',s.name);
row('When',formatDate(chosenDate)+' at '+chosenTime+' Eastern Time');
row('Where',home?'Home visit \u00b7 '+$('area').value.trim():'At our location');
row('Name',$('client-name').value.trim());
if($('client-phone').value.trim()) row('Phone',$('client-phone').value.trim());
if($('client-email').value.trim()) row('Email',$('client-email').value.trim());
row('Allergies',$('allergies-toggle').checked?$('allergy-details').value.trim():'None reported');
if($('client-comments').value.trim()) note('Note: '+$('client-comments').value.trim());

section('Charges');
row(s.name,money(c.svc));
if(home) row('Travel, '+(Math.round(parseFloat($('miles').value)||0))+' miles each way at $1 per mile','$'+c.travel);
row('Total',money(c.total),'receipt-total');
row('Paid today',money(c.now),'receipt-paid');
row('Balance due on the day',money(c.balance),c.balance===0?'receipt-clear':'');
if(c.balance===0) note('Paid in full. Nothing to pay on the day.');

section('Terms');
note('Payments, including the deposit, are nonrefundable.');
note('Give 24 to 48 hours\u2019 notice to cancel or reschedule. Your deposit can move once to a new date.');
if(!home) note('The appointment address is sent by text once your booking and payment are confirmed.');

$('feedback').textContent='';
$('selection-dialog').showModal();return {status:'preview_only',service:s.name,price:s.price,date:formatDate(chosenDate),time:chosenTime,location:home?'home':'studio',reserved:false};}
$('review').onclick=reviewSelection;$('close-dialog').onclick=$('back-dialog').onclick=()=>$('selection-dialog').close();$('selection-dialog').addEventListener('click',e=>{if(e.target===$('selection-dialog')){const rect=e.target.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)e.target.close();}});
renderCalendar();syncSummary();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'stage_takedown_preview',title:'Select a takedown preview',description:'Select a service, date and sample appointment time in the visible preview calendar. Does not reserve or send a booking.',inputSchema:{type:'object',properties:{service:{type:'string',enum:Object.keys(services)},date:{type:'string',description:'Local Eastern date in YYYY-MM-DD format'},time:{type:'string',enum:slots}},required:['service','date','time'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||!Object.hasOwn(services,input.service)||typeof input.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||!slots.includes(input.time))throw new Error('Invalid preview selection.');const [y,m,d]=input.date.split('-').map(Number),date=new Date(y,m-1,d);if(date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d||!available(date))throw new Error('Date has no sample availability.');if(!slotsForDate(date).includes(input.time))throw new Error('Time is unavailable for this date.');year=y;month=m-1;chosenDate=date;chosenTime=input.time;$('service-select').value=input.service;renderCalendar();renderTimes();syncSummary();$('booking').scrollIntoView();return {status:'staged_preview',service:services[input.service].name,date:input.date,time:chosenTime,reserved:false};}})).catch(()=>{});}catch{}}


/* The next few open dates, so nobody has to read a calendar grid to book. */
function renderQuickDates(){
  const host=$('quick-dates');
  if(!host) return;
  const fmt=new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric'});
  const out=[],cursor=new Date(today);
  for(let i=0;out.length<3&&i<60;i++){
    if(available(cursor)) out.push(new Date(cursor));
    cursor.setDate(cursor.getDate()+1);
  }
  host.replaceChildren();
  for(const d of out){
    const on=!!chosenDate&&chosenDate.getTime()===d.getTime();
    const b=document.createElement('button');
    b.type='button';
    b.className='quick-date';
    b.textContent=fmt.format(d);
    b.setAttribute('aria-pressed',String(on));
    b.onclick=()=>{
      chosenDate=d;chosenTime=null;
      year=d.getFullYear();month=d.getMonth();
      renderCalendar();renderTimes();renderQuickDates();syncSummary();
    };
    host.append(b);
  }
}
renderQuickDates();


/* The distance field and the payment choice both move the totals. */
['miles'].forEach(id=>{const el=$(id);if(el){el.oninput=syncSummary;el.onchange=syncSummary;}});
document.querySelectorAll('input[name=payment]').forEach(r=>r.addEventListener('change',syncSummary));
syncSummary();


/* Heavily tangled and matted hair is quoted before anything is booked, so
   this path takes no payment and asks for no agreement. */
function requestQuote(){
  if(!chosenDate){$('feedback').textContent='Please choose a preferred date.';return {error:'Preferred date required.'};}
  const photos=$('quote-photos');
  if(!photos.files||!photos.files.length){$('feedback').textContent='Please add at least one photo of your hair.';photos.focus();return {error:'Photos required.'};}
  for(const id of ['quote-worn','quote-condition','quote-name','quote-phone']){
    const f=$(id);
    if(!f.value.trim()){
      $('feedback').textContent=id==='quote-phone'?'Please add a phone number so we can send your quote.':'Please complete the questions about your hair.';
      f.focus();return {error:'Quote details required.'};
    }
  }

  const host=$('review-content');host.replaceChildren();
  const head=t=>{const h=document.createElement('h3');h.className='receipt-head';h.textContent=t;host.append(h);};
  const row=(l,v)=>{const d=document.createElement('div');d.className='receipt-row';
    const a=document.createElement('span');a.textContent=l;const b=document.createElement('strong');b.textContent=v;
    d.append(a,b);host.append(d);};
  const note=t=>{const n=document.createElement('p');n.className='receipt-note';n.textContent=t;host.append(n);};

  head('Your request');
  row('Service','Heavily tangled or matted hair');
  row('Starting price','$120');
  row('Preferred date',formatDate(chosenDate)+(chosenTime?' at '+chosenTime:''));
  row('Where',isHome()?'Home visit \u00b7 '+$('area').value.trim():'At our location');
  row('Photos',photos.files.length+(photos.files.length===1?' photo':' photos'));
  row('Style worn',$('quote-worn').value.trim());
  row('Name',$('quote-name').value.trim());
  row('Phone',$('quote-phone').value.trim());
  note('Hair condition: '+$('quote-condition').value.trim());

  head('What happens next');
  note('Nothing is charged for this request.');
  note('You will get a price, plus any travel fee, after the photos are reviewed.');
  note('Accept the quote and pay the $25 deposit, plus any travel, to confirm the appointment. The remaining balance is shown then.');
  note('Your quote is based on the photos and information provided. If your hair needs additional work, we will discuss any price adjustment with you before starting.');

  $('feedback').textContent='';
  $('selection-dialog').showModal();
  return {status:'preview_only',request:'quote',reserved:false};
}

/* Nothing is reserved by a message, so this points at the question route. */
const askTime=$('request-time');
if(askTime) askTime.onclick=()=>{
  const ask=document.querySelector('.after-form-ask');
  if(ask){ask.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});ask.classList.add('is-flagged');setTimeout(()=>ask.classList.remove('is-flagged'),2200);}
};
