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
  ['ram', '⚡', 'Memoria RAM', 'Permite que el equipo use los programas que tienes abiertos. Con suficiente RAM puedes mantener varias aplicaciones abiertas y trabajar con mayor fluidez.'],
  ['ssd', '💾', 'Almacenamiento', 'Es el armario donde guardas programas, fotos y archivos.'],
];

/* =====================================================================
   2. CATÁLOGO: LAPTOPS
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

// Precios orientativos en MXN. Las preguntas adaptan el orden de recomendación.
const MOBILE_CATALOG = {
  tablet: [
    { brand: 'Xiaomi', big: 'Redmi Pad SE 8.7', detail: '8.7 pulgadas, 4 GB RAM, 128 GB, Wi-Fi', price: 2800, category: 'Uso diario', uses: ['basic', 'kids'], screen: 'compact', storage: 'normal', system: 'android', pen: false, keyboard: false, source: 'https://www.mi.com/mx/product/redmi-pad-se-8-7-inch/' },
    { brand: 'Xiaomi', big: 'Redmi Pad SE 8.7 4G', detail: '8.7 pulgadas, 4 GB RAM, 128 GB, conexión 4G', price: 3500, category: 'Uso diario y movilidad', uses: ['basic', 'work'], screen: 'compact', storage: 'normal', system: 'android', pen: false, keyboard: false, source: 'https://www.mi.com/mx/product/redmi-pad-se-8-7-inch-4g/' },
    { brand: 'Samsung', big: 'Galaxy Tab A11', detail: '8.7 pulgadas, 64 GB, Wi-Fi', price: 4200, category: 'Uso diario', uses: ['basic', 'kids'], screen: 'compact', storage: 'normal', system: 'android', pen: false, keyboard: false, source: 'https://www.samsung.com/mx/tablets/galaxy-tab-a/galaxy-tab-a11-gray-64gb-sm-x133nzaal06/buy/' },
    { brand: 'Xiaomi', big: 'Redmi Pad 2 9.7', detail: '9.7 pulgadas, 4 GB RAM, 128 GB, Wi-Fi', price: 4300, category: 'Uso diario y estudio', uses: ['basic', 'work'], screen: 'medium', storage: 'normal', system: 'android', pen: false, keyboard: false, source: 'https://www.mi.com/mx/product/redmi-pad-2-9-7-inch/' },
    { brand: 'Xiaomi', big: 'Redmi Pad SE', detail: '11 pulgadas, 4 GB RAM, 128 GB, Wi-Fi', price: 4800, category: 'Uso diario y entretenimiento', uses: ['basic', 'kids'], screen: 'large', storage: 'normal', system: 'android', pen: false, keyboard: false, source: 'https://www.mi.com/mx/product/redmi-pad-se/' },
    { brand: 'Samsung', big: 'Galaxy Tab A11+', detail: '11 pulgadas, 128 GB, Wi-Fi', price: 6900, category: 'Estudio, uso diario y juegos casuales', uses: ['basic', 'work', 'gaming'], screen: 'large', storage: 'normal', system: 'android', pen: false, keyboard: false, source: 'https://www.samsung.com/mx/tablets/galaxy-tab-a/galaxy-tab-a11-plus-gray-128gb-sm-x230nzaamxo/' },
    { brand: 'Xiaomi', big: 'Redmi Pad 2 Pro', detail: '12.1 pulgadas, 8 GB RAM, 256 GB', price: 6999, category: 'Gaming y entretenimiento', uses: ['basic', 'gaming', 'work'], screen: 'large', storage: 'lots', system: 'android', pen: true, keyboard: true, source: 'https://www.mi.com/mx/product/redmi-pad-2-pro/' },
    { brand: 'Xiaomi', big: 'Xiaomi Pad 7', detail: '11.2 pulgadas, 8 GB RAM, 128 GB', price: 7999, category: 'Gaming y creación', uses: ['gaming', 'create', 'work'], screen: 'large', storage: 'normal', system: 'android', pen: true, keyboard: true, source: 'https://www.mi.com/mx/product/xiaomi-pad-7/' },
    { brand: 'Lenovo', big: 'Lenovo Tab Plus', detail: '11.5 pulgadas, 8 GB RAM, 256 GB', price: 8999, category: 'Gaming y entretenimiento', uses: ['gaming', 'basic'], screen: 'large', storage: 'lots', system: 'android', pen: false, keyboard: false, source: 'https://www.lenovo.com/mx/es/p/tablets/lenovo-tab-series/lenovo-tab-plus/zadx0071mx' },
    { brand: 'Lenovo', big: 'Idea Tab Plus', detail: '12.1 pulgadas, 256 GB, compatible con lápiz y teclado', price: 9999, category: 'Estudio y trabajo', uses: ['work', 'create', 'basic'], screen: 'large', storage: 'lots', system: 'android', pen: true, keyboard: true, source: 'https://www.lenovo.com/mx/es/p/tablets/lenovo-tab-series/lenovo-idea-tab-plus/zag70754mx' },
    { brand: 'Apple', big: 'iPad (A16)', detail: '11 pulgadas, 128 GB, Wi-Fi; Apple Pencil compatible (se vende aparte)', price: 10999, category: 'Estudio, trabajo y uso diario', uses: ['basic', 'work', 'create', 'gaming'], screen: 'large', storage: 'normal', system: 'ios', pen: true, keyboard: true, source: 'https://www.apple.com/mx/shop/buy-ipad/ipad' },
    { brand: 'Samsung', big: 'Galaxy Tab S10 FE', detail: '10.9 pulgadas, 8 GB RAM, 128 GB; S Pen incluido', price: 11799, category: 'Estudio, trabajo y dibujo', uses: ['basic', 'work', 'create', 'gaming'], screen: 'medium', storage: 'normal', system: 'android', pen: true, keyboard: true, source: 'https://www.samsung.com/mx/tablets/galaxy-tab-s10-fe/buy/' },
    { brand: 'Xiaomi', big: 'Xiaomi Pad 7 Pro', detail: '11.2 pulgadas, 8 GB RAM, 256 GB', price: 12999, category: 'Gaming y creación', uses: ['gaming', 'create', 'work'], screen: 'large', storage: 'lots', system: 'android', pen: true, keyboard: true, source: 'https://www.mi.com/mx/product-list/tablets/tablet/' },
    { brand: 'Apple', big: 'iPad mini', detail: '8.3 pulgadas, 128 GB, Wi-Fi; compatible con Apple Pencil', price: 14499, category: 'Estudio y movilidad', uses: ['basic', 'work', 'create', 'gaming'], screen: 'compact', storage: 'normal', system: 'ios', pen: true, keyboard: false, source: 'https://www.apple.com/mx/shop/buy-ipad/ipad-mini' },
    { brand: 'Samsung', big: 'Galaxy Tab S10 FE+', detail: '13.1 pulgadas, 8 GB RAM, 128 GB; S Pen incluido', price: 15999, category: 'Trabajo, estudio y dibujo', uses: ['work', 'create', 'basic'], screen: 'large', storage: 'normal', system: 'android', pen: true, keyboard: true, source: 'https://www.samsung.com/mx/tablets/galaxy-tab-s/galaxy-tab-s10-fe-plus-gray-128gb-sm-x620nzaamxo/' },
    { brand: 'Apple', big: 'iPad Air de 11 pulgadas', detail: '11 pulgadas, 128 GB; compatible con Apple Pencil y teclado', price: 18799, category: 'Trabajo y creación profesional', uses: ['work', 'create', 'gaming'], screen: 'large', storage: 'normal', system: 'ios', pen: true, keyboard: true, source: 'https://www.apple.com/mx/shop/buy-ipad/ipad-air' },
    { brand: 'Samsung', big: 'Galaxy Tab S11', detail: '11 pulgadas, 256 GB, S Pen incluido', price: 21999, category: 'Trabajo y creación avanzada', uses: ['work', 'create', 'gaming'], screen: 'large', storage: 'lots', system: 'android', pen: true, keyboard: true, source: 'https://www.samsung.com/mx/tablets/galaxy-tab-s/galaxy-tab-s11-gray-256gb-sm-x730nzaemxo/' },
    { brand: 'Lenovo', big: 'Yoga Tab Plus Gen 2', detail: '13 pulgadas, pantalla 4K y lápiz incluido; teclado opcional', price: 26999, category: 'Gaming, dibujo y creación avanzada', uses: ['gaming', 'create', 'work'], screen: 'large', storage: 'lots', system: 'android', pen: true, keyboard: true, source: 'https://www.lenovo.com/mx/es/p/tablets/yoga-tab-series/lenovo-yoga-tab-plus-gen-2/len103y0002' },
    { brand: 'Samsung', big: 'Galaxy Tab S11 Ultra', detail: '14.6 pulgadas, 256 GB, S Pen incluido', price: 27999, category: 'Trabajo y creación profesional', uses: ['work', 'create', 'gaming'], screen: 'large', storage: 'lots', system: 'android', pen: true, keyboard: true, source: 'https://www.samsung.com/mx/tablets/galaxy-tab-s/galaxy-tab-s11-ultra-gray-256gb-sm-x930nzaamxo/' },
    { brand: 'HONOR', big: 'Pad X7', detail: 'Tableta compacta con almacenamiento expandible', price: 2999, category: 'Uso diario y movilidad', uses: ['basic', 'kids'], screen: 'compact', storage: 'normal', system: 'android', pen: false, keyboard: false, source: 'https://www.honor.com/mx/tablets/honor-pad-x7/' },
    { brand: 'HONOR', big: 'Pad X8b', detail: '11 pulgadas, batería de gran capacidad y cuatro bocinas', price: 4499, category: 'Uso diario y entretenimiento', uses: ['basic', 'kids'], screen: 'large', storage: 'normal', system: 'android', pen: false, keyboard: false, source: 'https://www.honor.com/mx/tablets/honor-pad-x8b/' },
    { brand: 'HONOR', big: 'Pad X9a', detail: '11.5 pulgadas, pantalla 2.5K a 120 Hz', price: 5999, category: 'Gaming casual y entretenimiento', uses: ['basic', 'gaming'], screen: 'large', storage: 'normal', system: 'android', pen: false, keyboard: false, source: 'https://www.honor.com/mx/tablets/honor-pad-x9a/' },
    { brand: 'Xiaomi', big: 'Redmi Pad Pro', detail: '12.1 pulgadas, pantalla 2.5K y cuatro bocinas', price: 6999, category: 'Gaming y entretenimiento', uses: ['gaming', 'basic', 'work'], screen: 'large', storage: 'lots', system: 'android', pen: true, keyboard: true, source: 'https://www.mi.com/mx/product/redmi-pad-pro/' },
    { brand: 'Samsung', big: 'Galaxy Tab S10 Lite', detail: '10.9 pulgadas, 128 GB; admite accesorios de teclado', price: 7999, category: 'Estudio y trabajo', uses: ['work', 'basic', 'create'], screen: 'medium', storage: 'normal', system: 'android', pen: true, keyboard: true, source: 'https://www.samsung.com/mx/tablets/galaxy-tab-s/galaxy-tab-s10-lite-gray-128gb-sm-x400nzaamxo/' },
    { brand: 'HONOR', big: 'Pad 10', detail: '12.1 pulgadas, 8 GB RAM, 256 GB', price: 8999, category: 'Estudio, trabajo y contenido', uses: ['work', 'basic', 'create'], screen: 'large', storage: 'lots', system: 'android', pen: true, keyboard: true, source: 'https://www.honor.com/mx/tablets/honor-pad-10/' },
    { brand: 'HUAWEI', big: 'MatePad 11.5 (2025)', detail: '11.5 pulgadas, HarmonyOS 4.3, teclado desmontable y lápiz compatible', price: 10999, category: 'Estudio y trabajo', uses: ['work', 'create', 'basic'], screen: 'large', storage: 'lots', system: 'harmony', pen: true, keyboard: true, source: 'https://consumer.huawei.com/mx/tablets/matepad-11-5-2025/' },
    { brand: 'HUAWEI', big: 'MatePad 12 X', detail: '12 pulgadas PaperMatte, HarmonyOS, lápiz M-Pencil y enfoque creativo', price: 17999, category: 'Trabajo, estudio y dibujo', uses: ['work', 'create', 'basic'], screen: 'large', storage: 'lots', system: 'harmony', pen: true, keyboard: true, source: 'https://consumer.huawei.com/mx/tablets/matepad-12-x/' },
    { brand: 'OnePlus', big: 'Pad 3', detail: 'Tableta Android de alto rendimiento con pantalla grande', price: 21999, category: 'Gaming y productividad avanzada', uses: ['gaming', 'work', 'create'], screen: 'large', storage: 'lots', system: 'android', pen: true, keyboard: true, source: 'https://www.oneplus.com/mx/oneplus-pad-3' },
    { brand: 'HONOR', big: 'Pad X8a', detail: '11 pulgadas, batería amplia y cuatro bocinas', price: 3999, category: 'Uso diario y entretenimiento', uses: ['basic', 'kids'], screen: 'large', storage: 'normal', system: 'android', pen: false, keyboard: false, source: 'https://www.honor.com/mx/tablets/honor-pad-x8a/' },
  ],
  phone: [
    { brand: 'Apple', big: 'iPhone 11', detail: '64 GB, reacondicionado. Revisa la batería, el desbloqueo y la garantía.', price: 3999, category: 'Uso diario · reacondicionado', uses: ['basic', 'work'], priorities: ['camera', 'everyday', 'work'], screen: 'compact', storage: 'normal', system: 'ios', source: 'https://www.mercadolibre.com.mx/apple-iphone-11-64-gb-blanco-excelente-reacondicionado/p/MLM2000137020', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 12', detail: '64 GB, reacondicionado. Revisa la batería, el desbloqueo y la garantía.', price: 4399, category: 'Uso diario · reacondicionado', uses: ['basic', 'work', 'create'], priorities: ['camera', 'everyday', 'work'], screen: 'compact', storage: 'normal', system: 'ios', source: 'https://www.mercadolibre.com.mx/iphone-12-dual-sim-64-gb-morado-excelente-reacondicionado/p/MLM2000029405', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 12', detail: '128 GB, reacondicionado. Revisa la batería, el desbloqueo y la garantía.', price: 4899, category: 'Uso diario · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'compact', storage: 'lots', system: 'ios', source: 'https://www.mercadolibre.com.mx/apple-iphone-12-morado-128-gb-4-gb/p/MLM2000108360', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 13', detail: '128 GB, reacondicionado. Revisa la batería, el desbloqueo y la garantía.', price: 5999, category: 'Uso diario · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'compact', storage: 'lots', system: 'ios', source: 'https://www.mercadolibre.com.mx/apple-iphone-13-128-gb-medianoche-aceptable-reacondicionado/p/MLM2000086180', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 14', detail: '128 GB, reacondicionado. Comprueba si usa SIM física o eSIM.', price: 6499, category: 'Uso diario · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'compact', storage: 'lots', system: 'ios', source: 'https://www.mercadolibre.com.mx/apple-iphone-14-128-gb-medianoche-bueno-reacondicionado/p/MLM2000081741', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 13 Pro', detail: '128 GB, reacondicionado. Revisa la batería, el desbloqueo y la garantía.', price: 7999, category: 'Fotografía y gaming · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'compact', storage: 'lots', system: 'ios', source: 'https://listado.mercadolibre.com.mx/celulares-telefonia/celulares-smartphones/iphone/iphone-13-pro/reacondicionado/', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 16e', detail: '128 GB, reacondicionado. Comprueba si usa SIM física o eSIM.', price: 8299, category: 'Trabajo y uso diario · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'compact', storage: 'lots', system: 'ios', source: 'https://listado.mercadolibre.com.mx/iphone-16e-reacondicionados', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 15', detail: '128 GB, reacondicionado. Comprueba si usa SIM física o eSIM.', price: 9299, category: 'Fotografía y trabajo · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'large', storage: 'lots', system: 'ios', source: 'https://www.mercadolibre.com.mx/apple-iphone-15-128-gb-azul-excelente-reacondicionado/p/MLM2000087240', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 15 Pro', detail: '128 GB, reacondicionado. Comprueba si usa SIM física o eSIM.', price: 12999, category: 'Fotografía y gaming · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'compact', storage: 'lots', system: 'ios', source: 'https://www.mercadolibre.com.mx/apple-iphone-15-pro-128-gb-titanio-negro-excelente-reacondicionado/p/MLM2000057633', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 16', detail: '128 GB, reacondicionado. Comprueba si usa SIM física o eSIM.', price: 11999, category: 'Fotografía y trabajo · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'large', storage: 'lots', system: 'ios', source: 'https://www.mercadolibre.com.mx/apple-iphone-16-128-gb-negro-excelente-reacondicionado/p/MLM2000085752', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Motorola', big: 'moto g06', detail: '128 GB, pantalla de 6.88 pulgadas, batería grande', price: 2600, category: 'Uso diario económico', uses: ['basic'], priorities: ['battery', 'everyday'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/moto-g/06/pmipmhy42mg' },
    { brand: 'Xiaomi', big: 'REDMI Note 15', detail: 'Pantalla AMOLED de 6.77 pulgadas, 128 GB', price: 4999, category: 'Uso diario y batería', uses: ['basic', 'work'], priorities: ['battery', 'everyday'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.mi.com/mx/product/redmi-note-15/' },
    { brand: 'Samsung', big: 'Galaxy A17 5G', detail: '128 GB, 5G, pantalla de 6.7 pulgadas', price: 4999, category: 'Uso diario y trabajo ligero', uses: ['basic', 'work'], priorities: ['battery', 'everyday', 'work'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.samsung.com/mx/smartphones/galaxy-a/galaxy-a17-5g-blue-128gb-sm-a176bzbrltm/' },
    { brand: 'Motorola', big: 'moto g17', detail: 'Pantalla FHD+ de 6.7 pulgadas, cámara de 50 MP', price: 4999, category: 'Uso diario y fotos', uses: ['basic', 'create'], priorities: ['camera', 'battery', 'everyday'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/moto-g/17/pmipmjn44mh' },
    { brand: 'Motorola', big: 'moto g67 5G', detail: '256 GB, 5G, Android 16', price: 5999, category: 'Uso diario, trabajo y juegos casuales', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['battery', 'everyday', 'gaming', 'camera', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/moto-g/67/pmipmjh43mt' },
    { brand: 'Xiaomi', big: 'REDMI Note 17', detail: 'Pantalla AMOLED de 6.99 pulgadas, 256 GB', price: 7999, category: 'Uso diario y trabajo', uses: ['basic', 'work', 'create'], priorities: ['camera', 'battery', 'everyday', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.mi.com/mx/product/redmi-note-17/' },
    { brand: 'Samsung', big: 'Galaxy A36 5G', detail: '128 GB, 5G, pantalla Super AMOLED', price: 7999, category: 'Trabajo y uso diario', uses: ['basic', 'work', 'create'], priorities: ['camera', 'battery', 'everyday', 'work'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.samsung.com/mx/smartphones/galaxy-a/galaxy-a36-5g-awesome-black-128gb-sm-a366ezkaltm/' },
    { brand: 'POCO', big: 'X7 Pro 5G', detail: 'Pantalla 1.5K de 6.83 pulgadas y sistema de refrigeración para juegos', price: 8499, category: 'Gaming', uses: ['gaming', 'create'], priorities: ['gaming'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.mi.com/mx/product/poco-x7-pro/' },
    { brand: 'Samsung', big: 'Galaxy A56 5G', detail: '128 GB, 5G, pantalla de 6.7 pulgadas', price: 9999, category: 'Trabajo, fotos y uso diario', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'battery', 'everyday', 'work'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.samsung.com/mx/smartphones/galaxy-a/galaxy-a56-5g-awesome-graphite-128gb-sm-a566ezkbltm/' },
    { brand: 'Motorola', big: 'edge 60 Fusion', detail: 'Pantalla pOLED de 6.7 pulgadas, cámara y carga rápida', price: 10999, category: 'Trabajo, fotos y uso diario', uses: ['basic', 'work', 'create'], priorities: ['camera', 'battery', 'everyday', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/motorola-edge/60-fusion/pmipmhq40my' },
    { brand: 'Xiaomi', big: 'POCO F7', detail: 'Pantalla de 6.83 pulgadas y rendimiento optimizado para juegos', price: 11999, category: 'Gaming', uses: ['gaming', 'create'], priorities: ['gaming'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.mi.com/mx/product/poco-f7/' },
    { brand: 'Xiaomi', big: 'REDMI Note 17 Pro 5G', detail: '5G, cámara con estabilización y pantalla AMOLED de 6.83 pulgadas', price: 12999, category: 'Trabajo, fotos y uso diario', uses: ['basic', 'work', 'create'], priorities: ['camera', 'battery', 'everyday', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.mi.com/mx/product/redmi-note-17-pro-5g/' },
    { brand: 'Motorola', big: 'edge 60 Pro', detail: 'Pantalla pOLED de 6.7 pulgadas, cámara avanzada y carga rápida', price: 14999, category: 'Trabajo y fotografía', uses: ['work', 'create', 'basic'], priorities: ['camera', 'battery', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/motorola-edge/60-pro/pmipmht41mf' },
    { brand: 'POCO', big: 'F7 Pro', detail: 'Snapdragon 8 Gen 3 y funciones para gaming exigente', price: 15999, category: 'Gaming avanzado', uses: ['gaming', 'create'], priorities: ['gaming'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.mi.com/mx/product/poco-f7-pro/' },
    { brand: 'Apple', big: 'iPhone 17e', detail: '256 GB, pantalla de 6.1 pulgadas, iOS', price: 16999, category: 'Trabajo y uso diario', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work'], screen: 'compact', storage: 'lots', system: 'ios', source: 'https://www.apple.com/mx/shop/buy-iphone/iphone-17e' },
    { brand: 'Samsung', big: 'Galaxy S25 FE', detail: '128 GB, pantalla AMOLED y funciones para productividad y cámara', price: 17999, category: 'Trabajo, fotos y productividad', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.samsung.com/mx/smartphones/galaxy-s/galaxy-s25-fe-icyblue-128gb-sm-s731blblltm/' },
    { brand: 'Apple', big: 'iPhone 17', detail: '256 GB, pantalla de 6.3 pulgadas y cámara dual', price: 20999, category: 'Fotografía, trabajo y uso diario', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work'], screen: 'large', storage: 'lots', system: 'ios', source: 'https://www.apple.com/mx/shop/buy-iphone/iphone-17' },
    { brand: 'Motorola', big: 'Signature', detail: 'Pantalla AMOLED de 6.8 pulgadas, cámara de alta resolución y funciones de IA', price: 24999, category: 'Trabajo y creación profesional', uses: ['work', 'create', 'gaming'], priorities: ['camera', 'battery', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/motorola-signature/signature/pmipmje43mf' },
    { brand: 'REDMAGIC', big: '11 Pro', detail: 'Teléfono diseñado para gaming, con ventilación y controles dedicados', price: 26999, category: 'Gaming dedicado', uses: ['gaming'], priorities: ['gaming'], screen: 'large', storage: 'lots', system: 'android', source: 'https://global.redmagic.gg/products/redmagic-11-pro' },
    { brand: 'Xiaomi', big: 'REDMI A5', detail: 'Pantalla grande, 64 GB y batería para uso diario', price: 2499, category: 'Uso diario económico', uses: ['basic'], priorities: ['battery', 'everyday'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.mi.com/mx/product/redmi-a5/' },
    { brand: 'HONOR', big: 'X7e', detail: '256 GB, batería de 7500 mAh y pantalla de 120 Hz', price: 4999, category: 'Uso diario y batería', uses: ['basic', 'work'], priorities: ['battery', 'everyday'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.honor.com/mx/phones/honor-x7e/' },
    { brand: 'HONOR', big: 'X8d', detail: '256 GB, cámara de 108 MP y batería de 7000 mAh', price: 6999, category: 'Fotos, trabajo y uso diario', uses: ['basic', 'work', 'create'], priorities: ['camera', 'battery', 'everyday', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.honor.com/mx/phones/honor-x8d/' },
    { brand: 'POCO', big: 'X8 Pro', detail: 'Pantalla de alta frecuencia y funciones optimizadas para juegos', price: 8999, category: 'Gaming', uses: ['gaming', 'create'], priorities: ['gaming'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.mi.com/mx/product/poco-x8-pro/' },
    { brand: 'Motorola', big: 'edge 70', detail: 'Diseño ligero, cámara de 50 MP y funciones de IA', price: 17999, category: 'Trabajo, fotos y uso diario', uses: ['work', 'create', 'basic'], priorities: ['camera', 'everyday', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/motorola-edge/70/pmipmjc43ma' },
    { brand: 'Samsung', big: 'Galaxy S26 FE', detail: '256 GB, pantalla de 6.7 pulgadas y funciones de productividad', price: 19999, category: 'Trabajo, fotos y productividad', uses: ['work', 'create', 'basic', 'gaming'], priorities: ['camera', 'everyday', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.samsung.com/mx/smartphones/galaxy-s/galaxy-s26-fe-pistachio-256gb-sm-s741blgmltm/' },
    { brand: 'POCO', big: 'F8 Pro', detail: 'Rendimiento de gama alta, pantalla AMOLED y buen desempeño en juegos', price: 14999, category: 'Gaming avanzado', uses: ['gaming', 'create'], priorities: ['gaming'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.mi.com/mx/product/poco-f8-pro/' },
    { brand: 'Motorola', big: 'edge 70 Pro', detail: 'Cámara avanzada, pantalla pOLED y batería de larga duración', price: 24999, category: 'Trabajo, fotografía y creación', uses: ['work', 'create', 'basic'], priorities: ['camera', 'battery', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/motorola-edge/70-pro/pmipmjp44mp' },
    { brand: 'POCO', big: 'F8 Ultra', detail: 'Rendimiento de alta gama y funciones de juego a 120 FPS', price: 22999, category: 'Gaming de alto rendimiento', uses: ['gaming', 'create'], priorities: ['gaming'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.mi.com/mx/product/poco-f8-ultra/' },
    { brand: 'Motorola', big: 'razr 70', detail: 'Teléfono plegable con pantalla externa y funciones de cámara con IA', price: 24999, category: 'Trabajo móvil y fotografía', uses: ['work', 'create', 'basic'], priorities: ['camera', 'everyday', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/razr/70/pmipmjl44m6' },
    { brand: 'HONOR', big: 'Magic8 Pro', detail: 'Cámara con zoom óptico y funciones avanzadas de IA', price: 29999, category: 'Fotografía, trabajo y gaming', uses: ['work', 'create', 'gaming'], priorities: ['camera', 'work', 'gaming'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.honor.com/mx/phones/honor-magic8-pro/' },
  ],
};

const FALLBACK_LAPTOP = lap('Lenovo', 'IdeaPad Slim 3', 'Core i5, 8 GB RAM, 512 GB', 12500, 'eco', 'basic work', 'student home');
const CATALOG = { laptop: LAPTOPS };
const FALLBACK_ITEM = { laptop: FALLBACK_LAPTOP };

/* =====================================================================
   3. OPCIONES DEL ASISTENTE
   ===================================================================== */
