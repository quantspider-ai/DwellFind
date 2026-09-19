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

const state={type:'Buy'};
const grid=document.getElementById('propertyGrid');
const count=document.getElementById('resultCount');
const searchNote=document.getElementById('searchNote');
const featured=document.getElementById('featured');

function whatsappUrl(message){
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function card(p){
  return `<article class="property-card">
    <div class="property-image" aria-hidden="true"><span class="property-type">${p.type}</span></div>
    <div class="property-body">
      <h3>${p.title}</h3>
      <div class="property-location">${p.location}</div>
      <div class="property-meta">${p.meta.map(m=>`<span>${m}</span>`).join('')}</div>
      <div class="property-price">${p.price}</div>
      <div class="property-actions">
        <button class="secondary-btn details-btn" type="button" data-id="${p.id}">View details</button>
        <a class="primary-btn" href="${whatsappUrl(`Hello DwellFind, I want more details about ${p.title} in ${p.location}.`)}" target="_blank" rel="noopener">Enquire</a>
      </div>
    </div>
  </article>`;
}

function emptyState(){
  return `<div class="empty-state">
    <div class="empty-icon" aria-hidden="true">⌕</div>
    <h3>No matching opportunities yet</h3>
    <p>Try a wider budget or another Lagos area. You can also tell DwellFind what you need and we can route your enquiry to a relevant partner.</p>
    <div class="empty-actions">
      <button class="secondary-btn" id="resetSearch" type="button">Clear filters</button>
      <a class="primary-btn" href="${whatsappUrl('Hello DwellFind, I need help finding a property in Lagos.')}" target="_blank" rel="noopener">Request help</a>
    </div>
  </div>`;
}

function render(list=properties){
  grid.innerHTML=list.length ? list.map(card).join('') : emptyState();
  count.textContent=`${list.length} opportunit${list.length===1?'y':'ies'}`;
  document.querySelectorAll('.details-btn').forEach(btn=>btn.addEventListener('click',()=>showDetails(Number(btn.dataset.id))));
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
  document.getElementById('modalEnquire').href=whatsappUrl(`Hello DwellFind, I want more details about ${p.title} in ${p.location}.`);
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
