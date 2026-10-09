const state={
 phase:0,risk:72,rep:100,time:120,found:0,actions:0,
 controls:new Set(),investigated:new Set(),classified:new Set(),fixed:new Set(),
 exfilStopped:false,usedActions:new Set(),selectedFile:null,phaseComplete:false,finished:false
};

const phases=[
 {label:"FASE 1 // RECONHECIMENTO",title:"Encontre o caminho do invasor",story:"O SOC recebeu vários sinais ao mesmo tempo. Investigue as fontes e conecte as pistas. Cada ação tem uma finalidade diferente.",objective:"Descubra o vetor de entrada e execute duas contenções úteis."},
 {label:"FASE 2 // DADOS",title:"Descubra o que está em risco",story:"O invasor alcançou o servidor financeiro. Investigue os arquivos e identifique quais informações exigem maior proteção.",objective:"Classifique os quatro arquivos e identifique os dados sensíveis."},
 {label:"FASE 3 // CONTENÇÃO",title:"Feche as brechas",story:"Agora você conhece a origem do problema. Corrija as configurações sem derrubar o servidor inteiro.",objective:"Corrija as quatro vulnerabilidades encontradas."},
 {label:"FASE 4 // EXFILTRAÇÃO",title:"Os dados estão saindo",story:"A transferência começou. Você precisa interromper a exfiltração e preservar a investigação.",objective:"Bloqueie o vazamento e registre evidências."}
];

const events=[
 {id:"scan",time:"08:41",title:"Varredura detectada",text:"IP externo sondou a porta 8080 do servidor financeiro.",kind:"danger"},
 {id:"login",time:"08:43",title:"Login administrativo",text:"A conta admin iniciou uma sessão fora do padrão.",kind:"warn"},
 {id:"data",time:"08:44",title:"Acesso a dados",text:"A pasta /clientes/2026 foi acessada.",kind:"danger"},
 {id:"traffic",time:"08:45",title:"Conexão externa",text:"O servidor abriu uma conexão para um endereço externo.",kind:"danger"}
];

const files={
 clientes:{name:"clientes_2026.xlsx",desc:"CPF, endereço e telefone • 4,2 MB",correct:"conf"},
 proced:{name:"procedimentos_internos.pdf",desc:"Processos internos • 1,1 MB",correct:"int"},
 prod:{name:"catalogo_produtos.pdf",desc:"Material publicado no site • 8 MB",correct:"pub"},
 folha:{name:"folha_pagamento.xlsx",desc:"Salários e dados bancários • 2,7 MB",correct:"conf"}
};

function $(id){return document.getElementById(id)}
function show(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$(id).classList.add("active")}
function update(){
 state.risk=Math.max(0,Math.min(100,state.risk));
 state.rep=Math.max(0,state.rep);
 $("risk").textContent=state.risk+"%";$("rep").textContent=state.rep;$("phase").textContent=(state.phase+1)+"/4";
 $("attackbar").style.width=state.risk+"%";$("attackpct").textContent=state.risk+"%";
 $("risk").style.color=state.risk>70?"var(--red)":state.risk>40?"var(--yellow)":"var(--green)";
 $("attackbar").style.background=state.risk>70?"var(--red)":state.risk>40?"var(--yellow)":"var(--green)";
}
function toast(msg,kind=""){
 const t=$("toast");t.textContent=msg;t.style.display="block";
 t.style.borderColor=kind==="bad"?"var(--red)":kind==="good"?"var(--green)":"var(--cyan)";
 clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.style.display="none",2500);
}
function addFeed(text,kind=""){
 const f=$("feed"),d=document.createElement("div");d.textContent=text;d.className=kind;f.prepend(d);
 while(f.children.length>5)f.lastChild.remove();
}
function once(key){
 if(state.usedActions.has(key))return false;
 state.usedActions.add(key);return true;
}
function risk(n){state.risk+=n;update()}
function rep(n){state.rep+=n;update()}
function use(c){state.controls.add(c)}
function found(key){
 if(state.investigated.has(key))return false;
 state.investigated.add(key);state.found++;return true;
}

