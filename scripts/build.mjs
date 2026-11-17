#!/usr/bin/env node
// Gera o site da Love Light & Soul em _site/, a partir de content/ e media/. Node 22, sem dependências.
//
//   node scripts/build.mjs                              local (http://localhost:4985/)
//   node scripts/build.mjs --base=/lovelightsoul        pré-visualização no GitHub Pages
//   node scripts/build.mjs --tema=a|c                   as outras propostas (precisam de src/estilos/tema-a|c.css)
//   node scripts/build.mjs --producao --tema=b          o domínio aberto aos motores de busca (recusa sem dados legais)
//   node scripts/build.mjs --sem-imagens                não corre o scripts/imagens.py (usa a cache)
//
// Os dados que a lei pede (identificação, NIF, morada, contactos, pagamento) vêm de content/site.json por
// marcadores {{…}}; enquanto faltam, a pré-visualização mostra «[por confirmar: …]» e a produção recusa publicar.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { carregar } from '../src/lib/dados.mjs';
import { esc, markdown, marcadores, hojeEmLisboa, lista } from '../src/templates/util.mjs';
import { pagina } from '../src/templates/layout.mjs';
import * as P from '../src/templates/paginas.mjs';
import { ralHtml, destinatariosHtml, frasesPrivacidade, prazos as PRAZOS, DIREITOS, CNPD_URL } from '../legal-comum/index.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opc = (n) => args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const producao = args.includes('--producao');
// O desenho é a B «Luz» (17 nov 2026); a A e a C ficaram como propostas (pasta propostas/, fora do git).
const temaUnico = opc('tema') || 'b';
const TEMAS = [temaUnico];
const base = (opc('base') || '').replace(/\/$/, '');
const SAIDA = path.resolve(opc('saida') || path.join(RAIZ, '_site'));
const DOMINIO = process.env.DOMINIO || null;
const ORIGEM = producao && DOMINIO ? `https://${DOMINIO}` : (base ? 'https://renatovalente5.github.io' : 'http://localhost:4985');
const preVisualizacao = !producao;
for (const t of TEMAS) if (!['a', 'b', 'c'].includes(t)) { console.error(`Desenho desconhecido: ${t}`); process.exit(1); }

// ---------------------------------------------------------------- conteúdo
const d = carregar(path.join(RAIZ, 'content'), path.join(RAIZ, 'media', 'fotos'));
for (const a of d.avisos) console.warn(`  ! ${a}`);
if (d.erros.length) { console.error('\nA construção parou:\n'); for (const e of d.erros) console.error(`  ✗ ${e}`); process.exit(1); }
if (producao) {
  const falta = [];
  const e = d.site.empresa;
  if (!e.nome) falta.push('o nome ou a firma'); if (!e.nif) falta.push('o NIF'); if (!e.morada) falta.push('a morada');
  if (!d.site.contactos.email && !d.site.contactos.whatsapp) falta.push('um email ou um WhatsApp');
  if (!DOMINIO) falta.push('o domínio (DOMINIO=…)');
  if (falta.length) { console.error(`\nNão publico em produção sem: ${lista(falta)}.`); process.exit(1); }
}

// ---------------------------------------------------------------- imagens
if (!args.includes('--sem-imagens')) execFileSync('python3', [path.join(RAIZ, 'scripts', 'imagens.py')], { stdio: 'inherit' });
const MANIFESTO = path.join(RAIZ, '.cache', 'imagens', 'manifesto.json');
if (!fs.existsSync(MANIFESTO)) { console.error('Falta .cache/imagens/manifesto.json: correr python3 scripts/imagens.py'); process.exit(1); }
const manifesto = JSON.parse(fs.readFileSync(MANIFESTO, 'utf8'));

// ---------------------------------------------------------------- saída e ficheiros comuns
fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(path.join(SAIDA, 'assets', 'img'), { recursive: true });
fs.mkdirSync(path.join(SAIDA, 'assets', 'fontes'), { recursive: true });
const CACHE = path.join(RAIZ, '.cache', 'imagens');
for (const f of fs.readdirSync(CACHE)) if (f !== 'manifesto.json') fs.copyFileSync(path.join(CACHE, f), path.join(SAIDA, 'assets', 'img', f));
for (const f of fs.readdirSync(path.join(RAIZ, 'src', 'fontes'))) if (f.endsWith('.woff2')) fs.copyFileSync(path.join(RAIZ, 'src', 'fontes', f), path.join(SAIDA, 'assets', 'fontes', f));

