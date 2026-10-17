'use strict';

/* =====================================================================
   1. BASE DE DATOS SIMULADA
   Todos los precios son Number (MXN, aproximados). Se formatean solo al renderizar.
   t = presupuestos donde aplica (eco | mid | high), u = usos (basic | work | gaming)
   ===================================================================== */
const row = (brand, big, detail, price, t = [], u = [], x = {}) => ({ brand, big, detail, price, t, u, ...x });
const ALL_T = ['eco', 'mid', 'high'];
const ALL_U = ['basic', 'work', 'gaming'];

const DB = {
  // igpu: trae gráficos integrados | ram: tipo de memoria que usa su plataforma
  cpu: [
    row('Intel', 'Core i3', '12100', 2900, ['eco'], ['basic', 'work'], { igpu: true, ram: 'DDR4' }),
    row('AMD', 'Ryzen 5', '5600G', 3300, ['eco'], ['basic', 'work'], { igpu: true, ram: 'DDR4' }),
    row('AMD', 'Ryzen 5', '5500', 2300, ['eco'], ['gaming'], { ram: 'DDR4' }),
    row('Intel', 'Core i3', '12100F', 2300, ['eco'], ['gaming'], { ram: 'DDR4' }),
    row('Intel', 'Core i5', '12400', 4200, ['mid'], ['basic', 'work'], { igpu: true, ram: 'DDR4' }),
    row('AMD', 'Ryzen 5', '7600', 5300, ['mid'], ALL_U, { igpu: true, ram: 'DDR5' }),
    row('Intel', 'Core i5', '12400F', 3500, ['mid'], ['gaming'], { ram: 'DDR4' }),
    row('AMD', 'Ryzen 5', '5600', 3000, ['mid'], ['gaming'], { ram: 'DDR4' }),
    row('AMD', 'Ryzen 7', '7700', 6900, ['high'], ALL_U, { igpu: true, ram: 'DDR5' }),
    row('Intel', 'Core i7', '14700K', 9800, ['high'], ['work', 'gaming'], { igpu: true, ram: 'DDR5' }),
    row('AMD', 'Ryzen 7', '7800X3D', 9500, ['high'], ['gaming'], { igpu: true, ram: 'DDR5' }),
  ],
  gpu: [
    row('Procesador', 'Integrada', 'Ya viene incluida', 0, ALL_T, ['basic', 'work'], { integrated: true }),
    row('NVIDIA', 'GTX 1650', '4 GB', 3300, ['eco'], ['gaming']),
    row('AMD', 'RX 6500 XT', '4 GB', 3000, ['eco'], ['gaming']),
    row('NVIDIA', 'RTX 3060', '12 GB', 6500, ['mid'], ['gaming']),
    row('AMD', 'RX 7600', '8 GB', 6000, ['mid'], ['gaming']),
    row('NVIDIA', 'RTX 4060', '8 GB', 7200, ['mid'], ['gaming']),
    row('NVIDIA', 'RTX 4060 Ti', '8 GB', 9500, ['high'], ['work', 'gaming']),
    row('AMD', 'RX 7800 XT', '16 GB', 12500, ['high'], ['gaming']),
    row('NVIDIA', 'RTX 4070 Super', '12 GB', 15500, ['high'], ['gaming']),
  ],
  ram: [
    row('Kingston', '16 GB', 'DDR4 3200 MHz', 3200, ['eco', 'mid'], ALL_U, { type: 'DDR4' }),
    row('Corsair', '16 GB', 'DDR4 3200 MHz', 3600, ['eco', 'mid'], ALL_U, { type: 'DDR4' }),
    row('Crucial', '16 GB', 'DDR4 3200 MHz', 3400, ['eco', 'mid'], ALL_U, { type: 'DDR4' }),
    row('Kingston', '16 GB', 'DDR5 5600 MHz', 5200, ['mid', 'high'], ALL_U, { type: 'DDR5' }),
    row('Corsair', '32 GB', 'DDR5 6000 MHz', 9500, ['high'], ['work', 'gaming'], { type: 'DDR5' }),
  ],
  ssd: [
    row('Kingston', '500 GB', 'NV2 NVMe', 900, ['eco'], ALL_U),
    row('WD', '1 TB', 'Blue SN580 NVMe', 1500, ['eco', 'mid'], ALL_U),
    row('Crucial', '1 TB', 'P3 Plus NVMe', 1600, ['mid'], ALL_U),
    row('WD', '1 TB', 'Black SN770 NVMe', 1900, ['mid', 'high'], ALL_U),
    row('Samsung', '2 TB', '990 EVO Plus NVMe', 3500, ['high'], ALL_U),
  ],
};