function boot(){
 const overlay=$("boot"),log=$("bootlog"),bar=$("bootbar"),status=$("bootstatus");
 overlay.classList.remove("hidden");log.innerHTML="";
 const lines=[
  ["[SOC] iniciando estação de resposta...","cyan"],
  ["[NET] conexão segura estabelecida.","ok"],
  ["[AUTH] analista autenticado.","ok"],
  ["[SIEM] carregando eventos de segurança...","cyan"],
  ["[EDR] 47 ativos encontrados.","ok"],
  ["[SCAN] varredura de rede iniciada...","warn"],
  ["[ALERT] tráfego anômalo detectado.","bad"],
  ["[ALERT] possível intrusão em SRV-FIN-02.","bad"],
  ["[SOC] incidente escalado para análise humana.","warn"],
  ["[SYSTEM] ambiente pronto.","ok"]
 ];
 let i=0;
 function next(){
  if(i>=lines.length){bar.style.width="100%";status.textContent="Conexão estabelecida. Entrando no SOC...";setTimeout(()=>{overlay.classList.add("hidden");show("game");render();startClock();flash();},500);return}
  const [txt,kind]=lines[i],d=document.createElement("div");d.className="bootline "+kind;d.textContent=txt;log.appendChild(d);log.scrollTop=log.scrollHeight;
  bar.style.width=((i+1)/lines.length*100)+"%";status.textContent=txt.replace(/^\[[^\]]+\]\s*/,"");i++;setTimeout(next,220);
 }
 next();
}
$("enter").addEventListener("click",boot);

function render(){
 const p=phases[state.phase];
 $("phaseLabel").textContent=p.label;$("title").textContent=p.title;$("story").textContent=p.story;$("objective").textContent=p.objective;
 bindNav();
 document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));
 document.querySelector('.nav[data-panel="events"]').classList.add("active");
 renderPanel("events");update();
}
function bindNav(){
 document.querySelectorAll(".nav").forEach(b=>{
  b.onclick=()=>{
   document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));
   b.classList.add("active");renderPanel(b.dataset.panel);
  };
 });
}
function renderPanel(type){
 $("panelTitle").textContent={events:"EVENTOS EM TEMPO REAL",network:"MONITORAMENTO DE REDE",assets:"ATIVOS CORPORATIVOS",users:"ATIVIDADE DE USUÁRIOS",data:"MAPA DE DADOS"}[type];
 if(state.phase===0)phase1(type);
 if(state.phase===1)phase2(type);
 if(state.phase===2)phase3(type);
 if(state.phase===3)phase4(type);
}

