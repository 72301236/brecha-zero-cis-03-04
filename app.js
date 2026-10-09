/* Configure SUPABASE_URL e SUPABASE_ANON_KEY. Use apenas a chave pública Publishable/anon. */
const SUPABASE_URL = "https://vmlztykrijtofcvmdjgw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_dUgKclVSmspw5oy22sCD9w_jv-RQoQl";
const db = (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) ? window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY) : null;
const quiz = [
  {
    "q": "Qual é o objetivo principal do CIS Control 03?",
    "o": [
      "Proteger os dados durante todo o ciclo de vida",
      "Aumentar a velocidade da rede",
      "Substituir o antivírus",
      "Eliminar a necessidade de backups"
    ],
    "a": 0,
    "e": "O Control 03 abrange gestão, acesso, classificação, criptografia, retenção, descarte, prevenção de vazamento e registros."
  },
  {
    "q": "Uma planilha de clientes deve ficar acessível a todos os funcionários?",
    "o": [
      "Sim, para facilitar o trabalho",
      "Não. O acesso deve seguir a necessidade de uso",
      "Sim, desde que o nome do arquivo seja genérico",
      "Somente se estiver em PDF"
    ],
    "a": 1,
    "e": "A salvaguarda 03.03 trata de restringir o acesso aos dados a quem precisa deles."
  },
  {
    "q": "O que a classificação de dados ajuda a decidir?",
    "o": [
      "A cor dos ícones",
      "Quem pode acessar e quais proteções aplicar",
      "Qual computador é mais rápido",
      "O tamanho dos anexos"
    ],
    "a": 1,
    "e": "A classificação (03.07) ajuda a definir acesso, criptografia, compartilhamento, retenção e outras proteções."
  },
  {
    "q": "Qual solução pode detectar ou bloquear a saída indevida de dados sensíveis?",
    "o": [
      "DLP",
      "Bloqueio de tela",
      "DNS",
      "Desfragmentador"
    ],
    "a": 0,
    "e": "DLP é prevenção contra perda de dados. O CIS 03.13 trata da implementação dessa solução."
  },
  {
    "q": "Qual é a diferença entre criptografia em trânsito e em repouso?",
    "o": [
      "São a mesma coisa",
      "Em trânsito protege dados durante a transferência; em repouso protege dados armazenados",
      "Em trânsito protege apenas impressoras",
      "Em repouso impede qualquer ataque à rede"
    ],
    "a": 1,
    "e": "CIS 03.10 protege dados em trânsito; CIS 03.11 protege dados sensíveis armazenados."
  },
  {
    "q": "Por que registrar acessos a dados sensíveis?",
    "o": [
      "Para preencher espaço no servidor",
      "Para investigar quem acessou o quê e quando",
      "Para substituir as permissões",
      "Para permitir acesso anônimo"
    ],
    "a": 1,
    "e": "Logs de acesso ajudam a detectar e investigar eventos. Relaciona-se à salvaguarda 03.14."
  },
  {
    "q": "O que a salvaguarda 03.05 busca garantir?",
    "o": [
      "Descarte seguro de dados",
      "Bloqueio automático de sessão",
      "Configuração de DNS",
      "Firewall em servidores"
    ],
    "a": 0,
    "e": "Dados e mídias precisam ser descartados de modo que informações antigas não possam ser recuperadas indevidamente."
  },
  {
    "q": "Um pendrive contém dados confidenciais. Qual medida é mais diretamente relacionada?",
    "o": [
      "Criptografar a mídia removível",
      "Desativar o firewall do notebook",
      "Deixar a senha no pendrive",
      "Compartilhar o arquivo por link público"
    ],
    "a": 0,
    "e": "A salvaguarda 03.09 trata de criptografar dados em mídias removíveis."
  },
  {
    "q": "Qual é o objetivo principal do CIS Control 04?",
    "o": [
      "Configurar ativos e softwares de forma segura",
      "Guardar todos os dados para sempre",
      "Permitir todos os serviços por padrão",
      "Substituir a resposta a incidentes"
    ],
    "a": 0,
    "e": "O Control 04 busca reduzir riscos por meio de configurações seguras e consistentes."
  },
  {
    "q": "Por que desativar serviços desnecessários em um servidor?",
    "o": [
      "Para mudar a aparência do sistema",
      "Para reduzir pontos de entrada e a superfície de ataque",
      "Para dispensar atualizações",
      "Para impedir a criação de logs"
    ],
    "a": 1,
    "e": "A salvaguarda 04.08 recomenda remover ou desabilitar serviços desnecessários."
  },
  {
    "q": "O que um firewall faz principalmente?",
    "o": [
      "Classifica documentos",
      "Controla conexões de rede conforme regras",
      "Substitui a criptografia",
      "Apaga automaticamente os dados roubados"
    ],
    "a": 1,
    "e": "Firewalls controlam tráfego permitido e bloqueado. Não substituem DLP, criptografia ou logs."
  },
  {
    "q": "Uma conta administrativa padrão continua habilitada. O que fazer?",
    "o": [
      "Deixar ativa enquanto ninguém reclamar",
      "Desabilitar, alterar ou proteger a conta e revisar privilégios",
      "Compartilhar a senha com toda a equipe",
      "Criar mais contas padrão"
    ],
    "a": 1,
    "e": "A salvaguarda 04.07 trata da gestão de contas padrão em ativos e softwares."
  },
  {
    "q": "O que acontece com o bloqueio automático de sessão da salvaguarda 04.03?",
    "o": [
      "Bloqueia a sessão após inatividade",
      "Apaga o disco quando o usuário sai",
      "Bloqueia o DNS",
      "Impede toda conexão externa"
    ],
    "a": 0,
    "e": "O bloqueio de sessão reduz o risco de alguém usar um computador deixado desbloqueado."
  },
  {
    "q": "Qual frase descreve corretamente a salvaguarda 04.10?",
    "o": [
      "Bloqueia automaticamente dispositivos portáteis após inatividade",
      "Bloqueia a conta após várias senhas erradas",
      "Criptografa e-mails enviados",
      "Remove serviços de rede"
    ],
    "a": 0,
    "e": "A 04.10 é sobre bloqueio automático do dispositivo portátil, não bloqueio de conta por tentativas."
  },
  {
    "q": "Para que serve a capacidade de apagamento remoto em dispositivos portáteis?",
    "o": [
      "Para acelerar o Wi-Fi",
      "Para apagar dados corporativos de um dispositivo perdido ou comprometido",
      "Para classificar arquivos",
      "Para substituir o inventário de ativos"
    ],
    "a": 1,
    "e": "A salvaguarda 04.11 ajuda a reduzir a exposição quando um dispositivo portátil é perdido ou comprometido."
  },
  {
    "q": "Qual medida é mais adequada para proteger uma planilha sensível armazenada em disco?",
    "o": [
      "Criptografia em repouso",
      "Firewall de rede sozinho",
      "DNS confiável sozinho",
      "Bloqueio de tela sozinho"
    ],
    "a": 0,
    "e": "A criptografia em repouso (03.11) protege o conteúdo armazenado; outras medidas continuam necessárias."
  },
  {
    "q": "Um servidor tem uma porta exposta que não é necessária para o negócio. O que deve ser avaliado?",
    "o": [
      "Manter aberta por conveniência",
      "Revisar a configuração e restringir o serviço/tráfego desnecessário",
      "Desabilitar todos os logs",
      "Publicar a senha do administrador"
    ],
    "a": 1,
    "e": "Configuração segura e firewall ajudam a reduzir exposição; o serviço desnecessário pode ser desabilitado conforme CIS 04.08."
  },
  {
    "q": "Qual ferramenta é mais associada à centralização e correlação de logs?",
    "o": [
      "SIEM",
      "DLP",
      "MDM",
      "Criptografia de disco"
    ],
    "a": 0,
    "e": "Um SIEM centraliza e correlaciona eventos para ajudar a detectar e investigar incidentes. Não corrige sozinho a causa."
  },
  {
    "q": "Uma transferência suspeita de dados já aconteceu. Qual é uma resposta inicial adequada?",
    "o": [
      "Apagar os registros",
      "Conter a transferência, preservar logs e investigar o alcance",
      "Ignorar se o sistema ainda funciona",
      "Desligar os controles de segurança"
    ],
    "a": 1,
    "e": "A resposta deve conter o incidente, preservar evidências, determinar quais dados foram afetados e corrigir a causa."
  },
  {
    "q": "Qual frase resume a relação entre CIS 03 e CIS 04?",
    "o": [
      "São controles idênticos",
      "O 03 protege os dados; o 04 fortalece a configuração do ambiente",
      "Só o 04 importa na nuvem",
      "O 03 trata apenas de antivírus"
    ],
    "a": 1,
    "e": "Os controles se complementam: proteger a informação e reduzir as brechas nos sistemas que a armazenam, processam e transmitem."
  }
];
let playerName="", qIndex=0, score=0, selectedAnswer=null, submitted=false, localResults=[];
const $=id=>document.getElementById(id);
const isParticipant=new URLSearchParams(location.search).get("modo")==="quiz";
if(isParticipant){
 document.querySelectorAll(".section, .navbar, .background-grid, .scanline, footer").forEach(el=>el.classList.add("hidden"));
 $("participantView").classList.remove("hidden");
}

