// O esqueleto de todas as páginas: <head>, cabeçalho, menu, rodapé. Os três desenhos (A «Placa», B «Luz»,
// C «Bento») mudam o cabeçalho e o rodapé; o resto das páginas é o mesmo HTML com as cores e letras de cada um.
import { esc } from './util.mjs';
import { icones } from './icones.mjs';
import { url, logo } from './componentes.mjs';
import { livroReclamacoes } from '../../legal-comum/index.mjs';

export const MENU = [
  { chave: 'criacoes', nome: 'Criações', href: '/criacoes/' },
  { chave: 'lembrancas', nome: 'Lembranças', href: '/criacoes/lembrancas/' },
  { chave: 'natal', nome: 'Natal', href: '/criacoes/natal/' },
  { chave: 'historia', nome: 'A história', href: '/a-historia/' },
];
const ATALHOS = [
  { nome: 'Lembranças', href: '/criacoes/lembrancas/' }, { nome: 'Velas', href: '/criacoes/velas/' },
  { nome: 'Natal', href: '/criacoes/natal/' }, { nome: 'Caixas de flores', href: '/criacoes/caixas-de-flores/' },
  { nome: 'Presentes', href: '/criacoes/presentes/' }, { nome: 'Aromas', href: '/aromas/' },
];

const actualAttr = (chave, actual) => (chave === actual ? ' aria-current="page"' : '');

function nav(ctx, actual, itens = MENU) {
  return itens.map((n) => `<a href="${url(ctx, n.href)}"${actualAttr(n.chave, actual)}>${esc(n.nome)}</a>`).join('');
}

function botaoPedido(ctx, comTexto) {
  return `<a class="pedido-btn" href="${url(ctx, '/pedido/')}" data-pedido-rotulo aria-label="O meu pedido">${icones.saco}${comTexto ? '<span class="pedido-btn__texto">Pedido</span>' : ''}<span class="pedido-btn__n" data-pedido-n data-esconde-zero aria-hidden="true" hidden>0</span></a>`;
}

const botaoMenu = '<button class="icone-btn menu-btn" type="button" data-menu-abrir aria-controls="menu" aria-expanded="false" aria-label="Abrir o menu">' + icones.menu + '</button>';

function atalhos(ctx) {
  return `<nav class="atalhos" aria-label="Atalhos">${ATALHOS.map((a) => `<a href="${url(ctx, a.href)}">${esc(a.nome)}</a>`).join('')}</nav>`;
}

function placaLogo(ctx, classe) {
  return `<a class="${classe}" href="${url(ctx, '/')}" aria-label="Love Light &amp; Soul — página inicial">${logo(ctx, 'palavra', 64, '', `${classe}__img`)}</a>`;
}

export function cabecalho(ctx, actual) {
  if (ctx.tema === 'b') {
    return `<header class="topo topo--b" data-topo>
  <div class="contentor topo__barra">
    <div class="topo__esq">${botaoMenu}<nav class="topo__nav" aria-label="Principal">${nav(ctx, actual, MENU.slice(0, 2))}</nav></div>
    ${placaLogo(ctx, 'capsula')}
    <div class="topo__dir"><nav class="topo__nav" aria-label="Principal (continuação)">${nav(ctx, actual, MENU.slice(2))}</nav>${botaoPedido(ctx, false)}</div>
  </div>
  ${atalhos(ctx)}
</header>`;
  }
  if (ctx.tema === 'c') {
    return `<header class="topo topo--c" data-topo>
  <div class="topo__capsula">
    ${placaLogo(ctx, 'placa')}
    <nav class="topo__nav" aria-label="Principal">${nav(ctx, actual)}</nav>
    <div class="topo__dir">${botaoPedido(ctx, true)}${botaoMenu}</div>
  </div>
</header>
${atalhos(ctx)}`;
  }
  return `<header class="topo topo--a" data-topo>
  <div class="contentor topo__barra">
    ${placaLogo(ctx, 'placa')}
    <nav class="topo__nav" aria-label="Principal">${nav(ctx, actual)}</nav>
    <div class="topo__dir">${botaoPedido(ctx, true)}${botaoMenu}</div>
  </div>
  ${atalhos(ctx)}
</header>`;
}

export function menuGaveta(ctx, d) {
  const cats = d.categorias.map((c) => `<li><a href="${url(ctx, `/criacoes/${c.slug}/`)}">${esc(c.nome)}</a></li>`).join('');
  const ocs = d.ocasioes.map((o) => `<li><a href="${url(ctx, `/ocasioes/${o.slug}/`)}">${esc(o.nome)}</a></li>`).join('');
  return `<dialog class="gaveta" id="menu" aria-label="Menu">
  <div class="gaveta__topo">
    <span class="gaveta__titulo">Menu</span>
    <button class="icone-btn" type="button" data-menu-fechar aria-label="Fechar o menu">${icones.fechar}</button>
  </div>
  <nav class="gaveta__corpo" aria-label="Menu">
    <a class="gaveta__grande" href="${url(ctx, '/criacoes/')}">Todas as criações</a>
    <h2>Criações</h2><ul>${cats}</ul>
    <h2>Ocasiões</h2><ul>${ocs}</ul>
    <h2>A Love</h2>
    <ul>
      <li><a href="${url(ctx, '/aromas/')}">Os aromas</a></li>
      <li><a href="${url(ctx, '/a-historia/')}">A história</a></li>
      <li><a href="${url(ctx, '/como-encomendar/')}">Como encomendar</a></li>
      <li><a href="${url(ctx, '/perguntas-frequentes/')}">Perguntas frequentes</a></li>
      <li><a href="${url(ctx, '/contactos/')}">Contactos</a></li>
    </ul>
    <div class="gaveta__redes"><a href="${esc(d.site.redes.instagram)}" rel="noopener">${icones.instagram}Instagram</a><a href="${esc(d.site.redes.facebook)}" rel="noopener">${icones.facebook}Facebook</a></div>
  </nav>
</dialog>`;
}

