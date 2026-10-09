const state={
 phase:0,risk:72,rep:100,time:120,found:0,actions:0,
 controls:new Set(),investigated:new Set(),classified:new Set(),fixed:new Set(),
 exfilStopped:false,usedActions:new Set(),selectedFile:null,phaseComplete:false,finished:false
};

const phases=[
 {label:"FASE 1 // RECONHECIMENTO",title:"Encontre o caminho do invasor",story:"Cruze os alertas para descobrir por onde o invasor entrou.",objective:"Ache a entrada e contenha a ameaça."},
 {label:"FASE 2 // DADOS",title:"Descubra o que está em risco",story:"O invasor acessou o servidor financeiro. Descubra quais arquivos são sensíveis.",objective:"Classifique os dados e identifique os arquivos críticos."},
 {label:"FASE 3 // CONTENÇÃO",title:"Feche as brechas",story:"A entrada foi identificada. Corrija as falhas sem desligar o servidor inteiro.",objective:"Desative o serviço, proteja a conta e ajuste o firewall."},
 {label:"FASE 4 // EXFILTRAÇÃO",title:"Os dados estão saindo",story:"Há dados saindo da rede. Interrompa a transferência e preserve as provas.",objective:"Conter o vazamento e registrar evidências."}
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
  ["[SOC] estação pronta.","cyan"],
  ["[SIEM] alertas carregados.","ok"],
  ["[ALERTA] tráfego anômalo detectado.","bad"],
  ["[ALERTA] possível intrusão no servidor financeiro.","warn"],
  ["[SOC] investigação iniciada.","ok"]
 ];
 let i=0;
 function next(){
  if(i>=lines.length){bar.style.width="100%";status.textContent="Conexão estabelecida. Entrando no SOC...";setTimeout(()=>{overlay.classList.add("hidden");show("game");render();startClock();flash();},500);return}
  const [txt,kind]=lines[i],d=document.createElement("div");d.className="bootline "+kind;d.textContent=txt;log.appendChild(d);log.scrollTop=log.scrollHeight;
  bar.style.width=((i+1)/lines.length*100)+"%";status.textContent=txt.replace(/^\[[^\]]+\]\s*/,"");i++;setTimeout(next,120);
 }
 next();
}
$("enter").addEventListener("click",()=>{show("attackflow");renderAttackFlow();});