// PC genérica que se muestra cuando no hay combinación exacta
const FALLBACK = {
  cpu: row('Intel', 'Core i5', '12400', 4200),
  gpu: row('Procesador', 'Integrada', 'Ya viene incluida', 0),
  ram: row('Kingston', '16 GB', 'DDR4 3200 MHz', 3200),
  ssd: row('WD', '1 TB', 'Blue SN580 NVMe', 1500),
};

const PARTS = [
  ['cpu', '🧠', 'Procesador', 'Es el cerebro: piensa y decide qué tan rápido va todo.'],
  ['gpu', '🎮', 'Tarjeta de video', 'Dibuja las imágenes: juegos, videos y diseño.'],
  ['ram', '⚡', 'Memoria RAM', 'Es tu mesa de trabajo: más espacio, más cosas abiertas a la vez.'],
  ['ssd', '💾', 'Almacenamiento', 'Es el armario donde guardas programas, fotos y archivos.'],
];

const OPTIONS = {
  use: [
    { id: 'gaming', icon: '🎮', label: 'Jugar', hint: 'Videojuegos sin trabas' },
    { id: 'work', icon: '💻', label: 'Trabajar / Estudiar', hint: 'Tareas, clases y oficina' },
    { id: 'basic', icon: '🌐', label: 'Uso básico', hint: 'Internet, videos y chats' },
    { id: 'create', icon: '🎨', label: 'Diseño y video', hint: 'Fotos, edición y animación' },
    { id: 'code', icon: '👨‍💻', label: 'Programar', hint: 'Código y proyectos' },
    { id: 'kids', icon: '🧒', label: 'Niños y familia', hint: 'Dibujos, juegos suaves y tareas' },
  ],
  device: [
    { id: 'pc', icon: '🖥️', label: 'PC de escritorio', hint: 'Más potencia por tu dinero' },
    { id: 'laptop', icon: '💻', label: 'Laptop', hint: 'Te la llevas a todos lados' },
  ],
  profile: [
    { id: 'student', icon: '🎓', label: 'Estudiar', hint: 'Escuela, universidad o cursos' },
    { id: 'work', icon: '💼', label: 'Trabajar', hint: 'Oficina o trabajo desde casa' },
    { id: 'home', icon: '🏠', label: 'Hogar', hint: 'Para toda la familia' },
    { id: 'business', icon: '🏢', label: 'Empresa o negocio', hint: 'Equipos para un equipo de trabajo' },
  ],
  budget: [
    { id: 'eco', icon: '🪙', label: 'Económico', hint: 'Cuidando cada peso' },
    { id: 'mid', icon: '⚖️', label: 'Intermedio', hint: 'Buen equilibrio' },
    { id: 'high', icon: '🚀', label: 'Alto', hint: 'Lo mejor para rendir más' },
  ],
};

/* =====================================================================
   2. FORMATO (solo capa de render)
   ===================================================================== */
const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const labelOf = (key, id) => (OPTIONS[key].find(o => o.id === id) || { label: '' }).label.toLowerCase();

/* =====================================================================
   3. MOTOR DE RECOMENDACIÓN
   ===================================================================== */
// Usos nuevos que reutilizan el catálogo de otro uso con necesidades parecidas
const POOL = { create: 'gaming', code: 'work', kids: 'basic' };
// La barra de presupuesto cambia de escala según el equipo (cut = cortes entre niveles)
const RANGE = {
  pc: { min: 8000, max: 40000, cut: [12000, 22000], val: { eco: 10000, mid: 17000, high: 30000 } },
  laptop: { min: 8000, max: 80000, cut: [18000, 35000], val: { eco: 13000, mid: 26000, high: 55000 } },
};
const dev = () => state.device || 'pc';
const tierOf = v => { const [a, b] = RANGE[dev()].cut; return v <= a ? 'eco' : v <= b ? 'mid' : 'high'; };
const pick = list => list[Math.floor(Math.random() * list.length)];
const fits = (item, budget, use) => item.t.includes(budget) && item.u.includes(use);
const keyOf = b => PARTS.map(([k]) => `${b[k].brand}${b[k].big}${b[k].detail}`).join('|');
const totalOf = b => PARTS.reduce((sum, [k]) => sum + b[k].price, 0);

