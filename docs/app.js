'use strict';

// Datos de DEMOSTRACIÓN: sustituir fotografías, ingredientes y precios por los del restaurante real.
const dishes = [
  {id:'burger',name:'Hamburguesa de la casa',category:'Principales',badge:'MÁS PEDIDO',price:34,
   desc:'Carne a la parrilla, queso fundido y pan brioche dorado.',
   ingredients:'Carne de res, queso cheddar, lechuga, tomate y brioche.',
   image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=85',model:'assets/models/burger.glb'},
  {id:'pizza',name:'Pizza Margherita',category:'Pizzas',badge:'CLÁSICO',price:39,
   desc:'Masa artesanal, tomate, mozzarella fresca y albahaca.',
   ingredients:'Harina de trigo, mozzarella, tomate y albahaca.',
   image:'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900&q=85',model:'assets/models/pizza.glb'},
  {id:'pasta',name:'Pasta de la nonna',category:'Principales',badge:'FAVORITO',price:37,
   desc:'Espaguetis artesanales con salsa de tomate y hierbas frescas.',
   ingredients:'Pasta de trigo, tomate, albahaca y aceite de oliva.',
   image:'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=900&q=85',model:'assets/models/pasta.glb'},
  {id:'sushi',name:'Sushi de salmón',category:'Especiales',badge:'FRESCO',price:42,
   desc:'Ocho bocados preparados con arroz, salmón y vegetales.',
   ingredients:'Arroz para sushi, salmón, nori, aguacate y vegetales.',
   image:'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=900&q=85',model:'assets/models/sushi.glb'},
  {id:'steak',name:'Filete a la parrilla',category:'Especiales',badge:'DE LA CASA',price:59,
   desc:'Corte jugoso con espárragos y papas doradas.',
   ingredients:'Carne de res, espárragos, papas y especias.',
   image:'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900&q=85',model:'assets/models/steak.glb'},
  {id:'cake',name:'Torta de chocolate',category:'Postres',badge:'DULCE FINAL',price:22,
   desc:'Capas suaves de chocolate con crema y un toque de fresa.',
   ingredients:'Chocolate, harina, crema, fresas y leche.',
   image:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=85',model:'assets/models/cake.glb'}
];
const $ = (s)=>document.querySelector(s);
const esc = (str)=>String(str).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = (n)=>'S/ '+Number(n).toFixed(2);
let activeCat='Todos', query='',selected=null,order={},tableNumber=7,scanner=null,toastTimer=null,qrUrl='';
try {let saved=JSON.parse(localStorage.getItem('casaOlivaOrder')||'{}');if(saved && typeof saved==='object'){for(const [k,v] of Object.entries(saved)){if(dishes.some(d=>d.id===k)&&Number.isInteger(v)&&v>0&&v<=99)order[k]=v;}}}catch{}
const urlParam = new URL(location.href).searchParams.get('mesa');
if(urlParam && /^\d{1,3}$/.test(urlParam) && Number(urlParam)>0) tableNumber=Number(urlParam);
else {try {const t=Number(sessionStorage.getItem('casaOlivaMesa'));if(t>=1&&t<=999) tableNumber=t;}catch{}}

function displayTable(){document.querySelectorAll('[data-table]').forEach(x=>x.textContent=String(tableNumber).padStart(2,'0'));$('#tableInput').value=tableNumber;}
function setTable(n){n=Number(n);if(!Number.isInteger(n)||n<1||n>999){toast('Introduce un número de mesa entre 1 y 999.');return false;}tableNumber=n;displayTable();try{sessionStorage.setItem('casaOlivaMesa',String(n));}catch{};const u=new URL(location.href);u.searchParams.set('mesa',String(n));history.replaceState({},'',u);return true;}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3200);}
function openDialog(d){if(!d.open)d.showModal();}
function closeDialog(d){if(d.open)d.close();}
function renderCards(){const items=dishes.filter(d=>(activeCat==='Todos'||d.category===activeCat)&&(`${d.name} ${d.desc} ${d.category}`).toLocaleLowerCase('es').includes(query));
 $('#dishGrid').innerHTML=items.map(d=>`<article class="dish-card"><div class="dish-photo"><img loading="lazy" src="${esc(d.image)}" alt="Fotografía ilustrativa de ${esc(d.name)}"/><span class="dish-badge">${esc(d.badge)}</span><button class="dish-photo-action" data-view="${d.id}" aria-label="Ver modelo 3D de ${esc(d.name)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m12 2 8 4.6v9L12 20l-8-4.4v-9L12 2Z"/><path d="m4 6.6 8 4.6 8-4.6M12 11.2V20"/></svg> Explorar en 3D</button></div><div class="dish-content"><span class="dish-meta">${esc(d.category.toUpperCase())}</span><div class="dish-row"><h3>${esc(d.name)}</h3><span class="dish-price">${money(d.price)}</span></div><p class="dish-desc">${esc(d.desc)}</p><div class="dish-foot"><span>Vista 3D disponible</span><button data-view="${d.id}" aria-label="Ver detalles de ${esc(d.name)}">Ver plato <span aria-hidden="true">↗</span></button></div></div></article>`).join('');
 $('#emptyState').hidden=items.length!==0;
}
// En Android, Scene Viewer de Google puede cerrarse y bloquear la aplicación Google.
// No usamos scene-viewer: WebXR (Chrome) o Quick Look (iOS) son los únicos modos.
let arCheckId=0, arReady=false, arChecking=false;
function arNotice(message){
 const box=$('#arFallback');box.textContent=message;box.hidden=false;
}
function resetARButton(){
 arCheckId++; arReady=false; arChecking=false;
 const button=$('#arButton'); button.disabled=false;
 $('#arButtonLabel').textContent='Comprobar AR';
 arNotice('Primero gira el plato en 3D. Pulsa «Comprobar AR» para saber si tu navegador puede mostrarlo sobre la mesa.');
}
function limitWait(task,ms){
 let timer;
 const timeout=new Promise((_,reject)=>{
  timer=setTimeout(()=>reject(new Error('Tiempo de espera agotado')),ms);
 });
 return Promise.race([Promise.resolve(task),timeout]).finally(()=>clearTimeout(timer));
}
async function checkAR(){
 if(arChecking)return;
 const check=++arCheckId,viewer=$('#dishViewer'),button=$('#arButton'),label=$('#arButtonLabel');
 arChecking=true; arReady=false;
 button.disabled=true;label.textContent='Comprobando AR…';
 arNotice('Comprobando el navegador y la compatibilidad AR del teléfono. Esto puede tardar unos segundos.');
 const complete=(supported,message)=>{
  if(check!==arCheckId || !$('#dishDialog').open)return;
  arChecking=false; arReady=supported; button.disabled=false;
  label.textContent=supported?'Ver en mi mesa (AR)':'Volver a comprobar AR';
  arNotice(message);
 };
 if(!window.isSecureContext){
  complete(false,'Este sitio necesita HTTPS para abrir la cámara AR. Entra desde la URL pública de GitHub Pages.');return;
 }
 const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
 try{
  if(!window.customElements){complete(false,'Este navegador no admite el visor 3D necesario. Abre la web en Chrome o Safari actualizado.');return;}
  if(!customElements.get('model-viewer'))
   await limitWait(customElements.whenDefined('model-viewer'),6000);
  if(check!==arCheckId)return;
  if(!viewer.loaded){
   complete(false,'El plato 3D aún no termina de cargar. Espera a que se vea y pulsa «Volver a comprobar AR».');return;
  }
  if(isIOS){
   const compatible=!!viewer.canActivateAR;
   complete(compatible,compatible
    ? '¡AR compatible! Toca «Ver en mi mesa (AR)» para abrir la cámara con el plato.'
    : 'Quick Look no está disponible en este navegador. Prueba Safari en un iPhone compatible. Puedes seguir viendo el plato en 3D.');
   return;
  }
  if(!navigator.xr || typeof navigator.xr.isSessionSupported!=='function'){
   complete(false,'Tu navegador no ofrece WebXR para colocar platos sobre la mesa. Abre el enlace directamente en Chrome actualizado. Si tampoco funciona, revisa que tu teléfono admita ARCore y tenga Servicios de Google Play para RA.');return;
  }
  const compatible=!!(await limitWait(navigator.xr.isSessionSupported('immersive-ar'),6000));
  if(check!==arCheckId)return;
  complete(compatible,compatible
   ? '¡Tu teléfono admite WebXR! Pulsa ahora «Ver en mi mesa (AR)». Chrome podría pedir permiso para usar la cámara.'
   : 'Chrome no detectó soporte para realidad aumentada WebXR en este teléfono. Comprueba Servicios de Google Play para RA y la compatibilidad con ARCore. La vista 3D sigue disponible.');
 }catch(error){
  complete(false,error?.message==='Tiempo de espera agotado'
   ? 'La comprobación AR tardó demasiado y se detuvo. Puede deberse al servicio AR de Google o al navegador. Actualiza Chrome y Servicios de Google Play para RA y vuelve a intentarlo.'
   : 'Falló la comprobación de realidad aumentada. Prueba abrir la carta en Chrome actualizado y revisa los permisos y Servicios de Google Play para RA.');
 }
}
function launchAR(){
 if(arChecking)return;
 if(!arReady){void checkAR();return;}
 const viewer=$('#dishViewer');
 if(!viewer.loaded || typeof viewer.activateAR!=='function' || !viewer.canActivateAR){
  arReady=false; $('#arButtonLabel').textContent='Volver a comprobar AR';
  arNotice('El visor todavía no está listo para iniciar AR. Espera a que cargue el modelo y vuelve a comprobar la compatibilidad.');
  return;
 }
 arNotice('Abriendo la cámara AR… Concede permiso a Chrome si lo solicita. Si la cámara falla, podrás seguir explorando el plato en 3D.');
 // No utilizar await antes de activateAR: requiere un gesto directo del usuario.
 try{
  const result=viewer.activateAR();
  if(result && typeof result.catch==='function')result.catch(()=>{
   arReady=false; $('#arButtonLabel').textContent='Volver a comprobar AR';
   arNotice('No se pudo iniciar la sesión AR. El servicio de realidad aumentada del teléfono o los permisos pueden estar fallando. La vista 3D sigue funcionando.');
  });
 }catch{
  arReady=false; $('#arButtonLabel').textContent='Volver a comprobar AR';
  arNotice('El teléfono no pudo iniciar AR. Revisa Chrome y Servicios de Google Play para RA; el plato sigue disponible en 3D.');
 }
}

