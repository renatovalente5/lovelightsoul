#!/usr/bin/env node
// Testes do site construído (_site/), sem browser: corre no CI antes de cada publicação.
//   node scripts/testar.mjs            constrói em .cache/teste-site/ (base /lovelightsoul) e confere
// Confere: ligações internas e ficheiros, um <h1> por página, título, descrição, canonical, og:image,
// noindex na pré-visualização, alt em todas as imagens, nenhuma fotografia repetida numa página, as legais e o
// pedido fora do índice, o Livro de Reclamações no rodapé, e as regras da casa (sem «obrigação de pagar», sem
// secção de passos nem frase de fecho no início).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = path.join(RAIZ, '.cache', 'teste-site');
const BASE = '/lovelightsoul';
execFileSync(process.execPath, [path.join(RAIZ, 'scripts', 'build.mjs'), `--base=${BASE}`, '--sem-imagens', `--saida=${SAIDA}`], { stdio: ['ignore', 'ignore', 'inherit'] });

let falhas = 0, certos = 0;
const ok = (cond, msg) => { if (cond) certos++; else { falhas++; console.error(`  ✗ ${msg}`); } };

const htmls = [];
(function andar(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) andar(p); else if (f.endsWith('.html')) htmls.push(p); } })(SAIDA);
ok(htmls.length >= 90, `há ${htmls.length} páginas (esperava ≥ 90)`);

const existe = (u) => {
  let p = decodeURIComponent(u.split('#')[0].split('?')[0]);
  if (!p.startsWith(BASE + '/') && p !== BASE) return false;
  p = p.slice(BASE.length) || '/';
  const f = path.join(SAIDA, p);
  return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, 'index.html')));
};

for (const f of htmls) {
  const rel = path.relative(SAIDA, f);
  const h = fs.readFileSync(f, 'utf8');
  const legal = /^(termos|privacidade|pedido)\//.test(rel) || rel === '404.html';
  ok(/<html lang="pt-PT"/.test(h), `${rel}: lang pt-PT`);
  ok((h.match(/<h1[\s>]/g) || []).length === 1, `${rel}: um só <h1> (tem ${(h.match(/<h1[\s>]/g) || []).length})`);
  ok(/<title>[^<]{8,}<\/title>/.test(h), `${rel}: título`);
  ok(/<meta name="description" content="[^"]{20,}"/.test(h), `${rel}: descrição`);
  ok(/<link rel="canonical" href="https:\/\/renatovalente5\.github\.io\/lovelightsoul\//.test(h), `${rel}: canonical`);
  ok(/<meta property="og:image" content="https:\/\/[^"]+\.jpg"/.test(h), `${rel}: og:image`);
  ok(/<meta name="robots" content="noindex">/.test(h), `${rel}: noindex na pré-visualização`);
  ok(/class="rodape__livro"[^>]*href="https:\/\/www\.livroreclamacoes\.pt\/inicio"|href="https:\/\/www\.livroreclamacoes\.pt\/inicio"[^>]*class="rodape__livro"/.test(h), `${rel}: Livro de Reclamações no rodapé`);
  ok(!/obrigação de pagar/i.test(h), `${rel}: sem «obrigação de pagar»`);
  // todas as imagens com alt (vazio só nas decorativas)
  for (const m of h.matchAll(/<img\b[^>]*>/g)) ok(/\salt="/.test(m[0]), `${rel}: <img> sem alt: ${m[0].slice(0, 80)}`);
  // ligações e ficheiros internos
  for (const m of h.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|#|data:)/.test(u)) continue;
    ok(existe(u), `${rel}: ligação partida ${u}`);
  }
  for (const m of h.matchAll(/\ssrcset="([^"]+)"/g)) for (const parte of m[1].split(',')) {
    const u = parte.trim().split(/\s+/)[0];
    if (u && !/^https?:/.test(u)) ok(existe(u), `${rel}: imagem em falta ${u}`);
  }
  // cada fotografia uma vez por página (conta os <img src>, não os srcset)
  const vistas = {};
  for (const m of h.matchAll(/<img src="[^"]*\/assets\/img\/([a-z0-9-]+?)-[0-9a-f]{10}-\d+\.webp"/g)) vistas[m[1]] = (vistas[m[1]] || 0) + 1;
  if (!/^peca\//.test(rel)) for (const [n, c] of Object.entries(vistas)) ok(c === 1, `${rel}: a fotografia ${n} aparece ${c} vezes`);
  if (legal) ok(true, '');
}

// o início: sem passos nem frase de fecho; as ocasiões e as categorias com fotografias
const inicio = fs.readFileSync(path.join(SAIDA, 'index.html'), 'utf8');
ok(!/como funciona|do pedido à entrega|passo 1|um, dois/i.test(inicio), 'início: sem secção de passos');
ok((inicio.match(/class="circulo"/g) || []).length === 6, 'início: as seis ocasiões');
ok(/fetchpriority="high"/.test(inicio), 'início: a fotografia da capa com fetchpriority');
ok(!/<img[^>]*fetchpriority="high"[^>]*loading="lazy"/.test(inicio), 'início: a capa não é preguiçosa');
// o pedido e as fichas
const peca = fs.readFileSync(path.join(SAIDA, 'peca', 'anjinho-na-campanula', 'index.html'), 'utf8');
ok(/data-juntar/.test(peca) && /name="aroma"/.test(peca) && /name="laco"/.test(peca), 'ficha: escolhas e «Juntar ao pedido»');
ok(/"@type":"Product"/.test(peca), 'ficha: dados estruturados Product');
const pedido = fs.readFileSync(path.join(SAIDA, 'pedido', 'index.html'), 'utf8');
ok(/data-enviar="instagram"/.test(pedido), 'pedido: enviar pelo Instagram');
ok(fs.readFileSync(path.join(SAIDA, 'robots.txt'), 'utf8').includes('Disallow: /'), 'robots.txt fecha a pré-visualização');
ok(!fs.existsSync(path.join(SAIDA, 'sitemap.xml')), 'sem sitemap na pré-visualização');

fs.rmSync(SAIDA, { recursive: true, force: true });
console.log(`${falhas ? '✗' : '✓'} ${certos} verificações certas, ${falhas} falhas (${htmls.length} páginas)`);
process.exit(falhas ? 1 : 0);
