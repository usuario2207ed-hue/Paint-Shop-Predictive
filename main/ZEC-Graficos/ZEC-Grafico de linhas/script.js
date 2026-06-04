
let dados =
JSON.parse(
localStorage.getItem("zec_dados")
) || [];

let grafico = null;


document
.getElementById("btnCarregar")
.addEventListener(
"click",
carregarArquivo
);

document
.getElementById("btnLimparUltimo")
.addEventListener(
"click",
limparUltimo
);

document
.getElementById("btnExportar")
.addEventListener(
"click",
exportarExcel
);

document
.getElementById("btnLimparTudo")
.addEventListener(
"click",
limparTudo
);

document
.getElementById("filtroEquipamento")
.addEventListener(
"input",
atualizarTudo
);


renderTabela();

atualizarResumo();

criarGrafico();

atualizarRelogio();

setInterval(
atualizarRelogio,
1000
);


function salvarStorage(){

localStorage.setItem(
"zec_dados",
JSON.stringify(dados)
);

}


function carregarArquivo(){

const input =
document.getElementById(
"fileInput"
);

const file =
input.files[0];

if(!file){

alert(
"⚠️ Selecione um arquivo TXT."
);

return;

}

const reader =
new FileReader();

reader.onload =
function(e){

processarTexto(
e.target.result
);

};

reader.readAsText(
file,
"UTF-8"
);

}

function processarTexto(texto){

const blocos =
texto.split(
"--------------------------------"
);

let novos = 0;

blocos.forEach(bloco=>{

if(
!bloco.includes(
"Equipamento:"
)
){
return;
}

const dataHora =
pegar(
bloco,
"Data/Hora:"
);

const equipamento =
pegar(
bloco,
"Equipamento:"
);

const visual =
pegar(
bloco,
"Visual:"
);

const observacao =
pegar(
bloco,
"Observação:"
);

const temperatura =
numero(
pegar(
bloco,
"Temperatura:"
)
);

const vibracao =
numero(
pegar(
bloco,
"Vibração:"
)
);

const corrente =
numero(
pegar(
bloco,
"Corrente:"
)
);

const id =

equipamento + "*" +
dataHora + "*" +
temperatura + "*" +
vibracao + "*" +
corrente;

const existe =
dados.some(
d=>d.id === id
);

if(existe){
return;
}

const intervencao =
obterIntervencao(
visual
);

dados.push({

id,
equipamento,
visual,
intervencao,

dataHora,
observacao,
temperatura,
vibracao,
corrente

});

novos++;

});

salvarStorage();

atualizarTudo();

alert(
novos +
" novos registros adicionados."
);

}


function obterIntervencao(
visual
){

const seguir = [

"Normal",
"Leve desgaste",
"Acúmulo de pó",
"Vibração leve",
"Aquecimento leve",
"Vazio"

];

return seguir.includes(
visual
)

?

"SEGUIR INSPEÇÃO"

:

"PROGRAMAR MANUTENÇÃO";

}


function pegar(
texto,
campo
){

const linhas =
texto.split("\n");

for(let linha of linhas){

if(
linha.includes(campo)
){

return linha
.replace(campo,"")
.trim();

}

}

return "";

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

return isNaN(n)
? 0
: n;

}

function dadosFiltrados(){

const filtro =

document
.getElementById(
"filtroEquipamento"
)
.value
.toLowerCase();

return dados.filter(d=>

d.equipamento
.toLowerCase()
.includes(filtro)

);

}


function renderTabela(){

const tbody =
document.querySelector(
"#tabelaResultado tbody"
);

tbody.innerHTML = "";

dadosFiltrados()
.forEach(d=>{

const tr =
document.createElement(
"tr"
);

tr.innerHTML = `

<td>
${d.equipamento}
</td>

<td>
${d.visual}
</td>

<td class="${
d.intervencao ===
"PROGRAMAR MANUTENÇÃO"
?
"manutencao"
:
"inspecao"
}">
${d.intervencao}
</td>

`;

tbody.appendChild(tr);

});

}

