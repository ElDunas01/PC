'use strict';

/* =====================================================================
   1. BASE DE DATOS: PC DE ESCRITORIO (precios Number en MXN, aproximados)
   t = presupuesto (eco | mid | high), u = usos (basic | work | gaming)
   ===================================================================== */
const row = (brand, big, detail, price, t = [], u = [], x = {}) => ({ brand, big, detail, price, t, u, ...x });
const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const ALL_T = ['eco', 'mid', 'high'];
const ALL_U = ['basic', 'work', 'gaming'];

const DB = {
  // igpu: trae gráficos integrados | ram: tipo de memoria de su plataforma
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
  // Económico: exactamente 8 GB para mantener el costo bajo. Medio y alto: 16 GB o más.
  ram: [
    row('Kingston', '8 GB', 'DDR4 3200 MHz', 1500, ['eco'], ALL_U, { type: 'DDR4' }),
    row('Corsair', '8 GB', 'DDR4 3200 MHz', 1650, ['eco'], ALL_U, { type: 'DDR4' }),
    row('Crucial', '8 GB', 'DDR4 3200 MHz', 1550, ['eco'], ALL_U, { type: 'DDR4' }),
    row('Kingston', '16 GB', 'DDR4 3200 MHz', 3200, ['mid'], ALL_U, { type: 'DDR4' }),
    row('Corsair', '16 GB', 'DDR4 3200 MHz', 3600, ['mid'], ALL_U, { type: 'DDR4' }),
    row('Crucial', '16 GB', 'DDR4 3200 MHz', 3400, ['mid'], ALL_U, { type: 'DDR4' }),
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

const FALLBACK = {
  cpu: row('Intel', 'Core i5', '12400', 4200),
  gpu: row('Procesador', 'Integrada', 'Ya viene incluida', 0),
  ram: row('Kingston', '16 GB', 'DDR4 3200 MHz', 3200),
  ssd: row('WD', '1 TB', 'Blue SN580 NVMe', 1500),
};

const FALLBACK_ECO = { cpu: DB.cpu[0], gpu: DB.gpu[0], ram: DB.ram[0], ssd: DB.ssd[0] };
const FALLBACK_ECO_GAMING = { cpu: DB.cpu[2], gpu: DB.gpu[1], ram: DB.ram[0], ssd: DB.ssd[0] };

const PARTS = [
  ['cpu', '🧠', 'Procesador', 'Es el cerebro: piensa y decide qué tan rápido va todo.'],
  ['gpu', '🎮', 'Tarjeta de video', 'Dibuja las imágenes: juegos, videos y diseño.'],
  ['ram', '⚡', 'Memoria RAM', 'Es tu mesa de trabajo: más espacio, más cosas abiertas a la vez.'],
  ['ssd', '💾', 'Almacenamiento', 'Es el armario donde guardas programas, fotos y archivos.'],
];

/* =====================================================================
   2. CATÁLOGO: LAPTOPS Y TODO EN UNO
   lap(marca, modelo, detalle, precio, presupuesto, usos, perfiles)
   Económico: 8 GB de RAM como mínimo.
   ===================================================================== */
const lap = (brand, big, detail, price, t, u, p) => row(brand, big, detail, price, [t], u.split(' '), { p: p.split(' ') });

const LAPTOPS = [
  lap('Acer', 'Aspire 3', 'Ryzen 5, 8 GB RAM, 512 GB', 9500, 'eco', 'basic kids work', 'student home'),
  lap('ASUS', 'Vivobook Go 15', 'Ryzen 5, 8 GB RAM, 512 GB', 11900, 'eco', 'basic work kids', 'student home'),
  lap('Lenovo', 'IdeaPad Slim 3', 'Core i5, 8 GB RAM, 512 GB', 12500, 'eco', 'basic work kids code', 'student home work'),
  lap('Dell', 'Inspiron 15', 'Core i5, 8 GB RAM, 512 GB', 14500, 'eco', 'basic work', 'student home work'),
  lap('Samsung', 'Galaxy Book4', 'Core 5, 8 GB RAM, 512 GB', 15900, 'eco', 'basic work', 'student work home'),
  lap('HP', 'ProBook 440', 'Core i5, 8 GB RAM, 512 GB', 16500, 'eco', 'work basic', 'business work'),
  lap('Apple', 'MacBook Air M1', 'Chip M1, 8 GB RAM, 256 GB', 16500, 'eco', 'basic work create code', 'student work home'),
  lap('Lenovo', 'ThinkPad E14', 'Core i5, 8 GB RAM, 512 GB', 16900, 'eco', 'work code', 'business work student'),
  lap('ASUS', 'TUF Gaming A15', 'Ryzen 5, RTX 3050, 8 GB RAM', 17500, 'eco', 'gaming', 'home'),
  lap('Acer', 'Nitro V 15', 'Core i5, RTX 3050, 8 GB RAM', 17900, 'eco', 'gaming create', 'home student'),
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

const AIOS = [
  lap('Acer', 'Aspire C24', 'Core i3, 8 GB RAM, 256 GB', 11900, 'eco', 'basic kids', 'student home'),
  lap('Lenovo', 'IdeaCentre AIO 3', 'Ryzen 5, 8 GB RAM, 512 GB', 13900, 'eco', 'basic work kids', 'student home'),
  lap('HP', 'All-in-One 24', 'Ryzen 5, 8 GB RAM, 512 GB', 14900, 'eco', 'basic work kids', 'student home'),
  lap('ASUS', 'Vivo AiO 24', 'Core i5, 8 GB RAM, 512 GB', 15900, 'eco', 'basic work kids', 'student home'),
  lap('Dell', 'Inspiron 24', 'Core i5, 8 GB RAM, 512 GB', 16900, 'eco', 'basic work', 'home business'),
  lap('HP', 'Pavilion 27', 'Core i5, 16 GB RAM, 512 GB', 22900, 'mid', 'work create basic', 'home business'),
  lap('Lenovo', 'Yoga AIO 7', 'Ryzen 7, 16 GB RAM, 1 TB', 31900, 'mid', 'work create', 'home business'),
  lap('Apple', 'iMac 24 M4', 'Chip M4, 16 GB RAM, 256 GB', 32900, 'high', 'create work code basic', 'home work business'),
  lap('MSI', 'Modern AIO', 'Core i7, RTX 4060, 16 GB RAM', 45900, 'high', 'gaming create', 'home'),
  lap('Dell', 'XPS 27', 'Core Ultra 7, 32 GB RAM, 1 TB', 52900, 'high', 'work create code', 'business work'),
];

const FALLBACK_LAPTOP = lap('Lenovo', 'IdeaPad Slim 3', 'Core i5, 8 GB RAM, 512 GB', 12500, 'eco', 'basic work', 'student home');
const FALLBACK_AIO = lap('HP', 'All-in-One 24', 'Ryzen 5, 8 GB RAM, 512 GB', 14900, 'eco', 'basic work', 'student home');
const CATALOG = { laptop: LAPTOPS, aio: AIOS };
const FALLBACK_ITEM = { laptop: FALLBACK_LAPTOP, aio: FALLBACK_AIO };

/* =====================================================================
   3. OPCIONES DEL ASISTENTE
   ===================================================================== */
const OPTIONS = {
  device: [
    { id: 'pc', icon: '🛠️', label: 'PC de escritorio', hint: 'Más potencia por el precio y fácil de actualizar. Ideal para usarla en un solo lugar.' },
    { id: 'laptop', icon: '💻', label: 'Laptop', hint: 'Llévala a clases o al trabajo. Revisa su peso, batería y memoria ampliable.' },
    { id: 'aio', icon: '🖥️', label: 'Todo en uno', hint: 'Pantalla y computadora juntas, con menos cables. Ocupa poco espacio.' },
  ],
  profile: [
    { id: 'student', icon: '🎓', label: 'Estudiar', hint: 'Escuela, universidad o cursos' },
    { id: 'work', icon: '💼', label: 'Trabajar', hint: 'Oficina o trabajo desde casa' },
    { id: 'home', icon: '🏠', label: 'Hogar', hint: 'Para toda la familia' },
    { id: 'business', icon: '🏢', label: 'Empresa o negocio', hint: 'Equipos para un equipo de trabajo' },
  ],
  use: [
    { id: 'gaming', icon: '🎮', label: 'Jugar', hint: 'Videojuegos sin trabas' },
    { id: 'work', icon: '💻', label: 'Trabajar / Estudiar', hint: 'Tareas, clases y oficina' },
    { id: 'basic', icon: '🌐', label: 'Uso básico', hint: 'Internet, videos y chats' },
    { id: 'create', icon: '🎨', label: 'Diseño y video', hint: 'Fotos, edición y animación' },
    { id: 'code', icon: '👨‍💻', label: 'Programar', hint: 'Código y proyectos' },
    { id: 'kids', icon: '🧒', label: 'Niños y familia', hint: 'Dibujos, juegos suaves y tareas' },
  ],
  budget: [
    { id: 'eco', icon: '🪙', label: 'Económico', hint: 'Cuidando cada peso; 8 GB de RAM' },
    { id: 'mid', icon: '⚖️', label: 'Intermedio', hint: 'Buen equilibrio' },
    { id: 'high', icon: '🚀', label: 'Alto', hint: 'Lo mejor para rendir más' },
  ],
};

// Rangos de la barra de presupuesto por tipo de equipo (cut = cortes entre niveles)
const RANGE = {
  pc: { min: 8000, max: 40000, cut: [12000, 22000], val: { eco: 10000, mid: 17000, high: 30000 } },
  laptop: { min: 8000, max: 80000, cut: [18000, 35000], val: { eco: 13000, mid: 26000, high: 55000 } },
  aio: { min: 8000, max: 80000, cut: [18000, 35000], val: { eco: 13000, mid: 26000, high: 55000 } },
};
const BUDGET_HINT = {
  pc: 'Guía para las piezas principales de una PC de escritorio; el total no incluye gabinete, fuente ni tarjeta madre.',
  laptop: 'Guía para comparar laptops completas. El precio depende de la marca y configuración.',
  aio: 'Guía para comparar equipos todo en uno completos. El precio depende de la marca y configuración.',
};

// Usos nuevos que reutilizan el catálogo de PC de un uso con necesidades parecidas
const POOL = { create: 'gaming', code: 'work', kids: 'basic' };

const PC_NOTE = 'Suma de procesador, tarjeta de video, RAM y almacenamiento. Aún faltan gabinete, fuente y tarjeta madre. Los precios son aproximados.';
const LAP_NOTE = 'Precios aproximados de modelos de línea: cambian según la tienda y la configuración. Confirma las especificaciones antes de comprar.';

/* =====================================================================
   4. CARRERAS Y TRABAJOS (los que más usan computadora o electrónicos)
   F(carrera, trabajo, uso sugerido). Estudiantes ven la carrera; trabajadores ven el trabajo.
   ===================================================================== */
const F = (career, job, use) => ({ career, job, use, id: slug(`${career} ${job}`) });
const S = (career, use) => F(career, career, use);   // carrera sin etiqueta distinta
const W = (job, use) => F('', job, use);             // trabajo

const FIELD_GROUPS = [
  { name: 'Escuela', for: 'student', items: [
    S('Primaria', 'kids'), S('Secundaria', 'kids'), S('Bachillerato', 'work'),
  ]},
  { name: 'Ingenierías y tecnología', for: 'student', items: [
    S('Ingeniería en sistemas computacionales', 'code'), S('Ingeniería en computación', 'code'),
    S('Ingeniería en software', 'code'), S('Ingeniería en tecnologías de información', 'code'),
    S('Ingeniería en datos e inteligencia artificial', 'code'), S('Ingeniería en ciencia de datos', 'code'),
    S('Ingeniería en ciberseguridad', 'code'), S('Ingeniería en sistemas embebidos', 'code'),
    S('Ingeniería en telecomunicaciones', 'work'), S('Ingeniería electrónica', 'work'),
    S('Ingeniería eléctrica', 'work'), S('Ingeniería en automatización y control', 'create'),
    S('Ingeniería mecatrónica', 'create'), S('Ingeniería en robótica', 'create'),
    S('Ingeniería civil', 'create'), S('Ingeniería mecánica', 'create'), S('Ingeniería aeroespacial', 'create'),
    S('Ingeniería automotriz', 'create'), S('Ingeniería industrial', 'work'), S('Ingeniería biomédica', 'work'),
    S('Ingeniería en energías renovables', 'work'),
  ]},
  { name: 'Salud y ciencias de la vida', for: 'student', items: [
    S('Medicina', 'work'), S('Bioinformática', 'code'), S('Biotecnología', 'work'),
    S('Ciencias biomédicas', 'work'), S('Medicina veterinaria', 'work'),
    S('Química farmacéutica', 'work'), S('Enfermería', 'work'),
  ]},
  { name: 'Diseño, arte y comunicación', for: 'student', items: [
    S('Arquitectura', 'create'), S('Diseño gráfico', 'create'), S('Diseño industrial', 'create'),
    S('Animación digital', 'create'), S('Cine y audiovisual', 'create'), S('Fotografía', 'create'),
    S('Diseño de videojuegos', 'gaming'), S('Comunicación digital', 'create'), S('Periodismo', 'work'),
    S('Producción musical', 'create'),
  ]},
  { name: 'Ciencias y matemáticas', for: 'student', items: [
    S('Matemáticas', 'code'), S('Física', 'code'), S('Estadística', 'code'), S('Actuaría', 'code'),
    S('Computación', 'code'), S('Química', 'work'), S('Astronomía', 'work'),
  ]},
  { name: 'Negocios y economía', for: 'student', items: [
    S('Contaduría', 'work'), S('Administración', 'work'), S('Economía', 'work'), S('Finanzas', 'work'),
    S('Mercadotecnia digital', 'create'), S('Negocios internacionales', 'work'), S('Comercio electrónico', 'work'),
  ]},
  { name: 'Tecnología y software', for: 'work', items: [
    W('Desarrollador/a de software', 'code'), W('Programador/a web', 'code'), W('Científico/a de datos', 'code'),
    W('Especialista en ciberseguridad', 'code'), W('Especialista en inteligencia artificial', 'code'),
    W('Analista de datos', 'code'), W('Administrador/a de bases de datos', 'code'),
    W('Especialista DevOps y nube', 'code'), W('Probador/a de software', 'code'),
    W('Administrador/a de redes', 'work'), W('Soporte técnico', 'work'), W('Analista de sistemas', 'work'),
    W('Técnico/a de reparación de computadoras', 'work'),
    W('Diseñador/a UX/UI', 'create'), W('Desarrollador/a de videojuegos', 'gaming'),
  ]},
  { name: 'Ingeniería y electrónica', for: 'work', items: [
    W('Ingeniero/a electrónico/a', 'work'), W('Ingeniero/a en telecomunicaciones', 'work'),
    W('Técnico/a en electrónica', 'work'), W('Técnico/a en telecomunicaciones', 'work'),
    W('Ingeniero/a de sistemas embebidos', 'code'), W('Ingeniero/a de automatización y control', 'create'),
    W('Técnico/a en instrumentación', 'work'), W('Ingeniero/a mecatrónico/a', 'create'),
    W('Ingeniero/a en robótica', 'create'), W('Ingeniero/a civil (con CAD)', 'create'),
    W('Ingeniero/a mecánico/a', 'create'), W('Ingeniero/a automotriz', 'create'),
    W('Ingeniero/a en logística', 'work'),
  ]},
  { name: 'Ciencia y salud digital', for: 'work', items: [
    W('Analista de laboratorio clínico', 'work'), W('Radiólogo/a', 'work'),
    W('Bioinformático/a', 'code'), W('Especialista en equipos médicos', 'work'),
  ]},
  { name: 'Diseño, video y creatividad', for: 'work', items: [
    W('Diseñador/a gráfico/a', 'create'), W('Editor/a de video', 'create'), W('Animador/a 3D', 'create'),
    W('Arquitecto/a', 'create'), W('Fotógrafo/a profesional', 'create'), W('Productor/a musical', 'create'),
    W('Creador/a de contenido', 'create'), W('Community manager', 'create'), W('Ilustrador/a digital', 'create'),
  ]},
  { name: 'Oficina y negocios', for: 'work', items: [
    W('Contador/a', 'work'), W('Administrador/a', 'work'), W('Analista financiero/a', 'work'),
    W('Ejecutivo/a de ventas', 'work'), W('Asistente administrativo/a', 'work'), W('Economista', 'work'),
    W('Abogado/a', 'work'), W('Emprendedor/a', 'work'), W('Freelancer', 'work'),
  ]},
  { name: 'Otra opción', for: 'both', items: [
    F('Otra carrera', 'Otro trabajo', ''),
  ]},
];
const FIELDS = FIELD_GROUPS.flatMap(g => g.items);

/* =====================================================================
   5. FORMATO Y AYUDANTES
   ===================================================================== */
const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const labelOf = (key, id) => (OPTIONS[key].find(o => o.id === id) || { label: '' }).label.toLowerCase();
const selectionFocus = () => {
  const field = FIELDS.find(item => item.id === state.field);
  if (state.profile === 'student' && field) return `la carrera de ${field.career}`;
  if (state.profile === 'work' && field) return `tu actividad como ${field.job}`;
  if (state.profile === 'business') return 'tu empresa o negocio';
  if (state.profile === 'home') return 'tu hogar';
  return 'tu perfil';
};
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const pick = list => list[Math.floor(Math.random() * list.length)];
const dev = () => state.device || 'pc';
const tierOf = v => { const [a, b] = RANGE[dev()].cut; return v <= a ? 'eco' : v <= b ? 'mid' : 'high'; };
const fits = (item, budget, use) => item.t.includes(budget) && item.u.includes(use);
const fitsRam = (item, budget, use) => fits(item, budget, use) && (budget !== 'eco' || item.big === '8 GB');
const hasEcoLaptopRam = item => /\b8\s*GB\s*RAM\b/i.test(item.detail);
const keyOf = b => PARTS.map(([k]) => `${b[k].brand}${b[k].big}${b[k].detail}`).join('|');
const keyList = items => items.map(i => `${i.brand}${i.big}`).sort().join('|');
const totalOf = b => PARTS.reduce((sum, [k]) => sum + b[k].price, 0);

/* =====================================================================
   6. MOTOR DE RECOMENDACIÓN
   ===================================================================== */
function pickBuild(use, budget) {
  const u = POOL[use] || use;
  const cpu = pick(DB.cpu.filter(p => fits(p, budget, u)));
  if (!cpu) return null;
  // Sin gráficos integrados en el procesador, la tarjeta de video es obligatoria
  const gpu = pick(DB.gpu.filter(p => fits(p, budget, u) && (cpu.igpu || !p.integrated)));
  // La RAM debe ser compatible con la plataforma del procesador (DDR4 o DDR5)
  const ram = pick(DB.ram.filter(p => fitsRam(p, budget, u) && p.type === cpu.ram));
  const ssd = pick(DB.ssd.filter(p => fits(p, budget, u)));
  return gpu && ram && ssd ? { cpu, gpu, ram, ssd } : null;
}

function recommend(use, budget, lastKey = '') {
  let build = null;
  try {
    for (let i = 0; i < 8; i++) {          // evita repetir la misma combinación seguida
      const next = pickBuild(use, budget);
      if (!next) break;
      build = next;
      if (keyOf(next) !== lastKey) break;
    }
  } catch (err) {
    console.error(err);
    build = null;
  }
  if (build) return { ...build, fallback: false };
  const safeFallback = budget === 'eco'
    ? ((POOL[use] || use) === 'gaming' ? FALLBACK_ECO_GAMING : FALLBACK_ECO)
    : FALLBACK;
  return { ...safeFallback, fallback: true };
}

// Laptops o todo en uno: relaja el filtro (perfil, luego uso, luego solo presupuesto)
function recommendList(device, use, budget, profile, lastKey = '') {
  const src = CATALOG[device];
  const steps = [
    p => (budget !== 'eco' || hasEcoLaptopRam(p)) && fits(p, budget, use) && p.p.includes(profile),
    p => (budget !== 'eco' || hasEcoLaptopRam(p)) && fits(p, budget, use),
    p => (budget !== 'eco' || hasEcoLaptopRam(p)) && p.t.includes(budget),
  ];
  let pool = [];
  for (const f of steps) { pool = src.filter(f); if (pool.length) break; }
  if (!pool.length) return { items: [FALLBACK_ITEM[device]], fallback: true };
  let items = [];
  for (let i = 0; i < 6; i++) {
    const mix = [...pool].sort(() => Math.random() - 0.5);
    items = [];
    mix.forEach(p => { if (items.length < 3 && !items.some(o => o.brand === p.brand)) items.push(p); });
    mix.forEach(p => { if (items.length < 3 && !items.includes(p)) items.push(p); });
    if (keyList(items) !== lastKey) break;
  }
  return { items, fallback: false };
}

/* =====================================================================
   7. ESTADO Y VISTAS
   ===================================================================== */
const state = {
  device: null, profile: null, field: null, auto: false, use: null, budget: null,
  last: '', timer: null, build: null,
};
const STEP = { welcome: 0, device: 12, profile: 24, field: 36, use: 48, budget: 66, loading: 85, results: 100 };
const needsField = () => state.profile === 'student' || state.profile === 'work';

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

function renderField() {
  const student = state.profile === 'student';
  $('#field-title').textContent = student ? '¿Qué carrera estudias?' : '¿A qué te dedicas?';
  $('#field-hint').textContent = student
    ? 'Elige la carrera que más se acerque a la tuya; la usaremos para sugerir qué programas podrías necesitar.'
    : 'Elige el trabajo que más se acerque al tuyo para orientar la recomendación a tus herramientas y tareas.';
  $('#field-search').placeholder = student ? 'Busca tu carrera' : 'Busca tu trabajo';
  $('#field-search').value = '';
  $('#field-list').innerHTML = FIELD_GROUPS
    .filter(g => g.for === state.profile || g.for === 'both')
    .map(g => `
      <h3 class="grp">${g.name}</h3>
      <div class="chips">${g.items.map(f => `<button type="button" class="opt chip" data-key="field"
        data-value="${f.id}" data-q="${norm(f.career + ' ' + f.job)}" ${f.use ? '' : 'data-any="1"'}
        aria-pressed="${state.field === f.id}">${student ? f.career : f.job}</button>`).join('')}</div>`).join('');
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

function choose(key, value) {
  state[key] = value;
  if (key === 'device') {
    const r = RANGE[value], rng = $('#budget-range');
    Object.assign(rng, { min: r.min, max: r.max, value: r.val.mid });
    $('#budget-hint').textContent = BUDGET_HINT[value];
    state.budget = null;
    $$('.opt[data-key="budget"]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    $('#range-out').textContent = 'Mueve la barra o elige una opción';
  }
  if (key === 'profile') state.field = null;
  if (key === 'use') { state.auto = false; $('#use-hint').hidden = true; }
  if (key === 'budget') {
    const rng = $('#budget-range');
    if (tierOf(Number(rng.value)) !== value) rng.value = RANGE[dev()].val[value];
    $('#range-out').textContent = mxn.format(Number(rng.value));
  }
  $$(`.opt[data-key="${key}"]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === value)));
  syncNext();
}

function reset() {
  clearTimeout(state.timer);
  Object.assign(state, {
    device: null, profile: null, field: null, auto: false, use: null, budget: null, last: '', build: null,
  });
  $$('.opt').forEach(b => b.setAttribute('aria-pressed', 'false'));
  $('#use-hint').hidden = true;
  Object.assign($('#budget-range'), { min: 8000, max: 40000, value: 17000 });
  $('#budget-hint').textContent = 'El monto guía depende del tipo de equipo que elegiste.';
  $('#range-out').textContent = 'Mueve la barra o elige una opción';
  syncNext();
  show('welcome');
}

function analyze() {
  if (!state.use || !state.budget) return;
  show('loading');
  clearTimeout(state.timer);
  state.timer = setTimeout(() => showResults(false), 1500 + Math.random() * 500);
}

function showResults(reroll) {
  const titles = { pc: 'Tu PC de escritorio ideal', laptop: 'Tu laptop ideal', aio: 'Tu equipo todo en uno ideal' };
  $('#result-title').textContent = titles[dev()];
  if (state.device === 'laptop' || state.device === 'aio') return showList(reroll);
  state.build = recommend(state.use, state.budget, reroll ? state.last : '');
  state.last = keyOf(state.build);
  paint(state.build);
  show('results');
}

function paint(build) {
  $('#summary').textContent = build.fallback
    ? `No encontré una combinación exacta para ${selectionFocus()}. Esta opción sirve como referencia${state.budget === 'eco' ? ' y conserva 8 GB de RAM en el nivel económico' : ''}.`
    : `Una opción para ${selectionFocus()}, enfocada en ${labelOf('use', state.use)} y en un presupuesto ${labelOf('budget', state.budget)}.`;

  $('#cards').classList.remove('three');
  $('#cards').innerHTML = PARTS.map(([k, icon, name, help]) => {
    const p = build[k];
    const link = p.price
      ? `<a class="ml" href="https://listado.mercadolibre.com.mx/${slug(`${p.brand} ${p.big} ${p.detail}`)}" target="_blank" rel="noopener">Ver en Mercado Libre</a>`
      : '';
    const swapBtn = !build.fallback && k !== 'cpu'
      ? `<button type="button" class="swap" data-action="swap" data-part="${k}" aria-label="Probar otra pieza: ${name}">Probar otra</button>`
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
}

function showList(reroll) {
  const d = state.device;
  const r = recommendList(d, state.use, state.budget, state.profile, reroll ? state.last : '');
  state.last = keyList(r.items);
  state.build = null;
  $('#summary').textContent = r.fallback
    ? `No encontré una coincidencia exacta para ${selectionFocus()}. Esta opción sirve como referencia${state.budget === 'eco' ? ' y conserva 8 GB de RAM en el nivel económico' : ''}.`
    : `Una opción para ${selectionFocus()}, enfocada en ${labelOf('use', state.use)} y en un presupuesto ${labelOf('budget', state.budget)}.`;
  const icon = d === 'aio' ? '🖥️' : '💻';
  $('#cards').classList.add('three');
  $('#cards').innerHTML = r.items.map((p, i) => `
    <article class="card">
      <span class="part-icon" aria-hidden="true">${icon}</span>
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

const bump = el => { if (!el) return; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); };

// Cambia una sola pieza manteniendo la compatibilidad
function swap(part, btn) {
  const b = state.build;
  if (!b || b.fallback) return;
  const use = POOL[state.use] || state.use;
  const list = DB[part].filter(p => p !== b[part] && (part === 'ram' ? fitsRam(p, state.budget, use) : fits(p, state.budget, use))
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
   8. TEMA CAMALEÓN
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
   9. EVENTOS E INICIO
   ===================================================================== */
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
  swap: (b) => swap(b.dataset.part, b),
};

document.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn || btn.disabled) return;
  e.preventDefault();                       // nunca se recarga la página
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