const OPTIONS = {
  device: [
    { id: 'pc', icon: '🛠️', label: 'PC de escritorio', hint: 'Más potencia por el precio y fácil de actualizar. Ideal para usarla en un solo lugar.' },
    { id: 'laptop', icon: '💻', label: 'Laptop', hint: 'Llévala a clases o al trabajo. Revisa su peso, batería y memoria ampliable.' },
    { id: 'tablet', icon: '📱', label: 'Tablet', hint: 'Ligera para leer, tomar apuntes, dibujar o ver contenido.' },
    { id: 'phone', icon: '📲', label: 'Teléfono celular', hint: 'Compara cámara, batería, tamaño, almacenamiento y sistema.' },
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
  tablet: { min: 2500, max: 30000, cut: [8000, 15000], val: { eco: 7500, mid: 15000, high: 22000 } },
  phone: { min: 4000, max: 40000, cut: [6500, 15000], val: { eco: 6500, mid: 12000, high: 25000 } },
};
const BUDGET_HINT = {
  pc: 'Guía para las piezas principales de una PC de escritorio; el total no incluye gabinete, fuente ni tarjeta madre.',
  laptop: 'Guía para comparar laptops completas. El precio depende de la marca y configuración.',
  tablet: 'Monto aproximado para una tableta. Revisa si el lápiz, teclado o conexión móvil se venden aparte.',
  phone: 'Desde $4,000. Incluye iPhone reacondicionados. Revisa batería, desbloqueo, garantía y compatibilidad con tu compañía.',
};

const MOBILE_QUESTIONS = {
  tablet: [
    { id: 'main', title: '¿Qué harás más con la tableta?', options: [
      { id: 'work', label: 'Clases, apuntes y documentos', icon: '📝' },
      { id: 'basic', label: 'Leer, navegar y ver series', icon: '🎬' },
      { id: 'create', label: 'Dibujar o crear contenido', icon: '✍️' },
      { id: 'gaming', label: 'Jugar', icon: '🎮' },
    ]},
    { id: 'screen', title: '¿Qué tamaño de pantalla prefieres?', options: [
      { id: 'compact', label: 'Compacta y fácil de llevar', icon: '🤏' },
      { id: 'medium', label: 'Tamaño equilibrado', icon: '⚖️' },
      { id: 'large', label: 'Grande para leer o dividir pantalla', icon: '🔎' },
    ]},
    { id: 'accessory', title: '¿Necesitas lápiz o teclado?', options: [
      { id: 'none', label: 'No necesito accesorios', icon: '👌' },
      { id: 'pen', label: 'Lápiz para escribir o dibujar', icon: '✏️' },
      { id: 'keyboard', label: 'Teclado para escribir', icon: '⌨️' },
      { id: 'both', label: 'Ambos', icon: '🧰' },
    ]},
    { id: 'system', title: '¿Usas o prefieres algún sistema?', options: [
      { id: 'android', label: 'Android', icon: '🤖' },
      { id: 'harmony', label: 'HUAWEI HarmonyOS', icon: '🔷' },
      { id: 'ios', label: 'Apple (iPadOS)', icon: '🍎' },
      { id: 'any', label: 'Me da igual', icon: '✨' },
    ]},
  ],
  phone: [
    { id: 'priority', title: '¿Qué es lo más importante para ti?', options: [
      { id: 'camera', label: 'Tomar fotos y grabar video', icon: '📸' },
      { id: 'battery', label: 'Que aguante el día', icon: '🔋' },
      { id: 'gaming', label: 'Jugar y tener buen rendimiento', icon: '🎮' },
      { id: 'work', label: 'Trabajar, estudiar y hacer videollamadas', icon: '💼' },
      { id: 'everyday', label: 'Mensajes, redes y uso diario', icon: '💬' },
    ]},
    { id: 'screen', title: '¿Qué tamaño te resulta cómodo?', options: [
      { id: 'compact', label: 'Más compacto para usar con una mano', icon: '🤏' },
      { id: 'large', label: 'Pantalla grande para videos y lectura', icon: '📺' },
      { id: 'any', label: 'No tengo preferencia', icon: '✨' },
    ]},
    { id: 'storage', title: '¿Cuánto espacio necesitas?', options: [
      { id: 'normal', label: 'Uso normal; guardo pocas fotos', icon: '📁' },
      { id: 'lots', label: 'Muchas fotos, videos o aplicaciones', icon: '🗂️' },
    ]},
    { id: 'system', title: '¿Qué sistema prefieres?', options: [
      { id: 'android', label: 'Android', icon: '🤖' },
      { id: 'ios', label: 'Apple (iOS)', icon: '🍎' },
      { id: 'any', label: 'Me da igual', icon: '✨' },
    ]},
  ],
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

// En laptops se relaja el filtro (perfil, luego uso, luego solo presupuesto)
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

function scoreMobile(item, device) {
  const answer = state.mobile;
  let score = item.uses.includes(state.use) ? 5 : 0;
  if (device === 'tablet') {
    if (answer.screen !== 'any' && item.screen === answer.screen) score += 3;
    if (answer.accessory === 'pen' && item.pen) score += 5;
    if (answer.accessory === 'keyboard' && item.keyboard) score += 5;
    if (answer.accessory === 'both' && item.pen && item.keyboard) score += 6;
    if (answer.accessory === 'none' && !item.pen && !item.keyboard) score += 1;
    if (answer.system !== 'any' && item.system === answer.system) score += 3;
  } else {
    if (answer.priority && item.priorities.includes(answer.priority)) score += 5;
    if (answer.screen !== 'any' && item.screen === answer.screen) score += 3;
    if (answer.storage && item.storage === answer.storage) score += 3;
    if (answer.system !== 'any' && item.system === answer.system) score += 3;
  }
  return score;
}

function recommendMobile(device, amount, lastKey = '') {
  const catalog = MOBILE_CATALOG[device];
  const preferredSystem = state.mobile.system || 'any';
  // Si la persona elige un sistema, nunca se muestran equipos de otro sistema.
  const compatible = preferredSystem === 'any'
    ? catalog
    : catalog.filter(item => item.system === preferredSystem);
  const affordable = compatible.filter(item => item.price <= amount);
  const pool = affordable.length
    ? affordable
    : [compatible.reduce((a, b) => a.price < b.price ? a : b)];
  const ranked = pool.map(item => ({ item, score: scoreMobile(item, device) }))
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price);
  return { items: ranked.map(x => x.item), overBudget: !affordable.length };
}

function mobileReason(item, device) {
  const answer = state.mobile;
  const reasons = [];
  if (item.uses.includes(state.use)) reasons.push(device === 'tablet' ? 'Se ajusta al uso que elegiste' : 'Se ajusta a tu uso diario');
  if (device === 'tablet') {
    if (answer.screen !== 'any' && item.screen === answer.screen) reasons.push('Coincide con el tamaño de pantalla que prefieres');
    if (answer.accessory === 'pen' && item.pen) reasons.push('Es compatible con lápiz');
    if (answer.accessory === 'keyboard' && item.keyboard) reasons.push('Es compatible con teclado');
    if (answer.accessory === 'both' && item.pen && item.keyboard) reasons.push('Admite lápiz y teclado');
  } else {
    if (answer.priority && item.priorities.includes(answer.priority)) reasons.push('Coincide con tu prioridad');
    if (answer.screen !== 'any' && item.screen === answer.screen) reasons.push('Coincide con el tamaño que prefieres');
    if (answer.storage && item.storage === answer.storage) reasons.push(answer.storage === 'lots' ? 'Tiene más espacio para tus archivos' : 'Adecuado para uso y almacenamiento normales');
  }
  const systemName = answer.system === 'ios'
    ? (device === 'tablet' ? 'iPadOS' : 'iOS')
    : answer.system === 'harmony' ? 'HarmonyOS' : 'Android';
  if (answer.system !== 'any' && item.system === answer.system) reasons.push(`Usa ${systemName}, como prefieres`);
  return reasons.slice(0, 2).join(' · ') || 'Una alternativa dentro del monto seleccionado';
}

/* =====================================================================
   7. ESTADO Y VISTAS
   ===================================================================== */
const state = {
  device: null, profile: null, field: null, auto: false, use: null, budget: null,
  mobile: {}, mobileRanked: [], mobileIndex: -1, mobileOverBudget: false,
  last: '', timer: null, build: null,
};
const needsField = () => state.profile === 'student' || state.profile === 'work';
const isMobileDevice = () => state.device === 'tablet' || state.device === 'phone';
function clearMobileRecommendations() {
  state.mobileRanked = [];
  state.mobileIndex = -1;
  state.mobileOverBudget = false;
}

function progressFor(name) {
  if (name === 'welcome') return { label: 'Inicio', value: 0 };
  if (name === 'loading') return { label: 'Preparando tu recomendación', value: 95 };
  if (name === 'results') return { label: 'Recomendación lista', value: 100 };

  const hasFieldStep = needsField() || !state.profile;
  const steps = isMobileDevice()
    ? ['device', 'mobile-questions', 'budget']
    : ['device', 'profile', ...(hasFieldStep ? ['field'] : []), 'use', 'budget'];
  const index = steps.indexOf(name);
  if (index < 0) return { label: '', value: 0 };

  const titles = {
    device: 'tipo de equipo', profile: 'quién lo usará', field: state.profile === 'student' ? 'carrera' : 'trabajo',
    'mobile-questions': 'tus preferencias', use: 'uso principal', budget: 'presupuesto',
  };
  const total = steps.length;
  return {
    label: `Paso ${index + 1} de ${total}: ${titles[name]}`,
    value: Math.round(90 * (index + 1) / total),
  };
}

function show(name) {
  $$('.view').forEach(v => {
    const on = v.dataset.view === name;
    v.hidden = !on;
    v.classList.toggle('active', on);
  });
  const title = $(`.view[data-view="${name}"] .title`);
  if (title) title.focus({ preventScroll: true });
  const progress = progressFor(name);
  $('#step-label').textContent = progress.label;
  $('#progress').setAttribute('aria-valuenow', String(progress.value));
  $('#bar').style.width = `${progress.value}%`;
  window.scrollTo({ top: 0 });
}

function syncNext() {
  $('[data-action="next-device"]').disabled = !state.device;
  $('[data-action="next-profile"]').disabled = !state.profile;
  $('[data-action="next-field"]').disabled = !state.field;
  $('[data-action="next-use"]').disabled = !state.use;
  $('[data-action="next-budget"]').disabled = !state.budget;
  const questions = MOBILE_QUESTIONS[state.device] || [];
  $('[data-action="next-mobile"]').disabled = !questions.length || questions.some(q => !state.mobile[q.id]);
}

function renderMobileQuestions() {
  const questions = MOBILE_QUESTIONS[state.device];
  $('#mobile-title').textContent = state.device === 'tablet' ? '¿Qué tableta se adapta a ti?' : '¿Qué teléfono te conviene más?';
  $('#mobile-intro').textContent = 'Responde estas preguntas para ordenar opciones que coincidan con lo que necesitas.';
  $('#mobile-questions').innerHTML = questions.map(q => `
    <fieldset class="question">
      <legend>${q.title}</legend>
      <div class="opts mobile-answers" role="group" aria-label="${q.title}">
        ${q.options.map(o => `<button type="button" class="opt answer" data-key="mobile-answer" data-question="${q.id}" data-value="${o.id}" aria-pressed="${state.mobile[q.id] === o.id}">
          <span class="opt-icon" aria-hidden="true">${o.icon}</span><span class="opt-text"><strong>${o.label}</strong></span>
        </button>`).join('')}
      </div>
    </fieldset>`).join('');
  syncNext();
}

function renderOptions(key) {
  const options = key === 'budget' && isMobileDevice()
    ? OPTIONS.budget.map(o => ({ ...o, hint: o.id === 'eco' ? (state.device === 'phone' ? 'Desde $4,000; incluye iPhone reacondicionados' : 'Cuidando cada peso') : o.id === 'mid' ? 'Buen equilibrio entre precio y funciones' : 'Más opciones de rendimiento y espacio' }))
    : OPTIONS[key];
  $(`#opts-${key}`).innerHTML = options.map(o => `
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
  const deviceChanged = key === 'device' && state.device !== value;
  state[key] = value;
  if (deviceChanged) {
    const r = RANGE[value], rng = $('#budget-range');
    Object.assign(rng, { min: r.min, max: r.max, value: r.val.mid });
    $('#budget-hint').textContent = BUDGET_HINT[value];
    state.budget = null;
    state.profile = null;
    state.field = null;
    state.use = null;
    state.auto = false;
    state.mobile = {};
    clearMobileRecommendations();
    state.last = '';
    state.build = null;
    renderOptions('budget');
    $$('.opt[data-key="budget"]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    $$('.opt[data-key="profile"], .opt[data-key="use"], .opt[data-key="field"]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    $('#use-hint').hidden = true;
    $('#range-out').textContent = 'Mueve la barra o elige una opción';
  }
  if (key === 'profile') state.field = null;
  if (key === 'use') { state.auto = false; $('#use-hint').hidden = true; }
  if (key === 'budget') {
    const rng = $('#budget-range');
    if (tierOf(Number(rng.value)) !== value) rng.value = RANGE[dev()].val[value];
    $('#range-out').textContent = mxn.format(Number(rng.value));
    clearMobileRecommendations();
  }
  $$(`.opt[data-key="${key}"]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === value)));
  syncNext();
}

