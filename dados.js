/* =========================================================
   Cronograma 2026 · Desenvolvimento Web com IA
   Dados do curso

   Este arquivo guarda só o conteúdo. Para atualizar o
   cronograma, mexa aqui e nada mais.

   AULAS   -> uma linha por encontro: "MM-DD chave [*]"
              o asterisco marca encontro de avaliação
   PAUSAS  -> "MM-DD tipo|nome" (tipo: feriado, pausa, evento)
   ========================================================= */

const ANO = 2026;

const UC = {
  ageis: {
    sigla: "Ágeis",
    uc: "UC1",
    nome: "Metodologias Ágeis em Projetos Web",
    ch: 32,
    faltas: 2,
    desc: "Ciclo de vida do produto: briefing, personas, benchmarking e priorização. Scrum e Kanban na prática, com papéis rotativos."
  },
  front: {
    sigla: "Front",
    uc: "UC5",
    nome: "Front-end de Projetos Web",
    ch: 72,
    faltas: 4.5,
    desc: "Do wireframe ao componente: Figma, HTML semântico, CSS, JavaScript, React, responsividade, acessibilidade e consumo de API."
  },
  back: {
    sigla: "Back",
    uc: "UC4",
    nome: "Back-end de Projetos Web",
    ch: 72,
    faltas: 4.5,
    desc: "Camada de acesso a dados, regras de negócio, construção de APIs e estratégias de autenticação e segurança."
  },
  devops: {
    sigla: "DevOps",
    uc: "UC2",
    nome: "Práticas DevOps em Projetos Web",
    ch: 20,
    faltas: 1.25,
    desc: "Arquitetura cliente-servidor, HTTP, servidores web e em nuvem, controle de versões e entrega contínua."
  },
  devia: {
    sigla: "DevIA",
    uc: "UC3",
    nome: "Desenvolvimento de Software Apoiado por IA",
    ch: 20,
    faltas: 1.25,
    desc: "Fundamentos de IA e LLMs, assistentes de código, automação, revisão de código com IA e as questões éticas envolvidas."
  },
  protot: {
    sigla: "Protót.",
    uc: "UC6",
    nome: "Prototipação Rápida de Aplicações com IA",
    ch: 24,
    faltas: 1.5,
    desc: "UI/UX com IA, back-end as a service, geração de interfaces e construção de um MVP em tempo reduzido."
  },
  hack: {
    sigla: "Hackathon",
    uc: "EXTRA",
    nome: "Hackathon final",
    ch: 0,
    faltas: 0,
    desc: "Sete dias seguidos de projeto integrador, aplicando tudo o que foi construído ao longo do ano."
  }
};

const AULAS = `
07-06 ageis
07-08 ageis
07-13 ageis
07-16 ageis
07-20 ageis
07-21 ageis
07-22 ageis
07-23 ageis
07-27 front
07-28 front
07-29 front
07-30 front
08-03 front
08-05 front
08-06 front
08-10 front
08-12 front
08-13 front
08-17 front
08-19 front
08-20 front
08-24 front
08-26 front
08-27 front
08-31 front
09-01 front *
09-08 back
09-09 back
09-10 back
09-14 back
09-15 back
09-16 back
09-21 back
09-23 back
09-24 back
09-28 back
09-30 back
10-01 back
10-05 back
10-07 back
10-08 back
10-19 back
10-20 back *
10-21 back
10-22 devops
10-26 devops
10-27 devops *
10-28 devops
10-29 devops
11-04 devia
11-05 devia
11-09 devia
11-11 devia
11-12 devia
11-16 protot
11-18 protot
11-19 protot
11-23 protot
11-25 protot
11-26 protot
11-28 hack
11-30 hack
12-01 hack
12-02 hack
12-03 hack
12-04 hack
12-05 hack
`;

const PAUSAS = `
07-14 evento|Turma em evento
07-15 evento|Turma em evento
09-02 feriado|Aniversário de Blumenau
09-07 feriado|Independência
10-12 feriado|Nossa Senhora Aparecida
10-15 pausa|Dia do Professor
11-02 feriado|Finados
11-20 feriado|Consciência Negra
12-25 feriado|Natal
`;

const MESES = ["janeiro","fevereiro","março","abril","maio","junho",
               "julho","agosto","setembro","outubro","novembro","dezembro"];
const DOW = ["seg","ter","qua","qui","sex","sáb","dom"];

/* primeiro e último mês exibidos no calendário */
const MES_INICIAL = 7;
const MES_FINAL = 12;