function pickBuild(use, budget) {
  const cpu = pick(DB.cpu.filter(p => fits(p, budget, use)));
  if (!cpu) return null;
  // Sin gráficos integrados en el procesador, la tarjeta de video es obligatoria
  const gpu = pick(DB.gpu.filter(p => fits(p, budget, use) && (cpu.igpu || !p.integrated)));
  // La RAM debe ser compatible con la plataforma del procesador (DDR4 o DDR5)
  const ram = pick(DB.ram.filter(p => fits(p, budget, use) && p.type === cpu.ram));
  const ssd = pick(DB.ssd.filter(p => fits(p, budget, use)));
  return gpu && ram && ssd ? { cpu, gpu, ram, ssd } : null;
}

function recommend(use, budget, lastKey = '') {
  let build = null;
  try {
    for (let i = 0; i < 8; i++) {            // evita repetir la misma combinación seguida
      const next = pickBuild(POOL[use] || use, budget);
      if (!next) break;
      build = next;
      if (keyOf(next) !== lastKey) break;
    }
  } catch (err) {
    console.error(err);
    build = null;
  }
  return build ? { ...build, fallback: false } : { ...FALLBACK, fallback: true };
}

/* =====================================================================
   4. ESTADO Y VISTAS
   ===================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const state = { device: null, profile: null, field: null, auto: false, use: null, budget: null, last: '', timer: null, build: null };
const STEP = { welcome: 0, device: 15, profile: 25, field: 35, use: 50, budget: 70, loading: 85, results: 100 };

function show(name) {
  $$('.view').forEach(v => {
    const on = v.dataset.view === name;
    v.hidden = !on;
    v.classList.toggle('active', on);
  });
  const title = $(`.view[data-view="${name}"] .title`);
  if (title) title.focus({ preventScroll: true });
  $('#bar').style.width = STEP[name] + '%';
  window.scrollTo({ top: 0 });
}

function syncNext() {
  $('[data-action="next-device"]').disabled = !state.device;
  $('[data-action="next-profile"]').disabled = !state.profile;
  $('[data-action="next-field"]').disabled = !state.field;
  $('[data-action="next-use"]').disabled = !state.use;
  $('[data-action="next-budget"]').disabled = !state.budget;
}

function renderOptions(key) {
  $(`#opts-${key}`).innerHTML = OPTIONS[key].map(o => `
    <button type="button" class="opt" data-key="${key}" data-value="${o.id}" aria-pressed="false">
      <span class="opt-icon" aria-hidden="true">${o.icon}</span>
      <span class="opt-text"><strong>${o.label}</strong><small>${o.hint}</small></span>
    </button>`).join('');
}

function choose(key, value) {
  state[key] = value;
  if (key === 'profile') state.field = null;
  if (key === 'use') { state.auto = false; $('#use-hint').hidden = true; }
  if (key === 'device') {
    const r = RANGE[value], rng = $('#budget-range');
    Object.assign(rng, { min: r.min, max: r.max, value: r.val.mid });
    state.budget = null;
    $$('.opt[data-key="budget"]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    $('#range-out').textContent = 'Mueve la barra o elige una opción';
  }
  if (key === 'budget') {
    const rng = $('#budget-range');
    if (tierOf(Number(rng.value)) !== value) rng.value = RANGE[dev()].val[value];
    $('#range-out').textContent = mxn.format(Number(rng.value));
  }
  $$(`.opt[data-key="${key}"]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === value)));
  syncNext();
}

function reset() {
  clearTimeout(state.timer);                 // cancela un análisis en curso
  Object.assign(state, { device: null, profile: null, field: null, auto: false, use: null, budget: null, last: '' });
  $$('.opt').forEach(b => b.setAttribute('aria-pressed', 'false'));
  syncNext();
  $('#use-hint').hidden = true;
  Object.assign($('#budget-range'), { min: 8000, max: 40000, value: 17000 });
  $('#range-out').textContent = 'Mueve la barra o elige una opción';
  show('welcome');
}

function analyze() {
  if (!state.use || !state.budget) return;
  show('loading');
  clearTimeout(state.timer);
  state.timer = setTimeout(() => showResults(false), 1500 + Math.random() * 500);
}

function showResults(reroll) {
  if (state.device === 'laptop') return showLaptops(reroll);
  state.build = recommend(state.use, state.budget, reroll ? state.last : '');
  state.last = keyOf(state.build);
  paint(state.build);
  show('results');
}

function paint(build) {

  $('#summary').textContent = build.fallback
    ? 'No encontré una combinación exacta, pero esta PC equilibrada te va a funcionar muy bien.'
    : `Para ${labelOf('use', state.use)}, con presupuesto ${labelOf('budget', state.budget)}.`;

  $('#cards').innerHTML = PARTS.map(([k, icon, name, help]) => {
    const p = build[k];
    const swapBtn = !build.fallback && k !== 'cpu'
      ? `<button type="button" class="swap" data-action="swap" data-part="${k}" aria-label="Probar otra pieza: ${name}">Probar otra</button>` : '';
    const link = p.price
      ? `<a class="ml" href="https://listado.mercadolibre.com.mx/${slug(`${p.brand} ${p.big} ${p.detail}`)}" target="_blank" rel="noopener">Ver en Mercado Libre</a>`
      : '';
    return `
      <article class="card" data-part="${k}">
        <span class="part-icon" aria-hidden="true">${icon}</span>
        <h3>${name}</h3>
        <p class="maker">${p.brand}</p>
        <p class="big">${p.big}</p>
        <p class="detail">${p.detail}</p>
        <p class="price">${p.price ? mxn.format(p.price) : 'Incluida'}</p>
        <p class="help">${help}</p>
        ${link}
        ${swapBtn}
      </article>`;
  }).join('');

  $('#total').textContent = mxn.format(totalOf(build));
  $('#total-line').hidden = false;
  $('#note').textContent = PC_NOTE;
  $('#cards').classList.remove('three');
}

const bump = el => { if (!el) return; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); };

// Cambia una sola pieza manteniendo la compatibilidad (RAM con su plataforma, video si no hay integrada)
function swap(part, btn) {
  const b = state.build;
  if (!b || b.fallback) return;
  const use = POOL[state.use] || state.use;
  const list = DB[part].filter(p => p !== b[part] && fits(p, state.budget, use)
    && (part !== 'ram' || p.type === b.cpu.ram)
    && (part !== 'gpu' || b.cpu.igpu || !p.integrated));
  if (!list.length) { btn.textContent = 'No hay más opciones'; btn.disabled = true; return; }
  state.build = { ...b, [part]: pick(list) };
  state.last = keyOf(state.build);
  paint(state.build);
  bump($(`.card[data-part="${part}"]`));
  bump($('#total'));
}

/* =====================================================================
   5. TEMA CAMALEÓN
   ===================================================================== */