function atualizarResumo(){

const lista =
dadosFiltrados();

document
.getElementById(
"totalRegistros"
)
.innerHTML =
lista.length;

document
.getElementById(
"totalInspecao"
)
.innerHTML =

lista.filter(

d=>

d.intervencao ===
"SEGUIR INSPEÇÃO"

).length;

document
.getElementById(
"totalManutencao"
)
.innerHTML =

lista.filter(

d=>

d.intervencao ===
"PROGRAMAR MANUTENÇÃO"

).length;

}


function criarGrafico(){

const agrupado = {};

dadosFiltrados()
.forEach(d=>{

if(
!agrupado[
d.equipamento
]
){

agrupado[
d.equipamento
] = 0;

}

agrupado[
d.equipamento
]++;

});

const labels =
Object.keys(
agrupado
);

const valores =
Object.values(
agrupado
);

const cores =
labels.map(

(_,i)=>

`hsl(
${(i*47)%360},
75%,
55%
)`

);

const ctx =
document
.getElementById(
"graficoPizza"
);

if(grafico){

grafico.destroy();

}

grafico =
new Chart(

ctx,

{

type:"line",

data:{

labels,

datasets:[{

label:
"Quantidade de Registros",

data:
valores,

borderColor:
"#0066ff",

backgroundColor:
"rgba(0,102,255,0.15)",

borderWidth:3,

fill:true,

tension:0.35,

pointRadius:6,

pointHoverRadius:9,

pointBackgroundColor:
cores,

pointBorderColor:
"#ffffff",

pointBorderWidth:2

}]

},

options:{

responsive:true,

maintainAspectRatio:false,

plugins:{

legend:{

display:true

},

tooltip:{

enabled:true

}

},

scales:{

y:{

beginAtZero:true,

ticks:{

precision:0

}

},

x:{

ticks:{

maxRotation:90,

minRotation:45

}

}

},

onClick(
evento,
elementos
){

if(
!elementos.length
){
return;
}

const indice =
elementos[0]
.index;

const equipamento =
labels[indice];

mostrarDetalhes(
equipamento
);

}

}

}

);

}


function mostrarDetalhes(
equipamento
){

const registro =

dadosFiltrados()
.find(

d=>

d.equipamento ===
equipamento

);

if(!registro){
return;
}

document
.getElementById(
"detalhesEquipamento"
)
.innerHTML =

`

<b>
Equipamento:
</b>

<br>

${registro.equipamento}

<br><br>

<b>
Visual:
</b>

<br>

${registro.visual}

<br><br>

<b>
Intervenção:
</b>

<br>

${registro.intervencao}

`;

}


function exportarExcel(){

const exportar =

dadosFiltrados()
.map(d=>({

Equipamento:
d.equipamento,

Visual:
d.visual,

Intervenção:
d.intervencao

}));

const ws =
XLSX.utils
.json_to_sheet(
exportar
);

const wb =
XLSX.utils
.book_new();

XLSX.utils
.book_append_sheet(

wb,
ws,
"Relatorio"

);

XLSX.writeFile(
wb,
"Relatorio_ZEC.xlsx"
);

}


function limparUltimo(){

if(
dados.length === 0
){

alert(
"Nenhum registro."
);

return;

}

dados.pop();

salvarStorage();

atualizarTudo();

}


function limparTudo(){

const senha =
prompt(
"Digite a senha:"
);

if(
senha !== "123456"
){

alert(
"❌ Senha incorreta."
);

return;

}

dados = [];

localStorage.removeItem(
"zec_dados"
);

atualizarTudo();

alert(
"✅ Histórico apagado."
);

}


function atualizarTudo(){

renderTabela();

atualizarResumo();

criarGrafico();

}


function atualizarRelogio(){

const agora =
new Date();

const dia =
String(
agora.getDate()
).padStart(
2,
"0"
);

const mes =
String(
agora.getMonth()+1
).padStart(
2,
"0"
);

const ano =
agora.getFullYear();

const hora =
String(
agora.getHours()
).padStart(
2,
"0"
);

const minuto =
String(
agora.getMinutes()
).padStart(
2,
"0"
);

const segundo =
String(
agora.getSeconds()
).padStart(
2,
"0"
);

document
.getElementById(
"relogio"
)
.innerHTML =

`${dia}/${mes}/${ano}
 ${hora}:${minuto}:${segundo}`;

}
