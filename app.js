/* =========================================================
   Cronograma 2026 · Desenvolvimento Web com IA
   Comportamento da página

   Sumário
   1. Preparo dos dados
   2. Tema claro e escuro
   3. Números do topo e botão "ver hoje"
   4. Filtros por unidade
   5. Trilha do ano
   6. Cartões das unidades
   7. Calendário
   8. Marcos
   9. Barra de detalhe
   ========================================================= */

/* ---------- 1. Preparo dos dados ---------- */

/* transforma as linhas de texto de dados.js em objetos */
const aulas = AULAS.trim().split("\n").map(linha => {
  const partes = linha.trim().split(/\s+/);
  return { data: `${ANO}-${partes[0]}`, uc: partes[1], aval: partes[2] === "*" };
});

/* numera cada encontro dentro da sua própria unidade: Front 1, Front 2... */
const contagem = {};
aulas.forEach(a => {
  contagem[a.uc] = (contagem[a.uc] || 0) + 1;
  a.n = contagem[a.uc];
});
Object.keys(UC).forEach(k => (UC[k].total = contagem[k] || 0));

const porData = Object.fromEntries(aulas.map(a => [a.data, a]));

const pausas = PAUSAS.trim().split("\n").map(linha => {
  const [dia, resto] = linha.trim().split(/\s+/, 2);
  const [tipo, nome] = resto.split("|");
  return { data: `${ANO}-${dia}`, tipo, nome };
});
const pausaPorData = Object.fromEntries(pausas.map(p => [p.data, p]));

/* data de hoje no fuso local, sem passar por UTC */
const agora = new Date();
const hojeISO = [
  agora.getFullYear(),
  String(agora.getMonth() + 1).padStart(2, "0"),
  String(agora.getDate()).padStart(2, "0")
].join("-");

const aulaHoje = porData[hojeISO];
const pausaHoje = pausaPorData[hojeISO];
const realizadas = aulas.filter(a => a.data <= hojeISO && a.uc !== "hack").length;

/* o dia que o botão do topo abre: hoje, se houver algo; senão o próximo encontro */
const proxima = aulas.find(a => a.data >= hojeISO);
const ultima = aulas[aulas.length - 1];
const alvoHoje = aulaHoje || pausaHoje ? hojeISO : (proxima ? proxima.data : ultima.data);

function formatarData(iso) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  const d = new Date(ano, mes - 1, dia);
  return `${DOW[(d.getDay() + 6) % 7]}, ${dia} de ${MESES[mes - 1]}`;
}

function periodo(chave) {
  const lista = aulas.filter(a => a.uc === chave);
  const ini = lista[0].data.split("-");
  const fim = lista[lista.length - 1].data.split("-");
  return `${+ini[2]}/${+ini[1]} – ${+fim[2]}/${+fim[1]}`;
}

const diaMes = iso => `${iso.slice(8)}/${iso.slice(5, 7)}`;

/* ---------- 2. Tema claro e escuro ---------- */

const CHAVE_TEMA = "cronograma2026:tema";
const btnTema = document.getElementById("btnTema");

/* localStorage pode estar bloqueado; nesse caso o tema vale só para a sessão */
function lerTemaSalvo() {
  try { return localStorage.getItem(CHAVE_TEMA); } catch { return null; }
}
function salvarTema(tema) {
  try { localStorage.setItem(CHAVE_TEMA, tema); } catch { /* segue sem salvar */ }
}

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  const proximo = tema === "escuro" ? "claro" : "escuro";
  btnTema.setAttribute("aria-label", `Mudar para tema ${proximo}`);
  btnTema.title = `Mudar para tema ${proximo}`;
}

const preferenciaSistema =
  window.matchMedia("(prefers-color-scheme: light)").matches ? "claro" : "escuro";

aplicarTema(lerTemaSalvo() || preferenciaSistema);

btnTema.addEventListener("click", () => {
  const novo = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";
  aplicarTema(novo);
  salvarTema(novo);
});