/* PHASE 1 */
function phase1(type){
 if(type==="events"){
  $("panel").innerHTML=`<div class="eventlist">${events.map(e=>{
   const done=state.investigated.has("event_"+e.id);
   return `<div class="event ${e.kind} ${done?"done":""}" onclick="openEvent('${e.id}')">
    <span class="time">${e.time}</span><strong>${done?"✓ ":""}${e.title}</strong><p>${e.text}</p>
   </div>`;
  }).join("")}</div>`;
  return;
 }
 if(type==="network"){
  const done=state.investigated.has("network");
  $("panel").innerHTML=`<div class="log"><b>LIVE NETWORK MONITOR</b><br>
  08:40:11  10.20.4.15 → SRV-WEB-01:443  <span class="good">NORMAL</span><br>
  08:41:03  185.77.91.4 → SRV-FIN-02:8080  <span class="bad">SCAN</span><br>
  08:41:04  185.77.91.4 → SRV-FIN-02:8080  <span class="bad">SCAN</span><br>
  08:43:19  SRV-FIN-02 → 91.204.18.7:443  <span class="bad">OUTBOUND</span><br>
  08:44:02  SRV-FIN-02 → 91.204.18.7:443  <span class="bad">OUTBOUND</span><br>
  08:45:12  CLIENT-07 → SRV-FIN-02:445  <span class="warn">ACCESS</span></div>
  <div class="actions">
   <button class="action ${done?"used":""}" onclick="investigateNetwork()" ${done?"disabled":""}>${done?"✓ EVIDÊNCIA REGISTRADA":"MARCAR COMO EVIDÊNCIA"}</button>
   <button class="action" onclick="blockIP()">BLOQUEAR IP EXTERNO</button>
  </div>`;
  return;
 }
 if(type==="assets"){
  $("panel").innerHTML=`<div class="grid">
   <div class="tile" onclick="inspectAsset('web')"><h3>🌐 SRV-WEB-01</h3><p>Servidor web • porta 443 • configuração estável</p><span class="status goodtext">NORMAL</span></div>
   <div class="tile ${state.investigated.has("asset_fin")?"selected":""}" onclick="inspectAsset('fin')"><h3>🖥️ SRV-FIN-02</h3><p>Servidor financeiro • 4 serviços • dados sensíveis</p><span class="status">INVESTIGAR</span></div>
   <div class="tile" onclick="inspectAsset('backup')"><h3>💾 BKP-01</h3><p>Backup • acesso interno • última cópia 02:00</p><span class="status goodtext">NORMAL</span></div>
   <div class="tile" onclick="inspectAsset('mobile')"><h3>📱 MDM-17</h3><p>Dispositivo móvel • MDM ativo</p><span class="status goodtext">NORMAL</span></div>
  </div>`;
  return;
 }
 if(type==="users"){
  const done=state.investigated.has("user");
  $("panel").innerHTML=`<div class="users">
   <div class="user"><div><b>ana.financeiro</b><p>08:02 • acesso normal • Belo Horizonte</p></div><button onclick="analyzeNormal()">ANALISAR</button></div>
   <div class="user"><div><b>admin</b><p>08:43 • login fora do padrão • IP externo</p></div><button onclick="inspectUser()">${done?"✓ INVESTIGADO":"INVESTIGAR"}</button></div>
   <div class="user"><div><b>backup.service</b><p>02:00 • rotina automática</p></div><button onclick="analyzeNormal()">ANALISAR</button></div>
  </div>`;
  return;
 }
 $("panel").innerHTML=`<div class="detail"><h3>📁 /clientes/2026</h3><p>Diretório acessado às 08:44 por uma sessão administrativa.</p><div class="log">clientes_2026.xlsx — 4,2 MB — dados pessoais<br>contratos.pdf — 2,1 MB — informações comerciais<br>produtos.pdf — 8 MB — material público</div><div class="actions"><button class="action ${state.investigated.has("data")?"used":""}" onclick="investigateData()" ${state.investigated.has("data")?"disabled":""}>${state.investigated.has("data")?"✓ EVIDÊNCIA REGISTRADA":"MARCAR COMO EVIDÊNCIA"}</button></div></div>`;
}
function openEvent(id){
 const key="event_"+id;if(state.investigated.has(key)){toast("Esta evidência já foi analisada.","good");return}
 state.investigated.add(key);state.found++;rep(3);risk(-2);addFeed("EVIDÊNCIA: "+id,"green");toast("Evento adicionado à investigação.","good");renderPanel("events");checkPhase1();
}
function investigateNetwork(){if(!found("network"))return;rep(5);risk(-4);addFeed("REDE CORRELACIONADA","green");toast("O tráfego confirma sondagem externa e conexão de saída.","good");renderPanel("network");}
function investigateData(){if(!found("data"))return;rep(4);risk(-3);addFeed("ACESSO A DADOS CONFIRMADO","green");toast("O diretório contém informações que exigem proteção.","good");renderPanel("data");checkPhase1();}
function analyzeNormal(){toast("Nenhuma anomalia relevante encontrada.","good")}
function inspectAsset(id){
 if(id!=="fin"){toast("Este ativo não apresenta sinais relevantes.");return}
 if(!found("asset_fin")){rep(4);risk(-3);addFeed("SERVIDOR FINANCEIRO INVESTIGADO","green")}
 $("panel").innerHTML=`<div class="detail"><h3>🖥️ SRV-FIN-02</h3><p>Servidor financeiro. Há uma configuração que não combina com o uso esperado.</p>
 <div class="log"><b>PORTAS:</b> 22, 443, <span class="bad">8080</span><br><b>SERVIÇOS:</b> ssh, nginx, backup, <span class="bad">legacy-admin</span><br><b>ÚLTIMO USO:</b> 31 dias<br><b>RESPONSÁVEL:</b> <span class="warn">não definido</span><br><b>STARTUP:</b> <span class="bad">automático</span></div>
 <div class="actions"><button class="action good" onclick="disableLegacy()">DESATIVAR LEGACY-ADMIN</button><button class="action bad" onclick="ignoreLegacy()">DEIXAR ATIVO</button></div></div>`;
}
function disableLegacy(){
 if(state.fixed.has("service"))return;
 state.fixed.add("service");state.actions++;use("CIS 04.08");risk(-14);rep(8);addFeed("SERVIÇO DESNECESSÁRIO DESATIVADO","green");toast("CIS 04.08 aplicado. Superfície de ataque reduzida.","good");renderPanel("assets");checkPhase1();
}
function ignoreLegacy(){if(once("ignore_legacy")){risk(8);rep(-4);addFeed("SERVIÇO CONTINUA EXPOSTO","red");toast("O atacante continua sondando a porta 8080.","bad")}}
function inspectUser(){
 if(state.investigated.has("user")){toast("Conta já investigada.","good");return}
 state.investigated.add("user");state.found++;rep(4);risk(-3);
 $("panel").innerHTML=`<div class="detail"><h3>♙ CONTA: admin</h3><p>Conta criada na instalação do servidor e nunca renomeada.</p>
 <div class="log"><b>08:43:19</b> login aceito<br><span class="bad">origem: 185.77.91.4</span><br><span class="bad">horário fora do padrão</span><br>último login legítimo: 17 dias atrás</div>
 <div class="actions"><button class="action good" onclick="disableAdmin()">DESATIVAR CONTA</button><button class="action bad" onclick="leaveAdmin()">MANTER ATIVA</button></div></div>`;
}
function disableAdmin(){if(state.fixed.has("account"))return;state.fixed.add("account");state.actions++;use("CIS 04.07");risk(-13);rep(8);addFeed("CONTA PADRÃO DESATIVADA","green");toast("CIS 04.07 aplicado. Conta padrão removida do caminho do ataque.","good");renderPanel("users");checkPhase1()}
function leaveAdmin(){if(once("leave_admin")){risk(9);rep(-5);addFeed("CONTA ADMIN CONTINUA ATIVA","red");toast("O invasor ainda possui uma conta previsível.","bad")}}
function blockIP(){
 if(state.fixed.has("ip")){toast("Esse IP já foi bloqueado.","good");return}
 state.fixed.add("ip");state.actions++;use("CIS 04.04");risk(-10);rep(5);addFeed("IP EXTERNO BLOQUEADO","green");toast("Firewall bloqueou a origem observada.","good");renderPanel("network");
}
function checkPhase1(){ completePhase(); }