export function rodape(ctx, d) {
  const s = d.site;
  const col = (titulo, itens) => `<div><h2>${esc(titulo)}</h2><ul>${itens.join('')}</ul></div>`;
  const li = (nome, href, externo) => `<li><a href="${externo ? esc(href) : url(ctx, href)}"${externo ? ' rel="noopener"' : ''}>${esc(nome)}</a></li>`;
  const colunas = [
    col('Criações', d.categorias.map((c) => li(c.nome, `/criacoes/${c.slug}/`))),
    col('Ajuda', [li('Como encomendar', '/como-encomendar/'), li('Perguntas frequentes', '/perguntas-frequentes/'), li('Os aromas', '/aromas/'), li('A história', '/a-historia/'), li('Contactos', '/contactos/')]),
    col('Encomendas', [li('Mensagem no Instagram', s.contactos.mensagemInstagram, true), li('Facebook', s.redes.facebook, true),
      `<li><span>Envio para todo o mundo</span></li>`, `<li><span>Atendimento por marcação</span></li>`]),
  ].join('');
  return `<footer class="rodape rodape--${ctx.tema}">
  <div class="contentor rodape__caixa">
    <div class="rodape__grelha">
      <div class="rodape__marca">
        <a class="rodape__placa" href="${url(ctx, '/')}" aria-label="Love Light &amp; Soul — página inicial">${logo(ctx, 'inteiro', 128, '')}</a>
        <p>${esc(s.frase)}</p>
        <div class="redes"><a href="${esc(s.redes.instagram)}" rel="noopener" aria-label="Instagram">${icones.instagram}</a><a href="${esc(s.redes.facebook)}" rel="noopener" aria-label="Facebook">${icones.facebook}</a></div>
      </div>
      <div class="rodape__colunas">${colunas}</div>
    </div>
    <div class="rodape__fim">
      <span>© ${ctx.ano} Love Light &amp; Soul</span>
      <a href="${url(ctx, '/termos/')}">Termos e condições</a>
      <a href="${url(ctx, '/privacidade/')}">Privacidade</a>
      ${livroReclamacoes({ classe: 'rodape__livro' })}
    </div>
  </div>
</footer>`;
}

// A página inteira.
export function pagina(ctx, d, { titulo, descricao, caminho, corpo, actual = '', indexar = true, imagem, tipo = 'website', jsonLd = [], classe = '' }) {
  const canonical = `${ctx.origem}${ctx.baseCanonica}${caminho}`;
  const tituloCompleto = caminho === '/' ? titulo : `${titulo} | Love Light & Soul`;
  const robots = ctx.preVisualizacao || !indexar ? '<meta name="robots" content="noindex">' : '';
  const og = imagem || ctx.partilhaSite;
  const icones = ctx.manifesto.marca.icones;
  const ia = `${ctx.baseAssets}/assets/img/`;
  return `<!doctype html>
<html lang="pt-PT" data-tema="${ctx.tema}" data-marca="Love Light &amp; Soul">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(tituloCompleto)}</title>
<meta name="description" content="${esc(descricao)}">
${robots}
<link rel="canonical" href="${esc(canonical)}">
<meta name="theme-color" content="#9C6D5D">
<meta property="og:type" content="${tipo}">
<meta property="og:locale" content="pt_PT">
<meta property="og:site_name" content="Love Light &amp; Soul">
<meta property="og:title" content="${esc(tituloCompleto)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(`${ctx.origem}${ctx.baseAssets}/assets/img/${og}`)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${ia}${icones[32]}" sizes="32x32" type="image/png">
<link rel="icon" href="${ia}${icones[192]}" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="${ia}${icones[180]}">
${ctx.fontesPreload.map((f) => `<link rel="preload" href="${ctx.baseAssets}/assets/fontes/${f}" as="font" type="font/woff2" crossorigin>`).join('\n')}
<link rel="stylesheet" href="${ctx.css}">
<script>(()=>{const ua=navigator.userAgent;if(/Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|Bytedance/i.test(ua))document.documentElement.classList.add('na-app');else document.documentElement.classList.add('fora-da-app')})();</script>
${jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body class="${esc(classe)}">
<a class="saltar" href="#conteudo">Saltar para o conteúdo</a>
${cabecalho(ctx, actual)}
<main id="conteudo">
${corpo}
</main>
${rodape(ctx, d)}
${menuGaveta(ctx, d)}
<div class="aviso" data-aviso role="status" aria-live="polite" hidden>${icones.certo}<span>Juntei ao seu pedido.</span><a href="${url(ctx, '/pedido/')}">Ver o pedido</a></div>
<script src="${ctx.js}" defer></script>
</body>
</html>
`;
}
