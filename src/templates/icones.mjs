// Ícones de traço (24×24), desenhados aqui: sem bibliotecas nem pedidos a terceiros.
const svg = (corpo, extra = '') => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${extra}>${corpo}</svg>`;

export const icones = {
  saco: svg('<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  fechar: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  seta: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  setaPequena: svg('<path d="M9 6l6 6-6 6"/>'),
  setaVoltar: svg('<path d="M15 6l-6 6 6 6"/>'),
  instagram: svg('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor" stroke="none"/>'),
  facebook: svg('<path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V20H14v-5.5h2.5L17 11h-3V9a.5.5 0 0 1 .5-.5Z"/>'),
  whatsapp: svg('<path d="M4.5 19.5l1.2-3.7A7.8 7.8 0 1 1 8.4 18.4l-3.9 1.1Z"/><path d="M9.2 8.6c.2-.5.6-.5.9-.5h.4c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .5-.1.6l-.5.6c.6 1.1 1.5 2 2.6 2.6l.6-.5c.2-.2.4-.2.6-.1l1.4.6c.3.1.4.3.4.5v.4c0 .3 0 .7-.5.9-.6.3-1.6.4-3.2-.4a8.6 8.6 0 0 1-3.6-3.6c-.8-1.6-.7-2.6-.4-3.2Z"/>'),
  email: svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/>'),
  mensagem: svg('<path d="M4 18.5V7a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 7v7a2.5 2.5 0 0 1-2.5 2.5H8L4 18.5Z"/>'),
  copiar: svg('<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>'),
  vela: svg('<path d="M8 10h8v10H8z"/><path d="M12 10V8"/><path d="M12 3.5c1.4 1.4 1.6 2.6.9 3.6a1.1 1.1 0 0 1-1.8 0c-.7-1-.5-2.2.9-3.6Z"/>'),
  folha: svg('<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z"/><path d="M5 19 13 11"/>'),
  pena: svg('<path d="M19 5c-6 0-11 5-11 11v3h3c6 0 11-5 11-11V5h-3Z"/><path d="M8 16 15 9"/>'),
  caixa: svg('<path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"/><path d="M4 8.5 12 13l8-4.5M12 13v7"/>'),
  marcacao: svg('<rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
  local: svg('<path d="M12 20.5s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11Z"/><circle cx="12" cy="9.5" r="2.3"/>'),
  certo: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  livro: svg('<path d="M5 4.5h10.5A2.5 2.5 0 0 1 18 7v12.5H7.5A2.5 2.5 0 0 1 5 17V4.5Z"/><path d="M5 17a2.5 2.5 0 0 1 2.5-2.5H18"/>'),
  aspas: '<svg viewBox="0 0 32 24" width="32" height="24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M0 24V14C0 6.8 3.6 1.9 10.8 0l1.6 3C8.4 4.6 6.6 7.3 6.4 11H12v13H0Zm18 0V14c0-7.2 3.6-12.1 10.8-14l1.6 3c-4 1.6-5.8 4.3-6 8H30v13H18Z"/></svg>',
};