/* PHASE 2 */
function phase2(type){
 if(type!=="data"){
  $("panel").innerHTML=`<div class="detail"><h3>🔎 FASE DE DADOS</h3><p>Use o painel <b>DADOS</b> para investigar os arquivos. Os outros sensores mostram o contexto do incidente.</p><div class="log">ACESSO DETECTADO → /clientes/2026<br>ARQUIVOS POTENCIALMENTE SENSÍVEIS → 4<br>EXFILTRAÇÃO → ainda não iniciada</div></div>`;
  return;
 }
 $("panel").innerHTML=`<div class="detail"><h3>▤ ARQUIVOS ENCONTRADOS</h3><p>Selecione um arquivo. Leia os metadados e decida onde ele deve ficar.</p>
 <div class="files">${Object.entries(files).map(([id,f])=>`<div class="file ${state.classified.has(id)?"done":""}" onclick="selectFile('${id}')"><strong>${state.classified.has(id)?"✓ ":""}📄 ${f.name}</strong><small>${f.desc}</small></div>`).join("")}</div>
 <div id="fileDetail"></div>
 <div class="classification"><div class="bucket"><h4>PÚBLICO</h4><div id="pub"></div></div><div class="bucket"><h4>INTERNO</h4><div id="int"></div></div><div class="bucket"><h4>CONFIDENCIAL</h4><div id="conf"></div></div></div></div>`;
}
function selectFile(id){
 if(state.classified.has(id)){toast("Arquivo já classificado.","good");return}
 state.selectedFile=id;const f=files[id];
 $("fileDetail").innerHTML=`<div class="detail" style="margin-top:10px"><b>${f.name}</b><p>${f.desc}</p><div class="actions"><button class="action" onclick="classify('pub')">PÚBLICO</button><button class="action" onclick="classify('int')">INTERNO</button><button class="action" onclick="classify('conf')">CONFIDENCIAL</button></div></div>`;
}
function classify(bucket){
 const id=state.selectedFile;if(!id||state.classified.has(id))return;
 const f=files[id];
 if(bucket!==f.correct){rep(-5);risk(5);toast("⚠️ Essa classificação não combina com a informação descrita.","bad");return}
 state.classified.add(id);state.found++;rep(4);risk(-4);use("CIS 03.07");addFeed("DADO CLASSIFICADO: "+f.name,"green");toast("Classificação registrada. CIS 03.07.","good");renderPanel("data");
 if(state.classified.size===4)completePhase();
}