const attackStages=[
 {node:0,title:"Reconhecimento detectado",text:"Um IP externo sondou a porta 8080. O servidor mantém ativo um serviço administrativo legado que não é usado há 31 dias.",objective:"Investigue a superfície exposta e reduza serviços desnecessários.",control:"CIS 04.08",choice:"Desativar o serviço legado",log:["[08:41:02] SCAN externo detectado na porta 8080","[08:41:04] serviço legacy-admin responde a requisições","[EVIDÊNCIA] serviço sem uso há 31 dias"]},
 {node:1,title:"A rede permitiu a passagem",text:"A regra de firewall aceita conexões que não são necessárias para a operação. Bloquear apenas o IP pode ajudar, mas a regra permissiva continua sendo um risco.",objective:"Restringir o tráfego de entrada ao necessário.",control:"CIS 04.04",choice:"Restringir a regra do firewall",log:["[08:42:11] conexão externa aceita pela regra FW-ANY-TO-SRV","[ALERTA] origem não consta na lista autorizada","[EVIDÊNCIA] regra ampla permite tráfego desnecessário"]},
 {node:2,title:"A conta administrativa foi comprometida",text:"O login admin veio de um endereço externo e fora do padrão. A conta padrão permaneceu ativa desde a instalação do servidor.",objective:"Eliminar o uso de contas padrão e reduzir o acesso indevido.",control:"CIS 04.07",choice:"Desativar a conta padrão e revisar acessos",log:["[08:43:19] autenticação de admin aceita","[ALERTA] origem 185.77.91.4 fora do padrão","[EVIDÊNCIA] conta padrão ativa e sem revisão recente"]},
 {node:3,title:"Dados sensíveis em risco",text:"A sessão acessou planilhas com dados pessoais e financeiros. Sem classificação, controle de acesso e proteção contra exfiltração, o impacto pode aumentar rapidamente.",objective:"Proteger os dados e interromper a saída não autorizada.",control:"CIS 03.03 / 03.11 / 03.13",choice:"Bloquear a exfiltração e preservar evidências",log:["[08:44:03] leitura de clientes_2026.xlsx","[08:44:07] folha_pagamento.xlsx preparada para envio","[ALERTA] transferência para armazenamento externo"]}
];
let attackStage=-1;
function appendTerminal(lines){const box=$("terminalLines");lines.forEach(line=>{const p=document.createElement("p");p.textContent=line; if(line.includes("ALERTA")||line.includes("EVIDÊNCIA"))p.className="termwarn";else if(line.includes("CONTIDO")||line.includes("CORREÇÃO"))p.className="termgood";box.appendChild(p)});box.scrollTop=box.scrollHeight;}
function renderAttackFlow(){attackStage=-1;document.querySelectorAll(".pathnode").forEach((n,i)=>n.classList.toggle("active",i===0));$("terminalLines").innerHTML="<p><b>SYSTEM</b> Pronto para iniciar a simulação.</p><p><strong>INFO</strong> O ambiente contém configurações inseguras.</p>";$("stageTitle").textContent="Ataque ainda não iniciado";$("stageText").textContent="Clique em “Executar ataque” para acompanhar cada avanço e descobrir qual controle deveria interrompê-lo.";$("stageObjective").textContent="Relacionar a vulnerabilidade ao CIS 03 ou CIS 04.";$("stageChoices").innerHTML="";$("runAttack").textContent="▶ EXECUTAR ATAQUE";}
function advanceAttack(){
 if(attackStage<attackStages.length-1){attackStage++;const st=attackStages[attackStage];document.querySelectorAll(".pathnode").forEach((n,i)=>{n.classList.toggle("active",i===attackStage);n.classList.toggle("passed",i<attackStage)});appendTerminal(st.log);$("stageTitle").textContent=st.title;$("stageText").textContent=st.text;$("stageObjective").textContent=st.objective;$("stageChoices").innerHTML=`<div class="controlhint"><b>SALVAGUARDA RELACIONADA</b><span>${st.control}</span></div><button class="flowfix" onclick="applyFlowFix(${attackStage})">${st.choice}</button>`;$("runAttack").textContent=attackStage===attackStages.length-1?"▶ REINICIAR SIMULAÇÃO":"▶ AVANÇAR ATAQUE";return;}
 renderAttackFlow();
}
function applyFlowFix(index){const st=attackStages[index];appendTerminal(["[SOC] Correção selecionada: "+st.choice,"[CONTROLE] "+st.control+" relacionado à etapa."]);$("stageText").textContent="Boa decisão. Na investigação completa, valide o impacto da correção, procure sinais de persistência e preserve os registros. A etapa demonstra o controle, mas não substitui a análise do incidente.";$("stageChoices").innerHTML=`<div class="fixresult"><b>✓ AÇÃO REGISTRADA</b><span>${st.control}</span><p>O risco desta etapa foi reduzido. Continue para acompanhar o próximo ponto da cadeia.</p></div>${index===3?`<button class="flowfix" style="margin-top:10px" onclick="boot()">ABRIR INVESTIGAÇÃO COMPLETA NO SOC →</button>`:""}`;}
$("runAttack").addEventListener("click",advanceAttack);

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
  $("panel").innerHTML=`<div class="detail"><h3>🔎 FASE DE DADOS</h3><p>Use o painel <b>DADOS</b> para investigar os arquivos. Classifique pelo menos três arquivos; os outros sensores mostram o contexto do incidente.</p><div class="log">ACESSO DETECTADO → /clientes/2026<br>ARQUIVOS POTENCIALMENTE SENSÍVEIS → 4<br>EXFILTRAÇÃO → ainda não iniciada</div></div>`;
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
 if(state.classified.size>=3)completePhase();
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
 if(["service","account","firewall"].every(x=>state.fixed.has(x)))completePhase();
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
   return state.fixed.has("service") && state.fixed.has("account") && state.investigated.size>=2;
 }
 if(state.phase===1) return state.classified.size>=3;
 if(state.phase===2) return ["service","account","firewall"].every(x=>state.fixed.has(x));
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
 if(state.exfilStopped&&state.risk<=35&&state.usedActions.has("response_logs")){$("finalTitle").textContent="INCIDENTE CONTIDO";$("finalText").textContent="Você conectou as pistas, corrigiu as principais brechas, bloqueou a exfiltração e preservou os logs para investigar o alcance do incidente."}
 else if(state.exfilStopped&&state.usedActions.has("response_logs")){$("finalTitle").textContent="ATAQUE INTERROMPIDO";$("finalText").textContent="A transferência foi interrompida e as evidências foram preservadas, mas algumas vulnerabilidades permaneceram abertas."}
 else if(state.exfilStopped){$("finalTitle").textContent="VAZAMENTO INTERROMPIDO, INVESTIGAÇÃO INCOMPLETA";$("finalText").textContent="Você bloqueou a transferência, mas não preservou os logs. Sem evidências, descobrir o que foi acessado e por quanto tempo fica mais difícil."}
 else{$("finalTitle").textContent="DADOS COMPROMETIDOS";$("finalText").textContent="O ataque avançou mais rápido que a resposta. A investigação encontrou pistas, mas o vazamento não foi contido."}
}

