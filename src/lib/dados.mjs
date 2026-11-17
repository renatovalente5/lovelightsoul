// Lê o conteúdo (content/) e confere-o. Um problema que estraga uma página pára a construção; o que só falta
// (dados legais, contactos por confirmar) avisa e sai como lembrete «[por confirmar: …]» no site de ensaio.
import fs from 'node:fs';
import path from 'node:path';

const ler = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

export function carregar(CONTEUDO, FOTOS) {
  const erros = [], avisos = [];
  const site = ler(path.join(CONTEUDO, 'site.json'));
  const categorias = ler(path.join(CONTEUDO, 'categorias.json'));
  const ocasioes = ler(path.join(CONTEUDO, 'ocasioes.json'));
  const aromas = ler(path.join(CONTEUDO, 'aromas.json'));
  const lojas = ler(path.join(CONTEUDO, 'lojas.json'));
  const opinioes = ler(path.join(CONTEUDO, 'opinioes.json'));
  const inicio = fs.existsSync(path.join(CONTEUDO, 'inicio.json')) ? ler(path.join(CONTEUDO, 'inicio.json')) : {};
  const fotosExistem = new Set(fs.readdirSync(FOTOS).filter((f) => f.endsWith('.jpg')).map((f) => f.slice(0, -4)));
  const slugsCat = new Set(categorias.map((c) => c.slug));
  const slugsOc = new Set(ocasioes.map((o) => o.slug));
  const nomesAroma = new Set(aromas.map((a) => a.nome));

  const pasta = path.join(CONTEUDO, 'produtos');
  const produtos = fs.readdirSync(pasta).filter((f) => f.endsWith('.json')).map((f) => {
    const slug = f.slice(0, -5);
    const p = { slug, ...ler(path.join(pasta, f)) };
    const onde = `Peças › ${p.nome || slug}`;
    if (!p.nome) erros.push(`${onde}: falta o nome`);
    if (!slugsCat.has(p.categoria)) erros.push(`${onde}: a categoria «${p.categoria}» não existe`);
    for (const o of p.ocasioes || []) if (!slugsOc.has(o)) erros.push(`${onde}: a ocasião «${o}» não existe`);
    if (!p.fotos?.length) erros.push(`${onde}: sem fotografias`);
    for (const ft of p.fotos || []) {
      if (!fotosExistem.has(ft.ficheiro)) erros.push(`${onde}: a fotografia «${ft.ficheiro}» não está em media/fotos`);
      if (!(ft.alt || '').trim()) erros.push(`${onde}: a fotografia «${ft.ficheiro}» não tem descrição`);
    }
    if (!(p.resumo || '').trim()) erros.push(`${onde}: falta o resumo`);
    if ((p.resumo || '').length > 110) avisos.push(`${onde}: o resumo tem ${p.resumo.length} letras (o cartão mostra ~100)`);
    return p;
  }).filter((p) => p.publicado !== false)
    .sort((a, b) => categorias.findIndex((c) => c.slug === a.categoria) - categorias.findIndex((c) => c.slug === b.categoria) || (a.ordem ?? 999) - (b.ordem ?? 999));

  for (const c of [...categorias, ...ocasioes]) if (!fotosExistem.has(c.foto)) erros.push(`Categorias e ocasiões › ${c.nome}: a fotografia «${c.foto}» não está em media/fotos`);
  for (const a of aromas) if (a.notas && a.notas.length !== 3) erros.push(`Aromas › ${a.nome}: as notas são três (saída, coração, fundo)`);
  if (nomesAroma.size !== aromas.length) erros.push('Aromas: há nomes repetidos');

  const e = site.empresa || {};
  for (const [k, nome] of [['nome', 'o nome ou a firma'], ['nif', 'o NIF'], ['morada', 'a morada']]) if (!e[k]) avisos.push(`Dados legais: falta ${nome} (vai como «por confirmar»)`);
  if (!site.contactos.whatsapp && !site.contactos.email) avisos.push('Contactos: sem WhatsApp nem email; os pedidos seguem só pelo Instagram');

  return { site, categorias, ocasioes, aromas, lojas, opinioes, inicio, produtos, erros, avisos };
}