/* PHASE 3 */
function phase3(type){
 if(type!=="assets"){
  $("panel").innerHTML=`<div class="detail"><h3>🛡️ CONFIGURAÇÃO SEGURA</h3><p>Investigue cada componente. Corrija um por vez. Desligar o servidor inteiro não conta como solução.</p><div class="log">SERVIÇO → inseguro<br>CONTA → insegura<br>FIREWALL → permissivo<br>CRIPTOGRAFIA → desativada</div></div>`;
  return;
 }
 const rows=[
  ["service","⚙️ SERVIÇOS","Legacy-admin ativo.","CIS 04.08"],
  ["account","♙ CONTAS","Conta padrão admin ativa.","CIS 04.07"],
  ["firewall","🔥 FIREWALL","Regra externa permissiva.","CIS 04.04"],
  ["crypto","🔐 DADOS","Dados sensíveis sem criptografia em repouso.","CIS 03.11"]
 ];
 $("panel").innerHTML=`<div class="grid">${rows.map(r=>`<div class="tile ${state.fixed.has(r[0])?"selected":""}" onclick="config('${r[0]}')"><h3>${r[1]}</h3><p>${r[2]}</p><span class="status">${state.fixed.has(r[0])?"✓ CORRIGIDO":"⚠ VULNERÁVEL"}</span></div>`).join("")}</div>`;
}
function config(type){
 const map={
 service:["CIS 04.08","Desativar o serviço que não possui necessidade operacional."],
 account:["CIS 04.07","Desativar a conta padrão usada na instalação."],
 firewall:["CIS 04.04","Restringir conexões de entrada desnecessárias no servidor."],
 crypto:["CIS 03.11","Criptografar dados sensíveis armazenados."]
 };
 if(state.fixed.has(type)){toast("Essa configuração já foi corrigida.","good");return}
 const m=map[type];
 $("panel").innerHTML=`<div class="detail"><h3>${m[0]}</h3><p>${m[1]}</p><div class="log">ESTADO ATUAL → <span class="bad">INSEGURO</span><br>RISCO → exposição desnecessária</div><div class="actions"><button class="action good" onclick="applyConfig('${type}')">APLICAR CORREÇÃO</button><button class="action bad" onclick="delayConfig('${type}')">ADIAR</button></div></div>`;
}
function applyConfig(type){
 const map={service:"CIS 04.08",account:"CIS 04.07",firewall:"CIS 04.04",crypto:"CIS 03.11"};
 if(state.fixed.has(type))return;
 state.fixed.add(type);state.actions++;use(map[type]);risk(-10);rep(7);addFeed("CONFIGURAÇÃO CORRIGIDA: "+map[type],"green");toast(map[type]+" aplicado.","good");renderPanel("assets");
 if(["service","account","firewall","crypto"].every(x=>state.fixed.has(x)))completePhase();
}
function delayConfig(type){
 const key="delay_"+type;
 if(once(key)){risk(7);rep(-3);addFeed("CORREÇÃO ADIADA: "+type,"red");toast("O ataque ganhou tempo.","bad")}
}

