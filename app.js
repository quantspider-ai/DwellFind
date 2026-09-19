const CONFIG = {
  // Replace with the real DwellFind WhatsApp number before launch.
  whatsappNumber: '2340000000000'
};

const properties = [
  {id:1,title:'Modern 3-Bedroom Apartment',location:'Lekki, Lagos',type:'Buy',propertyType:'Apartment',price:'₦45m',priceValue:45,priceUnit:'total',meta:['3 beds','4 baths','Parking']},
  {id:2,title:'Family Apartment Near Ajah',location:'Ajah, Lagos',type:'Rent',propertyType:'Apartment',price:'₦4.5m / year',priceValue:4.5,priceUnit:'year',meta:['3 beds','2 baths','Serviced']},
  {id:3,title:'Residential Land Opportunity',location:'Ibeju-Lekki, Lagos',type:'Land',propertyType:'Land',price:'₦8m',priceValue:8,priceUnit:'total',meta:['600 sqm','Estate','Title check']},
  {id:4,title:'Premium 4-Bedroom Home',location:'Ikoyi, Lagos',type:'Buy',propertyType:'House',price:'₦180m',priceValue:180,priceUnit:'total',meta:['4 beds','5 baths','Security']},
  {id:5,title:'Growth-Area Land',location:'Epe, Lagos',type:'Invest',propertyType:'Investment',price:'₦3.5m',priceValue:3.5,priceUnit:'total',meta:['500 sqm','Growth area','Investment']},
  {id:6,title:'Stylish 2-Bedroom Apartment',location:'Ikeja, Lagos',type:'Rent',propertyType:'Apartment',price:'₦3.2m / year',priceValue:3.2,priceUnit:'year',meta:['2 beds','2 baths','Gated']}
];

(() => {
  try {
    const cores = navigator.hardwareConcurrency || 0;
    const memory = navigator.deviceMemory || 0;
    if ((memory && memory <= 4) || (cores && cores <= 4)) {
      document.documentElement.classList.add('low-power');
    }
  } catch (_) {}
})();

const state = {type:'Buy'};

function initHeroSlideshow(){
  const slides=[...document.querySelectorAll('.hero-slide')];
  if(slides.length<2) return;
  const reduced=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced) return;
  let index=slides.findIndex(slide=>slide.classList.contains('is-active'));
  if(index<0) index=0;
  window.setInterval(()=>{
    slides[index].classList.remove('is-active');
    index=(index+1)%slides.length;
    slides[index].classList.add('is-active');
  },5000);
}

initHeroSlideshow();

const grid=document.getElementById('propertyGrid');
const count=document.getElementById('resultCount');
const searchNote=document.getElementById('searchNote');
const featured=document.getElementById('featured');

function makeLeadId(propertyId){
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2,7).toUpperCase();
  return `DF-${propertyId}-${stamp}-${rand}`;
}

function recordLocalEvent(type, payload={}){
  try{
    const key='dwellfind_tracking_events';
    const current=JSON.parse(localStorage.getItem(key)||'[]');
    current.push({type, at:new Date().toISOString(), ...payload});
    localStorage.setItem(key, JSON.stringify(current.slice(-200)));
  }catch(_){/* localStorage may be unavailable in private/sandboxed contexts */}
}

