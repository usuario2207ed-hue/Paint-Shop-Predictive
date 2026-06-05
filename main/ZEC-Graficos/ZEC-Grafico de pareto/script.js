
let dados =
JSON.parse(
localStorage.getItem("zec_pareto_dados")
) || [];

let graficoPareto = null;

const criticidade = {

"Normal":1,
"Vazio":1,

"Acúmulo de pó":2,
"Aquecimento leve":2,
"Leve desgaste":2,
"Vibração leve":2,
"Ponto de ferrugem":2,

"Odor intermitente":3,
"Leitura instável":3,

"Fixação solta":4,
"Parafuso frouxo":4,
"Acúmulo de água":4,
"Presença de água":4,
"Baixo nível de óleo":4,
"Lubrificação insuficiente":4,
"Lubrificação excessiva":4,
"Filtro saturado":4,
"Correia frouxa":4,

"Oxidação":5,
"Oxidação por umidade":5,
"Correia desgastada":5,
"Desgaste avançado":5,
"Desgaste em rolamento":5,
"Funcionamento irregular":5,
"Ruído anormal":5,
"Ruído intermitente":5,
"Oscilação anormal":5,
"Sensor descalibrado":5,
"Ventilação obstruída":5,
"Sem ventilação":5,
"Vazamento hidráulico":5,
"Vazamento pneumático":5,
"Sujeira excessiva":5,
"Outros":5,

"Estrutura desalinhada":6,
"Polia desalinhada":6,
"Corrente elevada":6,
"Tensão irregular":6,
"Não conforme":6,
"Batida mecânica":6,

"Equipamento parado":7,
"Falha intermitente":7,
"Aquecimento excessivo":7,

"Superaquecimento":8,
"Peça quebrada":8,
"Alarme ativo":8,
"Cabo aquecido":8,
"Componente danificado":8,
"Corrosão avançada":8,
"Equipamento molhado pela chuva":8,
"Odor forte":8,
"Telhado com infiltração":8,
"Umidade excessiva":8,
"Vazamento de água":8,

"Cabo danificado":9,
"Correia rompida":9,
"Motor sobrecarregado":9,
"Vazamento de óleo":9,
"Vibração excessiva":9,

"Centelhamento":10,
"Faíscamento":10,
"Cheiro de queimado":10,
"Componente queimado":10,
"Sensor inoperante":10,
"Trinca estrutural":10,
"Falha crítica":10

};


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


atualizarTudo();

setInterval(
atualizarRelogio,
1000
);

atualizarRelogio();

function salvarStorage(){

localStorage.setItem(
"zec_pareto_dados",
JSON.stringify(dados)
);

}


function carregarArquivo(){

const arquivo =
document.getElementById(
"fileInput"
).files[0];

if(!arquivo){

alert(
"Selecione um arquivo TXT."
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
arquivo,
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

const dataHora =
pegar(
bloco,
"Data/Hora:"
);

const id =
equipamento +
"_" +
dataHora;

const existe =
dados.some(
d=>d.id === id
);

if(existe){
return;
}

const pontos =

criticidade.hasOwnProperty(visual)

? criticidade[visual]

: 1;

const classe =
obterClasse(
pontos
);

const intervencao =
obterIntervencao(
pontos
);

dados.push({

id,
equipamento,
visual,
pontos,
classe,
intervencao

});

novos++;

});

salvarStorage();

atualizarTudo();

alert(
novos +
" registros adicionados."
);

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


function obterClasse(
pontos
){

if(pontos >= 8){

return "CRÍTICO";

}

if(pontos >= 4){

return "ATENÇÃO";

}

return "NORMAL";

}


function obterIntervencao(
pontos
){

if(pontos >= 8){

return
"INTERVENÇÃO IMEDIATA";

}

if(pontos >= 4){

return
"PROGRAMAR MANUTENÇÃO";

}

return
"SEGUIR INSPEÇÃO";

}


function dadosFiltrados(){

const filtro =

document
.getElementById(
"filtroEquipamento"
)
.value
.toLowerCase();

return dados.filter(

d=>

d.equipamento
.toLowerCase()
.includes(filtro)

);

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
"totalNormal"
)
.innerHTML =

lista.filter(
d=>d.classe ===
"NORMAL"
).length;

document
.getElementById(
"totalAtencao"
)
.innerHTML =

lista.filter(
d=>d.classe ===
"ATENÇÃO"
).length;

document
.getElementById(
"totalCritico"
)
.innerHTML =

lista.filter(
d=>d.classe ===
"CRÍTICO"
).length;

}


