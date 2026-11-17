// As páginas do site. O início tem um desenho por proposta (A, B, C); as outras páginas são o mesmo HTML.
import { esc, emLinha, mesPorExtenso, lista } from './util.mjs';
import { icones } from './icones.mjs';
import { url, foto, miniatura, logo, grelhaPecas, cartaoPeca, migalhas, separadores } from './componentes.mjs';

const porSlug = (d, slug) => { const p = d.produtos.find((x) => x.slug === slug); if (!p) throw new Error(`Peça desconhecida no início: ${slug}`); return p; };
const fp = (d, slug, i = 0) => porSlug(d, slug).fotos[i];
const cat = (d, slug) => d.categorias.find((c) => c.slug === slug);
const contar = (d, f) => d.produtos.filter(f).length;

// ------------------------------------------------------------------ peças comuns do início
function opinioes(ctx, d, classe = 'opinioes') {
  return `<div class="${classe}">
  ${d.opinioes.map((o) => `<figure class="opiniao">${icones.aspas}<blockquote>${esc(o.texto)}</blockquote><figcaption><b>${esc(o.nome)}</b> · no ${esc(o.onde)}, ${mesPorExtenso(o.data)}</figcaption></figure>`).join('\n  ')}
</div>
<p class="nota">Opiniões escritas no Facebook e no Instagram, tal como foram publicadas. Não confirmo se quem as escreveu comprou.</p>`;
}

function factos(ctx, d, comIcone = true) {
  return `<div class="factos">
  ${d.inicio.factos.map((f) => `<div class="facto">${comIcone ? `<span class="facto__icone">${icones[f.icone]}</span>` : ''}<h3>${esc(f.titulo)}</h3><p>${esc(f.texto)}</p></div>`).join('\n  ')}
</div>`;
}

function aromasPastilhas(ctx, d) {
  return `<ul class="aromas-pastilhas" role="list">${d.aromas.map((a) => `<li><i style="background:${a.cor}" aria-hidden="true"></i>${esc(a.nome)}</li>`).join('')}</ul>`;
}

const ligacao = (ctx, href, texto) => `<a class="ligacao" href="${url(ctx, href)}">${esc(texto)} ${icones.seta}</a>`;

// Fotografias do início escolhidas para nenhuma se repetir na página.
function fotosInicio(d) {
  return {
    capa: fp(d, 'vela-gold', 0),                 // vela dourada acesa
    capa2: fp(d, 'coffret-golden-crystal', 1),    // a caixa verde com o logótipo
    capaSaco: fp(d, 'saco-de-natal-vela-cristal', 0),
    cat: {
      lembrancas: fp(d, 'anjinho-na-campanula', 0), velas: fp(d, 'vela-de-tres-pavios', 0),
      'caixas-de-flores': fp(d, 'caixa-de-flores-parabens', 0), presentes: fp(d, 'coffret-dia-da-mae', 0),
      casa: fp(d, 'mikado', 0), natal: fp(d, 'saco-de-natal-vela-cristal', 0),
    },
  };
}