/* Nav buttons stay useful in every phase */
document.addEventListener("DOMContentLoaded",()=>{
 if(!$("enter"))return;
});

/* ================= DIDÁTICA v6 ================= */
const knowledge=[
 ['03.01','Processo de gestão de dados','Definir regras para coletar, usar, armazenar, compartilhar e proteger dados.','Governança de dados'],
 ['03.02','Inventário de dados','Saber quais dados existem, onde estão e quem é responsável por eles.','Visibilidade'],
 ['03.03','Listas de controle de acesso','Definir quem pode acessar cada dado e em quais condições.','Permissões'],
 ['03.04','Retenção de dados','Manter dados somente pelo tempo necessário e definido pela organização.','Ciclo de vida'],
 ['03.05','Descarte seguro','Eliminar dados de forma que não possam ser recuperados indevidamente.','Descarte'],
 ['03.06','Criptografia em dispositivos finais','Proteger dados armazenados em notebooks, desktops e outros endpoints.','Dados em dispositivo'],
 ['03.07','Classificação de dados','Rotular dados por sensibilidade para aplicar proteção proporcional ao risco.','Público / interno / confidencial'],
 ['03.08','Fluxos de dados','Documentar por onde os dados passam, de onde vêm e para onde vão.','Movimentação'],
 ['03.09','Mídias removíveis','Criptografar dados armazenados em pendrives e outras mídias removíveis.','USB / mídia'],
 ['03.10','Dados em trânsito','Criptografar dados enquanto trafegam por redes.','Comunicação'],
 ['03.11','Dados em repouso','Criptografar dados enquanto estão armazenados.','Servidor / armazenamento'],
 ['03.12','Segmentação por sensibilidade','Separar processamento e armazenamento conforme o nível de sensibilidade.','Segmentação'],
 ['03.13','Prevenção contra perda de dados','Detectar e impedir transferências indevidas de dados sensíveis.','DLP'],
 ['03.14','Registro de acesso a dados sensíveis','Registrar quem acessou dados sensíveis, quando e o que aconteceu.','Auditoria'],
 ['04.01','Processo de configuração segura','Criar e manter padrões seguros para ativos e softwares.','Baseline'],
 ['04.02','Configuração segura de rede','Aplicar padrões seguros também à infraestrutura de rede.','Rede'],
 ['04.03','Bloqueio automático de sessão','Bloquear sessões após período de inatividade.','Tela / sessão'],
 ['04.04','Firewall em servidores','Controlar conexões de rede permitidas e bloquear as desnecessárias.','Firewall'],
 ['04.05','Firewall em dispositivos finais','Controlar conexões nos computadores e endpoints dos usuários.','Endpoint'],
 ['04.06','Gestão segura de ativos e software','Administrar ativos e softwares de maneira controlada e segura.','Gestão'],
 ['04.07','Contas padrão','Gerenciar, desativar ou remover contas padrão desnecessárias.','Identidade'],
 ['04.08','Serviços desnecessários','Desinstalar ou desativar serviços que não são necessários.','Superfície de ataque'],
 ['04.09','DNS confiável','Configurar dispositivos para usar servidores DNS confiáveis.','Resolução de nomes'],
 ['04.10','Bloqueio automático de dispositivo portátil','Bloquear automaticamente dispositivos portáteis após período definido.','Notebook / celular'],
 ['04.11','Apagamento remoto','Permitir apagar dados de dispositivos portáteis remotamente quando necessário.','Resposta a perda/roubo'],
 ['04.12','Workspace corporativo separado','Separar o ambiente corporativo do ambiente pessoal em dispositivos móveis.','BYOD / MDM']
];