/* PHASE 4 */
function phase4(type){
 if(type!=="events"){
  $("panel").innerHTML=`<div class="detail"><h3>🚨 EXFILTRAÇÃO</h3><p>Os sensores continuam disponíveis para consulta, mas a resposta principal está no painel de eventos.</p><div class="log"><span class="bad">09:18:02</span> upload externo iniciado<br><span class="bad">09:18:04</span> clientes_2026.xlsx<br><span class="bad">09:18:07</span> folha_pagamento.xlsx<br><span class="warn">09:18:09</span> conexão ainda ativa</div></div>`;
  return;
 }
 $("panel").innerHTML=`<div class="detail"><h3>🚨 EXFILTRAÇÃO EM ANDAMENTO</h3><p>A barra do ataque continua avançando. Escolha ações diferentes para objetivos diferentes.</p><div class="log"><span class="bad">09:18:02</span> upload → storage externo<br><span class="bad">09:18:04</span> clientes_2026.xlsx → 4,2 MB<br><span class="bad">09:18:07</span> folha_pagamento.xlsx → 2,7 MB<br><span class="warn">09:18:09</span> conexão ainda ativa</div><div class="actions">
 <button class="action" onclick="respond('dlp')">🛡️ ATIVAR DLP</button>
 <button class="action" onclick="respond('firewall')">🔥 BLOQUEAR CONEXÃO</button>
 <button class="action" onclick="respond('logs')">📋 PRESERVAR LOGS</button>
 <button class="action" onclick="respond('wipe')">📱 APAGAMENTO REMOTO</button>
 </div></div>`;
}
function respond(type){
 if(type==="dlp"){
  if(state.exfilStopped)return;
  state.exfilStopped=true;state.actions++;use("CIS 03.13");risk(-32);rep(12);addFeed("DLP BLOQUEOU A EXFILTRAÇÃO","green");toast("🛡️ DLP bloqueou a transferência. CIS 03.13.","good");
  completePhase();
 }else if(type==="firewall"){
  if(once("response_firewall")){state.actions++;use("CIS 04.04");risk(-18);rep(7);addFeed("CONEXÃO EXTERNA BLOQUEADA","green");toast("🔥 Canal externo bloqueado.","good");}
  else toast("A regra já foi aplicada. Outra ação é necessária para encerrar o incidente.","good");
 }else if(type==="logs"){
  if(once("response_logs")){state.actions++;use("CIS 03.14");risk(-4);rep(6);addFeed("LOGS PRESERVADOS","green");toast("📋 Evidências preservadas. CIS 03.14.","good");}
  else toast("Os logs já foram preservados.","good");
 }else{
  if(once("response_wipe")){risk(4);rep(-4);toast("❌ Nenhum dispositivo perdido está relacionado ao incidente.","bad")}
 }
 if(!state.finished)renderPanel("events");
}

