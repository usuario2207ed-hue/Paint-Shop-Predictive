
let dados = JSON.parse(
localStorage.getItem("zec_dados")
) || [];

document
.getElementById("btnCarregar")
.addEventListener("click", carregarArquivo);

document
.getElementById("btnLimparUltimo")
.addEventListener("click", limparUltimo);

document
.getElementById("btnExportar")
.addEventListener("click", exportarExcel);

document
.getElementById("btnLimparTudo")
.addEventListener("click", limparTudo);

renderTabela();

function salvarStorage(){

localStorage.setItem(
"zec_dados",
JSON.stringify(dados)
);

}

function carregarArquivo(){

const input =
document.getElementById("fileInput");

const file = input.files[0];

if(!file){

alert("⚠️ Selecione um arquivo TXT.");

return;

}

const reader = new FileReader();

reader.onload = function(e){

const texto = e.target.result;

processarTexto(texto);

};

reader.readAsText(file,"UTF-8");

}


function processarTexto(texto){

const blocos =
texto.split("--------------------------------");

let novos = 0;

blocos.forEach(bloco=>{

if(bloco.includes("Equipamento")){

const dataHora =
pegar(bloco,"Data/Hora:");

const equipamento =
pegar(bloco,"Equipamento:");

const visual =
pegar(bloco,"Visual:");

const observacao =
pegar(bloco,"Observação:");

const temperatura =
numero(
pegar(bloco,"Temperatura:")
);

const vibracao =
numero(
pegar(bloco,"Vibração:")
);

const corrente =
numero(
pegar(bloco,"Corrente:")
);

const id =

equipamento + "_" +
dataHora + "_" +
temperatura + "_" +
vibracao + "_" +
corrente;

const existe =
dados.some(d=>d.id === id);

if(!existe){

const statusTemp =
statusTemperatura(temperatura);

const statusVib =
statusVibracao(vibracao);

const statusCorr =
statusCorrente(corrente);

const intervencao = (

statusTemp === "ALERTA" ||
statusVib === "ALERTA" ||
statusCorr === "ALERTA" ||
visual.includes("🔴 Alerta")

)

?

"PROGRAMAR MANUTENÇÃO"

:

"SEGUIR INSPEÇÃO";

dados.push({

id,
equipamento,
dataHora,
visual,
observacao,
temperatura,
vibracao,
corrente,
statusTemp,
statusVib,
statusCorr,
intervencao

});

novos++;

}

}

});

salvarStorage();

renderTabela();

alert(
novos +
" novos registros adicionados."
);

}

function pegar(texto,campo){

const linhas =
texto.split("\n");

let capturar = false;

let resultado = "";

for(let linha of linhas){

if(linha.includes(campo)){

resultado = linha
.replace(campo,"")
.trim();

capturar = true;

continue;

}

if(capturar){

if(
linha.trim() === "" ||
linha.includes("---")
){

break;

}

resultado += " " + linha.trim();

}

}

return resultado.trim();

}

function numero(valor){

if(!valor){

return 0;

}

const n =
parseFloat(

valor
.replace("°C","")
.replace("mm/s","")
.replace("A","")
.replace(",", ".")

);

return isNaN(n) ? 0 : n;

}


function statusTemperatura(v){

if(v === 0 || isNaN(v)){

return "SEM LEITURA";

}

if(v >= 0.1 && v <= 20){

return "VERIFICAR";

}

if(v >= 20.1 && v <= 45){

return "NORMAL";

}

if(v >= 45.1 && v <= 70){

return "ATENÇÃO";

}

if(v >= 70.1){

return "ALERTA";

}

return "SEM LEITURA";

}


function statusVibracao(v){

if(v === 0 || isNaN(v)){

return "SEM LEITURA";

}

if(v >= 0.1 && v <= 4.5){

return "NORMAL";

}

if(v >= 4.6 && v <= 10){

return "ATENÇÃO";

}

if(v >= 10.1){

return "ALERTA";

}

return "SEM LEITURA";

}

function statusCorrente(v){

if(v === 0 || isNaN(v)){

return "SEM LEITURA";

}

if(v >= 0.1 && v <= 1){

return "VERIFICAR";

}

if(v >= 1.1 && v <= 8){

return "NORMAL";

}

if(v >= 8.1 && v <= 15){

return "ATENÇÃO";

}

if(v >= 15.1){

return "ALERTA";

}

return "SEM LEITURA";

}


function classe(status){

if(status === "NORMAL"){

return "normal";

}

if(status === "VERIFICAR"){

return "verificar";

}

if(status === "ATENÇÃO"){

return "atencao";

}

if(status === "SEM LEITURA"){

return "semleitura";

}

return "alerta";

}


function renderTabela(){

const tbody =
document.querySelector("#tabela tbody");

tbody.innerHTML = "";

dados.forEach(d=>{

const tr =
document.createElement("tr");

tr.innerHTML = `

<td>${d.equipamento}</td>

<td>${d.dataHora}</td>

<td>${d.visual || "-"}</td>

<td>${d.observacao || "-"}</td>

<td>${d.temperatura} °C</td>

<td>${d.vibracao} mm/s</td>

<td>${d.corrente} A</td>


<td class="${classe(d.statusTemp)}">
${d.statusTemp}
</td>


<td class="${classe(d.statusVib)}">
${d.statusVib}
</td>


<td class="${classe(d.statusCorr)}">
${d.statusCorr}
</td>


<td class="${
d.intervencao ===
'PROGRAMAR MANUTENÇÃO'
?
'manutencao'
:
'inspecao'
}">
${d.intervencao}
</td>

`;

tbody.appendChild(tr);

});

}


function limparUltimo(){

if(dados.length === 0){

alert("Nenhum registro.");

return;

}

dados.pop();

salvarStorage();

renderTabela();

}


function limparTudo(){

const senha =
prompt("Digite a senha:");

if(senha !== "123456"){

alert("❌ Senha incorreta.");

return;

}

dados = [];

localStorage.removeItem("zec_dados");

renderTabela();

alert(
"✅ Todos os registros foram removidos."
);

}


function exportarExcel(){

const tabela =
document.getElementById("tabela");

const wb =
XLSX.utils.table_to_book(
tabela,
{
sheet:"Relatorio_ZEC"
}
);

XLSX.writeFile(
wb,
"Relatorio_ZEC.xlsx"
);

}


function atualizarRelogio(){

const agora = new Date();

const dia =
String(agora.getDate()).padStart(2,'0');

const mes =
String(agora.getMonth()+1).padStart(2,'0');

const ano =
agora.getFullYear();

const hora =
String(agora.getHours()).padStart(2,'0');

const minuto =
String(agora.getMinutes()).padStart(2,'0');

const segundo =
String(agora.getSeconds()).padStart(2,'0');

document.getElementById("relogio").innerHTML =

`${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;

}

setInterval(atualizarRelogio,1000);

atualizarRelogio();


if("serviceWorker" in navigator){

window.addEventListener(
"load",

()=>{

navigator.serviceWorker
.register("./sw.js")

.then(()=>{

console.log(
"Service Worker registrado"
);

})

.catch((erro)=>{

console.log(
"Erro Service Worker:",
erro
);

});

});

}