function setExplainer(title,text,tag='GUIA DO SOC'){
 const a=$('exTitle'),b=$('exText'),c=$('exTag');if(a)a.textContent=title;if(b)b.textContent=text;if(c)c.textContent=tag;
}
function explanation(title,foundText,why,action,cis,result){
 let old=document.getElementById('explainModal');if(old)old.remove();
 const m=document.createElement('div');m.id='explainModal';m.className='explainmodal';
 m.innerHTML=`<div class="exbox"><div class="exhead"><div class="tag">${cis||'CONCEITO SOC'}</div><h3>${title}</h3></div><div class="exbody"><div class="exrow"><b>🔎 O QUE VOCÊ ENCONTROU</b><p>${foundText}</p></div><div class="exrow"><b>🧠 POR QUE ISSO IMPORTA</b><p>${why}</p></div><div class="exrow"><b>🛡️ O QUE SUA AÇÃO FAZ</b><p>${action}</p></div><div class="exrow excis"><b>📘 CIS EM LINGUAGEM SIMPLES</b><p>${cis} ${result||''}</p></div><button class="exclose" onclick="closeExplanation()">ENTENDI, CONTINUAR →</button></div></div>`;
 document.body.appendChild(m);
}
function closeExplanation(){const m=$('explainModal');if(m)m.remove()}

const _renderPanelV6=renderPanel;
renderPanel=function(type){_renderPanelV6(type);updateExplainer(type)};
function updateExplainer(type){
 const contexts={
  events:['EVENTOS: primeiro descubra o que aconteceu.','Um evento isolado é só um sinal. Vários sinais relacionados formam uma hipótese de incidente.'],
  network:['REDE: observe origem, destino e direção.','Uma conexão externa inesperada pode indicar reconhecimento, comando ou saída de dados.'],
  assets:['ATIVOS: descubra qual máquina está envolvida.','Serviços e portas abertas aumentam a superfície de ataque. O objetivo é entender o ativo antes de mexer nele.'],
  users:['USUÁRIOS: investigue a identidade por trás da ação.','Uma conta administrativa previsível ou usada fora do padrão pode facilitar o acesso indevido.'],
  data:['DADOS: nem toda informação tem o mesmo risco.','Classificação e proteção dependem da sensibilidade do conteúdo, não do tamanho do arquivo.']
 };
 const c=contexts[type]||contexts.events;setExplainer(c[0],c[1],`FASE ${state.phase+1} • EXPLICAÇÃO`);
}

const _openEventV6=openEvent;
openEvent=function(id){
 const before=state.investigated.size;_openEventV6(id);
 if(state.investigated.size===before)return;
 const e=events.find(x=>x.id===id);
 const map={scan:['Uma máquina externa sondou a porta 8080 do servidor financeiro.','Varredura é uma forma comum de reconhecimento. O atacante está tentando descobrir serviços expostos.','Registrar e correlacionar o evento cria evidência para investigar o caminho do ataque.','CIS 04.02','configuração segura da infraestrutura de rede ajuda a reduzir exposições desnecessárias.'],login:['A conta administrativa aceitou um login vindo de um IP externo.','A identidade usada pelo invasor pode ser mais importante que o primeiro alerta de rede.','Investigar o usuário permite relacionar a ação ao mecanismo de autenticação.','CIS 04.07','contas padrão ou desnecessárias devem ser gerenciadas com segurança.'],data:['A pasta de clientes foi acessada por uma sessão administrativa.','Dados pessoais podem causar impacto elevado se forem expostos.','Identificar o acesso ajuda a determinar quais dados precisam de proteção e rastreabilidade.','CIS 03.14','acessos a dados sensíveis devem gerar registros para auditoria.'],traffic:['O servidor iniciou uma conexão para um endereço externo.','A direção do tráfego importa: dados saindo da rede podem indicar exfiltração.','Correlacionar a conexão com outros eventos ajuda a confirmar o incidente.','CIS 03.08','documentar fluxos de dados ajuda a reconhecer movimentações anormais.']}[id];
 explanation(e.title,map[0],map[1],map[2],map[3],map[4]);
};