const resumo = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);
const FONTES = { a: ['HedvigLettersSerif', 'RedditSans'], b: ['ShipporiMincho', 'WixMadeforText', 'Allison'], c: ['YsabeauInfant'] };
const PRELOAD = { a: ['HedvigLettersSerif-normal-400-latin.woff2', 'RedditSans-normal-300-800-latin.woff2'], b: ['ShipporiMincho-normal-500-latin.woff2', 'WixMadeforText-normal-400-800-latin.woff2'], c: ['YsabeauInfant-normal-1-1000-latin.woff2'] };
const lerCss = (f) => fs.readFileSync(path.join(RAIZ, 'src', 'estilos', f), 'utf8');
const minificar = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '\n').replace(/\n+/g, '\n').trim();
const js = fs.readFileSync(path.join(RAIZ, 'src', 'scripts', 'site.js'), 'utf8');
const jsNome = `site.${resumo(js)}.js`;
fs.writeFileSync(path.join(SAIDA, 'assets', jsNome), js);

// ---------------------------------------------------------------- marcadores das páginas de texto
const pc = (o) => `<span class="por-confirmar">[por confirmar: ${esc(o)}]</span>`;
function valoresLegais() {
  const s = d.site, e = s.empresa;
  const morada = e.morada ? `${esc(e.morada)}, ${esc(e.codigoPostal || '')} ${esc(e.localidade || '')}` : pc('morada');
  const identificacao = `${e.nome ? esc(e.nome) : pc('nome ou firma de quem vende')}${e.tipo ? `, ${esc(e.tipo)}` : ''}, NIF ${e.nif ? esc(e.nif) : pc('NIF')}, ${morada}.`;
  const canais = [`mensagem no Instagram (<a href="${esc(s.contactos.mensagemInstagram)}" rel="noopener">@${esc(s.redes.instagramUtilizador)}</a>)`,
    s.contactos.whatsapp && 'WhatsApp', s.contactos.email && `email (<a href="mailto:${esc(s.contactos.email)}">${esc(s.contactos.email)}</a>)`].filter(Boolean);
  const direitos = s.contactos.email
    ? `<p>Pode pedir o acesso, a retificação, o apagamento, a limitação ou a portabilidade dos seus dados, e opor-se ao seu tratamento, por email para <a href="mailto:${esc(s.contactos.email)}">${esc(s.contactos.email)}</a>. Respondo no prazo de um mês.</p>`
    : `<p>Pode pedir o acesso, a retificação, o apagamento, a limitação ou a portabilidade dos seus dados, e opor-se ao seu tratamento, por mensagem no Instagram ou por escrito para ${pc('email ou morada para estes pedidos')}. Respondo no prazo de um mês.</p>`;
  return {
    'empresa.identificacao': identificacao,
    'empresa.iva': e.nif ? 'Os preços incluem o IVA à taxa legal, quando aplicável.' : pc('se os preços incluem IVA'),
    contactos: lista(canais),
    canais: lista(canais),
    'contacto.privacidade': s.contactos.email ? `<a href="mailto:${esc(s.contactos.email)}">${esc(s.contactos.email)}</a>` : `mensagem no Instagram ou ${pc('email')}`,
    pagamento: s.encomendas.pagamento ? esc(s.encomendas.pagamento) : pc('formas de pagamento (MB WAY, transferência…)'),
    envio: esc(s.encomendas.envio) + (s.encomendas.zona ? '' : ` ${pc('portes e transportadora')}`),
    atendimento: esc(s.encomendas.atendimento) + (s.encomendas.zona ? ` (${esc(s.encomendas.zona)})` : ` ${pc('morada do atelier')}`),
    ral: ralHtml({ ambito: 'nacional' }),
    'privacidade.prazos': `<ul><li>${esc(PRAZOS.pedidosDeContacto.texto)}</li><li>${esc(PRAZOS.encomendas.texto)}</li><li>${esc(PRAZOS.registosTecnicos.texto)}</li></ul>`,
    'privacidade.destinatarios': `<div class="quadro" tabindex="0" role="region" aria-label="Quem recebe os dados">${destinatariosHtml({ alojamento: 'github-pages', instagram: true, facebookPage: true })}</div>`,
    'privacidade.frases': frasesPrivacidade({ instagram: true, facebookPage: true }).map((t) => `<p>${esc(t)}</p>`).join(''),
    'privacidade.direitos': `${direitos}<ul>${DIREITOS.map((x) => `<li><strong>${esc(x.nome)}</strong>: ${esc(x.descricao)}</li>`).join('')}</ul><p>Se achar que os seus dados não foram tratados como deviam, pode apresentar queixa à Comissão Nacional de Proteção de Dados (<a href="${CNPD_URL}" rel="noopener">cnpd.pt</a>).</p>`,
  };
}
const VALORES = valoresLegais();
const md = (nome) => {
  const { meta, html } = markdown(fs.readFileSync(path.join(RAIZ, 'content', 'paginas', `${nome}.md`), 'utf8'));
  return { meta, html: marcadores(html, VALORES) };
};