function setNotice(msg, good=false){const el=$("backendNotice");if(el){el.textContent=msg;el.style.borderColor=good?"#2b7b5b":"#715f30";el.style.background=good?"#102b27":"#2b2411";el.style.color=good?"#9bffc1":"#f6d68c";}}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function makeQR(){const url=$("quizUrl").value.trim();const wrap=$("qrcode");wrap.innerHTML="";if(!url){wrap.innerHTML="<span>Informe a URL pública para gerar o QR Code.</span>";return;}try{new URL(url);if(!window.QRCode){wrap.innerHTML="<span>Biblioteca de QR Code indisponível. Verifique a internet.</span>";return;}new QRCode(wrap,{text:url, width:180,height:180,colorDark:"#07111f",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});}catch(e){wrap.innerHTML="<span>URL inválida. Use o endereço completo, começando com https://</span>";}}
$("makeQR").addEventListener("click",makeQR);
$("refreshBoard").addEventListener("click",loadBoard);
$("exportResults").addEventListener("click",exportCSV);

const defaultUrl=location.href.split("?")[0]+"?modo=quiz";$("quizUrl").value=location.protocol==="file:"?"":defaultUrl;
if(isParticipant && db===null){ /* modo demonstração local continua disponível */ }
if(db){setNotice("Banco conectado. O ranking será atualizado com as respostas enviadas.",true);loadBoard();}else setNotice("Backend não configurado. Siga README.txt para ativar o ranking ao vivo entre celulares.");