/* se a pessoa nunca escolheu, acompanha a troca no sistema operacional */
window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", e => {
  if (!lerTemaSalvo()) aplicarTema(e.matches ? "claro" : "escuro");
});

/* ---------- 3. Números do topo e botão "ver hoje" ---------- */

document.getElementById("stProg").textContent = `${realizadas}/60`;
document.getElementById("stHoje").textContent = aulaHoje
  ? `${UC[aulaHoje.uc].sigla} ${aulaHoje.n}`
  : (pausaHoje ? "pausa" : "livre");

const btnHoje = document.getElementById("btnHoje");
const rotuloHoje = document.getElementById("rotuloHoje");
const notaHoje = document.getElementById("notaHoje");

if (aulaHoje) {
  rotuloHoje.textContent = "Ver hoje no calendário";
  notaHoje.textContent = `Hoje é ${UC[aulaHoje.uc].nome}, encontro ${aulaHoje.n} de ${UC[aulaHoje.uc].total}.`;
} else if (pausaHoje) {
  rotuloHoje.textContent = "Ver hoje no calendário";
  notaHoje.textContent = `Hoje não tem aula: ${pausaHoje.nome}.`;
} else if (proxima) {
  rotuloHoje.textContent = "Ir para o próximo encontro";
  notaHoje.textContent = `Sem aula hoje. O próximo encontro é ${formatarData(proxima.data)}, ${UC[proxima.uc].sigla}.`;
} else {
  rotuloHoje.textContent = "Ver o último encontro";
  notaHoje.textContent = "O curso já foi concluído.";
}

btnHoje.addEventListener("click", () => {
  aplicarFiltro(null);   // limpa o filtro para o dia não ficar apagado
  selecionar(alvoHoje, { rolar: true, piscar: true });
});

/* ---------- 4. Filtros por unidade ---------- */

let filtroAtivo = null;
const filtros = document.getElementById("filtros");

Object.entries(UC).forEach(([chave, uc]) => {
  const b = document.createElement("button");
  b.className = "chip";
  b.type = "button";
  b.dataset.uc = chave;
  b.setAttribute("aria-pressed", "false");
  b.style.color = `var(--${chave})`;
  b.innerHTML = `<i></i>${uc.sigla}`;
  b.addEventListener("click", () => aplicarFiltro(filtroAtivo === chave ? null : chave));
  filtros.appendChild(b);
});

function aplicarFiltro(chave) {
  filtroAtivo = chave;
  document.body.classList.toggle("filtrando", Boolean(chave));

  filtros.querySelectorAll(".chip").forEach(c => {
    const ligado = c.dataset.uc === chave;
    c.setAttribute("aria-pressed", ligado);
    c.style.color = ligado ? "" : `var(--${c.dataset.uc})`;
  });
  document.querySelectorAll(".uc").forEach(c =>
    c.setAttribute("aria-pressed", c.dataset.uc === chave)
  );
  document.querySelectorAll(".dia.aula").forEach(d =>
    d.classList.toggle("apagado", Boolean(chave) && d.dataset.uc !== chave)
  );
  document.querySelectorAll(".tbarra").forEach(t =>
    t.classList.toggle("on", Boolean(chave) && t.dataset.uc === chave)
  );
}

/* ---------- 5. Trilha do ano ---------- */

const trilha = document.getElementById("trilha");
let grupo = null;
let ucCorrente = null;

