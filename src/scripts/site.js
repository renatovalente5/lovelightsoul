// O JavaScript do site (sem dependências). Tudo funciona sem ele, menos o pedido, que precisa dele para guardar
// as peças escolhidas neste aparelho (localStorage) e escrever a mensagem.
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const CHAVE = 'lls-pedido';

  // ------------------------------------------------------------------ cabeçalho
  const topo = $('[data-topo]');
  if (topo) {
    const marca = () => topo.classList.toggle('descido', scrollY > 8);
    addEventListener('scroll', marca, { passive: true }); marca();
  }

  // ------------------------------------------------------------------ menu (telemóvel)
  const menu = $('#menu');
  if (menu && typeof menu.showModal === 'function') {
    $$('[data-menu-abrir]').forEach((b) => b.addEventListener('click', () => { menu.showModal(); b.setAttribute('aria-expanded', 'true'); }));
    $$('[data-menu-fechar]').forEach((b) => b.addEventListener('click', () => menu.close()));
    menu.addEventListener('close', () => $$('[data-menu-abrir]').forEach((b) => b.setAttribute('aria-expanded', 'false')));
    menu.addEventListener('click', (e) => { if (e.target === menu) menu.close(); });
    $$('a', menu).forEach((a) => a.addEventListener('click', () => menu.close()));
  }

  // ------------------------------------------------------------------ o pedido (guardado só neste aparelho)
  const lerPedido = () => { try { return JSON.parse(localStorage.getItem(CHAVE) || '[]'); } catch { return []; } };
  const gravarPedido = (p) => { try { localStorage.setItem(CHAVE, JSON.stringify(p)); } catch { /* sem armazenamento: o pedido vive só nesta página */ } contar(p); };
  function contar(p = lerPedido()) {
    const n = p.reduce((s, x) => s + 1, 0);
    $$('[data-pedido-n]').forEach((el) => { el.textContent = n; el.hidden = n === 0 && el.hasAttribute('data-esconde-zero'); });
    $$('[data-pedido-rotulo]').forEach((el) => el.setAttribute('aria-label', n === 1 ? 'O meu pedido, 1 peça' : `O meu pedido, ${n} peças`));
  }
  contar();
  addEventListener('storage', (e) => { if (e.key === CHAVE) contar(); });

  // Juntar ao pedido (ficha da peça)
  const aviso = $('[data-aviso]');
  let avisoT;
  $$('form[data-juntar]').forEach((form) => form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const item = {
      slug: form.dataset.slug, nome: form.dataset.nome, foto: form.dataset.foto || '', url: location.pathname,
      qtd: Math.max(1, parseInt(d.get('quantidade') || '1', 10) || 1),
      aroma: d.get('aroma') || '', laco: d.get('laco') || '', texto: (d.get('texto') || '').toString().trim().slice(0, 300),
    };
    const p = lerPedido();
    const igual = p.find((x) => x.slug === item.slug && x.aroma === item.aroma && x.laco === item.laco && x.texto === item.texto);
    if (igual) igual.qtd += item.qtd; else p.push(item);
    gravarPedido(p);
    if (aviso) {
      aviso.hidden = false; aviso.classList.add('visivel');
      clearTimeout(avisoT); avisoT = setTimeout(() => { aviso.classList.remove('visivel'); setTimeout(() => { aviso.hidden = true; }, 300); }, 5000);
    }
  }));

  // Página do pedido
  const listaEl = $('[data-pedido-lista]');
  if (listaEl) {
    const vazio = $('[data-pedido-vazio]'), cheio = $('[data-pedido-cheio]');
    const campos = $('[data-pedido-campos]');
    const mensagemEl = $('[data-mensagem]');
    const marca = document.documentElement.dataset.marca || 'Love Light & Soul';
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    function mensagem(p) {
      const d = campos ? new FormData(campos) : new FormData();
      const linhas = ['Olá! Gostava de encomendar:', ''];
      p.forEach((x, i) => {
        linhas.push(`${i + 1}. ${x.nome} × ${x.qtd}`);
        if (x.aroma) linhas.push(`   Aroma: ${x.aroma}`);
        if (x.laco) linhas.push(`   Laço: ${x.laco}`);
        if (x.texto) linhas.push(`   Personalização: ${x.texto}`);
      });
      const data = (d.get('data') || '').toString().trim();
      const nome = (d.get('nome') || '').toString().trim();
      const notas = (d.get('notas') || '').toString().trim();
      if (data) linhas.push('', `Data do evento ou da entrega: ${data}`);
      if (notas) linhas.push('', notas);
      if (nome) linhas.push('', nome);
      return linhas.join('\n');
    }
    function desenhar() {
      const p = lerPedido();
      if (vazio) vazio.hidden = p.length > 0;
      if (cheio) cheio.hidden = p.length === 0;
      listaEl.innerHTML = p.map((x, i) => `
        <li class="pedido-item">
          ${x.foto ? `<img src="${esc(x.foto)}" alt="" width="96" height="96" loading="lazy">` : ''}
          <div class="pedido-item__texto">
            <a href="${esc(x.url)}" class="pedido-item__nome">${esc(x.nome)}</a>
            ${[x.aroma && `Aroma: ${esc(x.aroma)}`, x.laco && `Laço: ${esc(x.laco)}`, x.texto && `«${esc(x.texto)}»`].filter(Boolean).map((t) => `<span>${t}</span>`).join('')}
          </div>
          <div class="pedido-item__qtd">
            <label class="sr" for="q${i}">Quantidade de ${esc(x.nome)}</label>
            <input id="q${i}" type="number" inputmode="numeric" min="1" max="999" value="${x.qtd}" data-i="${i}">
            <button type="button" class="pedido-item__tirar" data-tirar="${i}">Tirar<span class="sr"> ${esc(x.nome)}</span></button>
          </div>
        </li>`).join('');
      if (mensagemEl) mensagemEl.textContent = mensagem(p);
      contar(p);
    }
    listaEl.addEventListener('change', (e) => {
      const i = e.target.dataset.i; if (i === undefined) return;
      const p = lerPedido(); p[i].qtd = Math.max(1, parseInt(e.target.value, 10) || 1); gravarPedido(p); desenhar();
    });
    listaEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tirar]'); if (!b) return;
      const p = lerPedido(); p.splice(+b.dataset.tirar, 1); gravarPedido(p); desenhar();
      const foco = $('input', listaEl) || $('[data-pedido-vazio] a'); if (foco) foco.focus();
    });
    if (campos) campos.addEventListener('input', () => { if (mensagemEl) mensagemEl.textContent = mensagem(lerPedido()); });
    $$('[data-enviar]').forEach((b) => b.addEventListener('click', async (e) => {
      const texto = mensagem(lerPedido());
      const tipo = b.dataset.enviar;
      if (tipo === 'whatsapp' || tipo === 'email') {
        const base = b.dataset.url;
        b.href = tipo === 'whatsapp' ? `${base}?text=${encodeURIComponent(texto)}` : `${base}?subject=${encodeURIComponent('Pedido — ' + marca)}&body=${encodeURIComponent(texto)}`;
        return; // segue a ligação
      }
      // Instagram e Facebook não aceitam texto na ligação: copia-se a mensagem e abre-se a conversa.
      e.preventDefault();
      let copiado = false;
      try { await navigator.clipboard.writeText(texto); copiado = true; } catch { /* sem permissão */ }
      const nota = $('[data-copiado]');
      if (nota) { nota.hidden = false; nota.textContent = copiado ? 'Mensagem copiada. Na conversa, cole-a e envie.' : 'Não consegui copiar: selecione a mensagem acima e copie-a.'; }
      setTimeout(() => { location.href = b.href; }, copiado ? 700 : 2500);
    }));
    const copiar = $('[data-copiar]');
    if (copiar) copiar.addEventListener('click', async () => {
      const nota = $('[data-copiado]');
      try { await navigator.clipboard.writeText(mensagem(lerPedido())); if (nota) { nota.hidden = false; nota.textContent = 'Mensagem copiada.'; } } catch { if (nota) { nota.hidden = false; nota.textContent = 'Selecione a mensagem e copie-a.'; } }
    });
    const limpar = $('[data-limpar]');
    if (limpar) limpar.addEventListener('click', () => { gravarPedido([]); desenhar(); });
    desenhar();
  }

  // ------------------------------------------------------------------ galeria da peça
  $$('[data-galeria]').forEach((g) => {
    const fila = $('[data-galeria-fila]', g);
    const minis = $$('[data-galeria-ir]', g);
    if (!fila || !minis.length) return;
    const marcar = (i) => minis.forEach((m, k) => m.setAttribute('aria-current', k === i ? 'true' : 'false'));
    minis.forEach((m, i) => m.addEventListener('click', () => {
      const alvo = fila.children[i];
      fila.scrollTo({ left: alvo.offsetLeft - fila.offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      marcar(i);
    }));
    let t;
    fila.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(() => marcar(Math.round(fila.scrollLeft / fila.clientWidth)), 80); }, { passive: true });
    marcar(0);
  });

  // ------------------------------------------------------------------ separadores que são páginas: não voltar ao topo
  const sep = $('[data-separadores]');
  if (sep) {
    const ul = $('ul', sep);
    $$('a', sep).forEach((a) => a.addEventListener('click', (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      try { sessionStorage.setItem('lls-lugar', JSON.stringify({ para: new URL(a.href).pathname, topo: sep.getBoundingClientRect().top, esq: ul ? ul.scrollLeft : 0, t: Date.now() })); } catch { /* ignora */ }
    }));
    if (ul && !document.documentElement.hasAttribute('data-lugar')) {
      const actual = $('[aria-current="page"]', ul);
      if (actual) ul.scrollLeft = actual.offsetLeft - (ul.clientWidth - actual.offsetWidth) / 2;
    }
  }
})();
