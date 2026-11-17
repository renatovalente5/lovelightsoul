// Utilitários do gerador: escapar, Markdown curto, datas em Lisboa e os marcadores {{…}}.

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function hojeEmLisboa(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const mesPorExtenso = (aaaamm) => { const [a, m] = String(aaaamm).split('-').map(Number); return `${MESES[m - 1]} de ${a}`; };
export const dataPorExtenso = (iso) => { const [a, m, d] = String(iso).split('-').map(Number); return `${d} de ${MESES[m - 1]} de ${a}`; };

// Texto em linha: **negrito**, *itálico*, [ligação](url). Escapa tudo o resto.
export function emLinha(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);
}

// Markdown curto das páginas: cabeçalho «---» com chave: valor, ## e ### títulos, parágrafos, listas «- ».
// Um marcador sozinho num parágrafo ({{x}}) também é parágrafo (lição da Dream Art: o <p> perdia-se).
export function markdown(texto) {
  let corpo = texto.replace(/\r\n/g, '\n');
  const meta = {};
  const m = /^---\n([\s\S]*?)\n---\n/.exec(corpo);
  if (m) {
    for (const linha of m[1].split('\n')) {
      const i = linha.indexOf(':');
      if (i > 0) meta[linha.slice(0, i).trim()] = linha.slice(i + 1).trim();
    }
    corpo = corpo.slice(m[0].length);
  }
  const blocos = corpo.trim().split(/\n{2,}/);
  const html = [];
  for (const b of blocos) {
    const t = b.trim();
    if (!t) continue;
    let h;
    if ((h = /^(#{2,3}) (.+)$/.exec(t))) {
      html.push(`<h${h[1].length}>${emLinha(h[2])}</h${h[1].length}>`);
    } else if (/^\d+\. /.test(t)) {
      const itens = t.split(/\n(?=\d+\. )/).map((l) => `<li>${emLinha(l.replace(/^\d+\. /, '').replace(/\n/g, ' '))}</li>`);
      html.push(`<ol>${itens.join('')}</ol>`);
    } else if (/^- /.test(t)) {
      const itens = t.split(/\n(?=- )/).map((l) => `<li>${emLinha(l.replace(/^- /, '').replace(/\n/g, ' '))}</li>`);
      html.push(`<ul>${itens.join('')}</ul>`);
    } else {
      html.push(`<p>${emLinha(t.replace(/\n/g, ' '))}</p>`);
    }
  }
  return { meta, html: html.join('\n') };
}

// Marcadores {{chave}} depois do Markdown (o valor já vem em HTML).
export function marcadores(html, valores) {
  return html.replace(/\{\{([a-z.]+)\}\}/gi, (todo, k) => {
    if (!(k in valores)) throw new Error(`Marcador desconhecido: ${todo}`);
    return valores[k];
  });
}

// «a, b e c»
export function lista(itens) {
  const a = itens.filter(Boolean);
  if (a.length <= 1) return a.join('');
  return `${a.slice(0, -1).join(', ')} e ${a[a.length - 1]}`;
}