const _investigateNetworkV6=investigateNetwork;
investigateNetwork=function(){const before=state.investigated.size;_investigateNetworkV6();if(state.investigated.size===before)return;explanation('Rede correlacionada','Os logs mostram uma sondagem externa na porta 8080 e conexões de saída do servidor financeiro.','A sequência reconhecimento → acesso → conexão externa é mais forte que qualquer evento isolado.','Você registrou a evidência para usar essa correlação na resposta.','CIS 03.08','documentar fluxos de dados ajuda a entender por onde a informação circula.');};

const _investigateDataV6=investigateData;
investigateData=function(){const before=state.investigated.size;_investigateDataV6();if(state.investigated.size===before)return;explanation('Dados identificados','A pasta contém dados pessoais, informações comerciais e material público.','O nível de proteção deve acompanhar a sensibilidade da informação.','Você marcou o conjunto como evidência para continuar a análise.','CIS 03.02','um inventário permite saber que dados existem e onde estão.');};

const _inspectAssetV6=inspectAsset;
inspectAsset=function(id){const before=state.investigated.size;_inspectAssetV6(id);if(id!=='fin'||state.investigated.size===before)return;explanation('Serviço legado encontrado','O SRV-FIN-02 mantém o serviço legacy-admin ativo, com porta 8080 exposta e sem uso há 31 dias.','Serviço desnecessário é uma porta adicional para ataque. Se não tem função, não deveria ficar esperando um invasor encontrar.','Você identificou a configuração que precisa ser corrigida na contenção.','CIS 04.08','desinstalar ou desativar serviços desnecessários reduz a superfície de ataque.');};

const _inspectUserV6=inspectUser;
inspectUser=function(){const before=state.investigated.size;_inspectUserV6();if(state.investigated.size===before)return;explanation('Conta administrativa suspeita','A conta admin é previsível, foi criada na instalação e aceitou um login externo fora do padrão.','Contas padrão conhecidas podem ser alvos fáceis. Identidade também faz parte da superfície de ataque.','Você investigou a conta antes de decidir se ela deve ser desativada.','CIS 04.07','contas padrão devem ser gerenciadas e desativadas quando não forem necessárias.');};

const _disableLegacyV6=disableLegacy;
disableLegacy=function(){if(state.fixed.has('service'))return;_disableLegacyV6();explanation('Serviço desnecessário desativado','O serviço legacy-admin não era usado há 31 dias e estava exposto pela porta 8080.','Cada serviço desnecessário aumenta a quantidade de código e portas que podem ser explorados.','A correção remove o serviço do caminho do ataque sem desligar o servidor financeiro inteiro.','CIS 04.08','se não é necessário, desative. Segurança adora coisas que não estão rodando sem motivo.');};

const _disableAdminV6=disableAdmin;
disableAdmin=function(){if(state.fixed.has('account'))return;_disableAdminV6();explanation('Conta padrão desativada','A conta admin tinha características de uma conta padrão e foi usada em um login suspeito.','Uma conta previsível com privilégios elevados pode facilitar persistência e abuso.','A desativação impede que essa identidade continue sendo usada como caminho de acesso.','CIS 04.07','gerenciar ou desativar contas padrão reduz oportunidades de abuso.');};

