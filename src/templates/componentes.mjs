// Peças do HTML usadas em várias páginas. O contexto (ctx) traz a base dos endereços e o manifesto das imagens.
import { esc } from './util.mjs';
import { icones } from './icones.mjs';

export const url = (ctx, p) => `${ctx.base}${p}`;

// <picture> com AVIF e WebP nas larguras que a fotografia tem; o <img> leva width/height (sem saltos ao carregar).
export function foto(ctx, nome, alt, { sizes = '100vw', classe = '', prioridade = false, foco = '', larguraMax = 0 } = {}) {
  const m = ctx.manifesto.fotos[nome];
  if (!m) throw new Error(`Fotografia sem versões no manifesto: ${nome} (correr scripts/imagens.py)`);
  const larguras = larguraMax ? m.larguras.filter((w) => w <= larguraMax || w === m.larguras[0]) : m.larguras;
  const src = (fmt) => larguras.map((w) => `${ctx.base}/assets/img/${nome}-${m.resumo}-${w}.${fmt} ${w}w`).join(', ');
  const fallback = `${ctx.base}/assets/img/${nome}-${m.resumo}-${larguras[Math.min(2, larguras.length - 1)]}.webp`;
  const estilo = foco ? ` style="object-position:${foco}"` : '';
  const fontes = m.formatos.filter((f) => f !== 'webp').map((f) => `<source type="image/${f}" srcset="${src(f)}" sizes="${sizes}">`).join('');
  return `<picture>${fontes}<img src="${fallback}" srcset="${src('webp')}" sizes="${sizes}" width="${m.largura}" height="${m.altura}" alt="${esc(alt)}"${classe ? ` class="${classe}"` : ''}${prioridade ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${estilo}></picture>`;
}

// A miniatura de uma fotografia (para o pedido: guarda-se o endereço no aparelho).
export function miniatura(ctx, nome, largura = 360) {
  const m = ctx.manifesto.fotos[nome];
  const w = m.larguras.find((x) => x >= largura) || m.larguras[m.larguras.length - 1];
  return `${ctx.base}/assets/img/${nome}-${m.resumo}-${w}.webp`;
}

export function logo(ctx, chave, altura, alt, classe = '') {
  const d = ctx.manifesto.marca[chave].altura[altura];
  if (!d) throw new Error(`Logótipo ${chave} sem a altura ${altura}`);
  const b = `${ctx.base}/assets/img/`;
  return `<picture><source type="image/webp" srcset="${b}${d['1x']}.webp 1x, ${b}${d['2x']}.webp 2x"><img src="${b}${d['1x']}.png" srcset="${b}${d['2x']}.png 2x" width="${d.largura}" height="${altura}" alt="${esc(alt)}"${classe ? ` class="${classe}"` : ''}></picture>`;
}

// O cartão de uma peça: a fotografia e o nome; o cartão inteiro leva à ficha (sem botão de comprar).
export function cartaoPeca(ctx, p, { sizes = '(min-width:980px) 23vw, (min-width:700px) 31vw, 46vw', mostrarResumo = true } = {}) {
  const f = p.fotos[0];
  return `<li class="peca-cartao">
  <div class="peca-cartao__foto">${foto(ctx, f.ficheiro, f.alt, { sizes })}</div>
  <div class="peca-cartao__texto">
    <h3 class="peca-cartao__nome"><a href="${url(ctx, `/peca/${p.slug}/`)}">${esc(p.nome)}</a></h3>
    ${mostrarResumo ? `<p class="peca-cartao__resumo">${esc(p.resumo)}</p>` : ''}
  </div>
  <span class="peca-cartao__seta" aria-hidden="true">${icones.setaPequena}</span>
</li>`;
}

export function grelhaPecas(ctx, pecas, opcoes) {
  return `<ul class="grelha-pecas" role="list">\n${pecas.map((p) => cartaoPeca(ctx, p, opcoes)).join('\n')}\n</ul>`;
}

export function migalhas(ctx, itens) {
  // itens: [{ nome, href }] — o último é a página actual (sem ligação)
  return `<nav class="migalhas" aria-label="Estou em">
  <ol>${itens.map((it, i) => i < itens.length - 1 ? `<li><a href="${url(ctx, it.href)}">${esc(it.nome)}</a></li>` : `<li aria-current="page">${esc(it.nome)}</li>`).join('')}</ol>
</nav>`;
}

// Separadores que são páginas (as categorias): a página nova abre no mesmo sítio do ecrã (o script logo a seguir
// repõe-no antes da primeira pintura; o site.js guarda-o no clique).
export function separadores(ctx, itens, actual, rotulo = 'Categorias') {
  return `<nav class="separadores" data-separadores aria-label="${esc(rotulo)}">
  <ul role="list">${itens.map((it) => `<li><a href="${url(ctx, it.href)}"${it.chave === actual ? ' aria-current="page"' : ''}>${esc(it.nome)}${it.n != null ? ` <span class="separadores__n">${it.n}</span>` : ''}</a></li>`).join('')}</ul>
</nav>
<script>(()=>{try{const l=JSON.parse(sessionStorage.getItem('lls-lugar')||'null');if(!l||l.para!==location.pathname||Date.now()-l.t>15000)return;sessionStorage.removeItem('lls-lugar');document.documentElement.setAttribute('data-lugar','');const s=document.currentScript.previousElementSibling,u=s.querySelector('ul');const repor=()=>{const y=s.getBoundingClientRect().top+scrollY-l.topo;scrollTo({top:y,left:0,behavior:'instant'});if(u)u.scrollLeft=l.esq};repor();let mexeu=false;const parar=()=>{mexeu=true};['wheel','touchstart','keydown','mousedown'].forEach(e=>addEventListener(e,parar,{once:true,passive:true}));const de_novo=()=>{if(!mexeu)repor()};addEventListener('DOMContentLoaded',de_novo);addEventListener('load',()=>{de_novo();requestAnimationFrame(de_novo)});addEventListener('pagereveal',de_novo);document.fonts&&document.fonts.ready.then(de_novo)}catch(e){}})();</script>`;
}