const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: light)');
const currentTheme = () => root.dataset.theme || (media.matches ? 'light' : 'dark');

function paintThemeButton() {
  const light = currentTheme() === 'light';
  const btn = $('#theme');
  btn.textContent = light ? '🌙' : '☀️';
  btn.setAttribute('aria-label', light ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
}

function toggleTheme() {
  const next = currentTheme() === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  try { localStorage.setItem('pcr-theme', next); } catch (e) { /* sin almacenamiento */ }
  paintThemeButton();
}

/* =====================================================================
   6. EVENTOS E INICIO
   ===================================================================== */
/* =====================================================================
   LAPTOPS: catálogo y motor (precios Number en MXN, aproximados)
   t = presupuesto, u = usos, p = perfiles (student | work | home | business)
   ===================================================================== */
const lap = (brand, big, detail, price, t, u, p) => row(brand, big, detail, price, [t], u.split(' '), { p: p.split(' ') });
const LAPTOPS = [
  lap('Acer', 'Aspire 3', 'Ryzen 5, 8 GB RAM, 512 GB', 9500, 'eco', 'basic kids work', 'student home'),
  lap('ASUS', 'Vivobook Go 15', 'Ryzen 5, 16 GB RAM, 512 GB', 11900, 'eco', 'basic work kids', 'student home'),
  lap('Lenovo', 'IdeaPad Slim 3', 'Core i5, 16 GB RAM, 512 GB', 12500, 'eco', 'basic work kids code', 'student home work'),
  lap('Dell', 'Inspiron 15', 'Core i5, 16 GB RAM, 512 GB', 14500, 'eco', 'basic work', 'student home work'),
  lap('Samsung', 'Galaxy Book4', 'Core 5, 16 GB RAM, 512 GB', 15900, 'eco', 'basic work', 'student work home'),
  lap('HP', 'ProBook 440', 'Core i5, 16 GB RAM, 512 GB', 16500, 'eco', 'work basic', 'business work'),
  lap('Apple', 'MacBook Air M1', 'Chip M1, 8 GB RAM, 256 GB', 16500, 'eco', 'basic work create code', 'student work home'),
  lap('Lenovo', 'ThinkPad E14', 'Core i5, 16 GB RAM, 512 GB', 16900, 'eco', 'work code', 'business work student'),
  lap('ASUS', 'TUF Gaming A15', 'Ryzen 5, RTX 3050, 16 GB RAM', 17500, 'eco', 'gaming', 'home'),
  lap('Acer', 'Nitro V 15', 'Core i5, RTX 3050, 16 GB RAM', 17900, 'eco', 'gaming create', 'home student'),
  lap('Acer', 'Swift Go 14', 'Core Ultra 5, 16 GB RAM, 512 GB', 20900, 'mid', 'work basic create', 'student work'),
  lap('Lenovo', 'ThinkPad L14', 'Ryzen 5 PRO, 16 GB RAM, 512 GB', 22500, 'mid', 'work code', 'business work'),
  lap('ASUS', 'Vivobook S 15 OLED', 'Core Ultra 7, 16 GB RAM, 1 TB', 23900, 'mid', 'work create basic', 'student home work'),
  lap('ASUS', 'Zenbook 14 OLED', 'Core Ultra 5, 16 GB RAM, 512 GB', 24900, 'mid', 'work create', 'student work business'),
  lap('Apple', 'MacBook Air 13 M3', 'Chip M3, 16 GB RAM, 256 GB', 25500, 'mid', 'basic work create code kids', 'student work home business'),
  lap('HP', 'EliteBook 640', 'Core Ultra 5, 16 GB RAM, 512 GB', 25900, 'mid', 'work', 'business'),
  lap('Dell', 'Latitude 5450', 'Core Ultra 5, 16 GB RAM, 512 GB', 26500, 'mid', 'work code', 'business work'),
  lap('HP', 'Victus 16', 'Ryzen 5, RTX 4060, 16 GB RAM', 26900, 'mid', 'gaming create', 'home student'),
  lap('Lenovo', 'ThinkPad T14', 'Core Ultra 5, 16 GB RAM, 512 GB', 27900, 'mid', 'work code', 'business work'),
  lap('Microsoft', 'Surface Laptop 7', 'Snapdragon X, 16 GB RAM, 256 GB', 27900, 'mid', 'work basic kids', 'student work business home'),
  lap('ASUS', 'TUF Gaming A16', 'Ryzen 7, RTX 4060, 16 GB RAM', 28500, 'mid', 'gaming code', 'home student'),
  lap('MSI', 'Katana 15', 'Core i7, RTX 4060, 16 GB RAM', 29900, 'mid', 'gaming create', 'home'),
  lap('Lenovo', 'Legion 5', 'Ryzen 7, RTX 4060, 16 GB RAM', 30900, 'mid', 'gaming create code', 'home student work'),
  lap('LG', 'gram 16', 'Core Ultra 7, 16 GB RAM, 512 GB', 30900, 'mid', 'work basic', 'work business student'),
  lap('Apple', 'MacBook Air 15 M3', 'Chip M3, 16 GB RAM, 512 GB', 36900, 'high', 'basic work create kids', 'student work home business'),
  lap('Apple', 'MacBook Pro 14 M4', 'Chip M4, 16 GB RAM, 512 GB', 42900, 'high', 'create code work', 'work business student'),
  lap('ASUS', 'ROG Strix G16', 'Core i7, RTX 4070, 16 GB RAM', 45900, 'high', 'gaming create', 'home'),
  lap('Lenovo', 'Legion Pro 5', 'Core i7, RTX 4070, 32 GB RAM', 47900, 'high', 'gaming create code', 'home work'),
  lap('Dell', 'XPS 14', 'Core Ultra 7, 32 GB RAM, 1 TB', 49900, 'high', 'work create code', 'work business'),
  lap('ASUS', 'ROG Zephyrus G14', 'Ryzen 9, RTX 4070, 32 GB RAM', 52900, 'high', 'gaming create code', 'home work'),
  lap('HP', 'EliteBook 840', 'Core Ultra 7, 32 GB RAM, 1 TB', 52900, 'high', 'work code', 'business'),
  lap('Lenovo', 'ThinkPad X1 Carbon', 'Core Ultra 7, 32 GB RAM, 1 TB', 58900, 'high', 'work code', 'business work'),
  lap('Razer', 'Blade 14', 'Ryzen 9, RTX 4070, 32 GB RAM', 59900, 'high', 'gaming create', 'home'),
  lap('Apple', 'MacBook Pro 16 M4 Pro', 'Chip M4 Pro, 24 GB RAM, 512 GB', 69900, 'high', 'create code', 'work business'),
  lap('MSI', 'Stealth 16', 'Core Ultra 9, RTX 4080, 32 GB RAM', 74900, 'high', 'gaming create', 'home work'),
  lap('Lenovo', 'ThinkPad P1', 'Core Ultra 9, RTX Ada, 32 GB RAM', 79000, 'high', 'create code work', 'business work'),
];
const FALLBACK_LAPTOP = lap('Lenovo', 'IdeaPad Slim 3', 'Core i5, 16 GB RAM, 512 GB', 12500, 'eco', 'basic work', 'student home');
const PC_NOTE = 'Suma de procesador, tarjeta de video, RAM y almacenamiento. Aún faltan gabinete, fuente y tarjeta madre. Los precios son aproximados.';
const LAP_NOTE = 'Precios aproximados de modelos de línea: cambian según la tienda y la configuración. Confirma las especificaciones antes de comprar.';

// Si no hay match exacto se relaja el filtro: perfil, luego uso, luego solo presupuesto
function recommendLaptops(use, budget, profile, lastKey = '') {
  const filters = [
    p => fits(p, budget, use) && p.p.includes(profile),
    p => fits(p, budget, use),
    p => p.t.includes(budget),
  ];
  let pool = [];
  for (const f of filters) { pool = LAPTOPS.filter(f); if (pool.length) break; }
  if (!pool.length) return { items: [FALLBACK_LAPTOP], fallback: true };
  let items = [];
  for (let i = 0; i < 6; i++) {
    const mix = [...pool].sort(() => Math.random() - .5);
    items = [];
    mix.forEach(p => { if (items.length < 3 && !items.some(o => o.brand === p.brand)) items.push(p); });
    mix.forEach(p => { if (items.length < 3 && !items.includes(p)) items.push(p); });
    if (keyLap(items) !== lastKey) break;
  }
  return { items, fallback: false };
}
const keyLap = items => items.map(i => i.big).sort().join('|');

function showLaptops(reroll) {
  const r = recommendLaptops(state.use, state.budget, state.profile, reroll ? state.last : '');
  state.last = keyLap(r.items);
  state.build = null;
  $('#summary').textContent = r.fallback
    ? 'No encontré una igual a lo que pediste, pero esta laptop equilibrada te va a servir muy bien.'
    : `Para ${labelOf('profile', state.profile)}, pensando en ${labelOf('use', state.use)}, con presupuesto ${labelOf('budget', state.budget)}.`;
  $('#cards').classList.add('three');
  $('#cards').innerHTML = r.items.map((p, i) => `
    <article class="card">
      <span class="part-icon" aria-hidden="true">💻</span>
      <h3>Opción ${'ABC'[i]}</h3>
      <p class="maker">${p.brand}</p>
      <p class="big">${p.big}</p>
      <p class="detail">${p.detail}</p>
      <p class="price">${mxn.format(p.price)}</p>
      <a class="ml" href="https://listado.mercadolibre.com.mx/${slug(`${p.brand} ${p.big}`)}" target="_blank" rel="noopener">Ver en Mercado Libre</a>
    </article>`).join('');
  $('#total-line').hidden = true;
  $('#note').textContent = LAP_NOTE;
  show('results');
}

/* =====================================================================
   CARRERAS Y TRABAJOS: carrera | trabajo | uso sugerido para el equipo
   ===================================================================== */
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const G = (name, rows, only) => ({
  name, only,
  items: rows.map(r => { const [career, job, use] = r.split('|'); return { id: slug(career), career, job, use, group: name }; }),
});
const FIELD_GROUPS = [
  G('Escuela', ['Primaria|Primaria|kids', 'Secundaria|Secundaria|kids', 'Bachillerato|Bachillerato|work'], 'student'),
  G('Ingenierías', [
    'Ingeniería civil|Ingeniero/a civil|create', 'Ingeniería mecánica|Ingeniero/a mecánico/a|create',
    'Ingeniería mecatrónica|Ingeniero/a mecatrónico/a|create', 'Ingeniería eléctrica|Ingeniero/a eléctrico/a|work',
    'Ingeniería electrónica|Ingeniero/a electrónico/a|work', 'Ingeniería industrial|Ingeniero/a industrial|work',
    'Ingeniería en sistemas computacionales|Ingeniero/a en sistemas|code', 'Ingeniería en software|Desarrollador/a de software|code',
    'Ingeniería en datos e IA|Científico/a de datos|code', 'Ingeniería en telecomunicaciones|Ingeniero/a en telecomunicaciones|work',
    'Ingeniería química|Ingeniero/a químico/a|work', 'Ingeniería petrolera|Ingeniero/a petrolero/a|work',
    'Ingeniería ambiental|Ingeniero/a ambiental|work', 'Ingeniería biomédica|Ingeniero/a biomédico/a|work',
    'Ingeniería aeroespacial|Ingeniero/a aeroespacial|create', 'Ingeniería automotriz|Ingeniero/a automotriz|create',
    'Ingeniería en logística|Ingeniero/a en logística|work', 'Ingeniería en alimentos|Ingeniero/a en alimentos|work',
    'Ingeniería agronómica|Ingeniero/a agrónomo/a|work', 'Ingeniería en energías renovables|Ingeniero/a en energías renovables|work',
    'Ingeniería en minas|Ingeniero/a de minas|work',
  ]),
  G('Negocios y leyes', [
    'Administración|Administrador/a|work', 'Contaduría|Contador/a|work', 'Economía|Economista|work', 'Derecho|Abogado/a|work',
    'Mercadotecnia|Especialista en marketing|create', 'Negocios internacionales|Comercio exterior|work', 'Actuaría|Actuario/a|code',
    'Recursos humanos|Recursos humanos|work', 'Ciencias políticas|Analista político/a|work', 'Relaciones internacionales|Relaciones internacionales|work',
  ]),
  G('Diseño y arte', [
    'Arquitectura|Arquitecto/a|create', 'Diseño gráfico|Diseñador/a gráfico/a|create', 'Diseño industrial|Diseñador/a industrial|create',
    'Animación digital|Animador/a|create', 'Cine y audiovisual|Editor/a de video|create', 'Fotografía|Fotógrafo/a|create',
    'Música|Músico/a|create', 'Artes visuales|Artista visual|create', 'Diseño de modas|Diseñador/a de modas|create',
    'Comunicación|Comunicólogo/a|create', 'Periodismo|Periodista|work',
  ]),
  G('Salud', [
    'Medicina|Médico/a|work', 'Enfermería|Enfermero/a|work', 'Odontología|Dentista|work', 'Nutrición|Nutriólogo/a|work',
    'Psicología|Psicólogo/a|work', 'Fisioterapia|Fisioterapeuta|work', 'Veterinaria|Veterinario/a|work', 'Farmacia|Farmacéutico/a|work',
  ]),
  G('Ciencias, educación y servicios', [
    'Matemáticas|Matemático/a|code', 'Física|Físico/a|code', 'Biología|Biólogo/a|work', 'Química|Químico/a|work',
    'Computación|Programador/a|code', 'Pedagogía|Pedagogo/a|work', 'Educación|Maestro/a|work', 'Idiomas y traducción|Traductor/a|work',
    'Historia|Historiador/a|work', 'Filosofía|Filósofo/a|work', 'Letras|Escritor/a|work', 'Sociología|Sociólogo/a|work',
    'Trabajo social|Trabajador/a social|work', 'Gastronomía|Chef|work', 'Turismo|Turismo y hoteles|work',
  ]),
  G('Oficios y otros trabajos', [
    'Oficina y administración|Oficina y administración|work', 'Ventas y atención a clientes|Ventas y atención a clientes|work',
    'Emprendedor/a|Emprendedor/a|work', 'Creador/a de contenido|Creador/a de contenido|create',
    'Soporte técnico|Soporte técnico|work', 'Freelancer|Freelancer|work',
  ], 'work'),
  G('Otro', ['Otra carrera|Otro trabajo|']),
];
const FIELDS = FIELD_GROUPS.flatMap(g => g.items);
const needsField = () => state.profile === 'student' || state.profile === 'work';

function renderField() {
  const student = state.profile === 'student';
  $('#field-title').textContent = student ? '¿Qué carrera estudias?' : '¿A qué te dedicas?';
  $('#field-search').value = '';
  $('#field-list').innerHTML = FIELD_GROUPS.filter(g => !g.only || g.only === state.profile).map(g => `
    <h3 class="grp">${g.name}</h3>
    <div class="chips">${g.items.map(f => `<button type="button" class="opt chip" data-key="field" data-value="${f.id}"
      data-q="${norm(f.career + ' ' + f.job)}" ${f.use ? '' : 'data-any="1"'} aria-pressed="${state.field === f.id}">${student ? f.career : f.job}</button>`).join('')}</div>`).join('');
}

function filterFields() {
  const q = norm($('#field-search').value.trim());
  $$('#field-list .chip').forEach(c => { c.hidden = !(c.dataset.any || c.dataset.q.includes(q)); });
  $$('#field-list .grp').forEach(h => {
    const box = h.nextElementSibling;
    h.hidden = box.hidden = !box.querySelector('.chip:not([hidden])');
  });
}

// Pre-selecciona el uso según la carrera o el trabajo (si la persona no eligió uno a mano)
function suggestUse() {
  const f = FIELDS.find(x => x.id === state.field);
  if (!f || !f.use || (state.use && !state.auto)) return;
  choose('use', f.use);
  state.auto = true;
  $('#use-hint').hidden = false;
}

const actions = {
  reset,
  theme: toggleTheme,
  start: () => show('device'),
  'back-device': () => show('welcome'),
  'next-device': () => { if (state.device) show('profile'); },
  'back-profile': () => show('device'),
  'next-profile': () => {
    if (!state.profile) return;
    if (needsField()) { renderField(); show('field'); } else show('use');
  },
  'back-field': () => show('profile'),
  'next-field': () => { if (state.field) { suggestUse(); show('use'); } },
  'back-use': () => show(needsField() ? 'field' : 'profile'),
  'next-use': () => { if (state.use) show('budget'); },
  'back-budget': () => show('use'),
  'next-budget': analyze,
  other: () => showResults(true),
  swap: b => swap(b.dataset.part, b),
};

document.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn || btn.disabled) return;
  e.preventDefault();                        // nunca se recarga la página
  if (btn.classList.contains('opt')) return choose(btn.dataset.key, btn.dataset.value);
  const run = actions[btn.dataset.action];
  if (run) run(btn);
});

document.addEventListener('input', e => {
  if (e.target.id === 'budget-range') choose('budget', tierOf(Number(e.target.value)));
  if (e.target.id === 'field-search') filterFields();
});

function init() {
  try {
    const saved = localStorage.getItem('pcr-theme');
    if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
  } catch (e) { /* sin almacenamiento */ }
  media.addEventListener('change', paintThemeButton);
  renderOptions('device');
  renderOptions('profile');
  renderOptions('use');
  renderOptions('budget');
  syncNext();
  paintThemeButton();
}

init();