function renderTabela(){

const tbody =
document.querySelector(
"#tabelaResultado tbody"
);

tbody.innerHTML = "";

dadosFiltrados()
.forEach(d=>{

let cssClasse =
"class-normal";

if(
d.classe ===
"ATENÇÃO"
){
cssClasse =
"class-atencao";
}

if(
d.classe ===
"CRÍTICO"
){
cssClasse =
"class-critico";
}

tbody.innerHTML += `

<tr>

<td>${d.equipamento}</td>

<td>${d.visual}</td>

<td>${d.pontos}</td>

<td class="${cssClasse}">
${d.classe}
</td>

</tr>

`;

});

}


function criarPareto(){

const lista =
[...dadosFiltrados()]

.sort(
(a,b)=>
b.pontos -
a.pontos
);

const labels =
lista.map(
d=>d.equipamento
);

const valores =
lista.map(
d=>d.pontos
);

const total =
valores.reduce(
(a,b)=>
a+b,
0
);

let soma = 0;

const acumulado =
valores.map(v=>{

soma += v;

return (
soma / total
) * 100;

});

const cores =
lista.map(d=>{

if(
d.pontos >= 8
){
return "#ff0000";
}

if(
d.pontos >= 4
){
return "#ffc000";
}

return "#00b050";

});

const ctx =
document.getElementById(
"graficoPareto"
);

if(
graficoPareto
){

graficoPareto.destroy();

}

graficoPareto =
new Chart(

ctx,

{

data:{

labels,

datasets:[

{

type:"bar",

label:
"Criticidade",

data:
valores,

backgroundColor:
cores

},

{

type:"line",

label:
"% Acumulado",

data:
acumulado,

borderColor:
"#0066ff",

backgroundColor:
"#0066ff",

yAxisID:
"y1",

tension:0.3

}

]

},

options:{

responsive:true,

maintainAspectRatio:false,

onClick(
evt,
elements
){

if(
!elements.length
){
return;
}

const indice =
elements[0]
.index;

mostrarDetalhes(
lista[indice]
);

},

scales:{

y:{

beginAtZero:true

},

y1:{

position:"right",

beginAtZero:true,

max:100,

grid:{
drawOnChartArea:false
}

}

}

}

}

);

}

function mostrarDetalhes(d){

document
.getElementById(
"detalhesEquipamento"
)
.innerHTML =

`

<b>Equipamento:</b> <br>
${d.equipamento}

<br><br>

<b>Visual:</b> <br>
${d.visual}

<br><br>

<b>Pontuação:</b> <br>
${d.pontos}

<br><br>

<b>Classificação:</b> <br>
${d.classe}


`;

}


function exportarExcel(){

const ws =
XLSX.utils
.json_to_sheet(

dadosFiltrados()

);

const wb =
XLSX.utils
.book_new();

XLSX.utils
.book_append_sheet(
wb,
ws,
"Pareto"
);

XLSX.writeFile(
wb,
"Pareto_ZEC.xlsx"
);

}


function limparUltimo(){

if(
dados.length === 0
){
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
"Senha incorreta."
);

return;

}

dados = [];

localStorage.removeItem(
"zec_pareto_dados"
);

atualizarTudo();

}


function atualizarTudo(){

renderTabela();

atualizarResumo();

criarPareto();

}


function atualizarRelogio(){

const agora =
new Date();

document
.getElementById(
"relogio"
)
.innerHTML =

agora.toLocaleString(
"pt-BR"
);

}

window.addEventListener(
"storage",
function(){

    dados = JSON.parse(
        localStorage.getItem(
            "zec_pareto_dados"
        )
    ) || [];

    atualizarTudo();

});
