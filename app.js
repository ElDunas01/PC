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
    { brand: 'Apple', big: 'iPhone 11', detail: '64 GB, reacondicionado. Revisa la batería, el desbloqueo y la garantía.', price: 3999, category: 'Uso diario · reacondicionado', uses: ['basic', 'work'], priorities: ['camera', 'everyday', 'work'], screen: 'standard', storage: 'normal', system: 'ios', source: 'https://www.mercadolibre.com.mx/apple-iphone-11-64-gb-blanco-excelente-reacondicionado/p/MLM2000137020', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 12', detail: '128 GB, reacondicionado. Revisa la batería, el desbloqueo y la garantía.', price: 4899, category: 'Uso diario · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'standard', storage: 'lots', system: 'ios', source: 'https://www.mercadolibre.com.mx/apple-iphone-12-morado-128-gb-4-gb/p/MLM2000108360', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 13', detail: '128 GB, reacondicionado. Revisa la batería, el desbloqueo y la garantía.', price: 5999, category: 'Uso diario · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'standard', storage: 'lots', system: 'ios', source: 'https://www.mercadolibre.com.mx/apple-iphone-13-128-gb-medianoche-aceptable-reacondicionado/p/MLM2000086180', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 14', detail: '128 GB, reacondicionado. Comprueba si usa SIM física o eSIM.', price: 6499, category: 'Uso diario · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'standard', storage: 'lots', system: 'ios', source: 'https://www.mercadolibre.com.mx/apple-iphone-14-128-gb-medianoche-bueno-reacondicionado/p/MLM2000081741', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 13 Pro', detail: '128 GB, reacondicionado. Revisa la batería, el desbloqueo y la garantía.', price: 7999, category: 'Fotografía y gaming · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'standard', storage: 'lots', system: 'ios', source: 'https://listado.mercadolibre.com.mx/celulares-telefonia/celulares-smartphones/iphone/iphone-13-pro/reacondicionado/', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 16e', detail: '128 GB, reacondicionado. Comprueba si usa SIM física o eSIM.', price: 8299, category: 'Trabajo y uso diario · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'standard', storage: 'lots', system: 'ios', source: 'https://listado.mercadolibre.com.mx/iphone-16e-reacondicionados', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 15', detail: '128 GB, reacondicionado. Comprueba si usa SIM física o eSIM.', price: 9299, category: 'Fotografía y trabajo · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'standard', storage: 'lots', system: 'ios', source: 'https://www.mercadolibre.com.mx/apple-iphone-15-128-gb-azul-excelente-reacondicionado/p/MLM2000087240', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 15 Pro', detail: '128 GB, reacondicionado. Comprueba si usa SIM física o eSIM.', price: 12999, category: 'Fotografía y gaming · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'standard', storage: 'lots', system: 'ios', source: 'https://www.mercadolibre.com.mx/apple-iphone-15-pro-128-gb-titanio-negro-excelente-reacondicionado/p/MLM2000057633', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Apple', big: 'iPhone 16', detail: '128 GB, reacondicionado. Comprueba si usa SIM física o eSIM.', price: 11999, category: 'Fotografía y trabajo · reacondicionado', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work', 'gaming'], screen: 'standard', storage: 'lots', system: 'ios', source: 'https://www.mercadolibre.com.mx/apple-iphone-16-128-gb-negro-excelente-reacondicionado/p/MLM2000085752', sourceLabel: 'Ver en Mercado Libre' },
    { brand: 'Motorola', big: 'moto g06', detail: '128 GB, pantalla de 6.88 pulgadas, batería grande', price: 2600, category: 'Uso diario económico', uses: ['basic'], priorities: ['battery', 'everyday'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/moto-g/06/pmipmhy42mg' },
    { brand: 'Xiaomi', big: 'REDMI Note 15', detail: 'Pantalla AMOLED de 6.77 pulgadas, 128 GB', price: 4999, category: 'Uso diario y batería', uses: ['basic', 'work'], priorities: ['battery', 'everyday'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.mi.com/mx/product/redmi-note-15/' },
    { brand: 'Samsung', big: 'Galaxy A17 5G', detail: '128 GB, 5G, pantalla de 6.7 pulgadas', price: 4999, category: 'Uso diario y trabajo ligero', uses: ['basic', 'work'], priorities: ['battery', 'everyday', 'work'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.samsung.com/mx/smartphones/galaxy-a/galaxy-a17-5g-blue-128gb-sm-a176bzbrltm/' },
    { brand: 'Samsung', big: 'Galaxy A17 LTE', detail: 'Pantalla Super AMOLED de 6.7 pulgadas y 128 GB', price: 3999, category: 'Uso diario y trabajo', uses: ['basic', 'work'], priorities: ['battery', 'everyday', 'work'], screen: 'large', storage: 'normal', system: 'android', source: 'https://listado.mercadolibre.com.mx/samsung-galaxy-a17-lte', sourceLabel: 'Buscar ofertas' },
    { brand: 'Samsung', big: 'Galaxy A07', detail: 'Pantalla de 6.7 pulgadas y almacenamiento para uso diario', price: 2999, category: 'Uso diario económico', uses: ['basic', 'work'], priorities: ['battery', 'everyday'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.samsung.com/mx/smartphones/galaxy-a/galaxy-a07-black-128gb-sm-a075fzkaltm/' },
    { brand: 'Motorola', big: 'moto g17', detail: 'Pantalla FHD+ de 6.7 pulgadas, cámara de 50 MP', price: 3799, category: 'Uso diario y fotos', uses: ['basic', 'create'], priorities: ['camera', 'battery', 'everyday'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/moto-g/17/pmipmjn44mh' },
    { brand: 'Motorola', big: 'moto g15', detail: 'Pantalla de 6.72 pulgadas y batería de 5,200 mAh', price: 3999, category: 'Uso diario y fotografía', uses: ['basic', 'create', 'work'], priorities: ['camera', 'battery', 'everyday'], screen: 'large', storage: 'normal', system: 'android', source: 'https://listado.mercadolibre.com.mx/motorola-moto-g15', sourceLabel: 'Buscar ofertas' },
    { brand: 'Motorola', big: 'moto g67 5G', detail: '256 GB, 5G, Android 16', price: 5999, category: 'Uso diario, trabajo y juegos casuales', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['battery', 'everyday', 'gaming', 'camera', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/moto-g/67/pmipmjh43mt' },
    { brand: 'Xiaomi', big: 'REDMI Note 17', detail: 'Pantalla AMOLED de 6.99 pulgadas, 256 GB', price: 7999, category: 'Uso diario y trabajo', uses: ['basic', 'work', 'create'], priorities: ['camera', 'battery', 'everyday', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.mi.com/mx/product/redmi-note-17/' },
    { brand: 'Samsung', big: 'Galaxy A36 5G', detail: '128 GB, 5G, pantalla Super AMOLED', price: 7999, category: 'Trabajo y uso diario', uses: ['basic', 'work', 'create'], priorities: ['camera', 'battery', 'everyday', 'work'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.samsung.com/mx/smartphones/galaxy-a/galaxy-a36-5g-awesome-black-128gb-sm-a366ezkaltm/' },
    { brand: 'POCO', big: 'X7 Pro 5G', detail: 'Pantalla 1.5K de 6.83 pulgadas y sistema de refrigeración para juegos', price: 8499, category: 'Gaming', uses: ['gaming', 'create'], priorities: ['gaming'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.mi.com/mx/product/poco-x7-pro/' },
    { brand: 'POCO', big: 'C85', detail: 'Pantalla IPS de 6.9 pulgadas y batería de 6,000 mAh', price: 3599, category: 'Uso diario y juegos casuales', uses: ['basic', 'gaming'], priorities: ['battery', 'everyday', 'gaming'], screen: 'large', storage: 'normal', system: 'android', source: 'https://listado.mercadolibre.com.mx/xiaomi-poco-c85', sourceLabel: 'Buscar ofertas' },
    { brand: 'Samsung', big: 'Galaxy A56 5G', detail: '128 GB, 5G, pantalla de 6.7 pulgadas', price: 9999, category: 'Trabajo, fotos y uso diario', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'battery', 'everyday', 'work'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.samsung.com/mx/smartphones/galaxy-a/galaxy-a56-5g-awesome-graphite-128gb-sm-a566ezkbltm/' },
    { brand: 'Motorola', big: 'edge 60 Fusion', detail: 'Pantalla pOLED de 6.7 pulgadas, cámara y carga rápida', price: 10999, category: 'Trabajo, fotos y uso diario', uses: ['basic', 'work', 'create'], priorities: ['camera', 'battery', 'everyday', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/motorola-edge/60-fusion/pmipmhq40my' },
    { brand: 'POCO', big: 'POCO F7', detail: 'Pantalla de 6.83 pulgadas y rendimiento optimizado para juegos', price: 11999, category: 'Gaming', uses: ['gaming', 'create'], priorities: ['gaming'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.mi.com/mx/product/poco-f7/' },
    { brand: 'Xiaomi', big: 'REDMI Note 17 Pro 5G', detail: '5G, cámara con estabilización y pantalla AMOLED de 6.83 pulgadas', price: 12999, category: 'Trabajo, fotos y uso diario', uses: ['basic', 'work', 'create'], priorities: ['camera', 'battery', 'everyday', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.mi.com/mx/product/redmi-note-17-pro-5g/' },
    { brand: 'Motorola', big: 'edge 60 Pro', detail: 'Pantalla pOLED de 6.7 pulgadas, cámara avanzada y carga rápida', price: 14999, category: 'Trabajo y fotografía', uses: ['work', 'create', 'basic'], priorities: ['camera', 'battery', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/motorola-edge/60-pro/pmipmht41mf' },
    { brand: 'POCO', big: 'F7 Pro', detail: 'Snapdragon 8 Gen 3 y funciones para gaming exigente', price: 15999, category: 'Gaming avanzado', uses: ['gaming', 'create'], priorities: ['gaming'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.mi.com/mx/product/poco-f7-pro/' },
    { brand: 'Apple', big: 'iPhone 17e', detail: '256 GB, pantalla de 6.1 pulgadas, iOS', price: 16999, category: 'Trabajo y uso diario', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work'], screen: 'standard', storage: 'lots', system: 'ios', source: 'https://www.apple.com/mx/shop/buy-iphone/iphone-17e' },
    { brand: 'Samsung', big: 'Galaxy S25 FE', detail: '128 GB, pantalla AMOLED y funciones para productividad y cámara', price: 17999, category: 'Trabajo, fotos y productividad', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.samsung.com/mx/smartphones/galaxy-s/galaxy-s25-fe-icyblue-128gb-sm-s731blblltm/' },
    { brand: 'Apple', big: 'iPhone 17', detail: '256 GB, pantalla de 6.3 pulgadas y cámara dual', price: 20999, category: 'Fotografía, trabajo y uso diario', uses: ['basic', 'work', 'create', 'gaming'], priorities: ['camera', 'everyday', 'work'], screen: 'standard', storage: 'lots', system: 'ios', source: 'https://www.apple.com/mx/shop/buy-iphone/iphone-17' },
    { brand: 'Motorola', big: 'Signature', detail: 'Pantalla AMOLED de 6.8 pulgadas, cámara de alta resolución y funciones de IA', price: 24999, category: 'Trabajo y creación profesional', uses: ['work', 'create', 'gaming'], priorities: ['camera', 'battery', 'work'], screen: 'large', storage: 'lots', system: 'android', source: 'https://www.motorola.com/mx/es/p/phones/motorola-signature/signature/pmipmje43mf' },
    { brand: 'REDMAGIC', big: '11 Pro', detail: 'Teléfono diseñado para gaming, con ventilación y controles dedicados', price: 26999, category: 'Gaming dedicado', uses: ['gaming'], priorities: ['gaming'], screen: 'large', storage: 'lots', system: 'android', source: 'https://global.redmagic.gg/products/redmagic-11-pro' },
    { brand: 'Xiaomi', big: 'REDMI A5', detail: 'Pantalla grande, 64 GB y batería para uso diario', price: 2499, category: 'Uso diario económico', uses: ['basic'], priorities: ['battery', 'everyday'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.mi.com/mx/product/redmi-a5/' },
    { brand: 'Xiaomi', big: 'Redmi 13C', detail: '128 GB y pantalla de 6.7 pulgadas', price: 3699, category: 'Uso diario y entretenimiento', uses: ['basic', 'work'], priorities: ['battery', 'everyday'], screen: 'large', storage: 'normal', system: 'android', source: 'https://listado.mercadolibre.com.mx/xiaomi-redmi-13c', sourceLabel: 'Buscar ofertas' },
    { brand: 'Xiaomi', big: 'Redmi 15', detail: 'Pantalla de 6.9 pulgadas y batería de gran capacidad', price: 3499, category: 'Uso diario, video y lectura', uses: ['basic', 'work'], priorities: ['battery', 'everyday'], screen: 'large', storage: 'normal', system: 'android', source: 'https://www.mi.com/mx/product/redmi-15/' },
    { brand: 'Xiaomi', big: 'Redmi A7 Pro', detail: 'Pantalla de 6.9 pulgadas y batería para uso diario', price: 3299, category: 'Uso diario económico', uses: ['basic', 'work'], priorities: ['battery', 'everyday'], screen: 'large', storage: 'normal', system: 'android', source: 'https://listado.mercadolibre.com.mx/xiaomi-redmi-a7-pro', sourceLabel: 'Buscar ofertas' },
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

// Modelos históricos o reacondicionados para dar variedad a cada marca.
// No asignamos especificaciones no verificadas: el enlace abre una búsqueda
// para revisar la variante, el estado y el precio disponible en ese momento.
const PHONE_ARCHIVE = {
  Apple: [
    'iPhone 18 Pro Max', 'iPhone 18 Pro', 'iPhone 18', 'iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone Air',
    'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 15 Plus', 'iPhone 15 Pro Max',
    'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max', 'iPhone 13 mini', 'iPhone 13 Pro Max',
    'iPhone 12 mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max', 'iPhone 11 Pro', 'iPhone 11 Pro Max',
    'iPhone SE (3.ª generación)', 'iPhone XR', 'iPhone XS', 'iPhone XS Max', 'iPhone X',
    'iPhone 8', 'iPhone 8 Plus', 'iPhone 7', 'iPhone 7 Plus', 'iPhone 6s', 'iPhone 6s Plus',
    'iPhone 6', 'iPhone 6 Plus', 'iPhone SE (2.ª generación)', 'iPhone SE (1.ª generación)',
    'iPhone 5s', 'iPhone 5c', 'iPhone 5', 'iPhone 4s', 'iPhone 4', 'iPhone 3GS',
  ],
  Motorola: [
    'edge 70 Fusion', 'edge 60 Neo', 'edge 60', 'edge 50 Ultra', 'edge 50 Pro', 'edge 50 Neo',
    'edge 50 Fusion', 'edge 40 Pro', 'edge 40 Neo', 'edge 40', 'edge 30 Ultra', 'edge 30 Fusion',
    'edge 30 Neo', 'edge 30', 'edge 20 Pro', 'edge 20', 'edge 20 Lite', 'edge+', 'edge+ (2023)',
    'razr 60 Ultra', 'razr 60+', 'razr 60', 'razr 50 Ultra', 'razr 50', 'razr 40 Ultra', 'razr 40',
    'razr (2023)', 'moto g86', 'moto g85', 'moto g84', 'moto g75', 'moto g73', 'moto g72',
    'moto g71 5G', 'moto g70', 'moto g62 5G', 'moto g60', 'moto g60s', 'moto g52', 'moto g51 5G',
    'moto g50', 'moto g42', 'moto g41', 'moto g40 Fusion', 'moto g31', 'moto g30', 'moto g22',
    'moto g20', 'moto g10', 'moto g9 Plus', 'moto g8 Plus', 'moto g7 Plus', 'moto g6 Plus',
    'moto g5 Plus', 'moto g4 Plus', 'moto e15', 'moto e14', 'moto e13', 'moto e7 Plus',
    'moto e6 Plus', 'moto e5 Plus',
  ],
  Samsung: [
    'Galaxy S26 Ultra', 'Galaxy S26+', 'Galaxy S26', 'Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S25',
    'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23',
    'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22', 'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21',
    'Galaxy S20 Ultra', 'Galaxy S20+', 'Galaxy S20', 'Galaxy S10+', 'Galaxy S10', 'Galaxy S9+',
    'Galaxy S9', 'Galaxy S8+', 'Galaxy S8', 'Galaxy Note20 Ultra', 'Galaxy Note20', 'Galaxy Note10+',
    'Galaxy Note10', 'Galaxy A57 5G', 'Galaxy A55 5G', 'Galaxy A54 5G', 'Galaxy A53 5G',
    'Galaxy A52s 5G', 'Galaxy A52 5G', 'Galaxy A51', 'Galaxy A50', 'Galaxy A42 5G', 'Galaxy A41',
    'Galaxy A32 5G', 'Galaxy A31', 'Galaxy A30', 'Galaxy A21s', 'Galaxy A20', 'Galaxy A12',
    'Galaxy A11', 'Galaxy A10', 'Galaxy A71', 'Galaxy A70', 'Galaxy A72', 'Galaxy A73 5G',
    'Galaxy A34 5G', 'Galaxy A33 5G', 'Galaxy A24', 'Galaxy A23', 'Galaxy A22', 'Galaxy A14',
    'Galaxy A13', 'Galaxy A03s', 'Galaxy A02s',
  ],
  Xiaomi: [
    'Xiaomi 17 Ultra', 'Xiaomi 17 Pro', 'Xiaomi 17', 'Xiaomi 15 Ultra', 'Xiaomi 15 Pro', 'Xiaomi 15',
    'Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14', 'Xiaomi 13 Ultra', 'Xiaomi 13T Pro', 'Xiaomi 13T',
    'Xiaomi 13 Pro', 'Xiaomi 13', 'Xiaomi 12T Pro', 'Xiaomi 12T', 'Xiaomi 12 Pro', 'Xiaomi 12',
    'Xiaomi 11T Pro', 'Xiaomi 11T', 'Xiaomi 11 Ultra', 'Xiaomi 11', 'Xiaomi Mi 10T Pro', 'Xiaomi Mi 10T',
    'Xiaomi Mi 10 Pro', 'Xiaomi Mi 10', 'Xiaomi Mi 9', 'Xiaomi Mi 9T Pro', 'Xiaomi Mi 9T', 'Xiaomi Mi 8',
    'Xiaomi Mi 6', 'Xiaomi MIX Fold 4', 'Xiaomi MIX Flip', 'Xiaomi MIX Fold 3', 'Xiaomi MIX 4',
    'Xiaomi MIX Fold 2', 'Xiaomi MIX Fold', 'Xiaomi Mi MIX 3', 'Xiaomi Civi 4 Pro', 'Xiaomi Civi 3',
    'Xiaomi Civi 2', 'Redmi Note 14 Pro+ 5G', 'Redmi Note 14 Pro 5G', 'Redmi Note 14 5G', 'Redmi Note 14',
    'Redmi Note 13 Pro+ 5G', 'Redmi Note 13 Pro 5G', 'Redmi Note 13 5G', 'Redmi Note 12 Pro+ 5G',
    'Redmi Note 12 Pro 5G', 'Redmi Note 12 5G', 'Redmi Note 11 Pro 5G', 'Redmi Note 11S',
    'Redmi Note 11', 'Redmi Note 10 Pro', 'Redmi Note 10', 'Redmi Note 9S', 'Redmi Note 9',
    'Redmi Note 8 Pro', 'Redmi Note 8', 'Redmi 14C', 'Redmi 13', 'Redmi 12', 'Redmi 12C',
    'Redmi 11', 'Redmi 10C', 'Redmi 10', 'Redmi 9C', 'Redmi 9', 'Redmi 8', 'Redmi 7',
    'Redmi 6A', 'Redmi 5 Plus', 'Redmi A3', 'Redmi A2',
  ],
  HUAWEI: [
    'Pura 80 Ultra', 'Pura 80 Pro', 'Pura 80', 'Pura 70 Ultra', 'Pura 70 Pro+', 'Pura 70 Pro', 'Pura 70',
    'P60 Pro', 'P60', 'P50 Pro', 'P50', 'P40 Pro+', 'P40 Pro', 'P40', 'P30 Pro', 'P30', 'P20 Pro', 'P20',
    'Mate 80 Pro+', 'Mate 80 Pro', 'Mate 80', 'Mate 70 Pro+', 'Mate 70 Pro', 'Mate 70', 'Mate 60 Pro+',
    'Mate 60 Pro', 'Mate 60', 'Mate 50 Pro', 'Mate 50', 'Mate 40 Pro', 'Mate 40', 'Mate 30 Pro', 'Mate 30',
    'Mate 20 Pro', 'Mate 20', 'Mate 10 Pro', 'Mate 10', 'Mate X6', 'Mate X5', 'Mate X3', 'Mate X2',
    'Mate Xs 2', 'Mate Xs', 'nova 14 Ultra', 'nova 14 Pro', 'nova 14', 'nova 13 Pro', 'nova 13',
    'nova 12 Pro', 'nova 12', 'nova 11 Pro', 'nova 11', 'nova 10 Pro', 'nova 10', 'nova 9', 'nova 8',
    'nova 7', 'nova 5T', 'nova 5', 'nova 3', 'nova 2i', 'nova Y90', 'nova Y70', 'Y9a', 'Y7a',
    'Y6p', 'Y5p', 'Y9 Prime (2019)',
  ],
  POCO: [
    'POCO F8', 'POCO F7 Ultra', 'POCO F7 Pro', 'POCO F6 Pro', 'POCO F6', 'POCO F5 Pro', 'POCO F5',
    'POCO F4 GT', 'POCO F4', 'POCO F3 GT', 'POCO F3', 'POCO F2 Pro', 'POCO F1', 'POCO X8', 'POCO X7',
    'POCO X6 Pro', 'POCO X6', 'POCO X5 Pro', 'POCO X5', 'POCO X4 GT', 'POCO X4 Pro 5G', 'POCO X3 GT',
    'POCO X3 Pro', 'POCO X3 NFC', 'POCO X2', 'POCO M8 5G', 'POCO M7 Pro 5G', 'POCO M7 5G',
    'POCO M6 Pro', 'POCO M6', 'POCO M5s', 'POCO M5', 'POCO M4 Pro 5G', 'POCO M4 Pro', 'POCO M4 5G',
    'POCO M3 Pro 5G', 'POCO M3', 'POCO M2 Pro', 'POCO M2', 'POCO C75', 'POCO C65', 'POCO C55',
    'POCO C51', 'POCO C50', 'POCO C40', 'POCO C31', 'POCO C3', 'POCO C71', 'POCO C61',
  ],
};

function archivePrice(brand, model) {
  const text = model.toLowerCase();
  const generationMatch = text.match(/\b(?:iphone|galaxy s|galaxy a|galaxy note|xiaomi|pura|mate\s*x|mate|nova|edge|razr)\s*(\d+)|\bp(\d+)|\bmoto\s*[ge](\d+)|\bpoco\s*[fxmc](\d+)/i) || [];
  const generation = Number(generationMatch.slice(1).find(Boolean)) || 0;
  let price = 4500;
  if (brand === 'Apple') {
    const gen = Number((text.match(/iphone\s*(\d+)/i) || [])[1]) || (/iphone air/.test(text) ? 17 : text.includes('se') ? 9 : 6);
    price = gen >= 18 ? 22999 : gen >= 17 ? 17999 : gen >= 16 ? 13999 : gen >= 15 ? 11999 : gen >= 14 ? 8999 : gen >= 13 ? 7499 : gen >= 12 ? 5999 : gen >= 11 ? 4999 : gen >= 10 ? 3999 : 2999;
    if (/pro max/.test(text)) price *= 1.35;
    else if (/pro|plus|air/.test(text)) price *= 1.18;
    if (/se/.test(text)) price *= .78;
  } else if (brand === 'Samsung') {
    if (/galaxy (s|note)/.test(text)) {
      const gen = Number((text.match(/galaxy (?:s|note)(\d+)/) || [])[1]) || 20;
      price = gen >= 26 ? 29999 : gen >= 25 ? 24999 : gen >= 24 ? 19999 : gen >= 23 ? 15999 : gen >= 22 ? 11999 : gen >= 21 ? 8999 : gen >= 20 ? 6999 : 4999;
      if (/ultra/.test(text)) price *= 1.3;
      else if (/\+/.test(text)) price *= 1.12;
    } else {
      const a = Number((text.match(/galaxy a(\d+)/) || [])[1]) || 20;
      price = a >= 50 ? 7999 : a >= 30 ? 5999 : a >= 20 ? 4499 : a >= 10 ? 3299 : 2799;
    }
  } else if (brand === 'Motorola') {
    const gen = generation || 5;
    if (/razr/.test(text)) price = gen >= 60 ? 22999 : gen >= 50 ? 16999 : gen >= 40 ? 11999 : 7999;
    else if (/edge/.test(text)) price = gen >= 70 ? 17999 : gen >= 60 ? 12999 : gen >= 50 ? 9999 : gen >= 40 ? 7999 : 6499;
    else price = gen >= 80 ? 6999 : gen >= 70 ? 5799 : gen >= 60 ? 4799 : gen >= 50 ? 3999 : gen >= 40 ? 3499 : 2799;
    if (/ultra|pro|\+/.test(text)) price *= 1.2;
  } else if (brand === 'POCO') {
    const series = text.match(/poco ([fxmc])(\d+)/);
    const tier = series?.[1] || 'm';
    const gen = Number(series?.[2]) || 5;
    if (tier === 'f') price = gen >= 8 ? 15999 : gen >= 7 ? 12999 : gen >= 6 ? 9999 : gen >= 5 ? 7999 : gen >= 4 ? 6999 : 4999;
    else if (tier === 'x') price = gen >= 8 ? 8999 : gen >= 7 ? 7999 : gen >= 6 ? 6999 : gen >= 5 ? 5799 : 4499;
    else if (tier === 'c') price = gen >= 8 ? 3999 : gen >= 7 ? 3299 : gen >= 6 ? 2799 : 2399;
    else price = gen >= 8 ? 5999 : gen >= 7 ? 4999 : gen >= 6 ? 4299 : gen >= 5 ? 3799 : 2999;
    if (/ultra|pro/.test(text)) price *= 1.15;
  } else if (brand === 'Xiaomi') {
    const note = Number((text.match(/note\s*(\d+)/) || [])[1]) || 0;
    const xiaomi = Number((text.match(/xiaomi\s*(\d+)/) || [])[1]) || 0;
    const redmi = Number((text.match(/redmi\s*(\d+)/) || [])[1]) || 0;
    price = note ? (note >= 14 ? 6999 : note >= 12 ? 5499 : note >= 10 ? 4499 : 3299)
      : xiaomi ? (xiaomi >= 17 ? 22999 : xiaomi >= 15 ? 19999 : xiaomi >= 14 ? 16999 : xiaomi >= 13 ? 13999 : xiaomi >= 12 ? 10999 : 7999)
        : redmi ? (redmi >= 14 ? 3999 : redmi >= 12 ? 3299 : redmi >= 10 ? 2799 : 2299) : (/fold|flip/.test(text) ? 19999 : /civi/.test(text) ? 9999 : 6999);
    if (/pro\+|ultra/.test(text)) price *= 1.25;
    else if (/pro/.test(text)) price *= 1.12;
  } else if (brand === 'HUAWEI') {
    const gen = generation || 10;
    if (/mate x/.test(text)) price = gen >= 6 ? 24999 : gen >= 5 ? 19999 : 12999;
    else if (/pura/.test(text)) price = gen >= 80 ? 22999 : 17999;
    else if (/mate/.test(text)) price = gen >= 70 ? 19999 : gen >= 60 ? 15999 : gen >= 50 ? 11999 : gen >= 40 ? 8999 : 5999;
    else if (/^p\d/.test(text)) price = gen >= 60 ? 12999 : gen >= 50 ? 9999 : gen >= 40 ? 7499 : gen >= 30 ? 5999 : 3999;
    else if (/nova/.test(text)) price = gen >= 14 ? 8999 : gen >= 12 ? 7499 : gen >= 10 ? 5999 : 4499;
    else price = 3299;
    if (/ultra|pro\+/.test(text)) price *= 1.2;
  }
  return Math.min(39999, Math.round(price / 100) * 100);
}

function addHistoricalPhones() {
  const phones = MOBILE_CATALOG.phone;
  for (const [brand, models] of Object.entries(PHONE_ARCHIVE)) {
    const hasModel = model => phones.some(item => item.brand === brand && item.big.toLowerCase() === model.toLowerCase());
    let count = new Set(phones.filter(item => item.brand === brand).map(item => item.big.toLowerCase())).size;
    for (const model of models) {
      if (count >= 50) break;
      if (hasModel(model)) continue;
      const huawei = brand === 'HUAWEI';
      const apple = brand === 'Apple';
      const name = model.toLowerCase();
      const premium = /ultra|pro|\+|edge|razr|fold|flip|pura|mate|^xiaomi|^iphone (1[2-9]|[2-9]\d)/i.test(model)
        || (brand === 'Samsung' && /galaxy (s|note)/i.test(model))
        || (brand === 'POCO' && /\b[fx]\d/.test(name));
      const uses = premium ? ['basic', 'work', 'create', 'gaming'] : ['basic', 'work'];
      const priorities = ['everyday', 'work'];
      if (apple || /ultra|pro|pura|mate|edge|razr|fold|flip|^xiaomi/i.test(model)
        || (brand === 'Samsung' && /galaxy (s|note)/i.test(model))) priorities.push('camera');
      if (brand === 'Samsung' && /galaxy s/i.test(model)) priorities.push('gaming');
      if (brand === 'POCO' && /\b[fx]\d/.test(name)) priorities.push('gaming');
      const search = slug(`${brand} ${model} reacondicionado`);
      phones.push({
        brand,
        big: model,
        detail: huawei
          ? 'Modelo anterior o reacondicionado. Confirma servicios de Google, aplicaciones, estado de batería, desbloqueo y garantía.'
          : apple
            ? 'Modelo anterior o reacondicionado. Confirma compatibilidad con tus aplicaciones, batería, desbloqueo y garantía.'
            : 'Modelo anterior o reacondicionado. Confirma la variante, el estado de batería, el desbloqueo y la garantía.',
        price: archivePrice(brand, model),
        category: 'Catálogo histórico · revisa la oferta',
        uses,
        priorities,
        screen: 'unknown',
        storage: 'unknown',
        system: huawei ? 'harmony' : apple ? 'ios' : 'android',
        source: `https://listado.mercadolibre.com.mx/${search}`,
        sourceLabel: 'Buscar ofertas',
      });
      count += 1;
    }
  }
}

addHistoricalPhones();

const CATALOG = { laptop: LAPTOPS };

/* =====================================================================
   3. OPCIONES DEL ASISTENTE
   ===================================================================== */
const OPTIONS = {
  device: [
    { id: 'pc', icon: '🛠️', label: 'Computadora de escritorio', hint: 'Ofrece buen rendimiento por el precio y permite cambiar piezas con facilidad.' },
    { id: 'laptop', icon: '💻', label: 'Laptop', hint: 'Llévala a clases o al trabajo. Revisa su peso, batería y memoria ampliable.' },
    { id: 'tablet', icon: '📱', label: 'Tableta', hint: 'Ligera para leer, tomar apuntes, dibujar o ver contenido.' },
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
    { id: 'work', icon: '💻', label: 'Trabajar o estudiar', hint: 'Tareas, clases y oficina' },
    { id: 'basic', icon: '🌐', label: 'Uso básico', hint: 'Internet, videos y chats' },
    { id: 'create', icon: '🎨', label: 'Diseño y video', hint: 'Fotos, edición y animación' },
    { id: 'code', icon: '👨‍💻', label: 'Programar', hint: 'Código y proyectos' },
    { id: 'kids', icon: '🧒', label: 'Niños y familia', hint: 'Dibujos, juegos suaves y tareas' },
  ],
  budget: [
    { id: 'eco', icon: '🪙', label: 'Económico', hint: 'Piezas con 8 GB de RAM para reducir el costo' },
    { id: 'mid', icon: '⚖️', label: 'Intermedio', hint: 'Buen equilibrio' },
    { id: 'high', icon: '🚀', label: 'Alto', hint: 'Más opciones para tareas exigentes' },
  ],
};

// Rangos de la barra de presupuesto por tipo de equipo (cut = cortes entre niveles)
const RANGE = {
  pc: { min: 8000, max: 40000, cut: [12000, 22000], val: { eco: 10000, mid: 17000, high: 30000 } },
  laptop: { min: 9500, max: 80000, cut: [18000, 35000], val: { eco: 13000, mid: 26000, high: 55000 } },
  tablet: { min: 2800, max: 30000, cut: [8000, 15000], val: { eco: 7500, mid: 15000, high: 22000 } },
  phone: { min: 2500, max: 40000, cut: [6500, 15000], val: { eco: 6500, mid: 12000, high: 25000 } },
};
const BUDGET_HINT = {
  pc: 'Este monto solo suma procesador, gráficos, RAM y SSD. Faltan tarjeta madre, gabinete, fuente, pantalla, teclado, ratón, sistema operativo y armado. Comprueba la compatibilidad antes de comprar.',
  laptop: 'Tope para laptops completas. El precio depende de la marca y la configuración; confirma que incluya las características que necesitas.',
  tablet: 'Tope para una tableta. Comprueba si el lápiz, el teclado o la conexión móvil se venden por separado.',
  phone: 'Desde $2,500 para Android. Hay iPhone reacondicionados desde $3,999. Comprueba batería, desbloqueo, garantía y compatibilidad con tu compañía.',
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
      { id: 'standard', label: 'Pantalla estándar, cerca de 6 pulgadas', icon: '📱' },
      { id: 'large', label: 'Pantalla grande para videos y lectura', icon: '📺' },
      { id: 'any', label: 'No tengo preferencia', icon: '✨' },
    ]},
    { id: 'storage', title: '¿Cuánto espacio necesitas?', options: [
      { id: 'normal', label: 'Uso normal; guardo pocas fotos', icon: '📁' },
      { id: 'lots', label: 'Muchas fotos, videos o aplicaciones', icon: '🗂️' },
    ]},
    { id: 'system', title: '¿Qué sistema prefieres?', options: [
      { id: 'android', label: 'Android', icon: '🤖' },
      { id: 'harmony', label: 'HUAWEI (EMUI o HarmonyOS)', icon: '🔷' },
      { id: 'ios', label: 'Apple (iOS)', icon: '🍎' },
      { id: 'any', label: 'Me da igual', icon: '✨' },
    ]},
  ],
};

// Usos nuevos que reutilizan el catálogo de PC de un uso con necesidades parecidas
const POOL = { create: 'gaming', code: 'work', kids: 'basic' };

const PC_NOTE = 'El total suma procesador, tarjeta de video, memoria RAM y almacenamiento. No incluye tarjeta madre, gabinete, fuente de poder, monitor, teclado, ratón, sistema operativo ni armado. Los precios son aproximados.';
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
const shuffle = items => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
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
function pickBuild(use, budget, maxAmount) {
  const u = POOL[use] || use;
  const tiers = budget === 'high' ? ['high', 'mid', 'eco'] : budget === 'mid' ? ['mid', 'eco'] : ['eco'];
  for (const tier of tiers) {
    const cpus = DB.cpu.filter(p => fits(p, tier, u));
    const gpus = DB.gpu.filter(p => fits(p, tier, u));
    const rams = DB.ram.filter(p => fitsRam(p, tier, u));
    const ssds = DB.ssd.filter(p => fits(p, tier, u));
    const builds = [];
    for (const cpu of cpus) for (const gpu of gpus) {
      if (!cpu.igpu && gpu.integrated) continue;
      for (const ram of rams) {
        if (ram.type !== cpu.ram) continue;
        for (const ssd of ssds) {
          const build = { cpu, gpu, ram, ssd };
          if (totalOf(build) <= maxAmount) builds.push(build);
        }
      }
    }
    if (builds.length) return pick(builds);
  }
  return null;
}

function recommend(use, budget, maxAmount, lastKey = '') {
  let build = null;
  try {
    for (let i = 0; i < 8; i++) {          // evita repetir la misma combinación seguida
      const next = pickBuild(use, budget, maxAmount);
      if (!next) break;
      build = next;
      if (keyOf(next) !== lastKey) break;
    }
  } catch (err) {
    console.error(err);
    build = null;
  }
  if (build) return { ...build, fallback: false };
  const safeFallback = (POOL[use] || use) === 'gaming' ? FALLBACK_ECO_GAMING : FALLBACK_ECO;
  return totalOf(safeFallback) <= maxAmount ? { ...safeFallback, fallback: true } : null;
}

// En laptops el monto es un tope. Si hace falta, se relaja el perfil o el nivel,
// pero nunca se devuelve un modelo que cueste más que el monto elegido.
function recommendList(device, use, budget, profile, maxAmount, lastKey = '') {
  const src = CATALOG[device];
  const tiers = budget === 'high' ? ['high', 'mid', 'eco'] : budget === 'mid' ? ['mid', 'eco'] : ['eco'];
  let pool = [];
  const matchesTier = (p, tier) => p.price <= maxAmount && p.t.includes(tier) && (tier !== 'eco' || hasEcoLaptopRam(p));
  for (const matchProfile of [true, false]) {
    for (const tier of tiers) {
      pool = src.filter(p => matchesTier(p, tier) && p.u.includes(use) && (!matchProfile || p.p.includes(profile)));
      if (pool.length) break;
    }
    if (pool.length) break;
  }
  if (!pool.length) return { items: [], fallback: false };
  let items = [];
  for (let i = 0; i < 6; i++) {
    const mix = shuffle(pool);
    items = [];
    mix.forEach(p => { if (items.length < 3 && !items.some(o => o.brand === p.brand)) items.push(p); });
    mix.forEach(p => { if (items.length < 3 && !items.includes(p)) items.push(p); });
    if (keyList(items) !== lastKey) break;
  }
  return { items, fallback: false };
}

function scoreMobile(item, device, amount) {
  const answer = state.mobile;
  let score = item.uses.includes(state.use) ? 100 : 0;
  if (device === 'tablet') {
    if (answer.screen !== 'any' && item.screen === answer.screen) score += 12;
    if (answer.accessory === 'pen' && item.pen) score += 20;
    if (answer.accessory === 'keyboard' && item.keyboard) score += 20;
    if (answer.accessory === 'both' && item.pen && item.keyboard) score += 24;
    if (answer.accessory === 'none' && !item.pen && !item.keyboard) score += 4;
    if (answer.system !== 'any' && item.system === answer.system) score += 20;
  } else {
    if (answer.priority && item.priorities.includes(answer.priority)) score += 100;
    if (answer.screen !== 'any' && item.screen === answer.screen) score += 12;
    if (answer.storage && item.storage !== 'unknown' && item.storage === answer.storage) score += 12;
    if (answer.system !== 'any' && item.system === answer.system) score += 20;
  }
  // El presupuesto es un máximo. Para teléfonos, damos más peso a opciones
  // que se acerquen al monto sin superarlo; en tabletas pesan más los accesorios.
  const budgetWeight = device === 'phone' ? 110 : 40;
  return score + (amount > 0 ? budgetWeight * Math.min(item.price / amount, 1) : 0);
}

function recommendMobile(device, amount) {
  const catalog = MOBILE_CATALOG[device];
  const answer = state.mobile;
  const preferredSystem = answer.system || 'any';
  // Si la persona elige un sistema, nunca se muestran equipos de otro sistema.
  const compatible = preferredSystem === 'any'
    ? catalog
    : catalog.filter(item => item.system === preferredSystem);
  const hasRequiredAccessory = item => device !== 'tablet' || answer.accessory === 'none'
    || (answer.accessory === 'pen' && item.pen)
    || (answer.accessory === 'keyboard' && item.keyboard)
    || (answer.accessory === 'both' && item.pen && item.keyboard);
  const affordable = compatible.filter(item => item.price <= amount && hasRequiredAccessory(item));
  const ranked = affordable.map(item => ({ item, score: scoreMobile(item, device, amount) }))
    .sort((a, b) => b.score - a.score || b.item.price - a.item.price);
  return { items: ranked.map(x => x.item) };
}

function mobileReason(item, device) {
  const answer = state.mobile;
  const reasons = [];
  if (item.uses.includes(state.use)) reasons.push('Se ajusta al uso que elegiste');
  if (device === 'tablet') {
    if (answer.screen !== 'any' && item.screen !== 'unknown' && item.screen === answer.screen) reasons.push('Coincide con el tamaño de pantalla que prefieres');
    if (answer.accessory === 'pen' && item.pen) reasons.push('Es compatible con lápiz');
    if (answer.accessory === 'keyboard' && item.keyboard) reasons.push('Es compatible con teclado');
    if (answer.accessory === 'both' && item.pen && item.keyboard) reasons.push('Admite lápiz y teclado');
  } else {
    if (answer.priority && item.priorities.includes(answer.priority)) reasons.push('Coincide con tu prioridad');
    if (answer.screen !== 'any' && item.screen !== 'unknown' && item.screen === answer.screen) reasons.push('Coincide con el tamaño que prefieres');
    if (answer.storage && item.storage !== 'unknown' && item.storage === answer.storage) reasons.push(answer.storage === 'lots' ? 'Tiene más espacio para tus archivos' : 'Adecuado para uso y almacenamiento normales');
  }
  const systemName = answer.system === 'ios'
    ? (device === 'tablet' ? 'iPadOS' : 'iOS')
    : answer.system === 'harmony' ? (device === 'phone' ? 'HUAWEI (EMUI o HarmonyOS)' : 'HarmonyOS') : 'Android';
  if (answer.system !== 'any' && item.system === answer.system) reasons.push(`Usa ${systemName}, como prefieres`);
  return reasons.slice(0, 2).join(' · ') || 'Una alternativa dentro del monto seleccionado';
}

/* =====================================================================
   7. ESTADO Y VISTAS
   ===================================================================== */
const state = {
  device: null, profile: null, field: null, auto: false, use: null, budget: null,
  mobile: {}, mobileRanked: [], mobileIndex: -1,
  last: '', timer: null, build: null,
};
const APP_HISTORY_ID = 'recomendador-equipos';
const APP_VIEWS = new Set(['welcome', 'device', 'mobile-questions', 'profile', 'field', 'use', 'budget', 'loading', 'results']);
let appHistoryFlow = createAppHistoryFlow();
let activeAppView = 'welcome';
function createAppHistoryFlow() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function appHistoryEntry(view, guard = false) {
  return { appId: APP_HISTORY_ID, flow: appHistoryFlow, view, guard };
}
function isAppHistoryEntry(entry) {
  return entry?.appId === APP_HISTORY_ID && entry.flow === appHistoryFlow && APP_VIEWS.has(entry.view);
}
function startAppHistoryFlow(view = 'welcome') {
  appHistoryFlow = createAppHistoryFlow();
  activeAppView = view;
  try {
    window.history.replaceState(appHistoryEntry(view), '', window.location.href);
    window.history.pushState(appHistoryEntry(view, true), '', window.location.href);
  } catch (e) { /* historial no disponible */ }
}
function navigateBack(fallbackView) {
  const entry = window.history.state;
  if (activeAppView !== 'welcome' && isAppHistoryEntry(entry) && entry.view === activeAppView) {
    window.history.back();
    return;
  }
  if (fallbackView) show(fallbackView);
}
const needsField = () => state.profile === 'student' || state.profile === 'work';
const isMobileDevice = () => state.device === 'tablet' || state.device === 'phone';
function clearMobileRecommendations() {
  state.mobileRanked = [];
  state.mobileIndex = -1;
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

const hasTouchNavigation = () => window.matchMedia?.('(any-pointer: coarse)').matches || 'ontouchstart' in window;

function show(name, options = {}) {
  if (options.fromHistory) {
    activeAppView = name;
  } else if (name !== activeAppView) {
    activeAppView = name;
    try { window.history.pushState(appHistoryEntry(name), '', window.location.href); }
    catch (e) { /* historial no disponible */ }
  }
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
  const swipeHelp = $('#swipe-help');
  if (swipeHelp) swipeHelp.hidden = !hasTouchNavigation() || name === 'welcome' || name === 'loading';
  window.scrollTo({ top: 0 });
}

window.addEventListener('popstate', event => {
  clearTimeout(state.timer);
  if (!isAppHistoryEntry(event.state)) {
    // Si no queda un paso anterior del asistente, conserva al usuario en el sitio.
    try { window.history.pushState(appHistoryEntry(activeAppView, true), '', window.location.href); } catch (e) { /* historial no disponible */ }
    return;
  }
  show(event.state.view, { fromHistory: true });
  // Mantén una entrada de inicio dentro del sitio para que Atrás no cierre la página.
  if (event.state.view === 'welcome' && !event.state.guard) {
    try { window.history.pushState(appHistoryEntry('welcome', true), '', window.location.href); } catch (e) { /* historial no disponible */ }
  }
});

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
    ? OPTIONS.budget.map(o => ({ ...o, hint: o.id === 'eco' ? (state.device === 'phone' ? 'Desde $2,500; iPhone reacondicionados desde $3,999' : 'Para presupuestos ajustados') : o.id === 'mid' ? 'Buen equilibrio entre precio y funciones' : 'Más opciones de rendimiento y espacio' }))
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
    device: null, profile: null, field: null, auto: false, use: null, budget: null, mobile: {}, mobileRanked: [], mobileIndex: -1, last: '', build: null,
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
  startAppHistoryFlow('welcome');
  show('welcome');
}

function analyze() {
  if (!state.use || !state.budget) return;
  show('loading');
  clearTimeout(state.timer);
  state.timer = setTimeout(() => showResults(false), 1500 + Math.random() * 500);
}

function showEmptyResults(title, summary, detail) {
  state.build = null;
  state.last = '';
  $('#result-title').textContent = title;
  $('#summary').textContent = summary;
  $('#cards').classList.remove('three');
  $('#cards').classList.add('mobile-single');
  $('#cards').innerHTML = `<article class="card empty-card"><span class="part-icon" aria-hidden="true">🔎</span><h3>Qué puedes hacer</h3><p class="detail">${detail}</p></article>`;
  $('#total-line').hidden = true;
  $('#note').textContent = 'Las recomendaciones son orientativas. Revisa las especificaciones y el precio actual antes de comprar.';
  const otherButton = $('[data-action="other"]');
  otherButton.disabled = true;
  otherButton.textContent = 'No hay más opciones';
  show('results');
}

function showResults(reroll) {
  const titles = { pc: 'Tu computadora de escritorio', laptop: 'Tu laptop', tablet: 'La tableta que mejor encaja contigo', phone: 'El teléfono que mejor encaja contigo' };
  $('#result-title').textContent = titles[dev()];
  const otherButton = $('[data-action="other"]');
  otherButton.disabled = false;
  otherButton.textContent = 'Ver otra opción';
  if (isMobileDevice()) return showMobileList(reroll);
  if (state.device === 'laptop') return showList(reroll);
  const amount = Number($('#budget-range').value);
  state.build = recommend(state.use, tierOf(amount), amount, reroll ? state.last : '');
  if (!state.build) {
    return showEmptyResults('No hay una combinación dentro del tope', `No encontramos componentes para ${labelOf('use', state.use)} por ${mxn.format(amount)} o menos.`, 'Aumenta el presupuesto o vuelve a tus respuestas para elegir otro uso. No mostraremos una combinación que supere el monto seleccionado.');
  }
  state.last = keyOf(state.build);
  paint(state.build);
  show('results');
}

function showMobileList(reroll) {
  const d = state.device;
  const amount = Number($('#budget-range').value);
  const label = d === 'tablet' ? 'tableta' : 'teléfono';
  const article = d === 'tablet' ? 'una' : 'un';
  const systemName = state.mobile.system === 'any' ? 'sin preferencia'
    : state.mobile.system === 'ios' ? (d === 'tablet' ? 'iPadOS' : 'iOS')
      : state.mobile.system === 'harmony' ? (d === 'phone' ? 'HUAWEI (EMUI o HarmonyOS)' : 'HarmonyOS') : 'Android';
  if (!reroll || !state.mobileRanked.length) {
    const r = recommendMobile(d, amount);
    state.mobileRanked = r.items;
    state.mobileIndex = 0;
  } else if (state.mobileIndex < state.mobileRanked.length - 1) {
    state.mobileIndex += 1;
  }
  const p = state.mobileRanked[state.mobileIndex];
  state.build = null;
  if (!p) {
    state.last = '';
    const systemPreference = state.mobile.system === 'any' ? '' : ` con ${systemName}`;
    const accessoryLabel = d !== 'tablet' || state.mobile.accessory === 'none' ? ''
      : state.mobile.accessory === 'pen' ? 'compatible con lápiz'
        : state.mobile.accessory === 'keyboard' ? 'compatible con teclado' : 'compatible con lápiz y teclado';
    const accessoryPreference = accessoryLabel ? `${systemPreference ? ' y ' : ' '}${accessoryLabel}` : '';
    return showEmptyResults(
      'No hay opciones dentro del presupuesto',
      `No encontramos ${article} ${label}${systemPreference}${accessoryPreference} que se ajuste a tus respuestas y cueste ${mxn.format(amount)} o menos.`,
      'Aumenta el monto o cambia tus preferencias. No mostraremos un equipo incompatible ni uno que supere el límite elegido.'
    );
  }
  state.last = `${p.brand}|${p.big}`;
  const focus = d === 'tablet'
    ? `tu preferencia de uso, pantalla ${state.mobile.screen === 'compact' ? 'compacta' : state.mobile.screen === 'large' ? 'grande' : 'mediana'} y sistema ${systemName}`
    : `tu prioridad de ${MOBILE_QUESTIONS.phone[0].options.find(o => o.id === state.mobile.priority)?.label.toLowerCase()}, pantalla ${state.mobile.screen === 'standard' ? 'estándar' : 'grande'}, almacenamiento y sistema ${systemName}`;
  $('#summary').textContent = `Opción ${state.mobileIndex + 1} de ${state.mobileRanked.length}, elegida según ${focus}. Precio aproximado: ${mxn.format(p.price)}. Está dentro del máximo de ${mxn.format(amount)}; las alternativas también se acercan al monto sin superarlo.`;
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
      <a class="ml" href="${p.source}" target="_blank" rel="noopener noreferrer">${p.sourceLabel || 'Ver ficha oficial'}</a>
    </article>`;
  const otherButton = $('[data-action="other"]');
  const allShown = state.mobileIndex >= state.mobileRanked.length - 1;
  otherButton.disabled = allShown;
  otherButton.textContent = allShown ? 'Ya viste todas las opciones' : 'Ver otra opción';
  $('#total-line').hidden = true;
  $('#note').textContent = 'Precios de referencia en MXN; pueden cambiar por tienda, promoción, configuración y estado del equipo. Las opciones históricas pueden ser reacondicionadas. Confirma variante, batería, desbloqueo, garantía y compatibilidad con tus aplicaciones. En las tabletas, el lápiz o teclado pueden venderse por separado.';
  show('results');
}

function paint(build) {
  const amount = Number($('#budget-range').value);
  $('#summary').textContent = build.fallback
    ? `No encontré una combinación exacta para ${selectionFocus()}. Esta opción de referencia cuesta ${mxn.format(totalOf(build))} y está dentro del máximo de ${mxn.format(amount)}.`
    : `Una opción para ${selectionFocus()} dentro del máximo de ${mxn.format(amount)}. El subtotal de las piezas mostradas es ${mxn.format(totalOf(build))}.`;

  $('#cards').classList.remove('three', 'mobile-single');
  $('#cards').innerHTML = PARTS.map(([k, icon, name, help]) => {
    const p = build[k];
    const link = p.price
      ? `<a class="ml" href="https://listado.mercadolibre.com.mx/${slug(`${p.brand} ${p.big} ${p.detail}`)}" target="_blank" rel="noopener noreferrer">Buscar precio en Mercado Libre</a>`
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
  const amount = Number($('#budget-range').value);
  const r = recommendList(d, state.use, tierOf(amount), state.profile, amount, reroll ? state.last : '');
  if (!r.items.length) {
    const lowest = LAPTOPS.filter(item => item.u.includes(state.use)).sort((a, b) => a.price - b.price)[0];
    const detail = lowest
      ? `La opción de menor precio que aparece en esta guía para ese uso cuesta ${mxn.format(lowest.price)} aproximadamente. Ajusta el monto o cambia tus respuestas para ver alternativas.`
      : 'Aumenta el monto o vuelve a tus respuestas para elegir otro uso.';
    return showEmptyResults(
      'No hay laptops dentro del tope',
      `No encontramos una laptop para ${labelOf('use', state.use)} por ${mxn.format(amount)} o menos.`,
      detail
    );
  }
  state.last = keyList(r.items);
  state.build = null;
  $('#summary').textContent = `Opciones para ${selectionFocus()} dentro del máximo de ${mxn.format(amount)}. Los precios son aproximados.`;
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
      <a class="ml" href="https://listado.mercadolibre.com.mx/${slug(`${p.brand} ${p.big}`)}" target="_blank" rel="noopener noreferrer">Buscar precio en Mercado Libre</a>
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
  const maxAmount = Number($('#budget-range').value);
  const list = DB[part].filter(p => p !== b[part] && (part === 'ram' ? fitsRam(p, state.budget, use) : fits(p, state.budget, use))
    && (part !== 'ram' || p.type === b.cpu.ram)
    && (part !== 'gpu' || b.cpu.igpu || !p.integrated)
    && totalOf({ ...b, [part]: p }) <= maxAmount);
  if (!list.length) { btn.textContent = 'No hay otra opción dentro del presupuesto'; btn.disabled = true; return; }
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
  $('#theme-color')?.setAttribute('content', light ? '#f4f1f9' : '#0f0a1a');
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
  'back-device': () => navigateBack('welcome'),
  'next-device': () => {
    if (!state.device) return;
    if (isMobileDevice()) { renderMobileQuestions(); show('mobile-questions'); }
    else show('profile');
  },
  'back-mobile': () => navigateBack('device'),
  'next-mobile': () => {
    if (!isMobileDevice()) return;
    if (state.device === 'tablet') state.use = state.mobile.main;
    else state.use = ({ camera: 'create', battery: 'basic', gaming: 'gaming', work: 'work', everyday: 'basic' })[state.mobile.priority];
    show('budget');
  },
  'back-profile': () => navigateBack('device'),
  'next-profile': () => {
    if (!state.profile) return;
    if (needsField()) { renderField(); show('field'); } else show('use');
  },
  'back-field': () => navigateBack('profile'),
  'next-field': () => { if (state.field) { suggestUse(); show('use'); } },
  'back-use': () => navigateBack(needsField() ? 'field' : 'profile'),
  'next-use': () => { if (state.use) show('budget'); },
  'back-budget': () => navigateBack(isMobileDevice() ? 'mobile-questions' : 'use'),
  'back-results': () => navigateBack('budget'),
  'next-budget': analyze,
  other: () => showResults(true),
  swap: (b) => swap(b.dataset.part, b),
};

// Un deslizamiento a la derecha vuelve un paso y conserva las respuestas.
const swipeBackActions = {
  device: 'back-device',
  'mobile-questions': 'back-mobile',
  profile: 'back-profile',
  field: 'back-field',
  use: 'back-use',
  budget: 'back-budget',
};
let swipeOrigin = null;
document.addEventListener('touchstart', e => {
  if (!hasTouchNavigation() || e.touches.length !== 1) { swipeOrigin = null; return; }
  const target = e.target;
  if (target.closest('button, a, input, textarea, select, [contenteditable="true"], .range, .field-list')) { swipeOrigin = null; return; }
  const touch = e.touches[0];
  if (touch.clientX < 20 || touch.clientX > window.innerWidth - 20) { swipeOrigin = null; return; }
  swipeOrigin = { x: touch.clientX, y: touch.clientY, time: Date.now() };
}, { passive: true });

document.addEventListener('touchend', e => {
  if (!swipeOrigin || e.changedTouches.length !== 1) { swipeOrigin = null; return; }
  const start = swipeOrigin;
  swipeOrigin = null;
  const touch = e.changedTouches[0];
  const dx = touch.clientX - start.x;
  const dy = touch.clientY - start.y;
  if (dx < 75 || Math.abs(dy) > 80 || dx < Math.abs(dy) * 1.25 || Date.now() - start.time > 1000) return;

  const view = $('.view.active')?.dataset.view;
  if (view === 'results') { $('[data-action="back-results"]')?.click(); return; }
  const actionName = swipeBackActions[view];
  if (actionName) $(`[data-action="${actionName}"]`)?.click();
}, { passive: true });
document.addEventListener('touchcancel', () => { swipeOrigin = null; }, { passive: true });

// Bloquea la copia de texto en teléfonos y computadoras.
document.addEventListener('contextmenu', e => {
  const target = e.target instanceof Element ? e.target : e.target.parentElement;
  if (target?.closest('a, input, textarea, select, [contenteditable="true"]')) return;
  e.preventDefault();
});
document.addEventListener('copy', e => e.preventDefault());

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
  startAppHistoryFlow('welcome');
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