const _blockIPV6=blockIP;
blockIP=function(){const already=state.fixed.has('ip');_blockIPV6();if(already)return;explanation('Conexão externa bloqueada','O endereço externo observado estava relacionado ao tráfego suspeito.','O firewall pode cortar o canal de comunicação, mas isso não classifica nem criptografa dados.','Você interrompeu a conexão de rede identificada como suspeita.','CIS 04.04','firewall controla quais conexões são permitidas.');};

const _classifyV6=classify;
classify=function(bucket){const id=state.selectedFile;if(!id||state.classified.has(id))return;const f=files[id];const correct=bucket===f.correct;_classifyV6(bucket);if(!correct)return;const labels={pub:'PÚBLICO',int:'INTERNO',conf:'CONFIDENCIAL'};explanation('Classificação aplicada',`${f.name} contém: ${f.desc}. Foi classificado como ${labels[bucket]}.`,'Classificação permite aplicar controles proporcionais ao impacto de uma exposição. Um catálogo público não exige o mesmo tratamento que folha de pagamento.','Você associou o arquivo a um nível de sensibilidade para orientar a proteção.','CIS 03.07','classificar dados significa identificar sua sensibilidade e usar essa informação para protegê-los.');};

const _applyConfigV6=applyConfig;
applyConfig=function(type){const map={service:['CIS 04.08','Serviço desnecessário desativado.','Reduz a superfície de ataque sem desligar o servidor.'],account:['CIS 04.07','Conta padrão desativada.','Remove uma identidade previsível do caminho de acesso.'],firewall:['CIS 04.04','Firewall configurado.','Restringe conexões de entrada desnecessárias.'],crypto:['CIS 03.11','Criptografia em repouso ativada.','Protege os dados mesmo quando o armazenamento é acessado indevidamente.']};if(state.fixed.has(type))return;_applyConfigV6(type);const m=map[type];explanation(m[1],`A configuração ${type} estava marcada como insegura.`,'Configuração segura reduz caminhos previsíveis de exploração e limita o impacto de um comprometimento.','Você aplicou a correção específica sem derrubar todo o ambiente.',''+m[0],m[2]);};

const _respondV6=respond;
respond=function(type){const before=state.exfilStopped;_respondV6(type);if(type==='dlp'&&!before)explanation('DLP bloqueou a exfiltração','O sistema detectou uma tentativa de enviar arquivos sensíveis para armazenamento externo.','DLP atua sobre o movimento de dados, não apenas sobre a conexão de rede.','A transferência foi interrompida antes de completar o vazamento.','CIS 03.13','DLP detecta e pode impedir movimentações indevidas de dados sensíveis.');
 else if(type==='firewall'&&!state.usedActions.has('__dummy__'))explanation('Firewall bloqueou o canal','A conexão externa estava ativa durante a tentativa de exfiltração.','Bloquear a comunicação pode interromper o canal usado pelo atacante, mas não substitui controles de dados.','Você cortou a conexão de rede suspeita.','CIS 04.04','firewall controla conexões de rede permitidas.');
 else if(type==='logs'&&state.usedActions.has('response_logs'))explanation('Evidências preservadas','Os registros da atividade do incidente foram preservados.','Sem logs, a equipe pode até conter o ataque, mas perde contexto para descobrir o que aconteceu.','Você manteve os registros para investigação e auditoria.','CIS 03.14','registrar acessos a dados sensíveis ajuda a reconstruir o incidente.');};

const knowledgeGrid=$('knowledgeGrid');
function openKnowledge(){renderKnowledge('all');$('knowledge').classList.remove('hidden')}
function closeKnowledge(){$('knowledge').classList.add('hidden')}
function renderKnowledge(filter){if(!knowledgeGrid)return;knowledgeGrid.innerHTML=knowledge.filter(x=>filter==='all'||x[0].startsWith(filter)).map(x=>`<div class="kcard"><div class="kcode">CIS ${x[0]}</div><h4>${x[1]}</h4><p>${x[2]}</p><small>Foco: ${x[3]}</small></div>`).join('')}
function filterKnowledge(filter,btn){document.querySelectorAll('.kfilter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderKnowledge(filter)}

setExplainer('O QUE ESTÁ ACONTECENDO?','Leia os sinais antes de agir. Investigar significa encontrar relações entre eventos, ativos, usuários e dados.','GUIA DO SOC');