function reset() {
  clearTimeout(state.timer);
  Object.assign(state, {
    device: null, profile: null, field: null, auto: false, use: null, budget: null, mobile: {}, mobileRanked: [], mobileIndex: -1, mobileOverBudget: false, last: '', build: null,
  });
  const otherButton = $('[data-action="other"]');
  otherButton.disabled = false;
  otherButton.textContent = 'Ver otra opción';
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
  const titles = { pc: 'Tu PC de escritorio ideal', laptop: 'Tu laptop ideal', tablet: 'La tableta que mejor encaja contigo', phone: 'El teléfono que mejor encaja contigo' };
  $('#result-title').textContent = titles[dev()];
  const otherButton = $('[data-action="other"]');
  otherButton.disabled = false;
  otherButton.textContent = 'Ver otra opción';
  if (isMobileDevice()) return showMobileList(reroll);
  if (state.device === 'laptop') return showList(reroll);
  state.build = recommend(state.use, state.budget, reroll ? state.last : '');
  state.last = keyOf(state.build);
  paint(state.build);
  show('results');
}

function showMobileList(reroll) {
  const d = state.device;
  const amount = Number($('#budget-range').value);
  if (!reroll || !state.mobileRanked.length) {
    const r = recommendMobile(d, amount);
    state.mobileRanked = r.items;
    state.mobileIndex = 0;
    state.mobileOverBudget = r.overBudget;
  } else if (state.mobileIndex < state.mobileRanked.length - 1) {
    state.mobileIndex += 1;
  }
  const p = state.mobileRanked[state.mobileIndex];
  state.last = `${p.brand}|${p.big}`;
  state.build = null;
  const label = d === 'tablet' ? 'tableta' : 'teléfono';
  const systemName = state.mobile.system === 'any' ? 'sin preferencia'
    : state.mobile.system === 'ios' ? (d === 'tablet' ? 'iPadOS' : 'iOS')
      : state.mobile.system === 'harmony' ? 'HarmonyOS' : 'Android';
  const focus = d === 'tablet'
    ? `tu preferencia de uso, pantalla ${state.mobile.screen === 'compact' ? 'compacta' : state.mobile.screen === 'large' ? 'grande' : 'mediana'} y sistema ${systemName}`
    : `tu prioridad de ${MOBILE_QUESTIONS.phone[0].options.find(o => o.id === state.mobile.priority)?.label.toLowerCase()}, pantalla ${state.mobile.screen === 'any' ? 'sin preferencia de tamaño' : state.mobile.screen === 'compact' ? 'compacta' : 'grande'}, almacenamiento y sistema ${systemName}`;
  $('#summary').textContent = state.mobileOverBudget
    ? `No encontramos una ${label}${state.mobile.system !== 'any' ? ` compatible con ${systemName}` : ''} dentro del monto elegido. Aquí está la opción más económica que coincide con tu preferencia.`
    : `Opción ${state.mobileIndex + 1} de ${state.mobileRanked.length}, elegida según ${focus}. Cada vez que pulses «Ver otra opción» avanzarás a un modelo distinto.`;
  $('#cards').classList.remove('three', 'mobile-single');
  $('#cards').classList.add('mobile-single');
  $('#cards').innerHTML = `
    <article class="card">
      <span class="part-icon" aria-hidden="true">${d === 'tablet' ? '📱' : '📲'}</span>
      <h3>${state.mobileIndex === 0 ? 'Mejor coincidencia' : `Opción ${state.mobileIndex + 1}`}</h3>
      <p class="maker">${p.brand}</p>
      <p class="big">${p.big}</p>
      <span class="mobile-category">${p.category}</span>
      <p class="detail">${p.detail}</p>
      <p class="match-reason">${mobileReason(p, d)}</p>
      <p class="price">${mxn.format(p.price)} <small>aprox.</small></p>
      <a class="ml" href="${p.source}" target="_blank" rel="noopener">${p.sourceLabel || 'Ver ficha oficial'}</a>
    </article>`;
  const otherButton = $('[data-action="other"]');
  const allShown = state.mobileIndex >= state.mobileRanked.length - 1;
  otherButton.disabled = allShown;
  otherButton.textContent = allShown ? 'Ya viste todas las opciones' : 'Ver otra opción';
  $('#total-line').hidden = true;
  $('#note').textContent = 'Precios de referencia en MXN; pueden cambiar por tienda, promoción y configuración. Confirma que el modelo tenga el almacenamiento, conexión y accesorios que necesitas. En las tabletas, el lápiz o teclado pueden venderse por separado.';
  show('results');
}

