'use strict';
const services={'kids-braids':{name:'Kids’ braid takedown',price:'$45'},braids:{name:'Braid takedown',price:'$80'},weave:{name:'Weave takedown',price:'$60'},'cornrow-natural':{name:'Natural cornrows',price:'$40'},'cornrow-extensions':{name:'Cornrows with extensions',price:'$55'},tangled:{name:'Tangled or matted braids',price:'From $120'}};
const $=id=>document.getElementById(id);
const east=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
const part=t=>east.find(p=>p.type===t).value;
const today=new Date(Number(part('year')),Number(part('month'))-1,Number(part('day')));
let year=today.getFullYear(),month=today.getMonth(),chosenDate=null,chosenTime=null;
const weekdaySlots=['9:00 AM','12:00 PM','3:00 PM'];
const weekendSlots=['7:00 AM','9:00 AM','11:00 AM','1:00 PM','3:00 PM','5:00 PM','7:00 PM'];
const slots=[...new Set([...weekendSlots,...weekdaySlots])];
function slotsForDate(date){return date.getDay()===0||date.getDay()===6?weekendSlots:weekdaySlots;}
const formatDate=d=>new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(d);
function available(d){return d>=today && d.getDay()!==1 && d.getDay()!==3;}
function syncSummary(){$('appointment-details').hidden=!chosenDate||!chosenTime;const service=services[$('service-select').value];$('summary-service').textContent=service.name;$('summary-price').textContent=service.price;const home=document.querySelector('input[name=location]:checked').value==='home';$('home-fields').hidden=!home;$('location-note').hidden=home;$('summary-location').textContent=home?'Home visit · travel fee additional':'At our location';$('summary-date').textContent=chosenDate?formatDate(chosenDate)+(chosenTime?' at '+chosenTime:' · choose a time'):'Choose a date and time.';$('feedback').textContent='';}
function renderCalendar(){const first=new Date(year,month,1);$('month-title').textContent=first.toLocaleDateString('en-US',{month:'long',year:'numeric'});$('prev-month').disabled=year===today.getFullYear()&&month===today.getMonth();$('dates').replaceChildren();for(let i=0;i<first.getDay();i++){$('dates').append(document.createElement('span'));}for(let day=1;day<=new Date(year,month+1,0).getDate();day++){const date=new Date(year,month,day),b=document.createElement('button');b.type='button';b.textContent=day;b.disabled=!available(date);b.setAttribute('aria-label',formatDate(date)+(b.disabled?' unavailable':' sample appointments'));const selected=chosenDate?.getTime()===date.getTime();b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));b.addEventListener('click',()=>{chosenDate=date;chosenTime=null;renderCalendar();renderTimes();renderQuickDates();syncSummary();});$('dates').append(b);}}
function renderTimes(){$('times').replaceChildren();if(!chosenDate){const p=document.createElement('p');p.textContent='Choose a date to see sample times.';$('times').append(p);return;}for(const time of slotsForDate(chosenDate)){const b=document.createElement('button');b.type='button';b.textContent=time;b.classList.toggle('selected',time===chosenTime);b.setAttribute('aria-pressed',String(time===chosenTime));b.onclick=()=>{chosenTime=time;renderTimes();syncSummary();};$('times').append(b);}}
function moveMonth(delta){month+=delta;if(month<0){month=11;year--;}if(month>11){month=0;year++;}renderCalendar();}
$('prev-month').onclick=()=>moveMonth(-1);$('next-month').onclick=()=>moveMonth(1);
$('allergies-toggle').onchange=()=>{const yes=$('allergies-toggle').checked;$('allergy-fields').hidden=!yes;$('allergy-details').required=yes;if(yes)$('allergy-details').focus();};
$('service-select').onchange=syncSummary;document.querySelectorAll('input[name=location]').forEach(i=>i.onchange=syncSummary);
document.querySelectorAll('[data-service]').forEach(b=>b.onclick=()=>{$('service-select').value=b.dataset.service;syncSummary();$('booking').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
$('home-cta').addEventListener('click',()=>{document.querySelector('input[value=home]').checked=true;syncSummary();});
function reviewSelection(){if(!chosenDate||!chosenTime){$('feedback').textContent='Please choose a date and time.';return {error:'Date and time are required.'};}const home=document.querySelector('input[name=location]:checked').value==='home';if(home&&!$('area').value.trim()){$('feedback').textContent='Please enter your city or ZIP code for a home visit.';$('area').focus();return {error:'Home visit area is required.'};}for(const id of ['client-name','client-phone',...($('allergies-toggle').checked?['allergy-details']:[])]){const field=$(id);if(!field.value.trim()||!field.checkValidity()){$('feedback').textContent=id==='allergy-details'?'Please list your product allergies or sensitivities.':'Please add your name and a phone number.';field.focus();field.reportValidity();return {error:'Appointment details are required.'};}}if(!$('policy').checked){$('feedback').textContent='Please confirm the deposit and cancellation policy.';$('policy').focus();return {error:'Policy acknowledgement is required.'};}const s=services[$('service-select').value];$('review-content').replaceChildren();const amount=Number(s.price.replace(/[^0-9.]/g,''));const lines=[s.name+' · '+s.price,'Deposit due at booking: $25 · Applied toward your service total',s===services.tangled?'Remaining balance based on your confirmed quote.':'Remaining service balance: $'+(amount-25),$('client-name').value.trim()+($('client-email').value.trim()?' · '+$('client-email').value.trim():''),...($('client-phone').value.trim()?['Phone: '+$('client-phone').value.trim()]:[]),'Product allergies or sensitivities: '+($('allergies-toggle').checked?$('allergy-details').value.trim():'None reported'),...($('client-comments').value.trim()?['Additional notes: '+$('client-comments').value.trim()]:[]),formatDate(chosenDate)+' at '+chosenTime+' Eastern Time',home?'Home visit · '+$('area').value.trim():'At our location',...(home?['Travel fee will be quoted based on distance.']:[]),...(s===services.tangled?['Photos required. Final quote confirmed before booking.']:[]),'Payments, including the deposit, are nonrefundable.','At least 24 hours’ notice for cancellation or rescheduling, preferably 48 hours. One deposit transfer with timely rescheduling.'];for(const line of lines){const p=document.createElement('p');p.textContent=line;$('review-content').append(p);}$('feedback').textContent='';$('selection-dialog').showModal();return {status:'preview_only',service:s.name,price:s.price,date:formatDate(chosenDate),time:chosenTime,location:home?'home':'studio',reserved:false};}
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