aulas.forEach(a => {
  if (a.uc !== ucCorrente) {
    ucCorrente = a.uc;
    grupo = document.createElement("div");
    grupo.className = "tgrupo";
    grupo.style.setProperty("--c", `var(--${a.uc})`);
    grupo.style.flex = `${UC[a.uc].total} 1 0`;
    grupo.innerHTML =
      `<div class="tbarras"></div>
       <div class="trotulo"><b>${UC[a.uc].sigla}</b>
         <span>${UC[a.uc].total} encontros · ${periodo(a.uc)}</span>
       </div>`;
    trilha.appendChild(grupo);
  }

  const barra = document.createElement("button");
  barra.type = "button";
  barra.className = "tbarra"
    + (a.data <= hojeISO ? " feita" : "")
    + (a.data === hojeISO ? " hoje" : "");
  barra.dataset.uc = a.uc;
  barra.dataset.data = a.data;
  barra.setAttribute("aria-label",
    `${UC[a.uc].sigla} ${a.n} de ${UC[a.uc].total}, ${formatarData(a.data)}`);
  barra.addEventListener("click", () => selecionar(a.data, { rolar: true }));
  grupo.querySelector(".tbarras").appendChild(barra);
});

/* ---------- 6. Cartões das unidades ---------- */

const gradeUc = document.getElementById("gradeUc");

Object.entries(UC)
  .filter(([chave]) => chave !== "hack")
  .forEach(([chave, uc]) => {
    const cartao = document.createElement("button");
    cartao.className = "uc";
    cartao.type = "button";
    cartao.dataset.uc = chave;
    cartao.style.setProperty("--c", `var(--${chave})`);
    cartao.setAttribute("aria-pressed", "false");
    cartao.innerHTML = `
      <div class="uc-top">
        <span class="uc-tag">${uc.uc} · ${uc.sigla}</span>
        <span class="uc-per">${periodo(chave)}</span>
      </div>
      <h3>${uc.nome}</h3>
      <p>${uc.desc}</p>
      <div class="uc-nums">
        <div>${uc.ch} h<small>carga</small></div>
        <div>${uc.total}<small>encontros</small></div>
        <div>${String(uc.faltas).replace(".", ",")}<small>faltas máx.</small></div>
      </div>`;
    cartao.addEventListener("click", () => aplicarFiltro(filtroAtivo === chave ? null : chave));
    gradeUc.appendChild(cartao);
  });

/* ---------- 7. Calendário ---------- */

const meses = document.getElementById("meses");

for (let m = MES_INICIAL; m <= MES_FINAL; m++) {
  const mm = String(m).padStart(2, "0");
  const totalDias = new Date(ANO, m, 0).getDate();          // dia 0 do mês seguinte
  const primeiroDow = (new Date(ANO, m - 1, 1).getDay() + 6) % 7;  // segunda = 0
  const encontros = aulas.filter(a => a.data.slice(5, 7) === mm).length;

  const bloco = document.createElement("div");
  bloco.className = "mes";
  bloco.id = `mes-${mm}`;
  bloco.innerHTML = `
    <h3>${MESES[m - 1]}</h3>
    <span class="resumo">${encontros} encontro${encontros === 1 ? "" : "s"}</span>
    <div class="dow">${DOW.map(d => `<span>${d}</span>`).join("")}</div>
    <div class="dias"></div>`;
  const caixa = bloco.querySelector(".dias");

  for (let i = 0; i < primeiroDow; i++) {
    const vazio = document.createElement("div");
    vazio.className = "dia fora";
    caixa.appendChild(vazio);
  }

  for (let d = 1; d <= totalDias; d++) {
    const iso = `${ANO}-${mm}-${String(d).padStart(2, "0")}`;
    const aula = porData[iso];
    const pausa = pausaPorData[iso];

    const cel = document.createElement("div");
    cel.className = "dia";
    cel.textContent = d;
    cel.dataset.data = iso;

    if (aula) {
      cel.classList.add("aula");
      if (aula.aval) cel.classList.add("aval");
      cel.dataset.uc = aula.uc;
      cel.style.setProperty("--c", `var(--${aula.uc})`);
      cel.setAttribute("aria-label",
        `${d} de ${MESES[m - 1]}: ${UC[aula.uc].sigla}, encontro ${aula.n} de ${UC[aula.uc].total}`);
    } else if (pausa) {
      cel.classList.add("pausa");
      cel.setAttribute("aria-label", `${d} de ${MESES[m - 1]}: ${pausa.nome}`);
    }

    if (iso === hojeISO) cel.classList.add("hoje");

    if (aula || pausa) {
      cel.tabIndex = 0;
      cel.setAttribute("role", "button");
      cel.addEventListener("click", () => selecionar(iso));
      cel.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selecionar(iso);
        }
      });
    }

    caixa.appendChild(cel);
  }

  meses.appendChild(bloco);
}