function paint(build) {
  $('#summary').textContent = build.fallback
    ? `No encontré una combinación exacta para ${selectionFocus()}. Esta opción sirve como referencia${state.budget === 'eco' ? ' y conserva 8 GB de RAM en el nivel económico' : ''}.`
    : `Una opción para ${selectionFocus()}, enfocada en ${labelOf('use', state.use)} y en un presupuesto ${labelOf('budget', state.budget)}.`;

  $('#cards').classList.remove('three', 'mobile-single');
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
  const icon = '💻';
  $('#cards').classList.remove('mobile-single');
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
const media = window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: light)')
  : { matches: false };
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
  'next-device': () => {
    if (!state.device) return;
    if (isMobileDevice()) { renderMobileQuestions(); show('mobile-questions'); }
    else show('profile');
  },
  'back-mobile': () => show('device'),
  'next-mobile': () => {
    if (!isMobileDevice()) return;
    if (state.device === 'tablet') state.use = state.mobile.main;
    else state.use = ({ camera: 'create', battery: 'basic', gaming: 'gaming', work: 'work', everyday: 'basic' })[state.mobile.priority];
    show('budget');
  },
  'back-profile': () => show('device'),
  'next-profile': () => {
    if (!state.profile) return;
    if (needsField()) { renderField(); show('field'); } else show('use');
  },
  'back-field': () => show('profile'),
  'next-field': () => { if (state.field) { suggestUse(); show('use'); } },
  'back-use': () => show(needsField() ? 'field' : 'profile'),
  'next-use': () => { if (state.use) show('budget'); },
  'back-budget': () => show(isMobileDevice() ? 'mobile-questions' : 'use'),
  'next-budget': analyze,
  other: () => showResults(true),
  swap: (b) => swap(b.dataset.part, b),
};

document.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn || btn.disabled) return;
  e.preventDefault();                       // nunca se recarga la página
  if (btn.dataset.key === 'mobile-answer') {
    state.mobile[btn.dataset.question] = btn.dataset.value;
    clearMobileRecommendations();
    $$(`.opt[data-key="mobile-answer"][data-question="${btn.dataset.question}"]`).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    syncNext();
    return;
  }
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
  if (typeof media.addEventListener === 'function') media.addEventListener('change', paintThemeButton);
  else if (typeof media.addListener === 'function') media.addListener(paintThemeButton);
  renderOptions('device');
  renderOptions('profile');
  renderOptions('use');
  renderOptions('budget');
  syncNext();
  paintThemeButton();
}

init();