// ================================================================== A «Placa»
function inicioA(ctx, d) {
  const F = fotosInicio(d), c = d.inicio.capa, n = d.inicio.natal, h = d.inicio.historia, l = d.inicio.lembrancas;
  return `
<section class="capa-a">
  <div class="contentor capa-a__grelha">
    <div class="capa-a__media">
      ${foto(ctx, F.capa.ficheiro, F.capa.alt, { classe: 'capa-a__foto', sizes: '(min-width:900px) 52vw, 100vw', prioridade: true, foco: '50% 45%' })}
      ${foto(ctx, F.capa2.ficheiro, F.capa2.alt, { classe: 'capa-a__foto2', sizes: '(min-width:900px) 20vw, 38vw', foco: '40% 50%' })}
    </div>
    <div class="capa-a__texto">
      <p class="etiqueta">${esc(c.etiqueta)}</p>
      <h1>${esc(c.titulo)}</h1>
      <p class="lead">${esc(c.texto)}</p>
      <div class="accoes">
        <a class="btn btn--cheio" href="${url(ctx, c.botao.href)}">${esc(c.botao.texto)}</a>
        <a class="btn btn--linha" href="${url(ctx, '/criacoes/lembrancas/')}">Ver as lembranças</a>
      </div>
    </div>
  </div>
</section>

<section class="seccao" aria-labelledby="t-criacoes">
  <div class="contentor">
    <div class="seccao__topo"><h2 class="titulo-sec" id="t-criacoes">As criações</h2>${ligacao(ctx, '/criacoes/', 'Ver tudo')}</div>
    <ul class="mosaico-a" role="list">
      ${d.categorias.map((k) => `<li class="cartao-cat"><div class="cartao-cat__foto">${foto(ctx, F.cat[k.slug].ficheiro, F.cat[k.slug].alt, { sizes: '(min-width:760px) 30vw, 46vw' })}</div><h3 class="cartao-cat__nome"><a href="${url(ctx, `/criacoes/${k.slug}/`)}">${esc(k.nome)}</a>${icones.setaPequena}</h3></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section class="seccao" aria-labelledby="t-ocasioes">
  <div class="contentor">
    <div class="seccao__topo"><div><h2 class="titulo-sec" id="t-ocasioes">${esc(l.titulo)}</h2><p class="lead">${esc(l.texto)}</p></div></div>
    <ul class="fila-ocasioes" role="list">
      ${d.ocasioes.map((o) => `<li class="ocasiao"><a href="${url(ctx, `/ocasioes/${o.slug}/`)}">${foto(ctx, o.foto, '', { sizes: '(min-width:760px) 16vw, 42vw' })}<span>${esc(o.nome)}</span></a></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section class="seccao" aria-labelledby="t-natal">
  <div class="contentor">
    <div class="painel-natal">
      <div class="painel-natal__texto">
        <p class="etiqueta">${esc(n.etiqueta)}</p>
        <h2 class="titulo-sec" id="t-natal">${esc(n.titulo)}</h2>
        <p>${esc(n.texto)}</p>
        <p><a class="btn btn--ouro" href="${url(ctx, '/criacoes/natal/')}">Ver a coleção de Natal</a></p>
      </div>
      <ul class="coffrets" role="list">
        ${n.pecas.map((s) => { const p = porSlug(d, s); return `<li class="coffret">${foto(ctx, p.fotos[0].ficheiro, p.fotos[0].alt, { sizes: '(min-width:900px) 26vw, 72vw' })}<h3><a href="${url(ctx, `/peca/${p.slug}/`)}">${esc(p.nome)}</a></h3><p>${esc(p.resumo)}</p></li>`; }).join('\n        ')}
      </ul>
    </div>
  </div>
</section>

<section class="seccao" aria-labelledby="t-historia">
  <div class="contentor historia-bloco">
    ${foto(ctx, h.foto, 'Flocos de cera de soja numa taça de vidro, com uma colher de madeira', { classe: 'historia-bloco__foto', sizes: '(min-width:900px) 44vw, 100vw' })}
    <div class="historia-bloco__texto">
      <p class="etiqueta">A história</p>
      <h2 class="titulo-sec" id="t-historia">${esc(h.titulo)}</h2>
      ${h.texto.map((t) => `<p>${esc(t)}</p>`).join('\n      ')}
      <p class="assinatura">— ${esc(h.assinatura)}</p>
      ${ligacao(ctx, '/a-historia/', 'Ler a história toda')}
    </div>
  </div>
</section>

<section class="seccao" aria-labelledby="t-aromas">
  <div class="contentor">
    <div class="seccao__topo"><div><h2 class="titulo-sec" id="t-aromas">Doze aromas à escolha</h2><p class="lead">Em cada vela e em cada peça perfumada, o aroma escolhe-se no pedido.</p></div></div>
    ${aromasPastilhas(ctx, d)}
    ${ligacao(ctx, '/aromas/', 'As notas de cada aroma')}
  </div>
</section>

<section class="seccao" aria-labelledby="t-opinioes">
  <div class="contentor">
    <div class="seccao__topo"><h2 class="titulo-sec" id="t-opinioes">O que dizem</h2></div>
    ${opinioes(ctx, d)}
  </div>
</section>

<section class="seccao seccao--factos" aria-label="Como trabalho">
  <div class="contentor">${factos(ctx, d)}</div>
</section>`;
}

// ================================================================== B «Luz»
function inicioB(ctx, d) {
  const F = fotosInicio(d), c = d.inicio.capa, n = d.inicio.natal, h = d.inicio.historia, l = d.inicio.lembrancas;
  const mosaico = ['lembrancas', 'velas', 'caixas-de-flores', 'presentes', 'casa'];
  const bola = fp(d, 'coffret-golden-splendour', 0);
  const linhas = n.pecas.map((s) => porSlug(d, s)).map((p) => p.slug === 'coffret-golden-splendour' ? { ...p, fotos: [p.fotos[3], ...p.fotos] } : p);
  return `
<section class="capa-b">
  <div class="capa-b__fotos">
    ${foto(ctx, F.capaSaco.ficheiro, F.capaSaco.alt, { sizes: '33vw', foco: '45% 50%' })}
    ${foto(ctx, F.capa.ficheiro, F.capa.alt, { classe: 'capa-b__meio', sizes: '(min-width:960px) 33vw, 100vw', prioridade: true, foco: '50% 40%' })}
    ${foto(ctx, F.capa2.ficheiro, F.capa2.alt, { sizes: '33vw', foco: '40% 50%' })}
  </div>
  <div class="capa-b__painel">
    <p class="etiqueta">${esc(c.etiqueta)}</p>
    <h1>${esc(c.titulo)}</h1>
    <p class="lead">${esc(c.texto)}</p>
    <div class="accoes"><a class="btn btn--cheio" href="${url(ctx, c.botao.href)}">${esc(c.botao.texto)}</a><a class="ligacao" href="${url(ctx, '/criacoes/lembrancas/')}">Ver as lembranças</a></div>
  </div>
</section>

<section class="seccao" aria-labelledby="t-criacoes">
  <div class="contentor">
    <div class="seccao__topo seccao__topo--col"><p class="etiqueta">Feito à mão, peça a peça</p><h2 class="titulo-sec" id="t-criacoes">As criações</h2></div>
    <ul class="mosaico-b" role="list">
      ${mosaico.map((s, i) => { const k = cat(d, s); return `<li class="peca-b${i === 0 ? ' peca-b--grande' : ''}"><div class="peca-b__foto">${foto(ctx, F.cat[s].ficheiro, F.cat[s].alt, { sizes: i === 0 ? '(min-width:980px) 48vw, 100vw' : '(min-width:980px) 23vw, 46vw' })}</div><h3><a href="${url(ctx, `/criacoes/${s}/`)}">${esc(k.nome)}</a></h3>${i === 0 ? '<p>Batizados, comunhões, casamentos, bodas e aniversários.</p>' : ''}</li>`; }).join('\n      ')}
    </ul>
  </div>
</section>

<section class="seccao" aria-labelledby="t-ocasioes">
  <div class="contentor">
    <div class="seccao__topo seccao__topo--centro"><h2 class="titulo-sec" id="t-ocasioes">Lembranças <span class="mao">para cada ocasião</span></h2><p class="lead">${esc(l.texto)}</p></div>
    <ul class="circulos" role="list">
      ${d.ocasioes.map((o) => `<li><a class="circulo" href="${url(ctx, `/ocasioes/${o.slug}/`)}">${foto(ctx, o.foto, '', { sizes: '168px' })}<span>${esc(o.nome)}</span></a></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section class="seccao" aria-labelledby="t-natal">
  <div class="contentor natal-b">
    ${foto(ctx, bola.ficheiro, bola.alt, { classe: 'natal-b__foto', sizes: '(min-width:980px) 42vw, 100vw' })}
    <div>
      <p class="etiqueta">${esc(n.etiqueta)}</p>
      <h2 class="titulo-sec" id="t-natal">${esc(n.titulo)}</h2>
      <p class="lead">${esc(n.texto)}</p>
      <ul class="lista-coffrets" role="list">
        ${linhas.map((p) => `<li class="linha-coffret">${foto(ctx, p.fotos[0].ficheiro, p.fotos[0].alt, { sizes: '88px', larguraMax: 360 })}<div><h3><a href="${url(ctx, `/peca/${p.slug}/`)}">${esc(p.nome)}</a></h3><p>${esc(p.resumo)}</p></div>${icones.setaPequena}</li>`).join('\n        ')}
      </ul>
      <a class="btn btn--cheio" href="${url(ctx, '/criacoes/natal/')}">Ver a coleção de Natal</a>
    </div>
  </div>
</section>

<section class="seccao" aria-labelledby="t-historia">
  <div class="contentor historia-b">
    ${foto(ctx, h.foto, 'Flocos de cera de soja numa taça de vidro, com uma colher de madeira', { classe: 'historia-b__foto', sizes: '(min-width:980px) 40vw, 100vw' })}
    <div class="historia-b__texto">
      <p class="mao" aria-hidden="true">Amor, luz e alma</p>
      <h2 class="titulo-sec" id="t-historia">${esc(h.titulo)}</h2>
      ${h.texto.map((t) => `<p>${esc(t)}</p>`).join('\n      ')}
      <p class="historia-b__assina">${esc(h.assinatura)}</p>
      ${ligacao(ctx, '/a-historia/', 'Ler a história toda')}
    </div>
  </div>
</section>

<section class="seccao" aria-labelledby="t-aromas">
  <div class="contentor">
    <div class="seccao__topo seccao__topo--col"><p class="etiqueta">Doze aromas à escolha</p><h2 class="titulo-sec" id="t-aromas">A carta de aromas</h2><p class="lead">Notas de saída, de coração e de fundo.</p></div>
    <ul class="carta" role="list">
      ${d.aromas.map((a) => `<li><h3>${esc(a.nome)}</h3>${a.notas ? `<p>${esc(a.notas.join(' · '))}</p>` : ''}</li>`).join('\n      ')}
    </ul>
    ${ligacao(ctx, '/aromas/', 'As notas de cada aroma')}
  </div>
</section>

<section class="seccao" aria-labelledby="t-opinioes">
  <div class="contentor">
    <div class="seccao__topo seccao__topo--centro"><h2 class="titulo-sec" id="t-opinioes">O que dizem</h2></div>
    ${opinioes(ctx, d)}
  </div>
</section>

<section class="seccao seccao--factos" aria-label="Como trabalho">
  <div class="contentor">${factos(ctx, d, false)}</div>
</section>`;
}

// ================================================================== C «Bento»
function inicioC(ctx, d) {
  const F = fotosInicio(d), c = d.inicio.capa, n = d.inicio.natal, h = d.inicio.historia, l = d.inicio.lembrancas;
  const tile = (titulo, sub, href, f) => `<li class="tile tile--foto">${foto(ctx, f.ficheiro, f.alt, { sizes: '(min-width:980px) 24vw, 48vw' })}<div class="tile__nome"><h2><a href="${url(ctx, href)}">${esc(titulo)}</a></h2>${sub ? `<p>${esc(sub)}</p>` : ''}${icones.setaPequena}</div></li>`;
  const lembrancaTile = fp(d, 'vela-de-copo-com-nome', 0);
  const mais = [
    { k: 'presentes', f: F.cat.presentes }, { k: 'casa', f: F.cat.casa }, { k: 'natal', f: F.cat.natal },
    { k: 'velas', f: fp(d, 'vela-peonia', 0) },
  ];
  return `
<section class="capa-c">
  <ul class="contentor bento" role="list">
    <li class="tile tile--natal">
      ${foto(ctx, F.capa.ficheiro, F.capa.alt, { sizes: '(min-width:980px) 50vw, 100vw', prioridade: true, foco: '50% 40%' })}
      <div class="tile__cartao">
        <p class="etiqueta">${esc(c.etiqueta)}</p>
        <h1>${esc(c.titulo)}</h1>
        <p class="lead">${esc(c.texto)}</p>
        <div class="accoes"><a class="btn btn--cheio" href="${url(ctx, c.botao.href)}">${esc(c.botao.texto)}</a><a class="btn btn--claro" href="${url(ctx, '/criacoes/lembrancas/')}">Ver as lembranças</a></div>
      </div>
    </li>
    ${tile('Lembranças', 'Batizados, comunhões, casamentos', '/criacoes/lembrancas/', lembrancaTile)}
    ${tile('Caixas de flores', '', '/criacoes/caixas-de-flores/', F.cat['caixas-de-flores'])}
    <li class="tile tile--marca">${logo(ctx, 'inteiro', 128, 'Love Light & Soul — Handmade candles soy wax')}<p>100 % cera de soja</p></li>
    ${tile('Velas', '', '/criacoes/velas/', F.cat.velas)}
  </ul>
</section>

<section class="seccao" aria-labelledby="t-ocasioes">
  <div class="contentor">
    <div class="seccao__topo"><div><h2 class="titulo-sec" id="t-ocasioes">${esc(l.titulo)}</h2><p class="lead">${esc(l.texto)}</p></div>${ligacao(ctx, '/criacoes/lembrancas/', 'Ver todas')}</div>
    <ul class="pastilhas" role="list">
      ${d.ocasioes.map((o) => `<li><a class="pastilha" href="${url(ctx, `/ocasioes/${o.slug}/`)}">${foto(ctx, o.foto, '', { sizes: '40px', larguraMax: 360 })}${esc(o.nome)}</a></li>`).join('\n      ')}
    </ul>
    ${grelhaPecas(ctx, l.populares.map((s) => porSlug(d, s)))}
  </div>
</section>

<section class="seccao seccao--colada" aria-labelledby="t-natal">
  <div class="contentor">
    <div class="painel-natal painel-natal--c">
      <div class="painel-natal__texto">
        <p class="etiqueta">${esc(n.etiqueta)}</p>
        <h2 class="titulo-sec" id="t-natal">${esc(n.titulo)}</h2>
        <p>${esc(n.texto)}</p>
        <p><a class="btn btn--ouro" href="${url(ctx, '/criacoes/natal/')}">Ver a coleção de Natal</a></p>
      </div>
      <ul class="coffrets" role="list">
        ${n.pecas.map((s) => { const p = porSlug(d, s); return `<li class="coffret">${foto(ctx, p.fotos[0].ficheiro, p.fotos[0].alt, { sizes: '(min-width:980px) 15vw, 46vw' })}<div><h3><a href="${url(ctx, `/peca/${p.slug}/`)}">${esc(p.nome)}</a></h3><p>${esc(p.resumo)}</p></div></li>`; }).join('\n        ')}
      </ul>
    </div>
  </div>
</section>

<section class="seccao seccao--colada" aria-labelledby="t-mais">
  <div class="contentor">
    <div class="seccao__topo"><h2 class="titulo-sec" id="t-mais">Mais criações</h2>${ligacao(ctx, '/criacoes/', 'Ver tudo')}</div>
    <ul class="grelha-pecas" role="list">
      ${mais.map(({ k, f }) => `<li class="peca-cartao">${'<div class="peca-cartao__foto">' + foto(ctx, f.ficheiro, f.alt, { sizes: '(min-width:980px) 23vw, 46vw' }) + '</div>'}<div class="peca-cartao__texto"><h3 class="peca-cartao__nome"><a href="${url(ctx, `/criacoes/${k}/`)}">${esc(cat(d, k).nome)}</a></h3></div><span class="peca-cartao__seta" aria-hidden="true">${icones.setaPequena}</span></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section class="seccao seccao--colada" aria-labelledby="t-historia">
  <div class="contentor">
    <div class="historia-c">
      ${foto(ctx, h.foto, 'Flocos de cera de soja numa taça de vidro, com uma colher de madeira', { sizes: '(min-width:980px) 44vw, 100vw' })}
      <div class="historia-c__texto">
        <p class="etiqueta">A história</p>
        <h2 class="titulo-sec" id="t-historia">${esc(h.titulo)}</h2>
        ${h.texto.map((t) => `<p>${esc(t)}</p>`).join('\n        ')}
        <p class="assinatura">${esc(h.assinatura)}</p>
        ${ligacao(ctx, '/a-historia/', 'Ler a história toda')}
      </div>
    </div>
  </div>
</section>

<section class="seccao seccao--colada" aria-labelledby="t-aromas">
  <div class="contentor">
    <div class="seccao__topo"><div><h2 class="titulo-sec" id="t-aromas">Doze aromas à escolha</h2><p class="lead">O aroma escolhe-se em cada vela e em cada peça perfumada.</p></div>${ligacao(ctx, '/aromas/', 'As notas de cada aroma')}</div>
    ${aromasPastilhas(ctx, d)}
  </div>
</section>

<section class="seccao seccao--colada" aria-labelledby="t-opinioes">
  <div class="contentor">
    <div class="seccao__topo"><h2 class="titulo-sec" id="t-opinioes">O que dizem</h2></div>
    ${opinioes(ctx, d)}
  </div>
</section>

<section class="seccao seccao--colada" aria-label="Como trabalho">
  <div class="contentor">${factos(ctx, d)}</div>
</section>`;
}

export function inicio(ctx, d) {
  return { a: inicioA, b: inicioB, c: inicioC }[ctx.tema](ctx, d);
}

// ================================================================== criações (e cada categoria)
function abasCriacoes(ctx, d, actual) {
  return separadores(ctx, [{ chave: 'todas', nome: 'Tudo', href: '/criacoes/', n: d.produtos.length },
    ...d.categorias.map((c) => ({ chave: c.slug, nome: c.nome, href: `/criacoes/${c.slug}/`, n: contar(d, (p) => p.categoria === c.slug) }))], actual);
}

export function criacoes(ctx, d, categoria) {
  const c = categoria ? cat(d, categoria) : null;
  const pecas = c ? d.produtos.filter((p) => p.categoria === c.slug) : d.produtos;
  const ocasioesLembrancas = c && c.slug === 'lembrancas' ? `<ul class="pastilhas pastilhas--sub" role="list" aria-label="Por ocasião">${d.ocasioes.map((o) => `<li><a class="pastilha pastilha--texto" href="${url(ctx, `/ocasioes/${o.slug}/`)}">${esc(o.nome)}</a></li>`).join('')}</ul>` : '';
  return `
<div class="contentor pagina-topo">
  <h1 class="titulo-pag">${esc(c ? c.nome : 'As criações')}</h1>
  <p class="lead">${esc(c ? c.frase : 'Velas, lembranças, caixas de flores e presentes, feitos à mão. Escolha a peça e junte-a ao pedido.')}</p>
</div>
<div class="contentor">${abasCriacoes(ctx, d, c ? c.slug : 'todas')}</div>
<div class="contentor seccao-lista">
  ${ocasioesLembrancas}
  ${grelhaPecas(ctx, pecas)}
</div>`;
}

// ================================================================== uma ocasião
export function ocasiao(ctx, d, o) {
  const pecas = d.produtos.filter((p) => (p.ocasioes || []).includes(o.slug));
  const outras = d.ocasioes.filter((x) => x.slug !== o.slug);
  return `
<div class="contentor pagina-topo">
  ${migalhas(ctx, [{ nome: 'Criações', href: '/criacoes/' }, { nome: 'Lembranças', href: '/criacoes/lembrancas/' }, { nome: o.nome }])}
  <h1 class="titulo-pag">${esc(o.nome)}</h1>
  <p class="lead">${esc(o.frase || `Lembranças e presentes para ${o.nome.toLowerCase() === 'aniversário' ? 'o aniversário' : `o ${o.nome.toLowerCase()}`}, com o nome e a data.`)}</p>
</div>
<div class="contentor seccao-lista">
  ${grelhaPecas(ctx, pecas)}
  <h2 class="titulo-peq">Outras ocasiões</h2>
  <ul class="pastilhas pastilhas--sub" role="list">${outras.map((x) => `<li><a class="pastilha pastilha--texto" href="${url(ctx, `/ocasioes/${x.slug}/`)}">${esc(x.nome)}</a></li>`).join('')}</ul>
</div>`;
}

// ================================================================== a ficha de uma peça
const EXEMPLOS = {
  lembrancas: 'Ex.: Batizado do Tomás · 14 de junho de 2027', 'caixas-de-flores': 'Ex.: Adoro-te, Madrinha',
  presentes: 'Ex.: Para a melhor professora', natal: 'Ex.: Feliz Natal, Avó', velas: 'Ex.: Para a melhor mãe do mundo',
};

export function peca(ctx, d, p) {
  const c = cat(d, p.categoria);
  const e = p.escolhas || {};
  const unidade = p.unidade || 'unidades';
  const galeria = `<div class="galeria" data-galeria>
    <div class="galeria__fila" data-galeria-fila tabindex="0" role="region" aria-label="Fotografias de ${esc(p.nome)}">
      ${p.fotos.map((f, i) => `<figure class="galeria__foto">${foto(ctx, f.ficheiro, f.alt, { sizes: '(min-width:860px) 52vw, 100vw', prioridade: i === 0 })}</figure>`).join('\n      ')}
    </div>
    ${p.fotos.length > 1 ? `<div class="galeria__minis">${p.fotos.map((f, i) => `<button type="button" class="galeria__mini" data-galeria-ir aria-label="Ver a fotografia ${i + 1} de ${p.fotos.length}">${foto(ctx, f.ficheiro, '', { sizes: '72px', larguraMax: 360 })}</button>`).join('')}</div>` : ''}
  </div>`;
  const aromas = e.aroma ? `<fieldset class="escolha">
      <legend>Aroma</legend>
      <div class="chips">
        <label class="chip"><input type="radio" name="aroma" value="" checked><span>Escolho depois</span></label>
        ${d.aromas.map((a) => `<label class="chip"><input type="radio" name="aroma" value="${esc(a.nome)}"><span><i style="background:${a.cor}" aria-hidden="true"></i>${esc(a.nome)}</span></label>`).join('\n        ')}
      </div>
    </fieldset>` : '';
  const LACO_COR = { 'Beje': '#E8D9C3', 'Rosa velho': '#C99A99', 'Azul-bebé': '#AFCBE0', 'Verde-salva': '#A9B79A', 'Branco': '#FFFFFF' };
  const lacos = e.lacos ? `<fieldset class="escolha">
      <legend>Cor do laço</legend>
      <div class="chips">
        ${e.lacos.map((l, i) => `<label class="chip"><input type="radio" name="laco" value="${esc(l)}"${i === 0 ? ' checked' : ''}><span><i style="background:${LACO_COR[l] || '#ddd'}" aria-hidden="true"></i>${esc(l)}</span></label>`).join('\n        ')}
      </div>
    </fieldset>` : '';
  const texto = e.texto ? `<div class="escolha">
      <label for="texto">${esc(e.texto)} <span class="opcional">(opcional)</span></label>
      <textarea id="texto" name="texto" rows="2" maxlength="300" placeholder="${esc(EXEMPLOS[p.categoria] || 'Escreva aqui o texto')}"></textarea>
    </div>` : '';
  const rel = d.produtos.filter((x) => x.slug !== p.slug && (x.categoria === p.categoria || (x.ocasioes || []).some((o) => (p.ocasioes || []).includes(o)))).slice(0, 4);
  const ocs = (p.ocasioes || []).map((s) => d.ocasioes.find((o) => o.slug === s)).filter(Boolean);
  return `
<div class="contentor">
  ${migalhas(ctx, [{ nome: 'Criações', href: '/criacoes/' }, { nome: c.nome, href: `/criacoes/${c.slug}/` }, { nome: p.nome }])}
</div>
<article class="contentor ficha">
  ${galeria}
  <div class="ficha__info">
    <p class="etiqueta">${esc(c.nome)}${ocs.length ? ` · ${esc(lista(ocs.map((o) => o.nome)))}` : ''}</p>
    <h1 class="ficha__nome">${esc(p.nome)}</h1>
    <p class="ficha__resumo">${esc(p.resumo)}</p>
    <form class="ficha__form" data-juntar data-slug="${esc(p.slug)}" data-nome="${esc(p.nome)}" data-foto="${esc(miniatura(ctx, p.fotos[0].ficheiro))}">
      ${aromas}
      ${lacos}
      ${texto}
      <div class="escolha escolha--qtd">
        <label for="quantidade">Quantidade <span class="opcional">(${esc(unidade)})</span></label>
        <input id="quantidade" name="quantidade" type="number" inputmode="numeric" min="1" max="999" value="1">
      </div>
      <button class="btn btn--cheio btn--largo" type="submit">${icones.saco}Juntar ao pedido</button>
    </form>
    <p class="ficha__linha">${icones.marcacao}<span>${esc(d.site.encomendas.prazo)}</span></p>
    <p class="ficha__linha">${icones.caixa}<span>${esc(d.site.encomendas.envio)}</span></p>
    <p class="ficha__linha">${icones.mensagem}<span>Dúvidas? <a href="${esc(d.site.contactos.mensagemInstagram)}" rel="noopener">Pergunte-me por mensagem</a>.</span></p>
    <div class="ficha__secoes">
      <details open><summary>Descrição</summary><div><p>${emLinha(p.descricao)}</p></div></details>
      ${p.detalhes?.length ? `<details><summary>O que leva</summary><div><ul>${p.detalhes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></details>` : ''}
      ${e.aroma ? `<details><summary>Os aromas</summary><div><p>Doze aromas à escolha: ${esc(lista(d.aromas.map((a) => a.nome.toLowerCase())))}. <a href="${url(ctx, '/aromas/')}">Ver as notas de cada um</a>.</p></div></details>` : ''}
      ${['velas', 'natal', 'casa'].includes(p.categoria) || /vela/i.test(p.nome) ? `<details><summary>Cuidados</summary><div><p>Nunca deixe uma vela acesa sem ninguém por perto, longe do que possa arder e fora do alcance de crianças e animais. Na primeira vez, deixe a cera derreter à superfície toda; corte o pavio antes de voltar a acender.</p></div></details>` : ''}
    </div>
  </div>
</article>
${rel.length ? `<section class="contentor seccao-lista" aria-labelledby="t-combina">
  <h2 class="titulo-peq" id="t-combina">Combina com</h2>
  ${grelhaPecas(ctx, rel, { mostrarResumo: false })}
</section>` : ''}`;
}

// ================================================================== aromas
export function aromas(ctx, d) {
  return `
<div class="contentor pagina-topo">
  <h1 class="titulo-pag">Os aromas</h1>
  <p class="lead">Doze aromas, em todas as velas e peças perfumadas. As notas lêem-se de cima para baixo: as primeiras que se sentem, o coração e o fundo, que fica.</p>
</div>
<div class="contentor seccao-lista">
  <ul class="aromas-cartoes" role="list">
    ${d.aromas.map((a) => `<li class="aroma${a.preferido ? ' aroma--preferido' : ''}">
      <div class="aroma__topo"><i style="background:${a.cor}" aria-hidden="true"></i><h2>${esc(a.nome)}</h2>${a.preferido ? '<span class="aroma__selo">O preferido</span>' : ''}</div>
      ${a.notas ? `<dl class="aroma__notas"><dt>Saída</dt><dd>${esc(a.notas[0])}</dd><dt>Coração</dt><dd>${esc(a.notas[1])}</dd><dt>Fundo</dt><dd>${esc(a.notas[2])}</dd></dl>` : '<p class="aroma__sem">Notas por confirmar.</p>'}
    </li>`).join('\n    ')}
  </ul>
  <p class="nota">Também há aromas da época: Royal Orchid, Lux Orchid, Talco, Imperial Pine e o de Natal.</p>
</div>`;
}

// ================================================================== páginas de texto (Markdown)
export function texto(ctx, d, { titulo, html, lead = '', foto: f = null, faq = false }) {
  let corpo = html;
  if (faq) {
    // cada «## pergunta» com o parágrafo seguinte passa a <details>
    corpo = html.replace(/<h2>(.+?)<\/h2>\n?((?:(?!<h2>)[\s\S])*)/g, (_, q, r) => `<details class="pergunta"><summary>${q}</summary><div>${r.trim()}</div></details>\n`);
  }
  return `
<div class="contentor pagina-topo pagina-topo--texto">
  <h1 class="titulo-pag">${esc(titulo)}</h1>
  ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
</div>
<div class="contentor pagina-texto${f ? ' pagina-texto--foto' : ''}">
  <div class="texto${faq ? ' texto--faq' : ''}">${corpo}</div>
  ${f ? `<figure class="pagina-texto__foto">${foto(ctx, f.ficheiro, f.alt, { sizes: '(min-width:980px) 34vw, 100vw' })}${f.legenda ? `<figcaption>${esc(f.legenda)}</figcaption>` : ''}</figure>` : ''}
</div>`;
}

// ================================================================== contactos
export function contactos(ctx, d, porConfirmar) {
  const s = d.site;
  const canais = [
    `<li class="canal"><span class="canal__icone">${icones.instagram}</span><div><h2>Instagram</h2><p>@${esc(s.redes.instagramUtilizador)}: as encomendas fazem-se por mensagem.</p><a class="btn btn--cheio" href="${esc(s.contactos.mensagemInstagram)}" rel="noopener">Enviar uma mensagem</a></div></li>`,
    `<li class="canal"><span class="canal__icone">${icones.facebook}</span><div><h2>Facebook</h2><p>${esc(s.redes.facebookNome)}</p><a class="btn btn--linha" href="${esc(s.redes.facebook)}" rel="noopener">Abrir a página</a></div></li>`,
    s.contactos.whatsapp ? `<li class="canal"><span class="canal__icone">${icones.whatsapp}</span><div><h2>WhatsApp</h2><a class="btn btn--linha" href="https://wa.me/${esc(s.contactos.whatsapp)}" rel="noopener">Enviar uma mensagem</a></div></li>` : '',
    s.contactos.email ? `<li class="canal"><span class="canal__icone">${icones.email}</span><div><h2>Email</h2><p><a href="mailto:${esc(s.contactos.email)}">${esc(s.contactos.email)}</a></p></div></li>` : '',
  ].filter(Boolean).join('\n    ');
  return `
<div class="contentor pagina-topo">
  <h1 class="titulo-pag">Contactos</h1>
  <p class="lead">${esc(s.encomendas.atendimento)} ${esc(s.encomendas.envio)}</p>
</div>
<div class="contentor seccao-lista">
  <ul class="canais" role="list">
    ${canais}
  </ul>
  <h2 class="titulo-peq">Onde encontrar as peças</h2>
  <p class="lead">Também estão à venda nestas lojas:</p>
  <ul class="lojas" role="list">${d.lojas.map((l) => `<li><b>${esc(l.nome)}</b><span>${esc(l.localidade)}</span></li>`).join('')}</ul>
  <h2 class="titulo-peq">Quem vende</h2>
  <p class="identificacao">${porConfirmar}</p>
</div>`;
}

// ================================================================== o pedido
export function pedido(ctx, d) {
  const s = d.site;
  const botoes = [
    `<a class="btn btn--cheio btn--largo" href="${esc(s.contactos.mensagemInstagram)}" data-enviar="instagram" rel="noopener">${icones.instagram}Copiar e enviar pelo Instagram</a>`,
    s.contactos.whatsapp ? `<a class="btn btn--whatsapp btn--largo" href="https://wa.me/${esc(s.contactos.whatsapp)}" data-enviar="whatsapp" data-url="https://wa.me/${esc(s.contactos.whatsapp)}" rel="noopener">${icones.whatsapp}Enviar pelo WhatsApp</a>` : '',
    s.contactos.email ? `<a class="btn btn--linha btn--largo" href="mailto:${esc(s.contactos.email)}" data-enviar="email" data-url="mailto:${esc(s.contactos.email)}">${icones.email}Enviar por email</a>` : '',
  ].filter(Boolean).join('\n      ');
  return `
<div class="contentor pagina-topo">
  <h1 class="titulo-pag">O meu pedido</h1>
  <p class="lead">Junte as peças, diga-me a data e envie-me a mensagem. Respondo com a confirmação, o valor e o prazo.</p>
</div>
<div class="contentor seccao-lista">
  <div class="pedido-vazio" data-pedido-vazio>
    <p>Ainda não juntou nenhuma peça.</p>
    <a class="btn btn--cheio" href="${url(ctx, '/criacoes/')}">Ver as criações</a>
  </div>
  <div class="pedido-grelha" data-pedido-cheio hidden>
    <div>
      <ul class="pedido-lista" data-pedido-lista role="list"></ul>
      <button type="button" class="ligacao ligacao--discreta" data-limpar>Esvaziar o pedido</button>
    </div>
    <div class="pedido-envio">
      <form class="pedido-campos" data-pedido-campos onsubmit="return false">
        <div class="escolha"><label for="p-data">Data do evento ou da entrega <span class="opcional">(opcional)</span></label><input id="p-data" name="data" type="text" autocomplete="off" placeholder="Ex.: 14 de junho de 2027"></div>
        <div class="escolha"><label for="p-notas">Mais alguma coisa <span class="opcional">(opcional)</span></label><textarea id="p-notas" name="notas" rows="3" maxlength="600"></textarea></div>
        <div class="escolha"><label for="p-nome">O seu nome <span class="opcional">(opcional)</span></label><input id="p-nome" name="nome" type="text" autocomplete="name"></div>
      </form>
      <h2 class="titulo-peq">A mensagem</h2>
      <pre class="mensagem" data-mensagem tabindex="0" aria-label="A mensagem que vai enviar"></pre>
      <div class="pedido-botoes">
      ${botoes}
      <button type="button" class="btn btn--linha btn--largo" data-copiar>${icones.copiar}Só copiar a mensagem</button>
      </div>
      <p class="nota" data-copiado role="status" hidden></p>
      <p class="nota">O Instagram não deixa abrir a conversa com o texto escrito: a mensagem é copiada e basta colá-la. Nada do que escreve aqui fica neste site.</p>
    </div>
  </div>
</div>`;
}

// ================================================================== 404
export function naoEncontrada(ctx) {
  return `
<div class="contentor pagina-topo pagina-topo--texto">
  <h1 class="titulo-pag">Esta página não existe</h1>
  <p class="lead">Pode ter mudado de sítio. As peças estão todas nas criações.</p>
  <p class="accoes"><a class="btn btn--cheio" href="${url(ctx, '/criacoes/')}">Ver as criações</a><a class="btn btn--linha" href="${url(ctx, '/')}">Ir ao início</a></p>
</div>`;
}