/* ---------- 8. Marcos ---------- */

const marcos = document.getElementById("marcos");

function cartaoMarcos(titulo, itens) {
  const el = document.createElement("div");
  el.className = "marco";
  el.innerHTML = `<h4>${titulo}</h4><ul>${itens.map(i => `
    <li><time>${i.data}</time>
      <span>${i.uc ? `<i style="--c:var(--${i.uc})"></i> ` : ""}<b>${i.titulo}</b>${i.sub ? ` · ${i.sub}` : ""}</span>
    </li>`).join("")}</ul>`;
  marcos.appendChild(el);
}

cartaoMarcos("Encontros de avaliação", aulas.filter(a => a.aval).map(a => ({
  data: diaMes(a.data), uc: a.uc, titulo: UC[a.uc].sigla, sub: "fechamento da unidade"
})));

cartaoMarcos("Começo de cada unidade", Object.keys(UC).map(chave => {
  const primeira = aulas.find(a => a.uc === chave);
  return {
    data: diaMes(primeira.data), uc: chave,
    titulo: UC[chave].sigla, sub: `${UC[chave].total} encontros`
  };
}));

cartaoMarcos("Feriados e pausas", pausas.map(p => ({
  data: diaMes(p.data), titulo: p.nome, sub: p.tipo === "evento" ? "turma em evento" : ""
})));

/* ---------- 9. Barra de detalhe ---------- */

const detalhe = document.getElementById("detalhe");
const dData = document.getElementById("dData");
const dTitulo = document.getElementById("dTitulo");
const dSub = document.getElementById("dSub");

function selecionar(iso, opcoes = {}) {
  document.querySelectorAll(".dia.sel").forEach(d => d.classList.remove("sel", "pulsa"));

  const cel = document.querySelector(`.dia[data-data="${iso}"]`);
  if (cel) {
    cel.classList.add("sel");
    if (opcoes.rolar) cel.scrollIntoView({ block: "center", behavior: "smooth" });
    if (opcoes.piscar) {
      cel.classList.add("pulsa");
      cel.addEventListener("animationend", () => cel.classList.remove("pulsa"), { once: true });
    }
  }

  const aula = porData[iso];
  const pausa = pausaPorData[iso];
  dData.textContent = formatarData(iso);

  if (aula) {
    detalhe.style.setProperty("--c", `var(--${aula.uc})`);
    dTitulo.textContent = UC[aula.uc].nome;
    dSub.textContent =
      `Encontro ${aula.n} de ${UC[aula.uc].total} · 4 horas` +
      (aula.aval ? " · avaliação de fechamento" : "");
  } else if (pausa) {
    detalhe.style.setProperty("--c", "var(--suave)");
    dTitulo.textContent = pausa.nome;
    dSub.textContent = pausa.tipo === "evento" ? "Sem aula: turma em evento" : "Sem aula";
  } else {
    return;
  }

  detalhe.classList.add("aberto");
}

function fecharDetalhe() {
  detalhe.classList.remove("aberto");
  document.querySelectorAll(".dia.sel").forEach(d => d.classList.remove("sel"));
}

document.getElementById("dFechar").addEventListener("click", fecharDetalhe);

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    fecharDetalhe();
    aplicarFiltro(null);
  }
});

/* ao abrir a página, se hoje for dia de aula, já mostra o detalhe sem rolar a tela */
if (aulaHoje) selecionar(hojeISO);
