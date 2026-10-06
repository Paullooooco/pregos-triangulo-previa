// Pregos Triângulo: comportamento global
(function () {
  const VENDEDORES = {
    vanderlei: { nome: 'Vanderlei', fone: '5534999925646' },
    thiago: { nome: 'Thiago', fone: '5534999925626' },
  };
  const STORE_KEY = 'pt-orcamento';

  const ico = {
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.2C2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.9 1.9 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.2 1.3 15.2 0 12 0 5.4 0 .1 5.3.1 11.9c0 2.1.6 4.2 1.6 6L0 24l6.3-1.6c1.8 1 3.8 1.5 5.7 1.5 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  };

  // ---------- Navegação mobile ----------
  const toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.querySelector('.txt').textContent = open ? 'Fechar' : 'Menu';
    });
    const fecharMenu = () => {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('.txt').textContent = 'Menu';
    };
    document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', fecharMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharMenu(); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', fecharMenu);
  }

  document.querySelectorAll('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  // ---------- Toast ----------
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // ---------- Lista de orçamento ----------
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(itens)); } catch (e) { /* sem storage: segue em memória */ }
  }
  let itens = load();

  const fab = document.createElement('button');
  fab.className = 'quote-fab';
  fab.type = 'button';
  fab.setAttribute('aria-haspopup', 'dialog');
  fab.innerHTML = ico.wa + '<span class="label">Orçamento</span><span class="qcount">0</span>';
  document.body.appendChild(fab);

  const backdrop = document.createElement('div');
  backdrop.className = 'drawer-backdrop';
  document.body.appendChild(backdrop);

  const drawer = document.createElement('aside');
  drawer.className = 'drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-labelledby', 'drawer-title');
  drawer.innerHTML = `
    <div class="drawer-head">
      <h2 id="drawer-title" tabindex="-1">Lista de orçamento</h2>
      <button class="icon-btn" type="button" data-close aria-label="Fechar">${ico.close}</button>
    </div>
    <div class="drawer-body"><div class="q-list"></div></div>
    <form class="drawer-foot" novalidate>
      <div class="q-dados">
        <div class="field">
          <label for="q-nome">Nome</label>
          <input id="q-nome" name="nome" placeholder="Ex.: João" autocomplete="name" autocapitalize="words">
        </div>
        <div class="field">
          <label for="q-cidade">Cidade/UF</label>
          <input id="q-cidade" name="cidade" placeholder="Ex.: Uberaba/MG" autocomplete="address-level2" autocapitalize="words">
        </div>
      </div>
      <div class="field">
        <span class="label">Enviar para</span>
        <div class="seller-pick">
          <label><input type="radio" name="vend" value="vanderlei" checked> Vanderlei</label>
          <label><input type="radio" name="vend" value="thiago"> Thiago</label>
        </div>
      </div>
      <button class="btn btn-wa" type="submit">${ico.wa} Enviar pelo WhatsApp</button>
    </form>`;
  document.body.appendChild(drawer);

  // Lembra nome e cidade para o próximo pedido (só neste navegador)
  const DADOS_KEY = 'pt-cliente';
  function salvarDados(nome, cidade) {
    try { localStorage.setItem(DADOS_KEY, JSON.stringify({ nome, cidade })); } catch (e) { /* sem storage */ }
  }
  try {
    const d = JSON.parse(localStorage.getItem(DADOS_KEY)) || {};
    drawer.querySelector('#q-nome').value = d.nome || '';
    drawer.querySelector('#q-cidade').value = d.cidade || '';
  } catch (e) { /* sem storage */ }

  const list = drawer.querySelector('.q-list');
  let lastFocus = null;

  function openDrawer() {
    lastFocus = document.activeElement;
    document.body.classList.add('drawer-open');
    render();
    setTimeout(() => drawer.querySelector('#drawer-title').focus({ preventScroll: true }), 50);
  }
  function closeDrawer() {
    document.body.classList.remove('drawer-open');
    if (lastFocus) lastFocus.focus();
  }

  function render() {
    fab.classList.toggle('has-items', itens.length > 0);
    fab.querySelector('.qcount').textContent = itens.length;
    fab.setAttribute('aria-label', itens.length ? `Orçamento: ${itens.length} itens` : 'Pedir orçamento');

    if (!itens.length) {
      list.innerHTML = `<div class="q-empty">
        <p>Nenhum item na lista ainda.</p>
        <p style="margin-top:8px">Marque as medidas em <a href="produtos.html">Produtos</a> ou envie apenas uma mensagem. O vendedor responde pelo WhatsApp.</p>
      </div>`;
    } else {
      list.innerHTML = itens.map((it, i) => `
        <div class="q-item">
          <div><b>${it.medida}</b><small>${it.categoria}</small></div>
          <div class="q-qty">
            <input type="number" min="1" value="${it.qtd}" data-i="${i}" data-k="qtd" aria-label="Quantidade de ${it.medida}">
            <select data-i="${i}" data-k="un" aria-label="Unidade">
              ${['kg', 'cx', 'rolo'].map(u => `<option ${u === it.un ? 'selected' : ''}>${u}</option>`).join('')}
            </select>
          </div>
          <button class="q-remove" type="button" data-rm="${i}" aria-label="Remover ${it.medida}">${ico.trash}</button>
        </div>`).join('');
    }
    document.dispatchEvent(new CustomEvent('orcamento:change', { detail: itens }));
  }

  list.addEventListener('input', e => {
    const { i, k } = e.target.dataset;
    if (i === undefined) return;
    itens[i][k] = k === 'qtd' ? Math.max(1, parseInt(e.target.value, 10) || 1) : e.target.value;
    save();
  });
  list.addEventListener('click', e => {
    const btn = e.target.closest('[data-rm]');
    if (!btn) return;
    itens.splice(+btn.dataset.rm, 1);
    save();
    render();
  });

  fab.addEventListener('click', openDrawer);
  backdrop.addEventListener('click', closeDrawer);
  drawer.querySelector('[data-close]').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) closeDrawer();
  });

  drawer.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const nome = f.nome.value.trim();
    const cidade = f.cidade.value.trim();
    salvarDados(nome, cidade);
    let msg = 'Olá! Vim pelo site da Pregos Triângulo.\n';
    if (nome || cidade) msg += '\n';
    if (nome) msg += `*Nome:* ${nome}\n`;
    if (cidade) msg += `*Cidade:* ${cidade}\n`;
    if (itens.length) {
      msg += '\n*Gostaria de um orçamento para:*\n';
      msg += itens.map(it => `- ${it.categoria} ${it.medida}: ${it.qtd} ${it.un}`).join('\n');
    } else {
      msg += '\nGostaria de fazer um orçamento.';
    }
    abrirWhatsApp(f.vend.value, msg);
  });

  function abrirWhatsApp(vendedor, msg) {
    const v = VENDEDORES[vendedor] || VENDEDORES.vanderlei;
    window.open(`https://wa.me/${v.fone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  }

  window.Orcamento = {
    add(item) {
      const key = item.categoria + '|' + item.medida;
      if (itens.some(it => it.categoria + '|' + it.medida === key)) {
        showToast(`${item.medida} já está no orçamento`);
        return false;
      }
      itens.push({ qtd: 1, un: item.categoria === 'Arames' ? 'rolo' : 'kg', ...item });
      save();
      render();
      fab.classList.remove('bump');
      void fab.offsetWidth;
      fab.classList.add('bump');
      showToast(`${item.medida} adicionado ao orçamento`);
      return true;
    },
    has(categoria, medida) {
      return itens.some(it => it.categoria === categoria && it.medida === medida);
    },
    open: openDrawer,
    whatsapp: abrirWhatsApp,
  };

  document.querySelectorAll('[data-open-quote]').forEach(el =>
    el.addEventListener('click', e => { e.preventDefault(); openDrawer(); })
  );

  render();
})();

// Esconde o botão flutuante quando o rodapé (que já tem os contatos) aparece
(function () {
  const fab = document.querySelector('.quote-fab');
  const rodape = document.querySelector('.foot-contact');
  if (!fab || !rodape || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([e]) => fab.classList.toggle('hidden', e.isIntersecting || e.boundingClientRect.top < 0))
    .observe(rodape);
})();

// Rodapé: no celular as seções começam fechadas; no desktop ficam sempre abertas
(function () {
  const cols = document.querySelectorAll('.foot-col');
  if (!cols.length) return;
  const celular = window.matchMedia('(max-width: 600px)');
  const ajustar = () => cols.forEach(d => { d.open = !celular.matches; });
  cols.forEach(d => d.querySelector('summary').addEventListener('click', e => { if (!celular.matches) e.preventDefault(); }));
  celular.addEventListener('change', ajustar);
  ajustar();
})();