// ---------------------------------------------------------------- páginas de um desenho
const hoje = hojeEmLisboa();
const paginasGeradas = [];
function construir(tema) {
  const baseTema = temaUnico ? base : `${base}/${tema}`;
  const fontesCss = FONTES[tema].map((f) => fs.readFileSync(path.join(RAIZ, 'src', 'fontes', `${f}.css`), 'utf8')).join('\n').replace(/url\(\.\.\/fontes\//g, `url(${base}/assets/fontes/`);
  const css = minificar(`${fontesCss}\n${lerCss('base.css')}\n${lerCss(`tema-${tema}.css`)}`);
  const cssNome = `site-${tema}.${resumo(css)}.css`;
  fs.writeFileSync(path.join(SAIDA, 'assets', cssNome), css);
  const ctx = {
    tema, base: baseTema, baseAssets: base, baseCanonica: baseTema, origem: ORIGEM, manifesto, preVisualizacao,
    ano: hoje.slice(0, 4), css: `${base}/assets/${cssNome}`, js: `${base}/assets/${jsNome}`, fontesPreload: PRELOAD[tema],
    partilhaSite: manifesto.partilha._site,
  };
  const pastaTema = temaUnico ? SAIDA : path.join(SAIDA, tema);
  const escrever = (caminho, html) => {
    const destino = caminho.endsWith('.html') ? path.join(pastaTema, caminho) : path.join(pastaTema, caminho, 'index.html');
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, html);
    if (tema === TEMAS[0]) paginasGeradas.push(caminho);
  };
  const organizacao = { '@context': 'https://schema.org', '@type': 'Store', name: 'Love Light & Soul', description: d.site.descricao,
    url: `${ORIGEM}${baseTema}/`, logo: `${ORIGEM}${base}/assets/img/${manifesto.partilha._site}`, sameAs: [d.site.redes.instagram, d.site.redes.facebook] };
  const site = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Love Light & Soul', alternateName: 'LoveLight&Soul', url: `${ORIGEM}${baseTema}/` };
  const migalhasLd = (itens) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: itens.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it[0], item: `${ORIGEM}${baseTema}${it[1]}` })) });

  escrever('/', pagina(ctx, d, { titulo: d.site.titulo, descricao: d.site.descricao, caminho: '/', corpo: P.inicio(ctx, d), actual: 'inicio', jsonLd: [site, organizacao], classe: 'pagina-inicio' }));
  escrever('/criacoes/', pagina(ctx, d, { titulo: 'As criações', descricao: 'Velas de cera de soja, lembranças em pó cerâmico perfumado, caixas de flores, presentes e a coleção de Natal, feitos à mão.', caminho: '/criacoes/', corpo: P.criacoes(ctx, d, null), actual: 'criacoes' }));
  for (const c of d.categorias) {
    escrever(`/criacoes/${c.slug}/`, pagina(ctx, d, { titulo: `${c.nome} — feitas à mão`, descricao: c.frase, caminho: `/criacoes/${c.slug}/`, corpo: P.criacoes(ctx, d, c.slug), actual: c.slug === 'lembrancas' ? 'lembrancas' : c.slug === 'natal' ? 'natal' : 'criacoes', jsonLd: [migalhasLd([['Criações', '/criacoes/'], [c.nome, `/criacoes/${c.slug}/`]])] }));
  }
  for (const o of d.ocasioes) {
    escrever(`/ocasioes/${o.slug}/`, pagina(ctx, d, { titulo: `Lembranças de ${o.nome.toLowerCase()}`, descricao: `Lembranças e presentes para ${o.nome.toLowerCase()}, personalizados com o nome e a data: velas de soja e peças em pó cerâmico perfumado.`, caminho: `/ocasioes/${o.slug}/`, corpo: P.ocasiao(ctx, d, o), actual: 'lembrancas' }));
  }
  for (const p of d.produtos) {
    const c = d.categorias.find((k) => k.slug === p.categoria);
    escrever(`/peca/${p.slug}/`, pagina(ctx, d, {
      titulo: `${p.nome} — ${c.nome}`, descricao: p.resumo, caminho: `/peca/${p.slug}/`, corpo: P.peca(ctx, d, p), actual: p.categoria === 'lembrancas' ? 'lembrancas' : p.categoria === 'natal' ? 'natal' : 'criacoes', tipo: 'product',
      imagem: manifesto.partilha[p.slug],
      jsonLd: [{ '@context': 'https://schema.org', '@type': 'Product', name: p.nome, description: p.resumo, image: p.fotos.slice(0, 3).map((f) => { const m = manifesto.fotos[f.ficheiro]; return `${ORIGEM}${base}/assets/img/${f.ficheiro}-${m.resumo}-${m.larguras[Math.min(3, m.larguras.length - 1)]}.webp`; }), brand: { '@type': 'Brand', name: 'Love Light & Soul' } },
        migalhasLd([['Criações', '/criacoes/'], [c.nome, `/criacoes/${c.slug}/`], [p.nome, `/peca/${p.slug}/`]])],
    }));
  }
  escrever('/aromas/', pagina(ctx, d, { titulo: 'Os aromas', descricao: 'Os doze aromas das velas e peças perfumadas da Love Light & Soul, com as notas de saída, de coração e de fundo.', caminho: '/aromas/', corpo: P.aromas(ctx, d), actual: 'aromas' }));
  const hist = md('a-historia');
  const fatima = { ficheiro: 'historia-fatima', alt: 'Nossa Senhora de Fátima com os pastorinhos em pó cerâmico, numa campânula com luzes', legenda: 'A peça que fiz em homenagem ao meu pai, no dia em que a Love fez um ano.' };
  escrever('/a-historia/', pagina(ctx, d, { titulo: hist.meta.titulo, descricao: hist.meta.descricao, caminho: '/a-historia/', corpo: P.texto(ctx, d, { titulo: hist.meta.titulo, html: hist.html, foto: fatima }), actual: 'historia' }));
  const como = md('como-encomendar');
  escrever('/como-encomendar/', pagina(ctx, d, { titulo: como.meta.titulo, descricao: como.meta.descricao, caminho: '/como-encomendar/', corpo: P.texto(ctx, d, { titulo: como.meta.titulo, html: como.html }) }));
  const faq = md('perguntas-frequentes');
  escrever('/perguntas-frequentes/', pagina(ctx, d, { titulo: faq.meta.titulo, descricao: faq.meta.descricao, caminho: '/perguntas-frequentes/', corpo: P.texto(ctx, d, { titulo: faq.meta.titulo, html: faq.html, faq: true }) }));
  escrever('/contactos/', pagina(ctx, d, { titulo: 'Contactos', descricao: 'Encomendas por mensagem no Instagram e atendimento por marcação. Envio para todo o mundo.', caminho: '/contactos/', corpo: P.contactos(ctx, d, VALORES['empresa.identificacao']) }));
  escrever('/pedido/', pagina(ctx, d, { titulo: 'O meu pedido', descricao: 'As peças que escolheu, numa mensagem pronta a enviar.', caminho: '/pedido/', corpo: P.pedido(ctx, d), indexar: false }));
  for (const nome of ['termos', 'privacidade']) {
    const pg = md(nome);
    escrever(`/${nome}/`, pagina(ctx, d, { titulo: pg.meta.titulo, descricao: pg.meta.descricao, caminho: `/${nome}/`, corpo: P.texto(ctx, d, { titulo: pg.meta.titulo, html: pg.html, lead: `Atualizado a ${pg.meta.atualizado.split('-').reverse().join('/')}.` }), indexar: false }));
  }
  escrever('404.html', pagina(ctx, d, { titulo: 'Página não encontrada', descricao: 'Esta página não existe.', caminho: '/404.html', corpo: P.naoEncontrada(ctx), indexar: false }));
}
for (const t of TEMAS) construir(t);

// ---------------------------------------------------------------- robots e sitemap
if (producao) {
  const indexadas = paginasGeradas.filter((p) => !/^\/(pedido|termos|privacidade)\/$/.test(p) && p !== '404.html');
  fs.writeFileSync(path.join(SAIDA, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexadas.map((p) => `  <url><loc>${ORIGEM}${p}</loc><lastmod>${hoje}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(SAIDA, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGEM}/sitemap.xml\n`);
} else {
  fs.writeFileSync(path.join(SAIDA, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
}
fs.writeFileSync(path.join(SAIDA, '.nojekyll'), '');
const nPaginas = paginasGeradas.length;
console.log(`site: ${nPaginas} páginas × ${TEMAS.length} desenho(s) em ${path.relative(RAIZ, SAIDA) || '.'}/ (${preVisualizacao ? 'pré-visualização, noindex' : 'produção'})`);