async function loadBoard(){
 if(!db){$("leaderboard").innerHTML='<p class="empty">Configure o Supabase no arquivo app.js para consolidar as respostas de todos os celulares.</p>';return;}
 const {data,error}=await db.from("quiz_results").select("*").order("score",{ascending:false}).order("duration_ms",{ascending:true}).limit(100);
 if(error){setNotice("Falha ao ler o banco: "+error.message);return;}
 const byPlayer=new Map();for(const r of data||[]){const k=r.player_name.toLowerCase();if(!byPlayer.has(k))byPlayer.set(k,r);}
 const rows=[...byPlayer.values()].sort((a,b)=>b.score-a.score||a.duration_ms-b.duration_ms);
 $("participantCount").textContent=rows.length+" participantes";$("totalAnswers").textContent=(data||[]).length;
 const max=quiz.length*100;$("avgScore").textContent=(data&&data.length?Math.round(data.reduce((s,r)=>s+r.score,0)/(data.length*max)*100):0)+"%";$("topScore").textContent=rows[0]?.score??0;
 const winner=$("winnerHighlight");if(winner)winner.innerHTML=rows.length?`🏆 <strong>${escapeHtml(rows[0].player_name)}</strong> lidera como vencedor com ${rows[0].correct_count}/${quiz.length} acertos em ${(rows[0].duration_ms/1000).toFixed(1)} s.`:"O vencedor será definido pelo maior número de acertos; o tempo desempata.";
 $("leaderboard").innerHTML=rows.length?rows.map((r,i)=>`<div class="rankrow ${i===0?'rank-winner':''}"><span class="ranknum">${i===0?"🏆":i===1?"🥈":i===2?"🥉":String(i+1).padStart(2,"0")}</span><div><div class="rankname">${escapeHtml(r.player_name)}</div><div class="rankmeta">${r.correct_count}/${quiz.length} acertos · ${(r.duration_ms/1000).toFixed(1)} s</div></div><b class="rankpts">${r.score} pts</b></div>`).join(""):'<p class="empty">Ainda não há participantes.</p>';
 const counts=quiz.map((q,i)=>({q,i,correct:(data||[]).filter(r=>r.answers&&r.answers[i]===q.a).length}));
 $("questionReport").innerHTML=counts.map(x=>`<div class="qrow"><b>${x.i+1}. ${escapeHtml(x.q.q)}</b><br>${x.correct} resposta(s) correta(s) de ${(data||[]).length}</div>`).join("");
}
function exportCSV(){if(!db){alert("Configure o Supabase para exportar o relatório da turma.");return;}db.from("quiz_results").select("*").order("score",{ascending:false}).then(({data,error})=>{if(error){alert(error.message);return;}const cols=["player_name","score","correct_count","duration_ms","answers","created_at"];const lines=[cols.join(","),...(data||[]).map(r=>cols.map(k=>JSON.stringify(typeof r[k]==="object"?JSON.stringify(r[k]):r[k]??"")).join(","))];const blob=new Blob(["\ufeff"+lines.join("\r\n")],{type:"text/csv;charset=utf-8;"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="relatorio_quiz_cis.csv";a.click();URL.revokeObjectURL(a.href);});}

$("joinForm").addEventListener("submit",e=>{e.preventDefault();playerName=$("playerName").value.trim();if(!playerName)return;$("joinForm").classList.add("hidden");$("participantQuiz").classList.remove("hidden");qIndex=0;score=0;selectedAnswer=null;submitted=false;renderQuestion();if(!db)$("participantStatus").textContent="Modo demonstração: suas respostas ficam só neste navegador. Configure o banco para aparecer no ranking geral.";});
function renderQuestion(){const q=quiz[qIndex];$("pQuestionCount").textContent=`PERGUNTA ${qIndex+1} DE ${quiz.length}`;$("pQuestion").textContent=q.q;$("pFeedback").classList.add("hidden");$("pNext").classList.add("hidden");$("pOptions").innerHTML="";selectedAnswer=null;submitted=false;q.o.forEach((opt,i)=>{const b=document.createElement("button");b.className="choice";b.innerHTML=`<span class="letter">${String.fromCharCode(65+i)}</span><span>${escapeHtml(opt)}</span>`;b.addEventListener("click",()=>answerQuestion(i,b));$("pOptions").appendChild(b);});$("pNext").textContent=qIndex===quiz.length-1?"Enviar resultado →":"Próxima pergunta →";}
function answerQuestion(i,btn){if(submitted)return;submitted=true;selectedAnswer=i;const q=quiz[qIndex];[...$("pOptions").children].forEach((b,j)=>{b.disabled=true;if(j===q.a)b.classList.add("correct");if(j===i&&i!==q.a)b.classList.add("wrong");});if(i===q.a)score+=100;$("pFeedback").textContent=(i===q.a?"Correto! +100 pontos. ":"Não foi dessa vez. ")+q.e;$("pFeedback").classList.remove("hidden");$("pNext").classList.remove("hidden");}
const answers=[];
$("pNext").addEventListener("click",async()=>{answers[qIndex]=selectedAnswer;if(qIndex<quiz.length-1){qIndex++;renderQuestion();return;}await submitResults();});
async function submitResults(){const correctCount=answers.filter((a,i)=>a===quiz[i].a).length;const duration=Math.max(1,Date.now()-(window.quizStarted||Date.now()));const result={player_name:playerName,score,correct_count:correctCount,duration_ms:duration,answers,created_at:new Date().toISOString()};localResults.push(result);
 $("participantQuiz").classList.add("hidden");$("participantDone").classList.remove("hidden");$("doneText").textContent=`Você fez ${score} pontos e acertou ${correctCount} de ${quiz.length} perguntas.`;
 if(db){const {error}=await db.from("quiz_results").insert({player_name:playerName,score,correct_count:correctCount,duration_ms:duration,answers});if(error){$("participantStatus").textContent="Não foi possível enviar ao ranking: "+error.message;}else $("participantStatus").textContent="Resultado enviado ao ranking!";}else{localStorage.setItem("brecha_zero_demo_result",JSON.stringify(result));$("participantStatus").textContent="Resultado salvo somente neste navegador. Para compartilhar com o apresentador, configure o Supabase.";}}
$("joinForm").addEventListener("submit",()=>{window.quizStarted=Date.now();});