/* COMMON */
function canAdvance(){
 if(state.phase===0){
   return state.fixed.has("service") && state.fixed.has("account") && state.investigated.size>=3;
 }
 if(state.phase===1) return state.classified.size===4;
 if(state.phase===2) return ["service","account","firewall","crypto"].every(x=>state.fixed.has(x));
 if(state.phase===3) return state.exfilStopped;
 return false;
}
function completePhase(){
 if(state.phaseComplete || !canAdvance()) return;
 state.phaseComplete=true;
 const box=document.querySelector(".miniobjective");
 box.classList.add("complete");
 $("objective").textContent="OBJETIVO CONCLUÍDO. O SOC está pronto para avançar.";
 const cb=$("continueBtn");
 cb.classList.remove("hidden");
 addFeed("✓ OBJETIVO DA FASE CONCLUÍDO","green");
 toast("✓ Fase concluída. Use CONTINUAR para avançar.","good");
}
function nextPhase(){
 if(state.finished)return;
 if(!canAdvance()){
   toast("Ainda falta concluir o objetivo desta fase.","bad");
   return;
 }
 if(state.phase>=3){finish();return}
 state.phase++;
 state.selectedFile=null;
 state.phaseComplete=false;
 render();
 toast("◆ Nova fase desbloqueada.","good");
}
function render(){
 const p=phases[state.phase];
 state.phaseComplete=false;
 $("phaseLabel").textContent=p.label;
 $("title").textContent=p.title;
 $("story").textContent=p.story;
 $("objective").textContent=p.objective;
 const cb=$("continueBtn");
 cb.classList.add("hidden");
 cb.onclick=()=>nextPhase();
 const box=document.querySelector(".miniobjective");
 box.classList.remove("complete");
 bindNav();
 document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));
 document.querySelector('.nav[data-panel="events"]').classList.add("active");
 renderPanel("events");
 update();
}
function flash(){const b=document.querySelector(".incidentbar");b.classList.add("pulse");setTimeout(()=>b.classList.remove("pulse"),1400)}
function startClock(){
 clearInterval(window.timer);
 window.timer=setInterval(()=>{
  state.time--;
  const m=Math.max(0,Math.floor(state.time/60)),s=Math.max(0,state.time%60);
  $("clock").textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  if(state.time%20===0 && state.phase<3 && !state.phaseComplete){risk(3);addFeed("⚠ NOVO ALERTA: pressão do ataque aumentou","red");flash()}
  if(state.time<=0){clearInterval(window.timer);finish()}
 },1000);
}
function finish(){
 if(state.finished)return;
 state.finished=true;
 clearInterval(window.timer);show("end");
 $("finalRep").textContent=state.rep;$("evfound").textContent=state.found;$("actions").textContent=state.actions;$("controls").textContent=state.controls.size;
 $("controlchips").innerHTML=[...state.controls].map(x=>`<span>${x}</span>`).join("");
 if(state.exfilStopped&&state.risk<=35){$("finalTitle").textContent="INCIDENTE CONTIDO";$("finalText").textContent="Você conectou as pistas, corrigiu as principais brechas e bloqueou a exfiltração. O SOC preservou evidências para a investigação."}
 else if(state.exfilStopped){$("finalTitle").textContent="ATAQUE INTERROMPIDO";$("finalText").textContent="A exfiltração foi interrompida, mas algumas vulnerabilidades permaneceram abertas."}
 else{$("finalTitle").textContent="DADOS COMPROMETIDOS";$("finalText").textContent="O ataque avançou mais rápido que a resposta. A investigação encontrou pistas, mas o vazamento não foi contido."}
}

/* Nav buttons stay useful in every phase */
document.addEventListener("DOMContentLoaded",()=>{
 if(!$("enter"))return;
});