function openDish(id){const d=dishes.find(x=>x.id===id);if(!d)return;selected=d;$('#detailName').textContent=d.name;$('#detailCategory').textContent=d.category.toUpperCase()+' · CARTA 3D';$('#detailDescription').textContent=d.desc;$('#detailIngredients').textContent=d.ingredients;$('#detailPrice').textContent=money(d.price);resetARButton();
 const viewer=$('#dishViewer');viewer.setAttribute('alt',`Modelo 3D ilustrativo de ${d.name}`);viewer.setAttribute('src',d.model);viewer.setAttribute('camera-target','auto auto auto');$('#progressFill').style.width='0%';openDialog($('#dishDialog'));}
function totals(){let count=0,total=0;for(const [k,n] of Object.entries(order)){const d=dishes.find(x=>x.id===k);if(d){count+=n;total+=d.price*n;}}return {count,total};}
function updateOrder(){let {count,total}=totals();$('#openOrder').hidden=count===0;$('#orderCount').textContent=count;$('#orderTotal').textContent=money(total);$('#fullTotal').textContent=money(total);try{localStorage.setItem('casaOlivaOrder',JSON.stringify(order))}catch{}
 $('#orderItems').innerHTML=count===0?'<p class="order-empty">Aún no has elegido platos. Explora nuestra carta para añadir alguno.</p>':dishes.filter(d=>order[d.id]).map(d=>`<div class="order-row"><div><h3>${esc(d.name)}</h3><small>${money(d.price)} c/u</small></div><div class="order-row-right"><strong>${money(d.price*order[d.id])}</strong><div class="qty-controls"><button aria-label="Quitar un ${esc(d.name)}" data-qty="${d.id}" data-delta="-1">−</button><span>${order[d.id]}</span><button aria-label="Añadir un ${esc(d.name)}" data-qty="${d.id}" data-delta="1">+</button></div></div></div>`).join('');
}
function addDish(){if(!selected)return;order[selected.id]=Math.min(99,(order[selected.id]||0)+1);updateOrder();closeDialog($('#dishDialog'));toast(`Añadido: ${selected.name}`);}
function setQty(id,delta){order[id]=Math.max(0,Math.min(99,(order[id]||0)+delta));if(order[id]===0)delete order[id];updateOrder();}
function formattedOrder(){let {total}=totals();return ['CASA OLIVA · Selección de platos',`Mesa: ${tableNumber}`,'',...dishes.filter(d=>order[d.id]).map(d=>`${order[d.id]} × ${d.name} — ${money(order[d.id]*d.price)}`),'',`TOTAL ESTIMADO: ${money(total)}`,'(Selección demostrativa; aún no es un pedido confirmado.)'].join('\n');}
async function copyText(text){try{await navigator.clipboard.writeText(text);toast('Copiado al portapapeles.');return;}catch{}const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();try{document.execCommand('copy');toast('Copiado al portapapeles.')}catch{toast('No se pudo copiar. Selecciona el texto manualmente.')}area.remove();}
function loadScript(src,globalName){if(window[globalName])return Promise.resolve();return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=()=>window[globalName]?resolve():reject(new Error('Librería no disponible'));s.onerror=reject;document.head.appendChild(s);});}
function getQrUrl(){const u=new URL(window.location.href);u.searchParams.set('mesa',String(tableNumber));u.hash='';return u.href;}
async function generateQr(){if(!setTable($('#tableInput').value))return;qrUrl=getQrUrl();const el=$('#qrCanvas');el.innerHTML='<span class="qr-loading">✳</span>';if(location.protocol==='file:'){$('#qrStatus').textContent='Para usar el QR con un celular, publica primero esta carpeta en una URL HTTPS.';return;}
 try{await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js','QRCode');el.innerHTML='';new window.QRCode(el,{text:qrUrl,width:200,height:200,colorDark:'#203426',colorLight:'#ffffff',correctLevel:window.QRCode.CorrectLevel.M});$('#qrStatus').textContent=`Escanea para abrir la carta de la mesa ${tableNumber}.`;}
 catch{$('#qrStatus').textContent='No se pudo cargar el generador QR. Puedes copiar el enlace de la mesa.';el.innerHTML='<span class="qr-loading">✳</span>';}}
function openQr(){openDialog($('#qrDialog'));generateQr();}
function downloadQr(){const can=$('#qrCanvas canvas');const img=$('#qrCanvas img');const data=can?.toDataURL('image/png')||img?.src;if(!data||!data.startsWith('data:')){toast('Genera el QR antes de descargarlo.');return;}const a=document.createElement('a');a.href=data;a.download=`casa-oliva-mesa-${tableNumber}.png`;document.body.appendChild(a);a.click();a.remove();}
async function startScan(){openDialog($('#scanDialog'));$('#scanStatus').textContent='Preparando el lector…';if(!window.isSecureContext){$('#scanStatus').textContent='La cámara requiere HTTPS o localhost. También puedes escanear el QR desde la cámara normal del teléfono.';return;}
 try{await loadScript('https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js','Html5Qrcode');scanner=new window.Html5Qrcode('qr-reader',{verbose:false});await scanner.start({facingMode:'environment'},{fps:10,qrbox:{width:220,height:220}},async decoded=>{let n=null;try{const u=new URL(decoded);if(u.origin!==location.origin){$('#scanStatus').textContent='El QR pertenece a otra web. Por seguridad no abriremos direcciones ajenas.';return;}n=u.searchParams.get('mesa');}catch{if(/^\d{1,3}$/.test(decoded))n=decoded;}if(n && setTable(n)){await stopScan();closeDialog($('#scanDialog'));toast(`Mesa ${tableNumber} seleccionada. ¡Bienvenido!`);}else{$('#scanStatus').textContent='Este QR no tiene un número de mesa válido.';}},()=>{});$('#scanStatus').textContent='Apunta hacia el QR colocado en la mesa.';}
 catch(e){$('#scanStatus').textContent='No se pudo acceder a la cámara. Revisa los permisos y prueba con Chrome o Safari, o usa la cámara normal del teléfono.';await stopScan();}}
async function stopScan(){if(scanner){try{if(scanner.isScanning)await scanner.stop();await scanner.clear();}catch{}scanner=null;}$('#qr-reader').innerHTML='';}

// Events
$('#dishGrid').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)openDish(b.dataset.view);});
document.querySelectorAll('.category-tabs button').forEach(b=>b.addEventListener('click',()=>{activeCat=b.dataset.cat;document.querySelectorAll('.category-tabs button').forEach(x=>x.setAttribute('aria-selected',String(x===b)));renderCards();}));
$('#dishSearch').addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase('es');renderCards();});
$('#resetFilters').addEventListener('click',()=>{activeCat='Todos';query='';$('#dishSearch').value='';document.querySelectorAll('.category-tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.cat==='Todos')));renderCards();});
$('#closeDish').addEventListener('click',()=>closeDialog($('#dishDialog')));
$('#dishDialog').addEventListener('close',()=>{arCheckId++;arReady=false;arChecking=false;const v=$('#dishViewer');v.removeAttribute('src');});
$('#dishViewer').addEventListener('progress',e=>{$('#progressFill').style.width=`${Math.round((e.detail?.totalProgress||0)*100)}%`;});
$('#dishViewer').addEventListener('error',()=>toast('No se pudo cargar el modelo. Comprueba el archivo 3D.'));
$('#arButton').addEventListener('click',launchAR);
$('#dishViewer').addEventListener('load',()=>{if($('#dishDialog').open && !arChecking && !arReady)arNotice('Plato 3D cargado. Pulsa «Comprobar AR» para verificar la vista en tu mesa.');});
$('#dishViewer').addEventListener('ar-status',e=>{if(e.detail?.status==='failed')arNotice('La sesión de realidad aumentada falló. Revisa los permisos y Servicios de Google Play para RA. El plato sigue disponible en 3D.');});
$('#addOrder').addEventListener('click',addDish);
$('#openOrder').addEventListener('click',()=>{updateOrder();openDialog($('#orderDialog'));});
$('#closeOrder').addEventListener('click',()=>closeDialog($('#orderDialog')));
$('#orderItems').addEventListener('click',e=>{const b=e.target.closest('[data-qty]');if(b)setQty(b.dataset.qty,Number(b.dataset.delta));});
$('#copyOrder').addEventListener('click',()=>{if(!totals().count){toast('Selecciona un plato primero.');return;}copyText(formattedOrder());});
$('#openQr').addEventListener('click',openQr);
$('#tableInfo').addEventListener('click',openQr);
$('#closeQr').addEventListener('click',()=>closeDialog($('#qrDialog')));
$('#generateQr').addEventListener('click',generateQr);
$('#copyUrl').addEventListener('click',()=>copyText(getQrUrl()));
$('#downloadQr').addEventListener('click',downloadQr);
$('#heroScan').addEventListener('click',startScan);
$('#closeScanner').addEventListener('click',async()=>{await stopScan();closeDialog($('#scanDialog'));});
$('#stopScanner').addEventListener('click',stopScan);
$('#scanDialog').addEventListener('close',stopScan);
// Native backdrop behavior: clicking outside a dialog closes it.
for(const dialog of document.querySelectorAll('dialog')){dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});}

displayTable();renderCards();updateOrder();