function whatsappUrl(message){
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function buildWhatsAppLink(property){
  const leadId=makeLeadId(property.id);
  const message=`Hi DwellFind, I'm interested in ${property.title} in ${property.location}. Lead ID: ${leadId}. Please help me with the next steps.`;
  return {href:whatsappUrl(message),leadId};
}

function whatsappMarkup(label='Contact on WhatsApp', className='whatsapp-btn', extra=''){
  return `<span class="wa-button-content"><img class="whatsapp-icon" src="assets/whatsapp.png" alt="" aria-hidden="true"><span>${label}</span></span>`;
}

function card(p){
  const wa=buildWhatsAppLink(p);
  return `<article class="property-card">
    <div class="property-image" aria-hidden="true"><span class="property-type">${p.type}</span></div>
    <div class="property-body">
      <h3>${p.title}</h3>
      <div class="property-location">${p.location}</div>
      <div class="property-meta">${p.meta.map(m=>`<span>${m}</span>`).join('')}</div>
      <div class="property-price">${p.price}</div>
      <div class="property-actions">
        <button class="secondary-btn details-btn" type="button" data-id="${p.id}">View details</button>
        <a class="whatsapp-btn whatsapp-link" href="${wa.href}" data-lead="${wa.leadId}" data-property="${p.id}" target="_blank" rel="noopener">${whatsappMarkup('Contact on WhatsApp')}</a>
      </div>
    </div>
  </article>`;
}

function emptyState(){
  const helpUrl=whatsappUrl('Hello DwellFind, I need help finding a property in Lagos.');
  return `<div class="empty-state">
    <div class="empty-icon" aria-hidden="true">⌕</div>
    <h3>No matching opportunities yet</h3>
    <p>Try a wider budget or another Lagos area. You can also send your requirements directly to DwellFind on WhatsApp.</p>
    <div class="empty-actions">
      <button class="secondary-btn" id="resetSearch" type="button">Clear filters</button>
      <a class="whatsapp-btn" href="${helpUrl}" target="_blank" rel="noopener">${whatsappMarkup('Contact on WhatsApp')}</a>
    </div>
  </div>`;
}

function render(list=properties){
  grid.innerHTML=list.length ? list.map(card).join('') : emptyState();
  count.textContent=`${list.length} opportunit${list.length===1?'y':'ies'}`;
  document.querySelectorAll('.details-btn').forEach(btn=>btn.addEventListener('click',()=>showDetails(Number(btn.dataset.id))));
  wireWhatsAppTracking();
  const reset=document.getElementById('resetSearch');
  if(reset) reset.addEventListener('click', resetSearch);
}

function showDetails(id){
  const p=properties.find(x=>x.id===id);
  if(!p) return;
  const modal=document.getElementById('detailsModal');
  document.getElementById('modalTitle').textContent=p.title;
  document.getElementById('modalLocation').textContent=p.location;
  document.getElementById('modalPrice').textContent=p.price;
  document.getElementById('modalMeta').innerHTML=p.meta.map(m=>`<span>${m}</span>`).join('');
  const modalWhatsApp=buildWhatsAppLink(p);
  const modalWa=document.getElementById('modalEnquire');
  modalWa.href=modalWhatsApp.href;
  modalWa.dataset.lead=modalWhatsApp.leadId;
  modalWa.dataset.property=p.id;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
}

function closeModal(){
  const modal=document.getElementById('detailsModal');
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}

function resetSearch(){
  document.getElementById('location').value='';
  document.getElementById('propertyType').value='';
  document.getElementById('budget').value='';
  setTab('Buy');
  searchNote.textContent='Browse our current Lagos opportunities.';
  render();
  featured.scrollIntoView({behavior:'smooth',block:'start'});
}

function setTab(type){
  state.type=type;
  document.querySelectorAll('.tab').forEach(t=>{
    const active=t.dataset.type===type;
    t.classList.toggle('active',active);
    t.setAttribute('aria-selected',String(active));
  });
}

function runSearch(){
  const loc=document.getElementById('location').value;
  const pt=document.getElementById('propertyType').value;
  const budget=document.getElementById('budget').value;
  const results=properties.filter(p=>{
    const byType=p.type===state.type;
    const byLoc=!loc||p.location.toLowerCase().includes(loc.toLowerCase());
    const byPt=!pt||p.propertyType===pt;
    const byBudget=!budget||p.priceValue<=Number(budget);
    return byType&&byLoc&&byPt&&byBudget;
  });
  render(results);
  searchNote.textContent=results.length
    ? `${results.length} ${state.type.toLowerCase()} opportunit${results.length===1?'y':'ies'} match your filters.`
    : 'No exact matches. Try broader filters or request help.';
  featured.scrollIntoView({behavior:'smooth',block:'start'});
}

function wireWhatsAppTracking(){
  document.querySelectorAll('.whatsapp-link').forEach(link=>link.addEventListener('click',()=>{
    recordLocalEvent('whatsapp_click',{leadId:link.dataset.lead||'',propertyId:Number(link.dataset.property||0)});
  }));
  const modalWa=document.getElementById('modalEnquire');
  if(modalWa && !modalWa.dataset.listenerBound){
    modalWa.addEventListener('click',()=>{
      recordLocalEvent('whatsapp_click',{leadId:modalWa.dataset.lead||'',propertyId:Number(modalWa.dataset.property||0)});
    });
    modalWa.dataset.listenerBound='1';
  }
}

render();

document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>{
  setTab(tab.dataset.type);
  searchNote.textContent=`Searching ${state.type.toLowerCase()} opportunities in Lagos.`;
}));

document.querySelectorAll('[data-nav-type]').forEach(link=>link.addEventListener('click',e=>{
  e.preventDefault();
  setTab(link.dataset.navType);
  searchNote.textContent=`Searching ${state.type.toLowerCase()} opportunities in Lagos.`;
  document.getElementById('searchCard').scrollIntoView({behavior:'smooth',block:'center'});
  document.querySelector('.main-nav').style.display='';
  document.querySelector('.main-nav').dataset.open='0';
}));

document.getElementById('searchForm').addEventListener('submit',e=>{
  e.preventDefault();
  runSearch();
});

document.querySelectorAll('.area-card').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();
  const area=a.dataset.area;
  document.getElementById('location').value=area;
  runSearch();
}));

document.getElementById('calcBtn').addEventListener('click',()=>{
  const raw=document.getElementById('monthlyIncome').value.replace(/[^0-9]/g,'');
  const income=Number(raw);
  const out=document.getElementById('calcResult');
  if(!income){out.textContent='Enter your monthly income to estimate a more comfortable annual rent planning range.';return;}
  const annual=income*12; const max=annual*0.3;
  out.textContent=`Planning estimate: around ₦${Math.round(max).toLocaleString()}/year or about ₦${Math.round(max/12).toLocaleString()}/month. This is only a budgeting guide, not financial advice.`;
});

document.getElementById('menuBtn').addEventListener('click',()=>{
  const nav=document.querySelector('.main-nav');
  const open=nav.dataset.open==='1';
  nav.dataset.open=open?'0':'1';
  nav.style.display=open?'none':'flex';
  nav.style.position='absolute';nav.style.top='64px';nav.style.right='16px';nav.style.flexDirection='column';nav.style.padding='14px';nav.style.border='1px solid var(--border)';nav.style.borderRadius='16px';nav.style.background='rgba(13,23,38,.98)';
  document.getElementById('menuBtn').setAttribute('aria-expanded',String(!open));
});

document.getElementById('modalClose').addEventListener('click',closeModal);
document.getElementById('detailsModal').addEventListener('keydown', e=>{if(e.key==='Tab'){/* browser handles focus naturally in this lightweight prototype */}});
document.getElementById('detailsModal').addEventListener('click',e=>{if(e.target.id==='detailsModal') closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape') closeModal();});

// Keep the contact section button in sync with the shared WhatsApp icon asset.
const contactButton=document.getElementById('whatsappBtn');
if(contactButton){
  const contactMessage='Hello DwellFind, I want help finding a property in Lagos.';
  contactButton.href=whatsappUrl(contactMessage);
  contactButton.innerHTML=whatsappMarkup('Contact on WhatsApp');
}
